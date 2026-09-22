/**
 * AegisVault Trustee Panel - Invitations Controller
 * Manages received trustee invitations, interactive accept/decline workflows,
 * dynamic filtering, sorting, and inspection panel updates.
 */

document.addEventListener('DOMContentLoaded', () => {
  initInvitationsState();
  initFilterTabs();
  initSort();
  initSearch();
  initPanelActions();
});

// Mock Invitation Data
let INVITATIONS_DATA = [
  {
    id: 'inv-family',
    vaultName: 'Family Vault',
    ownerName: 'Priya Shah',
    ownerRole: 'Owner',
    ownerEmail: 'priya.shah@example.com',
    message: "I'm inviting you as a trustee to help protect my digital legacy. Your support means a lot.",
    invitedOn: '12 Sep 2025, 10:24 AM',
    expiresIn: '13 days (25 Sep 2025)',
    respondedOn: null,
    status: 'Pending',
    relationship: 'Family',
    avatarInitials: 'PS',
    iconType: 'shield',
    iconColor: 'amber',
    rawDate: new Date('2025-09-12T10:24:00'),
    expireDays: 13
  },
  {
    id: 'inv-personal',
    vaultName: 'Personal Vault',
    ownerName: 'Amit Patel',
    ownerRole: 'Owner',
    ownerEmail: 'amit.patel@example.com',
    message: 'Would be honored to have you as a trustee for my personal vault.',
    invitedOn: '10 Sep 2025, 04:18 PM',
    expiresIn: '7 days (17 Sep 2025)',
    respondedOn: null,
    status: 'Pending',
    relationship: 'Friend',
    avatarInitials: 'AP',
    iconType: 'lock',
    iconColor: 'blue',
    rawDate: new Date('2025-09-10T16:18:00'),
    expireDays: 7
  },
  {
    id: 'inv-business',
    vaultName: 'Business Documents',
    ownerName: 'Rohan Mehta',
    ownerRole: 'Owner',
    ownerEmail: 'rohan.mehta@example.com',
    message: "Thanks for being part of this. You've been added as a trustee.",
    invitedOn: '28 Aug 2025, 09:12 AM',
    expiresIn: null,
    respondedOn: '30 Aug 2025, 11:03 AM',
    status: 'Accepted',
    relationship: 'Colleague',
    avatarInitials: 'RM',
    iconType: 'check',
    iconColor: 'green',
    rawDate: new Date('2025-08-28T09:12:00'),
    expireDays: 999
  },
  {
    id: 'inv-crypto',
    vaultName: 'Crypto Holdings',
    ownerName: 'Karan Patel',
    ownerRole: 'Owner',
    ownerEmail: 'karan.patel@example.com',
    message: "Understand if you're unable, but I'd still appreciate your consideration.",
    invitedOn: '15 Aug 2025, 02:36 PM',
    expiresIn: null,
    respondedOn: '16 Aug 2025, 09:14 AM',
    status: 'Declined',
    relationship: 'Family',
    avatarInitials: 'KP',
    iconType: 'cross',
    iconColor: 'red',
    rawDate: new Date('2025-08-15T14:36:00'),
    expireDays: 999
  },
  {
    id: 'inv-property',
    vaultName: 'Property Deeds Vault',
    ownerName: 'Anita Roy',
    ownerRole: 'Owner',
    ownerEmail: 'anita.roy@example.com',
    message: 'Trustee authorization for real estate deeds and titles.',
    invitedOn: '01 Aug 2025, 10:00 AM',
    expiresIn: null,
    respondedOn: '02 Aug 2025, 04:00 PM',
    status: 'Accepted',
    relationship: 'Professional',
    avatarInitials: 'AR',
    iconType: 'check',
    iconColor: 'green',
    rawDate: new Date('2025-08-01T10:00:00'),
    expireDays: 999
  },
  {
    id: 'inv-startup',
    vaultName: 'Startup Equity Trust',
    ownerName: 'Vikram Shah',
    ownerRole: 'Owner',
    ownerEmail: 'vikram.shah@example.com',
    message: 'Company equity succession trustee appointment.',
    invitedOn: '12 Jul 2025, 01:15 PM',
    expiresIn: null,
    respondedOn: '14 Jul 2025, 05:45 PM',
    status: 'Accepted',
    relationship: 'Partner',
    avatarInitials: 'VS',
    iconType: 'check',
    iconColor: 'green',
    rawDate: new Date('2025-07-12T13:15:00'),
    expireDays: 999
  }
];

