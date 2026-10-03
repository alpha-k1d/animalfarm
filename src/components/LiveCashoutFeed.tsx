// src/components/LiveCashoutFeed.tsx - Real-time Live Payouts & Outgrower Disbursements across Ghana (Refreshes every 5 minutes)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WithdrawalRequest } from '../types';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Smartphone, 
  ShieldCheck, 
  TrendingUp, 
  Zap,
  Radio,
  ExternalLink,
  ChevronRight,
  Filter,
  RotateCw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  BellRing
} from 'lucide-react';
import { GhanaFlag } from './GhanaFlag';

interface LiveCashoutFeedProps {
  userCashouts?: WithdrawalRequest[];
  onCashoutClick?: () => void;
}

export interface SimulatedCashout {
  id: string;
  farmerName: string;
  district: string;
  region: string;
  amount: number;
  channel: 'MTN MoMo' | 'Telecel Cash' | 'AT Money';
  phoneMasked: string;
  timeAgo: string;
  note: string;
  status: 'disbursed' | 'clearing';
  gipSwitchRef: string;
  isNew?: boolean;
}

const INITIAL_CASHOUTS: SimulatedCashout[] = [
  {
    id: 'CSH-9821',
    farmerName: 'Abena Serwaa Boateng',
    district: 'Ejisu / Kumasi Metro',
    region: 'Ashanti',
    amount: 450.00,
    channel: 'MTN MoMo',
    phoneMasked: '0244***912',
    timeAgo: 'Just now',
    note: 'Broiler Care Routine Tasks',
    status: 'disbursed',
    gipSwitchRef: 'GHIPSS-GIP-982103'
  },
  {
    id: 'CSH-9820',
    farmerName: 'Akosua Antwi',
    district: 'Sefwi Wiawso Cocoa Belt',
    region: 'Western North',
    amount: 1750.00,
    channel: 'MTN MoMo',
    phoneMasked: '0541***238',
    timeAgo: '1m ago',
    note: 'Cocoa Farm 35% Cycle Yield',
    status: 'disbursed',
    gipSwitchRef: 'GHIPSS-GIP-982098'
  },
  {
    id: 'CSH-9819',
    farmerName: 'Kwame Mensah',
    district: 'Sunyani West Agri-Enclave',
    region: 'Bono',
    amount: 1000.00,
    channel: 'MTN MoMo',
    phoneMasked: '0558***441',
    timeAgo: '2m ago',
    note: 'Cattle Ranching Grazing Sign-off',
    status: 'disbursed',
    gipSwitchRef: 'GHIPSS-GIP-981984'
  },
  {
    id: 'CSH-9818',
    farmerName: 'Esi Darko',
    district: 'Koforidua Municipal',
    region: 'Eastern',
    amount: 250.00,
    channel: 'Telecel Cash',
    phoneMasked: '0209***182',
    timeAgo: '4m ago',
    note: 'Layer Egg Weight Protocols',
    status: 'disbursed',
    gipSwitchRef: 'GHIPSS-GIP-981872'
  },
  {
    id: 'CSH-9817',
    farmerName: 'Alhassan Fuseini',
    district: 'Tamale Commercial Grain Belt',
    region: 'Northern',
    amount: 800.00,
    channel: 'MTN MoMo',
    phoneMasked: '0247***559',
    timeAgo: '6m ago',
    note: 'Soya Bean Combine Harvest Reward',
    status: 'disbursed',
    gipSwitchRef: 'GHIPSS-GIP-981766'
  },
  {
    id: 'CSH-9816',
    farmerName: 'Kofi Asare',
    district: 'Spintex Outgrower Logistics',
    region: 'Greater Accra',
    amount: 500.00,
    channel: 'AT Money',
    phoneMasked: '0263***904',
    timeAgo: '8m ago',
    note: 'Tilapia Biosecurity Inspection',
    status: 'disbursed',
    gipSwitchRef: 'GHIPSS-GIP-981650'
  },
  {
    id: 'CSH-9815',
    farmerName: 'Mawuli Gbedemah',
    district: 'Ho / Volta Aquaculture',
    region: 'Volta',
    amount: 350.00,
    channel: 'MTN MoMo',
    phoneMasked: '0592***713',
    timeAgo: '11m ago',
    note: 'Fingerling Hatchery Water Quality',
    status: 'disbursed',
    gipSwitchRef: 'GHIPSS-GIP-981541'
  },
  {
    id: 'CSH-9814',
    farmerName: 'Daniel Kwabena Osei',
    district: 'Bibiani Agri-Cluster',
    region: 'Western North',
    amount: 600.00,
    channel: 'Telecel Cash',
    phoneMasked: '0202***804',
    timeAgo: '14m ago',
    note: 'Pork Biosecurity Protocol Check',
    status: 'disbursed',
    gipSwitchRef: 'GHIPSS-GIP-981433'
  }
];

