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
  if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
    window.AegisAPI.get('/trustee/dashboard/').then(data => {
      const metricValues = document.querySelectorAll('.metric-value');
      if (metricValues.length >= 4) {
        metricValues[0].textContent = data.active_shares || '0';
        metricValues[1].textContent = data.pending_invitations || '0';
        // Pending Actions = invitations + releases
        metricValues[2].textContent = (data.pending_invitations + data.pending_releases) || '0';
        metricValues[3].textContent = data.completed_releases || '0';
      }

      // Update sidebar notification badge
      const sidebarNotifBadge = document.getElementById('sidebarNotifBadge');
      if (sidebarNotifBadge) {
        const unread = data.unread_notifications || 0;
        sidebarNotifBadge.textContent = unread;
        sidebarNotifBadge.style.display = unread > 0 ? 'inline-flex' : 'none';
      }

      // Update sidebar invitation badge
      const sidebarInvBadge = document.getElementById('sidebarInvBadge');
      if (sidebarInvBadge) {
        const pending = data.pending_invitations || 0;
        sidebarInvBadge.textContent = pending;
        sidebarInvBadge.style.display = pending > 0 ? 'inline-flex' : 'none';
      }

      // Populate recent activity timeline from live data
      if (data.recent_activity && data.recent_activity.length > 0) {
        populateActivityTimeline(data.recent_activity);
      }
    }).catch(err => {
      console.warn('Failed to load trustee dashboard data', err);
    });
  }
}

function populateActivityTimeline(activities) {
  const timeline = document.querySelector('.activity-timeline');
  if (!timeline) return;

  // Clear existing static rows
  const existingRows = timeline.querySelectorAll('.activity-timeline-row');
  existingRows.forEach(row => row.remove());

  if (activities.length === 0) {
    const emptyRow = document.createElement('div');
    emptyRow.className = 'activity-timeline-row';
    emptyRow.style.cssText = 'text-align: center; padding: 2rem; color: var(--text-muted);';
    emptyRow.innerHTML = '<span>No recent activity. Actions will appear here as you interact with vaults.</span>';
    timeline.appendChild(emptyRow);
    return;
  }

  activities.forEach(act => {
    const row = document.createElement('div');
    row.className = 'activity-timeline-row';

    const ts = new Date(act.timestamp);
    const timeStr = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = ts.toLocaleDateString([], { day: '2-digit', month: 'short' });

    // Icon based on category
    let iconEmoji = '📋';
    if (act.category === 'trustee') iconEmoji = '👥';
    else if (act.category === 'release') iconEmoji = '🔓';
    else if (act.category === 'security' || act.category === 'auth') iconEmoji = '🛡️';
    else if (act.category === 'vault') iconEmoji = '🔒';
    else if (act.category === 'profile') iconEmoji = '👤';

    row.innerHTML = `
      <div class="activity-time-col">${dateStr}, ${timeStr}</div>
      <div class="activity-dot-col"><span class="timeline-dot"></span></div>
      <div class="activity-event-col">
        <span class="activity-event-title">${iconEmoji} ${escapeHtmlDash(act.action_title)}</span>
        <span class="activity-event-details">${escapeHtmlDash(act.details || act.vault_name || '')}</span>
      </div>
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
      } else if (title.includes('Verification')) {
        window.location.href = '../trustee-verification/trustee-verification.html';
      } else if (title.includes('Share')) {
        window.location.href = '../share-submission/share-submission.html';
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
      } else if (label.includes('Shares Submitted')) {
        window.location.href = '../share-submission/share-submission.html';
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
