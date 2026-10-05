// src/components/PhoneVerificationModal.tsx - Ghana SMS OTP Verification Engine
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Phone, CheckCircle2, RefreshCw, X, MessageSquare } from 'lucide-react';
import { GhanaFlag } from './GhanaFlag';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  onVerifySuccess: () => void;
}

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  onClose,
  phone,
  onVerifySuccess
}) => {
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [simulatedCode, setSimulatedCode] = useState('748291');
  const [timer, setTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSimulatedCode(Math.floor(100000 + Math.random() * 900000).toString());
      setTimer(60);
      setOtpCode(['', '', '', '', '', '']);
      setErrorMsg(null);
      setVerifiedSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  if (!isOpen) return null;

  const handleInputChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val.slice(-1);
    }
    const newCode = [...otpCode];
    newCode[index] = val;
    setOtpCode(newCode);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleResend = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedCode(newCode);
    setTimer(60);
    setOtpCode(['', '', '', '', '', '']);
    setErrorMsg(null);
  };

  const handleAutoFill = () => {
    setOtpCode(simulatedCode.split(''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpCode.join('');
    if (entered.length < 6) {
      setErrorMsg('Please enter all 6 digits.');
      return;
    }

    if (entered !== simulatedCode) {
      setErrorMsg('Invalid OTP code. Please check SMS dispatch.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedSuccess(true);
      setTimeout(() => {
        onVerifySuccess();
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-zinc-200">
        <div className="bg-emerald-950 text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-black text-base text-white">Ghana Phone Verification</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar popup-scroll">
          {verifiedSuccess ? (
            <div className="py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-black text-lg text-emerald-950">Phone Verified!</h4>
              <p className="text-xs text-zinc-600 mt-1">
                Your account is now authenticated. You can submit agricultural tasks and request withdrawals.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-zinc-600">
                  We dispatched a 6-digit verification code via SMS to your Ghana mobile:
                </p>
                <div className="font-mono font-bold text-sm text-zinc-900 mt-1 flex items-center justify-center gap-1.5">
                  <GhanaFlag size="sm" /> <span>+233 {phone}</span>
                </div>
              </div>

              {/* Simulated SMS Toast Preview */}
              <div className="bg-zinc-900 text-white p-3 rounded-2xl border border-zinc-800 text-xs flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-bold">SMS [ANIMALFARM]:</span>
                    <span>Your OTP code is <strong className="text-amber-400 font-mono text-sm tracking-wider">{simulatedCode}</strong></span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>

              {/* 6 Digit Inputs */}
              <div className="flex justify-center gap-2 py-2">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleInputChange(idx, e.target.value)}
                    className="w-11 h-12 text-center text-lg font-black font-mono bg-zinc-50 border-2 border-zinc-200 focus:border-emerald-600 focus:bg-white rounded-xl outline-hidden transition-all"
                  />
                ))}
              </div>

              {errorMsg && (
                <div className="text-center text-xs text-rose-600 font-semibold">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? 'Verifying OTP...' : 'Verify Phone Number'}
              </button>

              <div className="text-center pt-2 text-xs text-zinc-500">
                {timer > 0 ? (
                  <span>Resend code in <strong>{timer}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend OTP Code</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
