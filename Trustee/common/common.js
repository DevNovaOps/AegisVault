/**
 * AegisVault Trustee Panel - Common Interactions & UI Handlers
 */

document.addEventListener('DOMContentLoaded', () => {
  if (requireTrusteeAuth()) {
    syncTrusteeUserProfile();
  }
  initMobileSidebar();
  initDropdowns();
  initSearch();
  initModals();
});

function getStoredTrusteeUser() {
  try {
    const raw = localStorage.getItem('aegis_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function requireTrusteeAuth() {
  const user = getStoredTrusteeUser();
  const token = localStorage.getItem('aegis_access_token');
  if (!user && !token) {
    window.location.href = '/auth.html';
    return false;
  }
  return true;
}

function syncTrusteeUserProfile() {
  const user = getStoredTrusteeUser();
  if (!user) return;

  const name = user.name || (user.email ? user.email.split('@')[0] : 'Trustee');
  const parts = name.trim().split(/\s+/);
  const initials = (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].substring(0, 2)).toUpperCase();

  document.querySelectorAll('.profile-name, .profile-user-fullname, .overview-name').forEach(el => {
    el.textContent = name;
  });
  document.querySelectorAll('.profile-avatar-circle, .avatar-initials, .avatar-text').forEach(el => {
    el.textContent = initials;
  });
  document.querySelectorAll('.profile-email, .user-email').forEach(el => {
    if (user.email) el.textContent = user.email;
  });

  const profLegalName = document.getElementById('profLegalName');
  if (profLegalName && user.name) {
    profLegalName.value = user.name;
  }

  // Populate sidebar badges from live API data
  fetchSidebarBadgeCounts();
}

function fetchSidebarBadgeCounts() {
  if (!window.AegisAPI || !window.AegisAPI.isAuthenticated()) return;

  window.AegisAPI.get('/trustee/dashboard/').then(data => {
    const sidebarInvBadge = document.getElementById('sidebarInvBadge');
    if (sidebarInvBadge) {
      const pending = data.pending_invitations || 0;
      sidebarInvBadge.textContent = pending;
      sidebarInvBadge.style.display = pending > 0 ? 'inline-flex' : 'none';
    }
  }).catch(() => {
    // Silent — don't block page load for badge counts
  });
}

// Mobile Sidebar Toggle
function initMobileSidebar() {
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const sidebar = document.querySelector('.trustee-sidebar');
  if (!toggleBtn || !sidebar) return;

  // Create overlay if not present
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      backdrop-filter: blur(2px); z-index: 95; display: none;
    `;
    document.body.appendChild(overlay);
  }

  function openSidebar() {
    sidebar.classList.add('mobile-open');
    overlay.style.display = 'block';
  }

  function closeSidebar() {
    sidebar.classList.remove('mobile-open');
    overlay.style.display = 'none';
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (sidebar.classList.contains('mobile-open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  overlay.addEventListener('click', closeSidebar);
}

// Dropdowns (Profile)
function initDropdowns() {
  const profileBtn = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown');

  function closeAllDropdowns() {
    if (profileDropdown) profileDropdown.classList.remove('show');
  }

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isShown = profileDropdown.classList.contains('show');
      closeAllDropdowns();
      if (!isShown) profileDropdown.classList.add('show');
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-panel')) {
      closeAllDropdowns();
    }
  });
}

// Global Search simulation
function initSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      showToast(`Searching for "${searchInput.value.trim()}"...`);
    }
  });
}

// Toast Notifications Helper
window.showToast = function (message, type = 'info') {
  let container = document.querySelector('.trustee-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'trustee-toast-container';
    document.body.appendChild(container);
  }

  let iconSvg = '';
  let iconColor = 'var(--brand-orange)';
  let borderColor = 'var(--brand-orange-border)';

  if (type === 'success') {
    iconColor = 'var(--accent-emerald, #10B981)';
    borderColor = 'var(--accent-emerald-border, rgba(16, 185, 129, 0.4))';
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
  } else if (type === 'error') {
    iconColor = 'var(--coral, #EF4444)';
    borderColor = 'rgba(239, 68, 68, 0.4)';
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  } else if (type === 'warning') {
    iconColor = 'var(--accent-amber, #F59E0B)';
    borderColor = 'rgba(245, 158, 11, 0.4)';
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
  } else {
    iconColor = 'var(--brand-orange, #F97316)';
    borderColor = 'var(--brand-orange-border, rgba(249, 115, 22, 0.3))';
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
  }

  const toast = document.createElement('div');
  toast.className = `trustee-toast ${type}`;
  toast.style.borderColor = borderColor;
  toast.innerHTML = `
    <span style="display:flex;align-items:center;color:${iconColor};flex-shrink:0;">
      ${iconSvg}
    </span>
    <span style="color:var(--text-primary);font-weight:500;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// Modal Helper
function initModals() {
  // Close buttons
  document.querySelectorAll('[data-modal-close], [data-close-modal], .modal-close, .modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.trustee-modal-backdrop, .modal');
      if (modal) modal.classList.remove('active');
    });
  });

  // Backdrop overlay clicks
  document.querySelectorAll('.trustee-modal-backdrop, .modal').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop || e.target.classList.contains('modal-overlay')) {
        backdrop.classList.remove('active');
      }
    });
  });

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.trustee-modal-backdrop.active, .modal.active').forEach(m => {
        m.classList.remove('active');
      });
    }
  });
}

