<?php
// packages.php - Legitimate Farm Packages & Agricultural Participation

$page_title = "Farm Packages & Agro-Participation";
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/functions.php';

$auth_user = get_auth_user($pdo);
$stmt = $pdo->query("SELECT * FROM farm_packages WHERE status = 'active' ORDER BY id ASC");
$packages = $stmt->fetchAll();

// Handle package participation purchase using wallet balance
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['package_id'])) {
    if (!$auth_user) {
        redirect('/login.php', 'warning', 'Please sign in to participate in a farm package.');
    }
    csrf_verify();

    $pkgId = (int)$_POST['package_id'];
    $stmtPkg = $pdo->prepare("SELECT * FROM farm_packages WHERE id = ? AND status = 'active'");
    $stmtPkg->execute([$pkgId]);
    $pkg = $stmtPkg->fetch();

    if (!$pkg) {
        redirect('/packages.php', 'danger', 'Selected farm package is not available.');
    }

    $price = (float)$pkg['price'];

    if ((float)$auth_user['wallet_balance'] < $price) {
        // Redirect to payment page to fund wallet
        redirect('/payment.php?amount=' . urlencode($price) . '&desc=' . urlencode('Funding for ' . $pkg['name']), 'warning', 'Insufficient wallet balance for this package. Please fund your wallet via Paystack Mobile Money or Bitcoin.');
    } else {
        try {
            $pdo->beginTransaction();

            // Lock user row
            $stmtUser = $pdo->prepare("SELECT wallet_balance FROM users WHERE id = ? FOR UPDATE");
            $stmtUser->execute([$auth_user['id']]);
            $currentBal = (float)$stmtUser->fetchColumn();

            if ($currentBal < $price) {
                $pdo->rollBack();
                redirect('/packages.php', 'danger', 'Insufficient wallet balance.');
            }

            // Deduct balance
            $stmtDeduct = $pdo->prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?");
            $stmtDeduct->execute([$price, $auth_user['id']]);

            // Create user_package record
            $startDate = date('Y-m-d');
            $endDate = date('Y-m-d', strtotime("+{$pkg['duration_days']} days"));
            $stmtUserPkg = $pdo->prepare("INSERT INTO user_packages (user_id, package_id, amount_paid, status, start_date, end_date, notes) VALUES (?, ?, ?, 'active', ?, ?, ?)");
            $stmtUserPkg->execute([$auth_user['id'], $pkg['id'], $price, $startDate, $endDate, 'Enrolled via wallet balance']);

            // Ledger transaction
            record_transaction($pdo, $auth_user['id'], 'Purchase', $price, "Sponsorship for {$pkg['name']}", 'completed');

            // Notification
            create_notification(
                $pdo,
                $auth_user['id'],
                'Farm Package Enrolled',
                "You have successfully enrolled in {$pkg['name']}. You can track progress in the My Farm section.",
                'system',
                '/farm.php'
            );

            $pdo->commit();
            redirect('/farm.php', 'success', 'Successfully enrolled in ' . htmlspecialchars($pkg['name']) . '! View your active cycle in My Farm.');
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log("Package purchase error: " . $e->getMessage());
            redirect('/packages.php', 'danger', 'Error enrolling in farm package: ' . $e->getMessage());
        }
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-4">
    <!-- Header banner -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5 mb-5">
        <div class="row align-items-center g-4">
            <div class="col-lg-8">
                <span class="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-1 rounded-pill mb-2">
                    Direct Agricultural Participation
                </span>
                <h2 class="fw-bold text-dark mb-2">Farm Packages & Cooperative Sponsorships</h2>
                <p class="text-muted mb-0">
                    Participate directly in verified Ghanaian crop and livestock units. Your contribution funds direct inputs (feed, seeds, vaccination, veterinary care) while providing you with digital harvest tracking, field visit opportunities, or fresh farm produce allotments upon harvest completion.
                </p>
            </div>
            <div class="col-lg-4 text-lg-end">
                <div class="bg-light p-3 rounded-4 border d-inline-block text-start">
                    <small class="text-muted d-block">Transparency Pledge:</small>
                    <span class="small fw-bold text-dark"><i class="bi bi-shield-check text-success me-1"></i> No False or Guaranteed Returns</span>
                    <small class="text-muted d-block mt-1">Real agricultural contracts only.</small>
                </div>
            </div>
        </div>
    </div>

    <!-- Packages Grid -->
    <div class="row g-4">
        <?php foreach ($packages as $pkg): ?>
        <div class="col-lg-6">
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100 bg-white card-hover d-flex flex-column justify-content-between">
                <div>
                    <div class="position-relative">
                        <img src="<?= htmlspecialchars($pkg['image']) ?>" alt="<?= htmlspecialchars($pkg['name']) ?>" class="w-100" style="height: 240px; object-fit: cover;">
                        <span class="position-absolute top-0 start-0 m-3 category-pill bg-white shadow-sm">
                            <?= htmlspecialchars($pkg['category']) ?>
                        </span>
                        <span class="position-absolute bottom-0 end-0 m-3 badge bg-dark bg-opacity-75 text-white px-3 py-2 rounded-pill">
                            <i class="bi bi-clock me-1"></i> <?= (int)$pkg['duration_days'] ?> Days Cycle
                        </span>
                    </div>

                    <div class="p-4">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h4 class="fw-bold text-dark mb-0"><?= htmlspecialchars($pkg['name']) ?></h4>
                            <div class="fs-4 fw-bold text-success text-end"><?= money($pkg['price']) ?></div>
                        </div>

                        <p class="text-muted small mb-3">
                            <?= htmlspecialchars($pkg['description']) ?>
                        </p>

                        <div class="bg-light p-3 rounded-3 small border mb-3">
                            <strong class="d-block text-dark mb-1"><i class="bi bi-file-earmark-text me-1 text-primary"></i> Participation Terms:</strong>
                            <span class="text-muted"><?= htmlspecialchars($pkg['terms']) ?></span>
                        </div>
                    </div>
                </div>

                <div class="p-4 pt-0">
                    <?php if ($auth_user): ?>
                        <form method="POST" action="/packages.php">
                            <?= csrf_field() ?>
                            <input type="hidden" name="package_id" value="<?= $pkg['id'] ?>">
                            <button type="submit" class="btn btn-farm-primary rounded-pill w-100 fw-bold py-2 shadow-sm">
                                Participate for <?= money($pkg['price']) ?>
                            </button>
                        </form>
                    <?php else: ?>
                        <a href="/login.php" class="btn btn-outline-success rounded-pill w-100 fw-bold py-2">
                            Log In to Participate
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
