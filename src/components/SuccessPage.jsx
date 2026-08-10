import { useTranslation } from 'react-i18next';

export function SuccessPage({ referenceId, onSubmitAnother }) {
  const { t } = useTranslation();

  return (
    <section className="w-full max-w-md mx-auto py-12 px-1 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-mara-cyan-100 dark:bg-mara-cyan-900/40 text-mara-cyan-600 dark:text-mara-cyan-300 border border-mara-cyan-300 dark:border-mara-cyan-700 mb-5">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-mara-cyan-500">
        {t('form.success_eyebrow', 'Diterima')}
      </span>
      <h1 className="font-display text-3xl tracking-tight text-[var(--heading-color)] mt-2">
        {t('form.success_title')}
      </h1>
      <p className="text-[14px] text-ink-500 dark:text-ink-400 mt-2 leading-relaxed">
        {t('form.success_desc')}
      </p>

      <div className="card-warm mt-6 p-5 text-left">
        <p className="text-[10px] font-mono uppercase tracking-wider text-ink-400">
          {t('form.ref_id')}
        </p>
        <p className="font-mono text-[15px] font-medium text-mara-blue-600 dark:text-mara-blue-400 mt-1 break-all select-all">
          {referenceId}
        </p>
        <hr className="rule-hand my-3" />
        <p className="text-[11px] text-ink-400 leading-relaxed">
          {t('form.ref_id_sub')} {t('form.ref_id_sub2', 'Anda boleh gunakan ID ini untuk semak status aduan kemudian.')}
        </p>
      </div>

      <button
        onClick={onSubmitAnother}
        className="btn-clay w-full mt-5 py-3 text-sm inline-flex justify-center items-center gap-2 cursor-pointer"
      >
        {t('form.new_submission_btn')}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </section>
  );
}
