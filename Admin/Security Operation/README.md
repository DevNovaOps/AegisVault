# AegisVault — Admin / Security Operations Module

> **Automated Time-Locked Digital Asset & Legacy Custody Protocol**  
> *"What matters, lives on."*

---

## 📌 Overview

The **AegisVault Admin / Security Operations Module** is an enterprise-grade security operations dashboard engineered in compliance with the AegisVault zero-knowledge protocol architecture. It provides system administrators with real-time telemetry, threat monitoring, cryptographic audit logging, and service health surveillance—while strictly enforcing zero-access isolation from user vault contents.

This frontend is implemented using **pure semantic HTML5, modular CSS3, and Vanilla JavaScript** without any external UI frameworks or bundlers.

---

## 🎨 Dual Theme System & Dynamic Background Switching

The application implements a working light/dark theme system:

- **Dark Theme** (`data-theme="dark"` / `body.dark-theme`):
  - Deep navy and black background (`#020B11`, `#041018`, `#06151E`)
  - Crisp typography with glowing amber accents (`#F5A84B`)
  - Emerald operational indicators (`#00D9A5`) and coral alert badges (`#FF5757`)
  - High-resolution twilight mountain sunset background (`assets/dark-background.png`)
  - Dark mountain cliffside visual in lower sidebar (`assets/sidebar-dark.png`)

- **Light Theme** (`data-theme="light"` / `body.light-theme`):
  - Clean enterprise aesthetic (`#F5F7FA`, `#FFFFFF`) with subtle blue-gray borders (`#E2E8F0`)
  - High-contrast deep navy typography (`#0F1D2F`) with vibrant AegisVault orange accents (`#E86326`)
  - Alpine snow peak mountain background (`assets/light-background.png`)
  - Snowy forest visual in lower sidebar (`assets/sidebar-light.png`)

Theme preferences persist automatically across sessions using `localStorage.getItem('aegis_theme')`.

---

## 📁 Folder Structure

```text
AegisVault Security Operations Module/
│
├── index.html                  # Semantic HTML5 structure for dashboard, navigation, and modals
│
├── css/
│   ├── style.css               # Design tokens, color system, layout, tables, cards, dropdowns
│   ├── responsive.css          # Responsive breakpoints (320px, 375px, 430px, 768px, 1024px, 1440px, 1920px)
│   └── animations.css          # Keyframes, micro-interactions, pulse glows, reduced-motion queries
│
├── js/
│   ├── mockData.js             # Central mock repository for statistics, events, services, users, and trustees
│   ├── securityOperations.js   # Dynamic table rendering, circular gauges, bar chart, and filters
│   ├── interactions.js         # Theme toggle, global search, modal engine, drawer, toasts, tooltips
│   └── app.js                  # Application initialization & lifecycle coordinator
│
├── assets/
│   ├── dark-background.png     # Dark theme mountain sunset landscape asset
│   ├── light-background.png    # Light theme alpine mountain landscape asset
│   ├── sidebar-dark.png        # Dark sidebar bottom card visual
│   ├── sidebar-light.png       # Light sidebar bottom card visual
│   └── icons/                  # SVG icon assets
│
└── README.md                   # Complete module documentation & execution guide
```

---

## ⚙️ Key Features

1. **Header & Global Live Search**:
   - Universal search across Users, Trustees, Audit Logs, and System Services with keyboard shortcuts (`/` or `Ctrl+K`).
   - Theme toggle with instant non-reload switching (`T`).
   - Security notifications bell with unread badge and dropdown.
   - Admin Panel avatar profile menu with simulated action toasts.

2. **Sidebar Navigation**:
   - 11 navigation links with active state styling for **Security Operations**.
   - Prominent **Admin Support** ticket escalation button.
   - Lower sidebar promo card displaying the protocol motto over theme-specific mountain visuals.
   - Mobile slide-out drawer with touch backdrop.

3. **Hero Section**:
   - Label: `14. ADMIN / SECURITY OPERATIONS`
   - Title: `Monitor. Protect. Enable.` with vibrant accent emphasis.
   - Feature highlight badges: *Immutable Records*, *Detects Suspicious Activity*, *Full Transparency*, *Built for a Safer Tomorrow*.
   - Quote card: *“Admins manage the system. Users own their data. — ZERO ACCESS, BY DESIGN.”*
   - Dynamic landscape background switching automatically with selected theme.

4. **Security Statistics Cards**:
   - Total Users (`1,284`), Total Trustees (`5,732`), Security Events (`47`), Failed Logins (`19`), System Uptime (`99.8%`).

5. **Recent Security Events Table**:
   - Real-time search and event filtering (`FAILED_LOGIN`, `LOGIN`, `TRUSTEE_ADDED`, `STATE_CHANGED`, etc.).
   - Row click inspection modal revealing IP, user agent, geolocation, and SHA-256 audit hash.
   - "View All" paginated event modal with CSV export simulation.

6. **System Health Surveillance**:
   - 4 Circular progress SVG gauges: Server Uptime (`99.8%`), Database (`97%`), Encryption Service (`100%`), Notification Service (`99%`).
   - Operational service checklist with diagnostic probe modals.

7. **Failed Login Monitoring & Threat Analysis**:
   - 24h count callout (`19`, `↑ 56%`).
   - Interactive bar chart showing hourly activity distribution with hover tooltips.
   - Top IP threat addresses with one-click firewall blacklist simulation modal.

8. **User & Trustee Management**:
   - Filterable data tables for account holders and designated trustees.
   - User profile and trustee verification details modals.

9. **Admin Security Restriction Panel**:
   - Prominent red warning boundary reinforcing the cryptographic separation.
   - Principles: *Zero-Knowledge Architecture*, *User-Controlled Encryption Keys*, *Threshold Access Only*.
   - Detailed architectural modal explaining Shamir's Secret Sharing (SSS) and client-side key derivation.

10. **Admin Support Escalation**:
    - Interactive ticket submission modal with category, urgency level, description, and toast confirmation.

---

## 🚀 How to Run Locally

No compilation, Node.js packages, or build tools are required.

### Method 1: Direct File Opening
Double-click `index.html` inside `AegisVault Security Operations Module/` to open it in any modern browser (Chrome, Edge, Firefox, Safari).

### Method 2: Live Server (VS Code / Antigravity IDE)
1. Open the folder `d:\collegebwpproject\AegisVault Security Operations Module` in your editor.
2. Right-click `index.html` and select **"Open with Live Server"**.

### Method 3: Python HTTP Server
Run the following terminal command from the module folder:
```bash
cd "d:\collegebwpproject\AegisVault Security Operations Module"
python -m http.server 8080
```
Then visit `http://localhost:8080` in your web browser.
