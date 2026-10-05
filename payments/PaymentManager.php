<?php
// payments/PaymentManager.php - Unified Payment Gateway Orchestrator

require_once __DIR__ . '/PaymentGatewayInterface.php';
require_once __DIR__ . '/PaystackGateway.php';
require_once __DIR__ . '/BitcoinGateway.php';
require_once __DIR__ . '/../includes/functions.php';

class PaymentManager
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function getGateway(string $code): ?PaymentGatewayInterface
    {
        $code = strtolower(trim($code));
        if ($code === 'paystack') {
            return new PaystackGateway($this->pdo);
        } elseif ($code === 'bitcoin') {
            return new BitcoinGateway($this->pdo);
        }
        return null;
    }

    /**
     * Initialize a deposit or package payment.
     */
    public function initialize(string $gatewayCode, int $userId, float $amount): array
    {
        $gatewayCode = strtolower(trim($gatewayCode));

        // Fetch gateway row
        $stmt = $this->pdo->prepare("SELECT * FROM payment_gateways WHERE code = ?");
        $stmt->execute([$gatewayCode]);
        $gatewayRow = $stmt->fetch();

        if (!$gatewayRow || !(int)$gatewayRow['is_enabled']) {
            return ['success' => false, 'error' => 'Selected payment gateway is currently unavailable.'];
        }

        // Validate amount limits
        $min = (float)$gatewayRow['min_amount'];
        $max = (float)$gatewayRow['max_amount'];

        if ($amount < $min) {
            return ['success' => false, 'error' => "Minimum payment amount for {$gatewayRow['name']} is " . money($min)];
        }
        if ($amount > $max) {
            return ['success' => false, 'error' => "Maximum payment amount for {$gatewayRow['name']} is " . money($max)];
        }

        $gateway = $this->getGateway($gatewayCode);
        if (!$gateway) {
            return ['success' => false, 'error' => 'Unsupported payment gateway.'];
        }

        // Generate unique reference
        $reference = generate_reference('PAY-' . strtoupper($gatewayCode));

        // Call gateway initialize
        $initResult = $gateway->initialize($userId, $amount, $reference);

        if (empty($initResult['success'])) {
            return ['success' => false, 'error' => $initResult['error'] ?? 'Initialization failed.'];
        }

        // Create internal pending transaction
        $stmtInsert = $this->pdo->prepare("INSERT INTO payment_transactions (
            user_id, gateway_id, reference, gateway_reference, amount_ghs,
            amount_crypto, currency, crypto_currency, exchange_rate,
            payment_address, status, provider_response, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)");

        $stmtInsert->execute([
            $userId,
            $gatewayRow['id'],
            $reference,
            $initResult['gateway_reference'] ?? null,
            $amount,
            $initResult['amount_crypto'] ?? null,
            'GHS',
            $initResult['crypto_currency'] ?? null,
            $initResult['exchange_rate'] ?? null,
            $initResult['payment_address'] ?? null,
            json_encode($initResult),
            $initResult['expires_at'] ?? null
        ]);

        $initResult['internal_reference'] = $reference;
        return $initResult;
    }

    /**
     * Process confirmed payment and credit user account with row-level transaction safety.
     */
    public function fulfillPayment(string $reference, string $gatewayCode, array $verificationData): array
    {
        try {
            $this->pdo->beginTransaction();

            // Lock the payment transaction row (SELECT ... FOR UPDATE)
            $stmt = $this->pdo->prepare("SELECT * FROM payment_transactions WHERE reference = ? FOR UPDATE");
            $stmt->execute([$reference]);
            $txn = $stmt->fetch();

            if (!$txn) {
                $this->pdo->rollBack();
                return ['success' => false, 'error' => 'Transaction not found.'];
            }

            // Check if already completed (Idempotency)
            if ($txn['status'] === 'completed') {
                $this->pdo->rollBack();
                return [
                    'success' => true,
                    'already_completed' => true,
                    'message' => 'Transaction has already been processed.'
                ];
            }

            $userId = (int)$txn['user_id'];
            $amountGhs = (float)$txn['amount_ghs'];

            // Update payment transaction status
            $stmtUpdate = $this->pdo->prepare("UPDATE payment_transactions SET status = 'completed', paid_at = NOW(), provider_response = ? WHERE id = ?");
            $stmtUpdate->execute([json_encode($verificationData), $txn['id']]);

            // Update user wallet balance and total earned/deposited
            $stmtWallet = $this->pdo->prepare("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?");
            $stmtWallet->execute([$amountGhs, $userId]);

            // Record transaction ledger entry
            record_transaction(
                $this->pdo,
                $userId,
                'Purchase',
                $amountGhs,
                "Wallet deposit via " . ucfirst($gatewayCode) . " [Ref: {$reference}]",
                'completed'
            );

            // Create notification for user
            create_notification(
                $this->pdo,
                $userId,
                'Payment Confirmed',
                "Your payment of " . money($amountGhs) . " via " . ucfirst($gatewayCode) . " has been successfully credited to your wallet.",
                'payment',
                '/wallet.php'
            );

            // Record audit log
            record_audit_log(
                $this->pdo,
                null,
                'payment_verified',
                "Payment {$reference} for user #{$userId} confirmed (" . money($amountGhs) . ")",
                $userId,
                $amountGhs
            );

            $this->pdo->commit();

            return [
                'success' => true,
                'amount' => $amountGhs,
                'reference' => $reference,
                'message' => 'Payment confirmed and credited successfully.'
            ];
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            error_log("Payment fulfillment error: " . $e->getMessage());
            return ['success' => false, 'error' => 'Database transaction failed: ' . $e->getMessage()];
        }
    }
}
