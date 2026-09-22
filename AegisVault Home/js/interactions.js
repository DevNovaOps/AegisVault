/**
 * AegisVault — Interactions Controller
 * Handles Modals (Sign In, Get Started, Watch Video), Newsletter validation,
 * Toast notifications, and Button micro-interactions.
 */

(function () {
    'use strict';

    // Modal Elements
    const modalSignIn = document.getElementById('modal-sign-in');
    const modalGetStarted = document.getElementById('modal-get-started');
    const modalVideo = document.getElementById('modal-video');

    const btnSignIn = document.getElementById('btn-sign-in');
    const btnMobileSignIn = document.getElementById('btn-mobile-sign-in');
    const btnCloseSignIn = document.getElementById('btn-close-signin');

    const btnGetStarted = document.getElementById('btn-get-started');
    const btnMobileGetStarted = document.getElementById('btn-mobile-get-started');
    const btnHeroCreateVault = document.getElementById('btn-hero-create-vault');
    const btnCtaCreate = document.getElementById('btn-cta-create');
    const btnCloseSignUp = document.getElementById('btn-close-signup');

    const btnHeroWatchVideo = document.getElementById('btn-hero-watch-video');
    const btnCloseVideo = document.getElementById('btn-close-video');
    const btnPlayVideoStream = document.getElementById('btn-play-video-stream');

    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToSignin = document.getElementById('switch-to-signin');

    const formSignIn = document.getElementById('form-sign-in');
    const formGetStarted = document.getElementById('form-get-started');
    const btnPasskeyLogin = document.getElementById('btn-passkey-login');
    const signupPasswordInput = document.getElementById('signup-password');
    const strengthFill = document.getElementById('strength-fill');

    // Newsletter Elements
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterEmail = document.getElementById('newsletter-email');
    const newsletterFeedback = document.getElementById('newsletter-feedback');

    // Toast Container
    const toastContainer = document.getElementById('toast-container');

    /**
     * Show Toast Notification
     * @param {string} message
     * @param {'success'|'error'|'info'} type
     */
    function showToast(message, type = 'success') {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconHtml = '✓';
        if (type === 'error') iconHtml = '✕';
        if (type === 'info') iconHtml = 'ℹ';

        toast.innerHTML = `
            <span class="toast-icon">${iconHtml}</span>
            <span class="toast-message">${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    // Expose showToast globally
    window.showToast = showToast;

    /**
     * Open a specific modal
     * @param {HTMLElement} modal
     */
    function openModal(modal) {
        if (!modal) return;
        closeAllModals();
        modal.hidden = false;
        // Trigger reflow for transition
        void modal.offsetWidth;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus first input if available
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    /**
     * Close a specific modal
     * @param {HTMLElement} modal
     */
    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            modal.hidden = true;
        }, 300);
    }

    /**
     * Close all modals
     */
    function closeAllModals() {
        [modalSignIn, modalGetStarted, modalVideo].forEach(m => {
            if (m && m.classList.contains('active')) {
                closeModal(m);
            }
        });
    }

    /**
     * Assess password strength
     * @param {string} pwd
     */
    function updatePasswordStrength(pwd) {
        if (!strengthFill) return;
        let score = 0;
        if (pwd.length >= 8) score += 25;
        if (pwd.length >= 12) score += 25;
        if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 25;
        if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score += 25;

        strengthFill.style.width = `${score}%`;
        if (score <= 25) {
            strengthFill.style.backgroundColor = '#EF4444';
        } else if (score <= 50) {
            strengthFill.style.backgroundColor = '#F59E0B';
        } else if (score <= 75) {
            strengthFill.style.backgroundColor = '#3B82F6';
        } else {
            strengthFill.style.backgroundColor = '#10B981';
        }
    }

    /**
     * Initialize all interactive listeners
     */
    function init() {
        // Modal Open Triggers
        if (btnSignIn) btnSignIn.addEventListener('click', () => openModal(modalSignIn));
        if (btnMobileSignIn) btnMobileSignIn.addEventListener('click', () => openModal(modalSignIn));
        if (btnCloseSignIn) btnCloseSignIn.addEventListener('click', () => closeModal(modalSignIn));

        const signupTriggers = [btnGetStarted, btnMobileGetStarted, btnHeroCreateVault, btnCtaCreate];
        signupTriggers.forEach(btn => {
            if (btn) btn.addEventListener('click', () => openModal(modalGetStarted));
        });

        // Plan Selection buttons
        document.querySelectorAll('.btn-select-plan').forEach(btn => {
            btn.addEventListener('click', () => openModal(modalGetStarted));
        });

        if (btnCloseSignUp) btnCloseSignUp.addEventListener('click', () => closeModal(modalGetStarted));

        // Video Modal Triggers
        if (btnHeroWatchVideo) btnHeroWatchVideo.addEventListener('click', () => openModal(modalVideo));
        if (btnCloseVideo) btnCloseVideo.addEventListener('click', () => closeModal(modalVideo));
        if (btnPlayVideoStream) {
            btnPlayVideoStream.addEventListener('click', () => {
                showToast('Streaming AegisVault Protocol architecture demo...', 'info');
            });
        }

        // Switch between modals
        if (switchToSignup) {
            switchToSignup.addEventListener('click', () => {
                closeModal(modalSignIn);
                setTimeout(() => openModal(modalGetStarted), 200);
            });
        }

        if (switchToSignin) {
            switchToSignin.addEventListener('click', () => {
                closeModal(modalGetStarted);
                setTimeout(() => openModal(modalSignIn), 200);
            });
        }

        // Close modal when clicking backdrop
        [modalSignIn, modalGetStarted, modalVideo].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        closeModal(modal);
                    }
                });
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });

        // Role-Based Configuration for Modals
        let modalActiveRole = 'owner';
        const modalRoleConfig = {
            owner: {
                title: 'Vault Owner',
                targetPanel: '../AegisVault Dashboard Module/dashboard.html',
                targetLabel: 'Opens: Owner Dashboard',
                signinSubmitText: 'Unlock Owner Vault',
                signupSubmitText: 'Generate Owner Vault',
                signinSubtitle: 'Enter your credentials to unlock your client-side encrypted vault.',
                signupSubtitle: 'Create your master key. Zero knowledge. Only you hold the decryption seed.',
                demoUser: { name: 'Aryan Patel', email: 'aryan.patel@estate.io', role: 'owner' }
            },
            trustee: {
                title: 'Designated Trustee',
                targetPanel: '../Trustee/dashboard/dashboard.html',
                targetLabel: 'Opens: Trustee Dashboard Panel',
                signinSubmitText: 'Access Trustee Panel',
                signupSubmitText: 'Register as Verified Trustee',
                signinSubtitle: 'Enter trustee credentials to inspect assigned vaults & participate in quorum.',
                signupSubtitle: 'Register your trustee identity to accept shard assignments and participate in recovery.',
                demoUser: { name: 'Rakesh Patel', email: 'rakesh.patel@trustee-network.org', role: 'trustee' }
            },
            admin: {
                title: 'SecOps Administrator',
                targetPanel: '../Admin/Dashboard/admin.html',
                targetLabel: 'Opens: Admin Command Center',
                signinSubmitText: 'Launch Admin Command Center',
                signupSubmitText: 'Enroll SecOps Root Officer',
                signinSubtitle: 'Platform administration, threat telemetry & zero-knowledge auditing.',
                signupSubtitle: 'Enroll administrative security officer with cryptographic hardware attestation.',
                demoUser: { name: 'Alice Vance', email: 'alice.vance@aegisvault-secops.io', role: 'admin' }
            }
        };

        function setModalRole(role) {
            if (!modalRoleConfig[role]) return;
            modalActiveRole = role;
            const cfg = modalRoleConfig[role];

            // Update pills in both modals
            document.querySelectorAll('#signin-role-pills .modal-role-pill, #signup-role-pills .modal-role-pill').forEach(pill => {
                pill.classList.toggle('active', pill.getAttribute('data-modal-role') === role);
            });

            // Update target badges
            const signinTarget = document.getElementById('signin-modal-role-target');
            const signupTarget = document.getElementById('signup-modal-role-target');
            if (signinTarget) {
                signinTarget.textContent = cfg.targetLabel;
                signinTarget.style.color = role === 'admin' ? '#8B5CF6' : (role === 'trustee' ? '#0284C7' : '#F45A1F');
            }
            if (signupTarget) {
                signupTarget.textContent = cfg.targetLabel;
                signupTarget.style.color = role === 'admin' ? '#8B5CF6' : (role === 'trustee' ? '#0284C7' : '#F45A1F');
            }

            // Update subtitles
            const signinSub = document.getElementById('signin-modal-subtitle');
            const signupSub = document.getElementById('signup-modal-subtitle');
            if (signinSub) signinSub.textContent = cfg.signinSubtitle;
            if (signupSub) signupSub.textContent = cfg.signupSubtitle;

            // Update submit button texts
            const signinBtnText = document.getElementById('signin-submit-text');
            const signupBtnText = document.getElementById('signup-submit-text');
            if (signinBtnText) signinBtnText.textContent = cfg.signinSubmitText;
            if (signupBtnText) signupBtnText.textContent = cfg.signupSubmitText;

            // Dynamic field visibility
            const signinExtra = document.getElementById('modal-signin-extra-group');
            const signupExtra = document.getElementById('modal-signup-extra-group');
            if (signinExtra) {
                signinExtra.style.display = role !== 'owner' ? 'flex' : 'none';
                const label = document.getElementById('modal-signin-extra-label');
                if (label) label.textContent = role === 'trustee' ? 'Assigned Vault ID / Invite Token' : 'SecOps Root Clearance Token';
            }
            if (signupExtra) {
                signupExtra.style.display = role !== 'owner' ? 'flex' : 'none';
                const label = document.getElementById('modal-signup-extra-label');
                if (label) label.textContent = role === 'trustee' ? 'Designated Vault Invitation Code' : 'Admin Master Enrollment Key';
            }
        }

        // Attach listeners to role pills
        document.querySelectorAll('#signin-role-pills .modal-role-pill, #signup-role-pills .modal-role-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                const role = pill.getAttribute('data-modal-role');
                setModalRole(role);
            });
        });

        // Sign In Form Submission with Panel Routing
        if (formSignIn) {
            formSignIn.addEventListener('submit', (e) => {
                e.preventDefault();
                const emailInput = document.getElementById('signin-email');
                const pwdInput = document.getElementById('signin-password');

                if (!emailInput.value || !pwdInput.value) {
                    showToast('Please enter both your email and master password.', 'error');
                    return;
                }

                const cfg = modalRoleConfig[modalActiveRole];
                localStorage.setItem('aegis_auth_role', modalActiveRole);
                localStorage.setItem('aegis_user', JSON.stringify({
                    name: emailInput.value.split('@')[0].toUpperCase(),
                    email: emailInput.value,
                    role: modalActiveRole
                }));

                showToast(`Authenticated as ${cfg.title}! Opening ${cfg.title} Panel...`, 'success');
                closeModal(modalSignIn);
                formSignIn.reset();

                setTimeout(() => {
                    window.location.href = cfg.targetPanel;
                }, 750);
            });
        }

        // Passkey Biometric Login with Panel Routing
        if (btnPasskeyLogin) {
            btnPasskeyLogin.addEventListener('click', () => {
                const cfg = modalRoleConfig[modalActiveRole];
                localStorage.setItem('aegis_auth_role', modalActiveRole);
                localStorage.setItem('aegis_user', JSON.stringify(cfg.demoUser));

                showToast(`WebAuthn / Passkey verified for ${cfg.title}. Opening ${cfg.title} Panel...`, 'success');
                closeModal(modalSignIn);

                setTimeout(() => {
                    window.location.href = cfg.targetPanel;
                }, 750);
            });
        }

        // Signup Password Strength
        if (signupPasswordInput) {
            signupPasswordInput.addEventListener('input', (e) => {
                updatePasswordStrength(e.target.value);
            });
        }

        // Get Started Form Submission with Panel Routing
        if (formGetStarted) {
            formGetStarted.addEventListener('submit', (e) => {
                e.preventDefault();
                const nameInput = document.getElementById('signup-name');
                const emailInput = document.getElementById('signup-email');
                const pwdInput = document.getElementById('signup-password');
                const agreeInput = document.getElementById('signup-agree');

                if (!nameInput.value || !emailInput.value || !pwdInput.value) {
                    showToast('Please fill in all required fields.', 'error');
                    return;
                }

                if (!agreeInput.checked) {
                    showToast('Please acknowledge the zero-knowledge recovery term.', 'error');
                    return;
                }

                const cfg = modalRoleConfig[modalActiveRole];
                localStorage.setItem('aegis_auth_role', modalActiveRole);
                localStorage.setItem('aegis_user', JSON.stringify({
                    name: nameInput.value,
                    email: emailInput.value,
                    role: modalActiveRole
                }));

                showToast(`Account generated as ${cfg.title}! Initializing ${cfg.title} Panel...`, 'success');
                closeModal(modalGetStarted);
                formGetStarted.reset();
                if (strengthFill) strengthFill.style.width = '0%';

                setTimeout(() => {
                    window.location.href = cfg.targetPanel;
                }, 750);
            });
        }

        // Newsletter Form Validation
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = newsletterEmail.value.trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!emailRegex.test(email)) {
                    newsletterFeedback.textContent = 'Please provide a valid email address.';
                    newsletterFeedback.className = 'newsletter-feedback error';
                    return;
                }

                newsletterFeedback.textContent = '';
                newsletterEmail.value = '';
                showToast('Subscribed! You will receive AegisVault security briefings.', 'success');
            });
        }

        // Button Ripple Effect
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', function (e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const ripple = document.createElement('span');
                ripple.className = 'btn-ripple-effect';
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;

                this.appendChild(ripple);

                setTimeout(() => {
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                }, 600);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
