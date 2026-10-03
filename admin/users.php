<?php
// admin/users.php - Farmer Account Management & Balance Auditing

$page_title = "Manage Farmers";
require_once __DIR__ . '/includes/admin_header.php';

$search = sanitize($_GET['search'] ?? '');
$status_filter = sanitize($_GET['status'] ?? '');

// Handle user actions: balance adjustment & status change
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $action = sanitize($_POST['action'] ?? '');
    $user_id = (int)$_POST['user_id'];

    $stmtUser = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmtUser->execute([$user_id]);
    $u = $stmtUser->fetch();

    if ($u) {
        if ($action === 'toggle_status') {
            $new_status = ($u['status'] === 'suspended') ? 'active' : 'suspended';
            $pdo->prepare("UPDATE users SET status = ? WHERE id = ?")->execute([$new_status, $user_id]);
            redirect('/admin/users.php', 'info', "User #{$user_id} status updated to {$new_status}.");
        } elseif ($action === 'verify_phone') {
            $pdo->prepare("UPDATE users SET phone_verified = 1, status = 'active' WHERE id = ?")->execute([$user_id]);
            redirect('/admin/users.php', 'success', "User #{$user_id} phone verified manually.");
        } elseif ($action === 'adjust_balance') {
            $adjustment_type = sanitize($_POST['adjustment_type'] ?? 'credit');
            $amount = abs((float)($_POST['amount'] ?? 0));
            $reason = sanitize($_POST['reason'] ?? 'Admin balance adjustment');

            if ($amount > 0) {
                try {
                    $pdo->beginTransaction();

                    if ($adjustment_type === 'credit') {
                        $pdo->prepare("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?")
                            ->execute([$amount, $user_id]);
                        record_transaction($pdo, $user_id, 'Admin Adjustment', $amount, "Credit: {$reason}", 'completed');
                        create_notification($pdo, $user_id, 'Wallet Credited by Admin', "Your wallet was credited with " . money($amount) . ". Reason: {$reason}", 'payment', '/wallet.php');
                    } else {
                        $pdo->prepare("UPDATE users SET wallet_balance = GREATEST(0, wallet_balance - ?) WHERE id = ?")
                            ->execute([$amount, $user_id]);
                        record_transaction($pdo, $user_id, 'Admin Adjustment', $amount, "Debit: {$reason}", 'completed');
                        create_notification($pdo, $user_id, 'Wallet Debited by Admin', "Your wallet was debited by " . money($amount) . ". Reason: {$reason}", 'payment', '/wallet.php');
                    }

                    $pdo->commit();
                    redirect('/admin/users.php', 'success', "Balance adjusted by " . money($amount) . " successfully.");
                } catch (Exception $e) {
                    if ($pdo->inTransaction()) {
                        $pdo->rollBack();
                    }
                    redirect('/admin/users.php', 'danger', "Failed to adjust balance: " . $e->getMessage());
                }
            }
        }
    }
}

// Build query
$sql = "SELECT * FROM users WHERE 1=1";
$params = [];

if (!empty($search)) {
    $sql .= " AND (full_name LIKE ? OR phone LIKE ? OR email LIKE ? OR referral_code LIKE ?)";
    $like = "%{$search}%";
    $params = array_merge($params, [$like, $like, $like, $like]);
}

if (!empty($status_filter)) {
    $sql .= " AND status = ?";
    $params[] = $status_filter;
}

$sql .= " ORDER BY id DESC LIMIT 100";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$users = $stmt->fetchAll();
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h3 class="fw-bold text-dark mb-0">Farmer Accounts</h3>
        <small class="text-muted">Review balances, adjust funds, and audit Ghana telephone verifications</small>
    </div>
</div>

<!-- Search and filters -->
<div class="card border-0 shadow-sm rounded-4 bg-white p-3 mb-4">
    <form method="GET" action="/admin/users.php" class="row g-2 align-items-center">
        <div class="col-md-5">
            <input type="text" name="search" class="form-control rounded-pill px-3" placeholder="Search by name, phone (024...), email, or referral code..." value="<?= htmlspecialchars($search) ?>">
        </div>
        <div class="col-md-3">
            <select name="status" class="form-select rounded-pill px-3">
                <option value="">All Statuses</option>
                <option value="active" <?= $status_filter === 'active' ? 'selected' : '' ?>>Active</option>
                <option value="pending" <?= $status_filter === 'pending' ? 'selected' : '' ?>>Pending Verification</option>
                <option value="suspended" <?= $status_filter === 'suspended' ? 'selected' : '' ?>>Suspended</option>
            </select>
        </div>
        <div class="col-md-4 d-flex gap-2">
            <button type="submit" class="btn btn-farm-primary rounded-pill px-4 fw-semibold">Search</button>
            <?php if (!empty($search) || !empty($status_filter)): ?>
                <a href="/admin/users.php" class="btn btn-outline-secondary rounded-pill px-3">Reset</a>
            <?php endif; ?>
        </div>
    </form>
</div>

