import React from 'react';
import {
  Zap,
  Clock,
  ShieldAlert,
  CloudRain,
  ArrowUpRight,
  RotateCcw,
} from 'lucide-react';
import { MasterIncidentTicket } from '../services/deduplicationEngine';
import { AppLanguage, tr, translateTerm } from '../services/uiPreferences';

interface ChaosSimulatorProps {
  tickets: MasterIncidentTicket[];
  onTriggerSLABreach: () => void;
  onTriggerFakeClosure: () => void;
  onTriggerFlashFlood: () => void;
  onResetSimulation: () => void;
  lastTriggeredChaos: string | null;
  lang: AppLanguage;
}

export const ChaosSimulator: React.FC<ChaosSimulatorProps> = ({
  tickets,
  onTriggerSLABreach,
  onTriggerFakeClosure,
  onTriggerFlashFlood,
  onResetSimulation,
  lastTriggeredChaos,
  lang,
}) => {
  return (
    <div className="space-y-7">
      {/* 3 Big Judge Chaos Simulator Cards with Simple Bullet Points */}
      <section className="civic-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-theme">
          <div>
            <h2 className="text-lg font-bold text-theme-primary flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>
                {tr(
                  lang,
                  'Judge Chaos Simulator (Break the Plan — Watch AI Fix It)',
                  'जज केओस सिम्युलेटर (योजना तोड़ें — AI को तुरंत सुधारते देखें)'
                )}
              </span>
            </h2>
            <p className="text-xs text-theme-secondary mt-1">
              {tr(
                lang,
                'Click any button below to test how the 4 AI Agents handle real-world crises.',
                'नीचे किसी भी बटन को दबाकर देखें कि चारों AI एजेंट संकट को कैसे संभालते हैं।'
              )}
            </p>
          </div>
          <button
            onClick={onResetSimulation}
            className="civic-btn px-4 py-2 text-xs font-bold bg-teal-500/15 border border-teal-500/50 text-teal-600 dark:text-[#00F5D4] rounded-xl flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{tr(lang, 'Reset All', 'रीसेट करें')}</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: SLA Breach */}
          <div className="civic-subcard civic-subcard-interactive p-5 !border-amber-500/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-500 mb-2">
                <span>TEST 01 · SLA BREACH</span>
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-theme-primary mb-3">
                {tr(
                  lang,
                  '⏰ Department Misses Deadline',
                  '⏰ विभाग ने समय सीमा (SLA) तोड़ी'
                )}
              </h3>
              <ul className="space-y-1.5 text-xs font-medium text-theme-secondary mb-5">
                <li>• {tr(lang, 'Step 2 timer hits 00:00:00', 'चरण 2 का समय 00:00:00 पर समाप्त')}</li>
                <li>• {tr(lang, 'AI sends QRT Backup Crew', 'AI तुरंत बैकअप QRT टीम भेजता है')}</li>
                <li>• {tr(lang, 'Escalates to Zonal Commissioner', 'ज़ोनल कमिश्नर को अलर्ट भेजता है')}</li>
              </ul>
            </div>
            <button
              onClick={onTriggerSLABreach}
              className="civic-btn w-full py-3 px-4 text-xs font-bold bg-[#FFB703] text-slate-950 rounded-xl flex items-center justify-center gap-2"
            >
              <span>
                {tr(lang, '⏰ Simulate SLA Breach', '⏰ SLA देरी ट्रिगर करें')}
              </span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Fake Contractor Closure */}
          <div className="civic-subcard civic-subcard-interactive p-5 !border-rose-500/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-500 mb-2">
                <span>TEST 02 · CONTRACTOR FRAUD</span>
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-theme-primary mb-3">
                {tr(
                  lang,
                  '🤥 Contractor Uploads Fake Photo',
                  '🤥 ठेकेदार ने नकली फोटो अपलोड की'
                )}
              </h3>
              <ul className="space-y-1.5 text-xs font-medium text-theme-secondary mb-5">
                <li>• {tr(lang, 'Photo is from wrong street (14%)', 'फोटो दूसरी गली की है (14% मिलान)')}</li>
                <li>• {tr(lang, 'AI reopens ticket & cuts Trust -35', 'केस फिर खुला और भरोसा -35 घटा')}</li>
                <li>• {tr(lang, 'Freezes ₹1,85,000 payout!', '₹1,85,000 का भुगतान तुरंत फ्रीज!')}</li>
              </ul>
            </div>
            <button
              onClick={onTriggerFakeClosure}
              className="civic-btn w-full py-3 px-4 text-xs font-bold bg-[#FF2A85] text-white rounded-xl flex items-center justify-center gap-2"
            >
              <span>
                {tr(lang, '🤥 Simulate Fake Closure', '🤥 नकली फोटो ट्रिगर करें')}
              </span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Flash Flood Surge */}
          <div className="civic-subcard civic-subcard-interactive p-5 !border-teal-500/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-teal-600 dark:text-[#00F5D4] mb-2">
                <span>TEST 03 · MONSOON SURGE</span>
                <CloudRain className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-theme-primary mb-3">
                {tr(
                  lang,
                  '🌧️ Flash-Flood Emergency Surge',
                  '🌧️ अचानक बाढ़ और भारी बारिश आपातकाल'
                )}
              </h3>
              <ul className="space-y-1.5 text-xs font-medium text-theme-secondary mb-5">
                <li>• {tr(lang, '36 flood complaints in 90 secs', '90 सेकंड में 36 बाढ़ शिकायतें मिलीं')}</li>
                <li>• {tr(lang, 'Urgency jumps to 99/100', 'गंभीरता स्कोर 99/100 पर पहुंचा')}</li>
                <li>• {tr(lang, 'Cuts live power & sends pumps', 'बिजली काटकर सारे पंप भेजे गए')}</li>
              </ul>
            </div>
            <button
              onClick={onTriggerFlashFlood}
              className="civic-btn w-full py-3 px-4 text-xs font-bold bg-[#00F5D4] text-slate-950 rounded-xl flex items-center justify-center gap-2"
            >
              <span>
                {tr(lang, '🌧️ Trigger Flash-Flood Surge', '🌧️ बाढ़ आपातकाल ट्रिगर करें')}
              </span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Clean Live Status Table */}
      <section className="civic-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-theme-primary">
            {tr(
              lang,
              'Live Ticket Status After AI Re-Planning',
              'AI री-प्लानिंग के बाद लाइव टिकट स्थिति'
            )}
          </h3>
          {lastTriggeredChaos && (
            <span className="text-xs font-mono font-bold text-rose-500">
              {lastTriggeredChaos}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-theme text-theme-secondary font-mono">
                <th className="py-3 px-4">{tr(lang, 'Ticket', 'टिकट')}</th>
                <th className="py-3 px-4">{tr(lang, 'Sector', 'सेक्टर')}</th>
                <th className="py-3 px-4 text-right">{tr(lang, 'Urgency', 'गंभीरता')}</th>
                <th className="py-3 px-4">{tr(lang, 'Status', 'स्थिति')}</th>
                <th className="py-3 px-4">{tr(lang, 'Authority', 'अधिकारी')}</th>
                <th className="py-3 px-4 text-right">{tr(lang, 'Trust', 'भरोसा')}</th>
                <th className="py-3 px-4 text-right">{tr(lang, 'Escrow (₹)', 'एस्क्रो राशि')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-500/15 font-mono tabular-nums">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-500/5">
                  <td className="py-3.5 px-4 font-bold text-teal-600 dark:text-[#00F5D4]">
                    {t.id}
                  </td>
                  <td className="py-3.5 px-4 font-sans font-medium text-theme-primary">
                    {lang === 'hi' ? t.sectorHi || t.sector : t.sector}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-amber-500">
                    {t.urgencyScore}/100
                  </td>
                  <td className="py-3.5 px-4 font-bold">
                    <span
                      className={
                        t.status === 'REOPENED_ESCALATED' ||
                        t.status === 'SLA_BREACH_ESCALATED'
                          ? 'text-rose-500'
                          : 'text-teal-600 dark:text-[#00F5D4]'
                      }
                    >
                      {translateTerm(lang, t.status)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-theme-primary">
                    {translateTerm(lang, t.escalationLevel)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold">
                    <span className={t.contractorTrustScore < 60 ? 'text-rose-500' : 'text-theme-primary'}>
                      {t.contractorTrustScore}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold">
                    <span
                      className={
                        t.escrowStatus === 'FROZEN_FRAUD_DETECTED'
                          ? 'text-rose-500'
                          : 'text-teal-600 dark:text-[#00F5D4]'
                      }
                    >
                      ₹{t.escrowValueINR.toLocaleString('en-IN')} ({translateTerm(lang, t.escrowStatus)})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
