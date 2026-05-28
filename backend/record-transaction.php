<?php
// Include database connection
require_once 'config.php';
require_once 'database.php';

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $transactionType = $_POST['transactionType'] ?? '';
    $accountId = $_POST['accountId'] ?? '';
    $amount = $_POST['amount'] ?? 0;
    $description = $_POST['description'] ?? '';
    $toAccountId = $_POST['toAccountId'] ?? null;
    $department = $_POST['department'] ?? '';
    
    // Validate required fields
    if (empty($transactionType) || empty($accountId) || empty($amount) || empty($department)) {
        $error = "Please fill in all required fields.";
    } else {
        try {
            // Generate unique reference number
            $referenceNumber = 'TXN-' . time() . rand(100, 999);
            
            // Prepare SQL statement
            $query = "INSERT INTO transactions (account_id, department, transaction_type, amount, description, reference_number, to_account_id, status, created_at, updated_at) 
                     VALUES (:account_id, :department, :transaction_type, :amount, :description, :reference_number, :to_account_id, :status, NOW(), NOW())";
            
            $stmt = $db->prepare($query);
            
            // Bind parameters
            $stmt->bindParam(':account_id', $accountId);
            $stmt->bindParam(':department', $department);
            $stmt->bindParam(':transaction_type', $transactionType);
            $stmt->bindParam(':amount', $amount);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':reference_number', $referenceNumber);
            $stmt->bindParam(':to_account_id', $toAccountId);
            $transactionStatus = 'pending';
            $stmt->bindParam(':status', $transactionStatus);
            // Execute the statement
            if ($stmt->execute()) {
                // Get the transaction ID
                $transactionId = $db->lastInsertId();
                // Generate invoice number
                $invoiceNumber = 'INV-' . time() . rand(100, 999);
                // Insert invoice into invoices table
                $invoiceQuery = "INSERT INTO invoices (invoice_number, user_id, department, customer_name, invoice_date, due_date, subtotal, tax_amount, total_amount, status, created_at, updated_at) VALUES (:invoice_number, :user_id, :department, :customer_name, :invoice_date, :due_date, :subtotal, :tax_amount, :total_amount, :status, NOW(), NOW())";
                $invoiceStmt = $db->prepare($invoiceQuery);
                $userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 1;
                $customerName = 'N/A';
                $invoiceDate = date('Y-m-d');
                $dueDate = date('Y-m-d', strtotime('+30 days'));
                $subtotal = $amount;
                $taxAmount = 0.00;
                $totalAmount = $amount;
                $invoiceStatus = 'draft';
                $invoiceStmt->bindParam(':invoice_number', $invoiceNumber);
                $invoiceStmt->bindParam(':user_id', $userId);
                $invoiceStmt->bindParam(':department', $department);
                $invoiceStmt->bindParam(':customer_name', $customerName);
                $invoiceStmt->bindParam(':invoice_date', $invoiceDate);
                $invoiceStmt->bindParam(':due_date', $dueDate);
                $invoiceStmt->bindParam(':subtotal', $subtotal);
                $invoiceStmt->bindParam(':tax_amount', $taxAmount);
                $invoiceStmt->bindParam(':total_amount', $totalAmount);
                $invoiceStmt->bindParam(':status', $invoiceStatus);
                if ($invoiceStmt->execute()) {
                    // Redirect to the same page with a success message
                    header('Location: record-transaction.php?success=1');
                    exit();
                } else {
                    $error = "Transaction recorded, but failed to generate invoice.";
                }
            } else {
                $error = "Error recording transaction. Please try again.";
            }
        } catch (PDOException $e) {
            $error = "Database error: " . $e->getMessage();
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Record Transaction</title>
    <link rel="stylesheet" href="css/record-transaction.css">
</head>
<body>
    <div class="container">
        <h1>Record New Transaction</h1>
        
        <!-- Show a success message if redirected -->
        <?php if (isset($_GET['success'])): ?>
            <div class="alert alert-success">
                Transaction recorded successfully!
            </div>
        <?php endif; ?>
        
        <?php if (isset($error)): ?>
            <div class="alert alert-error">
                <?php echo htmlspecialchars($error); ?>
            </div>
        <?php endif; ?>
        
        <form id="transactionForm" method="POST" action="record-transaction.php">
            <div class="form-group">
                <label for="transactionType">Transaction Type</label>
                <select id="transactionType" name="transactionType" required>
                    <option value="">Select Type</option>
                    <option value="debit" <?php echo (isset($transactionType) && $transactionType === 'debit') ? 'selected' : ''; ?>>Debit</option>
                    <option value="credit" <?php echo (isset($transactionType) && $transactionType === 'credit') ? 'selected' : ''; ?>>Credit</option>
                    <option value="transfer" <?php echo (isset($transactionType) && $transactionType === 'transfer') ? 'selected' : ''; ?>>Transfer</option>
                </select>
            </div>
            <div class="form-group">
                <label for="department">Department</label>
                <select id="department" name="department" required>
                    <option value="">Select Department</option>
                    <option value="HR" <?php echo (isset($department) && $department === 'HR') ? 'selected' : ''; ?>>HR</option>
                    <option value="IT" <?php echo (isset($department) && $department === 'IT') ? 'selected' : ''; ?>>IT</option>
                    <option value="MARKETING" <?php echo (isset($department) && $department === 'MARKETING') ? 'selected' : ''; ?>>MARKETING</option>
                    <option value="FINANCE" <?php echo (isset($department) && $department === 'FINANCE') ? 'selected' : ''; ?>>FINANCE</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="accountId">Account ID</label>
                <input type="number" id="accountId" name="accountId" value="<?php echo htmlspecialchars($accountId ?? ''); ?>" required>
            </div>
            
            <div class="form-group">
                <label for="amount">Amount</label>
                <input type="number" id="amount" name="amount" min="0" step="0.01" value="<?php echo htmlspecialchars($amount ?? ''); ?>" required>
            </div>
            
            <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" name="description" rows="3"><?php echo htmlspecialchars($description ?? ''); ?></textarea>
            </div>
            
            <div class="form-group">
                <label for="toAccountId">To Account (for transfers)</label>
                <input type="number" id="toAccountId" name="toAccountId" value="<?php echo htmlspecialchars($toAccountId ?? ''); ?>">
            </div>
            
            <button type="submit" class="btn-submit">Record Transaction</button>
        </form>
    </div>
    
    <script src="js/record-transaction.js"></script>
</body>
</html>