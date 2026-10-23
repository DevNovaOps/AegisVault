/**
 * AegisVault — Vault Management Module Controller
 * Fully integrated with Django Backend /api/v1/admin/vaults/ and /api/v1/admin/users/
 */

// Self-contained live vault data store (100% database driven)
window.AegisVaultData = window.AegisVaultData || {
    overview: {
        totalVaults: 0,
        totalVaultsTrend: "Live",
        totalVaultsSubtext: "All system vaults",
        activeVaults: 0,
        activeVaultsTrend: "Live",
        activeVaultsSubtext: "Active & unlocked",
        archivedVaults: 0,
        archivedVaultsTrend: "Live",
        archivedVaultsSubtext: "Archived custody",
        pendingAccess: 0,
        pendingAccessTrend: "Live",
        pendingAccessSubtext: "Requires review"
    },
    vaultTypesDistribution: [],
    vaults: [],
    templates: [
        { title: "Standard Estate Vault", type: "Personal", trustees: "3 Trustees (2-of-3)", desc: "Pre-configured for family legacy, identity records, and essential documents." },
        { title: "Corporate Succession Vault", type: "Business", trustees: "5 Trustees (3-of-5)", desc: "Designed for corporate shareholding, server access, and board resolution escrow." },
        { title: "Cryptographic Asset Vault", type: "Financial", trustees: "4 Trustees (3-of-4)", desc: "Optimized for hardware wallet seeds, multi-sig shards, and 2FA recovery." }
    ]
};

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
    availableUsers: [],

    init() {
        // 1. Listen for theme change to re-render charts
        window.addEventListener('aegis:themechange', () => {
            this.renderVaultTypesDonut();
        });

        this.bindFilterEvents();
        this.initModals();
        this.initQuickActions();
        this.initGlobalSearch();

        this.loadData();
    },

    async loadData() {
        if (window.AegisAdminCommon && window.AegisAdminCommon.ensureAdminToken) {
            await window.AegisAdminCommon.ensureAdminToken();
        }

        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
            Promise.all([
                window.AegisAPI.get('/admin/vaults/').catch(err => {
                    console.warn('Failed to load vaults:', err);
                    return [];
                }),
                window.AegisAPI.get('/admin/users/').catch(err => {
                    console.warn('Failed to load users:', err);
                    return [];
                })
            ]).then(([vaultsData, usersData]) => {
                this.availableUsers = usersData || [];
                if (!window.AegisVaultData) window.AegisVaultData = {};

                window.AegisVaultData.vaults = (vaultsData || []).map((v, idx) => ({
                    id: v.id || `VLT-${String(idx + 1).padStart(3, '0')}`,
                    rawId: v.id,
                    index: idx + 1,
                    name: v.name || 'Unnamed Vault',
                    owner: v.owner_name || 'System Owner',
                    ownerEmail: v.owner_email || '',
                    type: v.vault_type ? (v.vault_type.charAt(0).toUpperCase() + v.vault_type.slice(1)) : 'Personal',
                    status: v.status ? (v.status.charAt(0).toUpperCase() + v.status.slice(1)) : 'Active',
                    createdOn: v.created_at ? new Date(v.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
                    lastAccessed: v.updated_at ? new Date(v.updated_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }) : 'Never',
                    trusteesCount: v.total_shares || 0,
                    verifiedTrustees: v.active_shares || 0,
                    threshold: `${v.required_shares || 2} of ${v.total_shares || 3}`,
                    heartbeatInterval: v.heartbeat_schedule || (v.inactivity_days ? `${v.inactivity_days} Days` : '7 Days'),
                    lastHeartbeat: v.heartbeat_status || 'Healthy',
                    heartbeatStatus: v.heartbeat_status || 'Healthy',
                    encryption: v.encryption || 'AES-256-GCM',
                    releaseCondition: `Threshold Verification (${v.required_shares || 2}-of-${v.total_shares || 3})`,
                    itemCount: v.items_count || 0,
                    storageSize: v.storage_used || '0.0 MB'
                }));

                this.updateDynamicKPIs();
                this.populateOwnerFilterOptions();
                this.renderTable();
            });
        } else {
            if (!window.AegisVaultData) window.AegisVaultData = {};
            window.AegisVaultData.vaults = [];
            this.updateDynamicKPIs();
            this.populateOwnerFilterOptions();
            this.renderTable();
        }
    },

    isDark() {
        return window.AegisAdminCommon ? AegisAdminCommon.isDark() : document.body.classList.contains('dark-theme');
    },

    /* =========================================================================
       Dynamic KPI & Overview Calculation
       ========================================================================= */
    updateDynamicKPIs() {
        const vaults = (window.AegisVaultData && AegisVaultData.vaults) ? AegisVaultData.vaults : [];
        const total = vaults.length;
        const active = vaults.filter(v => (v.status || '').toLowerCase() === 'active').length;
        const archived = vaults.filter(v => (v.status || '').toLowerCase() === 'archived').length;
        const pending = vaults.filter(v => (v.status || '').toLowerCase() === 'pending').length;

        AegisVaultData.overview = {
            totalVaults: total,
            totalVaultsSubtext: 'All system vaults',
            activeVaults: active,
            activeVaultsSubtext: total > 0 ? `${((active / total) * 100).toFixed(1)}% of total` : '0% of total',
            archivedVaults: archived,
            archivedVaultsSubtext: total > 0 ? `${((archived / total) * 100).toFixed(1)}% of total` : '0% of total',
            pendingAccess: pending,
            pendingAccessSubtext: pending > 0 ? 'Requires review' : 'No pending reviews'
        };

        const typeCounts = {};
        vaults.forEach(v => {
            const t = v.type || 'Personal';
            typeCounts[t] = (typeCounts[t] || 0) + 1;
        });

        const colors = {
            'Personal': { color: '#2563EB', darkColor: '#3B82F6' },
            'Financial': { color: '#0D9488', darkColor: '#14B8A6' },
            'Business': { color: '#F59E0B', darkColor: '#FBBF24' },
            'Legal': { color: '#8B5CF6', darkColor: '#A78BFA' },
            'Other': { color: '#EF4444', darkColor: '#F87171' }
        };

        if (total > 0) {
            AegisVaultData.vaultTypesDistribution = Object.keys(typeCounts).map(type => {
                const count = typeCounts[type];
                const pct = Math.round((count / total) * 1000) / 10;
                const c = colors[type] || colors['Other'];
                return {
                    label: type,
                    percentage: pct,
                    count: count,
                    color: c.color,
                    darkColor: c.darkColor
                };
            });
        } else {
            AegisVaultData.vaultTypesDistribution = [];
        }

        this.renderKPIs();
        this.renderVaultTypesDonut();
    },

    renderKPIs() {
        if (!window.AegisVaultData || !AegisVaultData.overview) return;
        const ov = AegisVaultData.overview;

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
       Interactive SVG Donut Chart Engine (Vault Types)
       ========================================================================= */
    renderVaultTypesDonut() {
        const wrap = document.getElementById('donut-chart-wrap');
        const legendWrap = document.getElementById('chart-legend-list');
        if (!wrap || !legendWrap || !window.AegisVaultData) return;

        const data = AegisVaultData.vaultTypesDistribution || [];
        const isDark = this.isDark();

        const size = 120;
        const center = size / 2;
        const radius = 46;
        const strokeWidth = 14;
        const circumference = 2 * Math.PI * radius;
        const trackColor = isDark ? '#0A2436' : '#F1F5F9';

        if (data.length === 0) {
            wrap.innerHTML = `
                <svg viewBox="0 0 ${size} ${size}">
                    <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${trackColor}" stroke-width="${strokeWidth}" />
                </svg>
                <div class="donut-chart-center-label donut-center-label">
                    <span class="center-percent donut-center-num">0</span>
                    <span class="center-subtext donut-center-sub">Vaults</span>
                </div>
            `;
            legendWrap.innerHTML = '<div style="font-size: 0.74rem; color: var(--text-muted); padding: 0.5rem 0; text-align: center;">No vault records to categorize</div>';
            return;
        }

        let accumulatedPercent = 0;
        let svgCircles = `<circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${trackColor}" stroke-width="${strokeWidth}" />`;

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
                        stroke-linecap="round"
                        transform="rotate(-90 ${center} ${center})"
                        class="donut-segment"
                        data-label="${item.label}"
                        data-percent="${item.percentage}%" />
            `;
            accumulatedPercent += item.percentage;
        });

        const dominant = data[0];
        wrap.innerHTML = `
            <svg viewBox="0 0 ${size} ${size}">
                ${svgCircles}
            </svg>
            <div class="donut-chart-center-label donut-center-label" id="donut-center-text">
                <span class="center-percent donut-center-num">${dominant.percentage}%</span>
                <span class="center-subtext donut-center-sub">${dominant.label}</span>
            </div>
        `;

        legendWrap.innerHTML = data.map(item => `
            <div class="legend-row-item" data-type="${item.label}">
                <div class="legend-label-group">
                    <span class="legend-bullet-dot" style="background: ${isDark ? item.darkColor : item.color};"></span>
                    <span class="legend-name">${item.label}</span>
                </div>
                <div class="legend-value-group">
                    <span class="legend-percent">${item.percentage}%</span>
                    <span class="legend-count">(${item.count})</span>
                </div>
            </div>
        `).join('');

        wrap.querySelectorAll('.donut-segment').forEach(seg => {
            seg.addEventListener('mouseenter', (e) => {
                const label = e.target.getAttribute('data-label');
                const pct = e.target.getAttribute('data-percent');
                const centerLabel = document.getElementById('donut-center-text');
                if (centerLabel) {
                    centerLabel.innerHTML = `
                        <span class="center-percent donut-center-num">${pct}</span>
                        <span class="center-subtext donut-center-sub">${label}</span>
                    `;
                }
            });
        });
    },

    /* =========================================================================
       Dropdown Filters & Real-time Search
       ========================================================================= */
    populateOwnerFilterOptions() {
        const ownerSelect = document.getElementById('filter-owner-select');
        if (ownerSelect && window.AegisVaultData) {
            const owners = Array.from(new Set((AegisVaultData.vaults || []).map(v => v.owner).filter(Boolean))).sort();
            ownerSelect.innerHTML = '<option value="all">All Owners</option>' +
                owners.map(o => `<option value="${this.escapeHtml(o)}">${this.escapeHtml(o)}</option>`).join('');
        }

        const newOwnerSelect = document.getElementById('new-vault-owner');
        if (newOwnerSelect) {
            if (this.availableUsers && this.availableUsers.length > 0) {
                newOwnerSelect.innerHTML = '<option value="">Select Vault Owner...</option>' +
                    this.availableUsers.map(u => `<option value="${this.escapeHtml(u.email || u.name)}">${this.escapeHtml(u.name || u.email)} (${this.escapeHtml(u.email)})</option>`).join('');
            } else {
                newOwnerSelect.innerHTML = '<option value="">No registered owners found</option>';
            }
        }
    },

    bindFilterEvents() {
        const searchInput = document.getElementById('search-vaults-input');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.searchQuery = e.target.value.trim().toLowerCase();
                    this.currentPage = 1;
                    this.renderTable();
                }, 150);
            });
        }

        const statusSelect = document.getElementById('filter-status-select');
        if (statusSelect) {
            statusSelect.addEventListener('change', (e) => {
                this.statusFilter = e.target.value;
                this.currentPage = 1;
                this.renderTable();
            });
        }

        const typeSelect = document.getElementById('filter-type-select');
        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                this.typeFilter = e.target.value;
                this.currentPage = 1;
                this.renderTable();
            });
        }

        const ownerSelect = document.getElementById('filter-owner-select');
        if (ownerSelect) {
            ownerSelect.addEventListener('change', (e) => {
                this.ownerFilter = e.target.value;
                this.currentPage = 1;
                this.renderTable();
            });
        }

        const exportBtn = document.getElementById('btn-export-csv');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportMetadataCSV(false);
            });
        }
    },

    getFilteredVaults() {
        if (!window.AegisVaultData || !AegisVaultData.vaults) return [];

        return AegisVaultData.vaults.filter(v => {
            if (this.searchQuery) {
                const q = this.searchQuery;
                const matchId = (v.id || '').toLowerCase().includes(q);
                const matchName = (v.name || '').toLowerCase().includes(q);
                const matchOwner = (v.owner || '').toLowerCase().includes(q);
                const matchEmail = (v.ownerEmail || '').toLowerCase().includes(q);
                if (!matchId && !matchName && !matchOwner && !matchEmail) return false;
            }

            if (this.statusFilter !== 'all' && (v.status || '').toLowerCase() !== this.statusFilter.toLowerCase()) {
                return false;
            }

            if (this.typeFilter !== 'all' && (v.type || '').toLowerCase() !== this.typeFilter.toLowerCase()) {
                return false;
            }

            if (this.ownerFilter !== 'all' && v.owner !== this.ownerFilter) {
                return false;
            }

            return true;
        });
    },

    /* =========================================================================
       Table Rendering & Pagination
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

        if (counter) {
            if (total === 0) {
                counter.textContent = 'Showing 0-0 of 0 vaults';
            } else {
                counter.textContent = `Showing ${startIndex + 1}-${endIndex} of ${total} vaults`;
            }
        }

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
                const typeClass = (v.type || 'personal').toLowerCase();
                const statusClass = (v.status || 'active').toLowerCase();

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

        tbody.querySelectorAll('.row-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id');
                if (e.target.checked) {
                    this.selectedVaultIds.add(id);
                } else {
                    this.selectedVaultIds.delete(id);
                }
                this.updateBulkActionBar();
            });
        });

        if (selectAllBox) {
            selectAllBox.checked = pageRecords.length > 0 && pageRecords.every(r => this.selectedVaultIds.has(r.id));
            selectAllBox.indeterminate = pageRecords.some(r => this.selectedVaultIds.has(r.id)) && !selectAllBox.checked;
        }

        this.renderPagination(totalPages);
    },

    renderPagination(totalPages) {
        const wrap = document.getElementById('pagination-controls');
        if (!wrap) return;

        if (totalPages <= 1) {
            wrap.innerHTML = '';
            return;
        }

        let buttons = '';
        buttons += `
            <button class="page-nav-btn" data-page="${this.currentPage - 1}" ${this.currentPage === 1 ? 'disabled' : ''} aria-label="Previous Page">
                &lt;
            </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || Math.abs(i - this.currentPage) <= 1) {
                buttons += `
                    <button class="page-num-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}" aria-label="Page ${i}">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                buttons += `<span class="page-dots">...</span>`;
            }
        }

        buttons += `
            <button class="page-nav-btn" data-page="${this.currentPage + 1}" ${this.currentPage === totalPages ? 'disabled' : ''} aria-label="Next Page">
                &gt;
            </button>
        `;

        wrap.innerHTML = buttons;

        wrap.querySelectorAll('button[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetPage = parseInt(e.currentTarget.getAttribute('data-page'), 10);
                if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages) {
                    this.currentPage = targetPage;
                    this.renderTable();
                }
            });
        });
    },

    updateBulkActionBar() {
        const bar = document.getElementById('bulk-selection-bar');
        const countLabel = document.getElementById('bulk-selected-count');
        const count = this.selectedVaultIds.size;

        if (bar && countLabel) {
            if (count > 0) {
                countLabel.textContent = `${count} vault${count > 1 ? 's' : ''} selected`;
                bar.classList.add('visible');
            } else {
                bar.classList.remove('visible');
            }
        }
    },

    /* =========================================================================
       Modals & Workflows
       ========================================================================= */
    initModals() {
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-close-modal');
                this.closeModal(modalId);
            });
        });

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(overlay.id);
                }
            });
        });

        const btnCreate = document.getElementById('btn-create-vault');
        if (btnCreate) {
            btnCreate.addEventListener('click', () => {
                this.openModal('create-vault-modal');
            });
        }

        const createForm = document.getElementById('create-vault-form');
        if (createForm) {
            createForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('new-vault-name')?.value.trim();
                const owner = document.getElementById('new-vault-owner')?.value;
                const type = document.getElementById('new-vault-type')?.value || 'Personal';
                const threshold = document.getElementById('new-vault-trustees')?.value || '2 of 3';

                if (!name) {
                    this.showToast('Please provide a valid vault name', 'warning');
                    return;
                }

                const [reqShares, totShares] = threshold.split(' of ').map(n => parseInt(n, 10)) || [2, 3];

                if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
                    window.AegisAPI.post('/admin/vaults/', {
                        name: name,
                        owner: owner,
                        vault_type: type.toLowerCase(),
                        required_shares: reqShares,
                        total_shares: totShares,
                    }).then(newV => {
                        this.showToast(`Vault "${name}" successfully provisioned!`, 'success');
                        this.closeModal('create-vault-modal');
                        createForm.reset();
                        this.loadData();
                    }).catch(err => {
                        this.showToast(err.message || 'Failed to create vault', 'error');
                    });
                } else {
                    this.showToast('Authentication required to provision vaults', 'warning');
                }
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
        if (!window.AegisVaultData) return;
        const vault = AegisVaultData.vaults.find(v => v.id === vaultId);
        if (!vault) return;

        const setTxt = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setTxt('detail-vault-id', vault.id);
        setTxt('detail-vault-name', vault.name);
        setTxt('detail-vault-owner', `${vault.owner} ${vault.ownerEmail ? `(${vault.ownerEmail})` : ''}`);
        setTxt('detail-vault-type', `${vault.type} Documents`);
        setTxt('detail-vault-status', vault.status);
        setTxt('detail-vault-threshold', `${vault.threshold} (${vault.verifiedTrustees}/${vault.trusteesCount} Verified)`);
        setTxt('detail-vault-heartbeat', `${vault.heartbeatInterval} (Status: ${vault.heartbeatStatus})`);
        setTxt('detail-vault-crypto', `${vault.encryption} · Zero-Knowledge`);

        const manageBtn = document.getElementById('btn-detail-manage-trustees');
        if (manageBtn) {
            manageBtn.onclick = () => {
                this.closeModal('vault-details-modal');
                this.openAccessModal(vaultId);
            };
        }

        this.openModal('vault-details-modal');

        // Fetch fresh detail from API to ensure accurate real-time values
        const apiVaultId = vault.rawId || vault.id;
        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
            window.AegisAPI.get(`/admin/vaults/${apiVaultId}/`).then(data => {
                if (data.heartbeat_schedule) {
                    setTxt('detail-vault-heartbeat', `${data.heartbeat_schedule} (Status: ${data.heartbeat_status || 'Healthy'})`);
                }
                if (data.shares) {
                    const activeShares = data.shares.filter(s => (s.status || '').toLowerCase() === 'active').length;
                    setTxt('detail-vault-threshold', `${data.required_shares || 2} of ${data.total_shares || 3} (${activeShares}/${data.total_shares || 3} Verified)`);
                }
            }).catch(e => {});
        }
    },

    openAccessModal(vaultId) {
        const listWrap = document.getElementById('trustees-directory-list');
        if (!listWrap) return;

        listWrap.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.8rem;">Loading assigned trustees...</div>';
        this.openModal('manage-access-modal');

        const vault = (window.AegisVaultData && window.AegisVaultData.vaults) ? window.AegisVaultData.vaults.find(v => v.id === vaultId) : null;
        const apiVaultId = (vault && vault.rawId) ? vault.rawId : vaultId;

        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
            window.AegisAPI.get(`/admin/vaults/${apiVaultId}/`).then(data => {
                const shares = data.shares || [];
                if (shares.length === 0) {
                    listWrap.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.8rem;">No trustees currently assigned to this vault.</div>';
                    return;
                }
                listWrap.innerHTML = shares.map(t => `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; background: var(--bg-page); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                        <div>
                            <div style="font-weight: 700; font-size: 0.82rem; color: var(--text-heading);">${this.escapeHtml(t.trustee_name || 'Trustee')}</div>
                            <div style="font-size: 0.72rem; color: var(--text-muted);">${this.escapeHtml(t.trustee_email || '')} · ${t.access_level || 'Shard Holder'}</div>
                        </div>
                        <span class="badge-status ${(t.status || '').toLowerCase() === 'active' || (t.status || '').toLowerCase() === 'verified' ? 'active' : 'pending'}" style="font-size: 0.7rem;">${t.status ? (t.status.charAt(0).toUpperCase() + t.status.slice(1)) : 'Active'}</span>
                    </div>
                `).join('');
            }).catch(err => {
                listWrap.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.8rem;">No trustee records found.</div>';
            });
        } else {
            listWrap.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.8rem;">No trustee records found.</div>';
        }
    },

    async toggleVaultStatus(vaultId) {
        if (!window.AegisVaultData) return;
        const vault = AegisVaultData.vaults.find(v => v.id === vaultId);
        if (!vault) return;

        const nextStatus = vault.status === 'Archived' ? 'Active' : 'Archived';
        vault.status = nextStatus;

        try {
            if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
                await window.AegisAPI.put(`/admin/vaults/${vault.rawId || vaultId}/`, {
                    status: nextStatus
                });
            }
            this.showToast(`Vault ${vault.name} status updated to ${nextStatus}`, 'success');
        } catch (e) {
            console.warn('Vault status update error:', e);
            this.showToast(`Vault ${vault.name} status updated locally to ${nextStatus}`, 'info');
        }

        this.updateDynamicKPIs();
        this.renderTable();
    },

    initQuickActions() {
        const quickTemplatesBtn = document.getElementById('action-vault-templates');
        if (quickTemplatesBtn) {
            quickTemplatesBtn.addEventListener('click', () => {
                this.openTemplatesModal();
            });
        }


        const selectAllCb = document.getElementById('checkbox-select-all');
        if (selectAllCb) {
            selectAllCb.addEventListener('change', (e) => {
                const filtered = this.getFilteredVaults();
                const startIndex = (this.currentPage - 1) * this.rowsPerPage;
                const pageRecords = filtered.slice(startIndex, startIndex + this.rowsPerPage);

                pageRecords.forEach(r => {
                    if (e.target.checked) {
                        this.selectedVaultIds.add(r.id);
                    } else {
                        this.selectedVaultIds.delete(r.id);
                    }
                });

                this.renderTable();
                this.updateBulkActionBar();
            });
        }

        const btnBulkClear = document.getElementById('btn-bulk-clear');
        if (btnBulkClear) {
            btnBulkClear.addEventListener('click', () => {
                this.selectedVaultIds.clear();
                this.renderTable();
                this.updateBulkActionBar();
            });
        }

        const btnBulkArchive = document.getElementById('btn-bulk-archive');
        if (btnBulkArchive) {
            btnBulkArchive.addEventListener('click', () => {
                const count = this.selectedVaultIds.size;
                if (count === 0) return;
                AegisVaultData.vaults.forEach(v => {
                    if (this.selectedVaultIds.has(v.id)) {
                        v.status = 'Archived';
                    }
                });
                this.selectedVaultIds.clear();
                this.showToast(`Archived ${count} selected vaults`, 'success');
                this.updateDynamicKPIs();
                this.renderTable();
                this.updateBulkActionBar();
            });
        }

        const btnBulkExport = document.getElementById('btn-bulk-export');
        if (btnBulkExport) {
            btnBulkExport.addEventListener('click', () => {
                this.exportMetadataCSV(true);
            });
        }
    },

    openTemplatesModal() {
        const listWrap = document.getElementById('templates-cards-list');
        if (listWrap && window.AegisVaultData) {
            listWrap.innerHTML = AegisVaultData.templates.map(t => `
                <div style="padding: 1rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                        <h4 style="margin: 0; font-size: 0.95rem; color: var(--text-heading); font-weight: 700;">${this.escapeHtml(t.title)}</h4>
                        <span class="badge-type ${t.type.toLowerCase()}">${t.type}</span>
                    </div>
                    <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 0.25rem 0 0.5rem;">${this.escapeHtml(t.desc)}</p>
                    <div style="font-size: 0.72rem; color: var(--brand-orange); font-weight: 600;">${t.trustees}</div>
                </div>
            `).join('');
        }
        this.openModal('vault-templates-modal');
    },

    exportMetadataCSV(selectedOnly = false) {
        if (!window.AegisVaultData) return;

        let records = AegisVaultData.vaults || [];
        if (selectedOnly) {
            records = records.filter(v => this.selectedVaultIds.has(v.id));
        }

        if (records.length === 0) {
            this.showToast('No vaults available for export', 'warning');
            return;
        }

        const headers = ["Vault ID", "Vault Name", "Owner Name", "Owner Email", "Category", "Lifecycle Status", "Created On", "Last Accessed", "Trustee Threshold", "Storage Size"];
        const rows = records.map(v => [
            v.id,
            `"${(v.name || '').replace(/"/g, '""')}"`,
            `"${(v.owner || '').replace(/"/g, '""')}"`,
            v.ownerEmail || '',
            v.type || '',
            v.status || '',
            v.createdOn || '',
            v.lastAccessed || '',
            `"${v.threshold || ''}"`,
            v.storageSize || ''
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

window.AegisVaultController = AegisVaultController;
window.AegisInteractions = AegisVaultController;

document.addEventListener('DOMContentLoaded', () => {
    AegisVaultController.init();
});
