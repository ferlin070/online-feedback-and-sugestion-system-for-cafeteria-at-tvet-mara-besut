import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function LocationsManager({ locations, onAddLocation, onToggleStatus, onDownloadQR, creating, error }) {
  const { t } = useTranslation();
  const [newLocName, setNewLocName] = useState('');
  const [newLocId, setNewLocId] = useState('');

  const handleLocNameChange = (e) => {
    const val = e.target.value;
    setNewLocName(val);
    setNewLocId(val.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newLocName.trim() || !newLocId.trim()) return;
    try {
      await onAddLocation(newLocName, newLocId);
      setNewLocName('');
      setNewLocId('');
    } catch {
      /* error handled by parent */
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="card-warm p-5 space-y-4 h-fit">
        <div>
          <h3 className="font-display text-[16px] text-[var(--heading-color)]">{t('locations.add_title')}</h3>
          <p className="text-[11px] text-ink-400 mt-0.5">{t('locations.subtitle')}</p>
        </div>

        {error && (
          <div className="px-3 py-2 rounded-md border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-[12px]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="newLocName" className="block text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-1">
              {t('locations.name')}
            </label>
            <input
              id="newLocName"
              type="text"
              required
              value={newLocName}
              onChange={handleLocNameChange}
              placeholder={t('locations.name_placeholder')}
              className="input-warm w-full px-3 py-2 text-[13px]"
            />
          </div>
          <div>
            <label htmlFor="newLocId" className="block text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-1">
              {t('locations.id')}
            </label>
            <input
              id="newLocId"
              type="text"
              required
              value={newLocId}
              onChange={(e) => setNewLocId(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
              placeholder={t('locations.id_placeholder')}
              className="input-warm w-full px-3 py-2 text-[13px] font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="btn-clay w-full py-2.5 text-[12px] inline-flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {creating ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
                </svg>
                {t('locations.submitting_qr')}
              </>
            ) : t('locations.btn_add')}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 card-warm p-5 flex flex-col space-y-3">
        <div>
          <h3 className="font-display text-[16px] text-[var(--heading-color)]">{t('locations.title')}</h3>
          <p className="text-[11px] text-ink-400 mt-0.5">{locations.length} {t('locations.subtitle')}</p>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[10px] font-mono uppercase tracking-wider text-ink-400">
                <th className="py-2 pr-3 font-medium">{t('locations.col_name')}</th>
                <th className="py-2 px-3 font-medium">{t('locations.col_id')}</th>
                <th className="py-2 px-3 font-medium">{t('locations.col_qr')}</th>
                <th className="py-2 px-3 font-medium">{t('locations.col_status')}</th>
                <th className="py-2 pl-3 font-medium text-right">{t('locations.col_actions')}</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-color)]">
              {locations.length === 0 ? (
                <tr><td colSpan="5" className="py-10 text-center text-ink-400">{t('admin.no_data')}</td></tr>
              ) : (
                locations.map((loc) => (
                  <tr key={loc.id} className="border-b border-[var(--border-color)] last:border-0">
                    <td className="py-3 pr-3 font-medium">{loc.name}</td>
                    <td className="py-3 px-3 font-mono text-[10px] text-ink-400">{loc.id}</td>
                    <td className="py-2 px-3">
                      {loc.qrCodeUrl && (
                        <a href={loc.qrCodeUrl} target="_blank" rel="noopener noreferrer" className="block w-10 h-10 p-0.5 rounded-sm bg-white border border-[var(--border-color)] hover:border-clay-400 transition-colors">
                          <img src={loc.qrCodeUrl} alt={loc.name} className="w-full h-full object-contain" />
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {loc.active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm border border-olive-300 dark:border-olive-800 bg-olive-100 dark:bg-olive-900/40 text-olive-700 dark:text-olive-300">
                          {t('locations.status_active')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800/50 text-ink-500 dark:text-ink-400">
                          {t('locations.status_inactive')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pl-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onToggleStatus(loc)}
                        className="px-2 py-1 text-[10px] font-medium rounded-sm border border-[var(--border-color)] text-ink-500 hover:text-clay-600 hover:border-clay-300 dark:hover:text-clay-400 transition-colors cursor-pointer"
                      >
                        {loc.active ? t('locations.deactivate') : t('locations.activate')}
                      </button>
                      <button
                        onClick={() => onDownloadQR(loc)}
                        className="ml-1 px-2 py-1 text-[10px] font-medium rounded-sm border border-clay-300 dark:border-clay-800 text-clay-600 dark:text-clay-400 hover:bg-clay-50 dark:hover:bg-clay-900/30 transition-colors cursor-pointer"
                      >
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
