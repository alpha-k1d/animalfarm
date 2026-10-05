<?php
// config/database.php - Animal Farm Ghana Database Connection

if (!defined('APP_INIT')) {
    define('APP_INIT', true);
}

$db_host = getenv('DB_HOST') ?: '127.0.0.1';
$db_port = getenv('DB_PORT') ?: '3306';
$db_name = getenv('DB_NAME') ?: 'animal_farm';
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';

$dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
];

try {
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (PDOException $e) {
    // Check if running in installer mode
    if (defined('INSTALLING') && INSTALLING === true) {
        $pdo = null;
    } else {
        error_log("Database connection failure: " . $e->getMessage());
        // Show safe user error without leaking credentials
        if (file_exists(__DIR__ . '/../install.php') && !file_exists(__DIR__ . '/../installed.lock')) {
            header("Location: /install.php");
            exit;
        }
        http_response_code(500);
        require_once __DIR__ . '/../500.php';
        exit;
    }
}
