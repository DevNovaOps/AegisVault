/**
 * AegisVault — Dashboard Module Engine
 * Handles countdown timer, heartbeat check-in action,
 * SVG donut chart rendering, progress animations, and modal data bindings.
 */

const AegisDashboard = (() => {
    // Internal State
    let countdownInterval = null;
    let remainingSeconds = AegisData.ownerMetrics.countdownSeconds;

    /**
     * Initialize Countdown Timer
     */
    function initCountdown() {
        const daysEl = document.getElementById('cnt-days');
        const hoursEl = document.getElementById('cnt-hours');
        const minutesEl = document.getElementById('cnt-minutes');
        const secondsEl = document.getElementById('cnt-seconds');

        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

        function updateDisplay() {
            if (remainingSeconds <= 0) {
                remainingSeconds = 30 * 86400; // Reset to 30 days if reaches zero
            }

            const d = Math.floor(remainingSeconds / 86400);
            const h = Math.floor((remainingSeconds % 86400) / 3600);
            const m = Math.floor((remainingSeconds % 3600) / 60);
            const s = Math.floor(remainingSeconds % 60);

            daysEl.textContent = String(d).padStart(2, '0');
            hoursEl.textContent = String(h).padStart(2, '0');
            minutesEl.textContent = String(m).padStart(2, '0');
            secondsEl.textContent = String(s).padStart(2, '0');

            remainingSeconds--;
        }

        updateDisplay();
        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = setInterval(updateDisplay, 1000);
    }

    /**
     * "I'M ALIVE" Button Handler
     */
    function triggerHeartbeat() {
        const btn = document.getElementById('btn-im-alive');
        const lastCheckInEl = document.getElementById('last-checkin-text');

        if (btn) {
            btn.classList.add('pulsing');
            setTimeout(() => btn.classList.remove('pulsing'), 800);
        }

        // Reset countdown to 30 full days
        remainingSeconds = 30 * 86400;

        // Format current timestamp
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const formattedTimestamp = `${dateStr}, ${timeStr}`;

        if (lastCheckInEl) {
            lastCheckInEl.textContent = `Last check-in: ${formattedTimestamp} (Verified)`;
        }

        // Add to Recent Activity feed
        const newActivity = {
            id: 'act_' + Date.now(),
            type: 'heartbeat',
            title: 'Heartbeat completed',
            timestamp: `${dateStr}, ${timeStr}`,
            iconColor: '#10B981',
            icon: 'check-circle',
            details: 'Proof-of-life signal broadcasted from local browser session. Timer extended to 30 days.'
        };
        AegisData.recentActivity.unshift(newActivity);
        renderRecentActivity();

        // Show Toast Notification
        AegisInteractions.showToast('Heartbeat check-in verified! Proof-of-life beacon broadcasted.', 'success');
    }

    /**
     * Render Donut Chart using responsive SVG
     */
    function renderDonutChart() {
        const svgContainer = document.getElementById('vault-donut-svg');
        const legendContainer = document.getElementById('vault-donut-legend');
        if (!svgContainer || !legendContainer) return;

        const categories = AegisData.vaultCategories;
        const total = categories.reduce((sum, item) => sum + item.count, 0);

        // SVG circle parameters
        const radius = 50;
        const circumference = 2 * Math.PI * radius; // ~314.159
        let accumulatedPercent = 0;

        let svgHtml = `
            <circle cx="70" cy="70" r="${radius}" 
                    fill="none" 
                    stroke="var(--border-color)" 
                    stroke-width="16" />
        `;

        let legendHtml = '';

        categories.forEach((cat) => {
            const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += cat.percentage;

            svgHtml += `
                <circle class="donut-slice donut-slice-animate" 
                        cx="70" cy="70" r="${radius}" 
                        fill="none" 
                        stroke="${cat.color}" 
                        stroke-width="16" 
                        stroke-dasharray="${strokeDasharray}" 
                        stroke-dashoffset="${strokeDashoffset}"
                        data-category="${cat.name}"
                        data-count="${cat.count}"
                        data-percent="${cat.percentage}">
                    <title>${cat.name}: ${cat.count} items (${cat.percentage}%)</title>
                </circle>
            `;

            legendHtml += `
                <div class="legend-item" data-category="${cat.name}">
                    <div class="legend-left">
                        <span class="legend-dot" style="background-color: ${cat.color};"></span>
                        <span>${cat.name}</span>
                    </div>
                    <span class="legend-val">${cat.count} (${cat.percentage}%)</span>
                </div>
            `;
        });

        svgContainer.innerHTML = svgHtml;
        legendContainer.innerHTML = legendHtml;
    }

    /**
     * Render Recent Activity Feed
     */
    function renderRecentActivity() {
        const container = document.getElementById('recent-activity-list');
        if (!container) return;

        const activities = AegisData.recentActivity.slice(0, 4);
        let html = '';

        activities.forEach(act => {
            let iconSvg = '';
            if (act.type === 'heartbeat') {
                iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            } else if (act.type === 'item') {
                iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
            } else if (act.type === 'trustee') {
                iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
            } else {
                iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;
            }

            html += `
                <div class="activity-row" onclick="AegisDashboard.openActivityDetails('${act.id}')">
                    <div class="activity-circle-icon" style="background-color: ${act.iconColor}1a; color: ${act.iconColor};">
                        ${iconSvg}
                    </div>
                    <div class="activity-details-col">
                        <div class="activity-item-title">${act.title}</div>
                        <div class="activity-item-time">${act.timestamp}</div>
                    </div>
                    <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * Render Assigned Vaults in Trustee Section
     */
    function renderAssignedVaults() {
        const container = document.getElementById('assigned-vaults-list');
        if (!container) return;

        const vaults = AegisData.assignedVaults;
        let html = '';

        vaults.forEach(vault => {
            const isPersonal = vault.id === 'vlt_001';
            const iconClass = isPersonal ? 'icon-amber-vault' : 'icon-coral-vault';
            const shareColorClass = vault.shareStatus === 'Submitted' ? 'val-emerald' : 'val-amber';
            const shareIconSvg = vault.shareStatus === 'Submitted' 
                ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>` 
                : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;

            html += `
                <div class="vault-row-card" onclick="AegisDashboard.openVaultDetails('${vault.id}')">
                    <div class="vault-row-left">
                        <div class="vault-row-icon ${iconClass}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </div>
                        <div class="vault-row-title-col">
                            <div class="vault-row-name">${vault.name}</div>
                            <div class="vault-row-owner">Owner: ${vault.owner}</div>
                        </div>
                    </div>
                    <div class="vault-row-meta">
                        <div class="vault-meta-item">
                            <span class="vault-meta-label">Your Status:</span>
                            <span class="vault-meta-val val-emerald">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                ${vault.status}
                            </span>
                        </div>
                        <div class="vault-meta-item">
                            <span class="vault-meta-label">Share Status:</span>
                            <span class="vault-meta-val ${shareColorClass}">
                                ${shareIconSvg}
                                ${vault.shareStatus}
                            </span>
                        </div>
                        <div class="vault-meta-item">
                            <span class="vault-meta-label">Threshold:</span>
                            <span class="vault-meta-val">${vault.threshold}</span>
                        </div>
                    </div>
                    <svg class="chevron-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * Render Trustee Recent Updates Timeline
     */
    function renderTrusteeUpdates() {
        const container = document.getElementById('trustee-timeline-list');
        if (!container) return;

        const updates = AegisData.trusteeUpdates;
        let html = '';

        updates.forEach((item, idx) => {
            let dotClass = 'dot-slate';
            if (idx === 0) dotClass = 'dot-emerald';
            else if (idx === 1) dotClass = 'dot-cyan';
            else if (idx === 2) dotClass = 'dot-blue';

            html += `
                <div class="timeline-item">
                    <span class="timeline-dot ${dotClass}"></span>
                    <span class="timeline-title">${item.title}</span>
                    <span class="timeline-time">${item.timestamp}</span>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * Open Vault Details Modal
     */
    function openVaultDetails(vaultId) {
        const vault = AegisData.assignedVaults.find(v => v.id === vaultId) || AegisData.assignedVaults[0];
        const modal = document.getElementById('vault-details-modal');
        if (!modal) return;

        document.getElementById('modal-vault-title').textContent = vault.name;
        document.getElementById('modal-vault-owner').textContent = `Owner: ${vault.owner} • Custodian`;
        document.getElementById('modal-vault-desc').textContent = vault.description;
        document.getElementById('modal-vault-threshold').textContent = vault.threshold;
        document.getElementById('modal-vault-items').textContent = `${vault.itemsCount} Files Protected`;
        document.getElementById('modal-vault-share-id').textContent = vault.yourShareId;
        document.getElementById('modal-vault-share-status').textContent = vault.shareStatus;
        document.getElementById('modal-vault-trigger').textContent = vault.releaseTrigger;

        const shareBtn = document.getElementById('btn-submit-share-action');
        if (shareBtn) {
            if (vault.shareStatus === 'Submitted') {
                shareBtn.textContent = 'Re-verify Share';
                shareBtn.className = 'btn-secondary';
            } else {
                shareBtn.textContent = 'Submit Shamir Share';
                shareBtn.className = 'btn-primary';
            }
            shareBtn.onclick = () => {
                vault.shareStatus = 'Submitted';
                renderAssignedVaults();
                AegisInteractions.closeModal('vault-details-modal');
                AegisInteractions.showToast(`Cryptographic share submitted for ${vault.name}!`, 'success');
            };
        }

        AegisInteractions.openModal('vault-details-modal');
    }

    /**
     * Open Activity Details Modal
     */
    function openActivityDetails(activityId) {
        const act = AegisData.recentActivity.find(a => a.id === activityId) || AegisData.recentActivity[0];
        const modal = document.getElementById('activity-details-modal');
        if (!modal) return;

        document.getElementById('modal-activity-title').textContent = act.title;
        document.getElementById('modal-activity-time').textContent = act.timestamp;
        document.getElementById('modal-activity-desc').textContent = act.details;

        AegisInteractions.openModal('activity-details-modal');
    }

    /**
     * Public API
     */
    return {
        init: () => {
            initCountdown();
            renderDonutChart();
            renderRecentActivity();
            renderAssignedVaults();
            renderTrusteeUpdates();

            const aliveBtn = document.getElementById('btn-im-alive');
            if (aliveBtn) {
                aliveBtn.addEventListener('click', triggerHeartbeat);
            }
        },
        triggerHeartbeat,
        openVaultDetails,
        openActivityDetails
    };
})();

// Attach globally
if (typeof window !== 'undefined') {
    window.AegisDashboard = AegisDashboard;
}
