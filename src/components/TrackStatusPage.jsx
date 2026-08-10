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
      const ref = doc(db, 'feedback', refId.trim());
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setFeedback({ id: snap.id, ...snap.data() });
        setError(null);
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
    <div className="max-w-lg w-full glass-card p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
          {t('track.title', 'Semak Status Aduan')}
        </h2>
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400">
        {t('track.subtitle', 'Masukkan ID rujukan yang anda terima selepas menghantar aduan untuk melihat status semasa.')}
      </p>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={refId}
          onChange={(e) => setRefId(e.target.value)}
          placeholder={t('track.placeholder', 'Tampal ID rujukan di sini...')}
          className="flex-1 px-4 py-3 rounded-xl glass-input text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-sky-500 text-sm font-mono"
        />
        <button type="submit" disabled={loading} className="btn-primary px-5 flex justify-center items-center whitespace-nowrap">
          {loading ? t('common.loading') : t('track.btn_search', 'Cari')}
        </button>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {searched && feedback && (
        <div className="space-y-4 border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50/50 dark:bg-slate-950/30 animate-fade-in">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={feedback.status} />
            <PriorityBadge priority={feedback.priority} />
            <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {t(`categories.${feedback.category}`, feedback.category)}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">{t('form.description')}</span>
            <div className="p-3 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-lg text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
              {feedback.description}
            </div>
          </div>

          {feedback.photoUrl && (
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">{t('admin.col_photo')}</span>
              <a href={feedback.photoUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                <img src={feedback.photoUrl} alt="Lampiran" className="w-24 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-800" />
              </a>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('admin.details_id')}</span>
              <span className="text-slate-700 dark:text-slate-300 font-mono text-[10px] select-all">{feedback.id}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('admin.col_date', 'Tarikh')}</span>
              <span className="text-slate-700 dark:text-slate-300">{formatTime(feedback.submittedAt)}</span>
            </div>
            {feedback.location && (
              <div className="col-span-2">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('locations.filter_label')}</span>
                <span className="text-slate-700 dark:text-slate-300">{feedback.location}</span>
              </div>
            )}
            {feedback.adminNotes && (
              <div className="col-span-2">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('admin.details_notes')}</span>
                <span className="text-slate-700 dark:text-slate-300">{feedback.adminNotes}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <button onClick={onBack} className="w-full py-3 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-colors border border-slate-300 dark:border-slate-800 font-medium text-sm">
        {t('form.back_btn')}
      </button>
    </div>
  );
}