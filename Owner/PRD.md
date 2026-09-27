# AegisVault Owner Panel — Product Requirements Document (PRD)

**Document Version**: 1.0.0  
**Target Release**: AegisVault Frontend v1.0  
**Target User Persona**: Digital Vault Owner (Primary Custodian & Legator)  
**System Scope**: Complete Owner Panel Frontend (HTML5, Vanilla CSS3, Vanilla JavaScript)  
**Architecture Boundary**: Self-contained client-side single-page modules with mock persistence and marked backend integration points.

---

## 1. Product Overview & Architecture Context

### 1.1 Product Vision
**AegisVault** is an enterprise-grade digital legacy protection and dead-man's-switch vault application. The **Owner Panel** serves as the command center for the primary vault creator (the "Owner"). Through this panel, the Owner creates and encrypts digital vaults containing confidential assets, credentials, legal documents, sentimental media, and critical directives. The Owner assigns designated **Trustees**, distributes cryptographic **Shares**, configures automated **Heartbeat & Release Protocols**, monitors activity logs, and audits system health.

### 1.2 Core Domain Entity Relationships
```
   +-------------------------------------------------------+
   |                      VAULT OWNER                      |
   |           (Primary Custodian / Legator)               |
   +-------------------------------------------------------+
          |                            |
          | creates & manages          | invites & assigns
          v                            v
   +--------------+             +--------------+
   |    VAULTS    |<------------|   TRUSTEES   |
   | (Confidential|  assigned   | (Designated  |
   |   Assets)    |  custodians |  Guardians)  |
   +--------------+             +--------------+
          |                            |
          | protected by               | receives
          v                            v
   +--------------+             +--------------+
   |   SHADOW     |<------------|  SHAMIR'S    |
   | RECONSTRUCT. |   submits   |    KEY       |
   |   QUORUM     |  threshold  |   SHARES     |
   +--------------+             +--------------+
          |
          | triggers upon verifiable condition
          v
   +-------------------------------------------------------+
   |                  RELEASE MANAGEMENT                   |
   |        (Inactivity / Heartbeat Timeout / Manual)      |
   +-------------------------------------------------------+
```

1. **Owner**: Sets up vaults, establishes release conditions, invites trustees, monitors system audit trails.
2. **Vault**: Contains encrypted categories (Personal, Family, Business, Legacy, Health). Configured with release triggers (e.g. 90-day inactivity, medical verification).
3. **Trustees**: Verified individuals assigned to specific vaults with predefined quorum thresholds (e.g., 2-of-3 or 3-of-5).
4. **Shares**: Cryptographic fragments split via Shamir's Secret Sharing algorithm. A single trustee cannot reconstruct the vault key alone; consensus is mandatory.
5. **Release**: The timed or triggered protocol where trustees submit their assigned shares to unlock and release authorized materials to verified beneficiaries.

---

## 2. Global Architecture & Design System

### 2.1 Technology Stack & Conventions
* **Markup**: Semantic HTML5 (`<header>`, `<aside>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
* **Styling**: Vanilla CSS3 using custom properties (`:root` and `[data-theme="light"]`), CSS Grid, Flexbox, BEM-inspired modular naming. **Strictly no Tailwind, Bootstrap, or utility frameworks.**
* **Interactivity**: Vanilla JavaScript (ES6+), Event Delegation, `localStorage` caching, zero external runtime libraries.
* **Fonts**: `Plus Jakarta Sans` (300, 400, 500, 600, 700, 800) for UI body/controls, `Cinzel` serif for heroic statements.

### 2.2 Color Palette & Design Tokens
```css
:root {
  /* Brand Accents */
  --brand-orange: #f97316;
  --brand-orange-hover: #ea580c;
  --brand-orange-light: rgba(249, 115, 22, 0.12);
  --brand-gold: #f59e0b;
  
  /* Dark Theme Surfaces (Default) */
  --bg-base: #060b11;
  --bg-surface: #0b131e;
  --bg-card: #0f1926;
  --bg-card-hover: #152234;
  --bg-input: #080e16;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-card: rgba(255, 255, 255, 0.1);
  --border-focus: #f97316;
  
  /* Dark Theme Typography */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  /* Functional Status Colors */
  --status-success: #10b981;
  --status-success-bg: rgba(16, 185, 129, 0.14);
  --status-warning: #f59e0b;
  --status-warning-bg: rgba(245, 158, 11, 0.14);
  --status-danger: #ef4444;
  --status-danger-bg: rgba(239, 68, 68, 0.14);
  --status-info: #0284c7;
  --status-info-bg: rgba(2, 132, 199, 0.14);
  --status-purple: #8b5cf6;
  --status-purple-bg: rgba(139, 92, 246, 0.14);

  /* Geometry & Elevation */
  --sidebar-width: 260px;
  --topbar-height: 60px;
  --hero-height: 230px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-full: 9999px;
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.35);
  --shadow-dropdown: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s ease;
}

