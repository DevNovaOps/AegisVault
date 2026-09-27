/**
 * AegisVault Owner Panel — Notifications Module
 * Module 07: Notifications, Alerts, Feeds & Communication Preferences
 */

document.addEventListener('DOMContentLoaded', () => {
  // Theme is fully managed by common.js via window.AegisOwner
  // Listen for theme change events if module-level components need updates
  window.addEventListener('aegis-theme-changed', (e) => {
    // Reactive updates if needed
  });

  // --------------------------------------------------------------------------
  // 2. State & Mock Data
  // --------------------------------------------------------------------------
  let notifications = [
    {
      id: 1,
      type: 'invitation',
      title: 'New trustee invitation sent',
      desc: 'You invited Amit Kumar to your Family Vault.',
      vault: 'Family Vault',
      date: '12 Sep 2025',
      time: '10:24 AM',
      status: 'unread',
      rawDate: '2025-09-12'
    },
    {
      id: 2,
      type: 'trustee',
      title: 'Trustee accepted invitation',
      desc: 'Sneha Mehta has accepted your invitation.',
      vault: 'Personal Vault',
      date: '05 Sep 2025',
      time: '02:16 PM',
      status: 'read',
      rawDate: '2025-09-05'
    },
    {
      id: 3,
      type: 'release',
      title: 'Release scheduled',
      desc: 'A release for Medical Records is scheduled.',
      vault: 'Health Vault',
      date: '01 Sep 2025',
      time: '04:38 PM',
      status: 'unread',
      rawDate: '2025-09-01'
    },
    {
      id: 4,
      type: 'security',
      title: 'Login from new device',
      desc: 'A new device was used to access your account.',
      vault: 'Account Security',
      date: '28 Aug 2025',
      time: '11:05 AM',
      status: 'read',
      rawDate: '2025-08-28'
    },
    {
      id: 5,
      type: 'vault',
      title: 'Vault updated',
      desc: 'You updated documents in Business Vault.',
      vault: 'Business Vault',
      date: '22 Aug 2025',
      time: '03:21 PM',
      status: 'read',
      rawDate: '2025-08-22'
    },
    {
      id: 6,
      type: 'release',
      title: 'Release completed',
      desc: 'Your Travel Itinerary has been released.',
      vault: 'Travel Vault',
      date: '18 Aug 2025',
      time: '10:14 AM',
      status: 'unread',
      rawDate: '2025-08-18'
    },
    {
      id: 7,
      type: 'trustee',
      title: 'Trustee declined invitation',
      desc: 'Vikram Shah declined your invitation.',
      vault: 'Legacy Vault',
      date: '12 Aug 2025',
      time: '01:45 PM',
      status: 'read',
      rawDate: '2025-08-12'
    },
    {
      id: 8,
      type: 'release',
      title: 'Release action required',
      desc: 'A manual release requires your approval.',
      vault: 'Property Vault',
      date: '10 Aug 2025',
      time: '09:20 AM',
      status: 'unread',
      rawDate: '2025-08-10'
    }
  ];

  let selectedNotifIds = new Set();
  let activeContextNotifId = null;

  // --------------------------------------------------------------------------
  // 3. DOM Elements
  // --------------------------------------------------------------------------
  const notifSearchInput = document.getElementById('notifSearchInput');
  const filterType = document.getElementById('filterType');
  const filterVault = document.getElementById('filterVault');
  const filterStatus = document.getElementById('filterStatus');
  const filterDate = document.getElementById('filterDate');
  const selectAllCheckbox = document.getElementById('selectAllCheckbox');
  const notifTableBody = document.getElementById('notifTableBody');
  const bulkActionBar = document.getElementById('bulkActionBar');
  const bulkSelectedText = document.getElementById('bulkSelectedText');
  const btnBulkMarkRead = document.getElementById('btnBulkMarkRead');
  const btnBulkMarkUnread = document.getElementById('btnBulkMarkUnread');
  const btnBulkDelete = document.getElementById('btnBulkDelete');
  const btnMarkAllRead = document.getElementById('btnMarkAllRead');

  const kpiUnreadCount = document.getElementById('kpiUnreadCount');
  const kpiInvitationsCount = document.getElementById('kpiInvitationsCount');
  const kpiReleasesCount = document.getElementById('kpiReleasesCount');
  const kpiTrusteesCount = document.getElementById('kpiTrusteesCount');
  const kpiSecurityCount = document.getElementById('kpiSecurityCount');
  const sidebarNotifBadge = document.getElementById('sidebarNotifBadge');
  const headerNotifBadge = document.getElementById('headerNotifBadge');

  const contextMenu = document.getElementById('notifContextMenu');
  const ctxToggleRead = document.getElementById('ctxToggleRead');
  const ctxViewDetails = document.getElementById('ctxViewDetails');
  const ctxDelete = document.getElementById('ctxDelete');

  const notifSettingsModal = document.getElementById('notifSettingsModal');
  const notifDetailModal = document.getElementById('notifDetailModal');
  const btnNotifSettings = document.getElementById('btnNotifSettings');
  const btnSaveNotifSettings = document.getElementById('btnSaveNotifSettings');
  const qaNotifSettings = document.getElementById('qaNotifSettings');
  const qaEmailPrefs = document.getElementById('qaEmailPrefs');
  const qaPushNotifs = document.getElementById('qaPushNotifs');
  const qaSmsNotifs = document.getElementById('qaSmsNotifs');

  // --------------------------------------------------------------------------
  // 4. Counts & KPI Updater
  // --------------------------------------------------------------------------
  function updateCounts() {
    const unreadCount = notifications.filter(n => n.status === 'unread').length;
    const invCount = notifications.filter(n => n.type === 'invitation').length;
    const relCount = notifications.filter(n => n.type === 'release').length;
    const truCount = notifications.filter(n => n.type === 'trustee').length;
    const secCount = notifications.filter(n => n.type === 'security').length;

    if (kpiUnreadCount) kpiUnreadCount.textContent = unreadCount;
    if (kpiInvitationsCount) kpiInvitationsCount.textContent = invCount;
    if (kpiReleasesCount) kpiReleasesCount.textContent = relCount;
    if (kpiTrusteesCount) kpiTrusteesCount.textContent = truCount;
    if (kpiSecurityCount) kpiSecurityCount.textContent = secCount;

    if (sidebarNotifBadge) {
      sidebarNotifBadge.textContent = unreadCount;
      sidebarNotifBadge.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
    }
    if (headerNotifBadge) {
      headerNotifBadge.textContent = unreadCount;
      headerNotifBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }
  }

  // --------------------------------------------------------------------------
  // 5. Filter & Search Logic
  // --------------------------------------------------------------------------
  function applyFilters() {
    const query = (notifSearchInput?.value || '').toLowerCase().trim();
    const typeVal = filterType?.value || 'all';
    const vaultVal = filterVault?.value || 'all';
    const statusVal = filterStatus?.value || 'all';

    const rows = notifTableBody.querySelectorAll('.notif-row');
    let visibleCount = 0;

    rows.forEach(row => {
      const id = parseInt(row.getAttribute('data-id'), 10);
      const notif = notifications.find(n => n.id === id);
      if (!notif) return;

      const matchesSearch = !query || 
        notif.title.toLowerCase().includes(query) || 
        notif.desc.toLowerCase().includes(query) ||
        notif.vault.toLowerCase().includes(query);

      const matchesType = (typeVal === 'all') || (notif.type === typeVal);
      const matchesVault = (vaultVal === 'all') || (notif.vault === vaultVal);
      const matchesStatus = (statusVal === 'all') || (notif.status === statusVal);

      if (matchesSearch && matchesType && matchesVault && matchesStatus) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    updateBulkBar();
  }

  if (notifSearchInput) notifSearchInput.addEventListener('input', applyFilters);
  if (filterType) filterType.addEventListener('change', applyFilters);
  if (filterVault) filterVault.addEventListener('change', applyFilters);
  if (filterStatus) filterStatus.addEventListener('change', applyFilters);
  if (filterDate) filterDate.addEventListener('change', () => {
    showToast(`Showing notifications for: ${filterDate.options[filterDate.selectedIndex].text}`, 'info');
  });

  // Check URL query parameters (e.g. ?filter=unread or ?type=security)
  const urlParams = new URLSearchParams(window.location.search);
  const initialFilter = urlParams.get('filter') || urlParams.get('status');
  const initialType = urlParams.get('type');
  if (initialFilter && filterStatus) {
    if (initialFilter === 'unread') filterStatus.value = 'unread';
    else if (initialFilter === 'read') filterStatus.value = 'read';
  }
  if (initialType && filterType) {
    filterType.value = initialType;
  }
  applyFilters();

  // Metric Card Quick Filters
  document.querySelectorAll('.metric-card, .kpi-card').forEach(card => {
    card.addEventListener('click', () => {
      const filter = card.getAttribute('data-filter');
      if (filter === 'unread') {
        if (filterStatus) filterStatus.value = 'unread';
        if (filterType) filterType.value = 'all';
      } else if (filter === 'invitations') {
        if (filterType) filterType.value = 'invitation';
        if (filterStatus) filterStatus.value = 'all';
      } else if (filter === 'releases') {
        if (filterType) filterType.value = 'release';
        if (filterStatus) filterStatus.value = 'all';
      } else if (filter === 'trustees') {
        if (filterType) filterType.value = 'trustee';
        if (filterStatus) filterStatus.value = 'all';
      } else if (filter === 'security') {
        if (filterType) filterType.value = 'security';
        if (filterStatus) filterStatus.value = 'all';
      }
      applyFilters();
      const labelText = card.querySelector('.metric-label, .kpi-label')?.textContent || filter;
      showToast(`Filtered by ${labelText}`, 'info');
    });
  });

  // More Filters button toggle
  const btnMoreFilters = document.getElementById('btnMoreFilters');
  let moreFiltersState = false;
  if (btnMoreFilters) {
    btnMoreFilters.addEventListener('click', () => {
      moreFiltersState = !moreFiltersState;
      if (moreFiltersState) {
        btnMoreFilters.style.borderColor = 'var(--brand-orange)';
        btnMoreFilters.style.color = 'var(--brand-orange)';
        btnMoreFilters.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"/></svg> Unread Critical`;
        if (filterStatus) filterStatus.value = 'unread';
        applyFilters();
        showToast('Advanced Filter: Unread alerts requiring immediate action', 'info');
      } else {
        btnMoreFilters.style.borderColor = '';
        btnMoreFilters.style.color = '';
        btnMoreFilters.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> <span>More Filters</span>`;
        if (filterStatus) filterStatus.value = 'all';
        applyFilters();
        showToast('Filters reset', 'info');
      }
    });
  }

  // Side Filter Checkboxes
  document.querySelectorAll('.side-filter-check').forEach(chk => {
    chk.addEventListener('change', () => {
      const cat = chk.getAttribute('data-category');
      if (chk.checked) {
        if (filterType) filterType.value = cat;
      } else {
        if (filterType) filterType.value = 'all';
      }
      applyFilters();
    });
  });

  // --------------------------------------------------------------------------
  // 6. Selection & Bulk Operations
  // --------------------------------------------------------------------------
  function updateBulkBar() {
    const visibleCheckboxes = Array.from(notifTableBody.querySelectorAll('.notif-row:not([style*="display: none"]) .row-checkbox'));
    const checkedCount = selectedNotifIds.size;

    if (checkedCount > 0) {
      bulkActionBar.style.display = 'flex';
      bulkSelectedText.textContent = `${checkedCount} notification${checkedCount > 1 ? 's' : ''} selected`;
    } else {
      bulkActionBar.style.display = 'none';
    }

    if (selectAllCheckbox) {
      if (visibleCheckboxes.length > 0 && visibleCheckboxes.every(cb => cb.checked)) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
      } else if (visibleCheckboxes.some(cb => cb.checked)) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
      } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
      }
    }
  }

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      const visibleRows = notifTableBody.querySelectorAll('.notif-row:not([style*="display: none"])');
      visibleRows.forEach(row => {
        const id = parseInt(row.getAttribute('data-id'), 10);
        const cb = row.querySelector('.row-checkbox');
        if (cb) cb.checked = isChecked;
        if (isChecked) {
          selectedNotifIds.add(id);
        } else {
          selectedNotifIds.delete(id);
        }
      });
      updateBulkBar();
    });
  }

  notifTableBody.addEventListener('change', (e) => {
    if (e.target.classList.contains('row-checkbox')) {
      const row = e.target.closest('.notif-row');
      const id = parseInt(row.getAttribute('data-id'), 10);
      if (e.target.checked) {
        selectedNotifIds.add(id);
      } else {
        selectedNotifIds.delete(id);
      }
      updateBulkBar();
    }
  });

  // Bulk: Mark as Read
  if (btnBulkMarkRead) {
    btnBulkMarkRead.addEventListener('click', () => {
      // TODO: Replace with fetch('/api/v1/owner/notifications/bulk-read', { method: 'POST', body: JSON.stringify({ ids: Array.from(selectedNotifIds) }) })
      selectedNotifIds.forEach(id => {
        const notif = notifications.find(n => n.id === id);
        if (notif) notif.status = 'read';
        updateRowDOM(id, 'read');
      });
      selectedNotifIds.clear();
      updateBulkBar();
      updateCounts();
      showToast('Selected notifications marked as read', 'success');
    });
  }

  // Bulk: Mark as Unread
  if (btnBulkMarkUnread) {
    btnBulkMarkUnread.addEventListener('click', () => {
      selectedNotifIds.forEach(id => {
        const notif = notifications.find(n => n.id === id);
        if (notif) notif.status = 'unread';
        updateRowDOM(id, 'unread');
      });
      selectedNotifIds.clear();
      updateBulkBar();
      updateCounts();
      showToast('Selected notifications marked as unread', 'info');
    });
  }

  // Bulk: Delete
  if (btnBulkDelete) {
    btnBulkDelete.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete ${selectedNotifIds.size} notification(s)?`)) {
        selectedNotifIds.forEach(id => {
          notifications = notifications.filter(n => n.id !== id);
          const row = notifTableBody.querySelector(`.notif-row[data-id="${id}"]`);
          if (row) row.remove();
        });
        selectedNotifIds.clear();
        updateBulkBar();
        updateCounts();
        showToast('Selected notifications removed', 'success');
      }
    });
  }

  // Mark All as Read button
  if (btnMarkAllRead) {
    btnMarkAllRead.addEventListener('click', () => {
      // TODO: Replace with fetch('/api/v1/owner/notifications/mark-all-read', { method: 'POST' })
      notifications.forEach(n => {
        n.status = 'read';
        updateRowDOM(n.id, 'read');
      });
      updateCounts();
      showToast('All notifications marked as read', 'success');
    });
  }

  // Helper to update a row's DOM status pill and classes
  function updateRowDOM(id, status) {
    const row = notifTableBody.querySelector(`.notif-row[data-id="${id}"]`);
    if (!row) return;

    row.setAttribute('data-status', status);
    row.classList.remove('unread', 'read');
    row.classList.add(status);

    const pill = row.querySelector('.status-pill');
    if (pill) {
      if (status === 'read') {
        pill.className = 'status-pill status-read';
        pill.innerHTML = '<span class="status-dot"></span><span>Read</span>';
      } else {
        pill.className = 'status-pill status-unread';
        pill.innerHTML = '<span class="status-dot"></span><span>Unread</span>';
      }
    }
  }

  // --------------------------------------------------------------------------
  // 7. Context Menu for Individual Rows
  // --------------------------------------------------------------------------
  notifTableBody.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('.btn-action-more');
    if (actionBtn) {
      e.stopPropagation();
      const id = parseInt(actionBtn.getAttribute('data-id'), 10);
      activeContextNotifId = id;

      const rect = actionBtn.getBoundingClientRect();
      contextMenu.style.top = `${rect.bottom + window.scrollY + 4}px`;
      contextMenu.style.left = `${rect.right + window.scrollX - 180}px`;
      contextMenu.style.display = 'block';
      return;
    }

    // Row click opens details (if not clicking checkbox)
    if (!e.target.closest('input[type="checkbox"]')) {
      const row = e.target.closest('.notif-row');
      if (row) {
        const id = parseInt(row.getAttribute('data-id'), 10);
        openDetailModal(id);
      }
    }
  });

  document.addEventListener('click', () => {
    if (contextMenu) contextMenu.style.display = 'none';
  });

  if (ctxToggleRead) {
    ctxToggleRead.addEventListener('click', () => {
      if (!activeContextNotifId) return;
      const notif = notifications.find(n => n.id === activeContextNotifId);
      if (!notif) return;

      const newStatus = notif.status === 'unread' ? 'read' : 'unread';
      notif.status = newStatus;
      updateRowDOM(activeContextNotifId, newStatus);
      updateCounts();
      showToast(`Notification marked as ${newStatus}`, 'info');
      contextMenu.style.display = 'none';
    });
  }

  if (ctxViewDetails) {
    ctxViewDetails.addEventListener('click', () => {
      if (!activeContextNotifId) return;
      openDetailModal(activeContextNotifId);
      contextMenu.style.display = 'none';
    });
  }

  if (ctxDelete) {
    ctxDelete.addEventListener('click', () => {
      if (!activeContextNotifId) return;
      notifications = notifications.filter(n => n.id !== activeContextNotifId);
      const row = notifTableBody.querySelector(`.notif-row[data-id="${activeContextNotifId}"]`);
      if (row) row.remove();
      updateCounts();
      showToast('Notification deleted', 'success');
      contextMenu.style.display = 'none';
    });
  }

  // --------------------------------------------------------------------------
  // 8. Modals Management
  // --------------------------------------------------------------------------
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

  // Notification Settings Modal Trigger
  if (btnNotifSettings) {
    btnNotifSettings.addEventListener('click', () => openModal(notifSettingsModal));
  }
  if (qaNotifSettings) {
    qaNotifSettings.addEventListener('click', () => openModal(notifSettingsModal));
  }
  if (btnSaveNotifSettings) {
    btnSaveNotifSettings.addEventListener('click', () => {
      // TODO: Replace with fetch('/api/v1/owner/notifications/preferences', { method: 'PUT', body: JSON.stringify({...}) })
      closeModal(notifSettingsModal);
      showToast('Notification preferences saved successfully', 'success');
    });
  }

  // Quick Action Buttons
  if (qaEmailPrefs) {
    qaEmailPrefs.addEventListener('click', () => {
      openModal(notifSettingsModal);
      showToast('Configuring Email delivery preferences', 'info');
    });
  }
  if (qaPushNotifs) {
    qaPushNotifs.addEventListener('click', () => {
      openModal(notifSettingsModal);
      showToast('Configuring Push alerts', 'info');
    });
  }
  if (qaSmsNotifs) {
    qaSmsNotifs.addEventListener('click', () => {
      openModal(notifSettingsModal);
      showToast('Configuring SMS alerts', 'info');
    });
  }

  // Detail Modal
  function openDetailModal(id) {
    const notif = notifications.find(n => n.id === id);
    if (!notif) return;

    // Auto mark as read on view
    if (notif.status === 'unread') {
      notif.status = 'read';
      updateRowDOM(id, 'read');
      updateCounts();
    }

    const detailHeading = document.getElementById('detailHeading');
    const detailTimestamp = document.getElementById('detailTimestamp');
    const detailContentText = document.getElementById('detailContentText');
    const detailVaultName = document.getElementById('detailVaultName');
    const detailCategory = document.getElementById('detailCategory');
    const detailActionBtn = document.getElementById('detailActionBtn');

    if (detailHeading) detailHeading.textContent = notif.title;
    if (detailTimestamp) detailTimestamp.textContent = `${notif.date}, ${notif.time}`;
    if (detailContentText) detailContentText.textContent = notif.desc;
    if (detailVaultName) detailVaultName.textContent = notif.vault;
    if (detailCategory) detailCategory.textContent = notif.type.charAt(0).toUpperCase() + notif.type.slice(1);

    if (detailActionBtn) {
      if (notif.type === 'invitation') {
        detailActionBtn.textContent = 'View in Invitations';
        detailActionBtn.onclick = () => window.location.href = '../invitations/invitations.html';
      } else if (notif.type === 'release') {
        detailActionBtn.textContent = 'View in Release Management';
        detailActionBtn.onclick = () => window.location.href = '../release-management/release-management.html';
      } else if (notif.type === 'trustee') {
        detailActionBtn.textContent = 'View in Trustees';
        detailActionBtn.onclick = () => window.location.href = '../trustees/trustees.html';
      } else {
        detailActionBtn.textContent = 'View Vault';
        detailActionBtn.onclick = () => window.location.href = '../my-vaults/my-vaults.html';
      }
    }

    openModal(notifDetailModal);
  }

  // --------------------------------------------------------------------------
  // 9. Toast Notification System
  // --------------------------------------------------------------------------
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Initial count sync
  updateCounts();
});
