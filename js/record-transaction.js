document.addEventListener('DOMContentLoaded', function() {
    const transactionForm = document.getElementById('transactionForm');
    
    transactionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const transactionType = document.getElementById('transactionType').value;
        const department = document.getElementById('department').value;
        const transactionName = document.getElementById('transactionName').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const dueDate = document.getElementById('dueDate').value;
        const description = document.getElementById('description').value;
        const vendor = document.getElementById('vendor').value;
        
        // Generate a unique transaction ID
        const transactionId = 'TXN-' + Date.now();
        
        // Create transaction object
        const transaction = {
            id: transactionId,
            type: transactionType,
            department,
            name: transactionName,
            amount,
            dueDate,
            description,
            vendor,
            status: 'Pending',
            dateRecorded: new Date().toISOString().split('T')[0]
        };
        
        // Save to localStorage
        let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        // Show success message
        alert('Transaction recorded successfully!');
        
        // Reset form
        transactionForm.reset();
        
        // Optionally redirect to transactions page
        // window.location.href = 'transactions.html';
    });
});