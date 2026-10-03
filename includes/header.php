<?php
// includes/header.php - Global Page Header & Navigation

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/functions.php';

$auth_user = get_auth_user($pdo);
$unread_notifs = $auth_user ? get_unread_notification_count($pdo, $auth_user['id']) : 0;
$current_page = basename($_SERVER['SCRIPT_NAME'] ?? '');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($page_title) ? htmlspecialchars($page_title) . ' | ' . SITE_NAME : SITE_NAME . ' - ' . SITE_TAGLINE ?></title>
    <meta name="description" content="Animal Farm Ghana - Complete agricultural tasks, participate in verified farm activities, and earn eligible rewards in Ghana Cedi (GH₵).">
    
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>

<header class="sticky-top bg-white border-bottom shadow-sm">
    <!-- Top info bar -->
    <div class="bg-dark text-white-50 py-1 small">
        <div class="container d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
                <span class="text-warning">GH</span>
                <span class="text-white">Ghana's Premier Agricultural Tasks & Rewards Hub</span>
                <span class="d-none d-md-inline text-muted">| Currency: <strong>GH₵ (Ghana Cedi)</strong></span>
            </div>
            <div class="d-flex align-items-center gap-3">
                <a href="/contact.php" class="text-white-50 text-decoration-none hover-white"><i class="bi bi-headset me-1"></i> Support</a>
                <?php if (!empty($_SESSION['admin_id'])): ?>
                    <a href="/admin/index.php" class="badge bg-danger text-white text-decoration-none"><i class="bi bi-shield-lock me-1"></i> Admin Portal</a>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <!-- Main Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light py-2">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center gap-2 text-farm-primary" href="/index.php">
                <span class="fs-3"></span>
                <div>
                    <span class="fw-bold fs-4 d-block lh-1 text-dark"><?= SITE_NAME ?></span>
                    <small class="text-muted d-block" style="font-size: 0.68rem;"><?= SITE_TAGLINE ?></small>
                </div>
            </a>

            <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
                    <li class="nav-item">
                        <a class="nav-link <?= $current_page === 'index.php' ? 'active text-success fw-bold' : '' ?>" href="/index.php">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?= $current_page === 'tasks.php' || $current_page === 'task.php' ? 'active text-success fw-bold' : '' ?>" href="/tasks.php">
                            Tasks <span class="badge bg-success text-white rounded-pill px-2">Earn</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?= $current_page === 'packages.php' ? 'active text-success fw-bold' : '' ?>" href="/packages.php">Farm Packages</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?= $current_page === 'farm.php' ? 'active text-success fw-bold' : '' ?>" href="/farm.php">My Farm</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?= $current_page === 'contact.php' ? 'active text-success fw-bold' : '' ?>" href="/contact.php">Contact</a>
                    </li>
                </ul>

                <div class="d-flex align-items-center gap-2">
                    <?php if ($auth_user): ?>
                        <!-- User Balance Indicator -->
                        <a href="/wallet.php" class="btn btn-light border d-flex align-items-center gap-2 px-3 py-1 rounded-pill text-decoration-none">
                            <span class="text-muted small">Rewards:</span>
                            <span class="fw-bold text-success"><?= money($auth_user['wallet_balance']) ?></span>
                        </a>

                        <!-- Notification Bell -->
                        <a href="/notifications.php" class="btn btn-light border position-relative rounded-circle p-2" title="Notifications">
                            <i class="bi bi-bell-fill text-secondary"></i>
                            <?php if ($unread_notifs > 0): ?>
                                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.65rem;">
                                    <?= $unread_notifs ?>
                                </span>
                            <?php endif; ?>
                        </a>

                        <!-- User Menu -->
                        <div class="dropdown">
                            <button class="btn btn-farm-primary dropdown-toggle rounded-pill px-3 py-1 d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="bi bi-person-circle"></i>
                                <span class="d-none d-sm-inline"><?= htmlspecialchars(explode(' ', $auth_user['full_name'])[0]) ?></span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-2">
                                <li class="px-3 py-2 border-bottom">
                                    <div class="fw-bold"><?= htmlspecialchars($auth_user['full_name']) ?></div>
                                    <div class="text-muted small"><?= htmlspecialchars($auth_user['phone']) ?></div>
                                </li>
                                <li><a class="dropdown-item py-2" href="/dashboard.php"><i class="bi bi-speedometer2 me-2 text-primary"></i> Dashboard</a></li>
                                <li><a class="dropdown-item py-2" href="/tasks.php"><i class="bi bi-check2-circle me-2 text-success"></i> Tasks</a></li>
                                <li><a class="dropdown-item py-2" href="/wallet.php"><i class="bi bi-wallet2 me-2 text-warning"></i> Rewards Wallet</a></li>
                                <li><a class="dropdown-item py-2" href="/withdraw.php"><i class="bi bi-cash-stack me-2 text-info"></i> Request Withdrawal</a></li>
                                <li><a class="dropdown-item py-2" href="/referrals.php"><i class="bi bi-people me-2 text-secondary"></i> Referrals</a></li>
                                <li><a class="dropdown-item py-2" href="/profile.php"><i class="bi bi-gear me-2 text-dark"></i> Profile & Settings</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item py-2 text-danger" href="/logout.php"><i class="bi bi-box-arrow-right me-2"></i> Log Out</a></li>
                            </ul>
                        </div>
                    <?php else: ?>
                        <a href="/login.php" class="btn btn-outline-secondary rounded-pill px-3 py-1 fw-semibold">Login</a>
                        <a href="/register.php" class="btn btn-farm-primary rounded-pill px-3 py-1 fw-semibold">Create Account</a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </nav>
</header>

<!-- Flash Messages Container -->
<div class="container mt-3">
    <?php
    $flash_messages = get_flash();
    if (!empty($flash_messages)):
        foreach ($flash_messages as $flash):
            $alertClass = match($flash['type']) {
                'success' => 'alert-success',
                'danger' => 'alert-danger',
                'warning' => 'alert-warning',
                default => 'alert-info'
            };
    ?>
        <div class="alert <?= $alertClass ?> alert-dismissible fade show rounded-3 shadow-sm border-0 d-flex align-items-center justify-content-between" role="alert">
            <div class="d-flex align-items-center gap-2">
                <i class="bi <?= $flash['type'] === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill' ?>"></i>
                <span><?= htmlspecialchars($flash['message']) ?></span>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php
        endforeach;
    endif;
    ?>
</div>

<main>
