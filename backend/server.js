const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// ========== LOAD .ENV ==========
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) return;
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  } catch (e) {
    console.warn('Gagal membaca .env:', e.message);
  }
}
loadEnv();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'jalavadya_secret_fallback';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// ========== KONEKSI MYSQL ==========
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'jalavadya_db',
  waitForConnections: true,
  connectionLimit: 10,
});

// Test koneksi saat server start
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Terhubung ke MySQL database');
    conn.release();
  } catch (err) {
    console.error('❌ Gagal koneksi MySQL:', err.message);
    console.error('   Pastikan Laragon/MySQL sudah berjalan dan .env sudah benar');
    process.exit(1);
  }
})();

// ========== MULTER ==========
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ========== AUTH MIDDLEWARE ==========
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token diperlukan' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token tidak valid' });
  }
};

// ========== AUTH ROUTES ==========
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: 'Email atau password salah' });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, nama: user.nama },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id, nama: user.nama, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nama, email, role FROM users WHERE id = ?', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User tidak ditemukan' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== ADMIN MANAGEMENT ==========
app.get('/api/admin/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Akses ditolak' });
  try {
    const [rows] = await pool.query('SELECT id, nama, email, role, created_at FROM users');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Akses ditolak' });
  try {
    const { nama, email, password, role } = req.body;
    if (!nama || !email || !password) return res.status(400).json({ error: 'nama, email, dan password wajib diisi' });
    const [exist] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exist.length) return res.status(400).json({ error: 'Email sudah digunakan' });
    const hash = bcrypt.hashSync(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
      [nama, email, hash, role || 'admin']
    );
    res.status(201).json({ id: result.insertId, nama, email, role: role || 'admin' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/admin/users/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Akses ditolak' });
  try {
    const { nama, email, password, role } = req.body;
    const fields = [];
    const values = [];
    if (nama)     { fields.push('nama = ?');     values.push(nama); }
    if (email)    { fields.push('email = ?');    values.push(email); }
    if (role)     { fields.push('role = ?');     values.push(role); }
    if (password) { fields.push('password = ?'); values.push(bcrypt.hashSync(password, 10)); }
    if (!fields.length) return res.status(400).json({ error: 'Tidak ada data yang diupdate' });
    values.push(req.params.id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.query('SELECT id, nama, email, role FROM users WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/admin/users/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Akses ditolak' });
  if (req.user.id == req.params.id) return res.status(400).json({ error: 'Tidak bisa menghapus akun sendiri' });
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Admin berhasil dihapus' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== INFORMASI ==========
app.get('/api/informasi', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM informasi ORDER BY tanggal DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/informasi', authMiddleware, async (req, res) => {
  try {
    const { judul, isi, kategori } = req.body;
    const tanggal = new Date().toISOString().split('T')[0];
    const [result] = await pool.query(
      'INSERT INTO informasi (judul, isi, kategori, tanggal) VALUES (?, ?, ?, ?)',
      [judul, isi, kategori || 'berita', tanggal]
    );
    const [rows] = await pool.query('SELECT * FROM informasi WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/informasi/:id', authMiddleware, async (req, res) => {
  try {
    const { judul, isi, kategori } = req.body;
    await pool.query(
      'UPDATE informasi SET judul = ?, isi = ?, kategori = ? WHERE id = ?',
      [judul, isi, kategori, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM informasi WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/informasi/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM informasi WHERE id = ?', [req.params.id]);
    res.json({ message: 'Berhasil dihapus' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ========== KURIKULUM ==========
app.get('/api/kurikulum', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT *, nama_dokumen AS namaDokumen FROM kurikulum ORDER BY id DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/kurikulum', authMiddleware, async (req, res) => {
  try {
    const { namaDokumen, deskripsi, file, tahun } = req.body;
    const [result] = await pool.query(
      'INSERT INTO kurikulum (nama_dokumen, deskripsi, file, tahun) VALUES (?, ?, ?, ?)',
      [namaDokumen, deskripsi, file, tahun]
    );
    const [rows] = await pool.query('SELECT *, nama_dokumen AS namaDokumen FROM kurikulum WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/kurikulum/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM kurikulum WHERE id = ?', [req.params.id]);
    res.json({ message: 'Berhasil dihapus' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ========== LOKASI ==========
app.get('/api/lokasi', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT *, jam_operasional AS jamOperasional FROM lokasi LIMIT 1');
    res.json(rows[0] || {});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/lokasi', authMiddleware, async (req, res) => {
  try {
    const { alamat, latitude, longitude, telepon, email, jamOperasional } = req.body;
    const [exist] = await pool.query('SELECT id FROM lokasi LIMIT 1');
    if (exist.length) {
      await pool.query(
        'UPDATE lokasi SET alamat=?, latitude=?, longitude=?, telepon=?, email=?, jam_operasional=? WHERE id=?',
        [alamat, latitude, longitude, telepon, email, jamOperasional, exist[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO lokasi (alamat, latitude, longitude, telepon, email, jam_operasional) VALUES (?,?,?,?,?,?)',
        [alamat, latitude, longitude, telepon, email, jamOperasional]
      );
    }
    const [rows] = await pool.query('SELECT *, jam_operasional AS jamOperasional FROM lokasi LIMIT 1');
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ========== KONTAK ==========
app.get('/api/kontak', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM kontak ORDER BY tanggal DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/kontak', async (req, res) => {
  try {
    const { nama, email, telepon, pesan } = req.body;
    const tanggal = new Date().toISOString().split('T')[0];
    const [result] = await pool.query(
      'INSERT INTO kontak (nama, email, telepon, pesan, tanggal, status) VALUES (?, ?, ?, ?, ?, ?)',
      [nama, email, telepon, pesan, tanggal, 'belum_dibalas']
    );
    const [rows] = await pool.query('SELECT * FROM kontak WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/kontak/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE kontak SET status = ? WHERE id = ?', [status, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM kontak WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/kontak/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM kontak WHERE id = ?', [req.params.id]);
    res.json({ message: 'Berhasil dihapus' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ========== STATISTIK ==========
app.get('/api/statistik', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT jumlah_siswa AS jumlahSiswa, jumlah_guru AS jumlahGuru,
             jumlah_kelas AS jumlahKelas, tahun_berdiri AS tahunBerdiri,
             akreditasi, lulusan_diterima AS lulusanDiterima
      FROM statistik LIMIT 1
    `);
    res.json(rows[0] || {});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/statistik', authMiddleware, async (req, res) => {
  try {
    const { jumlahSiswa, jumlahGuru, jumlahKelas, tahunBerdiri, akreditasi, lulusanDiterima } = req.body;
    const [exist] = await pool.query('SELECT id FROM statistik LIMIT 1');
    if (exist.length) {
      await pool.query(
        'UPDATE statistik SET jumlah_siswa=?, jumlah_guru=?, jumlah_kelas=?, tahun_berdiri=?, akreditasi=?, lulusan_diterima=? WHERE id=?',
        [jumlahSiswa, jumlahGuru, jumlahKelas, tahunBerdiri, akreditasi, lulusanDiterima, exist[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO statistik (jumlah_siswa, jumlah_guru, jumlah_kelas, tahun_berdiri, akreditasi, lulusan_diterima) VALUES (?,?,?,?,?,?)',
        [jumlahSiswa, jumlahGuru, jumlahKelas, tahunBerdiri, akreditasi, lulusanDiterima]
      );
    }
    const [rows] = await pool.query(`
      SELECT jumlah_siswa AS jumlahSiswa, jumlah_guru AS jumlahGuru,
             jumlah_kelas AS jumlahKelas, tahun_berdiri AS tahunBerdiri,
             akreditasi, lulusan_diterima AS lulusanDiterima
      FROM statistik LIMIT 1
    `);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ========== MEDIA ==========
app.get('/api/media', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT *, nama_file AS namaFile FROM media ORDER BY tanggal DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/media', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const namaFile   = req.file?.filename || req.body.namaFile;
    const tipe       = req.body.tipe || 'foto';
    const url        = req.file ? `/uploads/${req.file.filename}` : req.body.url;
    const keterangan = req.body.keterangan;
    const tanggal    = new Date().toISOString().split('T')[0];
    const [result] = await pool.query(
      'INSERT INTO media (nama_file, tipe, url, keterangan, tanggal) VALUES (?, ?, ?, ?, ?)',
      [namaFile, tipe, url, keterangan, tanggal]
    );
    const [rows] = await pool.query('SELECT *, nama_file AS namaFile FROM media WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/media/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM media WHERE id = ?', [req.params.id]);
    res.json({ message: 'Berhasil dihapus' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ========== PRESTASI ==========
app.get('/api/prestasi', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM prestasi ORDER BY tahun DESC, id DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/prestasi', authMiddleware, async (req, res) => {
  try {
    const { judul, deskripsi, kategori, tingkat, tahun, peraih, medali } = req.body;
    const [result] = await pool.query(
      'INSERT INTO prestasi (judul, deskripsi, kategori, tingkat, tahun, peraih, medali) VALUES (?,?,?,?,?,?,?)',
      [judul, deskripsi, kategori, tingkat, tahun, peraih, medali]
    );
    const [rows] = await pool.query('SELECT * FROM prestasi WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/prestasi/:id', authMiddleware, async (req, res) => {
  try {
    const { judul, deskripsi, kategori, tingkat, tahun, peraih, medali } = req.body;
    await pool.query(
      'UPDATE prestasi SET judul=?, deskripsi=?, kategori=?, tingkat=?, tahun=?, peraih=?, medali=? WHERE id=?',
      [judul, deskripsi, kategori, tingkat, tahun, peraih, medali, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM prestasi WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/prestasi/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM prestasi WHERE id = ?', [req.params.id]);
    res.json({ message: 'Berhasil dihapus' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ========== TEMA ==========
app.get('/api/tema', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tema LIMIT 1');
    res.json(rows[0] || { warna: '#0f4c75', layout: 'default' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/tema', authMiddleware, async (req, res) => {
  try {
    const { warna, layout } = req.body;
    const [exist] = await pool.query('SELECT id FROM tema LIMIT 1');
    if (exist.length) {
      await pool.query('UPDATE tema SET warna=?, layout=? WHERE id=?', [warna, layout, exist[0].id]);
    } else {
      await pool.query('INSERT INTO tema (warna, layout) VALUES (?,?)', [warna, layout]);
    }
    const [rows] = await pool.query('SELECT * FROM tema LIMIT 1');
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ========== LAPORAN ==========
app.get('/api/laporan', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM laporan ORDER BY tanggal DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/laporan/export/pdf', authMiddleware, async (req, res) => {
  try {
    const [statistik] = await pool.query('SELECT * FROM statistik LIMIT 1');
    const [prestasi]  = await pool.query('SELECT judul, tahun FROM prestasi');
    const [informasi] = await pool.query('SELECT judul FROM informasi');
    const s = statistik[0] || {};
    const content =
      `LAPORAN DATA SMA JALAVADYA\n${'='.repeat(50)}\n\n` +
      `Dibuat: ${new Date().toLocaleDateString('id-ID')}\n\n` +
      `STATISTIK SEKOLAH:\n` +
      `- Jumlah Siswa: ${s.jumlah_siswa}\n` +
      `- Jumlah Guru: ${s.jumlah_guru}\n` +
      `- Jumlah Kelas: ${s.jumlah_kelas}\n` +
      `- Akreditasi: ${s.akreditasi}\n\n` +
      `PRESTASI (${prestasi.length} total):\n` +
      prestasi.map(p => `- ${p.judul} (${p.tahun})`).join('\n') + '\n\n' +
      `INFORMASI (${informasi.length} total):\n` +
      informasi.map(i => `- ${i.judul}`).join('\n');
    res.setHeader('Content-Disposition', 'attachment; filename=laporan_jalavadya.txt');
    res.setHeader('Content-Type', 'text/plain');
    res.send(content);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/laporan/export/excel', authMiddleware, async (req, res) => {
  try {
    const [informasi] = await pool.query('SELECT judul, tanggal, kategori FROM informasi');
    const csv = `Judul,Tanggal,Kategori\n` +
      informasi.map(i => `"${i.judul}","${i.tanggal}","${i.kategori}"`).join('\n');
    res.setHeader('Content-Disposition', 'attachment; filename=laporan_jalavadya.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`🚀 Server berjalan di http://localhost:${PORT}`));