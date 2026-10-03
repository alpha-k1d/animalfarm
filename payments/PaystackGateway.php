<?php
// payments/PaystackGateway.php - Server-Side Paystack Payment Gateway

require_once __DIR__ . '/PaymentGatewayInterface.php';
require_once __DIR__ . '/../includes/functions.php';

class PaystackGateway implements PaymentGatewayInterface
{
    private PDO $pdo;
    private array $gatewayConfig;
    private bool $isEnabled;
    private string $mode;
    private string $publicKey;
    private string $secretKey;
    private string $webhookSecret;
    private string $currency;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $stmt = $this->pdo->prepare("SELECT * FROM payment_gateways WHERE code = 'paystack'");
        $stmt->execute();
        $row = $stmt->fetch();

        $this->isEnabled = (bool)($row['is_enabled'] ?? false);
        $this->mode = $row['mode'] ?? 'test';
        $config = json_decode($row['config'] ?? '{}', true) ?: [];

        $this->gatewayConfig = $config;
        $this->publicKey = $config['public_key'] ?? '';
        $this->secretKey = $config['secret_key'] ?? '';
        $this->webhookSecret = $config['webhook_secret'] ?? '';
        $this->currency = $config['currency'] ?? 'GHS';
    }

    public function isEnabled(): bool
    {
        return $this->isEnabled;
    }

    public function getPublicKey(): string
    {
        return $this->publicKey;
    }

    public function initialize(int $userId, float $amount, string $reference): array
    {
        $stmt = $this->pdo->prepare("SELECT email, full_name, phone FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            return ['success' => false, 'error' => 'User account not found.'];
        }

        // Amount in pesewas (e.g. GH₵10.00 = 1000 pesewas)
        $amountPesewas = (int)round($amount * 100);
        $callbackUrl = BASE_URL . '/payments/paystack_callback.php?ref=' . urlencode($reference);

        // Check if demo/simulated test keys are active
        if (empty($this->secretKey) || str_contains($this->secretKey, 'sample_afghana_demo')) {
            // Local simulated sandbox checkout for developer testing without live bank keys
            $sandboxUrl = BASE_URL . '/payments/paystack_callback.php?ref=' . urlencode($reference) . '&simulated=1';
            return [
                'success' => true,
                'redirect_url' => $sandboxUrl,
                'reference' => $reference,
                'gateway_reference' => 'PSTK-SIM-' . time(),
                'simulated' => true
            ];
        }

        $fields = [
            'email' => $user['email'],
            'amount' => $amountPesewas,
            'currency' => $this->currency,
            'reference' => $reference,
            'callback_url' => $callbackUrl,
            'metadata' => [
                'user_id' => $userId,
                'full_name' => $user['full_name'],
                'phone' => $user['phone'],
                'custom_fields' => [
                    [
                        'display_name' => 'Platform',
                        'variable_name' => 'platform',
                        'value' => 'Animal Farm Ghana'
                    ]
                ]
            ]
        ];

        $ch = curl_init('https://api.paystack.co/transaction/initialize');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($fields),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 25,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->secretKey,
                'Content-Type: application/json',
                'Cache-Control: no-cache'
            ]
        ]);

        $response = curl_exec($ch);
        $error = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($error) {
            return ['success' => false, 'error' => 'Paystack communication error: ' . $error];
        }

        $result = json_decode($response, true);

        if (!empty($result['status']) && !empty($result['data']['authorization_url'])) {
            return [
                'success' => true,
                'redirect_url' => $result['data']['authorization_url'],
                'access_code' => $result['data']['access_code'],
                'reference' => $reference,
                'gateway_reference' => $result['data']['reference'] ?? $reference,
                'simulated' => false
            ];
        }

        return [
            'success' => false,
            'error' => $result['message'] ?? 'Failed to initialize transaction with Paystack.'
        ];
    }

    public function verify(string $reference): array
    {
        // Handle simulated sandbox test verification
        if (str_contains($this->secretKey, 'sample_afghana_demo') || empty($this->secretKey)) {
            $stmt = $this->pdo->prepare("SELECT * FROM payment_transactions WHERE reference = ?");
            $stmt->execute([$reference]);
            $txn = $stmt->fetch();

            if ($txn) {
                return [
                    'success' => true,
                    'paid' => true,
                    'amount_ghs' => (float)$txn['amount_ghs'],
                    'currency' => 'GHS',
                    'gateway_reference' => 'PSTK-SIM-' . time(),
                    'data' => ['status' => 'success', 'channel' => 'mobile_money', 'simulated' => true],
                    'error' => null
                ];
            }
        }

        $url = 'https://api.paystack.co/transaction/verify/' . rawurlencode($reference);
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 25,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->secretKey,
                'Cache-Control: no-cache'
            ]
        ]);

        $response = curl_exec($ch);
        $error = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($error) {
            return [
                'success' => false,
                'paid' => false,
                'error' => 'cURL verification error: ' . $error
            ];
        }

        $result = json_decode($response, true);

        if (!empty($result['status']) && isset($result['data'])) {
            $data = $result['data'];
            $isPaid = ($data['status'] === 'success');
            $amountGhs = ((float)($data['amount'] ?? 0)) / 100;
            $currency = $data['currency'] ?? 'GHS';

            return [
                'success' => true,
                'paid' => $isPaid,
                'amount_ghs' => $amountGhs,
                'currency' => $currency,
                'gateway_reference' => $data['reference'] ?? '',
                'data' => $data,
                'error' => $isPaid ? null : "Paystack transaction status: " . ($data['status'] ?? 'unknown')
            ];
        }

        return [
            'success' => false,
            'paid' => false,
            'error' => $result['message'] ?? 'Could not verify transaction with Paystack.'
        ];
    }

    public function getStatus(string $reference): array
    {
        return $this->verify($reference);
    }
}
