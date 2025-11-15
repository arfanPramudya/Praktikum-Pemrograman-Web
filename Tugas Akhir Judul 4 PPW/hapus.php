<?php
session_start();

// Guard: Cek login
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header("Location: login.php");
    exit;
}

// Cek ID
if (!isset($_GET['id'])) {
    header("Location: dashboard.php");
    exit;
}

$id = $_GET['id'];

// Cari dan hapus kontak (ID)
if (isset($_SESSION['kontak'])) {
    foreach ($_SESSION['kontak'] as $key => $kontak) {
        if ($kontak['id'] == $id) {
            unset($_SESSION['kontak'][$key]);
            break;
        }
    }
    // Index array ulang setelah unset
    $_SESSION['kontak'] = array_values($_SESSION['kontak']);
}

header("Location: dashboard.php");
exit;
