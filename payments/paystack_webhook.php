<?php
// payments/paystack_webhook.php - Paystack Webhook Event Receiver

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/PaymentManager.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$rawInput = file_get_contents('php://input');

// Retrieve gateway webhook secret
$stmt = $pdo->prepare("SELECT config FROM payment_gateways WHERE code = 'paystack'");
$stmt->execute();
$config = json_decode($stmt->fetchColumn() ?: '{}', true);
$secretKey = $config['secret_key'] ?? '';
$webhookSecret = $config['webhook_secret'] ?? $secretKey;

$signature = $_SERVER['HTTP_X_PAYSTACK_SIGNATURE'] ?? '';

// Validate HMAC-SHA512 Signature if secret is configured
if (!empty($webhookSecret) && !str_contains($webhookSecret, 'sample_demo')) {
    $expectedSignature = hash_hmac('sha512', $rawInput, $webhookSecret);
    if (!hash_equals($expectedSignature, $signature)) {
        http_response_code(400);
        error_log("Paystack webhook signature mismatch.");
        exit('Invalid signature');
    }
}

$event = json_decode($rawInput, true);

if (!$event || empty($event['event'])) {
    http_response_code(400);
    exit('Invalid JSON payload');
}

// Log webhook event
$reference = $event['data']['reference'] ?? null;
$stmtLog = $pdo->prepare("INSERT INTO payment_logs (gateway_code, event_type, reference, request_payload, ip_address) VALUES (?, ?, ?, ?, ?)");
$stmtLog->execute(['paystack', $event['event'], $reference, $rawInput, $_SERVER['REMOTE_ADDR'] ?? '']);

if ($event['event'] === 'charge.success') {
    $data = $event['data'] ?? [];
    $reference = $data['reference'] ?? '';
    $status = $data['status'] ?? '';
    $currency = $data['currency'] ?? '';

    if ($status === 'success' && $currency === 'GHS' && !empty($reference)) {
        $manager = new PaymentManager($pdo);
        $manager->fulfillPayment($reference, 'paystack', $data);
    }
}

http_response_code(200);
echo json_encode(['status' => 'success']);
