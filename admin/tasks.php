<?php
// admin/tasks.php - Agricultural Task Creator & Management

$page_title = "Manage Farm Tasks";
require_once __DIR__ . '/includes/admin_header.php';

// Handle Add / Edit / Delete task
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $action = sanitize($_POST['action'] ?? '');

    if ($action === 'create' || $action === 'update') {
        $title = sanitize($_POST['title'] ?? '');
        $category = sanitize($_POST['category'] ?? 'General Farm Care');
        $reward = (float)($_POST['reward'] ?? 0);
        $description = sanitize($_POST['description'] ?? '');
        $instructions = sanitize($_POST['instructions'] ?? '');
        $proof_type = sanitize($_POST['proof_type'] ?? 'both');
        $estimated_time = sanitize($_POST['estimated_time'] ?? '15 mins');
        $max_completions = (int)($_POST['max_completions'] ?? 100);
        $status = sanitize($_POST['status'] ?? 'active');

        if (empty($title) || $reward <= 0) {
            redirect('/admin/tasks.php', 'danger', 'Title and a positive reward amount are required.');
        }

        if ($action === 'create') {
            $stmt = $pdo->prepare("INSERT INTO tasks (title, category, reward, description, instructions, proof_type, estimated_time, max_completions, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$title, $category, $reward, $description, $instructions, $proof_type, $estimated_time, $max_completions, $status]);
            redirect('/admin/tasks.php', 'success', 'New agricultural task created successfully.');
        } else {
            $taskId = (int)$_POST['task_id'];
            $stmt = $pdo->prepare("UPDATE tasks SET title = ?, category = ?, reward = ?, description = ?, instructions = ?, proof_type = ?, estimated_time = ?, max_completions = ?, status = ? WHERE id = ?");
            $stmt->execute([$title, $category, $reward, $description, $instructions, $proof_type, $estimated_time, $max_completions, $status, $taskId]);
            redirect('/admin/tasks.php', 'success', 'Task updated successfully.');
        }
    } elseif ($action === 'toggle_status') {
        $taskId = (int)$_POST['task_id'];
        $pdo->prepare("UPDATE tasks SET status = CASE WHEN status = 'active' THEN 'inactive' ELSE 'active' END WHERE id = ?")->execute([$taskId]);
        redirect('/admin/tasks.php', 'info', 'Task status toggled.');
    } elseif ($action === 'delete') {
        $taskId = (int)$_POST['task_id'];
        $pdo->prepare("DELETE FROM tasks WHERE id = ?")->execute([$taskId]);
        redirect('/admin/tasks.php', 'warning', 'Task deleted.');
    }
}

$tasks = $pdo->query("SELECT * FROM tasks ORDER BY id DESC")->fetchAll();
$categories = ['Poultry', 'Goat Farming', 'Cattle Farming', 'Pig Farming', 'Fish Farming', 'Crop Farming', 'General Farm Care'];
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h3 class="fw-bold text-dark mb-0">Agricultural Tasks Directory</h3>
        <small class="text-muted">Configure tasks, reward budgets (GH₵), and proof verification criteria</small>
    </div>
    <button type="button" class="btn btn-farm-primary rounded-pill px-4 fw-bold shadow-sm" data-bs-toggle="modal" data-bs-target="#createTaskModal">
        <i class="bi bi-plus-lg me-1"></i> Create New Task
    </button>
</div>

