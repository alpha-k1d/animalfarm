<?php
// terms.php - Terms of Service

$page_title = "Terms of Service";
require_once __DIR__ . '/includes/header.php';
?>

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-9">
            <div class="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5">
                <span class="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-1 rounded-pill mb-2 d-inline-block">
                    Official Regulatory Terms
                </span>
                <h2 class="fw-bold text-dark mb-3">Terms of Service</h2>
                <small class="text-muted d-block mb-4">Effective Date: January 1, <?= date('Y') ?> &bull; Jurisdiction: Republic of Ghana</small>

                <div class="alert alert-warning border-0 rounded-3 small mb-4">
                    <strong class="d-block mb-1">CRITICAL NOTICE & AGRICULTURAL DISCLAIMER:</strong>
                    Animal Farm Ghana is an agricultural task fulfillment, community engagement, and farm activity sponsorship platform operating exclusively under Ghanaian law. We are NOT a financial institution, bank, deposit-taking entity, or passive investment scheme. We do not provide or guarantee fixed daily interest or speculative returns.
                </div>

                <div class="text-muted small lh-lg">
                    <h5 class="fw-bold text-dark mt-4 mb-2">1. Account Registration & Phone Verification</h5>
                    <p>To access task assignments and receive eligible rewards, all users must register with a valid Ghanaian telephone number (MTN, Telecel, or AirtelTigo) and successfully complete our SMS 6-Digit One-Time Password (OTP) verification. Creating duplicate, robotic, or fraudulent accounts is strictly prohibited and results in immediate termination.</p>

                    <h5 class="fw-bold text-dark mt-4 mb-2">2. Agricultural Tasks & Proof Requirements</h5>
                    <p>Users earn designated rewards in Ghana Cedi (GH₵) solely upon the truthful completion and manual administrative review of designated tasks (e.g., livestock headcounts, farm bio-security logs, pen cleanliness surveys). Submitting fraudulent, manipulated, or duplicate photographs or text notes will lead to task rejection and potential forfeiture of pending rewards.</p>

                    <h5 class="fw-bold text-dark mt-4 mb-2">3. Farm Packages & Participation Contracts</h5>
                    <p>Farm package participation represents direct contributions toward tangible agricultural inputs (livestock feed, seed stocks, veterinary medications, bio-secure fencing). Production cycles are subject to natural environmental and biological factors. Sponsoring users receive progress updates and allocated farm produce or harvest value distributions upon seasonal conclusion.</p>

                    <h5 class="fw-bold text-dark mt-4 mb-2">4. Withdrawals & Payout Thresholds</h5>
                    <p>The minimum withdrawal threshold is <strong><?= money(MIN_WITHDRAWAL) ?></strong> and the maximum per single transaction is <strong><?= money(MAX_WITHDRAWAL) ?></strong>. Disbursements are processed to verified Ghana Mobile Money accounts matching the registered user's legal identity or to verified Bitcoin addresses.</p>

                    <h5 class="fw-bold text-dark mt-4 mb-2">5. Anti-Fraud & Suspension</h5>
                    <p>Animal Farm Ghana reserves the unilateral right to freeze accounts, halt pending payouts, and report abusive actors to the relevant regulatory authorities in Ghana if botting, payment laundering, or fraudulent referral schemes are detected.</p>

                    <h5 class="fw-bold text-dark mt-4 mb-2">6. Contact & Disputes</h5>
                    <p>All legal disputes shall be settled in accordance with the Alternative Dispute Resolution Act, 2010 (Act 798) and the laws of the Republic of Ghana.</p>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
