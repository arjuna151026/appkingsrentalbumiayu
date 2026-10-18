<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "kings_rental_db"; // Pastikan nama database-nya pas!

// Menggunakan object-oriented (sama seperti sebelumnya) agar tidak error di file lain yang menggunakan $conn->query()
$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

// Menyiapkan variabel $koneksi juga seperti yang Anda minta (berjaga-jaga jika ada file lain yang pakai $koneksi)
$koneksi = $conn;
?>