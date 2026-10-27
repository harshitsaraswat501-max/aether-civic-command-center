import {
  calculateUrgencyScore,
  DepartmentTask,
  generate12DuplicateCitizenReports,
  MasterIncidentTicket,
} from './deduplicationEngine';

export type AgentName =
  | 'Triage-Agent'
  | 'Dependency-Planner'
  | 'SLA-Watchdog'
  | 'Forensic-Auditor';

export interface AgentReasoningLog {
  id: string;
  timestamp: string;
  agent: AgentName;
  severity: 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS';
  actionTag: string;
  message: string;
  messageHi: string;
  latencyMs: number;
  confidenceScore?: number;
  selfCorrectionAction?: string;
  selfCorrectionActionHi?: string;
}

export interface PresetCivicScenario {
  id: string;
  label: string;
  labelHi: string;
  shortBadge: string;
  shortBadgeHi: string;
  title: string;
  titleHi: string;
  sector: string;
  sectorHi: string;
  city: string;
  category: MasterIncidentTicket['category'];
  lat: number;
  lng: number;
  contractorName: string;
  escrowValueINR: number;
  hasLiveElectricalHazard: boolean;
  hasWaterlogging: boolean;
  isHighTrafficCorridor: boolean;
  isMonsoonAlert: boolean;
}

export const SONIPAT_PRESET_SCENARIOS: PresetCivicScenario[] = [
  {
    id: 'PRESET-SEC14-TRANSFORMER',
    label: 'Sparking Transformer & Flooded Road (Sector 14)',
    labelHi: 'सेक्टर 14: जलभराव वाली सड़क के पास स्पार्किंग ट्रांसफॉर्मर',
    shortBadge: 'Sector 14 · Power + Flood',
    shortBadgeHi: 'सेक्टर 14 · बिजली + जलभराव',
    title: 'Sparking 11kV Transformer & Flooded Road Crater (Sector 14)',
    titleHi: 'सेक्टर 14 मुख्य मार्ग पर स्पार्किंग ट्रांसफॉर्मर और पानी भरा गड्ढा',
    sector: 'Sector 14 Market Road',
    sectorHi: 'सेक्टर 14 मार्केट रोड',
    city: 'Sonipat, NCR',
    category: 'ELECTRICAL_FLOOD_COMBO',
    lat: 28.9931,
    lng: 77.0151,
    contractorName: 'Apex InfraCorp Pvt Ltd',
    escrowValueINR: 185000,
    hasLiveElectricalHazard: true,
    hasWaterlogging: true,
    isHighTrafficCorridor: true,
    isMonsoonAlert: true,
  },
  {
    id: 'PRESET-NH44-POTHOLE',
    label: 'Massive Highway Pothole on NH-44 Flyover',
    labelHi: 'NH-44 मुरथल फ्लाईओवर पर विशाल जानलेवा गड्ढा',
    shortBadge: 'NH-44 · Highway Crater',
    shortBadgeHi: 'NH-44 · हाईवे गड्ढा',
    title: 'Deep Highway Pothole Cluster on NH-44 Murthal Flyover',
    titleHi: 'NH-44 मुरथल फ्लाईओवर पर गहरा सड़क गड्ढा',
    sector: 'NH-44 Murthal Flyover',
    sectorHi: 'NH-44 मुरथल फ्लाईओवर',
    city: 'Sonipat, NCR',
    category: 'HIGHWAY_STRUCTURAL_POTHOLE',
    lat: 29.0289,
    lng: 77.0715,
    contractorName: 'Haryana Bitumen Works LLP',
    escrowValueINR: 240000,
    hasLiveElectricalHazard: false,
    hasWaterlogging: true,
    isHighTrafficCorridor: true,
    isMonsoonAlert: true,
  },
  {
    id: 'PRESET-ATLAS-GARBAGE',
    label: 'Overflowing Garbage Dump & Blocked Drain (Atlas Rd)',
    labelHi: 'एटलस रोड: ओवरफ्लो कचरा डंप और जाम नाला',
    shortBadge: 'Atlas Rd · Waste + Drain',
    shortBadgeHi: 'एटलस रोड · कचरा + नाला जाम',
    title: 'Overflowing Garbage Dump Blocking Storm Drain on Atlas Road',
    titleHi: 'एटलस रोड पर कचरे के ढेर से मुख्य नाला जाम',
    sector: 'Atlas Road Crossing',
    sectorHi: 'एटलस रोड चौराहा',
    city: 'Sonipat, NCR',
    category: 'SANITATION_BIOHAZARD',
    lat: 28.9882,
    lng: 77.0094,
    contractorName: 'Swachh Enviro Services Ltd',
    escrowValueINR: 115000,
    hasLiveElectricalHazard: false,
    hasWaterlogging: true,
    isHighTrafficCorridor: false,
    isMonsoonAlert: false,
  },
];

