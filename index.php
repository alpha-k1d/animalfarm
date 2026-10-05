<?php
// index.php - Animal Farm Ghana Public Homepage

$page_title = "Complete Agricultural Tasks & Support Farming";
require_once __DIR__ . '/includes/header.php';

// Fetch sample active tasks for preview
$stmtTasks = $pdo->query("SELECT * FROM tasks WHERE status = 'active' ORDER BY id DESC LIMIT 4");
$featured_tasks = $stmtTasks->fetchAll();

// Fetch sample packages
$stmtPkgs = $pdo->query("SELECT * FROM farm_packages WHERE status = 'active' ORDER BY id ASC LIMIT 3");
$featured_packages = $stmtPkgs->fetchAll();
?>

<!-- Hero Section -->
<section class="hero-section text-center text-lg-start">
    <div class="container py-5">
        <div class="row align-items-center g-5">
            <div class="col-lg-7">
                <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-3">
                    GH 100% Ghanaian Agricultural Hub
                </span>
                <h1 class="display-4 fw-extrabold mb-3 text-white">
                    Welcome to Animal Farm Ghana
                </h1>
                <p class="lead text-white-70 mb-4 fs-5">
                    Complete legitimate agricultural tasks, support verified farming cooperatives across Ghana, and earn eligible rewards in Ghana Cedi.
                </p>
                <div class="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                    <?php if (!$auth_user): ?>
                        <a href="/register.php" class="btn btn-warning btn-lg px-4 py-3 rounded-pill fw-bold text-dark shadow">
                            <i class="bi bi-person-plus-fill me-2"></i> Create Account
                        </a>
                        <a href="/login.php" class="btn btn-outline-light btn-lg px-4 py-3 rounded-pill fw-semibold">
                            <i class="bi bi-box-arrow-in-right me-2"></i> Member Login
                        </a>
                    <?php else: ?>
                        <a href="/dashboard.php" class="btn btn-warning btn-lg px-4 py-3 rounded-pill fw-bold text-dark shadow">
                            <i class="bi bi-speedometer2 me-2"></i> Go to Dashboard
                        </a>
                        <a href="/tasks.php" class="btn btn-outline-light btn-lg px-4 py-3 rounded-pill fw-semibold">
                            <i class="bi bi-check2-circle me-2"></i> View Active Tasks
                        </a>
                    <?php endif; ?>
                </div>

                <!-- Trust stats -->
                <div class="row g-3 mt-4 pt-3 border-top border-secondary">
                    <div class="col-4">
                        <div class="h3 fw-bold text-warning mb-0">6+</div>
                        <small class="text-white-50">Farm Sectors</small>
                    </div>
                    <div class="col-4">
                        <div class="h3 fw-bold text-warning mb-0">GH₵20.00</div>
                        <small class="text-white-50">Min. Withdrawal</small>
                    </div>
                    <div class="col-4">
                        <div class="h3 fw-bold text-warning mb-0">Instant MoMo</div>
                        <small class="text-white-50">MTN / Telecel / AT</small>
                    </div>
                </div>
            </div>

            <div class="col-lg-5 text-center">
                <div class="card border-0 shadow-lg rounded-4 overflow-hidden bg-white text-dark p-2">
                    <img src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=700&q=80" alt="Poultry and Farm Operations" class="img-fluid rounded-3" style="max-height: 380px; object-fit: cover;">
                    <div class="p-3 text-start">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="badge bg-success">Verified Active Hub</span>
                            <span class="text-muted small"><i class="bi bi-geo-alt-fill text-danger"></i> Greater Accra & Eastern Region</span>
                        </div>
                        <h6 class="fw-bold mb-0">Poultry, Livestock & Aquaculture Field Demonstration</h6>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- How It Works -->
