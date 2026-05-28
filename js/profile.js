document.addEventListener('DOMContentLoaded', function() {
  // Initialize the application
  initApp();
});

function initApp() {
  // Initialize all components
  initCharts();
  initEventListeners();
  loadData();
  
  // Show welcome toast
  showToast('Welcome back! Your dashboard is ready.', 'success');
}

// Chart Instances
let financialChart;
let currentChartPeriod = 'month';

function initCharts() {
  // Financial Overview Chart
  const financialCtx = document.getElementById('financialChart').getContext('2d');
  financialChart = new Chart(financialCtx, {
    type: 'line',
    data: getChartData(currentChartPeriod),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: $${context.raw.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false
          },
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
}

function getChartData(period) {
  let labels, incomeData, expenseData;
  
  switch(period) {
    case 'month':
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      incomeData = [8500, 9200, 7800, 9500, 10200, 11000];
      expenseData = [4500, 5200, 4800, 5500, 6200, 5800];
      break;
    case 'quarter':
      labels = ['Q1', 'Q2', 'Q3', 'Q4'];
      incomeData = [25500, 28700, 31200, 29500];
      expenseData = [14500, 16500, 15800, 14200];
      break;
    case 'year':
      labels = ['2019', '2020', '2021', '2022', '2023'];
      incomeData = [98000, 105000, 112000, 120000, 125000];
      expenseData = [62000, 65000, 68000, 72000, 75000];
      break;
    default:
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      incomeData = [8500, 9200, 7800, 9500, 10200, 11000];
      expenseData = [4500, 5200, 4800, 5500, 6200, 5800];
  }
  
  return {
    labels: labels,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        borderColor: '#4cc9f0',
        backgroundColor: 'rgba(76, 201, 240, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      },
      {
        label: 'Expenses',
        data: expenseData,
        borderColor: '#f72585',
        backgroundColor: 'rgba(247, 37, 133, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }
    ]
  };
}

function updateChartPeriod(period) {
  currentChartPeriod = period;
  financialChart.data = getChartData(period);
  financialChart.update();
  
  // Update active button state
  document.querySelectorAll('.btn-chart-period').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.period === period);
  });
}

function initEventListeners() {
  // Profile picture upload
  document.getElementById('uploadPic').addEventListener('change', handleProfilePictureUpload);
  
  // Edit profile modal
  document.getElementById('editProfileBtn').addEventListener('click', openEditModal);
  document.querySelector('.close-modal').addEventListener('click', closeEditModal);
  document.querySelector('.modal-overlay').addEventListener('click', closeEditModal);
  
  // Form submission
  document.getElementById('profileForm').addEventListener('submit', saveProfileChanges);
  
  // Quick action buttons
  document.getElementById('createInvoiceBtn').addEventListener('click', () => showToast('Create invoice functionality will be implemented', 'info'));
  document.getElementById('recordExpenseBtn').addEventListener('click', () => showToast('Record expense functionality will be implemented', 'info'));
  document.getElementById('generateReportBtn').addEventListener('click', generateReport);
  document.getElementById('sendReminderBtn').addEventListener('click', () => showToast('Send reminder functionality will be implemented', 'info'));
  document.getElementById('taxFilingBtn').addEventListener('click', () => showToast('Tax filing functionality will be implemented', 'info'));
  document.getElementById('clientMeetingBtn').addEventListener('click', () => showToast('Schedule meeting functionality will be implemented', 'info'));
  
  // View all transactions
  document.getElementById('viewAllTransactions').addEventListener('click', () => showToast('View all transactions functionality will be implemented', 'info'));
  
  // Refresh data
  document.getElementById('refreshDataBtn').addEventListener('click', refreshData);
  
  // Chart period buttons
  document.querySelectorAll('.btn-chart-period').forEach(btn => {
    btn.addEventListener('click', function() {
      updateChartPeriod(this.dataset.period);
    });
  });
}

