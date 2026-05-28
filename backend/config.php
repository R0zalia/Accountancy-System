<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', ''); // Default XAMPP password is empty
define('DB_NAME', 'accountancy_dashboard');

// Application Configuration
define('APP_NAME', 'Accountancy Dashboard');
define('BASE_URL', 'http://localhost/DBMSWorkingFE/'); // Change 'your-project-name' to your actual folder name

// Session Configuration
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_secure', 0); // Set to 1 if using HTTPS
    session_start();
}

// Error Reporting (Turn off in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON header for API responses
if (strpos($_SERVER['REQUEST_URI'], '/api/') !== false) {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}
?>

<?php

// Create a PDO instance and auto-create database if it doesn't exist
try {
    // Try to connect to the database
    $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USERNAME, DB_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // If database does not exist, create it
    if (strpos($e->getMessage(), 'Unknown database') !== false) {
        try {
            $pdo = new PDO('mysql:host=' . DB_HOST, DB_USERNAME, DB_PASSWORD);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->exec('CREATE DATABASE IF NOT EXISTS ' . DB_NAME . ' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
            // Now connect to the newly created database
            $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USERNAME, DB_PASSWORD);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $ex) {
            echo 'Database creation failed: ' . $ex->getMessage();
            exit;
        }
    } else {
        echo 'Database connection failed: ' . $e->getMessage();
        exit;
    }
}
?>
