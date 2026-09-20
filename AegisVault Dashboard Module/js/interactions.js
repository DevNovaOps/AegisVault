/**
 * AegisVault — Interactions & UI Controller
 * Theme toggling (with localStorage), search bar with live dropdown,
 * notifications, profile menu, mobile drawer, modals, and toast alerts.
 */

const AegisInteractions = (() => {
    const THEME_KEY = 'aegisvault_theme';

    /**
     * Initialize Theme System
     */
    function initTheme() {
        const toggleBtn = document.getElementById('btn-theme-toggle');
        const savedTheme = localStorage.getItem(THEME_KEY);

        // Check if previously saved as dark or if OS prefers dark, otherwise default to light
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            // Default to Light theme as in screenshot 1
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleTheme);
        }
    }

    function toggleTheme() {
        const isDark = document.body.classList.contains('dark-theme');
        if (isDark) {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            localStorage.setItem(THEME_KEY, 'light');
            showToast('Switched to Light Theme', 'info');
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            localStorage.setItem(THEME_KEY, 'dark');
            showToast('Switched to Dark Enterprise Theme', 'info');
        }
    }

    /**
     * Initialize Global Search Bar
     */
    function initSearch() {
        const input = document.getElementById('global-search-input');
        const dropdown = document.getElementById('search-results-dropdown');
        if (!input || !dropdown) return;

        input.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (!query) {
                dropdown.classList.remove('active');
                dropdown.innerHTML = '';
                return;
            }

            const results = AegisData.searchItems.filter(item => 
                item.title.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                item.snippet.toLowerCase().includes(query)
            );

            if (results.length === 0) {
                dropdown.innerHTML = `
                    <div class="search-empty-state">
                        No results found for "<strong>${escapeHtml(query)}</strong>"
                    </div>
                `;
            } else {
                dropdown.innerHTML = results.map(item => `
                    <div class="search-result-item" onclick="AegisInteractions.handleSearchResultClick('${item.type}', '${item.id}')">
                        <div>
                            <div class="search-result-title">${escapeHtml(item.title)}</div>
                            <div class="search-result-snippet">${escapeHtml(item.snippet)}</div>
                        </div>
                        <span class="search-result-badge badge-strong" style="background: var(--bg-card-alt);">${escapeHtml(item.category)}</span>
                    </div>
                `).join('');
            }

            dropdown.classList.add('active');
        });

        // Focus search with '/' key
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== input) {
                e.preventDefault();
                input.focus();
                input.select();
            }
        });
    }

    function handleSearchResultClick(type, id) {
        const dropdown = document.getElementById('search-results-dropdown');
        if (dropdown) dropdown.classList.remove('active');

        if (type === 'vault') {
            AegisDashboard.openVaultDetails(id);
        } else if (type === 'activity' || type === 'item' || type === 'security' || type === 'trustee') {
            AegisDashboard.openActivityDetails(id);
        } else {
            showToast(`Loaded item: ${id}`, 'info');
        }
    }

    /**
     * Initialize Notification Dropdown
     */
    function initNotifications() {
        const btn = document.getElementById('btn-notifications');
        const dropdown = document.getElementById('notifications-dropdown');
        const markReadBtn = document.getElementById('btn-mark-all-read');
        const badge = document.getElementById('notif-badge-indicator');
        const listContainer = document.getElementById('notifications-list-container');

        if (!btn || !dropdown || !listContainer) return;

        // Render notifications
        function renderList() {
            listContainer.innerHTML = AegisData.notifications.map(n => `
                <div class="notification-item ${n.read ? '' : 'unread'}" onclick="AegisInteractions.showToast('${escapeHtml(n.title)}', 'info')">
                    <div class="notification-icon-col" style="background: var(--blue-bg); color: var(--blue);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${escapeHtml(n.title)}</div>
                        <div class="notification-time">${escapeHtml(n.time)}</div>
                    </div>
                </div>
            `).join('');
        }
        renderList();

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllDropdowns(dropdown);
            dropdown.classList.toggle('active');
        });

        if (markReadBtn) {
            markReadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                AegisData.notifications.forEach(n => n.read = true);
                if (badge) badge.style.display = 'none';
                renderList();
                showToast('All notifications marked as read', 'info');
            });
        }
    }

    /**
     * Initialize Profile Dropdown
     */
    function initProfileMenu() {
        const btn = document.getElementById('user-profile-btn');
        const dropdown = document.getElementById('user-profile-dropdown');
        if (!btn || !dropdown) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllDropdowns(dropdown);
            dropdown.classList.toggle('active');
        });
    }

    /**
     * Initialize Mobile Drawer
     */
    function initMobileDrawer() {
        const menuBtn = document.getElementById('btn-mobile-menu');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobile-overlay');

        if (!menuBtn || !sidebar || !overlay) return;

        function toggleDrawer() {
            sidebar.classList.toggle('drawer-open');
            overlay.classList.toggle('active');
        }

        menuBtn.addEventListener('click', toggleDrawer);
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('drawer-open');
            overlay.classList.remove('active');
        });
    }

    /**
     * Close all open menus when clicking outside
     */
    function initClickOutside() {
        document.addEventListener('click', (e) => {
            closeAllDropdowns();
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllDropdowns();
                closeAllModals();
            }
        });
    }

    function closeAllDropdowns(except = null) {
        const dropdowns = [
            document.getElementById('search-results-dropdown'),
            document.getElementById('notifications-dropdown'),
            document.getElementById('user-profile-dropdown')
        ];

        dropdowns.forEach(d => {
            if (d && d !== except) {
                d.classList.remove('active');
            }
        });
    }

    /**
     * Modal Helpers
     */
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(m => m.classList.remove('active'));
        document.body.style.overflow = '';
    }

    /**
     * Toast System
     */
    function showToast(message, type = 'info', duration = 3500) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let iconSvg = '';
        if (type === 'success') {
            iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        } else if (type === 'warning') {
            iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        } else {
            iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        }

        toast.innerHTML = `
            ${iconSvg}
            <span class="toast-message">${escapeHtml(message)}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 250);
        }, duration);
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Public API
     */
    return {
        init: () => {
            initTheme();
            initSearch();
            initNotifications();
            initProfileMenu();
            initMobileDrawer();
            initClickOutside();
        },
        toggleTheme,
        handleSearchResultClick,
        openModal,
        closeModal,
        closeAllModals,
        showToast
    };
})();

// Attach globally
if (typeof window !== 'undefined') {
    window.AegisInteractions = AegisInteractions;
}
