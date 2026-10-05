<?php
// includes/footer.php - Global Page Footer & Mobile Navigation

$current_page = basename($_SERVER['SCRIPT_NAME'] ?? '');
$is_auth = !empty($_SESSION['user_id']);
?>
</main>

<!-- Footer -->
<footer class="bg-dark text-white-50 pt-5 pb-4 mt-5 border-top border-secondary">
    <div class="container">
        <div class="row g-4">
            <!-- Brand & Mission -->
            <div class="col-lg-4 col-md-6">
                <div class="d-flex align-items-center gap-2 mb-3">
                    <span class="fs-2"></span>
                    <div>
                        <h5 class="text-white mb-0 fw-bold"><?= SITE_NAME ?></h5>
                        <small class="text-warning">GH Ghana Agricultural Hub</small>
                    </div>
                </div>
                <p class="small text-white-50">
                    Animal Farm Ghana connects Ghanaian youth and agricultural stakeholders through verified farm tasks, real farming sponsorships, and legitimate eligible rewards.
                </p>
                <div class="d-flex gap-3 text-white fs-5">
                    <a href="#" class="text-white-50 hover-white"><i class="bi bi-facebook"></i></a>
                    <a href="#" class="text-white-50 hover-white"><i class="bi bi-twitter-x"></i></a>
                    <a href="#" class="text-white-50 hover-white"><i class="bi bi-instagram"></i></a>
                    <a href="#" class="text-white-50 hover-white"><i class="bi bi-whatsapp"></i></a>
                </div>
            </div>

            <!-- Quick Links -->
            <div class="col-lg-2 col-md-3 col-6">
                <h6 class="text-white fw-bold mb-3">Platform</h6>
                <ul class="list-unstyled small">
                    <li class="mb-2"><a href="/tasks.php" class="text-white-50 text-decoration-none hover-white">Available Tasks</a></li>
                    <li class="mb-2"><a href="/packages.php" class="text-white-50 text-decoration-none hover-white">Farm Packages</a></li>
                    <li class="mb-2"><a href="/farm.php" class="text-white-50 text-decoration-none hover-white">My Farm</a></li>
                    <li class="mb-2"><a href="/wallet.php" class="text-white-50 text-decoration-none hover-white">Rewards Wallet</a></li>
                    <li class="mb-2"><a href="/referrals.php" class="text-white-50 text-decoration-none hover-white">Referral Program</a></li>
                </ul>
            </div>

            <!-- Payment & Security -->
            <div class="col-lg-3 col-md-3 col-6">
                <h6 class="text-white fw-bold mb-3">Payments & MoMo</h6>
                <ul class="list-unstyled small">
                    <li class="mb-2 text-white-50"><i class="bi bi-phone me-1 text-warning"></i> MTN Mobile Money</li>
                    <li class="mb-2 text-white-50"><i class="bi bi-phone me-1 text-danger"></i> Telecel Cash</li>
                    <li class="mb-2 text-white-50"><i class="bi bi-phone me-1 text-primary"></i> AT Money (AirtelTigo)</li>
                    <li class="mb-2 text-white-50"><i class="bi bi-currency-bitcoin me-1 text-warning"></i> Bitcoin Gateway</li>
                    <li class="mb-2 text-white-50"><i class="bi bi-shield-check me-1 text-success"></i> Paystack Secured</li>
                </ul>
            </div>

            <!-- Compliance & Legal -->
            <div class="col-lg-3 col-md-12">
                <h6 class="text-white fw-bold mb-3">Legal & Transparency</h6>
                <ul class="list-unstyled small">
                    <li class="mb-2"><a href="/terms.php" class="text-white-50 text-decoration-none hover-white">Terms of Service</a></li>
                    <li class="mb-2"><a href="/privacy.php" class="text-white-50 text-decoration-none hover-white">Privacy Policy</a></li>
                    <li class="mb-2"><a href="/refund.php" class="text-white-50 text-decoration-none hover-white">Refund Policy</a></li>
                    <li class="mb-2"><a href="/risk.php" class="text-white-50 text-decoration-none hover-white">Agricultural Risk Disclosure</a></li>
                    <li class="mb-2"><a href="/contact.php" class="text-white-50 text-decoration-none hover-white">Contact & Office Locations</a></li>
                </ul>
            </div>
        </div>

        <hr class="border-secondary my-4">

        <!-- Legal Disclaimer Requirement -->
        <div class="small text-white-50 mb-3 text-center">
            <p class="mb-1">
                <strong>Regulatory & Transparency Notice:</strong> Animal Farm Ghana is an agricultural task completion, education, and farm activity sponsorship hub. We do not provide financial investment services, guaranteed returns, or daily interest. All transactions are processed exclusively in Ghana Cedi (GH₵).
            </p>
            <p class="mb-0">
                &copy; <?= date('Y') ?> <?= SITE_NAME ?>. All rights reserved. Registered under the laws of the Republic of Ghana.
            </p>
        </div>
    </div>
</footer>

<!-- Mobile Bottom Navigation Bar (Visible only on mobile devices) -->
<nav class="mobile-bottom-nav">
    <a href="/index.php" class="nav-item nav-link <?= ($current_page === 'index.php') ? 'active' : '' ?>">
        <i class="bi bi-house-door nav-icon"></i>
        <span>Home</span>
    </a>
    <a href="/tasks.php" class="nav-item nav-link <?= ($current_page === 'tasks.php' || $current_page === 'task.php') ? 'active' : '' ?>">
        <i class="bi bi-check2-circle nav-icon"></i>
        <span>Tasks</span>
    </a>
    <a href="<?= $is_auth ? '/wallet.php' : '/login.php' ?>" class="nav-item nav-link <?= ($current_page === 'wallet.php' || $current_page === 'withdraw.php') ? 'active' : '' ?>">
        <i class="bi bi-wallet2 nav-icon"></i>
        <span>Wallet</span>
    </a>
    <a href="/farm.php" class="nav-item nav-link <?= ($current_page === 'farm.php') ? 'active' : '' ?>">
        <i class="bi bi-flower1 nav-icon"></i>
        <span>Farm</span>
    </a>
    <a href="<?= $is_auth ? '/dashboard.php' : '/login.php' ?>" class="nav-item nav-link <?= ($current_page === 'dashboard.php' || $current_page === 'profile.php' || $current_page === 'login.php') ? 'active' : '' ?>">
        <i class="bi bi-person-circle nav-icon"></i>
        <span><?= $is_auth ? 'Account' : 'Login' ?></span>
    </a>
</nav>

<!-- Bootstrap 5 Bundle JS CDN -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<!-- Custom JS -->
<script src="/assets/js/app.js"></script>
</body>
</html>
