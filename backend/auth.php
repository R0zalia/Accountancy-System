<?php
require_once '../config.php';
require_once '../database.php';

// Response helper function
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

// Validate input
function validateInput($data, $required = []) {
    $errors = [];
    
    foreach ($required as $field) {
        if (empty($data[$field])) {
            $errors[] = ucfirst($field) . ' is required';
        }
    }
    
    return $errors;
}

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        if (isset($_GET['action'])) {
            switch ($_GET['action']) {
                case 'login':
                    handleLogin();
                    break;
                case 'register':
                    handleRegister();
                    break;
                case 'logout':
                    handleLogout();
                    break;
                default:
                    jsonResponse(['error' => 'Invalid action'], 400);
            }
        } else {
            // Default to login if no action specified
            handleLogin();
        }
        break;
    
    case 'GET':
        if (isset($_GET['action']) && $_GET['action'] === 'check') {
            checkAuthStatus();
        } else {
            jsonResponse(['error' => 'Invalid request'], 400);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function handleLogin() {
    global $pdo;
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Also check POST data if JSON is empty
    if (empty($input)) {
        $input = $_POST;
    }
    
    // Validate required fields
    $errors = validateInput($input, ['email', 'password']);
    if (!empty($errors)) {
        jsonResponse(['error' => 'Validation failed', 'details' => $errors], 400);
    }
    
    $email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
    $password = $input['password'];
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Invalid email format'], 400);
    }
    
    try {
        // Check if user exists and get user data
        $stmt = $pdo->prepare("
            SELECT id, email, password, first_name, last_name, role, status 
            FROM users 
            WHERE email = ? AND status = 'active'
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password'])) {
            jsonResponse(['error' => 'Invalid email or password'], 401);
        }
        
        // Set session data
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['logged_in'] = true;
        
        // Update last login (optional)
        $stmt = $pdo->prepare("UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$user['id']]);
        
        // Remove password from response
        unset($user['password']);
        
        jsonResponse([
            'success' => true,
            'message' => 'Login successful',
            'user' => $user,
            'redirect' => '../index.html'
        ]);
        
    } catch (Exception $e) {
        jsonResponse(['error' => 'Login failed: ' . $e->getMessage()], 500);
    }
}

function handleRegister() {
    global $pdo;
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Also check POST data if JSON is empty
    if (empty($input)) {
        $input = $_POST;
    }
    
    // Validate required fields
    $errors = validateInput($input, ['email', 'password', 'first_name', 'last_name']);
    if (!empty($errors)) {
        jsonResponse(['error' => 'Validation failed', 'details' => $errors], 400);
    }
    
    $email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
    $password = $input['password'];
    $firstName = trim($input['first_name']);
    $lastName = trim($input['last_name']);
    $phone = isset($input['phone']) ? trim($input['phone']) : null;
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Invalid email format'], 400);
    }
    
    // Validate password strength
    if (strlen($password) < 6) {
        jsonResponse(['error' => 'Password must be at least 6 characters long'], 400);
    }
    
    try {
        // Check if user already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        
        if ($stmt->fetch()) {
            jsonResponse(['error' => 'Email already registered'], 409);
        }
        
        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Insert new user
        $stmt = $pdo->prepare("
            INSERT INTO users (email, password, first_name, last_name, phone) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$email, $hashedPassword, $firstName, $lastName, $phone]);
        
        $userId = $pdo->lastInsertId();
        
        // Auto-login after registration
        $_SESSION['user_id'] = $userId;
        $_SESSION['user_email'] = $email;
        $_SESSION['user_name'] = $firstName . ' ' . $lastName;
        $_SESSION['user_role'] = 'user';
        $_SESSION['logged_in'] = true;
        
        jsonResponse([
            'success' => true,
            'message' => 'Registration successful',
            'user' => [
                'id' => $userId,
                'email' => $email,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'role' => 'user'
            ],
            'redirect' => '../index.html'
        ]);
        
    } catch (Exception $e) {
        jsonResponse(['error' => 'Registration failed: ' . $e->getMessage()], 500);
    }
}

function handleLogout() {
    // Destroy session
    session_destroy();
    
    jsonResponse([
        'success' => true,
        'message' => 'Logged out successfully',
        'redirect' => '../login.html'
    ]);
}

function checkAuthStatus() {
    if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
        jsonResponse([
            'authenticated' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'email' => $_SESSION['user_email'],
                'name' => $_SESSION['user_name'],
                'role' => $_SESSION['user_role']
            ]
        ]);
    } else {
        jsonResponse(['authenticated' => false], 401);
    }
}
?>