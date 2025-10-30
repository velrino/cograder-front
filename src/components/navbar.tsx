'use client';

import { useState, useEffect } from 'react';
import { Theme } from '@/constants/theme';
import { Locale } from '@/constants/locale';
import { useI18n } from '@/contexts/i18n-context';

export default function Navbar() {
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
  const { locale, setLocale, t } = useI18n();

  useEffect(() => {
    // Verifica o tema salvo ou preferência do sistema
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT;
    const initialTheme = savedTheme || systemTheme;

    setTheme(initialTheme);
    document.documentElement.classList.remove(Theme.LIGHT, Theme.DARK);
    document.documentElement.classList.add(initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.remove(Theme.LIGHT, Theme.DARK);
    document.documentElement.classList.add(newTheme);
  };

  const toggleLocale = () => {
    const newLocale = locale === Locale.PT_BR ? Locale.EN_US : Locale.PT_BR;
    setLocale(newLocale);
  };

  return (
    <nav className="fixed top-0 w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-black dark:text-white">
              {t('navbar.title')}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLocale}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-2xl"
              aria-label="Change language"
            >
              {locale === Locale.PT_BR ? '🇧🇷' : '🇺🇸'}
            </button>

            <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === Theme.LIGHT ? (
              <svg
                className="w-5 h-5 text-zinc-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-zinc-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
