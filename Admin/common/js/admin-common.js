/**
 * AegisVault — Admin Core Common Controller & UI Interactions
 * 
 * Centralized client-side script for Admin functionality:
 * - Dual Theme Management (Light / Dark) with persistence & event dispatch
 * - Toast Notification System (info, success, warning, error)
 * - Modal Dialog System (open, close, backdrop click, keyboard escape)
 * - Header Dropdowns (Notifications, Profile) & Click-outside auto-close
 * - Mobile Navigation Drawer & Backdrop
 * - Live Header / Hero Clock updates
 * - Global Keyboard Shortcuts (Esc, /, Ctrl+K, t)
 * - Automatic Sidebar Navigation Active Route synchronization
 * - Utility helpers: copyToClipboard, escapeHtml, debounce
 */

(function () {
    'use strict';

    const AegisAdminCommon = {
        THEME_KEY: 'aegisvault_theme',
        activeModal: null,
        clockTimer: null,

        /**
         * Initialize all common Admin controls
         */
        init() {
            this.initTheme();
            this.initHeaderDropdowns();
            this.initProfileMenu();
            this.initMobileDrawer();
            this.initModals();
            this.initKeyboardShortcuts();
            this.initGlobalSearch();
            this.initSidebarNavSync();
            this.startLiveClock();
        },

        /* =====================================================================
           1. Dual Theme System (Light / Dark)
           ===================================================================== */
        initTheme() {
            const savedTheme = localStorage.getItem(this.THEME_KEY) || localStorage.getItem('aegis_theme') || 'light';
            this.applyTheme(savedTheme, false);

            const toggleBtns = document.querySelectorAll('#btn-theme-toggle, .theme-toggle-btn');
            toggleBtns.forEach(btn => {
                // Prevent duplicate bindings
                if (btn.dataset.themeBound) return;
                btn.dataset.themeBound = 'true';

                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const currentTheme = this.isDark() ? 'dark' : 'light';
                    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                    this.applyTheme(newTheme, true);
                });
            });
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

            // Update tooltip/aria-label on toggle buttons
            const toggleBtns = document.querySelectorAll('#btn-theme-toggle, .theme-toggle-btn');
            toggleBtns.forEach(btn => {
                const label = isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme';
                btn.setAttribute('title', label);
                btn.setAttribute('aria-label', label);
            });

            localStorage.setItem(this.THEME_KEY, theme);
            localStorage.setItem('aegis_theme', theme);

            // Dispatch custom event for module charts/listeners
            const event = new CustomEvent('aegis:themechange', {
                detail: { theme, isDark }
            });
            window.dispatchEvent(event);
            document.dispatchEvent(event);

            if (showNotice) {
                this.showToast(`Switched to ${isDark ? 'Dark Theme' : 'Light Theme'}`, 'info');
            }
        },

        isDark() {
            return document.body.classList.contains('dark-theme') || 
                   document.documentElement.getAttribute('data-theme') === 'dark';
        },

        getTheme() {
            return this.isDark() ? 'dark' : 'light';
        },

        /* =====================================================================
           2. Toast Notification System
           ===================================================================== */
        showToast(message, type = 'info', duration = 3600) {
            let container = document.querySelector('.toast-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'toast-container';
                container.setAttribute('aria-live', 'polite');
                document.body.appendChild(container);
            }

            const toast = document.createElement('div');
            const normalizedType = type === 'danger' ? 'error' : type;
            toast.className = `toast-item toast-${normalizedType}`;
            toast.innerHTML = `
                <div class="toast-message">${this.escapeHtml(message)}</div>
                <button class="toast-close-btn" aria-label="Close notification">&times;</button>
            `;

            const closeBtn = toast.querySelector('.toast-close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    toast.classList.add('toast-fadeout');
                    setTimeout(() => toast.remove(), 250);
                });
            }

            container.appendChild(toast);

            setTimeout(() => {
                if (toast.parentNode) {
                    toast.classList.add('toast-fadeout');
                    setTimeout(() => toast.remove(), 250);
                }
            }, duration);
        },

        /* =====================================================================
           3. Modal Dialog Manager
           ===================================================================== */
        initModals() {
            // Close buttons
            document.querySelectorAll('[data-close-modal], .btn-close-modal').forEach(btn => {
                if (btn.dataset.modalBound) return;
                btn.dataset.modalBound = 'true';
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const modal = btn.closest('.modal-overlay');
                    if (modal && modal.id) {
                        this.closeModal(modal.id);
                    }
                });
            });

            // Backdrop clicks
            document.querySelectorAll('.modal-overlay').forEach(overlay => {
                if (overlay.dataset.overlayBound) return;
                overlay.dataset.overlayBound = 'true';
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay && overlay.id) {
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
            const id = modalId || this.activeModal;
            if (!id) return;
            const modal = document.getElementById(id);
            if (modal) {
                modal.classList.remove('active');
            }
            if (this.activeModal === id) {
                this.activeModal = null;
            }
            document.body.style.overflow = '';
        },

        /* =====================================================================
           4. Header Dropdowns & Mobile Navigation Drawer
           ===================================================================== */
        initHeaderDropdowns() {
            const notifBtn = document.getElementById('btn-notifications');
            const notifDropdown = document.getElementById('notifications-dropdown');
            const profileBtn = document.getElementById('user-profile-btn');
            const profileDropdown = document.getElementById('profile-dropdown');

            if (notifBtn && notifDropdown && !notifBtn.dataset.bound) {
                notifBtn.dataset.bound = 'true';
                notifBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (profileDropdown) profileDropdown.classList.remove('active');
                    notifDropdown.classList.toggle('active');
                });
            }

            if (profileBtn && profileDropdown && !profileBtn.dataset.bound) {
                profileBtn.dataset.bound = 'true';
                profileBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (notifDropdown) notifDropdown.classList.remove('active');
                    profileDropdown.classList.toggle('active');
                });
            }

            // Click outside to close dropdowns
            document.addEventListener('click', (e) => {
                if (notifDropdown && notifDropdown.classList.contains('active')) {
                    if (!notifDropdown.contains(e.target) && (!notifBtn || !notifBtn.contains(e.target))) {
                        notifDropdown.classList.remove('active');
                    }
                }
                if (profileDropdown && (profileDropdown.classList.contains('active') || profileDropdown.classList.contains('show'))) {
                    if (!profileDropdown.contains(e.target) && (!profileBtn || !profileBtn.contains(e.target))) {
                        profileDropdown.classList.remove('active', 'show');
                    }
                }
            });

            // Mark all read button
            const markReadBtn = document.getElementById('btn-mark-all-read');
            if (markReadBtn && !markReadBtn.dataset.bound) {
                markReadBtn.dataset.bound = 'true';
                markReadBtn.addEventListener('click', () => {
                    const unreadItems = document.querySelectorAll('.notification-item.unread');
                    unreadItems.forEach(item => item.classList.remove('unread'));
                    const badges = document.querySelectorAll('.notif-badge-pill, .notif-badge-indicator');
                    badges.forEach(b => b.style.display = 'none');
                    if (window.AegisMockData && Array.isArray(AegisMockData.notifications)) {
                        AegisMockData.notifications.forEach(n => { n.unread = false; });
                    }
                    this.showToast('All notifications marked as read', 'info');
                });
            }
        },

        /* =====================================================================
           4b. Profile Menu Actions & Security Settings Modal
           ===================================================================== */
        SETTINGS_STORAGE_KEY: 'aegis_admin_security_settings',

        initProfileMenu() {
            const profileDropdown = document.getElementById('profile-dropdown');
            if (!profileDropdown) return;

            const settingsBtn = document.getElementById('btn-profile-settings');
            const auditBtn = document.getElementById('btn-profile-audit');
            const signoutBtn = document.getElementById('btn-profile-signout');

            if (settingsBtn && !settingsBtn.dataset.bound) {
                settingsBtn.dataset.bound = 'true';
                settingsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.closeProfileDropdown();
                    this.openSecuritySettings();
                });
            }

            if (auditBtn && !auditBtn.dataset.bound) {
                auditBtn.dataset.bound = 'true';
                auditBtn.addEventListener('click', (e) => {
                    this.navigateToAuditLogs(e);
                });
            }

            if (signoutBtn && !signoutBtn.dataset.bound) {
                signoutBtn.dataset.bound = 'true';
                signoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.closeProfileDropdown();
                    this.signOut();
                });
            }

            // Universal fallback: bind any item by text content
            profileDropdown.querySelectorAll('.profile-menu-item').forEach(item => {
                if (item.dataset.menuBound) return;
                item.dataset.menuBound = 'true';
                const text = (item.textContent || '').trim().toLowerCase();

                if (text.includes('setting')) {
                    item.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.closeProfileDropdown();
                        this.openSecuritySettings();
                    });
                } else if (text.includes('audit')) {
                    item.addEventListener('click', (e) => {
                        this.navigateToAuditLogs(e);
                    });
                } else if (text.includes('sign out') || text.includes('logout') || text.includes('log out')) {
                    item.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.closeProfileDropdown();
                        this.signOut();
                    });
                }
            });
        },

        closeProfileDropdown() {
            const profileDropdown = document.getElementById('profile-dropdown');
            if (profileDropdown) {
                profileDropdown.classList.remove('active', 'show');
            }
        },

        navigateToAuditLogs(e) {
            if (e && e.preventDefault) e.preventDefault();
            this.closeProfileDropdown();
            const currentPath = window.location.pathname.toLowerCase();
            if (currentPath.includes('audit-logs.html')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                this.showToast('Already on Audit Logs Console', 'info');
            } else {
                window.location.href = '../Audit Logs/audit-logs.html';
            }
        },

        signOut() {
            this.closeProfileDropdown();
            this.showToast('Signing out... Redirecting to home', 'warning', 2000);
            try {
                localStorage.removeItem('aegis_admin_session');
            } catch (err) {}
            setTimeout(() => {
                window.location.href = '../../AegisVault Home/index.html';
            }, 500);
        },

        getDefaultSecuritySettings() {
            return {
                twoFactorAuth: true,
                sessionTimeout: '30',
                criticalReauth: true,
                anomalyAlerts: true,
                auditLevel: 'verbose',
                ipFencing: false,
                lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            };
        },

        getSecuritySettings() {
            try {
                const data = localStorage.getItem(this.SETTINGS_STORAGE_KEY);
                if (data) {
                    return { ...this.getDefaultSecuritySettings(), ...JSON.parse(data) };
                }
            } catch (e) {
                console.warn('Error reading admin settings:', e);
            }
            return this.getDefaultSecuritySettings();
        },

        injectSecuritySettingsModal() {
            if (document.getElementById('admin-security-settings-modal')) return;

            const modalHtml = `
            <div class="modal-overlay" id="admin-security-settings-modal" role="dialog" aria-modal="true" aria-labelledby="sec-modal-title">
                <div class="modal-dialog sec-settings-modal">
                    <div class="sec-settings-header">
                        <div class="sec-settings-header-left">
                            <div class="sec-settings-icon-bubble">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                </svg>
                            </div>
                            <div class="sec-settings-title-group">
                                <h3 id="sec-modal-title">Admin Security Settings</h3>
                                <p>Configure administrator authentication, session controls & security policies</p>
                            </div>
                        </div>
                        <button type="button" class="modal-close-btn" id="btn-close-sec-settings" aria-label="Close dialog">&times;</button>
                    </div>
                    
                    <div class="sec-settings-body">
                        <!-- Group 1: Authentication & Access -->
                        <div class="sec-settings-card">
                            <div class="sec-card-header">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                <span>Authentication & Access Control</span>
                            </div>

                            <div class="sec-row">
                                <div class="sec-row-info">
                                    <span class="sec-row-label">Two-Factor Authentication (2FA)</span>
                                    <span class="sec-row-desc">Require hardware FIDO2 key or authenticator app for admin login</span>
                                </div>
                                <label class="admin-switch">
                                    <input type="checkbox" id="sec-input-2fa">
                                    <span class="admin-switch-slider"></span>
                                </label>
                            </div>

                            <div class="sec-row">
                                <div class="sec-row-info">
                                    <span class="sec-row-label">Session Inactivity Timeout</span>
                                    <span class="sec-row-desc">Automatically lock administrative session after inactivity</span>
                                </div>
                                <select class="sec-select-control" id="sec-input-timeout">
                                    <option value="15">15 Minutes</option>
                                    <option value="30">30 Minutes (Recommended)</option>
                                    <option value="60">1 Hour</option>
                                    <option value="240">4 Hours</option>
                                    <option value="480">8 Hours</option>
                                </select>
                            </div>

                            <div class="sec-row">
                                <div class="sec-row-info">
                                    <span class="sec-row-label">Strict IP Range Fencing</span>
                                    <span class="sec-row-desc">Restrict admin console access to authorized corporate subnets</span>
                                </div>
                                <label class="admin-switch">
                                    <input type="checkbox" id="sec-input-ip-fence">
                                    <span class="admin-switch-slider"></span>
                                </label>
                            </div>
                        </div>

                        <!-- Group 2: Safeguards & Alerts -->
                        <div class="sec-settings-card">
                            <div class="sec-card-header">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                </svg>
                                <span>Safeguards & Anomaly Detection</span>
                            </div>

                            <div class="sec-row">
                                <div class="sec-row-info">
                                    <span class="sec-row-label">Critical Action Confirmation</span>
                                    <span class="sec-row-desc">Prompt re-authentication before vault deletion or policy revokes</span>
                                </div>
                                <label class="admin-switch">
                                    <input type="checkbox" id="sec-input-reauth">
                                    <span class="admin-switch-slider"></span>
                                </label>
                            </div>

                            <div class="sec-row">
                                <div class="sec-row-info">
                                    <span class="sec-row-label">Suspicious Activity Alerts</span>
                                    <span class="sec-row-desc">Send immediate notifications on unknown device or Geo-IP login</span>
                                </div>
                                <label class="admin-switch">
                                    <input type="checkbox" id="sec-input-alerts">
                                    <span class="admin-switch-slider"></span>
                                </label>
                            </div>

                            <div class="sec-row">
                                <div class="sec-row-info">
                                    <span class="sec-row-label">Audit Logging Granularity</span>
                                    <span class="sec-row-desc">Level of administrative audit trail telemetry retained</span>
                                </div>
                                <select class="sec-select-control" id="sec-input-audit-level">
                                    <option value="verbose">Verbose (All Reads & Writes)</option>
                                    <option value="standard">Standard (State Changes)</option>
                                    <option value="critical">Critical Only (Errors & Breaches)</option>
                                </select>
                            </div>
                        </div>

                        <!-- Group 3: Active Sessions -->
                        <div class="sec-settings-card">
                            <div class="sec-card-header">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                    <line x1="8" y1="21" x2="16" y2="21"></line>
                                    <line x1="12" y1="17" x2="12" y2="21"></line>
                                </svg>
                                <span>Active Admin Sessions</span>
                            </div>

                            <div class="sec-session-item">
                                <div class="sec-session-left">
                                    <div class="sec-session-indicator" title="Current Active Session"></div>
                                    <div>
                                        <div class="sec-session-title">Current Workstation (Active)</div>
                                        <div class="sec-session-sub">Chrome on Windows &bull; 192.168.1.105 &bull; Authenticated</div>
                                    </div>
                                </div>
                                <button type="button" class="btn-sec-action btn-sec-danger-outline" id="btn-sec-revoke-other">
                                    Revoke Other Sessions
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn-sec-action btn-sec-outline" id="btn-cancel-sec-settings">Cancel</button>
                        <button type="button" class="btn-sec-action btn-sec-primary" id="btn-save-sec-settings">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Save Settings</span>
                        </button>
                    </div>
                </div>
            </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Bind modal buttons
            const modalEl = document.getElementById('admin-security-settings-modal');
            const closeBtn = document.getElementById('btn-close-sec-settings');
            const cancelBtn = document.getElementById('btn-cancel-sec-settings');
            const saveBtn = document.getElementById('btn-save-sec-settings');
            const revokeBtn = document.getElementById('btn-sec-revoke-other');

            if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal('admin-security-settings-modal'));
            if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeModal('admin-security-settings-modal'));

            if (modalEl) {
                modalEl.addEventListener('click', (e) => {
                    if (e.target === modalEl) this.closeModal('admin-security-settings-modal');
                });
            }

            if (saveBtn) {
                saveBtn.addEventListener('click', () => this.saveSecuritySettings());
            }

            if (revokeBtn) {
                revokeBtn.addEventListener('click', () => {
                    this.showToast('All 2 other active administrator sessions have been terminated', 'info');
                });
            }
        },

        openSecuritySettings() {
            this.injectSecuritySettingsModal();
            const settings = this.getSecuritySettings();

            const input2fa = document.getElementById('sec-input-2fa');
            const inputTimeout = document.getElementById('sec-input-timeout');
            const inputIpFence = document.getElementById('sec-input-ip-fence');
            const inputReauth = document.getElementById('sec-input-reauth');
            const inputAlerts = document.getElementById('sec-input-alerts');
            const inputAudit = document.getElementById('sec-input-audit-level');

            if (input2fa) input2fa.checked = !!settings.twoFactorAuth;
            if (inputTimeout) inputTimeout.value = settings.sessionTimeout || '30';
            if (inputIpFence) inputIpFence.checked = !!settings.ipFencing;
            if (inputReauth) inputReauth.checked = !!settings.criticalReauth;
            if (inputAlerts) inputAlerts.checked = !!settings.anomalyAlerts;
            if (inputAudit) inputAudit.value = settings.auditLevel || 'verbose';

            this.openModal('admin-security-settings-modal');
        },

        saveSecuritySettings() {
            const input2fa = document.getElementById('sec-input-2fa');
            const inputTimeout = document.getElementById('sec-input-timeout');
            const inputIpFence = document.getElementById('sec-input-ip-fence');
            const inputReauth = document.getElementById('sec-input-reauth');
            const inputAlerts = document.getElementById('sec-input-alerts');
            const inputAudit = document.getElementById('sec-input-audit-level');

            const updated = {
                twoFactorAuth: input2fa ? input2fa.checked : true,
                sessionTimeout: inputTimeout ? inputTimeout.value : '30',
                ipFencing: inputIpFence ? inputIpFence.checked : false,
                criticalReauth: inputReauth ? inputReauth.checked : true,
                anomalyAlerts: inputAlerts ? inputAlerts.checked : true,
                auditLevel: inputAudit ? inputAudit.value : 'verbose',
                lastUpdated: new Date().toISOString()
            };

            try {
                localStorage.setItem(this.SETTINGS_STORAGE_KEY, JSON.stringify(updated));
            } catch (e) {
                console.error('Error saving security settings:', e);
            }

            this.closeModal('admin-security-settings-modal');
            this.showToast('Security settings updated successfully', 'success');
        },

        initMobileDrawer() {
            const hamburgerBtn = document.getElementById('btn-hamburger') || document.getElementById('btn-mobile-menu');
            const sidebar = document.getElementById('app-sidebar');
            const backdrop = document.getElementById('sidebar-backdrop');

            if (hamburgerBtn && sidebar && backdrop && !hamburgerBtn.dataset.bound) {
                hamburgerBtn.dataset.bound = 'true';
                hamburgerBtn.addEventListener('click', () => {
                    sidebar.classList.toggle('open');
                    backdrop.classList.toggle('active');
                });

                backdrop.addEventListener('click', () => {
                    sidebar.classList.remove('open');
                    backdrop.classList.remove('active');
                });
            }
        },

        /* =====================================================================
           5. Live Clock System
           ===================================================================== */
        startLiveClock() {
            const dateEl = document.getElementById('hero-live-date');
            const timeEl = document.getElementById('hero-live-time');
            const clockEl = document.getElementById('current-live-time');
            if (!dateEl && !timeEl && !clockEl) return;

            const updateClock = () => {
                const now = new Date();
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                const dayName = days[now.getDay()];
                const date = now.getDate();
                const month = months[now.getMonth()];
                const year = now.getFullYear();

                let hours = now.getHours();
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12 || 12;

                if (dateEl) dateEl.textContent = `${dayName}, ${date} ${month} ${year}`;
                if (timeEl) timeEl.textContent = `${hours}:${minutes} ${ampm}`;
                if (clockEl) clockEl.textContent = `${dayName}, ${date} ${month} ${year} ${hours}:${minutes} ${ampm}`;
            };

            updateClock();
            if (this.clockTimer) clearInterval(this.clockTimer);
            this.clockTimer = setInterval(updateClock, 30000);
        },

        /* =====================================================================
           6. Global Search & Keyboard Shortcuts
           ===================================================================== */
        initGlobalSearch() {
            const searchInput = document.getElementById('global-header-search') || 
                                document.getElementById('global-search-input');
            const searchDropdown = document.getElementById('search-results-dropdown') || 
                                   document.getElementById('search-dropdown');

            if (searchInput && searchDropdown && !searchInput.dataset.bound) {
                searchInput.dataset.bound = 'true';

                searchInput.addEventListener('focus', () => {
                    if (searchInput.value.trim().length > 0) {
                        searchDropdown.classList.add('active');
                    }
                });

                document.addEventListener('click', (e) => {
                    if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
                        searchDropdown.classList.remove('active');
                    }
                });
            }
        },

        initKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // ESC dismisses active modal or dropdowns
                if (e.key === 'Escape') {
                    if (this.activeModal) {
                        this.closeModal(this.activeModal);
                    }
                    const searchDropdown = document.querySelector('.search-dropdown.active, .search-results-dropdown.active');
                    if (searchDropdown) searchDropdown.classList.remove('active');
                    const notifDropdown = document.querySelector('.notifications-dropdown.active');
                    if (notifDropdown) notifDropdown.classList.remove('active');
                    const profileDropdown = document.querySelector('.profile-dropdown.active');
                    if (profileDropdown) profileDropdown.classList.remove('active');
                }

                // "/" or Ctrl+K focuses global search
                if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) &&
                    document.activeElement.tagName !== 'INPUT' &&
                    document.activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    const input = document.getElementById('global-header-search') || 
                                  document.getElementById('global-search-input');
                    if (input) {
                        input.focus();
                        input.select();
                    }
                }

                // "t" or "T" toggles theme
                if ((e.key === 't' || e.key === 'T') &&
                    document.activeElement.tagName !== 'INPUT' &&
                    document.activeElement.tagName !== 'TEXTAREA') {
                    const btn = document.getElementById('btn-theme-toggle') || document.querySelector('.theme-toggle-btn');
                    if (btn) btn.click();
                }
            });
        },

        /* =====================================================================
           7. Sidebar Active Link Route Sync
           ===================================================================== */
        initSidebarNavSync() {
            const currentPath = window.location.pathname.toLowerCase();
            const navLinks = document.querySelectorAll('.nav-link-item');
            
            navLinks.forEach(link => {
                const href = (link.getAttribute('href') || '').toLowerCase();
                if (!href || href === '#' || href.startsWith('javascript:')) return;

                const fileName = href.split('/').pop().split('#')[0];
                if (fileName && currentPath.endsWith(fileName)) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        },

        /* =====================================================================
           8. Shared Utility Functions
           ===================================================================== */
        escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        },

        copyToClipboard(text, successMessage = 'Copied to clipboard!') {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    this.showToast(successMessage, 'success');
                }).catch(() => {
                    this.fallbackCopyToClipboard(text, successMessage);
                });
            } else {
                this.fallbackCopyToClipboard(text, successMessage);
            }
        },

        fallbackCopyToClipboard(text, successMessage) {
            try {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                this.showToast(successMessage, 'success');
            } catch (err) {
                this.showToast('Unable to copy to clipboard', 'warning');
            }
        },

        debounce(func, delay = 250) {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), delay);
            };
        }
    };

    // Export namespace
    window.AegisAdminCommon = AegisAdminCommon;
    window.AegisCommon = AegisAdminCommon;

    // Ensure backwards compatibility with inline handlers referencing window.AegisInteractions
    if (!window.AegisInteractions) {
        window.AegisInteractions = AegisAdminCommon;
    } else {
        // Merge common functions into existing object without overwriting module-specific methods
        Object.keys(AegisAdminCommon).forEach(key => {
            if (typeof window.AegisInteractions[key] === 'undefined') {
                window.AegisInteractions[key] = AegisAdminCommon[key];
            }
        });
    }

    // Initialize immediately if DOM is ready, otherwise on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AegisAdminCommon.init());
    } else {
        AegisAdminCommon.init();
    }
})();
