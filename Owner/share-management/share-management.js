/**
 * AegisVault Owner Panel — Share Management Logic
 * Module 05: Shared Vaults, Access Permissions, Expirations & Lifecycle
 */

(function() {
  'use strict';

  // =========================================================================
  // 1. Live Dataset (Populated dynamically from Django backend API)
  // =========================================================================
  let shares = [];

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
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getInitials(name) {
    if (!name) return 'TR';
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  function getAccessLevelPill(level) {
    if (level === 'No Access') {
      return `
        <span class="access-pill no-access" style="background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.25);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          No Access
        </span>`;
    }
    if (level === 'View Only') {
      return `
        <span class="access-pill view-only">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View Only
        </span>`;
    }
    return `
      <span class="access-pill view-download">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        View &amp; Download
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
      <button class="btn-table-more" data-action="more" data-id="${item.id}" onclick="window.AegisShares.openMoreOptions('${item.id}', event)" title="More Options" aria-label="More options for ${escapeHtml(item.vault)}">
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
      const initials = item.initials || getInitials(item.trusteeName);
      const avatarHtml = `<div class="trustee-avatar-initials" style="background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%); width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; color: #ffffff; border: 1.5px solid var(--border-subtle); flex-shrink: 0;" title="${escapeHtml(item.trusteeName)}">${initials}</div>`;
      const trusteeHtml = `
        <div class="trustee-cell-content">
          ${avatarHtml}
          <div class="trustee-meta-box">
            <span class="trustee-name-text">${escapeHtml(item.trusteeName)}</span>
            <span class="trustee-email-text" title="${escapeHtml(item.trusteeEmail)}">${escapeHtml(item.trusteeEmail)}</span>
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

    const activityContainer = document.getElementById('sharesActivityList');
    if (activityContainer) {
      if (shares.length === 0) {
        activityContainer.innerHTML = `
          <div style="padding: 1.5rem 0.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
            No recent share activity recorded.
          </div>`;
      } else {
        const sorted = [...shares].slice(0, 5);
        activityContainer.innerHTML = sorted.map(s => {
          let dotClass = 'green';
          let actionText = `${s.trusteeName} active share`;
          if (s.status === 'pending') {
            dotClass = 'amber';
            actionText = `${s.trusteeName} pending acceptance`;
          } else if (s.status === 'revoked') {
            dotClass = 'red';
            actionText = `${s.trusteeName} access revoked`;
          }
          return `
            <div class="activity-timeline-item">
              <span class="activity-dot ${dotClass}"></span>
              <div class="activity-info">
                <span class="activity-title">${actionText}</span>
                <span class="activity-time">${s.sharedDate}, ${s.sharedTime}</span>
              </div>
            </div>`;
        }).join('');
      }
    }
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
            <option value="No Access" ${item.accessLevel === 'No Access' ? 'selected' : ''}>No Access</option>
            <option value="View Only" ${item.accessLevel === 'View Only' ? 'selected' : ''}>View Only</option>
            <option value="View & Download" ${item.accessLevel === 'View & Download' ? 'selected' : ''}>View & Download</option>
          </select>
        </div>

        <div style="margin-bottom: 1.15rem;">
          <label style="display:block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text-primary);">Expiration Policy</label>
          <select id="editExpirySelect" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-md); background: var(--bg-input); border: 1px solid var(--bg-input-border); color: var(--text-primary);">
            <option value="Never" ${!item.expiresOn || item.expiresOn === 'Never' ? 'selected' : ''}>Never (Permanent)</option>
            <option value="30 Days" ${item.expiresOn && item.expiresOn.includes('30') ? 'selected' : ''}>30 Days</option>
            <option value="90 Days" ${item.expiresOn && item.expiresOn.includes('90') ? 'selected' : ''}>90 Days</option>
            <option value="1 Year" ${item.expiresOn && (item.expiresOn.includes('Year') || item.expiresOn.includes('365')) ? 'selected' : ''}>1 Year</option>
          </select>
        </div>

        <div>
          <label style="display:block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text-primary);">Access Note / Directives</label>
          <textarea id="editShareNote" rows="2" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-md); background: var(--bg-input); border: 1px solid var(--bg-input-border); color: var(--text-primary); resize: none;">${item.note || ''}</textarea>
        </div>`;
    }

    if (btnRevokeAccess) {
      if (item.status === 'revoked') {
        btnRevokeAccess.textContent = 'Restore Access';
        btnRevokeAccess.className = 'btn btn-primary';
        btnRevokeAccess.style.background = 'var(--status-success)';
      } else {
        btnRevokeAccess.textContent = 'Revoke Access';
        btnRevokeAccess.className = 'btn btn-danger';
        btnRevokeAccess.style.background = '';
      }
    }

    if (editShareModal) {
      editShareModal.classList.add('show', 'active');
      document.body.style.overflow = 'hidden';
    }
  }

  function openDetailsModal(id) {
    const item = shares.find(s => s.id === id);
    if (!item) return;
    activeShareItem = item;

    if (confirmActionModalTitle) confirmActionModalTitle.textContent = `Share Details: ${item.vault}`;
    if (confirmActionModalBody) {
      confirmActionModalBody.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem; padding-bottom:0.75rem; border-bottom:1px solid var(--border-subtle);">
          <div style="background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.95rem; color: #fff;">${item.initials || getInitials(item.trusteeName)}</div>
          <div>
            <h4 style="margin:0; font-size:1rem; font-weight:700; color:var(--text-primary);">${escapeHtml(item.trusteeName)}</h4>
            <span style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(item.trusteeEmail)}</span>
          </div>
          <div style="margin-left:auto;">
            ${getAccessLevelPill(item.accessLevel)}
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1rem;">
          <div style="background:var(--bg-surface); padding:0.65rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <span style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; display:block; margin-bottom:0.25rem;">Vault</span>
            <span style="font-size:0.85rem; font-weight:600; color:var(--text-primary);">${escapeHtml(item.vault)}</span>
          </div>
          <div style="background:var(--bg-surface); padding:0.65rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <span style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; display:block; margin-bottom:0.25rem;">Status</span>
            <span style="font-size:0.85rem; font-weight:600; color:var(--text-primary); text-transform:capitalize;">${item.status}</span>
          </div>
          <div style="background:var(--bg-surface); padding:0.65rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <span style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; display:block; margin-bottom:0.25rem;">Shared On</span>
            <span style="font-size:0.85rem; font-weight:600; color:var(--text-primary);">${item.sharedDate} ${item.sharedTime}</span>
          </div>
          <div style="background:var(--bg-surface); padding:0.65rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <span style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; display:block; margin-bottom:0.25rem;">Expires On</span>
            <span style="font-size:0.85rem; font-weight:600; color:var(--text-primary);">${item.expiresOn}</span>
          </div>
        </div>
        ${item.note ? `
          <div style="margin-bottom:0.5rem;">
            <span style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; display:block; margin-bottom:0.25rem;">Directives</span>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin:0; background:var(--bg-surface); padding:0.65rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">&ldquo;${escapeHtml(item.note)}&rdquo;</p>
          </div>
        ` : ''}
      `;
    }
    if (btnConfirmAction) {
      btnConfirmAction.textContent = 'Edit Permissions';
      btnConfirmAction.onclick = function() {
        if (confirmActionModal) confirmActionModal.classList.remove('show', 'active');
        openEditModal(id);
      };
    }
    if (confirmActionModal) {
      confirmActionModal.classList.add('show', 'active');
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

  function openMoreOptions(id, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const item = shares.find(s => s.id === id);
    if (!item) return;

    closeShareMenu();

    const anchorEl = (e && e.currentTarget) || document.querySelector(`[data-action="more"][data-id="${id}"]`);
    if (!anchorEl) return;

    const menu = document.createElement('div');
    menu.className = 'dropdown-panel show';
    menu.style.position = 'fixed';
    menu.style.display = 'flex';
    menu.style.flexDirection = 'column';
    menu.style.zIndex = '9999';
    menu.style.minWidth = '210px';
    menu.style.boxShadow = 'var(--shadow-dropdown)';
    menu.style.backgroundColor = 'var(--bg-surface)';
    menu.style.border = '1px solid var(--border-subtle)';
    menu.style.borderRadius = 'var(--radius-lg)';
    menu.style.padding = '0.5rem';

    menu.addEventListener('click', (ev) => ev.stopPropagation());

    const isRevoked = item.status === 'revoked';

    menu.innerHTML = `
      <div class="dropdown-header" style="padding: 0.4rem 0.6rem 0.25rem; font-size: 0.74rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
        ${escapeHtml(item.trusteeName)} • ${escapeHtml(item.vault)}
      </div>
      <button class="dropdown-item" data-action="view" style="width:100%; border:none; background:none; text-align:left; cursor:pointer; display:flex; align-items:center; gap:0.6rem; padding:0.55rem 0.75rem; font-size:0.84rem; color:var(--text-primary); border-radius:var(--radius-md);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        <span>View Details</span>
      </button>
      <button class="dropdown-item" data-action="edit" style="width:100%; border:none; background:none; text-align:left; cursor:pointer; display:flex; align-items:center; gap:0.6rem; padding:0.55rem 0.75rem; font-size:0.84rem; color:var(--text-primary); border-radius:var(--radius-md);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        <span>Edit Permissions</span>
      </button>
      <button class="dropdown-item" data-action="toggle-status" style="width:100%; border:none; background:none; text-align:left; cursor:pointer; display:flex; align-items:center; gap:0.6rem; padding:0.55rem 0.75rem; font-size:0.84rem; color:var(--text-primary); border-radius:var(--radius-md);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        <span>${isRevoked ? 'Restore Access' : 'Revoke Access'}</span>
      </button>
      <div style="height:1px; background:var(--border-subtle); margin:0.35rem 0;"></div>
      <button class="dropdown-item" data-action="delete" style="width:100%; border:none; background:none; text-align:left; cursor:pointer; display:flex; align-items:center; gap:0.6rem; padding:0.55rem 0.75rem; font-size:0.84rem; color:var(--status-danger); border-radius:var(--radius-md);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        <span>Remove Share</span>
      </button>
    `;

    const rect = anchorEl.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.left = `${Math.min(window.innerWidth - 225, Math.max(10, rect.right - 210))}px`;

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
      const endpoint = item.status === 'revoked' ? 'restore' : 'revoke';
      if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
        window.AegisAPI.post(`/owner/shares/${item.id}/${endpoint}/`).then(res => {
          item.status = res.status;
          updateKPIs();
          renderTable();
          window.AegisOwner?.showToast(endpoint === 'restore' ? `Share reactivated for ${item.trusteeName}!` : `Share access revoked for ${item.trusteeName}.`, 'success');
        }).catch(err => {
          window.AegisOwner?.showToast(`Failed to update share: ${err.message}`, 'error');
        });
      } else {
        item.status = item.status === 'revoked' ? 'active' : 'revoked';
        updateKPIs();
        renderTable();
      }
    });

    menu.querySelector('[data-action="delete"]').addEventListener('click', () => {
      closeShareMenu();
      if (!confirm(`Permanently remove share access for "${item.trusteeName}" on ${item.vault}?`)) return;
      if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
        window.AegisAPI.delete(`/owner/shares/${item.id}/`).then(() => {
          shares = shares.filter(s => s.id !== item.id);
          updateKPIs();
          renderTable();
          window.AegisOwner?.showToast(`Share removed successfully.`, 'info');
        }).catch(err => {
          window.AegisOwner?.showToast(`Failed to delete share: ${err.message}`, 'error');
        });
      } else {
        shares = shares.filter(s => s.id !== item.id);
        updateKPIs();
        renderTable();
      }
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
          btnMoreFilters.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"/></svg> View &amp; Download`;
          if (accessFilter) accessFilter.value = 'View & Download';
          renderTable();
          window.AegisOwner?.showToast('Advanced Filter: Showing View & Download Delegations');
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
        const trusteeName = trusteeOpt && trusteeOpt.dataset.name ? trusteeOpt.dataset.name : (trusteeSelect ? trusteeSelect.value : 'Designated Trustee');
        
        const access = accessSelect ? accessSelect.value : 'View & Download';
        const expiry = expirySelect ? expirySelect.value : 'Never';
        const note = noteInput ? noteInput.value.trim() : '';

        const emailMatch = trusteeText.match(/\(([^)]+)\)/);
        const email = (trusteeOpt && trusteeOpt.dataset.email) ? trusteeOpt.dataset.email : (emailMatch ? emailMatch[1] : `${trusteeName.toLowerCase().replace(/\s+/g, '.')}@email.com`);

        function computeExpiryIso(val) {
          if (!val || val === 'Never') return null;
          const now = Date.now();
          if (val === '30 Days') return new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();
          if (val === '90 Days') return new Date(now + 90 * 24 * 60 * 60 * 1000).toISOString();
          if (val === '1 Year') return new Date(now + 365 * 24 * 60 * 60 * 1000).toISOString();
          return null;
        }

        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
          const payload = {
            vault_id: vaultVal,
            trustee_email: email,
            access_level: access,
            note: note,
            expires_at: computeExpiryIso(expiry)
          };
          window.AegisAPI.post('/owner/shares/', payload).then(s => {
            const newShare = {
              id: s.id,
              vault: s.vault_name,
              vaultDesc: s.vault_description || '',
              vaultThumb: '../assets/images/vault-thumb-1.png',
              trusteeName: s.trustee_name,
              trusteeEmail: s.trustee_email,
              initials: getInitials(s.trustee_name),
              avatarType: 'initials',
              accessLevel: s.access_level,
              status: s.status,
              sharedDate: new Date(s.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }),
              sharedTime: new Date(s.created_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
              expiresOn: s.expires_at ? new Date(s.expires_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }) : 'Never',
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
          const sharedTime = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
          const newShare = {
            id: newId, vault: vaultVal, vaultDesc: 'Encrypted assets...', vaultThumb: '../assets/images/vault-thumb-1.png',
            trusteeName: trusteeName, trusteeEmail: email, avatarType: 'initials', initials: getInitials(trusteeName),
            accessLevel: access, status: 'active', sharedDate: sharedDate, sharedTime: sharedTime,
            expiresOn: expiry === 'Never' ? 'Never' : expiry, note: note
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
        const newExpiry = expirySelect ? expirySelect.value : 'Never';
        const newNote = noteInput ? noteInput.value.trim() : activeShareItem.note;

        function computeExpiryIso(val) {
          if (!val || val === 'Never') return null;
          const now = Date.now();
          if (val === '30 Days') return new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();
          if (val === '90 Days') return new Date(now + 90 * 24 * 60 * 60 * 1000).toISOString();
          if (val === '1 Year') return new Date(now + 365 * 24 * 60 * 60 * 1000).toISOString();
          return null;
        }

        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
          window.AegisAPI.put(`/owner/shares/${activeShareItem.id}/`, {
            access_level: newAccess,
            note: newNote,
            expires_at: computeExpiryIso(newExpiry)
          }).then(s => {
            activeShareItem.accessLevel = s.access_level;
            activeShareItem.expiresOn = s.expires_at ? new Date(s.expires_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }) : 'Never';
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

    // Revoke / Restore Access Button in Edit Modal
    if (btnRevokeAccess) {
      btnRevokeAccess.addEventListener('click', function() {
        if (!activeShareItem) return;
        const endpoint = activeShareItem.status === 'revoked' ? 'restore' : 'revoke';
        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
          window.AegisAPI.post(`/owner/shares/${activeShareItem.id}/${endpoint}/`).then(res => {
            activeShareItem.status = res.status || (endpoint === 'restore' ? 'active' : 'revoked');
            updateKPIs();
            renderTable();
            if (editShareModal) editShareModal.classList.remove('show', 'active');
            document.body.style.overflow = '';
            const msg = endpoint === 'restore'
              ? `Access restored for ${activeShareItem.trusteeName} on ${activeShareItem.vault}!`
              : `Access revoked for ${activeShareItem.trusteeName} on ${activeShareItem.vault}.`;
            if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(msg, endpoint === 'restore' ? 'success' : 'warning');
          }).catch(err => {
            if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(`Failed to update access: ${err.message}`, 'error');
          });
        } else {
          activeShareItem.status = activeShareItem.status === 'revoked' ? 'active' : 'revoked';
          updateKPIs();
          renderTable();
          if (editShareModal) editShareModal.classList.remove('show', 'active');
          document.body.style.overflow = '';
          const msg = activeShareItem.status === 'active'
            ? `Access restored for ${activeShareItem.trusteeName} on ${activeShareItem.vault}!`
            : `Access revoked for ${activeShareItem.trusteeName} on ${activeShareItem.vault}.`;
          if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(msg, activeShareItem.status === 'active' ? 'success' : 'warning');
        }
      });
    }
  }

  // =========================================================================
  // 8. Public API
  // =========================================================================
  window.AegisShares = {
    openDetailsModal: openDetailsModal,
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
          initials: getInitials(s.trustee_name),
          avatarType: 'initials',
          accessLevel: s.access_level,
          status: s.status,
          sharedDate: new Date(s.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }),
          sharedTime: new Date(s.created_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
          expiresOn: s.expires_at ? new Date(s.expires_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }) : 'Never',
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
