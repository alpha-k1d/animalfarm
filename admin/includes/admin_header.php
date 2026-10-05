<?php
// admin/includes/admin_header.php - Dedicated Administrator Layout Header

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../includes/functions.php';

// Check admin authentication
if (empty($_SESSION['admin_id']) && basename($_SERVER['SCRIPT_NAME']) !== 'login.php') {
    redirect('/admin/login.php', 'warning', 'Please sign in to access the Administrator Portal.');
}

$admin = null;
if (!empty($_SESSION['admin_id'])) {
    $stmt = $pdo->prepare("SELECT * FROM admins WHERE id = ?");
    $stmt->execute([$_SESSION['admin_id']]);
    $admin = $stmt->fetch();
}

$current_script = basename($_SERVER['SCRIPT_NAME'] ?? '');

// Counts for badges
$pendingSubCount = (int)$pdo->query("SELECT COUNT(*) FROM task_submissions WHERE status = 'pending'")->fetchColumn();
$pendingWdCount = (int)$pdo->query("SELECT COUNT(*) FROM withdrawals WHERE status = 'pending'")->fetchColumn();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($page_title) ? htmlspecialchars($page_title) . ' | Admin Portal' : 'Admin Portal - ' . SITE_NAME ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/style.css">
    <style>
        .admin-sidebar {
            min-height: calc(100vh - 56px);
            background: #1b2e20;
        }
        .admin-sidebar .nav-link {
            color: rgba(255,255,255,0.75);
            padding: 10px 18px;
            font-size: 0.9rem;
            border-radius: 8px;
            margin: 2px 10px;
        }
        .admin-sidebar .nav-link:hover, .admin-sidebar .nav-link.active {
            color: #ffffff;
            background: rgba(255,255,255,0.12);
        }
        .admin-sidebar .nav-link.active {
            background: #198754;
            font-weight: 600;
        }
    </style>
</head>
<body class="bg-light">

<!-- Top Admin Bar -->
<nav class="navbar navbar-dark bg-dark sticky-top border-bottom border-secondary px-3">
    <div class="container-fluid">
        <a class="navbar-brand d-flex align-items-center gap-2" href="/admin/index.php">
            <span class="fs-4"></span>
            <div>
                <strong class="d-block lh-1"><?= SITE_NAME ?></strong>
                <small class="text-warning" style="font-size: 0.65rem;">ADMINISTRATION PORTAL</small>
            </div>
        </a>

        <div class="d-flex align-items-center gap-3">
            <a href="/index.php" target="_blank" class="btn btn-sm btn-outline-light rounded-pill px-3">
                <i class="bi bi-box-arrow-up-right me-1"></i> View Main Site
            </a>
            <?php if ($admin): ?>
                <div class="dropdown">
                    <button class="btn btn-sm btn-secondary dropdown-toggle rounded-pill px-3" type="button" data-bs-toggle="dropdown">
                        <i class="bi bi-shield-lock-fill me-1 text-warning"></i> <?= htmlspecialchars($admin['username']) ?>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                        <li><a class="dropdown-item" href="/admin/settings.php"><i class="bi bi-gear me-2"></i> Settings</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="/admin/logout.php"><i class="bi bi-box-arrow-right me-2"></i> Logout</a></li>
                    </ul>
                </div>
            <?php endif; ?>
        </div>
    </div>
</nav>

<div class="container-fluid">
    <div class="row">
        <?php if ($admin): ?>
        <!-- Admin Sidebar -->
        <nav class="col-md-3 col-lg-2 d-md-block admin-sidebar collapse show p-0 shadow-sm">
            <div class="py-3">
                <ul class="nav flex-column">
                    <li class="nav-item">
                        <a class="nav-link <?= $current_script === 'index.php' ? 'active' : '' ?>" href="/admin/index.php">
                            <i class="bi bi-speedometer2 me-2"></i> Dashboard
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?= $current_script === 'submissions.php' ? 'active' : '' ?>" href="/admin/submissions.php">
                            <i class="bi bi-check2-square me-2"></i> Submissions
                            <?php if ($pendingSubCount > 0): ?>
                                <span class="badge bg-warning text-dark rounded-pill float-end"><?= $pendingSubCount ?></span>
                            <?php endif; ?>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?= $current_script === 'withdrawals.php' ? 'active' : '' ?>" href="/admin/withdrawals.php">
                            <i class="bi bi-cash-coin me-2"></i> Withdrawals
                            <?php if ($pendingWdCount > 0): ?>
                                <span class="badge bg-danger rounded-pill float-end"><?= $pendingWdCount ?></span>
                            <?php endif; ?>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?= $current_script === 'tasks.php' ? 'active' : '' ?>" href="/admin/tasks.php">
                            <i class="bi bi-list-task me-2"></i> Manage Tasks
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?= $current_script === 'packages.php' ? 'active' : '' ?>" href="/admin/packages.php">
                            <i class="bi bi-box-seam me-2"></i> Farm Packages
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?= $current_script === 'users.php' ? 'active' : '' ?>" href="/admin/users.php">
                            <i class="bi bi-people-fill me-2"></i> Farmer Accounts
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?= $current_script === 'settings.php' ? 'active' : '' ?>" href="/admin/settings.php">
                            <i class="bi bi-sliders me-2"></i> Gateways & Config
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?= $current_script === 'logs.php' ? 'active' : '' ?>" href="/admin/logs.php">
                            <i class="bi bi-journal-code me-2"></i> Audit & SMS Logs
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
        <?php endif; ?>

        <!-- Main Content Area -->
        <main class="<?= $admin ? 'col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4' : 'col-12 py-5' ?>">
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
