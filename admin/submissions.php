<?php
// admin/submissions.php - Task Submissions Review & Reward Approval Engine

$page_title = "Task Submissions Review";
require_once __DIR__ . '/includes/admin_header.php';

$filter_status = sanitize($_GET['status'] ?? 'pending');

// Handle Approve / Reject actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $submission_id = (int)$_POST['submission_id'];
    $action = sanitize($_POST['action'] ?? '');
    $admin_notes = sanitize($_POST['admin_notes'] ?? '');

    $stmtSub = $pdo->prepare("SELECT ts.*, t.title AS task_title, u.id AS user_id, u.full_name, u.referred_by_id 
                             FROM task_submissions ts 
                             JOIN tasks t ON t.id = ts.task_id 
                             JOIN users u ON u.id = ts.user_id 
                             WHERE ts.id = ?");
    $stmtSub->execute([$submission_id]);
    $sub = $stmtSub->fetch();

    if ($sub && $sub['status'] === 'pending') {
        $reward = (float)$sub['reward_amount'];
        $userId = (int)$sub['user_id'];

        if ($action === 'approve') {
            try {
                $pdo->beginTransaction();

                // 1. Update submission status
                $stmtUpdate = $pdo->prepare("UPDATE task_submissions SET status = 'approved', admin_notes = ?, reviewed_at = NOW() WHERE id = ?");
                $stmtUpdate->execute([$admin_notes ?: 'Verified and approved by farm supervisor', $submission_id]);

                // 2. Increment completed count on task
                $pdo->prepare("UPDATE tasks SET completed_count = completed_count + 1 WHERE id = ?")->execute([$sub['task_id']]);

                // 3. Update user wallet balance, decrement pending rewards, increment total earned
                $stmtUser = $pdo->prepare("UPDATE users SET wallet_balance = wallet_balance + ?, pending_rewards = GREATEST(0, pending_rewards - ?), total_earned = total_earned + ? WHERE id = ?");
                $stmtUser->execute([$reward, $reward, $reward, $userId]);

                // 4. Record double-entry transaction
                record_transaction($pdo, $userId, 'Task Reward', $reward, "Reward for completing '{$sub['task_title']}'", 'completed');

                // 5. Notify user
                create_notification(
                    $pdo,
                    $userId,
                    'Task Approved & Reward Credited!',
                    "Your proof for '{$sub['task_title']}' was approved. " . money($reward) . " has been credited to your rewards wallet.",
                    'task',
                    '/wallet.php'
                );

                // 6. Check if this is user's first approved task and if they have a pending referral
                $stmtFirstCheck = $pdo->prepare("SELECT COUNT(*) FROM task_submissions WHERE user_id = ? AND status = 'approved'");
                $stmtFirstCheck->execute([$userId]);
                $totalApproved = (int)$stmtFirstCheck->fetchColumn();

                if ($totalApproved === 1 && !empty($sub['referred_by_id'])) {
                    $referrerId = (int)$sub['referred_by_id'];
                    $stmtRefCheck = $pdo->prepare("SELECT id FROM referrals WHERE referrer_id = ? AND referred_user_id = ? AND status = 'pending'");
                    $stmtRefCheck->execute([$referrerId, $userId]);
                    $refId = $stmtRefCheck->fetchColumn();

                    if ($refId) {
                        $refReward = REFERRAL_REWARD;

                        // Mark referral rewarded
                        $pdo->prepare("UPDATE referrals SET status = 'rewarded', rewarded_at = NOW() WHERE id = ?")->execute([$refId]);

                        // Credit referrer
                        $pdo->prepare("UPDATE users SET wallet_balance = wallet_balance + ?, total_earned = total_earned + ? WHERE id = ?")
                            ->execute([$refReward, $refReward, $referrerId]);

                        // Record transaction for referrer
                        record_transaction($pdo, $referrerId, 'Referral Reward', $refReward, "Referral reward: {$sub['full_name']} completed 1st task", 'completed');

                        // Notify referrer
                        create_notification(
                            $pdo,
                            $referrerId,
                            'Referral Commission Earned!',
                            "Your invited member {$sub['full_name']} completed their first agricultural task. " . money($refReward) . " has been credited to your rewards wallet!",
                            'payment',
                            '/referrals.php'
                        );
                    }
                }

                $pdo->commit();
                redirect("/admin/submissions.php?status={$filter_status}", 'success', "Submission #{$submission_id} approved! " . money($reward) . " credited to user.");
            } catch (Exception $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                error_log("Approval error: " . $e->getMessage());
                redirect("/admin/submissions.php?status={$filter_status}", 'danger', 'Failed to approve submission: ' . $e->getMessage());
            }
        } elseif ($action === 'reject') {
            try {
                $pdo->beginTransaction();

                // 1. Update status
                $stmtUpdate = $pdo->prepare("UPDATE task_submissions SET status = 'rejected', admin_notes = ?, reviewed_at = NOW() WHERE id = ?");
                $stmtUpdate->execute([$admin_notes ?: 'Proof did not meet task requirements', $submission_id]);

                // 2. Decrement pending rewards
                $pdo->prepare("UPDATE users SET pending_rewards = GREATEST(0, pending_rewards - ?) WHERE id = ?")
                    ->execute([$reward, $userId]);

                // 3. Notify user
                create_notification(
                    $pdo,
                    $userId,
                    'Task Submission Rejected',
                    "Your proof for '{$sub['task_title']}' was rejected. Reason: " . ($admin_notes ?: 'Incomplete or unverified proof.'),
                    'task',
                    "/task.php?id={$sub['task_id']}"
                );

                $pdo->commit();
                redirect("/admin/submissions.php?status={$filter_status}", 'warning', "Submission #{$submission_id} marked as rejected.");
            } catch (Exception $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                error_log("Rejection error: " . $e->getMessage());
                redirect("/admin/submissions.php?status={$filter_status}", 'danger', 'Failed to reject submission: ' . $e->getMessage());
            }
        }
    }
}

