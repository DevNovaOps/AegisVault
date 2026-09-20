/**
 * AegisVault — Main Application Controller
 * Handles application lifecycle, theme persistence, and asset switching.
 */

(function () {
    'use strict';

    const THEME_STORAGE_KEY = 'aegisvault_theme';
    const THEME_DARK = 'dark';
    const THEME_LIGHT = 'light';

    const HERO_BG_DARK = 'assets/hero-dark.png';
    const HERO_BG_LIGHT = 'assets/hero-light.png';

    // DOM Elements
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    const themeToggleBtn = document.getElementById('theme-toggle');

    /**
     * Get user's preferred theme from localStorage or system preference
     * Default to 'dark' matching the primary reference design.
     */
    function getInitialTheme() {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === THEME_LIGHT || savedTheme === THEME_DARK) {
            return savedTheme;
        }
        return THEME_DARK;
    }

    /**
     * Apply theme to the document. Seamless background cross-fade is handled via CSS.
     * @param {string} theme - 'dark' or 'light'
     */
    function applyTheme(theme) {
        if (theme === THEME_LIGHT) {
            htmlElement.setAttribute('data-theme', THEME_LIGHT);
            bodyElement.classList.remove('dark-theme');
            bodyElement.classList.add('light-theme');
        } else {
            htmlElement.setAttribute('data-theme', THEME_DARK);
            bodyElement.classList.remove('light-theme');
            bodyElement.classList.add('dark-theme');
        }

        localStorage.setItem(THEME_STORAGE_KEY, theme);

        // Dispatch custom event for modules that need to adjust colors/effects
        window.dispatchEvent(new CustomEvent('aegisThemeChanged', { detail: { theme } }));
    }

    /**
     * Toggle between light and dark themes
     */
    function toggleTheme() {
        const currentTheme = htmlElement.getAttribute('data-theme') || THEME_DARK;
        const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
        applyTheme(newTheme);
    }

    /**
     * Initialize Application
     */
    function init() {
        const initialTheme = getInitialTheme();
        applyTheme(initialTheme);

        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', toggleTheme);
        }

        // Preload the alternate hero image to ensure instantaneous switching
        const preloadImg = new Image();
        preloadImg.src = initialTheme === THEME_DARK ? HERO_BG_LIGHT : HERO_BG_DARK;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
