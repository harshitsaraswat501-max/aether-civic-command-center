import React, { useState } from 'react';
import {
  Shield,
  User,
  Wrench,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  Database,
  CheckCircle2,
  Languages,
  Sun,
  Moon,
  Settings,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import {
  CivicUserRole,
  PRESET_ROLE_PROFILES,
  useAuth,
} from './AuthContext';
import { AppLanguage, AppTheme, tr } from '../services/uiPreferences';

interface LoginScreenProps {
  lang: AppLanguage;
  onToggleLang: () => void;
  theme: AppTheme;
  onToggleTheme: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
}) => {
  const {
    loginWithSupabase,
    signUpWithSupabase,
    switchRole,
    configureSupabaseProject,
    activeSupabaseUrl,
    authMode,
  } = useAuth();

  const [authTab, setAuthTab] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<CivicUserRole>('ZONAL_COMMISSIONER');
  const [email, setEmail] = useState(PRESET_ROLE_PROFILES.ZONAL_COMMISSIONER.email);
  const [password, setPassword] = useState('SonipatCivic@2026');
  const [fullName, setFullName] = useState(
    PRESET_ROLE_PROFILES.ZONAL_COMMISSIONER.fullName
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Optional Runtime Supabase Project Connection Drawer
  const [showSupabaseConfig, setShowSupabaseConfig] = useState(false);
  const [customSbUrl, setCustomSbUrl] = useState(
    activeSupabaseUrl.includes('aether-civic-sonipat') ? '' : activeSupabaseUrl
  );
  const [customSbKey, setCustomSbKey] = useState('');

  const handleSelectRoleCard = (role: CivicUserRole) => {
    const preset = PRESET_ROLE_PROFILES[role];
    setSelectedRole(role);
    setEmail(preset.email);
    setFullName(preset.fullName);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      if (customSbUrl.trim() && customSbKey.trim()) {
        configureSupabaseProject(customSbUrl.trim(), customSbKey.trim());
      }

      const res =
        authTab === 'LOGIN'
          ? await loginWithSupabase(email, password, selectedRole)
          : await signUpWithSupabase(email, password, selectedRole, fullName);

      setFeedbackMsg(res.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSupabaseCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    configureSupabaseProject(customSbUrl, customSbKey);
    setFeedbackMsg(
      tr(
        lang,
        'Connected custom Supabase project URL & Anon Key!',
        'आपका Supabase प्रोजेक्ट सफलतापूर्वक जुड़ गया!'
      )
    );
    setShowSupabaseConfig(false);
  };

  const roles: Array<{
    role: CivicUserRole;
    title: string;
    titleHi: string;
    subtitle: string;
    subtitleHi: string;
    bullets: string[];
    bulletsHi: string[];
    icon: React.ReactNode;
    accentColor: string;
  }> = [
    {
      role: 'CITIZEN',
      title: 'Citizen',
      titleHi: 'नागरिक (Citizen)',
      subtitle: 'Sector Resident & Civic Whistleblower',
      subtitleHi: 'शिकायतकर्ता और सामुदायिक ऑडिटर',
      bullets: [
        'Submit geo-tagged Sonipat complaints',
        'Upload contradicting "After" photo proof',
      ],
      bulletsHi: [
        'सोनीपत मैप पर नई शिकायत दर्ज करें',
        'नकली रिपेयर के खिलाफ सबूत फोटो डालें',
      ],
      icon: <User className="w-5 h-5 text-teal-500" />,
      accentColor: 'border-teal-500/60',
    },
    {
      role: 'FIELD_ENGINEER',
      title: 'Engineer',
      titleHi: 'इंजीनियर (Engineer)',
      subtitle: 'Municipal Field Engineer (UHBVN / PWD)',
      subtitleHi: 'नगर निगम फील्ड इंजीनियर (JE / AE)',
      bullets: [
        'Execute Step 1 (Power) → Step 2 (Water) → Step 3 (Road)',
        'Upload "After Repair" photo for Gemini AI audit',
      ],
      bulletsHi: [
        'चरण 1 (बिजली) → चरण 2 (पानी) → चरण 3 (सड़क) पूरा करें',
        'मरम्मत के बाद सत्यापन फोटो अपलोड करें',
      ],
      icon: <Wrench className="w-5 h-5 text-amber-500" />,
      accentColor: 'border-amber-500/60',
    },
    {
      role: 'ZONAL_COMMISSIONER',
      title: 'Commissioner',
      titleHi: 'कमिश्नर (Commissioner)',
      subtitle: 'Zonal Commissioner (IAS Command Center)',
      subtitleHi: 'ज़ोनल कमिश्नर (IAS कमांड सेंटर)',
      bullets: [
        'Full Sonipat Leaflet GIS + 4-Agent Brain',
        'Freeze contractor escrow ₹ & run Chaos Simulator',
      ],
      bulletsHi: [
        'सोनीपत लाइव मैप और 4-एजेंट कमांड सेंटर',
        'ठेकेदार भुगतान फ्रीज और जज केओस सिम्युलेटर',
      ],
      icon: <Shield className="w-5 h-5 text-rose-500" />,
      accentColor: 'border-rose-500/60',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 transition-colors duration-200">
      {/* Top Bar */}
      <header className="max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl font-extrabold tracking-tight text-teal-600 dark:text-[#00F5D4]">
            AETHER-CIVIC
          </span>
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg civic-subcard text-theme-secondary">
            UN SDG 11 · Sonipat / NCR
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSupabaseConfig((prev) => !prev)}
            className="civic-btn px-3 py-2 text-xs font-bold civic-subcard text-teal-600 dark:text-[#00F5D4] flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4" />
            <span>
              {tr(lang, 'Supabase Keys', 'Supabase कनेक्शन')}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleLang}
            className="civic-btn px-3 py-2 text-xs font-bold civic-subcard text-theme-primary flex items-center gap-1.5"
          >
            <Languages className="w-4 h-4 text-teal-500" />
            <span>{lang === 'en' ? '🇮🇳 हिंदी / English' : '🇮🇳 English / हिंदी'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className="civic-btn px-3 py-2 text-xs font-bold civic-subcard text-theme-primary flex items-center gap-1.5"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>{tr(lang, 'Light', 'लाइट')}</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span>{tr(lang, 'Dark', 'डार्क')}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Optional Runtime Supabase URL & Anon Key Drawer */}
      {showSupabaseConfig && (
        <div className="max-w-4xl w-full mx-auto my-4 civic-card p-5 border-2 !border-teal-500/60">
          <form onSubmit={handleSaveSupabaseCredentials} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-teal-600 dark:text-[#00F5D4]">
                <Database className="w-4 h-4" />
                <span>
                  {tr(
                    lang,
                    'Connect Your Live Supabase Project (incidents & Auth)',
                    'अपना लाइव Supabase प्रोजेक्ट जोड़ें (incidents टेबल और Auth)'
                  )}
                </span>
              </div>
              <span className="text-xs font-mono text-theme-secondary">
                @supabase/supabase-js
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-theme-secondary mb-1">
                  VITE_SUPABASE_URL
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={customSbUrl}
                  onChange={(e) => setCustomSbUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono civic-subcard text-theme-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-theme-secondary mb-1">
                  VITE_SUPABASE_ANON_KEY
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={customSbKey}
                  onChange={(e) => setCustomSbKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono civic-subcard text-theme-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="civic-btn px-4 py-2 text-xs font-bold bg-[#00F5D4] text-slate-950 rounded-xl"
              >
                {tr(lang, 'Save & Connect Supabase', 'सेव और कनेक्ट करें')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Center Grid: Role Selection + Supabase Login/Signup Form */}
      <main className="max-w-6xl w-full mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left 7 Cols: Role Selection Cards */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-500/15 text-teal-600 dark:text-[#00F5D4] text-xs font-bold mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {tr(
                  lang,
                  'SONIPAT / NCR AUTONOMOUS COMMAND CENTER',
                  'सोनीपत / NCR स्वायत्त स्मार्ट सिटी कमांड सेंटर'
                )}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-theme-primary leading-tight">
              {tr(
                lang,
                'Select Your Municipal Role & Authenticate',
                'अपनी भूमिका चुनें और पोर्टल में प्रवेश करें'
              )}
            </h1>
            <p className="text-sm text-theme-secondary mt-2">
              {tr(
                lang,
                'Choose Citizen, Engineer, or Commissioner below to configure Role-Based Access Control (RBAC) with Supabase Auth.',
                'सुपरबेस ऑथ (Supabase Auth) के साथ नागरिक, इंजीनियर या कमिश्नर के रूप में लॉगिन करें।'
              )}
            </p>
          </div>

          {/* 3 Interactive Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((r) => {
              const isSelected = selectedRole === r.role;
              return (
                <div
                  key={r.role}
                  onClick={() => handleSelectRoleCard(r.role)}
                  className={`civic-card p-5 cursor-pointer flex flex-col justify-between transition-all ${
                    isSelected
                      ? `!border-[#00F5D4] ring-2 ring-[#00F5D4]/30`
                      : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="p-2 rounded-xl civic-subcard">{r.icon}</div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isSelected
                            ? 'bg-[#00F5D4] text-slate-950'
                            : 'bg-slate-500/15 text-theme-secondary'
                        }`}
                      >
                        {isSelected
                          ? tr(lang, 'SELECTED', 'चयनित')
                          : tr(lang, 'SELECT ROLE', 'चुनें')}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-theme-primary">
                      {lang === 'hi' ? r.titleHi : r.title}
                    </h3>
                    <p className="text-xs font-medium text-teal-600 dark:text-[#00F5D4] mt-0.5">
                      {lang === 'hi' ? r.subtitleHi : r.subtitle}
                    </p>

                    <ul className="mt-3 space-y-1.5 text-xs text-theme-secondary">
                      {(lang === 'hi' ? r.bulletsHi : r.bullets).map((b, i) => (
                        <li key={i}>• {b}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      switchRole(r.role);
                    }}
                    className="civic-btn mt-4 w-full py-2 px-3 text-xs font-bold civic-subcard text-teal-600 dark:text-[#00F5D4] hover:bg-[#00F5D4] hover:text-slate-950 flex items-center justify-center gap-1.5"
                  >
                    <span>
                      {tr(
                        lang,
                        `1-Click ${r.title} Demo`,
                        `1-क्लिक ${r.titleHi.split(' ')[0]} प्रवेश`
                      )}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Supabase Login & Signup Form */}
        <div className="lg:col-span-5">
          <div className="civic-card p-6 sm:p-7 shadow-2xl">
            {/* Login / Signup Mode Tabs */}
            <div className="flex items-center justify-between gap-2 pb-5 border-b border-theme">
              <div className="grid grid-cols-2 gap-2 w-full bg-slate-500/10 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAuthTab('LOGIN')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    authTab === 'LOGIN'
                      ? 'bg-[#00F5D4] text-slate-950 shadow-sm'
                      : 'text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>{tr(lang, 'Login', 'लॉगिन (Login)')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab('SIGNUP')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    authTab === 'SIGNUP'
                      ? 'bg-[#00F5D4] text-slate-950 shadow-sm'
                      : 'text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{tr(lang, 'Sign Up', 'साइन अप (Sign Up)')}</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
              {/* Role Selector Dropdown inside Form */}
              <div>
                <label className="block text-xs font-bold text-theme-secondary mb-1.5">
                  {tr(lang, 'Selected Access Role (RBAC)', 'चयनित भूमिका (Role)')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CITIZEN', 'FIELD_ENGINEER', 'ZONAL_COMMISSIONER'] as const).map(
                    (roleKey) => (
                      <button
                        key={roleKey}
                        type="button"
                        onClick={() => handleSelectRoleCard(roleKey)}
                        className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all ${
                          selectedRole === roleKey
                            ? 'bg-teal-500/20 border-teal-500 text-teal-600 dark:text-[#00F5D4]'
                            : 'border-theme text-theme-secondary hover:text-theme-primary'
                        }`}
                      >
                        {roleKey === 'CITIZEN'
                          ? tr(lang, 'Citizen', 'नागरिक')
                          : roleKey === 'FIELD_ENGINEER'
                            ? tr(lang, 'Engineer', 'इंजीनियर')
                            : tr(lang, 'Commissioner', 'कमिश्नर')}
                      </button>
                    )
                  )}
                </div>
              </div>

              {authTab === 'SIGNUP' && (
                <div>
                  <label className="block text-xs font-bold text-theme-secondary mb-1.5">
                    {tr(lang, 'Full Name', 'पूरा नाम')}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={tr(lang, 'Enter your full name', 'अपना नाम लिखें')}
                    className="w-full px-3.5 py-2.5 text-sm civic-subcard text-theme-primary focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-theme-secondary mb-1.5">
                  {tr(lang, 'Email Address', 'ईमेल आईडी')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-theme-muted absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm civic-subcard text-theme-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-secondary mb-1.5">
                  {tr(lang, 'Password', 'पासवर्ड')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-theme-muted absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm civic-subcard text-theme-primary focus:outline-none"
                  />
                </div>
              </div>

              {feedbackMsg && (
                <div className="p-3 rounded-xl bg-teal-500/15 border border-teal-500/40 flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-[#00F5D4]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{feedbackMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="civic-btn w-full py-3 px-5 bg-[#00F5D4] text-slate-950 font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                {authTab === 'LOGIN' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? tr(lang, 'Signing in via Supabase...', 'लॉगिन हो रहा है...')
                        : tr(
                            lang,
                            `Login as ${
                              selectedRole === 'CITIZEN'
                                ? 'Citizen'
                                : selectedRole === 'FIELD_ENGINEER'
                                  ? 'Engineer'
                                  : 'Commissioner'
                            } →`,
                            'पोर्टल में लॉगिन करें →'
                          )}
                    </span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? tr(lang, 'Creating Supabase Account...', 'खाता बन रहा है...')
                        : tr(
                            lang,
                            'Create Supabase Account & Enter →',
                            'नया खाता बनाएं और प्रवेश करें →'
                          )}
                    </span>
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-theme flex items-center justify-between text-[11px] font-mono text-theme-muted">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-teal-500" />
                  <span>
                    {authMode === 'SUPABASE_CLOUD'
                      ? 'Supabase Cloud Connected'
                      : 'Supabase Auth Ready'}
                  </span>
                </span>
                <span>public.incidents + RLS</span>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-theme-muted font-mono">
        AETHER-CIVIC · Sonipat Municipal GIS · Built by Harshit, Naitik & Preksha
      </footer>
    </div>
  );
};
