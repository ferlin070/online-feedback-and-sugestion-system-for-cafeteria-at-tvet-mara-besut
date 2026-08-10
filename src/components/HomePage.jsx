import { useTranslation } from 'react-i18next';

export function HomePage({ onSubmitFeedback, onTrackStatus }) {
  const { t } = useTranslation();

  return (
    <section className="w-full max-w-3xl mx-auto py-10 sm:py-16 px-1">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">
        {/* Left: editorial intro */}
        <div className="md:col-span-3 space-y-6">
          <span className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-clay-500">
            <span className="w-6 h-px bg-clay-400" />
            {t('home.eyebrow', 'Sistem Maklum Balas Kafeteria')}
          </span>

          <h1 className="font-display text-4xl sm:text-5xl leading-[1.08] tracking-tight text-[var(--heading-color)]">
            {t('home.title_a', 'Suara anda,')}{' '}
            <em className="not-italic text-clay-600 dark:text-clay-400 font-display italic">
              {t('home.title_b', 'mendapat sambutan.')}
            </em>
          </h1>

          <p className="text-[15px] sm:text-base text-ink-500 dark:text-ink-300 leading-relaxed max-w-md">
            {t('home.lede', 'Aduan, cadangan, atau pujian — semuanya sampai ke meja pengurusan kafeteria. Tanpa borang kertas, tanpa emel yang hilang.')}
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
                className="px-5 py-3 text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-clay-600 dark:hover:text-clay-400 transition-colors cursor-pointer"
              >
                {t('track.btn_title', 'Semak Status Aduan')} →
              </button>
            )}
          </div>
        </div>

        {/* Right: meta card — feels like a posted notice, not a feature card */}
        <aside className="md:col-span-2">
          <div className="card-warm p-5 sm:p-6 relative">
            <div className="absolute -top-2 left-6 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-clay-500 text-sand-50 rounded-sm rotate-[-1.5deg] shadow-sm">
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
              <span className="text-clay-500">v1.0</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
