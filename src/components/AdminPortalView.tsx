// src/components/AdminPortalView.tsx - Operations & Administrator Control Center
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Task, 
  FarmPackage,
  TaskSubmission, 
  WithdrawalRequest, 
  SystemSettings,
  TaskCategory,
  ProofType,
  UserComplaintTicket,
  UserCallLog
} from '../types';
import { isTestUserAccount } from '../utils/userUtils';
import { 
  ShieldCheck, 
  Users, 
  CheckSquare, 
  Wallet, 
  Sliders, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Plus, 
  Building2, 
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  Save,
  FileCheck,
  Check,
  X,
  Layers,
  Edit2,
  Trash2,
  Tag,
  LayoutDashboard,
  ArrowDownCircle,
  Percent,
  Sparkles,
  TrendingUp,
  Eye,
  EyeOff,
  Radio,
  Send,
  MessageSquare,
  Volume2,
  Share2,
  Headphones,
  PhoneCall,
  Phone,
  PhoneOff,
  Mic,
  UserCheck,
  MessageCircle,
  ArrowRight,
  MapPin
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import { GhanaFlag } from './GhanaFlag';

interface AdminPortalViewProps {
  users: User[];
  tasks: Task[];
  packages: FarmPackage[];
  submissions: TaskSubmission[];
  withdrawals: WithdrawalRequest[];
  settings: SystemSettings;
  supportTickets?: UserComplaintTicket[];
  callLogs?: UserCallLog[];
  onAnswerCall?: (callId: string) => void;
  onDeclineCall?: (callId: string) => void;
  onEndCall?: (callId: string, durationSec: number, notes: string) => void;
  onInitiateAdminCallToUser?: (user: User) => void;
  onSendAdminReply?: (ticketId: string, text: string) => void;
  onUpdateTicketStatus?: (ticketId: string, status: UserComplaintTicket['status']) => void;
  onSimulateIncomingCall?: () => void;
  onSimulateIncomingUserMessage?: () => void;
  onApproveSubmission: (subId: number, notes: string) => void;
  onRejectSubmission: (subId: number, notes: string) => void;
  onPayWithdrawal: (wdId: number, txHash: string) => void;
  onRejectWithdrawal: (wdId: number, notes: string) => void;
  onAdjustUserBalance: (userId: number, type: 'credit' | 'debit', amount: number, reason: string) => void;
  onToggleUserStatus: (userId: number) => void;
  onDeleteUser: (userId: number) => void;
  onUpdateUserDetails: (userId: number, updatedFields: Partial<User>) => void;
  onCreateUser?: (newUser: Omit<User, 'id'>) => void;
  onPurgeTestActivities?: () => void;
  onCreateTask: (newTask: Omit<Task, 'id' | 'completedCount'>) => void;
  onCreatePackage: (newPackage: Omit<FarmPackage, 'id'>) => void;
  onUpdatePackage: (packageId: number, updatedPackage: Partial<FarmPackage>) => void;
  onDeletePackage: (packageId: number) => void;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => void;
  onViewCertificate?: (submission: TaskSubmission) => void;
  onBroadcastMessage?: (title: string, message: string, channel: 'in_app' | 'whatsapp' | 'both', priority?: 'normal' | 'urgent') => void;
}

type AdminTab = 'overview' | 'comms' | 'submissions' | 'withdrawals' | 'users' | 'tasks' | 'packages' | 'broadcast' | 'settings';

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  users,
  tasks,
  packages,
  submissions,
  withdrawals,
  settings,
  supportTickets = [],
  callLogs = [],
  onAnswerCall,
  onDeclineCall,
  onEndCall,
  onInitiateAdminCallToUser,
  onSendAdminReply,
  onUpdateTicketStatus,
  onSimulateIncomingCall,
  onSimulateIncomingUserMessage,
  onApproveSubmission,
  onRejectSubmission,
  onPayWithdrawal,
  onRejectWithdrawal,
  onAdjustUserBalance,
  onToggleUserStatus,
  onDeleteUser,
  onUpdateUserDetails,
  onCreateUser,
  onPurgeTestActivities,
  onCreateTask,
  onCreatePackage,
  onUpdatePackage,
  onDeletePackage,
  onUpdateSettings,
  onViewCertificate,
  onBroadcastMessage
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');

  // Communications Desk State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [adminReplyInput, setAdminReplyInput] = useState('');
  const [commsUserSearch, setCommsUserSearch] = useState('');
  const [commsSubTab, setCommsSubTab] = useState<'all' | 'calls' | 'messages' | 'directory'>('all');

  // Submissions review state
  const [reviewModalSub, setReviewModalSub] = useState<TaskSubmission | null>(null);
  const [adminNote, setAdminNote] = useState('');

  // Withdrawal action state
  const [payoutModalWd, setPayoutModalWd] = useState<WithdrawalRequest | null>(null);
  const [txHashInput, setTxHashInput] = useState('');
  const [rejectWdNote, setRejectWdNote] = useState('');

  // Balance adjust modal
  const [adjustModalUser, setAdjustModalUser] = useState<User | null>(null);
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState('20');
  const [adjustReason, setAdjustReason] = useState('Manual verification bonus');

  // User Management & Deletion Modal State
  const [manageModalUser, setManageModalUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended' | 'verified'>('all');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newFarmerData, setNewFarmerData] = useState({
    fullName: '',
    phone: '',
    email: '',
    ghanaCardPin: '',
    district: 'Afienya-Tema Agricultural Corridor',
    agriculturalFocus: 'Poultry Farming',
    walletBalance: 0,
    password: 'ghanafarm123',
    status: 'active' as 'active' | 'suspended',
    phoneVerified: true,
    emailVerified: false
  });

  const [editFormData, setEditFormData] = useState<{
    fullName: string;
    phone: string;
    email: string;
    ghanaCardPin: string;
    district: string;
    agriculturalFocus: string;
    password?: string;
    status: 'active' | 'suspended' | 'pending';
    walletBalance: number;
    phoneVerified: boolean;
    emailVerified: boolean;
  }>({
    fullName: '',
    phone: '',
    email: '',
    ghanaCardPin: '',
    district: '',
    agriculturalFocus: '',
    password: '',
    status: 'active',
    walletBalance: 0,
    phoneVerified: false,
    emailVerified: false
  });

  useEffect(() => {
    if (manageModalUser) {
      setEditFormData({
        fullName: manageModalUser.fullName || '',
        phone: manageModalUser.phone || '',
        email: manageModalUser.email || '',
        ghanaCardPin: manageModalUser.ghanaCardPin || '',
        district: manageModalUser.district || '',
        agriculturalFocus: manageModalUser.agriculturalFocus || '',
        password: manageModalUser.password || '',
        status: manageModalUser.status || 'active',
        walletBalance: manageModalUser.walletBalance || 0,
        phoneVerified: !!manageModalUser.phoneVerified,
        emailVerified: !!manageModalUser.emailVerified
      });
    }
  }, [manageModalUser]);

  const handleSaveUserManage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manageModalUser) return;
    onUpdateUserDetails(manageModalUser.id, {
      fullName: editFormData.fullName.trim(),
      phone: editFormData.phone.trim(),
      email: editFormData.email.trim(),
      ghanaCardPin: editFormData.ghanaCardPin.trim(),
      district: editFormData.district.trim(),
      agriculturalFocus: editFormData.agriculturalFocus.trim(),
      password: editFormData.password?.trim() || undefined,
      status: editFormData.status,
      walletBalance: Number(editFormData.walletBalance) || 0,
      phoneVerified: editFormData.phoneVerified,
      emailVerified: editFormData.emailVerified
    });
    setManageModalUser(null);
  };

  const handleConfirmDeleteUser = () => {
    if (!deleteConfirmUser) return;
    onDeleteUser(deleteConfirmUser.id);
    if (manageModalUser?.id === deleteConfirmUser.id) {
      setManageModalUser(null);
    }
    setDeleteConfirmUser(null);
  };

  const handleCreateFarmerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmerData.fullName.trim() || !newFarmerData.phone.trim()) return;
    onCreateUser?.({
      fullName: newFarmerData.fullName.trim(),
      phone: newFarmerData.phone.trim(),
      email: newFarmerData.email.trim() || `${newFarmerData.phone.trim()}@outgrower.farmgh.gov`,
      ghanaCardPin: newFarmerData.ghanaCardPin.trim() || `GHA-${Math.floor(100000000 + Math.random() * 900000000)}-${Math.floor(Math.random() * 9)}`,
      district: newFarmerData.district.trim(),
      agriculturalFocus: newFarmerData.agriculturalFocus.trim(),
      walletBalance: Number(newFarmerData.walletBalance) || 0,
      pendingRewards: 0,
      totalEarned: Number(newFarmerData.walletBalance) || 0,
      totalWithdrawn: 0,
      referralCode: `AFG${newFarmerData.fullName.slice(0, 3).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
      referredById: null,
      phoneVerified: newFarmerData.phoneVerified,
      emailVerified: newFarmerData.emailVerified,
      membershipNumber: `AFG-MEM-${Date.now().toString().slice(-6)}`,
      status: newFarmerData.status,
      password: newFarmerData.password || 'ghanafarm123',
      createdAt: new Date().toISOString().split('T')[0]
    });
    setShowCreateUserModal(false);
    setNewFarmerData({
      fullName: '',
      phone: '',
      email: '',
      ghanaCardPin: '',
      district: 'Afienya-Tema Agricultural Corridor',
      agriculturalFocus: 'Poultry Farming',
      walletBalance: 0,
      password: 'ghanafarm123',
      status: 'active',
      phoneVerified: true,
      emailVerified: false
    });
  };

  const realUsers = users.filter(u => !isTestUserAccount(u));

  const filteredUsers = realUsers.filter(u => {
    if (userStatusFilter === 'active' && u.status !== 'active') return false;
    if (userStatusFilter === 'suspended' && u.status !== 'suspended') return false;
    if (userStatusFilter === 'verified' && !u.phoneVerified && !u.emailVerified) return false;
    if (!userSearchTerm.trim()) return true;
    const term = userSearchTerm.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(term) ||
      u.phone.includes(term) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.district && u.district.toLowerCase().includes(term)) ||
      (u.ghanaCardPin && u.ghanaCardPin.toLowerCase().includes(term)) ||
      (u.membershipNumber && u.membershipNumber.toLowerCase().includes(term))
    );
  });

  // Create task modal
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('Poultry');
  const [newTaskReward, setNewTaskReward] = useState('15.00');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskInst, setNewTaskInst] = useState('');
  const [newTaskProofType, setNewTaskProofType] = useState<ProofType>('both');
  const [newTaskTime, setNewTaskTime] = useState('15 mins');
  const [newTaskMax, setNewTaskMax] = useState('100');

  // Package Management State
  const [packageCategoryFilter, setPackageCategoryFilter] = useState<string>('All');
  const [packageSearchQuery, setPackageSearchQuery] = useState('');
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const [editingPackage, setEditingPackage] = useState<FarmPackage | null>(null);

  // Form fields for Create / Edit Package
  const [pkgName, setPkgName] = useState('');
  const [pkgUnitCode, setPkgUnitCode] = useState('');
  const [pkgCategory, setPkgCategory] = useState<TaskCategory>('Poultry');
  const [pkgCluster, setPkgCluster] = useState('Afienya-Tema Agricultural Corridor');
  const [pkgZone, setPkgZone] = useState('Greater Accra Agro-Ecological Region');
  const [pkgDeedRef, setPkgDeedRef] = useState('');
  const [pkgPrice, setPkgPrice] = useState('350');
  const [pkgDuration, setPkgDuration] = useState('45');
  const [pkgDesc, setPkgDesc] = useState('');
  const [pkgTerms, setPkgTerms] = useState('');
  const [pkgImage, setPkgImage] = useState('https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80');
  const [pkgStatus, setPkgStatus] = useState<'active' | 'inactive'>('active');

  // Quick Price Edit Modal State
  const [quickPricePkg, setQuickPricePkg] = useState<FarmPackage | null>(null);
  const [quickPriceVal, setQuickPriceVal] = useState('');
  const [quickPriceError, setQuickPriceError] = useState<string | null>(null);

  // Error & Confirmation Modals
  const [reviewModalError, setReviewModalError] = useState<string | null>(null);
  const [payoutModalError, setPayoutModalError] = useState<string | null>(null);
  const [pkgFormError, setPkgFormError] = useState<string | null>(null);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);
  const [deletePackageConfirm, setDeletePackageConfirm] = useState<FarmPackage | null>(null);

  // Settings form state
  const [formSettings, setFormSettings] = useState<SystemSettings>(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [showPaystackKey, setShowPaystackKey] = useState(false);

  useEffect(() => {
    setFormSettings(settings);
  }, [settings]);

  // Broadcast Message State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastChannel, setBroadcastChannel] = useState<'in_app' | 'whatsapp' | 'both'>('both');
  const [broadcastPriority, setBroadcastPriority] = useState<'normal' | 'urgent'>('normal');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [broadcastLogs, setBroadcastLogs] = useState<Array<{
    id: string;
    title: string;
    message: string;
    channel: 'in_app' | 'whatsapp' | 'both';
    priority: 'normal' | 'urgent';
    sentAt: string;
    recipientCount: number;
  }>>([
    {
      id: 'bc-1',
      title: 'Scheduled MoMo Batch Settlement Window Open',
      message: 'Notice to all outgrowers: Daily 10-second automatic clearing switch for MTN MoMo & Telecel Cash is operational. All verified shift logs have been processed.',
      channel: 'both',
      priority: 'normal',
      sentAt: 'Today, 08:30 AM',
      recipientCount: realUsers.length
    },
    {
      id: 'bc-2',
      title: 'New Commercial Agro-Package Unit Launched',
      message: 'The Volta Basin Deep-Water Tilapia Spawning & Cocoa Agroforestry units are now open for outgrower sponsorship. Accrue 35% statutory commission upon maturity.',
      channel: 'in_app',
      priority: 'normal',
      sentAt: 'Yesterday, 02:15 PM',
      recipientCount: realUsers.length
    }
  ]);

  // Aggregated KPI counts
  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const totalPendingWdAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const totalPaidWdAmount = withdrawals.filter(w => w.status === 'paid').reduce((sum, w) => sum + w.amount, 0);

  // Handlers
  const handleApprove = (sub: TaskSubmission) => {
    setReviewModalError(null);
    onApproveSubmission(sub.id, adminNote || 'Field proof verified by supervisor');
    setReviewModalSub(null);
    setAdminNote('');
  };

  const handleReject = (sub: TaskSubmission) => {
    if (!adminNote.trim()) {
      setReviewModalError('Please enter a rejection reason note for the farmer.');
      return;
    }
    setReviewModalError(null);
    onRejectSubmission(sub.id, adminNote);
    setReviewModalSub(null);
    setAdminNote('');
  };

  const handleConfirmPaid = (wd: WithdrawalRequest) => {
    setPayoutModalError(null);
    onPayWithdrawal(wd.id, txHashInput || `MOMO${Date.now()}`);
    setPayoutModalWd(null);
    setTxHashInput('');
  };

  const handleConfirmRejectWd = (wd: WithdrawalRequest) => {
    if (!rejectWdNote.trim()) {
      setPayoutModalError('Please specify a rejection reason.');
      return;
    }
    setPayoutModalError(null);
    onRejectWithdrawal(wd.id, rejectWdNote);
    setPayoutModalWd(null);
    setRejectWdNote('');
  };

  const handleBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalUser) return;
    const amt = parseFloat(adjustAmount);
    if (isNaN(amt) || amt <= 0) return;

    onAdjustUserBalance(adjustModalUser.id, adjustType, amt, adjustReason);
    setAdjustModalUser(null);
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rwd = parseFloat(newTaskReward);
    const maxC = parseInt(newTaskMax, 10);
    if (!newTaskTitle || isNaN(rwd)) return;

    onCreateTask({
      title: newTaskTitle,
      protocolCode: `MOFA-AFG-${newTaskCategory.toUpperCase().slice(0, 4)}-${Math.floor(10 + Math.random() * 90)}`,
      regulatoryStandard: 'GSA GS 957:2019 Agricultural Standard Protocol',
      priorityLevel: 'Standard',
      category: newTaskCategory,
      reward: rwd,
      description: newTaskDesc,
      instructions: newTaskInst,
      proofType: newTaskProofType,
      estimatedTime: newTaskTime,
      maxCompletions: maxC || 100,
      status: 'active'
    });

    setShowCreateTask(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskInst('');
  };

  // Package CRUD Handlers
  const handleOpenCreatePackage = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setPkgName('');
    setPkgUnitCode(`GH-UNIT-PLT-2025/${randomSuffix}`);
    setPkgCategory('Poultry');
    setPkgCluster('Afienya-Tema Agricultural Corridor');
    setPkgZone('Greater Accra Agro-Ecological Region');
    setPkgDeedRef(`DEED-AFG-2025-AGRO-${randomSuffix}`);
    setPkgPrice('350.00');
    setPkgDuration('45');
    setPkgDesc('Funds high-efficiency broiler chicks, starter crumbles, and Newcastle veterinary vaccination.');
    setPkgTerms('Track weekly growth curve. Harvest proceeds allocated upon completion of production cycle.');
    setPkgImage('https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80');
    setPkgStatus('active');
    setShowCreatePackage(true);
  };

  const handleOpenEditPackage = (pkg: FarmPackage) => {
    setEditingPackage(pkg);
    setPkgName(pkg.name);
    setPkgUnitCode(pkg.statutoryUnitCode);
    setPkgCategory(pkg.category);
    setPkgCluster(pkg.cooperativeCluster);
    setPkgZone(pkg.productionZone);
    setPkgDeedRef(pkg.deedAgreementRef);
    setPkgPrice(pkg.price.toString());
    setPkgDuration(pkg.durationDays.toString());
    setPkgDesc(pkg.description);
    setPkgTerms(pkg.terms);
    setPkgImage(pkg.image);
    setPkgStatus(pkg.status);
  };

  const handleOpenQuickPrice = (pkg: FarmPackage) => {
    setQuickPricePkg(pkg);
    setQuickPriceVal(pkg.price.toFixed(2));
  };

  const handleCreatePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPkgFormError(null);
    const priceNum = parseFloat(pkgPrice);
    const durationNum = parseInt(pkgDuration, 10);
    if (!pkgName.trim() || isNaN(priceNum) || priceNum <= 0) {
      setPkgFormError('Please provide a valid package title and positive price.');
      return;
    }

    onCreatePackage({
      statutoryUnitCode: pkgUnitCode.trim() || `GH-UNIT-2025-${Date.now().toString().slice(-4)}`,
      name: pkgName.trim(),
      category: pkgCategory,
      cooperativeCluster: pkgCluster.trim() || 'National Agricultural Outgrower Belt',
      productionZone: pkgZone.trim() || 'Ghana Agro-Ecological Corridor',
      deedAgreementRef: pkgDeedRef.trim() || `DEED-AFG-2025-${Date.now().toString().slice(-4)}`,
      price: priceNum,
      durationDays: durationNum || 20,
      description: pkgDesc.trim(),
      terms: pkgTerms.trim() || 'Standard Co-operative Outgrower Deed Agreement.',
      image: pkgImage.trim() || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80',
      status: pkgStatus
    });

    setShowCreatePackage(false);
  };

  const handleEditPackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    setPkgFormError(null);
    const priceNum = parseFloat(pkgPrice);
    const durationNum = parseInt(pkgDuration, 10);
    if (!pkgName.trim() || isNaN(priceNum) || priceNum <= 0) {
      setPkgFormError('Please provide a valid package title and positive price.');
      return;
    }

    onUpdatePackage(editingPackage.id, {
      statutoryUnitCode: pkgUnitCode.trim(),
      name: pkgName.trim(),
      category: pkgCategory,
      cooperativeCluster: pkgCluster.trim(),
      productionZone: pkgZone.trim(),
      deedAgreementRef: pkgDeedRef.trim(),
      price: priceNum,
      durationDays: durationNum || 20,
      description: pkgDesc.trim(),
      terms: pkgTerms.trim(),
      image: pkgImage.trim(),
      status: pkgStatus
    });

    setEditingPackage(null);
  };

  const handleQuickPriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPricePkg) return;
    setQuickPriceError(null);
    const priceNum = parseFloat(quickPriceVal);
    if (isNaN(priceNum) || priceNum <= 0) {
      setQuickPriceError('Please provide a valid positive price in Ghana Cedis (GH₵).');
      return;
    }

    onUpdatePackage(quickPricePkg.id, {
      price: priceNum
    });

    setQuickPricePkg(null);
  };

  const handleDeletePackageConfirm = (pkg: FarmPackage) => {
    setDeletePackageConfirm(pkg);
  };

  const handleTogglePackageStatus = (pkg: FarmPackage) => {
    onUpdatePackage(pkg.id, {
      status: pkg.status === 'active' ? 'inactive' : 'active'
    });
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Restyled Executive Admin Header */}
      <div className="bg-gradient-to-r from-slate-950 via-zinc-900 to-emerald-950 text-white rounded-3xl p-6 shadow-md border border-emerald-900/40 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-1.5 bg-zinc-900/80 rounded-2xl border border-zinc-700/60 shadow-inner">
              <AppLogo size="lg" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Statutory Bureau Desk
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">MoFA / GSA GS 957:2019</span>
                <GhanaFlag size="sm" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                Platform Operations & Agricultural Registry
              </h2>
              <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed mt-0.5">
                Manage farm outgrower units, automate gestation interest, audit 35% commission yields, and process verified Mobile Money settlements.
              </p>
            </div>
          </div>

          {/* Quick status indicators */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700/50 text-center">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Co-op Members</span>
              <span className="text-sm font-black text-emerald-400 font-mono">{realUsers.length}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700/50 text-center">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Commission Rate</span>
              <span className="text-sm font-black text-amber-300 font-mono">35% Fixed</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700/50 text-center">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">MoMo Queue</span>
              <span className={`text-sm font-black font-mono ${pendingWithdrawals.length > 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
                {pendingWithdrawals.length}
              </span>
            </div>
          </div>
        </div>

        {/* Tab switcher buttons with clean pill design */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto pb-1.5 max-w-full mobile-topbar-scroll">
          <button
            onClick={() => setCurrentTab('overview')}
            className={`tap-bounce px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              currentTab === 'overview' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentTab('comms')}
            className={`tap-bounce px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              currentTab === 'comms' 
                ? 'bg-amber-400 text-emerald-950 font-black shadow-xs ring-2 ring-amber-300' 
                : 'text-amber-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-amber-400" />
            <span>Calls & Messages Desk</span>
            {(supportTickets.filter(t => t.unreadByAdmin).length > 0 || callLogs.filter(c => c.status === 'ringing').length > 0) && (
              <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[10px] rounded-full font-black animate-pulse">
                {supportTickets.filter(t => t.unreadByAdmin).length + callLogs.filter(c => c.status === 'ringing').length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setCurrentTab('submissions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              currentTab === 'submissions' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Proof Submissions</span>
            {pendingSubmissions.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-zinc-950 text-[10px] rounded-full font-black">
                {pendingSubmissions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('withdrawals')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              currentTab === 'withdrawals' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span>Withdrawals (GH₵ 50 - 1,000)</span>
            {pendingWithdrawals.length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-black">
                {pendingWithdrawals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              currentTab === 'users' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Farmers Directory</span>
          </button>

          <button
            onClick={() => setCurrentTab('tasks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              currentTab === 'tasks' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Gestation Tasks</span>
          </button>

          <button
            onClick={() => setCurrentTab('packages')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              currentTab === 'packages' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Packages & Pricing</span>
            <span className="px-1.5 py-0.2 bg-amber-400 text-zinc-950 text-[10px] rounded-full font-mono font-black">
              {packages.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('broadcast')}
            className={`tap-bounce px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              currentTab === 'broadcast' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>Message Broadcast</span>
            <span className="px-1.5 py-0.2 bg-amber-400 text-zinc-950 text-[10px] rounded-full font-bold">
              All Users
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              currentTab === 'settings' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Gateways & WhatsApp</span>
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW TAB */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-xs">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Pending Task Proofs</span>
              <div className="text-3xl font-black text-amber-700 mt-2">{pendingSubmissions.length}</div>
              <button 
                onClick={() => setCurrentTab('submissions')}
                className="text-xs text-amber-800 font-bold hover:underline mt-1 block"
              >
                Inspect Proof Queue &rarr;
              </button>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-xs">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Pending MoMo Payouts</span>
              <div className="text-3xl font-black text-rose-700 mt-2">GH₵ {totalPendingWdAmount.toFixed(2)}</div>
              <button 
                onClick={() => setCurrentTab('withdrawals')}
                className="text-xs text-rose-800 font-bold hover:underline mt-1 block"
              >
                Disburse {pendingWithdrawals.length} Requests &rarr;
              </button>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-xs">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Disbursed</span>
              <div className="text-3xl font-black text-emerald-700 mt-2">GH₵ {totalPaidWdAmount.toFixed(2)}</div>
              <span className="text-xs text-zinc-400 mt-1 block">Telecom mobile money settled</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Registered Farmers</span>
                <div className="text-3xl font-black text-zinc-900 mt-2">{realUsers.length}</div>
                <span className="text-xs text-emerald-700 font-semibold mt-1 block">Phone OTP Verified</span>
              </div>
              <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                <button 
                  onClick={() => setCurrentTab('users')}
                  className="text-xs text-emerald-800 font-bold hover:underline"
                >
                  Manage Outgrowers &rarr;
                </button>
                {onPurgeTestActivities && (
                  <button
                    onClick={onPurgeTestActivities}
                    className="text-[11px] text-zinc-500 hover:text-rose-700 flex items-center gap-1 font-bold transition-colors cursor-pointer"
                    title="Clean any test user records"
                  >
                    <Trash2 className="w-3 h-3 text-rose-500" />
                    <span>Purge Test Records</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Review Queues */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Submissions Quick Card */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-base text-zinc-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-amber-600" />
                  Field Proofs Awaiting Review ({pendingSubmissions.length})
                </h3>
                <button 
                  onClick={() => setCurrentTab('submissions')}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  View All
                </button>
              </div>

              {pendingSubmissions.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All submitted task proofs have been reviewed!
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingSubmissions.slice(0, 3).map(sub => (
                    <div key={sub.id} className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs flex justify-between items-center">
                      <div>
                        <div className="font-bold text-zinc-900">{sub.taskTitle}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          Farmer: <strong>{sub.userName}</strong> ({sub.userPhone})
                        </div>
                      </div>
                      <button
                        onClick={() => { setReviewModalSub(sub); }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Inspect Proof (GH₵ {sub.rewardAmount.toFixed(2)})
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Withdrawals Quick Card */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-base text-zinc-900 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-rose-600" />
                  Mobile Money Payout Queue ({pendingWithdrawals.length})
                </h3>
                <button 
                  onClick={() => setCurrentTab('withdrawals')}
                  className="text-xs font-bold text-rose-700 hover:underline"
                >
                  Process Queue
                </button>
              </div>

              {pendingWithdrawals.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  No pending withdrawal requests.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingWithdrawals.slice(0, 3).map(wd => (
                    <div key={wd.id} className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs flex justify-between items-center">
                      <div>
                        <div className="font-black text-zinc-900">GH₵ {wd.amount.toFixed(2)}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {wd.method} &bull; {wd.accountNumber} ({wd.accountName})
                        </div>
                      </div>
                      <button
                        onClick={() => setPayoutModalWd(wd)}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Process Payout
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. COMMUNICATIONS & CALL DESK TAB */}
      {currentTab === 'comms' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-zinc-950 text-white rounded-3xl p-6 border-2 border-amber-500 shadow-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <GhanaFlag size="sm" />
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-official-heading">
                    National Outgrower Telephony & Dispatch Rail
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-official-serif text-white flex items-center gap-2">
                  <Headphones className="w-6 h-6 text-amber-400 shrink-0" />
                  <span>Outgrower Communications & Call Dispatch Desk</span>
                </h2>
                <p className="text-xs text-emerald-200/90 max-w-2xl leading-relaxed">
                  Real-time centralized telephony and messaging switch. Receive incoming voice calls, return callbacks, and resolve message tickets with all {realUsers.length} registered Ghanaian farmers under statutory MoFA supervision.
                </p>
              </div>

              {/* Status and Simulation Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {onSimulateIncomingCall && (
                  <button
                    type="button"
                    onClick={onSimulateIncomingCall}
                    className="tap-bounce px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-amber-300 border border-emerald-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="Simulate incoming call from an active farmer to test alert chime and receiver"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                    <span>Test Inbound Call</span>
                  </button>
                )}

                {onSimulateIncomingUserMessage && (
                  <button
                    type="button"
                    onClick={onSimulateIncomingUserMessage}
                    className="tap-bounce px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="Simulate new message from an active outgrower"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                    <span>Test Inbound Message</span>
                  </button>
                )}

                <div className="px-3 py-1.5 bg-emerald-950/80 rounded-xl border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono font-bold text-[11px]">GhIPSS Switch: ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Sub-navigation Filter Bar */}
            <div className="flex items-center gap-2 pt-6 mt-6 border-t border-emerald-900/60 overflow-x-auto custom-scrollbar">
              <button
                type="button"
                onClick={() => setCommsSubTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  commsSubTab === 'all' 
                    ? 'bg-amber-400 text-emerald-950 font-black shadow-xs' 
                    : 'bg-emerald-900/70 text-emerald-200 hover:bg-emerald-800 border border-emerald-700/60'
                }`}
              >
                <span>Overview & All Logs</span>
              </button>

              <button
                type="button"
                onClick={() => setCommsSubTab('calls')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  commsSubTab === 'calls' 
                    ? 'bg-amber-400 text-emerald-950 font-black shadow-xs' 
                    : 'bg-emerald-900/70 text-emerald-200 hover:bg-emerald-800 border border-emerald-700/60'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Center Logs ({callLogs.length})</span>
                {callLogs.filter(c => c.status === 'ringing').length > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-black animate-pulse">
                    RINGING
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setCommsSubTab('messages')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  commsSubTab === 'messages' 
                    ? 'bg-amber-400 text-emerald-950 font-black shadow-xs' 
                    : 'bg-emerald-900/70 text-emerald-200 hover:bg-emerald-800 border border-emerald-700/60'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message Inbox ({supportTickets.length})</span>
                {supportTickets.filter(t => t.unreadByAdmin).length > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-black">
                    {supportTickets.filter(t => t.unreadByAdmin).length} new
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setCommsSubTab('directory')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  commsSubTab === 'directory' 
                    ? 'bg-amber-400 text-emerald-950 font-black shadow-xs' 
                    : 'bg-emerald-900/70 text-emerald-200 hover:bg-emerald-800 border border-emerald-700/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Registered Outgrowers Directory ({realUsers.length})</span>
              </button>
            </div>
          </div>

          {/* Section 1: Top Communications Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-xs">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Voice Calls Logged</span>
              <div className="text-3xl font-black text-emerald-800 mt-2 flex items-center gap-2">
                <Phone className="w-6 h-6 text-emerald-600" />
                <span>{callLogs.length}</span>
              </div>
              <div className="text-xs text-zinc-500 mt-1 flex items-center justify-between">
                <span>Completed: {callLogs.filter(c => c.status === 'completed').length}</span>
                <span className="text-rose-600 font-bold">Missed: {callLogs.filter(c => c.status === 'missed').length}</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-xs">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Inbound Messages</span>
              <div className="text-3xl font-black text-amber-700 mt-2 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-amber-500" />
                <span>{supportTickets.length}</span>
              </div>
              <span className="text-xs text-amber-800 font-bold mt-1 block">
                {supportTickets.filter(t => t.unreadByAdmin).length} Unread / Pending Action
              </span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-xs">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Registered Outgrower Lines</span>
              <div className="text-3xl font-black text-zinc-900 mt-2 flex items-center gap-2">
                <Users className="w-6 h-6 text-zinc-700" />
                <span>{realUsers.length}</span>
              </div>
              <span className="text-xs text-emerald-700 font-semibold mt-1 block">
                100% MoMo & Ghana Card Linked
              </span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-xs">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Telephony Response Speed</span>
              <div className="text-3xl font-black text-emerald-600 mt-2">
                &lt; 30s
              </div>
              <span className="text-xs text-zinc-500 mt-1 block">
                Automated + Officer Dispatch
              </span>
            </div>
          </div>

          {/* Section 2: Call Center Logs & Active Ringing Dispatch */}
          {(commsSubTab === 'all' || commsSubTab === 'calls') && (
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                <div>
                  <h3 className="font-black text-base text-zinc-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span>Outgrower Voice Call Dispatch Logs</span>
                  </h3>
                  <p className="text-xs text-zinc-500">Live call recordings, missed call alerts, and one-click caller dispatch</p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 bg-zinc-100 text-zinc-800 rounded-full self-start sm:self-auto">
                  {callLogs.length} Records Logged
                </span>
              </div>

              {callLogs.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  No voice calls logged yet. Incoming calls from users will ring here automatically.
                </div>
              ) : (
                <div className="space-y-3">
                  {callLogs.map(log => {
                    const matched = users.find(u => u.id === log.userId);
                    return (
                      <div 
                        key={log.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          log.status === 'ringing' 
                            ? 'bg-amber-50 border-amber-300 shadow-md animate-pulse' 
                            : log.status === 'missed'
                            ? 'bg-rose-50/60 border-rose-200'
                            : 'bg-zinc-50/70 border-zinc-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                            log.status === 'ringing'
                              ? 'bg-amber-500 text-white'
                              : log.status === 'missed'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {log.status === 'ringing' ? (
                              <PhoneCall className="w-5 h-5 animate-bounce" />
                            ) : log.status === 'missed' ? (
                              <PhoneOff className="w-5 h-5" />
                            ) : (
                              <Phone className="w-5 h-5" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-zinc-900">{log.userName}</h4>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.2 rounded-md ${
                                log.status === 'ringing'
                                  ? 'bg-amber-400 text-emerald-950 animate-pulse'
                                  : log.status === 'missed'
                                  ? 'bg-rose-200 text-rose-900'
                                  : 'bg-emerald-200 text-emerald-950'
                              }`}>
                                {log.status}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono">{log.timestamp}</span>
                            </div>

                            <div className="text-xs text-zinc-600 flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold text-emerald-800">{log.userPhone}</span>
                              <span>&bull;</span>
                              <span className="flex items-center gap-1 text-zinc-500">
                                <MapPin className="w-3 h-3 text-emerald-600" />
                                {log.district}
                              </span>
                              {log.duration && (
                                <>
                                  <span>&bull;</span>
                                  <span className="text-zinc-500 font-mono">Duration: {log.duration}</span>
                                </>
                              )}
                            </div>

                            {log.purpose && (
                              <div className="text-xs text-zinc-700 pt-0.5">
                                <span className="font-semibold text-zinc-900">Purpose:</span> {log.purpose}
                              </div>
                            )}

                            {log.adminNotes && (
                              <div className="text-[11px] text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                <strong>Supervisor Note:</strong> {log.adminNotes}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Call Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          {log.status === 'ringing' ? (
                            <button
                              type="button"
                              onClick={() => onAnswerCall?.(log.id)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer animate-pulse"
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
                              <span>Answer Call</span>
                            </button>
                          ) : (
                            <>
                              {matched && onInitiateAdminCallToUser && (
                                <button
                                  type="button"
                                  onClick={() => onInitiateAdminCallToUser(matched)}
                                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Launch outbound call to outgrower"
                                >
                                  <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
                                  <span>Call Back</span>
                                </button>
                              )}

                              <a
                                href={`tel:${log.userPhone}`}
                                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Dial Tel</span>
                              </a>

                              <a
                                href={`https://wa.me/233${log.userPhone.replace(/^0/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#075E54] font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                                title="Open WhatsApp chat with farmer"
                              >
                                <Share2 className="w-3.5 h-3.5 text-[#25D366]" />
                                <span>WhatsApp</span>
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section 3: All Registered Users Direct Directory */}
          {(commsSubTab === 'all' || commsSubTab === 'directory') && (
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                <div>
                  <h3 className="font-black text-base text-zinc-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <span>All Registered Outgrowers — Direct Contact Directory</span>
                  </h3>
                  <p className="text-xs text-zinc-500">Every registered farmer on Animal Farm Ghana with verified phone, Ghana Card, and instant call/message dispatch</p>
                </div>

                {/* Directory Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={commsUserSearch}
                    onChange={e => setCommsUserSearch(e.target.value)}
                    placeholder="Search name, phone, district..."
                    className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              {/* Users Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {realUsers.length === 0 ? (
                  <div className="col-span-full p-8 text-center bg-zinc-50 rounded-2xl border border-zinc-200 text-zinc-500">
                    <Users className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <div className="font-bold text-xs text-zinc-700">No Registered Outgrowers in Directory Yet</div>
                    <div className="text-[11px] text-zinc-400 mt-1">All newly registered farmers are automatically connected here with direct Call, Chat, and WhatsApp actions.</div>
                  </div>
                ) : (
                  realUsers
                    .filter(u => 
                      !commsUserSearch ||
                      u.fullName.toLowerCase().includes(commsUserSearch.toLowerCase()) ||
                      u.phone.includes(commsUserSearch) ||
                      u.district.toLowerCase().includes(commsUserSearch.toLowerCase()) ||
                      (u.ghanaCardPin && u.ghanaCardPin.toLowerCase().includes(commsUserSearch.toLowerCase()))
                    )
                    .map(farmer => (
                    <div 
                      key={farmer.id}
                      className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/90 hover:border-emerald-300 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full ring-2 ring-emerald-600 bg-emerald-900 text-amber-300 font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                            {farmer.avatar ? (
                              <img src={farmer.avatar} alt={farmer.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <span>{farmer.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-zinc-900 leading-tight truncate max-w-[150px]">
                              {farmer.fullName}
                            </h4>
                            <div className="text-[11px] font-mono font-bold text-emerald-800">
                              {farmer.phone}
                            </div>
                          </div>
                        </div>

                        <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-full">
                          GH₵ {farmer.walletBalance.toFixed(0)}
                        </span>
                      </div>

                      <div className="text-[11px] text-zinc-600 space-y-0.5 pt-1 border-t border-zinc-200/70">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">District:</span>
                          <span className="font-medium text-zinc-800 truncate max-w-[160px]">{farmer.district}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Ghana Card:</span>
                          <span className="font-mono text-zinc-800">{farmer.ghanaCardPin || 'Verified'}</span>
                        </div>
                      </div>

                      {/* Direct Dispatch Buttons */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => onInitiateAdminCallToUser?.(farmer)}
                          className="py-1.5 px-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded-xl flex items-center justify-center gap-1 shadow-2xs cursor-pointer transition-colors"
                          title="Call this registered user"
                        >
                          <PhoneCall className="w-3 h-3 text-amber-300" />
                          <span>Call</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCommsSubTab('messages');
                            const matchTkt = supportTickets.find(t => t.userId === farmer.id);
                            if (matchTkt) {
                              setSelectedTicketId(matchTkt.id);
                            }
                          }}
                          className="py-1.5 px-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-[10px] rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          title="Message this registered user"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-700" />
                          <span>Chat</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setManageModalUser(farmer)}
                          className="py-1.5 px-1.5 bg-zinc-100 hover:bg-emerald-100 text-zinc-700 hover:text-emerald-900 font-bold text-[10px] rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          title="Manage outgrower account"
                        >
                          <Edit2 className="w-3 h-3 text-zinc-500" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteConfirmUser(farmer)}
                          className="py-1.5 px-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors border border-rose-200"
                          title="Permanently delete user account"
                        >
                          <Trash2 className="w-3 h-3 text-rose-600" />
                          <span>Del</span>
                        </button>
                      </div>
                    </div>
                  )))}
              </div>
            </div>
          )}

          {/* Section 4: User Messages & Support Complaints Inbox */}
          {(commsSubTab === 'all' || commsSubTab === 'messages') && (
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                <div>
                  <h3 className="font-black text-base text-zinc-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    <span>Outgrower Message Inbox & Support Tickets</span>
                  </h3>
                  <p className="text-xs text-zinc-500">Read and respond directly to messages from registered farmers across Ghana</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full">
                    {supportTickets.filter(t => t.unreadByAdmin).length} Unread Messages
                  </span>
                </div>
              </div>

              {supportTickets.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  No support tickets or inquiries recorded yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Tickets List */}
                  <div className="lg:col-span-5 space-y-2.5 max-h-[560px] overflow-y-auto custom-scrollbar pr-1">
                    {supportTickets.map(tkt => {
                      const isSelected = (selectedTicketId === tkt.id) || (!selectedTicketId && supportTickets[0]?.id === tkt.id);
                      return (
                        <div
                          key={tkt.id}
                          onClick={() => setSelectedTicketId(tkt.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                            isSelected 
                              ? 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-2 ring-emerald-500/20' 
                              : tkt.unreadByAdmin
                              ? 'bg-amber-50/60 border-amber-300'
                              : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-zinc-900">{tkt.userName}</span>
                              {tkt.unreadByAdmin && (
                                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono">{tkt.createdAt}</span>
                          </div>

                          <div className="text-[11px] font-mono text-emerald-800 font-bold">
                            {tkt.userPhone} &bull; {tkt.district}
                          </div>

                          <div className="text-xs text-zinc-700 line-clamp-2 leading-relaxed">
                            {tkt.messages[tkt.messages.length - 1]?.text || tkt.subject}
                          </div>

                          <div className="flex items-center justify-between pt-1 text-[10px]">
                            <span className="font-bold px-2 py-0.5 bg-zinc-200/80 text-zinc-800 rounded-md">
                              {tkt.category}
                            </span>
                            <span className={`font-bold uppercase px-2 py-0.5 rounded-md ${
                              tkt.status === 'pending'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : tkt.status === 'replied'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-blue-100 text-blue-900'
                            }`}>
                              {tkt.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Column: Active Conversation History & Reply Input */}
                  <div className="lg:col-span-7 bg-zinc-50 rounded-2xl border border-zinc-200 p-4 flex flex-col h-[560px]">
                    {(() => {
                      const activeTkt = supportTickets.find(t => t.id === selectedTicketId) || supportTickets[0];
                      if (!activeTkt) {
                        return (
                          <div className="flex items-center justify-center h-full text-xs text-zinc-400">
                            Select a user conversation from the left to view messages.
                          </div>
                        );
                      }

                      return (
                        <>
                          {/* Thread Header */}
                          <div className="pb-3 border-b border-zinc-200 flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-zinc-900">{activeTkt.userName}</h4>
                                <span className="text-xs font-mono font-bold text-emerald-800">{activeTkt.userPhone}</span>
                              </div>
                              <div className="text-[11px] text-zinc-500">
                                Ticket #{activeTkt.id} &bull; {activeTkt.category} &bull; {activeTkt.district}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {onUpdateTicketStatus && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateTicketStatus(activeTkt.id, activeTkt.status === 'resolved' ? 'pending' : 'resolved')}
                                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                                    activeTkt.status === 'resolved'
                                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                      : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 border-zinc-300'
                                  }`}
                                >
                                  {activeTkt.status === 'resolved' ? 'Resolved' : 'Mark Resolved'}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Message Bubbles */}
                          <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 custom-scrollbar">
                            {activeTkt.messages.map(msg => (
                              <div
                                key={msg.id}
                                className={`flex flex-col ${
                                  msg.sender === 'admin' ? 'items-end' : 'items-start'
                                }`}
                              >
                                <div className="text-[10px] text-zinc-400 font-semibold mb-0.5 px-1">
                                  {msg.sender === 'admin' ? 'MoFA Bureau Officer' : activeTkt.userName} &bull; {msg.time}
                                </div>
                                <div
                                  className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                                    msg.sender === 'admin'
                                      ? 'bg-emerald-800 text-white rounded-tr-xs'
                                      : 'bg-white text-zinc-900 border border-zinc-200 rounded-tl-xs shadow-2xs'
                                  }`}
                                >
                                  {msg.text}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Quick Canned Reply Pills */}
                          <div className="pt-2 border-t border-zinc-200/80">
                            <span className="text-[10px] font-bold text-zinc-400 block mb-1">Quick Official Responses:</span>
                            <div className="flex flex-wrap gap-1">
                              {[
                                'GhIPSS withdrawal clearance verified and dispatched.',
                                'Shift telemetry and sanitation photo confirmed by zonal supervisor.',
                                '35% statutory harvest maturity payout scheduled to your wallet.'
                              ].map((quick, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setAdminReplyInput(quick)}
                                  className="text-[10px] px-2 py-0.5 bg-zinc-200/80 hover:bg-emerald-100 text-zinc-700 hover:text-emerald-900 rounded-lg cursor-pointer transition-colors"
                                >
                                  {quick.slice(0, 32)}...
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Reply Input Box */}
                          <form
                            onSubmit={e => {
                              e.preventDefault();
                              if (!adminReplyInput.trim() || !onSendAdminReply) return;
                              onSendAdminReply(activeTkt.id, adminReplyInput.trim());
                              setAdminReplyInput('');
                            }}
                            className="pt-2 flex items-center gap-2"
                          >
                            <input
                              type="text"
                              value={adminReplyInput}
                              onChange={e => setAdminReplyInput(e.target.value)}
                              placeholder={`Reply to ${activeTkt.userName}...`}
                              className="flex-1 px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                            />
                            <button
                              type="submit"
                              disabled={!adminReplyInput.trim()}
                              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Reply</span>
                            </button>
                          </form>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. SUBMISSIONS TAB */}
      {currentTab === 'submissions' && (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-black text-lg text-zinc-900">Task Proofs & Submissions Queue</h3>
              <p className="text-xs text-zinc-500">Inspect farmer text notes and attached photos to approve Ghana Cedi rewards</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Task & Sector</th>
                  <th className="pb-3">Farmer</th>
                  <th className="pb-3">Reward</th>
                  <th className="pb-3">Proof Snapshot</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CheckSquare className="w-8 h-8 text-zinc-300" />
                        <span className="font-bold text-xs text-zinc-700">No Field Proof Submissions Yet</span>
                        <span className="text-[11px] text-zinc-400">Field proofs submitted by real registered farmers will appear here for review. Test activities have been purged.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  submissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-zinc-50/60">
                    <td className="py-3">
                      <div className="font-bold text-zinc-900 flex items-center gap-1.5 flex-wrap">
                        <span>{sub.taskTitle}</span>
                        {sub.isAutomated && (
                          <span className="px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded text-[9px] font-black uppercase border border-teal-200">
                            {sub.automationType === 'crop_harvesting' ? 'Auto-Crop' : 'Auto-Breed'}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold">{sub.category}</span>
                    </td>
                    <td className="py-3">
                      <div className="font-semibold text-zinc-900">{sub.userName}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">{sub.userPhone}</div>
                    </td>
                    <td className="py-3 font-black text-emerald-700">GH₵ {sub.rewardAmount.toFixed(2)}</td>
                    <td className="py-3">
                      <div className="text-zinc-600 max-w-xs truncate">{sub.submissionText}</div>
                      {sub.proofFile && (
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Photo Attached
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        sub.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {sub.status === 'pending' ? (
                        <button
                          onClick={() => setReviewModalSub(sub)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                        >
                          Review Proof
                        </button>
                      ) : sub.status === 'approved' && onViewCertificate ? (
                        <button
                          onClick={() => onViewCertificate(sub)}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-emerald-950 font-bold text-[11px] rounded-lg border border-amber-300 transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-emerald-800" />
                          <span>View MoFA Cert</span>
                        </button>
                      ) : (
                        <span className="text-zinc-400 text-[11px]">Reviewed</span>
                      )}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. WITHDRAWALS TAB */}
      {currentTab === 'withdrawals' && (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-black text-lg text-zinc-900">Mobile Money Disbursements Ledger</h3>
              <p className="text-xs text-zinc-500">Manage MTN, Telecel, AT Money, and Bitcoin transaction settlements</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Reference</th>
                  <th className="pb-3">Farmer</th>
                  <th className="pb-3">Channel</th>
                  <th className="pb-3">Account / MoMo</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Wallet className="w-8 h-8 text-zinc-300" />
                        <span className="font-bold text-xs text-zinc-700">No Withdrawal Requests Yet</span>
                        <span className="text-[11px] text-zinc-400">Cashout requests from real registered farmers will appear here for payout processing. Test activities have been cleared.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  withdrawals.map(wd => (
                  <tr key={wd.id} className="hover:bg-zinc-50/60">
                    <td className="py-3 font-mono text-zinc-500">{wd.reference}</td>
                    <td className="py-3">
                      <div className="font-bold text-zinc-900">{wd.userName}</div>
                    </td>
                    <td className="py-3 font-semibold text-zinc-700">{wd.method}</td>
                    <td className="py-3">
                      <div className="font-mono text-zinc-900">{wd.accountNumber}</div>
                      <div className="text-[10px] text-zinc-400">{wd.accountName}</div>
                    </td>
                    <td className="py-3 font-black text-zinc-900">GH₵ {wd.amount.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        wd.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        wd.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {wd.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {wd.status === 'pending' ? (
                        <button
                          onClick={() => setPayoutModalWd(wd)}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                        >
                          Process Payout
                        </button>
                      ) : (
                        <span className="text-zinc-400 text-[11px] font-mono">{wd.txHash || 'Settled'}</span>
                      )}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. FARMERS TAB */}
      {currentTab === 'users' && (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                  Outgrower Management Rail
                </span>
                <span className="text-xs text-zinc-400 font-mono">MoFA Verification Protocol</span>
              </div>
              <h3 className="font-black text-xl text-zinc-900 mt-1">Registered Outgrower & Farmer Accounts</h3>
              <p className="text-xs text-zinc-500">Audit balances, adjust rewards, onboard new farmers, and instantly manage or delete accounts.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onPurgeTestActivities && (
                <button
                  type="button"
                  onClick={onPurgeTestActivities}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Purge any leftover test user activities, submissions, and calls"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Purge Test Records</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowCreateUserModal(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Register Outgrower</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, phone (024...), Ghana card, or district..."
                value={userSearchTerm}
                onChange={e => setUserSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              {userSearchTerm && (
                <button
                  type="button"
                  onClick={() => setUserSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Status:</span>
              <div className="flex items-center p-1 bg-zinc-100 rounded-xl">
                {(['all', 'active', 'suspended', 'verified'] as const).map(filterOption => (
                  <button
                    key={filterOption}
                    type="button"
                    onClick={() => setUserStatusFilter(filterOption)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      userStatusFilter === filterOption
                        ? 'bg-white text-zinc-900 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    {filterOption}
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-xl shrink-0">
                {filteredUsers.length} / {realUsers.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Farmer</th>
                  <th className="pb-3">Ghana Phone</th>
                  <th className="pb-3">Wallet Balance</th>
                  <th className="pb-3">Pending Rewards</th>
                  <th className="pb-3">Total Earned</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {realUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center">
                          <Users className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-sm text-zinc-800">No Registered Farmer Accounts Yet</span>
                        <span className="text-xs text-zinc-400 leading-relaxed">
                          All test user accounts have been purged. Newly registered farmers will automatically connect here, or you can register an outgrower directly.
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCreateUserModal(true)}
                          className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Register First Outgrower</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search className="w-6 h-6 text-zinc-300" />
                        <span className="font-bold text-xs text-zinc-700">No farmers matched your search criteria</span>
                        <button
                          onClick={() => { setUserSearchTerm(''); setUserStatusFilter('all'); }}
                          className="text-xs text-emerald-700 font-bold hover:underline"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-emerald-700">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.fullName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span>{u.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900 flex items-center gap-1.5 flex-wrap">
                            <span>{u.fullName}</span>
                            {u.phoneVerified && (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200" title="Phone verified via Ghana SMS Gateway">
                                SMS Verified
                              </span>
                            )}
                            {u.emailVerified && (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-sm bg-blue-50 text-blue-700 border border-blue-200" title="Email verified via OTP">
                                Email Verified
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-2 mt-0.5">
                            <span>{u.email || 'No email'}</span>
                            <span>&bull;</span>
                            <span>{u.district || 'Afienya-Tema'}</span>
                            {u.ghanaCardPin && (
                              <>
                                <span>&bull;</span>
                                <span className="text-zinc-500">{u.ghanaCardPin}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-mono font-bold text-zinc-800">
                      <span>{u.phone}</span>
                    </td>
                    <td className="py-3 font-black text-emerald-700">GH₵ {u.walletBalance.toFixed(2)}</td>
                    <td className="py-3 font-semibold text-amber-700">GH₵ {u.pendingRewards.toFixed(2)}</td>
                    <td className="py-3 text-zinc-600 font-medium">GH₵ {u.totalEarned.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setManageModalUser(u)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg transition-colors cursor-pointer border border-emerald-200 inline-flex items-center gap-1"
                        title="Manage user profile, credentials, and settings"
                      >
                        <Edit2 className="w-3 h-3 text-emerald-700" />
                        <span>Manage</span>
                      </button>
                      <button
                        onClick={() => setAdjustModalUser(u)}
                        className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                        title="Adjust wallet balance"
                      >
                        Adjust
                      </button>
                      <button
                        onClick={() => onToggleUserStatus(u.id)}
                        className={`px-2.5 py-1 font-bold text-[11px] rounded-lg transition-colors cursor-pointer ${
                          u.status === 'active' ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={u.status === 'active' ? 'Suspend member account' : 'Reactivate member account'}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmUser(u)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 font-bold text-[11px] rounded-lg transition-colors cursor-pointer border border-rose-200 inline-flex items-center gap-1"
                        title="Instantly delete user account and all activities"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TASKS TAB */}
      {currentTab === 'tasks' && (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-black text-lg text-zinc-900">Agricultural Tasks Management</h3>
              <p className="text-xs text-zinc-500">Configure task descriptions, instructions, and Ghana Cedi reward budgets</p>
            </div>
            <button
              onClick={() => setShowCreateTask(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map(t => (
              <div key={t.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {t.category}
                    </span>
                    <h4 className="font-bold text-zinc-900 text-sm mt-1">{t.title}</h4>
                  </div>
                  <span className="font-black text-emerald-700 text-sm">GH₵ {t.reward.toFixed(2)}</span>
                </div>
                <p className="text-xs text-zinc-600 line-clamp-2">{t.description}</p>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-200/60">
                  <span>Completed: {t.completedCount} / {t.maxCompletions}</span>
                  <span className="capitalize">Proof: {t.proofType.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. PACKAGES & PRICING TAB */}
      {currentTab === 'packages' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
                    Statutory Farm Units
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">GS 957:2019</span>
                </div>
                <h3 className="font-black text-xl text-zinc-900 mt-1">
                  Farm Packages & Unit Pricing Management
                </h3>
                <p className="text-xs text-zinc-500">
                  Add new agricultural units, adjust sponsorship prices (GH₵), update production zones, or remove packages.
                </p>
              </div>

              <button
                onClick={handleOpenCreatePackage}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Add New Package</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 mb-6 text-xs">
              <div>
                <span className="text-zinc-500 font-bold">Total Packages:</span>
                <p className="text-base font-black text-zinc-900">{packages.length} Units</p>
              </div>
              <div>
                <span className="text-zinc-500 font-bold">Active in Catalog:</span>
                <p className="text-base font-black text-emerald-700">
                  {packages.filter(p => p.status === 'active').length} Published
                </p>
              </div>
              <div>
                <span className="text-zinc-500 font-bold">Lowest Unit Price:</span>
                <p className="text-base font-black text-zinc-900">
                  GH₵ {packages.length > 0 ? Math.min(...packages.map(p => p.price)).toFixed(2) : '0.00'}
                </p>
              </div>
              <div>
                <span className="text-zinc-500 font-bold">Highest Unit Price:</span>
                <p className="text-base font-black text-amber-700">
                  GH₵ {packages.length > 0 ? Math.max(...packages.map(p => p.price)).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>

            {/* Package Pricing & 35% Commission Control Station */}
            {(() => {
              // Find the entry-level package (e.g. lowest price package or currently 75 GHS)
              const entryPkg = packages.slice().sort((a, b) => a.price - b.price)[0];
              if (!entryPkg) return null;

              return (
                <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 rounded-2xl border-2 border-amber-300/80 shadow-2xs space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-amber-400 text-zinc-950 rounded-xl shadow-xs">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 bg-amber-200/80 text-amber-950 rounded-md">
                            Package Pricing Hub
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                            35% Commission Yield Built-in
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-zinc-900 mt-0.5">
                          Change Entry Package Pricing: <span className="text-amber-800 underline">{entryPkg.name}</span>
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs self-start sm:self-auto">
                      <span className="text-xs text-zinc-500 font-bold">Current Base:</span>
                      <span className="text-base font-black font-mono text-emerald-800">
                        GH₵ {entryPkg.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Fast-reprice your lowest or entry-level agricultural unit. When you change the price from 75 GH₵ to 100 GH₵ or above, the <strong>35% Member Commission</strong> and daily gestation/harvest interest will automatically recalculate for all investors.
                  </p>

                  {/* 1-Tap Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs font-bold text-zinc-700">1-Tap Reprice To:</span>
                    {[75, 100, 150, 200, 250, 300, 500].map(targetVal => {
                      const isCurrent = Math.round(entryPkg.price) === targetVal;
                      return (
                        <button
                          key={targetVal}
                          type="button"
                          onClick={() => {
                            onUpdatePackage(entryPkg.id, { price: targetVal });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                            isCurrent
                              ? 'bg-emerald-800 text-white ring-2 ring-emerald-500 ring-offset-1'
                              : 'bg-white hover:bg-emerald-50 text-zinc-800 border border-zinc-300 hover:border-emerald-400'
                          }`}
                          title={`Set price to GH₵ ${targetVal}.00 (35% commission = GH₵ ${(targetVal * 0.35).toFixed(2)})`}
                        >
                          <span>GH₵ {targetVal}</span>
                          <span className={`text-[10px] px-1 py-0.2 rounded ${isCurrent ? 'bg-emerald-900 text-amber-300' : 'bg-zinc-100 text-zinc-500'}`}>
                            +35% ({(targetVal * 0.35).toFixed(0)})
                          </span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => handleOpenQuickPrice(entryPkg)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-zinc-950 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Custom Price...</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={packageSearchQuery}
                  onChange={e => setPackageSearchQuery(e.target.value)}
                  placeholder="Search by package name, unit code, or cluster..."
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['All', 'Poultry', 'Goat Farming', 'Fish Farming', 'Crop Farming', 'Cattle Farming', 'Pig Farming'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setPackageCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      packageCategoryFilter === cat 
                        ? 'bg-emerald-800 text-white' 
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Packages Grid */}
            {(() => {
              const filtered = packages.filter(p => {
                const matchCat = packageCategoryFilter === 'All' || p.category === packageCategoryFilter;
                const matchSearch = !packageSearchQuery.trim() || 
                  p.name.toLowerCase().includes(packageSearchQuery.toLowerCase()) ||
                  p.statutoryUnitCode.toLowerCase().includes(packageSearchQuery.toLowerCase()) ||
                  p.cooperativeCluster.toLowerCase().includes(packageSearchQuery.toLowerCase());
                return matchCat && matchSearch;
              });

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                    <Layers className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-zinc-600">No packages found</p>
                    <p className="text-xs text-zinc-400 mt-1">Try changing search filters or create a new package.</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map(pkg => (
                    <div 
                      key={pkg.id} 
                      className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        {/* Package Header & Image */}
                        <div className="relative h-40 bg-zinc-100 overflow-hidden">
                          <img 
                            src={pkg.image} 
                            alt={pkg.name}
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
                          
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold bg-black/70 text-amber-300 px-2 py-0.5 rounded-md border border-amber-400/40">
                              {pkg.statutoryUnitCode}
                            </span>
                            <span className="text-[10px] font-bold bg-emerald-900/90 text-emerald-200 px-2 py-0.5 rounded-md">
                              {pkg.category}
                            </span>
                          </div>

                          <div className="absolute top-2.5 right-2.5">
                            <button
                              onClick={() => handleTogglePackageStatus(pkg)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                                pkg.status === 'active'
                                  ? 'bg-emerald-500/90 text-white border-emerald-400 hover:bg-emerald-600'
                                  : 'bg-zinc-800/90 text-zinc-300 border-zinc-600 hover:bg-zinc-700'
                              }`}
                              title="Click to toggle active status in catalog"
                            >
                              {pkg.status === 'active' ? 'Active' : 'Inactive'}
                            </button>
                          </div>

                          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-end">
                            <div className="bg-emerald-950/90 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-amber-400/50">
                              <span className="text-[9px] text-zinc-300 font-bold uppercase block">Unit Price</span>
                              <span className="text-base font-black text-amber-300 font-mono">
                                GH₵ {pkg.price.toFixed(2)}
                              </span>
                            </div>

                            <span className="text-[11px] font-bold bg-white/90 text-zinc-800 px-2 py-0.5 rounded-lg shadow-xs">
                              {pkg.durationDays} Days Cycle
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-4 space-y-2.5">
                          <div>
                            <h4 className="font-bold text-sm text-zinc-900 line-clamp-1">
                              {pkg.name}
                            </h4>
                            <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">{pkg.cooperativeCluster}</span>
                            </p>
                          </div>

                          <p className="text-xs text-zinc-600 line-clamp-2">
                            {pkg.description}
                          </p>

                          {/* 35% Commission & Return Summary */}
                          <div className="p-2.5 bg-emerald-50/90 rounded-xl border border-emerald-200 text-[11px] space-y-1">
                            <div className="flex justify-between items-center text-emerald-900 font-bold">
                              <span>35% Interest Commission:</span>
                              <span className="font-mono text-emerald-800 font-black">+GH₵ {(pkg.price * 0.35).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-700">
                              <span>Maturity Yield Value:</span>
                              <span className="font-mono font-bold text-zinc-900">GH₵ {(pkg.price * 1.35).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-500 text-[10px]">
                              <span>Daily Gestation Yield ({pkg.durationDays || 20}d):</span>
                              <span className="font-mono font-semibold">GH₵ {(((pkg.price || 0) * 0.35) / (pkg.durationDays || 20)).toFixed(2)} / Day</span>
                            </div>
                          </div>

                          <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-200 text-[11px] space-y-1">
                            <div className="flex justify-between text-zinc-500">
                              <span>Production Zone:</span>
                              <span className="font-medium text-zinc-800 truncate max-w-[150px]">{pkg.productionZone}</span>
                            </div>
                            <div className="flex justify-between text-zinc-500">
                              <span>Deed Reference:</span>
                              <span className="font-mono text-zinc-700 truncate max-w-[150px]">{pkg.deedAgreementRef}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar: Edit, Edit Price, Delete */}
                      <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-1.5">
                        <button
                          onClick={() => handleOpenQuickPrice(pkg)}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                          title="Quick edit unit price"
                        >
                          <Tag className="w-3 h-3 text-amber-700" />
                          <span>Edit Price</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditPackage(pkg)}
                            className="px-2.5 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                            title="Edit full package specifications"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeletePackageConfirm(pkg)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                            title="Delete / Remove Package"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 7. MESSAGE BROADCAST TAB */}
      {currentTab === 'broadcast' && (
        <div className="space-y-6 max-w-5xl">
          {/* Header Banner */}
          <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-zinc-900 text-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-800 shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-emerald-950 text-xs font-black uppercase tracking-wider">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-950" />
                <span>Omni-Channel Broadcast Dispatcher</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Broadcast Official Messages to All Outgrowers
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
                Dispatch verified notices, harvest milestone announcements, and telecom payout updates instantly. Broadcasts are sent directly into all <strong>{realUsers.length || '15,420+'} outgrower notification inboxes</strong> and can optionally be synchronized with the official <strong>WhatsApp Channel</strong>.
              </p>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:block opacity-10">
              <Volume2 className="w-48 h-48 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Compose Broadcast Form */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 text-base">Compose Broadcast Message</h3>
                    <p className="text-xs text-zinc-500">Reach all active and verified farmers in one click</p>
                  </div>
                </div>

                {broadcastSuccess && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Broadcast Sent to {realUsers.length || 15420} Users!</span>
                  </span>
                )}
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  setBroadcastError(null);
                  if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
                    setBroadcastError('Please enter both a title and message body for the broadcast.');
                    return;
                  }

                  if (onBroadcastMessage) {
                    onBroadcastMessage(broadcastTitle.trim(), broadcastMessage.trim(), broadcastChannel, broadcastPriority);
                  }

                  const newLog = {
                    id: `bc-${Date.now()}`,
                    title: broadcastTitle.trim(),
                    message: broadcastMessage.trim(),
                    channel: broadcastChannel,
                    priority: broadcastPriority,
                    sentAt: 'Just now',
                    recipientCount: realUsers.length || 15420
                  };

                  setBroadcastLogs(prev => [newLog, ...prev]);
                  setBroadcastSuccess(true);
                  setBroadcastTitle('');
                  setBroadcastMessage('');

                  setTimeout(() => {
                    setBroadcastSuccess(false);
                  }, 4000);
                }}
                className="space-y-4"
              >
                {/* Target Audience / Recipient Count */}
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-800" />
                    <span className="font-bold text-emerald-950">Recipient Target:</span>
                    <span className="text-zinc-600">All Registered Outgrowers</span>
                  </div>
                  <div className="px-2.5 py-0.5 rounded-full bg-emerald-800 text-amber-300 font-mono font-bold text-xs">
                    {realUsers.length} Active Accounts
                  </div>
                </div>

                {/* Broadcast Channel Selection */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                    Distribution Channels
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setBroadcastChannel('both')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        broadcastChannel === 'both'
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600'
                          : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black">All Channels</span>
                        <Radio className="w-3.5 h-3.5 text-emerald-700" />
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1">In-App + WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBroadcastChannel('in_app')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        broadcastChannel === 'in_app'
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600'
                          : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black">In-App Alerts</span>
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1">Direct User Inboxes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBroadcastChannel('whatsapp')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        broadcastChannel === 'whatsapp'
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600'
                          : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black">WhatsApp</span>
                        <Share2 className="w-3.5 h-3.5 text-[#25D366]" />
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1">Broadcast Channel</span>
                    </button>
                  </div>
                </div>

                {/* Priority Selection */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Priority:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBroadcastPriority('normal')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        broadcastPriority === 'normal'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                      }`}
                    >
                      Standard Notice
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastPriority('urgent')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        broadcastPriority === 'urgent'
                          ? 'bg-amber-100 text-amber-950 border-amber-400 font-black'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                      }`}
                    >
                      Urgent / Immediate Action
                    </button>
                  </div>
                </div>

                {/* Broadcast Subject / Title */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Broadcast Title / Subject
                  </label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={e => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. Scheduled Maintenance, Special Yield Bonus, or Harvest Payout"
                    required
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>

                {/* Broadcast Body Message */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Message Content (Broadcast to all users)
                  </label>
                  <textarea
                    rows={4}
                    value={broadcastMessage}
                    onChange={e => setBroadcastMessage(e.target.value)}
                    placeholder="Type the full message to be published to all Ghanaian outgrowers..."
                    required
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white leading-relaxed"
                  />
                </div>

                {broadcastError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{broadcastError}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Logged under Chief Administrative Officer authority.</span>
                  </div>

                  <button
                    type="submit"
                    className="tap-bounce px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-amber-300" />
                    <span>Send Broadcast to All Users</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Channel Link Preview & Broadcast History */}
            <div className="space-y-4">
              {/* WhatsApp Channel Direct Access Card */}
              <div className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#25D366]/20 text-[#25D366] flex items-center justify-center">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm">Active WhatsApp Channel</h4>
                    <span className="text-[10px] text-emerald-700 font-bold">Live Synced</span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs space-y-1">
                  <div className="font-bold text-zinc-800">
                    {formSettings.whatsappChannelName || 'Animal Farm Ghana Official Broadcast Channel'}
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate font-mono">
                    {formSettings.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VaFarmGhanaOfficial'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={formSettings.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VaFarmGhanaOfficial'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Channel</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('settings')}
                    className="py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Edit URL
                  </button>
                </div>
              </div>

              {/* Past Broadcast Logs */}
              <div className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-zinc-900 text-sm">Broadcast History</h4>
                  <span className="text-[10px] text-zinc-400 font-mono">{broadcastLogs.length} Logged</span>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar">
                  {broadcastLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-zinc-900 line-clamp-1">{log.title}</span>
                        <span className="text-[10px] text-zinc-400 whitespace-nowrap shrink-0">{log.sentAt}</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 line-clamp-2 leading-relaxed">
                        {log.message}
                      </p>
                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-zinc-200/60">
                        <span className="text-emerald-800 font-semibold font-mono">
                          {log.recipientCount.toLocaleString()} Recipients
                        </span>
                        <span className="px-1.5 py-0.2 bg-zinc-200 text-zinc-700 rounded text-[9px] font-bold uppercase">
                          {log.channel === 'both' ? 'In-App + WhatsApp' : log.channel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. SETTINGS TAB */}
      {currentTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs max-w-3xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-black text-lg text-zinc-900">Gateway & System Rules</h3>
              <p className="text-xs text-zinc-500">Telecom SMS credentials, Paystack keys, and payout thresholds</p>
            </div>
            {settingsSaved && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Min Withdrawal (GH₵)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formSettings.minWithdrawal}
                  onChange={e => setFormSettings({ ...formSettings, minWithdrawal: parseFloat(e.target.value) || 20 })}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Max Withdrawal (GH₵)
                </label>
                <input
                  type="number"
                  step="50"
                  value={formSettings.maxWithdrawal}
                  onChange={e => setFormSettings({ ...formSettings, maxWithdrawal: parseFloat(e.target.value) || 5000 })}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Referral Reward (GH₵)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formSettings.referralReward}
                  onChange={e => setFormSettings({ ...formSettings, referralReward: parseFloat(e.target.value) || 5 })}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Required Referrals For 1st Cashout
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formSettings.requiredReferralsForFirstWithdrawal ?? 7}
                  onChange={e => setFormSettings({ ...formSettings, requiredReferralsForFirstWithdrawal: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900"
                />
              </div>
            </div>

            {/* Paystack Public Key */}
            <div className="pt-2 border-t border-zinc-100">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Paystack Public Key
                </label>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Live Key Configured
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPaystackKey ? "text" : "password"}
                  value={formSettings.paystackPublicKey}
                  onChange={e => setFormSettings({ ...formSettings, paystackPublicKey: e.target.value })}
                  placeholder="pk_live_••••••••••••••••"
                  className="w-full pl-3 pr-10 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-800 focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPaystackKey(!showPaystackKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                  title={showPaystackKey ? "Hide key" : "Show key"}
                >
                  {showPaystackKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-500">
                <span>Encrypted for automated MoMo settlements & sponsorships.</span>
                {formSettings.paystackPublicKey !== 'pk_live_953c8b729d6aa6caacfe87d1083ce5a628ae5bcb' && (
                  <button
                    type="button"
                    onClick={() => setFormSettings({ ...formSettings, paystackPublicKey: 'pk_live_953c8b729d6aa6caacfe87d1083ce5a628ae5bcb', paystackTestMode: false })}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Reset to Default Live Key
                  </button>
                )}
              </div>
            </div>

            {/* SMS Provider */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                Active Ghana SMS Gateway
              </label>
              <select
                value={formSettings.smsActiveProvider}
                onChange={e => setFormSettings({ ...formSettings, smsActiveProvider: e.target.value as any })}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800"
              >
                <option value="simulation">Sandbox Simulation (Immediate 6-digit OTP delivery)</option>
                <option value="hubysms">HubySMS (Ghana Telecoms Aggregator)</option>
                <option value="mnotify">mNotify (Ghana Quick SMS)</option>
              </select>
            </div>

            {/* WhatsApp Broadcast Channel Configuration */}
            <div className="pt-4 border-t border-zinc-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-[#25D366]" />
                    WhatsApp Channel Broadcast Configuration
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Configure the official WhatsApp Channel button displayed to all outgrowers across the user panel.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-zinc-700">Display to Users</span>
                  <input
                    type="checkbox"
                    checked={formSettings.whatsappChannelEnabled ?? true}
                    onChange={e => setFormSettings({ ...formSettings, whatsappChannelEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    WhatsApp Channel Link / URL
                  </label>
                  <input
                    type="url"
                    value={formSettings.whatsappChannelUrl ?? 'https://whatsapp.com/channel/0029VaFarmGhanaOfficial'}
                    onChange={e => setFormSettings({ ...formSettings, whatsappChannelUrl: e.target.value })}
                    placeholder="https://whatsapp.com/channel/..."
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-800 focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Direct invite or channel link where farmers can follow official notices.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Channel Display Title / Label
                  </label>
                  <input
                    type="text"
                    value={formSettings.whatsappChannelName ?? 'Animal Farm Ghana Official Broadcast Channel'}
                    onChange={e => setFormSettings({ ...formSettings, whatsappChannelName: e.target.value })}
                    placeholder="e.g. Official WhatsApp Broadcast Channel"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Text displayed on the user channel button and header widgets.
                  </span>
                </div>
              </div>
            </div>

            {/* Bitcoin Address */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                Default Bitcoin Deposit Address
              </label>
              <input
                type="text"
                value={formSettings.bitcoinAddress}
                onChange={e => setFormSettings({ ...formSettings, bitcoinAddress: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-800"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer mt-4"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </form>
        </div>
      )}

      {/* Review Proof Modal */}
      {reviewModalSub && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-zinc-200">
            <div className="bg-zinc-950 text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Proof Verification</span>
                <h4 className="font-bold text-base text-white">{reviewModalSub.taskTitle}</h4>
              </div>
              <button onClick={() => setReviewModalSub(null)} className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs">
                <div className="text-zinc-500">Submitted by: <strong className="text-zinc-900">{reviewModalSub.userName} ({reviewModalSub.userPhone})</strong></div>
                <div className="text-zinc-500 mt-1">Reward to Credit: <strong className="text-emerald-700 font-bold">GH₵ {reviewModalSub.rewardAmount.toFixed(2)}</strong></div>
              </div>

              <div>
                <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider block mb-1">Farmer Observation Notes:</span>
                <p className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-800 leading-relaxed">
                  {reviewModalSub.submissionText}
                </p>
              </div>

              {reviewModalSub.proofFile && (
                <div>
                  <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider block mb-1">Uploaded Proof Photo:</span>
                  <img src={reviewModalSub.proofFile} alt="Field Proof" className="w-full h-44 object-cover rounded-2xl border border-zinc-200" />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Admin Feedback Note:</label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={e => {
                    setAdminNote(e.target.value);
                    if (reviewModalError) setReviewModalError(null);
                  }}
                  placeholder="e.g. Excellent egg counts verified."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                />
              </div>

              {reviewModalError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{reviewModalError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleReject(reviewModalSub)}
                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl"
                >
                  Reject Proof
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(reviewModalSub)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Credit GH₵ {reviewModalSub.rewardAmount.toFixed(2)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Process Payout Modal */}
      {payoutModalWd && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-zinc-200">
            <div className="bg-zinc-950 text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Disbursement Queue</span>
                <h4 className="font-bold text-base text-white">Disburse Payout #{payoutModalWd.id}</h4>
              </div>
              <button onClick={() => setPayoutModalWd(null)} className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs space-y-1">
                <div>Farmer: <strong>{payoutModalWd.userName}</strong></div>
                <div>Method: <strong>{payoutModalWd.method}</strong></div>
                <div>Account: <code className="font-bold text-zinc-900">{payoutModalWd.accountNumber}</code> ({payoutModalWd.accountName})</div>
                <div className="text-sm font-black text-rose-700 pt-1">Amount to send: GH₵ {payoutModalWd.amount.toFixed(2)}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  MoMo Transaction ID / Reference (If Approving)
                </label>
                <input
                  type="text"
                  value={txHashInput}
                  onChange={e => setTxHashInput(e.target.value)}
                  placeholder="e.g. MOMO92847102"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Rejection Reason (If Rejecting)
                </label>
                <input
                  type="text"
                  value={rejectWdNote}
                  onChange={e => {
                    setRejectWdNote(e.target.value);
                    if (payoutModalError) setPayoutModalError(null);
                  }}
                  placeholder="e.g. Invalid MoMo name match on MTN rail."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                />
              </div>

              {payoutModalError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{payoutModalError}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => handleConfirmRejectWd(payoutModalWd)}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl"
                >
                  Reject & Refund
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmPaid(payoutModalWd)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Confirm Paid (Dispatched)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Balance Modal */}
      {adjustModalUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-zinc-200">
            <div className="bg-zinc-950 text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Balance Audit</span>
                <h4 className="font-bold text-base text-white">Adjust: {adjustModalUser.fullName}</h4>
              </div>
              <button onClick={() => setAdjustModalUser(null)} className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBalanceSubmit} className="p-6 space-y-4">
              <div className="text-xs text-zinc-500">
                Current Wallet Balance: <strong className="text-emerald-700 font-bold">GH₵ {adjustModalUser.walletBalance.toFixed(2)}</strong>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('credit')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    adjustType === 'credit' ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-700'
                  }`}
                >
                  Credit (Add Funds)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('debit')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    adjustType === 'debit' ? 'bg-rose-600 text-white' : 'bg-zinc-100 text-zinc-700'
                  }`}
                >
                  Debit (Deduct Funds)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Amount (GH₵)
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Audit Reason (Logged in ledger)
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-zinc-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs mt-2"
              >
                Apply Adjustment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border-2 border-rose-200 animate-in zoom-in-95 duration-150">
            <div className="bg-rose-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-800 text-rose-200 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Permanently Delete Account</h4>
                  <span className="text-[10px] text-rose-300 font-mono">Instant & Irreversible Action</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="text-rose-300 hover:text-white p-1 rounded-lg hover:bg-rose-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-1.5">
                <div className="font-bold text-rose-800">You are about to permanently delete:</div>
                <div className="text-base font-black text-rose-950">{deleteConfirmUser.fullName}</div>
                <div className="font-mono text-zinc-600">Phone: {deleteConfirmUser.phone} &bull; Email: {deleteConfirmUser.email || 'N/A'}</div>
                <div className="font-mono font-bold text-emerald-800">Wallet Balance: GH₵ {deleteConfirmUser.walletBalance.toFixed(2)}</div>
                <div className="text-[11px] text-zinc-500 pt-1 border-t border-rose-200/60 flex items-center justify-between">
                  <span>Membership Ref: {deleteConfirmUser.membershipNumber || 'AFG-MEMBER'}</span>
                  <span className="capitalize font-bold text-rose-700">Status: {deleteConfirmUser.status}</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-[11px] text-zinc-600 space-y-1">
                <div className="font-bold text-zinc-800">Instant Purge Scope:</div>
                <ul className="list-disc list-inside space-y-0.5 text-zinc-600">
                  <li>Farmer profile and login credentials will be erased</li>
                  <li>All task submissions and inspection proof records removed</li>
                  <li>All pending and settled mobile money cashout requests purged</li>
                  <li>Support tickets, chat messages, and telephony voice logs removed</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmUser(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteUser}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage User Account Modal */}
      {manageModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-zinc-200 my-8 animate-in zoom-in-95 duration-150">
            <div className="bg-emerald-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-900 border border-emerald-700 text-amber-300 font-bold flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-official-heading">
                    Farmer Account Management
                  </span>
                  <h4 className="font-bold text-base text-white">{manageModalUser.fullName}</h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setManageModalUser(null)}
                className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserManage} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.fullName}
                    onChange={e => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Ghana Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editFormData.phone}
                    onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Registered Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Ghana Card PIN</label>
                  <input
                    type="text"
                    value={editFormData.ghanaCardPin}
                    onChange={e => setEditFormData({ ...editFormData, ghanaCardPin: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">District / Agro Belt</label>
                  <input
                    type="text"
                    value={editFormData.district}
                    onChange={e => setEditFormData({ ...editFormData, district: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Agricultural Focus</label>
                  <input
                    type="text"
                    value={editFormData.agriculturalFocus}
                    onChange={e => setEditFormData({ ...editFormData, agriculturalFocus: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Account Status</label>
                  <select
                    value={editFormData.status}
                    onChange={e => setEditFormData({ ...editFormData, status: e.target.value as 'active' | 'suspended' })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="active">Active (Full Access)</option>
                    <option value="suspended">Suspended (Restricted)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Wallet Balance (GH₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editFormData.walletBalance}
                    onChange={e => setEditFormData({ ...editFormData, walletBalance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-black text-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Reset / Set Password</label>
                <input
                  type="text"
                  placeholder="Enter new password (or leave as is)"
                  value={editFormData.password || ''}
                  onChange={e => setEditFormData({ ...editFormData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Verification Toggles */}
              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
                <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block">Identity & OTP Verification Status</span>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-800">
                    <input
                      type="checkbox"
                      checked={editFormData.phoneVerified}
                      onChange={e => setEditFormData({ ...editFormData, phoneVerified: e.target.checked })}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                    <span>Ghana SMS Phone Verified</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-800">
                    <input
                      type="checkbox"
                      checked={editFormData.emailVerified}
                      onChange={e => setEditFormData({ ...editFormData, emailVerified: e.target.checked })}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                    <span>Gmail OTP Verified</span>
                  </label>
                </div>
              </div>

              {/* Associated Activities Summary */}
              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs">
                <div className="font-bold text-emerald-950 mb-1.5 flex items-center justify-between">
                  <span>Connected Activity Records</span>
                  <span className="text-[10px] text-emerald-700 font-mono">Member ID: {manageModalUser.id}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-1.5 bg-white rounded-xl border border-emerald-200">
                    <div className="font-black text-emerald-800">{submissions.filter(s => s.userId === manageModalUser.id).length}</div>
                    <div className="text-[9px] text-zinc-500">Proofs</div>
                  </div>
                  <div className="p-1.5 bg-white rounded-xl border border-emerald-200">
                    <div className="font-black text-rose-800">{withdrawals.filter(w => w.userId === manageModalUser.id).length}</div>
                    <div className="text-[9px] text-zinc-500">Cashouts</div>
                  </div>
                  <div className="p-1.5 bg-white rounded-xl border border-emerald-200">
                    <div className="font-black text-amber-800">{supportTickets.filter(t => t.userId === manageModalUser.id).length}</div>
                    <div className="text-[9px] text-zinc-500">Tickets</div>
                  </div>
                  <div className="p-1.5 bg-white rounded-xl border border-emerald-200">
                    <div className="font-black text-zinc-800">{callLogs.filter(c => c.userId === manageModalUser.id).length}</div>
                    <div className="text-[9px] text-zinc-500">Calls</div>
                  </div>
                </div>
              </div>

              {/* Danger Zone: Delete User Account */}
              <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmUser(manageModalUser)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete User Account</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setManageModalUser(null)}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Onboard / Register New Farmer Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-zinc-200 my-8 animate-in zoom-in-95 duration-150">
            <div className="bg-emerald-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-900 border border-emerald-700 text-amber-300 font-bold flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-official-heading">
                    Official Outgrower Onboarding
                  </span>
                  <h4 className="font-bold text-base text-white">Register New Farmer Account</h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateUserModal(false)}
                className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFarmerSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Emmanuel Mensah"
                    value={newFarmerData.fullName}
                    onChange={e => setNewFarmerData({ ...newFarmerData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Ghana Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0244123456"
                    value={newFarmerData.phone}
                    onChange={e => setNewFarmerData({ ...newFarmerData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="farmer@email.com (optional)"
                    value={newFarmerData.email}
                    onChange={e => setNewFarmerData({ ...newFarmerData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Ghana Card PIN</label>
                  <input
                    type="text"
                    placeholder="GHA-123456789-0"
                    value={newFarmerData.ghanaCardPin}
                    onChange={e => setNewFarmerData({ ...newFarmerData, ghanaCardPin: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">District / Corridor</label>
                  <input
                    type="text"
                    value={newFarmerData.district}
                    onChange={e => setNewFarmerData({ ...newFarmerData, district: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Agricultural Focus</label>
                  <input
                    type="text"
                    value={newFarmerData.agriculturalFocus}
                    onChange={e => setNewFarmerData({ ...newFarmerData, agriculturalFocus: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Initial Balance (GH₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newFarmerData.walletBalance}
                    onChange={e => setNewFarmerData({ ...newFarmerData, walletBalance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-black text-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Password</label>
                  <input
                    type="text"
                    value={newFarmerData.password}
                    onChange={e => setNewFarmerData({ ...newFarmerData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 flex gap-4 text-xs font-bold text-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFarmerData.phoneVerified}
                    onChange={e => setNewFarmerData({ ...newFarmerData, phoneVerified: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                  <span>Mark Phone as Verified</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFarmerData.emailVerified}
                    onChange={e => setNewFarmerData({ ...newFarmerData, emailVerified: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                  <span>Mark Email as Verified</span>
                </label>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Register & Connect Farmer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-zinc-200">
            <div className="bg-emerald-950 text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Task Directory</span>
                <h4 className="font-bold text-base text-white">Create New Agricultural Task</h4>
              </div>
              <button onClick={() => setShowCreateTask(false)} className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-emerald-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Goat Pen Feeding & Weight Sampling"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={e => setNewTaskCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                  >
                    <option value="Poultry">Poultry</option>
                    <option value="Goat Farming">Goat Farming</option>
                    <option value="Cattle Farming">Cattle Farming</option>
                    <option value="Pig Farming">Pig Farming</option>
                    <option value="Fish Farming">Fish Farming</option>
                    <option value="Crop Farming">Crop Farming</option>
                    <option value="General Farm Care">General Farm Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Reward (GH₵)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newTaskReward}
                    onChange={e => setNewTaskReward(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newTaskDesc}
                  onChange={e => setNewTaskDesc(e.target.value)}
                  placeholder="Brief summary displayed on task card..."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Step-by-Step Instructions</label>
                <textarea
                  rows={3}
                  value={newTaskInst}
                  onChange={e => setNewTaskInst(e.target.value)}
                  placeholder="1. Inspect pen... 2. Check feed..."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Proof Type</label>
                  <select
                    value={newTaskProofType}
                    onChange={e => setNewTaskProofType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                  >
                    <option value="both">Both Text & Photo</option>
                    <option value="image_required">Photo Required</option>
                    <option value="text_only">Text Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Estimated Time</label>
                  <input
                    type="text"
                    value={newTaskTime}
                    onChange={e => setNewTaskTime(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs mt-2"
              >
                Create Agricultural Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quick Price Edit Modal */}
      {quickPricePkg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-zinc-200 animate-in fade-in">
            <div className="bg-emerald-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm text-white">Adjust Package Price</h4>
              </div>
              <button 
                onClick={() => setQuickPricePkg(null)} 
                className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickPriceSubmit} className="p-6 space-y-4">
              <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200">
                <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider block">
                  {quickPricePkg.statutoryUnitCode}
                </span>
                <h5 className="font-bold text-sm text-zinc-900 mt-0.5">{quickPricePkg.name}</h5>
                <div className="flex items-center justify-between mt-1 text-xs text-zinc-600">
                  <span>Current Base Price:</span>
                  <span className="text-emerald-800 font-mono font-black text-sm">GH₵ {quickPricePkg.price.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Adjust Unit Price (Ghana Cedis GH₵) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-400">
                    GH₵
                  </span>
                  <input
                    type="number"
                    step="0.50"
                    min="1"
                    value={quickPriceVal}
                    onChange={e => setQuickPriceVal(e.target.value)}
                    className="w-full pl-14 pr-4 py-2.5 bg-zinc-50 border-2 border-emerald-400 rounded-xl text-lg font-black font-mono text-zinc-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick adjustment presets */}
              <div>
                <span className="text-zinc-500 font-bold text-[11px] block mb-1.5">Quick Price Presets:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[75, 100, 150, 200, 250, 300, 350, 500, 1000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setQuickPriceVal(val.toFixed(2))}
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                        parseFloat(quickPriceVal) === val
                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                          : 'bg-zinc-100 hover:bg-emerald-50 text-zinc-700 hover:text-emerald-900 border-zinc-200'
                      }`}
                    >
                      GH₵ {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic 35% Commission & Member Payout Breakdown */}
              {(() => {
                const numericPrice = parseFloat(quickPriceVal) || 0;
                const commission = numericPrice * 0.35;
                const totalPayout = numericPrice + commission;
                const dailyRate = quickPricePkg.durationDays ? (commission / quickPricePkg.durationDays) : 0;

                return (
                  <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-zinc-700">
                      <span>Cooperative Principal Price:</span>
                      <span className="font-mono font-bold text-zinc-900">GH₵ {numericPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-800">
                      <span>35% Outgrower Commission:</span>
                      <span className="font-mono font-black text-emerald-900">+GH₵ {commission.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-600 text-[11px]">
                      <span>Daily Gestation/Harvest Yield ({quickPricePkg.durationDays}d):</span>
                      <span className="font-mono font-semibold">GH₵ {dailyRate.toFixed(2)} / Day</span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 border-t border-amber-200/80 font-black text-zinc-900">
                      <span>Total Farmer Payout at Maturity:</span>
                      <span className="font-mono text-emerald-900 text-sm">GH₵ {totalPayout.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}

              {quickPriceError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{quickPriceError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickPricePkg(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Save Package Price</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Package Modal */}
      {showCreatePackage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-zinc-200 max-h-[90vh] flex flex-col">
            <div className="bg-emerald-950 text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                    Statutory Registry
                  </span>
                  <h4 className="font-bold text-base text-white">Create New Farm Package</h4>
                </div>
              </div>
              <button 
                onClick={() => setShowCreatePackage(false)} 
                className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePackageSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Package Name / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={pkgName}
                  onChange={e => setPkgName(e.target.value)}
                  placeholder="e.g. Akate Broiler Poultry Unit (100 Birds)"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-zinc-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Agricultural Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={pkgCategory}
                    onChange={e => setPkgCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl"
                  >
                    <option value="Poultry">Poultry</option>
                    <option value="Goat Farming">Goat Farming</option>
                    <option value="Cattle Farming">Cattle Farming</option>
                    <option value="Pig Farming">Pig Farming</option>
                    <option value="Fish Farming">Fish Farming</option>
                    <option value="Crop Farming">Crop Farming</option>
                    <option value="General Farm Care">General Farm Care</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Statutory Unit Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={pkgUnitCode}
                    onChange={e => setPkgUnitCode(e.target.value)}
                    placeholder="GH-UNIT-PLT-2025/081"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-zinc-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Sponsorship Price (GH₵) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={pkgPrice}
                    onChange={e => setPkgPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-emerald-300 rounded-xl font-black font-mono text-emerald-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Duration (Days) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="7"
                    value={pkgDuration}
                    onChange={e => setPkgDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Publish Status
                  </label>
                  <select
                    value={pkgStatus}
                    onChange={e => setPkgStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl"
                  >
                    <option value="active">Active (Published)</option>
                    <option value="inactive">Inactive (Draft)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Co-op Cluster</label>
                  <input
                    type="text"
                    value={pkgCluster}
                    onChange={e => setPkgCluster(e.target.value)}
                    placeholder="Afienya-Tema Agricultural Corridor"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Production Zone</label>
                  <input
                    type="text"
                    value={pkgZone}
                    onChange={e => setPkgZone(e.target.value)}
                    placeholder="Greater Accra Agro-Ecological Region"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={pkgDesc}
                  onChange={e => setPkgDesc(e.target.value)}
                  placeholder="Funds high-efficiency broiler chicks, starter crumbles, and veterinary protocol..."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Deed Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={pkgTerms}
                  onChange={e => setPkgTerms(e.target.value)}
                  placeholder="Track weekly weight gain curve. Harvest allocated upon completion..."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Package Photo URL</label>
                <input
                  type="url"
                  value={pkgImage}
                  onChange={e => setPkgImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-[11px]"
                />
                <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto text-[10px]">
                  <span className="text-zinc-400 font-bold">Image Presets:</span>
                  <button
                    type="button"
                    onClick={() => setPkgImage('https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80')}
                    className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 rounded text-zinc-700 cursor-pointer"
                  >
                    Poultry
                  </button>
                  <button
                    type="button"
                    onClick={() => setPkgImage('https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=600&q=80')}
                    className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 rounded text-zinc-700 cursor-pointer"
                  >
                    Goat
                  </button>
                  <button
                    type="button"
                    onClick={() => setPkgImage('https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80')}
                    className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 rounded text-zinc-700 cursor-pointer"
                  >
                    Fish
                  </button>
                  <button
                    type="button"
                    onClick={() => setPkgImage('https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80')}
                    className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 rounded text-zinc-700 cursor-pointer"
                  >
                    Crops/Cocoa
                  </button>
                </div>
              </div>

              {pkgFormError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{pkgFormError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowCreatePackage(false)}
                  className="px-4 py-2 font-bold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Publish Package</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Package Modal */}
      {editingPackage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-zinc-200 max-h-[90vh] flex flex-col">
            <div className="bg-zinc-950 text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
                    {editingPackage.statutoryUnitCode}
                  </span>
                  <h4 className="font-bold text-base text-white">Edit Package Specifications & Price</h4>
                </div>
              </div>
              <button 
                onClick={() => setEditingPackage(null)} 
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditPackageSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Package Name / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={pkgName}
                  onChange={e => setPkgName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-zinc-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Agricultural Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={pkgCategory}
                    onChange={e => setPkgCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl"
                  >
                    <option value="Poultry">Poultry</option>
                    <option value="Goat Farming">Goat Farming</option>
                    <option value="Cattle Farming">Cattle Farming</option>
                    <option value="Pig Farming">Pig Farming</option>
                    <option value="Fish Farming">Fish Farming</option>
                    <option value="Crop Farming">Crop Farming</option>
                    <option value="General Farm Care">General Farm Care</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Statutory Unit Code
                  </label>
                  <input
                    type="text"
                    value={pkgUnitCode}
                    onChange={e => setPkgUnitCode(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-zinc-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Sponsorship Price (GH₵) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={pkgPrice}
                    onChange={e => setPkgPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-amber-50 border-2 border-amber-400 rounded-xl font-black font-mono text-amber-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Duration (Days) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="7"
                    value={pkgDuration}
                    onChange={e => setPkgDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Publish Status
                  </label>
                  <select
                    value={pkgStatus}
                    onChange={e => setPkgStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl"
                  >
                    <option value="active">Active (Published)</option>
                    <option value="inactive">Inactive (Draft)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Co-op Cluster</label>
                  <input
                    type="text"
                    value={pkgCluster}
                    onChange={e => setPkgCluster(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Production Zone</label>
                  <input
                    type="text"
                    value={pkgZone}
                    onChange={e => setPkgZone(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={pkgDesc}
                  onChange={e => setPkgDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Deed Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={pkgTerms}
                  onChange={e => setPkgTerms(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Package Photo URL</label>
                <input
                  type="url"
                  value={pkgImage}
                  onChange={e => setPkgImage(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              {pkgFormError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{pkgFormError}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => {
                    handleDeletePackageConfirm(editingPackage);
                    setEditingPackage(null);
                  }}
                  className="px-3 py-2 text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Package</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPackage(null)}
                    className="px-4 py-2 font-bold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Package Confirmation Modal */}
      {deletePackageConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-rose-300">
            <div className="bg-rose-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-400" />
                <h4 className="font-bold text-sm text-white">Permanently Delete Package?</h4>
              </div>
              <button 
                onClick={() => setDeletePackageConfirm(null)} 
                className="text-rose-200 hover:text-white p-1 rounded-lg hover:bg-rose-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-zinc-700 leading-relaxed">
              <p>
                Are you sure you want to permanently delete package <strong>&ldquo;{deletePackageConfirm.name}&rdquo;</strong> (GH₵ {deletePackageConfirm.price.toFixed(2)})?
              </p>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs">
                This action will remove the package unit from the public investment catalog. Existing active outgrowers will complete their cycle normally.
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletePackageConfirm(null)}
                  className="py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = deletePackageConfirm.id;
                    setDeletePackageConfirm(null);
                    onDeletePackage(id);
                  }}
                  className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Package</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
