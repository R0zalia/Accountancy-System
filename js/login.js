// Login Page JavaScript

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
const handleLogin = async (e) => {
  e.preventDefault();
  const form = e.target;
  const overlay = showLoading();
  
  try {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showToast('Login successful!');
    window.location.href = 'index.html';
  } catch (error) {
    showToast(error.message || 'Login failed', 'error');
  } finally {
    hideLoading(overlay);
  }
};

// Password Toggle
const togglePassword = (button) => {
  const input = button.previousElementSibling;
  const type = input.type === 'password' ? 'text' : 'password';
  input.type = type;
  button.innerHTML = `<i class="fas fa-${type === 'password' ? 'eye' : 'eye-slash'}"></i>`;
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Handle login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Handle password toggle
  const passwordToggle = document.querySelector('.password-toggle');
  if (passwordToggle) {
    passwordToggle.addEventListener('click', () => togglePassword(passwordToggle));
  }
}); 