// src/components/InspectionCertificateModal.tsx - Official Certificate of Field Verification
import React from 'react';
import { TaskSubmission } from '../types';
import { X, Award, CheckCircle2, Printer, ShieldCheck, MapPin, Calendar, Clock, FileCheck } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { GhanaFlag } from './GhanaFlag';

interface InspectionCertificateModalProps {
  submission: TaskSubmission | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InspectionCertificateModal: React.FC<InspectionCertificateModalProps> = ({
  submission,
  isOpen,
  onClose
}) => {
  if (!isOpen || !submission) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-[calc(100vw-1.5rem)] sm:w-full shadow-2xl overflow-hidden border border-emerald-900/20 max-h-[min(94dvh,800px)] flex flex-col my-auto">
        {/* Sovereign Header */}
        <div className="bg-emerald-950 text-white p-4 sm:p-5 flex justify-between items-center border-b-2 border-amber-500 shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="font-bold text-xs sm:text-base font-official-heading text-white truncate">
              Field Inspection Certificate
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-emerald-900/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Display */}
        <div className="p-3.5 sm:p-6 bg-[#faf8f5] space-y-4 sm:space-y-6 overflow-y-auto custom-scrollbar popup-scroll flex-1">
          <div className="bg-white certificate-border rounded-xl p-4 sm:p-8 shadow-sm relative">
            {/* National Crest & Header */}
            <div className="text-center space-y-2 pb-5 border-b border-zinc-200 flex flex-col items-center">
              <AppLogo size="lg" className="mb-1" />
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold">
                <GhanaFlag size="sm" /> <span>REPUBLIC OF GHANA &bull; AGRICULTURAL EXTENSION RAIL</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-official-serif text-emerald-950">
                CERTIFICATE OF FIELD INSPECTION & DATA VERIFICATION
              </h2>
              <div className="text-xs text-zinc-500 font-mono">
                SERIAL CERTIFICATE NO: <span className="text-emerald-900 font-bold">{submission.certificateNumber || `CERT-GH-2025-${submission.id}`}</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="my-6 space-y-4 text-xs text-zinc-700">
              <p className="leading-relaxed">
                This document certifies that on <strong>{submission.submittedAt}</strong>, an authorized field inspection was executed and recorded under the National Agricultural Verification Protocol by registered outgrower <strong>{submission.userName}</strong> (Telephone: {submission.userPhone}).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Inspection Protocol</span>
                  <span className="font-bold text-zinc-900 text-xs">{submission.taskTitle}</span>
                  <span className="text-[10px] font-mono text-emerald-800 block mt-0.5">
                    Code: {submission.protocolCode || 'MOFA-AFG-SPEC-01'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Sector / Category</span>
                  <span className="font-bold text-zinc-900 text-xs">{submission.category}</span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">Commercial Outgrower Sector</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Verified Coordinates</span>
                  <span className="font-mono text-zinc-900 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    {submission.verifiedCoordinates || '5.6037° N, 0.1870° W (Greater Accra)'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Settlement Disbursal</span>
                  <span className="font-bold text-emerald-900 text-xs">GH₵ {submission.rewardAmount.toFixed(2)} (Direct Mobile Money)</span>
                </div>
              </div>

              {/* Observation Extract */}
              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-900 block mb-1">
                  Recorded Field Telemetry & Biometric Observation
                </span>
                <p className="italic text-emerald-950 font-serif leading-relaxed">
                  "{submission.submissionText}"
                </p>
              </div>

              {submission.adminNotes && (
                <div className="p-3 bg-zinc-100 rounded-xl border border-zinc-200 text-zinc-700">
                  <span className="text-[10px] uppercase font-bold text-zinc-600 block mb-0.5">
                    Supervisor / Extension Officer Remark
                  </span>
                  <p>{submission.adminNotes}</p>
                </div>
              )}
            </div>

            {/* Signature & Seal */}
            <div className="pt-5 border-t border-zinc-200 flex justify-between items-center">
              <div>
                <div className="font-official-serif italic text-sm font-bold text-zinc-900">
                  {submission.inspectorName || 'Officer K. Appiah (MoFA Senior Inspector)'}
                </div>
                <div className="text-[10px] text-zinc-500">
                  Agricultural Extension Directorate, Republic of Ghana
                </div>
                <div className="text-[9px] text-emerald-700 font-mono mt-0.5">
                  Cryptographically Validated &bull; Timestamped
                </div>
              </div>

              <div className="w-16 h-16 rounded-full bg-emerald-900 text-amber-300 p-1 flex flex-col items-center justify-center text-center leading-none text-[8px] font-bold shadow-xs">
                <ShieldCheck className="w-4 h-4 mb-0.5 text-amber-400" />
                <span>OFFICIAL</span>
                <span>MOFA PASS</span>
                <span className="text-[6px] text-zinc-300">GHANA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-zinc-100 border-t border-zinc-200 px-6 py-4 flex justify-between items-center">
          <span className="text-xs text-zinc-500">Audit Reference: GH-EXT-{submission.id}</span>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Official Certificate
          </button>
        </div>
      </div>
    </div>
  );
};
