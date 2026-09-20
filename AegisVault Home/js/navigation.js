/**
 * AegisVault — Navigation Controller
 * Handles sticky glassmorphic navbar, active scroll spy, smooth scrolling,
 * and mobile drawer interactions.
 */

(function () {
    'use strict';

    const navbar = document.getElementById('navbar');
    const hamburgerBtn = document.getElementById('btn-hamburger');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerCloseBtn = document.getElementById('btn-drawer-close');
    const mobileBackdrop = document.getElementById('mobile-backdrop');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    const SCROLL_THRESHOLD = 40;

    /**
     * Handle header background transformation on scroll
     */
    function handleScrollNavbar() {
        if (!navbar) return;
        if (window.scrollY > SCROLL_THRESHOLD) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    /**
     * Smooth scroll to section with offset compensation for sticky header
     * @param {string} targetId
     */
    function scrollToSection(targetId) {
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        const navHeight = navbar ? navbar.offsetHeight : 80;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight + 10;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Open mobile drawer
     */
    function openMobileDrawer() {
        if (!mobileDrawer) return;
        mobileDrawer.classList.add('active');
        mobileDrawer.setAttribute('aria-hidden', 'false');
        if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close mobile drawer
     */
    function closeMobileDrawer() {
        if (!mobileDrawer) return;
        mobileDrawer.classList.remove('active');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    /**
     * Active link scroll spy
     */
    function initScrollSpy() {
        const sections = document.querySelectorAll('main > section[id]');
        if (!sections.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.getAttribute('id');
                    updateActiveNavLink(currentId);
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

    /**
     * Update active navigation link
     * @param {string} sectionId
     */
    function updateActiveNavLink(sectionId) {
        navLinks.forEach(link => {
            const linkTarget = link.getAttribute('data-nav');
            if (linkTarget === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Bind all event listeners
     */
    function init() {
        // Sticky Header on Scroll
        window.addEventListener('scroll', handleScrollNavbar, { passive: true });
        handleScrollNavbar();

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '') return;
                e.preventDefault();
                closeMobileDrawer();
                scrollToSection(href);
            });
        });

        // Mobile Drawer Events
        if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileDrawer);
        if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileDrawer);
        if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileDrawer);

        // Close drawer on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('active')) {
                closeMobileDrawer();
            }
        });

        // Initialize Scroll Spy
        initScrollSpy();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
