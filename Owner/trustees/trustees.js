/**
 * AegisVault Owner Panel — Trustees Logic
 * Module 03: Trustee Management, Filtering, Dynamic Table, Donut Chart & Modals
 */

(function () {
  'use strict';

  // Local state
  let liveTrustees = [];
  let ownerVaults = [];

  // Helper Modal Open/Close
  function openModal(modalId) {
    if (window.AegisOwner && window.AegisOwner.openModal) {
      window.AegisOwner.openModal(modalId);
    } else {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('show', 'active');
        document.body.style.overflow = 'hidden';
      }
    }
  }

  function closeModal(modalId) {
    if (window.AegisOwner && window.AegisOwner.closeModal) {
      window.AegisOwner.closeModal(modalId);
    } else {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('show', 'active');
        document.body.style.overflow = '';
      }
    }
  }

  // =========================================================================
  // RENDER & FILTER CONTROLLER
  // =========================================================================

  function renderTrusteesTable() {
    const tbody = document.getElementById('trusteesTableTbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const searchVal = (document.getElementById('trusteeSearchInput')?.value || '').toLowerCase().trim();
    const statusVal = (document.getElementById('statusFilterSelect')?.value || 'all').toLowerCase();
    const vaultVal = (document.getElementById('vaultFilterSelect')?.value || 'all').toLowerCase();
    const relVal = (document.getElementById('relationshipFilterSelect')?.value || 'all').toLowerCase();

    // Filter
    const filtered = liveTrustees.filter(t => {
      const name = (t.name || '').toLowerCase();
      const email = (t.email || '').toLowerCase();
      const relationship = (t.relationship || '').toLowerCase();
      const verifStatus = (t.verifStatus || '').toLowerCase();
      const status = (t.status || '').toLowerCase();

      const matchSearch = !searchVal ||
        name.includes(searchVal) ||
        email.includes(searchVal) ||
        relationship.includes(searchVal);

      let matchStatus = (statusVal === 'all');
      if (!matchStatus) {
        if (statusVal === 'verified') matchStatus = verifStatus === 'verified';
        else if (statusVal === 'pending') matchStatus = verifStatus === 'pending';
        else if (statusVal === 'not started') matchStatus = verifStatus === 'not started';
        else if (statusVal === 'invited') matchStatus = status === 'invited';
        else if (statusVal === 'removed') matchStatus = status === 'removed';
      }

      let matchVault = (vaultVal === 'all');
      if (!matchVault) {
        matchVault = (t.vaults || []).some(v => v.toLowerCase().includes(vaultVal));
      }

      let matchRel = (relVal === 'all') || (relationship === relVal);

      return matchSearch && matchStatus && matchVault && matchRel;
    });

    // Update Counts & Overview
    updateStatsAndDonut();

    if (filtered.length === 0) {
      if (liveTrustees.length === 0) {
        // Zero trustees overall - Full premium empty state
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="border: none; padding: 0;">
              <div class="trustees-empty-card">
                <div class="empty-icon-shield">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M12 8v4"/>
                    <path d="M12 16h.01"/>
                  </svg>
                </div>
                <h3 class="empty-title">No Trustees Designated Yet</h3>
                <p class="empty-desc">
                  Trustees safeguard access to your vaults using cryptographic key shares. Invite your first trustee to start configuring your multi-party consensus security.
                </p>
                <button class="btn btn-primary btn-add-first-trustee" id="btnEmptyAddTrustee">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px; height:16px;">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add Your First Trustee
                </button>
                <div class="empty-feature-pills">
                  <div class="empty-feature-pill">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <span>Shamir Secret Sharing</span>
                  </div>
                  <div class="empty-feature-pill">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                    <span>Identity Verification</span>
                  </div>
                  <div class="empty-feature-pill">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
                    <span>Consensus Release</span>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        `;
        document.getElementById('btnEmptyAddTrustee')?.addEventListener('click', () => {
          openModal('addTrusteeModal');
        });
      } else {
        // Filter criteria produced no results
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="border: none; padding: 0;">
              <div class="trustees-empty-card" style="min-height: 280px; padding: 2.5rem 1rem;">
                <div class="empty-icon-shield" style="background: rgba(249, 115, 22, 0.08); color: var(--brand-orange); border-color: rgba(249, 115, 22, 0.2);">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <h3 class="empty-title">No Matching Trustees</h3>
                <p class="empty-desc">
                  No trustees match your current search query or active filter settings.
                </p>
                <button class="btn btn-secondary" id="btnResetFiltersTable" style="padding: 0.5rem 1.25rem;">
                  Reset Filters
                </button>
              </div>
            </td>
          </tr>
        `;
        document.getElementById('btnResetFiltersTable')?.addEventListener('click', resetAllFilters);
      }
      return;
    }

    filtered.forEach(t => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-id', t.id);

      // Avatar markup
      let avatarHtml = '';
      if (t.avatarType === 'img' && t.avatarSrc) {
        avatarHtml = `<div class="trustee-avatar-img" style="background-image: url('${t.avatarSrc}');"></div>`;
      } else {
        avatarHtml = `<div class="trustee-avatar-initials" style="background: ${t.initialsBg};">${t.initials}</div>`;
      }

      // Verification pill icon
      let verifIcon = '●';
      if (t.verifStatus === 'Verified') verifIcon = '✓';
      else if (t.verifStatus === 'Pending') verifIcon = '⏱';
      else if (t.verifStatus === 'Revoked') verifIcon = '✕';

      // Status pill icon
      let statusIcon = '●';
      if (t.status === 'Active') statusIcon = '✓';
      else if (t.status === 'Invited') statusIcon = '✉';
      else if (t.status === 'Removed') statusIcon = '✕';

      const vaultsDisplay = (t.vaults && t.vaults.length > 0)
        ? t.vaults.join(', ')
        : (t.vaultsCount ? `${t.vaultsCount} Vaults` : 'No Vaults');

      tr.innerHTML = `
        <!-- Avatar -->
        <td class="trustee-avatar-cell">
          ${avatarHtml}
        </td>

        <!-- Name & Email -->
        <td>
          <div class="trustee-name-texts">
            <span class="trustee-name">${escapeHtml(t.name)}</span>
            <span class="trustee-email" title="${escapeHtml(t.email)}">${escapeHtml(t.email)}</span>
          </div>
        </td>

        <!-- Relationship -->
        <td>
          <span class="rel-badge ${t.relClass}">
            ${t.relIcon}
            ${escapeHtml(t.relationship)}
          </span>
        </td>

        <!-- Vaults Assigned -->
        <td>
          <span class="vaults-count-badge" title="${escapeHtml(vaultsDisplay)}">
            ${escapeHtml(vaultsDisplay)}
          </span>
        </td>

        <!-- Verification Status -->
        <td>
          <span class="status-pill ${t.verifClass}">
            <span>${verifIcon}</span>
            <span>${escapeHtml(t.verifStatus)}</span>
          </span>
        </td>

        <!-- Status -->
        <td>
          <span class="status-pill ${t.statusClass}">
            <span>${statusIcon}</span>
            <span>${escapeHtml(t.status)}</span>
          </span>
        </td>

        <!-- Actions -->
        <td>
          <div class="trustee-actions-cell">
            <button class="btn-icon-action" data-action="view" data-id="${t.id}" title="View Details" aria-label="View Details for ${escapeHtml(t.name)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="btn-icon-action edit-action" data-action="edit" data-id="${t.id}" title="Edit Permissions" aria-label="Edit Permissions for ${escapeHtml(t.name)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-icon-action" data-action="remind" data-id="${t.id}" title="Send Verification Reminder" aria-label="Remind ${escapeHtml(t.name)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
            <button class="btn-icon-action delete-action" data-action="delete" data-id="${t.id}" title="Delete Trustee" aria-label="Delete ${escapeHtml(t.name)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
            <button class="btn-icon-action more-dots" data-action="context" data-id="${t.id}" title="More options" aria-label="More options for ${escapeHtml(t.name)}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
              </svg>
            </button>
          </div>
        </td>
      `;

      tbody.appendChild(tr);
    });

    bindRowActions();
  }

  // =========================================================================
  // UPDATE STATS & DONUT CHART
  // =========================================================================

  function updateStatsAndDonut() {
    const total = liveTrustees.length;
    const verified = liveTrustees.filter(t => (t.verifStatus || '').toLowerCase() === 'verified').length;
    const pending = liveTrustees.filter(t => (t.verifStatus || '').toLowerCase() === 'pending').length;
    const invited = liveTrustees.filter(t => (t.status || '').toLowerCase() === 'invited').length;
    const removed = liveTrustees.filter(t => (t.status || '').toLowerCase() === 'removed').length;

    // 1. Update KPI card DOM
    const elTotal = document.getElementById('statTotalTrustees');
    const elVerif = document.getElementById('statVerifiedTrustees');
    const elPend = document.getElementById('statPendingTrustees');
    const elInv = document.getElementById('statInvitedTrustees');
    const elRem = document.getElementById('statRemovedTrustees');

    if (elTotal) elTotal.textContent = total;
    if (elVerif) elVerif.textContent = verified;
    if (elPend) elPend.textContent = pending;
    if (elInv) elInv.textContent = invited;
    if (elRem) elRem.textContent = removed;

    // 2. Update Donut Center Number
    const elCenterNum = document.querySelector('.donut-center-num');
    if (elCenterNum) elCenterNum.textContent = total;

    // 3. Update Donut Legend Counts
    const legVerif = document.getElementById('legendVerifiedCount');
    const legPend = document.getElementById('legendPendingCount');
    const legInv = document.getElementById('legendInvitedCount');
    const legRem = document.getElementById('legendRemovedCount');

    if (legVerif) legVerif.textContent = verified;
    if (legPend) legPend.textContent = pending;
    if (legInv) legInv.textContent = invited;
    if (legRem) legRem.textContent = removed;

    // 4. Update Donut Segments (circumference for r=46 is 2 * PI * 46 = 289.02)
    const C = 289.02;
    const segVerif = document.querySelector('.donut-seg.verified');
    const segPend = document.querySelector('.donut-seg.pending');
    const segInv = document.querySelector('.donut-seg.invited');

    if (segVerif && segPend && segInv) {
      if (total === 0) {
        segVerif.setAttribute('stroke-dasharray', `0 ${C}`);
        segPend.setAttribute('stroke-dasharray', `0 ${C}`);
        segInv.setAttribute('stroke-dasharray', `0 ${C}`);
      } else {
        const verifLen = (verified / total) * C;
        const pendLen = (pending / total) * C;
        const invLen = (invited / total) * C;

        segVerif.setAttribute('stroke-dasharray', `${verifLen} ${C}`);
        segVerif.setAttribute('stroke-dashoffset', '0');

        segPend.setAttribute('stroke-dasharray', `${pendLen} ${C}`);
        segPend.setAttribute('stroke-dashoffset', `-${verifLen}`);

        segInv.setAttribute('stroke-dasharray', `${invLen} ${C}`);
        segInv.setAttribute('stroke-dashoffset', `-${verifLen + pendLen}`);
      }
    }

    // 5. Update Verification Progress widget
    const percent = total > 0 ? Math.round((verified / total) * 100) : 0;
    const elVerifTitle = document.getElementById('verifProgressTitle') || document.querySelector('.verification-title');
    const elVerifVal = document.getElementById('verifProgressPercent') || document.querySelector('.verification-value');
    const elVerifBar = document.getElementById('verifProgressBar') || document.querySelector('.verification-bar-fill');

    if (elVerifTitle) elVerifTitle.textContent = `${verified} of ${total} trustees verified`;
    if (elVerifVal) elVerifVal.textContent = `${percent}%`;
    if (elVerifBar) elVerifBar.style.width = `${percent}%`;
  }

  // =========================================================================
  // ROW ACTIONS (View Details, Edit, Remind, Delete, Context Menu)
  // =========================================================================

  function bindRowActions() {
    // 1. View Details
    document.querySelectorAll('.btn-icon-action[data-action="view"]').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        openTrusteeDetailsModal(id);
      });
    });

    // 2. Edit Permissions
    document.querySelectorAll('.btn-icon-action[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        openEditTrusteeModal(id);
      });
    });

    // 3. Remind / Ping
    document.querySelectorAll('.btn-icon-action[data-action="remind"]').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        const t = liveTrustees.find(x => x.id === id);
        if (t) sendVerificationReminder(t);
      });
    });

    // 4. Delete Trustee
    document.querySelectorAll('.btn-icon-action[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        const t = liveTrustees.find(x => x.id === id);
        if (t) deleteTrustee(t);
      });
    });

    // 5. More Dots Context Menu
    document.querySelectorAll('.btn-icon-action[data-action="context"]').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const id = this.getAttribute('data-id');
        const t = liveTrustees.find(x => x.id === id);
        if (t) openTrusteeContextMenu(t, this);
      });
    });
  }

  // Floating Context Menu for Trustees
  let activeTrusteeMenu = null;

  function closeTrusteeContextMenu() {
    if (activeTrusteeMenu) {
      activeTrusteeMenu.remove();
      activeTrusteeMenu = null;
    }
  }

  document.addEventListener('click', closeTrusteeContextMenu);

  function openTrusteeContextMenu(t, anchorEl) {
    closeTrusteeContextMenu();

    const menu = document.createElement('div');
    menu.className = 'dropdown-panel';
    menu.style.position = 'fixed';
    menu.style.zIndex = '9999';
    menu.style.minWidth = '210px';
    menu.style.boxShadow = 'var(--shadow-dropdown)';

    menu.innerHTML = `
      <div class="dropdown-header">${escapeHtml(t.name)}</div>
      <button class="dropdown-item" data-action="view" style="width:100%; border:none; background:none; text-align:left; cursor:pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        <span>View Profile</span>
      </button>
      <button class="dropdown-item" data-action="edit" style="width:100%; border:none; background:none; text-align:left; cursor:pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        <span>Edit Permissions</span>
      </button>
      <button class="dropdown-item" data-action="remind" style="width:100%; border:none; background:none; text-align:left; cursor:pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>
        <span>Send Verification Ping</span>
      </button>
      <div class="dropdown-divider"></div>
      <button class="dropdown-item" data-action="revoke" style="width:100%; border:none; background:none; text-align:left; cursor:pointer; color:var(--status-warning);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        <span>Revoke Access</span>
      </button>
      <button class="dropdown-item" data-action="delete" style="width:100%; border:none; background:none; text-align:left; cursor:pointer; color:var(--status-danger);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        <span>Delete Trustee</span>
      </button>
    `;

    const rect = anchorEl.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.left = `${Math.min(window.innerWidth - 230, Math.max(10, rect.left - 160))}px`;

    menu.querySelector('[data-action="view"]').addEventListener('click', () => {
      closeTrusteeContextMenu();
      openTrusteeDetailsModal(t.id);
    });

    menu.querySelector('[data-action="edit"]').addEventListener('click', () => {
      closeTrusteeContextMenu();
      openEditTrusteeModal(t.id);
    });

    menu.querySelector('[data-action="remind"]').addEventListener('click', () => {
      closeTrusteeContextMenu();
      sendVerificationReminder(t);
    });

    menu.querySelector('[data-action="revoke"]').addEventListener('click', () => {
      closeTrusteeContextMenu();
      revokeTrustee(t);
    });

    menu.querySelector('[data-action="delete"]').addEventListener('click', () => {
      closeTrusteeContextMenu();
      deleteTrustee(t);
    });

    document.body.appendChild(menu);
    activeTrusteeMenu = menu;
  }

  // -------------------------------------------------------------------------
  // Remind, Revoke, Delete Logic
  // -------------------------------------------------------------------------

  function sendVerificationReminder(t) {
    if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
      window.AegisAPI.post(`/owner/trustees/${t.id}/remind/`).then(res => {
        if (res && res.email_sent) {
          window.AegisOwner?.showToast(`Verification reminder email sent to ${t.email}!`, 'success');
        } else {
          window.AegisOwner?.showToast(`Reminder recorded! Add passkey in backend/.env for live inbox delivery.`, 'info');
        }
      }).catch(err => {
        window.AegisOwner?.showToast(`Failed to send reminder: ${err.message}`, 'error');
      });
    } else {
      window.AegisOwner?.showToast(`Verification reminder sent to ${t.email}!`, 'success');
    }
  }

  function revokeTrustee(t) {
    if (!confirm(`Revoke trustee status for "${t.name}"? They will lose decryption authorization.`)) return;

    if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
      window.AegisAPI.post(`/owner/trustees/${t.id}/revoke/`).then(() => {
        t.status = 'Removed';
        t.statusClass = 'removed';
        t.verifStatus = 'Revoked';
        t.verifClass = 'removed';
        renderTrusteesTable();
        window.AegisOwner?.showToast(`Trustee access revoked for ${t.name}.`, 'warning');
      }).catch(err => {
        window.AegisOwner?.showToast(`Failed to revoke access: ${err.message}`, 'error');
      });
    } else {
      t.status = 'Removed';
      t.statusClass = 'removed';
      t.verifStatus = 'Revoked';
      t.verifClass = 'removed';
      renderTrusteesTable();
      window.AegisOwner?.showToast(`Trustee access revoked for ${t.name}.`, 'warning');
    }
  }

  function deleteTrustee(t) {
    if (!confirm(`Are you sure you want to permanently delete trustee "${t.name}"? This will cancel their invitation and remove their access.`)) return;

    if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
      window.AegisAPI.delete(`/owner/trustees/${t.id}/`).then(() => {
        liveTrustees = liveTrustees.filter(x => x.id !== t.id);
        renderTrusteesTable();
        window.AegisOwner?.showToast(`Trustee "${t.name}" removed successfully.`, 'success');
      }).catch(err => {
        window.AegisOwner?.showToast(`Failed to delete trustee: ${err.message}`, 'error');
      });
    } else {
      liveTrustees = liveTrustees.filter(x => x.id !== t.id);
      renderTrusteesTable();
      window.AegisOwner?.showToast(`Trustee "${t.name}" removed successfully.`, 'success');
    }
  }

  // =========================================================================
  // MODAL HANDLERS
  // =========================================================================

  function openTrusteeDetailsModal(id) {
    const t = liveTrustees.find(x => x.id === id);
    if (!t) return;

    const modal = document.getElementById('trusteeDetailsModal');
    const title = document.getElementById('trusteeDetailsModalTitle');
    const body = document.getElementById('trusteeDetailsModalBody');
    if (!modal || !body) return;

    if (title) title.textContent = `${t.name} — Trustee Profile`;

    const vaultsText = (t.vaults && t.vaults.length > 0) ? t.vaults.join(', ') : 'None assigned';

    body.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle);">
        ${t.avatarType === 'img' && t.avatarSrc ? `
          <div style="width: 52px; height: 52px; border-radius: 50%; background-image: url('${t.avatarSrc}'); background-size: cover; background-position: center; border: 2px solid var(--border-subtle);"></div>
        ` : `
          <div style="width: 52px; height: 52px; border-radius: 50%; background: ${t.initialsBg}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; color: #fff; border: 2px solid var(--border-subtle);">${t.initials}</div>
        `}
        <div>
          <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">${escapeHtml(t.name)}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(t.email)} ${t.phone ? `&bull; ${escapeHtml(t.phone)}` : ''}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Relationship</span>
          <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary); margin-top: 0.2rem;">${escapeHtml(t.relationship)}</div>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Verification Status</span>
          <div style="margin-top: 0.2rem;">
            <span class="status-pill ${t.verifClass}">${escapeHtml(t.verifStatus)}</span>
          </div>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Vault Access</span>
          <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary); margin-top: 0.2rem;">${escapeHtml(vaultsText)}</div>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Cryptographic Key Held</span>
          <div style="font-weight: 600; font-size: 0.9rem; color: var(--status-info); margin-top: 0.2rem;">${escapeHtml(t.sharesHeld || 'No shares')}</div>
        </div>
      </div>

      <div style="background-color: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.85rem; font-size: 0.82rem; color: var(--text-secondary);">
        <strong style="color: var(--text-primary);">Audit Notice:</strong> Trustee was added on ${escapeHtml(t.dateAdded)}. In the event of an authorized release, this trustee participates in Shamir consensus according to your designated policy.
      </div>
    `;

    openModal('trusteeDetailsModal');
  }

  function openEditTrusteeModal(id) {
    const t = liveTrustees.find(x => x.id === id);
    if (!t) return;

    const modal = document.getElementById('editTrusteeModal');
    if (!modal) return;

    document.getElementById('editTrusteeId').value = t.id;
    document.getElementById('editTrusteeName').value = t.name;
    document.getElementById('editTrusteeEmail').value = t.email;
    document.getElementById('editTrusteeRel').value = t.relationship;

    openModal('editTrusteeModal');
  }

  function resetAllFilters() {
    const statusSelect = document.getElementById('statusFilterSelect');
    const vaultSelect = document.getElementById('vaultFilterSelect');
    const relSelect = document.getElementById('relationshipFilterSelect');
    const searchInput = document.getElementById('trusteeSearchInput');

    if (statusSelect) statusSelect.value = 'all';
    if (vaultSelect) vaultSelect.value = 'all';
    if (relSelect) relSelect.value = 'all';
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('.legend-row.donut-legend-item').forEach(el => el.classList.remove('active'));

    const btnMoreFilters = document.getElementById('btnMoreFilters');
    if (btnMoreFilters) {
      btnMoreFilters.style.borderColor = '';
      btnMoreFilters.style.color = '';
      btnMoreFilters.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> More Filters`;
    }

    renderTrusteesTable();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =========================================================================
  // DATA LOADER
  // =========================================================================

  function normalizeTrustee(t) {
    const parts = (t.name || '').trim().split(' ');
    const initials = parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (t.name ? t.name.substring(0, 2).toUpperCase() : 'TR');

    const relationship = t.relationship || 'Friend';
    const relClass = relationship.toLowerCase().replace(/\s+/g, '-');
    const verifStatus = t.verification_status || t.verifStatus || 'Not Started';
    const verifClass = verifStatus.toLowerCase().replace(/\s+/g, '-');
    const status = t.status || 'Invited';
    const statusClass = status.toLowerCase().replace(/\s+/g, '-');

    return {
      id: String(t.id),
      name: t.name || 'Unnamed Trustee',
      email: t.email || '',
      phone: t.phone || '',
      avatarType: 'initials',
      initials: initials,
      initialsBg: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
      relationship: relationship,
      relClass: relClass,
      relIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      vaults: Array.isArray(t.vaults) ? t.vaults : [],
      vaultsCount: t.vaults_count || (Array.isArray(t.vaults) ? t.vaults.length : 0),
      verifStatus: verifStatus,
      verifClass: verifClass,
      status: status,
      statusClass: statusClass,
      dateAdded: t.date_added ? new Date(t.date_added).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently',
      sharesHeld: t.shares_held || 'Pending acceptance'
    };
  }

  function loadTrusteesData() {
    if (!window.AegisAPI || !window.AegisAPI.isAuthenticated()) {
      renderTrusteesTable();
      return;
    }

    // 1. Fetch Owner Vaults for dropdown and filter
    window.AegisAPI.get('/owner/vaults/').then(res => {
      const vaultsList = Array.isArray(res) ? res : (res && res.results ? res.results : []);
      ownerVaults = vaultsList;

      const assignSelect = document.getElementById('trusteeVaultAssign');
      if (assignSelect) {
        if (vaultsList.length === 0) {
          assignSelect.innerHTML = '<option value="" disabled selected>No vaults found (Create a vault first)</option>';
        } else {
          assignSelect.innerHTML = vaultsList.map(v => `<option value="${v.id}">${escapeHtml(v.name)}</option>`).join('');
        }
      }

      // Populate filter dropdown
      const filterSelect = document.getElementById('vaultFilterSelect');
      if (filterSelect && vaultsList.length > 0) {
        const currentVal = filterSelect.value;
        filterSelect.innerHTML = `
          <option value="all">All Vaults</option>
          ${vaultsList.map(v => `<option value="${escapeHtml(v.name)}">${escapeHtml(v.name)}</option>`).join('')}
        `;
        if (currentVal) filterSelect.value = currentVal;
      }
    }).catch(err => {
      console.warn('Could not load owner vaults:', err);
    });

    // 2. Fetch Owner Trustees
    window.AegisAPI.get('/owner/trustees/').then(res => {
      const data = Array.isArray(res) ? res : (res && res.results ? res.results : []);
      liveTrustees = data.map(normalizeTrustee);
      renderTrusteesTable();
    }).catch(err => {
      console.error('Failed to load trustees:', err);
      liveTrustees = [];
      renderTrusteesTable();
    });
  }

  // =========================================================================
  // INITIALIZATION & EVENT LISTENERS
  // =========================================================================

  document.addEventListener('DOMContentLoaded', function () {
    // Check URL search parameters
    const urlParams = new URLSearchParams(window.location.search);
    const initialStatus = urlParams.get('status') || urlParams.get('filter');

    const statusSelect = document.getElementById('statusFilterSelect');
    const vaultSelect = document.getElementById('vaultFilterSelect');
    const relSelect = document.getElementById('relationshipFilterSelect');
    const searchInput = document.getElementById('trusteeSearchInput');

    if (initialStatus && statusSelect) {
      const matchOpt = Array.from(statusSelect.options).find(o => o.value.toLowerCase() === initialStatus.toLowerCase());
      if (matchOpt) statusSelect.value = matchOpt.value;
    }

    // Load Live Data
    loadTrusteesData();

    // Live search & filters
    searchInput?.addEventListener('input', renderTrusteesTable);
    statusSelect?.addEventListener('change', renderTrusteesTable);
    vaultSelect?.addEventListener('change', renderTrusteesTable);
    relSelect?.addEventListener('change', renderTrusteesTable);

    // 5 KPI Metric Cards Interactive Filtering
    const metricCards = document.querySelectorAll('.metrics-row .metric-card');
    metricCards.forEach((card, index) => {
      card.style.cursor = 'pointer';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.title = `Click to filter trustees`;

      card.addEventListener('click', () => {
        if (index === 0) {
          // Total Trustees -> Reset
          resetAllFilters();
          window.AegisOwner?.showToast('Showing all trustees');
        } else if (index === 1) {
          // Verified Trustees
          if (statusSelect) statusSelect.value = 'verified';
          renderTrusteesTable();
          window.AegisOwner?.showToast('Filtered: Verified Trustees');
        } else if (index === 2) {
          // Pending Verification
          if (statusSelect) statusSelect.value = 'pending';
          renderTrusteesTable();
          window.AegisOwner?.showToast('Filtered: Pending Verification');
        } else if (index === 3) {
          // Invitation Sent
          if (statusSelect) statusSelect.value = 'invited';
          renderTrusteesTable();
          window.AegisOwner?.showToast('Filtered: Invited Trustees');
        } else if (index === 4) {
          // Removed Trustees
          if (statusSelect) statusSelect.value = 'removed';
          renderTrusteesTable();
          window.AegisOwner?.showToast('Filtered: Removed Trustees');
        }
      });
    });

    // Donut Legend Interactive Filter
    document.querySelectorAll('.donut-legend-item').forEach(item => {
      item.addEventListener('click', () => {
        const filterVal = item.getAttribute('data-filter') || '';
        document.querySelectorAll('.donut-legend-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');

        if (statusSelect && filterVal) {
          statusSelect.value = filterVal;
          renderTrusteesTable();
          window.AegisOwner?.showToast(`Filtered trustees: ${filterVal.toUpperCase()}`);
        }
      });
    });

    // More Filters button toggle
    let moreFiltersState = false;
    const btnMoreFilters = document.getElementById('btnMoreFilters');
    if (btnMoreFilters) {
      btnMoreFilters.addEventListener('click', function () {
        moreFiltersState = !moreFiltersState;
        if (moreFiltersState) {
          btnMoreFilters.style.borderColor = 'var(--brand-orange)';
          btnMoreFilters.style.color = 'var(--brand-orange)';
          btnMoreFilters.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"/></svg> Active Only`;
          if (statusSelect) statusSelect.value = 'verified';
          renderTrusteesTable();
          window.AegisOwner?.showToast('Advanced Filter: Only Fully Verified Cryptographic Trustees');
        } else {
          btnMoreFilters.style.borderColor = '';
          btnMoreFilters.style.color = '';
          btnMoreFilters.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> More Filters`;
          if (statusSelect) statusSelect.value = 'all';
          renderTrusteesTable();
          window.AegisOwner?.showToast('Filters reset');
        }
      });
    }

    // Open Add Trustee Modal
    const handleOpenAddModal = function () {
      openModal('addTrusteeModal');
    };

    document.getElementById('btnOpenAddTrustee')?.addEventListener('click', handleOpenAddModal);
    document.getElementById('btnQuickAddTrusteeSide')?.addEventListener('click', handleOpenAddModal);
    document.getElementById('btnQuickSendInvite')?.addEventListener('click', handleOpenAddModal);

    // Form: Add Trustee Submit
    document.getElementById('formAddTrustee')?.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('trusteeName').value.trim();
      const email = document.getElementById('trusteeEmail').value.trim();
      const relationship = document.getElementById('trusteeRelationship').value;
      const vault_id = document.getElementById('trusteeVaultAssign').value;
      const note = document.getElementById('trusteeNote')?.value.trim() || '';

      if (!name || !email) {
        window.AegisOwner?.showToast('Please provide both name and email.', 'error');
        return;
      }

      if (!vault_id) {
        window.AegisOwner?.showToast('Please select a vault to assign.', 'error');
        return;
      }

      const submitBtn = this.querySelector('button[type="submit"]');
      const origText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending Invitation...';
      }

      if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
        window.AegisAPI.post('/owner/trustees/', {
          name, email, relationship, vault_id, note
        }).then(res => {
          const newTrustee = normalizeTrustee(res);
          // If vault name not yet resolved in list, find from ownerVaults
          if (newTrustee.vaults.length === 0) {
            const vObj = ownerVaults.find(v => String(v.id) === String(vault_id));
            if (vObj) newTrustee.vaults = [vObj.name];
          }

          // Unshift or replace if existing
          const existingIdx = liveTrustees.findIndex(x => x.email.toLowerCase() === email.toLowerCase());
          if (existingIdx >= 0) {
            liveTrustees[existingIdx] = newTrustee;
          } else {
            liveTrustees.unshift(newTrustee);
          }

          renderTrusteesTable();
          closeModal('addTrusteeModal');
          this.reset();
          if (res && res.email_sent) {
            window.AegisOwner?.showToast(`Invitation email sent to ${email}!`, 'success');
          } else {
            window.AegisOwner?.showToast(`Trustee added! Add your passkey to backend/.env for live email delivery.`, 'info');
          }
        }).catch(err => {
          window.AegisOwner?.showToast(`Failed to invite trustee: ${err.message || 'Error'}`, 'error');
        }).finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = origText;
          }
        });
      } else {
        const vObj = ownerVaults.find(v => String(v.id) === String(vault_id));
        const newTrustee = normalizeTrustee({
          id: 'trustee-' + Date.now(),
          name,
          email,
          relationship,
          verification_status: 'Not Started',
          status: 'Invited',
          vaults: [vObj ? vObj.name : 'Personal Vault'],
          vaults_count: 1,
          date_added: new Date().toISOString()
        });

        liveTrustees.unshift(newTrustee);
        renderTrusteesTable();
        closeModal('addTrusteeModal');
        this.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = origText;
        }
        window.AegisOwner?.showToast(`Invitation successfully sent to ${name}!`, 'success');
      }
    });

    // Form: Edit Trustee Submit
    document.getElementById('formEditTrustee')?.addEventListener('submit', function (e) {
      e.preventDefault();

      const id = document.getElementById('editTrusteeId').value;
      const t = liveTrustees.find(x => x.id === id);
      if (!t) return;

      const newName = document.getElementById('editTrusteeName').value.trim();
      const newEmail = document.getElementById('editTrusteeEmail').value.trim();
      const newRel = document.getElementById('editTrusteeRel').value;

      const submitBtn = this.querySelector('button[type="submit"]');
      const origText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
      }

      if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
        window.AegisAPI.put(`/owner/trustees/${id}/`, {
          name: newName,
          email: newEmail,
          relationship: newRel
        }).then(res => {
          Object.assign(t, normalizeTrustee(res));
          renderTrusteesTable();
          closeModal('editTrusteeModal');
          window.AegisOwner?.showToast(`Updated permissions for ${t.name}!`, 'success');
        }).catch(err => {
          window.AegisOwner?.showToast(`Failed to update trustee: ${err.message || 'Error'}`, 'error');
        }).finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = origText;
          }
        });
      } else {
        t.name = newName;
        t.email = newEmail;
        t.relationship = newRel;
        t.relClass = newRel.toLowerCase().replace(/\s+/g, '-');
        renderTrusteesTable();
        closeModal('editTrusteeModal');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = origText;
        }
        window.AegisOwner?.showToast(`Updated permissions for ${t.name}!`, 'success');
      }
    });
  });

})();
