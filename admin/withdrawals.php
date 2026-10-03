<?php
// admin/withdrawals.php - Withdrawal Payout Dispatch & Settlement Engine

$page_title = "Manage Withdrawals";
require_once __DIR__ . '/includes/admin_header.php';

$filter_status = sanitize($_GET['status'] ?? 'pending');

// Handle actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $withdrawal_id = (int)$_POST['withdrawal_id'];
    $action = sanitize($_POST['action'] ?? '');
    $tx_hash = sanitize($_POST['tx_hash'] ?? '');
    $admin_notes = sanitize($_POST['admin_notes'] ?? '');

    $stmtWd = $pdo->prepare("SELECT w.*, u.full_name, u.phone AS user_phone FROM withdrawals w JOIN users u ON u.id = w.user_id WHERE w.id = ?");
    $stmtWd->execute([$withdrawal_id]);
    $wd = $stmtWd->fetch();

    if ($wd) {
        $amount = (float)$wd['amount'];
        $userId = (int)$wd['user_id'];

        if ($action === 'processing' && $wd['status'] === 'pending') {
            $pdo->prepare("UPDATE withdrawals SET status = 'processing', admin_notes = ? WHERE id = ?")
                ->execute(['Disbursement in queue with telecom provider', $withdrawal_id]);

            redirect("/admin/withdrawals.php?status={$filter_status}", 'info', "Withdrawal #{$withdrawal_id} marked as processing.");
        } elseif ($action === 'pay' && in_array($wd['status'], ['pending', 'processing'])) {
            try {
                $pdo->beginTransaction();

                // 1. Mark withdrawal as paid
                $stmtUpdate = $pdo->prepare("UPDATE withdrawals SET status = 'paid', tx_hash = ?, admin_notes = ?, processed_at = NOW() WHERE id = ?");
                $stmtUpdate->execute([$tx_hash ?: ('MOMO' . date('YmdHis')), $admin_notes ?: 'Dispatched via telecom mobile money gateway', $withdrawal_id]);

                // 2. Increment user's total_withdrawn
                $pdo->prepare("UPDATE users SET total_withdrawn = total_withdrawn + ? WHERE id = ?")
                    ->execute([$amount, $userId]);

                // 3. Update pending transaction to completed
                $pdo->prepare("UPDATE transactions SET status = 'completed' WHERE user_id = ? AND type = 'Withdrawal' AND status = 'pending' ORDER BY id DESC LIMIT 1")
                    ->execute([$userId]);

                // 4. Send notification
                create_notification(
                    $pdo,
                    $userId,
                    'Withdrawal Dispatched Successfully!',
                    "Your payout of " . money($amount) . " to {$wd['method']} ({$wd['account_number']}) has been dispatched. Transaction Ref: " . ($tx_hash ?: $wd['reference']),
                    'withdrawal',
                    '/withdrawal-history.php'
                );

                $pdo->commit();
                redirect("/admin/withdrawals.php?status={$filter_status}", 'success', "Withdrawal #{$withdrawal_id} marked as PAID and settled!");
            } catch (Exception $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                error_log("Payout error: " . $e->getMessage());
                redirect("/admin/withdrawals.php?status={$filter_status}", 'danger', 'Failed to mark as paid: ' . $e->getMessage());
            }
        } elseif ($action === 'reject' && in_array($wd['status'], ['pending', 'processing'])) {
            try {
                $pdo->beginTransaction();

                // 1. Mark withdrawal as rejected
                $stmtUpdate = $pdo->prepare("UPDATE withdrawals SET status = 'rejected', admin_notes = ?, processed_at = NOW() WHERE id = ?");
                $stmtUpdate->execute([$admin_notes ?: 'Account details could not be validated', $withdrawal_id]);

                // 2. Refund deducted balance back to user
                $pdo->prepare("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?")
                    ->execute([$amount, $userId]);

                // 3. Record refund transaction in ledger
                record_transaction($pdo, $userId, 'Refund', $amount, "Refund for rejected withdrawal request #{$withdrawal_id}", 'completed');

                // 4. Send notification
                create_notification(
                    $pdo,
                    $userId,
                    'Withdrawal Request Cancelled & Refunded',
                    "Your payout request of " . money($amount) . " could not be processed. Reason: " . ($admin_notes ?: 'Account details mismatch') . ". The full amount has been refunded back to your wallet.",
                    'withdrawal',
                    '/wallet.php'
                );

                $pdo->commit();
                redirect("/admin/withdrawals.php?status={$filter_status}", 'warning', "Withdrawal #{$withdrawal_id} rejected and funds refunded to user.");
            } catch (Exception $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                error_log("Rejection error: " . $e->getMessage());
                redirect("/admin/withdrawals.php?status={$filter_status}", 'danger', 'Failed to reject withdrawal: ' . $e->getMessage());
            }
        }
    }
}

