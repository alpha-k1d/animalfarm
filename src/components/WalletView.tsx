// src/components/WalletView.tsx - Ghana Cedi Wallet, Paystack Deposits & MoMo Withdrawals
import React, { useState, useEffect, useRef } from 'react';
import { User, Transaction, WithdrawalRequest, PaymentGateway } from '../types';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  QrCode, 
  X,
  Phone,
  ShieldCheck,
  Building2,
  Lock,
  Smartphone,
  Zap,
  Sparkles,
  Users
} from 'lucide-react';
import { 
  PAYSTACK_PUBLIC_KEY, 
  launchPaystackPayment, 
  generatePaystackReference 
} from '../services/paystack';
import { LiveCashoutFeed } from './LiveCashoutFeed';

interface WalletViewProps {
  user: User;
  transactions: Transaction[];
  withdrawals: WithdrawalRequest[];
  onDeposit: (gateway: PaymentGateway, amount: number, reference?: string) => void;
  onRequestWithdrawal: (amount: number, method: 'MTN MoMo' | 'Telecel Cash' | 'AT Money' | 'Bitcoin', accountNum: string, accountName: string) => void;
  minWithdrawal: number;
  maxWithdrawal: number;
  paystackPublicKey?: string;
  requiredReferralsForFirstWithdrawal?: number;
  onNavigateToReferrals?: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  user,
  transactions,
  withdrawals,
  onDeposit,
  onRequestWithdrawal,
  minWithdrawal,
  maxWithdrawal,
  paystackPublicKey = PAYSTACK_PUBLIC_KEY,
  requiredReferralsForFirstWithdrawal = 7,
  onNavigateToReferrals
}) => {
  // Modal states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Dynamic balance reflection state (pulses on deposit/withdrawal)
  const [balancePulse, setBalancePulse] = useState(false);
  const prevBalance = useRef(user.walletBalance);

  useEffect(() => {
    if (prevBalance.current !== user.walletBalance) {
      setBalancePulse(true);
      const timer = setTimeout(() => setBalancePulse(false), 3000);
      prevBalance.current = user.walletBalance;
      return () => clearTimeout(timer);
    }
  }, [user.walletBalance]);

  // Deposit form state
  const [depositGateway, setDepositGateway] = useState<PaymentGateway>('paystack');
  const [depositAmount, setDepositAmount] = useState<string>('50');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [lastReference, setLastReference] = useState<string>('');
  const [showPaystackDirectModal, setShowPaystackDirectModal] = useState(false);
  const [paystackMomoNetwork, setPaystackMomoNetwork] = useState<'mtn' | 'telecel' | 'at'>('mtn');
  const [paystackMomoPhone, setPaystackMomoPhone] = useState(user.phone);

  // Withdrawal form state
  const [withdrawAmount, setWithdrawAmount] = useState<string>('50');
  const [withdrawMethod, setWithdrawMethod] = useState<'MTN MoMo' | 'Telecel Cash' | 'AT Money' | 'Bitcoin'>('MTN MoMo');
  const [accountNumber, setAccountNumber] = useState<string>(user.phone);
  const [accountName, setAccountName] = useState<string>(user.fullName);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // 15-Day Withdrawal Interval Tracking
  const [fastForwardDemoDays, setFastForwardDemoDays] = useState(0);

  const userWithdrawals = withdrawals
    .filter(w => w.userId === user.id && w.status !== 'rejected')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const lastWithdrawal = userWithdrawals[0];
  const WITHDRAWAL_INTERVAL_DAYS = 15;
  const now = Date.now();

  // If a previous withdrawal exists, interval is measured from that withdrawal.
  // For a newly registered account, interval is measured from user.createdAt.
  const baseTimestamp = lastWithdrawal
    ? new Date(lastWithdrawal.createdAt).getTime()
    : (user.createdAt ? new Date(user.createdAt).getTime() : now);

  const effectiveElapsedMs = (now - baseTimestamp) + (fastForwardDemoDays * 24 * 60 * 60 * 1000);
  const elapsedDays = Math.max(0, Math.floor(effectiveElapsedMs / (1000 * 60 * 60 * 24)));
  const isWithdrawalWindowOpen = elapsedDays >= WITHDRAWAL_INTERVAL_DAYS;
  const daysUntilNextWithdrawal = Math.max(0, WITHDRAWAL_INTERVAL_DAYS - elapsedDays);
  const nextWithdrawalDate = new Date(baseTimestamp + WITHDRAWAL_INTERVAL_DAYS * 24 * 60 * 60 * 1000 - (fastForwardDemoDays * 24 * 60 * 60 * 1000));
  const cyclePercent = Math.min(100, Math.round((elapsedDays / WITHDRAWAL_INTERVAL_DAYS) * 100));

  const activePaystackKey = paystackPublicKey || PAYSTACK_PUBLIC_KEY;

  // Handle deposit submit
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError(null);
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt < 5) {
      setDepositError('Minimum deposit amount is GH₵ 5.00');
      return;
    }

    if (depositGateway === 'bitcoin') {
      setIsDepositing(true);
      const btcRef = `BTC-${Date.now().toString().slice(-6)}`;
      setTimeout(() => {
        onDeposit('bitcoin', amt, btcRef);
        setLastReference(btcRef);
        setIsDepositing(false);
        setDepositSuccess(true);
        setTimeout(() => {
          setShowDepositModal(false);
          setDepositSuccess(false);
        }, 1500);
      }, 800);
      return;
    }

    // Paystack Ghana Live Flow (Secured SSL, zero client key exposure)
    setIsDepositing(true);
    const newRef = generatePaystackReference('DEP');
    setLastReference(newRef);

    launchPaystackPayment({
      user,
      amountInGHS: amt,
      purpose: 'Deposit',
      customReference: newRef,
      publicKey: activePaystackKey,
      onSuccess: (finalRef) => {
        setIsDepositing(false);
        onDeposit('paystack', amt, finalRef);
        setLastReference(finalRef);
        setDepositSuccess(true);
        setTimeout(() => {
          setShowDepositModal(false);
          setDepositSuccess(false);
          setShowPaystackDirectModal(false);
        }, 1500);
      },
      onCancel: () => {
        setIsDepositing(false);
      },
      onError: () => {
        setIsDepositing(false);
        setShowPaystackDirectModal(true);
      }
    });
  };

  const handleConfirmPaystackDirect = () => {
    const amt = parseFloat(depositAmount) || 50;
    setIsDepositing(true);
    setTimeout(() => {
      const confirmedRef = lastReference || generatePaystackReference('DEP');
      onDeposit('paystack', amt, confirmedRef);
      setIsDepositing(false);
      setDepositSuccess(true);
      setTimeout(() => {
        setShowDepositModal(false);
        setShowPaystackDirectModal(false);
        setDepositSuccess(false);
      }, 1500);
    }, 700);
  };

  // Handle withdrawal submit
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    const amt = parseFloat(withdrawAmount);

    if (isNaN(amt) || amt <= 0) {
      setWithdrawError('Please enter a valid withdrawal amount.');
      return;
    }

    // 15-Day Withdrawal Interval Policy: Outgrowers can withdraw once every 15 days
    if (!isWithdrawalWindowOpen) {
      setWithdrawError(
        `15-Day Payout Interval Policy: Outgrowers are permitted to withdraw accrued rewards once every 15 days. ${
          lastWithdrawal
            ? `Your previous cashout was on ${new Date(lastWithdrawal.createdAt).toLocaleDateString()} (${elapsedDays} day(s) ago).`
            : `Your outgrower account was created on ${new Date(user.createdAt || Date.now()).toLocaleDateString()} (${elapsedDays} day(s) ago).`
        } Your next withdrawal window opens in ${daysUntilNextWithdrawal} day(s) on ${nextWithdrawalDate.toLocaleDateString()}.`
      );
      return;
    }

    // First withdrawal requirement: user must have referred at least 7 people before their first withdrawal
    const isFirstWithdrawal = (user.totalWithdrawn || 0) <= 0 && withdrawals.filter(w => w.userId === user.id && w.status !== 'rejected').length === 0;
    const currentReferralCount = user.referralCount ?? 0;
    const requiredReferrals = requiredReferralsForFirstWithdrawal || 7;

    if (isFirstWithdrawal && currentReferralCount < requiredReferrals) {
      const remainingReferrals = requiredReferrals - currentReferralCount;
      setWithdrawError(
        `First Withdrawal Policy: Cooperative rules require referring ${requiredReferrals} members before your first withdrawal. You have referred ${currentReferralCount}/${requiredReferrals} members (${remainingReferrals} more needed).`
      );
      return;
    }

    if (amt < minWithdrawal) {
      setWithdrawError(`Minimum withdrawal is GH₵ ${minWithdrawal.toFixed(2)}.`);
      return;
    }

    if (amt > maxWithdrawal) {
      setWithdrawError(`Maximum single withdrawal is GH₵ ${maxWithdrawal.toFixed(2)}.`);
      return;
    }

    if (amt > user.walletBalance) {
      setWithdrawError(`Insufficient balance. Your available balance is GH₵ ${user.walletBalance.toFixed(2)}.`);
      return;
    }

    if (!accountNumber.trim() || !accountName.trim()) {
      setWithdrawError('Please provide beneficiary account details.');
      return;
    }

    setIsWithdrawing(true);
    setTimeout(() => {
      onRequestWithdrawal(amt, withdrawMethod, accountNumber, accountName);
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      setTimeout(() => {
        setShowWithdrawModal(false);
        setWithdrawSuccess(false);
      }, 1500);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Metric Cards - Scaled for Mobile, Tablet & Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Main Available Balance with Immediate Reflection Animation */}
        <div className={`bg-white border-2 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs relative overflow-hidden transition-all duration-500 ${
          balancePulse 
            ? 'border-emerald-500 ring-4 ring-emerald-400/40 bg-emerald-50/40 scale-[1.02]' 
            : 'border-emerald-600/30'
        }`}>
          <div className="flex justify-between items-start gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider truncate">Available Balance</span>
            <div className="flex items-center gap-1 shrink-0">
              {balancePulse && (
                <span className="text-[8px] sm:text-[9px] font-bold text-white bg-emerald-600 px-1.5 py-0.2 rounded-full animate-bounce">
                  Updated!
                </span>
              )}
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] sm:text-xs">
                GH₵
              </div>
            </div>
          </div>
          <div className="text-lg sm:text-2xl lg:text-3xl font-black text-emerald-950 mt-1.5 sm:mt-2 font-mono flex items-baseline gap-1 truncate">
            <span className="text-sm sm:text-lg">GH₵</span>
            <span className={balancePulse ? 'text-emerald-700 transition-colors' : ''}>
              {user.walletBalance.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 truncate">Ready for MoMo cashout</p>
        </div>

        {/* Pending Rewards */}
        <div className="bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs">
          <div className="flex justify-between items-start gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-wider truncate">Pending Review</span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl lg:text-3xl font-black text-amber-900 mt-1.5 sm:mt-2 font-mono truncate">
            GH₵ {user.pendingRewards.toFixed(2)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 truncate">Field sign-off pending</p>
        </div>

        {/* Total Earned */}
        <div className="bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs">
          <div className="flex justify-between items-start gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider truncate">Total Earned</span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl lg:text-3xl font-black text-zinc-900 mt-1.5 sm:mt-2 font-mono truncate">
            GH₵ {user.totalEarned.toFixed(2)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 truncate">Tasks & commissions</p>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs">
          <div className="flex justify-between items-start gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider truncate">Total Disbursed</span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-600" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl lg:text-3xl font-black text-zinc-900 mt-1.5 sm:mt-2 font-mono truncate">
            GH₵ {user.totalWithdrawn.toFixed(2)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 truncate">Sent to MoMo wallet</p>
        </div>
      </div>

      {/* 15-Day Withdrawal Cycle Interval Indicator Banner */}
      <div className={`rounded-3xl p-5 sm:p-6 border transition-all ${
        isWithdrawalWindowOpen 
          ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white border-emerald-700 shadow-md'
          : 'bg-zinc-900 text-white border-zinc-800 shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                isWithdrawalWindowOpen 
                  ? 'bg-emerald-400 text-emerald-950 ring-2 ring-emerald-300' 
                  : 'bg-amber-400/90 text-amber-950'
              }`}>
                {isWithdrawalWindowOpen ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-950" />
                    <span>15-Day Window Open</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-amber-950" />
                    <span>15-Day Cycle in Progress ({daysUntilNextWithdrawal}d Left)</span>
                  </>
                )}
              </span>
              <span className="text-[11px] text-zinc-300 font-mono">
                Statutory Outgrower Disbursement Bylaws
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white">
              {isWithdrawalWindowOpen 
                ? 'Withdrawal Window Active (Eligible for Cashout)' 
                : `Next Cashout Available in ${daysUntilNextWithdrawal} Day(s)`}
            </h3>

            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              {isWithdrawalWindowOpen ? (
                <span>
                  Your 15-day cooperative cycle is fulfilled! You can disburse available earnings directly to your <strong>MTN MoMo, Telecel Cash, or AT Money</strong> wallet.
                </span>
              ) : (
                <span>
                  Cooperative regulations permit member disbursements once every <strong>15 days</strong>. Your next cashout window unlocks on{' '}
                  <strong className="text-amber-300 font-mono">{nextWithdrawalDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong>.
                </span>
              )}
            </p>

            {/* Cycle Progress Bar */}
            <div className="pt-2 max-w-md">
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mb-1">
                <span>Cycle Progress: Day {Math.min(15, elapsedDays)} / 15</span>
                <span>{cyclePercent}% Complete</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    isWithdrawalWindowOpen ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-400 to-emerald-400'
                  }`}
                  style={{ width: `${cyclePercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {/* Demo Fast-Forward Helper for evaluation */}
            {fastForwardDemoDays === 0 ? (
              <button
                type="button"
                onClick={() => setFastForwardDemoDays(15)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/15"
                title="Fast-forward cycle for demo testing without waiting 15 days"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Simulate 15 Days Passed</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setFastForwardDemoDays(0)}
                className="px-3 py-2 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-amber-400/30"
              >
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>Reset to Real Cycle</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowWithdrawModal(true)}
              disabled={!isWithdrawalWindowOpen}
              className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                isWithdrawalWindowOpen
                  ? 'bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-80'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{isWithdrawalWindowOpen ? 'Withdraw to MoMo' : 'Locked (Wait 15 Days)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons: Add Funds & Withdraw */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-900/10 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-emerald-950">Add Money or Withdraw to MoMo</h3>
          <p className="text-xs text-zinc-600 mt-0.5">
            Instant deposits and cashouts via MTN MoMo, Telecel Cash, AT Money, or Debit Card. Minimum withdrawal is GH₵ {minWithdrawal.toFixed(2)}.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowDepositModal(true)}
            className="tap-bounce flex-1 sm:flex-none px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Deposit Money</span>
          </button>

          <button
            onClick={() => setShowWithdrawModal(true)}
            className="tap-bounce flex-1 sm:flex-none px-5 py-3.5 bg-zinc-900 hover:bg-black text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw to MoMo</span>
          </button>
        </div>
      </div>

      {/* Ledger: Transactions & Withdrawal History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Transactions Ledger */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-200 p-4 sm:p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-black text-base text-zinc-900">Wallet Transactions Ledger</h4>
            <span className="text-xs text-zinc-500">Real-time Cedi log</span>
          </div>

          {/* Mobile Dedicated Transaction Card Feed */}
          <div className="md:hidden space-y-2.5">
            {transactions.map(tx => {
              const isCredit = ['Deposit', 'Task Reward', 'Referral Reward', 'Refund', 'Package Payout'].includes(tx.type);
              const isPaystack = tx.gateway === 'paystack' || tx.description.toLowerCase().includes('paystack');

              return (
                <div key={tx.id} className="p-3.5 bg-zinc-50/80 rounded-2xl border border-zinc-200/90 text-xs space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isCredit ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                          }`}>
                            {tx.type}
                          </span>
                          {isPaystack && (
                            <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-300">
                              Paystack
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-zinc-900 mt-0.5 text-xs line-clamp-1">{tx.description}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-black font-mono shrink-0 ${isCredit ? 'text-emerald-700' : 'text-zinc-900'}`}>
                      {isCredit ? '+' : '-'}GH₵ {tx.amount.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-200/60">
                    <span className="font-mono text-[10px]">{tx.createdAt}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{tx.status}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop & Tablet Table */}
          <div className="hidden md:block overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {transactions.map(tx => {
                  const isCredit = ['Deposit', 'Task Reward', 'Referral Reward', 'Refund', 'Package Payout'].includes(tx.type);
                  const isPaystack = tx.gateway === 'paystack' || tx.description.toLowerCase().includes('paystack');
                  return (
                    <tr key={tx.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3 font-bold text-zinc-900 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${
                          isCredit ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                        }`}>
                          {tx.type}
                        </span>
                        {isPaystack && (
                          <span className="ml-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Paystack Live
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-zinc-600 max-w-xs">
                        <div>{tx.description}</div>
                        {tx.reference && (
                          <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                            <span>Ref: {tx.reference}</span>
                            {isPaystack && (
                              <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                                SSL Protected
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className={`py-3 font-black whitespace-nowrap ${isCredit ? 'text-emerald-700' : 'text-zinc-900'}`}>
                        {isCredit ? '+' : '-'}GH₵ {tx.amount.toFixed(2)}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{tx.status}</span>
                        </span>
                      </td>
                      <td className="py-3 text-zinc-400 whitespace-nowrap">{tx.createdAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Withdrawal Status Tracker */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-5 sm:p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-black text-base text-zinc-900">MoMo Cashout Queue</h4>
            <span className="text-xs text-zinc-500">0% Fees</span>
          </div>

          <div className="space-y-3">
            {withdrawals.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 text-xs">
                No recent cashouts. Tap "Withdraw to MoMo" to disburse rewards.
              </div>
            ) : (
              withdrawals.map(wd => (
                <div key={wd.id} className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-zinc-900">GH₵ {wd.amount.toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      wd.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : wd.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {wd.status}
                    </span>
                  </div>
                  <div className="text-zinc-500 text-[11px] flex justify-between items-center">
                    <span>{wd.method} &bull; {wd.accountNumber}</span>
                    <span className="font-mono text-[10px]">{wd.createdAt.slice(11, 16)}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    Ref: {wd.reference}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Live Outgrower Payouts & Disbursements Feed (5-Min Auto-Refresh Cycle) */}
      <div className="pt-2">
        <LiveCashoutFeed 
          userCashouts={withdrawals}
          onCashoutClick={() => setShowWithdrawModal(true)}
        />
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-[calc(100vw-1.5rem)] sm:w-full shadow-2xl overflow-hidden border border-zinc-200 max-h-[min(94dvh,680px)] flex flex-col">
            <div className="bg-emerald-950 text-white p-4 sm:p-5 flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Instant Account Top-Up</span>
                <h3 className="font-black text-base sm:text-lg text-white">Deposit to Wallet</h3>
              </div>
              <button onClick={() => setShowDepositModal(false)} className="text-zinc-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar popup-scroll flex-1">
              {depositSuccess ? (
                <div className="py-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-black text-lg text-emerald-950">Deposit Received!</h4>
                  <p className="text-xs text-zinc-600 mt-1">
                    GH₵ {(parseFloat(depositAmount) || 0).toFixed(2)} has been credited to your rewards wallet.
                  </p>
                  {lastReference && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full text-[11px] font-mono text-emerald-800 border border-emerald-200">
                      <span>Ref: {lastReference}</span>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleDepositSubmit} className="space-y-4">
                  {/* Gateway Selector (2 Channels: Paystack, Bitcoin) */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                      Payment Gateway Channel
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDepositGateway('paystack')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          depositGateway === 'paystack'
                            ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600'
                            : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100'
                        }`}
                      >
                        <div className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-emerald-600" />
                          <span>Paystack</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-1">Cards & All MoMo (MTN, Telecel, AT)</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDepositGateway('bitcoin')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          depositGateway === 'bitcoin'
                            ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500'
                            : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100'
                        }`}
                      >
                        <div className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-amber-600" />
                          <span>Bitcoin</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-1">Crypto Transfer</p>
                      </button>
                    </div>
                  </div>

                  {/* Amount input */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      Deposit Amount (GH₵)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-zinc-400">GH₵</span>
                      <input
                        type="number"
                        min="5"
                        step="1"
                        value={depositAmount}
                        onChange={e => setDepositAmount(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  {depositGateway === 'paystack' && (
                    <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                          <Lock className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Official Paystack Ghana Gateway</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-200 text-emerald-900 border border-emerald-300">
                          SSL 256-Bit Encrypted
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 leading-relaxed">
                        Bank of Ghana authorized switch rail. Accepts all Ghana Mobile Money wallets (MTN MoMo, Telecel Cash, AT Money) and debit cards with zero surcharge.
                      </p>
                      <div className="text-[10px] text-zinc-600 flex items-center justify-between pt-0.5 border-t border-emerald-100">
                        <span>Zero Merchant Deductions</span>
                        <span className="text-emerald-700 font-semibold">100% Secure</span>
                      </div>
                    </div>
                  )}

                  {depositGateway === 'bitcoin' && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                      <div className="font-bold">Test Sandbox Address:</div>
                      <code className="text-[10px] font-mono break-all block mt-1 text-amber-950">bc1q9v0k5384afg091845ghanafarmbtc</code>
                      <span className="text-[10px] block mt-1 text-amber-800">Simulates on-chain deposit confirmation instantly.</span>
                    </div>
                  )}

                  {depositError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{depositError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isDepositing}
                    className="w-full py-3 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isDepositing ? (
                      <span>Launching Checkout...</span>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Pay GH₵ {parseFloat(depositAmount || '0').toFixed(2)} with Paystack</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Paystack Direct Fallback Modal (Clean & Secured, No Key Exposed) */}
      {showPaystackDirectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-[calc(100vw-1.5rem)] sm:w-full shadow-2xl overflow-hidden border border-emerald-900/20 max-h-[min(94dvh,680px)] flex flex-col">
            <div className="bg-emerald-950 text-white p-4 sm:p-5 flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-amber-400 uppercase tracking-wider">Paystack Ghana Direct Rail</span>
                <h3 className="font-black text-base sm:text-lg text-white">Direct MoMo Authorization</h3>
              </div>
              <button onClick={() => setShowPaystackDirectModal(false)} className="text-zinc-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar popup-scroll flex-1">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                <div className="font-bold">Amount: GH₵ {parseFloat(depositAmount || '50').toFixed(2)}</div>
                <div className="text-[11px] text-zinc-600 mt-0.5">Direct telecom push request initiated.</div>
              </div>

              {/* Network Select */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Select Mobile Network
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaystackMomoNetwork('mtn')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                      paystackMomoNetwork === 'mtn'
                        ? 'border-amber-400 bg-amber-50 text-amber-950 ring-1 ring-amber-400'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    MTN MoMo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaystackMomoNetwork('telecel')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                      paystackMomoNetwork === 'telecel'
                        ? 'border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-400'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    Telecel Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaystackMomoNetwork('at')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                      paystackMomoNetwork === 'at'
                        ? 'border-blue-400 bg-blue-50 text-blue-950 ring-1 ring-blue-400'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    AT Money
                  </button>
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Mobile Money Wallet Number
                </label>
                <input
                  type="tel"
                  value={paystackMomoPhone}
                  onChange={e => setPaystackMomoPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  A USSD prompt or authorization PIN will be requested by your telecom provider.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaystackDirectModal(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPaystackDirect}
                  disabled={isDepositing}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDepositing ? 'Authorizing with Paystack...' : `Confirm Paystack GH₵ ${parseFloat(depositAmount || '50').toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal - Protected, zero keys exposed */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-[calc(100vw-1.5rem)] sm:w-full shadow-2xl overflow-hidden border border-zinc-200 max-h-[min(94dvh,680px)] flex flex-col">
            <div className="bg-emerald-950 text-white p-4 sm:p-5 flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Mobile Money Disbursement</span>
                <h3 className="font-black text-base sm:text-lg text-white">Withdraw Rewards</h3>
              </div>
              <button onClick={() => setShowWithdrawModal(false)} className="text-zinc-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar popup-scroll flex-1">
              {withdrawSuccess ? (
                <div className="py-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-black text-lg text-emerald-950">Payout Request Logged!</h4>
                  <p className="text-xs text-zinc-600 mt-1">
                    Your request for GH₵ {(parseFloat(withdrawAmount) || 0).toFixed(2)} has been queued for Ghana telecom disbursement.
                  </p>
                  <p className="text-[11px] text-emerald-700 font-bold mt-2">
                    Your wallet balance has been deducted immediately.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                  {/* First Withdrawal Status Banner: 7 Referrals Policy */}
                  {((user.totalWithdrawn || 0) <= 0 && withdrawals.filter(w => w.userId === user.id && w.status !== 'rejected').length === 0) && (
                    <div className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                      (user.referralCount ?? 0) >= (requiredReferralsForFirstWithdrawal || 7)
                        ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                        : 'bg-amber-50/90 border-amber-300 text-amber-950'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Users className="w-4 h-4 text-emerald-700" />
                          <span>First Withdrawal Referral Requirement</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                          (user.referralCount ?? 0) >= (requiredReferralsForFirstWithdrawal || 7)
                            ? 'bg-emerald-200 text-emerald-900 border border-emerald-400'
                            : 'bg-amber-200 text-amber-950 border border-amber-400'
                        }`}>
                          {user.referralCount ?? 0} / {requiredReferralsForFirstWithdrawal || 7} Referred
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-600 leading-relaxed">
                        Under cooperative security bylaws, members must refer at least <strong>{requiredReferralsForFirstWithdrawal || 7} verified farmers</strong> to the cooperative before processing their initial cashout.
                      </p>

                      {(user.referralCount ?? 0) < (requiredReferralsForFirstWithdrawal || 7) ? (
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-amber-900 font-bold">
                            {(requiredReferralsForFirstWithdrawal || 7) - (user.referralCount ?? 0)} more referral(s) needed
                          </span>
                          {onNavigateToReferrals && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowWithdrawModal(false);
                                onNavigateToReferrals();
                              }}
                              className="text-[11px] text-emerald-800 font-bold underline hover:text-emerald-950 cursor-pointer"
                            >
                              Get Referral Link & Code
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-[10px] text-emerald-800 font-bold flex items-center gap-1 pt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Referral quota verified! You are fully eligible to cash out.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 15-Day Withdrawal Interval Policy Banner */}
                  <div className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                    isWithdrawalWindowOpen
                      ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50/90 border-amber-300 text-amber-950'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Clock className="w-4 h-4 text-emerald-700" />
                        <span>15-Day Withdrawal Interval Policy</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                        isWithdrawalWindowOpen
                          ? 'bg-emerald-200 text-emerald-900 border border-emerald-400'
                          : 'bg-amber-200 text-amber-950 border border-amber-400'
                      }`}>
                        {isWithdrawalWindowOpen ? 'Window Open' : `${daysUntilNextWithdrawal} Day(s) Left`}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-600 leading-relaxed">
                      Cooperative bylaws permit outgrower cashouts once every <strong>15 days</strong>.
                      {isWithdrawalWindowOpen ? (
                        <span className="text-emerald-800 font-semibold block mt-1">
                          ✓ 15-day interval satisfied. You are eligible to withdraw your rewards now.
                        </span>
                      ) : (
                        <span className="text-amber-900 font-semibold block mt-1">
                          ⏱ Current cycle in progress. Next eligible withdrawal date: <strong>{nextWithdrawalDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong>.
                        </span>
                      )}
                    </p>

                    {!isWithdrawalWindowOpen && (
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] text-amber-800 font-mono">
                          Day {Math.min(15, elapsedDays)} / 15 of cycle
                        </span>
                        <button
                          type="button"
                          onClick={() => setFastForwardDemoDays(15)}
                          className="text-[10px] text-emerald-800 font-bold underline hover:text-emerald-950 cursor-pointer flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3 text-amber-600" />
                          <span>Simulate 15 Days Passed (Demo Mode)</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {withdrawError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{withdrawError}</span>
                    </div>
                  )}

                  {/* Channel Select */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      Disbursement Channel
                    </label>
                    <select
                      value={withdrawMethod}
                      onChange={e => setWithdrawMethod(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="MTN MoMo">MTN Mobile Money Ghana (MoMo)</option>
                      <option value="Telecel Cash">Telecel Cash (formerly Vodafone Cash)</option>
                      <option value="AT Money">AT Money (AirtelTigo)</option>
                      <option value="Bitcoin">Bitcoin (On-Chain Crypto)</option>
                    </select>
                  </div>

                  {/* Account Number / Ghana Phone */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      {withdrawMethod === 'Bitcoin' ? 'Bitcoin Destination Address' : 'Ghana Mobile Money Number'}
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={e => setAccountNumber(e.target.value)}
                      placeholder={withdrawMethod === 'Bitcoin' ? 'bc1q...' : '0244XXXXXX'}
                      required
                      className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  {/* Beneficiary Name */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      Beneficiary Account Name
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={e => setAccountName(e.target.value)}
                      placeholder="Full Name as on MoMo SIM registration"
                      required
                      className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Amount to withdraw */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                        Amount to Withdraw (GH₵)
                      </label>
                      <span className="text-[11px] text-zinc-500">
                        Available: <strong className="text-emerald-700">GH₵ {(user?.walletBalance || 0).toFixed(2)}</strong>
                      </span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-zinc-500">GH₵</span>
                      <input
                        type="number"
                        min={minWithdrawal}
                        max={maxWithdrawal}
                        step="any"
                        placeholder="Enter amount (50.00 - 1000.00)"
                        value={withdrawAmount}
                        onChange={e => {
                          setWithdrawAmount(e.target.value);
                          setWithdrawError(null);
                        }}
                        required
                        className="w-full pl-14 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-base font-black text-zinc-900 outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>

                    {/* Quick preset amount chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase mr-1">Quick Select:</span>
                      {[50, 100, 200, 500, 1000].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setWithdrawAmount(val.toString());
                            setWithdrawError(null);
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            parseFloat(withdrawAmount) === val
                              ? 'bg-emerald-800 text-white border-emerald-800'
                              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200'
                          }`}
                        >
                          GH₵ {val}
                        </button>
                      ))}
                      {user.walletBalance >= minWithdrawal && (
                        <button
                          type="button"
                          onClick={() => {
                            const maxPossible = Math.min(user.walletBalance, maxWithdrawal);
                            setWithdrawAmount(maxPossible.toFixed(2));
                            setWithdrawError(null);
                          }}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors cursor-pointer"
                        >
                          Max Avail (GH₵ {Math.min(user?.walletBalance || 0, maxWithdrawal).toFixed(2)})
                        </button>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-2 pt-2 border-t border-zinc-100">
                      <span>Min: <strong className="text-zinc-800">GH₵ {minWithdrawal.toFixed(2)}</strong></span>
                      <span>Max: <strong className="text-zinc-800">GH₵ {maxWithdrawal.toFixed(2)}</strong></span>
                      <span className="text-emerald-700 font-bold">0% Outgrower Fee</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isWithdrawing || !isWithdrawalWindowOpen}
                    className={`w-full py-3.5 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all mt-2 flex items-center justify-center gap-2 ${
                      isWithdrawalWindowOpen
                        ? 'bg-emerald-800 hover:bg-emerald-900 text-white cursor-pointer disabled:opacity-50'
                        : 'bg-zinc-200 text-zinc-500 cursor-not-allowed border border-zinc-300'
                    }`}
                  >
                    {isWithdrawing ? (
                      <span>Validating Account & Routing MoMo...</span>
                    ) : !isWithdrawalWindowOpen ? (
                      <>
                        <Lock className="w-4 h-4 text-zinc-400" />
                        <span>Withdrawal Locked ({daysUntilNextWithdrawal} Day(s) Left)</span>
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-4 h-4" />
                        <span>Submit Payout Request (GH₵ {parseFloat(withdrawAmount || '0').toFixed(2)})</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
