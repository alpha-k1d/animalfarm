<?php
// payments/bitcoin_callback.php - Bitcoin Payment Status Check

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/BitcoinGateway.php';
require_once __DIR__ . '/PaymentManager.php';

$reference = sanitize($_GET['ref'] ?? '');

if (empty($reference)) {
    redirect('/wallet.php', 'danger', 'Invalid Bitcoin transaction reference.');
}

$stmt = $pdo->prepare("SELECT pt.*, u.full_name, u.email FROM payment_transactions pt JOIN users u ON u.id = pt.user_id WHERE pt.reference = ?");
$stmt->execute([$reference]);
$txn = $stmt->fetch();

if (!$txn) {
    redirect('/wallet.php', 'danger', 'Transaction record not found.');
}

$gateway = new BitcoinGateway($pdo);
$manager = new PaymentManager($pdo);

// Handle manual test simulation confirmation if requested in test mode
if (!empty($_POST['simulate_confirm']) && !empty($_SESSION['user_id'])) {
    csrf_verify();
    $fulfill = $manager->fulfillPayment($reference, 'bitcoin', ['simulated_confirmation' => true, 'confirmations' => 3]);
    if ($fulfill['success']) {
        redirect('/wallet.php', 'success', 'Bitcoin payment confirmed! ' . money($txn['amount_ghs']) . ' credited to your wallet.');
    }
}

// Live verify
$verifyResult = $gateway->verify($reference);

if (!empty($verifyResult['paid'])) {
    $fulfill = $manager->fulfillPayment($reference, 'bitcoin', $verifyResult['data'] ?? []);
    if ($fulfill['success']) {
        redirect('/wallet.php', 'success', 'Bitcoin payment verified and confirmed on the blockchain! ' . money($txn['amount_ghs']) . ' credited.');
    }
}

// Page display for pending Bitcoin deposit
$page_title = "Bitcoin Payment Status - " . SITE_NAME;
require_once __DIR__ . '/../includes/header.php';
?>

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-7">
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="card-header bg-dark text-white p-4">
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center gap-3">
                            <div class="bg-warning text-dark p-2 rounded-circle fw-bold fs-4 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                                ₿
                            </div>
                            <div>
                                <h4 class="mb-0 fw-bold">Bitcoin Payment Verification</h4>
                                <small class="text-white-50">Reference: <?= htmlspecialchars($reference) ?></small>
                            </div>
                        </div>
                        <span class="badge bg-warning text-dark px-3 py-2 rounded-pill">
                            <?= ucfirst($txn['status']) ?>
                        </span>
                    </div>
                </div>

                <div class="card-body p-4 p-md-5">
                    <?php if ($txn['status'] === 'completed'): ?>
                        <div class="text-center py-4">
                            <div class="text-success display-1 mb-3">[Verified]</div>
                            <h3 class="fw-bold text-success">Payment Confirmed</h3>
                            <p class="text-muted">Your payment has been credited to your Animal Farm Ghana rewards wallet.</p>
                            <a href="/wallet.php" class="btn btn-success px-4 py-2 rounded-pill fw-semibold">Go to Wallet</a>
                        </div>
                    <?php else: ?>
                        <div class="alert alert-info border-0 rounded-3 mb-4">
                            <div class="d-flex gap-3 align-items-center">
                                <span class="fs-3"></span>
                                <div>
                                    <strong class="d-block">Awaiting Blockchain Confirmations</strong>
                                    <small>Send the exact BTC amount to the address below. Minimum 3 network confirmations required before automatic crediting.</small>
                                </div>
                            </div>
                        </div>

                        <div class="bg-light p-4 rounded-4 mb-4">
                            <div class="row g-3">
                                <div class="col-sm-6">
                                    <span class="text-muted small d-block">Required Amount (GHS)</span>
                                    <span class="fw-bold fs-5 text-dark"><?= money($txn['amount_ghs']) ?></span>
                                </div>
                                <div class="col-sm-6">
                                    <span class="text-muted small d-block">Bitcoin Equivalent (BTC)</span>
                                    <span class="fw-bold fs-5 text-warning"><?= number_format((float)$txn['amount_crypto'], 8) ?> BTC</span>
                                </div>
                                <div class="col-12">
                                    <span class="text-muted small d-block">Exchange Rate Quoted</span>
                                    <span class="fw-semibold text-secondary small">1 BTC ≈ <?= money($txn['exchange_rate']) ?></span>
                                </div>
                                <div class="col-12">
                                    <span class="text-muted small d-block mb-1">Destination Bitcoin Address:</span>
                                    <div class="input-group">
                                        <input type="text" id="btcAddress" class="form-control font-monospace bg-white" value="<?= htmlspecialchars($txn['payment_address']) ?>" readonly>
                                        <button class="btn btn-outline-secondary" type="button" onclick="navigator.clipboard.writeText('<?= htmlspecialchars($txn['payment_address']) ?>'); alert('Bitcoin address copied to clipboard!');">Copy</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex flex-column flex-sm-row gap-3">
                            <a href="/payments/bitcoin_callback.php?ref=<?= urlencode($reference) ?>" class="btn btn-primary flex-grow-1 py-2 rounded-pill fw-semibold">
                                 Check Network Status Now
                            </a>
                            <a href="/wallet.php" class="btn btn-outline-secondary py-2 rounded-pill px-4">
                                Back to Wallet
                            </a>
                        </div>

                        <div class="mt-4 pt-3 border-top text-center">
                            <form method="POST" action="/payments/bitcoin_callback.php?ref=<?= urlencode($reference) ?>">
                                <?= csrf_field() ?>
                                <input type="hidden" name="simulate_confirm" value="1">
                                <p class="text-muted small mb-2">Sandbox Developer Testing Tool:</p>
                                <button type="submit" class="btn btn-sm btn-outline-warning text-dark fw-semibold">
                                     Simulate Blockchain Confirmation (Test Sandbox)
                                </button>
                            </form>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
