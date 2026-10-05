<?php
// notifications.php - Member Notification Center

$page_title = "Notifications";
require_once __DIR__ . '/includes/auth.php';

$user = get_auth_user($pdo);

// Mark all as read if requested
if (isset($_GET['mark_all_read'])) {
    $stmtRead = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
    $stmtRead->execute([$user['id']]);
    redirect('/notifications.php', 'info', 'All notifications marked as read.');
}

// Fetch user notifications
$stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 50");
$stmt->execute([$user['id']]);
$notifications = $stmt->fetchAll();

require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-4">
    <div class="row justify-content-center">
        <div class="col-lg-8">
            <div class="card border-0 shadow-sm rounded-4 bg-white p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h4 class="fw-bold text-dark mb-1">Notifications</h4>
                        <small class="text-muted">Stay informed about your tasks, rewards, and payouts.</small>
                    </div>
                    <?php if (!empty($notifications)): ?>
                        <a href="/notifications.php?mark_all_read=1" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
                            <i class="bi bi-check2-all me-1"></i> Mark All as Read
                        </a>
                    <?php endif; ?>
                </div>

                <?php if (empty($notifications)): ?>
                    <div class="text-center py-5 text-muted small">
                        <i class="bi bi-bell-slash fs-1 d-block mb-3 text-secondary"></i>
                        You have no notifications at this time.
                    </div>
                <?php else: ?>
                    <div class="list-group list-group-flush">
                        <?php foreach ($notifications as $n): 
                            $isUnread = (int)$n['is_read'] === 0;
                            $icon = match($n['type']) {
                                'task' => 'bi-check2-circle text-success',
                                'payment' => 'bi-wallet2 text-primary',
                                'withdrawal' => 'bi-cash-stack text-warning',
                                default => 'bi-info-circle text-info'
                            };
                        ?>
                        <div class="list-group-item px-0 py-3 <?= $isUnread ? 'bg-light rounded-3 px-3 mb-2' : '' ?>">
                            <div class="d-flex gap-3 align-items-start">
                                <div class="fs-4 pt-1">
                                    <i class="bi <?= $icon ?>"></i>
                                </div>
                                <div class="flex-grow-1">
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <h6 class="fw-bold text-dark mb-0"><?= htmlspecialchars($n['title']) ?></h6>
                                        <small class="text-muted"><?= date('M d, H:i', strtotime($n['created_at'])) ?></small>
                                    </div>
                                    <p class="text-muted small mb-1"><?= htmlspecialchars($n['message']) ?></p>
                                    <?php if (!empty($n['action_url'])): ?>
                                        <a href="<?= htmlspecialchars($n['action_url']) ?>" class="small text-success fw-semibold text-decoration-none">
                                            View Details &rarr;
                                        </a>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
