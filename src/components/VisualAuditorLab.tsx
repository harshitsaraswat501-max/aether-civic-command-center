import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Upload,
  ScanEye,
  Lock,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import {
  executeGeminiVisionAudit,
  PRELOADED_AUDIT_TEST_CASES,
  PreloadedAuditTestCase,
  renderCivicInspectionSvgDataUrl,
  VisionAuditResult,
} from '../api/geminiVisionAudit';
import { MasterIncidentTicket } from '../services/deduplicationEngine';
import { AppLanguage, tr, translateTerm } from '../services/uiPreferences';

interface VisualAuditorLabProps {
  activeTicket: MasterIncidentTicket;
  onAuditCompleted: (
    result: VisionAuditResult,
    caseTitle: string,
    submissionSource: 'CONTRACTOR_CLOSURE_REPORT' | 'CITIZEN_CONTRADICTING_EVIDENCE'
  ) => void;
  lang: AppLanguage;
}

export const VisualAuditorLab: React.FC<VisualAuditorLabProps> = ({
  activeTicket,
  onAuditCompleted,
  lang,
}) => {
  const [selectedTestCase, setSelectedTestCase] = useState<PreloadedAuditTestCase>(
    PRELOADED_AUDIT_TEST_CASES[1]
  );
  const [customBeforeUrl, setCustomBeforeUrl] = useState<string | null>(null);
  const [customAfterUrl, setCustomAfterUrl] = useState<string | null>(null);
  const [submissionRole, setSubmissionRole] = useState<
    'CONTRACTOR_CLOSURE_REPORT' | 'CITIZEN_CONTRADICTING_EVIDENCE'
  >('CONTRACTOR_CLOSURE_REPORT');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<VisionAuditResult>(
    PRELOADED_AUDIT_TEST_CASES[1].expectedFallbackResult
  );

  const beforeImgSrc =
    customBeforeUrl ||
    renderCivicInspectionSvgDataUrl(selectedTestCase.beforeSceneType);
  const afterImgSrc =
    customAfterUrl ||
    renderCivicInspectionSvgDataUrl(selectedTestCase.afterSceneType);

  const handleSelectPresetCase = async (testCase: PreloadedAuditTestCase) => {
    setSelectedTestCase(testCase);
    setCustomBeforeUrl(null);
    setCustomAfterUrl(null);
    setSubmissionRole(testCase.submissionSource);
    setIsAuditing(true);

    const bSrc = renderCivicInspectionSvgDataUrl(testCase.beforeSceneType);
    const aSrc = renderCivicInspectionSvgDataUrl(testCase.afterSceneType);

    const result = await executeGeminiVisionAudit({
      caseId: testCase.id,
      beforeImageSrc: bSrc,
      afterImageSrc: aSrc,
      ticketContext: `${testCase.title} at ${testCase.sectorLocation}`,
      fallbackResult: testCase.expectedFallbackResult,
    });

    setIsAuditing(false);
    setAuditResult(result);
    onAuditCompleted(result, testCase.title, testCase.submissionSource);
  };

  const handleFileUpload = (
    side: 'BEFORE' | 'AFTER',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (side === 'BEFORE') setCustomBeforeUrl(reader.result);
        else setCustomAfterUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunLiveGeminiAudit = async () => {
    setIsAuditing(true);
    const isUsingCustom = Boolean(customBeforeUrl || customAfterUrl);
    const result = await executeGeminiVisionAudit({
      caseId: isUsingCustom ? `CUSTOM-UPLOAD-${Date.now()}` : selectedTestCase.id,
      beforeImageSrc: beforeImgSrc,
      afterImageSrc: afterImgSrc,
      ticketContext: `${activeTicket.title} (${activeTicket.sector}, ${activeTicket.city})`,
      fallbackResult: isUsingCustom ? undefined : selectedTestCase.expectedFallbackResult,
    });
    setIsAuditing(false);
    setAuditResult(result);
    onAuditCompleted(
      result,
      isUsingCustom ? 'Custom Judge Upload' : selectedTestCase.title,
      submissionRole
    );
  };

  const isRejected = auditResult.verdict !== 'VERIFIED FIXED';
  const findingsList =
    lang === 'hi' && auditResult.structuralFindingsHi
      ? auditResult.structuralFindingsHi
      : auditResult.structuralFindings;

  return (
    <div className="space-y-7">
      {/* High-Impact Alert Banner */}
      {isRejected ? (
        <div
          role="alert"
          className="p-5 rounded-2xl bg-rose-500/15 border-2 border-rose-500 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg"
        >
          <div className="flex items-start gap-3.5">
            <AlertOctagon className="w-7 h-7 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <div className="text-base md:text-lg font-bold tracking-tight text-rose-500">
                {tr(
                  lang,
                  'CLOSURE REJECTED — CASE REOPENED & ESCALATED TO ZONAL COMMISSIONER',
                  'नकली बंद रिपोर्ट अस्वीकृत — केस दोबारा खोला गया और ज़ोनल कमिश्नर को भेजा गया!'
                )}
              </div>
              <p className="text-sm text-theme-primary mt-1 font-medium">
                {tr(
                  lang,
                  `Verdict: ${auditResult.verdict} (${auditResult.visualMatchScore.toFixed(1)}% Landmark Match) · Trust Score -${auditResult.trustScorePenalty} pts · Payment Frozen!`,
                  `निर्णय: ${translateTerm(lang, auditResult.verdict)} (${auditResult.visualMatchScore.toFixed(1)}% मिलान) · ठेकेदार भरोसा -${auditResult.trustScorePenalty} अंक · भुगतान रोका गया!`
                )}
              </p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-rose-500 text-white font-mono text-xs font-bold whitespace-nowrap shrink-0">
            {tr(lang, 'FROZEN:', 'रोका गया:')} ₹{activeTicket.escrowValueINR.toLocaleString('en-IN')}
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-teal-500/15 border-2 border-teal-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <CheckCircle2 className="w-7 h-7 text-teal-600 dark:text-[#00F5D4] shrink-0 mt-0.5" />
            <div>
              <div className="text-base md:text-lg font-bold text-teal-700 dark:text-[#00F5D4]">
                {tr(
                  lang,
                  'VERIFIED FIXED — GENUINE REPAIR CONFIRMED BY AI',
                  'सही मरम्मत सत्यापित — AI द्वारा असली काम की पुष्टि'
                )}
              </div>
              <p className="text-sm text-theme-primary mt-1 font-medium">
                {tr(
                  lang,
                  `Landmark Match: ${auditResult.visualMatchScore.toFixed(1)}% · Pole #TR-409 & road surface 100% fixed.`,
                  `लैंडमार्क मिलान: ${auditResult.visualMatchScore.toFixed(1)}% · पोल #TR-409 और पक्की सड़क 100% ठीक।`
                )}
              </p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-mono text-xs font-bold whitespace-nowrap shrink-0">
            {tr(lang, 'RELEASED:', 'भुगतान पास:')} ₹{activeTicket.escrowValueINR.toLocaleString('en-IN')}
          </div>
        </div>
      )}

      {/* Card 1: 3 Pre-Loaded Test Cases */}
      <section className="civic-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-theme">
          <div>
            <h2 className="text-lg font-bold text-theme-primary flex items-center gap-2.5">
              <ScanEye className="w-5 h-5 text-teal-600 dark:text-[#00F5D4]" />
              <span>
                {tr(
                  lang,
                  'AI Visual Lie-Detector (Before vs. After Photo Audit)',
                  'AI फोटो झूठ-पकड़ने वाली लैब (पहले बनाम बाद की जांच)'
                )}
              </span>
            </h2>
            <p className="text-xs text-theme-secondary mt-1">
              {tr(
                lang,
                'Pick one of the 3 test cases below or upload your own photos.',
                'नीचे दिए गए 3 टेस्ट केस में से चुनें या अपनी फोटो अपलोड करें।'
              )}
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1.5 civic-subcard shrink-0">
            <button
              onClick={() => setSubmissionRole('CONTRACTOR_CLOSURE_REPORT')}
              className={`civic-btn px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap ${
                submissionRole === 'CONTRACTOR_CLOSURE_REPORT'
                  ? 'bg-teal-500 text-slate-950'
                  : 'text-theme-secondary'
              }`}
            >
              {tr(lang, 'Contractor Repair Photo', 'ठेकेदार रिपेयर फोटो')}
            </button>
            <button
              onClick={() => setSubmissionRole('CITIZEN_CONTRADICTING_EVIDENCE')}
              className={`civic-btn px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap ${
                submissionRole === 'CITIZEN_CONTRADICTING_EVIDENCE'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-theme-secondary'
              }`}
            >
              {tr(lang, 'Citizen Proof Photo', 'नागरिक सबूत फोटो')}
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRELOADED_AUDIT_TEST_CASES.map((tc) => {
            const isSelected =
              selectedTestCase.id === tc.id && !customBeforeUrl && !customAfterUrl;
            const verdict = tc.expectedFallbackResult.verdict;
            return (
              <button
                key={tc.id}
                onClick={() => handleSelectPresetCase(tc)}
                className={`civic-subcard civic-subcard-interactive text-left p-5 flex flex-col justify-between ${
                  isSelected ? '!border-teal-500 bg-teal-500/10' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5">
                    <span className="text-theme-secondary">
                      {lang === 'hi' ? tc.badgeHi : tc.badge}
                    </span>
                    <span
                      className={
                        verdict === 'VERIFIED FIXED'
                          ? 'text-teal-600 dark:text-[#00F5D4]'
                          : verdict === 'FAKE CLOSURE DETECTED'
                            ? 'text-rose-500'
                            : 'text-amber-500'
                      }
                    >
                      {tc.expectedFallbackResult.visualMatchScore}% Match
                    </span>
                  </div>
                  <div className="text-sm font-bold text-theme-primary leading-snug">
                    {lang === 'hi' ? tc.titleHi : tc.title}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-theme flex items-center justify-between text-xs font-bold">
                  <span className="text-theme-secondary">
                    {translateTerm(lang, verdict)}
                  </span>
                  <span className="text-teal-600 dark:text-[#00F5D4]">
                    {tr(lang, 'Test →', 'जांचें →')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Card 2: Split-Screen Before vs. After Images */}
      <section className="civic-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme">
          <h3 className="text-base font-bold text-theme-primary">
            {tr(
              lang,
              'Split-Screen Visual Comparison (Pole #TR-409 & Road Surface)',
              'आमने-सामने फोटो मिलान (पोल #TR-409 और सड़क की सतह)'
            )}
          </h3>
          <button
            onClick={handleRunLiveGeminiAudit}
            disabled={isAuditing}
            className="civic-btn px-4 py-2.5 text-xs font-bold bg-[#00F5D4] text-slate-950 rounded-xl disabled:opacity-50 flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isAuditing
                ? tr(lang, 'Scanning with Gemini...', 'Gemini जांच रहा है...')
                : tr(lang, 'Run Gemini Vision Audit', 'Gemini AI फोटो जांच चलाएं')}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BEFORE Frame */}
          <div className="civic-subcard overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-4 py-2.5 border-b border-theme flex items-center justify-between text-xs font-bold">
                <span className="text-theme-primary">
                  {tr(lang, 'BEFORE (Broken Road)', 'पहले (टूटी सड़क और खतरा)')}
                </span>
                <span className="font-mono text-theme-secondary">Baseline</span>
              </div>
              <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                <img
                  src={beforeImgSrc}
                  alt="Before hazard evidence"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="px-4 py-2.5 text-xs font-medium text-theme-secondary border-t border-theme">
                {customBeforeUrl
                  ? tr(lang, 'Custom Uploaded Before Photo', 'कस्टम अपलोड की गई पहले की फोटो')
                  : lang === 'hi'
                    ? selectedTestCase.beforeCaptionHi
                    : selectedTestCase.beforeCaption}
              </p>
            </div>
            <div className="p-3 border-t border-theme">
              <label className="civic-btn w-full px-4 py-2 text-xs font-bold bg-teal-500/15 border border-teal-500/40 text-teal-700 dark:text-[#00F5D4] rounded-lg cursor-pointer flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                <span>{tr(lang, 'Upload "Before" Photo', '"पहले" की फोटो अपलोड करें')}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('BEFORE', e)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* AFTER Frame */}
          <div className="civic-subcard overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-4 py-2.5 border-b border-theme flex items-center justify-between text-xs font-bold">
                <span className="text-theme-primary">
                  {tr(lang, 'AFTER (Submitted Proof)', 'बाद में (जमा किया गया सबूत)')}
                </span>
                <span className={isRejected ? 'text-rose-500' : 'text-teal-500'}>
                  {translateTerm(lang, auditResult.verdict)}
                </span>
              </div>
              <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                <img
                  src={afterImgSrc}
                  alt="After repair proof"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="px-4 py-2.5 text-xs font-medium text-theme-secondary border-t border-theme">
                {customAfterUrl
                  ? tr(lang, 'Custom Uploaded After Photo', 'कस्टम अपलोड की गई बाद की फोटो')
                  : lang === 'hi'
                    ? selectedTestCase.afterCaptionHi
                    : selectedTestCase.afterCaption}
              </p>
            </div>
            <div className="p-3 border-t border-theme">
              <label className="civic-btn w-full px-4 py-2 text-xs font-bold bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-[#FFB703] rounded-lg cursor-pointer flex items-center justify-center gap-2">
                <Camera className="w-4 h-4" />
                <span>{tr(lang, 'Upload "After" Photo', '"बाद" की फोटो अपलोड करें')}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('AFTER', e)}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Card 3: Punchy Bullet Verdict & Contractor Action */}
      <section className="civic-card p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Cols: Simple Summary + 3 Bullet Points */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-theme-primary">
              {tr(lang, 'AI Forensic Findings (At a Glance)', 'AI फोटो जांच के मुख्य बिंदु')}
            </h3>

            <div className="civic-subcard p-4 text-sm font-semibold text-theme-primary leading-snug">
              {lang === 'hi' && auditResult.forensicExplanationHi
                ? auditResult.forensicExplanationHi
                : auditResult.forensicExplanation}
            </div>

            <div className="space-y-2">
              {findingsList.map((finding, idx) => (
                <div
                  key={idx}
                  className="civic-subcard p-3 text-xs font-medium text-theme-secondary flex items-center gap-2.5"
                >
                  <span className="font-mono font-bold text-teal-600 dark:text-[#00F5D4]">
                    ✓
                  </span>
                  <span>{finding}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right 5 Cols: Big Match % Badge & Contractor Penalty */}
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="civic-subcard p-4">
                <div className="text-xs font-bold text-theme-secondary">
                  {tr(lang, 'Landmark Match', 'जगह का मिलान')}
                </div>
                <div
                  className={`mt-1.5 text-3xl font-bold font-mono tabular-nums ${
                    auditResult.visualMatchScore >= 80
                      ? 'text-teal-600 dark:text-[#00F5D4]'
                      : auditResult.visualMatchScore >= 50
                        ? 'text-amber-500'
                        : 'text-rose-500'
                  }`}
                >
                  {auditResult.visualMatchScore.toFixed(1)}%
                </div>
              </div>

              <div className="civic-subcard p-4">
                <div className="text-xs font-bold text-theme-secondary">
                  {tr(lang, 'Final Verdict', 'अंतिम फैसला')}
                </div>
                <div
                  className={`mt-1.5 text-xs font-bold font-mono leading-snug ${
                    auditResult.verdict === 'VERIFIED FIXED'
                      ? 'text-teal-600 dark:text-[#00F5D4]'
                      : 'text-rose-500'
                  }`}
                >
                  {translateTerm(lang, auditResult.verdict)}
                </div>
              </div>
            </div>

            <div
              className={`civic-subcard p-4 ${
                isRejected ? '!border-rose-500 bg-rose-500/10' : ''
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-2.5">
                <span className="text-theme-primary">
                  {tr(lang, 'Contractor Payment & Trust', 'ठेकेदार भुगतान और भरोसा')}
                </span>
                <Lock className={`w-4 h-4 ${isRejected ? 'text-rose-500' : 'text-teal-500'}`} />
              </div>
              <div className="space-y-1.5 text-xs font-mono font-bold tabular-nums">
                <div className="flex justify-between">
                  <span className="text-theme-secondary">{tr(lang, 'Contractor:', 'ठेकेदार:')}</span>
                  <span className="text-theme-primary">{activeTicket.contractorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-secondary">{tr(lang, 'Trust Score:', 'भरोसा स्कोर:')}</span>
                  <span className={isRejected ? 'text-rose-500' : 'text-teal-600 dark:text-[#00F5D4]'}>
                    {activeTicket.contractorTrustScore}% {isRejected ? '(-35 pts)' : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-secondary">{tr(lang, 'Payment:', 'भुगतान:')}</span>
                  <span className={isRejected ? 'text-rose-500' : 'text-teal-600 dark:text-[#00F5D4]'}>
                    {isRejected
                      ? tr(lang, `FROZEN (₹${activeTicket.escrowValueINR.toLocaleString('en-IN')})`, `रोका गया (₹${activeTicket.escrowValueINR.toLocaleString('en-IN')})`)
                      : tr(lang, 'APPROVED', 'पास किया गया')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
