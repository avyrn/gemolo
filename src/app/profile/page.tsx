'use client';
// ============================================================
// Profile page — Digital Passport + Avatar + Tabs + Export
// ============================================================

import { useState, useRef } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth/AuthContext';
import { Edit3, Save, X, Droplets, Shield, User, Phone, Camera, FileText, Settings, Lock, Download } from 'lucide-react';

const SEVERITY_COLORS = {
  mild:     { bg: 'var(--color-success-light)', color: '#15803D',          label_ru: 'Лёгкая',  label_kk: 'Жеңіл',    label_en: 'Mild' },
  moderate: { bg: 'var(--color-warning-light)', color: '#C05621',          label_ru: 'Средняя', label_kk: 'Орташа',   label_en: 'Moderate' },
  severe:   { bg: 'var(--color-sos-light)',     color: 'var(--color-sos)', label_ru: 'Тяжёлая', label_kk: 'Ауыр',     label_en: 'Severe' },
};

type ProfileTab = 'passport' | 'settings' | 'security';

export default function ProfilePage() {
  const { t, locale } = useLanguage();
  const { events } = useStore();
  const { account, completeOnboarding } = useAuth();
  
  const patient = account?.patient || {
    fullName: '', dob: '', bloodType: '', hemophiliaType: 'A', severity: 'severe',
    inhibitor: false, workingDose: '', factorProduct: '', doctor: '', hospital: '',
    weight: 70, contacts: [], avatar: undefined,
  };

  const [activeTab, setActiveTab] = useState<ProfileTab>('passport');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...patient });
  const [exportSuccess, setExportSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => { completeOnboarding(draft); setEditing(false); };
  const handleCancel = () => { setDraft({ ...patient }); setEditing(false); };

  // Avatar upload
  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      const updated = { ...draft, avatar: base64 };
      setDraft(updated);
      completeOnboarding(updated);
    };
    reader.readAsDataURL(file);
  };

  // Export CSV
  const exportCSV = (period: 'month' | 'quarter') => {
    const now = new Date();
    const fromDate = new Date(now);
    if (period === 'month') fromDate.setMonth(fromDate.getMonth() - 1);
    else fromDate.setMonth(fromDate.getMonth() - 3);
    const fromStr = fromDate.toISOString().split('T')[0];
    const filtered = events.filter(e => e.date >= fromStr);
    const rows = [
      ['Дата', 'Тип', 'Время', 'Заметки'],
      ...filtered.map(e => [e.date, e.type, e.time || '', e.notes || '']),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `haemohelp_${period}_${now.toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    setExportSuccess('✅ Файл скачан');
    setTimeout(() => setExportSuccess(''), 3000);
  };

  // Print report
  const printReport = () => {
    const now = new Date();
    const fromDate = new Date(now); fromDate.setMonth(fromDate.getMonth() - 1);
    const filtered = events.filter(e => e.date >= fromDate.toISOString().split('T')[0]);
    const injections = filtered.filter(e => e.type === 'injection').length;
    const appointments = filtered.filter(e => e.type === 'appointment').length;
    const html = `<html><head><title>HaemoHelp — Отчёт</title><style>
      body{font-family:Arial,sans-serif;padding:32px;color:#1a202c}
      h1{color:#2D7DD2;font-size:24px}h2{color:#64748b;font-size:16px;margin-top:24px}
      table{width:100%;border-collapse:collapse;margin-top:12px}
      th{background:#EBF4FF;padding:8px 12px;text-align:left;font-size:13px}
      td{padding:8px 12px;border-bottom:1px solid #e8edf5;font-size:13px}
      .badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700}
      @media print{button{display:none}}
    </style></head><body>
    <h1>🩸 HaemoHelp KZ — Медицинский отчёт</h1>
    <p><strong>Пациент:</strong> ${patient.fullName} &nbsp;&nbsp; <strong>Дата рождения:</strong> ${patient.dob}</p>
    <p><strong>Диагноз:</strong> Гемофилия тип ${patient.hemophiliaType}, ${patient.severity === 'severe' ? 'тяжёлая' : patient.severity === 'moderate' ? 'средняя' : 'лёгкая'} форма</p>
    <p><strong>Препарат:</strong> ${patient.factorProduct} &nbsp;&nbsp; <strong>Доза:</strong> ${patient.workingDose}</p>
    <p><strong>Лечащий врач:</strong> ${patient.doctor} &nbsp;&nbsp; <strong>Больница:</strong> ${patient.hospital}</p>
    <p><strong>Период отчёта:</strong> ${fromDate.toLocaleDateString('ru-RU')} — ${now.toLocaleDateString('ru-RU')}</p>
    <h2>📊 Статистика</h2>
    <p>Всего событий: <b>${filtered.length}</b> &nbsp; Инъекций: <b>${injections}</b> &nbsp; Приёмов врача: <b>${appointments}</b></p>
    <h2>📅 Журнал событий</h2>
    <table><tr><th>Дата</th><th>Тип</th><th>Время</th><th>Заметки</th></tr>
    ${filtered.map(e => `<tr><td>${e.date}</td><td>${e.type === 'injection' ? '💉 Инъекция' : e.type === 'test' ? '🩸 Анализ' : e.type === 'appointment' ? '👨‍⚕️ Приём' : '💊 Аптека'}</td><td>${e.time || '—'}</td><td>${e.notes || '—'}</td></tr>`).join('')}
    </table>
    <p style="margin-top:32px;color:#94a3b8;font-size:12px">Сгенерировано HaemoHelp KZ · ${now.toLocaleString('ru-RU')}</p>
    </body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
  };

  const qrData = JSON.stringify({ name: patient.fullName, dob: patient.dob, blood: patient.bloodType, hemophilia: `Type ${patient.hemophiliaType}`, severity: patient.severity, inhibitor: patient.inhibitor, dose: patient.workingDose, factor: patient.factorProduct, doctor: patient.doctor, hospital: patient.hospital, emergency: patient.contacts[0]?.phone });
  const sev = SEVERITY_COLORS[patient.severity];

  const TABS: { id: ProfileTab; label: string; icon: React.ElementType }[] = [
    { id: 'passport', label: 'Паспорт', icon: FileText },
    { id: 'settings', label: 'Настройки', icon: Settings },
    { id: 'security', label: 'Безопасность', icon: Lock },
  ];

  const Field = ({ label, value, editKey }: { label: string; value: string; editKey?: keyof typeof draft }) => (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      {editing && editKey ? (
        <input className="input" value={String((draft as any)[editKey])} onChange={e => setDraft({ ...draft, [editKey]: e.target.value })} style={{ padding: '8px 12px', fontSize: '0.9375rem' }} />
      ) : (
        <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--color-text)' }}>{value}</div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid var(--color-border)' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: isActive ? 700 : 500, fontSize: '0.9375rem',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: -2, transition: 'all 0.15s',
            }}>
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ---- PASSPORT TAB ---- */}
      {activeTab === 'passport' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h1 className="page-title">{t('profile_title')}</h1>
              <p className="page-subtitle">Гемофилия тип {patient.hemophiliaType}</p>
            </div>
            {!editing ? (
              <button id="btn-edit-profile" className="btn btn-ghost" onClick={() => setEditing(true)}><Edit3 size={16} /> {t('profile_edit')}</button>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost btn-sm" onClick={handleCancel}><X size={14} /> {t('profile_cancel')}</button>
                <button id="btn-save-profile" className="btn btn-primary btn-sm" onClick={handleSave}><Save size={14} /> {t('profile_save')}</button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
            <div className="card">
              {/* Header with avatar */}
              <div style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', borderRadius: 12, padding: '20px', marginBottom: 20, color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {/* Avatar with upload */}
                  <div onClick={handleAvatarClick} style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden', border: '2.5px solid rgba(255,255,255,0.5)', flexShrink: 0 }}
                    title="Нажмите для смены аватара">
                    {draft.avatar
                      ? <img src={draft.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <User size={30} color="white" />
                    }
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                      <Camera size={18} color="white" />
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{patient.fullName}</h2>
                    <p style={{ opacity: 0.8, fontSize: '0.875rem', margin: '2px 0 0' }}>{patient.dob} · {patient.bloodType}</p>
                    <p style={{ opacity: 0.7, fontSize: '0.775rem', margin: '2px 0 0' }}>Нажмите на фото для смены</p>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ background: sev.bg, color: sev.color, borderRadius: 8, padding: '6px 12px', fontWeight: 700, fontSize: '0.875rem' }}>{sev[`label_${locale}` as 'label_ru']}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: 4 }}>{patient.inhibitor ? '⚠️ Ингибитор' : '✅ Без ингибитора'}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                <Field label={t('profile_full_name')} value={patient.fullName} editKey="fullName" />
                <Field label={t('profile_dob')} value={patient.dob} editKey="dob" />
                <Field label={t('profile_blood_type')} value={patient.bloodType} editKey="bloodType" />
                <Field label={t('profile_hemo_type')} value={`Тип ${patient.hemophiliaType}`} />
                <Field label={t('profile_working_dose')} value={patient.workingDose} editKey="workingDose" />
                <Field label={t('profile_factor')} value={patient.factorProduct} editKey="factorProduct" />
                <Field label={t('profile_doctor')} value={patient.doctor} editKey="doctor" />
                <Field label={t('profile_hospital')} value={patient.hospital} editKey="hospital" />
              </div>
              {/* Emergency contacts */}
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{t('profile_contacts')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {patient.contacts.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={16} color="var(--color-primary)" /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{c.relation}</div>
                      </div>
                      <a href={`tel:${c.phone}`} style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>{c.phone}</a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* QR + Export */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                  <Shield size={18} color="var(--color-primary)" />
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{t('profile_qr_title')}</h3>
                </div>
                <div style={{ background: 'white', borderRadius: 12, padding: 16, border: '2px solid var(--color-border)', display: 'inline-block' }}>
                  <QRCode value={qrData} size={160} level="M" />
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 12, lineHeight: 1.5 }}>{t('profile_qr_desc')}</p>
                <div style={{ marginTop: 14 }}>
                  <div style={{ background: 'var(--color-bg)', borderRadius: 10, padding: '12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Droplets size={16} color="var(--color-sos)" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', fontWeight: 600 }}>ГРУППА КРОВИ</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>{patient.bloodType}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export card */}
              <div className="card">
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Download size={16} color="var(--color-primary)" /> Экспорт для врача
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm btn-full" onClick={() => exportCSV('month')}>📊 CSV за месяц</button>
                  <button className="btn btn-ghost btn-sm btn-full" onClick={() => exportCSV('quarter')}>📊 CSV за квартал</button>
                  <button className="btn btn-primary btn-sm btn-full" onClick={printReport}>🖨️ PDF-отчёт (печать)</button>
                </div>
                {exportSuccess && (
                  <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: 'var(--color-success-light)', color: '#15803D', fontSize: '0.825rem', fontWeight: 600 }}>
                    {exportSuccess}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ---- SETTINGS TAB ---- */}
      {activeTab === 'settings' && (
        <div style={{ maxWidth: 520 }}>
          <h1 className="page-title">Настройки</h1>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>🌐 Язык приложения</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>Язык меняется в верхней панели (RU / KK / EN)</p>
          </div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>🔔 Уведомления</h3>
            {[
              { label: 'Напоминание об инъекции', desc: 'За 1 час до плановой инъекции' },
              { label: 'Уведомление о запасах', desc: 'Когда запас фактора заканчивается' },
              { label: 'Напоминание о приёме врача', desc: 'За 24 часа до визита' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{item.desc}</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', inset: 0, background: 'var(--color-primary)', borderRadius: 24, transition: '0.2s' }} />
                  <span style={{ position: 'absolute', top: 2, left: 22, width: 20, height: 20, background: 'white', borderRadius: '50%', transition: '0.2s' }} />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- SECURITY TAB ---- */}
      {activeTab === 'security' && (
        <div style={{ maxWidth: 520 }}>
          <h1 className="page-title">Безопасность</h1>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>🔑 Смена пароля</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label className="label">Текущий пароль</label><input className="input" type="password" placeholder="••••••••" /></div>
              <div><label className="label">Новый пароль</label><input className="input" type="password" placeholder="Минимум 4 символа" /></div>
              <div><label className="label">Подтвердите новый пароль</label><input className="input" type="password" placeholder="••••••••" /></div>
              <button className="btn btn-primary">Сохранить новый пароль</button>
            </div>
          </div>
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>📱 Текущая сессия</h3>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              <div>ИИН: <strong>{account?.iin}</strong></div>
              <div style={{ marginTop: 6 }}>Устройство: <strong>Текущий браузер</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
