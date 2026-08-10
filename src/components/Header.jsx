import { useTranslation } from 'react-i18next';

function TVETMARALogo({ className = '' }) {
  return (
    <img
      src="/TVETMARA_Besut-logo.png"
      alt="Logo TVETMARA Besut"
      className={`${className} object-contain`}
      loading="eager"
      decoding="async"
    />
  );
}

export function Header({ theme, toggleTheme, adminUser, onNavigateHome, onNavigateLogin, onLogout }) {
  const { t, i18n } = useTranslation();

  return (
    <header className="sticky top-0 z-30">
      <div className="brand-stripe" />

      {/* Top bar — sosial + bahasa (gaya mara.gov.my) */}
      <div className="bg-mara-navy-700 text-sand-50 text-[11px]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline font-mono uppercase tracking-wider opacity-80">
              {t('header.portal_rasmi', 'Portal Rasmi')} · TVET MARA Besut
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Social icons */}
            <a href="https://www.facebook.com/MajlisAmanahRakyat" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity" aria-label="Facebook">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12c0-6.6-5.4-12-12-12S0 5.4 0 12c0 6 4.4 11 10.1 11.9v-8.4H7.1V12h3.1V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.3l-.5 3.5h-2.8v8.4C19.6 23 24 18 24 12z"/></svg>
            </a>
            <a href="https://www.instagram.com/majlisamanahrakyat" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity" aria-label="Instagram">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .3-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 5.8.1 5 .3 4.2.6c-.8.3-1.5.7-2.2 1.4C1.3 2.7.9 3.4.6 4.2.3 5 .1 5.8.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.1 1.3.2 2.1.5 2.9.3.8.7 1.5 1.4 2.2.7.7 1.4 1.1 2.2 1.4.8.3 1.6.5 2.9.5 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c1.3-.1 2.1-.2 2.9-.5.8-.3 1.5-.7 2.2-1.4.7-.7 1.1-1.4 1.4-2.2.3-.8.5-1.6.5-2.9.1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.1-1.3-.2-2.1-.5-2.9-.3-.8-.7-1.5-1.4-2.2C21.3 1.3 20.6.9 19.8.6 19 .3 18.2.1 16.9.1 15.7 0 15.3 0 12 0zm0 5.8c-3.4 0-6.2 2.8-6.2 6.2s2.8 6.2 6.2 6.2 6.2-2.8 6.2-6.2-2.8-6.2-6.2-6.2zm0 10.3c-2.3 0-4.1-1.8-4.1-4.1s1.8-4.1 4.1-4.1 4.1 1.8 4.1 4.1-1.8 4.1-4.1 4.1zm6.4-11.9c-.8 0-1.4.7-1.4 1.4s.7 1.4 1.4 1.4 1.4-.7 1.4-1.4-.6-1.4-1.4-1.4z"/></svg>
            </a>
            <a href="https://youtube.com/c/MUPDATES" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity" aria-label="YouTube">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.5 6.2c-.3-1-1-1.8-2-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.5.6c-1 .3-1.8 1-2 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8c.3 1 1 1.8 2 2.1 1.9.6 9.5.6 9.5.6s7.6 0 9.5-.6c1-.3 1.8-1 2-2.1.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>
            </a>
            <a href="https://t.me/majlisamanahrakyat" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity" aria-label="Telegram">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.9 1.6L.6 10.4c-.9.4-.9 1.6 0 2l5.8 2.2 2.2 7c.2.7 1.1.9 1.6.4l3.2-2.9 5.9 4.3c.6.4 1.5.1 1.7-.6L24 2.8c.2-.9-.7-1.6-1.5-1.2zM9.7 14.4L19 6.7c.2-.2.5.1.3.4l-7.7 7.2-.3 3.8c-.1.4-.6.5-.9.2l-2-2.2 1.3-1.7z"/></svg>
            </a>

            <div className="w-px h-4 bg-white/30 mx-1" />

            {/* Togol bahasa */}
            <div className="flex items-center gap-1">
              {['ms', 'en'].map(lang => (
                <button
                  key={lang}
                  onClick={() => i18n.changeLanguage(lang)}
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase transition-colors ${
                    i18n.language === lang
                      ? 'bg-mara-gold-400 text-mara-navy-700'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main bar — logo + nav */}
      <div className="border-b border-[var(--border-color)] bg-[var(--bg-color)]/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            className={`flex items-center gap-3 ${adminUser ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <TVETMARALogo className="h-10 w-auto shrink-0" />
            <span className="flex flex-col leading-tight">
              <span className="font-display text-[16px] font-semibold tracking-tight text-[var(--heading-color)]">
                Sistem Aduan
              </span>
              <span className="text-[9px] font-mono uppercase tracking-[0.18em]" style={{ color: 'var(--primary)' }}>
                TVETMARA Besut
              </span>
            </span>
          </button>

          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Togol tema"
              className="w-9 h-9 grid place-items-center rounded-md border border-[var(--border-color)] text-mara-gray-500 hover:text-mara-blue-500 hover:border-mara-blue-300 transition-colors cursor-pointer"
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

            {adminUser ? (
              <div className="flex items-center gap-3 pl-2 ml-1 border-l border-[var(--border-color)]">
                <div className="hidden sm:block text-right leading-tight">
                  <p className="text-xs font-medium text-[var(--text-color)]">{adminUser.name || 'Admin'}</p>
                  <p className="text-[10px] text-mara-gray-400 font-mono uppercase tracking-wider">
                    {adminUser.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="btn-mara-outline px-3 py-1.5 text-xs"
                >
                  {t('common.logout')}
                </button>
              </div>
            ) : (
              <button
                onClick={onNavigateLogin}
                className="btn-mara-outline px-3 py-1.5 text-xs"
              >
                {t('common.admin_portal')}
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-mara-navy-700 text-sand-50">
      {/* Bahagian utama */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo + alamat */}
        <div className="md:col-span-1 space-y-3">
          <img src="/TVETMARA_Besut-logo.png" alt="TVETMARA Besut" className="h-12 w-auto brightness-0 invert" />
          <div className="text-[12px] leading-relaxed opacity-80">
            <p className="font-semibold">Kafeteria TVET MARA Besut</p>
            <p>Sistem Aduan &amp; Maklum Balas</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wider opacity-60">Hotline: 03-26132000</p>
          </div>
        </div>

        {/* Pautan Pantas */}
        <div className="md:col-span-1">
          <h4 className="font-display text-[13px] font-semibold uppercase tracking-wider text-mara-gold-300 mb-3">
            {t('footer.quick_links', 'Pautan Pantas')}
          </h4>
          <ul className="space-y-2 text-[12px] opacity-80">
            <li><a href="https://www.mara.gov.my/" target="_blank" rel="noopener noreferrer" className="hover:text-mara-gold-300 transition-colors">Portal MARA</a></li>
            <li><a href="https://www.mara.gov.my/bm/aduan-dan-maklum-balas/" target="_blank" rel="noopener noreferrer" className="hover:text-mara-gold-300 transition-colors">Aduan MARA</a></li>
            <li><a href="https://www.mara.gov.my/sektor-pendidikan-lp/" target="_blank" rel="noopener noreferrer" className="hover:text-mara-gold-300 transition-colors">Sektor Pendidikan</a></li>
            <li><a href="https://www.mara.gov.my/hubungi-kami-3/" target="_blank" rel="noopener noreferrer" className="hover:text-mara-gold-300 transition-colors">Hubungi Kami</a></li>
          </ul>
        </div>

        {/* e-Perkhidmatan */}
        <div className="md:col-span-1">
          <h4 className="font-display text-[13px] font-semibold uppercase tracking-wider text-mara-gold-300 mb-3">
            {t('footer.eservices', 'e-Perkhidmatan')}
          </h4>
          <ul className="space-y-2 text-[12px] opacity-80">
            <li><a href="https://myusahawan.mara.gov.my/" target="_blank" rel="noopener noreferrer" className="hover:text-mara-gold-300 transition-colors">MyUsahawan</a></li>
            <li><a href="https://educationloan.mara.gov.my/" target="_blank" rel="noopener noreferrer" className="hover:text-mara-gold-300 transition-colors">MyEduloan</a></li>
            <li><a href="https://mypremis.mara.gov.my/" target="_blank" rel="noopener noreferrer" className="hover:text-mara-gold-300 transition-colors">MyPremis</a></li>
            <li><a href="https://www.mara.gov.my/alumni/" target="_blank" rel="noopener noreferrer" className="hover:text-mara-gold-300 transition-colors">Alumni</a></li>
          </ul>
        </div>

        {/* Pautan luar */}
        <div className="md:col-span-1">
          <h4 className="font-display text-[13px] font-semibold uppercase tracking-wider text-mara-gold-300 mb-3">
            {t('footer.related', 'Pautan')}
          </h4>
          <ul className="space-y-2 text-[12px] opacity-80">
            <li><a href="https://www.malaysia.gov.my" target="_blank" rel="noopener noreferrer" className="hover:text-mara-gold-300 transition-colors">MyGovernment</a></li>
            <li><a href="https://www.rurallink.gov.my" target="_blank" rel="noopener noreferrer" className="hover:text-mara-gold-300 transition-colors">KKDW</a></li>
            <li><a href="https://www.kemas.gov.my" target="_blank" rel="noopener noreferrer" className="hover:text-mara-gold-300 transition-colors">KEMAS</a></li>
            <li><a href="https://www.risda.gov.my" target="_blank" rel="noopener noreferrer" className="hover:text-mara-gold-300 transition-colors">RISDA</a></li>
          </ul>
        </div>
      </div>

      {/* Garis emas */}
      <div className="h-px bg-gradient-to-r from-transparent via-mara-gold-400 to-transparent opacity-50" />

      {/* Copyright */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] opacity-70">
        <p>© {new Date().getFullYear()} Majlis Amanah Rakyat (MARA) · Hak Cipta Terpelihara</p>
        <div className="flex items-center gap-3">
          <a href="#" className="hover:text-mara-gold-300 transition-colors">Terma &amp; Syarat</a>
          <span>·</span>
          <a href="#" className="hover:text-mara-gold-300 transition-colors">Dasar Privasi</a>
          <span>·</span>
          <a href="#" className="hover:text-mara-gold-300 transition-colors">Penafian</a>
        </div>
      </div>
    </footer>
  );
}
