<?php
// admin/settings.php - Platform, Gateways & Telecom SMS Configuration

$page_title = "Platform Settings";
require_once __DIR__ . '/includes/admin_header.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $settings_to_update = [
        'min_withdrawal',
        'max_withdrawal',
        'referral_reward',
        'sms_active_provider',
        'sms_sender_id',
        'hubysms_api_key',
        'mnotify_api_key',
        'paystack_public_key',
        'paystack_secret_key',
        'paystack_test_mode',
        'bitcoin_address',
        'bitcoin_xpub',
        'bitcoin_webhook_secret',
        'bitcoin_test_mode',
        'site_name',
        'site_tagline'
    ];

    $stmt = $pdo->prepare("INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");

    foreach ($settings_to_update as $k) {
        if (isset($_POST[$k])) {
            $stmt->execute([$k, trim($_POST[$k])]);
        }
    }

    redirect('/admin/settings.php', 'success', 'System and gateway settings updated successfully.');
}

// Fetch all settings
$stmtAll = $pdo->query("SELECT setting_key, setting_value FROM system_settings");
$configMap = $stmtAll->fetchAll(PDO::FETCH_KEY_PAIR);
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h3 class="fw-bold text-dark mb-0">Platform Settings & Gateways</h3>
        <small class="text-muted">Configure Paystack MoMo, Bitcoin gateway, HubySMS/Mnotify telecom API credentials</small>
    </div>
</div>

