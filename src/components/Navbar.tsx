// src/components/Navbar.tsx - Global Responsive Header & Recoded Navigation
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { 
  Sprout, 
  Wallet, 
  CheckSquare, 
  Layers, 
  Users, 
  ShieldCheck, 
  Bell, 
  LogOut, 
  Phone,
  FileText,
  Building2,
  Award,
  IdCard,
  Landmark,
  Scale,
  Compass,
  ArrowLeft,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lock,
  Share2,
  Headphones,
  PhoneCall
} from 'lucide-react';
import { GhanaFlag } from './GhanaFlag';
import { AppLogo } from './AppLogo';

interface NavbarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenLegal: (page: string) => void;
  onOpenOfficialCredentials: () => void;
  onOpenFarmerIdCard: () => void;
  onOpenProfile?: () => void;
  onOpenAdminLogin: () => void;
  onOpenCallBureau?: () => void;
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onLoginClick?: () => void;
  whatsappChannelUrl?: string;
  whatsappChannelName?: string;
  whatsappChannelEnabled?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  unreadCount,
  onOpenNotifications,
  onOpenLegal,
  onOpenOfficialCredentials,
  onOpenFarmerIdCard,
  onOpenProfile,
  onOpenAdminLogin,
  onOpenCallBureau,
  isAdminMode,
  setIsAdminMode,
  isLoggedIn = true,
  onLogout,
  onLoginClick,
  whatsappChannelUrl = 'https://whatsapp.com/channel/0029VaFarmGhanaOfficial',
  whatsappChannelName = 'Animal Farm Ghana Official Broadcast Channel',
  whatsappChannelEnabled = true
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const initials = user.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleNavClick = (tab: string) => {
    setIsAdminMode(false);
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  // Auto-scroll active item into center view when activeTab changes
  useEffect(() => {
    if (mobileScrollRef.current) {
      const activeEl = mobileScrollRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeTab]);

  const scrollNav = (direction: 'left' | 'right') => {
    if (mobileScrollRef.current) {
      const offset = direction === 'left' ? -180 : 180;
      mobileScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-emerald-950/15 shadow-xs select-none">
      {/* Top Republic of Ghana Institutional Masthead */}
      <div className="bg-emerald-950 text-emerald-100 text-xs px-2.5 sm:px-4 py-1.5 border-b border-emerald-900/60 overflow-x-auto mobile-topbar-scroll whitespace-nowrap">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 min-w-max">
          <div className="flex items-center gap-2">
            <GhanaFlag size="sm" />
            <span className="font-bold tracking-wide uppercase font-official-heading text-[11px] text-amber-300">
              Republic of Ghana
            </span>
            <span className="hidden lg:inline text-emerald-400/80">&bull;</span>
            <span className="hidden lg:inline text-[11px] text-emerald-200">
              Department of Co-operatives Reg. No: <strong className="text-white font-mono">CS-98421-2023</strong> | 35% Package Commission Verified
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
            <button
              onClick={onOpenOfficialCredentials}
              className="hidden sm:flex px-2 py-0.5 rounded-md bg-emerald-900/90 hover:bg-emerald-800 text-amber-200 border border-emerald-700/60 items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">Official License</span>
            </button>

            <button 
              onClick={() => onOpenLegal('contact')}
              className="hidden sm:flex hover:text-white items-center gap-1 transition-colors cursor-pointer text-emerald-300"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Spintex Office</span>
            </button>

            {!isAdminMode && (
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="hidden sm:flex px-2 py-0.5 rounded-md bg-emerald-900/90 hover:bg-emerald-800 text-amber-300 border border-emerald-700/60 items-center gap-1.5 transition-colors cursor-pointer text-xs font-semibold"
                title="Authorized Administrator Portal access"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Admin Portal</span>
              </button>
            )}

            {isAdminMode && (
              <button
                onClick={() => setIsAdminMode(false)}
                className="px-2 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-amber-400 text-emerald-950 shadow-xs ring-2 ring-amber-300"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit Admin</span>
              </button>
            )}

            {/* Logout or Login Button */}
            {isLoggedIn ? (
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-800/80 font-bold text-xs transition-colors cursor-pointer"
                title="Log out of your account"
              >
                <LogOut className="w-3 h-3 text-rose-400" />
                <span>Log Out</span>
              </button>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs transition-colors cursor-pointer"
              >
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Official Emblem & Logo (Plants & Animals) */}
          <div 
            onClick={() => handleNavClick('overview')}
            className="flex items-center gap-3 cursor-pointer select-none group"
            title="Animal Farm Ghana - Agriculture & Livestock Cooperative"
          >
            <AppLogo size="md" className="group-hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-official-heading font-extrabold text-base sm:text-lg tracking-wide text-emerald-950 group-hover:text-emerald-800 transition-colors">
                  ANIMAL FARM
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-emerald-950 border border-amber-500/50 shadow-2xs">
                  GHANA
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-emerald-800 font-medium leading-none flex items-center gap-1">
                <span>Agricultural Cooperative Society</span>
                <span className="text-gray-300 hidden sm:inline">&bull;</span>
                <span className="text-emerald-700 font-bold hidden sm:inline">35% Commission</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {!isAdminMode ? (
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-gray-50/80 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => handleNavClick('overview')}
                className={`px-2.5 xl:px-3.5 py-1.5 rounded-lg text-[11px] xl:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                  activeTab === 'overview'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-gray-700 hover:text-emerald-900 hover:bg-gray-100'
                }`}
              >
                <Compass className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                <span>Home</span>
              </button>

              <button
                onClick={() => handleNavClick('tasks')}
                className={`px-2.5 xl:px-3.5 py-1.5 rounded-lg text-[11px] xl:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider relative ${
                  activeTab === 'tasks'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-gray-700 hover:text-emerald-900 hover:bg-gray-100'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                <span>Tasks</span>
              </button>

              <button
                onClick={() => handleNavClick('packages')}
                className={`px-2.5 xl:px-3.5 py-1.5 rounded-lg text-[11px] xl:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                  activeTab === 'packages'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-gray-700 hover:text-emerald-900 hover:bg-gray-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                <span>Units (35%)</span>
              </button>

              <button
                onClick={() => handleNavClick('wallet')}
                className={`px-2.5 xl:px-3.5 py-1.5 rounded-lg text-[11px] xl:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                  activeTab === 'wallet'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-gray-700 hover:text-emerald-900 hover:bg-gray-100'
                }`}
              >
                <Wallet className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                <span>Wallet</span>
              </button>

              <button
                onClick={() => handleNavClick('referrals')}
                className={`px-2.5 xl:px-3.5 py-1.5 rounded-lg text-[11px] xl:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                  activeTab === 'referrals'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-gray-700 hover:text-emerald-900 hover:bg-gray-100'
                }`}
              >
                <Users className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                <span>Referrals</span>
              </button>
            </nav>
          ) : null}

          {/* Right Controls: Balance + Notification + Mobile Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!isAdminMode && (
              isLoggedIn ? (
                <button
                  onClick={() => handleNavClick('wallet')}
                  className="tap-bounce bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer text-left shrink-0"
                  title="Your Current Balance (Min Withdrawal: GH₵ 10 | Max: GH₵ 1000)"
                >
                  <div className="hidden xs:flex w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-800 text-white items-center justify-center font-bold text-[10px] sm:text-xs shrink-0">
                    GH₵
                  </div>
                  <div>
                    <div className="hidden sm:block text-[8px] sm:text-[9px] uppercase font-bold text-emerald-800 leading-none">Balance</div>
                    <div className="text-[11px] sm:text-xs xl:text-sm font-black text-emerald-950 font-mono leading-tight whitespace-nowrap">
                      GH₵ {(user?.walletBalance ?? 0).toFixed(0)}<span className="hidden sm:inline">.{(user?.walletBalance ?? 0).toFixed(2).split('.')[1]}</span>
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="tap-bounce bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl flex items-center gap-1.5 sm:gap-2 font-extrabold text-xs shadow-xs transition-all cursor-pointer shrink-0"
                  title="Sign In to access your outgrower account"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Sign In / Register</span>
                  <span className="sm:hidden">Sign In</span>
                </button>
              )
            )}

            {/* WhatsApp Channel Button for Outgrowers */}
            {!isAdminMode && whatsappChannelEnabled && (
              <a
                href={whatsappChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-bounce hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] hover:text-[#075E54] border border-[#25D366]/40 rounded-xl text-xs font-bold transition-all shadow-2xs group shrink-0"
                title={`Join ${whatsappChannelName} on WhatsApp`}
              >
                <div className="w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <Share2 className="w-3 h-3" />
                </div>
                <span className="hidden xl:inline">WhatsApp Channel</span>
                <span className="xl:hidden">Channel</span>
              </a>
            )}

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="tap-bounce relative p-1.5 sm:p-2 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-emerald-900 transition-colors cursor-pointer shrink-0"
              title="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-rose-600 text-white text-[9px] sm:text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Member Pass Button */}
            {isLoggedIn && (
              <button
                onClick={onOpenFarmerIdCard}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                title="View Official Outgrower Card"
              >
                <IdCard className="w-3.5 h-3.5 text-emerald-700" />
                <span>Pass</span>
              </button>
            )}

            {/* User Profile Menu Button (Photo Upload & Account) - Shown on desktop/tablet */}
            {isLoggedIn && (
              <button
                onClick={onOpenProfile || onOpenFarmerIdCard}
                className="tap-bounce hidden md:flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl border border-emerald-300/80 bg-emerald-50/60 hover:bg-emerald-100 transition-all cursor-pointer group shrink-0"
                title="Profile Menu: Upload Photo & View Details"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-emerald-600 bg-emerald-900 text-amber-300 font-bold text-xs flex items-center justify-center">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.fullName} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                </div>

                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-gray-900 leading-tight flex items-center gap-1">
                    <span className="truncate max-w-[90px]">{user.fullName.split(' ')[0]}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                  </div>
                  <div className="text-[10px] text-emerald-800 font-semibold leading-none flex items-center gap-0.5">
                    <span>Profile</span>
                    <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                  </div>
                </div>
              </button>
            )}

            {/* Professional Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`tap-bounce lg:hidden shrink-0 w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                mobileMenuOpen 
                  ? 'bg-emerald-900 text-white border-emerald-950 shadow-md ring-2 ring-emerald-500/30' 
                  : 'bg-white hover:bg-emerald-50 text-emerald-950 border-emerald-200/90 shadow-2xs hover:border-emerald-300 active:scale-95'
              }`}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              title={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-amber-300 stroke-[2.5]" />
              ) : (
                <Menu className="w-5 h-5 text-emerald-950 stroke-[2.2]" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE HEADER HORIZONTAL SCROLL BAR - Fast, touch-friendly section & feature navigation */}
        <div className="lg:hidden border-t border-emerald-950/10 -mx-4 sm:-mx-6 bg-linear-to-r from-emerald-50/70 via-white to-amber-50/40 shadow-2xs">
          <div className="flex items-center px-1">
            {/* Scroll Left Quick Button */}
            <button
              type="button"
              onClick={() => scrollNav('left')}
              className="shrink-0 p-1.5 text-gray-400 hover:text-emerald-800 transition-colors cursor-pointer tap-bounce"
              aria-label="Scroll header navigation left"
              title="Scroll left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Horizontal Scroll Bar Container with Custom Visible Scrollbar */}
            <div
              ref={mobileScrollRef}
              className="mobile-header-scroll flex items-center gap-1.5 py-1.5 px-1 w-full select-none"
            >
              {/* 1. Overview / Home */}
              <button
                data-active={activeTab === 'overview'}
                onClick={() => handleNavClick('overview')}
                className={`tap-bounce shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/90 shadow-2xs'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>

              {/* 2. Tasks */}
              <button
                data-active={activeTab === 'tasks'}
                onClick={() => handleNavClick('tasks')}
                className={`tap-bounce shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap relative ${
                  activeTab === 'tasks'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/90 shadow-2xs'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Daily Tasks</span>
                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                  activeTab === 'tasks' ? 'bg-amber-400 text-emerald-950' : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  GH₵
                </span>
              </button>

              {/* 3. Packages & Units */}
              <button
                data-active={activeTab === 'packages'}
                onClick={() => handleNavClick('packages')}
                className={`tap-bounce shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'packages'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/90 shadow-2xs'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Units (35%)</span>
                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                  activeTab === 'packages' ? 'bg-emerald-950 text-amber-300' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  35%
                </span>
              </button>

              {/* 4. Wallet */}
              <button
                data-active={activeTab === 'wallet'}
                onClick={() => handleNavClick('wallet')}
                className={`tap-bounce shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'wallet'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/90 shadow-2xs'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Wallet</span>
                <span className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full ${
                  activeTab === 'wallet' ? 'bg-white text-emerald-900' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  GH₵ {(user?.walletBalance ?? 0).toFixed(0)}
                </span>
              </button>

              {/* 5. Referrals */}
              <button
                data-active={activeTab === 'referrals'}
                onClick={() => handleNavClick('referrals')}
                className={`tap-bounce shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'referrals'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/90 shadow-2xs'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Referrals</span>
                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                  activeTab === 'referrals' ? 'bg-amber-400 text-emerald-950' : 'bg-amber-50 text-amber-800 border border-amber-300'
                }`}>
                  GH₵ 5
                </span>
              </button>

              {/* WhatsApp Broadcast Channel Pill */}
              {whatsappChannelEnabled && (
                <a
                  href={whatsappChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-bounce shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#075E54] border border-[#25D366]/40 shadow-2xs"
                  title={`Join ${whatsappChannelName} on WhatsApp`}
                >
                  <Share2 className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>WhatsApp Channel</span>
                </a>
              )}

              {/* 6. Member Pass */}
              <button
                type="button"
                onClick={() => onOpenFarmerIdCard()}
                className="tap-bounce shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/90 shadow-2xs"
              >
                <IdCard className="w-3.5 h-3.5 text-emerald-700" />
                <span>Member Pass</span>
              </button>

              {/* 7. Official License */}
              <button
                type="button"
                onClick={() => onOpenOfficialCredentials()}
                className="tap-bounce shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/90 shadow-2xs"
              >
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Official License</span>
              </button>

              {/* 8. Spintex Office */}
              <button
                type="button"
                onClick={() => onOpenLegal('contact')}
                className="tap-bounce shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/90 shadow-2xs"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Spintex Office</span>
              </button>

              {/* 9. Official Gazette */}
              <button
                type="button"
                onClick={() => onOpenLegal('terms')}
                className="tap-bounce shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/90 shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-800" />
                <span>Gazette Rules</span>
              </button>

              {/* 10. Admin Portal Entry */}
              {!isAdminMode && (
                <button
                  type="button"
                  onClick={onOpenAdminLogin}
                  className="tap-bounce shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap bg-zinc-50 hover:bg-emerald-50 text-zinc-700 hover:text-emerald-900 border border-zinc-200/90 shadow-2xs"
                  title="Administrator Portal Access"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin Portal</span>
                </button>
              )}

              {/* Exit Admin Button only when actively in admin mode */}
              {isAdminMode && (
                <button
                  type="button"
                  onClick={() => setIsAdminMode(false)}
                  className="tap-bounce shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap bg-amber-400 text-emerald-950 font-black shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Exit Admin</span>
                </button>
              )}
            </div>

            {/* Scroll Right Quick Button */}
            <button
              type="button"
              onClick={() => scrollNav('right')}
              className="shrink-0 p-1.5 text-gray-400 hover:text-emerald-800 transition-colors cursor-pointer tap-bounce"
              aria-label="Scroll header navigation right"
              title="Scroll right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* PROFESSIONAL MOBILE SLIDE-OVER NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          {/* Backdrop Blur Overlay */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-emerald-950/75 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Slide-in Content Panel */}
          <div className="fixed inset-y-0 right-0 w-[88vw] max-w-sm bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250 border-l border-emerald-900/20">
            {/* Drawer Top Header */}
            <div className="bg-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-900 shrink-0">
              <div className="flex items-center gap-2.5">
                <AppLogo size="sm" />
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-bold uppercase tracking-wider font-official-heading">
                    <GhanaFlag size="sm" />
                    <span>Animal Farm Ghana</span>
                  </div>
                  <h3 className="font-bold text-sm text-white font-official-serif leading-tight">
                    Outgrower Portal
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-xl bg-emerald-900/90 text-emerald-200 hover:text-white hover:bg-emerald-800 flex items-center justify-center transition-colors cursor-pointer border border-emerald-700/60"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-amber-300" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs custom-scrollbar">
              {/* Member Status Card */}
              {isLoggedIn ? (
                <div className="p-3.5 bg-linear-to-br from-emerald-900 to-emerald-950 text-white rounded-2xl border border-emerald-700/60 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full ring-2 ring-amber-400 bg-emerald-800 text-amber-300 font-bold text-xs flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white leading-tight flex items-center gap-1">
                          <span>{user.fullName}</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        </div>
                        <div className="text-[10px] text-emerald-300 font-mono">
                          {user.phone}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 border border-emerald-700">
                      Active
                    </span>
                  </div>

                  <div className="pt-2 border-t border-emerald-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] text-emerald-300 uppercase font-semibold">Available Balance</div>
                      <div className="text-base font-black text-amber-300 font-mono leading-tight">
                        GH₵ {(user?.walletBalance ?? 0).toFixed(2)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNavClick('wallet')}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-[11px] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      <span>Wallet</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2.5">
                  <p className="text-xs text-emerald-950 font-bold">
                    Access your agricultural sponsorship & tasks
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLoginClick?.();
                    }}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-300" />
                    <span>Sign In or Register New Account</span>
                  </button>
                </div>
              )}

              {/* Direct Support & Voice Call Action */}
              <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs">
                    <Headphones className="w-4 h-4 text-amber-700" />
                    <span>National Bureau Dispatch</span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Online 24/7
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Call or message operations officers directly for immediate cashout verification or shift sign-offs.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenCallBureau) {
                        onOpenCallBureau();
                      } else {
                        window.location.href = 'tel:+233244123456';
                      }
                    }}
                    className="py-2 px-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-xl text-center flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-300" />
                    <span>Call Bureau</span>
                  </button>
                  {whatsappChannelEnabled && (
                    <a
                      href={whatsappChannelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#075E54] border border-[#25D366]/40 font-bold text-[11px] rounded-xl text-center flex items-center justify-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Main Navigation Items */}
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider px-1 mb-1.5">
                  Platform Sections
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleNavClick('overview')}
                    className={`w-full p-2.5 rounded-xl font-bold flex items-center justify-between transition-colors ${
                      activeTab === 'overview' ? 'bg-emerald-800 text-white' : 'hover:bg-zinc-100 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Compass className="w-4 h-4" />
                      <span>Home / Overview</span>
                    </div>
                    {activeTab === 'overview' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </button>

                  <button
                    onClick={() => handleNavClick('tasks')}
                    className={`w-full p-2.5 rounded-xl font-bold flex items-center justify-between transition-colors ${
                      activeTab === 'tasks' ? 'bg-emerald-800 text-white' : 'hover:bg-zinc-100 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckSquare className="w-4 h-4" />
                      <span>Daily Earn Tasks</span>
                    </div>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-400 text-emerald-950">
                      GH₵ Shifts
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavClick('packages')}
                    className={`w-full p-2.5 rounded-xl font-bold flex items-center justify-between transition-colors ${
                      activeTab === 'packages' ? 'bg-emerald-800 text-white' : 'hover:bg-zinc-100 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4" />
                      <span>Farm Units & Sponsorship</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                      35% Return
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavClick('wallet')}
                    className={`w-full p-2.5 rounded-xl font-bold flex items-center justify-between transition-colors ${
                      activeTab === 'wallet' ? 'bg-emerald-800 text-white' : 'hover:bg-zinc-100 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Wallet className="w-4 h-4" />
                      <span>Rewards Wallet</span>
                    </div>
                    <span className="font-mono font-bold text-[10px] text-emerald-700">
                      GH₵ {(user?.walletBalance ?? 0).toFixed(0)}
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavClick('referrals')}
                    className={`w-full p-2.5 rounded-xl font-bold flex items-center justify-between transition-colors ${
                      activeTab === 'referrals' ? 'bg-emerald-800 text-white' : 'hover:bg-zinc-100 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4" />
                      <span>Outgrower Referrals</span>
                    </div>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      +GH₵ 25
                    </span>
                  </button>
                </div>
              </div>

              {/* Statutory Utilities */}
              <div className="pt-2 border-t border-zinc-100">
                <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider px-1 mb-1.5">
                  Statutory Accreditation
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenFarmerIdCard();
                    }}
                    className="p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-semibold flex items-center gap-2 text-left"
                  >
                    <IdCard className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Member Pass</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenOfficialCredentials();
                    }}
                    className="p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-semibold flex items-center gap-2 text-left"
                  >
                    <Award className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Official License</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenLegal('contact');
                    }}
                    className="p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-semibold flex items-center gap-2 text-left"
                  >
                    <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Spintex Bureau</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenLegal('terms');
                    }}
                    className="p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-semibold flex items-center gap-2 text-left"
                  >
                    <FileText className="w-4 h-4 text-zinc-700 shrink-0" />
                    <span>Deed Bylaws</span>
                  </button>
                </div>
              </div>

              {/* Account & Profile Actions */}
              {isLoggedIn && (
                <div className="pt-2 border-t border-zinc-100 space-y-1.5">
                  {onOpenProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full p-2.5 rounded-xl bg-emerald-50 text-emerald-900 font-bold flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-emerald-700" />
                        <span>Update Profile Photo & Details</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-emerald-600" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout?.();
                    }}
                    className="w-full p-2.5 rounded-xl bg-rose-50 text-rose-800 font-bold flex items-center justify-between border border-rose-200"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Log Out of Session</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Bottom Bar with Discreet Admin Access */}
            <div className="p-3 bg-zinc-50 border-t border-zinc-200 text-center text-[10px] text-zinc-500 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminLogin();
                }}
                className="text-zinc-400 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3 h-3 text-zinc-400" />
                <span>Authorized Administrator Login</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIXED MOBILE BOTTOM NAVIGATION BAR (Fintech-grade ergonomics) */}
      {!isAdminMode ? (
        <nav 
          aria-label="Mobile Navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-emerald-950/10 px-2 sm:px-3 py-1.5 flex justify-around items-center shadow-[0_-4px_24px_rgba(0,0,0,0.06)] safe-bottom"
        >
          {/* 1. Home */}
          <button
            onClick={() => handleNavClick('overview')}
            className={`tap-bounce flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === 'overview' ? 'text-emerald-950 font-black' : 'text-zinc-500 font-medium hover:text-emerald-800'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${
              activeTab === 'overview' ? 'bg-emerald-100 text-emerald-950 shadow-2xs scale-105' : ''
            }`}>
              <Compass className={`w-5 h-5 ${activeTab === 'overview' ? 'stroke-[2.5] text-emerald-950' : 'stroke-[1.75]'}`} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Home</span>
            {activeTab === 'overview' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5 animate-in zoom-in-50 duration-150" />
            )}
          </button>

          {/* 2. Tasks */}
          <button
            onClick={() => handleNavClick('tasks')}
            className={`tap-bounce flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === 'tasks' ? 'text-emerald-950 font-black' : 'text-zinc-500 font-medium hover:text-emerald-800'
            }`}
          >
            <div className="relative">
              <div className={`p-1 rounded-xl transition-all ${
                activeTab === 'tasks' ? 'bg-emerald-100 text-emerald-950 shadow-2xs scale-105' : ''
              }`}>
                <CheckSquare className={`w-5 h-5 ${activeTab === 'tasks' ? 'stroke-[2.5] text-emerald-950' : 'stroke-[1.75]'}`} />
              </div>
              <span className="absolute -top-1 -right-1.5 px-1 py-0.2 bg-amber-400 text-emerald-950 rounded-full text-[8px] font-black leading-none ring-1 ring-white shadow-2xs">
                GH₵
              </span>
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Tasks</span>
            {activeTab === 'tasks' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5 animate-in zoom-in-50 duration-150" />
            )}
          </button>

          {/* 3. Packages */}
          <button
            onClick={() => handleNavClick('packages')}
            className={`tap-bounce flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === 'packages' ? 'text-emerald-950 font-black' : 'text-zinc-500 font-medium hover:text-emerald-800'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${
              activeTab === 'packages' ? 'bg-emerald-100 text-emerald-950 shadow-2xs scale-105' : ''
            }`}>
              <Layers className={`w-5 h-5 ${activeTab === 'packages' ? 'stroke-[2.5] text-emerald-950' : 'stroke-[1.75]'}`} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Units (35%)</span>
            {activeTab === 'packages' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5 animate-in zoom-in-50 duration-150" />
            )}
          </button>

          {/* 4. Wallet */}
          <button
            onClick={() => handleNavClick('wallet')}
            className={`tap-bounce flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === 'wallet' ? 'text-emerald-950 font-black' : 'text-zinc-500 font-medium hover:text-emerald-800'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${
              activeTab === 'wallet' ? 'bg-emerald-100 text-emerald-950 shadow-2xs scale-105' : ''
            }`}>
              <Wallet className={`w-5 h-5 ${activeTab === 'wallet' ? 'stroke-[2.5] text-emerald-950' : 'stroke-[1.75]'}`} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Wallet</span>
            {activeTab === 'wallet' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5 animate-in zoom-in-50 duration-150" />
            )}
          </button>

          {/* 5. Referrals or Profile */}
          <button
            onClick={() => handleNavClick('referrals')}
            className={`tap-bounce flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === 'referrals' ? 'text-emerald-950 font-black' : 'text-zinc-500 font-medium hover:text-emerald-800'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${
              activeTab === 'referrals' ? 'bg-emerald-100 text-emerald-950 shadow-2xs scale-105' : ''
            }`}>
              <Users className={`w-5 h-5 ${activeTab === 'referrals' ? 'stroke-[2.5] text-emerald-950' : 'stroke-[1.75]'}`} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Referrals</span>
            {activeTab === 'referrals' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5 animate-in zoom-in-50 duration-150" />
            )}
          </button>
        </nav>
      ) : (
        /* Mobile Exit Admin Bar */
        <nav 
          aria-label="Admin Navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-emerald-950/95 backdrop-blur-xl border-t border-amber-500/40 px-4 py-2 flex justify-between items-center shadow-2xl safe-bottom text-white"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300">Agricultural Operations Portal</span>
          </div>
          <button
            onClick={() => setIsAdminMode(false)}
            className="tap-bounce px-3.5 py-1.5 bg-amber-400 text-emerald-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Admin</span>
          </button>
        </nav>
      )}
    </header>
  );
};


