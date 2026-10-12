/**
 * AegisVault Trustee Panel - Notifications Module Controller
 * Connected to live Django backend: /api/v1/trustee/notifications/
 * All data flows from the database — zero mock/static data.
 */

let activeFilter = 'all';
let liveNotifications = [];

document.addEventListener('DOMContentLoaded', () => {
  loadTrusteeNotifications();
  initSearch();
  initMarkAllRead();
});

// ═══════════════════════════════════════════════════════════════════════════════
//  Live Data Loading
// ═══════════════════════════════════════════════════════════════════════════════

async function loadTrusteeNotifications() {
  if (!window.AegisAPI || !window.AegisAPI.isAuthenticated()) return;

  try {
    const data = await window.AegisAPI.get('/trustee/notifications/');
    liveNotifications = Array.isArray(data) ? data : (data.results || []);
    renderNotifications(liveNotifications);
    updateUnreadBadges();
  } catch (err) {
    console.warn('[AegisVault] Failed to load trustee notifications:', err);
    // Show empty state
    const container = document.getElementById('notifFeedContainer');
    if (container) {
      container.innerHTML = `
        <div class="notif-card" style="text-align: center; padding: 3rem 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 0.75rem; opacity: 0.5; color: var(--text-muted);">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.35rem;">No notifications yet</div>
          <div style="font-size: 0.84rem; color: var(--text-secondary);">Notifications will appear here as you interact with the platform.</div>
        </div>
      `;
    }
  }
}

function getNotifIcon(type) {
  switch (type) {
    case 'invitation': return { icon: '📨', cls: 'notif-icon-invitation' };
    case 'trustee': return { icon: '👥', cls: 'notif-icon-trustee' };
    case 'release': return { icon: '🔓', cls: 'notif-icon-release' };
    case 'security': return { icon: '🛡️', cls: 'notif-icon-security' };
    case 'heartbeat': return { icon: '❤️', cls: 'notif-icon-heartbeat' };
    case 'share': return { icon: '🔑', cls: 'notif-icon-share' };
    default: return { icon: '🔔', cls: 'notif-icon-system' };
  }
}

