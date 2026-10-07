/**
 * AegisVault Trustee Panel - Assigned Vaults Controller
 * Handles filtering, live search, interactive vault detail modals, and action routes
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
    window.AegisAPI.get('/trustee/assigned-vaults/').then(data => {
      VAULT_ITEMS = data.map(share => {
        let categories = ['all'];
        if (share.status === 'active') categories.push('active');
        return {
          id: share.vault || 'vault-' + Math.random(),
          name: share.vault_name || 'Vault',
          owner: share.trustee_name || 'Unknown Owner',
          email: share.trustee_email || 'unknown@example.com',
          assignedOn: new Date(share.created_at || Date.now()).toLocaleDateString(),
          verificationStatus: 'Verified',
          verificationSub: '',
          shareStatus: share.status || 'Active',
          shareDate: 'N/A',
          releaseStatus: 'No Release',
          releaseSub: 'Not initiated',
          tags: ['Assigned'],
          categories: categories,
          lockColor: 'blue',
          requiresAction: false,
          scheme: 'Shamir Secret Sharing (2-of-3)',
          shareHash: 'sha256:...',
          description: share.vault_description || ''
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
  initTabs();
  initSearch();
  initActionAlertButton();
  renderFilteredVaults();
}

// Vault data store
let VAULT_ITEMS = [
  {
    id: 'vault-personal',
    name: 'Personal Vault',
    owner: 'Aryan Patel',
    email: 'aryan.patel@gmail.com',
    assignedOn: '10 Aug 2025',
    verificationStatus: 'Verified',
    verificationSub: '',
    shareStatus: 'Submitted',
    shareDate: 'on 12 Aug 2025',
    releaseStatus: 'No Release',
    releaseSub: 'Not initiated',
    tags: ['Family', 'Primary'],
    categories: ['all', 'active'],
    lockColor: 'blue',
    requiresAction: false,
    scheme: 'Shamir Secret Sharing (2-of-3)',
    shareHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    description: 'Contains financial accounts, property documents, and personal letters.'
  },
  {
    id: 'vault-family',
    name: 'Family Vault',
    owner: 'Priya Shah',
    email: 'priya.shah@email.com',
    assignedOn: '18 Aug 2025',
    verificationStatus: 'Pending',
    verificationSub: 'Complete verification',
    shareStatus: 'Not Submitted',
    shareDate: 'Awaiting release',
    releaseStatus: 'In Progress',
    releaseSub: 'Grace period (12 days left)',
    tags: ['Family', 'Secondary'],
    categories: ['all', 'pending_verification', 'release_in_progress'],
    lockColor: 'amber',
    requiresAction: true,
    scheme: 'Shamir Secret Sharing (3-of-5)',
    shareHash: 'Pending offline trustee authorization',
    description: 'Family legacy vault containing trusts, estate planning, and emergency medical directives.'
  }
];

let currentFilter = 'all';
let currentSearch = '';

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
      
      container.insertBefore(card, emptyBox);
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
      emptyBox.style.display = (currentFilter === 'all' && !currentSearch) ? 'flex' : 'none';
      if (emptyTitle) emptyTitle.textContent = 'No more vaults assigned (for now)';
      if (emptySub) emptySub.textContent = 'When a vault owner assigns you to a new vault, it will appear here.';
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
      const vault = VAULT_ITEMS.find(v => v.id === vaultId);
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
  releaseBadge.className = `status-badge ${vault.releaseStatus === 'No Release' ? 'no-release' : 'in-progress'}`;
  releaseBadge.innerHTML = `<span class="badge-dot"></span>${vault.releaseStatus}`;

  // Action button routing inside modal
  const btnShare = document.getElementById('modalBtnSubmitShare');
  if (btnShare) {
    btnShare.style.display = vault.shareStatus === 'Not Submitted' ? 'inline-flex' : 'none';
    btnShare.onclick = () => {
      window.location.href = '../share-submission/share-submission.html';
    };
  }

  const btnVerify = document.getElementById('modalBtnVerify');
  if (btnVerify) {
    btnVerify.style.display = vault.verificationStatus === 'Pending' ? 'inline-flex' : 'none';
    btnVerify.onclick = () => {
      window.location.href = '../trustee-verification/trustee-verification.html';
    };
  }

  window.openModal('vaultDetailModal');
}

// Action button in right sidebar
function initActionAlertButton() {
  const actionBtn = document.getElementById('btnViewPendingActions');
  if (!actionBtn) return;

  actionBtn.addEventListener('click', () => {
    // Highlight Family Vault card
    const familyCard = document.querySelector('[data-vault-id="vault-family"]');
    if (familyCard) {
      familyCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      familyCard.classList.add('highlight-pulse');
      setTimeout(() => {
        familyCard.classList.remove('highlight-pulse');
      }, 3000);
      window.showToast('Family Vault requires identity verification and key share submission.');
    }
  });
}
