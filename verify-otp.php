<?php
// verify-otp.php - 6-Digit OTP Verification Screen

$page_title = "Verify Ghana Phone Number";
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/sms/SmsManager.php';

// Determine phone to verify: from session or logged-in unverified user
$phone = $_SESSION['pending_verification_phone'] ?? '';
$user_id = $_SESSION['pending_verification_user_id'] ?? $_SESSION['user_id'] ?? null;

if (empty($phone) && !empty($user_id)) {
    $stmt = $pdo->prepare("SELECT phone, phone_verified FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $u = $stmt->fetch();
    if ($u) {
        if ((int)$u['phone_verified'] === 1) {
            redirect('/dashboard.php');
        }
        $phone = $u['phone'];
    }
}

if (empty($phone)) {
    redirect('/login.php', 'warning', 'Please sign in or register to verify your phone number.');
}

$smsManager = new SmsManager($pdo);
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $otp = trim($_POST['otp'] ?? '');
    $verifyResult = $smsManager->verifyOtp($phone, $otp, 'registration');

    if ($verifyResult['success']) {
        // Fetch user record
        $stmt = $pdo->prepare("SELECT * FROM users WHERE phone = ?");
        $stmt->execute([$phone]);
        $user = $stmt->fetch();

        if ($user) {
            // Regenerate session id upon successful authentication
            session_regenerate_id(true);
            $_SESSION['user_id'] = (int)$user['id'];
            unset($_SESSION['pending_verification_phone']);
            unset($_SESSION['pending_verification_user_id']);

            redirect('/dashboard.php', 'success', 'Phone number verified successfully! Welcome to Animal Farm Ghana.');
        } else {
            redirect('/login.php', 'success', 'Phone verified! Please sign in with your credentials.');
        }
    } else {
        $error = $verifyResult['error'];
    }
}

// Check cooldown remaining for resend button
$cooldownRemaining = $smsManager->getResendCooldownRemaining($phone);

// Mask phone for display: 0244****56
$maskedPhone = substr($phone, 0, 4) . '****' . substr($phone, -2);

// Check if simulation OTP is stored in session (for sandbox test convenience)
$simulatedOtp = $_SESSION['debug_simulated_otp']['otp'] ?? null;

require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-7 col-lg-5">
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="card-header bg-farm-primary text-white p-4 text-center">
                    <div class="bg-white text-success rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-2 shadow-sm" style="width: 60px; height: 60px;">
                        <i class="bi bi-shield-check fs-2"></i>
                    </div>
                    <h4 class="fw-bold mb-1">Verify Your Phone</h4>
                    <p class="small text-white-70 mb-0">Ghana Security SMS Verification</p>
                </div>

                <div class="card-body p-4 p-md-5">
                    <?php if ($error): ?>
                        <div class="alert alert-danger border-0 rounded-3 small mb-4">
                            <i class="bi bi-exclamation-octagon me-1"></i> <?= htmlspecialchars($error) ?>
                        </div>
                    <?php endif; ?>

                    <?php if ($simulatedOtp): ?>
                        <!-- Sandbox Developer Test Helper Notice -->
                        <div class="alert alert-warning border-0 rounded-3 small mb-4">
                            <div class="d-flex align-items-center gap-2 mb-1">
                                <span class="badge bg-dark text-warning">SIMULATION SANDBOX</span>
                                <strong>SMS Dispatched</strong>
                            </div>
                            <div>Test verification code sent to <strong><?= htmlspecialchars($phone) ?></strong> is: <code class="fs-5 fw-bold text-dark px-2 py-1 bg-white rounded border border-warning ms-1"><?= htmlspecialchars($simulatedOtp) ?></code></div>
                            <small class="text-muted d-block mt-1">Live SMS API credentials can be configured in the admin portal.</small>
                        </div>
                    <?php endif; ?>

                    <p class="text-muted small text-center mb-4">
                        We sent a 6-digit verification code to <strong class="text-dark"><?= htmlspecialchars($maskedPhone) ?></strong>. The code is valid for 5 minutes.
                    </p>

                    <form method="POST" action="/verify-otp.php">
                        <?= csrf_field() ?>

                        <div class="mb-4">
                            <label for="otp" class="form-label fw-semibold small text-muted text-center d-block">Enter 6-Digit OTP Code</label>
                            <input type="text"
                                   class="form-control form-control-lg text-center fw-bold fs-3 letter-spacing-lg rounded-3"
                                   id="otp"
                                   name="otp"
                                   maxlength="6"
                                   inputmode="numeric"
                                   pattern="[0-9]{6}"
                                   placeholder="000000"
                                   autocomplete="one-time-code"
                                   autofocus
                                   required>
                        </div>

                        <button type="submit" class="btn btn-farm-primary btn-lg rounded-pill w-100 fw-bold shadow-sm mb-3">
                            Verify & Activate Account
                        </button>
                    </form>

                    <div class="text-center pt-3 border-top">
                        <form method="POST" action="/resend-otp.php" class="d-inline" data-no-double-submit>
                            <?= csrf_field() ?>
                            <input type="hidden" name="phone" value="<?= htmlspecialchars($phone) ?>">
                            <span class="text-muted small">Didn't receive the SMS code?</span><br>
                            <button type="submit" id="btn-resend-otp" class="btn btn-link text-success fw-bold text-decoration-none p-0 mt-1" <?= $cooldownRemaining > 0 ? 'disabled' : '' ?>>
                                Resend Verification Code <span id="otp-cooldown-timer" data-seconds="<?= $cooldownRemaining ?>"><?= $cooldownRemaining > 0 ? "({$cooldownRemaining}s)" : '' ?></span>
                            </button>
                        </form>
                    </div>

                    <div class="text-center mt-3">
                        <a href="/logout.php" class="text-muted small text-decoration-none"><i class="bi bi-arrow-left me-1"></i> Use a different phone number</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
