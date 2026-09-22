/**
 * AegisVault — Audit Logs Controller & Interactions
 * 
 * Simple, self-contained JavaScript for the Audit Logs module:
 * - Dual theme switching (Light / Dark) with background switching & persistence
 * - Table rendering with color-coded action & status badges
 * - Multi-field filtering (Action, User, Module) & live search
 * - Timestamp sorting & pagination
 * - Synchronized right-hand Log Details inspector & Raw JSON data viewer
 * - CSV export download
 * - Session ID clipboard copying, dropdown menus, and toast notifications
 */

window.AegisAuditLogs = {
    THEME_KEY: 'aegisvault_theme',
    logs: [],
    filteredLogs: [],
    currentPage: 1,
    pageSize: 10,
    selectedLogId: "LOG-012482",
    sortOrder: "desc", // "desc" or "asc"
    activeTab: "details",

    init() {
        this.logs = [...(window.AegisMockLogs || [])];
        this.filteredLogs = [...this.logs];
        // 1. Initialize Audit Table & Inspector
        this.initEventListeners();
        this.renderTable();
        this.selectLog(this.selectedLogId);
        this.updateKPIs();
    },

    /* =========================================================================
       3. Toast Notifications (Delegated to AegisAdminCommon)
       ========================================================================= */
    showToast(message, type = 'info') {
        if (window.AegisAdminCommon) {
            AegisAdminCommon.showToast(message, type);
        } else {
            alert(message);
        }
    },

    /* =========================================================================
       5. Audit Table & Toolbar Event Listeners
       ========================================================================= */
    initEventListeners() {
        // Search Input
        const searchInput = document.getElementById('audit-table-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Dropdown Filters
        const actionFilter = document.getElementById('filter-action');
        const userFilter = document.getElementById('filter-user');
        const moduleFilter = document.getElementById('filter-module');

        if (actionFilter) actionFilter.addEventListener('change', () => this.applyFilters());
        if (userFilter) userFilter.addEventListener('change', () => this.applyFilters());
        if (moduleFilter) moduleFilter.addEventListener('change', () => this.applyFilters());

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

        // Export Logs Button
        const btnExport = document.getElementById('btn-export-logs');
        if (btnExport) {
            btnExport.addEventListener('click', () => this.exportCurrentLogsCSV());
        }

        // Timestamp Column Sorting
        const thTimestamp = document.getElementById('th-timestamp');
        if (thTimestamp) {
            thTimestamp.addEventListener('click', () => this.toggleTimestampSort());
        }

        // Select All Checkbox
        const selectAllCb = document.getElementById('checkbox-select-all');
        if (selectAllCb) {
            selectAllCb.addEventListener('change', (e) => {
                const rowCheckboxes = document.querySelectorAll('.table-row-checkbox');
                rowCheckboxes.forEach(cb => cb.checked = e.target.checked);
            });
        }

        // Details Panel Tabs (Details vs Raw Data)
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
                const detailsCard = document.getElementById('log-details-panel');
                if (detailsCard) {
                    detailsCard.style.display = 'none';
                    this.showToast('Log Details panel collapsed. Click any row to expand.', 'info');
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
       6. KPI Metric Numbers Update
       ========================================================================= */
    updateKPIs() {
        if (!window.AegisAuditStats) return;
        const s = window.AegisAuditStats;

        const totalEl = document.getElementById('kpi-total-logs');
        const userEl = document.getElementById('kpi-user-actions');
        const vaultEl = document.getElementById('kpi-vault-actions');
        const secEl = document.getElementById('kpi-security-events');
        const adminEl = document.getElementById('kpi-admin-actions');

        if (totalEl) totalEl.textContent = Number(s.totalLogs).toLocaleString();
        if (userEl) userEl.textContent = Number(s.userActions).toLocaleString();
        if (vaultEl) vaultEl.textContent = Number(s.vaultActions).toLocaleString();
        if (secEl) secEl.textContent = Number(s.securityEvents).toLocaleString();
        if (adminEl) adminEl.textContent = Number(s.adminActions).toLocaleString();
    },

    /* =========================================================================
       7. Real-time Search & Filter Engine
       ========================================================================= */
    handleSearch(query) {
        const q = query.trim().toLowerCase();
        if (!q) {
            this.applyFilters();
            return;
        }

        this.filteredLogs = this.logs.filter(l => 
            l.user.toLowerCase().includes(q) ||
            l.action.toLowerCase().includes(q) ||
            l.details.toLowerCase().includes(q) ||
            l.ipAddress.toLowerCase().includes(q) ||
            l.module.toLowerCase().includes(q) ||
            l.id.toLowerCase().includes(q)
        );

        this.currentPage = 1;
        this.renderTable();
    },

    applyFilters() {
        const action = document.getElementById('filter-action')?.value || 'all';
        const user = document.getElementById('filter-user')?.value || 'all';
        const module = document.getElementById('filter-module')?.value || 'all';
        const search = document.getElementById('audit-table-search')?.value.trim().toLowerCase() || '';

        this.filteredLogs = this.logs.filter(l => {
            const matchAction = action === 'all' || l.action.toLowerCase() === action.toLowerCase();
            const matchUser = user === 'all' || l.user.toLowerCase().includes(user.toLowerCase());
            const matchModule = module === 'all' || l.module.toLowerCase() === module.toLowerCase();
            const matchSearch = !search || (
                l.user.toLowerCase().includes(search) ||
                l.action.toLowerCase().includes(search) ||
                l.details.toLowerCase().includes(search) ||
                l.ipAddress.toLowerCase().includes(search)
            );

            return matchAction && matchUser && matchModule && matchSearch;
        });

        this.currentPage = 1;
        this.renderTable();
    },

    resetFilters() {
        if (document.getElementById('audit-table-search')) document.getElementById('audit-table-search').value = '';
        if (document.getElementById('filter-action')) document.getElementById('filter-action').value = 'all';
        if (document.getElementById('filter-user')) document.getElementById('filter-user').value = 'all';
        if (document.getElementById('filter-module')) document.getElementById('filter-module').value = 'all';

        this.filteredLogs = [...this.logs];
        this.currentPage = 1;
        this.renderTable();
        this.showToast('Audit log filters reset to default', 'info');
    },

    toggleTimestampSort() {
        this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
        this.filteredLogs.sort((a, b) => {
            const dateA = new Date(a.dateSort).getTime();
            const dateB = new Date(b.dateSort).getTime();
            return this.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        const icon = document.getElementById('sort-icon-timestamp');
        if (icon) {
            icon.textContent = this.sortOrder === 'desc' ? '⌄' : '⌃';
        }

        this.renderTable();
        this.showToast(`Sorted by timestamp (${this.sortOrder === 'desc' ? 'Newest first' : 'Oldest first'})`, 'info');
    },

    /* =========================================================================
       8. Table Rendering
       ========================================================================= */
    renderTable() {
        const tbody = document.getElementById('audit-table-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.filteredLogs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                        <div style="font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem;">No audit logs found</div>
                        <p style="font-size: 0.8rem;">Try adjusting your search criteria or active filters.</p>
                    </td>
                </tr>
            `;
            this.updatePagination(0);
            return;
        }

        const startIndex = (this.currentPage - 1) * this.pageSize;
        const paginatedLogs = this.filteredLogs.slice(startIndex, startIndex + this.pageSize);

        paginatedLogs.forEach((l, i) => {
            const tr = document.createElement('tr');
            tr.className = l.id === this.selectedLogId ? 'row-selected' : '';
            tr.setAttribute('data-log-id', l.id);

            const actionBadgeClass = `action-${l.action.toLowerCase()}`;
            const statusClass = l.status.toLowerCase();

            tr.innerHTML = `
                <td>
                    <input type="checkbox" class="table-checkbox table-row-checkbox" onclick="event.stopPropagation();">
                </td>
                <td style="color: var(--text-secondary); font-weight: 600;">${startIndex + i + 1}</td>
                <td style="white-space: nowrap; color: var(--text-heading); font-weight: 500;">${l.timestamp}</td>
                <td style="color: var(--text-secondary); font-family: var(--font-sans);">${l.user}</td>
                <td>
                    <span class="badge-action ${actionBadgeClass}">
                        ${this.getActionIconSvg(l.action)}
                        <span>${l.action}</span>
                    </span>
                </td>
                <td style="color: var(--text-secondary); font-weight: 500;">${l.module}</td>
                <td style="color: var(--text-heading); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${l.description || l.details}">
                    ${l.details}
                </td>
                <td style="font-family: var(--font-mono); color: var(--text-secondary);">${l.ipAddress}</td>
                <td>
                    <span class="badge-status ${statusClass}">
                        <span class="status-dot"></span>
                        <span>${l.status}</span>
                    </span>
                </td>
                <td>
                    <button class="btn-row-action" title="View details" onclick="event.stopPropagation(); window.AegisAuditLogs.selectLog('${l.id}');">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <circle cx="5" cy="12" r="2"></circle>
                            <circle cx="12" cy="12" r="2"></circle>
                            <circle cx="19" cy="12" r="2"></circle>
                        </svg>
                    </button>
                </td>
            `;

            tr.addEventListener('click', () => {
                this.selectLog(l.id);
            });

            tbody.appendChild(tr);
        });

        this.updatePagination(this.filteredLogs.length);
    },

    getActionIconSvg(action) {
        switch (action) {
            case 'LOGIN':
                return `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>`;
            case 'USER_UPDATE':
            case 'ROLE_CHANGE':
                return `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
            case 'VAULT_ACCESS':
            case 'VAULT_CREATE':
                return `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
            case 'TRUSTEE_ADDED':
                return `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
            case 'FAILED_LOGIN':
            case 'ACCOUNT_SUSPENDED':
                return `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
            case 'SETTINGS_CHANGE':
                return `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;
            case 'VAULT_SHARE':
                return `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"></rect><circle cx="12" cy="16" r="2"></circle></svg>`;
            case 'DATA_EXPORT':
                return `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
            default:
                return `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"></circle></svg>`;
        }
    },

    /* =========================================================================
       9. Log Details Inspector Panel Synchronization
       ========================================================================= */
    selectLog(id) {
        this.selectedLogId = id;
        const log = this.logs.find(l => l.id === id);
        if (!log) return;

        // Highlight selected table row
        document.querySelectorAll('#audit-table-tbody tr').forEach(r => {
            if (r.getAttribute('data-log-id') === id) {
                r.classList.add('row-selected');
            } else {
                r.classList.remove('row-selected');
            }
        });

        // Ensure Log Details card is visible
        const detailsPanel = document.getElementById('log-details-panel');
        if (detailsPanel) detailsPanel.style.display = 'flex';

        // Header identity elements
        const titleEl = document.getElementById('details-log-title');
        const timeEl = document.getElementById('details-log-time');
        const statusEl = document.getElementById('details-log-status');

        if (titleEl) titleEl.textContent = log.actionLabel || log.action;
        if (timeEl) timeEl.textContent = log.timestamp;
        if (statusEl) {
            statusEl.className = `badge-status ${log.status.toLowerCase()}`;
            statusEl.innerHTML = `<span class="status-dot"></span><span>${log.status}</span>`;
        }

        // Details key-value rows
        const valUser = document.getElementById('meta-log-user');
        const valAction = document.getElementById('meta-log-action');
        const valModule = document.getElementById('meta-log-module');
        const valDesc = document.getElementById('meta-log-description');
        const valIp = document.getElementById('meta-log-ip');
        const valLoc = document.getElementById('meta-log-location');
        const valDevice = document.getElementById('meta-log-device');
        const valSession = document.getElementById('meta-log-session');
        const valStatus = document.getElementById('meta-log-status');

        if (valUser) valUser.textContent = log.user;
        if (valAction) valAction.textContent = log.action;
        if (valModule) valModule.textContent = log.moduleFull || log.module;
        if (valDesc) valDesc.textContent = log.description || log.details;
        if (valIp) valIp.textContent = log.ipAddress;
        if (valLoc) valLoc.innerHTML = `🇮🇳 ${log.location}`;
        if (valDevice) valDevice.textContent = log.device;
        if (valSession) {
            valSession.innerHTML = `
                <span class="session-id-wrap" onclick="window.AegisAuditLogs.copyToClipboard('${log.sessionId}', 'Session ID copied!')">
                    <span>${log.sessionId.slice(0, 22)}...</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </span>
            `;
        }
        if (valStatus) {
            valStatus.innerHTML = `
                <span class="badge-status ${log.status.toLowerCase()}">
                    <span class="status-dot"></span>
                    <span>${log.status}</span>
                </span>
            `;
        }

        // Raw Data JSON panel
        const rawJsonEl = document.getElementById('raw-json-code');
        if (rawJsonEl) {
            rawJsonEl.textContent = JSON.stringify(log.rawData || log, null, 2);
        }

        // Related Logs render
        this.renderRelatedLogs(log);
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

    renderRelatedLogs(log) {
        const container = document.getElementById('related-logs-container');
        if (!container) return;

        if (!log.relatedLogs || log.relatedLogs.length === 0) {
            container.innerHTML = `<p style="font-size: 0.74rem; color: var(--text-muted); padding: 0.5rem 0;">No related sequential records.</p>`;
            return;
        }

        container.innerHTML = log.relatedLogs.map((r, idx) => `
            <div class="related-log-item" onclick="window.AegisAuditLogs.showToast('Inspecting: ${r.title}', 'info');">
                <div class="related-icon-circle ${idx % 2 === 1 ? 'amber' : ''}">
                    ${idx % 2 === 1 
                        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`
                        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
                    }
                </div>
                <div class="related-meta">
                    <span class="related-title">${r.title}</span>
                    <span class="related-time">${r.time}</span>
                </div>
            </div>
        `).join('');
    },

    /* =========================================================================
       10. Pagination Controls
       ========================================================================= */
    updatePagination(totalCount) {
        const infoEl = document.getElementById('pagination-info-text');
        if (infoEl) {
            const start = totalCount === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
            const end = Math.min(this.currentPage * this.pageSize, totalCount);
            infoEl.textContent = `Showing ${start}–${end} of ${totalCount.toLocaleString()} logs`;
        }

        const totalPages = Math.max(1, Math.ceil(totalCount / this.pageSize));
        const prevBtn = document.getElementById('btn-page-prev');
        const nextBtn = document.getElementById('btn-page-next');

        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;
    },

    goToPage(page) {
        const totalPages = Math.max(1, Math.ceil(this.filteredLogs.length / this.pageSize));
        if (page < 1 || page > totalPages) return;
        this.currentPage = page;
        this.renderTable();
    },

    /* =========================================================================
       11. CSV Export
       ========================================================================= */
    exportCurrentLogsCSV() {
        const logsToExport = this.filteredLogs.length > 0 ? this.filteredLogs : this.logs;
        const headers = ["Event ID", "Timestamp", "User", "Action", "Module", "Details", "IP Address", "Status"];
        const rows = logsToExport.map(l => [
            `"${l.id}"`,
            `"${l.timestamp}"`,
            `"${l.user}"`,
            `"${l.action}"`,
            `"${l.module}"`,
            `"${(l.details || '').replace(/"/g, '""')}"`,
            `"${l.ipAddress}"`,
            `"${l.status}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `aegisvault_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showToast(`Exported ${logsToExport.length} audit logs to CSV`, 'success');
    }
};

// Backwards compatibility alias for inline HTML handlers
window.AegisInteractions = window.AegisAuditLogs;

document.addEventListener('DOMContentLoaded', () => {
    window.AegisAuditLogs.init();
});
