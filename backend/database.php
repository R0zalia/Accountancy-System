<?php
require_once 'config.php';

class Database {
    private $connection;
    
    public function __construct() {
        $this->connect();
        $this->createTables();
    }
    
    private function connect() {
        try {
            // First, create database if it doesn't exist
            $pdo = new PDO("mysql:host=" . DB_HOST, DB_USERNAME, DB_PASSWORD);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Create database
            $pdo->exec("CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            
            // Connect to the database
            $this->connection = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USERNAME,
                DB_PASSWORD,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
            
        } catch (PDOException $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    private function createTables() {
        $queries = [
            // Users table
            "CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(191) UNIQUE NOT NULL,
                password VARCHAR(191) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                phone VARCHAR(20),
                role ENUM('admin', 'user', 'manager') DEFAULT 'user',
                status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )",
            
            // Accounts table
            "CREATE TABLE IF NOT EXISTS accounts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                account_number VARCHAR(20) UNIQUE NOT NULL,
                account_name VARCHAR(191) NOT NULL,
                account_type ENUM('savings', 'checking', 'business', 'investment') NOT NULL,
                balance DECIMAL(15,2) DEFAULT 0.00,
                currency VARCHAR(3) DEFAULT 'USD',
                status ENUM('active', 'inactive', 'frozen') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )",
            
            // Departments table
            "CREATE TABLE IF NOT EXISTS departments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(191) NOT NULL,
                description TEXT,
                manager_id INT,
                budget DECIMAL(15,2) DEFAULT 0.00,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
            )",
            
            // Transactions table
            "CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                account_id INT NOT NULL,
                department VARCHAR(191),
                transaction_type ENUM('debit', 'credit', 'transfer') NOT NULL,
                amount DECIMAL(15,2) NOT NULL,
                description TEXT,
                reference_number VARCHAR(50) UNIQUE,
                to_account_id INT NULL,
                status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
                FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE SET NULL
            )",
            
            // Invoices table
            "CREATE TABLE IF NOT EXISTS invoices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoice_number VARCHAR(50) UNIQUE NOT NULL,
                user_id INT NOT NULL,
                department VARCHAR(191),
                customer_name VARCHAR(191) NOT NULL,
                customer_email VARCHAR(191),
                customer_phone VARCHAR(20),
                invoice_date DATE NOT NULL,
                due_date DATE NOT NULL,
                subtotal DECIMAL(15,2) NOT NULL,
                tax_amount DECIMAL(15,2) DEFAULT 0.00,
                total_amount DECIMAL(15,2) NOT NULL,
                status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )",
            
            // Payments table
            "CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoice_id INT,
                transaction_id INT,
                amount DECIMAL(15,2) NOT NULL,
                payment_method ENUM('cash', 'card', 'bank_transfer', 'check', 'online') NOT NULL,
                payment_date DATE NOT NULL,
                reference_number VARCHAR(50),
                notes TEXT,
                status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
                FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
            )",
            
            // Settings table
            "CREATE TABLE IF NOT EXISTS settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(100) UNIQUE NOT NULL,
                setting_value TEXT,
                setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )"
        ];
        
        foreach ($queries as $query) {
            try {
                $this->connection->exec($query);
            } catch (PDOException $e) {
                die("Error creating tables: " . $e->getMessage());
            }
        }
        
        // Insert default admin user if not exists
        $this->createDefaultUser();
    }
    
    private function createDefaultUser() {
        $stmt = $this->connection->prepare("SELECT COUNT(*) FROM users WHERE role = 'admin'");
        $stmt->execute();
        
        if ($stmt->fetchColumn() == 0) {
            $stmt = $this->connection->prepare("
                INSERT INTO users (email, password, first_name, last_name, role) 
                VALUES (?, ?, ?, ?, 'admin')
            ");
            $stmt->execute([
                'admin@accountancy.com',
                password_hash('admin123', PASSWORD_DEFAULT),
                'System',
                'Administrator'
            ]);
        }
    }
}

// Initialize database connection
$database = new Database();
$pdo = $database->getConnection();
?>