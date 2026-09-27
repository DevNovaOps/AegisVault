/**
 * AegisVault Owner Panel — Dashboard Logic
 * Module 01: Interactive Charts, Search Filtering, Quick Action Modals & Mock Persistence
 */

(function () {
  'use strict';

  // =========================================================================
  // MOCK DATA STORAGE (Simulating Backend API Responses)
  // TODO: Replace with fetch('/api/v1/owner/dashboard/...') upon backend connection
  // =========================================================================

  const mockChartData = {
    '6m': [
      { month: 'Apr', active: 2, shares: 1, trustees: 1 },
      { month: 'May', active: 3, shares: 3, trustees: 2 },
      { month: 'Jun', active: 4, shares: 3, trustees: 2 },
      { month: 'Jul', active: 5, shares: 4, trustees: 3 },
      { month: 'Aug', active: 6, shares: 5, trustees: 4 },
      { month: 'Sep', active: 8, shares: 8, trustees: 6 }
    ],
    '30d': [
      { month: 'W1', active: 5, shares: 5, trustees: 4 },
      { month: 'W2', active: 6, shares: 6, trustees: 5 },
      { month: 'W3', active: 7, shares: 7, trustees: 5 },
      { month: 'W4', active: 8, shares: 8, trustees: 6 }
    ],
    'ytd': [
      { month: 'Jan', active: 1, shares: 0, trustees: 0 },
      { month: 'Mar', active: 2, shares: 1, trustees: 1 },
      { month: 'May', active: 3, shares: 3, trustees: 2 },
      { month: 'Jul', active: 5, shares: 4, trustees: 3 },
      { month: 'Sep', active: 8, shares: 8, trustees: 6 }
    ]
  };

  const mockReleaseStatus = {
    total: 6,
    segments: [
      { label: 'Completed', count: 2, color: '#10b981', key: 'completed' },
      { label: 'In Progress', count: 1, color: '#0284c7', key: 'in_progress' },
      { label: 'Scheduled', count: 2, color: '#f59e0b', key: 'scheduled' },
      { label: 'Not Started', count: 1, color: '#ef4444', key: 'not_started' }
    ]
  };

  const mockUpcomingEvents = [
    {
      id: 'evt-1',
      day: '15',
      month: 'Sep',
      title: 'Health Check Reminder',
      vault: 'Personal Vault',
      dotColor: '#0284c7',
      countdown: 'In 5 days',
      pillType: 'blue',
      isWarm: false,
      description: 'Scheduled automated ping check-in. If unacknowledged within 14 days, pre-release notifications commence.'
    },
    {
      id: 'evt-2',
      day: '22',
      month: 'Sep',
      title: 'Release Review',
      vault: 'Family Vault',
      dotColor: '#ef4444',
      countdown: 'In 12 days',
      pillType: 'orange',
      isWarm: true,
      description: 'Family Vault grace period check. Confirm quorum verification status from designated trustees.'
    },
    {
      id: 'evt-3',
      day: '10',
      month: 'Oct',
      title: 'Trustee Re-verification',
      vault: 'Business Vault',
      dotColor: '#0284c7',
      countdown: 'In 30 days',
      pillType: 'blue',
      isWarm: true,
      description: 'Bi-annual cryptographic key rollover and KYC liveness re-verification for corporate trustees.'
    },
    {
      id: 'evt-4',
      day: '25',
      month: 'Oct',
      title: 'Scheduled Release Check',
      vault: 'Legacy Vault',
      dotColor: '#f59e0b',
      countdown: 'In 45 days',
      pillType: 'orange',
      isWarm: true,
      description: 'Estate planning distribution rehearsal. All Shamir shards verified for mathematical integrity.'
    }
  ];

  const mockRecentActivity = [
    {
      id: 'act-1',
      date: '12 Sep 2025, 10:24 AM',
      action: 'Trustee Invited',
      actionColor: 'purple',
      actionIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
      vault: 'Family Vault',
      details: 'Invitation sent to sneha.mehta@email.com'
    },
    {
      id: 'act-2',
      date: '11 Sep 2025, 04:18 PM',
      action: 'Share Submitted',
      actionColor: 'green',
      actionIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>',
      vault: 'Personal Vault',
      details: 'Trustee share received from Amit Kumar'
    },
    {
      id: 'act-3',
      date: '10 Sep 2025, 09:12 AM',
      action: 'Vault Updated',
      actionColor: 'blue',
      actionIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
      vault: 'Business Vault',
      details: 'Updated release conditions'
    },
    {
      id: 'act-4',
      date: '08 Sep 2025, 02:36 PM',
      action: 'Trustee Verified',
      actionColor: 'amber',
      actionIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>',
      vault: 'Legacy Vault',
      details: 'Vikram Shah completed verification'
    },
    {
      id: 'act-5',
      date: '05 Sep 2025, 11:09 AM',
      action: 'Release Request',
      actionColor: 'red',
      actionIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
      vault: 'Personal Vault',
      details: 'Release request initiated'
    }
  ];

  const mockVaultHealth = [
    {
      name: 'Personal Vault',
      mode: 'Active',
      avatarColor: 'blue',
      avatarSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      status: 'Healthy',
      badgeClass: 'badge-success',
      details: 'Encryption: AES-256-GCM. Quorum: 3 of 3 shares active. Inactivity ping: 42 days remaining.'
    },
    {
      name: 'Family Vault',
      mode: 'Active',
      avatarColor: 'amber',
      avatarSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      status: 'Healthy',
      badgeClass: 'badge-success',
      details: 'Encryption: ChaCha20-Poly1305. Quorum: 2 of 2 shares verified. Beneficiaries configured: 3.'
    },
    {
      name: 'Business Vault',
      mode: 'Active',
      avatarColor: 'purple',
      avatarSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
      status: 'Attention',
      badgeClass: 'badge-warning',
      details: 'One corporate trustee KYC certificate expires in 30 days. Action required to maintain full quorum.'
    },
    {
      name: 'Legacy Vault',
      mode: 'Scheduled',
      avatarColor: 'blue',
      avatarSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
      status: 'Healthy',
      badgeClass: 'badge-success',
      details: 'Release scheduled upon legal milestone verification. Cryptographic test reconstructed successfully.'
    },
    {
      name: 'Health Vault',
      mode: 'Active',
      avatarColor: 'teal',
      avatarSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      status: 'Healthy',
      badgeClass: 'badge-success',
      details: 'Emergency medical directives accessible via 1-of-2 quick consensus protocol.'
    }
  ];

  // =========================================================================
  // RENDER CONTROLLERS
  // =========================================================================

  // 1. Render Interactive Bar Chart
  function renderBarChart(range = '6m') {
    const data = mockChartData[range] || mockChartData['6m'];
    const container = document.getElementById('chartBarsWrap');
    if (!container) return;

    container.innerHTML = '';
    const maxVal = 10; // Y-axis max

    data.forEach(item => {
      const group = document.createElement('div');
      group.className = 'chart-group';

      const barSet = document.createElement('div');
      barSet.className = 'bar-set';

      // Bar 1: Active Vaults
      const hActive = Math.round((item.active / maxVal) * 100);
      const b1 = document.createElement('div');
      b1.className = 'chart-bar bar-blue';
      b1.style.height = `${hActive}%`;
      b1.setAttribute('data-tip', `${item.month} • Active: ${item.active}`);

      // Bar 2: Shares Submitted
      const hShares = Math.round((item.shares / maxVal) * 100);
      const b2 = document.createElement('div');
      b2.className = 'chart-bar bar-amber';
      b2.style.height = `${hShares}%`;
      b2.setAttribute('data-tip', `${item.month} • Shares: ${item.shares}`);

      // Bar 3: Trustees Assigned
      const hTrustees = Math.round((item.trustees / maxVal) * 100);
      const b3 = document.createElement('div');
      b3.className = 'chart-bar bar-green';
      b3.style.height = `${hTrustees}%`;
      b3.setAttribute('data-tip', `${item.month} • Trustees: ${item.trustees}`);

      barSet.appendChild(b1);
      barSet.appendChild(b2);
      barSet.appendChild(b3);

      const label = document.createElement('div');
      label.className = 'chart-x-label';
      label.textContent = item.month;

      group.appendChild(barSet);
      group.appendChild(label);
      container.appendChild(group);
    });

    bindBarTooltips();
  }

  function bindBarTooltips() {
    const tooltip = document.getElementById('chartTooltip');
    const bars = document.querySelectorAll('.chart-bar');

    bars.forEach(bar => {
      bar.addEventListener('mouseenter', (e) => {
        if (!tooltip) return;
        tooltip.textContent = bar.getAttribute('data-tip');
        tooltip.style.display = 'block';

        const rect = bar.getBoundingClientRect();
        const parentRect = bar.closest('.chart-canvas-area').getBoundingClientRect();
        const left = rect.left - parentRect.left + (rect.width / 2);
        const top = rect.top - parentRect.top;

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
      });

      bar.addEventListener('mouseleave', () => {
        if (tooltip) tooltip.style.display = 'none';
      });
    });
  }

  // 2. Render SVG Donut Chart
  function renderDonutChart() {
    const svg = document.getElementById('donutSvg');
    if (!svg) return;

    const segments = mockReleaseStatus.segments;
    const total = mockReleaseStatus.total;
    const radius = 54;
    const circumference = 2 * Math.PI * radius; // ~339.29

    let accumulatedAngle = 0;
    svg.innerHTML = '';

    segments.forEach((seg, idx) => {
      const percentage = seg.count / total;
      const strokeLength = percentage * circumference;
      const gapLength = circumference - strokeLength;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('class', 'donut-segment');
      circle.setAttribute('cx', '75');
      circle.setAttribute('cy', '75');
      circle.setAttribute('r', radius);
      circle.setAttribute('stroke', seg.color);
      circle.setAttribute('stroke-dasharray', `${strokeLength} ${gapLength}`);
      circle.setAttribute('stroke-dashoffset', -accumulatedAngle);

      circle.addEventListener('mouseenter', () => {
        window.AegisOwner.showToast(`Release Status: ${seg.label} (${seg.count} Vaults)`);
      });

      svg.appendChild(circle);
      accumulatedAngle += strokeLength;
    });
  }

  // 3. Render Upcoming Events
  function renderUpcomingEvents() {
    const list = document.getElementById('upcomingEventsList');
    if (!list) return;

    list.innerHTML = '';
    mockUpcomingEvents.forEach(evt => {
      const item = document.createElement('div');
      item.className = 'event-item';
      item.innerHTML = `
        <div class="event-left">
          <div class="event-date-chip ${evt.isWarm ? 'warm' : ''}">
            <span class="chip-day">${evt.day}</span>
            <span class="chip-month">${evt.month}</span>
          </div>
          <div class="event-details">
            <span class="event-title">${evt.title}</span>
            <span class="event-vault">
              <span class="status-dot" style="background-color: ${evt.dotColor}"></span>
              ${evt.vault}
            </span>
          </div>
        </div>
        <div class="event-countdown-pill ${evt.pillType}">${evt.countdown}</div>
      `;

      item.addEventListener('click', () => {
        openEventModal(evt);
      });

      list.appendChild(item);
    });
  }

  // 4. Render Recent Activity Table
  function renderRecentActivity(filterQuery = '') {
    const tbody = document.getElementById('recentActivityTbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const query = filterQuery.toLowerCase().trim();

    const filtered = mockRecentActivity.filter(act => {
      if (!query) return true;
      return (
        act.action.toLowerCase().includes(query) ||
        act.vault.toLowerCase().includes(query) ||
        act.details.toLowerCase().includes(query)
      );
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            No activity matches "${filterQuery}"
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(act => {
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.title = 'Click to inspect audit event';
      tr.innerHTML = `
        <td class="table-date">${act.date}</td>
        <td>
          <span class="action-pill">
            <span class="action-icon-circle ${act.actionColor}">
              ${act.actionIcon}
            </span>
            ${act.action}
          </span>
        </td>
        <td><a href="../my-vaults/my-vaults.html" class="table-vault-link">${act.vault}</a></td>
        <td class="table-details" title="${act.details}">${act.details}</td>
      `;

      tr.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        const modalTitle = document.getElementById('eventModalTitle');
        const modalContent = document.getElementById('eventModalBody');
        if (modalTitle && modalContent) {
          modalTitle.textContent = `${act.action} — Audit Event`;
          modalContent.innerHTML = `
            <div style="display:flex; gap:1rem; align-items:center; margin-bottom:1.25rem;">
              <span class="action-icon-circle ${act.actionColor}" style="width:40px; height:40px; display:inline-flex; align-items:center; justify-content:center; border-radius:50%;">
                ${act.actionIcon}
              </span>
              <div>
                <div style="font-weight:700; font-size:1.1rem; color:var(--text-primary);">${act.action}</div>
                <div style="color:var(--text-muted); font-size:0.85rem;">Vault: <strong style="color:var(--status-info);">${act.vault}</strong> &bull; ${act.date}</div>
              </div>
            </div>
            <div style="background-color:var(--bg-card-elevated); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-card); margin-bottom:1rem;">
              <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.5;">${act.details}</p>
            </div>
            <div style="font-size:0.8rem; color:var(--text-muted);">
              Cryptographic Signature: <code>0x8f2a...c491</code> &bull; Status: <strong style="color:var(--status-success);">&check; Logged &amp; Immutable</strong>
            </div>
          `;
          window.AegisOwner.openModal('eventDetailModal');
        }
      });

      tbody.appendChild(tr);
    });
  }

  // 5. Render Vault Health List
  function renderVaultHealth(filterQuery = '') {
    const list = document.getElementById('vaultHealthList');
    if (!list) return;

    list.innerHTML = '';
    const query = filterQuery.toLowerCase().trim();
    const filtered = mockVaultHealth.filter(v => {
      if (!query) return true;
      return (
        v.name.toLowerCase().includes(query) ||
        v.mode.toLowerCase().includes(query) ||
        v.status.toLowerCase().includes(query)
      );
    });

    if (filtered.length === 0) {
      list.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          No vaults match "${filterQuery}"
        </div>
      `;
      return;
    }

    filtered.forEach(v => {
      const item = document.createElement('div');
      item.className = 'health-item';
      item.title = `Click to inspect ${v.name} health audit`;
      item.innerHTML = `
        <div class="health-item-left">
          <div class="health-avatar ${v.avatarColor}">
            ${v.avatarSvg}
          </div>
          <div class="health-item-texts">
            <span class="health-item-title">${v.name}</span>
            <span class="health-item-sub">
              <span class="status-dot success"></span>
              ${v.mode}
            </span>
          </div>
        </div>
        <div class="health-item-right">
          <span class="badge ${v.badgeClass}">${v.status === 'Healthy' ? '&check; Healthy' : '&#9888; Attention'}</span>
          <svg class="health-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      `;

      item.addEventListener('click', () => {
        openHealthModal(v);
      });

      list.appendChild(item);
    });
  }

  // =========================================================================
  // MODAL HANDLERS
  // =========================================================================

  function openEventModal(evt) {
    const modalTitle = document.getElementById('eventModalTitle');
    const modalContent = document.getElementById('eventModalBody');
    if (modalTitle && modalContent) {
      modalTitle.textContent = evt.title;
      modalContent.innerHTML = `
        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.25rem;">
          <div class="event-date-chip ${evt.isWarm ? 'warm' : ''}" style="width: 52px; height: 52px;">
            <span class="chip-day" style="font-size: 1.2rem;">${evt.day}</span>
            <span class="chip-month">${evt.month}</span>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary);">${evt.title}</div>
            <div style="color: var(--text-muted); font-size: 0.85rem;">Associated Vault: <strong style="color: var(--status-info);">${evt.vault}</strong></div>
          </div>
        </div>
        <div style="background-color: var(--bg-card-elevated); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-card); margin-bottom: 1rem;">
          <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">${evt.description}</p>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; color: var(--text-muted);">
          <span>Execution Window: <strong>${evt.countdown}</strong></span>
          <span class="badge ${evt.pillType === 'orange' ? 'badge-warning' : 'badge-info'}">System Monitored</span>
        </div>
      `;
      window.AegisOwner.openModal('eventDetailModal');
    }
  }

  function openHealthModal(v) {
    const modalTitle = document.getElementById('healthModalTitle');
    const modalContent = document.getElementById('healthModalBody');
    if (modalTitle && modalContent) {
      modalTitle.textContent = `${v.name} — Health Audit`;
      modalContent.innerHTML = `
        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.25rem;">
          <div class="health-avatar ${v.avatarColor}" style="width: 44px; height: 44px;">
            ${v.avatarSvg}
          </div>
          <div>
            <div style="font-weight: 700; font-size: 1.05rem; color: var(--text-primary);">${v.name}</div>
            <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.2rem;">
              <span class="badge ${v.badgeClass}">${v.status}</span>
              <span style="font-size: 0.78rem; color: var(--text-muted);">${v.mode} Monitoring</span>
            </div>
          </div>
        </div>
        <div style="background-color: var(--bg-card-elevated); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-card); margin-bottom: 1rem;">
          <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">${v.details}</p>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4;">
          Security Rating: <strong>99.8% Integrity</strong> • Last Shamir mathematical verification: <strong>Today, 04:00 UTC</strong>.
        </div>
      `;
      window.AegisOwner.openModal('healthDetailModal');
    }
  }

  // =========================================================================
  // DOM EVENT BINDINGS
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Renders
    renderBarChart('6m');
    renderDonutChart();
    renderUpcomingEvents();
    renderRecentActivity();
    renderVaultHealth();

    // 2. Chart Range Select Dropdown
    const rangeSelect = document.getElementById('chartRangeSelect');
    if (rangeSelect) {
      rangeSelect.addEventListener('change', (e) => {
        renderBarChart(e.target.value);
        window.AegisOwner.showToast(`Chart updated to: ${e.target.options[e.target.selectedIndex].text}`);
      });
    }

    // 3. Topbar Global Search Filter (Filters both Recent Activity and Vault Health lists)
    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        renderRecentActivity(query);
        renderVaultHealth(query);
      });
    }

    // 4. KPI Metric Cards Interactive Navigation
    const metricCards = document.querySelectorAll('.metrics-row .metric-card');
    const metricDestinations = [
      '../my-vaults/my-vaults.html',
      '../my-vaults/my-vaults.html?status=active',
      '../trustees/trustees.html',
      '../invitations/invitations.html?status=pending',
      '../release-management/release-management.html'
    ];

    metricCards.forEach((card, index) => {
      card.style.cursor = 'pointer';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.title = `Click to navigate to ${card.querySelector('.metric-label')?.textContent || 'module'}`;
      
      const navigate = () => {
        const target = metricDestinations[index] || '../my-vaults/my-vaults.html';
        window.location.href = target;
      };

      card.addEventListener('click', navigate);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate();
        }
      });
    });

    // 5. Donut Chart Legend Interactive Filter
    const donutRows = document.querySelectorAll('.donut-legend-row');
    const donutStatuses = ['Completed', 'In Progress', 'Scheduled', 'Not Started'];
    donutRows.forEach((row, idx) => {
      row.style.cursor = 'pointer';
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');
      row.title = `Click to view ${donutStatuses[idx] || 'Release'} vaults`;
      
      row.addEventListener('click', () => {
        const status = donutStatuses[idx];
        window.AegisOwner.showToast(`Filtered by Release Status: ${status}`);
        window.location.href = `../release-management/release-management.html?filter=${encodeURIComponent(status)}`;
      });
    });

    // 6. Quick Action 1: Create New Vault Modal
    const btnCreateVault = document.getElementById('btnQuickCreateVault');
    const formCreateVault = document.getElementById('formCreateVault');
    if (btnCreateVault) {
      btnCreateVault.addEventListener('click', (e) => {
        e.preventDefault();
        window.AegisOwner.openModal('createVaultModal');
      });
    }
    if (formCreateVault) {
      formCreateVault.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('vaultNameInput');
        const vaultName = nameInput ? nameInput.value.trim() : 'New Vault';

        window.AegisOwner.closeModal('createVaultModal');
        formCreateVault.reset();

        mockRecentActivity.unshift({
          id: `act-${Date.now()}`,
          date: 'Just now',
          action: 'Vault Created',
          actionColor: 'green',
          actionIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
          vault: vaultName,
          details: 'Digital legacy container provisioned'
        });
        renderRecentActivity();

        mockVaultHealth.unshift({
          name: vaultName,
          mode: 'Active',
          avatarColor: 'teal',
          avatarSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
          status: 'Healthy',
          badgeClass: 'badge-success',
          details: 'AES-256 encrypted storage allocated. Quorum configuration pending.'
        });
        renderVaultHealth();

        window.AegisOwner.showToast(`Vault "${vaultName}" created successfully!`, 'success');
      });
    }

    // 7. Quick Action 2: Invite Trustee Modal
    const btnInviteTrustee = document.getElementById('btnQuickInviteTrustee');
    const formInviteTrustee = document.getElementById('formInviteTrustee');
    if (btnInviteTrustee) {
      btnInviteTrustee.addEventListener('click', (e) => {
        e.preventDefault();
        window.AegisOwner.openModal('inviteTrusteeModal');
      });
    }
    if (formInviteTrustee) {
      formInviteTrustee.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('trusteeEmailInput');
        const email = emailInput ? emailInput.value.trim() : 'trustee@example.com';

        window.AegisOwner.closeModal('inviteTrusteeModal');
        formInviteTrustee.reset();

        mockRecentActivity.unshift({
          id: `act-${Date.now()}`,
          date: 'Just now',
          action: 'Trustee Invited',
          actionColor: 'purple',
          actionIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
          vault: 'Personal Vault',
          details: `Invitation dispatched to ${email}`
        });
        renderRecentActivity();

        window.AegisOwner.showToast(`Invitation sent to ${email}`, 'success');
      });
    }

    // 8. Re-render responsive charts when theme changes
    window.addEventListener('aegis-theme-changed', () => {
      const activeRange = rangeSelect ? rangeSelect.value : '6m';
      renderBarChart(activeRange);
    });
  });

})();


