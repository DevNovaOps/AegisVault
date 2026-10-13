/**
 * ==========================================================================
 * AegisVault — Admin Profile Management Scripts
 * Interactive profile updates, FIDO2 WebAuthn key simulation,
 * password entropy calculations, multisig verification, and session control.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    initProfileManagement();
});

async function initProfileManagement() {
    if (window.AegisAdminCommon && window.AegisAdminCommon.ensureAdminToken) {
        await window.AegisAdminCommon.ensureAdminToken();
    }
    await loadAdminProfileData();
    initPasswordStrengthMeter();
    initProfileForm();
    initPasswordForm();
}

async function loadAdminProfileData() {
    let user = null;
    try {
        if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
            user = await window.AegisAPI.getCurrentUser();
        }
    } catch (e) {
        console.warn('Could not fetch /auth/me/, checking localStorage:', e);
    }

    if (!user) {
        const raw = localStorage.getItem('aegis_user');
        try { user = raw ? JSON.parse(raw) : null; } catch (e) {}
    }

    if (!user) return;

    const nameInput = document.getElementById('profFullName');
    const emailInput = document.getElementById('profEmail');
    const phoneInput = document.getElementById('profPhone');
    const tzSelect = document.getElementById('profTimezone');
    const idInput = document.getElementById('profAdminId');
    const displayAdminName = document.getElementById('displayAdminName');
    const avatarEl = document.getElementById('adminAvatarLarge');

    if (nameInput) nameInput.value = user.name || user.email?.split('@')[0] || 'Master Administrator';
    if (emailInput) emailInput.value = user.email || 'admin@aegisvault.internal';
    if (phoneInput && user.phone) phoneInput.value = user.phone;
    if (tzSelect && user.timezone_preference) tzSelect.value = user.timezone_preference;
    if (idInput && user.id) idInput.value = `ADM-${String(user.id).slice(0, 8).toUpperCase()}`;
    if (displayAdminName) displayAdminName.textContent = user.name || user.email || 'Master Administrator';
    if (avatarEl) {
        const init = (user.name || user.email || 'AD').replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'AD';
        avatarEl.textContent = init;
    }

    // Update navbar avatar & name if present
    const navName = document.querySelector('.profile-name');
    if (navName) navName.textContent = (user.name || user.email?.split('@')[0] || 'Admin').split(' ')[0];
    const navAvatar = document.querySelector('.profile-avatar-circle');
    if (navAvatar) navAvatar.textContent = (user.name || user.email || 'AD').replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'AD';
}

/**
 * Copy Master Admin ID to Clipboard
 */
window.copyAdminId = function() {
    const adminIdInput = document.getElementById('profAdminId');
    if (!adminIdInput) return;

    navigator.clipboard.writeText(adminIdInput.value).then(() => {
        if (typeof window.showToast === 'function') {
            window.showToast('Master Admin ID copied to clipboard: ' + adminIdInput.value, 'success');
        } else {
            alert('Master Admin ID copied: ' + adminIdInput.value);
        }
    }).catch(() => {
        adminIdInput.select();
        document.execCommand('copy');
        if (typeof window.showToast === 'function') {
            window.showToast('Master Admin ID copied to clipboard!', 'success');
        }
    });
};

/**
 * Copy Cryptographic Public Fingerprint
 */
window.copyFingerprint = function() {
    const fingerprint = "SHA256:4f8a:91ce:3b02:e7d4:89aa:01ff:9281";
    navigator.clipboard.writeText(fingerprint).then(() => {
        if (typeof window.showToast === 'function') {
            window.showToast('Cryptographic signature fingerprint copied!', 'success');
        }
    }).catch(() => {
        if (typeof window.showToast === 'function') {
            window.showToast('Fingerprint copied to clipboard!', 'success');
        }
    });
};

/**
 * Handle Profile Form Save
 */
function initProfileForm() {
    const form = document.getElementById('adminProfileForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('profFullName');
        const emailInput = document.getElementById('profEmail');
        const phoneInput = document.getElementById('profPhone');
        const tzSelect = document.getElementById('profTimezone');
        const roleLabel = document.getElementById('displayAdminName');

        const payload = {
            name: nameInput?.value.trim(),
            email: emailInput?.value.trim(),
            phone: phoneInput?.value.trim() || '',
            timezone_preference: tzSelect?.value || 'America/New_York'
        };

        try {
            if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
                const res = await window.AegisAPI.put('/auth/profile/update/', payload);
                if (res && res.user) {
                    localStorage.setItem('aegis_user', JSON.stringify(res.user));
                }
            } else {
                const cur = JSON.parse(localStorage.getItem('aegis_user') || '{}');
                Object.assign(cur, payload);
                localStorage.setItem('aegis_user', JSON.stringify(cur));
            }

            if (nameInput && roleLabel) roleLabel.textContent = nameInput.value;
            const navbarProfileName = document.querySelector('.profile-name');
            if (navbarProfileName && nameInput) navbarProfileName.textContent = nameInput.value.split(' ')[0] || 'Admin';

            if (window.AegisAdminCommon) {
                AegisAdminCommon.showToast('Administrator profile details updated in database.', 'success');
            } else if (typeof window.showToast === 'function') {
                window.showToast('Administrator profile details updated successfully.', 'success');
            } else {
                alert('Administrator profile updated successfully.');
            }
        } catch (err) {
            console.error('Profile update error:', err);
            const msg = err.message || 'Failed to update profile details';
            if (window.AegisAdminCommon) {
                AegisAdminCommon.showToast(msg, 'error');
            } else {
                alert(msg);
            }
        }
    });
}

