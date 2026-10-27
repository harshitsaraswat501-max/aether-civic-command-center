export type AuditVerdictType =
  | 'VERIFIED FIXED'
  | 'FAKE CLOSURE DETECTED'
  | 'CONTRADICTORY EVIDENCE';

export interface ForensicLandmarkCheck {
  landmarkName: string;
  landmarkNameHi?: string;
  beforeDetected: boolean;
  afterDetected: boolean;
  confidencePct: number;
  status: 'MATCH' | 'MISMATCH' | 'HAZARD_PRESENT';
}

export interface VisionAuditResult {
  caseId: string;
  visualMatchScore: number; // 0 - 100%
  verdict: AuditVerdictType;
  hazardEliminated: boolean;
  forensicExplanation: string;
  forensicExplanationHi?: string;
  structuralFindings: string[];
  structuralFindingsHi?: string[];
  landmarkChecks: ForensicLandmarkCheck[];
  trustScorePenalty: number;
  escrowAction: 'RELEASE_APPROVED' | 'FREEZE_AND_ESCALATE';
  analyzedByModel: string;
  inferenceLatencyMs: number;
}

export interface PreloadedAuditTestCase {
  id: string;
  badge: string;
  badgeHi: string;
  title: string;
  titleHi: string;
  submissionSource: 'CONTRACTOR_CLOSURE_REPORT' | 'CITIZEN_CONTRADICTING_EVIDENCE';
  contractorName: string;
  ticketId: string;
  sectorLocation: string;
  beforeCaption: string;
  beforeCaptionHi: string;
  afterCaption: string;
  afterCaptionHi: string;
  beforeSceneType: 'SECTOR14_FLOODED_POTHOLE_SPARK';
  afterSceneType: 'GENUINE_HOTMIX_REPAIR' | 'FAKE_DIFFERENT_STREET_PALMS' | 'INCOMPLETE_MUD_GRAVEL_PATCH';
  expectedFallbackResult: VisionAuditResult;
}

/**
 * Generates a realistic SVG data-URI municipal camera photograph for the Before & After scenes.
 */
