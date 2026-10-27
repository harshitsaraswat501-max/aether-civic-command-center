export interface CitizenSubReport {
  id: string;
  citizenName: string;
  phoneMasked: string;
  timestamp: string;
  lat: number;
  lng: number;
  distanceFromCentroidMeters: number;
  rawText: string;
  rawTextHi: string;
  channel: 'WhatsApp Civic Bot' | 'Sonipat Connect App' | '112 Helpline Relay' | 'Ward Portal';
}

export interface DepartmentTask {
  id: string;
  stepOrder: number;
  department: 'Power Grid Dept (UHBVN)' | 'Water & Drainage Dept' | 'Roads & PWD' | 'Sanitation & Solid Waste';
  actionTitle: string;
  actionTitleHi: string;
  technicalSpec: string;
  technicalSpecHi: string;
  assignedCrew: string;
  assignedEngineer: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED_DEPENDENCY' | 'SLA_BREACHED' | 'REOPENED_AUDIT_FAILURE';
  slaRemainingSeconds: number;
  slaTotalSeconds: number;
  dependsOnStep: number | null;
  escrowAmountINR: number;
  contractorName: string;
}

export interface MasterIncidentTicket {
  id: string;
  title: string;
  titleHi: string;
  sector: string;
  sectorHi: string;
  city: string;
  category: 'ELECTRICAL_FLOOD_COMBO' | 'HIGHWAY_STRUCTURAL_POTHOLE' | 'SANITATION_BIOHAZARD' | 'CUSTOM_CIVIC_HAZARD';
  lat: number;
  lng: number;
  urgencyScore: number;
  urgencyBreakdown: {
    lifeSafetyRisk: number;
    reportDensityScore: number;
    arterialTrafficImpact: number;
    weatherMultiplier: number;
  };
  duplicateCount: number;
  mergedReports: CitizenSubReport[];
  status: 'ACTIVE_ORCHESTRATION' | 'PENDING_VISUAL_AUDIT' | 'VERIFIED_CLOSED' | 'REOPENED_ESCALATED' | 'SLA_BREACH_ESCALATED';
  createdAt: string;
  escalationLevel: 'WARD_JUNIOR_ENGINEER' | 'EXECUTIVE_ENGINEER' | 'ZONAL_COMMISSIONER_IAS';
  contractorName: string;
  contractorTrustScore: number;
  escrowStatus: 'LOCKED_IN_ESCROW' | 'RELEASED' | 'FROZEN_FRAUD_DETECTED';
  escrowValueINR: number;
  tasks: DepartmentTask[];
}

/**
 * Calculates great-circle distance between two coordinates in meters using the Haversine formula.
 */
export function calculateDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Computes lexical/hazard token overlap between two civic complaint descriptions (0 to 1).
 */
export function computeHazardSimilarity(textA: string, textB: string): number {
  const normalize = (t: string) =>
    t
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const tokensA = new Set(normalize(textA));
  const tokensB = new Set(normalize(textB));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) intersection += 1;
  });

  return intersection / Math.min(tokensA.size, tokensB.size);
}

/**
 * Calculates deterministic Urgency Score (0-100) based on hazard severity, cluster density,
 * traffic corridor impact, and weather conditions.
 */
export function calculateUrgencyScore(params: {
  hasLiveElectricalHazard: boolean;
  hasWaterlogging: boolean;
  duplicateReportCount: number;
  isHighTrafficCorridor: boolean;
  isMonsoonAlert: boolean;
}): {
  total: number;
  breakdown: MasterIncidentTicket['urgencyBreakdown'];
} {
  const lifeSafetyRisk = params.hasLiveElectricalHazard
    ? 42
    : params.hasWaterlogging
      ? 28
      : 22;
  const reportDensityScore = Math.min(25, Math.round(params.duplicateReportCount * 2.1));
  const arterialTrafficImpact = params.isHighTrafficCorridor ? 18 : 10;
  const weatherMultiplier = params.isMonsoonAlert ? 13 : 6;

  const total = Math.min(
    100,
    lifeSafetyRisk + reportDensityScore + arterialTrafficImpact + weatherMultiplier
  );

  return {
    total,
    breakdown: {
      lifeSafetyRisk,
      reportDensityScore,
      arterialTrafficImpact,
      weatherMultiplier,
    },
  };
}

/**
 * Clusters incoming citizen reports within a 200m spatial radius into a single Master Incident Ticket.
 */
export function clusterCitizenReportsWithin200m(
  anchorLat: number,
  anchorLng: number,
  incomingReports: Array<{
    id: string;
    citizenName: string;
    phoneMasked: string;
    timestamp: string;
    lat: number;
    lng: number;
    rawText: string;
    rawTextHi?: string;
    channel: CitizenSubReport['channel'];
  }>,
  maxRadiusMeters = 200
): {
  clustered: CitizenSubReport[];
  rejectedOutOfBounds: number;
  maxDistanceMeters: number;
} {
  const clustered: CitizenSubReport[] = [];
  let rejectedOutOfBounds = 0;
  let maxDistanceMeters = 0;

  for (const report of incomingReports) {
    const dist = calculateDistanceMeters(anchorLat, anchorLng, report.lat, report.lng);
    if (dist <= maxRadiusMeters) {
      if (dist > maxDistanceMeters) maxDistanceMeters = dist;
      clustered.push({
        ...report,
        rawTextHi: report.rawTextHi || report.rawText,
        distanceFromCentroidMeters: dist,
      });
    } else {
      rejectedOutOfBounds += 1;
    }
  }

  return {
    clustered,
    rejectedOutOfBounds,
    maxDistanceMeters,
  };
}

