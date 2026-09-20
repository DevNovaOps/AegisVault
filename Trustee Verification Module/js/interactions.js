/**
 * AegisVault - UI Interactions & Event Management
 * Handles Theme Toggling, Global Search, Notifications Dropdown,
 * User Profile Dropdown, Modals, Toasts, and Mobile Drawer.
 */

const AegisInteractions = {
    // Current active modal id
    activeModal: null,

    /**
     * Initialize all interactive listeners
     */
    init() {
        this.initTheme();
        this.initSearch();
        this.initDropdowns();
        this.initModals();
        this.initSidebar();
        this.initFooterLinks();
        this.initKeyboardShortcuts();
    },

    /* =========================================================
       1. THEME SWITCHING (Dark Enterprise <-> Clean Light)
       ========================================================= */
    initTheme() {
        const themeToggleBtn = document.getElementById("btn-theme-toggle");
        const savedTheme = localStorage.getItem("aegis_theme") || "dark";

        if (savedTheme === "light") {
            document.body.classList.add("light-theme");
            this.updateThemeIcon("light");
        } else {
            document.body.classList.remove("light-theme");
            this.updateThemeIcon("dark");
        }

        if (themeToggleBtn) {
            themeToggleBtn.addEventListener("click", () => {
                const isLight = document.body.classList.toggle("light-theme");
                const newTheme = isLight ? "light" : "dark";
                localStorage.setItem("aegis_theme", newTheme);
                this.updateThemeIcon(newTheme);
                this.showToast(`Switched to ${newTheme} mode theme`, "info");
            });
        }
    },

    updateThemeIcon(theme) {
        const iconContainer = document.getElementById("theme-toggle-icon");
        if (!iconContainer) return;

        if (theme === "light") {
            // Sun icon
            iconContainer.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            `;
        } else {
            // Moon icon
            iconContainer.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            `;
        }
    },

    /* =========================================================
       2. GLOBAL SEARCH FUNCTIONALITY
       ========================================================= */
    initSearch() {
        const searchInput = document.getElementById("global-search-input");
        const searchDropdown = document.getElementById("search-results-dropdown");
        if (!searchInput || !searchDropdown) return;

        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (!query) {
                searchDropdown.classList.remove("active");
                searchDropdown.innerHTML = "";
                return;
            }

            const results = AegisData.searchCatalog.filter(item => 
                item.title.toLowerCase().includes(query) || 
                item.category.toLowerCase().includes(query)
            );

            if (results.length === 0) {
                searchDropdown.innerHTML = `
                    <div class="search-empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <span>No matches found for "${query}"</span>
                    </div>
                `;
            } else {
                searchDropdown.innerHTML = results.map(item => `
                    <div class="search-item" data-action="${item.link}" data-type="${item.type}">
                        <div class="search-item-info">
                            <span class="search-item-title">${item.title}</span>
                            <span class="search-item-category">${item.category}</span>
                        </div>
                        <span class="search-item-arrow">→</span>
                    </div>
                `).join('');
            }

            searchDropdown.classList.add("active");
        });

        // Click search result item
        searchDropdown.addEventListener("click", (e) => {
            const item = e.target.closest(".search-item");
            if (item) {
                const action = item.getAttribute("data-action");
                this.handleSearchNavigation(action);
                searchDropdown.classList.remove("active");
                searchInput.value = "";
            }
        });

        // Close on click outside
        document.addEventListener("click", (e) => {
            if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.classList.remove("active");
            }
        });
    },

    handleSearchNavigation(action) {
        if (action === "trustee-profile") {
            AegisVerification.openTrusteeModal();
        } else if (action === "methods-config") {
            AegisVerification.openMethodsModal();
        } else if (action === "suspicious-activity") {
            const el = document.getElementById("suspicious-activity-card");
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (action === "recent-activity") {
            AegisVerification.openActivityModal();
        } else if (action.startsWith("step-")) {
            const stepNum = action.replace("step-", "");
            const step = AegisData.verificationSteps.find(s => s.step == stepNum);
            if (step) AegisVerification.openStepModal(step.id);
        } else {
            this.showToast(`Navigating to ${action}...`, "info");
        }
    },

    /* =========================================================
       3. DROPDOWNS: Notifications, User Profile, 3-Dot Menu
       ========================================================= */
    initDropdowns() {
        // Notifications Dropdown
        const notifBtn = document.getElementById("btn-notifications");
        const notifDropdown = document.getElementById("notifications-dropdown");

        if (notifBtn && notifDropdown) {
            notifBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.closeAllDropdowns(notifDropdown);
                const isOpen = notifDropdown.classList.toggle("active");
                if (isOpen) this.renderNotifications();
            });
        }

        // User Profile Dropdown
        const userBtn = document.getElementById("user-profile-btn");
        const userDropdown = document.getElementById("user-profile-dropdown");

        if (userBtn && userDropdown) {
            userBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.closeAllDropdowns(userDropdown);
                userDropdown.classList.toggle("active");
            });
        }

        // Trustee 3-Dot Menu
        const trusteeMenuBtn = document.getElementById("btn-trustee-menu");
        const trusteeDropdown = document.getElementById("trustee-actions-dropdown");

        if (trusteeMenuBtn && trusteeDropdown) {
            trusteeMenuBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.closeAllDropdowns(trusteeDropdown);
                trusteeDropdown.classList.toggle("active");
            });
        }

        // Close dropdowns on outside click
        document.addEventListener("click", () => {
            this.closeAllDropdowns();
        });
    },

    closeAllDropdowns(exceptElement = null) {
        const dropdowns = [
            document.getElementById("notifications-dropdown"),
            document.getElementById("user-profile-dropdown"),
            document.getElementById("trustee-actions-dropdown"),
            document.getElementById("search-results-dropdown")
        ];

        dropdowns.forEach(dd => {
            if (dd && dd !== exceptElement) {
                dd.classList.remove("active");
            }
        });
    },

    renderNotifications() {
        const listContainer = document.getElementById("notifications-list-container");
        if (!listContainer) return;

        listContainer.innerHTML = AegisData.notifications.map(n => `
            <div class="notification-item ${n.read ? 'read' : 'unread'}">
                <div class="notif-header">
                    <span class="notif-title">${n.title}</span>
                    <span class="notif-time">${n.time}</span>
                </div>
                <div class="notif-message">${n.message}</div>
            </div>
        `).join('');

        // Clear badge after opening
        const badge = document.getElementById("notif-badge-indicator");
        if (badge) {
            badge.style.display = "none";
        }
    },

    /* =========================================================
       4. MODAL MANAGER
       ========================================================= */
    initModals() {
        // Modal close button bindings
        document.querySelectorAll(".modal-close-btn, .btn-modal-close").forEach(btn => {
            btn.addEventListener("click", () => {
                const modal = btn.closest(".modal-overlay");
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Click backdrop to close
        document.querySelectorAll(".modal-overlay").forEach(modal => {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    },

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.add("active");
        this.activeModal = modalId;
        document.body.style.overflow = "hidden"; // Prevent background scroll
    },

    closeModal(modalId) {
        const targetId = modalId || this.activeModal;
        if (!targetId) return;

        const modal = document.getElementById(targetId);
        if (modal) {
            modal.classList.remove("active");
        }
        this.activeModal = null;
        document.body.style.overflow = "";
    },

    /* =========================================================
       5. SIDEBAR NAVIGATION & MOBILE DRAWER
       ========================================================= */
    initSidebar() {
        const navContainer = document.getElementById("sidebar-nav-list");
        const hamburgerBtn = document.getElementById("btn-mobile-menu");
        const sidebar = document.getElementById("sidebar");
        const mobileOverlay = document.getElementById("mobile-overlay");

        if (navContainer) {
            navContainer.addEventListener("click", (e) => {
                const navItem = e.target.closest(".nav-item");
                if (!navItem) return;

                const itemId = navItem.getAttribute("data-nav-id");

                // Check if Trustee Verification
                if (itemId === "trustee-verification") {
                    navContainer.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
                    navItem.classList.add("active");
                } else {
                    // Informative module preview toast
                    const itemData = AegisData.navItems.find(i => i.id === itemId);
                    const label = itemData ? itemData.label : "Module";
                    this.showToast(`Module Preview: ${label} is active in companion enclave.`, "info");
                }

                // Close mobile drawer if open
                if (window.innerWidth <= 1024 && sidebar && sidebar.classList.contains("drawer-open")) {
                    this.closeMobileDrawer();
                }
            });
        }

        // Mobile hamburger toggle
        if (hamburgerBtn && sidebar && mobileOverlay) {
            hamburgerBtn.addEventListener("click", () => {
                sidebar.classList.toggle("drawer-open");
                mobileOverlay.classList.toggle("active");
            });

            mobileOverlay.addEventListener("click", () => {
                this.closeMobileDrawer();
            });
        }
    },

    closeMobileDrawer() {
        const sidebar = document.getElementById("sidebar");
        const mobileOverlay = document.getElementById("mobile-overlay");
        if (sidebar) sidebar.classList.remove("drawer-open");
        if (mobileOverlay) mobileOverlay.classList.remove("active");
    },

    /* =========================================================
       6. FOOTER LINKS (Privacy, Terms, Help)
       ========================================================= */
    initFooterLinks() {
        const links = [
            { id: "link-footer-privacy", title: "AegisVault Privacy Architecture", content: "AegisVault operates on zero-knowledge architecture. All vault payloads and secret shares are encrypted client-side using libsodium and WebCrypto before transmission. Neither Aegis administrators nor cloud providers hold decryption keys." },
            { id: "link-footer-terms", title: "Enterprise Service Agreement", content: "By utilizing AegisVault Trustee Verification, custodians agree to multi-party threshold governance rules. In the event of primary owner incapacitation, designated trustees must meet quorum requirements to reconstruct credentials." },
            { id: "link-footer-help", title: "Custodian Help & Support", content: "Need assistance with trustee onboarding or biometric hardware keys? Contact our dedicated Enterprise Cryptographic Concierge 24/7 at support@aegisvault.internal or call emergency dispatch." }
        ];

        links.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) {
                el.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.openInfoModal(item.title, item.content);
                });
            }
        });
    },

    openInfoModal(title, content) {
        const modalBody = document.getElementById("info-modal-body");
        const modalTitle = document.getElementById("info-modal-title");

        if (modalTitle) modalTitle.textContent = title;
        if (modalBody) {
            modalBody.innerHTML = `
                <p class="modal-info-text">${content}</p>
                <div class="modal-footer-actions">
                    <button class="btn btn-primary" onclick="AegisInteractions.closeModal('general-info-modal')">
                        Close
                    </button>
                </div>
            `;
        }

        this.openModal("general-info-modal");
    },

    /* =========================================================
       7. KEYBOARD SHORTCUTS (ESC to close, / for search)
       ========================================================= */
    initKeyboardShortcuts() {
        document.addEventListener("keydown", (e) => {
            // Close active modal or dropdown on Escape
            if (e.key === "Escape") {
                if (this.activeModal) {
                    this.closeModal(this.activeModal);
                } else {
                    this.closeAllDropdowns();
                }
            }

            // Press '/' to focus global search if not inside an input
            if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
                e.preventDefault();
                const searchInput = document.getElementById("global-search-input");
                if (searchInput) {
                    searchInput.focus();
                }
            }
        });
    },

    /* =========================================================
       8. TOAST NOTIFICATION SYSTEM
       ========================================================= */
    showToast(message, type = "info", duration = 3500) {
        let toastContainer = document.getElementById("toast-container");
        if (!toastContainer) {
            toastContainer = document.createElement("div");
            toastContainer.id = "toast-container";
            toastContainer.className = "toast-container";
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement("div");
        toast.className = `toast-message toast-${type}`;

        let iconSvg = "";
        if (type === "success") {
            iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        } else if (type === "warning") {
            iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        } else {
            iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        }

        toast.innerHTML = `
            ${iconSvg}
            <span class="toast-text">${message}</span>
            <button class="toast-close" aria-label="Close">&times;</button>
        `;

        toast.querySelector(".toast-close").addEventListener("click", () => {
            toast.classList.add("fade-out");
            setTimeout(() => toast.remove(), 300);
        });

        toastContainer.appendChild(toast);

        // Trigger entrance animation
        requestAnimationFrame(() => {
            toast.classList.add("visible");
        });

        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add("fade-out");
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }
};

window.AegisInteractions = AegisInteractions;
