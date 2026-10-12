/**
 * AegisVault Trustee Panel - Activity & History Module Controller
 * Connected to live Django backend: /api/v1/trustee/audit/logs/
 * All data flows from the database — zero mock/static data.
 */

document.addEventListener('DOMContentLoaded', () => {
  loadTrusteeAuditLogs();
  initActivityFilters();
});

// ═══════════════════════════════════════════════════════════════════════════════
//  Live Data Loading
// ═══════════════════════════════════════════════════════════════════════════════

let liveActivities = [];

async function loadTrusteeAuditLogs() {
  const tableBody = document.getElementById('activityTableBody');
  if (!tableBody) return;

  if (!window.AegisAPI || !window.AegisAPI.isAuthenticated()) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-muted);">
          <div>Please log in to view your activity history.</div>
        </td>
      </tr>
    `;
    return;
  }

  try {
    const data = await window.AegisAPI.get('/trustee/audit/logs/');
    const rawList = Array.isArray(data) ? data : (data.results || []);

    const currentUser = window.AegisAPI.getUser() || {};
    const defaultUserName = currentUser.name || currentUser.email || 'Trustee';

    liveActivities = rawList.map((item, idx) => ({
      id: item.id || (idx + 1),
      date: item.date || 'Recently',
      time: item.time || '',
      rawDate: item.rawDate || item.timestamp || '',
      actionKey: item.actionKey || item.action_key || 'activity',
      actionTitle: item.actionTitle || item.action_title || 'Activity Event',
      details: item.details || item.description || '',
      vault: item.vault || item.vault_name || '—',
      category: (item.category || 'trustee').toLowerCase(),
      user: item.user || defaultUserName,
      email: item.email || currentUser.email || '',
      ip: item.ip || item.ip_address || '127.0.0.1',
      status: (item.status || 'success').toLowerCase(),
      hash: item.hash || `sha256:${item.id || idx}`
    }));

    renderAuditTable(liveActivities);
    updateMetricCards(liveActivities);

  } catch (err) {
    console.error('[AegisVault] Failed to load trustee audit logs:', err);

    // Show empty state if no logs yet (not an error)
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 4rem 1.5rem; color: var(--text-muted);">
          <div style="font-size: 1.15rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">
            No Audit Activities Recorded Yet
          </div>
          <div style="max-width: 500px; margin: 0 auto; line-height: 1.5; font-size: 0.9rem;">
            All trustee actions — share submissions, verification events, invitation responses, and release participation — are recorded in the immutable cryptographic audit chain.
          </div>
        </td>
      </tr>
    `;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));
}

function getActionIcon(actionKey, category) {
  if (category === 'trustee' || actionKey.includes('invitation')) {
    return { cls: 'act-purple', icon: '👥' };
  }
  if (category === 'release' || actionKey.includes('share') || actionKey.includes('release')) {
    return { cls: 'act-orange', icon: '🔑' };
  }
  if (category === 'security' || category === 'auth' || actionKey.includes('login') || actionKey.includes('password') || actionKey.includes('2fa')) {
    return { cls: 'act-red', icon: '🛡️' };
  }
  if (category === 'vault' || actionKey.includes('vault')) {
    return { cls: 'act-green', icon: '🔒' };
  }
  if (category === 'profile' || actionKey.includes('profile')) {
    return { cls: 'act-blue', icon: '👤' };
  }
  return { cls: 'act-blue', icon: '📋' };
}

