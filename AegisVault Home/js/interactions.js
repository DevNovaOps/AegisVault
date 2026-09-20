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

        // Sign In Form Submission
        if (formSignIn) {
            formSignIn.addEventListener('submit', (e) => {
                e.preventDefault();
                const emailInput = document.getElementById('signin-email');
                const pwdInput = document.getElementById('signin-password');

                if (!emailInput.value || !pwdInput.value) {
                    showToast('Please enter both your email and master password.', 'error');
                    return;
                }

                showToast('Decrypting client vault... Authentication successful!', 'success');
                closeModal(modalSignIn);
                formSignIn.reset();
            });
        }

        // Passkey Biometric Login
        if (btnPasskeyLogin) {
            btnPasskeyLogin.addEventListener('click', () => {
                showToast('WebAuthn / FIDO2 Passkey verified. Vault unlocked.', 'success');
                closeModal(modalSignIn);
            });
        }

        // Signup Password Strength
        if (signupPasswordInput) {
            signupPasswordInput.addEventListener('input', (e) => {
                updatePasswordStrength(e.target.value);
            });
        }

        // Get Started Form Submission
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

                showToast('Master encryption seed generated! Welcome to AegisVault.', 'success');
                closeModal(modalGetStarted);
                formGetStarted.reset();
                if (strengthFill) strengthFill.style.width = '0%';
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