function loadData() {
  // Simulate API call to load data
  setTimeout(() => {
    const data = {
      fullName: 'John Doe',
      email: 'john.doe@financecorp.com',
      phone: '+1 (555) 123-4567',
      position: 'Senior Accountant',
      org: 'FinanceCorp LLC',
      bio: 'Certified Public Accountant with 8+ years of experience in financial management and tax planning.',
      balance: 42850.00,
      paidInvoices: 24,
      pendingInvoices: 5,
      overdueInvoices: 2,
      totalClients: 18,
      taxPaid: 3450.00,
      transactions: [
        { id: 1, title: 'Client Payment - Acme Inc.', date: '2023-06-10', amount: 2500.00, type: 'income', category: 'Payment' },
        { id: 2, title: 'Office Supplies', date: '2023-06-08', amount: 189.50, type: 'expense', category: 'Supplies' },
        { id: 3, title: 'Software Subscription', date: '2023-06-05', amount: 49.99, type: 'expense', category: 'Software' },
        { id: 4, title: 'Consulting Fee - Smith & Co.', date: '2023-06-03', amount: 1200.00, type: 'income', category: 'Consulting' },
        { id: 5, title: 'Tax Payment - Q2 2023', date: '2023-06-01', amount: 1250.00, type: 'expense', category: 'Tax' }
      ],
      deadlines: [
        { id: 1, title: 'Q2 Tax Filing', date: '2023-06-25', status: 'urgent' },
        { id: 2, title: 'Client Meeting - Johnson LLC', date: '2023-06-15', status: 'upcoming' },
        { id: 3, title: 'Invoice Due - Thompson Corp', date: '2023-06-30', status: 'normal' }
      ]
    };
    
    // Update UI with loaded data
    updateProfileInfo(data);
    updateTransactions(data.transactions);
    updateDeadlines(data.deadlines);
    
    // Show success toast
    showToast('Data loaded successfully', 'success');
  }, 800);
}