// Fetch submissions
$sql = "SELECT ts.*, t.title AS task_title, t.category, u.full_name, u.phone 
        FROM task_submissions ts 
        JOIN tasks t ON t.id = ts.task_id 
        JOIN users u ON u.id = ts.user_id";

if (!empty($filter_status) && in_array($filter_status, ['pending', 'approved', 'rejected'])) {
    $sql .= " WHERE ts.status = " . $pdo->quote($filter_status);
}
$sql .= " ORDER BY ts.id DESC LIMIT 100";

$submissions = $pdo->query($sql)->fetchAll();
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h3 class="fw-bold text-dark mb-0">Task Submissions Review</h3>
        <small class="text-muted">Inspect field reports, proof photographs, and approve Cedi rewards</small>
    </div>

    <!-- Status filter pills -->
    <div class="btn-group rounded-pill shadow-sm" role="group">
        <a href="/admin/submissions.php?status=pending" class="btn btn-sm <?= $filter_status === 'pending' ? 'btn-warning text-dark fw-bold' : 'btn-light border' ?>">
            Pending Queue
        </a>
        <a href="/admin/submissions.php?status=approved" class="btn btn-sm <?= $filter_status === 'approved' ? 'btn-success fw-bold' : 'btn-light border' ?>">
            Approved
        </a>
        <a href="/admin/submissions.php?status=rejected" class="btn btn-sm <?= $filter_status === 'rejected' ? 'btn-danger fw-bold' : 'btn-light border' ?>">
            Rejected
        </a>
        <a href="/admin/submissions.php?status=all" class="btn btn-sm <?= $filter_status === 'all' ? 'btn-dark fw-bold' : 'btn-light border' ?>">
            All
        </a>
    </div>
</div>

