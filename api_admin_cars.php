<?php
// Izinkan akses dari mana saja dan metode POST
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Mengatasi permintaan 'OPTIONS' dari browser (Preflight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'koneksi.php';

// Tingkatkan batas memori PHP sementara untuk handle Base64 foto besar
ini_set('memory_limit', '128M');
ini_set('post_max_size', '40M');
ini_set('upload_max_filesize', '40M');

// Tangkap data
$content = file_get_contents("php://input");
$data = json_decode($content, true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $data['action'] ?? '';

    // 1. TAMBAH MOBIL BARU
    if ($action === 'add') {
        $car_id = $data['id'];
        $name = $data['name'];
        $category = $data['category'];
        $price = $data['price'];
        $image = $data['image']; 
        $rating = $data['rating'];
        $spec_seat = $data['specs']['seat'];
        $spec_trans = $data['specs']['trans'];
        $spec_fuel = $data['specs']['fuel'];
        $spec_other = $data['specs']['other'];
        $status = $data['status'];
        $colors = $data['colors'] ?? '';

        $stmt = $conn->prepare("INSERT INTO cars (car_id, name, category, price, image, rating, spec_seat, spec_trans, spec_fuel, spec_other, status, colors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssissssssss", $car_id, $name, $category, $price, $image, $rating, $spec_seat, $spec_trans, $spec_fuel, $spec_other, $status, $colors);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Mobil berhasil ditambahkan"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Gagal: " . $stmt->error]);
        }
        $stmt->close();
    } 
    // 2. UPDATE / EDIT MOBIL
    elseif ($action === 'edit') {
        $car_id = $data['id'];
        $name = $data['name'];
        $category = $data['category'];
        $price = $data['price'];
        $spec_seat = $data['specs']['seat'];
        $spec_trans = $data['specs']['trans'];
        $spec_fuel = $data['specs']['fuel'];
        $spec_other = $data['specs']['other'];
        $colors = $data['colors'] ?? '';
        
        // Cek apakah admin mengupload gambar baru
        if (!empty($data['image'])) {
            $image = $data['image'];
            $stmt = $conn->prepare("UPDATE cars SET name=?, category=?, price=?, image=?, spec_seat=?, spec_trans=?, spec_fuel=?, spec_other=?, colors=? WHERE car_id=?");
            $stmt->bind_param("ssisssssss", $name, $category, $price, $image, $spec_seat, $spec_trans, $spec_fuel, $spec_other, $colors, $car_id);
        } else {
            // Jika tidak ada gambar baru, update datanya saja
            $stmt = $conn->prepare("UPDATE cars SET name=?, category=?, price=?, spec_seat=?, spec_trans=?, spec_fuel=?, spec_other=?, colors=? WHERE car_id=?");
            $stmt->bind_param("ssissssss", $name, $category, $price, $spec_seat, $spec_trans, $spec_fuel, $spec_other, $colors, $car_id);
        }

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Data mobil berhasil diupdate!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Gagal: " . $stmt->error]);
        }
        $stmt->close();
    }
    // 3. GANTI STATUS (AVAILABLE / BUSY)
    elseif ($action === 'toggle_status') {
        $car_id = $data['id'];
        $new_status = $data['new_status'];
        
        $stmt = $conn->prepare("UPDATE cars SET status=? WHERE car_id=?");
        $stmt->bind_param("ss", $new_status, $car_id);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Gagal: " . $stmt->error]);
        }
        $stmt->close();
    }
    // 4. HAPUS MOBIL
    elseif ($action === 'delete') {
        $car_id = $data['id'];
        
        $stmt = $conn->prepare("DELETE FROM cars WHERE car_id=?");
        $stmt->bind_param("s", $car_id);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Gagal: " . $stmt->error]);
        }
        $stmt->close();
    }
}
$conn->close();
?>