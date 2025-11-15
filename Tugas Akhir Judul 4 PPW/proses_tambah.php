<?php
session_start();

// Guard: Cek login
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header("Location: login.php");
    exit;
}

// Cek method POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nama = $_POST['nama'] ?? '';
    $email = $_POST['email'] ?? '';
    $telepon = $_POST['telepon'] ?? '';
    
    // Validasi
    if (empty($nama) || empty($email) || empty($telepon)) {
        $_SESSION['error_message'] = "Semua field harus diisi!";
        header("Location: dashboard.php");
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $_SESSION['error_message'] = "Format email tidak valid!";
        header("Location: dashboard.php");
        exit;
    }
    
    // Sanitasi
    $nama_sanitasi = htmlspecialchars(trim($nama));
    $email_sanitasi = htmlspecialchars(trim($email));
    $telepon_sanitasi = htmlspecialchars(trim($telepon));
    
    // Buat data baru
    $kontakBaru = [
        'id' => uniqid(),
        'nama' => $nama_sanitasi,
        'email' => $email_sanitasi,
        'telepon' => $telepon_sanitasi
    ];
    
    // Simpan ke session
    if (!isset($_SESSION['kontak'])) {
        $_SESSION['kontak'] = [];
    }
    $_SESSION['kontak'][] = $kontakBaru;
    
    $_SESSION['success_message'] = "Kontak berhasil ditambahkan!";
    header("Location: dashboard.php");
    exit;
} else {
    header("Location: dashboard.php");
    exit;
}
