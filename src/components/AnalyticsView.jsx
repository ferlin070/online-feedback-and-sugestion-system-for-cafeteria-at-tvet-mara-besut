import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { getCategoryChartData, getStatusChartData, getTrendChartData, getLocationChartData } from '../lib/chartData';

const PIE_COLORS = ['#B5651D', '#6B7B3C', '#7A7368'];
const TOOLTIP_STYLE = {
  backgroundColor: '#FFFCF6',
  border: '1px solid #D4C4A8',
  borderRadius: '6px',
  color: '#1F1D1A',
  fontSize: '12px',
  boxShadow: '0 8px 16px -8px rgba(82,41,12,0.2)',
};
const AXIS_STROKE = '#A39D90';
const GRID_STROKE = '#E5DBC5';

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`card-warm p-5 flex flex-col space-y-3 ${className}`}>
      <div>
        <h3 className="font-display text-[16px] text-[var(--heading-color)]">{title}</h3>
        {subtitle && <p className="text-[11px] text-ink-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="h-56 w-full">{children}</div>
    </div>
  );
}

export function AnalyticsView({ feedbacks, locations, onPrintReport }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={onPrintReport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md border border-mara-blue-300 dark:border-mara-blue-800 text-mara-blue-700 dark:text-mara-blue-300 hover:bg-mara-blue-50 dark:hover:bg-mara-blue-900/30 transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M8 18h8v5H8v-5z" />
          </svg>
          {t('admin.print_pdf', 'Print PDF')}
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard
        title={t('reports.chart_category_title')}
        subtitle={t('reports.chart_category_subtitle', 'Taburan bidang maklum balas.')}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={getCategoryChartData(feedbacks, t)} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="2 4" stroke={GRID_STROKE} vertical={false} />
            <XAxis dataKey="name" stroke={AXIS_STROKE} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} stroke={AXIS_STROKE} fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#F5E9DC', opacity: 0.4 }} />
            <Bar dataKey="Jumlah" name={t('reports.summary_total', 'Jumlah')} fill="#B5651D" radius={[3, 3, 0, 0]} maxBarSize={42} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title={t('reports.chart_status_title')}
        subtitle={t('reports.chart_status_subtitle', 'Status kemajuan aduan.')}
      >
        <div className="h-full flex flex-col sm:flex-row items-center gap-3">
          <div className="h-full w-full sm:w-3/5">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={getStatusChartData(feedbacks, t)} cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={4} dataKey="value" stroke="#FFFCF6" strokeWidth={2}>
                  {getStatusChartData(feedbacks, t).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-row sm:flex-col gap-2 text-[11px]">
            {getStatusChartData(feedbacks, t).map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-[var(--text-color)]">{item.name}</span>
                <span className="font-mono text-ink-400">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>

      <ChartCard
        title={t('reports.chart_trend_title')}
        subtitle={t('reports.chart_trend_subtitle', 'Stabiliti aduan sepanjang masa.')}
        className="lg:col-span-2"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={getTrendChartData(feedbacks, t)} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="2 4" stroke={GRID_STROKE} vertical={false} />
            <XAxis dataKey="name" stroke={AXIS_STROKE} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} stroke={AXIS_STROKE} fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="Jumlah" name={t('reports.summary_total', 'Jumlah')} stroke="#B5651D" strokeWidth={2.2} dot={{ r: 3, fill: '#B5651D', strokeWidth: 0 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title={t('locations.chart_title')}
        subtitle={t('locations.chart_subtitle')}
        className="lg:col-span-2"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={getLocationChartData(feedbacks, locations, t)} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="2 4" stroke={GRID_STROKE} vertical={false} />
            <XAxis dataKey="name" stroke={AXIS_STROKE} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} stroke={AXIS_STROKE} fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#F5E9DC', opacity: 0.4 }} />
            <Bar dataKey="Jumlah" name={t('reports.summary_total', 'Jumlah')} fill="#6B7B3C" radius={[3, 3, 0, 0]} maxBarSize={42} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      </div>
    </div>
  );
}
