/**
 * AegisVault Security Operations Module - Main Application Initializer
 * Coordinates DOM ready, dataset bootstrap, and interactive bindings.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Interactive Systems (Theme, Search, Modals, Drawer)
    if (window.AegisInteractions) {
        window.AegisInteractions.init();
    }

    // 2. Initialize Security Operations Module (Stats, Tables, Gauges, Chart)
    if (window.AegisSecurityOps) {
        window.AegisSecurityOps.init();
    }

    // 3. Optional Console Welcome for developers / evaluation
    console.log(
        '%c AegisVault %c Security Operations Module Initialized ',
        'background: #E86326; color: #FFFFFF; font-weight: bold; border-radius: 3px 0 0 3px; padding: 2px 6px;',
        'background: #06151E; color: #00D9A5; font-weight: bold; border-radius: 0 3px 3px 0; padding: 2px 6px;'
    );
});
