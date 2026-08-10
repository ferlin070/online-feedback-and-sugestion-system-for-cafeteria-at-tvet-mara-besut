# Sistem Aduan TVETMARA Besut

Platform web berpusat untuk mengumpul, mengurus, dan menganalisis maklum balas/cadangan daripada pelanggan (pelajar/staf) kepada pihak pengurusan kafeteria TVET MARA Besut.

## Pautan Pantas
- [Arahan Pembangunan](ARAHAN_ANTIGRAVITY_Online_Feedback_System.md)
- [Dokumen Keperluan Produk (PRD)](PRD_Online_Feedback_Suggestion_System.md)

---

## Modul 1: Setup Projek & Firebase (Selesai)
Sistem ini menggunakan **React (Vite) + Tailwind CSS v4** pada bahagian frontend, dan **Firebase (Auth, Firestore, Storage, Functions, Hosting)** pada bahagian backend.

### Keperluan Sistem
- Node.js (v18 ke atas)
- NPM (v9 ke atas)
- Akaun Firebase & Firebase CLI

---

## Cara Setup Projek Secara Lokal

### 1. Klon & Pasang Dependencies
Lakukan pemasangan modul node secara lokal:
```bash
npm install
```

### 2. Sediakan Environment Variables
Salin fail `.env.example` kepada `.env`:
```bash
cp .env.example .env
```
Buka fail `.env` dan masukkan konfigurasi Firebase projek anda:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Jalankan Server Pembangunan Lokal
Jalankan arahan berikut untuk memulakan server pembangunan lokal:
```bash
npm run dev
```
Buka penyemak imbas (browser) anda di alamat `http://localhost:5173`.

---

## Struktur Projek
- `/src/firebase.js` - Konfigurasi dan inisialisasi Firebase SDK.
- `/src/index.css` - Fail CSS utama yang menggunakan Tailwind CSS v4.
- `/src/App.jsx` - Halaman utama aplikasi.
- `/firestore.rules` - Peraturan keselamatan bagi Firestore.
- `/storage.rules` - Peraturan keselamatan bagi Firebase Storage.
- `/firebase.json` - Konfigurasi deployment perkhidmatan Firebase.
- `/functions/` - Cloud Functions (diperlukan dalam Modul 3).

---

## Cara Deploy ke Firebase Hosting

Untuk melakukan deployment ke Firebase, anda perlu log masuk ke akaun Firebase anda terlebih dahulu:

### 1. Log Masuk Firebase CLI
```bash
npx firebase-tools login
```

### 2. Pilih Projek Firebase Anda
Hubungkan projek lokal dengan projek Firebase anda di konsol cloud:
```bash
npx firebase-tools use --add
```

### 3. Bina Aplikasi (Build Production)
Bina fail pengeluaran yang dioptimumkan:
```bash
npm run build
```

### 4. Deploy ke Firebase
Hantar fail binaan (`dist`) ke Firebase Hosting serta kemas kini peraturan keselamatan Firestore & Storage:
```bash
npx firebase-tools deploy
```
Atau deploy Hosting sahaja:
```bash
npx firebase-tools deploy --only hosting
```
