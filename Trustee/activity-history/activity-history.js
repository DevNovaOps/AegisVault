/**
 * AegisVault Trustee Panel - Activity & History Module Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initActivityFilters();
});

/**
 * Filter Management
 */
function initActivityFilters() {
  const tableSelect = document.getElementById('tableActionSelect');
  const filterType = document.getElementById('filterActivityType');
  const filterVault = document.getElementById('filterVault');
  const filterUser = document.getElementById('filterUser');
  const btnApply = document.getElementById('btnApplyFilter');
  const btnReset = document.getElementById('btnResetFilter');
  const btnClearAll = document.getElementById('btnFilterClearAll');
  const tableBody = document.getElementById('activityTableBody');

  if (!tableBody) return;

  function filterRows() {
    const selectedAction = (tableSelect?.value || filterType?.value || 'all').toLowerCase();
    const selectedVault = (filterVault?.value || 'all').toLowerCase();
    const selectedUser = (filterUser?.value || 'all').toLowerCase();

    const rows = tableBody.querySelectorAll('tr');
    let visibleCount = 0;

    rows.forEach(row => {
      const action = (row.getAttribute('data-action') || '').toLowerCase();
      const vault = (row.getAttribute('data-vault') || '').toLowerCase();
      const user = (row.getAttribute('data-user') || '').toLowerCase();

      const matchesAction = selectedAction === 'all' || action === selectedAction;
      const matchesVault = selectedVault === 'all' || vault.includes(selectedVault);
      const matchesUser = selectedUser === 'all' || user.includes(selectedUser);

      if (matchesAction && matchesVault && matchesUser) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    // Zero-state handling
    let emptyRow = document.getElementById('activityEmptyRow');
    if (visibleCount === 0) {
      if (!emptyRow) {
        emptyRow = document.createElement('tr');
        emptyRow.id = 'activityEmptyRow';
        emptyRow.innerHTML = `
          <td colspan="9" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 0.5rem; opacity: 0.5;">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">No activity records match filters</div>
            <div style="font-size: 0.82rem;">Adjust your filter criteria or reset to view all activity logs.</div>
          </td>
        `;
        tableBody.appendChild(emptyRow);
      }
    } else if (emptyRow) {
      emptyRow.remove();
    }
  }

  // Connect table header dropdown and sidebar dropdown
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
    filterRows();
    showToast('Filters reset to default.');
  }

  if (btnReset) btnReset.addEventListener('click', resetAll);
  if (btnClearAll) btnClearAll.addEventListener('click', resetAll);
}

/**
 * Filter by Category from Hero Metric Cards
 */
window.filterByActionCategory = function(category) {
  const tableBody = document.getElementById('activityTableBody');
  const tableSelect = document.getElementById('tableActionSelect');
  const filterType = document.getElementById('filterActivityType');
  if (!tableBody) return;

  if (category === 'all') {
    if (tableSelect) tableSelect.value = 'all';
    if (filterType) filterType.value = 'all';
    tableBody.querySelectorAll('tr').forEach(r => r.style.display = '');
    showToast('Displaying all 186 activities.');
    return;
  }

  let count = 0;
  tableBody.querySelectorAll('tr').forEach(row => {
    const action = (row.getAttribute('data-action') || '').toLowerCase();
    const vault = (row.getAttribute('data-vault') || '').toLowerCase();

    let match = false;
    if (category === 'share' && action.includes('share')) match = true;
    else if (category === 'vault' && (action.includes('vault') || vault !== '—')) match = true;
    else if (category === 'verification' && action.includes('verifi')) match = true;
    else if (category === 'release' && action.includes('release')) match = true;

    if (match) {
      row.style.display = '';
      count++;
    } else {
      row.style.display = 'none';
    }
  });

  showToast(`Filtered by ${category.toUpperCase()} activities (${count} matching in current view).`);
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
  const table = document.getElementById('activityTable');
  if (!table) return;

  const rows = table.querySelectorAll('tbody tr');
  let csvContent = 'Date & Time,User,Action,Details,Vault,IP Address,Status\n';

  rows.forEach(row => {
    if (row.style.display === 'none') return;
    const cols = row.querySelectorAll('td');
    if (cols.length < 8) return;

    const dateTime = `"${cols[0].textContent.trim()}"`;
    const user = `"${cols[1].textContent.trim().replace(/\s+/g, ' ')}"`;
    const action = `"${cols[2].textContent.trim().replace(/\s+/g, ' ')}"`;
    const details = `"${cols[3].textContent.trim().replace(/\s+/g, ' ')}"`;
    const vault = `"${cols[4].textContent.trim()}"`;
    const ip = `"${cols[5].textContent.trim()}"`;
    const status = `"${cols[7].textContent.trim().replace(/\s+/g, ' ')}"`;

    csvContent += [dateTime, user, action, details, vault, ip, status].join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `AegisVault-Activity-History-${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('Activity history exported to CSV successfully!');
};
