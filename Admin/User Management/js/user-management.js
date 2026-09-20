/**
 * AegisVault — User Management Core Controller
 * Handles table rendering, dynamic filtering, search, pagination,
 * and synchronizing user selection with the User Details inspector card.
 */

window.AegisUserManagement = {
    users: [],
    filteredUsers: [],
    currentPage: 1,
    pageSize: 10,
    selectedUserId: "USR001248",
    activeTab: "overview",

    init() {
        this.users = [...(window.AegisMockUsers || [])];
        this.filteredUsers = [...this.users];
        
        this.initEventListeners();
        this.renderTable();
        this.selectUser(this.selectedUserId);
        this.updateKPIs();
    },

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

        // Select All Checkbox
        const selectAllCb = document.getElementById('checkbox-select-all');
        if (selectAllCb) {
            selectAllCb.addEventListener('change', (e) => {
                const rowCheckboxes = document.querySelectorAll('.table-row-checkbox');
                rowCheckboxes.forEach(cb => cb.checked = e.target.checked);
            });
        }

        // Details Panel Tabs
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
                    window.AegisInteractions.showToast('Inspector panel collapsed. Click any row to expand.', 'info');
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
        const date = document.getElementById('filter-date')?.value || 'all';
        const search = document.getElementById('user-table-search')?.value.trim().toLowerCase() || '';

        this.filteredUsers = this.users.filter(u => {
            const matchRole = role === 'all' || u.role.toLowerCase() === role.toLowerCase();
            const matchStatus = status === 'all' || u.status.toLowerCase() === status.toLowerCase();
            const matchDate = date === 'all' || u.joinedOn.toLowerCase().includes(date.toLowerCase());
            const matchSearch = !search || (
                u.name.toLowerCase().includes(search) ||
                u.email.toLowerCase().includes(search) ||
                u.id.toLowerCase().includes(search)
            );

            return matchRole && matchStatus && matchDate && matchSearch;
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
        window.AegisInteractions.showToast('Filters reset to default', 'info');
    },

    renderTable() {
        const tbody = document.getElementById('users-table-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.filteredUsers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                        <div style="font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem;">No users found</div>
                        <p style="font-size: 0.8rem;">Try adjusting your search query or active filter selections.</p>
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

            const roleClass = u.role.toLowerCase() === 'owner' ? 'owner' : 'trustee';
            const statusClass = u.status.toLowerCase();

            tr.innerHTML = `
                <td>
                    <input type="checkbox" class="table-checkbox table-row-checkbox" onclick="event.stopPropagation();">
                </td>
                <td style="color: var(--text-secondary); font-weight: 600;">${startIndex + i + 1}</td>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar-pill">${u.initials}</div>
                        <span class="user-name-text">${u.name}</span>
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
                <td style="font-weight: 600; text-align: center;">${u.vaults}</td>
                <td style="font-weight: 600; text-align: center;">${u.trustees}</td>
                <td style="color: var(--text-secondary);">${u.joinedOn}</td>
                <td>
                    <button class="btn-row-action" title="More Actions" onclick="event.stopPropagation(); window.AegisUserManagement.openRowMenu(event, '${u.id}');">
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

    selectUser(id) {
        this.selectedUserId = id;
        const user = this.users.find(u => u.id === id);
        if (!user) return;

        // Highlight selected row in table
        document.querySelectorAll('#users-table-tbody tr').forEach(r => {
            if (r.getAttribute('data-user-id') === id) {
                r.classList.add('row-selected');
            } else {
                r.classList.remove('row-selected');
            }
        });

        // Ensure Details Panel is visible
        const detailsPanel = document.getElementById('user-details-panel');
        if (detailsPanel) detailsPanel.style.display = 'flex';

        // Update Details Panel Header & Identity
        const avatarEl = document.getElementById('details-user-avatar');
        const nameEl = document.getElementById('details-user-name');
        const emailEl = document.getElementById('details-user-email');
        const idEl = document.getElementById('details-user-id');
        const statusEl = document.getElementById('details-user-status');

        if (avatarEl) avatarEl.textContent = user.initials;
        if (nameEl) nameEl.textContent = user.name;
        if (emailEl) emailEl.textContent = user.email;
        if (idEl) idEl.textContent = `User ID: ${user.id}`;
        
        if (statusEl) {
            statusEl.className = `badge-status ${user.status.toLowerCase()}`;
            statusEl.innerHTML = `<span class="status-dot"></span><span>${user.status}</span>`;
        }

        // Update Overview Tab Fields
        const valRole = document.getElementById('meta-val-role');
        const valJoined = document.getElementById('meta-val-joined');
        const valLogin = document.getElementById('meta-val-lastlogin');
        const valEmailVer = document.getElementById('meta-val-emailver');
        const valPhoneVer = document.getElementById('meta-val-phonever');
        const valVaults = document.getElementById('meta-val-vaults');
        const valTrustees = document.getElementById('meta-val-trustees');

        if (valRole) valRole.textContent = user.roleTitle || user.role;
        if (valJoined) valJoined.textContent = user.joinedOnFull || user.joinedOn;
        if (valLogin) valLogin.textContent = user.lastLogin;
        if (valEmailVer) valEmailVer.textContent = user.emailVerified;
        if (valPhoneVer) valPhoneVer.textContent = user.phoneVerified;
        if (valVaults) valVaults.textContent = user.vaults;
        if (valTrustees) valTrustees.textContent = user.trustees;

        // Render other tabs
        this.renderActivityTab(user);
        this.renderSecurityTab(user);
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

    renderActivityTab(user) {
        const container = document.getElementById('tab-panel-activity');
        if (!container) return;

        if (!user.recentActivity || user.recentActivity.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.78rem;">No recent audit activity.</p>`;
            return;
        }

        container.innerHTML = user.recentActivity.map(act => `
            <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.78rem;">
                <div style="font-weight: 700; color: var(--text-heading);">${act.action}</div>
                <div style="display: flex; justify-content: space-between; color: var(--text-muted); font-size: 0.72rem; margin-top: 0.15rem;">
                    <span>${act.timestamp}</span>
                    <span style="color: var(--emerald); font-weight: 600;">${act.status}</span>
                </div>
            </div>
        `).join('');
    },

    renderSecurityTab(user) {
        const container = document.getElementById('tab-panel-security');
        if (!container) return;
        const sec = user.securityDetails || {};

        container.innerHTML = `
            <div class="meta-info-row">
                <span style="color: var(--text-secondary);">MFA Method</span>
                <span class="meta-info-value">${sec.mfaMethod || 'TOTP'}</span>
            </div>
            <div class="meta-info-row">
                <span style="color: var(--text-secondary);">Encryption Tier</span>
                <span class="meta-info-value">${sec.encryptionLevel || 'AES-256-GCM'}</span>
            </div>
            <div class="meta-info-row">
                <span style="color: var(--text-secondary);">Failed Attempts</span>
                <span class="meta-info-value">${sec.failedLogins ?? 0}</span>
            </div>
            <div class="meta-info-row">
                <span style="color: var(--text-secondary);">Last Known IP</span>
                <span class="meta-info-value" style="font-family: var(--font-mono);">${sec.ipAddress || '103.21.124.58'}</span>
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
        window.AegisInteractions.showToast(`Actions menu opened for ${userId}`, 'info');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.AegisUserManagement.init();
});
