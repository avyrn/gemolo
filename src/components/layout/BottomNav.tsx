'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Home, Calendar, MapPin, Pill, CreditCard } from 'lucide-react';

// Mobile bottom nav: show only 5 most important items
const NAV_ITEMS = [
  { href: '/',          icon: Home,     key: 'nav_home'     as const },
  { href: '/map',       icon: MapPin,   key: 'nav_map'      as const },
  { href: '/calendar',  icon: Calendar, key: 'nav_calendar' as const },
  { href: '/meds',      icon: Pill,     key: 'nav_meds'     as const },
  { href: '/profile',   icon: CreditCard, key: 'nav_profile' as const },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Bottom navigation">
      {NAV_ITEMS.map(({ href, icon: Icon, key }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link key={href} href={href} id={`bottom-nav-${key}`} className={`bottom-nav-link${isActive ? ' active' : ''}`} style={{ textDecoration: 'none' }}>
            <Icon size={22} style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-subtle)' }} />
            <span style={{ fontSize: '0.6875rem' }}>{t(key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