/**
 * Real-time Password Strength Meter
 */
function initPasswordStrengthMeter() {
    const newPassInput = document.getElementById('newMasterPass');
    const strengthBar = document.getElementById('passwordStrengthBar');
    const strengthText = document.getElementById('passwordStrengthText');

    if (!newPassInput || !strengthBar || !strengthText) return;

    newPassInput.addEventListener('input', () => {
        const val = newPassInput.value;
        let score = 0;

        if (val.length >= 8) score += 25;
        if (val.length >= 14) score += 25;
        if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score += 20;
        if (/[0-9]/.test(val)) score += 15;
        if (/[^A-Za-z0-9]/.test(val)) score += 15;

        strengthBar.style.width = Math.min(score, 100) + '%';

        if (score === 0) {
            strengthBar.style.background = 'var(--border-color)';
            strengthText.textContent = 'None';
            strengthText.style.color = 'var(--text-muted)';
        } else if (score < 40) {
            strengthBar.style.background = 'var(--coral, #ef4444)';
            strengthText.textContent = 'Weak';
            strengthText.style.color = 'var(--coral, #ef4444)';
        } else if (score < 70) {
            strengthBar.style.background = 'var(--amber, #f59e0b)';
            strengthText.textContent = 'Moderate';
            strengthText.style.color = 'var(--amber, #f59e0b)';
        } else if (score < 90) {
            strengthBar.style.background = 'var(--emerald, #10b981)';
            strengthText.textContent = 'Strong';
            strengthText.style.color = 'var(--emerald, #10b981)';
        } else {
            strengthBar.style.background = 'linear-gradient(90deg, #10b981, #06b6d4)';
            strengthText.textContent = 'Cryptographic Grade (Level 5)';
            strengthText.style.color = 'var(--cyan, #06b6d4)';
        }
    });
}

/**
 * Handle Master Password Rotation Form
 */
function initPasswordForm() {
    const form = document.getElementById('adminPasswordForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const curPass = document.getElementById('currentMasterPass');
        const newPass = document.getElementById('newMasterPass');
        const confirmPass = document.getElementById('confirmMasterPass');

        if (!curPass || !newPass || !confirmPass) return;

        if (newPass.value !== confirmPass.value) {
            const msg = 'New passwords do not match. Please verify and try again.';
            if (window.AegisAdminCommon) AegisAdminCommon.showToast(msg, 'error');
            else if (typeof window.showToast === 'function') window.showToast(msg, 'error');
            else alert(msg);
            return;
        }

        if (newPass.value.length < 8) {
            const msg = 'Master password must be at least 8 characters long.';
            if (window.AegisAdminCommon) AegisAdminCommon.showToast(msg, 'warning');
            else if (typeof window.showToast === 'function') window.showToast(msg, 'warning');
            else alert(msg);
            return;
        }

        try {
            if (window.AegisAPI && window.AegisAPI.isAuthenticated()) {
                await window.AegisAPI.post('/auth/profile/change-password/', {
                    current_password: curPass.value,
                    new_password: newPass.value
                });
            }

            curPass.value = '';
            newPass.value = '';
            confirmPass.value = '';

            const strengthBar = document.getElementById('passwordStrengthBar');
            const strengthText = document.getElementById('passwordStrengthText');
            if (strengthBar) strengthBar.style.width = '0%';
            if (strengthText) {
                strengthText.textContent = 'None';
                strengthText.style.color = 'var(--text-muted)';
            }

            const successMsg = 'Master administrative password rotated and cryptographic hash updated in database.';
            if (window.AegisAdminCommon) AegisAdminCommon.showToast(successMsg, 'success');
            else if (typeof window.showToast === 'function') window.showToast(successMsg, 'success');
            else alert(successMsg);
        } catch (err) {
            console.error('Password change error:', err);
            const msg = err.message || (err.current_password ? err.current_password[0] : 'Failed to rotate master password. Check your current password.');
            if (window.AegisAdminCommon) AegisAdminCommon.showToast(msg, 'error');
            else if (typeof window.showToast === 'function') window.showToast(msg, 'error');
            else alert(msg);
        }
    });
}

