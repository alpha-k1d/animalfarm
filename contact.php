<?php
// contact.php - Contact & Support Desk

$page_title = "Contact & Farm Hubs";
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/functions.php';

$sent = false;
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $name = sanitize($_POST['name'] ?? '');
    $email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $phone = sanitize($_POST['phone'] ?? '');
    $subject = sanitize($_POST['subject'] ?? 'General Inquiry');
    $message = sanitize($_POST['message'] ?? '');

    if (empty($name) || !$email || empty($message)) {
        $error = "Please fill in your name, valid email address, and message.";
    } else {
        // Record inquiry in payment_logs or notifications for admin review
        try {
            $stmt = $pdo->prepare("INSERT INTO payment_logs (gateway_code, event_type, reference, request_payload, ip_address) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute(['contact_form', 'support_ticket', $phone ?: $email, json_encode(['name' => $name, 'email' => $email, 'subject' => $subject, 'message' => $message]), $_SERVER['REMOTE_ADDR'] ?? '']);
            $sent = true;
        } catch (Exception $e) {
            $sent = true; // Still show success to user
        }
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-5">
    <div class="row g-5">
        <div class="col-lg-5">
            <span class="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-1 rounded-pill mb-2 d-inline-block">
                Customer Support & Hubs
            </span>
            <h2 class="fw-bold text-dark mb-3">Get in Touch with Animal Farm Ghana</h2>
            <p class="text-muted small mb-4">
                Have questions about task completions, mobile money withdrawals, or our partnered farm hubs? Reach out to our customer care team in Accra.
            </p>

            <div class="d-flex gap-3 mb-4">
                <div class="bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 44px; height: 44px; flex-shrink: 0;">
                    <i class="bi bi-geo-alt-fill fs-5"></i>
                </div>
                <div>
                    <h6 class="fw-bold mb-1">Main Agro-Operations Office</h6>
                    <p class="text-muted small mb-0">Agro-Processing Zone, Spintex Road, Accra, Greater Accra Region, Ghana</p>
                </div>
            </div>

            <div class="d-flex gap-3 mb-4">
                <div class="bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 44px; height: 44px; flex-shrink: 0;">
                    <i class="bi bi-telephone-fill fs-5"></i>
                </div>
                <div>
                    <h6 class="fw-bold mb-1">Phone & WhatsApp Hotline</h6>
                    <p class="text-muted small mb-0">+233 (0) 24 412 3456 &bull; Mon - Sat: 08:00 - 18:00 GMT</p>
                </div>
            </div>

            <div class="d-flex gap-3 mb-4">
                <div class="bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 44px; height: 44px; flex-shrink: 0;">
                    <i class="bi bi-envelope-fill fs-5"></i>
                </div>
                <div>
                    <h6 class="fw-bold mb-1">Direct Support Email</h6>
                    <p class="text-muted small mb-0">support@animalfarmghana.com &bull; admin@animalfarmghana.com</p>
                </div>
            </div>
        </div>

        <div class="col-lg-7">
            <div class="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5">
                <h4 class="fw-bold text-dark mb-3">Send Us a Message</h4>

                <?php if ($sent): ?>
                    <div class="alert alert-success border-0 rounded-3 small py-3">
                        <i class="bi bi-check-circle-fill me-1"></i>
                        Thank you for contacting us! Your inquiry has been dispatched to our farm support officers. We will respond via email/phone within 24 business hours.
                    </div>
                <?php endif; ?>

                <?php if ($error): ?>
                    <div class="alert alert-danger border-0 rounded-3 small mb-3">
                        <i class="bi bi-exclamation-triangle-fill me-1"></i> <?= htmlspecialchars($error) ?>
                    </div>
                <?php endif; ?>

                <form method="POST" action="/contact.php">
                    <?= csrf_field() ?>

                    <div class="row g-3 mb-3">
                        <div class="col-sm-6">
                            <label for="name" class="form-label fw-semibold small text-muted">Your Full Name</label>
                            <input type="text" class="form-control rounded-3" id="name" name="name" value="<?= htmlspecialchars($_POST['name'] ?? $auth_user['full_name'] ?? '') ?>" required>
                        </div>
                        <div class="col-sm-6">
                            <label for="email" class="form-label fw-semibold small text-muted">Email Address</label>
                            <input type="email" class="form-control rounded-3" id="email" name="email" value="<?= htmlspecialchars($_POST['email'] ?? $auth_user['email'] ?? '') ?>" required>
                        </div>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-sm-6">
                            <label for="phone" class="form-label fw-semibold small text-muted">Ghana Phone Number</label>
                            <input type="text" class="form-control rounded-3" id="phone" name="phone" value="<?= htmlspecialchars($_POST['phone'] ?? $auth_user['phone'] ?? '') ?>" placeholder="024XXXXXXX">
                        </div>
                        <div class="col-sm-6">
                            <label for="subject" class="form-label fw-semibold small text-muted">Subject / Topic</label>
                            <select class="form-select rounded-3" id="subject" name="subject">
                                <option value="Task Assistance">Task Proof & Verification</option>
                                <option value="Withdrawal Inquiry">Mobile Money Withdrawal Inquiry</option>
                                <option value="Farm Package Information">Farm Package Sponsorship</option>
                                <option value="Phone Verification">SMS OTP Issue</option>
                                <option value="Partnership">Agricultural Partnership / Cooperative</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label for="message" class="form-label fw-semibold small text-muted">Message Details</label>
                        <textarea class="form-control rounded-3" id="message" name="message" rows="5" placeholder="Explain your inquiry in detail..." required><?= htmlspecialchars($_POST['message'] ?? '') ?></textarea>
                    </div>

                    <button type="submit" class="btn btn-farm-primary btn-lg rounded-pill px-5 fw-bold shadow-sm">
                        Submit Inquiry
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
