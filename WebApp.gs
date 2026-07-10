/**
 * WebApp.gs
 * Handler untuk semua request dari aplikasi Next.js
 * Single endpoint: doPost()
 */

/**
 * Main Web App endpoint
 * Semua request harus menggunakan POST method
 * Request harus berisi parameter 'action'
 * 
 * @param {Object} e - Event parameter dari Apps Script
 * @returns {TextOutput} JSON response
 */
function doPost(e) {
  try {
    // Parse request body
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const params = payload.params || {};
    
    // Debug log
    log('WebApp Request', { action: action, params: params });
    
    // Handle request berdasarkan action
    let response;
    
    // ============================================
    // AUTH
    // ============================================
    if (action === 'login') {
      response = loginById(params.id);
    }
    
    // ============================================
    // GURU OPERATIONS
    // ============================================
    else if (action === 'getGuru') {
      response = successResponse('Data guru ditemukan', getGuru());
    }
    
    else if (action === 'addGuru') {
      response = addGuru(params);
    }
    
    else if (action === 'editGuru') {
      response = editGuru(params);
    }
    
    else if (action === 'deleteGuru') {
      response = deleteGuru(params);
    }
    
    // ============================================
    // SISWA OPERATIONS
    // ============================================
    else if (action === 'getSiswa') {
      response = successResponse('Data siswa ditemukan', getSiswa());
    }
    
    else if (action === 'getSiswaByGuru') {
      response = successResponse('Data siswa ditemukan', getSiswaByGuru(params.idGuru));
    }
    
    else if (action === 'addSiswa') {
      response = addSiswa(params);
    }
    
    else if (action === 'editSiswa') {
      response = editSiswa(params);
    }
    
    else if (action === 'deleteSiswa') {
      response = deleteSiswa(params);
    }
    
    // ============================================
    // PRESENSI OPERATIONS
    // ============================================
    else if (action === 'savePresensi') {
      response = savePresensi(params);
    }
    
    else if (action === 'getRiwayatSiswa') {
      const riwayat = getRiwayatSiswa(params.idSiswa, params.limit);
      response = successResponse('Riwayat presensi ditemukan', riwayat);
    }
    
    else if (action === 'getPresensiGuru') {
      const presensi = getPresensiGuru(params.idGuru, params.limit);
      response = successResponse('Presensi guru ditemukan', presensi);
    }
    
    else if (action === 'getPresensiHariIni') {
      const presensi = getPresensiHariIni(params.idGuru);
      response = successResponse('Presensi hari ini ditemukan', presensi);
    }
    
    else if (action === 'rekapGuru') {
      response = rekapGuru(params.idGuru, params.bulan);
    }
    
    else if (action === 'getStatistikSiswa') {
      response = getStatistikSiswa(params.idSiswa);
    }
    
    // ============================================
    // UPLOAD PHOTO
    // ============================================
    else if (action === 'uploadPhoto') {
      response = uploadPhoto(params.base64Data, params.fileName, params.mimeType);
    }
    
    else if (action === 'uploadPhotoFromUrl') {
      response = uploadPhotoFromUrl(params.imageUrl, params.fileName);
    }
    
    // ============================================
    // UNKNOWN ACTION
    // ============================================
    else {
      response = errorResponse('Action tidak dikenali: ' + action);
    }
    
    // Return response
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    const errorResponse = {
      success: false,
      message: 'Server error: ' + error.message
    };
    
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GET request handler (optional, untuk testing)
 * @param {Object} e - Event parameter
 * @returns {TextOutput} JSON response
 */
function doGet(e) {
  const response = {
    success: true,
    message: 'Sistem Presensi Magang Online - Backend API',
    status: 'running',
    version: '1.0.0',
    endpoint: 'POST',
    info: 'Kirim request POST dengan parameter action dan params dalam JSON format',
    available_actions: [
      'login',
      'getGuru', 'addGuru', 'editGuru', 'deleteGuru',
      'getSiswa', 'getSiswaByGuru', 'addSiswa', 'editSiswa', 'deleteSiswa',
      'savePresensi', 'getRiwayatSiswa', 'getPresensiGuru', 'getPresensiHariIni', 'rekapGuru', 'getStatistikSiswa',
      'uploadPhoto', 'uploadPhotoFromUrl'
    ]
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Fungsi untuk deploy Web App
 * Jalankan ini sekali untuk mendapatkan deployment URL
 */
function deployWebApp() {
  const scriptId = ScriptApp.getScriptId();
  Logger.log('Script ID: ' + scriptId);
  Logger.log('Deploy ke: https://script.google.com/macros/d/' + scriptId + '/usercache_DEPLOYMENT_ID/execute');
  Logger.log('Catatan: Perlu deploy manual dari Apps Script Editor');
}

// ============================================
// HELPER: TEST REQUESTS
// ============================================

/**
 * Test fungsi login
 */
function testLogin() {
  const result = loginById('TJKTADMIN2026');
  Logger.log('Login test: ' + JSON.stringify(result));
}

/**
 * Test generate ID
 */
function testGenerateId() {
  const id1 = generateRandomId();
  const id2 = generateRandomId();
  Logger.log('Generated ID 1: ' + id1);
  Logger.log('Generated ID 2: ' + id2);
}

/**
 * Test get all guru
 */
function testGetGuru() {
  const guru = getGuru();
  Logger.log('All guru: ' + JSON.stringify(guru));
}

/**
 * Test get all siswa
 */
function testGetSiswa() {
  const siswa = getSiswa();
  Logger.log('All siswa: ' + JSON.stringify(siswa));
}

/**
 * Test doPost dengan simulasi
 */
function testDoPost() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        action: 'login',
        params: {
          id: 'TJKTADMIN2026'
        }
      })
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log('doPost test result: ' + result.getContent());
}
