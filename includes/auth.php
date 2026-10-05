<?php
// includes/auth.php - User Authentication Guard

require_once __DIR__ . '/functions.php';

if (empty($_SESSION['user_id'])) {
    $_SESSION['redirect_after_login'] = $_SERVER['REQUEST_URI'] ?? '/dashboard.php';
    redirect('/login.php', 'warning', 'Please log in to your account to continue.');
}

$current_user = get_auth_user($pdo);

if (!$current_user) {
    session_unset();
    session_destroy();
    redirect('/login.php', 'danger', 'User account not found. Please log in again.');
}

if ($current_user['status'] === 'suspended') {
    session_unset();
    session_destroy();
    redirect('/login.php', 'danger', 'Your account has been suspended by administration. Please contact support.');
}

// Check phone verification
$current_script = basename($_SERVER['SCRIPT_NAME'] ?? '');
$allowed_unverified = ['verify-otp.php', 'resend-otp.php', 'logout.php'];

if ((int)$current_user['phone_verified'] === 0 || $current_user['status'] === 'pending') {
    if (!in_array($current_script, $allowed_unverified)) {
        redirect('/verify-otp.php', 'warning', 'Please verify your Ghana phone number with OTP to access your account.');
    }
}
