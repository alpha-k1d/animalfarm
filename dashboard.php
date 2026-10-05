<?php
// dashboard.php - User Dashboard

$page_title = "Member Dashboard";
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/header.php';

// Refresh latest user record
$user = get_auth_user($pdo);

// Fetch recent transactions
$stmtTxn = $pdo->prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC LIMIT 5");
$stmtTxn->execute([$user['id']]);
$recent_transactions = $stmtTxn->fetchAll();

// Fetch recent task submissions
$stmtSub = $pdo->prepare("SELECT ts.*, t.title, t.category FROM task_submissions ts JOIN tasks t ON t.id = ts.task_id WHERE ts.user_id = ? ORDER BY ts.id DESC LIMIT 4");
$stmtSub->execute([$user['id']]);
$recent_submissions = $stmtSub->fetchAll();

// Active farm participations
$stmtPkgs = $pdo->prepare("SELECT up.*, fp.name AS package_name, fp.category FROM user_packages up JOIN farm_packages fp ON fp.id = up.package_id WHERE up.user_id = ? AND up.status = 'active'");
$stmtPkgs->execute([$user['id']]);
$active_packages = $stmtPkgs->fetchAll();

$referral_link = BASE_URL . '/register.php?ref=' . urlencode($user['referral_code']);
?>

