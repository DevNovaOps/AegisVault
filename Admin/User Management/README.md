# AegisVault — User Management Module

> **Enterprise Administrative User & Trustee Management Console** for the *AegisVault Automated Time-Locked Digital Asset & Legacy Custody Protocol*.

---

## 1. Overview

The **User Management** module allows system administrators to monitor, manage, and inspect all platform vault owners and designated trustees with zero-knowledge cryptographic safeguards.

### Visual Fidelity & Design System
- Pixel-accurate match to the AegisVault enterprise design language.
- Reuses shared background images from `Admin/assets/` without duplicate asset files:
  - `../../assets/light-background.png`
  - `../../assets/dark-background.png`
  - `../../assets/sidebar-bg-light.png`
  - `../../assets/sidebar-bg-dark.png`
- Smooth dual theme toggling (Light `#F4F6FA` ↔ Dark `#020B11`) via interactive pill switch matching the exact design specification.
- Mountain panorama cutout in hero section featuring the quote: *“People build legacies. We help protect them.”*
- Sidebar alpine forest landscape card featuring the quote: *“Stronger Security. Brighter Tomorrows.”*

---

## 2. Directory Structure

```
Admin/
├── assets/                          # Common Shared Image Assets
│   ├── light-background.png
│   ├── dark-background.png
│   ├── sidebar-bg-light.png
│   └── sidebar-bg-dark.png
│
├── Dashboard/                       # Admin Command Center Module
│
└── User Management/                 # User Management Module
    ├── index.html                   # Core semantic interface
    ├── README.md                    # Technical documentation
    ├── css/
    │   ├── user-management.css      # Core styles & theme design tokens
    │   ├── responsive.css           # Breakpoints (320px – 1920px)
    │   └── animations.css           # Micro-interactions & animations
    └── js/
        ├── mockData.js              # Mock users dataset matching screenshots
        ├── user-management.js       # Table controller, filters, & inspector binding
        └── interactions.js          # Theme toggle, modals, & toast alerts
```

---

## 3. Features

1. **KPI Summary Cards**:
   - Total Users: `1,248` (`↑ 12%`, `+134 this month`)
   - Active Users: `982` (`↑ 6%`, `78.7% of total`)
   - Suspended Users: `173` (`↑ 28%`, `13.9% of total`)
   - Pending Verifications: `93` (`↓ 15%`, `7.5% of total`)
2. **Interactive User Table**:
   - Checkbox multi-select
   - User avatar pill, name, email, role badge (`Owner` blue / `Trustee` purple)
   - Status badge (`Active` emerald / `Pending` amber / `Suspended` red)
   - Vaults count, Trustees count, Joined On date, and Actions menu
3. **Synchronized User Details Inspector**:
   - Clicking any row instantly populates the inspector panel on the right with the user's detailed metadata
   - 4 Tabs: `Overview`, `Activity`, `Security`, `Vaults`
   - Action buttons: `Edit User`, `Reset Password`, `Suspend User`, `Delete User`
4. **Search & Dynamic Filters**:
   - Real-time search against name, email, user ID, or role
   - Role filter dropdown
   - Status filter dropdown
   - Join Date filter dropdown
   - Reset & Filter buttons
5. **Modals & Toast Notifications**:
   - Add New User modal with form validation
   - Edit User modal
   - Simulated actions (Reset Password, Suspend, Delete) with feedback toasts
