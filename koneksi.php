<?php
// Pengaturan Koneksi Database MySQL
$host = "localhost";
$user = "root";
$pass = "";
$db   = "kings_rental_db";

// Menonaktifkan exception mysqli agar dapat menangani error secara manual
mysqli_report(MYSQLI_REPORT_OFF);

// 1. Coba koneksi langsung ke database
$conn = @new mysqli($host, $user, $pass, $db);

// 2. Jika database belum ada atau gagal konek, hubungkan ke server MySQL dulu lalu buat database
if ($conn->connect_error) {
    $conn_server = @new mysqli($host, $user, $pass);
    if ($conn_server && !$conn_server->connect_error) {
        $conn_server->query("CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $conn_server->close();
        
        // Coba konek ulang ke database yang baru dibuat
        $conn = @new mysqli($host, $user, $pass, $db);
    }
}

// 3. Jika tetap gagal koneksi ke server MySQL (misal XAMPP MySQL belum start)
if ($conn->connect_error) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Gagal terhubung ke MySQL! Pastikan MySQL di XAMPP Control Panel sudah AKTIF (Start). Error: " . $conn->connect_error
    ]);
    exit;
}

// Set karakter encoding ke utf8mb4 untuk mendukung teks lengkap & emoji
$conn->set_charset("utf8mb4");

// Variabel alias $koneksi untuk kompatibilitas kode
$koneksi = $conn;
?>