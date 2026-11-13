'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Home, Calendar, BookOpen, Users, CreditCard, MapPin, Pill, GraduationCap } from 'lucide-react';

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
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(({ href, icon: Icon, key }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link key={href} href={href} id={`sidebar-${key}`} className={`sidebar-link${isActive ? ' active' : ''}`}>
              <Icon size={20} />
              <span>{t(key)}</span>
            </Link>
          );
        })}
      </nav>
      <div style={{ marginTop: 'auto', padding: '12px 14px' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--color-primary-muted), #E8F4FF)', borderRadius: 12, padding: '14px', border: '1px solid rgba(45, 125, 210, 0.15)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            🏥 Горячая линия РНЦХ<br />
            <a href="tel:+77272781090" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>+7 727 278-10-90</a>
          </p>
        </div>
      </div>
    </aside>
  );
}
