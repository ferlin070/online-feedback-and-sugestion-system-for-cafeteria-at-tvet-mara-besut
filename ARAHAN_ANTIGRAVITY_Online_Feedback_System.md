# Arahan Pembangunan — Online Feedback and Suggestion System
### (Paste terus kepada Antigravity)

---

## KONTEKS PROJEK

Bina sebuah **Online Feedback and Suggestion System** — platform web untuk kutip, urus, dan analisis maklum balas/cadangan daripada pengguna (contoh: pelanggan kafe/pelajar) kepada pihak pentadbir. Pengguna akses borang melalui kod QR (tiada app diperlukan). Admin urus semua submission melalui dashboard.

Rujuk PRD penuh untuk konteks produk, keperluan fungsian, dan model data. Ringkasan teknikal di bawah adalah untuk pembangunan terus.

---

## TECH STACK (WAJIB IKUT)

- **Frontend:** React (Vite), responsif mobile-first
- **Backend:** Firebase — Firestore (database), Firebase Authentication (login admin sahaja), Firebase Hosting (deploy), Cloud Functions (auto-tag & notifikasi)
- **Storage:** Firebase Storage (lampiran foto)
- **Styling:** Tailwind CSS
- **Tiada backend server custom** — semua logik backend guna Cloud Functions

---

## STRUKTUR DATA (FIRESTORE) — GUNA STRUKTUR INI TEPAT

**Koleksi `feedback`:**
```
id: string
category: string            // auto-tagged; admin boleh edit
priority: "low" | "medium" | "high"
description: string
photoUrl: string | null
location: string | null
status: "new" | "under_review" | "resolved"
submittedAt: timestamp
updatedAt: timestamp
adminNotes: string | null
isAnonymous: boolean
```

**Koleksi `admins`:**
```
uid: string
name: string
email: string
role: "admin" | "superadmin"
```

---

## MODUL PEMBANGUNAN (ikut urutan, satu modul = satu delivery)

### MODUL 1 — Setup projek & Firebase
- Setup React + Vite + Tailwind
- Setup Firebase project (Firestore, Auth, Hosting, Storage, Functions)
- Setup `.env` untuk Firebase config (jangan hardcode API key dalam kod)
- Setup Firestore Security Rules asas: public boleh `create` di koleksi `feedback`, hanya admin authenticated boleh `read/update`

**Deliverable:** repo boleh run secara local, Firebase connected, deploy kosong berjaya ke Hosting.

---

### MODUL 2 — Borang maklum balas (public-facing)
- Halaman borang: kategori (dropdown), butiran (textarea, wajib), upload foto (opsyenal, ke Firebase Storage), lokasi (opsyenal)
- Validasi input (medan wajib, had panjang teks)
- Submit → simpan ke Firestore koleksi `feedback` dengan `status: "new"`, `submittedAt: serverTimestamp()`
- Halaman pengesahan selepas hantar (papar rujukan ID)
- Mesti berfungsi lancar di skrin mobile (ini akan diakses via kod QR pada telefon)

**Deliverable:** borang boleh diakses via URL, submission masuk ke Firestore, UI responsif.

---

### MODUL 3 — Auto-kategori & prioriti (Cloud Function)
- Cloud Function `onCreate` trigger pada koleksi `feedback`
- Imbas teks `description` untuk kata kunci → auto-set/update `category` dan `priority`
- Senarai kata kunci contoh (boleh extend):
  - Kritikal/Tinggi: "bahaya", "rosak teruk", "bocor", "kebakaran"
  - Kebersihan: "kotor", "sampah", "bau"
  - Perkhidmatan: "lambat", "kasar", "tidak sopan"
- Jika tiada kata kunci sepadan → default `category: "Umum"`, `priority: "medium"`

**Deliverable:** Cloud Function dapat auto-update dokumen selepas submission baru, boleh diuji dengan beberapa contoh teks.

---

### MODUL 4 — Dashboard admin
- Halaman login admin (Firebase Auth — email/password)
- Selepas login: senarai semua submission (jadual) dengan penapis (status, kategori, prioriti, tarikh)
- Klik satu submission → papar detail penuh, admin boleh:
  - Tukar `status` (`new` → `under_review` → `resolved`)
  - Tambah/edit `adminNotes`
  - Edit `category`/`priority` manual jika perlu
- Route admin mesti protected (redirect ke login jika belum authenticated)

**Deliverable:** admin boleh login, lihat, tapis, dan urus semua submission.

---

### MODUL 5 — Notifikasi masa nyata
- Guna Firestore realtime listener (`onSnapshot`) di dashboard untuk submission `priority: "high"` dan `status: "new"`
- Papar notifikasi/badge dalam dashboard apabila ada submission baru berkeutamaan tinggi
- (Fasa 2 opsyenal: hantar emel guna Cloud Function + Firebase Extensions "Trigger Email")

**Deliverable:** admin nampak notifikasi live tanpa refresh page apabila ada aduan tinggi keutamaan.

---

### MODUL 6 — Laporan & analitik
- Halaman ringkas dengan:
  - Jumlah submission ikut kategori (bar chart)
  - Jumlah submission ikut status (pie/donut chart)
  - Trend bulanan (line chart) — jumlah submission per bulan
- Guna library chart ringan (contoh: Recharts)
- Data diambil terus dari Firestore (aggregate di client-side untuk skop projek ini; tak perlu BigQuery/aggregation server kompleks)

**Deliverable:** halaman laporan berfungsi dengan carta yang tepat berdasarkan data sebenar.

---

### MODUL 7 — Testing & deploy
- Unit test asas untuk fungsi utility (validasi borang, logik kata kunci)
- Manual UAT checklist: submit borang → auto-tag berfungsi → notifikasi muncul → admin boleh tukar status → laporan update
- Deploy production ke Firebase Hosting
- Sediakan `README.md` ringkas: cara setup, cara run local, cara deploy

**Deliverable:** sistem live di Firebase Hosting URL, README lengkap.

---

## PERATURAN AM UNTUK ANTIGRAVITY

1. **Kod mesti lengkap dan siap-guna** — jangan hantar snippet separuh atau placeholder `// TODO implement this`. Setiap modul mesti boleh dijalankan terus.
2. **Ikut struktur data Firestore yang ditetapkan di atas dengan tepat** — jangan tukar nama field tanpa makluman.
3. **Jangan hardcode Firebase config/API keys** — guna environment variables.
4. **Setiap modul dihantar sebagai satu delivery berasingan** ikut urutan MODUL 1 → 7. Jangan lompat ke modul seterusnya sebelum modul semasa disahkan lengkap.
5. **Sertakan ringkasan perubahan** (fail yang ditambah/diubah) pada setiap delivery untuk memudahkan review.
6. **Jika ada keperluan yang tidak jelas atau bercanggah dengan PRD, tanya dahulu** sebelum buat andaian besar yang menjejaskan struktur data atau seni bina.
7. **Responsive design wajib** — sistem ini akan digunakan majoriti melalui telefon (akses via kod QR).

---

## RUJUKAN

PRD penuh (konteks produk, objektif, keperluan fungsian & bukan fungsian): lihat dokumen `PRD_Online_Feedback_Suggestion_System.md` yang disertakan bersama.
