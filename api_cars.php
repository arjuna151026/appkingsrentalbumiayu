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
            "id" => $row['car_id'],  // FIX: nama kolom adalah car_id, bukan id
            "name" => $row['name'],
            "category" => $row['category'],
            "price" => (int)$row['price'],
            "image" => $row['image'],
            "rating" => $row['rating'],
            "specs" => array(
                "seat" => $row['spec_seat'],   // FIX: spec_seat bukan specs_seat
                "trans" => $row['spec_trans'],  // FIX: spec_trans bukan specs_trans
                "fuel" => $row['spec_fuel'],    // FIX: spec_fuel bukan specs_fuel
                "other" => $row['spec_other']   // FIX: spec_other bukan specs_other
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