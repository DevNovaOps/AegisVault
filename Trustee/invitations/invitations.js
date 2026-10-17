/**
 * AegisVault Trustee Panel - Invitations Controller
 * Manages received trustee invitations, interactive accept/decline workflows,
 * dynamic filtering, sorting, and inspection panel updates.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
    window.AegisAPI.get('/trustee/invitations/').then(data => {
      const list = Array.isArray(data) ? data : (data.results || []);
      INVITATIONS_DATA = list.map(inv => {
        const ownerName = inv.owner_name || (inv.owner && inv.owner.name) || 'Owner';
        const ownerEmail = inv.owner_email || (inv.owner && inv.owner.email) || '';
        const vaultName = inv.vault_name || (inv.vault && inv.vault.name) || 'Vault';
        const sentDate = inv.sent_at ? new Date(inv.sent_at) : new Date();

        return {
          id: String(inv.id),
          vaultName: vaultName,
          ownerName: ownerName,
          ownerRole: 'Owner',
          ownerEmail: ownerEmail,
          message: inv.note || 'No special note attached.',
          invitedOn: sentDate.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + sentDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
          expiresIn: inv.expires_at ? new Date(inv.expires_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }) : null,
          respondedOn: inv.accepted_at ? new Date(inv.accepted_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }) : (inv.declined_at ? new Date(inv.declined_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }) : null),
          status: inv.status ? (inv.status.charAt(0).toUpperCase() + inv.status.slice(1)) : 'Pending',
          relationship: inv.relationship || 'Designated Trustee',
          avatarInitials: (ownerName.substring(0, 2)).toUpperCase(),
          iconType: (inv.status || '').toLowerCase() === 'accepted' ? 'check' : ((inv.status || '').toLowerCase() === 'declined' ? 'cross' : 'shield'),
          iconColor: (inv.status || '').toLowerCase() === 'accepted' ? 'green' : ((inv.status || '').toLowerCase() === 'declined' ? 'red' : 'amber'),
          rawDate: sentDate,
          expireDays: inv.expiry_days != null ? inv.expiry_days : (inv.expires_at ? Math.ceil((new Date(inv.expires_at) - new Date()) / (1000 * 60 * 60 * 24)) : 14)
        };
      });
      if (INVITATIONS_DATA.length > 0) {
        selectedInvitationId = INVITATIONS_DATA[0].id;
      } else {
        selectedInvitationId = null;
      }
      finishInit();
    }).catch(err => {
      console.warn('Failed to load invitations:', err);
      INVITATIONS_DATA = [];
      selectedInvitationId = null;
      finishInit();
    });
  } else {
    INVITATIONS_DATA = [];
    selectedInvitationId = null;
    finishInit();
  }
});

function finishInit() {
  initInvitationsState();
  initFilterTabs();
  initSort();
  initSearch();
  initPanelActions();
}

// Live Invitation Data (populated from /api/v1/trustee/invitations/)
let INVITATIONS_DATA = [];

let selectedInvitationId = null;
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
  const btnAccept = document.getElementById('panelBtnAccept');
  const btnDecline = document.getElementById('panelBtnDecline');
  const statusBadge = document.getElementById('panelStatusBadge');
  const actionsGroup = document.getElementById('panelActionsGroup');

  if (!inv) {
    if (statusBadge) statusBadge.style.display = 'none';
    if (actionsGroup) actionsGroup.style.display = 'none';
    if (btnAccept) btnAccept.style.display = 'none';
    if (btnDecline) btnDecline.style.display = 'none';

    document.getElementById('panelVaultTitle').textContent = 'No Invitation Selected';
    document.getElementById('panelInviterInitials').textContent = '--';
    document.getElementById('panelInviterName').textContent = 'Select an invitation from the list to view its charter.';
    document.getElementById('panelInviterEmail').textContent = '';
    document.getElementById('panelInvitedOn').textContent = '—';
    document.getElementById('panelExpiresIn').textContent = '—';
    document.getElementById('panelRelationship').textContent = '—';
    document.getElementById('panelOwnerMessage').textContent = 'Invitations sent to your email by vault owners will appear here.';
    return;
  }

  // Header Badge
  if (statusBadge) {
    statusBadge.style.display = 'inline-flex';
    statusBadge.className = `status-badge ${inv.status.toLowerCase() === 'pending' ? 'pending' : (inv.status === 'Accepted' ? 'submitted' : 'failed')}`;
    statusBadge.textContent = inv.status;
  }

  if (actionsGroup) actionsGroup.style.display = 'flex';

  // Vault Title & Details
  document.getElementById('panelVaultTitle').textContent = inv.vaultName;
  document.getElementById('panelInviterInitials').textContent = inv.avatarInitials;
  document.getElementById('panelInviterName').textContent = `Invited by ${inv.ownerName} (${inv.ownerRole})`;
  document.getElementById('panelInviterEmail').textContent = inv.ownerEmail;
  document.getElementById('panelInvitedOn').textContent = inv.invitedOn;
  document.getElementById('panelExpiresIn').textContent = inv.expiresIn || (inv.respondedOn ? `Responded: ${inv.respondedOn}` : 'N/A');
  document.getElementById('panelRelationship').textContent = inv.relationship;
  document.getElementById('panelOwnerMessage').textContent = `“${inv.message}”`;

  // Action Buttons visibility
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

  if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
    window.AegisAPI.post(`/trustee/invitations/${id}/accept/`).then(() => {
      inv.status = 'Accepted';
      inv.respondedOn = 'Just now';
      inv.expiresIn = null;
      inv.iconType = 'check';
      inv.iconColor = 'green';
      updateTabBadgeCounts();
      renderInvitationsList();
      renderSelectedDetailsPanel();
      window.showToast(`Accepted trustee invitation for "${inv.vaultName}". It is now linked to your Assigned Vaults!`);
    }).catch(err => window.showToast(`Error accepting invitation: ${err.message}`, 'error'));
  } else {
    inv.status = 'Accepted';
    inv.respondedOn = 'Just now';
    inv.expiresIn = null;
    inv.iconType = 'check';
    inv.iconColor = 'green';

    updateTabBadgeCounts();
    renderInvitationsList();
    renderSelectedDetailsPanel();
    window.showToast(`Accepted trustee invitation for "${inv.vaultName}". It is now linked to your Assigned Vaults!`);
  }
};

// Decline Invitation Action
window.declineInvitation = function (id) {
  const inv = INVITATIONS_DATA.find(i => i.id === id);
  if (!inv) return;

  if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
    window.AegisAPI.post(`/trustee/invitations/${id}/decline/`).then(() => {
      inv.status = 'Declined';
      inv.respondedOn = 'Just now';
      inv.expiresIn = null;
      inv.iconType = 'cross';
      inv.iconColor = 'red';
      updateTabBadgeCounts();
      renderInvitationsList();
      renderSelectedDetailsPanel();
      window.showToast(`Declined invitation for "${inv.vaultName}".`);
    }).catch(err => window.showToast(`Error declining invitation: ${err.message}`, 'error'));
  } else {
    inv.status = 'Declined';
    inv.respondedOn = 'Just now';
    inv.expiresIn = null;
    inv.iconType = 'cross';
    inv.iconColor = 'red';

    updateTabBadgeCounts();
    renderInvitationsList();
    renderSelectedDetailsPanel();
    window.showToast(`Declined invitation for "${inv.vaultName}".`);
  }
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
