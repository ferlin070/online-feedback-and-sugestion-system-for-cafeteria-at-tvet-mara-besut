/**
 * Logik auto-kategori & prioriti berdasarkan kata kunci.
 * Berkongsi antara Cloud Function (functions/index.js) dan frontend melalui salinan.
 * Untuk Cloud Function, guna fungsi yang sama di functions/autoTag.js.
 */

export const CATEGORY_KEYWORDS = {
  Kebersihan: ['kotor', 'sampah', 'bau', 'lipas', 'tikus', 'ulat', 'lalat', 'berhabuk', 'dirty', 'trash', 'smell', 'cockroach', 'rat', 'dusty'],
  Perkhidmatan: ['lambat', 'kasar', 'tidak sopan', 'biadab', 'sombong', 'kurang ajar', 'layanan', 'pelayan', 'staf', 'pekerja', 'kaunter', 'slow', 'rude', 'service', 'staff', 'counter'],
  Kemudahan: ['lampu', 'kipas', 'meja', 'kerusi', 'sinki', 'tandas', 'aircond', 'plug', 'elektrik', 'bocor', 'pintu', 'paip', 'pili', 'light', 'fan', 'table', 'chair', 'sink', 'toilet', 'door', 'pipe'],
  Makanan: ['basi', 'mentah', 'rambut', 'tawar', 'masin', 'tumpah', 'sejuk', 'makanan', 'minuman', 'menu', 'sarapan', 'lauk', 'nasi', 'sedap', 'harga', 'rasa', 'air', 'stale', 'raw', 'hair', 'bland', 'salty', 'cold', 'food', 'drink', 'taste'],
};

export const HIGH_PRIORITY_KEYWORDS = ['bahaya', 'rosak teruk', 'bocor', 'kebakaran', 'litar pintas', 'racun', 'sakit perut', 'danger', 'badly damaged', 'fire', 'short circuit', 'poison', 'stomach ache'];

/**
 * Klasifikasi kategori berdasarkan teks description.
 * @param {string} description - Teks maklum balas.
 * @param {string} currentCategory - Kategori semasa (fallback).
 * @returns {string} Kategori yang dikesan.
 */
export function detectCategory(description, currentCategory = 'Umum') {
  const text = (description || '').toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      return category;
    }
  }
  return currentCategory;
}

/**
 * Klasifikasi prioriti berdasarkan teks description.
 * @param {string} description - Teks maklum balas.
 * @param {string} fallback - Prioriti fallback (default: 'medium').
 * @returns {'high'|'medium'|'low'} Tahap prioriti.
 */
export function detectPriority(description, fallback = 'medium') {
  const text = (description || '').toLowerCase();
  const isHigh = HIGH_PRIORITY_KEYWORDS.some(kw => text.includes(kw));
  return isHigh ? 'high' : fallback;
}
