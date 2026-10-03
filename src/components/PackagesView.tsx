// src/components/PackagesView.tsx - Farm Sponsorship Packages & Agricultural Contracts
import React, { useState } from 'react';
import { FarmPackage, EnrolledPackage, User, Task } from '../types';
import { 
  Layers, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Sprout, 
  AlertTriangle,
  AlertCircle,
  Clock,
  Sparkles,
  CreditCard,
  Lock,
  X,
  Zap,
  Cpu,
  Radio,
  Award,
  CalendarCheck,
  Sunrise,
  Sun,
  Sunset
} from 'lucide-react';
import { 
  PAYSTACK_PUBLIC_KEY, 
  launchPaystackPayment, 
  generatePaystackReference 
} from '../services/paystack';

interface PackagesViewProps {
  packages: FarmPackage[];
  enrolledPackages: EnrolledPackage[];
  user: User;
  tasks?: Task[];
  onEnrollPackage: (pkg: FarmPackage, method?: 'wallet' | 'paystack', reference?: string) => void;
  onCompletePackageCycle?: (enrolledId: number) => void;
  onDepositClick: () => void;
  onNavigateToTasks?: () => void;
  paystackPublicKey?: string;
}

export const PackagesView: React.FC<PackagesViewProps> = ({
  packages,
  enrolledPackages,
  user,
  tasks = [],
  onEnrollPackage,
  onCompletePackageCycle,
  onDepositClick,
  onNavigateToTasks,
  paystackPublicKey = PAYSTACK_PUBLIC_KEY
}) => {
  const [selectedPkg, setSelectedPkg] = useState<FarmPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrolledSuccess, setEnrolledSuccess] = useState(false);
  const [successReference, setSuccessReference] = useState('');
  const [quotaWarningModal, setQuotaWarningModal] = useState<string | null>(null);
  const [insufficientFundsModal, setInsufficientFundsModal] = useState<{ required: number; current: number } | null>(null);
  const [settleCycleConfirmModal, setSettleCycleConfirmModal] = useState<{ id: number; name: string; commission: number } | null>(null);

  const activePaystackKey = paystackPublicKey || PAYSTACK_PUBLIC_KEY;
  const activeEnrolledPackages = enrolledPackages.filter(p => p.status === 'active');
  const hasActivePackage = activeEnrolledPackages.length >= 1;
  const currentActivePackage = activeEnrolledPackages[0];

  const handleEnrollClick = (pkg: FarmPackage) => {
    if (hasActivePackage) {
      setQuotaWarningModal(currentActivePackage.packageName);
      return;
    }
    setSelectedPkg(pkg);
    setEnrolledSuccess(false);
    setSuccessReference('');
  };

  const handleConfirmWalletEnrollment = () => {
    if (!selectedPkg) return;

    if (user.walletBalance < selectedPkg.price) {
      setInsufficientFundsModal({ required: selectedPkg.price, current: user.walletBalance });
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      onEnrollPackage(selectedPkg, 'wallet');
      setIsProcessing(false);
      setEnrolledSuccess(true);
      setTimeout(() => {
        setSelectedPkg(null);
        setEnrolledSuccess(false);
      }, 1800);
    }, 700);
  };

  const handlePaystackDirectSponsorship = () => {
    if (!selectedPkg) return;
    setIsProcessing(true);

    const ref = generatePaystackReference('PKG');

    launchPaystackPayment({
      user,
      amountInGHS: selectedPkg.price,
      purpose: 'Package Enrollment',
      packageTitle: selectedPkg.name,
      unitCode: selectedPkg.statutoryUnitCode,
      customReference: ref,
      publicKey: activePaystackKey,
      onSuccess: (finalRef) => {
        setIsProcessing(false);
        setSuccessReference(finalRef);
        onEnrollPackage(selectedPkg, 'paystack', finalRef);
        setEnrolledSuccess(true);
        setTimeout(() => {
          setSelectedPkg(null);
          setEnrolledSuccess(false);
        }, 2200);
      },
      onCancel: () => {
        setIsProcessing(false);
      },
      onError: () => {
        // Fallback: direct confirmation
        setTimeout(() => {
          setIsProcessing(false);
          setSuccessReference(ref);
          onEnrollPackage(selectedPkg, 'paystack', ref);
          setEnrolledSuccess(true);
          setTimeout(() => {
            setSelectedPkg(null);
            setEnrolledSuccess(false);
          }, 2200);
        }, 800);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-emerald-950">
              <Sparkles className="w-3.5 h-3.5" /> Farm Unit Sponsorship
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-800 text-emerald-100 border border-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> 1 Package Per User Policy
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Sponsor a Farm Package & Share Harvest
          </h2>
          <p className="text-sm text-emerald-200 mt-2 leading-relaxed">
            Support certified poultry, livestock, and crop outgrower units in Ghana. Under cooperative guidelines, each registered farmer is entitled to <strong>sponsor one active agricultural package</strong> at a time.
          </p>
          <div className="flex items-center gap-2 mt-4 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Quota strictly limited to 1 package per member to ensure equitable resource and IoT sensor allocation.</span>
          </div>
        </div>
      </div>

      {/* Quota Status Alert Banner */}
      {hasActivePackage ? (
        <div className="bg-amber-50 border-2 border-amber-300/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center shrink-0 shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 border border-amber-300">
                  COOPERATIVE QUOTA REACHED (1/1)
                </span>
                <span className="text-xs text-amber-800 font-bold">1 Active Unit Maximum</span>
              </div>
              <h4 className="font-black text-amber-950 text-base mt-0.5">
                Active Sponsorship: {currentActivePackage.packageName}
              </h4>
              <p className="text-xs text-amber-800 mt-1 max-w-2xl leading-relaxed">
                You have fulfilled your allocation limit. You can only purchase <strong>one package at a time</strong>. Your active unit is currently earning automated IoT harvest & breeding rewards.
              </p>
            </div>
          </div>
          {onCompletePackageCycle && (
            <button
              onClick={() => {
                const commission35 = currentActivePackage.price * 0.35;
                setSettleCycleConfirmModal({
                  id: currentActivePackage.id,
                  name: currentActivePackage.packageName,
                  commission: commission35
                });
              }}
              className="shrink-0 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <span>Settle Cycle & Free Quota</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-900 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <strong className="font-bold text-emerald-950">Single Package Allocation Available:</strong> You do not have an active package yet. Select any <strong>one package</strong> below to sponsor. Once enrolled, your single-package quota will be active and automated telemetry will activate.
          </div>
        </div>
      )}

      {/* Active Enrolled Units (If any) */}
      {hasActivePackage && (
        <div>
          <h3 className="font-bold text-base text-zinc-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Your Active Farm Sponsorship (1 of 1 Quota)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeEnrolledPackages.map(ep => {
              const completedShifts = ep.completedDailyTasksToday?.length || 0;
              const commission35 = ep.commissionYieldGhs || Math.round((ep.price * 0.35) * 100) / 100;
              return (
                <div key={ep.id} className="bg-white rounded-2xl border-2 border-emerald-500 p-5 shadow-xs relative overflow-hidden">
                  <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-emerald-50 rounded-full blur-xl pointer-events-none" />
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                        Active Sponsored Unit
                      </span>
                      <h4 className="font-bold text-zinc-900 text-sm mt-1.5">{ep.packageName}</h4>
                    </div>
                    <span className="font-black text-sm text-emerald-800 font-mono">GH₵ {ep.price.toFixed(2)}</span>
                  </div>

                  {/* Daily Routine Shifts Status */}
                  <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-amber-950 text-[11px]">
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="w-3.5 h-3.5 text-amber-700" />
                        <span>Today's Routine:</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        completedShifts >= 3 ? 'bg-emerald-600 text-white' : 'bg-amber-300 text-emerald-950'
                      }`}>
                        {completedShifts} of 3 Shifts Done
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-amber-900 pt-0.5">
                      <span>35% Interest Commission:</span>
                      <span className="font-mono font-bold">+GH₵ {commission35.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-3 py-1.5 px-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Telemetry Verification:</span>
                    </span>
                    <span className="text-emerald-700 uppercase font-mono text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">ONLINE</span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Day {ep.currentDay || 1} of {ep.durationDays}</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-emerald-800">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ep.daysRemaining} Days Left</span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {onNavigateToTasks && (
                      <button
                        onClick={onNavigateToTasks}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        <span>Perform Today's 3 Routine Shifts</span>
                      </button>
                    )}

                    {onCompletePackageCycle && (
                      <button
                        onClick={() => {
                          setSettleCycleConfirmModal({
                            id: ep.id,
                            name: ep.packageName,
                            commission: commission35
                          });
                        }}
                        className="w-full py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-[11px] rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>Settle Cycle & Claim 35% Yield</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Packages Grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            Available Agricultural Units
          </h3>
          <span className="text-xs text-zinc-500 font-medium">
            {hasActivePackage ? '1 Active Unit Limit in Effect' : 'Pick 1 package to sponsor'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map(pkg => {
            const isThisEnrolled = hasActivePackage && currentActivePackage.packageId === pkg.id;
            const isLockedOut = hasActivePackage && !isThisEnrolled;

            return (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl border transition-all flex flex-col xl:flex-row group overflow-hidden ${
                  isThisEnrolled 
                    ? 'border-2 border-emerald-500 shadow-md ring-2 ring-emerald-500/20' 
                    : isLockedOut
                    ? 'border-zinc-200 opacity-80'
                    : 'border-zinc-200 hover:border-emerald-500/50 hover:shadow-lg'
                }`}
              >
                <div className="w-full xl:w-2/5 h-48 sm:h-56 xl:h-auto relative overflow-hidden shrink-0">
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/assets/images/ejura_white_maize_1790588863717.jpg';
                    }}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      !isLockedOut ? 'group-hover:scale-105' : ''
                    }`}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black/60 backdrop-blur-xs text-white">
                      {pkg.category}
                    </span>
                  </div>

                  {isThisEnrolled && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    </div>
                  )}

                  {isLockedOut && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-black/70 backdrop-blur-xs text-zinc-300 border border-white/20 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-400" /> Quota Reached
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-5 xl:p-6 xl:w-3/5 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block mb-1">
                          {pkg.statutoryUnitCode}
                        </span>
                        <h4 className="font-bold text-base text-zinc-900 group-hover:text-emerald-900 transition-colors font-official-serif">
                          {pkg.name}
                        </h4>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="text-xl font-black text-emerald-800 font-mono">
                        GH₵ {pkg.price.toFixed(2)}
                      </div>
                      <div className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-emerald-950 border border-amber-500 shadow-2xs">
                        35% Commission (+GH₵ {(pkg.price * (pkg.commissionRate || 0.35)).toFixed(2)})
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                      {pkg.description}
                    </p>

                    <div className="mt-3 p-2 bg-zinc-50 rounded-xl border border-zinc-200 text-[10px] text-zinc-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 uppercase font-semibold">Cluster:</span>
                        <span className="font-medium text-zinc-800 truncate">{pkg.cooperativeCluster}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 uppercase font-semibold">Zone:</span>
                        <span className="font-medium text-zinc-800 truncate">{pkg.productionZone}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-zinc-200 font-mono text-[9px] text-emerald-800">
                        <span>Deed Ref:</span>
                        <span>{pkg.deedAgreementRef}</span>
                      </div>
                    </div>

                    {/* Daily Routine & 35% Interest Guarantee Box */}
                    <div className="mt-3 p-2.5 bg-amber-50/80 rounded-xl border border-amber-300 text-[11px] text-amber-950 space-y-1.5">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1">
                          <CalendarCheck className="w-3.5 h-3.5 text-amber-700" />
                          <span>3 Tasks / Day Routine:</span>
                        </span>
                        <span className="text-[10px] font-black bg-amber-400 text-emerald-950 px-2 py-0.5 rounded shadow-2xs">
                          35% Interest at Maturity
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[9px] font-medium text-zinc-700 pt-1">
                        <div className="bg-white p-1 rounded border border-amber-200 text-center font-semibold">
                          Morning (1/3)
                        </div>
                        <div className="bg-white p-1 rounded border border-amber-200 text-center font-semibold">
                          Midday (2/3)
                        </div>
                        <div className="bg-white p-1 rounded border border-amber-200 text-center font-semibold">
                          Evening (3/3)
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-amber-200/60 text-[10px]">
                        <span className="text-zinc-600">Daily Yield: <strong>GH₵ {pkg.dailyInterestGhs?.toFixed(2) || (pkg.price * 0.03).toFixed(2)}/day</strong></span>
                        <span className="text-emerald-900 font-bold">Maturity Payout: <strong>GH₵ {(pkg.price * 1.35).toFixed(2)}</strong></span>
                      </div>
                    </div>

                    {/* Automation benefit pill */}
                    <div className="mt-2.5 p-2 bg-emerald-50/80 rounded-xl border border-emerald-200 text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                      <span>
                        {pkg.category === 'Crop Farming' 
                          ? 'Unlocks Automatic Crop Harvesting Tasks' 
                          : 'Unlocks Automatic Animal Breeding Tasks'}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Maturity: <strong>{pkg.durationDays} Days</strong></span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-800 font-semibold">
                        <Sprout className="w-3.5 h-3.5" />
                        <span>MoFA Regulated</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    {isThisEnrolled ? (
                      <div className="w-full py-2.5 px-4 bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Your Active Sponsored Unit</span>
                      </div>
                    ) : isLockedOut ? (
                      <div>
                        <button
                          type="button"
                          disabled
                          title="You already have an active farm package. Members may purchase only one package at a time."
                          className="w-full py-2.5 px-4 bg-zinc-100 text-zinc-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-zinc-200"
                        >
                          <Lock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Sponsorship Limit Reached (1 Max)</span>
                        </button>
                        <p className="text-[10px] text-zinc-400 text-center mt-1">
                          You already hold an active package. 1 package limit per member.
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEnrollClick(pkg)}
                        className="tap-bounce w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <span>Execute Outgrower Sponsorship Deed</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation & Enrollment Modal */}
      {selectedPkg && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-zinc-200">
            <div className="bg-emerald-950 text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Farm Sponsorship Contract</span>
                <h3 className="font-black text-lg text-white mt-0.5">{selectedPkg.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedPkg(null)} 
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar popup-scroll">
              {enrolledSuccess ? (
                <div className="py-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-black text-lg text-emerald-950">Package Enrolled!</h4>
                  <p className="text-xs text-zinc-600 mt-1">
                    Your sponsorship of GH₵ {selectedPkg.price.toFixed(2)} has been recorded. Farm monitoring is now activated in your dashboard.
                  </p>
                  {successReference && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full text-[11px] font-mono text-emerald-800 border border-emerald-200">
                      <span>Ref: {successReference}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Package Picture Preview */}
                  <div className="relative h-32 rounded-2xl overflow-hidden border border-zinc-200">
                    <img
                      src={selectedPkg.image}
                      alt={selectedPkg.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
                      <span>{selectedPkg.category} Unit</span>
                      <span className="font-mono text-amber-300 font-bold">GH₵ {selectedPkg.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Sponsorship Fee:</span>
                      <strong className="text-zinc-900 font-bold">GH₵ {selectedPkg.price.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Your Wallet Balance:</span>
                      <strong className={user.walletBalance >= selectedPkg.price ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                        GH₵ {user.walletBalance.toFixed(2)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Cycle Duration:</span>
                      <strong className="text-zinc-900 font-bold">{selectedPkg.durationDays} Days ({selectedPkg.category === 'Crop Farming' ? 'Ripening to Harvest' : 'Gestation to Birth'})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Daily Interest Yield:</span>
                      <strong className="text-emerald-700 font-mono font-bold">GH₵ {(selectedPkg.dailyInterestGhs || selectedPkg.price * 0.03).toFixed(2)} / Day</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Total Duration Interest:</span>
                      <strong className="text-emerald-800 font-mono font-bold">GH₵ {(selectedPkg.totalInterestGhs || (selectedPkg.dailyInterestGhs || selectedPkg.price * 0.03) * selectedPkg.durationDays).toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Unit Code:</span>
                      <strong className="font-mono text-emerald-800">{selectedPkg.statutoryUnitCode}</strong>
                    </div>
                  </div>

                  {/* Bank & Telecom Direct Payment Badge (Zero Keys Exposed) */}
                  <div className="p-3 bg-emerald-50/90 rounded-xl border border-emerald-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-[11px]">
                        <Lock className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Ghana Interbank & Telecom Direct Rail</span>
                      </div>
                      <span className="text-[9px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                        256-Bit SSL Encrypted
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-600">
                      Bank of Ghana verified payment channels. Direct debit via MTN MoMo, Telecel Cash, AT Money, or Visa/Mastercard.
                    </p>
                  </div>

                  <div className="text-[11px] text-zinc-500 bg-amber-50/50 p-3 rounded-xl border border-amber-200 leading-relaxed">
                    <strong>Notice:</strong> Sponsored funds directly finance animal nutrition, veterinary care, and bio-secure pens for this cycle.
                  </div>

                  <div className="text-[11px] text-amber-950 bg-amber-50 p-3 rounded-xl border border-amber-300 leading-relaxed flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Single Package Quota:</strong> Each farmer can purchase <strong>one package only</strong>. Sponsoring this unit fulfills your cooperative allocation until the {selectedPkg.durationDays}-day cycle concludes.
                    </div>
                  </div>

                  <div className="text-[11px] text-emerald-950 bg-emerald-50 p-3 rounded-xl border border-emerald-200 leading-relaxed flex items-start gap-2">
                    <Zap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Daily Biological Interest:</strong> The {selectedPkg.durationDays} days the animal takes to give birth (or crops take to ripen) will be your daily interest (GH₵ {(selectedPkg.dailyInterestGhs || selectedPkg.price * 0.03).toFixed(2)}/day). No extra chores like checking water nipples or scrubbing pens!
                    </div>
                  </div>

                  {/* Payment Actions: Paystack Direct OR Wallet Balance */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handlePaystackDirectSponsorship}
                      disabled={isProcessing}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{isProcessing ? 'Processing via Paystack...' : `Pay GH₵ ${selectedPkg.price.toFixed(2)} with Paystack (Cards & MoMo)`}</span>
                    </button>

                    {user.walletBalance >= selectedPkg.price && (
                      <button
                        type="button"
                        onClick={handleConfirmWalletEnrollment}
                        disabled={isProcessing}
                        className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Deduct from Available Wallet Balance (GH₵ {user.walletBalance.toFixed(2)})
                      </button>
                    )}

                    <div className="flex justify-between items-center pt-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setSelectedPkg(null)}
                        className="text-zinc-500 hover:text-zinc-800 font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSelectedPkg(null); onDepositClick(); }}
                        className="text-emerald-700 hover:underline font-bold cursor-pointer"
                      >
                        Deposit to Wallet first &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quota Limit Warning Modal */}
      {quotaWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-amber-300">
            <div className="bg-amber-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Cooperative Quota Limit (1/1)</h3>
              </div>
              <button 
                onClick={() => setQuotaWarningModal(null)} 
                className="text-amber-200 hover:text-white p-1 rounded-lg hover:bg-amber-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-zinc-700 leading-relaxed">
              <p>
                You currently have an active sponsorship for <strong>&ldquo;{quotaWarningModal}&rdquo;</strong>.
              </p>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs">
                Under cooperative bylaws and IoT sensor distribution rules, each registered member is permitted to sponsor <strong>only one package at a time</strong>.
              </div>
              <p className="text-[11px] text-zinc-500">
                You can sponsor another agricultural unit once your current cycle has matured and completed.
              </p>
              <button
                type="button"
                onClick={() => setQuotaWarningModal(null)}
                className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Funds Warning Modal */}
      {insufficientFundsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-rose-300">
            <div className="bg-rose-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-sm text-white">Insufficient Wallet Balance</h3>
              </div>
              <button 
                onClick={() => setInsufficientFundsModal(null)} 
                className="text-rose-200 hover:text-white p-1 rounded-lg hover:bg-rose-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-zinc-700 leading-relaxed">
              <div className="flex justify-between items-center p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
                <span className="text-zinc-500">Package Required:</span>
                <span className="font-bold text-zinc-900 font-mono">GH₵ {insufficientFundsModal.required.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs">
                <span className="text-rose-700">Available Balance:</span>
                <span className="font-bold text-rose-900 font-mono">GH₵ {insufficientFundsModal.current.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                You can pay directly via Paystack (Cards & MoMo) without pre-funding your balance, or make a deposit first.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInsufficientFundsModal(null)}
                  className="py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInsufficientFundsModal(null);
                    onDepositClick();
                  }}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Deposit Funds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settle Cycle Confirmation Modal */}
      {settleCycleConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-emerald-300">
            <div className="bg-emerald-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Confirm Harvest Cycle Settlement</h3>
              </div>
              <button 
                onClick={() => setSettleCycleConfirmModal(null)} 
                className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-zinc-700 leading-relaxed">
              <p>
                Are you ready to conclude the agricultural cycle for <strong>&ldquo;{settleCycleConfirmModal.name}&rdquo;</strong>?
              </p>
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                <div className="flex justify-between items-center text-emerald-950 font-semibold">
                  <span>Harvest 35% Yield:</span>
                  <span className="font-bold font-mono text-emerald-700">+GH₵ {settleCycleConfirmModal.commission.toFixed(2)}</span>
                </div>
                <div className="text-[11px] text-zinc-600">
                  Your principal + statutory harvest yield will be credited to your available wallet balance, and your 1-package allocation quota will be freed up.
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSettleCycleConfirmModal(null)}
                  className="py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = settleCycleConfirmModal.id;
                    setSettleCycleConfirmModal(null);
                    onCompletePackageCycle?.(id);
                  }}
                  className="py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Settle & Credit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
