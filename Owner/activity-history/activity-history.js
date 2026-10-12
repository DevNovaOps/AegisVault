/**
 * AegisVault Owner Panel — Activity & History Module
 * Module 08: Immutable Audit Logs, Forensic Traces & Action History
 * Connected to live backend database: /api/v1/owner/audit/logs/
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Live Data State
  // =========================================================================
  let activities = [];
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
  // 3. Helper Functions: Icons & Colors
  // =========================================================================
  function getActionIcon(actionKey, category) {
    if (category === 'vault' || actionKey.includes('vault') || actionKey.includes('document')) {
      return {
        boxClass: 'act-green',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`
      };
    }
    if (category === 'trustee' || actionKey.includes('trustee')) {
      return {
        boxClass: 'act-purple',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
      };
    }
    if (category === 'invitation' || actionKey.includes('invitation')) {
      return {
        boxClass: 'act-blue',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`
      };
    }
    if (category === 'release' || actionKey.includes('release')) {
      return {
        boxClass: 'act-orange',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
      };
    }
    if (category === 'security' || category === 'auth' || actionKey.includes('login') || actionKey.includes('failed')) {
      return {
        boxClass: 'act-red',
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
      };
    }
    return {
      boxClass: 'act-blue',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
    };
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));
  }

  // =========================================================================
  // 4. Live API Data Fetching
  // =========================================================================
  async function loadLiveActivities() {
    if (!activityTableBody) return;

    if (!window.AegisAPI || !window.AegisAPI.isAuthenticated()) {
      activityTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-muted);">
            <div>Please log in to view audit history.</div>
          </td>
        </tr>
      `;
      return;
    }

    try {
      const data = await window.AegisAPI.get('/owner/audit/logs/');
      const rawList = Array.isArray(data) ? data : (data.results || []);

      const currentUser = window.AegisAPI.getUser() || {};
      const defaultUserName = currentUser.name || currentUser.email || 'Owner';
      const defaultUserEmail = currentUser.email || 'owner@aegisvault.io';

      activities = rawList.map((item, idx) => {
        const itemDate = item.date || (item.timestamp ? new Date(item.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently');
        const itemTime = item.time || (item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
        return {
          id: item.id || (idx + 1),
          date: itemDate,
          time: itemTime,
          rawDate: item.rawDate || item.timestamp || '',
          actionKey: item.actionKey || item.action_key || 'activity',
          actionTitle: item.actionTitle || item.action_title || 'Activity Event',
          details: item.details || item.description || '',
          vault: item.vault || item.vault_name || 'General',
          category: (item.category || 'vault').toLowerCase(),
          user: item.user || defaultUserName,
          email: item.email || defaultUserEmail,
          avatar: '../assets/images/trustee-avatar-8.png',
          ip: item.ip || item.ip_address || '127.0.0.1',
          status: (item.status || 'success').toLowerCase(),
          hash: item.hash || `sha256:${item.id || idx}`
        };
      });

      populateFilterOptions();
      updateMetricCounts();
      renderActivitiesTable();

    } catch (err) {
      console.error('[AegisVault] Failed to load audit logs:', err);
      activityTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 3rem; color: var(--status-critical);">
            <div>Failed to load live audit trail: ${escapeHtml(err.message)}</div>
          </td>
        </tr>
      `;
    }
  }

  // Populate dynamic select options for Vaults and Users
  function populateFilterOptions() {
    if (filterVault) {
      const existingVal = filterVault.value;
      const vaults = Array.from(new Set(activities.map(a => a.vault).filter(v => v && v !== 'General')));
      filterVault.innerHTML = '<option value="all">All Vaults</option><option value="General">General (System)</option>';
      vaults.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        filterVault.appendChild(opt);
      });
      if (existingVal) filterVault.value = existingVal;
    }

    if (filterUser) {
      const existingUser = filterUser.value;
      const users = Array.from(new Set(activities.map(a => a.user).filter(Boolean)));
      filterUser.innerHTML = '<option value="all">All Users</option>';
      users.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u;
        opt.textContent = u;
        filterUser.appendChild(opt);
      });
      if (existingUser) filterUser.value = existingUser;
    }
  }

  // Update counts on KPI cards, side filter badges, and timeline
  function updateMetricCounts() {
    // KPI Cards: Total, Vault, Trustee, Invitation, Release
    const kpiTotal = activities.length;
    const kpiVault = activities.filter(a => a.category === 'vault').length;
    const kpiTrustee = activities.filter(a => a.category === 'trustee').length;
    const kpiInvitation = activities.filter(a => a.category === 'invitation').length;
    const kpiRelease = activities.filter(a => a.category === 'release').length;
    const kpiSecurity = activities.filter(a => a.category === 'security' || a.category === 'auth').length;
    const kpiSettings = activities.filter(a => a.category === 'settings' || a.category === 'profile').length;

    const metricCards = document.querySelectorAll('.metrics-row .metric-card');
    if (metricCards[0]) {
      const val = metricCards[0].querySelector('.metric-value');
      if (val) val.textContent = kpiTotal;
    }
    if (metricCards[1]) {
      const val = metricCards[1].querySelector('.metric-value');
      if (val) val.textContent = kpiVault;
    }
    if (metricCards[2]) {
      const val = metricCards[2].querySelector('.metric-value');
      if (val) val.textContent = kpiTrustee;
    }
    if (metricCards[3]) {
      const val = metricCards[3].querySelector('.metric-value');
      if (val) val.textContent = kpiInvitation;
    }
    if (metricCards[4]) {
      const val = metricCards[4].querySelector('.metric-value');
      if (val) val.textContent = kpiRelease;
    }

    // Side filter badges
    document.querySelectorAll('.filter-checkbox-item').forEach(item => {
      const chk = item.querySelector('.side-filter-check');
      const badge = item.querySelector('.filter-count-badge');
      if (!chk || !badge) return;
      const cat = chk.getAttribute('data-category');
      if (cat === 'vault') badge.textContent = kpiVault;
      else if (cat === 'trustee') badge.textContent = kpiTrustee;
      else if (cat === 'invitation') badge.textContent = kpiInvitation;
      else if (cat === 'release') badge.textContent = kpiRelease;
      else if (cat === 'security') badge.textContent = kpiSecurity;
      else if (cat === 'settings') badge.textContent = kpiSettings;
    });

    // Side recent activity timeline
    const timeline = document.querySelector('.activity-timeline');
    if (timeline) {
      if (activities.length === 0) {
        timeline.innerHTML = '<div style="padding:1rem; color:var(--text-muted); font-size:0.85rem;">No recent activities logged.</div>';
      } else {
        timeline.innerHTML = activities.slice(0, 4).map(a => `
          <div class="activity-item">
            <div class="timeline-dot dot-${a.category === 'vault' ? 'teal' : a.category === 'trustee' ? 'purple' : a.category === 'release' ? 'orange' : 'red'}"></div>
            <div class="timeline-line"></div>
            <div class="activity-body">
              <span class="activity-title">${escapeHtml(a.actionTitle)}</span>
              <span class="activity-time">${escapeHtml(a.date)}, ${escapeHtml(a.time)}</span>
            </div>
          </div>
        `).join('');
      }
    }

    // Export date range label
    const exportDateRange = document.getElementById('exportDateRange');
    if (exportDateRange && exportDateRange.options[0]) {
      exportDateRange.options[0].textContent = `All Time (${kpiTotal} events)`;
    }
  }

  // =========================================================================
  // 5. Render Activities Table
  // =========================================================================
  function renderActivitiesTable() {
    if (!activityTableBody) return;

    activityTableBody.innerHTML = '';

    const query = (activitySearchInput?.value || '').toLowerCase().trim();
    const actionVal = filterAction?.value || 'all';
    const vaultVal = filterVault?.value || 'all';
    const userVal = filterUser?.value || 'all';
    const checkedCategories = Array.from(document.querySelectorAll('.side-filter-check:checked')).map(cb => cb.getAttribute('data-category'));

    const filtered = activities.filter(act => {
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

      return matchesSearch && matchesAction && matchesVault && matchesUser && matchesCategory;
    });

    if (filtered.length === 0) {
      if (activities.length === 0) {
        activityTableBody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 4rem 1.5rem; color: var(--text-muted);">
              <div style="font-size: 1.15rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">
                No Audit Activities Recorded Yet
              </div>
              <div style="max-width: 500px; margin: 0 auto; line-height: 1.5; font-size: 0.9rem;">
                All security events, vault operations, trustee verifications, and shard actions are recorded permanently in AegisVault's immutable cryptographic audit chain.
              </div>
            </td>
          </tr>
        `;
      } else {
        activityTableBody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 3rem 1.5rem; color: var(--text-muted);">
              <div style="font-size: 1.05rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">
                No activities match your filter criteria
              </div>
              <div style="font-size: 0.85rem;">Try clearing search terms or enabling more category checkboxes.</div>
            </td>
          </tr>
        `;
      }
      return;
    }

    filtered.forEach(act => {
      const tr = document.createElement('tr');
      tr.className = 'activity-row';
      tr.setAttribute('data-id', act.id);
      tr.setAttribute('data-action', act.actionKey);
      tr.setAttribute('data-vault', act.vault);
      tr.setAttribute('data-user', act.user);
      tr.setAttribute('data-status', act.status);

      const iconData = getActionIcon(act.actionKey, act.category);
      const isFailed = act.status === 'failed';

      tr.innerHTML = `
        <td>
          <div class="datetime-cell">
            <span class="primary-date">${escapeHtml(act.date)}</span>
            <span class="sub-time">${escapeHtml(act.time)}</span>
          </div>
        </td>
        <td>
          <div class="action-cell">
            <div class="act-icon-box ${iconData.boxClass}">
              ${iconData.svg}
            </div>
            <span class="action-name">${escapeHtml(act.actionTitle)}</span>
          </div>
        </td>
        <td>
          <span class="details-text">${escapeHtml(act.details)}</span>
        </td>
        <td>
          ${act.vault === 'General' ? `<span class="empty-dash">&mdash;</span>` : `
            <div class="vault-tag vault-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>${escapeHtml(act.vault)}</span>
            </div>
          `}
        </td>
        <td>
          <div class="user-cell">
            <img src="${escapeHtml(act.avatar)}" alt="${escapeHtml(act.user)}" class="user-avatar-img">
            <div class="user-meta">
              <span class="user-name">${escapeHtml(act.user)}</span>
              <span class="user-email">${escapeHtml(act.email)}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="ip-address">${escapeHtml(act.ip)}</span>
        </td>
        <td>
          <span class="status-pill status-${isFailed ? 'failed' : 'success'}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              ${isFailed ? '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' : '<polyline points="20 6 9 17 4 12"/>'}
            </svg>
            <span>${isFailed ? 'Failed' : 'Success'}</span>
          </span>
        </td>
        <td style="text-align: right;">
          <button class="btn-row-more" aria-label="Row options" data-id="${escapeHtml(act.id)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
            </svg>
          </button>
        </td>
      `;

      activityTableBody.appendChild(tr);
    });
  }

  // =========================================================================
  // 6. Filtering & Sorting Event Listeners
  // =========================================================================
  if (activitySearchInput) activitySearchInput.addEventListener('input', renderActivitiesTable);
  if (filterAction) filterAction.addEventListener('change', renderActivitiesTable);
  if (filterVault) filterVault.addEventListener('change', renderActivitiesTable);
  if (filterUser) filterUser.addEventListener('change', renderActivitiesTable);
  if (filterDate) filterDate.addEventListener('change', () => {
    if (window.AegisOwner) window.AegisOwner.showToast(`Showing activities for: ${filterDate.options[filterDate.selectedIndex].text}`, 'info');
  });

  document.querySelectorAll('.side-filter-check').forEach(cb => {
    cb.addEventListener('change', () => {
      renderActivitiesTable();
      if (window.AegisOwner) window.AegisOwner.showToast('Activity category filter updated', 'info');
    });
  });

  // KPI Cards Filter Click
  document.querySelectorAll('.metric-card').forEach(card => {
    card.addEventListener('click', () => {
      const filter = card.getAttribute('data-filter');
      if (filter === 'all') {
        if (filterAction) filterAction.value = 'all';
        if (filterVault) filterVault.value = 'all';
        if (filterUser) filterUser.value = 'all';
      } else if (filter === 'vault') {
        if (filterAction) filterAction.value = 'vault_created';
      } else if (filter === 'trustee') {
        if (filterAction) filterAction.value = 'trustee_added';
      } else if (filter === 'invitation') {
        if (filterAction) filterAction.value = 'invitation_sent';
      } else if (filter === 'release') {
        if (filterAction) filterAction.value = 'release_scheduled';
      }
      renderActivitiesTable();
      if (window.AegisOwner) {
        window.AegisOwner.showToast(`Filtered by ${card.querySelector('.metric-label')?.textContent || 'Category'}`, 'info');
      }
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
        btnMoreFilters.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"/></svg> Critical Only`;
        if (filterAction) filterAction.value = 'release_scheduled';
        renderActivitiesTable();
        if (window.AegisOwner) window.AegisOwner.showToast('Advanced Filter: Critical Escrow & Release Activities', 'info');
      } else {
        btnMoreFilters.style.borderColor = '';
        btnMoreFilters.style.color = '';
        btnMoreFilters.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> <span>More Filters</span>`;
        if (filterAction) filterAction.value = 'all';
        renderActivitiesTable();
        if (window.AegisOwner) window.AegisOwner.showToast('Filters reset', 'info');
      }
    });
  }

  // Quick Action Buttons
  if (qaViewVaultAct) {
    qaViewVaultAct.addEventListener('click', () => {
      if (filterAction) filterAction.value = 'all';
      const firstVault = activities.find(a => a.vault && a.vault !== 'General')?.vault;
      if (firstVault && filterVault) filterVault.value = firstVault;
      renderActivitiesTable();
      if (window.AegisOwner) window.AegisOwner.showToast('Showing Vault Activities', 'info');
    });
  }
  if (qaViewTrusteeAct) {
    qaViewTrusteeAct.addEventListener('click', () => {
      if (filterAction) filterAction.value = 'trustee_added';
      if (filterVault) filterVault.value = 'all';
      renderActivitiesTable();
      if (window.AegisOwner) window.AegisOwner.showToast('Showing Trustee Activities', 'info');
    });
  }
  if (qaViewInvAct) {
    qaViewInvAct.addEventListener('click', () => {
      if (filterAction) filterAction.value = 'invitation_sent';
      if (filterVault) filterVault.value = 'all';
      renderActivitiesTable();
      if (window.AegisOwner) window.AegisOwner.showToast('Showing Invitation Activities', 'info');
    });
  }
  if (qaViewRelAct) {
    qaViewRelAct.addEventListener('click', () => {
      if (filterAction) filterAction.value = 'release_scheduled';
      if (filterVault) filterVault.value = 'all';
      renderActivitiesTable();
      if (window.AegisOwner) window.AegisOwner.showToast('Showing Release Activities', 'info');
    });
  }

  // Sorting
  if (thSortDate) {
    thSortDate.addEventListener('click', () => {
      currentSort.order = currentSort.column === 'date' && currentSort.order === 'desc' ? 'asc' : 'desc';
      currentSort.column = 'date';
      sortActivities();
    });
  }

  if (thSortAction) {
    thSortAction.addEventListener('click', () => {
      currentSort.order = currentSort.column === 'action' && currentSort.order === 'asc' ? 'desc' : 'asc';
      currentSort.column = 'action';
      sortActivities();
    });
  }

  function sortActivities() {
    activities.sort((a, b) => {
      if (currentSort.column === 'date') {
        const comp = (a.rawDate || '').localeCompare(b.rawDate || '');
        return currentSort.order === 'asc' ? comp : -comp;
      } else {
        const comp = (a.actionTitle || '').localeCompare(b.actionTitle || '');
        return currentSort.order === 'asc' ? comp : -comp;
      }
    });
    renderActivitiesTable();
    if (window.AegisOwner) window.AegisOwner.showToast(`Sorted by ${currentSort.column} (${currentSort.order})`, 'info');
  }

  // =========================================================================
  // 7. Context Menu & Row Click
  // =========================================================================
  activityTableBody.addEventListener('click', (e) => {
    const moreBtn = e.target.closest('.btn-row-more');
    if (moreBtn) {
      e.stopPropagation();
      activeContextRowId = moreBtn.getAttribute('data-id');
      const rect = moreBtn.getBoundingClientRect();
      if (contextMenu) {
        contextMenu.style.top = `${rect.bottom + window.scrollY + 4}px`;
        contextMenu.style.left = `${rect.right + window.scrollX - 180}px`;
        contextMenu.style.display = 'block';
      }
      return;
    }

    const row = e.target.closest('.activity-row');
    if (row) {
      const id = row.getAttribute('data-id');
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
      const act = activities.find(a => String(a.id) === String(activeContextRowId));
      if (act && filterUser) {
        filterUser.value = act.user;
        renderActivitiesTable();
        if (window.AegisOwner) window.AegisOwner.showToast(`Filtered by user: ${act.user}`, 'info');
      }
    });
  }

  if (ctxFilterByVault) {
    ctxFilterByVault.addEventListener('click', () => {
      const act = activities.find(a => String(a.id) === String(activeContextRowId));
      if (act && act.vault !== 'General' && filterVault) {
        filterVault.value = act.vault;
        renderActivitiesTable();
        if (window.AegisOwner) window.AegisOwner.showToast(`Filtered by vault: ${act.vault}`, 'info');
      }
    });
  }

  // =========================================================================
  // 8. Modals: Export & Audit Details
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

  if (btnOpenExport) btnOpenExport.addEventListener('click', () => openModal(exportModal));
  if (qaExportHistory) qaExportHistory.addEventListener('click', () => openModal(exportModal));

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
        const headers = ['ID', 'Date', 'Time', 'Action', 'Details', 'Vault', 'Performed By', 'Email', 'IP Address', 'Status', 'Hash'];
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
            `"${a.status}"`,
            `"${a.hash}"`
          ].join(','));
        });
        content = csvRows.join('\n');
        mimeType = 'text/csv';
      } else {
        content = `AEGISVAULT AUDIT TRAIL EXPORT REPORT\nGenerated: ${new Date().toISOString()}\nTotal Activities: ${activities.length}\n\n` +
          activities.map(a => `[${a.date} ${a.time}] ${a.actionTitle} | Vault: ${a.vault} | User: ${a.user} (${a.email}) | IP: ${a.ip} | Status: ${a.status} | Hash: ${a.hash}\nDetails: ${a.details}\n`).join('\n----------------------------------------\n');
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
    const act = activities.find(a => String(a.id) === String(id));
    if (!act) return;

    const modalAuditBadge = document.getElementById('modalAuditBadge');
    const modalTimestamp = document.getElementById('modalTimestamp');
    const modalAuditDesc = document.getElementById('modalAuditDesc');
    const modalUser = document.getElementById('modalUser');
    const modalIp = document.getElementById('modalIp');
    const modalVault = document.getElementById('modalVault');
    const modalStatus = document.getElementById('modalStatus');
    const hashEl = activityDetailModal?.querySelector('.meta-item:last-child .meta-val');

    if (modalAuditBadge) modalAuditBadge.textContent = act.actionTitle;
    if (modalTimestamp) modalTimestamp.textContent = `${act.date}, ${act.time}`;
    if (modalAuditDesc) modalAuditDesc.textContent = `${act.details} by ${act.user}.`;
    if (modalUser) modalUser.textContent = `${act.user} (${act.email})`;
    if (modalIp) modalIp.textContent = act.ip;
    if (modalVault) modalVault.textContent = act.vault;
    if (modalStatus) modalStatus.textContent = act.status.charAt(0).toUpperCase() + act.status.slice(1);
    if (hashEl) hashEl.textContent = act.hash;

    openModal(activityDetailModal);
  }

  // Initial load
  loadLiveActivities();
});
