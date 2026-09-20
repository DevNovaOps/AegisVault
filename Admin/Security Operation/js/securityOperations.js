/**
 * AegisVault Security Operations Module - Core Security Operations Logic
 * Manages tables, gauges, chart rendering, and data manipulation.
 */

const AegisSecurityOps = {
    currentFilter: 'ALL',
    searchTerm: '',

    init() {
        this.renderStats();
        this.renderSecurityEvents();
        this.renderSystemHealth();
        this.renderFailedLoginChart();
        this.renderTopIPs();
        this.renderUserManagement();
        this.renderTrusteeManagement();
        this.setupTableEventListeners();
    },

    // 1. Statistics Cards
    renderStats() {
        const stats = AegisMockData.stats;
        // Total Users
        const usersCard = document.getElementById('stat-total-users');
        if (usersCard) {
            usersCard.querySelector('.stat-value').textContent = stats.totalUsers.value;
            usersCard.querySelector('.stat-trend').textContent = stats.totalUsers.change;
            usersCard.querySelector('.stat-subtext').textContent = stats.totalUsers.subtitle;
        }
        // Total Trustees
        const trusteesCard = document.getElementById('stat-total-trustees');
        if (trusteesCard) {
            trusteesCard.querySelector('.stat-value').textContent = stats.totalTrustees.value;
            trusteesCard.querySelector('.stat-trend').textContent = stats.totalTrustees.change;
            trusteesCard.querySelector('.stat-subtext').textContent = stats.totalTrustees.subtitle;
        }
        // Security Events
        const eventsCard = document.getElementById('stat-security-events');
        if (eventsCard) {
            eventsCard.querySelector('.stat-value').textContent = stats.securityEvents.value;
            eventsCard.querySelector('.stat-trend').textContent = stats.securityEvents.change;
            eventsCard.querySelector('.stat-subtext').textContent = stats.securityEvents.subtitle;
        }
        // Failed Login Attempts
        const failedCard = document.getElementById('stat-failed-logins');
        if (failedCard) {
            failedCard.querySelector('.stat-value').textContent = stats.failedLogins.value;
            failedCard.querySelector('.stat-trend').textContent = stats.failedLogins.change;
            failedCard.querySelector('.stat-subtext').textContent = stats.failedLogins.subtitle;
        }
        // System Uptime
        const uptimeCard = document.getElementById('stat-system-uptime');
        if (uptimeCard) {
            uptimeCard.querySelector('.stat-value').textContent = stats.systemUptime.value;
            uptimeCard.querySelector('.stat-subtext').textContent = stats.systemUptime.status;
        }
    },

    // 2. Recent Security Events Table
    renderSecurityEvents(filter = 'ALL', search = '') {
        const tbody = document.getElementById('security-events-tbody');
        if (!tbody) return;

        let events = AegisMockData.securityEvents;

        if (filter !== 'ALL') {
            events = events.filter(e => e.event === filter);
        }

        if (search) {
            const query = search.toLowerCase();
            events = events.filter(e =>
                e.user.toLowerCase().includes(query) ||
                e.event.toLowerCase().includes(query) ||
                e.details.toLowerCase().includes(query) ||
                e.status.toLowerCase().includes(query)
            );
        }

        // Limit to 8 rows for main dashboard table
        const displayEvents = events.slice(0, 8);

        if (displayEvents.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">
                        No matching security events found.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = displayEvents.map(e => `
            <tr data-event-id="${e.id}">
                <td>${e.time}</td>
                <td><span class="event-badge ${e.eventType}">${e.event}</span></td>
                <td><strong>${e.user}</strong></td>
                <td>${e.details}</td>
                <td>
                    <span class="status-indicator">
                        <span class="status-dot ${e.statusType}"></span>
                        ${e.status}
                    </span>
                </td>
            </tr>
        `).join('');

        // Attach click listener to each row for detail modal
        tbody.querySelectorAll('tr[data-event-id]').forEach(row => {
            row.addEventListener('click', () => {
                const eventId = row.getAttribute('data-event-id');
                const eventObj = AegisMockData.securityEvents.find(item => item.id === eventId);
                if (eventObj) {
                    this.showEventDetailModal(eventObj);
                }
            });
        });
    },

    showEventDetailModal(e) {
        const modal = document.getElementById('event-detail-modal');
        if (!modal) return;

        document.getElementById('modal-event-id').textContent = e.id;
        document.getElementById('modal-event-type').textContent = e.event;
        document.getElementById('modal-event-type').className = `event-badge ${e.eventType}`;
        document.getElementById('modal-event-time').textContent = e.time;
        document.getElementById('modal-event-user').textContent = `${e.user} (${e.userEmail})`;
        document.getElementById('modal-event-status').textContent = e.status;
        document.getElementById('modal-event-details').textContent = e.details;
        document.getElementById('modal-event-ip').textContent = e.ip;
        document.getElementById('modal-event-location').textContent = e.location;
        document.getElementById('modal-event-ua').textContent = e.userAgent;
        document.getElementById('modal-event-hash').textContent = e.hash;

        AegisInteractions.openModal('event-detail-modal');
    },

    // 3. System Health Gauges & Service List
    renderSystemHealth() {
        const gaugesContainer = document.getElementById('gauges-container');
        if (gaugesContainer) {
            const gauges = AegisMockData.systemHealth.gauges;
            // Radius = 24 -> Circumference = 2 * PI * 24 ≈ 150.8
            const circumference = 150.8;

            gaugesContainer.innerHTML = gauges.map(g => {
                const offset = circumference - (g.percent / 100) * circumference;
                return `
                    <div class="gauge-item">
                        <div class="gauge-circle-wrap">
                            <svg class="gauge-svg" viewBox="0 0 58 58">
                                <circle class="gauge-bg-circle" cx="29" cy="29" r="24"></circle>
                                <circle class="gauge-progress-circle" cx="29" cy="29" r="24"
                                    style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset};">
                                </circle>
                            </svg>
                            <span class="gauge-value-text">${g.value}</span>
                        </div>
                        <span class="gauge-label">${g.name}</span>
                    </div>
                `;
            }).join('');
        }

        const servicesContainer = document.getElementById('services-status-list');
        if (servicesContainer) {
            const services = AegisMockData.systemHealth.services;
            servicesContainer.innerHTML = services.map(s => `
                <div class="service-status-row" data-service-id="${s.id}">
                    <div class="service-name-left">
                        <svg class="service-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>${s.name}</span>
                    </div>
                    <span class="service-status-pill">${s.status}</span>
                </div>
            `).join('');

            servicesContainer.querySelectorAll('.service-status-row').forEach(row => {
                row.addEventListener('click', () => {
                    const sId = row.getAttribute('data-service-id');
                    const serviceObj = AegisMockData.systemHealth.services.find(item => item.id === sId);
                    if (serviceObj) {
                        this.showServiceStatusModal(serviceObj);
                    }
                });
            });
        }
    },

    showServiceStatusModal(s) {
        const modal = document.getElementById('service-status-modal');
        if (!modal) return;

        document.getElementById('modal-service-name').textContent = s.name;
        document.getElementById('modal-service-status').textContent = s.status;
        document.getElementById('modal-service-latency').textContent = s.latency;
        document.getElementById('modal-service-load').textContent = s.load;
        document.getElementById('modal-service-instances').textContent = s.instances;
        document.getElementById('modal-service-checked').textContent = s.lastChecked;
        document.getElementById('modal-service-desc').textContent = s.description;

        AegisInteractions.openModal('service-status-modal');
    },

    // 4. Failed Login Chart & Top IPs
    renderFailedLoginChart() {
        const barsWrap = document.getElementById('chart-bars-wrap');
        if (!barsWrap) return;

        const timeline = AegisMockData.failedLogins.chartTimeline;

        barsWrap.innerHTML = timeline.map(item => `
            <div class="chart-bar-col" title="${item.time}: ${item.attempts} attempts">
                <div class="chart-bar ${item.isPeak ? 'peak' : ''}" 
                     style="height: ${item.heightPct}%;"
                     data-time="${item.time}"
                     data-attempts="${item.attempts}">
                </div>
            </div>
        `).join('');

        barsWrap.querySelectorAll('.chart-bar').forEach(bar => {
            bar.addEventListener('mouseenter', (e) => {
                const time = bar.getAttribute('data-time');
                const attempts = bar.getAttribute('data-attempts');
                AegisInteractions.showTooltip(e, `${time}: ${attempts} failed attempts`);
            });
            bar.addEventListener('mouseleave', () => {
                AegisInteractions.hideTooltip();
            });
        });
    },

    renderTopIPs() {
        const container = document.getElementById('top-ips-container');
        if (!container) return;

        const ips = AegisMockData.failedLogins.topIPs;
        container.innerHTML = ips.map(ip => `
            <div class="top-ip-row" data-ip="${ip.ip}">
                <span class="top-ip-address">${ip.ip}</span>
                <span class="top-ip-attempts">${ip.attempts} attempts</span>
            </div>
        `).join('');

        container.querySelectorAll('.top-ip-row').forEach(row => {
            row.addEventListener('click', () => {
                const ipStr = row.getAttribute('data-ip');
                const ipObj = AegisMockData.failedLogins.topIPs.find(item => item.ip === ipStr);
                if (ipObj) {
                    this.showIPDetailModal(ipObj);
                }
            });
        });
    },

    showIPDetailModal(ip) {
        const modal = document.getElementById('ip-detail-modal');
        if (!modal) return;

        document.getElementById('modal-ip-address').textContent = ip.ip;
        document.getElementById('modal-ip-attempts').textContent = `${ip.attempts} Attempts (Past 24h)`;
        document.getElementById('modal-ip-location').textContent = ip.location;
        document.getElementById('modal-ip-isp').textContent = ip.isp;
        document.getElementById('modal-ip-first').textContent = ip.firstSeen;
        document.getElementById('modal-ip-last').textContent = ip.lastAttempt;
        document.getElementById('modal-ip-target').textContent = ip.targetAccount;
        document.getElementById('modal-ip-action').textContent = ip.recommendedAction;

        AegisInteractions.openModal('ip-detail-modal');
    },

    // 5. User Management Table
    renderUserManagement(search = '', statusFilter = 'ALL') {
        const tbody = document.getElementById('users-tbody');
        if (!tbody) return;

        let users = AegisMockData.users;

        if (statusFilter !== 'ALL') {
            users = users.filter(u => u.status === statusFilter);
        }

        if (search) {
            const query = search.toLowerCase();
            users = users.filter(u =>
                u.name.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query) ||
                u.status.toLowerCase().includes(query)
            );
        }

        const displayUsers = users.slice(0, 5);

        tbody.innerHTML = displayUsers.map(u => `
            <tr data-user-id="${u.id}">
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td>
                    <span class="status-indicator">
                        <span class="status-dot ${u.statusType}"></span>
                        ${u.status}
                    </span>
                </td>
                <td>${u.joined}</td>
            </tr>
        `).join('');

        tbody.querySelectorAll('tr[data-user-id]').forEach(row => {
            row.addEventListener('click', () => {
                const uId = row.getAttribute('data-user-id');
                const userObj = AegisMockData.users.find(item => item.id === uId);
                if (userObj) {
                    this.showUserProfileModal(userObj);
                }
            });
        });
    },

    showUserProfileModal(u) {
        const modal = document.getElementById('user-profile-modal');
        if (!modal) return;

        document.getElementById('modal-user-name').textContent = u.name;
        document.getElementById('modal-user-email').textContent = u.email;
        document.getElementById('modal-user-role').textContent = u.role;
        document.getElementById('modal-user-status').textContent = u.status;
        document.getElementById('modal-user-status').className = `status-dot ${u.statusType}`;
        document.getElementById('modal-user-joined').textContent = u.joined;
        document.getElementById('modal-user-vaults').textContent = u.vaultCount;
        document.getElementById('modal-user-trustees').textContent = u.trusteesCount;
        document.getElementById('modal-user-heartbeat').textContent = u.heartbeatStatus;

        AegisInteractions.openModal('user-profile-modal');
    },

    // 6. Trustee Management Table
    renderTrusteeManagement(search = '', statusFilter = 'ALL') {
        const tbody = document.getElementById('trustees-tbody');
        if (!tbody) return;

        let trustees = AegisMockData.trustees;

        if (statusFilter !== 'ALL') {
            trustees = trustees.filter(t => t.status === statusFilter);
        }

        if (search) {
            const query = search.toLowerCase();
            trustees = trustees.filter(t =>
                t.name.toLowerCase().includes(query) ||
                t.linkedUser.toLowerCase().includes(query) ||
                t.relation.toLowerCase().includes(query) ||
                t.status.toLowerCase().includes(query)
            );
        }

        const displayTrustees = trustees.slice(0, 5);

        tbody.innerHTML = displayTrustees.map(t => {
            const badgeClass = t.status === 'Verified' ? 'status-badge-verified' : 'status-badge-pending';
            const iconSvg = t.status === 'Verified'
                ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
                : `<span class="status-dot warning"></span>`;

            return `
                <tr data-trustee-id="${t.id}">
                    <td><strong>${t.name}</strong></td>
                    <td>${t.linkedUser}</td>
                    <td>${t.relation}</td>
                    <td>
                        <span class="${badgeClass}">
                            ${iconSvg}
                            ${t.status}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.querySelectorAll('tr[data-trustee-id]').forEach(row => {
            row.addEventListener('click', () => {
                const tId = row.getAttribute('data-trustee-id');
                const trusteeObj = AegisMockData.trustees.find(item => item.id === tId);
                if (trusteeObj) {
                    this.showTrusteeDetailModal(trusteeObj);
                }
            });
        });
    },

    showTrusteeDetailModal(t) {
        const modal = document.getElementById('trustee-detail-modal');
        if (!modal) return;

        document.getElementById('modal-trustee-name').textContent = t.name;
        document.getElementById('modal-trustee-relation').textContent = t.relation;
        document.getElementById('modal-trustee-status').textContent = t.status;
        document.getElementById('modal-trustee-linked').textContent = t.linkedUser;
        document.getElementById('modal-trustee-phone').textContent = t.phone;
        document.getElementById('modal-trustee-shares').textContent = t.sharesHeld;
        document.getElementById('modal-trustee-date').textContent = t.addedDate;
        document.getElementById('modal-trustee-method').textContent = t.verificationMethod;

        AegisInteractions.openModal('trustee-detail-modal');
    },

    // 7. Event listeners for filters and inputs
    setupTableEventListeners() {
        // Event filter chips
        const filterChips = document.querySelectorAll('.filter-chip[data-filter]');
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.currentFilter = chip.getAttribute('data-filter');
                this.renderSecurityEvents(this.currentFilter, this.searchTerm);
            });
        });

        // Event search input
        const eventSearch = document.getElementById('event-table-search');
        if (eventSearch) {
            eventSearch.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.trim();
                this.renderSecurityEvents(this.currentFilter, this.searchTerm);
            });
        }
    }
};

window.AegisSecurityOps = AegisSecurityOps;
