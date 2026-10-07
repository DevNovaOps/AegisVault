/**
 * AegisVault Owner Panel — Trustee Invitations Logic
 * Module 04: Dynamic Table, Filtering, Donut Chart Sync & Modals
 */

(function() {
  'use strict';

  // =========================================================================
  // 1. Initial Mock Dataset (Exact match to Dark & Light mockups)
  // =========================================================================
  let invitations = [
    {
      id: 'inv-1',
      name: 'Amit Kumar',
      email: 'amit.kumar@email.com',
      rel: 'Brother',
      relClass: 'brother',
      vault: 'Family Vault',
      status: 'pending',
      sentDate: '12 Sep 2025',
      sentTime: '10:24 AM',
      avatar: '../assets/images/trustee-avatar-1.png',
      avatarType: 'img',
      expiryDays: 14,
      isRecent: true,
      note: 'Please accept this invitation to safeguard our family records and medical archives.'
    },
    {
      id: 'inv-2',
      name: 'Sneha Mehta',
      email: 'sneha.mehta@email.com',
      rel: 'Sister',
      relClass: 'sister',
      vault: 'Personal Vault',
      status: 'accepted',
      sentDate: '05 Sep 2025',
      sentTime: '02:16 PM',
      acceptedDate: '05 Sep 2025, 02:16 PM',
      avatar: '../assets/images/trustee-avatar-2.png',
      avatarType: 'img',
      isRecent: true,
      note: 'Emergency contact and healthcare directives.'
    },
    {
      id: 'inv-3',
      name: 'Rahul Kapoor',
      email: 'rahul.kapoor@email.com',
      rel: 'Friend',
      relClass: 'friend',
      vault: 'Business Vault',
      status: 'pending',
      sentDate: '10 Sep 2025',
      sentTime: '09:12 AM',
      initials: 'RK',
      avatarType: 'initials',
      avatarClass: 'avatar-gradient-rk',
      expiryDays: 14,
      isRecent: true,
      note: 'Backup authorization for startup equity holdings.'
    },
    {
      id: 'inv-4',
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      rel: 'Spouse',
      relClass: 'spouse',
      vault: 'Health Vault',
      status: 'accepted',
      sentDate: '01 Sep 2025',
      sentTime: '04:38 PM',
      acceptedDate: '01 Sep 2025, 04:38 PM',
      avatar: '../assets/images/trustee-avatar-4.png',
      avatarType: 'img',
      isRecent: true,
      note: 'Primary healthcare proxy and emergency assets.'
    },
    {
      id: 'inv-5',
      name: 'Vikram Shah',
      email: 'vikram.shah@email.com',
      rel: 'Colleague',
      relClass: 'colleague',
      vault: 'Legacy Vault',
      status: 'declined',
      sentDate: '28 Aug 2025',
      sentTime: '11:05 AM',
      initials: 'VS',
      avatarType: 'initials',
      avatarClass: 'avatar-gradient-vs',
      isRecent: true,
      declineReason: 'Currently unable to fulfill legal responsibilities.',
      note: 'Co-founder IP release authorization.'
    },
    {
      id: 'inv-6',
      name: 'Anita Desai',
      email: 'anita.desai@email.com',
      rel: 'Cousin',
      relClass: 'cousin',
      vault: 'Travel Vault',
      status: 'pending',
      sentDate: '22 Aug 2025',
      sentTime: '03:21 PM',
      avatar: '../assets/images/trustee-avatar-6.png',
      avatarType: 'img',
      expiryDays: 14,
      isRecent: true,
      note: 'Travel documents and property power-of-attorney.'
    },
    {
      id: 'inv-7',
      name: 'Neeraj Singh',
      email: 'neeraj.singh@email.com',
      rel: 'Friend',
      relClass: 'friend',
      vault: 'Family Vault',
      status: 'expired',
      sentDate: '18 Aug 2025',
      sentTime: '10:14 AM',
      initials: 'NS',
      avatarType: 'initials',
      avatarClass: 'avatar-gradient-ns',
      isRecent: true,
      note: 'Original token link expired after 30 days.'
    },
    {
      id: 'inv-8',
      name: 'Karan Malhotra',
      email: 'karan.malhotra@email.com',
      rel: 'Legal Advisor',
      relClass: 'legal-advisor',
      vault: 'Business Vault',
      status: 'accepted',
      sentDate: '12 Aug 2025',
      sentTime: '01:45 PM',
      acceptedDate: '12 Aug 2025, 01:45 PM',
      avatar: '../assets/images/trustee-avatar-8.png',
      avatarType: 'img',
      isRecent: true,
      note: 'Corporate bylaws and escrow governance.'
    },
    // Older invitations completing the 12 Total (5 Pending, 4 Accepted, 2 Declined, 1 Expired)
    {
      id: 'inv-9',
      name: 'Pooja Verma',
      email: 'pooja.verma@email.com',
      rel: 'Sister',
      relClass: 'sister',
      vault: 'Personal Vault',
      status: 'pending',
      sentDate: '14 May 2025',
      sentTime: '11:30 AM',
      initials: 'PV',
      avatarType: 'initials',
      avatarClass: 'avatar-gradient-rk',
      expiryDays: 14,
      isRecent: false,
      note: 'Family photo archives and trust deeds.'
    },
    {
      id: 'inv-10',
      name: 'Dev Patel',
      email: 'dev.patel@email.com',
      rel: 'Brother',
      relClass: 'brother',
      vault: 'Family Vault',
      status: 'pending',
      sentDate: '02 May 2025',
      sentTime: '09:40 AM',
      initials: 'DP',
      avatarType: 'initials',
      avatarClass: 'avatar-gradient-vs',
      expiryDays: 14,
      isRecent: false,
      note: 'Ancestral land title deeds access.'
    },
    {
      id: 'inv-11',
      name: 'Ananya Roy',
      email: 'ananya.roy@email.com',
      rel: 'Friend',
      relClass: 'friend',
      vault: 'Legacy Vault',
      status: 'accepted',
      sentDate: '20 Apr 2025',
      sentTime: '03:15 PM',
      acceptedDate: '21 Apr 2025, 10:00 AM',
      initials: 'AR',
      avatarType: 'initials',
      avatarClass: 'avatar-gradient-rk',
      isRecent: false,
      note: 'Digital creative portfolio rights.'
    },
    {
      id: 'inv-12',
      name: 'Arjun Kapoor',
      email: 'arjun.kapoor@email.com',
      rel: 'Colleague',
      relClass: 'colleague',
      vault: 'Business Vault',
      status: 'declined',
      sentDate: '15 Mar 2025',
      sentTime: '04:50 PM',
      initials: 'AK',
      avatarType: 'initials',
      avatarClass: 'avatar-gradient-ns',
      isRecent: false,
      declineReason: 'Relocating abroad.',
      note: 'Patent disclosure signatory.'
    }
  ];

  // Currently active item for resend/renew dialog
  let activeCandidate = null;

  // =========================================================================
  // 2. DOM Elements
  // =========================================================================
  const tbody = document.getElementById('invitesTableTbody');
  const searchInput = document.getElementById('inviteSearchInput');
  const statusFilter = document.getElementById('statusFilterSelect');
  const vaultFilter = document.getElementById('vaultFilterSelect');
  const timeRangeFilter = document.getElementById('timeRangeFilterSelect');
  const btnMoreFilters = document.getElementById('btnMoreFilters');

  // KPI elements
  const statTotal = document.getElementById('statTotalInvites');
  const statPending = document.getElementById('statPendingInvites');
  const statAccepted = document.getElementById('statAcceptedInvites');
  const statDeclined = document.getElementById('statDeclinedInvites');
  const statExpired = document.getElementById('statExpiredInvites');

  // Modals
  const sendInviteModal = document.getElementById('sendInviteModal');
  const formSendInvite = document.getElementById('formSendInvite');
  const btnOpenSendInvite = document.getElementById('btnOpenSendInvite');
  const btnQuickSendInviteSide = document.getElementById('btnQuickSendInviteSide');

  const inviteDetailsModal = document.getElementById('inviteDetailsModal');
  const inviteDetailsModalBody = document.getElementById('inviteDetailsModalBody');
  const inviteDetailsModalTitle = document.getElementById('inviteDetailsModalTitle');

  const resendInviteModal = document.getElementById('resendInviteModal');
  const resendModalTitle = document.getElementById('resendModalTitle');
  const resendModalBody = document.getElementById('resendModalBody');
  const btnConfirmResend = document.getElementById('btnConfirmResend');

  // =========================================================================
  // 3. Helper Render Functions
  // =========================================================================

  function getRelationshipIcon(rel) {
    const r = rel.toLowerCase();
    if (r === 'brother' || r === 'sister' || r === 'cousin') {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
    }
    if (r === 'spouse') {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    }
    if (r === 'friend') {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
    }
    if (r === 'colleague') {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    }
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
  }

  function getStatusBadge(status) {
    if (status === 'pending') {
      return `
        <span class="status-pill pending">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Pending
        </span>`;
    }
    if (status === 'accepted') {
      return `
        <span class="status-pill accepted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Accepted
        </span>`;
    }
    if (status === 'declined') {
      return `
        <span class="status-pill declined">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Declined
        </span>`;
    }
    return `
      <span class="status-pill expired">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Expired
      </span>`;
  }

  function getActionButtons(item) {
    let primaryBtn = '';
    if (item.status === 'pending') {
      primaryBtn = `
        <button class="btn-table-action" onclick="window.AegisInvitations.openResendModal('${item.id}')" title="Resend Invitation Link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          Resend
        </button>`;
    } else if (item.status === 'accepted' || item.status === 'declined') {
      primaryBtn = `
        <button class="btn-table-action" onclick="window.AegisInvitations.openDetailsModal('${item.id}')" title="View Invitation Details">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View
        </button>`;
    } else if (item.status === 'expired') {
      primaryBtn = `
        <button class="btn-table-action" onclick="window.AegisInvitations.openRenewModal('${item.id}')" title="Renew Expired Link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Renew
        </button>`;
    }

    const moreBtn = `
      <button class="btn-table-more" onclick="window.AegisInvitations.openMoreOptions('${item.id}', this, event)" title="More Options" aria-label="More options for ${item.name}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/></svg>
      </button>`;

    return `<div class="invitation-actions-cell">${primaryBtn}${moreBtn}</div>`;
  }

  // =========================================================================
  // 4. Render Table
  // =========================================================================
  function renderTable() {
    if (!tbody) return;

    const searchTerm = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const statusVal = statusFilter ? statusFilter.value : 'all';
    const vaultVal = vaultFilter ? vaultFilter.value : 'all';
    const timeRangeVal = timeRangeFilter ? timeRangeFilter.value : '3months';

    const filtered = invitations.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm) ||
                          item.email.toLowerCase().includes(searchTerm) ||
                          item.status.toLowerCase().includes(searchTerm) ||
                          item.rel.toLowerCase().includes(searchTerm) ||
                          item.vault.toLowerCase().includes(searchTerm);
      
      const matchStatus = (statusVal === 'all') || (item.status.toLowerCase() === statusVal.toLowerCase());
      const matchVault = (vaultVal === 'all') || (item.vault.toLowerCase() === vaultVal.toLowerCase());
      const matchTime = (timeRangeVal === 'all') || (timeRangeVal === '3months' ? item.isRecent : true);

      return matchSearch && matchStatus && matchVault && matchTime;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 38px; height: 38px; margin: 0 auto 0.75rem; display: block; opacity: 0.6;">
              <rect x="3" y="4" width="18" height="16" rx="2"/>
              <path d="m22 7-10 7L2 7"/>
            </svg>
            <span style="font-size: 0.95rem; font-weight: 600; display: block; margin-bottom: 0.25rem; color: var(--text-primary);">No invitations match your filters</span>
            <span style="font-size: 0.8rem;">Try clearing your search query or choosing another status.</span>
          </td>
        </tr>`;
      return;
    }

    let html = '';
    filtered.forEach(item => {
      // Avatar column
      let avatarHtml = '';
      if (item.avatarType === 'img') {
        avatarHtml = `<div class="invitee-avatar-img" style="background-image: url('${item.avatar}');" title="${item.name}"></div>`;
      } else {
        avatarHtml = `<div class="invitee-avatar-initials ${item.avatarClass || ''}" title="${item.name}">${item.initials}</div>`;
      }

      // Relationship badge
      const relIcon = getRelationshipIcon(item.rel);
      const relHtml = `<span class="rel-badge ${item.relClass}">${relIcon}${item.rel}</span>`;

      // Status pill
      const statusHtml = getStatusBadge(item.status);

      // Actions cell
      const actionsHtml = getActionButtons(item);

      html += `
        <tr data-id="${item.id}">
          <td class="invitee-avatar-cell">
            ${avatarHtml}
          </td>
          <td>
            <div class="invitee-name-box">
              <span class="invitee-name">${item.name}</span>
              <span class="invitee-email" title="${item.email}">${item.email}</span>
            </div>
          </td>
          <td>
            ${relHtml}
          </td>
          <td>
            <a href="../my-vaults/my-vaults.html" class="vault-link-text" title="View ${item.vault}">${item.vault}</a>
          </td>
          <td>
            ${statusHtml}
          </td>
          <td>
            <div class="sent-date-box">
              <span class="sent-date">${item.sentDate}</span>
              <span class="sent-time">${item.sentTime}</span>
            </div>
          </td>
          <td>
            ${actionsHtml}
          </td>
        </tr>`;
    });

    tbody.innerHTML = html;
  }

  // =========================================================================
  // 5. KPI Metrics & Donut Chart Dynamic Sync
  // =========================================================================
  function updateKPIsAndDonut() {
    const total = invitations.length;
    const pending = invitations.filter(i => i.status === 'pending').length;
    const accepted = invitations.filter(i => i.status === 'accepted').length;
    const declined = invitations.filter(i => i.status === 'declined').length;
    const expired = invitations.filter(i => i.status === 'expired').length;

    // Update KPI metric text
    if (statTotal) statTotal.textContent = total;
    if (statPending) statPending.textContent = pending;
    if (statAccepted) statAccepted.textContent = accepted;
    if (statDeclined) statDeclined.textContent = declined;
    if (statExpired) statExpired.textContent = expired;

    // Update Donut Chart
    const circumference = 2 * Math.PI * 46; // ~289.026px
    const donutCenterNum = document.querySelector('.donut-center-num');
    if (donutCenterNum) donutCenterNum.textContent = total;

    const segPending = document.querySelector('.donut-seg.pending');
    const segAccepted = document.querySelector('.donut-seg.accepted');
    const segDeclined = document.querySelector('.donut-seg.declined');
    const segExpired = document.querySelector('.donut-seg.expired');

    if (total > 0 && segPending && segAccepted && segDeclined && segExpired) {
      const lenPending = (pending / total) * circumference;
      const lenAccepted = (accepted / total) * circumference;
      const lenDeclined = (declined / total) * circumference;
      const lenExpired = (expired / total) * circumference;

      // Pending segment
      segPending.setAttribute('stroke-dasharray', `${lenPending.toFixed(1)} ${circumference.toFixed(1)}`);
      segPending.setAttribute('stroke-dashoffset', '0');

      // Accepted segment
      segAccepted.setAttribute('stroke-dasharray', `${lenAccepted.toFixed(1)} ${circumference.toFixed(1)}`);
      segAccepted.setAttribute('stroke-dashoffset', `-${lenPending.toFixed(1)}`);

      // Declined segment
      const offsetDeclined = lenPending + lenAccepted;
      segDeclined.setAttribute('stroke-dasharray', `${lenDeclined.toFixed(1)} ${circumference.toFixed(1)}`);
      segDeclined.setAttribute('stroke-dashoffset', `-${offsetDeclined.toFixed(1)}`);

      // Expired segment
      const offsetExpired = offsetDeclined + lenDeclined;
      segExpired.setAttribute('stroke-dasharray', `${lenExpired.toFixed(1)} ${circumference.toFixed(1)}`);
      segExpired.setAttribute('stroke-dashoffset', `-${offsetExpired.toFixed(1)}`);
    }

    // Update legend values
    const legendPending = document.querySelector('.donut-legend .legend-row:nth-child(1) .legend-label');
    const legendAccepted = document.querySelector('.donut-legend .legend-row:nth-child(2) .legend-label');
    const legendDeclined = document.querySelector('.donut-legend .legend-row:nth-child(3) .legend-label');
    const legendExpired = document.querySelector('.donut-legend .legend-row:nth-child(4) .legend-label');

    if (legendPending) legendPending.textContent = `${pending} Pending`;
    if (legendAccepted) legendAccepted.textContent = `${accepted} Accepted`;
    if (legendDeclined) legendDeclined.textContent = `${declined} Declined`;
    if (legendExpired) legendExpired.textContent = `${expired} Expired`;
  }

  // =========================================================================
  // 6. Modal Functions & User Action Handlers
  // =========================================================================

  function openSendModal() {
    if (formSendInvite) formSendInvite.reset();
    if (sendInviteModal) {
      sendInviteModal.classList.add('show', 'active');
      document.body.style.overflow = 'hidden';
    }
  }

  function openResendModal(id) {
    const item = invitations.find(i => i.id === id);
    if (!item) return;
    activeCandidate = item;

    if (resendModalTitle) resendModalTitle.textContent = 'Resend Invitation Link';
    if (resendModalBody) {
      resendModalBody.innerHTML = `
        <p style="color: var(--text-primary); font-weight: 600; margin-bottom: 0.5rem; font-size: 0.95rem;">
          Dispatch fresh link to ${item.name}?
        </p>
        <p style="color: var(--text-secondary); line-height: 1.5; font-size: 0.85rem; margin-bottom: 0.75rem;">
          A new time-limited cryptographic token will be sent to <strong>${item.email}</strong>.
          The previous link will immediately expire.
        </p>
        <div style="background: var(--bg-surface); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); font-size: 0.8rem; color: var(--text-muted);">
          Vault: <strong style="color: var(--text-primary);">${item.vault}</strong> &bull; Access: <strong style="color: var(--text-primary);">${item.rel}</strong>
        </div>`;
    }
    if (btnConfirmResend) btnConfirmResend.textContent = 'Send Fresh Link';
    if (resendInviteModal) {
      resendInviteModal.classList.add('show', 'active');
      document.body.style.overflow = 'hidden';
    }
  }

  function openRenewModal(id) {
    const item = invitations.find(i => i.id === id);
    if (!item) return;
    activeCandidate = item;

    if (resendModalTitle) resendModalTitle.textContent = 'Renew Expired Invitation';
    if (resendModalBody) {
      resendModalBody.innerHTML = `
        <p style="color: var(--text-primary); font-weight: 600; margin-bottom: 0.5rem; font-size: 0.95rem;">
          Re-activate invitation for ${item.name}?
        </p>
        <p style="color: var(--text-secondary); line-height: 1.5; font-size: 0.85rem; margin-bottom: 0.75rem;">
          This will generate a fresh 14-day validity invitation and reset the status from <strong>Expired</strong> to <strong>Pending</strong>.
        </p>
        <div style="background: var(--bg-surface); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); font-size: 0.8rem; color: var(--text-muted);">
          Recipient: <strong style="color: var(--text-primary);">${item.email}</strong> &bull; Target: <strong style="color: var(--text-primary);">${item.vault}</strong>
        </div>`;
    }
    if (btnConfirmResend) btnConfirmResend.textContent = 'Re-Activate & Send';
    if (resendInviteModal) {
      resendInviteModal.classList.add('show', 'active');
      document.body.style.overflow = 'hidden';
    }
  }

  function openDetailsModal(id) {
    const item = invitations.find(i => i.id === id);
    if (!item || !inviteDetailsModalBody) return;

    if (inviteDetailsModalTitle) {
      inviteDetailsModalTitle.textContent = `${item.name} — Invitation Details`;
    }

    const statusBadge = getStatusBadge(item.status);
    const relIcon = getRelationshipIcon(item.rel);

    inviteDetailsModalBody.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle);">
        ${item.avatarType === 'img' 
          ? `<div class="invitee-avatar-img" style="width: 50px; height: 50px; background-image: url('${item.avatar}');"></div>`
          : `<div class="invitee-avatar-initials ${item.avatarClass || ''}" style="width: 50px; height: 50px; font-size: 1.1rem;">${item.initials}</div>`
        }
        <div>
          <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.2rem;">${item.name}</h4>
          <span style="font-size: 0.82rem; color: var(--text-muted);">${item.email}</span>
        </div>
        <div style="margin-left: auto;">
          ${statusBadge}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
        <div style="background: var(--bg-surface); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 0.35rem;">Assigned Vault</span>
          <span style="font-size: 0.92rem; font-weight: 700; color: #38bdf8;">${item.vault}</span>
        </div>
        <div style="background: var(--bg-surface); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 0.35rem;">Relationship</span>
          <span class="rel-badge ${item.relClass}">${relIcon}${item.rel}</span>
        </div>
        <div style="background: var(--bg-surface); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 0.35rem;">Dispatched Timestamp</span>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${item.sentDate} at ${item.sentTime}</span>
        </div>
        <div style="background: var(--bg-surface); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 0.35rem;">Access Scope</span>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">Posthumous Release</span>
        </div>
      </div>

      ${item.note ? `
        <div style="margin-bottom: 1rem;">
          <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 0.35rem;">Personal Invitation Note</span>
          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; background: var(--bg-surface); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin: 0;">
            &ldquo;${item.note}&rdquo;
          </p>
        </div>` : ''
      }

      <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle);">
        <span>Security Checksum: <code style="color: var(--brand-orange); font-family: monospace;">SHA256-${item.id.toUpperCase()}-77FA8B</code></span>
        <span>Status: <strong style="color: var(--text-primary); text-transform: capitalize;">${item.status}</strong></span>
      </div>`;

    if (inviteDetailsModal) {
      inviteDetailsModal.classList.add('show', 'active');
      document.body.style.overflow = 'hidden';
    }
  }

  let activeInviteMenu = null;

  function closeInviteContextMenu() {
    if (activeInviteMenu) {
      activeInviteMenu.remove();
      activeInviteMenu = null;
    }
  }

  document.addEventListener('click', (e) => {
    if (activeInviteMenu && !activeInviteMenu.contains(e.target) && !e.target.closest('.btn-table-more')) {
      closeInviteContextMenu();
    }
  });

  function openMoreOptions(id, anchorEl, event) {
    if (event) event.stopPropagation();
    const item = invitations.find(i => i.id === id);
    if (!item) return;

    if (activeInviteMenu) {
      closeInviteContextMenu();
    }

    const menu = document.createElement('div');
    menu.className = 'dropdown-panel';
    menu.style.position = 'fixed';
    menu.style.display = 'block';
    menu.style.zIndex = '9999';
    menu.style.minWidth = '210px';

    menu.innerHTML = `
      <div class="dropdown-header">${item.name}</div>
      <button class="dropdown-item" data-action="details" style="width:100%; border:none; background:none; text-align:left; cursor:pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        <span>View Details</span>
      </button>
      <button class="dropdown-item" data-action="copy" style="width:100%; border:none; background:none; text-align:left; cursor:pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        <span>Copy Invite Token</span>
      </button>
      <button class="dropdown-item" data-action="resend" style="width:100%; border:none; background:none; text-align:left; cursor:pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        <span>${item.status === 'expired' ? 'Renew Invitation' : 'Resend Invitation'}</span>
      </button>
      <div class="dropdown-divider"></div>
      <button class="dropdown-item" data-action="cancel" style="width:100%; border:none; background:none; text-align:left; cursor:pointer; color:var(--status-danger);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        <span>Revoke Invitation</span>
      </button>
    `;

    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      menu.style.top = `${rect.bottom + 6}px`;
      menu.style.left = `${Math.min(window.innerWidth - 230, rect.left - 160)}px`;
    }

    menu.querySelector('[data-action="details"]').addEventListener('click', () => {
      closeInviteContextMenu();
      openDetailsModal(item.id);
    });

    menu.querySelector('[data-action="copy"]').addEventListener('click', () => {
      closeInviteContextMenu();
      const mockToken = `https://aegisvault.io/trustee-invite?token=aegis_inv_${item.id}_${Math.random().toString(36).substring(2, 9)}`;
      navigator.clipboard?.writeText(mockToken);
      window.AegisOwner?.showToast(`Copied secure invitation link to clipboard!`, 'success');
    });

    menu.querySelector('[data-action="resend"]').addEventListener('click', () => {
      closeInviteContextMenu();
      if (item.status === 'expired') {
        openRenewModal(item.id);
      } else {
        openResendModal(item.id);
      }
    });

    menu.querySelector('[data-action="cancel"]').addEventListener('click', () => {
      closeInviteContextMenu();
      if (confirm(`Revoke pending invitation for "${item.name}"? The cryptographic authorization token will be invalidated.`)) {
        item.status = 'declined';
        updateKPIsAndDonut();
        renderTable();
        window.AegisOwner?.showToast(`Invitation for ${item.name} revoked.`, 'warning');
      }
    });

    document.body.appendChild(menu);
    activeInviteMenu = menu;
  }

  // =========================================================================
  // 7. Event Listeners Initialization
  // =========================================================================
  function initEvents() {
    // Search input
    if (searchInput) {
      searchInput.addEventListener('input', renderTable);
    }

    // Select filters
    if (statusFilter) {
      statusFilter.addEventListener('change', renderTable);
    }
    if (vaultFilter) {
      vaultFilter.addEventListener('change', renderTable);
    }
    // URL parameter pre-filter (e.g. ?status=pending)
    const urlParams = new URLSearchParams(window.location.search);
    const initialStatus = urlParams.get('status') || urlParams.get('filter');
    if (initialStatus && statusFilter) {
      const opt = Array.from(statusFilter.options).find(o => o.value.toLowerCase() === initialStatus.toLowerCase());
      if (opt) statusFilter.value = opt.value;
    }

    // 5 KPI Metric Cards Interactive Filtering
    const metricCards = document.querySelectorAll('.metrics-row .metric-card');
    metricCards.forEach((card, index) => {
      card.style.cursor = 'pointer';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.title = 'Click to filter invitations';

      card.addEventListener('click', () => {
        if (index === 0) {
          // Total -> Reset
          if (statusFilter) statusFilter.value = 'all';
          if (vaultFilter) vaultFilter.value = 'all';
          if (searchInput) searchInput.value = '';
          renderTable();
          window.AegisOwner?.showToast('Showing all invitations');
        } else if (index === 1) {
          if (statusFilter) statusFilter.value = 'pending';
          renderTable();
          window.AegisOwner?.showToast('Filtered: Pending Invitations');
        } else if (index === 2) {
          if (statusFilter) statusFilter.value = 'accepted';
          renderTable();
          window.AegisOwner?.showToast('Filtered: Accepted Invitations');
        } else if (index === 3) {
          if (statusFilter) statusFilter.value = 'declined';
          renderTable();
          window.AegisOwner?.showToast('Filtered: Declined Invitations');
        } else if (index === 4) {
          if (statusFilter) statusFilter.value = 'expired';
          renderTable();
          window.AegisOwner?.showToast('Filtered: Expired Invitations');
        }
      });
    });

    // Donut Legend Interactive Filtering
    document.querySelectorAll('.donut-legend .legend-row').forEach(row => {
      row.style.cursor = 'pointer';
      row.title = 'Click to filter by status';
      row.addEventListener('click', () => {
        const text = row.textContent.toLowerCase();
        if (text.includes('pending') && statusFilter) {
          statusFilter.value = 'pending';
        } else if (text.includes('accepted') && statusFilter) {
          statusFilter.value = 'accepted';
        } else if (text.includes('declined') && statusFilter) {
          statusFilter.value = 'declined';
        } else if (text.includes('expired') && statusFilter) {
          statusFilter.value = 'expired';
        }
        renderTable();
        window.AegisOwner?.showToast(`Filtered invitations: ${row.querySelector('.legend-label')?.textContent || ''}`);
      });
    });

    // More Filters button toggle
    let moreFiltersState = false;
    if (btnMoreFilters) {
      btnMoreFilters.addEventListener('click', function() {
        moreFiltersState = !moreFiltersState;
        if (moreFiltersState) {
          btnMoreFilters.style.borderColor = 'var(--brand-orange)';
          btnMoreFilters.style.color = 'var(--brand-orange)';
          btnMoreFilters.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"/></svg> Action Required`;
          if (statusFilter) statusFilter.value = 'pending';
          renderTable();
          window.AegisOwner?.showToast('Advanced Filter: Showing Invitations Awaiting Verification');
        } else {
          btnMoreFilters.style.borderColor = '';
          btnMoreFilters.style.color = '';
          btnMoreFilters.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> More Filters`;
          if (statusFilter) statusFilter.value = 'all';
          renderTable();
          window.AegisOwner?.showToast('Filters reset to all');
        }
      });
    }

    // Open Send Invite Modal
    if (btnOpenSendInvite) {
      btnOpenSendInvite.addEventListener('click', openSendModal);
    }
    if (btnQuickSendInviteSide) {
      btnQuickSendInviteSide.addEventListener('click', openSendModal);
    }

    // Form Submit (Send Invitation)
    if (formSendInvite) {
      formSendInvite.addEventListener('submit', function(e) {
        e.preventDefault();

        const nameInput = document.getElementById('inviteeName');
        const emailInput = document.getElementById('inviteeEmail');
        const relInput = document.getElementById('inviteeRel');
        const vaultInput = document.getElementById('inviteeVault');
        const noteInput = document.getElementById('inviteeNote');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const rel = relInput ? relInput.value : 'Friend';
        const vault_id = vaultInput ? vaultInput.value : 'Family Vault';
        const vaultName = vaultInput && vaultInput.options ? vaultInput.options[vaultInput.selectedIndex]?.text : vault_id;
        const note = noteInput ? noteInput.value.trim() : '';

        if (!name || !email) return;

        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
          window.AegisAPI.post('/owner/invitations/', {
            invitee_name: name,
            invitee_email: email,
            relationship: rel,
            vault_id: vault_id,
            note: note
          }).then(inv => {
            const parts = name.split(' ');
            const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
            const newInvite = {
              id: inv.id, name: name, email: email, rel: rel, relClass: rel.toLowerCase().replace(/ /g, '-'),
              vault: vaultName, status: 'pending', sentDate: new Date(inv.sent_at).toLocaleDateString(), sentTime: new Date(inv.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              initials: initials, avatarType: 'initials', avatarClass: 'avatar-gradient-rk', expiryDays: 14, note: note
            };
            invitations.unshift(newInvite);
            updateKPIsAndDonut();
            renderTable();
            if (sendInviteModal) {
              sendInviteModal.classList.remove('show', 'active');
              document.body.style.overflow = '';
            }
            if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(`Cryptographic invitation dispatched to ${name} (${email})!`);
          }).catch(err => {
            if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(`Failed to send invitation: ${err.message}`, 'error');
          });
        } else {
          const parts = name.split(' ');
          const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
          const newInvite = {
            id: 'inv-' + Date.now(), name: name, email: email, rel: rel, relClass: rel.toLowerCase().replace(/ /g, '-'),
            vault: vaultName, status: 'pending', sentDate: new Date().toLocaleDateString(), sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            initials: initials, avatarType: 'initials', avatarClass: 'avatar-gradient-rk', expiryDays: 14, note: note
          };
          invitations.unshift(newInvite);
          updateKPIsAndDonut();
          renderTable();
          if (sendInviteModal) {
            sendInviteModal.classList.remove('show', 'active');
            document.body.style.overflow = '';
          }
          if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') window.AegisOwner.showToast(`Cryptographic invitation dispatched to ${name} (${email})!`);
        }
      });
    }

    // Confirm Resend / Renew Button
    if (btnConfirmResend) {
      btnConfirmResend.addEventListener('click', function() {
        if (!activeCandidate) return;
        const endpoint = activeCandidate.status === 'expired' ? 'renew' : 'resend';
        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
          window.AegisAPI.post(`/owner/invitations/${activeCandidate.id}/${endpoint}/`).then(() => {
            if (activeCandidate.status === 'expired') {
              activeCandidate.status = 'pending';
            }
            activeCandidate.sentDate = new Date().toLocaleDateString();
            activeCandidate.sentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            updateKPIsAndDonut();
            renderTable();
            if (resendInviteModal) {
              resendInviteModal.classList.remove('show', 'active');
              document.body.style.overflow = '';
            }
            window.AegisOwner?.showToast(endpoint === 'renew' ? `Invitation renewed for ${activeCandidate.name}!` : `Reminder sent to ${activeCandidate.name}!`);
          }).catch(err => {
            window.AegisOwner?.showToast(`Failed to ${endpoint} invitation: ${err.message}`, 'error');
          });
        } else {
          if (activeCandidate.status === 'expired') {
            activeCandidate.status = 'pending';
          }
          activeCandidate.sentDate = new Date().toLocaleDateString();
          activeCandidate.sentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          updateKPIsAndDonut();
          renderTable();
          if (resendInviteModal) {
            resendInviteModal.classList.remove('show', 'active');
            document.body.style.overflow = '';
          }
          window.AegisOwner?.showToast(endpoint === 'renew' ? `Invitation renewed for ${activeCandidate.name}!` : `Reminder sent to ${activeCandidate.name}!`);
        }
      });
    }
  }

  // =========================================================================
  // 8. Public API for In-Table Action Buttons
  // =========================================================================
  window.AegisInvitations = {
    openResendModal: openResendModal,
    openRenewModal: openRenewModal,
    openDetailsModal: openDetailsModal,
    openMoreOptions: openMoreOptions
  };

  // =========================================================================
  // 9. Startup Execution
  // =========================================================================
  document.addEventListener('DOMContentLoaded', function() {
    initEvents();
    if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
      window.AegisAPI.get('/owner/vaults/').then(vs => {
        const sel = document.getElementById('newInviteVault');
        if (sel) sel.innerHTML = vs.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
      }).catch(e=>{});

      window.AegisAPI.get('/owner/invitations/').then(data => {
        invitations = data.map(inv => ({
          id: inv.id,
          name: inv.invitee_name,
          email: inv.invitee_email,
          rel: inv.relationship,
          relClass: (inv.relationship || '').toLowerCase().replace(' ', '-'),
          vault: inv.vault_name,
          status: inv.status.toLowerCase(),
          sentDate: new Date(inv.sent_at).toLocaleDateString(),
          sentTime: new Date(inv.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: '../assets/images/trustee-avatar-1.png',
          avatarType: 'img',
          expiryDays: inv.expiry_days || 14,
          isRecent: true,
          note: inv.note || '',
          acceptedDate: inv.accepted_at ? new Date(inv.accepted_at).toLocaleString() : undefined
        }));
        updateKPIsAndDonut();
        renderTable();
      }).catch(err => {
        console.error('Failed to load invitations', err);
        updateKPIsAndDonut();
        renderTable();
      });
    } else {
      updateKPIsAndDonut();
      renderTable();
    }
  });

})();