/* Light Theme Overrides */
[data-theme="light"] {
  --bg-base: #f1f5f9;
  --bg-surface: #ffffff;
  --bg-card: #ffffff;
  --bg-card-hover: #f8fafc;
  --bg-input: #f8fafc;
  --border-subtle: #e2e8f0;
  --border-card: #cbd5e1;
  
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  
  --shadow-card: 0 4px 18px rgba(15, 23, 42, 0.06);
  --shadow-dropdown: 0 10px 25px -5px rgba(15, 23, 42, 0.12);
}
```

### 2.3 Shared Layout Architecture
1. **Sidebar Navigation (`<aside class="owner-sidebar">`)**:
   - Fixed width of `260px`, `100vh` sticky height.
   - AegisVault Brand header: Shield emblem with orange accents + "AegisVault" wordmark + "What matters, lives on." tagline.
   - Navigation flow with 10 modules and real-time numerical badges for Invitations (`2`) and Notifications (`3`).
   - Integrated full-bleed scenic sunset background with high-contrast darkening gradient overlay.
   - Bottom scenic quote footer: `"Your legacy. Their tomorrow."` with signature orange dash (`.sidebar-scenic-dash`).
2. **Top Navigation Bar (`<header class="owner-topbar">`)**:
   - Fixed height `60px`, sticky `top: 0; z-index: 90`.
   - Global Search input (`Search vaults, trustees, submissions, or settings...`).
   - Theme Toggle button (Moon / Sun icon) supporting instant zero-flash toggle with `localStorage` persistence.
   - Notification Bell button with dynamic unread indicator badge (`3`).
   - User Profile Chip: Avatar initials circle ("RP"), Name "Rakesh Patel", down chevron, and interactive dropdown menu (`Profile & Security`, `Preferences`, `Audit Log`, `Sign Out`).
3. **Hero Panoramic Banner (`<section class="owner-hero">`)**:
   - Master fixed `230px` box height across all desktop pages to eliminate Cumulative Layout Shift (CLS = 0).
   - High-definition sunset mountain artwork (`dark-background.png` in Dark Mode, `light-background.png` in Light Mode).
   - Numbered uppercase eyebrow (`01. OWNER DASHBOARD`, `02. MY VAULTS`, etc.).
   - Serif/sans headline with orange emphasis ("Welcome back, **Rakesh!**").
   - Module description subtext.
   - Right Quote card with italic text and orange underline dash (`"Plan today. Protect what matters tomorrow."`).
4. **App Footer (`<footer class="owner-footer">`)**:
   - AegisVault shield logo & copyright notice on left.
   - Centered inspirational quote: `"Because what matters today, should matter tomorrow too."` with orange dash.
   - Right navigation links: `Privacy` | `Terms` | `Help`.

---

## 3. Detailed Module Specifications

---

### Module 1: Dashboard (`owner/dashboard/`)
* **Purpose**: Serves as the primary operational command center for the Vault Owner, providing immediate visibility into vault counts, active monitoring status, trustee participation, pending approvals, release triggers, upcoming events, and vault security health.
* **Reference Assets**:
  - Dark Mode: `owner/assets/Dark/Dashboard.png`
  - Light Mode: `owner/assets/Light/Dashboard.png`
* **UI Components & Layout**:
  1. **Hero Banner**: Numbered eyebrow `01. OWNER DASHBOARD`, headline `Welcome back, Rakesh!`, subtext `Manage your digital legacy, trustees, and release settings all in one place.`, quote `"Plan today. Protect what matters tomorrow."`.
  2. **5 KPI Metrics Row**:
     - Metric 1: **Total Vaults** (`6` | All vaults created) — Blue icon box
     - Metric 2: **Active Vaults** (`5` | Currently monitoring) — Green check icon box
     - Metric 3: **Trustees** (`8` | Across all vaults) — Amber users icon box
     - Metric 4: **Pending Invitations** (`2` | Awaiting response) — Purple envelope icon box
     - Metric 5: **Release Request** (`1` | Under review) — Red rocket icon box
  3. **Row 1 Split Widgets (3 Columns)**:
     - **Vault Overview Widget**: Interactive bar chart displaying 6-month historical activity (Apr to Sep) comparing `Active Vaults` (blue), `Shares Submitted` (amber), and `Trustees Assigned` (green) with time-range selector dropdown (`Last 6 Months`, `Last 30 Days`, `Year to Date`).
     - **Release Status Donut Widget**: Custom SVG interactive donut chart displaying `6 Total Vaults` in center and visual segments: `2 Completed` (green), `1 In Progress` (blue), `2 Scheduled` (orange), and `1 Not Started` (red).
     - **Upcoming Events Widget**: Chronological alert cards with date chips (`15 Sep`, `22 Sep`, `10 Oct`, `25 Oct`), title, associated vault, and countdown pill (`In 5 days`, `In 12 days`, `In 30 days`, `In 45 days`), plus header link `View All →`.
  4. **Row 2 Split Widgets (3 Columns)**:
     - **Recent Activity Table Widget**: Tabular log showing Date & Time, Action badge (with icon: Trustee Invited, Share Submitted, Vault Updated, Trustee Verified, Release Request), Target Vault link, and Details snippet.
     - **Quick Actions Widget**: 4 interactive launcher cards with icons, descriptions, and chevrons:
       - *Create New Vault* ("Set up a new digital vault")
       - *Invite Trustee* ("Add a trusted person")
       - *Manage Shares* ("View and manage vault shares")
       - *Configure Release* ("Set release conditions")
     - **Vault Health Widget**: Security status list displaying vault icon, name, mode (Active / Scheduled), and health badges (`Healthy` green check, `Attention` orange alert), plus header link `View All →`.
* **Interactive Behavior**:
  - Interactive chart bars with hover tooltips displaying exact counts.
  - Interactive donut segments with hover highlights.
  - Time filter on Vault Overview updates chart data dynamically.
  - Quick action buttons trigger respective modals (e.g. Quick Create Vault modal).
  - Search in topbar filters recent activity records in real time.
* **Future Backend Integration Point**: `GET /api/v1/owner/dashboard/stats`, `GET /api/v1/owner/dashboard/overview`, `GET /api/v1/owner/dashboard/recent-activity`.

---

### Module 2: My Vaults (`owner/my-vaults/`)
* **Purpose**: Comprehensive lifecycle management of all digital vaults. Allows owners to create, view, update, lock, and archive vaults across distinct categories (Personal, Family, Business, Legacy, Health).
* **Reference Assets**:
  - Dark Mode: `owner/assets/Dark/Vault.png`
  - Light Mode: `owner/assets/Light/Vault.png`
* **UI Components**:
  - Hero banner with `02. MY VAULTS` eyebrow and `"Secure today. Share tomorrow. Leave what matters."` quote.
  - 5 Stat Cards: Total Vaults (`6`), Active Vaults (`4`), Draft Vault (`1`), Locked Vault (`1`), Total Trustees (`8`).
  - Search bar with live keyword filtering by name, description, or tags.
  - Filter dropdowns: Status (`All Statuses`, `Active`, `Draft`, `Locked`), Type (`All Types`, `Personal`, `Family`, `Business`, `Legacy`, `Health`), Sort By (`Last Updated`, `Name`, `Trustees Count`).
  - Primary button: `+ Create New Vault` launching multi-step vault creation modal.
  - Vaults Data Table with thumbnail avatar, vault name, description, Type badge, Status pill, Trustees count, Shares progress bar (`3/3`, `2/2`, `0/2`, etc.), Last Updated timestamp, and action buttons (`View`, `Edit`, `...` context menu).
  - Right Side Summary Widgets: `Vault Categories` breakdown counts and `Storage Overview` progress bar (`3.2 GB of 10 GB (32%)`).
* **Interactive Modals**:
  - `Create Vault Modal`: Name, category selection, description, secret notes, release trigger condition, and trustee assignment step.
  - `Vault Details Modal`: Read-only inspection of encrypted payload metadata and assigned custodians.
* **Future Backend Integration Point**: `GET /api/v1/owner/vaults`, `POST /api/v1/owner/vaults`, `PUT /api/v1/owner/vaults/:id`, `DELETE /api/v1/owner/vaults/:id`.

---

### Module 3: Trustees (`owner/trustees/`)
* **Purpose**: Directory and permission management of appointed guardians. Owners assign trustees to vaults, track verification status (KYC / Liveness), and configure emergency contact details.
* **Reference Assets**:
  - Dark Mode: `owner/assets/Dark/Trustee.png`
  - Light Mode: `owner/assets/Light/Trustee.png`
* **UI Components**:
  - Hero banner with `03. TRUSTEES` eyebrow and `"Trusted people build a safer tomorrow."` quote.
  - 5 Stat Cards: Total Trustees (`8`), Verified Trustees (`5`), Pending Verification (`2`), Invitation Sent (`1`), Removed Trustees (`0`).
  - Search bar & filters for Status (`All Statuses`, `Verified`, `Pending`, `Not Started`), Assigned Vault, and Relationship (`Brother`, `Sister`, `Friend`, `Spouse`, `Colleague`, `Cousin`, `Legal Advisor`).
  - `+ Add Trustee` button with interactive invitation flow.
  - Comprehensive Trustees Table: Avatar photo/initials, Full Name, Email, Relationship badge, Vaults Assigned chip, Verification Status pill (`Verified` green, `Pending` orange, `Not Started` red), Account Status (`Active`, `Invited`), and row action buttons (`View`, `Edit`, `...`).
  - Right Side Widgets: `Trustee Overview` donut chart and `Verification Progress` bar (`5 of 8 trustees verified - 62%`), plus `Help & Guidelines` card.
* **Future Backend Integration Point**: `GET /api/v1/owner/trustees`, `POST /api/v1/owner/trustees`, `PUT /api/v1/owner/trustees/:id`, `DELETE /api/v1/owner/trustees/:id`.

---

### Module 4: Invitations (`owner/invitations/`)
* **Purpose**: Tracking outgoing invitations to prospective trustees. Manages acceptance rates, token expirations, resending invite links, and revoking invitations.
* **Reference Assets**:
  - Dark Mode: `owner/assets/Dark/Invitations.png`
  - Light Mode: `owner/assets/Light/Invitation.png`
* **UI Components**:
  - Hero banner with `04. INVITATIONS` eyebrow and quote.
  - Stat cards: Total Sent, Accepted, Pending Response, Expired, Revoked.
  - Filter tabs: `All Invitations`, `Pending`, `Accepted`, `Declined`, `Expired`.
  - Action buttons to `Resend Invitation Email` (with toast notification) and `Cancel Invitation` (with confirmation modal).
  - Search bar and tabular view with email, recipient name, assigned vault role, invitation date, expiration countdown, status badge, and audit log.
* **Future Backend Integration Point**: `GET /api/v1/owner/invitations`, `POST /api/v1/owner/invitations/resend`, `POST /api/v1/owner/invitations/revoke`.

---

### Module 5: Share Management (`owner/share-management/`)
* **Purpose**: Cryptographic key share governance using Shamir's Secret Sharing representation. Enables owners to inspect shard distribution, check submitted shares during release protocols, and verify quorum threshold health.
* **Reference Assets**:
  - Dark Mode: `owner/assets/Dark/Management.png`
  - Light Mode: `owner/assets/Light/share management.png`
* **UI Components**:
  - Hero banner with `05. SHARE MANAGEMENT` eyebrow.
  - Stat metrics: Generated Keys, Distributed Shares, Verified Shares, Quorum Health Index, Pending Shards.
  - Vault Selector Dropdown: Inspects key split configurations on a per-vault basis (e.g. "Personal Vault — 3 of 3 threshold").
  - Visual Quorum Progress Meter with cryptographic lock badges.
  - Shard Distribution Grid/Table showing Trustee Name, Shard Index (`Fragment #1`, `#2`, etc.), Cryptographic Checksum hash (`SHA-256` preview), Last Verified Date, and Shard Status (`Distributed`, `Submitted`, `Missing`).
  - Action button: `Test Quorum Simulation` to verify threshold mathematical reconstructibility without revealing keys.
