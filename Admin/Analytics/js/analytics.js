/**
 * AegisVault Analytics Module — Client Logic & Pure SVG Visualization Engine
 * 
 * Features:
 * - Theme synchronization (Light/Dark) across modules with local storage persistence
 * - Pure SVG Chart Renderers (Zero external dependencies):
 *   1. User Growth Area Chart with cubic bezier curves & gradient fills
 *   2. Vault Statistics Grouped Bar Chart with interactive hover states
 *   3. User Distribution Donut Chart using SVG stroke-dasharray offsets
 *   4. System Usage Multi-Line Trends Chart
 * - Dynamic Period Filters (30d, 7d, 90d) for all charts
 * - Interactive Date Range Picker Modal with presets
 * - Client-side Data Exporter (CSV & JSON format generation)
 * - Global Search with keyboard shortcut ('/') and predictive autocomplete
 * - Mobile sidebar drawer toggle & responsive notifications/profile menus
 * - Toast notification system
 */

(function () {
    "use strict";

    // Application state
    const state = {
        theme: localStorage.getItem("aegisvault_theme") || "light",
        userGrowthPeriod: "30d",
        vaultStatsPeriod: "30d",
        usagePeriod: "30d",
        dateRange: "01 Sep 2025 - 12 Sep 2025"
    };

    // DOM Elements Cache
    const elements = {
        html: document.documentElement,
        body: document.body,
        btnThemeToggle: document.getElementById("btn-theme-toggle"),
        btnHamburger: document.getElementById("btn-hamburger"),
        appSidebar: document.getElementById("app-sidebar"),
        sidebarBackdrop: document.getElementById("sidebar-backdrop"),
        globalSearch: document.getElementById("global-header-search"),
        searchResultsDropdown: document.getElementById("search-results-dropdown"),
        btnNotifications: document.getElementById("btn-notifications"),
        notificationsDropdown: document.getElementById("notifications-dropdown"),
        btnProfile: document.getElementById("user-profile-btn"),
        profileDropdown: document.getElementById("profile-dropdown"),
        btnDateRange: document.getElementById("btn-date-range"),
        dateRangeDisplayText: document.getElementById("date-range-display-text"),
        modalDatePicker: document.getElementById("modal-date-picker"),
        btnCloseDateModal: document.getElementById("btn-close-date-modal"),
        btnCancelDateModal: document.getElementById("btn-cancel-date-modal"),
        btnApplyDateModal: document.getElementById("btn-apply-date-modal"),
        btnExportTrigger: document.getElementById("btn-export-trigger"),
        modalExportData: document.getElementById("modal-export-data"),
        btnCloseExportModal: document.getElementById("btn-close-export-modal"),
        btnCancelExportModal: document.getElementById("btn-cancel-export-modal"),
        btnConfirmExportModal: document.getElementById("btn-confirm-export-modal"),
        overviewKpiGrid: document.getElementById("overview-kpi-grid"),
        selectUserGrowthRange: document.getElementById("select-user-growth-range"),
        userGrowthContainer: document.getElementById("user-growth-chart-container"),
        userGrowthStatsFooter: document.getElementById("user-growth-stats-footer"),
        selectVaultPeriod: document.getElementById("select-vault-period"),
        vaultStatsContainer: document.getElementById("vault-stats-chart-container"),
        vaultStatsFooter: document.getElementById("vault-stats-footer"),
        userDistDonutSvg: document.getElementById("user-dist-donut-svg"),
        donutCenterTotal: document.getElementById("donut-center-total"),
        donutLegendContainer: document.getElementById("donut-legend-container"),
        geoStatsContainer: document.getElementById("geo-stats-container"),
        secMiniGrid: document.getElementById("sec-mini-grid"),
        selectUsagePeriod: document.getElementById("select-usage-period"),
        systemUsageContainer: document.getElementById("system-usage-chart-container"),
        activityTableBody: document.getElementById("activity-table-body"),
        chartTooltip: document.getElementById("chart-tooltip"),
        toastContainer: document.getElementById("toast-container")
    };

    /* ==========================================================================
       1. Toast Notifications Utility
       ========================================================================== */
    function showToast(message, type = "info") {
        if (!elements.toastContainer) return;
        const toast = document.createElement("div");
        toast.className = `toast-message toast-${type}`;
        
        const iconSvg = type === "success" 
            ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : type === "warning"
            ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#F59E0B" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
            : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#E86326" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';

        toast.innerHTML = `${iconSvg}<span>${message}</span>`;
        elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
            toast.style.opacity = "0";
            toast.style.transform = "translateY(10px)";
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    /* ==========================================================================
       2. Theme Synchronization
       ========================================================================== */
    function applyTheme(theme) {
        state.theme = theme;
        elements.html.setAttribute("data-theme", theme);
        elements.body.className = theme === "dark" ? "dark-theme" : "light-theme";
        localStorage.setItem("aegisvault_theme", theme);

        // Re-render charts to adjust SVG stroke/fill colors for the theme
        renderAllCharts();
    }

    function toggleTheme() {
        const nextTheme = state.theme === "light" ? "dark" : "light";
        applyTheme(nextTheme);
        showToast(`Theme switched to ${nextTheme === "dark" ? "Dark Mode" : "Light Mode"}`, "info");
    }

    /* ==========================================================================
       3. Overview KPI Cards
       ========================================================================== */
    function renderOverviewMetrics() {
        if (!elements.overviewKpiGrid || !AegisAnalyticsData.overviewMetrics) return;

        elements.overviewKpiGrid.innerHTML = AegisAnalyticsData.overviewMetrics.map(item => {
            let iconSvg = "";
            let circleColorClass = "icon-circle-blue";

            if (item.icon === "users") {
                iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
                circleColorClass = "icon-circle-blue";
            } else if (item.icon === "user-check") {
                iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>';
                circleColorClass = "icon-circle-green";
            } else if (item.icon === "shield") {
                iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>';
                circleColorClass = "icon-circle-purple";
            } else if (item.icon === "users-three") {
                iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"></circle><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"></path></svg>';
                circleColorClass = "icon-circle-orange";
            } else if (item.icon === "alert-triangle") {
                iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
                circleColorClass = "icon-circle-red";
            }

            const trendClass = item.trendDirection === "up" ? "trend-up" : "trend-down";

            return `
                <div class="kpi-card" title="${item.label}: ${item.value}">
                    <div class="kpi-icon-circle ${circleColorClass}">
                        ${iconSvg}
                    </div>
                    <div class="kpi-content-col">
                        <div class="kpi-metric-number">${item.value}</div>
                        <div class="kpi-label-trend-row">
                            <span class="kpi-label">${item.label}</span>
                            <span class="kpi-trend-pill ${trendClass}">${item.trend}</span>
                        </div>
                        <span class="kpi-subtext">${item.subtext}</span>
                    </div>
                </div>
            `;
        }).join("");
    }

    /* ==========================================================================
       4. Pure SVG Chart 1: User Growth (Area Chart with Cubic Bezier)
       ========================================================================== */
    function renderUserGrowthChart(period = state.userGrowthPeriod) {
        if (!elements.userGrowthContainer || !AegisAnalyticsData.userGrowth) return;

        const data = AegisAnalyticsData.userGrowth[period] || AegisAnalyticsData.userGrowth["30d"];
        const isDark = state.theme === "dark";

        const width = 480;
        const height = 190;
        const paddingLeft = 45;
        const paddingRight = 35;
        const paddingTop = 20;
        const paddingBottom = 25;

        const plotWidth = width - paddingLeft - paddingRight;
        const plotHeight = height - paddingTop - paddingBottom;

        const maxVal = data.max;
        const minVal = data.min;
        const step = data.step;
        const yStepsCount = Math.floor((maxVal - minVal) / step);

        // Compute points
        const points = data.values.map((val, idx) => {
            const x = paddingLeft + (idx / (data.values.length - 1)) * plotWidth;
            const y = paddingTop + plotHeight - ((val - minVal) / (maxVal - minVal)) * plotHeight;
            return { x, y, val, label: data.labels[idx] };
        });

        // Generate smooth cubic bezier curve
        function createSmoothPath(pts) {
            if (pts.length === 0) return "";
            let path = `M ${pts[0].x},${pts[0].y}`;
            for (let i = 0; i < pts.length - 1; i++) {
                const current = pts[i];
                const next = pts[i + 1];
                const controlX = (current.x + next.x) / 2;
                path += ` C ${controlX},${current.y} ${controlX},${next.y} ${next.x},${next.y}`;
            }
            return path;
        }

        const linePath = createSmoothPath(points);
        const lastPt = points[points.length - 1];
        const firstPt = points[0];
        const areaPath = `${linePath} L ${lastPt.x},${paddingTop + plotHeight} L ${firstPt.x},${paddingTop + plotHeight} Z`;

        // Colors
        const strokeColor = isDark ? "#38BDF8" : "#2563EB";
        const gradStart = isDark ? "rgba(56, 189, 248, 0.35)" : "rgba(37, 99, 235, 0.28)";
        const gradEnd = isDark ? "rgba(56, 189, 248, 0.0)" : "rgba(37, 99, 235, 0.0)";

        // Horizontal Gridlines and Y Labels
        let gridlinesHtml = "";
        for (let i = 0; i <= yStepsCount; i++) {
            const currentYVal = minVal + i * step;
            const yPos = paddingTop + plotHeight - ((currentYVal - minVal) / (maxVal - minVal)) * plotHeight;
            gridlinesHtml += `
                <line x1="${paddingLeft}" y1="${yPos}" x2="${width - paddingRight}" y2="${yPos}" class="chart-gridline" />
                <text x="${paddingLeft - 8}" y="${yPos + 3.5}" text-anchor="end" class="chart-axis-label">${currentYVal}</text>
            `;
        }

        // X-axis Labels
        let xLabelsHtml = points.map(pt => `
            <text x="${pt.x}" y="${height - 5}" text-anchor="middle" class="chart-axis-label">${pt.label}</text>
        `).join("");

        // Interactive Dots
        let dotsHtml = points.map((pt, idx) => `
            <circle cx="${pt.x}" cy="${pt.y}" r="4" fill="${isDark ? '#06151E' : '#FFFFFF'}" stroke="${strokeColor}" stroke-width="2.5" class="chart-point-dot" 
                    data-val="${pt.val}" data-label="${pt.label}" data-idx="${idx}" />
        `).join("");

        // End Marker Tooltip Box (Matching reference screenshot: "1,248 / 12 Sep 2025")
        const endMarkerHtml = `
            <g class="chart-end-marker" transform="translate(${lastPt.x - 46}, ${lastPt.y - 32})">
                <rect width="92" height="24" rx="4" fill="${isDark ? '#142330' : '#0B192C'}" />
                <text x="46" y="16" text-anchor="middle" fill="#FFFFFF" font-size="10" font-weight="700" font-family="'Plus Jakarta Sans', sans-serif">
                    ${data.tooltipPoint.value}
                </text>
            </g>
            <line x1="${lastPt.x}" y1="${lastPt.y - 8}" x2="${lastPt.x}" y2="${lastPt.y + 4}" stroke="${strokeColor}" stroke-width="1.5" stroke-dasharray="2 2" />
        `;

        elements.userGrowthContainer.innerHTML = `
            <svg class="aegis-svg-chart" viewBox="0 0 ${width} ${height}">
                <defs>
                    <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="${gradStart}" />
                        <stop offset="100%" stop-color="${gradEnd}" />
                    </linearGradient>
                </defs>
                ${gridlinesHtml}
                <path d="${areaPath}" fill="url(#userGrowthGradient)" />
                <path d="${linePath}" class="chart-line-path" stroke="${strokeColor}" />
                ${dotsHtml}
                ${endMarkerHtml}
                ${xLabelsHtml}
            </svg>
        `;

        // Render Footer Breakdown Stats
        if (elements.userGrowthStatsFooter && data.stats) {
            elements.userGrowthStatsFooter.innerHTML = data.stats.map(st => `
                <div class="footer-stat-item">
                    <span class="stat-val-trend">${st.value}</span>
                    <span class="stat-label-text">${st.label}</span>
                </div>
            `).join("");
        }

        // Attach Tooltip events to dots
        attachChartDotTooltips(elements.userGrowthContainer, "Users");
    }

    /* ==========================================================================
       5. Pure SVG Chart 2: Vault Statistics (Grouped Bar Chart)
       ========================================================================== */
    function renderVaultStatsChart(period = state.vaultStatsPeriod) {
        if (!elements.vaultStatsContainer || !AegisAnalyticsData.vaultStatistics) return;

        const data = AegisAnalyticsData.vaultStatistics[period] || AegisAnalyticsData.vaultStatistics["30d"];
        const isDark = state.theme === "dark";

        const width = 480;
        const height = 190;
        const paddingLeft = 40;
        const paddingRight = 20;
        const paddingTop = 20;
        const paddingBottom = 25;

        const plotWidth = width - paddingLeft - paddingRight;
        const plotHeight = height - paddingTop - paddingBottom;

        const maxVal = data.max;
        const step = data.step;
        const yStepsCount = Math.floor(maxVal / step);

        // Group configuration
        const numGroups = data.labels.length;
        const groupWidth = plotWidth / numGroups;
        const barWidth = Math.min(10, (groupWidth - 14) / 3);
        const groupPadding = (groupWidth - (barWidth * 3 + 4)) / 2;        const personalColor = isDark ? "#FF7A3D" : "#F45A1F";
        const familyColor = isDark ? "#60A5FA" : "#3B82F6";
        const businessColor = isDark ? "#FBBF24" : "#F59E0B";

        // Gridlines
        let gridlinesHtml = "";
        for (let i = 0; i <= yStepsCount; i++) {
            const currentYVal = i * step;
            const yPos = paddingTop + plotHeight - (currentYVal / maxVal) * plotHeight;
            gridlinesHtml += `
                <line x1="${paddingLeft}" y1="${yPos}" x2="${width - paddingRight}" y2="${yPos}" class="chart-gridline" />
                <text x="${paddingLeft - 8}" y="${yPos + 3.5}" text-anchor="end" class="chart-axis-label">${currentYVal}</text>
            `;
        }

        // Bars & Labels
        let barsHtml = "";
        let xLabelsHtml = "";

        data.labels.forEach((label, gIdx) => {
            const groupX = paddingLeft + gIdx * groupWidth + groupPadding;

            const valPersonal = data.series.personal[gIdx] || 0;
            const valFamily = data.series.family[gIdx] || 0;
            const valBusiness = data.series.business[gIdx] || 0;

            const hPersonal = Math.max(2, (valPersonal / maxVal) * plotHeight);
            const yPersonal = paddingTop + plotHeight - hPersonal;

            const hFamily = Math.max(2, (valFamily / maxVal) * plotHeight);
            const yFamily = paddingTop + plotHeight - hFamily;

            const hBusiness = Math.max(2, (valBusiness / maxVal) * plotHeight);
            const yBusiness = paddingTop + plotHeight - hBusiness;

            const x1 = groupX;
            const x2 = groupX + barWidth + 2;
            const x3 = groupX + (barWidth + 2) * 2;

            barsHtml += `
                <rect x="${x1}" y="${yPersonal}" width="${barWidth}" height="${hPersonal}" fill="${personalColor}" class="chart-bar-rect" data-cat="Personal" data-val="${valPersonal}" data-label="${label}" />
                <rect x="${x2}" y="${yFamily}" width="${barWidth}" height="${hFamily}" fill="${familyColor}" class="chart-bar-rect" data-cat="Family" data-val="${valFamily}" data-label="${label}" />
                <rect x="${x3}" y="${yBusiness}" width="${barWidth}" height="${hBusiness}" fill="${businessColor}" class="chart-bar-rect" data-cat="Business" data-val="${valBusiness}" data-label="${label}" />
            `;

            const groupCenterX = groupX + (barWidth * 3 + 4) / 2;
            xLabelsHtml += `
                <text x="${groupCenterX}" y="${height - 5}" text-anchor="middle" class="chart-axis-label">${label}</text>
            `;
        });

        elements.vaultStatsContainer.innerHTML = `
            <svg class="aegis-svg-chart" viewBox="0 0 ${width} ${height}">
                ${gridlinesHtml}
                ${barsHtml}
                ${xLabelsHtml}
            </svg>
        `;

        // Render Footer Breakdown Stats
        if (elements.vaultStatsFooter && data.stats) {
            elements.vaultStatsFooter.innerHTML = data.stats.map(st => {
                let iconClass = "bg-purple";
                let iconSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';

                if (st.icon.includes("orange")) {
                    iconClass = "bg-orange";
                    iconSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>';
                } else if (st.icon.includes("red")) {
                    iconClass = "bg-red";
                    iconSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>';
                }

                return `
                    <div class="vault-mini-stat">
                        <div class="vault-stat-icon ${iconClass}">
                            ${iconSvg}
                        </div>
                        <div class="vault-stat-col">
                            <span class="vault-stat-num">${st.value}</span>
                            <span class="vault-stat-name">${st.label}</span>
                        </div>
                    </div>
                `;
            }).join("");
        }

        // Attach Bar Tooltips
        attachChartBarTooltips(elements.vaultStatsContainer);
    }

    /* ==========================================================================
       6. Pure SVG Chart 3: User Distribution Donut Chart
       ========================================================================== */
    function renderUserDistributionDonut() {
        if (!elements.userDistDonutSvg || !AegisAnalyticsData.userDistribution) return;

        const data = AegisAnalyticsData.userDistribution;
        const isDark = state.theme === "dark";

        const cx = 70;
        const cy = 70;
        const r = 48;
        const strokeWidth = 16;
        const circumference = 2 * Math.PI * r;

        let currentOffset = 0;
        let arcsHtml = "";

        data.segments.forEach((seg, idx) => {
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

        elements.userDistDonutSvg.innerHTML = arcsHtml;

        // Center counter
        if (elements.donutCenterTotal) {
            elements.donutCenterTotal.textContent = data.total.toLocaleString();
        }

        // Legend list
        if (elements.donutLegendContainer) {
            elements.donutLegendContainer.innerHTML = data.segments.map(seg => {
                const dotColor = isDark ? seg.darkColor : seg.color;
                return `
                    <div class="donut-legend-row" title="${seg.label}: ${seg.count} users (${seg.percent}%)">
                        <div class="legend-label-col">
                            <span class="legend-color-dot" style="background-color: ${dotColor};"></span>
                            <span>${seg.label}</span>
                        </div>
                        <span class="legend-percent">${seg.percent}%</span>
                    </div>
                `;
            }).join("");
        }

        // Donut hover interactions
        const segments = elements.userDistDonutSvg.querySelectorAll(".donut-segment");
        segments.forEach(seg => {
            seg.addEventListener("mouseenter", (e) => {
                seg.setAttribute("stroke-width", "20");
                const label = seg.getAttribute("data-label");
                const pct = seg.getAttribute("data-percent");
                const count = seg.getAttribute("data-count");
                showTooltip(e, `<strong>${label}</strong>: ${count} users (${pct})`);
            });
            seg.addEventListener("mousemove", moveTooltip);
            seg.addEventListener("mouseleave", () => {
                seg.setAttribute("stroke-width", "16");
                hideTooltip();
            });
        });
    }

    /* ==========================================================================
       7. Geographic Distribution (India)
       ========================================================================== */
    function renderGeographicDistribution() {
        if (!elements.geoStatsContainer || !AegisAnalyticsData.geographicDistribution) return;

        const regions = AegisAnalyticsData.geographicDistribution.regions;
        elements.geoStatsContainer.innerHTML = regions.map(reg => `
            <div class="geo-stat-row" title="${reg.name}: ${reg.count} active custody nodes (${reg.percent}%)">
                <span class="geo-stat-name">${reg.name}</span>
                <span class="geo-stat-pct">${reg.percent}%</span>
            </div>
        `).join("");
    }

    /* ==========================================================================
       8. Security Overview (4 Mini Cards matching reference screenshot)
       ========================================================================== */
    function renderSecurityOverview() {
        if (!elements.secMiniGrid || !AegisAnalyticsData.securityOverview) return;

        const items = AegisAnalyticsData.securityOverview["30d"] || [];
        elements.secMiniGrid.innerHTML = items.map((item, idx) => {
            let iconSvg = "";
            let cardThemeClass = "card-sec-red";

            if (idx === 0) {
                cardThemeClass = "card-sec-red";
                iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
            } else if (idx === 1) {
                cardThemeClass = "card-sec-orange";
                iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
            } else if (idx === 2) {
                cardThemeClass = "card-sec-green";
                iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>';
            } else if (idx === 3) {
                cardThemeClass = "card-sec-blue";
                iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
            }

            let trendColorStyle = "color: #10B981;";
            if (idx === 0 || idx === 1) {
                trendColorStyle = "color: #EF4444;";
            } else if (idx === 2) {
                trendColorStyle = "color: var(--text-muted);";
            }

            return `
                <div class="sec-kpi-item ${cardThemeClass}" title="${item.label}: ${item.value}">
                    <div class="sec-icon-circle">
                        ${iconSvg}
                    </div>
                    <div class="sec-kpi-num">${item.value}</div>
                    <div class="sec-kpi-title">${item.label}</div>
                    <div class="sec-kpi-trend" style="${trendColorStyle}">${item.trend}</div>
                </div>
            `;
        }).join("");
    }

    /* ==========================================================================
       9. Pure SVG Chart 4: System Usage Trends (Multi-series Lines)
       ========================================================================== */
    function renderSystemUsageTrends(period = state.usagePeriod) {
        if (!elements.systemUsageContainer || !AegisAnalyticsData.systemUsageTrends) return;

        const data = AegisAnalyticsData.systemUsageTrends[period] || AegisAnalyticsData.systemUsageTrends["30d"];
        const isDark = state.theme === "dark";

        const width = 480;
        const height = 180;
        const paddingLeft = 40;
        const paddingRight = 20;
        const paddingTop = 20;
        const paddingBottom = 25;

        const plotWidth = width - paddingLeft - paddingRight;
        const plotHeight = height - paddingTop - paddingBottom;
        const maxVal = 100;

        // Gridlines
        let gridlinesHtml = "";
        data.ySteps.forEach(yVal => {
            const yPos = paddingTop + plotHeight - (yVal / maxVal) * plotHeight;
            gridlinesHtml += `
                <line x1="${paddingLeft}" y1="${yPos}" x2="${width - paddingRight}" y2="${yPos}" class="chart-gridline" />
                <text x="${paddingLeft - 8}" y="${yPos + 3.5}" text-anchor="end" class="chart-axis-label">${yVal}%</text>
            `;
        });

        // X Labels
        let xLabelsHtml = data.labels.map((lbl, idx) => {
            const xPos = paddingLeft + (idx / (data.labels.length - 1)) * plotWidth;
            return `<text x="${xPos}" y="${height - 5}" text-anchor="middle" class="chart-axis-label">${lbl}</text>`;
        }).join("");

        // Lines and dots for each series
        let seriesHtml = "";
        data.series.forEach(ser => {
            const color = isDark ? ser.darkColor : ser.color;
            const pts = ser.values.map((val, idx) => {
                const x = paddingLeft + (idx / (ser.values.length - 1)) * plotWidth;
                const y = paddingTop + plotHeight - (val / maxVal) * plotHeight;
                return { x, y, val, label: data.labels[idx] };
            });

            // Smooth cubic line path
            let pathD = `M ${pts[0].x},${pts[0].y}`;
            for (let i = 0; i < pts.length - 1; i++) {
                const curr = pts[i];
                const next = pts[i + 1];
                const cX = (curr.x + next.x) / 2;
                pathD += ` C ${cX},${curr.y} ${cX},${next.y} ${next.x},${next.y}`;
            }

            seriesHtml += `<path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" />`;

            pts.forEach(pt => {
                seriesHtml += `
                    <circle cx="${pt.x}" cy="${pt.y}" r="3" fill="${isDark ? '#06151E' : '#FFFFFF'}" stroke="${color}" stroke-width="2" class="chart-point-dot"
                            data-series="${ser.name}" data-val="${pt.val}%" data-label="${pt.label}" />
                `;
            });
        });

        elements.systemUsageContainer.innerHTML = `
            <svg class="aegis-svg-chart" viewBox="0 0 ${width} ${height}">
                ${gridlinesHtml}
                ${seriesHtml}
                ${xLabelsHtml}
            </svg>
        `;

        // Attach Usage Line Dot Tooltips
        const dots = elements.systemUsageContainer.querySelectorAll(".chart-point-dot");
        dots.forEach(dot => {
            dot.addEventListener("mouseenter", (e) => {
                const sName = dot.getAttribute("data-series");
                const val = dot.getAttribute("data-val");
                const lbl = dot.getAttribute("data-label");
                showTooltip(e, `<strong>${sName}</strong>: ${val} (${lbl})`);
            });
            dot.addEventListener("mousemove", moveTooltip);
            dot.addEventListener("mouseleave", hideTooltip);
        });
    }

    /* ==========================================================================
       10. Recent Platform Activity Table
       ========================================================================== */
    function renderRecentActivityTable() {
        if (!elements.activityTableBody || !AegisAnalyticsData.recentActivity) return;

        elements.activityTableBody.innerHTML = AegisAnalyticsData.recentActivity.map(row => `
            <tr>
                <td class="activity-time-col">${row.time}</td>
                <td class="activity-event-col">${row.event}</td>
                <td class="activity-details-col">${row.details}</td>
            </tr>
        `).join("");
    }

    /* ==========================================================================
       11. Tooltip Helpers for Pure SVG Charts
       ========================================================================== */
    function showTooltip(e, html) {
        if (!elements.chartTooltip) return;
        elements.chartTooltip.innerHTML = html;
        elements.chartTooltip.style.display = "block";
        moveTooltip(e);
    }

    function moveTooltip(e) {
        if (!elements.chartTooltip) return;
        elements.chartTooltip.style.left = `${e.clientX}px`;
        elements.chartTooltip.style.top = `${e.clientY - 12}px`;
    }

    function hideTooltip() {
        if (!elements.chartTooltip) return;
        elements.chartTooltip.style.display = "none";
    }

    function attachChartDotTooltips(container, unit = "") {
        const dots = container.querySelectorAll(".chart-point-dot");
        dots.forEach(dot => {
            dot.addEventListener("mouseenter", (e) => {
                const val = dot.getAttribute("data-val");
                const lbl = dot.getAttribute("data-label");
                showTooltip(e, `<strong>${lbl}</strong>: ${Number(val).toLocaleString()} ${unit}`);
            });
            dot.addEventListener("mousemove", moveTooltip);
            dot.addEventListener("mouseleave", hideTooltip);
        });
    }

    function attachChartBarTooltips(container) {
        const bars = container.querySelectorAll(".chart-bar-rect");
        bars.forEach(bar => {
            bar.addEventListener("mouseenter", (e) => {
                const cat = bar.getAttribute("data-cat");
                const val = bar.getAttribute("data-val");
                const lbl = bar.getAttribute("data-label");
                showTooltip(e, `<strong>${lbl}</strong><br>${cat} Vaults: ${val}`);
            });
            bar.addEventListener("mousemove", moveTooltip);
            bar.addEventListener("mouseleave", hideTooltip);
        });
    }

    /* ==========================================================================
       12. Global Search with '/' Shortcut & Dropdown
       ========================================================================== */
    function initGlobalSearch() {
        if (!elements.globalSearch || !elements.searchResultsDropdown) return;

        // Keyboard shortcut '/'
        window.addEventListener("keydown", (e) => {
            if (e.key === "/" && document.activeElement !== elements.globalSearch) {
                e.preventDefault();
                elements.globalSearch.focus();
                elements.globalSearch.select();
            }
            if (e.key === "Escape") {
                elements.searchResultsDropdown.classList.remove("active");
                elements.globalSearch.blur();
            }
        });

        // Input listener
        elements.globalSearch.addEventListener("input", (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (!query) {
                elements.searchResultsDropdown.classList.remove("active");
                elements.searchResultsDropdown.innerHTML = "";
                return;
            }

            const results = (AegisAnalyticsData.searchIndex || []).filter(item => 
                item.title.toLowerCase().includes(query) || item.category.toLowerCase().includes(query)
            );

            if (results.length === 0) {
                elements.searchResultsDropdown.innerHTML = `
                    <div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
                        No telemetry or custody records found for "${query}"
                    </div>
                `;
            } else {
                elements.searchResultsDropdown.innerHTML = results.map(item => `
                    <div class="search-result-item" data-link="${item.link}">
                        <div class="search-item-icon">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                        <div class="search-item-info">
                            <span class="search-item-title">${item.title}</span>
                            <span class="search-item-meta">${item.category}</span>
                        </div>
                    </div>
                `).join("");

                // Click to navigate
                elements.searchResultsDropdown.querySelectorAll(".search-result-item").forEach(el => {
                    el.addEventListener("click", () => {
                        const link = el.getAttribute("data-link");
                        if (link.startsWith("#")) {
                            const targetEl = document.querySelector(link);
                            if (targetEl) {
                                targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
                                targetEl.style.outline = "2px solid var(--brand-orange)";
                                setTimeout(() => targetEl.style.outline = "none", 1800);
                            }
                        } else {
                            window.location.href = link;
                        }
                        elements.searchResultsDropdown.classList.remove("active");
                    });
                });
            }

            elements.searchResultsDropdown.classList.add("active");
        });

        // Close on outside click
        document.addEventListener("click", (e) => {
            if (!elements.globalSearch.contains(e.target) && !elements.searchResultsDropdown.contains(e.target)) {
                elements.searchResultsDropdown.classList.remove("active");
            }
        });
    }

    /* ==========================================================================
       13. Date Range Picker Modal
       ========================================================================== */
    function initDateRangePicker() {
        if (!elements.btnDateRange || !elements.modalDatePicker) return;

        function openDateModal() {
            elements.modalDatePicker.classList.add("active");
        }

        function closeDateModal() {
            elements.modalDatePicker.classList.remove("active");
        }

        elements.btnDateRange.addEventListener("click", openDateModal);
        if (elements.btnCloseDateModal) elements.btnCloseDateModal.addEventListener("click", closeDateModal);
        if (elements.btnCancelDateModal) elements.btnCancelDateModal.addEventListener("click", closeDateModal);

        // Date Preset pills
        const presetPills = elements.modalDatePicker.querySelectorAll(".date-preset-pill");
        presetPills.forEach(pill => {
            pill.addEventListener("click", () => {
                presetPills.forEach(p => p.classList.remove("active"));
                pill.classList.add("active");
                const preset = pill.getAttribute("data-preset");

                const startInput = document.getElementById("input-date-start");
                const endInput = document.getElementById("input-date-end");

                if (preset === "7d") {
                    startInput.value = "2025-09-06";
                    endInput.value = "2025-09-12";
                } else if (preset === "30d") {
                    startInput.value = "2025-08-13";
                    endInput.value = "2025-09-12";
                } else if (preset === "90d") {
                    startInput.value = "2025-06-15";
                    endInput.value = "2025-09-12";
                }
            });
        });

        // Apply
        if (elements.btnApplyDateModal) {
            elements.btnApplyDateModal.addEventListener("click", () => {
                const startInput = document.getElementById("input-date-start");
                const endInput = document.getElementById("input-date-end");

                const formatDate = (str) => {
                    const parts = str.split("-");
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    return `${parts[2]} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
                };

                const formattedRange = `${formatDate(startInput.value)} - ${formatDate(endInput.value)}`;
                state.dateRange = formattedRange;
                if (elements.dateRangeDisplayText) {
                    elements.dateRangeDisplayText.textContent = formattedRange;
                }

                closeDateModal();
                showToast(`Analytics telemetry filtered: ${formattedRange}`, "success");
            });
        }
    }

    /* ==========================================================================
       14. Export Dataset Logic (Client-side CSV / JSON)
       ========================================================================== */
    function initExportModal() {
        if (!elements.btnExportTrigger || !elements.modalExportData) return;

        function openExportModal() {
            elements.modalExportData.classList.add("active");
        }

        function closeExportModal() {
            elements.modalExportData.classList.remove("active");
        }

        elements.btnExportTrigger.addEventListener("click", openExportModal);
        if (elements.btnCloseExportModal) elements.btnCloseExportModal.addEventListener("click", closeExportModal);
        if (elements.btnCancelExportModal) elements.btnCancelExportModal.addEventListener("click", closeExportModal);

        if (elements.btnConfirmExportModal) {
            elements.btnConfirmExportModal.addEventListener("click", () => {
                const selectedRadio = elements.modalExportData.querySelector('input[name="export-format"]:checked');
                const format = selectedRadio ? selectedRadio.value : "csv";

                if (format === "csv") {
                    downloadCsvExport();
                } else {
                    downloadJsonExport();
                }

                closeExportModal();
                showToast(`Telemetry report exported as ${format.toUpperCase()}`, "success");
            });
        }
    }

    function downloadCsvExport() {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Metric / Label,Value,Trend,Status\n";
        
        (AegisAnalyticsData.overviewMetrics || []).forEach(m => {
            csvContent += `"${m.label}","${m.value}","${m.trend}","${m.subtext}"\n`;
        });

        csvContent += "\nUser Growth (30 Days)\nInterval,Active Users\n";
        const growth = AegisAnalyticsData.userGrowth["30d"];
        growth.labels.forEach((lbl, i) => {
            csvContent += `"${lbl}","${growth.values[i]}"\n`;
        });

        csvContent += "\nVault Breakdown (30 Days)\nInterval,Personal,Family,Business\n";
        const vaults = AegisAnalyticsData.vaultStatistics["30d"];
        vaults.labels.forEach((lbl, i) => {
            csvContent += `"${lbl}","${vaults.series.personal[i]}","${vaults.series.family[i]}","${vaults.series.business[i]}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `AegisVault_Analytics_Telemetry_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    function downloadJsonExport() {
        const exportObj = {
            exportTimestamp: new Date().toISOString(),
            protocol: "AegisVault Custody Protocol",
            overview: AegisAnalyticsData.overviewMetrics,
            userGrowth: AegisAnalyticsData.userGrowth,
            vaultStatistics: AegisAnalyticsData.vaultStatistics,
            userDistribution: AegisAnalyticsData.userDistribution,
            geographicDistribution: AegisAnalyticsData.geographicDistribution,
            securityOverview: AegisAnalyticsData.securityOverview,
            systemUsageTrends: AegisAnalyticsData.systemUsageTrends,
            recentActivity: AegisAnalyticsData.recentActivity
        };

        const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
        const link = document.createElement("a");
        link.setAttribute("href", jsonStr);
        link.setAttribute("download", `AegisVault_Analytics_Telemetry_${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    /* ==========================================================================
       15. Dropdown Flyouts (Notifications & Profile)
       ========================================================================== */
    function initDropdowns() {
        // Notifications Toggle
        if (elements.btnNotifications && elements.notificationsDropdown) {
            elements.btnNotifications.addEventListener("click", (e) => {
                e.stopPropagation();
                if (elements.profileDropdown) elements.profileDropdown.classList.remove("active");
                elements.notificationsDropdown.classList.toggle("active");
            });
        }

        // Profile Toggle
        if (elements.btnProfile && elements.profileDropdown) {
            elements.btnProfile.addEventListener("click", (e) => {
                e.stopPropagation();
                if (elements.notificationsDropdown) elements.notificationsDropdown.classList.remove("active");
                elements.profileDropdown.classList.toggle("active");
            });
        }

        // Close dropdowns on outside click
        document.addEventListener("click", () => {
            if (elements.notificationsDropdown) elements.notificationsDropdown.classList.remove("active");
            if (elements.profileDropdown) elements.profileDropdown.classList.remove("active");
        });
    }

    /* ==========================================================================
       16. Mobile Sidebar Drawer Toggle
       ========================================================================== */
    function initMobileSidebar() {
        if (!elements.btnHamburger || !elements.appSidebar || !elements.sidebarBackdrop) return;

        function toggleSidebar() {
            elements.appSidebar.classList.toggle("active");
            elements.sidebarBackdrop.classList.toggle("active");
        }

        function closeSidebar() {
            elements.appSidebar.classList.remove("active");
            elements.sidebarBackdrop.classList.remove("active");
        }

        elements.btnHamburger.addEventListener("click", toggleSidebar);
        elements.sidebarBackdrop.addEventListener("click", closeSidebar);
    }

    /* ==========================================================================
       17. Period Filter Select Dropdowns
       ========================================================================== */
    function initPeriodFilters() {
        // User Growth Period
        if (elements.selectUserGrowthRange) {
            elements.selectUserGrowthRange.addEventListener("change", (e) => {
                state.userGrowthPeriod = e.target.value;
                renderUserGrowthChart(state.userGrowthPeriod);
                showToast(`User Growth filtered for ${e.target.selectedOptions[0].text}`, "info");
            });
        }

        // Vault Statistics Period
        if (elements.selectVaultPeriod) {
            elements.selectVaultPeriod.addEventListener("change", (e) => {
                state.vaultStatsPeriod = e.target.value;
                renderVaultStatsChart(state.vaultStatsPeriod);
                showToast(`Vault Statistics filtered for ${e.target.selectedOptions[0].text}`, "info");
            });
        }

        // System Usage Period
        if (elements.selectUsagePeriod) {
            elements.selectUsagePeriod.addEventListener("change", (e) => {
                state.usagePeriod = e.target.value;
                renderSystemUsageTrends(state.usagePeriod);
                showToast(`System Usage Trends filtered for ${e.target.selectedOptions[0].text}`, "info");
            });
        }

        // Security Overview Period
        const selectSec = document.getElementById("select-sec-period");
        if (selectSec) {
            selectSec.addEventListener("change", (e) => {
                showToast(`Security Overview filtered for ${e.target.selectedOptions[0].text}`, "info");
            });
        }

        // Geographic Country Filter
        const selectGeo = document.getElementById("select-geo-country");
        if (selectGeo) {
            selectGeo.addEventListener("change", (e) => {
                showToast(`Geographic telemetry filtered for ${e.target.selectedOptions[0].text}`, "info");
            });
        }
    }

    /* ==========================================================================
       18. Re-render All Charts (called on init & theme change)
       ========================================================================== */
    function renderAllCharts() {
        renderUserGrowthChart(state.userGrowthPeriod);
        renderVaultStatsChart(state.vaultStatsPeriod);
        renderUserDistributionDonut();
        renderSystemUsageTrends(state.usagePeriod);
    }

    /* ==========================================================================
       19. Initialization Routine
       ========================================================================== */
    function init() {
        // Apply persisted theme
        applyTheme(state.theme);

        // Render Static Content
        renderOverviewMetrics();
        renderGeographicDistribution();
        renderSecurityOverview();
        renderRecentActivityTable();

        // Render Charts
        renderAllCharts();

        // Event Handlers
        if (elements.btnThemeToggle) {
            elements.btnThemeToggle.addEventListener("click", toggleTheme);
        }

        initGlobalSearch();
        initDateRangePicker();
        initExportModal();
        initDropdowns();
        initMobileSidebar();
        initPeriodFilters();

        // Window resize debounce for responsive SVG recalculation if needed
        window.addEventListener("resize", () => {
            renderAllCharts();
        });
    }

    // Run on DOM ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    // Expose global namespace for inline actions
    window.AegisAnalytics = {
        showToast,
        applyTheme,
        toggleTheme,
        renderAllCharts
    };

})();
