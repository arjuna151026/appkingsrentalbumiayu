<?php
/**
 * Setup & Repair Database Kings Rental Bumiayu
 * File ini otomatis membuat database, tabel cars, testimonials, users,
 * serta menyisipkan data bawaan & akun administrator.
 */

$host = "localhost";
$user = "root";
$pass = "";
$db   = "kings_rental_db";

mysqli_report(MYSQLI_REPORT_OFF);

// 1. KONEKSI KE SERVER MYSQL
$conn = @new mysqli($host, $user, $pass);

$results = [];

if ($conn->connect_error) {
    $results[] = [
        'status' => 'error',
        'title'  => 'Koneksi ke MySQL Gagal',
        'desc'   => 'Pastikan service Apache dan MySQL di XAMPP Control Panel sudah dalam status START (Hijau). Pesan error: ' . $conn->connect_error
    ];
} else {
    $results[] = [
        'status' => 'success',
        'title'  => 'Koneksi MySQL Berhasil',
        'desc'   => "Terhubung ke server MySQL ($host) sebagai user '$user'."
    ];

    $is_reset = isset($_GET['reset']) && $_GET['reset'] == '1';

    // 2. JIKA RESET DIMINTA, HAPUS DATABASE LAMA TERLEBIH DAHULU
    if ($is_reset) {
        $conn->query("DROP DATABASE IF EXISTS `$db`");
        $results[] = [
            'status' => 'success',
            'title'  => 'Reset Database Lama',
            'desc'   => "Database lama berhasil dihapus untuk persiapan instalasi bersih dari awal."
        ];
    }

    // 3. BUAT DATABASE DARI AWAL
    $sql_db = "CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
    if ($conn->query($sql_db)) {
        $results[] = [
            'status' => 'success',
            'title'  => 'Database ' . $db,
            'desc'   => "Database <b>$db</b> berhasil dibuat baru dan siap digunakan."
        ];
        $conn->select_db($db);
        $conn->set_charset("utf8mb4");

        // 3. TABEL CARS
        $sql_cars = "CREATE TABLE IF NOT EXISTS cars (
            car_id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            category VARCHAR(20) DEFAULT 'silver',
            price INT DEFAULT 0,
            image LONGTEXT,
            rating VARCHAR(50) DEFAULT '5.0 (New)',
            spec_seat VARCHAR(50),
            spec_trans VARCHAR(50),
            spec_fuel VARCHAR(50),
            spec_other VARCHAR(100),
            status ENUM('available', 'busy') DEFAULT 'available',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
        
        if ($conn->query($sql_cars)) {
            // Pastikan kolom image bertipe LONGTEXT (agar upload foto base64 muat)
            $conn->query("ALTER TABLE cars MODIFY COLUMN image LONGTEXT");
            $results[] = [
                'status' => 'success',
                'title'  => 'Tabel cars',
                'desc'   => 'Tabel <b>cars</b> siap (tipe foto: LONGTEXT untuk dukung foto kualitas tinggi).'
            ];
        } else {
            $results[] = [
                'status' => 'error',
                'title'  => 'Gagal Buat Tabel cars',
                'desc'   => $conn->error
            ];
        }

        // 4. TABEL TESTIMONIALS
        $sql_testi = "CREATE TABLE IF NOT EXISTS testimonials (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            role VARCHAR(100),
            rating INT DEFAULT 5,
            text TEXT,
            image LONGTEXT,
            status ENUM('pending', 'approved') DEFAULT 'approved',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

        if ($conn->query($sql_testi)) {
            $conn->query("ALTER TABLE testimonials MODIFY COLUMN image LONGTEXT");
            $results[] = [
                'status' => 'success',
                'title'  => 'Tabel testimonials',
                'desc'   => 'Tabel <b>testimonials</b> siap digunakan.'
            ];
        } else {
            $results[] = [
                'status' => 'error',
                'title'  => 'Gagal Buat Tabel testimonials',
                'desc'   => $conn->error
            ];
        }

        // 5. TABEL USERS (LOGIN & REGISTER)
        $sql_users = "CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nama_lengkap VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'pelanggan') DEFAULT 'pelanggan',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

        if ($conn->query($sql_users)) {
            $results[] = [
                'status' => 'success',
                'title'  => 'Tabel users',
                'desc'   => 'Tabel <b>users</b> berhasil dibuat untuk fitur Register dan Login.'
            ];
        } else {
            $results[] = [
                'status' => 'error',
                'title'  => 'Gagal Buat Tabel users',
                'desc'   => $conn->error
            ];
        }

        // 6. SEED DATA CARS
        $sql_seed_cars = "INSERT IGNORE INTO cars (car_id, name, category, price, image, rating, spec_seat, spec_trans, spec_fuel, spec_other, status) VALUES
        ('avanza', 'All New Avanza', 'silver', 350, 'ToyotaAvanza.jpg', '4.8 (12 Review)', '7 Seat', 'Manual', 'Bensin', '2 Bag', 'available'),
        ('xenia', 'All New Xenia', 'silver', 350, 'allNewXenia.jpg', '4.9 (18 Review)', '7 Seat', 'Manual', 'Bensin', '2 Bag', 'available'),
        ('brio', 'Honda Brio', 'silver', 300, 'HondaBrio.jpg', '4.8 (56 Review)', '5 Seat', 'Matic', 'Hemat', 'BT', 'available'),
        ('brv', 'Honda BR-V N7x', 'gold', 400, 'HondaBRVN7.jpg', '4.7 (80 Review)', '7 Seat', 'Manual', 'Bensin', '3 Bag', 'available'),
        ('xpander_ult', 'Mitsubishi Xpander Ultimate', 'gold', 400, 'MistubishiXpanderUltimate.jpg', '4.9 (42 Review)', '7 Seat', 'Matic', 'Bensin', 'Smart', 'available'),
        ('xpander_sport', 'Mitsubishi Xpander Sport', 'gold', 400, 'MistubishiXpanderSport.jpg', '4.8 (38 Review)', '7 Seat', 'Matic', 'Bensin', 'Audio', 'available')";
        
        if ($conn->query($sql_seed_cars)) {
            $results[] = [
                'status' => 'success',
                'title'  => 'Data Bawaan Mobil',
                'desc'   => '6 Armada mobil bawaan (Avanza, Xenia, Brio, BR-V, Xpander) telah dimasukkan ke database.'
            ];
        }

        // 7. SEED DATA TESTIMONIALS
        $sql_seed_testi = "INSERT IGNORE INTO testimonials (id, name, role, rating, text, image, status) VALUES
        ('testi_1', 'Andi Pratama', 'Wisatawan Jakarta', 5, '\"Mobilnya bersih dan wangi. Pelayanan admin sangat ramah dan fast response. Recommended buat yang cari rental di Bumiayu.\"', 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png', 'approved'),
        ('testi_2', 'Siti Aminah', 'Warga Lokal', 5, '\"Sewa buat acara nikahan keluarga, unit Xpander-nya mulus banget kaya baru. Harga juga bersahabat.\"', 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png', 'approved')";
        
        if ($conn->query($sql_seed_testi)) {
            $results[] = [
                'status' => 'success',
                'title'  => 'Data Bawaan Testimoni',
                'desc'   => 'Data testimoni awal pelanggan telah dimasukkan.'
            ];
        }

        // 8. SEED AKUN ADMIN & DEMO USER
        // Password default: 'rentalbmykings'
        $admin_pass_hash = password_hash('rentalbmykings', PASSWORD_DEFAULT);
        $user_pass_hash  = password_hash('password123', PASSWORD_DEFAULT);

        // Akun Admin 1
        $stmt_admin = $conn->prepare("INSERT INTO users (nama_lengkap, email, password, role) VALUES (?, ?, ?, 'admin') ON DUPLICATE KEY UPDATE password = VALUES(password), role = 'admin'");
        $admin_name = "Admin Kings Rental";
        $admin_email = "admin@kingsrental.com";
        $stmt_admin->bind_param("sss", $admin_name, $admin_email, $admin_pass_hash);
        $stmt_admin->execute();
        $stmt_admin->close();

        // Akun Admin 2 (kingsrental@gmail.com)
        $stmt_admin2 = $conn->prepare("INSERT INTO users (nama_lengkap, email, password, role) VALUES (?, ?, ?, 'admin') ON DUPLICATE KEY UPDATE password = VALUES(password), role = 'admin'");
        $admin_name2 = "Administrator";
        $admin_email2 = "kingsrental@gmail.com";
        $stmt_admin2->bind_param("sss", $admin_name2, $admin_email2, $admin_pass_hash);
        $stmt_admin2->execute();
        $stmt_admin2->close();

        // Akun Demo Pelanggan
        $stmt_user = $conn->prepare("INSERT INTO users (nama_lengkap, email, password, role) VALUES (?, ?, ?, 'pelanggan') ON DUPLICATE KEY UPDATE password = VALUES(password)");
        $user_name = "Pelanggan Demo";
        $user_email = "pelanggan@gmail.com";
        $stmt_user->bind_param("sss", $user_name, $user_email, $user_pass_hash);
        $stmt_user->execute();
        $stmt_user->close();

        $results[] = [
            'status' => 'success',
            'title'  => 'Akun Pengguna & Admin',
            'desc'   => 'Akun Admin (<b>admin@kingsrental.com</b>) dan Pelanggan Demo (<b>pelanggan@gmail.com</b>) siap digunakan.'
        ];
    } else {
        $results[] = [
            'status' => 'error',
            'title'  => 'Gagal Membuat Database',
            'desc'   => $conn->error
        ];
    }
    $conn->close();
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Perbaikan & Setup Database - Kings Rental Bumiayu</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    <style>
        :root {
            --bg: #090d16;
            --card-bg: #111827;
            --card-border: rgba(255, 255, 255, 0.08);
            --accent: #f59e0b;
            --accent-glow: rgba(245, 158, 11, 0.2);
            --text-main: #f9fafb;
            --text-muted: #9ca3af;
            --success: #10b981;
            --danger: #ef4444;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: var(--bg);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px 15px;
        }
        .container {
            max-width: 680px;
            width: 100%;
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 20px;
            padding: 35px 30px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header .icon-wrap {
            width: 65px;
            height: 65px;
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(16, 185, 129, 0.2));
            border: 1px solid var(--accent);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            color: var(--accent);
            margin-bottom: 15px;
        }
        .header h1 {
            font-size: 1.6rem;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 6px;
        }
        .header p {
            color: var(--text-muted);
            font-size: 0.92rem;
        }
        .status-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 25px;
        }
        .status-item {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 14px 18px;
            border-radius: 12px;
        }
        .status-item.success { border-left: 4px solid var(--success); }
        .status-item.error { border-left: 4px solid var(--danger); }
        .status-item i {
            font-size: 1.3rem;
            margin-top: 2px;
        }
        .status-item.success i { color: var(--success); }
        .status-item.error i { color: var(--danger); }
        .status-item .content h4 {
            font-size: 0.95rem;
            font-weight: 700;
            color: #fff;
            margin-bottom: 2px;
        }
        .status-item .content p {
            font-size: 0.85rem;
            color: var(--text-muted);
            line-height: 1.4;
        }
        .info-box {
            background: rgba(245, 158, 11, 0.08);
            border: 1px dashed rgba(245, 158, 11, 0.3);
            border-radius: 12px;
            padding: 18px;
            margin-bottom: 25px;
        }
        .info-box h3 {
            font-size: 0.95rem;
            color: var(--accent);
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            font-size: 0.85rem;
        }
        @media(max-width: 500px) {
            .info-grid { grid-template-columns: 1fr; }
        }
        .info-card {
            background: rgba(0, 0, 0, 0.25);
            padding: 10px 12px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .info-card strong { color: #fff; display: block; margin-bottom: 4px; font-size: 0.88rem; }
        .info-card span { color: var(--text-muted); font-size: 0.8rem; }
        .info-card code {
            background: rgba(245, 158, 11, 0.15);
            color: var(--accent);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.82rem;
            font-family: monospace;
        }
        .btn-group {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }
        .btn {
            flex: 1;
            min-width: 140px;
            padding: 12px 18px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 0.9rem;
            text-align: center;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .btn-primary {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: #000;
            border: none;
        }
        .btn-primary:hover {
            opacity: 0.9;
            transform: translateY(-2px);
        }
        .btn-secondary {
            background: rgba(255, 255, 255, 0.08);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.15);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon-wrap">
                <i class="ri-database-2-line"></i>
            </div>
            <h1>Status Database Kings Rental</h1>
            <p>Pemeriksaan dan Perbaikan Struktur Database Otomatis</p>
        </div>

        <div class="status-list">
            <?php foreach ($results as $res): ?>
                <div class="status-item <?= $res['status'] ?>">
                    <i class="<?= $res['status'] === 'success' ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill' ?>"></i>
                    <div class="content">
                        <h4><?= $res['title'] ?></h4>
                        <p><?= $res['desc'] ?></p>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <div class="info-box">
            <h3><i class="ri-key-2-line"></i> Akun Login Siap Pakai:</h3>
            <div class="info-grid">
                <div class="info-card">
                    <strong>👑 Akun Administrator:</strong>
                    <span>Email: <code>admin@kingsrental.com</code></span><br>
                    <span>Password: <code>rentalbmykings</code></span>
                </div>
                <div class="info-card">
                    <strong>👤 Akun Pelanggan Demo:</strong>
                    <span>Email: <code>pelanggan@gmail.com</code></span><br>
                    <span>Password: <code>password123</code></span>
                </div>
            </div>
        </div>

        <div class="btn-group">
            <a href="index.html" class="btn btn-primary">
                <i class="ri-home-4-line"></i> Buka Website
            </a>
            <a href="admin.html" class="btn btn-secondary">
                <i class="ri-dashboard-3-line"></i> Panel Admin
            </a>
            <a href="setup_db.php?reset=1" onclick="return confirm('Yakin ingin mereset dan membuat ulang database dari awal?')" class="btn" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3);">
                <i class="ri-refresh-line"></i> Buat Ulang dari Awal (Reset)
            </a>
        </div>
    </div>
</body>
</html>