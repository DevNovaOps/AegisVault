/**
 * AegisVault Trustee Panel - Assigned Vaults Controller
 * Handles filtering, live search, interactive vault detail modals, live decrypted assets list,
 * asset previewing, and asset downloading based on granted Access Level (View Only vs View & Download).
 */

// Vault data store - populated strictly from live backend API
let VAULT_ITEMS = [];
let currentFilter = 'all';
let currentSearch = '';

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', () => {
  loadAssignedVaults();
});

function loadAssignedVaults() {
  if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
    window.AegisAPI.get('/trustee/assigned-vaults/').then(data => {
      VAULT_ITEMS = (data || []).map(share => {
        const statusLower = (share.status || 'pending').toLowerCase();
        const isRevoked = Boolean(share.is_revoked || statusLower === 'revoked');
        const isExpired = Boolean(share.is_expired || statusLower === 'expired');
        const isReleased = Boolean(share.is_released || (share.release_status && (share.release_status.toLowerCase() === 'completed' || share.release_status.toLowerCase() === 'released')));
        const hasActiveRelease = Boolean(share.has_active_release || (share.release_status && share.release_status.toLowerCase() === 'in progress'));
        const isVerified = (statusLower === 'active' || statusLower === 'submitted') && !isRevoked && !isExpired;
        const isShardSubmitted = Boolean(hasActiveRelease && statusLower === 'submitted');

        let categories = ['all'];
        if (isReleased) {
          categories.push('completed');
          categories.push('active');
        } else if (isVerified) {
          categories.push('active');
        } else if (isRevoked) {
          categories.push('revoked');
        } else if (statusLower === 'pending' || statusLower === 'pending_verification') {
          categories.push('pending_verification');
        }
        if (hasActiveRelease) {
          categories.push('release_in_progress');
        }

        const rawReleaseStatus = share.release_status || (hasActiveRelease ? 'In Progress' : 'No Release');
        let displayReleaseStatus = 'No Release';
        let displayReleaseSub = 'Not initiated';

        if (isReleased) {
          displayReleaseStatus = 'Completed';
          displayReleaseSub = 'Vault Unlocked & Handed Over';
        } else if (hasActiveRelease) {
          displayReleaseStatus = 'In Progress';
          displayReleaseSub = isShardSubmitted ? 'Shard Deposited' : 'Awaiting Shard';
        } else if (rawReleaseStatus === 'Cancelled') {
          displayReleaseStatus = 'Cancelled';
          displayReleaseSub = 'Cancelled by Owner';
        }

        let displayShareStatus = 'Pending';
        let displayShareDate = 'Pending';
        let lockColor = 'amber';

        if (isRevoked) {
          displayShareStatus = 'Revoked';
          displayShareDate = 'Access Revoked';
          lockColor = 'red';
        } else if (isExpired) {
          displayShareStatus = 'Expired';
          displayShareDate = 'Share Expired';
          lockColor = 'amber';
        } else if (isReleased) {
          displayShareStatus = 'Released';
          displayShareDate = 'Unlocked for Trustee';
          lockColor = 'green';
        } else if (isShardSubmitted) {
          displayShareStatus = 'Submitted';
          displayShareDate = 'Share Deposited';
          lockColor = 'blue';
        } else if (isVerified) {
          displayShareStatus = 'Active';
          displayShareDate = 'Active Custody';
          lockColor = 'blue';
        }

        const expiryText = share.expires_at 
          ? new Date(share.expires_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' })
          : 'Never (Permanent)';

        const accessLevel = share.access_level || 'View Only';

        return {
          id: String(share.vault || share.id || 'vault-' + Math.random()),
          vaultId: String(share.vault || share.id),
          name: share.vault_name || 'Vault',
          owner: share.owner_name || 'Vault Owner',
          email: share.owner_email || 'Verified Owner',
          assignedOn: new Date(share.created_at || Date.now()).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }),
          verificationStatus: isRevoked ? 'Revoked' : (isExpired ? 'Expired' : (isVerified ? 'Verified' : 'Pending')),
          verificationSub: isRevoked ? 'Access Revoked by Owner' : (isExpired ? 'Expired on ' + expiryText : (isVerified ? 'Cryptographically confirmed' : 'Requires verification')),
          shareStatus: displayShareStatus,
          shareDate: displayShareDate,
          releaseStatus: displayReleaseStatus,
          releaseSub: displayReleaseSub,
          accessLevel: accessLevel,
          expiryText: expiryText,
          isRevoked: isRevoked,
          isExpired: isExpired,
          isReleased: isReleased,
          canView: share.can_view !== undefined ? share.can_view : (!isRevoked && !isExpired),
          canDownload: share.can_download !== undefined ? share.can_download : (isReleased || (accessLevel !== 'View Only' && !isRevoked && !isExpired)),
          tags: ['Assigned', displayShareStatus, accessLevel],
          categories: categories,
          lockColor: lockColor,
          requiresAction: !isVerified && !isRevoked && !isExpired && !isReleased,
          scheme: 'Shamir Secret Sharing (2-of-3)',
          shareHash: share.id ? `sha256:${String(share.id).replace(/-/g, '')}` : 'Active Token',
          description: share.vault_description || 'Secure personal legacy vault protected under AegisVault protocol.'
        };
      });
      finishInit();
    }).catch(err => {
      console.warn('Failed to load assigned vaults', err);
      finishInit();
    });
  } else {
    finishInit();
  }
}

