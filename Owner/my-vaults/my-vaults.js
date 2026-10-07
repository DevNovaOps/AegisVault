/**
 * AegisVault Owner Panel — My Vaults Logic
 * Module 02: Vault Inventory, Multi-Criteria Filtering, Dynamic Table & Modals
 */

(function () {
  'use strict';

  // =========================================================================
  // MOCK DATA STORAGE (Simulating Backend API Responses)
  // TODO: Replace with fetch('/api/v1/owner/vaults/...') upon backend connection
  // =========================================================================

  let mockVaults = [
    {
      id: 'vault-1',
      name: 'Personal Vault',
      desc: 'Personal documents, memories, and important files.',
      type: 'Personal',
      typeBadgeClass: 'personal',
      typeIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      status: 'Active',
      statusClass: 'status-active',
      trustees: 3,
      sharesRatio: '3 / 3',
      sharesPercent: 100,
      date: '12 Sep 2025',
      time: '10:24 AM',
      thumbImg: '../assets/images/vault-thumb-1.png',
      releaseCondition: '60 days inactivity + 3/3 trustee consensus',
      storageUsed: '1.2 GB'
    },
    {
      id: 'vault-2',
      name: 'Family Vault',
      desc: 'Family documents, photos, and legacy information.',
      type: 'Family',
      typeBadgeClass: 'family',
      typeIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      status: 'Active',
      statusClass: 'status-active',
      trustees: 2,
      sharesRatio: '2 / 2',
      sharesPercent: 100,
      date: '11 Sep 2025',
      time: '04:18 PM',
      thumbImg: '../assets/images/vault-thumb-2.png',
      releaseCondition: '90 days inactivity + 2/2 trustee consensus',
      storageUsed: '850 MB'
    },
    {
      id: 'vault-3',
      name: 'Business Vault',
      desc: 'Business records and professional information.',
      type: 'Business',
      typeBadgeClass: 'business',
      typeIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
      status: 'Active',
      statusClass: 'status-active',
      trustees: 2,
      sharesRatio: '2 / 2',
      sharesPercent: 100,
      date: '10 Sep 2025',
      time: '09:12 AM',
      thumbImg: '../assets/images/vault-thumb-3.png',
      releaseCondition: '30 days inactivity + corporate attorney approval',
      storageUsed: '620 MB'
    },
    {
      id: 'vault-4',
      name: 'Legacy Vault',
      desc: 'Long-term legacy and inheritance information.',
      type: 'Legacy',
      typeBadgeClass: 'legacy',
      typeIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
      status: 'Draft',
      statusClass: 'status-draft',
      trustees: 0,
      sharesRatio: '0 / 2',
      sharesPercent: 0,
      date: '08 Sep 2025',
      time: '02:36 PM',
      thumbImg: '../assets/images/vault-thumb-4.png',
      releaseCondition: 'Draft state — Release parameters not yet activated',
      storageUsed: '120 MB'
    },
    {
      id: 'vault-5',
      name: 'Health Vault',
      desc: 'Medical records and health information.',
      type: 'Health',
      typeBadgeClass: 'health',
      typeIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
      status: 'Active',
      statusClass: 'status-active',
      trustees: 1,
      sharesRatio: '1 / 1',
      sharesPercent: 100,
      date: '05 Sep 2025',
      time: '11:09 AM',
      thumbImg: '../assets/images/vault-thumb-5.png',
      releaseCondition: 'Emergency medical proxy immediate authorization',
      storageUsed: '410 MB'
    },
    {
      id: 'vault-6',
      name: 'Travel Vault',
      desc: 'Travel documents, bookings, and important information.',
      type: 'Personal',
      typeBadgeClass: 'personal',
      typeIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      status: 'Locked',
      statusClass: 'status-locked',
      trustees: 0,
      sharesRatio: '0 / 2',
      sharesPercent: 0,
      date: '22 Aug 2025',
      time: '03:56 PM',
      thumbImg: '../assets/images/vault-thumb-6.png',
      releaseCondition: 'Vault locked manually. Requires master key to unlock.',
      storageUsed: '50 MB'
    }
  ];

  // =========================================================================
  // RENDER & FILTER CONTROLLER
  // =========================================================================

  function renderVaultsTable() {
    const tbody = document.getElementById('vaultsTableTbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const searchVal = (document.getElementById('vaultSearchInput')?.value || '').toLowerCase().trim();
    const statusVal = document.getElementById('statusFilterSelect')?.value || 'all';
    const typeVal = document.getElementById('typeFilterSelect')?.value || 'all';
    const sortVal = document.getElementById('sortFilterSelect')?.value || 'updated';

    // Filter
    let filtered = mockVaults.filter(v => {
      const matchSearch = !searchVal ||
        v.name.toLowerCase().includes(searchVal) ||
        v.desc.toLowerCase().includes(searchVal) ||
        v.type.toLowerCase().includes(searchVal);

      const matchStatus = (statusVal === 'all') || (v.status.toLowerCase() === statusVal.toLowerCase());
      const matchType = (typeVal === 'all') || (v.type.toLowerCase() === typeVal.toLowerCase());

      return matchSearch && matchStatus && matchType;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortVal === 'name') return a.name.localeCompare(b.name);
      if (sortVal === 'trustees') return b.trustees - a.trustees;
      if (sortVal === 'shares') return b.sharesPercent - a.sharesPercent;
      return 0; // Default order
    });

    // Update Counts & Badges
    updateStatCounts();

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
            <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">No vaults found</div>
            <div>Try adjusting your search criteria or clearing active filters.</div>
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(v => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-id', v.id);

      const isDraft = v.status === 'Draft';

      tr.innerHTML = `
        <!-- Vault Name & Thumb -->
        <td>
          <div class="vault-info-cell">
            <div class="vault-thumb" style="background-image: url('${v.thumbImg}');"></div>
            <div class="vault-texts">
              <span class="vault-name">${v.name}</span>
              <span class="vault-desc" title="${v.desc}">${v.desc}</span>
            </div>
          </div>
        </td>

        <!-- Type -->
        <td>
          <span class="type-badge ${v.typeBadgeClass}">
            ${v.typeIcon}
            ${v.type}
          </span>
        </td>

        <!-- Status -->
        <td>
          <span class="vault-status-pill ${v.statusClass}">
            <span class="status-indicator-dot"></span>
            ${v.status}
          </span>
        </td>

        <!-- Trustees Count -->
        <td style="font-weight: 600; color: var(--text-primary); text-align: left;">${v.trustees}</td>

        <!-- Shares Progress -->
        <td>
          <div class="shares-progress-wrap">
            <span class="shares-ratio-text">${v.sharesRatio}</span>
            <div class="shares-progress-bar">
              <div class="shares-progress-fill ${v.sharesPercent === 0 ? 'empty' : ''}" style="width: ${v.sharesPercent}%;"></div>
            </div>
          </div>
        </td>

        <!-- Last Updated -->
        <td style="white-space: nowrap;">
          <div style="font-weight: 500; font-size: 0.82rem; color: var(--text-primary);">${v.date}</div>
          <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.15rem;">${v.time}</div>
        </td>

        <!-- Actions -->
        <td>
          <div class="table-actions-cell">
            <button class="btn-table-action ${isDraft ? 'edit-action' : ''}" data-action="${isDraft ? 'edit' : 'view'}" data-id="${v.id}">
              ${isDraft ? `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit
              ` : `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                View
              `}
            </button>
            <button class="btn-more-dots" data-action="context" data-id="${v.id}" title="More options" aria-label="More options for ${v.name}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
          </div>
        </td>
      `;

      tbody.appendChild(tr);
    });

    bindRowActions();
  }

  function updateStatCounts() {
    const total = mockVaults.length;
    const active = mockVaults.filter(v => v.status === 'Active').length;
    const draft = mockVaults.filter(v => v.status === 'Draft').length;
    const locked = mockVaults.filter(v => v.status === 'Locked').length;
    const trustees = mockVaults.reduce((acc, v) => acc + v.trustees, 0);

    const elTotal = document.getElementById('statTotalVaults');
    const elActive = document.getElementById('statActiveVaults');
    const elDraft = document.getElementById('statDraftVaults');
    const elLocked = document.getElementById('statLockedVaults');
    const elTrustees = document.getElementById('statTotalTrustees');

    if (elTotal) elTotal.textContent = total;
    if (elActive) elActive.textContent = active;
    if (elDraft) elDraft.textContent = draft;
    if (elLocked) elLocked.textContent = locked;
    if (elTrustees) elTrustees.textContent = trustees;
  }

  function bindRowActions() {
    document.querySelectorAll('.btn-table-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        const vault = mockVaults.find(v => v.id === id);
        if (!vault) return;

        if (action === 'view') {
          openVaultDetailsModal(vault);
        } else if (action === 'edit') {
          openEditVaultModal(vault);
        }
      });
    });

    document.querySelectorAll('.btn-more-dots').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const vault = mockVaults.find(v => v.id === id);
        if (!vault) return;

        openContextMenu(vault, btn);
      });
    });
  }

  // Floating Context Menu
  let activeContextMenu = null;

  function closeContextMenu() {
    if (activeContextMenu) {
      activeContextMenu.remove();
      activeContextMenu = null;
    }
  }

  document.addEventListener('click', closeContextMenu);

  function openContextMenu(vault, anchorEl) {
    closeContextMenu();

    const menu = document.createElement('div');
    menu.className = 'dropdown-panel';
    menu.style.position = 'fixed';
    menu.style.zIndex = '9999';
    menu.style.minWidth = '180px';
    menu.style.boxShadow = 'var(--shadow-dropdown)';

    const isLocked = vault.status === 'Locked';

    menu.innerHTML = `
      <div class="dropdown-header">${vault.name}</div>
      <button class="dropdown-item" data-action="view" style="width:100%; border:none; background:none; text-align:left; cursor:pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        <span>View Details</span>
      </button>
      <button class="dropdown-item" data-action="edit" style="width:100%; border:none; background:none; text-align:left; cursor:pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        <span>Edit Vault</span>
      </button>
      <button class="dropdown-item" data-action="toggle-lock" style="width:100%; border:none; background:none; text-align:left; cursor:pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>${isLocked ? 'Unlock Vault' : 'Lock Vault'}</span>
      </button>
      <button class="dropdown-item" data-action="release" style="width:100%; border:none; background:none; text-align:left; cursor:pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        <span>Configure Release</span>
      </button>
      <div class="dropdown-divider"></div>
      <button class="dropdown-item" data-action="delete" style="width:100%; border:none; background:none; text-align:left; cursor:pointer; color:var(--status-danger);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        <span>Delete Vault</span>
      </button>
    `;

    const rect = anchorEl.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.left = `${Math.min(window.innerWidth - 200, rect.left - 130)}px`;

    menu.querySelector('[data-action="view"]').addEventListener('click', () => {
      closeContextMenu();
      openVaultDetailsModal(vault);
    });

    menu.querySelector('[data-action="edit"]').addEventListener('click', () => {
      closeContextMenu();
      openEditVaultModal(vault);
    });

    menu.querySelector('[data-action="toggle-lock"]').addEventListener('click', () => {
      closeContextMenu();
      const isLocked = vault.status === 'Locked';
      const action = isLocked ? 'unlock' : 'lock';
      if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
        window.AegisAPI.post(`/owner/vaults/${vault.id}/${action}/`).then(res => {
          vault.status = res.status.charAt(0).toUpperCase() + res.status.slice(1);
          vault.statusClass = 'status-' + res.status.toLowerCase();
          window.AegisOwner.showToast(`Vault "${vault.name}" ${action}ed successfully!`, isLocked ? 'success' : 'warning');
          renderVaultsTable();
        }).catch(err => {
          window.AegisOwner.showToast(`Failed to ${action} vault: ${err.message}`, 'error');
        });
      } else {
        if (isLocked) {
          vault.status = 'Active';
          vault.statusClass = 'status-active';
          window.AegisOwner.showToast(`Vault "${vault.name}" unlocked successfully!`, 'success');
        } else {
          vault.status = 'Locked';
          vault.statusClass = 'status-locked';
          window.AegisOwner.showToast(`Vault "${vault.name}" locked.`, 'warning');
        }
        renderVaultsTable();
      }
    });

    menu.querySelector('[data-action="release"]').addEventListener('click', () => {
      closeContextMenu();
      window.location.href = `../release-management/release-management.html?vault=${encodeURIComponent(vault.name)}`;
    });

    menu.querySelector('[data-action="delete"]').addEventListener('click', () => {
      closeContextMenu();
      if (confirm(`Are you sure you want to delete "${vault.name}"? This action cannot be undone.`)) {
        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
          window.AegisAPI.delete(`/owner/vaults/${vault.id}/`).then(() => {
            mockVaults = mockVaults.filter(v => v.id !== vault.id);
            renderVaultsTable();
            window.AegisOwner.showToast(`Vault "${vault.name}" deleted.`, 'info');
          }).catch(err => {
            window.AegisOwner.showToast(`Failed to delete vault: ${err.message}`, 'error');
          });
        } else {
          mockVaults = mockVaults.filter(v => v.id !== vault.id);
          renderVaultsTable();
          window.AegisOwner.showToast(`Vault "${vault.name}" deleted.`, 'info');
        }
      }
    });

    document.body.appendChild(menu);
    activeContextMenu = menu;
  }

  // =========================================================================
  // MODAL HANDLERS
  // =========================================================================

  function openVaultDetailsModal(vault) {
    const title = document.getElementById('detailsModalTitle');
    const body = document.getElementById('detailsModalBody');
    if (title && body) {
      title.textContent = vault.name;
      body.innerHTML = `
        <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.25rem;">
          <div class="vault-thumb" style="width:52px; height:52px; background-image:url('${vault.thumbImg}'); background-size:cover; border-radius:var(--radius-md);"></div>
          <div>
            <div style="font-weight:700; font-size:1.15rem; color:var(--text-primary);">${vault.name}</div>
            <div style="display:flex; gap:0.5rem; margin-top:0.35rem; align-items:center;">
              <span class="type-badge ${vault.typeBadgeClass}">${vault.type}</span>
              <span class="vault-status-pill ${vault.statusClass}">
                <span class="status-indicator-dot"></span>
                ${vault.status}
              </span>
            </div>
          </div>
        </div>

        <div style="background-color:var(--bg-card-elevated); padding:1.1rem; border-radius:var(--radius-md); border:1px solid var(--border-card); margin-bottom:1.2rem;">
          <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:var(--text-muted); margin-bottom:0.35rem;">Description</div>
          <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.5;">${vault.desc}</p>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.85rem; margin-bottom:1.2rem;">
          <div style="background-color:var(--bg-input); padding:0.85rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Assigned Trustees</div>
            <div style="font-size:1.1rem; font-weight:800; color:var(--text-primary); margin-top:0.25rem;">${vault.trustees} Guardians</div>
          </div>
          <div style="background-color:var(--bg-input); padding:0.85rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Shamir Quorum</div>
            <div style="font-size:1.1rem; font-weight:800; color:var(--status-success); margin-top:0.25rem;">${vault.sharesRatio} Shares Verified</div>
          </div>
        </div>

        <div style="background-color:var(--bg-input); padding:0.85rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle); margin-bottom:1rem;">
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; margin-bottom:0.25rem;">Release Trigger Protocol</div>
          <div style="font-size:0.85rem; color:var(--text-primary);">${vault.releaseCondition}</div>
        </div>
      `;
      window.AegisOwner.openModal('vaultDetailsModal');
    }
  }

  function openEditVaultModal(vault) {
    const form = document.getElementById('formEditVault');
    const idInput = document.getElementById('editVaultId');
    const nameInput = document.getElementById('editVaultName');
    const catSelect = document.getElementById('editVaultCategory');
    const descInput = document.getElementById('editVaultDesc');

    if (idInput && nameInput && catSelect && descInput) {
      idInput.value = vault.id;
      nameInput.value = vault.name;
      catSelect.value = vault.type;
      descInput.value = vault.desc;
      window.AegisOwner.openModal('editVaultModal');
    }
  }

  // =========================================================================
  // DOM EVENT BINDINGS
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    // Check URL parameters for pre-filtering (e.g. ?status=active or ?filter=...)
    const urlParams = new URLSearchParams(window.location.search);
    const initialStatus = urlParams.get('status') || urlParams.get('filter');
    const initialCategory = urlParams.get('category');

    const statusSelect = document.getElementById('statusFilterSelect');
    const typeSelect = document.getElementById('typeFilterSelect');
    const searchInput = document.getElementById('vaultSearchInput');
    const sortSelect = document.getElementById('sortFilterSelect');

    if (initialStatus && statusSelect) {
      const matchOpt = Array.from(statusSelect.options).find(o => o.value.toLowerCase() === initialStatus.toLowerCase());
      if (matchOpt) {
        statusSelect.value = matchOpt.value;
      }
    }
    if (initialCategory && typeSelect) {
      typeSelect.value = initialCategory;
    }

    if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
      window.AegisAPI.get('/owner/vaults/').then(data => {
        const TYPE_ICONS = {
          'Personal': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
          'Family': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
          'Business': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
          'Legacy': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
          'Health': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
        };
        mockVaults = data.map(v => ({
          id: v.id,
          name: v.name,
          desc: v.description || '',
          type: v.vault_type,
          typeBadgeClass: (v.vault_type || '').toLowerCase(),
          typeIcon: TYPE_ICONS[v.vault_type] || TYPE_ICONS['Personal'],
          status: v.status.charAt(0).toUpperCase() + v.status.slice(1),
          statusClass: 'status-' + (v.status || '').toLowerCase(),
          trustees: v.trustees_count || 0,
          sharesRatio: v.shares_ratio || '0 / 0',
          sharesPercent: v.shares_percent || 0,
          date: new Date(v.created_at).toLocaleDateString(),
          time: new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          thumbImg: '../assets/images/vault-thumb-1.png',
          releaseCondition: v.release_condition || 'Not set',
          storageUsed: v.storage_used || '0 MB'
        }));
        renderVaultsTable();
      }).catch(err => {
        console.error('Failed to load vaults', err);
        renderVaultsTable();
      });
    } else {
      renderVaultsTable();
    }

    // Search & Filter Listeners
    [searchInput, statusSelect, typeSelect, sortSelect].forEach(el => {
      if (el) {
        el.addEventListener('input', renderVaultsTable);
        el.addEventListener('change', renderVaultsTable);
      }
    });

    // 5 KPI Metric Cards Interactive Filtering
    const metricCards = document.querySelectorAll('.metrics-row .metric-card');
    metricCards.forEach((card, index) => {
      card.style.cursor = 'pointer';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.title = `Click to filter vaults`;

      card.addEventListener('click', () => {
        if (index === 0) {
          // Total Vaults -> Reset all
          if (statusSelect) statusSelect.value = 'all';
          if (typeSelect) typeSelect.value = 'all';
          if (searchInput) searchInput.value = '';
          renderVaultsTable();
          window.AegisOwner.showToast('Showing all vaults');
        } else if (index === 1) {
          // Active Vaults
          if (statusSelect) statusSelect.value = 'active';
          renderVaultsTable();
          window.AegisOwner.showToast('Filtered: Active Vaults');
        } else if (index === 2) {
          // Draft Vault
          if (statusSelect) statusSelect.value = 'draft';
          renderVaultsTable();
          window.AegisOwner.showToast('Filtered: Draft Vaults');
        } else if (index === 3) {
          // Locked Vault
          if (statusSelect) statusSelect.value = 'locked';
          renderVaultsTable();
          window.AegisOwner.showToast('Filtered: Locked Vaults');
        } else if (index === 4) {
          // Total Trustees -> Navigate to Trustees module
          window.location.href = '../trustees/trustees.html';
        }
      });
    });

    // More Filters Button Toggle
    let moreFiltersState = 0;
    const btnMoreFilters = document.getElementById('btnMoreFilters');
    if (btnMoreFilters) {
      btnMoreFilters.addEventListener('click', () => {
        moreFiltersState = (moreFiltersState + 1) % 3;
        if (moreFiltersState === 1) {
          // Filter 100% quorum verified
          const orig = mockVaults;
          const searchVal = '100';
          btnMoreFilters.style.borderColor = 'var(--brand-orange)';
          btnMoreFilters.style.color = 'var(--brand-orange)';
          btnMoreFilters.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"/></svg> Quorum Verified`;
          if (statusSelect) statusSelect.value = 'active';
          renderVaultsTable();
          window.AegisOwner.showToast('Filter: 100% Quorum Verified Vaults');
        } else if (moreFiltersState === 2) {
          btnMoreFilters.style.borderColor = 'var(--status-warning)';
          btnMoreFilters.style.color = 'var(--status-warning)';
          btnMoreFilters.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg> High Storage`;
          if (sortSelect) sortSelect.value = 'shares';
          renderVaultsTable();
          window.AegisOwner.showToast('Filter: High Storage / Critical Priority');
        } else {
          btnMoreFilters.style.borderColor = '';
          btnMoreFilters.style.color = '';
          btnMoreFilters.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> More Filters`;
          if (statusSelect) statusSelect.value = 'all';
          if (sortSelect) sortSelect.value = 'updated';
          renderVaultsTable();
          window.AegisOwner.showToast('Advanced filters reset');
        }
      });
    }

    // Category Rows Quick Filter
    document.querySelectorAll('.category-row').forEach(row => {
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        const cat = row.getAttribute('data-category');
        if (typeSelect && cat) {
          typeSelect.value = cat;
          renderVaultsTable();
          window.AegisOwner.showToast(`Filtered by Category: ${cat}`);
        }
      });
    });

    // Create New Vault Modal Triggers
    const btnCreate = document.getElementById('btnOpenCreateVault');
    const btnQuickCreate = document.getElementById('btnQuickCreateVaultSide');
    const formCreate = document.getElementById('formCreateNewVault');

    if (btnCreate) {
      btnCreate.addEventListener('click', () => window.AegisOwner.openModal('createVaultModal'));
    }
    if (btnQuickCreate) {
      btnQuickCreate.addEventListener('click', () => window.AegisOwner.openModal('createVaultModal'));
    }

    if (formCreate) {
      formCreate.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('newVaultName')?.value.trim() || 'Custom Vault';
        const type = document.getElementById('newVaultCategory')?.value || 'Personal';
        const desc = document.getElementById('newVaultDesc')?.value.trim() || 'Confidential digital repository.';

        const typeBadge = type.toLowerCase();
        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
          window.AegisAPI.post('/owner/vaults/', {
            name: name,
            description: desc,
            vault_type: type
          }).then(v => {
            const TYPE_ICONS = {
              'Personal': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
              'Family': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
              'Business': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
              'Legacy': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
              'Health': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
            };
            const newVault = {
              id: v.id,
              name: v.name,
              desc: v.description || '',
              type: v.vault_type,
              typeBadgeClass: (v.vault_type || '').toLowerCase(),
              typeIcon: TYPE_ICONS[v.vault_type] || TYPE_ICONS['Personal'],
              status: v.status.charAt(0).toUpperCase() + v.status.slice(1),
              statusClass: 'status-' + (v.status || '').toLowerCase(),
              trustees: v.trustees_count || 0,
              sharesRatio: v.shares_ratio || '0 / 0',
              sharesPercent: v.shares_percent || 0,
              date: new Date(v.created_at).toLocaleDateString(),
              time: new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              thumbImg: '../assets/images/vault-thumb-1.png',
              releaseCondition: v.release_condition || 'Not set',
              storageUsed: v.storage_used || '0 MB'
            };
            mockVaults.unshift(newVault);
            window.AegisOwner.closeModal('createVaultModal');
            formCreate.reset();
            renderVaultsTable();
            window.AegisOwner.showToast(`Vault "${name}" created successfully!`, 'success');
          }).catch(err => {
            window.AegisOwner.showToast(`Failed to create vault: ${err.message}`, 'error');
          });
        } else {
          const newVault = {
            id: `vault-${Date.now()}`,
            name: name,
            desc: desc,
            type: type,
            typeBadgeClass: typeBadge,
            typeIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
            status: 'Active',
            statusClass: 'status-active',
            trustees: 1,
            sharesRatio: '1 / 1',
            sharesPercent: 100,
            date: 'Just now',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            thumbImg: '../assets/images/vault-thumb-1.png',
            releaseCondition: '60 days heartbeat inactivity',
            storageUsed: '10 MB'
          };
          mockVaults.unshift(newVault);
          window.AegisOwner.closeModal('createVaultModal');
          formCreate.reset();
          renderVaultsTable();
          window.AegisOwner.showToast(`Vault "${name}" created successfully!`, 'success');
        }
      });
    }

    // Edit Vault Form Submit
    const formEdit = document.getElementById('formEditVault');
    if (formEdit) {
      formEdit.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('editVaultId')?.value;
        const name = document.getElementById('editVaultName')?.value.trim();
        const type = document.getElementById('editVaultCategory')?.value;
        const desc = document.getElementById('editVaultDesc')?.value.trim();

        const target = mockVaults.find(v => v.id === id);
        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
          window.AegisAPI.put(`/owner/vaults/${id}/`, {
            name: name || target.name,
            description: desc || target.desc,
            vault_type: type || target.type
          }).then(() => {
            if (target) {
              target.name = name || target.name;
              target.type = type || target.type;
              target.typeBadgeClass = (type || target.type).toLowerCase();
              target.desc = desc || target.desc;
              target.date = 'Just now';
              target.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            window.AegisOwner.closeModal('editVaultModal');
            renderVaultsTable();
            window.AegisOwner.showToast(`Vault "${name}" updated successfully!`, 'success');
          }).catch(err => {
            window.AegisOwner.showToast(`Failed to update vault: ${err.message}`, 'error');
          });
        } else {
          if (target) {
            target.name = name || target.name;
            target.type = type || target.type;
            target.typeBadgeClass = (type || target.type).toLowerCase();
            target.desc = desc || target.desc;
            target.date = 'Just now';
            target.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
          window.AegisOwner.closeModal('editVaultModal');
          renderVaultsTable();
          window.AegisOwner.showToast(`Vault "${name}" updated successfully!`, 'success');
        }
      });
    }
  });

})();
