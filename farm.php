<?php
// farm.php - User's Active Farm Activities & Participations

$page_title = "My Farm & Participations";
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/header.php';

$user = get_auth_user($pdo);

// Fetch active user packages
$stmt = $pdo->prepare("SELECT up.*, fp.name AS package_name, fp.category, fp.image, fp.duration_days, fp.description 
                       FROM user_packages up 
                       JOIN farm_packages fp ON fp.id = up.package_id 
                       WHERE up.user_id = ? 
                       ORDER BY up.id DESC");
$stmt->execute([$user['id']]);
$my_packages = $stmt->fetchAll();

// Completed task stats
$stmtTaskStats = $pdo->prepare("SELECT COUNT(*) AS total_completed, SUM(reward_amount) AS total_task_rewards 
                                FROM task_submissions 
                                WHERE user_id = ? AND status = 'approved'");
$stmtTaskStats->execute([$user['id']]);
$task_stats = $stmtTaskStats->fetch();
?>

<div class="container py-4">
    <!-- Header -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
                <span class="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-1 rounded-pill mb-2">
                    Agricultural Management Hub
                </span>
                <h3 class="fw-bold text-dark mb-1">My Farm Overview</h3>
                <p class="text-muted small mb-0">Track your active farm units, growth cycles, and approved field assignments.</p>
            </div>
            <div class="d-flex gap-2">
                <a href="/packages.php" class="btn btn-outline-success rounded-pill px-3 py-2 fw-semibold">
                    <i class="bi bi-box-seam me-1"></i> Browse Packages
                </a>
                <a href="/tasks.php" class="btn btn-farm-primary rounded-pill px-3 py-2 fw-semibold">
                    <i class="bi bi-plus-circle me-1"></i> New Tasks
                </a>
            </div>
        </div>
    </div>

    <!-- Stats row -->
    <div class="row g-3 mb-4">
        <div class="col-sm-6 col-lg-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <small class="text-muted text-uppercase fw-bold">Active Units</small>
                <div class="h3 fw-bold text-dark mb-0"><?= count($my_packages) ?></div>
                <small class="text-muted">Enrolled farm cycles</small>
            </div>
        </div>
        <div class="col-sm-6 col-lg-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <small class="text-muted text-uppercase fw-bold">Completed Tasks</small>
                <div class="h3 fw-bold text-success mb-0"><?= (int)($task_stats['total_completed'] ?? 0) ?></div>
                <small class="text-muted">Approved submissions</small>
            </div>
        </div>
        <div class="col-sm-6 col-lg-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <small class="text-muted text-uppercase fw-bold">Task Rewards Earned</small>
                <div class="h3 fw-bold text-primary mb-0"><?= money($task_stats['total_task_rewards'] ?? 0) ?></div>
                <small class="text-muted">Direct task earnings</small>
            </div>
        </div>
        <div class="col-sm-6 col-lg-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <small class="text-muted text-uppercase fw-bold">Rewards Wallet</small>
                <div class="h3 fw-bold text-success mb-0"><?= money($user['wallet_balance']) ?></div>
                <small class="text-muted"><a href="/withdraw.php" class="text-decoration-none text-success">Request payout &rarr;</a></small>
            </div>
        </div>
    </div>

    <!-- Active Farm Packages -->
    <h4 class="fw-bold text-dark mb-3">Enrolled Farm Units & Cycles</h4>

    <?php if (empty($my_packages)): ?>
        <div class="card border-0 shadow-sm rounded-4 bg-white p-5 text-center mb-4">
            <span class="fs-1 d-block mb-3"></span>
            <h5 class="fw-bold text-dark">No Active Farm Packages Enrolled</h5>
            <p class="text-muted small max-w-500 mx-auto mb-4">
                Support poultry flocks, catfish ponds, or crop plots to receive regular photo updates, input allocations, and farm produce allotments upon harvest.
            </p>
            <a href="/packages.php" class="btn btn-farm-primary rounded-pill px-4 py-2 mx-auto fw-bold shadow-sm">
                Explore Available Farm Packages
            </a>
        </div>
    <?php else: ?>
        <div class="row g-4 mb-5">
            <?php foreach ($my_packages as $pkg): 
                $daysTotal = max(1, (int)$pkg['duration_days']);
                $daysElapsed = max(0, min($daysTotal, (int)((time() - strtotime($pkg['start_date'])) / 86400)));
                $pct = round(($daysElapsed / $daysTotal) * 100);
            ?>
            <div class="col-lg-6">
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white p-4">
                    <div class="d-flex gap-3 align-items-center mb-3">
                        <img src="<?= htmlspecialchars($pkg['image']) ?>" alt="<?= htmlspecialchars($pkg['package_name']) ?>" class="rounded-3" style="width: 80px; height: 80px; object-fit: cover;">
                        <div>
                            <span class="category-pill mb-1 d-inline-block"><?= htmlspecialchars($pkg['category']) ?></span>
                            <h5 class="fw-bold text-dark mb-0"><?= htmlspecialchars($pkg['package_name']) ?></h5>
                            <small class="text-muted">Enrolled on <?= date('M d, Y', strtotime($pkg['start_date'])) ?></small>
                        </div>
                    </div>

                    <div class="mb-3">
                        <div class="d-flex justify-content-between small text-muted mb-1">
                            <span>Cycle Progress (<?= $daysElapsed ?> of <?= $daysTotal ?> days)</span>
                            <span class="fw-bold text-dark"><?= $pct ?>%</span>
                        </div>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar bg-success" role="progressbar" style="width: <?= $pct ?>%;"></div>
                        </div>
                    </div>

                    <div class="row g-2 bg-light p-3 rounded-3 small text-muted mb-3 border">
                        <div class="col-6">
                            <span>Start Date:</span> <strong class="text-dark d-block"><?= htmlspecialchars($pkg['start_date']) ?></strong>
                        </div>
                        <div class="col-6">
                            <span>Target Harvest:</span> <strong class="text-dark d-block"><?= htmlspecialchars($pkg['end_date']) ?></strong>
                        </div>
                        <div class="col-12 mt-2">
                            <span>Status:</span> <span class="badge bg-success text-white rounded-pill px-2">Active Cycle</span>
                        </div>
                    </div>

                    <div class="d-flex gap-2">
                        <a href="/tasks.php?category=<?= urlencode($pkg['category']) ?>" class="btn btn-outline-success btn-sm rounded-pill flex-grow-1 fw-semibold">
                            Complete <?= htmlspecialchars($pkg['category']) ?> Tasks
                        </a>
                        <a href="/contact.php" class="btn btn-light btn-sm border rounded-pill px-3">
                            Farm Hub Inquiry
                        </a>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
