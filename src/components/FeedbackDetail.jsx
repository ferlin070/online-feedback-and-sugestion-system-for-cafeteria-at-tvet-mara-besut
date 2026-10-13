import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge, PriorityBadge } from './Badges';
import { FeedbackPhoto } from './FeedbackPhoto';
import { formatTime } from '../lib/chartData';

const CATEGORIES = ['Makanan', 'Kebersihan', 'Kemudahan', 'Perkhidmatan', 'Umum'];

export function FeedbackDetail({ feedback, onUpdate }) {
  const { t } = useTranslation();
  const [editStatus, setEditStatus] = useState('new');
  const [editCategory, setEditCategory] = useState('Umum');
  const [editPriority, setEditPriority] = useState('medium');
  const [editAdminNotes, setEditAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (feedback) {
      setEditStatus(feedback.status || 'new');
      setEditCategory(feedback.category || 'Umum');
      setEditPriority(feedback.priority || 'medium');
      setEditAdminNotes(feedback.adminNotes || '');
    }
  }, [feedback]);

  if (!feedback) {
    return (
      <div className="w-full lg:w-[420px] card-warm p-8 flex flex-col items-center justify-center text-center">
        <svg className="w-10 h-10 text-ink-300 dark:text-ink-600 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
        </svg>
        <p className="font-display text-[15px] text-[var(--heading-color)]">
          {t('admin.details_no_selection_title', 'Pilih satu aduan')}
        </p>
        <p className="text-[12px] text-ink-400 mt-1 max-w-[220px]">
          {t('admin.details_no_selection_desc', 'Klik mana-mana item di senarai untuk lihat perincian penuh.')}
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await onUpdate(feedback.id, {
        category: editCategory,
        priority: editPriority,
        status: editStatus,
        adminNotes: editAdminNotes.trim() || null,
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="w-full lg:w-[420px] card-warm p-5 flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
        <h3 className="font-display text-lg text-[var(--heading-color)]">
          {t('admin.details_title')}
        </h3>
        <span className="text-[10px] font-mono text-ink-400 select-all break-all text-right max-w-[180px]">
          {feedback.id}
        </span>
      </div>

      <div className="flex gap-1.5 mt-3">
        <StatusBadge status={feedback.status} />
        <PriorityBadge priority={feedback.priority} />
      </div>

      {feedback.photoUrl && (
        <a
          href={feedback.photoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block rounded-md overflow-hidden border border-[var(--border-color)] relative group"
        >
          <FeedbackPhoto feedback={feedback} alt="Lampiran" className="w-full h-36 object-cover" />
          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-sm bg-ink-900/70 text-sand-50 text-[10px] font-mono uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
            {t('admin.open_full_photo', 'Buka ↗')}
          </span>
        </a>
      )}

      <div className="grid grid-cols-2 gap-3 mt-4 text-[12px]">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-ink-400">
            {t('admin.details_sender', 'Pengirim')}
          </p>
          <p className="text-[var(--text-color)] mt-0.5">
            {feedback.isAnonymous ? t('admin.details_anonymous_yes') : t('admin.details_anonymous_no')}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-ink-400">
            {t('admin.details_date', 'Dihantar')}
          </p>
          <p className="text-[var(--text-color)] mt-0.5">{formatTime(feedback.submittedAt)}</p>
        </div>
        {feedback.location && (
          <div className="col-span-2 pt-2 border-t border-[var(--border-color)]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-ink-400">
              {t('locations.filter_label')}
            </p>
            <p className="text-mara-blue-600 dark:text-mara-blue-400 mt-0.5 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-5.2-7-11a7 7 0 1 1 14 0c0 5.8-7 11-7 11z" />
              </svg>
              {feedback.location}
              {feedback.locationId && (
                <span className="text-[10px] font-mono text-ink-400 ml-1">({feedback.locationId})</span>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-1">
          {t('form.description')}
        </p>
        <div className="p-3 rounded-md bg-sand-50 dark:bg-ink-900/50 border border-[var(--border-color)] text-[13px] leading-relaxed text-[var(--text-color)] whitespace-pre-wrap max-h-32 overflow-y-auto">
          {feedback.description}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 mt-4 pt-3 border-t border-[var(--border-color)]">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-1">
              {t('admin.details_status')}
            </label>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="input-warm w-full px-2.5 py-1.5 text-[12px] cursor-pointer">
              <option value="new">{t('admin.status_new')}</option>
              <option value="under_review">{t('admin.status_under_review')}</option>
              <option value="resolved">{t('admin.status_resolved')}</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-1">
              {t('admin.col_category')}
            </label>
            <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="input-warm w-full px-2.5 py-1.5 text-[12px] cursor-pointer">
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{t(`categories.${c}`)}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-1">
            {t('admin.details_priority')}
          </label>
          <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="input-warm w-full px-2.5 py-1.5 text-[12px] cursor-pointer">
            <option value="high">{t('admin.priority_high')}</option>
            <option value="medium">{t('admin.priority_medium')}</option>
            <option value="low">{t('admin.priority_low')}</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-1">
            {t('admin.details_notes')}
          </label>
          <textarea
            value={editAdminNotes}
            onChange={(e) => setEditAdminNotes(e.target.value)}
            rows="3"
            placeholder={t('admin.details_notes_placeholder')}
            className="input-warm w-full px-3 py-2 text-[12px] resize-y"
          />
        </div>
        <button
          type="submit"
          disabled={updating}
          className="btn-clay w-full py-2.5 text-[12px] inline-flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {updating ? t('common.saving') : t('admin.details_save')}
        </button>
      </form>
    </div>
  );
}
