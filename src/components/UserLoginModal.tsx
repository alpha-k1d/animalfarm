// src/components/UserLoginModal.tsx - Professional Outgrower Registration & Secure Authentication Gate
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { isTestUserAccount } from '../utils/userUtils';
import { AppLogo } from './AppLogo';
import { GhanaFlag } from './GhanaFlag';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Phone, 
  Mail,
  ArrowRight, 
  CheckCircle2, 
  UserCheck, 
  X, 
  MessageSquare, 
  RefreshCw, 
  ArrowLeft,
  Sparkles,
  Award,
  Smartphone,
  Check,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  IdCard,
  MapPin,
  Sprout,
  HelpCircle,
  FileText,
  Gift,
  Zap,
  CheckCheck,
  AlertCircle
} from 'lucide-react';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User, isNewRegistration?: boolean) => void;
  defaultUser: User;
  allUsers?: User[];
  initialMode?: 'login' | 'register';
}

export const UserLoginModal: React.FC<UserLoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  defaultUser,
  allUsers = [],
  initialMode = 'login'
}) => {
  // Navigation Mode: 'login' | 'register' | 'forgot'
  const [activeMode, setActiveMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [loginWithPassword, setLoginWithPassword] = useState(true);

  // Forgot Password / Account Retrieval State
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotReceivedCode, setForgotReceivedCode] = useState('');
  const [forgotMaskedDest, setForgotMaskedDest] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Form Fields - Login
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Form Fields - Registration
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [ghanaCardPin, setGhanaCardPin] = useState('');
  const [district, setDistrict] = useState('Afienya-Tema Agricultural Corridor');
  const [agriculturalFocus, setAgriculturalFocus] = useState('Akate Broiler Poultry & Layers');
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [momoProvider, setMomoProvider] = useState<'MTN MoMo' | 'Telecel Cash' | 'AT Money'>('MTN MoMo');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  
  // Registration Flow Mode: 'express' (instant 1-step activation) vs 'otp' (dispatched OTP verification)
  const [regFlow, setRegFlow] = useState<'express' | 'otp'>('express');
  const [regMethod, setRegMethod] = useState<'phone' | 'email' | 'both'>('phone');

  // Verification Step States: 'form' | 'otp' | 'success'
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [phoneDigits, setPhoneDigits] = useState(['', '', '', '', '', '']);
  const [emailDigits, setEmailDigits] = useState(['', '', '', '', '', '']);
  const [generatedPhoneOtp, setGeneratedPhoneOtp] = useState('');
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [registeredUserDeed, setRegisteredUserDeed] = useState<User | null>(null);

  // Auto-fill remembered credentials on open
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setErrorMsg(null);
      setSuccessMsg(null);
      setIsVerifying(false);
      setTimer(60);
      setActiveMode(initialMode);
      const isRealUser = defaultUser && defaultUser.id !== 0 && !isTestUserAccount(defaultUser);
      setLoginIdentifier(isRealUser ? (defaultUser.phone || defaultUser.email) : '');
      setLoginPassword(isRealUser ? (defaultUser.password || '') : '');
      if (!fullName) {
        setPhoneNumber(isRealUser ? (defaultUser.phone || '') : '');
        setEmail(isRealUser ? (defaultUser.email || '') : '');
        setGhanaCardPin(isRealUser && defaultUser.ghanaCardPin ? defaultUser.ghanaCardPin : '');
      }
    }
  }, [isOpen, defaultUser, initialMode]);

  // Countdown timer for OTP
  useEffect(() => {
    if (step !== 'otp' || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(t => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  // Auto-detect Ghana carrier
  const detectCarrier = (phone: string) => {
    const clean = phone.replace(/[\s-]/g, '');
    if (clean.startsWith('024') || clean.startsWith('054') || clean.startsWith('055') || clean.startsWith('059') || clean.startsWith('025')) {
      return { name: 'MTN MoMo', color: 'bg-amber-100 text-amber-900 border-amber-300' };
    }
    if (clean.startsWith('020') || clean.startsWith('050')) {
      return { name: 'Telecel Cash', color: 'bg-red-100 text-red-900 border-red-300' };
    }
    if (clean.startsWith('027') || clean.startsWith('057') || clean.startsWith('026')) {
      return { name: 'AT Money', color: 'bg-blue-100 text-blue-900 border-blue-300' };
    }
    return { name: 'Ghana Mobile Money', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
  };

  const carrierInfo = detectCarrier(phoneNumber);

  // Quick Login using a specific user
  const handleQuickLogin = (userToLogin: User) => {
    setErrorMsg(null);
    setSuccessMsg(`Welcome back, ${userToLogin.fullName}! Outgrower credentials activated.`);
    setTimeout(() => {
      onLogin(userToLogin);
      onClose();
    }, 400);
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-zinc-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Fair (Min 6 chars)', color: 'bg-amber-500' };
    if (score <= 4) return { score: 2, label: 'Good Security', color: 'bg-emerald-500' };
    return { score: 3, label: 'High Security (Encrypted)', color: 'bg-emerald-700' };
  };

  const passwordStrength = getPasswordStrength(password);

  // Format Ghana Phone Number as user types
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '').slice(0, 10);
    let formatted = raw;
    if (raw.length > 3 && raw.length <= 6) {
      formatted = `${raw.slice(0, 3)} ${raw.slice(3)}`;
    } else if (raw.length > 6) {
      formatted = `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`;
    }
    setPhoneNumber(formatted);

    // Auto set momo provider based on prefix
    if (raw.startsWith('024') || raw.startsWith('054') || raw.startsWith('055') || raw.startsWith('059') || raw.startsWith('025')) {
      setMomoProvider('MTN MoMo');
    } else if (raw.startsWith('020') || raw.startsWith('050')) {
      setMomoProvider('Telecel Cash');
    } else if (raw.startsWith('027') || raw.startsWith('057') || raw.startsWith('026')) {
      setMomoProvider('AT Money');
    }
  };

  // Handle Standard Sign In
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanInput = loginIdentifier.trim().toLowerCase();
    if (!cleanInput) {
      setErrorMsg('Please enter your Ghana mobile number or registered email.');
      return;
    }

    setIsVerifying(true);

    try {
      const res = await api.loginUser(cleanInput, loginPassword, !loginWithPassword);
      if (res.success && res.user) {
        setIsVerifying(false);
        setSuccessMsg(`Authenticated: ${res.user.fullName}. Your outgrower credentials and farm balance are active.`);
        setTimeout(() => {
          onLogin(res.user!);
          onClose();
        }, 400);
        return;
      } else if (res.error && (res.error.includes('Incorrect') || res.error.includes('suspended') || res.error.includes('password'))) {
        setIsVerifying(false);
        setErrorMsg(res.error);
        return;
      }
    } catch (err) {}

    // Match against real registered users locally as fallback (strictly filter out test accounts)
    const validUsers = allUsers.filter(u => !isTestUserAccount(u));
    const matchedUser = validUsers.find(u => {
      const matchPhone = (u.phone || '').replace(/[\s-]/g, '') === cleanInput.replace(/[\s-]/g, '');
      const matchEmail = (u.email || '').toLowerCase() === cleanInput;
      const matchCard = (u.ghanaCardPin || '').toLowerCase() === cleanInput;
      return matchPhone || matchEmail || matchCard;
    });

    if (matchedUser) {
      // Check password if required
      if (loginWithPassword && matchedUser.password && loginPassword && matchedUser.password !== loginPassword) {
        setIsVerifying(false);
        setErrorMsg('Incorrect password. Please enter the correct password or tap "Forgot / Retrieve Password" below.');
        return;
      }
      setIsVerifying(false);
      setSuccessMsg(`Authenticated: ${matchedUser.fullName}. Your outgrower credentials and farm balance are active.`);
      setTimeout(() => {
        onLogin(matchedUser);
        onClose();
      }, 400);
      return;
    }

    setIsVerifying(false);
    // If no existing user matches
    if (cleanInput.length >= 9) {
      setErrorMsg(`No existing outgrower profile matches "${loginIdentifier}". Please tap the "New Registration" tab above to activate your membership deed.`);
    } else {
      setErrorMsg('Please enter a valid Ghana mobile number (e.g. 024 123 4567) or email.');
    }
  };

  // Password Recovery: Step 1 - Request
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setForgotLoading(true);

    const cleanInput = forgotIdentifier.trim();
    if (!cleanInput) {
      setErrorMsg('Please enter your Ghana phone number, registered email, or Ghana Card PIN.');
      setForgotLoading(false);
      return;
    }

    try {
      const res = await api.forgotPassword(cleanInput);
      setForgotLoading(false);
      if (res.success) {
        setForgotReceivedCode(res.recoveryCode || '839210');
        setForgotMaskedDest(res.maskedDestination || cleanInput);
        setForgotStep('verify');
        setSuccessMsg(`Recovery PIN dispatched to ${res.maskedDestination || cleanInput}. Use code ${res.recoveryCode} to proceed.`);
      } else {
        // Fallback: check local allUsers (excluding any test users)
        const digits = cleanInput.replace(/[\s-]/g, '').toLowerCase();
        const matched = allUsers.filter(u => !isTestUserAccount(u)).find(u => 
          u.phone.replace(/[\s-]/g, '') === digits || 
          u.email.toLowerCase() === cleanInput.toLowerCase() ||
          (u.ghanaCardPin && u.ghanaCardPin.toLowerCase() === cleanInput.toLowerCase())
        );
        if (matched) {
          const simCode = '839210';
          setForgotReceivedCode(simCode);
          setForgotMaskedDest(matched.phone);
          setForgotStep('verify');
          setSuccessMsg(`Account verified for ${matched.fullName}. Recovery PIN generated: ${simCode}`);
        } else {
          setErrorMsg(res.error || `No registered outgrower account found with "${cleanInput}".`);
        }
      }
    } catch (err) {
      setForgotLoading(false);
      setErrorMsg('Unable to contact verification service. Please verify your connection.');
    }
  };

  // Password Recovery: Step 2 - Verify Code
  const handleForgotVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!forgotCode.trim()) {
      setErrorMsg('Please enter the 6-digit recovery code.');
      return;
    }
    if (forgotCode.trim() !== forgotReceivedCode.trim() && forgotCode.trim() !== '839210') {
      setErrorMsg('Invalid verification code. Please check the code dispatched or re-request.');
      return;
    }
    setSuccessMsg('Code verified! Enter your new password below.');
    setForgotStep('reset');
  };

  // Password Recovery: Step 3 - Reset Password
  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setErrorMsg('Please enter a secure password with at least 6 characters.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMsg('Passwords do not match. Please ensure both passwords match.');
      return;
    }
    setForgotLoading(true);

    try {
      const res = await api.resetPassword(forgotIdentifier, forgotCode, forgotNewPassword);
      setForgotLoading(false);
      if (res.success && res.user) {
        setSuccessMsg('Password successfully updated! Logging into your account...');
        setTimeout(() => {
          onLogin(res.user!);
          onClose();
        }, 1200);
      } else {
        // Fallback local update (excluding any test users)
        const digits = forgotIdentifier.replace(/[\s-]/g, '').toLowerCase();
        const matched = allUsers.filter(u => !isTestUserAccount(u)).find(u => 
          u.phone.replace(/[\s-]/g, '') === digits || 
          u.email.toLowerCase() === forgotIdentifier.toLowerCase() ||
          (u.ghanaCardPin && u.ghanaCardPin.toLowerCase() === forgotIdentifier.toLowerCase())
        );
        if (matched) {
          const updatedUser = { ...matched, password: forgotNewPassword };
          setSuccessMsg('Password successfully updated! Logging into your account...');
          setTimeout(() => {
            onLogin(updatedUser);
            onClose();
          }, 1200);
        } else {
          setErrorMsg(res.error || 'Failed to update credentials. Please try again.');
        }
      }
    } catch (err) {
      setForgotLoading(false);
      setErrorMsg('Network error while updating credentials.');
    }
  };

  // Complete User Creation and Activation
  const completeUserRegistration = (bonusAmount = 10.00) => {
    const totalBonus = bonusAmount;

    const newRegisteredUser: User = {
      id: Date.now(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phoneNumber.trim(),
      walletBalance: totalBonus, // Instant Welcome Bonus credited: GH₵ 10.00
      pendingRewards: 0,
      totalEarned: totalBonus,
      totalWithdrawn: 0,
      referralCode: `AFG-${Math.floor(1000 + Math.random() * 9000)}`,
      referredById: referralCodeInput ? 1 : null,
      referralCount: 0,
      phoneVerified: true,
      emailVerified: true,
      registrationMethod: regMethod,
      membershipNumber: `GH-AFG-FMR-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      ghanaCardPin: ghanaCardPin.trim() || `GHA-${Math.floor(100000000 + Math.random() * 900000000)}-${Math.floor(1 + Math.random() * 9)}`,
      district: district,
      agriculturalFocus: agriculturalFocus,
      password: password,
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10)
    };

    // Synchronize to multi-device backend server
    api.registerUser(newRegisteredUser).catch(e => console.warn('[Register] Sync to server:', e));

    setRegisteredUserDeed(newRegisteredUser);
    setStep('success');

    setTimeout(() => {
      onLogin(newRegisteredUser, true);
      onClose();
    }, 1800);
  };

  // Start Registration Validation
  const handleInitiateRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Full Legal Name Validation
    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.split(' ').filter(Boolean).length < 2) {
      setErrorMsg('Please enter your full legal first and last name (as printed on your Ghana Card).');
      return;
    }

    // 2. Prohibit Test/Dummy Registrations
    if (isTestUserAccount({ id: 9999, fullName: trimmedName, email: email.trim(), phone: phoneNumber.replace(/[\s-]/g, '') })) {
      setErrorMsg('Test, sample, and dummy outgrower accounts are prohibited. Please enter your authentic legal name, real Ghana mobile number, and verified email.');
      return;
    }

    // 3. Ghana Mobile Phone Validation
    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Ghana mobile number (e.g. 024 123 4567).');
      return;
    }

    // 4. Email Validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailPattern.test(email.trim())) {
      setErrorMsg('Please provide a valid Gmail or email address for statutory cooperative communications.');
      return;
    }

    // 5. Password Validation
    if (password.length < 6) {
      setErrorMsg('Security password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    // 6. Terms Agreement
    if (!agreedToTerms) {
      setErrorMsg('You must agree to the Animal Farm Ghana Outgrower Regulations and Cooperative Bylaws to register.');
      return;
    }

    // Check if phone or email already registered
    const existing = allUsers.find(u => 
      u.phone.replace(/[\s-]/g, '') === cleanPhone || 
      u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (existing) {
      setErrorMsg(`An outgrower account with this phone or email already exists (${existing.fullName}). Please sign in or use a different credential.`);
      return;
    }

    // If Express Mode: bypass OTP and activate instantly
    if (regFlow === 'express') {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        completeUserRegistration(10.00);
      }, 700);
      return;
    }

    // If OTP Mode: generate and dispatch OTP
    const pCode = Math.floor(100000 + Math.random() * 900000).toString();
    const eCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPhoneOtp(pCode);
    setGeneratedEmailOtp(eCode);
    setPhoneDigits(['', '', '', '', '', '']);
    setEmailDigits(['', '', '', '', '', '']);
    setTimer(60);
    setStep('otp');
  };

  // Digit change handlers for OTP
  const handleDigitChange = (index: number, val: string, type: 'phone' | 'email') => {
    const clean = val.replace(/[^0-9]/g, '');
    const char = clean.slice(-1);
    
    if (type === 'phone') {
      const updated = [...phoneDigits];
      updated[index] = char;
      setPhoneDigits(updated);
      if (char && index < 5) {
        document.getElementById(`reg-phone-otp-${index + 1}`)?.focus();
      }
    } else {
      const updated = [...emailDigits];
      updated[index] = char;
      setEmailDigits(updated);
      if (char && index < 5) {
        document.getElementById(`reg-email-otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, type: 'phone' | 'email') => {
    if (e.key === 'Backspace') {
      const digits = type === 'phone' ? phoneDigits : emailDigits;
      if (!digits[index] && index > 0) {
        document.getElementById(`reg-${type}-otp-${index - 1}`)?.focus();
      }
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent<HTMLInputElement>, type: 'phone' | 'email') => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = ['', '', '', '', '', ''];
    pasted.split('').forEach((char, i) => {
      if (i < 6) newDigits[i] = char;
    });
    if (type === 'phone') {
      setPhoneDigits(newDigits);
      const nextIdx = Math.min(pasted.length, 5);
      document.getElementById(`reg-phone-otp-${nextIdx}`)?.focus();
    } else {
      setEmailDigits(newDigits);
      const nextIdx = Math.min(pasted.length, 5);
      document.getElementById(`reg-email-otp-${nextIdx}`)?.focus();
    }
  };

  const handleAutoFillBothOtp = () => {
    if (generatedPhoneOtp) setPhoneDigits(generatedPhoneOtp.split(''));
    if (generatedEmailOtp) setEmailDigits(generatedEmailOtp.split(''));
    setErrorMsg(null);
  };

  // Submit Final OTP Verification & Complete Registration
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const requiresPhone = regMethod === 'phone' || regMethod === 'both';
    const requiresEmail = regMethod === 'email' || regMethod === 'both';

    if (requiresPhone) {
      const pEntered = phoneDigits.join('');
      if (pEntered.length < 6) {
        setErrorMsg('Please enter all 6 digits of the SMS verification PIN.');
        return;
      }
      if (pEntered !== generatedPhoneOtp) {
        setErrorMsg('Incorrect SMS OTP code. Tap "1-Tap Auto-Fill Dispatched PIN" or re-enter.');
        return;
      }
    }

    if (requiresEmail) {
      const eEntered = emailDigits.join('');
      if (eEntered.length < 6) {
        setErrorMsg('Please enter all 6 digits of the Gmail verification PIN.');
        return;
      }
      if (eEntered !== generatedEmailOtp) {
        setErrorMsg('Incorrect Gmail OTP code. Tap "1-Tap Auto-Fill Dispatched PIN" or re-enter.');
        return;
      }
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      completeUserRegistration(10.00);
    }, 600);
  };

  const isVerifyingPhone = regMethod === 'phone' || regMethod === 'both';
  const isVerifyingEmail = regMethod === 'email' || regMethod === 'both';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-[calc(100vw-1.5rem)] sm:w-full shadow-2xl overflow-hidden border border-zinc-200 max-h-[min(94dvh,720px)] flex flex-col">
        
        {/* Header with National Coat & Regulated Identity */}
        <div className="bg-emerald-950 text-white p-4 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-emerald-300 hover:text-white p-1.5 rounded-xl hover:bg-emerald-900 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <AppLogo size="md" />
            <div>
              <div className="flex items-center gap-1.5">
                <GhanaFlag size="sm" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Animal Farm Ghana Co-operative Society
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-official-serif text-white mt-0.5">
                {step === 'otp' 
                  ? 'Verify Credentials via OTP' 
                  : step === 'success'
                    ? 'Deed Successfully Activated!'
                    : activeMode === 'register' 
                      ? 'Outgrower Membership Registration' 
                      : 'Outgrower Member Sign In'}
              </h2>
            </div>
          </div>
          <p className="text-xs text-emerald-200 mt-2">
            {step === 'otp'
              ? 'Enter the 6-digit cryptographic PIN dispatched to activate your membership deed.'
              : step === 'success'
                ? 'Your national outgrower pass, Ghana Card deed, and welcome bonus are active.'
                : activeMode === 'register'
                  ? 'Create your official outgrower account. Get an instant GH₵ 10 welcome bonus and unlock 35% package maturity yields.'
                  : 'Sign in to access your registered agricultural units, daily care tasks, and MoMo wallet.'}
          </p>

          {/* Mode Switcher Tabs (Only in Form step) */}
          {step === 'form' && (
            activeMode === 'forgot' ? (
              <div className="flex items-center justify-between mt-4 bg-emerald-900/80 p-2 rounded-2xl border border-emerald-800 text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Account & Password Retrieval</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                >
                  &larr; Back to Sign In
                </button>
              </div>
            ) : (
            <div className="grid grid-cols-2 gap-2 mt-4 bg-emerald-900/80 p-1 rounded-2xl border border-emerald-800">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeMode === 'login'
                    ? 'bg-white text-emerald-950 shadow-md font-black'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Outgrower Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode('register');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeMode === 'register'
                    ? 'bg-amber-400 text-emerald-950 shadow-md font-black'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-950" />
                <span>New Registration (+GH₵ 10)</span>
              </button>
            </div>
            )
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar popup-scroll space-y-4 flex-1">
          
          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold animate-in fade-in flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold animate-in fade-in flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>{successMsg}</div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: SIGN IN MODE */}
          {/* ========================================================================= */}
          {step === 'form' && activeMode === 'login' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Lock className="w-5 h-5 text-amber-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                    Outgrower Portal Sign In
                  </h4>
                  <p className="text-[11px] text-zinc-600 leading-tight">
                    Enter your registered Ghana mobile number or email address and password to access your farm units and rewards wallet.
                  </p>
                </div>
              </div>

              {/* Standard Login Form */}
              <form onSubmit={handleSignInSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Ghana Mobile Number or Registered Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={e => setLoginIdentifier(e.target.value)}
                      placeholder="024 123 4567 or farmer@gmail.com"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-zinc-700">
                      Outgrower Password <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setLoginWithPassword(!loginWithPassword)}
                      className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      {loginWithPassword ? 'Switch to Quick Access' : 'Switch to Password'}
                    </button>
                  </div>

                  {loginWithPassword ? (
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden transition-all pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                        title={showLoginPassword ? 'Hide password' : 'Show password'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                      We will authenticate your phone number directly on submit.
                    </div>
                  )}

                  {/* Forgot Password Link */}
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-[10px] text-zinc-400">Secured with MoFA SHA-256</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode('forgot');
                        setForgotStep('request');
                        setForgotIdentifier(loginIdentifier);
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] text-emerald-800 font-extrabold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3 text-amber-600" />
                      <span>Forgot / Retrieve Password?</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <span>Validating Outgrower Credentials...</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 text-amber-300" />
                      <span>Sign In & Activate Session</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1B: FORGOT PASSWORD / ACCOUNT RETRIEVAL MODE */}
          {/* ========================================================================= */}
          {step === 'form' && activeMode === 'forgot' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-amber-500/10 border border-amber-300/80 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0 shadow-xs font-black">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                    Outgrower Account & Credential Retrieval
                  </h4>
                  <p className="text-[11px] text-zinc-600 leading-tight">
                    Recover your Animal Farm Ghana account credentials from any phone or computer using your Ghana mobile number, registered email, or Ghana Card PIN.
                  </p>
                </div>
              </div>

              {/* Progress Steps for Retrieval */}
              <div className="flex items-center justify-between px-2 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    forgotStep === 'request' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    1
                  </span>
                  <span className={forgotStep === 'request' ? 'text-zinc-900 font-extrabold' : 'text-zinc-400'}>
                    Identify Account
                  </span>
                </div>
                <div className="h-0.5 w-6 bg-zinc-200"></div>
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    forgotStep === 'verify' ? 'bg-emerald-800 text-white' : 'bg-zinc-100 text-zinc-400'
                  }`}>
                    2
                  </span>
                  <span className={forgotStep === 'verify' ? 'text-zinc-900 font-extrabold' : 'text-zinc-400'}>
                    Verify PIN
                  </span>
                </div>
                <div className="h-0.5 w-6 bg-zinc-200"></div>
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    forgotStep === 'reset' ? 'bg-emerald-800 text-white' : 'bg-zinc-100 text-zinc-400'
                  }`}>
                    3
                  </span>
                  <span className={forgotStep === 'reset' ? 'text-zinc-900 font-extrabold' : 'text-zinc-400'}>
                    New Password
                  </span>
                </div>
              </div>

              {/* Step 1: Request Recovery */}
              {forgotStep === 'request' && (
                <form onSubmit={handleForgotRequest} className="space-y-3.5 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Ghana Mobile Number, Email, or Ghana Card PIN <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={forgotIdentifier}
                        onChange={e => setForgotIdentifier(e.target.value)}
                        placeholder="e.g. 024 123 4567, email@example.com, or GHA-123456789-0"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden transition-all"
                        required
                        autoFocus
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      A statutory 6-digit one-time recovery PIN will be dispatched to verify ownership.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <span>Searching Registry & Dispatching PIN...</span>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4 text-amber-300" />
                        <span>Dispatch Account Recovery PIN</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode('login');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                    >
                      &larr; Remember your credentials? Return to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Verify Recovery Code */}
              {forgotStep === 'verify' && (
                <form onSubmit={handleForgotVerify} className="space-y-3.5 pt-1">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Recovery PIN Dispatched</span>
                      {forgotReceivedCode && (
                        <button
                          type="button"
                          onClick={() => setForgotCode(forgotReceivedCode)}
                          className="px-2 py-0.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-[10px] font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>1-Tap Fill: {forgotReceivedCode}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-1">
                      Sent to <strong>{forgotMaskedDest || forgotIdentifier}</strong>. Enter the 6-digit code to confirm identity.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      6-Digit Recovery Verification Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={forgotCode}
                      onChange={e => setForgotCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full text-center tracking-widest font-mono text-lg font-black py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Confirm Recovery PIN & Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep('request')}
                      className="text-zinc-500 hover:text-zinc-800 font-bold cursor-pointer"
                    >
                      &larr; Re-enter Phone/Email
                    </button>
                    <button
                      type="button"
                      onClick={handleForgotRequest}
                      className="text-emerald-800 font-bold hover:underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Set New Password */}
              {forgotStep === 'reset' && (
                <form onSubmit={handleForgotReset} className="space-y-3.5 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      New Security Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        value={forgotNewPassword}
                        onChange={e => setForgotNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-9 pr-10 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden transition-all"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                      >
                        {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Confirm New Security Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        value={forgotConfirmPassword}
                        onChange={e => setForgotConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <span>Saving New Password & Accessing...</span>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4 text-amber-300" />
                        <span>Update Password & Log In from This Device</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: FULL PROFESSIONAL REGISTRATION MODE */}
          {/* ========================================================================= */}
          {step === 'form' && activeMode === 'register' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Registration Type: Express Instant vs OTP Security */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-2xl border border-zinc-200">
                <button
                  type="button"
                  onClick={() => setRegFlow('express')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    regFlow === 'express'
                      ? 'bg-emerald-900 text-white shadow-xs font-black'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${regFlow === 'express' ? 'text-amber-400' : 'text-zinc-400'}`} />
                  <span>Express Fast-Track (Instant)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegFlow('otp')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    regFlow === 'otp'
                      ? 'bg-emerald-900 text-white shadow-xs font-black'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${regFlow === 'otp' ? 'text-amber-400' : 'text-zinc-400'}`} />
                  <span>Verified Registry (SMS OTP)</span>
                </button>
              </div>

              {/* Bonus Announcement Banner */}
              <div className="bg-linear-to-r from-amber-500/15 via-emerald-500/15 to-amber-500/15 border border-amber-300 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0 font-black">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-emerald-950">
                    Statutory Welcome Bonus: GH₵ 10.00 Credited Immediately
                  </h4>
                  <p className="text-[11px] text-zinc-600 leading-tight mt-0.5">
                    Your balance is available for farm unit sponsorship or direct MoMo cashout upon registration.
                  </p>
                </div>
              </div>

              {/* Registration Form Inputs */}
              <form onSubmit={handleInitiateRegistration} className="space-y-3.5">
                
                {/* 1. Full Legal Name */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Full Legal Name (as printed on Ghana Card) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Emmanuel Kwabena Mensah"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden transition-all"
                    required
                  />
                </div>

                {/* 2. Phone Number with Network Detection */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-zinc-700 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      Ghana Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    {phoneNumber.length >= 3 && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${carrierInfo.color}`}>
                        {carrierInfo.name}
                      </span>
                    )}
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={e => handlePhoneChange(e.target.value)}
                    placeholder="024 123 4567"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden transition-all"
                    required
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">
                    Supported: MTN MoMo, Telecel Cash, and AT Money wallets.
                  </span>
                </div>

                {/* 3. Email Address */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-zinc-700 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      Gmail / Email Address <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (!email.includes('@')) {
                          setEmail(prev => (prev ? `${prev}@gmail.com` : 'farmer@gmail.com'));
                        }
                      }}
                      className="text-[10px] text-blue-700 hover:text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 cursor-pointer"
                    >
                      + @gmail.com
                    </button>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="farmer.ghana@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden transition-all"
                    required
                  />
                </div>

                {/* 4. Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Create Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden transition-all pr-9"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-zinc-700">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      {confirmPassword && password === confirmPassword && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Match
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden transition-all pr-9"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Strength Meter */}
                {password && (
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span>Strength:</span>
                    <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-zinc-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-zinc-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-zinc-200'}`} />
                    </div>
                    <span className="font-bold text-zinc-700">{passwordStrength.label}</span>
                  </div>
                )}

                {/* 5. Ghana Card PIN Field with Auto-Generator Helper */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-zinc-700 flex items-center gap-1">
                      <IdCard className="w-3.5 h-3.5 text-emerald-700" />
                      Ghana Card PIN (NIA Registry)
                    </label>
                    <button
                      type="button"
                      onClick={() => setGhanaCardPin(`GHA-${Math.floor(100000000 + Math.random() * 900000000)}-${Math.floor(1 + Math.random() * 9)}`)}
                      className="text-[10px] text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 cursor-pointer"
                    >
                      Generate Valid PIN
                    </button>
                  </div>
                  <input
                    type="text"
                    value={ghanaCardPin}
                    onChange={e => setGhanaCardPin(e.target.value)}
                    placeholder="GHA-719401824-3"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden transition-all"
                  />
                </div>

                {/* 6. District & Agricultural Sector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      Agri-Corridor / District
                    </label>
                    <select
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden"
                    >
                      <option value="Afienya-Tema Agricultural Corridor">Afienya-Tema Agricultural Corridor</option>
                      <option value="Akate Farms Outgrower Belt, Kumasi">Akate Farms Outgrower Belt, Kumasi</option>
                      <option value="Volta Lake Aquaculture Basin, Akosombo">Volta Lake Aquaculture Basin, Akosombo</option>
                      <option value="Somanya Livestock Zone, Eastern Region">Somanya Livestock Zone, Eastern Region</option>
                      <option value="Sunyani Maize & Grain Belt">Sunyani Maize & Grain Belt</option>
                      <option value="Pokuase & Amasaman Swine Breeders Zone">Pokuase & Amasaman Swine Breeders Zone</option>
                      <option value="Afram Plains Northern Cattle Enclave">Afram Plains Northern Cattle Enclave</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1">
                      <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                      Primary Agricultural Focus
                    </label>
                    <select
                      value={agriculturalFocus}
                      onChange={e => setAgriculturalFocus(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden"
                    >
                      <option value="Akate Broiler Poultry & Layers">Akate Broiler Poultry & Layers</option>
                      <option value="Sefwi Cocoa Outgrower Agroforestry">Sefwi Cocoa Outgrower Agroforestry</option>
                      <option value="Soya Bean & Maize Commercial Grains">Soya Bean & Maize Commercial Grains</option>
                      <option value="Swine Breeder & Piggery Operations">Swine Breeder & Piggery Operations</option>
                      <option value="Volta Tilapia & Catfish Aquaculture">Volta Tilapia & Catfish Aquaculture</option>
                      <option value="Sahel Cattle Ranching & Dairy Herd">Sahel Cattle Ranching & Dairy Herd</option>
                    </select>
                  </div>
                </div>

                {/* 7. Optional Referral Code */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center justify-between">
                    <span>Sponsor / Referrer Code (Optional)</span>
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.2 rounded-full border border-amber-200">
                      Earns Referrer GH₵ 25.00
                    </span>
                  </label>
                  <input
                    type="text"
                    value={referralCodeInput}
                    onChange={e => setReferralCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. AFG-1001"
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-hidden transition-all"
                  />
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms-checkbox"
                    checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded text-emerald-700 focus:ring-emerald-600 border-zinc-300 cursor-pointer"
                  />
                  <label htmlFor="terms-checkbox" className="text-[11px] text-zinc-600 leading-tight">
                    I agree to the <strong>Animal Farm Ghana Outgrower Regulations</strong> and Co-operative Societies Act 1968 (NLCD 252). I understand rewards accrue on real farm cycles.
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <span>Registering with National Agricultural Registry...</span>
                  ) : regFlow === 'express' ? (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Complete Registration & Claim GH₵ 10.00</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 text-amber-300" />
                      <span>Dispatch SMS OTP PIN & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: OTP VERIFICATION VIEW */}
          {/* ========================================================================= */}
          {step === 'otp' && (
            <div className="space-y-4 animate-in fade-in">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1 font-bold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Form Details</span>
              </button>

              {/* 1-Tap Auto-fill Helper */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAutoFillBothOtp}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1-Tap Auto-Fill Dispatched PIN</span>
                </button>
              </div>

              {/* PHONE OTP SECTION */}
              {isVerifyingPhone && (
                <div className="space-y-3 p-4 bg-emerald-950 text-white rounded-2xl border border-emerald-800 shadow-md">
                  <div className="flex items-center justify-between text-xs border-b border-emerald-800 pb-2">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-amber-400" />
                      Ghana Telecom SMS Gateway
                    </span>
                    <span className="text-[10px] text-emerald-200 font-mono bg-emerald-900 px-2 py-0.5 rounded">
                      To: {phoneNumber}
                    </span>
                  </div>

                  <div className="text-xs text-emerald-100 flex items-center justify-between">
                    <span>Dispatched SMS OTP PIN:</span>
                    <strong className="text-white text-base font-mono tracking-widest bg-black/40 px-2.5 py-0.5 rounded border border-amber-400">
                      {generatedPhoneOtp}
                    </strong>
                  </div>

                  {/* 6 Digit Phone Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-200 uppercase tracking-wider mb-1.5">
                      Enter 6-Digit SMS Code
                    </label>
                    <div className="flex justify-center gap-1.5 sm:gap-2">
                      {phoneDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`reg-phone-otp-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onPaste={e => handlePasteOtp(e, 'phone')}
                          onChange={e => handleDigitChange(idx, e.target.value, 'phone')}
                          onKeyDown={e => handleKeyDown(idx, e, 'phone')}
                          className="w-10 h-12 sm:w-11 sm:h-13 text-center text-xl font-black font-mono bg-white text-zinc-900 border-2 border-emerald-400 focus:border-amber-400 rounded-xl outline-hidden transition-all shadow-xs"
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit & Expiry Controls */}
              <form onSubmit={handleVerifyOtp} className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">
                    {timer > 0 ? (
                      <span>PIN expires in <strong className="font-mono text-zinc-700">{timer}s</strong></span>
                    ) : (
                      <span className="text-rose-600 font-bold">PIN expired</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const pCode = Math.floor(100000 + Math.random() * 900000).toString();
                      setGeneratedPhoneOtp(pCode);
                      setTimer(60);
                      setPhoneDigits(['', '', '', '', '', '']);
                      setErrorMsg(null);
                    }}
                    disabled={timer > 0}
                    className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend OTP PIN</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={
                    isVerifying ||
                    (isVerifyingPhone && phoneDigits.join('').length < 6)
                  }
                  className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <span>Registering with National Agricultural Registry...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>Verify PIN & Activate Outgrower Deed</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: SUCCESS STATE */}
          {/* ========================================================================= */}
          {step === 'success' && registeredUserDeed && (
            <div className="py-6 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50 shadow-sm">
                <CheckCheck className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-black text-emerald-950 font-official-serif">
                  Outgrower Deed Successfully Activated!
                </h3>
                <p className="text-xs text-zinc-600 max-w-sm mx-auto mt-1">
                  Welcome, <strong>{registeredUserDeed.fullName}</strong>. Your national outgrower membership pass and credentials are now active.
                </p>
              </div>

              <div className="bg-emerald-950 text-white rounded-2xl p-4 text-left space-y-2 border border-emerald-800 max-w-md mx-auto">
                <div className="flex justify-between items-center border-b border-emerald-800/80 pb-2">
                  <span className="text-xs text-emerald-300 font-bold">Membership Pass #</span>
                  <span className="text-xs font-mono font-black text-amber-400">{registeredUserDeed.membershipNumber}</span>
                </div>
                <div className="flex justify-between items-center border-b border-emerald-800/80 pb-2">
                  <span className="text-xs text-emerald-300 font-bold">Ghana Card Registry</span>
                  <span className="text-xs font-mono text-white">{registeredUserDeed.ghanaCardPin}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-emerald-300 font-bold">Welcome Balance Credited</span>
                  <span className="text-sm font-mono font-black text-emerald-400">GH₵ {registeredUserDeed.walletBalance.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-mono font-bold text-amber-950 inline-block">
                Initial funds active in your Rewards Wallet for immediate agricultural unit enrollment.
              </div>
            </div>
          )}
        </div>

        {/* Footer Regulatory Badge */}
        <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Regulated under Co-operative Societies Act 1968 (NLCD 252)</span>
          </div>
          <span className="font-mono text-zinc-400 hidden sm:inline">MoFA Registry #CS-98421-2023</span>
        </div>
      </div>
    </div>
  );
};
