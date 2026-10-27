import React, { useState } from 'react';
import {
  MapPin,
  Layers,
  GitMerge,
  Clock,
  CheckCircle2,
  Lock,
  AlertTriangle,
  PlusCircle,
  Camera,
  ArrowRight,
  Zap,
  ChevronDown,
  ChevronUp,
  Navigation,
  ShieldAlert,
} from 'lucide-react';
import { MasterIncidentTicket } from '../services/deduplicationEngine';
import {
  PresetCivicScenario,
  SONIPAT_PRESET_SCENARIOS,
} from '../services/agentOrchestrator';
import { AppLanguage, AppTheme, tr, translateTerm } from '../services/uiPreferences';
import { SonipatLeafletMap } from './SonipatLeafletMap';
import { CivicUserRole } from '../auth/AuthContext';

export type QuickChaosType = 'SLA_BREACH' | 'FAKE_CLOSURE' | 'FLASH_FLOOD';

interface CommandCenterMapProps {
  tickets: MasterIncidentTicket[];
  selectedTicketId: string;
  onSelectTicket: (id: string) => void;
  onIngestPresetScenario: (scenario: PresetCivicScenario) => void;
  onIngestCustomComplaint: (custom: {
    title: string;
    sector: string;
    hasLiveElectricalHazard: boolean;
    hasWaterlogging: boolean;
  }) => void;
  onAdvanceDepartmentStep: (ticketId: string, stepOrder: number) => void;
  onOpenVisualAuditForTicket: (ticketId: string) => void;
  onQuickChaosTrigger: (type: QuickChaosType) => void;
  onRefreshSupabaseIncidents?: () => void;
  isFetchingSupabase?: boolean;
  lastSyncedAt?: string;
  theme: AppTheme;
  lang: AppLanguage;
  activeUserRole: CivicUserRole;
}

