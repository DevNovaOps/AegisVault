# AegisVault Admin Common Library

Centralized common styles and client-side scripts specifically for the `Admin` portal modules.

## Directory Structure

```
Admin/common/
├── css/
│   ├── admin-common.css    # Complete common Admin stylesheet (tokens, layout, header, sidebar, modals, toasts, tables, responsive)
│   └── common.css          # Entry point importing admin-common.css
├── js/
│   ├── admin-common.js     # Complete common Admin JavaScript controller (theme, modals, toasts, dropdowns, drawer, clock, shortcuts)
│   └── common.js           # Alias entry point exposing AegisAdminCommon
└── README.md               # Documentation and integration guide
```

## Features Provided

### 1. Common CSS (`css/admin-common.css`)
- **Typography & Font Tokens**: Google Fonts (`Plus Jakarta Sans`, `Playfair Display`, `JetBrains Mono`).
- **Dual Theme Tokens**: Light & Dark mode tokens (`:root` and `body.dark-theme` / `[data-theme="dark"]`).
- **Reset & Base**: Custom scrollbars, universal box-sizing, smooth scrolling, button/input resets.
- **Application Shell**: `.app-layout`, `.app-body-container`, `.main-workspace`.
- **Admin Header**: Brand identity, search input, theme toggle pill, notifications bell & badge, admin profile badge & dropdown.
- **Admin Sidebar**: Navigation links, active state indicator, decorative mountain landscape footer card, mobile drawer slide-out.
- **Hero Overview Card**: Responsive hero card banner with dynamic live date and time widget.
- **Buttons & Badges**: Standard `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-danger`, `.badge-active`, `.badge-pending`, `.badge-suspended`, and `.severity-pill`.
- **Data Tables**: `.admin-data-table` and `.table-responsive-wrapper`.
- **Modals & Dialogs**: `.modal-overlay`, `.modal-dialog`, `.modal-header`, `.modal-body`, `.modal-footer`.
- **Toasts**: Floating alert notifications (`.toast-container`, `.toast-item`, `.toast-success`, `.toast-warning`, `.toast-error`, `.toast-info`).
- **Footer**: Standard bottom bar `.app-footer`.
- **Responsive Breakpoints**: Clean mobile drawer, collapsing headers, and flexible tables for desktop, tablet, and mobile viewport sizes.

### 2. Common JavaScript (`js/admin-common.js`)
- **Theme Controller**: Light/Dark theme switching, persistence in `localStorage`, and `aegis:themechange` event dispatching.
- **Toast Alerts**: `AegisAdminCommon.showToast(message, type, duration)` (also available on `window.AegisInteractions.showToast`).
- **Modal Manager**: `AegisAdminCommon.openModal(id)` and `AegisAdminCommon.closeModal(id)` with backdrop click and `[data-close-modal]` support.
- **Header Dropdowns**: Accessible toggle and click-outside dismissal for notifications and user profile menus.
- **Mobile Drawer**: Hamburger menu toggle and sidebar backdrop overlay.
- **Live Clock**: Dynamic real-time date and time updating every 30 seconds.
- **Keyboard Shortcuts**:
  - `Escape`: Closes active modal or dropdown.
  - `/` or `Ctrl+K`: Focuses global search input.
  - `t` or `T`: Toggles theme.
- **Route Synchronization**: Automatically marks current page link as `.active` in sidebar.
- **Utilities**: `copyToClipboard()`, `escapeHtml()`, `debounce()`.

## Usage in Admin Module Pages

In the `<head>` of any Admin HTML page:
```html
<!-- Admin Common Stylesheet -->
<link rel="stylesheet" href="../common/css/admin-common.css">

<!-- Module Specific Stylesheet -->
<link rel="stylesheet" href="css/your-module.css">
```

Before the closing `</body>` tag of any Admin HTML page:
```html
<!-- Admin Common Controller -->
<script src="../common/js/admin-common.js"></script>

<!-- Module Specific Scripts -->
<script src="js/mockData.js"></script>
<script src="js/your-module.js"></script>
```