* **Future Backend Integration Point**: `GET /api/v1/owner/shares/summary`, `POST /api/v1/owner/shares/simulate-quorum`.

---

### Module 6: Release Management (`owner/release-management/`)
* **Purpose**: Configuration and real-time execution of vault release protocols. Covers heartbeat timers, inactivity detection, multi-party consensus verification, and emergency abort overrides.
* **Reference Assets**:
  - Dark Mode: `owner/assets/Dark/Release Management.png`
  - Light Mode: `owner/assets/Light/Release Management.png`
* **UI Components**:
  - Hero banner with `06. RELEASE MANAGEMENT` eyebrow.
  - Stat cards: Active Protocols, Grace Periods Running, Completed Releases, Scheduled Releases.
  - Release Protocol Master Switch: Shows Dead-Man's-Switch status (Heartbeat interval: e.g. 60 days, Next check-in required by 15 Oct 2025).
  - Button: `I am Here (Check-in Now)` which resets the inactivity countdown and triggers celebratory toast confirmation.
  - Release Execution Table: Vault Name, Trigger Condition, Quorum Progress (`2 of 3 Trustees Confirmed`), Grace Period Timer (`14 days remaining`), Status (`Pending Consensus`, `Grace Period Active`, `Released`), and `Emergency Abort` button.
