/**
 * AegisVault Owner Panel — Release Management Logic
 * Module 06: Dead-man switch triggers, inactivity timers, schedules & execution
 */

(function() {
  'use strict';

  // =========================================================================
  // 1. Initial Mock Dataset (Exact match to Dark & Light mockups)
  // =========================================================================
  let releases = [
    {
      id: 'rel-1',
      title: 'Family Memories',
      subtext: 'Photos & Videos',
      iconTheme: 'brown',
      iconType: 'camera',
      vault: 'Personal Vault',
      recipientType: 'single',
      recipientName: 'Sneha Mehta',
      recipientEmail: 'sneha.mehta@email.com',
      avatarType: 'img',
      avatar: '../assets/images/trustee-avatar-2.png',
      trigger: 'Upon Inactivity',
      triggerDetail: '(12 months)',
      status: 'scheduled',
      scheduledDate: '15 Sep 2025',
      scheduledTime: '10:00 AM',
      note: 'Releases childhood photo archive and family vacation recordings.'
    },
    {
      id: 'rel-2',
      title: 'Business Documents',
      subtext: 'Contracts & Files',
      iconTheme: 'blue',
      iconType: 'file-text',
      vault: 'Business Vault',
      recipientType: 'single',
      recipientName: 'Amit Kumar',
      recipientEmail: 'amit.kumar@email.com',
      avatarType: 'img',
      avatar: '../assets/images/trustee-avatar-1.png',
      trigger: 'Specific Date',
      triggerDetail: '(01 Jan 2026)',
      status: 'scheduled',
      scheduledDate: '01 Jan 2026',
      scheduledTime: '09:00 AM',
      note: 'Releases partnership deeds, cap table, and IP escrow keys.'
    },
    {
      id: 'rel-3',
      title: 'Medical Records',
      subtext: 'Health Documents',
      iconTheme: 'emerald',
      iconType: 'activity',
      vault: 'Health Vault',
      recipientType: 'single',
      recipientName: 'Priya Sharma',
      recipientEmail: 'priya.sharma@email.com',
      avatarType: 'img',
      avatar: '../assets/images/trustee-avatar-4.png',
      trigger: 'On Event',
      triggerDetail: '(Death Certificate)',
      status: 'in progress',
      scheduledDate: '-',
      scheduledTime: '',
      note: 'Pending verification of official health registry certificate.'
    },
    {
      id: 'rel-4',
      title: 'Travel Itinerary',
      subtext: 'Trips & Bookings',
      iconTheme: 'cyan',
      iconType: 'send',
      vault: 'Travel Vault',
      recipientType: 'single',
      recipientName: 'Vikram Shah',
      recipientEmail: 'vikram.shah@email.com',
      avatarType: 'initials',
      initials: 'VS',
      avatarClass: 'avatar-gradient-vs',
      trigger: 'Manual Release',
      triggerDetail: '',
      status: 'completed',
      scheduledDate: '20 Aug 2025',
      scheduledTime: '02:30 PM',
      note: 'Manual authorization executed by vault owner.'
    },
    {
      id: 'rel-5',
      title: 'Property Deeds',
      subtext: 'Legal Documents',
      iconTheme: 'slate',
      iconType: 'home',
      vault: 'Property Vault',
      recipientType: 'single',
      recipientName: 'Anita Desai',
      recipientEmail: 'anita.desai@email.com',
      avatarType: 'img',
      avatar: '../assets/images/trustee-avatar-6.png',
      trigger: 'Upon Inactivity',
      triggerDetail: '(6 months)',
      status: 'scheduled',
      scheduledDate: '10 Oct 2025',
      scheduledTime: '11:00 AM',
      note: 'Real estate registry copies and mortgage discharge certificates.'
    },
    {
      id: 'rel-6',
      title: 'Tax Records',
      subtext: 'Financial Files',
      iconTheme: 'orange',
      iconType: 'dollar-sign',
      vault: 'Financial Vault',
      recipientType: 'single',
      recipientName: 'Neeraj Singh',
      recipientEmail: 'neeraj.singh@email.com',
      avatarType: 'initials',
      initials: 'NS',
      avatarClass: 'avatar-gradient-ns',
      trigger: 'Specific Date',
      triggerDetail: '(31 Dec 2025)',
      status: 'cancelled',
      scheduledDate: '31 Dec 2025',
      scheduledTime: '09:00 AM',
      note: 'Cancelled by owner due to filing reorganization.'
    },
    {
      id: 'rel-7',
      title: 'Personal Notes',
      subtext: 'Letters & Notes',
      iconTheme: 'blue',
      iconType: 'edit-3',
      vault: 'Personal Vault',
      recipientType: 'single',
      recipientName: 'Karan Malhotra',
      recipientEmail: 'karan.malhotra@email.com',
      avatarType: 'img',
      avatar: '../assets/images/trustee-avatar-8.png',
      trigger: 'Manual Release',
      triggerDetail: '',
      status: 'completed',
      scheduledDate: '12 Aug 2025',
      scheduledTime: '05:15 PM',
      note: 'Private journal entries and confidential letters.'
    },
    {
      id: 'rel-8',
      title: 'Memories for Kids',
      subtext: 'Special Messages',
      iconTheme: 'crimson',
      iconType: 'gift',
      vault: 'Memories Vault',
      recipientType: 'multi',
      recipientName: '3 Recipients',
      recipientEmail: 'Sneha, Priya, Anita',
      multiAvatars: [
        '../assets/images/trustee-avatar-2.png',
        '../assets/images/trustee-avatar-4.png',
        '../assets/images/trustee-avatar-6.png'
      ],
      trigger: 'On Event',
      triggerDetail: '(Death Certificate)',
      status: 'in progress',
      scheduledDate: '-',
      scheduledTime: '',
      note: 'Time-capsule voice recordings and educational endowment directives.'
    }
  ];

  let activeReleaseItem = null;

  // =========================================================================
  // 2. DOM Elements
  // =========================================================================
  const tbody = document.getElementById('releasesTableTbody');
  const searchInput = document.getElementById('releaseSearchInput');
  const statusFilter = document.getElementById('statusFilterSelect');
  const vaultFilter = document.getElementById('vaultFilterSelect');
  const recipientFilter = document.getElementById('recipientFilterSelect');
  const btnMoreFilters = document.getElementById('btnMoreFilters');

  // KPI elements
  const statTotal = document.getElementById('statTotalReleases');
  const statScheduled = document.getElementById('statScheduledReleases');
  const statInProgress = document.getElementById('statInProgressReleases');
  const statCompleted = document.getElementById('statCompletedReleases');

  // Modals
  const createReleaseModal = document.getElementById('createReleaseModal');
  const formCreateRelease = document.getElementById('formCreateRelease');
  const btnOpenCreateRelease = document.getElementById('btnOpenCreateRelease');
  const btnQuickCreateSide = document.getElementById('btnQuickCreateSide');

  const viewReleaseModal = document.getElementById('viewReleaseModal');
  const viewReleaseModalTitle = document.getElementById('viewReleaseModalTitle');
  const viewReleaseModalBody = document.getElementById('viewReleaseModalBody');

  const editReleaseModal = document.getElementById('editReleaseModal');
  const formEditRelease = document.getElementById('formEditRelease');
  const editReleaseModalTitle = document.getElementById('editReleaseModalTitle');
  const editReleaseModalBody = document.getElementById('editReleaseModalBody');
  const btnCancelReleaseAction = document.getElementById('btnCancelReleaseAction');

  // =========================================================================
  // 3. Helper Render Functions
  // =========================================================================
  function getReleaseIcon(type) {
    if (type === 'camera') {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`;
    }
    if (type === 'file-text') {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
    }
    if (type === 'activity') {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`;
    }
    if (type === 'send') {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
    }
    if (type === 'home') {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
    }
    if (type === 'dollar-sign') {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
    }
    if (type === 'edit-3') {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;
    }
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`;
  }

  function getVaultIconSvg(vault) {
    if (vault.includes('Personal')) return `<svg class="vault-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
    if (vault.includes('Business')) return `<svg class="vault-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
    if (vault.includes('Health')) return `<svg class="vault-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
    if (vault.includes('Travel')) return `<svg class="vault-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/></svg>`;
    if (vault.includes('Property')) return `<svg class="vault-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;
    return `<svg class="vault-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/></svg>`;
  }

  function getStatusPill(status) {
    if (status === 'scheduled') {
      return `
        <span class="status-pill scheduled">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Scheduled
        </span>`;
    }
    if (status === 'in progress') {
      return `
        <span class="status-pill in-progress">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          In Progress
        </span>`;
    }
    if (status === 'completed') {
      return `
        <span class="status-pill completed">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Completed
        </span>`;
    }
    return `
      <span class="status-pill cancelled">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        Cancelled
      </span>`;
  }

  // =========================================================================
  // 4. Render Table
  // =========================================================================
  function renderTable() {
    if (!tbody) return;

    const searchTerm = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const statusVal = statusFilter ? statusFilter.value : 'all';
    const vaultVal = vaultFilter ? vaultFilter.value : 'all';
    const recipientVal = recipientFilter ? recipientFilter.value : 'all';

    const filtered = releases.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(searchTerm) ||
                          item.subtext.toLowerCase().includes(searchTerm) ||
                          item.vault.toLowerCase().includes(searchTerm) ||
                          item.recipientName.toLowerCase().includes(searchTerm) ||
                          item.status.toLowerCase().includes(searchTerm);
      
      const matchStatus = (statusVal === 'all') || (item.status.toLowerCase() === statusVal.toLowerCase());
      const matchVault = (vaultVal === 'all') || (item.vault.toLowerCase() === vaultVal.toLowerCase());
      const matchRecipient = (recipientVal === 'all') || (item.recipientName.toLowerCase().includes(recipientVal.toLowerCase()));

      return matchSearch && matchStatus && matchVault && matchRecipient;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 38px; height: 38px; margin: 0 auto 0.75rem; display: block; opacity: 0.6;">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            <span style="font-size: 0.95rem; font-weight: 600; display: block; margin-bottom: 0.25rem; color: var(--text-primary);">No releases match your query</span>
            <span style="font-size: 0.8rem;">Try clearing search or changing the filter options.</span>
          </td>
        </tr>`;
      return;
    }

    let html = '';
    filtered.forEach(item => {
      // Release Name & Icon
      const iconSvg = getReleaseIcon(item.iconType);
      const releaseHtml = `
        <div class="release-name-cell">
          <div class="release-icon-box ${item.iconTheme}">
            ${iconSvg}
          </div>
          <div class="release-meta-box">
            <span class="release-title-text">${item.title}</span>
            <span class="release-sub-text" title="${item.subtext}">${item.subtext}</span>
          </div>
        </div>`;

      // Vault Tag
      const vaultIconSvg = getVaultIconSvg(item.vault);
      const vaultHtml = `
        <a href="../my-vaults/my-vaults.html" class="vault-tag-box" title="View ${item.vault}">
          ${vaultIconSvg}
          <span>${item.vault}</span>
        </a>`;

      // Recipient(s)
      let recipientHtml = '';
      if (item.recipientType === 'multi') {
        recipientHtml = `
          <div class="recipient-cell-content">
            <div class="stacked-avatars-wrap">
              <div class="stacked-avatar" style="background-image: url('${item.multiAvatars[0]}');"></div>
              <div class="stacked-avatar" style="background-image: url('${item.multiAvatars[1]}');"></div>
              <span class="stacked-badge">+2</span>
            </div>
            <div class="recipient-meta-box">
              <span class="recipient-name-text">${item.recipientName}</span>
              <span class="recipient-email-text" title="${item.recipientEmail}">${item.recipientEmail}</span>
            </div>
          </div>`;
      } else {
        let avatarHtml = '';
        if (item.avatarType === 'img') {
          avatarHtml = `<div class="recipient-avatar-img" style="background-image: url('${item.avatar}');"></div>`;
        } else {
          avatarHtml = `<div class="recipient-avatar-initials ${item.avatarClass || ''}">${item.initials}</div>`;
        }
        recipientHtml = `
          <div class="recipient-cell-content">
            ${avatarHtml}
            <div class="recipient-meta-box">
              <span class="recipient-name-text">${item.recipientName}</span>
              <span class="recipient-email-text" title="${item.recipientEmail}">${item.recipientEmail}</span>
            </div>
          </div>`;
      }

      // Trigger condition
      const triggerHtml = `
        <div>
          <span class="trigger-condition-text">${item.trigger}</span>
          ${item.triggerDetail ? `<span class="trigger-sub-text">${item.triggerDetail}</span>` : ''}
        </div>`;

      // Status
      const statusHtml = getStatusPill(item.status);

      // Scheduled On
      const schedHtml = item.scheduledDate === '-' ? '<span style="color: var(--text-muted);">-</span>' : `
        <div class="sched-date-box">
          <span class="sched-primary">${item.scheduledDate}</span>
          <span class="sched-sub">${item.scheduledTime}</span>
        </div>`;

      // Actions cell with 3 buttons
      const actionsHtml = `
        <div class="release-actions-cell">
          <button class="btn-action-icon" onclick="window.AegisReleases.openViewModal('${item.id}')" title="View Release Details">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="btn-action-icon" onclick="window.AegisReleases.openEditModal('${item.id}')" title="Edit Release">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-action-icon more-dots" onclick="window.AegisReleases.openMoreOptions('${item.id}')" title="More Options">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/></svg>
          </button>
        </div>`;

      html += `
        <tr data-id="${item.id}">
          <td>${releaseHtml}</td>
          <td>${vaultHtml}</td>
          <td>${recipientHtml}</td>
          <td>${triggerHtml}</td>
          <td>${statusHtml}</td>
          <td>${schedHtml}</td>
          <td>${actionsHtml}</td>
        </tr>`;
    });

    tbody.innerHTML = html;
  }

  // =========================================================================
  // 5. Update KPI Metrics & Donut Chart
  // =========================================================================
  function updateKPIsAndDonut() {
    const total = releases.length;
    const scheduled = releases.filter(r => r.status === 'scheduled').length;
    const inProgress = releases.filter(r => r.status === 'in progress').length;
    const completed = releases.filter(r => r.status === 'completed').length;
    const cancelled = releases.filter(r => r.status === 'cancelled').length;

    if (statTotal) statTotal.textContent = total;
    if (statScheduled) statScheduled.textContent = scheduled;
    if (statInProgress) statInProgress.textContent = inProgress;
    if (statCompleted) statCompleted.textContent = completed;

    // SVG Donut Chart Update
    const circumference = 2 * Math.PI * 46; // ~289.02px
    const donutCenterNum = document.querySelector('.donut-center-num');
    if (donutCenterNum) donutCenterNum.textContent = total;

    const segSched = document.querySelector('.donut-seg.scheduled');
    const segProg = document.querySelector('.donut-seg.in-progress');
    const segComp = document.querySelector('.donut-seg.completed');
    const segCanc = document.querySelector('.donut-seg.cancelled');

    if (total > 0 && segSched && segProg && segComp && segCanc) {
      const lenSched = (scheduled / total) * circumference;
      const lenProg = (inProgress / total) * circumference;
      const lenComp = (completed / total) * circumference;
      const lenCanc = (cancelled / total) * circumference;

      segSched.setAttribute('stroke-dasharray', `${lenSched.toFixed(1)} ${circumference.toFixed(1)}`);
      segSched.setAttribute('stroke-dashoffset', '0');

      segProg.setAttribute('stroke-dasharray', `${lenProg.toFixed(1)} ${circumference.toFixed(1)}`);
      segProg.setAttribute('stroke-dashoffset', `-${lenSched.toFixed(1)}`);

      const offComp = lenSched + lenProg;
      segComp.setAttribute('stroke-dasharray', `${lenComp.toFixed(1)} ${circumference.toFixed(1)}`);
      segComp.setAttribute('stroke-dashoffset', `-${offComp.toFixed(1)}`);

      const offCanc = offComp + lenComp;
      segCanc.setAttribute('stroke-dasharray', `${lenCanc.toFixed(1)} ${circumference.toFixed(1)}`);
      segCanc.setAttribute('stroke-dashoffset', `-${offCanc.toFixed(1)}`);
    }
  }

  // =========================================================================
  // 6. Modal Functions
  // =========================================================================
  function openCreateModal() {
    if (formCreateRelease) formCreateRelease.reset();
    if (createReleaseModal) {
      createReleaseModal.classList.add('show', 'active');
      document.body.style.overflow = 'hidden';
    }
  }

  function openViewModal(id) {
    const item = releases.find(r => r.id === id);
    if (!item) return;

    if (viewReleaseModalTitle) {
      viewReleaseModalTitle.textContent = `${item.title} — Release Overview`;
    }

    if (viewReleaseModalBody) {
      viewReleaseModalBody.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-subtle);">
          <div class="release-icon-box ${item.iconTheme}" style="width: 44px; height: 44px;">
            ${getReleaseIcon(item.iconType)}
          </div>
          <div>
            <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0;">${item.title}</h4>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${item.vault} &bull; ${item.subtext}</span>
          </div>
          <div style="margin-left: auto;">
            ${getStatusPill(item.status)}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
          <div style="background: var(--bg-surface); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 0.35rem;">Trigger Condition</span>
            <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary);">${item.trigger} ${item.triggerDetail}</span>
          </div>
          <div style="background: var(--bg-surface); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 0.35rem;">Recipient(s)</span>
            <span style="font-size: 0.88rem; font-weight: 700; color: #38bdf8;">${item.recipientName}</span>
          </div>
          <div style="background: var(--bg-surface); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 0.35rem;">Scheduled Timeline</span>
            <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${item.scheduledDate} ${item.scheduledTime}</span>
          </div>
          <div style="background: var(--bg-surface); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 0.35rem;">Cryptographic Payload</span>
            <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">AES-256 GCM Escrow</span>
          </div>
        </div>

        ${item.note ? `
          <div style="margin-bottom: 1rem;">
            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 0.35rem;">Directives</span>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; background: var(--bg-surface); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin: 0;">
              &ldquo;${item.note}&rdquo;
            </p>
          </div>` : ''}

        <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle);">
          <span>Release Token: <code style="color: var(--brand-orange); font-family: monospace;">REL-TOKEN-${item.id.toUpperCase()}</code></span>
          <span>Status: <strong style="color: var(--text-primary); text-transform: capitalize;">${item.status}</strong></span>
        </div>`;
    }

    if (viewReleaseModal) {
      viewReleaseModal.classList.add('show', 'active');
      document.body.style.overflow = 'hidden';
    }
  }

  function openEditModal(id) {
    const item = releases.find(r => r.id === id);
    if (!item) return;
    activeReleaseItem = item;

    if (editReleaseModalTitle) {
      editReleaseModalTitle.textContent = `Configure Release: ${item.title}`;
    }

    if (editReleaseModalBody) {
      editReleaseModalBody.innerHTML = `
        <div style="margin-bottom: 1.15rem;">
          <label style="display:block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text-primary);">Release Title</label>
          <input type="text" id="editReleaseTitleInput" value="${item.title}" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-md); background: var(--bg-input); border: 1px solid var(--bg-input-border); color: var(--text-primary);">
        </div>

        <div style="margin-bottom: 1.15rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label style="display:block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text-primary);">Status</label>
            <select id="editReleaseStatusSelect" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-md); background: var(--bg-input); border: 1px solid var(--bg-input-border); color: var(--text-primary);">
              <option value="scheduled" ${item.status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
              <option value="in progress" ${item.status === 'in progress' ? 'selected' : ''}>In Progress</option>
              <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Completed</option>
              <option value="cancelled" ${item.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text-primary);">Scheduled Execution</label>
            <input type="text" id="editReleaseScheduleInput" value="${item.scheduledDate} ${item.scheduledTime}" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-md); background: var(--bg-input); border: 1px solid var(--bg-input-border); color: var(--text-primary);">
          </div>
        </div>

        <div>
          <label style="display:block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text-primary);">Directives Note</label>
          <textarea id="editReleaseNoteTextarea" rows="2" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: var(--radius-md); background: var(--bg-input); border: 1px solid var(--bg-input-border); color: var(--text-primary); resize: none;">${item.note || ''}</textarea>
        </div>`;
    }

    if (editReleaseModal) {
      editReleaseModal.classList.add('show', 'active');
      document.body.style.overflow = 'hidden';
    }
  }

  function openMoreOptions(id) {
    const item = releases.find(r => r.id === id);
    if (!item) return;
  // Floating Context Menu for Releases
  let activeReleaseMenu = null;

  function closeReleaseMenu() {
    if (activeReleaseMenu) {
      activeReleaseMenu.remove();
      activeReleaseMenu = null;
    }
  }

  document.addEventListener('click', closeReleaseMenu);

  function openMoreOptions(id) {
    const item = releases.find(r => r.id === id);
    if (!item) return;

    closeReleaseMenu();

    const anchorEl = document.querySelector(`[data-action="more"][data-id="${id}"]`);
    if (!anchorEl) return;

    const menu = document.createElement('div');
    menu.className = 'dropdown-panel';
    menu.style.position = 'fixed';
    menu.style.zIndex = '9999';
    menu.style.minWidth = '210px';
    menu.style.boxShadow = 'var(--shadow-dropdown)';

    const isCancelled = item.status === 'cancelled';

    menu.innerHTML = `
      <div class="dropdown-header">${item.title}</div>
      <button class="dropdown-item" data-action="view" style="width:100%; border:none; background:none; text-align:left; cursor:pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        <span>View Details</span>
      </button>
      <button class="dropdown-item" data-action="edit" style="width:100%; border:none; background:none; text-align:left; cursor:pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        <span>Edit Parameters</span>
      </button>
      <button class="dropdown-item" data-action="test" style="width:100%; border:none; background:none; text-align:left; cursor:pointer;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span>Simulate Trigger Ping</span>
      </button>
      <div class="dropdown-divider"></div>
      <button class="dropdown-item" data-action="toggle-status" style="width:100%; border:none; background:none; text-align:left; cursor:pointer; color:var(--status-danger);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        <span>${isCancelled ? 'Resume Schedule' : 'Cancel Release'}</span>
      </button>
    `;

    const rect = anchorEl.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.left = `${Math.min(window.innerWidth - 230, rect.left - 160)}px`;

    menu.querySelector('[data-action="view"]').addEventListener('click', () => {
      closeReleaseMenu();
      openDetailsModal(id);
    });

    menu.querySelector('[data-action="edit"]').addEventListener('click', () => {
      closeReleaseMenu();
      openEditModal(id);
    });

    menu.querySelector('[data-action="test"]').addEventListener('click', () => {
      closeReleaseMenu();
      window.AegisOwner?.showToast(`Dead-man heartbeat test dispatched for "${item.title}". Ping received: OK!`, 'success');
    });

    menu.querySelector('[data-action="toggle-status"]').addEventListener('click', () => {
      closeReleaseMenu();
      if (item.status === 'cancelled') {
        item.status = 'scheduled';
        window.AegisOwner?.showToast(`Release "${item.title}" resumed as scheduled.`, 'success');
      } else {
        item.status = 'cancelled';
        window.AegisOwner?.showToast(`Release "${item.title}" has been cancelled.`, 'warning');
      }
      renderTable();
    });

    document.body.appendChild(menu);
    activeReleaseMenu = menu;
  }

  // =========================================================================
  // 7. Event Listeners Initialization
  // =========================================================================
  function initEvents() {
    // Check URL query parameters (e.g. ?status=scheduled or ?vault=Personal%20Vault or ?filter=...)
    const urlParams = new URLSearchParams(window.location.search);
    const initialStatus = urlParams.get('status') || urlParams.get('filter');
    const initialVault = urlParams.get('vault');

    if (initialStatus && statusFilter) {
      const matchOpt = Array.from(statusFilter.options).find(o => o.value.toLowerCase() === initialStatus.toLowerCase());
      if (matchOpt) statusFilter.value = matchOpt.value;
    }
    if (initialVault && vaultFilter) {
      vaultFilter.value = initialVault;
    }

    if (searchInput) searchInput.addEventListener('input', renderTable);
    if (statusFilter) statusFilter.addEventListener('change', renderTable);
    if (vaultFilter) vaultFilter.addEventListener('change', renderTable);
    if (recipientFilter) recipientFilter.addEventListener('change', renderTable);

    // 4 KPI Metric Cards Interactive Filtering
    const metricCards = document.querySelectorAll('.metrics-row .metric-card');
    metricCards.forEach((card, index) => {
      card.style.cursor = 'pointer';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.title = 'Click to filter releases';

      card.addEventListener('click', () => {
        if (index === 0) {
          // Total -> Reset
          if (statusFilter) statusFilter.value = 'all';
          if (vaultFilter) vaultFilter.value = 'all';
          if (recipientFilter) recipientFilter.value = 'all';
          if (searchInput) searchInput.value = '';
          renderTable();
          window.AegisOwner?.showToast('Showing all releases');
        } else if (index === 1) {
          if (statusFilter) statusFilter.value = 'scheduled';
          renderTable();
          window.AegisOwner?.showToast('Filtered: Scheduled Releases');
        } else if (index === 2) {
          if (statusFilter) statusFilter.value = 'in progress';
          renderTable();
          window.AegisOwner?.showToast('Filtered: In Progress Releases');
        } else if (index === 3) {
          if (statusFilter) statusFilter.value = 'completed';
          renderTable();
          window.AegisOwner?.showToast('Filtered: Completed Releases');
        }
      });
    });

    // Donut Legend Interactive Filter
    document.querySelectorAll('.donut-legend .legend-row').forEach(row => {
      row.style.cursor = 'pointer';
      row.title = 'Click to filter by status';
      row.addEventListener('click', () => {
        const text = row.textContent.toLowerCase();
        if (text.includes('scheduled') && statusFilter) {
          statusFilter.value = 'scheduled';
        } else if (text.includes('in progress') && statusFilter) {
          statusFilter.value = 'in progress';
        } else if (text.includes('completed') && statusFilter) {
          statusFilter.value = 'completed';
        } else if (text.includes('cancelled') && statusFilter) {
          statusFilter.value = 'cancelled';
        }
        renderTable();
        window.AegisOwner?.showToast(`Filtered releases: ${row.querySelector('.legend-label')?.textContent || ''}`);
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
          btnMoreFilters.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"/></svg> Urgent Only`;
          if (statusFilter) statusFilter.value = 'in progress';
          renderTable();
          window.AegisOwner?.showToast('Advanced Filter: Releases in Progress with Active Dead-Man Ping');
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

    if (btnOpenCreateRelease) btnOpenCreateRelease.addEventListener('click', openCreateModal);
    if (btnQuickCreateSide) btnQuickCreateSide.addEventListener('click', openCreateModal);

    const btnQuickReset = document.getElementById('btnQuickResetReleases');
    if (btnQuickReset) {
      btnQuickReset.addEventListener('click', (e) => {
        e.preventDefault();
        if (statusFilter) statusFilter.value = 'all';
        if (vaultFilter) vaultFilter.value = 'all';
        if (recipientFilter) recipientFilter.value = 'all';
        if (searchInput) searchInput.value = '';
        renderTable();
        window.AegisOwner?.showToast('All release filters reset. Showing all releases.', 'success');
      });
    }

    // Form Submit (Create Release)
    if (formCreateRelease) {
      formCreateRelease.addEventListener('submit', function(e) {
        e.preventDefault();

        const titleInput = document.getElementById('releaseTitle');
        const vaultSelect = document.getElementById('releaseVaultSelect');
        const recipientSelect = document.getElementById('releaseRecipientSelect');
        const triggerSelect = document.getElementById('releaseTriggerType');
        const schedInput = document.getElementById('releaseScheduledDate');
        const noteInput = document.getElementById('releaseNote');

        const title = titleInput ? titleInput.value.trim() : 'Digital Legacy Release';
        const vault = vaultSelect ? vaultSelect.value : 'Personal Vault';
        const recipient = recipientSelect ? recipientSelect.value : 'Sneha Mehta';
        const trigger = triggerSelect ? triggerSelect.value : 'Upon Inactivity (12 months)';
        const sched = schedInput ? schedInput.value.trim() : '15 Sep 2025 10:00 AM';
        const note = noteInput ? noteInput.value.trim() : '';

        const newId = 'rel-' + Date.now();
        const schedParts = sched.split(' ');
        const sDate = schedParts.slice(0, 3).join(' ') || '15 Sep 2025';
        const sTime = schedParts.slice(3).join(' ') || '10:00 AM';

        const newRelease = {
          id: newId,
          title: title,
          subtext: 'Encrypted Release Workflow',
          iconTheme: 'blue',
          iconType: 'file-text',
          vault: vault,
          recipientType: 'single',
          recipientName: recipient,
          recipientEmail: `${recipient.toLowerCase().replace(/\s+/g, '.')}@email.com`,
          avatarType: 'img',
          avatar: '../assets/images/trustee-avatar-2.png',
          trigger: trigger.split('(')[0].trim(),
          triggerDetail: trigger.includes('(') ? '(' + trigger.split('(')[1] : '',
          status: 'scheduled',
          scheduledDate: sDate,
          scheduledTime: sTime,
          note: note
        };

        // TODO: Replace with fetch('/api/v1/owner/releases', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(newRelease)
        // })

        releases.unshift(newRelease);
        updateKPIsAndDonut();
        renderTable();

        if (createReleaseModal) createReleaseModal.classList.remove('show', 'active');
        document.body.style.overflow = '';
        if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') {
          window.AegisOwner.showToast(`Release workflow "${title}" scheduled successfully!`);
        }
      });
    }

    // Form Submit (Edit Release)
    if (formEditRelease) {
      formEditRelease.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!activeReleaseItem) return;

        const titleInput = document.getElementById('editReleaseTitleInput');
        const statusSelect = document.getElementById('editReleaseStatusSelect');
        const schedInput = document.getElementById('editReleaseScheduleInput');
        const noteText = document.getElementById('editReleaseNoteTextarea');

        if (titleInput) activeReleaseItem.title = titleInput.value.trim();
        if (statusSelect) activeReleaseItem.status = statusSelect.value;
        if (schedInput) {
          const parts = schedInput.value.trim().split(' ');
          activeReleaseItem.scheduledDate = parts.slice(0, 3).join(' ') || '-';
          activeReleaseItem.scheduledTime = parts.slice(3).join(' ') || '';
        }
        if (noteText) activeReleaseItem.note = noteText.value.trim();

        // TODO: Replace with fetch('/api/v1/owner/releases/' + activeReleaseItem.id, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(activeReleaseItem)
        // })

        updateKPIsAndDonut();
        renderTable();

        if (editReleaseModal) editReleaseModal.classList.remove('show', 'active');
        document.body.style.overflow = '';
        if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') {
          window.AegisOwner.showToast(`Release parameters updated for "${activeReleaseItem.title}".`);
        }
      });
    }

    // Cancel Release Action Button
    if (btnCancelReleaseAction) {
      btnCancelReleaseAction.addEventListener('click', function() {
        if (!activeReleaseItem) return;

        // TODO: Replace with fetch('/api/v1/owner/releases/' + activeReleaseItem.id + '/cancel', { method: 'POST' })
        activeReleaseItem.status = 'cancelled';
        updateKPIsAndDonut();
        renderTable();

        if (editReleaseModal) editReleaseModal.classList.remove('show', 'active');
        document.body.style.overflow = '';
        if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') {
          window.AegisOwner.showToast(`Release "${activeReleaseItem.title}" has been cancelled.`, 'warning');
        }
      });
    }
  }

  // =========================================================================
  // 8. Public API
  // =========================================================================
  window.AegisReleases = {
    openViewModal: openViewModal,
    openEditModal: openEditModal,
    openMoreOptions: openMoreOptions
  };

  // =========================================================================
  // 9. Startup Execution
  // =========================================================================
  document.addEventListener('DOMContentLoaded', function() {
    initEvents();
    updateKPIsAndDonut();
    renderTable();
  });

})();
