import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './hooks/useAuth';
import { useLocations } from './hooks/useLocations';
import { useTheme } from './hooks/useTheme';
import { useFeedback } from './hooks/useFeedback';
import { getStats } from './lib/chartData';
import { exportToCsv } from './lib/csvExport';

import { Header, Footer } from './components/Header';
import { HomePage } from './components/HomePage';
import { FeedbackForm } from './components/FeedbackForm';
import { SuccessPage } from './components/SuccessPage';
import { AdminLoginPage } from './components/AdminLoginPage';
import { FeedbackList } from './components/FeedbackList';
import { FeedbackDetail } from './components/FeedbackDetail';
import { StatsRow } from './components/StatsRow';
import { AnalyticsView } from './components/AnalyticsView';
import { LocationsManager } from './components/LocationsManager';
import { TrackStatusPage } from './components/TrackStatusPage';
import { AdminManagement } from './components/AdminManagement';

const DEFAULT_FILTERS = { status: 'All', category: 'All', priority: 'All', location: 'All' };
const TABS = [
  { id: 'list', label_key: 'admin.nav_list' },
  { id: 'analytics', label_key: 'admin.nav_reports' },
  { id: 'locations', label_key: 'locations.title' },
];

function App() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { adminUser, authLoading, authError, login, logout } = useAuth();
  const { locations, addLocation, toggleLocationStatus } = useLocations();
  const { feedbacks, updateFeedback } = useFeedback(adminUser);

  const [page, setPage] = useState('home');
  const [referenceId, setReferenceId] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);

  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [dashboardTab, setDashboardTab] = useState('list');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    if (adminUser && !authLoading) setPage('admin-dashboard');
  }, [adminUser, authLoading]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const locId = params.get('loc');
    if (locId) {
      setPage('form');
      getDoc(doc(db, 'locations', locId))
        .then((snap) => {
          if (snap.exists() && snap.data().active) {
            setCurrentLocation({ id: locId, ...snap.data() });
          } else {
            setCurrentLocation({ id: locId, name: locId });
          }
        })
        .catch(() => setCurrentLocation({ id: locId, name: locId }));
    }
  }, []);

  const stats = useMemo(() => getStats(feedbacks), [feedbacks]);

  const filteredFeedbacks = useMemo(() => feedbacks.filter((fb) => {
    const m = (filter, val) => filter === 'All' || val === filter || (filter === 'manual' && !val);
    return m(filters.status, fb.status) && m(filters.category, fb.category) && m(filters.priority, fb.priority) && m(filters.location, fb.locationId);
  }), [feedbacks, filters]);

  const handleNavigateHome = useCallback(() => {
    if (!adminUser) { setError(null); setCurrentLocation(null); setPage('home'); }
  }, [adminUser]);

  const handleLogout = useCallback(async () => {
    setError(null);
    setSelectedFeedback(null);
    await logout();
    setPage('home');
  }, [logout]);

  const handleFormSuccess = useCallback((id) => {
    setReferenceId(id);
    setPage('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAddLocation = useCallback(async (name, slugId) => {
    setError(null);
    try {
      await addLocation(name, slugId);
    } catch (err) {
      setError(err.message === 'LOCATION_EXISTS'
        ? t('locations.err_exists')
        : t('common.error_general', 'Ralat berlaku. Sila cuba lagi.'));
      throw err;
    }
  }, [addLocation, t]);

  const handleDownloadQR = useCallback(async (loc) => {
    try {
      const res = await fetch(loc.qrCodeUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr_${loc.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading QR:', err);
    }
  }, []);

  const handleExportCsv = useCallback(() => {
    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'description', label: 'Butiran' },
      { key: 'category', label: 'Kategori' },
      { key: 'priority', label: 'Prioriti' },
      { key: 'status', label: 'Status' },
      { key: 'location', label: 'Lokasi' },
      { key: 'isAnonymous', label: 'Anonymous' },
    ];
    const data = filteredFeedbacks.map((fb) => ({
      id: fb.id, description: fb.description, category: fb.category,
      priority: fb.priority, status: fb.status, location: fb.location || '-',
      isAnonymous: fb.isAnonymous ? 'Ya' : 'Tidak',
    }));
    exportToCsv(data, columns, 'aduan-kafe.csv');
  }, [filteredFeedbacks]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-color)]">
        <Header theme={theme} toggleTheme={toggleTheme} adminUser={null} onNavigateHome={() => {}} onNavigateLogin={() => {}} onLogout={() => {}} />
        <main className="flex-1 grid place-items-center">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin w-6 h-6 text-clay-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
            <p className="text-[11px] font-mono uppercase tracking-wider text-ink-400">Mengesahkan sesi…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const tabs = adminUser?.role === 'superadmin'
    ? [...TABS, { id: 'admins', label_key: 'admin.mgmt_title' }]
    : TABS;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)]">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        adminUser={adminUser}
        onNavigateHome={handleNavigateHome}
        onNavigateLogin={() => { setError(null); setPage('admin-login'); }}
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full">
        {page === 'home' && !adminUser && (
          <HomePage
            onSubmitFeedback={() => { setError(null); setPage('form'); }}
            onTrackStatus={() => { setError(null); setPage('track'); }}
          />
        )}

        {page === 'form' && !adminUser && (
          <FeedbackForm
            currentLocation={currentLocation}
            onBack={() => { setPage('home'); setError(null); setCurrentLocation(null); }}
            onSuccess={handleFormSuccess}
            initialError={error}
          />
        )}

        {page === 'success' && !adminUser && (
          <SuccessPage
            referenceId={referenceId}
            onSubmitAnother={() => { setPage('form'); setCurrentLocation(null); }}
          />
        )}

        {page === 'track' && !adminUser && (
          <TrackStatusPage referenceId="" onBack={() => { setPage('home'); setError(null); }} />
        )}

        {page === 'admin-login' && !adminUser && (
          <AdminLoginPage
            onLogin={login}
            onBack={() => { setError(null); setPage('home'); }}
            authError={authError}
          />
        )}

        {page === 'admin-dashboard' && adminUser && (
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 space-y-5 animate-fade-in">
            <div className="flex items-end justify-between flex-wrap gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-clay-500">
                  {t('admin.eyebrow', 'Pusat Kawalan')}
                </span>
                <h1 className="font-display text-3xl tracking-tight text-[var(--heading-color)] mt-0.5">
                  {t('admin.dashboard_title')}
                </h1>
              </div>
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md border border-olive-300 dark:border-olive-800 text-olive-700 dark:text-olive-300 hover:bg-olive-50 dark:hover:bg-olive-900/30 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                </svg>
                {t('admin.export_csv', 'Eksport CSV')}
              </button>
            </div>

            <StatsRow stats={stats} />

            <div className="flex items-center gap-1 border-b border-[var(--border-color)] overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDashboardTab(tab.id)}
                  className={`px-3 py-2.5 text-[13px] font-medium border-b-2 -mb-px whitespace-nowrap transition-colors cursor-pointer ${
                    dashboardTab === tab.id
                      ? 'border-clay-500 text-clay-600 dark:text-clay-400'
                      : 'border-transparent text-ink-400 hover:text-ink-700 dark:hover:text-ink-200'
                  }`}
                >
                  {t(tab.label_key)}
                  {tab.id === 'list' && (
                    <span className="ml-1.5 text-[10px] font-mono text-ink-400">({filteredFeedbacks.length})</span>
                  )}
                </button>
              ))}
            </div>

            {dashboardTab === 'list' && (
              <div className="flex flex-col lg:flex-row gap-4">
                <FeedbackList
                  feedbacks={filteredFeedbacks}
                  selectedFeedback={selectedFeedback}
                  onSelectFeedback={setSelectedFeedback}
                  filters={filters}
                  onFiltersChange={setFilters}
                  locations={locations}
                />
                <FeedbackDetail feedback={selectedFeedback} onUpdate={updateFeedback} />
              </div>
            )}

            {dashboardTab === 'analytics' && (
              <AnalyticsView feedbacks={feedbacks} locations={locations} />
            )}

            {dashboardTab === 'locations' && (
              <LocationsManager
                locations={locations}
                onAddLocation={handleAddLocation}
                onToggleStatus={toggleLocationStatus}
                onDownloadQR={handleDownloadQR}
                creating={false}
                error={error}
              />
            )}

            {dashboardTab === 'admins' && (
              <AdminManagement adminUser={adminUser} />
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
