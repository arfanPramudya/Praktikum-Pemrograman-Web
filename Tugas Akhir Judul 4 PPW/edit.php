<?php
session_start();

// Guard: Cek login
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header("Location: login.php");
    exit;
}

$id = $_GET['id'] ?? '';

// Validasi ID
if (empty($id)) {
    header("Location: dashboard.php");
    exit;
}

$kontak_ditemukan = null;

// Cari kontak (ID)
if (isset($_SESSION['kontak'])) {
    foreach ($_SESSION['kontak'] as $kontak) {
        if ($kontak['id'] == $id) {
            $kontak_ditemukan = $kontak;
            break;
        }
    }
}

// Jika kontak tidak ditemukan
if ($kontak_ditemukan === null) {
    header("Location: dashboard.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Kontak - Sistem Kontak</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-green-50 to-cyan-50 min-h-screen">
    <div class="flex items-center justify-center min-h-screen py-8">
        <div class="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-6 text-center">
                Edit Kontak: <?php echo htmlspecialchars($kontak_ditemukan['nama']); ?>
            </h2>
            
            <form method="POST" action="proses_edit.php" class="space-y-4">
                <input type="hidden" name="id" value="<?php echo htmlspecialchars($kontak_ditemukan['id']); ?>">
                
                
                <div class="flex gap-4 pt-4">
                    <button 
                        type="submit" 
                        class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                        Update
                    </button>
                    <a 
                        href="dashboard.php" 
                        class="flex-1 text-center border border-slate-300 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-50 transition duration-200"
                    >
                        Batal
                    </a>
                </div>
            </form>
        </div>
    </div>
</body>
</html>