function finishInit() {
  updateSummaryMetrics();
  initTabs();
  initSearch();
  initActionAlertButton();
  renderFilteredVaults();
}

function updateSummaryMetrics() {
  const total = VAULT_ITEMS.length;
  const verified = VAULT_ITEMS.filter(v => v.verificationStatus === 'Verified').length;
  const pending = VAULT_ITEMS.filter(v => v.verificationStatus === 'Pending').length;
  const submitted = VAULT_ITEMS.filter(v => v.shareStatus === 'Submitted').length;
  const released = VAULT_ITEMS.filter(v => v.isReleased || v.categories.includes('release_in_progress')).length;
  const completed = VAULT_ITEMS.filter(v => v.isReleased).length;

  const elTotal = document.getElementById('sumTotalVaults');
  if (elTotal) elTotal.textContent = total;
  const elVer = document.getElementById('sumVerifiedVaults');
  if (elVer) elVer.textContent = verified;
  const elPen = document.getElementById('sumPendingVer');
  if (elPen) elPen.textContent = pending;
  const elSub = document.getElementById('sumSharesSub');
  if (elSub) elSub.textContent = submitted;
  const elRel = document.getElementById('sumActiveRel');
  if (elRel) elRel.textContent = released;

  // Update Tab Labels
  document.querySelectorAll('.vault-tab-btn').forEach(btn => {
    const f = btn.getAttribute('data-filter');
    if (f === 'all') btn.textContent = `All Vaults (${total})`;
    else if (f === 'active') btn.textContent = `Active (${verified})`;
    else if (f === 'pending_verification') btn.textContent = `Pending Verification (${pending})`;
    else if (f === 'release_in_progress') btn.textContent = `Release In Progress (${released})`;
    else if (f === 'completed') btn.textContent = `Completed (${completed})`;
  });

  // Action Alert Card
  const actionAlertCard = document.getElementById('actionAlertCard');
  const actionAlertDesc = document.getElementById('actionAlertDesc');
  if (actionAlertCard) {
    if (pending > 0) {
      actionAlertCard.style.display = 'block';
      if (actionAlertDesc) actionAlertDesc.textContent = `${pending} vault${pending > 1 ? 's' : ''} require${pending === 1 ? 's' : ''} your attention.`;
    } else {
      actionAlertCard.style.display = 'none';
    }
  }
}

// Filter Tabs Logic
function initTabs() {
  const tabs = document.querySelectorAll('.vault-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      currentFilter = tab.getAttribute('data-filter') || 'all';
      renderFilteredVaults();
    });
  });
}

