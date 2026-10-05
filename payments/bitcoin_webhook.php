<?php
// payments/bitcoin_webhook.php - Bitcoin Payment Provider Webhook

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/PaymentManager.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

// Log incoming Bitcoin webhook
$stmtLog = $pdo->prepare("INSERT INTO payment_logs (gateway_code, event_type, reference, request_payload, ip_address) VALUES (?, ?, ?, ?, ?)");
$stmtLog->execute(['bitcoin', 'webhook', $data['hash'] ?? $data['txid'] ?? null, $rawInput, $_SERVER['REMOTE_ADDR'] ?? '']);

if (!$data) {
    http_response_code(400);
    exit('Invalid JSON');
}

// Check for address or tx match in payment_transactions
$address = $data['address'] ?? ($data['outputs'][0]['addresses'][0] ?? null);
$confirmations = (int)($data['confirmations'] ?? 0);

if ($address && $confirmations >= 3) {
    $stmt = $pdo->prepare("SELECT reference FROM payment_transactions WHERE payment_address = ? AND status = 'pending' ORDER BY id DESC LIMIT 1");
    $stmt->execute([$address]);
    $reference = $stmt->fetchColumn();

    if ($reference) {
        $manager = new PaymentManager($pdo);
        $manager->fulfillPayment($reference, 'bitcoin', $data);
    }
}

http_response_code(200);
echo json_encode(['status' => 'received']);
