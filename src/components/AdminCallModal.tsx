// src/components/AdminCallModal.tsx - Live Voice Call Receiver & Outbound Dispatcher for Admin Portal
import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  User as UserIcon, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Phone, 
  Save, 
  CheckCircle2, 
  Radio, 
  MessageSquare,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { UserCallLog, User } from '../types';
import { sounds } from '../services/soundEffects';
import { GhanaFlag } from './GhanaFlag';

interface AdminCallModalProps {
  call: UserCallLog | null;
  onAnswerCall: (callId: string) => void;
  onDeclineCall: (callId: string) => void;
  onEndCall: (callId: string, durationSeconds: number, notes: string) => void;
  onOpenMessageWithUser?: (userId: number) => void;
  allUsers: User[];
}

export const AdminCallModal: React.FC<AdminCallModalProps> = ({
  call,
  onAnswerCall,
  onDeclineCall,
  onEndCall,
  onOpenMessageWithUser,
  allUsers = []
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [callNotes, setCallNotes] = useState('');
  const timerRef = useRef<any>(null);

  const matchedUser = allUsers.find(u => u.id === call?.userId) || null;

  // Sound effects & timer management
  useEffect(() => {
    if (!call) {
      sounds.stopIncomingCallRingtone();
      if (timerRef.current) clearInterval(timerRef.current);
      setSeconds(0);
      setCallNotes('');
      return;
    }

    if (call.status === 'ringing') {
      sounds.startIncomingCallRingtone();
    } else if (call.status === 'connected') {
      sounds.stopIncomingCallRingtone();
      sounds.playCallConnectedChime();
      timerRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      sounds.stopIncomingCallRingtone();
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      sounds.stopIncomingCallRingtone();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [call?.status]);

  if (!call || call.status === 'completed' || call.status === 'missed') {
    return null;
  }

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-emerald-800 overflow-hidden flex flex-col">
        {/* Header Ribbon */}
        <div className="bg-emerald-950 text-white p-5 text-center relative">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-300 font-bold uppercase tracking-wider mb-1">
            <GhanaFlag size="sm" />
            <span>National Operations Telecom Rail</span>
          </div>

          <h3 className="font-official-serif text-lg font-bold text-white">
            {call.status === 'ringing' ? 'Incoming Outgrower Voice Call' : 'Active Connected Call'}
          </h3>

          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                call.status === 'ringing' ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                call.status === 'ringing' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
            </span>
            <span className="text-xs font-mono font-bold text-emerald-200">
              {call.status === 'ringing' ? 'Ringing (GhIPSS Voice Switch)...' : `Live: ${formatTimer(seconds)}`}
            </span>
          </div>
        </div>

        {/* Caller Card Body */}
        <div className="p-6 space-y-5">
          {/* Avatar & Calling Pulse */}
          <div className="flex flex-col items-center text-center">
            <div className="relative my-2">
              <div className={`w-20 h-20 rounded-full bg-emerald-900 border-4 border-amber-400 text-amber-300 flex items-center justify-center text-2xl font-black shadow-lg ${
                call.status === 'ringing' ? 'animate-bounce' : ''
              }`}>
                {matchedUser?.avatar ? (
                  <img 
                    src={matchedUser.avatar} 
                    alt={call.userName} 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  <span>{call.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-600 text-white rounded-full ring-2 ring-white">
                <Phone className="w-3.5 h-3.5" />
              </div>
            </div>

            <h4 className="text-lg font-bold text-zinc-900 font-official-heading mt-2">
              {call.userName}
            </h4>
            <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono mt-0.5">
              <span className="font-bold text-emerald-800">{call.userPhone}</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1 text-zinc-500">
                <MapPin className="w-3 h-3 text-emerald-600" />
                {call.district}
              </span>
            </div>

            {call.purpose && (
              <div className="mt-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[11px] font-semibold text-amber-900">
                Inquiry: {call.purpose}
              </div>
            )}
          </div>

          {/* Member Quick Bio Card */}
          {matchedUser && (
            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs space-y-1.5">
              <div className="flex justify-between items-center text-zinc-600">
                <span>Member ID / Pass:</span>
                <span className="font-bold font-mono text-zinc-900">{matchedUser.membershipNumber || 'GH-AFG-FMR-2026'}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>Ghana Card (NIA):</span>
                <span className="font-bold font-mono text-zinc-900">{matchedUser.ghanaCardPin || 'Verified'}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>Wallet Balance:</span>
                <span className="font-bold font-mono text-emerald-700">GH₵ {matchedUser.walletBalance.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Live Audio Waves Simulation when Connected */}
          {call.status === 'connected' && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-1 h-8 bg-emerald-50 rounded-xl p-2 border border-emerald-200">
                {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 65, 40].map((h, i) => (
                  <span 
                    key={i}
                    className="w-1.5 bg-emerald-600 rounded-full transition-all duration-150 animate-pulse"
                    style={{ 
                      height: `${isMuted ? 4 : Math.max(8, (h * ((seconds % 2 === 0 ? 1 : 0.8))))}%`,
                      animationDelay: `${i * 80}ms` 
                    }}
                  />
                ))}
              </div>

              {/* Call Controls: Mute, Speaker */}
              <div className="flex items-center justify-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                    isMuted ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
                  }`}
                >
                  {isMuted ? <MicOff className="w-4 h-4 text-rose-600" /> : <Mic className="w-4 h-4 text-zinc-700" />}
                  <span>{isMuted ? 'Muted' : 'Mute Mic'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSpeaker(!isSpeaker)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                    !isSpeaker ? 'bg-zinc-200 text-zinc-700 border-zinc-300' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                  }`}
                >
                  {isSpeaker ? <Volume2 className="w-4 h-4 text-emerald-700" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
                  <span>{isSpeaker ? 'Speaker On' : 'Speaker Off'}</span>
                </button>
              </div>

              {/* Supervisor Call Resolution Notes */}
              <div>
                <label className="block text-zinc-600 font-bold text-[11px] mb-1">
                  Supervisor Desk Call Notes / Log:
                </label>
                <input
                  type="text"
                  value={callNotes}
                  onChange={e => setCallNotes(e.target.value)}
                  placeholder="e.g. Advised on broiler shifting and verified MoMo clearance."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            {call.status === 'ringing' ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onDeclineCall(call.id)}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Decline / Busy</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAnswerCall(call.id)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 animate-pulse"
                >
                  <PhoneCall className="w-4 h-4 text-amber-300" />
                  <span>Answer Call</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onEndCall(call.id, seconds, callNotes)}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End & Log Call ({formatTimer(seconds)})</span>
                </button>

                {onOpenMessageWithUser && (
                  <button
                    type="button"
                    onClick={() => {
                      onEndCall(call.id, seconds, callNotes);
                      onOpenMessageWithUser(call.userId);
                    }}
                    className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Send Follow-Up Message to {call.userName}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
