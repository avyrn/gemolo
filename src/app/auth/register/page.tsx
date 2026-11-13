'use client';
// ============================================================
// Multi-step Onboarding Wizard (5 steps)
// Supports roles: Patient (adult) vs. Caregiver (parent/guardian)
// Step 1: Role Selection + IIN + Names + DOB + Weight + Password
// Step 2: Blood type (tile picker — 8 options)
// Step 3: Hemophilia type (A/B) + severity (mild/moderate/severe) + inhibitor
// Step 4: Factor product + dose + doctor + hospital
// Step 5: Emergency contact + Caregiver setup
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { PatientProfile, UserRole } from '@/lib/store';
import { ChevronRight, ChevronLeft, CheckCircle, Heart, AlertCircle, Shield, User } from 'lucide-react';
import Link from 'next/link';

const TOTAL_STEPS = 5;
const BLOOD_TYPES = ['A(II)+', 'A(II)−', 'B(III)+', 'B(III)−', 'AB(IV)+', 'AB(IV)−', 'O(I)+', 'O(I)−'];

const SEVERITY_CONFIG = [
  {
    key: 'mild' as const,
    emoji: '🟡',
    factorLevel: '5–40%',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FCD34D',
  },
  {
    key: 'moderate' as const,
    emoji: '🟠',
    factorLevel: '1–5%',
    color: '#EA580C',
    bg: '#FFF7ED',
    border: '#FDBA74',
  },
  {
    key: 'severe' as const,
    emoji: '🔴',
    factorLevel: '<1%',
    color: '#DC2626',
    bg: '#FFF1F2',
    border: '#FCA5A5',
  },
];

