document.addEventListener('DOMContentLoaded', function() {
    const deptFilter = document.getElementById('deptFilter');
    const dateFilter = document.getElementById('dateFilter');
    const paymentsTable = document.getElementById('paymentsTable').getElementsByTagName('tbody')[0];
    
    // Load payments from localStorage
    let payments = JSON.parse(localStorage.getItem('payments')) || [];
    // Load transactions for reference
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Display all payments initially
    displayPayments(payments);
    
    // Add event listeners to filters
    deptFilter.addEventListener('change', filterPayments);
    dateFilter.addEventListener('change', filterPayments);
    
    function displayPayments(paymentsToDisplay) {
        paymentsTable.innerHTML = '';
        
        if (paymentsToDisplay.length === 0) {
            const row = paymentsTable.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 7;
            cell.textContent = 'No payments found';
            cell.style.textAlign = 'center';
            return;
        }
        
        paymentsToDisplay.forEach(payment => {
            const row = paymentsTable.insertRow();
            
            // Find the related transaction
            const transaction = transactions.find(t => t.id === payment.transactionId);
            const transactionName = transaction ? transaction.name : 'Unknown Transaction';
            
            row.innerHTML = `
                <td>${payment.id}</td>
                <td>${transactionName}</td>
                <td>${payment.department}</td>
                <td>$${payment.amount.toFixed(2)}</td>
                <td>${formatDate(payment.date)}</td>
                <td><span class="method">${payment.method}</span></td>
                <td class="actions">
                    <button class="btn btn-invoice" data-id="${payment.id}"><i class="fas fa-file-invoice"></i> Invoice</button>
                    <button class="btn btn-view" data-id="${payment.id}"><i class="fas fa-eye"></i> View</button>
                    <button class="btn btn-delete" data-id="${payment.id}"><i class="fas fa-trash"></i> Delete</button>
                </td>
            `;
        });
        
        // Add event listeners to buttons
        addButtonEventListeners();
    }
    
    function addButtonEventListeners() {
        document.querySelectorAll('.btn-invoice').forEach(btn => {
            btn.addEventListener('click', function() {
                const paymentId = this.getAttribute('data-id');
                window.location.href = `generate-invoice.html?paymentId=${paymentId}`;
            });
        });
        
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', function() {
                const paymentId = this.getAttribute('data-id');
                viewPaymentDetails(paymentId);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const paymentId = this.getAttribute('data-id');
                deletePayment(paymentId);
            });
        });
    }
    
    function filterPayments() {
        const selectedDept = deptFilter.value;
        const selectedDateRange = dateFilter.value;
        
        let filteredPayments = payments;
        
        if (selectedDept !== 'all') {
            filteredPayments = filteredPayments.filter(p => p.department === selectedDept);
        }
        
        if (selectedDateRange !== 'all') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            filteredPayments = filteredPayments.filter(p => {
                const paymentDate = new Date(p.date);
                
                switch (selectedDateRange) {
                    case 'today':
                        return paymentDate.toDateString() === today.toDateString();
                    case 'week':
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        return paymentDate >= weekStart;
                    case 'month':
                        return paymentDate.getMonth() === today.getMonth() && 
                               paymentDate.getFullYear() === today.getFullYear();
                    case 'quarter':
                        const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
                        const quarterStart = new Date(today.getFullYear(), quarterStartMonth, 1);
                        return paymentDate >= quarterStart;
                    case 'year':
                        return paymentDate.getFullYear() === today.getFullYear();
                    default:
                        return true;
                }
            });
        }
        
        displayPayments(filteredPayments);
    }
    
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    function viewPaymentDetails(paymentId) {
        const payment = payments.find(p => p.id === paymentId);
        if (!payment) return;
        
        const transaction = transactions.find(t => t.id === payment.transactionId);
        
        alert(
            `Payment Details:\n\n` +
            `Payment ID: ${payment.id}\n` +
            `Transaction: ${transaction ? transaction.name : 'Unknown'}\n` +
            `Department: ${payment.department}\n` +
            `Amount: $${payment.amount.toFixed(2)}\n` +
            `Date: ${formatDate(payment.date)}\n` +
            `Method: ${payment.method}\n` +
            `Reference: ${payment.referenceNumber || 'N/A'}\n` +
            `Notes: ${payment.notes || 'N/A'}`
        );
    }
    
    function deletePayment(paymentId) {
        if (confirm('Are you sure you want to permanently delete this payment record?')) {
            // Find the payment index
            const paymentIndex = payments.findIndex(p => p.id === paymentId);
            
            if (paymentIndex === -1) {
                alert('Payment not found!');
                return;
            }
            
            // Remove the payment from the array
            payments.splice(paymentIndex, 1);
            
            // Update localStorage
            localStorage.setItem('payments', JSON.stringify(payments));
            
            // Also delete any invoices associated with this payment
            deleteInvoicesForPayment(paymentId);
            
            // Refresh the display
            filterPayments();
        }
    }
    
    function deleteInvoicesForPayment(paymentId) {
        let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        // Filter out invoices for this payment
        invoices = invoices.filter(invoice => invoice.paymentId !== paymentId);
        localStorage.setItem('invoices', JSON.stringify(invoices));
    }
});