function formatCountdown(seconds: number): string {
  const safe = Math.max(0, seconds);
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const CommandCenterMap: React.FC<CommandCenterMapProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicket,
  onIngestPresetScenario,
  onIngestCustomComplaint,
  onAdvanceDepartmentStep,
  onOpenVisualAuditForTicket,
  onQuickChaosTrigger,
  onRefreshSupabaseIncidents,
  isFetchingSupabase,
  lastSyncedAt,
  theme,
  lang,
  activeUserRole,
}) => {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customSector, setCustomSector] = useState('Sector 14, Sonipat');
  const [hasElectric, setHasElectric] = useState(true);
  const [hasWater, setHasWater] = useState(true);
  const [showMergedReportsList, setShowMergedReportsList] = useState(false);

  // Track active Quick Judge Test button feedback
  const [activeQuickChaos, setActiveQuickChaos] = useState<{
    type: QuickChaosType;
    timestamp: string;
    count: number;
  } | null>(null);

  const activeTicket =
    tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    onIngestCustomComplaint({
      title: customTitle.trim(),
      sector: customSector.trim() || 'Sector 14, Sonipat',
      hasLiveElectricalHazard: hasElectric,
      hasWaterlogging: hasWater,
    });
    setCustomTitle('');
    setShowCustomForm(false);
  };

  const handleQuickButtonPress = (type: QuickChaosType) => {
    onQuickChaosTrigger(type);
    setActiveQuickChaos((prev) => ({
      type,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      count: (prev?.count || 0) + 1,
    }));
  };

  return (
    <div className="space-y-7">
      {/* Card 1: Quick Scenario Ingestion */}
      <section className="civic-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-theme">
          <div>
            <h2 className="text-lg font-bold text-theme-primary">
              {tr(
                lang,
                '01. Report Hazard & Sync to Supabase incidents Table (200m)',
                '01. शिकायत दर्ज करें और Supabase में सिंक करें (200 मीटर)'
              )}
            </h2>
            <p className="text-xs text-theme-secondary mt-1">
              {tr(
                lang,
                'Click any preset below: AI merges 12 citizen reports into 1 Master Ticket and writes to Supabase public.incidents.',
                'किसी भी स्थिति पर क्लिक करें: AI 12 शिकायतों को जोड़कर मैप और Supabase पर 1 मास्टर टिकट बनाता है।'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCustomForm((prev) => !prev)}
            className="civic-btn px-4 py-2.5 text-xs font-bold bg-teal-500/15 border border-teal-500/50 text-teal-600 dark:text-[#00F5D4] rounded-xl flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>
              {showCustomForm
                ? tr(lang, 'Close Form', 'फॉर्म बंद करें')
                : tr(lang, '+ New Citizen Report', '+ नई शिकायत दर्ज करें')}
            </span>
          </button>
        </div>

        {/* 3 Punchy Preset Cards */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {SONIPAT_PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onIngestPresetScenario(preset)}
              className="civic-subcard civic-subcard-interactive text-left p-5 flex flex-col justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-teal-600 dark:text-[#00F5D4] mb-1.5 flex items-center justify-between">
                  <span>{lang === 'hi' ? preset.shortBadgeHi : preset.shortBadge}</span>
                  <span className="font-mono text-[10px] opacity-80">
                    {preset.lat.toFixed(3)}°N
                  </span>
                </div>
                <div className="text-sm font-bold text-theme-primary leading-snug">
                  {lang === 'hi' ? preset.labelHi : preset.label}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-theme flex items-center justify-between text-xs font-mono text-theme-secondary tabular-nums">
                <span>₹{(preset.escrowValueINR / 1000).toFixed(0)}k Escrow</span>
                <span className="font-sans font-bold text-teal-600 dark:text-[#00F5D4]">
                  {tr(lang, 'Merge 12 Reports →', '12 शिकायतें जोड़ें →')}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Simple Custom Citizen Complaint Form */}
        {showCustomForm && (
          <form
            onSubmit={handleCustomSubmit}
            className="mt-5 pt-5 border-t border-theme grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
          >
            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-theme-secondary mb-1.5">
                {tr(lang, 'What is the problem?', 'समस्या क्या है?')}
              </label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={tr(
                  lang,
                  'e.g., Live wire in flooded road...',
                  'उदा: पानी भरी सड़क में टूटा बिजली का तार...'
                )}
                className="w-full px-3.5 py-2.5 text-sm civic-subcard text-theme-primary focus:outline-none"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-theme-secondary mb-1.5">
                {tr(lang, 'Location / Sector', 'स्थान / सेक्टर')}
              </label>
              <input
                type="text"
                value={customSector}
                onChange={(e) => setCustomSector(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm civic-subcard text-theme-primary focus:outline-none"
              />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1.5 text-xs font-medium text-theme-primary pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasElectric}
                  onChange={(e) => setHasElectric(e.target.checked)}
                  className="accent-teal-500"
                />
                <span>{tr(lang, 'Electric Risk', 'बिजली खतरा')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasWater}
                  onChange={(e) => setHasWater(e.target.checked)}
                  className="accent-teal-500"
                />
                <span>{tr(lang, 'Waterlogged', 'जलभराव')}</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="civic-btn w-full px-4 py-2.5 text-xs font-bold bg-[#00F5D4] text-slate-950 rounded-xl whitespace-nowrap"
              >
                {tr(lang, 'Submit Report', 'दर्ज करें')}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Card 2: Live Interactive Leaflet.js Map & Master Ticket Summary */}
      {activeTicket && (
        <section className="civic-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-theme">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-5 h-5 text-teal-600 dark:text-[#00F5D4]" />
              <div>
                <h2 className="text-lg font-bold text-theme-primary">
                  {tr(
                    lang,
                    'Live Sonipat/NCR Leaflet.js Map (Supabase incidents)',
                    'सोनीपत लाइव Leaflet GPS मैप (Supabase incidents)'
                  )}
                </h2>
                <p className="text-xs text-theme-secondary">
                  {tr(
                    lang,
                    'Live incident pins fetched from Supabase public.incidents with 200m spatial clustering.',
                    'सुपरबेस incidents टेबल से सीधे प्राप्त लाइव GPS पिन और 200m क्लस्टर।'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {tickets.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTicket(t.id)}
                  className={`civic-btn px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg border transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    t.id === activeTicket.id
                      ? 'bg-teal-500/20 border-teal-500 text-teal-600 dark:text-[#00F5D4]'
                      : 'border-theme text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  <Navigation className="w-3 h-3" />
                  <span>
                    {t.id} · {lang === 'hi' ? t.sectorHi || t.sector : t.sector.split(',')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 7 Cols: Live Interactive Leaflet Map */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <SonipatLeafletMap
                tickets={tickets}
                selectedTicketId={activeTicket.id}
                onSelectTicket={onSelectTicket}
                onOpenVisualAudit={onOpenVisualAuditForTicket}
                onRefreshSupabaseIncidents={onRefreshSupabaseIncidents}
                isFetchingSupabase={isFetchingSupabase}
                lastSyncedAt={lastSyncedAt}
                activeChaosPulse={activeQuickChaos?.count}
                theme={theme}
                lang={lang}
              />

              {/* Instant Judge Stress-Test Bar */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-theme">
                <span className="text-xs font-bold text-theme-secondary">
                  {tr(lang, 'Quick Judge Test:', 'जज त्वरित टेस्ट:')}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickButtonPress('SLA_BREACH')}
                    className={`civic-btn px-3.5 py-2 text-xs font-extrabold rounded-lg border-2 cursor-pointer transition-all ${
                      activeQuickChaos?.type === 'SLA_BREACH'
                        ? 'bg-[#FFB703] text-slate-950 border-[#FFB703] shadow-lg ring-2 ring-amber-400/50'
                        : 'bg-amber-500/15 border-amber-500/60 text-amber-600 dark:text-[#FFB703] hover:bg-amber-500/25'
                    }`}
                  >
                    ⏰ {tr(lang, 'SLA Breach', 'SLA देरी')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickButtonPress('FAKE_CLOSURE')}
                    className={`civic-btn px-3.5 py-2 text-xs font-extrabold rounded-lg border-2 cursor-pointer transition-all ${
                      activeQuickChaos?.type === 'FAKE_CLOSURE'
                        ? 'bg-[#FF2A85] text-white border-[#FF2A85] shadow-lg ring-2 ring-rose-400/50'
                        : 'bg-rose-500/15 border-rose-500/60 text-rose-600 dark:text-[#FF2A85] hover:bg-rose-500/25'
                    }`}
                  >
                    🤥 {tr(lang, 'Fake Photo', 'नकली फोटो')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickButtonPress('FLASH_FLOOD')}
                    className={`civic-btn px-3.5 py-2 text-xs font-extrabold rounded-lg border-2 cursor-pointer transition-all ${
                      activeQuickChaos?.type === 'FLASH_FLOOD'
                        ? 'bg-[#00F5D4] text-slate-950 border-[#00F5D4] shadow-lg ring-2 ring-teal-400/50'
                        : 'bg-sky-500/15 border-sky-500/60 text-sky-600 dark:text-sky-300 hover:bg-sky-500/25'
                    }`}
                  >
                    🌧️ {tr(lang, 'Flash Flood', 'अचानक बाढ़')}
                  </button>
                </div>
              </div>

              {/* Immediate Visual Feedback Banner right under the 3 Quick Judge Test buttons */}
              {activeQuickChaos && (
                <div
                  className={`mt-3 p-3.5 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    activeQuickChaos.type === 'FAKE_CLOSURE'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-500'
                      : activeQuickChaos.type === 'SLA_BREACH'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-500'
                        : 'bg-teal-500/15 border-teal-500 text-teal-600 dark:text-[#00F5D4]'
                  }`}
                >
                  <div className="flex items-start gap-2.5 text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold">
                        {activeQuickChaos.type === 'SLA_BREACH' &&
                          tr(
                            lang,
                            `SLA BREACH TRIGGERED ON ${activeTicket.id} (${activeQuickChaos.timestamp})`,
                            `${activeTicket.id} पर SLA समय समाप्त (${activeQuickChaos.timestamp})`
                          )}
                        {activeQuickChaos.type === 'FAKE_CLOSURE' &&
                          tr(
                            lang,
                            `FAKE CONTRACTOR PHOTO CAUGHT ON ${activeTicket.id} (${activeQuickChaos.timestamp})`,
                            `${activeTicket.id} पर ठेकेदार की नकली फोटो पकड़ी गई (${activeQuickChaos.timestamp})`
                          )}
                        {activeQuickChaos.type === 'FLASH_FLOOD' &&
                          tr(
                            lang,
                            `FLASH-FLOOD SURGE: +12 REPORTS MERGED ON ${activeTicket.id} (${activeQuickChaos.timestamp})`,
                            `${activeTicket.id} पर अचानक बाढ़: +12 नई शिकायतें जुड़ीं (${activeQuickChaos.timestamp})`
                          )}
                      </div>
                      <p className="text-theme-primary font-medium mt-0.5">
                        {activeQuickChaos.type === 'SLA_BREACH' &&
                          tr(
                            lang,
                            'Step 2 Timer hit 00:00:00 → Dispatched QRT-Alpha Backup Crew & Escalated to Zonal Commissioner.',
                            'चरण 2 टाइमर 00:00:00 हुआ → बैकअप QRT टीम भेजी गई और कमिश्नर को अलर्ट किया गया।'
                          )}
                        {activeQuickChaos.type === 'FAKE_CLOSURE' &&
                          tr(
                            lang,
                            `Trust Score slashed to ${activeTicket.contractorTrustScore}% & ₹${activeTicket.escrowValueINR.toLocaleString('en-IN')} Escrow FROZEN!`,
                            `भरोसा स्कोर घटाकर ${activeTicket.contractorTrustScore}% किया और ₹${activeTicket.escrowValueINR.toLocaleString('en-IN')} भुगतान फ्रीज किया!`
                          )}
                        {activeQuickChaos.type === 'FLASH_FLOOD' &&
                          tr(
                            lang,
                            `Urgency boosted to ${activeTicket.urgencyScore}/100 (${activeTicket.duplicateCount} clustered reports). Isolated 11kV feeders & rerouted 50HP pumps.`,
                            `गंभीरता स्कोर ${activeTicket.urgencyScore}/100 हुआ (${activeTicket.duplicateCount} शिकायतें जुड़ीं)। 50HP पंप भेजे गए।`
                          )}
                      </p>
                    </div>
                  </div>

                  {activeQuickChaos.type === 'FAKE_CLOSURE' ? (
                    <button
                      type="button"
                      onClick={() => onOpenVisualAuditForTicket(activeTicket.id)}
                      className="civic-btn px-3 py-1.5 rounded-lg bg-[#FF2A85] text-white text-xs font-bold shrink-0"
                    >
                      {tr(lang, 'Inspect Fake Photo →', 'नकली फोटो देखें →')}
                    </button>
                  ) : (
                    <a
                      href="#dag-sequence-card"
                      className="civic-btn px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-bold shrink-0 text-center"
                    >
                      {tr(lang, 'See Updated Tasks ↓', 'अपडेटेड कार्य देखें ↓')}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Right 5 Cols: Punchy Bullet Summary */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs font-bold text-teal-600 dark:text-[#00F5D4]">
                    <span className="flex items-center gap-1.5">
                      <GitMerge className="w-4 h-4" />
                      <span>
                        {tr(
                          lang,
                          `${activeTicket.duplicateCount} Duplicate Reports → 1 Ticket`,
                          `${activeTicket.duplicateCount} डुप्लीकेट शिकायतें → 1 मास्टर टिकट`
                        )}
                      </span>
                    </span>
                    <span className="font-mono text-[11px] text-theme-secondary">
                      {activeTicket.lat.toFixed(4)}°N, {activeTicket.lng.toFixed(4)}°E
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-theme-primary mt-1.5 leading-snug">
                    {lang === 'hi' ? activeTicket.titleHi || activeTicket.title : activeTicket.title}
                  </h3>
                </div>

                {/* Simple Urgency Meter */}
                <div className="civic-subcard p-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs font-bold text-theme-secondary">
                      {tr(lang, 'Urgency Score', 'गंभीरता स्कोर (Urgency)')}
                    </span>
                    <span className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-[#FF2A85]">
                      {activeTicket.urgencyScore} / 100
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-500/20 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-[#00F5D4] via-[#FFB703] to-[#FF2A85]"
                      style={{ width: `${activeTicket.urgencyScore}%` }}
                    />
                  </div>
                  <ul className="grid grid-cols-2 gap-2 text-xs font-medium text-theme-secondary">
                    <li>• {tr(lang, 'Life Risk:', 'जान का खतरा:')} +{activeTicket.urgencyBreakdown.lifeSafetyRisk}</li>
                    <li>• {tr(lang, `${activeTicket.duplicateCount} Reports:`, `${activeTicket.duplicateCount} शिकायतें:`)} +{activeTicket.urgencyBreakdown.reportDensityScore}</li>
                    <li>• {tr(lang, 'Main Road:', 'मुख्य सड़क:')} +{activeTicket.urgencyBreakdown.arterialTrafficImpact}</li>
                    <li>• {tr(lang, 'Rain Alert:', 'बारिश अलर्ट:')} +{activeTicket.urgencyBreakdown.weatherMultiplier}</li>
                  </ul>
                </div>

                {/* Collapsible Reports Drawer */}
                <div className="civic-subcard overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowMergedReportsList((prev) => !prev)}
                    className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-theme-primary hover:opacity-80"
                  >
                    <span>
                      {tr(
                        lang,
                        `View All ${activeTicket.mergedReports.length} Citizen Reports`,
                        `सभी ${activeTicket.mergedReports.length} नागरिक शिकायतें देखें`
                      )}
                    </span>
                    {showMergedReportsList ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {showMergedReportsList && (
                    <div className="p-3 border-t border-theme space-y-2 max-h-40 overflow-y-auto">
                      {activeTicket.mergedReports.map((rep) => (
                        <div
                          key={rep.id}
                          className="p-2 rounded-lg bg-slate-500/10 text-xs flex items-start justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span className="font-bold text-theme-primary">{rep.citizenName}: </span>
                            <span className="text-theme-secondary">
                              {lang === 'hi' ? rep.rawTextHi : rep.rawText}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-teal-600 dark:text-[#00F5D4] shrink-0">
                            {rep.distanceFromCentroidMeters}m
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenVisualAuditForTicket(activeTicket.id)}
                className="civic-btn w-full py-3 px-4 bg-[#00F5D4] text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <Camera className="w-4 h-4" />
                <span>
                  {activeUserRole === 'CITIZEN'
                    ? tr(
                        lang,
                        'Upload Contradicting Citizen Photo Proof',
                        'नागरिक सबूत फोटो अपलोड करें (AI Lie-Detector)'
                      )
                    : tr(
                        lang,
                        'Check Before vs. After Photo Proof',
                        'पहले बनाम बाद की फोटो जांचें (AI Lie-Detector)'
                      )}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Card 3: Multi-Department Step-by-Step Sequence */}
      {activeTicket && (
        <section id="dag-sequence-card" className="civic-card p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-theme">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-teal-600 dark:text-[#00F5D4]" />
              <div>
                <h2 className="text-lg font-bold text-theme-primary">
                  {tr(
                    lang,
                    '02. Multi-Department Action Order (Safe Sequence)',
                    '02. विभागों का सही कार्य क्रम (Safe Sequence)'
                  )}
                </h2>
                <p className="text-xs text-theme-secondary mt-0.5">
                  {tr(
                    lang,
                    'Step 1 (Power) → Step 2 (Water) → Step 3 (Road). Each has a live SLA timer.',
                    'चरण 1 (बिजली) → चरण 2 (पानी) → चरण 3 (सड़क)। हर चरण का लाइव टाइमर है।'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono font-bold tabular-nums">
              <span className="text-theme-secondary">
                {tr(lang, 'Trust:', 'भरोसा:')} {activeTicket.contractorTrustScore}%
              </span>
              <span>·</span>
              <span
                className={
                  activeTicket.escrowStatus === 'FROZEN_FRAUD_DETECTED'
                    ? 'text-rose-500'
                    : 'text-teal-600 dark:text-[#00F5D4]'
                }
              >
                ₹{activeTicket.escrowValueINR.toLocaleString('en-IN')} ({translateTerm(lang, activeTicket.escrowStatus)})
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {activeTicket.tasks.map((task) => {
              const isCompleted = task.status === 'COMPLETED';
              const isInProgress = task.status === 'IN_PROGRESS';
              const isLocked = task.status === 'LOCKED_DEPENDENCY';
              const isBreached =
                task.status === 'SLA_BREACHED' || task.status === 'REOPENED_AUDIT_FAILURE';

              return (
                <div
                  key={task.id}
                  className={`civic-subcard civic-subcard-interactive p-5 flex flex-col justify-between ${
                    isBreached
                      ? '!border-rose-500 bg-rose-500/10'
                      : isInProgress
                        ? '!border-teal-500'
                        : isLocked
                          ? 'opacity-80'
                          : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs font-bold mb-2.5">
                      <span className="text-teal-600 dark:text-[#00F5D4]">
                        {translateTerm(lang, task.department)}
                      </span>
                      <span
                        className={`font-mono ${
                          isBreached
                            ? 'text-rose-500'
                            : isCompleted
                              ? 'text-teal-500'
                              : isInProgress
                                ? 'text-amber-500'
                                : 'text-theme-muted'
                        }`}
                      >
                        {translateTerm(lang, task.status)}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-theme-primary mb-1.5">
                      {lang === 'hi' ? task.actionTitleHi : task.actionTitle}
                    </h4>
                    <p className="text-xs text-theme-secondary leading-relaxed mb-4">
                      • {lang === 'hi' ? task.technicalSpecHi : task.technicalSpec}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-theme space-y-3">
                    <div className="flex items-center justify-between text-xs text-theme-secondary">
                      <span>{task.assignedEngineer}</span>
                      {task.dependsOnStep && (
                        <span>
                          {tr(lang, `Needs Step ${task.dependsOnStep}`, `चरण ${task.dependsOnStep} के बाद`)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-mono tabular-nums">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-teal-500" />
                        ) : isLocked ? (
                          <Lock className="w-4 h-4 text-theme-muted" />
                        ) : isBreached ? (
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500" />
                        )}
                        <span
                          className={`text-base font-bold ${
                            isBreached
                              ? 'text-rose-500'
                              : isCompleted
                                ? 'text-teal-600 dark:text-[#00F5D4]'
                                : 'text-theme-primary'
                          }`}
                        >
                          {isCompleted
                            ? tr(lang, 'DONE', 'पूरा हुआ')
                            : formatCountdown(task.slaRemainingSeconds)}
                        </span>
                      </div>

                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() =>
                            onAdvanceDepartmentStep(activeTicket.id, task.stepOrder)
                          }
                          className="civic-btn px-3 py-1.5 text-xs font-bold bg-teal-500/20 border border-teal-500/50 text-teal-700 dark:text-[#00F5D4] rounded-lg flex items-center gap-1 whitespace-nowrap"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>
                            {isLocked
                              ? tr(lang, 'Start Step', 'शुरू करें')
                              : tr(lang, 'Mark Done', 'पूरा करें')}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
