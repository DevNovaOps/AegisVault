/**
 * AegisVault — Trustee Management Module Controller
 * Handles dual themes, tabs, filtering, pagination, pure SVG donut charts,
 * Add/Edit/View/Deactivate trustee workflows, and Invitations section.
 */

(function () {
    'use strict';

    // Module State
    const state = {
        theme: 'light',
        activeTab: 'all',
        searchQuery: '',
        filterType: 'all',
        filterStatus: 'all',
        filterVault: 'all',
        currentPage: 1,
        pageSize: 10,
        selectedTrusteeIds: new Set(),
        trustees: [],
        invitations: []
    };

    // DOM Elements Cache
    const el = {};

    function initElements() {
        el.body = document.body;
        el.html = document.documentElement;
        el.themeToggleBtn = document.getElementById('btn-theme-toggle');
        el.tableBody = document.getElementById('trustee-table-body');
        el.tableSearch = document.getElementById('trustee-table-search');
        el.filterType = document.getElementById('filter-trustee-type');
        el.filterStatus = document.getElementById('filter-verification-status');
        el.filterVault = document.getElementById('filter-vault');
        el.paginationInfo = document.getElementById('pagination-info');
        el.paginationBtns = document.getElementById('pagination-btns-container');
        el.selectAllCheckbox = document.getElementById('select-all-trustees');
        el.donutSvg = document.getElementById('verification-donut-svg');
        el.donutLegend = document.getElementById('donut-legend-container');
        el.progressContainer = document.getElementById('trustee-types-progress-container');
        el.toastContainer = document.getElementById('toast-container');
        el.tooltip = document.getElementById('aegis-tooltip');
        el.globalSearch = document.getElementById('global-header-search');
        el.hamburgerBtn = document.getElementById('btn-hamburger');
        el.appSidebar = document.getElementById('app-sidebar');
        el.sidebarBackdrop = document.getElementById('sidebar-backdrop');
        el.notifBtn = document.getElementById('btn-notifications');
        el.notifDropdown = document.getElementById('notifications-dropdown');
        el.profileBtn = document.getElementById('user-profile-btn');
        el.profileDropdown = document.getElementById('profile-dropdown');
        el.btnExport = document.getElementById('btn-export-trustees');

        // Views
        el.mainGrid = document.getElementById('trustees-main-section');
        el.filterRow = document.getElementById('trustees-filter-row');
        el.invitationsView = document.getElementById('invitations-view-section');
        el.invitationsTableBody = document.getElementById('invitations-table-body');
        el.permissionsView = document.getElementById('permissions-view-section');
        el.matrixTbody = document.getElementById('matrix-tbody');
        el.accessTbody = document.getElementById('access-tbody');

        // Modals
        el.modalAddTrustee = document.getElementById('modal-add-trustee');
        el.formAddTrustee = document.getElementById('form-add-trustee');
        el.btnOpenAddTrustee = document.getElementById('btn-open-add-trustee');
        el.modalViewTrustee = document.getElementById('modal-view-trustee');
        el.viewTrusteeContent = document.getElementById('view-trustee-content');
        el.modalEditTrustee = document.getElementById('modal-edit-trustee');
        el.formEditTrustee = document.getElementById('form-edit-trustee');
        el.modalDeactivate = document.getElementById('modal-deactivate-trustee');
        el.btnConfirmDeactivate = document.getElementById('btn-confirm-deactivate');
        el.deactTrusteeName = document.getElementById('deact-trustee-name');
        el.modalInvite = document.getElementById('modal-invite-trustee');
        el.formInvite = document.getElementById('form-invite-trustee');
        el.btnOpenInviteTrustee = document.getElementById('btn-open-invite-trustee');

        // Reject Modal
        el.modalReject = document.getElementById('modal-reject-trustee');
        el.formReject = document.getElementById('form-reject-trustee');
        el.rejectTrusteeId = document.getElementById('reject-trustee-id');
        el.rejectTrusteeName = document.getElementById('reject-trustee-name');

        // Permission Modal
        el.modalPerms = document.getElementById('modal-trustee-permissions');
        el.formPerms = document.getElementById('form-trustee-permissions');
        el.permTrusteeId = document.getElementById('perm-trustee-id');
        el.permTrusteeName = document.getElementById('perm-trustee-name');
        el.permTrusteeSub = document.getElementById('perm-trustee-sub');
        el.permTrusteeBadge = document.getElementById('perm-trustee-badge');

        // Quick Actions
        el.quickVerifyDocs = document.getElementById('quick-action-verify-docs');
        el.quickManagePerms = document.getElementById('quick-action-manage-perms');
    }

    // =========================================================================
    // 1. Theme Management (Synced with AegisAdminCommon)
    // =========================================================================
    function initTheme() {
        state.theme = window.AegisAdminCommon ? (AegisAdminCommon.isDark() ? 'dark' : 'light') : (localStorage.getItem('aegisvault_theme') || 'light');
        window.addEventListener('aegis:themechange', (e) => {
            state.theme = e.detail && e.detail.isDark ? 'dark' : 'light';
            renderDonutChart();
        });
    }

    // =========================================================================
    // 2. Data Initialization
    // =========================================================================
    function initData() {
        if (window.AegisTrusteeMockData) {
            state.trustees = JSON.parse(JSON.stringify(window.AegisTrusteeMockData.trustees));
            state.invitations = JSON.parse(JSON.stringify(window.AegisTrusteeMockData.invitations));
        }
    }

    // =========================================================================
    // 3. Table Filtering & Pagination
    // =========================================================================
    function getFilteredTrustees() {
        return state.trustees.filter(item => {
            // Tab filter
            if (state.activeTab === 'pending' && item.status !== 'Pending') return false;
            if (state.activeTab === 'verified' && item.status !== 'Verified') return false;
            if (state.activeTab === 'rejected' && item.status !== 'Rejected') return false;
            if (state.activeTab === 'inactive' && item.status !== 'Inactive') return false;

            // Search query filter
            if (state.searchQuery) {
                const q = state.searchQuery.toLowerCase();
                const matchName = item.name.toLowerCase().includes(q);
                const matchEmail = item.email.toLowerCase().includes(q);
                const matchId = item.id.toLowerCase().includes(q);
                if (!matchName && !matchEmail && !matchId) return false;
            }

            // Dropdown filters
            if (state.filterType !== 'all' && item.trusteeType !== state.filterType) return false;
            if (state.filterStatus !== 'all' && item.status !== state.filterStatus) return false;
            if (state.filterVault !== 'all' && !item.linkedVaults.includes(state.filterVault)) return false;

            return true;
        });
    }

    function renderTrusteeTable() {
        if (!el.tableBody) return;

        const filtered = getFilteredTrustees();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / state.pageSize));

        if (state.currentPage > totalPages) state.currentPage = totalPages;

        const startIndex = (state.currentPage - 1) * state.pageSize;
        const endIndex = Math.min(startIndex + state.pageSize, total);
        const pageItems = filtered.slice(startIndex, endIndex);

        if (pageItems.length === 0) {
            el.tableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.5rem; opacity: 0.6;">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <div>No trustees found matching your current filter criteria.</div>
                    </td>
                </tr>
            `;
        } else {
            el.tableBody.innerHTML = pageItems.map(t => {
                const typeClass = t.trusteeType.toLowerCase().replace(' ', '-');
                const statusClass = t.status.toLowerCase();
                const isChecked = state.selectedTrusteeIds.has(t.id) ? 'checked' : '';

                let statusIconSvg = '';
                if (t.status === 'Verified') {
                    statusIconSvg = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                } else if (t.status === 'Pending') {
                    statusIconSvg = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
                } else if (t.status === 'Rejected') {
                    statusIconSvg = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
                } else {
                    statusIconSvg = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle></svg>';
                }

                return `
                    <tr data-id="${t.id}">
                        <td><input type="checkbox" class="custom-checkbox row-checkbox" data-id="${t.id}" ${isChecked} aria-label="Select trustee ${t.name}"></td>
                        <td style="color: var(--text-muted); font-weight: 500;">${t.index}</td>
                        <td>
                            <div class="trustee-name-cell">
                                <div class="initials-avatar" style="background-color: ${t.avatarColor};">${t.initials}</div>
                                <span class="trustee-fullname">${t.name}</span>
                            </div>
                        </td>
                        <td style="color: var(--text-secondary); font-family: var(--font-mono); font-size: 0.74rem;">${t.email}</td>
                        <td><span class="badge-pill ${typeClass}">${t.trusteeType}</span></td>
                        <td><span class="badge-pill ${statusClass}">${statusIconSvg} ${t.status}</span></td>
                        <td style="text-align: center; font-weight: 600; color: var(--text-heading);">${t.linkedVaultsCount}</td>
                        <td style="color: var(--text-secondary); white-space: nowrap;">${t.addedOn}</td>
                        <td style="text-align: right;">
                            <div class="table-action-btns-group" style="justify-content: flex-end;">
                                <button class="action-icon-btn btn-view-trustee" data-id="${t.id}" title="View Details" aria-label="View Details for ${t.name}">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                </button>
                                ${t.status === 'Pending' ? `
                                    <button class="action-icon-btn approve btn-approve-trustee" data-id="${t.id}" title="Approve Trustee Verification" aria-label="Approve ${t.name}">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </button>
                                    <button class="action-icon-btn reject btn-reject-trustee" data-id="${t.id}" title="Reject Trustee Verification" aria-label="Reject ${t.name}">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                ` : ''}
                                <button class="action-icon-btn permission btn-permission-trustee" data-id="${t.id}" title="Manage Custody Permissions & Vault Access" aria-label="Manage Permissions for ${t.name}">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    </svg>
                                </button>
                                <button class="action-icon-btn btn-edit-trustee" data-id="${t.id}" title="Edit Profile" aria-label="Edit Profile for ${t.name}">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 20h9"></path>
                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                    </svg>
                                </button>
                                <button class="action-icon-btn btn-more-trustee" data-id="${t.id}" title="Deactivate Trustee" aria-label="Deactivate ${t.name}">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="1"></circle>
                                        <circle cx="19" cy="12" r="1"></circle>
                                        <circle cx="5" cy="12" r="1"></circle>
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Update Pagination Info
        const displayStart = total === 0 ? 0 : startIndex + 1;
        const displayEnd = endIndex;
        if (el.paginationInfo) {
            el.paginationInfo.textContent = `Showing ${displayStart}-${displayEnd} of ${total} trustees`;
        }

        renderPaginationButtons(totalPages);
        attachTableActionListeners();
    }

    function renderPaginationButtons(totalPages) {
        if (!el.paginationBtns) return;

        let btnsHtml = '';
        // Previous Button
        btnsHtml += `
            <button class="page-btn ${state.currentPage === 1 ? 'disabled' : ''}" data-page="${state.currentPage - 1}" ${state.currentPage === 1 ? 'disabled' : ''} aria-label="Previous Page">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
        `;

        for (let p = 1; p <= totalPages; p++) {
            if (p === 1 || p === totalPages || (p >= state.currentPage - 1 && p <= state.currentPage + 1)) {
                btnsHtml += `<button class="page-btn ${p === state.currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
            } else if (p === state.currentPage - 2 || p === state.currentPage + 2) {
                btnsHtml += `<span style="padding: 0 4px; color: var(--text-muted);">...</span>`;
            }
        }

        // Next Button
        btnsHtml += `
            <button class="page-btn ${state.currentPage === totalPages ? 'disabled' : ''}" data-page="${state.currentPage + 1}" ${state.currentPage === totalPages ? 'disabled' : ''} aria-label="Next Page">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
        `;

        el.paginationBtns.innerHTML = btnsHtml;

        el.paginationBtns.querySelectorAll('.page-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetPage = parseInt(btn.getAttribute('data-page'));
                if (targetPage >= 1 && targetPage <= totalPages) {
                    state.currentPage = targetPage;
                    renderTrusteeTable();
                }
            });
        });
    }

    // =========================================================================
    // 4. Invitations Table Rendering
    // =========================================================================
    function renderInvitationsTable() {
        if (!el.invitationsTableBody) return;

        el.invitationsTableBody.innerHTML = state.invitations.map(inv => {
            const statusClass = inv.status.toLowerCase();
            return `
                <tr>
                    <td style="font-weight: 600; color: var(--text-heading);">${inv.recipient}</td>
                    <td style="font-family: var(--font-mono); color: var(--text-secondary); font-size: 0.74rem;">${inv.email}</td>
                    <td><span class="badge-pill ${inv.trusteeType.toLowerCase().replace(' ', '-')}">${inv.trusteeType}</span></td>
                    <td style="color: var(--text-heading);">${inv.vault}</td>
                    <td style="color: var(--text-secondary);">${inv.invitedBy}</td>
                    <td style="color: var(--text-muted);">${inv.sentOn}</td>
                    <td style="color: var(--text-muted);">${inv.expiresOn}</td>
                    <td><span class="badge-pill ${statusClass}">${inv.status}</span></td>
                    <td style="text-align: right;">
                        <div class="table-action-btns-group" style="justify-content: flex-end;">
                            ${inv.status === 'Pending' ? `
                                <button class="action-icon-btn btn-resend-inv" data-id="${inv.id}" title="Resend Invitation">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                                </button>
                                <button class="action-icon-btn btn-cancel-inv" data-id="${inv.id}" title="Cancel Invitation">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            ` : ''}
                            <button class="action-icon-btn btn-view-inv" data-id="${inv.id}" title="View Invitation Message">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        attachInvitationActionListeners();
    }

    // =========================================================================
    // 4b. Roles & Permissions Matrix Rendering (Unified View)
    // =========================================================================
    function renderPermissionsSection() {
        if (!el.matrixTbody || !el.accessTbody) return;

        // Render Permission Matrix Table
        const matrix = window.AegisTrusteeMockData ? window.AegisTrusteeMockData.permissionMatrix : [];
        el.matrixTbody.innerHTML = matrix.map(row => {
            const getBadge = (val) => {
                if (val === 'Allowed') return '<span class="matrix-badge allowed">✓ Allowed</span>';
                if (val === 'Conditional') return '<span class="matrix-badge conditional">⚠ Conditional</span>';
                return '<span class="matrix-badge not-allowed">✕ Not Allowed</span>';
            };
            return `
                <tr>
                    <td style="font-weight: 600; color: var(--text-heading);">${row.action}</td>
                    <td>${getBadge(row.primary)}</td>
                    <td>${getBadge(row.coTrustee)}</td>
                    <td>${getBadge(row.backup)}</td>
                </tr>
            `;
        }).join('');

        // Render Vault Access Assignments Table
        const access = window.AegisTrusteeMockData ? window.AegisTrusteeMockData.vaultAccessAssignments : [];
        el.accessTbody.innerHTML = access.map(a => `
            <tr>
                <td style="font-weight: 600; color: var(--text-heading);">${a.trustee}</td>
                <td><span class="badge-pill ${a.role.toLowerCase().replace(' ', '-')}">${a.role}</span></td>
                <td style="color: var(--text-heading);">${a.vault}</td>
                <td style="font-size: 0.76rem; color: var(--text-secondary);">${a.accessLevel}</td>
                <td><span class="badge-pill ${a.status.toLowerCase().includes('pending') ? 'pending' : 'verified'}">${a.status}</span></td>
            </tr>
        `).join('');
    }

    // Dynamic KPI & Verification Overview Counter Updater
    function updateKpiCounters(fromStatus, toStatus) {
        if (fromStatus === toStatus) return;

        const kpiVerified = document.getElementById('kpi-verified-trustees');
        const kpiPending = document.getElementById('kpi-pending-verification');
        const kpiRejected = document.getElementById('kpi-rejected-trustees');
        const tabCountPending = document.getElementById('tab-count-pending');
        const tabCountVerified = document.getElementById('tab-count-verified');
        const tabCountRejected = document.getElementById('tab-count-rejected');

        const ov = window.AegisTrusteeMockData ? window.AegisTrusteeMockData.verificationOverview : [];
        const verifiedSeg = ov.find(s => s.label === 'Verified');
        const pendingSeg = ov.find(s => s.label === 'Pending');
        const rejectedSeg = ov.find(s => s.label === 'Rejected');

        if (fromStatus === 'Pending' && pendingSeg) {
            pendingSeg.count = Math.max(0, pendingSeg.count - 1);
        } else if (fromStatus === 'Verified' && verifiedSeg) {
            verifiedSeg.count = Math.max(0, verifiedSeg.count - 1);
        } else if (fromStatus === 'Rejected' && rejectedSeg) {
            rejectedSeg.count = Math.max(0, rejectedSeg.count - 1);
        }

        if (toStatus === 'Pending' && pendingSeg) {
            pendingSeg.count += 1;
        } else if (toStatus === 'Verified' && verifiedSeg) {
            verifiedSeg.count += 1;
        } else if (toStatus === 'Rejected' && rejectedSeg) {
            rejectedSeg.count += 1;
        }

        // Recalculate percentages
        const total = ov.reduce((acc, curr) => acc + curr.count, 0);
        if (total > 0) {
            ov.forEach(s => {
                s.percent = Math.round((s.count / total) * 1000) / 10;
            });
        }

        if (kpiVerified && verifiedSeg) kpiVerified.textContent = verifiedSeg.count;
        if (kpiPending && pendingSeg) kpiPending.textContent = pendingSeg.count;
        if (kpiRejected && rejectedSeg) kpiRejected.textContent = rejectedSeg.count;

        if (tabCountPending && pendingSeg) tabCountPending.textContent = pendingSeg.count;
        if (tabCountVerified && verifiedSeg) tabCountVerified.textContent = verifiedSeg.count;
        if (tabCountRejected && rejectedSeg) tabCountRejected.textContent = rejectedSeg.count;
    }

    // Direct Inline Approve Trustee Action
    function approveTrustee(id) {
        const t = state.trustees.find(item => item.id === id);
        if (!t) return;
        if (t.status === 'Verified') {
            showToast(`Trustee "${t.name}" is already verified.`, 'info');
            return;
        }

        const oldStatus = t.status;
        t.status = 'Verified';
        t.documentsVerified = true;

        updateKpiCounters(oldStatus, 'Verified');
        renderTrusteeTable();
        renderDonutChart();
        showToast(`Trustee "${t.name}" verified and approved successfully.`, 'success');
    }

    // =========================================================================
    // 5. SVG Donut Chart Engine (Verification Overview)
    // =========================================================================
    function renderDonutChart() {
        if (!el.donutSvg) return;

        const overview = window.AegisTrusteeMockData ? window.AegisTrusteeMockData.verificationOverview : [];
        const isDark = state.theme === 'dark';

        const cx = 60;
        const cy = 60;
        const r = 42;
        const strokeWidth = 14;
        const circumference = 2 * Math.PI * r;

        let currentOffset = 0;
        let arcsHtml = '';

        overview.forEach((seg, idx) => {
            const arcLength = (seg.percent / 100) * circumference;
            const color = isDark ? seg.darkColor : seg.color;

            arcsHtml += `
                <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
                        stroke="${color}" stroke-width="${strokeWidth}"
                        stroke-dasharray="${arcLength} ${circumference - arcLength}"
                        stroke-dashoffset="${-currentOffset}"
                        class="donut-segment"
                        data-label="${seg.label}" data-percent="${seg.percent}%" data-count="${seg.count}"
                        style="transform-origin: center; transform: rotate(-90deg); cursor: pointer; transition: stroke-width 0.2s ease;" />
            `;
            currentOffset += arcLength;
        });

        el.donutSvg.innerHTML = arcsHtml;

        // Render Legend Rows on the right of Donut
        if (el.donutLegend) {
            el.donutLegend.innerHTML = overview.map(seg => {
                const color = isDark ? seg.darkColor : seg.color;
                return `
                    <div class="legend-stat-row">
                        <div class="legend-dot-label">
                            <span class="legend-color-dot" style="background-color: ${color};"></span>
                            <span>${seg.label}</span>
                        </div>
                        <span class="legend-stat-val">${seg.percent}% (${seg.count})</span>
                    </div>
                `;
            }).join('');
        }

        // Attach hover tooltips
        el.donutSvg.querySelectorAll('.donut-segment').forEach(seg => {
            seg.addEventListener('mouseenter', (e) => {
                seg.setAttribute('stroke-width', '18');
                const label = seg.getAttribute('data-label');
                const pct = seg.getAttribute('data-percent');
                const count = seg.getAttribute('data-count');
                showTooltip(e, `<strong>${label}</strong>: ${count} trustees (${pct})`);
            });
            seg.addEventListener('mousemove', moveTooltip);
            seg.addEventListener('mouseleave', () => {
                seg.setAttribute('stroke-width', '14');
                hideTooltip();
            });
        });
    }

    // =========================================================================
    // 6. Progress Bars: Trustee Types Breakdown
    // =========================================================================
    function renderTrusteeTypesProgress() {
        if (!el.progressContainer) return;

        const types = window.AegisTrusteeMockData ? window.AegisTrusteeMockData.trusteeTypes : [];
        el.progressContainer.innerHTML = types.map(item => `
            <div class="progress-item-block">
                <div class="progress-labels-row">
                    <span class="progress-type-name">${item.type}</span>
                    <span class="progress-type-stat">${item.percent}% (${item.count})</span>
                </div>
                <div class="progress-bar-track">
                    <div class="progress-bar-fill ${item.class}" style="width: ${item.percent}%;"></div>
                </div>
            </div>
        `).join('');
    }

    // =========================================================================
    // 7. Event Listeners & Interactive Workflows
    // =========================================================================
    function attachEventListeners() {
        // Tab Buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const tab = btn.getAttribute('data-tab');
                state.activeTab = tab;
                state.currentPage = 1;

                if (tab === 'invitations') {
                    if (el.mainGrid) el.mainGrid.style.display = 'none';
                    if (el.filterRow) el.filterRow.style.display = 'none';
                    if (el.permissionsView) el.permissionsView.classList.remove('active');
                    if (el.invitationsView) el.invitationsView.classList.add('active');
                    renderInvitationsTable();
                } else if (tab === 'permissions') {
                    if (el.mainGrid) el.mainGrid.style.display = 'none';
                    if (el.filterRow) el.filterRow.style.display = 'none';
                    if (el.invitationsView) el.invitationsView.classList.remove('active');
                    if (el.permissionsView) el.permissionsView.classList.add('active');
                    renderPermissionsSection();
                } else {
                    if (el.mainGrid) el.mainGrid.style.display = 'grid';
                    if (el.filterRow) el.filterRow.style.display = 'flex';
                    if (el.invitationsView) el.invitationsView.classList.remove('active');
                    if (el.permissionsView) el.permissionsView.classList.remove('active');
                    renderTrusteeTable();
                }
            });
        });

        // Sidebar Subtabs
        document.querySelectorAll('[data-subtab]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const subtab = link.getAttribute('data-subtab');
                const targetBtn = document.querySelector(`.tab-btn[data-tab="${subtab}"]`);
                if (targetBtn) targetBtn.click();
            });
        });

        // Search Input
        if (el.tableSearch) {
            el.tableSearch.addEventListener('input', (e) => {
                state.searchQuery = e.target.value.trim();
                state.currentPage = 1;
                renderTrusteeTable();
            });
        }

        // Global Search Header
        if (el.globalSearch) {
            el.globalSearch.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    state.searchQuery = el.globalSearch.value.trim();
                    if (el.tableSearch) el.tableSearch.value = state.searchQuery;
                    state.currentPage = 1;
                    renderTrusteeTable();
                    showToast(`Filtering trustees by "${state.searchQuery}"`, 'info');
                }
            });
        }

        // Filter Dropdowns
        if (el.filterType) {
            el.filterType.addEventListener('change', (e) => {
                state.filterType = e.target.value;
                state.currentPage = 1;
                renderTrusteeTable();
            });
        }
        if (el.filterStatus) {
            el.filterStatus.addEventListener('change', (e) => {
                state.filterStatus = e.target.value;
                state.currentPage = 1;
                renderTrusteeTable();
            });
        }
        if (el.filterVault) {
            el.filterVault.addEventListener('change', (e) => {
                state.filterVault = e.target.value;
                state.currentPage = 1;
                renderTrusteeTable();
            });
        }

        // Select All Checkbox
        if (el.selectAllCheckbox) {
            el.selectAllCheckbox.addEventListener('change', (e) => {
                const checked = e.target.checked;
                document.querySelectorAll('.row-checkbox').forEach(cb => {
                    cb.checked = checked;
                    const id = cb.getAttribute('data-id');
                    if (checked) state.selectedTrusteeIds.add(id);
                    else state.selectedTrusteeIds.delete(id);
                });
            });
        }

        // Export Button
        if (el.btnExport) {
            el.btnExport.addEventListener('click', () => {
                const filtered = getFilteredTrustees();
                const csvHeader = "ID,Name,Email,Type,Status,LinkedVaults,AddedOn\n";
                const csvRows = filtered.map(t => `"${t.id}","${t.name}","${t.email}","${t.trusteeType}","${t.status}",${t.linkedVaultsCount},"${t.addedOn}"`).join("\n");
                const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `AegisVault_Trustees_Export_${new Date().toISOString().slice(0, 10)}.csv`;
                link.click();
                showToast(`Exported ${filtered.length} trustee records to CSV`, 'success');
            });
        }

        // Quick Actions Handlers
        const quickAdd = document.getElementById('quick-action-add-trustee');
        if (quickAdd && el.modalAddTrustee) {
            quickAdd.addEventListener('click', () => openModal(el.modalAddTrustee));
        }
        const quickReminder = document.getElementById('quick-action-send-reminder');
        if (quickReminder) {
            quickReminder.addEventListener('click', () => {
                showToast('Automatic verification reminders queued for 126 pending trustees', 'info');
            });
        }
        if (el.quickVerifyDocs) {
            el.quickVerifyDocs.addEventListener('click', () => {
                const targetBtn = document.getElementById('tab-btn-pending');
                if (targetBtn) targetBtn.click();
            });
        }
        if (el.quickManagePerms) {
            el.quickManagePerms.addEventListener('click', () => {
                const targetBtn = document.getElementById('tab-btn-permissions');
                if (targetBtn) targetBtn.click();
            });
        }

        // Open Add Trustee Modal
        if (el.btnOpenAddTrustee && el.modalAddTrustee) {
            el.btnOpenAddTrustee.addEventListener('click', () => openModal(el.modalAddTrustee));
        }

        // Form Submit: Add Trustee
        if (el.formAddTrustee) {
            el.formAddTrustee.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('add-name').value.trim();
                const email = document.getElementById('add-email').value.trim();
                const phone = document.getElementById('add-phone').value.trim();
                const type = document.getElementById('add-type').value;
                const vault = document.getElementById('add-vault').value;
                const notes = document.getElementById('add-notes').value.trim();

                const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
                const avatarColor = colors[Math.floor(Math.random() * colors.length)];

                const newTrustee = {
                    id: `TR-${Math.floor(8900 + Math.random() * 1000)}`,
                    index: state.trustees.length + 1,
                    name,
                    initials,
                    avatarColor,
                    email,
                    phone,
                    trusteeType: type,
                    status: 'Pending',
                    linkedVaultsCount: 1,
                    linkedVaults: [vault],
                    addedOn: 'Today',
                    lastActive: 'Just now',
                    notes: notes || 'Recently added trustee awaiting initial document verification.',
                    documentsVerified: false
                };

                state.trustees.unshift(newTrustee);
                closeModal(el.modalAddTrustee);
                el.formAddTrustee.reset();

                // Update Pending KPI and Overview
                updateKpiCounters('Inactive', 'Pending');
                renderTrusteeTable();
                renderDonutChart();
                showToast(`Trustee "${name}" created and invited`, 'success');
            });
        }

        // Open Invite Modal
        if (el.btnOpenInviteTrustee && el.modalInvite) {
            el.btnOpenInviteTrustee.addEventListener('click', () => openModal(el.modalInvite));
        }

        // Form Submit: Invite Trustee
        if (el.formInvite) {
            el.formInvite.addEventListener('submit', (e) => {
                e.preventDefault();
                const recipient = document.getElementById('inv-name').value.trim();
                const email = document.getElementById('inv-email').value.trim();
                const type = document.getElementById('inv-type').value;
                const vault = document.getElementById('inv-vault').value;
                const expiry = document.getElementById('inv-expiry').value;
                const message = document.getElementById('inv-message').value.trim();

                const newInv = {
                    id: `INV-${Math.floor(700 + Math.random() * 200)}`,
                    recipient,
                    email,
                    trusteeType: type,
                    vault,
                    invitedBy: 'AP (Admin)',
                    sentOn: 'Today',
                    expiresOn: `In ${expiry}`,
                    status: 'Pending',
                    message: message || 'Nomination link for AegisVault custody protocol.'
                };

                state.invitations.unshift(newInv);
                closeModal(el.modalInvite);
                el.formInvite.reset();
                renderInvitationsTable();
                showToast(`Invitation dispatched to ${recipient} (${email})`, 'success');
            });
        }

        // Form Submit: Edit Trustee
        if (el.formEditTrustee) {
            el.formEditTrustee.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = document.getElementById('edit-id').value;
                const name = document.getElementById('edit-name').value.trim();
                const email = document.getElementById('edit-email').value.trim();
                const phone = document.getElementById('edit-phone').value.trim();
                const type = document.getElementById('edit-type').value;
                const status = document.getElementById('edit-status').value;

                const target = state.trustees.find(t => t.id === id);
                if (target) {
                    const oldStatus = target.status;
                    target.name = name;
                    target.email = email;
                    target.phone = phone;
                    target.trusteeType = type;
                    target.status = status;
                    if (status !== oldStatus) {
                        updateKpiCounters(oldStatus, status);
                        renderDonutChart();
                    }
                }

                closeModal(el.modalEditTrustee);
                renderTrusteeTable();
                showToast(`Trustee "${name}" profile updated`, 'success');
            });
        }

        // Form Submit: Reject Trustee
        if (el.formReject) {
            el.formReject.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = el.rejectTrusteeId.value;
                const reason = document.getElementById('reject-reason').value;
                const t = state.trustees.find(item => item.id === id);
                if (!t) return;

                const oldStatus = t.status;
                t.status = 'Rejected';
                t.documentsVerified = false;

                updateKpiCounters(oldStatus, 'Rejected');
                closeModal(el.modalReject);
                renderTrusteeTable();
                renderDonutChart();
                showToast(`Trustee "${t.name}" marked as Rejected (${reason}).`, 'warning');
            });
        }

        // Form Submit: Manage Permissions
        if (el.formPerms) {
            el.formPerms.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = el.permTrusteeId.value;
                const t = state.trustees.find(item => item.id === id);
                if (!t) return;

                const selectedVaults = [];
                document.querySelectorAll('input[name="perm-vault-item"]:checked').forEach(cb => {
                    selectedVaults.push(cb.value);
                });

                t.linkedVaults = selectedVaults;
                t.linkedVaultsCount = selectedVaults.length;

                closeModal(el.modalPerms);
                renderTrusteeTable();
                showToast(`Custody permissions and vault allocations saved for "${t.name}".`, 'success');
            });
        }

        // Confirm Deactivate
        if (el.btnConfirmDeactivate) {
            el.btnConfirmDeactivate.addEventListener('click', () => {
                const id = el.btnConfirmDeactivate.getAttribute('data-id');
                const target = state.trustees.find(t => t.id === id);
                if (target) {
                    target.status = 'Inactive';
                    renderTrusteeTable();
                    closeModal(el.modalDeactivate);
                    showToast(`Trustee "${target.name}" deactivated`, 'warning');
                }
            });
        }

        // Close Modal buttons (data-close-modal)
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-close-modal');
                const modalEl = document.getElementById(modalId);
                if (modalEl) closeModal(modalEl);
            });
        });

        // Close Modal on backdrop click
        document.querySelectorAll('.modal-backdrop').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal(modal);
            });
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-backdrop.show').forEach(m => closeModal(m));
            }
        });

        // Mobile Hamburger & Sidebar Backdrop
        if (el.hamburgerBtn && el.appSidebar && el.sidebarBackdrop) {
            el.hamburgerBtn.addEventListener('click', () => {
                el.appSidebar.classList.toggle('open');
                el.sidebarBackdrop.classList.toggle('active');
            });
            el.sidebarBackdrop.addEventListener('click', () => {
                el.appSidebar.classList.remove('open');
                el.sidebarBackdrop.classList.remove('active');
            });
        }

        // Header Dropdowns (Notifications & Profile)
        if (el.notifBtn && el.notifDropdown) {
            el.notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                el.notifDropdown.classList.toggle('show');
                if (el.profileDropdown) el.profileDropdown.classList.remove('show');
            });
        }
        if (el.profileBtn && el.profileDropdown) {
            el.profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                el.profileDropdown.classList.toggle('show');
                if (el.notifDropdown) el.notifDropdown.classList.remove('show');
            });
        }
        document.addEventListener('click', () => {
            if (el.notifDropdown) el.notifDropdown.classList.remove('show');
            if (el.profileDropdown) el.profileDropdown.classList.remove('show');
        });
    }

    function attachTableActionListeners() {
        // Individual Checkboxes
        document.querySelectorAll('.row-checkbox').forEach(cb => {
            cb.addEventListener('change', () => {
                const id = cb.getAttribute('data-id');
                if (cb.checked) state.selectedTrusteeIds.add(id);
                else state.selectedTrusteeIds.delete(id);
            });
        });

        // View Trustee
        document.querySelectorAll('.btn-view-trustee').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const t = state.trustees.find(item => item.id === id);
                if (t && el.viewTrusteeContent && el.modalViewTrustee) {
                    el.viewTrusteeContent.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle);">
                            <div class="initials-avatar" style="width: 48px; height: 48px; font-size: 1.1rem; background-color: ${t.avatarColor};">${t.initials}</div>
                            <div>
                                <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-heading);">${t.name}</h4>
                                <div style="font-size: 0.74rem; color: var(--text-muted); font-family: var(--font-mono);">${t.id} &bull; ${t.email}</div>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; font-size: 0.78rem;">
                            <div>
                                <span style="color: var(--text-muted); display: block; font-size: 0.7rem;">Trustee Type:</span>
                                <span class="badge-pill ${t.trusteeType.toLowerCase().replace(' ', '-')}" style="margin-top: 3px;">${t.trusteeType}</span>
                            </div>
                            <div>
                                <span style="color: var(--text-muted); display: block; font-size: 0.7rem;">Verification Status:</span>
                                <span class="badge-pill ${t.status.toLowerCase()}" style="margin-top: 3px;">${t.status}</span>
                            </div>
                            <div>
                                <span style="color: var(--text-muted); display: block; font-size: 0.7rem;">Contact Number:</span>
                                <strong style="color: var(--text-heading);">${t.phone}</strong>
                            </div>
                            <div>
                                <span style="color: var(--text-muted); display: block; font-size: 0.7rem;">Added Date:</span>
                                <strong style="color: var(--text-heading);">${t.addedOn}</strong>
                            </div>
                        </div>

                        <div style="padding: 0.75rem; background-color: var(--bg-card-subtle); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); font-size: 0.76rem;">
                            <div style="font-weight: 600; color: var(--text-heading); margin-bottom: 4px;">Linked Vaults (${t.linkedVaults.length}):</div>
                            <ul style="padding-left: 1.25rem; color: var(--text-secondary);">
                                ${t.linkedVaults.map(v => `<li>${v}</li>`).join('')}
                            </ul>
                        </div>

                        <div style="font-size: 0.76rem; color: var(--text-secondary);">
                            <span style="font-weight: 600; color: var(--text-heading);">Custody Mandate Note:</span>
                            <p style="margin-top: 2px;">${t.notes}</p>
                        </div>
                    `;

                    // Edit button from view modal
                    const btnEditFromView = document.getElementById('btn-edit-from-view');
                    if (btnEditFromView) {
                        btnEditFromView.onclick = () => {
                            closeModal(el.modalViewTrustee);
                            openEditModal(t);
                        };
                    }

                    // Approve button from view modal (only shown if Pending)
                    const btnApproveFromView = document.getElementById('btn-approve-from-view');
                    if (btnApproveFromView) {
                        btnApproveFromView.style.display = t.status === 'Pending' ? 'inline-flex' : 'none';
                        btnApproveFromView.onclick = () => {
                            closeModal(el.modalViewTrustee);
                            approveTrustee(t.id);
                        };
                    }

                    // Reject button from view modal (only shown if Pending)
                    const btnRejectFromView = document.getElementById('btn-reject-from-view');
                    if (btnRejectFromView) {
                        btnRejectFromView.style.display = t.status === 'Pending' ? 'inline-flex' : 'none';
                        btnRejectFromView.onclick = () => {
                            closeModal(el.modalViewTrustee);
                            if (el.modalReject && el.rejectTrusteeId && el.rejectTrusteeName) {
                                el.rejectTrusteeId.value = t.id;
                                el.rejectTrusteeName.textContent = t.name;
                                openModal(el.modalReject);
                            }
                        };
                    }

                    openModal(el.modalViewTrustee);
                }
            });
        });

        // Approve Trustee Action
        document.querySelectorAll('.btn-approve-trustee').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                approveTrustee(id);
            });
        });

        // Reject Trustee Action
        document.querySelectorAll('.btn-reject-trustee').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const t = state.trustees.find(item => item.id === id);
                if (t && el.modalReject && el.rejectTrusteeId && el.rejectTrusteeName) {
                    el.rejectTrusteeId.value = t.id;
                    el.rejectTrusteeName.textContent = t.name;
                    openModal(el.modalReject);
                }
            });
        });

        // Manage Permissions Action
        document.querySelectorAll('.btn-permission-trustee').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const t = state.trustees.find(item => item.id === id);
                if (t && el.modalPerms && el.permTrusteeId) {
                    el.permTrusteeId.value = t.id;
                    if (el.permTrusteeName) el.permTrusteeName.textContent = t.name;
                    if (el.permTrusteeSub) el.permTrusteeSub.textContent = `${t.id} • ${t.email}`;
                    if (el.permTrusteeBadge) {
                        el.permTrusteeBadge.className = `badge-pill ${t.trusteeType.toLowerCase().replace(' ', '-')}`;
                        el.permTrusteeBadge.textContent = t.trusteeType;
                    }

                    // Pre-check trustee's linked vaults
                    document.querySelectorAll('input[name="perm-vault-item"]').forEach(cb => {
                        cb.checked = t.linkedVaults.includes(cb.value);
                    });

                    openModal(el.modalPerms);
                }
            });
        });

        // Edit Trustee
        document.querySelectorAll('.btn-edit-trustee').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const t = state.trustees.find(item => item.id === id);
                if (t) openEditModal(t);
            });
        });

        // Deactivate Trustee
        document.querySelectorAll('.btn-more-trustee').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const t = state.trustees.find(item => item.id === id);
                if (t && el.modalDeactivate && el.btnConfirmDeactivate && el.deactTrusteeName) {
                    el.deactTrusteeName.textContent = t.name;
                    el.btnConfirmDeactivate.setAttribute('data-id', t.id);
                    openModal(el.modalDeactivate);
                }
            });
        });
    }

    function openEditModal(t) {
        if (!el.modalEditTrustee) return;
        document.getElementById('edit-id').value = t.id;
        document.getElementById('edit-name').value = t.name;
        document.getElementById('edit-email').value = t.email;
        document.getElementById('edit-phone').value = t.phone;
        document.getElementById('edit-type').value = t.trusteeType;
        document.getElementById('edit-status').value = t.status;
        openModal(el.modalEditTrustee);
    }

    function attachInvitationActionListeners() {
        // Resend Invitation
        document.querySelectorAll('.btn-resend-inv').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const inv = state.invitations.find(i => i.id === id);
                if (inv) showToast(`Invitation dispatch refreshed for ${inv.email}`, 'info');
            });
        });

        // Cancel Invitation
        document.querySelectorAll('.btn-cancel-inv').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const inv = state.invitations.find(i => i.id === id);
                if (inv) {
                    inv.status = 'Cancelled';
                    renderInvitationsTable();
                    showToast(`Invitation for ${inv.recipient} cancelled`, 'warning');
                }
            });
        });

        // View Invitation
        document.querySelectorAll('.btn-view-inv').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const inv = state.invitations.find(i => i.id === id);
                if (inv) {
                    alert(`Invitation Details:\nRecipient: ${inv.recipient} (${inv.email})\nRole: ${inv.trusteeType}\nVault: ${inv.vault}\nStatus: ${inv.status}\nMessage: "${inv.message}"`);
                }
            });
        });
    }

    // Modal Helpers
    function openModal(modalEl) {
        if (!modalEl) return;
        modalEl.classList.add('show');
    }

    function closeModal(modalEl) {
        if (!modalEl) return;
        modalEl.classList.remove('show');
    }

    // Tooltips
    function showTooltip(e, text) {
        if (!el.tooltip) return;
        el.tooltip.innerHTML = text;
        el.tooltip.style.display = 'block';
        moveTooltip(e);
    }

    function moveTooltip(e) {
        if (!el.tooltip) return;
        el.tooltip.style.left = `${e.clientX + 12}px`;
        el.tooltip.style.top = `${e.clientY + 12}px`;
    }

    function hideTooltip() {
        if (!el.tooltip) return;
        el.tooltip.style.display = 'none';
    }

    // Toast Notification System
    function showToast(message, type = 'success') {
        if (window.AegisAdminCommon) {
            AegisAdminCommon.showToast(message, type);
        } else {
            alert(message);
        }
    }

    // Public API
    window.AegisTrusteeModule = {
        showToast,
        openAddModal: () => openModal(el.modalAddTrustee)
    };

    // DOM Ready
    document.addEventListener('DOMContentLoaded', () => {
        initElements();
        initTheme();
        initData();
        renderTrusteeTable();
        renderDonutChart();
        renderTrusteeTypesProgress();
        attachEventListeners();

        // Hash navigation support on initial page load
        const hash = (window.location.hash || '').toLowerCase();
        if (hash === '#pending' || hash === '#pending-verification') {
            const btn = document.getElementById('tab-btn-pending');
            if (btn) btn.click();
        } else if (hash === '#permissions' || hash === '#roles') {
            const btn = document.getElementById('tab-btn-permissions');
            if (btn) btn.click();
        } else if (hash === '#invitations') {
            const btn = document.getElementById('tab-btn-invitations');
            if (btn) btn.click();
        } else if (hash === '#verified') {
            const btn = document.getElementById('tab-btn-verified');
            if (btn) btn.click();
        } else if (hash === '#rejected') {
            const btn = document.getElementById('tab-btn-rejected');
            if (btn) btn.click();
        }
    });

})();
