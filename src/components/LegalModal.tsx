// src/components/LegalModal.tsx - Regulatory Compliance, Terms, Risk & Contact
import React from 'react';
import { X, ShieldCheck, AlertTriangle, Building2, FileText, Phone, Mail, MapPin } from 'lucide-react';

interface LegalModalProps {
  page: string | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ page, onClose }) => {
  if (!page) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-zinc-200">
        <div className="bg-emerald-950 text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-black text-base text-white capitalize">
              {page === 'contact' ? 'Contact Ghana Agro-Operations' :
               page === 'risk' ? 'Agricultural Risk Disclosure' :
               page === 'privacy' ? 'Ghana Data Privacy Policy' :
               'Terms of Agricultural Sponsorship'}
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar popup-scroll text-xs text-zinc-700 space-y-4 leading-relaxed">
          {page === 'contact' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <h4 className="font-black text-sm text-emerald-950">Animal Farm Ghana HQ</h4>
                <p className="text-xs text-emerald-800 mt-1">
                  Registered Agricultural Development & Cooperative Facilitator
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-zinc-900 font-bold">Physical Office:</strong>
                    <span>Plot 42, Spintex Agricultural Corridor, Near Accra Mall Commercial Annex, Greater Accra, Ghana.</span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-zinc-900 font-bold">Telephone / MoMo Desk:</strong>
                    <span>+233 24 412 3456 (MTN)</span>
                    <span className="block text-zinc-500">+233 20 892 1100 (Telecel)</span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-zinc-900 font-bold">Email Support:</strong>
                    <span>support@animalfarmghana.com</span>
                    <span className="block text-zinc-500">ops@animalfarmghana.com</span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-zinc-900 font-bold">Cooperative Hours:</strong>
                    <span>Mon - Fri: 08:00 - 17:00 GMT</span>
                    <span className="block text-zinc-500">Sat: 09:00 - 14:00 GMT</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {page === 'risk' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="font-bold">No Guaranteed Daily Returns / Strict Agricultural Reality</span>
              </div>
              <p>
                1. <strong>Biological Variables:</strong> Livestock farming, aquaculture, and poultry rearing are subject to biological cycles, environmental fluctuations, veterinary risks, feed conversion efficiency, and weather variations.
              </p>
              <p>
                2. <strong>No Fixed Financial Interest:</strong> Animal Farm Ghana does not operate as a financial deposit institution, microfinance bank, or daily percentage yield platform. All sponsorship funds are applied to real inputs (vaccines, fingerlings, chicks, feed).
              </p>
              <p>
                3. <strong>Field Task Proofs:</strong> Rewards earned by completing agricultural inspections require verifiable observations and photographic evidence. Fraudulent or recycled images will result in immediate disqualification.
              </p>
            </div>
          )}

          {page === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-zinc-900">1. Account Authenticity & Single Account Policy</h4>
              <p>
                To maintain transparency and satisfy Ghana financial regulations, each farmer is limited to exactly one active account verified through a Ghana telecom mobile number (MTN, Telecel, or AT).
              </p>
              <h4 className="font-bold text-zinc-900">2. Ghana Cedi Currency Standard</h4>
              <p>
                All account balances, task rewards, and sponsorship packages are denominated in Ghana Cedi (GH₵). Payouts are executed directly via Mobile Money or approved settlement rails.
              </p>
              <h4 className="font-bold text-zinc-900">3. Withdrawal Policy & 15-Day Payout Interval</h4>
              <p>
                The minimum withdrawal threshold is GH₵ 10.00. In accordance with cooperative harvest rotation bylaws, outgrowers are eligible to withdraw accrued balances once every 15 days. Payouts are executed directly via Mobile Money (MTN MoMo, Telecel Cash, or AT Money).
              </p>
            </div>
          )}

          {page === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-zinc-900">Data Protection Act Compliance</h4>
              <p>
                Animal Farm Ghana complies with the Ghana Data Protection Act, 2012 (Act 843). We collect telephone numbers exclusively for account authentication, SMS OTP delivery, and Mobile Money transfer routing.
              </p>
              <p>
                We do not sell personal farmer data or field logs to unauthorized third-party commercial entities.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
