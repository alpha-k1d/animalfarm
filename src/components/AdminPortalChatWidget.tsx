// src/components/AdminPortalChatWidget.tsx - Floating Hover Admin Desk with Integrated Automated Reply Engine
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Headphones,
  Filter,
  Search,
  ChevronLeft,
  User as UserIcon,
  Phone,
  MapPin,
  CheckCheck,
  AlertTriangle,
  RotateCw,
  ArrowUpRight,
  PlusCircle,
  BadgeAlert,
  Bot,
  Zap,
  Cpu,
  Power,
  Sliders,
  Check
} from 'lucide-react';
import { GhanaFlag } from './GhanaFlag';
import { UserComplaintTicket, SupportChatMessage } from '../types';

interface AdminPortalChatWidgetProps {
  tickets: UserComplaintTicket[];
  onUpdateTicketStatus: (ticketId: string, status: UserComplaintTicket['status']) => void;
  onSendAdminReply: (ticketId: string, text: string) => void;
  onSimulateIncomingComplaint?: () => void;
}

export const AdminPortalChatWidget: React.FC<AdminPortalChatWidgetProps> = ({
  tickets,
  onUpdateTicketStatus,
  onSendAdminReply,
  onSimulateIncomingComplaint
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'investigating' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [notificationPing, setNotificationPing] = useState(false);
  const [autoResponderEnabled, setAutoResponderEnabled] = useState(true);
  const [autoRepliedTickets, setAutoRepliedTickets] = useState<Set<string>>(new Set());
  const [isAutoReplying, setIsAutoReplying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Unread & Pending counts
  const unreadCount = tickets.filter(t => t.unreadByAdmin).length;
  const pendingCount = tickets.filter(t => t.status === 'pending').length;

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;

  useEffect(() => {
    if (selectedTicketId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicketId, selectedTicket?.messages]);

  // Flash pulse effect on unread change
  useEffect(() => {
    if (unreadCount > 0) {
      setNotificationPing(true);
      const timer = setTimeout(() => setNotificationPing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Helper: Generate Context-Aware Automated Bureau Response
  const generateAutomatedBureauReply = useCallback((ticket: UserComplaintTicket): string => {
    const category = ticket.category;
    const farmerFirst = ticket.userName.split(' ')[0] || 'Farmer';
    const refId = ticket.id;

    if (category === 'Withdrawal & MoMo') {
      return `[MoFA Automated GhIPSS Rail] Hello ${farmerFirst}, your withdrawal telemetry inquiry has been matched with GhIPSS Instant Pay (GIP) settlement switch. All member cashouts to ${ticket.userPhone} clear with 0% co-op fee deductions. Transaction ticket ${refId} verified active.`;
    }

    if (category === 'Farm Inspection') {
      return `[MoFA Biosecurity Auto-Desk] Hello ${farmerFirst}, your sanitation photographs and bio-security inspection telemetry have been received and logged under GS 957:2019 standards. Verification confirmed for your cluster at ${ticket.district}. Shift rewards recorded.`;
    }

    if (category === 'Package & 35% Yield') {
      return `[Co-op Statutory Yield Engine] Hello ${farmerFirst}, under Animal Farm Ghana Co-operative bylaws, your sponsored farm units accrue routine care rewards daily, culminating in your guaranteed 35% statutory harvest payout upon 20-day maturity. Track details in 'Enrolled Farm Units'.`;
    }

    if (category === 'Task & Shift Verification') {
      return `[Automated Shift Telemetry] Hello ${farmerFirst}, daily agricultural shift logs (Morning, Midday, Evening) for your assigned livestock have been validated by our field sensor grid. Your daily wallet rewards have been approved.`;
    }

    return `[Official Bureau Auto-Dispatcher] Hello ${farmerFirst}, your communication to Animal Farm Ghana Bureau has been logged under Ref: ${refId}. An Agricultural Extension Officer for the ${ticket.district} corridor has been notified.`;
  }, []);

  // Automated Response Engine: Auto-reply to newly pending tickets if enabled
  useEffect(() => {
    if (!autoResponderEnabled) return;

    tickets.forEach(ticket => {
      // If ticket is pending, has user messages, and hasn't received admin reply or auto reply yet
      const hasAdminReply = ticket.messages.some(m => m.sender === 'admin');
      if (ticket.status === 'pending' && !hasAdminReply && !autoRepliedTickets.has(ticket.id)) {
        setAutoRepliedTickets(prev => new Set(prev).add(ticket.id));
        
        // Slight natural delay for automated processing
        const timer = setTimeout(() => {
          const autoReply = generateAutomatedBureauReply(ticket);
          onSendAdminReply(ticket.id, autoReply);
          onUpdateTicketStatus(ticket.id, 'replied');
        }, 1200);

        return () => clearTimeout(timer);
      }
    });
  }, [tickets, autoResponderEnabled, autoRepliedTickets, generateAutomatedBureauReply, onSendAdminReply, onUpdateTicketStatus]);

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    if (activeFilter === 'pending' && t.status !== 'pending') return false;
    if (activeFilter === 'investigating' && t.status !== 'investigating') return false;
    if (activeFilter === 'resolved' && t.status !== 'resolved') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.userName.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.district.toLowerCase().includes(q) ||
        t.userPhone.includes(q)
      );
    }
    return true;
  });

  const handleSendReply = (customText?: string) => {
    const text = (customText || replyText).trim();
    if (!text || !selectedTicketId) return;

    onSendAdminReply(selectedTicketId, text);
    setReplyText('');
  };

  // 1-Click Trigger Contextual Automated Reply for Current Ticket
  const handleTriggerInstantAutoReply = () => {
    if (!selectedTicket) return;
    setIsAutoReplying(true);
    const autoReply = generateAutomatedBureauReply(selectedTicket);

    setTimeout(() => {
      onSendAdminReply(selectedTicket.id, autoReply);
      onUpdateTicketStatus(selectedTicket.id, 'replied');
      setIsAutoReplying(false);
    }, 400);
  };

  const fastResponses = [
    'GhIPSS Mobile Money disbursement cleared. Kindly check your telecom SMS wallet prompt.',
    'Sanitation and biosecurity photos verified by Senior MoFA Extension Officer. Shift rewards approved.',
    'Daily routine tasks (Morning, Midday, Evening) require GPS-verified photo proof to accrue interest.',
    'Under co-operative rules, your 35% statutory maturity interest payout settles upon full 20-day maturity.',
    'Account and Ghana Card PIN match verified on the national cooperative agricultural registry.'
  ];

  return (
    <>
      {/* FLOATING HOVER ADMIN CHAT BUTTON */}
      <div 
        className="fixed bottom-24 right-5 sm:bottom-8 sm:right-8 z-50 select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative flex items-center">
          {/* Hover Tooltip / Status Callout */}
          {isHovered && !isOpen && (
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-emerald-950 text-white px-3.5 py-2 rounded-2xl shadow-xl border border-emerald-800 text-xs font-bold whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-150 flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-amber-300 font-mono">
                  {unreadCount > 0 ? `${unreadCount} Unread Complaints` : 'MoFA Bureau Desk'}
                </span>
              </div>
              <span className="text-zinc-400">&bull;</span>
              <span className="text-[11px] text-zinc-300">
                {autoResponderEnabled ? 'Automated Desk Active' : 'Manual Dispatch'}
              </span>
            </div>
          )}

          {/* Floating Action Beacon */}
          <button
            onClick={() => setIsOpen(prev => !prev)}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 cursor-pointer relative ${
              isOpen
                ? 'bg-zinc-900 text-white rotate-90 ring-4 ring-zinc-700/50'
                : unreadCount > 0
                ? 'bg-rose-600 text-white ring-4 ring-rose-300 animate-bounce'
                : 'bg-emerald-950 text-white ring-4 ring-emerald-500/30 hover:bg-emerald-900 shadow-emerald-950/40'
            }`}
            title="Open MoFA Complaints & Inquiries Support Desk"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <div className="relative">
                <Headphones className="w-7 h-7 text-amber-400" />
                {autoResponderEnabled && (
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-emerald-950 flex items-center justify-center" title="Auto-Responder Active">
                    <Zap className="w-2 h-2 text-white fill-white" />
                  </span>
                )}
              </div>
            )}

            {/* Unread / Pending Counter Badge */}
            {!isOpen && unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center ring-2 ring-white shadow-md animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* FLOATING ADMIN INQUIRIES & COMPLAINTS MODAL */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:bottom-24 sm:right-8 z-50 w-[95vw] sm:w-[500px] h-[600px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border-2 border-emerald-900/20 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="bg-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-900 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <GhanaFlag size="sm" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    MoFA Bureau Desk
                  </span>
                </div>
                <h3 className="font-black text-sm sm:text-base font-official-serif tracking-tight text-white flex items-center gap-2">
                  <span>Outgrower Complaints & Inquiries</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.2 bg-rose-600 text-white text-[10px] font-black rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Integrated Automated Reply Engine Status & Control Bar */}
          <div className="bg-emerald-900 text-emerald-100 px-4 py-2 flex items-center justify-between border-b border-emerald-800 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex h-2.5 w-2.5">
                {autoResponderEnabled && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${autoResponderEnabled ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
              </div>
              <span className="font-bold flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-amber-400" />
                <span>Auto-Responder Bot:</span>
                <strong className={autoResponderEnabled ? 'text-amber-300' : 'text-zinc-400'}>
                  {autoResponderEnabled ? 'ACTIVE (Instant)' : 'PAUSED'}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAutoResponderEnabled(prev => !prev)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  autoResponderEnabled
                    ? 'bg-emerald-800 text-emerald-200 hover:bg-emerald-700'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
                title="Toggle Automated Reply Bot"
              >
                <Power className="w-3 h-3" />
                <span>{autoResponderEnabled ? 'Turn Off' : 'Turn On'}</span>
              </button>

              {onSimulateIncomingComplaint && (
                <button
                  type="button"
                  onClick={onSimulateIncomingComplaint}
                  className="px-2 py-0.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black rounded-lg text-[10px] transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                  title="Simulate a new incoming farmer complaint"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>+ Test User</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Bar / Ticket Header */}
          {selectedTicket ? (
            <div className="bg-zinc-100 px-4 py-2.5 border-b border-zinc-200 flex items-center justify-between text-xs shrink-0">
              <button
                onClick={() => setSelectedTicketId(null)}
                className="flex items-center gap-1 text-zinc-700 hover:text-zinc-950 font-bold cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to All Inquiries</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 font-mono">{selectedTicket.id}</span>
                <select
                  value={selectedTicket.status}
                  onChange={e => onUpdateTicketStatus(selectedTicket.id, e.target.value as any)}
                  className="px-2 py-1 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="pending">Pending Review</option>
                  <option value="investigating">Under Investigation</option>
                  <option value="replied">Replied / Acknowledged</option>
                  <option value="resolved">Resolved & Closed</option>
                </select>
              </div>
            </div>
          ) : (
            /* Filter & Search Bar */
            <div className="p-3 bg-zinc-50 border-b border-zinc-200 space-y-2 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by farmer name, district, phone, ticket ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    activeFilter === 'all'
                      ? 'bg-emerald-950 text-white'
                      : 'bg-zinc-200/70 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  All ({tickets.length})
                </button>

                <button
                  onClick={() => setActiveFilter('pending')}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1 ${
                    activeFilter === 'pending'
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>Pending ({tickets.filter(t => t.status === 'pending').length})</span>
                </button>

                <button
                  onClick={() => setActiveFilter('investigating')}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    activeFilter === 'investigating'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                  }`}
                >
                  Under Review ({tickets.filter(t => t.status === 'investigating').length})
                </button>

                <button
                  onClick={() => setActiveFilter('resolved')}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    activeFilter === 'resolved'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                  }`}
                >
                  Resolved ({tickets.filter(t => t.status === 'resolved').length})
                </button>
              </div>
            </div>
          )}

          {/* Body: Ticket List OR Conversation Thread */}
          {!selectedTicket ? (
            /* Ticket Queue List */
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 custom-scrollbar">
              {filteredTickets.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="font-bold text-sm text-zinc-700">All outgrower inquiries addressed!</p>
                  <p className="text-xs text-zinc-400">No open complaints matching current filters.</p>
                </div>
              ) : (
                filteredTickets.map(ticket => {
                  const lastMessage = ticket.messages[ticket.messages.length - 1];
                  const hasAutoReply = ticket.messages.some(m => m.text.startsWith('[MoFA') || m.text.startsWith('[Co-op') || m.text.startsWith('[Automated'));

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`p-3.5 hover:bg-zinc-50 transition-colors cursor-pointer space-y-1.5 ${
                        ticket.unreadByAdmin ? 'bg-amber-50/50 border-l-4 border-l-amber-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-zinc-900">
                            {ticket.userName}
                          </span>
                          {ticket.priority === 'urgent' && (
                            <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded text-[9px] font-black uppercase">
                              Urgent
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-400 font-mono">{ticket.district}</span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            ticket.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : ticket.status === 'investigating'
                              ? 'bg-blue-100 text-blue-800'
                              : ticket.status === 'replied'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs font-bold text-emerald-950 truncate">
                        {ticket.subject}
                      </div>

                      <div className="text-[11px] text-zinc-500 truncate line-clamp-1">
                        {lastMessage ? (
                          <span>
                            <strong>{lastMessage.sender === 'admin' ? 'Officer Reply: ' : 'Farmer: '}</strong>
                            {lastMessage.text}
                          </span>
                        ) : (
                          'No messages recorded.'
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono pt-1">
                        <span className="text-emerald-700 font-semibold">{ticket.category}</span>
                        <div className="flex items-center gap-1.5">
                          {hasAutoReply && (
                            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                              <Bot className="w-3 h-3" /> Auto-Replied
                            </span>
                          )}
                          <span>&bull;</span>
                          <span>{ticket.updatedAt}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Selected Ticket Full Thread View */
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Farmer Quick Info Ribbon */}
              <div className="bg-emerald-50/90 px-4 py-2.5 border-b border-emerald-100 flex items-center justify-between text-xs shrink-0">
                <div>
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{selectedTicket.userName}</span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-200/80 px-1.5 py-0.2 rounded font-mono">
                      UID #{selectedTicket.userId}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-600 flex items-center gap-2 mt-0.5">
                    <span>{selectedTicket.district}</span>
                    <span>&bull;</span>
                    <span className="font-mono">{selectedTicket.userPhone}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block">Category</span>
                  <span className="font-bold text-emerald-900 text-[11px]">{selectedTicket.category}</span>
                </div>
              </div>

              {/* AUTOMATED BUREAU REPLY ACTION BANNER */}
              <div className="bg-linear-to-r from-emerald-900 to-emerald-950 text-white p-3 border-b border-emerald-800 flex items-center justify-between gap-3 shrink-0">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Bot className="w-4 h-4 text-amber-400" />
                    <span>Automated Bureau Response Engine</span>
                  </div>
                  <p className="text-[11px] text-emerald-200 truncate max-w-sm">
                    {generateAutomatedBureauReply(selectedTicket).slice(0, 75)}...
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerInstantAutoReply}
                  disabled={isAutoReplying}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Dispatch instant automated response tailored to this category"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{isAutoReplying ? 'Dispatching...' : 'Dispatch Auto-Reply'}</span>
                </button>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/50">
                {selectedTicket.messages.map(msg => {
                  const isAdmin = msg.sender === 'admin';
                  const isAutoMsg = msg.text.startsWith('[MoFA') || msg.text.startsWith('[Co-op') || msg.text.startsWith('[Automated') || msg.text.startsWith('[Official');

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 mb-0.5 px-1">
                        <span className="font-bold text-zinc-700">{msg.senderName}</span>
                        {isAutoMsg && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded flex items-center gap-0.5">
                            <Bot className="w-2.5 h-2.5" /> Auto-Dispatched
                          </span>
                        )}
                        <span>&bull;</span>
                        <span>{msg.time}</span>
                      </div>
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                          isAdmin
                            ? 'bg-emerald-950 text-white rounded-tr-xs shadow-xs'
                            : 'bg-white text-zinc-900 border border-zinc-200 rounded-tl-xs shadow-xs'
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Fast-Track Response Chips */}
              <div className="p-2 bg-zinc-100 border-t border-zinc-200 overflow-x-auto whitespace-nowrap shrink-0 flex gap-1.5">
                {fastResponses.map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendReply(template)}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-400 border border-zinc-300 rounded-lg text-[10px] text-zinc-700 font-medium cursor-pointer transition-colors shrink-0"
                  >
                    + {template.slice(0, 28)}...
                  </button>
                ))}
              </div>

              {/* Reply Input Bar */}
              <div className="p-3 bg-white border-t border-zinc-200 shrink-0">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendReply();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Type official MoFA bureau reply or dispatch above..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