/**
 * Builds the multi-department sequential DAG tasks with short, punchy bilingual descriptions.
 */
export function buildDepartmentDependencyDAG(
  category: MasterIncidentTicket['category'],
  contractorName: string,
  totalEscrowINR: number
): DepartmentTask[] {
  if (category === 'ELECTRICAL_FLOOD_COMBO') {
    return [
      {
        id: `TASK-1-PWR`,
        stepOrder: 1,
        department: 'Power Grid Dept (UHBVN)',
        actionTitle: 'Step 1: Cut Live Power Line',
        actionTitleHi: 'चरण 1: चालू बिजली लाइन काटें',
        technicalSpec: 'Turn off Pole #TR-409 breaker so water crew is safe.',
        technicalSpecHi: 'पोल #TR-409 की बिजली बंद करें ताकि पानी निकालने वाली टीम सुरक्षित रहे।',
        assignedCrew: 'UHBVN Safety Squad 04',
        assignedEngineer: 'JE Vikramjit Singh',
        status: 'COMPLETED',
        slaRemainingSeconds: 1920,
        slaTotalSeconds: 2700,
        dependsOnStep: null,
        escrowAmountINR: Math.round(totalEscrowINR * 0.25),
        contractorName,
      },
      {
        id: `TASK-2-DRN`,
        stepOrder: 2,
        department: 'Water & Drainage Dept',
        actionTitle: 'Step 2: Pump Floodwater Out',
        actionTitleHi: 'चरण 2: पंप से सड़क का पानी निकालें',
        technicalSpec: 'Drain all standing water using 50HP suction pump.',
        technicalSpecHi: '50HP पंप से गड्ढे का सारा पानी सुखाएं।',
        assignedCrew: 'Hydro-Pump Rig #09',
        assignedEngineer: 'JE Ritu Deshmukh',
        status: 'IN_PROGRESS',
        slaRemainingSeconds: 3140,
        slaTotalSeconds: 5400,
        dependsOnStep: 1,
        escrowAmountINR: Math.round(totalEscrowINR * 0.30),
        contractorName,
      },
      {
        id: `TASK-3-PWD`,
        stepOrder: 3,
        department: 'Roads & PWD',
        actionTitle: 'Step 3: Patch Road with Hot Asphalt',
        actionTitleHi: 'चरण 3: पक्की तारकोल (डामर) से गड्ढा भरें',
        technicalSpec: 'Fill dry pit with compacted hot-mix blacktop asphalt.',
        technicalSpecHi: 'सूखे गड्ढे को गर्म डामर और रोलर से समतल करें।',
        assignedCrew: 'PWD Paver Squad #02',
        assignedEngineer: 'AE Manish Chhikara',
        status: 'LOCKED_DEPENDENCY',
        slaRemainingSeconds: 7200,
        slaTotalSeconds: 7200,
        dependsOnStep: 2,
        escrowAmountINR: Math.round(totalEscrowINR * 0.45),
        contractorName,
      },
    ];
  }

  if (category === 'HIGHWAY_STRUCTURAL_POTHOLE') {
    return [
      {
        id: `TASK-1-DRN`,
        stepOrder: 1,
        department: 'Water & Drainage Dept',
        actionTitle: 'Step 1: Drain Trapped Rainwater',
        actionTitleHi: 'चरण 1: गड्ढे से बारिश का पानी निकालें',
        technicalSpec: 'Vacuum standing water from highway crater.',
        technicalSpecHi: 'हाईवे के गड्ढे से जमा पानी साफ करें।',
        assignedCrew: 'Jetting Tanker #03',
        assignedEngineer: 'JE Ritu Deshmukh',
        status: 'COMPLETED',
        slaRemainingSeconds: 2400,
        slaTotalSeconds: 3600,
        dependsOnStep: null,
        escrowAmountINR: Math.round(totalEscrowINR * 0.25),
        contractorName,
      },
      {
        id: `TASK-2-PWD`,
        stepOrder: 2,
        department: 'Roads & PWD',
        actionTitle: 'Step 2: Heavy Bitumen Road Repair',
        actionTitleHi: 'चरण 2: मजबूत बिटुमेन से सड़क रिपेयर',
        technicalSpec: 'Lay 60mm dense bitumen layer and roller compact.',
        technicalSpecHi: '60mm मोटी डामर परत बिछाकर रोलर चलाएं।',
        assignedCrew: 'NH-PWD Rapid Unit #01',
        assignedEngineer: 'AE Manish Chhikara',
        status: 'IN_PROGRESS',
        slaRemainingSeconds: 4820,
        slaTotalSeconds: 7200,
        dependsOnStep: 1,
        escrowAmountINR: Math.round(totalEscrowINR * 0.55),
        contractorName,
      },
      {
        id: `TASK-3-SAN`,
        stepOrder: 3,
        department: 'Sanitation & Solid Waste',
        actionTitle: 'Step 3: Clear Debris & Paint Lanes',
        actionTitleHi: 'चरण 3: मलबा हटाएं और सफेद पट्टी पेंट करें',
        technicalSpec: 'Sweep loose rubble and paint reflective lane lines.',
        technicalSpecHi: 'सड़क से मलबा साफ करें और लेन मार्किंग करें।',
        assignedCrew: 'Sweeper Unit #07',
        assignedEngineer: 'SI Harpal Mor',
        status: 'LOCKED_DEPENDENCY',
        slaRemainingSeconds: 3600,
        slaTotalSeconds: 3600,
        dependsOnStep: 2,
        escrowAmountINR: Math.round(totalEscrowINR * 0.20),
        contractorName,
      },
    ];
  }

  return [
    {
      id: `TASK-1-SAN`,
      stepOrder: 1,
      department: 'Sanitation & Solid Waste',
      actionTitle: 'Step 1: Lift 18 Tons of Garbage',
      actionTitleHi: 'चरण 1: 18 टन कचरा उठाएं',
      technicalSpec: 'Clear waste blocking the main storm drain.',
      technicalSpecHi: 'नाले को रोकने वाले कचरे के ढेर को हटाएं।',
      assignedCrew: 'MCS Fleet #05',
      assignedEngineer: 'SI Harpal Mor',
      status: 'IN_PROGRESS',
      slaRemainingSeconds: 2950,
      slaTotalSeconds: 5400,
      dependsOnStep: null,
      escrowAmountINR: Math.round(totalEscrowINR * 0.45),
      contractorName,
    },
    {
      id: `TASK-2-DRN`,
      stepOrder: 2,
      department: 'Water & Drainage Dept',
      actionTitle: 'Step 2: Unclog & Flush Storm Drain',
      actionTitleHi: 'चरण 2: सुपर-सकर मशीन से नाला साफ करें',
      technicalSpec: 'Flush 45m drain pipe after waste is removed.',
      technicalSpecHi: 'कचरा हटने के बाद 45 मीटर नाले की सफाई करें।',
      assignedCrew: 'Super-Sucker #02',
      assignedEngineer: 'JE Ritu Deshmukh',
      status: 'LOCKED_DEPENDENCY',
      slaRemainingSeconds: 5400,
      slaTotalSeconds: 5400,
      dependsOnStep: 1,
      escrowAmountINR: Math.round(totalEscrowINR * 0.35),
      contractorName,
    },
    {
      id: `TASK-3-PWD`,
      stepOrder: 3,
      department: 'Roads & PWD',
      actionTitle: 'Step 3: Cover Drain with Concrete Slabs',
      actionTitleHi: 'चरण 3: नाले पर सीमेंट के स्लैब लगाएं',
      technicalSpec: 'Place heavy RCC covers over open drain.',
      technicalSpecHi: 'खुले नाले को मजबूत सीमेंट स्लैब से ढकें।',
      assignedCrew: 'PWD Squad #06',
      assignedEngineer: 'AE Manish Chhikara',
      status: 'LOCKED_DEPENDENCY',
      slaRemainingSeconds: 7200,
      slaTotalSeconds: 7200,
      dependsOnStep: 2,
      escrowAmountINR: Math.round(totalEscrowINR * 0.20),
      contractorName,
    },
  ];
}

