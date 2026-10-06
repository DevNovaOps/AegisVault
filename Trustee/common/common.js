/**
 * AegisVault Trustee Panel - Common Interactions & UI Handlers
 */

document.addEventListener('DOMContentLoaded', () => {
  if (requireTrusteeAuth()) {
    syncTrusteeUserProfile();
  }
  initMobileSidebar();
  initDropdowns();
  initSearch();
  initModals();
});

function getStoredTrusteeUser() {
  try {
    const raw = localStorage.getItem('aegis_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function requireTrusteeAuth() {
  const user = getStoredTrusteeUser();
  const token = localStorage.getItem('aegis_access_token');
  if (!user && !token) {
    window.location.href = '/AegisVault%20Home/auth.html';
    return false;
  }
  return true;
}

function syncTrusteeUserProfile() {
  const user = getStoredTrusteeUser();
  if (!user) return;

  const name = user.name || (user.email ? user.email.split('@')[0] : 'Trustee');
  const parts = name.trim().split(/\s+/);
  const initials = (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].substring(0, 2)).toUpperCase();

  document.querySelectorAll('.profile-name, .profile-user-fullname, .overview-name').forEach(el => {
    el.textContent = name;
  });
  document.querySelectorAll('.profile-avatar-circle, .avatar-initials, .avatar-text').forEach(el => {
    el.textContent = initials;
  });
  document.querySelectorAll('.profile-email, .user-email').forEach(el => {
    if (user.email) el.textContent = user.email;
  });

  const profLegalName = document.getElementById('profLegalName');
  if (profLegalName && user.name) {
    profLegalName.value = user.name;
  }
}

// Mobile Sidebar Toggle
function initMobileSidebar() {
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const sidebar = document.querySelector('.trustee-sidebar');
  if (!toggleBtn || !sidebar) return;

  // Create overlay if not present
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      backdrop-filter: blur(2px); z-index: 95; display: none;
    `;
    document.body.appendChild(overlay);
  }

  function openSidebar() {
    sidebar.classList.add('mobile-open');
    overlay.style.display = 'block';
  }

  function closeSidebar() {
    sidebar.classList.remove('mobile-open');
    overlay.style.display = 'none';
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (sidebar.classList.contains('mobile-open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  overlay.addEventListener('click', closeSidebar);
}

// Dropdowns (Notifications & Profile)
function initDropdowns() {
  const notificationBtn = document.getElementById('notificationBtn');
  const notificationDropdown = document.getElementById('notificationDropdown');
  const profileBtn = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown');

  function closeAllDropdowns() {
    if (notificationDropdown) notificationDropdown.classList.remove('show');
    if (profileDropdown) profileDropdown.classList.remove('show');
  }

  if (notificationBtn && notificationDropdown) {
    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isShown = notificationDropdown.classList.contains('show');
      closeAllDropdowns();
      if (!isShown) notificationDropdown.classList.add('show');
    });
  }

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isShown = profileDropdown.classList.contains('show');
      closeAllDropdowns();
      if (!isShown) profileDropdown.classList.add('show');
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-panel')) {
      closeAllDropdowns();
    }
  });
}

// Global Search simulation
function initSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      showToast(`Searching for "${searchInput.value.trim()}"...`);
    }
  });
}

// Toast Notifications Helper
window.showToast = function (message, type = 'info') {
  let container = document.querySelector('.trustee-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'trustee-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `trustee-toast ${type}`;
  toast.innerHTML = `
    <span style="display:flex;align-items:center;color:var(--brand-orange)">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="M12 16v-4"/><path d="M12 8h.01"/>
      </svg>
    </span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// Modal Helper
function initModals() {
  // Close buttons
  document.querySelectorAll('[data-modal-close], [data-close-modal], .modal-close, .modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.trustee-modal-backdrop, .modal');
      if (modal) modal.classList.remove('active');
    });
  });

  // Backdrop overlay clicks
  document.querySelectorAll('.trustee-modal-backdrop, .modal').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop || e.target.classList.contains('modal-overlay')) {
        backdrop.classList.remove('active');
      }
    });
  });

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.trustee-modal-backdrop.active, .modal.active').forEach(m => {
        m.classList.remove('active');
      });
    }
  });
}

window.openModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
};

window.closeModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
};

// Universal Trustee Sign Out
window.signOutTrustee = function () {
  if (typeof window.showToast === 'function') {
    window.showToast('Signing out... Redirecting to Authentication Gateway', 'info');
  }

  try {
    const refresh = localStorage.getItem('aegis_refresh_token');
    if (refresh) {
      fetch('/api/v1/auth/logout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      }).catch(() => {});
    }
  } catch (e) {}

  try {
    localStorage.removeItem('aegis_auth_role');
    localStorage.removeItem('aegis_user');
    localStorage.removeItem('aegis_access_token');
    localStorage.removeItem('aegis_refresh_token');
    localStorage.removeItem('aegis_trustee_session');
  } catch (e) {}

  setTimeout(() => {
    window.location.href = '/AegisVault%20Home/auth.html';
  }, 500);
};

// Global Link & Action Interceptors
function initGlobalInterceptors() {
  // Ensure profileDropdown has Sign Out if not already present
  const profileDropdown = document.getElementById('profileDropdown');
  if (profileDropdown && !profileDropdown.textContent.includes('Sign Out')) {
    const divider = document.createElement('div');
    divider.className = 'dropdown-divider';
    divider.style.cssText = 'height: 1px; background: var(--border-subtle, rgba(255,255,255,0.08)); margin: 0.35rem 0;';
    profileDropdown.appendChild(divider);

    const signoutBtn = document.createElement('a');
    signoutBtn.href = 'javascript:void(0)';
    signoutBtn.className = 'dropdown-item';
    signoutBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;vertical-align:middle;">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
      </svg>
      <span>Sign Out</span>
    `;
    signoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.signOutTrustee();
    });
    profileDropdown.appendChild(signoutBtn);
  }

  // Intercept any click on Sign Out or Footer Privacy/Terms
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button');
    if (!target) return;

    const text = target.textContent.trim().toLowerCase();

    // Check for Sign Out
    if (text.includes('sign out') || text === 'sign out') {
      e.preventDefault();
      window.signOutTrustee();
      return;
    }

    // Check for Footer Privacy / Terms links
    const href = target.getAttribute('href');
    if (target.closest('.footer-links, .trustee-footer') || href === '#' || href === 'javascript:void(0)') {
      if (text === 'privacy' || text.includes('privacy policy')) {
        e.preventDefault();
        window.showToast('Privacy Policy: Zero-knowledge protocol with client-side AES-256-GCM encryption.', 'info');
      } else if (text === 'terms' || text.includes('terms of service')) {
        e.preventDefault();
        window.showToast('Terms of Service: Automated cryptographic custody and Shamir quorum conditions apply.', 'info');
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initGlobalInterceptors();
});

