<?php
// admin/logout.php - Administrator Sign Out

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../includes/functions.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

unset($_SESSION['admin_id']);
redirect('/admin/login.php', 'info', 'Administrator logged out successfully.');
