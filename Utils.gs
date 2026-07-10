/**
 * Utils.gs
 * Fungsi-fungsi utility untuk operasi umum dengan Optimasi In-Memory Cache
 */

// ============================================
// IN-MEMORY CACHE (OPTIMASI KECEPATAN I/O)
// ============================================

const SheetCache = {};

/**
 * Menghapus cache untuk sheet tertentu agar data dibaca ulang dari Spreadsheet
 * Panggil fungsi ini SETELAH melakukan appendRow, setValues, atau deleteRow
 * @param {string} sheetName - Nama sheet yang cachenya ingin dihapus
 */
function clearCache(sheetName) {
  if (SheetCache[sheetName]) {
    delete SheetCache[sheetName];
  }
}

/**
 * Mengambil data sheet satu kali saja per siklus eksekusi (request)
 * dan menyimpannya di memori RAM agar akses berikutnya nyaris instan.
 * @param {string} sheetName - Nama sheet
 * @returns {Array} Array 2D berisi data sheet
 */
function getCachedData(sheetName) {
  if (!SheetCache[sheetName]) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      SheetCache[sheetName] = [];
    } else {
      // Baca data satu kali saja dan simpan ke cache
      SheetCache[sheetName] = sheet.getDataRange().getValues();
    }
  }
  return SheetCache[sheetName];
}

// ============================================
// GENERATE RANDOM ID
// ============================================

/**
 * Generate ID unik acak (numeric 6 digit)
 * @returns {string} ID berupa 6 digit angka
 */
function generateRandomId() {
  let id;
  let isUnique = false;
  
  while (!isUnique) {
    // Generate angka random 6 digit (100000 - 999999)
    id = String(Math.floor(Math.random() * 900000) + 100000);
    // Cek apakah ID sudah dipakai
    isUnique = !isIdExists(id);
  }
  
  return id;
}

/**
 * Cek apakah ID sudah ada di sistem (Menggunakan data dari Cache)
 * @param {string} id - ID yang akan dicek
 * @returns {boolean} true jika ID sudah ada, false jika belum
 */
function isIdExists(id) {
  // Cek di sheet ADMIN_GURU dari cache
  const guruData = getCachedData(SHEETS.ADMIN_GURU);
  for (let i = 1; i < guruData.length; i++) {
    if (guruData[i][0] == id) return true;
  }
  
  // Cek di sheet SISWA dari cache
  const siswaData = getCachedData(SHEETS.SISWA);
  for (let i = 1; i < siswaData.length; i++) {
    if (siswaData[i][0] == id) return true;
  }
  
  return false;
}

// ============================================
// CARI DATA
// ============================================

/**
 * Cari data di sheet berdasarkan kolom dan nilai (Menggunakan Cache)
 * @param {string} sheetName - Nama sheet
 * @param {string} columnName - Nama kolom
 * @param {string|number} value - Nilai yang dicari
 * @returns {Object|null} Objek data atau null jika tidak ditemukan
 */
function findDataByColumn(sheetName, columnName, value) {
  const data = getCachedData(sheetName);
  
  if (data.length === 0) {
    return null;
  }
  
  const headers = data[0];
  const columnIndex = headers.indexOf(columnName);
  
  if (columnIndex === -1) {
    return null;
  }
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][columnIndex] == value) {
      return rowToObject(headers, data[i]);
    }
  }
  
  return null;
}

/**
 * Cari semua data di sheet berdasarkan kolom dan nilai (Menggunakan Cache)
 * @param {string} sheetName - Nama sheet
 * @param {string} columnName - Nama kolom
 * @param {string|number} value - Nilai yang dicari
 * @returns {Array} Array berisi objek data
 */
function findAllDataByColumn(sheetName, columnName, value) {
  const data = getCachedData(sheetName);
  
  if (data.length === 0) {
    return [];
  }
  
  const headers = data[0];
  const columnIndex = headers.indexOf(columnName);
  
  if (columnIndex === -1) {
    return [];
  }
  
  const results = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][columnIndex] == value) {
      results.push(rowToObject(headers, data[i]));
    }
  }
  
  return results;
}

/**
 * Ambil semua data dari sheet (Menggunakan Cache)
 * @param {string} sheetName - Nama sheet
 * @returns {Array} Array berisi objek data
 */