let selectedInvitationId = 'inv-family';
let activeFilter = 'pending';
let activeSort = 'newest';
let searchQuery = '';

function initInvitationsState() {
  updateTabBadgeCounts();
  renderInvitationsList();
  renderSelectedDetailsPanel();
}

// Update count numbers in filter tabs
function updateTabBadgeCounts() {
  const pendingCount = INVITATIONS_DATA.filter(i => i.status === 'Pending').length;
  const acceptedCount = INVITATIONS_DATA.filter(i => i.status === 'Accepted').length;
  const declinedCount = INVITATIONS_DATA.filter(i => i.status === 'Declined').length;
  const expiredCount = INVITATIONS_DATA.filter(i => i.status === 'Expired').length;
  const totalCount = INVITATIONS_DATA.length;

  const btnPending = document.querySelector('[data-filter="pending"]');
  const btnAccepted = document.querySelector('[data-filter="accepted"]');
  const btnDeclined = document.querySelector('[data-filter="declined"]');
  const btnExpired = document.querySelector('[data-filter="expired"]');
  const btnAll = document.querySelector('[data-filter="all"]');

  if (btnPending) btnPending.textContent = `Pending (${pendingCount})`;
  if (btnAccepted) btnAccepted.textContent = `Accepted (${acceptedCount})`;
  if (btnDeclined) btnDeclined.textContent = `Declined (${declinedCount})`;
  if (btnExpired) btnExpired.textContent = `Expired (${expiredCount})`;
  if (btnAll) btnAll.textContent = `All (${totalCount})`;

  // Update sidebar badge
  const sidebarBadge = document.querySelector('#navInvitations .nav-badge');
  if (sidebarBadge) {
    sidebarBadge.textContent = pendingCount;
    sidebarBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
  }
}

// Filter Tabs
function initFilterTabs() {
  const tabs = document.querySelectorAll('.inv-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      activeFilter = tab.getAttribute('data-filter') || 'all';
      renderInvitationsList();
    });
  });
}

// Sort dropdown
function initSort() {
  const sortSelect = document.getElementById('invSortSelect');
  if (!sortSelect) return;

  sortSelect.addEventListener('change', (e) => {
    activeSort = e.target.value;
    renderInvitationsList();
  });
}

// Search input
function initSearch() {
  const searchInput = document.getElementById('invSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderInvitationsList();
  });
}

