# AegisVault — Trustee Management Module

## Overview
The **Trustee Management Module** is an integral administrative component of the **AegisVault — Automated Time-Locked Digital Asset & Legacy Custody Protocol**. It enables authorized system administrators to monitor, assign, invite, and audit custodians (Primary Trustees, Co-Trustees, and Backup Trustees) designated across all secure time-locked cryptographic vaults.

---

## Architecture & Structure
```
Trustee Management/
│
├── index.html                  # Semantic HTML5 App Shell, Universal Navbar & Sidebar
├── css/
│   └── trustee-management.css  # CSS Design Tokens, Dual Themes, Table & Card Styles
├── js/
│   ├── mockData.js             # Realistic Custody Mock Data (Trustees, KPIs, Invitations)
│   └── trustee-management.js   # Tab controller, SVG donut engine, live filters, modals
└── README.md                   # Technical Viva Documentation
```

---

## Key Features & Viva Talking Points

1. **Dual Theme Synchronization**:
   - Seamlessly transitions between Light Theme (`#F4F6FA`) and Dark Theme (`#020B11`) via CSS variables.
   - Dual localStorage persistence keys (`aegisvault_theme` and `aegis_theme`) for universal admin panel interoperability.

2. **Status Tabs & Integrated Invitations**:
   - Single-page tabbed navigation: *All Trustees*, *Pending Verification*, *Verified*, *Rejected*, *Inactive*, and *Invitations*.
   - Switching to *Invitations* reveals the specialized invitation dispatch dashboard with status tracking (Pending, Accepted, Expired, Cancelled).

3. **Pure SVG Donut Visualization**:
   - Mathematical SVG arc rendering (`stroke-dasharray`, `stroke-dashoffset`) with centered metric text (`614 Trustees`).
   - Dynamic tooltips and percentage legends.

4. **Multi-Criterion Search & Filtering**:
   - Real-time client-side search across trustee names, emails, and unique identifiers (`TR-XXXX`).
   - Dropdown filtering by Trustee Type (Primary, Co-Trustee, Backup), Verification Status, and Linked Vaults.

5. **Custody Management Workflows**:
   - **Add Trustee**: Modal form with automatic initials badge generation and vault link.
   - **View Profile**: Detailed custodian dossier with vault assignments and verification state.
   - **Edit Trustee**: Update role, contact, or verification clearance.
   - **Deactivate Trustee**: Revoke quorum authorization and timelock release powers.

---

## Future Django Integration (API Endpoints)
When connecting this frontend to the Python Django REST Framework backend:
- `GET /api/v1/trustees/` — List all trustees with query parameter filtering (`?status=Verified&type=Primary`)
- `POST /api/v1/trustees/` — Create new nominated trustee
- `GET /api/v1/trustees/{id}/` — Retrieve trustee profile and cryptographic public key
- `PATCH /api/v1/trustees/{id}/` — Update contact or role parameters
- `POST /api/v1/trustees/{id}/deactivate/` — Deactivate trustee custody authorization
- `GET /api/v1/trustees/invitations/` — Fetch pending and historical invitation links
- `POST /api/v1/trustees/invitations/` — Dispatch cryptographically signed email invitation
