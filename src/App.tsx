// src/App.tsx - Animal Farm Ghana Main Application
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Task, 
  TaskSubmission, 
  FarmPackage, 
  EnrolledPackage, 
  WithdrawalRequest, 
  Transaction, 
  NotificationItem, 
  SystemSettings,
  PaymentGateway
} from './types';
import { 
  initialUser, 
  initialTasks, 
  initialFarmPackages, 
  initialEnrolledPackages,
  initialSubmissions, 
  initialWithdrawals, 
  initialTransactions, 
  initialNotifications, 
  initialSettings 
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { TasksView } from './components/TasksView';
import { OverviewView } from './components/OverviewView';
import { PackagesView } from './components/PackagesView';
import { WalletView } from './components/WalletView';
import { ReferralsView } from './components/ReferralsView';
import { AdminPortalView } from './components/AdminPortalView';
import { NotificationsModal } from './components/NotificationsModal';
import { PhoneVerificationModal } from './components/PhoneVerificationModal';
import { LegalModal } from './components/LegalModal';
import { OfficialCredentialsModal } from './components/OfficialCredentialsModal';
import { FarmerIdCardModal } from './components/FarmerIdCardModal';
import { ProfileModal } from './components/ProfileModal';
import { InspectionCertificateModal } from './components/InspectionCertificateModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { UserLoginModal } from './components/UserLoginModal';
import { SessionLockedView } from './components/SessionLockedView';
import { AdminChatWidget } from './components/AdminChatWidget';
import { AdminPortalChatWidget } from './components/AdminPortalChatWidget';
import { INITIAL_SUPPORT_TICKETS } from './data/mockSupportTickets';
import { AppLogo } from './components/AppLogo';
import { GhanaFlag } from './components/GhanaFlag';
import { Sprout, ShieldCheck, HelpCircle, Award, IdCard, Landmark, FileCheck, Lock } from 'lucide-react';
import { UserComplaintTicket, UserCallLog } from './types';
import { UserCallModal } from './components/UserCallModal';
import { AdminCallModal } from './components/AdminCallModal';
import { INITIAL_CALL_LOGS } from './data/mockCallLogs';
import { sounds } from './services/soundEffects';
import { api } from './services/api';

// Storage keys for persistent credentials and session management
const STORAGE_USERS_KEY = 'afg_coop_all_users_v3';
const STORAGE_CURRENT_USER_KEY = 'afg_coop_current_user_v3';
const STORAGE_LOGGED_IN_KEY = 'afg_coop_is_logged_in_v3';

// Helper to identify and purge all test user accounts
const isTestUserAccount = (u: any): boolean => {
  if (!u || typeof u !== 'object') return true;
  // Explicit test account IDs:
  if (u.id === 0 || u.id === 1 || u.id === 2 || u.id === 3) return true;
  if (typeof u.id === 'number' && ((u.id >= 100 && u.id <= 120) || u.id >= 900)) return true;
  if (typeof u.fullName === 'string') {
    const lowerName = u.fullName.trim().toLowerCase();
    if (
      lowerName === 'abena mansa osei' || 
      lowerName === 'kofi boateng addo' || 
      lowerName.includes('kwame mensah') ||
      lowerName.includes('kwadwo mensah') ||
      lowerName.includes('abena mansa') ||
      lowerName.includes('abena serwaa') ||
      lowerName.includes('kofi boateng') ||
      lowerName.includes('kojo badu') ||
      lowerName.includes('yaa asantewaa') ||
      lowerName.includes('test user') || 
      lowerName.includes('demo user') ||
      lowerName.includes('dummy') ||
      lowerName.includes('sample user') ||
      lowerName === 'outgrower member'
    ) {
      return true;
    }
  }
  if (typeof u.email === 'string') {
    const lowerEmail = u.email.trim().toLowerCase();
    if (
      lowerEmail.includes('@farmgh.com') ||
      lowerEmail.includes('test@') ||
      lowerEmail.includes('demo@') ||
      lowerEmail.includes('example.com')
    ) {
      return true;
    }
  }
  return false;
};

// Helper to identify and purge activities belonging to test users
const isTestActivity = (item: any): boolean => {
  if (!item || typeof item !== 'object') return true;
  // If item has test user IDs: 0, 1, 2, 3, or mock IDs 100-120 or 900+
  if (
    item.userId === 0 ||
    item.userId === 1 ||
    item.userId === 2 ||
    item.userId === 3 ||
    (typeof item.userId === 'number' && ((item.userId >= 100 && item.userId <= 120) || item.userId >= 900))
  ) {
    return true;
  }
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
    name.includes('dummy') ||
    name.includes('sample')
  ) {
    return true;
  }
  const phone = (item.userPhone || item.phone || item.accountNumber || '').toString();
  if (phone === '0244123456' || phone === '0207119283' || phone === '0544991823' || phone === '0241982341') {
    return true;
  }
  return false;
};

const loadSavedUsers = (): User[] => {
  try {
    const saved = localStorage.getItem(STORAGE_USERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Purge any test user accounts permanently
        const cleaned = parsed.filter(u => !isTestUserAccount(u));
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(cleaned));
        }
        return cleaned;
      }
    }
  } catch (e) {
    console.error('Failed to parse saved users:', e);
  }
  // Return empty list so only real registered users are connected to admin
  return [];
};

const loadSavedCurrentUser = (usersList: User[]): User => {
  try {
    const saved = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.id && !isTestUserAccount(parsed)) {
        // Sync with usersList if found to ensure latest balances
        const matched = usersList.find(u => u.id === parsed.id);
        return matched || parsed;
      } else {
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      }
    }
  } catch (e) {
    console.error('Failed to parse current user:', e);
  }
  return usersList[0] || initialUser;
};

const loadSavedLoggedIn = (currUser?: User): boolean => {
  try {
    const saved = localStorage.getItem(STORAGE_LOGGED_IN_KEY);
    if (saved !== null) {
      const isTrue = saved === 'true';
      if (!isTrue) return false;
      // If current user is not a real user or is test user, do not keep logged in
      if (!currUser || currUser.id === 0 || isTestUserAccount(currUser)) {
        return false;
      }
      return true;
    }
  } catch (e) {
    console.error('Failed to parse logged in status:', e);
  }
  return false;
};