// Live Search Logic
function initSearch() {
  const searchInput = document.getElementById('vaultSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase().trim();
    renderFilteredVaults();
  });
}

// Helper: Format bytes
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Helper: SVG Icons for file types
function getAssetIconSvg(mime, isNote) {
  if (isNote || (mime && mime.includes('text'))) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
  }
  if (mime && mime.includes('image')) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
  }
  if (mime && mime.includes('pdf')) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`;
  }
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`;
}

// Filter and render vault cards
function renderFilteredVaults() {
  const container = document.getElementById('vaultsListContainer');
  const emptyBox = document.getElementById('vaultsEmptyBox');
  const emptyTitle = document.getElementById('emptyBoxTitle');
  const emptySub = document.getElementById('emptyBoxSub');
  if (!container) return;

  // Clear existing static cards on first dynamic render
  if (!window._vaultsRendered) {
    container.querySelectorAll('.assigned-vault-card').forEach(c => c.remove());
    window._vaultsRendered = true;
  }
  
  // Clear currently rendered dynamic cards
  container.querySelectorAll('.assigned-vault-card').forEach(c => c.remove());

  let visibleCount = 0;

  VAULT_ITEMS.forEach(vault => {
    const matchesFilter = (currentFilter === 'all') || vault.categories.includes(currentFilter);
    const searchableText = `${vault.name} ${vault.owner} ${vault.email} ${vault.tags.join(' ')}`.toLowerCase();
    const matchesSearch = !currentSearch || searchableText.includes(currentSearch);

    if (matchesFilter && matchesSearch) {
      visibleCount++;
      
      const card = document.createElement('div');
      card.className = `assigned-vault-card ${vault.isRevoked ? 'vault-card-revoked' : ''}`;
      card.setAttribute('data-vault-id', vault.id);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');

      let accessPillStyle = 'background: rgba(59, 130, 246, 0.15); color: #3b82f6;'; // View Only
      if (vault.accessLevel === 'View & Download' || vault.isReleased) {
        accessPillStyle = 'background: rgba(16, 185, 129, 0.15); color: #10b981;';
      } else if (vault.accessLevel === 'No Access') {
        accessPillStyle = 'background: rgba(239, 68, 68, 0.15); color: #ef4444;';
      }

      let shareStatusPill = vault.shareStatus.toLowerCase();
      if (vault.isRevoked) shareStatusPill = 'revoked';
      else if (vault.isReleased) shareStatusPill = 'completed';

      card.innerHTML = `
        <div class="vault-col-primary">
          <div class="vault-big-lock ${vault.lockColor || 'blue'}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="vault-meta-info">
            <span class="vault-card-title">${vault.name}</span>
            <span class="vault-card-owner">Owner: ${vault.owner}</span>
            <span class="vault-card-email">${vault.email}</span>
            <div class="vault-card-tags" style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
              <span class="tag-badge ${vault.isRevoked ? 'revoked' : vault.shareStatus.toLowerCase()}">${vault.shareStatus}</span>
              <span class="tag-badge" style="${accessPillStyle} font-weight: 600; border-radius: var(--radius-full); font-size: 0.72rem; padding: 0.15rem 0.5rem;">${vault.accessLevel}</span>
              ${vault.isReleased ? `<span class="tag-badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981; font-weight: 700;">Unlocked</span>` : ''}
            </div>
          </div>
        </div>

        <div class="vault-col-data">
          <span class="vault-data-label">Assigned On</span>
          <span class="vault-date-value">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${vault.assignedOn}
          </span>
        </div>

        <div class="vault-col-data">
          <span class="vault-data-label">Verification Status</span>
          <span class="status-badge ${vault.isRevoked ? 'revoked' : (vault.verificationStatus.toLowerCase() === 'verified' ? 'verified' : 'pending')}"><span class="badge-dot"></span>${vault.verificationStatus}</span>
        </div>

        <div class="vault-col-data">
          <span class="vault-data-label">Share Status</span>
          <span class="status-badge ${shareStatusPill}"><span class="badge-dot"></span>${vault.shareStatus}</span>
          <span class="vault-status-subtext">${vault.shareDate}</span>
        </div>

        <div class="vault-col-data">
          <span class="vault-data-label">Release Status</span>
          <span class="status-badge ${vault.isReleased ? 'completed' : (vault.releaseStatus.toLowerCase().includes('in progress') ? 'in-progress' : (vault.releaseStatus.toLowerCase().includes('cancel') ? 'denied' : 'no-release'))}"><span class="badge-dot"></span>${vault.releaseStatus}</span>
          <span class="vault-status-subtext">${vault.releaseSub}</span>
        </div>

        <svg class="vault-chevron-btn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      `;
      
      container.appendChild(card);
    }
  });

  if (visibleCount === 0) {
    if (emptyBox) emptyBox.style.display = 'flex';
    if (currentSearch) {
      if (emptyTitle) emptyTitle.textContent = 'No matching vaults found';
      if (emptySub) emptySub.textContent = `No assigned vaults match "${currentSearch}". Try a different keyword.`;
    } else if (currentFilter === 'completed') {
      if (emptyTitle) emptyTitle.textContent = 'No released vaults yet';
      if (emptySub) emptySub.textContent = 'Vaults unlocked and released by their owner will appear here with full asset access.';
    } else {
      if (emptyTitle) emptyTitle.textContent = 'No vaults in this category';
      if (emptySub) emptySub.textContent = 'Check back as vault owners update assignment conditions.';
    }
  } else {
    if (emptyBox) {
      emptyBox.style.display = 'none';
    }
  }
  
  // Re-bind clicks
  initVaultCardClicks();
}

