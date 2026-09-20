/**
 * AegisVault Admin Dashboard Module — Core Controller, Charts & UI Interactions
 * 
 * Simple, self-contained JavaScript for the Admin Dashboard:
 * - Dual theme system (Light / Dark) with background image switching & persistence
 * - Interactive SVG Charts (User Growth line chart, Vault Activity bar chart, Role & Category donuts)
 * - Recent Users and Security Events tables
 * - System Health indicators and Pending Actions list
 * - Global search, notifications, profile menu, and mobile drawer
 * - Detail modals and simulated report generation
 * - Live clock and toast notification alerts
 */

const AegisDashboard = {
    THEME_KEY: 'aegisvault_theme',
    activeModal: null,
    userGrowthTimeframe: '6m',
    vaultActivityTimeframe: '6m',

    init() {
        // 1. Initialize UI Controls & Theme
        this.initTheme();
        this.initSearch();
        this.initDropdowns();
        this.initMobileDrawer();
        this.initModals();
        this.initKeyboardShortcuts();
        this.initSidebarNav();

        // 2. Initialize Data Tables & Sections
        this.renderRecentUsersTable();
        this.renderSecurityEventsTable();
        this.renderPendingActionsList();
        this.renderSystemHealthList();
        this.bindActionButtons();
        this.startLiveClock();

        // 3. Initialize Interactive Charts
        this.initCharts();
    },

    /* =========================================================================
       1. Dual Theme System
       ========================================================================= */
    initTheme() {
        const toggleBtn = document.getElementById('btn-theme-toggle');
        const savedTheme = localStorage.getItem(this.THEME_KEY) || 'light';

        this.applyTheme(savedTheme, false);

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                this.applyTheme(newTheme, true);
            });
        }
    },

    applyTheme(theme, showNotice = false) {
        const isDark = theme === 'dark';
        document.documentElement.setAttribute('data-theme', theme);

        if (isDark) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
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

        // Re-render charts to adapt colors to the active theme
        this.reRenderAllCharts();

        if (showNotice) {
            this.showToast(`Switched to ${isDark ? 'Dark Theme' : 'Light Theme'}`, 'info');
        }
    },

    isDark() {
        return document.body.classList.contains('dark-theme');
    },

    /* =========================================================================
       2. SVG Charts Engine (User Growth, Vault Activity, Donut Charts)
       ========================================================================= */
    initCharts() {
        this.renderUserGrowthChart();
        this.renderVaultActivityChart();
        this.renderUserRoleDistributionDonut();
        this.renderVaultCategoriesDonut();
        this.bindChartFilterDropdowns();
    },

    reRenderAllCharts() {
        this.renderUserGrowthChart();
        this.renderVaultActivityChart();
        this.renderUserRoleDistributionDonut();
        this.renderVaultCategoriesDonut();
    },

    // User Growth Line Chart (SVG with smooth cubic bezier curves & gradient fill)
    renderUserGrowthChart() {
        const container = document.getElementById('user-growth-chart-wrap');
        if (!container || !window.AegisMockData || !AegisMockData.userGrowth) return;

        const data = AegisMockData.userGrowth[this.userGrowthTimeframe];
        const isDark = this.isDark();

        const width = 520;
        const height = 210;
        const padLeft = 45;
        const padRight = 20;
        const padTop = 15;
        const padBottom = 35;

        const chartW = width - padLeft - padRight;
        const chartH = height - padTop - padBottom;

        const minVal = data.min;
        const maxVal = data.max;
        const valRange = maxVal - minVal;

        // Grid lines & Y-axis labels
        const gridSteps = [0, 100, 200, 300, 400];
        let gridLinesSvg = '';
        gridSteps.forEach(val => {
            const y = padTop + chartH - ((val - minVal) / valRange) * chartH;
            const strokeColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0';
            const textColor = isDark ? '#8EA2AE' : '#94A3B8';
            gridLinesSvg += `
                <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="${strokeColor}" stroke-dasharray="3 3" stroke-width="1" />
                <text x="${padLeft - 10}" y="${y + 4}" fill="${textColor}" font-size="10.5" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="end">${val}</text>
            `;
        });

        // Compute coordinate points
        const points = data.values.map((v, i) => {
            const x = padLeft + (i / (data.values.length - 1)) * chartW;
            const y = padTop + chartH - ((v - minVal) / valRange) * chartH;
            return { x, y, value: v, label: data.labels[i] };
        });

        // Generate smooth cubic bezier curve
        let linePathD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            const controlX1 = current.x + (next.x - current.x) * 0.45;
            const controlY1 = current.y;
            const controlX2 = current.x + (next.x - current.x) * 0.55;
            const controlY2 = next.y;
            linePathD += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${next.x} ${next.y}`;
        }

        const areaPathD = `${linePathD} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;

        const strokeColor = isDark ? '#F5A84B' : '#E86326';
        const gradTopColor = isDark ? 'rgba(245, 168, 75, 0.35)' : 'rgba(232, 99, 38, 0.28)';
        const gradBottomColor = isDark ? 'rgba(245, 168, 75, 0.01)' : 'rgba(232, 99, 38, 0.0)';
        const dotBorderColor = isDark ? '#081B24' : '#FFFFFF';

        // X-axis labels
        let xLabelsSvg = '';
        points.forEach(p => {
            const textColor = isDark ? '#8EA2AE' : '#64748B';
            xLabelsSvg += `
                <text x="${p.x}" y="${height - 10}" fill="${textColor}" font-size="11" font-weight="500" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="middle">${p.label}</text>
            `;
        });

        // Hover dots
        let dotsSvg = '';
        points.forEach(p => {
            dotsSvg += `
                <g class="chart-point-group" tabindex="0" data-value="${p.value}" data-label="${p.label}" data-x="${p.x}" data-y="${p.y}">
                    <circle cx="${p.x}" cy="${p.y}" r="6.5" fill="${strokeColor}" stroke="${dotBorderColor}" stroke-width="2.5" class="chart-dot-ring" />
                    <circle cx="${p.x}" cy="${p.y}" r="15" fill="transparent" class="chart-dot-hitarea" />
                </g>
            `;
        });

        container.innerHTML = `
            <svg viewBox="0 0 ${width} ${height}" class="aegis-chart-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="User growth line chart">
                <defs>
                    <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="${gradTopColor}" />
                        <stop offset="100%" stop-color="${gradBottomColor}" />
                    </linearGradient>
                </defs>
                ${gridLinesSvg}
                <path d="${areaPathD}" fill="url(#userGrowthGrad)" />
                <path d="${linePathD}" fill="none" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                ${xLabelsSvg}
                ${dotsSvg}
            </svg>
        `;

        // Bind interactive point hover events
        container.querySelectorAll('.chart-point-group').forEach(el => {
            el.addEventListener('mouseenter', (e) => {
                const val = el.getAttribute('data-value');
                const lbl = el.getAttribute('data-label');
                this.showChartTooltip(e, `${lbl}: ${Number(val).toLocaleString()} active users`);
            });
            el.addEventListener('mousemove', (e) => this.positionChartTooltip(e));
            el.addEventListener('mouseleave', () => this.hideChartTooltip());
        });
    },

    // Vault Activity Grouped Bar Chart
    renderVaultActivityChart() {
        const container = document.getElementById('vault-activity-chart-wrap');
        if (!container || !window.AegisMockData || !AegisMockData.vaultActivity) return;

        const data = AegisMockData.vaultActivity[this.vaultActivityTimeframe];
        const isDark = this.isDark();

        const width = 520;
        const height = 210;
        const padLeft = 45;
        const padRight = 20;
        const padTop = 15;
        const padBottom = 35;

        const chartW = width - padLeft - padRight;
        const chartH = height - padTop - padBottom;

        const maxVal = data.max;

        // Grid lines & Y-axis labels
        const gridSteps = [0, 50, 100, 150, 200];
        let gridLinesSvg = '';
        gridSteps.forEach(val => {
            const y = padTop + chartH - (val / maxVal) * chartH;
            const strokeColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0';
            const textColor = isDark ? '#8EA2AE' : '#94A3B8';
            gridLinesSvg += `
                <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="${strokeColor}" stroke-dasharray="3 3" stroke-width="1" />
                <text x="${padLeft - 10}" y="${y + 4}" fill="${textColor}" font-size="10.5" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="end">${val}</text>
            `;
        });

        // Grouped bars calculation
        const groupCount = data.labels.length;
        const groupW = chartW / groupCount;
        const barW = Math.min(10, groupW * 0.22);
        const barGap = 3;

        const colorCreated = isDark ? '#38BDF8' : '#2563EB';
        const colorAccessed = isDark ? '#34D399' : '#059669';
        const colorReleased = isDark ? '#F5A84B' : '#E86326';

        let barsSvg = '';
        let xLabelsSvg = '';

        data.labels.forEach((label, i) => {
            const groupCenterX = padLeft + i * groupW + groupW / 2;
            const totalBarsW = 3 * barW + 2 * barGap;
            const startX = groupCenterX - totalBarsW / 2;

            const valCreated = data.created[i];
            const valAccessed = data.accessed[i];
            const valReleased = data.released[i];

            const hCreated = (valCreated / maxVal) * chartH;
            const hAccessed = (valAccessed / maxVal) * chartH;
            const hReleased = (valReleased / maxVal) * chartH;

            const yCreated = padTop + chartH - hCreated;
            const yAccessed = padTop + chartH - hAccessed;
            const yReleased = padTop + chartH - hReleased;

            barsSvg += `
                <g class="bar-group" data-label="${label}">
                    <rect x="${startX}" y="${yCreated}" width="${barW}" height="${hCreated}" rx="2" fill="${colorCreated}" class="chart-bar" data-type="Created" data-val="${valCreated}" />
                    <rect x="${startX + barW + barGap}" y="${yAccessed}" width="${barW}" height="${hAccessed}" rx="2" fill="${colorAccessed}" class="chart-bar" data-type="Accessed" data-val="${valAccessed}" />
                    <rect x="${startX + (barW + barGap) * 2}" y="${yReleased}" width="${barW}" height="${hReleased}" rx="2" fill="${colorReleased}" class="chart-bar" data-type="Released" data-val="${valReleased}" />
                </g>
            `;

            const textColor = isDark ? '#8EA2AE' : '#64748B';
            xLabelsSvg += `
                <text x="${groupCenterX}" y="${height - 10}" fill="${textColor}" font-size="11" font-weight="500" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="middle">${label}</text>
            `;
        });

        container.innerHTML = `
            <svg viewBox="0 0 ${width} ${height}" class="aegis-chart-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Vault activity grouped bar chart">
                ${gridLinesSvg}
                ${barsSvg}
                ${xLabelsSvg}
            </svg>
        `;

        container.querySelectorAll('.chart-bar').forEach(bar => {
            bar.addEventListener('mouseenter', (e) => {
                const group = bar.closest('.bar-group').getAttribute('data-label');
                const type = bar.getAttribute('data-type');
                const val = bar.getAttribute('data-val');
                this.showChartTooltip(e, `${group} — ${type}: ${val} vaults`);
            });
            bar.addEventListener('mousemove', (e) => this.positionChartTooltip(e));
            bar.addEventListener('mouseleave', () => this.hideChartTooltip());
        });
    },

    // User Role Distribution Donut Chart
    renderUserRoleDistributionDonut() {
        try {
            const svgEl = document.getElementById('user-role-donut-svg');
            const legendEl = document.getElementById('user-role-legend-list');
            if (!svgEl || !legendEl || !window.AegisMockData) return;

            const roleData = AegisMockData.userRoleDistribution || AegisMockData.userRoles;
            if (!roleData) return;

            const segments = Array.isArray(roleData) ? roleData : roleData.segments;
            if (!segments || segments.length === 0) return;

            const total = (roleData && roleData.total) ? roleData.total : segments.reduce((acc, curr) => acc + (curr.count || curr.value || 0), 0);
            const isDark = this.isDark();

            const radius = 48;
            const circumference = 2 * Math.PI * radius;
            let cumulativePercent = 0;

            let circlesSvg = `
                <svg class="donut-chart-svg" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="${radius}" fill="transparent" stroke="${isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9'}" stroke-width="18" />
            `;

            let legendHtml = '';

            segments.forEach(item => {
                const count = item.count !== undefined ? item.count : (item.value !== undefined ? item.value : 0);
                const pct = item.percent !== undefined ? item.percent : (total > 0 ? (count / total) * 100 : 0);
                const color = isDark && item.darkColor ? item.darkColor : item.color;
                const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((cumulativePercent / 100) * circumference);

                circlesSvg += `
                    <circle cx="70" cy="70" r="${radius}" fill="transparent" stroke="${color}" stroke-width="18"
                            stroke-dasharray="${strokeDasharray}" stroke-dashoffset="${strokeDashoffset}"
                            transform="rotate(-90 70 70)"
                            class="donut-slice" data-label="${item.label}" data-value="${count}" data-percent="${Math.round(pct)}%" />
                `;

                cumulativePercent += pct;

                legendHtml += `
                    <div class="donut-legend-item">
                        <span class="legend-color-dot" style="background-color: ${color};"></span>
                        <span class="legend-label-text">${item.label}</span>
                        <span class="legend-value-text">${Math.round(pct)}% (${count.toLocaleString()})</span>
                    </div>
                `;
            });

            circlesSvg += `</svg>`;
            svgEl.innerHTML = circlesSvg;
            legendEl.innerHTML = legendHtml;

            svgEl.querySelectorAll('.donut-slice').forEach(seg => {
                seg.addEventListener('mouseenter', (e) => {
                    const lbl = seg.getAttribute('data-label');
                    const val = seg.getAttribute('data-value');
                    const pct = seg.getAttribute('data-percent');
                    this.showChartTooltip(e, `${lbl}: ${pct} (${val} users)`);
                });
                seg.addEventListener('mousemove', (e) => this.positionChartTooltip(e));
                seg.addEventListener('mouseleave', () => this.hideChartTooltip());
            });
        } catch (err) {
            console.error('Error rendering User Role Distribution Donut:', err);
        }
    },

    // Vault Categories Donut Chart
    renderVaultCategoriesDonut() {
        try {
            const svgEl = document.getElementById('vault-categories-donut-svg');
            const legendEl = document.getElementById('vault-categories-legend-list');
            if (!svgEl || !legendEl || !window.AegisMockData) return;

            const catData = AegisMockData.vaultCategories;
            if (!catData) return;

            const segments = Array.isArray(catData) ? catData : catData.segments;
            if (!segments || segments.length === 0) return;

            const total = (catData && catData.total) ? catData.total : segments.reduce((acc, curr) => acc + (curr.count || curr.value || 0), 0);
            const isDark = this.isDark();

            const radius = 48;
            const circumference = 2 * Math.PI * radius;
            let cumulativePercent = 0;

            let circlesSvg = `
                <svg class="donut-chart-svg" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="${radius}" fill="transparent" stroke="${isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9'}" stroke-width="18" />
            `;

            let legendHtml = '';

            segments.forEach(item => {
                const count = item.count !== undefined ? item.count : (item.value !== undefined ? item.value : 0);
                const pct = item.percent !== undefined ? item.percent : (total > 0 ? (count / total) * 100 : 0);
                const color = isDark && item.darkColor ? item.darkColor : item.color;
                const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((cumulativePercent / 100) * circumference);

                circlesSvg += `
                    <circle cx="70" cy="70" r="${radius}" fill="transparent" stroke="${color}" stroke-width="18"
                            stroke-dasharray="${strokeDasharray}" stroke-dashoffset="${strokeDashoffset}"
                            transform="rotate(-90 70 70)"
                            class="donut-slice" data-label="${item.label}" data-value="${count}" data-percent="${Math.round(pct)}%" />
                `;

                cumulativePercent += pct;

                legendHtml += `
                    <div class="donut-legend-item">
                        <span class="legend-color-dot" style="background-color: ${color};"></span>
                        <span class="legend-label-text">${item.label}</span>
                        <span class="legend-value-text">${Math.round(pct)}% (${count.toLocaleString()})</span>
                    </div>
                `;
            });

            circlesSvg += `</svg>`;
            svgEl.innerHTML = circlesSvg;
            legendEl.innerHTML = legendHtml;

            svgEl.querySelectorAll('.donut-slice').forEach(seg => {
                seg.addEventListener('mouseenter', (e) => {
                    const lbl = seg.getAttribute('data-label');
                    const val = seg.getAttribute('data-value');
                    const pct = seg.getAttribute('data-percent');
                    this.showChartTooltip(e, `${lbl}: ${pct} (${val} vaults)`);
                });
                seg.addEventListener('mousemove', (e) => this.positionChartTooltip(e));
                seg.addEventListener('mouseleave', () => this.hideChartTooltip());
            });
        } catch (err) {
            console.error('Error rendering Vault Categories Donut:', err);
        }
    },

    bindChartFilterDropdowns() {
        const userGrowthSelect = document.getElementById('user-growth-timeframe');
        if (userGrowthSelect) {
            userGrowthSelect.addEventListener('change', (e) => {
                this.userGrowthTimeframe = e.target.value;
                this.renderUserGrowthChart();
                this.showToast(`User Growth filter set to ${e.target.options[e.target.selectedIndex].text}`, 'info');
            });
        }

        const vaultActSelect = document.getElementById('vault-activity-timeframe');
        if (vaultActSelect) {
            vaultActSelect.addEventListener('change', (e) => {
                this.vaultActivityTimeframe = e.target.value;
                this.renderVaultActivityChart();
                this.showToast(`Vault Activity filter set to ${e.target.options[e.target.selectedIndex].text}`, 'info');
            });
        }
    },

    /* =========================================================================
       3. Tooltip Helper for Charts
       ========================================================================= */
    showChartTooltip(e, text) {
        let tooltip = document.getElementById('aegis-chart-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'aegis-chart-tooltip';
            tooltip.className = 'aegis-chart-tooltip';
            document.body.appendChild(tooltip);
        }
        tooltip.textContent = text;
        tooltip.style.display = 'block';
        this.positionChartTooltip(e);
    },

    positionChartTooltip(e) {
        const tooltip = document.getElementById('aegis-chart-tooltip');
        if (!tooltip) return;
        const x = e.clientX + 12;
        const y = e.clientY - 28;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    },

    hideChartTooltip() {
        const tooltip = document.getElementById('aegis-chart-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    },

    /* =========================================================================
       4. Global Search System
       ========================================================================= */
    initSearch() {
        const input = document.getElementById('global-search-input');
        const dropdown = document.getElementById('search-results-dropdown');
        if (!input || !dropdown || !window.AegisMockData || !AegisMockData.searchIndex) return;

        input.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (!query) {
                dropdown.classList.remove('active');
                return;
            }

            const results = AegisMockData.searchIndex.filter(item => 
                item.title.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                item.snippet.toLowerCase().includes(query)
            );

            if (results.length === 0) {
                dropdown.innerHTML = `
                    <div class="search-empty-state">
                        No matches found for "<strong>${this.escapeHtml(query)}</strong>"
                    </div>
                `;
            } else {
                dropdown.innerHTML = results.map(item => `
                    <div class="search-result-item" data-type="${item.type}" data-id="${item.id}">
                        <div class="search-result-col">
                            <div class="search-result-title">${this.escapeHtml(item.title)}</div>
                            <div class="search-result-snippet">${this.escapeHtml(item.snippet)}</div>
                        </div>
                        <span class="search-result-badge">${this.escapeHtml(item.category)}</span>
                    </div>
                `).join('');

                dropdown.querySelectorAll('.search-result-item').forEach(el => {
                    el.addEventListener('click', () => {
                        const type = el.getAttribute('data-type');
                        const id = el.getAttribute('data-id');
                        this.handleSearchResultClick(type, id);
                        dropdown.classList.remove('active');
                        input.value = '';
                    });
                });
            }

            dropdown.classList.add('active');
        });

        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    },

    handleSearchResultClick(type, id) {
        if (type === 'user') {
            const user = AegisMockData.recentUsers.find(u => u.id === id);
            if (user) this.showUserModal(user);
        } else if (type === 'event') {
            const event = AegisMockData.recentSecurityEvents.find(e => e.id === id);
            if (event) this.showEventModal(event);
        } else if (type === 'service') {
            const service = AegisMockData.systemHealth.find(s => s.id === id);
            if (service) this.showServiceModal(service);
        } else if (type === 'nav') {
            this.showToast(`Navigating to ${id}...`, 'info');
        }
    },

    /* =========================================================================
       5. Header Dropdowns & Mobile Navigation Drawer
       ========================================================================= */
    initDropdowns() {
        const notifBtn = document.getElementById('btn-notifications');
        const notifDropdown = document.getElementById('notifications-dropdown');
        const profileBtn = document.getElementById('user-profile-btn');
        const profileDropdown = document.getElementById('profile-dropdown');

        if (notifBtn && notifDropdown) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (profileDropdown) profileDropdown.classList.remove('active');
                notifDropdown.classList.toggle('active');
            });
        }

        if (profileBtn && profileDropdown) {
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (notifDropdown) notifDropdown.classList.remove('active');
                profileDropdown.classList.toggle('active');
            });
        }

        document.addEventListener('click', () => {
            if (notifDropdown) notifDropdown.classList.remove('active');
            if (profileDropdown) profileDropdown.classList.remove('active');
        });

        this.renderNotificationsList();

        const markReadBtn = document.getElementById('btn-mark-all-read');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', () => {
                if (AegisMockData.notifications) {
                    AegisMockData.notifications.forEach(n => n.unread = false);
                    this.renderNotificationsList();
                }
                const indicator = document.getElementById('notif-badge-indicator');
                if (indicator) indicator.style.display = 'none';
                this.showToast('All notifications marked as read', 'info');
            });
        }
    },

    renderNotificationsList() {
        const container = document.getElementById('notifications-list-container');
        if (!container || !window.AegisMockData || !AegisMockData.notifications) return;

        const notifs = AegisMockData.notifications;
        const unreadCount = notifs.filter(n => n.unread).length;
        const indicator = document.getElementById('notif-badge-indicator');
        if (indicator) {
            indicator.style.display = unreadCount > 0 ? 'block' : 'none';
            indicator.textContent = unreadCount > 0 ? unreadCount : '';
        }

        container.innerHTML = notifs.map(n => `
            <div class="notification-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
                <div class="notification-dot ${n.type}"></div>
                <div class="notification-content">
                    <div class="notification-title">${this.escapeHtml(n.title)}</div>
                    <div class="notification-message">${this.escapeHtml(n.message)}</div>
                    <div class="notification-time">${this.escapeHtml(n.time)}</div>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                item.classList.remove('unread');
                const id = item.getAttribute('data-id');
                const match = notifs.find(n => n.id === id);
                if (match) match.unread = false;
                this.showToast(`Viewing: ${item.querySelector('.notification-title').textContent}`, 'info');
            });
        });
    },

    initMobileDrawer() {
        const hamburgerBtn = document.getElementById('btn-mobile-menu');
        const sidebar = document.getElementById('app-sidebar');
        const backdrop = document.getElementById('sidebar-backdrop');

        if (hamburgerBtn && sidebar && backdrop) {
            hamburgerBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                backdrop.classList.toggle('active');
            });

            backdrop.addEventListener('click', () => {
                sidebar.classList.remove('open');
                backdrop.classList.remove('active');
            });
        }
    },

    initSidebarNav() {
        const navLinks = document.querySelectorAll('.nav-link-item');
        const sidebar = document.getElementById('app-sidebar');
        const backdrop = document.getElementById('sidebar-backdrop');

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (sidebar && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    if (backdrop) backdrop.classList.remove('active');
                }

                const target = link.getAttribute('data-target');
                if (target === 'dashboard') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    },

    /* =========================================================================
       6. Modals System & Trigger Handlers
       ========================================================================= */
    initModals() {
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal-overlay');
                if (modal) this.closeModal(modal.id);
            });
        });

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(overlay.id);
                }
            });
        });

        const reportForm = document.getElementById('generate-report-form');
        if (reportForm) {
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.closeModal('generate-report-modal');
                this.showToast('Generating Comprehensive Governance & Custody Report (PDF/CSV)...', 'success');
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

    showUserModal(user) {
        const modal = document.getElementById('user-detail-modal');
        if (!modal) return;

        document.getElementById('modal-user-avatar').textContent = user.avatar;
        document.getElementById('modal-user-name').textContent = user.name;
        document.getElementById('modal-user-email').textContent = user.email;
        document.getElementById('modal-user-role').textContent = user.role;
        document.getElementById('modal-user-status').textContent = user.status;
        document.getElementById('modal-user-joined').textContent = user.joined;
        document.getElementById('modal-user-vaults').textContent = user.vaultCount;
        document.getElementById('modal-user-trustees').textContent = user.trusteesCount;
        document.getElementById('modal-user-tier').textContent = user.accountTier;
        document.getElementById('modal-user-heartbeat').textContent = user.lastHeartbeat;

        this.openModal('user-detail-modal');
    },

    showEventModal(event) {
        const modal = document.getElementById('event-detail-modal');
        if (!modal) return;

        document.getElementById('modal-event-title').textContent = event.event;
        document.getElementById('modal-event-time').textContent = event.time;
        document.getElementById('modal-event-severity').textContent = event.severity;
        document.getElementById('modal-event-severity').className = `severity-badge ${event.severityType}`;
        document.getElementById('modal-event-ip').textContent = event.ip;
        document.getElementById('modal-event-location').textContent = event.location;
        document.getElementById('modal-event-user').textContent = event.user;
        document.getElementById('modal-event-details').textContent = event.details;

        this.openModal('event-detail-modal');
    },

    showServiceModal(service) {
        const modal = document.getElementById('service-detail-modal');
        if (!modal) return;

        document.getElementById('modal-service-name').textContent = service.name;
        document.getElementById('modal-service-status').textContent = service.status;
        document.getElementById('modal-service-latency').textContent = service.latency;
        document.getElementById('modal-service-uptime').textContent = service.uptime;
        document.getElementById('modal-service-details').textContent = service.details;

        this.openModal('service-detail-modal');
    },

    showReportModal() {
        this.openModal('generate-report-modal');
    },

    showAllUsersModal() {
        const tbody = document.getElementById('all-users-tbody');
        if (tbody && window.AegisMockData && AegisMockData.recentUsers) {
            tbody.innerHTML = AegisMockData.recentUsers.map(u => `
                <tr>
                    <td>
                        <div class="user-cell">
                            <span class="avatar-circle ${u.avatarColor}">${u.avatar}</span>
                            <span class="user-cell-name">${u.name}</span>
                        </div>
                    </td>
                    <td>${u.email}</td>
                    <td><span class="role-tag">${u.role}</span></td>
                    <td><span class="status-pill status-${u.statusType}"><span>${u.status}</span></span></td>
                    <td>${u.joined}</td>
                    <td>${u.vaultCount}</td>
                </tr>
            `).join('');
        }
        this.openModal('all-users-modal');
    },

    showAllEventsModal() {
        const tbody = document.getElementById('all-events-tbody');
        if (tbody && window.AegisMockData && AegisMockData.recentSecurityEvents) {
            tbody.innerHTML = AegisMockData.recentSecurityEvents.map(e => `
                <tr>
                    <td>${e.time}</td>
                    <td><strong>${e.event}</strong></td>
                    <td><span class="severity-badge ${e.severityType}">${e.severity}</span></td>
                    <td>${e.ip}</td>
                    <td>${e.location}</td>
                    <td>${e.details}</td>
                </tr>
            `).join('');
        }
        this.openModal('all-events-modal');
    },

    /* =========================================================================
       7. Data Tables & Card Lists
       ========================================================================= */
    renderRecentUsersTable() {
        const tbody = document.getElementById('recent-users-tbody');
        if (!tbody || !window.AegisMockData || !AegisMockData.recentUsers) return;

        const users = AegisMockData.recentUsers;
        tbody.innerHTML = users.map(u => {
            let statusIcon = '';
            if (u.statusType === 'active') {
                statusIcon = `<svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            } else if (u.statusType === 'pending') {
                statusIcon = `<svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
            } else {
                statusIcon = `<svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
            }

            return `
                <tr class="table-row-clickable" data-user-id="${u.id}" title="Click to inspect user details">
                    <td>
                        <div class="user-profile-cell">
                            <span class="user-avatar-badge ${u.avatarColor}">${u.avatar}</span>
                            <span class="user-name-cell">${u.name}</span>
                        </div>
                    </td>
                    <td class="text-secondary">${u.email}</td>
                    <td><span class="role-text">${u.role}</span></td>
                    <td>
                        <span class="status-pill status-${u.statusType}">
                            ${statusIcon}
                            <span>${u.status}</span>
                        </span>
                    </td>
                    <td class="text-secondary">${u.joined}</td>
                </tr>
            `;
        }).join('');

        tbody.querySelectorAll('.table-row-clickable').forEach(row => {
            row.addEventListener('click', () => {
                const id = row.getAttribute('data-user-id');
                const user = users.find(u => u.id === id);
                if (user) this.showUserModal(user);
            });
        });
    },

    renderSecurityEventsTable() {
        const tbody = document.getElementById('recent-security-events-tbody');
        if (!tbody || !window.AegisMockData || !AegisMockData.recentSecurityEvents) return;

        const events = AegisMockData.recentSecurityEvents;
        tbody.innerHTML = events.map(e => {
            let sevIcon = '';
            if (e.severityType === 'high') {
                sevIcon = `<svg class="sev-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
            } else if (e.severityType === 'medium') {
                sevIcon = `<svg class="sev-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
            } else {
                sevIcon = `<svg class="sev-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
            }

            return `
                <tr class="table-row-clickable" data-event-id="${e.id}" title="Click to view event forensic details">
                    <td class="text-secondary">${e.time}</td>
                    <td class="event-title-cell">${e.event}</td>
                    <td>
                        <span class="severity-pill sev-${e.severityType}">
                            ${sevIcon}
                            <span>${e.severity}</span>
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.querySelectorAll('.table-row-clickable').forEach(row => {
            row.addEventListener('click', () => {
                const id = row.getAttribute('data-event-id');
                const event = events.find(item => item.id === id);
                if (event) this.showEventModal(event);
            });
        });
    },

    renderPendingActionsList() {
        try {
            const container = document.getElementById('pending-actions-list-container') || document.getElementById('pending-actions-list');
            if (!container || !window.AegisMockData || !AegisMockData.pendingActions) return;

            const actions = AegisMockData.pendingActions;
            container.innerHTML = actions.map(act => {
                let iconSvg = '';
                const iconKey = act.icon || act.iconType || '';
                if (iconKey === 'user-check') {
                    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>`;
                } else if (iconKey === 'shield-alert' || iconKey.includes('shield')) {
                    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
                } else if (iconKey === 'key') {
                    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7.5" cy="15.5" r="5.5"></circle><path d="m21 2-9.6 9.6"></path><path d="m15.5 7.5 3 3"></path></svg>`;
                } else if (iconKey === 'clock') {
                    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
                } else if (iconKey === 'alert-triangle' || iconKey.includes('alert')) {
                    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
                } else {
                    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`;
                }

                const colorClass = act.badgeColor || act.colorClass || 'act-blue';

                return `
                    <div class="pending-action-item" data-action-id="${act.id}" tabindex="0" role="button" aria-label="${act.title}">
                        <div class="pending-action-left">
                            <div class="action-icon-box ${colorClass}">
                                ${iconSvg}
                            </div>
                            <span class="action-title-text">${act.title}</span>
                        </div>
                        <div class="pending-action-right">
                            <span class="action-count-text">${act.count}</span>
                            <svg class="action-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>
                    </div>
                `;
            }).join('');

            container.querySelectorAll('.pending-action-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.getAttribute('data-action-id');
                    const action = actions.find(a => a.id === id);
                    if (action) this.showToast(`Triaging: ${action.title} (${action.count} items)`, 'info');
                });
            });
        } catch (err) {
            console.error('Error rendering Pending Actions:', err);
        }
    },

    renderSystemHealthList() {
        try {
            const container = document.getElementById('system-health-services-list') || document.getElementById('system-health-list');
            if (!container || !window.AegisMockData || !AegisMockData.systemHealth) return;

            const services = AegisMockData.systemHealth;
            container.innerHTML = services.map(s => {
                let svcIcon = '';
                const iconKey = s.icon || s.id || '';
                if (iconKey.includes('db') || iconKey === 'database') {
                    svcIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`;
                } else if (iconKey.includes('app') || iconKey === 'server') {
                    svcIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;
                } else if (iconKey.includes('workers') || iconKey === 'cpu') {
                    svcIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>`;
                } else if (iconKey.includes('email') || iconKey === 'mail') {
                    svcIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
                } else if (iconKey.includes('storage') || iconKey === 'hard-drive') {
                    svcIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="12" x2="2" y2="12"></line><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path><line x1="6" y1="16" x2="6.01" y2="16"></line><line x1="10" y1="16" x2="10.01" y2="16"></line></svg>`;
                } else {
                    svcIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
                }

                return `
                    <div class="service-status-row" data-service-id="${s.id}" tabindex="0" role="button" aria-label="${s.name} ${s.status}" title="Click to view ${s.name} telemetry">
                        <div class="service-info-col">
                            <span class="service-icon-wrap">${svcIcon}</span>
                            <span class="service-name-text">${s.name}</span>
                        </div>
                        <div class="service-badge-col">
                            <span class="service-status-dot"></span>
                            <span class="service-status-label">${s.status}</span>
                        </div>
                    </div>
                `;
            }).join('');

            container.querySelectorAll('.service-status-row').forEach(row => {
                row.addEventListener('click', () => {
                    const id = row.getAttribute('data-service-id');
                    const service = services.find(s => s.id === id);
                    if (service) this.showServiceModal(service);
                });
            });
        } catch (err) {
            console.error('Error rendering System Health list:', err);
        }
    },

    bindActionButtons() {
        const btnGenerateReport = document.getElementById('btn-generate-report');
        if (btnGenerateReport) {
            btnGenerateReport.addEventListener('click', () => this.showReportModal());
        }

        const linkViewUsers = document.getElementById('link-view-all-users') || document.getElementById('btn-view-all-users');
        if (linkViewUsers) {
            linkViewUsers.addEventListener('click', () => {
                window.location.href = '../User Management/index.html';
            });
        }

        const linkViewEvents = document.getElementById('link-view-all-events') || document.getElementById('btn-view-all-events');
        if (linkViewEvents) {
            linkViewEvents.addEventListener('click', () => {
                window.location.href = '../Audit Logs/index.html';
            });
        }

        const linkViewHealth = document.getElementById('link-view-health-details') || document.getElementById('btn-view-health-details');
        if (linkViewHealth) {
            linkViewHealth.addEventListener('click', (e) => {
                e.preventDefault();
                const srv = window.AegisMockData && AegisMockData.systemHealth ? AegisMockData.systemHealth[0] : null;
                if (srv) this.showServiceModal(srv);
                this.showToast('System Health Diagnostics: All 6 microservices fully operational', 'success');
            });
        }

        const linkViewPending = document.getElementById('link-view-all-actions') || document.getElementById('btn-view-all-pending');
        if (linkViewPending) {
            linkViewPending.addEventListener('click', (e) => {
                e.preventDefault();
                this.showToast('Navigating to Pending Verifications Queue...', 'info');
            });
        }
    },

    startLiveClock() {
        const dateEl = document.getElementById('hero-live-date');
        const timeEl = document.getElementById('hero-live-time');
        const clockEl = document.getElementById('current-live-time');
        if (!dateEl && !timeEl && !clockEl) return;

        const updateClock = () => {
            const now = new Date();
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const dayName = days[now.getDay()];
            const date = now.getDate();
            const month = months[now.getMonth()];
            const year = now.getFullYear();
            
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;

            if (dateEl) dateEl.textContent = `${dayName}, ${date} ${month} ${year}`;
            if (timeEl) timeEl.textContent = `${hours}:${minutes} ${ampm}`;
            if (clockEl) clockEl.textContent = `${dayName}, ${date} ${month} ${year} ${hours}:${minutes} ${ampm}`;
        };

        updateClock();
        setInterval(updateClock, 30000);
    },

    /* =========================================================================
       8. Toast Notification System
       ========================================================================= */
    showToast(message, type = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type}`;
        toast.innerHTML = `
            <div class="toast-message">${this.escapeHtml(message)}</div>
            <button class="toast-close-btn" aria-label="Close">&times;</button>
        `;

        toast.querySelector('.toast-close-btn').addEventListener('click', () => {
            toast.remove();
        });

        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('toast-fadeout');
                setTimeout(() => toast.remove(), 250);
            }
        }, 3600);
    },

    /* =========================================================================
       9. Keyboard Shortcuts
       ========================================================================= */
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC closes modal or search dropdown
            if (e.key === 'Escape') {
                if (this.activeModal) {
                    this.closeModal(this.activeModal);
                }
                const dropdown = document.getElementById('search-results-dropdown');
                if (dropdown) dropdown.classList.remove('active');
                const notifDropdown = document.getElementById('notifications-dropdown');
                if (notifDropdown) notifDropdown.classList.remove('active');
                const profileDropdown = document.getElementById('profile-dropdown');
                if (profileDropdown) profileDropdown.classList.remove('active');
            }

            // "/" focuses search
            if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && 
                document.activeElement.tagName !== 'INPUT' && 
                document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                const input = document.getElementById('global-search-input');
                if (input) {
                    input.focus();
                    input.select();
                }
            }

            // "t" toggles theme
            if ((e.key === 't' || e.key === 'T') && 
                document.activeElement.tagName !== 'INPUT' && 
                document.activeElement.tagName !== 'TEXTAREA') {
                const btn = document.getElementById('btn-theme-toggle');
                if (btn) btn.click();
            }
        });
    },

    escapeHtml(str) {
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
window.AegisCharts = AegisDashboard;
window.AegisInteractions = AegisDashboard;

document.addEventListener('DOMContentLoaded', () => {
    AegisDashboard.init();
});
