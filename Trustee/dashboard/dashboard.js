/**
 * AegisVault Trustee Panel - Dashboard Controller
 * Handles interactive behaviors, modal previews, and simulated actions
 */

document.addEventListener('DOMContentLoaded', () => {
  initDashboardModals();
  initVaultClicks();
  initActionClicks();
  initActivityClicks();
  initMetricClicks();
  animateImpactRing();
  fetchTrusteeDashboardData();
});

function fetchTrusteeDashboardData() {
  const user = (window.AegisAPI && window.AegisAPI.getUser()) || {};
  const firstName = user.first_name || (user.full_name ? user.full_name.split(' ')[0] : '') || user.username || 'Trustee';
  const heroSubtext = document.querySelector('.hero-subtext');
  if (heroSubtext) {
    heroSubtext.textContent = `Welcome back, ${firstName}! You are a trusted person, helping protect what matters most.`;
  }

  if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
    window.AegisAPI.get('/trustee/dashboard/').then(data => {
      const elAssigned = document.getElementById('kpiAssignedVaults');
      if (elAssigned) elAssigned.textContent = data.active_shares || 0;

      const elInv = document.getElementById('kpiPendingInvitations');
      if (elInv) elInv.textContent = data.pending_invitations || 0;

      const elActions = document.getElementById('kpiPendingActions');
      if (elActions) {
        const actionCount = (data.pending_actions ? data.pending_actions.length : 0) || (data.pending_invitations + data.pending_releases) || 0;
        elActions.textContent = actionCount;
      }

      const elRelease = document.getElementById('kpiActiveRelease');
      if (elRelease) elRelease.textContent = data.pending_releases || 0;

      // Update sidebar invitation badge
      const sidebarInvBadge = document.getElementById('sidebarInvBadge');
      if (sidebarInvBadge) {
        const pending = data.pending_invitations || 0;
        sidebarInvBadge.textContent = pending;
        sidebarInvBadge.style.display = pending > 0 ? 'inline-flex' : 'none';
      }

      // Populate assigned vaults
      populateAssignedVaults(data.assigned_vaults || []);

      // Populate pending actions
      populatePendingActions(data.pending_actions || []);

      // Populate recent activity timeline
      populateActivityTimeline(data.recent_activity || []);
    }).catch(err => {
      console.warn('Failed to load trustee dashboard data', err);
    });
  }
}

function populateAssignedVaults(vaults) {
  const container = document.getElementById('dashboardVaultsList');
  if (!container) return;

  container.innerHTML = '';
  if (vaults.length === 0) {
    container.innerHTML = `
      <div class="empty-state-card" style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
        No vaults currently assigned. When a vault owner adds you as a trustee, they will appear here.
      </div>
    `;
    return;
  }

  vaults.forEach(v => {
    const card = document.createElement('div');
    card.className = 'vault-item-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const lockColor = v.status === 'active' ? 'blue' : 'amber';
    card.innerHTML = `
      <div class="vault-left-group">
        <div class="vault-lock-box ${lockColor}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div class="vault-name-owner">
          <span class="vault-name">${escapeHtmlDash(v.name || 'Vault')}</span>
          <span class="vault-owner">Owner: ${escapeHtmlDash(v.owner_name || 'Vault Owner')}</span>
          <div class="vault-tags">
            <span class="tag-pill">${escapeHtmlDash(v.vault_type || 'Assigned')}</span>
            <span class="tag-pill">Protected</span>
          </div>
        </div>
      </div>
      <div class="vault-statuses-group">
        <div class="vault-status-column">
          <span class="vault-status-label">Share Status</span>
          <span class="status-badge ${v.status === 'active' ? 'submitted' : 'not-submitted'}">
            <span class="badge-dot"></span>${v.status === 'active' ? 'Active' : 'Pending'}
          </span>
        </div>
        <div class="vault-status-column">
          <span class="vault-status-label">Release Status</span>
          <span class="status-badge no-release"><span class="badge-dot"></span>${escapeHtmlDash(v.release_status || 'No Release')}</span>
        </div>
        <svg class="vault-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    `;

    card.addEventListener('click', () => {
      showVaultDetailModal(v.name, `Owner: ${v.owner_name} (${v.owner_email})`, v.status === 'active' ? 'Active' : 'Pending', v.release_status || 'No Release');
    });

    container.appendChild(card);
  });
}

function populatePendingActions(actions) {
  const container = document.getElementById('dashboardPendingActions');
  if (!container) return;

  container.innerHTML = '';
  if (actions.length === 0) {
    container.innerHTML = `
      <div class="empty-state-card" style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
        No pending actions at this time. All assignments are up to date.
      </div>
    `;
    return;
  }

  actions.forEach(act => {
    const item = document.createElement('div');
    item.className = 'pending-action-item';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');

    let boxClass = 'coral';
    let iconSvg = '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m22 7-10 7L2 7"/>';

    item.innerHTML = `
      <div class="action-icon-box ${boxClass}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${iconSvg}
        </svg>
      </div>
      <div class="action-text-group">
        <span class="action-title">${escapeHtmlDash(act.title)}</span>
        <span class="action-desc">${escapeHtmlDash(act.desc)}</span>
      </div>
      <svg class="vault-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    `;

    item.addEventListener('click', () => {
      if (act.link) {
        window.location.href = act.link;
      }
    });

    container.appendChild(item);
  });
}

