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
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [adding, setAdding] = useState(false);

  const isSuperAdmin = adminUser?.role === 'superadmin';

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'admins'));
      const list = [];
      snapshot.forEach((d) => list.push({ uid: d.id, ...d.data() }));
      setAdmins(list);
      setLoaded(true);
    } catch (err) {
      console.error('Error loading admins:', err);
      setError(t('admin.mgmt_error_load', 'Ralat memuatkan senarai admin.'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminName.trim()) {
      setError(t('admin.mgmt_error_empty', 'Sila isi emel dan nama.'));
      return;
    }
    setAdding(true);
    setError(null);
    try {
      // Simpan ke koleksi admins dengan UID berdasarkan emel (untuk rujukan)
      // Admin sebenar perlu daftar melalui Firebase Auth Console, ini hanya menyimpan metadata
      const uid = newAdminEmail.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '');
      const adminRef = doc(db, 'admins', uid);
      await setDoc(adminRef, {
        name: newAdminName.trim(),
        email: newAdminEmail.trim(),
        role: 'admin',
      });
      setNewAdminEmail('');
      setNewAdminName('');
      await loadAdmins();
    } catch (err) {
      console.error('Error adding admin:', err);
      setError(t('admin.mgmt_error_add', 'Ralat menambah admin.'));
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveAdmin = async (uid) => {
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
      <div className="glass-card p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-2xl text-center">
        <p className="text-slate-500 text-sm">{t('admin.mgmt_no_access', 'Hanya Super Admin boleh mengurus akaun admin.')}</p>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="glass-card p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-2xl text-center space-y-4">
        <p className="text-slate-500 text-sm">{t('admin.mgmt_load_hint', 'Klik butang di bawah untuk memuatkan senarai admin.')}</p>
        <button onClick={loadAdmins} disabled={loading} className="btn-primary px-6 py-2 text-sm">
          {loading ? t('common.loading') : t('admin.mgmt_btn_load', 'Muat Senarai Admin')}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-2xl space-y-5 h-fit">
        <div>
          <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">{t('admin.mgmt_add_title', 'Tambah Admin')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('admin.mgmt_add_hint', 'Daftar admin baru. Mereka perlu daftar di Firebase Auth Console juga.')}</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-xs">{error}</div>}

        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.mgmt_name', 'Nama')}</label>
            <input type="text" required value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} placeholder="Nama Admin" className="w-full px-4 py-3 rounded-xl glass-input text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-sky-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.mgmt_email', 'Emel')}</label>
            <input type="email" required value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} placeholder="admin@kafe-tvet.com" className="w-full px-4 py-3 rounded-xl glass-input text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-sky-500" />
          </div>
          <button type="submit" disabled={adding} className="w-full btn-primary py-3 flex justify-center items-center">
            {adding ? t('common.saving') : t('admin.mgmt_btn_add', 'Tambah Admin')}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-2xl flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">{t('admin.mgmt_list_title', 'Senarai Admin')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{admins.length} {t('admin.mgmt_count', 'admin berdaftar')}</p>
          </div>
          <button onClick={loadAdmins} disabled={loading} className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
            {t('admin.mgmt_btn_refresh', 'Segar Semula')}
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs font-light text-slate-700 dark:text-slate-300">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800/80 uppercase tracking-wider text-[10px] text-slate-500">
                <th className="py-3 px-4 font-semibold">{t('admin.mgmt_name', 'Nama')}</th>
                <th className="py-3 px-4 font-semibold">{t('admin.mgmt_email', 'Emel')}</th>
                <th className="py-3 px-4 font-semibold">{t('admin.mgmt_role', 'Peranan')}</th>
                <th className="py-3 px-4 font-semibold text-right">{t('locations.col_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-10 text-slate-500">{t('admin.no_data')}</td></tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.uid} className="border-b border-slate-100 dark:border-slate-900/60 hover:bg-slate-500/5 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">{admin.name}</td>
                    <td className="py-4 px-4 text-slate-500">{admin.email}</td>
                    <td className="py-4 px-4">
                      {admin.role === 'superadmin' ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Super Admin</span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-500/10 text-slate-400 border border-slate-500/20">Admin</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {admin.uid !== adminUser?.uid && (
                        <button onClick={() => handleRemoveAdmin(admin.uid)} className="px-2.5 py-1 text-[10px] font-semibold rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
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