// Vault Card Click -> Modal Preview
function initVaultCardClicks() {
  const cards = document.querySelectorAll('.assigned-vault-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.vault-status-subtext.clickable')) return;

      const vaultId = card.getAttribute('data-vault-id');
      const vault = VAULT_ITEMS.find(v => String(v.id) === String(vaultId));
      if (vault) {
        openVaultModal(vault);
      }
    });
  });
}

function openVaultModal(vault) {
  const modal = document.getElementById('vaultDetailModal');
  if (!modal) return;

  document.getElementById('modalVaultTitle').textContent = vault.name;
  document.getElementById('modalVaultOwner').textContent = `${vault.owner} (${vault.email})`;
  document.getElementById('modalVaultAssigned').textContent = vault.assignedOn;
  document.getElementById('modalVaultExpiry').textContent = vault.expiryText;
  document.getElementById('modalVaultScheme').textContent = vault.scheme;
  document.getElementById('modalVaultDescription').textContent = vault.description;

  // Revocation Warning Alert
  const revokedWarning = document.getElementById('modalRevokedWarning');
  if (revokedWarning) {
    revokedWarning.style.display = vault.isRevoked ? 'block' : 'none';
  }

  // Released Handover Banner
  const releasedBanner = document.getElementById('modalReleasedBanner');
  if (releasedBanner) {
    releasedBanner.style.display = vault.isReleased ? 'block' : 'none';
  }

  // 4 Badges
  const verifBadge = document.getElementById('modalVaultVerifBadge');
  if (verifBadge) {
    verifBadge.className = `status-badge ${vault.isRevoked ? 'revoked' : (vault.verificationStatus === 'Verified' ? 'verified' : 'pending')}`;
    verifBadge.innerHTML = `<span class="badge-dot"></span>${vault.verificationStatus}`;
  }

  const shareBadge = document.getElementById('modalVaultShareBadge');
  if (shareBadge) {
    shareBadge.className = `status-badge ${vault.isRevoked ? 'revoked' : (vault.shareStatus === 'Submitted' ? 'submitted' : (vault.shareStatus === 'Active' ? 'verified' : 'not-submitted'))}`;
    shareBadge.innerHTML = `<span class="badge-dot"></span>${vault.shareStatus}`;
  }

  const releaseBadge = document.getElementById('modalVaultReleaseBadge');
  if (releaseBadge) {
    const relClass = vault.isReleased ? 'verified' : (vault.releaseStatus === 'In Progress' ? 'in-progress' : (vault.releaseStatus === 'Cancelled' ? 'denied' : 'no-release'));
    releaseBadge.className = `status-badge ${relClass}`;
    releaseBadge.innerHTML = `<span class="badge-dot"></span>${vault.releaseStatus}`;
  }

  const accessBadge = document.getElementById('modalVaultAccessBadge');
  if (accessBadge) {
    if (vault.releaseStatus === 'Cancelled' && !vault.isReleased) {
      accessBadge.className = 'status-badge denied';
      accessBadge.innerHTML = `<span class="badge-dot"></span>No Access`;
    } else {
      let accessClass = 'verified';
      if (vault.accessLevel === 'View Only') accessClass = 'pending';
      else if (vault.accessLevel === 'No Access' || (vault.accessLevel && vault.accessLevel.includes('Cancelled'))) accessClass = 'denied';
      accessBadge.className = `status-badge ${accessClass}`;
      accessBadge.innerHTML = `<span class="badge-dot"></span>${vault.accessLevel}`;
    }
  }

  const hintEl = document.getElementById('modalAccessLevelHint');
  if (hintEl) {
    if (vault.isReleased) {
      hintEl.textContent = 'Vault Released: Full Download Access Granted';
      hintEl.style.color = 'var(--status-success)';
    } else if (vault.releaseStatus === 'Cancelled') {
      hintEl.textContent = 'Release Cancelled: Asset Access Locked';
      hintEl.style.color = 'var(--status-danger)';
    } else if (vault.isRevoked) {
      hintEl.textContent = 'Access Revoked by Owner';
      hintEl.style.color = 'var(--status-danger)';
    } else if (vault.accessLevel === 'No Access' || (vault.accessLevel && vault.accessLevel.includes('Cancelled'))) {
      hintEl.textContent = 'Permissions: No Access (Assets Hidden)';
      hintEl.style.color = 'var(--status-danger)';
    } else if (vault.accessLevel === 'View & Download') {
      hintEl.textContent = 'Permissions: Preview & Direct Download Enabled';
      hintEl.style.color = 'var(--status-success)';
    } else {
      hintEl.textContent = 'Permissions: View Only (Downloads Disabled)';
      hintEl.style.color = 'var(--text-muted)';
    }
  }

  // Load Decrypted Assets
  loadVaultAssets(vault);

  window.openModal('vaultDetailModal');
}

