<?php
session_start();

// Hancurkan session
session_unset();
session_destroy();

// Redirect ke login
header("Location: login.php");
exit;
