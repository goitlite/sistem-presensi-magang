/**
 * Guru.gs
 * Fungsi manajemen data guru dengan optimasi cache
 */

/**
 * Ambil semua data guru
 * @returns {Array} Array berisi data guru
 */
function getGuru() {
  const data = getAllData(SHEETS.ADMIN_GURU);
  return data;
}

/**
 * Ambil data guru berdasarkan ID
 * @param {string} id - ID guru
 * @returns {Object|null} Data guru atau null
 */
function getGuruById(id) {
  return findDataByColumn(SHEETS.ADMIN_GURU, COLUMNS.ADMIN_GURU.ID, id);
}

/**
 * Tambah guru baru
 * Auto-generate ID untuk guru baru
 * @param {Object} params - Parameter data guru
 *   - namaGuru (string) - Nama guru (required)
 * @returns {Object} JSON response
 */
function addGuru(params) {
  // Validasi input
  if (isEmpty(params.namaGuru)) {
    return errorResponse('Nama guru tidak boleh kosong');
  }
  
  // Generate ID unik
  const id = generateRandomId();
  
  // Prepare data
  const newGuru = {
    [COLUMNS.ADMIN_GURU.ID]: id,
    [COLUMNS.ADMIN_GURU.NAMA_GURU]: params.namaGuru
  };
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.ADMIN_GURU);
    const headers = getSheetHeaders(SHEETS.ADMIN_GURU);
    
    // Convert object to row
    const row = objectToRow(newGuru, headers);
    
    // Append row
    sheet.appendRow(row);
    
    // Hapus cache ADMIN_GURU agar data terbaru dimuat saat request berikutnya
    clearCache(SHEETS.ADMIN_GURU);
    
    return successResponse('Guru berhasil ditambahkan', {
      id: id,
      namaGuru: params.namaGuru
    });
  } catch (error) {
    return errorResponse('Error: ' + error.message);
  }
}

/**
 * Edit data guru
 * @param {Object} params - Parameter data guru
 *   - id (string) - ID guru (required)
 *   - namaGuru (string) - Nama guru baru (required)
 * @returns {Object} JSON response
 */
function editGuru(params) {
  // Validasi input
  if (isEmpty(params.id)) {
    return errorResponse('ID guru tidak boleh kosong');
  }
  
  if (isEmpty(params.namaGuru)) {
    return errorResponse('Nama guru tidak boleh kosong');
  }
  
  // Cari guru
  const guru = getGuruById(params.id);
  if (!guru) {
    return errorResponse('Guru tidak ditemukan');
  }
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.ADMIN_GURU);
    const data = getCachedData(SHEETS.ADMIN_GURU);
    const headers = data[0];
    const idColumnIndex = headers.indexOf(COLUMNS.ADMIN_GURU.ID);
    
    // Cari row dengan ID yang cocok
    for (let i = 1; i < data.length; i++) {
      if (data[i][idColumnIndex] == params.id) {
        const namaColumnIndex = headers.indexOf(COLUMNS.ADMIN_GURU.NAMA_GURU) + 1;
        sheet.getRange(i + 1, namaColumnIndex).setValue(params.namaGuru);
        
        // Hapus cache
        clearCache(SHEETS.ADMIN_GURU);
        
        return successResponse('Guru berhasil diubah', {
          id: params.id,
          namaGuru: params.namaGuru
        });
      }
    }
    
    return errorResponse('Guru tidak ditemukan');
  } catch (error) {
    return errorResponse('Error: ' + error.message);
  }
}

/**
 * Hapus guru berdasarkan ID
 * @param {Object} params - Parameter
 *   - id (string) - ID guru (required)
 * @returns {Object} JSON response
 */
function deleteGuru(params) {
  // Validasi input
  if (isEmpty(params.id)) {
    return errorResponse('ID guru tidak boleh kosong');
  }
  
  // Cari guru
  const guru = getGuruById(params.id);
  if (!guru) {
    return errorResponse('Guru tidak ditemukan');
  }
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.ADMIN_GURU);
    const data = getCachedData(SHEETS.ADMIN_GURU);
    const headers = data[0];
    const idColumnIndex = headers.indexOf(COLUMNS.ADMIN_GURU.ID);
    
    // Cari row dengan ID yang cocok
    for (let i = 1; i < data.length; i++) {
      if (data[i][idColumnIndex] == params.id) {
        sheet.deleteRow(i + 1);
        
        // Hapus cache
        clearCache(SHEETS.ADMIN_GURU);
        
        return successResponse('Guru berhasil dihapus', {
          id: params.id
        });
      }
    }
    
    return errorResponse('Guru tidak ditemukan');
  } catch (error) {
    return errorResponse('Error: ' + error.message);
  }
}
