export type AppLanguage = 'en' | 'hi';
export type AppTheme = 'dark' | 'light';

/**
 * Helper to pick English or Hindi string cleanly.
 */
export function tr(lang: AppLanguage, en: string, hi: string): string {
  return lang === 'hi' ? hi : en;
}

/**
 * Translates common technical statuses, verdicts, and departments into natural Hindi.
 */
export function translateTerm(lang: AppLanguage, term: string): string {
  if (lang === 'en') return term;

  const dictionary: Record<string, string> = {
    'VERIFIED FIXED': 'सही मरम्मत सत्यापित (VERIFIED)',
    'FAKE CLOSURE DETECTED': 'नकली बंद रिपोर्ट पकड़ी गई (FAKE)',
    'CONTRADICTORY EVIDENCE': 'अधूरा काम / गलत सबूत (INCOMPLETE)',
    'Power Grid Dept (UHBVN)': 'बिजली विभाग (UHBVN)',
    'Water & Drainage Dept': 'जल और निकासी विभाग',
    'Roads & PWD': 'सड़क और लोक निर्माण (PWD)',
    'Sanitation & Solid Waste': 'सफाई और कचरा विभाग',
    'COMPLETED': 'पूरा हुआ',
    'IN_PROGRESS': 'काम जारी है',
    'LOCKED_DEPENDENCY': 'पिछले चरण की प्रतीक्षा',
    'SLA_BREACHED': 'समय सीमा समाप्त (SLA Breach)',
    'REOPENED_AUDIT_FAILURE': 'केस फिर से खोला गया',
    'ACTIVE_ORCHESTRATION': 'सक्रिय कार्यवाही जारी',
    'PENDING_VISUAL_AUDIT': 'फोटो जांच बाकी',
    'VERIFIED_CLOSED': 'सत्यापित और बंद',
    'REOPENED_ESCALATED': 'दोबारा खोला और उच्च अधिकारी को भेजा',
    'SLA_BREACH_ESCALATED': 'देरी के कारण कमिश्नर को भेजा',
    'WARD_JUNIOR_ENGINEER': 'वार्ड जूनियर इंजीनियर (JE)',
    'EXECUTIVE_ENGINEER': 'एग्जीक्यूटिव इंजीनियर (XEN)',
    'ZONAL_COMMISSIONER_IAS': 'ज़ोनल कमिश्नर (IAS)',
    'LOCKED_IN_ESCROW': 'एस्क्रो में सुरक्षित',
    'RELEASED': 'भुगतान जारी',
    'FROZEN_FRAUD_DETECTED': 'भुगतान रोका गया (धोखाधड़ी)',
    'Triage-Agent': 'ट्रायज-एजेंट (छंटनी)',
    'Dependency-Planner': 'डिपेंडेंसी-प्लानर (क्रम)',
    'SLA-Watchdog': 'SLA-वॉचडॉग (निगरानी)',
    'Forensic-Auditor': 'फोरेंसिक-ऑडिटर (फोटो जांच)',
  };

  return dictionary[term] || term;
}
