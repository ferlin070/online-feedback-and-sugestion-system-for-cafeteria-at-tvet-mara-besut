# Arahan Tambahan — Bahasa (BM/EN), Dark Mode & Sistem Aduan QR
### (Paste terus kepada Antigravity — susulan daripada brief Online Feedback and Suggestion System sedia ada)

---

## KONTEKS

Ini adalah tambahan ciri kepada sistem **Online Feedback and Suggestion System** yang sedang dibina (React + Vite + Tailwind + Firebase). Tiga ciri baharu perlu ditambah:

1. Button togol Bahasa Melayu / Bahasa Inggeris
2. Button togol Dark Mode / Light Mode
3. Sistem Aduan QR — jana & urus kod QR mengikut lokasi supaya setiap aduan boleh dikesan asal lokasinya

Jangan ubah struktur data sedia ada (`feedback`, `admins`) kecuali seperti dinyatakan di bawah. Semua ciri mesti berfungsi pada borang public dan dashboard admin.

---

## MODUL 8 — Togol Bahasa (BM / EN)

**Keperluan:**
- Button togol (contoh: `BM | EN` atau ikon bendera/globe) di header — kelihatan di borang public DAN dashboard admin
- Guna library `i18next` + `react-i18next` untuk pengurusan terjemahan
- Simpan pilihan bahasa pengguna di `localStorage` supaya kekal bila reload
- Bahasa default: **Bahasa Melayu**

**Struktur fail cadangan:**
```
/src/locales/ms.json
/src/locales/en.json
```

**Skop teks yang WAJIB diterjemah:**
- Borang maklum balas (label medan, placeholder, butang, mesej pengesahan, mesej ralat validasi)
- Dashboard admin (label kolum jadual, status: Baru/Under Review/Resolved, button, tajuk halaman)
- Halaman laporan/analitik (tajuk carta, label)
- Halaman login admin

**Contoh struktur JSON:**
```json
{
  "form": {
    "title": "Borang Maklum Balas",
    "category": "Kategori",
    "description": "Butiran Aduan",
    "submit": "Hantar",
    "success": "Terima kasih! Maklum balas anda telah dihantar."
  },
  "admin": {
    "status_new": "Baru",
    "status_under_review": "Dalam Semakan",
    "status_resolved": "Selesai"
  }
}
```

**Deliverable:** Togol bahasa berfungsi di semua halaman, teks bertukar secara langsung tanpa reload, pilihan kekal selepas refresh.

---

## MODUL 9 — Dark Mode

**Keperluan:**
- Button togol (ikon matahari/bulan) di header — sama seperti togol bahasa, kelihatan di borang public DAN dashboard admin
- Guna Tailwind `dark:` variant (`darkMode: 'class'` dalam `tailwind.config.js`)
- Simpan pilihan di `localStorage` (key: `theme`, value: `"light" | "dark"`)
- Default: ikut sistem pengguna (`prefers-color-scheme`), tapi boleh ditindih manual oleh togol
- Semua komponen (borang, dashboard, jadual, carta) mesti ada varian dark mode yang kontras dan mudah dibaca — termasuk carta di Modul 6 (pastikan warna carta kelihatan jelas dalam dark mode)

**Deliverable:** Seluruh sistem (public + admin) boleh ditogol antara light/dark tanpa reload, pilihan kekal selepas refresh, tiada elemen yang "hilang"/tidak kontras dalam dark mode.

---

## MODUL 10 — Sistem Aduan QR (mengikut lokasi)

**Tujuan:** Setiap lokasi (contoh: meja kafe, blok asrama, kaunter) ada kod QR unik sendiri. Apabila pengguna imbas QR di lokasi tersebut, borang maklum balas terbuka dengan `location` sudah pra-isi secara automatik — pengguna tak perlu taip lokasi secara manual.

### 10.1 — Perubahan struktur data

**Koleksi baharu `locations`:**
```
id: string              // slug, contoh: "kaunter-a", "asrama-blok-2"
name: string            // nama paparan, contoh: "Kaunter A"
qrCodeUrl: string        // URL gambar QR (Firebase Storage)
createdAt: timestamp
active: boolean
```

**Kemaskini koleksi `feedback`:**
- Tambah field: `locationId: string | null` (rujuk kepada `locations.id`)
- Field `location` (teks bebas) sedia ada dikekalkan sebagai fallback untuk submission tanpa QR

### 10.2 — Modul admin: Jana & urus kod QR

- Halaman baharu dalam dashboard admin: **Urus Lokasi & Kod QR**
- Admin boleh:
  - Tambah lokasi baharu (nama sahaja)
  - Sistem auto-jana kod QR yang membawa ke URL: `https://[domain-sistem]/aduan?loc=[locationId]`
  - Guna library `qrcode.react` atau `qrcode` (npm) untuk generate QR di client-side
  - Muat turun kod QR sebagai imej (PNG) untuk dicetak dan ditampal di lokasi fizikal
  - Senarai semua lokasi dengan status aktif/tidak aktif (boleh nyahaktifkan QR lama tanpa padam rekod)

### 10.3 — Borang public: baca parameter QR

- Apabila borang dibuka dengan URL `?loc=[locationId]`:
  - Sistem fetch nama lokasi daripada koleksi `locations` dan papar sebagai label (contoh: "Anda sedang hantar aduan untuk: Kaunter A")
  - Field `locationId` disimpan terus dalam dokumen `feedback` secara automatik (tersembunyi daripada pengguna, tak perlu input manual)
- Jika borang dibuka **tanpa** parameter `loc` (contoh: akses terus tanpa QR), field lokasi kekal sebagai input teks manual (fallback sedia ada)

### 10.4 — Dashboard admin: penapis ikut lokasi

- Tambah penapis baharu di senarai submission (Modul 4): **Lokasi**
- Laporan/analitik (Modul 6) tambah carta baharu: **Jumlah aduan ikut lokasi** — untuk kenal pasti lokasi yang paling banyak isu

**Deliverable:**
- Admin boleh cipta lokasi, jana & muat turun kod QR untuk dicetak
- Imbas QR → borang terbuka dengan lokasi pra-isi automatik
- Dashboard boleh tapis dan lihat statistik ikut lokasi

---

## PERATURAN AM (kekal daripada brief asal)

1. Kod mesti lengkap dan siap-guna — tiada placeholder `// TODO`.
2. Ikut struktur data yang ditetapkan dengan tepat; jangan tukar nama field sedia ada.
3. Jangan hardcode Firebase config/API keys.
4. Setiap modul (8, 9, 10) dihantar sebagai delivery berasingan, ikut urutan.
5. Sertakan ringkasan fail yang ditambah/diubah pada setiap delivery.
6. Responsive design wajib untuk semua ciri baharu — togol bahasa/dark mode dan borang QR akan diakses majoriti melalui telefon.
7. Jika keperluan tidak jelas atau bercanggah dengan brief sedia ada, tanya dahulu sebelum buat andaian besar.

---

## RUJUKAN

Brief asal (Modul 1–7) dan PRD penuh sistem ini disertakan sebelum ini — struktur data `feedback` dan `admins` dalam dokumen tersebut dikekalkan, hanya ditambah seperti dinyatakan di atas.
