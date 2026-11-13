'use client';
// ============================================================
// AppShell.tsx — Master shell with AUTH GUARD
// - Auth pages (/auth/*): rendered without nav
// - Unauthenticated: redirect to /auth/login
// - Onboarding incomplete: redirect to /auth/register
// - Authenticated + onboarded: show full app with nav
// ============================================================

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import SOSModal from '@/components/sos/SOSModal';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth/AuthContext';

const AUTH_ROUTES = ['/auth/login', '/auth/register'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { sosOpen } = useStore();
  const { account, isLoading, isOnboardingComplete } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Route protection
  useEffect(() => {
    if (isLoading) return;

    if (!account && !isAuthRoute) {
      // Not logged in → send to login
      router.push('/auth/login');
    } else if (account && !isOnboardingComplete && !isAuthRoute) {
      // Logged in but onboarding not done → send to register
      router.push('/auth/register');
    } else if (account && isOnboardingComplete && isAuthRoute) {
      // Fully set up → redirect away from auth pages
      router.push('/');
    }
  }, [isLoading, account, isOnboardingComplete, pathname, isAuthRoute]);

  // Loading spinner
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(135deg, #2D7DD2, #1A5FAA)',
          animation: 'sos-pulse 1.5s infinite',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '1.5rem' }}>♥</span>
        </div>
      </div>
    );
  }

  // Auth pages — render without the nav shell
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Not authed or onboarding pending — render nothing (redirect happens above)
  if (!account || !isOnboardingComplete) return null;

  // Full app shell
  return (
    <div className="app-layout">
      <Navbar />
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <BottomNav />
      {sosOpen && <SOSModal />}
    </div>
  );
}
