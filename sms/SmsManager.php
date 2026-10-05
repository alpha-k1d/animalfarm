<?php
// sms/SmsManager.php - Core SMS and OTP Verification Manager

require_once __DIR__ . '/SmsProviderInterface.php';
require_once __DIR__ . '/providers/GenericSmsProvider.php';
require_once __DIR__ . '/../includes/functions.php';

class SmsManager
{
    private PDO $pdo;
    private SmsProviderInterface $provider;

    public function __construct(PDO $pdo, ?SmsProviderInterface $provider = null)
    {
        $this->pdo = $pdo;
        $this->provider = $provider ?: new GenericSmsProvider();
    }

    /**
     * Check if phone is within the resend cooldown period.
     */
    public function getResendCooldownRemaining(string $phone): int
    {
        $phone = normalize_gh_phone($phone);
        $cooldown = (int)get_setting('otp_resend_cooldown_seconds', '60');

        $stmt = $this->pdo->prepare("SELECT created_at FROM otp_verifications WHERE phone = ? ORDER BY id DESC LIMIT 1");
        $stmt->execute([$phone]);
        $lastCreated = $stmt->fetchColumn();

        if (!$lastCreated) {
            return 0;
        }

        $elapsed = time() - strtotime($lastCreated);
        $remaining = $cooldown - $elapsed;
        return max(0, $remaining);
    }

    /**
     * Generate, hash and send a new 6-digit OTP.
     */
    public function sendOtp(?int $userId, string $phone, string $purpose = 'registration'): array
    {
        $phone = normalize_gh_phone($phone);

        // Check cooldown
        $cooldownRemaining = $this->getResendCooldownRemaining($phone);
        if ($cooldownRemaining > 0) {
            return [
                'success' => false,
                'error' => "Please wait {$cooldownRemaining} seconds before requesting a new OTP.",
                'cooldown' => $cooldownRemaining
            ];
        }

        // Generate cryptographically secure 6-digit OTP
        $otp = (string)random_int(100000, 999999);
        $otpHash = password_hash($otp, PASSWORD_DEFAULT);

        $expiryMinutes = (int)get_setting('otp_expiry_minutes', '5');
        $maxAttempts = (int)get_setting('otp_max_attempts', '5');
        $expiresAt = date('Y-m-d H:i:s', time() + ($expiryMinutes * 60));

        // Insert OTP record
        $stmt = $this->pdo->prepare("INSERT INTO otp_verifications (user_id, phone, otp_hash, purpose, attempts, max_attempts, expires_at) VALUES (?, ?, ?, ?, 0, ?, ?)");
        $stmt->execute([$userId, $phone, $otpHash, $purpose, $maxAttempts, $expiresAt]);

        // Craft SMS message
        $siteName = get_setting('site_name', 'Animal Farm Ghana');
        $message = "Your {$siteName} verification code is: {$otp}. Valid for {$expiryMinutes} minutes. Complete farming tasks & earn rewards.";

        // Send SMS via provider
        $result = $this->provider->sendSms($phone, $message);

        // In simulation/dev mode, store the raw OTP in session so tester can immediately see it!
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (!empty($result['simulated'])) {
            $_SESSION['debug_simulated_otp'] = [
                'phone' => $phone,
                'otp' => $otp,
                'expires_at' => $expiresAt
            ];
        }

        return [
            'success' => $result['success'],
            'message' => $result['success'] ? 'Verification OTP has been dispatched to your phone.' : ($result['error'] ?? 'SMS dispatch failed.'),
            'simulated' => $result['simulated'] ?? false,
            'test_otp' => !empty($result['simulated']) ? $otp : null
        ];
    }

    /**
     * Verify an entered OTP.
     */
    public function verifyOtp(string $phone, string $inputOtp, string $purpose = 'registration'): array
    {
        $phone = normalize_gh_phone($phone);
        $inputOtp = trim($inputOtp);

        if (strlen($inputOtp) !== 6 || !ctype_digit($inputOtp)) {
            return [
                'success' => false,
                'error' => 'Please enter a valid 6-digit numeric verification code.'
            ];
        }

        // Fetch latest active unverified OTP for this phone
        $stmt = $this->pdo->prepare("SELECT * FROM otp_verifications WHERE phone = ? AND purpose = ? AND verified_at IS NULL ORDER BY id DESC LIMIT 1");
        $stmt->execute([$phone, $purpose]);
        $record = $stmt->fetch();

        if (!$record) {
            return [
                'success' => false,
                'error' => 'No active verification code found. Please request a new OTP.'
            ];
        }

        // Check if expired
        if (strtotime($record['expires_at']) < time()) {
            return [
                'success' => false,
                'error' => 'This verification code has expired. Please request a new code.'
            ];
        }

        // Check max attempts
        if ($record['attempts'] >= $record['max_attempts']) {
            return [
                'success' => false,
                'error' => 'Maximum verification attempts exceeded. Please request a new OTP.'
            ];
        }

        // Increment attempts count
        $newAttempts = $record['attempts'] + 1;
        $stmtUpdate = $this->pdo->prepare("UPDATE otp_verifications SET attempts = ? WHERE id = ?");
        $stmtUpdate->execute([$newAttempts, $record['id']]);

        // Verify hash
        if (!password_verify($inputOtp, $record['otp_hash'])) {
            $remaining = $record['max_attempts'] - $newAttempts;
            return [
                'success' => false,
                'error' => "Invalid verification code. {$remaining} attempts remaining."
            ];
        }

        // Mark verified
        $stmtVerify = $this->pdo->prepare("UPDATE otp_verifications SET verified_at = NOW() WHERE id = ?");
        $stmtVerify->execute([$record['id']]);

        // If user_id is linked or match by phone, activate user!
        if (!empty($record['user_id'])) {
            $stmtUser = $this->pdo->prepare("UPDATE users SET phone_verified = 1, status = 'active' WHERE id = ?");
            $stmtUser->execute([$record['user_id']]);
        } else {
            $stmtUser = $this->pdo->prepare("UPDATE users SET phone_verified = 1, status = 'active' WHERE phone = ?");
            $stmtUser->execute([$phone]);
        }

        // Clear simulated OTP from session
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        unset($_SESSION['debug_simulated_otp']);

        return [
            'success' => true,
            'message' => 'Your Ghana phone number has been successfully verified! Account is now active.'
        ];
    }
}
