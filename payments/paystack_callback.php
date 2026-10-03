<?php
// payments/paystack_callback.php - Paystack Customer Return Callback

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/PaystackGateway.php';
require_once __DIR__ . '/PaymentManager.php';

// The reference passed back by Paystack or our callback parameter
$reference = $_GET['reference'] ?? $_GET['ref'] ?? $_GET['trxref'] ?? '';
$isSimulated = !empty($_GET['simulated']);

if (empty($reference)) {
    redirect('/wallet.php', 'danger', 'Invalid payment return reference.');
}

// Log incoming callback
$stmtLog = $pdo->prepare("INSERT INTO payment_logs (gateway_code, event_type, reference, request_payload, ip_address) VALUES (?, ?, ?, ?, ?)");
$stmtLog->execute(['paystack', 'browser_callback', $reference, json_encode($_GET), $_SERVER['REMOTE_ADDR'] ?? '']);

$gateway = new PaystackGateway($pdo);
$manager = new PaymentManager($pdo);

// Verify server-side (NEVER trust browser query params directly)
$verifyResult = $gateway->verify($reference);

if (!empty($verifyResult['success']) && !empty($verifyResult['paid'])) {
    // Process server-side fulfillment
    $fulfillResult = $manager->fulfillPayment($reference, 'paystack', $verifyResult['data'] ?? []);

    if ($fulfillResult['success']) {
        redirect('/wallet.php', 'success', 'Payment successful! ' . money($verifyResult['amount_ghs']) . ' has been credited to your rewards wallet.');
    } else {
        redirect('/wallet.php', 'warning', 'Payment received, but crediting is pending manual review: ' . ($fulfillResult['error'] ?? ''));
    }
} else {
    $errorMsg = $verifyResult['error'] ?? 'Payment verification failed. If you were debited, please contact support with reference: ' . sanitize($reference);
    redirect('/wallet.php', 'danger', $errorMsg);
}
