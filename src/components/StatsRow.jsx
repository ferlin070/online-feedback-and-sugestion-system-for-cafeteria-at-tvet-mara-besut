import { useTranslation } from 'react-i18next';

export function StatsRow({ stats }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">{t('reports.summary_total')}</span>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
      </div>

      <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">{t('reports.summary_new')}</span>
          <p className="text-2xl font-bold text-blue-400 mt-1">{stats.newCount}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>

      <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">{t('reports.summary_under_review')}</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">{stats.reviewCount}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">{t('reports.summary_resolved')}</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.resolvedCount}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