export default function OnboardingPage() {
  const { t } = useLanguage();
  const { register, completeOnboarding } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Role state
  const [role, setRole] = useState<UserRole>('patient');
  const [caregiverName, setCaregiverName] = useState('');

  // Form state
  const [iin, setIin] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [weight, setWeight] = useState<number>(65);
  const [bloodType, setBloodType] = useState('');
  const [hemophiliaType, setHemophiliaType] = useState<'A' | 'B'>('A');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('severe');
  const [inhibitor, setInhibitor] = useState(false);
  const [factorProduct, setFactorProduct] = useState('');
  const [workingDose, setWorkingDose] = useState('');
  const [doctor, setDoctor] = useState('');
  const [hospital, setHospital] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelation, setContactRelation] = useState('');

  const stepTitles = [
    t('onb_s1_title'), t('onb_s2_title'), t('onb_s3_title'), t('onb_s4_title'), t('onb_s5_title'),
  ];

  const canProceed = () => {
    if (step === 1) {
      const basicValid = iin.length === 12 && password.length >= 4 && fullName.trim().length >= 2 && dob && weight > 0;
      if (role === 'caregiver') {
        return basicValid && caregiverName.trim().length >= 2;
      }
      return basicValid;
    }
    if (step === 2) return bloodType !== '';
    if (step === 3) return true;
    if (step === 4) return true;
    return true;
  };

  const handleNext = async () => {
    setError('');

    if (step === 1) {
      setLoading(true);
      const result = await register(iin, password, role);
      setLoading(false);
      if (!result.ok) {
        setError(result.error || 'Ошибка регистрации');
        return;
      }
    }

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      setLoading(true);
      const patient: PatientProfile = {
        role,
        caregiverName: role === 'caregiver' ? caregiverName : undefined,
        fullName,
        dob,
        bloodType,
        hemophiliaType,
        severity,
        inhibitor,
        workingDose: workingDose || (severity === 'severe' ? '2000 МЕ / 3 раза в неделю' : 'По требованию'),
        factorProduct: factorProduct || (hemophiliaType === 'A' ? 'Октанат (Фактор VIII)' : 'Фактор IX'),
        doctor: doctor || 'Кемайкин В. М.',
        hospital: hospital || 'ННОЦ / Центр гематологии',
        weight,
        contacts: contactName ? [{ name: contactName, phone: contactPhone, relation: contactRelation }] : [],
      };
      await completeOnboarding(patient);
      await new Promise((r) => setTimeout(r, 400));
      router.push('/');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
    else router.push('/auth/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #EBF4FF 0%, #F0EBFF 60%, #E8F9EE 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{ width: '100%', maxWidth: 540 }}>
        {/* Logo + step indicator */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #2D7DD2, #1A5FAA)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Heart size={20} color="white" fill="white" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A202C', letterSpacing: '-0.02em' }}>HaemoHelp KZ</span>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} style={{
                height: 5, flex: 1, maxWidth: 60, borderRadius: 3,
                background: i < step ? '#2D7DD2' : '#E8EDF5',
                transition: 'background 0.3s ease',
              }} />
            ))}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
            {`${step} из ${TOTAL_STEPS}`} · {stepTitles[step - 1]}
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ animation: 'slide-up 0.25s ease' }}>
          {/* Step header */}
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
              {step === 1 && 'Кем вы являетесь? Основные данные'}
              {step === 2 && t('onb_s2_title')}
              {step === 3 && t('onb_s3_title')}
              {step === 4 && t('onb_s4_title')}
              {step === 5 && t('onb_s5_title')}
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
              {step === 1 && 'Выберите профиль: взрослый пациент или опекун/родитель'}
              {step === 2 && t('onb_s2_desc')}
              {step === 3 && t('onb_s3_desc')}
              {step === 4 && t('onb_s4_desc')}
              {step === 5 && t('onb_s5_desc')}
            </p>
          </div>

          {/* ===== STEP 1: Role & Personal ===== */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Role Selector */}
              <div>
                <label className="label">Ваша роль в системе</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setRole('patient')}
                    style={{
                      padding: '14px 12px', borderRadius: 12, border: '2px solid',
                      borderColor: role === 'patient' ? '#2D7DD2' : 'var(--color-border)',
                      background: role === 'patient' ? '#EBF4FF' : 'var(--color-surface)',
                      cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 10, alignItems: 'flex-start'
                    }}
                  >
                    <User size={20} color={role === 'patient' ? '#2D7DD2' : '#64748B'} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: role === 'patient' ? '#2D7DD2' : 'var(--color-text)' }}>
                        Я пациент
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>Взрослый (сам веду учет)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('caregiver')}
                    style={{
                      padding: '14px 12px', borderRadius: 12, border: '2px solid',
                      borderColor: role === 'caregiver' ? '#7B5EA7' : 'var(--color-border)',
                      background: role === 'caregiver' ? '#F0EBFF' : 'var(--color-surface)',
                      cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 10, alignItems: 'flex-start'
                    }}
                  >
                    <Shield size={20} color={role === 'caregiver' ? '#7B5EA7' : '#64748B'} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: role === 'caregiver' ? '#7B5EA7' : 'var(--color-text)' }}>
                        Я опекун / родитель
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>Забочусь о ребенке</div>
                    </div>
                  </button>
                </div>
              </div>

              {role === 'caregiver' && (
                <div style={{ background: '#F0EBFF', padding: 12, borderRadius: 10, border: '1px solid #D8C7F5' }}>
                  <label className="label" htmlFor="onb-caregiver-name" style={{ color: '#5B3A8B' }}>
                    ФИО родителя / опекуна
                  </label>
                  <input
                    id="onb-caregiver-name"
                    type="text"
                    className="input"
                    placeholder="Аскарова Айгуль Сериковна"
                    value={caregiverName}
                    onChange={(e) => setCaregiverName(e.target.value)}
                    style={{ background: 'white' }}
                  />
                </div>
              )}

              <div>
                <label className="label" htmlFor="onb-fullname">
                  {role === 'caregiver' ? 'ФИО ребенка (пациента)' : t('onb_fullname')}
                </label>
                <input
                  id="onb-fullname"
                  type="text"
                  className="input"
                  placeholder={role === 'caregiver' ? 'Аскаров Батыр (ребенок)' : t('onb_fullname_placeholder')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="label" htmlFor="onb-iin">
                  {role === 'caregiver' ? 'ИИН ребенка / подопечного (12 цифр)' : t('onb_iin')}
                </label>
                <input
                  id="onb-iin"
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  className="input"
                  placeholder={t('auth_iin_placeholder')}
                  value={iin}
                  onChange={(e) => setIin(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  style={{ fontFamily: 'monospace', fontSize: '1.05rem', letterSpacing: '0.08em' }}
                />
                <div style={{ fontSize: '0.8rem', color: iin.length === 12 ? '#2DC653' : '#94A3B8', marginTop: 4 }}>
                  {iin.length} / 12 {iin.length === 12 && '✓'}
                </div>
              </div>

              <div>
                <label className="label" htmlFor="onb-password">{t('onb_password_new')}</label>
                <input
                  id="onb-password"
                  type="password"
                  className="input"
                  placeholder={t('onb_password_new_placeholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="grid-2">
                <div>
                  <label className="label" htmlFor="onb-dob">
                    {role === 'caregiver' ? 'Дата рождения ребенка' : t('onb_dob')}
                  </label>
                  <input
                    id="onb-dob"
                    type="date"
                    className="input"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="onb-weight">
                    {role === 'caregiver' ? 'Вес ребенка (кг)' : t('onb_weight')}
                  </label>
                  <input
                    id="onb-weight"
                    type="number"
                    className="input"
                    min={3} max={250}
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                  />
                </div>
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748B', marginTop: 4 }}>
                {t('auth_have_account')}{' '}
                <Link href="/auth/login" id="link-to-login" style={{ color: '#2D7DD2', fontWeight: 600, textDecoration: 'none' }}>
                  {t('auth_login_link')}
                </Link>
              </p>
            </div>
          )}

          {/* ===== STEP 2: Blood type ===== */}
          {step === 2 && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {BLOOD_TYPES.map((bt) => {
                  const isSelected = bloodType === bt;
                  return (
                    <button
                      key={bt}
                      type="button"
                      id={`blood-${bt}`}
                      onClick={() => setBloodType(bt)}
                      style={{
                        padding: '16px 6px', borderRadius: 14,
                        border: `2px solid ${isSelected ? '#E63946' : '#E8EDF5'}`,
                        background: isSelected ? '#FFE8EA' : '#F7F9FC',
                        cursor: 'pointer', textAlign: 'center',
                        transition: 'all 0.18s ease',
                        position: 'relative',
                      }}
                    >
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: isSelected ? '#E63946' : '#1A202C' }}>
                        {bt}
                      </div>
                      {isSelected && (
                        <CheckCircle size={14} color="#E63946" style={{ position: 'absolute', top: 6, right: 6 }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {bloodType && (
                <div style={{ marginTop: 14, padding: '10px 14px', background: '#E8F9EE', borderRadius: 10, color: '#15803D', fontSize: '0.875rem' }}>
                  ✓ Выбрана группа: <strong>{bloodType}</strong>
                </div>
              )}
            </div>
          )}

          {/* ===== STEP 3: Hemophilia type & severity ===== */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">{t('onb_hemo_type')}</label>
                <div className="grid-2">
                  <button
                    type="button"
                    onClick={() => setHemophiliaType('A')}
                    style={{
                      padding: 14, borderRadius: 12, border: '2px solid',
                      borderColor: hemophiliaType === 'A' ? '#2D7DD2' : '#E8EDF5',
                      background: hemophiliaType === 'A' ? '#EBF4FF' : '#F7F9FC',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#2D7DD2' }}>Тип A</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Дефицит фактора VIII (80-85% случаев в РК)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHemophiliaType('B')}
                    style={{
                      padding: 14, borderRadius: 12, border: '2px solid',
                      borderColor: hemophiliaType === 'B' ? '#2D7DD2' : '#E8EDF5',
                      background: hemophiliaType === 'B' ? '#EBF4FF' : '#F7F9FC',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#2D7DD2' }}>Тип B</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Дефицит фактора IX (болезнь Кристмаса)</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="label">{t('onb_severity')}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {SEVERITY_CONFIG.map((cfg) => {
                    const isSelected = severity === cfg.key;
                    return (
                      <button
                        key={cfg.key}
                        type="button"
                        onClick={() => setSeverity(cfg.key)}
                        style={{
                          padding: '12px 14px', borderRadius: 12, border: '2px solid',
                          borderColor: isSelected ? cfg.color : '#E8EDF5',
                          background: isSelected ? cfg.bg : '#F7F9FC',
                          cursor: 'pointer', textAlign: 'left',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                            {cfg.emoji} {cfg.key === 'mild' ? 'Лёгкая' : cfg.key === 'moderate' ? 'Средняя' : 'Тяжёлая'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Уровень фактора: {cfg.factorLevel}</div>
                        </div>
                        {isSelected && <CheckCircle size={16} color={cfg.color} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="label">Наличие ингибиторов к факторам</label>
                <div className="grid-2">
                  <button
                    type="button"
                    onClick={() => setInhibitor(false)}
                    style={{
                      padding: 10, borderRadius: 10, border: '2px solid',
                      borderColor: !inhibitor ? '#2DC653' : '#E8EDF5',
                      background: !inhibitor ? '#E8F9EE' : '#F7F9FC',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                    }}
                  >
                    Нет ингибиторов
                  </button>
                  <button
                    type="button"
                    onClick={() => setInhibitor(true)}
                    style={{
                      padding: 10, borderRadius: 10, border: '2px solid',
                      borderColor: inhibitor ? '#E63946' : '#E8EDF5',
                      background: inhibitor ? '#FFE8EA' : '#F7F9FC',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                    }}
                  >
                    Есть ингибиторы
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 4: Treatment ===== */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">{t('onb_factor_product')}</label>
                <input
                  type="text"
                  className="input"
                  placeholder="напр. Октанат, Новоэйт, Октоког альфа, Эмицизумаб"
                  value={factorProduct}
                  onChange={(e) => setFactorProduct(e.target.value)}
                />
              </div>

              <div>
                <label className="label">{t('onb_working_dose')}</label>
                <input
                  type="text"
                  className="input"
                  placeholder="напр. 2000 МЕ / 3 раза в неделю"
                  value={workingDose}
                  onChange={(e) => setWorkingDose(e.target.value)}
                />
              </div>

              <div>
                <label className="label">{t('onb_doctor')}</label>
                <input
                  type="text"
                  className="input"
                  placeholder="напр. Кемайкин В. М., Манжуова Л."
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                />
              </div>

              <div>
                <label className="label">{t('onb_hospital')}</label>
                <input
                  type="text"
                  className="input"
                  placeholder="напр. ННОЦ (Астана), ГКБ №7, КазНИИОиР (Алматы)"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ===== STEP 5: Emergency contact ===== */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">{t('onb_contact_name')}</label>
                <input
                  type="text"
                  className="input"
                  placeholder={role === 'caregiver' ? 'Второй родитель / Лечащий врач' : 'Мама / Супруг(а) / Врач'}
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div>
                <label className="label">{t('onb_contact_phone')}</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="+7 700 000 00 00"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="label">{t('onb_contact_relation')}</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Мать / Отец / Врач-гематолог"
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                />
              </div>

              {/* Summary preview card */}
              <div style={{
                background: 'linear-gradient(135deg, #EBF4FF, #E8F9EE)',
                borderRadius: 12, padding: '14px 16px',
                border: '1px solid rgba(45,125,210,0.2)', marginTop: 4,
              }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2D7DD2', marginBottom: 6 }}>
                  📋 Готовый профиль ({role === 'caregiver' ? '🛡️ Режим опекуна' : '👤 Режим пациента'}):
                </div>
                <div style={{ fontSize: '0.875rem', color: '#1A202C', lineHeight: 1.6 }}>
                  <strong>{fullName}</strong> {role === 'caregiver' && caregiverName && `(Опекун: ${caregiverName})`} · {bloodType} · Гемофилия {hemophiliaType}<br />
                  Вес: <strong>{weight} кг</strong> · Степень: {severity === 'mild' ? '🟡 Лёгкая' : severity === 'moderate' ? '🟠 Средняя' : '🔴 Тяжёлая'}
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
              background: '#FFE8EA', borderRadius: 10, padding: '10px 14px',
              color: '#E63946', fontSize: '0.9rem',
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <button
              id="btn-onb-back"
              type="button"
              className="btn btn-ghost"
              onClick={handleBack}
              style={{ flex: 0 }}
            >
              <ChevronLeft size={18} />
              {t('onb_back')}
            </button>
            <button
              id="btn-onb-next"
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!canProceed() || loading}
              style={{ flex: 1, opacity: !canProceed() ? 0.6 : 1 }}
            >
              {loading ? '...' : step === TOTAL_STEPS ? `✓ ${t('onb_finish')}` : t('onb_next')}
              {!loading && step < TOTAL_STEPS && <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
