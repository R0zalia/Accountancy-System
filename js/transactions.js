document.addEventListener('DOMContentLoaded', function() {
    const typeFilter = document.getElementById('typeFilter');
    const deptFilter = document.getElementById('deptFilter');
    const statusFilter = document.getElementById('statusFilter');
    const transactionsTable = document.getElementById('transactionsTable').getElementsByTagName('tbody')[0];
    
    // Load transactions from localStorage
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Display all transactions initially
    displayTransactions(transactions);
    
    // Add event listeners to filters
    typeFilter.addEventListener('change', filterTransactions);
    deptFilter.addEventListener('change', filterTransactions);
    statusFilter.addEventListener('change', filterTransactions);
    
    function displayTransactions(transactionsToDisplay) {
        transactionsTable.innerHTML = '';
        
        if (transactionsToDisplay.length === 0) {
            const row = transactionsTable.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 8;
            cell.textContent = 'No transactions found';
            cell.style.textAlign = 'center';
            return;
        }
        
        transactionsToDisplay.forEach(transaction => {
            const row = transactionsTable.insertRow();
            
            // Determine status class
            let statusClass = 'status-pending';
            if (transaction.status === 'Paid') {
                statusClass = 'status-paid';
            } else if (new Date(transaction.dueDate) < new Date() && transaction.status !== 'Paid') {
                statusClass = 'status-overdue';
                transaction.status = 'Overdue';
            }
            
            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>${transaction.type}</td>
                <td>${transaction.name}</td>
                <td>${transaction.department}</td>
                <td>$${transaction.amount.toFixed(2)}</td>
                <td>${formatDate(transaction.dueDate)}</td>
                <td><span class="status ${statusClass}">${transaction.status}</span></td>
                <td class="actions">
                    ${transaction.status !== 'Paid' ? `<button class="btn btn-pay" data-id="${transaction.id}"><i class="fas fa-money-bill-wave"></i> Pay</button>` : ''}
                    <button class="btn btn-view" data-id="${transaction.id}"><i class="fas fa-eye"></i> View</button>
                    <button class="btn btn-delete" data-id="${transaction.id}"><i class="fas fa-trash-alt"></i> Delete</button>
                </td>
            `;
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.btn-pay').forEach(btn => {
            btn.addEventListener('click', function() {
                const transactionId = this.getAttribute('data-id');
                // Redirect to record payment page with transaction ID
                window.location.href = `record-payment.html?transactionId=${transactionId}`;
            });
        });
        
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', function() {
                const transactionId = this.getAttribute('data-id');
                viewTransactionDetails(transactionId);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const transactionId = this.getAttribute('data-id');
                deleteTransaction(transactionId);
            });
        });
    }
    
    function deleteTransaction(transactionId) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            // Filter out the transaction to be deleted
            transactions = transactions.filter(transaction => transaction.id !== transactionId);
            
            // Update localStorage
            localStorage.setItem('transactions', JSON.stringify(transactions));
            
            // Refresh the displayed transactions
            filterTransactions();
        }
    }
    
    function filterTransactions() {
        const selectedType = typeFilter.value;
        const selectedDept = deptFilter.value;
        const selectedStatus = statusFilter.value;
        
        let filteredTransactions = transactions;
        
        if (selectedType !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.type === selectedType);
        }
        
        if (selectedDept !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.department === selectedDept);
        }
        
        if (selectedStatus !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => {
                if (selectedStatus === 'Overdue') {
                    return new Date(t.dueDate) < new Date() && t.status !== 'Paid';
                }
                return t.status === selectedStatus;
            });
        }
        
        displayTransactions(filteredTransactions);
    }
    
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    function viewTransactionDetails(transactionId) {
        const transaction = transactions.find(t => t.id === transactionId);
        if (transaction) {
            alert(
                `Transaction Details:\n\n` +
                `ID: ${transaction.id}\n` +
                `Type: ${transaction.type}\n` +
                `Name: ${transaction.name}\n` +
                `Department: ${transaction.department}\n` +
                `Amount: $${transaction.amount.toFixed(2)}\n` +
                `Due Date: ${formatDate(transaction.dueDate)}\n` +
                `Status: ${transaction.status}\n` +
                `Vendor: ${transaction.vendor || 'N/A'}\n` +
                `Description: ${transaction.description || 'N/A'}`
            );
        }
    }
});