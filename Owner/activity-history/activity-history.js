/**
 * AegisVault Owner Panel — Activity & History Module
 * Module 08: Immutable Audit Logs, Forensic Traces & Action History
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Mock Data Source
  // =========================================================================
  const activities = [
    {
      id: 1,
      date: '15 Sep 2025',
      time: '10:24 AM',
      rawDate: '2025-09-15 10:24',
      actionKey: 'vault_created',
      actionTitle: 'Vault Created',
      details: 'Family Memories vault created',
      vault: 'Family Memories',
      category: 'vault',
      user: 'Sneha Mehta',
      email: 'sneha.mehta@email.com',
      avatar: '../assets/images/trustee-avatar-2.png',
      ip: '203.0.113.25',
      status: 'success'
    },
    {
      id: 2,
      date: '14 Sep 2025',
      time: '04:12 PM',
      rawDate: '2025-09-14 16:12',
      actionKey: 'trustee_added',
      actionTitle: 'Trustee Added',
      details: 'Amit Kumar added as trustee',
      vault: 'Business Documents',
      category: 'trustee',
      user: 'Rakesh Patel',
      email: 'rakesh.patel@email.com',
      avatar: '../assets/images/trustee-avatar-8.png',
      ip: '203.0.113.42',
      status: 'success'
    },
    {
      id: 3,
      date: '12 Sep 2025',
      time: '11:05 AM',
      rawDate: '2025-09-12 11:05',
      actionKey: 'invitation_sent',
      actionTitle: 'Invitation Sent',
      details: 'Invitation sent to Priya Sharma',
      vault: 'Medical Records',
      category: 'invitation',
      user: 'Rakesh Patel',
      email: 'rakesh.patel@email.com',
      avatar: '../assets/images/trustee-avatar-8.png',
      ip: '203.0.113.42',
      status: 'success'
    },
    {
      id: 4,
      date: '05 Sep 2025',
      time: '02:16 PM',
      rawDate: '2025-09-05 14:16',
      actionKey: 'invitation_accepted',
      actionTitle: 'Invitation Accepted',
      details: 'Priya Sharma accepted invitation',
      vault: 'Medical Records',
      category: 'invitation',
      user: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      avatar: '../assets/images/trustee-avatar-4.png',
      ip: '198.51.100.18',
      status: 'success'
    },
    {
      id: 5,
      date: '01 Sep 2025',
      time: '04:38 PM',
      rawDate: '2025-09-01 16:38',
      actionKey: 'release_scheduled',
      actionTitle: 'Release Scheduled',
      details: 'Release scheduled for Medical Records',
      vault: 'Medical Records',
      category: 'release',
      user: 'Rakesh Patel',
      email: 'rakesh.patel@email.com',
      avatar: '../assets/images/trustee-avatar-8.png',
      ip: '203.0.113.42',
      status: 'success'
    },
    {
      id: 6,
      date: '28 Aug 2025',
      time: '11:05 AM',
      rawDate: '2025-08-28 11:05',
      actionKey: 'login_failed',
      actionTitle: 'Login Failed',
      details: 'Invalid password attempt',
      vault: 'General',
      category: 'security',
      user: 'Rakesh Patel',
      email: 'rakesh.patel@email.com',
      avatar: '../assets/images/trustee-avatar-8.png',
      ip: '203.0.113.88',
      status: 'failed'
    },
    {
      id: 7,
      date: '22 Aug 2025',
      time: '03:21 PM',
      rawDate: '2025-08-22 15:21',
      actionKey: 'vault_updated',
      actionTitle: 'Vault Updated',
      details: 'Updated description',
      vault: 'Business Documents',
      category: 'vault',
      user: 'Rakesh Patel',
      email: 'rakesh.patel@email.com',
      avatar: '../assets/images/trustee-avatar-8.png',
      ip: '203.0.113.42',
      status: 'success'
    },
    {
      id: 8,
      date: '18 Aug 2025',
      time: '10:14 AM',
      rawDate: '2025-08-18 10:14',
      actionKey: 'release_cancelled',
      actionTitle: 'Release Cancelled',
      details: 'Release cancelled for Travel Itinerary',
      vault: 'Travel Itinerary',
      category: 'release',
      user: 'Rakesh Patel',
      email: 'rakesh.patel@email.com',
      avatar: '../assets/images/trustee-avatar-8.png',
      ip: '203.0.113.42',
      status: 'success'
    },
    {
      id: 9,
      date: '12 Aug 2025',
      time: '01:45 PM',
      rawDate: '2025-08-12 13:45',
      actionKey: 'document_added',
      actionTitle: 'Document Added',
      details: 'Added "Passport.pdf"',
      vault: 'Travel Itinerary',
      category: 'vault',
      user: 'Sneha Mehta',
      email: 'sneha.mehta@email.com',
      avatar: '../assets/images/trustee-avatar-2.png',
      ip: '198.51.100.67',
      status: 'success'
    },
    {
      id: 10,
      date: '10 Aug 2025',
      time: '09:20 AM',
      rawDate: '2025-08-10 09:20',
      actionKey: 'settings_updated',
      actionTitle: 'Settings Updated',
      details: 'Changed notification preferences',
      vault: 'General',
      category: 'settings',
      user: 'Rakesh Patel',
      email: 'rakesh.patel@email.com',
      avatar: '../assets/images/trustee-avatar-8.png',
      ip: '203.0.113.42',
      status: 'success'
    }
  ];

  let currentSort = { column: 'date', order: 'desc' };
  let activeContextRowId = null;

  // =========================================================================
  // 2. DOM Elements
  // =========================================================================
  const activitySearchInput = document.getElementById('activitySearchInput');
  const filterAction = document.getElementById('filterAction');
  const filterVault = document.getElementById('filterVault');
  const filterUser = document.getElementById('filterUser');
  const filterDate = document.getElementById('filterDate');
  const activityTableBody = document.getElementById('activityTableBody');

  const contextMenu = document.getElementById('activityContextMenu');
  const ctxViewActivity = document.getElementById('ctxViewActivity');
  const ctxFilterByUser = document.getElementById('ctxFilterByUser');
  const ctxFilterByVault = document.getElementById('ctxFilterByVault');

  const exportModal = document.getElementById('exportModal');
  const activityDetailModal = document.getElementById('activityDetailModal');
  const btnOpenExport = document.getElementById('btnOpenExport');
  const btnConfirmExport = document.getElementById('btnConfirmExport');
  const qaExportHistory = document.getElementById('qaExportHistory');

  const qaViewVaultAct = document.getElementById('qaViewVaultAct');
  const qaViewTrusteeAct = document.getElementById('qaViewTrusteeAct');
  const qaViewInvAct = document.getElementById('qaViewInvAct');
  const qaViewRelAct = document.getElementById('qaViewRelAct');

  const thSortDate = document.getElementById('thSortDate');
  const thSortAction = document.getElementById('thSortAction');

  // =========================================================================
  // 3. Filtering Logic
  // =========================================================================
  function applyFilters() {
    const query = (activitySearchInput?.value || '').toLowerCase().trim();
    const actionVal = filterAction?.value || 'all';
    const vaultVal = filterVault?.value || 'all';
    const userVal = filterUser?.value || 'all';

    const checkedCategories = Array.from(document.querySelectorAll('.side-filter-check:checked')).map(cb => cb.getAttribute('data-category'));

    const rows = activityTableBody.querySelectorAll('.activity-row');
    rows.forEach(row => {
      const id = parseInt(row.getAttribute('data-id'), 10);
      const act = activities.find(a => a.id === id);
      if (!act) return;

      const matchesSearch = !query ||
        act.actionTitle.toLowerCase().includes(query) ||
        act.details.toLowerCase().includes(query) ||
        act.vault.toLowerCase().includes(query) ||
        act.user.toLowerCase().includes(query) ||
        act.ip.includes(query);

      const matchesAction = (actionVal === 'all') || (act.actionKey === actionVal);
      const matchesVault = (vaultVal === 'all') || (act.vault === vaultVal);
      const matchesUser = (userVal === 'all') || (act.user === userVal);
      const matchesCategory = checkedCategories.length === 0 || checkedCategories.includes(act.category);

      if (matchesSearch && matchesAction && matchesVault && matchesUser && matchesCategory) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  if (activitySearchInput) activitySearchInput.addEventListener('input', applyFilters);
  if (filterAction) filterAction.addEventListener('change', applyFilters);
  if (filterVault) filterVault.addEventListener('change', applyFilters);
  if (filterUser) filterUser.addEventListener('change', applyFilters);
  if (filterDate) filterDate.addEventListener('change', () => {
    if (window.AegisOwner) window.AegisOwner.showToast(`Showing activities for: ${filterDate.options[filterDate.selectedIndex].text}`, 'info');
  });

  document.querySelectorAll('.side-filter-check').forEach(cb => {
    cb.addEventListener('change', () => {
      applyFilters();
      if (window.AegisOwner) window.AegisOwner.showToast('Activity category filter updated', 'info');
    });
  });

  // KPI Cards Quick Filter Click
  document.querySelectorAll('.metric-card').forEach(card => {
    card.addEventListener('click', () => {
      const filter = card.getAttribute('data-filter');
      if (filter === 'all') {
        filterAction.value = 'all';
        filterVault.value = 'all';
        filterUser.value = 'all';
      } else if (filter === 'vault') {
        filterAction.value = 'vault_created';
      } else if (filter === 'trustee') {
        filterAction.value = 'trustee_added';
      } else if (filter === 'invitation') {
        filterAction.value = 'invitation_sent';
      } else if (filter === 'release') {
        filterAction.value = 'release_scheduled';
      }
      applyFilters();
      if (window.AegisOwner) {
        window.AegisOwner.showToast(`Filtered by ${card.querySelector('.metric-label').textContent}`, 'info');
      }
    });
  });

  // Check URL query parameters (e.g. ?action=release or ?vault=Family%20Memories)
  const urlParams = new URLSearchParams(window.location.search);
  const initialAction = urlParams.get('action') || urlParams.get('filter');
  const initialVault = urlParams.get('vault');
  if (initialAction && filterAction) {
    const match = Array.from(filterAction.options).find(o => o.value.toLowerCase() === initialAction.toLowerCase());
    if (match) filterAction.value = match.value;
  }
  if (initialVault && filterVault) {
    const matchV = Array.from(filterVault.options).find(o => o.value.toLowerCase().includes(initialVault.toLowerCase()));
    if (matchV) filterVault.value = matchV.value;
  }
  applyFilters();

  // More Filters button toggle
  const btnMoreFilters = document.getElementById('btnMoreFilters');
  let moreFiltersState = false;
  if (btnMoreFilters) {
    btnMoreFilters.addEventListener('click', () => {
      moreFiltersState = !moreFiltersState;
      if (moreFiltersState) {
        btnMoreFilters.style.borderColor = 'var(--brand-orange)';
        btnMoreFilters.style.color = 'var(--brand-orange)';
        btnMoreFilters.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"/></svg> Critical Only`;
        if (filterAction) filterAction.value = 'release_scheduled';
        applyFilters();
        if (window.AegisOwner) window.AegisOwner.showToast('Advanced Filter: Critical Escrow & Release Activities', 'info');
      } else {
        btnMoreFilters.style.borderColor = '';
        btnMoreFilters.style.color = '';
        btnMoreFilters.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> <span>More Filters</span>`;
        if (filterAction) filterAction.value = 'all';
        applyFilters();
        if (window.AegisOwner) window.AegisOwner.showToast('Filters reset', 'info');
      }
    });
  }

  // Side Filter Checkboxes
  document.querySelectorAll('.side-filter-check').forEach(chk => {
    chk.addEventListener('change', () => {
      const cat = chk.getAttribute('data-category');
      const rows = activityTableBody.querySelectorAll('.activity-row');
      rows.forEach(row => {
        const id = parseInt(row.getAttribute('data-id'), 10);
        const act = activities.find(a => a.id === id);
        if (act && act.category === cat) {
          row.style.display = chk.checked ? '' : 'none';
        }
      });
    });
  });

  // Quick Action Buttons
  if (qaViewVaultAct) {
    qaViewVaultAct.addEventListener('click', () => {
      filterAction.value = 'all';
      filterVault.value = 'Family Memories';
      applyFilters();
      if (window.AegisOwner) window.AegisOwner.showToast('Showing Vault Activities', 'info');
    });
  }
  if (qaViewTrusteeAct) {
    qaViewTrusteeAct.addEventListener('click', () => {
      filterAction.value = 'trustee_added';
      filterVault.value = 'all';
      applyFilters();
      if (window.AegisOwner) window.AegisOwner.showToast('Showing Trustee Activities', 'info');
    });
  }
  if (qaViewInvAct) {
    qaViewInvAct.addEventListener('click', () => {
      filterAction.value = 'invitation_sent';
      filterVault.value = 'all';
      applyFilters();
      if (window.AegisOwner) window.AegisOwner.showToast('Showing Invitation Activities', 'info');
    });
  }
  if (qaViewRelAct) {
    qaViewRelAct.addEventListener('click', () => {
      filterAction.value = 'release_scheduled';
      filterVault.value = 'all';
      applyFilters();
      if (window.AegisOwner) window.AegisOwner.showToast('Showing Release Activities', 'info');
    });
  }

  // =========================================================================
  // 4. Column Sorting
  // =========================================================================
  if (thSortDate) {
    thSortDate.addEventListener('click', () => {
      currentSort.order = currentSort.column === 'date' && currentSort.order === 'desc' ? 'asc' : 'desc';
      currentSort.column = 'date';
      sortRows();
    });
  }

  if (thSortAction) {
    thSortAction.addEventListener('click', () => {
      currentSort.order = currentSort.column === 'action' && currentSort.order === 'asc' ? 'desc' : 'asc';
      currentSort.column = 'action';
      sortRows();
    });
  }

  function sortRows() {
    const rows = Array.from(activityTableBody.querySelectorAll('.activity-row'));
    rows.sort((a, b) => {
      const idA = parseInt(a.getAttribute('data-id'), 10);
      const idB = parseInt(b.getAttribute('data-id'), 10);
      const itemA = activities.find(x => x.id === idA);
      const itemB = activities.find(x => x.id === idB);

      if (currentSort.column === 'date') {
        const comp = itemA.rawDate.localeCompare(itemB.rawDate);
        return currentSort.order === 'asc' ? comp : -comp;
      } else {
        const comp = itemA.actionTitle.localeCompare(itemB.actionTitle);
        return currentSort.order === 'asc' ? comp : -comp;
      }
    });

    rows.forEach(r => activityTableBody.appendChild(r));
    if (window.AegisOwner) window.AegisOwner.showToast(`Sorted by ${currentSort.column} (${currentSort.order})`, 'info');
  }

  // =========================================================================
  // 5. Context Menu & Row Click
  // =========================================================================
  activityTableBody.addEventListener('click', (e) => {
    const moreBtn = e.target.closest('.btn-row-more');
    if (moreBtn) {
      e.stopPropagation();
      activeContextRowId = parseInt(moreBtn.getAttribute('data-id'), 10);
      const rect = moreBtn.getBoundingClientRect();
      contextMenu.style.top = `${rect.bottom + window.scrollY + 4}px`;
      contextMenu.style.left = `${rect.right + window.scrollX - 180}px`;
      contextMenu.style.display = 'block';
      return;
    }

    const row = e.target.closest('.activity-row');
    if (row) {
      const id = parseInt(row.getAttribute('data-id'), 10);
      openAuditModal(id);
    }
  });

  document.addEventListener('click', () => {
    if (contextMenu) contextMenu.style.display = 'none';
  });

  if (ctxViewActivity) {
    ctxViewActivity.addEventListener('click', () => {
      if (activeContextRowId) openAuditModal(activeContextRowId);
    });
  }

  if (ctxFilterByUser) {
    ctxFilterByUser.addEventListener('click', () => {
      const act = activities.find(a => a.id === activeContextRowId);
      if (act) {
        filterUser.value = act.user;
        applyFilters();
        if (window.AegisOwner) window.AegisOwner.showToast(`Filtered by user: ${act.user}`, 'info');
      }
    });
  }

  if (ctxFilterByVault) {
    ctxFilterByVault.addEventListener('click', () => {
      const act = activities.find(a => a.id === activeContextRowId);
      if (act && act.vault !== 'General') {
        filterVault.value = act.vault;
        applyFilters();
        if (window.AegisOwner) window.AegisOwner.showToast(`Filtered by vault: ${act.vault}`, 'info');
      }
    });
  }

  // =========================================================================
  // 6. Modals
  // =========================================================================
  function openModal(modal) {
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('active');
    }
  }

  function closeModal(modal) {
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active');
    }
  }

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-close');
      const target = document.getElementById(targetId);
      closeModal(target);
    });
  });

  // Export Modal
  if (btnOpenExport) {
    btnOpenExport.addEventListener('click', () => openModal(exportModal));
  }
  if (qaExportHistory) {
    qaExportHistory.addEventListener('click', () => openModal(exportModal));
  }

  // Format radio buttons styling
  document.querySelectorAll('.format-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.format-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  if (btnConfirmExport) {
    btnConfirmExport.addEventListener('click', () => {
      const selectedFormat = document.querySelector('input[name="exportFormat"]:checked')?.value || 'csv';
      closeModal(exportModal);

      const filename = `aegisvault_audit_export_${Date.now()}.${selectedFormat}`;
      let content = '';
      let mimeType = 'text/plain';

      if (selectedFormat === 'json') {
        content = JSON.stringify(activities, null, 2);
        mimeType = 'application/json';
      } else if (selectedFormat === 'csv') {
        const headers = ['ID', 'Date', 'Time', 'Action', 'Details', 'Vault', 'Performed By', 'Email', 'IP Address', 'Status'];
        const csvRows = [headers.join(',')];
        activities.forEach(a => {
          csvRows.push([
            a.id,
            `"${a.date}"`,
            `"${a.time}"`,
            `"${a.actionTitle}"`,
            `"${a.details.replace(/"/g, '""')}"`,
            `"${a.vault}"`,
            `"${a.user}"`,
            `"${a.email}"`,
            `"${a.ip}"`,
            `"${a.status}"`
          ].join(','));
        });
        content = csvRows.join('\n');
        mimeType = 'text/csv';
      } else {
        // PDF / Plain text report format
        content = `AEGISVAULT AUDIT TRAIL EXPORT REPORT\nGenerated: ${new Date().toISOString()}\nTotal Activities: ${activities.length}\n\n` +
          activities.map(a => `[${a.date} ${a.time}] ${a.actionTitle} | Vault: ${a.vault} | User: ${a.user} (${a.email}) | IP: ${a.ip} | Status: ${a.status}\nDetails: ${a.details}\n`).join('\n----------------------------------------\n');
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (window.AegisOwner) {
        window.AegisOwner.showToast(`Exported ${filename} (${activities.length} records)`, 'success');
      }
    });
  }

  // Audit Detail Modal
  function openAuditModal(id) {
    const act = activities.find(a => a.id === id);
    if (!act) return;

    const modalAuditBadge = document.getElementById('modalAuditBadge');
    const modalTimestamp = document.getElementById('modalTimestamp');
    const modalAuditDesc = document.getElementById('modalAuditDesc');
    const modalUser = document.getElementById('modalUser');
    const modalIp = document.getElementById('modalIp');
    const modalVault = document.getElementById('modalVault');
    const modalStatus = document.getElementById('modalStatus');

    if (modalAuditBadge) modalAuditBadge.textContent = act.actionTitle;
    if (modalTimestamp) modalTimestamp.textContent = `${act.date}, ${act.time}`;
    if (modalAuditDesc) modalAuditDesc.textContent = `${act.details} by ${act.user}.`;
    if (modalUser) modalUser.textContent = `${act.user} (${act.email})`;
    if (modalIp) modalIp.textContent = act.ip;
    if (modalVault) modalVault.textContent = act.vault;
    if (modalStatus) modalStatus.textContent = act.status.charAt(0).toUpperCase() + act.status.slice(1);

    openModal(activityDetailModal);
  }
});
