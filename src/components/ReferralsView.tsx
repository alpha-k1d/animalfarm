// src/components/ReferralsView.tsx - Ghana Farmer Referral Program
import React, { useState } from 'react';
import { User } from '../types';
import { 
  Users, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Gift
} from 'lucide-react';

interface ReferralsViewProps {
  user: User;
  referralReward: number;
  requiredReferralsForFirstWithdrawal?: number;
  whatsappChannelUrl?: string;
  whatsappChannelName?: string;
  whatsappChannelEnabled?: boolean;
}

export const ReferralsView: React.FC<ReferralsViewProps> = ({
  user,
  referralReward = 5.00,
  requiredReferralsForFirstWithdrawal = 7,
  whatsappChannelUrl = 'https://whatsapp.com/channel/0029VaFarmGhanaOfficial',
  whatsappChannelName = 'Animal Farm Ghana Official Broadcast Channel',
  whatsappChannelEnabled = true
}) => {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://animalfarmghana.com/register.php?ref=${user.referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleReferred = [
    { name: 'Kofi Boateng', phone: '024****192', date: '2025-02-14', status: 'Rewarded', reward: referralReward },
    { name: 'Ama Serwaa', phone: '055****823', date: '2025-02-17', status: 'Pending 1st Task', reward: 0 },
    { name: 'Kwabena Appiah', phone: '020****419', date: '2025-02-21', status: 'Rewarded', reward: referralReward }
  ];

  const currentCount = user.referralCount ?? sampleReferred.length;
  const isFirstWithdrawalUnlocked = currentCount >= requiredReferralsForFirstWithdrawal;
  const progressPercent = Math.min(100, Math.round((currentCount / requiredReferralsForFirstWithdrawal) * 100));

  return (
    <div className="space-y-6">
      {/* Referral Hero */}
      <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mb-3">
            <Gift className="w-3.5 h-3.5 text-amber-700" /> Member Referral Program
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
            Invite Ghana Farmers & Earn GH₵ {referralReward.toFixed(2)} Each
          </h2>
          <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
            Share your unique referral link with agricultural students, poultry managers, and cooperative members across Ghana. When they verify their Ghana phone and complete their first task, you receive GH₵ {referralReward.toFixed(2)} directly in your rewards wallet.
          </p>

          {/* First Withdrawal Policy Progress Bar Card */}
          <div className="mt-6 p-4 sm:p-5 bg-emerald-50/80 rounded-2xl border border-emerald-300 text-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-800" />
                <span className="font-extrabold text-emerald-950 text-sm">
                  First Cashout Milestone: Refer {requiredReferralsForFirstWithdrawal} Farmers
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-full font-mono text-xs font-bold w-fit ${
                isFirstWithdrawalUnlocked 
                  ? 'bg-emerald-200 text-emerald-900 border border-emerald-400' 
                  : 'bg-amber-200 text-amber-950 border border-amber-400'
              }`}>
                {currentCount} of {requiredReferralsForFirstWithdrawal} Referred ({progressPercent}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-emerald-200/80 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-600 leading-relaxed">
              {isFirstWithdrawalUnlocked ? (
                <span className="text-emerald-800 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  You have satisfied the 7-member referral quota! Your rewards wallet is fully unlocked for Ghana Mobile Money cashouts.
                </span>
              ) : (
                <span>
                  All cooperative members must refer <strong>{requiredReferralsForFirstWithdrawal} people</strong> before initiating their first wallet withdrawal. You have {requiredReferralsForFirstWithdrawal - currentCount} more referral(s) to complete.
                </span>
              )}
            </p>
          </div>

          {/* Referral Link Copy & Share Actions */}
          <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-mono text-zinc-800 outline-hidden font-semibold truncate"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopy}
                className="tap-bounce flex-1 sm:flex-none px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Join Animal Farm Ghana Co-operative Society and earn daily MoMo rewards for simple farm inspection tasks: ${referralLink}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-bounce flex-1 sm:flex-none px-5 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                title="Share with fellow farmers on WhatsApp"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Invite</span>
              </a>

              {whatsappChannelEnabled && (
                <a
                  href={whatsappChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-bounce flex-1 sm:flex-none px-5 py-3 bg-emerald-900 hover:bg-emerald-950 text-amber-300 font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 border border-emerald-700"
                  title={`Follow ${whatsappChannelName} on WhatsApp`}
                >
                  <Share2 className="w-4 h-4 text-[#25D366]" />
                  <span>Official Channel</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Program Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
        <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-3">
            1
          </div>
          <h4 className="font-bold text-zinc-900 text-sm">Share Your Referral Link</h4>
          <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
            Send your invite code or WhatsApp link to farmers in Kumasi, Sunyani, Tamale, or Accra.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-3">
            2
          </div>
          <h4 className="font-bold text-zinc-900 text-sm">SMS Phone Verification</h4>
          <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
            New members verify their 6-digit OTP code to establish an authentic single account.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-3">
            3
          </div>
          <h4 className="font-bold text-zinc-900 text-sm">Automatic Commission</h4>
          <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
            Once they submit and have their 1st task proof verified, GH₵ {referralReward.toFixed(2)} is credited to you instantly.
          </p>
        </div>
      </div>

      {/* Referred Members Table & Mobile Card List */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-4 sm:p-6 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-black text-base text-zinc-900">Your Invited Network</h4>
          <span className="text-xs text-zinc-500 font-semibold">{sampleReferred.length} Members Registered</span>
        </div>

        {/* Mobile Referral Cards */}
        <div className="md:hidden space-y-2.5">
          {sampleReferred.map((r, idx) => (
            <div key={idx} className="p-3.5 bg-zinc-50/80 rounded-2xl border border-zinc-200/90 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-zinc-900 text-sm">{r.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  r.status === 'Rewarded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {r.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-500 text-[11px]">
                <span className="font-mono">{r.phone}</span>
                <span>{r.date}</span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-zinc-200/60 font-semibold">
                <span className="text-zinc-600">Earned:</span>
                <span className="font-mono font-black text-emerald-800">
                  {r.reward > 0 ? `+GH₵ ${r.reward.toFixed(2)}` : 'Pending 1st Task'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Farmer</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">Joined</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Your Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {sampleReferred.map((r, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3 font-bold text-zinc-900">{r.name}</td>
                  <td className="py-3 text-zinc-500 font-mono">{r.phone}</td>
                  <td className="py-3 text-zinc-400">{r.date}</td>
                  <td className="py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.status === 'Rewarded' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-black text-emerald-800">
                    {r.reward > 0 ? `+GH₵ ${r.reward.toFixed(2)}` : 'Pending'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
