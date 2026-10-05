<?php
// payment.php - Add Funds & Direct Deposits (Paystack MoMo & Bitcoin)

$page_title = "Add Funds / Deposit";
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/payments/PaymentManager.php';

$user = get_auth_user($pdo);
$error = null;

$default_amount = sanitize($_GET['amount'] ?? '50.00');
$default_desc = sanitize($_GET['desc'] ?? 'Wallet Deposit / Farm Funding');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $amount = (float)($_POST['amount'] ?? 0);
    $gateway = sanitize($_POST['gateway'] ?? 'paystack');
    $description = sanitize($_POST['description'] ?? 'Wallet Top-Up');

    if ($amount < 5.00) {
        $error = "Minimum deposit amount is " . money(5.00) . ".";
    } elseif ($amount > 20000.00) {
        $error = "Maximum deposit amount per transaction is " . money(20000.00) . ".";
    } elseif (!in_array($gateway, ['paystack', 'bitcoin'])) {
        $error = "Please select a valid payment channel.";
    } else {
        $paymentManager = new PaymentManager($pdo);
        $initResult = $paymentManager->initiateDeposit($user['id'], $amount, $gateway, $description);

        if ($initResult['success']) {
            // Redirect to checkout URL or Bitcoin invoice
            header("Location: " . $initResult['redirect_url']);
            exit;
        } else {
            $error = $initResult['error'] ?? "Failed to initialize payment processor. Please retry.";
        }
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-4">
    <div class="row justify-content-center">
        <div class="col-lg-7">
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
                <div class="card-header bg-farm-primary text-white p-4">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="badge bg-warning text-dark px-3 py-1 rounded-pill fw-bold mb-2">
                                Instant Funding
                            </span>
                            <h4 class="fw-bold mb-0">Deposit Funds</h4>
                        </div>
                        <div class="text-end">
                            <small class="text-white-70 d-block">Current Balance:</small>
                            <span class="fs-4 fw-bold text-white"><?= money($user['wallet_balance']) ?></span>
                        </div>
                    </div>
                </div>

                <div class="card-body p-4 p-md-5">
                    <?php if ($error): ?>
                        <div class="alert alert-danger border-0 rounded-3 small mb-4">
                            <i class="bi bi-exclamation-triangle-fill me-1"></i> <?= htmlspecialchars($error) ?>
                        </div>
                    <?php endif; ?>

                    <form method="POST" action="/payment.php">
                        <?= csrf_field() ?>

                        <div class="mb-3">
                            <label for="amount" class="form-label fw-semibold small text-muted">Amount to Deposit (GH₵)</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0 fw-bold">GH₵</span>
                                <input type="number" step="0.01" min="5.00" max="20000.00" class="form-control form-control-lg rounded-end-3 fs-6" id="amount" name="amount" value="<?= htmlspecialchars($default_amount) ?>" placeholder="e.g. 50.00" required>
                            </div>
                            <div class="form-text small text-muted">Ghana Cedi transactions. Min: GH₵5.00 &bull; Max: GH₵20,000.00</div>
                        </div>

                        <div class="mb-4">
                            <label class="form-label fw-semibold small text-muted d-block">Select Payment Channel</label>
                            <div class="row g-3">
                                <div class="col-sm-6">
                                    <label class="card border p-3 rounded-3 h-100 cursor-pointer d-flex align-items-center gap-3">
                                        <input type="radio" name="gateway" value="paystack" class="form-check-input mt-0" checked>
                                        <div>
                                            <strong class="d-block text-dark">Paystack Gateway</strong>
                                            <small class="text-muted d-block">MTN MoMo, Telecel Cash, AT Money, Bank Cards</small>
                                        </div>
                                    </label>
                                </div>
                                <div class="col-sm-6">
                                    <label class="card border p-3 rounded-3 h-100 cursor-pointer d-flex align-items-center gap-3">
                                        <input type="radio" name="gateway" value="bitcoin" class="form-check-input mt-0">
                                        <div>
                                            <strong class="d-block text-dark">Bitcoin (Crypto)</strong>
                                            <small class="text-muted d-block">On-chain BTC transaction with 3 network confirmations</small>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label for="description" class="form-label fw-semibold small text-muted">Description / Notes</label>
                            <input type="text" class="form-control rounded-3" id="description" name="description" value="<?= htmlspecialchars($default_desc) ?>" placeholder="Wallet Deposit">
                        </div>

                        <button type="submit" class="btn btn-farm-primary btn-lg rounded-pill w-100 fw-bold shadow-sm mb-3">
                            Proceed to Secure Payment
                        </button>
                    </form>

                    <div class="d-flex align-items-center justify-content-center gap-3 text-muted small mt-3">
                        <span><i class="bi bi-shield-lock-fill text-success"></i> 256-bit SSL Encrypted</span>
                        <span>&bull;</span>
                        <span>Instant Wallet Credit</span>
                    </div>
                </div>
            </div>

            <div class="text-center">
                <a href="/payment-history.php" class="text-success fw-semibold text-decoration-none">
                    <i class="bi bi-clock-history me-1"></i> View Payment Transaction History &rarr;
                </a>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
