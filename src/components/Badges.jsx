import { useTranslation } from 'react-i18next';

const STATUS_STYLES = {
  new: 'bg-clay-100 text-clay-700 border-clay-300 dark:bg-clay-900/40 dark:text-clay-300 dark:border-clay-800',
  under_review: 'bg-olive-100 text-olive-700 border-olive-300 dark:bg-olive-900/40 dark:text-olive-300 dark:border-olive-800',
  resolved: 'bg-ink-100 text-ink-600 border-ink-200 dark:bg-ink-800/50 dark:text-ink-200 dark:border-ink-700',
};

const PRIORITY_STYLES = {
  high: 'bg-red-50 text-red-700 border-red-300 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/40',
  medium: 'bg-clay-50 text-clay-700 border-clay-200 dark:bg-clay-900/30 dark:text-clay-300 dark:border-clay-800',
  low: 'bg-ink-50 text-ink-500 border-ink-200 dark:bg-ink-800/40 dark:text-ink-400 dark:border-ink-700',
};

export function StatusBadge({ status }) {
  const { t } = useTranslation();
  const label = status === 'new' ? t('admin.status_new')
    : status === 'under_review' ? t('admin.status_under_review')
    : status === 'resolved' ? t('admin.status_resolved')
    : status;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm border ${STATUS_STYLES[status] || STATUS_STYLES.resolved}`}>
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const { t } = useTranslation();
  const label = priority === 'high' ? t('admin.priority_high')
    : priority === 'medium' ? t('admin.priority_medium')
    : priority === 'low' ? t('admin.priority_low')
    : priority;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm border ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.low}`}>
      {priority === 'high' && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
      {label}
    </span>
  );
}
