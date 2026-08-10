import { useTranslation } from 'react-i18next';

export function HomePage({ onSubmitFeedback, onTrackStatus }) {
  const { t } = useTranslation();

  return (
    <section className="hero-tvetmara w-full relative">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">
          {/* Left: editorial intro */}
          <div className="md:col-span-3 space-y-6">
            <span className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-mara-blue-500">
              <span className="w-6 h-px bg-mara-blue-400" />
              {t('home.eyebrow', 'Kafeteria TVET MARA Besut')}
            </span>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-[var(--heading-color)]">
              {t('home.title_a', 'Suara anda,')}{' '}
              <em className="not-italic text-mara-blue-600 dark:text-mara-blue-400 font-display italic">
                {t('home.title_b', 'mendapat sambutan.')}
              </em>
            </h1>

            <p className="text-[15px] sm:text-base text-ink-500 dark:text-ink-300 leading-relaxed max-w-md">
              {t('home.lede', 'Aduan, cadangan, atau pujian untuk kafeteria TVET MARA Besut — semuanya sampai ke meja pengurusan. Tanpa borang kertas, tanpa emel yang hilang.')}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onSubmitFeedback}
                className="btn-clay px-6 py-3 text-sm inline-flex items-center gap-2 cursor-pointer"
              >
                {t('form.submit_feedback_btn')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              {onTrackStatus && (
                <button
                  onClick={onTrackStatus}
                  className="px-5 py-3 text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-mara-blue-600 dark:hover:text-mara-blue-400 transition-colors cursor-pointer"
                >
                  {t('track.btn_title', 'Semak Status Aduan')} →
                </button>
              )}
            </div>
          </div>

          {/* Right: meta card — posted notice */}
          <aside className="md:col-span-2">
            <div className="card-warm p-5 sm:p-6 relative">
              <div className="absolute -top-2 left-6 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-mara-blue-500 text-sand-50 rounded-sm rotate-[-1.5deg] shadow-sm">
                {t('home.notice_tag', 'Notis')}
              </div>
              <p className="font-display text-[15px] leading-snug text-[var(--heading-color)] mt-2">
                {t('home.notice_title', 'Imbas QR di kaunter untuk hantar aduan.')}
              </p>
              <p className="text-[13px] text-ink-500 dark:text-ink-400 mt-2 leading-relaxed">
                {t('home.notice_body', 'Setiap meja ada kod QR tersendiri. Imbas, isi, hantar — kami akan semak dan maklum balas dalam masa yang berpatutan.')}
              </p>
              <hr className="rule-hand my-4" />
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-ink-400">
                <span>TVET MARA Besut</span>
                <span className="text-mara-blue-500">v1.0</span>
              </div>
            </div>
          </aside>
        </div>

        {/* Strip maklumat di bawah hero */}
        <div className="mt-12 sm:mt-16 pt-6 border-t border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-md bg-mara-blue-100 dark:bg-mara-blue-900/40 text-mara-blue-600 dark:text-mara-blue-400 grid place-items-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <div>
              <p className="text-[12px] font-semibold text-[var(--heading-color)]">{t('home.feat_fast_title', 'Respons Pantas')}</p>
              <p className="text-[11px] text-ink-400 leading-relaxed mt-0.5">{t('home.feat_fast_desc', 'Aduan diterima masa nyata oleh pengurusan.')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-md bg-mara-cyan-100 dark:bg-mara-cyan-900/40 text-mara-cyan-600 dark:text-mara-cyan-300 grid place-items-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div>
              <p className="text-[12px] font-semibold text-[var(--heading-color)]">{t('home.feat_track_title', 'Jejak Status')}</p>
              <p className="text-[11px] text-ink-400 leading-relaxed mt-0.5">{t('home.feat_track_desc', 'Semak status aduan guna ID rujukan.')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-md bg-sand-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300 grid place-items-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <div>
              <p className="text-[12px] font-semibold text-[var(--heading-color)]">{t('home.feat_anon_title', 'Tanpa Nama')}</p>
              <p className="text-[11px] text-ink-400 leading-relaxed mt-0.5">{t('home.feat_anon_desc', 'Pilihan hantar aduan secara tanpa nama.')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
