/**
 * Fungsi pembantu untuk pengagregatan data carta dan format.
 */

/**
 * Format timestamp Firestore/Date ke string locale.
 * @param {object|Date|number} ts 
 * @returns {string}
 */
export function formatTime(ts) {
  if (!ts) return '-';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleString('ms-MY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Data carta untuk taburan kategori.
 * @param {Array} feedbacks 
 * @param {function} t - fungsi translate.
 * @returns {Array}
 */
export function getCategoryChartData(feedbacks, t) {
  const categories = ['Makanan', 'Kebersihan', 'Kemudahan', 'Perkhidmatan', 'Umum'];
  return categories.map(cat => ({
    name: t(`categories.${cat}`, cat),
    Jumlah: feedbacks.filter(f => f.category === cat).length
  }));
}

/**
 * Data carta untuk taburan status.
 * @param {Array} feedbacks 
 * @param {function} t 
 * @returns {Array}
 */
export function getStatusChartData(feedbacks, t) {
  return [
    { name: t('admin.status_new'), value: feedbacks.filter(f => f.status === 'new').length },
    { name: t('admin.status_under_review'), value: feedbacks.filter(f => f.status === 'under_review').length },
    { name: t('admin.status_resolved'), value: feedbacks.filter(f => f.status === 'resolved').length },
  ].filter(item => item.value > 0);
}

/**
 * Data carta untuk trend bulanan.
 * @param {Array} feedbacks 
 * @param {function} t 
 * @returns {Array}
 */
export function getTrendChartData(feedbacks, t) {
  const monthlyData = {};
  const monthNames = [
    t('months.Jan', 'Jan'), t('months.Feb', 'Feb'), t('months.Mac', 'Mac'),
    t('months.Apr', 'Apr'), t('months.Mei', 'Mei'), t('months.Jun', 'Jun'),
    t('months.Jul', 'Jul'), t('months.Ogo', 'Ogo'), t('months.Sep', 'Sep'),
    t('months.Okt', 'Okt'), t('months.Nov', 'Nov'), t('months.Dis', 'Dis')
  ];

  feedbacks.forEach(f => {
    if (!f.submittedAt) return;
    const date = f.submittedAt.toDate ? f.submittedAt.toDate() : new Date(f.submittedAt);
    const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    const sortKey = date.getFullYear() * 12 + date.getMonth();
    if (!monthlyData[key]) {
      monthlyData[key] = { name: key, Jumlah: 0, sortKey };
    }
    monthlyData[key].Jumlah += 1;
  });

  return Object.values(monthlyData).sort((a, b) => a.sortKey - b.sortKey);
}

/**
 * Data carta untuk jumlah aduan mengikut lokasi.
 * @param {Array} feedbacks 
 * @param {Array} locations 
 * @param {function} t 
 * @returns {Array}
 */
export function getLocationChartData(feedbacks, locations, t) {
  const locationCounts = {};
  feedbacks.forEach(f => {
    let locName = t('locations.fallback_manual', 'Akses Terus / Tiada QR');
    if (f.locationId) {
      const found = locations.find(l => l.id === f.locationId);
      if (found) locName = found.name;
    } else if (f.location) {
      locName = f.location;
    }
    if (!locationCounts[locName]) locationCounts[locName] = 0;
    locationCounts[locName] += 1;
  });
  return Object.entries(locationCounts).map(([name, count]) => ({ name, Jumlah: count }));
}

/**
 * Kira ringkasan statistik daripada senarai feedback.
 * @param {Array} feedbacks 
 * @returns {Object}
 */
export function getStats(feedbacks) {
  return {
    total: feedbacks.length,
    newCount: feedbacks.filter(f => f.status === 'new').length,
    reviewCount: feedbacks.filter(f => f.status === 'under_review').length,
    resolvedCount: feedbacks.filter(f => f.status === 'resolved').length,
    highPriorityCount: feedbacks.filter(f => f.status === 'new' && f.priority === 'high').length,
  };
}
