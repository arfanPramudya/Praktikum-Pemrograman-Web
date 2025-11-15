<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Sistem Kontak</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-green-50 to-cyan-50 min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-4xl font-bold text-slate-900">Dashboard Kontak</h1>
                <p class="text-slate-600 mt-2">Selamat datang, <span class="font-semibold"><?php echo htmlspecialchars($_SESSION['username']); ?></span></p>
            </div>
            <a 
                href="logout.php" 
                class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
            >
                Logout
            </a>
        </div>
        
        <!-- Pesan Peringatan -->
        <?php if (!empty($success_message)): ?>
            <div class="mb-4 p-4 bg-green-100 border border-green-400 text-green-600 rounded-lg">
                <?php echo $success_message; ?>
            </div>
        <?php endif; ?>
        
        <?php if (!empty($error_message)): ?>
            <div class="mb-4 p-4 bg-red-100 border border-red-400 text-red-600 rounded-lg">
                <?php echo $error_message; ?>
            </div>
        <?php endif; ?>
        

    </div>
</body>
</html>