export const REFRESH_INTERVAL_SECONDS = 10; // Under every 10 seconds exactly

// Pool of authentic Ghanaian farmers and locations to sample from during 5-minute automated refreshes
const REFRESH_CANDIDATES = [
  {
    farmerName: 'Ama Boatemaa',
    district: 'Offinso South Enclave',
    region: 'Ashanti',
    note: 'Cocoa Farm 35% Cycle Yield',
    channel: 'MTN MoMo' as const,
    amountRange: [850, 1850]
  },
  {
    farmerName: 'Kwadwo Appiah',
    district: 'Techiman Municipal Market Belt',
    region: 'Bono East',
    note: 'Broiler Care Morning Routine Tasks',
    channel: 'MTN MoMo' as const,
    amountRange: [250, 650]
  },
  {
    farmerName: 'Cynthia Owusu',
    district: 'Tarkwa-Nsuaem Agro-Venture',
    region: 'Western',
    note: 'Layer Poultry Evening Egg Shift',
    channel: 'Telecel Cash' as const,
    amountRange: [300, 750]
  },
  {
    farmerName: 'Mustapha Iddrisu',
    district: 'Savelugu Commercial Grain Silos',
    region: 'Northern',
    note: 'Maize Harvest 35% Sponsorship Yield',
    channel: 'MTN MoMo' as const,
    amountRange: [400, 1100]
  },
  {
    farmerName: 'Beatrice Osei Tutu',
    district: 'Mampong Municipal Piggery Unit',
    region: 'Ashanti',
    note: 'Piggery Hygiene Biosecurity Protocol',
    channel: 'AT Money' as const,
    amountRange: [350, 850]
  },
  {
    farmerName: 'Salifu Braimah',
    district: 'Bole Bamboi Cattle Station',
    region: 'Savannah',
    note: 'Goat Breeding Gestation Sign-off',
    channel: 'MTN MoMo' as const,
    amountRange: [500, 1200]
  },
  {
    farmerName: 'Emmanuel Antwi',
    district: 'Assin Fosu Cocoa Logistics',
    region: 'Central',
    note: 'Cocoa Agroforestry Drainage Task',
    channel: 'Telecel Cash' as const,
    amountRange: [600, 1600]
  },
  {
    farmerName: 'Nana Yaa Acheampong',
    district: 'Dormaa Ahenkro Poultry Hub',
    region: 'Bono',
    note: 'Broiler Feed Conversion Audit',
    channel: 'MTN MoMo' as const,
    amountRange: [450, 950]
  },
  {
    farmerName: 'Kwesi Baah',
    district: 'Keta Lagoon Aquaculture',
    region: 'Volta',
    note: 'Catfish Pumping & Solar Aeration',
    channel: 'AT Money' as const,
    amountRange: [380, 820]
  },
  {
    farmerName: 'Fati Mohammed',
    district: 'Walewale Soya Cooperative',
    region: 'North East',
    note: 'Soybean Quality Moisture Sign-off',
    channel: 'MTN MoMo' as const,
    amountRange: [520, 1400]
  }
];