<!-- Tasks Table -->
<div class="card border-0 shadow-sm rounded-4 bg-white p-4">
    <div class="table-responsive">
        <table class="table align-middle table-hover mb-0">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Task Title & Category</th>
                    <th>Reward (GH₵)</th>
                    <th>Proof Type</th>
                    <th>Completions</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($tasks as $t): ?>
                <tr>
                    <td>#<?= $t['id'] ?></td>
                    <td>
                        <div class="fw-bold text-dark"><?= htmlspecialchars($t['title']) ?></div>
                        <span class="category-pill" style="font-size: 0.72rem;"><?= htmlspecialchars($t['category']) ?></span>
                        <small class="text-muted ms-2"><i class="bi bi-clock"></i> <?= htmlspecialchars($t['estimated_time']) ?></small>
                    </td>
                    <td class="fw-bold text-success fs-6"><?= money($t['reward']) ?></td>
                    <td>
                        <span class="badge bg-light text-dark border"><?= htmlspecialchars($t['proof_type']) ?></span>
                    </td>
                    <td>
                        <span class="fw-semibold text-dark"><?= (int)$t['completed_count'] ?></span> / <?= (int)$t['max_completions'] ?>
                    </td>
                    <td>
                        <?php if ($t['status'] === 'active'): ?>
                            <span class="badge bg-success rounded-pill px-3">Active</span>
                        <?php else: ?>
                            <span class="badge bg-secondary rounded-pill px-3">Inactive</span>
                        <?php endif; ?>
                    </td>
                    <td class="text-end">
                        <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-2" data-bs-toggle="modal" data-bs-target="#editModal<?= $t['id'] ?>">
                            Edit
                        </button>

                        <form method="POST" action="/admin/tasks.php" class="d-inline">
                            <?= csrf_field() ?>
                            <input type="hidden" name="task_id" value="<?= $t['id'] ?>">
                            <input type="hidden" name="action" value="toggle_status">
                            <button type="submit" class="btn btn-sm btn-light border rounded-pill px-2">
                                <?= $t['status'] === 'active' ? 'Deactivate' : 'Activate' ?>
                            </button>
                        </form>
                    </td>
                </tr>

                <!-- Edit Modal -->
                <div class="modal fade" id="editModal<?= $t['id'] ?>" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-centered">
                        <div class="modal-content rounded-4 border-0 shadow">
                            <div class="modal-header bg-dark text-white">
                                <h5 class="modal-title fw-bold">Edit Task: <?= htmlspecialchars($t['title']) ?></h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body p-4 text-start">
                                <form method="POST" action="/admin/tasks.php">
                                    <?= csrf_field() ?>
                                    <input type="hidden" name="action" value="update">
                                    <input type="hidden" name="task_id" value="<?= $t['id'] ?>">

                                    <div class="row g-3 mb-3">
                                        <div class="col-md-8">
                                            <label class="form-label small fw-semibold text-muted">Task Title</label>
                                            <input type="text" name="title" class="form-control rounded-3" value="<?= htmlspecialchars($t['title']) ?>" required>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label small fw-semibold text-muted">Category</label>
                                            <select name="category" class="form-select rounded-3">
                                                <?php foreach ($categories as $c): ?>
                                                    <option value="<?= htmlspecialchars($c) ?>" <?= $t['category'] === $c ? 'selected' : '' ?>><?= htmlspecialchars($c) ?></option>
                                                <?php endforeach; ?>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="row g-3 mb-3">
                                        <div class="col-md-4">
                                            <label class="form-label small fw-semibold text-muted">Reward (GH₵)</label>
                                            <input type="number" step="0.01" min="0.01" name="reward" class="form-control rounded-3" value="<?= htmlspecialchars($t['reward']) ?>" required>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label small fw-semibold text-muted">Proof Type</label>
                                            <select name="proof_type" class="form-select rounded-3">
                                                <option value="both" <?= $t['proof_type'] === 'both' ? 'selected' : '' ?>>Text & Photo / File</option>
                                                <option value="image_required" <?= $t['proof_type'] === 'image_required' ? 'selected' : '' ?>>Photo Required</option>
                                                <option value="text_only" <?= $t['proof_type'] === 'text_only' ? 'selected' : '' ?>>Text Only</option>
                                            </select>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label small fw-semibold text-muted">Estimated Time</label>
                                            <input type="text" name="estimated_time" class="form-control rounded-3" value="<?= htmlspecialchars($t['estimated_time']) ?>">
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold text-muted">Short Description</label>
                                        <textarea name="description" class="form-control rounded-3" rows="2" required><?= htmlspecialchars($t['description']) ?></textarea>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label small fw-semibold text-muted">Detailed Instructions</label>
                                        <textarea name="instructions" class="form-control rounded-3" rows="4" required><?= htmlspecialchars($t['instructions']) ?></textarea>
                                    </div>

                                    <div class="row g-3 mb-4">
                                        <div class="col-sm-6">
                                            <label class="form-label small fw-semibold text-muted">Max Completions Limit</label>
                                            <input type="number" name="max_completions" class="form-control rounded-3" value="<?= (int)$t['max_completions'] ?>">
                                        </div>
                                        <div class="col-sm-6">
                                            <label class="form-label small fw-semibold text-muted">Status</label>
                                            <select name="status" class="form-select rounded-3">
                                                <option value="active" <?= $t['status'] === 'active' ? 'selected' : '' ?>>Active</option>
                                                <option value="inactive" <?= $t['status'] === 'inactive' ? 'selected' : '' ?>>Inactive</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="d-flex justify-content-between">
                                        <button type="submit" class="btn btn-farm-primary rounded-pill px-4 fw-bold">
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Create Task Modal -->
<div class="modal fade" id="createTaskModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">
            <div class="modal-header bg-farm-primary text-white">
                <h5 class="modal-title fw-bold">Create New Agricultural Task</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4 text-start">
                <form method="POST" action="/admin/tasks.php">
                    <?= csrf_field() ?>
                    <input type="hidden" name="action" value="create">

                    <div class="row g-3 mb-3">
                        <div class="col-md-8">
                            <label class="form-label small fw-semibold text-muted">Task Title</label>
                            <input type="text" name="title" class="form-control rounded-3" placeholder="e.g. Daily Layer Flock Inspection" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold text-muted">Category</label>
                            <select name="category" class="form-select rounded-3">
                                <?php foreach ($categories as $c): ?>
                                    <option value="<?= htmlspecialchars($c) ?>"><?= htmlspecialchars($c) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold text-muted">Reward in GH₵</label>
                            <input type="number" step="0.01" min="0.01" name="reward" class="form-control rounded-3" placeholder="15.00" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold text-muted">Proof Requirement</label>
                            <select name="proof_type" class="form-select rounded-3">
                                <option value="both">Text & Photo / File</option>
                                <option value="image_required">Photo Required</option>
                                <option value="text_only">Text Only</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold text-muted">Estimated Time</label>
                            <input type="text" name="estimated_time" class="form-control rounded-3" placeholder="15 mins">
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label small fw-semibold text-muted">Short Description</label>
                        <textarea name="description" class="form-control rounded-3" rows="2" placeholder="Brief summary displayed on task card..." required></textarea>
                    </div>

                    <div class="mb-3">
                        <label class="form-label small fw-semibold text-muted">Step-by-Step Instructions</label>
                        <textarea name="instructions" class="form-control rounded-3" rows="4" placeholder="Numbered guidelines explaining what the farmer must inspect and record..." required></textarea>
                    </div>

                    <div class="row g-3 mb-4">
                        <div class="col-sm-6">
                            <label class="form-label small fw-semibold text-muted">Max Completions Limit</label>
                            <input type="number" name="max_completions" class="form-control rounded-3" value="100">
                        </div>
                        <div class="col-sm-6">
                            <label class="form-label small fw-semibold text-muted">Initial Status</label>
                            <select name="status" class="form-select rounded-3">
                                <option value="active">Active (Visible immediately)</option>
                                <option value="inactive">Inactive (Draft)</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-farm-primary w-100 rounded-pill fw-bold py-2 shadow-sm">
                        Create Agricultural Task
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/admin_footer.php'; ?>
