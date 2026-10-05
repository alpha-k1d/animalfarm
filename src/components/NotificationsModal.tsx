// src/components/NotificationsModal.tsx - Alerts & System Notifications
import React from 'react';
import { NotificationItem } from '../types';
import { X, Bell, Check, Clock } from 'lucide-react';

interface NotificationsModalProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-zinc-200">
        <div className="bg-emerald-950 text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h3 className="font-black text-base text-white">Notifications & Alerts</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto custom-scrollbar popup-scroll space-y-3">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              No notifications yet.
            </div>
          ) : (
            notifications.map(n => {
              const isUrgent = n.title.includes('[URGENT]');
              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border text-xs transition-all ${
                    isUrgent
                      ? 'bg-rose-50 border-rose-300 text-rose-950 ring-1 ring-rose-400'
                      : n.read 
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-600' 
                        : 'bg-emerald-50/70 border-emerald-200 text-zinc-900 font-medium'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className={`font-bold text-xs ${isUrgent ? 'text-rose-900' : 'text-zinc-900'}`}>{n.title}</h4>
                      {n.type === 'system' && (
                        <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                          Broadcast
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 whitespace-nowrap">{n.createdAt}</span>
                  </div>
                  <p className={`text-[11px] mt-1 leading-relaxed ${isUrgent ? 'text-rose-900' : 'text-zinc-600'}`}>
                    {n.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
          <button
            onClick={onMarkAllRead}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
