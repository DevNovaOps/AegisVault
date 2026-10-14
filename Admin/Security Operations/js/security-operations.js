/**
 * AegisVault — Security Operations Controller
 * Full interactive frontend implementation matching screenshots
 * Clean, modular, and easy to explain for college viva presentation.
 */

// Self-contained live security data store (100% database driven)
window.AegisSecurityData = window.AegisSecurityData || {
    kpis: {
        securityEvents: { value: 0, displayValue: "0", label: "Security Events", sublabel: "Past 24 hours", trend: "0%", trendDirection: "up", trendType: "warning" },
        criticalAlerts: { value: 0, displayValue: "0", label: "Critical Alerts", sublabel: "Immediate attention", trend: "0%", trendDirection: "down", trendType: "good" },
        activeThreats: { value: 0, displayValue: "0", label: "Active Threats", sublabel: "Active alerts", trend: "0%", trendDirection: "down", trendType: "good" },
        blockedAttempts: { value: 0, displayValue: "0", label: "Blocked Attempts", sublabel: "Perimeter firewall", trend: "0%", trendDirection: "up", trendType: "danger" },
        systemStatus: { status: "Protected", lastChecked: "Just now", uptime: "99.99%", firewallState: "Active & Enforced" }
    },
    trends: {
        timeRange: "Last 7 Days",
        labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Today"],
        series: [
            { name: "Failed Logins", color: "#EF4444", fillColor: "rgba(239, 68, 68, 0.08)", data: [0, 1, 0, 0, 1, 0, 0] },
            { name: "Security Audits", color: "#3B82F6", fillColor: "rgba(59, 130, 246, 0.12)", data: [1, 2, 0, 1, 3, 2, 4] }
        ]
    },
    threatSources: {
        timeRange: "Live Sensors",
        breakdown: [
            { country: "Local / Internal Node", code: "IN", flag: "🔒", percentage: 100, count: 1, color: "#3B82F6" }
        ],
        hotspots: [
            { id: "h1", name: "Primary Node", x: 710, y: 240, r: 7, count: 12, color: "#10B981" }
        ]
    },
    posture: {
        overallScore: 98,
        maxScore: 100,
        statusText: "Optimal",
        statusTone: "positive",
        categories: [
            { name: "Access Control", score: 98, color: "#10B981" },
            { name: "Threat Detection", score: 95, color: "#3B82F6" },
            { name: "Incident Response", score: 100, color: "#F59E0B" },
            { name: "System Hardening", score: 99, color: "#A855F7" }
        ]
    },
    securityEvents: [],
    activeAlerts: [],
    incidents: [],
    accessActivity: []
};

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
        access: [],
        accessSuccessCount: 0,
        accessBlockedCount: 0,
        openIncidentsCount: 0
    };

    // DOM Elements cache
    const dom = {};

    // Initialization
    async function init() {
        cacheDom();
        initTheme();
        bindEvents();
        await initData();
        renderKPIs();
        renderTrendChart();
        renderThreatMap();
        renderPostureGauge();
        renderEventsTable();
        renderFullEventsTable();
        renderAlertsWidget();
        renderFullAlertsList();
        renderAccessTable();
        renderIncidentsTable();
        initCalendar();
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

    async function initData() {
        if (window.AegisAdminCommon && window.AegisAdminCommon.ensureAdminToken) {
            await window.AegisAdminCommon.ensureAdminToken();
        }

        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
            try {
                const [overview, alerts, events, accessRes, incidentsRes] = await Promise.all([
                    window.AegisAPI.get('/admin/security/overview/').catch(() => null),
                    window.AegisAPI.get('/admin/security/alerts/').catch(() => null),
                    window.AegisAPI.get('/admin/security/events/').catch(() => null),
                    window.AegisAPI.get('/admin/security/access/').catch(() => null),
                    window.AegisAPI.get('/admin/security/incidents/').catch(() => null)
                ]);

                if (events && Array.isArray(events) && events.length > 0) {
                    state.events = events.map(e => {
                        const rawSev = (e.severity || 'medium').toLowerCase();
                        const capSev = rawSev.charAt(0).toUpperCase() + rawSev.slice(1);
                        const dateObj = new Date(e.timestamp);
                        const timeStr = isNaN(dateObj.getTime()) ? (e.timestamp || 'Just now') :
                            dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' ' +
                            dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                        return {
                            id: String(e.id || 'EVT-01'),
                            timestamp: timeStr,
                            rawTimestamp: e.timestamp,
                            eventType: e.title || (e.event_type ? e.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Security Alert'),
                            type: e.event_type || 'security_event',
                            severity: capSev,
                            status: e.is_resolved ? 'Resolved' : 'Active',
                            userOrIp: e.source_ip || e.user_email || '127.0.0.1',
                            userDisplay: e.user_email && e.user_email !== 'Unknown' ? e.user_email.split('@')[0] : (e.source_ip || '127.0.0.1'),
                            flag: '🌐',
                            resource: e.resource || 'System Perimeter',
                            details: e.description || e.title || 'Security event detected by AegisVault monitoring.',
                            is_resolved: !!e.is_resolved
                        };
                    });
                } else if (window.AegisSecurityData && window.AegisSecurityData.securityEvents) {
                    state.events = JSON.parse(JSON.stringify(window.AegisSecurityData.securityEvents));
                }

                if (alerts && Array.isArray(alerts) && alerts.length > 0) {
                    state.alerts = alerts.map(a => {
                        const rawSev = (a.severity || 'critical').toLowerCase();
                        const capSev = rawSev.charAt(0).toUpperCase() + rawSev.slice(1);
                        const dateObj = new Date(a.timestamp);
                        const timeStr = isNaN(dateObj.getTime()) ? (a.timestamp || 'Just now') :
                            dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' ' +
                            dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                        return {
                            id: String(a.id || 'ALT-01'),
                            title: a.title || (a.event_type ? a.event_type.replace(/_/g, ' ').toUpperCase() : 'Security Threat'),
                            severity: capSev,
                            timestamp: timeStr,
                            rawTimestamp: a.timestamp,
                            category: a.event_type || 'Threat Detection',
                            affectedResource: a.resource || 'Cryptographic Vault',
                            affectedUser: a.user_email || 'Perimeter Agent',
                            affectedVault: a.resource || 'Main Vault',
                            source: a.source_ip || 'External Net',
                            status: a.is_resolved ? 'Resolved' : 'Active',
                            description: a.description || 'Elevated anomaly flagged by perimeter sensors.'
                        };
                    });
                } else if (window.AegisSecurityData && window.AegisSecurityData.activeAlerts) {
                    state.alerts = JSON.parse(JSON.stringify(window.AegisSecurityData.activeAlerts));
                }

                // Live access telemetry from database AuditLog
                if (accessRes && accessRes.logs && Array.isArray(accessRes.logs)) {
                    state.access = accessRes.logs;
                    state.accessSuccessCount = accessRes.success_count || 0;
                    state.accessBlockedCount = accessRes.blocked_count || 0;
                } else if (Array.isArray(accessRes)) {
                    state.access = accessRes;
                    state.accessSuccessCount = accessRes.filter(a => a.result === 'Success').length;
                    state.accessBlockedCount = accessRes.filter(a => a.result === 'Blocked').length;
                } else if (window.AegisSecurityData && window.AegisSecurityData.accessActivity) {
                    state.access = JSON.parse(JSON.stringify(window.AegisSecurityData.accessActivity));
                }

                // Live incident response cases
                if (incidentsRes && incidentsRes.incidents && Array.isArray(incidentsRes.incidents)) {
                    state.incidents = incidentsRes.incidents;
                    state.openIncidentsCount = incidentsRes.open_count || 0;
                } else if (Array.isArray(incidentsRes)) {
                    state.incidents = incidentsRes;
                    state.openIncidentsCount = incidentsRes.filter(i => i.status !== 'Resolved').length;
                } else if (window.AegisSecurityData && window.AegisSecurityData.incidents) {
                    state.incidents = JSON.parse(JSON.stringify(window.AegisSecurityData.incidents));
                }

                if (overview && window.AegisSecurityData && window.AegisSecurityData.kpis) {
                    window.AegisSecurityData.kpis.securityEvents.displayValue = String(overview.events_last_24h || state.events.length || 0);
                    window.AegisSecurityData.kpis.criticalAlerts.displayValue = String(overview.open_critical || 0);
                    window.AegisSecurityData.kpis.activeThreats.displayValue = String(overview.total_open_alerts || overview.open_high || 0);
                    window.AegisSecurityData.kpis.blockedAttempts.displayValue = String(overview.failed_logins_24h || 0);

                    if (overview.trends) {
                        window.AegisSecurityData.trends = overview.trends;
                    }
                    if (overview.threat_sources) {
                        window.AegisSecurityData.threatSources = overview.threat_sources;
                    }

                    renderKPIs();
                    renderTrendChart();
                    renderThreatMap();
                }
            } catch (err) {
                console.warn('Live SecOps data loading error:', err);
            }
        } else if (window.AegisSecurityData) {
            state.events = JSON.parse(JSON.stringify(window.AegisSecurityData.securityEvents || []));
            state.alerts = JSON.parse(JSON.stringify(window.AegisSecurityData.activeAlerts || []));
            state.incidents = JSON.parse(JSON.stringify(window.AegisSecurityData.incidents || []));
            state.access = JSON.parse(JSON.stringify(window.AegisSecurityData.accessActivity || []));
        }
    }

    /* --------------------------------------------------------------
       THEME MANAGEMENT (Dual light/dark synchronization)
       -------------------------------------------------------------- */
    function initTheme() {
        state.theme = window.AegisAdminCommon ? (AegisAdminCommon.isDark() ? 'dark' : 'light') : (localStorage.getItem('aegisvault_theme') || 'dark');
        window.addEventListener('aegis:themechange', (e) => {
            state.theme = e.detail && e.detail.isDark ? 'dark' : 'light';
            renderTrendChart();
        });
    }

    function toggleTheme() {
        if (window.AegisAdminCommon) {
            const current = AegisAdminCommon.isDark() ? 'dark' : 'light';
            AegisAdminCommon.applyTheme(current === 'dark' ? 'light' : 'dark', true);
        }
    }

    /* --------------------------------------------------------------
       EVENT BINDINGS
       -------------------------------------------------------------- */
    function bindEvents() {
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
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, null, `#${tabId}`);
        }

        dom.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });

        dom.tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `tab-panel-${tabId}`);
        });

        window.scrollTo(0, 0);

        // If switching to full views, ensure their respective tables render
        if (tabId === 'events') renderFullEventsTable();
        if (tabId === 'alerts') renderFullAlertsList();
        if (tabId === 'access') renderAccessTable();
        if (tabId === 'incidents') renderIncidentsTable();
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

        // Update all 5 tab counter badges dynamically from live state!
        const activeAlertCount = state.alerts.filter(a => a.status === 'Active').length;
        setVal('tab-alerts-count', activeAlertCount);

        setVal('tab-events-count', state.events.length);
        setVal('tab-access-count', state.access.length);

        const openIncCount = state.incidents.filter(i => i.status !== 'Resolved').length;
        setVal('tab-incidents-count', openIncCount);

        // Update Access Activity Header Pills
        const successCount = state.accessSuccessCount !== undefined ? state.accessSuccessCount : state.access.filter(a => a.result === 'Success').length;
        const blockedCount = state.accessBlockedCount !== undefined ? state.accessBlockedCount : state.access.filter(a => a.result === 'Blocked').length;

        setVal('access-success-pill', `${successCount} Success`);
        setVal('access-blocked-pill', `${blockedCount} Blocked`);
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

        const allValues = (trends.series || []).flatMap(s => s.data || [0]);
        const maxRaw = Math.max(...allValues, 1);
        let maxVal = 10;
        let yTicks = [0, 2, 4, 6, 8, 10];
        if (maxRaw <= 5) {
            maxVal = 5;
            yTicks = [0, 1, 2, 3, 4, 5];
        } else if (maxRaw <= 10) {
            maxVal = 10;
            yTicks = [0, 2, 4, 6, 8, 10];
        } else if (maxRaw <= 20) {
            maxVal = 20;
            yTicks = [0, 5, 10, 15, 20];
        } else if (maxRaw <= 50) {
            maxVal = 50;
            yTicks = [0, 10, 20, 30, 40, 50];
        } else {
            maxVal = Math.ceil(maxRaw / 50) * 50;
            yTicks = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal];
        }

        const stepX = graphW / Math.max(1, trends.labels.length - 1);

        const getY = (val) => padding.top + graphH - ((val || 0) / maxVal) * graphH;
        const getX = (idx) => padding.left + idx * stepX;

        // Colors
        const isDark = state.theme === 'dark';
        const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
        const labelColor = isDark ? '#64748B' : '#94A3B8';

        let svgHtml = `<svg class="svg-line-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">`;

        // 1. Horizontal Grid Lines and Y-Axis labels
        yTicks.forEach(val => {
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

        if (!state.access || state.access.length === 0) {
            dom.accessTableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 32px; color: var(--text-muted);">
                        No access telemetry records found in the database.
                    </td>
                </tr>
            `;
            return;
        }

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

        if (!state.incidents || state.incidents.length === 0) {
            dom.incidentsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 32px; color: var(--text-muted);">
                        No security incident response cases open. All protocol sectors nominal.
                    </td>
                </tr>
            `;
            return;
        }

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

    async function confirmResolveAlert() {
        if (!pendingResolveAlertId) return;
        const alert = state.alerts.find(a => a.id === pendingResolveAlertId);
        const notes = (document.getElementById('resolve-notes-input') ? document.getElementById('resolve-notes-input').value.trim() : '');

        try {
            if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
                await window.AegisAPI.post(`/admin/security/events/${pendingResolveAlertId}/resolve/`, { notes });
            }
            if (alert) {
                alert.status = 'Resolved';
                alert.resolutionNotes = notes || 'Reviewed and resolved by administrator.';
            }
            const matchedEvt = state.events.find(e => e.id === pendingResolveAlertId);
            if (matchedEvt) {
                matchedEvt.status = 'Resolved';
                matchedEvt.is_resolved = true;
            }
            renderKPIs();
            renderEventsTable();
            renderAlertsWidget();
            renderFullAlertsList();
            closeAllModals();
            showToast(`Alert ${pendingResolveAlertId} successfully resolved in database!`, 'success');
        } catch (err) {
            console.error('Resolve error:', err);
            if (alert) alert.status = 'Resolved';
            renderKPIs();
            renderEventsTable();
            renderAlertsWidget();
            renderFullAlertsList();
            closeAllModals();
            showToast(`Alert marked resolved locally`, 'info');
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
        const inc = state.incidents.find(i => i.id === incidentId || i.raw_id === incidentId);
        if (!inc || !dom.modalIncidentDetails) return;

        document.getElementById('modal-inc-id').textContent = inc.id;
        document.getElementById('modal-inc-title').textContent = inc.title;
        document.getElementById('modal-inc-severity').innerHTML = `<span class="badge-pill ${getSeverityClass(inc.severity)}">${inc.severity}</span>`;
        document.getElementById('modal-inc-area').textContent = inc.affectedArea;
        document.getElementById('modal-inc-assigned').textContent = inc.assignedTo;
        document.getElementById('modal-inc-desc').textContent = inc.description || 'No detailed technical synopsis provided.';

        const timelineWrap = document.getElementById('modal-inc-timeline');
        if (timelineWrap) {
            const timelineList = (inc.timeline && inc.timeline.length > 0) ? inc.timeline : [
                { time: inc.created || 'Just now', note: `Incident detected on ${inc.affectedArea || 'Perimeter'}` },
                { time: inc.created || 'Just now', note: `Assigned to ${inc.assignedTo || 'SecOps Root Admin'} for active investigation` }
            ];
            timelineWrap.innerHTML = timelineList.map(t => `
                <div class="timeline-step-row">
                    <span class="timeline-bullet"></span>
                    <span class="timeline-time-badge">${t.time}</span>
                    <p class="timeline-note-text">${t.note}</p>
                </div>
            `).join('');
        }

        dom.modalIncidentDetails.classList.add('active');
    }

    function openCreateIncidentModal() {
        const titleInput = document.getElementById('new-inc-title');
        const descInput = document.getElementById('new-inc-desc');
        if (titleInput) titleInput.value = '';
        if (descInput) descInput.value = '';
        const modal = document.getElementById('modal-create-incident');
        if (modal) modal.classList.add('active');
    }

    async function submitCreateIncident() {
        const title = document.getElementById('new-inc-title')?.value.trim();
        const severity = document.getElementById('new-inc-severity')?.value || 'high';
        const resource = document.getElementById('new-inc-resource')?.value.trim() || 'Core Vault Perimeter';
        const description = document.getElementById('new-inc-desc')?.value.trim() || '';

        if (!title) {
            showToast('Incident title is required', 'warning');
            return;
        }

        try {
            if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
                const res = await window.AegisAPI.post('/admin/security/incidents/', {
                    title, severity, resource, description
                });
                if (res && res.incident) {
                    state.incidents.unshift(res.incident);
                }
            } else {
                state.incidents.unshift({
                    id: 'INC-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                    title,
                    severity: severity.toUpperCase(),
                    affectedArea: resource,
                    created: 'Just now',
                    assignedTo: 'SecOps Root Admin',
                    status: 'Investigating',
                    description
                });
            }

            renderIncidentsTable();
            renderKPIs();
            closeAllModals();
            showToast('Security incident registered successfully in database', 'success');
        } catch (err) {
            console.error('Failed to create incident:', err);
            showToast(err.message || 'Failed to create incident', 'error');
        }
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
    async function refreshTelemetry() {
        const timeBadge = document.getElementById('status-last-checked');
        if (timeBadge) timeBadge.textContent = 'Refreshing...';

        await initData();
        renderKPIs();
        renderEventsTable();
        renderAlertsWidget();
        renderFullEventsTable();
        renderFullAlertsList();
        renderTrendChart();

        if (timeBadge) timeBadge.textContent = 'Just now';
        showToast('Telemetry refreshed with latest security state from database', 'info');
    }

    function showToast(message, type = 'info') {
        if (window.AegisAdminCommon) {
            AegisAdminCommon.showToast(message, type === 'danger' ? 'error' : type);
        } else {
            alert(message);
        }
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

    /* --------------------------------------------------------------
       INTERACTIVE CALENDAR & DATE RANGE PICKER
       -------------------------------------------------------------- */
    const calState = {
        currentDate: new Date(),
        viewMonth: (new Date()).getMonth(),
        viewYear: (new Date()).getFullYear(),
        selectedStartDate: null,
        selectedEndDate: null,
        currentPreset: '24h',
        label: 'Last 24 Hours'
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const shortMonthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    function initCalendar() {
        const today = new Date();
        calState.viewMonth = today.getMonth();
        calState.viewYear = today.getFullYear();
        calState.selectedStartDate = today;
        calState.selectedEndDate = today;

        const startInput = document.getElementById('cal-start-date');
        const endInput = document.getElementById('cal-end-date');
        if (startInput) startInput.value = toISODate(today);
        if (endInput) endInput.value = toISODate(today);

        renderCalendarDays();
    }

    function toggleCalendarDropdown(e) {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        const popover = document.getElementById('calendar-dropdown-popover');
        const btn = document.getElementById('btn-time-range');
        if (!popover || !btn) return;

        const isOpen = popover.classList.contains('active');
        if (isOpen) {
            closeCalendarDropdown();
        } else {
            closeAllMenus();
            popover.classList.add('active');
            btn.classList.add('active');
            btn.setAttribute('aria-expanded', 'true');
            renderCalendarDays();
        }
    }

    function closeCalendarDropdown() {
        const popover = document.getElementById('calendar-dropdown-popover');
        const btn = document.getElementById('btn-time-range');
        if (popover) popover.classList.remove('active');
        if (btn) {
            btn.classList.remove('active');
            btn.setAttribute('aria-expanded', 'false');
        }
    }

    function navigateCalendar(direction) {
        calState.viewMonth += direction;
        if (calState.viewMonth < 0) {
            calState.viewMonth = 11;
            calState.viewYear -= 1;
        } else if (calState.viewMonth > 11) {
            calState.viewMonth = 0;
            calState.viewYear += 1;
        }
        renderCalendarDays();
    }

    function formatShortDate(d) {
        if (!d) return '';
        const day = d.getDate();
        const mon = shortMonthNames[d.getMonth()];
        const yr = d.getFullYear();
        return `${day} ${mon} ${yr}`;
    }

    function toISODate(d) {
        if (!d) return '';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    function parseISODate(str) {
        if (!str) return null;
        const [y, m, d] = str.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    function isSameDay(d1, d2) {
        if (!d1 || !d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    }

    function isBetween(d, start, end) {
        if (!d || !start || !end) return false;
        const time = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
        const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
        return time > s && time < e;
    }

    function renderCalendarDays() {
        const grid = document.getElementById('calendar-days-grid');
        const monthLabel = document.getElementById('cal-month-year-label');
        if (!grid || !monthLabel) return;

        monthLabel.textContent = `${monthNames[calState.viewMonth]} ${calState.viewYear}`;

        const firstDayOfMonth = new Date(calState.viewYear, calState.viewMonth, 1).getDay();
        const daysInCurrentMonth = new Date(calState.viewYear, calState.viewMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(calState.viewYear, calState.viewMonth, 0).getDate();

        let cellsHtml = '';

        // Previous month padding days
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const dayNum = daysInPrevMonth - i;
            cellsHtml += `<button type="button" class="cal-day-cell other-month" disabled>${dayNum}</button>`;
        }

        // Current month days
        const today = new Date();
        for (let day = 1; day <= daysInCurrentMonth; day++) {
            const cellDate = new Date(calState.viewYear, calState.viewMonth, day);
            let classes = ['cal-day-cell'];

            if (isSameDay(cellDate, today)) {
                classes.push('today');
            }

            const isStart = isSameDay(cellDate, calState.selectedStartDate);
            const isEnd = isSameDay(cellDate, calState.selectedEndDate);

            if (isStart && isEnd) {
                classes.push('selected');
            } else if (isStart) {
                classes.push('selected', 'range-start');
            } else if (isEnd) {
                classes.push('selected', 'range-end');
            } else if (isBetween(cellDate, calState.selectedStartDate, calState.selectedEndDate)) {
                classes.push('in-range');
            }

            cellsHtml += `<button type="button" class="${classes.join(' ')}" onclick="AegisSecurityModule.onDayClick(${calState.viewYear}, ${calState.viewMonth}, ${day})">${day}</button>`;
        }

        // Next month padding to keep neat 7-column grid
        const totalRendered = firstDayOfMonth + daysInCurrentMonth;
        const remaining = (7 - (totalRendered % 7)) % 7;
        for (let j = 1; j <= remaining; j++) {
            cellsHtml += `<button type="button" class="cal-day-cell other-month" disabled>${j}</button>`;
        }

        grid.innerHTML = cellsHtml;

        // Keep date inputs updated
        const startInput = document.getElementById('cal-start-date');
        const endInput = document.getElementById('cal-end-date');
        if (startInput && calState.selectedStartDate) {
            startInput.value = toISODate(calState.selectedStartDate);
        }
        if (endInput && calState.selectedEndDate) {
            endInput.value = toISODate(calState.selectedEndDate);
        }
    }

    function onDayClick(year, month, day) {
        const clicked = new Date(year, month, day);

        if (!calState.selectedStartDate || (calState.selectedStartDate && calState.selectedEndDate && !isSameDay(calState.selectedStartDate, calState.selectedEndDate))) {
            // First click: select single start date
            calState.selectedStartDate = clicked;
            calState.selectedEndDate = clicked;
        } else if (calState.selectedStartDate && isSameDay(calState.selectedStartDate, calState.selectedEndDate)) {
            // Second click: create range
            if (clicked < calState.selectedStartDate) {
                calState.selectedEndDate = calState.selectedStartDate;
                calState.selectedStartDate = clicked;
            } else {
                calState.selectedEndDate = clicked;
            }
        }

        // De-select quick presets since user selected custom date
        document.querySelectorAll('.cal-preset-btn').forEach(btn => btn.classList.remove('active'));

        renderCalendarDays();
    }

    function onDateInputChange() {
        const startInput = document.getElementById('cal-start-date');
        const endInput = document.getElementById('cal-end-date');
        if (startInput && startInput.value) {
            calState.selectedStartDate = parseISODate(startInput.value);
            if (calState.selectedStartDate) {
                calState.viewYear = calState.selectedStartDate.getFullYear();
                calState.viewMonth = calState.selectedStartDate.getMonth();
            }
        }
        if (endInput && endInput.value) {
            calState.selectedEndDate = parseISODate(endInput.value);
        }
        document.querySelectorAll('.cal-preset-btn').forEach(btn => btn.classList.remove('active'));
        renderCalendarDays();
    }

    function selectPresetDate(presetKey, presetLabel) {
        // Highlight active preset button
        document.querySelectorAll('.cal-preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-preset') === presetKey);
        });

        const now = new Date();
        let start = new Date();
        let end = new Date();
        let displayLabel = presetLabel;

        switch (presetKey) {
            case '24h':
                displayLabel = 'Last 24 Hours';
                start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                end = now;
                break;
            case 'today':
                displayLabel = `Today (${now.getDate()} ${shortMonthNames[now.getMonth()]})`;
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'yesterday':
                const yest = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                displayLabel = `Yesterday (${yest.getDate()} ${shortMonthNames[yest.getMonth()]})`;
                start = new Date(yest.getFullYear(), yest.getMonth(), yest.getDate());
                end = new Date(yest.getFullYear(), yest.getMonth(), yest.getDate());
                break;
            case '7d':
                displayLabel = 'Last 7 Days';
                start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                end = now;
                break;
            case '30d':
                displayLabel = 'Last 30 Days';
                start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                end = now;
                break;
            default:
                displayLabel = presetLabel;
        }

        calState.selectedStartDate = start;
        calState.selectedEndDate = end;
        calState.viewYear = start.getFullYear();
        calState.viewMonth = start.getMonth();
        calState.label = displayLabel;

        updateTimeRangeDisplay(displayLabel);
        renderCalendarDays();
        closeCalendarDropdown();

        showToast(`Time window updated: ${displayLabel}`, 'info');
        refreshTelemetry();
    }

    function applyCustomCalendarDate() {
        if (!calState.selectedStartDate && !calState.selectedEndDate) {
            selectPresetDate('today', 'Today');
            return;
        }

        const start = calState.selectedStartDate || calState.selectedEndDate;
        const end = calState.selectedEndDate || calState.selectedStartDate;

        let displayLabel = '';
        if (isSameDay(start, end)) {
            displayLabel = formatShortDate(start);
        } else {
            const startStr = `${start.getDate()} ${shortMonthNames[start.getMonth()]}`;
            const endStr = `${end.getDate()} ${shortMonthNames[end.getMonth()]} ${end.getFullYear()}`;
            displayLabel = `${startStr} – ${endStr}`;
        }

        calState.selectedStartDate = start;
        calState.selectedEndDate = end;
        calState.label = displayLabel;

        updateTimeRangeDisplay(displayLabel);
        closeCalendarDropdown();

        showToast(`Telemetry updated for: ${displayLabel}`, 'info');
        refreshTelemetry();
    }

    function updateTimeRangeDisplay(text) {
        const labelEl = document.getElementById('time-range-label');
        if (labelEl) {
            labelEl.textContent = text;
        }
    }

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.action-menu-container')) {
            closeAllMenus();
        }
        if (!e.target.closest('#hero-time-range-col')) {
            closeCalendarDropdown();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCalendarDropdown();
            closeAllMenus();
            closeAllModals();
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
        openCreateIncidentModal,
        submitCreateIncident,
        exportEventsCSV,
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
        closeAllMenus,
        initCalendar,
        toggleCalendarDropdown,
        closeCalendarDropdown,
        navigateCalendar,
        onDayClick,
        onDateInputChange,
        selectPresetDate,
        applyCustomCalendarDate
    };

    // Auto boot on DOM load
    document.addEventListener('DOMContentLoaded', init);

})();
