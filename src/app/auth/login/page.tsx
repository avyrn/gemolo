'use client';
// ============================================================
// Login page — IIN + password with error messages + register link
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { TranslationKey } from '@/lib/i18n/translations';
import { Eye, EyeOff, Heart, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const router = useRouter();

  const [iin, setIin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Small UX delay
    await new Promise((r) => setTimeout(r, 300));

    const result = await login(iin.trim(), password);
    setLoading(false);

    if (result.ok) {
      router.push('/');
    } else {
      setError(t((result.error || 'auth_error_not_found') as TranslationKey));
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #EBF4FF 0%, #F0EBFF 50%, #E8F9EE 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #2D7DD2, #1A5FAA)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(45,125,210,0.3)',
            marginBottom: 14,
          }}>
            <Heart size={32} color="white" fill="white" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1A202C', letterSpacing: '-0.03em' }}>
            HaemoHelp
          </div>
          <div style={{ color: '#64748B', fontSize: '0.9375rem', marginTop: 4 }}>
            {t('app_subtitle')}
          </div>
        </div>

        {/* Card */}
        <div className="card">
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>
            {t('auth_login_title')}
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: 24 }}>
            {t('auth_login_subtitle')}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* IIN */}
            <div>
              <label className="label" htmlFor="login-iin">{t('auth_iin_label')}</label>
              <input
                id="login-iin"
                type="text"
                inputMode="numeric"
                maxLength={12}
                className="input"
                placeholder={t('auth_iin_placeholder')}
                value={iin}
                onChange={(e) => setIin(e.target.value.replace(/\D/g, '').slice(0, 12))}
                required
                style={{ fontFamily: 'monospace', fontSize: '1.125rem', letterSpacing: '0.1em' }}
              />
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: 4 }}>
                {iin.length} / 12
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="login-password">{t('auth_password_label')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder={t('auth_password_placeholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#FFE8EA', borderRadius: 10, padding: '10px 14px',
                color: '#E63946', fontSize: '0.9rem',
              }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="btn-login-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading || iin.length !== 12 || password.length < 4}
              style={{ opacity: (loading || iin.length !== 12 || password.length < 4) ? 0.6 : 1 }}
            >
              {loading ? '...' : t('auth_login_btn')}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748B' }}>
            {t('auth_no_account')}{' '}
            <Link href="/auth/register" id="link-to-register" style={{ color: '#2D7DD2', fontWeight: 600, textDecoration: 'none' }}>
              {t('auth_register_link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