<div class="container py-4">
    <!-- User Welcome Banner -->
    <div class="card border-0 shadow-sm rounded-4 bg-farm-primary text-white p-4 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
                <span class="badge bg-warning text-dark px-3 py-1 rounded-pill fw-bold mb-2">
                    Verified Farmer <i class="bi bi-patch-check-fill text-success"></i>
                </span>
                <h3 class="fw-bold mb-1">Hello, <?= htmlspecialchars($user['full_name']) ?>!</h3>
                <p class="text-white-70 mb-0 small">
                    <i class="bi bi-telephone-fill me-1"></i> <?= htmlspecialchars($user['phone']) ?> &nbsp;|&nbsp;
                    <i class="bi bi-envelope-fill me-1"></i> <?= htmlspecialchars($user['email']) ?>
                </p>
            </div>
            <div class="d-flex gap-2">
                <a href="/tasks.php" class="btn btn-warning rounded-pill px-4 py-2 fw-bold text-dark shadow-sm">
                    <i class="bi bi-plus-circle me-1"></i> Start Tasks
                </a>
                <a href="/withdraw.php" class="btn btn-outline-light rounded-pill px-3 py-2 fw-semibold">
                    <i class="bi bi-cash-stack me-1"></i> Withdraw
                </a>
            </div>
        </div>
    </div>

    <!-- Mandatory Financial Metrics Grid -->
    <div class="row g-3 mb-4">
        <!-- Available Rewards -->
        <div class="col-sm-6 col-lg-3">
            <div class="metric-card shadow-sm h-100">
                <div class="text-muted small text-uppercase fw-bold mb-1">Available Rewards</div>
                <div class="h3 fw-bold text-success mb-1"><?= money($user['wallet_balance']) ?></div>
                <div class="small text-muted">Ready for Mobile Money withdrawal</div>
            </div>
        </div>

        <!-- Total Earned -->
        <div class="col-sm-6 col-lg-3">
            <div class="metric-card info shadow-sm h-100">
                <div class="text-muted small text-uppercase fw-bold mb-1">Total Earned</div>
                <div class="h3 fw-bold text-primary mb-1"><?= money($user['total_earned']) ?></div>
                <div class="small text-muted">Lifetime approved task & referral rewards</div>
            </div>
        </div>

        <!-- Total Withdrawn -->
        <div class="col-sm-6 col-lg-3">
            <div class="metric-card warning shadow-sm h-100">
                <div class="text-muted small text-uppercase fw-bold mb-1">Total Withdrawn</div>
                <div class="h3 fw-bold text-dark mb-1"><?= money($user['total_withdrawn']) ?></div>
                <div class="small text-muted">Dispatched to your MoMo / Bitcoin wallet</div>
            </div>
        </div>

        <!-- Pending Rewards -->
        <div class="col-sm-6 col-lg-3">
            <div class="metric-card danger shadow-sm h-100">
                <div class="text-muted small text-uppercase fw-bold mb-1">Pending Rewards</div>
                <div class="h3 fw-bold text-warning mb-1"><?= money($user['pending_rewards']) ?></div>
                <div class="small text-muted">Submissions awaiting farm review</div>
            </div>
        </div>
    </div>

    <!-- Quick Action Navigation Hub -->
    <div class="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div class="d-flex justify-content-between align-items-center mb-2 px-2">
            <h6 class="fw-bold mb-0 text-dark"><i class="bi bi-grid-fill me-2 text-success"></i>Quick Access Actions</h6>
            <a href="/payment.php" class="btn btn-sm btn-outline-success rounded-pill fw-semibold"><i class="bi bi-wallet2 me-1"></i> Add Funds / Deposit</a>
        </div>
        <div class="row g-2 text-center">
            <div class="col-4 col-md-2">
                <a href="/tasks.php" class="card card-hover border-0 bg-light p-3 text-decoration-none rounded-3">
                    <i class="bi bi-check2-circle fs-3 text-success d-block mb-1"></i>
                    <span class="small fw-bold text-dark">Tasks</span>
                </a>
            </div>
            <div class="col-4 col-md-2">
                <a href="/farm.php" class="card card-hover border-0 bg-light p-3 text-decoration-none rounded-3">
                    <i class="bi bi-flower1 fs-3 text-primary d-block mb-1"></i>
                    <span class="small fw-bold text-dark">My Farm</span>
                </a>
            </div>
            <div class="col-4 col-md-2">
                <a href="/packages.php" class="card card-hover border-0 bg-light p-3 text-decoration-none rounded-3">
                    <i class="bi bi-box-seam fs-3 text-warning d-block mb-1"></i>
                    <span class="small fw-bold text-dark">Packages</span>
                </a>
            </div>
            <div class="col-4 col-md-2">
                <a href="/wallet.php" class="card card-hover border-0 bg-light p-3 text-decoration-none rounded-3">
                    <i class="bi bi-wallet2 fs-3 text-info d-block mb-1"></i>
                    <span class="small fw-bold text-dark">Wallet</span>
                </a>
            </div>
            <div class="col-4 col-md-2">
                <a href="/withdraw.php" class="card card-hover border-0 bg-light p-3 text-decoration-none rounded-3">
                    <i class="bi bi-cash-stack fs-3 text-danger d-block mb-1"></i>
                    <span class="small fw-bold text-dark">Withdraw</span>
                </a>
            </div>
            <div class="col-4 col-md-2">
                <a href="/referrals.php" class="card card-hover border-0 bg-light p-3 text-decoration-none rounded-3">
                    <i class="bi bi-people fs-3 text-secondary d-block mb-1"></i>
                    <span class="small fw-bold text-dark">Referrals</span>
                </a>
            </div>
        </div>
    </div>

    <div class="row g-4 mb-4">
        <!-- Recent Transactions -->
        <div class="col-lg-7">
            <div class="card border-0 shadow-sm rounded-4 h-100 bg-white">
                <div class="card-header bg-transparent border-0 p-4 pb-2 d-flex justify-content-between align-items-center">
                    <h5 class="fw-bold mb-0 text-dark">Recent Transactions</h5>
                    <a href="/wallet.php" class="btn btn-sm btn-link text-success fw-bold text-decoration-none">Full Ledger <i class="bi bi-arrow-right"></i></a>
                </div>
                <div class="card-body p-4 pt-0">
                    <?php if (empty($recent_transactions)): ?>
                        <div class="text-center py-4 text-muted small">
                            <i class="bi bi-receipt fs-1 d-block mb-2 text-secondary"></i>
                            No transactions recorded yet. Complete a task to earn rewards.
                        </div>
                    <?php else: ?>
                        <div class="table-responsive">
                            <table class="table align-middle table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Description</th>
                                        <th class="text-end">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($recent_transactions as $txn): ?>
                                    <tr>
                                        <td class="small text-muted"><?= date('M d, H:i', strtotime($txn['created_at'])) ?></td>
                                        <td>
                                            <span class="badge bg-light text-dark border small"><?= htmlspecialchars($txn['type']) ?></span>
                                        </td>
                                        <td class="small"><?= htmlspecialchars($txn['description']) ?></td>
                                        <td class="text-end fw-bold <?= in_array($txn['type'], ['Withdrawal']) ? 'text-danger' : 'text-success' ?>">
                                            <?= in_array($txn['type'], ['Withdrawal']) ? '-' : '+' ?><?= money($txn['amount']) ?>
                                        </td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Referral Code Box & Task Status -->
        <div class="col-lg-5">
            <!-- Referral Card -->
            <div class="card border-0 shadow-sm rounded-4 mb-4 bg-white p-4">
                <h5 class="fw-bold text-dark mb-1">Your Referral Program</h5>
                <p class="text-muted small mb-3">Earn <?= money(REFERRAL_REWARD) ?> for every invited farmer who verifies their Ghana phone and finishes their first task.</p>

                <div class="input-group mb-2">
                    <input type="text" class="form-control bg-light font-monospace" id="refLink" value="<?= htmlspecialchars($referral_link) ?>" readonly>
                    <button class="btn btn-outline-secondary" type="button" data-copy-target="refLink">Copy</button>
                </div>
                <small class="text-muted">Your Code: <strong class="text-dark"><?= htmlspecialchars($user['referral_code']) ?></strong></small>
            </div>

            <!-- Recent Submissions -->
            <div class="card border-0 shadow-sm rounded-4 bg-white p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="fw-bold text-dark mb-0">Your Recent Task Submissions</h5>
                    <a href="/tasks.php" class="btn btn-sm btn-link text-success fw-bold text-decoration-none">Browse Tasks</a>
                </div>

                <?php if (empty($recent_submissions)): ?>
                    <p class="text-muted small mb-0">You have not submitted any task proofs yet. Visit the tasks page to pick a farm assignment.</p>
                <?php else: ?>
                    <ul class="list-group list-group-flush small">
                        <?php foreach ($recent_submissions as $sub): 
                            $statusBadge = match($sub['status']) {
                                'approved' => 'bg-success',
                                'rejected' => 'bg-danger',
                                default => 'bg-warning text-dark'
                            };
                        ?>
                        <li class="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                            <div>
                                <span class="fw-bold text-dark d-block"><?= htmlspecialchars($sub['title']) ?></span>
                                <small class="text-muted"><?= htmlspecialchars($sub['category']) ?> &bull; <?= date('M d, Y', strtotime($sub['created_at'])) ?></small>
                            </div>
                            <div class="text-end">
                                <span class="badge <?= $statusBadge ?> rounded-pill mb-1"><?= ucfirst($sub['status']) ?></span>
                                <div class="fw-bold text-success"><?= money($sub['reward_amount']) ?></div>
                            </div>
                        </li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
