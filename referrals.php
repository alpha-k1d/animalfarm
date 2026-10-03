<?php
// referrals.php - Referral Program & Commission Tracker

$page_title = "Referral Program";
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/header.php';

$user = get_auth_user($pdo);

// Fetch referrals
$stmt = $pdo->prepare("SELECT r.*, u.full_name, u.phone, u.created_at AS user_reg_date 
                       FROM referrals r 
                       JOIN users u ON u.id = r.referred_user_id 
                       WHERE r.referrer_id = ? 
                       ORDER BY r.id DESC");
$stmt->execute([$user['id']]);
$referrals = $stmt->fetchAll();

// Calculate referral stats
$total_referred = count($referrals);
$total_rewarded = 0;
$referral_earned = 0.00;

foreach ($referrals as $r) {
    if ($r['status'] === 'rewarded') {
        $total_rewarded++;
        $referral_earned += (float)$r['reward_amount'];
    }
}

$referral_link = BASE_URL . '/register.php?ref=' . urlencode($user['referral_code']);
?>

<div class="container py-4">
    <!-- Header banner -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
        <div class="row align-items-center g-3">
            <div class="col-lg-8">
                <span class="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-1 rounded-pill mb-2">
                    Community Referral Program
                </span>
                <h3 class="fw-bold text-dark mb-1">Invite Friends, Support Farming</h3>
                <p class="text-muted small mb-0">
                    Earn <?= money(REFERRAL_REWARD) ?> in rewards for every Ghanaian friend or family member who signs up with your referral code, verifies their phone, and completes their first farm task.
                </p>
            </div>
            <div class="col-lg-4 text-lg-end">
                <div class="bg-light p-3 rounded-4 border d-inline-block text-start">
                    <small class="text-muted d-block">Referral Earnings:</small>
                    <span class="fs-4 fw-bold text-success"><?= money($referral_earned) ?></span>
                </div>
            </div>
        </div>
    </div>

    <!-- Referral Link & Code Box -->
    <div class="row g-4 mb-4">
        <div class="col-lg-6">
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                <h5 class="fw-bold text-dark mb-2">Your Unique Referral Link</h5>
                <p class="text-muted small mb-3">Share this link directly on WhatsApp, Facebook, Telegram, or X.</p>

                <div class="input-group mb-3">
                    <input type="text" class="form-control bg-light font-monospace" id="refPageLink" value="<?= htmlspecialchars($referral_link) ?>" readonly>
                    <button class="btn btn-farm-primary px-4 fw-semibold" type="button" data-copy-target="refPageLink">Copy Link</button>
                </div>

                <div class="d-flex gap-2">
                    <a href="https://api.whatsapp.com/send?text=<?= urlencode("Join me on Animal Farm Ghana! Complete agricultural tasks and earn Ghana Cedi rewards. Sign up with my link: " . $referral_link) ?>" target="_blank" class="btn btn-success btn-sm rounded-pill px-3 fw-semibold">
                        <i class="bi bi-whatsapp me-1"></i> Share via WhatsApp
                    </a>
                </div>
            </div>
        </div>

        <div class="col-lg-6">
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                <h5 class="fw-bold text-dark mb-2">Your Referral Code</h5>
                <p class="text-muted small mb-3">New users can enter this code manually during registration.</p>

                <div class="d-flex align-items-center gap-3">
                    <div class="p-3 bg-light border rounded-3 fw-bold fs-3 letter-spacing-lg text-dark font-monospace">
                        <?= htmlspecialchars($user['referral_code']) ?>
                    </div>
                    <button class="btn btn-outline-secondary rounded-pill px-3 py-2 fw-semibold" type="button" onclick="navigator.clipboard.writeText('<?= htmlspecialchars($user['referral_code']) ?>'); alert('Referral code copied!');">
                        <i class="bi bi-copy me-1"></i> Copy Code
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="row g-3 mb-4">
        <div class="col-sm-4">
            <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <small class="text-muted text-uppercase fw-bold">Total Invited</small>
                <div class="h3 fw-bold text-dark mb-0"><?= $total_referred ?></div>
                <small class="text-muted">Registered members</small>
            </div>
        </div>
        <div class="col-sm-4">
            <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <small class="text-muted text-uppercase fw-bold">Rewarded</small>
                <div class="h3 fw-bold text-success mb-0"><?= $total_rewarded ?></div>
                <small class="text-muted">Completed 1st task</small>
            </div>
        </div>
        <div class="col-sm-4">
            <div class="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <small class="text-muted text-uppercase fw-bold">Earned (GH₵)</small>
                <div class="h3 fw-bold text-primary mb-0"><?= money($referral_earned) ?></div>
                <small class="text-muted">Credited to wallet</small>
            </div>
        </div>
    </div>

    <!-- Referred Users Table -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-4">
        <h5 class="fw-bold text-dark mb-3">Referred Members</h5>

        <?php if (empty($referrals)): ?>
            <div class="text-center py-5 text-muted small">
                <i class="bi bi-people fs-1 d-block mb-3 text-secondary"></i>
                You haven't referred any members yet. Share your referral link above to start earning!
            </div>
        <?php else: ?>
            <div class="table-responsive">
                <table class="table align-middle table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Date Joined</th>
                            <th>Member Name</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th class="text-end">Commission</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($referrals as $ref): ?>
                        <tr>
                            <td class="small text-muted"><?= date('M d, Y', strtotime($ref['user_reg_date'])) ?></td>
                            <td class="fw-semibold text-dark"><?= htmlspecialchars($ref['full_name']) ?></td>
                            <td class="small font-monospace"><?= htmlspecialchars(substr($ref['phone'], 0, 4) . '****' . substr($ref['phone'], -2)) ?></td>
                            <td>
                                <?php if ($ref['status'] === 'rewarded'): ?>
                                    <span class="badge bg-success rounded-pill px-3">Rewarded</span>
                                <?php else: ?>
                                    <span class="badge bg-warning text-dark rounded-pill px-3">Pending 1st Task</span>
                                <?php endif; ?>
                            </td>
                            <td class="text-end fw-bold <?= ($ref['status'] === 'rewarded') ? 'text-success' : 'text-muted' ?>">
                                <?= money($ref['reward_amount']) ?>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
