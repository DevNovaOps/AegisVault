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

  let mockVaults = [];

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
    menu.className = 'dropdown-panel show';
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
    window.location.href = `../vault-details/vault-details.html?id=${vault.id}`;
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
        const vaultsData = Array.isArray(data) ? data : (data.results || []);
        mockVaults = vaultsData.map(v => ({
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

    // -------------------------------------------------------------
    // Digital Vault Creation Wizard (7 Steps)
    // -------------------------------------------------------------
    const wizardModal = document.getElementById('createVaultModal');
    const wizardBody = document.getElementById('wizardBody');
    const wizardNextBtn = document.getElementById('wizardNextBtn');
    const wizardPrevBtn = document.getElementById('wizardPrevBtn');
    const wizardFinishBtn = document.getElementById('wizardFinishBtn');
    
    let currentStep = 1;
    const totalSteps = 7;
    let draftVaultId = null;

    function updateWizardUI() {
      // Show/Hide steps
      document.querySelectorAll('.wizard-step-content').forEach((el, index) => {
        el.style.display = (index + 1 === currentStep) ? 'block' : 'none';
      });
      // Update dots
      document.querySelectorAll('.wizard-step-dot').forEach((el, index) => {
        if (index + 1 < currentStep) {
          el.style.background = 'var(--status-success)'; // completed
          el.classList.remove('active');
        } else if (index + 1 === currentStep) {
          el.style.background = 'var(--brand-orange)'; // active
          el.classList.add('active');
        } else {
          el.style.background = 'var(--bg-input-border)'; // pending
          el.classList.remove('active');
        }
      });
      // Buttons
      wizardPrevBtn.style.visibility = (currentStep === 1) ? 'hidden' : 'visible';
      if (currentStep === totalSteps) {
        wizardNextBtn.style.display = 'none';
        wizardFinishBtn.style.display = 'block';
        populateReviewStep();
      } else {
        wizardNextBtn.style.display = 'block';
        wizardFinishBtn.style.display = 'none';
      }
      
      // Update displays in step 4 dynamically if needed
      document.getElementById('wizardTotalTrustees').addEventListener('input', (e) => {
        document.getElementById('nValDisplay').textContent = e.target.value;
      });
      document.getElementById('wizardRequiredApprovals').addEventListener('input', (e) => {
        document.getElementById('kValDisplay').textContent = e.target.value;
      });
    }

    function populateReviewStep() {
      document.getElementById('revName').textContent = document.getElementById('newVaultName').value || 'Unnamed Vault';
      document.getElementById('revCategory').textContent = document.getElementById('newVaultCategory').value;
      document.getElementById('revPriority').textContent = document.getElementById('newVaultPriority').value;
      document.getElementById('revQuorum').textContent = `${document.getElementById('wizardRequiredApprovals').value} of ${document.getElementById('wizardTotalTrustees').value}`;
      document.getElementById('revHeartbeat').textContent = `${document.getElementById('wizardHeartbeatFreq').value} days (+${document.getElementById('wizardGracePeriod').value} grace)`;
    }

    if (wizardNextBtn) {
      wizardNextBtn.addEventListener('click', () => {
        // Validation per step
        if (currentStep === 1) {
          const name = document.getElementById('newVaultName').value.trim();
          if (!name) {
            window.AegisOwner.showToast('Vault Name is required.', 'error');
            return;
          }
          // Step 1: Create Draft Vault via API
          if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
            if (!draftVaultId) {
              window.AegisOwner.showToast('Creating Draft Vault...', 'info');
              window.AegisAPI.post('/owner/vaults/', {
                name: name,
                vault_type: document.getElementById('newVaultCategory').value,
                description: document.getElementById('newVaultDesc').value,
                status: 'Draft',
                purpose: document.getElementById('newVaultDesc').value,
                priority: document.getElementById('newVaultPriority').value
              }).then(v => {
                draftVaultId = v.id;
                currentStep++;
                updateWizardUI();
              }).catch(err => {
                window.AegisOwner.showToast('Failed to create Draft: ' + err.message, 'error');
              });
              return; // Stop standard progression until async finishes
            } else {
              // Already created draft, just update it if they went back and forth
              window.AegisAPI.put(`/owner/vaults/${draftVaultId}/`, {
                name: name,
                vault_type: document.getElementById('newVaultCategory').value,
                description: document.getElementById('newVaultDesc').value,
                priority: document.getElementById('newVaultPriority').value
              });
            }
          }
        }
        
        if (currentStep < totalSteps) {
          currentStep++;
          updateWizardUI();
        }
      });
    }

    if (wizardPrevBtn) {
      wizardPrevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
          currentStep--;
          updateWizardUI();
        }
      });
    }

    if (wizardFinishBtn) {
      wizardFinishBtn.addEventListener('click', () => {
        if (!document.getElementById('wizardConfirm1').checked || 
            !document.getElementById('wizardConfirm2').checked || 
            !document.getElementById('wizardConfirm3').checked) {
          window.AegisOwner.showToast('You must check all confirmations to proceed.', 'error');
          return;
        }
        
        if (window.AegisAPI && window.AegisAPI.isAuthenticated() && draftVaultId) {
          window.AegisOwner.showToast('Activating Vault and configuring parameters...', 'info');
          // Update vault to Active with final parameters
          window.AegisAPI.put(`/owner/vaults/${draftVaultId}/`, {
            status: 'Active',
            total_shares: document.getElementById('wizardTotalTrustees').value,
            required_shares: document.getElementById('wizardRequiredApprovals').value,
            inactivity_days: document.getElementById('wizardHeartbeatFreq').value,
            release_condition: document.getElementById('wizardReleaseCondition').value
          }).then(() => {
            window.AegisOwner.showToast('Vault Successfully Activated!', 'success');
            window.AegisOwner.closeModal('createVaultModal');
            setTimeout(() => {
              window.location.href = `../vault-details/vault-details.html?id=${draftVaultId}`;
            }, 800);
          }).catch(err => {
             window.AegisOwner.showToast('Activation failed: ' + err.message, 'error');
          });
        } else {
          // Fake mock fallback
          window.AegisOwner.showToast('Vault Successfully Activated!', 'success');
          window.AegisOwner.closeModal('createVaultModal');
          setTimeout(() => {
            window.location.href = `../vault-details/vault-details.html?id=mock-${Date.now()}`;
          }, 800);
        }
      });
    }
    
    // Reset wizard when modal opens
    if (btnCreate) {
      btnCreate.addEventListener('click', () => {
        currentStep = 1; draftVaultId = null; 
        document.querySelectorAll('input, textarea, select').forEach(el => {
          if (el.type === 'checkbox') el.checked = false;
          else if (el.tagName !== 'SELECT' && el.type !== 'number') el.value = '';
        });
        updateWizardUI();
      });
    }
    if (btnQuickCreate) {
      btnQuickCreate.addEventListener('click', () => {
        currentStep = 1; draftVaultId = null;
        updateWizardUI();
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
