<?php
// sms/providers/GenericSmsProvider.php - Generic SMS Gateway Implementation

require_once __DIR__ . '/../SmsProviderInterface.php';
require_once __DIR__ . '/../../includes/functions.php';

class GenericSmsProvider implements SmsProviderInterface
{
    private string $apiUrl;
    private string $apiKey;
    private string $apiSecret;
    private string $senderId;
    private bool $simulationMode;

    public function __construct()
    {
        $this->apiUrl = get_setting('sms_api_url', 'https://api.smsghana.example/v1/send');
        $this->apiKey = get_setting('sms_api_key', '');
        $this->apiSecret = get_setting('sms_api_secret', '');
        $this->senderId = get_setting('sms_sender_id', 'FarmGhana');
        $this->simulationMode = (get_setting('sms_simulation_mode', '1') === '1') || empty($this->apiKey);
    }

    public function sendSms(string $phone, string $message): array
    {
        $recipient = format_international_phone($phone);

        // If simulation mode or unconfigured credentials, simulate SMS delivery
        if ($this->simulationMode) {
            // Save simulated SMS in session for test visibility
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $_SESSION['last_simulated_sms'] = [
                'phone' => $phone,
                'recipient' => $recipient,
                'message' => $message,
                'timestamp' => date('Y-m-d H:i:s')
            ];

            error_log("[SMS SIMULATION] To: {$recipient} | Msg: {$message}");

            return [
                'success' => true,
                'message_id' => 'SIM-' . time() . '-' . random_int(1000, 9999),
                'error' => null,
                'simulated' => true
            ];
        }

        // Live HTTP SMS dispatch
        $payload = [
            'sender' => $this->senderId,
            'recipient' => $recipient,
            'message' => $message,
            'key' => $this->apiKey
        ];

        $ch = curl_init($this->apiUrl);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->apiKey,
                'api-key: ' . $this->apiKey
            ]
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return [
                'success' => false,
                'message_id' => null,
                'error' => "cURL Network Error: " . $error,
                'simulated' => false
            ];
        }

        $decoded = json_decode($response, true);
        $isOk = ($httpCode >= 200 && $httpCode < 300);

        return [
            'success' => $isOk,
            'message_id' => $decoded['id'] ?? $decoded['message_id'] ?? ('EXT-' . time()),
            'error' => $isOk ? null : ($decoded['message'] ?? "SMS provider returned status code {$httpCode}"),
            'simulated' => false
        ];
    }
}
