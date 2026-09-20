# AegisVault — Admin Dashboard Module

## Project Overview
The **Admin Dashboard Module** is the central command center for the **AegisVault — Automated Time-Locked Digital Asset & Legacy Custody Protocol**.

It provides the System Administrator with comprehensive surveillance over platform users, vault lifecycles, trustee activities, security threat events, and system health—engineered strictly within zero-knowledge architectural boundaries.

---

## Clean, Student-Friendly Architecture
Designed to be **simple, robust, easy to maintain, and easy to explain to faculty**:

```
Dashboard/
│
├── index.html           # Page structure, navigation, KPI cards, charts layout, tables, and modals
│
├── css/
│   └── dashboard.css    # Complete stylesheet: themes (Light & Dark), responsive grid, animations
│
├── js/
│   ├── dashboard.js     # Complete module controller: SVG charts engine, tables, search, modals, theme
│   └── mockData.js      # Realistic demo datasets for users, vaults, security events, and charts
│
└── README.md            # Technical documentation and faculty presentation guide
```

### Explanation for Faculty Presentation
When presenting this project to faculty, each file has a distinct and unambiguous purpose:

1. **`index.html`**:
   - Contains the semantic HTML5 structure for the header, sidebar, hero card, 6 KPI summary cards, interactive charts, recent users and security events tables, pending actions, and modal dialogs.
   - Reuses shared background images from `Admin/assets/` (`light-background.png`, `dark-background.png`, `sidebar-bg-light.png`, `sidebar-bg-dark.png`) without duplicating asset files.

2. **`css/dashboard.css`**:
   - Manages CSS custom properties (design tokens) for both Light and Dark themes.
   - Includes CSS Grid and Flexbox responsive layouts across desktop, tablet, and mobile screens (320px – 1920px).
   - Encapsulates status badges, cards, modals, toast alerts, and micro-animations in a single file.

3. **`js/mockData.js`**:
   - Contains realistic demo datasets for user growth, vault activity, role distributions, system health, recent events, and global search index.
   - Kept cleanly separate so it can easily be swapped out when connected to a Django backend API.

4. **`js/dashboard.js`**:
   - Implements all client-side logic in pure Vanilla JavaScript:
     - Pure SVG charts engine: User Growth line chart, Vault Activity grouped bar chart, User Role donut chart, and Vault Categories donut chart.
     - Interactive tooltips showing exact counts and percentages on hover.
     - Timeframe filtering ("Last 6 Months" vs "Last 30 Days").
     - Recent Users and Security Events table rendering.
     - System Health service indicators and Pending Actions list.
     - Global live search and notification dropdown.
     - Dual theme toggle (`Light` / `Dark`) with state saved in `localStorage`.
     - Live updating clock and toast notification alerts.

---

## Key Features & Highlights

- **6 KPI Overview Cards**:
  - Total Users: `1,248` (`↑ 12%`, `+134 this month`)
  - Total Trustees: `3,562` (`↑ 8%`, `+263 this month`)
  - Active Vaults: `982` (`↑ 6%`, `+54 this month`)
  - Pending Requests: `18` (`↓ 25%`, `-6 from last week`)
  - Security Events: `7` (`↑ 40%`, `+2 from last week`)
  - System Uptime: `99.98%` (`↑ 0.2%`, `Last 30 days`)
- **4 Interactive SVG Charts**:
  - User Growth: Smooth cubic bezier curve with gradient fill and data point tooltips.
  - Vault Activity: Grouped multi-color bars (Created, Accessed, Released).
  - User Role Distribution: Donut chart with breakdown (Vault Owners, Trustees, Admins, Others).
  - Vault Categories: Donut chart with breakdown (Personal, Financial, Professional, Health, Others).
- **Recent Platform Records**:
  - Recent Users table with quick inspection modal.
  - Recent Security Events table with severity indicators (`High`, `Medium`, `Low`).
  - Pending Actions list (User verifications, trustee requests, alert investigations).
- **System Health Monitor**:
  - Operational status for Database, Application Server, Background Workers, Email Service, Storage, and External APIs.
- **Theme Persistence**:
  - Shared `aegisvault_theme` in `localStorage` ensures consistent theme across Dashboard, User Management, and Audit Logs.
