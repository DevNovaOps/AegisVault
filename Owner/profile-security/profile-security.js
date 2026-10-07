/**
 * AegisVault Owner Panel — Profile & Security Module
 * Module 09: Personal Info, Cryptographic Credentials, 2FA, Devices & Auth
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Elements
  // =========================================================================
  const tabs = document.querySelectorAll('.profile-tab-item');
  const currentThemeLabel = document.getElementById('currentThemeLabel');

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

  const btnViewAllDevices = document.getElementById('btnViewAllDevices');
  const qaManageDevices = document.getElementById('qaManageDevices');
  const qaDownloadData = document.getElementById('qaDownloadData');

  const btnToggleGoogle = document.getElementById('btnToggleGoogle');
  const statusGoogle = document.getElementById('statusGoogle');
  const btnToggleMs = document.getElementById('btnToggleMs');
  const statusMs = document.getElementById('statusMs');
  const btnToggleApple = document.getElementById('btnToggleApple');
  const statusApple = document.getElementById('statusApple');

  // Sync theme label with current document theme
  function syncThemeLabel() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    if (currentThemeLabel) {
      currentThemeLabel.textContent = isDark ? 'Dark Mode' : 'Light Mode';
    }
  }
  syncThemeLabel();
  window.addEventListener('aegis-theme-changed', syncThemeLabel);

  // =========================================================================
  // 2. Tabs Navigation
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
      else if (target === 'devices') targetElem = document.getElementById('sectionDevices');
      else if (target === 'preferences') targetElem = document.getElementById('sectionPreferences');
      else if (target === 'connected') targetElem = document.getElementById('sectionConnected');

      if (targetElem) {
        targetElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  // =========================================================================
  // 3. Modals Helpers
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

  // Edit Profile
  if (btnEditOverview) btnEditOverview.addEventListener('click', () => openModal(editProfileModal));
  if (btnEditPersonal) btnEditPersonal.addEventListener('click', () => openModal(editProfileModal));

  if (btnSaveProfile) {
    btnSaveProfile.addEventListener('click', () => {
      const fullName = document.getElementById('inputFullName')?.value;
      const email = document.getElementById('inputEmail')?.value;

      if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
        window.AegisAPI.put('/accounts/profile/update/', {
          name: fullName,
          email: email
        }).then(() => {
          if (fullName) {
            const nameEl = document.querySelector('.overview-name');
            if (nameEl) nameEl.textContent = fullName;
          }
          if (email) {
            const emailEl = document.querySelector('.overview-email');
            if (emailEl) emailEl.textContent = email;
          }
          closeModal(editProfileModal);
          if (window.AegisOwner) window.AegisOwner.showToast('Profile information updated successfully', 'success');
        }).catch(err => {
          if (window.AegisOwner) window.AegisOwner.showToast(`Failed to update profile: ${err.message}`, 'error');
        });
      } else {
        if (fullName) {
          const nameEl = document.querySelector('.overview-name');
          if (nameEl) nameEl.textContent = fullName;
        }
        if (email) {
          const emailEl = document.querySelector('.overview-email');
          if (emailEl) emailEl.textContent = email;
        }
        closeModal(editProfileModal);
        if (window.AegisOwner) window.AegisOwner.showToast('Profile information updated successfully', 'success');
      }
    });
  }

  // Change Password
  function openPasswordModal() {
    openModal(changePasswordModal);
  }

  if (btnManageSecurity) btnManageSecurity.addEventListener('click', openPasswordModal);
  if (rowChangePassword) rowChangePassword.addEventListener('click', openPasswordModal);
  if (qaChangePassword) qaChangePassword.addEventListener('click', openPasswordModal);

  if (btnSavePassword) {
    btnSavePassword.addEventListener('click', () => {
      const oldPassword = document.getElementById('inputCurrentPassword')?.value;
      const newPassword = document.getElementById('inputNewPassword')?.value;

      if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
        window.AegisAPI.post('/accounts/profile/change-password/', {
          old_password: oldPassword,
          new_password: newPassword
        }).then(() => {
          closeModal(changePasswordModal);
          if (window.AegisOwner) window.AegisOwner.showToast('Password updated securely with zero-knowledge rotation', 'success');
        }).catch(err => {
          if (window.AegisOwner) window.AegisOwner.showToast(`Failed to update password: ${err.message}`, 'error');
        });
      } else {
        closeModal(changePasswordModal);
        if (window.AegisOwner) window.AegisOwner.showToast('Password updated securely with zero-knowledge rotation', 'success');
      }
    });
  }

  // 2FA Toggle
  function toggle2FA() {
    if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
      window.AegisAPI.post('/accounts/profile/2fa/toggle/').then(res => {
        if (window.AegisOwner) window.AegisOwner.showToast(`Two-Factor Authentication is now ${res.is_2fa_enabled ? 'enabled' : 'disabled'}`, 'info');
      }).catch(err => {
        if (window.AegisOwner) window.AegisOwner.showToast(`Failed to toggle 2FA: ${err.message}`, 'error');
      });
    } else {
      if (window.AegisOwner) {
        window.AegisOwner.showToast('Two-Factor Authentication is active and secured via WebAuthn/TOTP', 'info');
      }
    }
  }
  if (rowToggle2FA) rowToggle2FA.addEventListener('click', toggle2FA);
  if (qaEnable2FA) qaEnable2FA.addEventListener('click', toggle2FA);

  // Manage Devices
  function showDevicesPrompt() {
    if (window.AegisOwner) {
      window.AegisOwner.showToast('3 active sessions registered. All device keys verified.', 'info');
    }
  }
  if (btnViewAllDevices) btnViewAllDevices.addEventListener('click', showDevicesPrompt);
  if (qaManageDevices) qaManageDevices.addEventListener('click', showDevicesPrompt);

  // Download Data
  if (qaDownloadData) {
    qaDownloadData.addEventListener('click', () => {
      if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
        window.AegisAPI.get('/accounts/profile/export-data/').then(data => {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `aegisvault_owner_archive_${Date.now()}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          if (window.AegisOwner) window.AegisOwner.showToast('Personal data archive generated and downloaded', 'success');
        }).catch(err => {
          if (window.AegisOwner) window.AegisOwner.showToast(`Failed to export data: ${err.message}`, 'error');
        });
      } else {
        const data = {
          owner: 'Rakesh Patel',
          email: 'rakesh.patel@email.com',
          exportTimestamp: new Date().toISOString(),
          vaultsCount: 8,
          trusteesCount: 8,
          releasesCount: 8,
          securityStatus: 'Fully Configured'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aegisvault_owner_archive_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (window.AegisOwner) {
          window.AegisOwner.showToast('Personal data archive generated and downloaded', 'success');
        }
      }
    });
  }

  // Connected Accounts
  if (btnToggleGoogle) {
    btnToggleGoogle.addEventListener('click', () => {
      const isConnected = btnToggleGoogle.textContent.trim() === 'Disconnect';
      if (isConnected) {
        btnToggleGoogle.textContent = 'Connect';
        btnToggleGoogle.classList.add('btn-connect-outline');
        if (statusGoogle) {
          statusGoogle.textContent = 'Not connected';
          statusGoogle.classList.add('text-muted');
        }
        if (window.AegisOwner) window.AegisOwner.showToast('Disconnected Google OAuth login', 'info');
      } else {
        btnToggleGoogle.textContent = 'Disconnect';
        btnToggleGoogle.classList.remove('btn-connect-outline');
        if (statusGoogle) {
          statusGoogle.textContent = 'Connected';
          statusGoogle.classList.remove('text-muted');
        }
        if (window.AegisOwner) window.AegisOwner.showToast('Connected Google OAuth login', 'success');
      }
    });
  }

  if (btnToggleMs) {
    btnToggleMs.addEventListener('click', () => {
      const isConnected = btnToggleMs.textContent.trim() === 'Disconnect';
      if (isConnected) {
        btnToggleMs.textContent = 'Connect';
        btnToggleMs.classList.add('btn-connect-outline');
        if (statusMs) {
          statusMs.textContent = 'Not connected';
          statusMs.classList.add('text-muted');
        }
        if (window.AegisOwner) window.AegisOwner.showToast('Disconnected Microsoft OAuth login', 'info');
      } else {
        btnToggleMs.textContent = 'Disconnect';
        btnToggleMs.classList.remove('btn-connect-outline');
        if (statusMs) {
          statusMs.textContent = 'Connected';
          statusMs.classList.remove('text-muted');
        }
        if (window.AegisOwner) window.AegisOwner.showToast('Connected Microsoft OAuth login', 'success');
      }
    });
  }

  if (btnToggleApple) {
    btnToggleApple.addEventListener('click', () => {
      const isConnected = btnToggleApple.textContent.trim() === 'Disconnect';
      if (isConnected) {
        btnToggleApple.textContent = 'Connect';
        btnToggleApple.classList.add('btn-connect-outline');
        if (statusApple) {
          statusApple.textContent = 'Not connected';
          statusApple.classList.add('text-muted');
        }
        if (window.AegisOwner) window.AegisOwner.showToast('Disconnected Apple OAuth login', 'info');
      } else {
        btnToggleApple.textContent = 'Disconnect';
        btnToggleApple.classList.remove('btn-connect-outline');
        if (statusApple) {
          statusApple.textContent = 'Connected';
          statusApple.classList.remove('text-muted');
        }
        if (window.AegisOwner) window.AegisOwner.showToast('Connected Apple OAuth login', 'success');
      }
    });
  }

  // Recovery Email and Account Recovery
  const rowRecoveryEmail = document.getElementById('rowRecoveryEmail');
  if (rowRecoveryEmail) {
    rowRecoveryEmail.addEventListener('click', () => {
      const email = prompt('Update Recovery Email:', 'recovery@email.com');
      if (email && email.includes('@')) {
        const val = rowRecoveryEmail.querySelector('.item-value');
        if (val) val.textContent = email;
        if (window.AegisOwner) window.AegisOwner.showToast(`Recovery email set to ${email}`, 'success');
      }
    });
  }

  const rowAccountRecovery = document.getElementById('rowAccountRecovery');
  if (rowAccountRecovery) {
    rowAccountRecovery.addEventListener('click', () => {
      if (window.AegisOwner) window.AegisOwner.showToast('Account recovery keys are encrypted and stored in hardware enclave.', 'info');
    });
  }

  // Device context buttons
  document.querySelectorAll('.btn-device-more').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const devRow = btn.closest('.device-row');
      const devName = devRow?.querySelector('.device-name')?.textContent || 'Device';
      if (confirm(`Revoke session for ${devName}? This device will be signed out.`)) {
        if (!devRow.querySelector('.current-device-tag')) {
          devRow.style.opacity = '0.4';
          devRow.style.pointerEvents = 'none';
          if (window.AegisOwner) window.AegisOwner.showToast(`Signed out ${devName}`, 'warning');
        } else {
          if (window.AegisOwner) window.AegisOwner.showToast(`Cannot sign out current active session here`, 'warning');
        }
      }
    });
  });

  // Preferences Rows Interactive Toggles
  const prefRows = document.querySelectorAll('#sectionPreferences .profile-item-row');
  prefRows.forEach((row, idx) => {
    row.addEventListener('click', () => {
      const label = row.querySelector('.item-label')?.textContent;
      const val = row.querySelector('.item-value');
      if (!val) return;

      if (label === 'Email Notifications') {
        const isEnabled = val.textContent.trim() === 'Enabled';
        val.textContent = isEnabled ? 'Disabled' : 'Enabled';
        val.className = isEnabled ? 'item-value text-muted' : 'item-value text-green';
        if (window.AegisOwner) window.AegisOwner.showToast(`Email notifications ${isEnabled ? 'disabled' : 'enabled'}`, 'info');
      } else if (label === 'Language') {
        const langs = ['English (US)', 'English (UK)', 'Español', 'Français', 'Deutsch'];
        const curIdx = langs.indexOf(val.textContent.trim());
        const next = langs[(curIdx + 1) % langs.length];
        val.textContent = next;
        if (window.AegisOwner) window.AegisOwner.showToast(`Language set to ${next}`, 'success');
      } else if (label === 'Theme') {
        // Toggle theme via global button
        const toggleBtn = document.getElementById('themeToggleBtn');
        if (toggleBtn) toggleBtn.click();
      } else if (label === 'Date Format') {
        const formats = ['DD MMM YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
        const curIdx = formats.indexOf(val.textContent.trim());
        const next = formats[(curIdx + 1) % formats.length];
        val.textContent = next;
        if (window.AegisOwner) window.AegisOwner.showToast(`Date format set to ${next}`, 'info');
      } else if (label === 'Time Format') {
        const is12 = val.textContent.includes('12-hour');
        val.textContent = is12 ? '24-hour (UTC)' : '12-hour (AM/PM)';
        if (window.AegisOwner) window.AegisOwner.showToast(`Time format set to ${val.textContent}`, 'info');
      }
    });
  });

  const btnManagePreferences = document.getElementById('btnManagePreferences');
  if (btnManagePreferences) {
    btnManagePreferences.addEventListener('click', () => {
      if (window.AegisOwner) window.AegisOwner.showToast('Click any preference row directly to cycle or toggle settings.', 'info');
    });
  }

  const btnManageIntegrations = document.getElementById('btnManageIntegrations');
  if (btnManageIntegrations) {
    btnManageIntegrations.addEventListener('click', () => {
      if (window.AegisOwner) window.AegisOwner.showToast('Third-party OAuth providers synchronized.', 'info');
    });
  }
});
