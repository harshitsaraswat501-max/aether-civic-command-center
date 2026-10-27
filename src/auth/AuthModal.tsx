import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Shield,
  Wrench,
  User,
  Lock,
  Mail,
  CheckCircle2,
  Database,
} from 'lucide-react';
import {
  CivicUserRole,
  PRESET_ROLE_PROFILES,
  useAuth,
} from './AuthContext';
import { AppLanguage, tr } from '../services/uiPreferences';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, lang }) => {
  const { user, switchRole, loginWithCredentials } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<CivicUserRole>(user.role);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState(user.fullName);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectRolePreset = (role: CivicUserRole) => {
    const preset = PRESET_ROLE_PROFILES[role];
    setSelectedRole(role);
    setEmail(preset.email);
    setFullName(preset.fullName);
    switchRole(role);
    setStatusBanner(
      tr(
        lang,
        `Switched active role to ${preset.badgeTitle}`,
        `सक्रिय भूमिका बदली गई: ${preset.badgeTitleHi}`
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await loginWithCredentials(email, password, selectedRole, fullName);
    setStatusBanner(res.message);
    setTimeout(() => {
      onClose();
    }, 550);
  };

  const roleCards: Array<{
    role: CivicUserRole;
    title: string;
    titleHi: string;
    perms: string;
    permsHi: string;
    icon: React.ReactNode;
  }> = [
    {
      role: 'CITIZEN',
      title: 'Citizen Reporter',
      titleHi: 'नागरिक (Citizen)',
      perms: 'Report geo-tagged hazards, track SLA & upload contradicting photo proof.',
      permsHi: 'शिकायत दर्ज करें, SLA ट्रैक करें और सबूत फोटो अपलोड करें।',
      icon: <User className="w-4 h-4 text-teal-500" />,
    },
    {
      role: 'FIELD_ENGINEER',
      title: 'Municipal Field Engineer',
      titleHi: 'फील्ड इंजीनियर (JE/AE)',
      perms: 'Execute Step 1→2→3 department tasks & submit repair closure photos.',
      permsHi: 'विभागीय कार्य (चरण 1→2→3) पूरा करें और रिपेयर फोटो अपलोड करें।',
      icon: <Wrench className="w-4 h-4 text-amber-500" />,
    },
    {
      role: 'ZONAL_COMMISSIONER',
      title: 'Zonal Commissioner (IAS)',
      titleHi: 'ज़ोनल कमिश्नर (IAS)',
      perms: 'Full Command Center, Escrow Freeze, Chaos Simulator & SLA Audit Export.',
      permsHi: 'पूर्ण कमांड सेंटर, ठेकेदार भुगतान फ्रीज और केओस सिम्युलेटर।',
      icon: <Shield className="w-4 h-4 text-rose-500" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="civic-card w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme bg-theme-header">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-teal-600 dark:text-[#00F5D4]" />
            <div>
              <h2 className="text-base font-bold text-theme-primary">
                {tr(
                  lang,
                  'Supabase Role-Based Authentication (RBAC)',
                  'सुपरबेस रोल-आधारित लॉगिन और एक्सेस (RBAC)'
                )}
              </h2>
              <p className="text-xs text-theme-secondary">
                {tr(
                  lang,
                  'Switch roles in 1 click or sign in with @supabase/supabase-js credentials',
                  '1 क्लिक में भूमिका बदलें या अपने अकाउंट से लॉगिन करें'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="civic-btn p-1.5 text-theme-secondary hover:text-theme-primary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* 1-Click Role Switcher for Judges */}
          <div>
            <div className="text-xs font-bold text-theme-secondary mb-2.5">
              {tr(
                lang,
                '1-CLICK DEMO ROLE SWITCHER (INSTANT RBAC PREVIEW)',
                'जज टेस्टिंग के लिए 1-क्लिक में भूमिका चुनें'
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {roleCards.map((item) => {
                const active = selectedRole === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleSelectRolePreset(item.role)}
                    className={`civic-subcard civic-subcard-interactive p-4 text-left flex flex-col justify-between ${
                      active ? '!border-teal-500 bg-teal-500/10' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        {item.icon}
                        {active && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-600 dark:text-[#00F5D4]">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-theme-primary">
                        {lang === 'hi' ? item.titleHi : item.title}
                      </div>
                      <p className="text-xs text-theme-secondary mt-1 leading-relaxed">
                        {lang === 'hi' ? item.permsHi : item.perms}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login / Signup Form */}
          <form onSubmit={handleSubmit} className="civic-subcard p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg ${
                    mode === 'LOGIN'
                      ? 'bg-[#00F5D4] text-slate-950'
                      : 'text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  {tr(lang, 'Sign In', 'लॉगिन (Sign In)')}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('SIGNUP')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg ${
                    mode === 'SIGNUP'
                      ? 'bg-[#00F5D4] text-slate-950'
                      : 'text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  {tr(lang, 'Create Account', 'नया खाता (Sign Up)')}
                </button>
              </div>
              <span className="text-xs font-mono text-teal-600 dark:text-[#00F5D4] flex items-center gap-1">
                <Database className="w-3.5 h-3.5" />
                <span>@supabase/supabase-js</span>
              </span>
            </div>

            {mode === 'SIGNUP' && (
              <div>
                <label className="block text-xs font-bold text-theme-secondary mb-1">
                  {tr(lang, 'Full Name', 'पूरा नाम')}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm civic-card text-theme-primary focus:outline-none"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-theme-secondary mb-1">
                  {tr(lang, 'Official / Citizen Email', 'ईमेल आईडी')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-theme-muted absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-sm civic-card text-theme-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-secondary mb-1">
                  {tr(lang, 'Password', 'पासवर्ड')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-theme-muted absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-sm civic-card text-theme-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {statusBanner && (
              <div className="p-3 rounded-xl bg-teal-500/15 border border-teal-500/40 flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-[#00F5D4]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{statusBanner}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="civic-btn px-4 py-2 text-xs font-bold civic-card text-theme-secondary"
              >
                {tr(lang, 'Cancel', 'बंद करें')}
              </button>
              <button
                type="submit"
                className="civic-btn px-5 py-2 text-xs font-bold bg-[#00F5D4] text-slate-950 rounded-xl shadow-md"
              >
                {mode === 'LOGIN'
                  ? tr(lang, 'Authenticate & Continue →', 'लॉगिन करें →')
                  : tr(lang, 'Register Role & Continue →', 'रजिस्टर करें →')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
