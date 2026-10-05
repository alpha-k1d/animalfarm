<?php
// includes/functions.php - Global Utility Functions

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/csrf.php';

// Sanitize string
function sanitize($value): string
{
    if (is_array($value)) {
        return '';
    }
    return htmlspecialchars(trim((string)$value), ENT_QUOTES, 'UTF-8');
}

// Redirect with optional flash
function redirect(string $url, ?string $type = null, ?string $message = null): void
{
    if ($type !== null && $message !== null) {
        flash($type, $message);
    }
    header("Location: " . $url);
    exit;
}

// Flash messaging
function flash(string $type, string $message): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $_SESSION['flash_messages'][] = [
        'type' => $type, // success, danger, warning, info
        'message' => $message
    ];
}

function get_flash(): array
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $messages = $_SESSION['flash_messages'] ?? [];
    unset($_SESSION['flash_messages']);
    return $messages;
}

// Validate Ghana Phone Number
// Accept: 024XXXXXXX, 055XXXXXXX, 020XXXXXXX, 027XXXXXXX, 026XXXXXXX or +233XXXXXXXXX
function validate_gh_phone(string $phone): bool
{
    $clean = preg_replace('/[^0-9]/', '', $phone);
    // Local 10 digits starting with 02 or 05
    if (preg_match('/^0[25][0-9]{8}$/', $clean)) {
        return true;
    }
    // International 12 digits starting with 233
    if (preg_match('/^233[25][0-9]{8}$/', $clean)) {
        return true;
    }
    return false;
}

// Normalize Ghana Phone Number to standard local 10-digit format (024XXXXXXX)
function normalize_gh_phone(string $phone): string
{
    $clean = preg_replace('/[^0-9]/', '', $phone);
    if (str_starts_with($clean, '233') && strlen($clean) === 12) {
        return '0' . substr($clean, 3);
    }
    return $clean;
}

// Format Phone for International SMS gateway (+233XXXXXXXXX)
function format_international_phone(string $phone): string
{
    $normalized = normalize_gh_phone($phone);
    if (str_starts_with($normalized, '0')) {
        return '233' . substr($normalized, 1);
    }
    return $normalized;
}

// Generate Unique Referral Code
function generate_referral_code(PDO $pdo): string
{
    do {
        $code = 'AFG' . random_int(10000, 99999);
        $stmt = $pdo->prepare("SELECT id FROM users WHERE referral_code = ?");
        $stmt->execute([$code]);
    } while ($stmt->fetch());
    return $code;
}

// Generate Unique Reference
function generate_reference(string $prefix = 'AFG'): string
{
    return strtoupper($prefix . '-' . date('YmdHis') . '-' . substr(bin2hex(random_bytes(4)), 0, 6));
}

// Record Transaction with safe balance tracking
function record_transaction(PDO $pdo, int $userId, string $type, float $amount, string $description, string $status = 'completed'): string
{
    $reference = generate_reference('TXN');
    $stmt = $pdo->prepare("INSERT INTO transactions (user_id, transaction_reference, type, amount, description, status) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$userId, $reference, $type, $amount, $description, $status]);
    return $reference;
}

// Record Audit Log for Admin Actions
function record_audit_log(PDO $pdo, ?int $adminId, string $action, string $description, ?int $userId = null, ?float $amount = null): void
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $stmt = $pdo->prepare("INSERT INTO audit_logs (admin_id, action, user_id, amount, ip_address, description) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$adminId, $action, $userId, $amount, $ip, $description]);
}

// Create Notification
function create_notification(PDO $pdo, ?int $userId, string $title, string $message, string $type = 'system', ?string $link = null): void
{
    $stmt = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$userId, $title, $message, $type, $link]);
}

// Get Logged In User
function get_auth_user(PDO $pdo): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    return $user ?: null;
}

// Get Logged In Admin
function get_auth_admin(PDO $pdo): ?array
{
    if (empty($_SESSION['admin_id'])) {
        return null;
    }
    $stmt = $pdo->prepare("SELECT * FROM admins WHERE id = ?");
    $stmt->execute([$_SESSION['admin_id']]);
    $admin = $stmt->fetch();
    return $admin ?: null;
}

// Get unread notification count
function get_unread_notification_count(PDO $pdo, int $userId): int
{
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0");
    $stmt->execute([$userId]);
    return (int)$stmt->fetchColumn();
}
