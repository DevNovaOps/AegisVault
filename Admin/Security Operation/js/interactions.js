/**
 * AegisVault Security Operations Module - Interactions & UI Orchestration
 * Handles themes, dropdowns, search, modals, toasts, tooltips, and drawer.
 */

const AegisInteractions = {
    activeModal: null,

    init() {
        this.setupThemeToggle();
        this.setupGlobalSearch();
        this.setupDropdowns();
        this.setupMobileDrawer();
        this.setupModalSystem();
        this.setupAdminSupportForm();
        this.setupViewAllButtons();
        this.setupSecurityRestrictionModal();
        this.setupKeyboardShortcuts();
    },

    // 1. Theme Toggle System
    setupThemeToggle() {
        const themeBtn = document.getElementById('theme-toggle-btn');
        const savedTheme = localStorage.getItem('aegis_theme') || 'dark';

        this.applyTheme(savedTheme);

        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                this.applyTheme(newTheme);
                this.showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Theme`, 'info');
            });
        }
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
        }
        localStorage.setItem('aegis_theme', theme);
    },

    // 2. Global Search System
    setupGlobalSearch() {
        const searchInput = document.getElementById('global-search-input');
        const dropdown = document.getElementById('search-results-dropdown');
        if (!searchInput || !dropdown) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (!query) {
                dropdown.classList.remove('active');
                dropdown.innerHTML = '';
                return;
            }

            // Search Users
            const matchedUsers = AegisMockData.users.filter(u =>
                u.name.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query)
            );

            // Search Trustees
            const matchedTrustees = AegisMockData.trustees.filter(t =>
                t.name.toLowerCase().includes(query) ||
                t.linkedUser.toLowerCase().includes(query) ||
                t.relation.toLowerCase().includes(query)
            );

            // Search Security Events
            const matchedEvents = AegisMockData.securityEvents.filter(ev =>
                ev.event.toLowerCase().includes(query) ||
                ev.user.toLowerCase().includes(query) ||
                ev.details.toLowerCase().includes(query)
            );

            // Search Services
            const matchedServices = AegisMockData.systemHealth.services.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.description.toLowerCase().includes(query)
            );

            let html = '';
            const totalMatches = matchedUsers.length + matchedTrustees.length + matchedEvents.length + matchedServices.length;

            if (totalMatches === 0) {
                html = `<div class="search-empty-state">No matching users, trustees, logs, or services found for "${e.target.value}".</div>`;
            } else {
                if (matchedUsers.length > 0) {
                    html += `<div class="search-results-category">Users (${matchedUsers.length})</div>`;
                    html += matchedUsers.slice(0, 3).map(u => `
                        <div class="search-result-item" data-type="user" data-id="${u.id}">
                            <div>
                                <div class="search-result-title">${u.name}</div>
                                <div class="search-result-sub">${u.email}</div>
                            </div>
                            <span class="search-result-badge status-dot ${u.statusType}">${u.status}</span>
                        </div>
                    `).join('');
                }

                if (matchedTrustees.length > 0) {
                    html += `<div class="search-results-category">Trustees (${matchedTrustees.length})</div>`;
                    html += matchedTrustees.slice(0, 3).map(t => `
                        <div class="search-result-item" data-type="trustee" data-id="${t.id}">
                            <div>
                                <div class="search-result-title">${t.name} (${t.relation})</div>
                                <div class="search-result-sub">Linked: ${t.linkedUser}</div>
                            </div>
                            <span class="search-result-badge">${t.status}</span>
                        </div>
                    `).join('');
                }

                if (matchedEvents.length > 0) {
                    html += `<div class="search-results-category">Security Events (${matchedEvents.length})</div>`;
                    html += matchedEvents.slice(0, 3).map(ev => `
                        <div class="search-result-item" data-type="event" data-id="${ev.id}">
                            <div>
                                <div class="search-result-title">${ev.event} — ${ev.user}</div>
                                <div class="search-result-sub">${ev.details}</div>
                            </div>
                            <span class="event-badge ${ev.eventType}">${ev.status}</span>
                        </div>
                    `).join('');
                }

                if (matchedServices.length > 0) {
                    html += `<div class="search-results-category">System Services (${matchedServices.length})</div>`;
                    html += matchedServices.slice(0, 2).map(s => `
                        <div class="search-result-item" data-type="service" data-id="${s.id}">
                            <div>
                                <div class="search-result-title">${s.name}</div>
                                <div class="search-result-sub">${s.description}</div>
                            </div>
                            <span class="search-result-badge" style="color: var(--emerald);">${s.status}</span>
                        </div>
                    `).join('');
                }
            }

            dropdown.innerHTML = html;
            dropdown.classList.add('active');

            // Attach click handler to result items
            dropdown.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const type = item.getAttribute('data-type');
                    const id = item.getAttribute('data-id');
                    dropdown.classList.remove('active');
                    searchInput.value = '';

                    if (type === 'user') {
                        const u = AegisMockData.users.find(x => x.id === id);
                        if (u) AegisSecurityOps.showUserProfileModal(u);
                    } else if (type === 'trustee') {
                        const t = AegisMockData.trustees.find(x => x.id === id);
                        if (t) AegisSecurityOps.showTrusteeDetailModal(t);
                    } else if (type === 'event') {
                        const ev = AegisMockData.securityEvents.find(x => x.id === id);
                        if (ev) AegisSecurityOps.showEventDetailModal(ev);
                    } else if (type === 'service') {
                        const s = AegisMockData.systemHealth.services.find(x => x.id === id);
                        if (s) AegisSecurityOps.showServiceStatusModal(s);
                    }
                });
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    },

    // 3. Dropdown Menus (Notifications, Profile)
    setupDropdowns() {
        const notifBtn = document.getElementById('notif-btn');
        const notifDropdown = document.getElementById('notifications-dropdown');
        const profileBtn = document.getElementById('profile-btn');
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

        // Mark all as read button
        const markAllBtn = document.getElementById('mark-all-read-btn');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', () => {
                const unreadItems = document.querySelectorAll('.notification-item.unread');
                unreadItems.forEach(item => item.classList.remove('unread'));
                const badge = document.querySelector('.notification-badge-dot');
                if (badge) badge.style.display = 'none';
                this.showToast('All notifications marked as read', 'info');
            });
        }

        // Notification item click
        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                item.classList.remove('unread');
                const title = item.querySelector('.notification-title').textContent;
                this.showToast(`Viewing: ${title}`, 'info');
            });
        });

        // Profile Menu Items click
        document.querySelectorAll('.profile-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const text = item.textContent.trim();
                if (profileDropdown) profileDropdown.classList.remove('active');

                if (text.includes('Logout')) {
                    this.showToast('Admin logged out (Mock Session)', 'warning');
                } else {
                    this.showToast(`Opening ${text} settings...`, 'info');
                }
            });
        });
    },

    // 4. Mobile Drawer
    setupMobileDrawer() {
        const hamburgerBtn = document.getElementById('hamburger-btn');
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

    // 5. Modal Engine
    setupModalSystem() {
        // Close modal on click of elements with [data-close-modal]
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal-overlay');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Close on background click
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

    // 6. Admin Support Form
    setupAdminSupportForm() {
        const supportBtn = document.getElementById('admin-support-sidebar-btn');
        if (supportBtn) {
            supportBtn.addEventListener('click', () => {
                this.openModal('admin-support-modal');
            });
        }

        const supportForm = document.getElementById('admin-support-form');
        if (supportForm) {
            supportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const topic = document.getElementById('support-topic').value;
                const desc = document.getElementById('support-desc').value.trim();

                if (!desc) {
                    this.showToast('Please provide a description of the issue.', 'error');
                    return;
                }

                // Simulate submission
                const submitBtn = supportForm.querySelector('button[type="submit"]');
                submitBtn.textContent = 'Submitting...';
                submitBtn.disabled = true;

                setTimeout(() => {
                    submitBtn.textContent = 'Submit Support Ticket';
                    submitBtn.disabled = false;
                    supportForm.reset();
                    this.closeModal('admin-support-modal');
                    this.showToast(`Support Ticket #TK-${Math.floor(1000 + Math.random() * 9000)} created for [${topic}]. Dispatching to Core Ops.`, 'success');
                }, 700);
            });
        }
    },

    // 7. "View All" Modals
    setupViewAllButtons() {
        // View All Events
        const viewEventsBtn = document.getElementById('view-all-events-btn');
        if (viewEventsBtn) {
            viewEventsBtn.addEventListener('click', () => {
                this.renderAllEventsModal();
                this.openModal('all-events-modal');
            });
        }

        // View All Users
        const viewUsersBtn = document.getElementById('view-all-users-btn');
        if (viewUsersBtn) {
            viewUsersBtn.addEventListener('click', () => {
                this.renderAllUsersModal();
                this.openModal('all-users-modal');
            });
        }

        // View All Trustees
        const viewTrusteesBtn = document.getElementById('view-all-trustees-btn');
        if (viewTrusteesBtn) {
            viewTrusteesBtn.addEventListener('click', () => {
                this.renderAllTrusteesModal();
                this.openModal('all-trustees-modal');
            });
        }
    },

    renderAllEventsModal() {
        const tbody = document.getElementById('all-events-tbody');
        if (!tbody) return;

        const events = AegisMockData.securityEvents;
        tbody.innerHTML = events.map(e => `
            <tr>
                <td>${e.time}</td>
                <td><span class="event-badge ${e.eventType}">${e.event}</span></td>
                <td><strong>${e.user}</strong></td>
                <td>${e.details}</td>
                <td>
                    <span class="status-indicator">
                        <span class="status-dot ${e.statusType}"></span>
                        ${e.status}
                    </span>
                </td>
            </tr>
        `).join('');
    },

    renderAllUsersModal() {
        const tbody = document.getElementById('all-users-tbody');
        if (!tbody) return;

        const users = AegisMockData.users;
        tbody.innerHTML = users.map(u => `
            <tr>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td>
                    <span class="status-indicator">
                        <span class="status-dot ${u.statusType}"></span>
                        ${u.status}
                    </span>
                </td>
                <td>${u.joined}</td>
                <td>${u.vaultCount}</td>
                <td>${u.trusteesCount}</td>
            </tr>
        `).join('');
    },

    renderAllTrusteesModal() {
        const tbody = document.getElementById('all-trustees-tbody');
        if (!tbody) return;

        const trustees = AegisMockData.trustees;
        tbody.innerHTML = trustees.map(t => {
            const badgeClass = t.status === 'Verified' ? 'status-badge-verified' : 'status-badge-pending';
            return `
                <tr>
                    <td><strong>${t.name}</strong></td>
                    <td>${t.linkedUser}</td>
                    <td>${t.relation}</td>
                    <td><span class="${badgeClass}">${t.status}</span></td>
                    <td>${t.sharesHeld}</td>
                    <td>${t.addedDate}</td>
                </tr>
            `;
        }).join('');
    },

    // 8. Security Restriction Panel "Learn More"
    setupSecurityRestrictionModal() {
        const restrictionPanel = document.querySelector('.security-restriction-panel');
        if (restrictionPanel) {
            restrictionPanel.querySelectorAll('.principle-box').forEach(box => {
                box.addEventListener('click', () => {
                    this.openModal('security-restriction-modal');
                });
            });
        }
    },

    // 9. Tooltip Helper
    showTooltip(e, text) {
        let tooltip = document.getElementById('chart-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'chart-tooltip';
            tooltip.style.position = 'fixed';
            tooltip.style.backgroundColor = 'var(--bg-surface)';
            tooltip.style.color = 'var(--text-heading)';
            tooltip.style.border = '1px solid var(--border-color)';
            tooltip.style.padding = '0.35rem 0.65rem';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '0.72rem';
            tooltip.style.fontWeight = '600';
            tooltip.style.boxShadow = 'var(--shadow-dropdown)';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.zIndex = '1000';
            tooltip.style.whiteSpace = 'nowrap';
            document.body.appendChild(tooltip);
        }

        tooltip.textContent = text;
        tooltip.style.display = 'block';
        tooltip.style.left = `${e.clientX + 10}px`;
        tooltip.style.top = `${e.clientY - 25}px`;
    },

    hideTooltip() {
        const tooltip = document.getElementById('chart-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    },

    // 10. Toast Notification Helper
    showToast(message, type = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast-item ${type}`;
        toast.innerHTML = `
            <div class="toast-content">${message}</div>
            <div class="toast-close-btn">&times;</div>
        `;

        toast.querySelector('.toast-close-btn').addEventListener('click', () => {
            toast.remove();
        });

        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'toastSlideOut 0.25s forwards';
                setTimeout(() => toast.remove(), 250);
            }
        }, 4000);
    },

    // 11. Keyboard Shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC key closes active modal or search
            if (e.key === 'Escape') {
                if (this.activeModal) {
                    this.closeModal(this.activeModal);
                }
                const searchDropdown = document.getElementById('search-results-dropdown');
                if (searchDropdown) searchDropdown.classList.remove('active');
            }

            // "/" or "Ctrl+K" focuses global search
            if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                const searchInput = document.getElementById('global-search-input');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }

            // "t" or "T" toggles theme
            if ((e.key === 't' || e.key === 'T') && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                const themeBtn = document.getElementById('theme-toggle-btn');
                if (themeBtn) themeBtn.click();
            }
        });
    }
};

window.AegisInteractions = AegisInteractions;
