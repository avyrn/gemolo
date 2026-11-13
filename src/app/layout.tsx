import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { AuthProvider } from '@/lib/auth/AuthContext';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'HaemoHelp KZ — Помощь при гемофилии',
  description: 'Комплексное приложение для людей с гемофилией в Казахстане. Экстренная помощь, трекер инъекций, цифровой паспорт и база знаний.',
  keywords: 'гемофилия, Казахстан, лечение, фактор, GOBMP, ОСМС',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <LanguageProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

