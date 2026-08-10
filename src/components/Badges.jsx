import { useTranslation } from 'react-i18next';

export function StatusBadge({ status }) {
  const { t } = useTranslation();
  switch (status) {
    case 'new':
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{t('admin.status_new')}</span>;
    case 'under_review':
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{t('admin.status_under_review')}</span>;
    case 'resolved':
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{t('admin.status_resolved')}</span>;
    default:
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">{status}</span>;
  }
}

export function PriorityBadge({ priority }) {
  const { t } = useTranslation();
  switch (priority) {
    case 'high':
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/30">{t('admin.priority_high')}</span>;
    case 'medium':
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">{t('admin.priority_medium')}</span>;
    case 'low':
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">{t('admin.priority_low')}</span>;
    default:
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">{priority}</span>;
  }
}
