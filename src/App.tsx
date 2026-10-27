import { useCallback, useEffect, useState } from 'react';
import {
  Shield,
  RotateCcw,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  Languages,
  UserCheck,
  LogOut,
} from 'lucide-react';
import {
  AgentReasoningLog,
  orchestrateScenarioIngestion,
  PresetCivicScenario,
  SONIPAT_PRESET_SCENARIOS,
} from './services/agentOrchestrator';
import { MasterIncidentTicket } from './services/deduplicationEngine';
import {
  enforceFakeClosurePenalty,
  evaluateTicketSLABreaches,
} from './services/slaWatchdogService';
import { VisionAuditResult } from './api/geminiVisionAudit';
import { SystemSecurityTelemetry } from './api/incidentApi';
import { AppLanguage, AppTheme, tr } from './services/uiPreferences';
import {
  fetchIncidentsFromSupabaseTable,
  subscribeToSupabaseIncidentsTable,
  syncIncidentsWithSupabase,
} from './services/supabaseClient';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AuthModal } from './auth/AuthModal';
import { LoginScreen } from './auth/LoginScreen';
import { CommandCenterMap } from './components/CommandCenterMap';
import { VisualAuditorLab } from './components/VisualAuditorLab';
import { ChaosSimulator } from './components/ChaosSimulator';
import { SLABoard } from './components/SLABoard';
import { RepoDocsExporter } from './components/RepoDocsExporter';
import { AgentReasoningTerminal } from './components/AgentReasoningTerminal';
import { SystemSecurityModal } from './components/SystemSecurityModal';

type ActiveWorkspaceTab =
  | 'COMMAND_CENTER'
  | 'VISUAL_AUDITOR'
  | 'CHAOS_SIMULATOR'
  | 'SLA_BOARD'
  | 'REPO_DOCS';

function createInitialState(): {
  tickets: MasterIncidentTicket[];
  logs: AgentReasoningLog[];
} {
  const first = orchestrateScenarioIngestion(SONIPAT_PRESET_SCENARIOS[0], 0);
  const second = orchestrateScenarioIngestion(SONIPAT_PRESET_SCENARIOS[1], 1);
  const third = orchestrateScenarioIngestion(SONIPAT_PRESET_SCENARIOS[2], 2);

  return {
    tickets: [first.masterTicket, second.masterTicket, third.masterTicket],
    logs: [...first.agentLogs],
  };
}

