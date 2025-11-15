<?php
session_start();

// Guard: login langsung ke dashboard
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    header("Location: dashboard.php");
    exit;
}

$error_message = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // Validasi hardcoded
    if ($username == "admin" && $password == "123") {
        $_SESSION['logged_in'] = true;
        $_SESSION['username'] = $username;
        
        // Inisialisasi array kontak jika belum ada
        if (!isset($_SESSION['kontak'])) {
            $_SESSION['kontak'] = [];
        }
        
        header("Location: dashboard.php");
        exit;
    } else {
        $error_message = "Username atau Password salah!";
    }
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Sistem Kontak</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-green-50 to-cyan-50 min-h-screen">
    <div class="flex items-center justify-center min-h-screen">
        <div class="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-6 text-center">Login Sistem Kontak</h2>
            
            <?php if (!empty($error_message)): ?>
                <div class="mb-4 p-4 bg-red-100 border border-red-400 text-red-600 rounded">
                    <?php echo $error_message; ?>
                </div>
            <?php endif; ?>
            
            <form method="POST" action="">
                <div class="mb-4">
                    <label for="username" class="block text-sm font-medium text-slate-800 mb-2">Username</label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        required 
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-slate-800"
                        placeholder="Masukkan username"
                    >
                </div>
                
                <div class="mb-6">
                    <label for="password" class="block text-sm font-medium text-slate-800 mb-2">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        required 
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-slate-800"
                        placeholder="Masukkan password"
                    >
                </div>
                
                <button 
                    type="submit" 
                    class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                    Login
                </button>
            </form>
            
            <p class="text-center text-sm text-slate-600 mt-4">
                Username: <span class="font-semibold">admin</span> | Password: <span class="font-semibold">123</span>
            </p>
        </div>
    </div>
</body>
</html>