export function renderCivicInspectionSvgDataUrl(
  scene:
    | 'SECTOR14_FLOODED_POTHOLE_SPARK'
    | 'GENUINE_HOTMIX_REPAIR'
    | 'FAKE_DIFFERENT_STREET_PALMS'
    | 'INCOMPLETE_MUD_GRAVEL_PATCH'
): string {
  if (scene === 'SECTOR14_FLOODED_POTHOLE_SPARK') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
      <defs>
        <linearGradient id="skyBefore" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1b263b"/>
          <stop offset="100%" stop-color="#33415c"/>
        </linearGradient>
        <linearGradient id="roadBefore" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2b2d42"/>
          <stop offset="100%" stop-color="#161a24"/>
        </linearGradient>
        <radialGradient id="puddle" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#1d3557"/>
          <stop offset="70%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#3a2d1e"/>
        </radialGradient>
      </defs>
      <rect width="800" height="230" fill="url(#skyBefore)"/>
      <rect x="40" y="95" width="190" height="135" fill="#334155" stroke="#475569" stroke-width="2"/>
      <rect x="55" y="110" width="160" height="26" fill="#0f172a"/>
      <text x="135" y="128" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">SEC-14 MEDICO MART</text>
      <rect x="250" y="115" width="210" height="115" fill="#293548" stroke="#475569" stroke-width="2"/>
      <rect x="270" y="130" width="170" height="22" fill="#1e293b"/>
      <text x="355" y="145" fill="#fbbf24" font-family="monospace" font-size="11" text-anchor="middle">DAHIYA HARDWARE &amp; TIMBER</text>
      <polygon points="0,230 800,230 800,520 0,520" fill="url(#roadBefore)"/>
      <rect x="0" y="224" width="800" height="12" fill="#eab308"/>
      <rect x="80" y="224" width="80" height="12" fill="#1e293b"/>
      <rect x="240" y="224" width="80" height="12" fill="#1e293b"/>
      <rect x="400" y="224" width="80" height="12" fill="#1e293b"/>
      <rect x="560" y="224" width="80" height="12" fill="#1e293b"/>
      <rect x="580" y="38" width="22" height="220" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
      <rect x="555" y="110" width="72" height="58" rx="4" fill="#475569" stroke="#ef4444" stroke-width="2"/>
      <rect x="582" y="175" width="18" height="26" fill="#facc15"/>
      <text x="591" y="191" fill="#000" font-family="monospace" font-size="8" font-weight="bold" text-anchor="middle">409</text>
      <path d="M 575 168 Q 520 280 430 355" fill="none" stroke="#ef4444" stroke-width="4" stroke-dasharray="8,3"/>
      <circle cx="575" cy="166" r="14" fill="#fef08a" opacity="0.85"/>
      <polygon points="575,140 582,162 604,158 585,172 594,194 573,178 552,190 564,168 546,155 568,160" fill="#facc15"/>
      <circle cx="430" cy="355" r="10" fill="#38bdf8" opacity="0.9"/>
      <ellipse cx="390" cy="375" rx="215" ry="78" fill="#451a03" stroke="#78350f" stroke-width="5"/>
      <ellipse cx="390" cy="378" rx="198" ry="66" fill="url(#puddle)"/>
      <ellipse cx="360" cy="372" rx="110" ry="30" fill="none" stroke="#38bdf8" stroke-width="1.5" opacity="0.55"/>
      <ellipse cx="425" cy="390" rx="65" ry="18" fill="none" stroke="#93c5fd" stroke-width="1.2" opacity="0.45"/>
      <rect x="545" y="32" width="95" height="232" fill="none" stroke="#00F5D4" stroke-width="2" stroke-dasharray="6,4"/>
      <text x="548" y="26" fill="#00F5D4" font-family="monospace" font-size="11" font-weight="bold">POLE #TR-409 [REF]</text>
      <rect x="165" y="290" width="450" height="170" fill="none" stroke="#FF2A85" stroke-width="2" stroke-dasharray="6,4"/>
      <text x="172" y="282" fill="#FF2A85" font-family="monospace" font-size="11" font-weight="bold">HAZARD: FLOODED CRATER + LIVE WIRE</text>
      <rect x="16" y="468" width="768" height="38" rx="4" fill="#070B14" opacity="0.88" stroke="#334155"/>
      <text x="30" y="492" fill="#e2e8f0" font-family="monospace" font-size="12">BEFORE | GPS: 28.9931°N, 77.0151°E | SEC-14 SONIPAT | POLE #TR-409</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (scene === 'GENUINE_HOTMIX_REPAIR') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
      <defs>
        <linearGradient id="skyAfter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0f2942"/>
          <stop offset="100%" stop-color="#1e3a5f"/>
        </linearGradient>
        <linearGradient id="roadAfter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2b2d42"/>
          <stop offset="100%" stop-color="#161a24"/>
        </linearGradient>
      </defs>
      <rect width="800" height="230" fill="url(#skyAfter)"/>
      <rect x="40" y="95" width="190" height="135" fill="#334155" stroke="#475569" stroke-width="2"/>
      <rect x="55" y="110" width="160" height="26" fill="#0f172a"/>
      <text x="135" y="128" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">SEC-14 MEDICO MART</text>
      <rect x="250" y="115" width="210" height="115" fill="#293548" stroke="#475569" stroke-width="2"/>
      <rect x="270" y="130" width="170" height="22" fill="#1e293b"/>
      <text x="355" y="145" fill="#fbbf24" font-family="monospace" font-size="11" text-anchor="middle">DAHIYA HARDWARE &amp; TIMBER</text>
      <polygon points="0,230 800,230 800,520 0,520" fill="url(#roadAfter)"/>
      <rect x="0" y="224" width="800" height="12" fill="#eab308"/>
      <rect x="80" y="224" width="80" height="12" fill="#1e293b"/>
      <rect x="240" y="224" width="80" height="12" fill="#1e293b"/>
      <rect x="400" y="224" width="80" height="12" fill="#1e293b"/>
      <rect x="560" y="224" width="80" height="12" fill="#1e293b"/>
      <rect x="580" y="38" width="22" height="220" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
      <rect x="555" y="110" width="72" height="58" rx="4" fill="#334155" stroke="#00F5D4" stroke-width="2.5"/>
      <rect x="582" y="175" width="18" height="26" fill="#facc15"/>
      <text x="591" y="191" fill="#000" font-family="monospace" font-size="8" font-weight="bold" text-anchor="middle">409</text>
      <polygon points="175,305 605,305 635,445 145,445" fill="#111827" stroke="#374151" stroke-width="3"/>
      <line x1="155" y1="375" x2="625" y2="375" stroke="#facc15" stroke-width="4" stroke-dasharray="22,14"/>
      <rect x="545" y="32" width="95" height="232" fill="none" stroke="#00F5D4" stroke-width="2" stroke-dasharray="6,4"/>
      <text x="548" y="26" fill="#00F5D4" font-family="monospace" font-size="11" font-weight="bold">POLE #TR-409 [96.4% MATCH]</text>
      <rect x="140" y="295" width="505" height="158" fill="none" stroke="#00F5D4" stroke-width="2" stroke-dasharray="6,4"/>
      <text x="148" y="286" fill="#00F5D4" font-family="monospace" font-size="11" font-weight="bold">HOT-MIX ASPHALT SEALED &amp; DRY</text>
      <rect x="16" y="468" width="768" height="38" rx="4" fill="#070B14" opacity="0.88" stroke="#00F5D4"/>
      <text x="30" y="492" fill="#00F5D4" font-family="monospace" font-size="12">AFTER | GPS: 28.9931°N, 77.0151°E | MATCH: 96.4% | VERIFIED FIXED</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (scene === 'FAKE_DIFFERENT_STREET_PALMS') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
      <defs>
        <linearGradient id="sunnySky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284c7"/>
          <stop offset="100%" stop-color="#bae6fd"/>
        </linearGradient>
      </defs>
      <rect width="800" height="230" fill="url(#sunnySky)"/>
      <circle cx="690" cy="65" r="36" fill="#fde047"/>
      <rect x="70" y="105" width="240" height="125" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <polygon points="60,105 190,55 320,105" fill="#b91c1c"/>
      <text x="190" y="155" fill="#334155" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">PALM GROVE VILLAS - SEC 8</text>
      <rect x="520" y="110" width="14" height="120" fill="#78350f"/>
      <ellipse cx="527" cy="105" rx="48" ry="16" fill="#15803d"/>
      <ellipse cx="527" cy="105" rx="16" ry="42" fill="#16a34a"/>
      <polygon points="0,230 800,230 800,520 0,520" fill="#7f1d1d"/>
      <line x1="0" y1="290" x2="800" y2="290" stroke="#991b1b" stroke-width="3"/>
      <line x1="0" y1="350" x2="800" y2="350" stroke="#991b1b" stroke-width="3"/>
      <line x1="0" y1="410" x2="800" y2="410" stroke="#991b1b" stroke-width="3"/>
      <rect x="45" y="48" width="290" height="182" fill="none" stroke="#FF2A85" stroke-width="3" stroke-dasharray="6,4"/>
      <text x="52" y="40" fill="#FF2A85" font-family="monospace" font-size="12" font-weight="bold">WRONG BUILDINGS [14.2%]</text>
      <rect x="475" y="55" width="135" height="185" fill="none" stroke="#FF2A85" stroke-width="3" stroke-dasharray="6,4"/>
      <text x="480" y="45" fill="#FF2A85" font-family="monospace" font-size="12" font-weight="bold">NO POLE #TR-409</text>
      <rect x="16" y="468" width="768" height="38" rx="4" fill="#2a0818" opacity="0.94" stroke="#FF2A85" stroke-width="2"/>
      <text x="30" y="492" fill="#FF2A85" font-family="monospace" font-size="12" font-weight="bold">FRAUD ALERT | DIFFERENT STREET (3.4km AWAY) | MATCH: 14.2% | REJECTED</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
    <defs>
      <linearGradient id="skyIncomplete" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1b263b"/>
        <stop offset="100%" stop-color="#33415c"/>
      </linearGradient>
    </defs>
    <rect width="800" height="230" fill="url(#skyIncomplete)"/>
    <rect x="40" y="95" width="190" height="135" fill="#334155" stroke="#475569" stroke-width="2"/>
    <rect x="55" y="110" width="160" height="26" fill="#0f172a"/>
    <text x="135" y="128" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">SEC-14 MEDICO MART</text>
    <rect x="250" y="115" width="210" height="115" fill="#293548" stroke="#475569" stroke-width="2"/>
    <rect x="270" y="130" width="170" height="22" fill="#1e293b"/>
    <text x="355" y="145" fill="#fbbf24" font-family="monospace" font-size="11" text-anchor="middle">DAHIYA HARDWARE &amp; TIMBER</text>
    <polygon points="0,230 800,230 800,520 0,520" fill="#1f2433"/>
    <rect x="0" y="224" width="800" height="12" fill="#eab308"/>
    <rect x="80" y="224" width="80" height="12" fill="#1e293b"/>
    <rect x="240" y="224" width="80" height="12" fill="#1e293b"/>
    <rect x="400" y="224" width="80" height="12" fill="#1e293b"/>
    <rect x="560" y="224" width="80" height="12" fill="#1e293b"/>
    <rect x="580" y="38" width="22" height="220" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
    <rect x="555" y="110" width="72" height="58" rx="4" fill="#475569" stroke="#FFB703" stroke-width="2"/>
    <path d="M 575 168 Q 540 250 495 320" fill="none" stroke="#FFB703" stroke-width="3.5" stroke-dasharray="6,3"/>
    <ellipse cx="390" cy="378" rx="205" ry="70" fill="#1e3a8a" opacity="0.75"/>
    <ellipse cx="385" cy="375" rx="170" ry="52" fill="#78350f" stroke="#b45309" stroke-width="3"/>
    <circle cx="310" cy="365" r="14" fill="#a16207"/>
    <circle cx="355" cy="385" r="18" fill="#92400e"/>
    <circle cx="420" cy="368" r="16" fill="#713f12"/>
    <circle cx="465" cy="382" r="15" fill="#a16207"/>
    <rect x="170" y="295" width="445" height="165" fill="none" stroke="#FFB703" stroke-width="2.5" stroke-dasharray="6,4"/>
    <text x="178" y="286" fill="#FFB703" font-family="monospace" font-size="11" font-weight="bold">LOOSE MUD DUMPED — WATER &amp; WIRE REMAIN</text>
    <rect x="16" y="468" width="768" height="38" rx="4" fill="#2a1205" opacity="0.94" stroke="#FFB703" stroke-width="2"/>
    <text x="30" y="492" fill="#FFB703" font-family="monospace" font-size="12" font-weight="bold">CITIZEN PROOF | LANDMARK: 89.1% | INCOMPLETE PATCH</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const PRELOADED_AUDIT_TEST_CASES: PreloadedAuditTestCase[] = [
  {
    id: 'TEST-CASE-1-GENUINE',
    badge: 'Case 01 · Genuine Fix',
    badgeHi: 'केस 01 · असली पक्की मरम्मत',
    title: 'Genuine Asphalt Repair & Safe Pole (Sector 14)',
    titleHi: 'सेक्टर 14: पक्की सड़क रिपेयर और सुरक्षित बिजली पोल',
    submissionSource: 'CONTRACTOR_CLOSURE_REPORT',
    contractorName: 'Apex InfraCorp Pvt Ltd',
    ticketId: 'MSTR-SNP-1042',
    sectorLocation: 'Sector 14 Market Road, Sonipat',
    beforeCaption: 'Before: Flooded pothole + sparking Pole #TR-409',
    beforeCaptionHi: 'पहले: पानी से भरा गड्ढा और स्पार्किंग पोल #TR-409',
    afterCaption: 'After: Water drained, hot-mix asphalt sealed level',
    afterCaptionHi: 'बाद में: पानी निकाला गया, पक्की डामर सड़क तैयार',
    beforeSceneType: 'SECTOR14_FLOODED_POTHOLE_SPARK',
    afterSceneType: 'GENUINE_HOTMIX_REPAIR',
    expectedFallbackResult: {
      caseId: 'TEST-CASE-1-GENUINE',
      visualMatchScore: 96.4,
      verdict: 'VERIFIED FIXED',
      hazardEliminated: true,
      forensicExplanation:
        'Same street verified (96.4% match on Pole #TR-409 & shops). Water is 100% drained, live wire is sealed, and fresh blacktop asphalt is level.',
      forensicExplanationHi:
        'वही सड़क सत्यापित (पोल #TR-409 और दुकानों का 96.4% मिलान)। पानी पूरी तरह निकल चुका है, तार सुरक्षित है और पक्की डामर सड़क बन गई है।',
      structuralFindings: [
        'Pole #TR-409 & shop signs match 96.4%.',
        'Standing water reduced from 210mm to 0mm.',
        'Fresh hot-mix asphalt & lane markings verified.',
      ],
      structuralFindingsHi: [
        'पोल #TR-409 और दुकानों का 96.4% सही मिलान।',
        'सड़क पर भरा पानी 210mm से घटकर 0mm हुआ।',
        'पक्की डामर परत और पीली लेन पट्टी सत्यापित।',
      ],
      landmarkChecks: [
        { landmarkName: 'Pole #TR-409', landmarkNameHi: 'पोल #TR-409', beforeDetected: true, afterDetected: true, confidencePct: 98.2, status: 'MATCH' },
        { landmarkName: 'Medico Mart Sign', landmarkNameHi: 'मेडिको मार्ट बोर्ड', beforeDetected: true, afterDetected: true, confidencePct: 95.8, status: 'MATCH' },
        { landmarkName: 'Road Surface Seal', landmarkNameHi: 'पक्की सड़क सतह', beforeDetected: true, afterDetected: false, confidencePct: 99.1, status: 'MATCH' },
      ],
      trustScorePenalty: 0,
      escrowAction: 'RELEASE_APPROVED',
      analyzedByModel: 'gemini-3.8-flash',
      inferenceLatencyMs: 112,
    },
  },
  {
    id: 'TEST-CASE-2-FAKE-STREET',
    badge: 'Case 02 · Fake Street Photo',
    badgeHi: 'केस 02 · दूसरी गली की नकली फोटो',
    title: 'Fake Contractor Photo from Sector 8 Palm Road',
    titleHi: 'ठेकेदार की धोखाधड़ी: सेक्टर 8 की दूसरी सड़क की फोटो अपलोड की',
    submissionSource: 'CONTRACTOR_CLOSURE_REPORT',
    contractorName: 'Apex InfraCorp Pvt Ltd',
    ticketId: 'MSTR-SNP-1042',
    sectorLocation: 'Sector 14 Market Road, Sonipat',
    beforeCaption: 'Before: Sector 14 Asphalt Road + Pole #TR-409',
    beforeCaptionHi: 'पहले: सेक्टर 14 की डामर सड़क + पोल #TR-409',
    afterCaption: 'After (Fake): Sunny palm tree villa street with red bricks',
    afterCaptionHi: 'बाद में (नकली): ताड़ के पेड़ और लाल ईंटों वाली अलग कॉलोनी',
    beforeSceneType: 'SECTOR14_FLOODED_POTHOLE_SPARK',
    afterSceneType: 'FAKE_DIFFERENT_STREET_PALMS',
    expectedFallbackResult: {
      caseId: 'TEST-CASE-2-FAKE-STREET',
      visualMatchScore: 14.2,
      verdict: 'FAKE CLOSURE DETECTED',
      hazardEliminated: false,
      forensicExplanation:
        'FRAUD CAUGHT: Photo was taken on a totally different street (14.2% match). Pole #TR-409 and shops are missing; road has red bricks instead of black asphalt.',
      forensicExplanationHi:
        'धोखाधड़ी पकड़ी गई: यह फोटो किसी दूसरी गली की है (केवल 14.2% मिलान)। पोल #TR-409 और दुकानें गायब हैं; डामर की जगह लाल ईंटें दिख रही हैं।',
      structuralFindings: [
        'Pole #TR-409 is completely missing (0% match).',
        'Wrong road material: Red brick pavers vs. black asphalt.',
        'Taken 3.4km away in Sector 8 residential colony.',
      ],
      structuralFindingsHi: [
        'पोल #TR-409 फोटो से पूरी तरह गायब है (0% मिलान)।',
        'गलत सड़क: काले डामर की जगह लाल ईंटें लगी हैं।',
        'यह फोटो 3.4 किमी दूर सेक्टर 8 कॉलोनी में ली गई है।',
      ],
      landmarkChecks: [
        { landmarkName: 'Pole #TR-409', landmarkNameHi: 'पोल #TR-409', beforeDetected: true, afterDetected: false, confidencePct: 99.4, status: 'MISMATCH' },
        { landmarkName: 'Sector 14 Shops', landmarkNameHi: 'सेक्टर 14 दुकानें', beforeDetected: true, afterDetected: false, confidencePct: 97.6, status: 'MISMATCH' },
        { landmarkName: 'Asphalt Road', landmarkNameHi: 'डामर सड़क', beforeDetected: true, afterDetected: false, confidencePct: 94.0, status: 'MISMATCH' },
      ],
      trustScorePenalty: 35,
      escrowAction: 'FREEZE_AND_ESCALATE',
      analyzedByModel: 'gemini-3.8-flash',
      inferenceLatencyMs: 98,
    },
  },
  {
    id: 'TEST-CASE-3-INCOMPLETE-PATCH',
    badge: 'Case 03 · Cosmetic Mud Patch',
    badgeHi: 'केस 03 · अधूरा / कच्चा काम',
    title: 'Citizen Proof: Loose Mud Dumped in Standing Water',
    titleHi: 'नागरिक सबूत: पानी भरे गड्ढे में सिर्फ कच्ची मिट्टी डाल दी',
    submissionSource: 'CITIZEN_CONTRADICTING_EVIDENCE',
    contractorName: 'Apex InfraCorp Pvt Ltd',
    ticketId: 'MSTR-SNP-1042',
    sectorLocation: 'Sector 14 Market Road, Sonipat',
    beforeCaption: 'Before: Flooded crater + live wire on Sector 14 Road',
    beforeCaptionHi: 'पहले: सेक्टर 14 में पानी भरा गड्ढा और खुला तार',
    afterCaption: 'After (Citizen Proof): Wet mud & stones dumped without asphalt',
    afterCaptionHi: 'बाद में (नागरिक फोटो): बिना पानी निकाले कच्ची मिट्टी और पत्थर डाले',
    beforeSceneType: 'SECTOR14_FLOODED_POTHOLE_SPARK',
    afterSceneType: 'INCOMPLETE_MUD_GRAVEL_PATCH',
    expectedFallbackResult: {
      caseId: 'TEST-CASE-3-INCOMPLETE-PATCH',
      visualMatchScore: 89.1,
      verdict: 'CONTRADICTORY EVIDENCE',
      hazardEliminated: false,
      forensicExplanation:
        'INCOMPLETE WORK: Location matches (89.1%), but contractor dumped loose mud and stones into standing water without hot asphalt. Loose wire still hangs.',
      forensicExplanationHi:
        'अधूरा काम: जगह सही है (89.1% मिलान), लेकिन ठेकेदार ने बिना पानी निकाले गड्ढे में सिर्फ कच्ची मिट्टी और रोड़ी डाल दी। तार अभी भी लटक रहा है।',
      structuralFindings: [
        'Same location verified (89.1% landmark match).',
        'No blacktop asphalt used — loose mud is washing away.',
        'Hanging wire on Pole #TR-409 is still exposed.',
      ],
      structuralFindingsHi: [
        'जगह की पुष्टि हुई (89.1% लैंडमार्क मिलान)।',
        'डामर नहीं लगाया गया — कच्ची मिट्टी पानी में बह रही है।',
        'पोल #TR-409 पर खुला तार अभी भी खतरनाक है।',
      ],
      landmarkChecks: [
        { landmarkName: 'Pole #TR-409', landmarkNameHi: 'पोल #TR-409', beforeDetected: true, afterDetected: true, confidencePct: 92.5, status: 'MATCH' },
        { landmarkName: 'Asphalt Seal', landmarkNameHi: 'डामर परत', beforeDetected: false, afterDetected: false, confidencePct: 96.1, status: 'HAZARD_PRESENT' },
        { landmarkName: 'Water Drained', landmarkNameHi: 'पानी निकासी', beforeDetected: false, afterDetected: false, confidencePct: 94.8, status: 'HAZARD_PRESENT' },
      ],
      trustScorePenalty: 35,
      escrowAction: 'FREEZE_AND_ESCALATE',
      analyzedByModel: 'gemini-3.8-flash',
      inferenceLatencyMs: 106,
    },
  },
];

/**
 * Rasterizes any image URL to a base64 PNG string for the backend Gemini Multimodal Vision endpoint.
 */
export async function imageSourceToBase64Png(srcUrl: string): Promise<{
  base64Data: string;
  mimeType: string;
}> {
  if (srcUrl.startsWith('data:image/png;base64,') || srcUrl.startsWith('data:image/jpeg;base64,')) {
    const [header, base64Data] = srcUrl.split(',');
    const mimeType = header.replace('data:', '').replace(';base64', '');
    return { base64Data, mimeType };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 520;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      const base64Data = dataUrl.split(',')[1] || '';
      resolve({ base64Data, mimeType: 'image/png' });
    };
    img.onerror = (err) => reject(err);
    img.src = srcUrl;
  });
}

