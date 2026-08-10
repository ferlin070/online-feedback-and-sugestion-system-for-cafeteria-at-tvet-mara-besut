import { useTranslation } from 'react-i18next';

export function StatsRow({ stats }) {
  const { t } = useTranslation();
  const items = [
    { label: t('reports.summary_total'), value: stats.total, accent: 'text-[var(--heading-color)]', dot: 'bg-ink-300' },
    { label: t('reports.summary_new'), value: stats.newCount, accent: 'text-clay-600 dark:text-clay-400', dot: 'bg-clay-400' },
    { label: t('reports.summary_under_review'), value: stats.reviewCount, accent: 'text-olive-600 dark:text-olive-300', dot: 'bg-olive-400' },
    { label: t('reports.summary_resolved'), value: stats.resolvedCount, accent: 'text-ink-500', dot: 'bg-ink-300' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((it) => (
        <div key={it.label} className="card-warm p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-ink-400">{it.label}</p>
            <p className={`font-display text-3xl mt-1 ${it.accent}`}>{it.value}</p>
          </div>
          <span className={`w-2 h-2 rounded-full ${it.dot}`} />
        </div>
      ))}
    </div>
  );
}
