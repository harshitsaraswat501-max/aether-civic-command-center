import React from 'react';
import { Shield, X, Lock, Activity, CheckCircle2, Server } from 'lucide-react';
import { SystemSecurityTelemetry } from '../api/incidentApi';
import { AppLanguage, tr } from '../services/uiPreferences';

interface SystemSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: SystemSecurityTelemetry;
  onSelectRole: (role: SystemSecurityTelemetry['activeRole']) => void;
  lang: AppLanguage;
}

export const SystemSecurityModal: React.FC<SystemSecurityModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  onSelectRole,
  lang,
}) => {
  if (!isOpen) return null;

  const roles: Array<{
    id: SystemSecurityTelemetry['activeRole'];
    title: string;
    titleHi: string;
    badge: string;
    bullets: string[];
    bulletsHi: string[];
  }> = [
    {
      id: 'CITIZEN_REPORTER',
      title: 'Citizen Reporter',
      titleHi: 'नागरिक शिकायतकर्ता',
      badge: 'Level 1',
      bullets: ['Report road hazards & photos', 'Upload contradicting photo proof', 'Track live SLA timers'],
      bulletsHi: ['सड़क खतरे और फोटो भेजें', 'गलत काम का सबूत अपलोड करें', 'लाइव SLA टाइमर देखें'],
    },
    {
      id: 'JUNIOR_ENGINEER',
      title: 'Junior Engineer (JE)',
      titleHi: 'जूनियर इंजीनियर (JE)',
      badge: 'Level 2',
      bullets: ['Update department step status', 'Upload repair closure photo', 'Cannot release frozen escrow'],
      bulletsHi: ['विभाग का कार्य चरण अपडेट करें', 'रिपेयर फोटो अपलोड करें', 'फ्रीज भुगतान जारी नहीं कर सकते'],
    },
    {
      id: 'ZONAL_COMMISSIONER_IAS',
      title: 'Zonal Commissioner (IAS)',
      titleHi: 'ज़ोनल कमिश्नर (IAS)',
      badge: 'Level 3',
      bullets: ['Full Command & Chaos Controls', 'Freeze contractor payments', 'Export CSV / JSON Audit Reports'],
      bulletsHi: ['पूर्ण कमांड और टेस्ट नियंत्रण', 'ठेकेदार का भुगतान रोकें', 'CSV / JSON ऑडिट रिपोर्ट डाउनलोड करें'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="civic-card w-full max-w-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme bg-theme-header">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-teal-600 dark:text-[#00F5D4]" />
            <div>
              <h2 className="text-base font-bold text-theme-primary">
                {tr(lang, 'System Health, Security & Access Roles', 'सिस्टम सुरक्षा और अधिकारी अधिकार (RBAC)')}
              </h2>
              <p className="text-xs text-theme-secondary">
                {tr(lang, 'Rule 04 Compliant · Rate-Limited API · Server-Only Keys', 'नियम 04 अनुपालन · सुरक्षित सर्वर API')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="civic-btn p-2 text-theme-secondary hover:text-theme-primary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* 3 Clean Metric Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="civic-subcard p-4">
              <div className="flex items-center justify-between text-xs text-theme-secondary mb-1">
                <span>{tr(lang, 'AI Agent Speed', 'AI एजेंट गति')}</span>
                <Activity className="w-4 h-4 text-teal-500" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-teal-600 dark:text-[#00F5D4]">
                {telemetry.avgAgentLatencyMs}ms
              </div>
              <div className="text-xs text-theme-muted mt-1 font-mono">
                {tr(lang, 'Target < 120ms', 'लक्ष्य < 120ms')}
              </div>
            </div>

            <div className="civic-subcard p-4">
              <div className="flex items-center justify-between text-xs text-theme-secondary mb-1">
                <span>{tr(lang, 'API Rate Shield', 'API सुरक्षा सीमा')}</span>
                <Server className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-theme-primary">
                {telemetry.rateLimitRemaining}/{telemetry.rateLimitMaxPerMin}
              </div>
              <div className="text-xs text-theme-muted mt-1 font-mono">
                {tr(lang, 'Req/min per IP', 'अनुरोध/मिनट प्रति IP')}
              </div>
            </div>

            <div className="civic-subcard p-4">
              <div className="flex items-center justify-between text-xs text-theme-secondary mb-1">
                <span>{tr(lang, 'API Key Safety', 'API कुंजी सुरक्षा')}</span>
                <Lock className="w-4 h-4 text-teal-500" />
              </div>
              <div className="text-lg font-bold font-mono text-teal-600 dark:text-[#00F5D4]">
                {tr(lang, '100% SERVER-SIDE', '100% सर्वर-सुरक्षित')}
              </div>
              <div className="text-xs text-theme-muted mt-1">
                {tr(lang, 'Zero browser secrets', 'ब्राउज़र में कोई पासवर्ड नहीं')}
              </div>
            </div>
          </div>

          {/* Role Switcher */}
          <div>
            <h3 className="text-sm font-bold text-theme-primary mb-3">
              {tr(lang, 'Select Active User Role (RBAC):', 'सक्रिय उपयोगकर्ता भूमिका चुनें (RBAC):')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((r) => {
                const isSelected = telemetry.activeRole === r.id;
                const list = lang === 'hi' ? r.bulletsHi : r.bullets;
                return (
                  <button
                    key={r.id}
                    onClick={() => onSelectRole(r.id)}
                    className={`civic-subcard civic-subcard-interactive text-left p-4 flex flex-col justify-between ${
                      isSelected ? '!border-teal-500 bg-teal-500/10' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-sm font-bold text-theme-primary">
                          {lang === 'hi' ? r.titleHi : r.title}
                        </span>
                        <span className="text-xs font-mono text-teal-600 dark:text-[#00F5D4]">
                          {isSelected ? tr(lang, 'ACTIVE', 'सक्रिय') : r.badge}
                        </span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-theme-secondary">
                        {list.map((b, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-theme-header border-t border-theme flex items-center justify-end">
          <button
            onClick={onClose}
            className="civic-btn px-5 py-2 text-xs font-bold bg-[#00F5D4] text-slate-950 rounded-lg"
          >
            {tr(lang, 'Close', 'बंद करें')}
          </button>
        </div>
      </div>
    </div>
  );
};
