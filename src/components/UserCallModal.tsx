// src/components/UserCallModal.tsx - User Voice Call Interface to Bureau Administration Desk
import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Headphones, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { User, UserCallLog } from '../types';
import { GhanaFlag } from './GhanaFlag';
import { AppLogo } from './AppLogo';

interface UserCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onInitiateCall: (purpose: string, type: 'voice_call' | 'callback_request') => void;
  activeCall: UserCallLog | null;
  onEndCall: (callId: string) => void;
}

export const UserCallModal: React.FC<UserCallModalProps> = ({
  isOpen,
  onClose,
  user,
  onInitiateCall,
  activeCall,
  onEndCall
}) => {
  const [purpose, setPurpose] = useState('General Outgrower & Package Assistance');
  const [callType, setCallType] = useState<'voice_call' | 'callback_request'>('voice_call');
  const [isCalling, setIsCalling] = useState(false);
  const [callbackSent, setCallbackSent] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let timer: any = null;
    if (activeCall?.status === 'connected') {
      timer = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeCall?.status]);

  if (!isOpen) return null;

  const handleStartCall = () => {
    setIsCalling(true);
    setCallbackSent(false);
    onInitiateCall(purpose, 'voice_call');
  };

  const handleRequestCallback = () => {
    onInitiateCall(purpose, 'callback_request');
    setCallbackSent(true);
    setTimeout(() => {
      setCallbackSent(false);
      onClose();
    }, 2800);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
  };

  const isCurrentCallActive = activeCall && (activeCall.status === 'ringing' || activeCall.status === 'connected');

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-emerald-900 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AppLogo size="sm" />
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                <GhanaFlag size="sm" />
                <span>MoFA Co-operative Bureau Dispatch</span>
              </div>
              <h3 className="font-official-serif text-base font-bold text-white">
                Live Bureau Voice Desk
              </h3>
            </div>
          </div>
          <button 
            onClick={() => {
              if (activeCall) onEndCall(activeCall.id);
              onClose();
            }}
            className="text-emerald-300 hover:text-white p-1 rounded-xl hover:bg-emerald-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {callbackSent ? (
            <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-emerald-950">
                Callback Dispatched to Supervisor!
              </h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                An active callback ticket has been placed on the Chief Operations Officer&apos;s queue for <strong>{user.fullName}</strong> at <strong>{user.phone}</strong>. A supervisor will call you promptly.
              </p>
            </div>
          ) : isCurrentCallActive ? (
            /* Active Call Screen */
            <div className="text-center space-y-4 py-2">
              <div className="relative mx-auto w-20 h-20">
                <div className={`w-20 h-20 rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center border-4 border-amber-400 shadow-xl ${
                  activeCall.status === 'ringing' ? 'animate-pulse' : ''
                }`}>
                  <Headphones className="w-9 h-9" />
                </div>
                <div className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-600 text-white rounded-full ring-2 ring-white">
                  <Phone className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-base text-zinc-900 font-official-heading">
                  Officer Kwame Boateng
                </h4>
                <p className="text-xs text-emerald-800 font-medium">
                  Animal Farm Ghana National Operations Bureau
                </p>
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  <span>{activeCall.status === 'ringing' ? 'Ringing Bureau Desk...' : `Connected: ${formatTimer(callDuration)}`}</span>
                </div>
              </div>

              {activeCall.status === 'connected' && (
                <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
                  <div className="flex items-center justify-center gap-1 h-6">
                    {[30, 60, 90, 45, 80, 50, 70, 95, 40].map((h, i) => (
                      <span 
                        key={i} 
                        className="w-1.5 bg-emerald-600 rounded-full animate-pulse" 
                        style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} 
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Voice transmission 256-bit encrypted under GhIPSS telecom standards.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (activeCall) onEndCall(activeCall.id);
                  setIsCalling(false);
                }}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>
          ) : (
            /* Call Initiation Form */
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Direct Co-op Voice Assistance:</strong> Speak directly with statutory supervisors regarding 35% package maturity, MoMo withdrawals, or shift proofs.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wider">
                  Inquiry Category / Call Purpose
                </label>
                <select
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden"
                >
                  <option value="Withdrawal & MoMo GhIPSS Rail Clearance">Withdrawal & MoMo GhIPSS Rail Clearance</option>
                  <option value="35% Maturity Return & Package Sponsorship">35% Maturity Return & Package Sponsorship</option>
                  <option value="Shift & Daily Task Verification Sign-off">Shift & Daily Task Verification Sign-off</option>
                  <option value="General Outgrower & Package Assistance">General Outgrower & Package Assistance</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleStartCall}
                  className="p-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 group"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PhoneCall className="w-4 h-4 text-amber-300" />
                  </div>
                  <span>Start Live Voice Call</span>
                  <span className="text-[10px] text-emerald-200 font-normal">Instant Ring to Desk</span>
                </button>

                <button
                  type="button"
                  onClick={handleRequestCallback}
                  className="p-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 group"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-4 h-4 text-emerald-700" />
                  </div>
                  <span>Request Callback</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Officer Calls You Back</span>
                </button>
              </div>

              <div className="pt-2 border-t border-zinc-100 text-center">
                <a
                  href="tel:+233244123456"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-bold hover:underline"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Or dial direct phone line: +233 24 412 3456</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
