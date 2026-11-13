'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Home, Calendar, BookOpen, Users, CreditCard, MapPin, Pill, GraduationCap, PhoneCall } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/',           icon: Home,           key: 'nav_home'      as const },
  { href: '/calendar',  icon: Calendar,        key: 'nav_calendar'  as const },
  { href: '/map',       icon: MapPin,          key: 'nav_map'       as const },
  { href: '/meds',      icon: Pill,            key: 'nav_meds'      as const },
  { href: '/knowledge', icon: GraduationCap,   key: 'nav_knowledge' as const },
  { href: '/wiki',      icon: BookOpen,        key: 'nav_wiki'      as const },
  { href: '/community', icon: Users,           key: 'nav_community' as const },
  { href: '/profile',   icon: CreditCard,      key: 'nav_profile'   as const },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="sidebar">
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {NAV_ITEMS.map(({ href, icon: Icon, key }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link key={href} href={href} id={`sidebar-${key}`} className={`sidebar-link${isActive ? ' active' : ''}`}>
              <Icon size={19} style={{ color: isActive ? '#F8F6F2' : 'var(--color-primary-light)', flexShrink: 0 }} />
              <span>{t(key)}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(12px)',
          borderRadius: 16,
          padding: '16px',
          border: '1px solid var(--color-border)',
          boxShadow: '0 4px 16px rgba(30, 58, 47, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <PhoneCall size={14} color="var(--color-terracotta)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Горячая линия РК
            </span>
          </div>
          <p style={{ fontSize: '0.7875rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
            Ассоциация гемофилии:<br />
            <a href="tel:+77473423154" style={{ color: 'var(--color-terracotta)', fontWeight: 700, textDecoration: 'none' }}>
              +7 (747) 342-31-54
            </a>
          </p>
        </div>
      </div>
    </aside>
  );
}
