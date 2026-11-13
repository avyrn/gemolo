'use client';
// ============================================================
// HaemoHelp KZ — Scandinavian Clinical Minimalism Platform
// Multilingual: Russian (RU), Kazakh (KK), English (EN)
// Inspired by the Visual Language & Architecture of Neko Health (nekohealth.com)
// ============================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useStore, PatientProfile, CalendarEvent } from '@/lib/store';
import { useAuth } from '@/lib/auth/AuthContext';
import { Locale } from '@/lib/i18n/translations';
import {
  Syringe, CreditCard, ChevronRight, CheckCircle2,
  Copy, Maximize2, X, AlertTriangle, ArrowUpRight, Droplet
} from 'lucide-react';

export default function NekoClinicalLandingPage() {
  const { locale, setLocale, t } = useLanguage();
  const { events, setSosOpen, addEvent } = useStore();
  const { account } = useAuth();

  // Active state for 01/03 Stepper
  const [activeStep, setActiveStep] = useState<number>(1);

  // Modals & Interactive UI States
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [logSuccessToast, setLogSuccessToast] = useState(false);

  // Infusion Form State
  const [formFactor, setFormFactor] = useState('Октанат (Фактор VIII)');
  const [formDose, setFormDose] = useState('2000');
  const [formBatch, setFormBatch] = useState('KZ-8842-OCT');
  const [formType, setFormType] = useState<'prophylaxis' | 'bleed' | 'activity'>('prophylaxis');
  const [formNotes, setFormNotes] = useState('');

  // Patient profile fallback (KZ context)
  const defaultPatient: PatientProfile = {
    fullName: locale === 'kk' ? 'Батыр Ерланұлы Асқаров' : locale === 'en' ? 'Batyr Askarov' : 'Аскаров Батыр Ерланович',
    dob: '2016-04-17',
    bloodType: 'A(II) Rh+',
    hemophiliaType: 'A',
    severity: 'severe',
    inhibitor: false,
    workingDose: locale === 'kk' ? '2000 ХБ / аптасына 3 рет' : locale === 'en' ? '2,000 IU / 3× per week' : '2000 МЕ / 3 раза в неделю',
    factorProduct: 'Октанат (Фактор VIII)',
    doctor: locale === 'en' ? 'Dr. Kemaykin V. M.' : 'Кемайкин В. М.',
    hospital: locale === 'kk' ? 'ҰҒОО (Астана қ.)' : locale === 'en' ? 'NNOC (Astana)' : 'ННОЦ (г. Астана)',
    weight: 28,
    contacts: [],
  };
  const patient = account?.patient || defaultPatient;

  // Real-time calculation from event store
  const todayStr = new Date().toISOString().split('T')[0];
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyInjections = events.filter(
    (e) => e.type === 'injection' && new Date(e.date) >= weekAgo
  ).length;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const monthlyInjections = events.filter(
    (e) => e.type === 'injection' && new Date(e.date) >= startOfMonth
  ).length;

  // Chronological list of injections
  const injectionHistory = events
    .filter((e) => e.type === 'injection')
    .slice(0, 5);

  // Handle Infusion Form Submission
  const handleLogInfusionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const typeLabel = formType === 'prophylaxis' 
      ? t('form_reason_proph') 
      : formType === 'bleed' 
      ? t('form_reason_bleed') 
      : t('form_reason_sport');

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      date: todayStr,
      type: 'injection',
      time: new Date().toTimeString().slice(0, 5),
      notes: `${formFactor} — ${formDose} ${locale === 'kk' ? 'ХБ' : locale === 'en' ? 'IU' : 'МЕ'} [${t('form_batch_label')}: ${formBatch || 'N/A'}] (${typeLabel}). ${formNotes || t('form_reason_proph')}`,
    };
    addEvent(newEvent);
    setIsLogModalOpen(false);
    setLogSuccessToast(true);
    setTimeout(() => setLogSuccessToast(false), 3500);
  };

  // Copy Emergency Data to Clipboard
  const handleCopyEmergencyCard = () => {
    const text = locale === 'kk'
      ? `ШҰҒЫЛ МЕДИЦИНАЛЫҚ КАРТА (ҚР / ТМККК):\nПациент: ${patient.fullName}\nДиагноз: Гемофилия ${patient.hemophiliaType} (${patient.severity === 'severe' ? 'Ауыр түрі' : 'Орташа түрі'}, <1% фактор)\nҚан тобы: ${patient.bloodType}\nИнгибитор: ${patient.inhibitor ? 'ОҢ' : 'Теріс'}\nҚажетті препарат: ${patient.factorProduct || 'Фактор VIII'}\nБір реттік дозасы: ${patient.workingDose}\nЕмдеуші гематолог: ${patient.doctor || 'Кемайкин В. М.'} (${patient.hospital || 'ҰҒОО'})\nЖедел жәрдем: 103 | ҚР Жедел желісі: +7 (747) 342-31-54 | СК-Фармация: 1439`
      : locale === 'en'
      ? `EMERGENCY MEDICAL CARD (KZ / GOBMP):\nPatient: ${patient.fullName}\nDiagnosis: Hemophilia ${patient.hemophiliaType} (${patient.severity === 'severe' ? 'Severe' : 'Moderate'}, <1% factor)\nBlood Group: ${patient.bloodType}\nInhibitor: ${patient.inhibitor ? 'POSITIVE' : 'Negative'}\nRequired Factor: ${patient.factorProduct || 'Factor VIII'}\nSingle Dose: ${patient.workingDose}\nHematologist: ${patient.doctor || 'Dr. Kemaykin V. M.'} (${patient.hospital || 'NNOC'})\nAmbulance: 103 | KZ Hotline: +7 (747) 342-31-54 | SK-Pharmacy: 1439`
      : `ЭКСТРЕННАЯ МЕДИЦИНСКАЯ КАРТА (РК / ГОБМП):\nПациент: ${patient.fullName}\nДиагноз: Гемофилия ${patient.hemophiliaType} (${patient.severity === 'severe' ? 'Тяжёлая' : 'Средняя'} форма, <1% фактора)\nГруппа крови: ${patient.bloodType}\nИнгибитор: ${patient.inhibitor ? 'ПОЛОЖИТЕЛЬНЫЙ' : 'Отрицательный'}\nНеобходимый препарат: ${patient.factorProduct || 'Фактор VIII'}\nРазовая доза: ${patient.workingDose}\nЛечащий гематолог: ${patient.doctor || 'Кемайкин В. М.'} (${patient.hospital || 'ННОЦ'})\nЭкстренная скорая: 103 | Горячая линия РК: +7 (747) 342-31-54 | СК-Фармация: 1439`;
    
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const LOCALES: { code: Locale; label: string }[] = [
    { code: 'ru', label: 'RU' },
    { code: 'kk', label: 'KZ' },
    { code: 'en', label: 'EN' },
  ];

  const dateLocaleCode = locale === 'kk' ? 'kk-KZ' : locale === 'en' ? 'en-US' : 'ru-RU';

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#141413] antialiased selection:bg-[#D95D39]/15 selection:text-[#141413]">

      {/* ============================================================
          1. MINIMALIST STICKY NAVBAR (Neko Health Style)
          ============================================================ */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#FAF9F6]/90 border-b border-[#E5E4DF] transition-all">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between gap-6">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 no-underline group">
            <div className="w-8 h-8 rounded-full bg-[#1E2923] flex items-center justify-center text-[#FAF9F6] transition-transform group-hover:scale-105">
              <Droplet size={15} className="text-[#D95D39] fill-[#D95D39]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg tracking-tight text-[#141413]">HAEMOHELP</span>
              <span className="text-[11px] font-semibold text-[#6E6D68] uppercase tracking-[0.1em] hidden sm:inline">Clinical</span>
            </div>
          </Link>

          {/* Centered Minimalist Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#infusion-tracker" className="text-[14px] font-medium text-[#6E6D68] hover:text-[#141413] transition-colors">
              {t('nav_tracker')}
            </a>
            <a href="#emergency-card" className="text-[14px] font-medium text-[#6E6D68] hover:text-[#141413] transition-colors">
              {t('nav_emergency_card')}
            </a>
            <Link href="/wiki" className="text-[14px] font-medium text-[#6E6D68] hover:text-[#141413] transition-colors">
              {t('nav_knowledge')}
            </Link>
            <Link href="/map" className="text-[14px] font-medium text-[#6E6D68] hover:text-[#141413] transition-colors">
              {t('nav_centers')}
            </Link>
            <Link href="/quiz" className="text-[14px] font-medium text-[#6E6D68] hover:text-[#141413] transition-colors flex items-center gap-1.5">
              <span>{t('nav_quiz')}</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-[#D95D39]/10 text-[#D95D39]">New</span>
            </Link>
          </nav>

          {/* Right Action Suite: Language Switcher & Pill CTA */}
          <div className="flex items-center gap-3">
            {/* Minimal Language Switcher */}
            <div className="flex items-center p-1 rounded-full bg-[#F0EFEA] border border-[#E5E4DF] text-xs font-semibold">
              {LOCALES.map((loc) => (
                <button
                  key={loc.code}
                  id={`lang-btn-${loc.code}`}
                  onClick={() => setLocale(loc.code)}
                  className={`px-2.5 py-1 rounded-full transition-all ${
                    locale === loc.code
                      ? 'bg-[#FFFFFF] text-[#141413] shadow-xs'
                      : 'text-[#6E6D68] hover:text-[#141413]'
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>

            {/* Emergency Medical ID Pill Button */}
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D95D39]/30 bg-[#FDF5F2] text-[#D95D39] text-xs font-bold tracking-wide hover:bg-[#D95D39] hover:text-white transition-all"
            >
              <CreditCard size={13} />
              <span>{t('nav_emergency_id')}</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#141413] text-[#FAF9F6] text-xs md:text-sm font-semibold tracking-tight hover:bg-[#2A2A28] hover:-translate-y-0.5 transition-all shadow-sm"
            >
              <Syringe size={14} className="text-[#D95D39]" />
              <span>{t('nav_log_infusion')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Success Toast */}
      {logSuccessToast && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#FFFFFF] border border-[#2A5A44]/30 shadow-lg animate-in slide-in-from-top-4 duration-300">
          <div className="w-6 h-6 rounded-full bg-[#EFF6F2] flex items-center justify-center text-[#2A5A44]">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-[#141413]">
              {locale === 'kk' ? 'Инъекция тіркелді' : locale === 'en' ? 'Infusion Recorded' : 'Инъекция зафиксирована'}
            </div>
            <div className="text-[11px] text-[#6E6D68]">
              {locale === 'kk' ? 'ТМККК профилімен синхрондалды' : locale === 'en' ? 'Synced with clinical GOBMP profile' : 'Синхронизировано с клиническим профилем ГОБМП'}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          2. HERO SECTION (Neko Scandinavian Clinical Style)
          ============================================================ */}
      <section className="pt-20 pb-24 md:pt-28 md:pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Eyebrow Micro-label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F0EFEA] border border-[#E5E4DF] text-[#6E6D68] text-xs font-semibold tracking-[0.08em] uppercase mb-8">
            <span className="w-2 h-2 rounded-full bg-[#D95D39] animate-pulse" />
            <span>{t('hero_badge')}</span>
          </div>

          {/* Large Hero Headline with Tight Tracking */}
          <h1 className="hero-headline mb-6 text-[#141413]">
            {t('hero_headline_1')}<br className="hidden sm:inline" /> {t('hero_headline_2')}
          </h1>

          {/* Calm, Authoritative Subheadline */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-[#6E6D68] font-normal leading-relaxed mb-10">
            {t('hero_subheadline')}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#141413] text-[#FAF9F6] text-sm font-semibold tracking-tight hover:bg-[#2A2A28] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Syringe size={16} className="text-[#D95D39]" />
              <span>{t('hero_cta_log')}</span>
            </button>
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#FFFFFF] border border-[#E5E4DF] text-[#141413] text-sm font-semibold tracking-tight hover:border-[#141413] hover:bg-[#F0EFEA] transition-all flex items-center justify-center gap-2"
            >
              <span>{t('hero_cta_emergency')}</span>
              <ChevronRight size={15} className="text-[#6E6D68]" />
            </button>
          </div>

          {/* 3-Column Summary Bar (Iconic Neko Health Component) */}
          <div className="summary-bar text-left shadow-xs">
            {/* Column 1 */}
            <div className="summary-col">
              <div>
                <span className="text-xs font-mono font-semibold tracking-[0.08em] text-[#6E6D68] uppercase block mb-3">
                  {t('sum_col1_eyebrow')}
                </span>
                <h3 className="text-base font-bold text-[#141413] tracking-tight mb-2">
                  {t('sum_col1_title')}
                </h3>
                <p className="text-xs sm:text-sm text-[#6E6D68] leading-relaxed">
                  {t('sum_col1_desc')}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#141413]">
                <span>{t('sum_col1_tag1')}</span>
                <span className="text-[#98968F]">•</span>
                <span className="text-[#2A5A44]">{t('sum_col1_tag2')}</span>
              </div>
            </div>

            {/* Column 2 */}
            <div className="summary-col">
              <div>
                <span className="text-xs font-mono font-semibold tracking-[0.08em] text-[#6E6D68] uppercase block mb-3">
                  {t('sum_col2_eyebrow')}
                </span>
                <h3 className="text-base font-bold text-[#141413] tracking-tight mb-2">
                  {t('sum_col2_title')}
                </h3>
                <p className="text-xs sm:text-sm text-[#6E6D68] leading-relaxed">
                  {t('sum_col2_desc')}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#141413]">
                <span>{t('sum_col2_tag1')}</span>
                <span className="text-[#98968F]">•</span>
                <span>{t('sum_col2_tag2')}</span>
              </div>
            </div>

            {/* Column 3 */}
            <div className="summary-col">
              <div>
                <span className="text-xs font-mono font-semibold tracking-[0.08em] text-[#D95D39] uppercase block mb-3">
                  {t('sum_col3_eyebrow')}
                </span>
                <h3 className="text-base font-bold text-[#141413] tracking-tight mb-2">
                  {t('sum_col3_title')}
                </h3>
                <p className="text-xs sm:text-sm text-[#6E6D68] leading-relaxed">
                  {t('sum_col3_desc')}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#D95D39]">
                <span>{t('sum_col3_tag1')}</span>
                <span className="text-[#98968F]">•</span>
                <span>{t('sum_col3_tag2')}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================
          3. INTERACTIVE FEATURE STEPPER (01 / 03 Style)
          ============================================================ */}
      <section className="py-20 bg-[#F0EFEA]/60 border-y border-[#E5E4DF] px-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="eyebrow block mb-3">{t('stepper_eyebrow')}</span>
            <h2 className="section-headline mb-4">{t('stepper_headline')}</h2>
            <p className="text-[#6E6D68] text-sm sm:text-base">
              {t('stepper_subheadline')}
            </p>
          </div>

          {/* Stepper Buttons (01 / 02 / 03) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {/* Step 1 */}
            <button
              onClick={() => setActiveStep(1)}
              className={`stepper-btn ${activeStep === 1 ? 'active' : ''}`}
            >
              <span className="step-num font-mono text-sm font-bold">01</span>
              <div>
                <div className="text-sm font-bold tracking-tight">{t('step1_title')}</div>
                <div className="text-xs text-[#6E6D68] mt-0.5">{t('step1_sub')}</div>
              </div>
            </button>

            {/* Step 2 */}
            <button
              onClick={() => setActiveStep(2)}
              className={`stepper-btn ${activeStep === 2 ? 'active' : ''}`}
            >
              <span className="step-num font-mono text-sm font-bold">02</span>
              <div>
                <div className="text-sm font-bold tracking-tight">{t('step2_title')}</div>
                <div className="text-xs text-[#6E6D68] mt-0.5">{t('step2_sub')}</div>
              </div>
            </button>

            {/* Step 3 */}
            <button
              onClick={() => setActiveStep(3)}
              className={`stepper-btn ${activeStep === 3 ? 'active' : ''}`}
            >
              <span className="step-num font-mono text-sm font-bold">03</span>
              <div>
                <div className="text-sm font-bold tracking-tight">{t('step3_title')}</div>
                <div className="text-xs text-[#6E6D68] mt-0.5">{t('step3_sub')}</div>
              </div>
            </button>
          </div>

          {/* Stepper Active View Card */}
          <div className="card-clinical p-8 md:p-12">
            {activeStep === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5">
                  <span className="eyebrow-accent block mb-2">{t('step1_badge')}</span>
                  <h3 className="text-2xl font-bold tracking-tight text-[#141413] mb-4">
                    {t('step1_heading')}
                  </h3>
                  <p className="text-[#6E6D68] text-sm leading-relaxed mb-6">
                    {t('step1_desc')}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs font-medium text-[#141413]">
                      <CheckCircle2 size={16} className="text-[#2A5A44]" />
                      <span>{t('step1_point1')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-[#141413]">
                      <CheckCircle2 size={16} className="text-[#2A5A44]" />
                      <span>{t('step1_point2')}</span>
                    </div>
                  </div>
                  <div className="mt-8">
                    <button
                      onClick={() => setIsLogModalOpen(true)}
                      className="btn-pill btn-pill-primary text-xs"
                    >
                      <span>{t('step1_btn')}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#F0EFEA] rounded-2xl p-6 border border-[#E5E4DF]">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E4DF]">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#6E6D68]">
                      {locale === 'kk' ? 'Белсенді емделуші картасы' : locale === 'en' ? 'Active Patient Record' : 'Активная карта пациента'}
                    </div>
                    <span className="badge badge-primary">
                      {patient.severity === 'severe' ? (locale === 'kk' ? 'Ауыр A (ТМККК)' : locale === 'en' ? 'Severe A (GOBMP)' : 'Тяжёлая A (ГОБМП)') : 'Moderate A'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E4DF]">
                      <div className="text-[11px] text-[#6E6D68] uppercase font-mono">{t('em_label_patient')}</div>
                      <div className="text-sm font-bold text-[#141413] mt-1">{patient.fullName}</div>
                      <div className="text-xs text-[#6E6D68] mt-0.5">
                        {locale === 'kk' ? `Салмағы: ${patient.weight || 28} кг` : locale === 'en' ? `Weight: ${patient.weight || 28} kg` : `Вес: ${patient.weight || 28} кг`}
                      </div>
                    </div>
                    <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E4DF]">
                      <div className="text-[11px] text-[#6E6D68] uppercase font-mono">{locale === 'kk' ? 'Тағайындау' : locale === 'en' ? 'Prescription' : 'Назначение'}</div>
                      <div className="text-sm font-bold text-[#D95D39] mt-1">{patient.workingDose}</div>
                      <div className="text-xs text-[#6E6D68] mt-0.5">{patient.factorProduct}</div>
                    </div>
                  </div>
                  <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E4DF] flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-[#6E6D68] uppercase font-mono">{locale === 'kk' ? 'Қабылдау тұрақтылығы' : locale === 'en' ? 'Recent Adherence' : 'Приверженность'}</div>
                      <div className="text-xs font-semibold text-[#141413] mt-1">
                        {weeklyInjections} {locale === 'kk' ? 'инъекция соңғы 7 күнде' : locale === 'en' ? 'infusions in last 7 days' : 'инъекции за последние 7 дней'}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#2A5A44] bg-[#EFF6F2] px-3 py-1 rounded-full">
                      {locale === 'kk' ? '✓ Профилактика белсенді' : locale === 'en' ? '✓ Prophylaxis Active' : '✓ Профилактика активна'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5">
                  <span className="eyebrow block mb-2">{t('step2_badge')}</span>
                  <h3 className="text-2xl font-bold tracking-tight text-[#141413] mb-4">
                    {t('step2_heading')}
                  </h3>
                  <p className="text-[#6E6D68] text-sm leading-relaxed mb-6">
                    {t('step2_desc')}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs font-medium text-[#141413]">
                      <CheckCircle2 size={16} className="text-[#2A5A44]" />
                      <span>{t('step2_point1')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-[#141413]">
                      <CheckCircle2 size={16} className="text-[#2A5A44]" />
                      <span>{t('step2_point2')}</span>
                    </div>
                  </div>
                  <div className="mt-8">
                    <button
                      onClick={() => setIsMonthlyModalOpen(true)}
                      className="btn-pill btn-pill-outline text-xs"
                    >
                      <span>{t('step2_btn')}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#F0EFEA] rounded-2xl p-6 border border-[#E5E4DF]">
                  <div className="grid grid-cols-3 gap-3 text-center mb-4">
                    <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E4DF]">
                      <div className="text-2xl font-bold text-[#141413]">{weeklyInjections}</div>
                      <div className="text-[11px] text-[#6E6D68] mt-1">
                        {locale === 'kk' ? 'Инъекция / 7 күн' : locale === 'en' ? 'Infusions / 7 days' : 'Инъекции / 7 дн'}
                      </div>
                    </div>
                    <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E4DF]">
                      <div className="text-2xl font-bold text-[#D95D39]">{monthlyInjections}</div>
                      <div className="text-[11px] text-[#6E6D68] mt-1">
                        {locale === 'kk' ? 'Осы айда' : locale === 'en' ? 'This month' : 'В этом месяце'}
                      </div>
                    </div>
                    <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E4DF]">
                      <div className="text-2xl font-bold text-[#2A5A44]">99.4%</div>
                      <div className="text-[11px] text-[#6E6D68] mt-1">
                        {locale === 'kk' ? 'Қорғаныс индексі' : locale === 'en' ? 'Adherence index' : 'Индекс защиты'}
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E4DF] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#141413]">
                        {locale === 'kk' ? 'Келесі жоспарлы қабылдау:' : locale === 'en' ? 'Next clinical appointment:' : 'Следующий плановый визит:'}
                      </div>
                      <div className="text-[#6E6D68] mt-0.5">{patient.hospital} ({patient.doctor})</div>
                    </div>
                    <Link href="/calendar" className="text-[#141413] font-semibold underline">
                      {t('chron_full_cal')} →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5">
                  <span className="eyebrow-accent block mb-2">{t('step3_badge')}</span>
                  <h3 className="text-2xl font-bold tracking-tight text-[#141413] mb-4">
                    {t('step3_heading')}
                  </h3>
                  <p className="text-[#6E6D68] text-sm leading-relaxed mb-6">
                    {t('step3_desc')}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs font-medium text-[#141413]">
                      <CheckCircle2 size={16} className="text-[#D95D39]" />
                      <span>{t('step3_point1')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-[#141413]">
                      <CheckCircle2 size={16} className="text-[#D95D39]" />
                      <span>{t('step3_point2')}</span>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      onClick={() => setSosOpen(true)}
                      className="btn-pill btn-pill-accent text-xs"
                    >
                      <AlertTriangle size={14} />
                      <span>{t('step3_btn_rice')}</span>
                    </button>
                    <button
                      onClick={() => setIsEmergencyModalOpen(true)}
                      className="btn-pill btn-pill-outline text-xs"
                    >
                      <span>{t('step3_btn_fullscreen')}</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#141413] text-[#FAF9F6] rounded-2xl p-6 border border-white/10 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <span className="text-[11px] font-mono tracking-widest text-[#D95D39] uppercase">{t('em_card_eyebrow')}</span>
                    <span className="text-xs font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-full">
                      {locale === 'kk' ? 'ТМККК ҚР' : locale === 'en' ? 'GOBMP KZ' : 'ГОБМП РК'}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="text-base font-bold">{patient.fullName}</div>
                    <div className="text-xs text-[#FAF9F6]/70">
                      {t('em_label_hemo')} {patient.hemophiliaType} · {t('em_label_severe')} · {t('em_label_blood')}: {patient.bloodType}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs mb-4">
                    <div className="text-[#D95D39] font-bold">⚠️ {t('em_inst_title')}:</div>
                    <div className="text-[#FAF9F6]/80 mt-1">
                      {t('em_inst_body')} <strong>{patient.factorProduct} ({patient.workingDose})</strong>.
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#FAF9F6]/60 pt-2 border-t border-white/10">
                    <span>{t('footer_assoc_phone')}</span>
                    <span className="font-mono text-white">{t('footer_sk_phone')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ============================================================
          4. INTERACTIVE PATIENT DASHBOARD PREVIEW
          ============================================================ */}
      <section id="infusion-tracker" className="py-24 px-6 max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="eyebrow block mb-2">{t('dash_eyebrow')}</span>
            <h2 className="section-headline">{t('dash_headline')}</h2>
            <p className="text-[#6E6D68] text-sm sm:text-base mt-2">
              {t('dash_subheadline')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="btn-pill btn-pill-primary text-xs"
            >
              <Syringe size={14} className="text-[#D95D39]" />
              <span>{t('dash_btn_log')}</span>
            </button>
            <button
              onClick={() => setIsMonthlyModalOpen(true)}
              className="btn-pill btn-pill-secondary text-xs"
            >
              <span>{t('dash_btn_monthly')}</span>
            </button>
          </div>
        </div>

        {/* Bento Grid Layout (Biomarkers & Chronological History) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Quick Infusion Input Card (Span 5) */}
          <div className="lg:col-span-5 card-clinical flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E5E4DF]">
                <div>
                  <h3 className="text-lg font-bold text-[#141413]">{t('form_title')}</h3>
                  <p className="text-xs text-[#6E6D68]">{t('form_subtitle')}</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#2A5A44]" />
              </div>

              <form onSubmit={handleLogInfusionSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6E6D68] mb-1.5 uppercase font-mono">
                    {t('form_factor_label')}
                  </label>
                  <select
                    value={formFactor}
                    onChange={(e) => setFormFactor(e.target.value)}
                    className="clinical-select text-sm"
                  >
                    <option value="Октанат (Фактор VIII)">Октанат (Фактор VIII / Octanate)</option>
                    <option value="Фактан (Фактор VIII)">Фактан (Фактор VIII / Factane)</option>
                    <option value="Элоктат (FVIII пролонгированный)">Элоктат (FVIII / Elocta)</option>
                    <option value="Бенефикс (Фактор IX)">Бенефикс (Фактор IX / Benefix)</option>
                    <option value="Гемлибра (Эмицизумаб)">Гемлибра (Эмицизумаб / Hemlibra)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#6E6D68] mb-1.5 uppercase font-mono">
                      {t('form_dose_label')}
                    </label>
                    <input
                      type="number"
                      step="250"
                      value={formDose}
                      onChange={(e) => setFormDose(e.target.value)}
                      className="clinical-input text-sm"
                      placeholder="2000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6E6D68] mb-1.5 uppercase font-mono">
                      {t('form_batch_label')}
                    </label>
                    <input
                      type="text"
                      value={formBatch}
                      onChange={(e) => setFormBatch(e.target.value)}
                      className="clinical-input text-sm"
                      placeholder="KZ-9921"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6E6D68] mb-1.5 uppercase font-mono">
                    {t('form_reason_label')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'prophylaxis', label: t('form_reason_proph') },
                      { id: 'bleed', label: t('form_reason_bleed') },
                      { id: 'activity', label: t('form_reason_sport') },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFormType(item.id as any)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all ${
                          formType === item.id
                            ? 'bg-[#141413] text-white border-[#141413]'
                            : 'bg-white text-[#6E6D68] border-[#E5E4DF] hover:border-[#141413]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6E6D68] mb-1.5 uppercase font-mono">
                    {t('form_notes_label')}
                  </label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="clinical-input text-sm"
                    placeholder={t('form_notes_placeholder')}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-pill btn-pill-primary text-sm py-3 mt-2"
                >
                  <Syringe size={15} className="text-[#D95D39]" />
                  <span>{t('form_submit_btn')}</span>
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E4DF] flex items-center justify-between text-xs text-[#6E6D68]">
              <span>{t('form_gobmp_coverage')}</span>
              <span className="font-mono text-[#141413]">{t('form_coverage_100')}</span>
            </div>
          </div>

          {/* Right Column: Chronological History Stream (Span 7) */}
          <div className="lg:col-span-7 card-clinical flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E5E4DF]">
                <div>
                  <h3 className="text-lg font-bold text-[#141413]">{t('chron_title')}</h3>
                  <p className="text-xs text-[#6E6D68]">{t('chron_subtitle')}</p>
                </div>
                <Link href="/calendar" className="text-xs font-semibold text-[#141413] hover:underline flex items-center gap-1">
                  <span>{t('chron_full_cal')}</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>

              {injectionHistory.length === 0 ? (
                <div className="text-center py-12 text-[#6E6D68]">
                  <Syringe size={32} className="mx-auto mb-3 text-[#98968F]" />
                  <p className="text-sm font-medium">{t('chron_empty_title')}</p>
                  <p className="text-xs text-[#98968F] mt-1">{t('chron_empty_desc')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {injectionHistory.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-[#F0EFEA]/70 border border-[#E5E4DF] flex items-center justify-between gap-4 hover:bg-[#F0EFEA] transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#E5E4DF] flex items-center justify-center text-[#2A5A44] shrink-0 font-mono text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#141413]">
                            {item.notes || t('form_reason_proph')}
                          </div>
                          <div className="text-[11px] text-[#6E6D68] flex items-center gap-2 mt-0.5">
                            <span>{new Date(item.date).toLocaleDateString(dateLocaleCode, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            {item.time && <span>• {item.time}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="badge badge-primary text-[11px]">
                          {t('chron_status_injected')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E4DF] flex items-center justify-between">
              <div className="text-xs text-[#6E6D68]">
                {t('chron_month_balance')} <strong className="text-[#141413]">{monthlyInjections} {t('chron_injections_count')}</strong> (~{monthlyInjections * 2000} {locale === 'kk' ? 'ХБ' : locale === 'en' ? 'IU' : 'МЕ'})
              </div>
              <button
                onClick={() => setIsMonthlyModalOpen(true)}
                className="text-xs font-semibold text-[#D95D39] hover:underline"
              >
                {t('chron_download_report')}
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* ============================================================
          5. EMERGENCY MEDICAL CARD SECTION (Neko High Contrast)
          ============================================================ */}
      <section id="emergency-card" className="py-20 bg-[#F0EFEA]/80 border-t border-[#E5E4DF] px-6">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="eyebrow-accent block mb-2">{t('em_badge')}</span>
            <h2 className="section-headline">{t('em_headline')}</h2>
            <p className="text-[#6E6D68] text-sm mt-2">
              {t('em_subheadline')}
            </p>
          </div>

          {/* The High-Contrast Emergency Card */}
          <div className="emergency-card-clinical">
            
            {/* Header / Eyebrow */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D95D39] flex items-center justify-center text-white font-bold text-sm">
                  !
                </div>
                <div>
                  <span className="text-xs font-mono tracking-widest text-[#D95D39] uppercase block">
                    {t('em_card_eyebrow')}
                  </span>
                  <span className="text-xs text-[#FAF9F6]/60">{t('em_card_sub')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyEmergencyCard}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all flex items-center gap-1.5"
                >
                  <Copy size={13} />
                  <span>{copySuccess ? t('em_btn_copied') : t('em_btn_copy')}</span>
                </button>
                <button
                  onClick={() => setIsEmergencyModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all flex items-center gap-1.5"
                >
                  <Maximize2 size={13} />
                  <span>{t('em_btn_fullscreen')}</span>
                </button>
              </div>
            </div>

            {/* Patient Name & Core Diagnosis */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
              <div className="md:col-span-7">
                <div className="text-xs uppercase font-mono tracking-wider text-[#FAF9F6]/50 mb-1">{t('em_label_patient')}</div>
                <div className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
                  {patient.fullName}
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D95D39]/20 text-[#D95D39] text-xs font-bold border border-[#D95D39]/40">
                  <span>{t('em_label_hemo')} {patient.hemophiliaType} — {patient.severity === 'severe' ? t('em_label_severe') : t('em_label_moderate')}</span>
                </div>
              </div>

              <div className="md:col-span-5 grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                  <div className="text-[10px] font-mono uppercase text-[#FAF9F6]/50">{t('em_label_blood')}</div>
                  <div className="text-lg font-bold text-white mt-1">{patient.bloodType}</div>
                </div>
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                  <div className="text-[10px] font-mono uppercase text-[#FAF9F6]/50">{t('em_label_inhibitor')}</div>
                  <div className="text-lg font-bold text-[#2A5A44] mt-1">{patient.inhibitor ? t('em_inhibitor_pos') : t('em_inhibitor_neg')}</div>
                </div>
              </div>
            </div>

            {/* Critical Medication Guidance */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-8 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#D95D39] uppercase tracking-wider">
                <AlertTriangle size={15} />
                <span>{t('em_inst_title')}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#FAF9F6]/90 leading-relaxed">
                {t('em_inst_body')} <strong>{patient.factorProduct}</strong> ({patient.workingDose}).
              </p>
            </div>

            {/* Emergency Contacts Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs">
              <div>
                <span className="text-[#FAF9F6]/50 block mb-1">{t('em_label_doctor')}</span>
                <span className="text-white font-semibold">{patient.doctor || 'Кемайкин В. М.'}</span>
                <span className="text-[#FAF9F6]/60 block text-[11px]">{patient.hospital || 'ННОЦ (г. Астана)'}</span>
              </div>
              <div>
                <span className="text-[#FAF9F6]/50 block mb-1">{t('em_label_assoc')}</span>
                <span className="text-white font-semibold">+7 (747) 342-31-54</span>
                <span className="text-[#FAF9F6]/60 block text-[11px]">hemophilya.kz (Яблочкова 1)</span>
              </div>
              <div>
                <span className="text-[#FAF9F6]/50 block mb-1">{t('em_label_sk')}</span>
                <span className="text-[#D95D39] font-bold text-sm">{t('em_sk_tollfree')}</span>
                <span className="text-[#FAF9F6]/60 block text-[11px]">{t('em_sk_desc')}</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================
          6. CALM EDITORIAL FOOTER (Neko Health Multi-Column Style)
          ============================================================ */}
      <footer className="bg-[#FAF9F6] border-t border-[#E5E4DF] pt-16 pb-14 px-6 text-[#6E6D68]">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#E5E4DF]">
            
            {/* Col 1: Brand & Philosophy */}
            <div className="md:col-span-4">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-full bg-[#1E2923] flex items-center justify-center text-white">
                  <Droplet size={13} className="text-[#D95D39] fill-[#D95D39]" />
                </div>
                <span className="font-bold text-base text-[#141413] tracking-tight">HAEMOHELP CLINICAL</span>
              </div>
              <p className="text-xs leading-relaxed max-w-sm mb-6">
                {t('footer_desc')}
              </p>
              <div className="text-[11px] text-[#98968F]">
                {t('footer_moh')}
              </div>
            </div>

            {/* Col 2: Platform Links */}
            <div className="md:col-span-2 text-xs space-y-3">
              <div className="font-bold text-[#141413] uppercase tracking-wider font-mono mb-4">{t('footer_col_platform')}</div>
              <div><a href="#infusion-tracker" className="hover:text-[#141413] transition-colors">{t('nav_tracker')}</a></div>
              <div><a href="#emergency-card" className="hover:text-[#141413] transition-colors">{t('nav_emergency_card')}</a></div>
              <div><Link href="/calendar" className="hover:text-[#141413] transition-colors">{t('nav_calendar')}</Link></div>
              <div><button onClick={() => setIsMonthlyModalOpen(true)} className="hover:text-[#141413] transition-colors">{t('dash_btn_monthly')}</button></div>
            </div>

            {/* Col 3: Resources & Wiki */}
            <div className="md:col-span-3 text-xs space-y-3">
              <div className="font-bold text-[#141413] uppercase tracking-wider font-mono mb-4">{t('footer_col_context')}</div>
              <div><Link href="/wiki" className="hover:text-[#141413] transition-colors">{t('footer_gobmp_link')}</Link></div>
              <div><Link href="/map" className="hover:text-[#141413] transition-colors">{t('footer_centers_link')}</Link></div>
              <div><Link href="/quiz" className="hover:text-[#141413] transition-colors">{t('footer_quiz_link')}</Link></div>
              <div><a href="https://hemophilya.kz" target="_blank" rel="noreferrer" className="hover:text-[#141413] transition-colors flex items-center gap-1">
                <span>{t('footer_assoc_link')}</span>
                <ArrowUpRight size={12} />
              </a></div>
            </div>

            {/* Col 4: Hotlines & Emergency */}
            <div className="md:col-span-3 text-xs space-y-3">
              <div className="font-bold text-[#141413] uppercase tracking-wider font-mono mb-4">{t('footer_col_hotlines')}</div>
              <div className="text-[#D95D39] font-bold">{t('footer_amb_phone')}</div>
              <div className="text-[#141413] font-semibold">{t('footer_sk_phone')}</div>
              <div>{t('footer_assoc_phone')}</div>
              <div className="text-[11px] text-[#98968F] pt-2">
                {t('footer_address')}
              </div>
            </div>

          </div>

          {/* Bottom Bar & Medical Disclaimer */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#98968F]">
            <div>
              © {new Date().getFullYear()} HaemoHelp KZ · {t('footer_copyright')}
            </div>
            <div className="text-center md:text-right max-w-xl">
              {t('footer_disclaimer')}
            </div>
          </div>

        </div>
      </footer>

      {/* ============================================================
          7. MODALS: INFUSION LOG MODAL
          ============================================================ */}
      {isLogModalOpen && (
        <div className="clinical-modal-overlay" onClick={() => setIsLogModalOpen(false)}>
          <div className="clinical-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E5E4DF]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#141413] flex items-center justify-center text-white">
                  <Syringe size={15} className="text-[#D95D39]" />
                </div>
                <h3 className="text-lg font-bold text-[#141413]">{t('form_title')}</h3>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F0EFEA] flex items-center justify-center text-[#6E6D68]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogInfusionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6E6D68] mb-1 uppercase font-mono">
                  {t('form_factor_label')}
                </label>
                <select
                  value={formFactor}
                  onChange={(e) => setFormFactor(e.target.value)}
                  className="clinical-select text-sm"
                >
                  <option value="Октанат (Фактор VIII)">Октанат (Фактор VIII / Octanate)</option>
                  <option value="Фактан (Фактор VIII)">Фактан (Фактор VIII / Factane)</option>
                  <option value="Элоктат (FVIII пролонгированный)">Элоктат (FVIII / Elocta)</option>
                  <option value="Бенефикс (Фактор IX)">Бенефикс (Фактор IX / Benefix)</option>
                  <option value="Гемлибра (Эмицизумаб)">Гемлибра (Эмицизумаб / Hemlibra)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6E6D68] mb-1 uppercase font-mono">
                    {t('form_dose_label')}
                  </label>
                  <input
                    type="number"
                    step="250"
                    value={formDose}
                    onChange={(e) => setFormDose(e.target.value)}
                    className="clinical-input text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6E6D68] mb-1 uppercase font-mono">
                    {t('form_batch_label')}
                  </label>
                  <input
                    type="text"
                    value={formBatch}
                    onChange={(e) => setFormBatch(e.target.value)}
                    className="clinical-input text-sm"
                    placeholder="KZ-8842-OCT"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6E6D68] mb-1 uppercase font-mono">
                  {t('form_reason_label')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'prophylaxis', label: t('form_reason_proph') },
                    { id: 'bleed', label: t('form_reason_bleed') },
                    { id: 'activity', label: t('form_reason_sport') },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormType(item.id as any)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all ${
                        formType === item.id
                          ? 'bg-[#141413] text-white border-[#141413]'
                          : 'bg-white text-[#6E6D68] border-[#E5E4DF]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6E6D68] mb-1 uppercase font-mono">
                  {t('form_notes_label')}
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="clinical-input text-sm"
                  placeholder={t('form_notes_placeholder')}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="flex-1 btn-pill btn-pill-outline text-xs"
                >
                  {locale === 'kk' ? 'Болдырмау' : locale === 'en' ? 'Cancel' : 'Отмена'}
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-pill btn-pill-primary text-xs"
                >
                  {locale === 'kk' ? 'Растау және сақтау' : locale === 'en' ? 'Confirm & Save' : 'Подтвердить и сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          8. MODALS: FULLSCREEN EMERGENCY ID MODAL
          ============================================================ */}
      {isEmergencyModalOpen && (
        <div className="clinical-modal-overlay" onClick={() => setIsEmergencyModalOpen(false)}>
          <div
            className="clinical-modal-card bg-[#141413] text-white border-white/20 max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#D95D39] animate-ping" />
                <span className="text-xs font-mono tracking-widest text-[#D95D39] uppercase font-bold">
                  {t('em_card_eyebrow')}
                </span>
              </div>
              <button
                onClick={() => setIsEmergencyModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-6">
              <div className="text-[11px] font-mono uppercase text-white/50 mb-1">{t('em_label_patient')}</div>
              <div className="text-2xl font-bold text-white mb-2">{patient.fullName}</div>
              <div className="text-sm text-[#D95D39] font-bold">
                {t('em_label_hemo')} {patient.hemophiliaType} — {patient.severity === 'severe' ? t('em_label_severe') : t('em_label_moderate')}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="text-[10px] text-white/50 font-mono uppercase">{t('em_label_blood')}</div>
                <div className="text-base font-bold text-white mt-0.5">{patient.bloodType}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="text-[10px] text-white/50 font-mono uppercase">{t('em_label_inhibitor')}</div>
                <div className="text-base font-bold text-[#2A5A44] mt-0.5">{patient.inhibitor ? t('em_inhibitor_pos') : t('em_inhibitor_neg')}</div>
              </div>
            </div>

            <div className="p-4 bg-[#D95D39]/15 border border-[#D95D39]/40 rounded-xl mb-6">
              <div className="text-xs font-bold text-[#D95D39] uppercase mb-1">⚠️ {t('em_inst_title')}:</div>
              <div className="text-xs text-white/90 leading-relaxed">
                {t('em_inst_body')} <strong>{patient.factorProduct} ({patient.workingDose})</strong>.
              </div>
            </div>

            <div className="space-y-2 text-xs text-white/70 mb-6">
              <div>{t('em_label_doctor')} <strong>{patient.doctor || 'Кемайкин В. М.'}</strong> ({patient.hospital || 'ННОЦ'})</div>
              <div>{t('em_label_assoc')} <strong>+7 (747) 342-31-54</strong> (hemophilya.kz)</div>
              <div>{t('footer_amb_phone')} | {t('footer_sk_phone')}</div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopyEmergencyCard}
                className="flex-1 btn-pill btn-pill-outline text-xs text-white border-white/20 hover:bg-white/10"
              >
                <Copy size={13} />
                <span>{copySuccess ? t('em_btn_copied') : t('em_btn_copy')}</span>
              </button>
              <button
                onClick={() => setIsEmergencyModalOpen(false)}
                className="flex-1 btn-pill btn-pill-accent text-xs"
              >
                {locale === 'kk' ? 'Жабу' : locale === 'en' ? 'Close' : 'Закрыть'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          9. MODALS: MONTHLY ACCOUNTING MODAL
          ============================================================ */}
      {isMonthlyModalOpen && (
        <div className="clinical-modal-overlay" onClick={() => setIsMonthlyModalOpen(false)}>
          <div className="clinical-modal-card max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E5E4DF]">
              <div>
                <h3 className="text-lg font-bold text-[#141413]">
                  {locale === 'kk' ? 'Бір айлық есеп журналы' : locale === 'en' ? 'Monthly Accounting Log' : 'Журнал учета за месяц'}
                </h3>
                <p className="text-xs text-[#6E6D68]">
                  {locale === 'kk' ? 'СК-Фармация және ЭРДБ үшін клиникалық үзінді' : locale === 'en' ? 'Clinical extract for SK-Pharmacy & ERDB' : 'Клиническая выписка для СК-Фармация & ЭРДБ'}
                </p>
              </div>
              <button
                onClick={() => setIsMonthlyModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F0EFEA] flex items-center justify-center text-[#6E6D68]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm divide-y divide-[#E5E4DF] mb-6">
              <div className="flex justify-between py-2">
                <span className="text-[#6E6D68]">{locale === 'kk' ? 'Пациент:' : locale === 'en' ? 'Patient:' : 'Пациент:'}</span>
                <strong className="text-[#141413]">{patient.fullName}</strong>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#6E6D68]">{locale === 'kk' ? 'Препарат және дозасы:' : locale === 'en' ? 'Medication & Dose:' : 'Препарат & Доза:'}</span>
                <span className="text-[#141413]">{patient.factorProduct} ({patient.workingDose})</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#6E6D68]">
                  {locale === 'kk' ? 'Ағымдағы айдағы инъекциялар:' : locale === 'en' ? 'Infusions this month:' : 'Инъекций за текущий месяц:'}
                </span>
                <span className="text-lg font-bold text-[#D95D39] font-mono">{monthlyInjections}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#6E6D68]">
                  {locale === 'kk' ? 'Фактордың жиынтық шығыны:' : locale === 'en' ? 'Total factor consumed:' : 'Суммарный расход фактора:'}
                </span>
                <span className="font-bold text-[#2A5A44] font-mono">~{monthlyInjections * 2000} {locale === 'kk' ? 'ХБ' : locale === 'en' ? 'IU' : 'МЕ'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#6E6D68]">
                  {locale === 'kk' ? 'Қамтамасыз ету мәртебесі (ТМККК):' : locale === 'en' ? 'Coverage status (GOBMP):' : 'Статус обеспечения (ГОБМП):'}
                </span>
                <span className="text-xs font-bold text-[#2A5A44] bg-[#EFF6F2] px-2.5 py-0.5 rounded-full">
                  100% СК-Фармация
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[#F0EFEA] rounded-xl text-xs text-[#6E6D68] mb-6">
              💡 <strong>{locale === 'kk' ? 'Учаскелік гематолог үшін:' : locale === 'en' ? 'For your hematologist:' : 'Для участкового гематолога:'}</strong>{' '}
              {locale === 'kk' 
                ? 'Емханада тегін коагуляция факторына рецептті ұзарту үшін қабылдауда осы журналды көрсетіңіз.'
                : locale === 'en'
                ? 'Show this log during your clinical visit to renew your prescription for free clotting factor via polyclinic ERDB.'
                : 'покажите этот журнал на приеме для продления рецепта на бесплатный фактор коагуляции в поликлинике.'}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const text = `Клинический отчет HaemoHelp KZ:\nПациент: ${patient.fullName}\nПрепарат: ${patient.factorProduct}\nИнъекций в месяце: ${monthlyInjections}\nРасход: ~${monthlyInjections * 2000} МЕ\nДата выписки: ${new Date().toLocaleDateString(dateLocaleCode)}`;
                  navigator.clipboard.writeText(text);
                  alert(locale === 'kk' ? 'Есеп алмасу буферіне көшірілді!' : locale === 'en' ? 'Report copied to clipboard!' : 'Отчет скопирован в буфер обмена!');
                }}
                className="flex-1 btn-pill btn-pill-outline text-xs"
              >
                {t('em_btn_copy')}
              </button>
              <button
                onClick={() => setIsMonthlyModalOpen(false)}
                className="flex-1 btn-pill btn-pill-primary text-xs"
              >
                {locale === 'kk' ? 'Жабу' : locale === 'en' ? 'Close' : 'Закрыть'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