* **Future Backend Integration Point**: `GET /api/v1/owner/release/status`, `POST /api/v1/owner/heartbeat/ping`, `POST /api/v1/owner/release/abort`.

---

### Module 7: Notifications (`owner/notifications/`)
* **Purpose**: Centralized alert feed for security warnings, trustee verification milestones, heartbeat reminders, share submissions, and system updates.
* **Reference Assets**:
  - Dark Mode: `owner/assets/Dark/Notification.png`
  - Light Mode: `owner/assets/Light/Notification.png`
* **UI Components**:
  - Hero banner with `07. NOTIFICATIONS` eyebrow.
  - Filter Tabs: `All Alerts`, `Unread`, `Action Required`, `Vaults`, `Trustees`, `Security`.
  - Header actions: `Mark All Read`, `Clear Filtered`, `Notification Preferences`.
  - Chronological grouped list (Today, Yesterday, Last 7 Days) with priority badges (High, Normal, Low), actionable buttons (`Review Share`, `Approve Release`, `View Profile`), and unread indicator dot.
  - Live search input to filter alerts by keywords.
* **Future Backend Integration Point**: `GET /api/v1/owner/notifications`, `PATCH /api/v1/owner/notifications/:id/read`, `POST /api/v1/owner/notifications/mark-all-read`.

