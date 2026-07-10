/**
 * Config.gs
 * Konfigurasi umum untuk aplikasi Presensi Magang Online
 */

// ============================================
// KONFIGURASI SPREADSHEET
// ============================================
const SPREADSHEET_NAME = 'MAGANG';
const SHEETS = {
  ADMIN_GURU: 'ADMIN_GURU',
  SISWA: 'SISWA',
  PRESENSI: 'PRESENSI'
};

// ============================================
// KONFIGURASI ADMIN
// ============================================
const ADMIN_ID = 'TJKTADMIN2026';

// ============================================
// KONFIGURASI GOOGLE DRIVE
// ============================================
const DRIVE_FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID'; // Ganti dengan ID folder

// ============================================
// KONFIGURASI STATUS PRESENSI
// ============================================
const STATUS_PRESENSI = ['Hadir', 'Sakit', 'Izin'];

// ============================================
// KONFIGURASI KOLOM
// ============================================
const COLUMNS = {
  ADMIN_GURU: {
    ID: 'ID',
    NAMA_GURU: 'NAMA_GURU'
  },
  SISWA: {
    ID: 'ID',
    NAMA: 'NAMA',
    ID_GURU: 'ID_GURU',
    NAMA_GURU: 'NAMA_GURU',
    TEMPAT_MAGANG: 'TEMPAT_MAGANG'
  },
  PRESENSI: {
    TIMESTAMP: 'TIMESTAMP',
    ID_SISWA: 'ID_SISWA',
    NAMA: 'NAMA',
    ID_GURU: 'ID_GURU',
    NAMA_GURU: 'NAMA_GURU',
    TEMPAT_MAGANG: 'TEMPAT_MAGANG',
    FOTO: 'FOTO',
    MAP: 'MAP',
    STATUS: 'STATUS',
    PEMBIMBING_LAPANGAN: 'PEMBIMBING_LAPANGAN',
    KOMPETENSI_YANG_DIKUASAI: 'KOMPETENSI_YANG_DIKUASAI',
    KETERANGAN: 'KETERANGAN'
  }
};

// ============================================
// KONFIGURASI ID
// ============================================
const ID_LENGTH = 6;
const ID_TYPE = 'numeric'; // 'numeric' untuk angka saja

// ============================================
// CORS & KEAMANAN
// ============================================
const ALLOWED_ORIGINS = ['https://presensi-magang.vercel.app', 'http://localhost:3000'];
const REQUEST_TIMEOUT = 30000; // 30 detik