<section class="py-5 bg-white">
    <div class="container py-4">
        <div class="text-center max-w-700 mx-auto mb-5">
            <span class="text-success fw-bold text-uppercase small">Simple & Transparent</span>
            <h2 class="fw-bold text-dark">How Animal Farm Ghana Works</h2>
            <p class="text-muted">Participate in genuine agro-processing, verification tasks, and cooperative farm units in four clear steps.</p>
        </div>

        <div class="row g-4">
            <div class="col-md-3">
                <div class="card h-100 border-0 bg-light p-4 rounded-4 text-center">
                    <div class="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3" style="width: 60px; height: 60px; font-size: 1.5rem;">
                        1
                    </div>
                    <h5 class="fw-bold mb-2">Register & Verify</h5>
                    <p class="text-muted small mb-0">Sign up with your Ghana phone number and verify your identity via our fast 6-digit SMS OTP security flow.</p>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card h-100 border-0 bg-light p-4 rounded-4 text-center">
                    <div class="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3" style="width: 60px; height: 60px; font-size: 1.5rem;">
                        2
                    </div>
                    <h5 class="fw-bold mb-2">Select Farm Tasks</h5>
                    <p class="text-muted small mb-0">Browse real agricultural tasks ranging from daily poultry records, crop surveys, to fodder and pen checks.</p>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card h-100 border-0 bg-light p-4 rounded-4 text-center">
                    <div class="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3" style="width: 60px; height: 60px; font-size: 1.5rem;">
                        3
                    </div>
                    <h5 class="fw-bold mb-2">Submit Proof</h5>
                    <p class="text-muted small mb-0">Submit field notes, observational records, or photographs. Farm supervisors verify submissions promptly.</p>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card h-100 border-0 bg-light p-4 rounded-4 text-center">
                    <div class="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3" style="width: 60px; height: 60px; font-size: 1.5rem;">
                        4
                    </div>
                    <h5 class="fw-bold mb-2">Earn & Withdraw</h5>
                    <p class="text-muted small mb-0">Receive Ghana Cedi (GH₵) rewards directly to your wallet and withdraw via MTN, Telecel, or AT Mobile Money.</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Farm Categories -->
