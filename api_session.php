<?php
session_start();
header('Content-Type: application/json');

// Jika ada user yang sedang login
if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'logged_in' => true,
        'name' => $_SESSION['user_name'],
        'role' => $_SESSION['user_role']
    ]);
} else {
    // Jika tidak ada yang login
    echo json_encode(['logged_in' => false]);
}
?>