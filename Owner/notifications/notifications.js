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
  // 2. State & Live Data
  // --------------------------------------------------------------------------
  let notifications = [];

  function getIconForType(type) {
    type = (type || '').toLowerCase();
    if (type === 'invitation') {
      return {
        color: 'icon-purple',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
      };
    }
    if (type === 'trustee') {
      return {
        color: 'icon-green',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
      };
    }
    if (type === 'release') {
      return {
        color: 'icon-orange',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`
      };
    }
    if (type === 'security') {
      return {
        color: 'icon-red',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
      };
    }
    return {
      color: 'icon-blue',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>`
    };
  }

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

    const recentActivityEl = document.getElementById('notifRecentActivity');
    if (recentActivityEl) {
      if (notifications.length === 0) {
        recentActivityEl.innerHTML = `
          <div style="padding: 1.5rem 0.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
            No recent notification activity.
          </div>`;
      } else {
        const sorted = [...notifications].slice(0, 5);
        recentActivityEl.innerHTML = sorted.map(item => {
          let dotColor = 'dot-teal';
          if (item.type === 'trustee') dotColor = 'dot-purple';
          else if (item.type === 'release') dotColor = 'dot-orange';
          else if (item.type === 'security') dotColor = 'dot-red';

          return `
            <div class="activity-item">
              <div class="timeline-dot ${dotColor}"></div>
              <div class="timeline-line"></div>
              <div class="activity-body">
                <span class="activity-title">${item.title}</span>
                <span class="activity-time">${item.date}, ${item.time}</span>
              </div>
            </div>`;
        }).join('');
      }
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
      if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
        window.AegisAPI.post('/owner/notifications/bulk-read/', {
          ids: Array.from(selectedNotifIds)
        }).then(() => {
          selectedNotifIds.forEach(id => {
            const notif = notifications.find(n => n.id === id);
            if (notif) notif.status = 'read';
            updateRowDOM(id, 'read');
          });
          selectedNotifIds.clear();
          updateBulkBar();
          updateCounts();
          showToast('Selected notifications marked as read', 'success');
        }).catch(err => {
          showToast(`Failed: ${err.message}`, 'error');
        });
      } else {
        selectedNotifIds.forEach(id => {
          const notif = notifications.find(n => n.id === id);
          if (notif) notif.status = 'read';
          updateRowDOM(id, 'read');
        });
        selectedNotifIds.clear();
        updateBulkBar();
        updateCounts();
        showToast('Selected notifications marked as read', 'success');
      }
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
      if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
        window.AegisAPI.post('/owner/notifications/mark-all-read/').then(() => {
          notifications.forEach(n => {
            n.status = 'read';
            updateRowDOM(n.id, 'read');
          });
          updateCounts();
          showToast('All notifications marked as read', 'success');
        }).catch(err => {
          showToast(`Failed: ${err.message}`, 'error');
        });
      } else {
        notifications.forEach(n => {
          n.status = 'read';
          updateRowDOM(n.id, 'read');
        });
        updateCounts();
        showToast('All notifications marked as read', 'success');
      }
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
      if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
        window.AegisAPI.put('/owner/notifications/preferences/', {
          preferences: 'updated'
        }).then(() => {
          closeModal(notifSettingsModal);
          showToast('Notification preferences saved successfully', 'success');
        }).catch(err => {
          showToast(`Failed: ${err.message}`, 'error');
        });
      } else {
        closeModal(notifSettingsModal);
        showToast('Notification preferences saved successfully', 'success');
      }
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

  function renderTableRows() {
    if (!notifTableBody) return;
    if (notifications.length === 0) {
      notifTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 3.5rem 1rem; color: var(--text-muted);">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🔔</div>
            <div style="font-weight: 600; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.35rem;">No Notifications</div>
            <div style="font-size: 0.85rem; max-width: 420px; margin: 0 auto;">You're completely caught up! Real-time alerts for trustee invitations, releases, and vault activities will appear here.</div>
          </td>
        </tr>`;
      updateCounts();
      return;
    }

    notifTableBody.innerHTML = notifications.map(item => {
      const icon = getIconForType(item.type);
      return `
        <tr class="notif-row ${item.status}" data-id="${item.id}" data-type="${item.type}" data-vault="${item.vault}" data-status="${item.status}" data-date="${item.rawDate}">
          <td>
            <input type="checkbox" class="row-checkbox custom-checkbox" aria-label="Select notification">
          </td>
          <td>
            <div class="notif-icon-box ${icon.color}">
              ${icon.svg}
            </div>
          </td>
          <td>
            <div class="notif-msg-cell">
              <span class="notif-msg-title">${item.title}</span>
              <span class="notif-msg-sub">${item.desc}</span>
            </div>
          </td>
          <td>
            <div class="related-badge badge-blue">
              <span>${item.vault}</span>
            </div>
          </td>
          <td>
            <div class="notif-datetime">
              <span class="date-text">${item.date}</span>
              <span class="time-text">${item.time}</span>
            </div>
          </td>
          <td>
            <span class="status-pill status-${item.status}">
              <span class="status-dot"></span>
              <span>${item.status === 'unread' ? 'Unread' : 'Read'}</span>
            </span>
          </td>
          <td style="text-align: right;">
            <button class="btn-action-more" aria-label="More options" data-id="${item.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
              </svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    updateCounts();
    applyFilters();
  }

  function loadLiveNotifications() {
    if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
      window.AegisAPI.get('/owner/notifications/').then(data => {
        notifications = data.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          desc: n.description,
          vault: n.vault_name || 'System',
          status: n.status ? n.status.toLowerCase() : 'unread',
          date: new Date(n.created_at).toLocaleDateString(),
          time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rawDate: n.created_at
        }));
        renderTableRows();
      }).catch(err => {
        console.error('Failed to load notifications', err);
        renderTableRows();
      });
    } else {
      renderTableRows();
    }
  }

  // Initial load from backend
  loadLiveNotifications();
});
