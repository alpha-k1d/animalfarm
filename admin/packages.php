<?php
// admin/packages.php - Farm Packages & Agricultural Contracts Manager

$page_title = "Manage Farm Packages";
require_once __DIR__ . '/includes/admin_header.php';

// Handle Add / Edit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $action = sanitize($_POST['action'] ?? '');

    if ($action === 'create' || $action === 'update') {
        $name = sanitize($_POST['name'] ?? '');
        $category = sanitize($_POST['category'] ?? 'Poultry');
        $price = (float)($_POST['price'] ?? 0);
        $duration_days = (int)($_POST['duration_days'] ?? 60);
        $description = sanitize($_POST['description'] ?? '');
        $terms = sanitize($_POST['terms'] ?? '');
        $image = sanitize($_POST['image'] ?? '');
        $status = sanitize($_POST['status'] ?? 'active');

        if ($action === 'create') {
            $stmt = $pdo->prepare("INSERT INTO farm_packages (name, category, price, duration_days, description, terms, image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $category, $price, $duration_days, $description, $terms, $image, $status]);
            redirect('/admin/packages.php', 'success', 'New farm package added.');
        } else {
            $pkgId = (int)$_POST['package_id'];
            $stmt = $pdo->prepare("UPDATE farm_packages SET name = ?, category = ?, price = ?, duration_days = ?, description = ?, terms = ?, image = ?, status = ? WHERE id = ?");
            $stmt->execute([$name, $category, $price, $duration_days, $description, $terms, $image, $status, $pkgId]);
            redirect('/admin/packages.php', 'success', 'Farm package updated.');
        }
    } elseif ($action === 'toggle_status') {
        $pkgId = (int)$_POST['package_id'];
        $pdo->prepare("UPDATE farm_packages SET status = CASE WHEN status = 'active' THEN 'inactive' ELSE 'active' END WHERE id = ?")->execute([$pkgId]);
        redirect('/admin/packages.php', 'info', 'Package status updated.');
    }
}

$packages = $pdo->query("SELECT * FROM farm_packages ORDER BY id ASC")->fetchAll();
$categories = ['Poultry', 'Goat Farming', 'Cattle Farming', 'Pig Farming', 'Fish Farming', 'Crop Farming'];
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h3 class="fw-bold text-dark mb-0">Farm Packages Management</h3>
        <small class="text-muted">Manage agricultural units, participation costs (GH₵), and production cycle durations</small>
    </div>
    <button type="button" class="btn btn-farm-primary rounded-pill px-4 fw-bold shadow-sm" data-bs-toggle="modal" data-bs-target="#createPackageModal">
        <i class="bi bi-plus-lg me-1"></i> Add Farm Package
    </button>
</div>

<div class="row g-4 mb-4">
    <?php foreach ($packages as $pkg): ?>
    <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100 p-3">
            <div class="d-flex gap-3">
                <img src="<?= htmlspecialchars($pkg['image']) ?>" alt="<?= htmlspecialchars($pkg['name']) ?>" class="rounded-3" style="width: 110px; height: 110px; object-fit: cover;">
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <span class="category-pill" style="font-size: 0.72rem;"><?= htmlspecialchars($pkg['category']) ?></span>
                            <h5 class="fw-bold text-dark mb-0 mt-1"><?= htmlspecialchars($pkg['name']) ?></h5>
                        </div>
                        <span class="fs-5 fw-bold text-success"><?= money($pkg['price']) ?></span>
                    </div>
                    <small class="text-muted d-block mt-1"><i class="bi bi-calendar3"></i> Cycle: <strong><?= (int)$pkg['duration_days'] ?> Days</strong> &bull; Status: <strong class="<?= $pkg['status'] === 'active' ? 'text-success' : 'text-secondary' ?>"><?= ucfirst($pkg['status']) ?></strong></small>
                    <p class="text-muted small mt-2 mb-0" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        <?= htmlspecialchars($pkg['description']) ?>
                    </p>
                </div>
            </div>

            <div class="border-top pt-2 mt-3 d-flex justify-content-end gap-2">
                <form method="POST" action="/admin/packages.php" class="d-inline">
                    <?= csrf_field() ?>
                    <input type="hidden" name="package_id" value="<?= $pkg['id'] ?>">
                    <input type="hidden" name="action" value="toggle_status">
                    <button type="submit" class="btn btn-sm btn-light border rounded-pill px-3">
                        <?= $pkg['status'] === 'active' ? 'Deactivate' : 'Activate' ?>
                    </button>
                </form>
            </div>
        </div>
    </div>
    <?php endforeach; ?>
</div>

<!-- Create Package Modal -->
<div class="modal fade" id="createPackageModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">
            <div class="modal-header bg-farm-primary text-white">
                <h5 class="modal-title fw-bold">Add New Farm Package</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4 text-start">
                <form method="POST" action="/admin/packages.php">
                    <?= csrf_field() ?>
                    <input type="hidden" name="action" value="create">

                    <div class="row g-3 mb-3">
                        <div class="col-md-8">
                            <label class="form-label small fw-semibold text-muted">Package Name</label>
                            <input type="text" name="name" class="form-control rounded-3" placeholder="e.g. Sanga Cattle Pasture Unit" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-semibold text-muted">Sector / Category</label>
                            <select name="category" class="form-select rounded-3">
                                <?php foreach ($categories as $c): ?>
                                    <option value="<?= htmlspecialchars($c) ?>"><?= htmlspecialchars($c) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold text-muted">Participation Price (GH₵)</label>
                            <input type="number" step="0.01" min="1.00" name="price" class="form-control rounded-3" placeholder="350.00" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small fw-semibold text-muted">Cycle Duration (Days)</label>
                            <input type="number" min="1" name="duration_days" class="form-control rounded-3" placeholder="60" value="60" required>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label small fw-semibold text-muted">Image URL (Unsplash or direct asset)</label>
                        <input type="url" name="image" class="form-control rounded-3" placeholder="https://images.unsplash.com/..." required>
                    </div>

                    <div class="mb-3">
                        <label class="form-label small fw-semibold text-muted">Description</label>
                        <textarea name="description" class="form-control rounded-3" rows="3" placeholder="Summary of what the farm unit funds..." required></textarea>
                    </div>

                    <div class="mb-4">
                        <label class="form-label small fw-semibold text-muted">Participation Terms</label>
                        <textarea name="terms" class="form-control rounded-3" rows="2" placeholder="Harvest tracking, field visit opportunities, and biological disclosures..." required></textarea>
                    </div>

                    <button type="submit" class="btn btn-farm-primary w-100 rounded-pill fw-bold py-2 shadow-sm">
                        Create Package
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/admin_footer.php'; ?>
