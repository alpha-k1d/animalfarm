<?php
// payment-history.php - Historical Payment & Deposit Transactions

$page_title = "Payment History";
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/header.php';

$user = get_auth_user($pdo);

$stmt = $pdo->prepare("SELECT * FROM payment_transactions WHERE user_id = ? ORDER BY id DESC");
$stmt->execute([$user['id']]);
$payments = $stmt->fetchAll();
?>

<div class="container py-4">
    <!-- Header -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
                <span class="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-1 rounded-pill mb-2">
                    Payment Gateway Ledger
                </span>
                <h3 class="fw-bold text-dark mb-1">Deposit & Payment History</h3>
                <p class="text-muted small mb-0">Record of all Paystack Mobile Money and Bitcoin payments initiated on your account.</p>
            </div>
            <a href="/payment.php" class="btn btn-farm-primary rounded-pill px-4 py-2 fw-bold shadow-sm">
                <i class="bi bi-plus-circle me-1"></i> Add Funds
            </a>
        </div>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-4">
        <?php if (empty($payments)): ?>
            <div class="text-center py-5 text-muted small">
                <i class="bi bi-credit-card fs-1 d-block mb-3 text-secondary"></i>
                You haven't initiated any payment or deposit transactions yet.
                <div class="mt-3">
                    <a href="/payment.php" class="btn btn-outline-success rounded-pill px-4 fw-semibold">Make a Deposit</a>
                </div>
            </div>
        <?php else: ?>
            <div class="table-responsive">
                <table class="table align-middle table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Reference</th>
                            <th>Gateway</th>
                            <th>Amount (GH₵)</th>
                            <th>Crypto / Rate</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($payments as $p): 
                            $badgeClass = match($p['status']) {
                                'completed' => 'bg-success',
                                'failed' => 'bg-danger',
                                default => 'bg-warning text-dark'
                            };
                        ?>
                        <tr>
                            <td class="small text-muted"><?= date('M d, Y H:i', strtotime($p['created_at'])) ?></td>
                            <td><code class="small fw-bold text-dark"><?= htmlspecialchars($p['reference']) ?></code></td>
                            <td>
                                <span class="badge bg-light text-dark border small text-capitalize"><?= htmlspecialchars($p['gateway']) ?></span>
                            </td>
                            <td class="fw-bold text-dark"><?= money($p['amount_ghs']) ?></td>
                            <td class="small text-muted">
                                <?php if ($p['gateway'] === 'bitcoin' && !empty($p['amount_crypto'])): ?>
                                    <?= number_format((float)$p['amount_crypto'], 8) ?> BTC
                                <?php else: ?>
                                    -
                                <?php endif; ?>
                            </td>
                            <td>
                                <span class="badge <?= $badgeClass ?> rounded-pill px-3 py-1">
                                    <?= ucfirst($p['status']) ?>
                                </span>
                            </td>
                            <td>
                                <?php if ($p['status'] === 'pending' && $p['gateway'] === 'bitcoin'): ?>
                                    <a href="/payments/bitcoin_invoice.php?ref=<?= urlencode($p['reference']) ?>" class="btn btn-sm btn-outline-warning text-dark rounded-pill fw-semibold">
                                        View Invoice
                                    </a>
                                <?php elseif ($p['status'] === 'pending' && $p['gateway'] === 'paystack'): ?>
                                    <a href="/payments/paystack_callback.php?reference=<?= urlencode($p['reference']) ?>" class="btn btn-sm btn-outline-primary rounded-pill fw-semibold">
                                        Verify Status
                                    </a>
                                <?php else: ?>
                                    <span class="text-muted small">&mdash;</span>
                                <?php endif; ?>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
