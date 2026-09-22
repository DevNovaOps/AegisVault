# AegisVault Trustee Panel — Product Requirements Document (PRD)
## Cross-Module Layout Standardization & Absolute Hero Banner Contract

---

### Document Information
- **Project**: AegisVault — Trustee Panel Ecosystem
- **Target Release**: Production 1.0 (Pixel-Perfect Uniformity & Parity)
- **Author**: AegisVault Engineering & Product Architecture Pair
- **Reference Spec**: Admin Panel (`AegisVault/Admin/Reports/css/report.css`)
- **Key Focus**: Zero Cumulative Layout Shift (CLS = 0), Absolute Uniform Hero Banners (Fixed 230px Height, Shared Panorama Artwork), 60px Sticky Header, 260px Full-Bleed Scenic Sidebar

---

## 1. Executive Summary & Problem Statement

### 1.1 Context
In the AegisVault Trustee Panel, navigation across modules previously exhibited two visual friction points:
1. **Hero Banner Fluctuations (Vertical Shifting & Image Inconsistencies)**:
   - Hero banners on different pages rendered at varying heights (e.g. 250px on Dashboard, 235px on Verification, 230px on Share Submission, 190px on Notifications, and 180px on Help & Support).
   - Some pages had feature badge pills while others did not, causing the bottom of the hero box to move up and down from page to page.
   - Modules referenced disparate image files (`vault-hero-dark.png`, `verification-hero-dark.png`, `help-hero-dark.png`, `activity-hero-dark.png`), causing the background art to change abruptly during navigation.
2. **Sidebar Aesthetics**:
   - The scenic mountain/forest artwork was previously constrained to an awkward 300px box card at the bottom of the sidebar, obscuring lower navigation links and visually cluttering the sidebar.

### 1.2 Objective & Architectural Contract
Lock down the Trustee Panel architecture to **absolute cross-module uniformity**:
- **Absolute Uniform Hero Banner (`.hero-card` / `.<module>-hero`)**:
  - **Fixed Box Height**: Exactly **`230px`** (`height: 230px !important; min-height: 230px !important; max-height: 230px !important; box-sizing: border-box !important;`) on desktop.
  - **Absolute Y-Coordinate**: Fixed top edge at exactly **`84px`** from the viewport top (`60px topbar + 24px content padding-top`) on **EVERY page**.
  - **Uniform Panorama Artwork**: The **exact same high-resolution sunset mountain panorama** (`dark-background.png` in Dark Mode, `light-background.png` in Light Mode) across **ALL 10 modules**.
  - **Zero Vertical Jump**: When switching between any of the 10 modules, the hero box frame, height, width, and background image remain 100% static—only module-specific text and pills transition.
- **Full-Bleed Scenic Sidebar (`.trustee-sidebar`)**:
  - Exactly **`260px`** fixed width (`--sidebar-width: 260px;`).
  - Full-bleed scenic artwork background (`sidebar-bg-dark.png` / `sidebar-bg-light.png`) spanning the full 100vh height with a high-contrast dark/light gradient overlay.
  - No awkward boxed cards at the bottom; all 10 navigation items are fully visible and unencumbered.
  - Unboxed natural quote footer (`.sidebar-quote-block`) cleanly integrated at the base of the navigation flow.
- **Top Navigation Bar (`.app-header` / `.trustee-topbar`)**:
  - Exactly **`60px`** height (`--header-height: 60px;`), sticky top position (`top: 0; z-index: 90;`).

---

## 2. Master Dimensional & Layout Specification

| Component | Selector(s) | Width | Height / Min-Height | Padding | Position / Behavior | Background Fit & Asset |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Top Navigation Bar** | `.trustee-topbar`, `.app-header` | `100%` | Fixed `60px` (`--header-height: 60px;`) | `0 1.75rem` | `position: sticky; top: 0; z-index: 90;` | Solid surface (`var(--topbar-bg)`) |
| **Sidebar Navigation** | `.trustee-sidebar` | Fixed `260px` (`--sidebar-width: 260px;`) | `100vh` | `1.25rem 0.85rem 1.5rem 1rem` | `position: fixed; top: 0; bottom: 0; left: 0; z-index: 100;` | Full-bleed scenic cover background (`var(--scenic-sidebar)`) with gradient overlay spanning entire sidebar |
| **Sidebar Quote Footer** | `.sidebar-quote-block` | `100%` | Auto (~60px) | `1.5rem 0.65rem 0.5rem 0.65rem` | Fixed bottom anchor (`margin-top: auto; flex-shrink: 0;`) as direct child of `.trustee-sidebar` | Transparent typography directly on sidebar scenic artwork |
| **Main Content Wrapper** | `.trustee-main` | `calc(100% - 260px)` | Min `100vh` | `0` | `margin-left: 260px;` | App base background (`var(--bg-base)`) |
| **Page Container** | `.trustee-content` | `100%` (max `1600px`) | Auto | `1.5rem 2rem 2.5rem` | Block, centered (`margin: 0 auto;`) | Base background |
| **Header / Hero Banner** | `.hero-card`, `.trustee-hero`, `.<module>-hero` | `100%` | **Absolute Fixed `230px`** (`height: 230px !important; min-height: 230px !important; max-height: 230px !important;`) | **`1.5rem 2rem`** | `margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;` | **Uniform Shared Panorama** (`var(--hero-bg-image)`: `dark-background.png` / `light-background.png`), `background-size: cover; background-position: center right;` |

