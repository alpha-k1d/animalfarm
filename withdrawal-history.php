<?php
// withdrawal-history.php - Historical Payout Requests

$page_title = "Withdrawal History";
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/header.php';

$user = get_auth_user($pdo);

$stmt = $pdo->prepare("SELECT * FROM withdrawals WHERE user_id = ? ORDER BY id DESC");
$stmt->execute([$user['id']]);
$withdrawals = $stmt->fetchAll();
?>

<div class="container py-4">
    <!-- Header -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
                <span class="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-1 rounded-pill mb-2">
                    Payout Records
                </span>
                <h3 class="fw-bold text-dark mb-1">Withdrawal History</h3>
                <p class="text-muted small mb-0">Review the status and transaction references of all your mobile money and bitcoin withdrawals.</p>
            </div>
            <a href="/withdraw.php" class="btn btn-farm-primary rounded-pill px-4 py-2 fw-bold shadow-sm">
                <i class="bi bi-cash-stack me-1"></i> New Request
            </a>
        </div>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-4">
        <?php if (empty($withdrawals)): ?>
            <div class="text-center py-5 text-muted small">
                <i class="bi bi-wallet2 fs-1 d-block mb-3 text-secondary"></i>
                You have not submitted any withdrawal requests yet.
                <div class="mt-3">
                    <a href="/withdraw.php" class="btn btn-outline-success rounded-pill px-4 fw-semibold">Request Your First Withdrawal</a>
                </div>
            </div>
        <?php else: ?>
            <div class="table-responsive">
                <table class="table align-middle table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Date Requested</th>
                            <th>Reference</th>
                            <th>Method & Details</th>
                            <th>Amount (GH₵)</th>
                            <th>Status</th>
                            <th>Payout ID / Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($withdrawals as $wd): 
                            $badgeClass = match($wd['status']) {
                                'paid' => 'bg-success',
                                'processing' => 'bg-info text-dark',
                                'rejected' => 'bg-danger',
                                default => 'bg-warning text-dark'
                            };
                        ?>
                        <tr>
                            <td class="small text-muted">
                                <?= date('M d, Y H:i', strtotime($wd['created_at'])) ?>
                            </td>
                            <td>
                                <code class="small fw-bold text-dark"><?= htmlspecialchars($wd['reference']) ?></code>
                            </td>
                            <td>
                                <div class="small fw-bold text-dark"><?= htmlspecialchars($wd['method']) ?></div>
                                <div class="text-muted small"><?= htmlspecialchars($wd['account_name']) ?> &bull; <?= htmlspecialchars($wd['account_number']) ?></div>
                            </td>
                            <td class="fw-bold fs-6 text-dark">
                                <?= money($wd['amount']) ?>
                            </td>
                            <td>
                                <span class="badge <?= $badgeClass ?> rounded-pill px-3 py-1">
                                    <?= ucfirst($wd['status']) ?>
                                </span>
                            </td>
                            <td class="small text-muted">
                                <?php if (!empty($wd['tx_hash'])): ?>
                                    <span class="d-block text-success fw-semibold"><i class="bi bi-check2-circle me-1"></i> <?= htmlspecialchars($wd['tx_hash']) ?></span>
                                <?php endif; ?>
                                <?php if (!empty($wd['admin_notes'])): ?>
                                    <span class="text-secondary"><?= htmlspecialchars($wd['admin_notes']) ?></span>
                                <?php endif; ?>
                                <?php if (empty($wd['tx_hash']) && empty($wd['admin_notes'])): ?>
                                    <span class="text-muted fst-italic">Pending review</span>
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
