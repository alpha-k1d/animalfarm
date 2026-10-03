<?php
// refund.php - Refund & Cancellation Policy

$page_title = "Refund Policy";
require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-9">
            <div class="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5">
                <span class="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-1 rounded-pill mb-2 d-inline-block">
                    Consumer Rights
                </span>
                <h2 class="fw-bold text-dark mb-3">Refund & Cancellation Policy</h2>
                <small class="text-muted d-block mb-4">Effective: <?= date('Y') ?></small>

                <div class="text-muted small lh-lg">
                    <h5 class="fw-bold text-dark mt-4 mb-2">1. Task Rewards</h5>
                    <p>Rewards credited to user accounts upon approved task submissions are non-refundable to the farm and remain the earned property of the participant, withdrawable in accordance with standard withdrawal guidelines.</p>

                    <h5 class="fw-bold text-dark mt-4 mb-2">2. Farm Package Enrollments</h5>
                    <p>Once a farm package participation contract has been enrolled and physical agricultural inputs (such as day-old chicks, feed, fertilizer, or fingerlings) have been acquired or disbursed to cooperative units, cancellations are subject to review. If requested within 48 hours of enrollment and before agricultural input deployment, a full refund to your rewards wallet is available.</p>

                    <h5 class="fw-bold text-dark mt-4 mb-2">3. Erroneous Deposits</h5>
                    <p>If you made a duplicate payment via Paystack or sent funds erroneously, please contact our support desk at <code>support@animalfarmghana.com</code> within 24 hours with your transaction reference for reconciliation and refund.</p>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
