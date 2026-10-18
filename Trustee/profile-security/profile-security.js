/**
 * AegisVault Trustee Panel - Profile & Security Module Controller
 * Connected to live Django backend: /api/v1/trustee/profile/
 * All data flows from the database — zero mock data.
 */

document.addEventListener('DOMContentLoaded', () => {
  loadTrusteeProfile();
  initProfileForm();
  initPasswordForm();
});

// ═══════════════════════════════════════════════════════════════════════════════
//  Load Live Profile Data from Backend
// ═══════════════════════════════════════════════════════════════════════════════

async function loadTrusteeProfile() {
  if (!window.AegisAPI || !window.AegisAPI.isAuthenticated()) return;

  try {
    const res = await window.AegisAPI.get('/trustee/profile/');
    const user = res.user || res;
    populateTrusteeProfileUI(user, res.trustee_profiles || []);
  } catch (err) {
    console.warn('[AegisVault] Failed to load trustee profile, using cached user:', err);
    const user = window.AegisAPI.getUser() || {};
    populateTrusteeProfileUI(user, []);
  }
}

function populateTrusteeProfileUI(user, trusteeProfiles) {
  if (!user) return;

  const fullName = user.name || user.email?.split('@')[0] || 'Trustee';
  const email = user.email || 'trustee@aegisvault.io';
  const phone = user.phone || '';
  const is2fa = Boolean(user.is_2fa_enabled);
  const dateJoined = user.date_joined ? new Date(user.date_joined).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

  // Header name / email
  const userNameHeader = document.querySelector('.profile-user-fullname');
  const userEmailHeader = document.querySelector('.profile-user-email');
  if (userNameHeader) userNameHeader.textContent = fullName;
  if (userEmailHeader) userEmailHeader.textContent = email;

  // Form pre-fill
  const inputName = document.getElementById('profLegalName');
  if (inputName) inputName.value = fullName;

  const inputEmail = document.getElementById('profEmail');
  if (inputEmail) inputEmail.value = email;

  const inputPhone = document.getElementById('profPhone');
  if (inputPhone) inputPhone.value = phone;

  // Trustee ID
  const inputId = document.getElementById('profTrusteeId');
  if (inputId) inputId.value = user.id || 'N/A';

  // Member since
  const memberSince = document.getElementById('profMemberSince');
  if (memberSince) memberSince.value = dateJoined;

  // 2FA Status
  update2FAUI(is2fa);

  // Populate linked owner profiles
  const ownersList = document.getElementById('linkedOwnersList');
  if (ownersList) {
    if (trusteeProfiles && trusteeProfiles.length > 0) {
      ownersList.innerHTML = trusteeProfiles.map(tp => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); margin-bottom: 0.65rem;">
          <div style="display: flex; flex-direction: column; gap: 0.2rem;">
            <div style="font-size: 0.92rem; font-weight: 700; color: var(--text-primary);">${tp.owner_name} <span style="font-size: 0.76rem; font-weight: normal; color: var(--text-muted);">&bull; ${tp.owner_email}</span></div>
            <div style="font-size: 0.78rem; color: var(--text-secondary);">${tp.relationship || 'Designated Trustee'} &bull; Appointed ${tp.date_added ? new Date(tp.date_added).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }) : ''}</div>
          </div>
          <span class="verified-trustee-badge" style="font-size: 0.74rem;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            ${tp.verification_status || 'Active'}
          </span>
        </div>
      `).join('');
    } else {
      ownersList.innerHTML = `
        <div style="padding: 1.25rem 1rem; text-align: center; background: var(--bg-surface-elevated); border: 1px dashed var(--border-subtle); border-radius: var(--radius-md);">
          <div style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">No Estate Vaults Assigned Yet</div>
          <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0;">When a vault owner designates you as a trustee and you accept the invitation, their estate vault appointment will appear here.</p>
        </div>
      `;
    }
  }
}

function update2FAUI(isEnabled) {
  const tfaStatus = document.getElementById('tfa-status');
  if (tfaStatus) {
    tfaStatus.className = `status-badge ${isEnabled ? 'verified' : 'declined'}`;
    tfaStatus.innerHTML = `<span class="badge-dot" style="background-color: currentColor;"></span><span>${isEnabled ? 'Enabled' : 'Disabled'}</span>`;
  }

  const tfaBtn = document.getElementById('btnToggle2FA');
  if (tfaBtn) {
    tfaBtn.textContent = isEnabled ? 'Disable 2FA' : 'Enable 2FA';
    if (isEnabled) {
      tfaBtn.classList.add('btn-secondary-outline');
    } else {
      tfaBtn.classList.remove('btn-secondary-outline');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Profile Form — Live API Submission
// ═══════════════════════════════════════════════════════════════════════════════

function initProfileForm() {
  const form = document.getElementById('profileForm');
  const btnSave = document.getElementById('btnSaveProfile');
  const legalNameInput = document.getElementById('profLegalName');
  const phoneInput = document.getElementById('profPhone');

  // 2FA toggle
  const btnToggle2FA = document.getElementById('btnToggle2FA');
  if (btnToggle2FA) {
    btnToggle2FA.addEventListener('click', async () => {
      btnToggle2FA.disabled = true;
      const originalText = btnToggle2FA.textContent;
      btnToggle2FA.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span>Updating...</span>
      `;
      try {
        const res = await window.AegisAPI.post('/trustee/profile/2fa/toggle/');
        const isEnabled = Boolean(res.is_2fa_enabled);
        update2FAUI(isEnabled);

        // Update cached user
        const stored = window.AegisAPI.getUser() || {};
        stored.is_2fa_enabled = isEnabled;
        localStorage.setItem('aegis_user', JSON.stringify(stored));

        window.showToast(`Two-Factor Authentication is now ${isEnabled ? 'Enabled' : 'Disabled'}.`, isEnabled ? 'success' : 'warning');
      } catch (err) {
        window.showToast(`Failed to toggle 2FA: ${err.message}`, 'error');
        btnToggle2FA.textContent = originalText;
      } finally {
        btnToggle2FA.disabled = false;
      }
    });
  }

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newName = legalNameInput?.value.trim() || '';
    const newPhone = phoneInput?.value.trim() || '';

    if (!newName) {
      showToast('Please enter your legal name.', 'error');
      return;
    }

    if (btnSave) {
      btnSave.disabled = true;
      btnSave.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span>Saving...</span>
      `;
    }

    try {
      const res = await window.AegisAPI.put('/trustee/profile/update/', {
        name: newName,
        phone: newPhone
      });

      const updatedUser = res.user || res;

      // Update local session
      const stored = window.AegisAPI.getUser() || {};
      Object.assign(stored, updatedUser);
      localStorage.setItem('aegis_user', JSON.stringify(stored));
      if (window.AegisAPI.syncUserProfileUI) {
        window.AegisAPI.syncUserProfileUI();
      }

      // Update name on page & topbar
      const userNameHeader = document.querySelector('.profile-user-fullname');
      const topbarName = document.querySelector('.profile-name');
      if (userNameHeader) userNameHeader.textContent = newName;
      if (topbarName) topbarName.textContent = newName;

      showToast('Trustee profile information saved successfully.');
    } catch (err) {
      console.error('Profile save failed:', err);
      showToast(`Failed to save profile: ${err.message}`, 'error');
    } finally {
      if (btnSave) {
        btnSave.disabled = false;
        btnSave.innerHTML = `
          <span>Save Profile Changes</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        `;
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Password Update — Live API Submission
// ═══════════════════════════════════════════════════════════════════════════════

function initPasswordForm() {
  const form = document.getElementById('passwordForm');
  const currPw = document.getElementById('currPw');
  const newPw = document.getElementById('newPw');
  const confirmPw = document.getElementById('confirmPw');
  const matchHint = document.getElementById('pwMatchHint');
  const btnUpdate = document.getElementById('btnUpdatePassword');

  if (!form) return;

  function checkPasswordMatch() {
    if (!matchHint) return;
    const p1 = newPw?.value || '';
    const p2 = confirmPw?.value || '';

    if (!p1 && !p2) {
      matchHint.textContent = '';
      return;
    }
    if (p1.length > 0 && p1.length < 8) {
      matchHint.textContent = 'Password must be at least 8 characters.';
      matchHint.style.color = 'var(--coral, #EF4444)';
      return;
    }
    if (p2.length > 0) {
      if (p1 === p2) {
        matchHint.textContent = 'Passwords match.';
        matchHint.style.color = 'var(--accent-emerald, #10B981)';
      } else {
        matchHint.textContent = 'Passwords do not match.';
        matchHint.style.color = 'var(--coral, #EF4444)';
      }
    } else {
      matchHint.textContent = '';
    }
  }

  if (newPw) newPw.addEventListener('input', checkPasswordMatch);
  if (confirmPw) confirmPw.addEventListener('input', checkPasswordMatch);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currPw.value) {
      window.showToast('Please enter your current password.', 'error');
      currPw.focus();
      return;
    }

    if (newPw.value.length < 8) {
      window.showToast('New password must be at least 8 characters long.', 'error');
      newPw.focus();
      return;
    }

    if (newPw.value !== confirmPw.value) {
      window.showToast('New password and confirmation do not match.', 'error');
      confirmPw.focus();
      return;
    }

    if (btnUpdate) {
      btnUpdate.disabled = true;
      btnUpdate.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span>Updating Master Password...</span>
      `;
    }

    try {
      const res = await window.AegisAPI.post('/trustee/profile/change-password/', {
        current_password: currPw.value,
        new_password: newPw.value
      });

      currPw.value = '';
      newPw.value = '';
      confirmPw.value = '';
      if (matchHint) matchHint.textContent = '';
      window.showToast(res.detail || 'Master password updated and encrypted successfully.', 'success');
    } catch (err) {
      console.error('Password change error:', err);
      window.showToast(`Password update failed: ${err.message}`, 'error');
    } finally {
      if (btnUpdate) {
        btnUpdate.disabled = false;
        btnUpdate.innerHTML = 'Update Master Password';
      }
    }
  });
}

/**
 * Toggle Password Visibility Eye Button
 */
window.togglePasswordVisibility = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPw = input.type === 'password';
  input.type = isPw ? 'text' : 'password';
  btn.innerHTML = isPw
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
};

/**
 * Copy Trustee ID
 */
window.copyTrusteeId = function() {
  const input = document.getElementById('profTrusteeId');
  if (input) {
    navigator.clipboard?.writeText(input.value);
    window.showToast(`Trustee ID "${input.value}" copied to clipboard.`, 'success');
  }
};
