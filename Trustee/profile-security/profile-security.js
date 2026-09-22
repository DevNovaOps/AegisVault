/**
 * AegisVault Trustee Panel - Profile & Security Module Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initProfileForm();
  initPasswordForm();
});

/**
 * Profile Form Submission
 */
function initProfileForm() {
  const form = document.getElementById('profileForm');
  const btnSave = document.getElementById('btnSaveProfile');
  const legalNameInput = document.getElementById('profLegalName');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newName = legalNameInput?.value.trim() || 'Rakesh Patel';

    if (btnSave) {
      btnSave.disabled = true;
      btnSave.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span>Saving...</span>
      `;
    }

    setTimeout(() => {
      if (btnSave) {
        btnSave.disabled = false;
        btnSave.innerHTML = `
          <span>Save Profile Changes</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        `;
      }

      // Update name on page & topbar
      const userNameHeader = document.querySelector('.profile-user-fullname');
      const topbarName = document.querySelector('.profile-name');
      if (userNameHeader) userNameHeader.textContent = newName;
      if (topbarName) topbarName.textContent = newName;

      showToast('Trustee profile information saved successfully.');
    }, 600);
  });
}

/**
 * Copy Trustee ID
 */
window.copyTrusteeId = function() {
  const input = document.getElementById('profTrusteeId');
  if (input) {
    navigator.clipboard?.writeText(input.value);
    showToast(`Trustee ID "${input.value}" copied to clipboard.`);
  }
};

/**
 * Password Update Form
 */
function initPasswordForm() {
  const form = document.getElementById('passwordForm');
  const currPw = document.getElementById('currPw');
  const newPw = document.getElementById('newPw');
  const confirmPw = document.getElementById('confirmPw');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!currPw.value) {
      showToast('Please enter your current password.', 'error');
      return;
    }

    if (newPw.value.length < 8) {
      showToast('New password must be at least 8 characters long.', 'error');
      return;
    }

    if (newPw.value !== confirmPw.value) {
      showToast('New password and confirmation do not match.', 'error');
      return;
    }

    currPw.value = '';
    newPw.value = '';
    confirmPw.value = '';
    showToast('Master password updated and encrypted successfully.');
  });
}

/**
 * Revoke Other Remote Sessions
 */
window.revokeOtherSessions = function() {
  const sessions = document.querySelectorAll('.session-item:not(.current)');
  sessions.forEach(s => s.remove());
  showToast('All other remote sessions have been terminated.');
};

/**
 * Simulate WebAuthn Key Registration
 */
window.simulateKeyRegistration = function() {
  if (window.closeModal) {
    window.closeModal('registerKeyModal');
  }

  setTimeout(() => {
    const list = document.querySelector('.keys-list');
    if (list) {
      const newItem = document.createElement('div');
      newItem.className = 'key-item';
      newItem.innerHTML = `
        <div class="key-item-left">
          <div class="key-icon-bubble">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          </div>
          <div class="key-details">
            <span class="key-name">FIDO2 Security Key (YubiKey 5 NFC #2)</span>
            <span class="key-meta">FIDO2 / WebAuthn • Registered Just now</span>
          </div>
        </div>
        <div class="key-badges">
          <span class="verified-trustee-badge">Active</span>
        </div>
      `;
      list.appendChild(newItem);
    }

    showToast('New FIDO2 Hardware Key registered and cryptographically bound.');
  }, 300);
};

/**
 * Confirm Emergency Freeze
 */
window.confirmEmergencyFreeze = function() {
  if (window.closeModal) {
    window.closeModal('freezeAccountModal');
  }

  showToast('EMERGENCY FREEZE ACTIVATED. Trustee signing capabilities suspended.', 'error');
};
