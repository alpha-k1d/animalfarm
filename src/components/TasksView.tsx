// src/components/TasksView.tsx - Agricultural Task Directory & Automated Farming Engine
import React, { useState, useEffect } from 'react';
import { Task, TaskCategory, ProofType, EnrolledPackage, FarmPackage } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  Camera, 
  FileText, 
  Search, 
  Filter, 
  UploadCloud, 
  AlertCircle,
  X,
  ChevronRight,
  Info,
  Layers,
  Zap,
  Cpu,
  Radio,
  Activity,
  Sparkles,
  ShieldCheck,
  Lock,
  RefreshCw,
  Play,
  Eye,
  Sun,
  Sunrise,
  Sunset,
  CalendarCheck,
  Award,
  TrendingUp
} from 'lucide-react';
import { GhanaFlag } from './GhanaFlag';

interface TasksViewProps {
  tasks: Task[];
  onSubmitTask: (taskId: number, text: string, proofUrl: string) => void;
  onAutoHarvestTask?: (task: Task, notes?: string) => void;
  onAutoHarvestAll?: () => void;
  onClaimDailyInterest?: (enrolledId: number) => void;
  onAdvanceGestationDay?: (enrolledId: number) => void;
  onCompleteDailyTasksBatch?: (enrolledId: number) => void;
  onCompletePackageCycle?: (enrolledId: number) => void;
  enrolledPackages?: EnrolledPackage[];
  farmPackages?: FarmPackage[];
  userPhoneVerified: boolean;
  onVerifyPhoneClick: () => void;
  onNavigateToPackages?: () => void;
}

type FilterCategory = 'All' | 'Daily Routine (3/Day)' | 'Animal Birth Interest' | 'Crop Harvest Interest' | 'Poultry' | 'Goat Farming' | 'Cattle Farming' | 'Pig Farming' | 'Fish Farming' | 'Crop Farming';

