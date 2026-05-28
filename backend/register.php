<?php

require_once 'config.php';
require_once 'database.php';

// Set JSON header
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// Response helper function
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

// Input validation function
function validateInput($data) {
    $errors = [];
    
    // Check required fields
    if (empty($data['fullName'])) {
        $errors[] = 'Full name is required';
    }
    
    if (empty($data['email'])) {
        $errors[] = 'Email is required';
    }
    
    if (empty($data['password'])) {
        $errors[] = 'Password is required';
    }
    
    // Validate email format
    if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Invalid email format';
    }
    
    // Validate password strength
    if (!empty($data['password'])) {
        if (strlen($data['password']) < 6) {
            $errors[] = 'Password must be at least 6 characters long';
        }
    }
    
    // Validate full name
    if (!empty($data['fullName'])) {
        if (strlen(trim($data['fullName'])) < 2) {
            $errors[] = 'Full name must be at least 2 characters long';
        }
        
        if (!preg_match('/^[a-zA-Z\s\-\'\.]+$/', $data['fullName'])) {
            $errors[] = 'Full name contains invalid characters';
        }
    }
    
    return $errors;
}

// Split full name into first and last name
function splitFullName($fullName) {
    $parts = explode(' ', trim($fullName), 2);
    $firstName = $parts[0];
    $lastName = isset($parts[1]) ? $parts[1] : '';
    
    return ['first_name' => $firstName, 'last_name' => $lastName];
}

try {
    // Get input data
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Also check POST data if JSON is empty (for form submissions)
    if (empty($input)) {
        $input = $_POST;
    }
    
    // Debug: Log the received data
    error_log("Registration attempt: " . json_encode($input));
    
    // Validate input
    $errors = validateInput($input);
    if (!empty($errors)) {
        jsonResponse([
            'success' => false,
            'error' => 'Validation failed',
            'details' => $errors
        ], 400);
    }
    
    // Sanitize and prepare data
    $email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
    $password = $input['password'];
    $fullName = trim($input['fullName']);
    
    // Split full name
    $nameParts = splitFullName($fullName);
    $firstName = $nameParts['first_name'];
    $lastName = $nameParts['last_name'];
    
    // Check if user already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        jsonResponse([
            'success' => false,
            'error' => 'Email already registered',
            'message' => 'An account with this email already exists. Please try logging in instead.'
        ], 409);
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $stmt = $pdo->prepare("
        INSERT INTO users (email, password, first_name, last_name, role, status, created_at) 
        VALUES (?, ?, ?, ?, 'user', 'active', NOW())
    ");
    
    $success = $stmt->execute([$email, $hashedPassword, $firstName, $lastName]);
    
    if (!$success) {
        throw new Exception('Failed to create user account');
    }
    
    $userId = $pdo->lastInsertId();
    
    // Auto-login after successful registration
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_name'] = $fullName;
    $_SESSION['user_role'] = 'user';
    $_SESSION['logged_in'] = true;
    
    // Log the registration (optional)
    error_log("New user registered successfully: $email (ID: $userId)");
    
    // Send success response
    jsonResponse([
        'success' => true,
        'message' => 'Registration successful! Welcome to Accountancy Dashboard.',
        'user' => [
            'id' => $userId,
            'email' => $email,
            'name' => $fullName,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'role' => 'user'
        ],
        'redirect' => 'index.html'
    ], 201);
    
} catch (PDOException $e) {
    // Database error
    error_log("Registration database error: " . $e->getMessage());
    
    jsonResponse([
        'success' => false,
        'error' => 'Database error occurred',
        'message' => 'Unable to create account. Please try again later.',
        'debug' => $e->getMessage() // Remove this in production
    ], 500);
    
} catch (Exception $e) {
    // General error
    error_log("Registration error: " . $e->getMessage());
    
    jsonResponse([
        'success' => false,
        'error' => 'Registration failed',
        'message' => $e->getMessage()
    ], 500);
}
?>