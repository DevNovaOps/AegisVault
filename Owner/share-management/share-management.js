/**
 * AegisVault Owner Panel — Share Management Logic
 * Module 05: Shared Vaults, Access Permissions, Expirations & Lifecycle
 */

(function() {
  'use strict';

  // =========================================================================
  // 1. Initial Mock Dataset (Exact match to Dark & Light mockups)
  // =========================================================================
  let shares = [
    {
      id: 'share-1',
      vault: 'Personal Vault',
      vaultDesc: 'Personal documents...',
      vaultThumb: '../assets/images/vault-thumb-1.png',
      trusteeName: 'Sneha Mehta',
      trusteeEmail: 'sneha.mehta@email.com',
      avatarType: 'img',
      avatar: '../assets/images/trustee-avatar-2.png',
      accessLevel: 'View Only',
      status: 'active',
      sharedDate: '12 Sep 2025',
      sharedTime: '10:24 AM',
      expiresOn: 'Never',
      note: 'Personal identification and financial statements access.'
    },
    {
      id: 'share-2',
      vault: 'Family Vault',
      vaultDesc: 'Family photos and rec...',
      vaultThumb: '../assets/images/vault-thumb-2.png',
      trusteeName: 'Amit Kumar',
      trusteeEmail: 'amit.kumar@email.com',
      avatarType: 'img',
      avatar: '../assets/images/trustee-avatar-1.png',
      accessLevel: 'View & Download',
      status: 'active',
      sharedDate: '05 Sep 2025',
      sharedTime: '02:16 PM',
      expiresOn: 'Never',
      note: 'Family heritage albums and vital certificates.'
    },
    {
      id: 'share-3',
      vault: 'Business Vault',
      vaultDesc: 'Business and professi...',
      vaultThumb: '../assets/images/vault-thumb-3.png',
      trusteeName: 'Rahul Kapoor',
      trusteeEmail: 'rahul.kapoor@email.com',
      avatarType: 'initials',
      initials: 'RK',
      avatarClass: 'avatar-gradient-rk',
      accessLevel: 'View Only',
      status: 'pending',
      sharedDate: '10 Sep 2025',
      sharedTime: '09:12 AM',
      expiresOn: '20 Oct 2025',
      note: 'Enterprise shareholder agreements and cap table.'
    },
    {
      id: 'share-4',
      vault: 'Health Vault',
      vaultDesc: 'Medical records and h...',
      vaultThumb: '../assets/images/vault-thumb-4.png',
      trusteeName: 'Priya Sharma',
      trusteeEmail: 'priya.sharma@email.com',
      avatarType: 'img',
      avatar: '../assets/images/trustee-avatar-4.png',
      accessLevel: 'View & Download',
      status: 'active',
      sharedDate: '01 Sep 2025',
      sharedTime: '04:38 PM',
      expiresOn: 'Never',
      note: 'Healthcare power of attorney and hospital policy.'
    },
    {
      id: 'share-5',
      vault: 'Travel Vault',
      vaultDesc: 'Travel documents and ...',
      vaultThumb: '../assets/images/vault-thumb-5.png',
      trusteeName: 'Vikram Shah',
      trusteeEmail: 'vikram.shah@email.com',
      avatarType: 'initials',
      initials: 'VS',
      avatarClass: 'avatar-gradient-vs',
      accessLevel: 'View Only',
      status: 'revoked',
      sharedDate: '28 Aug 2025',
      sharedTime: '11:05 AM',
      expiresOn: '15 Sep 2025',
      note: 'Passports, foreign visas, and flight contingencies.'
    },
    {
      id: 'share-6',
      vault: 'Property Vault',
      vaultDesc: 'Property deeds and le...',
      vaultThumb: '../assets/images/vault-thumb-6.png',
      trusteeName: 'Anita Desai',
      trusteeEmail: 'anita.desai@email.com',
      avatarType: 'img',
      avatar: '../assets/images/trustee-avatar-6.png',
      accessLevel: 'View & Download',
      status: 'active',
      sharedDate: '15 Aug 2025',
      sharedTime: '08:40 AM',
      expiresOn: 'Never',
      note: 'Real estate registry papers and mortgage releases.'
    },
    {
      id: 'share-7',
      vault: 'Legal Vault',
      vaultDesc: 'Legal documents and ...',
      vaultThumb: '../assets/images/vault-thumb-7.png',
      trusteeName: 'Neeraj Singh',
      trusteeEmail: 'neeraj.singh@email.com',
      avatarType: 'initials',
      initials: 'NS',
      avatarClass: 'avatar-gradient-ns',
      accessLevel: 'View Only',
      status: 'active',
      sharedDate: '02 Aug 2025',
      sharedTime: '03:18 PM',
      expiresOn: '30 Dec 2025',
      note: 'Last Will and Testament execution copies.'
    },
    {
      id: 'share-8',
      vault: 'Memories Vault',
      vaultDesc: 'Special moments and ...',
      vaultThumb: '../assets/images/vault-thumb-8.png',
      trusteeName: 'Karan Malhotra',
      trusteeEmail: 'karan.malhotra@email.com',
      avatarType: 'img',
      avatar: '../assets/images/trustee-avatar-8.png',
      accessLevel: 'View & Download',
      status: 'active',
      sharedDate: '25 Jul 2025',
      sharedTime: '06:21 PM',
      expiresOn: 'Never',
      note: 'Personal memoirs, legacy voice notes, and videos.'
    }
  ];

  let activeShareItem = null;

  // =========================================================================
  // 2. DOM Elements
  // =========================================================================
  const tbody = document.getElementById('sharesTableTbody');
  const searchInput = document.getElementById('shareSearchInput');
  const vaultFilter = document.getElementById('vaultFilterSelect');
  const accessFilter = document.getElementById('accessFilterSelect');
  const statusFilter = document.getElementById('statusFilterSelect');
  const btnMoreFilters = document.getElementById('btnMoreFilters');

  // KPI elements
  const statTotal = document.getElementById('statTotalShares');
  const statActive = document.getElementById('statActiveShares');
  const statPending = document.getElementById('statPendingShares');
  const statRevoked = document.getElementById('statRevokedShares');

  // Modals
  const shareVaultModal = document.getElementById('shareVaultModal');
  const formShareVault = document.getElementById('formShareVault');
  const btnOpenShareVault = document.getElementById('btnOpenShareVault');
  const btnQuickShareSide = document.getElementById('btnQuickShareSide');

  const editShareModal = document.getElementById('editShareModal');
  const formEditShare = document.getElementById('formEditShare');
  const editShareModalTitle = document.getElementById('editShareModalTitle');
  const editShareModalBody = document.getElementById('editShareModalBody');
  const btnRevokeAccess = document.getElementById('btnRevokeAccess');

  const confirmActionModal = document.getElementById('confirmActionModal');
  const confirmActionModalTitle = document.getElementById('confirmActionModalTitle');
  const confirmActionModalBody = document.getElementById('confirmActionModalBody');
  const btnConfirmAction = document.getElementById('btnConfirmAction');

  // =========================================================================
  // 3. Helper Render Functions
  // =========================================================================
  function getAccessLevelPill(level) {
    if (level === 'View Only') {
      return `
        <span class="access-pill view-only">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View Only
        </span>`;
    }
    if (level === 'View & Download') {
      return `
        <span class="access-pill view-download">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          View &amp; Download
        </span>`;
    }
    return `
      <span class="access-pill full-access">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Full Access
      </span>`;
  }

  function getStatusPill(status) {
    if (status === 'active') {
      return `
        <span class="status-pill active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Active
        </span>`;
    }
    if (status === 'pending') {
      return `
        <span class="status-pill pending">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Pending
        </span>`;
    }
    return `
      <span class="status-pill revoked">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        Revoked
      </span>`;
  }

  function getActionButtons(item) {
    let primaryBtn = '';
    if (item.status === 'active') {
      primaryBtn = `
        <button class="btn-table-action" onclick="window.AegisShares.openEditModal('${item.id}')" title="Edit Share Permissions">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>`;
    } else if (item.status === 'pending') {
      primaryBtn = `
        <button class="btn-table-action" onclick="window.AegisShares.openRemindModal('${item.id}')" title="Remind Trustee">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          Remind
        </button>`;
    } else if (item.status === 'revoked') {
      primaryBtn = `
        <button class="btn-table-action" onclick="window.AegisShares.openRestoreModal('${item.id}')" title="Restore Access">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Restore
        </button>`;
    }

    const moreBtn = `
      <button class="btn-table-more" onclick="window.AegisShares.openMoreOptions('${item.id}')" title="More Options" aria-label="More options for ${item.vault}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/></svg>
      </button>`;

    return `<div class="share-actions-cell">${primaryBtn}${moreBtn}</div>`;
  }

  // =========================================================================
  // 4. Render Table
  // =========================================================================
  function renderTable() {
    if (!tbody) return;

    const searchTerm = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const vaultVal = vaultFilter ? vaultFilter.value : 'all';
    const accessVal = accessFilter ? accessFilter.value : 'all';
    const statusVal = statusFilter ? statusFilter.value : 'all';

    const filtered = shares.filter(item => {
      const matchSearch = item.vault.toLowerCase().includes(searchTerm) ||
                          item.trusteeName.toLowerCase().includes(searchTerm) ||
                          item.trusteeEmail.toLowerCase().includes(searchTerm) ||
                          item.accessLevel.toLowerCase().includes(searchTerm) ||
                          item.status.toLowerCase().includes(searchTerm);
      
      const matchVault = (vaultVal === 'all') || (item.vault.toLowerCase() === vaultVal.toLowerCase());
      const matchAccess = (accessVal === 'all') || (item.accessLevel.toLowerCase() === accessVal.toLowerCase());
      const matchStatus = (statusVal === 'all') || (item.status.toLowerCase() === statusVal.toLowerCase());

      return matchSearch && matchVault && matchAccess && matchStatus;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 38px; height: 38px; margin: 0 auto 0.75rem; display: block; opacity: 0.6;">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            <span style="font-size: 0.95rem; font-weight: 600; display: block; margin-bottom: 0.25rem; color: var(--text-primary);">No shared vaults match your filter</span>
            <span style="font-size: 0.8rem;">Try searching for a different keyword or reset filters.</span>
          </td>
        </tr>`;
      return;
    }

    let html = '';
    filtered.forEach(item => {
      // Vault cell
      const vaultHtml = `
        <div class="vault-cell-content">
          <div class="vault-thumb-img" style="background-image: url('${item.vaultThumb}');" title="${item.vault}"></div>
          <div class="vault-meta-box">
            <span class="vault-name-text">${item.vault}</span>
            <span class="vault-desc-text" title="${item.vaultDesc}">${item.vaultDesc}</span>
          </div>
        </div>`;

      // Trustee cell
      let avatarHtml = '';
      if (item.avatarType === 'img') {
        avatarHtml = `<div class="trustee-avatar-img" style="background-image: url('${item.avatar}');" title="${item.trusteeName}"></div>`;
      } else {
        avatarHtml = `<div class="trustee-avatar-initials ${item.avatarClass || ''}" title="${item.trusteeName}">${item.initials}</div>`;
      }
      const trusteeHtml = `
        <div class="trustee-cell-content">
          ${avatarHtml}
          <div class="trustee-meta-box">
            <span class="trustee-name-text">${item.trusteeName}</span>
            <span class="trustee-email-text" title="${item.trusteeEmail}">${item.trusteeEmail}</span>
          </div>
        </div>`;

      // Access Level
      const accessHtml = getAccessLevelPill(item.accessLevel);

      // Status
      const statusHtml = getStatusPill(item.status);

      // Actions
      const actionsHtml = getActionButtons(item);

      html += `
        <tr data-id="${item.id}">
          <td>${vaultHtml}</td>
          <td>${trusteeHtml}</td>
          <td>${accessHtml}</td>
          <td>${statusHtml}</td>
          <td>
            <div class="date-cell-box">
              <span class="date-primary">${item.sharedDate}</span>
              <span class="date-sub">${item.sharedTime}</span>
            </div>
          </td>
          <td>
            <span class="expires-text">${item.expiresOn}</span>
          </td>
          <td>${actionsHtml}</td>
        </tr>`;
    });

    tbody.innerHTML = html;
  }

  // =========================================================================
  // 5. Update KPI Metrics
  // =========================================================================
  function updateKPIs() {
    const total = shares.length;
    const active = shares.filter(s => s.status === 'active').length;
    const pending = shares.filter(s => s.status === 'pending').length;
    const revoked = shares.filter(s => s.status === 'revoked').length;

    if (statTotal) statTotal.textContent = total;
    if (statActive) statActive.textContent = active;
    if (statPending) statPending.textContent = pending;
    if (statRevoked) statRevoked.textContent = revoked;
  }

  // =========================================================================
  // 6. Modal Functions
  // =========================================================================
  function openShareModal() {
    if (formShareVault) formShareVault.reset();
    if (shareVaultModal) {
      shareVaultModal.classList.add('show', 'active');
      document.body.style.overflow = 'hidden';
    }
  }

  function openEditModal(id) {
    const item = shares.find(s => s.id === id);
    if (!item) return;
    activeShareItem = item;

    if (editShareModalTitle) {
      editShareModalTitle.textContent = `Edit Access: ${item.vault} &rarr; ${item.trusteeName}`;
    }

    if (editShareModalBody) {
      editShareModalBody.innerHTML = `
        <div style="margin-bottom: 1.15rem; display: flex; align-items: center; gap: 0.85rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle);">
          <div class="vault-thumb-img" style="background-image: url('${item.vaultThumb}'); width: 44px; height: 44px;"></div>
          <div>
            <h4 style="font-size: 0.98rem; font-weight: 700; color: var(--text-primary); margin: 0;">${item.vault}</h4>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Shared with ${item.trusteeName} (${item.trusteeEmail})</span>
          </div>
        </div>

        <div style="margin-bottom: 1.15rem;">
          <label style="display:block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text-primary);">Permission Level</label>
          <select id="editAccessLevelSelect" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-md); background: var(--bg-input); border: 1px solid var(--bg-input-border); color: var(--text-primary);">
            <option value="View Only" ${item.accessLevel === 'View Only' ? 'selected' : ''}>View Only</option>
            <option value="View & Download" ${item.accessLevel === 'View & Download' ? 'selected' : ''}>View & Download</option>
            <option value="Full Access" ${item.accessLevel === 'Full Access' ? 'selected' : ''}>Full Access</option>
          </select>
        </div>

        <div style="margin-bottom: 1.15rem;">
          <label style="display:block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text-primary);">Expiration Policy</label>
          <select id="editExpirySelect" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-md); background: var(--bg-input); border: 1px solid var(--bg-input-border); color: var(--text-primary);">
            <option value="Never" ${item.expiresOn === 'Never' ? 'selected' : ''}>Never (Permanent)</option>
            <option value="20 Oct 2025" ${item.expiresOn === '20 Oct 2025' ? 'selected' : ''}>20 Oct 2025</option>
            <option value="30 Dec 2025" ${item.expiresOn === '30 Dec 2025' ? 'selected' : ''}>30 Dec 2025</option>
            <option value="30 Days Extension">Extend by 30 Days</option>
          </select>
        </div>

        <div>
          <label style="display:block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text-primary);">Access Note / Directives</label>
          <textarea id="editShareNote" rows="2" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-md); background: var(--bg-input); border: 1px solid var(--bg-input-border); color: var(--text-primary); resize: none;">${item.note || ''}</textarea>
        </div>`;
    }

    if (editShareModal) {
      editShareModal.classList.add('show', 'active');
      document.body.style.overflow = 'hidden';
    }
  }

  function openRemindModal(id) {
    const item = shares.find(s => s.id === id);
    if (!item) return;
    activeShareItem = item;

    if (confirmActionModalTitle) confirmActionModalTitle.textContent = 'Remind Trustee';
    if (confirmActionModalBody) {
      confirmActionModalBody.innerHTML = `
        <p style="color: var(--text-primary); font-weight: 600; margin-bottom: 0.5rem; font-size: 0.95rem;">
          Send share acceptance reminder to ${item.trusteeName}?
        </p>
        <p style="color: var(--text-secondary); line-height: 1.5; font-size: 0.85rem;">
          An encrypted alert and email notification will be dispatched to <strong>${item.trusteeEmail}</strong> requesting review of shared access to <strong>${item.vault}</strong>.
        </p>`;
    }
    if (btnConfirmAction) {
      btnConfirmAction.textContent = 'Dispatch Reminder';
      btnConfirmAction.onclick = function() {
        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
          window.AegisAPI.post(`/owner/shares/${item.id}/remind/`).then(() => {
            if (confirmActionModal) confirmActionModal.classList.remove('show', 'active');
            document.body.style.overflow = '';
            if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(`Reminder sent to ${item.trusteeName} (${item.trusteeEmail})!`);
          }).catch(err => {
            if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(`Failed to send reminder: ${err.message}`, 'error');
          });
        } else {
          if (confirmActionModal) confirmActionModal.classList.remove('show', 'active');
          document.body.style.overflow = '';
          if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(`Reminder sent to ${item.trusteeName} (${item.trusteeEmail})!`);
        }
      };
    }
    if (confirmActionModal) {
      confirmActionModal.classList.add('show', 'active');
      document.body.style.overflow = 'hidden';
    }
  }

  function openRestoreModal(id) {
    const item = shares.find(s => s.id === id);
    if (!item) return;
    activeShareItem = item;

    if (confirmActionModalTitle) confirmActionModalTitle.textContent = 'Restore Vault Access';
    if (confirmActionModalBody) {
      confirmActionModalBody.innerHTML = `
        <p style="color: var(--text-primary); font-weight: 600; margin-bottom: 0.5rem; font-size: 0.95rem;">
          Restore access for ${item.trusteeName}?
        </p>
        <p style="color: var(--text-secondary); line-height: 1.5; font-size: 0.85rem;">
          This will change the status of <strong>${item.vault}</strong> from <strong>Revoked</strong> to <strong>Active</strong> with <strong>${item.accessLevel}</strong> rights.
        </p>`;
    }
    if (btnConfirmAction) {
      btnConfirmAction.textContent = 'Restore Access';
      btnConfirmAction.onclick = function() {
        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
          window.AegisAPI.post(`/owner/shares/${item.id}/restore/`).then(res => {
            item.status = 'active';
            updateKPIs();
            renderTable();
            if (confirmActionModal) confirmActionModal.classList.remove('show', 'active');
            document.body.style.overflow = '';
            if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(`Access restored for ${item.trusteeName} on ${item.vault}!`);
          }).catch(err => {
            if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(`Failed to restore access: ${err.message}`, 'error');
          });
        } else {
          item.status = 'active';
          updateKPIs();
          renderTable();
          if (confirmActionModal) confirmActionModal.classList.remove('show', 'active');
          document.body.style.overflow = '';
          if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(`Access restored for ${item.trusteeName} on ${item.vault}!`);
        }
      };
    }
    if (confirmActionModal) {
      confirmActionModal.classList.add('show', 'active');
      document.body.style.overflow = 'hidden';
    }
  }

  // Floating Context Menu for Shares
  let activeShareMenu = null;

  function closeShareMenu() {
    if (activeShareMenu) {
      activeShareMenu.remove();
      activeShareMenu = null;
    }
  }

  document.addEventListener('click', closeShareMenu);

  function openMoreOptions(id) {
    const item = shares.find(s => s.id === id);
    if (!item) return;

    closeShareMenu();

    const anchorEl = document.querySelector(`[data-action="more"][data-id="${id}"]`);
    if (!anchorEl) return;

    const menu = document.createElement('div');
    menu.className = 'dropdown-panel';
    menu.style.position = 'fixed';
    menu.style.zIndex = '9999';
    menu.style.minWidth = '200px';
    menu.style.boxShadow = 'var(--shadow-dropdown)';

    const isRevoked = item.status === 'revoked';

    menu.innerHTML = `
      <div class="dropdown-header">${item.trusteeName} &bull; ${item.vault}</div>
      <button class="dropdown-item" data-action="view" style="width:100%; border:none; background:none; text-align:left; cursor:pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        <span>View Details</span>
      </button>
      <button class="dropdown-item" data-action="edit" style="width:100%; border:none; background:none; text-align:left; cursor:pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        <span>Edit Permissions</span>
      </button>
      <button class="dropdown-item" data-action="toggle-status" style="width:100%; border:none; background:none; text-align:left; cursor:pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        <span>${isRevoked ? 'Reactivate Share' : 'Revoke Access'}</span>
      </button>
      <div class="dropdown-divider"></div>
      <button class="dropdown-item" data-action="copy" style="width:100%; border:none; background:none; text-align:left; cursor:pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        <span>Copy Audit Token</span>
      </button>
    `;

    const rect = anchorEl.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.left = `${Math.min(window.innerWidth - 220, rect.left - 150)}px`;

    menu.querySelector('[data-action="view"]').addEventListener('click', () => {
      closeShareMenu();
      openDetailsModal(id);
    });

    menu.querySelector('[data-action="edit"]').addEventListener('click', () => {
      closeShareMenu();
      openEditModal(id);
    });

    menu.querySelector('[data-action="toggle-status"]').addEventListener('click', () => {
      closeShareMenu();
      if (item.status === 'revoked') {
        item.status = 'active';
        window.AegisOwner?.showToast(`Share reactivated for ${item.trusteeName}!`, 'success');
      } else {
        item.status = 'revoked';
        window.AegisOwner?.showToast(`Share access revoked for ${item.trusteeName}.`, 'warning');
      }
      renderTable();
    });

    menu.querySelector('[data-action="copy"]').addEventListener('click', () => {
      closeShareMenu();
      const token = `aegis://share-audit/v1/${item.id}/${Date.now()}`;
      navigator.clipboard?.writeText(token);
      window.AegisOwner?.showToast(`Cryptographic audit token copied to clipboard!`, 'success');
    });

    document.body.appendChild(menu);
    activeShareMenu = menu;
  }

  // =========================================================================
  // 7. Event Listeners Initialization
  // =========================================================================
  function initEvents() {
    // Check URL query parameters (e.g. ?status=active or ?vault=Personal%20Vault)
    const urlParams = new URLSearchParams(window.location.search);
    const initialStatus = urlParams.get('status') || urlParams.get('filter');
    const initialVault = urlParams.get('vault');

    if (initialStatus && statusFilter) {
      const matchOpt = Array.from(statusFilter.options).find(o => o.value.toLowerCase() === initialStatus.toLowerCase());
      if (matchOpt) statusFilter.value = matchOpt.value;
    }
    if (initialVault && vaultFilter) {
      vaultFilter.value = initialVault;
    }

    if (searchInput) searchInput.addEventListener('input', renderTable);
    if (vaultFilter) vaultFilter.addEventListener('change', renderTable);
    if (accessFilter) accessFilter.addEventListener('change', renderTable);
    if (statusFilter) statusFilter.addEventListener('change', renderTable);

    // 4 KPI Metric Cards Interactive Filtering
    const metricCards = document.querySelectorAll('.metrics-row .metric-card');
    metricCards.forEach((card, index) => {
      card.style.cursor = 'pointer';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.title = 'Click to filter shares';

      card.addEventListener('click', () => {
        if (index === 0) {
          // Total -> Reset
          if (statusFilter) statusFilter.value = 'all';
          if (vaultFilter) vaultFilter.value = 'all';
          if (accessFilter) accessFilter.value = 'all';
          if (searchInput) searchInput.value = '';
          renderTable();
          window.AegisOwner?.showToast('Showing all shares');
        } else if (index === 1) {
          if (statusFilter) statusFilter.value = 'active';
          renderTable();
          window.AegisOwner?.showToast('Filtered: Active Shares');
        } else if (index === 2) {
          if (statusFilter) statusFilter.value = 'pending';
          renderTable();
          window.AegisOwner?.showToast('Filtered: Pending Shares');
        } else if (index === 3) {
          if (statusFilter) statusFilter.value = 'revoked';
          renderTable();
          window.AegisOwner?.showToast('Filtered: Revoked Shares');
        }
      });
    });

    // More Filters button toggle
    let moreFiltersState = false;
    if (btnMoreFilters) {
      btnMoreFilters.addEventListener('click', function() {
        moreFiltersState = !moreFiltersState;
        if (moreFiltersState) {
          btnMoreFilters.style.borderColor = 'var(--brand-orange)';
          btnMoreFilters.style.color = 'var(--brand-orange)';
          btnMoreFilters.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"/></svg> Full Access`;
          if (accessFilter) accessFilter.value = 'Full Access';
          renderTable();
          window.AegisOwner?.showToast('Advanced Filter: Showing Full Access Delegations');
        } else {
          btnMoreFilters.style.borderColor = '';
          btnMoreFilters.style.color = '';
          btnMoreFilters.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> More Filters`;
          if (accessFilter) accessFilter.value = 'all';
          renderTable();
          window.AegisOwner?.showToast('Filters reset to all');
        }
      });
    }

    if (btnOpenShareVault) btnOpenShareVault.addEventListener('click', openShareModal);
    if (btnQuickShareSide) btnQuickShareSide.addEventListener('click', openShareModal);

    const btnQuickFilterActive = document.getElementById('btnQuickFilterActiveShares');
    if (btnQuickFilterActive) {
      btnQuickFilterActive.addEventListener('click', (e) => {
        e.preventDefault();
        if (statusFilter) {
          statusFilter.value = 'active';
          renderTable();
        }
        window.AegisOwner?.showToast('Filtered: Active Shares', 'success');
      });
    }

    // Form Submit (Share a Vault)
    if (formShareVault) {
      formShareVault.addEventListener('submit', function(e) {
        e.preventDefault();

        const vaultSelect = document.getElementById('shareTargetVault');
        const trusteeSelect = document.getElementById('shareTargetTrustee');
        const accessSelect = document.getElementById('shareAccessLevel');
        const expirySelect = document.getElementById('shareExpiry');
        const noteInput = document.getElementById('shareNote');

        const vaultVal = vaultSelect ? vaultSelect.value : 'Personal Vault';
        const vaultName = vaultSelect ? vaultSelect.options[vaultSelect.selectedIndex].text : 'Personal Vault';
        
        const trusteeText = trusteeSelect ? trusteeSelect.options[trusteeSelect.selectedIndex].text : '';
        const trusteeOpt = trusteeSelect ? trusteeSelect.options[trusteeSelect.selectedIndex] : null;
        const trusteeName = trusteeOpt && trusteeOpt.dataset.name ? trusteeOpt.dataset.name : (trusteeSelect ? trusteeSelect.value : 'Sneha Mehta');
        
        const access = accessSelect ? accessSelect.value : 'View & Download';
        const expiry = expirySelect ? expirySelect.value : 'Never';
        const note = noteInput ? noteInput.value.trim() : '';

        const emailMatch = trusteeText.match(/\(([^)]+)\)/);
        const email = (trusteeOpt && trusteeOpt.dataset.email) ? trusteeOpt.dataset.email : (emailMatch ? emailMatch[1] : `${trusteeName.toLowerCase().replace(/\s+/g, '.')}@email.com`);

        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
          const payload = {
            vault_id: vaultVal,
            trustee_email: email,
            access_level: access,
            note: note,
            expires_at: expiry === 'Never' ? null : new Date(Date.now() + 30*24*60*60*1000).toISOString()
          };
          window.AegisAPI.post('/owner/shares/', payload).then(s => {
            const newShare = {
              id: s.id,
              vault: s.vault_name,
              vaultDesc: s.vault_description || '',
              vaultThumb: '../assets/images/vault-thumb-1.png',
              trusteeName: s.trustee_name,
              trusteeEmail: s.trustee_email,
              avatarType: 'img',
              avatar: '../assets/images/trustee-avatar-2.png',
              accessLevel: s.access_level,
              status: s.status,
              sharedDate: new Date(s.created_at).toLocaleDateString(),
              sharedTime: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              expiresOn: s.expires_at ? new Date(s.expires_at).toLocaleDateString() : 'Never',
              note: s.note || ''
            };
            shares.unshift(newShare);
            updateKPIs();
            renderTable();
            if (shareVaultModal) shareVaultModal.classList.remove('show', 'active');
            document.body.style.overflow = '';
            if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(`Shared ${s.vault_name} with ${s.trustee_name} successfully!`);
          }).catch(err => {
            if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(`Failed to share vault: ${err.message}`, 'error');
          });
        } else {
          const newId = 'share-' + Date.now();
          const now = new Date();
          const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          const sharedDate = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;
          const sharedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newShare = {
            id: newId, vault: vaultVal, vaultDesc: 'Encrypted assets...', vaultThumb: '../assets/images/vault-thumb-1.png',
            trusteeName: trusteeName, trusteeEmail: email, avatarType: 'img', avatar: '../assets/images/trustee-avatar-2.png',
            accessLevel: access, status: 'active', sharedDate: sharedDate, sharedTime: sharedTime,
            expiresOn: expiry === 'Never' ? 'Never' : '30 Days', note: note
          };
          shares.unshift(newShare);
          updateKPIs();
          renderTable();
          if (shareVaultModal) shareVaultModal.classList.remove('show', 'active');
          document.body.style.overflow = '';
          if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(`Shared ${vaultVal} with ${trusteeName} successfully!`);
        }
      });
    }

    // Form Submit (Edit Share)
    if (formEditShare) {
      formEditShare.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!activeShareItem) return;

        const accessSelect = document.getElementById('editAccessLevelSelect');
        const expirySelect = document.getElementById('editExpirySelect');
        const noteInput = document.getElementById('editShareNote');

        const newAccess = accessSelect ? accessSelect.value : activeShareItem.accessLevel;
        const newExpiry = expirySelect ? expirySelect.value : activeShareItem.expiresOn;
        const newNote = noteInput ? noteInput.value.trim() : activeShareItem.note;

        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
          window.AegisAPI.put(`/owner/shares/${activeShareItem.id}/`, {
            access_level: newAccess,
            note: newNote,
            expires_at: newExpiry === 'Never' ? null : new Date(Date.now() + 30*24*60*60*1000).toISOString()
          }).then(s => {
            activeShareItem.accessLevel = s.access_level;
            activeShareItem.expiresOn = s.expires_at ? new Date(s.expires_at).toLocaleDateString() : 'Never';
            activeShareItem.note = s.note;
            updateKPIs();
            renderTable();
            if (editShareModal) editShareModal.classList.remove('show', 'active');
            document.body.style.overflow = '';
            if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(`Share permissions updated for ${activeShareItem.trusteeName}.`);
          }).catch(err => {
            if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(`Failed to update share: ${err.message}`, 'error');
          });
        } else {
          activeShareItem.accessLevel = newAccess;
          activeShareItem.expiresOn = newExpiry;
          activeShareItem.note = newNote;
          updateKPIs();
          renderTable();
          if (editShareModal) editShareModal.classList.remove('show', 'active');
          document.body.style.overflow = '';
          if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(`Share permissions updated for ${activeShareItem.trusteeName}.`);
        }
      });
    }

    // Revoke Access Button in Edit Modal
    if (btnRevokeAccess) {
      btnRevokeAccess.addEventListener('click', function() {
        if (!activeShareItem) return;
        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
          window.AegisAPI.post(`/owner/shares/${activeShareItem.id}/revoke/`).then(() => {
            activeShareItem.status = 'revoked';
            updateKPIs();
            renderTable();
            if (editShareModal) editShareModal.classList.remove('show', 'active');
            document.body.style.overflow = '';
            if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(`Access to ${activeShareItem.vault} revoked for ${activeShareItem.trusteeName}.`, 'warning');
          }).catch(err => {
            if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(`Failed to revoke access: ${err.message}`, 'error');
          });
        } else {
          activeShareItem.status = 'revoked';
          updateKPIs();
          renderTable();
          if (editShareModal) editShareModal.classList.remove('show', 'active');
          document.body.style.overflow = '';
          if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(`Access to ${activeShareItem.vault} revoked for ${activeShareItem.trusteeName}.`, 'warning');
        }
      });
    }
  }

  // =========================================================================
  // 8. Public API
  // =========================================================================
  window.AegisShares = {
    openEditModal: openEditModal,
    openRemindModal: openRemindModal,
    openRestoreModal: openRestoreModal,
    openMoreOptions: openMoreOptions
  };

  // =========================================================================
  // 9. Startup Execution
  // =========================================================================
  document.addEventListener('DOMContentLoaded', function() {
    initEvents();
    if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
      window.AegisAPI.get('/owner/vaults/').then(vs => {
        const sel = document.getElementById('shareTargetVault');
        if(sel) sel.innerHTML = vs.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
      }).catch(e=>{});
      window.AegisAPI.get('/owner/trustees/').then(ts => {
        const sel = document.getElementById('shareTargetTrustee');
        if(sel) sel.innerHTML = ts.map(t => `<option value="${t.id}" data-email="${t.email}" data-name="${t.name}">${t.name} (${t.email})</option>`).join('');
      }).catch(e=>{});

      window.AegisAPI.get('/owner/shares/').then(data => {
        shares = data.map(s => ({
          id: s.id,
          vault: s.vault_name,
          vaultDesc: s.vault_description || '',
          vaultThumb: '../assets/images/vault-thumb-1.png',
          trusteeName: s.trustee_name,
          trusteeEmail: s.trustee_email,
          avatarType: 'img',
          avatar: '../assets/images/trustee-avatar-2.png',
          accessLevel: s.access_level,
          status: s.status,
          sharedDate: new Date(s.created_at).toLocaleDateString(),
          sharedTime: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          expiresOn: s.expires_at ? new Date(s.expires_at).toLocaleDateString() : 'Never',
          note: s.note || ''
        }));
        updateKPIs();
        renderTable();
      }).catch(err => {
        console.error('Failed to load shares', err);
        updateKPIs();
        renderTable();
      });
    } else {
      updateKPIs();
      renderTable();
    }
  });

})();
