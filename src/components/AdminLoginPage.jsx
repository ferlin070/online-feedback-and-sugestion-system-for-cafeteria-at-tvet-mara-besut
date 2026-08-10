import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function AdminLoginPage({ onLogin, onBack, authError }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(authError || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(t('login.err_empty', 'Sila masukkan emel dan kata laluan.'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onLogin(email, password);
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Error signing in:', err);
      setError(t('login.err_invalid', 'Emel atau kata laluan salah. Sila cuba lagi.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full max-w-sm mx-auto py-12 px-1">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[12px] text-ink-400 hover:text-clay-600 dark:hover:text-clay-400 transition-colors mb-6 cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        {t('form.back_btn')}
      </button>

      <div className="mb-7">
        <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-clay-500">
          {t('login.eyebrow', 'Akses Terhad')}
        </span>
        <h1 className="font-display text-3xl tracking-tight text-[var(--heading-color)] mt-1">
          {t('login.title')}
        </h1>
        <p className="text-[13px] text-ink-500 dark:text-ink-400 mt-2 leading-relaxed">
          {t('login.subtitle', 'Log masuk untuk mengurus aduan kafeteria.')}
        </p>
      </div>

      {(error || authError) && (
        <div role="alert" className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-[13px] dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
          </svg>
          <span>{error || authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-[11px] font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-1.5">
            {t('login.email')}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="admin@kafe-tvet.com"
            className="input-warm w-full px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-[11px] font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-1.5">
            {t('login.password')}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="input-warm w-full px-4 py-2.5 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-clay w-full py-3 text-sm inline-flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-2"
        >
          {submitting ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
              {t('common.loading')}
            </>
          ) : t('login.submit')}
        </button>
      </form>
    </section>
  );
}
