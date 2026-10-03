-- Animal Farm Ghana Database Schema
-- Currency: Ghana Cedi (GH₵ / GHS)

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS payment_logs;
DROP TABLE IF EXISTS payment_transactions;
DROP TABLE IF EXISTS payment_gateways;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS referrals;
DROP TABLE IF EXISTS withdrawals;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS user_packages;
DROP TABLE IF EXISTS farm_packages;
DROP TABLE IF EXISTS task_submissions;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS otp_verifications;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    referred_by_id INT NULL,
    status ENUM('pending', 'active', 'suspended') NOT NULL DEFAULT 'pending',
    phone_verified TINYINT(1) NOT NULL DEFAULT 0,
    wallet_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_earned DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_withdrawn DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    pending_rewards DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    momo_number VARCHAR(30) NULL,
    momo_network ENUM('MTN', 'Telecel', 'AirtelTigo') NULL,
    btc_address VARCHAR(120) NULL,
    avatar VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_referral_code (referral_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admins Table
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role ENUM('super_admin', 'manager', 'support') NOT NULL DEFAULT 'super_admin',
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- OTP Verifications
CREATE TABLE otp_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    phone VARCHAR(30) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    purpose VARCHAR(50) NOT NULL DEFAULT 'registration',
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 5,
    expires_at DATETIME NOT NULL,
    verified_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_phone (phone),
    INDEX idx_otp_user (user_id),
    INDEX idx_otp_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tasks Table
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE NOT NULL,
    category ENUM('Poultry', 'Goat Farming', 'Cattle Farming', 'Pig Farming', 'Fish Farming', 'Crop Farming', 'General Farm Care') NOT NULL DEFAULT 'Poultry',
    reward DECIMAL(15,2) NOT NULL DEFAULT 5.00,
    estimated_time VARCHAR(50) NOT NULL DEFAULT '15 mins',
    description TEXT NOT NULL,
    instructions MEDIUMTEXT NOT NULL,
    proof_required TINYINT(1) NOT NULL DEFAULT 1,
    proof_type ENUM('text_only', 'image_required', 'both') NOT NULL DEFAULT 'both',
    max_completions INT NOT NULL DEFAULT 100,
    completed_count INT NOT NULL DEFAULT 0,
    start_date DATE NULL,
    end_date DATE NULL,
    status ENUM('draft', 'active', 'paused', 'expired') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_task_category (category),
    INDEX idx_task_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Task Submissions
CREATE TABLE task_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    submission_text TEXT NULL,
    proof_file VARCHAR(255) NULL,
    reward_amount DECIMAL(15,2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    admin_notes TEXT NULL,
    reviewed_by INT NULL,
    reviewed_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_submission_task (task_id),
    INDEX idx_submission_user (user_id),
    INDEX idx_submission_status (status),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Farm Packages Table (Legitimate Farm Sponsorships & Produce Allotments)
CREATE TABLE farm_packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE NOT NULL,
    category ENUM('Poultry', 'Goat Farming', 'Cattle Farming', 'Pig Farming', 'Fish Farming', 'Crop Farming') NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    duration_days INT NOT NULL DEFAULT 90,
    description TEXT NOT NULL,
    terms MEDIUMTEXT NOT NULL,
    image VARCHAR(255) NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pkg_category (category),
    INDEX idx_pkg_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Packages (Active participation)
CREATE TABLE user_packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    package_id INT NOT NULL,
    amount_paid DECIMAL(15,2) NOT NULL,
    status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES farm_packages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions Table
CREATE TABLE transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tx_user (user_id),
    INDEX idx_tx_type (type),
    INDEX idx_tx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Withdrawals Table
CREATE TABLE withdrawals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    fee DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    final_amount DECIMAL(15,2) NOT NULL,
    method ENUM('momo', 'bitcoin') NOT NULL DEFAULT 'momo',
    details TEXT NOT NULL,
    status ENUM('pending', 'processing', 'paid', 'rejected') NOT NULL DEFAULT 'pending',
    admin_notes TEXT NULL,
    processed_by INT NULL,
    processed_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_wd_user (user_id),
    INDEX idx_wd_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Referrals Table
CREATE TABLE referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referrer_id INT NOT NULL,
    referred_user_id INT NOT NULL,
    referral_code VARCHAR(20) NOT NULL,
    status ENUM('pending', 'qualified', 'rewarded') NOT NULL DEFAULT 'pending',
    reward_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    rewarded_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ref_referrer (referrer_id),
    INDEX idx_ref_referred (referred_user_id),
    FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'system',
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    link VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Gateways Configuration
CREATE TABLE payment_gateways (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    is_enabled TINYINT(1) NOT NULL DEFAULT 0,
    mode ENUM('test', 'live') NOT NULL DEFAULT 'test',
    config LONGTEXT NULL,
    min_amount DECIMAL(15,2) NOT NULL DEFAULT 10.00,
    max_amount DECIMAL(15,2) NOT NULL DEFAULT 10000.00,
    fee_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    fee_fixed DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Transactions Table
CREATE TABLE payment_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    gateway_id INT NOT NULL,
    reference VARCHAR(150) UNIQUE NOT NULL,
    gateway_reference VARCHAR(255) NULL,
    amount_ghs DECIMAL(15,2) NOT NULL,
    amount_crypto DECIMAL(30,12) NULL,
    currency VARCHAR(10) DEFAULT 'GHS',
    crypto_currency VARCHAR(20) NULL,
    exchange_rate DECIMAL(30,12) NULL,
    payment_address TEXT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    provider_response LONGTEXT NULL,
    paid_at DATETIME NULL,
    expires_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pt_user (user_id),
    INDEX idx_pt_gateway (gateway_id),
    INDEX idx_pt_ref (reference),
    INDEX idx_pt_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (gateway_id) REFERENCES payment_gateways(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Logs Table
CREATE TABLE payment_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    gateway_code VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    reference VARCHAR(150) NULL,
    request_payload LONGTEXT NULL,
    response_payload LONGTEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pl_gateway (gateway_code),
    INDEX idx_pl_ref (reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings Table
CREATE TABLE settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NULL,
    description VARCHAR(255) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs Table
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NULL,
    action VARCHAR(100) NOT NULL,
    user_id INT NULL,
    amount DECIMAL(15,2) NULL,
    ip_address VARCHAR(45) NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_al_admin (admin_id),
    INDEX idx_al_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEED INITIAL SETTINGS
INSERT INTO settings (setting_key, setting_value, description) VALUES
('site_name', 'Animal Farm Ghana', 'Platform brand name'),
('site_tagline', 'Complete Tasks. Support Farming. Earn Rewards.', 'Website slogan'),
('currency_code', 'GHS', 'Official currency ISO code'),
('currency_symbol', 'GH₵', 'Currency display symbol'),
('country', 'Ghana', 'Primary operating country'),
('contact_email', 'support@animalfarmghana.com', 'Official support email'),
('contact_phone', '+233 24 000 1234', 'Official support phone number'),
('min_withdrawal', '20.00', 'Minimum withdrawal threshold in GHS'),
('max_withdrawal', '5000.00', 'Maximum withdrawal per request in GHS'),
('withdrawal_fee_percent', '1.5', 'Mobile money processing fee percentage'),
('referral_reward', '5.00', 'Reward earned when a referred user verifies phone and finishes first task'),
('maintenance_mode', '0', '1 for maintenance mode, 0 for normal operation'),
('otp_expiry_minutes', '5', 'Duration before OTP token expires'),
('otp_resend_cooldown_seconds', '60', 'Cooldown before user can request new OTP'),
('otp_max_attempts', '5', 'Max invalid OTP attempts allowed'),
('terms_url', '/terms.php', 'Terms of service URL'),
('privacy_url', '/privacy.php', 'Privacy policy URL'),
('sms_provider', 'generic', 'Active SMS gateway provider: generic, hubtel, arkesel'),
('sms_api_url', 'https://api.smsghana.example/v1/send', 'SMS provider endpoint'),
('sms_api_key', '', 'API Key for SMS'),
('sms_api_secret', '', 'API Secret for SMS'),
('sms_sender_id', 'FarmGhana', 'Approved Sender ID for SMS'),
('sms_simulation_mode', '1', '1 to simulate SMS and display in alert/log for testing, 0 for live network SMS');

-- SEED PAYMENT GATEWAYS
INSERT INTO payment_gateways (name, code, is_enabled, mode, config, min_amount, max_amount, fee_percent, fee_fixed) VALUES
('Paystack', 'paystack', 1, 'test', '{"public_key":"pk_test_sample_afghana_demo","secret_key":"sk_test_sample_afghana_demo","webhook_secret":"whsec_sample_demo","currency":"GHS"}', 10.00, 10000.00, 1.95, 0.00),
('Bitcoin', 'bitcoin', 1, 'test', '{"provider":"blockcypher","api_key":"","wallet_address":"bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh","network":"mainnet","confirmations":3,"rate_source":"coingecko","expiry_minutes":60}', 50.00, 25000.00, 0.50, 0.00);

-- SEED DEFAULT ADMIN (Credentials: admin / Admin@1234)
INSERT INTO admins (username, email, password_hash, full_name, role, status) VALUES
('admin', 'admin@animalfarmghana.com', '$2y$10$wT5f2c73y0c9e0x5t2k.fe0aYFkIqAepkP7O5WpE7r2i1Ua9X8U9S', 'Chief Farm Administrator', 'super_admin', 'active');
-- Note: Hash above corresponds to 'Admin@1234' with standard BCRYPT

-- SEED SAMPLE DEMO USER (Credentials: user@animalfarmghana.com / User@1234, Phone: 0244123456)
INSERT INTO users (full_name, email, phone, password_hash, referral_code, status, phone_verified, wallet_balance, total_earned, total_withdrawn, pending_rewards, momo_number, momo_network) VALUES
('Kwame Mensah', 'user@animalfarmghana.com', '0244123456', '$2y$10$XjX65954BvVw0nU0tXv1feRknT6z1uH35N3.9wYj80J2E9gA3OQ7O', 'AFG83921', 'active', 1, 250.00, 850.00, 600.00, 50.00, '0244123456', 'MTN');
-- Note: Hash above corresponds to 'User@1234'

-- SEED INITIAL AGRICULTURAL TASKS
INSERT INTO tasks (title, slug, category, reward, estimated_time, description, instructions, proof_required, proof_type, max_completions, completed_count, status) VALUES
('Daily Poultry Care & Feed Record', 'daily-poultry-care-feed-record', 'Poultry', 5.00, '15 mins', 'Inspect the poultry flock, review feed intake levels, and submit a brief log of the flock health report for our peri-urban cooperative.', '1. Check the waterers and feeding troughs in your allocated section.\n2. Note any mortality or birds showing lethargy.\n3. Take a clear photograph of the feeding log sheet with today\'s date.\n4. Type your daily observation notes in the submission box below.', 1, 'both', 150, 12, 'active'),

('Goat Pen Sanitation & Fodder Check', 'goat-pen-sanitation-fodder-check', 'Goat Farming', 10.00, '25 mins', 'Perform routine sanitation inspection of the West African Dwarf goat pens and verify dry fodder supplies.', '1. Verify pens are dry, well-ventilated, and clean.\n2. Inspect the mineral salt licks and hayracks.\n3. Submit a photo of the sanitized pen partition along with current fodder stockpile notes.', 1, 'both', 80, 5, 'active'),

('Cattle Pasture Rotational Log', 'cattle-pasture-rotational-log', 'Cattle Farming', 20.00, '40 mins', 'Assist in paddock rotation documentation and water point check for the Sanga cattle breeding unit.', '1. Document current paddock gate position and herd headcount in paddock B-3.\n2. Inspect solar borehole water trough for clean flow.\n3. Submit herd headcount confirmation and water point photo.', 1, 'both', 50, 8, 'active'),

('Catfish Pond Water Quality & Feeding Record', 'catfish-pond-water-quality-feeding', 'Fish Farming', 15.00, '30 mins', 'Measure water clarity, temperature, and feeding response in earthen ponds 1 & 2.', '1. Measure dissolved oxygen or water transparency using Secchi disk.\n2. Record afternoon feed quantity (2mm floating pellets).\n3. Enter transparency reading in cm and attach feeding activity snapshot.', 1, 'both', 100, 19, 'active'),

('Maize & Soybean Crop Health Survey', 'maize-soybean-crop-health-survey', 'Crop Farming', 12.00, '20 mins', 'Scout field plots for fall armyworm signs or moisture stress in our grain demonstration farms.', '1. Walk in a zig-zag pattern through block 4.\n2. Inspect 20 consecutive plants for leaf damage or fall armyworm presence.\n3. Report percentage of affected plants and upload field photo.', 1, 'both', 200, 24, 'active'),

('Farm Gate Produce Inventory Audit', 'farm-gate-produce-inventory-audit', 'General Farm Care', 8.00, '15 mins', 'Cross-check crates of freshly collected farm eggs and packaged cassava flour prepared for local markets.', '1. Count physical crate inventory ready for distribution.\n2. Match with warehouse dispatch sheet.\n3. Upload photograph of verified dispatch sheet and signed counterfoil.', 1, 'image_required', 60, 14, 'active');

-- SEED LEGITIMATE FARM PACKAGES (Sponsorships and Farm Allotments)
INSERT INTO farm_packages (name, slug, category, price, duration_days, description, terms, image, status) VALUES
('Broiler Flock Batch Sponsorship', 'broiler-flock-batch-sponsorship', 'Poultry', 350.00, 60, 'Sponsor a batch of 50 day-old broiler chicks raised ethically with quality grain feed in our Kasoa poultry hub. Includes 2 dressed organic broilers delivered upon harvest or market sale allotment.', 'This package covers chick procurement, veterinary vaccination, brooding heat, and commercial grower feed. Participants receive bi-weekly photo updates and can inspect their flock at our farm hub. Not an investment scheme: funds directly purchase agricultural inputs.', 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&q=80', 'active'),

('Commercial Goat Breeding Unit', 'commercial-goat-breeding-unit', 'Goat Farming', 750.00, 180, 'Participate in the raising of West African Dwarf breeding stock at our Somanya pasture. Includes veterinary care, mineral supplements, and guaranteed farm visit access.', 'Direct agricultural participation agreement. Funds are allocated exclusively to animal shelter, pasture lease, veterinary vaccination, and silage production. Progress reports provided every 30 days.', 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=800&q=80', 'active'),

('Earthen Fish Pond Catfish Cycle', 'earthen-fish-pond-catfish-cycle', 'Fish Farming', 500.00, 120, 'Support our sustainable aquaculture ponds in Ada. Covers 200 high-grade fingerlings, imported high-protein floating feed, and water exchange pump operations.', 'Standard contract farming agreement. Participant receives farm badge, digital harvest tracking, and produce redemption option at harvest completion.', 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=800&q=80', 'active'),

('1-Acre Maize & Cassava Intercrop Plot', '1-acre-maize-cassava-intercrop', 'Crop Farming', 1200.00, 150, 'Support mechanized land preparation, certified hybrid seeds, organic fertilizer, and weeding for 1 acre of staple crops in Ejura.', 'Cooperative farming partnership. All farm activities managed by registered agronomists. Transparent invoice and harvest receipt accounting.', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80', 'active');

-- SEED DEMO TRANSACTIONS FOR USER 1
INSERT INTO transactions (user_id, transaction_reference, type, amount, description, status, created_at) VALUES
(1, 'TXN-INIT-REWARD-01', 'Task Reward', 20.00, 'Approved submission for Cattle Pasture Rotational Log', 'completed', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 'TXN-INIT-REWARD-02', 'Task Reward', 15.00, 'Approved submission for Catfish Pond Water Quality & Feeding Record', 'completed', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, 'TXN-INIT-REF-01', 'Referral Reward', 5.00, 'Referral commission for user registration', 'completed', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 'TXN-INIT-WD-01', 'Withdrawal', 600.00, 'Mobile Money payout to MTN 0244123456', 'completed', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 'TXN-INIT-REWARD-03', 'Task Reward', 10.00, 'Approved submission for Goat Pen Sanitation', 'completed', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- SEED DEMO NOTIFICATIONS FOR USER 1
INSERT INTO notifications (user_id, title, message, type, is_read, link, created_at) VALUES
(1, 'Phone Verification Completed', 'Your Ghana phone number has been successfully verified with OTP. Welcome to Animal Farm Ghana!', 'system', 1, '/dashboard.php', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(1, 'Task Reward Approved', 'Your submission for Cattle Pasture Rotational Log was approved. GH₵20.00 has been credited to your rewards wallet.', 'task', 1, '/wallet.php', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 'Withdrawal Paid', 'Your withdrawal request of GH₵600.00 via MTN Mobile Money has been successfully processed.', 'withdrawal', 1, '/withdrawal-history.php', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 'New Tasks Available', '3 new farm tasks in Poultry and Crop Farming have been published. Complete them now to earn eligible rewards.', 'task', 0, '/tasks.php', NOW());
