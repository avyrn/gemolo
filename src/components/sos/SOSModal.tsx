'use client';
// ============================================================
// SOSModal.tsx — Emergency overlay with 3 tabs:
//   1. Dose calculator (weight × multiplier)
//   2. RICE first-aid steps
//   3. Ambulance call + dispatcher script
// ============================================================

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  X, AlertTriangle, Calculator, Shield, Phone,
  Bed, Snowflake, Layers, ArrowUp, Stethoscope, Copy, Check
} from 'lucide-react';

type SosTab = 'dose' | 'rice' | 'call';
type Multiplier = 10 | 20 | 30;

// RICE steps with icons
const RICE_STEPS = [
  { iconComp: Bed,         colorVar: '#2D7DD2', key: 'rest'    as const },
  { iconComp: Snowflake,   colorVar: '#06B6D4', key: 'ice'     as const },
  { iconComp: Layers,      colorVar: '#7B5EA7', key: 'compress' as const },
  { iconComp: ArrowUp,     colorVar: '#F4A261', key: 'elevate' as const },
  { iconComp: Stethoscope, colorVar: '#2DC653', key: 'seek'    as const },
];

export default function SOSModal() {
  const { t } = useLanguage();
  const { setSosOpen } = useStore();
  const { account } = useAuth();
  
  const patient = account?.patient || { fullName: 'Загрузка...', weight: 70, severity: 'severe' };

  const [activeTab, setActiveTab] = useState<SosTab>('dose');
  const [weight, setWeight] = useState(patient.weight);
  const [multiplier, setMultiplier] = useState<Multiplier>(
    patient.severity === 'mild' ? 10 : patient.severity === 'moderate' ? 20 : 30
  );
  const [copied, setCopied] = useState(false);

  // ---- Dose calculation ----
  const dose = Math.round(weight * multiplier);

  // ---- Copy script ----
  const handleCopy = () => {
    navigator.clipboard.writeText(t('sos_script'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { id: SosTab; label: string }[] = [
    { id: 'dose', label: t('sos_tab_dose') },
    { id: 'rice', label: t('sos_tab_rice') },
    { id: 'call', label: t('sos_tab_call') },
  ];

  return (
    <div className="sos-overlay" role="dialog" aria-modal="true" aria-label={t('sos_title')}>
      <div className="sos-modal">

        {/* ---- Header ---- */}
        <div className="sos-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={24} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                {t('sos_title')}
              </h2>
              <p style={{ fontSize: '0.8125rem', opacity: 0.8, margin: 0 }}>
                {patient.fullName} · {patient.weight} кг
              </p>
            </div>
          </div>
          <button
            id="btn-sos-close"
            onClick={() => setSosOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer',
              width: 36, height: 36, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', transition: 'background 0.18s',
            }}
            aria-label={t('sos_close')}
          >
            <X size={20} />
          </button>
        </div>

        {/* ---- Tabs ---- */}
        <div className="sos-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`sos-tab-${tab.id}`}
              className={`sos-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.id === 'dose' && <Calculator size={14} style={{ marginRight: 5, verticalAlign: -2 }} />}
              {tab.id === 'rice' && <Shield size={14} style={{ marginRight: 5, verticalAlign: -2 }} />}
              {tab.id === 'call' && <Phone size={14} style={{ marginRight: 5, verticalAlign: -2 }} />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ---- Body ---- */}
        <div className="sos-body">

          {/* ===== TAB 1: DOSE CALCULATOR ===== */}
          {activeTab === 'dose' && (
            <div style={{ animation: 'slide-in-right 0.2s ease' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: 20, color: 'var(--color-text)' }}>
                {t('sos_dose_title')}
              </h3>

              {/* Weight input */}
              <div style={{ marginBottom: 16 }}>
                <label className="label" htmlFor="sos-weight">{t('sos_weight_label')}</label>
                <input
                  id="sos-weight"
                  type="number"
                  min={10} max={200}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="input input-lg"
                  style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', color: 'var(--color-primary)' }}
                />
              </div>

              {/* Multiplier selector */}
              <div style={{ marginBottom: 24 }}>
                <label className="label">{t('sos_multiplier_label')}</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {([10, 20, 30] as Multiplier[]).map((m, idx) => (
                    <button
                      key={m}
                      id={`sos-multiplier-${m}`}
                      onClick={() => setMultiplier(m)}
                      style={{
                        flex: 1, padding: '12px 8px',
                        borderRadius: 12, border: '2px solid',
                        cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                        transition: 'all 0.18s ease',
                        borderColor: multiplier === m ? 'var(--color-sos)' : 'var(--color-border)',
                        background: multiplier === m ? 'var(--color-sos-light)' : 'var(--color-bg)',
                        color: multiplier === m ? 'var(--color-sos)' : 'var(--color-text-muted)',
                      }}
                    >
                      {[t('sos_mild'), t('sos_moderate'), t('sos_severe')][idx]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Result */}
              <div style={{
                background: 'linear-gradient(135deg, var(--color-sos-light), #FFD4D7)',
                borderRadius: 16, padding: '24px',
                textAlign: 'center', border: '2px solid rgba(230, 57, 70, 0.2)',
                marginBottom: 16,
              }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-sos)', fontWeight: 600, marginBottom: 8 }}>
                  {t('sos_dose_result')}
                </p>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-sos)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                  {dose.toLocaleString()}
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--color-sos)', opacity: 0.8, marginTop: 4 }}>
                  {t('sos_dose_unit')}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                  {weight} кг × {multiplier} МЕ/кг
                </div>
              </div>

              {/* Note */}
              <div style={{
                background: 'var(--color-primary-muted)',
                borderRadius: 12, padding: '14px 16px',
                fontSize: '0.875rem', color: 'var(--color-primary)',
                lineHeight: 1.5, display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                {t('sos_dose_note')}
              </div>
            </div>
          )}

          {/* ===== TAB 2: RICE FIRST AID ===== */}
          {activeTab === 'rice' && (
            <div style={{ animation: 'slide-in-right 0.2s ease' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: 16, color: 'var(--color-text)' }}>
                {t('sos_rice_title')}
              </h3>
              {RICE_STEPS.map(({ iconComp: Icon, colorVar, key }, idx) => (
                <div key={key} className="rice-step" style={{ borderLeftColor: colorVar }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: colorVar + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20} color={colorVar} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 3, color: 'var(--color-text)' }}>
                      {String(idx + 1)}. {t(`sos_rice_${key}` as any)}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
                      {t(`sos_rice_${key}_desc` as any)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ===== TAB 3: AMBULANCE ===== */}
          {activeTab === 'call' && (
            <div style={{ animation: 'slide-in-right 0.2s ease' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: 20, color: 'var(--color-text)' }}>
                {t('sos_call_title')}
              </h3>

              {/* Big call button */}
              <a
                href="tel:103"
                id="btn-call-103"
                className="btn btn-sos btn-lg btn-full"
                style={{ textDecoration: 'none', marginBottom: 24, justifyContent: 'center', display: 'flex' }}
              >
                <Phone size={22} />
                {t('sos_call_button')}
              </a>

              {/* Dispatcher script */}
              <div>
                <label className="label" style={{ marginBottom: 10 }}>{t('sos_script_title')}</label>
                <div style={{
                  background: 'var(--color-bg)',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 14, padding: '20px',
                  fontSize: '0.9375rem', lineHeight: 1.7,
                  color: 'var(--color-text)', marginBottom: 14,
                  fontStyle: 'italic',
                }}>
                  &ldquo;{t('sos_script')}&rdquo;
                </div>
                <button
                  id="btn-copy-script"
                  onClick={handleCopy}
                  className="btn btn-ghost btn-full"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? t('sos_copied') : t('sos_copy')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
