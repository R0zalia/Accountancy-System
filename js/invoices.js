document.addEventListener('DOMContentLoaded', function() {
    const deptFilter = document.getElementById('deptFilter');
    const dateFilter = document.getElementById('dateFilter');
    const invoicesTable = document.getElementById('invoicesTable').getElementsByTagName('tbody')[0];
    
    // Load invoices from localStorage and clean up any orphaned invoices
    let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    invoices = invoices.filter(invoice => checkPaymentExists(invoice.paymentId));
    localStorage.setItem('invoices', JSON.stringify(invoices));
    
    // Display all invoices initially
    displayInvoices(invoices);
    
    // Add event listeners to filters
    deptFilter.addEventListener('change', filterInvoices);
    dateFilter.addEventListener('change', filterInvoices);
    
    function checkPaymentExists(paymentId) {
        const payments = JSON.parse(localStorage.getItem('payments')) || [];
        return payments.some(payment => payment.id === paymentId);
    }
    
    function displayInvoices(invoicesToDisplay) {
        invoicesTable.innerHTML = '';
        
        // Filter out invoices for deleted payments
        invoicesToDisplay = invoicesToDisplay.filter(invoice => checkPaymentExists(invoice.paymentId));
        
        // Update the invoices array and localStorage to remove orphaned invoices
        invoices = invoicesToDisplay;
        localStorage.setItem('invoices', JSON.stringify(invoices));
        
        if (invoicesToDisplay.length === 0) {
            const row = invoicesTable.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 6;
            cell.textContent = 'No invoices found';
            cell.style.textAlign = 'center';
            return;
        }
        
        invoicesToDisplay.forEach(invoice => {
            const row = invoicesTable.insertRow();
            
            row.innerHTML = `
                <td>${invoice.id}</td>
                <td>${invoice.paymentId}</td>
                <td>${invoice.department}</td>
                <td class="amount">$${invoice.amount.toFixed(2)}</td>
                <td>${formatDate(invoice.date)}</td>
                <td class="actions">
                    <button class="btn btn-view" data-id="${invoice.id}"><i class="fas fa-eye"></i> View</button>
                    <button class="btn btn-download" data-id="${invoice.id}"><i class="fas fa-download"></i> PDF</button>
                    <button class="btn btn-delete" data-id="${invoice.id}"><i class="fas fa-trash"></i> Delete</button>
                </td>
            `;
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', function() {
                const invoiceId = this.getAttribute('data-id');
                viewInvoice(invoiceId);
            });
        });
        
        document.querySelectorAll('.btn-download').forEach(btn => {
            btn.addEventListener('click', function() {
                const invoiceId = this.getAttribute('data-id');
                downloadInvoice(invoiceId);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const invoiceId = this.getAttribute('data-id');
                deleteInvoice(invoiceId);
            });
        });
    }
    
    function filterInvoices() {
        const selectedDept = deptFilter.value;
        const selectedDateRange = dateFilter.value;
        
        let filteredInvoices = invoices;
        
        if (selectedDept !== 'all') {
            filteredInvoices = filteredInvoices.filter(i => i.department === selectedDept);
        }
        
        if (selectedDateRange !== 'all') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            filteredInvoices = filteredInvoices.filter(i => {
                const invoiceDate = new Date(i.date);
                
                switch (selectedDateRange) {
                    case 'today':
                        return invoiceDate.toDateString() === today.toDateString();
                    case 'week':
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        return invoiceDate >= weekStart;
                    case 'month':
                        return invoiceDate.getMonth() === today.getMonth() && 
                               invoiceDate.getFullYear() === today.getFullYear();
                    case 'quarter':
                        const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
                        const quarterStart = new Date(today.getFullYear(), quarterStartMonth, 1);
                        return invoiceDate >= quarterStart;
                    case 'year':
                        return invoiceDate.getFullYear() === today.getFullYear();
                    default:
                        return true;
                }
            });
        }
        
        displayInvoices(filteredInvoices);
    }
    
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    function viewInvoice(invoiceId) {
        const invoice = invoices.find(i => i.id === invoiceId);
        if (!invoice) return;
        
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${invoice.id}</title>
                <style>
                    * {
                        box-sizing: border-box;
                        font-family: Arial, sans-serif;
                    }
                    body {
                        margin: 0;
                        padding: 20px;
                        background-color: #f5f5f5;
                    }
                    .invoice-container {
                        max-width: 800px;
                        margin: 0 auto;
                        background-color: white;
                        padding: 30px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    .invoice-header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .invoice-header h1 {
                        margin: 0;
                        color: #333;
                    }
                    .invoice-header h2 {
                        margin: 5px 0 0;
                        color: #666;
                        font-size: 18px;
                    }
                    .invoice-details {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 20px;
                        padding-bottom: 20px;
                        border-bottom: 1px solid #eee;
                    }
                    .invoice-details div {
                        flex: 1;
                    }
                    .invoice-details strong {
                        display: block;
                        margin-bottom: 5px;
                        color: #333;
                    }
                    .invoice-from-to {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 30px;
                    }
                    .invoice-from, .invoice-to {
                        flex: 1;
                        padding: 15px;
                        background-color: #f9f9f9;
                        border-radius: 5px;
                    }
                    .invoice-from h3, .invoice-to h3 {
                        margin-top: 0;
                        border-bottom: 1px solid #ddd;
                        padding-bottom: 10px;
                        color: #333;
                    }
                    .invoice-items {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    .invoice-items th {
                        text-align: left;
                        padding: 10px;
                        background-color: #f5f5f5;
                        border-bottom: 1px solid #ddd;
                    }
                    .invoice-items td {
                        padding: 10px;
                        border-bottom: 1px solid #eee;
                    }
                    .invoice-totals {
                        margin-left: auto;
                        width: 300px;
                    }
                    .invoice-totals table {
                        width: 100%;
                    }
                    .invoice-totals td {
                        padding: 8px;
                    }
                    .invoice-totals td:last-child {
                        text-align: right;
                        font-weight: bold;
                    }
                    .invoice-footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #eee;
                        text-align: center;
                        color: #666;
                    }
                    .invoice-actions {
                        text-align: center;
                        margin-top: 30px;
                    }
                    .btn-print {
                        background-color: #4CAF50;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 16px;
                        margin: 4px 2px;
                        cursor: pointer;
                        border-radius: 5px;
                    }
                    hr {
                        border: 0;
                        height: 1px;
                        background-color: #ddd;
                        margin: 20px 0;
                    }
                    .search-bar {
                        text-align: center;
                        margin: 20px 0;
                        color: #999;
                        font-style: italic;
                    }
                </style>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            </head>
            <body>
                <div class="invoice-container">
                    <div class="invoice-header">
                        <h1>INVOICE</h1>
                        <h2>MARKETING Department</h2>
                    </div>
                    
                    <div class="invoice-details">
                        <div>
                            <strong>Invoice #:</strong> ${invoice.id}
                        </div>
                        <div>
                            <strong>Date:</strong> ${formatDate(invoice.date)}
                        </div>
                        <div>
                            <strong>Payment ID:</strong> ${invoice.paymentId}
                        </div>
                        <div>
                            <strong>Transaction ID:</strong> ${invoice.transactionId || 'N/A'}
                        </div>
                    </div>
                    
                    <hr>
                    
                    <div class="invoice-from-to">
                        <div class="invoice-from">
                            <h3>From:</h3>
                            <p>Company Name<br>
                            123 Business Street<br>
                            City, State 10001<br>
                            Phone: (123) 456-7890<br>
                            Email: accounts@company.com</p>
                        </div>
                        
                        <div class="invoice-to">
                            <h3>To:</h3>
                            <p>${invoice.vendorName || 'Vendor'}<br>
                            ${invoice.vendorAddress || 'Vendor Address'}<br>
                            ${invoice.vendorCityState || 'Vendor City, State'}<br>
                            Reference: ${invoice.reference || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div class="search-bar">
                        Type here to search
                    </div>
                    
                    <hr>
                    
                    <table class="invoice-items">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${invoice.description || 'Payment for JANAN'}</td>
                                <td>$${invoice.amount.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class="invoice-totals">
                        <table>
                            <tr>
                                <td>Subtotal:</td>
                                <td>$${invoice.amount.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Tax (0%):</td>
                                <td>$0.00</td>
                            </tr>
                            <tr>
                                <td><strong>Total:</strong></td>
                                <td><strong>$${invoice.amount.toFixed(2)}</strong></td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="invoice-footer">
                        <p>Payment Method: ${invoice.paymentMethod || 'Cash'} | Paid on ${formatDate(invoice.date)}</p>
                        <p>Thank you for your business!</p>
                    </div>
                    
                    <div class="invoice-actions">
                        <button class="btn-print" onclick="window.print()"><i class="fas fa-print"></i> Print Invoice</button>
                    </div>
                </div>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            </body>
            </html>
        `);
        newWindow.document.close();
    }
    
    function downloadInvoice(invoiceId) {
        const invoice = invoices.find(i => i.id === invoiceId);
        if (!invoice) return;
        
        const element = document.createElement('div');
        element.innerHTML = `
            <style>
                * {
                    box-sizing: border-box;
                    font-family: Arial, sans-serif;
                }
                .invoice-preview {
                    max-width: 800px;
                    background-color: white;
                    padding: 30px;
                }
                .invoice-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .invoice-header h1 {
                    margin: 0;
                    color: #333;
                }
                .invoice-header h2 {
                    margin: 5px 0 0;
                    color: #666;
                    font-size: 18px;
                }
                .invoice-details {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #eee;
                }
                .invoice-details div {
                    flex: 1;
                }
                .invoice-details strong {
                    display: block;
                    margin-bottom: 5px;
                    color: #333;
                }
                .invoice-from-to {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                }
                .invoice-from, .invoice-to {
                    flex: 1;
                    padding: 15px;
                    background-color: #f9f9f9;
                    border-radius: 5px;
                }
                .invoice-from h3, .invoice-to h3 {
                    margin-top: 0;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 10px;
                    color: #333;
                }
                .invoice-items {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                .invoice-items th {
                    text-align: left;
                    padding: 10px;
                    background-color: #f5f5f5;
                    border-bottom: 1px solid #ddd;
                }
                .invoice-items td {
                    padding: 10px;
                    border-bottom: 1px solid #eee;
                }
                .invoice-totals {
                    margin-left: auto;
                    width: 300px;
                }
                .invoice-totals table {
                    width: 100%;
                }
                .invoice-totals td {
                    padding: 8px;
                }
                .invoice-totals td:last-child {
                    text-align: right;
                    font-weight: bold;
                }
                .invoice-footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    text-align: center;
                    color: #666;
                }
                hr {
                    border: 0;
                    height: 1px;
                    background-color: #ddd;
                    margin: 20px 0;
                }
                .search-bar {
                    text-align: center;
                    margin: 20px 0;
                    color: #999;
                    font-style: italic;
                }
            </style>
            <div class="invoice-preview">
                <div class="invoice-header">
                    <h1>INVOICE</h1>
                    <h2>MARKETING Department</h2>
                </div>
                
                <div class="invoice-details">
                    <div>
                        <strong>Invoice #:</strong> ${invoice.id}
                    </div>
                    <div>
                        <strong>Date:</strong> ${formatDate(invoice.date)}
                    </div>
                    <div>
                        <strong>Payment ID:</strong> ${invoice.paymentId}
                    </div>
                    <div>
                        <strong>Transaction ID:</strong> ${invoice.transactionId || 'N/A'}
                    </div>
                </div>
                
                <hr>
                
                <div class="invoice-from-to">
                    <div class="invoice-from">
                        <h3>From:</h3>
                        <p>Company Name<br>
                        123 Business Street<br>
                        City, State 10001<br>
                        Phone: (123) 456-7890<br>
                        Email: accounts@company.com</p>
                    </div>
                    
                    <div class="invoice-to">
                        <h3>To:</h3>
                        <p>${invoice.vendorName || 'Vendor'}<br>
                        ${invoice.vendorAddress || 'Vendor Address'}<br>
                        ${invoice.vendorCityState || 'Vendor City, State'}<br>
                        Reference: ${invoice.reference || 'N/A'}</p>
                    </div>
                </div>
                
                <div class="search-bar">
                    Type here to search
                </div>
                
                <hr>
                
                <table class="invoice-items">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${invoice.description || 'Payment for JANAN'}</td>
                            <td>$${invoice.amount.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="invoice-totals">
                    <table>
                        <tr>
                            <td>Subtotal:</td>
                            <td>$${invoice.amount.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Tax (0%):</td>
                            <td>$0.00</td>
                        </tr>
                        <tr>
                            <td><strong>Total:</strong></td>
                            <td><strong>$${invoice.amount.toFixed(2)}</strong></td>
                        </tr>
                    </table>
                </div>
                
                <div class="invoice-footer">
                    <p>Payment Method: ${invoice.paymentMethod || 'Cash'} | Paid on ${formatDate(invoice.date)}</p>
                    <p>Thank you for your business!</p>
                </div>
            </div>
        `;
        
        const opt = {
            margin: 10,
            filename: `invoice_${invoice.id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().from(element).set(opt).save();
    }
    
    function deleteInvoice(invoiceId) {
        if (confirm('Are you sure you want to permanently delete this invoice?')) {
            // Find the invoice index
            const invoiceIndex = invoices.findIndex(i => i.id === invoiceId);
            
            if (invoiceIndex === -1) {
                alert('Invoice not found!');
                return;
            }
            
            // Remove the invoice from the array
            invoices.splice(invoiceIndex, 1);
            
            // Update localStorage
            localStorage.setItem('invoices', JSON.stringify(invoices));
            
            // Refresh the display
            filterInvoices();
        }
    }
});