const CATEGORIES: FilterCategory[] = [
  'All',
  'Daily Routine (3/Day)',
  'Animal Birth Interest',
  'Crop Harvest Interest',
  'Poultry',
  'Goat Farming',
  'Cattle Farming',
  'Pig Farming',
  'Fish Farming',
  'Crop Farming'
];

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onSubmitTask,
  onAutoHarvestTask,
  onAutoHarvestAll,
  onClaimDailyInterest,
  onAdvanceGestationDay,
  onCompleteDailyTasksBatch,
  onCompletePackageCycle,
  enrolledPackages = [],
  farmPackages = [],
  userPhoneVerified,
  onVerifyPhoneClick,
  onNavigateToPackages
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeManualTask, setActiveManualTask] = useState<Task | null>(null);
  const [activeAutoTask, setActiveAutoTask] = useState<Task | null>(null);

  // Manual Submission modal state
  const [submissionText, setSubmissionText] = useState('');
  const [proofFileUrl, setProofFileUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Automated Execution modal state
  const [isExecutingAuto, setIsExecutingAuto] = useState(false);
  const [autoSuccess, setAutoSuccess] = useState(false);
  const [batchCycleProgress, setBatchCycleProgress] = useState(0);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [telemetryPulse, setTelemetryPulse] = useState(38);

  const hasPurchasedPackage = enrolledPackages.length > 0;

  // Simulate automated telemetry ticker countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryPulse(prev => (prev > 1 ? prev - 1 : 45));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredTasks = tasks.filter(t => {
    let matchesCat = true;
    if (selectedCategory === 'All') {
      matchesCat = true;
    } else if (selectedCategory === 'Daily Routine (3/Day)') {
      matchesCat = !!t.isDailyTask;
    } else if (selectedCategory === 'Animal Birth Interest') {
      matchesCat = t.automationType === 'animal_breeding' || t.category !== 'Crop Farming';
    } else if (selectedCategory === 'Crop Harvest Interest') {
      matchesCat = t.automationType === 'crop_harvesting' || t.category === 'Crop Farming';
    } else {
      matchesCat = t.category === selectedCategory;
    }

    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.protocolCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch && t.status === 'active';
  });

  const handleOpenManualModal = (task: Task) => {
    setActiveManualTask(task);
    setSubmissionText('');
    setProofFileUrl('');
    setSubmittedSuccess(false);
  };

  const handleOpenAutoModal = (task: Task) => {
    setActiveAutoTask(task);
    setAutoSuccess(false);
    setIsExecutingAuto(false);
  };

  const handleInstantQuickComplete = (task: Task) => {
    if (!userPhoneVerified) {
      onVerifyPhoneClick();
      return;
    }
    const defaultText = `Verified: ${task.title} checked and confirmed in good order.`;
    const defaultPhoto = task.image || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80';
    onSubmitTask(task.id, defaultText, defaultPhoto);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeManualTask) return;

    const notesToSubmit = submissionText.trim() || `Verified: ${activeManualTask.title} check completed in good order.`;
    const photoToSubmit = proofFileUrl || activeManualTask.image || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80';

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitTask(activeManualTask.id, notesToSubmit, photoToSubmit);
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setTimeout(() => {
        setActiveManualTask(null);
        setSubmittedSuccess(false);
      }, 1600);
    }, 500);
  };

  const handleConfirmAutoExecution = () => {
    if (!activeAutoTask || !onAutoHarvestTask) return;
    setIsExecutingAuto(true);

    setTimeout(() => {
      const isCrop = activeAutoTask.automationType === 'crop_harvesting' || activeAutoTask.category === 'Crop Farming';
      const autoNote = `Automated ${isCrop ? 'Crop Harvest Yield' : 'Animal Breeding Cycle'} verified by MoFA IoT Drone & Telemetry Station. Protocol ${activeAutoTask.protocolCode} satisfied autonomously.`;
      
      onAutoHarvestTask(activeAutoTask, autoNote);
      setIsExecutingAuto(false);
      setAutoSuccess(true);
      setTimeout(() => {
        setActiveAutoTask(null);
        setAutoSuccess(false);
      }, 1800);
    }, 1000);
  };

  const handleTriggerBatchCycle = () => {
    if (!onAutoHarvestAll) return;
    setIsBatchRunning(true);
    setBatchCycleProgress(15);

    setTimeout(() => setBatchCycleProgress(55), 500);
    setTimeout(() => setBatchCycleProgress(90), 1000);
    setTimeout(() => {
      setBatchCycleProgress(100);
      onAutoHarvestAll();
      setIsBatchRunning(false);
      setTimeout(() => setBatchCycleProgress(0), 1200);
    }, 1400);
  };

  // Preset quick answers to make manual tasks effortless
  const quickObservationPresets: Record<string, string[]> = {
    'Poultry': [
      'Broiler breeding and egg incubation cycle inspected. Hatching progress on track with optimal nest temperature.',
      'Poultry incubation cycle verified. Daily chick development and birth interest logged.',
      'Brooder ambient heat verified. Flock vigor and daily breeding progress confirmed.'
    ],
    'Fish Farming': [
      'Tilapia spawning pond monitored. Fingerling breeding activity active and normal.',
      'Fingerling broodstock verified. Water aeration optimal for breeding yield.',
      'Hatchery nursery water quality inspected. Healthy spawn development verified.'
    ],
    'Goat Farming': [
      'Sahelian doe gestation monitored. Fetal health verified for scheduled kidding event.',
      'Goat breeding paddock inspected. Nutrition and kidding preparation verified.',
      'Doe herd gestation checked. Vital signs healthy and daily birth interest recorded.'
    ],
    'Cattle Farming': [
      'Gudali cow gestation ultrasound telemetry logged. Healthy calf development verified.',
      'Calving paddock preparation checked. Vital indicators normal for scheduled birth event.'
    ],
    'Pig Farming': [
      'Large White sow gestation monitored. Ultrasound confirms healthy litter development.',
      'Farrowing pen climate and sow gestation verified for scheduled birth event.'
    ],
    'Crop Farming': [
      'Grain kernel moisture and cob ripening inspected. Maturation cycle on track.',
      'Paddy grain filling stage verified. Yield maturity cycle on schedule.'
    ],
    'default': [
      'Gestation and ripening cycle inspected. Development is normal and on track.',
      'Daily growth and reproduction stage checked. All conditions optimal.'
    ]
  };

  const getPresetsForCategory = (cat: string) => {
    return quickObservationPresets[cat] || quickObservationPresets['default'];
  };

  // Handle local file upload (from phone camera or gallery)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofFileUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Telephone verification warning */}
      {!userPhoneVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="font-bold text-amber-950 text-sm">Ghana Telephone Verification Recommended</h4>
              <p className="text-xs text-amber-800">
                Verify your 6-digit SMS OTP to connect your mobile wallet for automated harvest settlements.
              </p>
            </div>
          </div>
          <button
            onClick={onVerifyPhoneClick}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            Verify Phone Now
          </button>
        </div>
      )}

      {/* AUTOMATED FARMING ENGINE DASHBOARD HEADER (With background picture banner) */}
      <div className={`rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden transition-all ${
        hasPurchasedPackage 
          ? 'text-white border-2 border-emerald-500/40' 
          : 'bg-white border-2 border-zinc-200'
      }`}>
        {/* Background Image Layer */}
        {hasPurchasedPackage ? (
          <div className="absolute inset-0 z-0">
            <img 
              src="/assets/images/ghana_combine_harvest_1789997787082.jpg" 
              alt="Harvest Backdrop" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/90 to-teal-950/80" />
          </div>
        ) : (
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
            <img 
              src="/assets/images/ghana_agro_drone_1789997826726.jpg" 
              alt="Drone Backdrop" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            {/* Status Pill */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {hasPurchasedPackage ? (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 backdrop-blur-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    AUTONOMOUS TELEMETRY ONLINE
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 backdrop-blur-xs">
                    <GhanaFlag size="sm" /> MoFA IoT Drone Grid Active
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700 border border-zinc-300">
                  <Lock className="w-3.5 h-3.5 text-zinc-500" />
                  AUTOMATED HARVESTING & BREEDING LOCKED
                </span>
              )}
            </div>

            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${hasPurchasedPackage ? 'text-white' : 'text-zinc-900'}`}>
              {hasPurchasedPackage ? (
                <>Automatic Crop Harvesting & Animal Breeding Engine</>
              ) : (
                <>Automated Crop Harvesting & Animal Breeding</>
              )}
            </h2>

            <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${hasPurchasedPackage ? 'text-emerald-100' : 'text-zinc-600'}`}>
              {hasPurchasedPackage ? (
                <>
                  Your sponsored agricultural packages have initiated autonomous cooperative sensors. GPS combine harvesters automatically gather ripe crop yields, and IoT nursery crates monitor animal breeding cycles with direct Ghana Cedi wallet deposits.
                </>
              ) : (
                <>
                  Purchase any of our cooperative farm packages to activate <strong>100% automated crop harvesting and animal breeding</strong>. Our autonomous drone and IoT telemetry will execute all tasks and credit yields straight to your wallet without manual photo uploads!
                </>
              )}
            </p>

            {/* Active Enrolled Units Telemetry Chips */}
            {hasPurchasedPackage && (
              <div className="mt-4 pt-4 border-t border-emerald-800/60 flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Linked Units ({enrolledPackages.length}):</span>
                </div>
                {enrolledPackages.map(ep => (
                  <span key={ep.id} className="px-2.5 py-1 bg-emerald-900/80 backdrop-blur-xs text-emerald-200 rounded-lg font-mono text-[11px] border border-emerald-600/70">
                    {ep.packageName.slice(0, 24)}... (Active)
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Control Panel */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            {hasPurchasedPackage ? (
              <div className="bg-emerald-950/80 backdrop-blur-md border border-emerald-600/60 rounded-2xl p-4 text-center sm:text-left min-w-[250px] shadow-lg">
                <div className="flex items-center justify-between text-xs text-emerald-300 mb-2">
                  <span className="flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    Next Auto-Cycle:
                  </span>
                  <span className="font-mono font-bold text-amber-300">00:{telemetryPulse < 10 ? `0${telemetryPulse}` : telemetryPulse}s</span>
                </div>

                {isBatchRunning && (
                  <div className="w-full bg-emerald-900 rounded-full h-2 mb-3 overflow-hidden">
                    <div 
                      className="bg-amber-400 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${batchCycleProgress}%` }}
                    />
                  </div>
                )}

                <button
                  onClick={handleTriggerBatchCycle}
                  disabled={isBatchRunning}
                  className="w-full py-3 px-4 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 text-emerald-950 fill-emerald-950" />
                  <span>{isBatchRunning ? 'Executing Auto-Harvest & Breed...' : 'Run Instant Auto-Harvest & Breed'}</span>
                </button>
                <div className="text-[10px] text-emerald-300 text-center mt-1.5 font-medium">
                  Autonomously collects all crop & livestock yields
                </div>
              </div>
            ) : (
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-center sm:text-left min-w-[240px]">
                <div className="text-xs font-bold text-zinc-800 mb-1">
                  Ready to Automate Your Farm?
                </div>
                <p className="text-[11px] text-zinc-500 mb-3">
                  Sponsor 1 package to unlock zero-touch automated harvesting and breeding.
                </p>
                <button
                  onClick={onNavigateToPackages}
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Sponsor Package to Automate</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className={`mt-6 pt-6 border-t relative z-10 flex flex-col sm:flex-row gap-3 ${
          hasPurchasedPackage ? 'border-emerald-800/80' : 'border-zinc-200'
        }`}>
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search automated tasks, maize harvest, broiler breeding, swine nursery..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium ${
                hasPurchasedPackage 
                  ? 'bg-emerald-950/70 border border-emerald-700/60 text-white placeholder-emerald-300/60' 
                  : 'bg-zinc-50 border border-zinc-300 text-zinc-900'
              }`}
            />
          </div>

          {/* Categories Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat;
              const isInterestPill = cat === 'Crop Harvest Interest' || cat === 'Animal Birth Interest';

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? (isInterestPill 
                          ? 'bg-amber-400 text-emerald-950 shadow-md font-black'
                          : 'bg-emerald-700 text-white shadow-xs')
                      : (hasPurchasedPackage
                          ? 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800/80 border border-emerald-800'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80')
                  }`}
                >
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-950 inline-block mr-0.5" />
                  )}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ACTIVE SPONSORED PACKAGE: GESTATION / BIRTH & RIPENING DAILY INTEREST TRACKER */}
      {hasPurchasedPackage && enrolledPackages.filter(p => p.status === 'active').map(ep => {
        const isAnimal = ep.cycleType !== 'crop_harvest';
        const currentDay = ep.currentDay || 1;
        const duration = ep.durationDays || 20;
        const daysLeft = ep.daysRemaining !== undefined ? ep.daysRemaining : Math.max(0, duration - currentDay);
        const dayProgress = Math.min(100, Math.round((currentDay / duration) * 100));
        const dailyInterest = ep.dailyInterestGhs || 3.00;
        const totalEarned = ep.totalInterestEarned || 0;

        const pkgDailyTasks = tasks
          .filter(t => t.packageId === ep.packageId && t.isDailyTask)
          .sort((a, b) => (a.dailyOrder || 0) - (b.dailyOrder || 0));
        const completedTodayCount = (ep.completedDailyTasksToday || []).length;
        const requiredCount = ep.requiredDailyTasksCount || 3;
        const allShiftsDoneToday = completedTodayCount >= requiredCount;
        const commission35 = ep.commissionYieldGhs || Math.round((ep.price || 0) * 0.35 * 100) / 100;
        const totalMaturityPayout = (ep.price || 0) + commission35;

        return (
          <div 
            key={ep.id} 
            className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-500 shadow-xl relative overflow-hidden space-y-6"
          >
            {/* Top Package Details & 35% Guarantee Banner */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b border-zinc-200">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                    {ep.statutoryUnitCode || 'GH-COOP-UNIT'}
                  </span>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-amber-400 text-emerald-950 flex items-center gap-1 shadow-2xs">
                    <Award className="w-3.5 h-3.5" />
                    35% Guaranteed Interest at Maturity
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    3 Daily Tasks Required / Day
                  </span>
                  <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                    Cooperative Quota: 1 Active Unit
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                  <span>{ep.packageName}</span>
                  <span className="text-sm font-bold font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    Sponsorship: GH₵ {ep.price.toFixed(2)}
                  </span>
                </h3>

                <p className="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed">
                  <strong>Protocol Obligation:</strong> Perform the <strong>3 routine tasks per day</strong> (Morning, Midday, and Evening shifts) across the <strong>{duration}-day</strong> cycle. Completing your daily routine guarantees your <strong>35% interest commission (+GH₵ {commission35.toFixed(2)})</strong> at maturity day, plus accrues GH₵ {dailyInterest.toFixed(2)} in daily interest yield.
                </p>

                {/* Gestation / Ripening Days Progress */}
                <div className="mt-4 p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200">
                  <div className="flex flex-wrap items-center justify-between text-xs font-bold text-emerald-950 mb-2 gap-2">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-700" />
                      Gestation Progress: Day {currentDay} of {duration} Days
                    </span>
                    <span className="text-emerald-800 font-mono">
                      {daysLeft === 0 
                        ? (isAnimal ? 'Animal has given birth (Maturity Ready)!' : 'Crop harvest ready for combine settlement!') 
                        : `${daysLeft} days until maturity day (${isAnimal ? 'giving birth' : 'combine harvest'})`}
                    </span>
                  </div>

                  <div className="w-full h-3 bg-emerald-200/80 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-linear-to-r from-emerald-600 via-teal-600 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${dayProgress}%` }}
                    />
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center justify-between text-[11px] text-emerald-900 font-medium">
                    <span>Expected Maturity Event: <strong>{ep.expectedBirthEvent || (isAnimal ? 'Offspring Birth & Weaning' : 'Ripened Combine Harvest')}</strong></span>
                    <span className="font-mono font-bold">Cycle Completion: {dayProgress}%</span>
                  </div>
                </div>
              </div>

              {/* Interest Metrics and Settlement Summary Box */}
              <div className="shrink-0 flex flex-col gap-3 w-full lg:w-80 bg-zinc-50 p-5 rounded-2xl border border-zinc-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Financial Settlement</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Day {currentDay} of {duration}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-zinc-600">
                    <span>Principal Investment:</span>
                    <span className="font-mono font-bold text-zinc-900">GH₵ {(ep.price || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-600">
                    <span>Daily Interest Yield:</span>
                    <span className="font-mono font-bold text-emerald-800">GH₵ {(dailyInterest || 0).toFixed(2)} / Day</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-600">
                    <span>Total Daily Earned to Date:</span>
                    <span className="font-mono font-bold text-zinc-900">GH₵ {(totalEarned || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-200 bg-amber-50/80 -mx-5 px-5 py-1.5 border-b">
                    <span className="font-bold text-amber-950">35% Maturity Commission:</span>
                    <span className="font-mono font-black text-amber-900 text-sm">+GH₵ {(commission35 || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-black text-zinc-900">Total Maturity Settlement:</span>
                    <span className="font-mono font-black text-emerald-800 text-base">GH₵ {(totalMaturityPayout || 0).toFixed(2)}</span>
                  </div>
                </div>

                {/* 1-Tap Claim Daily Interest */}
                {onClaimDailyInterest && (
                  <button
                    onClick={() => onClaimDailyInterest(ep.id)}
                    disabled={ep.claimedInterestToday}
                    className={`w-full py-2.5 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                      ep.claimedInterestToday
                        ? 'bg-zinc-200 text-zinc-600 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {ep.claimedInterestToday ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Day {currentDay} Interest Claimed (+GH₵ {dailyInterest.toFixed(2)})</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                        <span>Collect Day {currentDay} Daily Interest (+GH₵ {dailyInterest.toFixed(2)})</span>
                      </>
                    )}
                  </button>
                )}

                {/* Action Row: Advance Gestation & Settle Maturity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {onAdvanceGestationDay && (
                    <button
                      onClick={() => onAdvanceGestationDay(ep.id)}
                      className="w-full py-2 px-3 bg-white hover:bg-zinc-100 text-zinc-700 font-bold text-xs rounded-xl border border-zinc-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      title="Advance to the next day of the biological cycle"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Next Day (+1)</span>
                    </button>
                  )}

                  {onCompletePackageCycle && (
                    <button
                      onClick={() => onCompletePackageCycle(ep.id)}
                      className={`w-full py-2 px-3 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                        daysLeft <= 1 
                          ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse' 
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                      title="Settle full package and receive 35% interest commission"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>{daysLeft <= 1 ? 'Settle 35% Commission' : 'Accelerate Maturity (35%)'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* DAILY ROUTINE SHIFTS: THE 3 TASKS PER DAY TO UNLOCK 35% MATURITY INTEREST */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-950 text-white p-4 rounded-2xl">
                <div>
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-amber-400" />
                    <h4 className="font-bold text-base text-white">
                      Daily Routine Shifts for Today (Day {currentDay} of {duration})
                    </h4>
                  </div>
                  <p className="text-xs text-emerald-200 mt-1">
                    Perform these <strong>3 shifts every day</strong> to qualify for the <strong>35% interest (+GH₵ {commission35.toFixed(2)})</strong> at maturity.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 shrink-0">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-black text-center ${
                    allShiftsDoneToday 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-amber-400 text-emerald-950'
                  }`}>
                    {completedTodayCount} of {requiredCount} Shifts Done Today
                  </span>

                  {!allShiftsDoneToday && onCompleteDailyTasksBatch && (
                    <button
                      onClick={() => onCompleteDailyTasksBatch(ep.id)}
                      className="tap-bounce px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-950 fill-emerald-950" />
                      <span>1-Tap Complete All Remaining Today</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3 Shifts Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pkgDailyTasks.map((t) => {
                  const isDone = ep.completedDailyTasksToday?.includes(t.id);
                  const isMorning = t.dailyShift === 'morning';
                  const isMidday = t.dailyShift === 'midday';
                  const shiftTime = isMorning ? '06:00 - 10:00' : isMidday ? '11:00 - 14:00' : '16:00 - 20:00';
                  const ShiftIcon = isMorning ? Sunrise : isMidday ? Sun : Sunset;

                  return (
                    <div 
                      key={t.id} 
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isDone 
                          ? 'bg-emerald-50/70 border-emerald-400 shadow-xs' 
                          : 'bg-white border-zinc-200 hover:border-emerald-400 hover:shadow-md'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-700">
                            <ShiftIcon className={`w-4 h-4 ${isMorning ? 'text-amber-500' : isMidday ? 'text-orange-500' : 'text-purple-600'}`} />
                            <span>Shift {t.dailyOrder || 1}: {t.dailyShift || 'routine'}</span>
                          </span>
                          <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                            {shiftTime}
                          </span>
                        </div>

                        <h5 className="font-bold text-sm text-zinc-900 line-clamp-2 mb-1">
                          {t.title}
                        </h5>

                        <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-3">
                          {t.description}
                        </p>

                        <div className="flex items-center justify-between text-[11px] mb-3 p-2 bg-zinc-50 rounded-lg">
                          <span className="font-mono text-zinc-600 font-semibold">{t.protocolCode}</span>
                          <span className="font-mono font-black text-emerald-800">Reward: GH₵ {t.reward.toFixed(2)}</span>
                        </div>
                      </div>

                      <div>
                        {isDone ? (
                          <div className="w-full py-2 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                            <span>Shift Done for Day {currentDay} (+GH₵ {t.reward.toFixed(2)})</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => onAutoHarvestTask && onAutoHarvestTask(t)}
                            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                            <span>Complete Shift (+GH₵ {t.reward.toFixed(2)})</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {allShiftsDoneToday && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    All 3 daily routine tasks for Day {currentDay} are complete! Your compliance is locked in for the 35% maturity commission (+GH₵ {commission35.toFixed(2)}) on Day {duration}.
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Task Cards Grid (With Pictures!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map(task => {
          const completionPct = Math.min(100, Math.round((task.completedCount / task.maxCompletions) * 100));
          const isAutomated = !!task.isAutomated;
          const isCropAuto = task.automationType === 'crop_harvesting';
          const isAnimalAuto = task.automationType === 'animal_breeding';

          const enrolledPackageIds = enrolledPackages.map(ep => ep.packageId);
          // A task is unlocked ONLY if the user has purchased the specific package it is assigned to
          const isTaskUnlocked = hasPurchasedPackage
            ? (task.packageId ? enrolledPackageIds.includes(task.packageId) : true)
            : false;

          const assignedPkgName = task.packageName || 'Assigned Package';
          const requiredPrice = task.requiredPackagePrice || 75;

          return (
            <div
              key={task.id}
              className={`rounded-3xl overflow-hidden transition-all flex flex-col justify-between group relative bg-white border ${
                !isTaskUnlocked
                  ? 'border-gray-200 bg-gray-50/60 opacity-90'
                  : isAutomated 
                  ? 'border-2 border-emerald-500 shadow-sm hover:border-emerald-600 hover:shadow-lg'
                  : 'border-emerald-300 hover:border-emerald-700 hover:shadow-md'
              }`}
            >
              {/* Task Picture Header */}
              <div className="relative h-44 w-full overflow-hidden bg-zinc-100">
                <img
                  src={task.image || '/assets/images/ejura_white_maize_1790588863717.jpg'}
                  alt={task.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/assets/images/ejura_white_maize_1790588863717.jpg';
                  }}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    isTaskUnlocked ? 'group-hover:scale-105' : 'grayscale-30'
                  }`}
                />
                <div className={`absolute inset-0 ${!isTaskUnlocked ? 'bg-black/60' : 'bg-gradient-to-t from-black/85 via-black/30 to-black/20'}`} />
                
                {/* Protocol Badge & Automation Indicator */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded border border-white/20">
                    {task.protocolCode}
                  </span>

                  {isTaskUnlocked ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600/90 text-white backdrop-blur-xs shadow-xs flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-300" /> Package Locked
                    </span>
                  )}

                  {isAutomated && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1 shadow-sm ${
                      isCropAuto 
                        ? 'bg-amber-400 text-emerald-950' 
                        : 'bg-emerald-400 text-emerald-950'
                    }`}>
                      <Cpu className="w-3 h-3 text-emerald-950" />
                      {isCropAuto ? 'Auto Crop' : 'Auto Breed'}
                    </span>
                  )}
                </div>

                {/* Reward Pill */}
                <div className="absolute top-3 right-3 bg-emerald-950/90 backdrop-blur-xs text-amber-300 border border-amber-400/50 px-2.5 py-1 rounded-xl text-xs font-black shadow-md font-mono">
                  GH₵ {task.reward.toFixed(2)}
                </div>

                {/* Bottom of Image Info */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-semibold">
                  <span className="bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded text-white/90">
                    {task.category}
                  </span>
                  <span className="text-amber-200 text-[10px] bg-emerald-950/80 backdrop-blur-xs px-2 py-0.5 rounded font-bold border border-amber-400/30">
                    Package: {assignedPkgName}
                  </span>
                </div>
              </div>

              {/* Task Details Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Assigned Package Tag & Daily Shift Indicator */}
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      isTaskUnlocked 
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {isTaskUnlocked ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-rose-500" />}
                      <span>Assigned to: <strong>{assignedPkgName}</strong></span>
                    </span>

                    {task.isDailyTask && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400 text-emerald-950 border border-amber-500 shadow-2xs">
                        {task.dailyShift === 'morning' ? 'Morning Shift (1/3)' : task.dailyShift === 'midday' ? 'Midday Shift (2/3)' : 'Evening Shift (3/3)'}
                      </span>
                    )}

                    {task.isDailyTask && (
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-200">
                        35% Maturity Routine
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 group-hover:text-emerald-900 transition-colors line-clamp-2 leading-snug">
                    {task.title}
                  </h3>

                  <p className="text-xs text-zinc-600 mt-2 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>

                  {/* Automation Telemetry Source or Regulatory Standard */}
                  {isAutomated && task.autoTelemetrySource ? (
                    <div className="mt-3 p-2 bg-emerald-50/80 rounded-xl border border-emerald-200 text-[10px] text-emerald-900 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-pulse" />
                      <span className="truncate font-medium">IoT Sensor: {task.autoTelemetrySource}</span>
                    </div>
                  ) : (
                    <div className="mt-3 p-2 bg-zinc-50 rounded-xl border border-zinc-200 text-[10px] text-zinc-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                      <span className="truncate font-medium">{task.regulatoryStandard}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100">
                  {/* Meta info */}
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-2.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{task.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {isAutomated ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                          <Activity className="w-3 h-3 text-emerald-600" />
                          {task.autoYieldCycle || 'Automated Cycle'}
                        </span>
                      ) : (
                        <>
                          {task.proofType === 'text_only' ? (
                            <FileText className="w-3.5 h-3.5 text-zinc-400" />
                          ) : (
                            <Camera className="w-3.5 h-3.5 text-zinc-400" />
                          )}
                          <span className="capitalize">{task.proofType.replace('_', ' ')}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3.5">
                    <div className="flex justify-between text-[11px] text-zinc-500 mb-1 font-medium">
                      <span>Verified Quota: {task.completedCount} / {task.maxCompletions}</span>
                      <span className="font-mono">{completionPct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isAutomated ? 'bg-emerald-600' : 'bg-zinc-700'
                        }`}
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Action button with STRICT ACCESS CONTROL */}
                  {!isTaskUnlocked ? (
                    <div className="space-y-1.5">
                      {hasPurchasedPackage ? (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-center">
                          <div className="flex items-center justify-center gap-1.5 text-rose-800 font-bold text-xs">
                            <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Task Locked</span>
                          </div>
                          <p className="text-[10px] text-rose-700 mt-0.5 leading-tight">
                            You are enrolled in "{enrolledPackages[0]?.packageName}". Other package tasks are locked until cycle completion.
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={onNavigateToPackages}
                          className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Lock className="w-3.5 h-3.5 text-zinc-950" />
                          <span>Sponsor {assignedPkgName} to Unlock</span>
                        </button>
                      )}
                    </div>
                  ) : task.isDailyTask ? (
                    (() => {
                      const isShiftDoneToday = enrolledPackages.some(ep => ep.packageId === task.packageId && ep.completedDailyTasksToday?.includes(task.id));
                      return isShiftDoneToday ? (
                        <div className="w-full py-2.5 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                          <span>Shift Done Today (+GH₵ {task.reward.toFixed(2)})</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onAutoHarvestTask ? onAutoHarvestTask(task) : handleInstantQuickComplete(task)}
                          className="w-full py-2.5 px-4 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                          <span>Complete {task.dailyShift ? `${task.dailyShift.charAt(0).toUpperCase() + task.dailyShift.slice(1)} Shift` : 'Daily Shift'}</span>
                          <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">+GH₵ {task.reward.toFixed(2)}</span>
                        </button>
                      );
                    })()
                  ) : isAutomated ? (
                    <button
                      onClick={() => handleOpenAutoModal(task)}
                      className="w-full py-2.5 px-4 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>{isCropAuto ? 'Auto-Harvest Now' : 'Auto-Breed Now'}</span>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">+GH₵ {task.reward.toFixed(2)}</span>
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleInstantQuickComplete(task)}
                        className="flex-1 py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        <span>1-Tap Complete</span>
                      </button>
                      <button
                        onClick={() => handleOpenManualModal(task)}
                        className="px-3 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl cursor-pointer"
                        title="View details or custom notes"
                      >
                        Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200">
          <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-zinc-700">No matching agricultural tasks</h4>
          <p className="text-xs text-zinc-500 mt-1">Try selecting "All", "Auto Crop Harvesting", or "Auto Animal Breeding".</p>
        </div>
      )}

      {/* AUTOMATED TELEMETRY EXECUTION MODAL (With Live Optical HUD Paddock Picture) */}
      {activeAutoTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-emerald-500 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-emerald-950 to-teal-950 text-white p-5 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-black bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                    <Radio className="w-3 h-3 text-emerald-950 animate-pulse" />
                    AUTONOMOUS CO-OP TELEMETRY
                  </span>
                  <span className="text-[10px] text-emerald-300 font-mono">
                    {activeAutoTask.protocolCode}
                  </span>
                </div>
                <h3 className="font-black text-lg text-white">
                  {activeAutoTask.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveAutoTask(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar popup-scroll">
              {autoSuccess ? (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-emerald-950">
                    {activeAutoTask.automationType === 'crop_harvesting' ? 'Crop Harvest Yield Settled!' : 'Animal Breeding Yield Settled!'}
                  </h3>
                  <p className="text-sm text-zinc-600 mt-2 max-w-md mx-auto">
                    Autonomous MoFA IoT sensors confirmed telemetry for <strong>{activeAutoTask.title}</strong>. GH₵ {activeAutoTask.reward.toFixed(2)} has been deposited directly into your available wallet balance!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Live Optical Drone / Satellite Photo Feed Box */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-emerald-500/40 bg-zinc-950 shadow-inner">
                    <img
                      src={activeAutoTask.image || '/assets/images/ghana_combine_harvest_1789997787082.jpg'}
                      alt="Live Telemetry Feed"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
                    
                    {/* HUD Top Watermarks */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono text-[9px] font-bold flex items-center gap-1 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        LIVE DRONE FEED
                      </span>
                      <span className="font-mono text-[9px] text-emerald-300 bg-black/60 px-2 py-0.5 rounded border border-emerald-500/30">
                        ALT: 45.2M • 4K OPTICAL
                      </span>
                    </div>

                    {/* HUD Crosshairs in center */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 border border-emerald-400/50 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      </div>
                    </div>

                    {/* HUD Bottom Watermarks */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex justify-between items-center text-[10px] font-mono text-zinc-200">
                      <span>PADDOCK 04 • 5.6037° N, 0.1870° W</span>
                      <span className="text-amber-300">MoFA SATELLITE LOCK</span>
                    </div>
                  </div>

                  {/* Reward banner */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-emerald-800 font-semibold">
                        {activeAutoTask.automationType === 'crop_harvesting' ? 'Automatic Crop Harvest Yield' : 'Automatic Animal Breeding Yield'}
                      </div>
                      <div className="text-2xl font-black text-emerald-950">
                        +GH₵ {activeAutoTask.reward.toFixed(2)}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs">
                      Zero Manual Labor
                    </span>
                  </div>

                  {/* Telemetry Sensor Feed Readout */}
                  <div className="bg-zinc-900 text-zinc-200 rounded-2xl p-4 font-mono text-xs space-y-2 border border-zinc-800">
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold border-b border-zinc-800 pb-2">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        LIVE IOT SENSOR STREAM
                      </span>
                      <span className="text-zinc-400">PADDOCK #04 • GH-AGRO-ZONE</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <span className="text-zinc-500">Drone Scouting:</span> <span className="text-emerald-400">ACTIVE (45m Alt)</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Telemetry Feed:</span> <span className="text-amber-400">VERIFIED</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">
                          {activeAutoTask.automationType === 'crop_harvesting' ? 'Grain Moisture:' : 'Livestock RFID:'}
                        </span>{' '}
                        <span className="text-white">
                          {activeAutoTask.automationType === 'crop_harvesting' ? '12.4% (Optimal)' : 'ACTIVE #GH-RFID-892'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Ambient Temp:</span> <span className="text-white">31.8°C (Normal)</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800">
                      Standard: {activeAutoTask.regulatoryStandard}
                    </div>
                  </div>

                  {/* Explanation of package-powered automation */}
                  <div className="text-xs text-zinc-600 bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Package Sponsorship Benefit:</strong> Because you hold an active farm package, this task is fulfilled autonomously by cooperative field sensors and GPS harvesters. No manual photo submission required.
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveAutoTask(null)}
                      className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAutoExecution}
                      disabled={isExecutingAuto}
                      className="flex-2 py-3 px-4 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isExecutingAuto ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Verifying Sensor Feed...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                          <span>Confirm Automated Yield (+GH₵ {activeAutoTask.reward.toFixed(2)})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MANUAL Task Inspection & Submission Modal (For standard field tasks) */}
      {activeManualTask && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-zinc-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-emerald-950 text-white p-5 flex justify-between items-start">
              <div>
                <span className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider">
                  {activeManualTask.category} Task Verification
                </span>
                <h3 className="font-black text-lg text-white mt-1">
                  {activeManualTask.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveManualTask(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar popup-scroll">
              {submittedSuccess ? (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-emerald-950">Field Proof Submitted!</h3>
                  <p className="text-sm text-zinc-600 mt-2 max-w-md mx-auto">
                    Your observation notes and photo proof have been queued for supervisor verification. GH₵ {activeManualTask.reward.toFixed(2)} has been recorded to your pending rewards!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  {/* Ultra Simple 1-Tap Quick Complete Action */}
                  <div className="p-3 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-300 fill-amber-300 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">Super Simple 1-Tap Verification</div>
                        <div className="text-[11px] text-emerald-100">Tap to instantly submit verified check with zero typing.</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const defaultText = `Verified: ${activeManualTask.title} checked and confirmed in good order.`;
                        const defaultPhoto = activeManualTask.image || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80';
                        setIsSubmitting(true);
                        setTimeout(() => {
                          onSubmitTask(activeManualTask.id, defaultText, defaultPhoto);
                          setIsSubmitting(false);
                          setSubmittedSuccess(true);
                          setTimeout(() => {
                            setActiveManualTask(null);
                            setSubmittedSuccess(false);
                          }, 1600);
                        }, 400);
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 fill-emerald-950" />
                      <span>1-Tap Quick Finish</span>
                    </button>
                  </div>

                  {/* Inspection Reference Photo */}
                  {activeManualTask.image && (
                    <div className="relative h-40 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-sm">
                      <img
                        src={activeManualTask.image}
                        alt="Inspection Reference Standard"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      <div className="absolute bottom-2.5 left-3 right-3 text-white text-xs font-semibold flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-amber-300" />
                          Official Inspection Reference Standard
                        </span>
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded backdrop-blur-xs font-mono">
                          {activeManualTask.protocolCode}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Reward & instructions info card */}
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-emerald-800 font-semibold">Eligible Completion Reward</div>
                      <div className="text-2xl font-black text-emerald-950">GH₵ {activeManualTask.reward.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-zinc-500">Proof Required</div>
                      <div className="text-xs font-bold text-emerald-900 capitalize">
                        {activeManualTask.proofType.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  {/* Task Instructions */}
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-emerald-700" />
                      Official MoFA Verification Instructions
                    </h4>
                    <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 text-xs text-zinc-700 whitespace-pre-line leading-relaxed">
                      {activeManualTask.instructions}
                    </div>
                  </div>

                  {/* Field Observation Notes */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                      Field Observation Notes <span className="text-rose-500">*</span>
                    </label>

                    {/* Quick Preset Buttons */}
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {getPresetsForCategory(activeManualTask.category).map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSubmissionText(preset)}
                          className="text-[11px] bg-zinc-100 hover:bg-emerald-100 hover:text-emerald-900 text-zinc-700 px-2.5 py-1 rounded-lg transition-colors text-left border border-zinc-200 cursor-pointer"
                        >
                          &ldquo;{preset.slice(0, 42)}...&rdquo;
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={3}
                      value={submissionText}
                      onChange={e => setSubmissionText(e.target.value)}
                      placeholder="Enter details of your inspection (e.g. egg count, footbath Virkon concentration, feed trough level)..."
                      className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:bg-white text-zinc-900"
                    />
                  </div>

                  {/* Photo Proof Upload */}
                  {(activeManualTask.proofType === 'image_required' || activeManualTask.proofType === 'both') && (
                    <div>
                      <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                        Inspection Photo Proof <span className="text-rose-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-zinc-300 rounded-2xl p-4 text-center hover:border-emerald-600 transition-colors bg-zinc-50/50">
                        {proofFileUrl ? (
                          <div className="relative inline-block">
                            <img
                              src={proofFileUrl}
                              alt="Proof preview"
                              referrerPolicy="no-referrer"
                              className="max-h-48 rounded-xl object-contain mx-auto shadow-xs border border-zinc-200"
                            />
                            <button
                              type="button"
                              onClick={() => setProofFileUrl('')}
                              className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <Camera className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                            <p className="text-xs text-zinc-600 font-medium">
                              Take a photo or upload from phone storage
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">
                              JPEG, PNG up to 10MB
                            </p>
                            <label className="mt-3 inline-block px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors">
                              Select Photo
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submission Action Buttons */}
                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveManualTask(null)}
                      className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <UploadCloud className="w-4 h-4 animate-bounce" />
                          <span>Submitting Proof...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Verification Proof</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
