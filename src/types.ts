// src/types.ts - Animal Farm Ghana TypeScript Interfaces

export type TaskCategory = 
  | 'Poultry'
  | 'Goat Farming'
  | 'Cattle Farming'
  | 'Pig Farming'
  | 'Fish Farming'
  | 'Crop Farming'
  | 'General Farm Care';

export type TaskStatus = 'active' | 'inactive';
export type ProofType = 'both' | 'image_required' | 'text_only';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';
export type WithdrawalStatus = 'pending' | 'processing' | 'paid' | 'rejected';
export type PaymentGateway = 'paystack' | 'bitcoin';
export type TransactionType = 'Deposit' | 'Task Reward' | 'Referral Reward' | 'Package Enrollment' | 'Package Payout' | 'Withdrawal' | 'Admin Adjustment' | 'Refund';

export interface SupportChatMessage {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  text: string;
  time: string;
  ticketRef?: string;
}

export interface UserComplaintTicket {
  id: string;
  userId: number;
  userName: string;
  userPhone: string;
  district: string;
  category: 'Withdrawal & MoMo' | 'Task & Shift Verification' | 'Package & 35% Yield' | 'Farm Inspection' | 'General Complaint';
  priority: 'urgent' | 'standard';
  status: 'pending' | 'investigating' | 'replied' | 'resolved';
  subject: string;
  unreadByAdmin: boolean;
  unreadByUser: boolean;
  createdAt: string;
  updatedAt: string;
  messages: SupportChatMessage[];
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  walletBalance: number;
  pendingRewards: number;
  totalEarned: number;
  totalWithdrawn: number;
  referralCode: string;
  referredById: number | null;
  referralCount?: number;
  phoneVerified: boolean;
  emailVerified?: boolean;
  registrationMethod?: 'phone' | 'email' | 'both';
  membershipNumber: string;
  ghanaCardPin: string;
  district: string;
  status: 'active' | 'pending' | 'suspended';
  avatar?: string;
  password?: string;
  agriculturalFocus?: string;
  createdAt: string;
}

export interface Task {
  id: number;
  protocolCode: string;
  title: string;
  category: TaskCategory;
  reward: number; // In GHS
  description: string;
  instructions: string;
  regulatoryStandard: string;
  priorityLevel: 'Standard' | 'Statutory Inspection' | 'High Biosecurity';
  proofType: ProofType;
  estimatedTime: string;
  completedCount: number;
  maxCompletions: number;
  status: TaskStatus;
  image?: string;
  packageId?: number;
  packageName?: string;
  requiredPackagePrice?: number;
  isAutomated?: boolean;
  automationType?: 'crop_harvesting' | 'animal_breeding';
  autoYieldCycle?: string;
  autoTelemetrySource?: string;
  isDailyTask?: boolean;
  dailyShift?: 'morning' | 'midday' | 'evening';
  dailyOrder?: number;
}

export interface TaskSubmission {
  id: number;
  taskId: number;
  userId: number;
  userName: string;
  userPhone: string;
  taskTitle: string;
  protocolCode?: string;
  category: TaskCategory;
  rewardAmount: number;
  submissionText: string;
  proofFile?: string;
  status: SubmissionStatus;
  certificateNumber?: string;
  inspectorName?: string;
  verifiedCoordinates?: string;
  adminNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  isAutomated?: boolean;
  automationType?: 'crop_harvesting' | 'animal_breeding';
  linkedPackageName?: string;
}

export interface FarmPackage {
  id: number;
  statutoryUnitCode: string;
  name: string;
  category: TaskCategory;
  cycleType?: 'animal_birth' | 'crop_harvest';
  expectedBirthEvent?: string;
  cooperativeCluster: string;
  productionZone: string;
  deedAgreementRef: string;
  price: number; // GHS - starting from 75 cedis
  durationDays: number; // Days until animal gives birth or crop harvest (determines interest)
  dailyInterestRate?: number; // e.g. 0.03 (3% per day)
  dailyInterestGhs?: number; // e.g. GH₵ 2.50 / day
  totalInterestGhs?: number; // Total interest over gestation/growth period
  commissionRate?: number; // 0.35 (35% interest commission)
  commissionYieldGhs?: number; // e.g. 35% of price
  totalMaturityPayout?: number; // Principal + total interest / 35% commission
  requiredDailyTasksCount?: number; // Daily routine tasks required per day (e.g. 3 shifts: Morning, Midday, Evening)
  description: string;
  terms: string;
  image: string;
  status: 'active' | 'inactive';
}

export interface EnrolledPackage {
  id: number;
  packageId: number;
  userId: number;
  packageName: string;
  statutoryUnitCode: string;
  deedReference: string;
  cluster: string;
  price: number;
  enrolledAt: string;
  durationDays: number;
  currentDay: number;
  daysRemaining: number;
  cycleType: 'animal_birth' | 'crop_harvest';
  expectedBirthEvent: string;
  dailyInterestGhs: number;
  totalInterestEarned: number;
  commissionYieldGhs?: number;
  claimedInterestToday?: boolean;
  lastClaimDate?: string;
  status: 'active' | 'completed';
  completedDailyTasksToday?: number[];
  requiredDailyTasksCount?: number;
  cycleDaysCompleted?: number;
  totalInterestCommissionGhs?: number;
}

export interface WithdrawalRequest {
  id: number;
  userId: number;
  userName: string;
  userPhone: string;
  amount: number; // GHS
  method: 'MTN MoMo' | 'Telecel Cash' | 'AT Money' | 'Bitcoin';
  accountNumber: string;
  accountName: string;
  status: WithdrawalStatus;
  reference: string;
  txHash?: string;
  adminNotes?: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  userId: number;
  type: TransactionType;
  amount: number; // GHS
  description: string;
  reference?: string;
  gateway?: PaymentGateway;
  paystackKey?: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'task' | 'payment' | 'withdrawal' | 'system';
  read: boolean;
  createdAt: string;
}

export interface SystemSettings {
  minWithdrawal: number;
  maxWithdrawal: number;
  referralReward: number;
  requiredReferralsForFirstWithdrawal?: number;
  whatsappChannelUrl?: string;
  whatsappChannelName?: string;
  whatsappChannelEnabled?: boolean;
  smsActiveProvider: 'simulation' | 'hubysms' | 'mnotify';
  smsSenderId: string;
  hubysmsApiKey: string;
  mnotifyApiKey: string;
  paystackPublicKey: string;
  paystackSecretKey: string;
  paystackTestMode: boolean;
  bitcoinAddress: string;
  bitcoinXpub: string;
  bitcoinTestMode: boolean;
}

export interface SmsLog {
  id: number;
  phone: string;
  provider: string;
  message: string;
  status: 'delivered' | 'failed';
  createdAt: string;
}

export interface UserCallLog {
  id: string;
  userId: number;
  userName: string;
  userPhone: string;
  district: string;
  type: 'voice_call' | 'callback_request';
  status: 'ringing' | 'connected' | 'completed' | 'missed';
  timestamp: string;
  duration?: string;
  purpose?: string;
  adminNotes?: string;
}

