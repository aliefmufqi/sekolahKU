# 🏫 SMA Jalavadya - Sistem Informasi Sekolah

Aplikasi web sekolah lengkap dengan frontend React dan backend Express.js.

## 🛠️ Teknologi

### Frontend
- **React 18** + Vite
- Custom CSS (tanpa library UI eksternal)
- Font: Playfair Display + DM Sans

### Backend  
- **Express.js** (Node.js)
- JWT Authentication
- bcryptjs (enkripsi password)
- Multer (upload file)
- In-memory database (siap diganti dengan MongoDB/PostgreSQL)

---

## 🚀 Cara Menjalankan

### 1. Backend
```bash
cd backend
npm install
npm start
# Server berjalan di http://localhost:3001
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# Aplikasi berjalan di http://localhost:3000
```

---

## 🔑 Login Admin (Demo)
- **Email:** admin@jalavadya.sch.id
- **Password:** admin123

---

## 📋 Fitur Lengkap

### Pengunjung (Public)
| Fitur | Halaman | Deskripsi |
|-------|---------|-----------|
| Beranda | `/` | Hero, statistik, berita terbaru, prestasi |
| Informasi Sekolah | `/informasi` | Berita, pengumuman, program sekolah |
| Kurikulum | `/kurikulum` | Unduh dokumen kurikulum & silabus |
| **Prestasi** ⭐ | `/prestasi` | Prestasi akademik, olahraga, seni, dll |
| Galeri | `/media` | Foto dan dokumentasi kegiatan |
| Lokasi & Peta | `/lokasi` | Peta sekolah, alamat, jam operasional |
| Kontak | `/kontak` | Formulir pesan, informasi kontak |

### Admin (Authenticated)
| Fitur | Deskripsi |
|-------|-----------|
| Dashboard | Ringkasan data dan statistik |
| Kelola Informasi | CRUD berita & pengumuman |
| Kelola Kurikulum | CRUD dokumen kurikulum |
| **Kelola Prestasi** ⭐ | CRUD data prestasi sekolah |
| Kelola Media | CRUD foto & galeri |
| Statistik | Edit data statistik sekolah |
| Pesan Masuk | Baca & kelola pesan kontak |
| Tema | Ubah warna & tampilan website |
| Ekspor Laporan | Download laporan PDF & CSV/Excel |

---

## 🗄️ API Endpoints

### Auth
- `POST /api/auth/login` - Login admin
- `GET /api/auth/me` - Info user (protected)

### Public
- `GET /api/informasi` - Daftar informasi
- `GET /api/kurikulum` - Daftar kurikulum  
- `GET /api/prestasi` - Daftar prestasi
- `GET /api/media` - Daftar media
- `GET /api/lokasi` - Informasi lokasi
- `GET /api/statistik` - Data statistik
- `POST /api/kontak` - Kirim pesan

### Admin (JWT Required)
- `POST/PUT/DELETE /api/informasi`
- `POST/DELETE /api/kurikulum`
- `POST/PUT/DELETE /api/prestasi`
- `POST/DELETE /api/media`
- `PUT /api/lokasi`
- `PUT /api/statistik`
- `GET/PUT/DELETE /api/kontak`
- `GET/PUT /api/tema`
- `GET /api/laporan/export/pdf`
- `GET /api/laporan/export/excel`

---

## 📐 Class Diagram (sesuai spesifikasi)

```
Pengunjung ──────────────────────────────
│ + aksesWebsite()                       │
│ + lihatInformasi()                     │
│ + lihatKurikulum()                     │
│ + lihatPeta()          ┌──────────────┤
│ + kontakSekolah()      │              │
│ + lihatPrestasi()      │              │
└────────┬───────────────┘              │
         │ 0..*                          │
    ┌────┴────┐ ┌────────┐ ┌───────┐ ┌─┴──────┐
    │Informasi│ │Kurikulu│ │Lokasi │ │ Kontak │
    │ Prestasi│ │   m    │ │       │ │        │
    └─────────┘ └────────┘ └───────┘ └────────┘

User (parent)
│ - id, nama, email, password
│ + login(), logout()
└── Admin (extends User)
    │ + kelolaInformasi()
    │ + kelolaStatistik()
    │ + uploadMedia()
    │ + exportLaporan()
    │ + ubahTema()
    │ + kelolaPrestasi()
    └──┬──────┬──────┬──────┬──────
       │      │      │      │
   Statistik Media Laporan Tema
```
