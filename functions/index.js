const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
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

/**
 * Cloud Function (1st Gen): autoTagFeedback
 * Dicetuskan apabila dokumen baru dicipta di collection feedback.
 * Auto-klasifikasi kategori dan prioriti berdasarkan kata kunci.
 */
exports.autoTagFeedback = functions.region("asia-southeast1").firestore
  .document("feedback/{feedbackId}")
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data();
    if (!data) {
      functions.logger.warn("Tiada data ditemui dalam snapshot.");
      return null;
    }

    const description = (data.description || "").toLowerCase();

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
    try {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentDocs = await admin.firestore()
        .collection("feedback")
        .where("submittedAt", ">=", fiveMinAgo)
        .count()
        .get();
      if (recentDocs.data().count > 50) {
        functions.logger.warn(`Potensi spam dikesan: ${recentDocs.data().count} penyerahan dalam 5 minit. Feedback ${context.params.feedbackId} masih diproses.`);
      }
    } catch (err) {
      functions.logger.warn("Pemeriksaan anti-spam dilekaukan:", err.message);
    }

    // 4. Kemas kini dokumen sekiranya terdapat perubahan
    if (detectedCategory !== data.category || detectedPriority !== data.priority) {
      try {
        await snapshot.ref.update({
          category: detectedCategory,
          priority: detectedPriority,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        functions.logger.info(`Feedback ${context.params.feedbackId} dikemas kini secara automatik. Kategori: ${detectedCategory}, Prioriti: ${detectedPriority}`);
      } catch (error) {
        functions.logger.error(`Gagal mengemas kini dokumen ${context.params.feedbackId}:`, error);
      }
    } else {
      functions.logger.info(`Feedback ${context.params.feedbackId} tidak memerlukan perubahan.`);
    }

    return null;
  });

