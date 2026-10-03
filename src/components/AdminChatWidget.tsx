// src/components/AdminChatWidget.tsx - Official Ministry & Cooperative Outgrower Desk Live Chat Widget with Integrated Automated Reply Engine
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  HelpCircle,
  Headphones,
  Award,
  ChevronDown,
  Minimize2,
  AlertTriangle,
  FileText,
  Bot,
  Zap,
  ArrowRight,
  ExternalLink,
  Layers,
  Wallet,
  CheckSquare,
  IdCard,
  RefreshCw,
  Share2
} from 'lucide-react';
import { GhanaFlag } from './GhanaFlag';
import { User, UserComplaintTicket, SupportChatMessage } from '../types';

interface AdminChatWidgetProps {
  user: User;
  onNavigateToTab?: (tab: string) => void;
  userTicket?: UserComplaintTicket;
  onSendMessageToBureau?: (text: string, category?: UserComplaintTicket['category'], priority?: 'urgent' | 'standard') => void;
  onRecordAutomatedReply?: (replyText: string) => void;
  whatsappChannelUrl?: string;
  whatsappChannelName?: string;
  whatsappChannelEnabled?: boolean;
}

// Knowledge Base & Intelligent Automated Reply Generator
const generateIntelligentAutomatedReply = (input: string, user: User) => {
  const lower = input.toLowerCase().trim();
  const firstName = user.fullName.split(' ')[0] || 'Farmer';

  // 1. Cocoa Package (GH₵ 5,000)
  if (lower.includes('cocoa') || lower.includes('5000') || lower.includes('5,000')) {
    return {
      text: `Hello ${firstName}! The Ashanti & Western Certified Hybrid Cocoa Agroforestry Estate is our premier commercial package priced at GH₵ 5,000.00. 
• Gestation / Maturation: 120 days
• Daily routine yield: GH₵ 150.00
• Guaranteed 35% statutory interest commission: +GH₵ 1,750.00
• Total harvest liquidation: GH₵ 6,750.00 payout.
You can sponsor this unit directly using Paystack (MTN MoMo, Telecel, Cards) or your available rewards wallet balance.`,
      actionTab: 'packages',
      actionLabel: 'View Cocoa Package in Agro Units'
    };
  }

  // 2. 35% Statutory Return / Maturity Interest
  if (lower.includes('35%') || lower.includes('interest') || lower.includes('maturity') || lower.includes('commission') || lower.includes('payout')) {
    return {
      text: `Under Section 18 of the Animal Farm Ghana Co-operative bylaws, every enrolled livestock and crop package guarantees an institutional 35% interest commission upon cycle maturity.
Examples:
• Broiler Unit (GH₵ 100): +GH₵ 35.00 return
• Maize Grain (GH₵ 150): +GH₵ 52.50 return
• Cattle Herd (GH₵ 2,000): +GH₵ 700.00 return
• Rice Paddy (GH₵ 4,000): +GH₵ 1,400.00 return
• Cocoa Estate (GH₵ 5,000): +GH₵ 1,750.00 return
Simply complete your 3 daily shifts (Morning, Midday, Evening) to maintain statutory compliance until final harvest maturity.`,
      actionTab: 'packages',
      actionLabel: 'Explore All 35% Return Packages'
    };
  }

  // 3. Mobile Money / Paystack Deposits
  if (lower.includes('deposit') || lower.includes('paystack') || lower.includes('momo deposit') || lower.includes('add money') || lower.includes('top up')) {
    return {
      text: `Depositing funds into your Animal Farm Ghana Rewards Wallet is 100% instant and 0% co-op fee via our 256-bit encrypted Paystack Ghana gateway.
• Supported: MTN Mobile Money, Telecel Cash, AT Money, and Visa/Mastercard.
• Security: Direct GhIPSS banking settlement.
• Instant credit: Your balance updates immediately upon entering your telecom PIN.
Tap below to open your wallet and initiate a deposit.`,
      actionTab: 'wallet',
      actionLabel: 'Open Wallet & Deposit Funds'
    };
  }

  // 4. Cashout Withdrawals & Speed
  if (lower.includes('withdraw') || lower.includes('cashout') || lower.includes('cash out') || lower.includes('transfer to momo') || lower.includes('money arrive')) {
    return {
      text: `Cashout withdrawals from your rewards wallet are disbursed directly to your registered ${user.phone} mobile money line with zero deduction fees.
• Minimum withdrawal: GH₵ 50.00
• Maximum single batch: GH₵ 1,000.00
• Processing speed: Dispatched immediately to GhIPSS telecom switch (clearing in 2 to 30 minutes).
Your current available wallet balance is GH₵ ${user.walletBalance.toFixed(2)}.`,
      actionTab: 'wallet',
      actionLabel: 'Request MoMo Cashout Now'
    };
  }

  // 5. 3 Daily Shifts / Routine Tasks / IoT Auto-Harvest
  if (lower.includes('shift') || lower.includes('task') || lower.includes('routine') || lower.includes('morning') || lower.includes('evening') || lower.includes('midday') || lower.includes('harvest')) {
    return {
      text: `To care for your sponsored animals and crops, each outgrower completes 3 quick routine shifts daily:
1. Morning Inspection (06:00 - 10:00): Feed ratio & biosecurity check.
2. Midday Monitoring (11:00 - 14:00): Ventilation & water verification.
3. Evening Biological Review (16:00 - 20:00): Rest count & IoT telemetry.
Tip: You can tap "1-Tap Complete Remaining Shifts Today" or "Run Automated Batch" inside the Earn Tasks tab to instantly log and receive shift earnings!`,
      actionTab: 'tasks',
      actionLabel: 'Go to Daily Earn Tasks'
    };
  }

  // 6. Registration, Ghana Card & Membership Pass
  if (lower.includes('register') || lower.includes('ghana card') || lower.includes('membership') || lower.includes('pass') || lower.includes('credentials') || lower.includes('nia')) {
    return {
      text: `Your official outgrower credentials:
• Name: ${user.fullName}
• Official Membership No: ${user.membershipNumber || 'GH-AFG-FMR-2026'}
• Ghana Card NIA PIN: ${user.ghanaCardPin || 'Verified on NIA Registry'}
• Regulated District: ${user.district || 'Afienya-Tema Agricultural Corridor'}
• Status: Active & Insured under GS 957:2019 biosecurity standards.`,
      actionTab: 'overview',
      actionLabel: 'View Member ID Card'
    };
  }

  // 7. Referral System & Commissions
  if (lower.includes('refer') || lower.includes('invite') || lower.includes('bonus') || lower.includes('code')) {
    return {
      text: `Your unique outgrower referral code is: ${user.referralCode || 'AFG-1001'}.
• Earn GH₵ 25.00 cash bonus directly into your Rewards Wallet whenever a sponsored farmer joins with your code.
• New members also receive an instant GH₵ 10.00 welcome bonus!
Share your referral code with agricultural peers across Ghana.`,
      actionTab: 'referrals',
      actionLabel: 'View Referral Network'
    };
  }

  // 8. Default Contextual Bureau Dispatch
  return {
    text: `Thank you for reaching out, ${firstName}. Your message has been logged in the MoFA Bureau administration queue under Reference #TKT-${Math.floor(100000 + Math.random() * 900000)}.
Our Agricultural Extension Officers and Co-operative Field Inspectors monitor this live desk continuously. If your inquiry requires immediate supervisor intervention, please tap 'File Complaint' above to escalate.`,
    actionTab: undefined,
    actionLabel: undefined
  };
};

