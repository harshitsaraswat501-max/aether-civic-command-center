import { MasterIncidentTicket } from '../services/deduplicationEngine';

export interface SystemSecurityTelemetry {
  activeRole: 'CITIZEN_REPORTER' | 'JUNIOR_ENGINEER' | 'ZONAL_COMMISSIONER_IAS';
  rateLimitMaxPerMin: number;
  rateLimitRemaining: number;
  avgAgentLatencyMs: number;
  p99AgentLatencyMs: number;
  rbacEnforcementStatus: 'STRICT_ENFORCED';
  zeroClientSecretsVerified: boolean;
}

/**
 * Exports the current Multi-Department SLA & Forensic Audit Board as a downloadable CSV file.
 */
export function exportAuditReportAsCSV(tickets: MasterIncidentTicket[]): void {
  const headers = [
    'Ticket_ID',
    'Sector_Location',
    'Incident_Title',
    'Urgency_Score',
    'Duplicate_Reports_Merged',
    'Ticket_Status',
    'Escalation_Authority',
    'Contractor_Name',
    'Contractor_Trust_Score_Pct',
    'Escrow_Status',
    'Escrow_Value_INR',
    'DAG_Steps_Summary',
  ];

  const escapeCsv = (val: string | number) => {
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = tickets.map((t) => {
    const dagSummary = t.tasks
      .map((task) => `Step ${task.stepOrder} (${task.department}): ${task.status}`)
      .join(' | ');
    return [
      t.id,
      `${t.sector}, ${t.city}`,
      t.title,
      t.urgencyScore,
      t.duplicateCount,
      t.status,
      t.escalationLevel,
      t.contractorName,
      t.contractorTrustScore,
      t.escrowStatus,
      t.escrowValueINR,
      dagSummary,
    ]
      .map(escapeCsv)
      .join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `aether-civic-sla-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports the full Multi-Agent Audit Ledger as a downloadable JSON file.
 */
export function exportAuditReportAsJSON(tickets: MasterIncidentTicket[]): void {
  const payload = {
    exportedAt: new Date().toISOString(),
    platform: 'AETHER-CIVIC Autonomous Smart City Command Center',
    unSdgAlignment: 'UN SDG 11: Sustainable Cities and Communities',
    totalMasterTickets: tickets.length,
    totalDuplicatesConsolidated: tickets.reduce((acc, t) => acc + t.duplicateCount, 0),
    tickets,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `aether-civic-audit-ledger-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