// Render Invitation Items
function renderInvitationsList() {
  const stack = document.getElementById('invitationsStack');
  if (!stack) return;

  let filtered = INVITATIONS_DATA.filter(item => {
    // Filter match
    const statusLower = item.status.toLowerCase();
    const matchesFilter = (activeFilter === 'all') || (statusLower === activeFilter);

    // Search match
    const queryTarget = `${item.vaultName} ${item.ownerName} ${item.ownerEmail} ${item.message}`.toLowerCase();
    const matchesSearch = !searchQuery || queryTarget.includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  // Sort
  if (activeSort === 'newest') {
    filtered.sort((a, b) => b.rawDate - a.rawDate);
  } else if (activeSort === 'oldest') {
    filtered.sort((a, b) => a.rawDate - b.rawDate);
  } else if (activeSort === 'expiring') {
    filtered.sort((a, b) => a.expireDays - b.expireDays);
  }

  // Clear existing items
  stack.innerHTML = '';

  if (filtered.length === 0) {
    stack.innerHTML = `
      <div style="background-color:var(--bg-surface); border:1px dashed var(--border-medium); border-radius:var(--radius-lg); padding:3rem 2rem; text-align:center; color:var(--text-secondary);">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin:0 auto 0.75rem; color:var(--text-muted);">
          <rect x="3" y="4" width="18" height="16" rx="2"/><path d="m22 7-10 7L2 7"/>
        </svg>
        <h4 style="font-size:1.05rem; font-weight:700; color:var(--text-primary); margin-bottom:0.35rem;">No invitations found</h4>
        <p style="font-size:0.84rem;">No items currently match the selected filter criteria.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(inv => {
    const isSelected = inv.id === selectedInvitationId;
    const card = document.createElement('div');
    card.className = `invitation-card-item ${isSelected ? 'selected' : ''}`;
    card.setAttribute('data-id', inv.id);

    // Status badge HTML
    let badgeClass = 'pending';
    let statusIcon = '●';
    if (inv.status === 'Accepted') { badgeClass = 'submitted'; statusIcon = '✓'; }
    else if (inv.status === 'Declined') { badgeClass = 'failed'; statusIcon = '✕'; }

    // Column 2 info (Expires In vs Responded On)
    const timingColumnHtml = inv.status === 'Pending'
      ? `
        <div class="inv-col-item">
          <span class="inv-col-label">Expires In</span>
          <span class="inv-col-val">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${inv.expiresIn}
          </span>
        </div>`
      : `
        <div class="inv-col-item">
          <span class="inv-col-label">Responded On</span>
          <span class="inv-col-val">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${inv.respondedOn}
          </span>
        </div>`;

    // Action buttons if Pending
    const actionsHtml = inv.status === 'Pending'
      ? `
        <div class="inv-card-actions">
          <button class="btn-accept-sm" onclick="event.stopPropagation(); acceptInvitation('${inv.id}')">Accept Invitation</button>
          <button class="btn-decline-sm" onclick="event.stopPropagation(); declineInvitation('${inv.id}')">Decline</button>
          <span class="btn-details-link">View Details →</span>
        </div>`
      : `
        <div class="inv-card-actions">
          <span class="btn-details-link">View Details →</span>
        </div>`;

    // Icon SVG based on type
    let iconSvg = '';
    if (inv.iconType === 'shield') {
      iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
    } else if (inv.iconType === 'lock') {
      iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
    } else if (inv.iconType === 'check') {
      iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    } else {
      iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    }

    card.innerHTML = `
      <div class="inv-card-top-row">
        <div class="inv-avatar-box ${inv.iconColor}">
          ${iconSvg}
        </div>
        <div class="inv-header-meta">
          <span class="inv-vault-name">${inv.vaultName}</span>
          <span class="inv-inviter-line">Invited by: <strong>${inv.ownerName}</strong> &lt;${inv.ownerEmail}&gt;</span>
          <div class="inv-owner-message">“${inv.message}”</div>
        </div>
      </div>

      <div class="inv-card-columns-row">
        <div class="inv-col-item">
          <span class="inv-col-label">Invited On</span>
          <span class="inv-col-val">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${inv.invitedOn}
          </span>
        </div>

        ${timingColumnHtml}

        <div class="inv-col-item">
          <span class="inv-col-label">Status</span>
          <span class="status-badge ${badgeClass}"><span class="badge-dot"></span>${inv.status}</span>
        </div>

        ${actionsHtml}
      </div>
    `;

    card.addEventListener('click', () => {
      selectedInvitationId = inv.id;
      document.querySelectorAll('.invitation-card-item').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      renderSelectedDetailsPanel();
    });

    stack.appendChild(card);
  });
}

// Render Center/Right Inspection Details Panel
function renderSelectedDetailsPanel() {
  const panel = document.getElementById('invitationDetailsPanel');
  if (!panel) return;

  const inv = INVITATIONS_DATA.find(i => i.id === selectedInvitationId) || INVITATIONS_DATA[0];
  if (!inv) return;

  // Header Badge
  const statusBadge = document.getElementById('panelStatusBadge');
  if (statusBadge) {
    statusBadge.className = `status-badge ${inv.status.toLowerCase() === 'pending' ? 'pending' : (inv.status === 'Accepted' ? 'submitted' : 'failed')}`;
    statusBadge.textContent = inv.status;
  }

  // Vault Title
  document.getElementById('panelVaultTitle').textContent = inv.vaultName;
  document.getElementById('panelInviterInitials').textContent = inv.avatarInitials;
  document.getElementById('panelInviterName').textContent = `Invited by ${inv.ownerName} (${inv.ownerRole})`;
  document.getElementById('panelInviterEmail').textContent = inv.ownerEmail;
  document.getElementById('panelInvitedOn').textContent = inv.invitedOn;
  document.getElementById('panelExpiresIn').textContent = inv.expiresIn || (inv.respondedOn ? `Responded: ${inv.respondedOn}` : 'N/A');
  document.getElementById('panelRelationship').textContent = inv.relationship;
  document.getElementById('panelOwnerMessage').textContent = `“${inv.message}”`;

  // Action Buttons visibility
  const btnAccept = document.getElementById('panelBtnAccept');
  const btnDecline = document.getElementById('panelBtnDecline');
  if (btnAccept && btnDecline) {
    if (inv.status === 'Pending') {
      btnAccept.style.display = 'block';
      btnDecline.style.display = 'block';
    } else {
      btnAccept.style.display = 'none';
      btnDecline.style.display = 'none';
    }
  }
}

// Accept Invitation Action
window.acceptInvitation = function (id) {
  const inv = INVITATIONS_DATA.find(i => i.id === id);
  if (!inv) return;

  inv.status = 'Accepted';
  inv.respondedOn = 'Just now';
  inv.expiresIn = null;
  inv.iconType = 'check';
  inv.iconColor = 'green';

  updateTabBadgeCounts();
  renderInvitationsList();
  renderSelectedDetailsPanel();
  window.showToast(`Accepted trustee invitation for "${inv.vaultName}". It is now linked to your Assigned Vaults!`);
};

// Decline Invitation Action
window.declineInvitation = function (id) {
  const inv = INVITATIONS_DATA.find(i => i.id === id);
  if (!inv) return;

  inv.status = 'Declined';
  inv.respondedOn = 'Just now';
  inv.expiresIn = null;
  inv.iconType = 'cross';
  inv.iconColor = 'red';

  updateTabBadgeCounts();
  renderInvitationsList();
  renderSelectedDetailsPanel();
  window.showToast(`Declined invitation for "${inv.vaultName}".`);
};

// Panel actions bindings
function initPanelActions() {
  const btnAccept = document.getElementById('panelBtnAccept');
  const btnDecline = document.getElementById('panelBtnDecline');
  const linkDetails = document.getElementById('panelLinkDetails');

  if (btnAccept) {
    btnAccept.addEventListener('click', () => {
      acceptInvitation(selectedInvitationId);
    });
  }

  if (btnDecline) {
    btnDecline.addEventListener('click', () => {
      declineInvitation(selectedInvitationId);
    });
  }

  if (linkDetails) {
    linkDetails.addEventListener('click', () => {
      const inv = INVITATIONS_DATA.find(i => i.id === selectedInvitationId);
      if (inv) {
        document.getElementById('modalFullTitle').textContent = inv.vaultName;
        document.getElementById('modalFullOwner').textContent = `${inv.ownerName} (${inv.ownerEmail})`;
        document.getElementById('modalFullRelation').textContent = inv.relationship;
        document.getElementById('modalFullMessage').textContent = inv.message;
        document.getElementById('modalFullInvited').textContent = inv.invitedOn;
        window.openModal('fullDetailsModal');
      }
    });
  }
}
