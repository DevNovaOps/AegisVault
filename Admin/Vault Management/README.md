# AegisVault — Admin Vault Management Module

## Project Overview
The **Vault Management Module** is the administrative surveillance and governance interface for the **AegisVault — Automated Time-Locked Digital Asset & Legacy Custody Protocol**.

It allows the System Administrator to monitor, audit, and manage vault lifecycles, trustee quorum thresholds, heartbeat schedules, and storage allocations strictly across zero-knowledge boundaries.

---

## Clean, Student-Friendly Architecture
Designed to be **simple, robust, easy to maintain, and easy to explain to faculty**:

```
Vault Management/
│
├── index.html                  # Semantic structure, navigation, KPI cards, table, and modals
│
├── css/
│   └── vault-management.css    # Complete stylesheet: themes (Light & Dark), responsive grid, badges
│
├── js/
│   ├── vault-management.js     # Module controller: search, multi-filters, table, pagination, modals, CSV export
│   └── mockData.js             # Realistic demo datasets for vaults, trustees, and type distribution
│
└── README.md                   # Technical documentation and faculty presentation guide
```

### Explanation for Faculty Presentation
When presenting this project to faculty, each file has a distinct and unambiguous purpose:

1. **`index.html`**:
   - Contains the semantic HTML5 structure for the top header, sidebar navigation, breadcrumbs, hero panorama card with quote, 4 KPI summary cards, search and filter bar, main 10-column table, pagination, side overview and donut chart widgets, and modals.
   - Reuses shared background images directly from `Admin/assets/` (`light-background.png`, `dark-background.png`, `sidebar-bg-light.png`, `sidebar-bg-dark.png`) without asset duplication.

2. **`css/vault-management.css`**:
   - Manages CSS custom properties (design tokens) for both Light and Dark themes matching the project screenshots.
   - Implements CSS Grid and Flexbox responsive layouts across mobile (320px), tablet (768px), and desktop (1440px+).
   - Encapsulates status badges, category tags, modal overlays, bulk selection toolbar, and micro-animations.

3. **`js/mockData.js`**:
   - Houses realistic mock datasets for 20+ vault records across `Personal`, `Financial`, `Business`, and `Legal` categories.
   - Provides summary metrics for KPIs and exact slice percentages for the SVG donut chart.
   - Kept separate so it can easily be swapped for real Django REST Framework API endpoints.

4. **`js/vault-management.js`**:
   - Implements pure client-side JavaScript logic:
     - Real-time search across vault ID, name, owner, and email.
     - Multi-filter combinations (Status: `All`, `Active`, `Archived`, `Pending`; Type: `All`, `Personal`, `Financial`, `Business`, `Legal`; Owner selection).
     - Pure SVG Donut Chart engine with interactive hover tooltips and dynamic percentage readouts.
     - 10-row pagination engine with page numbers and ellipsis.
     - Row checkboxes, Select All, and bulk action triggers (Bulk Archive, Bulk Export).
     - Metadata inspection modal and safe vault provisioning form.
     - Functional CSV export generator downloading `aegisvault_vaults_metadata.csv`.
     - Dual theme toggle (`Light` / `Dark`) with state synchronized in `localStorage`.

---

## Zero-Knowledge Security Principle
> 🔒 **Faculty Note:** Under the AegisVault zero-knowledge protocol, administrators have platform administrative oversight over vaults (lifecycle status, shard threshold status, heartbeat health, and storage metadata) but **never hold the cryptographic keys or access to decrypted payload secrets**.
