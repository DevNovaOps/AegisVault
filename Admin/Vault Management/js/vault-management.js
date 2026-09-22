/**
 * AegisVault — Vault Management Module Controller
 * Implements:
 * - Dual theme system synced with localStorage['aegisvault_theme']
 * - Real-time live search and multi-filtering (Status, Type, Owner)
 * - Interactive SVG Donut Chart engine for Vault Types
 * - Dynamic table rendering with pagination (10 per page)
 * - Row checkboxes and bulk selection actions
 * - Detail inspection modal, Create Vault modal, Access modal, and Templates
 * - Safe CSV Metadata Export
 * - Toast notification system
 */

const AegisVaultController = {
    THEME_KEY: 'aegisvault_theme',
    currentPage: 1,
    rowsPerPage: 10,
    selectedVaultIds: new Set(),
    searchQuery: '',
    statusFilter: 'all',
    typeFilter: 'all',
    ownerFilter: 'all',
    activeModal: null,

    init() {
        // 1. Listen for theme change to re-render charts
        window.addEventListener('aegis:themechange', () => {
            this.renderVaultTypesDonut();
        });

        // 2. Initialize KPI and Overview widgets
        this.renderKPIs();
        this.renderVaultTypesDonut();

        // 3. Initialize Filters & Search
        this.populateOwnerFilterOptions();
        this.bindFilterEvents();

        // 4. Initialize Table Data & Pagination
        this.renderTable();

        // 5. Initialize Modals & Actions
        this.initModals();
        this.initQuickActions();

        // 6. Global listeners
        this.initGlobalSearch();
    },

    isDark() {
        return window.AegisAdminCommon ? AegisAdminCommon.isDark() : document.body.classList.contains('dark-theme');
    },

    /* =========================================================================
       2. KPI & Overview Widgets
       ========================================================================= */
    renderKPIs() {
        if (!window.AegisVaultMockData) return;
        const ov = AegisVaultMockData.overview;

        const setTxt = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setTxt('kpi-total-vaults', ov.totalVaults.toLocaleString());
        setTxt('kpi-total-subtext', ov.totalVaultsSubtext);

        setTxt('kpi-active-vaults', ov.activeVaults.toLocaleString());
        setTxt('kpi-active-subtext', ov.activeVaultsSubtext);

        setTxt('kpi-archived-vaults', ov.archivedVaults.toLocaleString());
        setTxt('kpi-archived-subtext', ov.archivedVaultsSubtext);

        setTxt('kpi-pending-vaults', ov.pendingAccess.toLocaleString());
        setTxt('kpi-pending-subtext', ov.pendingAccessSubtext);

        // Sidebar Overview card
        setTxt('widget-total-vaults', ov.totalVaults.toLocaleString());
        setTxt('widget-active-vaults', ov.activeVaults.toLocaleString());
        setTxt('widget-archived-vaults', ov.archivedVaults.toLocaleString());
        setTxt('widget-pending-vaults', ov.pendingAccess.toLocaleString());
    },

    /* =========================================================================
       3. Interactive SVG Donut Chart Engine (Vault Types)
       ========================================================================= */
    renderVaultTypesDonut() {
        const wrap = document.getElementById('donut-chart-wrap');
        const legendWrap = document.getElementById('chart-legend-list');
        if (!wrap || !legendWrap || !window.AegisVaultMockData) return;

        const data = AegisVaultMockData.vaultTypesDistribution;
        const isDark = this.isDark();

        const size = 120;
        const center = size / 2;
        const radius = 46;
        const strokeWidth = 14;
        const circumference = 2 * Math.PI * radius;

        let accumulatedPercent = 0;
        let svgCircles = '';

        // Background track circle
        const trackColor = isDark ? '#0A2436' : '#F1F5F9';
        svgCircles += `<circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${trackColor}" stroke-width="${strokeWidth}" />`;

        data.forEach(item => {
            const color = isDark ? item.darkColor : item.color;
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);

            svgCircles += `
                <circle cx="${center}" cy="${center}" r="${radius}"
                        fill="none"
                        stroke="${color}"
                        stroke-width="${strokeWidth}"
                        stroke-dasharray="${strokeDasharray}"
                        stroke-dashoffset="${strokeDashoffset}"
                        transform="rotate(-90 ${center} ${center})"
                        class="donut-segment"
                        data-label="${item.label}"
                        data-percent="${item.percentage}%"
                        style="transition: stroke-width 0.2s ease, opacity 0.2s ease; cursor: pointer;" />
            `;
            accumulatedPercent += item.percentage;
        });

        wrap.innerHTML = `
            <svg viewBox="0 0 ${size} ${size}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
                ${svgCircles}
            </svg>
            <div class="donut-center-label">
                <div class="donut-center-num">892</div>
                <div class="donut-center-sub">Vaults</div>
            </div>
        `;

        // Render matching legend list
        legendWrap.innerHTML = data.map(item => {
            const color = isDark ? item.darkColor : item.color;
            return `
                <div class="legend-item-row" data-type="${item.label}">
                    <div class="legend-label-wrap">
                        <span class="legend-color-dot" style="background-color: ${color}"></span>
                        <span>${item.label}</span>
                    </div>
                    <span class="legend-percentage-val">${item.percentage}%</span>
                </div>
            `;
        }).join('');

        // Interactive hover highlights
        wrap.querySelectorAll('.donut-segment').forEach(seg => {
            seg.addEventListener('mouseenter', () => {
                seg.setAttribute('stroke-width', (strokeWidth + 3).toString());
                const lbl = seg.getAttribute('data-label');
                const pct = seg.getAttribute('data-percent');
                const centerNum = wrap.querySelector('.donut-center-num');
                const centerSub = wrap.querySelector('.donut-center-sub');
                if (centerNum) centerNum.textContent = pct;
                if (centerSub) centerSub.textContent = lbl;
            });

            seg.addEventListener('mouseleave', () => {
                seg.setAttribute('stroke-width', strokeWidth.toString());
                const centerNum = wrap.querySelector('.donut-center-num');
                const centerSub = wrap.querySelector('.donut-center-sub');
                if (centerNum) centerNum.textContent = '892';
                if (centerSub) centerSub.textContent = 'Vaults';
            });
        });
    },

    /* =========================================================================
       4. Filter & Search Engine
       ========================================================================= */
    populateOwnerFilterOptions() {
        const select = document.getElementById('filter-owner-select');
        if (!select || !window.AegisVaultMockData) return;

        const owners = [...new Set(AegisVaultMockData.vaults.map(v => v.owner))].sort();
        select.innerHTML = '<option value="all">All Owners</option>' +
            owners.map(o => `<option value="${this.escapeHtml(o)}">${this.escapeHtml(o)}</option>`).join('');
    },

    bindFilterEvents() {
        const searchInput = document.getElementById('search-vaults-input');
        const statusSelect = document.getElementById('filter-status-select');
        const typeSelect = document.getElementById('filter-type-select');
        const ownerSelect = document.getElementById('filter-owner-select');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.currentPage = 1;
                this.renderTable();
            });
        }

        if (statusSelect) {
            statusSelect.addEventListener('change', (e) => {
                this.statusFilter = e.target.value;
                this.currentPage = 1;
                this.renderTable();
            });
        }

        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                this.typeFilter = e.target.value;
                this.currentPage = 1;
                this.renderTable();
            });
        }

        if (ownerSelect) {
            ownerSelect.addEventListener('change', (e) => {
                this.ownerFilter = e.target.value;
                this.currentPage = 1;
                this.renderTable();
            });
        }

        // Export Button
        const exportBtn = document.getElementById('btn-export-csv');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToCSV());
        }

        // Filter button drawer/toggle notification
        const filterBtn = document.getElementById('btn-open-filters');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                this.showToast('All filter fields active above the table', 'info');
            });
        }
    },

    getFilteredVaults() {
        if (!window.AegisVaultMockData || !AegisVaultMockData.vaults) return [];

        return AegisVaultMockData.vaults.filter(v => {
            // Search matching name, owner, email, or id
            if (this.searchQuery) {
                const q = this.searchQuery;
                const matchId = v.id.toLowerCase().includes(q);
                const matchName = v.name.toLowerCase().includes(q);
                const matchOwner = v.owner.toLowerCase().includes(q);
                const matchEmail = (v.ownerEmail || '').toLowerCase().includes(q);
                if (!matchId && !matchName && !matchOwner && !matchEmail) return false;
            }

            // Status filter
            if (this.statusFilter !== 'all' && v.status.toLowerCase() !== this.statusFilter.toLowerCase()) {
                return false;
            }

            // Type filter
            if (this.typeFilter !== 'all' && v.type.toLowerCase() !== this.typeFilter.toLowerCase()) {
                return false;
            }

            // Owner filter
            if (this.ownerFilter !== 'all' && v.owner !== this.ownerFilter) {
                return false;
            }

            return true;
        });
    },

    /* =========================================================================
       5. Table Rendering & Pagination
       ========================================================================= */
    renderTable() {
        const tbody = document.getElementById('vaults-table-body');
        const counter = document.getElementById('table-showing-counter');
        const paginationWrap = document.getElementById('pagination-controls');
        const selectAllBox = document.getElementById('checkbox-select-all');
        if (!tbody) return;

        const filtered = this.getFilteredVaults();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / this.rowsPerPage));

        if (this.currentPage > totalPages) {
            this.currentPage = totalPages;
        }

        const startIndex = (this.currentPage - 1) * this.rowsPerPage;
        const endIndex = Math.min(startIndex + this.rowsPerPage, total);
        const pageRecords = filtered.slice(startIndex, endIndex);

        // Update counter text
        if (counter) {
            if (total === 0) {
                counter.textContent = 'Showing 0-0 of 0 vaults';
            } else {
                counter.textContent = `Showing ${startIndex + 1}-${endIndex} of 892 vaults`;
            }
        }

        // Render rows
        if (pageRecords.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                        <svg style="width: 38px; height: 38px; margin-bottom: 0.5rem; opacity: 0.6;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-secondary);">No vaults match the selected criteria</div>
                        <div style="font-size: 0.78rem;">Try clearing the search query or adjusting your filters.</div>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = pageRecords.map((v, idx) => {
                const isSelected = this.selectedVaultIds.has(v.id);
                const displayIndex = startIndex + idx + 1;
                const typeClass = v.type.toLowerCase();
                const statusClass = v.status.toLowerCase();

                return `
                    <tr class="${isSelected ? 'vault-row-selected' : ''}" data-vault-id="${v.id}">
                        <td>
                            <input type="checkbox"
                                   class="custom-checkbox row-checkbox"
                                   data-id="${v.id}"
                                   ${isSelected ? 'checked' : ''}
                                   aria-label="Select vault ${v.name}">
                        </td>
                        <td style="color: var(--text-secondary); font-weight: 500;">${displayIndex}</td>
                        <td class="vault-name-cell">${this.escapeHtml(v.name)}</td>
                        <td class="vault-owner-cell">${this.escapeHtml(v.owner)}</td>
                        <td>
                            <span class="badge-type ${typeClass}">${v.type}</span>
                        </td>
                        <td>
                            <span class="badge-status ${statusClass}">${v.status}</span>
                        </td>
                        <td class="vault-date-cell">${v.createdOn}</td>
                        <td class="vault-date-cell">${v.lastAccessed}</td>
                        <td style="text-align: center;">
                            <div class="actions-cell-group">
                                <button class="row-action-btn btn-view-vault" data-id="${v.id}" title="View Vault Details">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                </button>
                                <button class="row-action-btn btn-trustees-vault" data-id="${v.id}" title="Inspect Designated Trustees">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                </button>
                                <div class="row-actions-wrapper">
                                    <button class="row-action-btn btn-more-vault" data-id="${v.id}" title="More Actions">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="1.5"></circle>
                                            <circle cx="19" cy="12" r="1.5"></circle>
                                            <circle cx="5" cy="12" r="1.5"></circle>
                                        </svg>
                                    </button>
                                    <div class="action-dropdown-menu" id="menu-${v.id}">
                                        <button class="dropdown-action-item" onclick="AegisVaultController.openDetailsModal('${v.id}')">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            Inspect Metadata
                                        </button>
                                        <button class="dropdown-action-item" onclick="AegisVaultController.openAccessModal('${v.id}')">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                                            Manage Trustees
                                        </button>
                                        <button class="dropdown-action-item" onclick="AegisVaultController.toggleVaultStatus('${v.id}')">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                            ${v.status === 'Archived' ? 'Restore to Active' : 'Archive Vault'}
                                        </button>
                                        <button class="dropdown-action-item danger" onclick="AegisVaultController.confirmEmergencyFreeze('${v.id}')">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                                            Emergency Lock
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Bind row action clicks
        tbody.querySelectorAll('.btn-view-vault').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openDetailsModal(btn.getAttribute('data-id'));
            });
        });

        tbody.querySelectorAll('.btn-trustees-vault').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openAccessModal(btn.getAttribute('data-id'));
            });
        });

        tbody.querySelectorAll('.btn-more-vault').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const menu = document.getElementById(`menu-${id}`);
                // Close any open menu first
                document.querySelectorAll('.action-dropdown-menu').forEach(m => {
                    if (m !== menu) m.classList.remove('show');
                });
                if (menu) menu.classList.toggle('show');
            });
        });

        // Close dropdowns on outside click
        document.addEventListener('click', () => {
            document.querySelectorAll('.action-dropdown-menu').forEach(m => m.classList.remove('show'));
        });

        // Bind row checkbox toggles
        tbody.querySelectorAll('.row-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const id = cb.getAttribute('data-id');
                if (e.target.checked) {
                    this.selectedVaultIds.add(id);
                } else {
                    this.selectedVaultIds.delete(id);
                }
                this.updateBulkSelectionBar();
                this.renderTable();
            });
        });

        // Header select-all checkbox
        if (selectAllBox) {
            const allPageSelected = pageRecords.length > 0 && pageRecords.every(r => this.selectedVaultIds.has(r.id));
            selectAllBox.checked = allPageSelected;

            selectAllBox.onchange = (e) => {
                pageRecords.forEach(r => {
                    if (e.target.checked) {
                        this.selectedVaultIds.add(r.id);
                    } else {
                        this.selectedVaultIds.delete(r.id);
                    }
                });
                this.updateBulkSelectionBar();
                this.renderTable();
            };
        }

        // Render Pagination buttons matching screenshot
        this.renderPagination(totalPages);
    },

    renderPagination(totalPages) {
        const wrap = document.getElementById('pagination-controls');
        if (!wrap) return;

        let html = '';

        // Previous button
        html += `
            <button class="page-btn" ${this.currentPage <= 1 ? 'disabled' : ''} onclick="AegisVaultController.goToPage(${this.currentPage - 1})" aria-label="Previous Page">
                &lsaquo;
            </button>
        `;

        // Screenshot has: 1 2 3 4 5 ... 90
        const visiblePages = [1, 2, 3, 4, 5];
        visiblePages.forEach(p => {
            if (p <= totalPages) {
                html += `
                    <button class="page-btn ${this.currentPage === p ? 'active' : ''}" onclick="AegisVaultController.goToPage(${p})">
                        ${p}
                    </button>
                `;
            }
        });

        if (totalPages > 5) {
            html += `<span class="page-ellipsis">&hellip;</span>`;
            html += `
                <button class="page-btn ${this.currentPage === 90 ? 'active' : ''}" onclick="AegisVaultController.goToPage(${Math.min(90, totalPages)})">
                    90
                </button>
            `;
        }

        // Next button
        html += `
            <button class="page-btn" ${this.currentPage >= totalPages ? 'disabled' : ''} onclick="AegisVaultController.goToPage(${this.currentPage + 1})" aria-label="Next Page">
                &rsaquo;
            </button>
        `;

        wrap.innerHTML = html;
    },

    goToPage(page) {
        this.currentPage = page;
        this.renderTable();
    },

    /* =========================================================================
       6. Bulk Actions Bar
       ========================================================================= */
    updateBulkSelectionBar() {
        const bar = document.getElementById('bulk-selection-bar');
        const countSpan = document.getElementById('bulk-selected-count');
        const count = this.selectedVaultIds.size;

        if (!bar) return;

        if (count > 0) {
            bar.classList.add('active');
            if (countSpan) countSpan.textContent = `${count} vault${count > 1 ? 's' : ''} selected`;
        } else {
            bar.classList.remove('active');
        }

        // Clear button
        const clearBtn = document.getElementById('btn-bulk-clear');
        if (clearBtn) {
            clearBtn.onclick = () => {
                this.selectedVaultIds.clear();
                this.updateBulkSelectionBar();
                this.renderTable();
            };
        }

        // Bulk Archive
        const archiveBtn = document.getElementById('btn-bulk-archive');
        if (archiveBtn) {
            archiveBtn.onclick = () => {
                if (!window.AegisVaultMockData) return;
                AegisVaultMockData.vaults.forEach(v => {
                    if (this.selectedVaultIds.has(v.id)) {
                        v.status = 'Archived';
                    }
                });
                this.showToast(`Archived ${this.selectedVaultIds.size} selected vaults`, 'success');
                this.selectedVaultIds.clear();
                this.updateBulkSelectionBar();
                this.renderTable();
            };
        }

        // Bulk Export
        const bulkExportBtn = document.getElementById('btn-bulk-export');
        if (bulkExportBtn) {
            bulkExportBtn.onclick = () => this.exportToCSV(true);
        }
    },

    /* =========================================================================
       7. Modal System & Details
       ========================================================================= */
    initModals() {
        // Modal close buttons
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-close-modal');
                this.closeModal(modalId);
            });
        });

        // Overlay click to close
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(overlay.id);
                }
            });
        });

        // Top "+ Create New Vault" Button
        const createBtn = document.getElementById('btn-create-vault');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.openModal('create-vault-modal'));
        }

        // Create Vault Form submit
        const createForm = document.getElementById('create-vault-form');
        if (createForm) {
            createForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('new-vault-name').value.trim();
                const owner = document.getElementById('new-vault-owner').value;
                const type = document.getElementById('new-vault-type').value;
                const threshold = document.getElementById('new-vault-trustees').value;

                if (!name) return;

                const newId = `VLT-2025-0${Math.floor(Math.random() * 800) + 100}`;
                const newVault = {
                    id: newId,
                    index: 1,
                    name: name,
                    owner: owner,
                    ownerEmail: `${owner.toLowerCase().replace(/\s+/g, '.')}@user.aegisvault.io`,
                    type: type,
                    status: 'Active',
                    createdOn: 'Today',
                    lastAccessed: 'Just Now',
                    trusteesCount: parseInt(threshold[threshold.length - 1], 10) || 3,
                    verifiedTrustees: 1,
                    threshold: threshold,
                    heartbeatInterval: '30 Days',
                    lastHeartbeat: 'Configured Just Now',
                    heartbeatStatus: 'Healthy',
                    encryption: 'AES-256-GCM (Client-Side)',
                    releaseCondition: `Threshold Verification (${threshold})`,
                    itemCount: 0,
                    storageSize: '0.0 MB'
                };

                if (window.AegisVaultMockData) {
                    AegisVaultMockData.vaults.unshift(newVault);
                    AegisVaultMockData.overview.totalVaults += 1;
                    AegisVaultMockData.overview.activeVaults += 1;
                }

                this.renderKPIs();
                this.renderTable();
                this.closeModal('create-vault-modal');
                createForm.reset();
                this.showToast(`Vault "${name}" successfully provisioned (#${newId})`, 'success');
            });
        }
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

    openDetailsModal(vaultId) {
        if (!window.AegisVaultMockData) return;
        const vault = AegisVaultMockData.vaults.find(v => v.id === vaultId);
        if (!vault) return;

        const setTxt = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setTxt('detail-vault-id', vault.id);
        setTxt('detail-vault-name', vault.name);
        setTxt('detail-vault-owner', `${vault.owner} (${vault.ownerEmail})`);
        setTxt('detail-vault-type', `${vault.type} Documents`);
        setTxt('detail-vault-status', vault.status);
        setTxt('detail-vault-threshold', `${vault.threshold} (${vault.verifiedTrustees}/${vault.trusteesCount} Verified)`);
        setTxt('detail-vault-heartbeat', `${vault.heartbeatInterval} (Last: ${vault.lastHeartbeat})`);
        setTxt('detail-vault-crypto', `${vault.encryption} · Zero-Knowledge`);

        const manageBtn = document.getElementById('btn-detail-manage-trustees');
        if (manageBtn) {
            manageBtn.onclick = () => {
                this.closeModal('vault-details-modal');
                this.openAccessModal(vaultId);
            };
        }

        this.openModal('vault-details-modal');
    },

    openAccessModal(vaultId) {
        if (!window.AegisVaultMockData) return;
        const listWrap = document.getElementById('trustees-directory-list');
        if (!listWrap) return;

        listWrap.innerHTML = AegisVaultMockData.trusteesDirectory.map(t => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; background: var(--bg-page); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                <div>
                    <div style="font-weight: 700; font-size: 0.82rem; color: var(--text-heading);">${this.escapeHtml(t.name)}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${this.escapeHtml(t.email)} · ${t.role}</div>
                </div>
                <span class="badge-status ${t.status === 'Verified' ? 'active' : 'pending'}" style="font-size: 0.7rem;">${t.status}</span>
            </div>
        `).join('');

        this.openModal('manage-access-modal');
    },

    toggleVaultStatus(vaultId) {
        if (!window.AegisVaultMockData) return;
        const vault = AegisVaultMockData.vaults.find(v => v.id === vaultId);
        if (!vault) return;

        vault.status = vault.status === 'Archived' ? 'Active' : 'Archived';
        this.showToast(`Vault ${vault.name} status changed to ${vault.status}`, 'success');
        this.renderTable();
    },

    confirmEmergencyFreeze(vaultId) {
        if (!window.AegisVaultMockData) return;
        const vault = AegisVaultMockData.vaults.find(v => v.id === vaultId);
        if (!vault) return;

        vault.status = 'Pending';
        this.showToast(`Emergency lock placed on ${vault.name}. Release suspended.`, 'warning');
        this.renderTable();
    },

    /* =========================================================================
       8. Quick Actions Widgets
       ========================================================================= */
    initQuickActions() {
        // Quick Action 1: Create New Vault
        const qaCreate = document.getElementById('qa-create-vault');
        if (qaCreate) {
            qaCreate.addEventListener('click', () => this.openModal('create-vault-modal'));
        }

        // Quick Action 2: Manage Access
        const qaAccess = document.getElementById('qa-manage-access');
        if (qaAccess) {
            qaAccess.addEventListener('click', () => this.openAccessModal('VLT-2025-001'));
        }

        // Quick Action 3: Vault Templates
        const qaTemplates = document.getElementById('qa-vault-templates');
        if (qaTemplates) {
            qaTemplates.addEventListener('click', () => {
                const listWrap = document.getElementById('templates-cards-list');
                if (listWrap && window.AegisVaultMockData) {
                    listWrap.innerHTML = AegisVaultMockData.templates.map(t => `
                        <div style="padding: 0.85rem; background: var(--bg-page); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 0.35rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-weight: 700; color: var(--text-heading); font-size: 0.85rem;">${t.title}</span>
                                <span class="badge-type ${t.type.toLowerCase()}">${t.type}</span>
                            </div>
                            <div style="font-size: 0.74rem; color: var(--text-secondary);">${t.desc}</div>
                            <div style="font-size: 0.72rem; color: var(--brand-orange); font-weight: 600; margin-top: 0.2rem;">${t.trustees}</div>
                        </div>
                    `).join('');
                }
                this.openModal('vault-templates-modal');
            });
        }
    },

    /* =========================================================================
       9. Safe CSV Exporter
       ========================================================================= */
    exportToCSV(selectedOnly = false) {
        if (!window.AegisVaultMockData) return;

        let records = AegisVaultMockData.vaults;
        if (selectedOnly) {
            records = records.filter(v => this.selectedVaultIds.has(v.id));
        }

        if (records.length === 0) {
            this.showToast('No vaults selected for export', 'warning');
            return;
        }

        const headers = ["Vault ID", "Vault Name", "Owner Name", "Owner Email", "Category", "Lifecycle Status", "Created On", "Last Accessed", "Trustee Threshold", "Storage Size"];
        const rows = records.map(v => [
            v.id,
            `"${v.name.replace(/"/g, '""')}"`,
            `"${v.owner.replace(/"/g, '""')}"`,
            v.ownerEmail,
            v.type,
            v.status,
            v.createdOn,
            v.lastAccessed,
            `"${v.threshold}"`,
            v.storageSize
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `aegisvault_vaults_metadata_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showToast(`Exported ${records.length} vault records to CSV`, 'success');
    },

    /* =========================================================================
       10. Header Dropdowns, Mobile Menu & Global Search
       ========================================================================= */
    /* =========================================================================
       10. Global Search Sync
       ========================================================================= */
    initGlobalSearch() {
        const globalInput = document.getElementById('global-search-input') || document.getElementById('global-header-search');
        if (globalInput) {
            globalInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const tableSearch = document.getElementById('search-vaults-input');
                    if (tableSearch) {
                        tableSearch.value = globalInput.value;
                        tableSearch.dispatchEvent(new Event('input'));
                        tableSearch.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        }
    },

    /* =========================================================================
       11. Toast System & Utility (Delegated to AegisAdminCommon)
       ========================================================================= */
    showToast(message, type = 'info') {
        if (window.AegisAdminCommon) {
            AegisAdminCommon.showToast(message, type);
        } else {
            alert(message);
        }
    },

    escapeHtml(str) {
        if (window.AegisAdminCommon) {
            return AegisAdminCommon.escapeHtml(str);
        }
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};

// Aliases for inline HTML handlers & backwards compatibility
window.AegisVaultController = AegisVaultController;
window.AegisInteractions = AegisVaultController;

document.addEventListener('DOMContentLoaded', () => {
    AegisVaultController.init();
});
