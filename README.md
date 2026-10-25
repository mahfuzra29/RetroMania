# RetroTools 🚀
> Real-Time Collaborative Team Retrospective Web Application

RetroTools adalah platform retrospektif tim real-time yang dirancang khusus untuk memfasilitasi sprint dan project retro secara terstruktur, interaktif, dan tanpa hambatan (*frictionless entry*).

---

## 🌟 Fitur Utama (Berdasarkan PRD)

### Fase 1: Setup & Lobby
* **FR 1.1 - Create Room**: Host membuat ruangan dengan menentukan Nama Room, Waktu per sesi (dalam menit), dan Nama Host.
* **FR 1.2 - Shareable Link**: ID unik di-generate dan dapat disalin dengan 1 klik untuk mengundang tim via URL (`?room=XYZ`).
* **FR 1.3 - Join Room**: Peserta dapat langsung bergabung tanpa akun/password (*frictionless*), cukup memasukkan Display Name.
* **FR 1.4 - Real-time Presence**: Daftar peserta yang bergabung dan status online/offline ditampilkan secara real-time.
* **FR 1.5 - Start Session**: Kontrol eksklusif Host untuk memulai sesi pertama.

### Fase 2: Sesi "Went Well" & "Went Bad"
* **FR 2.1 - Timer**: Countdown timer tersinkronisasi antar seluruh klien, lengkap dengan visual progress dan audio warning chime.
* **FR 2.2 - Anonymous Submission**: Masukan bersifat anonim 100%. Isi kartu anggota lain otomatis disembunyikan (*masked*) sampai sesi waktu berakhir.
* **FR 2.3 - Submission Tracker**: Indikator centang real-time menunjukkan siapa saja anggota yang sudah mengirimkan masukan.
* **FR 2.4 - Host Controls**: Tombol **+1 Menit** dan **Akhiri Sesi** lebih awal untuk Host.

### Fase 3: Fase Reveal & Voting (Evaluasi)
* **FR 3.1 - Reveal Cards**: Begitu sesi berakhir, semua kartu terbuka (*unmasked*) serentak untuk seluruh tim.
* **FR 3.2 - Voting System**: Upvote (👍) dan Downvote (👎) dengan kalkulasi net score real-time.
* **FR 3.3 - Sorting**: Kartu diurutkan berdasarkan perolehan suara terbanyak dengan penanda Top #1, #2, #3.
* **FR 3.4 - Next Stage**: Tombol Host untuk melanjutkan alur sesi secara terarah.

### Fase 4: Sesi "Action Items"
* **FR 4.1 - Went Bad Review**: Layar menampilkan kartu kendala (*Went Bad*) yang diurutkan dari vote tertinggi.
* **FR 4.2 - Create Action Item**: Host dapat memilih kartu masalah dan merumuskan solusi konkret lengkap dengan PIC / penanggung jawab.
* **FR 4.3 - Action Items List**: Daftar rencana tindak lanjut tersinkronisasi secara real-time ke layar seluruh tim.

### Fase 5: Penutupan & Laporan (Closed / Summary)
* **FR 5.1 - Close Room**: Host menutup sesi dan membuat rangkuman otomatis lengkap dengan animasi perayaan *confetti*.
* **FR 5.2 - Summary View**: Rangkuman komprehensif mencakup Action Items, What Went Well, What Went Bad, serta metadata tim & waktu.
* **FR 5.3 - Export to PDF**: Tombol cetak yang memanfaatkan native browser print dialog dengan styling CSS `@media print` yang dioptimalkan khusus untuk kertas/PDF (bebas elemen UI yang mengganggu).

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Tailwind CSS v4, Lucide React, Canvas Confetti.
* **Backend**: Node.js, Express, Socket.io (WebSocket real-time sync sub-milidetik).
* **Audio FX**: Web Audio API synthesizer bawaan browser (zero external mp3 downloads).

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Jalankan Mode Development (Hot-Reloading & Real-time Server):
```bash
npm run dev
```
Buka browser di:
```
http://localhost:3000
```

### 2. Jalankan Pengujian E2E Otomatis:
```bash
node test/e2e-simulation.js
```

### 3. Build & Jalankan Mode Produksi:
```bash
npm run build
npm run start
```
