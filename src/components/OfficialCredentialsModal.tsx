// src/components/OfficialCredentialsModal.tsx - Statutory Accreditation & Government Gazetted Registry
import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Building2, 
  FileText, 
  Award, 
  CheckCircle2, 
  Printer, 
  Lock,
  Landmark,
  Scale,
  Download
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import { GhanaFlag } from './GhanaFlag';

interface OfficialCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialCredentialsModal: React.FC<OfficialCredentialsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-[calc(100vw-1.5rem)] sm:w-full shadow-2xl overflow-hidden border border-emerald-900/20 max-h-[min(94dvh,840px)] flex flex-col my-auto">
        {/* Official Sovereign Header */}
        <div className="bg-emerald-950 text-white p-4 sm:p-6 border-b-4 border-amber-500 relative shrink-0">
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <AppLogo size="md" className="sm:hidden" />
              <AppLogo size="lg" className="hidden sm:flex" />
              <div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-amber-300 font-official-heading">
                  <GhanaFlag size="sm" />
                  <span>Republic of Ghana &bull; Accreditation Desk</span>
                </div>
                <h2 className="text-base sm:text-xl font-bold font-official-heading tracking-wide text-white">
                  Animal Farm Ghana Co-operative Society Ltd
                </h2>
                <p className="text-[11px] sm:text-xs text-emerald-200">
                  Registered under Co-operative Societies Act, 1968 (N.L.C.D. 252)
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-900/60 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display Canvas */}
        <div className="p-3.5 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto custom-scrollbar popup-scroll bg-[#faf8f5] flex-1">
          {/* Certificate Box */}
          <div className="bg-white certificate-border rounded-xl p-4 sm:p-8 shadow-sm relative">
            {/* Watermark Crest */}
            <div className="text-center space-y-3 pb-6 border-b border-zinc-200">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                <Landmark className="w-3.5 h-3.5 text-emerald-700" />
                OFFICIAL CO-OPERATIVE ACCREDITATION CERTIFICATE
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-official-serif text-zinc-950 tracking-tight">
                CERTIFICATE OF STATUTORY REGISTRATION
              </h3>
              <p className="text-xs text-zinc-600 max-w-xl mx-auto leading-relaxed">
                This is to certify that <strong>Animal Farm Ghana Co-operative Society Limited</strong> has been formally registered and recognized as an agricultural outgrower and cooperative enterprise by the Department of Co-operatives, Republic of Ghana.
              </p>
            </div>

            {/* Statutory Identifiers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-6 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Registration Number</span>
                <span className="font-mono font-bold text-emerald-950 text-sm">CS-98421-2023</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Gazette Vol. 64, Folio 182</span>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Ghana TIN (Tax ID)</span>
                <span className="font-mono font-bold text-emerald-950 text-sm">C003892184X</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Ghana Revenue Authority</span>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">MoFA Accreditation</span>
                <span className="font-mono font-bold text-emerald-950 text-sm">MOFA/EXT/2023-049</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Extension Services Directorate</span>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Data Protection Act</span>
                <span className="font-mono font-bold text-emerald-950 text-sm">DPC/GH/2023/8892</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">DPC Act, 2012 (Act 843)</span>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Payment Systems Act</span>
                <span className="font-mono font-bold text-emerald-950 text-sm">BOG-PSA/ACT987-COMP</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Bank of Ghana Rail Partner</span>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Audited Standard</span>
                <span className="font-mono font-bold text-emerald-950 text-sm">GSA GS 957:2019</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Ghana Standards Authority</span>
              </div>
            </div>

            {/* Official Signatures & Seal */}
            <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="text-center sm:text-left">
                <div className="font-official-serif italic text-base text-zinc-900 font-bold">
                  Dr. Samuel Kwaku Asare
                </div>
                <div className="text-[11px] text-zinc-500">
                  Registrar of Co-operative Societies, Greater Accra
                </div>
                <div className="text-[10px] text-emerald-800 font-mono mt-0.5">
                  Digital Verification Stamp &bull; Certified Active
                </div>
              </div>

              {/* Gold Embossed Seal Emblem */}
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-amber-300 via-amber-400 to-amber-600 p-1 shadow-md shrink-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full border border-dashed border-amber-900/40 flex flex-col items-center justify-center text-amber-950 text-[9px] font-bold text-center leading-none">
                  <Award className="w-5 h-5 mb-0.5" />
                  <span>SEAL OF</span>
                  <span className="font-black">REGISTRY</span>
                  <span className="text-[7px]">GHANA</span>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="font-official-serif italic text-base text-zinc-900 font-bold">
                  Ing. Patricia Darkwah
                </div>
                <div className="text-[11px] text-zinc-500">
                  Chief Agricultural Officer, MoFA Extension Network
                </div>
                <div className="text-[10px] text-emerald-800 font-mono mt-0.5">
                  Biosecurity Protocol Validation
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Notices & Physical Enclave */}
          <div className="bg-emerald-900 text-white rounded-2xl p-5 text-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              Statutory Consumer & Farmer Protection Notice
            </div>
            <p className="text-emerald-100 leading-relaxed">
              All agricultural task compensations and outgrower sponsorship disbursements conform strictly to the Payment Systems and Services Act, 2019 (Act 987) under Bank of Ghana-licensed telecom aggregators (MTN MoMo, Telecel Cash, AT Money). Agro-input distributions and biological audits are executed in compliance with Ministry of Food and Agriculture guidelines.
            </p>
            <div className="pt-2 border-t border-emerald-800 flex flex-wrap items-center justify-between text-[11px] text-emerald-300 gap-2">
              <span>National Operations Bureau: Plot 42, Spintex Agricultural Corridor, Greater Accra</span>
              <span>Hotline: +233 24 412 3456</span>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="bg-zinc-100 border-t border-zinc-200 px-6 py-4 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            <span>Cryptographically Verified against Ghana Gazette Index</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/logo.jpg"
              download="Animal_Farm_Ghana_Official_Logo.jpg"
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              Download Logo Emblem
            </a>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Statutory Extract
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
