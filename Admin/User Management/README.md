# AegisVault — User Management Module

## Project Overview
The **User Management Module** is an administrative console for the **AegisVault — Automated Time-Locked Digital Asset & Legacy Custody Protocol**.

It allows administrators to monitor, manage, inspect, and update user accounts and designated trustees with zero-knowledge cryptographic safeguards.

---

## Clean, Student-Friendly Architecture
Designed to be **simple, robust, easy to maintain, and easy to explain to faculty**:

```
User Management/
│
├── index.html              # Page structure, navigation, table, and modal dialogs
│
├── css/
│   └── user-management.css # Complete stylesheet: themes (Light & Dark), responsive layout, animations
│
├── js/
│   ├── user-management.js  # Complete module functionality: search, filters, pagination, modals, theme, export
│   └── mockData.js         # Realistic demo user records (ready to connect to Django/backend)
│
└── README.md               # Technical documentation and faculty presentation guide
```

### Explanation for Faculty Presentation
When presenting this project to faculty, each file has a distinct and unambiguous purpose:

1. **`index.html`**:
   - Contains the semantic HTML5 structure for the header, sidebar, hero card, 4 KPI metric cards, filter toolbar, main users table, inspector panel, and modal dialogs.
   - Reuses shared background images from `Admin/assets/` (`light-background.png`, `dark-background.png`, `sidebar-bg-light.png`, `sidebar-bg-dark.png`) without duplicating asset files.

2. **`css/user-management.css`**:
   - Manages CSS custom properties (design tokens) for both Light and Dark themes.
   - Includes CSS Grid and Flexbox responsive layouts across desktop, tablet, and mobile screens.
   - Encapsulates role and status badges, modals, toast alerts, and micro-animations in a single file.

3. **`js/mockData.js`**:
   - Contains demo user records with full custody profiles (names, emails, roles, vaults, trustees, security details).
   - Separated cleanly so it can easily be replaced by real API endpoints when connected to a Django backend.

4. **`js/user-management.js`**:
   - Implements all client-side logic in pure Vanilla JavaScript:
     - Real-time search and multi-field filtering (Role, Status, Date).
     - Table rendering, sorting, pagination, and bulk selection.
     - Row selection synchronizing the right-hand User Details inspector card.
     - Complete user action workflows: Add User, Edit User, Suspend/Reactivate, Reset Password, and Delete.
     - CSV export download for compliance records.
     - Dual theme toggle (`Light` / `Dark`) with state saved in `localStorage`.
     - Header dropdowns, mobile navigation drawer, and toast alerts.

---

## Key Features & Highlights

- **KPI Metric Overview**:
  - Total Users: `1,248`
  - Active Users: `982`
  - Suspended Users: `173`
  - Pending Verifications: `93`
- **Dynamic Search & Multi-Field Filters**:
  - Filter by Role (`Owner`, `Trustee`)
  - Filter by Status (`Active`, `Pending`, `Suspended`)
  - Filter by Join Date (`Sep 2025`, `Aug 2025`)
  - Real-time search by name, email, or user ID.
- **User Details Inspector**:
  - Displays user profile, role, status, joined date, and last login.
  - Interactive tabs: `Overview`, `Activity`, `Security`, and `Vaults`.
  - Action buttons: `Edit User`, `Reset Password`, `Suspend User`, `Delete User`.
- **Modals**:
  - Add New User modal with validation.
  - Edit User modal with real-time state synchronization.
- **CSV Export**:
  - Generates client-side CSV file download.
- **Theme Persistence**:
  - Shared `aegisvault_theme` in `localStorage` ensures consistent theme across Dashboard, User Management, and Audit Logs.
