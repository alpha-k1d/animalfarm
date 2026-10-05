// src/components/OverviewView.tsx - Opening Landing Page with Ghana Agro Visuals & Live Performance Charts
import React, { useState } from 'react';
import { 
  Sprout, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  Landmark, 
  BarChart3, 
  PieChart as PieIcon, 
  Layers, 
  CheckSquare, 
  Clock, 
  MapPin, 
  DollarSign, 
  Users, 
  Smartphone,
  ChevronRight,
  Sparkles,
  Building2,
  Share2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';
import { Task, FarmPackage, User, WithdrawalRequest } from '../types';
import { GhanaFlag } from './GhanaFlag';
import { AppLogo } from './AppLogo';
import { StoriesSection } from './StoriesSection';
import { LiveCashoutFeed } from './LiveCashoutFeed';

// Real Ghanaian Agriculture Imagery generated specifically for this platform
import farmHeroImg from '../assets/images/ghana_farm_hero_1789914832509.jpg';
import poultryImg from '../assets/images/ghana_poultry_inspection_1789914844874.jpg';
import aquacultureImg from '../assets/images/fresh_volta_tilapia_1790597448926.jpg';
import cattleImg from '../assets/images/ghana_cattle_ranch_1789914871748.jpg';

interface OverviewViewProps {
  onNavigate: (tab: string) => void;
  onOpenOfficialCredentials: () => void;
  onOpenFarmerIdCard: () => void;
  onSelectTask: (task: Task) => void;
  tasks: Task[];
  farmPackages: FarmPackage[];
  user: User;
  withdrawals?: WithdrawalRequest[];
  whatsappChannelUrl?: string;
  whatsappChannelName?: string;
  whatsappChannelEnabled?: boolean;
}

// Chart 1 Data: Monthly Outgrower Mobile Money Disbursements (GH₵ in Thousands)
const monthlyDisbursementsData = [
  { month: 'Oct 24', disbursementsGHS: 142000, verifiedProtocols: 3120, activeOutgrowers: 4200 },
  { month: 'Nov 24', disbursementsGHS: 218000, verifiedProtocols: 4890, activeOutgrowers: 6100 },
  { month: 'Dec 24', disbursementsGHS: 365000, verifiedProtocols: 7340, activeOutgrowers: 8900 },
  { month: 'Jan 25', disbursementsGHS: 442000, verifiedProtocols: 8850, activeOutgrowers: 10800 },
  { month: 'Feb 25', disbursementsGHS: 589000, verifiedProtocols: 11420, activeOutgrowers: 12900 },
  { month: 'Mar 25', disbursementsGHS: 724000, verifiedProtocols: 14280, activeOutgrowers: 15400 },
];

// Chart 2 Data: Sector Allocation across Ghana Co-operatives
const sectorDistributionData = [
  { name: 'Poultry & Layers', value: 38, ghs: 'GH₵ 698K', color: '#047857' },
  { name: 'Aquaculture (Volta & Ponds)', value: 24, ghs: 'GH₵ 442K', color: '#0284c7' },
  { name: 'Cattle & Small Ruminants', value: 20, ghs: 'GH₵ 368K', color: '#d97706' },
  { name: 'Commercial Vegetables', value: 18, ghs: 'GH₵ 334K', color: '#10b981' },
];

// Chart 3 Data: Regional Performance (Submitted vs MoFA-Verified Protocols)
const regionalPerformanceData = [
  { region: 'Ashanti', submitted: 3420, verified: 3290, payoutGHS: 182000 },
  { region: 'Greater Accra', submitted: 4200, verified: 4080, payoutGHS: 224000 },
  { region: 'Eastern (Afram)', submitted: 2850, verified: 2740, payoutGHS: 156000 },
  { region: 'Volta Belt', submitted: 2310, verified: 2250, payoutGHS: 128000 },
  { region: 'Bono (Dormaa)', submitted: 3100, verified: 3010, payoutGHS: 171000 },
  { region: 'Northern / Savanna', submitted: 1940, verified: 1860, payoutGHS: 104000 },
];

// Chart 4 Data: Instant MoMo Settlement Speed (Average Seconds from MoFA Validation to Rail Credit)
const settlementSpeedData = [
  { time: '08:00', avgSeconds: 195, volume: 140 },
  { time: '10:00', avgSeconds: 162, volume: 380 },
  { time: '12:00', avgSeconds: 148, volume: 520 },
  { time: '14:00', avgSeconds: 139, volume: 490 },
  { time: '16:00', avgSeconds: 155, volume: 410 },
  { time: '18:00', avgSeconds: 142, volume: 290 },
];

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  onOpenOfficialCredentials,
  onOpenFarmerIdCard,
  onSelectTask,
  tasks,
  farmPackages,
  user,
  withdrawals = [],
  whatsappChannelUrl = 'https://whatsapp.com/channel/0029VaFarmGhanaOfficial',
  whatsappChannelName = 'Animal Farm Ghana Official Broadcast Channel',
  whatsappChannelEnabled = true
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'disbursements' | 'regional' | 'speed'>('disbursements');

  return (
    <div className="space-y-12 pb-12">
      {/* Sovereign Hero Spotlight with Authentic Ghana Agriculture Imagery */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-950/20 bg-emerald-950 text-white">
        {/* Background Hero Picture with Ambient Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={farmHeroImg} 
            alt="Commercial agriculture outgrower farm in Ghana" 
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105 transform hover:scale-100 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-r from-emerald-950 via-emerald-950/90 to-emerald-900/60" />
          <div className="absolute inset-0 bg-radial from-transparent to-black/60" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 p-4 sm:p-8 lg:p-12 max-w-5xl space-y-5 sm:space-y-6">
          {/* Official Masthead Badge with Catchy Logo */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-4">
            <AppLogo size="lg" className="sm:hidden shadow-lg border-2 border-amber-400" />
            <AppLogo size="xl" className="hidden sm:flex shadow-lg border-2 border-amber-400" />
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-amber-400 text-emerald-950 font-bold text-[10px] sm:text-xs shadow-md">
                  <GhanaFlag size="sm" />
                  <span className="tracking-wide uppercase font-official-heading">
                    Republic of Ghana &bull; MoFA Extension Registry
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700/80 text-emerald-200 text-[10px] sm:text-xs font-mono">
                  <Landmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Co-operative Act, 1968 (N.L.C.D. 252) Reg: CS-98421-2023</span>
                </div>
              </div>
              <p className="text-xs text-amber-300 font-official-heading tracking-wider uppercase font-bold">
                Animal Farm Ghana Co-operative Society Limited
              </p>
            </div>
          </div>

          {/* Sovereign Title */}
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-official-serif tracking-tight text-white leading-tight">
              Earn Daily Mobile Money for Farm Tasks in Ghana
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm lg:text-base leading-relaxed max-w-3xl">
              Complete simple agricultural inspections, take photos of farm activities, or sponsor local poultry, fish, and livestock units. Get paid directly to your MTN MoMo, Telecel Cash, or AT Money wallet in Ghana Cedi (GH₵).
            </p>
          </div>

          {/* Quick Action Buttons - Mobile Ergonomics */}
          <div className="pt-2 flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-row items-stretch lg:items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => onNavigate('tasks')}
              className="tap-bounce px-5 sm:px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Start Earning Tasks</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('packages')}
              className="tap-bounce px-5 sm:px-6 py-3.5 bg-emerald-900/90 hover:bg-emerald-800 text-white border border-emerald-700 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-amber-300" />
              <span>Sponsor Farm Units (35%)</span>
            </button>

            <div className="grid grid-cols-2 gap-2 sm:contents">
              <button
                onClick={() => onNavigate('wallet')}
                className="tap-bounce px-4 py-3 bg-emerald-950/80 hover:bg-emerald-900 text-amber-200 border border-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>My Wallet</span>
              </button>

              <button
                onClick={onOpenFarmerIdCard}
                className="tap-bounce px-4 py-3 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Farmer Pass</span>
              </button>

              {whatsappChannelEnabled && (
                <a
                  href={whatsappChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-2 sm:col-span-1 tap-bounce px-4 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white border border-[#25D366] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                  title={`Join ${whatsappChannelName} on WhatsApp`}
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp Channel</span>
                </a>
              )}
            </div>
          </div>

          {/* Live System Metric Indicators */}
          <div className="pt-5 sm:pt-6 border-t border-emerald-800/80 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 text-xs">
            <div className="p-2.5 sm:p-3 bg-emerald-900/40 rounded-xl border border-emerald-800/60">
              <span className="text-[9px] sm:text-[10px] text-emerald-300 uppercase font-semibold block">Total Cedi Disbursed</span>
              <span className="text-base sm:text-lg lg:text-xl font-mono font-black text-amber-300 truncate block">GH₵ 2,480,000+</span>
              <span className="text-[9px] sm:text-[10px] text-emerald-400 block mt-0.5 truncate">Direct via MTN & Telecel</span>
            </div>

            <div className="p-2.5 sm:p-3 bg-emerald-900/40 rounded-xl border border-emerald-800/60">
              <span className="text-[9px] sm:text-[10px] text-emerald-300 uppercase font-semibold block">Verified Protocols</span>
              <span className="text-base sm:text-lg lg:text-xl font-mono font-black text-white truncate block">49,890+</span>
              <span className="text-[9px] sm:text-[10px] text-emerald-400 block mt-0.5 truncate">MoFA GS 957 Standards</span>
            </div>

            <div className="p-2.5 sm:p-3 bg-emerald-900/40 rounded-xl border border-emerald-800/60">
              <span className="text-[9px] sm:text-[10px] text-emerald-300 uppercase font-semibold block">Registered Outgrowers</span>
              <span className="text-base sm:text-lg lg:text-xl font-mono font-black text-white truncate block">15,420+</span>
              <span className="text-[9px] sm:text-[10px] text-emerald-400 block mt-0.5 truncate">Verified Ghana Card IDs</span>
            </div>

            <div className="p-2.5 sm:p-3 bg-emerald-900/40 rounded-xl border border-emerald-800/60">
              <span className="text-[9px] sm:text-[10px] text-emerald-300 uppercase font-semibold block">Settlement Speed</span>
              <span className="text-base sm:text-lg lg:text-xl font-mono font-black text-emerald-300 truncate block">2.5 Mins</span>
              <span className="text-[9px] sm:text-[10px] text-emerald-400 block mt-0.5 truncate">Automated Mobile Rail</span>
            </div>
          </div>
        </div>
      </section>

      {/* Official WhatsApp Broadcast Channel Banner */}
      {whatsappChannelEnabled && (
        <section className="bg-linear-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-5 sm:p-6 border border-emerald-700/80 shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
                <Share2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-ping" />
                  <span>OFFICIAL OUTGROWER BROADCAST NETWORK</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {whatsappChannelName}
                </h3>
                <p className="text-xs text-emerald-100/90 leading-relaxed max-w-xl">
                  Join our verified WhatsApp Channel for daily MoMo payout announcements, harvest maturity alerts, biosecurity advisory bulletins, and direct cooperative updates.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href={whatsappChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-bounce w-full sm:w-auto px-5 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Join Official WhatsApp Channel</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Live Feed of Cashout Withdrawals across Ghana Outgrower Cooperatives */}
      <LiveCashoutFeed
        userCashouts={withdrawals}
        onCashoutClick={() => onNavigate('wallet')}
      />

      {/* Sector Photographic Showcase with Real Ghanaian Agriculture Pics */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold mb-1">
              <Sprout className="w-3.5 h-3.5 text-emerald-700" />
              <span>GHANA AGRIBUSINESS CLUSTERS IN ACTION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-official-serif text-emerald-950">
              Commercial Farming Sectors & Live Field Operations
            </h2>
          </div>
          <button
            onClick={() => onNavigate('tasks')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Active Protocols</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4-Column Photographic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Poultry Operations */}
          <div className="bg-white rounded-2xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div>
              <div className="relative h-48 overflow-hidden bg-zinc-100">
                <img 
                  src={poultryImg} 
                  alt="Modern commercial poultry house in Ghana" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-emerald-950/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-1 rounded-md border border-amber-400/40">
                  POULTRY & BROILERS
                </div>
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono">
                  Afienya & Dormaa Hubs
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-zinc-900 text-sm group-hover:text-emerald-900 transition-colors">
                  Commercial Broiler & Layer Housing
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Daily biosecurity checks, bird mortality logs, vaccine adherence, and automated feeding monitoring across Greater Accra and Bono belts.
                </p>
              </div>
            </div>
            <div className="p-4 pt-0 border-t border-zinc-100 flex items-center justify-between text-xs mt-3">
              <span className="font-bold text-emerald-900 font-mono">GH₵ 12.00 - 35.00 / log</span>
              <button 
                onClick={() => onNavigate('tasks')}
                className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer flex items-center gap-0.5"
              >
                Inspect <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Lake Volta Aquaculture */}
          <div className="bg-white rounded-2xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div>
              <div className="relative h-48 overflow-hidden bg-zinc-100">
                <img 
                  src={aquacultureImg} 
                  alt="Lake Volta tilapia aquaculture cages" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-emerald-950/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-1 rounded-md border border-amber-400/40">
                  AQUACULTURE & CAGES
                </div>
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono">
                  Lake Volta & Asutuare
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-zinc-900 text-sm group-hover:text-emerald-900 transition-colors">
                  Volta Basin Tilapia & Catfish Cages
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Water dissolved oxygen testing, floating mesh integrity, fingerling growth curves, and feeding schedules along the Volta river corridor.
                </p>
              </div>
            </div>
            <div className="p-4 pt-0 border-t border-zinc-100 flex items-center justify-between text-xs mt-3">
              <span className="font-bold text-emerald-900 font-mono">GH₵ 15.00 - 40.00 / log</span>
              <button 
                onClick={() => onNavigate('tasks')}
                className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer flex items-center gap-0.5"
              >
                Inspect <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Afram Plains Cattle Ranches */}
          <div className="bg-white rounded-2xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div>
              <div className="relative h-48 overflow-hidden bg-zinc-100">
                <img 
                  src={cattleImg} 
                  alt="Healthy grazing cattle in Afram Plains Ghana" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-emerald-950/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-1 rounded-md border border-amber-400/40">
                  CATTLE & RANCHING
                </div>
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono">
                  Afram Plains & Savannah
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-zinc-900 text-sm group-hover:text-emerald-900 transition-colors">
                  Savanna Pasture & Livestock Care
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Sanga cattle ear-tag biometric scanning, tick dip vat validation, veterinary vaccination passes, and pasture rotation documentation.
                </p>
              </div>
            </div>
            <div className="p-4 pt-0 border-t border-zinc-100 flex items-center justify-between text-xs mt-3">
              <span className="font-bold text-emerald-900 font-mono">GH₵ 18.00 - 50.00 / log</span>
              <button 
                onClick={() => onNavigate('tasks')}
                className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer flex items-center gap-0.5"
              >
                Inspect <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 4: Farm Packages / Outgrower Units */}
          <div className="bg-linear-to-b from-emerald-900 to-emerald-950 text-white rounded-2xl p-5 border-2 border-amber-400/60 flex flex-col justify-between shadow-sm">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold font-official-heading text-base text-amber-300">
                Co-operative Outgrower Sponsorship
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Co-fund operational cycles for 100-bird broiler flocks, 1,000-fingerling cages, or piggery breeding pens with audited harvest sharing.
              </p>
              <div className="space-y-1.5 pt-2 border-t border-emerald-800/80 text-xs">
                <div className="flex justify-between text-emerald-200">
                  <span>Broiler Unit:</span>
                  <strong className="text-white font-mono">GH₵ 350.00</strong>
                </div>
                <div className="flex justify-between text-emerald-200">
                  <span>Tilapia Cage:</span>
                  <strong className="text-white font-mono">GH₵ 600.00</strong>
                </div>
                <div className="flex justify-between text-emerald-200">
                  <span>Cattle Rearing:</span>
                  <strong className="text-white font-mono">GH₵ 1,200.00</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('packages')}
              className="mt-4 w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Explore Farm Units</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Charts Section: Live Ghanaian Telemetry & Settlement Rail */}
      <section className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-1">
              <BarChart3 className="w-3.5 h-3.5 text-amber-700" />
              <span>STATUTORY AUDIT & PERFORMANCE TELEMETRY</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-official-serif text-emerald-950">
              National Agricultural Disbursal & Regional Field Analytics
            </h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              Live cryptographic feeds of MoFA protocol approvals, Mobile Money payouts, and sector allocation across Ghana.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 self-start sm:self-auto">
            <button
              onClick={() => setActiveChartTab('disbursements')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeChartTab === 'disbursements'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Monthly Disbursements
            </button>
            <button
              onClick={() => setActiveChartTab('regional')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeChartTab === 'regional'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Regional Activity
            </button>
            <button
              onClick={() => setActiveChartTab('speed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeChartTab === 'speed'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Settlement Speed
            </button>
          </div>
        </div>

        {/* Charts Presentation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Column (2 cols) */}
          <div className="lg:col-span-2 bg-zinc-50/70 rounded-2xl p-4 sm:p-6 border border-zinc-200">
            {activeChartTab === 'disbursements' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-zinc-500 font-semibold block">Metric Focus:</span>
                    <strong className="text-zinc-900 text-sm">Monthly Mobile Money Payouts (GH₵) & Outgrower Growth</strong>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 font-mono font-bold text-[11px]">
                    MoMo + Telecel + AT
                  </span>
                </div>

                <div className="h-72 sm:h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyDisbursementsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="disbursementsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#047857" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#047857" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="protocolsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#d97706" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                      <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                      <YAxis stroke="#71717a" fontSize={11} tickFormatter={(val) => `GH₵${val / 1000}k`} />
                      <Tooltip 
                        formatter={(val: any, name: any) => [
                          name === 'disbursementsGHS' ? `GH₵ ${Number(val).toLocaleString()}` : `${Number(val).toLocaleString()} Protocols`, 
                          name === 'disbursementsGHS' ? 'Total Payout' : 'Verified Protocols'
                        ]}
                        contentStyle={{ backgroundColor: '#064e3b', borderColor: '#065f46', color: '#fff', borderRadius: '12px' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Area 
                        type="monotone" 
                        dataKey="disbursementsGHS" 
                        name="Disbursed (GH₵)" 
                        stroke="#047857" 
                        strokeWidth={2.5} 
                        fillOpacity={1} 
                        fill="url(#disbursementsGrad)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="verifiedProtocols" 
                        name="Verified Protocols" 
                        stroke="#d97706" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#protocolsGrad)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeChartTab === 'regional' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-zinc-500 font-semibold block">Regional Hubs:</span>
                    <strong className="text-zinc-900 text-sm">Submitted vs. Officially Verified Task Protocols</strong>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-mono font-bold text-[11px]">
                    16 Agro Corridors
                  </span>
                </div>

                <div className="h-72 sm:h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionalPerformanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                      <XAxis dataKey="region" stroke="#71717a" fontSize={11} />
                      <YAxis stroke="#71717a" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#064e3b', borderColor: '#065f46', color: '#fff', borderRadius: '12px' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="submitted" name="Field Submissions" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="verified" name="MoFA Certified" fill="#047857" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeChartTab === 'speed' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-zinc-500 font-semibold block">Real-time Settlement:</span>
                    <strong className="text-zinc-900 text-sm">Bank of Ghana Rail Payout Speed (Seconds)</strong>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 font-mono font-bold text-[11px]">
                    Median: 148s
                  </span>
                </div>

                <div className="h-72 sm:h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={settlementSpeedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                      <XAxis dataKey="time" stroke="#71717a" fontSize={11} />
                      <YAxis stroke="#71717a" fontSize={11} domain={[100, 220]} tickFormatter={(val) => `${val}s`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#064e3b', borderColor: '#065f46', color: '#fff', borderRadius: '12px' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Line type="monotone" dataKey="avgSeconds" name="Settlement Time (Seconds)" stroke="#047857" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Secondary Column: Sector Distribution Donut & Statutory Highlights */}
          <div className="space-y-4">
            <div className="bg-zinc-50/70 rounded-2xl p-5 border border-zinc-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-zinc-900 font-official-heading uppercase tracking-wider">
                  Agro-Sector Allocation
                </h4>
                <PieIcon className="w-4 h-4 text-emerald-700" />
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {sectorDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any) => [`${value}% of Portfolio`, name]}
                      contentStyle={{ backgroundColor: '#064e3b', borderColor: '#065f46', color: '#fff', borderRadius: '10px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Sector Breakdown List */}
              <div className="space-y-2 text-xs border-t border-zinc-200 pt-3">
                {sectorDistributionData.map((sec, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sec.color }} />
                      <span className="text-zinc-700 font-medium">{sec.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-zinc-900">{sec.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statutory Quick Card */}
            <div className="bg-emerald-950 text-white rounded-2xl p-4 space-y-2 border border-emerald-900">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Audited Outgrower Security</span>
              </div>
              <p className="text-[11px] text-emerald-200 leading-relaxed">
                All payouts comply with Bank of Ghana Act 987 mobile financial regulations. Inspection data is cryptographically archived in the Ghana Gazette outgrower ledger.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Field Stories from Ghanaian Outgrowers with Authentic Photography */}
      <StoriesSection onNavigateToPackages={() => onNavigate('packages')} />

      {/* Simple 4-Step How It Works Section */}
      <section className="bg-linear-to-r from-emerald-900 via-emerald-950 to-zinc-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border-2 border-emerald-800 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest font-official-heading">
            Simple & Easy Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-official-serif text-white">
            How You Earn In 4 Easy Steps
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200">
            A straightforward process to complete farm tasks and receive instant mobile money payouts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div className="p-5 bg-emerald-900/50 rounded-2xl border border-emerald-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-emerald-950 font-black flex items-center justify-center text-sm">
              1
            </div>
            <h3 className="font-bold text-sm text-white">Choose a Task</h3>
            <p className="text-xs text-emerald-200 leading-relaxed">
              Pick a farm task from poultry, fish ponds, cattle, or crops that fits your location or knowledge.
            </p>
          </div>

          <div className="p-5 bg-emerald-900/50 rounded-2xl border border-emerald-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-emerald-950 font-black flex items-center justify-center text-sm">
              2
            </div>
            <h3 className="font-bold text-sm text-white">Submit Notes or Photo</h3>
            <p className="text-xs text-emerald-200 leading-relaxed">
              Answer simple questions or snap a quick photo showing the farm activity or condition.
            </p>
          </div>

          <div className="p-5 bg-emerald-900/50 rounded-2xl border border-emerald-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-emerald-950 font-black flex items-center justify-center text-sm">
              3
            </div>
            <h3 className="font-bold text-sm text-white">Quick Review</h3>
            <p className="text-xs text-emerald-200 leading-relaxed">
              Our farm extension team quickly verifies your submission to confirm guidelines were met.
            </p>
          </div>

          <div className="p-5 bg-emerald-900/50 rounded-2xl border border-emerald-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-emerald-950 font-black flex items-center justify-center text-sm">
              4
            </div>
            <h3 className="font-bold text-sm text-white">Instant MoMo Payout</h3>
            <p className="text-xs text-emerald-200 leading-relaxed">
              Cedi rewards are credited straight to your MTN Mobile Money, Telecel Cash, or AT Money wallet.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Protocols Ready for Immediate Execution */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-official-serif text-emerald-950">
              Featured Active Inspection Protocols
            </h2>
            <p className="text-xs text-zinc-600">
              Immediate inspection quotas available for certified outgrowers today.
            </p>
          </div>
          <button
            onClick={() => onNavigate('tasks')}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({tasks.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {tasks.slice(0, 3).map((task) => (
            <div 
              key={task.id} 
              className="bg-white rounded-2xl border border-zinc-200 hover:border-emerald-700 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {task.image && (
                <div className="relative h-36 w-full overflow-hidden bg-zinc-100">
                  <img
                    src={task.image}
                    alt={task.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="font-mono text-[9px] font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded border border-white/20">
                      {task.protocolCode}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className="font-mono font-black text-amber-300 text-xs bg-emerald-950/90 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-amber-400/40">
                      GH₵ {task.reward.toFixed(2)}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex justify-between items-center text-white text-[10px] font-medium">
                    <span className="bg-black/50 backdrop-blur-xs px-1.5 py-0.5 rounded">{task.category}</span>
                    {task.isAutomated && (
                      <span className="bg-amber-400 text-emerald-950 font-bold px-1.5 py-0.2 rounded text-[9px] uppercase tracking-wide">
                        Auto
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {!task.image && (
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {task.protocolCode}
                      </span>
                      <span className="font-mono font-black text-emerald-950 text-sm bg-amber-400/20 px-2 py-0.5 rounded text-emerald-900">
                        GH₵ {task.reward.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <h3 className="font-bold text-zinc-900 text-sm leading-snug line-clamp-2 group-hover:text-emerald-900 transition-colors">
                    {task.title}
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-medium">Est: {task.estimatedTime}</span>
                  <button
                    onClick={() => onSelectTask(task)}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>Execute</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
