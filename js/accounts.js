// Accounts Page JavaScript

// Utility Functions
const showToast = (message, type = 'success') => {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="ri-${type === 'success' ? 'check' : type === 'error' ? 'close' : 'alert'}-circle-line"></i>
    <span>${message}</span>
  `;
  
  const container = document.querySelector('.toast-container') || (() => {
    const div = document.createElement('div');
    div.className = 'toast-container';
    document.body.appendChild(div);
    return div;
  })();
  
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
};

const showLoading = () => {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(overlay);
  return overlay;
};

const hideLoading = (overlay) => {
  overlay?.remove();
};

// Account Actions
const handleViewAccount = async (accountId) => {
  const overlay = showLoading();
  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    window.location.href = `account-details.html?id=${accountId}`;
  } catch (error) {
    showToast(error.message || 'Failed to load account details', 'error');
  } finally {
    hideLoading(overlay);
  }
};

const handleEditAccount = (accountId) => {
  window.location.href = `account-form.html?id=${accountId}`;
};

const handleDeleteAccount = async (accountId) => {
  if (!confirm('Are you sure you want to delete this account?')) return;
  
  const overlay = showLoading();
  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    showToast('Account deleted successfully');
    // Refresh the page or remove the account card
    window.location.reload();
  } catch (error) {
    showToast(error.message || 'Failed to delete account', 'error');
  } finally {
    hideLoading(overlay);
  }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Handle account action buttons
  const accountCards = document.querySelectorAll('.account-card');
  accountCards.forEach(card => {
    const viewBtn = card.querySelector('[title="View Details"]');
    const editBtn = card.querySelector('[title="Edit Account"]');
    const deleteBtn = card.querySelector('[title="Delete Account"]');
    
    if (viewBtn) {
      viewBtn.addEventListener('click', () => handleViewAccount(card.dataset.id));
    }
    if (editBtn) {
      editBtn.addEventListener('click', () => handleEditAccount(card.dataset.id));
    }
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => handleDeleteAccount(card.dataset.id));
    }
  });
});

// Account Management System
class AccountManager {
  constructor() {
    this.accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    this.init();
  }

  init() {
    // Initialize event listeners
    this.loadAccounts();
    this.setupEventListeners();
  }

  loadAccounts() {
    const accountsList = document.querySelector('.accounts-list');
    if (!accountsList) return;

    // Update total balance
    const totalBalance = this.accounts.reduce((sum, account) => sum + account.balance, 0);
    const savingsBalance = this.accounts
      .filter(account => account.type === 'Savings')
      .reduce((sum, account) => sum + account.balance, 0);
    const checkingBalance = this.accounts
      .filter(account => account.type === 'Checking')
      .reduce((sum, account) => sum + account.balance, 0);

    // Update summary cards
    document.querySelector('.summary-card:nth-child(1) .amount').textContent = `$${totalBalance.toFixed(2)}`;
    document.querySelector('.summary-card:nth-child(2) .amount').textContent = `$${savingsBalance.toFixed(2)}`;
    document.querySelector('.summary-card:nth-child(3) .amount').textContent = `$${checkingBalance.toFixed(2)}`;

    // Clear existing accounts
    accountsList.innerHTML = '';

    // Add each account to the list
    this.accounts.forEach(account => {
      const accountCard = this.createAccountCard(account);
      accountsList.appendChild(accountCard);
    });
  }

  createAccountCard(account) {
    const card = document.createElement('div');
    card.className = 'account-card';
    card.dataset.accountId = account.id;

    card.innerHTML = `
      <div class="account-info">
        <div class="account-type">
          <i class="ri-${account.type === 'Savings' ? 'bank' : 'bank-card'}-line"></i>
          <span>${account.type} Account</span>
        </div>
        <h3>${account.name}</h3>
        <p class="account-number">**** ${account.number.slice(-4)}</p>
      </div>
      <div class="account-balance">
        <p class="amount">$${account.balance.toFixed(2)}</p>
        <span class="status ${account.status.toLowerCase()}">${account.status}</span>
      </div>
      <div class="account-actions">
        <button class="btn btn-icon view-details" title="View Details">
          <i class="ri-eye-line"></i>
        </button>
        <button class="btn btn-icon edit-account" title="Edit Account">
          <i class="ri-edit-line"></i>
        </button>
        <button class="btn btn-icon delete-account" title="Delete Account">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>
    `;

    return card;
  }

  setupEventListeners() {
    const accountsList = document.querySelector('.accounts-list');
    if (!accountsList) return;

    // Event delegation for account actions
    accountsList.addEventListener('click', (e) => {
      const accountCard = e.target.closest('.account-card');
      if (!accountCard) return;

      const accountId = accountCard.dataset.accountId;
      const account = this.accounts.find(acc => acc.id === accountId);

      if (e.target.closest('.view-details')) {
        this.viewAccountDetails(account);
      } else if (e.target.closest('.edit-account')) {
        this.editAccount(account);
      } else if (e.target.closest('.delete-account')) {
        this.deleteAccount(account);
      }
    });
  }

  viewAccountDetails(account) {
    // Create modal for account details
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Account Details</h2>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-item">
            <label>Account Name:</label>
            <span>${account.name}</span>
          </div>
          <div class="detail-item">
            <label>Account Type:</label>
            <span>${account.type}</span>
          </div>
          <div class="detail-item">
            <label>Account Number:</label>
            <span>${account.number}</span>
          </div>
          <div class="detail-item">
            <label>Balance:</label>
            <span>$${account.balance.toFixed(2)}</span>
          </div>
          <div class="detail-item">
            <label>Status:</label>
            <span>${account.status}</span>
          </div>
          <div class="detail-item">
            <label>Created Date:</label>
            <span>${new Date(account.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.classList.add('active');

    // Close modal functionality
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    };

    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
      }
    };
  }

  editAccount(account) {
    // Redirect to account form with account data
    const params = new URLSearchParams(account);
    window.location.href = `account-form.html?${params.toString()}`;
  }

  deleteAccount(account) {
    if (confirm(`Are you sure you want to delete the account "${account.name}"?`)) {
      this.accounts = this.accounts.filter(acc => acc.id !== account.id);
      localStorage.setItem('accounts', JSON.stringify(this.accounts));
      this.loadAccounts();
    }
  }

  addAccount(account) {
    account.id = Date.now().toString();
    account.createdAt = new Date().toISOString();
    this.accounts.push(account);
    localStorage.setItem('accounts', JSON.stringify(this.accounts));
    this.loadAccounts();
  }

  updateAccount(updatedAccount) {
    const index = this.accounts.findIndex(acc => acc.id === updatedAccount.id);
    if (index !== -1) {
      this.accounts[index] = updatedAccount;
      localStorage.setItem('accounts', JSON.stringify(this.accounts));
      this.loadAccounts();
    }
  }
}

// Initialize account manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AccountManager();
}); 