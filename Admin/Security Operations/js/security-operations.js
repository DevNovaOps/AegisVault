/**
 * AegisVault — Security Operations Controller
 * Full interactive frontend implementation matching screenshots
 * Clean, modular, and easy to explain for college viva presentation.
 */

(function () {
    'use strict';

    // State management object
    const state = {
        theme: localStorage.getItem('aegisvault_theme') || localStorage.getItem('aegis_theme') || 'dark',
        currentTab: 'overview',
        filterEventType: 'all',
        filterSeverity: 'all',
        filterSource: 'all',
        searchQuery: '',
        events: [],
        alerts: [],
        incidents: [],
        access: []
    };

    // DOM Elements cache
    const dom = {};

    // Initialization
    function init() {
        cacheDom();
        initData();
        initTheme();
        bindEvents();
        renderKPIs();
        renderTrendChart();
        renderThreatMap();
        renderPostureGauge();
        renderEventsTable();
        renderAlertsWidget();
        renderAccessTable();
        renderIncidentsTable();
        checkUrlHash();
    }

    function cacheDom() {
        dom.body = document.body;
        dom.html = document.documentElement;
        dom.themeToggleBtn = document.getElementById('btn-theme-toggle');
        dom.hamburgerBtn = document.getElementById('btn-hamburger');
        dom.sidebar = document.getElementById('app-sidebar');
        dom.sidebarBackdrop = document.getElementById('sidebar-backdrop');
        dom.globalSearch = document.getElementById('global-header-search');
        
        // Tabs
        dom.tabButtons = document.querySelectorAll('.ops-tab-btn');
        dom.tabPanels = document.querySelectorAll('.tab-panel-section');

        // Filters & Search
        dom.tableSearchInput = document.getElementById('table-search-input');
        dom.selectEventType = document.getElementById('select-event-type');
        dom.selectSeverity = document.getElementById('select-severity');
        dom.selectSource = document.getElementById('select-source');
        dom.btnFilterApply = document.getElementById('btn-filter-apply');
        dom.btnExportCSV = document.getElementById('btn-export-csv');

        // Tables & Containers
        dom.eventsTableBody = document.getElementById('events-table-body');
        dom.fullEventsTableBody = document.getElementById('full-events-table-body');
        dom.alertsWidgetList = document.getElementById('alerts-widget-list');
        dom.fullAlertsList = document.getElementById('full-alerts-list');
        dom.accessTableBody = document.getElementById('access-table-body');
        dom.incidentsTableBody = document.getElementById('incidents-table-body');
        dom.trendChartContainer = document.getElementById('trend-chart-container');
        dom.toastShelf = document.getElementById('toast-shelf');

        // Modals
        dom.modalEventDetails = document.getElementById('modal-event-details');
        dom.modalAlertDetails = document.getElementById('modal-alert-details');
        dom.modalResolveAlert = document.getElementById('modal-resolve-alert');
        dom.modalBlockIp = document.getElementById('modal-block-ip');
        dom.modalRevokeAccess = document.getElementById('modal-revoke-access');
        dom.modalThreatIntel = document.getElementById('modal-threat-intel');
        dom.modalIncidentDetails = document.getElementById('modal-incident-details');
    }

    function initData() {
        // Deep clone mock data so modifications are reactive during session
        if (window.AegisSecurityData) {
            state.events = JSON.parse(JSON.stringify(window.AegisSecurityData.securityEvents));
            state.alerts = JSON.parse(JSON.stringify(window.AegisSecurityData.activeAlerts));
            state.incidents = JSON.parse(JSON.stringify(window.AegisSecurityData.incidents));
            state.access = JSON.parse(JSON.stringify(window.AegisSecurityData.accessActivity));
        }
    }

    /* --------------------------------------------------------------
       THEME MANAGEMENT (Dual light/dark synchronization)
       -------------------------------------------------------------- */
    function initTheme() {
        applyTheme(state.theme);
    }

    function applyTheme(theme) {
        state.theme = theme;
        localStorage.setItem('aegisvault_theme', theme);
        localStorage.setItem('aegis_theme', theme);

        if (theme === 'light') {
            dom.body.classList.remove('dark-theme');
            dom.body.classList.add('light-theme');
            dom.html.setAttribute('data-theme', 'light');
        } else {
            dom.body.classList.remove('light-theme');
            dom.body.classList.add('dark-theme');
            dom.html.setAttribute('data-theme', 'dark');
        }

        // Re-render SVG chart with updated theme colors
        renderTrendChart();
    }

    function toggleTheme() {
        const nextTheme = state.theme === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme);
        showToast(`Switched to ${nextTheme === 'light' ? 'Light' : 'Dark'} Theme`, 'info');
    }

    /* --------------------------------------------------------------
       EVENT BINDINGS
       -------------------------------------------------------------- */
    function bindEvents() {
        // Theme button
        if (dom.themeToggleBtn) {
            dom.themeToggleBtn.addEventListener('click', toggleTheme);
        }

        // Mobile Hamburger
        if (dom.hamburgerBtn) {
            dom.hamburgerBtn.addEventListener('click', () => {
                dom.sidebar.classList.toggle('mobile-open');
                dom.sidebarBackdrop.classList.toggle('active');
            });
        }
        if (dom.sidebarBackdrop) {
            dom.sidebarBackdrop.addEventListener('click', () => {
                dom.sidebar.classList.remove('mobile-open');
                dom.sidebarBackdrop.classList.remove('active');
            });
        }

        // Tabs
        dom.tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = btn.getAttribute('data-tab');
                switchTab(targetTab);
            });
        });

        // Filter / Search interactions
        if (dom.tableSearchInput) {
            dom.tableSearchInput.addEventListener('input', (e) => {
                state.searchQuery = e.target.value.toLowerCase().trim();
                renderEventsTable();
            });
        }
        if (dom.selectEventType) {
            dom.selectEventType.addEventListener('change', (e) => {
                state.filterEventType = e.target.value;
                renderEventsTable();
            });
        }
        if (dom.selectSeverity) {
            dom.selectSeverity.addEventListener('change', (e) => {
                state.filterSeverity = e.target.value;
                renderEventsTable();
            });
        }
        if (dom.selectSource) {
            dom.selectSource.addEventListener('change', (e) => {
                state.filterSource = e.target.value;
                renderEventsTable();
            });
        }
        if (dom.btnFilterApply) {
            dom.btnFilterApply.addEventListener('click', () => {
                renderEventsTable();
                showToast('Applied active security filters', 'info');
            });
        }
        if (dom.btnExportCSV) {
            dom.btnExportCSV.addEventListener('click', exportEventsCSV);
        }

        // Global keyboard shortcut '/' for search
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== dom.globalSearch && document.activeElement !== dom.tableSearchInput) {
                e.preventDefault();
                if (dom.tableSearchInput) dom.tableSearchInput.focus();
            } else if (e.key === 'Escape') {
                closeAllModals();
            }
        });
    }

    function checkUrlHash() {
        const hash = window.location.hash.replace('#', '');
        if (['overview', 'alerts', 'events', 'access', 'incidents'].includes(hash)) {
            switchTab(hash);
        }
    }

    function switchTab(tabId) {
        state.currentTab = tabId;
        window.location.hash = tabId;

        dom.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });

        dom.tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `tab-panel-${tabId}`);
        });

        // If switching to full views, ensure their respective tables render
        if (tabId === 'events') renderFullEventsTable();
        if (tabId === 'alerts') renderFullAlertsList();
    }

    /* --------------------------------------------------------------
       KPI METRIC RENDERING
       -------------------------------------------------------------- */
    function renderKPIs() {
        if (!window.AegisSecurityData) return;
        const kpis = window.AegisSecurityData.kpis;

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setVal('kpi-events-val', kpis.securityEvents.displayValue);
        setVal('kpi-alerts-val', kpis.criticalAlerts.displayValue);
        setVal('kpi-threats-val', kpis.activeThreats.displayValue);
        setVal('kpi-blocked-val', kpis.blockedAttempts.displayValue);

        // Update alert counter badge on tabs
        const activeCount = state.alerts.filter(a => a.status === 'Active').length;
        const alertBadge = document.getElementById('tab-alerts-count');
        if (alertBadge) alertBadge.textContent = activeCount;
    }

    /* --------------------------------------------------------------
       CHART 1: SECURITY EVENT TRENDS (Pure Interactive SVG)
       -------------------------------------------------------------- */
    function renderTrendChart() {
        const wrap = document.getElementById('trend-chart-svg-wrap');
        if (!wrap || !window.AegisSecurityData) return;

        const trends = window.AegisSecurityData.trends;
        const width = wrap.clientWidth || 380;
        const height = 150;
        const padding = { top: 15, right: 15, bottom: 25, left: 32 };

        const graphW = width - padding.left - padding.right;
        const graphH = height - padding.top - padding.bottom;

        const maxVal = 200; // Axis cap
        const stepX = graphW / (trends.labels.length - 1);

        const getY = (val) => padding.top + graphH - (val / maxVal) * graphH;
        const getX = (idx) => padding.left + idx * stepX;

        // Colors
        const isDark = state.theme === 'dark';
        const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
        const labelColor = isDark ? '#64748B' : '#94A3B8';

        let svgHtml = `<svg class="svg-line-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">`;

        // 1. Horizontal Grid Lines and Y-Axis labels (0, 50, 100, 150, 200)
        [0, 50, 100, 150, 200].forEach(val => {
            const y = getY(val);
            svgHtml += `
                <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="${gridColor}" stroke-width="1" />
                <text x="${padding.left - 8}" y="${y + 4}" fill="${labelColor}" font-size="10" font-family="var(--font-main)" text-anchor="end">${val}</text>
            `;
        });

        // 2. X-Axis Labels (6 Sep - 12 Sep)
        trends.labels.forEach((lbl, idx) => {
            const x = getX(idx);
            svgHtml += `
                <text x="${x}" y="${height - 4}" fill="${labelColor}" font-size="10" font-family="var(--font-main)" text-anchor="middle">${lbl}</text>
            `;
        });

        // 3. Render Series (Line 2: Suspicious Activity [Blue], Line 1: Failed Login [Red])
        trends.series.forEach((s) => {
            const points = s.data.map((val, idx) => ({ x: getX(idx), y: getY(val), val, date: trends.labels[idx] }));
            
            // Build Smooth Curved SVG Path
            let pathD = `M ${points[0].x} ${points[0].y}`;
            for (let i = 0; i < points.length - 1; i++) {
                const p0 = points[i];
                const p1 = points[i + 1];
                const midX = (p0.x + p1.x) / 2;
                pathD += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
            }

            // Area Gradient Underneath
            let areaD = `${pathD} L ${points[points.length - 1].x} ${getY(0)} L ${points[0].x} ${getY(0)} Z`;
            svgHtml += `<path d="${areaD}" fill="${s.fillColor}" />`;

            // Stroke line
            svgHtml += `<path d="${pathD}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linecap="round" />`;

            // Interactive Circle Dots
            points.forEach(pt => {
                svgHtml += `
                    <circle cx="${pt.x}" cy="${pt.y}" r="4" fill="${s.color}" stroke="#FFFFFF" stroke-width="1.5"
                            class="chart-point-marker"
                            data-date="${pt.date}" data-series="${s.name}" data-val="${pt.val}"
                            style="cursor: pointer; transition: transform 0.2s ease;">
                    </circle>
                `;
            });
        });

        svgHtml += `</svg>`;
        wrap.innerHTML = svgHtml;

        // Bind tooltip on hover over circle points
        const points = wrap.querySelectorAll('.chart-point-marker');
        const tooltip = document.getElementById('chart-tooltip-bubble');
        points.forEach(dot => {
            dot.addEventListener('mouseenter', (e) => {
                const date = dot.getAttribute('data-date');
                const series = dot.getAttribute('data-series');
                const val = dot.getAttribute('data-val');
                if (tooltip) {
                    tooltip.innerHTML = `<strong>${date}</strong><br>${series}: <strong>${val}</strong>`;
                    tooltip.style.left = `${e.clientX + 10}px`;
                    tooltip.style.top = `${e.clientY - 20}px`;
                    tooltip.style.opacity = '1';
                }
            });
            dot.addEventListener('mouseleave', () => {
                if (tooltip) tooltip.style.opacity = '0';
            });
        });
    }

    /* --------------------------------------------------------------
       CHART 2: THREAT SOURCES WORLD MAP (Vector SVG + Hotspots)
       -------------------------------------------------------------- */
    function renderThreatMap() {
        const wrap = document.getElementById('world-map-svg-wrap');
        const listWrap = document.getElementById('threat-country-list-wrap');
        if (!wrap || !window.AegisSecurityData) return;

        const threatData = window.AegisSecurityData.threatSources;

        // Render percentage list
        if (listWrap) {
            listWrap.innerHTML = threatData.breakdown.map(item => `
                <div class="threat-list-row">
                    <span class="threat-country-name">${item.country}</span>
                    <span class="threat-country-percent">${item.percentage}%</span>
                </div>
            `).join('');
        }

        // Render SVG Map silhouette with pulsing coordinates
        let svg = `
        <svg class="world-map-svg" viewBox="0 0 1000 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g class="map-landmass">
                <!-- North America -->
                <path d="M120 70 Q 200 40, 320 80 Q 290 140, 240 180 Q 180 230, 210 260 Q 160 220, 110 160 Z" />
                <!-- South America -->
                <path d="M260 280 Q 340 320, 300 420 Q 260 480, 240 450 Q 230 360, 260 280 Z" />
                <!-- Europe -->
                <path d="M470 80 Q 560 60, 580 130 Q 520 180, 480 150 Q 450 120, 470 80 Z" />
                <!-- Africa -->
                <path d="M470 190 Q 560 190, 580 280 Q 540 380, 490 380 Q 450 290, 470 190 Z" />
                <!-- Asia -->
                <path d="M590 70 Q 860 60, 890 200 Q 780 290, 680 250 Q 610 180, 590 70 Z" />
                <!-- Australia -->
                <path d="M780 340 Q 890 320, 880 410 Q 820 440, 770 400 Z" />
            </g>
            <!-- Hotspot markers -->
            ${threatData.hotspots.map(h => `
                <g class="threat-pulse-pin" data-name="${h.name}" data-count="${h.count}">
                    <circle cx="${h.x}" cy="${h.y}" r="${h.r * 2.2}" fill="${h.color}" opacity="0.25">
                        <animate attributeName="r" values="${h.r * 1.5};${h.r * 3};${h.r * 1.5}" dur="3s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.4;0.05;0.4" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="${h.x}" cy="${h.y}" r="${h.r}" fill="${h.color}" stroke="#FFFFFF" stroke-width="1.5" />
                </g>
            `).join('')}
        </svg>`;

        wrap.innerHTML = svg;

        // Tooltip for hotspots
        const pins = wrap.querySelectorAll('.threat-pulse-pin');
        pins.forEach(pin => {
            pin.addEventListener('click', () => {
                const name = pin.getAttribute('data-name');
                const count = pin.getAttribute('data-count');
                showToast(`Threat Origin: ${name} (${count} events blocked)`, 'warning');
            });
        });
    }

    /* --------------------------------------------------------------
       CHART 3: SECURITY POSTURE DONUT GAUGE
       -------------------------------------------------------------- */
    function renderPostureGauge() {
        const svgWrap = document.getElementById('posture-donut-svg');
        const listWrap = document.getElementById('posture-breakdown-list');
        if (!svgWrap || !window.AegisSecurityData) return;

        const posture = window.AegisSecurityData.posture;
        const radius = 48;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (posture.overallScore / posture.maxScore) * circumference;

        const isDark = state.theme === 'dark';
        const trackColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

        svgWrap.innerHTML = `
            <svg class="posture-svg" viewBox="0 0 120 120">
                <!-- Background track -->
                <circle cx="60" cy="60" r="${radius}" fill="none" stroke="${trackColor}" stroke-width="11" />
                <!-- Progress Arc (Green / Emerald) -->
                <circle cx="60" cy="60" r="${radius}" fill="none" stroke="#10B981" stroke-width="11"
                        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
                        stroke-linecap="round" />
            </svg>
        `;

        // Render breakdown legend items
        if (listWrap) {
            listWrap.innerHTML = posture.categories.map(item => `
                <div class="posture-item-row">
                    <div class="posture-label-group">
                        <span class="posture-dot" style="background-color: ${item.color};"></span>
                        <span>${item.name}</span>
                    </div>
                    <span class="posture-score-num">${item.score}</span>
                </div>
            `).join('');
        }
    }

    /* --------------------------------------------------------------
       TABLE 1: RECENT SECURITY EVENTS (Screenshot Layout)
       -------------------------------------------------------------- */
    function getFilteredEvents() {
        return state.events.filter(evt => {
            // Event Type Filter
            if (state.filterEventType !== 'all' && evt.eventType.toLowerCase() !== state.filterEventType.toLowerCase()) {
                return false;
            }
            // Severity Filter
            if (state.filterSeverity !== 'all' && evt.severity.toLowerCase() !== state.filterSeverity.toLowerCase()) {
                return false;
            }
            // Source / Resource Filter
            if (state.filterSource !== 'all' && evt.resource.toLowerCase() !== state.filterSource.toLowerCase()) {
                return false;
            }
            // Search Query
            if (state.searchQuery) {
                const combined = `${evt.timestamp} ${evt.eventType} ${evt.userOrIp} ${evt.resource} ${evt.severity} ${evt.status} ${evt.details}`.toLowerCase();
                if (!combined.includes(state.searchQuery)) return false;
            }
            return true;
        });
    }

    function renderEventsTable() {
        if (!dom.eventsTableBody) return;
        const filtered = getFilteredEvents();

        // Limit to top 8 rows on the overview tab matching screenshot
        const displayRows = filtered.slice(0, 8);

        if (displayRows.length === 0) {
            dom.eventsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">
                        No security events match the selected filters.
                    </td>
                </tr>
            `;
            return;
        }

        dom.eventsTableBody.innerHTML = displayRows.map(row => `
            <tr>
                <td class="mono-cell">${row.timestamp}</td>
                <td style="font-weight: 600;">${row.eventType}</td>
                <td>
                    <div class="table-user-cell">
                        <span class="country-flag-icon">${row.flag}</span>
                        <span class="mono-cell">${row.userDisplay}</span>
                    </div>
                </td>
                <td class="mono-cell" style="color: var(--text-secondary);">${row.resource}</td>
                <td>
                    <span class="badge-pill ${getSeverityClass(row.severity)}">${row.severity}</span>
                </td>
                <td>
                    <span class="status-pill ${getStatusClass(row.status)}">${row.status}</span>
                </td>
                <td style="text-align: right; position: relative;">
                    <div class="action-menu-container">
                        <button class="btn-row-action" title="Actions for ${row.id}" onclick="event.stopPropagation(); AegisSecurityModule.toggleRowMenu(this, '${row.id}')">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <circle cx="5" cy="12" r="2"></circle>
                                <circle cx="12" cy="12" r="2"></circle>
                                <circle cx="19" cy="12" r="2"></circle>
                            </svg>
                        </button>
                        <div class="row-dropdown-menu" id="menu-${row.id}">
                            <button class="row-dropdown-item" onclick="AegisSecurityModule.openEventDetails('${row.id}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                <span>View Details</span>
                            </button>
                            <button class="row-dropdown-item danger" onclick="AegisSecurityModule.openBlockIpModal('${row.userOrIp}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                                <span>Block IP</span>
                            </button>
                            <button class="row-dropdown-item" onclick="AegisSecurityModule.quickInvestigate('${row.id}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                <span>Investigate</span>
                            </button>
                            <button class="row-dropdown-item" onclick="AegisSecurityModule.copyEventId('${row.id}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                <span>Copy Event ID</span>
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function renderFullEventsTable() {
        if (!dom.fullEventsTableBody) return;
        const filtered = getFilteredEvents();

        dom.fullEventsTableBody.innerHTML = filtered.map(row => `
            <tr>
                <td class="mono-cell"><strong>${row.id}</strong></td>
                <td class="mono-cell">${row.timestamp}</td>
                <td style="font-weight: 600;">${row.eventType}</td>
                <td>
                    <div class="table-user-cell">
                        <span class="country-flag-icon">${row.flag}</span>
                        <span class="mono-cell">${row.userDisplay}</span>
                    </div>
                </td>
                <td class="mono-cell">${row.resource}</td>
                <td>
                    <span class="badge-pill ${getSeverityClass(row.severity)}">${row.severity}</span>
                </td>
                <td>
                    <span class="status-pill ${getStatusClass(row.status)}">${row.status}</span>
                </td>
                <td style="text-align: right; position: relative;">
                    <div class="action-menu-container">
                        <button class="btn-row-action" title="Actions for ${row.id}" onclick="event.stopPropagation(); AegisSecurityModule.toggleRowMenu(this, '${row.id}')">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <circle cx="5" cy="12" r="2"></circle>
                                <circle cx="12" cy="12" r="2"></circle>
                                <circle cx="19" cy="12" r="2"></circle>
                            </svg>
                        </button>
                        <div class="row-dropdown-menu" id="full-menu-${row.id}">
                            <button class="row-dropdown-item" onclick="AegisSecurityModule.openEventDetails('${row.id}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                <span>View Details</span>
                            </button>
                            <button class="row-dropdown-item danger" onclick="AegisSecurityModule.openBlockIpModal('${row.userOrIp}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                                <span>Block IP</span>
                            </button>
                            <button class="row-dropdown-item" onclick="AegisSecurityModule.quickInvestigate('${row.id}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                <span>Investigate</span>
                            </button>
                            <button class="row-dropdown-item" onclick="AegisSecurityModule.copyEventId('${row.id}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                <span>Copy Event ID</span>
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function getSeverityClass(sev) {
        switch (sev.toLowerCase()) {
            case 'high': return 'badge-high';
            case 'medium': return 'badge-medium';
            case 'low': return 'badge-low';
            case 'critical': return 'badge-critical';
            default: return 'badge-low';
        }
    }

    function getStatusClass(st) {
        switch (st.toLowerCase()) {
            case 'blocked': return 'status-blocked';
            case 'investigating': return 'status-investigating';
            case 'allowed': return 'status-allowed';
            case 'completed': return 'status-completed';
            default: return '';
        }
    }

    /* --------------------------------------------------------------
       WIDGET 4: ACTIVE ALERTS (Screenshot Layout + Actions)
       -------------------------------------------------------------- */
    function renderAlertsWidget() {
        if (!dom.alertsWidgetList) return;

        const activeAlerts = state.alerts.filter(a => a.status === 'Active').slice(0, 4);

        if (activeAlerts.length === 0) {
            dom.alertsWidgetList.innerHTML = `
                <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.85rem;">
                    All security alerts have been acknowledged or resolved.
                </div>
            `;
            return;
        }

        dom.alertsWidgetList.innerHTML = activeAlerts.map(alert => `
            <div class="alert-item-row" onclick="AegisSecurityModule.openAlertDetails('${alert.id}')">
                <div class="alert-left-desc">
                    <span class="alert-status-dot ${alert.severity.toLowerCase() === 'high' ? 'dot-high' : 'dot-medium'}"></span>
                    <div class="alert-text-block">
                        <span class="alert-title">${alert.title}</span>
                        <span class="alert-time">${alert.timestamp}</span>
                    </div>
                </div>
                <span class="badge-pill ${getSeverityClass(alert.severity)}">${alert.severity}</span>
            </div>
        `).join('');
    }

    function renderFullAlertsList() {
        if (!dom.fullAlertsList) return;

        dom.fullAlertsList.innerHTML = state.alerts.map(alert => `
            <div class="kpi-card" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; cursor: pointer;" onclick="AegisSecurityModule.openAlertDetails('${alert.id}')">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <span class="alert-status-dot ${alert.severity.toLowerCase() === 'high' ? 'dot-high' : 'dot-medium'}" style="width: 12px; height: 12px;"></span>
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <strong style="font-size: 1rem; color: var(--text-primary);">${alert.title}</strong>
                            <span class="badge-pill ${getSeverityClass(alert.severity)}">${alert.severity}</span>
                            <span class="mono-cell" style="font-size: 0.76rem; color: var(--text-muted);">${alert.id}</span>
                        </div>
                        <p style="font-size: 0.84rem; color: var(--text-secondary); margin-top: 4px;">${alert.description}</p>
                        <div style="display: flex; gap: 16px; font-size: 0.76rem; color: var(--text-muted); margin-top: 6px;">
                            <span>Resource: <strong>${alert.affectedResource}</strong></span>
                            <span>Target: <strong>${alert.affectedUser}</strong></span>
                            <span>Detected: <strong>${alert.timestamp}</strong></span>
                            <span>Status: <strong style="color: ${alert.status === 'Active' ? '#EF4444' : '#10B981'};">${alert.status}</strong></span>
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 8px;" onclick="event.stopPropagation();">
                    ${alert.status === 'Active' ? `
                        <button class="btn-modal-cancel" style="padding: 6px 12px; font-size: 0.8rem;" onclick="AegisSecurityModule.acknowledgeAlert('${alert.id}')">Acknowledge</button>
                        <button class="btn-modal-primary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="AegisSecurityModule.promptResolveAlert('${alert.id}')">Resolve</button>
                    ` : `
                        <span class="badge-pill badge-low">${alert.status}</span>
                    `}
                </div>
            </div>
        `).join('');
    }

    /* --------------------------------------------------------------
       TABLE 3: ACCESS ACTIVITY
       -------------------------------------------------------------- */
    function renderAccessTable() {
        if (!dom.accessTableBody) return;

        dom.accessTableBody.innerHTML = state.access.map(acc => `
            <tr>
                <td class="mono-cell"><strong>${acc.id}</strong></td>
                <td><strong>${acc.user}</strong></td>
                <td><span class="badge-pill badge-low">${acc.role}</span></td>
                <td>${acc.action}</td>
                <td class="mono-cell">${acc.resource}</td>
                <td class="mono-cell">${acc.ip}</td>
                <td style="color: var(--text-secondary);">${acc.device}</td>
                <td class="mono-cell">${acc.timestamp}</td>
                <td>
                    <span class="status-pill ${acc.result === 'Success' ? 'status-allowed' : (acc.result === 'Blocked' ? 'status-blocked' : 'status-investigating')}">
                        ${acc.result}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    /* --------------------------------------------------------------
       TABLE 4: INCIDENTS
       -------------------------------------------------------------- */
    function renderIncidentsTable() {
        if (!dom.incidentsTableBody) return;

        dom.incidentsTableBody.innerHTML = state.incidents.map(inc => `
            <tr>
                <td class="mono-cell"><strong>${inc.id}</strong></td>
                <td style="font-weight: 600;">${inc.title}</td>
                <td><span class="badge-pill ${getSeverityClass(inc.severity)}">${inc.severity}</span></td>
                <td style="color: var(--text-secondary);">${inc.affectedArea}</td>
                <td class="mono-cell">${inc.created}</td>
                <td><strong>${inc.assignedTo}</strong></td>
                <td>
                    <span class="badge-pill ${inc.status === 'Resolved' ? 'badge-low' : 'badge-medium'}">${inc.status}</span>
                </td>
                <td style="text-align: right;">
                    <button class="btn-modal-cancel" style="padding: 4px 10px; font-size: 0.78rem;" onclick="AegisSecurityModule.openIncidentDetails('${inc.id}')">
                        Timeline & Actions
                    </button>
                </td>
            </tr>
        `).join('');
    }

    /* --------------------------------------------------------------
       EXPORT CSV FUNCTIONALITY
       -------------------------------------------------------------- */
    function exportEventsCSV() {
        const filtered = getFilteredEvents();
        if (filtered.length === 0) {
            showToast('No events available to export with current filters', 'warning');
            return;
        }

        const headers = ["Event ID", "Timestamp", "Event Type", "User/IP", "Country", "Resource", "Severity", "Status", "Details"];
        const rows = filtered.map(e => [
            `"${e.id}"`,
            `"${e.timestamp}"`,
            `"${e.eventType}"`,
            `"${e.userOrIp}"`,
            `"${e.country || ''}"`,
            `"${e.resource}"`,
            `"${e.severity}"`,
            `"${e.status}"`,
            `"${(e.details || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `aegisvault_security_events_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast(`Exported ${filtered.length} security events as CSV`, 'success');
    }

    /* --------------------------------------------------------------
       ALERT WORKFLOW: ACKNOWLEDGE & RESOLVE
       -------------------------------------------------------------- */
    function acknowledgeAlert(alertId) {
        const alert = state.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.status = 'Acknowledged';
            renderKPIs();
            renderAlertsWidget();
            renderFullAlertsList();
            closeAllModals();
            showToast(`Alert ${alertId} marked as Acknowledged`, 'success');
        }
    }

    let pendingResolveAlertId = null;

    function promptResolveAlert(alertId) {
        pendingResolveAlertId = alertId;
        closeAllModals();
        const alert = state.alerts.find(a => a.id === alertId);
        if (alert && dom.modalResolveAlert) {
            document.getElementById('resolve-alert-title').textContent = `Resolve Alert ${alertId}`;
            document.getElementById('resolve-alert-desc').textContent = alert.title;
            dom.modalResolveAlert.classList.add('active');
        }
    }

    function confirmResolveAlert() {
        if (!pendingResolveAlertId) return;
        const alert = state.alerts.find(a => a.id === pendingResolveAlertId);
        const notes = document.getElementById('resolve-notes-input').value.trim();

        if (alert) {
            alert.status = 'Resolved';
            alert.resolutionNotes = notes || 'Reviewed and resolved by administrator.';
            renderKPIs();
            renderAlertsWidget();
            renderFullAlertsList();
            closeAllModals();
            showToast(`Alert ${pendingResolveAlertId} successfully resolved!`, 'success');
        }
        pendingResolveAlertId = null;
    }

    /* --------------------------------------------------------------
       MODAL CONTROLLERS & DETAIL VIEWERS
       -------------------------------------------------------------- */
    function openEventDetails(eventId) {
        closeAllMenus();
        closeAllModals();
        const evt = state.events.find(e => e.id === eventId);
        const modal = document.getElementById('modal-event-details');
        if (!evt || !modal) return;

        const setTxt = (id, txt) => {
            const el = document.getElementById(id);
            if (el) el.textContent = txt;
        };
        const setHtml = (id, html) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = html;
        };

        setTxt('modal-evt-id', evt.id);
        setTxt('modal-evt-type', evt.eventType);
        setTxt('modal-evt-time', evt.timestamp);
        setTxt('modal-evt-user', `${evt.flag} ${evt.userOrIp}`);
        setTxt('modal-evt-resource', evt.resource);
        setHtml('modal-evt-severity', `<span class="badge-pill ${getSeverityClass(evt.severity)}">${evt.severity}</span>`);
        setHtml('modal-evt-status', `<span class="status-pill ${getStatusClass(evt.status)}">${evt.status}</span>`);
        setTxt('modal-evt-details', evt.details);

        // Quick action button bindings
        const btnBlock = document.getElementById('btn-modal-block-ip');
        if (btnBlock) {
            btnBlock.onclick = () => {
                closeAllModals();
                openBlockIpModal(evt.userOrIp);
            };
        }

        modal.classList.add('active');
    }

    function openAlertDetails(alertId) {
        const alert = state.alerts.find(a => a.id === alertId);
        if (!alert || !dom.modalAlertDetails) return;

        document.getElementById('modal-alt-id').textContent = alert.id;
        document.getElementById('modal-alt-title').textContent = alert.title;
        document.getElementById('modal-alt-time').textContent = alert.timestamp;
        document.getElementById('modal-alt-category').textContent = alert.category;
        document.getElementById('modal-alt-resource').textContent = alert.affectedResource;
        document.getElementById('modal-alt-user').textContent = alert.affectedUser;
        document.getElementById('modal-alt-vault').textContent = alert.affectedVault;
        document.getElementById('modal-alt-severity').innerHTML = `<span class="badge-pill ${getSeverityClass(alert.severity)}">${alert.severity}</span>`;
        document.getElementById('modal-alt-status').textContent = alert.status;
        document.getElementById('modal-alt-desc').textContent = alert.description;

        const btnAck = document.getElementById('btn-modal-ack-alert');
        const btnRes = document.getElementById('btn-modal-res-alert');

        if (btnAck) {
            btnAck.style.display = alert.status === 'Active' ? 'inline-block' : 'none';
            btnAck.onclick = () => acknowledgeAlert(alert.id);
        }
        if (btnRes) {
            btnRes.style.display = alert.status === 'Active' ? 'inline-block' : 'none';
            btnRes.onclick = () => promptResolveAlert(alert.id);
        }

        dom.modalAlertDetails.classList.add('active');
    }

    function openIncidentDetails(incidentId) {
        const inc = state.incidents.find(i => i.id === incidentId);
        if (!inc || !dom.modalIncidentDetails) return;

        document.getElementById('modal-inc-id').textContent = inc.id;
        document.getElementById('modal-inc-title').textContent = inc.title;
        document.getElementById('modal-inc-severity').innerHTML = `<span class="badge-pill ${getSeverityClass(inc.severity)}">${inc.severity}</span>`;
        document.getElementById('modal-inc-area').textContent = inc.affectedArea;
        document.getElementById('modal-inc-assigned').textContent = inc.assignedTo;
        document.getElementById('modal-inc-desc').textContent = inc.description;

        const timelineWrap = document.getElementById('modal-inc-timeline');
        if (timelineWrap) {
            timelineWrap.innerHTML = inc.timeline.map(t => `
                <div class="timeline-step-row">
                    <span class="timeline-bullet"></span>
                    <span class="timeline-time-badge">${t.time}</span>
                    <p class="timeline-note-text">${t.note}</p>
                </div>
            `).join('');
        }

        dom.modalIncidentDetails.classList.add('active');
    }

    function openBlockIpModal(defaultIp = '192.168.1.45') {
        if (!dom.modalBlockIp) return;
        const input = document.getElementById('block-ip-input');
        if (input) input.value = defaultIp;
        dom.modalBlockIp.classList.add('active');
    }

    function confirmBlockIp() {
        const ip = document.getElementById('block-ip-input').value.trim();
        const reason = document.getElementById('block-ip-reason').value.trim();
        if (!ip) {
            showToast('Please specify an IP address to block', 'warning');
            return;
        }
        closeAllModals();
        showToast(`IP Address ${ip} blocked in perimeter firewall rules`, 'success');
    }

    function openRevokeAccessModal() {
        if (dom.modalRevokeAccess) dom.modalRevokeAccess.classList.add('active');
    }

    function confirmRevokeAccess() {
        const target = document.getElementById('revoke-target-select').value;
        closeAllModals();
        showToast(`Revoked active security credentials for ${target}`, 'success');
    }

    function openThreatIntelModal() {
        if (dom.modalThreatIntel) dom.modalThreatIntel.classList.add('active');
    }

    function closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }

    /* --------------------------------------------------------------
       REFRESH & TOAST SYSTEM
       -------------------------------------------------------------- */
    function refreshTelemetry() {
        const timeBadge = document.getElementById('status-last-checked');
        if (timeBadge) timeBadge.textContent = 'Just now';
        
        // Slightly wiggle chart data to simulate real-time live telemetry
        if (window.AegisSecurityData) {
            renderTrendChart();
        }
        showToast('Telemetry refreshed with latest security state', 'info');
    }

    function showToast(message, type = 'info') {
        if (!dom.toastShelf) return;

        const iconSvg = {
            success: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
            warning: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
            danger: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
            info: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
        }[type] || '';

        const toast = document.createElement('div');
        toast.className = `toast-pill toast-${type}`;
        toast.innerHTML = `${iconSvg} <span>${message}</span>`;

        dom.toastShelf.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3600);
    }

    /* --------------------------------------------------------------
       ROW ACTION CONTEXT MENU & QUICK CONTROLS
       -------------------------------------------------------------- */
    function toggleRowMenu(buttonEl, eventId) {
        // Close other open menus
        document.querySelectorAll('.row-dropdown-menu').forEach(m => {
            if (m.id !== `menu-${eventId}` && m.id !== `full-menu-${eventId}`) {
                m.classList.remove('active');
            }
        });
        const menu = document.getElementById(`menu-${eventId}`) || document.getElementById(`full-menu-${eventId}`);
        if (menu) {
            menu.classList.toggle('active');
        }
    }

    function quickInvestigate(eventId) {
        closeAllMenus();
        openEventDetails(eventId);
        showToast(`Opening investigative telemetry drill-down for ${eventId}`, 'info');
    }

    function copyEventId(eventId) {
        closeAllMenus();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(eventId).then(() => {
                showToast(`Copied ${eventId} to clipboard`, 'success');
            }).catch(() => {
                showToast(`Event ID: ${eventId}`, 'info');
            });
        } else {
            showToast(`Event ID: ${eventId}`, 'info');
        }
    }

    function closeAllMenus() {
        document.querySelectorAll('.row-dropdown-menu').forEach(m => m.classList.remove('active'));
    }

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.action-menu-container')) {
            closeAllMenus();
        }
    });

    // Export public module API for inline HTML attributes
    window.AegisSecurityModule = {
        switchTab,
        toggleTheme,
        openEventDetails,
        openAlertDetails,
        acknowledgeAlert,
        promptResolveAlert,
        confirmResolveAlert,
        openIncidentDetails,
        openBlockIpModal,
        confirmBlockIp,
        openRevokeAccessModal,
        confirmRevokeAccess,
        openThreatIntelModal,
        closeAllModals,
        refreshTelemetry,
        showToast,
        toggleRowMenu,
        quickInvestigate,
        copyEventId,
        closeAllMenus
    };

    // Auto boot on DOM load
    document.addEventListener('DOMContentLoaded', init);

})();
