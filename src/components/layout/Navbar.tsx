'use client';
// Navbar.tsx — Top navigation bar with logout

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Locale } from '@/lib/i18n/translations';
import { AlertTriangle, Heart, LogOut } from 'lucide-react';

const LOCALES: { code: Locale; label: string }[] = [
  { code: 'ru', label: 'RU' },
  { code: 'kk', label: 'KK' },
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
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #2D7DD2, #1A5FAA)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Heart size={18} color="white" fill="white" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            {t('app_name')}
          </span>
          {account && (
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-subtle)', lineHeight: 1.2 }}>
              ИИН: {account.iin.slice(0, 4)}****{account.iin.slice(-4)}
            </span>
          )}
        </div>
      </div>

      {/* Language Switcher */}
      <div style={{
        display: 'flex',
        background: 'var(--color-bg)',
        borderRadius: 10,
        padding: '3px',
        border: '1px solid var(--color-border)',
        gap: '2px',
      }}>
        {LOCALES.map((loc) => (
          <button
            key={loc.code}
            id={`lang-${loc.code}`}
            onClick={() => setLocale(loc.code)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 700,
              transition: 'all 0.18s ease',
              background: locale === loc.code ? 'var(--color-primary)' : 'transparent',
              color: locale === loc.code ? '#fff' : 'var(--color-text-muted)',
              letterSpacing: '0.05em',
            }}
          >
            {loc.label}
          </button>
        ))}
      </div>

      {/* SOS Button */}
      <button
        id="btn-sos-navbar"
        className="btn btn-sos"
        onClick={() => setSosOpen(true)}
        style={{ marginLeft: 8 }}
      >
        <AlertTriangle size={16} />
        {t('nav_sos')}
      </button>

      {/* Logout */}
      <button
        id="btn-logout"
        onClick={handleLogout}
        title={t('auth_logout')}
        style={{
          background: 'none', border: '1.5px solid var(--color-border)',
          borderRadius: 10, cursor: 'pointer', padding: '8px',
          color: 'var(--color-text-muted)', transition: 'all 0.18s',
          display: 'flex', alignItems: 'center',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = '#E63946';
          (e.currentTarget as HTMLElement).style.color = '#E63946';
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