---

### Module 8: Activity & History (`owner/activity-history/`)
* **Purpose**: Immutable security audit trail of every interaction inside the owner's account (logins, vault edits, share generations, trustee approvals, and IP addresses).
* **Reference Assets**:
  - Dark Mode: `owner/assets/Dark/Activity.png`
  - Light Mode: `owner/assets/Light/Activity.png`
* **UI Components**:
  - Hero banner with `08. ACTIVITY & HISTORY` eyebrow.
  - KPI Stat Bar: Total Events, Security Events, Vault Modifications, Active Sessions.
  - Search & Multi-Filter Bar: Filter by Category, Actor, Vault, Date Range picker (`From` / `To`), Status (`Success`, `Warning`, `Failed`).
  - Action button: `Export Audit Log (CSV / JSON)`.
  - Audit Trail Table: Timestamp, Event Type icon & badge, Actor (Owner / Trustee), Target Vault, IP Address, Device / OS, Status (`Success` green check).
  - Modal: `Event Deep-Dive` displaying full JSON payload representation.
* **Future Backend Integration Point**: `GET /api/v1/owner/activity/logs`, `GET /api/v1/owner/activity/export`.

---

### Module 9: Profile & Security (`owner/profile-security/`)
* **Purpose**: Security posture configuration, account credential settings, FIDO2/WebAuthn hardware key management, master password rotation, and active session monitoring.
* **Reference Assets**:
  - Dark Mode: `owner/assets/Dark/Profile.png`
  - Light Mode: `owner/assets/Light/Profile.png`
