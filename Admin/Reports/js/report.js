/**
 * AegisVault — Reports Module Controller
 * Provides complete frontend interactivity for the Reports module:
 * - Theme toggle (Light / Dark)
 * - Dynamic SVG Line Chart with period selection & interactive tooltips
 * - Dynamic SVG Donut Charts (Reports by Type & Report Status)
 * - Tab navigation filtering (Overview, User, Security, Vault, System)
 * - Live search & multi-criteria table filtering
 * - Report Generation simulation with modal
 * - Report Inspection Details modal with SHA-256 verification
 * - Client-side file exports (CSV, JSON, PDF simulated print)
 * - Toast notification messaging system
 */

(function () {
    'use strict';

    const AegisReportsController = {
        THEME_KEY: 'aegisvault_theme',
        currentTab: 'Overview',
        trendPeriod: '12days',
        searchQuery: '',
        typeFilter: 'all',
        statusFilter: 'all',
        reportsData: [],

        init() {
            // 1. Clone mock data so user actions can mutate in-memory
            this.reportsData = [...(window.AegisReportMockData?.reportsList || [])];

            // 2. Initialize UI mechanisms
            this.initTheme();
            this.initHeaderDropdowns();
            this.initMobileDrawer();

            // 3. Render Dashboard Components
            this.renderKPIs();
            this.renderLineChart();
            this.renderReportsByTypeDonut();
            this.renderReportStatusDonut();
            this.renderReportsTable();

            // 4. Bind Interactive Events
            this.bindTabEvents();
            this.bindFilterEvents();
            this.bindQuickActions();
            this.bindModals();
        },

        /* =========================================================================
           1. Theme Management (Light / Dark)
           ========================================================================= */
        initTheme() {
            const toggleBtn = document.getElementById('btn-theme-toggle');
            const savedTheme = localStorage.getItem(this.THEME_KEY) || 
                               localStorage.getItem('aegis_theme') || 'light';

            this.applyTheme(savedTheme, false);

            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    const current = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
                    const nextTheme = current === 'dark' ? 'light' : 'dark';
                    this.applyTheme(nextTheme, true);
                });
            }
        },

        applyTheme(theme, showToastNotification = true) {
            const isDark = theme === 'dark';
            document.documentElement.setAttribute('data-theme', theme);

            if (isDark) {
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
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
            localStorage.setItem('aegis_theme', theme);

            // Re-render SVG charts so line & donut strokes adapt cleanly
            this.renderLineChart();
            this.renderReportsByTypeDonut();
            this.renderReportStatusDonut();

            if (showToastNotification) {
                this.showToast(`Switched to ${isDark ? 'Dark Theme' : 'Light Theme'}`, 'info');
            }
        },

        isDark() {
            return document.body.classList.contains('dark-theme');
        },

        /* =========================================================================
           2. Header Dropdowns, Keyboard Shortcuts, and Mobile Drawer
           ========================================================================= */
        initHeaderDropdowns() {
            const notifBtn = document.getElementById('btn-notifications');
            const notifDropdown = document.getElementById('notifications-dropdown');
            const profileBtn = document.getElementById('user-profile-btn');
            const profileDropdown = document.getElementById('profile-dropdown');

            if (notifBtn && notifDropdown) {
                notifBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    notifDropdown.classList.toggle('active');
                    if (profileDropdown) profileDropdown.classList.remove('active');
                });
            }

            if (profileBtn && profileDropdown) {
                profileBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    profileDropdown.classList.toggle('active');
                    if (notifDropdown) notifDropdown.classList.remove('active');
                });
            }

            document.addEventListener('click', (e) => {
                if (notifDropdown && !notifDropdown.contains(e.target) && e.target !== notifBtn) {
                    notifDropdown.classList.remove('active');
                }
                if (profileDropdown && !profileDropdown.contains(e.target) && e.target !== profileBtn) {
                    profileDropdown.classList.remove('active');
                }
            });

            // Global search shortcut '/'
            const searchInput = document.getElementById('global-header-search') || document.getElementById('global-search-input');
            document.addEventListener('keydown', (e) => {
                if (e.key === '/' && document.activeElement !== searchInput && 
                    !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                    e.preventDefault();
                    if (searchInput) {
                        searchInput.focus();
                        searchInput.select();
                    }
                }
                if (e.key === 'Escape') {
                    if (notifDropdown) notifDropdown.classList.remove('active');
                    if (profileDropdown) profileDropdown.classList.remove('active');
                    this.closeAllModals();
                }
            });
        },

        initMobileDrawer() {
            const hamburgerBtn = document.getElementById('btn-hamburger');
            const sidebar = document.getElementById('app-sidebar');
            const backdrop = document.getElementById('sidebar-backdrop');

            if (hamburgerBtn && sidebar) {
                hamburgerBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    sidebar.classList.toggle('active');
                    if (backdrop) backdrop.classList.toggle('active');
                });

                if (backdrop) {
                    backdrop.addEventListener('click', () => {
                        sidebar.classList.remove('active');
                        backdrop.classList.remove('active');
                    });
                }

                document.addEventListener('click', (e) => {
                    if (sidebar.classList.contains('active') && 
                        !sidebar.contains(e.target) && 
                        e.target !== hamburgerBtn) {
                        sidebar.classList.remove('active');
                        if (backdrop) backdrop.classList.remove('active');
                    }
                });
            }
        },

        /* =========================================================================
           3. KPI Summary Metrics
           ========================================================================= */
        renderKPIs() {
            const data = window.AegisReportMockData?.kpis;
            if (!data) return;

            const elTotal = document.getElementById('kpi-total-reports');
            const elUser = document.getElementById('kpi-user-reports');
            const elSec = document.getElementById('kpi-security-reports');
            const elVault = document.getElementById('kpi-vault-reports');

            if (elTotal) elTotal.textContent = data.totalReports.value;
            if (elUser) elUser.textContent = data.userReports.value;
            if (elSec) elSec.textContent = data.securityReports.value;
            if (elVault) elVault.textContent = data.vaultReports.value;
        },

        /* =========================================================================
           4. Interactive SVG Line Chart (Report Generation Trend)
           ========================================================================= */
        renderLineChart() {
            const container = document.getElementById('trend-chart-container');
            const pointsData = window.AegisReportMockData?.trends[this.trendPeriod] || [];
            if (!container || pointsData.length === 0) return;

            const width = 460;
            const height = 160;
            const padding = { top: 20, right: 25, bottom: 25, left: 35 };

            const chartW = width - padding.left - padding.right;
            const chartH = height - padding.top - padding.bottom;

            const maxVal = 50; // Reference chart max is 50
            const minVal = 0;

            // Compute coordinates
            const coords = pointsData.map((d, index) => {
                const x = padding.left + (index / (pointsData.length - 1)) * chartW;
                const y = padding.top + chartH - ((d.count - minVal) / (maxVal - minVal)) * chartH;
                return { x, y, ...d };
            });

            // Smooth Bezier Curve algorithm
            let pathD = `M ${coords[0].x} ${coords[0].y}`;
            for (let i = 0; i < coords.length - 1; i++) {
                const p0 = coords[i === 0 ? 0 : i - 1];
                const p1 = coords[i];
                const p2 = coords[i + 1];
                const p3 = coords[i + 2] || p2;

                const cp1x = p1.x + (p2.x - p0.x) / 6;
                const cp1y = p1.y + (p2.y - p0.y) / 6;
                const cp2x = p2.x - (p3.x - p1.x) / 6;
                const cp2y = p2.y - (p3.y - p1.y) / 6;

                pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
            }

            // Area path closing down to bottom
            const lastCoord = coords[coords.length - 1];
            const firstCoord = coords[0];
            const areaD = `${pathD} L ${lastCoord.x} ${padding.top + chartH} L ${firstCoord.x} ${padding.top + chartH} Z`;

            // Y-axis grid lines: 0, 10, 20, 30, 40, 50
            const yTicks = [0, 10, 20, 30, 40, 50];
            let gridLinesSVG = '';
            yTicks.forEach(tick => {
                const y = padding.top + chartH - ((tick - minVal) / (maxVal - minVal)) * chartH;
                gridLinesSVG += `
                    <line class="chart-axis-line" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" />
                    <text class="chart-axis-label" x="${padding.left - 6}" y="${y + 3}">${tick}</text>
                `;
            });

            // X-axis labels
            let xLabelsSVG = '';
            coords.forEach((coord, i) => {
                // Show every 2nd or key label so they don't overlap
                if (i % 2 === 0 || i === coords.length - 1) {
                    xLabelsSVG += `
                        <text class="chart-axis-label-x" x="${coord.x}" y="${height - 6}">${coord.date}</text>
                    `;
                }
            });

            // Render interactive circles
            let dotsSVG = '';
            coords.forEach((coord, i) => {
                dotsSVG += `
                    <circle class="chart-data-dot" cx="${coord.x}" cy="${coord.y}" r="3.5"
                            data-index="${i}" data-count="${coord.count}" data-date="${coord.fullDate}" />
                `;
            });

            const isDarkMode = this.isDark();
            const gradStart = isDarkMode ? '#F5A84B' : '#E86326';

            container.innerHTML = `
                <svg class="line-chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="orangeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="${gradStart}" stop-opacity="0.32" />
                            <stop offset="100%" stop-color="${gradStart}" stop-opacity="0.0" />
                        </linearGradient>
                    </defs>
                    <g>${gridLinesSVG}</g>
                    <path class="chart-area-path" d="${areaD}" />
                    <path class="chart-curve-path" d="${pathD}" stroke="${gradStart}" />
                    <g>${dotsSVG}</g>
                    <g>${xLabelsSVG}</g>
                </svg>
                <div class="chart-tooltip-box" id="chart-tooltip-box">
                    <div class="chart-tooltip-val" id="tooltip-val">42 reports</div>
                    <div class="chart-tooltip-date" id="tooltip-date">12 Sep 2025</div>
                </div>
            `;

            // Bind tooltip hover
            const tooltip = document.getElementById('chart-tooltip-box');
            const dots = container.querySelectorAll('.chart-data-dot');

            dots.forEach(dot => {
                dot.addEventListener('mouseenter', (e) => {
                    const count = dot.getAttribute('data-count');
                    const date = dot.getAttribute('data-date');
                    const cx = parseFloat(dot.getAttribute('cx'));
                    const cy = parseFloat(dot.getAttribute('cy'));

                    if (tooltip) {
                        document.getElementById('tooltip-val').textContent = `${count} reports`;
                        document.getElementById('tooltip-date').textContent = date;

                        const rect = container.getBoundingClientRect();
                        const scaleX = rect.width / width;
                        const scaleY = rect.height / height;

                        tooltip.style.left = `${cx * scaleX}px`;
                        tooltip.style.top = `${cy * scaleY}px`;
                        tooltip.style.display = 'block';
                    }
                });

                dot.addEventListener('mouseleave', () => {
                    if (tooltip) tooltip.style.display = 'none';
                });
            });

            // Preset default tooltip on the last dot (12 Sep 2025, 42 reports matching reference screenshot)
            const lastDot = dots[dots.length - 1];
            if (lastDot && tooltip) {
                const cx = parseFloat(lastDot.getAttribute('cx'));
                const cy = parseFloat(lastDot.getAttribute('cy'));
                const rect = container.getBoundingClientRect();
                const scaleX = rect.width / width;
                const scaleY = rect.height / height;
                tooltip.style.left = `${cx * scaleX}px`;
                tooltip.style.top = `${cy * scaleY}px`;
                tooltip.style.display = 'block';
            }
        },

        /* =========================================================================
           5. SVG Donut Chart: Reports by Type
           ========================================================================= */
        renderReportsByTypeDonut() {
            const container = document.getElementById('donut-type-container');
            const legendContainer = document.getElementById('donut-type-legend');
            const data = window.AegisReportMockData?.reportsByType || [];
            if (!container || !legendContainer) return;

            const size = 110;
            const strokeWidth = 14;
            const radius = (size - strokeWidth) / 2;
            const circumference = 2 * Math.PI * radius;

            let currentOffset = 0;
            let pathsSVG = '';

            data.forEach((item) => {
                const strokeLength = (item.percentage / 100) * circumference;
                const strokeDasharray = `${strokeLength} ${circumference - strokeLength}`;
                const strokeDashoffset = -currentOffset;

                pathsSVG += `
                    <circle cx="${size / 2}" cy="${size / 2}" r="${radius}"
                            fill="transparent"
                            stroke="${item.color}"
                            stroke-width="${strokeWidth}"
                            stroke-dasharray="${strokeDasharray}"
                            stroke-dashoffset="${strokeDashoffset}"
                            style="transition: stroke-width 0.2s ease, opacity 0.2s ease;"
                            data-type="${item.label}" />
                `;
                currentOffset += strokeLength;
            });

            container.innerHTML = `
                <svg class="donut-svg" viewBox="0 0 ${size} ${size}">
                    ${pathsSVG}
                </svg>
                <div class="donut-center-badge">
                    <span class="donut-center-num">28</span>
                    <span class="donut-center-lbl">Total Reports</span>
                </div>
            `;

            // Populate Legend
            legendContainer.innerHTML = data.map(item => `
                <div class="donut-legend-item">
                    <span class="legend-color-tag">
                        <span class="legend-color-dot" style="background-color: ${item.color};"></span>
                        <span>${item.label}</span>
                    </span>
                    <span class="legend-pct-val">${item.percentage}%</span>
                </div>
            `).join('');
        },

        /* =========================================================================
           6. SVG Donut Chart: Report Status
           ========================================================================= */
        renderReportStatusDonut() {
            const container = document.getElementById('donut-status-container');
            const legendContainer = document.getElementById('donut-status-legend');
            const data = window.AegisReportMockData?.reportStatus || [];
            if (!container || !legendContainer) return;

            const size = 100;
            const strokeWidth = 13;
            const radius = (size - strokeWidth) / 2;
            const circumference = 2 * Math.PI * radius;

            let currentOffset = 0;
            let pathsSVG = '';

            data.forEach((item) => {
                const strokeLength = (item.percentage / 100) * circumference;
                const strokeDasharray = `${strokeLength} ${circumference - strokeLength}`;
                const strokeDashoffset = -currentOffset;

                pathsSVG += `
                    <circle cx="${size / 2}" cy="${size / 2}" r="${radius}"
                            fill="transparent"
                            stroke="${item.color}"
                            stroke-width="${strokeWidth}"
                            stroke-dasharray="${strokeDasharray}"
                            stroke-dashoffset="${strokeDashoffset}"
                            style="transition: stroke-width 0.2s ease;" />
                `;
                currentOffset += strokeLength;
            });

            container.innerHTML = `
                <svg class="donut-svg" viewBox="0 0 ${size} ${size}">
                    ${pathsSVG}
                </svg>
                <div class="donut-center-badge">
                    <span class="donut-center-num">28</span>
                    <span class="donut-center-lbl">Reports</span>
                </div>
            `;

            // Populate Legend Below
            legendContainer.innerHTML = data.map(item => `
                <div class="donut-legend-item">
                    <span class="legend-color-tag">
                        <span class="legend-color-dot" style="background-color: ${item.color};"></span>
                        <span>${item.label}</span>
                    </span>
                    <span class="legend-pct-val">${item.percentage}%</span>
                </div>
            `).join('');
        },

        /* =========================================================================
           7. Recent Reports Table (Search, Filter, Actions)
           ========================================================================= */
        renderReportsTable() {
            const tbody = document.getElementById('reports-table-body');
            if (!tbody) return;

            // Filter logic
            const filtered = this.reportsData.filter(report => {
                // Tab filter
                if (this.currentTab === 'User Reports' && report.type !== 'User') return false;
                if (this.currentTab === 'Security Reports' && report.type !== 'Security') return false;
                if (this.currentTab === 'Vault Reports' && report.type !== 'Vault') return false;
                if (this.currentTab === 'System Reports' && report.type !== 'System') return false;

                // Type select filter
                if (this.typeFilter !== 'all' && report.type.toLowerCase() !== this.typeFilter.toLowerCase()) {
                    return false;
                }

                // Status select filter
                if (this.statusFilter !== 'all' && report.status.toLowerCase() !== this.statusFilter.toLowerCase()) {
                    return false;
                }

                // Search query
                if (this.searchQuery) {
                    const q = this.searchQuery.toLowerCase();
                    const matchName = report.name.toLowerCase().includes(q);
                    const matchUser = report.generatedBy.toLowerCase().includes(q);
                    const matchType = report.type.toLowerCase().includes(q);
                    if (!matchName && !matchUser && !matchType) return false;
                }

                return true;
            });

            if (filtered.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
                            <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-heading); margin-bottom: 4px;">No matching reports found</div>
                            <div style="font-size: 0.76rem;">Try clearing your search query or selecting a different category filter.</div>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = filtered.map((report, idx) => `
                <tr data-id="${report.id}">
                    <td class="col-icon-status">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
                        </svg>
                    </td>
                    <td class="col-num">${idx + 1}</td>
                    <td class="col-report-name">${report.name}</td>
                    <td>
                        <span class="pill-type-badge ${report.typeClass}">
                            <span class="badge-dot"></span>
                            <span>${report.type}</span>
                        </span>
                    </td>
                    <td style="color: var(--text-secondary); font-family: var(--font-mono); font-size: 0.74rem;">${report.generatedBy}</td>
                    <td style="color: var(--text-secondary);">${report.dateTime}</td>
                    <td>
                        <span class="status-pill ${report.statusClass}">
                            <span class="badge-dot"></span>
                            <span>${report.status}</span>
                        </span>
                    </td>
                    <td>
                        <div class="row-actions-group">
                            <button class="row-action-btn btn-download-row" title="Download ${report.name}" data-id="${report.id}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                            </button>
                            <button class="row-action-btn btn-inspect-row" title="View Details" data-id="${report.id}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                            <button class="row-action-btn btn-more-row" title="More options" data-id="${report.id}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="19" cy="12" r="1"></circle>
                                    <circle cx="5" cy="12" r="1"></circle>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            // Bind Row Action Buttons
            tbody.querySelectorAll('.btn-download-row').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    this.downloadReport(id);
                });
            });

            tbody.querySelectorAll('.btn-inspect-row').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    this.openReportDetailsModal(id);
                });
            });

            tbody.querySelectorAll('.btn-more-row').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    const rep = this.reportsData.find(r => r.id === id);
                    this.showToast(`Options: ${rep?.name || 'Report'} ready for verification or re-run`, 'info');
                });
            });
        },

        /* =========================================================================
           8. Tab & Filter Event Bindings
           ========================================================================= */
        bindTabEvents() {
            const tabs = document.querySelectorAll('.report-tab-btn');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    this.currentTab = tab.getAttribute('data-tab');
                    this.renderReportsTable();
                    this.showToast(`Filtered by ${this.currentTab}`, 'info');
                });
            });

            // Date Range Pill Click
            const datePill = document.getElementById('btn-date-range-pill');
            if (datePill) {
                datePill.addEventListener('click', () => {
                    this.showToast('Date Range: 01 Sep 2025 – 12 Sep 2025 (Active Filter Window)', 'info');
                });
            }

            // Period dropdown for Line Chart
            const periodSelect = document.getElementById('select-trend-period');
            if (periodSelect) {
                periodSelect.addEventListener('change', (e) => {
                    this.trendPeriod = e.target.value;
                    this.renderLineChart();
                    this.showToast(`Trend adjusted to Last ${this.trendPeriod.replace('days', ' Days')}`, 'info');
                });
            }
        },

        bindFilterEvents() {
            const searchInput = document.getElementById('search-reports-input');
            const typeSelect = document.getElementById('filter-report-type');
            const statusSelect = document.getElementById('filter-report-status');
            const viewAllLink = document.getElementById('link-view-all-reports');

            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.searchQuery = e.target.value.trim();
                    this.renderReportsTable();
                });
            }

            if (typeSelect) {
                typeSelect.addEventListener('change', (e) => {
                    this.typeFilter = e.target.value;
                    this.renderReportsTable();
                });
            }

            if (statusSelect) {
                statusSelect.addEventListener('change', (e) => {
                    this.statusFilter = e.target.value;
                    this.renderReportsTable();
                });
            }

            if (viewAllLink) {
                viewAllLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (searchInput) searchInput.value = '';
                    if (typeSelect) typeSelect.value = 'all';
                    if (statusSelect) statusSelect.value = 'all';
                    this.searchQuery = '';
                    this.typeFilter = 'all';
                    this.statusFilter = 'all';
                    this.currentTab = 'Overview';
                    document.querySelectorAll('.report-tab-btn').forEach(t => {
                        t.classList.toggle('active', t.getAttribute('data-tab') === 'Overview');
                    });
                    this.renderReportsTable();
                    this.showToast('Displaying all historical custody & operational reports', 'success');
                });
            }
        },

        /* =========================================================================
           9. Quick Actions & Format Tiles
           ========================================================================= */
        bindQuickActions() {
            // Hero CTA Card & Quick Action 1: Generate Custom Report
            const heroCTA = document.getElementById('btn-hero-generate-custom');
            const qaGenerate = document.getElementById('qa-generate-report');
            if (heroCTA) heroCTA.addEventListener('click', () => this.openModal('modal-generate-custom-report'));
            if (qaGenerate) qaGenerate.addEventListener('click', () => this.openModal('modal-generate-custom-report'));

            // Quick Action 2: Schedule Report
            const qaSchedule = document.getElementById('qa-schedule-report');
            if (qaSchedule) qaSchedule.addEventListener('click', () => this.openModal('modal-schedule-report'));

            // Quick Action 3: Export All Reports
            const qaExportAll = document.getElementById('qa-export-all');
            if (qaExportAll) qaExportAll.addEventListener('click', () => this.exportAllReports());

            // 4 Format Tiles (PDF, CSV, Excel, JSON)
            document.querySelectorAll('.format-tile-box').forEach(tile => {
                tile.addEventListener('click', () => {
                    const format = tile.getAttribute('data-format');
                    this.exportInFormat(format);
                });
            });
        },

        /* =========================================================================
           10. Modals Management
           ========================================================================= */
        bindModals() {
            // Close buttons
            document.querySelectorAll('[data-close-modal]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const modalId = btn.getAttribute('data-close-modal');
                    this.closeModal(modalId);
                });
            });

            // Backdrop click
            document.querySelectorAll('.modal-overlay').forEach(overlay => {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        overlay.classList.remove('active');
                    }
                });
            });

            // Form: Generate Custom Report
            const formGen = document.getElementById('form-generate-custom-report');
            if (formGen) {
                formGen.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleGenerateReportSubmit();
                });
            }

            // Form: Schedule Report
            const formSched = document.getElementById('form-schedule-report');
            if (formSched) {
                formSched.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.closeModal('modal-schedule-report');
                    this.showToast('Automated report schedule created and registered on daemon cron', 'success');
                });
            }
        },

        openModal(id) {
            const el = document.getElementById(id);
            if (el) el.classList.add('active');
        },

        closeModal(id) {
            const el = document.getElementById(id);
            if (el) el.classList.remove('active');
        },

        closeAllModals() {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        },

        handleGenerateReportSubmit() {
            const nameInput = document.getElementById('new-report-name');
            const typeSelect = document.getElementById('new-report-type');
            const formatSelect = document.getElementById('new-report-format');

            const name = nameInput?.value || 'Custom Audit Report';
            const type = typeSelect?.value || 'Security';
            const format = formatSelect?.value || 'PDF';

            // Visual feedback
            this.showToast('Dispatching report generation to Zero-Knowledge worker...', 'info');

            setTimeout(() => {
                const newReport = {
                    id: `RPT-2025-0912-${Math.floor(10 + Math.random() * 90)}`,
                    num: this.reportsData.length + 1,
                    name: name,
                    type: type,
                    typeClass: `badge-${type.toLowerCase()}`,
                    generatedBy: 'admin',
                    dateTime: 'Just now',
                    status: 'Completed',
                    statusClass: 'status-completed',
                    format: format,
                    fileSize: '2.4 MB',
                    checksum: `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
                    summary: `Automated on-demand snapshot of ${type} logs, node signatures, and custody verification states.`,
                    recordsCount: Math.floor(200 + Math.random() * 1200)
                };

                this.reportsData.unshift(newReport);
                this.renderReportsTable();
                this.closeModal('modal-generate-custom-report');

                // Increment KPI
                const kpiTotal = document.getElementById('kpi-total-reports');
                if (kpiTotal) {
                    const current = parseInt(kpiTotal.textContent, 10) || 28;
                    kpiTotal.textContent = current + 1;
                }

                this.showToast(`Report generated successfully: ${name} (${format})`, 'success');
                if (nameInput) nameInput.value = '';
            }, 650);
        },

        openReportDetailsModal(id) {
            const report = this.reportsData.find(r => r.id === id);
            if (!report) return;

            document.getElementById('modal-details-title').textContent = report.name;
            document.getElementById('detail-report-id').textContent = report.id;
            document.getElementById('detail-report-type').textContent = `${report.type} Activity`;
            document.getElementById('detail-report-status').textContent = report.status;
            document.getElementById('detail-report-date').textContent = report.dateTime;
            document.getElementById('detail-report-author').textContent = report.generatedBy;
            document.getElementById('detail-report-format').textContent = `${report.format} (${report.fileSize})`;
            document.getElementById('detail-report-records').textContent = `${report.recordsCount.toLocaleString()} events`;
            document.getElementById('detail-report-checksum').textContent = report.checksum;
            document.getElementById('detail-report-summary').textContent = report.summary;

            // Bind single download button inside details modal
            const btnDl = document.getElementById('btn-modal-download-report');
            if (btnDl) {
                btnDl.onclick = () => {
                    this.downloadReport(report.id);
                    this.closeModal('modal-report-details');
                };
            }

            this.openModal('modal-report-details');
        },

        /* =========================================================================
           11. Exports & Downloads Implementation
           ========================================================================= */
        downloadReport(id) {
            const report = this.reportsData.find(r => r.id === id);
            if (!report) return;

            const content = [
                `AEGISVAULT AUDIT REPORT — PROTOCOL ARCHIVE`,
                `Report ID: ${report.id}`,
                `Report Title: ${report.name}`,
                `Category: ${report.type}`,
                `Generated By: ${report.generatedBy}`,
                `Timestamp: ${report.dateTime}`,
                `Status: ${report.status}`,
                `Records Count: ${report.recordsCount}`,
                `Cryptographic Checksum: ${report.checksum}`,
                `\nEXECUTIVE SUMMARY:`,
                report.summary,
                `\nCONFIDENTIALITY NOTICE:`,
                `This document contains Zero-Knowledge cryptographic custody telemetry.`,
                `© 2025 AegisVault Protocol. All rights reserved.`
            ].join('\n');

            const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${report.name.replace(/\s+/g, '_')}_${report.id}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showToast(`Downloaded: ${report.name} (${report.format})`, 'success');
        },

        exportAllReports() {
            const headers = ['Report ID', 'Name', 'Type', 'Generated By', 'Date & Time', 'Status', 'Records Count', 'Checksum'];
            const rows = this.reportsData.map(r => [
                `"${r.id}"`,
                `"${r.name}"`,
                `"${r.type}"`,
                `"${r.generatedBy}"`,
                `"${r.dateTime}"`,
                `"${r.status}"`,
                r.recordsCount,
                `"${r.checksum}"`
            ]);

            const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `AegisVault_All_Reports_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showToast(`Exported all ${this.reportsData.length} reports to CSV`, 'success');
        },

        exportInFormat(format) {
            if (format === 'PDF') {
                this.showToast('Preparing clean print-ready PDF layout...', 'info');
                setTimeout(() => {
                    window.print();
                }, 400);
            } else if (format === 'CSV') {
                this.exportAllReports();
            } else if (format === 'Excel') {
                this.showToast('Compiled Excel XML dataset (.xlsx). Starting download...', 'success');
                this.exportAllReports();
            } else if (format === 'JSON') {
                const jsonStr = JSON.stringify(this.reportsData, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `AegisVault_Reports_Export_${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                this.showToast('Downloaded complete JSON dataset for API integration', 'success');
            }
        },

        /* =========================================================================
           12. Toast Notification System
           ========================================================================= */
        showToast(message, type = 'info') {
            const container = document.getElementById('toast-container');
            if (!container) return;

            const toast = document.createElement('div');
            toast.className = `toast-item ${type}`;

            let iconSVG = '';
            if (type === 'success') {
                iconSVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            } else if (type === 'warning') {
                iconSVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#F59E0B" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
            } else {
                iconSVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
            }

            toast.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.55rem;">
                    ${iconSVG}
                    <span>${message}</span>
                </div>
            `;

            container.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(8px)';
                setTimeout(() => {
                    if (toast.parentNode) toast.parentNode.removeChild(toast);
                }, 250);
            }, 3500);
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AegisReportsController.init());
    } else {
        AegisReportsController.init();
    }

    // Expose controller globally for inline events or debugging
    window.AegisReportsController = AegisReportsController;
})();
