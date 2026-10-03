// src/components/SessionLockedView.tsx - Professional Outgrower Session Security & Re-Activation Gate
import React from 'react';
import { User, FarmPackage } from '../types';
import { GhanaFlag } from './GhanaFlag';
import { AppLogo } from './AppLogo';
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  ArrowRight, 
  Sparkles, 
  Award, 
  IdCard, 
  Phone, 
  Wallet, 
  Sprout, 
  CheckCircle2, 
  KeyRound, 
  Layers, 
  Building2,
  FileCheck,
  AlertCircle
} from 'lucide-react';

interface SessionLockedViewProps {
  user: User;
  allUsers: User[];
  packages: FarmPackage[];
  onReactivate: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenOfficialCredentials: () => void;
  onSelectUser: (user: User) => void;
}

export const SessionLockedView: React.FC<SessionLockedViewProps> = ({
  user,
  allUsers,
  packages,
  onReactivate,
  onOpenLogin,
  onOpenRegister,
  onOpenOfficialCredentials,
  onSelectUser
}) => {
  const firstName = user.fullName.split(' ')[0] || 'Outgrower';
  const initials = user.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Republic & Cooperative Institutional Banner */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-emerald-800 relative overflow-hidden">
        {/* Background decorative watermark */}
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <ShieldCheck className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <GhanaFlag size="sm" />
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-400 font-official-heading bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-700">
              Department of Co-operatives &bull; Republic of Ghana
            </span>
            <span className="text-[11px] text-emerald-300 font-mono hidden sm:inline">
              Registry #CS-98421-2023
            </span>
          </div>

          <div className="flex items-start gap-4 pt-1">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0 shadow-md">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-official-serif text-white tracking-tight">
                Outgrower Session Securely Closed
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1 leading-relaxed">
                Your agricultural account credentials have logged out professionally. In compliance with the Co-operative Societies Act 1968 (NLCD 252), private livestock telemetry, daily task shifts, and your MoMo wallet balance of <strong className="text-amber-300 font-mono font-bold">GH₵ {user.walletBalance.toFixed(2)}</strong> are protected.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Credential Activation & Remembered Pass Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Outgrower Pass Card & Quick Activation (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-900/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base sm:text-lg font-black text-emerald-950">
                Remembered Outgrower Credentials
              </h2>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-950 font-bold text-xs rounded-full font-mono border border-emerald-200">
              Session Locked
            </span>
          </div>

          {/* Member Deed Credential Details */}
          <div className="bg-linear-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-2xl p-5 border-2 border-amber-400 shadow-md relative overflow-hidden">
            <div className="absolute top-2 right-3 opacity-20">
              <GhanaFlag size="lg" />
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-800 border-2 border-amber-400 flex items-center justify-center text-amber-300 font-black text-lg shadow-inner shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                    Official Outgrower Pass
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white truncate">
                  {user.fullName}
                </h3>
                <p className="text-xs text-emerald-200 font-mono">
                  {user.phone} &bull; {user.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-emerald-800/80 text-xs">
              <div>
                <span className="text-[10px] text-emerald-300 block uppercase font-bold">Membership No</span>
                <span className="font-mono font-bold text-white text-xs truncate block">
                  {user.membershipNumber || 'GH-AFG-FMR-2026-0142'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-300 block uppercase font-bold">Ghana Card PIN</span>
                <span className="font-mono font-bold text-white text-xs truncate block">
                  {user.ghanaCardPin || 'GHA-719401824-3'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-300 block uppercase font-bold">Agri Corridor</span>
                <span className="text-emerald-100 text-[11px] truncate block">
                  {user.district || 'Afienya-Tema Corridor'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-300 block uppercase font-bold">Secured Balance</span>
                <span className="font-mono font-black text-amber-300 text-sm block">
                  GH₵ {user.walletBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Action 1: 1-Tap Re-activate Credentials or Register */}
          <div className="space-y-3">
            {user.id !== 0 && user.phone ? (
              <button
                onClick={onReactivate}
                className="w-full py-4 px-6 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <KeyRound className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
                <span>Re-activate {firstName}&apos;s Credentials &amp; Resume Session</span>
                <ArrowRight className="w-5 h-5 text-emerald-300 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={onOpenRegister}
                className="w-full py-4 px-6 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <Sparkles className="w-5 h-5 text-emerald-950 group-hover:rotate-12 transition-transform" />
                <span>Register Outgrower Account (+GH₵ 10 Bonus)</span>
                <ArrowRight className="w-5 h-5 text-emerald-950 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={onOpenLogin}
                className="py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-extrabold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-zinc-300"
              >
                <Lock className="w-4 h-4 text-zinc-600" />
                <span>Sign In with Different ID</span>
              </button>

              <button
                onClick={onOpenRegister}
                className="py-3 px-4 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-950" />
                <span>New Registration (+GH₵ 20)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Statutory Co-operative Protections & Package Highlights (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Statutory Security Seal Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-zinc-200 shadow-md space-y-4">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-black text-sm text-zinc-900 uppercase tracking-wide">
                Institutional Safety Guarantees
              </h3>
            </div>

            <div className="space-y-3 text-xs text-zinc-600">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Guaranteed 35% Interest Commission:</strong> Every enrolled agricultural cycle earns a statutory 35% payout at harvest maturity.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>0% Fee MoMo Cashout:</strong> Instant disbursement to MTN MoMo, Telecel Cash, and AT Money through GhIPSS settlement switch.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>GS 957:2019 Biosecurity Insured:</strong> All livestock, broiler broods, and crop cycles are monitored by MoFA certified field extension officers.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenOfficialCredentials}
              className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-emerald-700" />
              <span>Verify Official Co-operative License</span>
            </button>
          </div>

          {/* Featured Commercial Package Preview */}
          <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-3xl p-5 border-2 border-amber-300 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">
                Featured Commercial Unit
              </span>
              <span className="text-xs font-black font-mono text-emerald-900">
                +35% Return
              </span>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-zinc-900">
                Ashanti Certified Hybrid Cocoa Agroforestry
              </h4>
              <p className="text-xs text-zinc-600 mt-1">
                Sponsorship: <strong className="text-emerald-950 font-mono">GH₵ 5,000.00</strong> &bull; Total Liquidation: <strong className="text-emerald-800 font-mono font-bold">GH₵ 6,750.00</strong> (Includes GH₵ 1,750.00 interest).
              </p>
            </div>

            <button
              onClick={onReactivate}
              className="w-full py-2 px-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Activate Credentials to Sponsor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Package Showcase Grid (Openly browsable while logged out) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div>
            <h3 className="text-lg font-black text-emerald-950 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-700" />
              <span>Available Co-operative Farm Sponsorship Units</span>
            </h3>
            <p className="text-xs text-zinc-600 mt-0.5">
              Browse government-regulated agricultural packages. Re-activate your session to enroll.
            </p>
          </div>

          <button
            onClick={onReactivate}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
          >
            <span>Activate Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.slice(0, 6).map(pkg => {
            const interest = Math.round((pkg.price * 0.35) * 100) / 100;
            const totalPayout = pkg.price + interest;

            return (
              <div 
                key={pkg.id} 
                className="bg-zinc-50 hover:bg-emerald-50/50 rounded-2xl p-4 border border-zinc-200 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {pkg.category}
                    </span>
                    <span className="text-xs font-black font-mono text-emerald-900">
                      GH₵ {pkg.price.toFixed(2)}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-zinc-900 mt-2">
                    {pkg.name}
                  </h4>
                  <p className="text-[11px] text-zinc-600 line-clamp-2 mt-1">
                    {pkg.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">35% Harvest Return</span>
                    <strong className="text-emerald-800 font-mono font-bold">+GH₵ {interest.toFixed(2)}</strong>
                  </div>

                  <button
                    onClick={onReactivate}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Sponsor Unit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
