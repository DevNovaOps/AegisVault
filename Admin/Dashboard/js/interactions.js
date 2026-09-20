/**
 * AegisVault Admin Dashboard Module — Interactions & UI Controller
 * Manages dual theme toggling with background image switching, live search,
 * dropdowns, mobile drawer, modal engine, chart tooltips, and toast notifications.
 */

const AegisInteractions = {
    THEME_KEY: 'aegisvault_theme',
    activeModal: null,

    init() {
        this.initTheme();
        this.initSearch();
        this.initDropdowns();
        this.initMobileDrawer();
        this.initModals();
        this.initKeyboardShortcuts();
        this.initSidebarNav();
    },

    // 1. Dual Theme System & Background Switching
    initTheme() {
        const toggleBtn = document.getElementById('btn-theme-toggle');
        const savedTheme = localStorage.getItem(this.THEME_KEY) || 'light';

        this.applyTheme(savedTheme, false);

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                this.applyTheme(newTheme, true);
            });
        }
    },

    applyTheme(theme, showNotice = false) {
        const isDark = theme === 'dark';
        document.documentElement.setAttribute('data-theme', theme);

        if (isDark) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
        }

        // Update Theme Icon in Header
        const themeBtn = document.getElementById('btn-theme-toggle');
        if (themeBtn) {
            themeBtn.setAttribute('title', isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme');
            themeBtn.setAttribute('aria-label', isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme');
        }

        // Persist preference
        localStorage.setItem(this.THEME_KEY, theme);

        // Notify charts engine to refresh theme-dependent colors
        if (window.AegisCharts && typeof window.AegisCharts.reRenderAll === 'function') {
            window.AegisCharts.reRenderAll();
        }

        if (showNotice) {
            this.showToast(`Switched to ${isDark ? 'Dark Theme' : 'Light Theme'}`, 'info');
        }
    },

    // 2. Global Live Search
    initSearch() {
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

            const results = AegisMockData.searchIndex.filter(item => 
                item.title.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                item.snippet.toLowerCase().includes(query)
            );

            if (results.length === 0) {
                dropdown.innerHTML = `
                    <div class="search-empty-state">
                        No matches found for "<strong>${this.escapeHtml(query)}</strong>"
                    </div>
                `;
            } else {
                dropdown.innerHTML = results.map(item => `
                    <div class="search-result-item" data-type="${item.type}" data-id="${item.id}">
                        <div class="search-result-col">
                            <div class="search-result-title">${this.escapeHtml(item.title)}</div>
                            <div class="search-result-snippet">${this.escapeHtml(item.snippet)}</div>
                        </div>
                        <span class="search-result-badge">${this.escapeHtml(item.category)}</span>
                    </div>
                `).join('');

                dropdown.querySelectorAll('.search-result-item').forEach(el => {
                    el.addEventListener('click', () => {
                        const type = el.getAttribute('data-type');
                        const id = el.getAttribute('data-id');
                        this.handleSearchResultClick(type, id);
                        dropdown.classList.remove('active');
                        input.value = '';
                    });
                });
            }

            dropdown.classList.add('active');
        });

        // Close search on outside click
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    },

    handleSearchResultClick(type, id) {
        if (type === 'user') {
            const user = AegisMockData.recentUsers.find(u => u.id === id);
            if (user) this.showUserModal(user);
        } else if (type === 'event') {
            const event = AegisMockData.recentSecurityEvents.find(e => e.id === id);
            if (event) this.showEventModal(event);
        } else if (type === 'service') {
            const service = AegisMockData.systemHealth.find(s => s.id === id);
            if (service) this.showServiceModal(service);
        } else if (type === 'nav') {
            this.showToast(`Navigating to ${id}...`, 'info');
        }
    },

    // 3. Dropdowns (Notifications, Profile)
    initDropdowns() {
        const notifBtn = document.getElementById('btn-notifications');
        const notifDropdown = document.getElementById('notifications-dropdown');
        const profileBtn = document.getElementById('user-profile-btn');
        const profileDropdown = document.getElementById('profile-dropdown');

        if (notifBtn && notifDropdown) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (profileDropdown) profileDropdown.classList.remove('active');
                notifDropdown.classList.toggle('active');
            });
        }

        if (profileBtn && profileDropdown) {
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (notifDropdown) notifDropdown.classList.remove('active');
                profileDropdown.classList.toggle('active');
            });
        }

        document.addEventListener('click', (e) => {
            if (notifDropdown && !notifDropdown.contains(e.target) && notifBtn && !notifBtn.contains(e.target)) {
                notifDropdown.classList.remove('active');
            }
            if (profileDropdown && !profileDropdown.contains(e.target) && profileBtn && !profileBtn.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });

        // Populate notifications feed
        this.renderNotificationsList();

        // Mark all read button
        const markReadBtn = document.getElementById('btn-mark-all-read');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', () => {
                AegisMockData.notifications.forEach(n => n.unread = false);
                this.renderNotificationsList();
                const indicator = document.getElementById('notif-badge-indicator');
                if (indicator) indicator.style.display = 'none';
                this.showToast('All notifications marked as read', 'info');
            });
        }
    },

    renderNotificationsList() {
        const container = document.getElementById('notifications-list-container');
        if (!container) return;

        const notifs = AegisMockData.notifications;
        const unreadCount = notifs.filter(n => n.unread).length;
        const indicator = document.getElementById('notif-badge-indicator');
        if (indicator) {
            indicator.style.display = unreadCount > 0 ? 'block' : 'none';
            indicator.textContent = unreadCount > 0 ? unreadCount : '';
        }

        container.innerHTML = notifs.map(n => `
            <div class="notification-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
                <div class="notification-dot ${n.type}"></div>
                <div class="notification-content">
                    <div class="notification-title">${this.escapeHtml(n.title)}</div>
                    <div class="notification-message">${this.escapeHtml(n.message)}</div>
                    <div class="notification-time">${this.escapeHtml(n.time)}</div>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                item.classList.remove('unread');
                const id = item.getAttribute('data-id');
                const match = notifs.find(n => n.id === id);
                if (match) match.unread = false;
                this.showToast(`Notification: ${item.querySelector('.notification-title').textContent}`, 'info');
            });
        });
    },

    // 4. Mobile Navigation Drawer
    initMobileDrawer() {
        const hamburgerBtn = document.getElementById('btn-mobile-menu');
        const sidebar = document.getElementById('app-sidebar');
        const backdrop = document.getElementById('sidebar-backdrop');

        if (hamburgerBtn && sidebar && backdrop) {
            hamburgerBtn.addEventListener('click', () => {
                sidebar.classList.add('open');
                backdrop.classList.add('active');
            });

            backdrop.addEventListener('click', () => {
                sidebar.classList.remove('open');
                backdrop.classList.remove('active');
            });
        }
    },

    // 5. Sidebar Navigation Links
    initSidebarNav() {
        const navLinks = document.querySelectorAll('.nav-link-item');
        const sidebar = document.getElementById('app-sidebar');
        const backdrop = document.getElementById('sidebar-backdrop');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Remove active from all and set on clicked
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // If mobile drawer open, close it
                if (sidebar && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    if (backdrop) backdrop.classList.remove('active');
                }

                const target = link.getAttribute('data-target');
                if (target === 'dashboard') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    this.showToast(`Navigating to ${link.querySelector('.nav-label').textContent}...`, 'info');
                }
            });
        });
    },

    // 6. Modal System
    initModals() {
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal-overlay');
                if (modal) this.closeModal(modal.id);
            });
        });

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(overlay.id);
                }
            });
        });
    },

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.add('active');
        this.activeModal = modalId;
        document.body.style.overflow = 'hidden';
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.remove('active');
        this.activeModal = null;
        document.body.style.overflow = '';
    },

    // Detail Modal Triggers
    showUserModal(user) {
        const modal = document.getElementById('user-detail-modal');
        if (!modal) return;

        document.getElementById('modal-user-avatar').textContent = user.avatar;
        document.getElementById('modal-user-name').textContent = user.name;
        document.getElementById('modal-user-email').textContent = user.email;
        document.getElementById('modal-user-role').textContent = user.role;
        document.getElementById('modal-user-status').textContent = user.status;
        document.getElementById('modal-user-joined').textContent = user.joined;
        document.getElementById('modal-user-vaults').textContent = user.vaultCount;
        document.getElementById('modal-user-trustees').textContent = user.trusteesCount;
        document.getElementById('modal-user-tier').textContent = user.accountTier;
        document.getElementById('modal-user-heartbeat').textContent = user.lastHeartbeat;

        this.openModal('user-detail-modal');
    },

    showEventModal(event) {
        const modal = document.getElementById('event-detail-modal');
        if (!modal) return;

        document.getElementById('modal-event-title').textContent = event.event;
        document.getElementById('modal-event-time').textContent = event.time;
        document.getElementById('modal-event-severity').textContent = event.severity;
        document.getElementById('modal-event-severity').className = `severity-badge ${event.severityType}`;
        document.getElementById('modal-event-ip').textContent = event.ip;
        document.getElementById('modal-event-location').textContent = event.location;
        document.getElementById('modal-event-user').textContent = event.user;
        document.getElementById('modal-event-details').textContent = event.details;

        this.openModal('event-detail-modal');
    },

    showServiceModal(service) {
        const modal = document.getElementById('service-detail-modal');
        if (!modal) return;

        document.getElementById('modal-service-name').textContent = service.name;
        document.getElementById('modal-service-status').textContent = service.status;
        document.getElementById('modal-service-latency').textContent = service.latency;
        document.getElementById('modal-service-uptime').textContent = service.uptime;
        document.getElementById('modal-service-details').textContent = service.details;

        this.openModal('service-detail-modal');
    },

    showReportModal() {
        this.openModal('generate-report-modal');
    },

    showAllUsersModal() {
        const tbody = document.getElementById('all-users-tbody');
        if (tbody) {
            tbody.innerHTML = AegisMockData.recentUsers.map(u => `
                <tr>
                    <td>
                        <div class="user-cell">
                            <span class="avatar-circle ${u.avatarColor}">${u.avatar}</span>
                            <span class="user-cell-name">${u.name}</span>
                        </div>
                    </td>
                    <td>${u.email}</td>
                    <td><span class="role-tag">${u.role}</span></td>
                    <td><span class="status-pill ${u.statusType}"><span class="dot"></span>${u.status}</span></td>
                    <td>${u.joined}</td>
                    <td>${u.vaultCount}</td>
                </tr>
            `).join('');
        }
        this.openModal('all-users-modal');
    },

    showAllEventsModal() {
        const tbody = document.getElementById('all-events-tbody');
        if (tbody) {
            tbody.innerHTML = AegisMockData.recentSecurityEvents.map(e => `
                <tr>
                    <td>${e.time}</td>
                    <td><strong>${e.event}</strong></td>
                    <td><span class="severity-badge ${e.severityType}">${e.severity}</span></td>
                    <td>${e.ip}</td>
                    <td>${e.location}</td>
                    <td>${e.details}</td>
                </tr>
            `).join('');
        }
        this.openModal('all-events-modal');
    },

    showActionModal(action) {
        this.showToast(`Triaging: ${action.title} (${action.count} items)`, 'info');
    },

    // 7. Chart Tooltips
    showChartTooltip(e, text) {
        let tooltip = document.getElementById('aegis-chart-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'aegis-chart-tooltip';
            tooltip.className = 'aegis-chart-tooltip';
            document.body.appendChild(tooltip);
        }
        tooltip.textContent = text;
        tooltip.style.display = 'block';
        this.positionChartTooltip(e);
    },

    positionChartTooltip(e) {
        const tooltip = document.getElementById('aegis-chart-tooltip');
        if (!tooltip) return;
        const x = e.clientX + 12;
        const y = e.clientY - 28;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    },

    hideChartTooltip() {
        const tooltip = document.getElementById('aegis-chart-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    },

    // 8. Toast Notification System
    showToast(message, type = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type}`;
        toast.innerHTML = `
            <div class="toast-message">${this.escapeHtml(message)}</div>
            <button class="toast-close-btn" aria-label="Close">&times;</button>
        `;

        toast.querySelector('.toast-close-btn').addEventListener('click', () => {
            toast.remove();
        });

        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('toast-fadeout');
                setTimeout(() => toast.remove(), 250);
            }
        }, 3600);
    },

    // 9. Keyboard Shortcuts
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC closes modal or search dropdown
            if (e.key === 'Escape') {
                if (this.activeModal) {
                    this.closeModal(this.activeModal);
                }
                const dropdown = document.getElementById('search-results-dropdown');
                if (dropdown) dropdown.classList.remove('active');
                const notifDropdown = document.getElementById('notifications-dropdown');
                if (notifDropdown) notifDropdown.classList.remove('active');
                const profileDropdown = document.getElementById('profile-dropdown');
                if (profileDropdown) profileDropdown.classList.remove('active');
            }

            // "/" or "Ctrl+K" focuses search
            if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && 
                document.activeElement.tagName !== 'INPUT' && 
                document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                const input = document.getElementById('global-search-input');
                if (input) {
                    input.focus();
                    input.select();
                }
            }

            // "t" or "T" toggles theme
            if ((e.key === 't' || e.key === 'T') && 
                document.activeElement.tagName !== 'INPUT' && 
                document.activeElement.tagName !== 'TEXTAREA') {
                const btn = document.getElementById('btn-theme-toggle');
                if (btn) btn.click();
            }
        });
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};

window.AegisInteractions = AegisInteractions;
