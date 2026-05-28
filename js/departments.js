// Departments Page JavaScript

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

// Department Actions
const handleViewDepartment = async (departmentId) => {
  const overlay = showLoading();
  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    window.location.href = `department-details.html?id=${departmentId}`;
  } catch (error) {
    showToast(error.message || 'Failed to load department details', 'error');
  } finally {
    hideLoading(overlay);
  }
};

const handleEditDepartment = (departmentId) => {
  window.location.href = `department-form.html?id=${departmentId}`;
};

const handleDeleteDepartment = async (departmentId) => {
  if (!confirm('Are you sure you want to delete this department?')) return;
  
  const overlay = showLoading();
  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    showToast('Department deleted successfully');
    // Refresh the page or remove the department card
    window.location.reload();
  } catch (error) {
    showToast(error.message || 'Failed to delete department', 'error');
  } finally {
    hideLoading(overlay);
  }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Handle department action buttons
  const departmentCards = document.querySelectorAll('.account-card');
  departmentCards.forEach(card => {
    const viewBtn = card.querySelector('[title="View Details"]');
    const editBtn = card.querySelector('[title="Edit Department"]');
    const deleteBtn = card.querySelector('[title="Delete Department"]');
    
    if (viewBtn) {
      viewBtn.addEventListener('click', () => handleViewDepartment(card.dataset.id));
    }
    if (editBtn) {
      editBtn.addEventListener('click', () => handleEditDepartment(card.dataset.id));
    }
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => handleDeleteDepartment(card.dataset.id));
    }
  });
}); 