/**
 * Presensi.gs
 * Fungsi manajemen data presensi dengan optimasi cache
 */

/**
 * Simpan data presensi
 * @param {Object} params - Parameter data presensi
 *   - idSiswa (string) - ID siswa (required)
 *   - nama (string) - Nama siswa (required)
 *   - idGuru (string) - ID guru (required)
 *   - namaGuru (string) - Nama guru (required)
 *   - tempatMagang (string) - Tempat magang (required)
 *   - fotoUrl (string) - URL foto (required)
 *   - mapUrl (string) - URL Google Maps (required)
 *   - status (string) - Status presensi (required): Hadir, Sakit, Izin
 *   - pembimbingLapangan (string) - Nama pembimbing lapangan (optional)
 *   - kompetensiYangDikuasai (string) - Kompetensi yang dikuasai (optional)
 *   - keterangan (string) - Keterangan tambahan (optional)
 * @returns {Object} JSON response
 */
function savePresensi(params) {
  // Validasi input required
  if (isEmpty(params.idSiswa)) {
    return errorResponse('ID siswa tidak boleh kosong');
  }
  
  if (isEmpty(params.nama)) {
    return errorResponse('Nama siswa tidak boleh kosong');
  }
  
  if (isEmpty(params.idGuru)) {
    return errorResponse('ID guru tidak boleh kosong');
  }
  
  if (isEmpty(params.namaGuru)) {
    return errorResponse('Nama guru tidak boleh kosong');
  }
  
  if (isEmpty(params.tempatMagang)) {
    return errorResponse('Tempat magang tidak boleh kosong');
  }
  
  if (isEmpty(params.fotoUrl)) {
    return errorResponse('URL foto tidak boleh kosong');
  }
  
  if (isEmpty(params.mapUrl)) {
    return errorResponse('URL maps tidak boleh kosong');
  }
  
  if (isEmpty(params.status)) {
    return errorResponse('Status presensi tidak boleh kosong');
  }
  
  // Validasi status
  if (!isValidStatus(params.status)) {
    return errorResponse('Status presensi tidak valid. Pilih: ' + STATUS_PRESENSI.join(', '));
  }
  
  // Validasi format maps URL
  if (!isValidGoogleMapsUrl(params.mapUrl)) {
    return errorResponse('Format URL Google Maps tidak valid');
  }
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.PRESENSI);
    const headers = getSheetHeaders(SHEETS.PRESENSI);
    
    // Prepare data presensi
    const newPresensi = {
      [COLUMNS.PRESENSI.TIMESTAMP]: formatTimestamp(new Date()),
      [COLUMNS.PRESENSI.ID_SISWA]: params.idSiswa,
      [COLUMNS.PRESENSI.NAMA]: params.nama,
      [COLUMNS.PRESENSI.ID_GURU]: params.idGuru,
      [COLUMNS.PRESENSI.NAMA_GURU]: params.namaGuru,
      [COLUMNS.PRESENSI.TEMPAT_MAGANG]: params.tempatMagang,
      [COLUMNS.PRESENSI.FOTO]: params.fotoUrl,
      [COLUMNS.PRESENSI.MAP]: params.mapUrl,
      [COLUMNS.PRESENSI.STATUS]: params.status,
      [COLUMNS.PRESENSI.PEMBIMBING_LAPANGAN]: params.pembimbingLapangan || '',
      [COLUMNS.PRESENSI.KOMPETENSI_YANG_DIKUASAI]: params.kompetensiYangDikuasai || '',
      [COLUMNS.PRESENSI.KETERANGAN]: params.keterangan || ''
    };
    
    // Convert object to row
    const row = objectToRow(newPresensi, headers);
    
    // Append row
    sheet.appendRow(row);
    
    // Hapus cache PRESENSI agar data terbaru dimuat
    clearCache(SHEETS.PRESENSI);
    
    return successResponse('Presensi berhasil disimpan', {
      idSiswa: params.idSiswa,
      status: params.status,
      timestamp: newPresensi[COLUMNS.PRESENSI.TIMESTAMP]
    });
  } catch (error) {
    return errorResponse('Error: ' + error.message);
  }
}

/**
 * Ambil riwayat presensi siswa
 * @param {string} idSiswa - ID siswa
 * @param {number} limit - Jumlah data yang diambil (optional, default 50)
 * @returns {Array} Array berisi data presensi siswa
 */
function getRiwayatSiswa(idSiswa, limit = 50) {
  if (isEmpty(idSiswa)) {
    return [];
  }
  
  const allData = findAllDataByColumn(SHEETS.PRESENSI, COLUMNS.PRESENSI.ID_SISWA, idSiswa);
  
  // Sort by timestamp descending (terbaru dulu)
  allData.sort((a, b) => {
    const dateA = new Date(a[COLUMNS.PRESENSI.TIMESTAMP]);
    const dateB = new Date(b[COLUMNS.PRESENSI.TIMESTAMP]);
    return dateB - dateA;
  });
  
  // Return only limit records
  return allData.slice(0, limit);
}

/**
 * Ambil data presensi berdasarkan guru
 * @param {string} idGuru - ID guru
 * @param {number} limit - Jumlah data yang diambil (optional, default 100)
 * @returns {Array} Array berisi data presensi murid guru
 */
