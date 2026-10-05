<?php
// admin/index.php - Administrator High-Level Operations Dashboard

$page_title = "Operations Dashboard";
require_once __DIR__ . '/includes/admin_header.php';

// Metrics aggregation
$total_users = (int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
$active_users = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE status = 'active'")->fetchColumn();
$unverified_users = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE phone_verified = 0")->fetchColumn();

// Financial metrics
$total_deposits = (float)$pdo->query("SELECT SUM(amount_ghs) FROM payment_transactions WHERE status = 'completed'")->fetchColumn();
$total_withdrawn = (float)$pdo->query("SELECT SUM(amount) FROM withdrawals WHERE status = 'paid'")->fetchColumn();
$pending_withdrawals = (float)$pdo->query("SELECT SUM(amount) FROM withdrawals WHERE status = 'pending'")->fetchColumn();

// Task stats
$total_tasks = (int)$pdo->query("SELECT COUNT(*) FROM tasks")->fetchColumn();
$active_tasks = (int)$pdo->query("SELECT COUNT(*) FROM tasks WHERE status = 'active'")->fetchColumn();
$pending_submissions = (int)$pdo->query("SELECT COUNT(*) FROM task_submissions WHERE status = 'pending'")->fetchColumn();

// Recent users
$stmtRecentUsers = $pdo->query("SELECT * FROM users ORDER BY id DESC LIMIT 5");
$recent_users = $stmtRecentUsers->fetchAll();

// Recent withdrawals
$stmtRecentWd = $pdo->query("SELECT w.*, u.full_name, u.phone AS user_phone FROM withdrawals w JOIN users u ON u.id = w.user_id ORDER BY w.id DESC LIMIT 5");
$recent_withdrawals = $stmtRecentWd->fetchAll();
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h3 class="fw-bold text-dark mb-0">Platform Overview</h3>
        <small class="text-muted">Live Ghana Operations & Reconciliation Hub</small>
    </div>
    <div class="d-flex gap-2">
        <a href="/admin/submissions.php" class="btn btn-warning text-dark fw-bold rounded-pill px-3 position-relative">
            <i class="bi bi-inbox-fill me-1"></i> Review Submissions
            <?php if ($pending_submissions > 0): ?>
                <span class="badge bg-danger rounded-pill ms-1"><?= $pending_submissions ?></span>
            <?php endif; ?>
        </a>
        <a href="/admin/withdrawals.php" class="btn btn-danger text-white fw-bold rounded-pill px-3">
            <i class="bi bi-cash-stack me-1"></i> Review Withdrawals
            <?php if ($pending_withdrawals > 0): ?>
                <span class="badge bg-white text-danger rounded-pill ms-1"><?= money($pending_withdrawals) ?></span>
            <?php endif; ?>
        </a>
    </div>
</div>

<!-- Key Performance Indicators -->
<div class="row g-3 mb-4">
    <!-- Total Users -->
    <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <small class="text-muted text-uppercase fw-bold">Total Farmers</small>
                <i class="bi bi-people-fill fs-4 text-success"></i>
            </div>
            <div class="h3 fw-bold text-dark mb-1"><?= $total_users ?></div>
            <small class="text-success"><i class="bi bi-check-circle me-1"></i> <?= $active_users ?> Active / Verified</small>
        </div>
    </div>

    <!-- Total Deposits -->
    <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <small class="text-muted text-uppercase fw-bold">Total Funded</small>
                <i class="bi bi-wallet2 fs-4 text-primary"></i>
            </div>
            <div class="h3 fw-bold text-primary mb-1"><?= money($total_deposits) ?></div>
            <small class="text-muted">Paystack MoMo & Bitcoin</small>
        </div>
    </div>

    <!-- Total Withdrawn -->
    <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <small class="text-muted text-uppercase fw-bold">Disbursed (Paid)</small>
                <i class="bi bi-cash fs-4 text-success"></i>
            </div>
            <div class="h3 fw-bold text-success mb-1"><?= money($total_withdrawn) ?></div>
            <small class="text-muted">Approved MoMo Payouts</small>
        </div>
    </div>

    <!-- Pending Withdrawals -->
    <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <small class="text-muted text-uppercase fw-bold">Pending Payouts</small>
                <i class="bi bi-clock-history fs-4 text-warning"></i>
            </div>
            <div class="h3 fw-bold text-warning mb-1"><?= money($pending_withdrawals) ?></div>
            <small class="text-muted"><a href="/admin/withdrawals.php" class="text-decoration-none">Process payouts &rarr;</a></small>
        </div>
    </div>
</div>

<div class="row g-4 mb-4">
    <!-- Pending Task Submissions Alert -->
    <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-dark mb-0">Pending Task Submissions</h5>
                <a href="/admin/submissions.php" class="btn btn-sm btn-link text-success fw-bold text-decoration-none">View All (<?= $pending_submissions ?>)</a>
            </div>

            <?php if ($pending_submissions === 0): ?>
                <div class="text-center py-4 text-muted small">
                    <i class="bi bi-check2-circle fs-1 text-success d-block mb-2"></i>
                    All submitted tasks have been reviewed. Good job!
                </div>
            <?php else: ?>
                <div class="alert alert-warning border-0 rounded-3 small mb-3">
                    <i class="bi bi-exclamation-circle me-1"></i> You have <strong><?= $pending_submissions ?></strong> submitted task proofs awaiting verification.
                </div>
                <a href="/admin/submissions.php" class="btn btn-farm-primary rounded-pill w-100 fw-bold py-2 shadow-sm">
                    Open Submissions Review Queue
                </a>
            <?php endif; ?>
        </div>
    </div>

    <!-- Pending Withdrawals Action Queue -->
    <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-dark mb-0">Pending Withdrawal Queue</h5>
                <a href="/admin/withdrawals.php" class="btn btn-sm btn-link text-danger fw-bold text-decoration-none">View All</a>
            </div>

            <?php if ($pending_withdrawals == 0): ?>
                <div class="text-center py-4 text-muted small">
                    <i class="bi bi-shield-check fs-1 text-success d-block mb-2"></i>
                    No pending withdrawals in queue.
                </div>
            <?php else: ?>
                <div class="alert alert-danger border-0 rounded-3 small mb-3">
                    <i class="bi bi-exclamation-triangle me-1"></i> Total pending payout amount: <strong><?= money($pending_withdrawals) ?></strong>
                </div>
                <a href="/admin/withdrawals.php" class="btn btn-danger rounded-pill w-100 fw-bold py-2 shadow-sm">
                    Process Mobile Money Disbursements
                </a>
            <?php endif; ?>
        </div>
    </div>
</div>

<!-- Recent Users Table -->
<div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold text-dark mb-0">Recent Farmer Registrations</h5>
        <a href="/admin/users.php" class="btn btn-sm btn-outline-secondary rounded-pill px-3">View All Users</a>
    </div>

    <div class="table-responsive">
        <table class="table align-middle table-hover mb-0">
            <thead>
                <tr>
                    <th>Joined</th>
                    <th>Name</th>
                    <th>Ghana Phone</th>
                    <th>Email</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($recent_users as $u): ?>
                <tr>
                    <td class="small text-muted"><?= date('M d, H:i', strtotime($u['created_at'])) ?></td>
                    <td class="fw-bold text-dark"><?= htmlspecialchars($u['full_name']) ?></td>
                    <td><code><?= htmlspecialchars($u['phone']) ?></code></td>
                    <td class="small text-muted"><?= htmlspecialchars($u['email']) ?></td>
                    <td class="fw-bold text-success"><?= money($u['wallet_balance']) ?></td>
                    <td>
                        <?php if ((int)$u['phone_verified'] === 1): ?>
                            <span class="badge bg-success rounded-pill px-2">Verified</span>
                        <?php else: ?>
                            <span class="badge bg-warning text-dark rounded-pill px-2">Unverified</span>
                        <?php endif; ?>
                    </td>
                    <td>
                        <a href="/admin/users.php?search=<?= urlencode($u['phone']) ?>" class="btn btn-sm btn-light border rounded-pill px-3">
                            Manage
                        </a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<?php require_once __DIR__ . '/includes/admin_footer.php'; ?>
