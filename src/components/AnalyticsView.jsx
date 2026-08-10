import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { getCategoryChartData, getStatusChartData, getTrendChartData, getLocationChartData } from '../lib/chartData';

const PIE_COLORS = ['#38bdf8', '#fbbf24', '#34d399'];

export function AnalyticsView({ feedbacks, locations }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-2xl flex flex-col space-y-4">
        <div>
          <h3 className="text-lg font-bold font-display text-white">{t('reports.chart_category_title')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('reports.chart_category_subtitle', 'Analisis taburan bidang maklum balas yang diterima.')}</p>
        </div>
        <div className="h-64 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getCategoryChartData(feedbacks, t)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis allowDecimals={false} stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f1f5f9' }} />
              <Bar dataKey="Jumlah" name={t('reports.summary_total', 'Jumlah')} fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-2xl flex flex-col space-y-4">
        <div>
          <h3 className="text-lg font-bold font-display text-white">{t('reports.chart_status_title')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('reports.chart_status_subtitle', 'Status kemajuan pengurusan aduan semasa.')}</p>
        </div>
        <div className="h-64 w-full text-xs flex flex-col sm:flex-row items-center justify-center">
          <div className="h-full w-full sm:w-2/3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={getStatusChartData(feedbacks, t)} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {getStatusChartData(feedbacks, t).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-row sm:flex-col gap-4 text-xs font-medium text-slate-300">
            {getStatusChartData(feedbacks, t).map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-2xl flex flex-col space-y-4 lg:col-span-2">
        <div>
          <h3 className="text-lg font-bold font-display text-white">{t('reports.chart_trend_title')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('reports.chart_trend_subtitle', 'Melihat kestabilan aduan yang diterima sepanjang masa.')}</p>
        </div>
        <div className="h-64 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getTrendChartData(feedbacks, t)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis allowDecimals={false} stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f1f5f9' }} />
              <Line type="monotone" dataKey="Jumlah" name={t('reports.summary_total', 'Jumlah')} stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#38bdf8', stroke: '#0ea5e9', strokeWidth: 2, r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-2xl flex flex-col space-y-4 lg:col-span-2">
        <div>
          <h3 className="text-lg font-bold font-display text-white">{t('locations.chart_title')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('locations.chart_subtitle')}</p>
        </div>
        <div className="h-64 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getLocationChartData(feedbacks, locations, t)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis allowDecimals={false} stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f1f5f9' }} />
              <Bar dataKey="Jumlah" name={t('reports.summary_total', 'Jumlah')} fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