window.openModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
};

window.closeModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
};

// Universal Trustee Sign Out
window.signOutTrustee = function () {
  if (typeof window.showToast === 'function') {
    window.showToast('Signing out... Redirecting to Authentication Gateway', 'info');
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
    localStorage.removeItem('aegis_trustee_session');
  } catch (e) {}

  setTimeout(() => {
    window.location.href = '/auth.html';
  }, 500);
};

// Global Link & Action Interceptors
function initGlobalInterceptors() {
  // Ensure profileDropdown has Sign Out if not already present
  const profileDropdown = document.getElementById('profileDropdown');
  if (profileDropdown && !profileDropdown.textContent.includes('Sign Out')) {
    const divider = document.createElement('div');
    divider.className = 'dropdown-divider';
    divider.style.cssText = 'height: 1px; background: var(--border-subtle, rgba(255,255,255,0.08)); margin: 0.35rem 0;';
    profileDropdown.appendChild(divider);

    const signoutBtn = document.createElement('a');
    signoutBtn.href = 'javascript:void(0)';
    signoutBtn.className = 'dropdown-item';
    signoutBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;vertical-align:middle;">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
      </svg>
      <span>Sign Out</span>
    `;
    signoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.signOutTrustee();
    });
    profileDropdown.appendChild(signoutBtn);
  }

  // Intercept any click on Sign Out or Footer Privacy/Terms/Support
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button');
    if (!target) return;

    const text = target.textContent.trim().toLowerCase();

    // Check for Sign Out
    if (text.includes('sign out') || text === 'sign out') {
      e.preventDefault();
      window.signOutTrustee();
      return;
    }

    // Check for Footer Privacy / Terms / Support links
    const href = target.getAttribute('href');
    if (target.closest('.footer-links, .trustee-footer, footer') || href === '#' || href === 'javascript:void(0)') {
      if (text === 'privacy' || text.includes('privacy policy')) {
        e.preventDefault();
        window.openAegisInfoModal('privacy');
      } else if (text === 'terms' || text.includes('terms of service')) {
        e.preventDefault();
        window.openAegisInfoModal('terms');
      } else if (text === 'support' || text.includes('help & support') || text.includes('help')) {
        e.preventDefault();
        window.openAegisInfoModal('support');
      }
    }
  });
}

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
              AegisVault enforces a strict <strong>Zero-Knowledge Security Architecture</strong>. Your sensitive legacy documents, credentials, and digital assets are encrypted locally on the owner's machine before ever touching network transit.
            </p>

            <div class="aegis-info-section">
              <h3 class="aegis-info-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Client-Side End-to-End Encryption
              </h3>
              <p class="aegis-info-text">
                All vault items are sealed using authenticated <strong>AES-256-GCM</strong> cipher primitives with PBKDF2 / Argon2 key derivation. Passphrases never leave the client browser and are never stored in plaintext on our servers.
              </p>
            </div>

            <div class="aegis-info-card-grid">
              <div class="aegis-info-mini-card">
                <h4>Zero Plaintext</h4>
                <p>AegisVault engineers and automated processes have zero technical ability to read, decrypt, or tamper with vault contents or trustee shards.</p>
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
                We collect only necessary cryptographic metadata: email identifiers, salted hashes, encrypted ciphertext payloads, and timestamped telemetry. Vault owners maintain 100% legal ownership of their data.
              </p>
            </div>
          </div>

          <!-- 2. TERMS TAB -->
          <div class="aegis-info-pane" id="pane-terms" role="tabpanel">
            <p class="aegis-info-lead">
              By utilizing AegisVault as an owner or trustee, you participate in a non-custodial cryptographic custody and contingency protocol governed by deterministic mathematical conditions.
            </p>

            <div class="aegis-info-section">
              <h3 class="aegis-info-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                1. Non-Custodial Protocol Nature
              </h3>
              <p class="aegis-info-text">
                AegisVault coordinates automated zero-knowledge digital custody and contingency triggers. AegisVault does not act as a traditional fiduciary bank or legal executor. The release of digital assets is strictly governed by cryptographic conditions and trustee quorums.
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
                Owners confirm recurring heartbeat pings within their configured interval. If check-ins cease, AegisVault initiates grace-period reminder protocols before notifying trustees. Owners retain master emergency cancellation override at any stage prior to quorum completion.
              </p>
            </div>

            <div class="aegis-info-section">
              <h3 class="aegis-info-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                4. Master Passphrase Custody
              </h3>
              <p class="aegis-info-text">
                Because AegisVault is zero-knowledge, we cannot reset or recover forgotten master passphrases. Users are solely responsible for keeping offline backups of master access keys and seed phrases.
              </p>
            </div>
          </div>

          <!-- 3. SUPPORT TAB -->
          <div class="aegis-info-pane" id="pane-support" role="tabpanel">
            <p class="aegis-info-lead">
              Need assistance with trustee invitations, shard verification, or release coordination? Our cryptographic triage team is available 24/7.
            </p>

            <div class="aegis-info-card-grid">
              <div class="aegis-info-mini-card">
                <h4>🛡️ Trustee Guidance</h4>
                <p>Learn how to securely accept invitations, store key shards, and coordinate during proof-of-life verification.</p>
              </div>
              <div class="aegis-info-mini-card">
                <h4>📬 Direct Email Triage</h4>
                <p><strong>support@aegisvault.io</strong><br>Target response time &lt; 2 hours for active quorum and cryptographic events.</p>
              </div>
              <div class="aegis-info-mini-card">
                <h4>🔒 Zero-Knowledge Guarantee</h4>
                <p>Our support team will never ask for your passwords, trustee key shards, or sensitive credentials.</p>
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
                    <span>What is my responsibility as a designated Trustee?</span>
                    <svg class="aegis-faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <div class="aegis-faq-answer">
                    As a trustee, you hold one mathematical shard of the vault key. You cannot decrypt or view the owner's vault alone. When a release trigger is initiated due to owner inactivity, you will be invited to participate in the quorum verification process to safely unlock the legacy assets for designated beneficiaries.
                  </div>
                </div>

                <div class="aegis-faq-item">
                  <button type="button" class="aegis-faq-question">
                    <span>How does Shamir's Secret Sharing protect digital assets?</span>
                    <svg class="aegis-faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <div class="aegis-faq-answer">
                    The master key is split into mathematically independent shards (e.g. 2-of-3 quorum). No single trustee can reconstruct the master key alone. Only when the predefined quorum threshold of trustees submit valid shards can the vault be reconstituted.
                  </div>
                </div>

                <div class="aegis-faq-item">
                  <button type="button" class="aegis-faq-question">
                    <span>Can AegisVault staff decrypt files or reset credentials?</span>
                    <svg class="aegis-faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <div class="aegis-faq-answer">
                    No. Under our Zero-Knowledge security architecture, passphrases and private shards are never sent to or stored on our servers in plaintext. We possess only encrypted ciphertext blobs and have zero mathematical capability to decrypt vault data.
                  </div>
                </div>

                <div class="aegis-faq-item">
                  <button type="button" class="aegis-faq-question">
                    <span>What if I cannot locate an invitation or lose my shard?</span>
                    <svg class="aegis-faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <div class="aegis-faq-answer">
                    Check your Invitations tab to resend or claim pending invitations. If a shard is permanently lost, notify the vault owner so they can re-shard their master key and issue fresh trustee shares before any quorum event occurs.
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
                      <option value="trustee-invitation">Trustee Invitation &amp; Shard Claim</option>
                      <option value="quorum-verification">Quorum Verification &amp; Release</option>
                      <option value="vault-security">Cryptographic Verification &amp; Security</option>
                      <option value="account-billing">Account Access &amp; Profile</option>
                    </select>
                  </div>
                  <div class="aegis-form-group">
                    <label for="aegisSupportPriority">Priority Level</label>
                    <select id="aegisSupportPriority" class="aegis-form-select">
                      <option value="normal">Standard Inquiry</option>
                      <option value="urgent">Urgent Coordination</option>
                      <option value="emergency">🚨 Security / Quorum Emergency</option>
                    </select>
                  </div>
                </div>
                <div class="aegis-form-group">
                  <label for="aegisSupportSubject">Subject</label>
                  <input type="text" id="aegisSupportSubject" class="aegis-form-input" placeholder="Brief summary of your question or issue" required>
                </div>
                <div class="aegis-form-group">
                  <label for="aegisSupportMessage">Message</label>
                  <textarea id="aegisSupportMessage" class="aegis-form-textarea" rows="3" placeholder="Provide details so our security team can assist you (do NOT include sensitive private key shards)" required></textarea>
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
    if (typeof window.showToast === 'function') {
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
window.openLegalModal = window.openAegisInfoModal;

document.addEventListener('DOMContentLoaded', () => {
  initGlobalInterceptors();
});

