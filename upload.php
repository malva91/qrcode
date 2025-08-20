<?php
/**
 * Viking QR Forge - Upload Handler
 * Gestisce l'upload sicuro dei loghi
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Configurazione
define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('MAX_FILE_SIZE', 2 * 1024 * 1024); // 2MB
define('ALLOWED_TYPES', [
    'image/png' => 'png',
    'image/jpeg' => 'jpg',
    'image/jpg' => 'jpg',
    'image/svg+xml' => 'svg'
]);

/**
 * Risposta JSON standardizzata
 */
function jsonResponse($success, $data = null, $error = null) {
    $response = ['ok' => $success];
    if ($data) $response = array_merge($response, $data);
    if ($error) $response['error'] = $error;
    
    echo json_encode($response);
    exit;
}

/**
 * Validazione sicurezza file
 */
function validateFile($file) {
    // Verifica errori upload
    if ($file['error'] !== UPLOAD_ERR_OK) {
        switch ($file['error']) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                throw new Exception('File troppo grande');
            case UPLOAD_ERR_PARTIAL:
                throw new Exception('Upload incompleto');
            case UPLOAD_ERR_NO_FILE:
                throw new Exception('Nessun file selezionato');
            default:
                throw new Exception('Errore upload sconosciuto');
        }
    }
    
    // Verifica dimensione
    if ($file['size'] > MAX_FILE_SIZE) {
        throw new Exception('File troppo grande. Massimo 2MB');
    }
    
    // Verifica tipo MIME
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!array_key_exists($mimeType, ALLOWED_TYPES)) {
        throw new Exception('Formato file non supportato. Usa PNG, JPG o SVG');
    }
    
    // Verifica estensione
    $pathInfo = pathinfo($file['name']);
    $extension = strtolower($pathInfo['extension'] ?? '');
    $expectedExt = ALLOWED_TYPES[$mimeType];
    
    if ($extension !== $expectedExt && !($extension === 'jpeg' && $expectedExt === 'jpg')) {
        throw new Exception('Estensione file non corrisponde al contenuto');
    }
    
    // Validazioni aggiuntive per SVG
    if ($mimeType === 'image/svg+xml') {
        $content = file_get_contents($file['tmp_name']);
        
        // Blocca script
        if (strpos($content, '<script') !== false || 
            strpos($content, 'javascript:') !== false ||
            strpos($content, 'onload=') !== false) {
            throw new Exception('SVG contiene contenuti non sicuri');
        }
    }
    
    return $expectedExt;
}

/**
 * Genera nome file sicuro
 */
function generateSecureFilename($extension) {
    $timestamp = time();
    $random = bin2hex(random_bytes(8));
    return "{$timestamp}_{$random}.{$extension}";
}

/**
 * Crea directory upload se non exists
 */
function ensureUploadDir() {
    if (!is_dir(UPLOAD_DIR)) {
        if (!mkdir(UPLOAD_DIR, 0755, true)) {
            throw new Exception('Impossibile creare directory upload');
        }
    }
    
    // Crea .htaccess per sicurezza
    $htaccess = UPLOAD_DIR . '.htaccess';
    if (!file_exists($htaccess)) {
        $content = "# Viking QR Forge - Sicurezza Upload\n";
        $content .= "Options -Indexes -ExecCGI\n";
        $content .= "AddHandler cgi-script .php .pl .py .jsp .asp .sh .cgi\n";
        $content .= "<Files *.php>\n";
        $content .= "    Require all denied\n";
        $content .= "</Files>\n";
        $content .= "<FilesMatch \"\.(png|jpg|jpeg|svg)$\">\n";
        $content .= "    Require all granted\n";
        $content .= "</FilesMatch>\n";
        
        file_put_contents($htaccess, $content);
    }
}

// ===== MAIN HANDLER =====
try {
    // Solo POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Metodo non supportato');
    }
    
    // Verifica file
    if (!isset($_FILES['file'])) {
        throw new Exception('Nessun file ricevuto');
    }
    
    $file = $_FILES['file'];
    
    // Validazione
    $extension = validateFile($file);
    
    // Setup directory
    ensureUploadDir();
    
    // Nome file sicuro
    $filename = generateSecureFilename($extension);
    $filepath = UPLOAD_DIR . $filename;
    
    // Sposta file
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        throw new Exception('Errore salvataggio file');
    }
    
    // Imposta permessi
    chmod($filepath, 0644);
    
    // URL relativo
    $url = '/uploads/' . $filename;
    
    // Log successo
    error_log("Viking QR: Logo caricato - {$filename} ({$file['size']} bytes)");
    
    // Risposta successo
    jsonResponse(true, [
        'url' => $url,
        'filename' => $filename,
        'size' => $file['size'],
        'type' => $file['type']
    ]);
    
} catch (Exception $e) {
    // Log errore
    error_log("Viking QR Upload Error: " . $e->getMessage());
    
    // Risposta errore
    jsonResponse(false, null, $e->getMessage());
}
?>