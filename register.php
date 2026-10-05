<?php
// register.php - User Registration with Ghana Phone & OTP Dispatch

$page_title = "Create an Account";
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/sms/SmsManager.php';

// Redirect if already logged in and verified
if (!empty($_SESSION['user_id'])) {
    $u = get_auth_user($pdo);
    if ($u && (int)$u['phone_verified'] === 1) {
        redirect('/dashboard.php');
    }
}

$ref_code = sanitize($_GET['ref'] ?? $_POST['referral_code'] ?? '');
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $full_name = sanitize($_POST['full_name'] ?? '');
    $email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $phone = trim($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $terms = !empty($_POST['terms']);

    // Validation
    if (empty($full_name)) {
        $errors[] = "Please provide your full legal name.";
    }
    if (!$email) {
        $errors[] = "Please enter a valid email address.";
    }
    if (!validate_gh_phone($phone)) {
        $errors[] = "Please enter a valid Ghanaian phone number (e.g., 024XXXXXXX or 055XXXXXXX).";
    }
    $phone_clean = normalize_gh_phone($phone);

    if (strlen($password) < 6) {
        $errors[] = "Password must be at least 6 characters in length.";
    }
    if ($password !== $confirm_password) {
        $errors[] = "Passwords do not match.";
    }
    if (!$terms) {
        $errors[] = "You must agree to the Terms of Service and Privacy Policy to register.";
    }

    // Check duplicate email
    if ($email) {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $errors[] = "An account with this email address already exists. Please log in.";
        }
    }

    // Check duplicate phone
    if (!empty($phone_clean)) {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE phone = ?");
        $stmt->execute([$phone_clean]);
        if ($stmt->fetch()) {
            $errors[] = "An account with this phone number already exists. Please log in.";
        }
    }

    // Validate referral code if supplied
    $referrer_id = null;
    if (!empty($ref_code)) {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE referral_code = ?");
        $stmt->execute([$ref_code]);
        $referrer = $stmt->fetch();
        if ($referrer) {
            $referrer_id = (int)$referrer['id'];
        } else {
            $errors[] = "The referral code entered is invalid. Leave blank if none.";
        }
    }

    if (empty($errors)) {
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        $referral_code = generate_referral_code($pdo);

        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("INSERT INTO users (full_name, email, phone, password_hash, referral_code, referred_by_id, status, phone_verified) VALUES (?, ?, ?, ?, ?, ?, 'pending', 0)");
            $stmt->execute([$full_name, $email, $phone_clean, $password_hash, $referral_code, $referrer_id]);
            $new_user_id = (int)$pdo->lastInsertId();

            // Record referral if applicable
            if ($referrer_id) {
                $stmtRef = $pdo->prepare("INSERT INTO referrals (referrer_id, referred_user_id, referral_code, status, reward_amount) VALUES (?, ?, ?, 'pending', ?)");
                $stmtRef->execute([$referrer_id, $new_user_id, $ref_code, REFERRAL_REWARD]);
            }

            // Create welcome notification
            create_notification(
                $pdo,
                $new_user_id,
                'Welcome to Animal Farm Ghana',
                'Your account has been created. Please complete phone verification to access all farm tasks and rewards.',
                'system',
                '/dashboard.php'
            );

            $pdo->commit();

            // Dispatch OTP
            $smsManager = new SmsManager($pdo);
            $otpResult = $smsManager->sendOtp($new_user_id, $phone_clean, 'registration');

            // Set session for OTP page
            $_SESSION['pending_verification_phone'] = $phone_clean;
            $_SESSION['pending_verification_user_id'] = $new_user_id;

            redirect('/verify-otp.php', 'success', 'Account registered! A 6-digit verification code has been dispatched to ' . htmlspecialchars($phone_clean));
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log("Registration error: " . $e->getMessage());
            $errors[] = "A system error occurred during registration. Please try again.";
        }
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="card-header bg-farm-primary text-white p-4 text-center">
                    <span class="fs-1"></span>
                    <h4 class="fw-bold mb-1">Create Farmer Account</h4>
                    <p class="small text-white-70 mb-0">Join Animal Farm Ghana & Earn Legitimate Task Rewards</p>
                </div>

                <div class="card-body p-4 p-md-5">
                    <?php if (!empty($errors)): ?>
                        <div class="alert alert-danger border-0 rounded-3 small mb-4">
                            <ul class="mb-0 ps-3">
                                <?php foreach ($errors as $err): ?>
                                    <li><?= htmlspecialchars($err) ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    <?php endif; ?>

                    <form method="POST" action="/register.php">
                        <?= csrf_field() ?>

                        <div class="mb-3">
                            <label for="full_name" class="form-label fw-semibold small text-muted">Full Legal Name</label>
                            <input type="text" class="form-control form-control-lg rounded-3 fs-6" id="full_name" name="full_name" value="<?= htmlspecialchars($_POST['full_name'] ?? '') ?>" placeholder="e.g. Kwame Mensah" required>
                        </div>

                        <div class="mb-3">
                            <label for="phone" class="form-label fw-semibold small text-muted">Ghana Phone Number (Mobile Money)</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0 text-muted">GH +233</span>
                                <input type="tel" class="form-control form-control-lg rounded-end-3 fs-6" id="phone" name="phone" value="<?= htmlspecialchars($_POST['phone'] ?? '') ?>" placeholder="024XXXXXXX" required>
                            </div>
                            <div class="form-text small text-muted">A 6-digit SMS OTP verification code will be sent to this number.</div>
                        </div>

                        <div class="mb-3">
                            <label for="email" class="form-label fw-semibold small text-muted">Email Address</label>
                            <input type="email" class="form-control form-control-lg rounded-3 fs-6" id="email" name="email" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" placeholder="name@example.com" required>
                        </div>

                        <div class="row g-3 mb-3">
                            <div class="col-sm-6">
                                <label for="password" class="form-label fw-semibold small text-muted">Password</label>
                                <input type="password" class="form-control form-control-lg rounded-3 fs-6" id="password" name="password" placeholder="Min. 6 characters" required>
                            </div>
                            <div class="col-sm-6">
                                <label for="confirm_password" class="form-label fw-semibold small text-muted">Confirm Password</label>
                                <input type="password" class="form-control form-control-lg rounded-3 fs-6" id="confirm_password" name="confirm_password" placeholder="Re-type password" required>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="referral_code" class="form-label fw-semibold small text-muted">Referral Code (Optional)</label>
                            <input type="text" class="form-control form-control-lg rounded-3 fs-6" id="referral_code" name="referral_code" value="<?= htmlspecialchars($ref_code) ?>" placeholder="e.g. AFG83921">
                        </div>

                        <div class="mb-4">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="terms" name="terms" value="1" <?= !empty($_POST['terms']) ? 'checked' : '' ?> required>
                                <label class="form-check-label small text-muted" for="terms">
                                    I agree to the <a href="/terms.php" target="_blank" class="text-success text-decoration-none">Terms of Service</a>, <a href="/privacy.php" target="_blank" class="text-success text-decoration-none">Privacy Policy</a>, and understand Animal Farm Ghana is an agricultural task hub, not a guaranteed investment scheme.
                                </label>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-farm-primary btn-lg rounded-pill w-100 fw-bold shadow-sm mb-3">
                            Register & Receive SMS OTP
                        </button>

                        <div class="text-center small text-muted">
                            Already have an account? <a href="/login.php" class="text-success fw-bold text-decoration-none">Sign In Here</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
