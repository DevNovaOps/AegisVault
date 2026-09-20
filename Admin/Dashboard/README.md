# AegisVault — Admin Dashboard Module

> **Automated Time-Locked Digital Asset & Legacy Custody Protocol**  
> *"Control the System. Preserve the Trust. A safer tomorrow for everyone."*

---

## 📌 Overview

The **AegisVault Admin Dashboard Module** is the dedicated enterprise administration and operational surveillance command center for the AegisVault protocol. It provides administrators with complete visibility over platform growth, user and trustee ecosystems, vault lifecycles, and cryptographic threat intelligence—engineered strictly in compliance with zero-knowledge architectural boundaries.

The design faithfully replicates the provided Light and Dark Theme reference designs using **pure semantic HTML5, modular Vanilla CSS3, and Vanilla JavaScript** with zero external UI dependencies.

---

## 🎨 Dual Theme System & Mountain Background Switching

The interface features an automatic dual-theme architecture:

- **Light Theme** (`data-theme="light"` / `body.light-theme`):
  - Clean enterprise aesthetic (`#F4F6FA`, `#FFFFFF`) with blue-gray borders (`#E2E8F0`).
  - High-contrast deep navy typography (`#0B192C`) with vibrant AegisVault orange accents (`#E86326`).
  - High-resolution alpine snow mountain background in hero cutout and lower sidebar (`assets/light-background.png` & `assets/sidebar-bg-light.png`).
  - Sun icon in header.

- **Dark Theme** (`data-theme="dark"` / `body.dark-theme`):
  - Deep obsidian and navy background (`#020B11`, `#041018`, `#06151E`).
  - Crisp white typography with glowing amber accents (`#F5A84B`), emerald status indicators (`#00D9A5`), and coral threat badges (`#FF5757`).
  - High-resolution twilight sunset alpine landscape in hero cutout and lower sidebar (`assets/dark-background.png` & `assets/sidebar-bg-dark.png`).
  - Moon icon in header.

### Theme Switching Behavior
- Click the theme toggle icon in the top header or press the `T` shortcut key.
- Theme preferences persist automatically in `localStorage` under key `aegisvault_theme`.
- Background images and SVG charts update dynamically on theme switch without requiring a page reload.

---

## 📁 Folder Structure

```text
AegisVault Admin Dashboard Module/
│
├── index.html                      # Semantic HTML5 layout, header, sidebar, hero, cards, and modals
│
├── css/
│   ├── admin-dashboard.css         # Design tokens, color system, typography, cards, tables, and charts
│   ├── responsive.css              # Responsive rules for 320px, 375px, 430px, 768px, 1024px, 1440px, 1920px
│   └── animations.css              # Micro-interactions, status pulses, modal scales, and reduced motion queries
│
├── js/
│   ├── mockData.js                 # Complete dataset for metrics, growth, activity, users, events, and search
│   ├── charts.js                   # Interactive SVG charts: User Growth line, Vault Activity bars, and donuts
│   ├── interactions.js             # Theme switcher, live search, dropdowns, drawer, modals, and toasts
│   └── dashboard.js                # Core controller, table renderers, live clock, and button bindings
│
├── assets/
│   ├── light-background.png        # Daytime alpine snow mountain landscape asset
│   ├── dark-background.png         # Sunset alpine mountain landscape asset
│   ├── sidebar-bg-light.png        # Daytime pine forest visual for lower sidebar
│   ├── sidebar-bg-dark.png         # Sunset pine forest visual for lower sidebar
│   └── ...                         # Additional protocol image assets
│
└── README.md                       # Comprehensive documentation and execution guide
```

---

## ⚙️ Key Dashboard Sections & Features

1. **Header & Global Live Search**:
   - Universal search across Users, Trustees, Vaults, and System Services with `/` or `Ctrl+K` keyboard shortcut.
   - Theme toggle button with sun/moon icons.
   - Security notifications bell with unread badge (`3`) and dropdown.
   - Admin profile menu (`AP` avatar, `Admin`, `System Administrator`).

2. **Admin Sidebar Navigation**:
   - 10 navigation links with active state styling for **Dashboard**.
   - Lower decorative card displaying the protocol motto (*"A safer tomorrow, for everyone."*) over the actual mountain landscape artwork.
   - Responsive mobile slide-out drawer with touch backdrop.

