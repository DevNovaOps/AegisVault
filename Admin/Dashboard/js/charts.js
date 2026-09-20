/**
 * AegisVault Admin Dashboard Module — Interactive SVG Charts Engine
 * Pure SVG responsive charts: User Growth line chart, Vault Activity grouped bar chart,
 * and User Role & Vault Category donut charts with tooltips and theme adaptability.
 */

const AegisCharts = {
    userGrowthTimeframe: '6m',
    vaultActivityTimeframe: '6m',

    init() {
        this.renderUserGrowthChart();
        this.renderVaultActivityChart();
        this.renderUserRoleDistributionDonut();
        this.renderVaultCategoriesDonut();
        this.bindFilterDropdowns();
    },

    isDark() {
        return document.body.classList.contains('dark-theme');
    },

    // 1. User Growth Line Chart
    renderUserGrowthChart() {
        const container = document.getElementById('user-growth-chart-wrap');
        if (!container) return;

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

        // Compute points
        const points = data.values.map((v, i) => {
            const x = padLeft + (i / (data.values.length - 1)) * chartW;
            const y = padTop + chartH - ((v - minVal) / valRange) * chartH;
            return { x, y, value: v, label: data.labels[i] };
        });

        // Path generator with smooth cubic bezier curves
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

        // Area path for gradient fill
        const areaPathD = `${linePathD} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;

        // Colors
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

        // Data point circles with hover events
        let dotsSvg = '';
        points.forEach((p, idx) => {
            dotsSvg += `
                <g class="chart-point-group" tabindex="0" data-value="${p.value}" data-label="${p.label}" data-x="${p.x}" data-y="${p.y}">
                    <circle cx="${p.x}" cy="${p.y}" r="6.5" fill="${strokeColor}" stroke="${dotBorderColor}" stroke-width="2.5" class="chart-dot-ring" />
                    <circle cx="${p.x}" cy="${p.y}" r="14" fill="transparent" class="chart-hit-target" />
                </g>
            `;
        });

        const svgHtml = `
            <svg class="interactive-chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="userGrowthAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="${gradTopColor}" />
                        <stop offset="100%" stop-color="${gradBottomColor}" />
                    </linearGradient>
                    <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${strokeColor}" flood-opacity="0.3" />
                    </filter>
                </defs>

                <!-- Gridlines -->
                <g class="chart-grid">${gridLinesSvg}</g>

                <!-- Area Fill -->
                <path d="${areaPathD}" fill="url(#userGrowthAreaGrad)" class="chart-area-path" />

                <!-- Line Path -->
                <path d="${linePathD}" fill="none" stroke="${strokeColor}" stroke-width="2.6" stroke-linecap="round" filter="url(#lineGlow)" class="chart-line-path" />

                <!-- X Axis Labels -->
                <g class="chart-x-labels">${xLabelsSvg}</g>

                <!-- Interactive Points -->
                <g class="chart-points">${dotsSvg}</g>
            </svg>
        `;

        container.innerHTML = svgHtml;
        this.attachPointTooltips(container, 'New Users');
    },

    // 2. Vault Activity Grouped Bar Chart
    renderVaultActivityChart() {
        const container = document.getElementById('vault-activity-chart-wrap');
        if (!container) return;

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

        // Gridlines
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

        // Colors matching legend: Created (Blue), Accessed (Teal), Released (Orange)
        const colCreated = isDark ? '#38BDF8' : '#3B82F6';
        const colAccessed = isDark ? '#00D9A5' : '#10B981';
        const colReleased = isDark ? '#F5A84B' : '#E86326';

        const clusterCount = data.labels.length;
        const clusterWidth = chartW / clusterCount;
        const barWidth = 7.5;
        const barSpacing = 2.5;

        let barsSvg = '';
        let xLabelsSvg = '';

        data.labels.forEach((month, i) => {
            const clusterCenterX = padLeft + (i + 0.5) * clusterWidth;
            const startX = clusterCenterX - (3 * barWidth + 2 * barSpacing) / 2;

            const hCreated = (data.created[i] / maxVal) * chartH;
            const hAccessed = (data.accessed[i] / maxVal) * chartH;
            const hReleased = (data.released[i] / maxVal) * chartH;

            const yCreated = padTop + chartH - hCreated;
            const yAccessed = padTop + chartH - hAccessed;
            const yReleased = padTop + chartH - hReleased;

            barsSvg += `
                <!-- Created -->
                <rect x="${startX}" y="${yCreated}" width="${barWidth}" height="${hCreated}" rx="2.5" fill="${colCreated}" class="chart-bar" data-tooltip="${month} — Created: ${data.created[i]}" />
                <!-- Accessed -->
                <rect x="${startX + barWidth + barSpacing}" y="${yAccessed}" width="${barWidth}" height="${hAccessed}" rx="2.5" fill="${colAccessed}" class="chart-bar" data-tooltip="${month} — Accessed: ${data.accessed[i]}" />
                <!-- Released -->
                <rect x="${startX + (barWidth + barSpacing) * 2}" y="${yReleased}" width="${barWidth}" height="${hReleased}" rx="2.5" fill="${colReleased}" class="chart-bar" data-tooltip="${month} — Released: ${data.released[i]}" />
            `;

            const textColor = isDark ? '#8EA2AE' : '#64748B';
            xLabelsSvg += `
                <text x="${clusterCenterX}" y="${height - 10}" fill="${textColor}" font-size="11" font-weight="500" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="middle">${month}</text>
            `;
        });

        const svgHtml = `
            <svg class="interactive-chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
                <g class="chart-grid">${gridLinesSvg}</g>
                <g class="chart-bars">${barsSvg}</g>
                <g class="chart-x-labels">${xLabelsSvg}</g>
            </svg>
        `;

        container.innerHTML = svgHtml;
        this.attachBarTooltips(container);
    },

    // 3. User Role Distribution Donut Chart
    renderUserRoleDistributionDonut() {
        const svgContainer = document.getElementById('user-role-donut-svg');
        const legendContainer = document.getElementById('user-role-legend-list');
        if (!svgContainer) return;

        const data = AegisMockData.userRoleDistribution;
        const isDark = this.isDark();

        const size = 180;
        const center = size / 2;
        const radius = 62;
        const strokeWidth = 20;
        const circumference = 2 * Math.PI * radius;

        let currentOffset = 0;
        let slicesSvg = '';

        data.segments.forEach(seg => {
            const segLength = (seg.percent / 100) * circumference;
            const dashArray = `${segLength} ${circumference - segLength}`;
            const dashOffset = -currentOffset;
            const sliceColor = isDark ? seg.darkColor : seg.color;

            slicesSvg += `
                <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${sliceColor}" stroke-width="${strokeWidth}" stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}" class="donut-slice" data-label="${seg.label}" data-percent="${seg.percent}%" data-count="${seg.count}" />
            `;
            currentOffset += segLength;
        });

        const textColor = isDark ? '#FFFFFF' : '#0B192C';
        const labelColor = isDark ? '#8EA2AE' : '#64748B';

        svgContainer.innerHTML = `
            <svg viewBox="0 0 ${size} ${size}" class="donut-chart-svg">
                <g transform="rotate(-90 ${center} ${center})">
                    ${slicesSvg}
                </g>
                <!-- Center Text -->
                <text x="${center}" y="${center - 2}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="20" fill="${textColor}">${data.total.toLocaleString()}</text>
                <text x="${center}" y="${center + 18}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="500" font-size="12" fill="${labelColor}">${data.totalLabel}</text>
            </svg>
        `;

        if (legendContainer) {
            legendContainer.innerHTML = data.segments.map(seg => {
                const color = isDark ? seg.darkColor : seg.color;
                return `
                    <div class="donut-legend-item">
                        <span class="legend-color-dot" style="background-color: ${color};"></span>
                        <span class="legend-label-text">${seg.label}</span>
                        <span class="legend-value-text">${seg.percent}% (${seg.count})</span>
                    </div>
                `;
            }).join('');
        }

        this.attachDonutTooltips(svgContainer);
    },

    // 4. Vault Categories Donut Chart
    renderVaultCategoriesDonut() {
        const svgContainer = document.getElementById('vault-categories-donut-svg');
        const legendContainer = document.getElementById('vault-categories-legend-list');
        if (!svgContainer) return;

        const data = AegisMockData.vaultCategories;
        const isDark = this.isDark();

        const size = 180;
        const center = size / 2;
        const radius = 62;
        const strokeWidth = 20;
        const circumference = 2 * Math.PI * radius;

        let currentOffset = 0;
        let slicesSvg = '';

        data.segments.forEach(seg => {
            const segLength = (seg.percent / 100) * circumference;
            const dashArray = `${segLength} ${circumference - segLength}`;
            const dashOffset = -currentOffset;
            const sliceColor = isDark ? seg.darkColor : seg.color;

            slicesSvg += `
                <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${sliceColor}" stroke-width="${strokeWidth}" stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}" class="donut-slice" data-label="${seg.label}" data-percent="${seg.percent}%" data-count="${seg.count}" />
            `;
            currentOffset += segLength;
        });

        const textColor = isDark ? '#FFFFFF' : '#0B192C';
        const labelColor = isDark ? '#8EA2AE' : '#64748B';

        svgContainer.innerHTML = `
            <svg viewBox="0 0 ${size} ${size}" class="donut-chart-svg">
                <g transform="rotate(-90 ${center} ${center})">
                    ${slicesSvg}
                </g>
                <!-- Center Text -->
                <text x="${center}" y="${center - 2}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="20" fill="${textColor}">${data.total.toLocaleString()}</text>
                <text x="${center}" y="${center + 18}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="500" font-size="12" fill="${labelColor}">${data.totalLabel}</text>
            </svg>
        `;

        if (legendContainer) {
            legendContainer.innerHTML = data.segments.map(seg => {
                const color = isDark ? seg.darkColor : seg.color;
                return `
                    <div class="donut-legend-item">
                        <span class="legend-color-dot" style="background-color: ${color};"></span>
                        <span class="legend-label-text">${seg.label}</span>
                        <span class="legend-value-text">${seg.percent}% (${seg.count})</span>
                    </div>
                `;
            }).join('');
        }

        this.attachDonutTooltips(svgContainer);
    },

    // 5. Tooltip Event Binders
    attachPointTooltips(container, metricName) {
        container.querySelectorAll('.chart-point-group').forEach(el => {
            el.addEventListener('mouseenter', (e) => {
                const val = el.getAttribute('data-value');
                const label = el.getAttribute('data-label');
                AegisInteractions.showChartTooltip(e, `${label}: ${val} ${metricName}`);
            });
            el.addEventListener('mousemove', (e) => {
                AegisInteractions.positionChartTooltip(e);
            });
            el.addEventListener('mouseleave', () => {
                AegisInteractions.hideChartTooltip();
            });
        });
    },

    attachBarTooltips(container) {
        container.querySelectorAll('.chart-bar').forEach(bar => {
            bar.addEventListener('mouseenter', (e) => {
                const text = bar.getAttribute('data-tooltip');
                AegisInteractions.showChartTooltip(e, text);
            });
            bar.addEventListener('mousemove', (e) => {
                AegisInteractions.positionChartTooltip(e);
            });
            bar.addEventListener('mouseleave', () => {
                AegisInteractions.hideChartTooltip();
            });
        });
    },

    attachDonutTooltips(container) {
        container.querySelectorAll('.donut-slice').forEach(slice => {
            slice.addEventListener('mouseenter', (e) => {
                const label = slice.getAttribute('data-label');
                const pct = slice.getAttribute('data-percent');
                const count = slice.getAttribute('data-count');
                AegisInteractions.showChartTooltip(e, `${label}: ${pct} (${count})`);
            });
            slice.addEventListener('mousemove', (e) => {
                AegisInteractions.positionChartTooltip(e);
            });
            slice.addEventListener('mouseleave', () => {
                AegisInteractions.hideChartTooltip();
            });
        });
    },

    // 6. Timeframe Filter Dropdowns
    bindFilterDropdowns() {
        const growthSelect = document.getElementById('user-growth-timeframe');
        if (growthSelect) {
            growthSelect.addEventListener('change', (e) => {
                this.userGrowthTimeframe = e.target.value;
                this.renderUserGrowthChart();
            });
        }

        const vaultSelect = document.getElementById('vault-activity-timeframe');
        if (vaultSelect) {
            vaultSelect.addEventListener('change', (e) => {
                this.vaultActivityTimeframe = e.target.value;
                this.renderVaultActivityChart();
            });
        }
    },

    // Re-render when theme changes
    reRenderAll() {
        this.renderUserGrowthChart();
        this.renderVaultActivityChart();
        this.renderUserRoleDistributionDonut();
        this.renderVaultCategoriesDonut();
    }
};

window.AegisCharts = AegisCharts;
