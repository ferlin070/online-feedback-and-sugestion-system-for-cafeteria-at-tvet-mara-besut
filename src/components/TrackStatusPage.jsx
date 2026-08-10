import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { StatusBadge, PriorityBadge } from './Badges';
import { formatTime } from '../lib/chartData';

export function TrackStatusPage({ referenceId, onBack }) {
  const { t } = useTranslation();
  const [refId, setRefId] = useState(referenceId || '');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!refId.trim()) {
      setError(t('track.error_empty', 'Sila masukkan ID rujukan anda.'));
      return;
    }
    setLoading(true);
    setError(null);
    setSearched(false);
    try {
      const snap = await getDoc(doc(db, 'feedback', refId.trim()));
      if (snap.exists()) {
        setFeedback({ id: snap.id, ...snap.data() });
      } else {
        setFeedback(null);
        setError(t('track.error_not_found', 'Aduan tidak ditemui. Sila semak ID rujukan anda.'));
      }
      setSearched(true);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError(t('track.error_general', 'Ralat mendapatkan maklum balas. Sila cuba lagi.'));
      setFeedback(null);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-lg mx-auto py-10 px-1">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[12px] text-ink-400 hover:text-mara-blue-600 dark:hover:text-mara-blue-400 transition-colors mb-5 cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        {t('form.back_btn')}
      </button>

      <div className="mb-6">
        <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-mara-blue-500">
          {t('track.eyebrow', 'Semakan Aduan')}
        </span>
        <h1 className="font-display text-3xl tracking-tight text-[var(--heading-color)] mt-1">
          {t('track.title')}
        </h1>
        <p className="text-[13px] text-ink-500 dark:text-ink-400 mt-2 leading-relaxed max-w-md">
          {t('track.subtitle')}
        </p>
      </div>

      <div className="gov-card p-5">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={refId}
            onChange={(e) => setRefId(e.target.value)}
            placeholder={t('track.placeholder')}
            className="gov-input flex-1 px-3 py-2.5 text-[13px] font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-mara px-5 text-[13px] inline-flex justify-center items-center whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? t('common.loading') : t('track.btn_search')}
          </button>
        </form>

        {error && (
          <div className="mt-4 px-3 py-2 rounded-md border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-[12px]">
            {error}
          </div>
        )}

        {searched && feedback && (
          <div className="mt-5 p-4 rounded-md border border-[var(--border-color)] bg-sand-50/60 dark:bg-ink-900/40 animate-fade-in">
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <StatusBadge status={feedback.status} />
              <PriorityBadge priority={feedback.priority} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-400">
                {t(`categories.${feedback.category}`, feedback.category)}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-1">
                {t('form.description')}
              </p>
              <div className="p-3 rounded-md bg-[var(--bg-elev)] border border-[var(--border-color)] text-[13px] text-[var(--text-color)] whitespace-pre-wrap leading-relaxed">
                {feedback.description}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3 text-[11px]">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-ink-400">{t('admin.details_id')}</p>
                <p className="font-mono text-[10px] text-[var(--text-color)] select-all break-all">{feedback.id}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-ink-400">{t('admin.col_date', 'Tarikh')}</p>
                <p className="text-[var(--text-color)]">{formatTime(feedback.submittedAt)}</p>
              </div>
              {feedback.location && (
                <div className="col-span-2">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-ink-400">{t('locations.filter_label')}</p>
                  <p className="text-mara-blue-600 dark:text-mara-blue-400">{feedback.location}</p>
                </div>
              )}
              {feedback.adminNotes && (
                <div className="col-span-2 pt-2 border-t border-[var(--border-color)]">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-ink-400">{t('admin.details_notes')}</p>
                  <p className="text-[var(--text-color)] text-[12px] leading-relaxed">{feedback.adminNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
