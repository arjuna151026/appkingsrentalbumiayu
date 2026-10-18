<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'koneksi.php';

// Handle Base64 photos
ini_set('memory_limit', '128M');
ini_set('post_max_size', '40M');
ini_set('upload_max_filesize', '40M');

$content = file_get_contents("php://input");
$data = json_decode($content, true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $data['action'] ?? '';

    // 1. AMBIL SEMUA TESTIMONI (UNTUK ADMIN)
    if ($action === 'list') {
        $status = $data['status'] ?? ''; // 'approved' or 'pending'
        
        if ($status) {
            $stmt = $conn->prepare("SELECT * FROM testimonials WHERE status = ? ORDER BY created_at DESC");
            $stmt->bind_param("s", $status);
        } else {
            $stmt = $conn->prepare("SELECT * FROM testimonials ORDER BY created_at DESC");
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $list = [];
        while($row = $result->fetch_assoc()) {
            $list[] = $row;
        }
        echo json_encode($list);
        $stmt->close();
    }
    // 2. TAMBAH TESTIMONI
    elseif ($action === 'add') {
        $id = $data['id'];
        $name = $data['name'];
        $role = $data['role'];
        $rating = $data['rating'];
        $text = $data['text'];
        $image = $data['image'];
        $status = $data['status'] ?? 'approved';

        $stmt = $conn->prepare("INSERT INTO testimonials (id, name, role, rating, text, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssisss", $id, $name, $role, $rating, $text, $image, $status);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Testimoni berhasil ditambahkan"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Gagal: " . $stmt->error]);
        }
        $stmt->close();
    }
    // 3. SETUJUI TESTIMONI (APPROVE)
    elseif ($action === 'approve') {
        $id = $data['id'];
        $stmt = $conn->prepare("UPDATE testimonials SET status = 'approved' WHERE id = ?");
        $stmt->bind_param("s", $id);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Testimoni disetujui"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Gagal: " . $stmt->error]);
        }
        $stmt->close();
    }
    // 4. HAPUS TESTIMONI
    elseif ($action === 'delete') {
        $id = $data['id'];
        
        $stmt = $conn->prepare("DELETE FROM testimonials WHERE id=?");
        $stmt->bind_param("s", $id);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Testimoni berhasil dihapus"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Gagal: " . $stmt->error]);
        }
        $stmt->close();
    }
}

$conn->close();
?>
