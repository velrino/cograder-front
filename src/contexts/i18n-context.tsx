'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale } from '@/constants/locale';
import ptBR from '@/locales/pt-BR.json';
import enUS from '@/locales/en-US.json';

type Messages = typeof ptBR;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const messages: Record<Locale, Messages> = {
  [Locale.PT_BR]: ptBR,
  [Locale.EN_US]: enUS,
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(Locale.PT_BR);

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale | null;
    const browserLocale = navigator.language.startsWith('pt') ? Locale.PT_BR : Locale.EN_US;
    const initialLocale = savedLocale || browserLocale;
    setLocaleState(initialLocale);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages[locale];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
