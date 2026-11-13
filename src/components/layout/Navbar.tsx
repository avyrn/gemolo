'use client';
// Navbar.tsx — Clean Organic Minimalism Navigation Bar with Forest Green & Terracotta Accents

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Locale } from '@/lib/i18n/translations';
import { AlertTriangle, Droplet, LogOut, ShieldCheck } from 'lucide-react';

const LOCALES: { code: Locale; label: string }[] = [
  { code: 'ru', label: 'RU' },
  { code: 'kk', label: 'KZ' },
  { code: 'en', label: 'EN' },
];

export default function Navbar() {
  const { locale, setLocale, t } = useLanguage();
  const { setSosOpen } = useStore();
  const { account, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <nav className="navbar">
      {/* Brand & Gemology Aesthetic Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          background: 'linear-gradient(135deg, #1E3A2F, #2A4F41)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(30, 58, 47, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <Droplet size={19} color="#D97D54" fill="#D97D54" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            HaemoHelp <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-terracotta)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>KZ</span>
          </span>
          {account && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <ShieldCheck size={11} color="var(--color-primary-light)" />
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)', letterSpacing: '0.02em' }}>
                ИИН: {account.iin.slice(0, 4)}••••{account.iin.slice(-4)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Language Switcher */}
      <div style={{
        display: 'flex',
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(8px)',
        borderRadius: 12,
        padding: '3px',
        border: '1px solid var(--color-border)',
        gap: '3px',
      }}>
        {LOCALES.map((loc) => (
          <button
            key={loc.code}
            id={`lang-${loc.code}`}
            onClick={() => setLocale(loc.code)}
            style={{
              padding: '6px 12px',
              borderRadius: 9,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.7875rem',
              fontWeight: 700,
              transition: 'all 0.2s ease',
              background: locale === loc.code ? 'var(--color-primary)' : 'transparent',
              color: locale === loc.code ? '#F8F6F2' : 'var(--color-text-muted)',
              letterSpacing: '0.04em',
            }}
          >
            {loc.label}
          </button>
        ))}
      </div>

      {/* SOS Button — Soft Terracotta Highlight */}
      <button
        id="btn-sos-navbar"
        className="btn btn-sos"
        onClick={() => setSosOpen(true)}
        style={{ marginLeft: 6 }}
      >
        <AlertTriangle size={15} />
        {t('nav_sos')}
      </button>

      {/* Logout */}
      <button
        id="btn-logout"
        onClick={handleLogout}
        title={t('auth_logout')}
        style={{
          background: 'rgba(255, 255, 255, 0.75)',
          border: '1px solid var(--color-border)',
          borderRadius: 12, cursor: 'pointer', padding: '9px',
          color: 'var(--color-text-muted)', transition: 'all 0.2s',
          display: 'flex', alignItems: 'center',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-terracotta)';
          (e.currentTarget as HTMLElement).style.color = 'var(--color-terracotta)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
          (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
        }}
      >
        <LogOut size={16} />
      </button>
    </nav>
  );
}