<!-- Users Table -->
<div class="card border-0 shadow-sm rounded-4 bg-white p-4">
    <?php if (empty($users)): ?>
        <div class="text-center py-5 text-muted small">
            No farmer accounts match your search criteria.
        </div>
    <?php else: ?>
        <div class="table-responsive">
            <table class="table align-middle table-hover mb-0">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Farmer Details</th>
                        <th>Ghana Phone</th>
                        <th>Wallet Balance</th>
                        <th>Total Earned</th>
                        <th>Withdrawn</th>
                        <th>Status</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($users as $u): ?>
                    <tr>
                        <td>#<?= $u['id'] ?></td>
                        <td>
                            <div class="fw-bold text-dark"><?= htmlspecialchars($u['full_name']) ?></div>
                            <small class="text-muted"><?= htmlspecialchars($u['email']) ?></small>
                            <div><code class="small text-secondary">Ref: <?= htmlspecialchars($u['referral_code']) ?></code></div>
                        </td>
                        <td>
                            <span class="font-monospace fw-bold text-dark"><?= htmlspecialchars($u['phone']) ?></span>
                            <?php if ((int)$u['phone_verified'] === 1): ?>
                                <span class="badge bg-success bg-opacity-10 text-success d-block small mt-1"><i class="bi bi-shield-check"></i> Verified</span>
                            <?php else: ?>
                                <span class="badge bg-warning text-dark d-block small mt-1">Unverified</span>
                            <?php endif; ?>
                        </td>
                        <td class="fw-bold text-success fs-6">
                            <?= money($u['wallet_balance']) ?>
                            <?php if ((float)$u['pending_rewards'] > 0): ?>
                                <small class="text-warning d-block" style="font-size: 0.72rem;">(Pending: <?= money($u['pending_rewards']) ?>)</small>
                            <?php endif; ?>
                        </td>
                        <td class="small text-muted"><?= money($u['total_earned']) ?></td>
                        <td class="small text-muted"><?= money($u['total_withdrawn']) ?></td>
                        <td>
                            <?php if ($u['status'] === 'active'): ?>
                                <span class="badge bg-success rounded-pill px-3">Active</span>
                            <?php elseif ($u['status'] === 'suspended'): ?>
                                <span class="badge bg-danger rounded-pill px-3">Suspended</span>
                            <?php else: ?>
                                <span class="badge bg-warning text-dark rounded-pill px-3">Pending</span>
                            <?php endif; ?>
                        </td>
                        <td class="text-end">
                            <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-2" data-bs-toggle="modal" data-bs-target="#adjModal<?= $u['id'] ?>" title="Adjust Balance">
                                <i class="bi bi-cash-stack"></i> Adjust
                            </button>

                            <?php if ((int)$u['phone_verified'] === 0): ?>
                                <form method="POST" action="/admin/users.php" class="d-inline">
                                    <?= csrf_field() ?>
                                    <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                                    <input type="hidden" name="action" value="verify_phone">
                                    <button type="submit" class="btn btn-sm btn-outline-success rounded-pill px-2" title="Verify Phone Manually">
                                        <i class="bi bi-check2"></i> Verify
                                    </button>
                                </form>
                            <?php endif; ?>

                            <form method="POST" action="/admin/users.php" class="d-inline">
                                <?= csrf_field() ?>
                                <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                                <input type="hidden" name="action" value="toggle_status">
                                <button type="submit" class="btn btn-sm <?= $u['status'] === 'suspended' ? 'btn-success' : 'btn-outline-danger' ?> rounded-pill px-2" onclick="return confirm('Change status for this user?');">
                                    <?= $u['status'] === 'suspended' ? 'Unsuspend' : 'Suspend' ?>
                                </button>
                            </form>
                        </td>
                    </tr>

                    <!-- Adjust Balance Modal -->
                    <div class="modal fade" id="adjModal<?= $u['id'] ?>" tabindex="-1" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content rounded-4 border-0 shadow">
                                <div class="modal-header bg-dark text-white">
                                    <h5 class="modal-title fw-bold">Adjust Balance: <?= htmlspecialchars($u['full_name']) ?></h5>
                                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                                </div>
                                <div class="modal-body p-4 text-start">
                                    <div class="mb-3">
                                        <span class="text-muted small">Current Balance:</span>
                                        <span class="fw-bold fs-5 text-success ms-2"><?= money($u['wallet_balance']) ?></span>
                                    </div>

                                    <form method="POST" action="/admin/users.php">
                                        <?= csrf_field() ?>
                                        <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                                        <input type="hidden" name="action" value="adjust_balance">

                                        <div class="mb-3">
                                            <label class="form-label small fw-semibold text-muted">Adjustment Type</label>
                                            <select name="adjustment_type" class="form-select rounded-3">
                                                <option value="credit">Credit (Add Funds)</option>
                                                <option value="debit">Debit (Deduct Funds)</option>
                                            </select>
                                        </div>

                                        <div class="mb-3">
                                            <label class="form-label small fw-semibold text-muted">Amount (GH₵)</label>
                                            <input type="number" step="0.01" min="0.01" name="amount" class="form-control rounded-3" placeholder="50.00" required>
                                        </div>

                                        <div class="mb-4">
                                            <label class="form-label small fw-semibold text-muted">Audit Reason (recorded in ledger)</label>
                                            <input type="text" name="reason" class="form-control rounded-3" placeholder="e.g. Field assignment bonus or manual correction" required>
                                        </div>

                                        <button type="submit" class="btn btn-farm-primary w-100 rounded-pill fw-bold">
                                            Submit Adjustment
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
