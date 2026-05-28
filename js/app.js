// Utility Functions
const showToast = (message, type = 'success') => {
  const toast = document.createElement('div');
  toast.className = `toast ${type} animate__animated animate__fadeInUp`;
  toast.innerHTML = `
    <i class="ri-${type === 'success' ? 'check' : type === 'error' ? 'close' : 'alert'}-circle-fill"></i>
    <span>${message}</span>
    <button class="toast-close"><i class="ri-close-line"></i></button>
  `;
  
  const container = document.querySelector('.toast-container') || (() => {
    const div = document.createElement('div');
    div.className = 'toast-container';
    document.body.appendChild(div);
    return div;
  })();
  
  container.appendChild(toast);
  
  // Auto remove after 5 seconds
  const timer = setTimeout(() => {
    toast.classList.add('animate__fadeOut');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
  
  // Manual close
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(timer);
    toast.classList.add('animate__fadeOut');
    setTimeout(() => toast.remove(), 300);
  });
};

const showLoading = () => {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay animate__animated animate__fadeIn';
  overlay.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
};

const hideLoading = (overlay) => {
  if (overlay) {
    overlay.classList.add('animate__fadeOut');
    setTimeout(() => overlay.remove(), 300);
  }
};

// Dashboard Data Loading
const loadDashboardData = async () => {
  const overlay = showLoading();
  
  try {
    // Simulate API calls with mock data
    const [transactions, invoices] = await Promise.all([
      new Promise(resolve => setTimeout(() => resolve({
        data: [
          {
            id: 1,
            date: '2023-06-15',
            description: 'Website Redesign',
            category: 'Design',
            amount: 4500,
            status: 'Completed'
          },
          {
            id: 2,
            date: '2023-06-14',
            description: 'Office Supplies',
            category: 'Supplies',
            amount: 320.50,
            status: 'Completed'
          },
          {
            id: 3,
            date: '2023-06-12',
            description: 'Marketing Campaign',
            category: 'Marketing',
            amount: 1800,
            status: 'Pending'
          },
          {
            id: 4,
            date: '2023-06-10',
            description: 'Software Subscription',
            category: 'Technology',
            amount: 99.99,
            status: 'Failed'
          },
          {
            id: 5,
            date: '2023-06-08',
            description: 'Consulting Fees',
            category: 'Services',
            amount: 2500,
            status: 'Completed'
          }
        ]
      }), 800)),
      new Promise(resolve => setTimeout(() => resolve({
        data: [
          {
            id: 'INV-2023-001',
            client: 'Acme Corp',
            amount: 5200,
            dueDate: '2023-06-20',
            status: 'Pending'
          },
          {
            id: 'INV-2023-002',
            client: 'Globex Inc',
            amount: 3200,
            dueDate: '2023-06-18',
            status: 'Pending'
          },
          {
            id: 'INV-2023-003',
            client: 'Wayne Enterprises',
            amount: 7850,
            dueDate: '2023-06-25',
            status: 'Pending'
          },
          {
            id: 'INV-2023-004',
            client: 'Stark Industries',
            amount: 12500,
            dueDate: '2023-06-30',
            status: 'Pending'
          }
        ]
      }), 1000))
    ]);
    
    // Update transactions table
    const transactionsTable = document.getElementById('recentTransactions');
    if (transactionsTable) {
      transactionsTable.innerHTML = transactions.data.map(t => `
        <tr>
          <td>${new Date(t.date).toLocaleDateString()}</td>
          <td>
            <div class="transaction-desc">${t.description}</div>
            <div class="transaction-category">${t.category}</div>
          </td>
          <td>$${t.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
          <td><span class="status-badge ${t.status.toLowerCase()}">${t.status}</span></td>
        </tr>
      `).join('');
    }
    
    // Update invoices table
    const invoicesTable = document.getElementById('pendingInvoices');
    if (invoicesTable) {
      invoicesTable.innerHTML = invoices.data.map(i => `
        <tr>
          <td>${i.id}</td>
          <td>${i.client}</td>
          <td>$${i.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
          <td>${new Date(i.dueDate).toLocaleDateString()}</td>
          <td>
            <button class="btn-icon" title="Send Reminder">
              <i class="ri-mail-send-line"></i>
            </button>
            <button class="btn-icon" title="View Invoice">
              <i class="ri-eye-line"></i>
            </button>
          </td>
        </tr>
      `).join('');
    }
    
    hideLoading(overlay);
    showToast('Dashboard data loaded successfully');
  } catch (error) {
    hideLoading(overlay);
    showToast('Failed to load dashboard data', 'error');
    console.error('Error loading dashboard data:', error);
  }
};

// Initialize navbar functionality
const initNavbar = () => {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
  
  // Set active nav item
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
};

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Load dashboard data
  if (typeof loadDashboardData === 'function') {
    loadDashboardData();
  }
  
  // Initialize any other components
  if (typeof initNavbar === 'function') {
    initNavbar();
  }
});