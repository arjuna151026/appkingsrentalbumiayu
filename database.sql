-- ========================================================
-- Database Dump for Kings Rental Mobil Bumiayu
-- Database: kings_rental_db
-- ========================================================
-- Hapus database lama jika ingin membuat bersih dari awal
DROP DATABASE IF EXISTS `kings_rental_db`;

-- Buat database baru dari awal
CREATE DATABASE `kings_rental_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kings_rental_db`;

-- --------------------------------------------------------
-- Struktur Tabel `cars`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cars` (
  `car_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(20) DEFAULT 'putih',
  `colors` varchar(255) DEFAULT 'Putih, Hitam, Silver',
  `price` int(11) DEFAULT 0,
  `image` longtext DEFAULT NULL,
  `rating` varchar(50) DEFAULT '5.0 (New)',
  `spec_seat` varchar(50) DEFAULT NULL,
  `spec_trans` varchar(50) DEFAULT NULL,
  `spec_fuel` varchar(50) DEFAULT NULL,
  `spec_other` varchar(100) DEFAULT NULL,
  `status` enum('available','busy') DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`car_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Data Bawaan `cars`
-- --------------------------------------------------------
INSERT IGNORE INTO `cars` (`car_id`, `name`, `category`, `colors`, `price`, `image`, `rating`, `spec_seat`, `spec_trans`, `spec_fuel`, `spec_other`, `status`) VALUES
('avanza', 'All New Avanza', 'putih', 'Putih, Hitam, Silver', 350, 'ToyotaAvanza.jpg', '4.8 (12 Review)', '7 Seat', 'Manual', 'Bensin', '2 Bag', 'available'),
('xenia', 'All New Xenia', 'silver', 'Silver, Putih, Hitam, Merah', 350, 'allNewXenia.jpg', '4.9 (18 Review)', '7 Seat', 'Manual', 'Bensin', '2 Bag', 'available'),
('brio', 'Honda Brio RS', 'merah', 'Merah, Putih, Kuning, Hitam', 300, 'HondaBrioRed.png', '4.8 (56 Review)', '5 Seat', 'Matic', 'Hemat', 'BT', 'available'),
('fortuner', 'Toyota Fortuner GR Sport', 'hitam', 'Hitam, Putih', 600, 'toyotaFortuner.jpg', '4.9 (48 Review)', '7 Seat', 'Matic', 'Diesel', '4x2 GR', 'available'),
('brv', 'Honda BR-V N7x', 'gold', 'Gold, Putih, Hitam', 400, 'HondaBRVN7.jpg', '4.7 (80 Review)', '7 Seat', 'Manual', 'Bensin', '3 Bag', 'available'),
('civic', 'Honda Civic RS Turbo', 'putih', 'Putih, Hitam, Merah', 750, 'HondaCivic.jpg', '4.9 (32 Review)', '5 Seat', 'Matic', 'Pertamax', 'Turbocharged', 'available'),
('xpander_ult', 'Mitsubishi Xpander Ultimate', 'hitam', 'Hitam, Silver, Putih', 400, 'MistubishiXpanderUltimate.jpg', '4.9 (42 Review)', '7 Seat', 'Matic', 'Bensin', 'Smart', 'available'),
('xpander_sport', 'Mitsubishi Xpander Sport', 'gold', 'Gold, Silver, Hitam', 400, 'MistubishiXpanderSport.jpg', '4.8 (38 Review)', '7 Seat', 'Matic', 'Bensin', 'Audio', 'available');

-- --------------------------------------------------------
-- Struktur Tabel `testimonials`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `rating` int(11) DEFAULT 5,
  `text` text DEFAULT NULL,
  `image` longtext DEFAULT NULL,
  `status` enum('pending','approved') DEFAULT 'approved',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Data Bawaan `testimonials`
-- --------------------------------------------------------
INSERT IGNORE INTO `testimonials` (`id`, `name`, `role`, `rating`, `text`, `image`, `status`) VALUES
('testi_1', 'Andi Pratama', 'Wisatawan Jakarta', 5, '\"Mobilnya bersih dan wangi. Pelayanan admin sangat ramah dan fast response. Recommended buat yang cari rental di Bumiayu.\"', 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png', 'approved'),
('testi_2', 'Siti Aminah', 'Warga Lokal', 5, '\"Sewa buat acara nikahan keluarga, unit Xpander-nya mulus banget kaya baru. Harga juga bersahabat.\"', 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png', 'approved');

-- --------------------------------------------------------
-- Struktur Tabel `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_lengkap` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','pelanggan') DEFAULT 'pelanggan',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Data Akun Default `users`
-- Catatan: Password admin 'rentalbmykings', pelanggan 'password123'
-- --------------------------------------------------------
INSERT IGNORE INTO `users` (`id`, `nama_lengkap`, `email`, `password`, `role`) VALUES
(1, 'Admin Kings Rental', 'admin@kingsrental.com', '$2y$10$w09b40mD3Rrh1p1n758j/uB8G4Z0y/B2vU0c5nJm20uJ3gP9L4tq6', 'admin'),
(2, 'Administrator', 'kingsrental@gmail.com', '$2y$10$w09b40mD3Rrh1p1n758j/uB8G4Z0y/B2vU0c5nJm20uJ3gP9L4tq6', 'admin'),
(3, 'Pelanggan Demo', 'pelanggan@gmail.com', '$2y$10$eEomM1R1yM6mE8f14tB65O0lRj8P.uB9K7eQ2Fw3Q1W5gT8V1uY9K', 'pelanggan');
