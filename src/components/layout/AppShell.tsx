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
const PUBLIC_ROUTES = ['/', '/wiki', '/knowledge', '/quiz', '/map'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { sosOpen } = useStore();
  const { account, isLoading, isOnboardingComplete } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isLandingPage = pathname === '/';

  // Route protection
  useEffect(() => {
    if (isLoading) return;

    if (!account && !isAuthRoute && !isPublicRoute) {
      // Not logged in and accessing protected page → send to login
      router.push('/auth/login');
    } else if (account && !isOnboardingComplete && !isAuthRoute) {
      // Logged in but onboarding not done → send to register
      router.push('/auth/register');
    } else if (account && isOnboardingComplete && isAuthRoute) {
      // Fully set up → redirect away from auth pages
      router.push('/');
    }
  }, [isLoading, account, isOnboardingComplete, pathname, isAuthRoute, isPublicRoute, router]);

  // Loading spinner
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 9999,
          background: 'var(--color-primary)',
          animation: 'pulse 1.5s infinite',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#FAF9F6', fontSize: '1rem', fontWeight: 700 }}>●</span>
        </div>
      </div>
    );
  }

  // Auth pages — render without the nav shell
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Landing page — full-width Scandinavian layout without left sidebar constrain
  if (isLandingPage) {
    return (
      <div className="w-full min-h-screen bg-[#FAF9F6] text-[#141413]">
        {children}
        {sosOpen && <SOSModal />}
      </div>
    );
  }

  // Protected route check
  if (!account && !isPublicRoute) return null;

  // Full inner app shell
  return (
    <div className="app-layout">
      <Navbar />
      <Sidebar />
      <main className="main-content" style={{ marginLeft: 'var(--sidebar-width)', marginTop: 'var(--navbar-height)', minHeight: 'calc(100vh - var(--navbar-height))' }}>
        {children}
      </main>
      <BottomNav />
      {sosOpen && <SOSModal />}
    </div>
  );
}
