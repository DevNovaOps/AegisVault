# AEGISVAULT — Custody Analytics & Growth Telemetry Module

> **Academic Project Submission**  
> **Course:** Web Applications & Distributed Systems (BWP)  
> **System:** AEGISVAULT — Automated Time-Locked Digital Asset & Legacy Custody Protocol  
> **Component:** Administrative Analytics & Infrastructure Telemetry Engine

---

## 1. Overview & Project Purpose

The **AegisVault Analytics Module** provides comprehensive real-time visual telemetry, usage analytics, and cryptographic custody intelligence for the AegisVault administrative team.

AegisVault is designed to manage high-value digital legacy assets (cryptographic keys, digital wills, sensitive documentation, and asset portfolios) under multi-signature trustee governance and dead-man switches. The Analytics module enables administrators to monitor:
1. **User Growth & Retention:** Real-time trajectory of new registrations, active users, and monthly cohorts.
2. **Vault Distribution & Custody Health:** Breakdown of personal, family, and enterprise vaults across active and archived states.
3. **Role Distribution:** Donut visualization of account owners, designated trustees, pending verifications, and suspended accounts.
4. **Geographic Distribution:** Regional telemetry of vault node activity across India with visual status pins.
5. **Security Events Telemetry:** Failed logins, security incidents, and tamper-proof audit actions.
6. **Infrastructure Telemetry:** Multi-series trends for CPU load, memory utilization, encrypted storage consumption, and network I/O throughput.

---

## 2. Strict 5-File College Project Architecture

In strict adherence to the AegisVault codebase standards, this module is organized into five decoupled, clean files:

```
AegisVault/Admin/Analytics/
├── index.html          # Semantic HTML5 layout, accessible ARIA shell, SVG containers, modals
├── css/
│   └── analytics.css   # Pixel-accurate light/dark theme design system matching reference screenshots
├── js/
│   ├── analytics.js    # Pure SVG chart visualization engine, interactive filters, modal & export logic
│   └── mockData.js     # Structured mock telemetry datasets (KPIs, time-series, segments, regional stats)
└── README.md           # Technical documentation, architectural design notes, and viva talking points
```

---

## 3. Key Technical Highlights

### A. Pure SVG Data Visualization Engine (Zero External Dependencies)
Rather than relying on heavyweight external chart libraries like Chart.js or D3, the Analytics module uses an in-house **Pure SVG Vector Engine** written in vanilla JavaScript:
- **Cubic Bezier Splines:** Calculates smooth mathematical cubic control points `(x0, y0) C (cp1x, cp1y) (cp2x, cp2y) (x1, y1)` for continuous line graphs.
- **Dynamic Gradient Fills:** Dynamically generates SVG `<linearGradient>` elements with theme-aware opacity stops to render area charts.
- **Stroke-Dasharray Circular Arcs:** Implements the Donut chart using SVG circle perimeter offsets (`2 * π * r`) with seamless rotation offsets.
- **Grouped Clustered Bars:** Mathematically partitions coordinate spaces to render multi-category bar charts with animated hover reactions and floating tooltips.

### B. Cohesive Design System & Theme Engine
- **Pixel-Accurate Palette:** Aligns with the provided Light Theme (`#F4F6FA` page, `#FFFFFF` cards, `#2563EB` blues, `#E86326` brand orange) and Dark Theme (`#020B11` page, `#06151E` cards, `#38BDF8` cyber blue, `#F5A84B` amber).
- **Synchronized Theme Switching:** Reads and persists theme state to `localStorage.getItem('aegisvault_theme')`, instantly updating all sibling admin modules (Dashboard, User Management, Audit Logs, System Health).
- **Shared Brand Assets:** Leverages existing high-resolution background cutouts (`light-background.png`, `dark-background.png`, `sidebar-bg-light.png`, `sidebar-bg-dark.png`).

### C. Interactive Capabilities
- **Time Horizon Filtering:** Switch between `30 Days`, `7 Days`, and `90 Days` views across User Growth, Vault Statistics, and Infrastructure Usage charts with smooth transitions.
- **Date Range Picker Modal:** Interactive dialog with presets (`Last 7 Days`, `Last 30 Days`, `Last Quarter`, `Custom`) and start/end calendar controls.
- **Live Client-Side Data Exporter:** Generates and downloads real `.csv` or `.json` telemetry dumps with a single click.
- **Global Keyboard Shortcut (`/`):** Pressing `/` anywhere on the page focuses the global header search input with instant autocomplete suggestions.

---

## 4. Verification & Testing

### Running Locally
1. Launch any standard HTTP development server from the repository root:
   ```bash
   # Using Python
   python -m http.server 8088

   # Or using Node.js / http-server
   npx http-server -p 8088
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:8088/Admin/Analytics/index.html
   ```

### Evaluation Checklist
- [x] **Header & Brand Alignment:** Identical logo, search bar with `/` badge, sliding theme toggle, notification badge, and profile menu.
- [x] **Sidebar Navigation:** 12 navigation items matching the system; `Analytics` (item 9) is active with orange highlight; bottom landscape card displays *"Stronger Security. Brighter Tomorrows."*
- [x] **Breadcrumb Outside Hero Card:** `Admin / Analytics` sits directly above the hero card.
- [x] **Hero Panorama Card:** Displays *"Analytics"* title, inspirational quote *“Data today, a safer tomorrow.”*, and date range control.
- [x] **Row 1 Overview KPIs:** 5 responsive summary cards (Total Users, Active Users, Total Vaults, Total Trustees, Security Events).
- [x] **Row 2 Main Charts:**
  - Smooth Bezier User Growth area chart with floating marker badge (`1,248 / 12 Sep 2025`) and footer stats.
  - Clustered Vault Statistics bar chart (Personal, Family, Business) with footer breakdown.
  - User Distribution Donut chart with centered user count and interactive legend.
  - Geographic India distribution map with pulsing regional node pins and breakdown table.
- [x] **Row 3 Operations:** Security overview mini cards, 4-series system usage trends, and recent platform activity table.
- [x] **Interactivity:** Modals, tooltips, theme toggling, search dropdown, and CSV/JSON export.

---

## 5. College Viva / Presentation Talking Points

1. **Why Pure SVG instead of Chart.js or Recharts?**  
   *Answer:* Demonstrates deep mastery of browser graphics, vector math, and DOM manipulation without adding external bloat, ensuring maximum security and zero third-party telemetry leakage in a high-security custody protocol.
2. **How is theme state persisted?**  
   *Answer:* The `localStorage` key `aegisvault_theme` synchronizes the theme across all sub-pages (`/Dashboard`, `/User Management`, `/Audit Logs`, `/System Health`, `/Analytics`).
3. **What is the significance of the Dead-Man's Switch and Vault Metrics?**  
   *Answer:* AegisVault automates digital legacy custody. Monitoring active vs. archived vaults allows administrators to ensure time-locked cryptographic shards are preserved and ready for trustee quorum triggers.

---

*Authored for the AegisVault Engineering Team.*
