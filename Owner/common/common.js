/**
 * AegisVault Owner Panel — Master Common Script
 * Version: 1.0.0
 * Handles:
 *  - Theme switching (Light / Dark) with zero-flash localStorage persistence
 *  - Mobile sidebar drawer toggling
 *  - Profile dropdown menu
 *  - Global toast notification manager
 *  - Generic modal open / close listeners
 *  - Navigation helpers
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Zero-Flash Theme Controller
  // --------------------------------------------------------------------------
  const THEME_KEY = 'aegis_owner_theme';

  function getStoredTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {
      // localStorage disabled or private browsing
    }
    const docTheme = document.documentElement.getAttribute('data-theme');
    if (docTheme === 'dark' || docTheme === 'light') return docTheme;
    return 'dark'; // Default AegisVault theme
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}

    // Update toggle states if present in DOM
    const themeBtns = document.querySelectorAll('#themeToggleBtn, .theme-toggle-btn');
    themeBtns.forEach(btn => {
      btn.setAttribute('title', theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
      btn.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
      
      const sunIcon = btn.querySelector('.sun-icon');
      const moonIcon = btn.querySelector('.moon-icon');
      if (sunIcon && moonIcon) {
        if (theme === 'dark') {
          sunIcon.style.display = 'none';
          moonIcon.style.display = 'block';
        } else {
          sunIcon.style.display = 'block';
          moonIcon.style.display = 'none';
        }
      }
    });

    // Dispatch event for module-level reactive elements (e.g. charts)
    window.dispatchEvent(new CustomEvent('aegis-theme-changed', { detail: { theme } }));
  }

  // Run immediate application before render to eliminate FOUC
  const initialTheme = getStoredTheme();
  applyTheme(initialTheme);

  // Expose global AegisOwner helper
  window.AegisOwner = {
    getTheme: () => document.documentElement.getAttribute('data-theme') || 'dark',
    setTheme: applyTheme,
    toggleTheme: () => {
      const current = window.AegisOwner.getTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    },
    showToast: (message, type = 'info') => {
      let container = document.querySelector('.toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
      }
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.innerHTML = `<span>${message}</span>`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 250);
      }, 3500);
    },
    openModal: (modalId) => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
      }
    },
    closeModal: (modalId) => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
      }
    }
  };

  // --------------------------------------------------------------------------
  // 2. DOM Ready Bindings
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    // Re-verify icon state
    applyTheme(window.AegisOwner.getTheme());

    // Bind Theme Toggle Button
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.AegisOwner.toggleTheme();
      });
    }

    // Bind Sidebar Mobile Drawer
    const sidebarToggle = document.getElementById('sidebarToggleBtn');
    const sidebar = document.querySelector('.owner-sidebar');
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });

      // Close when clicking outside on mobile
      document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('mobile-open') &&
            !sidebar.contains(e.target) &&
            !sidebarToggle.contains(e.target)) {
          sidebar.classList.remove('mobile-open');
        }
      });
    }

    // Bind Profile Dropdown
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const profileWrapper = document.querySelector('.profile-menu-wrapper');
    if (profileBtn && profileDropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
        if (profileWrapper) profileWrapper.classList.toggle('active');
      });

      document.addEventListener('click', (e) => {
        if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
          profileDropdown.classList.remove('show');
          if (profileWrapper) profileWrapper.classList.remove('active');
        }
      });
    }

    // Modal Close Buttons (data-modal-close)
    document.querySelectorAll('[data-modal-close]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const overlay = e.target.closest('.modal-overlay');
        if (overlay) {
          overlay.classList.remove('show');
          document.body.style.overflow = '';
        }
      });
    });

    // Close modal on background overlay click
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('show');
          document.body.style.overflow = '';
        }
      });
    });
  });
})();
