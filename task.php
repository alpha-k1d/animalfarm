<?php
// task.php - Single Task Details & Proof Submission

require_once __DIR__ . '/includes/auth.php';

$taskId = (int)($_GET['id'] ?? 0);
$stmt = $pdo->prepare("SELECT * FROM tasks WHERE id = ?");
$stmt->execute([$taskId]);
$task = $stmt->fetch();

if (!$task || $task['status'] !== 'active') {
    redirect('/tasks.php', 'danger', 'The selected agricultural task was not found or is currently unavailable.');
}

$page_title = $task['title'] . " - Task Assignment";
$user = get_auth_user($pdo);

// Check if user already submitted this task
$stmtCheck = $pdo->prepare("SELECT * FROM task_submissions WHERE task_id = ? AND user_id = ? ORDER BY id DESC LIMIT 1");
$stmtCheck->execute([$taskId, $user['id']]);
$existing_submission = $stmtCheck->fetch();

$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    if ($existing_submission && $existing_submission['status'] === 'pending') {
        $error = "You already have a pending submission for this task awaiting administrator review.";
    } elseif ($existing_submission && $existing_submission['status'] === 'approved') {
        $error = "You have already completed this task and received your reward.";
    } else {
        $submission_text = sanitize($_POST['submission_text'] ?? '');
        $uploaded_file_path = null;

        // Proof validation
        if (in_array($task['proof_type'], ['image_required', 'both']) && empty($_FILES['proof_file']['name'])) {
            $error = "This task requires you to upload an image or verification document proof.";
        }

        if (empty($error) && !empty($_FILES['proof_file']['name'])) {
            $file = $_FILES['proof_file'];

            if ($file['error'] !== UPLOAD_ERR_OK) {
                $error = "File upload failed. Please choose a valid image file.";
            } elseif ($file['size'] > 5 * 1024 * 1024) {
                $error = "File size exceeds the 5MB maximum upload limit.";
            } else {
                $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
                $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

                if (!in_array($ext, $allowedExtensions)) {
                    $error = "Invalid file type. Only JPG, PNG, WEBP, and PDF documents are permitted.";
                } else {
                    // Check real MIME type
                    $finfo = finfo_open(FILEINFO_MIME_TYPE);
                    $mime = finfo_file($finfo, $file['tmp_name']);
                    finfo_close($finfo);

                    $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
                    if (!in_array($mime, $allowedMimes)) {
                        $error = "File content does not match allowed image or document formats.";
                    } else {
                        $safeFilename = 'task_' . $taskId . '_u' . $user['id'] . '_' . time() . '.' . $ext;
                        $targetDir = __DIR__ . '/uploads/tasks/';
                        if (!is_dir($targetDir)) {
                            mkdir($targetDir, 0755, true);
                        }
                        $targetPath = $targetDir . $safeFilename;

                        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                            $uploaded_file_path = '/uploads/tasks/' . $safeFilename;
                        } else {
                            $error = "Could not save uploaded proof file. Please retry.";
                        }
                    }
                }
            }
        }

        if (empty($error)) {
            try {
                $pdo->beginTransaction();

                // Insert submission
                $stmtSub = $pdo->prepare("INSERT INTO task_submissions (task_id, user_id, submission_text, proof_file, reward_amount, status) VALUES (?, ?, ?, ?, ?, 'pending')");
                $stmtSub->execute([$taskId, $user['id'], $submission_text, $uploaded_file_path, $task['reward']]);

                // Increment user's pending rewards
                $stmtUser = $pdo->prepare("UPDATE users SET pending_rewards = pending_rewards + ? WHERE id = ?");
                $stmtUser->execute([$task['reward'], $user['id']]);

                // Create notification
                create_notification(
                    $pdo,
                    $user['id'],
                    'Task Submission Received',
                    "Your proof submission for '{$task['title']}' has been received. Our farm supervisor will review it shortly.",
                    'task',
                    '/dashboard.php'
                );

                $pdo->commit();

                redirect('/dashboard.php', 'success', 'Task proof submitted successfully! ' . money($task['reward']) . ' has been added to your pending rewards.');
            } catch (Exception $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                error_log("Task submission error: " . $e->getMessage());
                $error = "A system error occurred while submitting your task. Please try again.";
            }
        }
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-4">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb small">
            <li class="breadcrumb-item"><a href="/tasks.php" class="text-success text-decoration-none">Tasks</a></li>
            <li class="breadcrumb-item active" aria-current="page"><?= htmlspecialchars($task['category']) ?></li>
        </ol>
    </nav>

    <div class="row g-4">
        <!-- Task Details & Instructions -->
        <div class="col-lg-7">
            <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-4">
                <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div>
                        <span class="category-pill mb-2 d-inline-block"><?= htmlspecialchars($task['category']) ?></span>
                        <h3 class="fw-bold text-dark mb-1"><?= htmlspecialchars($task['title']) ?></h3>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-success fs-5 px-3 py-2 rounded-pill fw-bold"><?= money($task['reward']) ?></span>
                        <small class="text-muted d-block mt-1">Reward in GHS</small>
                    </div>
                </div>

                <div class="row g-2 py-3 border-top border-bottom my-3 small text-muted">
                    <div class="col-sm-4">
                        <i class="bi bi-clock-history me-1 text-primary"></i> Est. Time: <strong><?= htmlspecialchars($task['estimated_time']) ?></strong>
                    </div>
                    <div class="col-sm-4">
                        <i class="bi bi-check2-all me-1 text-success"></i> Limit: <strong><?= (int)$task['max_completions'] ?> slots</strong>
                    </div>
                    <div class="col-sm-4">
                        <i class="bi bi-shield-check me-1 text-warning"></i> Verification: <strong>Manual Review</strong>
                    </div>
                </div>

                <h5 class="fw-bold text-dark mt-3 mb-2">Description</h5>
                <p class="text-muted small mb-4">
                    <?= nl2br(htmlspecialchars($task['description'])) ?>
                </p>

                <h5 class="fw-bold text-dark mb-2">Step-by-Step Instructions</h5>
                <div class="bg-light p-4 rounded-3 small text-dark mb-4 border">
                    <?= nl2br(htmlspecialchars($task['instructions'])) ?>
                </div>

                <div class="alert alert-warning border-0 rounded-3 small mb-0">
                    <i class="bi bi-info-circle me-1"></i>
                    <strong>Compliance Rule:</strong> Falsified or duplicated task proof submissions will be rejected and may result in temporary account suspension.
                </div>
            </div>
        </div>

        <!-- Submission Form or Status -->
        <div class="col-lg-5">
            <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white sticky-top" style="top: 90px;">
                <h4 class="fw-bold text-dark mb-3">Submit Task Proof</h4>

                <?php if ($error): ?>
                    <div class="alert alert-danger border-0 rounded-3 small mb-4">
                        <i class="bi bi-exclamation-octagon me-1"></i> <?= htmlspecialchars($error) ?>
                    </div>
                <?php endif; ?>

                <?php if ($existing_submission): ?>
                    <div class="card border-0 bg-light p-4 rounded-3 text-center mb-3">
                        <div class="mb-2">
                            <?php if ($existing_submission['status'] === 'pending'): ?>
                                <span class="badge bg-warning text-dark fs-6 px-3 py-2 rounded-pill">Pending Review</span>
                            <?php elseif ($existing_submission['status'] === 'approved'): ?>
                                <span class="badge bg-success text-white fs-6 px-3 py-2 rounded-pill">Approved & Rewarded</span>
                            <?php else: ?>
                                <span class="badge bg-danger text-white fs-6 px-3 py-2 rounded-pill">Rejected</span>
                            <?php endif; ?>
                        </div>

                        <p class="small text-muted mb-2">
                            Submitted on <?= date('M d, Y H:i', strtotime($existing_submission['created_at'])) ?>
                        </p>

                        <?php if (!empty($existing_submission['admin_notes'])): ?>
                            <div class="alert alert-secondary text-start small mb-2">
                                <strong>Admin Remarks:</strong> <?= htmlspecialchars($existing_submission['admin_notes']) ?>
                            </div>
                        <?php endif; ?>

                        <?php if ($existing_submission['status'] === 'rejected'): ?>
                            <p class="small text-danger mb-0">Your previous submission was not accepted. You may re-submit with revised proof below.</p>
                        <?php else: ?>
                            <p class="small text-muted mb-0">Thank you for your submission. Completed one-time tasks cannot be re-submitted.</p>
                            <a href="/tasks.php" class="btn btn-outline-success rounded-pill btn-sm mt-3 fw-semibold">Browse Other Tasks</a>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>

                <?php if (!$existing_submission || $existing_submission['status'] === 'rejected'): ?>
                    <form method="POST" action="/task.php?id=<?= $taskId ?>" enctype="multipart/form-data">
                        <?= csrf_field() ?>

                        <div class="mb-3">
                            <label for="submission_text" class="form-label fw-semibold small text-muted">Field Observation Notes / Log</label>
                            <textarea class="form-control rounded-3 small" id="submission_text" name="submission_text" rows="4" placeholder="Enter headcount, survey readings, or date/time notes as requested in the instructions..." required><?= htmlspecialchars($_POST['submission_text'] ?? '') ?></textarea>
                        </div>

                        <?php if (in_array($task['proof_type'], ['image_required', 'both'])): ?>
                            <div class="mb-3">
                                <label for="proof_file" class="form-label fw-semibold small text-muted">Upload Verification Photo or Document</label>
                                <input type="file" class="form-control rounded-3 small" id="proof_file" name="proof_file" accept=".jpg,.jpeg,.png,.webp,.pdf" data-preview="previewTaskImg" required>
                                <div class="form-text small text-muted">Accepted formats: JPG, PNG, WEBP, PDF (Max 5MB).</div>
                                <img id="previewTaskImg" class="img-thumbnail mt-2 d-none rounded-3" style="max-height: 180px;" alt="Upload Preview">
                            </div>
                        <?php endif; ?>

                        <button type="submit" class="btn btn-farm-primary btn-lg rounded-pill w-100 fw-bold shadow-sm">
                            Submit for Verification
                        </button>
                    </form>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
