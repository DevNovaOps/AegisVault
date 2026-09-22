/**
 * AegisVault Trustee Panel - Notifications Module Controller
 */

let activeFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  initMarkAllRead();
  updateUnreadBadges();
});

/**
 * Filter by Category Tabs or Hero Pills
 */
window.filterByTab = function(tabName) {
  activeFilter = tabName;

  // Update tabs active state
  document.querySelectorAll('.notif-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update hero pills active state
  const pillMap = {
    all: 'pillAll',
    unread: 'pillUnread',
    action: 'pillAction',
    security: 'pillSecurity'
  };

  document.querySelectorAll('.notif-metric-pill').forEach(pill => pill.classList.remove('active'));
  if (pillMap[tabName]) {
    const pill = document.getElementById(pillMap[tabName]);
    if (pill) pill.classList.add('active');
  }

  applyFilters();
};

/**
 * Live Search
 */
function initSearch() {
  const searchInput = document.getElementById('notifSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    applyFilters();
  });
}

/**
 * Filter Application Logic
 */
function applyFilters() {
  const searchInput = document.getElementById('notifSearchInput');
  const query = (searchInput?.value || '').toLowerCase().trim();
  const cards = document.querySelectorAll('.notif-card');
  const groups = document.querySelectorAll('.feed-group');

  let totalVisible = 0;

  cards.forEach(card => {
    const isUnread = card.classList.contains('unread');
    const category = (card.getAttribute('data-category') || '').toLowerCase();
    const cardText = card.textContent.toLowerCase();

    const matchesSearch = !query || cardText.includes(query);
    let matchesTab = false;

    if (activeFilter === 'all') {
      matchesTab = true;
    } else if (activeFilter === 'unread') {
      matchesTab = isUnread;
    } else if (category.includes(activeFilter)) {
      matchesTab = true;
    }

    if (matchesSearch && matchesTab) {
      card.style.display = 'flex';
      totalVisible++;
    } else {
      card.style.display = 'none';
    }
  });

  // Hide empty groups
  groups.forEach(group => {
    const visibleInGroup = group.querySelectorAll('.notif-card[style*="display: flex"], .notif-card:not([style*="display: none"])');
    let hasVisible = false;
    visibleInGroup.forEach(c => {
      if (c.style.display !== 'none') hasVisible = true;
    });

    if (hasVisible) {
      group.style.display = '';
    } else {
      group.style.display = 'none';
    }
  });

  // Zero state handling
  const container = document.getElementById('notifFeedContainer');
  let emptyBox = document.getElementById('notifEmptyState');

  if (totalVisible === 0) {
    if (!emptyBox) {
      emptyBox = document.createElement('div');
      emptyBox.id = 'notifEmptyState';
      emptyBox.className = 'notif-card';
      emptyBox.style.cssText = 'text-align: center; padding: 3rem 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;';
      emptyBox.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 0.75rem; opacity: 0.5; color: var(--text-muted);">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.35rem;">No notifications found</div>
        <div style="font-size: 0.84rem; color: var(--text-secondary);">No alerts match the selected tab filter or query.</div>
      `;
      container.appendChild(emptyBox);
    }
  } else if (emptyBox) {
    emptyBox.remove();
  }
}

/**
 * Mark All Read
 */
function initMarkAllRead() {
  const btn = document.getElementById('btnMarkAllRead');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const unreadCards = document.querySelectorAll('.notif-card.unread');
    unreadCards.forEach(card => {
      card.classList.remove('unread');
      const dot = card.querySelector('.notif-unread-badge-dot');
      if (dot) dot.remove();
    });

    updateUnreadBadges();
    showToast('All notifications marked as read.');
    if (activeFilter === 'unread') {
      applyFilters();
    }
  });
}

/**
 * Toggle Read Status on single notification
 */
window.toggleReadStatus = function(cardId) {
  const card = document.querySelector(`.notif-card[data-id="${cardId}"]`);
  if (!card) return;

  if (card.classList.contains('unread')) {
    card.classList.remove('unread');
    const dot = card.querySelector('.notif-unread-badge-dot');
    if (dot) dot.remove();
    showToast('Marked as read.');
  } else {
    card.classList.add('unread');
    const metaLeft = card.querySelector('.notif-meta-left');
    if (metaLeft && !metaLeft.querySelector('.notif-unread-badge-dot')) {
      const newDot = document.createElement('span');
      newDot.className = 'notif-unread-badge-dot';
      metaLeft.appendChild(newDot);
    }
    showToast('Marked as unread.');
  }

  updateUnreadBadges();
  if (activeFilter === 'unread') {
    applyFilters();
  }
};

/**
 * Update UI Counter Badges
 */
function updateUnreadBadges() {
  const unreadCount = document.querySelectorAll('.notif-card.unread').length;
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
}

/**
 * Open Notification Audit Log Modal
 */
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
