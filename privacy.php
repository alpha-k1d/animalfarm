<?php
// privacy.php - Privacy Policy

$page_title = "Privacy Policy";
require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-9">
            <div class="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5">
                <span class="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-1 rounded-pill mb-2 d-inline-block">
                    Data Protection Act, 2012 (Act 843)
                </span>
                <h2 class="fw-bold text-dark mb-3">Privacy & Data Policy</h2>
                <small class="text-muted d-block mb-4">Last Updated: January 1, <?= date('Y') ?></small>

                <div class="text-muted small lh-lg">
                    <h5 class="fw-bold text-dark mt-4 mb-2">1. Personal Information We Collect</h5>
                    <p>We collect your full legal name, active Ghanaian mobile telephone number, email address, IP address, and task submission uploads (including geolocation metadata in uploaded photos where applicable). This data is strictly utilized to authenticate your identity, prevent bot-driven fraud, and disburse mobile money rewards.</p>

                    <h5 class="fw-bold text-dark mt-4 mb-2">2. Mobile Phone Number Protection</h5>
                    <p>Your Ghana mobile number is stored securely with cryptographic validation. We do not sell, rent, or lease your phone number or contact details to third-party telemarketers or advertisers.</p>

                    <h5 class="fw-bold text-dark mt-4 mb-2">3. Payment & Mobile Money Data</h5>
                    <p>All online credit card and direct mobile money processing is handled securely by PCI-DSS certified payment processors (e.g. Paystack). We never store raw debit card CVVs or mobile money PINs on our servers.</p>

                    <h5 class="fw-bold text-dark mt-4 mb-2">4. SMS Notifications</h5>
                    <p>By registering, you consent to receive security One-Time Passwords (OTPs) and account transaction alerts via SMS through authorized telecom aggregators in Ghana.</p>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
