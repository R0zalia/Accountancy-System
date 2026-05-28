document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('transactionId');
    const transactionInfo = document.getElementById('transactionInfo');
    const transactionIdInput = document.getElementById('transactionId');
    const paymentForm = document.getElementById('paymentForm');
    
    if (!transactionId) {
        alert('No transaction selected for payment. Redirecting to transactions page.');
        window.location.href = 'transactions.html';
        return;
    }
    
    // Load transaction details
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (!transaction) {
        alert('Transaction not found. Redirecting to transactions page.');
        window.location.href = 'transactions.html';
        return;
    }
    
    // Display transaction info
    transactionIdInput.value = transactionId;
    
    const dueDate = new Date(transaction.dueDate);
    const today = new Date();
    const isOverdue = dueDate < today && transaction.status !== 'Paid';
    
    transactionInfo.innerHTML = `
        <h3>${transaction.name}</h3>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Department:</span>
                <span class="info-value">${transaction.department}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Amount Due:</span>
                <span class="info-value">$${transaction.amount.toFixed(2)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Due Date:</span>
                <span class="info-value ${isOverdue ? 'overdue' : ''}">${formatDate(transaction.dueDate)} ${isOverdue ? '(Overdue)' : ''}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Vendor:</span>
                <span class="info-value">${transaction.vendor || 'N/A'}</span>
            </div>
        </div>
    `;
    
    // Set payment amount to full amount by default
    document.getElementById('paymentAmount').value = transaction.amount.toFixed(2);
    // Set payment date to today by default
    document.getElementById('paymentDate').value = today.toISOString().split('T')[0];
    
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
        const paymentDate = document.getElementById('paymentDate').value;
        const paymentMethod = document.getElementById('paymentMethod').value;
        const referenceNumber = document.getElementById('referenceNumber').value;
        const notes = document.getElementById('notes').value;
        
        if (paymentAmount <= 0) {
            alert('Payment amount must be greater than 0');
            return;
        }
        
        // Generate payment ID
        const paymentId = 'PAY-' + Date.now();
        
        // Create payment object
        const payment = {
            id: paymentId,
            transactionId,
            amount: paymentAmount,
            date: paymentDate,
            method: paymentMethod,
            referenceNumber,
            notes,
            recordedDate: new Date().toISOString(),
            department: transaction.department
        };
        
        // Save payment to localStorage
        let payments = JSON.parse(localStorage.getItem('payments')) || [];
        payments.push(payment);
        localStorage.setItem('payments', JSON.stringify(payments));
        
        // Update transaction status if full amount is paid
        if (paymentAmount >= transaction.amount) {
            const transactionIndex = transactions.findIndex(t => t.id === transactionId);
            if (transactionIndex !== -1) {
                transactions[transactionIndex].status = 'Paid';
                localStorage.setItem('transactions', JSON.stringify(transactions));
            }
        }
        
        // Show success message
        alert('Payment recorded successfully!');
        
        // Redirect to payments page
        window.location.href = 'payments.html';
    });
    
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
});