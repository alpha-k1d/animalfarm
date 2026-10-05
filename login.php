<?php
// login.php - Farmer Login Screen

$page_title = "Member Login";
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/functions.php';

// Redirect if already logged in and verified
if (!empty($_SESSION['user_id'])) {
    $u = get_auth_user($pdo);
    if ($u && (int)$u['phone_verified'] === 1) {
        redirect('/dashboard.php');
    }
}

$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $identifier = trim($_POST['identifier'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($identifier) || empty($password)) {
        $error = "Please enter your email or Ghana phone number, and password.";
    } else {
        // Query user by email or normalized phone
        $phone_clean = normalize_gh_phone($identifier);

        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? OR phone = ? OR phone = ?");
        $stmt->execute([$identifier, $identifier, $phone_clean]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            // Check suspension
            if ($user['status'] === 'suspended') {
                $error = "This account has been suspended by administration. Please contact support.";
            } else {
                // Regenerate session id upon successful authentication
                session_regenerate_id(true);
                $_SESSION['user_id'] = (int)$user['id'];

                // Check phone verification
                if ((int)$user['phone_verified'] === 0 || $user['status'] === 'pending') {
                    $_SESSION['pending_verification_phone'] = $user['phone'];
                    $_SESSION['pending_verification_user_id'] = (int)$user['id'];

                    // Trigger OTP dispatch if needed
                    require_once __DIR__ . '/sms/SmsManager.php';
                    $sms = new SmsManager($pdo);
                    $sms->sendOtp((int)$user['id'], $user['phone'], 'registration');

                    redirect('/verify-otp.php', 'warning', 'Please verify your phone number to complete login.');
                }

                $redirectTo = $_SESSION['redirect_after_login'] ?? '/dashboard.php';
                unset($_SESSION['redirect_after_login']);

                redirect($redirectTo, 'success', 'Welcome back, ' . htmlspecialchars($user['full_name']) . '!');
            }
        } else {
            $error = "Invalid credentials. Please verify your phone/email and password.";
        }
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-7 col-lg-5">
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="card-header bg-farm-primary text-white p-4 text-center">
                    <span class="fs-1"></span>
                    <h4 class="fw-bold mb-1">Welcome Back</h4>
                    <p class="small text-white-70 mb-0">Sign in to your Animal Farm Ghana account</p>
                </div>

                <div class="card-body p-4 p-md-5">
                    <?php if ($error): ?>
                        <div class="alert alert-danger border-0 rounded-3 small mb-4">
                            <i class="bi bi-exclamation-triangle-fill me-1"></i> <?= htmlspecialchars($error) ?>
                        </div>
                    <?php endif; ?>

                    <form method="POST" action="/login.php">
                        <?= csrf_field() ?>

                        <div class="mb-3">
                            <label for="identifier" class="form-label fw-semibold small text-muted">Email Address or Ghana Phone</label>
                            <input type="text" class="form-control form-control-lg rounded-3 fs-6" id="identifier" name="identifier" value="<?= htmlspecialchars($_POST['identifier'] ?? '') ?>" placeholder="e.g. 0244123456 or name@example.com" required autofocus>
                        </div>

                        <div class="mb-3">
                            <div class="d-flex justify-content-between align-items-center">
                                <label for="password" class="form-label fw-semibold small text-muted">Password</label>
                                <a href="/contact.php" class="small text-success text-decoration-none">Forgot password?</a>
                            </div>
                            <input type="password" class="form-control form-control-lg rounded-3 fs-6" id="password" name="password" placeholder="Enter your password" required>
                        </div>

                        <button type="submit" class="btn btn-farm-primary btn-lg rounded-pill w-100 fw-bold shadow-sm mb-3">
                            Sign In to Account
                        </button>

                        <div class="text-center small text-muted mb-4">
                            Don't have an account yet? <a href="/register.php" class="text-success fw-bold text-decoration-none">Create Account</a>
                        </div>
                    </form>

                    <!-- Demo Credentials Card -->
                    <div class="bg-light p-3 rounded-3 border">
                        <small class="fw-bold text-dark d-block mb-1"><i class="bi bi-info-circle me-1 text-primary"></i> Pre-seeded Demo Credentials:</small>
                        <div class="small text-muted mb-1"><strong>Phone:</strong> <code>0244123456</code> | <strong>Password:</strong> <code>User@1234</code></div>
                        <div class="small text-muted"><strong>Admin Portal:</strong> <a href="/admin/login.php" class="text-primary text-decoration-none">Click here for Admin Login</a></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