<section class="py-5" style="background-color: #f3f7f4;">
    <div class="container py-4">
        <div class="text-center mb-5">
            <span class="text-success fw-bold text-uppercase small">Agricultural Sectors</span>
            <h2 class="fw-bold text-dark">Our Farm Categories</h2>
            <p class="text-muted">Supporting sustainable food security across six specialized branches in Ghana.</p>
        </div>

        <div class="row g-4">
            <?php
            $categories = [
                ['name' => 'Poultry', 'icon' => 'egg', 'desc' => 'Broilers, layers, and hatchery management in peri-urban hubs.', 'img' => 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&q=80'],
                ['name' => 'Goat Farming', 'icon' => 'shield-check', 'desc' => 'West African Dwarf goats bred for hardiness and organic meat production.', 'img' => 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=600&q=80'],
                ['name' => 'Cattle Farming', 'icon' => 'tree', 'desc' => 'Sanga and White Fulani beef and dairy pasture rotations in the Shai Hills.', 'img' => 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&q=80'],
                ['name' => 'Pig Farming', 'icon' => 'box', 'desc' => 'Commercial pork units with modern bio-security and hygienic waste digesters.', 'img' => 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&q=80'],
                ['name' => 'Fish Farming', 'icon' => 'water', 'desc' => 'Earthen catfish and tilapia aquaculture ponds along the Volta basin.', 'img' => 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=600&q=80'],
                ['name' => 'Crop Farming', 'icon' => 'flower1', 'desc' => 'Maize, cassava, vegetables, and soybean intercropping in Ejura and Techiman.', 'img' => 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80']
            ];
            foreach ($categories as $cat):
            ?>
            <div class="col-lg-4 col-md-6">
                <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden card-hover">
                    <img src="<?= $cat['img'] ?>" alt="<?= $cat['name'] ?>" class="card-img-top" style="height: 180px; object-fit: cover;">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="fw-bold mb-0 text-dark"><?= $cat['name'] ?></h5>
                            <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1">Active</span>
                        </div>
                        <p class="text-muted small mb-3"><?= $cat['desc'] ?></p>
                        <a href="/tasks.php?category=<?= urlencode($cat['name']) ?>" class="btn btn-outline-success btn-sm rounded-pill w-100 fw-semibold">
                            Explore <?= $cat['name'] ?> Tasks
                        </a>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- Available Tasks Preview -->
<section class="py-5 bg-white">
    <div class="container py-4">
        <div class="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
            <div>
                <span class="text-success fw-bold text-uppercase small">Earn Ghana Cedis</span>
                <h2 class="fw-bold text-dark mb-0">Featured Agricultural Tasks</h2>
            </div>
            <a href="/tasks.php" class="btn btn-outline-success rounded-pill px-4 fw-semibold">
                View All Tasks (<?= count($featured_tasks) ?>+) <i class="bi bi-arrow-right ms-1"></i>
            </a>
        </div>

        <div class="row g-4">
            <?php foreach ($featured_tasks as $t): ?>
            <div class="col-md-6 col-lg-3">
                <div class="card h-100 border-0 shadow-sm rounded-4 p-3 card-hover bg-light d-flex flex-column justify-content-between">
                    <div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="category-pill"><?= htmlspecialchars($t['category']) ?></span>
                            <span class="badge bg-success text-white fw-bold px-2 py-1"><?= money($t['reward']) ?></span>
                        </div>
                        <h6 class="fw-bold mb-2 text-dark"><?= htmlspecialchars($t['title']) ?></h6>
                        <p class="text-muted small mb-3" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                            <?= htmlspecialchars($t['description']) ?>
                        </p>
                    </div>
                    <div class="border-top pt-3 mt-auto">
                        <div class="d-flex justify-content-between align-items-center small text-muted mb-2">
                            <span><i class="bi bi-clock me-1"></i> <?= htmlspecialchars($t['estimated_time']) ?></span>
                            <span><i class="bi bi-check2 me-1"></i> <?= (int)$t['completed_count'] ?> completed</span>
                        </div>
                        <a href="/task.php?id=<?= $t['id'] ?>" class="btn btn-farm-primary btn-sm rounded-pill w-100 fw-semibold">
                            Complete Task
                        </a>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- Farm Packages Preview -->
<section class="py-5 bg-light">
    <div class="container py-4">
        <div class="text-center mb-5">
            <span class="text-success fw-bold text-uppercase small">Direct Agro-Participation</span>
            <h2 class="fw-bold text-dark">Featured Farm Packages</h2>
            <p class="text-muted max-w-700 mx-auto">Support certified farming units with transparent input purchases and verified farm cycle tracking. No artificial returns: genuine agricultural contracts.</p>
        </div>

        <div class="row g-4 justify-content-center">
            <?php foreach ($featured_packages as $pkg): ?>
            <div class="col-lg-4 col-md-6">
                <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden card-hover bg-white">
                    <img src="<?= htmlspecialchars($pkg['image']) ?>" alt="<?= htmlspecialchars($pkg['name']) ?>" class="card-img-top" style="height: 200px; object-fit: cover;">
                    <div class="card-body p-4 d-flex flex-column justify-content-between">
                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge bg-secondary text-white small"><?= htmlspecialchars($pkg['category']) ?></span>
                                <span class="badge bg-info text-dark small"><i class="bi bi-calendar3 me-1"></i> <?= (int)$pkg['duration_days'] ?> Days</span>
                            </div>
                            <h5 class="fw-bold text-dark mb-2"><?= htmlspecialchars($pkg['name']) ?></h5>
                            <div class="fs-4 fw-bold text-success mb-3"><?= money($pkg['price']) ?></div>
                            <p class="text-muted small mb-4"><?= htmlspecialchars($pkg['description']) ?></p>
                        </div>
                        <div>
                            <a href="/packages.php" class="btn btn-outline-success rounded-pill w-100 fw-semibold">
                                View Details & Terms
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- Why Animal Farm Ghana -->
<section class="py-5 bg-white">
    <div class="container py-4">
        <div class="row align-items-center g-5">
            <div class="col-lg-6">
                <span class="text-success fw-bold text-uppercase small">Real Agriculture</span>
                <h2 class="fw-bold text-dark mb-4">Why Complete Tasks with Animal Farm Ghana?</h2>

                <div class="d-flex gap-3 mb-4">
                    <div class="bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 44px; height: 44px; flex-shrink: 0;">
                        <i class="bi bi-shield-check fs-5"></i>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-1">Authentic Farming Activities</h6>
                        <p class="text-muted small mb-0">Every task stems from real field operations, feed records, and sanitation surveys on partnered Ghanaian farms.</p>
                    </div>
                </div>

                <div class="d-flex gap-3 mb-4">
                    <div class="bg-warning text-dark rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 44px; height: 44px; flex-shrink: 0;">
                        <i class="bi bi-phone fs-5"></i>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-1">Instant Ghana Mobile Money Withdrawals</h6>
                        <p class="text-muted small mb-0">Receive your approved earnings straight to your MTN MoMo, Telecel Cash, or AT Money wallet. Fast and dependable.</p>
                    </div>
                </div>

                <div class="d-flex gap-3 mb-4">
                    <div class="bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 44px; height: 44px; flex-shrink: 0;">
                        <i class="bi bi-lock-fill fs-5"></i>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-1">Secure OTP Account Protection</h6>
                        <p class="text-muted small mb-0">Strict SMS-based phone verification ensures one active account per farmer/participant, eliminating fraudulent bot activity.</p>
                    </div>
                </div>
            </div>

            <div class="col-lg-6">
                <div class="p-4 p-md-5 bg-light rounded-4 border">
                    <h4 class="fw-bold text-dark mb-3">Frequently Asked Questions</h4>
                    <div class="accordion accordion-flush" id="faqAccordion">
                        <div class="accordion-item bg-transparent border-bottom">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                                    How do I earn task rewards?
                                </button>
                            </h2>
                            <div id="faq1" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                <div class="accordion-body small text-muted">
                                    Choose an active task from the tasks directory, read the instructions, complete the required field survey or log, and submit your proof. Once verified by our farm team, the stated GH₵ reward is added to your available rewards wallet.
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item bg-transparent border-bottom">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                                    What is the minimum withdrawal amount?
                                </button>
                            </h2>
                            <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                <div class="accordion-body small text-muted">
                                    The minimum withdrawal threshold is <strong><?= money(MIN_WITHDRAWAL) ?></strong>. Once your available balance reaches this amount, you can submit a withdrawal request to your MTN, Telecel, or AirtelTigo number.
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item bg-transparent border-bottom">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                                    Are earnings guaranteed?
                                </button>
                            </h2>
                            <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                <div class="accordion-body small text-muted">
                                    No. Animal Farm Ghana is not an investment scheme and does not guarantee fixed daily profits. You earn solely upon genuine, approved task completion or direct contract participation.
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item bg-transparent">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed bg-transparent fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                                    How does phone verification work?
                                </button>
                            </h2>
                            <div id="faq4" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                <div class="accordion-body small text-muted">
                                    Upon registration, a 6-digit cryptographic verification code (OTP) is sent to your Ghana phone number via SMS. You have 5 minutes to verify.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Call to Action Banner -->
<section class="py-5 bg-farm-primary text-white text-center">
    <div class="container py-4">
        <h2 class="display-6 fw-bold mb-3">Ready to Support Sustainable Farming in Ghana?</h2>
        <p class="lead text-white-70 max-w-700 mx-auto mb-4">
            Join thousands of Ghanaian youth and agricultural enthusiasts earning eligible rewards for meaningful farm tasks.
        </p>
        <div class="d-flex justify-content-center gap-3">
            <a href="/register.php" class="btn btn-warning btn-lg px-5 py-3 rounded-pill fw-bold text-dark shadow">
                Get Started Today
            </a>
        </div>
    </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
