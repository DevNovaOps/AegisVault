/**
 * AegisVault Owner Panel — My Vaults Logic
 * Module 02: Vault Inventory, Multi-Criteria Filtering, Dynamic Table & Modals
 */

(function () {
  'use strict';

  // =========================================================================
  // LIVE VAULT STATE (Populated from Django Backend API)
  // =========================================================================

  let liveVaults = [];

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
    let filtered = liveVaults.filter(v => {
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
    updateStatCounts();
    updateSidebarWidgets();
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function updateSidebarWidgets() {
    const cats = {
      Personal: 0,
      Family: 0,
      Business: 0,
      Health: 0,
      Legacy: 0
    };

    liveVaults.forEach(v => {
      const type = (v.type || '').toLowerCase();
      if (type === 'personal') cats.Personal++;
      else if (type === 'family') cats.Family++;
      else if (type === 'business') cats.Business++;
      else if (type === 'health') cats.Health++;
      else if (type === 'legacy') cats.Legacy++;
    });

    const elPersonal = document.getElementById('catCountPersonal');
    const elFamily = document.getElementById('catCountFamily');
    const elBusiness = document.getElementById('catCountBusiness');
    const elHealth = document.getElementById('catCountHealth');
    const elLegacy = document.getElementById('catCountLegacy');

    if (elPersonal) elPersonal.textContent = cats.Personal;
    if (elFamily) elFamily.textContent = cats.Family;
    if (elBusiness) elBusiness.textContent = cats.Business;
    if (elHealth) elHealth.textContent = cats.Health;
    if (elLegacy) elLegacy.textContent = cats.Legacy;

    // Storage Overview from real API
    if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
      window.AegisAPI.get('/owner/storage/overview/').then(data => {
        const valEl = document.getElementById('storageOverviewValue');
        const fillEl = document.getElementById('storageOverviewFill');
        const pctEl = document.getElementById('storageOverviewPercent');

        const usedStr = formatBytes(data.used_bytes || 0);
        const totalStr = formatBytes(data.total_bytes || 10737418240);
        const pct = Math.min(100, Math.max(0, data.usage_percentage || 0));

        if (valEl) valEl.textContent = `${usedStr} of ${totalStr}`;
        if (fillEl) fillEl.style.width = `${pct}%`;
        if (pctEl) pctEl.textContent = `${pct}%`;
      }).catch(() => {});
    }
  }

  function updateStatCounts() {
    const total = liveVaults.length;
    const active = liveVaults.filter(v => v.status === 'Active').length;
    const draft = liveVaults.filter(v => v.status === 'Draft').length;
    const locked = liveVaults.filter(v => v.status === 'Locked').length;
    const trustees = liveVaults.reduce((acc, v) => acc + v.trustees, 0);

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
        const vault = liveVaults.find(v => v.id === id);
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
        const vault = liveVaults.find(v => v.id === id);
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
            liveVaults = liveVaults.filter(v => v.id !== vault.id);
            renderVaultsTable();
            updateSidebarWidgets();
            window.AegisOwner.showToast(`Vault "${vault.name}" deleted.`, 'info');
          }).catch(err => {
            window.AegisOwner.showToast(`Failed to delete vault: ${err.message}`, 'error');
          });
        } else {
          liveVaults = liveVaults.filter(v => v.id !== vault.id);
          renderVaultsTable();
          updateSidebarWidgets();
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

  let activeEditVaultId = null;

  function resolveAssetUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const origin = (typeof window !== 'undefined' && window.location && window.location.port === '8000') 
      ? window.location.origin 
      : 'http://127.0.0.1:8000';
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  function loadEditVaultAssets(vaultId) {
    const tbody = document.getElementById('editVaultAssetsTbody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Loading assets...</td></tr>`;

    if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
      window.AegisAPI.get(`/owner/vaults/${vaultId}/assets/`).then(assets => {
        const list = Array.isArray(assets) ? assets : (assets.results || []);
        tbody.innerHTML = '';
        if (list.length === 0) {
          tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No assets in this vault yet. Drag & drop files or add a secure note above.</td></tr>`;
          return;
        }

        list.forEach(asset => {
          const tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid var(--border-subtle)';
          const isNote = asset.is_note || (asset.category === 'custom' || (!asset.file && !asset.download_url));
          const icon = isNote 
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" stroke-width="2" style="width:16px;height:16px;vertical-align:middle;margin-right:6px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="var(--status-info)" stroke-width="2" style="width:16px;height:16px;vertical-align:middle;margin-right:6px;"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>';
          
          const safeName = (asset.name || 'asset').replace(/'/g, "\\'");
          const fileUrl = resolveAssetUrl(asset.download_url);

          tr.innerHTML = `
            <td style="padding: 0.65rem 0.85rem; color: var(--text-primary); font-weight: 500;">
              <span style="cursor: pointer; text-decoration: underline; text-decoration-color: transparent; transition: text-decoration-color 0.2s;" onmouseover="this.style.textDecorationColor='var(--brand-orange)'" onmouseout="this.style.textDecorationColor='transparent'" onclick="previewVaultAsset('${vaultId}', '${asset.id}')" title="Click to view asset">
                ${icon}${escapeHtml(asset.name)}
              </span>
            </td>
            <td style="padding: 0.65rem 0.85rem; color: var(--text-muted);">${asset.category || (isNote ? 'Secure Note' : 'Document')}</td>
            <td style="padding: 0.65rem 0.85rem; color: var(--text-muted);">${formatBytes(asset.file_size_bytes)}</td>
            <td style="padding: 0.65rem 0.85rem; color: var(--text-muted);">${new Date(asset.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' })}</td>
            <td style="padding: 0.65rem 0.85rem; text-align: right;">
              <div style="display: inline-flex; gap: 0.35rem; align-items: center; justify-content: flex-end;">
                <button type="button" class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center; gap: 0.25rem;" onclick="previewVaultAsset('${vaultId}', '${asset.id}')" title="Preview asset">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  View
                </button>
                ${fileUrl ? `
                  <a href="${fileUrl}" target="_blank" download class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; border-radius: 4px; text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem;" title="Download file">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download
                  </a>
                ` : ''}
                <button type="button" class="btn" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: var(--status-critical); border-radius: 4px; cursor: pointer;" onclick="deleteVaultAssetFromEdit('${vaultId}', '${asset.id}', '${safeName}')">
                  Delete
                </button>
              </div>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }).catch(err => {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--status-critical); padding: 1.5rem;">Failed to load assets: ${err.message}</td></tr>`;
      });
    }
  }

  // Preview Vault Asset Modal Handler for my-vaults.html
  window.previewVaultAsset = function(vaultId, assetId) {
    const modal = document.getElementById('viewAssetModal');
    const titleEl = document.getElementById('assetPreviewTitle');
    const catEl = document.getElementById('assetPreviewCategory');
    const sizeEl = document.getElementById('assetPreviewSize');
    const sensEl = document.getElementById('assetPreviewSensitivity');
    const dateEl = document.getElementById('assetPreviewDate');
    const bodyEl = document.getElementById('assetPreviewBody');
    const openTabBtn = document.getElementById('assetPreviewOpenTab');
    const downloadBtn = document.getElementById('assetPreviewDownload');
    const iconEl = document.getElementById('assetPreviewIcon');

    if (!modal) return;
    bodyEl.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-muted); font-size:0.95rem;">Decrypting & loading asset...</div>`;
    modal.classList.add('show');
    modal.classList.add('active');

    window.AegisAPI.get(`/owner/vaults/${vaultId}/assets/${assetId}/`).then(data => {
      titleEl.textContent = data.name || 'Protected Asset';
      if (catEl) catEl.textContent = data.category || 'Asset';
      if (sizeEl) sizeEl.textContent = formatBytes(data.file_size_bytes);
      if (sensEl) sensEl.textContent = data.sensitivity || 'Sensitive';
      if (dateEl) dateEl.textContent = `Uploaded on ${new Date(data.created_at).toLocaleString()}`;

      const fileUrl = resolveAssetUrl(data.download_url);
      const isNote = data.is_note || (!data.download_url && (data.decrypted_note || data.encrypted_data || data.notes));
      const nameLower = (data.name || '').toLowerCase();
      const isPdf = nameLower.endsWith('.pdf') || (data.mime_type === 'application/pdf');
      const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(nameLower) || (data.mime_type && data.mime_type.startsWith('image/'));
      const isText = /\.(txt|md|json|csv|py|js|html)$/i.test(nameLower) || (data.mime_type && data.mime_type.startsWith('text/'));

      if (fileUrl) {
        if (openTabBtn) {
          openTabBtn.href = fileUrl;
          openTabBtn.style.display = 'inline-flex';
        }
        if (downloadBtn) {
          downloadBtn.href = fileUrl;
          downloadBtn.setAttribute('download', data.name || 'asset');
          downloadBtn.style.display = 'inline-flex';
        }
      } else {
        if (openTabBtn) openTabBtn.style.display = 'none';
        if (downloadBtn) downloadBtn.style.display = 'none';
      }

      if (isNote) {
        if (iconEl) iconEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" stroke-width="2" style="width:22px;height:22px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';
        const noteText = data.decrypted_note || data.description || data.notes || '(Empty secure note)';
        bodyEl.innerHTML = `
          <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:1.5rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--border-subtle); padding-bottom:0.75rem;">
              <span style="font-size:0.85rem; color:var(--brand-orange); font-weight:600;">ENCRYPTED SECURE NOTE</span>
              <button type="button" class="btn btn-secondary" style="font-size:0.75rem; padding:0.25rem 0.5rem;" onclick="navigator.clipboard.writeText('${encodeURIComponent(noteText)}'); window.AegisOwner ? window.AegisOwner.showToast('Note copied to clipboard') : alert('Copied!');">Copy Note</button>
            </div>
            <div style="white-space:pre-wrap; line-height:1.7; color:var(--text-primary); font-size:0.95rem;">${escapeHtml(noteText)}</div>
          </div>
        `;
      } else if (isPdf && fileUrl) {
        if (iconEl) iconEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="var(--status-critical)" stroke-width="2" style="width:22px;height:22px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="14" y1="13" x2="8" y2="13"/></svg>';
        renderPdfViewer(fileUrl, data.name, bodyEl);
      } else if (isImage && fileUrl) {
        if (iconEl) iconEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="var(--status-info)" stroke-width="2" style="width:22px;height:22px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
        bodyEl.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:1rem; background:rgba(0,0,0,0.3); border-radius:8px; border:1px solid var(--border-subtle);">
            <img src="${fileUrl}" alt="${escapeHtml(data.name)}" style="max-width:100%; max-height:68vh; object-fit:contain; border-radius:6px; box-shadow:0 8px 30px rgba(0,0,0,0.5);" />
          </div>
        `;
      } else if (isText && fileUrl) {
        if (iconEl) iconEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" stroke-width="2" style="width:22px;height:22px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>';
        fetch(fileUrl).then(r => r.text()).then(text => {
          bodyEl.innerHTML = `
            <div style="padding:1rem; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:8px; max-height:65vh; overflow:auto;">
              <pre style="margin:0; font-family:monospace; font-size:0.85rem; color:var(--text-primary); white-space:pre-wrap; line-height:1.5;">${escapeHtml(text)}</pre>
            </div>
          `;
        }).catch(() => {
          showGenericAssetCard(data, fileUrl, bodyEl);
        });
      } else {
        showGenericAssetCard(data, fileUrl, bodyEl);
      }
    }).catch(err => {
      bodyEl.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--status-critical);">Failed to load asset details: ${err.message}</div>`;
    });
  };

    function renderPdfViewer(fileUrl, filename, container) {
      container.innerHTML = `
        <div style="display:flex; flex-direction:column; height:74vh; background:#0b1320; border-radius:8px; overflow:hidden; border:1px solid var(--border-subtle);">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 1rem; background:var(--bg-surface); border-bottom:1px solid var(--border-subtle); color:var(--text-primary); font-size:0.85rem; flex-wrap:wrap; gap:0.5rem;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <button type="button" class="btn btn-secondary" id="pdfPrevBtn" style="padding:0.25rem 0.6rem; font-size:0.75rem; cursor:pointer;">&larr; Prev</button>
              <span>Page <strong id="pdfCurrentPage">1</strong> of <strong id="pdfTotalPages">1</strong></span>
              <button type="button" class="btn btn-secondary" id="pdfNextBtn" style="padding:0.25rem 0.6rem; font-size:0.75rem; cursor:pointer;">Next &rarr;</button>
            </div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <button type="button" class="btn btn-secondary" id="pdfZoomOutBtn" style="padding:0.25rem 0.55rem; font-size:0.75rem; cursor:pointer;" title="Zoom Out">&minus;</button>
              <span id="pdfZoomVal" style="font-size:0.8rem; min-width:40px; text-align:center;">100%</span>
              <button type="button" class="btn btn-secondary" id="pdfZoomInBtn" style="padding:0.25rem 0.55rem; font-size:0.75rem; cursor:pointer;" title="Zoom In">+</button>
              <a href="${fileUrl}" target="_blank" class="btn btn-secondary" style="padding:0.25rem 0.65rem; font-size:0.75rem; text-decoration:none; display:inline-flex; align-items:center; gap:0.3rem;" title="Open in separate browser window">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Open Tab &rarr;
              </a>
            </div>
          </div>
          <div id="pdfViewport" style="flex:1; overflow:auto; display:flex; justify-content:center; align-items:flex-start; padding:1.5rem; background:#0b1320;">
            <div id="pdfLoadingState" style="color:var(--text-muted); text-align:center; padding:3rem;">
              <div style="margin-bottom:0.75rem;">Rendering PDF pages with Canvas engine...</div>
            </div>
            <canvas id="pdfViewerCanvas" style="display:none; box-shadow:0 10px 40px rgba(0,0,0,0.6); border-radius:4px; max-width:100%;"></canvas>
          </div>
        </div>
      `;

      if (window.pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '../../common/vendor/pdfjs/pdf.worker.min.js';
        let pdfDoc = null;
        let pageNum = 1;
        let pageRendering = false;
        let pageNumPending = null;
        let scale = 1.35;

        const canvas = container.querySelector('#pdfViewerCanvas');
        const ctx = canvas ? canvas.getContext('2d') : null;
        const curPageEl = container.querySelector('#pdfCurrentPage');
        const totPagesEl = container.querySelector('#pdfTotalPages');
        const zoomValEl = container.querySelector('#pdfZoomVal');
        const loadingEl = container.querySelector('#pdfLoadingState');

        function renderPage(num) {
          pageRendering = true;
          pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale: scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
              canvasContext: ctx,
              viewport: viewport
            };
            const renderTask = page.render(renderContext);
            renderTask.promise.then(() => {
              pageRendering = false;
              if (loadingEl) loadingEl.style.display = 'none';
              if (canvas) canvas.style.display = 'block';
              if (curPageEl) curPageEl.textContent = num;
              if (zoomValEl) zoomValEl.textContent = `${Math.round(scale * 100)}%`;
              if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
              }
            }).catch(err => {
              console.error('Render page error:', err);
              pageRendering = false;
            });
          });
        }

        function queueRenderPage(num) {
          if (pageRendering) {
            pageNumPending = num;
          } else {
            renderPage(num);
          }
        }

        pdfjsLib.getDocument({ url: fileUrl }).promise.then(doc => {
          pdfDoc = doc;
          if (totPagesEl) totPagesEl.textContent = doc.numPages;
          renderPage(pageNum);

          const prevBtn = container.querySelector('#pdfPrevBtn');
          const nextBtn = container.querySelector('#pdfNextBtn');
          const zoomInBtn = container.querySelector('#pdfZoomInBtn');
          const zoomOutBtn = container.querySelector('#pdfZoomOutBtn');

          if (prevBtn) {
            prevBtn.addEventListener('click', () => {
              if (pageNum <= 1) return;
              pageNum--;
              queueRenderPage(pageNum);
            });
          }
          if (nextBtn) {
            nextBtn.addEventListener('click', () => {
              if (pageNum >= pdfDoc.numPages) return;
              pageNum++;
              queueRenderPage(pageNum);
            });
          }
          if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
              scale = Math.min(3.0, scale + 0.25);
              queueRenderPage(pageNum);
            });
          }
          if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
              scale = Math.max(0.6, scale - 0.25);
              queueRenderPage(pageNum);
            });
          }
        }).catch(err => {
          console.error('PDF.js loading failed:', err);
          if (loadingEl) {
            loadingEl.innerHTML = `
              <div style="color:var(--status-critical); margin-bottom:1rem;">Could not render PDF via canvas: ${err.message}</div>
              <a href="${fileUrl}" target="_blank" class="btn btn-primary" style="text-decoration:none;">Open in Browser Tab &rarr;</a>
            `;
          }
        });
      } else {
        const viewport = container.querySelector('#pdfViewport');
        if (viewport) {
          viewport.innerHTML = `
            <object data="${fileUrl}" type="application/pdf" style="width:100%; height:100%;">
              <div style="text-align:center; padding:3rem; color:var(--text-muted);">
                <p style="margin-bottom:1rem;">PDF viewer is not supported directly in this browser frame.</p>
                <a href="${fileUrl}" target="_blank" class="btn btn-primary" style="text-decoration:none;">Open PDF in New Window</a>
              </div>
            </object>
          `;
        }
      }
    }

  function showGenericAssetCard(data, fileUrl, container) {
    container.innerHTML = `
      <div style="text-align:center; padding:3rem 1.5rem; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:8px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" stroke-width="1.5" style="width:64px;height:64px;margin-bottom:1rem;"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
        <h4 style="color:var(--text-primary); margin-bottom:0.5rem; font-size:1.1rem;">${escapeHtml(data.name)}</h4>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1.5rem;">Protected Digital File &bull; ${formatBytes(data.file_size_bytes)} &bull; ${data.mime_type || 'Encrypted File'}</p>
        <div style="display:flex; justify-content:center; gap:0.75rem;">
          ${fileUrl ? `<a href="${fileUrl}" target="_blank" class="btn btn-secondary" style="padding:0.5rem 1rem; text-decoration:none;">Open in New Tab</a>` : ''}
          ${fileUrl ? `<a href="${fileUrl}" download class="btn btn-primary" style="padding:0.5rem 1rem; text-decoration:none;">Download File</a>` : ''}
        </div>
      </div>
    `;
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  window.deleteVaultAssetFromEdit = function(vaultId, assetId, assetName) {
    if (!confirm(`Are you sure you want to permanently delete "${assetName || 'this asset'}" from this vault?`)) return;
    if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
      window.AegisAPI.delete(`/owner/vaults/${vaultId}/assets/${assetId}/`).then(() => {
        window.AegisOwner.showToast('Asset deleted successfully', 'success');
        loadEditVaultAssets(vaultId);
        updateSidebarWidgets();
      }).catch(err => {
        window.AegisOwner.showToast(`Failed to delete asset: ${err.message}`, 'error');
      });
    }
  };

  function uploadFileToEditVault(vaultId, file) {
    if (!file) return;
    const progressContainer = document.getElementById('editUploadProgressContainer');
    const filenameEl = document.getElementById('editUploadFilename');
    const percentEl = document.getElementById('editUploadPercent');
    const barEl = document.getElementById('editUploadProgressBar');

    if (progressContainer) progressContainer.style.display = 'block';
    if (filenameEl) filenameEl.textContent = `Encrypting & uploading "${file.name}"...`;
    if (percentEl) percentEl.textContent = '35%';
    if (barEl) barEl.style.width = '35%';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    formData.append('category', 'document');
    formData.append('sensitivity', 'Sensitive');

    if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
      window.AegisAPI.post(`/owner/vaults/${vaultId}/assets/`, formData).then(() => {
        if (percentEl) percentEl.textContent = '100%';
        if (barEl) barEl.style.width = '100%';
        window.AegisOwner.showToast(`File "${file.name}" uploaded & encrypted!`, 'success');
        setTimeout(() => {
          if (progressContainer) progressContainer.style.display = 'none';
          loadEditVaultAssets(vaultId);
          updateSidebarWidgets();
        }, 600);
      }).catch(err => {
        if (progressContainer) progressContainer.style.display = 'none';
        window.AegisOwner.showToast(`Upload failed: ${err.message}`, 'error');
      });
    }
  }

  function openEditVaultModal(vault) {
    activeEditVaultId = vault.id;

    // Reset tabs to Tab 1
    document.querySelectorAll('.edit-tab-btn').forEach(b => {
      b.classList.remove('active');
      b.style.color = 'var(--text-muted)';
      b.style.background = 'none';
    });
    const firstTabBtn = document.querySelector('.edit-tab-btn[data-tab="editTabGeneral"]');
    if (firstTabBtn) {
      firstTabBtn.classList.add('active');
      firstTabBtn.style.color = 'var(--brand-orange)';
      firstTabBtn.style.background = 'rgba(249, 115, 22, 0.1)';
    }
    document.querySelectorAll('.edit-tab-content').forEach(c => c.style.display = 'none');
    const firstTabContent = document.getElementById('editTabGeneral');
    if (firstTabContent) firstTabContent.style.display = 'block';

    const idInput = document.getElementById('editVaultId');
    const subtitleEl = document.getElementById('editVaultSubtitle');
    const nameInput = document.getElementById('editVaultName');
    const catSelect = document.getElementById('editVaultCategory');
    const priSelect = document.getElementById('editVaultPriority');
    const descInput = document.getElementById('editVaultDesc');
    const tagsInput = document.getElementById('editVaultTags');

    if (idInput) idInput.value = vault.id;
    if (subtitleEl) subtitleEl.textContent = `Editing "${vault.name}" • Status: ${vault.status}`;
    if (nameInput) nameInput.value = vault.name;
    if (catSelect) catSelect.value = vault.type || 'Personal';
    if (priSelect) priSelect.value = vault.priority || 'Normal';
    if (descInput) descInput.value = vault.desc || '';
    if (tagsInput) tagsInput.value = Array.isArray(vault.tags) ? vault.tags.join(', ') : (vault.tags || '');

    // Checkboxes
    const tagsArr = Array.isArray(vault.tags) ? vault.tags.map(t => String(t).toLowerCase()) : [];
    document.querySelectorAll('.edit-asset-type-cb').forEach(cb => {
      const val = cb.value.toLowerCase();
      cb.checked = tagsArr.includes(val) || (vault.desc && vault.desc.toLowerCase().includes(val));
    });

    // Quorum
    const totalSharesInput = document.getElementById('editVaultTotalShares');
    const reqSharesInput = document.getElementById('editVaultRequiredShares');
    const nDisplay = document.getElementById('editNValDisplay');
    const kDisplay = document.getElementById('editKValDisplay');

    const totalVal = vault.total_shares || 3;
    const reqVal = vault.required_shares || 2;
    if (totalSharesInput) totalSharesInput.value = totalVal;
    if (reqSharesInput) reqSharesInput.value = reqVal;
    if (nDisplay) nDisplay.textContent = totalVal;
    if (kDisplay) kDisplay.textContent = reqVal;

    // Heartbeat & Release
    const inactInput = document.getElementById('editVaultInactivityDays');
    const graceInput = document.getElementById('editVaultGracePeriod');
    const relCondInput = document.getElementById('editVaultReleaseCondition');
    const emergInput = document.getElementById('editVaultEmergencyClaim');

    if (inactInput) inactInput.value = vault.inactivity_days || 30;
    if (graceInput) graceInput.value = vault.grace_period || 7;
    if (relCondInput) relCondInput.value = vault.releaseCondition || '';
    if (emergInput) emergInput.checked = Boolean(vault.emergency_claim);

    // Hide note form if open
    const noteCard = document.getElementById('editNoteFormCard');
    if (noteCard) noteCard.style.display = 'none';

    // Load assets in Tab 3
    loadEditVaultAssets(vault.id);

    // Open Modal
    window.AegisOwner.openModal('editVaultModal');
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
        liveVaults = vaultsData.map(v => ({
          id: v.id,
          name: v.name,
          desc: v.description || v.purpose || '',
          type: v.vault_type,
          typeBadgeClass: (v.vault_type || '').toLowerCase(),
          typeIcon: TYPE_ICONS[v.vault_type] || TYPE_ICONS['Personal'],
          status: v.status.charAt(0).toUpperCase() + v.status.slice(1),
          statusClass: 'status-' + (v.status || '').toLowerCase(),
          trustees: v.trustees_count || 0,
          sharesRatio: v.shares_ratio || '0 / 0',
          sharesPercent: v.shares_percent || 0,
          total_shares: v.total_shares || 3,
          required_shares: v.required_shares || 2,
          inactivity_days: v.inactivity_days || 30,
          grace_period: v.grace_period || 7,
          emergency_claim: v.emergency_claim || false,
          priority: v.priority || 'Normal',
          tags: v.tags || [],
          date: new Date(v.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }),
          time: new Date(v.created_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
          thumbImg: '../assets/images/vault-thumb-1.png',
          releaseCondition: v.release_condition || 'Not set',
          storageUsed: v.storage_used || '0 MB'
        }));
        renderVaultsTable();

        // Check if navigated from view details or external link with ?edit=<id>
        const editId = urlParams.get('edit');
        if (editId) {
          const editTarget = liveVaults.find(v => v.id === editId);
          if (editTarget) {
            setTimeout(() => openEditVaultModal(editTarget), 200);
          }
        }
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
          const orig = liveVaults;
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

    const wizardAssetInput = document.getElementById('wizardAssetInput');
    const wizardAssetDropzone = document.getElementById('wizardAssetDropzone');
    const wizardAssetList = document.getElementById('wizardAssetList');

    if (wizardAssetDropzone && wizardAssetInput) {
      wizardAssetDropzone.addEventListener('click', () => wizardAssetInput.click());
      wizardAssetDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        wizardAssetDropzone.style.background = 'rgba(255, 126, 43, 0.05)';
        wizardAssetDropzone.style.borderColor = 'var(--brand-orange)';
      });
      wizardAssetDropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        wizardAssetDropzone.style.background = 'transparent';
        wizardAssetDropzone.style.borderColor = 'var(--bg-input-border)';
      });
      wizardAssetDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        wizardAssetDropzone.style.background = 'transparent';
        wizardAssetDropzone.style.borderColor = 'var(--bg-input-border)';
        if (e.dataTransfer.files.length) handleAssetUploads(e.dataTransfer.files);
      });
      wizardAssetInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleAssetUploads(e.target.files);
      });
    }

    function handleAssetUploads(files) {
      if (!window.AegisAPI || !window.AegisAPI.isAuthenticated()) {
        window.AegisOwner.showToast('Authentication required.', 'error');
        return;
      }
      if (!draftVaultId) {
        window.AegisOwner.showToast('Vault not initialized.', 'error');
        return;
      }

      Array.from(files).forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:0.75rem;background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);';
        fileItem.innerHTML = `
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" stroke-width="2" style="width:20px;height:20px;"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
            <div>
              <div style="color:var(--text-primary);font-size:0.9rem;font-weight:500;">${file.name}</div>
              <div class="upload-status" style="color:var(--brand-orange);font-size:0.75rem;">Uploading...</div>
            </div>
          </div>
          <div class="upload-icon" style="color:var(--text-muted);">...</div>
        `;
        wizardAssetList.appendChild(fileItem);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        formData.append('category', 'document');
        formData.append('asset_category', 'document');
        formData.append('notes', '');

        window.AegisAPI.post(`/owner/vaults/${draftVaultId}/assets/`, formData)
          .then(res => {
            fileItem.querySelector('.upload-icon').innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" stroke-width="2" style="width:20px;height:20px;"><polyline points="20 6 9 17 4 12"/></svg>`;
            if (res && res.id) {
              fileItem.querySelector('.upload-status').innerHTML = `
                <span style="color:var(--status-success);">Uploaded</span> &bull; 
                <a href="#" style="color:var(--brand-orange); text-decoration:underline; font-size:0.75rem; cursor:pointer;" onclick="event.preventDefault(); previewVaultAsset('${draftVaultId}', '${res.id}')">Preview</a>
              `;
            } else {
              fileItem.querySelector('.upload-status').textContent = 'Uploaded';
              fileItem.querySelector('.upload-status').style.color = 'var(--text-muted)';
            }
          })
          .catch(err => {
            fileItem.querySelector('.upload-icon').innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--status-danger)" stroke-width="2" style="width:20px;height:20px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
            fileItem.querySelector('.upload-status').textContent = `Failed: ${err.message}`;
            fileItem.querySelector('.upload-status').style.color = 'var(--status-danger)';
          });
      });
      wizardAssetInput.value = '';
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
          window.AegisOwner.showToast('Please sign in to activate this vault.', 'error');
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

    // Category Row Interactive Filtering
    document.querySelectorAll('.categories-list .category-row').forEach(row => {
      row.addEventListener('click', () => {
        const cat = row.getAttribute('data-category');
        if (typeSelect) {
          if (typeSelect.value.toLowerCase() === cat.toLowerCase()) {
            typeSelect.value = 'all';
            window.AegisOwner.showToast('Cleared category filter');
          } else {
            typeSelect.value = cat;
            window.AegisOwner.showToast(`Filtered by ${cat} Vaults`);
          }
          renderVaultsTable();
        }
      });
    });

    // Edit Modal Tab Navigation
    document.querySelectorAll('.edit-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.edit-tab-btn').forEach(b => {
          b.classList.remove('active');
          b.style.color = 'var(--text-muted)';
          b.style.background = 'none';
        });
        btn.classList.add('active');
        btn.style.color = 'var(--brand-orange)';
        btn.style.background = 'rgba(249, 115, 22, 0.1)';

        document.querySelectorAll('.edit-tab-content').forEach(c => c.style.display = 'none');
        const targetId = btn.getAttribute('data-tab');
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.style.display = 'block';
      });
    });

    // Quorum Real-time Display Update in Edit Modal
    const editTotalShares = document.getElementById('editVaultTotalShares');
    const editReqShares = document.getElementById('editVaultRequiredShares');
    const editNDisplay = document.getElementById('editNValDisplay');
    const editKDisplay = document.getElementById('editKValDisplay');

    function updateEditQuorumText() {
      const n = editTotalShares ? editTotalShares.value : 3;
      const k = editReqShares ? editReqShares.value : 2;
      if (editNDisplay) editNDisplay.textContent = n;
      if (editKDisplay) editKDisplay.textContent = k;
    }
    if (editTotalShares) editTotalShares.addEventListener('input', updateEditQuorumText);
    if (editReqShares) editReqShares.addEventListener('input', updateEditQuorumText);

    // Edit Modal Asset Upload: Dropzone & File Browser
    const editDropzone = document.getElementById('editAssetDropzone');
    const editFileInput = document.getElementById('editAssetFileInput');
    const btnTriggerUpload = document.getElementById('btnTriggerAssetUpload');

    if (btnTriggerUpload && editFileInput) {
      btnTriggerUpload.addEventListener('click', () => editFileInput.click());
    }
    if (editDropzone && editFileInput) {
      editDropzone.addEventListener('click', () => editFileInput.click());
      editDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        editDropzone.style.borderColor = 'var(--brand-orange)';
        editDropzone.style.background = 'rgba(249, 115, 22, 0.05)';
      });
      editDropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        editDropzone.style.borderColor = 'var(--bg-input-border)';
        editDropzone.style.background = 'rgba(255, 255, 255, 0.02)';
      });
      editDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        editDropzone.style.borderColor = 'var(--bg-input-border)';
        editDropzone.style.background = 'rgba(255, 255, 255, 0.02)';
        const files = e.dataTransfer.files;
        if (files && files.length > 0 && activeEditVaultId) {
          uploadFileToEditVault(activeEditVaultId, files[0]);
        }
      });
      editFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0 && activeEditVaultId) {
          uploadFileToEditVault(activeEditVaultId, e.target.files[0]);
          editFileInput.value = '';
        }
      });
    }

    // Edit Modal Secure Note Form
    const btnToggleNote = document.getElementById('btnToggleEditNoteForm');
    const noteCard = document.getElementById('editNoteFormCard');
    const btnCancelNote = document.getElementById('btnCancelEditNote');
    const btnSaveNote = document.getElementById('btnSaveEditNote');

    if (btnToggleNote && noteCard) {
      btnToggleNote.addEventListener('click', () => {
        const isHidden = noteCard.style.display === 'none';
        noteCard.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
          document.getElementById('editNoteTitle').focus();
        }
      });
    }
    if (btnCancelNote && noteCard) {
      btnCancelNote.addEventListener('click', () => {
        noteCard.style.display = 'none';
        document.getElementById('editNoteTitle').value = '';
        document.getElementById('editNoteContent').value = '';
      });
    }
    if (btnSaveNote) {
      btnSaveNote.addEventListener('click', () => {
        const title = document.getElementById('editNoteTitle')?.value.trim();
        const content = document.getElementById('editNoteContent')?.value.trim();
        if (!title || !content) {
          window.AegisOwner.showToast('Note title and content are required.', 'error');
          return;
        }
        if (!activeEditVaultId) {
          window.AegisOwner.showToast('No active vault selected.', 'error');
          return;
        }

        window.AegisOwner.showToast('Encrypting secure note...', 'info');
        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
          window.AegisAPI.post(`/owner/vaults/${activeEditVaultId}/assets/`, {
            name: title,
            encrypted_data: content,
            category: 'custom',
            sensitivity: 'Sensitive'
          }).then(() => {
            window.AegisOwner.showToast('Secure note added to vault!', 'success');
            document.getElementById('editNoteTitle').value = '';
            document.getElementById('editNoteContent').value = '';
            if (noteCard) noteCard.style.display = 'none';
            loadEditVaultAssets(activeEditVaultId);
            updateSidebarWidgets();
          }).catch(err => {
            window.AegisOwner.showToast(`Failed to add note: ${err.message}`, 'error');
          });
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
        const priority = document.getElementById('editVaultPriority')?.value;
        const desc = document.getElementById('editVaultDesc')?.value.trim();
        const tagsInputVal = document.getElementById('editVaultTags')?.value.trim();
        const totalShares = parseInt(document.getElementById('editVaultTotalShares')?.value || '3', 10);
        const requiredShares = parseInt(document.getElementById('editVaultRequiredShares')?.value || '2', 10);
        const inactivityDays = parseInt(document.getElementById('editVaultInactivityDays')?.value || '30', 10);
        const gracePeriod = parseInt(document.getElementById('editVaultGracePeriod')?.value || '7', 10);
        const releaseCondition = document.getElementById('editVaultReleaseCondition')?.value.trim();
        const emergencyClaim = document.getElementById('editVaultEmergencyClaim')?.checked;

        // Gather checked asset types
        const selectedTypes = [];
        document.querySelectorAll('.edit-asset-type-cb:checked').forEach(cb => {
          selectedTypes.push(cb.value);
        });

        const tagsList = tagsInputVal 
          ? tagsInputVal.split(',').map(t => t.trim()).filter(Boolean)
          : selectedTypes;

        const target = liveVaults.find(v => v.id === id);
        const payload = {
          name: name || (target ? target.name : 'Vault'),
          description: desc,
          purpose: desc,
          vault_type: type,
          category: type,
          priority: priority || 'Normal',
          tags: tagsList,
          total_shares: totalShares,
          required_shares: requiredShares,
          inactivity_days: inactivityDays,
          release_condition: releaseCondition
        };

        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
          window.AegisAPI.put(`/owner/vaults/${id}/`, payload).then(() => {
            if (target) {
              target.name = payload.name;
              target.type = payload.vault_type;
              target.typeBadgeClass = payload.vault_type.toLowerCase();
              target.desc = payload.description;
              target.priority = payload.priority;
              target.tags = payload.tags;
              target.total_shares = payload.total_shares;
              target.required_shares = payload.required_shares;
              target.inactivity_days = payload.inactivity_days;
              target.grace_period = gracePeriod;
              target.releaseCondition = payload.release_condition;
              target.emergency_claim = emergencyClaim;
              target.date = 'Just now';
              target.time = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
            }
            window.AegisOwner.closeModal('editVaultModal');
            renderVaultsTable();
            updateSidebarWidgets();
            window.AegisOwner.showToast(`Vault "${payload.name}" updated successfully!`, 'success');
          }).catch(err => {
            window.AegisOwner.showToast(`Failed to update vault: ${err.message}`, 'error');
          });
        } else {
          if (target) {
            target.name = payload.name;
            target.type = payload.vault_type;
            target.typeBadgeClass = payload.vault_type.toLowerCase();
            target.desc = payload.description;
            target.priority = payload.priority;
            target.tags = payload.tags;
            target.total_shares = payload.total_shares;
            target.required_shares = payload.required_shares;
            target.inactivity_days = payload.inactivity_days;
            target.grace_period = gracePeriod;
            target.releaseCondition = payload.release_condition;
            target.date = 'Just now';
            target.time = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
          }
          window.AegisOwner.closeModal('editVaultModal');
          renderVaultsTable();
          updateSidebarWidgets();
          window.AegisOwner.showToast(`Vault "${payload.name}" updated successfully!`, 'success');
        }
      });
    }
  });

})();