function updateProfileInfo(data) {
  document.getElementById('userName').textContent = data.fullName;
  document.getElementById('userPosition').textContent = data.position;
  document.getElementById('userEmail').textContent = data.email;
  document.getElementById('userPhone').textContent = data.phone;
  document.getElementById('userOrg').textContent = data.org;
  document.getElementById('userRole').textContent = 'Certified Accountant';
  document.getElementById('memberSince').textContent = 'Jan 2020';
  
  // Update stats
  document.getElementById('totalBalance').textContent = `$${data.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('paidInvoices').textContent = data.paidInvoices;
  document.getElementById('pendingInvoices').textContent = data.pendingInvoices;
  document.getElementById('overdueInvoices').textContent = data.overdueInvoices;
  document.getElementById('totalClients').textContent = data.totalClients;
  document.getElementById('taxPaid').textContent = data.taxPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  // Update form fields
  document.getElementById('fullName').value = data.fullName;
  document.getElementById('email').value = data.email;
  document.getElementById('phone').value = data.phone;
  document.getElementById('position').value = data.position;
  document.getElementById('org').value = data.org;
  document.getElementById('bio').value = data.bio;
}

function updateTransactions(transactions) {
  const transactionsList = document.getElementById('transactionsList');
  transactionsList.innerHTML = '';
  
  transactions.forEach(transaction => {
    const transactionItem = document.createElement('div');
    transactionItem.className = 'transaction-item';
    
    const amountClass = transaction.type === 'income' ? 'positive' : 'negative';
    const formattedAmount = transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    
    transactionItem.innerHTML = `
      <div class="transaction-details">
        <div class="transaction-title">${transaction.title}</div>
        <div class="transaction-meta">
          <span>${formatDate(transaction.date)}</span>
          <span>${transaction.category}</span>
        </div>
      </div>
      <div class="transaction-amount ${amountClass}">${formattedAmount}</div>
    `;
    
    transactionsList.appendChild(transactionItem);
  });
}

function updateDeadlines(deadlines) {
  const deadlinesList = document.getElementById('deadlinesList');
  deadlinesList.innerHTML = '';
  
  deadlines.forEach(deadline => {
    const deadlineItem = document.createElement('div');
    deadlineItem.className = 'deadline-item';
    
    deadlineItem.innerHTML = `
      <div class="deadline-info">
        <div class="deadline-title">${deadline.title}</div>
        <div class="deadline-date">Due ${formatDate(deadline.date)}</div>
      </div>
      <span class="deadline-status ${deadline.status}">${capitalizeFirstLetter(deadline.status)}</span>
    `;
    
    deadlinesList.appendChild(deadlineItem);
  });
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function handleProfilePictureUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('profilePreview').src = e.target.result;
      showToast('Profile picture updated successfully', 'success');
      
      // In a real app, you would upload the image to the server here
      // uploadProfilePicture(file);
    };
    reader.readAsDataURL(file);
  }
}

function openEditModal() {
  document.getElementById('editModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('show');
  document.body.style.overflow = '';
}

function saveProfileChanges(event) {
  event.preventDefault();
  
  // Get form values
  const formData = {
    fullName: document.getElementById('fullName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    position: document.getElementById('position').value,
    org: document.getElementById('org').value,
    bio: document.getElementById('bio').value
  };
  
  // Update profile info
  updateProfileInfo(formData);
  
  // Close modal
  closeEditModal();
  
  // Show success message
  showToast('Profile updated successfully', 'success');
  
  // In a real app, you would send this data to the server
  // saveProfileToServer(formData);
}

function refreshData() {
  showToast('Refreshing data...', 'info');
  
  // Simulate loading
  setTimeout(() => {
    loadData();
  }, 1000);
}

function generateReport() {
  // Initialize jsPDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(67, 97, 238);
  doc.text('Accountant Financial Report', 105, 20, { align: 'center' });
  
  // Add subtitle
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
  
  // Add user info
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Accountant Information:', 14, 45);
  
  doc.setFontSize(12);
  doc.text(`Name: ${document.getElementById('userName').textContent}`, 20, 55);
  doc.text(`Position: ${document.getElementById('userPosition').textContent}`, 20, 65);
  doc.text(`Organization: ${document.getElementById('userOrg').textContent}`, 20, 75);
  
  // Add financial summary
  doc.setFontSize(14);
  doc.text('Financial Summary:', 14, 95);
  
  // Create financial summary table
  doc.autoTable({
    startY: 100,
    head: [['Metric', 'Value']],
    body: [
      ['Total Balance', document.getElementById('totalBalance').textContent],
      ['Paid Invoices', document.getElementById('paidInvoices').textContent],
      ['Pending Invoices', document.getElementById('pendingInvoices').textContent],
      ['Overdue Invoices', document.getElementById('overdueInvoices').textContent],
      ['Total Clients', document.getElementById('totalClients').textContent],
      ['Tax Paid', `$${document.getElementById('taxPaid').textContent}`]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [67, 97, 238],
      textColor: [255, 255, 255]
    }
  });
  
  // Add chart image
  const chartCanvas = document.getElementById('financialChart');
  const chartImage = chartCanvas.toDataURL('image/png');
  doc.addImage(chartImage, 'PNG', 14, doc.autoTable.previous.finalY + 20, 180, 80);
  
  // Save the PDF
  doc.save(`Financial_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  
  showToast('Report generated successfully', 'success');
}

function showToast(message, type) {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? 'fa-check-circle' : 
               type === 'error' ? 'fa-exclamation-circle' :
               type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
  
  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
  `;
  
  toastContainer.appendChild(toast);
  
  // Auto-remove toast after 5 seconds
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 5000);
}

// Utility function to simulate API calls
function simulateApiCall(data, delay = 800) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data });
    }, delay);
  });
}