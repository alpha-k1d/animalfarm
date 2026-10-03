<?php
// tasks.php - Agricultural Tasks Directory

$page_title = "Agricultural Tasks Directory";
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/functions.php';

$auth_user = get_auth_user($pdo);
$selected_category = sanitize($_GET['category'] ?? '');

$sql = "SELECT t.*, 
        (SELECT COUNT(*) FROM task_submissions WHERE task_id = t.id AND user_id = ?) AS user_submitted_count
        FROM tasks t WHERE t.status = 'active'";
$params = [$auth_user ? $auth_user['id'] : 0];

if (!empty($selected_category)) {
    $sql .= " AND t.category = ?";
    $params[] = $selected_category;
}

$sql .= " ORDER BY t.id DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$tasks = $stmt->fetchAll();

$categories = ['Poultry', 'Goat Farming', 'Cattle Farming', 'Pig Farming', 'Fish Farming', 'Crop Farming', 'General Farm Care'];

require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-4">
    <!-- Header banner -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
        <div class="row align-items-center g-3">
            <div class="col-lg-8">
                <span class="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-1 rounded-pill mb-2">
                    Verified Agro-Tasks
                </span>
                <h3 class="fw-bold text-dark mb-1">Available Farm Tasks</h3>
                <p class="text-muted mb-0 small">
                    Complete legitimate daily chores, inspection logs, and farm survey records to earn eligible rewards credited in Ghana Cedi (GH₵).
                </p>
            </div>
            <div class="col-lg-4 text-lg-end">
                <?php if ($auth_user): ?>
                    <div class="bg-light p-3 rounded-3 text-start d-inline-block border">
                        <small class="text-muted d-block">Your Rewards Balance:</small>
                        <span class="fs-4 fw-bold text-success"><?= money($auth_user['wallet_balance']) ?></span>
                    </div>
                <?php else: ?>
                    <a href="/register.php" class="btn btn-farm-primary rounded-pill px-4 fw-bold shadow-sm">
                        Register to Earn Rewards
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <!-- Category Filter Pills -->
    <div class="d-flex flex-wrap gap-2 mb-4">
        <a href="/tasks.php" class="btn btn-sm rounded-pill px-3 fw-semibold <?= empty($selected_category) ? 'btn-success' : 'btn-light border text-dark' ?>">
            All Categories
        </a>
        <?php foreach ($categories as $cat): ?>
            <a href="/tasks.php?category=<?= urlencode($cat) ?>" class="btn btn-sm rounded-pill px-3 fw-semibold <?= ($selected_category === $cat) ? 'btn-success' : 'btn-light border text-dark' ?>">
                <?= htmlspecialchars($cat) ?>
            </a>
        <?php endforeach; ?>
    </div>

    <!-- Tasks Grid -->
    <?php if (empty($tasks)): ?>
        <div class="card border-0 shadow-sm rounded-4 bg-white p-5 text-center">
            <i class="bi bi-calendar2-x fs-1 text-muted d-block mb-3"></i>
            <h5 class="fw-bold text-dark">No Active Tasks in this Category</h5>
            <p class="text-muted small">New agricultural tasks are scheduled regularly by farm supervisors. Please check back shortly.</p>
            <a href="/tasks.php" class="btn btn-outline-success rounded-pill px-4 py-2 mx-auto fw-semibold">View All Tasks</a>
        </div>
    <?php else: ?>
        <div class="row g-4">
            <?php foreach ($tasks as $task): 
                $alreadySubmitted = (int)($task['user_submitted_count'] ?? 0) > 0;
            ?>
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 border-0 shadow-sm rounded-4 p-4 card-hover bg-white d-flex flex-column justify-content-between">
                    <div>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="category-pill"><?= htmlspecialchars($task['category']) ?></span>
                            <span class="badge bg-success fs-6 fw-bold px-3 py-1 rounded-pill"><?= money($task['reward']) ?></span>
                        </div>
                        <h5 class="fw-bold text-dark mb-2"><?= htmlspecialchars($task['title']) ?></h5>
                        <p class="text-muted small mb-4">
                            <?= htmlspecialchars($task['description']) ?>
                        </p>
                    </div>

                    <div class="border-top pt-3 mt-auto">
                        <div class="d-flex justify-content-between align-items-center small text-muted mb-3">
                            <span><i class="bi bi-stopwatch me-1 text-primary"></i> Est. <?= htmlspecialchars($task['estimated_time']) ?></span>
                            <span><i class="bi bi-camera me-1 text-info"></i> Proof Required</span>
                        </div>

                        <?php if ($alreadySubmitted): ?>
                            <div class="d-grid gap-2">
                                <a href="/task.php?id=<?= $task['id'] ?>" class="btn btn-outline-secondary btn-sm rounded-pill fw-semibold">
                                    <i class="bi bi-check-circle me-1 text-success"></i> Submission Received
                                </a>
                            </div>
                        <?php else: ?>
                            <a href="/task.php?id=<?= $task['id'] ?>" class="btn btn-farm-primary rounded-pill w-100 fw-bold shadow-sm">
                                View Instructions & Submit
                            </a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
