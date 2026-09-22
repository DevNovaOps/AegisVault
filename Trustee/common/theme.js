/**
 * AegisVault Trustee Panel - Theme Controller
 * Supports persistent Dark / Light modes with zero-flash initialization
 */

(function () {
  const STORAGE_KEY = 'aegis_trustee_theme';

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // Default to dark as per AegisVault primary aesthetic
    return 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.remove('theme-dark', 'theme-light');
    document.documentElement.classList.add(`theme-${theme}`);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update toggle button accessibility states
    const toggleBtns = document.querySelectorAll('[data-theme-toggle], #themeToggleBtn, .theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
      btn.setAttribute('title', theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
    });

    // Dispatch custom event for dynamic components
    window.dispatchEvent(new CustomEvent('aegis-theme-changed', { detail: { theme } }));
  }

  // Immediate execution before DOMContentLoaded to prevent theme flash
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  // Expose globally
  window.AegisTheme = {
    getTheme: () => document.documentElement.getAttribute('data-theme') || 'dark',
    setTheme: applyTheme,
    toggleTheme: () => {
      const current = window.AegisTheme.getTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    }
  };

  // Bind toggle buttons on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtns = document.querySelectorAll('[data-theme-toggle], #themeToggleBtn, .theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.setAttribute('aria-checked', window.AegisTheme.getTheme() === 'dark' ? 'true' : 'false');
      btn.setAttribute('title', window.AegisTheme.getTheme() === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.AegisTheme.toggleTheme();
      });
    });
  });
})();
