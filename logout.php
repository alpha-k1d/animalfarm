<?php
// logout.php - Destroy Session & Log Out

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/functions.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Preserve admin session if logged in as admin in same browser
$adminId = $_SESSION['admin_id'] ?? null;

$_SESSION = [];
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}
session_destroy();

// Restore admin session if existed
if ($adminId) {
    session_start();
    $_SESSION['admin_id'] = $adminId;
}

redirect('/login.php', 'info', 'You have been logged out securely.');
