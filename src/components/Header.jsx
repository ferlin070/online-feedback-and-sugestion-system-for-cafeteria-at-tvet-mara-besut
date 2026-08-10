import { useTranslation } from 'react-i18next';

export function Header({ theme, toggleTheme, adminUser, onNavigateHome, onNavigateLogin, onLogout }) {
  const { t, i18n } = useTranslation();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border-color)] bg-[var(--bg-color)]/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className={`flex items-center gap-2.5 group ${adminUser ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <span className="w-8 h-8 rounded-md bg-clay-500 text-sand-50 flex items-center justify-center font-display text-lg font-bold leading-none shadow-sm">
            K
          </span>
          <span className="font-display text-[17px] font-semibold tracking-tight text-[var(--heading-color)]">
            Kafe<span className="text-clay-500">.</span>Maklum
          </span>
        </button>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Togol tema"
            className="w-9 h-9 grid place-items-center rounded-md border border-[var(--border-color)] text-ink-500 hover:text-clay-500 hover:border-clay-300 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" />
                <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <div className="flex items-center rounded-md border border-[var(--border-color)] p-0.5">
            {['ms', 'en'].map(lang => (
              <button
                key={lang}
                onClick={() => i18n.changeLanguage(lang)}
                aria-pressed={i18n.language === lang}
                className={`px-2 py-1 text-[11px] font-semibold rounded uppercase tracking-wide transition-colors ${
                  i18n.language === lang
                    ? 'bg-clay-500 text-sand-50'
                    : 'text-ink-400 hover:text-ink-700 dark:hover:text-ink-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {adminUser ? (
            <div className="flex items-center gap-3 pl-2 ml-1 border-l border-[var(--border-color)]">
              <div className="hidden sm:block text-right leading-tight">
                <p className="text-xs font-medium text-[var(--text-color)]">{adminUser.name || 'Admin'}</p>
                <p className="text-[10px] text-ink-400 font-mono uppercase tracking-wider">
                  {adminUser.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--border-color)] text-ink-500 hover:text-red-600 hover:border-red-300 dark:hover:text-red-400 dark:hover:border-red-500/40 transition-colors cursor-pointer"
              >
                {t('common.logout')}
              </button>
            </div>
          ) : (
            <button
              onClick={onNavigateLogin}
              className="px-3 py-1.5 text-xs font-medium rounded-md text-ink-500 hover:text-clay-600 dark:hover:text-clay-400 transition-colors cursor-pointer"
            >
              {t('common.admin_portal')}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-color)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-ink-400">
        <p className="font-mono uppercase tracking-wider">
          Kafe.Maklum · TVET MARA Besut
        </p>
        <p>© {new Date().getFullYear()} · Hak Cipta Terpelihara</p>
      </div>
    </footer>
  );
}
