<?php
header('Content-Type: application/json; charset=utf-8');

// Fungsi untuk membaca nilai variabel dari file .env
function getEnvVariable($key, $default = '') {
    $envPath = __DIR__ . '/.env';
    if (file_exists($envPath)) {
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($envKey, $envVal) = explode('=', $line, 2);
                if (trim($envKey) === $key) {
                    return trim(trim($envVal), "'\"");
                }
            }
        }
    }
    return getenv($key) ?: $default;
}

$geminiApiKey = getEnvVariable('GEMINI_API_KEY');

if (empty($geminiApiKey)) {
    http_response_code(500);
    echo json_encode([
        'error' => [
            'message' => 'GEMINI_API_KEY tidak ditemukan di file .env. Silakan periksa konfigurasi .env Anda.'
        ]
    ]);
    exit;
}

// Endpoint pembantu jika dibutuhkan untuk mengambil key
if (isset($_GET['action']) && $_GET['action'] === 'get_key') {
    echo json_encode(['apiKey' => $geminiApiKey]);
    exit;
}

// Ambil data JSON dari body request
$rawInput = file_get_contents('php://input');
if (empty($rawInput)) {
    http_response_code(400);
    echo json_encode([
        'error' => [
            'message' => 'Payload permintaan kosong.'
        ]
    ]);
    exit;
}

$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . urlencode($geminiApiKey);

// Kirim request ke Google Gemini API menggunakan cURL jika ada
if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $rawInput);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($rawInput)
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        http_response_code(500);
        echo json_encode([
            'error' => [
                'message' => 'Gagal koneksi via cURL: ' . $curlError
            ]
        ]);
        exit;
    }

    http_response_code($httpCode ?: 200);
    echo $response;
    exit;
}

// Fallback jika ekstensi cURL tidak aktif
$options = [
    'http' => [
        'method'  => 'POST',
        'header'  => "Content-Type: application/json\r\n" .
                     "Content-Length: " . strlen($rawInput) . "\r\n",
        'content' => $rawInput,
        'ignore_errors' => true,
        'timeout' => 30
    ],
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false
    ]
];

$context = stream_context_create($options);
$response = @file_get_contents($url, false, $context);

if ($response === false) {
    http_response_code(500);
    echo json_encode([
        'error' => [
            'message' => 'Gagal menghubungi server Gemini Google.'
        ]
    ]);
    exit;
}

echo $response;
