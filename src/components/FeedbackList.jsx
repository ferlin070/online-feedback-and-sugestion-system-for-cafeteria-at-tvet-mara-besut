import { useTranslation } from 'react-i18next';
import { StatusBadge, PriorityBadge } from './Badges';
import { formatTime } from '../lib/chartData';

export function FeedbackList({ feedbacks, selectedFeedback, onSelectFeedback, filters, onFiltersChange, locations }) {
  const { t } = useTranslation();
  const hasHighPriority = feedbacks.some(f => f.status === 'new' && f.priority === 'high');

  const filterField = (key, label, options, allLabel) => (
    <div className="space-y-1">
      <label className="text-[10px] font-mono uppercase tracking-wider text-ink-400">{label}</label>
      <select
        value={filters[key]}
        onChange={(e) => onFiltersChange({ ...filters, [key]: e.target.value })}
        className="gov-input w-full px-2.5 py-1.5 text-[12px] cursor-pointer"
      >
        <option value="All">{allLabel}</option>
        {options.map(([val, lbl]) => (
          <option key={val} value={val}>{lbl}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="flex-1 gov-card p-5 flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
        <div>
          <h2 className="font-display text-xl text-[var(--heading-color)]">
            {t('admin.dashboard_title')}
          </h2>
          <p className="text-[11px] text-ink-400 mt-0.5">
            {t('admin.dashboard_subtitle', 'Aduan dari pengguna secara masa nyata.')}
          </p>
        </div>
        {hasHighPriority && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {t('admin.alert_critical_title')}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {filterField('status', t('admin.col_status'), [
          ['new', t('admin.status_new')],
          ['under_review', t('admin.status_under_review')],
          ['resolved', t('admin.status_resolved')],
        ], t('admin.filter_status_all'))}
        {filterField('category', t('admin.col_category'), [
          ['Makanan', t('categories.Makanan')],
          ['Kebersihan', t('categories.Kebersihan')],
          ['Kemudahan', t('categories.Kemudahan')],
          ['Perkhidmatan', t('categories.Perkhidmatan')],
          ['Umum', t('categories.Umum')],
        ], t('admin.filter_all'))}
        {filterField('priority', t('admin.col_priority', 'Prioriti'), [
          ['high', t('admin.priority_high')],
          ['medium', t('admin.priority_medium')],
          ['low', t('admin.priority_low')],
        ], t('admin.filter_priority_all'))}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-ink-400">{t('locations.filter_label')}</label>
          <select
            value={filters.location}
            onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
            className="gov-input w-full px-2.5 py-1.5 text-[12px] cursor-pointer"
          >
            <option value="All">{t('locations.filter_all')}</option>
            <option value="manual">{t('locations.fallback_manual')}</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[520px] pr-1 space-y-2">
        {feedbacks.length === 0 ? (
          <div className="py-14 text-center text-[13px] text-ink-400">{t('admin.no_data')}</div>
        ) : (
          feedbacks.map((fb) => (
            <button
              key={fb.id}
              onClick={() => onSelectFeedback(fb)}
              className={`w-full text-left p-3.5 rounded-md border transition-all cursor-pointer flex gap-3 ${
                selectedFeedback?.id === fb.id
                  ? 'border-mara-blue-400 bg-mara-blue-50 dark:bg-mara-blue-900/25'
                  : 'border-[var(--border-color)] hover:border-mara-blue-300 hover:bg-sand-50/60 dark:hover:bg-ink-900/40'
              }`}
            >
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusBadge status={fb.status} />
                  <PriorityBadge priority={fb.priority} />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-ink-400">
                    {t(`categories.${fb.category}`, fb.category)}
                  </span>
                </div>
                <p className="text-[13px] text-[var(--text-color)] leading-snug line-clamp-2">
                  {fb.description}
                </p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-ink-400">
                  <span>{formatTime(fb.submittedAt)}</span>
                  {fb.location && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-5.2-7-11a7 7 0 1 1 14 0c0 5.8-7 11-7 11z" />
                      </svg>
                      {fb.location}
                    </span>
                  )}
                </div>
              </div>
              {fb.photoUrl && (
                <div className="w-11 h-11 shrink-0 rounded-md overflow-hidden border border-[var(--border-color)]">
                  <img src={fb.photoUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