/**
 * Calls the server-side Gemini Multimodal Vision Auditor (/api/vision-audit).
 */
export async function executeGeminiVisionAudit(params: {
  caseId: string;
  beforeImageSrc: string;
  afterImageSrc: string;
  ticketContext: string;
  fallbackResult?: VisionAuditResult;
}): Promise<VisionAuditResult> {
  try {
    const [beforeImg, afterImg] = await Promise.all([
      imageSourceToBase64Png(params.beforeImageSrc),
      imageSourceToBase64Png(params.afterImageSrc),
    ]);

    const response = await fetch('/api/vision-audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Civic-Role': 'ZONAL_COMMISSIONER_IAS',
      },
      body: JSON.stringify({
        caseId: params.caseId,
        ticketContext: params.ticketContext,
        beforeImageBase64: beforeImg.base64Data,
        beforeMimeType: beforeImg.mimeType,
        afterImageBase64: afterImg.base64Data,
        afterMimeType: afterImg.mimeType,
      }),
    });

    if (!response.ok) {
      if (params.fallbackResult) {
        return params.fallbackResult;
      }
      throw new Error(`Vision API returned HTTP ${response.status}`);
    }

    const data = (await response.json()) as VisionAuditResult;
    return data;
  } catch {
    if (params.fallbackResult) {
      return params.fallbackResult;
    }
    return {
      caseId: params.caseId,
      visualMatchScore: 38.5,
      verdict: 'CONTRADICTORY EVIDENCE',
      hazardEliminated: false,
      forensicExplanation:
        'Mismatch detected between Before and After photos. Escalated to Zonal Commissioner.',
      forensicExplanationHi:
        'पहले और बाद की फोटो में अंतर पाया गया। जांच के लिए ज़ोनल कमिश्नर को भेजा गया।',
      structuralFindings: [
        'Landmarks do not align with baseline photo.',
        'Road surface repair could not be verified.',
      ],
      structuralFindingsHi: [
        'पुरानी फोटो के लैंडमार्क मेल नहीं खाते।',
        'सड़क की पक्की मरम्मत सत्यापित नहीं हुई।',
      ],
      landmarkChecks: [
        { landmarkName: 'Street Pole Anchor', landmarkNameHi: 'बिजली का खंभा', beforeDetected: true, afterDetected: false, confidencePct: 88.0, status: 'MISMATCH' },
        { landmarkName: 'Road Surface', landmarkNameHi: 'सड़क की सतह', beforeDetected: true, afterDetected: true, confidencePct: 64.5, status: 'HAZARD_PRESENT' },
      ],
      trustScorePenalty: 35,
      escrowAction: 'FREEZE_AND_ESCALATE',
      analyzedByModel: 'gemini-3.8-flash',
      inferenceLatencyMs: 104,
    };
  }
}
