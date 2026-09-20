# AegisVault — Public Home / Landing Page

**"Automated Time-Locked Digital Asset & Legacy Custody Protocol"**

*Official Public Landing Page for the AegisVault System.*

---

## 1. Overview

AegisVault is an enterprise-grade digital inheritance and legacy custody protocol engineered to protect personal and family digital assets, credentials, and memories. This repository contains the public-facing landing page built with pure web standards, delivering an editorial luxury aesthetic that combines Apple-level product clarity with cryptographic financial security.

---

## 2. Technology Stack

- **Markup**: Semantic HTML5 with complete ARIA accessibility attributes
- **Styling**: Vanilla CSS3 with CSS Custom Properties (Variables), Flexbox, CSS Grid, Glassmorphism, and responsive breakpoints
- **Logic**: Vanilla JavaScript (ES6+) with modular separation:
  - `main.js`: Theme persistence and background image switcher
  - `navigation.js`: Sticky frosted navbar, scroll spy, and mobile drawer
  - `animations.js`: `IntersectionObserver` scroll reveals, timeline progress, and live statistics counter
  - `interactions.js`: Modal dialogues (Sign In, Get Started, Video), newsletter validation, password strength meter, and toast notifications
- **Zero Frameworks**: No React, Vue, Next.js, Tailwind, Bootstrap, Three.js, GSAP, or external build steps required.

---

## 3. Directory Structure

```
AegisVault Home/
│
├── index.html                  # Main semantic HTML5 document
│
├── css/
│   ├── style.css               # Design system, CSS variables, base styles, typography, components, and modals
│   ├── responsive.css          # Responsive breakpoints (320px, 375px, 430px, 768px, 1024px, 1280px, 1440px, 1920px)
│   └── animations.css          # Keyframes, sequential entrance animations, micro-interactions, and accessibility
│
├── js/
│   ├── main.js                 # App initialization, theme controller, and localStorage persistence
│   ├── navigation.js           # Sticky header, active scroll-spy, and mobile hamburger drawer
│   ├── animations.js           # IntersectionObserver reveals, live stat counters, and timeline animation
│   └── interactions.js         # Interactive modals, newsletter validation, toast feedback, and button ripples
│
├── assets/
│   ├── hero-light.png          # High-resolution morning mountain sanctuary background artwork
│   └── hero-dark.png           # High-resolution twilight mountain sanctuary background artwork
│
└── README.md                   # Comprehensive technical documentation
```

---

## 4. Key Features

### 4.1 Theme System (Light & Dark)
- Seamless toggle between **Dark Theme** (default night atmospheric landscape) and **Light Theme** (morning mountain sanctuary).
- Automatically updates `--hero-bg` and swaps between `assets/hero-dark.png` and `assets/hero-light.png`.
- Persists user preference via `localStorage`.

### 4.2 Hero Section & Central Monument Integration
- Left-aligned editorial typography featuring:
  - Pill badge: `● DIGITAL INHERITANCE, REDEFINED`
  - Headline: `"More Tomorrows For What Matters."` with `#F45A1F` orange brand accent
  - Subtitle and dual CTA action buttons (`Create Your Vault →`, `▶ Watch Video`)
  - Four feature indicators: *End-to-End Encryption*, *Trusted Beneficiaries*, *Automated Check-ins*, and *Legacy Protection*
- Preserves full visibility of the central stone monument, celestial light ring, and stepping stones.

### 4.3 Trusted Ecosystem Strip
- Floating glassmorphic card spanning the hero seam.
- Clean brand wordmarks for Google, Microsoft, AWS, Forbes, Product Hunt, and TechCrunch.
- Right-aligned laurel wreath badge: `"A SAFER TOMORROW TOGETHER"`.

### 4.4 "Why AegisVault" Feature Grid
- 2-column layout with category pill, luxury headline, and 4 colored feature cards:
  - **Military-Grade Encryption** (AES-256, Cyan accent)
  - **Trusted Beneficiaries** (Shamir's Threshold 3-of-5, Amber accent)
  - **Automated Check-ins** (Heartbeat verification, Purple accent)
  - **Your Legacy Lives On** (Beneficiary release, Blue accent)
- Margin script accent: *"Good People Outlive Data."*

### 4.5 Interactive 4-Step Process & Live Statistics
- Connected timeline with animated progress bar connecting:
  - `01 Store Securely`
  - `02 Stay Active`
  - `03 We Safeguard`
  - `04 Your Legacy Lives`
- Transitions from a horizontal connected timeline on desktop to a vertical step layout on mobile.
- Live platform statistics counter animating to target values upon entering the viewport:
  - `10K+` Trusted Users
  - `120+` Countries
  - `99.9%` Uptime & Reliability
  - `24/7` System Monitoring
- Editorial quote card: *"Because what matters today, should matter tomorrow too."*

### 4.6 Cryptographic Security & Digital Legacy Categories
- 6-pillar cryptographic architecture grid detailing: Client-Side Encryption, Zero-Knowledge Architecture, Shamir's Secret Sharing, Multi-Factor Authentication, Trustee Verification, and Immutable Audit Logs.
- 7 Digital Legacy category cards covering Documents, Passwords, Financial Assets, Cloud Accounts, Recovery Codes, Personal Messages, and Photos & Memories.

### 4.7 Interactive Modals & Toast System
- **Sign In Modal**: Full authentication dialog with master password and biometric WebAuthn / Passkey option.
- **Get Started Modal**: Vault initialization workflow with dynamic password strength meter.
- **Cinematic Video Modal**: Protocol overview player container with interactive play trigger.
- **Live Newsletter Validation**: Email regex validation, error alerts, and animated toast notifications.

---

## 5. How to Run Locally

### Option 1: VS Code Live Server Extension
1. Open the project root or the `AegisVault Home/` folder in Visual Studio Code.
2. Right-click `index.html`.
3. Select **"Open with Live Server"** (or click "Go Live" in the status bar).
4. The site will open at `http://127.0.0.1:5500/AegisVault%20Home/index.html`.

### Option 2: Any Static Web Server
Using Python 3:
```bash
cd "d:/collegebwpproject/AegisVault Home"
python -m http.server 8080
```
Then visit `http://localhost:8080` in your web browser.

---

## 6. Accessibility & Performance

- **Reduced Motion**: Respects `@media (prefers-reduced-motion: reduce)` by disabling non-essential decorative animations and transitions.
- **High Performance**: Employs CSS `transform` and `opacity` exclusively for animated properties to ensure 60fps GPU acceleration.
- **Keyboard Navigation**: Full `tabindex`, visible focus indicators, and `Escape` key listeners on all interactive modal overlays.
