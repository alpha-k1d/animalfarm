// src/components/FarmerIdCardModal.tsx - Official Ghana Outgrower Membership Pass
import React from 'react';
import { User } from '../types';
import { X, ShieldCheck, Printer, Award, QrCode, CheckCircle2, Building2 } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { GhanaFlag } from './GhanaFlag';

interface FarmerIdCardModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export const FarmerIdCardModal: React.FC<FarmerIdCardModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-[calc(100vw-1.5rem)] sm:w-full shadow-2xl overflow-hidden border border-emerald-900/20 max-h-[min(94dvh,760px)] flex flex-col my-auto">
        {/* Modal Top Header */}
        <div className="bg-emerald-950 text-white p-4 sm:p-5 flex justify-between items-center border-b-2 border-amber-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="font-bold text-xs sm:text-base font-official-heading text-white truncate">
              Outgrower Membership Credential
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-emerald-900/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-3.5 sm:p-6 bg-[#faf8f5] flex flex-col items-center overflow-y-auto custom-scrollbar popup-scroll flex-1">
          {/* Identity Pass Card */}
          <div className="w-full max-w-md bg-linear-to-b from-emerald-900 via-emerald-950 to-zinc-950 text-white rounded-2xl p-4 sm:p-6 shadow-xl border-2 border-amber-400/80 relative overflow-hidden">
            {/* Background Security Guilloche Embellishment */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
            
            {/* Flag Stripe Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 flex">
              <div className="w-1/3 bg-red-600" />
              <div className="w-1/3 bg-amber-400" />
              <div className="w-1/3 bg-green-600" />
            </div>

            {/* Header */}
            <div className="flex justify-between items-start pt-1 pb-3 border-b border-emerald-800/80">
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                  REPUBLIC OF GHANA &bull; MOFA PARTNER RAIL
                </div>
                <div className="font-bold text-xs font-official-heading tracking-wide text-white">
                  ANIMAL FARM GHANA COOPERATIVE
                </div>
                <div className="text-[9px] text-emerald-300">
                  National Outgrower & Field Inspector Registry
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <GhanaFlag size="sm" />
                <AppLogo size="sm" />
              </div>
            </div>

            {/* Middle Section: Avatar + Details */}
            <div className="py-4 flex gap-4 items-center">
              {/* Profile Avatar / Photo Frame */}
              <div className="w-20 h-24 rounded-xl bg-emerald-800/80 border-2 border-amber-300 p-1 flex flex-col items-center justify-center shrink-0 text-center shadow-inner">
                <div className="w-14 h-14 rounded-lg bg-amber-100 text-emerald-950 font-black text-xl flex items-center justify-center">
                  {user.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-[8px] font-bold text-emerald-200 mt-1 uppercase">VERIFIED</span>
              </div>

              {/* Data Grid */}
              <div className="flex-1 space-y-1 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-emerald-400 block leading-none">Full Name</span>
                  <span className="font-bold text-sm text-white">{user.fullName}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-emerald-400 block leading-none">Member No.</span>
                    <span className="font-mono text-[11px] font-bold text-amber-300">{user.membershipNumber}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-emerald-400 block leading-none">Ghana Card</span>
                    <span className="font-mono text-[11px] font-bold text-white">{user.ghanaCardPin}</span>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[9px] uppercase font-bold text-emerald-400 block leading-none">Assigned District</span>
                  <span className="text-[10px] text-emerald-200 font-medium">{user.district}</span>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Stamp + Barcode + Status */}
            <div className="pt-3 border-t border-emerald-800/80 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold">STATUS: CERTIFIED PRODUCER</span>
              </div>

              <div className="font-mono text-[9px] text-zinc-400 tracking-wider">
                REG: CS-98421-2023
              </div>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 mt-4 text-center max-w-sm">
            This digital membership credential is valid for field inspection access, inputs collection, and MoFA agro-extension subsidy reconciliation.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="bg-zinc-100 border-t border-zinc-200 px-6 py-3.5 flex justify-between items-center">
          <span className="text-xs text-zinc-600 font-medium">Official Registry Proof</span>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Member Card
          </button>
        </div>
      </div>
    </div>
  );
};
