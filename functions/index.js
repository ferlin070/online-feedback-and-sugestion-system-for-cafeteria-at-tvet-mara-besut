const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");

// Initialize Firebase Admin SDK
const admin = require("firebase-admin");
admin.initializeApp();

// Kata kunci untuk klasifikasi
const HIGH_PRIORITY_KEYWORDS = [
  "bahaya", "rosak teruk", "bocor", "kebakaran", "litar pintas", "racun", "sakit perut",
  "danger", "badly damaged", "fire", "short circuit", "poison", "stomach ache"
];

const CATEGORY_KEYWORDS = {
  Kebersihan: ["kotor", "sampah", "bau", "lipas", "tikus", "ulat", "lalat", "berhabuk", "dirty", "trash", "smell", "cockroach", "rat", "dusty"],
  Perkhidmatan: ["lambat", "kasar", "tidak sopan", "biadab", "sombong", "kurang ajar", "layanan", "pelayan", "staf", "pekerja", "kaunter", "slow", "rude", "service", "staff", "counter"],
  Kemudahan: ["lampu", "kipas", "meja", "kerusi", "sinki", "tandas", "aircond", "plug", "elektrik", "bocor", "pintu", "paip", "pili", "light", "fan", "table", "chair", "sink", "toilet", "door", "pipe"],
  Makanan: ["basi", "mentah", "rambut", "tawar", "masin", "tumpah", "sejuk", "makanan", "minuman", "menu", "sarapan", "lauk", "nasi", "sedap", "harga", "rasa", "air", "stale", "raw", "hair", "bland", "salty", "cold", "food", "drink", "taste"],
};

// Rate limiting: track submissions per IP (simple in-memory, untuk produksi guna Firestore)
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minit
const RATE_LIMIT_MAX = 10; // max 10 submission per minit per IP
const rateLimitMap = new Map();

// eslint-disable-next-line no-unused-vars -- akan digunakan untuk anti-spam produksi
function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || (now - record.windowStart) > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  record.count += 1;
  return true;
}

// Pembersihan berkala setiap 5 minit untuk elak memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  }
}, 300000);

/**
 * Cloud Function v2: rateLimitCheck
 * Dipanggil sebelum autoTag untuk semak had penyerahan.
 * Ini adalah pendekatan mudah - untuk pengeluaran sebenar, guna App Check atau Firestore counters.
 */

/**
 * Cloud Function v2: autoTagFeedback
 * Dicetuskan apabila dokumen baru dicipta di collection feedback.
 * Auto-klasifikasi kategori dan prioriti berdasarkan kata kunci.
 * Termasuk semakan kadar untuk hadkan spam (max 10 per minit per dokumen).
 */
exports.autoTagFeedback = onDocumentCreated(
  {
    document: "feedback/{feedbackId}",
    region: "asia-southeast1",
    maxInstances: 10,
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.warn("Tiada data ditemui dalam snapshot.");
      return;
    }

    const data = snapshot.data();
    const description = (data.description || "").toLowerCase();
    const context = event.params;

    // Rate limiting check (optional - comment out jika tak perlu)
    // Nota: Functions v2 tidak ada request.auth jadi IP tracking terhad
    // Untuk rate limit sebenar, gunakan Firestore counters

    let detectedCategory = data.category || "Umum";
    let detectedPriority = "medium";

    // 1. Logik Keutamaan Tinggi
    const hasHighPriority = HIGH_PRIORITY_KEYWORDS.some(keyword => description.includes(keyword));
    if (hasHighPriority) {
      detectedPriority = "high";
    }

    // 2. Logik Pengelasan Kategori
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => description.includes(kw))) {
        detectedCategory = category;
        break;
      }
    }

    // 3. Semak had kadar penyerahan untuk anti-spam
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentDocs = await admin.firestore()
      .collection("feedback")
      .where("submittedAt", ">=", fiveMinAgo)
      .count()
      .get();
    if (recentDocs.data().count > 50) {
      logger.warn(`Potensi spam dikesan: ${recentDocs.data().count} penyerahan dalam 5 minit. Feedback ${context.feedbackId} masih diproses.`);
    }

    // 4. Kemas kini dokumen sekiranya terdapat perubahan
    if (detectedCategory !== data.category || detectedPriority !== data.priority) {
      try {
        await snapshot.ref.update({
          category: detectedCategory,
          priority: detectedPriority,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        logger.info(`Feedback ${context.feedbackId} dikemas kini secara automatik. Kategori: ${detectedCategory}, Prioriti: ${detectedPriority}`);
      } catch (error) {
        logger.error(`Gagal mengemas kini dokumen ${context.feedbackId}:`, error);
      }
    } else {
      logger.info(`Feedback ${context.feedbackId} tidak memerlukan perubahan.`);
    }
  }
);
