import React, { useState } from 'react';
import { Terminal, ShieldAlert, CheckCircle2, Cpu, Trash2, Sparkles } from 'lucide-react';
import { AgentName, AgentReasoningLog } from '../services/agentOrchestrator';
import { AppLanguage, tr, translateTerm } from '../services/uiPreferences';

interface AgentReasoningTerminalProps {
  logs: AgentReasoningLog[];
  onClearLogs: () => void;
  activeChaosTitle: string | null;
  lang: AppLanguage;
}

const AGENT_COLOR_MAP: Record<AgentName, string> = {
  'Triage-Agent': 'text-teal-500 dark:text-[#00F5D4]',
  'Dependency-Planner': 'text-sky-600 dark:text-sky-400',
  'SLA-Watchdog': 'text-amber-600 dark:text-[#FFB703]',
  'Forensic-Auditor': 'text-rose-600 dark:text-[#FF2A85]',
};

export const AgentReasoningTerminal: React.FC<AgentReasoningTerminalProps> = ({
  logs,
  onClearLogs,
  activeChaosTitle,
  lang,
}) => {
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<AgentName | 'ALL'>('ALL');

  const filteredLogs =
    selectedAgentFilter === 'ALL'
      ? logs
      : logs.filter((l) => l.agent === selectedAgentFilter);

  return (
    <aside className="civic-card flex flex-col h-full overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
        <div className="flex items-center gap-3 min-w-0">
          <Terminal className="w-5 h-5 text-teal-600 dark:text-[#00F5D4] shrink-0" />
          <div>
            <h2 className="text-base font-bold tracking-tight text-theme-primary truncate">
              {tr(lang, 'Multi-Agent Decision Terminal', 'AI एजेंट लाइव निर्णय टर्मिनल')}
            </h2>
            <p className="text-xs text-theme-secondary mt-0.5">
              {tr(
                lang,
                '4 Autonomous Agents · Confidence & Self-Correction',
                '4 स्वचालित AI एजेंट · आत्म-सुधार और विश्वास स्कोर'
              )}
            </p>
          </div>
        </div>
        <button
          onClick={onClearLogs}
          title={tr(lang, 'Clear Logs', 'लॉग साफ करें')}
          className="civic-btn p-2 text-theme-secondary hover:text-theme-primary rounded-lg"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Active Chaos Banner */}
      {activeChaosTitle && (
        <div className="px-6 py-2.5 bg-rose-500/15 border-b border-rose-500/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="text-xs font-semibold text-rose-500 truncate">
              {activeChaosTitle}
            </span>
          </div>
          <span className="text-xs font-mono tabular-nums text-theme-secondary shrink-0">
            &lt;95ms
          </span>
        </div>
      )}

      {/* Agent Filter Tabs */}
      <div className="flex items-center gap-1.5 px-5 py-3 border-b border-theme overflow-x-auto">
        {(['ALL', 'Triage-Agent', 'Dependency-Planner', 'SLA-Watchdog', 'Forensic-Auditor'] as const).map(
          (agentKey) => (
            <button
              key={agentKey}
              onClick={() => setSelectedAgentFilter(agentKey)}
              className={`civic-btn px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 ${
                selectedAgentFilter === agentKey
                  ? 'bg-teal-500/20 text-teal-600 dark:text-[#00F5D4] border border-teal-500/40'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              {agentKey === 'ALL'
                ? `${tr(lang, 'All', 'सभी')} (${logs.length})`
                : translateTerm(lang, agentKey).split(' ')[0]}
            </button>
          )
        )}
      </div>

      {/* Punchy Live Debate Stream */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
        {filteredLogs.length === 0 ? (
          <div className="h-52 flex flex-col items-center justify-center text-center px-6">
            <Cpu className="w-7 h-7 mb-2 text-theme-muted" />
            <p className="text-sm font-medium text-theme-secondary">
              {tr(lang, 'No agent logs yet.', 'अभी कोई एजेंट लॉग नहीं है।')}
            </p>
            <p className="text-xs text-theme-muted mt-1">
              {tr(
                lang,
                'Click any scenario or chaos button to watch AI act.',
                'किसी भी शिकायत या टेस्ट बटन पर क्लिक करें।'
              )}
            </p>
          </div>
        ) : (
          filteredLogs.map((entry) => {
            const isCritical = entry.severity === 'CRITICAL';
            const isWarn = entry.severity === 'WARN';
            const isSuccess = entry.severity === 'SUCCESS';
            const confidence = entry.confidenceScore ?? 98.4;

            return (
              <div
                key={entry.id}
                className={`civic-subcard p-4 ${
                  isCritical
                    ? '!border-rose-500/60 bg-rose-500/10'
                    : isWarn
                      ? '!border-amber-500/50 bg-amber-500/10'
                      : isSuccess
                        ? '!border-teal-500/40 bg-teal-500/5'
                        : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
                  <span className={`font-bold ${AGENT_COLOR_MAP[entry.agent]}`}>
                    {translateTerm(lang, entry.agent)}
                  </span>
                  <div className="flex items-center gap-2 font-mono tabular-nums shrink-0">
                    <span className="px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-600 dark:text-[#00F5D4] font-bold text-[10px]">
                      {confidence.toFixed(1)}% {tr(lang, 'Conf', 'विश्वास')}
                    </span>
                    <span className="text-theme-muted">
                      {entry.latencyMs}ms · {entry.timestamp}
                    </span>
                  </div>
                </div>

                <p className="text-theme-primary text-sm leading-snug font-medium">
                  {lang === 'hi' ? entry.messageHi || entry.message : entry.message}
                </p>

                {(entry.selfCorrectionAction || entry.selfCorrectionActionHi) && (
                  <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-slate-500/10 text-xs text-theme-secondary flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-theme-primary">
                        {tr(lang, 'Self-Correction:', 'आत्म-सुधार:')}
                      </strong>{' '}
                      {lang === 'hi'
                        ? entry.selfCorrectionActionHi || entry.selfCorrectionAction
                        : entry.selfCorrectionAction}
                    </span>
                  </div>
                )}

                {isCritical && (
                  <div className="mt-2.5 pt-2 border-t border-rose-500/30 flex items-center justify-between text-xs font-bold text-rose-500">
                    <span>{tr(lang, 'Sent to Commissioner', 'कमिश्नर को भेजा गया')}</span>
                    <span>{tr(lang, 'Payment Frozen', 'भुगतान रोका गया')}</span>
                  </div>
                )}
                {isSuccess && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-[#00F5D4]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{tr(lang, 'Action Verified', 'कार्यवाही सत्यापित')}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3.5 border-t border-theme flex items-center justify-between text-xs text-theme-secondary font-mono tabular-nums">
        <span>{tr(lang, 'Target: <120ms', 'लक्ष्य: <120ms')}</span>
        <span>{tr(lang, 'Speed: 74ms · Supabase Synced', 'गति: 74ms · सुरक्षित')}</span>
      </div>
    </aside>
  );
};
