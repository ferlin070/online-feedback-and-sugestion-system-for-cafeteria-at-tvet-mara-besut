/**
 * Utiliti eksport data ke CSV.
 */

/**
 * Tukar satu nilai sel kepada string CSV yang selamat (escape quotes & commas).
 * @param {*} value 
 * @returns {string}
 */
function escapeCsvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Jana dan muat turun fail CSV daripada array objek.
 * @param {Array<Object>} data - Array objek untuk dieksport.
 * @param {Array<{key: string, label: string}>} columns - Definisi kolum.
 * @param {string} filename - Nama fail CSV.
 */
export function exportToCsv(data, columns, filename) {
  const header = columns.map(c => escapeCsvCell(c.label)).join(',');
  const rows = data.map(row =>
    columns.map(c => escapeCsvCell(row[c.key])).join(',')
  );
  const csv = [header, ...rows].join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'export.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
