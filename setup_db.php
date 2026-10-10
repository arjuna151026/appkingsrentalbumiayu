<?php
include 'koneksi.php';

// 1. Buat Tabel Testimonials jika belum ada
$sql_table = "CREATE TABLE IF NOT EXISTS testimonials (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    rating INT DEFAULT 5,
    text TEXT,
    image TEXT,
    status ENUM('pending', 'approved') DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$conn->query($sql_table);

// 2. Data Testimonials Bawaan
$sql_testi = "INSERT IGNORE INTO testimonials (id, name, role, rating, text, image) VALUES
('testi_1', 'Andi Pratama', 'Wisatawan Jakarta', 5, '\"Mobilnya bersih dan wangi. Pelayanan admin sangat ramah dan fast response. Recommended buat yang cari rental di Bumiayu.\"', 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'),
('testi_2', 'Siti Aminah', 'Warga Lokal', 5, '\"Sewa buat acara nikahan keluarga, unit Xpander-nya mulus banget kaya baru. Harga juga bersahabat.\"', 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png')";
$conn->query($sql_testi);

// 3. Memasukkan 6 mobil bawaan ke database
$sql = "INSERT IGNORE INTO cars (car_id, name, category, price, image, rating, spec_seat, spec_trans, spec_fuel, spec_other, status) VALUES
('avanza', 'All New Avanza', 'silver', 350, 'ToyotaAvanza.jpg', '4.8 (12 Review)', '7 Seat', 'Manual', 'Bensin', '2 Bag', 'available'),
('xenia', 'All New Xenia', 'silver', 350, 'allNewXenia.jpg', '4.9 (18 Review)', '7 Seat', 'Manual', 'Bensin', '2 Bag', 'available'),
('brio', 'Honda Brio', 'silver', 300, 'HondaBrio.jpg', '4.8 (56 Review)', '5 Seat', 'Matic', 'Hemat', 'BT', 'available'),
('brv', 'Honda BR-V N7x', 'gold', 400, 'HondaBRVN7.jpg', '4.7 (80 Review)', '7 Seat', 'Manual', 'Bensin', '3 Bag', 'available'),
('xpander_ult', 'Mitsubishi Xpander Ultimate', 'gold', 400, 'MistubishiXpanderUltimate.jpg', '4.9 (42 Review)', '7 Seat', 'Matic', 'Bensin', 'Smart', 'available'),
('xpander_sport', 'Mitsubishi Xpander Sport', 'gold', 400, 'MistubishiXpanderSport.jpg', '4.8 (38 Review)', '7 Seat', 'Matic', 'Bensin', 'Audio', 'available')";

if ($conn->query($sql) === TRUE) {
    echo "<div style='font-family:sans-serif; text-align:center; margin-top:50px;'>";
    echo "<h1 style='color:#10b981;'>Selesai Bos! ✅</h1>";
    echo "<h3>Tabel & Data Default (Mobil & Testimoni) Berhasil Disinkronkan.</h3>";
    echo "<p>Cek Database <b>db_kingsrental</b> untuk melihat hasilnya.</p>";
    echo "</div>";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>