/**
 * Drive.gs
 * Fungsi untuk upload dan manajemen file di Google Drive
 */

/**
 * Upload foto ke Google Drive
 * @param {string} base64Data - Data foto dalam format base64
 * @param {string} fileName - Nama file (optional, akan generate otomatis jika kosong)
 * @param {string} mimeType - MIME type file (default: image/jpeg)
 * @returns {Object} JSON response dengan URL file
 */
function uploadPhoto(base64Data, fileName = '', mimeType = 'image/jpeg') {
  // Validasi input
  if (isEmpty(base64Data)) {
    return errorResponse('Data foto tidak boleh kosong');
  }
  
  // Validasi DRIVE_FOLDER_ID
  if (isEmpty(DRIVE_FOLDER_ID) || DRIVE_FOLDER_ID === 'YOUR_GOOGLE_DRIVE_FOLDER_ID') {
    return errorResponse('DRIVE_FOLDER_ID belum dikonfigurasi di Config.gs');
  }
  
  try {
    // Dekode base64 menjadi blob
    const imageBlob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      mimeType,
      fileName || `photo_${Date.now()}.jpg`
    );
    
    // Cari folder
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    
    // Upload file
    const file = folder.createFile(imageBlob);
    
    // Buat link shareable
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const url = file.getUrl();
    
    return successResponse('Foto berhasil diupload', {
      fileId: file.getId(),
      fileName: file.getName(),
      url: url
    });
  } catch (error) {
    return errorResponse('Error upload: ' + error.message);
  }
}

/**
 * Upload foto dari URL eksternal
 * @param {string} imageUrl - URL foto eksternal
 * @param {string} fileName - Nama file (optional)
 * @returns {Object} JSON response dengan URL file
 */
function uploadPhotoFromUrl(imageUrl, fileName = '') {
  // Validasi input
  if (isEmpty(imageUrl)) {
    return errorResponse('URL foto tidak boleh kosong');
  }
  
  // Validasi DRIVE_FOLDER_ID
  if (isEmpty(DRIVE_FOLDER_ID) || DRIVE_FOLDER_ID === 'YOUR_GOOGLE_DRIVE_FOLDER_ID') {
    return errorResponse('DRIVE_FOLDER_ID belum dikonfigurasi di Config.gs');
  }
  
  try {
    // Download image dari URL
    const response = UrlFetchApp.fetch(imageUrl);
    const imageBlob = response.getBlob();
    
    // Cari folder
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    
    // Upload file
    const file = folder.createFile(imageBlob);
    if (fileName) {
      file.setName(fileName);
    }
    
    // Buat link shareable
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const url = file.getUrl();
    
    return successResponse('Foto berhasil diupload', {
      fileId: file.getId(),
      fileName: file.getName(),
      url: url
    });
  } catch (error) {
    return errorResponse('Error upload: ' + error.message);
  }
}

/**
 * Hapus file dari Google Drive
 * @param {string} fileId - ID file di Google Drive
 * @returns {Object} JSON response
 */
function deletePhoto(fileId) {
  // Validasi input
  if (isEmpty(fileId)) {
    return errorResponse('File ID tidak boleh kosong');
  }
  
  try {
    const file = DriveApp.getFileById(fileId);
    file.setTrashed(true);
    
    return successResponse('Foto berhasil dihapus', {
      fileId: fileId
    });
  } catch (error) {
    return errorResponse('Error delete: ' + error.message);
  }
}

/**
 * Get file info dari Google Drive
 * @param {string} fileId - ID file di Google Drive
 * @returns {Object} JSON response dengan info file
 */
function getPhotoInfo(fileId) {
  // Validasi input
  if (isEmpty(fileId)) {
    return errorResponse('File ID tidak boleh kosong');
  }
  
  try {
    const file = DriveApp.getFileById(fileId);
    
    return successResponse('Info file ditemukan', {
      fileId: file.getId(),
      fileName: file.getName(),
      size: file.getSize(),
      mimeType: file.getMimeType(),
      url: file.getUrl(),
      createdDate: file.getDateCreated().toString()
    });
  } catch (error) {
    return errorResponse('Error: ' + error.message);
  }
}

/**
 * Generate shareable link dari URL Google Drive
 * Format: https://drive.google.com/uc?export=view&id={fileId}
 * @param {string} fileId - ID file di Google Drive
 * @returns {string} Shareable link
 */
function getShareablePhotoLink(fileId) {
  if (isEmpty(fileId)) {
    return '';
  }
  
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}
