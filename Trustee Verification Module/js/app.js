/**
 * AegisVault - Main Application Bootstrap
 * Orchestrates module initialization, sidebar rendering, and lifecycle handlers.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Render Sidebar Navigation Items
    renderSidebarNav();

    // 2. Initialize Interactions (Search, Theme, Modals, Dropdowns)
    AegisInteractions.init();

    // 3. Initialize Verification Core (Timeline, Rows, Methods, Rules, Activity)
    AegisVerification.init();

    // 4. Bind 3-Dot Trustee Menu Actions
    bindTrusteeDropdownActions();

    // 5. Scroll Animations via IntersectionObserver
    initScrollAnimations();

    console.log("AegisVault Trustee Verification Module v2.4 initialized successfully.");
});

/**
 * Render Sidebar Navigation from AegisData
 */
function renderSidebarNav() {
    const navContainer = document.getElementById("sidebar-nav-list");
    if (!navContainer) return;

    navContainer.innerHTML = AegisData.navItems.map(item => {
        const isActive = item.active;
        return `
            <li class="nav-item ${isActive ? 'active' : ''}" data-nav-id="${item.id}" role="button" tabindex="0">
                <span class="nav-icon">
                    ${getNavIcon(item.icon)}
                </span>
                <span class="nav-label">${item.label}</span>
                ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
            </li>
        `;
    }).join('');
}

/**
 * Return SVGs for Sidebar Navigation
 */
function getNavIcon(icon) {
    switch (icon) {
        case "grid":
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`;
        case "vault":
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="16" y1="12" x2="12" y2="12"></line></svg>`;
        case "plus-circle":
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`;
        case "folder":
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;
        case "key":
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-1.5 1.5L14 9m-1.5 1.5l-3 3-1.5-1.5-3 3 1.5 1.5L5 18l3-3 1.5 1.5 3-3m-1.5-1.5L16 7l2-2"></path><circle cx="7.5" cy="16.5" r="4.5"></circle></svg>`;
        case "users":
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
        case "activity":
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`;
        case "workflow":
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="6" height="6" rx="1"></rect><rect x="15" y="3" width="6" height="6" rx="1"></rect><rect x="9" y="15" width="6" height="6" rx="1"></rect><line x1="6" y1="9" x2="6" y2="12"></line><line x1="18" y1="9" x2="18" y2="12"></line><line x1="6" y1="12" x2="18" y2="12"></line><line x1="12" y1="12" x2="12" y2="15"></line></svg>`;
        case "bell":
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;
        case "unlock":
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`;
        case "badge-check":
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`;
        case "shield":
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
        case "clock":
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
        case "settings":
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;
        case "trash":
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
        default:
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>`;
    }
}

/**
 * Bind 3-dot dropdown actions on Trustee Card
 */
function bindTrusteeDropdownActions() {
    const dropdown = document.getElementById("trustee-actions-dropdown");
    if (!dropdown) return;

    dropdown.addEventListener("click", (e) => {
        const actionItem = e.target.closest(".dropdown-action-item");
        if (!actionItem) return;

        const action = actionItem.getAttribute("data-action");
        dropdown.classList.remove("active");

        if (action === "view-profile") {
            AegisVerification.openTrusteeModal();
        } else if (action === "verification-history") {
            AegisVerification.openActivityModal();
        } else if (action === "contact-trustee") {
            AegisVerification.contactTrustee(AegisData.trustee.email);
        } else if (action === "close") {
            // Simply closes
        }
    });
}

/**
 * Initialize scroll reveal micro-animations
 */
function initScrollAnimations() {
    if (!("IntersectionObserver" in window)) return;

    const cards = document.querySelectorAll(".card, .hero-section, .security-banner");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
    });

    cards.forEach(card => {
        card.classList.add("reveal-on-scroll");
        observer.observe(card);
    });
}
