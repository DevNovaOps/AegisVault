/**
 * AegisVault System Health Module — Core Controller, SVG Sparklines & UI Interactions
 * 
 * Simple, self-contained JavaScript for the System Health Module:
 * - Dual theme system (Light / Dark) with background image switching & persistence
 * - Interactive SVG Sparkline Area Charts (CPU, Memory, Disk, Network I/O)
 * - Service Status table rendering with telemetry detail modals
 * - Resource timeframe filtering (Last 24 Hours, Last 1 Hour, Last 7 Days)
 * - Recent System Events log & Event Forensic Modal
 * - System Information specifications grid
 * - Simulated Health Refresh & live timestamp ticker
 * - Global search, notifications, profile menu, and mobile drawer
 * - Accessible toasts and keyboard shortcuts
 */

const AegisSystemHealth = {
    THEME_KEY: 'aegisvault_theme',
    activeModal: null,
    resourceTimeframe: '24h',

    init() {
        // 1. Re-render sparkline charts when global admin theme switches
        window.addEventListener('aegis:themechange', () => {
            this.renderAllResourceCharts();
        });

        // 2. Initialize Module UI Controls
        this.initSearch();
        this.initModals();

        // 3. Initialize Data Tables & Sections
        this.renderServicesTable();
        this.renderRecentEventsTable();
        this.renderSystemInfo();
        this.bindActionButtons();

        // 4. Initialize Interactive Resource Charts
        this.initResourceCharts();
    },

    isDark() {
        return document.documentElement.getAttribute('data-theme') === 'dark' || document.body.classList.contains('dark-theme');
    },


    /* =========================================================================
       2. SVG Sparkline Area Charts (CPU, Memory, Disk, Network I/O)
       ========================================================================= */
    initResourceCharts() {
        this.renderAllResourceCharts();
        this.bindTimeframeSelect();
    },

    renderAllResourceCharts() {
        const mock = window.AegisHealthMockData;
        if (!mock || !mock.resourceUsage || !mock.resourceUsage[this.resourceTimeframe]) return;

        const tfData = mock.resourceUsage[this.resourceTimeframe];
        this.renderAreaSparkline('chart-cpu-svg', tfData.cpu, 'CPU Usage', '%');
        this.renderAreaSparkline('chart-memory-svg', tfData.memory, 'Memory Usage', '%');
        this.renderAreaSparkline('chart-disk-svg', tfData.disk, 'Disk Usage', '%');
        this.renderAreaSparkline('chart-network-svg', tfData.network, 'Network I/O', ' MB/s');

        // Update current values on labels
        const cpuVal = document.getElementById('val-cpu-current');
        if (cpuVal) cpuVal.textContent = tfData.cpu.current;

        const memVal = document.getElementById('val-memory-current');
        if (memVal) memVal.textContent = tfData.memory.current;

        const diskVal = document.getElementById('val-disk-current');
        if (diskVal) diskVal.textContent = tfData.disk.current;

        const netVal = document.getElementById('val-network-current');
        if (netVal) netVal.textContent = tfData.network.current;
    },

    renderAreaSparkline(svgId, metricData, metricName, unit) {
        try {
            const container = document.getElementById(svgId);
            if (!container) return;

            const isDark = this.isDark();
            const color = isDark && metricData.colorDark ? metricData.colorDark : metricData.color;

            const width = 230;
            const height = 75;
            const padLeft = 32;
            const padRight = 8;
            const padTop = 8;
            const padBottom = 20;

            const chartW = width - padLeft - padRight;
            const chartH = height - padTop - padBottom;

            const pts = metricData.dataPoints;
            const minVal = metricData.min;
            const maxVal = metricData.max;
            const valRange = maxVal - minVal || 1;

            // Compute Coordinates
            const coords = pts.map((val, idx) => {
                const x = padLeft + (idx / (pts.length - 1)) * chartW;
                const y = padTop + chartH - ((val - minVal) / valRange) * chartH;
                return { x, y, val };
            });

            // Smooth cubic spline SVG path
            let linePath = `M ${coords[0].x} ${coords[0].y}`;
            for (let i = 0; i < coords.length - 1; i++) {
                const p0 = coords[i === 0 ? i : i - 1];
                const p1 = coords[i];
                const p2 = coords[i + 1];
                const p3 = coords[i + 2] || p2;

                const cp1x = p1.x + (p2.x - p0.x) / 6;
                const cp1y = p1.y + (p2.y - p0.y) / 6;
                const cp2x = p2.x - (p3.x - p1.x) / 6;
                const cp2y = p2.y - (p3.y - p1.y) / 6;

                linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
            }

            // Closed area path for gradient fill
            const lastX = coords[coords.length - 1].x;
            const zeroY = padTop + chartH;
            const areaPath = `${linePath} L ${lastX} ${zeroY} L ${coords[0].x} ${zeroY} Z`;

            // Y Axis Grid lines & Ticks
            const axisColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0';
            const textColor = isDark ? '#526775' : '#94A3B8';
            let yAxisSvg = '';
            const yTicks = metricData.yTicks;
            const tickStep = chartH / (yTicks.length - 1);

            yTicks.forEach((tickLabel, idx) => {
                const y = padTop + idx * tickStep;
                yAxisSvg += `
                    <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="${axisColor}" stroke-dasharray="2 2" stroke-width="0.8" />
                    <text x="${padLeft - 6}" y="${y + 3}" fill="${textColor}" font-size="8.5" font-family="'JetBrains Mono', monospace" text-anchor="end">${tickLabel}</text>
                `;
            });

            // X Axis Labels
            let xAxisSvg = '';
            const xLabels = metricData.xLabels;
            xLabels.forEach((label, idx) => {
                const x = padLeft + (idx / (xLabels.length - 1)) * chartW;
                xAxisSvg += `
                    <text x="${x}" y="${height - 4}" fill="${textColor}" font-size="8" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="middle">${label}</text>
                `;
            });

            const gradId = `grad-${svgId}`;

            container.innerHTML = `
                <svg class="sparkline-svg" viewBox="0 0 ${width} ${height}">
                    <defs>
                        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="${color}" stop-opacity="${isDark ? '0.35' : '0.22'}" />
                            <stop offset="100%" stop-color="${color}" stop-opacity="0.0" />
                        </linearGradient>
                    </defs>

                    <!-- Background Grid -->
                    ${yAxisSvg}

                    <!-- Area Fill -->
                    <path d="${areaPath}" fill="url(#${gradId})" />

                    <!-- Stroke Curve -->
                    <path d="${linePath}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />

                    <!-- Interactive Data Points -->
                    ${coords.map((pt, i) => `
                        <circle cx="${pt.x}" cy="${pt.y}" r="3" fill="${color}" stroke="${isDark ? '#06151E' : '#FFFFFF'}" stroke-width="1.5"
                                class="sparkline-dot" data-val="${pt.val}${unit}" data-label="${metricData.xLabels[Math.min(i, metricData.xLabels.length - 1)]}" style="cursor:pointer;" />
                    `).join('')}

                    <!-- X Axis -->
                    ${xAxisSvg}
                </svg>
            `;

            container.querySelectorAll('.sparkline-dot').forEach(dot => {
                dot.addEventListener('mouseenter', (e) => {
                    const val = dot.getAttribute('data-val');
                    const lbl = dot.getAttribute('data-label');
                    this.showChartTooltip(e, `${metricName} at ${lbl}: ${val}`);
                });
                dot.addEventListener('mousemove', (e) => this.positionChartTooltip(e));
                dot.addEventListener('mouseleave', () => this.hideChartTooltip());
            });
        } catch (err) {
            console.error('Error rendering Area Sparkline:', err);
        }
    },

    bindTimeframeSelect() {
        const select = document.getElementById('resource-timeframe-select');
        if (select) {
            select.addEventListener('change', (e) => {
                this.resourceTimeframe = e.target.value;
                this.renderAllResourceCharts();
                this.showToast(`Resource usage period set to ${e.target.options[e.target.selectedIndex].text}`, 'info');
            });
        }
    },

    showChartTooltip(e, text) {
        let tooltip = document.getElementById('health-chart-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'health-chart-tooltip';
            tooltip.className = 'health-chart-tooltip';
            document.body.appendChild(tooltip);
        }
        tooltip.textContent = text;
        tooltip.style.display = 'block';
        this.positionChartTooltip(e);
    },

    positionChartTooltip(e) {
        const tooltip = document.getElementById('health-chart-tooltip');
        if (!tooltip) return;
        const x = e.clientX + 12;
        const y = e.clientY - 28;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    },

    hideChartTooltip() {
        const tooltip = document.getElementById('health-chart-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    },

    /* =========================================================================
       3. Service Status Table & Modals
       ========================================================================= */
    renderServicesTable() {
        try {
            const tbody = document.getElementById('services-table-tbody');
            const mock = window.AegisHealthMockData;
            if (!tbody || !mock || !mock.services) return;

            tbody.innerHTML = mock.services.map(s => {
                let iconSvg = '';
                if (s.icon === 'globe') {
                    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
                } else if (s.icon === 'code') {
                    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`;
                } else if (s.icon === 'database') {
                    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`;
                } else if (s.icon === 'key') {
                    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7.5" cy="15.5" r="5.5"></circle><path d="m21 2-9.6 9.6"></path><path d="m15.5 7.5 3 3"></path></svg>`;
                } else if (s.icon === 'mail') {
                    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
                } else if (s.icon === 'cloud-backup') {
                    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 18a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4"></path><path d="M12 2v10"></path><polyline points="8 8 12 12 16 8"></polyline></svg>`;
                } else if (s.icon === 'folder') {
                    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;
                } else {
                    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>`;
                }

                return `
                    <tr class="table-row-clickable" data-service-id="${s.id}" title="Click to view ${s.name} telemetry & specifications">
                        <td>
                            <div class="service-name-cell">
                                <span class="service-row-icon">${iconSvg}</span>
                                <span>${s.name}</span>
                            </div>
                        </td>
                        <td>
                            <span class="status-badge-pill badge-operational">
                                <span class="status-badge-dot"></span>
                                <span>${s.status}</span>
                            </span>
                        </td>
                        <td class="mono-stat">${s.uptime}</td>
                        <td class="mono-stat">${s.responseTime}</td>
                        <td class="mono-stat">${s.lastChecked}</td>
                    </tr>
                `;
            }).join('');

            tbody.querySelectorAll('.table-row-clickable').forEach(row => {
                row.addEventListener('click', () => {
                    const id = row.getAttribute('data-service-id');
                    const service = mock.services.find(item => item.id === id);
                    if (service) this.showServiceModal(service);
                });
            });
        } catch (err) {
            console.error('Error rendering Services Table:', err);
        }
    },

    showServiceModal(service) {
        const modal = document.getElementById('service-detail-modal');
        if (!modal) return;

        document.getElementById('modal-service-name').textContent = service.name;
        document.getElementById('modal-service-status').textContent = service.status;
        document.getElementById('modal-service-uptime').textContent = service.uptime;
        document.getElementById('modal-service-latency').textContent = service.responseTime;
        document.getElementById('modal-service-version').textContent = service.version;
        document.getElementById('modal-service-requests').textContent = service.requests;
        document.getElementById('modal-service-error-rate').textContent = service.errorRate;
        document.getElementById('modal-service-desc').textContent = service.description;

        this.openModal('service-detail-modal');
    },

    /* =========================================================================
       4. Recent System Events Table & Modals
       ========================================================================= */
    renderRecentEventsTable() {
        try {
            const tbody = document.getElementById('recent-events-tbody');
            const mock = window.AegisHealthMockData;
            if (!tbody || !mock || !mock.recentEvents) return;

            tbody.innerHTML = mock.recentEvents.map(evt => {
                let badgeClass = 'level-info';
                if (evt.levelType === 'warn') badgeClass = 'level-warn';
                if (evt.levelType === 'error') badgeClass = 'level-error';

                return `
                    <tr class="table-row-clickable" data-event-id="${evt.id}" title="Click to inspect event forensic trace">
                        <td class="mono-stat text-secondary">${evt.time}</td>
                        <td><span class="event-level-badge ${badgeClass}">${evt.level}</span></td>
                        <td><span style="font-weight: 600; color: var(--text-heading);">${evt.service}</span></td>
                        <td class="event-msg-text">${evt.message}</td>
                    </tr>
                `;
            }).join('');

            tbody.querySelectorAll('.table-row-clickable').forEach(row => {
                row.addEventListener('click', () => {
                    const id = row.getAttribute('data-event-id');
                    const event = mock.recentEvents.find(item => item.id === id);
                    if (event) this.showEventModal(event);
                });
            });
        } catch (err) {
            console.error('Error rendering Recent Events Table:', err);
        }
    },

    showEventModal(event) {
        const modal = document.getElementById('event-detail-modal');
        if (!modal) return;

        document.getElementById('modal-event-title').textContent = event.message;
        document.getElementById('modal-event-time').textContent = event.time;
        document.getElementById('modal-event-level').textContent = event.level;
        document.getElementById('modal-event-service').textContent = event.service;
        document.getElementById('modal-event-detail').textContent = event.detail;

        this.openModal('event-detail-modal');
    },

    /* =========================================================================
       5. System Information Grid
       ========================================================================= */
    renderSystemInfo() {
        try {
            const col1 = document.getElementById('system-info-col1');
            const col2 = document.getElementById('system-info-col2');
            const mock = window.AegisHealthMockData;
            if (!col1 || !col2 || !mock || !mock.systemInfo) return;

            col1.innerHTML = mock.systemInfo.col1.map(item => `
                <div class="info-spec-item">
                    <span class="info-spec-label">${item.label}</span>
                    <span class="info-spec-value">${item.value}</span>
                </div>
            `).join('');

            col2.innerHTML = mock.systemInfo.col2.map(item => `
                <div class="info-spec-item">
                    <span class="info-spec-label">${item.label}</span>
                    <span class="info-spec-value">${item.value}</span>
                </div>
            `).join('');
        } catch (err) {
            console.error('Error rendering System Info:', err);
        }
    },

    /* =========================================================================
       6. Action Handlers & Simulated Refresh
       ========================================================================= */
    bindActionButtons() {
        // Hero Status Banner & All Services link click triggers health check sweep
        const statusBanner = document.getElementById('hero-status-banner');
        if (statusBanner) {
            statusBanner.addEventListener('click', () => this.simulateHealthRefresh());
        }

        const linkAllServices = document.getElementById('link-all-services');
        if (linkAllServices) {
            linkAllServices.addEventListener('click', () => this.simulateHealthRefresh());
        }

        // Server Details modal trigger
        const linkServerDetails = document.getElementById('link-server-details');
        if (linkServerDetails) {
            linkServerDetails.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal('server-detail-modal');
            });
        }

        // View All Events
        const linkAllEvents = document.getElementById('link-view-all-events');
        if (linkAllEvents) {
            linkAllEvents.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '../Audit Logs/audit-logs.html';
            });
        }
    },

    simulateHealthRefresh() {
        this.showToast('Initiating cryptographic system health check sweep...', 'info');

        const banner = document.getElementById('hero-status-banner');
        if (banner) banner.style.opacity = '0.6';

        setTimeout(() => {
            if (banner) banner.style.opacity = '1';

            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;

            const timeStr = `${hours}:${minutes} ${ampm}`;
            const fullDateStr = `12 Sep 2025, ${timeStr}`;

            const updatedEl = document.getElementById('hero-status-updated-text');
            if (updatedEl) updatedEl.textContent = `Last updated: ${fullDateStr}`;

            // Update last checked on table rows
            document.querySelectorAll('#services-table-tbody td:last-child').forEach(td => {
                td.textContent = `12 Sep, ${timeStr}`;
            });

            this.showToast('System health refreshed • All 9 services fully operational (99.8% SLA)', 'success');
        }, 650);
    },

    startLiveClock() {
        const update = () => {
            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            const timeStr = `${hours}:${minutes} ${ampm}`;

            const timeEl = document.getElementById('hero-live-clock');
            if (timeEl) timeEl.textContent = timeStr;
        };

        update();
        setInterval(update, 30000);
    },

    /* =========================================================================
       7. Global Search
       ========================================================================= */
    initSearch() {
        const input = document.getElementById('global-header-search');
        const dropdown = document.getElementById('search-results-dropdown');
        const mock = window.AegisHealthMockData;
        if (!input || !dropdown || !mock || !mock.searchIndex) return;

        input.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (!query) {
                dropdown.classList.remove('active');
                return;
            }

            const results = mock.searchIndex.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                item.snippet.toLowerCase().includes(query)
            );

            if (results.length === 0) {
                dropdown.innerHTML = `
                    <div class="search-empty-state">
                        No services or events found for "<strong>${this.escapeHtml(query)}</strong>"
                    </div>
                `;
            } else {
                dropdown.innerHTML = results.map(item => `
                    <div class="search-result-item" data-type="${item.type}" data-id="${item.id}">
                        <div>
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
                        if (type === 'service') {
                            const service = mock.services.find(s => s.id === id);
                            if (service) this.showServiceModal(service);
                        } else if (type === 'event') {
                            const event = mock.recentEvents.find(evt => evt.id === id);
                            if (event) this.showEventModal(event);
                        } else {
                            this.openModal('server-detail-modal');
                        }
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

    /* =========================================================================
       9. Modals System
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

    /* =========================================================================
       10. Toast Notification System
       ========================================================================= */

    showToast(message, type = 'info') {
        if (window.AegisAdminCommon && typeof window.AegisAdminCommon.showToast === 'function') {
            window.AegisAdminCommon.showToast(message, type);
            return;
        }
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

window.AegisSystemHealth = AegisSystemHealth;
window.AegisInteractions = AegisSystemHealth;

document.addEventListener('DOMContentLoaded', () => {
    AegisSystemHealth.init();
});