function getPresensiGuru(idGuru, limit = 100) {
  if (isEmpty(idGuru)) {
    return [];
  }
  
  const allData = findAllDataByColumn(SHEETS.PRESENSI, COLUMNS.PRESENSI.ID_GURU, idGuru);
  
  // Sort by timestamp descending (terbaru dulu)
  allData.sort((a, b) => {
    const dateA = new Date(a[COLUMNS.PRESENSI.TIMESTAMP]);
    const dateB = new Date(b[COLUMNS.PRESENSI.TIMESTAMP]);
    return dateB - dateA;
  });
  
  // Return only limit records
  return allData.slice(0, limit);
}

/**
 * Rekap presensi per guru per bulan
 * @param {string} idGuru - ID guru
 * @param {string} bulan - Bulan (format: YYYY-MM)
 * @returns {Object} Rekap data presensi
 */
function rekapGuru(idGuru, bulan) {
  if (isEmpty(idGuru)) {
    return errorResponse('ID guru tidak boleh kosong');
  }
  
  if (isEmpty(bulan)) {
    return errorResponse('Bulan tidak boleh kosong');
  }
  
  // Validasi format bulan (YYYY-MM)
  if (!/^\d{4}-\d{2}$/.test(bulan)) {
    return errorResponse('Format bulan harus YYYY-MM');
  }
  
  try {
    const presensiData = getPresensiGuru(idGuru, 1000);
    
    // Filter berdasarkan bulan
    const filteredData = presensiData.filter(item => {
      const timestamp = item[COLUMNS.PRESENSI.TIMESTAMP];
      return timestamp.startsWith(bulan);
    });
    
    // Hitung statistik
    const rekap = {
      bulan: bulan,
      idGuru: idGuru,
      totalPresensi: filteredData.length,
      hadir: 0,
      sakit: 0,
      izin: 0,
      detail: {}
    };
    
    // Group by siswa
    const siswaBySiswa = {};
    
    for (const data of filteredData) {
      const idSiswa = data[COLUMNS.PRESENSI.ID_SISWA];
      const namaSiswa = data[COLUMNS.PRESENSI.NAMA];
      const status = data[COLUMNS.PRESENSI.STATUS];
      
      // Count status
      if (status === 'Hadir') rekap.hadir++;
      else if (status === 'Sakit') rekap.sakit++;
      else if (status === 'Izin') rekap.izin++;
      
      // Group by siswa
      if (!siswaBySiswa[idSiswa]) {
        siswaBySiswa[idSiswa] = {
          idSiswa: idSiswa,
          namaSiswa: namaSiswa,
          hadir: 0,
          sakit: 0,
          izin: 0
        };
      }
      
      if (status === 'Hadir') siswaBySiswa[idSiswa].hadir++;
      else if (status === 'Sakit') siswaBySiswa[idSiswa].sakit++;
      else if (status === 'Izin') siswaBySiswa[idSiswa].izin++;
    }
    
    rekap.detail = Object.values(siswaBySiswa);
    
    return successResponse('Rekap presensi ditemukan', rekap);
  } catch (error) {
    return errorResponse('Error: ' + error.message);
  }
}

/**
 * Ambil presensi hari ini
 * @param {string} idGuru - ID guru (optional, untuk filter)
 * @returns {Array} Array berisi data presensi hari ini
 */
function getPresensiHariIni(idGuru = '') {
  try {
    const today = new Date();
    const dateStr = formatTimestamp(today).split(' ')[0]; // Ambil tanggal saja (YYYY-MM-DD)
    
    const allPresensi = getAllData(SHEETS.PRESENSI);
    
    // Filter presensi hari ini
    const presensiHariIni = allPresensi.filter(item => {
      const timestamp = item[COLUMNS.PRESENSI.TIMESTAMP];
      const itemDate = timestamp.split(' ')[0];
      
      if (itemDate !== dateStr) return false;
      
      if (idGuru && item[COLUMNS.PRESENSI.ID_GURU] != idGuru) {
        return false;
      }
      
      return true;
    });
    
    return presensiHariIni;
  } catch (error) {
    return [];
  }
}

/**
 * Get statistik presensi per siswa
 * @param {string} idSiswa - ID siswa
 * @returns {Object} Statistik presensi siswa
 */
function getStatistikSiswa(idSiswa) {
  if (isEmpty(idSiswa)) {
    return errorResponse('ID siswa tidak boleh kosong');
  }
  
  try {
    const riwayat = getRiwayatSiswa(idSiswa, 1000);
    
    const stats = {
      idSiswa: idSiswa,
      totalPresensi: riwayat.length,
      hadir: 0,
      sakit: 0,
      izin: 0,
      persentaseHadir: 0
    };
    
    for (const data of riwayat) {
      const status = data[COLUMNS.PRESENSI.STATUS];
      if (status === 'Hadir') stats.hadir++;
      else if (status === 'Sakit') stats.sakit++;
      else if (status === 'Izin') stats.izin++;
    }
    
    if (stats.totalPresensi > 0) {
      stats.persentaseHadir = Math.round((stats.hadir / stats.totalPresensi) * 100);
    }
    
    return successResponse('Statistik presensi ditemukan', stats);
  } catch (error) {
    return errorResponse('Error: ' + error.message);
  }
}
