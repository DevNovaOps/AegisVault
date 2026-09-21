# AegisVault — Security Operations Module

## 1. Overview
The **Security Operations** module serves as the central administrative monitoring and incident triage console for **AegisVault** — an Automated Time-Locked Digital Asset & Legacy Custody Protocol.

This module provides real-time situational awareness across the system, tracking:
- **Security Events**: Chronological audit feed of authentication attempts, vault queries, shard submissions, and perimeter firewall blocks.
- **Active Alerts**: Priority-ranked security notifications with instant administrative triage actions (**Acknowledge** & **Resolve**).
- **Threat Sources**: Geographic breakdown of malicious origin traffic with interactive vector map visualization.
- **Security Posture**: Multi-domain defense rating across Access Control, Threat Detection, Incident Response, and System Hardening.
- **Incidents**: Multi-stage investigation workflows with step-by-step forensic progression timelines.

---

## 2. Directory Structure
```
Security Operations/
├── index.html                    # Single-page operations console with sub-tabs
├── css/
│   └── security-operations.css   # Dual light/dark theme styling matching screenshots
├── js/
│   ├── mockData.js               # Structured mock telemetry for frontend demonstration
│   └── security-operations.js    # Interactive SVG chart renderers, filters, modals, export
└── README.md                     # College viva & architecture guide
```

---

## 3. Sub-Tabs Architecture
The page is implemented as a **Single-Page Application (SPA)** with 5 dedicated tab views:
1. **Security Overview**: The primary dashboard view shown in the reference screenshots (4 KPI cards, Trend Line Chart, Threat Sources World Map, Security Posture Donut Gauge, Recent Security Events table, Active Alerts widget, and Quick Actions).
2. **Active Alerts**: Comprehensive alert queue displaying detailed severity diagnostics, affected vault targets, and one-click Acknowledge / Resolve flows.
3. **Security Events**: Full chronological stream of security audit events with multi-column filtering and CSV export.
4. **Access Activity**: Telemetry table of user and trustee logins, WebAuthn verifications, and shard signatures.
5. **Incidents**: Case management board tracking open, contained, and resolved security incidents with interactive visual timelines.

---

## 4. Key Features & College Viva Guide
- **Exact Visual Fidelity**: Replicated to match the provided Dark Theme and Light Theme reference screenshots, including the alpine mountain cutout banner and lower sidebar brand card.
- **Dual Theme Support**: Persisted via `localStorage` and synchronized across all AegisVault modules.
- **Zero External Heavy Dependencies**: Line charts, world map hotspots, and posture gauge are built using lightweight, performant, and reactive **Pure SVG**.
- **Perimeter Quick Actions**:
  - *Block IP Address*: Simulates firewall ACL rule enforcement.
  - *Revoke Access*: Simulates JWT invalidation and session quarantine.
  - *Investigate Event*: Drill down into raw audit telemetry.
  - *View Threat Intel*: View reputation score and ASN threat categorization.
- **Data Export**: Generates filtered CSV audit logs directly in the browser.

---

## 5. Future Django API Integration
The frontend data structures in `mockData.js` are intentionally aligned with standard Django REST Framework serializers:
- `GET /api/security/overview/` -> Summary KPIs, 7-day trend series, posture scores
- `GET /api/security/alerts/` -> Active security alerts
- `POST /api/security/alerts/{id}/acknowledge/` -> Update alert status
- `POST /api/security/alerts/{id}/resolve/` -> Record resolution notes
- `GET /api/security/events/` -> Paginated & filtered security audit logs
- `POST /api/security/firewall/block-ip/` -> Perimeter firewall rule addition
- `GET /api/security/incidents/` -> Incident case files & progression timelines