function populateActivityTimeline(activities) {
  const timeline = document.getElementById('dashboardActivityList') || document.querySelector('.activity-timeline-list');
  if (!timeline) return;

  timeline.innerHTML = '';
  if (activities.length === 0) {
    timeline.innerHTML = `
      <div class="empty-state-card" style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
        No recent activity. Actions will appear here as you interact with vaults.
      </div>
    `;
    return;
  }

  activities.forEach(act => {
    const row = document.createElement('div');
    row.className = 'activity-timeline-row';
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');

    const ts = new Date(act.timestamp);
    const timeStr = ts.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
    const dateStr = ts.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });

    let dotColor = 'teal';
    if (act.category === 'trustee' || act.category === 'invitation') dotColor = 'green';
    else if (act.category === 'release') dotColor = 'purple';
    else if (act.category === 'security') dotColor = 'blue';

    row.innerHTML = `
      <span class="activity-dot ${dotColor}"></span>
      <span class="activity-time-col">${dateStr}, ${timeStr}</span>
      <div class="activity-main-col">
        <div class="activity-action-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="activity-title-details">
          <span class="activity-event-title">${escapeHtmlDash(act.action_title)}</span>
          <span class="activity-event-details">${escapeHtmlDash(act.details || act.vault_name || '')}</span>
        </div>
      </div>
      <svg class="activity-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    `;

    row.addEventListener('click', () => {
      const modal = document.getElementById('activityDetailModal');
      if (modal) {
        document.getElementById('modalActivityTitle').textContent = act.action_title;
        document.getElementById('modalActivityDetails').textContent = act.details || '';
        document.getElementById('modalActivityTime').textContent = `${dateStr}, ${timeStr}`;
        window.openModal('activityDetailModal');
      } else {
        window.showToast(`${act.action_title}: ${act.details || ''}`);
      }
    });

    timeline.appendChild(row);
  });
}

function escapeHtmlDash(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

// Animate the circular progress ring
function animateImpactRing() {
  const ring = document.querySelector('.impact-ring-fill');
  if (!ring) return;
  // Animate dashoffset from 220 to 60 (approx 72% complete)
  setTimeout(() => {
    ring.style.strokeDashoffset = '60';
  }, 200);
}

// Vault items click handler
function initVaultClicks() {
  const vaultItems = document.querySelectorAll('.vault-item-card');
  vaultItems.forEach(item => {
    item.addEventListener('click', () => {
      const vaultName = item.querySelector('.vault-name')?.textContent || 'Vault';
      const owner = item.querySelector('.vault-owner')?.textContent || 'Unknown Owner';
      const shareStatus = item.querySelector('.vault-status-column:first-child .status-badge')?.textContent.trim() || 'N/A';
      const releaseStatus = item.querySelector('.vault-status-column:last-child .status-badge')?.textContent.trim() || 'N/A';

      showVaultDetailModal(vaultName, owner, shareStatus, releaseStatus);
    });
  });
}

function showVaultDetailModal(vaultName, owner, shareStatus, releaseStatus) {
  const modal = document.getElementById('vaultDetailModal');
  if (!modal) return;

  document.getElementById('modalVaultName').textContent = vaultName;
  document.getElementById('modalVaultOwner').textContent = owner;
  document.getElementById('modalVaultShareStatus').textContent = shareStatus;
  document.getElementById('modalVaultReleaseStatus').textContent = releaseStatus;

  window.openModal('vaultDetailModal');
}

// Pending Actions click handler
function initActionClicks() {
  const actionItems = document.querySelectorAll('.pending-action-item');
  actionItems.forEach(item => {
    item.addEventListener('click', () => {
      const title = item.querySelector('.action-title')?.textContent.trim() || 'Action';
      const desc = item.querySelector('.action-desc')?.textContent.trim() || '';

      if (title.includes('Invitation')) {
        window.location.href = '../invitations/invitations.html';
      } else {
        window.showToast(`Selected action: ${title}`);
      }
    });
  });
}

// Activity items click handler
function initActivityClicks() {
  const activityRows = document.querySelectorAll('.activity-timeline-row');
  activityRows.forEach(row => {
    row.addEventListener('click', () => {
      const title = row.querySelector('.activity-event-title')?.textContent || 'Activity';
      const details = row.querySelector('.activity-event-details')?.textContent || '';
      const time = row.querySelector('.activity-time-col')?.textContent || '';

      const modal = document.getElementById('activityDetailModal');
      if (modal) {
        document.getElementById('modalActivityTitle').textContent = title;
        document.getElementById('modalActivityDetails').textContent = details;
        document.getElementById('modalActivityTime').textContent = time;
        window.openModal('activityDetailModal');
      } else {
        window.showToast(`${title}: ${details}`);
      }
    });
  });
}

// Metric cards click
function initMetricClicks() {
  const metrics = document.querySelectorAll('.metric-card');
  metrics.forEach((card, index) => {
    card.addEventListener('click', () => {
      const label = card.querySelector('.metric-label')?.textContent || 'Metric';
      const val = card.querySelector('.metric-value')?.textContent || '0';

      if (label.includes('Assigned Vaults')) {
        window.location.href = '../assigned-vaults/assigned-vaults.html';
      } else if (label.includes('Invitations')) {
        window.location.href = '../invitations/invitations.html';
      } else if (label.includes('Pending Actions')) {
        window.showToast(`You have ${val} pending trustee actions requiring attention.`);
      } else if (label.includes('Active Release')) {
        window.location.href = '../release-status/release-status.html';
      }
    });
  });
}

function initDashboardModals() {
  // Modal action buttons
  const manageVaultBtn = document.getElementById('btnModalManageVault');
  if (manageVaultBtn) {
    manageVaultBtn.addEventListener('click', () => {
      window.location.href = '../assigned-vaults/assigned-vaults.html';
    });
  }
}
