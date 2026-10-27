import React, { useState } from 'react';
import {
  Building2,
  FileSpreadsheet,
  FileJson,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { DepartmentTask, MasterIncidentTicket } from '../services/deduplicationEngine';
import { exportAuditReportAsCSV, exportAuditReportAsJSON } from '../api/incidentApi';
import { AppLanguage, tr, translateTerm } from '../services/uiPreferences';

interface SLABoardProps {
  tickets: MasterIncidentTicket[];
  onAdvanceDepartmentStep: (ticketId: string, stepOrder: number) => void;
  onInspectTicketInAuditor: (ticketId: string) => void;
  lang: AppLanguage;
}

function formatSlaTimer(secs: number): string {
  const s = Math.max(0, secs);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`;
}

export const SLABoard: React.FC<SLABoardProps> = ({
  tickets,
  onAdvanceDepartmentStep,
  onInspectTicketInAuditor,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const flattenedRows: Array<{
    ticket: MasterIncidentTicket;
    task: DepartmentTask;
  }> = [];

  tickets.forEach((ticket) => {
    ticket.tasks.forEach((task) => {
      flattenedRows.push({ ticket, task });
    });
  });

  const filteredRows = flattenedRows.filter(({ ticket, task }) => {
    const matchesDept =
      selectedDept === 'ALL' || task.department === selectedDept;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ticket.id.toLowerCase().includes(q) ||
      ticket.sector.toLowerCase().includes(q) ||
      task.actionTitle.toLowerCase().includes(q) ||
      task.assignedEngineer.toLowerCase().includes(q) ||
      ticket.contractorName.toLowerCase().includes(q);
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-7">
      {/* Header & CSV/JSON Exporters */}
      <section className="civic-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-theme">
          <div>
            <h2 className="text-lg font-bold text-theme-primary flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-teal-600 dark:text-[#00F5D4]" />
              <span>
                {tr(
                  lang,
                  'Multi-Department SLA Board & Escrow Ledger',
                  'बहु-विभागीय SLA बोर्ड और भुगतान लेजर'
                )}
              </span>
            </h2>
            <p className="text-xs text-theme-secondary mt-1">
              {tr(
                lang,
                'Live countdowns across Power, Water, Roads & Sanitation.',
                'बिजली, पानी, सड़क और सफाई विभाग के लाइव SLA टाइमर।'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => exportAuditReportAsCSV(tickets)}
              className="civic-btn px-4 py-2 text-xs font-bold bg-[#00F5D4] text-slate-950 rounded-xl flex items-center gap-2 whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{tr(lang, '📥 Export Audit Report (CSV)', '📥 ऑडिट रिपोर्ट (CSV)')}</span>
            </button>
            <button
              onClick={() => exportAuditReportAsJSON(tickets)}
              className="civic-btn px-4 py-2 text-xs font-bold civic-subcard text-theme-primary flex items-center gap-2 whitespace-nowrap"
            >
              <FileJson className="w-4 h-4 text-teal-500" />
              <span>{tr(lang, '📥 Export JSON', '📥 JSON डाउनलोड')}</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-theme-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tr(
                lang,
                'Search Ticket, Sector, or Engineer...',
                'टिकट, सेक्टर या इंजीनियर खोजें...'
              )}
              className="w-full pl-10 pr-4 py-2 text-xs civic-subcard text-theme-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1.5 civic-subcard overflow-x-auto">
            {[
              'ALL',
              'Power Grid Dept (UHBVN)',
              'Water & Drainage Dept',
              'Roads & PWD',
              'Sanitation & Solid Waste',
            ].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`civic-btn px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap shrink-0 ${
                  selectedDept === dept
                    ? 'bg-teal-500/20 text-teal-600 dark:text-[#00F5D4]'
                    : 'text-theme-secondary'
                }`}
              >
                {dept === 'ALL' ? tr(lang, 'All Depts', 'सभी विभाग') : translateTerm(lang, dept)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Clean SLA Table */}
      <section className="civic-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-theme bg-theme-header text-theme-secondary font-mono">
                <th className="py-3.5 px-4">{tr(lang, 'Ticket & Sector', 'टिकट और सेक्टर')}</th>
                <th className="py-3.5 px-4">{tr(lang, 'Department & Step', 'विभाग और कार्य चरण')}</th>
                <th className="py-3.5 px-4">{tr(lang, 'Engineer', 'इंजीनियर')}</th>
                <th className="py-3.5 px-4">{tr(lang, 'Status', 'स्थिति')}</th>
                <th className="py-3.5 px-4 text-right">{tr(lang, 'SLA Timer', 'समय सीमा')}</th>
                <th className="py-3.5 px-4 text-right">{tr(lang, 'Escrow & Trust', 'भुगतान और भरोसा')}</th>
                <th className="py-3.5 px-4 text-right">{tr(lang, 'Action', 'कार्यवाही')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-500/15">
              {filteredRows.map(({ ticket, task }) => {
                const isCompleted = task.status === 'COMPLETED';
                const isBreached =
                  task.status === 'SLA_BREACHED' ||
                  task.status === 'REOPENED_AUDIT_FAILURE';
                const isLocked = task.status === 'LOCKED_DEPENDENCY';

                return (
                  <tr key={`${ticket.id}-${task.id}`} className="hover:bg-slate-500/5">
                    <td className="py-4 px-4 align-top">
                      <div className="font-mono font-bold text-teal-600 dark:text-[#00F5D4]">
                        {ticket.id}
                      </div>
                      <div className="text-theme-primary font-medium mt-0.5">
                        {lang === 'hi' ? ticket.sectorHi || ticket.sector : ticket.sector}
                      </div>
                    </td>

                    <td className="py-4 px-4 align-top">
                      <div className="font-bold text-theme-secondary">
                        {translateTerm(lang, task.department)}
                      </div>
                      <div className="text-sm font-bold text-theme-primary mt-0.5">
                        {lang === 'hi' ? task.actionTitleHi : task.actionTitle}
                      </div>
                    </td>

                    <td className="py-4 px-4 align-top text-theme-secondary font-medium">
                      <div>{task.assignedEngineer}</div>
                      <div className="text-theme-muted">{task.assignedCrew}</div>
                    </td>

                    <td className="py-4 px-4 align-top font-mono font-bold">
                      <div className="flex items-center gap-1.5">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                        ) : isBreached ? (
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                        ) : isLocked ? (
                          <Lock className="w-4 h-4 text-theme-muted shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                        <span
                          className={
                            isCompleted
                              ? 'text-teal-600 dark:text-[#00F5D4]'
                              : isBreached
                                ? 'text-rose-500'
                                : isLocked
                                  ? 'text-theme-muted'
                                  : 'text-amber-500'
                          }
                        >
                          {translateTerm(lang, task.status)}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 align-top text-right font-mono font-bold tabular-nums">
                      <span
                        className={
                          isCompleted
                            ? 'text-teal-600 dark:text-[#00F5D4]'
                            : isBreached
                              ? 'text-rose-500'
                              : 'text-theme-primary'
                        }
                      >
                        {isCompleted
                          ? tr(lang, 'DONE', 'पूरा हुआ')
                          : formatSlaTimer(task.slaRemainingSeconds)}
                      </span>
                    </td>

                    <td className="py-4 px-4 align-top text-right font-mono font-bold tabular-nums">
                      <div className="text-theme-primary">{ticket.contractorName}</div>
                      <div
                        className={
                          ticket.escrowStatus === 'FROZEN_FRAUD_DETECTED'
                            ? 'text-rose-500 mt-0.5'
                            : 'text-teal-600 dark:text-[#00F5D4] mt-0.5'
                        }
                      >
                        ₹{task.escrowAmountINR.toLocaleString('en-IN')} · {ticket.contractorTrustScore}%
                      </div>
                    </td>

                    <td className="py-4 px-4 align-top text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isCompleted && (
                          <button
                            onClick={() =>
                              onAdvanceDepartmentStep(ticket.id, task.stepOrder)
                            }
                            className="civic-btn px-3 py-1.5 text-xs font-bold civic-subcard text-theme-primary"
                          >
                            {tr(lang, 'Complete', 'पूरा करें')}
                          </button>
                        )}
                        <button
                          onClick={() => onInspectTicketInAuditor(ticket.id)}
                          className="civic-btn px-3 py-1.5 text-xs font-bold bg-teal-500/20 border border-teal-500/50 text-teal-700 dark:text-[#00F5D4] rounded-lg"
                        >
                          {tr(lang, 'Audit', 'फोटो जांच')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
