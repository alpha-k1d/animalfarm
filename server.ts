import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data store path
const DATA_DIR = path.resolve(__dirname, 'src/data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface ServerData {
  users: any[];
  submissions: any[];
  withdrawals: any[];
  supportTickets: any[];
  callLogs: any[];
  transactions: any[];
  enrolledPackages: any[];
  events: Array<{
    id: string;
    type: 'user_registered' | 'user_deleted' | 'user_updated' | 'test_purged';
    timestamp: number;
    data: any;
  }>;
  resetTokens: Record<string, { code: string; expiresAt: number; userId: number }>;
}

const isTestUser = (u: any): boolean => {
  if (!u || typeof u !== 'object') return true;
  if (u.id === 0 || u.id === 1 || u.id === 2 || u.id === 3) return true;
  if (typeof u.id === 'number' && ((u.id >= 100 && u.id <= 120) || u.id >= 900)) return true;
  const name = (u.fullName || '').toLowerCase().trim();
  if (
    name.includes('kwame mensah') ||
    name.includes('kwadwo mensah') ||
    name.includes('abena mansa') ||
    name.includes('abena serwaa') ||
    name.includes('kofi boateng') ||
    name.includes('kojo badu') ||
    name.includes('yaa asantewaa') ||
    name.includes('test user') ||
    name.includes('demo user') ||
    name.includes('outgrower member') ||
    name.includes('dummy') ||
    name.includes('sample')
  ) {
    return true;
  }
  const email = (u.email || '').toLowerCase().trim();
  if (email.includes('@farmgh.com') || email.includes('test@') || email.includes('demo@') || email.includes('example.com')) {
    return true;
  }
  return false;
};

const isTestRecord = (item: any): boolean => {
  if (!item || typeof item !== 'object') return true;
  if (item.userId === 0 || item.userId === 1 || item.userId === 2 || item.userId === 3) return true;
  if (typeof item.userId === 'number' && ((item.userId >= 100 && item.userId <= 120) || item.userId >= 900)) return true;
  const name = (item.userName || item.name || item.accountName || item.senderName || '').toLowerCase();
  if (
    name.includes('kwame mensah') ||
    name.includes('kwadwo mensah') ||
    name.includes('abena mansa') ||
    name.includes('abena serwaa') ||
    name.includes('kofi boateng') ||
    name.includes('kojo badu') ||
    name.includes('yaa asantewaa') ||
    name.includes('test user') ||
    name.includes('demo user') ||
    name.includes('outgrower member') ||
    name.includes('dummy')
  ) {
    return true;
  }
  const phone = (item.userPhone || item.phone || item.accountNumber || '').toString();
  if (phone === '0244123456' || phone === '0207119283' || phone === '0544991823' || phone === '0241982341') {
    return true;
  }
  return false;
};

// Load database from file
function loadDatabase(): ServerData {
  const defaultData: ServerData = {
    users: [],
    submissions: [],
    withdrawals: [],
    supportTickets: [],
    callLogs: [],
    transactions: [],
    enrolledPackages: [],
    events: [],
    resetTokens: {}
  };

  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        users: Array.isArray(parsed.users) ? parsed.users.filter((u: any) => !isTestUser(u)) : [],
        submissions: Array.isArray(parsed.submissions) ? parsed.submissions.filter((s: any) => !isTestRecord(s)) : [],
        withdrawals: Array.isArray(parsed.withdrawals) ? parsed.withdrawals.filter((w: any) => !isTestRecord(w)) : [],
        supportTickets: Array.isArray(parsed.supportTickets) ? parsed.supportTickets.filter((t: any) => !isTestRecord(t)) : [],
        callLogs: Array.isArray(parsed.callLogs) ? parsed.callLogs.filter((c: any) => !isTestRecord(c)) : [],
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions.filter((tx: any) => !isTestRecord(tx)) : [],
        enrolledPackages: Array.isArray(parsed.enrolledPackages) ? parsed.enrolledPackages.filter((ep: any) => !isTestRecord(ep)) : [],
        events: Array.isArray(parsed.events) ? parsed.events.slice(-50) : [],
        resetTokens: parsed.resetTokens || {}
      };
    }
  } catch (err) {
    console.error('Error loading database:', err);
  }
  return defaultData;
}

let db = loadDatabase();

