<?php
// admin/logs.php - Audit Trail, SMS Delivery & Gateway Webhook Logs

$page_title = "Audit & Gateway Logs";
require_once __DIR__ . '/includes/admin_header.php';

$tab = sanitize($_GET['tab'] ?? 'sms');

// Fetch SMS logs
$smsLogs = [];
if ($tab === 'sms') {
    $stmtSms = $pdo->query("SELECT * FROM sms_logs ORDER BY id DESC LIMIT 100");
    $smsLogs = $stmtSms->fetchAll();
} else {
    $stmtPay = $pdo->query("SELECT * FROM payment_logs ORDER BY id DESC LIMIT 100");
    $payLogs = $stmtPay->fetchAll();
}
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h3 class="fw-bold text-dark mb-0">System & Gateway Logs</h3>
        <small class="text-muted">Review telecom SMS delivery statuses and incoming payment IPN webhooks</small>
    </div>

    <div class="btn-group rounded-pill shadow-sm">
        <a href="/admin/logs.php?tab=sms" class="btn btn-sm <?= $tab === 'sms' ? 'btn-success fw-bold' : 'btn-light border' ?>">
            <i class="bi bi-chat-dots me-1"></i> SMS OTP Logs
        </a>
        <a href="/admin/logs.php?tab=payment" class="btn btn-sm <?= $tab === 'payment' ? 'btn-primary fw-bold' : 'btn-light border' ?>">
            <i class="bi bi-code-square me-1"></i> Payment Webhook Logs
        </a>
    </div>
</div>

<div class="card border-0 shadow-sm rounded-4 bg-white p-4">
    <?php if ($tab === 'sms'): ?>
        <h5 class="fw-bold text-dark mb-3">Ghana Telecom SMS Logs (Latest 100)</h5>
        <?php if (empty($smsLogs)): ?>
            <div class="text-center py-5 text-muted small">No SMS dispatch logs recorded yet.</div>
        <?php else: ?>
            <div class="table-responsive">
                <table class="table align-middle table-hover mb-0 small">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Dispatched At</th>
                            <th>Phone (Ghana)</th>
                            <th>Provider</th>
                            <th>Status</th>
                            <th>Message Preview</th>
                            <th>API Response</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($smsLogs as $l): ?>
                        <tr>
                            <td>#<?= $l['id'] ?></td>
                            <td class="text-muted"><?= date('M d, H:i:s', strtotime($l['created_at'])) ?></td>
                            <td><code class="fw-bold text-dark"><?= htmlspecialchars($l['phone']) ?></code></td>
                            <td><span class="badge bg-light text-dark border"><?= htmlspecialchars($l['provider']) ?></span></td>
                            <td>
                                <?php if ($l['status'] === 'delivered'): ?>
                                    <span class="badge bg-success rounded-pill px-2">Delivered</span>
                                <?php elseif ($l['status'] === 'failed'): ?>
                                    <span class="badge bg-danger rounded-pill px-2">Failed</span>
                                <?php else: ?>
                                    <span class="badge bg-info text-dark rounded-pill px-2"><?= htmlspecialchars($l['status']) ?></span>
                                <?php endif; ?>
                            </td>
                            <td style="max-width: 260px;" class="text-truncate"><?= htmlspecialchars($l['message'] ?? '') ?></td>
                            <td style="max-width: 220px;" class="text-truncate font-monospace text-muted"><?= htmlspecialchars($l['response_payload'] ?? '') ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    <?php else: ?>
        <h5 class="fw-bold text-dark mb-3">Payment Gateway Webhook & IPN Logs (Latest 100)</h5>
        <?php if (empty($payLogs)): ?>
            <div class="text-center py-5 text-muted small">No payment webhook logs recorded yet.</div>
        <?php else: ?>
            <div class="table-responsive">
                <table class="table align-middle table-hover mb-0 small">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Logged At</th>
                            <th>Gateway</th>
                            <th>Event</th>
                            <th>Reference</th>
                            <th>IP Address</th>
                            <th>Payload</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($payLogs as $l): ?>
                        <tr>
                            <td>#<?= $l['id'] ?></td>
                            <td class="text-muted"><?= date('M d, H:i:s', strtotime($l['created_at'])) ?></td>
                            <td><span class="badge bg-light text-dark border"><?= htmlspecialchars($l['gateway_code']) ?></span></td>
                            <td><strong><?= htmlspecialchars($l['event_type']) ?></strong></td>
                            <td><code class="text-dark"><?= htmlspecialchars($l['reference'] ?? 'N/A') ?></code></td>
                            <td class="text-muted"><?= htmlspecialchars($l['ip_address'] ?? '') ?></td>
                            <td style="max-width: 300px;" class="text-truncate font-monospace text-muted"><?= htmlspecialchars($l['request_payload'] ?? '') ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/admin_footer.php'; ?>
