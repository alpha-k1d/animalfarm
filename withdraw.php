<?php
// withdraw.php - Request Mobile Money or Bitcoin Withdrawal

$page_title = "Request Withdrawal";
require_once __DIR__ . '/includes/auth.php';

$user = get_auth_user($pdo);
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $method = sanitize($_POST['method'] ?? '');
    $account_name = sanitize($_POST['account_name'] ?? '');
    $account_number = trim($_POST['account_number'] ?? '');
    $amount = (float)($_POST['amount'] ?? 0);

    $allowedMethods = ['MTN Mobile Money', 'Telecel Cash', 'AT Money', 'Bitcoin'];

    if (!in_array($method, $allowedMethods)) {
        $error = "Please select an authorized Ghanaian payout method.";
    } elseif (empty($account_name)) {
        $error = "Please enter the registered account/beneficiary name.";
    } elseif (empty($account_number)) {
        $error = "Please provide your Mobile Money number or destination Bitcoin address.";
    } elseif ($method !== 'Bitcoin' && !validate_gh_phone($account_number)) {
        $error = "Please provide a valid 10-digit Ghanaian mobile money number.";
    } elseif ($amount < MIN_WITHDRAWAL) {
        $error = "Minimum withdrawal amount is " . money(MIN_WITHDRAWAL) . ".";
    } elseif ($amount > MAX_WITHDRAWAL) {
        $error = "Maximum withdrawal per request is " . money(MAX_WITHDRAWAL) . ".";
    } elseif ($amount > (float)$user['wallet_balance']) {
        $error = "Insufficient wallet balance. You currently have " . money($user['wallet_balance']) . " available.";
    } else {
        // Compute transaction fee if any (0.00 by default for members)
        $fee = 0.00;
        $final_amount = $amount - $fee;
        $reference = 'WD' . date('ymd') . strtoupper(bin2hex(random_bytes(4)));

        try {
            $pdo->beginTransaction();

            // Lock user row for balance check
            $stmtLock = $pdo->prepare("SELECT wallet_balance FROM users WHERE id = ? FOR UPDATE");
            $stmtLock->execute([$user['id']]);
            $currentBal = (float)$stmtLock->fetchColumn();

            if ($currentBal < $amount) {
                $pdo->rollBack();
                $error = "Insufficient funds in your rewards wallet.";
            } else {
                // Deduct balance
                $stmtDeduct = $pdo->prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?");
                $stmtDeduct->execute([$amount, $user['id']]);

                // Create withdrawal record
                $stmtWd = $pdo->prepare("INSERT INTO withdrawals (user_id, reference, amount, fee, final_amount, method, account_name, account_number, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
                $stmtWd->execute([$user['id'], $reference, $amount, $fee, $final_amount, $method, $account_name, $account_number]);

                // Ledger transaction record
                record_transaction($pdo, $user['id'], 'Withdrawal', $amount, "Withdrawal request ({$method} - {$account_number})", 'pending');

                // Notification
                create_notification(
                    $pdo,
                    $user['id'],
                    'Withdrawal Request Submitted',
                    "Your payout request of " . money($amount) . " to {$method} ({$account_number}) has been placed into the dispatch queue.",
                    'withdrawal',
                    '/withdrawal-history.php'
                );

                $pdo->commit();

                redirect('/withdrawal-history.php', 'success', 'Withdrawal request of ' . money($amount) . ' submitted successfully. Reference: ' . $reference);
            }
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log("Withdrawal submission error: " . $e->getMessage());
            $error = "An error occurred while placing your withdrawal request. Please retry.";
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
                                Fast MoMo Payouts
                            </span>
                            <h4 class="fw-bold mb-0">Request Withdrawal</h4>
                        </div>
                        <div class="text-end">
                            <small class="text-white-70 d-block">Available Rewards:</small>
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

                    <?php if ((float)$user['wallet_balance'] < MIN_WITHDRAWAL): ?>
                        <div class="alert alert-warning border-0 rounded-3 small mb-4">
                            <i class="bi bi-info-circle me-1"></i>
                            The minimum withdrawal threshold is <strong><?= money(MIN_WITHDRAWAL) ?></strong>. Your current available rewards balance is <?= money($user['wallet_balance']) ?>. Complete additional agricultural tasks to qualify for payout.
                        </div>
                    <?php endif; ?>

                    <form method="POST" action="/withdraw.php">
                        <?= csrf_field() ?>

                        <div class="mb-3">
                            <label for="method" class="form-label fw-semibold small text-muted">Payout Channel / Method</label>
                            <select class="form-select form-select-lg rounded-3 fs-6" id="method" name="method" required>
                                <option value="">Select payout method...</option>
                                <option value="MTN Mobile Money" <?= (isset($_POST['method']) && $_POST['method'] === 'MTN Mobile Money') ? 'selected' : '' ?>>MTN Mobile Money (MoMo)</option>
                                <option value="Telecel Cash" <?= (isset($_POST['method']) && $_POST['method'] === 'Telecel Cash') ? 'selected' : '' ?>>Telecel Cash (formerly Vodafone Cash)</option>
                                <option value="AT Money" <?= (isset($_POST['method']) && $_POST['method'] === 'AT Money') ? 'selected' : '' ?>>AT Money (AirtelTigo)</option>
                                <option value="Bitcoin" <?= (isset($_POST['method']) && $_POST['method'] === 'Bitcoin') ? 'selected' : '' ?>>Bitcoin (On-Chain Crypto)</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label for="amount" class="form-label fw-semibold small text-muted">Withdrawal Amount (in Ghana Cedi GH₵)</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0 fw-bold">GH₵</span>
                                <input type="number" step="0.01" min="<?= MIN_WITHDRAWAL ?>" max="<?= min((float)$user['wallet_balance'], MAX_WITHDRAWAL) ?>" class="form-control form-control-lg rounded-end-3 fs-6" id="amount" name="amount" value="<?= htmlspecialchars($_POST['amount'] ?? '') ?>" placeholder="e.g. 50.00" required>
                            </div>
                            <div class="form-text small text-muted">
                                Min: <?= money(MIN_WITHDRAWAL) ?> &bull; Max per request: <?= money(MAX_WITHDRAWAL) ?>. No withdrawal fees.
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="account_name" class="form-label fw-semibold small text-muted">Account / Beneficiary Full Legal Name</label>
                            <input type="text" class="form-control form-control-lg rounded-3 fs-6" id="account_name" name="account_name" value="<?= htmlspecialchars($_POST['account_name'] ?? $user['full_name']) ?>" placeholder="e.g. Kwame Mensah" required>
                            <div class="form-text small text-muted">Must match the registered name on your Mobile Money SIM card.</div>
                        </div>

                        <div class="mb-4">
                            <label for="account_number" class="form-label fw-semibold small text-muted">Mobile Money Number or Bitcoin Address</label>
                            <input type="text" class="form-control form-control-lg rounded-3 fs-6" id="account_number" name="account_number" value="<?= htmlspecialchars($_POST['account_number'] ?? $user['phone']) ?>" placeholder="e.g. 0244123456 or bc1q..." required>
                        </div>

                        <button type="submit" class="btn btn-farm-primary btn-lg rounded-pill w-100 fw-bold shadow-sm mb-3" <?= (float)$user['wallet_balance'] < MIN_WITHDRAWAL ? 'disabled' : '' ?>>
                            Submit Payout Request
                        </button>
                    </form>

                    <div class="bg-light p-3 rounded-3 small text-muted border">
                        <strong class="d-block text-dark mb-1"><i class="bi bi-clock-history me-1 text-primary"></i> Processing Times:</strong>
                        Ghana Mobile Money withdrawals are dispatched Monday through Saturday between 08:00 and 18:00 GMT. Bitcoin disbursements are subject to 3 on-chain confirmations.
                    </div>
                </div>
            </div>

            <div class="text-center">
                <a href="/withdrawal-history.php" class="text-success fw-semibold text-decoration-none">
                    <i class="bi bi-journal-text me-1"></i> View Past Withdrawal History &rarr;
                </a>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
