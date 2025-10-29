'use client';

import { useState, useEffect } from 'react';
import { Theme } from '@/constants/theme';
import { Locale, LOCALE_NAMES } from '@/constants/locale';
import { useI18n } from '@/contexts/i18n-context';

export default function Navbar() {
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
  const { locale, setLocale, t } = useI18n();
  const [showLocaleMenu, setShowLocaleMenu] = useState(false);

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
            <div className="relative">
              <button
                onClick={() => setShowLocaleMenu(!showLocaleMenu)}
                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-sm font-medium text-zinc-800 dark:text-zinc-200"
                aria-label="Change language"
              >
                {locale === Locale.PT_BR ? 'PT' : 'EN'}
              </button>

              {showLocaleMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      setLocale(Locale.PT_BR);
                      setShowLocaleMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-t-lg"
                  >
                    {LOCALE_NAMES[Locale.PT_BR]}
                  </button>
                  <button
                    onClick={() => {
                      setLocale(Locale.EN_US);
                      setShowLocaleMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-b-lg"
                  >
                    {LOCALE_NAMES[Locale.EN_US]}
                  </button>
                </div>
              )}
            </div>

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
