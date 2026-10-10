<?php
header('Content-Type: application/json');
require_once 'koneksi.php';

// Cek apakah data dikirim via POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $nama = trim($_POST['nama']);
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    // Validasi kosong
    if (empty($nama) || empty($email) || empty($password)) {
        echo json_encode(["status" => "error", "message" => "Semua kolom wajib diisi!"]);
        exit;
    }

    // 1. Cek apakah email sudah terdaftar (Pencegahan duplikat)
    $stmt_check = $koneksi->prepare("SELECT id FROM users WHERE email = ?");
    $stmt_check->bind_param("s", $email);
    $stmt_check->execute();
    $stmt_check->store_result();

    if ($stmt_check->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "Email ini sudah terdaftar!"]);
        $stmt_check->close();
        exit;
    }
    $stmt_check->close();

    // 2. ENKRIPSI PASSWORD SANGAT AMAN (Bcrypt Hashing)
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // 3. Masukkan ke database dengan Prepared Statement (Anti SQL Injection)
    $stmt = $koneksi->prepare("INSERT INTO users (nama_lengkap, email, password, role) VALUES (?, ?, ?, 'pelanggan')");
    $stmt->bind_param("sss", $nama, $email, $hashed_password);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Pendaftaran berhasil!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Terjadi kesalahan sistem."]);
    }
    
    $stmt->close();
    $koneksi->close();
} else {
    echo json_encode(["status" => "error", "message" => "Metode tidak diizinkan."]);
}
?>