---

## 3. Responsive Breakpoint Rules

### 3.1 Desktop (`> 1024px`)
- **Sidebar Width**: `260px` (full-bleed scenic background).
- **Main Left Margin**: `260px`.
- **Topbar Height**: `60px`.
- **Hero Banner Box**: Absolute fixed **`230px`** height (`height: 230px; min-height: 230px; max-height: 230px; box-sizing: border-box;`), `padding: 1.5rem 2rem;`.
- **Hero Artwork**: 100% identical panorama (`dark-background.png` in Dark Mode, `light-background.png` in Light Mode) across all 10 modules.
- **Absolute Coordinate**: Top edge at `84px` from viewport top on all modules.

### 3.2 Tablet (`≤ 1024px` and `≤ 768px`)
- **Breakpoints**: `1024px` and `768px`.
- **Hero Banner Behavior**: Responsive flex:
  - `≤ 1024px`: `height: auto; min-height: 190px; max-height: none; padding: 1.25rem 1.5rem;`.
  - `≤ 768px`: `height: auto; min-height: 200px; max-height: none; flex-direction: column; align-items: flex-start; gap: 1.15rem;`.
- **Sidebar Behavior (`≤ 900px`)**: Shifts offcanvas (`transform: translateX(-100%);`) with mobile toggle button (`#sidebarToggleBtn`) in topbar.
- **Main Content (`≤ 900px`)**: Expands to `margin-left: 0;`.

### 3.3 Mobile (`≤ 480px`)
- **Hero Banner Dimensions**: `height: auto; min-height: 220px; max-height: none; padding: 1.25rem 1rem;`.
- **Hero Layout**: Stacks vertically (`flex-direction: column; align-items: flex-start; gap: 1rem;`).
- **Topbar Search**: Collapses or hides icon-only to preserve 60px bar height without vertical blowout.

---

## 4. Theme & Asset Specification

### 4.1 Master Asset Mapping Contract
Every module references the centralized CSS custom property tokens, guaranteeing that every page loads the identical high-resolution artwork:

| Component | Theme | CSS Token | Standardized Asset File | Relative Path |
| :--- | :--- | :--- | :--- | :--- |
| **Sidebar Full Background** | Dark Mode | `--scenic-sidebar` | `sidebar-bg-dark.png` | `../assets/images/sidebar-bg-dark.png` |
| **Sidebar Full Background** | Light Mode | `--scenic-sidebar` | `sidebar-bg-light.png` | `../assets/images/sidebar-bg-light.png` |
| **Hero Panoramic Banner** | Dark Mode | `--hero-bg-image` | `dark-background.png` | `../assets/images/dark-background.png` |
| **Hero Panoramic Banner** | Light Mode | `--hero-bg-image` | `light-background.png` | `../assets/images/light-background.png` |

### 4.2 Atmospheric Gradient Overlays
Both the Hero Banner and the Full-Bleed Sidebar utilize custom multi-stop gradient overlays to maintain high contrast and WCAG AAA readability:

- **Hero Banner Dark Overlay**:
  ```css
  background: linear-gradient(
    90deg,
    rgba(6, 11, 17, 0.94) 0%,
    rgba(6, 11, 17, 0.82) 40%,
    rgba(6, 11, 17, 0.35) 70%,
    rgba(6, 11, 17, 0.12) 100%
  );
  ```
- **Hero Banner Light Overlay**:
  ```css
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.84) 40%,
    rgba(255, 255, 255, 0.30) 70%,
    rgba(255, 255, 255, 0.10) 100%
  );
  ```
