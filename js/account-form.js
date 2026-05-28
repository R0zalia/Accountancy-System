// Account Form JavaScript

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

// Form Handling
const handleAccountForm = async (e) => {
  e.preventDefault();
  const form = e.target;
  const overlay = showLoading();
  
  try {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showToast('Account saved successfully!');
    window.location.href = 'accounts.html';
  } catch (error) {
    showToast(error.message || 'Failed to save account', 'error');
  } finally {
    hideLoading(overlay);
  }
};

// Currency Input Handling
const formatCurrency = (input) => {
  const value = input.value.replace(/[^\d.]/g, '');
  const parts = value.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  input.value = parts.join('.');
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('accountForm');
  const urlParams = new URLSearchParams(window.location.search);
  const isEditMode = urlParams.has('id');

  // If in edit mode, populate form with account data
  if (isEditMode) {
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    const account = accounts.find(acc => acc.id === urlParams.get('id'));
    
    if (account) {
      document.getElementById('accountName').value = account.name;
      document.getElementById('accountType').value = account.type;
      document.getElementById('accountNumber').value = account.number;
      document.getElementById('accountBalance').value = account.balance;
      document.getElementById('accountStatus').value = account.status;
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const accountData = {
      name: formData.get('name'),
      type: formData.get('type'),
      number: formData.get('number'),
      balance: parseFloat(formData.get('balance')),
      status: formData.get('status')
    };

    if (isEditMode) {
      accountData.id = urlParams.get('id');
      accountData.createdAt = urlParams.get('createdAt');
      updateAccount(accountData);
    } else {
      addAccount(accountData);
    }

    // Redirect back to accounts page
    window.location.href = 'accounts.html';
  });

  // Handle currency input
  const balanceInput = document.getElementById('balance');
  if (balanceInput) {
    balanceInput.addEventListener('input', () => formatCurrency(balanceInput));
  }

  // Handle cancel button
  const cancelButton = document.querySelector('.btn-secondary');
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      window.location.href = 'accounts.html';
    });
  }
});

function addAccount(account) {
  const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
  account.id = Date.now().toString();
  account.createdAt = new Date().toISOString();
  accounts.push(account);
  localStorage.setItem('accounts', JSON.stringify(accounts));
}

function updateAccount(account) {
  const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
  const index = accounts.findIndex(acc => acc.id === account.id);
  if (index !== -1) {
    accounts[index] = account;
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }
} 