function getAllData(sheetName) {
  const data = getCachedData(sheetName);
  
  if (data.length <= 1) {
    return [];
  }
  
  const headers = data[0];
  const results = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] !== '') { // Pastikan baris tidak kosong
      results.push(rowToObject(headers, data[i]));
    }
  }
  
  return results;
}

// ============================================
// KONVERSI DATA
// ============================================

/**
 * Konversi array baris menjadi objek dengan key dari headers (Perbaikan Falsy Value)
 * @param {Array} headers - Array header kolom
 * @param {Array} row - Array data baris
 * @returns {Object} Objek dengan key-value
 */
function rowToObject(headers, row) {
  const obj = {};
  for (let i = 0; i < headers.length; i++) {
    // Mengecek apakah nilai undefined atau null. Angka 0 dan false akan tetap lolos.
    obj[headers[i]] = (row[i] !== undefined && row[i] !== null) ? row[i] : '';
  }
  return obj;
}

/**
 * Konversi objek menjadi array sesuai urutan headers (Perbaikan Falsy Value)
 * @param {Object} obj - Objek data
 * @param {Array} headers - Array header kolom
 * @returns {Array} Array data
 */
function objectToRow(obj, headers) {
  const row = [];
  for (let i = 0; i < headers.length; i++) {
    const value = obj[headers[i]];
    row.push((value !== undefined && value !== null) ? value : '');
  }
  return row;
}

// ============================================
// VALIDASI
// ============================================

/**
 * Validasi apakah string kosong
 * @param {string} value - Nilai yang divalidasi
 * @returns {boolean} true jika kosong
 */
function isEmpty(value) {
  return !value || value.toString().trim() === '';
}

/**
 * Validasi format ID (6 digit angka)
 * @param {string} id - ID yang divalidasi
 * @returns {boolean} true jika format valid
 */
function isValidId(id) {
  return /^\d{6}$/.test(String(id));
}

/**
 * Validasi status presensi
 * @param {string} status - Status yang divalidasi
 * @returns {boolean} true jika valid
 */
function isValidStatus(status) {
  return STATUS_PRESENSI.includes(status);
}

/**
 * Validasi URL Google Maps (Lebih Fleksibel dengan Regex)
 * @param {string} url - URL yang divalidasi
 * @returns {boolean} true jika valid
 */
function isValidGoogleMapsUrl(url) {
  if (!url || typeof url !== 'string') return false;
  // Regex untuk mencocokkan berbagai varian URL Maps
  const mapsRegex = /(maps\.google\.com|goo\.gl\/maps|maps\.app\.goo\.gl|google\.com\/maps)/i;
  return mapsRegex.test(url);
}

// ============================================
// RESPONSE JSON
// ============================================

/**
 * Buat response JSON sukses
 * @param {string} message - Pesan sukses
 * @param {Object} data - Data tambahan (optional)
 * @returns {Object} Objek response
 */
function successResponse(message, data = {}) {
  return {
    success: true,
    message: message,
    data: data
  };
}

/**
 * Buat response JSON gagal
 * @param {string} message - Pesan error
 * @returns {Object} Objek response
 */
function errorResponse(message) {
  return {
    success: false,
    message: message
  };
}

// ============================================
// HELPER
// ============================================

/**
 * Log informasi untuk debugging
 * @param {string} tag - Label/tag
 * @param {*} data - Data yang di-log
 */
function log(tag, data) {
  Logger.log(`[${tag}] ${JSON.stringify(data)}`);
}

/**
 * Get header names dari sheet (Menggunakan Cache)
 * @param {string} sheetName - Nama sheet
 * @returns {Array} Array header names
 */
function getSheetHeaders(sheetName) {
  const data = getCachedData(sheetName);
  if (data.length > 0) {
    return data[0];
  }
  return [];
}

/**
 * Get column index dari nama kolom
 * @param {string} sheetName - Nama sheet
 * @param {string} columnName - Nama kolom
 * @returns {number} Index kolom (1-based) atau -1 jika tidak ditemukan
 */
function getColumnIndex(sheetName, columnName) {
  const headers = getSheetHeaders(sheetName);
  const index = headers.indexOf(columnName);
  return index !== -1 ? index + 1 : -1;
}

/**
 * Format timestamp menjadi string
 * @param {Date|string} date - Date object atau string
 * @returns {string} Format: YYYY-MM-DD HH:MM:SS
 */
function formatTimestamp(date) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