export const AdminChatWidget: React.FC<AdminChatWidgetProps> = ({ 
  user, 
  onNavigateToTab,
  userTicket,
  onSendMessageToBureau,
  onRecordAutomatedReply,
  whatsappChannelUrl = 'https://whatsapp.com/channel/0029VaFarmGhanaOfficial',
  whatsappChannelName = 'Animal Farm Ghana Official Broadcast Channel',
  whatsappChannelEnabled = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintCategory, setComplaintCategory] = useState<UserComplaintTicket['category']>('Withdrawal & MoMo');
  const [complaintPriority, setComplaintPriority] = useState<'urgent' | 'standard'>('standard');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  const initialGreeting: SupportChatMessage = useMemo(() => ({
    id: 'msg-init-1',
    sender: 'admin',
    senderName: 'Officer Kwame Boateng (MoFA Bureau)',
    text: `Hello ${user.fullName.split(' ')[0]}! Welcome to Animal Farm Ghana Outgrower Support Desk. I am Officer Kwame Boateng from the MoFA Co-operative Bureau. Our integrated automated assistant and bureau officers are standing by. How can we assist you today?`,
    time: 'Just now',
    ticketRef: 'TICKET-DESK-01'
  }), [user.fullName]);

  // Local fallback messages when no ticket is active
  const [localMessages, setLocalMessages] = useState<SupportChatMessage[]>([initialGreeting]);

  // Combine ticket messages or fallback
  const displayMessages = userTicket?.messages && userTicket.messages.length > 0 
    ? userTicket.messages 
    : localMessages;

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, displayMessages, isTyping]);

  const quickPrompts = [
    { label: 'GH₵ 5,000 Cocoa Estate', query: 'Tell me about the new GH₵ 5,000 Cocoa Package' },
    { label: '35% Maturity Payout', query: 'How does the 35% interest commission work at maturity?' },
    { label: 'MoMo & Paystack Deposits', query: 'How do Mobile Money deposits and Paystack payments work?' },
    { label: 'Cashout Withdrawals', query: 'When will my cashout withdrawal arrive in my mobile money wallet?' },
    { label: '3 Daily Shifts', query: 'How do I complete my 3 daily routine tasks today?' },
    { label: 'My Credentials & Pass', query: 'Show my membership number and Ghana Card credentials' }
  ];

  const handleSendMessage = (textToSend?: string) => {
    const message = (textToSend || inputText).trim();
    if (!message) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: SupportChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      senderName: user.fullName,
      text: message,
      time: timeNow
    };

    setLocalMessages(prev => [...prev, userMsg]);
    
    // Dispatch to parent bureau ticket system
    if (onSendMessageToBureau) {
      onSendMessageToBureau(message, complaintCategory, complaintPriority);
    }

    if (!textToSend) setInputText('');
    setShowComplaintForm(false);

    // Trigger Integrated Automated Reply Engine
    if (autoReplyEnabled) {
      setIsTyping(true);

      const responseDelay = Math.min(1800, 800 + message.length * 15);
      setTimeout(() => {
        const replyObj = generateIntelligentAutomatedReply(message, user);

        const adminMsg: SupportChatMessage = {
          id: `admin-auto-${Date.now()}`,
          sender: 'admin',
          senderName: 'MoFA Bureau Auto-Desk (Officer Kwame Boateng)',
          text: replyObj.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ticketRef: `TICKET-${Math.floor(1000 + Math.random() * 9000)}`
        };

        setLocalMessages(prev => [...prev, adminMsg]);
        setIsTyping(false);

        // Notify parent if recording automated reply
        if (onRecordAutomatedReply) {
          onRecordAutomatedReply(replyObj.text);
        }

        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      }, responseDelay);
    }
  };

  const handleActionClick = (tab?: string) => {
    if (tab && onNavigateToTab) {
      onNavigateToTab(tab);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Hover Button - Bottom Right */}
      <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] right-3 sm:bottom-6 sm:right-6 z-40">
        <div className="relative flex items-center">
          {/* Hover Tooltip on Desktop */}
          {isHovered && !isOpen && (
            <div className="hidden sm:flex absolute right-16 items-center gap-2 px-3 py-1.5 bg-emerald-950 text-white rounded-xl shadow-xl border border-emerald-700 text-xs whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-150">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold">Chat with MoFA Outgrower Desk</span>
              <span className="text-[10px] text-amber-300 font-mono bg-emerald-900 px-1.5 py-0.2 rounded">
                Auto-Reply Active
              </span>
            </div>
          )}

          {/* Main Floating Trigger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-linear-to-tr from-emerald-800 to-emerald-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-2 border-amber-400 focus:outline-hidden ring-4 ring-emerald-950/20"
            aria-label="Open Admin Support Chat"
            title="Chat with Admin / MoFA Outgrower Support Desk"
          >
            {isOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
            ) : (
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 group-hover:scale-110 transition-transform" />
            )}

            {/* Unread Message Badge */}
            {unreadCount > 0 && !isOpen && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white animate-bounce shadow-md">
                {unreadCount}
              </span>
            )}

            {/* Pulsing Online Indicator */}
            <span className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-400 border-2 border-emerald-900" />
          </button>
        </div>
      </div>

      {/* Interactive Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] inset-x-2 sm:inset-x-auto sm:right-6 sm:bottom-20 z-50 w-auto sm:w-[420px] max-w-md bg-white rounded-3xl shadow-2xl border-2 border-emerald-800 overflow-hidden flex flex-col h-[540px] max-h-[calc(100dvh-5.5rem)] animate-in fade-in slide-in-from-bottom-3 duration-200">
          
          {/* Header */}
          <div className="bg-emerald-950 text-white p-4 flex justify-between items-center border-b-2 border-amber-500 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-800 border-2 border-amber-400 flex items-center justify-center font-black text-amber-300 text-sm shadow-xs">
                  KB
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-emerald-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-white leading-none">Officer Kwame Boateng</h4>
                  <GhanaFlag size="sm" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10px] text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>MoFA Co-op Bureau Desk</span>
                  </p>
                  <span className="text-[9px] bg-emerald-900/90 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold border border-emerald-700/60">
                    Auto-Reply Active
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowComplaintForm(!showComplaintForm)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                  showComplaintForm 
                    ? 'bg-amber-400 text-emerald-950 border-amber-300 font-black' 
                    : 'bg-emerald-900/80 text-amber-300 border-emerald-700 hover:bg-emerald-800'
                }`}
                title="File formal complaint to bureau"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>{showComplaintForm ? 'Chat View' : 'Dispute'}</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer hover:bg-emerald-900"
                title="Minimize chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Formal Complaint Submission Banner */}
          {showComplaintForm ? (
            <div className="p-4 bg-amber-50/95 border-b border-amber-200 space-y-3 shrink-0 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <span>File Formal Bureau Dispute / Complaint</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  Dispatched to Admin Portal
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 block mb-1">Dispute Category</label>
                  <select
                    value={complaintCategory}
                    onChange={e => setComplaintCategory(e.target.value as any)}
                    className="w-full text-xs p-1.5 bg-white border border-zinc-300 rounded-lg text-zinc-800 outline-hidden focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Withdrawal & MoMo">Withdrawal & MoMo</option>
                    <option value="Task & Shift Verification">Task & Shift Verification</option>
                    <option value="Package & 35% Yield">Package & 35% Yield</option>
                    <option value="Farm Inspection">Farm Inspection</option>
                    <option value="General Complaint">General Complaint</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-600 block mb-1">Priority Level</label>
                  <select
                    value={complaintPriority}
                    onChange={e => setComplaintPriority(e.target.value as any)}
                    className="w-full text-xs p-1.5 bg-white border border-zinc-300 rounded-lg text-zinc-800 outline-hidden focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="standard">Standard Inquiry</option>
                    <option value="urgent">Urgent Intervention</option>
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500">
                Your complaint is synchronized directly with the Admin Portal support queue with tracking ID.
              </p>
            </div>
          ) : null}

          {/* Chat Messages List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar popup-scroll bg-zinc-50/70">
            <div className="text-center my-1">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1.5 shadow-2xs">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Department of Co-operatives Direct Outgrower Channel</span>
              </span>
            </div>

            {/* Official WhatsApp Broadcast Channel Join Banner inside Chat */}
            {whatsappChannelEnabled && (
              <div className="p-3 bg-white rounded-2xl border border-emerald-300 shadow-2xs flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-900 truncate">
                      {whatsappChannelName}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">
                      Daily harvest notices & MoMo payout updates
                    </div>
                  </div>
                </div>
                <a
                  href={whatsappChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] font-bold rounded-lg shrink-0 transition-colors shadow-2xs"
                >
                  Join
                </a>
              </div>
            )}

            {displayMessages.map(msg => {
              const isAdmin = msg.sender === 'admin';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                      isAdmin
                        ? 'bg-white text-zinc-800 border border-zinc-200 rounded-bl-xs shadow-xs'
                        : 'bg-emerald-800 text-white rounded-br-xs shadow-xs'
                    }`}
                  >
                    {isAdmin && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 border-b border-zinc-100 pb-1">
                        <Bot className="w-3 h-3 text-emerald-600" />
                        <span>{msg.senderName}</span>
                      </div>
                    )}

                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Contextual Action Button if message matches topics */}
                    {isAdmin && (
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        {msg.text.includes('Cocoa') && (
                          <button
                            type="button"
                            onClick={() => handleActionClick('packages')}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Layers className="w-3 h-3 text-amber-700" />
                            <span>View Cocoa Package</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                        {(msg.text.includes('wallet') || msg.text.includes('Withdrawal') || msg.text.includes('deposit')) && (
                          <button
                            type="button"
                            onClick={() => handleActionClick('wallet')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Wallet className="w-3 h-3 text-emerald-700" />
                            <span>Open Rewards Wallet</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                        {(msg.text.includes('shift') || msg.text.includes('routine')) && (
                          <button
                            type="button"
                            onClick={() => handleActionClick('tasks')}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <CheckSquare className="w-3 h-3 text-blue-700" />
                            <span>Perform Shifts Today</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    )}

                    <div
                      className={`text-[9px] mt-1 flex items-center gap-1 justify-end font-mono ${
                        isAdmin ? 'text-zinc-400' : 'text-emerald-200'
                      }`}
                    >
                      {msg.ticketRef && <span className="text-amber-600 font-bold">{msg.ticketRef} &bull; </span>}
                      <span>{msg.time}</span>
                      {!isAdmin && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-300" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 p-2.5 bg-white rounded-2xl border border-zinc-200 w-fit text-xs text-zinc-600 shadow-xs animate-in fade-in">
                <Bot className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse delay-75" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse delay-150" />
                </div>
                <span className="text-[10px] font-semibold text-emerald-950 ml-1">
                  Bureau Auto-Responder is generating answer...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Prompts */}
          {!showComplaintForm && (
            <div className="p-2 bg-white border-t border-zinc-100 flex items-center gap-1.5 overflow-x-auto custom-scrollbar whitespace-nowrap shrink-0">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.query)}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Message Input Box */}
          <div className="p-3 bg-white border-t border-zinc-200 shrink-0">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={showComplaintForm ? "Detail your complaint or dispute..." : "Ask about packages, 35% return, MoMo..."}
                className="flex-1 px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-10 h-10 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-[9px] text-zinc-400 text-center mt-1.5 flex items-center justify-center gap-2">
              <span>Integrated Automated Reply Active</span>
              <span>&bull;</span>
              <span>Encrypted MoFA Outgrower Rail</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
