/**
 * AegisVault — User Management Core Controller & Interactions
 * 
 * Simple, self-contained JavaScript for the User Management module:
 * - Dual theme switching (Light / Dark) with background image switching & persistence
 * - Table rendering with avatars, roles, badges, and action dots
 * - Real-time search and multi-field filtering (Role, Status, Date)
 * - Sorting, pagination, and bulk row selection
 * - Synchronized right-hand User Details inspector (Overview, Security, Vaults tabs)
 * - User actions: Add new user, edit user details, suspend/reactivate, reset password, delete
 * - CSV export download
 * - Header dropdowns, mobile navigation drawer, keyboard shortcuts, and toast alerts
 */

window.AegisUserManagement = {
    THEME_KEY: 'aegisvault_theme',
    users: [],
    filteredUsers: [],
    currentPage: 1,
    pageSize: 10,
    selectedUserId: "USR001248",
    activeTab: "overview",

    init() {
        this.users = [...(window.AegisMockUsers || [])];
        this.filteredUsers = [...this.users];

        // 1. Initialize UI Controls & Theme
        this.initTheme();
        this.initHeaderDropdowns();
        this.initShortcuts();
        this.initModals();

        // 2. Initialize User Table & Inspector
        this.initEventListeners();
        this.renderTable();
        this.selectUser(this.selectedUserId);
        this.updateKPIs();
    },

    /* =========================================================================
       1. Dual Theme System
       ========================================================================= */
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

        const themeBtn = document.getElementById('btn-theme-toggle');
        if (themeBtn) {
            themeBtn.setAttribute('title', isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme');
            themeBtn.setAttribute('aria-label', isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme');
        }

        localStorage.setItem(this.THEME_KEY, theme);
        localStorage.setItem('aegis_theme', theme);

        if (showNotice) {
            this.showToast(`Switched to ${isDark ? 'Dark Theme' : 'Light Theme'}`, 'info');
        }
    },

    /* =========================================================================
       2. Header Dropdowns & Mobile Navigation Drawer
       ========================================================================= */
    initHeaderDropdowns() {
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

        document.addEventListener('click', () => {
            if (notifDropdown) notifDropdown.classList.remove('active');
            if (profileDropdown) profileDropdown.classList.remove('active');
        });

        // Mobile Hamburger & Sidebar Backdrop
        const hamburgerBtn = document.getElementById('btn-hamburger');
        const sidebar = document.getElementById('app-sidebar');
        const backdrop = document.getElementById('sidebar-backdrop');

        if (hamburgerBtn && sidebar && backdrop) {
            hamburgerBtn.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                backdrop.classList.toggle('active');
            });
            backdrop.addEventListener('click', () => {
                sidebar.classList.remove('active');
                backdrop.classList.remove('active');
            });
        }
    },

    /* =========================================================================
       3. Modals & User Action Workflows (Add, Edit, Suspend, Reset, Delete)
       ========================================================================= */
    initModals() {
        // Add User Modal
        const btnAdd = document.getElementById('btn-add-new-user');
        const modalAdd = document.getElementById('modal-add-user');
        const formAdd = document.getElementById('form-add-user');

        if (btnAdd && modalAdd) {
            btnAdd.addEventListener('click', () => {
                modalAdd.classList.add('active');
            });
        }

        if (formAdd) {
            formAdd.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('add-user-name')?.value.trim();
                const email = document.getElementById('add-user-email')?.value.trim();
                const role = document.getElementById('add-user-role')?.value || 'Owner';

                if (!name || !email) {
                    this.showToast('Please provide both name and email', 'warning');
                    return;
                }

                const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'US';
                const newId = `USR${Math.floor(100000 + Math.random() * 900000)}`;

                const newUser = {
                    id: newId,
                    index: this.users.length + 1,
                    initials: initials,
                    name: name,
                    email: email,
                    role: role,
                    roleTitle: role === 'Owner' ? 'Vault Owner' : 'Designated Trustee',
                    status: 'Active',
                    vaults: 0,
                    trustees: 0,
                    joinedOn: 'Today',
                    joinedOnFull: 'Today, Just Now',
                    lastLogin: 'Just Now',
                    emailVerified: 'Yes',
                    phoneVerified: 'Pending',
                    mfaEnabled: false,
                    recentActivity: [
                        { action: 'Account registered by Administrator', timestamp: 'Just now', status: 'Success' }
                    ],
                    securityDetails: { mfaMethod: 'Pending Setup', encryptionLevel: 'AES-256-GCM', failedLogins: 0, ipAddress: '127.0.0.1', trustedDevices: 1 },
                    vaultsList: []
                };

                this.users.unshift(newUser);
                this.applyFilters();
                this.selectUser(newId);

                modalAdd.classList.remove('active');
                formAdd.reset();
                this.showToast(`User ${name} added successfully!`, 'success');
            });
        }

        // Edit User Modal
        const btnEdit = document.getElementById('btn-action-edit');
        const modalEdit = document.getElementById('modal-edit-user');
        const formEdit = document.getElementById('form-edit-user');

        if (btnEdit && modalEdit) {
            btnEdit.addEventListener('click', () => {
                const user = this.users.find(u => u.id === this.selectedUserId);
                if (!user) return;

                const inputName = document.getElementById('edit-user-name');
                const inputEmail = document.getElementById('edit-user-email');
                const selectRole = document.getElementById('edit-user-role');
                const selectStatus = document.getElementById('edit-user-status');

                if (inputName) inputName.value = user.name;
                if (inputEmail) inputEmail.value = user.email;
                if (selectRole) selectRole.value = user.role;
                if (selectStatus) selectStatus.value = user.status;

                modalEdit.classList.add('active');
            });
        }

        if (formEdit) {
            formEdit.addEventListener('submit', (e) => {
                e.preventDefault();
                const user = this.users.find(u => u.id === this.selectedUserId);
                if (!user) return;

                user.name = document.getElementById('edit-user-name')?.value.trim() || user.name;
                user.email = document.getElementById('edit-user-email')?.value.trim() || user.email;
                user.role = document.getElementById('edit-user-role')?.value || user.role;
                user.status = document.getElementById('edit-user-status')?.value || user.status;

                this.renderTable();
                this.selectUser(user.id);

                modalEdit.classList.remove('active');
                this.showToast(`Updated user details for ${user.name}`, 'success');
            });
        }

        // Reset Password Action
        const btnResetPwd = document.getElementById('btn-action-reset-pwd');
        if (btnResetPwd) {
            btnResetPwd.addEventListener('click', () => {
                const user = this.users.find(u => u.id === this.selectedUserId);
                if (!user) return;
                this.showToast(`Password reset link dispatched to ${user.email}`, 'info');
            });
        }

        // Suspend User Action
        const btnSuspend = document.getElementById('btn-action-suspend');
        if (btnSuspend) {
            btnSuspend.addEventListener('click', () => {
                const user = this.users.find(u => u.id === this.selectedUserId);
                if (!user) return;

                if (user.status === 'Suspended') {
                    user.status = 'Active';
                    this.showToast(`Reactivated access for ${user.name}`, 'success');
                } else {
                    user.status = 'Suspended';
                    this.showToast(`Suspended access for ${user.name}`, 'warning');
                }

                this.renderTable();
                this.selectUser(user.id);
            });
        }

        // Delete User Action
        const btnDelete = document.getElementById('btn-action-delete');
        if (btnDelete) {
            btnDelete.addEventListener('click', () => {
                const user = this.users.find(u => u.id === this.selectedUserId);
                if (!user) return;

                if (confirm(`Are you sure you want to permanently delete user ${user.name} (${user.id})?`)) {
                    this.users = this.users.filter(u => u.id !== user.id);
                    this.applyFilters();
                    if (this.users.length > 0) {
                        this.selectUser(this.users[0].id);
                    }
                    this.showToast(`Deleted user ${user.name}`, 'warning');
                }
            });
        }

        // Close Modal Handlers
        document.querySelectorAll('.btn-close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.currentTarget.closest('.modal-backdrop');
                if (modal) modal.classList.remove('active');
            });
        });
    },

    /* =========================================================================
       4. Keyboard Shortcuts (/ search, t theme, Escape dismiss)
       ========================================================================= */
    initShortcuts() {
        document.addEventListener('keydown', (e) => {
            // "/" focuses search
            if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                const s = document.getElementById('user-table-search');
                if (s) {
                    s.focus();
                    s.select();
                }
            }
            // "t" toggles theme
            if ((e.key === 't' || e.key === 'T') && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                const btn = document.getElementById('btn-theme-toggle');
                if (btn) btn.click();
            }
            // "Escape" closes modals and panels
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
                const sidebar = document.getElementById('app-sidebar');
                const backdrop = document.getElementById('sidebar-backdrop');
                if (sidebar) sidebar.classList.remove('active');
                if (backdrop) backdrop.classList.remove('active');
            }
        });
    },

    /* =========================================================================
       5. Toast Notifications
       ========================================================================= */
    showToast(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type}`;
        toast.innerHTML = `<span>${message}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.25s ease';
            setTimeout(() => toast.remove(), 250);
        }, 3200);
    },

    /* =========================================================================
       6. Event Listeners for Table & Toolbar
       ========================================================================= */
    initEventListeners() {
        // Search Input
        const searchInput = document.getElementById('user-table-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Filter Dropdowns
        const roleFilter = document.getElementById('filter-role');
        const statusFilter = document.getElementById('filter-status');
        const dateFilter = document.getElementById('filter-date');
        
        if (roleFilter) roleFilter.addEventListener('change', () => this.applyFilters());
        if (statusFilter) statusFilter.addEventListener('change', () => this.applyFilters());
        if (dateFilter) dateFilter.addEventListener('change', () => this.applyFilters());

        // Reset Filter Button
        const btnReset = document.getElementById('btn-reset-filters');
        if (btnReset) {
            btnReset.addEventListener('click', () => this.resetFilters());
        }

        // Apply Filter Button
        const btnApply = document.getElementById('btn-apply-filters');
        if (btnApply) {
            btnApply.addEventListener('click', () => this.applyFilters());
        }

        // Export Users Button
        const btnExport = document.getElementById('btn-export-users');
        if (btnExport) {
            btnExport.addEventListener('click', () => this.exportUsersCSV());
        }

        // Select All Checkbox
        const selectAllCb = document.getElementById('checkbox-select-all');
        if (selectAllCb) {
            selectAllCb.addEventListener('change', (e) => {
                const rowCheckboxes = document.querySelectorAll('.table-row-checkbox');
                rowCheckboxes.forEach(cb => cb.checked = e.target.checked);
            });
        }

        // Details Panel Tabs (Overview, Security, Vaults)
        const tabBtns = document.querySelectorAll('.details-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.getAttribute('data-tab');
                this.switchDetailsTab(targetTab);
            });
        });

        // Close Details Panel Button
        const btnCloseDetails = document.getElementById('btn-close-details');
        if (btnCloseDetails) {
            btnCloseDetails.addEventListener('click', () => {
                const detailsCard = document.getElementById('user-details-panel');
                if (detailsCard) {
                    detailsCard.style.display = 'none';
                    this.showToast('Inspector panel collapsed. Click any row to expand.', 'info');
                }
            });
        }

        // Per Page Select
        const perPageSelect = document.getElementById('per-page-select');
        if (perPageSelect) {
            perPageSelect.addEventListener('change', (e) => {
                this.pageSize = parseInt(e.target.value, 10) || 10;
                this.currentPage = 1;
                this.renderTable();
            });
        }
    },

    /* =========================================================================
       7. KPI Numbers Update
       ========================================================================= */
    updateKPIs() {
        if (!window.AegisUserStats) return;
        const s = window.AegisUserStats;
        const totalEl = document.getElementById('kpi-total-users');
        const activeEl = document.getElementById('kpi-active-users');
        const suspendedEl = document.getElementById('kpi-suspended-users');
        const pendingEl = document.getElementById('kpi-pending-verifications');

        if (totalEl) totalEl.textContent = Number(s.totalUsers).toLocaleString();
        if (activeEl) activeEl.textContent = Number(s.activeUsers).toLocaleString();
        if (suspendedEl) suspendedEl.textContent = Number(s.suspendedUsers).toLocaleString();
        if (pendingEl) pendingEl.textContent = Number(s.pendingVerifications).toLocaleString();
    },

    /* =========================================================================
       8. Real-time Search & Filter Engine
       ========================================================================= */
    handleSearch(query) {
        const q = query.trim().toLowerCase();
        if (!q) {
            this.applyFilters();
            return;
        }

        this.filteredUsers = this.users.filter(u => 
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.id.toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q)
        );

        this.currentPage = 1;
        this.renderTable();
    },

    applyFilters() {
        const role = document.getElementById('filter-role')?.value || 'all';
        const status = document.getElementById('filter-status')?.value || 'all';
        const search = document.getElementById('user-table-search')?.value.trim().toLowerCase() || '';

        this.filteredUsers = this.users.filter(u => {
            const matchRole = role === 'all' || u.role.toLowerCase() === role.toLowerCase();
            const matchStatus = status === 'all' || u.status.toLowerCase() === status.toLowerCase();
            const matchSearch = !search || (
                u.name.toLowerCase().includes(search) ||
                u.email.toLowerCase().includes(search) ||
                u.id.toLowerCase().includes(search)
            );

            return matchRole && matchStatus && matchSearch;
        });

        this.currentPage = 1;
        this.renderTable();
    },

    resetFilters() {
        if (document.getElementById('user-table-search')) document.getElementById('user-table-search').value = '';
        if (document.getElementById('filter-role')) document.getElementById('filter-role').value = 'all';
        if (document.getElementById('filter-status')) document.getElementById('filter-status').value = 'all';
        if (document.getElementById('filter-date')) document.getElementById('filter-date').value = 'all';

        this.filteredUsers = [...this.users];
        this.currentPage = 1;
        this.renderTable();
        this.showToast('User filters reset to default', 'info');
    },

    /* =========================================================================
       9. Table Rendering
       ========================================================================= */
    renderTable() {
        const tbody = document.getElementById('users-table-tbody') || document.getElementById('user-table-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.filteredUsers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                        <div style="font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem;">No matching users found</div>
                        <p style="font-size: 0.8rem;">Try adjusting your search criteria or active filters.</p>
                    </td>
                </tr>
            `;
            this.updatePagination(0);
            return;
        }

        const startIndex = (this.currentPage - 1) * this.pageSize;
        const paginatedUsers = this.filteredUsers.slice(startIndex, startIndex + this.pageSize);

        paginatedUsers.forEach((u, i) => {
            const tr = document.createElement('tr');
            tr.className = u.id === this.selectedUserId ? 'row-selected' : '';
            tr.setAttribute('data-user-id', u.id);

            const roleClass = u.role.toLowerCase();
            const statusClass = u.status.toLowerCase();

            tr.innerHTML = `
                <td>
                    <input type="checkbox" class="table-checkbox table-row-checkbox" onclick="event.stopPropagation();">
                </td>
                <td style="color: var(--text-secondary); font-weight: 600;">${startIndex + i + 1}</td>
                <td>
                    <div class="user-avatar-cell">
                        <div class="avatar-circle">${u.initials}</div>
                        <div class="user-avatar-meta">
                            <span class="user-cell-name">${u.name}</span>
                            <span class="user-cell-id">${u.id}</span>
                        </div>
                    </div>
                </td>
                <td style="color: var(--text-secondary);">${u.email}</td>
                <td>
                    <span class="badge-role ${roleClass}">${u.role}</span>
                </td>
                <td>
                    <span class="badge-status ${statusClass}">
                        <span class="status-dot"></span>
                        <span>${u.status}</span>
                    </span>
                </td>
                <td style="font-weight: 600; color: var(--text-heading); text-align: center;">${u.vaults}</td>
                <td style="font-weight: 600; color: var(--text-heading); text-align: center;">${u.trustees}</td>
                <td style="white-space: nowrap; color: var(--text-secondary);">${u.joinedOn}</td>
                <td>
                    <button class="btn-row-action" title="User Actions" onclick="window.AegisUserManagement.openRowMenu(event, '${u.id}');">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <circle cx="5" cy="12" r="2"></circle>
                            <circle cx="12" cy="12" r="2"></circle>
                            <circle cx="19" cy="12" r="2"></circle>
                        </svg>
                    </button>
                </td>
            `;

            tr.addEventListener('click', () => {
                this.selectUser(u.id);
            });

            tbody.appendChild(tr);
        });

        this.updatePagination(this.filteredUsers.length);
    },

    /* =========================================================================
       10. User Details Inspector Panel Synchronization
       ========================================================================= */
    selectUser(id) {
        this.selectedUserId = id;
        const user = this.users.find(u => u.id === id);
        if (!user) return;

        // Highlight selected row in table
        document.querySelectorAll('#users-table-tbody tr, #user-table-tbody tr').forEach(r => {
            if (r.getAttribute('data-user-id') === id) {
                r.classList.add('row-selected');
            } else {
                r.classList.remove('row-selected');
            }
        });

        // Ensure Details Panel is visible
        const detailsPanel = document.getElementById('user-details-panel');
        if (detailsPanel) detailsPanel.style.display = 'flex';

        // Update Header Identity
        const avatarEl = document.getElementById('details-user-avatar');
        const nameEl = document.getElementById('details-user-name');
        const emailEl = document.getElementById('details-user-email');
        const roleEl = document.getElementById('details-user-role');
        const statusEl = document.getElementById('details-user-status');

        if (avatarEl) avatarEl.textContent = user.initials;
        if (nameEl) nameEl.textContent = user.name;
        if (emailEl) emailEl.textContent = user.email;
        if (roleEl) roleEl.textContent = user.roleTitle || user.role;
        if (statusEl) {
            statusEl.className = `badge-status ${user.status.toLowerCase()}`;
            statusEl.innerHTML = `<span class="status-dot"></span><span>${user.status}</span>`;
        }

        // Update Overview Tab Key-Value Meta Rows
        const valId = document.getElementById('meta-user-id');
        const valJoined = document.getElementById('meta-user-joined');
        const valLogin = document.getElementById('meta-user-last-login');
        const valEmailVer = document.getElementById('meta-email-verified');
        const valPhoneVer = document.getElementById('meta-phone-verified');

        if (valId) valId.textContent = user.id;
        if (valJoined) valJoined.textContent = user.joinedOnFull || user.joinedOn;
        if (valLogin) valLogin.textContent = user.lastLogin;
        if (valEmailVer) valEmailVer.textContent = user.emailVerified;
        if (valPhoneVer) valPhoneVer.textContent = user.phoneVerified;

        // Render Recent Activity Stream
        this.renderRecentActivity(user);

        // Render Security Tab
        this.renderSecurityTab(user);

        // Render Vaults Tab
        this.renderVaultsTab(user);
    },

    switchDetailsTab(tabName) {
        this.activeTab = tabName;
        document.querySelectorAll('.details-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
        });

        document.querySelectorAll('.details-tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `tab-panel-${tabName}`);
        });
    },

    renderRecentActivity(user) {
        const container = document.getElementById('recent-activity-list');
        if (!container) return;

        if (!user.recentActivity || user.recentActivity.length === 0) {
            container.innerHTML = `<p style="font-size: 0.74rem; color: var(--text-muted); padding: 0.5rem 0;">No recorded events.</p>`;
            return;
        }

        container.innerHTML = user.recentActivity.map(act => `
            <div class="activity-timeline-item">
                <div class="activity-bullet"></div>
                <div class="activity-meta">
                    <span class="activity-title">${act.action}</span>
                    <span class="activity-time">${act.timestamp} • ${act.status}</span>
                </div>
            </div>
        `).join('');
    },

    renderSecurityTab(user) {
        const container = document.getElementById('tab-panel-security');
        if (!container) return;

        const sec = user.securityDetails || { mfaMethod: 'Authenticator App', encryptionLevel: 'AES-256-GCM', failedLogins: 0, ipAddress: '192.168.1.1', trustedDevices: 1 };

        container.innerHTML = `
            <div class="meta-info-row">
                <span style="color: var(--text-secondary);">MFA Status</span>
                <span class="meta-info-value" style="color: ${user.mfaEnabled ? 'var(--emerald)' : 'var(--coral)'}; font-weight: 700;">
                    ${user.mfaEnabled ? 'Enabled' : 'Disabled'}
                </span>
            </div>
            <div class="meta-info-row">
                <span style="color: var(--text-secondary);">MFA Method</span>
                <span class="meta-info-value">${sec.mfaMethod}</span>
            </div>
            <div class="meta-info-row">
                <span style="color: var(--text-secondary);">Encryption</span>
                <span class="meta-info-value">${sec.encryptionLevel}</span>
            </div>
            <div class="meta-info-row">
                <span style="color: var(--text-secondary);">Failed Logins</span>
                <span class="meta-info-value">${sec.failedLogins}</span>
            </div>
            <div class="meta-info-row">
                <span style="color: var(--text-secondary);">Last Known IP</span>
                <span class="meta-info-value" style="font-family: var(--font-mono); font-size: 0.75rem;">${sec.ipAddress}</span>
            </div>
            <div class="meta-info-row">
                <span style="color: var(--text-secondary);">Trusted Devices</span>
                <span class="meta-info-value">${sec.trustedDevices ?? 1}</span>
            </div>
        `;
    },

    renderVaultsTab(user) {
        const container = document.getElementById('tab-panel-vaults');
        if (!container) return;

        if (!user.vaultsList || user.vaultsList.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.78rem; text-align: center; padding: 1rem 0;">No active vaults created yet.</p>`;
            return;
        }

        container.innerHTML = user.vaultsList.map(v => `
            <div style="background: var(--bg-card-subtle); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.65rem; font-size: 0.78rem;">
                <div style="font-weight: 700; color: var(--text-heading);">${v.name}</div>
                <div style="font-size: 0.72rem; color: var(--text-secondary); margin: 0.15rem 0;">${v.type}</div>
                <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--brand-orange); font-weight: 600;">
                    <span>${v.status}</span>
                    <span>${v.trigger}</span>
                </div>
            </div>
        `).join('');
    },

    /* =========================================================================
       11. Pagination Controls
       ========================================================================= */
    updatePagination(totalCount) {
        const infoEl = document.getElementById('pagination-info-text');
        if (infoEl) {
            const start = totalCount === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
            const end = Math.min(this.currentPage * this.pageSize, totalCount);
            infoEl.textContent = `Showing ${start}–${end} of ${totalCount.toLocaleString()} users`;
        }

        const totalPages = Math.max(1, Math.ceil(totalCount / this.pageSize));
        const prevBtn = document.getElementById('btn-page-prev');
        const nextBtn = document.getElementById('btn-page-next');

        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;
    },

    goToPage(page) {
        const totalPages = Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
        if (page < 1 || page > totalPages) return;
        this.currentPage = page;
        this.renderTable();
    },

    openRowMenu(event, userId) {
        event.stopPropagation();
        this.selectUser(userId);
        this.showToast(`Selected user ${userId}. Use the Inspector Panel on the right for actions.`, 'info');
    },

    /* =========================================================================
       12. CSV Export
       ========================================================================= */
    exportUsersCSV() {
        const usersToExport = this.filteredUsers.length > 0 ? this.filteredUsers : this.users;
        const headers = ["User ID", "Name", "Email", "Role", "Status", "Vaults", "Trustees", "Joined On"];
        const rows = usersToExport.map(u => [
            `"${u.id}"`,
            `"${u.name}"`,
            `"${u.email}"`,
            `"${u.role}"`,
            `"${u.status}"`,
            `"${u.vaults}"`,
            `"${u.trustees}"`,
            `"${u.joinedOn}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `aegisvault_users_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showToast(`Exported ${usersToExport.length} users to CSV`, 'success');
    }
};

// Backwards compatibility alias for inline HTML handlers
window.AegisInteractions = window.AegisUserManagement;

document.addEventListener('DOMContentLoaded', () => {
    window.AegisUserManagement.init();
});