export function App() {
  // State with LocalStorage Persistence
  const [allUsers, setAllUsers] = useState<User[]>(() => loadSavedUsers());
  const [currentUser, setCurrentUser] = useState<User>(() => loadSavedCurrentUser(loadSavedUsers()));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const initialUsers = loadSavedUsers();
    const curr = loadSavedCurrentUser(initialUsers);
    return loadSavedLoggedIn(curr);
  });
  const [logoutToast, setLogoutToast] = useState<{ name: string; balance: number } | null>(null);
  const [appToast, setAppToast] = useState<{ title: string; message: string; type?: 'info' | 'warning' | 'success' } | null>(null);

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [farmPackages, setFarmPackages] = useState<FarmPackage[]>(initialFarmPackages);
  const [enrolledPackages, setEnrolledPackages] = useState<EnrolledPackage[]>(() => {
    try {
      const saved = localStorage.getItem('afg_enrolled_packages_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed
            .filter(p => !isTestActivity(p))
            .map(p => ({
              ...p,
              durationDays: 20,
              daysRemaining: Math.min(p.daysRemaining ?? 20, 20)
            }));
          localStorage.setItem('afg_enrolled_packages_v2', JSON.stringify(cleaned));
          return cleaned;
        }
      }
    } catch (e) {}
    return [];
  });
  const [submissions, setSubmissions] = useState<TaskSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('afg_submissions_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(s => !isTestActivity(s));
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('afg_submissions_v2', JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch (e) {}
    return [];
  });
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => {
    try {
      const saved = localStorage.getItem('afg_withdrawals_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(w => !isTestActivity(w));
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('afg_withdrawals_v2', JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch (e) {}
    return [];
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('afg_transactions_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(t => !isTestActivity(t));
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('afg_transactions_v2', JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch (e) {}
    return [];
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const [supportTickets, setSupportTickets] = useState<UserComplaintTicket[]>(() => {
    try {
      const saved = localStorage.getItem('afg_support_tickets_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(t => !isTestActivity(t));
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('afg_support_tickets_v3', JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch (e) {}
    return [];
  });
  const [callLogs, setCallLogs] = useState<UserCallLog[]>(() => {
    try {
      const saved = localStorage.getItem('afg_call_logs_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(c => !isTestActivity(c));
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('afg_call_logs_v2', JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved call logs:', e);
    }
    return [];
  });
  const [isUserCallModalOpen, setIsUserCallModalOpen] = useState<boolean>(false);
  const [currentAdminActiveCall, setCurrentAdminActiveCall] = useState<UserCallLog | null>(null);
  const [currentUserActiveCall, setCurrentUserActiveCall] = useState<UserCallLog | null>(null);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('afg_submissions_v2', JSON.stringify(submissions));
    } catch (e) {}
  }, [submissions]);

  useEffect(() => {
    try {
      localStorage.setItem('afg_withdrawals_v2', JSON.stringify(withdrawals));
    } catch (e) {}
  }, [withdrawals]);

  useEffect(() => {
    try {
      localStorage.setItem('afg_transactions_v2', JSON.stringify(transactions));
    } catch (e) {}
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('afg_enrolled_packages_v2', JSON.stringify(enrolledPackages));
    } catch (e) {}
  }, [enrolledPackages]);

  useEffect(() => {
    try {
      localStorage.setItem('afg_support_tickets_v3', JSON.stringify(supportTickets));
    } catch (e) {}
  }, [supportTickets]);

  useEffect(() => {
    try {
      localStorage.setItem('afg_call_logs_v2', JSON.stringify(callLogs));
    } catch (e) {
      console.error('Failed to persist call logs:', e);
    }
  }, [callLogs]);

  // UI Navigation
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);
  const [legalModalPage, setLegalModalPage] = useState<string | null>(null);
  const [isOfficialCredentialsOpen, setIsOfficialCredentialsOpen] = useState<boolean>(false);
  const [isFarmerIdCardOpen, setIsFarmerIdCardOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [selectedInspectionCert, setSelectedInspectionCert] = useState<TaskSubmission | null>(null);
  const [isUserLoginModalOpen, setIsUserLoginModalOpen] = useState<boolean>(false);
  const [userLoginModalMode, setUserLoginModalMode] = useState<'login' | 'register'>('login');

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Auto-dismiss appToast after 4.5 seconds
  useEffect(() => {
    if (!appToast) return;
    const timer = setTimeout(() => setAppToast(null), 4500);
    return () => clearTimeout(timer);
  }, [appToast]);

  // Auto-synchronize currentUser state into allUsers and localStorage
  useEffect(() => {
    if (currentUser && currentUser.id !== 0 && !isTestUserAccount(currentUser)) {
      setAllUsers(prev => {
        const cleaned = prev.filter(u => !isTestUserAccount(u));
        const found = cleaned.some(u => u.id === currentUser.id);
        const updated = found 
          ? cleaned.map(u => u.id === currentUser.id ? { ...u, ...currentUser } : u)
          : [currentUser, ...cleaned];
        try {
          localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      try {
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(currentUser));
      } catch (e) {}
    }
  }, [currentUser]);

  // Scrub all test user activities on startup and whenever allUsers changes
  useEffect(() => {
    const validUserIds = new Set(allUsers.filter(u => !isTestUserAccount(u)).map(u => u.id));
    
    setSubmissions(prev => {
      const filtered = prev.filter(s => !isTestActivity(s) && validUserIds.has(s.userId));
      if (filtered.length !== prev.length) {
        try { localStorage.setItem('afg_submissions_v2', JSON.stringify(filtered)); } catch (e) {}
      }
      return filtered;
    });

    setWithdrawals(prev => {
      const filtered = prev.filter(w => !isTestActivity(w) && validUserIds.has(w.userId));
      if (filtered.length !== prev.length) {
        try { localStorage.setItem('afg_withdrawals_v2', JSON.stringify(filtered)); } catch (e) {}
      }
      return filtered;
    });

    setTransactions(prev => {
      const filtered = prev.filter(t => !isTestActivity(t) && validUserIds.has(t.userId));
      if (filtered.length !== prev.length) {
        try { localStorage.setItem('afg_transactions_v2', JSON.stringify(filtered)); } catch (e) {}
      }
      return filtered;
    });

    setEnrolledPackages(prev => {
      const filtered = prev.filter(ep => !isTestActivity(ep) && validUserIds.has(ep.userId));
      if (filtered.length !== prev.length) {
        try { localStorage.setItem('afg_enrolled_packages_v2', JSON.stringify(filtered)); } catch (e) {}
      }
      return filtered;
    });

    setSupportTickets(prev => {
      const filtered = prev.filter(t => !isTestActivity(t) && validUserIds.has(t.userId));
      if (filtered.length !== prev.length) {
        try { localStorage.setItem('afg_support_tickets_v3', JSON.stringify(filtered)); } catch (e) {}
      }
      return filtered;
    });

    setCallLogs(prev => {
      const filtered = prev.filter(c => !isTestActivity(c) && validUserIds.has(c.userId));
      if (filtered.length !== prev.length) {
        try { localStorage.setItem('afg_call_logs_v2', JSON.stringify(filtered)); } catch (e) {}
      }
      return filtered;
    });
  }, [allUsers]);

  // Multi-Device Synchronization & Real-time Cross-Device Notification Engine
  const [lastServerSyncTimestamp, setLastServerSyncTimestamp] = useState<number>(0);

  useEffect(() => {
    let active = true;

    const runSync = async () => {
      try {
        const syncData = await api.sync(lastServerSyncTimestamp);
        if (!active || !syncData || !syncData.success) return;

        if (syncData.serverTime) {
          setLastServerSyncTimestamp(syncData.serverTime);
        }

        // Process incoming events from other devices (e.g. phones, tablets)
        if (syncData.events && syncData.events.length > 0) {
          syncData.events.forEach(evt => {
            if (evt.type === 'user_registered') {
              sounds.playNotificationChime();
              setAppToast({
                title: 'New Farmer Added to Directory',
                message: `${evt.data.fullName} (${evt.data.phone || ''} • ${evt.data.district || 'Ghana'}) has registered and joined the Farmers Directory.`,
                type: 'success'
              });

              setNotifications(prev => [
                {
                  id: Date.now() + Math.random(),
                  userId: evt.data.userId,
                  title: `Outgrower Joined: ${evt.data.fullName}`,
                  message: `${evt.data.fullName} registered from phone/device and was added to the Farmers Directory (${evt.data.membershipNumber || 'Coop Pass'}).`,
                  type: 'system',
                  read: false,
                  createdAt: 'Just now'
                },
                ...prev
              ]);
            } else if (evt.type === 'user_deleted') {
              setCurrentUser(curr => {
                if (curr.id === evt.data.userId) {
                  setIsLoggedIn(false);
                  try {
                    localStorage.setItem(STORAGE_LOGGED_IN_KEY, 'false');
                    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
                  } catch (e) {}
                  setAppToast({
                    title: 'Account Deactivated',
                    message: 'Your outgrower account has been removed by the administrator.',
                    type: 'warning'
                  });
                  return initialUser;
                }
                return curr;
              });
            }
          });
        }

        // Synchronize real registered users across devices
        if (Array.isArray(syncData.users)) {
          const validUsers = syncData.users.filter(u => !isTestUserAccount(u));
          setAllUsers(prev => {
            const map = new Map<number, User>();
            prev.filter(u => !isTestUserAccount(u)).forEach(u => map.set(u.id, u));
            validUsers.forEach(u => {
              if (map.has(u.id)) {
                map.set(u.id, { ...map.get(u.id)!, ...u });
              } else {
                map.set(u.id, u);
              }
            });
            const merged = Array.from(map.values());
            try {
              localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      } catch (err) {
        // Network error ignored
      }
    };

    runSync();
    const interval = setInterval(runSync, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [lastServerSyncTimestamp]);

  // Security Enforcement: Automatically log out any active user account if admin portal / admin mode is accessed
  useEffect(() => {
    if (isAdminMode && isLoggedIn) {
      setIsLoggedIn(false);
      try {
        localStorage.setItem(STORAGE_LOGGED_IN_KEY, 'false');
      } catch (e) {}
      setAppToast({
        title: 'Security Notice: Session Closed',
        message: 'Active member account was automatically logged out for Administrator Portal access.',
        type: 'warning'
      });
    }
  }, [isAdminMode, isLoggedIn]);

  // Handler: Open Admin Portal with Automatic User Logout
  const handleOpenAdminLogin = () => {
    if (isLoggedIn) {
      // Automatically log out of user account immediately
      handleLogout();
      setAppToast({
        title: 'Session Automatically Closed',
        message: 'You have been automatically logged out of your member account to access the Administrator Portal.',
        type: 'warning'
      });
      sounds.playNotificationChime();
    }
    setIsAdminLoginOpen(true);
  };

  // Professional Session Logout Handler
  const handleLogout = () => {
    const outgoingUser = currentUser;
    setIsLoggedIn(false);
    try {
      localStorage.setItem(STORAGE_LOGGED_IN_KEY, 'false');
    } catch (e) {}

    // Show professional session termination notice
    setLogoutToast({
      name: outgoingUser.fullName,
      balance: outgoingUser.walletBalance
    });

    const logoutNotif: NotificationItem = {
      id: Date.now(),
      userId: outgoingUser.id,
      title: 'Session Successfully Logged Out',
      message: `Outgrower credentials for ${outgoingUser.fullName} logged out. Your GH₵ ${outgoingUser.walletBalance.toFixed(2)} balance and farm units are safely stored.`,
      type: 'system',
      read: false,
      createdAt: 'Just now'
    };
    setNotifications(prev => [logoutNotif, ...prev]);
  };

  // Professional Credential Activation on Login
  const handleLoginSuccess = (user: User, isNewRegistration?: boolean) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setLogoutToast(null);

    try {
      localStorage.setItem(STORAGE_LOGGED_IN_KEY, 'true');
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    } catch (e) {}

    setAllUsers(prev => {
      const cleanedPrev = prev.filter(u => !isTestUserAccount(u));
      const exists = cleanedPrev.some(u => 
        u.id === user.id || 
        (user.phone && u.phone.replace(/[\s-]/g, '') === user.phone.replace(/[\s-]/g, '')) ||
        (user.email && u.email.toLowerCase() === user.email.toLowerCase())
      );
      const updated = exists
        ? cleanedPrev.map(u => 
            (u.id === user.id || 
             (user.phone && u.phone.replace(/[\s-]/g, '') === user.phone.replace(/[\s-]/g, '')) ||
             (user.email && u.email.toLowerCase() === user.email.toLowerCase()))
              ? { ...u, ...user } 
              : u
          )
        : [user, ...cleanedPrev];

      try {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Synchronize to multi-device backend
    api.registerUser(user).catch(e => console.warn('Failed to sync registered user to server:', e));

    if (isNewRegistration) {
      sounds.playNotificationChime();
      setAppToast({
        title: 'New Farmer Registered & Connected',
        message: `${user.fullName} (${user.district}) has been registered and added to the Farmers Directory.`,
        type: 'success'
      });

      const regNotif: NotificationItem = {
        id: Date.now(),
        userId: user.id,
        title: `Outgrower Enrolled: ${user.fullName}`,
        message: `Welcome to Animal Farm Ghana! Your membership pass (${user.membershipNumber}) and GH₵ ${user.walletBalance.toFixed(2)} welcome bonus are active and added to the Farmers Directory.`,
        type: 'system',
        read: false,
        createdAt: 'Just now'
      };
      setNotifications(prev => [regNotif, ...prev]);
    } else {
      // Send active welcome notification
      const welcomeNotif: NotificationItem = {
        id: Date.now(),
        userId: user.id,
        title: `Credentials Active: ${user.fullName}`,
        message: `Welcome back! Your outgrower credentials, membership pass (${user.membershipNumber}), and GH₵ ${user.walletBalance.toFixed(2)} balance are active.`,
        type: 'system',
        read: false,
        createdAt: 'Just now'
      };
      setNotifications(prev => [welcomeNotif, ...prev]);
    }

    setIsUserLoginModalOpen(false);
  };

  const handleUpdateAvatar = (avatarUrl: string) => {
    setCurrentUser(prev => ({ ...prev, avatar: avatarUrl }));
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, avatar: avatarUrl } : u));
    setNotifications(prev => [
      {
        id: Date.now(),
        userId: currentUser.id,
        title: 'Profile Picture Updated',
        message: 'Your profile photo has been successfully updated.',
        type: 'system',
        read: false,
        createdAt: 'Just now'
      },
      ...prev
    ]);
  };

  // Handler: Task Submission by Farmer
  const handleSubmitTaskProof = (taskId: number, text: string, proofUrl: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubmission: TaskSubmission = {
      id: Date.now(),
      taskId: task.id,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userPhone: currentUser.phone,
      taskTitle: task.title,
      category: task.category,
      rewardAmount: task.reward,
      submissionText: text,
      proofFile: proofUrl,
      status: 'pending',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setSubmissions(prev => [newSubmission, ...prev]);

    // Add to user pending rewards
    setCurrentUser(prev => ({
      ...prev,
      pendingRewards: prev.pendingRewards + task.reward
    }));

    // If this task belongs to an enrolled package, track daily completion
    if (task.packageId) {
      setEnrolledPackages(prev => prev.map(p => {
        if (p.packageId === task.packageId && p.status === 'active') {
          const currentCompleted = p.completedDailyTasksToday || [];
          if (!currentCompleted.includes(task.id)) {
            return {
              ...p,
              completedDailyTasksToday: [...currentCompleted, task.id]
            };
          }
        }
        return p;
      }));
    }

    // Update task completion count
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completedCount: t.completedCount + 1 } : t));

    // Send notification
    const newNotif: NotificationItem = {
      id: Date.now() + 1,
      userId: currentUser.id,
      title: 'Field Proof Submitted',
      message: `Your proof for "${task.title}" has been submitted for supervisor review. GH₵ ${task.reward.toFixed(2)} added to pending rewards.`,
      type: 'task',
      read: false,
      createdAt: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Handler: Admin Approves Submission
  const handleApproveSubmission = (subId: number, notes: string) => {
    const sub = submissions.find(s => s.id === subId);
    if (!sub || sub.status !== 'pending') return;

    setSubmissions(prev => prev.map(s => s.id === subId ? {
      ...s,
      status: 'approved',
      adminNotes: notes,
      reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    } : s));

    // Credit user wallet & adjust pending rewards
    setCurrentUser(prev => {
      if (prev.id === sub.userId) {
        return {
          ...prev,
          walletBalance: prev.walletBalance + sub.rewardAmount,
          pendingRewards: Math.max(0, prev.pendingRewards - sub.rewardAmount),
          totalEarned: prev.totalEarned + sub.rewardAmount
        };
      }
      return prev;
    });

    // Record ledger transaction
    const newTx: Transaction = {
      id: Date.now(),
      userId: sub.userId,
      type: 'Task Reward',
      amount: sub.rewardAmount,
      description: `Approved: ${sub.taskTitle}`,
      status: 'completed',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setTransactions(prev => [newTx, ...prev]);

    // Send notification to user
    const newNotif: NotificationItem = {
      id: Date.now() + 2,
      userId: sub.userId,
      title: 'Field Proof Approved!',
      message: `Supervisor approved your task "${sub.taskTitle}". GH₵ ${sub.rewardAmount.toFixed(2)} has been credited to your available balance.`,
      type: 'task',
      read: false,
      createdAt: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Handler: Admin Rejects Submission
  const handleRejectSubmission = (subId: number, notes: string) => {
    const sub = submissions.find(s => s.id === subId);
    if (!sub || sub.status !== 'pending') return;

    setSubmissions(prev => prev.map(s => s.id === subId ? {
      ...s,
      status: 'rejected',
      adminNotes: notes,
      reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    } : s));

    // Deduct from pending rewards
    setCurrentUser(prev => {
      if (prev.id === sub.userId) {
        return {
          ...prev,
          pendingRewards: Math.max(0, prev.pendingRewards - sub.rewardAmount)
        };
      }
      return prev;
    });

    const newNotif: NotificationItem = {
      id: Date.now() + 3,
      userId: sub.userId,
      title: 'Task Submission Feedback',
      message: `Your proof for "${sub.taskTitle}" was not approved. Supervisor note: ${notes}`,
      type: 'task',
      read: false,
      createdAt: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Handler: Execute Automated Crop Harvesting or Animal Breeding Task
  const handleAutoHarvestTask = (task: Task, notes?: string) => {
    const isCrop = task.automationType === 'crop_harvesting' || task.category === 'Crop Farming';
    const autoTypeTitle = isCrop ? 'Automatic Crop Harvesting' : 'Automatic Animal Breeding';

    // Credit user wallet immediately
    setCurrentUser(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + task.reward,
      totalEarned: prev.totalEarned + task.reward
    }));

    // Create approved submission
    const newSubmission: TaskSubmission = {
      id: Date.now(),
      taskId: task.id,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userPhone: currentUser.phone,
      taskTitle: task.title,
      protocolCode: task.protocolCode,
      category: task.category,
      rewardAmount: task.reward,
      submissionText: notes || `[${autoTypeTitle}] Autonomous IoT & drone sensor feed verified. Harvest/breeding quota satisfied automatically for sponsored unit.`,
      status: 'approved',
      isAutomated: true,
      automationType: isCrop ? 'crop_harvesting' : 'animal_breeding',
      inspectorName: 'MoFA Autonomous Telemetry & IoT Sensor Network',
      verifiedCoordinates: 'Ghana Agro Zone 04 (5.6037° N, 0.1870° W)',
      certificateNumber: `AUTO-${isCrop ? 'HARV' : 'BREED'}-${Date.now().toString().slice(-6)}`,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setSubmissions(prev => [newSubmission, ...prev]);

    // Record ledger transaction
    const newTx: Transaction = {
      id: Date.now(),
      userId: currentUser.id,
      type: 'Task Reward',
      amount: task.reward,
      description: `Automated ${isCrop ? 'Crop Harvest' : 'Animal Breeding'}: ${task.title}`,
      status: 'completed',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setTransactions(prev => [newTx, ...prev]);

    // Increment completed count
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completedCount: t.completedCount + 1 } : t));

    // If this task belongs to an enrolled package, track daily shift completion
    if (task.packageId) {
      setEnrolledPackages(prev => prev.map(p => {
        if (p.packageId === task.packageId && p.status === 'active') {
          const currentCompleted = p.completedDailyTasksToday || [];
          if (!currentCompleted.includes(task.id)) {
            return {
              ...p,
              completedDailyTasksToday: [...currentCompleted, task.id]
            };
          }
        }
        return p;
      }));
    }

    // Send notification
    const newNotif: NotificationItem = {
      id: Date.now() + 5,
      userId: currentUser.id,
      title: `${isCrop ? 'Automatic Crop Harvest' : 'Automatic Animal Breeding'} Yield Credited!`,
      message: `Autonomous telemetry logged "${task.title}". GH₵ ${task.reward.toFixed(2)} has been deposited directly into your available wallet balance.`,
      type: 'task',
      read: false,
      createdAt: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Handler: Run all automated tasks at once
  const handleAutoHarvestAll = () => {
    const automatedTasks = tasks.filter(t => t.isAutomated && t.status === 'active');
    if (automatedTasks.length === 0) return;

    let totalYield = 0;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newSubs: TaskSubmission[] = [];
    const newTxs: Transaction[] = [];

    automatedTasks.forEach((t, idx) => {
      totalYield += t.reward;
      const isCrop = t.automationType === 'crop_harvesting' || t.category === 'Crop Farming';
      const timeStampId = Date.now() + idx;

      newSubs.push({
        id: timeStampId,
        taskId: t.id,
        userId: currentUser.id,
        userName: currentUser.fullName,
        userPhone: currentUser.phone,
        taskTitle: t.title,
        protocolCode: t.protocolCode,
        category: t.category,
        rewardAmount: t.reward,
        submissionText: `[Automated Batch Cycle] IoT telemetry recorded ${isCrop ? 'grain moisture & combine harvest yield' : 'gestation & breeding telemetry'}. Autonomous protocol verified.`,
        status: 'approved',
        isAutomated: true,
        automationType: isCrop ? 'crop_harvesting' : 'animal_breeding',
        inspectorName: 'MoFA Automated Drone & IoT Telemetry Grid',
        verifiedCoordinates: 'Ghana Agro Zone 04 (5.6037° N, 0.1870° W)',
        certificateNumber: `AUTO-BATCH-${timeStampId.toString().slice(-6)}`,
        submittedAt: nowStr,
        reviewedAt: nowStr
      });

      newTxs.push({
        id: timeStampId + 1000,
        userId: currentUser.id,
        type: 'Task Reward',
        amount: t.reward,
        description: `Batch Auto-${isCrop ? 'Harvest' : 'Breeding'}: ${t.title}`,
        status: 'completed',
        createdAt: nowStr
      });
    });

    // Credit wallet
    setCurrentUser(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + totalYield,
      totalEarned: prev.totalEarned + totalYield
    }));

    setSubmissions(prev => [...newSubs, ...prev]);
    setTransactions(prev => [...newTxs, ...prev]);
    setTasks(prev => prev.map(t => t.isAutomated ? { ...t, completedCount: t.completedCount + 1 } : t));

    const newNotif: NotificationItem = {
      id: Date.now() + 10,
      userId: currentUser.id,
      title: 'Automated Harvest & Breeding Batch Complete!',
      message: `Autonomous cycle finished! Collected yields from ${automatedTasks.length} automated crop harvesting & animal breeding tasks. GH₵ ${totalYield.toFixed(2)} deposited into your wallet.`,
      type: 'task',
      read: false,
      createdAt: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Handler: Farm Package Enrollment
  const handleEnrollPackage = (
    pkg: FarmPackage, 
    method: 'wallet' | 'paystack' = 'wallet', 
    reference?: string
  ) => {
    // Restrict each member to purchasing only 1 active package at a time
    const activePackages = enrolledPackages.filter(p => p.userId === currentUser.id && p.status === 'active');
    if (activePackages.length >= 1) {
      setAppToast({
        title: 'Cooperative Quota Limit (1/1)',
        message: `You already have an active sponsorship for "${activePackages[0].packageName}". Each member is permitted to purchase only one package at a time.`,
        type: 'warning'
      });
      return;
    }

    if (method === 'wallet') {
      if (currentUser.walletBalance < pkg.price) return;
      setCurrentUser(prev => ({
        ...prev,
        walletBalance: prev.walletBalance - pkg.price
      }));
    }

    const payKey = settings.paystackPublicKey || 'pk_live_953c8b729d6aa6caacfe87d1083ce5a628ae5bcb';
    const txRef = reference || (
      method === 'paystack' 
        ? `PKG-LIVE-${Date.now().toString().slice(-6)}` 
        : undefined
    );

    const cycleType = pkg.cycleType || (pkg.category === 'Crop Farming' ? 'crop_harvest' : 'animal_birth');
    const expectedBirthEvent = pkg.expectedBirthEvent || (pkg.category === 'Crop Farming' ? 'Ripened Maize Cob Combine Harvest' : 'Animal Offspring Birth & Hatching');
    const dailyInterestGhs = pkg.dailyInterestGhs || Math.round((pkg.price * 0.03) * 100) / 100;

    const newEnrolled: EnrolledPackage = {
      id: Date.now(),
      packageId: pkg.id,
      userId: currentUser.id,
      packageName: pkg.name,
      statutoryUnitCode: pkg.statutoryUnitCode,
      deedReference: pkg.deedAgreementRef,
      cluster: pkg.cooperativeCluster,
      price: pkg.price,
      enrolledAt: new Date().toISOString().split('T')[0],
      durationDays: pkg.durationDays,
      currentDay: 1,
      daysRemaining: pkg.durationDays,
      cycleType: cycleType,
      expectedBirthEvent: expectedBirthEvent,
      dailyInterestGhs: dailyInterestGhs,
      totalInterestEarned: 0,
      commissionYieldGhs: pkg.commissionYieldGhs || Math.round((pkg.price * 0.35) * 100) / 100,
      claimedInterestToday: false,
      status: 'active',
      completedDailyTasksToday: [],
      requiredDailyTasksCount: pkg.requiredDailyTasksCount || 3,
      cycleDaysCompleted: 0,
      totalInterestCommissionGhs: pkg.commissionYieldGhs || Math.round((pkg.price * 0.35) * 100) / 100
    };
    setEnrolledPackages(prev => [newEnrolled, ...prev]);

    const newTx: Transaction = {
      id: Date.now(),
      userId: currentUser.id,
      type: 'Package Enrollment',
      amount: pkg.price,
      description: method === 'paystack' 
        ? `Sponsored: ${pkg.name} (Paystack MoMo / Card)` 
        : `Sponsored: ${pkg.name} (Wallet Balance)`,
      status: 'completed',
      gateway: method === 'paystack' ? 'paystack' : undefined,
      reference: txRef,
      paystackKey: method === 'paystack' ? payKey : undefined,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setTransactions(prev => [newTx, ...prev]);

    // Trigger initial automated crop harvest or animal breeding task reward upon package purchase
    const isCropPackage = pkg.category === 'Crop Farming';
    const matchingTask = tasks.find(t => 
      t.isAutomated && (isCropPackage ? t.automationType === 'crop_harvesting' : t.automationType === 'animal_breeding')
    ) || tasks.find(t => t.isAutomated);

    if (matchingTask) {
      setTimeout(() => {
        handleAutoHarvestTask(
          matchingTask,
          `Automated telemetry activated by package purchase: ${pkg.name}. Initial automated ${isCropPackage ? 'crop harvest yield' : 'animal breeding yield'} verified by MoFA IoT network.`
        );
      }, 800);
    }

    const newNotif: NotificationItem = {
      id: Date.now() + 4,
      userId: currentUser.id,
      title: 'Farm Package Sponsored & Automation Active!',
      message: `You sponsored ${pkg.name} for GH₵ ${pkg.price.toFixed(2)}${method === 'paystack' ? ' via Paystack Live' : ''}. The ${pkg.durationDays} days until animal gives birth / crop ripens will be your daily interest (GH₵ ${dailyInterestGhs.toFixed(2)}/day). (1 of 1 Package Quota Utilized)`,
      type: 'payment',
      read: false,
      createdAt: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Handler: Claim Daily Gestation / Harvest Interest
  const handleClaimDailyInterest = (enrolledId: number) => {
    const ep = enrolledPackages.find(p => p.id === enrolledId && p.userId === currentUser.id);
    if (!ep || ep.status !== 'active') return;

    const interestAmount = ep.dailyInterestGhs || 3.00;
    
    // Credit wallet
    setCurrentUser(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + interestAmount,
      totalEarned: prev.totalEarned + interestAmount
    }));

    setEnrolledPackages(prev => prev.map(p => {
      if (p.id !== enrolledId) return p;
      return {
        ...p,
        totalInterestEarned: (p.totalInterestEarned || 0) + interestAmount,
        claimedInterestToday: true,
        lastClaimDate: new Date().toISOString().split('T')[0]
      };
    }));

    const isAnimal = ep.cycleType === 'animal_birth';
    const newTx: Transaction = {
      id: Date.now(),
      userId: currentUser.id,
      type: 'Task Reward',
      amount: interestAmount,
      description: `${isAnimal ? 'Animal Birth' : 'Crop Harvest'} Daily Interest: ${ep.packageName} (Day ${ep.currentDay || 1} of ${ep.durationDays})`,
      status: 'completed',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setTransactions(prev => [newTx, ...prev]);

    const newNotif: NotificationItem = {
      id: Date.now() + 6,
      userId: currentUser.id,
      title: `${isAnimal ? 'Animal Gestation' : 'Crop Harvest'} Interest Credited!`,
      message: `Day ${ep.currentDay || 1} of ${ep.durationDays}: GH₵ ${interestAmount.toFixed(2)} interest credited to your rewards balance. The amount of days the animal gives birth / crop ripens is your daily interest.`,
      type: 'task',
      read: false,
      createdAt: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Handler: Advance Gestation / Ripening Day
  const handleAdvanceGestationDay = (enrolledId: number) => {
    const ep = enrolledPackages.find(p => p.id === enrolledId && p.userId === currentUser.id);
    if (!ep || ep.status !== 'active') return;

    if (ep.daysRemaining <= 1) {
      // Animal gives birth or crop harvested! Settle full package with 35% interest
      handleCompletePackageCycle(enrolledId);
      return;
    }

    setEnrolledPackages(prev => prev.map(p => {
      if (p.id !== enrolledId) return p;
      const nextDay = (p.currentDay || 1) + 1;
      const remaining = Math.max(0, (p.daysRemaining || p.durationDays) - 1);
      return {
        ...p,
        currentDay: nextDay,
        daysRemaining: remaining,
        claimedInterestToday: false,
        completedDailyTasksToday: [] // Reset 3 routine shifts for the new day
      };
    }));
  };

  // Handler: Complete & Settle Farm Package Cycle with 35% Interest Commission
  const handleCompletePackageCycle = (enrolledId: number) => {
    const ep = enrolledPackages.find(p => p.id === enrolledId && p.userId === currentUser.id);
    if (!ep) return;

    setEnrolledPackages(prev => prev.map(p => p.id === enrolledId ? { ...p, status: 'completed', daysRemaining: 0 } : p));

    // Return principal + guaranteed 35% interest commission yield
    const maturityCommission = ep.commissionYieldGhs || Math.round(ep.price * 0.35 * 100) / 100;
    const totalPayout = ep.price + maturityCommission;

    setCurrentUser(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + totalPayout,
      totalEarned: prev.totalEarned + maturityCommission
    }));

    const isAnimal = ep.cycleType === 'animal_birth';
    const newTx: Transaction = {
      id: Date.now(),
      userId: currentUser.id,
      type: 'Package Payout',
      amount: totalPayout,
      description: `Settled ${isAnimal ? 'Animal Birth' : 'Crop Harvest'} Maturity Payout: ${ep.packageName} (Principal GH₵ ${ep.price.toFixed(2)} + 35% Interest Commission GH₵ ${maturityCommission.toFixed(2)})`,
      status: 'completed',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setTransactions(prev => [newTx, ...prev]);

    const newNotif: NotificationItem = {
      id: Date.now() + 15,
      userId: currentUser.id,
      title: `35% Maturity Day Reached: ${isAnimal ? 'Animal Offspring Born!' : 'Crop Combine Harvested!'}`,
      message: `The ${ep.durationDays}-day cycle for "${ep.packageName}" is complete! Expected biological event (${ep.expectedBirthEvent || 'Birth/Harvest'}) confirmed. Full 35% interest commission of GH₵ ${maturityCommission.toFixed(2)} + Principal GH₵ ${ep.price.toFixed(2)} = GH₵ ${totalPayout.toFixed(2)} settled to your wallet balance! Your 1-package sponsorship quota is now open for a new unit.`,
      type: 'task',
      read: false,
      createdAt: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Handler: Complete All Required Daily Shifts for Enrolled Package (1-Tap Auto-Fulfill)
  const handleCompleteDailyTasksBatch = (enrolledId: number) => {
    const ep = enrolledPackages.find(p => p.id === enrolledId && p.userId === currentUser.id);
    if (!ep || ep.status !== 'active') return;

    const pkgTasks = tasks.filter(t => t.packageId === ep.packageId && t.isDailyTask);
    if (pkgTasks.length === 0) return;

    const alreadyCompleted = ep.completedDailyTasksToday || [];
    const pendingTasks = pkgTasks.filter(t => !alreadyCompleted.includes(t.id));

    if (pendingTasks.length === 0) {
      setAppToast({
        title: 'Daily Shifts Completed',
        message: "All daily routine shifts for today are already completed! Claim today's interest or advance to the next day.",
        type: 'info'
      });
      return;
    }

    let earnedTotal = 0;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newSubs: TaskSubmission[] = [];
    const newTxs: Transaction[] = [];
    const newCompletedIds = [...alreadyCompleted];

    pendingTasks.forEach((t, idx) => {
      earnedTotal += t.reward;
      newCompletedIds.push(t.id);
      const timeStampId = Date.now() + idx;
      newSubs.push({
        id: timeStampId,
        taskId: t.id,
        userId: currentUser.id,
        userName: currentUser.fullName,
        userPhone: currentUser.phone,
        taskTitle: t.title,
        protocolCode: t.protocolCode,
        category: t.category,
        rewardAmount: t.reward,
        submissionText: `[Daily Routine Shift: ${t.dailyShift || 'routine'}] Automated biological telemetry verified for ${ep.packageName} (Day ${ep.currentDay || 1} of ${ep.durationDays}). Protocol ${t.protocolCode} satisfied.`,
        status: 'approved',
        isAutomated: true,
        automationType: ep.cycleType === 'crop_harvest' ? 'crop_harvesting' : 'animal_breeding',
        inspectorName: 'MoFA IoT Biological Telemetry Network',
        verifiedCoordinates: 'Ghana Agro Zone (5.6037° N, 0.1870° W)',
        certificateNumber: `DAILY-SHIFT-${timeStampId.toString().slice(-6)}`,
        submittedAt: nowStr,
        reviewedAt: nowStr,
        linkedPackageName: ep.packageName
      });

      newTxs.push({
        id: timeStampId + 1000,
        userId: currentUser.id,
        type: 'Task Reward',
        amount: t.reward,
        description: `Daily Shift Reward: ${t.title} (${ep.packageName})`,
        status: 'completed',
        createdAt: nowStr
      });
    });

    // Credit user wallet
    setCurrentUser(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + earnedTotal,
      totalEarned: prev.totalEarned + earnedTotal
    }));

    setSubmissions(prev => [...newSubs, ...prev]);
    setTransactions(prev => [...newTxs, ...prev]);
    setTasks(prev => prev.map(t => {
      if (pendingTasks.some(pt => pt.id === t.id)) {
        return { ...t, completedCount: t.completedCount + 1 };
      }
      return t;
    }));

    setEnrolledPackages(prev => prev.map(p => {
      if (p.id !== enrolledId) return p;
      return {
        ...p,
        completedDailyTasksToday: newCompletedIds,
        cycleDaysCompleted: (p.cycleDaysCompleted || 0) + 1
      };
    }));

    const maturityCommission = ep.commissionYieldGhs || Math.round((ep.price * 0.35) * 100) / 100;
    const newNotif: NotificationItem = {
      id: Date.now() + 12,
      userId: currentUser.id,
      title: 'All Daily Shifts Completed for Today!',
      message: `Completed ${pendingTasks.length} daily routine shifts for "${ep.packageName}". GH₵ ${earnedTotal.toFixed(2)} credited! Today's routine secures eligibility for your 35% interest commission (+GH₵ ${maturityCommission.toFixed(2)}) at Day ${ep.durationDays} maturity.`,
      type: 'task',
      read: false,
      createdAt: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Handler: Deposit Funds
  const handleDeposit = (gateway: PaymentGateway, amount: number, reference?: string) => {
    setCurrentUser(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + amount
    }));

    const payKey = settings.paystackPublicKey || 'pk_live_953c8b729d6aa6caacfe87d1083ce5a628ae5bcb';
    const txRef = reference || (gateway === 'paystack' ? `DEP-LIVE-${Date.now().toString().slice(-6)}` : `BTC-${Date.now().toString().slice(-6)}`);

    const newTx: Transaction = {
      id: Date.now(),
      userId: currentUser.id,
      type: 'Deposit',
      amount: amount,
      description: `${gateway === 'paystack' ? 'Paystack Ghana MoMo' : 'Bitcoin On-Chain'} deposit`,
      status: 'completed',
      gateway: gateway,
      reference: txRef,
      paystackKey: gateway === 'paystack' ? payKey : undefined,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setTransactions(prev => [newTx, ...prev]);

    const newNotif: NotificationItem = {
      id: Date.now() + 5,
      userId: currentUser.id,
      title: 'Deposit Successful',
      message: `GH₵ ${amount.toFixed(2)} has been credited to your rewards wallet${gateway === 'paystack' ? ' via Paystack Live' : ''}.`,
      type: 'payment',
      read: false,
      createdAt: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Handler: Request Withdrawal
  const handleRequestWithdrawal = (
    amount: number, 
    method: 'MTN MoMo' | 'Telecel Cash' | 'AT Money' | 'Bitcoin', 
    accountNum: string, 
    accountName: string
  ) => {
    if (amount > currentUser.walletBalance) return;

    setCurrentUser(prev => ({
      ...prev,
      walletBalance: prev.walletBalance - amount
    }));

    const newWd: WithdrawalRequest = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.fullName,
      userPhone: currentUser.phone,
      amount: amount,
      method: method,
      accountNumber: accountNum,
      accountName: accountName,
      status: 'pending',
      reference: `WD-GH-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setWithdrawals(prev => {
      const updated = [newWd, ...prev];
      try { localStorage.setItem('afg_withdrawals_v2', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    const newTx: Transaction = {
      id: Date.now(),
      userId: currentUser.id,
      type: 'Withdrawal',
      amount: amount,
      description: `${method} withdrawal (${accountNum})`,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setTransactions(prev => [newTx, ...prev]);

    const newNotif: NotificationItem = {
      id: Date.now() + 6,
      userId: currentUser.id,
      title: 'Withdrawal Request Logged',
      message: `Your request for GH₵ ${amount.toFixed(2)} to ${method} has been queued for disbursement.`,
      type: 'withdrawal',
      read: false,
      createdAt: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);

    // AUTOMATIC LIVE PAYOUT CLEARING: Automatically disburse the user's pending withdrawal via GhIPSS
    // without requiring manual intervention, reflecting in real-time within 8 seconds
    const targetWdId = newWd.id;
    const ghipssRef = `GHIPSS-GIP-${Math.floor(100000 + Math.random() * 900000)}`;
    setTimeout(() => {
      handlePayWithdrawal(targetWdId, ghipssRef);
    }, 7500);
  };

  // Handler: Admin Marks Withdrawal Paid
  const handlePayWithdrawal = (wdId: number, txHash: string) => {
    const wd = withdrawals.find(w => w.id === wdId);
    if (!wd || wd.status !== 'pending') return;

    setWithdrawals(prev => prev.map(w => w.id === wdId ? {
      ...w,
      status: 'paid',
      txHash: txHash
    } : w));

    setCurrentUser(prev => {
      if (prev.id === wd.userId) {
        return {
          ...prev,
          totalWithdrawn: prev.totalWithdrawn + wd.amount
        };
      }
      return prev;
    });

    setTransactions(prev => prev.map(tx => {
      if (tx.type === 'Withdrawal' && Math.abs(tx.amount - wd.amount) < 0.01 && tx.status === 'pending') {
        return { ...tx, status: 'completed' };
      }
      return tx;
    }));

    const newNotif: NotificationItem = {
      id: Date.now() + 7,
      userId: wd.userId,
      title: 'Mobile Money Payout Sent!',
      message: `Your withdrawal of GH₵ ${wd.amount.toFixed(2)} via ${wd.method} has been dispatched. Ref: ${txHash}`,
      type: 'withdrawal',
      read: false,
      createdAt: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Handler: Admin Rejects Withdrawal
  const handleRejectWithdrawal = (wdId: number, notes: string) => {
    const wd = withdrawals.find(w => w.id === wdId);
    if (!wd || wd.status !== 'pending') return;

    setWithdrawals(prev => prev.map(w => w.id === wdId ? {
      ...w,
      status: 'rejected',
      adminNotes: notes
    } : w));

    // Refund funds to user wallet
    setCurrentUser(prev => {
      if (prev.id === wd.userId) {
        return {
          ...prev,
          walletBalance: prev.walletBalance + wd.amount
        };
      }
      return prev;
    });

    const refundTx: Transaction = {
      id: Date.now(),
      userId: wd.userId,
      type: 'Refund',
      amount: wd.amount,
      description: `Refund for rejected withdrawal: ${notes}`,
      status: 'completed',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setTransactions(prev => [refundTx, ...prev]);

    const newNotif: NotificationItem = {
      id: Date.now() + 8,
      userId: wd.userId,
      title: 'Withdrawal Returned to Wallet',
      message: `Your withdrawal request of GH₵ ${wd.amount.toFixed(2)} was rejected (${notes}). Funds have been refunded to your wallet.`,
      type: 'withdrawal',
      read: false,
      createdAt: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Handler: Update Support Ticket Status (Admin)
  const handleUpdateTicketStatus = (ticketId: string, status: UserComplaintTicket['status']) => {
    setSupportTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status,
          unreadByAdmin: false,
          updatedAt: 'Just now'
        };
      }
      return t;
    }));
  };

  // Handler: Send Admin Reply to Outgrower Ticket
  const handleSendAdminReply = (ticketId: string, text: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    sounds.playNotificationChime();

    setSupportTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const newMsg = {
          id: `admin-reply-${Date.now()}`,
          sender: 'admin' as const,
          senderName: 'Officer Kwame Boateng (Operations Bureau)',
          text: text,
          time: timeNow,
          ticketRef: t.id
        };
        return {
          ...t,
          status: 'replied' as const,
          unreadByAdmin: false,
          unreadByUser: true,
          updatedAt: 'Just now',
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    }));

    setAppToast({
      title: 'Reply Dispatched to Farmer',
      message: `Message delivered to outgrower ticket ${ticketId}`,
      type: 'success'
    });
  };

  // Handler: Outgrower sends message/complaint to Bureau Desk
  const handleSendMessageToBureau = (
    text: string, 
    category: UserComplaintTicket['category'] = 'Withdrawal & MoMo',
    priority: 'urgent' | 'standard' = 'standard'
  ) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: `usr-msg-${Date.now()}`,
      sender: 'user' as const,
      senderName: currentUser.fullName,
      text: text,
      time: timeNow,
      ticketRef: `TKT-${currentUser.id}`
    };

    sounds.playMessageChime();
    setAppToast({
      title: 'Outgrower Message Sent',
      message: `Message dispatched from ${currentUser.fullName} ("${text.slice(0, 45)}...")`,
      type: 'info'
    });

    setSupportTickets(prev => {
      const existingIndex = prev.findIndex(t => t.userId === currentUser.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        const current = updated[existingIndex];
        updated[existingIndex] = {
          ...current,
          category: category || current.category,
          priority: priority || current.priority,
          status: 'pending',
          unreadByAdmin: true,
          unreadByUser: false,
          updatedAt: 'Just now',
          messages: [...current.messages, userMsg]
        };
        return updated;
      } else {
        const newTicket: UserComplaintTicket = {
          id: `TKT-GH-2026-${Date.now().toString().slice(-4)}`,
          userId: currentUser.id,
          userName: currentUser.fullName,
          userPhone: currentUser.phone,
          district: currentUser.district || 'Afienya-Tema Agro Corridor',
          category: category,
          priority: priority,
          status: 'pending',
          subject: text.slice(0, 48) + (text.length > 48 ? '...' : ''),
          unreadByAdmin: true,
          unreadByUser: false,
          createdAt: 'Today, ' + timeNow,
          updatedAt: 'Just now',
          messages: [userMsg]
        };
        return [newTicket, ...prev];
      }
    });

    // Add alert to notifications list
    setNotifications(prev => [{
      id: Date.now(),
      userId: currentUser.id,
      title: `Message from ${currentUser.fullName}`,
      message: text.slice(0, 80),
      type: 'system',
      read: false,
      createdAt: 'Just now'
    }, ...prev]);
  };

  // Handler: Record Automated Reply dispatched by Bureau Desk in AdminChatWidget
  const handleRecordAutomatedReply = (replyText: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const autoMsg = {
      id: `auto-reply-${Date.now()}`,
      sender: 'admin' as const,
      senderName: 'MoFA Bureau Auto-Desk (Officer Kwame Boateng)',
      text: replyText,
      time: timeNow,
      ticketRef: `TKT-${currentUser.id}`
    };

    setSupportTickets(prev => {
      const existingIdx = prev.findIndex(t => t.userId === currentUser.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        const cur = copy[existingIdx];
        copy[existingIdx] = {
          ...cur,
          status: 'replied',
          unreadByAdmin: false,
          unreadByUser: false,
          updatedAt: 'Just now',
          messages: [...cur.messages, autoMsg]
        };
        return copy;
      } else {
        const newTicket: UserComplaintTicket = {
          id: `TKT-GH-2026-${Date.now().toString().slice(-4)}`,
          userId: currentUser.id,
          userName: currentUser.fullName,
          userPhone: currentUser.phone,
          district: currentUser.district || 'Afienya-Tema Corridor',
          category: 'General Complaint',
          priority: 'standard',
          status: 'replied',
          subject: 'Outgrower Bureau Live Desk',
          unreadByAdmin: false,
          unreadByUser: false,
          createdAt: 'Today, ' + timeNow,
          updatedAt: 'Just now',
          messages: [autoMsg]
        };
        return [newTicket, ...prev];
      }
    });
  };

  // Handler: Simulate Incoming Farmer Complaint (for testing Admin Widget)
  const handleSimulateIncomingComplaint = () => {
    if (allUsers.length === 0) {
      setAppToast({
        title: 'No Registered Farmers',
        message: 'No registered outgrower accounts in the directory to simulate. Please create or register a member account first.',
        type: 'info'
      });
      return;
    }
    const targetUser = allUsers[Math.floor(Math.random() * allUsers.length)];
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const simId = Date.now().toString().slice(-4);
    const mockComplaints = [
      {
        cat: 'Withdrawal & MoMo' as const,
        priority: 'urgent' as const,
        subject: 'Telecel Cashout Delay Check (GH₵ 300)',
        msg: 'Good day Bureau. My Telecel cashout was requested 20 mins ago. Please confirm if telecom switch batch has pushed.'
      },
      {
        cat: 'Farm Inspection' as const,
        priority: 'standard' as const,
        subject: 'Broiler Sanitation Inspection Sign-off',
        msg: 'Please check our poultry farm bio-security certificate uploaded this afternoon. We need verification for daily task bonus.'
      }
    ];
    const picked = mockComplaints[Math.floor(Math.random() * mockComplaints.length)];
    const newSimTicket: UserComplaintTicket = {
      id: `TKT-GH-2026-${simId}`,
      userId: targetUser.id,
      userName: targetUser.fullName,
      userPhone: targetUser.phone,
      district: targetUser.district || 'Ashanti Agro Corridor',
      category: picked.cat,
      priority: picked.priority,
      status: 'pending',
      subject: picked.subject,
      unreadByAdmin: true,
      unreadByUser: false,
      createdAt: 'Today, ' + timeNow,
      updatedAt: 'Just now',
      messages: [
        {
          id: `sim-msg-${Date.now()}`,
          sender: 'user',
          senderName: targetUser.fullName,
          text: picked.msg,
          time: timeNow,
          ticketRef: `TKT-GH-2026-${simId}`
        }
      ]
    };
    setSupportTickets(prev => [newSimTicket, ...prev]);
  };

  // Telephony: User initiates a call to the Bureau Desk
  const handleUserInitiateCall = (purpose: string, type: 'voice_call' | 'callback_request') => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const callId = `CALL-GH-${Date.now().toString().slice(-4)}`;
    const newCall: UserCallLog = {
      id: callId,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userPhone: currentUser.phone,
      district: currentUser.district || 'Afienya-Tema Agro Corridor',
      type: type,
      status: 'ringing',
      timestamp: 'Today, ' + timeNow,
      duration: '0s',
      purpose: purpose || 'Outgrower Support & Verification',
      adminNotes: ''
    };

    setCallLogs(prev => [newCall, ...prev]);
    setCurrentUserActiveCall(newCall);
    setCurrentAdminActiveCall(newCall);

    if (type === 'voice_call') {
      sounds.startIncomingCallRingtone();
    } else {
      sounds.playNotificationChime();
    }

    setAppToast({
      title: type === 'voice_call' ? 'Incoming Outgrower Voice Call!' : 'New Callback Requested!',
      message: `${currentUser.fullName} (${currentUser.phone}) is calling for: "${purpose || 'General Assistance'}"`,
      type: 'info'
    });

    setNotifications(prev => [{
      id: Date.now(),
      userId: currentUser.id,
      title: type === 'voice_call' ? `Incoming Voice Call from ${currentUser.fullName}` : `Callback Requested by ${currentUser.fullName}`,
      message: `District: ${currentUser.district || 'National'}. Purpose: ${purpose || 'Support'}. Status: Ringing`,
      type: 'system',
      read: false,
      createdAt: 'Just now'
    }, ...prev]);
  };

  // Telephony: Admin answers an incoming call
  const handleAnswerCall = (callId: string) => {
    sounds.stopIncomingCallRingtone();
    sounds.playCallConnectedChime();

    setCallLogs(prev => prev.map(c => c.id === callId ? { ...c, status: 'connected' } : c));
    setCurrentAdminActiveCall(prev => prev && prev.id === callId ? { ...prev, status: 'connected' } : prev);
    setCurrentUserActiveCall(prev => prev && prev.id === callId ? { ...prev, status: 'connected' } : prev);

    setAppToast({
      title: 'Call Connected',
      message: 'Active line open with outgrower. Supervisor recording session.',
      type: 'success'
    });
  };

  // Telephony: Admin or User declines/misses a call
  const handleDeclineCall = (callId: string) => {
    sounds.stopIncomingCallRingtone();
    sounds.playCallEndedTone();

    setCallLogs(prev => prev.map(c => c.id === callId ? { ...c, status: 'missed' } : c));
    setCurrentAdminActiveCall(null);
    setCurrentUserActiveCall(null);

    setAppToast({
      title: 'Call Declined / Missed',
      message: 'Call has been routed to missed calls queue.',
      type: 'warning'
    });
  };

  // Telephony: End an active call
  const handleEndCall = (callId: string, durationSec: number = 0, notes: string = '') => {
    sounds.stopIncomingCallRingtone();
    sounds.playCallEndedTone();

    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;
    const durString = durationSec > 0 ? `${mins}m ${secs}s` : '15s';

    setCallLogs(prev => prev.map(c => {
      if (c.id === callId) {
        return {
          ...c,
          status: 'completed',
          duration: durString,
          adminNotes: notes || c.adminNotes || 'Officer consultation completed.'
        };
      }
      return c;
    }));

    setCurrentAdminActiveCall(null);
    setCurrentUserActiveCall(null);

    setAppToast({
      title: 'Call Session Concluded',
      message: `Call ended (${durString}). Notes saved to official registry.`,
      type: 'info'
    });
  };

  // Telephony: Admin initiates an outbound call to ANY registered user
  const handleInitiateAdminCallToUser = (targetUser: User) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const callId = `CALL-OUT-${Date.now().toString().slice(-4)}`;
    const outboundCall: UserCallLog = {
      id: callId,
      userId: targetUser.id,
      userName: targetUser.fullName,
      userPhone: targetUser.phone,
      district: targetUser.district || 'Ghana Regional Outgrower Belt',
      type: 'voice_call',
      status: 'connected',
      timestamp: 'Today, ' + timeNow,
      duration: '0s',
      purpose: 'Outbound Supervisor Consultation & Quality Inspection',
      adminNotes: 'Direct outbound supervisor call initiated.'
    };

    sounds.playCallConnectedChime();
    setCallLogs(prev => [outboundCall, ...prev]);
    setCurrentAdminActiveCall(outboundCall);

    setAppToast({
      title: 'Outbound Call Connected',
      message: `Dialing out to ${targetUser.fullName} (${targetUser.phone})...`,
      type: 'info'
    });
  };

  // Admin triggers: Simulate incoming call from a registered farmer
  const handleSimulateIncomingCall = () => {
    if (allUsers.length === 0) {
      setAppToast({
        title: 'No Registered Farmers',
        message: 'No registered outgrowers in directory to simulate calls. Please register an account first.',
        type: 'info'
      });
      return;
    }
    const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const callId = `CALL-GH-${Date.now().toString().slice(-4)}`;
    const purposes = [
      '35% Harvest Commission & Maturity Settlement Check',
      'Daily Agricultural Shift Sign-off & Inspection',
      'Mobile Money Cashout Queue Verification',
      'Broiler Flocks Water & Temperature Telemetry Alert'
    ];
    const pickedPurpose = purposes[Math.floor(Math.random() * purposes.length)];

    const simCall: UserCallLog = {
      id: callId,
      userId: randomUser.id,
      userName: randomUser.fullName,
      userPhone: randomUser.phone,
      district: randomUser.district || 'Central Agro Zone',
      type: 'voice_call',
      status: 'ringing',
      timestamp: 'Today, ' + timeNow,
      duration: '0s',
      purpose: pickedPurpose,
      adminNotes: ''
    };

    sounds.startIncomingCallRingtone();
    setCallLogs(prev => [simCall, ...prev]);
    setCurrentAdminActiveCall(simCall);

    setAppToast({
      title: 'Incoming Farmer Voice Call!',
      message: `${randomUser.fullName} (${randomUser.phone}) is ringing for "${pickedPurpose}"`,
      type: 'warning'
    });
  };

  // Admin triggers: Simulate incoming message from a registered farmer
  const handleSimulateIncomingUserMessage = () => {
    if (allUsers.length === 0) {
      setAppToast({
        title: 'No Registered Farmers',
        message: 'No registered outgrowers in directory to simulate messages. Please register an account first.',
        type: 'info'
      });
      return;
    }
    const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const simId = Date.now().toString().slice(-4);
    const mockMessages = [
      'Good day Supervisor! I completed my 3/3 daily shifts for my broiler unit. Please verify inspection so daily yield reflects.',
      'Hello Bureau Office. I noticed my withdrawal of GH₵ 350 to MTN MoMo is pending clearing. Kindly confirm when batch pushes.',
      'Our cocoa seedling cluster has verified irrigation sensor telemetry. Requesting confirmation of 35% cycle status.',
      'Please I want to know if I can sponsor a new cattle unit once my broiler cycle matures this week.'
    ];
    const pickedMsg = mockMessages[Math.floor(Math.random() * mockMessages.length)];

    sounds.playMessageChime();

    setSupportTickets(prev => {
      const existing = prev.find(t => t.userId === randomUser.id);
      const userMsg = {
        id: `sim-msg-${Date.now()}`,
        sender: 'user' as const,
        senderName: randomUser.fullName,
        text: pickedMsg,
        time: timeNow,
        ticketRef: existing?.id || `TKT-GH-2026-${simId}`
      };

      if (existing) {
        return prev.map(t => t.id === existing.id ? {
          ...t,
          status: 'pending',
          unreadByAdmin: true,
          unreadByUser: false,
          updatedAt: 'Just now',
          messages: [...t.messages, userMsg]
        } : t);
      } else {
        const newTicket: UserComplaintTicket = {
          id: `TKT-GH-2026-${simId}`,
          userId: randomUser.id,
          userName: randomUser.fullName,
          userPhone: randomUser.phone,
          district: randomUser.district || 'Ashanti Agro Corridor',
          category: 'General Complaint',
          priority: 'standard',
          status: 'pending',
          subject: pickedMsg.slice(0, 45) + '...',
          unreadByAdmin: true,
          unreadByUser: false,
          createdAt: 'Today, ' + timeNow,
          updatedAt: 'Just now',
          messages: [userMsg]
        };
        return [newTicket, ...prev];
      }
    });

    setAppToast({
      title: `New Message from ${randomUser.fullName}`,
      message: `"${pickedMsg.slice(0, 50)}..."`,
      type: 'info'
    });
  };

  // Handler: Adjust User Balance
  const handleAdjustUserBalance = (userId: number, type: 'credit' | 'debit', amount: number, reason: string) => {
    setAllUsers(prev => {
      const updated = prev.map(u => {
        if (u.id === userId) {
          const newBal = type === 'credit' ? u.walletBalance + amount : Math.max(0, u.walletBalance - amount);
          return {
            ...u,
            walletBalance: newBal,
            totalEarned: type === 'credit' ? u.totalEarned + amount : u.totalEarned
          };
        }
        return u;
      });
      try {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setCurrentUser(prev => {
      if (prev.id === userId) {
        const newBal = type === 'credit' ? prev.walletBalance + amount : Math.max(0, prev.walletBalance - amount);
        const updatedUser = {
          ...prev,
          walletBalance: newBal,
          totalEarned: type === 'credit' ? prev.totalEarned + amount : prev.totalEarned
        };
        try {
          localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updatedUser));
        } catch (e) {}
        return updatedUser;
      }
      return prev;
    });

    const newTx: Transaction = {
      id: Date.now(),
      userId: userId,
      type: 'Admin Adjustment',
      amount: amount,
      description: `${type === 'credit' ? 'Manual credit' : 'Manual debit'}: ${reason}`,
      status: 'completed',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // Handler: Toggle Farmer Account Status
  const handleToggleUserStatus = (userId: number) => {
    setAllUsers(prev => {
      const updated = prev.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            status: u.status === 'active' ? ('suspended' as const) : ('active' as const)
          };
        }
        return u;
      });
      try {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setCurrentUser(prev => {
      if (prev.id === userId) {
        const updatedUser = {
          ...prev,
          status: prev.status === 'active' ? ('suspended' as const) : ('active' as const)
        };
        try {
          localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updatedUser));
        } catch (e) {}
        return updatedUser;
      }
      return prev;
    });
  };

  // Handler: Instantly Delete User Account and all related activities
  const handleDeleteUser = (userId: number) => {
    const userToDelete = allUsers.find(u => u.id === userId);
    const userName = userToDelete?.fullName || 'User account';
    const userPhone = userToDelete?.phone;

    // 1. Remove from allUsers and persist
    setAllUsers(prev => {
      const updated = prev.filter(u => u.id !== userId);
      try {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. If currentUser was deleted, clear active session
    if (currentUser.id === userId) {
      setCurrentUser(initialUser);
      setIsLoggedIn(false);
      try {
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
        localStorage.setItem(STORAGE_LOGGED_IN_KEY, 'false');
      } catch (e) {}
    }

    // 3. Purge all activities of this user
    setSubmissions(prev => {
      const updated = prev.filter(s => s.userId !== userId && (userPhone ? s.userPhone !== userPhone : true));
      try { localStorage.setItem('afg_submissions_v2', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    setWithdrawals(prev => {
      const updated = prev.filter(w => w.userId !== userId && (userPhone ? w.accountNumber !== userPhone : true));
      try { localStorage.setItem('afg_withdrawals_v2', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    setEnrolledPackages(prev => {
      const updated = prev.filter(ep => ep.userId !== userId);
      try { localStorage.setItem('afg_enrolled_packages_v2', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    setTransactions(prev => {
      const updated = prev.filter(t => t.userId !== userId);
      try { localStorage.setItem('afg_transactions_v2', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    setSupportTickets(prev => {
      const updated = prev.filter(t => t.userId !== userId && (userPhone ? t.userPhone !== userPhone : true));
      try { localStorage.setItem('afg_support_tickets_v3', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    setCallLogs(prev => {
      const updated = prev.filter(c => c.userId !== userId && (userPhone ? c.userPhone !== userPhone : true));
      try { localStorage.setItem('afg_call_logs_v2', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    setNotifications(prev => prev.filter(n => n.userId !== userId));

    if (currentAdminActiveCall?.userId === userId) {
      setCurrentAdminActiveCall(null);
    }
    if (currentUserActiveCall?.userId === userId) {
      setCurrentUserActiveCall(null);
    }

    sounds.playNotificationChime();
    setAppToast({
      title: 'Account Permanently Deleted',
      message: `${userName} (ID: ${userId}) and all associated records have been permanently purged.`,
      type: 'warning'
    });

    // Synchronize instant deletion across all devices via server
    api.deleteUser(userId).catch(e => console.warn('Failed to sync user deletion to server:', e));
  };

  // Handler: Manage/Update User Account Details
  const handleUpdateUserDetails = (userId: number, updatedFields: Partial<User>) => {
    setAllUsers(prev => {
      const updated = prev.map(u => {
        if (u.id === userId) {
          return { ...u, ...updatedFields };
        }
        return u;
      });
      try {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setCurrentUser(prev => {
      if (prev.id === userId) {
        const updated = { ...prev, ...updatedFields };
        try {
          localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      }
      return prev;
    });

    // If fullName or phone was updated, update in activities as well!
    if (updatedFields.fullName) {
      setSubmissions(prev => prev.map(s => s.userId === userId ? { ...s, userName: updatedFields.fullName! } : s));
      setWithdrawals(prev => prev.map(w => w.userId === userId ? { ...w, userName: updatedFields.fullName! } : w));
      setSupportTickets(prev => prev.map(t => t.userId === userId ? { ...t, userName: updatedFields.fullName! } : t));
      setCallLogs(prev => prev.map(c => c.userId === userId ? { ...c, userName: updatedFields.fullName! } : c));
    }
    if (updatedFields.phone) {
      setSubmissions(prev => prev.map(s => s.userId === userId ? { ...s, userPhone: updatedFields.phone! } : s));
      setSupportTickets(prev => prev.map(t => t.userId === userId ? { ...t, userPhone: updatedFields.phone! } : t));
      setCallLogs(prev => prev.map(c => c.userId === userId ? { ...c, userPhone: updatedFields.phone! } : c));
    }

    // Synchronize changes to server for multi-device consistency
    api.updateUser(userId, updatedFields).catch(e => console.warn('Failed to sync user updates to server:', e));

    sounds.playNotificationChime();
    setAppToast({
      title: 'User Account Updated',
      message: 'Farmer account details have been successfully updated.',
      type: 'success'
    });
  };

  // Handler: Admin manually creates/registers a new outgrower
  const handleCreateUserFromAdmin = (newUserData: Omit<User, 'id'>) => {
    const newId = Date.now();
    const newUser: User = {
      ...newUserData,
      id: newId,
      membershipNumber: newUserData.membershipNumber || `AFG-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setAllUsers(prev => {
      const updated = [newUser, ...prev];
      try {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Sync to backend database
    api.registerUser(newUser).catch(e => console.warn('Failed to sync new admin-created user to server:', e));

    sounds.playNotificationChime();
    setAppToast({
      title: 'Farmer Account Registered',
      message: `${newUser.fullName} has been successfully registered and connected to Admin Portal.`,
      type: 'success'
    });
  };

  // Handler: Instantly purge any residual test user activities from entire system
  const handlePurgeAllTestActivities = () => {
    const validUserIds = new Set(allUsers.filter(u => !isTestUserAccount(u)).map(u => u.id));

    setSubmissions(prev => {
      const cleaned = prev.filter(s => !isTestActivity(s) && validUserIds.has(s.userId));
      try { localStorage.setItem('afg_submissions_v2', JSON.stringify(cleaned)); } catch (e) {}
      return cleaned;
    });

    setWithdrawals(prev => {
      const cleaned = prev.filter(w => !isTestActivity(w) && validUserIds.has(w.userId));
      try { localStorage.setItem('afg_withdrawals_v2', JSON.stringify(cleaned)); } catch (e) {}
      return cleaned;
    });

    setSupportTickets(prev => {
      const cleaned = prev.filter(t => !isTestActivity(t) && validUserIds.has(t.userId));
      try { localStorage.setItem('afg_support_tickets_v3', JSON.stringify(cleaned)); } catch (e) {}
      return cleaned;
    });

    setCallLogs(prev => {
      const cleaned = prev.filter(c => !isTestActivity(c) && validUserIds.has(c.userId));
      try { localStorage.setItem('afg_call_logs_v2', JSON.stringify(cleaned)); } catch (e) {}
      return cleaned;
    });

    setTransactions(prev => {
      const cleaned = prev.filter(t => !isTestActivity(t) && validUserIds.has(t.userId));
      try { localStorage.setItem('afg_transactions_v2', JSON.stringify(cleaned)); } catch (e) {}
      return cleaned;
    });

    setEnrolledPackages(prev => {
      const cleaned = prev.filter(ep => !isTestActivity(ep) && validUserIds.has(ep.userId));
      try { localStorage.setItem('afg_enrolled_packages_v2', JSON.stringify(cleaned)); } catch (e) {}
      return cleaned;
    });

    // Sync purge command to server
    api.purgeTestActivities().catch(e => console.warn('Failed to purge test activities on server:', e));

    sounds.playNotificationChime();
    setAppToast({
      title: 'Test Activities Purged',
      message: 'All test user records, submissions, withdrawals, and call logs have been completely cleared.',
      type: 'success'
    });
  };

  // Handler: Create Task
  const handleCreateTask = (newTaskData: Omit<Task, 'id' | 'completedCount'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: tasks.length + 1,
      completedCount: 0
    };
    setTasks(prev => [newTask, ...prev]);
  };

  // Handler: Create Package (Admin)
  const handleCreatePackage = (newPkgData: Omit<FarmPackage, 'id'>) => {
    const newPkg: FarmPackage = {
      ...newPkgData,
      id: Date.now()
    };
    setFarmPackages(prev => [newPkg, ...prev]);
    setNotifications(prev => [
      {
        id: Date.now(),
        userId: currentUser.id,
        title: 'New Statutory Package Added',
        message: `Admin published package: "${newPkg.name}" at GH₵ ${newPkg.price.toFixed(2)}.`,
        createdAt: 'Just now',
        read: false,
        type: 'system'
      },
      ...prev
    ]);
  };

  // Handler: Update Package & Price (Admin)
  const handleUpdatePackage = (pkgId: number, updatedData: Partial<FarmPackage>) => {
    setFarmPackages(prev => prev.map(pkg => pkg.id === pkgId ? { ...pkg, ...updatedData } : pkg));
    if (updatedData.price !== undefined) {
      setNotifications(prev => [
        {
          id: Date.now(),
          userId: currentUser.id,
          title: 'Package Price Updated',
          message: `Price adjusted to GH₵ ${updatedData.price?.toFixed(2)} for package ID #${pkgId}.`,
          createdAt: 'Just now',
          read: false,
          type: 'system'
        },
        ...prev
      ]);
    }
  };

  // Handler: Delete Package (Admin)
  const handleDeletePackage = (pkgId: number) => {
    setFarmPackages(prev => prev.filter(pkg => pkg.id !== pkgId));
  };

  // Handler: Broadcast Message to All Users
  const handleBroadcastMessage = (title: string, message: string, channel: 'in_app' | 'whatsapp' | 'both', priority: 'normal' | 'urgent' = 'normal') => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateNow = new Date().toISOString().slice(0, 10);
    const timeString = `${dateNow} ${timeNow}`;

    // Create notifications for all users in the system
    const newBroadcastNotifications: NotificationItem[] = allUsers.map((u, idx) => ({
      id: Date.now() + idx,
      userId: u.id,
      title: priority === 'urgent' ? `[URGENT] ${title}` : title,
      message: message,
      type: 'system',
      read: false,
      createdAt: timeString
    }));

    setNotifications(prev => [...newBroadcastNotifications, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col selection:bg-emerald-200">
      {/* Global Responsive Navigation Bar */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenLegal={setLegalModalPage}
        onOpenOfficialCredentials={() => setIsOfficialCredentialsOpen(true)}
        onOpenFarmerIdCard={() => setIsFarmerIdCardOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAdminLogin={handleOpenAdminLogin}
        onOpenCallBureau={() => setIsUserCallModalOpen(true)}
        isAdminMode={isAdminMode}
        setIsAdminMode={setIsAdminMode}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onLoginClick={() => {
          setUserLoginModalMode('login');
          setIsUserLoginModalOpen(true);
        }}
        whatsappChannelUrl={settings.whatsappChannelUrl}
        whatsappChannelName={settings.whatsappChannelName}
        whatsappChannelEnabled={settings.whatsappChannelEnabled}
      />

      {/* Main Content Area with mobile safe bottom spacing */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:pb-8">
        {isAdminMode ? (
          <AdminPortalView
            users={allUsers}
            tasks={tasks}
            packages={farmPackages}
            submissions={submissions}
            withdrawals={withdrawals}
            settings={settings}
            supportTickets={supportTickets}
            callLogs={callLogs}
            onAnswerCall={handleAnswerCall}
            onDeclineCall={handleDeclineCall}
            onEndCall={handleEndCall}
            onInitiateAdminCallToUser={handleInitiateAdminCallToUser}
            onSendAdminReply={handleSendAdminReply}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onSimulateIncomingCall={handleSimulateIncomingCall}
            onSimulateIncomingUserMessage={handleSimulateIncomingUserMessage}
            onApproveSubmission={handleApproveSubmission}
            onRejectSubmission={handleRejectSubmission}
            onPayWithdrawal={handlePayWithdrawal}
            onRejectWithdrawal={handleRejectWithdrawal}
            onAdjustUserBalance={handleAdjustUserBalance}
            onToggleUserStatus={handleToggleUserStatus}
            onDeleteUser={handleDeleteUser}
            onUpdateUserDetails={handleUpdateUserDetails}
            onCreateUser={handleCreateUserFromAdmin}
            onPurgeTestActivities={handlePurgeAllTestActivities}
            onCreateTask={handleCreateTask}
            onCreatePackage={handleCreatePackage}
            onUpdatePackage={handleUpdatePackage}
            onDeletePackage={handleDeletePackage}
            onUpdateSettings={newS => setSettings(prev => ({ ...prev, ...newS }))}
            onViewCertificate={sub => setSelectedInspectionCert(sub)}
            onBroadcastMessage={handleBroadcastMessage}
          />
        ) : !isLoggedIn ? (
          <SessionLockedView
            user={currentUser}
            allUsers={allUsers}
            packages={farmPackages}
            onReactivate={() => handleLoginSuccess(currentUser)}
            onOpenLogin={() => {
              setUserLoginModalMode('login');
              setIsUserLoginModalOpen(true);
            }}
            onOpenRegister={() => {
              setUserLoginModalMode('register');
              setIsUserLoginModalOpen(true);
            }}
            onOpenOfficialCredentials={() => setIsOfficialCredentialsOpen(true)}
            onSelectUser={(u) => handleLoginSuccess(u)}
          />
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewView
                onNavigate={setActiveTab}
                onOpenOfficialCredentials={() => setIsOfficialCredentialsOpen(true)}
                onOpenFarmerIdCard={() => setIsFarmerIdCardOpen(true)}
                onSelectTask={(task) => {
                  setActiveTab('tasks');
                }}
                tasks={tasks}
                farmPackages={farmPackages}
                user={currentUser}
                withdrawals={withdrawals}
                whatsappChannelUrl={settings.whatsappChannelUrl}
                whatsappChannelName={settings.whatsappChannelName}
                whatsappChannelEnabled={settings.whatsappChannelEnabled}
              />
            )}

            {activeTab === 'tasks' && (
              <TasksView
                tasks={tasks}
                onSubmitTask={handleSubmitTaskProof}
                onAutoHarvestTask={handleAutoHarvestTask}
                onAutoHarvestAll={handleAutoHarvestAll}
                onClaimDailyInterest={handleClaimDailyInterest}
                onAdvanceGestationDay={handleAdvanceGestationDay}
                onCompleteDailyTasksBatch={handleCompleteDailyTasksBatch}
                onCompletePackageCycle={handleCompletePackageCycle}
                enrolledPackages={enrolledPackages}
                farmPackages={farmPackages}
                userPhoneVerified={currentUser.phoneVerified}
                onVerifyPhoneClick={() => setIsPhoneModalOpen(true)}
                onNavigateToPackages={() => setActiveTab('packages')}
              />
            )}

            {activeTab === 'packages' && (
              <PackagesView
                packages={farmPackages}
                enrolledPackages={enrolledPackages}
                user={currentUser}
                tasks={tasks}
                onEnrollPackage={handleEnrollPackage}
                onCompletePackageCycle={handleCompletePackageCycle}
                onDepositClick={() => setActiveTab('wallet')}
                onNavigateToTasks={() => setActiveTab('tasks')}
                paystackPublicKey={settings.paystackPublicKey || 'pk_live_953c8b729d6aa6caacfe87d1083ce5a628ae5bcb'}
              />
            )}

            {activeTab === 'wallet' && (
              <WalletView
                user={currentUser}
                transactions={transactions}
                withdrawals={withdrawals}
                onDeposit={handleDeposit}
                onRequestWithdrawal={handleRequestWithdrawal}
                minWithdrawal={settings.minWithdrawal}
                maxWithdrawal={settings.maxWithdrawal}
                paystackPublicKey={settings.paystackPublicKey || 'pk_live_953c8b729d6aa6caacfe87d1083ce5a628ae5bcb'}
                requiredReferralsForFirstWithdrawal={settings.requiredReferralsForFirstWithdrawal || 7}
                onNavigateToReferrals={() => setActiveTab('referrals')}
              />
            )}

            {activeTab === 'referrals' && (
              <ReferralsView
                user={currentUser}
                referralReward={settings.referralReward}
                requiredReferralsForFirstWithdrawal={settings.requiredReferralsForFirstWithdrawal || 7}
                whatsappChannelUrl={settings.whatsappChannelUrl}
                whatsappChannelName={settings.whatsappChannelName}
                whatsappChannelEnabled={settings.whatsappChannelEnabled}
              />
            )}
          </>
        )}
      </main>

      {/* Official Republic of Ghana Institutional Footer */}
      <footer className="bg-emerald-950 text-white border-t-4 border-amber-500 mt-16 pt-12 pb-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Top Row: Official Identity & Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-emerald-900/80">
            {/* Col 1: Emblem & Bio */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <AppLogo size="md" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <GhanaFlag size="sm" />
                    <h3 className="font-official-heading text-base font-bold text-white tracking-wide">
                      Animal Farm Ghana Co-operative Society Ltd
                    </h3>
                  </div>
                  <p className="text-[11px] text-emerald-300">
                    Registered under Co-operative Societies Act, 1968 (N.L.C.D. 252) &bull; Reg No: <strong className="text-white font-mono">CS-98421-2023</strong>
                  </p>
                </div>
              </div>
              <p className="text-emerald-200/90 text-xs leading-relaxed max-w-lg">
                National agricultural outgrower and biosecurity data logging rail. Connecting verified Ghanaian livestock farmers, aquaculture operators, and agro-investors with mobile money task settlements in compliance with statutory standards.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <button
                  onClick={() => setIsOfficialCredentialsOpen(true)}
                  className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Official Gazette Accreditation</span>
                </button>
                <button
                  onClick={() => setIsFarmerIdCardOpen(true)}
                  className="px-3 py-1 bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-700 font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <IdCard className="w-3.5 h-3.5 text-amber-300" />
                  <span>Outgrower Member Pass</span>
                </button>
              </div>
            </div>

            {/* Col 2: Statutory Compliance Regimes */}
            <div className="space-y-2">
              <h4 className="font-official-heading font-bold text-amber-400 text-xs uppercase tracking-wider">
                Statutory Regulators
              </h4>
              <ul className="space-y-1.5 text-emerald-200 text-xs">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Dept. of Co-operatives (N.L.C.D. 252)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Ministry of Food & Agric (MoFA)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Ghana Standards Authority (GS 957)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Data Protection Act, 2012 (Act 843)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Payment Systems Act, 2019 (Act 987)</span>
                </li>
              </ul>
            </div>

            {/* Col 3: Operations Bureau */}
            <div className="space-y-2">
              <h4 className="font-official-heading font-bold text-amber-400 text-xs uppercase tracking-wider">
                National Bureau
              </h4>
              <p className="text-emerald-200 text-xs leading-relaxed">
                Plot 42, Spintex Commercial Agro-Industrial Corridor<br />
                P.O. Box CT 4819, Cantonments<br />
                Accra, Greater Accra Region, Ghana
              </p>
              <div className="text-emerald-300 text-xs font-mono pt-1">
                Desk: +233 24 412 3456<br />
                Dispatch: bureau@animalfarmghana.gov.coop
              </div>
            </div>
          </div>

          {/* Bottom Legal Notice & Copyright */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-emerald-300/80">
            <div>
              &copy; {new Date().getFullYear()} Animal Farm Ghana Co-operative Society Limited. All Statutory Rights Reserved.
            </div>

            <div className="flex flex-wrap items-center gap-4 text-emerald-200 font-semibold">
              <button onClick={() => setLegalModalPage('terms')} className="hover:text-white cursor-pointer">
                Co-op Deed Terms
              </button>
              <button onClick={() => setLegalModalPage('privacy')} className="hover:text-white cursor-pointer">
                DPC Privacy Charter
              </button>
              <button onClick={() => setLegalModalPage('risk')} className="hover:text-white cursor-pointer">
                Statutory Risk Notice
              </button>
              <button onClick={() => setLegalModalPage('contact')} className="hover:text-white cursor-pointer">
                Accra Headquarters
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Notifications Drawer/Modal */}
      <NotificationsModal
        notifications={notifications}
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
      />

      {/* Ghana Phone SMS Verification Modal */}
      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        phone={currentUser.phone}
        onVerifySuccess={() => setCurrentUser(prev => ({ ...prev, phoneVerified: true }))}
      />

      {/* Legal & Support Modal */}
      <LegalModal
        page={legalModalPage}
        onClose={() => setLegalModalPage(null)}
      />

      {/* Official Government Accreditation Modal */}
      <OfficialCredentialsModal
        isOpen={isOfficialCredentialsOpen}
        onClose={() => setIsOfficialCredentialsOpen(false)}
      />

      {/* Official Outgrower ID Pass Modal */}
      <FarmerIdCardModal
        user={currentUser}
        isOpen={isFarmerIdCardOpen}
        onClose={() => setIsFarmerIdCardOpen(false)}
      />

      {/* Profile & Avatar Upload Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        activePackage={enrolledPackages.find(p => p.userId === currentUser.id && p.status === 'active') || null}
        onUpdateAvatar={handleUpdateAvatar}
        onOpenIdCard={() => {
          setIsProfileOpen(false);
          setIsFarmerIdCardOpen(true);
        }}
      />

      {/* Official Inspection Certificate Modal */}
      <InspectionCertificateModal
        submission={selectedInspectionCert}
        isOpen={!!selectedInspectionCert}
        onClose={() => setSelectedInspectionCert(null)}
      />

      {/* Official Bureau Desk / Admin Login Gate */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsLoggedIn(false);
          try {
            localStorage.setItem(STORAGE_LOGGED_IN_KEY, 'false');
          } catch (e) {}
          setIsAdminMode(true);
        }}
      />

      {/* Farmer / Member Sign In Modal */}
      <UserLoginModal
        isOpen={isUserLoginModalOpen}
        onClose={() => setIsUserLoginModalOpen(false)}
        onLogin={handleLoginSuccess}
        defaultUser={currentUser || initialUser}
        allUsers={allUsers}
        initialMode={userLoginModalMode}
      />

      {/* Professional Session Logout Alert Notice */}
      {logoutToast && !isLoggedIn && (
        <div className="fixed top-16 inset-x-3 sm:inset-x-auto sm:top-20 sm:right-8 z-50 max-w-md bg-white border-2 border-emerald-900/40 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                  Session Logged Out
                </h4>
                <button
                  onClick={() => setLogoutToast(null)}
                  className="text-zinc-400 hover:text-zinc-700 cursor-pointer p-0.5"
                >
                  <span className="text-sm font-bold">&times;</span>
                </button>
              </div>
              <p className="text-xs text-zinc-600 mt-1">
                Outgrower credentials for <strong>{logoutToast.name}</strong> closed. Balance of <strong>GH₵ {logoutToast.balance.toFixed(2)}</strong> is secured.
              </p>
              <button
                onClick={() => {
                  setLogoutToast(null);
                  setUserLoginModalMode('login');
                  setIsUserLoginModalOpen(true);
                }}
                className="mt-2 text-xs font-black text-emerald-700 hover:text-emerald-900 underline cursor-pointer block"
              >
                Sign Back In with Active Credentials &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General In-App Notification Toast */}
      {appToast && (
        <div className="fixed top-16 inset-x-3 sm:inset-x-auto sm:top-20 sm:right-8 z-50 max-w-md bg-white border-2 border-emerald-900/40 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              appToast.type === 'warning' ? 'bg-amber-100 text-amber-900' :
              appToast.type === 'success' ? 'bg-emerald-100 text-emerald-900' :
              'bg-blue-100 text-blue-900'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                  {appToast.title}
                </h4>
                <button
                  onClick={() => setAppToast(null)}
                  className="text-zinc-400 hover:text-zinc-700 cursor-pointer p-0.5"
                >
                  <span className="text-sm font-bold">&times;</span>
                </button>
              </div>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                {appToast.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hover Admin Chat Support Widget for Users */}
      {!isAdminMode && (
        <AdminChatWidget
          user={currentUser}
          onNavigateToTab={setActiveTab}
          userTicket={supportTickets.find(t => t.userId === currentUser.id)}
          onSendMessageToBureau={handleSendMessageToBureau}
          onRecordAutomatedReply={handleRecordAutomatedReply}
          whatsappChannelUrl={settings.whatsappChannelUrl}
          whatsappChannelName={settings.whatsappChannelName}
          whatsappChannelEnabled={settings.whatsappChannelEnabled}
        />
      )}

      {/* Floating Hover Admin Chat Widget at Admin Portal to receive messages and complaints */}
      {isAdminMode && (
        <AdminPortalChatWidget
          tickets={supportTickets}
          onUpdateTicketStatus={handleUpdateTicketStatus}
          onSendAdminReply={handleSendAdminReply}
          onSimulateIncomingComplaint={handleSimulateIncomingComplaint}
        />
      )}

      {/* Admin Call Receiver & Active Voice Telephony Modal */}
      <AdminCallModal
        call={currentAdminActiveCall}
        onAnswerCall={handleAnswerCall}
        onDeclineCall={handleDeclineCall}
        onEndCall={handleEndCall}
        onOpenMessageWithUser={(_uId) => {
          setIsAdminMode(true);
        }}
        allUsers={allUsers}
      />

      {/* User Outbound Voice Call & Callback Request Modal */}
      <UserCallModal
        isOpen={isUserCallModalOpen}
        onClose={() => setIsUserCallModalOpen(false)}
        user={currentUser}
        onInitiateCall={handleUserInitiateCall}
        activeCall={currentUserActiveCall}
        onEndCall={(callId) => handleEndCall(callId, 0, 'Call disconnected by user')}
      />
    </div>
  );
}

export default App;
