import { useTranslation } from 'react-i18next';

export function HomePage({ onSubmitFeedback, onTrackStatus }) {
  const { t } = useTranslation();

  return (
    <div className="max-w-xl w-full text-center space-y-8 glass-card p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-2xl animate-fade-in my-4 sm:my-8">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-xl shadow-sky-500/10">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-900 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-display">
          {t('form.welcome_title')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-md mx-auto font-light leading-relaxed">
          {t('form.welcome_subtitle')}
        </p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onSubmitFeedback}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-sky-500/15 hover:shadow-sky-500/35 active:scale-[0.98]"
        >
          {t('form.submit_feedback_btn')}
        </button>
        {onTrackStatus && (
          <button
            onClick={onTrackStatus}
            className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all border border-slate-200 dark:border-slate-800"
          >
            {t('track.btn_title', 'Semak Status Aduan')}
          </button>
        )}
      </div>

      <div className="pt-8 border-t border-slate-200 dark:border-slate-800/40 flex justify-between text-xs text-slate-500">
        <span>{t('form.easy_qr', 'Akses QR Mudah')}</span>
        <span>TVET MARA Besut</span>
      </div>
    </div>
  );
}
