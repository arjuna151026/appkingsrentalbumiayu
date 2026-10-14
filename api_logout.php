<?php
session_start();
session_unset();
session_destroy();
// Arahkan kembali ke halaman utama setelah logout
header("Location: index.html");
exit;
?>