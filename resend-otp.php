<?php
// resend-otp.php - Resend 6-Digit Verification OTP

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/sms/SmsManager.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/verify-otp.php');
}

csrf_verify();

$phone = sanitize($_POST['phone'] ?? $_SESSION['pending_verification_phone'] ?? '');

if (empty($phone)) {
    redirect('/login.php', 'danger', 'Verification session expired. Please sign in.');
}

$smsManager = new SmsManager($pdo);
$userId = $_SESSION['pending_verification_user_id'] ?? $_SESSION['user_id'] ?? null;

$result = $smsManager->sendOtp($userId, $phone, 'registration');

if ($result['success']) {
    redirect('/verify-otp.php', 'success', 'A new verification code has been dispatched to ' . htmlspecialchars($phone));
} else {
    redirect('/verify-otp.php', 'danger', $result['error'] ?? 'Could not resend verification code. Please wait.');
}
