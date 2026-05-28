<?php
// Include configuration and database connection
require_once 'config.php';
require_once 'database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get the POSTed data
    $name = $_POST['name'];
    $type = $_POST['type'];
    $number = $_POST['number'];
    $initBal = $_POST['initBal'];
    $status = $_POST['status'];

    // Basic validation
    if (empty($name) || empty($type) || empty($number) || empty($initBal) || empty($status)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }

    // Prepare the SQL statement to insert the account
    $sql = "INSERT INTO accounts (name, type, number, balance, status, created_at) 
            VALUES (:name, :type, :number, :balance, :status, NOW())";

    // Create a prepared statement
    $stmt = $pdo->prepare($sql);

    // Bind parameters
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':type', $type);
    $stmt->bindParam(':number', $number);
    $stmt->bindParam(':balance', $initBal);
    $stmt->bindParam(':status', $status);

    // Execute the query
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Account created successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error creating account']);
    }
}
?>
