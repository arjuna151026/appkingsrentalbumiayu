<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

include 'koneksi.php';

// Ambil hanya testimoni yang sudah disetujui (approved)
$sql = "SELECT * FROM testimonials WHERE status = 'approved' ORDER BY created_at DESC";
$result = $conn->query($sql);

$testimonials = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $testimonials[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'role' => $row['role'],
            'rating' => (int)$row['rating'],
            'text' => $row['text'],
            'image' => $row['image']
        ];
    }
}

echo json_encode($testimonials);

$conn->close();
?>