<div class="card border-0 shadow-sm rounded-4 bg-white p-4">
    <?php if (empty($submissions)): ?>
        <div class="text-center py-5 text-muted small">
            <i class="bi bi-inbox fs-1 d-block mb-3 text-secondary"></i>
            No task submissions found under status "<?= htmlspecialchars($filter_status) ?>".
        </div>
    <?php else: ?>
        <div class="table-responsive">
            <table class="table align-middle table-hover mb-0">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Submitted</th>
                        <th>Farmer</th>
                        <th>Task & Category</th>
                        <th>Reward</th>
                        <th>Submission Proof</th>
                        <th>Status</th>
                        <th class="text-end">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($submissions as $sub): 
                        $statusBadge = match($sub['status']) {
                            'approved' => 'bg-success',
                            'rejected' => 'bg-danger',
                            default => 'bg-warning text-dark'
                        };
                    ?>
                    <tr>
                        <td>#<?= $sub['id'] ?></td>
                        <td class="small text-muted"><?= date('M d, H:i', strtotime($sub['created_at'])) ?></td>
                        <td>
                            <div class="fw-bold text-dark"><?= htmlspecialchars($sub['full_name']) ?></div>
                            <small class="text-muted"><?= htmlspecialchars($sub['phone']) ?></small>
                        </td>
                        <td>
                            <div class="fw-semibold text-dark"><?= htmlspecialchars($sub['task_title']) ?></div>
                            <span class="category-pill" style="font-size: 0.7rem;"><?= htmlspecialchars($sub['category']) ?></span>
                        </td>
                        <td class="fw-bold text-success fs-6">
                            <?= money($sub['reward_amount']) ?>
                        </td>
                        <td>
                            <div class="small mb-1 text-muted" style="max-width: 250px;">
                                <?= htmlspecialchars(mb_strimwidth($sub['submission_text'] ?? '', 0, 80, '...')) ?>
                            </div>
                            <?php if (!empty($sub['proof_file'])): ?>
                                <a href="<?= htmlspecialchars($sub['proof_file']) ?>" target="_blank" class="badge bg-primary text-white text-decoration-none">
                                    <i class="bi bi-paperclip me-1"></i> View Attached Proof
                                </a>
                            <?php else: ?>
                                <span class="badge bg-light text-muted border">Text Only</span>
                            <?php endif; ?>
                        </td>
                        <td>
                            <span class="badge <?= $statusBadge ?> rounded-pill px-3 py-1">
                                <?= ucfirst($sub['status']) ?>
                            </span>
                        </td>
                        <td class="text-end">
                            <?php if ($sub['status'] === 'pending'): ?>
                                <button type="button" class="btn btn-sm btn-success rounded-pill px-3 fw-semibold" data-bs-toggle="modal" data-bs-target="#reviewModal<?= $sub['id'] ?>">
                                    Review Proof
                                </button>
                            <?php else: ?>
                                <small class="text-muted d-block"><?= htmlspecialchars($sub['admin_notes'] ?? 'Reviewed') ?></small>
                            <?php endif; ?>
                        </td>
                    </tr>

                    <!-- Review Modal -->
                    <div class="modal fade" id="reviewModal<?= $sub['id'] ?>" tabindex="-1" aria-hidden="true">
                        <div class="modal-dialog modal-lg modal-dialog-centered">
                            <div class="modal-content rounded-4 border-0 shadow">
                                <div class="modal-header bg-dark text-white">
                                    <h5 class="modal-title fw-bold">Review Submission #<?= $sub['id'] ?>: <?= htmlspecialchars($sub['task_title']) ?></h5>
                                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                                </div>
                                <div class="modal-body p-4">
                                    <div class="row g-3 mb-3">
                                        <div class="col-sm-6">
                                            <span class="text-muted small d-block">Submitted by Farmer:</span>
                                            <strong class="text-dark"><?= htmlspecialchars($sub['full_name']) ?> (<?= htmlspecialchars($sub['phone']) ?>)</strong>
                                        </div>
                                        <div class="col-sm-6">
                                            <span class="text-muted small d-block">Eligible Reward:</span>
                                            <span class="fw-bold text-success fs-5"><?= money($sub['reward_amount']) ?></span>
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label class="fw-bold small text-muted d-block">Submitted Observation Notes:</label>
                                        <div class="p-3 bg-light rounded-3 border small">
                                            <?= nl2br(htmlspecialchars($sub['submission_text'] ?? '')) ?>
                                        </div>
                                    </div>

                                    <?php if (!empty($sub['proof_file'])): ?>
                                        <div class="mb-3">
                                            <label class="fw-bold small text-muted d-block">Uploaded Proof File / Photo:</label>
                                            <div class="text-center p-2 bg-light rounded border">
                                                <?php if (preg_match('/\.(jpg|jpeg|png|webp)$/i', $sub['proof_file'])): ?>
                                                    <img src="<?= htmlspecialchars($sub['proof_file']) ?>" alt="Proof" class="img-fluid rounded" style="max-height: 350px;">
                                                <?php else: ?>
                                                    <a href="<?= htmlspecialchars($sub['proof_file']) ?>" target="_blank" class="btn btn-outline-primary btn-sm">
                                                        <i class="bi bi-file-earmark-pdf me-1"></i> Open Uploaded Document
                                                    </a>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    <?php endif; ?>

                                    <!-- Decision Forms -->
                                    <div class="row g-3 pt-3 border-top">
                                        <div class="col-md-6">
                                            <form method="POST" action="/admin/submissions.php?status=<?= urlencode($filter_status) ?>">
                                                <?= csrf_field() ?>
                                                <input type="hidden" name="submission_id" value="<?= $sub['id'] ?>">
                                                <input type="hidden" name="action" value="approve">
                                                <div class="mb-2">
                                                    <input type="text" name="admin_notes" class="form-control form-control-sm rounded-3" placeholder="Optional approval praise or note...">
                                                </div>
                                                <button type="submit" class="btn btn-success w-100 rounded-pill fw-bold">
                                                    [Verified] Approve & Credit <?= money($sub['reward_amount']) ?>
                                                </button>
                                            </form>
                                        </div>

                                        <div class="col-md-6">
                                            <form method="POST" action="/admin/submissions.php?status=<?= urlencode($filter_status) ?>">
                                                <?= csrf_field() ?>
                                                <input type="hidden" name="submission_id" value="<?= $sub['id'] ?>">
                                                <input type="hidden" name="action" value="reject">
                                                <div class="mb-2">
                                                    <input type="text" name="admin_notes" class="form-control form-control-sm rounded-3" placeholder="Reason for rejection (sent to user)..." required>
                                                </div>
                                                <button type="submit" class="btn btn-outline-danger w-100 rounded-pill fw-bold">
                                                    [Reject] Reject Submission
                                                </button>
                                            </form>
                                        </div>
                                    </div>
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