// Fetch withdrawals
$sql = "SELECT w.*, u.full_name, u.phone AS user_phone FROM withdrawals w JOIN users u ON u.id = w.user_id";
if (!empty($filter_status) && in_array($filter_status, ['pending', 'processing', 'paid', 'rejected'])) {
    $sql .= " WHERE w.status = " . $pdo->quote($filter_status);
}
$sql .= " ORDER BY w.id DESC LIMIT 100";

$withdrawals = $pdo->query($sql)->fetchAll();
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h3 class="fw-bold text-dark mb-0">Withdrawal Disbursements</h3>
        <small class="text-muted">Manage mobile money transfers and blockchain settlements</small>
    </div>

    <!-- Filter status pills -->
    <div class="btn-group rounded-pill shadow-sm" role="group">
        <a href="/admin/withdrawals.php?status=pending" class="btn btn-sm <?= $filter_status === 'pending' ? 'btn-danger text-white fw-bold' : 'btn-light border' ?>">
            Pending Queue
        </a>
        <a href="/admin/withdrawals.php?status=processing" class="btn btn-sm <?= $filter_status === 'processing' ? 'btn-info text-dark fw-bold' : 'btn-light border' ?>">
            Processing
        </a>
        <a href="/admin/withdrawals.php?status=paid" class="btn btn-sm <?= $filter_status === 'paid' ? 'btn-success fw-bold' : 'btn-light border' ?>">
            Paid
        </a>
        <a href="/admin/withdrawals.php?status=rejected" class="btn btn-sm <?= $filter_status === 'rejected' ? 'btn-secondary fw-bold' : 'btn-light border' ?>">
            Rejected
        </a>
        <a href="/admin/withdrawals.php?status=all" class="btn btn-sm <?= $filter_status === 'all' ? 'btn-dark fw-bold' : 'btn-light border' ?>">
            All
        </a>
    </div>
</div>