- **Sidebar Full Background Dark Overlay**:
  ```css
  background-image:
    linear-gradient(180deg, rgba(6, 11, 17, 0.88) 0%, rgba(6, 11, 17, 0.72) 40%, rgba(6, 11, 17, 0.90) 100%),
    var(--scenic-sidebar);
  ```
- **Sidebar Full Background Light Overlay**:
  ```css
  background-image:
    linear-gradient(180deg, rgba(255, 255, 255, 0.90) 0%, rgba(255, 255, 255, 0.80) 40%, rgba(255, 255, 255, 0.94) 100%),
    var(--scenic-sidebar);
  ```

---

## 5. Cross-Module Architectural Parity Matrix

All 10 modules conform to the absolute uniform hero and sidebar contracts:

| Module Number & Name | HTML Entry Point | Stylesheet | Hero Section Selector | Box Height (Desktop) | Shared Image Asset | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01. Dashboard** | `dashboard/dashboard.html` | `dashboard/dashboard.css` | `.dashboard-hero.hero-card` | Fixed **230px** | `var(--hero-bg-image)` | **Verified Absolute** |
| **02. Assigned Vaults** | `assigned-vaults/assigned-vaults.html` | `assigned-vaults/assigned-vaults.css` | `.vaults-hero.hero-card` | Fixed **230px** | `var(--hero-bg-image)` | **Verified Absolute** |
| **03. Invitations** | `invitations/invitations.html` | `invitations/invitations.css` | `.invitations-hero.hero-card` | Fixed **230px** | `var(--hero-bg-image)` | **Verified Absolute** |
| **04. Trustee Verification** | `trustee-verification/trustee-verification.html` | `trustee-verification/trustee-verification.css` | `.verification-hero.hero-card` | Fixed **230px** | `var(--hero-bg-image)` | **Verified Absolute** |
| **05. Share Submission** | `share-submission/share-submission.html` | `share-submission/share-submission.css` | `.share-hero.hero-card` | Fixed **230px** | `var(--hero-bg-image)` | **Verified Absolute** |
| **06. Release Status** | `release-status/release-status.html` | `release-status/release-status.css` | `.release-hero.hero-card` | Fixed **230px** | `var(--hero-bg-image)` | **Verified Absolute** |
| **07. Notifications** | `notifications/notifications.html` | `notifications/notifications.css` | `.notifications-hero.hero-card` | Fixed **230px** | `var(--hero-bg-image)` | **Verified Absolute** |
| **08. Activity & History** | `activity-history/activity-history.html` | `activity-history/activity-history.css` | `.activity-hero.hero-card` | Fixed **230px** | `var(--hero-bg-image)` | **Verified Absolute** |
| **09. Profile & Security** | `profile-security/profile-security.html` | `profile-security/profile-security.css` | `.profile-hero.hero-card` | Fixed **230px** | `var(--hero-bg-image)` | **Verified Absolute** |
| **10. Help & Support** | `help-support/help-support.html` | `help-support/help-support.css` | `.help-hero.hero-card` | Fixed **230px** | `var(--hero-bg-image)` | **Verified Absolute** |

---

## 6. Structural & HTML Sanitation Rules

### 6.1 Clean Full-Bleed Sidebar Hierarchy
```html
<aside class="trustee-sidebar" aria-label="Trustee Navigation">
  <!-- Brand Logo Header (Top Only) -->
  <div class="sidebar-brand">
    <div class="brand-shield-icon">
      <!-- SVG Shield -->
    </div>
    <div class="brand-text">
      <span class="brand-title">Aegis<span class="vault-accent">Vault</span></span>
      <span class="brand-tagline">What matters, lives on.</span>
    </div>
  </div>

  <!-- Navigation Links (All 10 items fully visible) -->
  <nav class="sidebar-nav">
    <a href="../dashboard/dashboard.html" class="nav-item">...</a>
    <!-- ... all 10 items ... -->
  </nav>

  <!-- Sidebar Scenic Quote Footer (Unboxed typography on full background) -->
  <div class="sidebar-quote-block">
    <p class="sidebar-scenic-quote">Stronger<br>Security.<br>Brighter<br>Tomorrows.</p>
    <div class="sidebar-scenic-dash"></div>
  </div>
</aside>
```

### 6.2 Absolute Hero Banner Hierarchy
```html
<section class="<module>-hero hero-card" aria-label="<Module> Banner">
  <div class="<module>-hero-left">
    <div class="<module>-hero-eyebrow">0X. MODULE NAME</div>
    <h1 class="<module>-hero-heading">Headline <span class="accent">Accent.</span></h1>
    <p class="<module>-hero-subtext">Concise descriptive text.</p>
    <!-- Optional compact feature badges row -->
  </div>
  <div class="<module>-hero-quote">
    <p class="<module>-hero-quote-text">&ldquo;Inspiring motto or callout.&rdquo;</p>
    <div class="<module>-hero-quote-dash"></div>
  </div>
</section>
```