<form method="POST" action="/admin/settings.php">
    <?= csrf_field() ?>

    <div class="row g-4">
        <!-- Ghana Financial Rules -->
        <div class="col-lg-6">
            <div class="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
                <div class="d-flex align-items-center gap-2 mb-3">
                    <span class="fs-4">GH</span>
                    <h5 class="fw-bold text-dark mb-0">Ghana Cedi & Reward Rules</h5>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-semibold text-muted">Minimum Withdrawal (GH₵)</label>
                    <input type="number" step="0.01" min="1.00" name="min_withdrawal" class="form-control rounded-3" value="<?= htmlspecialchars($configMap['min_withdrawal'] ?? '20.00') ?>" required>
                    <div class="form-text small text-muted">Threshold before a member can request mobile money payout.</div>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-semibold text-muted">Maximum Single Withdrawal (GH₵)</label>
                    <input type="number" step="0.01" min="10.00" name="max_withdrawal" class="form-control rounded-3" value="<?= htmlspecialchars($configMap['max_withdrawal'] ?? '5000.00') ?>" required>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-semibold text-muted">Referral Commission (GH₵)</label>
                    <input type="number" step="0.01" min="0.00" name="referral_reward" class="form-control rounded-3" value="<?= htmlspecialchars($configMap['referral_reward'] ?? '5.00') ?>" required>
                    <div class="form-text small text-muted">Credited to referrer once referred member finishes their 1st task.</div>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-semibold text-muted">Platform Name</label>
                    <input type="text" name="site_name" class="form-control rounded-3" value="<?= htmlspecialchars($configMap['site_name'] ?? SITE_NAME) ?>">
                </div>
            </div>
        </div>

        <!-- Ghana SMS OTP Gateways -->
        <div class="col-lg-6">
            <div class="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
                <div class="d-flex align-items-center gap-2 mb-3">
                    <i class="bi bi-chat-left-dots-fill fs-4 text-success"></i>
                    <h5 class="fw-bold text-dark mb-0">Ghana Telecom SMS Gateway</h5>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-semibold text-muted">Active SMS Provider Engine</label>
                    <select name="sms_active_provider" class="form-select rounded-3">
                        <option value="simulation" <?= ($configMap['sms_active_provider'] ?? '') === 'simulation' ? 'selected' : '' ?>>Sandbox Simulation (Auto-deliver OTP for testing)</option>
                        <option value="hubysms" <?= ($configMap['sms_active_provider'] ?? '') === 'hubysms' ? 'selected' : '' ?>>HubySMS (Ghana MoMo & Telecom Aggregator)</option>
                        <option value="mnotify" <?= ($configMap['sms_active_provider'] ?? '') === 'mnotify' ? 'selected' : '' ?>>mNotify (Ghana Quick SMS API)</option>
                    </select>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-semibold text-muted">Sender ID (max 11 chars)</label>
                    <input type="text" maxlength="11" name="sms_sender_id" class="form-control rounded-3" value="<?= htmlspecialchars($configMap['sms_sender_id'] ?? 'AnimalFarm') ?>">
                    <div class="form-text small text-muted">Displayed on recipient's phone (e.g. AnimalFarm).</div>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-semibold text-muted">HubySMS API Key</label>
                    <input type="text" name="hubysms_api_key" class="form-control rounded-3" value="<?= htmlspecialchars($configMap['hubysms_api_key'] ?? '') ?>" placeholder="huby_live_...">
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-semibold text-muted">mNotify API Key</label>
                    <input type="text" name="mnotify_api_key" class="form-control rounded-3" value="<?= htmlspecialchars($configMap['mnotify_api_key'] ?? '') ?>" placeholder="mnotify_api_key_...">
                </div>
            </div>
        </div>

        <!-- Paystack Gateway Settings -->
        <div class="col-lg-6">
            <div class="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
                <div class="d-flex align-items-center gap-2 mb-3">
                    <i class="bi bi-credit-card-2-front-fill fs-4 text-primary"></i>
                    <h5 class="fw-bold text-dark mb-0">Paystack Gateway (MoMo & Card)</h5>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-semibold text-muted">Paystack Mode</label>
                    <select name="paystack_test_mode" class="form-select rounded-3">
                        <option value="1" <?= ($configMap['paystack_test_mode'] ?? '1') === '1' ? 'selected' : '' ?>>Sandbox / Test Mode (Simulated Payouts & Deposits)</option>
                        <option value="0" <?= ($configMap['paystack_test_mode'] ?? '1') === '0' ? 'selected' : '' ?>>Live Mode (Production Bank & MoMo Charges)</option>
                    </select>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-semibold text-muted">Paystack Public Key</label>
                    <input type="text" name="paystack_public_key" class="form-control rounded-3" value="<?= htmlspecialchars($configMap['paystack_public_key'] ?? '') ?>" placeholder="pk_test_... or pk_live_...">
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-semibold text-muted">Paystack Secret Key</label>
                    <input type="password" name="paystack_secret_key" class="form-control rounded-3" value="<?= htmlspecialchars($configMap['paystack_secret_key'] ?? '') ?>" placeholder="sk_test_... or sk_live_...">
                </div>

                <div class="bg-light p-3 rounded-3 small text-muted border">
                    <strong>Webhook URL:</strong> <code><?= BASE_URL ?>/payments/paystack_webhook.php</code>
                </div>
            </div>
        </div>

        <!-- Bitcoin Gateway Settings -->
        <div class="col-lg-6">
            <div class="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
                <div class="d-flex align-items-center gap-2 mb-3">
                    <span class="fs-4 text-warning fw-bold">₿</span>
                    <h5 class="fw-bold text-dark mb-0">Bitcoin Gateway Configuration</h5>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-semibold text-muted">Bitcoin Gateway Mode</label>
                    <select name="bitcoin_test_mode" class="form-select rounded-3">
                        <option value="1" <?= ($configMap['bitcoin_test_mode'] ?? '1') === '1' ? 'selected' : '' ?>>Sandbox / Testnet Simulation</option>
                        <option value="0" <?= ($configMap['bitcoin_test_mode'] ?? '1') === '0' ? 'selected' : '' ?>>Mainnet On-Chain</option>
                    </select>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-semibold text-muted">Default Bitcoin Deposit Address</label>
                    <input type="text" name="bitcoin_address" class="form-control rounded-3 font-monospace" value="<?= htmlspecialchars($configMap['bitcoin_address'] ?? 'bc1q9v0k5384afg091845ghanafarmbtc') ?>">
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-semibold text-muted">Extended Public Key (xPub) - Optional</label>
                    <input type="text" name="bitcoin_xpub" class="form-control rounded-3 font-monospace" value="<?= htmlspecialchars($configMap['bitcoin_xpub'] ?? '') ?>" placeholder="xpub6CuSn...">
                    <div class="form-text small text-muted">Used for automatic unique address derivation per deposit.</div>
                </div>

                <div class="bg-light p-3 rounded-3 small text-muted border">
                    <strong>Bitcoin Webhook:</strong> <code><?= BASE_URL ?>/payments/bitcoin_webhook.php</code>
                </div>
            </div>
        </div>

        <div class="col-12">
            <button type="submit" class="btn btn-farm-primary btn-lg rounded-pill px-5 fw-bold shadow-sm">
                Save Platform & Gateway Settings
            </button>
        </div>
    </div>
</form>

<?php require_once __DIR__ . '/includes/admin_footer.php'; ?>
