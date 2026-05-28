document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('paymentId');
    const invoicePreview = document.getElementById('invoicePreview');
    const btnDownload = document.getElementById('btnDownload');
    const btnPrint = document.getElementById('btnPrint');
    const btnSave = document.getElementById('btnSave');
    
    if (!paymentId) {
        alert('No payment selected for invoice. Redirecting to payments page.');
        window.location.href = 'payments.html';
        return;
    }
    
    // Load payment and transaction details
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    const payment = payments.find(p => p.id === paymentId);
    
    if (!payment) {
        alert('Payment not found. Redirecting to payments page.');
        window.location.href = 'payments.html';
        return;
    }
    
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const transaction = transactions.find(t => t.id === payment.transactionId);
    
    // Generate invoice number
    const invoiceNumber = 'INV-' + Date.now();
    const invoiceDate = new Date().toISOString().split('T')[0];
    
    // Display invoice preview
    invoicePreview.innerHTML = `
        <div class="invoice-header">
            <div class="invoice-title">
                <h2>INVOICE</h2>
                <p>${payment.department} Department</p>
            </div>
            <div class="invoice-info">
                <div><strong>Invoice #:</strong> ${invoiceNumber}</div>
                <div><strong>Date:</strong> ${formatDate(invoiceDate)}</div>
                <div><strong>Payment ID:</strong> ${payment.id}</div>
                <div><strong>Transaction ID:</strong> ${payment.transactionId}</div>
            </div>
        </div>
        
        <div class="invoice-body">
            <div class="invoice-from-to">
                <div class="invoice-from">
                    <h3>From:</h3>
                    <p>Company Name</p>
                    <p>123 Business Street</p>
                    <p>City, State 10001</p>
                    <p>Phone: (123) 456-7890</p>
                    <p>Email: accounts@company.com</p>
                </div>
                <div class="invoice-to">
                    <h3>To:</h3>
                    <p>${transaction ? transaction.vendor : 'Vendor Name'}</p>
                    <p>Vendor Address</p>
                    <p>Vendor City, State</p>
                    <p>Reference: ${payment.referenceNumber || 'N/A'}</p>
                </div>
            </div>
            
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Payment for ${transaction ? transaction.name : 'Transaction'}</td>
                        <td>$${payment.amount.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="invoice-totals">
                <table>
                    <tr>
                        <td>Subtotal:</td>
                        <td>$${payment.amount.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Tax (0%):</td>
                        <td>$0.00</td>
                    </tr>
                    <tr>
                        <td>Total:</td>
                        <td>$${payment.amount.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
            
            <div class="invoice-footer">
                <p>Payment Method: ${payment.method} | Paid on ${formatDate(payment.date)}</p>
                <p>Thank you for your business!</p>
            </div>
        </div>
    `;
    
    // Download as PDF
    btnDownload.addEventListener('click', function() {
        const element = invoicePreview;
        const opt = {
            margin: 10,
            filename: `invoice_${invoiceNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().from(element).set(opt).save();
    });
    
    // Print invoice
    btnPrint.addEventListener('click', function() {
        window.print();
    });
    
    // Save invoice to localStorage
    btnSave.addEventListener('click', function() {
        const invoice = {
            id: invoiceNumber,
            paymentId,
            date: invoiceDate,
            amount: payment.amount,
            department: payment.department,
            html: invoicePreview.innerHTML
        };
        
        let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        invoices.push(invoice);
        localStorage.setItem('invoices', JSON.stringify(invoices));
        
        alert('Invoice saved successfully!');
        window.location.href = 'invoices.html';
    });
    
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
});