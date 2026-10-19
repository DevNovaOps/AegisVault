/**
 * AegisVault Trustee Panel - Assigned Vaults Controller
 * Handles filtering, live search, interactive vault detail modals, and action routes
 */

// Vault data store - populated strictly from live backend API
let VAULT_ITEMS = [];
let currentFilter = 'all';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
  if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
    window.AegisAPI.get('/trustee/assigned-vaults/').then(data => {
      VAULT_ITEMS = (data || []).map(share => {
        const statusLower = (share.status || 'pending').toLowerCase();
        const hasActiveRelease = Boolean(share.has_active_release || (share.release_status && share.release_status.toLowerCase() === 'in progress'));
        const isVerified = statusLower === 'active' || statusLower === 'submitted';
        const isShardSubmitted = Boolean(hasActiveRelease && statusLower === 'submitted');

        let categories = ['all'];
        if (isVerified) {
          categories.push('active');
        } else if (statusLower === 'pending' || statusLower === 'pending_verification') {
          categories.push('pending_verification');
        }
        if (hasActiveRelease) {
          categories.push('release_in_progress');
        }

        const rawReleaseStatus = share.release_status || (hasActiveRelease ? 'In Progress' : 'No Release');
        const displayReleaseStatus = hasActiveRelease ? 'In Progress' : (rawReleaseStatus === 'Cancelled' ? 'Cancelled' : 'No Release');
        const displayReleaseSub = hasActiveRelease 
          ? (isShardSubmitted ? 'Shard Deposited' : 'Awaiting Shard') 
          : (rawReleaseStatus === 'Cancelled' ? 'Cancelled by Owner' : 'Not initiated');

        const displayShareStatus = isShardSubmitted ? 'Submitted' : (isVerified ? 'Active' : 'Pending');
        const displayShareDate = isShardSubmitted ? 'Share Submitted' : (isVerified ? 'Active Custody' : 'Pending');

        return {
          id: String(share.vault || share.id || 'vault-' + Math.random()),
          name: share.vault_name || 'Vault',
          owner: share.owner_name || 'Vault Owner',
          email: share.owner_email || 'Verified Owner',
          assignedOn: new Date(share.created_at || Date.now()).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }),
          verificationStatus: isVerified ? 'Verified' : 'Pending',
          verificationSub: isVerified ? 'Cryptographically confirmed' : 'Requires verification',
          shareStatus: displayShareStatus,
          shareDate: displayShareDate,
          releaseStatus: displayReleaseStatus,
          releaseSub: displayReleaseSub,
          tags: ['Assigned', displayShareStatus],
          categories: categories,
          lockColor: isVerified ? 'blue' : 'amber',
          requiresAction: !isVerified,
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
});

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
  const released = VAULT_ITEMS.filter(v => v.categories.includes('release_in_progress')).length;

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
    else if (f === 'completed') btn.textContent = `Completed (0)`;
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
      card.className = 'assigned-vault-card';
      card.setAttribute('data-vault-id', vault.id);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');

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
            <div class="vault-card-tags">
              ${vault.tags.map(t => `<span class="tag-badge ${t.toLowerCase()}">${t}</span>`).join('')}
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
          <span class="status-badge ${vault.verificationStatus.toLowerCase() === 'verified' ? 'verified' : 'pending'}"><span class="badge-dot"></span>${vault.verificationStatus}</span>
        </div>

        <div class="vault-col-data">
          <span class="vault-data-label">Share Status</span>
          <span class="status-badge ${vault.shareStatus.toLowerCase().includes('not') ? 'pending' : 'submitted'}"><span class="badge-dot"></span>${vault.shareStatus}</span>
          <span class="vault-status-subtext">${vault.shareDate}</span>
        </div>

        <div class="vault-col-data">
          <span class="vault-data-label">Release Status</span>
          <span class="status-badge ${vault.releaseStatus.toLowerCase().includes('in progress') ? 'in-progress' : 'no-release'}"><span class="badge-dot"></span>${vault.releaseStatus}</span>
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
      if (emptyTitle) emptyTitle.textContent = 'No completed vaults yet';
      if (emptySub) emptySub.textContent = 'Vaults with completed distribution history will be archived here.';
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
      // Don't trigger if user clicked directly on a subtext link
      if (e.target.closest('.vault-status-subtext.clickable')) {
        return;
      }

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
  document.getElementById('modalVaultScheme').textContent = vault.scheme;
  document.getElementById('modalVaultDescription').textContent = vault.description;
  document.getElementById('modalVaultHash').textContent = vault.shareHash;

  const verifBadge = document.getElementById('modalVaultVerifBadge');
  verifBadge.className = `status-badge ${vault.verificationStatus === 'Verified' ? 'verified' : 'pending'}`;
  verifBadge.innerHTML = `<span class="badge-dot"></span>${vault.verificationStatus}`;

  const shareBadge = document.getElementById('modalVaultShareBadge');
  shareBadge.className = `status-badge ${vault.shareStatus === 'Submitted' ? 'submitted' : 'not-submitted'}`;
  shareBadge.innerHTML = `<span class="badge-dot"></span>${vault.shareStatus}`;

  const releaseBadge = document.getElementById('modalVaultReleaseBadge');
  releaseBadge.className = `status-badge ${vault.releaseStatus === 'In Progress' ? 'in-progress' : 'no-release'}`;
  releaseBadge.innerHTML = `<span class="badge-dot"></span>${vault.releaseStatus}`;

  window.openModal('vaultDetailModal');
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
