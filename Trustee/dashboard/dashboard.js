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
});

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
