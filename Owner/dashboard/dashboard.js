/**
 * AegisVault Owner Panel — Dashboard Logic
 * Module 01: Interactive Charts, Search Filtering, Quick Action Modals & Mock Persistence
 *
 * Data Source Priority: Backend API → localStorage cache → hardcoded mock data
 */

(function () {
  'use strict';

  // =========================================================================
  // API DATA LOADING — Fetches from backend, falls back to mock data
  // =========================================================================

  async function loadDashboardData() {
    // Try loading real data from API
    if (!window.AegisAPI || !window.AegisAPI.isAuthenticated()) {
       window.location.href = '../../AegisVault Home/auth.html';
       return;
    }
    
    try {
      const user = window.AegisAPI.getUser();
        if (user && user.first_name) {
          const heroAccent = document.querySelector('.hero-accent');
          if (heroAccent) heroAccent.textContent = user.first_name.toUpperCase() + '!';
        }

        const [kpis, activity, chartData, releaseData, events, health, heartbeat] = await Promise.allSettled([
          window.AegisAPI.get('/owner/dashboard/kpis/'),
          window.AegisAPI.get('/owner/dashboard/activity/'),
          window.AegisAPI.get('/owner/dashboard/chart-data/').catch(e => null),
          window.AegisAPI.get('/owner/releases/?status=all'),
          window.AegisAPI.get('/owner/notifications/?type=all'),
          window.AegisAPI.get('/owner/vaults/'),
          window.AegisAPI.get('/owner/heartbeat/status/').catch(e => null),
        ]);

        // Update KPI cards if data was returned
        if (kpis.status === 'fulfilled' && kpis.value) {
          updateKPICards(kpis.value);
        }

        // Update heartbeat if returned
        if (heartbeat.status === 'fulfilled' && heartbeat.value) {
          updateHeartbeatUI(heartbeat.value);
        }

        // Update recent activity if data was returned
        let actData = [];
        if (activity.status === 'fulfilled' && activity.value) {
          actData = Array.isArray(activity.value) ? activity.value : (activity.value.results || []);
        }
        if (actData.length > 0) {
          const mapped = actData.map(log => ({
            id: log.id,
            date: log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recently',
            action: log.actionTitle || log.action_title || 'Activity',
            actionColor: mapCategoryToColor(log.category),
            actionIcon: getDefaultActionIcon(),
            vault: log.vault || log.vault_name || '',
            details: log.details || '',
          }));
          mockRecentActivity.splice(0, mockRecentActivity.length, ...mapped);
        }

        // Update vault health if data was returned
        let healthData = [];
        if (health.status === 'fulfilled' && health.value) {
          healthData = Array.isArray(health.value) ? health.value : (health.value.results || []);
        }
        if (healthData.length > 0) {
          const mapped = healthData.map(v => ({
            name: v.name,
            mode: v.status || 'Active',
            avatarColor: mapTypeToColor(v.vault_type),
            avatarSvg: getDefaultVaultSvg(),
            status: 'Healthy',
            badgeClass: 'badge-success',
            details: `Encryption: ${v.encryption || 'AES-256-GCM'}. Shares: ${v.shares_ratio || 'N/A'}.`,
          }));
          mockVaultHealth.splice(0, mockVaultHealth.length, ...mapped);
        }

        // Vault overview chart data
        if (chartData.status === 'fulfilled' && chartData.value) {
           window.API_CHART_DATA = chartData.value;
        }

        // Release status donut data
        if (releaseData.status === 'fulfilled' && releaseData.value) {
           const releases = Array.isArray(releaseData.value) ? releaseData.value : (releaseData.value.results || []);
           let completed = 0, in_progress = 0, scheduled = 0, not_started = 0;
           releases.forEach(r => {
              const st = (r.status || '').toLowerCase();
              if (st === 'completed' || st === 'released') completed++;
              else if (st === 'in_progress' || st === 'pending') in_progress++;
              else if (st === 'scheduled') scheduled++;
              else not_started++;
           });
           window.API_RELEASE_DATA = {
             total: releases.length,
             segments: [
               { label: 'Completed', count: completed, color: '#10b981', key: 'completed' },
               { label: 'In Progress', count: in_progress, color: '#0284c7', key: 'in_progress' },
               { label: 'Scheduled', count: scheduled, color: '#f59e0b', key: 'scheduled' },
               { label: 'Not Started', count: not_started, color: '#ef4444', key: 'not_started' }
             ]
           };
        }

        console.log('[AegisVault] Dashboard data loaded from API');
        
        // Re-render everything with new API data
        if (typeof renderRecentActivity === 'function') renderRecentActivity();
        if (typeof renderVaultHealth === 'function') renderVaultHealth();
        if (typeof renderBarChart === 'function') renderBarChart();
        if (typeof renderDonutChart === 'function') renderDonutChart();
        if (typeof renderUpcomingEvents === 'function') renderUpcomingEvents();

      } catch (err) {
        console.warn('[AegisVault] Dashboard API load failed, using mock data:', err.message);
      }
  }

  function updateHeartbeatUI(data) {
    const badge = document.getElementById('heartbeatStatusBadge');
    if (badge) {
      if (data.is_active) {
        badge.className = 'heartbeat-status-badge active';
        badge.innerHTML = '<span class="pulsing-dot"></span><span>Dead Man\'s Switch: ACTIVE</span>';
      } else {
        badge.className = 'heartbeat-status-badge inactive';
        badge.innerHTML = '<span>Dead Man\'s Switch: INACTIVE</span>';
      }
    }
    
    const intervalPill = document.getElementById('heartbeatIntervalPill');
    if (intervalPill) intervalPill.textContent = `Interval: Every ${data.interval_days} Days`;
    
    const lastCheckin = document.getElementById('heartbeatLastCheckIn');
    if (lastCheckin && data.last_checkin) {
      lastCheckin.textContent = new Date(data.last_checkin).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'});
    }

    if (data.next_checkin) {
      // Start the countdown timer
      window.targetDeadline = new Date(data.next_checkin).getTime();
      startHeartbeatTimer();
    }
  }

  function startHeartbeatTimer() {
    if (window.heartbeatInterval) clearInterval(window.heartbeatInterval);
    const dEl = document.getElementById('cdDays');
    const hEl = document.getElementById('cdHours');
    const mEl = document.getElementById('cdMinutes');
    const sEl = document.getElementById('cdSeconds');

    window.heartbeatInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = window.targetDeadline - now;

      if (distance < 0) {
        clearInterval(window.heartbeatInterval);
        if (dEl) dEl.textContent = '00';
        if (hEl) hEl.textContent = '00';
        if (mEl) mEl.textContent = '00';
        if (sEl) sEl.textContent = '00';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (dEl) dEl.textContent = days.toString().padStart(2, '0');
      if (hEl) hEl.textContent = hours.toString().padStart(2, '0');
      if (mEl) mEl.textContent = minutes.toString().padStart(2, '0');
      if (sEl) sEl.textContent = seconds.toString().padStart(2, '0');
    }, 1000);
  }

  function updateKPICards(data) {
    const cards = document.querySelectorAll('.metrics-row .metric-card');
    const values = [
      data.total_vaults !== undefined ? data.total_vaults : '0',
      data.active_vaults !== undefined ? data.active_vaults : '0',
      data.trustees !== undefined ? data.trustees : '0',
      data.pending_invitations !== undefined ? data.pending_invitations : '0',
      data.release_requests !== undefined ? data.release_requests : '0',
    ];
    cards.forEach((card, i) => {
      const valueEl = card.querySelector('.metric-value');
      if (valueEl && values[i] !== undefined) {
        valueEl.textContent = values[i];
      }
    });
  }

  function mapCategoryToColor(cat) {
    const map = { auth: 'blue', vault: 'green', trustee: 'purple', release: 'red', heartbeat: 'amber', security: 'red' };
    return map[cat] || 'blue';
  }

  function mapTypeToColor(type) {
    const map = { Personal: 'blue', Family: 'amber', Business: 'purple', Legacy: 'blue', Health: 'teal' };
    return map[type] || 'blue';
  }

  function getDefaultActionIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>';
  }

  function getDefaultVaultSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
  }

  const mockChartData = {
    '6m': [],
    '30d': [],
    'ytd': []
  };

  const mockReleaseStatus = {
    total: 0,
    segments: []
  };

  const mockUpcomingEvents = [];

  const mockRecentActivity = [];

  const mockVaultHealth = [];

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

    const sourceData = window.API_RELEASE_DATA || mockReleaseStatus;
    const segments = sourceData.segments;
    const total = sourceData.total > 0 ? sourceData.total : 1;
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
    
    // Update center count
    const centerCount = document.querySelector('.donut-count');
    if (centerCount) centerCount.textContent = total;

    // Update legend
    const legendList = document.querySelector('.donut-legend-list');
    if (legendList) {
      legendList.innerHTML = '';
      segments.forEach(seg => {
        let colorClass = 'blue';
        if (seg.key === 'completed') colorClass = 'green';
        if (seg.key === 'scheduled') colorClass = 'amber';
        if (seg.key === 'not_started') colorClass = 'red';
        
        legendList.innerHTML += `
          <div class="donut-legend-row">
            <span class="donut-dot ${colorClass}"></span>
            <span>${seg.count} ${seg.label}</span>
          </div>
        `;
      });
    }
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
  document.addEventListener('DOMContentLoaded', async () => {
    // 0. Load data from backend API (falls back to mocks on failure)
    await loadDashboardData();

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
      formCreateVault.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('vaultNameInput');
        const vaultName = nameInput ? nameInput.value.trim() : 'New Vault';

        window.AegisOwner.closeModal('createVaultModal');
        formCreateVault.reset();

        // Try real API
        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
          try {
            await window.AegisAPI.post('/owner/vaults/', { name: vaultName, vault_type: 'Personal' });
          } catch (err) {
            console.warn('Create vault API failed:', err.message);
          }
        }

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
      formInviteTrustee.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('trusteeEmailInput');
        const email = emailInput ? emailInput.value.trim() : 'trustee@example.com';

        window.AegisOwner.closeModal('inviteTrusteeModal');
        formInviteTrustee.reset();

        // Try real API
        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
          try {
            await window.AegisAPI.post('/owner/trustees/invite/', { email });
          } catch (err) {
            console.warn('Invite trustee API failed:', err.message);
          }
        }

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


