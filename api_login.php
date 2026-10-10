<?php
session_start(); // Wajib untuk memulai sesi keamanan
header('Content-Type: application/json');
require_once 'koneksi.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    if (empty($email) || empty($password)) {
        echo json_encode(["status" => "error", "message" => "Email dan password wajib diisi!"]);
        exit;
    }

    // Cari user berdasarkan email (Pakai Prepared Statement)
    $stmt = $koneksi->prepare("SELECT id, nama_lengkap, password, role FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // Cocokkan password biasa dengan password yang diacak (hash) di database
        if (password_verify($password, $user['password'])) {
            
            // SIMPAN DATA KE SESSION (Agar login tetap terjaga)
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['nama_lengkap'];
            $_SESSION['user_role'] = $user['role'];

            echo json_encode([
                "status" => "success", 
                "message" => "Login berhasil!",
                "role" => $user['role'],
                "name" => $user['nama_lengkap']
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Password salah!"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Email tidak terdaftar!"]);
    }

    $stmt->close();
    $koneksi->close();
} else {
    echo json_encode(["status" => "error", "message" => "Metode tidak diizinkan."]);
}
?>