* **UI Components**:
  - Hero banner with `09. PROFILE & SECURITY` eyebrow.
  - Profile Overview Card: Avatar upload, Full Name, Email, Phone, Jurisdiction, Membership since date.
  - Security Health Meter: Circular or linear score (e.g. `98% Excellent Rating`).
  - Security Tabs: `Personal Information`, `Password & Master Key`, `Two-Factor Authentication (2FA)`, `Hardware Keys (FIDO2)`, `Active Sessions`.
  - Forms with accessible validation, password visibility toggles, and mock save buttons with toast confirmations.
* **Future Backend Integration Point**: `GET /api/v1/owner/profile`, `PUT /api/v1/owner/profile`, `POST /api/v1/owner/security/change-password`.

---

### Module 10: Help & Support (`owner/help-support/`)
* **Purpose**: Knowledge base, contextual FAQs, video tutorials, emergency support tickets, and system status health check.
* **Reference Assets**:
  - Dark Mode: `owner/assets/Dark/Help&Support.png`
  - Light Mode: `owner/assets/Light/Help&Support.png`
* **UI Components**:
  - Hero banner with `10. HELP & SUPPORT` eyebrow.
  - Help Search Bar: Instant live filtering across knowledge base articles and FAQs.
  - Topic Categories Grid: Getting Started, Vault Security, Trustee Onboarding, Shamir's Secret Sharing, Release Protocols, Troubleshooting.
  - Interactive Accordion FAQ list with expandable/collapsible questions and answers.
  - Contact Support Ticket Form: Subject, Category dropdown, Message body, Priority level, and Submit button.
  - System Operational Status Badge (`All Systems Operational — 99.99% Uptime`).
* **Future Backend Integration Point**: `GET /api/v1/owner/support/faqs`, `POST /api/v1/owner/support/ticket`.

---

## 4. Coding Conventions & Quality Gates

1. **Strict Relative Navigation**: All inter-module links must use relative URLs (`../dashboard/dashboard.html`, `../my-vaults/my-vaults.html`).
2. **Zero Hardcoded Flash**: Stylesheets must declare `:root` and `[data-theme="light"]` variables, with immediate theme application scripts in `<head>` to avoid FOUC (Flash of Unstyled Content).
3. **Responsive Breakpoints**:
   - Desktop: `> 1024px` (Full 260px sidebar, expanded grids).
   - Tablet: `768px – 1024px` (Collapsible sidebar, 2-column grids).
   - Mobile: `< 768px` (Off-canvas sidebar drawer with hamburger trigger, stacked cards, horizontally scrollable tables).
4. **Mock Data Separation**: All mock data structures must be placed at the top of each module script or clearly grouped and annotated:
   ```javascript
   // =========================================================================
   // MOCK DATA STORAGE (Simulating Backend API Responses)
   // TODO: Replace with fetch('/api/v1/...') upon backend connection
   // =========================================================================
   ```
5. **Accessibility**: All buttons have accessible text or `aria-label`; inputs have paired `<label>` tags; colors meet WCAG AA contrast standards.