function AetherCivicShell() {
  const { user, isAuthenticated, switchRole, logout } = useAuth();
  const [initialData] = useState(createInitialState);
  const [tickets, setTickets] = useState<MasterIncidentTicket[]>(initialData.tickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    initialData.tickets[0].id
  );
  const [agentLogs, setAgentLogs] = useState<AgentReasoningLog[]>(initialData.logs);
  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>('COMMAND_CENTER');
  const [activeChaosTitle, setActiveChaosTitle] = useState<string | null>(null);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Supabase `public.incidents` live fetch state
  const [isFetchingSupabase, setIsFetchingSupabase] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');

  // 1. Theme Toggle State (Dark Mode / Light Mode)
  const [theme, setTheme] = useState<AppTheme>('dark');

  // 2. Accessibility Zoom State (For Spectacles: 85% to 130%)
  const [zoomPercent, setZoomPercent] = useState<number>(100);

  // 3. Working Hindi / English Toggle State
  const [lang, setLang] = useState<AppLanguage>('en');

  // Sync Theme class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('dark');
    } else {
      root.classList.remove('theme-light');
      root.classList.add('dark');
    }
  }, [theme]);

  // Sync Accessibility Root Font Zoom on <html>
  useEffect(() => {
    document.documentElement.style.fontSize = `${zoomPercent}%`;
  }, [zoomPercent]);

  // Fetch live Sonipat/NCR incident pins directly from Supabase `incidents` table
  const loadSupabaseIncidents = useCallback(async () => {
    setIsFetchingSupabase(true);
    try {
      const res = await fetchIncidentsFromSupabaseTable(initialData.tickets);
      setTickets(res.tickets);
      setLastSyncedAt(res.fetchedAt);
    } finally {
      setIsFetchingSupabase(false);
    }
  }, [initialData.tickets]);

  useEffect(() => {
    void loadSupabaseIncidents();
    const unsubscribe = subscribeToSupabaseIncidentsTable(() => {
      void loadSupabaseIncidents();
    });
    return () => unsubscribe();
  }, [loadSupabaseIncidents]);

  // UN SDG 11 Live Impact Metrics
  const [sdgImpactScore, setSdgImpactScore] = useState<number>(94.8);
  const [complaintsVerified, setComplaintsVerified] = useState<number>(1428);
  const [fakeClosuresBlocked, setFakeClosuresBlocked] = useState<number>(47);
  const [publicFundsSavedINR, setPublicFundsSavedINR] = useState<number>(4285000);
  const [avgResolutionSla, setAvgResolutionSla] = useState<string>('03h 12m');

  // Rule 04 Security & RBAC State
  const [securityTelemetry, setSecurityTelemetry] = useState<SystemSecurityTelemetry>({
    activeRole: 'ZONAL_COMMISSIONER_IAS',
    rateLimitMaxPerMin: 120,
    rateLimitRemaining: 116,
    avgAgentLatencyMs: 74,
    p99AgentLatencyMs: 109,
    rbacEnforcementStatus: 'STRICT_ENFORCED',
    zeroClientSecretsVerified: true,
  });

  // Live 1-second SLA Countdown Heartbeat
  useEffect(() => {
    const timer = setInterval(() => {
      setTickets((prevTickets) =>
        prevTickets.map((ticket) => ({
          ...ticket,
          tasks: ticket.tasks.map((task) => {
            if (task.status === 'IN_PROGRESS' && task.slaRemainingSeconds > 0) {
              return {
                ...task,
                slaRemainingSeconds: task.slaRemainingSeconds - 1,
              };
            }
            return task;
          }),
        }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeTicket =
    tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const appendAgentLogs = (newEntries: AgentReasoningLog[]) => {
    setAgentLogs((prev) => [...newEntries, ...prev]);
  };

  const handleIngestPresetScenario = (scenario: PresetCivicScenario) => {
    const { masterTicket, agentLogs: newLogs } = orchestrateScenarioIngestion(
      scenario,
      tickets.length
    );
    setTickets((prev) => {
      const updated = [masterTicket, ...prev];
      void syncIncidentsWithSupabase(updated);
      return updated;
    });
    setSelectedTicketId(masterTicket.id);
    setLastSyncedAt(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    appendAgentLogs(newLogs);
    setComplaintsVerified((prev) => prev + 12);
    setSdgImpactScore((prev) => Number(Math.min(99.4, prev + 0.3).toFixed(1)));
  };

  const handleIngestCustomComplaint = (custom: {
    title: string;
    sector: string;
    hasLiveElectricalHazard: boolean;
    hasWaterlogging: boolean;
  }) => {
    const customScenario: PresetCivicScenario = {
      id: `CUSTOM-${Date.now()}`,
      label: custom.title,
      labelHi: custom.title,
      shortBadge: `${custom.sector} · Citizen Report`,
      shortBadgeHi: `${custom.sector} · नागरिक शिकायत`,
      title: custom.title,
      titleHi: custom.title,
      sector: custom.sector,
      sectorHi: custom.sector,
      city: 'Sonipat, NCR',
      category: custom.hasLiveElectricalHazard
        ? 'ELECTRICAL_FLOOD_COMBO'
        : 'HIGHWAY_STRUCTURAL_POTHOLE',
      lat: 28.9945,
      lng: 77.0182,
      contractorName: 'Apex InfraCorp Pvt Ltd',
      escrowValueINR: 165000,
      hasLiveElectricalHazard: custom.hasLiveElectricalHazard,
      hasWaterlogging: custom.hasWaterlogging,
      isHighTrafficCorridor: true,
      isMonsoonAlert: true,
    };
    handleIngestPresetScenario(customScenario);
  };

  const handleAdvanceDepartmentStep = (ticketId: string, stepOrder: number) => {
    const nowStr = new Date().toLocaleTimeString('en-IN', { hour12: false });
    setTickets((prev) => {
      const updated = prev.map((ticket) => {
        if (ticket.id !== ticketId) return ticket;
        const updatedTasks = ticket.tasks.map((task) => {
          if (task.stepOrder === stepOrder) {
            return { ...task, status: 'COMPLETED' as const, slaRemainingSeconds: 0 };
          }
          if (task.dependsOnStep === stepOrder && task.status === 'LOCKED_DEPENDENCY') {
            return { ...task, status: 'IN_PROGRESS' as const };
          }
          return task;
        });

        const allDone = updatedTasks.every((t) => t.status === 'COMPLETED');
        return {
          ...ticket,
          status: allDone ? ('PENDING_VISUAL_AUDIT' as const) : ticket.status,
          tasks: updatedTasks,
        };
      });
      void syncIncidentsWithSupabase(updated);
      return updated;
    });
    setLastSyncedAt(nowStr);

    appendAgentLogs([
      {
        id: `LOG-STEP-${Date.now()}`,
        timestamp: nowStr,
        agent: 'Dependency-Planner',
        severity: 'SUCCESS',
        actionTag: `STEP_${stepOrder}_DONE`,
        message: `Step ${stepOrder} on ${ticketId} done. Unlocked Step ${stepOrder + 1}.`,
        messageHi: `${ticketId} का चरण ${stepOrder} पूरा हुआ। अगला चरण ${stepOrder + 1} शुरू किया गया।`,
        latencyMs: 58,
        confidenceScore: 99.4,
        selfCorrectionAction: `Verified prerequisite safety sign-off for Step ${stepOrder}.`,
        selfCorrectionActionHi: `चरण ${stepOrder} की सुरक्षा जांच पूरी की।`,
      },
    ]);
  };

  const handleVisionAuditCompleted = (
    result: VisionAuditResult,
    caseTitle: string,
    submissionSource: 'CONTRACTOR_CLOSURE_REPORT' | 'CITIZEN_CONTRADICTING_EVIDENCE'
  ) => {
    const nowStr = new Date().toLocaleTimeString('en-IN', { hour12: false });

    if (result.verdict !== 'VERIFIED FIXED') {
      const penaltyOutcome = enforceFakeClosurePenalty(
        activeTicket,
        result.verdict,
        result.trustScorePenalty || 35
      );

      setTickets((prev) => {
        const updated = prev.map((t) =>
          t.id === activeTicket.id ? penaltyOutcome.updatedTicket : t
        );
        void syncIncidentsWithSupabase(updated);
        return updated;
      });
      setLastSyncedAt(nowStr);
      setFakeClosuresBlocked((prev) => prev + 1);
      setPublicFundsSavedINR((prev) => prev + penaltyOutcome.frozenAmountINR);
      setActiveChaosTitle(
        tr(
          lang,
          `Fake Closure Blocked (${activeTicket.id})`,
          `नकली बंद रिपोर्ट पकड़ी गई (${activeTicket.id})`
        )
      );

      appendAgentLogs([
        {
          id: `LOG-AUD-${Date.now()}-1`,
          timestamp: nowStr,
          agent: 'Forensic-Auditor',
          severity: 'CRITICAL',
          actionTag: result.verdict.replace(/\s+/g, '_'),
          message: `[${submissionSource === 'CONTRACTOR_CLOSURE_REPORT' ? 'Contractor' : 'Citizen'}] "${caseTitle}" → Match: ${result.visualMatchScore.toFixed(1)}%. ${result.forensicExplanation}`,
          messageHi: `फोटो जांच परिणाम: केवल ${result.visualMatchScore.toFixed(1)}% मिलान। ${result.forensicExplanationHi || result.forensicExplanation}`,
          latencyMs: result.inferenceLatencyMs,
          confidenceScore: 99.1,
          selfCorrectionAction: 'Rejected fraudulent closure & flagged contractor GPS mismatch.',
          selfCorrectionActionHi: 'नकली फोटो खारिज की और गलत GPS स्थान पकड़ा।',
        },
        {
          id: `LOG-AUD-${Date.now()}-2`,
          timestamp: nowStr,
          agent: 'SLA-Watchdog',
          severity: 'CRITICAL',
          actionTag: 'ESCROW_FROZEN',
          message: `CLOSURE REJECTED: Reopened ${activeTicket.id}, cut Trust Score (${penaltyOutcome.previousTrustScore}% → ${penaltyOutcome.newTrustScore}%), froze ₹${penaltyOutcome.frozenAmountINR.toLocaleString('en-IN')}!`,
          messageHi: `रिपोर्ट खारिज: केस ${activeTicket.id} दोबारा खोला गया, भरोसा स्कोर घटाया (${penaltyOutcome.previousTrustScore}% → ${penaltyOutcome.newTrustScore}%) और ₹${penaltyOutcome.frozenAmountINR.toLocaleString('en-IN')} भुगतान फ्रीज किया!`,
          latencyMs: 49,
          confidenceScore: 99.8,
          selfCorrectionAction: 'Auto-reopened Master Ticket & froze treasury escrow payout.',
          selfCorrectionActionHi: 'मास्टर टिकट दोबारा खोला और भुगतान फ्रीज किया।',
        },
      ]);
    } else {
      setTickets((prev) => {
        const updated = prev.map((t) =>
          t.id === activeTicket.id
            ? {
                ...t,
                status: 'VERIFIED_CLOSED' as const,
                escrowStatus: 'RELEASED' as const,
                tasks: t.tasks.map((task) => ({ ...task, status: 'COMPLETED' as const })),
              }
            : t
        );
        void syncIncidentsWithSupabase(updated);
        return updated;
      });
      setLastSyncedAt(nowStr);
      setComplaintsVerified((prev) => prev + 1);
      setActiveChaosTitle(null);

      appendAgentLogs([
        {
          id: `LOG-AUD-OK-${Date.now()}`,
          timestamp: nowStr,
          agent: 'Forensic-Auditor',
          severity: 'SUCCESS',
          actionTag: 'VERIFIED_FIXED',
          message: `Genuine repair verified on ${activeTicket.id} (${result.visualMatchScore.toFixed(1)}% match). Released ₹${activeTicket.escrowValueINR.toLocaleString('en-IN')}.`,
          messageHi: `${activeTicket.id} पर असली मरम्मत सत्यापित (${result.visualMatchScore.toFixed(1)}% मिलान)। ₹${activeTicket.escrowValueINR.toLocaleString('en-IN')} का भुगतान पास किया।`,
          latencyMs: result.inferenceLatencyMs,
          confidenceScore: 98.9,
          selfCorrectionAction: 'Verified Pole #TR-409 landmark & dry hot-mix asphalt seal.',
          selfCorrectionActionHi: 'पोल #TR-409 और पक्की डामर मरम्मत की पुष्टि की।',
        },
      ]);
    }
  };

  const handleChaosSLABreach = () => {
    const nowStr = new Date().toLocaleTimeString('en-IN', { hour12: false });
    const target = activeTicket;
    const { updatedTicket } = evaluateTicketSLABreaches(target, 2);

    setTickets((prev) => {
      const updated = prev.map((t) => (t.id === target.id ? updatedTicket : t));
      void syncIncidentsWithSupabase(updated);
      return updated;
    });
    setLastSyncedAt(nowStr);
    setActiveChaosTitle(
      tr(lang, `SLA Breach on ${target.id}`, `${target.id} पर SLA समय समाप्त`)
    );
    setAvgResolutionSla('02h 48m');

    appendAgentLogs([
      {
        id: `CHAOS-SLA-${Date.now()}-1`,
        timestamp: nowStr,
        agent: 'SLA-Watchdog',
        severity: 'CRITICAL',
        actionTag: 'SLA_BREACH',
        message: `Step 2 (Water Dept) missed SLA deadline (00:00:00) on ${target.id}.`,
        messageHi: `${target.id} पर चरण 2 (जल विभाग) की समय सीमा (00:00:00) समाप्त हो गई।`,
        latencyMs: 38,
        confidenceScore: 99.7,
        selfCorrectionAction: 'Replaced stalled hydro-rig with QRT-Alpha Backup Crew.',
        selfCorrectionActionHi: 'रुकी हुई टीम की जगह सेक्टर 15 से बैकअप QRT टीम भेजी।',
      },
      {
        id: `CHAOS-SLA-${Date.now()}-2`,
        timestamp: nowStr,
        agent: 'Dependency-Planner',
        severity: 'WARN',
        actionTag: 'QRT_DISPATCHED',
        message: `Sent QRT-Alpha Backup Crew from Sector 15 & alerted Zonal Commissioner.`,
        messageHi: `सेक्टर 15 से बैकअप QRT टीम भेजी गई और ज़ोनल कमिश्नर को अलर्ट किया गया।`,
        latencyMs: 79,
        confidenceScore: 98.5,
      },
    ]);
  };

  const handleChaosFakeClosure = () => {
    const nowStr = new Date().toLocaleTimeString('en-IN', { hour12: false });
    const target = activeTicket;
    const penalty = enforceFakeClosurePenalty(target, 'FAKE CLOSURE DETECTED', 35);

    setTickets((prev) => {
      const updated = prev.map((t) => (t.id === target.id ? penalty.updatedTicket : t));
      void syncIncidentsWithSupabase(updated);
      return updated;
    });
    setLastSyncedAt(nowStr);
    setFakeClosuresBlocked((prev) => prev + 1);
    setPublicFundsSavedINR((prev) => prev + penalty.frozenAmountINR);
    setActiveChaosTitle(
      tr(
        lang,
        `Contractor Fraud Blocked (${target.contractorName})`,
        `ठेकेदार की धोखाधड़ी पकड़ी गई (${target.contractorName})`
      )
    );

    appendAgentLogs([
      {
        id: `CHAOS-FAKE-${Date.now()}-1`,
        timestamp: nowStr,
        agent: 'Forensic-Auditor',
        severity: 'CRITICAL',
        actionTag: 'FAKE_PHOTO',
        message: `Fake photo caught on ${target.id} (14.2% match — wrong street, Pole #TR-409 missing).`,
        messageHi: `${target.id} पर नकली फोटो पकड़ी गई (केवल 14.2% मिलान — दूसरी गली की फोटो, पोल #TR-409 गायब)।`,
        latencyMs: 96,
        confidenceScore: 99.4,
        selfCorrectionAction: 'Blocked contractor payout & deducted 35 Trust Score points.',
        selfCorrectionActionHi: 'ठेकेदार का भुगतान रोका और भरोसा स्कोर 35 अंक घटाया।',
      },
      {
        id: `CHAOS-FAKE-${Date.now()}-2`,
        timestamp: nowStr,
        agent: 'SLA-Watchdog',
        severity: 'CRITICAL',
        actionTag: 'PAYMENT_FROZEN',
        message: `Reopened ${target.id}, cut Trust Score (${penalty.previousTrustScore}% → ${penalty.newTrustScore}%), froze ₹${penalty.frozenAmountINR.toLocaleString('en-IN')}!`,
        messageHi: `केस दोबारा खोला, भरोसा स्कोर घटाया (${penalty.previousTrustScore}% → ${penalty.newTrustScore}%) और ₹${penalty.frozenAmountINR.toLocaleString('en-IN')} फ्रीज किए!`,
        latencyMs: 44,
        confidenceScore: 99.9,
      },
    ]);
  };

  const handleChaosFlashFlood = () => {
    const nowStr = new Date().toLocaleTimeString('en-IN', { hour12: false });
    setTickets((prev) => {
      const updated = prev.map((t) => ({
        ...t,
        urgencyScore: 100,
        duplicateCount: t.duplicateCount + 12,
        status: 'SLA_BREACH_ESCALATED' as const,
        escalationLevel: 'ZONAL_COMMISSIONER_IAS' as const,
        tasks: t.tasks.map((task, idx) =>
          idx === 1
            ? {
                ...task,
                status: 'IN_PROGRESS' as const,
                actionTitle: 'Step 2: Emergency 50HP Flood Surge Pumping',
                actionTitleHi: 'चरण 2: आपातकालीन 50HP बाढ़ पंपिंग शुरू',
                assignedCrew: `${task.assignedCrew} + 3 Emergency Flood Rigs`,
              }
            : task
        ),
      }));
      void syncIncidentsWithSupabase(updated);
      return updated;
    });
    setLastSyncedAt(nowStr);
    setComplaintsVerified((prev) => prev + 36);
    setSdgImpactScore(96.4);
    setActiveChaosTitle(
      tr(lang, 'Flash-Flood Emergency Re-Plan', 'अचानक बाढ़ आपातकालीन री-प्लान')
    );

    appendAgentLogs([
      {
        id: `CHAOS-FLOOD-${Date.now()}-1`,
        timestamp: nowStr,
        agent: 'Triage-Agent',
        severity: 'CRITICAL',
        actionTag: 'FLOOD_SURGE',
        message: `Clustered 36 flash-flood complaints in 90s. Boosted Urgency to 99/100.`,
        messageHi: `90 सेकंड में 36 बाढ़ शिकायतों को जोड़ा। गंभीरता स्कोर 99/100 किया गया।`,
        latencyMs: 69,
        confidenceScore: 99.1,
        selfCorrectionAction: 'Pre-emptively isolated live UHBVN feeders in flooded sectors.',
        selfCorrectionActionHi: 'बाढ़ वाले सेक्टरों में तुरंत बिजली सप्लाई सुरक्षित रूप से बंद की।',
      },
      {
        id: `CHAOS-FLOOD-${Date.now()}-2`,
        timestamp: nowStr,
        agent: 'Dependency-Planner',
        severity: 'CRITICAL',
        actionTag: 'PUMPS_REROUTED',
        message: `Cut live power lines first & re-routed all 50HP water pumps to flooded sectors.`,
        messageHi: `सबसे पहले बिजली लाइनें काटीं और सभी 50HP पानी पंप बाढ़ वाले सेक्टरों में भेजे।`,
        latencyMs: 88,
        confidenceScore: 98.8,
      },
    ]);
  };

  const handleResetSimulation = () => {
    const fresh = createInitialState();
    setTickets(fresh.tickets);
    void syncIncidentsWithSupabase(fresh.tickets);
    setSelectedTicketId(fresh.tickets[0].id);
    setAgentLogs(fresh.logs);
    setActiveChaosTitle(null);
  };

  // Render full-screen Login & Signup screen when not authenticated
  if (!isAuthenticated) {
    return (
      <LoginScreen
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'en' ? 'hi' : 'en'))}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      {/* Top Header with Theme Toggle, Zoom Controls (+/-), Hindi/English Toggle, and Supabase Role Switcher */}
      <header className="bg-theme-header border-b-2 border-theme px-6 py-4 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Brand Title */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('COMMAND_CENTER');
            }}
            className="text-xl font-extrabold tracking-tight text-teal-600 dark:text-[#00F5D4] whitespace-nowrap shrink-0"
          >
            AETHER-CIVIC
          </a>

          {/* 5 Mode Switcher Tabs */}
          <nav className="flex items-center gap-2 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('COMMAND_CENTER')}
              className={`civic-btn px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap shrink-0 ${
                activeTab === 'COMMAND_CENTER'
                  ? 'bg-[#00F5D4] text-slate-950 shadow-sm'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              🛰️ {tr(lang, 'Live Command Center', 'लाइव कमांड सेंटर')}
            </button>
            <button
              onClick={() => setActiveTab('VISUAL_AUDITOR')}
              className={`civic-btn px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap shrink-0 ${
                activeTab === 'VISUAL_AUDITOR'
                  ? 'bg-[#00F5D4] text-slate-950 shadow-sm'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              📸 {tr(lang, 'AI Visual Lie-Detector', 'AI फोटो झूठ-पकड़ने वाला')}
            </button>
            <button
              onClick={() => setActiveTab('CHAOS_SIMULATOR')}
              className={`civic-btn px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap shrink-0 ${
                activeTab === 'CHAOS_SIMULATOR'
                  ? 'bg-[#FFB703] text-slate-950 shadow-sm'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              ⚡ {tr(lang, 'Judge Chaos Simulator', 'जज केओस सिम्युलेटर')}
            </button>
            <button
              onClick={() => setActiveTab('SLA_BOARD')}
              className={`civic-btn px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap shrink-0 ${
                activeTab === 'SLA_BOARD'
                  ? 'bg-[#00F5D4] text-slate-950 shadow-sm'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              🏢 {tr(lang, 'Multi-Dept SLA Board', 'विभागीय SLA बोर्ड')}
            </button>
            <button
              onClick={() => setActiveTab('REPO_DOCS')}
              className={`civic-btn px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap shrink-0 ${
                activeTab === 'REPO_DOCS'
                  ? 'bg-[#00F5D4] text-slate-950 shadow-sm'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              📂 {tr(lang, 'GitHub Repo & Docs', 'गिटहब कोड और डॉक्स')}
            </button>
          </nav>

          {/* Right Utility Controls: Supabase Auth Role + Hindi Toggle + Zoom (+/-) + Theme Toggle + Security + Logout */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* 0. Supabase Auth / Role Switcher Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              title={tr(lang, 'Switch Role or Login (Supabase Auth)', 'भूमिका बदलें या लॉगिन करें')}
              className="civic-btn px-3 py-2 text-xs font-bold civic-subcard text-teal-600 dark:text-[#00F5D4] flex items-center gap-1.5 whitespace-nowrap"
            >
              <UserCheck className="w-4 h-4" />
              <span>
                {lang === 'hi' ? user.badgeTitleHi : user.badgeTitle}
              </span>
            </button>

            {/* 1. Working Hindi / English Toggle */}
            <button
              onClick={() => setLang((prev) => (prev === 'en' ? 'hi' : 'en'))}
              title="Toggle Hindi / English Language"
              className="civic-btn px-3 py-2 text-xs font-bold civic-subcard text-theme-primary flex items-center gap-1.5 whitespace-nowrap"
            >
              <Languages className="w-4 h-4 text-teal-500" />
              <span>{lang === 'en' ? '🇮🇳 हिंदी / English' : '🇮🇳 English / हिंदी'}</span>
            </button>

            {/* 2. Accessibility Zoom Buttons (For Spectacles) */}
            <div
              className="flex items-center civic-subcard px-1.5 py-1 gap-1"
              title={tr(lang, 'Text Size Zoom (For Spectacles)', 'चश्मे के लिए अक्षर बड़ा/छोटा करें')}
            >
              <button
                onClick={() => setZoomPercent((z) => Math.max(85, z - 8))}
                aria-label="Zoom Out"
                className="civic-btn p-1.5 text-theme-secondary hover:text-theme-primary rounded-lg"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomPercent(100)}
                className="px-1.5 text-xs font-mono font-bold text-theme-primary tabular-nums"
              >
                {zoomPercent}%
              </button>
              <button
                onClick={() => setZoomPercent((z) => Math.min(130, z + 8))}
                aria-label="Zoom In"
                className="civic-btn p-1.5 text-theme-secondary hover:text-theme-primary rounded-lg"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* 3. Theme Toggle (Dark / Light Mode) */}
            <button
              onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              title={tr(lang, 'Switch Dark / Light Mode', 'डार्क / लाइट मोड बदलें')}
              className="civic-btn px-3 py-2 text-xs font-bold civic-subcard text-theme-primary flex items-center gap-1.5 whitespace-nowrap"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>{tr(lang, 'Light Mode', 'लाइट मोड')}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span>{tr(lang, 'Dark Mode', 'डार्क मोड')}</span>
                </>
              )}
            </button>

            {/* 4. System Health & Security Modal Button */}
            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="civic-btn px-3 py-2 text-xs font-bold bg-teal-500/20 border-2 border-teal-500/50 text-teal-700 dark:text-[#00F5D4] rounded-xl flex items-center gap-1.5 whitespace-nowrap"
            >
              <Shield className="w-4 h-4" />
              <span>🛡️ {tr(lang, 'Security', 'सुरक्षा')}</span>
            </button>

            {/* 5. Sign Out to Login/Signup Screen */}
            <button
              onClick={() => void logout()}
              title={tr(lang, 'Sign Out to Login Screen', 'लॉगआउट करें')}
              className="civic-btn px-3 py-2 text-xs font-bold civic-subcard text-rose-500 flex items-center gap-1.5 whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" />
              <span>{tr(lang, 'Sign Out', 'लॉगआउट')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* UN SDG 11 Executive Impact Strip + Quick Role Pills */}
      <section className="border-b border-theme bg-theme-header/60 px-6 py-4">
        <div className="max-w-[1600px] mx-auto space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="civic-subcard px-4 py-3">
              <div className="text-xs font-bold text-theme-secondary">
                {tr(lang, 'UN SDG 11 Impact Score', 'UN SDG 11 प्रभाव स्कोर')}
              </div>
              <div className="mt-1 text-2xl font-extrabold font-mono tabular-nums text-teal-600 dark:text-[#00F5D4]">
                {sdgImpactScore}
                <span className="text-xs font-normal text-theme-muted"> / 100</span>
              </div>
            </div>

            <div className="civic-subcard px-4 py-3">
              <div className="text-xs font-bold text-theme-secondary">
                {tr(lang, 'Complaints Verified', 'सत्यापित शिकायतें')}
              </div>
              <div className="mt-1 text-2xl font-extrabold font-mono tabular-nums text-theme-primary">
                {complaintsVerified.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="civic-subcard px-4 py-3">
              <div className="text-xs font-bold text-theme-secondary">
                {tr(lang, 'Fake Closures Blocked', 'रोकी गई नकली रिपोर्ट')}
              </div>
              <div className="mt-1 text-2xl font-extrabold font-mono tabular-nums text-rose-500">
                {fakeClosuresBlocked}
              </div>
            </div>

            <div className="civic-subcard px-4 py-3">
              <div className="text-xs font-bold text-theme-secondary">
                {tr(lang, 'Public Funds Saved', 'बचाया गया सरकारी धन')}
              </div>
              <div className="mt-1 text-2xl font-extrabold font-mono tabular-nums text-teal-600 dark:text-[#00F5D4]">
                ₹{publicFundsSavedINR.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="col-span-2 md:col-span-1 civic-subcard px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-theme-secondary">
                  {tr(lang, 'Avg Resolution SLA', 'औसत समाधान समय')}
                </div>
                <div className="mt-1 text-2xl font-extrabold font-mono tabular-nums text-amber-500">
                  {avgResolutionSla}
                </div>
              </div>
              {activeChaosTitle && (
                <button
                  onClick={handleResetSimulation}
                  title={tr(lang, 'Reset', 'रीसेट')}
                  className="civic-btn p-2 civic-subcard text-theme-secondary hover:text-theme-primary"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Role-Based Access Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-theme-secondary">
              <span className="font-bold text-theme-primary">
                {tr(lang, 'Active RBAC View:', 'सक्रिय भूमिका (RBAC):')}
              </span>
              {(['CITIZEN', 'FIELD_ENGINEER', 'ZONAL_COMMISSIONER'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                    user.role === r
                      ? 'bg-teal-500/20 text-teal-600 dark:text-[#00F5D4] border border-teal-500/50'
                      : 'text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  {r === 'CITIZEN'
                    ? tr(lang, 'Citizen', 'नागरिक')
                    : r === 'FIELD_ENGINEER'
                      ? tr(lang, 'Engineer', 'इंजीनियर')
                      : tr(lang, 'Commissioner', 'कमिश्नर')}
                </button>
              ))}
            </div>
            <span className="font-mono text-theme-muted">
              {user.email} · {user.department}
            </span>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 py-7 grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        <div className="lg:col-span-8 min-w-0">
          {activeTab === 'COMMAND_CENTER' && (
            <CommandCenterMap
              tickets={tickets}
              selectedTicketId={selectedTicketId}
              onSelectTicket={setSelectedTicketId}
              onIngestPresetScenario={handleIngestPresetScenario}
              onIngestCustomComplaint={handleIngestCustomComplaint}
              onAdvanceDepartmentStep={handleAdvanceDepartmentStep}
              onOpenVisualAuditForTicket={(id) => {
                setSelectedTicketId(id);
                setActiveTab('VISUAL_AUDITOR');
              }}
              onQuickChaosTrigger={(type) => {
                if (type === 'SLA_BREACH') handleChaosSLABreach();
                if (type === 'FAKE_CLOSURE') handleChaosFakeClosure();
                if (type === 'FLASH_FLOOD') handleChaosFlashFlood();
              }}
              onRefreshSupabaseIncidents={() => void loadSupabaseIncidents()}
              isFetchingSupabase={isFetchingSupabase}
              lastSyncedAt={lastSyncedAt}
              theme={theme}
              lang={lang}
              activeUserRole={user.role}
            />
          )}

          {activeTab === 'VISUAL_AUDITOR' && activeTicket && (
            <VisualAuditorLab
              activeTicket={activeTicket}
              onAuditCompleted={handleVisionAuditCompleted}
              lang={lang}
            />
          )}

          {activeTab === 'CHAOS_SIMULATOR' && (
            <ChaosSimulator
              tickets={tickets}
              onTriggerSLABreach={handleChaosSLABreach}
              onTriggerFakeClosure={handleChaosFakeClosure}
              onTriggerFlashFlood={handleChaosFlashFlood}
              onResetSimulation={handleResetSimulation}
              lastTriggeredChaos={activeChaosTitle}
              lang={lang}
            />
          )}

          {activeTab === 'SLA_BOARD' && (
            <SLABoard
              tickets={tickets}
              onAdvanceDepartmentStep={handleAdvanceDepartmentStep}
              onInspectTicketInAuditor={(id) => {
                setSelectedTicketId(id);
                setActiveTab('VISUAL_AUDITOR');
              }}
              lang={lang}
            />
          )}

          {activeTab === 'REPO_DOCS' && <RepoDocsExporter lang={lang} />}
        </div>

        {/* Persistent Right-Side Multi-Agent Reasoning Stream */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 lg:h-[calc(100vh-120px)]">
          <AgentReasoningTerminal
            logs={agentLogs}
            onClearLogs={() => setAgentLogs([])}
            activeChaosTitle={activeChaosTitle}
            lang={lang}
          />
        </div>
      </main>

      {/* Supabase Auth & Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
      />

      {/* System Health, RBAC & Rate-Limiting Modal */}
      <SystemSecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        telemetry={securityTelemetry}
        onSelectRole={(role) =>
          setSecurityTelemetry((prev) => ({ ...prev, activeRole: role }))
        }
        lang={lang}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AetherCivicShell />
    </AuthProvider>
  );
}
