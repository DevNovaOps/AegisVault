/**
 * AegisVault Trustee Panel - Assigned Vaults Controller
 * Handles filtering, live search, interactive vault detail modals, and action routes
 */

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initSearch();
  initVaultCardClicks();
  initActionAlertButton();
});

// Vault data store
const VAULT_ITEMS = [
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

  const cards = container.querySelectorAll('.assigned-vault-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const vaultId = card.getAttribute('data-vault-id');
    const vault = VAULT_ITEMS.find(v => v.id === vaultId);

    if (!vault) return;

    // Check filter tab match
    const matchesFilter = (currentFilter === 'all') || vault.categories.includes(currentFilter);

    // Check search term match
    const searchableText = `${vault.name} ${vault.owner} ${vault.email} ${vault.tags.join(' ')}`.toLowerCase();
    const matchesSearch = !currentSearch || searchableText.includes(currentSearch);

    if (matchesFilter && matchesSearch) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  // Handle empty state visibility
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
    // In normal view with items, show the default bottom reminder box
    if (emptyBox) {
      emptyBox.style.display = (currentFilter === 'all' && !currentSearch) ? 'flex' : 'none';
      if (emptyTitle) emptyTitle.textContent = 'No more vaults assigned (for now)';
      if (emptySub) emptySub.textContent = 'When a vault owner assigns you to a new vault, it will appear here.';
    }
  }
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
