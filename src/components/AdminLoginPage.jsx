import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function AdminLoginPage({ onLogin, onBack, authError }) {
  const { t } = useTranslation();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(authError || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Sila masukkan emel dan kata laluan.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onLogin(loginEmail, loginPassword);
      setLoginEmail('');
      setLoginPassword('');
    } catch (err) {
      console.error('Error signing in:', err);
      setError('Emel atau kata laluan salah. Sila cuba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full glass-card p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
          {t('login.title')}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          {t('login.subtitle', 'Sila log masuk menggunakan emel dan kata laluan admin anda.')}
        </p>
      </div>

      {(error || authError) && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm text-center">
          {error || authError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            {t('login.email')}
          </label>
          <input
            id="email"
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
            placeholder="admin@kafe-tvet.com"
            className="w-full px-4 py-3 rounded-xl glass-input text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-sky-500 text-base"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            {t('login.password')}
          </label>
          <input
            id="password"
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl glass-input text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-sky-500 text-base"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onBack} className="flex-1 py-3 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-colors border border-slate-300 dark:border-slate-800 font-medium">
            {t('form.back_btn')}
          </button>
          <button type="submit" disabled={submitting} className="flex-1 btn-primary flex justify-center items-center">
            {submitting ? t('common.loading') : t('login.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}
