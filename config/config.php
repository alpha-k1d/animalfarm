<?php
// config/config.php - Animal Farm Ghana Global Configuration

if (session_status() === PHP_SESSION_NONE) {
    // Set secure cookie params if possible
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
}

define('APP_INIT', true);

// Connect Database
require_once __DIR__ . '/database.php';

// Fetch system settings from DB if available
$system_settings = [];
if (isset($pdo) && $pdo instanceof PDO) {
    try {
        $stmt = $pdo->query("SELECT setting_key, setting_value FROM settings");
        while ($row = $stmt->fetch()) {
            $system_settings[$row['setting_key']] = $row['setting_value'];
        }
    } catch (Exception $e) {
        // Fallback to defaults
    }
}

// System Constants
define('SITE_NAME', $system_settings['site_name'] ?? 'Animal Farm Ghana');
define('SITE_TAGLINE', $system_settings['site_tagline'] ?? 'Complete Tasks. Support Farming. Earn Rewards.');
define('CURRENCY_CODE', $system_settings['currency_code'] ?? 'GHS');
define('CURRENCY_SYMBOL', $system_settings['currency_symbol'] ?? 'GH₵');
define('DEFAULT_COUNTRY', $system_settings['country'] ?? 'Ghana');
define('CONTACT_EMAIL', $system_settings['contact_email'] ?? 'support@animalfarmghana.com');
define('CONTACT_PHONE', $system_settings['contact_phone'] ?? '+233 24 000 1234');
define('MIN_WITHDRAWAL', (float)($system_settings['min_withdrawal'] ?? 20.00));
define('MAX_WITHDRAWAL', (float)($system_settings['max_withdrawal'] ?? 5000.00));
define('REFERRAL_REWARD', (float)($system_settings['referral_reward'] ?? 5.00));
define('OTP_EXPIRY_MINUTES', (int)($system_settings['otp_expiry_minutes'] ?? 5));
define('OTP_RESEND_COOLDOWN', (int)($system_settings['otp_resend_cooldown_seconds'] ?? 60));
define('OTP_MAX_ATTEMPTS', (int)($system_settings['otp_max_attempts'] ?? 5));

// Base URL detection
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || ($_SERVER['SERVER_PORT'] ?? '') == 443 || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')) ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost:3000';
define('BASE_URL', rtrim($protocol . $host, '/'));

// Currency format helper
function money($amount)
{
    return CURRENCY_SYMBOL . number_format((float)$amount, 2);
}

// Retrieve single setting
function get_setting($key, $default = '')
{
    global $system_settings, $pdo;
    if (isset($system_settings[$key])) {
        return $system_settings[$key];
    }
    if (isset($pdo) && $pdo instanceof PDO) {
        try {
            $stmt = $pdo->prepare("SELECT setting_value FROM settings WHERE setting_key = ?");
            $stmt->execute([$key]);
            $val = $stmt->fetchColumn();
            if ($val !== false) {
                $system_settings[$key] = $val;
                return $val;
            }
        } catch (Exception $e) {}
    }
    return $default;
}

// Update setting
function update_setting($key, $value)
{
    global $system_settings, $pdo;
    if (isset($pdo) && $pdo instanceof PDO) {
        $stmt = $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
        $stmt->execute([$key, $value]);
        $system_settings[$key] = $value;
        return true;
    }
    return false;
}