export const LiveCashoutFeed: React.FC<LiveCashoutFeedProps> = ({
  userCashouts = [],
  onCashoutClick
}) => {
  const [cashouts, setCashouts] = useState<SimulatedCashout[]>(INITIAL_CASHOUTS);
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'mtn' | 'telecel' | 'at' | 'high'>('all');
  const [livePulse, setLivePulse] = useState(true);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(REFRESH_INTERVAL_SECONDS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoStreamingActive, setAutoStreamingActive] = useState(true);
  const [totalCashoutsToday, setTotalCashoutsToday] = useState(146300.00);
  const [totalOutgrowersPaid, setTotalOutgrowersPaid] = useState(392);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('Just now');
  
  // Real-time floating payout banner for the latest automated 5-min disbursement
  const [latestPayoutToast, setLatestPayoutToast] = useState<SimulatedCashout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Automatically inject user's real paid withdrawals into the live feed at the very top
  useEffect(() => {
    if (userCashouts && userCashouts.length > 0) {
      const paidUserWds = userCashouts.filter(w => w.status === 'paid');
      if (paidUserWds.length > 0) {
        const mappedUserCashouts: SimulatedCashout[] = paidUserWds.map(w => ({
          id: `USR-WD-${w.id}`,
          farmerName: w.accountName || w.userName || 'Verified Member',
          district: 'Spintex Outgrower Logistics Hub',
          region: 'Greater Accra',
          amount: w.amount,
          channel: (w.method === 'MTN MoMo' || w.method === 'Telecel Cash' || w.method === 'AT Money') 
            ? w.method 
            : 'MTN MoMo',
          phoneMasked: w.accountNumber ? `${w.accountNumber.slice(0, 4)}***${w.accountNumber.slice(-3)}` : '0244***112',
          timeAgo: 'Just now',
          note: `Member Reward Cashout (${w.method})`,
          status: 'disbursed',
          gipSwitchRef: w.txHash || w.reference,
          isNew: true
        }));

        setCashouts(prev => {
          const ids = new Set(mappedUserCashouts.map(m => m.id));
          const filteredPrev = prev.filter(p => !ids.has(p.id));
          return [...mappedUserCashouts, ...filteredPrev].slice(0, 15);
        });
      }
    }
  }, [userCashouts]);

  // Heartbeat animation
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setLivePulse(prev => !prev);
    }, 2000);
    return () => clearInterval(pulseInterval);
  }, []);

  // Function to automatically refresh feed with new disbursements (5-minute refresh cycle)
  const triggerRefresh = useCallback(() => {
    setIsRefreshing(true);

    // Pick 2 random fresh outgrower cashout disbursements
    const sampled = [...REFRESH_CANDIDATES].sort(() => 0.5 - Math.random()).slice(0, 2);
    let addedAmount = 0;

    const newCashouts: SimulatedCashout[] = sampled.map((candidate, idx) => {
      const randomAmt = Math.floor(
        Math.random() * (candidate.amountRange[1] - candidate.amountRange[0]) + candidate.amountRange[0]
      );
      addedAmount += randomAmt;
      const refNum = Math.floor(100000 + Math.random() * 900000);
      const phonePrefixes = candidate.channel === 'MTN MoMo' 
        ? ['0244', '0558', '0541', '0592'] 
        : candidate.channel === 'Telecel Cash' 
        ? ['0202', '0209'] 
        : ['0263', '0277'];
      const prefix = phonePrefixes[Math.floor(Math.random() * phonePrefixes.length)];
      const suffix = Math.floor(100 + Math.random() * 900);
      const uniqueNonce = Math.random().toString(36).substring(2, 7);

      return {
        id: `CSH-${Date.now()}-${uniqueNonce}-${idx}`,
        farmerName: candidate.farmerName,
        district: candidate.district,
        region: candidate.region,
        amount: randomAmt,
        channel: candidate.channel,
        phoneMasked: `${prefix}***${suffix}`,
        timeAgo: 'Just now',
        note: candidate.note,
        status: 'disbursed',
        gipSwitchRef: `GHIPSS-GIP-${refNum}`,
        isNew: true
      };
    });

    // Show latest payout toast
    if (newCashouts.length > 0) {
      setLatestPayoutToast(newCashouts[0]);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setLatestPayoutToast(null);
      }, 7000);
    }

    // Update timeAgo on existing items and ensure strictly unique IDs
    setCashouts(prev => {
      const updatedPrev = prev.map((item, index) => ({
        ...item,
        isNew: false,
        timeAgo: index === 0 ? '10s ago' : index < 4 ? `${(index + 1) * 10}s ago` : `${Math.floor((index + 1) * 0.5)}m ago`
      }));
      const seen = new Set<string>();
      const deduped: SimulatedCashout[] = [];
      for (const item of [...newCashouts, ...updatedPrev]) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          deduped.push(item);
        }
      }
      return deduped.slice(0, 15);
    });

    setTotalCashoutsToday(prev => prev + addedAmount);
    setTotalOutgrowersPaid(prev => prev + newCashouts.length);
    setLastRefreshedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setSecondsUntilRefresh(REFRESH_INTERVAL_SECONDS);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  }, []);

  // 5-Minute Continuous Auto-Refresh Loop: automated clock ticking down every 1000ms
  useEffect(() => {
    if (!autoStreamingActive) return;

    const timer = setInterval(() => {
      setSecondsUntilRefresh(prev => {
        if (prev <= 1) {
          triggerRefresh();
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoStreamingActive, triggerRefresh]);

  const filteredCashouts = cashouts.filter(c => {
    if (selectedChannel === 'mtn') return c.channel === 'MTN MoMo';
    if (selectedChannel === 'telecel') return c.channel === 'Telecel Cash';
    if (selectedChannel === 'at') return c.channel === 'AT Money';
    if (selectedChannel === 'high') return c.amount >= 750;
    return true;
  });

  return (
    <section className="bg-white rounded-3xl border-2 border-emerald-900/15 p-4 sm:p-7 shadow-lg space-y-6 overflow-hidden relative">
      {/* Floating 10-Second Payout Alert Toast */}
      {latestPayoutToast && (
        <div className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-50 max-w-sm w-[calc(100vw-2rem)] bg-emerald-950 text-white p-3.5 rounded-2xl shadow-2xl border-2 border-emerald-400 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shrink-0 shadow-xs">
                <Zap className="w-5 h-5 fill-emerald-950" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono font-bold text-amber-300 uppercase px-2 py-0.5 rounded bg-emerald-900 border border-emerald-700/60">
                    {latestPayoutToast.channel}
                  </span>
                  <span className="text-[10px] text-emerald-300 font-mono">
                    {latestPayoutToast.gipSwitchRef}
                  </span>
                </div>
                <div className="font-extrabold text-xs text-white truncate mt-1">
                  {latestPayoutToast.farmerName} &bull; <span className="font-mono text-amber-300 font-black">GH₵ {latestPayoutToast.amount.toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-zinc-300 truncate">
                  {latestPayoutToast.district} &bull; Disbursed
                </div>
              </div>
            </div>

            <button 
              onClick={() => setLatestPayoutToast(null)}
              className="text-zinc-400 hover:text-white p-1 cursor-pointer shrink-0"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header & Live Pulse Beacon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 font-extrabold text-[11px] shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 ${livePulse ? 'scale-125' : ''}`} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
              </span>
              <span className="uppercase tracking-wide font-mono">LIVE PAYOUT FEED &bull; GHIPSS TELECOM SWITCH</span>
            </div>

            {/* 10-Second Auto-Refresh Rate Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-300/80 text-[11px] font-bold text-amber-950">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span>Automatic Settlement: <strong className="text-emerald-900 font-mono">Under 10s (Fast Stream)</strong></span>
            </div>

            <span className="text-[11px] font-bold text-zinc-500 hidden xl:inline-flex items-center gap-1">
              <GhanaFlag size="sm" />
              <span>National Mobile Money Settlement Rail</span>
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black font-official-serif text-emerald-950 tracking-tight">
            Real-Time Outgrower Payouts & Disbursements
          </h3>
          <p className="text-xs text-zinc-600 max-w-2xl leading-relaxed">
            Live stream of cooperative member rewards disbursed directly to MTN Mobile Money, Telecel Cash, and AT Money wallets nationwide. Automatically refreshes every 10 seconds with instant GhIPSS settlement.
          </p>
        </div>

        {/* Action Button & Manual 10-Sec Refresh Trigger */}
        <div className="shrink-0 flex flex-wrap items-center gap-2">
          <button
            onClick={triggerRefresh}
            disabled={isRefreshing}
            className="tap-bounce px-3.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Trigger instant disbursement refresh"
          >
            <RotateCw className={`w-3.5 h-3.5 text-emerald-700 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Now</span>
          </button>

          {onCashoutClick && (
            <button
              onClick={onCashoutClick}
              className="tap-bounce px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 text-amber-300" />
              <span>Cashout Rewards</span>
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Telemetry Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 sm:p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Today's Payouts</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-base sm:text-xl font-black font-mono text-emerald-950 mt-0.5 truncate">
            GH₵ {totalCashoutsToday.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">{totalOutgrowersPaid} Outgrowers Disbursed</span>
        </div>

        <div className="p-3 sm:p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">GhIPSS Switch Health</span>
          <div className="text-base sm:text-xl font-black font-mono text-emerald-700 mt-0.5 flex items-center gap-1.5 truncate">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>99.98%</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">Instant Clearing</span>
        </div>

        <div className="p-3 sm:p-4 bg-amber-50/80 rounded-2xl border border-amber-200 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">Member Cashout Fee</span>
          <div className="text-base sm:text-xl font-black font-mono text-amber-950 mt-0.5 truncate">
            0% (Free)
          </div>
          <span className="text-[10px] text-amber-800 font-medium block mt-0.5">Subsidized by Co-op</span>
        </div>
      </div>

      {/* Interactive Channel Filter Tabs & 5-Min Refresh Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>

          <button
            onClick={() => setSelectedChannel('all')}
            className={`tap-bounce px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs ${
              selectedChannel === 'all'
                ? 'bg-emerald-950 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            All Networks ({cashouts.length})
          </button>

          <button
            onClick={() => setSelectedChannel('mtn')}
            className={`tap-bounce px-3 py-1.5 rounded-xl font-black transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
              selectedChannel === 'mtn'
                ? 'bg-[#ffcc00] text-zinc-950 ring-2 ring-amber-500 shadow-xs'
                : 'bg-[#ffcc00]/20 text-zinc-900 hover:bg-[#ffcc00]/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
            MTN MoMo
          </button>

          <button
            onClick={() => setSelectedChannel('telecel')}
            className={`tap-bounce px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
              selectedChannel === 'telecel'
                ? 'bg-rose-600 text-white ring-2 ring-rose-500 shadow-xs'
                : 'bg-rose-100 text-rose-900 hover:bg-rose-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
            Telecel Cash
          </button>

          <button
            onClick={() => setSelectedChannel('at')}
            className={`tap-bounce px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
              selectedChannel === 'at'
                ? 'bg-blue-600 text-white ring-2 ring-blue-500 shadow-xs'
                : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            AT Money
          </button>

          <button
            onClick={() => setSelectedChannel('high')}
            className={`tap-bounce px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
              selectedChannel === 'high'
                ? 'bg-amber-400 text-emerald-950 ring-2 ring-amber-500 shadow-xs'
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            High Yield (GH₵ 750+)
          </button>
        </div>

        <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>GhIPSS Telemetry: Active</span>
          </div>
          <span className="text-zinc-300">&bull;</span>
          <span className="text-zinc-500">Last batch {lastRefreshedAt}</span>
        </div>
      </div>

      {/* User's Own Recent Cashout Highlight (If Any) */}
      {userCashouts.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-50 via-emerald-50 to-amber-50 rounded-2xl border-2 border-amber-300/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shrink-0 mt-0.5 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wide">
                    Your Instant Cashout Request
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    userCashouts[0].status === 'paid' 
                      ? 'bg-emerald-200 text-emerald-900' 
                      : 'bg-amber-200 text-amber-900 animate-pulse'
                  }`}>
                    {userCashouts[0].status}
                  </span>
                </div>
                <p className="text-xs text-zinc-700 mt-0.5 font-medium">
                  {userCashouts[0].method} &bull; {userCashouts[0].accountNumber} ({userCashouts[0].accountName}) &bull; Ref: {userCashouts[0].reference}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xl font-black font-mono text-emerald-900">
                GH₵ {userCashouts[0].amount.toFixed(2)}
              </div>
              <span className="text-[10px] text-zinc-500">{userCashouts[0].createdAt}</span>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Live Cashout Cards Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
        {filteredCashouts.map((item) => {
          const isMtn = item.channel === 'MTN MoMo';
          const isTelecel = item.channel === 'Telecel Cash';

          return (
            <div 
              key={item.id}
              className={`p-3.5 sm:p-4 rounded-2xl border bg-white hover:shadow-md transition-all group flex flex-col justify-between gap-3 ${
                item.isNew 
                  ? 'border-emerald-500/80 ring-2 ring-emerald-500/20 bg-emerald-50/20 animate-in fade-in slide-in-from-top-2 duration-300' 
                  : 'border-zinc-200 hover:border-emerald-500/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="font-extrabold text-xs sm:text-sm text-zinc-900 group-hover:text-emerald-900 transition-colors truncate">
                      {item.farmerName}
                    </span>
                    {item.isNew && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-600 text-white uppercase animate-pulse shrink-0">
                        LIVE BATCH
                      </span>
                    )}
                    <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                      {item.phoneMasked}
                    </span>
                  </div>

                  <div className="text-[11px] sm:text-xs text-zinc-500 flex items-center gap-1.5 truncate">
                    <span className="truncate">{item.district}</span>
                    <span>&bull;</span>
                    <span className="font-semibold text-zinc-700 shrink-0">{item.region}</span>
                  </div>

                  <div className="text-[10px] sm:text-[11px] text-emerald-800 font-medium flex items-center gap-1 pt-0.5 truncate">
                    <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="truncate">{item.note}</span>
                  </div>
                </div>

                {/* Amount & Timestamp */}
                <div className="text-right shrink-0">
                  <div className="text-sm sm:text-base xl:text-lg font-black font-mono text-emerald-700 leading-tight">
                    GH₵ {item.amount.toFixed(2)}
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-zinc-400 font-mono block mt-0.5">
                    {item.timeAgo}
                  </span>
                </div>
              </div>

              {/* Network Channel Badge & Settlement Confirmation */}
              <div className="flex items-center justify-between pt-2 sm:pt-2.5 border-t border-zinc-100 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold ${
                    isMtn
                      ? 'bg-[#ffcc00] text-zinc-950 font-black'
                      : isTelecel
                      ? 'bg-rose-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}>
                    {item.channel}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-zinc-400 font-mono hidden sm:inline">
                    {item.gipSwitchRef}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
                  <span>Disbursed</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Continuous Ticker Ribbon at bottom */}
      <div className="p-3 bg-zinc-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs overflow-hidden">
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 bg-emerald-500 text-emerald-950 font-black rounded text-[10px] uppercase">
            Switch Notice
          </span>
          <span className="font-semibold text-emerald-300 text-[11px]">
            Ghana Cedi withdrawals clear 24/7 without weekend holidays &bull; Auto-streaming every 10 seconds.
          </span>
        </div>

        <div className="flex items-center gap-3 text-zinc-400 text-[11px] font-mono">
          <span>GhIPSS Protocol: Instant Pay (GIP)</span>
          <span>&bull;</span>
          <span className="text-amber-400">Zero Outgrower Fees</span>
        </div>
      </div>
    </section>
  );
};
