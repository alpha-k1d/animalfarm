<?php
// admin/login.php - Administrator Sign In

$page_title = "Admin Sign In";
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../includes/functions.php';

// Redirect if already logged in as admin
if (!empty($_SESSION['admin_id'])) {
    redirect('/admin/index.php');
}

$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM admins WHERE username = ? OR email = ?");
    $stmt->execute([$username, $username]);
    $admin = $stmt->fetch();

    if ($admin && password_verify($password, $admin['password_hash'])) {
        session_regenerate_id(true);
        $_SESSION['admin_id'] = (int)$admin['id'];
        redirect('/admin/index.php', 'success', 'Welcome, ' . htmlspecialchars($admin['username']) . '!');
    } else {
        $error = "Invalid administrator username or password.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login | <?= SITE_NAME ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body class="bg-dark text-white d-flex align-items-center min-vh-100 py-5">

<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
            <div class="card border-0 shadow-lg rounded-4 overflow-hidden bg-white text-dark">
                <div class="card-header bg-dark text-white p-4 text-center border-bottom border-secondary">
                    <span class="fs-1"></span>
                    <h4 class="fw-bold mb-0">Portal Administration</h4>
                    <small class="text-warning">Animal Farm Ghana Control Center</small>
                </div>

                <div class="card-body p-4 p-md-5">
                    <?php if ($error): ?>
                        <div class="alert alert-danger border-0 rounded-3 small mb-4">
                            <i class="bi bi-exclamation-triangle-fill me-1"></i> <?= htmlspecialchars($error) ?>
                        </div>
                    <?php endif; ?>

                    <form method="POST" action="/admin/login.php">
                        <?= csrf_field() ?>

                        <div class="mb-3">
                            <label for="username" class="form-label fw-semibold small text-muted">Admin Username or Email</label>
                            <input type="text" class="form-control rounded-3" id="username" name="username" value="<?= htmlspecialchars($_POST['username'] ?? '') ?>" placeholder="admin" required autofocus>
                        </div>

                        <div class="mb-4">
                            <label for="password" class="form-label fw-semibold small text-muted">Password</label>
                            <input type="password" class="form-control rounded-3" id="password" name="password" placeholder="••••••••••••" required>
                        </div>

                        <button type="submit" class="btn btn-dark w-100 rounded-pill fw-bold py-2 shadow-sm mb-3">
                            Sign In to Portal
                        </button>
                    </form>

                    <div class="bg-light p-3 rounded-3 border small text-muted">
                        <strong class="d-block text-dark mb-1"><i class="bi bi-key-fill text-warning me-1"></i> Pre-seeded Credentials:</strong>
                        <div><strong>User:</strong> <code>admin</code></div>
                        <div><strong>Pass:</strong> <code>Admin@AnimalFarm2025!</code></div>
                    </div>

                    <div class="text-center mt-3">
                        <a href="/index.php" class="small text-muted text-decoration-none">&larr; Return to main website</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

</body>
</html>
