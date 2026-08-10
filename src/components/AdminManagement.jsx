import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function AdminManagement({ adminUser }) {
  const { t } = useTranslation();
  const [admins, setAdmins] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);

  const isSuperAdmin = adminUser?.role === 'superadmin';

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'admins'));
      const list = [];
      snap.forEach((d) => list.push({ uid: d.id, ...d.data() }));
      setAdmins(list);
      setLoaded(true);
    } catch (err) {
      console.error('Error loading admins:', err);
      setError(t('admin.mgmt_error_load', 'Ralat memuatkan senarai admin.'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) {
      setError(t('admin.mgmt_error_empty', 'Sila isi emel dan nama.'));
      return;
    }
    setAdding(true);
    setError(null);
    try {
      const uid = email.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '');
      await setDoc(doc(db, 'admins', uid), { name: name.trim(), email: email.trim(), role: 'admin' });
      setEmail('');
      setName('');
      await loadAdmins();
    } catch (err) {
      console.error('Error adding admin:', err);
      setError(t('admin.mgmt_error_add', 'Ralat menambah admin.'));
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (uid) => {
    if (!confirm(t('admin.mgmt_confirm_remove', 'Anda pasti mahu membuang admin ini?'))) return;
    try {
      await deleteDoc(doc(db, 'admins', uid));
      setAdmins((prev) => prev.filter((a) => a.uid !== uid));
    } catch (err) {
      console.error('Error removing admin:', err);
      setError(t('admin.mgmt_error_remove', 'Ralat membuang admin.'));
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="card-warm p-8 text-center">
        <p className="text-[13px] text-ink-400">{t('admin.mgmt_no_access', 'Hanya Super Admin boleh mengurus akaun admin.')}</p>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="card-warm p-8 text-center space-y-4">
        <p className="text-[13px] text-ink-400">{t('admin.mgmt_load_hint', 'Klik butang di bawah untuk memuatkan senarai admin.')}</p>
        <button onClick={loadAdmins} disabled={loading} className="btn-clay px-5 py-2 text-[12px] cursor-pointer">
          {loading ? t('common.loading') : t('admin.mgmt_btn_load', 'Muat Senarai Admin')}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="card-warm p-5 space-y-4 h-fit">
        <div>
          <h3 className="font-display text-[16px] text-[var(--heading-color)]">{t('admin.mgmt_add_title', 'Tambah Admin')}</h3>
          <p className="text-[11px] text-ink-400 mt-0.5">{t('admin.mgmt_add_hint', 'Daftar admin baru. Mereka perlu daftar di Firebase Auth Console juga.')}</p>
        </div>

        {error && (
          <div className="px-3 py-2 rounded-md border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-[12px]">
            {error}
          </div>
        )}

        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-1">{t('admin.mgmt_name', 'Nama')}</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Admin" className="input-warm w-full px-3 py-2 text-[13px]" />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-1">{t('admin.mgmt_email', 'Emel')}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@kafe-tvet.com" className="input-warm w-full px-3 py-2 text-[13px]" />
          </div>
          <button type="submit" disabled={adding} className="btn-clay w-full py-2.5 text-[12px] cursor-pointer disabled:cursor-not-allowed">
            {adding ? t('common.saving') : t('admin.mgmt_btn_add', 'Tambah Admin')}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 card-warm p-5 flex flex-col space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-display text-[16px] text-[var(--heading-color)]">{t('admin.mgmt_list_title', 'Senarai Admin')}</h3>
            <p className="text-[11px] text-ink-400 mt-0.5">{admins.length} {t('admin.mgmt_count', 'admin berdaftar')}</p>
          </div>
          <button onClick={loadAdmins} disabled={loading} className="px-3 py-1.5 text-[11px] font-medium rounded-sm border border-[var(--border-color)] text-ink-500 hover:text-mara-blue-600 hover:border-mara-blue-300 dark:hover:text-mara-blue-400 transition-colors cursor-pointer">
            {t('admin.mgmt_btn_refresh', 'Segar')}
          </button>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[10px] font-mono uppercase tracking-wider text-ink-400">
                <th className="py-2 pr-3 font-medium">{t('admin.mgmt_name', 'Nama')}</th>
                <th className="py-2 px-3 font-medium">{t('admin.mgmt_email', 'Emel')}</th>
                <th className="py-2 px-3 font-medium">{t('admin.mgmt_role', 'Peranan')}</th>
                <th className="py-2 pl-3 font-medium text-right">{t('locations.col_actions')}</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-color)]">
              {admins.length === 0 ? (
                <tr><td colSpan="4" className="py-10 text-center text-ink-400">{t('admin.no_data')}</td></tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.uid} className="border-b border-[var(--border-color)] last:border-0">
                    <td className="py-3 pr-3 font-medium">{admin.name}</td>
                    <td className="py-3 px-3 text-ink-400">{admin.email}</td>
                    <td className="py-3 px-3">
                      {admin.role === 'superadmin' ? (
                        <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm border border-mara-blue-300 dark:border-mara-blue-800 bg-mara-blue-100 dark:bg-mara-blue-900/40 text-mara-blue-700 dark:text-mara-blue-300">
                          Super Admin
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800/50 text-ink-500 dark:text-ink-400">
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="py-3 pl-3 text-right">
                      {admin.uid !== adminUser?.uid && (
                        <button onClick={() => handleRemove(admin.uid)} className="px-2 py-1 text-[10px] font-medium rounded-sm border border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer">
                          {t('admin.mgmt_btn_remove', 'Buang')}
                        </button>
                      )}
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
