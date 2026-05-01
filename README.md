## Nama : Naufal Ramzi
## NIM  : 202310370311026
## Kelas: Rekayasa Kebutuhan D

# Sistem Pelacakan dan Pemetaan Alumni

Aplikasi web interaktif untuk melakukan pendataan mandiri, pelacakan jejak digital dari berbagai sumber (Internal DB, PDDIKTI, GitHub, Google, ORCID), serta visualisasi pemetaan sebaran domisili alumni.

Proyek ini dibangun menggunakan:
- React.js
- Tailwind CSS
- Leaflet Maps
- Supabase

---

## 🔗 Tautan Website

Live Website :  
https://dailyproject3-bice.vercel.app/

---

# 1. Penjelasan Modul Utama (Fase Sistem)

Sistem ini dirancang berdasarkan tiga alur kerja (fase) utama:

## Fase A (Pendataan & Verifikasi)

Modul untuk menghimpun data alumni secara mandiri yang dilengkapi fitur pencarian otomatis (Smart Geocoding) dan sistem antrean verifikasi oleh Admin untuk menjamin keabsahan data.

## Fase B (Pencarian Interaktif)

Modul pelacakan jejak digital on-demand. Memungkinkan pengguna melacak profil alumni di database internal sekaligus melakukan pencarian paralel ke sumber data publik:

- PDDIKTI
- GitHub
- Google
- ORCID

## Fase C (Pemetaan Sebaran)

Modul visualisasi geografis interaktif yang mengekstrak data alamat alumni menjadi titik koordinat (latitude/longitude) dan menampilkannya sebagai pin marker pada peta.

---

# 2. Tabel Pengujian Kualitas Sistem (Berdasarkan ISO 25010)

Pengujian di bawah ini dilakukan berdasarkan skenario Use Case dan Pseudocode yang telah dirancang pada Daily Project 2.

| No | Modul / Fase | Aspek Kualitas (ISO 25010) | Skenario Pengujian (Test Case) | Hasil yang Diharapkan (Expected Result) | Hasil Aktual (Actual Result) | Status |
|----|--------------|-----------------------------|--------------------------------|-----------------------------------------|--------------------------------|-------|
| 1 | Fase A (Pendataan) | Functional Suitability | Alumni mengisi form pendataan mandiri dan memilih lokasi dari saran Autocomplete (Satelit), lalu menekan tombol "Kirim". | Data tersimpan di tabel dengan status awal "Menunggu Verifikasi". | Data berhasil ditambahkan dan muncul di menu antrean admin dengan status "Menunggu Verifikasi". | ✅ Lulus |
| 2 | Fase A (Verifikasi) | Functional Suitability | Admin menekan tombol "Valid" pada baris data antrean di Dashboard Verifikasi. | Data di DB diubah status nya dari “Menunggu Verifikasi” menjadi "Terverifikasi". | Status data ter-update menjadi "Terverifikasi" dan data langsung muncul di Peta dan Pencarian. | ✅ Lulus |
| 3 | Fase A (Verifikasi) | Functional Suitability | Admin menekan tombol "Tolak" karena data dianggap palsu/tidak valid. | Sistem menolak data dan menghapusnya dari database. | Baris data berhasil terhapus secara permanen dari tabel dan antrean admin. | ✅ Lulus |
| 4 | Fase B (Pencarian) | Functional Suitability & Reliability | Pengguna mencari nama alumni yang TIDAK ADA di Database Internal. | Sistem tidak crash/error, mem-bypass DB internal, dan tetap menampilkan hasil dari pelacakan API Publik. | DB Internal memunculkan pesan "Data tidak ditemukan", sedangkan 4 kolom API Publik (PDDIKTI, GitHub, dll) tetap menampilkan hasil digitalnya. | ✅ Lulus |
| 5 | Fase B (Pencarian) | Performance Efficiency | Sistem melakukan pelacakan ke 4 sumber API eksternal secara bersamaan (parallel fetching). | Tampilan tidak freeze, indikator loading muncul selama proses fetch berlangsung. | Tombol berubah menjadi "Menyiapkan Kueri & Melacak Paralel...", hasil dirender serentak setelah seluruh permintaan terpenuhi. | ✅ Lulus |
| 6 | Fase C (Pemetaan) | Functional Suitability | Sistem mengekstrak nama daerah dari input pendataan alumni (Parsing String & Geocoding). | Sistem mengambil nama daerah spesifik (tanpa embel-embel "Kec/Kab") dan menyimpannya sebagai titik koordinat lintang bujur. | Label pada Peta menampilkan nama daerah yang bersih (Misal: "Tuban") dengan penempatan pin yang sesuai dengan letak lokasi di map. | ✅ Lulus |
| 7 | Fase C (Pemetaan) | Functional Suitability | Pengguna memilih opsi filter nama kampus tertentu (Misal: "Universitas Muhammadiyah Malang") di Peta Sebaran. | Peta memfilter dan hanya merender pin penanda alumni yang berafiliasi dengan kampus tersebut. | Titik pin untuk kampus lain menghilang dari peta, jumlah angka pada pin yang tersisa menyesuaikan. | ✅ Lulus |
| 8 | Keseluruhan | Usability | Mengakses aplikasi menggunakan perangkat dengan layar kecil (Smartphone/Mobile View). | Antarmuka menyesuaikan ukuran (Responsive Design), baris menu menjadi scrollable horizontal. | UI tidak tumpang tindih, kolom pencarian yang awalnya 5 menyamping berubah menjadi tumpukan ke bawah (stacking). | ✅ Lulus |
| 9 | Fase A (Pendataan) | Reliability (Pencegahan Error) | Alumni menekan "Kirim Pendataan" tetapi belum mengklik saran lokasi spesifik dari dropdown satelit (Koordinat kosong). | Sistem memblokir pengiriman data untuk mencegah error blank map di Fase C. | Tombol Submit dalam keadaan Disabled (terkunci) hingga koordinat (lat/lng) terpenuhi. | ✅ Lulus |

---