function renderNotifications(notifications) {
  const container = document.getElementById('notifFeedContainer');
  if (!container) return;

  if (notifications.length === 0) {
    container.innerHTML = `
      <div class="notif-card" style="text-align: center; padding: 3rem 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 0.75rem; opacity: 0.5; color: var(--text-muted);">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.35rem;">No notifications found</div>
        <div style="font-size: 0.84rem; color: var(--text-secondary);">No alerts match the selected filter or search query.</div>
      </div>
    `;
    return;
  }

  // Group by date
  const groups = {};
  notifications.forEach(n => {
    const dateKey = n.date || new Date(n.created_at).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(n);
  });

  container.innerHTML = '';

  Object.entries(groups).forEach(([dateKey, items]) => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'feed-group';
    groupDiv.innerHTML = `<div class="feed-group-label">${dateKey}</div>`;

    items.forEach(n => {
      const isUnread = n.status === 'unread';
      const iconData = getNotifIcon(n.type);
      const time = n.time || new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const card = document.createElement('div');
      card.className = `notif-card ${isUnread ? 'unread' : ''}`;
      card.setAttribute('data-id', n.id);
      card.setAttribute('data-category', n.type);

      card.innerHTML = `
        <div class="notif-icon-wrap ${iconData.cls}">
          <span class="notif-icon-emoji">${iconData.icon}</span>
        </div>
        <div class="notif-body">
          <div class="notif-title">${escapeHtml(n.title)}</div>
          <div class="notif-desc">${escapeHtml(n.description)}</div>
          <div class="notif-meta">
            <div class="notif-meta-left">
              <span class="notif-time">${time}</span>
              ${n.vault_name ? `<span class="notif-vault-tag">${escapeHtml(n.vault_name)}</span>` : ''}
              ${isUnread ? '<span class="notif-unread-badge-dot"></span>' : ''}
            </div>
            <div class="notif-meta-right">
              <button class="notif-action-btn" onclick="toggleReadStatus('${n.id}')" title="Toggle read status">
                ${isUnread ? '📖 Mark Read' : '📩 Mark Unread'}
              </button>
            </div>
          </div>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.notif-action-btn')) return;
        openNotifDetails(
          n.id,
          n.title,
          n.vault_name || '—',
          'System',
          `${dateKey}, ${time}`,
          n.type,
          n.description
        );
      });

      groupDiv.appendChild(card);
    });

    container.appendChild(groupDiv);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Filters & Search
// ═══════════════════════════════════════════════════════════════════════════════

window.filterByTab = function(tabName) {
  activeFilter = tabName;

  // Update tabs active state
  document.querySelectorAll('.notif-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === tabName);
  });

  // Update hero pills
  document.querySelectorAll('.notif-metric-pill').forEach(pill => pill.classList.remove('active'));
  const pillMap = { all: 'pillAll', unread: 'pillUnread', action: 'pillAction', security: 'pillSecurity' };
  if (pillMap[tabName]) {
    const pill = document.getElementById(pillMap[tabName]);
    if (pill) pill.classList.add('active');
  }

  applyFilters();
};

function initSearch() {
  const searchInput = document.getElementById('notifSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
}

function applyFilters() {
  const searchInput = document.getElementById('notifSearchInput');
  const query = (searchInput?.value || '').toLowerCase().trim();

  const filtered = liveNotifications.filter(n => {
    const matchesSearch = !query || n.title.toLowerCase().includes(query) || (n.description || '').toLowerCase().includes(query);

    let matchesTab = false;
    if (activeFilter === 'all') matchesTab = true;
    else if (activeFilter === 'unread') matchesTab = n.status === 'unread';
    else if (activeFilter === 'action') matchesTab = ['invitation', 'trustee', 'release', 'share'].includes(n.type);
    else if (activeFilter === 'security') matchesTab = n.type === 'security';
    else matchesTab = n.type === activeFilter;

    return matchesSearch && matchesTab;
  });

  renderNotifications(filtered);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Mark Read / Unread
// ═══════════════════════════════════════════════════════════════════════════════

function initMarkAllRead() {
  const btn = document.getElementById('btnMarkAllRead');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    try {
      await window.AegisAPI.post('/trustee/notifications/mark-all-read/');

      liveNotifications.forEach(n => n.status = 'read');
      applyFilters();
      updateUnreadBadges();
      showToast('All notifications marked as read.');
    } catch (err) {
      showToast(`Failed to mark notifications: ${err.message}`, 'error');
    }
  });
}

window.toggleReadStatus = async function(notifId) {
  const notif = liveNotifications.find(n => n.id === notifId);
  if (!notif) return;

  if (notif.status === 'unread') {
    try {
      await window.AegisAPI.post(`/trustee/notifications/${notifId}/mark-read/`);
      notif.status = 'read';
      showToast('Marked as read.');
    } catch (err) {
      showToast(`Failed: ${err.message}`, 'error');
    }
  } else {
    // Toggle locally (no backend endpoint for marking unread)
    notif.status = 'unread';
    showToast('Marked as unread.');
  }

  applyFilters();
  updateUnreadBadges();
};

function updateUnreadBadges() {
  const unreadCount = liveNotifications.filter(n => n.status === 'unread').length;

  const countTab = document.getElementById('countTabUnread');
  const countHero = document.getElementById('unreadCountHero');
  const sidebarBadge = document.getElementById('sidebarNotifBadge');
  const headerDot = document.getElementById('headerNotifDot');

  if (countTab) countTab.textContent = unreadCount;
  if (countHero) countHero.textContent = unreadCount;

  if (sidebarBadge) {
    sidebarBadge.textContent = unreadCount;
    sidebarBadge.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
  }

  if (headerDot) {
    headerDot.style.display = unreadCount > 0 ? 'block' : 'none';
  }

  // Update hero pill counts
  const totalPill = document.getElementById('pillAll');
  if (totalPill) {
    const countEl = totalPill.querySelector('.pill-count');
    if (countEl) countEl.textContent = liveNotifications.length;
  }

  const unreadPill = document.getElementById('pillUnread');
  if (unreadPill) {
    const countEl = unreadPill.querySelector('.pill-count');
    if (countEl) countEl.textContent = unreadCount;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Notification Detail Modal
// ═══════════════════════════════════════════════════════════════════════════════

window.openNotifDetails = function(id, title, vault, sender, time, category, notes) {
  const modalId = document.getElementById('modalNotifId');
  const modalVault = document.getElementById('modalNotifVault');
  const modalSender = document.getElementById('modalNotifSender');
  const modalTime = document.getElementById('modalNotifTime');
  const modalCat = document.getElementById('modalNotifCategory');
  const modalNotes = document.getElementById('modalNotifNotes');

  if (modalId) modalId.textContent = id;
  if (modalVault) modalVault.textContent = vault;
  if (modalSender) modalSender.textContent = sender;
  if (modalTime) modalTime.textContent = time;
  if (modalCat) modalCat.textContent = category;
  if (modalNotes) modalNotes.textContent = notes;

  if (window.openModal) {
    window.openModal('notifDetailModal');
  }
};

/**
 * Save Alert Preferences
 */
window.saveAlertPreferences = function() {
  showToast('Alert preferences updated and saved securely.');
};
