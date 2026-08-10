import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge, PriorityBadge } from './Badges';
import { formatTime } from '../lib/chartData';

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
      <div className="w-full lg:w-[450px] glass-card rounded-2xl border border-slate-800/80 shadow-2xl p-6 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-400">{t('admin.details_no_selection_title', 'Tiada Aduan Dipilih')}</h4>
            <p className="text-xs text-slate-600 mt-1 max-w-[200px] mx-auto">
              {t('admin.details_no_selection_desc', 'Klik mana-mana aduan daripada senarai untuk melihat perincian penuh.')}
            </p>
          </div>
        </div>
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
    <div className="w-full lg:w-[450px] glass-card rounded-2xl border border-slate-800/80 shadow-2xl p-6 flex flex-col justify-between">
      <div className="space-y-6 flex-1 flex flex-col justify-between">
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <h3 className="text-lg font-bold font-display text-white">{t('admin.details_title')}</h3>
            <span className="text-[10px] font-mono text-slate-500 select-all">{t('admin.details_id')}: {feedback.id}</span>
          </div>

          <div className="flex gap-2">
            <StatusBadge status={feedback.status} />
            <PriorityBadge priority={feedback.priority} />
          </div>

          {feedback.photoUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-800 max-h-[160px] bg-slate-950/30">
              <a href={feedback.photoUrl} target="_blank" rel="noopener noreferrer" className="relative group block">
                <img src={feedback.photoUrl} alt="Lampiran aduan" className="w-full h-36 object-cover group-hover:opacity-90 transition-opacity" />
                <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white font-medium transition-opacity">
                  {t('admin.open_full_photo', 'Buka fail penuh ↗')}
                </div>
              </a>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/30 p-3 rounded-lg border border-slate-900">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('admin.details_sender', 'Pengirim')}</span>
              <span className="text-slate-300 font-medium">{feedback.isAnonymous ? t('admin.details_anonymous_yes') : t('admin.details_anonymous_no')}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('admin.details_date', 'Dihantar pada')}</span>
              <span className="text-slate-300 font-medium">{formatTime(feedback.submittedAt)}</span>
            </div>
            {feedback.location && (
              <div className="col-span-2 border-t border-slate-900/50 pt-2 mt-1">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('locations.filter_label')}</span>
                <span className="text-sky-400 font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {feedback.location}
                  {feedback.locationId && <span className="text-[10px] text-slate-500 font-mono">({feedback.locationId})</span>}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">{t('form.description')}</span>
            <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-sm font-light leading-relaxed text-slate-200 whitespace-pre-wrap max-h-36 overflow-y-auto">
              {feedback.description}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-3 border-t border-slate-900">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('admin.details_status')}</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="w-full px-3 py-2 rounded-lg glass-input text-xs cursor-pointer">
                  <option value="new">{t('admin.status_new')}</option>
                  <option value="under_review">{t('admin.status_under_review')}</option>
                  <option value="resolved">{t('admin.status_resolved')}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('admin.col_category')}</label>
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg glass-input text-xs cursor-pointer">
                  <option value="Makanan">{t('categories.Makanan')}</option>
                  <option value="Kebersihan">{t('categories.Kebersihan')}</option>
                  <option value="Kemudahan">{t('categories.Kemudahan')}</option>
                  <option value="Perkhidmatan">{t('categories.Perkhidmatan')}</option>
                  <option value="Umum">{t('categories.Umum')}</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">{t('admin.details_priority')}</label>
              <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="w-full px-3 py-2 rounded-lg glass-input text-xs cursor-pointer">
                <option value="high">{t('admin.priority_high')}</option>
                <option value="medium">{t('admin.priority_medium')}</option>
                <option value="low">{t('admin.priority_low')}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">{t('admin.details_notes')}</label>
              <textarea value={editAdminNotes} onChange={(e) => setEditAdminNotes(e.target.value)} rows="3" placeholder={t('admin.details_notes_placeholder')} className="w-full px-3 py-2 rounded-lg glass-input text-xs placeholder-slate-600 focus:ring-sky-500" />
            </div>
            <button type="submit" disabled={updating} className="w-full btn-primary py-2.5 text-xs font-semibold flex justify-center items-center">
              {updating ? t('common.saving') : t('admin.details_save')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
