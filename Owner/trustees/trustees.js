/**
 * AegisVault Owner Panel — Trustees Logic
 * Module 03: Trustee Management, Filtering, Dynamic Table, Donut Chart & Modals
 */

(function () {
  'use strict';

  // =========================================================================
  // MOCK DATA STORAGE (Simulating Backend API Responses)
  // TODO: Replace with fetch('/api/v1/owner/trustees/...') upon backend connection
  // =========================================================================

  let mockTrustees = [
    {
      id: 'trustee-1',
      name: 'Amit Kumar',
      email: 'amit.kumar@email.com',
      phone: '+1 (555) 234-5678',
      avatarType: 'img',
      avatarSrc: '../assets/images/trustee-avatar-1.png',
      relationship: 'Brother',
      relClass: 'brother',
      relIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      vaults: ['Personal Vault', 'Family Vault', 'Business Vault'],
      vaultsCount: 3,
      verifStatus: 'Verified',
      verifClass: 'verified',
      status: 'Active',
      statusClass: 'active',
      dateAdded: '12 Jan 2025',
      sharesHeld: '3 encrypted shards'
    },
    {
      id: 'trustee-2',
      name: 'Sneha Mehta',
      email: 'sneha.mehta@email.com',
      phone: '+1 (555) 876-5432',
      avatarType: 'img',
      avatarSrc: '../assets/images/trustee-avatar-2.png',
      relationship: 'Sister',
      relClass: 'sister',
      relIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
      vaults: ['Personal Vault', 'Family Vault'],
      vaultsCount: 2,
      verifStatus: 'Verified',
      verifClass: 'verified',
      status: 'Active',
      statusClass: 'active',
      dateAdded: '18 Jan 2025',
      sharesHeld: '2 encrypted shards'
    },
    {
      id: 'trustee-3',
      name: 'Rahul Kapoor',
      email: 'rahul.kapoor@email.com',
      phone: '+1 (555) 345-6789',
      avatarType: 'initials',
      initials: 'RK',
      initialsBg: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
      relationship: 'Friend',
      relClass: 'friend',
      relIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
      vaults: ['Personal Vault'],
      vaultsCount: 1,
      verifStatus: 'Pending',
      verifClass: 'pending',
      status: 'Active',
      statusClass: 'active',
      dateAdded: '02 Feb 2025',
      sharesHeld: '1 encrypted shard (Awaiting verification)'
    },
    {
      id: 'trustee-4',
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+1 (555) 987-6543',
      avatarType: 'img',
      avatarSrc: '../assets/images/trustee-avatar-4.png',
      relationship: 'Spouse',
      relClass: 'spouse',
      relIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      vaults: ['Personal Vault', 'Family Vault', 'Health Vault'],
      vaultsCount: 3,
      verifStatus: 'Verified',
      verifClass: 'verified',
      status: 'Active',
      statusClass: 'active',
      dateAdded: '10 Jan 2025',
      sharesHeld: '3 encrypted shards'
    },
    {
      id: 'trustee-5',
      name: 'Vikram Shah',
      email: 'vikram.shah@email.com',
      phone: '+1 (555) 456-7890',
      avatarType: 'initials',
      initials: 'VS',
      initialsBg: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
      relationship: 'Colleague',
      relClass: 'colleague',
      relIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
      vaults: ['Business Vault'],
      vaultsCount: 1,
      verifStatus: 'Not Started',
      verifClass: 'not-started',
      status: 'Invited',
      statusClass: 'invited',
      dateAdded: '15 Feb 2025',
      sharesHeld: 'Pending invitation acceptance'
    },
    {
      id: 'trustee-6',
      name: 'Anita Desai',
      email: 'anita.desai@email.com',
      phone: '+1 (555) 654-3210',
      avatarType: 'img',
      avatarSrc: '../assets/images/trustee-avatar-6.png',
      relationship: 'Cousin',
      relClass: 'cousin',
      relIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
      vaults: ['Personal Vault', 'Legacy Vault'],
      vaultsCount: 2,
      verifStatus: 'Verified',
      verifClass: 'verified',
      status: 'Active',
      statusClass: 'active',
      dateAdded: '20 Jan 2025',
      sharesHeld: '2 encrypted shards'
    },
    {
      id: 'trustee-7',
      name: 'Neeraj Singh',
      email: 'neeraj.singh@email.com',
      phone: '+1 (555) 567-8901',
      avatarType: 'initials',
      initials: 'NS',
      initialsBg: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      relationship: 'Friend',
      relClass: 'friend',
      relIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
      vaults: ['Personal Vault'],
      vaultsCount: 1,
      verifStatus: 'Verified',
      verifClass: 'verified',
      status: 'Active',
      statusClass: 'active',
      dateAdded: '25 Jan 2025',
      sharesHeld: '1 encrypted shard'
    },
    {
      id: 'trustee-8',
      name: 'Karan Malhotra',
      email: 'karan.malhotra@email.com',
      phone: '+1 (555) 789-0123',
      avatarType: 'img',
      avatarSrc: '../assets/images/trustee-avatar-8.png',
      relationship: 'Legal Advisor',
      relClass: 'legal-advisor',
      relIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18"/><path d="m4 8 8-5 8 5"/><path d="m4 16 8 5 8-5"/><path d="m1 11 3-3 3 3"/><path d="m17 11 3-3 3 3"/></svg>',
      vaults: ['Business Vault', 'Legacy Vault'],
      vaultsCount: 2,
      verifStatus: 'Pending',
      verifClass: 'pending',
      status: 'Active',
      statusClass: 'active',
      dateAdded: '05 Feb 2025',
      sharesHeld: 'Legal quorum key pending notarization'
    }
  ];

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
    const filtered = mockTrustees.filter(t => {
      const matchSearch = !searchVal ||
        t.name.toLowerCase().includes(searchVal) ||
        t.email.toLowerCase().includes(searchVal) ||
        t.relationship.toLowerCase().includes(searchVal);

      let matchStatus = (statusVal === 'all');
      if (!matchStatus) {
        if (statusVal === 'verified') matchStatus = t.verifStatus.toLowerCase() === 'verified';
        else if (statusVal === 'pending') matchStatus = t.verifStatus.toLowerCase() === 'pending';
        else if (statusVal === 'not started') matchStatus = t.verifStatus.toLowerCase() === 'not started';
        else if (statusVal === 'invited') matchStatus = t.status.toLowerCase() === 'invited';
      }

      let matchVault = (vaultVal === 'all');
      if (!matchVault) {
        matchVault = t.vaults.some(v => v.toLowerCase().includes(vaultVal));
      }

      let matchRel = (relVal === 'all') || (t.relationship.toLowerCase() === relVal);

      return matchSearch && matchStatus && matchVault && matchRel;
    });

    // Update Counts & Overview
    updateStatsAndDonut();

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
            <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">No trustees found</div>
            <div>Try adjusting your search criteria or clearing active filters.</div>
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(t => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-id', t.id);

      // Avatar markup
      let avatarHtml = '';
      if (t.avatarType === 'img') {
        avatarHtml = `<div class="trustee-avatar-img" style="background-image: url('${t.avatarSrc}');"></div>`;
      } else {
        avatarHtml = `<div class="trustee-avatar-initials" style="background: ${t.initialsBg};">${t.initials}</div>`;
      }

      // Verification pill icon
      let verifIcon = '';
      if (t.verifStatus === 'Verified') verifIcon = '✓';
      else if (t.verifStatus === 'Pending') verifIcon = '⏱';
      else verifIcon = '●';

      // Status pill icon
      let statusIcon = '';
      if (t.status === 'Active') statusIcon = '✓';
      else if (t.status === 'Invited') statusIcon = '✉';
      else statusIcon = '●';

      tr.innerHTML = `
        <!-- Avatar -->
        <td class="trustee-avatar-cell">
          ${avatarHtml}
        </td>

        <!-- Name & Email -->
        <td>
          <div class="trustee-name-texts">
            <span class="trustee-name">${t.name}</span>
            <span class="trustee-email" title="${t.email}">${t.email}</span>
          </div>
        </td>

        <!-- Relationship -->
        <td>
          <span class="rel-badge ${t.relClass}">
            ${t.relIcon}
            ${t.relationship}
          </span>
        </td>

        <!-- Vaults Assigned -->
        <td>
          <span class="vaults-count-badge">
            ${t.vaultsCount} ${t.vaultsCount === 1 ? 'Vault' : 'Vaults'}
          </span>
        </td>

        <!-- Verification Status -->
        <td>
          <span class="status-pill ${t.verifClass}">
            <span>${verifIcon}</span>
            <span>${t.verifStatus}</span>
          </span>
        </td>

        <!-- Status -->
        <td>
          <span class="status-pill ${t.statusClass}">
            <span>${statusIcon}</span>
            <span>${t.status}</span>
          </span>
        </td>

        <!-- Actions -->
        <td>
          <div class="trustee-actions-cell">
            <button class="btn-icon-action" data-action="view" data-id="${t.id}" title="View Details" aria-label="View Details for ${t.name}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="btn-icon-action edit-action" data-action="edit" data-id="${t.id}" title="Edit Permissions" aria-label="Edit Permissions for ${t.name}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-icon-action more-dots" data-action="context" data-id="${t.id}" title="More options" aria-label="More options for ${t.name}">
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
    const total = mockTrustees.length;
    const verified = mockTrustees.filter(t => t.verifStatus === 'Verified').length;
    const pending = mockTrustees.filter(t => t.verifStatus === 'Pending').length;
    const invited = mockTrustees.filter(t => t.status === 'Invited').length;
    const removed = 0;

    // Update KPI card DOM
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

    // Update Donut Center Number
    const elCenterNum = document.querySelector('.donut-center-num');
    if (elCenterNum) elCenterNum.textContent = total;

    // Update Donut Segments (circumference for r=46 is 2 * PI * 46 = 289.02)
    const C = 289.02;
    const segVerif = document.querySelector('.donut-seg.verified');
    const segPend = document.querySelector('.donut-seg.pending');
    const segInv = document.querySelector('.donut-seg.invited');

    if (total > 0 && segVerif && segPend && segInv) {
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

    // Update Verification Progress widget
    const percent = total > 0 ? Math.round((verified / total) * 100) : 0;
    const elVerifTitle = document.querySelector('.verification-title');
    const elVerifVal = document.querySelector('.verification-value');
    const elVerifBar = document.querySelector('.verification-bar-fill');

    if (elVerifTitle) elVerifTitle.textContent = `${verified} of ${total} trustees verified`;
    if (elVerifVal) elVerifVal.textContent = `${percent}%`;
    if (elVerifBar) elVerifBar.style.width = `${percent}%`;
  }

  // =========================================================================
  // ROW ACTIONS (View Details, Edit, Context Menu)
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

    // 3. More Dots Context Menu
    document.querySelectorAll('.btn-icon-action[data-action="context"]').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const id = this.getAttribute('data-id');
        const t = mockTrustees.find(x => x.id === id);
        if (!t) return;

        openTrusteeContextMenu(t, this);
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
    menu.style.minWidth = '200px';
    menu.style.boxShadow = 'var(--shadow-dropdown)';

    menu.innerHTML = `
      <div class="dropdown-header">${t.name}</div>
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
      <button class="dropdown-item" data-action="revoke" style="width:100%; border:none; background:none; text-align:left; cursor:pointer; color:var(--status-danger);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        <span>Revoke Trustee</span>
      </button>
    `;

    const rect = anchorEl.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.left = `${Math.min(window.innerWidth - 220, rect.left - 150)}px`;

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
      if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
        window.AegisAPI.post(`/owner/trustees/${t.id}/remind/`).then(() => {
          window.AegisOwner?.showToast(`Verification reminder dispatched to ${t.email}!`, 'success');
        }).catch(err => {
          window.AegisOwner?.showToast(`Failed to send reminder: ${err.message}`, 'error');
        });
      } else {
        window.AegisOwner?.showToast(`Verification reminder dispatched to ${t.email}!`, 'success');
      }
    });

    menu.querySelector('[data-action="revoke"]').addEventListener('click', () => {
      closeTrusteeContextMenu();
      if (confirm(`Revoke trustee status for "${t.name}"? They will lose decryption authorization.`)) {
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
    });

    document.body.appendChild(menu);
    activeTrusteeMenu = menu;
  }

  // =========================================================================
  // MODAL HANDLERS
  // =========================================================================

  function openTrusteeDetailsModal(id) {
    const t = mockTrustees.find(x => x.id === id);
    if (!t) return;

    const modal = document.getElementById('trusteeDetailsModal');
    const title = document.getElementById('trusteeDetailsModalTitle');
    const body = document.getElementById('trusteeDetailsModalBody');
    if (!modal || !body) return;

    if (title) title.textContent = `${t.name} — Trustee Profile`;

    body.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle);">
        ${t.avatarType === 'img' ? `
          <div style="width: 52px; height: 52px; border-radius: 50%; background-image: url('${t.avatarSrc}'); background-size: cover; background-position: center; border: 2px solid var(--border-subtle);"></div>
        ` : `
          <div style="width: 52px; height: 52px; border-radius: 50%; background: ${t.initialsBg}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; color: #fff; border: 2px solid var(--border-subtle);">${t.initials}</div>
        `}
        <div>
          <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">${t.name}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">${t.email} &bull; ${t.phone}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Relationship</span>
          <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary); margin-top: 0.2rem;">${t.relationship}</div>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Verification Status</span>
          <div style="margin-top: 0.2rem;">
            <span class="status-pill ${t.verifClass}">${t.verifStatus}</span>
          </div>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Vault Access</span>
          <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary); margin-top: 0.2rem;">${t.vaults.join(', ')}</div>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Cryptographic Key Held</span>
          <div style="font-weight: 600; font-size: 0.9rem; color: var(--status-info); margin-top: 0.2rem;">${t.sharesHeld}</div>
        </div>
      </div>

      <div style="background-color: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.85rem; font-size: 0.82rem; color: var(--text-secondary);">
        <strong style="color: var(--text-primary);">Audit Notice:</strong> Trustee was added on ${t.dateAdded}. In the event of a release trigger, this trustee is authorized to decrypt allocated vault shares according to your multi-party consensus policy.
      </div>
    `;

    modal.classList.add('active');
  }

  function openEditTrusteeModal(id) {
    const t = mockTrustees.find(x => x.id === id);
    if (!t) return;

    const modal = document.getElementById('editTrusteeModal');
    if (!modal) return;

    document.getElementById('editTrusteeId').value = t.id;
    document.getElementById('editTrusteeName').value = t.name;
    document.getElementById('editTrusteeEmail').value = t.email;
    document.getElementById('editTrusteeRel').value = t.relationship;

    modal.classList.add('active');
  }

  // =========================================================================
  // INITIALIZATION & EVENT LISTENERS
  // =========================================================================

  document.addEventListener('DOMContentLoaded', function () {
    // Check URL search parameters (e.g. ?status=verified or ?status=pending)
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

    if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
      window.AegisAPI.get('/owner/vaults/').then(vs => {
        const sel = document.getElementById('trusteeVaultAssign');
        if (sel) sel.innerHTML = vs.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
      }).catch(e=>{});

      window.AegisAPI.get('/owner/trustees/').then(data => {
        mockTrustees = data.map(t => ({
          id: t.id,
          name: t.name,
          email: t.email,
          phone: t.phone || '+1 (555) 000-0000',
          avatarType: 'initials',
          initials: (t.name.split(' ').length > 1 ? t.name.split(' ')[0][0] + t.name.split(' ')[1][0] : t.name.substring(0, 2)).toUpperCase(),
          initialsBg: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
          relationship: t.relationship,
          relClass: (t.relationship || '').toLowerCase().replace(' ', '-'),
          relIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
          vaults: t.vaults || [],
          vaultsCount: t.vaults_count || 0,
          verifStatus: t.verification_status,
          verifClass: (t.verification_status || '').toLowerCase().replace(' ', '-'),
          status: t.status,
          statusClass: (t.status || '').toLowerCase(),
          dateAdded: new Date(t.date_added).toLocaleDateString(),
          sharesHeld: t.shares_held || '0 shares'
        }));
        renderTrusteesTable();
      }).catch(err => {
        console.error('Failed to load trustees', err);
        renderTrusteesTable();
      });
    } else {
      renderTrusteesTable();
    }

    // Search & Filters live listener
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
          if (statusSelect) statusSelect.value = 'all';
          if (vaultSelect) vaultSelect.value = 'all';
          if (relSelect) relSelect.value = 'all';
          if (searchInput) searchInput.value = '';
          renderTrusteesTable();
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
          window.location.href = '../invitations/invitations.html';
        }
      });
    });

    // Donut Legend Interactive Filter
    document.querySelectorAll('.donut-legend-item').forEach(item => {
      item.style.cursor = 'pointer';
      item.title = 'Click to filter by status';
      item.addEventListener('click', () => {
        const text = item.textContent.toLowerCase();
        if (text.includes('verified') && statusSelect) {
          statusSelect.value = 'verified';
        } else if (text.includes('pending') && statusSelect) {
          statusSelect.value = 'pending';
        } else if (text.includes('invited') && statusSelect) {
          statusSelect.value = 'invited';
        }
        renderTrusteesTable();
        window.AegisOwner?.showToast(`Filtered trustees: ${item.querySelector('span')?.textContent || 'selected status'}`);
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
    const openAddModal = function () {
      const modal = document.getElementById('addTrusteeModal');
      if (modal) modal.classList.add('active');
    };

    document.getElementById('btnOpenAddTrustee')?.addEventListener('click', openAddModal);
    document.getElementById('btnQuickAddTrusteeSide')?.addEventListener('click', openAddModal);
    document.getElementById('btnQuickSendInvite')?.addEventListener('click', openAddModal);

    // Form: Add Trustee Submit
    document.getElementById('formAddTrustee')?.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('trusteeName').value.trim();
      const email = document.getElementById('trusteeEmail').value.trim();
      const relationship = document.getElementById('trusteeRelationship').value;
      const vault_id = document.getElementById('trusteeVaultAssign').value;
      
      const vaultSelect = document.getElementById('trusteeVaultAssign');
      const vaultName = vaultSelect.options ? vaultSelect.options[vaultSelect.selectedIndex]?.text : vault_id;

      if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
        window.AegisAPI.post('/owner/trustees/', {
          name, email, relationship, vault_id
        }).then(res => {
          const t = res.trustee || res; // depending on backend format
          const parts = name.split(' ');
          const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
          const newTrustee = {
            id: t.id || ('trustee-' + Date.now()),
            name: name,
            email: email,
            phone: '+1 (555) 000-0000',
            avatarType: 'initials',
            initials: initials,
            initialsBg: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
            relationship: relationship,
            relClass: relationship.toLowerCase().replace(' ', '-'),
            relIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
            vaults: [vaultName],
            vaultsCount: 1,
            verifStatus: 'Not Started',
            verifClass: 'not-started',
            status: 'Invited',
            statusClass: 'invited',
            dateAdded: 'Today',
            sharesHeld: 'Invitation sent'
          };
          mockTrustees.unshift(newTrustee);
          renderTrusteesTable();
          document.getElementById('addTrusteeModal')?.classList.remove('active');
          this.reset();
          window.AegisOwner?.showToast(`Invitation successfully sent to ${name}!`);
        }).catch(err => {
          window.AegisOwner?.showToast(`Failed to invite trustee: ${err.message}`, 'error');
        });
      } else {
        const parts = name.split(' ');
        const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
        const newTrustee = {
          id: 'trustee-' + Date.now(), name, email, phone: '+1 (555) 000-0000',
          avatarType: 'initials', initials, initialsBg: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
          relationship, relClass: relationship.toLowerCase().replace(' ', '-'),
          relIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
          vaults: [vaultName], vaultsCount: 1, verifStatus: 'Pending', verifClass: 'pending',
          status: 'Invited', statusClass: 'invited', dateAdded: 'Today', sharesHeld: 'Invitation sent'
        };
        mockTrustees.unshift(newTrustee);
        renderTrusteesTable();
        document.getElementById('addTrusteeModal')?.classList.remove('active');
        this.reset();
        window.AegisOwner?.showToast(`Invitation successfully sent to ${name}!`);
      }
    });

    // Form: Edit Trustee Submit
    document.getElementById('formEditTrustee')?.addEventListener('submit', function (e) {
      e.preventDefault();

      const id = document.getElementById('editTrusteeId').value;
      const t = mockTrustees.find(x => x.id === id);
      if (!t) return;

      const newName = document.getElementById('editTrusteeName').value.trim();
      const newEmail = document.getElementById('editTrusteeEmail').value.trim();
      const newRel = document.getElementById('editTrusteeRel').value;

      if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
        window.AegisAPI.put(`/owner/trustees/${id}/`, {
          name: newName,
          email: newEmail,
          relationship: newRel
        }).then(() => {
          t.name = newName;
          t.email = newEmail;
          t.relationship = newRel;
          t.relClass = newRel.toLowerCase().replace(' ', '-');
          renderTrusteesTable();
          document.getElementById('editTrusteeModal')?.classList.remove('active');
          window.AegisOwner?.showToast(`Updated permissions for ${t.name}!`);
        }).catch(err => {
          window.AegisOwner?.showToast(`Failed to update trustee: ${err.message}`, 'error');
        });
      } else {
        t.name = newName;
        t.email = newEmail;
        t.relationship = newRel;
        t.relClass = newRel.toLowerCase().replace(' ', '-');
        renderTrusteesTable();
        document.getElementById('editTrusteeModal')?.classList.remove('active');
        window.AegisOwner?.showToast(`Updated permissions for ${t.name}!`);
      }
    });
  });

})();
