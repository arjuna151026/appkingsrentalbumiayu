<?php
header('Content-Type: application/json');
require_once 'koneksi.php'; // Memanggil file koneksi

$query = "SELECT * FROM cars";
$result = mysqli_query($koneksi, $query);

$cars = array();

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        // Menyesuaikan dengan nama kolom yang benar di phpMyAdmin
        // dan membentuk format data yang pas untuk index.html & admin.html
        $car = array(
            "id" => $row['id'], 
            "name" => $row['name'],
            "category" => $row['category'],
            "price" => (int)$row['price'],
            "image" => $row['image'],
            "rating" => $row['rating'],
            "specs" => array(
                "seat" => $row['specs_seat'],
                "trans" => $row['specs_trans'],
                "fuel" => $row['specs_fuel'],
                "other" => $row['specs_other']
            ),
            "status" => $row['status']
        );
        array_push($cars, $car);
    }
    // Menampilkan data dalam format JSON
    echo json_encode($cars);
} else {
    // Jika gagal
    echo json_encode(array("error" => "Gagal mengambil data dari database"));
}
?>