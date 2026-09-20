/**
 * AegisVault — Animations Controller
 * Handles IntersectionObserver scroll reveals, animated statistics counter,
 * and timeline progress bar expansion.
 */

(function () {
    'use strict';

    /**
     * Initialize Scroll Reveal Observer for elements marked with .reveal-on-scroll
     * and cards across the page.
     */
    function initScrollReveals() {
        const revealTargets = document.querySelectorAll(
            '.feature-card, .security-card, .category-pill-card, .pricing-card, .timeline-step, .about-card-wrap, .final-cta-card, .trusted-strip-container'
        );

        revealTargets.forEach((target, index) => {
            target.classList.add('reveal-on-scroll');
            // Add subtle stagger delays for child elements in grids
            const delay = (index % 4) * 100;
            if (delay > 0) {
                target.setAttribute('data-delay', delay.toString());
            }
        });

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.15
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    }

    /**
     * Animate numeric values smoothly
     * @param {HTMLElement} el
     * @param {number} target
     * @param {string} suffix
     * @param {number} decimals
     * @param {number} duration
     */
    function animateCounter(el, target, suffix, decimals, duration = 1800) {
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = (target * easeProgress).toFixed(decimals);

            el.textContent = currentVal + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target + suffix;
            }
        }

        requestAnimationFrame(update);
    }

    /**
     * Initialize Platform Statistics Counter with IntersectionObserver
     */
    function initStatsCounter() {
        const statsContainer = document.getElementById('stats-container');
        if (!statsContainer) return;

        let hasAnimated = false;

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;

                    const statElements = statsContainer.querySelectorAll('.stat-value[data-target]');
                    statElements.forEach(statEl => {
                        const target = parseFloat(statEl.getAttribute('data-target'));
                        const suffix = statEl.getAttribute('data-suffix') || '';
                        const decimals = parseInt(statEl.getAttribute('data-decimal') || '0', 10);
                        animateCounter(statEl, target, suffix, decimals);
                    });

                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(statsContainer);
    }

    /**
     * Animate Timeline Progress Bar on Viewport Entry
     */
    function initTimelineProgress() {
        const timelineContainer = document.querySelector('.timeline-container');
        const progressBar = document.getElementById('timeline-progress-bar');
        if (!timelineContainer || !progressBar) return;

        let hasAnimated = false;

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;

                    // Check if mobile or desktop
                    if (window.innerWidth <= 767) {
                        progressBar.style.height = '100%';
                    } else {
                        progressBar.style.width = '100%';
                    }

                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.25 });

        observer.observe(timelineContainer);
    }

    /**
     * Initialize all animations
     */
    function init() {
        initScrollReveals();
        initStatsCounter();
        initTimelineProgress();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
