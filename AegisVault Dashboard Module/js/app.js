/**
 * AegisVault — Main Application Bootstrap
 * Initializes core modules, attaches navigation event listeners,
 * and configures modal actions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Interactions & Dashboard Subsystems
    AegisInteractions.init();
    AegisDashboard.init();

    // 2. Setup Sidebar Navigation Items
    setupSidebarNav();

    // 3. Setup Modal Trigger Buttons (View All, Stats, etc.)
    setupModalTriggers();

    console.log('AegisVault Dashboard Module initialized successfully.');
});

/**
 * Configure Sidebar Navigation Items
 */
function setupSidebarNav() {
    const navItems = document.querySelectorAll('.sidebar-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = item.querySelector('span')?.textContent.trim() || 'Item';

            // If it's already active, don't re-toggle
            if (item.classList.contains('active')) {
                AegisInteractions.showToast(`Already viewing ${sectionName}`, 'info');
                return;
            }

            // Remove active from all and set on clicked
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Close mobile drawer if open
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('mobile-overlay');
            if (sidebar && overlay) {
                sidebar.classList.remove('drawer-open');
                overlay.classList.remove('active');
            }

            AegisInteractions.showToast(`Navigated to: ${sectionName}`, 'info');
        });
    });
}

/**
 * Configure "View All" and Other Interactive Triggers
 */
function setupModalTriggers() {
    // Activity View All
    const viewAllActivityBtn = document.getElementById('btn-view-all-activity');
    if (viewAllActivityBtn) {
        viewAllActivityBtn.addEventListener('click', (e) => {
            e.preventDefault();
            renderAllActivityModal();
            AegisInteractions.openModal('all-activity-modal');
        });
    }

    // Trustee Updates View All
    const viewAllUpdatesBtn = document.getElementById('btn-view-all-updates');
    if (viewAllUpdatesBtn) {
        viewAllUpdatesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            AegisInteractions.openModal('all-updates-modal');
        });
    }

    // Assigned Vaults View All
    const viewAllVaultsBtn = document.getElementById('btn-view-all-vaults');
    if (viewAllVaultsBtn) {
        viewAllVaultsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            AegisDashboard.openVaultDetails('vlt_001');
        });
    }

    // Modal Close Buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = btn.getAttribute('data-close-modal');
            AegisInteractions.closeModal(modalId);
        });
    });

    // Close on clicking modal backdrop
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                AegisInteractions.closeModal(modal.id);
            }
        });
    });
}

/**
 * Render All Activity Modal with Category Filter Support
 */
function renderAllActivityModal() {
    const listEl = document.getElementById('all-activity-list-container');
    if (!listEl) return;

    listEl.innerHTML = AegisData.recentActivity.map(act => `
        <div class="activity-row" style="padding: 0.75rem 0.5rem; border-bottom: 1px solid var(--border-subtle);">
            <div class="activity-circle-icon" style="background-color: ${act.iconColor}1a; color: ${act.iconColor};">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div class="activity-details-col">
                <div class="activity-item-title">${act.title}</div>
                <div class="activity-item-time">${act.timestamp}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${act.details}</div>
            </div>
        </div>
    `).join('');
}
