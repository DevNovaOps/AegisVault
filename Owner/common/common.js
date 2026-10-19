/**
 * AegisVault Owner Panel — Master Common Script
 * Version: 1.0.0
 * Handles:
 *  - Theme switching (Light / Dark) with zero-flash localStorage persistence
 *  - Mobile sidebar drawer toggling
 *  - Profile dropdown menu
 *  - Global toast notification manager
 *  - Generic modal open / close listeners
 *  - Navigation helpers
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Zero-Flash Theme Controller
  // --------------------------------------------------------------------------
  const THEME_KEY = 'aegis_owner_theme';

  function getStoredTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {
      // localStorage disabled or private browsing
    }
    const docTheme = document.documentElement.getAttribute('data-theme');
    if (docTheme === 'dark' || docTheme === 'light') return docTheme;
    return 'dark'; // Default AegisVault theme
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}

    // Update toggle states if present in DOM
    const themeBtns = document.querySelectorAll('#themeToggleBtn, .theme-toggle-btn');
    themeBtns.forEach(btn => {
      btn.setAttribute('title', theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
      btn.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
      
      const sunIcon = btn.querySelector('.sun-icon');
      const moonIcon = btn.querySelector('.moon-icon');
      if (sunIcon && moonIcon) {
        if (theme === 'dark') {
          sunIcon.style.display = 'none';
          moonIcon.style.display = 'block';
        } else {
          sunIcon.style.display = 'block';
          moonIcon.style.display = 'none';
        }
      }
    });

    // Dynamically update tab favicon to match active theme
    const iconLinks = document.querySelectorAll('link[rel="icon"]');
    iconLinks.forEach(link => {
      const isDark = theme === 'dark';
      if (link.href.includes('favicon-32x32') || link.href.includes('favicon-light-32x32')) {
        link.href = isDark ? '../assets/logo/favicon-32x32.png' : '../assets/logo/favicon-light-32x32.png';
      } else if (link.href.endsWith('.ico')) {
        link.href = isDark ? '../favicon.ico' : '../assets/logo/favicon-light.ico';
      }
    });

    // Dispatch event for module-level reactive elements (e.g. charts)
    window.dispatchEvent(new CustomEvent('aegis-theme-changed', { detail: { theme } }));
  }

  // Run immediate application before render to eliminate FOUC
  const initialTheme = getStoredTheme();
  applyTheme(initialTheme);

  // Expose global AegisOwner helper
  window.AegisOwner = {
    getTheme: () => document.documentElement.getAttribute('data-theme') || 'dark',
    setTheme: applyTheme,
    toggleTheme: () => {
      const current = window.AegisOwner.getTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    },
    showToast: (message, type = 'info') => {
      let container = document.querySelector('.toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
      }
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.innerHTML = `<span>${message}</span>`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 250);
      }, 3500);
    },
    openModal: (modalId) => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('show');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    },
    closeModal: (modalId) => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('show');
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  };

  // --------------------------------------------------------------------------
  // 2. DOM Ready Bindings
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    // Re-verify icon state
    applyTheme(window.AegisOwner.getTheme());

    // Bind Theme Toggle Button
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.AegisOwner.toggleTheme();
      });
    }

    // Bind Sidebar Mobile Drawer
    const sidebarToggle = document.getElementById('sidebarToggleBtn');
    const sidebar = document.querySelector('.owner-sidebar');
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });

      // Close when clicking outside on mobile
      document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('mobile-open') &&
            !sidebar.contains(e.target) &&
            !sidebarToggle.contains(e.target)) {
          sidebar.classList.remove('mobile-open');
        }
      });
    }

    // Bind Profile Dropdown
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const profileWrapper = document.querySelector('.profile-menu-wrapper');
    if (profileBtn && profileDropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
        if (profileWrapper) profileWrapper.classList.toggle('active');
      });

      document.addEventListener('click', (e) => {
        if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
          profileDropdown.classList.remove('show');
          if (profileWrapper) profileWrapper.classList.remove('active');
        }
      });
    }

    // Modal Close Buttons (data-modal-close)
    document.querySelectorAll('[data-modal-close]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const overlay = e.target.closest('.modal-overlay');
        if (overlay) {
          overlay.classList.remove('show');
          overlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    // Close modal on background overlay click
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('show');
          overlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    // Global Link & Sign Out Interceptor
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (!target) return;

      const text = target.textContent.trim().toLowerCase();

      // Check for Sign Out
      if (text.includes('sign out') || text === 'sign out') {
        e.preventDefault();
        e.stopPropagation();
        window.signOutOwner();
        return;
      }

      // Check for Footer Privacy / Terms / Support links
      const href = target.getAttribute('href');
      if (target.closest('.owner-footer, .footer-right, .footer-links') || href === '#' || href === 'javascript:void(0)') {
        if (text === 'privacy' || text.includes('privacy policy')) {
          e.preventDefault();
          e.stopPropagation();
          window.openAegisInfoModal('privacy');
          return;
        } else if (text === 'terms' || text.includes('terms of service')) {
          e.preventDefault();
          e.stopPropagation();
          window.openAegisInfoModal('terms');
          return;
        } else if (text === 'support' || text.includes('help') || text.includes('contact support')) {
          e.preventDefault();
          e.stopPropagation();
          window.openAegisInfoModal('support');
          return;
        }
      }
    });

    // ------------------------------------------------------------------------
    // Session & User Profile Controller
    // ------------------------------------------------------------------------
    function getStoredUser() {
      try {
        const raw = localStorage.getItem('aegis_user');
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    }

    function requireOwnerAuth() {
      const user = getStoredUser();
      const token = localStorage.getItem('aegis_access_token');
      if (!user && !token) {
        window.location.href = '/auth.html';
        return false;
      }
      return true;
    }

    function syncOwnerUserProfile() {
      const user = getStoredUser();
      if (!user) return;

      const name = user.name || (user.email ? user.email.split('@')[0] : 'Owner');
      const parts = name.trim().split(/\s+/);
      const initials = (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].substring(0, 2)).toUpperCase();
      const firstName = parts[0];

      // Update header profile chip
      document.querySelectorAll('.profile-name, .profile-user-fullname, .overview-name').forEach(el => {
        el.textContent = name;
      });
      document.querySelectorAll('.profile-avatar-circle, .avatar-initials, .avatar-text').forEach(el => {
        el.textContent = initials;
      });
      document.querySelectorAll('.profile-email, .user-email').forEach(el => {
        if (user.email) el.textContent = user.email;
      });

      // Update hero greeting banner on welcome pages (e.g. Welcome back, Rakesh! -> Welcome back, Dev!)
      const heroHeading = document.querySelector('.hero-heading');
      const heroAccent = document.querySelector('.hero-heading .hero-accent');
      if (heroAccent && heroHeading && /welcome/i.test(heroHeading.textContent)) {
        heroAccent.textContent = firstName + '!';
      }

      // Update legal name field on profile settings page
      const inputFullName = document.getElementById('inputFullName');
      if (inputFullName && user.name) {
        inputFullName.value = user.name;
      }
    }

    function syncSidebarBadges() {
      // Find all badges across navigation items and explicitly hide them first
      document.querySelectorAll('.nav-item').forEach(item => {
        const text = item.textContent.trim().toLowerCase();
        const badge = item.querySelector('.nav-badge');
        if (!badge) return;

        if (text.includes('invitations')) {
          badge.id = 'sidebarInviteBadge';
          badge.style.setProperty('display', 'none', 'important');
        } else {
          badge.style.setProperty('display', 'none', 'important');
        }
      });

      if (!window.AegisAPI || !window.AegisAPI.isAuthenticated()) return;

      // 1. Pending invitations count
      window.AegisAPI.get('/owner/invitations/').then(invs => {
        const list = Array.isArray(invs) ? invs : (invs?.results || []);
        const pendingCount = list.filter(i => (i.status || '').toLowerCase() === 'pending').length;
        document.querySelectorAll('#sidebarInviteBadge').forEach(b => {
          if (pendingCount > 0) {
            b.textContent = pendingCount;
            b.style.removeProperty('display');
            b.style.display = 'inline-flex';
          } else {
            b.style.setProperty('display', 'none', 'important');
          }
        });
      }).catch(() => {});
    }

    // Run auth check, profile sync and dynamic badge sync
    if (requireOwnerAuth()) {
      syncOwnerUserProfile();
      syncSidebarBadges();
    }

    // Initialize Dead Man's Switch Heartbeat Controller
    if (window.AegisHeartbeat) {
      window.AegisHeartbeat.init();
    }
  });

  // --------------------------------------------------------------------------
  // 3. Dead Man's Switch & Live Heartbeat Controller
  // --------------------------------------------------------------------------
  const HEARTBEAT_KEY = 'aegis_heartbeat_last_ping';
  const INTERVAL_KEY = 'aegis_heartbeat_interval_days';
  const STATE_KEY = 'aegis_heartbeat_state';
  const DEADLINE_KEY = 'aegis_heartbeat_deadline';
  const GRACE_DEADLINE_KEY = 'aegis_heartbeat_grace_deadline';

  function playHeartbeatSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      // Beat 1 (Lub)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(65, now);
      osc1.frequency.exponentialRampToValueAtTime(32, now + 0.12);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Beat 2 (Dub)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(80, now + 0.14);
      osc2.frequency.exponentialRampToValueAtTime(38, now + 0.28);
      gain2.gain.setValueAtTime(0.28, now + 0.14);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.14);
      osc2.stop(now + 0.28);
    } catch (e) {
      // Audio context suppressed or unsupported
    }
  }

  window.AegisHeartbeat = {
    getIntervalDays: () => {
      try {
        const val = parseInt(localStorage.getItem(INTERVAL_KEY), 10);
        return isNaN(val) || val <= 0 ? 30 : val;
      } catch (e) {
        return 30;
      }
    },

    setIntervalDays: (days) => {
      try {
        localStorage.setItem(INTERVAL_KEY, days);
      } catch (e) {}
      window.AegisHeartbeat.updateUI();
      window.dispatchEvent(new CustomEvent('aegis-heartbeat-interval-changed', { detail: { days } }));

      // Sync with backend API
      if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
        const graceDays = parseInt(document.getElementById('selectGracePeriod')?.value || '7', 10);
        window.AegisAPI.put('/owner/heartbeat/config/', {
          interval_days: days,
          grace_period_days: graceDays
        }).catch(err => {
          console.warn('Heartbeat config API sync failed:', err.message);
        });
      }
    },

    getLastPing: () => {
      try {
        const val = parseInt(localStorage.getItem(HEARTBEAT_KEY), 10);
        return isNaN(val) ? Date.now() : val;
      } catch (e) {
        return Date.now();
      }
    },

    resetHeartbeat: (silent = false) => {
      const now = Date.now();
      try {
        localStorage.setItem(HEARTBEAT_KEY, now);
        localStorage.setItem(STATE_KEY, 'active');
        localStorage.removeItem(GRACE_DEADLINE_KEY);
      } catch (e) {}

      // Sync with backend API
      if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
        window.AegisAPI.post('/owner/heartbeat/checkin/').then(res => {
          if (res && res.next_deadline) {
            localStorage.setItem(DEADLINE_KEY, new Date(res.next_deadline).getTime());
            localStorage.setItem(STATE_KEY, res.state || 'active');
            window.AegisHeartbeat.updateUI();
          }
        }).catch(err => {
          console.warn('Heartbeat API sync failed:', err.message);
        });
      }

      if (!silent) {
        playHeartbeatSound();
        const days = window.AegisHeartbeat.getIntervalDays();
        if (window.AegisOwner && window.AegisOwner.showToast) {
          window.AegisOwner.showToast(`❤️ Heartbeat confirmed! You are verified alive. Dead Man's Switch timer reset for ${days} days.`, 'success');
        }

        // Pulse animation effect on all heart icons
        document.querySelectorAll('.heartbeat-pulse-icon, .btn-heart-beat, .heartbeat-icon-wrap').forEach(el => {
          el.style.animation = 'none';
          el.offsetHeight; // trigger reflow
          el.style.animation = 'heartbeat-pulse 0.4s ease-in-out 3';
        });

        // Store activity history entry if possible
        try {
          const act = JSON.parse(localStorage.getItem('aegis_owner_activities') || '[]');
          act.unshift({
            id: `hb-${now}`,
            date: 'Just now',
            action: 'Heartbeat Check-In',
            actionColor: 'green',
            vault: 'All Sealed Vaults',
            details: `Owner clicked "I'm Alive". Dead Man's Switch reset for ${days} days.`
          });
          localStorage.setItem('aegis_owner_activities', JSON.stringify(act.slice(0, 20)));
        } catch(e) {}
      }

      window.AegisHeartbeat.updateUI();
      window.dispatchEvent(new CustomEvent('aegis-heartbeat-ping', { detail: { timestamp: now } }));
    },

    simulateNearExpiry: () => {
      // Set last ping so that remaining time is exactly 12 seconds
      const intervalMs = window.AegisHeartbeat.getIntervalDays() * 24 * 60 * 60 * 1000;
      const targetLastPing = Date.now() - intervalMs + 12000;
      try {
        localStorage.setItem(HEARTBEAT_KEY, targetLastPing);
      } catch(e) {}
      window.AegisHeartbeat.updateUI();
      if (window.AegisOwner && window.AegisOwner.showToast) {
        window.AegisOwner.showToast('⚠️ Fast-forwarded timer to 12s remaining to simulate impending grace period!', 'warning');
      }
    },

    updateUI: () => {
      const intervalDays = window.AegisHeartbeat.getIntervalDays();
      const lastPing = window.AegisHeartbeat.getLastPing();
      const state = localStorage.getItem(STATE_KEY) || 'active';
      const isGrace = state === 'grace';
      const storedDeadline = parseInt(localStorage.getItem(DEADLINE_KEY), 10);
      const storedGraceDeadline = parseInt(localStorage.getItem(GRACE_DEADLINE_KEY), 10);

      let targetTime;
      if (isGrace && storedGraceDeadline && !isNaN(storedGraceDeadline)) {
        targetTime = storedGraceDeadline;
      } else if (storedDeadline && !isNaN(storedDeadline)) {
        targetTime = storedDeadline;
      } else {
        targetTime = lastPing + (intervalDays * 24 * 60 * 60 * 1000);
      }

      const remainingMs = targetTime - Date.now();
      const isOverdue = isGrace || remainingMs <= 0;
      const safeMs = Math.max(0, remainingMs);

      const days = Math.floor(safeMs / (24 * 60 * 60 * 1000));
      const hours = Math.floor((safeMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const mins = Math.floor((safeMs % (60 * 60 * 1000)) / (60 * 1000));
      const secs = Math.floor((safeMs % (60 * 1000)) / 1000);

      const pad = (n) => String(n).padStart(2, '0');

      // 1. Update Full Countdown Displays
      const elDays = document.getElementById('cdDays');
      const elHours = document.getElementById('cdHours');
      const elMins = document.getElementById('cdMinutes');
      const elSecs = document.getElementById('cdSeconds');

      if (elDays) elDays.textContent = pad(days);
      if (elHours) elHours.textContent = pad(hours);
      if (elMins) elMins.textContent = pad(mins);
      if (elSecs) elSecs.textContent = pad(secs);

      // 2. Update Topbar Widget
      const elTopbarTimer = document.getElementById('heartbeatTopbarTimer');
      if (elTopbarTimer) {
        if (isGrace) {
          elTopbarTimer.textContent = `Grace: ${days}d ${pad(hours)}h ${pad(mins)}m`;
          elTopbarTimer.style.color = '#f97316';
        } else if (isOverdue) {
          elTopbarTimer.textContent = '00d 00h 00m';
          elTopbarTimer.style.color = '#ef4444';
        } else {
          elTopbarTimer.textContent = `${days}d ${pad(hours)}h ${pad(mins)}m`;
          elTopbarTimer.style.color = '';
        }
      }

      // 3. Update Status Badges
      const elBadge = document.getElementById('heartbeatStatusBadge');
      if (elBadge) {
        if (isGrace || isOverdue) {
          elBadge.className = 'heartbeat-status-badge warning';
          elBadge.innerHTML = '<span class="pulsing-dot" style="background:#f97316;"></span><span>GRACE PERIOD: ACTION REQUIRED</span>';
        } else {
          elBadge.className = 'heartbeat-status-badge active';
          elBadge.innerHTML = '<span class="pulsing-dot"></span><span>Dead Man\'s Switch: ACTIVE</span>';
        }
      }

      // 4. Update Interval Label
      const elIntervalPill = document.getElementById('heartbeatIntervalPill');
      if (elIntervalPill) {
        elIntervalPill.textContent = `Interval: Every ${intervalDays} Days`;
      }

      // 5. Update Last Check-in Text
      const elLastCheckIn = document.getElementById('heartbeatLastCheckIn');
      if (elLastCheckIn) {
        const diffMinutes = Math.floor((Date.now() - lastPing) / 60000);
        if (diffMinutes < 1) {
          elLastCheckIn.textContent = 'Just now';
        } else if (diffMinutes < 60) {
          elLastCheckIn.textContent = `${diffMinutes}m ago`;
        } else {
          const d = new Date(lastPing);
          elLastCheckIn.textContent = d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
      }
    },

    init: () => {
      // Ensure defaults in storage
      if (!localStorage.getItem(HEARTBEAT_KEY)) {
        localStorage.setItem(HEARTBEAT_KEY, Date.now());
      }
      if (!localStorage.getItem(INTERVAL_KEY)) {
        localStorage.setItem(INTERVAL_KEY, 30);
      }

      // Sync with backend API
      if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
        window.AegisAPI.get('/owner/heartbeat/status/').then(res => {
          if (res && res.configured) {
            localStorage.setItem(INTERVAL_KEY, res.interval_days);
            if (res.last_checkin) {
              localStorage.setItem(HEARTBEAT_KEY, new Date(res.last_checkin).getTime());
            }
            if (res.state) {
              localStorage.setItem(STATE_KEY, res.state);
            }
            if (res.next_deadline) {
              localStorage.setItem(DEADLINE_KEY, new Date(res.next_deadline).getTime());
            }
            if (res.grace_deadline) {
              localStorage.setItem(GRACE_DEADLINE_KEY, new Date(res.grace_deadline).getTime());
            } else {
              localStorage.removeItem(GRACE_DEADLINE_KEY);
            }

            // Sync interval in modal if present
            const intervalSel = document.getElementById('selectHeartbeatInterval');
            if (intervalSel && res.interval_days) {
              intervalSel.value = String(res.interval_days);
              if (window.AegisHeartbeat.renderReminderSchedule) {
                window.AegisHeartbeat.renderReminderSchedule(res.interval_days);
              }
            }

            // Sync grace period in the UI if present
            const graceSel = document.getElementById('selectGracePeriod');
            if (graceSel && res.grace_period_days) {
              graceSel.value = String(res.grace_period_days);
            }
            window.AegisHeartbeat.updateUI();
          }
        }).catch(err => {
          console.warn('Heartbeat status API fetch failed:', err.message);
        });
      }

      // Inject topbar widget if not already in DOM
      window.AegisHeartbeat.injectTopbarWidget();

      // Inject configuration modal if not in DOM
      window.AegisHeartbeat.injectModal();

      // Initial render & 1-second ticking loop
      window.AegisHeartbeat.updateUI();
      setInterval(() => {
        window.AegisHeartbeat.updateUI();
      }, 1000);

      // Global delegation for any "I'm Alive" buttons
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('#btnImAliveMain, #btnAliveQuick, .btn-im-alive, #btnQuickHeartbeatCheckin');
        if (btn) {
          e.preventDefault();
          window.AegisHeartbeat.resetHeartbeat();
          return;
        }

        const settingsBtn = e.target.closest('#btnHeartbeatSettings, .btn-heartbeat-settings');
        if (settingsBtn) {
          e.preventDefault();
          window.AegisOwner.openModal('heartbeatConfigModal');
        }
      });
    },

    getReminderSchedule: (days) => {
      let milestones;
      let label;
      if (days >= 365) {
        milestones = [60, 30, 14, 7, 3, 1];
        label = '365-Day (Annual)';
      } else if (days >= 180) {
        milestones = [30, 14, 7, 3, 1];
        label = '180-Day (Half-Yearly)';
      } else if (days >= 90) {
        milestones = [21, 14, 7, 3, 1];
        label = '90-Day (Quarterly)';
      } else if (days >= 60) {
        milestones = [14, 7, 5, 3, 1];
        label = '60-Day (Bi-Monthly)';
      } else if (days >= 25) {
        milestones = [7, 5, 3, 1];
        label = '30-Day (Monthly)';
      } else if (days >= 14) {
        milestones = [5, 3, 1];
        label = '14-Day (Bi-Weekly)';
      } else if (days >= 7) {
        milestones = [3, 2, 1];
        label = '7-Day (Weekly)';
      } else {
        milestones = [Math.max(1, Math.floor(days / 2)), 1];
        label = `${days}-Day`;
      }
      return { milestones, label };
    },

    renderReminderSchedule: (days) => {
      const schedule = window.AegisHeartbeat.getReminderSchedule(days);
      const descEl = document.getElementById('heartbeatScheduleDescription');
      const badgesEl = document.getElementById('heartbeatMilestoneBadges');
      if (!descEl || !badgesEl) return;

      const milestoneStr = schedule.milestones.map(m => m === 1 ? '24 hours' : `${m} days`).join(', ');
      descEl.innerHTML = `For a <strong>${schedule.label}</strong> cycle, automated email reminders are dispatched at <strong>${milestoneStr}</strong> before your deadline.`;

      badgesEl.innerHTML = schedule.milestones.map(m => {
        const isCritical = m === 1;
        const text = isCritical ? 'T-24h Critical Notice' : `T-${m}d Reminder`;
        const bg = isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)';
        const border = isCritical ? 'rgba(239, 68, 68, 0.35)' : 'rgba(56, 189, 248, 0.3)';
        const color = isCritical ? '#f87171' : '#38bdf8';
        return `<span style="background:${bg};border:1px solid ${border};color:${color};font-size:0.75rem;padding:3px 8px;border-radius:12px;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
          <span>${isCritical ? '🚨' : '⏰'}</span> ${text}
        </span>`;
      }).join('');
    },

    injectTopbarWidget: () => {
      const topbarRight = document.querySelector('.topbar-right');
      if (!topbarRight || document.getElementById('heartbeatTopbarWidget')) return;

      const widget = document.createElement('div');
      widget.className = 'heartbeat-topbar-widget';
      widget.id = 'heartbeatTopbarWidget';
      widget.title = 'Dead Man\'s Switch — Click to view heartbeat settings or check in';
      widget.innerHTML = `
        <span class="heartbeat-pulse-icon" aria-hidden="true">❤️</span>
        <div class="heartbeat-topbar-text">
          <span class="heartbeat-topbar-label">HEARTBEAT</span>
          <span class="heartbeat-topbar-timer" id="heartbeatTopbarTimer">29d 23h 59m</span>
        </div>
        <button type="button" class="btn-alive-quick" id="btnAliveQuick" title="I'm Alive Check-in">
          I'm Alive
        </button>
      `;

      // Insert right before Theme Toggle
      const themeToggle = document.getElementById('themeToggleBtn');
      if (themeToggle) {
        topbarRight.insertBefore(widget, themeToggle);
      } else {
        topbarRight.prepend(widget);
      }

      // Clicking widget outside of "I'm Alive" button opens modal
      widget.addEventListener('click', (e) => {
        if (!e.target.closest('#btnAliveQuick')) {
          window.AegisOwner.openModal('heartbeatConfigModal');
        }
      });
    },

    injectModal: () => {
      if (document.getElementById('heartbeatConfigModal')) return;

      const modalHtml = `
        <div class="modal-overlay" id="heartbeatConfigModal">
          <div class="modal-content" style="max-width: 540px;">
            <div class="modal-header">
              <div style="display:flex;align-items:center;gap:10px;">
                <span style="font-size:1.3rem;">❤️</span>
                <h3 class="modal-title">Dead Man's Switch Protocol</h3>
              </div>
              <button class="modal-close-btn" data-modal-close aria-label="Close modal">&times;</button>
            </div>
            <div class="modal-body">
              <div class="modal-heartbeat-content">
                <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5;">
                  AegisVault protects your estate by requiring a periodic heartbeat confirmation. If you don't click <strong>"I'm Alive"</strong> before this timer reaches zero, a grace period begins followed by shard release to your designated trustees.
                </p>

                <div class="heartbeat-form-group">
                  <label class="heartbeat-form-label" for="selectHeartbeatInterval">Heartbeat Interval</label>
                  <span class="heartbeat-form-sub">How often you must confirm check-in:</span>
                  <select class="heartbeat-select" id="selectHeartbeatInterval">
                    <option value="7">Every 7 Days (High Security / Weekly)</option>
                    <option value="14">Every 14 Days (Bi-weekly)</option>
                    <option value="30" selected>Every 30 Days (Monthly — Recommended)</option>
                    <option value="60">Every 60 Days (Bi-monthly)</option>
                    <option value="90">Every 90 Days (Quarterly)</option>
                    <option value="180">Every 180 Days (Half-Yearly)</option>
                    <option value="365">Every 365 Days (Annual Check-in)</option>
                  </select>
                </div>

                <!-- Dynamic Email Reminder Notification Schedule Box -->
                <div class="heartbeat-reminder-schedule-box" id="heartbeatReminderScheduleBox" style="margin: 12px 0 16px 0; padding: 12px 14px; background: rgba(56, 189, 248, 0.06); border: 1px solid rgba(56, 189, 248, 0.22); border-radius: 8px;">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                    <span style="font-size:0.75rem;font-weight:700;color:var(--accent-cyan);letter-spacing:0.5px;text-transform:uppercase;display:flex;align-items:center;gap:6px;">
                      <span>📧</span> Automated Email Reminders
                    </span>
                    <span style="font-size:0.68rem;background:rgba(56,189,248,0.15);color:#38bdf8;padding:2px 7px;border-radius:10px;font-weight:600;">Interval-Scaled</span>
                  </div>
                  <p id="heartbeatScheduleDescription" style="font-size:0.8rem;color:var(--text-secondary);margin:0 0 8px 0;line-height:1.45;">
                    Loading schedule...
                  </p>
                  <div id="heartbeatMilestoneBadges" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
                    <!-- Milestone badges populated via JS -->
                  </div>
                  <div style="display:flex;justify-content:flex-end;">
                    <button type="button" class="btn btn-outline" id="btnSendTestReminder" style="border-color: rgba(56,189,248,0.4); color: #38bdf8; font-size:0.76rem; padding: 4px 10px; display:inline-flex; align-items:center; gap:5px; border-radius:6px; cursor:pointer; background: transparent;">
                      <span>✉️</span> Send Test Reminder Email
                    </button>
                  </div>
                </div>

                <div class="heartbeat-form-group">
                  <label class="heartbeat-form-label" for="selectGracePeriod">Escalation Grace Period</label>
                  <span class="heartbeat-form-sub">Time given to confirm after a missed heartbeat:</span>
                  <select class="heartbeat-select" id="selectGracePeriod">
                    <option value="3">3 Days (Urgent)</option>
                    <option value="7" selected>7 Days (Standard)</option>
                    <option value="14">14 Days (Extended)</option>
                    <option value="30">30 Days (Maximum Security Margin)</option>
                  </select>
                </div>

                <div class="heartbeat-simulation-box">
                  <div>
                    <strong style="font-size:0.82rem;color:var(--status-warning);display:block;">Timer Sandbox Mode</strong>
                    <span style="font-size:0.73rem;color:var(--text-muted);">Jump the timer to 12s remaining to see warning states.</span>
                  </div>
                  <button type="button" class="btn-simulate-urgent" id="btnSimulateUrgent">
                    Simulate 12s Expiry
                  </button>
                </div>
              </div>
            </div>
            <div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center;">
              <button type="button" class="btn btn-outline" data-modal-close>Close</button>
              <div style="display:flex;gap:8px;">
                <button type="button" class="btn btn-primary" id="btnSaveHeartbeatConfig">Save Protocol</button>
              </div>
            </div>
          </div>
        </div>
      `;

      const div = document.createElement('div');
      div.innerHTML = modalHtml;
      document.body.appendChild(div.firstElementChild);

      // Wire close buttons for the new modal
      const newModal = document.getElementById('heartbeatConfigModal');
      if (newModal) {
        newModal.querySelectorAll('[data-modal-close]').forEach(b => {
          b.addEventListener('click', () => window.AegisOwner.closeModal('heartbeatConfigModal'));
        });
        newModal.addEventListener('click', (e) => {
          if (e.target === newModal) window.AegisOwner.closeModal('heartbeatConfigModal');
        });

        // Initialize select value from storage
        const sel = document.getElementById('selectHeartbeatInterval');
        if (sel) {
          sel.value = String(window.AegisHeartbeat.getIntervalDays());
          window.AegisHeartbeat.renderReminderSchedule(parseInt(sel.value, 10));

          // When interval dropdown changes, re-render reminder schedule immediately
          sel.addEventListener('change', () => {
            const days = parseInt(sel.value, 10) || 30;
            window.AegisHeartbeat.renderReminderSchedule(days);
          });
        }

        // Send test reminder button
        const btnTest = document.getElementById('btnSendTestReminder');
        if (btnTest) {
          btnTest.addEventListener('click', async (e) => {
            e.preventDefault();
            btnTest.disabled = true;
            btnTest.innerHTML = '<span>⏳</span> Sending...';
            try {
              if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
                const res = await window.AegisAPI.post('/owner/heartbeat/test-reminder/');
                window.AegisOwner?.showToast(res.detail || 'Test reminder email dispatched to your inbox!', 'success');
              } else {
                window.AegisOwner?.showToast('Test email simulated: 7, 5, 3 and 1 day milestones verified.', 'info');
              }
            } catch (err) {
              window.AegisOwner?.showToast(err.message || 'Failed to dispatch test reminder email.', 'error');
            } finally {
              btnTest.disabled = false;
              btnTest.innerHTML = '<span>✉️</span> Send Test Reminder Email';
            }
          });
        }

        // Save button
        const btnSave = document.getElementById('btnSaveHeartbeatConfig');
        if (btnSave) {
          btnSave.addEventListener('click', () => {
            const days = parseInt(sel.value, 10) || 30;
            window.AegisHeartbeat.setIntervalDays(days);
            window.AegisOwner.closeModal('heartbeatConfigModal');
            window.AegisOwner.showToast(`Dead Man's Switch protocol updated to Every ${days} Days.`, 'success');
          });
        }

        // Sandbox test button
        const btnSim = document.getElementById('btnSimulateUrgent');
        if (btnSim) {
          btnSim.addEventListener('click', () => {
            window.AegisHeartbeat.simulateNearExpiry();
            window.AegisOwner.closeModal('heartbeatConfigModal');
          });
        }
      }
    }
  };

  // Universal Owner Sign Out
  window.signOutOwner = function () {
    if (window.AegisOwner && window.AegisOwner.showToast) {
      window.AegisOwner.showToast('Signing out... Redirecting to Authentication Gateway', 'info');
    }

    try {
      const refresh = localStorage.getItem('aegis_refresh_token');
      if (refresh) {
        fetch('/api/v1/auth/logout/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh })
        }).catch(() => {});
      }
    } catch (e) {}

    try {
      localStorage.removeItem('aegis_auth_role');
      localStorage.removeItem('aegis_user');
      localStorage.removeItem('aegis_access_token');
      localStorage.removeItem('aegis_refresh_token');
      localStorage.removeItem('aegis_owner_session');
    } catch (e) {}

    setTimeout(() => {
      window.location.href = '/auth.html';
    }, 500);
  };
  window.AegisOwner.signOut = window.signOutOwner;

  // --------------------------------------------------------------------------
  // AegisVault Legal & Support Modal (Privacy, Terms, Help & Support)
  // --------------------------------------------------------------------------
  window.openAegisInfoModal = function (initialTab) {
    let modal = document.getElementById('aegisInfoModal');
    if (!modal) {
      const template = document.createElement('div');
      template.id = 'aegisInfoModal';
      template.className = 'aegis-info-modal-backdrop';
      template.setAttribute('role', 'dialog');
      template.setAttribute('aria-modal', 'true');
      template.setAttribute('aria-labelledby', 'aegisInfoModalTitle');

      template.innerHTML = `
        <div class="aegis-info-modal">
          <div class="aegis-info-modal-header">
            <div class="aegis-info-header-brand">
              <div class="aegis-info-shield-icon">
                <svg viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 2L3 8V20C3 31.2 10.3 41.5 20 44C29.7 41.5 37 31.2 37 20V8L20 2Z" stroke="#F97316" stroke-width="2.5" fill="rgba(249, 115, 22, 0.12)"/>
                  <path d="M20 8L8 13V21C8 28.5 13.1 35.5 20 37.5C26.9 35.5 32 28.5 32 21V13L20 8Z" fill="#F97316"/>
                </svg>
              </div>
              <div>
                <h2 class="aegis-info-modal-title" id="aegisInfoModalTitle">AegisVault Legal &amp; Support</h2>
                <span class="aegis-info-modal-sub">Zero-Knowledge Digital Custody &amp; Security Protocol</span>
              </div>
            </div>
            <button type="button" class="aegis-info-close-btn" data-info-modal-close aria-label="Close modal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="aegis-info-tabs" role="tablist">
            <button type="button" class="aegis-info-tab" data-tab-target="privacy" role="tab" aria-selected="false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Privacy Policy</span>
            </button>
            <button type="button" class="aegis-info-tab" data-tab-target="terms" role="tab" aria-selected="false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
              <span>Terms of Service</span>
            </button>
            <button type="button" class="aegis-info-tab" data-tab-target="support" role="tab" aria-selected="false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>Help &amp; Support</span>
            </button>
          </div>

          <div class="aegis-info-body">
            <!-- 1. PRIVACY TAB -->
            <div class="aegis-info-pane" id="pane-privacy" role="tabpanel">
              <p class="aegis-info-lead">
                AegisVault enforces a strict <strong>Zero-Knowledge Security Architecture</strong>. Your sensitive legacy documents, credentials, and digital assets are encrypted locally on your client machine before ever touching network transit.
              </p>

              <div class="aegis-info-section">
                <h3 class="aegis-info-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Client-Side End-to-End Encryption
                </h3>
                <p class="aegis-info-text">
                  All vault items are sealed using authenticated <strong>AES-256-GCM</strong> cipher primitives with PBKDF2 / Argon2 key derivation. Your master passphrase never leaves your browser and is never stored in plaintext on our servers.
                </p>
              </div>

              <div class="aegis-info-card-grid">
                <div class="aegis-info-mini-card">
                  <h4>Zero Plaintext</h4>
                  <p>AegisVault engineers and automated processes have zero technical ability to read, decrypt, or tamper with your vault contents.</p>
                </div>
                <div class="aegis-info-mini-card">
                  <h4>Shamir Sharding</h4>
                  <p>Secret recovery keys are split into cryptographic mathematical shards. No single trustee holds the complete decryption key.</p>
                </div>
                <div class="aegis-info-mini-card">
                  <h4>Immutable Auditing</h4>
                  <p>Every authentication event, heartbeat check, and quorum release action produces a tamper-proof cryptographic audit log.</p>
                </div>
              </div>

              <div class="aegis-info-section">
                <h3 class="aegis-info-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Data Minimization &amp; Ownership
                </h3>
                <p class="aegis-info-text">
                  We collect only necessary cryptographic metadata: email identifiers, salted hashes, encrypted ciphertext payloads, and timestamped telemetry. You maintain 100% legal ownership of your data with the right to permanently purge your vault at any time.
                </p>
              </div>
            </div>

            <!-- 2. TERMS TAB -->
            <div class="aegis-info-pane" id="pane-terms" role="tabpanel">
              <p class="aegis-info-lead">
                By utilizing AegisVault, you enter into a non-custodial cryptographic custody and contingency protocol agreement governed by deterministic mathematical conditions.
              </p>

              <div class="aegis-info-section">
                <h3 class="aegis-info-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  1. Non-Custodial Protocol Nature
                </h3>
                <p class="aegis-info-text">
                  AegisVault coordinates automated zero-knowledge digital custody and contingency triggers. AegisVault does not act as a traditional fiduciary bank or legal executor. The release of your digital assets is strictly governed by the cryptographic conditions and trustee quorums you configure.
                </p>
              </div>

              <div class="aegis-info-section">
                <h3 class="aegis-info-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  2. Trustee &amp; Quorum Responsibilities
                </h3>
                <p class="aegis-info-text">
                  Designated trustees agree to safeguard their assigned cryptographic keys and verify proof-of-life status in good faith. A vault release cannot be triggered until the pre-defined <em>k-of-n</em> quorum threshold is cryptographically submitted and reconstructed.
                </p>
              </div>

              <div class="aegis-info-section">
                <h3 class="aegis-info-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  3. Dead Man's Switch (Heartbeat Check-In)
                </h3>
                <p class="aegis-info-text">
                  Owners must confirm recurring heartbeat pings within their configured interval. If check-ins cease, AegisVault initiates grace-period reminder protocols before notifying trustees. Owners retain master emergency cancellation override at any stage prior to quorum completion.
                </p>
              </div>

              <div class="aegis-info-section">
                <h3 class="aegis-info-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  4. Master Passphrase Custody
                </h3>
                <p class="aegis-info-text">
                  Because AegisVault is zero-knowledge, we cannot reset or recover a forgotten master passphrase. You are solely responsible for keeping offline backups of your master access keys.
                </p>
              </div>
            </div>

            <!-- 3. SUPPORT TAB -->
            <div class="aegis-info-pane" id="pane-support" role="tabpanel">
              <p class="aegis-info-lead">
                Need assistance with vault recovery, trustee verification, or security protocols? Our technical and cryptographic triage team is available 24/7.
              </p>

              <div class="aegis-info-card-grid">
                <div class="aegis-info-mini-card">
                  <h4>🚨 Emergency Vault Freeze</h4>
                  <p>Notice unexpected activity? Use your master override in Profile &amp; Security or contact emergency triage below.</p>
                </div>
                <div class="aegis-info-mini-card">
                  <h4>📬 Direct Email Triage</h4>
                  <p><strong>support@aegisvault.io</strong><br>Target response time &lt; 2 hours for active quorum and cryptographic events.</p>
                </div>
                <div class="aegis-info-mini-card">
                  <h4>🛡️ Zero-Knowledge Assurance</h4>
                  <p>Our support team will never ask for your master password, seed phrase, or private key shards.</p>
                </div>
              </div>

              <div class="aegis-info-section" style="margin-top: 1.5rem;">
                <h3 class="aegis-info-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Frequently Asked Questions
                </h3>
                <div class="aegis-faq-list">
                  <div class="aegis-faq-item">
                    <button type="button" class="aegis-faq-question">
                      <span>How does Shamir's Secret Sharing protect my digital assets?</span>
                      <svg class="aegis-faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="aegis-faq-answer">
                      Your master key is split into mathematically independent shards using Shamir's Secret Sharing scheme (e.g., 2-of-3). No single trustee can view or decrypt your vault alone. Only when the minimum required threshold of trustees submit their shards together can the vault be reconstructed.
                    </div>
                  </div>

                  <div class="aegis-faq-item">
                    <button type="button" class="aegis-faq-question">
                      <span>What happens if a designated trustee loses their device or key?</span>
                      <svg class="aegis-faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="aegis-faq-answer">
                      As long as you have enough other active trustees to meet your threshold (e.g. 2 out of 3), the quorum will still succeed. Vault owners can also rotate keys and replace unresponsive trustees at any time from the Trustees Management panel.
                    </div>
                  </div>

                  <div class="aegis-faq-item">
                    <button type="button" class="aegis-faq-question">
                      <span>Can AegisVault staff decrypt my files or reset my password?</span>
                      <svg class="aegis-faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="aegis-faq-answer">
                      No. Under our Zero-Knowledge security architecture, your master password is never transmitted to or stored on our servers. We possess only encrypted ciphertext blobs and have zero mathematical capability to decrypt your data.
                    </div>
                  </div>

                  <div class="aegis-faq-item">
                    <button type="button" class="aegis-faq-question">
                      <span>Can I cancel a release after verification starts?</span>
                      <svg class="aegis-faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="aegis-faq-answer">
                      Yes! Vault owners have full emergency override authority. As long as the quorum threshold has not been fully verified and executed, you can click "Cancel Release" or check in on your heartbeat to immediately abort the process.
                    </div>
                  </div>
                </div>
              </div>

              <!-- Interactive Support Ticket Form -->
              <div class="aegis-support-form-card">
                <h4 class="aegis-support-form-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Submit a Support Inquiry
                </h4>
                <form id="aegisSupportForm" onsubmit="return false;">
                  <div class="aegis-form-grid">
                    <div class="aegis-form-group">
                      <label for="aegisSupportCategory">Category</label>
                      <select id="aegisSupportCategory" class="aegis-form-select">
                        <option value="vault-security">Vault Security &amp; Encryption</option>
                        <option value="trustee-quorum">Trustee &amp; Quorum Coordination</option>
                        <option value="heartbeat-timing">Heartbeat &amp; Release Triggers</option>
                        <option value="account-billing">Account &amp; Access Assistance</option>
                      </select>
                    </div>
                    <div class="aegis-form-group">
                      <label for="aegisSupportPriority">Priority Level</label>
                      <select id="aegisSupportPriority" class="aegis-form-select">
                        <option value="normal">Standard Inquiry</option>
                        <option value="urgent">Urgent Coordination</option>
                        <option value="emergency">🚨 Security / Vault Emergency</option>
                      </select>
                    </div>
                  </div>
                  <div class="aegis-form-group">
                    <label for="aegisSupportSubject">Subject</label>
                    <input type="text" id="aegisSupportSubject" class="aegis-form-input" placeholder="Brief summary of your question or issue" required>
                  </div>
                  <div class="aegis-form-group">
                    <label for="aegisSupportMessage">Message</label>
                    <textarea id="aegisSupportMessage" class="aegis-form-textarea" rows="3" placeholder="Provide details so our security team can assist you (do NOT include sensitive passwords or keys)" required></textarea>
                  </div>
                  <button type="submit" class="aegis-btn-submit-ticket" id="btnSubmitSupportTicket">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    <span>Send Message to Support</span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div class="aegis-info-footer">
            <div class="aegis-info-badge">
              <span class="aegis-info-dot"></span>
              <span>AES-256-GCM &bull; Client-Side Zero Knowledge Protocol Active</span>
            </div>
            <button type="button" class="aegis-info-btn-close" data-info-modal-close>Close</button>
          </div>
        </div>
      `;

      document.body.appendChild(template);
      modal = template;

      // Tab switching
      const tabs = modal.querySelectorAll('.aegis-info-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const targetKey = tab.getAttribute('data-tab-target');
          switchTab(targetKey);
        });
      });

      // Close handlers
      modal.querySelectorAll('[data-info-modal-close]').forEach(btn => {
        btn.addEventListener('click', closeModal);
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
          closeModal();
        }
      });

      // FAQ accordion
      modal.querySelectorAll('.aegis-faq-question').forEach(q => {
        q.addEventListener('click', () => {
          const item = q.closest('.aegis-faq-item');
          if (item) item.classList.toggle('open');
        });
      });

      // Support Form submission
      const form = modal.querySelector('#aegisSupportForm');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const subject = modal.querySelector('#aegisSupportSubject')?.value.trim();
          const message = modal.querySelector('#aegisSupportMessage')?.value.trim();
          if (!subject || !message) {
            triggerToast('Please complete both subject and message.', 'warning');
            return;
          }
          const ticketId = 'AGS-' + Math.floor(1000 + Math.random() * 9000);
          triggerToast(`Support ticket #${ticketId} created! Our triage team will follow up within 2 hours.`, 'success');
          form.reset();
        });
      }
    }

    function switchTab(key) {
      const validKey = (key === 'terms' || key === 'support') ? key : 'privacy';
      modal.querySelectorAll('.aegis-info-tab').forEach(t => {
        const isMatch = t.getAttribute('data-tab-target') === validKey;
        t.classList.toggle('active', isMatch);
        t.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      });
      modal.querySelectorAll('.aegis-info-pane').forEach(p => {
        p.classList.toggle('active', p.id === `pane-${validKey}`);
      });
      const body = modal.querySelector('.aegis-info-body');
      if (body) body.scrollTop = 0;
    }

    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    function triggerToast(msg, type = 'info') {
      if (window.AegisOwner && typeof window.AegisOwner.showToast === 'function') {
        window.AegisOwner.showToast(msg, type);
      } else if (typeof window.showToast === 'function') {
        window.showToast(msg, type);
      } else {
        alert(msg);
      }
    }

    // Activate the requested tab and display modal
    switchTab(initialTab || 'privacy');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  window.AegisOwner.openLegalModal = window.openAegisInfoModal;
})();


