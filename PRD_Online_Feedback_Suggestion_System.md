# PRD — Online Feedback and Suggestion System

**Versi:** 1.0
**Disediakan berdasarkan:** Project Proposal Report — IKM Besut (Diploma in Computer Technology, Cloud Computing)
**Status:** Draf untuk handoff pembangunan

---

## 1. Ringkasan produk

Sistem web berpusat untuk kutip, urus, dan analisis maklum balas/cadangan daripada pengguna (contoh: pelanggan kafe, pelajar, penduduk asrama) kepada pihak pengurusan (admin kafe/institusi). Pengguna mengakses borang maklum balas melalui kod QR tanpa perlu memasang aplikasi. Admin memantau, mengurus status, dan menjana laporan trend melalui dashboard.

Sistem ini menggantikan kotak cadangan fizikal dan emel bertaburan yang menyebabkan data hilang, tiada penjejakan status, dan sukar dianalisis.

---

## 2. Masalah yang diselesaikan

| Masalah sedia ada | Kesan |
|---|---|
| Maklum balas fizikal/emel bertaburan | Data hilang, tiada rekod berpusat |
| Tiada penjejakan status | Pengguna tidak tahu status aduan mereka (Under Review / Resolved) |
| Tiada sistem prioriti | Isu kritikal tidak diutamakan, respons lambat |
| Tiada analitik | Pengurusan tidak dapat kesan trend/isu berulang untuk buat keputusan |

---

## 3. Objektif produk

1. Sediakan platform web mudah dan responsif untuk pengguna hantar maklum balas/cadangan.
2. Sediakan sistem pengurusan pentadbir (admin) yang komprehensif untuk semak, kategorikan, dan selesaikan aduan.
3. Automasikan kategori/prioriti maklum balas berdasarkan kata kunci.
4. Sediakan notifikasi masa nyata untuk isu berkeutamaan tinggi.
5. Sediakan laporan/analitik trend untuk sokongan keputusan pengurusan.

---

## 4. Pengguna & peranan (roles)

| Peranan | Keterangan | Akses |
|---|---|---|
| **Pengguna (Submitter)** | Pelanggan/pelajar yang hantar maklum balas | Imbas QR → isi borang → semak status sendiri (opsyenal login) |
| **Admin** | Pengurus kafe/institusi | Login → dashboard → urus semua submission → tukar status → jana laporan |
| **Super Admin (opsyenal, fasa 2)** | Pentadbir sistem peringkat lebih tinggi | Urus akaun admin, tetapan kategori, akses penuh |

---

## 5. Skop projek

### Dalam skop
- Borang maklum balas web-based (mobile-responsive), akses via kod QR
- Auto-kategori & tag keutamaan berdasarkan kata kunci
- Dashboard admin: senarai, penapis, tukar status, respons
- Notifikasi masa nyata untuk isu keutamaan tinggi
- Laporan/analitik asas (carta, trend bulanan)
- Cloud storage (Firebase) untuk semua data
- Autentikasi admin (login selamat)

### Di luar skop (fasa ini)
- Aplikasi mobile standalone (native app)
- Mod offline
- Analisis sentimen AI lanjutan (boleh dipertimbang fasa akan datang)
- Integrasi sistem luaran (contoh: sistem kewangan/inventori)

---

## 6. Keperluan fungsian

| No | Modul | Komponen | Prioriti | Keterangan |
|---|---|---|---|---|
| 1 | User Login | Authentication | Tinggi | Login selamat untuk admin (dan opsyenal untuk pengguna semak status) |
| 2 | Feedback Form | Input UI | Tinggi | Borang digital untuk hantar cadangan/aduan |
| 3 | Category Tag | Classification | Sederhana | Auto-sort ikut jenis isu (kata kunci) |
| 4 | Admin Dashboard | Management UI | Tinggi | Jejak dan urus semua maklum balas |
| 5 | Real-time Alert | Notification | Tinggi | Notifikasi segera untuk isu mendesak |
| 6 | Report Generation | Analytics | Sederhana | Laporan prestasi bulanan (carta/trend) |
| 7 | User Profile | Personal Info | Rendah | Rekod submission pengguna (jika login digunakan) |
| 8 | Cloud Storage | Data Hosting | Tinggi | Backup data selamat di cloud |
| 9 | Help Center | Support | Rendah | Panduan navigasi asas sistem |

### Butiran fungsi utama

**F1 — Hantar maklum balas**
- Pengguna imbas kod QR → dibawa ke borang web
- Medan borang: Kategori (dropdown), Butiran (teks), Lampiran foto (opsyenal), Lokasi (opsyenal/auto)
- Validasi: medan wajib tidak boleh kosong, had panjang teks
- Selepas hantar: papar mesej pengesahan + rujukan ID (jika ada)

**F2 — Auto-kategori & prioriti**
- Sistem imbas kata kunci dalam teks (contoh: "bocor", "kotor", "lambat") → auto-tag kategori (Kemudahan, Kebersihan, Perkhidmatan, dll.)
- Prioriti ditetapkan berdasarkan kata kunci kritikal (contoh: "bahaya", "rosak teruk" → Tinggi)

**F3 — Dashboard admin**
- Senarai semua submission (jadual dengan penapis: status, kategori, tarikh, prioriti)
- Admin boleh tukar status: `Baru → Under Review → Resolved`
- Admin boleh tambah nota/respons dalaman
- Paparan carta ringkas (jumlah ikut kategori/status)

