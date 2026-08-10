import { useTranslation } from 'react-i18next';

export function SuccessPage({ referenceId, onSubmitAnother }) {
  const { t } = useTranslation();

  return (
    <div className="max-w-md w-full text-center space-y-6 glass-card p-8 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-2xl animate-fade-in my-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/5 mb-2">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
          {t('form.success_title')}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          {t('form.success_desc')}
        </p>
      </div>

      <div className="bg-slate-100/80 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 space-y-2">
        <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
          {t('form.ref_id')}
        </span>
        <div className="font-mono text-base font-semibold text-sky-600 dark:text-sky-400 select-all">
          {referenceId}
        </div>
        <p className="text-[10px] text-slate-500">
          {t('form.ref_id_sub')}
        </p>
      </div>

      <div className="pt-2">
        <button onClick={onSubmitAnother} className="w-full btn-primary py-3 flex justify-center items-center">
          {t('form.new_submission_btn')}
        </button>
      </div>
    </div>
  );
}