function saveDatabase() {
  try {
    // Keep events trimmed to latest 50
    if (db.events.length > 50) {
      db.events = db.events.slice(-50);
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // CORS headers for multi-device cross-origin access
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // -------------------------------------------------------------
  // API: Get All Users
  // -------------------------------------------------------------
  app.get('/api/users', (req, res) => {
    const validUsers = db.users.filter(u => !isTestUser(u));
    res.json({ success: true, users: validUsers });
  });

  // -------------------------------------------------------------
  // API: Register User (Accessible from any phone, tablet, laptop)
  // -------------------------------------------------------------
  app.post('/api/users/register', (req, res) => {
    const userData = req.body;
    if (!userData || !userData.fullName || !userData.phone) {
      res.status(400).json({ success: false, error: 'Full name and phone number are required.' });
      return;
    }

    const cleanPhone = userData.phone.replace(/[\s-]/g, '');
    const cleanEmail = (userData.email || '').toLowerCase().trim();

    // Check if phone or email already registered
    const existing = db.users.find(u => {
      const p = (u.phone || '').replace(/[\s-]/g, '');
      const e = (u.email || '').toLowerCase().trim();
      return (cleanPhone && p === cleanPhone) || (cleanEmail && e === cleanEmail);
    });

    if (existing) {
      res.status(409).json({
        success: false,
        error: `An outgrower account with phone ${userData.phone} is already registered. Please sign in or use password retrieval.`,
        user: existing
      });
      return;
    }

    const newId = userData.id || Date.now();
    const newUser = {
      ...userData,
      id: newId,
      fullName: userData.fullName.trim(),
      phone: userData.phone.trim(),
      email: userData.email ? userData.email.trim().toLowerCase() : '',
      membershipNumber: userData.membershipNumber || `GH-AFG-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      ghanaCardPin: userData.ghanaCardPin || `GHA-${Math.floor(100000000 + Math.random() * 900000000)}-${Math.floor(1 + Math.random() * 9)}`,
      district: userData.district || 'Afienya-Tema Agricultural Corridor',
      agriculturalFocus: userData.agriculturalFocus || 'Akate Broiler Poultry & Layers',
      walletBalance: typeof userData.walletBalance === 'number' ? userData.walletBalance : 10.00,
      pendingRewards: 0,
      totalEarned: typeof userData.totalEarned === 'number' ? userData.totalEarned : (typeof userData.walletBalance === 'number' ? userData.walletBalance : 10.00),
      totalWithdrawn: 0,
      referralCode: userData.referralCode || `AFG-${Math.floor(1000 + Math.random() * 9000)}`,
      referredById: userData.referredById || null,
      phoneVerified: userData.phoneVerified !== false,
      emailVerified: !!userData.emailVerified,
      status: userData.status || 'active',
      password: userData.password || 'ghanafarm123',
      createdAt: userData.createdAt || new Date().toISOString().slice(0, 10)
    };

    db.users.unshift(newUser);

    // Push real-time event for admin notification
    db.events.push({
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'user_registered',
      timestamp: Date.now(),
      data: {
        userId: newUser.id,
        fullName: newUser.fullName,
        phone: newUser.phone,
        district: newUser.district,
        membershipNumber: newUser.membershipNumber,
        registeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    });

    saveDatabase();

    res.status(201).json({
      success: true,
      message: 'Outgrower account registered and synchronized.',
      user: newUser
    });
  });

  // -------------------------------------------------------------
  // API: User Login
  // -------------------------------------------------------------
  app.post('/api/users/login', (req, res) => {
    const { identifier, password, isOtpLogin } = req.body;
    if (!identifier) {
      res.status(400).json({ success: false, error: 'Phone or email is required.' });
      return;
    }

    const cleanInput = identifier.trim().toLowerCase();
    const cleanDigits = cleanInput.replace(/[\s-]/g, '');

    const matched = db.users.find(u => {
      const p = (u.phone || '').replace(/[\s-]/g, '');
      const e = (u.email || '').toLowerCase().trim();
      const card = (u.ghanaCardPin || '').toLowerCase().trim();
      return p === cleanDigits || e === cleanInput || card === cleanInput;
    });

    if (!matched) {
      res.status(404).json({
        success: false,
        error: `No registered outgrower found matching "${identifier}". Please register for an account.`
      });
      return;
    }

    if (matched.status === 'suspended') {
      res.status(403).json({
        success: false,
        error: 'This account has been suspended by the Bureau Administrator. Please contact support.'
      });
      return;
    }

    if (!isOtpLogin && matched.password && password && matched.password !== password.trim()) {
      res.status(401).json({
        success: false,
        error: 'Incorrect outgrower password. Please try again or tap "Forgot / Retrieve Password".'
      });
      return;
    }

    res.json({
      success: true,
      user: matched,
      message: `Welcome back, ${matched.fullName}!`
    });
  });

  // -------------------------------------------------------------
  // API: Forgot Password / Account Retrieval
  // -------------------------------------------------------------
  app.post('/api/users/forgot-password', (req, res) => {
    const { identifier } = req.body;
    if (!identifier) {
      res.status(400).json({ success: false, error: 'Please provide your Ghana phone number, email, or Ghana Card PIN.' });
      return;
    }

    const clean = identifier.trim().toLowerCase();
    const digits = clean.replace(/[\s-]/g, '');

    const matched = db.users.find(u => {
      const p = (u.phone || '').replace(/[\s-]/g, '');
      const e = (u.email || '').toLowerCase().trim();
      const card = (u.ghanaCardPin || '').toLowerCase().trim();
      return p === digits || e === clean || card === clean;
    });

    if (!matched) {
      res.status(404).json({
        success: false,
        error: `No outgrower account found with "${identifier}". Please check your details or register.`
      });
      return;
    }

    // Generate 6-digit OTP code for secure retrieval
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

    db.resetTokens[digits] = { code, expiresAt, userId: matched.id };
    if (matched.email) {
      db.resetTokens[matched.email.toLowerCase()] = { code, expiresAt, userId: matched.id };
    }
    saveDatabase();

    const maskedPhone = matched.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1-****-$2');

    res.json({
      success: true,
      message: `Verification code generated for ${matched.fullName}.`,
      recoveryCode: code, // provided for instant testing and automated dispatch
      maskedDestination: maskedPhone,
      user: {
        id: matched.id,
        fullName: matched.fullName,
        phone: matched.phone,
        email: matched.email,
        ghanaCardPin: matched.ghanaCardPin
      }
    });
  });

  // -------------------------------------------------------------
  // API: Reset Password
  // -------------------------------------------------------------
  app.post('/api/users/reset-password', (req, res) => {
    const { identifier, code, newPassword } = req.body;
    if (!identifier || !code || !newPassword) {
      res.status(400).json({ success: false, error: 'Identifier, verification code, and new password are required.' });
      return;
    }

    const clean = identifier.trim().toLowerCase();
    const digits = clean.replace(/[\s-]/g, '');

    const tokenRecord = db.resetTokens[digits] || db.resetTokens[clean];
    if (!tokenRecord || tokenRecord.code !== code.trim()) {
      res.status(400).json({ success: false, error: 'Invalid or expired verification code. Please request a new code.' });
      return;
    }

    if (Date.now() > tokenRecord.expiresAt) {
      delete db.resetTokens[digits];
      res.status(400).json({ success: false, error: 'Verification code has expired. Please request a fresh code.' });
      return;
    }

    const userIndex = db.users.findIndex(u => u.id === tokenRecord.userId);
    if (userIndex === -1) {
      res.status(404).json({ success: false, error: 'Account not found.' });
      return;
    }

    db.users[userIndex].password = newPassword.trim();
    delete db.resetTokens[digits];
    if (db.users[userIndex].email) {
      delete db.resetTokens[db.users[userIndex].email.toLowerCase()];
    }

    saveDatabase();

    res.json({
      success: true,
      message: 'Password successfully updated. You can now access your account from any device.',
      user: db.users[userIndex]
    });
  });

  // -------------------------------------------------------------
  // API: Update User Details
  // -------------------------------------------------------------
  app.put('/api/users/:id', (req, res) => {
    const userId = Number(req.params.id);
    const updates = req.body;

    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    db.users[userIndex] = { ...db.users[userIndex], ...updates };

    // Update references in activities
    if (updates.fullName) {
      db.submissions.forEach(s => { if (s.userId === userId) s.userName = updates.fullName; });
      db.withdrawals.forEach(w => { if (w.userId === userId) w.userName = updates.fullName; });
      db.supportTickets.forEach(t => { if (t.userId === userId) t.userName = updates.fullName; });
      db.callLogs.forEach(c => { if (c.userId === userId) c.userName = updates.fullName; });
    }
    if (updates.phone) {
      db.submissions.forEach(s => { if (s.userId === userId) s.userPhone = updates.phone; });
      db.supportTickets.forEach(t => { if (t.userId === userId) t.userPhone = updates.phone; });
      db.callLogs.forEach(c => { if (c.userId === userId) c.userPhone = updates.phone; });
    }

    db.events.push({
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'user_updated',
      timestamp: Date.now(),
      data: { userId, updates }
    });

    saveDatabase();

    res.json({ success: true, user: db.users[userIndex] });
  });

  // -------------------------------------------------------------
  // API: Delete User (Instant Deletion)
  // -------------------------------------------------------------
  app.delete('/api/users/:id', (req, res) => {
    const userId = Number(req.params.id);
    const userToDelete = db.users.find(u => u.id === userId);

    db.users = db.users.filter(u => u.id !== userId);
    db.submissions = db.submissions.filter(s => s.userId !== userId);
    db.withdrawals = db.withdrawals.filter(w => w.userId !== userId);
    db.supportTickets = db.supportTickets.filter(t => t.userId !== userId);
    db.callLogs = db.callLogs.filter(c => c.userId !== userId);
    db.transactions = db.transactions.filter(t => t.userId !== userId);
    db.enrolledPackages = db.enrolledPackages.filter(ep => ep.userId !== userId);

    db.events.push({
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'user_deleted',
      timestamp: Date.now(),
      data: { userId, fullName: userToDelete?.fullName || 'User' }
    });

    saveDatabase();

    res.json({ success: true, message: 'User account and all records permanently purged.' });
  });

  // -------------------------------------------------------------
  // API: Admin Credentials Check (Password: alphak1d)
  // -------------------------------------------------------------
  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const cleanUser = (username || '').toLowerCase().trim();
    const cleanPass = (password || '').trim();

    if (cleanUser === 'admin@animalfarmghana.com' && cleanPass === 'alphak1d') {
      res.json({
        success: true,
        message: 'Admin authorization granted for National Statutory Desk.',
        role: 'super_admin'
      });
    } else {
      res.status(401).json({
        success: false,
        error: cleanUser !== 'admin@animalfarmghana.com'
          ? 'Invalid Bureau Username. Expected: admin@animalfarmghana.com'
          : 'Invalid Administrator Password. Please verify your credentials.'
      });
    }
  });

  // -------------------------------------------------------------
  // API: Real-time Multi-Device Sync Endpoint
  // -------------------------------------------------------------
  app.get('/api/sync', (req, res) => {
    const since = Number(req.query.since) || 0;
    const recentEvents = db.events.filter(e => e.timestamp > since);

    const validUsers = db.users.filter(u => !isTestUser(u));
    const validSubs = db.submissions.filter(s => !isTestRecord(s));
    const validWds = db.withdrawals.filter(w => !isTestRecord(w));
    const validTickets = db.supportTickets.filter(t => !isTestRecord(t));
    const validCalls = db.callLogs.filter(c => !isTestRecord(c));

    res.json({
      success: true,
      serverTime: Date.now(),
      users: validUsers,
      submissions: validSubs,
      withdrawals: validWds,
      supportTickets: validTickets,
      callLogs: validCalls,
      events: recentEvents
    });
  });

  // -------------------------------------------------------------
  // API: Purge Any Test User Activities
  // -------------------------------------------------------------
  app.post('/api/activities/purge-test', (req, res) => {
    db.users = db.users.filter(u => !isTestUser(u));
    db.submissions = db.submissions.filter(s => !isTestRecord(s));
    db.withdrawals = db.withdrawals.filter(w => !isTestRecord(w));
    db.supportTickets = db.supportTickets.filter(t => !isTestRecord(t));
    db.callLogs = db.callLogs.filter(c => !isTestRecord(c));
    db.transactions = db.transactions.filter(t => !isTestRecord(t));
    db.enrolledPackages = db.enrolledPackages.filter(ep => !isTestRecord(ep));

    saveDatabase();

    res.json({
      success: true,
      message: 'All test user records and activities have been purged from the server.'
    });
  });

  // -------------------------------------------------------------
  // Vite Integration (Dev middleware or Static build serving)
  // -------------------------------------------------------------
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'));

  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Animal Farm Ghana] Unified Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
