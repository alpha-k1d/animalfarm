<?php
// wallet.php - Member Wallet & Financial Ledger

$page_title = "Rewards Wallet & Ledger";
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/header.php';

$user = get_auth_user($pdo);

// Pending withdrawals sum
$stmtPendingWd = $pdo->prepare("SELECT SUM(amount) FROM withdrawals WHERE user_id = ? AND status IN ('pending', 'processing')");
$stmtPendingWd->execute([$user['id']]);
$pending_withdrawals = (float)$stmtPendingWd->fetchColumn();

// Filter transaction types
$type_filter = sanitize($_GET['type'] ?? '');
$sql = "SELECT * FROM transactions WHERE user_id = ?";
$params = [$user['id']];

if (!empty($type_filter)) {
    $sql .= " AND type = ?";
    $params[] = $type_filter;
}
$sql .= " ORDER BY id DESC LIMIT 50";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$transactions = $stmt->fetchAll();

$transaction_types = ['Task Reward', 'Referral Reward', 'Purchase', 'Withdrawal', 'Refund', 'Admin Adjustment'];
?>

<div class="container py-4">
    <!-- Header -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
                <span class="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-1 rounded-pill mb-2">
                    Official Ghana Cedi (GH₵) Wallet
                </span>
                <h3 class="fw-bold text-dark mb-1">Rewards Wallet</h3>
                <p class="text-muted small mb-0">Track all your task earnings, mobile money withdrawals, and participation records.</p>
            </div>
            <div class="d-flex gap-2">
                <a href="/payment.php" class="btn btn-outline-success rounded-pill px-4 py-2 fw-semibold">
                    <i class="bi bi-wallet2 me-1"></i> Add Funds
                </a>
                <a href="/withdraw.php" class="btn btn-farm-primary rounded-pill px-4 py-2 fw-bold shadow-sm">
                    <i class="bi bi-cash-stack me-1"></i> Request Withdrawal
                </a>
            </div>
        </div>
    </div>

    <!-- Wallet Metric Cards -->
    <div class="row g-3 mb-4">
        <!-- Available Rewards -->
        <div class="col-sm-6 col-lg-3">
            <div class="metric-card shadow-sm h-100">
                <div class="text-muted small text-uppercase fw-bold mb-1">Available Rewards</div>
                <div class="h3 fw-bold text-success mb-1"><?= money($user['wallet_balance']) ?></div>
                <div class="small text-muted">Eligible for instant withdrawal</div>
            </div>
        </div>

        <!-- Total Earned -->
        <div class="col-sm-6 col-lg-3">
            <div class="metric-card info shadow-sm h-100">
                <div class="text-muted small text-uppercase fw-bold mb-1">Total Earned</div>
                <div class="h3 fw-bold text-primary mb-1"><?= money($user['total_earned']) ?></div>
                <div class="small text-muted">Lifetime approved rewards</div>
            </div>
        </div>

        <!-- Total Withdrawn -->
        <div class="col-sm-6 col-lg-3">
            <div class="metric-card warning shadow-sm h-100">
                <div class="text-muted small text-uppercase fw-bold mb-1">Total Withdrawn</div>
                <div class="h3 fw-bold text-dark mb-1"><?= money($user['total_withdrawn']) ?></div>
                <div class="small text-muted"><a href="/withdrawal-history.php" class="text-decoration-none">View history &rarr;</a></div>
            </div>
        </div>

        <!-- Pending Withdrawals -->
        <div class="col-sm-6 col-lg-3">
            <div class="metric-card danger shadow-sm h-100">
                <div class="text-muted small text-uppercase fw-bold mb-1">Pending Withdrawals</div>
                <div class="h3 fw-bold text-warning mb-1"><?= money($pending_withdrawals) ?></div>
                <div class="small text-muted">Awaiting MoMo dispatch</div>
            </div>
        </div>
    </div>

    <!-- Transactions Ledger -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
            <div>
                <h5 class="fw-bold text-dark mb-1">Transaction History</h5>
                <p class="text-muted small mb-0">Transparent double-entry ledger of all your reward credits and debits.</p>
            </div>

            <!-- Filter Type dropdown -->
            <form method="GET" action="/wallet.php" class="d-flex gap-2">
                <select name="type" class="form-select form-select-sm rounded-pill px-3" onchange="this.form.submit()">
                    <option value="">All Transaction Types</option>
                    <?php foreach ($transaction_types as $t): ?>
                        <option value="<?= htmlspecialchars($t) ?>" <?= $type_filter === $t ? 'selected' : '' ?>><?= htmlspecialchars($t) ?></option>
                    <?php endforeach; ?>
                </select>
                <?php if (!empty($type_filter)): ?>
                    <a href="/wallet.php" class="btn btn-sm btn-outline-secondary rounded-pill">Reset</a>
                <?php endif; ?>
            </form>
        </div>

        <?php if (empty($transactions)): ?>
            <div class="text-center py-5 text-muted small">
                <i class="bi bi-receipt fs-1 d-block mb-3 text-secondary"></i>
                No transaction records found matching your criteria.
            </div>
        <?php else: ?>
            <div class="table-responsive">
                <table class="table align-middle table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Date & Time</th>
                            <th>Reference</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th class="text-end">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($transactions as $txn): 
                            $isCredit = !in_array($txn['type'], ['Withdrawal', 'Purchase']);
                        ?>
                        <tr>
                            <td class="small text-muted">
                                <?= date('M d, Y H:i', strtotime($txn['created_at'])) ?>
                            </td>
                            <td>
                                <code class="small text-dark"><?= htmlspecialchars($txn['transaction_reference']) ?></code>
                            </td>
                            <td>
                                <span class="badge bg-light text-dark border small"><?= htmlspecialchars($txn['type']) ?></span>
                            </td>
                            <td class="small text-muted">
                                <?= htmlspecialchars($txn['description']) ?>
                            </td>
                            <td>
                                <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-2">Completed</span>
                            </td>
                            <td class="text-end fw-bold <?= $isCredit ? 'text-success' : 'text-danger' ?>">
                                <?= $isCredit ? '+' : '-' ?><?= money($txn['amount']) ?>
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
