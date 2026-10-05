<?php
// profile.php - Member Profile & Security Settings

$page_title = "Account Settings";
require_once __DIR__ . '/includes/auth.php';

$user = get_auth_user($pdo);
$profile_error = null;
$password_error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $action = sanitize($_POST['action'] ?? '');

    if ($action === 'update_profile') {
        $full_name = sanitize($_POST['full_name'] ?? '');
        $email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);

        if (empty($full_name)) {
            $profile_error = "Full legal name cannot be empty.";
        } elseif (!$email) {
            $profile_error = "Please provide a valid email address.";
        } else {
            // Check if email taken by someone else
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
            $stmt->execute([$email, $user['id']]);
            if ($stmt->fetch()) {
                $profile_error = "This email is already in use by another user.";
            } else {
                $stmtUp = $pdo->prepare("UPDATE users SET full_name = ?, email = ? WHERE id = ?");
                $stmtUp->execute([$full_name, $email, $user['id']]);
                redirect('/profile.php', 'success', 'Profile information updated successfully.');
            }
        }
    } elseif ($action === 'change_password') {
        $current_password = $_POST['current_password'] ?? '';
        $new_password = $_POST['new_password'] ?? '';
        $confirm_password = $_POST['confirm_password'] ?? '';

        if (!password_verify($current_password, $user['password_hash'])) {
            $password_error = "The current password entered is incorrect.";
        } elseif (strlen($new_password) < 6) {
            $password_error = "New password must be at least 6 characters in length.";
        } elseif ($new_password !== $confirm_password) {
            $password_error = "New passwords do not match.";
        } else {
            $new_hash = password_hash($new_password, PASSWORD_DEFAULT);
            $stmtPass = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
            $stmtPass->execute([$new_hash, $user['id']]);
            redirect('/profile.php', 'success', 'Security password changed successfully.');
        }
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-4">
    <div class="row justify-content-center g-4">
        <div class="col-lg-4">
            <!-- Account Summary Card -->
            <div class="card border-0 shadow-sm rounded-4 bg-white p-4 text-center mb-4">
                <div class="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm" style="width: 70px; height: 70px; font-size: 1.8rem;">
                    <?= strtoupper(substr($user['full_name'], 0, 1)) ?>
                </div>
                <h5 class="fw-bold text-dark mb-1"><?= htmlspecialchars($user['full_name']) ?></h5>
                <p class="text-muted small mb-2"><?= htmlspecialchars($user['email']) ?></p>
                <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1 mb-3">
                    <i class="bi bi-shield-check me-1"></i> Verified Phone
                </span>

                <div class="border-top pt-3 text-start small">
                    <div class="d-flex justify-content-between py-1">
                        <span class="text-muted">Ghana Phone:</span>
                        <strong class="text-dark"><?= htmlspecialchars($user['phone']) ?></strong>
                    </div>
                    <div class="d-flex justify-content-between py-1">
                        <span class="text-muted">Referral Code:</span>
                        <code class="fw-bold text-dark"><?= htmlspecialchars($user['referral_code']) ?></code>
                    </div>
                    <div class="d-flex justify-content-between py-1">
                        <span class="text-muted">Member Since:</span>
                        <span class="text-dark"><?= date('M d, Y', strtotime($user['created_at'])) ?></span>
                    </div>
                    <div class="d-flex justify-content-between py-1">
                        <span class="text-muted">Status:</span>
                        <span class="badge bg-success text-white rounded-pill"><?= ucfirst($user['status']) ?></span>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-lg-8">
            <!-- Edit Profile Details -->
            <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
                <h5 class="fw-bold text-dark mb-3">Profile Information</h5>

                <?php if ($profile_error): ?>
                    <div class="alert alert-danger border-0 rounded-3 small mb-3">
                        <i class="bi bi-exclamation-octagon me-1"></i> <?= htmlspecialchars($profile_error) ?>
                    </div>
                <?php endif; ?>

                <form method="POST" action="/profile.php">
                    <?= csrf_field() ?>
                    <input type="hidden" name="action" value="update_profile">

                    <div class="mb-3">
                        <label for="full_name" class="form-label fw-semibold small text-muted">Full Legal Name</label>
                        <input type="text" class="form-control rounded-3" id="full_name" name="full_name" value="<?= htmlspecialchars($_POST['full_name'] ?? $user['full_name']) ?>" required>
                    </div>

                    <div class="mb-3">
                        <label for="email" class="form-label fw-semibold small text-muted">Email Address</label>
                        <input type="email" class="form-control rounded-3" id="email" name="email" value="<?= htmlspecialchars($_POST['email'] ?? $user['email']) ?>" required>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-semibold small text-muted">Registered Ghana Phone (MoMo Identity)</label>
                        <input type="text" class="form-control rounded-3 bg-light" value="<?= htmlspecialchars($user['phone']) ?>" readonly>
                        <div class="form-text small text-muted">Phone numbers are locked to your verified identity. Contact support if you need to transfer numbers.</div>
                    </div>

                    <button type="submit" class="btn btn-farm-primary rounded-pill px-4 fw-bold shadow-sm">
                        Save Changes
                    </button>
                </form>
            </div>

            <!-- Change Password -->
            <div class="card border-0 shadow-sm rounded-4 bg-white p-4">
                <h5 class="fw-bold text-dark mb-3">Security & Password</h5>

                <?php if ($password_error): ?>
                    <div class="alert alert-danger border-0 rounded-3 small mb-3">
                        <i class="bi bi-exclamation-octagon me-1"></i> <?= htmlspecialchars($password_error) ?>
                    </div>
                <?php endif; ?>

                <form method="POST" action="/profile.php">
                    <?= csrf_field() ?>
                    <input type="hidden" name="action" value="change_password">

                    <div class="mb-3">
                        <label for="current_password" class="form-label fw-semibold small text-muted">Current Password</label>
                        <input type="password" class="form-control rounded-3" id="current_password" name="current_password" required>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-sm-6">
                            <label for="new_password" class="form-label fw-semibold small text-muted">New Password</label>
                            <input type="password" class="form-control rounded-3" id="new_password" name="new_password" placeholder="Min. 6 characters" required>
                        </div>
                        <div class="col-sm-6">
                            <label for="confirm_password" class="form-label fw-semibold small text-muted">Confirm New Password</label>
                            <input type="password" class="form-control rounded-3" id="confirm_password" name="confirm_password" placeholder="Re-enter new password" required>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-outline-danger rounded-pill px-4 fw-bold">
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
