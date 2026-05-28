<?php
session_start();
require_once 'config.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    $action = $_POST['action'] ?? '';
    
    switch ($action) {
        case 'delete':
            $transactionId = $_POST['transactionId'] ?? '';
            if ($transactionId) {
                $stmt = $pdo->prepare("DELETE FROM transactions WHERE id = ? AND account_id = ?");
                $result = $stmt->execute([$transactionId, $_SESSION['user_id']]);
                echo json_encode(['success' => $result]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid transaction ID']);
            }
            exit();
            
        case 'get_transactions':
            $typeFilter = $_POST['type'] ?? 'all';
            $statusFilter = $_POST['status'] ?? 'all';
            
            $sql = "SELECT t.*, a.account_name as department 
                    FROM transactions t 
                    LEFT JOIN accounts a ON t.to_account_id = a.id 
                    WHERE t.account_id = ?";
            $params = [$_SESSION['user_id']];
            
            if ($typeFilter !== 'all') {
                $sql .= " AND t.transaction_type = ?";
                $params[] = $typeFilter;
            }
            
            if ($statusFilter !== 'all') {
                $sql .= " AND t.status = ?";
                $params[] = $statusFilter;
            }
            
            $sql .= " ORDER BY t.created_at DESC";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode($transactions);
            exit();
            
        case 'get_transaction':
            $transactionId = $_POST['transactionId'] ?? '';
            if ($transactionId) {
                $stmt = $pdo->prepare("SELECT t.*, a.account_name as department 
                                     FROM transactions t 
                                     LEFT JOIN accounts a ON t.to_account_id = a.id 
                                     WHERE t.id = ? AND t.account_id = ?");
                $stmt->execute([$transactionId, $_SESSION['user_id']]);
                $transaction = $stmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode($transaction);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid transaction ID']);
            }
            exit();
            
        case 'get_report_data':
            // Fetch transactions
            $stmt = $pdo->prepare("SELECT t.*, a.account_name as department FROM transactions t LEFT JOIN accounts a ON t.to_account_id = a.id WHERE t.account_id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            // Fetch invoices
            $stmt2 = $pdo->prepare("SELECT * FROM invoices WHERE user_id = ?");
            $stmt2->execute([$_SESSION['user_id']]);
            $invoices = $stmt2->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['transactions' => $transactions, 'invoices' => $invoices]);
            exit();
    }
}

// Get initial transactions for page load
$stmt = $pdo->prepare("SELECT t.*, a.account_name as department 
                      FROM transactions t 
                      LEFT JOIN accounts a ON t.to_account_id = a.id 
                      WHERE t.account_id = ? 
                      ORDER BY t.created_at DESC");
$stmt->execute([$_SESSION['user_id']]);
$transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Transactions</title>
    <link rel="stylesheet" href="css/transactions.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <div class="container">
        <h1>All Transactions</h1>
        
        <div class="filters">
            <div class="filter-group">
                <label for="typeFilter">Type:</label>
                <select id="typeFilter">
                    <option value="all">All Types</option>
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label for="statusFilter">Status:</label>
                <select id="statusFilter">
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                </select>
            </div>
        </div>
        
        <div class="transaction-list">
            <table id="transactionsTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Description</th>
                        <th>Reference</th>
                        <th>To Account</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($transactions)): ?>
                        <tr><td colspan="9" style="text-align:center; color:#888;">No transactions found. <a href='record-transaction.html'>Record your first transaction</a>.</td></tr>
                    <?php endif; ?>
                    <!-- Transactions will be loaded here by JS if available -->
                </tbody>
            </table>
        </div>
    </div>
    
    <script>
        // Pass PHP data to JavaScript
        const initialTransactions = <?php echo json_encode($transactions); ?>;
    </script>
    <script src="js/transactions.js"></script>
</body>
</html>