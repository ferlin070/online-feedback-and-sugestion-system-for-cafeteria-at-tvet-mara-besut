import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function LocationsManager({ locations, onAddLocation, onToggleStatus, onDownloadQR, creating, error }) {
  const { t } = useTranslation();
  const [newLocName, setNewLocName] = useState('');
  const [newLocId, setNewLocId] = useState('');

  const handleLocNameChange = (e) => {
    const val = e.target.value;
    setNewLocName(val);
    const generatedId = val.trim().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');
    setNewLocId(generatedId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newLocName.trim() || !newLocId.trim()) return;
    try {
      await onAddLocation(newLocName, newLocId);
      setNewLocName('');
      setNewLocId('');
    } catch {
      // error handled by parent
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-2xl space-y-5 h-fit">
        <div>
          <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">{t('locations.add_title')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('locations.subtitle')}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-xs">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="newLocName" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('locations.name')}</label>
            <input id="newLocName" type="text" required value={newLocName} onChange={handleLocNameChange} placeholder={t('locations.name_placeholder')} className="w-full px-4 py-3 rounded-xl glass-input text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-sky-500" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="newLocId" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('locations.id')}</label>
            <input id="newLocId" type="text" required value={newLocId} onChange={(e) => setNewLocId(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))} placeholder={t('locations.id_placeholder')} className="w-full px-4 py-3 rounded-xl glass-input text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-sky-500" />
          </div>
          <button type="submit" disabled={creating} className="w-full btn-primary py-3 flex justify-center items-center gap-2">
            {creating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('locations.submitting_qr')}
              </>
            ) : t('locations.btn_add')}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-2xl flex flex-col space-y-4">
        <div>
          <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">{t('locations.title')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('locations.subtitle')}</p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs font-light text-slate-700 dark:text-slate-300">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800/80 uppercase tracking-wider text-[10px] text-slate-500">
                <th className="py-3 px-4 font-semibold">{t('locations.col_name')}</th>
                <th className="py-3 px-4 font-semibold">{t('locations.col_id')}</th>
                <th className="py-3 px-4 font-semibold">{t('locations.col_qr')}</th>
                <th className="py-3 px-4 font-semibold">{t('locations.col_status')}</th>
                <th className="py-3 px-4 font-semibold text-right">{t('locations.col_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {locations.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 text-slate-500">{t('admin.no_data')}</td></tr>
              ) : (
                locations.map((loc) => (
                  <tr key={loc.id} className="border-b border-slate-100 dark:border-slate-900/60 hover:bg-slate-500/5 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">{loc.name}</td>
                    <td className="py-4 px-4 font-mono text-[10px] text-slate-500">{loc.id}</td>
                    <td className="py-2 px-4">
                      {loc.qrCodeUrl && (
                        <a href={loc.qrCodeUrl} target="_blank" rel="noopener noreferrer" className="block w-12 h-12 bg-white p-1 rounded border border-slate-200 dark:border-slate-800 hover:scale-105 transition-transform">
                          <img src={loc.qrCodeUrl} alt={loc.name} className="w-full h-full object-contain" />
                        </a>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {loc.active ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">{t('locations.status_active')}</span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">{t('locations.status_inactive')}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                      <button onClick={() => onToggleStatus(loc)} className={`px-2.5 py-1 text-[10px] font-semibold rounded transition-colors ${loc.active ? 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
                        {loc.active ? t('locations.deactivate') : t('locations.activate')}
                      </button>
                      <button onClick={() => onDownloadQR(loc)} className="px-2.5 py-1 text-[10px] font-semibold rounded bg-sky-500 hover:bg-sky-400 text-white transition-colors">
                        {t('locations.download_qr')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
