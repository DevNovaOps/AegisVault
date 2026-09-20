/**
 * AegisVault - Verification Engine & Logic
 * Handles verification timeline, step inspection, method configuration,
 * suspicious activity toggles, and trustee profiles.
 */

const AegisVerification = {
    // Current active step selected in the UI
    activeStepId: "email-verification",

    /**
     * Initialize verification module components
     */
    init() {
        this.renderTimeline();
        this.renderVerificationRows();
        this.renderVerificationMethods();
        this.renderSuspiciousRules();
        this.renderRecentActivity();
        this.bindEvents();
    },

    /**
     * Render the 5-step horizontal timeline
     */
    renderTimeline() {
        const timelineContainer = document.getElementById("timeline-steps");
        if (!timelineContainer) return;

        timelineContainer.innerHTML = AegisData.verificationSteps.map((step, index) => {
            const isCompleted = step.status === "Completed";
            const isActive = step.id === this.activeStepId;
            return `
                <div class="timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}" 
                     data-step-id="${step.id}" 
                     data-step-num="${step.step}"
                     role="button"
                     tabindex="0"
                     aria-label="Step ${step.step}: ${step.shortTitle}">
                    <div class="step-indicator">
                        <span class="step-num">${step.step}</span>
                        <svg class="step-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <div class="step-label">${step.shortTitle}</div>
                </div>
            `;
        }).join('');
    },

    /**
     * Render the 5 verification rows below the timeline
     */
    renderVerificationRows() {
        const rowsContainer = document.getElementById("verification-rows");
        if (!rowsContainer) return;

        rowsContainer.innerHTML = AegisData.verificationSteps.map(step => {
            return `
                <div class="verification-row" 
                     data-step-id="${step.id}" 
                     role="button" 
                     tabindex="0" 
                     aria-label="View details for ${step.title}">
                    <div class="row-icon-box">
                        ${this.getStepIcon(step.icon)}
                    </div>
                    <div class="row-content">
                        <div class="row-title">${step.title}</div>
                        <div class="row-description">${step.description}</div>
                    </div>
                    <div class="row-badge-action">
                        <span class="status-badge badge-emerald">
                            <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            ${step.status}
                        </span>
                        <span class="row-arrow" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Helper to return icon SVGs for verification steps
     */
    getStepIcon(type) {
        switch (type) {
            case 'mail':
                return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>`;
            case 'chat':
                return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    <circle cx="9" cy="10" r="1"></circle>
                    <circle cx="12" cy="10" r="1"></circle>
                    <circle cx="15" cy="10" r="1"></circle>
                </svg>`;
            case 'id-card':
                return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <line x1="6" y1="8" x2="6" y2="8.01"></line>
                    <line x1="10" y1="8" x2="18" y2="8"></line>
                    <line x1="10" y1="12" x2="18" y2="12"></line>
                    <line x1="6" y1="16" x2="18" y2="16"></line>
                </svg>`;
            case 'user-shield':
                return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>`;
            case 'key':
                return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 2l-2 2m-1.5 1.5L14 9m-1.5 1.5l-3 3-1.5-1.5-3 3 1.5 1.5L5 18l3-3 1.5 1.5 3-3m-1.5-1.5L16 7l2-2"></path>
                    <circle cx="7.5" cy="16.5" r="4.5"></circle>
                </svg>`;
            case 'lock':
                return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>`;
            case 'fingerprint':
                return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a10 10 0 0 0-6.88 17.26"></path>
                    <path d="M8.56 5.88A6 6 0 0 1 18 10v9.5"></path>
                    <path d="M5.5 12.5a8 8 0 0 1 13 0"></path>
                    <path d="M12 15a3 3 0 0 1-3-3V9"></path>
                    <path d="M12 9a3 3 0 0 1 3 3v8"></path>
                </svg>`;
            default:
                return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                </svg>`;
        }
    },

    /**
     * Render the 5 verification method cards
     */
    renderVerificationMethods() {
        const methodsContainer = document.getElementById("methods-grid");
        if (!methodsContainer) return;

        methodsContainer.innerHTML = AegisData.verificationMethods.map(method => {
            const isEnabled = method.status === "Enabled";
            return `
                <div class="method-card ${isEnabled ? 'enabled' : 'disabled'}" 
                     data-method-id="${method.id}"
                     role="button"
                     tabindex="0"
                     title="Click to toggle status for ${method.name}">
                    <div class="method-icon-box">
                        ${this.getStepIcon(method.icon)}
                    </div>
                    <div class="method-name">${method.name}</div>
                    <div class="method-badge-wrap">
                        <span class="status-badge ${isEnabled ? 'badge-emerald' : 'badge-muted'}">
                            <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                ${isEnabled ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'}
                            </svg>
                            ${method.status}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Render the 6 Suspicious Activity Monitoring Rules
     */
    renderSuspiciousRules() {
        const rulesContainer = document.getElementById("suspicious-rules-list");
        if (!rulesContainer) return;

        rulesContainer.innerHTML = AegisData.suspiciousRules.map(rule => {
            return `
                <label class="security-rule-item" for="${rule.id}">
                    <input type="checkbox" 
                           id="${rule.id}" 
                           class="rule-checkbox" 
                           ${rule.enabled ? 'checked' : ''} 
                           data-rule-id="${rule.id}">
                    <span class="rule-custom-checkbox" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </span>
                    <span class="rule-label-text">${rule.label}</span>
                </label>
            `;
        }).join('');
    },

    /**
     * Render the Recent Activity timeline list
     */
    renderRecentActivity(filter = "all") {
        const activityContainer = document.getElementById("recent-activity-list");
        if (!activityContainer) return;

        let filtered = AegisData.recentActivity;
        if (filter === "success") {
            filtered = AegisData.recentActivity.filter(a => a.type === "success");
        } else if (filter === "failed") {
            filtered = AegisData.recentActivity.filter(a => a.type === "failed");
        }

        // Limit to 5 entries for the main card view
        const displayItems = filtered.slice(0, 5);

        activityContainer.innerHTML = displayItems.map(item => {
            const isSuccess = item.type === "success";
            return `
                <div class="activity-item ${item.type}">
                    <div class="activity-bullet ${isSuccess ? 'bullet-emerald' : 'bullet-danger'}"></div>
                    <div class="activity-content">
                        <div class="activity-header-line">
                            <span class="activity-time">${item.timestamp}</span>
                            <span class="activity-actor">${item.actor}</span>
                        </div>
                        <div class="activity-action ${isSuccess ? 'action-success' : 'action-failed'}">
                            ${item.action}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Open Verification Step detail modal
     */
    openStepModal(stepId) {
        const step = AegisData.verificationSteps.find(s => s.id === stepId);
        if (!step) return;

        const modalBody = document.getElementById("step-modal-body");
        const modalTitle = document.getElementById("step-modal-title");

        if (modalTitle) {
            modalTitle.textContent = step.title;
        }

        if (modalBody) {
            modalBody.innerHTML = `
                <div class="modal-step-header">
                    <div class="step-modal-badge-row">
                        <span class="status-badge badge-emerald">
                            <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            ${step.status}
                        </span>
                        <span class="modal-time-stamp">Verified on: ${step.completedDate}</span>
                    </div>
                    <p class="modal-step-desc">${step.description}</p>
                </div>

                <div class="verification-meta-grid">
                    <div class="meta-item">
                        <div class="meta-label">Authentication Method</div>
                        <div class="meta-value">${step.provider}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Cryptographic Hash</div>
                        <div class="meta-value mono-text">${step.authHash}</div>
                    </div>
                    <div class="meta-item full-width">
                        <div class="meta-label">Verification Evidence & Telemetry</div>
                        <div class="meta-value">${step.details}</div>
                    </div>
                    <div class="meta-item full-width">
                        <div class="meta-label">Cryptographic Audit Trail</div>
                        <div class="meta-value audit-box mono-text">${step.auditLog}</div>
                    </div>
                </div>

                <div class="step-modal-actions">
                    <button class="btn btn-secondary" onclick="AegisInteractions.closeModal('step-details-modal')">
                        Close
                    </button>
                    <button class="btn btn-primary" id="btn-reverify-simulation" data-step-id="${step.id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <polyline points="1 20 1 14 7 14"></polyline>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                        Simulate Re-Verification
                    </button>
                </div>
            `;

            // Bind simulation button
            const simBtn = document.getElementById("btn-reverify-simulation");
            if (simBtn) {
                simBtn.addEventListener("click", () => this.simulateStepVerification(step.id));
            }
        }

        AegisInteractions.openModal("step-details-modal");
    },

    /**
     * Simulate re-verifying a step with live animation and toast
     */
    simulateStepVerification(stepId) {
        const step = AegisData.verificationSteps.find(s => s.id === stepId);
        if (!step) return;

        const simBtn = document.getElementById("btn-reverify-simulation");
        if (simBtn) {
            simBtn.disabled = true;
            simBtn.innerHTML = `
                <svg class="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
                </svg>
                Verifying Cryptographic Proof...
            `;
        }

        setTimeout(() => {
            AegisInteractions.closeModal("step-details-modal");
            AegisInteractions.showToast(`Re-verification succeeded for ${step.shortTitle}! Zero-knowledge proof verified.`, "success");
            
            // Add a new log entry
            const now = new Date();
            const timeString = "Today, " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            AegisData.recentActivity.unshift({
                id: "act-" + Date.now(),
                timestamp: timeString,
                action: `${step.shortTitle} re-verified`,
                actor: "Rakesh Patel",
                type: "success",
                icon: "check-circle",
                details: "On-demand re-verification test requested by Aryan Patel"
            });
            this.renderRecentActivity();
        }, 1200);
    },

    /**
     * Open Trustee Profile Modal
     */
    openTrusteeModal() {
        const t = AegisData.trustee;
        const modalBody = document.getElementById("trustee-modal-body");
        if (!modalBody) return;

        modalBody.innerHTML = `
            <div class="trustee-modal-hero">
                <div class="trustee-avatar-wrapper">
                    <img src="${t.avatar}" alt="${t.name}" class="trustee-modal-avatar">
                    <span class="trustee-online-indicator" title="Cryptographically Verified"></span>
                </div>
                <div class="trustee-hero-text">
                    <div class="trustee-modal-name-row">
                        <h3>${t.name}</h3>
                        <span class="status-badge badge-emerald">
                            <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            ${t.status}
                        </span>
                    </div>
                    <div class="trustee-modal-sub">
                        <span>Relationship: <strong>${t.relationship}</strong></span>
                        <span>•</span>
                        <span>Trust Score: <strong class="text-gold">${t.trustScore}%</strong></span>
                    </div>
                </div>
            </div>

            <div class="trustee-detail-tabs">
                <div class="trustee-tab active" data-tab="identity">Identity & Vault Share</div>
                <div class="trustee-tab" data-tab="security">Security Protocols</div>
                <div class="trustee-tab" data-tab="history">Audit Log</div>
            </div>

            <div class="trustee-tab-content active" id="tab-identity-content">
                <div class="trustee-info-grid">
                    <div class="info-row">
                        <span class="info-label">Email Address</span>
                        <span class="info-val">${t.email}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Contact Phone</span>
                        <span class="info-val">${t.phone}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Added to Vault</span>
                        <span class="info-val">${t.addedDate}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Last Verified</span>
                        <span class="info-val">${t.verifiedAt}</span>
                    </div>
                    <div class="info-row full">
                        <span class="info-label">Designated Vault</span>
                        <span class="info-val">${t.assignedVault}</span>
                    </div>
                    <div class="info-row full">
                        <span class="info-label">Cryptographic Allocation</span>
                        <span class="info-val mono-text highlight-gold">${t.allocatedShare}</span>
                    </div>
                    <div class="info-row full">
                        <span class="info-label">Threshold Policy</span>
                        <span class="info-val">${t.thresholdRequirement}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">ID Document</span>
                        <span class="info-val">${t.idDocument}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Government ID Number</span>
                        <span class="info-val mono-text">${t.idNumberMasked}</span>
                    </div>
                </div>
            </div>

            <div class="trustee-tab-content" id="tab-security-content" style="display: none;">
                <div class="security-overview-card">
                    <div class="sec-item">
                        <strong>Emergency Contact Authorization:</strong> 
                        <span class="badge-emerald inline-badge">Enabled</span>
                    </div>
                    <div class="sec-item">
                        <strong>Legal Jurisdiction:</strong> ${t.legalJurisdiction}
                    </div>
                    <div class="sec-item">
                        <strong>Custodian Notes:</strong> ${t.notes}
                    </div>
                </div>
            </div>

            <div class="trustee-tab-content" id="tab-history-content" style="display: none;">
                <div class="mini-audit-list">
                    ${AegisData.recentActivity.filter(a => a.actor === t.name).map(a => `
                        <div class="mini-audit-item">
                            <span class="mini-date">${a.timestamp}</span>
                            <span class="mini-action">${a.action}</span>
                            <span class="mini-details">${a.details}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="modal-footer-actions">
                <button class="btn btn-secondary" onclick="AegisInteractions.closeModal('trustee-profile-modal')">
                    Close
                </button>
                <button class="btn btn-primary" onclick="AegisVerification.contactTrustee('${t.email}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Contact Trustee
                </button>
            </div>
        `;

        // Tab switching logic in trustee modal
        const tabs = modalBody.querySelectorAll(".trustee-tab");
        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                tabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                const target = tab.getAttribute("data-tab");
                modalBody.querySelectorAll(".trustee-tab-content").forEach(content => {
                    content.style.display = content.id === `tab-${target}-content` ? "block" : "none";
                });
            });
        });

        AegisInteractions.openModal("trustee-profile-modal");
    },

    /**
     * Contact trustee action (simulated)
     */
    contactTrustee(email) {
        AegisInteractions.showToast(`Simulated secure channel dispatch to ${email}. No live message sent in sandbox mode.`, "info");
    },

    /**
     * Open Verification Methods Configuration Modal
     */
    openMethodsModal() {
        const modalBody = document.getElementById("methods-modal-body");
        if (!modalBody) return;

        modalBody.innerHTML = `
            <p class="modal-subtitle-text">
                Toggle authentication factors required for trustees to access vault shares. Changes take effect immediately.
            </p>
            <div class="methods-config-list">
                ${AegisData.verificationMethods.map(method => {
                    const isEnabled = method.status === "Enabled";
                    return `
                        <div class="config-method-row">
                            <div class="config-method-info">
                                <div class="config-title-line">
                                    <span class="config-title">${method.name}</span>
                                    ${method.required ? '<span class="pill-required">Required Factor</span>' : '<span class="pill-optional">Optional</span>'}
                                </div>
                                <div class="config-desc">${method.description}</div>
                            </div>
                            <label class="switch-toggle" for="toggle-${method.id}">
                                <input type="checkbox" 
                                       id="toggle-${method.id}" 
                                       data-method-id="${method.id}"
                                       ${isEnabled ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="modal-footer-actions">
                <button class="btn btn-primary" onclick="AegisInteractions.closeModal('methods-config-modal')">
                    Done
                </button>
            </div>
        `;

        // Bind switch toggles
        modalBody.querySelectorAll(".switch-toggle input").forEach(input => {
            input.addEventListener("change", (e) => {
                const methodId = e.target.getAttribute("data-method-id");
                const targetMethod = AegisData.verificationMethods.find(m => m.id === methodId);
                if (targetMethod) {
                    targetMethod.status = e.target.checked ? "Enabled" : "Disabled";
                    this.renderVerificationMethods();
                    AegisInteractions.showToast(
                        `${targetMethod.name} has been ${targetMethod.status.toLowerCase()}.`,
                        targetMethod.status === "Enabled" ? "success" : "warning"
                    );
                }
            });
        });

        AegisInteractions.openModal("methods-config-modal");
    },

    /**
     * Open View All Activity Modal
     */
    openActivityModal() {
        const modalBody = document.getElementById("activity-modal-body");
        if (!modalBody) return;

        modalBody.innerHTML = `
            <div class="activity-modal-controls">
                <div class="search-input-wrap">
                    <svg class="search-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" id="activity-search-box" placeholder="Filter by action, actor, or detail...">
                </div>
                <div class="activity-filter-buttons">
                    <button class="filter-btn active" data-filter="all">All Events</button>
                    <button class="filter-btn" data-filter="success">Successful</button>
                    <button class="filter-btn" data-filter="failed">Failed / Alerts</button>
                </div>
            </div>

            <div class="full-activity-feed" id="full-activity-feed-list">
                <!-- Rendered dynamically -->
            </div>
        `;

        const renderFullList = (filter = "all", searchQuery = "") => {
            const container = document.getElementById("full-activity-feed-list");
            if (!container) return;

            let list = AegisData.recentActivity;
            if (filter === "success") list = list.filter(a => a.type === "success");
            if (filter === "failed") list = list.filter(a => a.type === "failed");

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                list = list.filter(a => 
                    a.action.toLowerCase().includes(q) || 
                    a.actor.toLowerCase().includes(q) || 
                    a.details.toLowerCase().includes(q)
                );
            }

            if (list.length === 0) {
                container.innerHTML = `
                    <div class="no-activity-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <p>No activity records match your criteria.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = list.map(item => {
                const isSuccess = item.type === "success";
                return `
                    <div class="modal-activity-row ${item.type}">
                        <div class="act-left-meta">
                            <span class="act-bullet ${isSuccess ? 'bullet-emerald' : 'bullet-danger'}"></span>
                            <span class="act-time-stamp">${item.timestamp}</span>
                        </div>
                        <div class="act-middle-content">
                            <div class="act-title">${item.action}</div>
                            <div class="act-details">${item.details}</div>
                        </div>
                        <div class="act-right-actor">
                            <span class="actor-badge">${item.actor}</span>
                        </div>
                    </div>
                `;
            }).join('');
        };

        renderFullList();

        // Search event
        const searchInput = document.getElementById("activity-search-box");
        let currentFilter = "all";
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                renderFullList(currentFilter, e.target.value);
            });
        }

        // Filter button events
        modalBody.querySelectorAll(".filter-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                modalBody.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                currentFilter = btn.getAttribute("data-filter");
                const query = searchInput ? searchInput.value : "";
                renderFullList(currentFilter, query);
            });
        });

        AegisInteractions.openModal("full-activity-modal");
    },

    /**
     * Open Suspicious Activity Detection Learn More Modal
     */
    openSuspiciousLearnModal() {
        const modalBody = document.getElementById("learn-more-modal-body");
        if (!modalBody) return;

        modalBody.innerHTML = `
            <div class="learn-more-hero">
                <div class="learn-shield-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                </div>
                <div>
                    <h4>Aegis Sentinel Threat Detection</h4>
                    <p>Automated behavioral heuristics designed to prevent unauthorized trustee impersonation and coercion.</p>
                </div>
            </div>

            <div class="threat-model-list">
                <div class="threat-model-card">
                    <h5>1. Impossible Travel & Geolocation Heuristics</h5>
                    <p>Calculates the speed required to travel between two consecutive verification points. If the transit velocity exceeds commercial airliner speed (850 km/h), the session is instantly placed under step-up biometric challenge.</p>
                </div>
                <div class="threat-model-card">
                    <h5>2. Cryptographic Share Sanity Validation</h5>
                    <p>Using Pedersen commitment vectors, submitted polynomial shares are verified mathematically before inclusion in Lagrange interpolation. Invalid or malformed shares trigger automatic containment.</p>
                </div>
                <div class="threat-model-card">
                    <h5>3. Exponential Brute-Force Rate Limiting</h5>
                    <p>Protects SMS and TOTP channels against distributed botnet guessing. Three consecutive failures result in a 24-hour mandatory lock and owner dispatch.</p>
                </div>
            </div>

            <div class="modal-disclaimer-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="disclaimer-icon">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span><strong>Prototype Notice:</strong> These monitoring rules are active in simulation mode. No live cellular or geolocation data is transmitted.</span>
            </div>

            <div class="modal-footer-actions">
                <button class="btn btn-primary" onclick="AegisInteractions.closeModal('learn-more-modal')">
                    Understood
                </button>
            </div>
        `;

        AegisInteractions.openModal("learn-more-modal");
    },

    /**
     * Bind all DOM events for verification controls
     */
    bindEvents() {
        // Timeline steps click
        const timelineContainer = document.getElementById("timeline-steps");
        if (timelineContainer) {
            timelineContainer.addEventListener("click", (e) => {
                const stepEl = e.target.closest(".timeline-step");
                if (stepEl) {
                    const stepId = stepEl.getAttribute("data-step-id");
                    this.activeStepId = stepId;
                    this.renderTimeline();
                    this.openStepModal(stepId);
                }
            });
        }

        // Verification rows click
        const rowsContainer = document.getElementById("verification-rows");
        if (rowsContainer) {
            rowsContainer.addEventListener("click", (e) => {
                const rowEl = e.target.closest(".verification-row");
                if (rowEl) {
                    const stepId = rowEl.getAttribute("data-step-id");
                    this.activeStepId = stepId;
                    this.renderTimeline();
                    this.openStepModal(stepId);
                }
            });
        }

        // Method cards click
        const methodsContainer = document.getElementById("methods-grid");
        if (methodsContainer) {
            methodsContainer.addEventListener("click", (e) => {
                const card = e.target.closest(".method-card");
                if (card) {
                    const methodId = card.getAttribute("data-method-id");
                    const method = AegisData.verificationMethods.find(m => m.id === methodId);
                    if (method) {
                        method.status = method.status === "Enabled" ? "Disabled" : "Enabled";
                        this.renderVerificationMethods();
                        AegisInteractions.showToast(
                            `${method.name} status updated to ${method.status}.`,
                            method.status === "Enabled" ? "success" : "warning"
                        );
                    }
                }
            });
        }

        // Configure methods button
        const configBtn = document.getElementById("btn-configure-methods");
        if (configBtn) {
            configBtn.addEventListener("click", () => this.openMethodsModal());
        }

        // Suspicious activity rules toggle
        const rulesContainer = document.getElementById("suspicious-rules-list");
        if (rulesContainer) {
            rulesContainer.addEventListener("change", (e) => {
                if (e.target.classList.contains("rule-checkbox")) {
                    const ruleId = e.target.getAttribute("data-rule-id");
                    const rule = AegisData.suspiciousRules.find(r => r.id === ruleId);
                    if (rule) {
                        rule.enabled = e.target.checked;
                        AegisInteractions.showToast(
                            `Rule "${rule.label}" ${rule.enabled ? 'activated' : 'deactivated'}.`,
                            rule.enabled ? "success" : "info"
                        );
                    }
                }
            });
        }

        // Learn more suspicious activity
        const learnMoreBtn = document.getElementById("link-learn-more-suspicious");
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener("click", (e) => {
                e.preventDefault();
                this.openSuspiciousLearnModal();
            });
        }

        // View Profile button
        const viewProfileBtn = document.getElementById("btn-view-profile");
        if (viewProfileBtn) {
            viewProfileBtn.addEventListener("click", () => this.openTrusteeModal());
        }

        // View All activity link
        const viewAllActivityLink = document.getElementById("link-view-all-activity");
        if (viewAllActivityLink) {
            viewAllActivityLink.addEventListener("click", (e) => {
                e.preventDefault();
                this.openActivityModal();
            });
        }
    }
};

window.AegisVerification = AegisVerification;
