/**
 * Login.gs
 * Fungsi autentikasi dan login dengan cache optimization
 */

/**
 * Login dengan ID
 * Pengecekan urutan: Admin -> Guru -> Siswa
 * @param {string} id - ID yang digunakan untuk login
 * @returns {Object} JSON response dengan status, role, dan data
 */
function loginById(id) {
  // Validasi input
  if (isEmpty(id)) {
    return errorResponse('ID tidak boleh kosong');
  }
  
  // Cek Admin (hardcode)
  if (id === ADMIN_ID) {
    return successResponse('Login berhasil', {
      role: 'admin',
      id: id,
      nama: 'Administrator'
    });
  }
  
  // Cek Guru
  const guru = findDataByColumn(SHEETS.ADMIN_GURU, COLUMNS.ADMIN_GURU.ID, id);
  if (guru) {
    return successResponse('Login berhasil', {
      role: 'guru',
      id: guru[COLUMNS.ADMIN_GURU.ID],
      nama: guru[COLUMNS.ADMIN_GURU.NAMA_GURU]
    });
  }
  
  // Cek Siswa
  const siswa = findDataByColumn(SHEETS.SISWA, COLUMNS.SISWA.ID, id);
  if (siswa) {
    return successResponse('Login berhasil', {
      role: 'siswa',
      id: siswa[COLUMNS.SISWA.ID],
      nama: siswa[COLUMNS.SISWA.NAMA],
      namaGuru: siswa[COLUMNS.SISWA.NAMA_GURU],
      idGuru: siswa[COLUMNS.SISWA.ID_GURU],
      tempatMagang: siswa[COLUMNS.SISWA.TEMPAT_MAGANG]
    });
  }
  
  // Tidak ditemukan
  return errorResponse('ID tidak ditemukan');
}

/**
 * Validasi apakah user adalah admin
 * @param {string} id - ID user
 * @returns {boolean} true jika user adalah admin
 */
function isAdmin(id) {
  return id === ADMIN_ID;
}

/**
 * Validasi apakah user adalah guru
 * @param {string} id - ID user
 * @returns {boolean} true jika user adalah guru
 */
function isGuru(id) {
  const guru = findDataByColumn(SHEETS.ADMIN_GURU, COLUMNS.ADMIN_GURU.ID, id);
  return guru !== null;
}

/**
 * Validasi apakah user adalah siswa
 * @param {string} id - ID user
 * @returns {boolean} true jika user adalah siswa
 */
function isSiswa(id) {
  const siswa = findDataByColumn(SHEETS.SISWA, COLUMNS.SISWA.ID, id);
  return siswa !== null;
}

/**
 * Get role dari ID
 * @param {string} id - ID user
 * @returns {string|null} 'admin', 'guru', 'siswa', atau null
 */
function getRoleById(id) {
  if (isAdmin(id)) return 'admin';
  if (isGuru(id)) return 'guru';
  if (isSiswa(id)) return 'siswa';
  return null;
}
