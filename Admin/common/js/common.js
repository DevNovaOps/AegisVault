/**
 * AegisVault — Admin Common Script Entry Point
 * Exposes the centralized AegisAdminCommon controller.
 */
(function () {
    'use strict';
    if (window.AegisAdminCommon) {
        window.AegisCommon = window.AegisAdminCommon;
    }
})();
