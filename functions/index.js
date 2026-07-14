const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Cloud Function untuk auto-kategori & prioriti (v1 style - mengelakkan isu IAM Eventarc v2)
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
    let detectedPriority = "medium"; // Default priority

    // 1. Logik Keutamaan Tinggi (Priority: high)
    const highPriorityKeywords = ["bahaya", "rosak teruk", "bocor", "kebakaran", "litar pintas", "racun", "sakit perut"];
    const hasHighPriority = highPriorityKeywords.some(keyword => description.includes(keyword));
    if (hasHighPriority) {
      detectedPriority = "high";
    }

    // 2. Logik Pengelasan Kategori (Category classification)
    const cleanlinessKeywords = ["kotor", "sampah", "bau", "lipas", "tikus", "ulat", "lalat", "berhabuk"];
    const serviceKeywords = ["lambat", "kasar", "tidak sopan", "biadab", "sombong", "kurang ajar", "layanan", "pelayan", "staf", "pekerja", "kaunter"];
    const facilityKeywords = ["lampu", "kipas", "meja", "kerusi", "sinki", "tandas", "aircond", "plug", "elektrik", "bocor", "pintu", "paip", "pili"];
    const foodKeywords = ["basi", "mentah", "rambut", "tawar", "masin", "tumpah", "sejuk", "makanan", "minuman", "menu", "sarapan", "lauk", "nasi", "sedap", "harga", "rasa", "air"];

    if (cleanlinessKeywords.some(keyword => description.includes(keyword))) {
      detectedCategory = "Kebersihan";
    } else if (serviceKeywords.some(keyword => description.includes(keyword))) {
      detectedCategory = "Perkhidmatan";
    } else if (facilityKeywords.some(keyword => description.includes(keyword))) {
      detectedCategory = "Kemudahan";
    } else if (foodKeywords.some(keyword => description.includes(keyword))) {
      detectedCategory = "Makanan";
    }

    // 3. Kemas kini dokumen sekiranya terdapat perubahan
    if (detectedCategory !== data.category || detectedPriority !== data.priority) {
      try {
        await snapshot.ref.update({
          category: detectedCategory,
          priority: detectedPriority,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        functions.logger.info(`Feedback ${context.params.feedbackId} berjaya dikemas kini secara automatik. Kategori: ${detectedCategory}, Prioriti: ${detectedPriority}`);
      } catch (error) {
        functions.logger.error(`Gagal mengemas kini dokumen ${context.params.feedbackId}:`, error);
      }
    } else {
      functions.logger.info(`Feedback ${context.params.feedbackId} tidak memerlukan perubahan.`);
    }

    return null;
  });