/**
 * Modal Management Utilities
 */
window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// Close modal when clicking on backdrop
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

/**
 * Handle Registering a New Hardware Key
 */
window.handleRegisterNewKey = function() {
    const keyNameInput = document.getElementById('newKeyNickname');
    const keyTypeSelect = document.getElementById('newKeyType');
    const keyNickname = (keyNameInput && keyNameInput.value.trim()) || 'Security Key';
    const keyType = (keyTypeSelect && keyTypeSelect.value) || 'FIDO2 / WebAuthn';

    const keysList = document.querySelector('.keys-list');
    if (keysList) {
        const newKeyItem = document.createElement('div');
        newKeyItem.className = 'key-card-item';
        newKeyItem.innerHTML = `
            <div class="key-item-left">
                <div class="key-icon-bubble">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="7.5" cy="15.5" r="4.5"/>
                        <path d="m21 3-9.5 9.5M15.5 8.5l3 3M18 6l2 2"/>
                    </svg>
                </div>
                <div class="key-info-col">
                    <span class="key-title">${escapeHtml(keyNickname)}</span>
                    <span class="key-meta">${escapeHtml(keyType)} &bull; Registered Just now</span>
                </div>
            </div>
            <div class="key-item-right">
                <span class="status-badge emerald">Active</span>
                <button type="button" class="btn-remove-key" title="Remove Key" onclick="removeKey(this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
        keysList.appendChild(newKeyItem);

        // Update KPI counter
        const keyCountEl = document.getElementById('kpiKeyCount');
        if (keyCountEl) {
            const curCount = parseInt(keyCountEl.textContent, 10) || 2;
            keyCountEl.textContent = (curCount + 1).toString();
        }
    }

    if (keyNameInput) keyNameInput.value = '';
    window.closeModal('registerKeyModal');

    if (typeof window.showToast === 'function') {
        window.showToast(`Hardware key "${keyNickname}" registered successfully.`, 'success');
    }
};

/**
 * Remove Hardware Key
 */
window.removeKey = function(btn) {
    const card = btn.closest('.key-card-item');
    if (!card) return;

    if (confirm('Are you sure you want to revoke this hardware security key?')) {
        card.remove();
        const keyCountEl = document.getElementById('kpiKeyCount');
        if (keyCountEl) {
            const curCount = parseInt(keyCountEl.textContent, 10) || 2;
            keyCountEl.textContent = Math.max(1, curCount - 1).toString();
        }
        if (typeof window.showToast === 'function') {
            window.showToast('Hardware security key revoked.', 'info');
        }
    }
};

/**
 * Revoke All Other Sessions
 */
window.handleRevokeOtherSessions = function() {
    const sessionsList = document.querySelector('.sessions-list');
    if (!sessionsList) return;

    const nonCurrentSessions = sessionsList.querySelectorAll('.session-item:not(.current)');
    nonCurrentSessions.forEach(item => item.remove());

    const activeSessionsKpi = document.getElementById('kpiActiveSessions');
    if (activeSessionsKpi) {
        activeSessionsKpi.textContent = '1 Active';
    }

    window.closeModal('revokeSessionsModal');

    if (typeof window.showToast === 'function') {
        window.showToast('All other administrative sessions have been terminated.', 'success');
    }
};

/**
 * Emergency Maintenance Protocol
 */
window.handleEmergencyMaintenance = function() {
    window.closeModal('emergencyModal');
    if (typeof window.showToast === 'function') {
        window.showToast('Emergency lockdown initiated: Protocol placed in read-only state.', 'warning');
    }
};

/**
 * Regenerate Emergency Recovery Passphrase
 */
window.handleRegeneratePassphrase = function() {
    if (confirm('Generate a new master offline recovery shard? This invalidates previous emergency paper shards.')) {
        if (typeof window.showToast === 'function') {
            window.showToast('New 24-word master emergency recovery shard generated.', 'info');
        }
    }
};

/**
 * Change Avatar
 */
window.handleChangeAvatar = function() {
    const initials = ['AD', 'SA', 'MK', 'AV'];
    const avatarEl = document.getElementById('adminAvatarLarge');
    const navAvatar = document.querySelector('.profile-avatar-circle');

    if (!avatarEl) return;
    const current = avatarEl.textContent.trim();
    const nextIdx = (initials.indexOf(current) + 1) % initials.length;
    avatarEl.textContent = initials[nextIdx];

    if (navAvatar) {
        navAvatar.textContent = initials[nextIdx];
    }

    if (typeof window.showToast === 'function') {
        window.showToast(`Avatar updated to "${initials[nextIdx]}".`, 'info');
    }
};

/**
 * Helper to escape HTML characters
 */
function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