function loadVaultAssets(vault) {
  const loadingEl = document.getElementById('modalAssetsLoading');
  const emptyEl = document.getElementById('modalAssetsEmpty');
  const listEl = document.getElementById('modalAssetsList');
  const countBadge = document.getElementById('modalAssetsCountBadge');

  if (!listEl) return;
  listEl.innerHTML = '';
  if (emptyEl) emptyEl.style.display = 'none';

  if (vault.isRevoked) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (emptyEl) {
      emptyEl.style.display = 'block';
      emptyEl.innerHTML = `
        <div style="padding: 1.25rem; text-align: center; color: var(--status-danger);">
          Access to this vault has been revoked by the owner. Assets cannot be accessed.
        </div>`;
    }
    if (countBadge) countBadge.textContent = '0';
    return;
  }

  if (vault.releaseStatus === 'Cancelled' && !vault.isReleased) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (emptyEl) {
      emptyEl.style.display = 'block';
      emptyEl.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-md);">
          <div style="font-size: 1.5rem; margin-bottom: 0.4rem;">🔒</div>
          <div style="font-weight: 700; color: #ef4444; margin-bottom: 0.25rem;">Release Cancelled</div>
          <div style="font-size: 0.82rem; color: var(--text-muted); max-width: 380px; margin: 0 auto;">
            The vault owner cancelled this release. All asset permissions have been revoked and decrypted documents are securely locked.
          </div>
        </div>`;
    }
    if (countBadge) countBadge.textContent = '0';
    return;
  }

  if ((vault.accessLevel === 'No Access' || (vault.accessLevel && vault.accessLevel.includes('Cancelled'))) && !vault.isReleased) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (emptyEl) {
      emptyEl.style.display = 'block';
      emptyEl.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-md);">
          <div style="font-size: 1.5rem; margin-bottom: 0.4rem;">🔒</div>
          <div style="font-weight: 700; color: #ef4444; margin-bottom: 0.25rem;">No Access Granted</div>
          <div style="font-size: 0.82rem; color: var(--text-muted); max-width: 360px; margin: 0 auto;">
            The vault owner has assigned you to this vault with <strong>No Access</strong> permissions. You cannot view or download assets inside this vault unless the owner updates permissions or completes a vault release.
          </div>
        </div>`;
    }
    if (countBadge) countBadge.textContent = '0';
    return;
  }

  if (loadingEl) loadingEl.style.display = 'block';

  if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
    window.AegisAPI.get(`/trustee/vaults/${vault.vaultId}/assets/`).then(res => {
      if (loadingEl) loadingEl.style.display = 'none';
      const assets = res.assets || [];
      if (countBadge) countBadge.textContent = String(assets.length);

      if (assets.length === 0) {
        if (emptyEl) {
          emptyEl.style.display = 'block';
          emptyEl.textContent = 'No assets stored in this vault yet.';
        }
        return;
      }

      renderAssetItems(assets, vault);
    }).catch(err => {
      if (loadingEl) loadingEl.style.display = 'none';
      if (emptyEl) {
        emptyEl.style.display = 'block';
        emptyEl.textContent = `Asset access restricted: ${err.message || 'Permission denied.'}`;
      }
      if (countBadge) countBadge.textContent = '0';
    });
  } else {
    if (loadingEl) loadingEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    if (countBadge) countBadge.textContent = '0';
  }
}

