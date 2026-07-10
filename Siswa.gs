/**
 * Siswa.gs
 * Fungsi manajemen data siswa dengan optimasi cache
 */

/**
 * Ambil semua data siswa
 * @returns {Array} Array berisi data siswa
 */
function getSiswa() {
  const data = getAllData(SHEETS.SISWA);
  return data;
}

/**
 * Ambil data siswa berdasarkan ID
 * @param {string} id - ID siswa
 * @returns {Object|null} Data siswa atau null
 */
function getSiswaById(id) {
  return findDataByColumn(SHEETS.SISWA, COLUMNS.SISWA.ID, id);
}

/**
 * Ambil semua siswa berdasarkan ID guru
 * @param {string} idGuru - ID guru
 * @returns {Array} Array berisi data siswa
 */
function getSiswaByGuru(idGuru) {
  if (isEmpty(idGuru)) {
    return [];
  }
  
  const data = findAllDataByColumn(SHEETS.SISWA, COLUMNS.SISWA.ID_GURU, idGuru);
  return data;
}

/**
 * Tambah siswa baru
 * Auto-generate ID untuk siswa baru
 * @param {Object} params - Parameter data siswa
 *   - nama (string) - Nama siswa (required)
 *   - idGuru (string) - ID guru (required)
 *   - namaGuru (string) - Nama guru (required)
 *   - tempatMagang (string) - Tempat magang (required)
 * @returns {Object} JSON response
 */
function addSiswa(params) {
  // Validasi input
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
  
  // Validasi ID guru
  const guru = getGuruById(params.idGuru);
  if (!guru) {
    return errorResponse('ID guru tidak ditemukan');
  }
  
  // Generate ID unik
  const id = generateRandomId();
  
  // Prepare data
  const newSiswa = {
    [COLUMNS.SISWA.ID]: id,
    [COLUMNS.SISWA.NAMA]: params.nama,
    [COLUMNS.SISWA.ID_GURU]: params.idGuru,
    [COLUMNS.SISWA.NAMA_GURU]: params.namaGuru,
    [COLUMNS.SISWA.TEMPAT_MAGANG]: params.tempatMagang
  };
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.SISWA);
    const headers = getSheetHeaders(SHEETS.SISWA);
    
    // Convert object to row
    const row = objectToRow(newSiswa, headers);
    
    // Append row
    sheet.appendRow(row);
    
    // Hapus cache SISWA agar data terbaru dimuat saat request berikutnya
    clearCache(SHEETS.SISWA);
    
    return successResponse('Siswa berhasil ditambahkan', {
      id: id,
      nama: params.nama,
      idGuru: params.idGuru,
      namaGuru: params.namaGuru,
      tempatMagang: params.tempatMagang
    });
  } catch (error) {
    return errorResponse('Error: ' + error.message);
  }
}

/**
 * Edit data siswa
 * @param {Object} params - Parameter data siswa
 *   - id (string) - ID siswa (required)
 *   - nama (string) - Nama siswa (required)
 *   - namaGuru (string) - Nama guru (required)
 *   - tempatMagang (string) - Tempat magang (required)
 * @returns {Object} JSON response
 */
function editSiswa(params) {
  // Validasi input
  if (isEmpty(params.id)) {
    return errorResponse('ID siswa tidak boleh kosong');
  }
  
  if (isEmpty(params.nama)) {
    return errorResponse('Nama siswa tidak boleh kosong');
  }
  
  if (isEmpty(params.namaGuru)) {
    return errorResponse('Nama guru tidak boleh kosong');
  }
  
  if (isEmpty(params.tempatMagang)) {
    return errorResponse('Tempat magang tidak boleh kosong');
  }
  
  // Cari siswa
  const siswa = getSiswaById(params.id);
  if (!siswa) {
    return errorResponse('Siswa tidak ditemukan');
  }
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.SISWA);
    const data = getCachedData(SHEETS.SISWA);
    const headers = data[0];
    const idColumnIndex = headers.indexOf(COLUMNS.SISWA.ID);
    
    // Cari row dengan ID yang cocok
    for (let i = 1; i < data.length; i++) {
      if (data[i][idColumnIndex] == params.id) {
        const namaColumnIndex = headers.indexOf(COLUMNS.SISWA.NAMA) + 1;
        const namaGuruColumnIndex = headers.indexOf(COLUMNS.SISWA.NAMA_GURU) + 1;
        const tempatMagangColumnIndex = headers.indexOf(COLUMNS.SISWA.TEMPAT_MAGANG) + 1;
        
        sheet.getRange(i + 1, namaColumnIndex).setValue(params.nama);
        sheet.getRange(i + 1, namaGuruColumnIndex).setValue(params.namaGuru);
        sheet.getRange(i + 1, tempatMagangColumnIndex).setValue(params.tempatMagang);
        
        // Hapus cache
        clearCache(SHEETS.SISWA);
        
        return successResponse('Siswa berhasil diubah', {
          id: params.id,
          nama: params.nama,
          namaGuru: params.namaGuru,
          tempatMagang: params.tempatMagang
        });
      }
    }
    
    return errorResponse('Siswa tidak ditemukan');
  } catch (error) {
    return errorResponse('Error: ' + error.message);
  }
}

/**
 * Hapus siswa berdasarkan ID
 * @param {Object} params - Parameter
 *   - id (string) - ID siswa (required)
 * @returns {Object} JSON response
 */
function deleteSiswa(params) {
  // Validasi input
  if (isEmpty(params.id)) {
    return errorResponse('ID siswa tidak boleh kosong');
  }
  
  // Cari siswa
  const siswa = getSiswaById(params.id);
  if (!siswa) {
    return errorResponse('Siswa tidak ditemukan');
  }
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.SISWA);
    const data = getCachedData(SHEETS.SISWA);
    const headers = data[0];
    const idColumnIndex = headers.indexOf(COLUMNS.SISWA.ID);
    
    // Cari row dengan ID yang cocok
    for (let i = 1; i < data.length; i++) {
      if (data[i][idColumnIndex] == params.id) {
        sheet.deleteRow(i + 1);
        
        // Hapus cache
        clearCache(SHEETS.SISWA);
        
        return successResponse('Siswa berhasil dihapus', {
          id: params.id
        });
      }
    }
    
    return errorResponse('Siswa tidak ditemukan');
  } catch (error) {
    return errorResponse('Error: ' + error.message);
  }
}