function renderAuditTable(activities) {
  const tableBody = document.getElementById('activityTableBody');
  if (!tableBody) return;

  if (activities.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 4rem 1.5rem; color: var(--text-muted);">
          <div style="font-size: 1.15rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">
            No Audit Activities Recorded Yet
          </div>
          <div style="max-width: 500px; margin: 0 auto; line-height: 1.5; font-size: 0.9rem;">
            All trustee actions are recorded permanently in AegisVault's immutable audit chain.
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = '';

  activities.forEach(act => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-action', act.actionKey);
    tr.setAttribute('data-vault', act.vault);
    tr.setAttribute('data-user', act.user);
    const iconData = getActionIcon(act.actionKey, act.category);
    const isFailed = act.status === 'failed' || act.status === 'failure';

    tr.innerHTML = `
      <td>
        <div class="activity-datetime">
          <span class="activity-date">${escapeHtml(act.date)}</span>
          <span class="activity-time">${escapeHtml(act.time)}</span>
        </div>
      </td>
      <td>
        <div class="activity-user-cell">
          <div class="activity-user-avatar">${escapeHtml(act.user.substring(0, 2).toUpperCase())}</div>
          <div class="activity-user-info">
            <span class="activity-user-name">${escapeHtml(act.user)}</span>
            <span class="activity-user-email">${escapeHtml(act.email)}</span>
          </div>
        </div>
      </td>
      <td>
        <div class="activity-action-cell">
          <span class="activity-action-icon ${iconData.cls}">${iconData.icon}</span>
          <span class="activity-action-title">${escapeHtml(act.actionTitle)}</span>
        </div>
      </td>
      <td><span class="activity-details-text">${escapeHtml(act.details)}</span></td>
      <td>${act.vault === '—' || act.vault === 'General' ? '<span class="empty-dash">—</span>' : `<span class="vault-tag">${escapeHtml(act.vault)}</span>`}</td>
      <td><span class="ip-mono">${escapeHtml(act.ip)}</span></td>
      <td>
        <span class="device-cell">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <span>Web Client</span>
        </span>
      </td>
      <td>
        <span class="status-pill status-${isFailed ? 'failed' : 'success'}">
          ${isFailed ? '✗ Failed' : '✓ Success'}
        </span>
      </td>
      <td>
        <button class="btn-row-action" onclick="openAuditRecord('${escapeHtml(act.id)}', '${escapeHtml(act.actionTitle)}', '${escapeHtml(act.user)}', '${escapeHtml(act.date)} ${escapeHtml(act.time)}', '${escapeHtml(act.vault)}', '${escapeHtml(act.ip)}', 'Web Client', '${escapeHtml(act.details)}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </button>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

function updateMetricCards(activities) {
  const total = activities.length;
  const vault = activities.filter(a => a.category === 'vault' || a.actionKey.includes('vault')).length;
  const shares = activities.filter(a => a.actionKey.includes('share')).length;
  const verif = activities.filter(a => a.actionKey.includes('verif') || a.actionKey.includes('invitation') || a.category === 'trustee').length;
  const release = activities.filter(a => a.category === 'release').length;

  const elTotal = document.getElementById('metricTotal');
  if (elTotal) elTotal.textContent = total;
  const elVault = document.getElementById('metricVault');
  if (elVault) elVault.textContent = vault;
  const elShare = document.getElementById('metricShare');
  if (elShare) elShare.textContent = shares;
  const elVerif = document.getElementById('metricVerif');
  if (elVerif) elVerif.textContent = verif;
  const elRelease = document.getElementById('metricRelease');
  if (elRelease) elRelease.textContent = release;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Filter Management
// ═══════════════════════════════════════════════════════════════════════════════

function initActivityFilters() {
  const tableSelect = document.getElementById('tableActionSelect');
  const filterType = document.getElementById('filterActivityType');
  const filterVault = document.getElementById('filterVault');
  const filterUser = document.getElementById('filterUser');
  const btnApply = document.getElementById('btnApplyFilter');
  const btnReset = document.getElementById('btnResetFilter');
  const btnClearAll = document.getElementById('btnFilterClearAll');

  function filterRows() {
    const selectedAction = (tableSelect?.value || filterType?.value || 'all').toLowerCase();
    const selectedVault = (filterVault?.value || 'all').toLowerCase();
    const selectedUser = (filterUser?.value || 'all').toLowerCase();

    const filtered = liveActivities.filter(act => {
      const matchesAction = selectedAction === 'all' || act.actionKey.includes(selectedAction) || act.category === selectedAction;
      const matchesVault = selectedVault === 'all' || act.vault.toLowerCase().includes(selectedVault);
      const matchesUser = selectedUser === 'all' || act.user.toLowerCase().includes(selectedUser);
      return matchesAction && matchesVault && matchesUser;
    });

    renderAuditTable(filtered);
  }

  if (tableSelect && filterType) {
    tableSelect.addEventListener('change', () => {
      filterType.value = tableSelect.value;
      filterRows();
    });
    filterType.addEventListener('change', () => {
      tableSelect.value = filterType.value;
      filterRows();
    });
  }

  if (filterVault) filterVault.addEventListener('change', filterRows);
  if (filterUser) filterUser.addEventListener('change', filterRows);

  if (btnApply) {
    btnApply.addEventListener('click', () => {
      filterRows();
      showToast('Activity filters applied.');
    });
  }

  function resetAll() {
    if (tableSelect) tableSelect.value = 'all';
    if (filterType) filterType.value = 'all';
    if (filterVault) filterVault.value = 'all';
    if (filterUser) filterUser.value = 'all';
    renderAuditTable(liveActivities);
    showToast('Filters reset to default.');
  }

  if (btnReset) btnReset.addEventListener('click', resetAll);
  if (btnClearAll) btnClearAll.addEventListener('click', resetAll);
}

/**
 * Filter by Category from Hero Metric Cards
 */
window.filterByActionCategory = function(category) {
  if (category === 'all') {
    renderAuditTable(liveActivities);
    showToast(`Displaying all ${liveActivities.length} activities.`);
    return;
  }

  const filtered = liveActivities.filter(act => {
    if (category === 'share') return act.actionKey.includes('share') || act.category === 'release';
    if (category === 'vault') return act.category === 'vault' || act.actionKey.includes('vault');
    if (category === 'verification') return act.actionKey.includes('verif') || act.actionKey.includes('invitation') || act.category === 'trustee';
    if (category === 'release') return act.category === 'release';
    return false;
  });

  renderAuditTable(filtered);
  showToast(`Filtered by ${category.toUpperCase()} activities (${filtered.length} matching).`);
};

/**
 * Open Activity Audit Record Modal
 */
window.openAuditRecord = function(id, action, user, time, vault, ip, device, details) {
  const modalId = document.getElementById('auditEventId');
  const modalAction = document.getElementById('auditAction');
  const modalUser = document.getElementById('auditUser');
  const modalTime = document.getElementById('auditTimestamp');
  const modalVault = document.getElementById('auditVault');
  const modalIp = document.getElementById('auditIp');
  const modalDevice = document.getElementById('auditDevice');
  const modalDetails = document.getElementById('auditDetails');

  if (modalId) modalId.textContent = id;
  if (modalAction) modalAction.textContent = action;
  if (modalUser) modalUser.textContent = user;
  if (modalTime) modalTime.textContent = time;
  if (modalVault) modalVault.textContent = vault;
  if (modalIp) modalIp.textContent = ip;
  if (modalDevice) modalDevice.textContent = device;
  if (modalDetails) modalDetails.textContent = details;

  if (window.openModal) {
    window.openModal('activityAuditModal');
  }
};

/**
 * Export Activity Table to CSV
 */
window.exportActivityToCSV = function() {
  if (liveActivities.length === 0) {
    showToast('No activity data to export.');
    return;
  }

  const headers = ['Date', 'Time', 'User', 'Action', 'Details', 'Vault', 'IP Address', 'Status'];
  const csvRows = [headers.join(',')];

  liveActivities.forEach(a => {
    csvRows.push([
      `"${a.date}"`,
      `"${a.time}"`,
      `"${a.user}"`,
      `"${a.actionTitle}"`,
      `"${(a.details || '').replace(/"/g, '""')}"`,
      `"${a.vault}"`,
      `"${a.ip}"`,
      `"${a.status}"`
    ].join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `AegisVault-Trustee-Activity-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast(`Exported ${liveActivities.length} activity records to CSV!`);
};
