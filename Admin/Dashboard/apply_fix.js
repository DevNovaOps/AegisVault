
const fs = require('fs');
const path = require('path');

const dashJsPath = path.join(__dirname, 'js', 'dashboard.js');
let content = fs.readFileSync(dashJsPath, 'utf8');

// 1. Replace renderPendingActionsList
const oldPending = content.substring(
    content.indexOf('renderPendingActionsList() {'),
    content.indexOf('renderSystemHealthList() {')
);

const newPending = `renderPendingActionsList() {
        try {
            const container = document.getElementById('pending-actions-list-container') || document.getElementById('pending-actions-list');
            if (!container || !window.AegisMockData || !AegisMockData.pendingActions) return;

            const actions = AegisMockData.pendingActions;
            container.innerHTML = actions.map(act => {
                let iconSvg = '';
                const iconKey = act.icon || act.iconType || '';
                if (iconKey === 'user-check') {
                    iconSvg = \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>\`;
                } else if (iconKey === 'shield-alert' || iconKey.includes('shield')) {
                    iconSvg = \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>\`;
                } else if (iconKey === 'key') {
                    iconSvg = \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7.5" cy="15.5" r="5.5"></circle><path d="m21 2-9.6 9.6"></path><path d="m15.5 7.5 3 3"></path></svg>\`;
                } else if (iconKey === 'clock') {
                    iconSvg = \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>\`;
                } else if (iconKey === 'alert-triangle' || iconKey.includes('alert')) {
                    iconSvg = \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>\`;
                } else {
                    iconSvg = \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>\`;
                }

                const colorClass = act.badgeColor || act.colorClass || 'act-blue';

                return \`
                    <div class="pending-action-item" data-action-id="\${act.id}" tabindex="0" role="button" aria-label="\${act.title}">
                        <div class="pending-action-left">
                            <div class="action-icon-box \${colorClass}">
                                \${iconSvg}
                            </div>
                            <span class="action-title-text">\${act.title}</span>
                        </div>
                        <div class="pending-action-right">
                            <span class="action-count-text">\${act.count}</span>
                            <svg class="action-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>
                    </div>
                \`;
            }).join('');

            container.querySelectorAll('.pending-action-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.getAttribute('data-action-id');
                    const action = actions.find(a => a.id === id);
                    if (action) this.showToast(\`Triaging: \${action.title} (\${action.count} items)\`, 'info');
                });
            });
        } catch (err) {
            console.error('Error rendering Pending Actions:', err);
        }
    },

    `;

content = content.replace(oldPending, newPending);

// 2. Replace renderSystemHealthList
const oldHealth = content.substring(
    content.indexOf('renderSystemHealthList() {'),
    content.indexOf('bindActionButtons() {')
);

const newHealth = `renderSystemHealthList() {
        try {
            const container = document.getElementById('system-health-services-list') || document.getElementById('system-health-list');
            if (!container || !window.AegisMockData || !AegisMockData.systemHealth) return;

            const services = AegisMockData.systemHealth;
            container.innerHTML = services.map(s => {
                let svcIcon = '';
                const iconKey = s.icon || s.id || '';
                if (iconKey.includes('db') || iconKey === 'database') {
                    svcIcon = \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>\`;
                } else if (iconKey.includes('app') || iconKey === 'server') {
                    svcIcon = \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>\`;
                } else if (iconKey.includes('workers') || iconKey === 'cpu') {
                    svcIcon = \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>\`;
                } else if (iconKey.includes('email') || iconKey === 'mail') {
                    svcIcon = \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>\`;
                } else if (iconKey.includes('storage') || iconKey === 'hard-drive') {
                    svcIcon = \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="12" x2="2" y2="12"></line><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path><line x1="6" y1="16" x2="6.01" y2="16"></line><line x1="10" y1="16" x2="10.01" y2="16"></line></svg>\`;
                } else {
                    svcIcon = \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>\`;
                }

                return \`
                    <div class="service-status-row" data-service-id="\${s.id}" tabindex="0" role="button" aria-label="\${s.name} \${s.status}" title="Click to view \${s.name} telemetry">
                        <div class="service-info-col">
                            <span class="service-icon-wrap">\${svcIcon}</span>
                            <span class="service-name-text">\${s.name}</span>
                        </div>
                        <div class="service-badge-col">
                            <span class="service-status-dot"></span>
                            <span class="service-status-label">\${s.status}</span>
                        </div>
                    </div>
                \`;
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

    `;

content = content.replace(oldHealth, newHealth);

// 3. Replace bindActionButtons and startLiveClock
const oldActionsAndClock = content.substring(
    content.indexOf('bindActionButtons() {'),
    content.indexOf('/* =========================================================================\n       8. Toast Notification System')
);

const newActionsAndClock = `bindActionButtons() {
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
                this.showToast('Pending Actions Queue: 18 custodian actions requiring triage.', 'info');
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

            if (dateEl) dateEl.textContent = \`\${dayName}, \${date} \${month} \${year}\`;
            if (timeEl) timeEl.textContent = \`\${hours}:\${minutes} \${ampm}\`;
            if (clockEl) clockEl.textContent = \`\${dayName}, \${date} \${month} \${year} \${hours}:\${minutes} \${ampm}\`;
        };

        updateClock();
        setInterval(updateClock, 30000);
    },

    `;

content = content.replace(oldActionsAndClock, newActionsAndClock);

fs.writeFileSync(dashJsPath, content, 'utf8');
console.log('Successfully updated dashboard.js!');