3. **Dashboard Hero Section**:
   - Display serif title (*"Admin Dashboard"*).
   - Subtitle: *"Monitor. Manage. Secure. A safer tomorrow for everyone."*
   - Panoramic mountain cutout with gradient edge blending and quote: *“Stronger systems. Safer tomorrows.”*
   - Live date/time clock widget (*Friday, 12 Sep 2025, 10:24 AM*).
   - *"Generate Report"* button opening cryptographic export dialog.

4. **6 System Overview Metric Cards**:
   - **Total Users**: `1,248` (`↑ 12%`, `+134 this month`)
   - **Total Trustees**: `3,562` (`↑ 8%`, `+263 this month`)
   - **Active Vaults**: `982` (`↑ 6%`, `+54 this month`)
   - **Pending Requests**: `18` (`↓ 25%`, `-6 from last week`)
   - **Security Events**: `7` (`↑ 40%`, `+2 from last week`)
   - **System Uptime**: `99.98%` (`↑ 0.2%`, `Last 30 days`)

5. **Row 2 — Activity & Surveillance**:
   - **User Growth**: Pure SVG curved line chart with interactive hover coordinate points, gradient area fill, and timeframe selector (`Last 6 Months`, `Last 30 Days`, `This Year`).
   - **Vault Activity**: Grouped 3-bar SVG chart (Created in blue, Accessed in teal, Released in orange) with hover tooltips and timeframe selector.
   - **System Health**: Real-time status checklist for Database, Application Server, Background Workers, Email Service, Storage, and External APIs with glowing green indicators.

6. **Row 3 — Management & Security Events**:
   - **Recent Users Table**: Rohit Sharma, Meera Patel, Kunal Desai, Ananya Shah, Vivek Jain with colored initial avatars, roles, status pills, and clickable row modal inspection.
   - **Recent Security Events Table**: Failed login attempt (High), Unusual device login (Medium), Multiple OTP requests (High), Admin login (Low), Vault access attempt (High) with clickable row audit inspection.
   - **Pending Actions**: Action triage items with colored square icon boxes and item counts (*Verify new users: 6*, *Review trustee requests: 4*, *Investigate security alerts: 3*, *Approve vault release: 2*, *Review reported activity: 3*).

7. **Row 4 — Distributions & Operational State**:
   - **User Role Distribution**: SVG Donut chart displaying `1,248 Users` in center with legend: Vault Owners 62% (774), Trustees 30% (374), Admins 5% (62), Others 3% (38).
   - **Vault Categories**: SVG Donut chart displaying `982 Vaults` in center with legend: Personal 34% (334), Financial 28% (275), Professional 18% (177), Health 10% (98), Others 10% (98).
   - **Everything Under Control**: Status summary card featuring the AegisVault shield badge, platform health confirmation, and motto *“Because what matters today, should matter tomorrow too.”*

8. **Footer**:
   - AegisVault logo, central motto with orange accent bar, and Privacy | Terms | Help links.

9. **Modals & Overlays**:
   - User Profile details modal.
   - Security Event audit inspection modal.
   - System Health service diagnostics modal.
   - Cryptographic Audit Report generation modal.
   - All Users and All Security Events tables.

---

## 🔒 Security Boundary Notice

> **Architecture Principle:** Administrators manage system operations, node health, and authorized audit telemetry, but **cannot decrypt user vault contents**. All vault data is end-to-end encrypted using client-side user keys and Shamir's Secret Sharing (SSS) threshold distribution.

---

## 🚀 How to Run Locally

No build tools, bundlers, or Node.js runtime required.

### Method 1: Direct File Opening
Double-click `index.html` inside `AegisVault Admin Dashboard Module/` to open it in Chrome, Edge, Safari, or Firefox.

### Method 2: Live Server (VS Code / Antigravity IDE)
1. Open the project in your IDE.
2. Right-click `AegisVault Admin Dashboard Module/index.html` and select **"Open with Live Server"**.

### Method 3: Python HTTP Server
Run from terminal:
```bash
cd "d:\collegebwpfolder\AegisVault\AegisVault Admin Dashboard Module"
python -m http.server 8085
```
Then navigate to: `http://localhost:8085`
