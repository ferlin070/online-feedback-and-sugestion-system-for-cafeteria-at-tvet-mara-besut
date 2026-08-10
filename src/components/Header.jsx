import { useTranslation } from 'react-i18next';

export function Header({ theme, toggleTheme, adminUser, onNavigateHome, onNavigateLogin, onLogout }) {
  const { t, i18n } = useTranslation();

  return (
    <header className="relative border-b border-slate-200 dark:border-slate-900 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 transition-colors duration-300">
      <div
        onClick={onNavigateHome}
        className={`flex items-center gap-3 ${!adminUser ? 'cursor-pointer' : ''}`}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
        <span className="font-bold text-lg font-display tracking-tight text-slate-900 dark:text-white">
          Feedback Kafe
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-200/50 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
          title={theme === 'dark' ? t('common.light_mode', 'Mod Terang') : t('common.dark_mode', 'Mod Gelap')}
        >
          {theme === 'dark' ? (
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 17.95a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zm2.122-14.142a1 1 0 111.414 1.414L7.88 5.93a1 1 0 11-1.414-1.414l.707-.707zM3 10a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>

        <div className="flex items-center bg-slate-200/50 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800 rounded-lg p-0.5 transition-colors duration-300">
          <button
            onClick={() => i18n.changeLanguage('ms')}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              i18n.language === 'ms'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            BM
          </button>
          <button
            onClick={() => i18n.changeLanguage('en')}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              i18n.language === 'en'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            EN
          </button>
        </div>

        {adminUser ? (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{adminUser.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-500">{adminUser.role === 'superadmin' ? 'Super Admin' : 'Admin'}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-1.5 bg-white dark:bg-slate-900 hover:bg-red-500/10 text-slate-700 dark:text-slate-300 hover:text-red-500 font-medium rounded-lg text-sm transition-colors border border-slate-200 dark:border-slate-800 hover:border-red-500/20"
            >
              {t('common.logout')}
            </button>
          </div>
        ) : (
          <button
            onClick={onNavigateLogin}
            className="px-4 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium rounded-lg text-sm transition-colors border border-slate-200 dark:border-slate-800"
          >
            {t('common.admin_portal')}
          </button>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-900/60 bg-slate-950/30 text-center py-4 text-[10px] text-slate-600">
      &copy; {new Date().getFullYear()} Kafeteria TVET MARA Besut. Semua Hak Terpelihara.
    </footer>
  );
}
