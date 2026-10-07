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
        document.body.style.overflow = 'hidden';
      }
    },
    closeModal: (modalId) => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('show');
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
          document.body.style.overflow = '';
        }
      });
    });

    // Close modal on background overlay click
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('show');
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

      // Check for Footer Privacy / Terms links
      const href = target.getAttribute('href');
      if (target.closest('.owner-footer, .footer-right') || href === '#' || href === 'javascript:void(0)') {
        if (text === 'privacy' || text.includes('privacy policy')) {
          e.preventDefault();
          window.AegisOwner.showToast('Privacy Policy: Zero-knowledge protocol with client-side AES-256-GCM encryption.', 'info');
        } else if (text === 'terms' || text.includes('terms of service')) {
          e.preventDefault();
          window.AegisOwner.showToast('Terms of Service: Automated cryptographic custody and Shamir quorum conditions apply.', 'info');
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
        window.location.href = '/AegisVault%20Home/auth.html';
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

      // Update hero greeting banner (e.g. Welcome back, Rakesh! -> Welcome back, Admin!)
      const heroAccent = document.querySelector('.hero-heading .hero-accent');
      if (heroAccent) {
        heroAccent.textContent = firstName + '!';
      }

      // Update legal name field on profile settings page
      const inputFullName = document.getElementById('inputFullName');
      if (inputFullName && user.name) {
        inputFullName.value = user.name;
      }
    }

    // Run auth check and profile sync
    if (requireOwnerAuth()) {
      syncOwnerUserProfile();
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
      } catch (e) {}

      // Sync with backend API
      if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
        window.AegisAPI.post('/owner/heartbeat/checkin/').catch(err => {
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
      const deadline = lastPing + (intervalDays * 24 * 60 * 60 * 1000);
      const remainingMs = deadline - Date.now();

      const isOverdue = remainingMs <= 0;
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
        elTopbarTimer.textContent = isOverdue ? '00d 00h 00m' : `${days}d ${pad(hours)}h ${pad(mins)}m`;
        if (isOverdue) {
          elTopbarTimer.style.color = '#ef4444';
        } else {
          elTopbarTimer.style.color = '';
        }
      }

      // 3. Update Status Badges
      const elBadge = document.getElementById('heartbeatStatusBadge');
      if (elBadge) {
        if (isOverdue) {
          elBadge.className = 'heartbeat-status-badge warning';
          elBadge.innerHTML = '<span class="pulsing-dot"></span><span>GRACE PERIOD: ACTION REQUIRED</span>';
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
          elLastCheckIn.textContent = d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
          <div class="modal-content" style="max-width: 520px;">
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
      window.location.href = '/AegisVault%20Home/auth.html';
    }, 500);
  };
  window.AegisOwner.signOut = window.signOutOwner;
})();


