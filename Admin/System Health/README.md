# AegisVault — System Health Module

## Project Overview
The **System Health Module** is an infrastructure monitoring and microservice telemetry interface for **AegisVault — Automated Time-Locked Digital Asset & Legacy Custody Protocol**.

It provides real-time system visibility, service availability tracking, CPU/Memory/Disk/Network area sparklines, recent security event triage, and system cluster specifications to ensure mission-critical vault uptime.

---

## Clean, Student-Friendly Architecture
Designed specifically to be **simple, robust, easy to navigate, and easy to explain to faculty**:

```
System Health/
│
├── index.html           # Semantic page structure: header, sidebar, hero, KPI cards, tables & modals
│
├── css/
│   └── system-health.css # Complete stylesheet: dual themes (Light/Dark), responsive grid, SVG charts
│
├── js/
│   ├── system-health.js # All module logic: theme toggle, SVG area sparklines, modals, search, live ticker
│   └── mockData.js      # Mock datasets: 9 microservices, 4 resource timelines, events, and specs
│
└── README.md            # Academic documentation and presentation guide
```

### Explanation for Faculty Presentation
When explaining this module during your viva or project presentation, highlight each file's clear responsibility:

1. **`index.html`**:
   - Implements semantic HTML5 layout with high-accessibility ARIA landmarks (`header`, `aside`, `main`, `footer`, `role="dialog"`).
   - Structured into 3 logical rows:
     - **Row 1**: 5 key overview KPI metric cards (Uptime, Active Users, Storage Used progress bar, CPU Usage, Memory Usage).
     - **Row 2**: Dual columns (60% Service Status table / 40% Resource Usage area sparkline charts).
     - **Row 3**: Dual columns (60% Recent System Events table / 40% System Information 2-column spec grid).
   - Reuses shared background assets (`light-background.png`, `dark-background.png`, `sidebar-bg-light.png`, `sidebar-bg-dark.png`) from `Admin/assets/` without file duplication.

2. **`css/system-health.css`**:
   - Uses CSS Custom Properties (`:root` and `body.dark-theme`) for smooth, instant dual-theme transitions.
   - Accurately recreates typography (`Plus Jakarta Sans`, `Playfair Display`, `JetBrains Mono`).
   - Employs responsive CSS Grid and Flexbox layouts that adapt seamlessly from 1920px wide desktop monitors to mobile phones.
   - Styles SVG area sparklines with translucent vertical gradients and custom tooltips.

3. **`js/mockData.js`**:
   - Contains realistic datasets reflecting an enterprise custody platform:
     - 9 Core Services with status, uptime SLA, latency, and operational telemetry.
     - Multi-timeframe resource datasets (`24h`, `1h`, `7d`) for CPU, Memory, Disk, and Network I/O.
     - 5 Recent System Events categorized by severity (`INFO`, `WARN`, `ERROR`).
     - 14 System Information technical specifications.
     - Search index linking services and events directly to interactive modals.

4. **`js/system-health.js`**:
   - Implements pure, dependency-free Vanilla JavaScript:
     - **Interactive SVG Sparklines**: Dynamically calculates cubic bezier curve points, gradient fills, and interactive data hover tooltips.
     - **Timeframe Filtering**: Updates charts dynamically when switching between "Last 24 Hours", "Last 1 Hour", and "Last 7 Days".
     - **Theme Persistence**: Coordinates theme state across sessions using `localStorage` (`aegisvault_theme`).
     - **Modal Telemetry Tracing**: Opens full inspection modals when clicking on services, events, or server details.
     - **Simulated Health Refresh**: Demonstrates automated heartbeat sweeps and updates last-checked timestamps.
     - **Live Clock & Global Search**: Provides search dropdown navigation and hotkeys (`/` for search, `T` for theme, `Esc` to close modals).

---

## Core Features & Workflow

- **Key Health Metrics (5 KPI Cards)**:
  - System Uptime: `99.8%` (30-day SLA trend: `↑ 0.2%`)
  - Active Users: `1,248` (`86` currently online)
  - Storage Used: `245 GB` / `500 GB` (49% progress bar)
  - CPU Utilization: `32%` (8 vCPU cluster)
  - Memory Usage: `64%` (10.2 GB / 16 GB dedicated RAM)
- **Microservice Availability (9 Services)**:
  - Web Application, API Service, Database Primary, Database Replica, Authentication Service, Email/SMS Service, Backup Service, File Storage, and Monitoring Agent.
- **Resource Usage 2x2 Sparkline Grid**:
  - Real-time cubic spline area charts for CPU, Memory, Disk, and Network I/O with interactive hover tooltips.
- **Recent System Events**:
  - Live log feed with colored badges (`INFO`, `WARN`, `ERROR`) and modal inspection.
- **System Specifications**:
  - Hardware, environment, database clustering, and cryptographic engine details.
- **Dual Theme Support**:
  - Seamless Light and Dark modes matching the provided project screenshots.