function renderAssetItems(assets, vault) {
  const listEl = document.getElementById('modalAssetsList');
  if (!listEl) return;
  listEl.innerHTML = '';

  assets.forEach(asset => {
    const itemCard = document.createElement('div');
    itemCard.className = 'asset-item-card';
    itemCard.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); gap: 0.75rem; transition: border-color 0.15s ease;';

    const iconSvg = getAssetIconSvg(asset.mime_type, asset.is_note);
    const sizeStr = formatBytes(asset.file_size_bytes);
    const categoryStr = asset.category || (asset.is_note ? 'Secure Note' : 'Encrypted Document');

    itemCard.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.65rem; min-width: 0; flex: 1;">
        <div style="width: 34px; height: 34px; border-radius: var(--radius-sm); background: var(--brand-orange-tint); display: flex; align-items: center; justify-content: center; color: var(--brand-orange); flex-shrink: 0;">
          ${iconSvg}
        </div>
        <div style="min-width: 0;">
          <div style="font-weight: 600; font-size: 0.86rem; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${escapeHtml(asset.name)}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); display: flex; gap: 0.4rem; align-items: center; margin-top: 0.15rem;">
            <span>${sizeStr}</span>
            <span>•</span>
            <span>${categoryStr}</span>
            ${asset.sensitivity ? `<span style="font-size: 0.65rem; padding: 0.05rem 0.35rem; border-radius: 3px; background: rgba(249, 115, 22, 0.12); color: var(--brand-orange); font-weight: 600;">${asset.sensitivity}</span>` : ''}
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 0.4rem; align-items: center; flex-shrink: 0;">
        <button type="button" class="btn-asset-action btn-preview" style="padding: 0.38rem 0.7rem; font-size: 0.76rem; border-radius: var(--radius-sm); background: var(--bg-input); color: var(--text-primary); border: 1px solid var(--border-subtle); cursor: pointer; display: flex; align-items: center; gap: 0.3rem;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span>Preview</span>
        </button>
        ${asset.can_download ? `
          <button type="button" class="btn-asset-action btn-download" style="padding: 0.38rem 0.7rem; font-size: 0.76rem; border-radius: var(--radius-sm); background: var(--brand-orange); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; font-weight: 600;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Download</span>
          </button>
        ` : `
          <button type="button" disabled title="Download restricted by vault owner (View Only access)" style="padding: 0.38rem 0.7rem; font-size: 0.76rem; border-radius: var(--radius-sm); background: var(--bg-surface); color: var(--text-muted); border: 1px solid var(--border-subtle); cursor: not-allowed; display: flex; align-items: center; gap: 0.3rem; opacity: 0.5;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>Download</span>
          </button>
        `}
      </div>
    `;

    // Click handler for Preview
    const btnPreview = itemCard.querySelector('.btn-preview');
    if (btnPreview) {
      btnPreview.addEventListener('click', (e) => {
        e.stopPropagation();
        openAssetPreview(asset, vault);
      });
    }

    // Click handler for Download
    const btnDl = itemCard.querySelector('.btn-download');
    if (btnDl && asset.can_download) {
      btnDl.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadTrusteeAsset(vault.vaultId, asset.id, asset.name);
      });
    }

    listEl.appendChild(itemCard);
  });
}

// Authenticated Asset Downloader
async function downloadTrusteeAsset(vaultId, assetId, filename) {
  try {
    const token = (window.AegisAPI && window.AegisAPI.getAccessToken()) || localStorage.getItem('aegis_token');
    const apiBase = (window.AegisAPI && window.AegisAPI.API_BASE) || '/api/v1';
    const url = `${apiBase}/trustee/vaults/${vaultId}/assets/${assetId}/download/`;

    window.showToast?.(`Preparing download for "${filename}"...`, 'info');

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { headers });
    if (!res.ok) {
      let detail = 'Download failed.';
      try {
        const errJson = await res.json();
        detail = errJson.detail || detail;
      } catch(e) {}
      window.showToast?.(detail, 'error');
      return;
    }

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'vault_asset';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
    window.showToast?.(`File "${filename}" downloaded successfully.`, 'success');
  } catch (err) {
    console.error('Download error:', err);
    window.showToast?.(`Download failed: ${err.message}`, 'error');
  }
}

function openAssetPreview(asset, vault) {
  const modal = document.getElementById('assetPreviewModal');
  const titleEl = document.getElementById('previewModalTitle');
  const subEl = document.getElementById('previewModalSubtitle');
  const bodyEl = document.getElementById('previewModalBody');
  const downloadBtn = document.getElementById('btnPreviewDownload');
  const accessNoteEl = document.getElementById('previewModalAccessNote');

  if (!modal || !bodyEl) return;

  if (titleEl) titleEl.textContent = asset.name;
  if (subEl) subEl.textContent = `${vault.name} • ${formatBytes(asset.file_size_bytes)}`;

  if (accessNoteEl) {
    accessNoteEl.textContent = asset.can_download ? 'Direct download enabled for this asset.' : 'View Only permission: downloads restricted by owner.';
  }

  if (downloadBtn) {
    if (asset.can_download) {
      downloadBtn.style.display = 'inline-flex';
      downloadBtn.onclick = (e) => {
        e.preventDefault();
        downloadTrusteeAsset(vault.vaultId, asset.id, asset.name);
      };
    } else {
      downloadBtn.style.display = 'none';
    }
  }

  bodyEl.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">Decrypting and rendering asset preview...</div>';

  const token = (window.AegisAPI && window.AegisAPI.getAccessToken()) || localStorage.getItem('aegis_token');
  const apiBase = (window.AegisAPI && window.AegisAPI.API_BASE) || '/api/v1';
  const previewUrl = `${apiBase}/trustee/vaults/${vault.vaultId}/assets/${asset.id}/preview/`;
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

  if (asset.is_note) {
    fetch(previewUrl, { headers })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Failed to decrypt note');
        }
        return res.json();
      })
      .then(data => {
        bodyEl.innerHTML = `
          <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Decrypted Note Content</div>
            <pre style="white-space: pre-wrap; word-break: break-word; font-family: inherit; font-size: 0.92rem; color: var(--text-primary); line-height: 1.6; margin: 0;">${escapeHtml(data.content || '')}</pre>
          </div>
        `;
      })
      .catch(err => {
        bodyEl.innerHTML = `<div style="padding: 1.5rem; color: var(--status-danger); text-align: center;">Failed to decrypt note: ${err.message}</div>`;
      });
  } else {
    const mime = (asset.mime_type || '').toLowerCase();

    if (mime.includes('pdf')) {
      fetch(previewUrl, { headers })
        .then(async res => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Preview unavailable');
          }
          return res.blob();
        })
        .then(blob => {
          const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
          bodyEl.innerHTML = `
            <div style="background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); overflow: hidden;">
              <iframe src="${blobUrl}" style="width: 100%; height: 52vh; border: none;"></iframe>
            </div>
          `;
        })
        .catch(err => {
          bodyEl.innerHTML = `<div style="padding: 1.5rem; color: var(--status-danger); text-align: center;">Failed to load PDF preview: ${err.message}</div>`;
        });
    } else if (mime.includes('image')) {
      fetch(previewUrl, { headers })
        .then(async res => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Preview unavailable');
          }
          return res.blob();
        })
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          bodyEl.innerHTML = `
            <div style="text-align: center; background: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <img src="${blobUrl}" alt="${escapeHtml(asset.name)}" style="max-width: 100%; max-height: 52vh; object-fit: contain; border-radius: var(--radius-sm);" />
            </div>
          `;
        })
        .catch(err => {
          bodyEl.innerHTML = `<div style="padding: 1.5rem; color: var(--status-danger); text-align: center;">Failed to load image preview: ${err.message}</div>`;
        });
    } else {
      bodyEl.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
          <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: var(--brand-orange-tint); color: var(--brand-orange); display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem;">
            ${getAssetIconSvg(asset.mime_type, false)}
          </div>
          <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">${escapeHtml(asset.name)}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">Direct browser preview is not supported for this file type (${asset.mime_type || 'binary'}).</div>
          ${asset.can_download ? `
            <button type="button" class="btn btn-primary btn-modal-fallback-dl" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; font-size: 0.84rem; cursor: pointer; border: none; border-radius: var(--radius-sm); background: var(--brand-orange); color: #fff; font-weight: 600;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Encrypted File
            </button>
          ` : `<div style="font-size: 0.78rem; color: var(--text-muted);">Downloading is restricted (View Only access).</div>`}
        </div>
      `;
      const fallbackBtn = bodyEl.querySelector('.btn-modal-fallback-dl');
      if (fallbackBtn) {
        fallbackBtn.onclick = () => downloadTrusteeAsset(vault.vaultId, asset.id, asset.name);
      }
    }
  }

  window.openModal('assetPreviewModal');
}

// Action button in right sidebar
function initActionAlertButton() {
  const actionBtn = document.getElementById('btnViewPendingActions');
  if (!actionBtn) return;

  actionBtn.addEventListener('click', () => {
    // Switch tab to pending verification
    const pendingTab = document.querySelector('.vault-tab-btn[data-filter="pending_verification"]');
    if (pendingTab) {
      pendingTab.click();
    }
    const firstPendingCard = document.querySelector('.assigned-vault-card');
    if (firstPendingCard) {
      firstPendingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstPendingCard.classList.add('highlight-pulse');
      setTimeout(() => {
        firstPendingCard.classList.remove('highlight-pulse');
      }, 3000);
      window.showToast?.('Vault assignment pending your verification. Click the vault card to review.', 'info');
    }
  });
}
