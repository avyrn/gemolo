'use client';
// ============================================================
// LanguageContext.tsx — Global i18n context for HaemoHelp KZ
// Persists locale to localStorage. Default: Russian (ru)
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, Locale, TranslationKey } from './translations';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'ru',
  setLocale: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ru');

  // Restore saved locale from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('haemohelp_locale') as Locale | null;
    if (saved && ['ru', 'kk', 'en'].includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('haemohelp_locale', newLocale);
  }, []);

  // Translation function — falls back to key if not found
  const t = useCallback(
    (key: TranslationKey): string => {
      return (translations[locale] as Record<string, string>)[key] ?? key;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook for easy access
export function useLanguage() {
  return useContext(LanguageContext);
}