/**
 * Orchestrates ingestion of a new preset or custom scenario into a MasterIncidentTicket
 * and emits short, punchy bilingual 4-Agent logs with confidence scores and self-correction.
 */
export function orchestrateScenarioIngestion(
  scenario: PresetCivicScenario,
  existingTicketCount: number
): {
  masterTicket: MasterIncidentTicket;
  agentLogs: AgentReasoningLog[];
} {
  const nowStr = new Date().toLocaleTimeString('en-IN', { hour12: false });
  const mergedReports = generate12DuplicateCitizenReports(
    scenario.lat,
    scenario.lng,
    scenario.label,
    scenario.sector
  );

  const urgency = calculateUrgencyScore({
    hasLiveElectricalHazard: scenario.hasLiveElectricalHazard,
    hasWaterlogging: scenario.hasWaterlogging,
    duplicateReportCount: mergedReports.length,
    isHighTrafficCorridor: scenario.isHighTrafficCorridor,
    isMonsoonAlert: scenario.isMonsoonAlert,
  });

  const tasks = buildDepartmentDependencyDAG(
    scenario.category,
    scenario.contractorName,
    scenario.escrowValueINR
  );

  const ticketId = `MSTR-SNP-${1042 + existingTicketCount}`;

  const masterTicket: MasterIncidentTicket = {
    id: ticketId,
    title: scenario.title,
    titleHi: scenario.titleHi,
    sector: scenario.sector,
    sectorHi: scenario.sectorHi,
    city: scenario.city,
    category: scenario.category,
    lat: scenario.lat,
    lng: scenario.lng,
    urgencyScore: urgency.total,
    urgencyBreakdown: urgency.breakdown,
    duplicateCount: mergedReports.length,
    mergedReports,
    status: 'ACTIVE_ORCHESTRATION',
    createdAt: nowStr,
    escalationLevel: urgency.total >= 90 ? 'EXECUTIVE_ENGINEER' : 'WARD_JUNIOR_ENGINEER',
    contractorName: scenario.contractorName,
    contractorTrustScore: 82,
    escrowStatus: 'LOCKED_IN_ESCROW',
    escrowValueINR: scenario.escrowValueINR,
    tasks,
  };

  const agentLogs: AgentReasoningLog[] = [
    {
      id: `LOG-${Date.now()}-1`,
      timestamp: nowStr,
      agent: 'Triage-Agent',
      severity: 'INFO',
      actionTag: '200M_CLUSTER',
      message: `Merged 12 duplicate complaints within 200m in ${scenario.sector} into 1 Master Ticket (${ticketId}). Urgency: ${urgency.total}/100.`,
      messageHi: `${scenario.sectorHi} में 200 मीटर के भीतर मिली 12 शिकायतों को जोड़कर 1 मास्टर टिकट (${ticketId}) बनाया। गंभीरता स्कोर: ${urgency.total}/100।`,
      latencyMs: 64,
      confidenceScore: 99.2,
      selfCorrectionAction: 'Suppressed 11 redundant ticket dispatches via Haversine spatial lock.',
      selfCorrectionActionHi: '11 डुप्लीकेट टिकटों को रोककर एक मास्टर टिकट में जोड़ा।',
    },
    {
      id: `LOG-${Date.now()}-2`,
      timestamp: nowStr,
      agent: 'Dependency-Planner',
      severity: 'INFO',
      actionTag: 'DAG_LOCKED',
      message: `Set safe work order: Step 1 Power Cut → Step 2 Water Pump → Step 3 Road Patch.`,
      messageHi: `सुरक्षित कार्य क्रम तय किया: चरण 1 बिजली कटौती → चरण 2 पानी निकासी → चरण 3 सड़क मरम्मत।`,
      latencyMs: 82,
      confidenceScore: 98.7,
      selfCorrectionAction: 'Blocked premature PWD road crew dispatch until live 11kV line is isolated.',
      selfCorrectionActionHi: 'चालू बिजली कटने तक सड़क विभाग को काम शुरू करने से रोका।',
    },
    {
      id: `LOG-${Date.now()}-3`,
      timestamp: nowStr,
      agent: 'SLA-Watchdog',
      severity: 'SUCCESS',
      actionTag: 'SLA_STARTED',
      message: `Started SLA timers. Locked ₹${scenario.escrowValueINR.toLocaleString('en-IN')} escrow until AI photo audit passes.`,
      messageHi: `SLA टाइमर शुरू। AI फोटो जांच पास होने तक ₹${scenario.escrowValueINR.toLocaleString('en-IN')} का ठेकेदार भुगतान लॉक किया।`,
      latencyMs: 41,
      confidenceScore: 99.6,
      selfCorrectionAction: 'Armed auto-escalation trigger for Zonal Commissioner on SLA 00:00:00.',
      selfCorrectionActionHi: 'समय समाप्त होने पर कमिश्नर को ऑटो-अलर्ट सेट किया।',
    },
  ];

  return { masterTicket, agentLogs };
}
