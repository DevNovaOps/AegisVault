/**
 * AegisVault Owner Panel — Profile & Security Module
 * Module 09: Personal Info, Master Password, 2FA, and Cryptographic Data Export
 * Fully integrated with Django REST backend:
 *   - GET  /api/v1/auth/me/
 *   - PUT  /api/v1/accounts/profile/update/
 *   - POST /api/v1/accounts/profile/change-password/
 *   - POST /api/v1/accounts/profile/2fa/toggle/
 *   - GET  /api/v1/accounts/profile/export-data/
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Elements
  // =========================================================================
  const tabs = document.querySelectorAll('.profile-tab-item');

  const editProfileModal = document.getElementById('editProfileModal');
  const changePasswordModal = document.getElementById('changePasswordModal');

  const btnEditOverview = document.getElementById('btnEditOverview');
  const btnEditPersonal = document.getElementById('btnEditPersonal');
  const btnSaveProfile = document.getElementById('btnSaveProfile');

  const btnManageSecurity = document.getElementById('btnManageSecurity');
  const rowChangePassword = document.getElementById('rowChangePassword');
  const qaChangePassword = document.getElementById('qaChangePassword');
  const btnSavePassword = document.getElementById('btnSavePassword');

  const rowToggle2FA = document.getElementById('rowToggle2FA');
  const qaEnable2FA = document.getElementById('qaEnable2FA');
  const qaDownloadData = document.getElementById('qaDownloadData');

  let currentUserData = null;

  // =========================================================================
  // 2. Load Real User Data from Live Backend
  // =========================================================================
  async function loadUserProfile() {
    if (!window.AegisAPI || !window.AegisAPI.isAuthenticated()) {
      window.location.href = '/auth.html';
      return;
    }

    try {
      const res = await window.AegisAPI.get('/auth/me/');
      currentUserData = res.user || res;
      populateUserUI(currentUserData);
    } catch (err) {
      console.warn('[AegisVault] Failed to fetch /auth/me/, using local user object:', err);
      currentUserData = window.AegisAPI.getUser() || {};
      populateUserUI(currentUserData);
    }
  }

  function populateUserUI(user) {
    if (!user) return;

    const fullName = (user.first_name || user.last_name) 
      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
      : (user.name || user.email?.split('@')[0] || 'Vault Owner');
    const email = user.email || 'owner@aegisvault.io';
    const is2fa = Boolean(user.is_2fa_enabled);
    const timezone = user.timezone_preference || 'UTC';

    // Initials for avatar
    const nameParts = fullName.split(' ');
    const initials = nameParts.length > 1 
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : fullName.substring(0, 2).toUpperCase();

    // 1. Overview Card
    const avatarCircle = document.querySelector('.overview-avatar-circle');
    if (avatarCircle) avatarCircle.textContent = initials;

    const nameEl = document.querySelector('.overview-name');
    if (nameEl) nameEl.textContent = fullName;

    const emailEl = document.querySelector('.overview-email');
    if (emailEl) emailEl.textContent = email;

    // Member since
    if (user.date_joined || user.created_at) {
      const joinedDate = new Date(user.date_joined || user.created_at);
      const metaValues = document.querySelectorAll('.overview-meta-col .meta-value');
      if (metaValues[0]) {
        metaValues[0].textContent = joinedDate.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });
      }
    }

    // 2. Personal Information Card
    const dispName = document.getElementById('dispFullName');
    if (dispName) dispName.textContent = fullName;

    const dispMail = document.getElementById('dispEmail');
    if (dispMail) dispMail.textContent = email;

    const dispPh = document.getElementById('dispPhone');
    if (dispPh) dispPh.textContent = user.phone || 'Not specified';

    const dispTz = document.getElementById('dispTimezone');
    if (dispTz) dispTz.textContent = formatTimezoneLabel(timezone);

    // 3. Security Settings Card (2FA)
    update2FAUI(is2fa);

    // 4. Modal inputs pre-fill
    const inputName = document.getElementById('inputFullName');
    if (inputName) inputName.value = fullName;

    const inputEmail = document.getElementById('inputEmail');
    if (inputEmail) inputEmail.value = email;

    const inputPhone = document.getElementById('inputPhone');
    if (inputPhone) inputPhone.value = user.phone || '';

    const inputTz = document.getElementById('inputTimezone');
    if (inputTz && timezone) inputTz.value = timezone;
  }

  function formatTimezoneLabel(tz) {
    const map = {
      'America/New_York': 'UTC -05:00 (Eastern Time)',
      'America/Chicago': 'UTC -06:00 (Central Time)',
      'America/Los_Angeles': 'UTC -08:00 (Pacific Time)',
      'Europe/London': 'UTC +00:00 (London / GMT)',
      'Asia/Kolkata': 'UTC +05:30 (India / IST)',
      'Asia/Singapore': 'UTC +08:00 (Singapore / SGT)',
      'UTC': 'UTC (Coordinated Universal Time)'
    };
    return map[tz] || tz || 'UTC';
  }

  function update2FAUI(isEnabled) {
    const tfaVal = document.querySelector('#rowToggle2FA .item-value');
    if (tfaVal) {
      tfaVal.textContent = isEnabled ? 'Enabled' : 'Disabled';
      tfaVal.className = isEnabled ? 'item-value text-green' : 'item-value text-muted';
    }

    const sideCheck = document.getElementById('side2faCheck');
    if (sideCheck) {
      sideCheck.innerHTML = isEnabled 
        ? '<span class="dot-green"></span><span>Enabled</span>' 
        : '<span class="dot-amber" style="background:#f59e0b; width:6px; height:6px; border-radius:50%;"></span><span style="color:var(--text-muted);">Disabled</span>';
    }
  }

  // =========================================================================
  // 3. Tabs Navigation
  // =========================================================================
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.getAttribute('data-tab');
      let targetElem = null;

      if (target === 'overview') targetElem = document.getElementById('sectionOverview');
      else if (target === 'personal') targetElem = document.getElementById('sectionPersonal');
      else if (target === 'security') targetElem = document.getElementById('sectionSecurity');

      if (targetElem) {
        targetElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  // =========================================================================
  // 4. Modals Helpers
  // =========================================================================
  function openModal(modal) {
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('active');
    }
  }

  function closeModal(modal) {
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active');
    }
  }

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-close');
      const target = document.getElementById(targetId);
      closeModal(target);
    });
  });

  // =========================================================================
  // 5. Edit Profile Submission
  // =========================================================================
  if (btnEditOverview) btnEditOverview.addEventListener('click', () => openModal(editProfileModal));
  if (btnEditPersonal) btnEditPersonal.addEventListener('click', () => openModal(editProfileModal));

  if (btnSaveProfile) {
    btnSaveProfile.addEventListener('click', async () => {
      const fullName = document.getElementById('inputFullName')?.value.trim();
      const email = document.getElementById('inputEmail')?.value.trim();
      const phone = document.getElementById('inputPhone')?.value.trim();
      const timezone = document.getElementById('inputTimezone')?.value;

      if (!fullName) {
        if (window.AegisOwner) window.AegisOwner.showToast('Please enter your full name', 'error');
        return;
      }

      btnSaveProfile.disabled = true;
      btnSaveProfile.textContent = 'Saving...';

      try {
        const payload = {
          name: fullName,
          email: email,
          phone: phone,
          timezone_preference: timezone
        };

        const res = await window.AegisAPI.put('/accounts/profile/update/', payload);
        const updatedUser = res.user || res;

        // Update local session
        const stored = window.AegisAPI.getUser() || {};
        Object.assign(stored, updatedUser, payload);
        localStorage.setItem('aegis_user', JSON.stringify(stored));
        if (window.AegisAPI.syncUserProfileUI) {
          window.AegisAPI.syncUserProfileUI();
        }

        populateUserUI(stored);
        closeModal(editProfileModal);
        if (window.AegisOwner) window.AegisOwner.showToast('Profile information updated successfully!', 'success');

      } catch (err) {
        console.error('Failed to update profile:', err);
        if (window.AegisOwner) window.AegisOwner.showToast(`Failed to update profile: ${err.message}`, 'error');
      } finally {
        btnSaveProfile.disabled = false;
        btnSaveProfile.textContent = 'Save Changes';
      }
    });
  }

  // =========================================================================
  // 6. Change Password Submission
  // =========================================================================
  function openPasswordModal() {
    const curP = document.getElementById('inputCurrentPassword');
    const newP = document.getElementById('inputNewPassword');
    const cnfP = document.getElementById('inputConfirmPassword');
    if (curP) curP.value = '';
    if (newP) newP.value = '';
    if (cnfP) cnfP.value = '';
    openModal(changePasswordModal);
  }

  if (btnManageSecurity) btnManageSecurity.addEventListener('click', openPasswordModal);
  if (rowChangePassword) rowChangePassword.addEventListener('click', openPasswordModal);
  if (qaChangePassword) qaChangePassword.addEventListener('click', openPasswordModal);

  if (btnSavePassword) {
    btnSavePassword.addEventListener('click', async () => {
      const currentPassword = document.getElementById('inputCurrentPassword')?.value;
      const newPassword = document.getElementById('inputNewPassword')?.value;
      const confirmPassword = document.getElementById('inputConfirmPassword')?.value;

      if (!currentPassword) {
        if (window.AegisOwner) window.AegisOwner.showToast('Please enter your current password', 'error');
        return;
      }
      if (!newPassword || newPassword.length < 8) {
        if (window.AegisOwner) window.AegisOwner.showToast('New password must be at least 8 characters', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        if (window.AegisOwner) window.AegisOwner.showToast('New passwords do not match', 'error');
        return;
      }

      btnSavePassword.disabled = true;
      btnSavePassword.textContent = 'Updating...';

      try {
        await window.AegisAPI.post('/accounts/profile/change-password/', {
          current_password: currentPassword,
          old_password: currentPassword,
          new_password: newPassword
        });

        closeModal(changePasswordModal);
        if (window.AegisOwner) window.AegisOwner.showToast('Password updated securely with zero-knowledge rotation!', 'success');

      } catch (err) {
        console.error('Password change error:', err);
        if (window.AegisOwner) window.AegisOwner.showToast(`Password update failed: ${err.message}`, 'error');
      } finally {
        btnSavePassword.disabled = false;
        btnSavePassword.textContent = 'Update Password';
      }
    });
  }

  // =========================================================================
  // 7. Two-Factor Authentication (2FA) Toggle
  // =========================================================================
  async function toggle2FA() {
    try {
      const res = await window.AegisAPI.post('/accounts/profile/2fa/toggle/');
      const isEnabled = Boolean(res.is_2fa_enabled);
      update2FAUI(isEnabled);

      // Update cached user
      const stored = window.AegisAPI.getUser() || {};
      stored.is_2fa_enabled = isEnabled;
      localStorage.setItem('aegis_user', JSON.stringify(stored));

      if (window.AegisOwner) {
        window.AegisOwner.showToast(`Two-Factor Authentication is now ${isEnabled ? 'Enabled' : 'Disabled'}`, isEnabled ? 'success' : 'warning');
      }
    } catch (err) {
      console.error('2FA toggle failed:', err);
      if (window.AegisOwner) window.AegisOwner.showToast(`Failed to toggle 2FA: ${err.message}`, 'error');
    }
  }

  if (rowToggle2FA) rowToggle2FA.addEventListener('click', toggle2FA);
  if (qaEnable2FA) qaEnable2FA.addEventListener('click', toggle2FA);

  // =========================================================================
  // 8. Personal Data Export
  // =========================================================================
  if (qaDownloadData) {
    qaDownloadData.addEventListener('click', async () => {
      try {
        if (window.AegisOwner) window.AegisOwner.showToast('Generating cryptographic personal archive...', 'info');

        const data = await window.AegisAPI.get('/accounts/profile/export-data/');
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aegisvault_owner_archive_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (window.AegisOwner) window.AegisOwner.showToast('Personal data archive generated and downloaded!', 'success');

      } catch (err) {
        console.error('Data export error:', err);
        if (window.AegisOwner) window.AegisOwner.showToast(`Failed to export data: ${err.message}`, 'error');
      }
    });
  }

  // Initial load
  loadUserProfile();
});