/**
 * Generates 12 realistic geo-clustered duplicate citizen reports within a 200m radius of the incident centroid.
 */
export function generate12DuplicateCitizenReports(
  baseLat: number,
  baseLng: number,
  scenarioTitle: string,
  sectorName: string
): CitizenSubReport[] {
  const reporters = [
    { name: 'Rakesh Dahiya', phone: '+91 98120-•••41', channel: 'WhatsApp Civic Bot' as const, offsetLat: 0.00012, offsetLng: -0.00015, note: `Sparks & water near Market Gate 2 (${sectorName}).`, noteHi: `मार्केट गेट 2 (${sectorName}) के पास चिंगारी और जलभराव।` },
    { name: 'Meenakshi Hooda', phone: '+91 94162-•••89', channel: 'Sonipat Connect App' as const, offsetLat: -0.00024, offsetLng: 0.00018, note: `School buses stuck due to flooded road in ${sectorName}.`, noteHi: `${sectorName} में सड़क पर पानी भरने से स्कूल बसें फंसीं।` },
    { name: 'Dr. Arvind Malik', phone: '+91 99911-•••04', channel: '112 Helpline Relay' as const, offsetLat: 0.00031, offsetLng: 0.00022, note: `High danger at ${sectorName} crossing — cut power fast.`, noteHi: `${sectorName} चौराहे पर बड़ा खतरा — तुरंत बिजली काटें।` },
    { name: 'Sandeep Khatri', phone: '+91 98963-•••72', channel: 'Ward Portal' as const, offsetLat: -0.00045, offsetLng: -0.00031, note: `Same pothole & wire hazard near Mother Dairy (${sectorName}).`, noteHi: `मदर डेयरी (${sectorName}) के पास गहरा गड्ढा और खुला तार।` },
    { name: 'Pooja Chhikara', phone: '+91 97281-•••19', channel: 'WhatsApp Civic Bot' as const, offsetLat: 0.00052, offsetLng: -0.00041, note: `Two-wheelers slipping in waterlogged pit at ${sectorName}.`, noteHi: `${sectorName} में पानी भरे गड्ढे में दोपहिया वाहन फिसल रहे हैं।` },
    { name: 'Vikas Antil', phone: '+91 90504-•••63', channel: 'Sonipat Connect App' as const, offsetLat: -0.00068, offsetLng: 0.00049, note: `Hazard getting worse in ${sectorName}, send repair team.`, noteHi: `${sectorName} में खतरा बढ़ रहा है, तुरंत टीम भेजें।` },
    { name: 'Anjali Sharma', phone: '+91 89012-•••55', channel: 'WhatsApp Civic Bot' as const, offsetLat: 0.00079, offsetLng: 0.00055, note: `Main lane blocked in ${sectorName}: ${scenarioTitle}.`, noteHi: `${sectorName} में मुख्य सड़क बंद है।` },
    { name: 'Col. R.S. Deswal', phone: '+91 98134-•••10', channel: '112 Helpline Relay' as const, offsetLat: -0.00088, offsetLng: -0.00064, note: `Urgent multi-department action needed at ${sectorName}.`, noteHi: `${sectorName} में सभी विभागों की तुरंत जरूरत है।` },
    { name: 'Nitin Garg', phone: '+91 93155-•••28', channel: 'Ward Portal' as const, offsetLat: 0.00095, offsetLng: -0.00072, note: `Shops closed in ${sectorName} due to sparking pole.`, noteHi: `खंभे में चिंगारी के कारण ${sectorName} की दुकानें बंद।` },
    { name: 'Sunita Rathee', phone: '+91 94661-•••83', channel: 'Sonipat Connect App' as const, offsetLat: -0.00105, offsetLng: 0.00081, note: `Deep road crater filled with water at ${sectorName}.`, noteHi: `${sectorName} मोड़ पर पानी से भरा गहरा गड्ढा।` },
    { name: 'Karanvir Ruhil', phone: '+91 70152-•••91', channel: 'WhatsApp Civic Bot' as const, offsetLat: 0.00118, offsetLng: 0.00068, note: `Pedestrians at risk near Pole #TR-409 (${sectorName}).`, noteHi: `पोल #TR-409 (${sectorName}) के पास पैदल यात्रियों को खतरा।` },
    { name: 'Deepak Kundu', phone: '+91 82951-•••37', channel: 'Sonipat Connect App' as const, offsetLat: -0.00124, offsetLng: -0.00079, note: `12th RWA report from ${sectorName} — fix immediately!`, noteHi: `${sectorName} से 12वीं शिकायत — तुरंत समाधान करें!` },
  ];

  return reporters.map((r, idx) => {
    const lat = Number((baseLat + r.offsetLat).toFixed(6));
    const lng = Number((baseLng + r.offsetLng).toFixed(6));
    const dist = calculateDistanceMeters(baseLat, baseLng, lat, lng);
    return {
      id: `CIT-REP-${8401 + idx}`,
      citizenName: r.name,
      phoneMasked: r.phone,
      timestamp: `${idx + 1}m ago`,
      lat,
      lng,
      distanceFromCentroidMeters: Math.min(194, Math.max(14, dist)),
      rawText: r.note,
      rawTextHi: r.noteHi,
      channel: r.channel,
    };
  });
}
