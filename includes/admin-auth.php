<?php
// includes/admin-auth.php - Administrator Authentication Guard

require_once __DIR__ . '/functions.php';

if (empty($_SESSION['admin_id'])) {
    $_SESSION['admin_redirect'] = $_SERVER['REQUEST_URI'] ?? '/admin/index.php';
    redirect('/admin/login.php', 'warning', 'Please sign in to access the administration portal.');
}

$current_admin = get_auth_admin($pdo);

if (!$current_admin || $current_admin['status'] !== 'active') {
    unset($_SESSION['admin_id']);
    redirect('/admin/login.php', 'danger', 'Admin session invalid or deactivated. Please sign in again.');
}