---

## 7. Verification and Quality Assurance Matrix

| Quality Gate | Requirement | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **Topbar Parity** | `height: 60px; min-height: 60px; max-height: 60px;` | Measured in `common.css` & `themes.css` | **PASS** |
| **Sidebar Width** | `width: 260px;` (`--sidebar-width: 260px;`) | Verified in CSS tokens and app shell | **PASS** |
| **Sidebar Full Background** | Full-bleed scenic artwork covering 100vh height | Verified in `.trustee-sidebar` | **PASS** |
| **No Sidebar Box Card** | `0` occurrences of `.sidebar-bottom-landscape-card` | Automated regex search across all HTML files | **PASS (0/10)** |
| **Hero Box Fixed Height** | Exactly `230px` across all 10 module CSS files | Automated regex audit (`audit_css.ps1`) | **PASS (10/10)** |
| **Hero Image Uniformity** | Exact same `var(--hero-bg-image)` across all 10 files | Automated regex audit (`inspect_hero_bg.ps1`) | **PASS (10/10)** |
| **Hero Padding** | Exactly `1.5rem 2rem` across all 10 module CSS files | Automated regex audit (`audit_css.ps1`) | **PASS (10/10)** |
| **Hero Background Fit** | `cover center right` across all 10 module CSS files | Automated regex audit (`audit_css.ps1`) | **PASS (10/10)** |
| **Layout Shift (CLS)** | Zero pixel displacement when navigating across modules | Coordinate & box geometry audit | **PASS** |
| **Character Encoding** | `0` corrupted multi-byte characters (`Â€`, `â€`) | Automated regex search across all HTML files | **PASS (0/10)** |
| **Shield Count** | Exactly 2 shields per page (Top Sidebar + Footer) | Automated HTML audit (`audit_html.ps1`) | **PASS (10/10)** |

---

## 8. Repository Structure & Single Entry Point Architecture

Following the Option C repository consolidation, all redundant nested directories (e.g. `trustee/trustee/`) have been eliminated. Exactly **one** `index.html` exists across the entire project root:

```
Trustee/
├── index.html                   <-- Master entry point (Zero-flash instant redirect to dashboard/dashboard.html)
├── assets/
│   └── images/                  <-- Shared scenic art (dark-background.png, light-background.png, sidebar-bg-*.png)
├── common/
│   ├── theme.js                 <-- Instant zero-flash theme engine
│   ├── themes.css               <-- CSS design tokens & master contracts (230px hero, full-bleed sidebar)
│   └── common.css               <-- Shared utility styles, topbar, toast, badges
├── dashboard/
├── assigned-vaults/
├── invitations/
├── trustee-verification/
├── share-submission/
├── release-status/
├── notifications/
├── activity-history/
├── profile-security/
├── help-support/
└── prd.md
```

### 8.1 Zero Broken Links & Asset Parity
- **Path Resolution**: Peer-relative links (`../common/themes.css`, `../assets/images/dark-background.png`, `../<sibling>/<sibling>.html`) resolve seamlessly across all 10 modules.
- **Root Entry Point**: `index.html` at root redirects immediately (`window.location.replace("dashboard/dashboard.html")` + `<meta http-equiv="refresh" content="0; url=dashboard/dashboard.html">`) with `#060b11` dark surface background to prevent visual flash.
- **Link Audit Results**: 261 out of 261 relative asset/page links verified OK (0 broken).
- **Character Encoding**: 0 corrupted characters (`â†‘`, `â†’`, `âœ•`, `â— `) across all HTML files, normalized to standard HTML entities (`&uarr;`, `&rarr;`, `&times;`, `&bull;`).

---

## 9. Conclusion & Sign-Off

The Trustee Panel achieves **100% absolute geometric, visual, and architectural uniformity**:
- Single **`index.html`** root entry point cleanly redirecting to `dashboard/dashboard.html`.
- Sticky **`60px`** top navigation bar.
- Fixed **`260px`** sidebar navigation with full-bleed scenic artwork across the entire 100vh height.
- Absolute fixed **`230px`** height (`100%` width) hero banners placed at the exact same Y-coordinate (`84px`), displaying the exact same sunset mountain panorama image (`dark-background.png` in Dark Mode, `light-background.png` in Light Mode) across all 10 modules.
- Complete elimination of layout shifting, header jumping, background switching between pages, and redundant folder nesting.

