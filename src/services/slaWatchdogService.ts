import { MasterIncidentTicket } from './deduplicationEngine';

export interface SLABreachAuditEntry {
  id: string;
  ticketId: string;
  department: string;
  breachTimestamp: string;
  previousEscalation: MasterIncidentTicket['escalationLevel'];
  newEscalation: MasterIncidentTicket['escalationLevel'];
  reallocatedCrew: string;
  penaltyAppliedINR: number;
  reason: string;
}

export interface ContractorPenaltyResult {
  updatedTicket: MasterIncidentTicket;
  trustScoreDelta: number;
  previousTrustScore: number;
  newTrustScore: number;
  frozenAmountINR: number;
  alertBannerText: string;
}

/**
 * Evaluates SLA timers across all active tickets and escalates any breached tasks.
 */
export function evaluateTicketSLABreaches(
  ticket: MasterIncidentTicket,
  forceBreachStepOrder?: number
): {
  updatedTicket: MasterIncidentTicket;
  breachEvents: SLABreachAuditEntry[];
} {
  const breachEvents: SLABreachAuditEntry[] = [];

  const updatedTasks = ticket.tasks.map((task) => {
    const shouldBreach =
      forceBreachStepOrder === task.stepOrder ||
      (task.status === 'IN_PROGRESS' && task.slaRemainingSeconds <= 0);

    if (shouldBreach) {
      breachEvents.push({
        id: `SLA-BR-${Date.now()}-${task.stepOrder}`,
        ticketId: ticket.id,
        department: task.department,
        breachTimestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
        previousEscalation: ticket.escalationLevel,
        newEscalation: 'ZONAL_COMMISSIONER_IAS',
        reallocatedCrew: `QRT-Alpha Reserve Unit (Dispatched from Sector 15 Hub)`,
        penaltyAppliedINR: 25000,
        reason: `Step ${task.stepOrder} (${task.actionTitle}) exceeded statutory SLA ceiling.`,
      });

      return {
        ...task,
        status: 'SLA_BREACHED' as const,
        slaRemainingSeconds: 0,
        assignedCrew: `${task.assignedCrew} + QRT-Alpha Override`,
      };
    }
    return task;
  });

  const hasBreach = breachEvents.length > 0;

  return {
    updatedTicket: {
      ...ticket,
      tasks: updatedTasks,
      status: hasBreach ? 'SLA_BREACH_ESCALATED' : ticket.status,
      escalationLevel: hasBreach ? 'ZONAL_COMMISSIONER_IAS' : ticket.escalationLevel,
    },
    breachEvents,
  };
}

/**
 * Enforces automatic contractor fraud penalty when the Visual Auditor Agent detects
 * a fake closure photo or contradicting citizen evidence.
 */
export function enforceFakeClosurePenalty(
  ticket: MasterIncidentTicket,
  verdict: 'FAKE CLOSURE DETECTED' | 'CONTRADICTORY EVIDENCE',
  trustPenaltyPoints = 35
): ContractorPenaltyResult {
  const previousTrustScore = ticket.contractorTrustScore;
  const newTrustScore = Math.max(5, previousTrustScore - trustPenaltyPoints);
  const frozenAmountINR = ticket.escrowValueINR;

  const updatedTasks = ticket.tasks.map((task, idx) => {
    if (idx === ticket.tasks.length - 1 || task.status === 'COMPLETED') {
      return {
        ...task,
        status: 'REOPENED_AUDIT_FAILURE' as const,
        slaRemainingSeconds: Math.min(task.slaRemainingSeconds, 1800),
      };
    }
    return task;
  });

  const updatedTicket: MasterIncidentTicket = {
    ...ticket,
    status: 'REOPENED_ESCALATED',
    escalationLevel: 'ZONAL_COMMISSIONER_IAS',
    contractorTrustScore: newTrustScore,
    escrowStatus: 'FROZEN_FRAUD_DETECTED',
    tasks: updatedTasks,
  };

  return {
    updatedTicket,
    trustScoreDelta: -trustPenaltyPoints,
    previousTrustScore,
    newTrustScore,
    frozenAmountINR,
    alertBannerText:
      'CLOSURE REJECTED — CASE REOPENED & ESCALATED TO ZONAL COMMISSIONER',
  };
}
