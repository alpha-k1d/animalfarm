import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  IdCard, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  User as UserIcon, 
  Wallet, 
  Sparkles,
  Trash2,
  Check,
  AlertCircle
} from 'lucide-react';
import { User, EnrolledPackage } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  activePackage?: EnrolledPackage | null;
  onUpdateAvatar: (avatarUrl: string) => void;
  onOpenIdCard: () => void;
}

const PRESET_AVATARS = [
  {
    name: 'Ghanaian Farmer 1',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'Ghanaian Farmer 2',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'Agri-Specialist',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'Outgrower Lead',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
  }
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  activePackage,
  onUpdateAvatar,
  onOpenIdCard
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(user.avatar || null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setErrorMessage(null);
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 5MB limit. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSelectedImage(result);
        onUpdateAvatar(result);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedImage(null);
    onUpdateAvatar('');
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 2000);
  };

  const handleSelectPreset = (url: string) => {
    setSelectedImage(url);
    onUpdateAvatar(url);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const initials = user.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-gray-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-6 py-5 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-white">Farmer Profile & Credentials</h3>
                <p className="text-xs text-emerald-200 font-mono">ID: {user.membershipNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="Close Profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Avatar Upload Section */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600" />
              Profile Photo & Passport Picture
            </h4>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Avatar Preview */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-emerald-500/30 shadow-lg bg-emerald-900 flex items-center justify-center">
                  {selectedImage ? (
                    <img 
                      src={selectedImage} 
                      alt={user.fullName} 
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-emerald-100 font-mono">{initials}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md transition-all hover:scale-110"
                  title="Upload New Picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Upload Controls & Drag Area */}
              <div className="flex-1 w-full space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
                    isDragging 
                      ? 'border-emerald-600 bg-emerald-100/50' 
                      : 'border-emerald-200 hover:border-emerald-400 bg-white'
                  }`}
                >
                  <Upload className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700">
                    Click to browse or drag & drop photo
                  </p>
                  <p className="text-[10px] text-gray-500">
                    JPG, PNG, or WebP (Max 5MB)
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors text-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload from Device
                  </button>

                  {selectedImage && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-medium text-xs hover:underline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                {uploadSuccess && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-100/80 px-2.5 py-1.5 rounded-md animate-in fade-in">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Profile picture updated successfully!
                  </div>
                )}

                {errorMessage && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold bg-rose-100/80 px-2.5 py-1.5 rounded-md animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    {errorMessage}
                  </div>
                )}
              </div>
            </div>

            {/* Avatar Presets */}
            <div className="mt-4 pt-3 border-t border-emerald-100">
              <p className="text-[11px] font-semibold text-gray-600 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Or pick from official farmer presets:
              </p>
              <div className="flex items-center gap-3">
                {PRESET_AVATARS.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-emerald-500 transition-all focus:outline-none"
                    title={preset.name}
                  >
                    <img 
                      src={preset.url} 
                      alt={preset.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    {selectedImage === preset.url && (
                      <div className="absolute inset-0 bg-emerald-700/60 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Member Official Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Statutory Cooperative Identity
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <span className="text-[10px] text-gray-500 block uppercase font-mono">Full Name</span>
                <span className="font-semibold text-gray-900 text-sm">{user.fullName}</span>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <span className="text-[10px] text-gray-500 block uppercase font-mono">Ghana Card PIN</span>
                <span className="font-mono font-semibold text-gray-900">{user.ghanaCardPin}</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium ml-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" /> Verified
                </span>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <span className="text-[10px] text-gray-500 block uppercase font-mono">Mobile Money Phone</span>
                <div className="flex items-center gap-1.5 font-medium text-gray-900">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{user.phone}</span>
                  <span className="text-[10px] text-emerald-700 font-bold ml-1">Verified MoMo</span>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <span className="text-[10px] text-gray-500 block uppercase font-mono">E-Mail Address</span>
                <div className="flex items-center gap-1.5 font-medium text-gray-900 truncate">
                  <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <span className="text-[10px] text-gray-500 block uppercase font-mono">Ecological District</span>
                <div className="flex items-center gap-1.5 font-medium text-gray-900">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>{user.district}</span>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <span className="text-[10px] text-gray-500 block uppercase font-mono">Registration Date</span>
                <div className="flex items-center gap-1.5 font-medium text-gray-900">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span>{user.createdAt}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Package Status */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center justify-between">
              <span>Active Agricultural Sponsorship</span>
              {activePackage ? (
                <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                  Active (1-Package Quota)
                </span>
              ) : (
                <span className="bg-gray-200 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                  None Active
                </span>
              )}
            </h4>

            {activePackage ? (
              <div className="space-y-1.5 text-xs text-amber-950">
                <div className="flex justify-between font-bold text-sm text-gray-900">
                  <span>{activePackage.packageName}</span>
                  <span className="text-emerald-700">GH₵ {(activePackage.price || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-[11px]">
                  <span>Unit Code: {activePackage.statutoryUnitCode || 'GH-UNIT'}</span>
                  <span>Day {activePackage.currentDay || 1} of {activePackage.durationDays || 20}</span>
                </div>
                <div className="flex justify-between text-[11px] font-medium text-emerald-800 pt-1">
                  <span>Daily Gestation Yield: GH₵ {(activePackage.dailyInterestGhs ?? (activePackage.price ? activePackage.price * 0.03 : 3.00)).toFixed(2)}/day</span>
                  <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">+35% Commission</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-800">
                You have not sponsored any agricultural package yet. Visit the Packages tab to begin your 35% commission gestation cycle!
              </p>
            )}
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
            <div>
              <span className="text-[10px] text-gray-500 uppercase block font-medium">Wallet Balance</span>
              <span className="text-sm font-bold text-emerald-700">GH₵ {(user?.walletBalance || 0).toFixed(2)}</span>
            </div>
            <div className="border-x border-gray-200">
              <span className="text-[10px] text-gray-500 uppercase block font-medium">Total Yield</span>
              <span className="text-sm font-bold text-gray-800">GH₵ {(user?.totalEarned || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase block font-medium">Withdrawn</span>
              <span className="text-sm font-bold text-blue-700">GH₵ {(user?.totalWithdrawn || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenIdCard();
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
          >
            <IdCard className="w-4 h-4 text-emerald-600" />
            View Official Farmer ID Card
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
