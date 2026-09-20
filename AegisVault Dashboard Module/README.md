# AegisVault — Dashboard Module

A real, fully functional, and responsive frontend dashboard for **AegisVault**, strictly built with **HTML5, CSS3, and Vanilla JavaScript** with zero external frameworks or runtime dependencies.

The module accurately recreates the **Owner Dashboard** and **Trustee Dashboard** side-by-side layout from the design references with seamless **Light Theme** and **Dark Theme** support.

---

## 🛡️ Project Overview

* **Project Name**: AegisVault
* **Module Name**: Dashboard Module
* **Tagline**: *"What matters, lives on."*
* **Core Technologies**: HTML5, CSS3, Vanilla JavaScript (ES6+), SVG Icons

---

## ✨ Key Features & Capabilities

### 1. Dual Dashboard Side-by-Side Architecture
- **Owner Dashboard**:
  - **Vault Status Hero Card**: Status indicator (`ACTIVE`), mountain & forest sunset visual backdrop, quote `"More than memories. A safer tomorrow."`, and top quote `"Peace of mind in your hands."`.
  - **Next Heartbeat**: Live countdown timer (`Days`, `Hours`, `Minutes`, `Seconds`), interactive `I'M ALIVE →` button with celebratory pulse, countdown reset, timestamp updater, and activity feed logging.
  - **Owner Progress Panel**: Visual progress bars for `Trustees (4 / 5)` and `Threshold (3 / 5)`, with quick status rows for `Vault Items (18)` and `Account Security (Strong)`.
  - **Statistics Row**: 4 metric cards (`18 Vault Items`, `4 / 5 Trustees`, `23 Days Left`, `0 Pending Actions`).
  - **Vault Categories Donut Chart**: Responsive SVG-based donut chart displaying distribution across Documents (39%), Photos (28%), Financial (17%), Personal (11%), and Other (5%), with interactive center count (`18 Items`).
  - **Recent Activity**: Activity list with custom colored category badges and timestamps, linking to a comprehensive Activity Audit Modal.
  - **Security Banner**: Bottom assurance banner with `"Everything in place"` and quote `"Because what matters today, should matter tomorrow too."`.

- **Trustee Dashboard**:
  - **Header & Trusted People Badge**: Dedicated header with `"Trusted People — Build Stronger Tomorrows."` badge.
  - **Your Trustee Status**: Verified badge, `RP` avatar, Rakesh Patel profile, and `Total Assigned Vaults (2)` metric.
  - **Trustee Metric Cards**: 4 cards for `Assigned Vaults (2)`, `Share Submitted (1)`, `Pending Requests (0)`, and `Active Releases (0)`.
  - **My Assigned Vaults**: Interactive cards for `Personal Vault` (Verified / Submitted / 3 of 5) and `Family Vault` (Verified / Pending / 2 of 4) opening the Shamir Secret Sharing inspection modal.
  - **Pending Actions**: Clean empty state (`"No pending actions — You're all caught up!"`).
  - **Recent Updates Timeline**: Vertical timeline with connecting line, colored status nodes, and `"View All →"` modal.
  - **Trustee Bottom Banner**: Warm quote card `"A responsibility today. A safer tomorrow."`.

### 2. Light & Dark Enterprise Theming
- Instant theme toggle in the header without page refresh.
- Persistent state saved to `localStorage`.
- Comprehensive CSS custom property architecture for colors, borders, cards, and glassmorphism.

### 3. Global Interactive Capabilities
- **Live Search**: Debounced search across vault items, trustees, logs, and settings with keyboard shortcut `/` and quick-select navigation.
- **Notifications Panel**: Real-time notification center with unread badge and "Mark all as read".
- **User Profile Menu**: Custodian profile details and quick action links.
- **Modal System**: Accessible modals for Vault details, Activity audits, and Timeline logs, supporting backdrop dismiss and `Escape` key.
- **Toast Notifications**: Stackable feedback toasts for user actions.
- **Responsive Navigation Drawer**: On mobile devices, the sidebar collapses into a sliding drawer accessible via hamburger menu.

---

## 📁 Folder Structure

```text
AegisVault Dashboard Module/
│
├── index.html                  # Semantic HTML5 markup for dual dashboards & modals
│
├── css/
│   ├── style.css               # Core design tokens, light & dark themes, components
│   ├── responsive.css          # Responsive breakpoints (320px up to 1920px)
│   └── animations.css          # Keyframes, pulse glows, micro-interactions
│
├── js/
│   ├── app.js                  # Application initialization & navigation controller
│   ├── dashboard.js            # Countdown timer, heartbeat button, donut chart, modals
│   ├── interactions.js         # Theme toggle, search bar, dropdowns, toasts
│   └── mockData.js             # Central mock repository for metrics, activity, & vaults
│
├── assets/
│   └── background-image.png    # Mountain sunset & forest visual asset
│
└── README.md                   # Project documentation & execution guide
```

---

## 🚀 How to Run Locally

This project requires no build steps, bundlers, or package installations.

### Option 1: Live Server (VS Code / Antigravity IDE)
1. Open the workspace in your editor.
2. Right-click `index.html` inside `AegisVault Dashboard Module/` and select **"Open with Live Server"**.

### Option 2: Local Python HTTP Server
Run the following command from the project root:
```bash
cd "d:\collegebwpproject\AegisVault Dashboard Module"
python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

### Option 3: Direct Browser File
Double-click `index.html` to open it directly in any modern web browser.