**F4 — Notifikasi masa nyata**
- Apabila submission baru berprioriti tinggi dihantar → admin terima notifikasi (dalam dashboard, boleh extend ke emel/push fasa 2)

**F5 — Laporan & analitik**
- Laporan bulanan: jumlah submission, taburan kategori, purata masa penyelesaian
- Eksport data (CSV, fasa 2)

---

## 7. Keperluan bukan fungsian

| Kategori | Keperluan |
|---|---|
| Prestasi | Borang mesti load < 3 saat pada rangkaian mudah alih 4G |
| Kebolehcapaian | Responsif penuh — desktop, tablet, telefon |
| Keselamatan | SSL/HTTPS, Firebase Authentication untuk admin, peraturan Firestore Security Rules ketat |
| Kebolehpercayaan | Data tidak hilang semasa submission serentak (concurrent writes) |
| Privasi | Pengguna boleh hantar tanpa nama (anonymous) jika tiada login |
| Kebolehskalaan | Reka bentuk cloud-native (Firebase) untuk skala tanpa urus server sendiri |

---

## 8. Seni bina sistem & tech stack (cadangan)

- **Frontend:** React (web app, responsif) — atau HTML/CSS/JS ringkas jika mahu lebih ringan
- **Backend/Database:** Firebase (Firestore untuk data, Firebase Authentication untuk admin login, Firebase Hosting untuk deploy, Cloud Functions untuk logik auto-tag & notifikasi)
- **Storage:** Firebase Storage (untuk lampiran foto, jika ada)
- **Entry point pengguna:** Kod QR → URL borang web (tiada app diperlukan)
- **Browser sokongan:** Chrome, Safari, Edge (versi terkini)

> Nota: Laporan asal turut menyebut MySQL/XAMPP untuk ujian tempatan — ini boleh diabaikan untuk pembangunan produksi kerana Firebase sudah cukup sebagai backend penuh (auth + database + hosting).

---

## 9. Aliran kerja sistem (workflow)

1. **Pengguna imbas kod QR** yang ditampal di lokasi strategik (kaunter, papan notis).
2. **Borang maklum balas web** dibuka — pengguna isi kategori, butiran, dan lampiran (jika perlu).
3. **Hantar ke Firebase** — data disimpan sebagai rekod baru dengan status `Baru`.
4. **Auto-kategori & prioriti** — Cloud Function imbas kata kunci, tetapkan tag kategori dan tahap keutamaan.
5. **Notifikasi masa nyata ke admin** — jika keutamaan tinggi, admin dimaklumkan segera dalam dashboard.
6. **Admin semak di dashboard** — tukar status kepada `Under Review`, tambah nota tindakan.
7. **Tindakan & status Resolved** — apabila isu diselesaikan, admin tukar status; pengguna (jika ada rujukan) boleh semak status.
8. **Laporan & analitik** — data terkumpul dijana sebagai laporan trend bulanan untuk pengurusan.

*(Rujuk carta alur visual di atas.)*

---

## 10. Model data (cadangan struktur Firestore)

**Koleksi: `feedback`**
```
{
  id: string,
  category: string,          // auto-tagged, boleh diedit admin
  priority: "low" | "medium" | "high",
  description: string,
  photoUrl: string | null,
  location: string | null,
  status: "new" | "under_review" | "resolved",
  submittedAt: timestamp,
  updatedAt: timestamp,
  adminNotes: string | null,
  isAnonymous: boolean
}
```

**Koleksi: `admins`**
```
{
  uid: string,
  name: string,
  email: string,
  role: "admin" | "superadmin"
}
```

---

## 11. Skrin yang diperlukan

1. Halaman borang maklum balas (public, mobile-first)
2. Halaman pengesahan hantar
3. Halaman login admin
4. Dashboard admin — senarai & penapis
5. Halaman detail submission (untuk admin tukar status/nota)
6. Halaman laporan/analitik (carta ringkas)
7. Halaman semak status (opsyenal, guna rujukan ID)

---

## 12. Metrik kejayaan

- Bilangan submission berjaya diproses tanpa kehilangan data
- Purata masa dari `Baru` → `Resolved` berkurang berbanding kaedah manual
- % isu keutamaan tinggi yang direspons dalam masa 24 jam
- Kadar penyertaan pengguna (bilangan submission/bulan)

---

## 13. Andaian & kekangan

- Sistem memerlukan sambungan internet (tiada mod offline)
- Prestasi bergantung kepada kestabilan rangkaian dan pelayan cloud
- Keberkesanan sistem bergantung kepada penyertaan pengguna secara sukarela
- Skop pembangunan awal hanya untuk satu lokasi/operasi (boleh dikembangkan kemudian)

---

## 14. Fasa pembangunan dicadangkan

| Fasa | Fokus |
|---|---|
| 1 | Setup projek, Firebase config, struktur data |
| 2 | Borang maklum balas (frontend) + hantar ke Firestore |
| 3 | Auto-kategori & prioriti (Cloud Function) |
| 4 | Dashboard admin (login, senarai, tukar status) |
| 5 | Notifikasi masa nyata |
| 6 | Laporan/analitik + UI polish |
| 7 | Testing (unit, UAT), debugging, deploy |
