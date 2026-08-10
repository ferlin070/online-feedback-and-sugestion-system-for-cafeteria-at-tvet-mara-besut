import { useTranslation } from 'react-i18next';
import { StatusBadge, PriorityBadge } from './Badges';
import { formatTime } from '../lib/chartData';

export function FeedbackList({ feedbacks, selectedFeedback, onSelectFeedback, filters, onFiltersChange, locations }) {
  const { t } = useTranslation();

  const hasHighPriority = feedbacks.some(f => f.status === 'new' && f.priority === 'high');

  return (
    <div className="flex-1 glass-card rounded-2xl border border-slate-800/80 shadow-2xl p-6 flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">
            {t('admin.dashboard_title')}
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {t('admin.dashboard_subtitle', 'Memaparkan aduan dari pengguna secara masa nyata.')}
          </p>
        </div>
        {hasHighPriority && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold animate-pulse shadow-md shadow-red-500/5">
            <span className="w-2 h-2 rounded-full bg-red-500 block"></span>
            {t('admin.alert_critical_title')}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('admin.col_status')}</label>
          <select value={filters.status} onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })} className="w-full px-3 py-2 rounded-lg glass-input text-sm cursor-pointer">
            <option value="All">{t('admin.filter_status_all')}</option>
            <option value="new">{t('admin.status_new')}</option>
            <option value="under_review">{t('admin.status_under_review')}</option>
            <option value="resolved">{t('admin.status_resolved')}</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('admin.col_category')}</label>
          <select value={filters.category} onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })} className="w-full px-3 py-2 rounded-lg glass-input text-sm cursor-pointer">
            <option value="All">{t('admin.filter_all')}</option>
            <option value="Makanan">{t('categories.Makanan')}</option>
            <option value="Kebersihan">{t('categories.Kebersihan')}</option>
            <option value="Kemudahan">{t('categories.Kemudahan')}</option>
            <option value="Perkhidmatan">{t('categories.Perkhidmatan')}</option>
            <option value="Umum">{t('categories.Umum')}</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('admin.col_priority', 'Keutamaan')}</label>
          <select value={filters.priority} onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value })} className="w-full px-3 py-2 rounded-lg glass-input text-sm cursor-pointer">
            <option value="All">{t('admin.filter_priority_all')}</option>
            <option value="high">{t('admin.priority_high')}</option>
            <option value="medium">{t('admin.priority_medium')}</option>
            <option value="low">{t('admin.priority_low')}</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t('locations.filter_label')}</label>
          <select value={filters.location} onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })} className="w-full px-3 py-2 rounded-lg glass-input text-sm cursor-pointer">
            <option value="All">{t('locations.filter_all')}</option>
            <option value="manual">{t('locations.fallback_manual')}</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[500px] pr-2 space-y-3">
        {feedbacks.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">{t('admin.no_data')}</div>
        ) : (
          feedbacks.map((fb) => (
            <div
              key={fb.id}
              onClick={() => onSelectFeedback(fb)}
              className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                selectedFeedback?.id === fb.id
                  ? 'bg-slate-900/80 border-sky-500/60 shadow-lg shadow-sky-500/5'
                  : 'bg-slate-900/30 border-slate-900 hover:border-slate-800 hover:bg-slate-900/50'
              }`}
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={fb.status} />
                  <PriorityBadge priority={fb.priority} />
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-800 text-slate-300">
                    {t(`categories.${fb.category}`, fb.category)}
                  </span>
                  {fb.location && (
                    <span className="text-slate-500 text-xs flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {fb.location}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-200 font-light truncate pr-6">{fb.description}</p>
                <p className="text-[10px] text-slate-500">{formatTime(fb.submittedAt)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {fb.photoUrl && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-800">
                    <img src={fb.photoUrl} alt="Aduan" className="w-full h-full object-cover" />
                  </div>
                )}
                <svg className="w-5 h-5 text-slate-600 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
