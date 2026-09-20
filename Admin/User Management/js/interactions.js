/**
 * AegisVault — User Management Interactions & Modals
 * Handles dual theme switching, modals, dropdowns, keyboard shortcuts, and toast alerts.
 */

window.AegisInteractions = {
    THEME_KEY: 'aegisvault_theme',

    init() {
        this.initTheme();
        this.initHeaderDropdowns();
        this.initModals();
        this.initShortcuts();
    },

    // 1. Dual Theme System
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

        if (showNotice) {
            this.showToast(`Switched to ${isDark ? 'Dark Theme' : 'Light Theme'}`, 'info');
        }
    },

    // 2. Header Dropdowns
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

        // Mobile Hamburger
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

    // 3. Modals & Action Workflows
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
                    index: window.AegisUserManagement.users.length + 1,
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

                window.AegisUserManagement.users.unshift(newUser);
                window.AegisUserManagement.applyFilters();
                window.AegisUserManagement.selectUser(newId);

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
                const user = window.AegisUserManagement.users.find(u => u.id === window.AegisUserManagement.selectedUserId);
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
                const user = window.AegisUserManagement.users.find(u => u.id === window.AegisUserManagement.selectedUserId);
                if (!user) return;

                user.name = document.getElementById('edit-user-name')?.value.trim() || user.name;
                user.email = document.getElementById('edit-user-email')?.value.trim() || user.email;
                user.role = document.getElementById('edit-user-role')?.value || user.role;
                user.status = document.getElementById('edit-user-status')?.value || user.status;

                window.AegisUserManagement.renderTable();
                window.AegisUserManagement.selectUser(user.id);

                modalEdit.classList.remove('active');
                this.showToast(`Updated user details for ${user.name}`, 'success');
            });
        }

        // Reset Password Action
        const btnResetPwd = document.getElementById('btn-action-reset-pwd');
        if (btnResetPwd) {
            btnResetPwd.addEventListener('click', () => {
                const user = window.AegisUserManagement.users.find(u => u.id === window.AegisUserManagement.selectedUserId);
                if (!user) return;
                this.showToast(`Password reset link dispatched to ${user.email}`, 'info');
            });
        }

        // Suspend User Action
        const btnSuspend = document.getElementById('btn-action-suspend');
        if (btnSuspend) {
            btnSuspend.addEventListener('click', () => {
                const user = window.AegisUserManagement.users.find(u => u.id === window.AegisUserManagement.selectedUserId);
                if (!user) return;

                if (user.status === 'Suspended') {
                    user.status = 'Active';
                    this.showToast(`Reactivated access for ${user.name}`, 'success');
                } else {
                    user.status = 'Suspended';
                    this.showToast(`Suspended access for ${user.name}`, 'warning');
                }

                window.AegisUserManagement.renderTable();
                window.AegisUserManagement.selectUser(user.id);
            });
        }

        // Delete User Action
        const btnDelete = document.getElementById('btn-action-delete');
        if (btnDelete) {
            btnDelete.addEventListener('click', () => {
                const user = window.AegisUserManagement.users.find(u => u.id === window.AegisUserManagement.selectedUserId);
                if (!user) return;

                if (confirm(`Are you sure you want to permanently delete user ${user.name} (${user.id})?`)) {
                    window.AegisUserManagement.users = window.AegisUserManagement.users.filter(u => u.id !== user.id);
                    window.AegisUserManagement.applyFilters();
                    if (window.AegisUserManagement.users.length > 0) {
                        window.AegisUserManagement.selectUser(window.AegisUserManagement.users[0].id);
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

    // 4. Keyboard Shortcuts
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
            // "Escape" closes modals
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
                const sidebar = document.getElementById('app-sidebar');
                const backdrop = document.getElementById('sidebar-backdrop');
                if (sidebar) sidebar.classList.remove('active');
                if (backdrop) backdrop.classList.remove('active');
            }
        });
    },

    // 5. Toast Notification
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
        toast.innerHTML = `
            <span>${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.25s ease';
            setTimeout(() => toast.remove(), 250);
        }, 3200);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.AegisInteractions.init();
});
