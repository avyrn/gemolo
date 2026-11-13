'use client';
// ============================================================
// Home page — Dashboard with quick actions, today's events,
// stats, and motivational quote
// ============================================================

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useStore, PatientProfile } from '@/lib/store';
import { useAuth } from '@/lib/auth/AuthContext';
import { AlertTriangle, Syringe, CreditCard, BookOpen, Zap, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { t } = useLanguage();
  const { events, setSosOpen, addEvent } = useStore();
  const { account } = useAuth();
  const [injectionLogged, setInjectionLogged] = useState(false);
  const [monthlyAccountOpen, setMonthlyAccountOpen] = useState(false);

  // Fallback to empty if not loaded yet (though AppShell protects this route)
  const defaultPatient: PatientProfile = {
    fullName: '',
    dob: '',
    bloodType: '',
    hemophiliaType: 'A',
    severity: 'severe',
    inhibitor: false,
    workingDose: '2000 МЕ / 3 раза в неделю',
    factorProduct: 'Октанат (Фактор VIII)',
    doctor: '',
    hospital: '',
    weight: 70,
    contacts: [],
  };
  const patient = account?.patient || defaultPatient;


  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter((e) => e.date === todayStr);

  // Count injections in the last 7 days
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyInjections = events.filter(
    (e) => e.type === 'injection' && new Date(e.date) >= weekAgo
  ).length;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);
  const monthlyInjections = events.filter(
    (e) => e.type === 'injection' && new Date(e.date) >= startOfMonth
  ).length;
  const monthlyEventsCount = events.filter(
    (e) => new Date(e.date) >= startOfMonth
  ).length;

  // Next appointment
  const nextAppointment = events
    .filter((e) => e.type === 'appointment' && e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const handleQuickInjection = () => {
    addEvent({
      id: Date.now().toString(),
      date: todayStr,
      type: 'injection',
      time: new Date().toTimeString().slice(0, 5),
      notes: 'Профилактическая инъекция фактора VIII',
    });
    setInjectionLogged(true);
    setTimeout(() => setInjectionLogged(false), 2500);
  };

  const EVENT_TYPE_CONFIG = {
    injection:   { label: '💉 Инъекция',  color: 'var(--color-success)' },
    test:        { label: '🩸 Анализ',     color: 'var(--color-sos)' },
    appointment: { label: '👨‍⚕️ Приём',      color: 'var(--color-purple)' },
    pharmacy:    { label: '💊 Аптека',     color: 'var(--color-teal)' },
  };

  const QUICK_ACTIONS = [
    {
      id: 'qa-injection',
      icon: Syringe,
      label: t('home_add_injection'),
      color: 'var(--color-success)',
      bg: 'var(--color-success-light)',
      onClick: handleQuickInjection,
    },
    {
      id: 'qa-sos',
      icon: AlertTriangle,
      label: t('home_emergency'),
      color: 'var(--color-sos)',
      bg: 'var(--color-sos-light)',
      onClick: () => setSosOpen(true),
    },
    {
      id: 'qa-passport',
      icon: CreditCard,
      label: t('home_view_passport'),
      color: 'var(--color-primary)',
      bg: 'var(--color-primary-muted)',
      href: '/profile',
    },
    {
      id: 'qa-wiki',
      icon: BookOpen,
      label: t('home_open_wiki'),
      color: 'var(--color-purple)',
      bg: 'var(--color-purple-light)',
      href: '/wiki',
    },
    {
      id: 'qa-monthly',
      icon: TrendingUp,
      label: 'Учет за месяц',
      color: '#F59E0B',
      bg: '#FEF3C7',
      onClick: () => setMonthlyAccountOpen(true),
    },
    {
      id: 'qa-quiz',
      icon: Zap,
      label: 'Квиз',
      color: '#3B82F6',
      bg: '#DBEAFE',
      href: '/quiz',
    },
  ];

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>

      {/* ---- Greeting & Role Banner ---- */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h1 className="page-title" style={{ margin: 0 }}>
              {t('home_greeting')} {patient.role === 'caregiver' && patient.caregiverName ? patient.caregiverName.split(' ')[0] : patient.fullName.split(' ')[0]} 👋
            </h1>
            <span className="badge" style={{
              background: patient.role === 'caregiver' ? '#F0EBFF' : '#EBF4FF',
              color: patient.role === 'caregiver' ? '#7B5EA7' : '#2D7DD2',
              fontWeight: 700, fontSize: '0.75rem', padding: '4px 8px'
            }}>
              {patient.role === 'caregiver' ? `🛡️ Опекун (Подопечный: ${patient.fullName})` : '👤 Пациент'}
            </span>
          </div>
          <p className="page-subtitle" style={{ margin: 0 }}>
            {t('home_today')}: {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        <Link href="/wiki" style={{ textDecoration: 'none' }}>
          <div style={{
            background: '#FFE8EA', border: '1px solid #FCA5A5', borderRadius: 10,
            padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'
          }}>
            <span style={{ fontSize: '1rem' }}>🩸</span>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626' }}>hemophilya.kz</div>
              <div style={{ fontSize: '0.7rem', color: '#991B1B' }}>Горячая линия: +7 747 342-31-54</div>
            </div>
          </div>
        </Link>
      </div>

      {/* ---- Stats Row ---- */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={20} color="var(--color-success)" />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1, color: 'var(--color-text)', letterSpacing: '-0.03em' }}>{weeklyInjections}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{t('home_injections_week')}</div>
          </div>
        </div>
        <div className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={20} color="var(--color-primary)" />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1, color: 'var(--color-text)', letterSpacing: '-0.03em' }}>{todayEvents.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{t('home_events_today')}</div>
          </div>
        </div>
        <div className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="var(--color-purple)" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.2, color: 'var(--color-text)' }}>
              {nextAppointment
                ? new Date(nextAppointment.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
                : '—'
              }
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{t('home_next_appointment')}</div>
          </div>
        </div>
      </div>

      {/* ---- Quick Actions ---- */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={18} color="var(--color-primary)" />
          {t('home_quick_actions')}
        </h2>
        <div className="grid-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            const content = (
              <div
                key={action.id}
                id={action.id}
                onClick={action.onClick}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  gap: 10, padding: '18px', borderRadius: 14,
                  background: action.bg, cursor: 'pointer',
                  border: `1.5px solid ${action.color}22`,
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${action.color}28`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color="white" />
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.9125rem', color: action.color }}>{action.label}</span>
              </div>
            );

            if (action.href) return <Link key={action.id} href={action.href} style={{ textDecoration: 'none' }}>{content}</Link>;
            return content;
          })}
        </div>

        {/* Injection success toast */}
        {injectionLogged && (
          <div style={{
            marginTop: 14, padding: '12px 16px',
            background: 'var(--color-success-light)', borderRadius: 10,
            color: '#15803D', fontWeight: 600, fontSize: '0.9rem',
            animation: 'slide-up 0.3s ease', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            ✅ {t('home_injection_logged')}
          </div>
        )}
      </div>

      {/* ---- Today's Events ---- */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} color="var(--color-primary)" />
          {t('home_today')}
        </h2>
        {todayEvents.length === 0 ? (
          <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.9375rem', padding: '8px 0' }}>
            {t('home_no_events')}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todayEvents.map((event) => {
              const cfg = EVENT_TYPE_CONFIG[event.type];
              return (
                <div key={event.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 10,
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{cfg.label}</div>
                    {event.notes && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{event.notes}</div>}
                  </div>
                  {event.time && <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-subtle)', fontWeight: 500 }}>{event.time}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---- Tip + Quote ---- */}
      <div className="grid-2">
        <div className="card card-sm" style={{ background: 'linear-gradient(135deg, var(--color-primary-muted), #E0EEFF)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 6 }}>💡 {t('home_tip_title')}</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
            {patient.severity === 'mild' ? t('home_tip_mild') : patient.severity === 'moderate' ? t('home_tip_moderate') : t('home_tip_severe')}
          </p>
        </div>
        <div className="card card-sm" style={{ background: 'linear-gradient(135deg, var(--color-purple-light), #EEE8FF)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-purple)', marginBottom: 6 }}>✨ Вдохновение</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.55, fontStyle: 'italic' }}>&ldquo;{t('home_quote')}&rdquo;</p>
        </div>
      </div>

      {/* Monthly Account Modal */}
      {monthlyAccountOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 460, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800 }}>📊 Учет за текущий месяц</h2>
              <button
                onClick={() => setMonthlyAccountOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                ✕
              </button>
            </div>
            <p style={{ marginBottom: 16, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Официальный журнал инъекций для гематолога и получения рецепта в СК-Фармация (ГОБМП РК).
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem' }}>
              <span>Пациент / Подопечный:</span>
              <strong style={{ color: 'var(--color-text)' }}>{patient.fullName}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem' }}>
              <span>Препарат & Доза:</span>
              <span>{patient.factorProduct || 'Фактор VIII'} ({patient.workingDose || '2000 МЕ'})</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem' }}>
              <span>Выполнено инъекций в этом месяце:</span>
              <span style={{ fontWeight: 800, color: 'var(--color-success)', fontSize: '1rem' }}>{monthlyInjections}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem' }}>
              <span>Всего медицинских событий:</span>
              <span style={{ fontWeight: 700 }}>{monthlyEventsCount}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem' }}>
              <span>Примерный расход фактора:</span>
              <span style={{ fontWeight: 700, color: '#2D7DD2' }}>~{monthlyInjections * 2000} МЕ</span>
            </div>

            <div style={{ marginTop: 14, background: '#F0EBFF', padding: 12, borderRadius: 10, fontSize: '0.8rem', color: '#5B3A8B' }}>
              💡 <strong>Совет для поликлиники:</strong> при визите к гематологу покажите этот экран. Врач сразу внесет количество израсходованных флаконов в ЭРДБ для следующей заявки.
            </div>
            
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Отчет по инъекциям HaemoHelp KZ:\nПациент: ${patient.fullName}\nИнъекций за месяц: ${monthlyInjections}\nПрепарат: ${patient.factorProduct}\nДата отчета: ${new Date().toLocaleDateString('ru-RU')}`);
                  alert('Отчет скопирован в буфер обмена!');
                }}
                className="btn btn-ghost"
                style={{ flex: 1, padding: '12px' }}
              >
                📋 Скопировать отчет
              </button>
              <button
                onClick={() => setMonthlyAccountOpen(false)}
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px' }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
