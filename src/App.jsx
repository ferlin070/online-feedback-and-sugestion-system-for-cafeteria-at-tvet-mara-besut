import { useState, useEffect, useCallback, useMemo } from 'react';
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

function App() {
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

  // Jika admin login, auto-redirect ke dashboard
  useEffect(() => {
    if (adminUser && !authLoading) {
      setPage('admin-dashboard');
    }
  }, [adminUser, authLoading]);

  // Handle loc parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const locId = params.get('loc');
    if (locId) {
      setPage('form');
      const locRef = doc(db, 'locations', locId);
      getDoc(locRef).then((snap) => {
        if (snap.exists() && snap.data().active) {
          const locData = snap.data();
          setCurrentLocation({ id: locId, ...locData });
        } else {
          setCurrentLocation({ id: locId, name: locId });
        }
      }).catch(() => {
        setCurrentLocation({ id: locId, name: locId });
      });
    }
  }, []);

  const stats = useMemo(() => getStats(feedbacks), [feedbacks]);

  const filteredFeedbacks = useMemo(() => feedbacks.filter((fb) => {
    const matchStatus = filters.status === 'All' || fb.status === filters.status;
    const matchCategory = filters.category === 'All' || fb.category === filters.category;
    const matchPriority = filters.priority === 'All' || fb.priority === filters.priority;
    const matchLocation = filters.location === 'All' || fb.locationId === filters.location || (filters.location === 'manual' && !fb.locationId);
    return matchStatus && matchCategory && matchPriority && matchLocation;
  }), [feedbacks, filters]);

  const handleNavigateHome = useCallback(() => {
    if (!adminUser) {
      setError(null);
      setCurrentLocation(null);
      setPage('home');
    }
  }, [adminUser]);

  const handleNavigateLogin = useCallback(() => {
    setError(null);
    setPage('admin-login');
  }, []);

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

  const handleUpdateFeedback = useCallback(async (id, updates) => {
    await updateFeedback(id, updates);
  }, [updateFeedback]);

  const handleAddLocation = useCallback(async (name, slugId) => {
    setError(null);
    try {
      await addLocation(name, slugId);
    } catch (err) {
      if (err.message === 'LOCATION_EXISTS') {
        setError('ID/Slug Lokasi sudah wujud. Sila guna ID lain.');
      } else {
        setError('Ralat berlaku. Sila cuba lagi.');
      }
      throw err;
    }
  }, [addLocation]);

  const handleDownloadQR = useCallback(async (loc) => {
    try {
      const response = await fetch(loc.qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr_${loc.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading QR code:', err);
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
      id: fb.id,
      description: fb.description,
      category: fb.category,
      priority: fb.priority,
      status: fb.status,
      location: fb.location || '-',
      isAnonymous: fb.isAnonymous ? 'Ya' : 'Tidak',
    }));
    exportToCsv(data, columns, 'aduan-kafe-export.csv');
  }, [filteredFeedbacks]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
        <Header theme={theme} toggleTheme={toggleTheme} adminUser={null} onNavigateHome={() => {}} onNavigateLogin={() => {}} onLogout={() => {}} />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 py-12">
            <svg className="animate-spin h-8 w-8 text-sky-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-xs text-slate-500">Mengesahkan sesi...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans relative overflow-x-hidden transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.08),transparent_60%)] pointer-events-none" />

      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        adminUser={adminUser}
        onNavigateHome={handleNavigateHome}
        onNavigateLogin={handleNavigateLogin}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 relative z-0 overflow-y-auto w-full">
        {/* Home */}
        {page === 'home' && !adminUser && (
          <HomePage
            onSubmitFeedback={() => { setError(null); setPage('form'); }}
            onTrackStatus={() => { setError(null); setPage('track'); }}
          />
        )}

        {/* Feedback Form */}
        {page === 'form' && !adminUser && (
          <FeedbackForm
            currentLocation={currentLocation}
            onBack={() => { setPage('home'); setError(null); setCurrentLocation(null); }}
            onSuccess={handleFormSuccess}
            initialError={error}
          />
        )}

        {/* Success */}
        {page === 'success' && !adminUser && (
          <SuccessPage
            referenceId={referenceId}
            onSubmitAnother={() => { setPage('form'); setCurrentLocation(null); }}
          />
        )}

        {/* Track Status */}
        {page === 'track' && !adminUser && (
          <TrackStatusPage
            referenceId=""
            onBack={() => { setPage('home'); setError(null); }}
          />
        )}

        {/* Admin Login */}
        {page === 'admin-login' && !adminUser && (
          <AdminLoginPage
            onLogin={login}
            onBack={() => { setError(null); setPage('home'); }}
            authError={authError}
          />
        )}

        {/* Admin Dashboard */}
        {page === 'admin-dashboard' && adminUser && (
          <div className="w-full max-w-7xl flex flex-col space-y-6 my-6 min-h-[calc(100vh-160px)] animate-fade-in">
            <StatsRow stats={stats} />

            {/* Dashboard Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-900 gap-2 flex-wrap">
              <button onClick={() => setDashboardTab('list')} className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 outline-none ${dashboardTab === 'list' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
                Senarai Aduan ({filteredFeedbacks.length})
              </button>
              <button onClick={() => setDashboardTab('analytics')} className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 outline-none ${dashboardTab === 'analytics' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
                Laporan & Analitik
              </button>
              <button onClick={() => setDashboardTab('locations')} className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 outline-none ${dashboardTab === 'locations' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
                Urus Lokasi
              </button>
              {adminUser?.role === 'superadmin' && (
                <button onClick={() => setDashboardTab('admins')} className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 outline-none ${dashboardTab === 'admins' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
                  Urus Admin
                </button>
              )}
              <div className="ml-auto flex items-center">
                <button onClick={handleExportCsv} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                  Eksport CSV
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {dashboardTab === 'list' && (
              <div className="flex flex-col lg:flex-row gap-6">
                <FeedbackList
                  feedbacks={filteredFeedbacks}
                  selectedFeedback={selectedFeedback}
                  onSelectFeedback={setSelectedFeedback}
                  filters={filters}
                  onFiltersChange={setFilters}
                  locations={locations}
                />
                <FeedbackDetail
                  feedback={selectedFeedback}
                  onUpdate={handleUpdateFeedback}
                />
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
