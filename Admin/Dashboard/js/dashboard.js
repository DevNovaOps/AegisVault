/**
 * AegisVault Admin Dashboard Module — Dashboard Core Controller
 * Populates data tables, renders action lists, coordinates live telemetry,
 * and attaches card and button click handlers.
 */

document.addEventListener('DOMContentLoaded', () => {
    AegisDashboard.init();
});

const AegisDashboard = {
    init() {
        this.renderRecentUsersTable();
        this.renderSecurityEventsTable();
        this.renderPendingActionsList();
        this.renderSystemHealthList();
        this.bindActionButtons();
        this.startLiveClock();

        // Initialize UI systems
        if (window.AegisInteractions) {
            window.AegisInteractions.init();
        }

        // Initialize SVG Charts
        if (window.AegisCharts) {
            window.AegisCharts.init();
        }

        console.log(
            '%c AegisVault %c Admin Dashboard Module Loaded ',
            'background: #E86326; color: #FFFFFF; font-weight: bold; border-radius: 3px 0 0 3px; padding: 3px 7px;',
            'background: #0B192C; color: #00D9A5; font-weight: bold; border-radius: 0 3px 3px 0; padding: 3px 7px;'
        );
    },

    // 1. Render Recent Users Table
    renderRecentUsersTable() {
        const tbody = document.getElementById('recent-users-tbody');
        if (!tbody) return;

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
                if (user && window.AegisInteractions) {
                    window.AegisInteractions.showUserModal(user);
                }
            });
        });
    },

    // 2. Render Recent Security Events Table
    renderSecurityEventsTable() {
        const tbody = document.getElementById('recent-security-events-tbody');
        if (!tbody) return;

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
                <tr class="table-row-clickable" data-event-id="${e.id}" title="Click to inspect audit trail details">
                    <td class="text-secondary">${e.time}</td>
                    <td class="event-name-cell">${e.event}</td>
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
                const event = events.find(ev => ev.id === id);
                if (event && window.AegisInteractions) {
                    window.AegisInteractions.showEventModal(event);
                }
            });
        });
    },

    // 3. Render Pending Actions List
    renderPendingActionsList() {
        const container = document.getElementById('pending-actions-list-container');
        if (!container) return;

        const actions = AegisMockData.pendingActions;
        container.innerHTML = actions.map(act => {
            let iconSvg = '';
            if (act.icon === 'user-check') {
                iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>`;
            } else if (act.icon === 'shield-alert') {
                iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>`;
            } else if (act.icon === 'alert-triangle') {
                iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
            } else if (act.icon === 'key') {
                iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-1.5 1.5L16 7l-1.5-1.5M16 7l-4 4-2-2-4 4 2 2-4 4 2 2 4-4-2-2 4-4 1.5 1.5L19 4l2-2z"></path></svg>`;
            } else {
                iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`;
            }

            return `
                <div class="pending-action-item" data-action-id="${act.id}" title="Click to triage action item">
                    <div class="pending-action-left">
                        <div class="action-icon-box ${act.badgeColor}">
                            ${iconSvg}
                        </div>
                        <span class="action-title-text">${act.title}</span>
                    </div>
                    <div class="pending-action-right">
                        <span class="action-count-text">${act.count}</span>
                        <svg class="action-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.pending-action-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.getAttribute('data-action-id');
                const act = actions.find(a => a.id === id);
                if (act && window.AegisInteractions) {
                    window.AegisInteractions.showActionModal(act);
                }
            });
        });
    },

    // 4. Render System Health Services List
    renderSystemHealthList() {
        const container = document.getElementById('system-health-services-list');
        if (!container) return;

        const services = AegisMockData.systemHealth;
        container.innerHTML = services.map(s => {
            let iconSvg = '';
            if (s.icon === 'database') {
                iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`;
            } else if (s.icon === 'server') {
                iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>`;
            } else if (s.icon === 'cpu') {
                iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;
            } else if (s.icon === 'mail') {
                iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
            } else if (s.icon === 'hard-drive') {
                iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="12" x2="2" y2="12"></line><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path><line x1="6" y1="16" x2="6.01" y2="16"></line><line x1="10" y1="16" x2="10.01" y2="16"></line></svg>`;
            } else {
                iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
            }

            return `
                <div class="service-status-row" data-service-id="${s.id}" title="Click to view service diagnostics">
                    <div class="service-info-col">
                        <span class="service-icon-wrap">${iconSvg}</span>
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
                const service = services.find(sv => sv.id === id);
                if (service && window.AegisInteractions) {
                    window.AegisInteractions.showServiceModal(service);
                }
            });
        });
    },

    // 5. Button and Link Binders
    bindActionButtons() {
        // Generate Report Button in Hero
        const genReportBtn = document.getElementById('btn-generate-report');
        if (genReportBtn) {
            genReportBtn.addEventListener('click', () => {
                if (window.AegisInteractions) {
                    window.AegisInteractions.showReportModal();
                }
            });
        }

        // View All Users link
        const viewUsersLink = document.getElementById('link-view-all-users');
        if (viewUsersLink) {
            viewUsersLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.AegisInteractions) {
                    window.AegisInteractions.showAllUsersModal();
                }
            });
        }

        // View All Events link
        const viewEventsLink = document.getElementById('link-view-all-events');
        if (viewEventsLink) {
            viewEventsLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.AegisInteractions) {
                    window.AegisInteractions.showAllEventsModal();
                }
            });
        }

        // View All Actions link
        const viewActionsLink = document.getElementById('link-view-all-actions');
        if (viewActionsLink) {
            viewActionsLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.AegisInteractions) {
                    window.AegisInteractions.showToast('Displaying comprehensive administrative task triage...', 'info');
                }
            });
        }

        // View Health Details link
        const viewHealthLink = document.getElementById('link-view-health-details');
        if (viewHealthLink) {
            viewHealthLink.addEventListener('click', (e) => {
                e.preventDefault();
                const db = AegisMockData.systemHealth[0];
                if (db && window.AegisInteractions) {
                    window.AegisInteractions.showServiceModal(db);
                }
            });
        }

        // Metric Card Clicks
        document.querySelectorAll('.metric-overview-card').forEach(card => {
            card.addEventListener('click', () => {
                const label = card.querySelector('.metric-title-text').textContent;
                const val = card.querySelector('.metric-number-display').textContent;
                if (window.AegisInteractions) {
                    window.AegisInteractions.showToast(`${label}: ${val} telemetry status nominal.`, 'info');
                }
            });
        });

        // Report Generation Submit Form
        const reportForm = document.getElementById('generate-report-form');
        if (reportForm) {
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const btn = reportForm.querySelector('button[type="submit"]');
                btn.textContent = 'Generating...';
                btn.disabled = true;

                setTimeout(() => {
                    btn.textContent = 'Download Signed Audit Report (PDF/CSV)';
                    btn.disabled = false;
                    if (window.AegisInteractions) {
                        window.AegisInteractions.closeModal('generate-report-modal');
                        window.AegisInteractions.showToast('SHA-256 signed audit report generated and downloaded.', 'success');
                    }
                }, 800);
            });
        }
    },

    // 6. Live Clock widget in Hero
    startLiveClock() {
        const dateEl = document.getElementById('hero-live-date');
        const timeEl = document.getElementById('hero-live-time');
        if (!dateEl && !timeEl) return;

        function update() {
            const now = new Date();
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            const dayName = days[now.getDay()];
            const dayNum = now.getDate();
            const monthName = months[now.getMonth()];
            const year = now.getFullYear();

            let hours = now.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const minutes = String(now.getMinutes()).padStart(2, '0');

            if (dateEl) dateEl.textContent = `${dayName}, ${dayNum} ${monthName} ${year}`;
            if (timeEl) timeEl.textContent = `${hours}:${minutes} ${ampm}`;
        }

        update();
        setInterval(update, 30000);
    }
};

window.AegisDashboard = AegisDashboard;
