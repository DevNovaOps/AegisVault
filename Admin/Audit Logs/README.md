# AegisVault — Audit Logs Module

## Project Overview
The **Audit Logs Module** is an administrative monitoring interface for **AegisVault — Automated Time-Locked Digital Asset & Legacy Custody Protocol**.

It provides a tamper-evident audit trail of all custody actions, access events, authentication attempts, trustee additions, and administrative policy updates without revealing zero-knowledge encrypted vault payloads.

---

## Clean, Student-Friendly Architecture
Designed to be **simple, robust, easy to maintain, and easy to explain to faculty**:

```
Audit Logs/
│
├── index.html           # Semantic page markup, layouts, tables, and modal components
│
├── css/
│   └── audit-logs.css   # Complete stylesheet: themes (Light & Dark), responsive grid, animations
│
├── js/
│   ├── audit-logs.js    # All module functionality: filtering, search, sorting, pagination, theme, CSV export
│   └── mockData.js      # Realistic demo audit records and KPI statistics
│
└── README.md            # Technical documentation and presentation guide
```

### Explanation for Faculty Presentation
When presenting this project to faculty, each file has a distinct and unambiguous purpose:

1. **`index.html`**:
   - Contains semantic HTML5 structure for the header, sidebar, hero banner, 5 KPI cards, filter toolbar, main audit table, and right-hand Log Details inspector panel.
   - Reuses shared alpine landscape assets (`light-background.png`, `dark-background.png`, `sidebar-bg-light.png`, `sidebar-bg-dark.png`) from `Admin/assets/` without file duplication.

2. **`css/audit-logs.css`**:
   - Manages CSS custom properties (design tokens) for both Light and Dark themes.
   - Includes CSS Grid and Flexbox responsive layouts across desktop, tablet, and mobile screens.
   - Encapsulates color-coded action badges (`LOGIN`, `USER_UPDATE`, `VAULT_ACCESS`, `TRUSTEE_ADDED`, etc.) and micro-animations.

3. **`js/mockData.js`**:
   - Contains demo audit log records representing real-world custody events with user info, IP addresses, locations, session IDs, and raw JSON payloads.

4. **`js/audit-logs.js`**:
   - Implements all client-side functionality in Vanilla JavaScript:
     - Multi-field filtering (Action, User, Module) and live keyword search.
     - Timestamp sorting (ascending/descending) and page-by-page pagination.
     - Interactive table row selection updating the right-hand Log Details panel and Raw Data JSON viewer.
     - Dynamic CSV export file creation and direct download.
     - Dual theme toggle (`Light` / `Dark`) with state saved in `localStorage`.
     - Header dropdowns, mobile navigation drawer, and toast alerts.

---

## Core Features & Workflow

- **KPI Metric Overview**:
  - Total Logs: `12,482`
  - User Actions: `6,214`
  - Vault Actions: `3,156`
  - Security Events: `1,892`
  - Admin Actions: `1,220`
- **Dynamic Search & Multi-Field Filters**:
  - Filter by Action (`LOGIN`, `USER_UPDATE`, `VAULT_ACCESS`, etc.)
  - Filter by User (`Aarav Sharma`, `Dr. Vikram Malhotra`, etc.)
  - Filter by Module (`Auth`, `User Mgmt`, `Vaults`, etc.)
  - Live query search across all fields simultaneously.
- **Log Details Inspector**:
  - Detailed metadata with one-click copyable Session ID.
  - Raw JSON viewer showing the machine-readable cryptographic event payload.
  - Sequential related log records.
- **CSV Export**:
  - Generates downloadable CSV files on the fly for compliance audits.
- **Theme Persistence**:
  - Dual theme preference persists across Dashboard, User Management, and Audit Logs via `aegisvault_theme`.
