<?php
// includes/notifications.php - Notification Manager Helpers

require_once __DIR__ . '/functions.php';

function fetch_user_notifications(PDO $pdo, int $userId, int $limit = 20): array
{
    $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT ?");
    $stmt->bindValue(1, $userId, PDO::PARAM_INT);
    $stmt->bindValue(2, $limit, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll();
}

function mark_notification_read(PDO $pdo, int $notificationId, int $userId): bool
{
    $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND (user_id = ? OR user_id IS NULL)");
    return $stmt->execute([$notificationId, $userId]);
}

function mark_all_notifications_read(PDO $pdo, int $userId): bool
{
    $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0");
    return $stmt->execute([$userId]);
}