<div class="card border-0 shadow-sm rounded-4 bg-white p-4">
    <?php if (empty($withdrawals)): ?>
        <div class="text-center py-5 text-muted small">
            <i class="bi bi-wallet2 fs-1 d-block mb-3 text-secondary"></i>
            No withdrawal records found under status "<?= htmlspecialchars($filter_status) ?>".
        </div>
    <?php else: ?>
        <div class="table-responsive">
            <table class="table align-middle table-hover mb-0">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Farmer</th>
                        <th>Method</th>
                        <th>Beneficiary Details</th>
                        <th>Amount (GH₵)</th>
                        <th>Status</th>
                        <th class="text-end">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($withdrawals as $wd): 
                        $statusBadge = match($wd['status']) {
                            'paid' => 'bg-success',
                            'processing' => 'bg-info text-dark',
                            'rejected' => 'bg-danger',
                            default => 'bg-warning text-dark'
                        };
                    ?>
                    <tr>
                        <td>#<?= $wd['id'] ?></td>
                        <td class="small text-muted"><?= date('M d, H:i', strtotime($wd['created_at'])) ?></td>
                        <td>
                            <div class="fw-bold text-dark"><?= htmlspecialchars($wd['full_name']) ?></div>
                            <small class="text-muted"><?= htmlspecialchars($wd['user_phone']) ?></small>
                        </td>
                        <td>
                            <span class="badge bg-light text-dark border"><?= htmlspecialchars($wd['method']) ?></span>
                        </td>
                        <td>
                            <div class="fw-semibold text-dark small"><?= htmlspecialchars($wd['account_name']) ?></div>
                            <code class="small text-muted"><?= htmlspecialchars($wd['account_number']) ?></code>
                        </td>
                        <td class="fw-bold text-dark fs-6">
                            <?= money($wd['amount']) ?>
                        </td>
                        <td>
                            <span class="badge <?= $statusBadge ?> rounded-pill px-3 py-1">
                                <?= ucfirst($wd['status']) ?>
                            </span>
                        </td>
                        <td class="text-end">
                            <?php if (in_array($wd['status'], ['pending', 'processing'])): ?>
                                <button type="button" class="btn btn-sm btn-farm-primary rounded-pill px-3 fw-semibold" data-bs-toggle="modal" data-bs-target="#actionModal<?= $wd['id'] ?>">
                                    Process Payout
                                </button>
                            <?php else: ?>
                                <small class="text-muted d-block">
                                    <?= htmlspecialchars($wd['tx_hash'] ?: $wd['admin_notes'] ?: 'Settled') ?>
                                </small>
                            <?php endif; ?>
                        </td>
                    </tr>

                    <!-- Process Modal -->
                    <div class="modal fade" id="actionModal<?= $wd['id'] ?>" tabindex="-1" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content rounded-4 border-0 shadow">
                                <div class="modal-header bg-dark text-white">
                                    <h5 class="modal-title fw-bold">Process Payout #<?= $wd['id'] ?></h5>
                                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                                </div>
                                <div class="modal-body p-4">
                                    <div class="bg-light p-3 rounded-3 mb-3 border small">
                                        <div class="d-flex justify-content-between mb-1">
                                            <span class="text-muted">Farmer:</span>
                                            <strong class="text-dark"><?= htmlspecialchars($wd['full_name']) ?></strong>
                                        </div>
                                        <div class="d-flex justify-content-between mb-1">
                                            <span class="text-muted">Payout Channel:</span>
                                            <strong class="text-dark"><?= htmlspecialchars($wd['method']) ?></strong>
                                        </div>
                                        <div class="d-flex justify-content-between mb-1">
                                            <span class="text-muted">Account Number / BTC:</span>
                                            <code class="text-dark fw-bold"><?= htmlspecialchars($wd['account_number']) ?></code>
                                        </div>
                                        <div class="d-flex justify-content-between mb-1">
                                            <span class="text-muted">Beneficiary Name:</span>
                                            <strong class="text-dark"><?= htmlspecialchars($wd['account_name']) ?></strong>
                                        </div>
                                        <div class="d-flex justify-content-between border-top pt-1 mt-1">
                                            <span class="text-muted">Amount to Send:</span>
                                            <span class="fw-bold text-success fs-5"><?= money($wd['amount']) ?></span>
                                        </div>
                                    </div>

                                    <!-- 1. Mark as Paid Form -->
                                    <form method="POST" action="/admin/withdrawals.php?status=<?= urlencode($filter_status) ?>" class="mb-3 p-3 border rounded-3 bg-white">
                                        <?= csrf_field() ?>
                                        <input type="hidden" name="withdrawal_id" value="<?= $wd['id'] ?>">
                                        <input type="hidden" name="action" value="pay">
                                        <h6 class="fw-bold text-success mb-2">Option A: Confirm Payout Sent</h6>
                                        <div class="mb-2">
                                            <label class="form-label small text-muted">MoMo Transaction ID or Crypto Hash</label>
                                            <input type="text" name="tx_hash" class="form-control form-control-sm rounded-3" placeholder="e.g. MOMO9381048102 or btc_hash" required>
                                        </div>
                                        <button type="submit" class="btn btn-success btn-sm w-100 rounded-pill fw-bold">
                                            [Verified] Confirm Paid (Dispatched)
                                        </button>
                                    </form>

                                    <!-- 2. Reject & Refund Form -->
                                    <form method="POST" action="/admin/withdrawals.php?status=<?= urlencode($filter_status) ?>" class="p-3 border rounded-3 bg-white">
                                        <?= csrf_field() ?>
                                        <input type="hidden" name="withdrawal_id" value="<?= $wd['id'] ?>">
                                        <input type="hidden" name="action" value="reject">
                                        <h6 class="fw-bold text-danger mb-2">Option B: Reject & Refund</h6>
                                        <div class="mb-2">
                                            <label class="form-label small text-muted">Rejection Reason</label>
                                            <input type="text" name="admin_notes" class="form-control form-control-sm rounded-3" placeholder="e.g. Name mismatch or SIM not registered" required>
                                        </div>
                                        <button type="submit" class="btn btn-outline-danger btn-sm w-100 rounded-pill fw-bold">
                                            [Reject] Reject & Refund Funds to User
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/admin_footer.php'; ?>
