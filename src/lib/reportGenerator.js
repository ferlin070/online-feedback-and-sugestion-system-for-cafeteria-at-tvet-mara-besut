/**
 * Penjana laporan bercetak untuk PDF (via print dialog pelayar)
 * dan utiliti berkongsi untuk pemetaan nilai.
 */

/**
 * Petakan kod status ke label terjemahan.
 */
export function statusLabel(status, t) {
  if (status === 'new') return t('admin.status_new');
  if (status === 'under_review') return t('admin.status_under_review');
  if (status === 'resolved') return t('admin.status_resolved');
  return status || '-';
}

/**
 * Petakan kod prioriti ke label terjemahan.
 */
export function priorityLabel(priority, t) {
  if (priority === 'high') return t('admin.priority_high');
  if (priority === 'medium') return t('admin.priority_medium');
  if (priority === 'low') return t('admin.priority_low');
  return priority || '-';
}

/**
 * Petakan kod kategori ke label terjemahan.
 */
export function categoryLabel(category, t) {
  return t(`categories.${category}`, category);
}

/**
 * Format tarikh masa untuk laporan.
 */
export function formatReportDate(ts) {
  if (!ts) return '-';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleString('ms-MY', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/**
 * Format tarikh ringkas (tarikh sahaja).
 */
export function formatShortDate(ts) {
  if (!ts) return '-';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('ms-MY', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

/**
 * Jana tarikh laporan masa kini.
 */
function generatedAt() {
  return new Date().toLocaleString('ms-MY', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/**
 * Gaya CSS terbenam untuk laporan bercetak (palet MARA).
 */
const REPORT_CSS = `
  @page { size: A4; margin: 14mm 12mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    color: #1f2937; margin: 0; padding: 0; font-size: 10pt; line-height: 1.5;
  }
  .cover { border-top: 6px solid #19377B; border-bottom: 2px solid #D4C4A8; padding: 12px 0; margin-bottom: 16px; }
  .cover .eyebrow { text-transform: uppercase; letter-spacing: 2px; color: #19377B; font-weight: 700; font-size: 8pt; margin: 0 0 4px; }
  h1 { font-size: 18pt; color: #0F2152; margin: 0 0 4px; line-height: 1.2; }
  .subtitle { color: #5C564B; margin: 0; font-size: 9.5pt; }
  .meta { margin-top: 10px; font-size: 8pt; color: #7A7368; border-top: 1px dashed #D4C4A8; padding-top: 8px; display: flex; justify-content: space-between; }
  h2 { font-size: 12pt; color: #19377B; margin: 18px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #19377B; }
  h3 { font-size: 10.5pt; color: #0F2152; margin: 12px 0 6px; }
  p { margin: 5px 0; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 8.8pt; }
  th, td { border: 1px solid #D4C4A8; padding: 5px 7px; text-align: left; vertical-align: top; }
  th { background: #19377B; color: #FFFCF6; font-weight: 600; }
  tr:nth-child(even) td { background: #FAF7F1; }
  .stats { display: flex; gap: 8px; margin: 12px 0; }
  .stat { flex: 1; border: 1px solid #D4C4A8; border-left: 4px solid #19377B; border-radius: 6px; padding: 10px 12px; background: #FFFCF6; }
  .stat .lbl { text-transform: uppercase; letter-spacing: 1px; font-size: 7.5pt; color: #7A7368; font-weight: 600; }
  .stat .val { font-size: 20pt; color: #0F2152; font-weight: 700; margin-top: 2px; }
  .stat.new { border-left-color: #19377B; } .stat.new .val { color: #19377B; }
  .stat.review { border-left-color: #1E96CF; } .stat.review .val { color: #0A6189; }
  .stat.resolved { border-left-color: #6B7B3C; } .stat.resolved .val { color: #4A5A2C; }
  .stat.high { border-left-color: #B83535; } .stat.high .val { color: #9D0B0F; }
  .badge { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .b-new { background: #EEF4FB; color: #142D67; }
  .b-review { background: #ECF6FD; color: #0A6189; }
  .b-resolved { background: #E7E5E0; color: #5C564B; }
  .b-high { background: #FCEDED; color: #9D0B0F; }
  .b-medium { background: #EEF4FB; color: #142D67; }
  .b-low { background: #F6F5F3; color: #7A7368; }
  .empty { text-align: center; padding: 18px; color: #7A7368; font-style: italic; }
  .footer { margin-top: 20px; border-top: 1px solid #E5DBC5; padding-top: 8px; font-size: 7.5pt; color: #A89474; text-align: center; }
  .twocol { display: flex; gap: 12px; } .twocol > div { flex: 1; }
  .barwrap { height: 14px; background: #F2ECDF; border-radius: 3px; overflow: hidden; }
  .bar { height: 100%; background: #19377B; border-radius: 3px; }
  .row-meta { font-size: 8.5pt; color: #7A7368; margin-bottom: 10px; }
  .desc { max-width: 240px; word-break: break-word; }
  .id-cell { font-family: "Consolas", monospace; font-size: 7.5pt; }
  .note-cell { color: #5C564B; font-style: italic; }
`;

function badgeClass(prefix, value) {
  return `${prefix}-${value}`;
}

/**
 * Bina HTML untuk laporan ANALITIK (graf + statistik).
 */
export function buildAnalyticsReportHtml(feedbacks, locations, t) {
  const stats = {
    total: feedbacks.length,
    newCount: feedbacks.filter(f => f.status === 'new').length,
    reviewCount: feedbacks.filter(f => f.status === 'under_review').length,
    resolvedCount: feedbacks.filter(f => f.status === 'resolved').length,
    highCount: feedbacks.filter(f => f.priority === 'high').length,
  };
  const resolveRate = stats.total ? Math.round((stats.resolvedCount / stats.total) * 100) : 0;

  const cats = ['Makanan', 'Kebersihan', 'Kemudahan', 'Perkhidmatan', 'Umum'];
  const catRows = cats.map(c => {
    const count = feedbacks.filter(f => f.category === c).length;
    const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
    return `<tr><td>${categoryLabel(c, t)}</td><td style="text-align:center">${count}</td><td style="text-align:center">${pct}%</td><td><div class="barwrap"><div class="bar" style="width:${pct}%"></div></div></td></tr>`;
  }).join('');

  const statuses = [['new', t('admin.status_new')], ['under_review', t('admin.status_under_review')], ['resolved', t('admin.status_resolved')]];
  const statusRows = statuses.map(([code, label]) => {
    const count = feedbacks.filter(f => f.status === code).length;
    const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
    return `<tr><td><span class="badge ${badgeClass('b', code)}">${label}</span></td><td style="text-align:center">${count}</td><td style="text-align:center">${pct}%</td></tr>`;
  }).join('');

  const priorities = [['high', t('admin.priority_high')], ['medium', t('admin.priority_medium')], ['low', t('admin.priority_low')]];
  const prioRows = priorities.map(([code, label]) => {
    const count = feedbacks.filter(f => f.priority === code).length;
    const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
    return `<tr><td><span class="badge ${badgeClass('b', code)}">${label}</span></td><td style="text-align:center">${count}</td><td style="text-align:center">${pct}%</td></tr>`;
  }).join('');

  const monthlyData = {};
  const monthNames = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
  feedbacks.forEach(f => {
    if (!f.submittedAt) return;
    const d = f.submittedAt.toDate ? f.submittedAt.toDate() : new Date(f.submittedAt);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    const sortKey = d.getFullYear() * 12 + d.getMonth();
    if (!monthlyData[key]) monthlyData[key] = { name: key, count: 0, sortKey };
    monthlyData[key].count += 1;
  });
  const trendRows = Object.values(monthlyData).sort((a, b) => a.sortKey - b.sortKey)
    .map(m => `<tr><td>${m.name}</td><td style="text-align:center">${m.count}</td></tr>`).join('')
    || `<tr><td colspan="2" class="empty">${t('admin.no_data')}</td></tr>`;

  const locCounts = {};
  feedbacks.forEach(f => {
    let name = t('locations.fallback_manual');
    if (f.locationId) {
      const found = locations.find(l => l.id === f.locationId);
      if (found) name = found.name;
    } else if (f.location) name = f.location;
    locCounts[name] = (locCounts[name] || 0) + 1;
  });
  const locRows = Object.entries(locCounts).sort((a, b) => b[1] - a[1])
    .map(([name, count]) => {
      const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
      return `<tr><td>${name}</td><td style="text-align:center">${count}</td><td style="text-align:center">${pct}%</td><td><div class="barwrap"><div class="bar" style="width:${pct}%;background:#6B7B3C"></div></div></td></tr>`;
    }).join('') || `<tr><td colspan="4" class="empty">${t('admin.no_data')}</td></tr>`;

  return `<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8"><title>Laporan Analitik</title><style>${REPORT_CSS}</style></head><body>
<div class="cover">
  <p class="eyebrow">${t('admin.eyebrow')}</p>
  <h1>${t('reports.report_analytics_title', 'Laporan Analitik Aduan')}</h1>
  <p class="subtitle">${t('reports.report_analytics_subtitle', 'Ringkasan statistik dan taburan maklum balas kafeteria.')}</p>
  <div class="meta"><span>${t('reports.generated_on', 'Dijana pada')}: ${generatedAt()}</span><span>${t('reports.total_label', 'Jumlah aduan')}: ${stats.total}</span></div>
</div>

<div class="stats">
  <div class="stat"><div class="lbl">${t('reports.summary_total')}</div><div class="val">${stats.total}</div></div>
  <div class="stat new"><div class="lbl">${t('reports.summary_new')}</div><div class="val">${stats.newCount}</div></div>
  <div class="stat review"><div class="lbl">${t('reports.summary_under_review')}</div><div class="val">${stats.reviewCount}</div></div>
  <div class="stat resolved"><div class="lbl">${t('reports.summary_resolved')}</div><div class="val">${stats.resolvedCount}</div></div>
  <div class="stat high"><div class="lbl">${t('admin.priority_high')}</div><div class="val">${stats.highCount}</div></div>
</div>

<h2>${t('reports.chart_category_title')}</h2>
<p class="row-meta">${t('reports.chart_category_subtitle')}</p>
<table>
  <thead><tr><th>${t('admin.col_category')}</th><th style="text-align:center">${t('reports.summary_total')}</th><th style="text-align:center">%</th><th>${t('reports.distribution', 'Taburan')}</th></tr></thead>
  <tbody>${catRows || `<tr><td colspan="4" class="empty">${t('admin.no_data')}</td></tr>`}</tbody>
</table>

<div class="twocol">
  <div>
    <h2>${t('reports.chart_status_title')}</h2>
    <p class="row-meta">${t('reports.chart_status_subtitle')} &middot; ${t('reports.resolve_rate', 'Kadar selesai')}: <strong>${resolveRate}%</strong></p>
    <table>
      <thead><tr><th>${t('admin.col_status')}</th><th style="text-align:center">${t('reports.summary_total')}</th><th style="text-align:center">%</th></tr></thead>
      <tbody>${statusRows || `<tr><td colspan="3" class="empty">${t('admin.no_data')}</td></tr>`}</tbody>
    </table>
  </div>
  <div>
    <h2>${t('admin.col_priority', 'Prioriti')}</h2>
    <p class="row-meta">${t('reports.priority_subtitle', 'Tahap keutamaan aduan.')}</p>
    <table>
      <thead><tr><th>${t('admin.col_priority')}</th><th style="text-align:center">${t('reports.summary_total')}</th><th style="text-align:center">%</th></tr></thead>
      <tbody>${prioRows || `<tr><td colspan="3" class="empty">${t('admin.no_data')}</td></tr>`}</tbody>
    </table>
  </div>
</div>

<h2>${t('reports.chart_trend_title')}</h2>
<p class="row-meta">${t('reports.chart_trend_subtitle')}</p>
<table>
  <thead><tr><th>${t('admin.col_date', 'Bulan')}</th><th style="text-align:center">${t('reports.summary_total')}</th></tr></thead>
  <tbody>${trendRows}</tbody>
</table>

<h2>${t('locations.chart_title')}</h2>
<p class="row-meta">${t('locations.chart_subtitle')}</p>
<table>
  <thead><tr><th>${t('locations.filter_label')}</th><th style="text-align:center">${t('reports.summary_total')}</th><th style="text-align:center">%</th><th>${t('reports.distribution')}</th></tr></thead>
  <tbody>${locRows}</tbody>
</table>

<div class="footer">
  ${t('admin.eyebrow')} &middot; ${t('reports.report_analytics_title')} &middot; ${t('reports.generated_on')} ${generatedAt()}
</div>
</body></html>`;
}

/**
 * Bina HTML untuk laporan SENARAI ADUAN.
 */
export function buildListReportHtml(feedbacks, filters, t) {
  const rows = feedbacks.map((fb, i) => {
    const status = fb.status || 'new';
    const prio = fb.priority || 'medium';
    return `<tr>
      <td style="text-align:center">${i + 1}</td>
      <td>${formatShortDate(fb.submittedAt)}</td>
      <td><span class="badge ${badgeClass('b', status)}">${statusLabel(status, t)}</span></td>
      <td><span class="badge ${badgeClass('b', prio)}">${priorityLabel(prio, t)}</span></td>
      <td>${categoryLabel(fb.category, t)}</td>
      <td>${fb.location || '-'}</td>
      <td>${fb.isAnonymous ? t('admin.details_anonymous_yes') : t('admin.details_anonymous_no')}</td>
      <td class="desc">${(fb.description || '').replace(/</g, '&lt;')}</td>
      <td class="note-cell">${(fb.adminNotes || '').replace(/</g, '&lt;') || '-'}</td>
      <td class="id-cell">${fb.id}</td>
    </tr>`;
  }).join('');

  const filterDesc = [
    filters.status !== 'All' ? `${t('admin.col_status')}: ${statusLabel(filters.status, t)}` : null,
    filters.category !== 'All' ? `${t('admin.col_category')}: ${categoryLabel(filters.category, t)}` : null,
    filters.priority !== 'All' ? `${t('admin.col_priority')}: ${priorityLabel(filters.priority, t)}` : null,
    filters.location !== 'All' ? `${t('locations.filter_label')}: ${filters.location === 'manual' ? t('locations.fallback_manual') : filters.location}` : null,
  ].filter(Boolean).join(' &middot; ') || t('reports.all_filters', 'Semua penapis');

  return `<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8"><title>Senarai Aduan</title><style>${REPORT_CSS}</style></head><body>
<div class="cover">
  <p class="eyebrow">${t('admin.eyebrow')}</p>
  <h1>${t('reports.report_list_title', 'Senarai Aduan')}</h1>
  <p class="subtitle">${t('reports.report_list_subtitle', 'Rekod lengkap maklum balas yang diterima.')}</p>
  <div class="meta"><span>${t('reports.generated_on')}: ${generatedAt()}</span><span>${t('reports.total_label')}: ${feedbacks.length}</span></div>
</div>

<p class="row-meta"><strong>${t('reports.filter_applied', 'Penapis')}:</strong> ${filterDesc}</p>

<table>
  <thead><tr>
    <th style="text-align:center;width:24px">No</th>
    <th>${t('admin.col_date')}</th>
    <th>${t('admin.col_status')}</th>
    <th>${t('admin.col_priority')}</th>
    <th>${t('admin.col_category')}</th>
    <th>${t('admin.col_location')}</th>
    <th>${t('admin.details_anonymous')}</th>
    <th>${t('form.description')}</th>
    <th>${t('admin.details_notes')}</th>
    <th>${t('admin.details_id')}</th>
  </tr></thead>
  <tbody>${rows || `<tr><td colspan="10" class="empty">${t('admin.no_data')}</td></tr>`}</tbody>
</table>

<div class="footer">
  ${t('admin.eyebrow')} &middot; ${t('reports.report_list_title')} &middot; ${t('reports.generated_on')} ${generatedAt()}
</div>
</body></html>`;
}

/**
 * Cetak HTML ke PDF melalui dialog cetak pelayar.
 * Guna iframe tersembunyi (tahan popup-blocker).
 */
export function printHtml(htmlContent) {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
  document.body.appendChild(iframe);

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    }, 1500);
  };

  const doc = iframe.contentWindow.document || iframe.contentDocument;
  doc.open();
  doc.write(htmlContent);
  doc.close();

  const win = iframe.contentWindow;
  const triggerPrint = () => {
    try {
      win.focus();
      win.print();
    } catch (e) {
      console.error('Print failed:', e);
    }
    cleanup();
  };

  if (win.onload !== undefined) {
    win.onload = triggerPrint;
    setTimeout(triggerPrint, 800);
  } else {
    setTimeout(triggerPrint, 800);
  }
}
