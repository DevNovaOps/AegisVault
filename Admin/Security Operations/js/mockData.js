/**
 * AegisVault — Security Operations Mock Data
 * Fictional demonstration telemetry for college project presentation.
 * Structured to seamlessly map to future Django REST Framework API endpoints:
 *   /api/security/overview/
 *   /api/security/alerts/
 *   /api/security/events/
 *   /api/security/access/
 *   /api/security/incidents/
 */

const AegisSecurityData = {
    // 1. KPI Summary Data
    kpis: {
        securityEvents: {
            value: 47,
            displayValue: "47",
            label: "Security Events",
            sublabel: "vs previous 24h",
            trend: "+32%",
            trendDirection: "up",
            trendType: "warning" // increased events
        },
        criticalAlerts: {
            value: 5,
            displayValue: "5",
            label: "Critical Alerts",
            sublabel: "Requires immediate action",
            trend: "+67%",
            trendDirection: "up",
            trendType: "danger"
        },
        activeThreats: {
            value: 0,
            displayValue: "0",
            label: "Active Threats",
            sublabel: "No active threats",
            trend: "-100%",
            trendDirection: "down",
            trendType: "good"
        },
        blockedAttempts: {
            value: 1284,
            displayValue: "1,284",
            label: "Blocked Attempts",
            sublabel: "Suspicious activity",
            trend: "+18%",
            trendDirection: "up",
            trendType: "danger"
        },
        systemStatus: {
            status: "Protected",
            lastChecked: "Just now",
            uptime: "99.98%",
            firewallState: "Active & Enforced"
        }
    },

    // 2. Security Event Trends (7 Days telemetry matching screenshot)
    trends: {
        timeRange: "Last 7 Days",
        labels: ["6 Sep", "7 Sep", "8 Sep", "9 Sep", "10 Sep", "11 Sep", "12 Sep"],
        series: [
            {
                name: "Failed Login Attempts",
                color: "#EF4444",
                fillColor: "rgba(239, 68, 68, 0.08)",
                data: [35, 68, 95, 95, 125, 115, 160] // values scaled to 0-200 axis
            },
            {
                name: "Suspicious Activity",
                color: "#3B82F6",
                fillColor: "rgba(59, 130, 246, 0.12)",
                data: [12, 38, 70, 70, 72, 98, 78] // values scaled to 0-200 axis
            }
        ]
    },

    // 3. Threat Sources (matching screenshot percentages & world map markers)
    threatSources: {
        timeRange: "Last 30 Days",
        breakdown: [
            { country: "India", code: "IN", flag: "🇮🇳", percentage: 28, count: 360, color: "#EF4444" },
            { country: "United States", code: "US", flag: "🇺🇸", percentage: 18, count: 231, color: "#F97316" },
            { country: "Russia", code: "RU", flag: "🇷🇺", percentage: 12, count: 154, color: "#F59E0B" },
            { country: "Singapore", code: "SG", flag: "🇸🇬", percentage: 8, count: 103, color: "#3B82F6" },
            { country: "Germany", code: "DE", flag: "🇩🇪", percentage: 6, count: 77, color: "#8B5CF6" },
            { country: "Others", code: "OT", flag: "🌐", percentage: 28, count: 359, color: "#64748B" }
        ],
        // Map hotspots (SVG coordinates on standard 1000x500 equirectangular map projection)
        hotspots: [
            { id: "h1", name: "Mumbai / New Delhi, India", x: 710, y: 240, r: 8, count: 360, color: "#EF4444" },
            { id: "h2", name: "Virginia / California, USA", x: 230, y: 190, r: 7, count: 231, color: "#F97316" },
            { id: "h3", name: "Moscow / St. Petersburg, Russia", x: 610, y: 140, r: 6, count: 154, color: "#F59E0B" },
            { id: "h4", name: "Singapore Central", x: 770, y: 295, r: 5, count: 103, color: "#3B82F6" },
            { id: "h5", name: "Frankfurt, Germany", x: 520, y: 165, r: 5, count: 77, color: "#8B5CF6" }
        ]
    },

    // 4. Security Posture Donut & Breakdown
    posture: {
        overallScore: 92,
        maxScore: 100,
        statusText: "Good",
        statusTone: "positive",
        categories: [
            { name: "Access Control", score: 95, color: "#10B981" },
            { name: "Threat Detection", score: 90, color: "#3B82F6" },
            { name: "Incident Response", score: 88, color: "#F59E0B" },
            { name: "System Hardening", score: 92, color: "#A855F7" }
        ]
    },

    // 5. Recent Security Events (Exact records from screenshot + extra records for filters & pagination)
    securityEvents: [
        {
            id: "EVT-8941",
            timestamp: "12 Sep, 10:24 AM",
            rawDate: "2026-09-12T10:24:00",
            eventType: "Failed Login",
            category: "Authentication",
            userOrIp: "192.168.1.45",
            userDisplay: "192.168.1.45",
            flag: "🇮🇳",
            country: "India",
            resource: "Admin Portal",
            severity: "High",
            status: "Blocked",
            details: "5 consecutive invalid password attempts detected against admin authentication portal. IP temporarily throttled."
        },
        {
            id: "EVT-8940",
            timestamp: "12 Sep, 09:18 AM",
            rawDate: "2026-09-12T09:18:00",
            eventType: "Unusual Location",
            category: "Vault",
            userOrIp: "rahul@example.com",
            userDisplay: "rahul@example.com",
            flag: "🌐",
            country: "Unknown Region",
            resource: "Vault Access",
            severity: "Medium",
            status: "Investigating",
            details: "Vault 'Personal Archive' accessed from an unrecognised geographic region outside typical user baseline profile."
        },
        {
            id: "EVT-8939",
            timestamp: "12 Sep, 08:42 AM",
            rawDate: "2026-09-12T08:42:00",
            eventType: "Multiple Failed Attempts",
            category: "Authentication",
            userOrIp: "103.21.244.10",
            userDisplay: "103.21.244.10",
            flag: "🇮🇳",
            country: "India",
            resource: "User Login",
            severity: "High",
            status: "Blocked",
            details: "Brute-force password spray pattern intercepted. Web application firewall blacklisted client origin for 60 minutes."
        },
        {
            id: "EVT-8938",
            timestamp: "11 Sep, 11:30 PM",
            rawDate: "2026-09-11T23:30:00",
            eventType: "Suspicious API Request",
            category: "System",
            userOrIp: "52.14.23.11",
            userDisplay: "52.14.23.11",
            flag: "🇺🇸",
            country: "United States",
            resource: "/api/v1/vaults",
            severity: "Medium",
            status: "Investigating",
            details: "High frequency JSON schema exploration querying timelock status. Rate-limited by API gateway."
        },
        {
            id: "EVT-8937",
            timestamp: "11 Sep, 10:15 PM",
            rawDate: "2026-09-11T22:15:00",
            eventType: "New Device Login",
            category: "Authentication",
            userOrIp: "neha@example.com",
            userDisplay: "neha@example.com",
            flag: "🌐",
            country: "India",
            resource: "Web Portal",
            severity: "Low",
            status: "Allowed",
            details: "Authentication verified with secondary TOTP security token on Chrome / macOS device."
        },
        {
            id: "EVT-8936",
            timestamp: "11 Sep, 09:02 PM",
            rawDate: "2026-09-11T21:02:00",
            eventType: "Permission Change",
            category: "Permission",
            userOrIp: "Admin",
            userDisplay: "Admin",
            flag: "🛡️",
            country: "Internal",
            resource: "User Management",
            severity: "Medium",
            status: "Completed",
            details: "Trustee quorum threshold updated for multi-signature recovery vault authorization."
        },
        {
            id: "EVT-8935",
            timestamp: "11 Sep, 07:45 PM",
            rawDate: "2026-09-11T19:45:00",
            eventType: "Malicious IP Blocked",
            category: "System",
            userOrIp: "185.199.110.23",
            userDisplay: "185.199.110.23",
            flag: "🇷🇺",
            country: "Russia",
            resource: "Firewall",
            severity: "High",
            status: "Blocked",
            details: "Known botnet scraper IP matched against AegisVault threat intelligence feeds. Connection dropped."
        },
        {
            id: "EVT-8934",
            timestamp: "11 Sep, 06:21 PM",
            rawDate: "2026-09-11T18:21:00",
            eventType: "Data Export Attempt",
            category: "Vault",
            userOrIp: "user123@example.com",
            userDisplay: "user123@example.com",
            flag: "🌐",
            country: "Internal",
            resource: "Reports",
            severity: "Medium",
            status: "Investigating",
            details: "Bulk export request of 500+ encrypted audit records queued for compliance officer sign-off."
        },
        {
            id: "EVT-8933",
            timestamp: "11 Sep, 04:10 PM",
            rawDate: "2026-09-11T16:10:00",
            eventType: "Trustee Verification Completed",
            category: "Trustee",
            userOrIp: "kavya@example.com",
            userDisplay: "kavya@example.com",
            flag: "🇮🇳",
            country: "India",
            resource: "Verification",
            severity: "Low",
            status: "Completed",
            details: "Cryptographic identity verification finalized with Shamir's Secret Share shard generation."
        },
        {
            id: "EVT-8932",
            timestamp: "11 Sep, 02:05 PM",
            rawDate: "2026-09-11T14:05:00",
            eventType: "Recovery Workflow Initiated",
            category: "Recovery",
            userOrIp: "arjun@example.com",
            userDisplay: "arjun@example.com",
            flag: "🇮🇳",
            country: "India",
            resource: "Emergency Access Vault",
            severity: "High",
            status: "Investigating",
            details: "Emergency timelock countdown triggered by designated trustee. 7-day heartbeat challenge issued."
        },
        {
            id: "EVT-8931",
            timestamp: "11 Sep, 11:15 AM",
            rawDate: "2026-09-11T11:15:00",
            eventType: "Release Condition Updated",
            category: "Release",
            userOrIp: "Admin",
            userDisplay: "Admin",
            flag: "🛡️",
            country: "Internal",
            resource: "Family Legacy Vault",
            severity: "Low",
            status: "Completed",
            details: "Proof-of-inactivity threshold adjusted from 90 days to 120 days by vault primary owner."
        },
        {
            id: "EVT-8930",
            timestamp: "11 Sep, 09:30 AM",
            rawDate: "2026-09-11T09:30:00",
            eventType: "Security Config Change",
            category: "System",
            userOrIp: "Admin",
            userDisplay: "Admin",
            flag: "🛡️",
            country: "Internal",
            resource: "Security Operations",
            severity: "Medium",
            status: "Completed",
            details: "Enforced mandatory WebAuthn hardware token verification for all administrative accounts."
        }
    ],

    // 6. Active Alerts (Exact items from screenshot + details for modal/acknowledge/resolve)
    activeAlerts: [
        {
            id: "ALT-2041",
            title: "Multiple failed login attempts",
            timestamp: "5 minutes ago",
            rawDate: "2026-09-12T10:19:00",
            severity: "High",
            category: "Failed Authentication",
            affectedResource: "Admin Portal",
            affectedUser: "Admin (192.168.1.45)",
            affectedVault: "System Wide",
            status: "Active",
            description: "5 failed authentication requests detected within 90 seconds from IP 192.168.1.45. Origin blocked temporarily.",
            relatedEvents: ["EVT-8941", "EVT-8939"]
        },
        {
            id: "ALT-2040",
            title: "Suspicious login from new country",
            timestamp: "18 minutes ago",
            rawDate: "2026-09-12T10:06:00",
            severity: "Medium",
            category: "Suspicious Access",
            affectedResource: "Vault Access",
            affectedUser: "rahul@example.com",
            affectedVault: "Personal Archive Vault",
            status: "Active",
            description: "Session established from IP associated with an unexpected VPN exit node not matching typical location profile.",
            relatedEvents: ["EVT-8940"]
        },
        {
            id: "ALT-2039",
            title: "Unusual API activity detected",
            timestamp: "1 hour ago",
            rawDate: "2026-09-12T09:24:00",
            severity: "Medium",
            category: "Unusual Vault Activity",
            affectedResource: "/api/v1/vaults",
            affectedUser: "API Key (Read-Only)",
            affectedVault: "Digital Documents Vault",
            status: "Active",
            description: "Bursty query pattern exceeding 300 req/min directed towards cryptographic metadata endpoints.",
            relatedEvents: ["EVT-8938"]
        },
        {
            id: "ALT-2038",
            title: "Large data export attempt",
            timestamp: "2 hours ago",
            rawDate: "2026-09-12T08:24:00",
            severity: "High",
            category: "Unusual Vault Activity",
            affectedResource: "Reports Engine",
            affectedUser: "user123@example.com",
            affectedVault: "Family Legacy Vault",
            status: "Active",
            description: "User initiated export of encrypted audit and asset manifests without required second trustee confirmation.",
            relatedEvents: ["EVT-8934"]
        },
        {
            id: "ALT-2037",
            title: "Unrecognized certificate signature",
            timestamp: "4 hours ago",
            rawDate: "2026-09-12T06:24:00",
            severity: "Low",
            category: "Configuration Warning",
            affectedResource: "Mutual TLS Endpoint",
            affectedUser: "Backup Agent #3",
            affectedVault: "Cold Storage Replicas",
            status: "Active",
            description: "Client certificate renewal expiring in 48 hours for automated replication node.",
            relatedEvents: []
        }
    ],

    // 7. Access Activity Telemetry (For Access Activity Tab)
    accessActivity: [
        {
            id: "ACC-501",
            user: "Admin",
            role: "System Administrator",
            action: "Admin Portal Login",
            resource: "Security Operations Console",
            ip: "192.0.2.10",
            device: "Chrome 128 / Windows 11",
            timestamp: "12 Sep, 10:20 AM",
            result: "Success"
        },
        {
            id: "ACC-502",
            user: "192.168.1.45",
            role: "Anonymous",
            action: "Password Auth",
            resource: "Admin Portal",
            ip: "192.168.1.45",
            device: "Python-Requests / Linux",
            timestamp: "12 Sep, 10:24 AM",
            result: "Blocked"
        },
        {
            id: "ACC-503",
            user: "rahul@example.com",
            role: "Vault Owner",
            action: "Vault Metadata Query",
            resource: "Personal Archive Vault",
            ip: "198.51.100.44",
            device: "Safari 17 / macOS Sonoma",
            timestamp: "12 Sep, 09:18 AM",
            result: "Flagged"
        },
        {
            id: "ACC-504",
            user: "kavya@example.com",
            role: "Designated Trustee",
            action: "Shard Signature Submission",
            resource: "Emergency Access Vault",
            ip: "103.45.12.8",
            device: "Firefox 129 / Windows 10",
            timestamp: "11 Sep, 04:10 PM",
            result: "Success"
        },
        {
            id: "ACC-505",
            user: "185.199.110.23",
            role: "Untrusted Client",
            action: "Port Scan / Probe",
            resource: "Firewall Gateway",
            ip: "185.199.110.23",
            device: "Unknown Bot / Linux",
            timestamp: "11 Sep, 07:45 PM",
            result: "Blocked"
        },
        {
            id: "ACC-506",
            user: "neha@example.com",
            role: "Standard User",
            action: "Web Portal Auth",
            resource: "Web Application",
            ip: "103.21.244.78",
            device: "Chrome 128 / Android 14",
            timestamp: "11 Sep, 10:15 PM",
            result: "Success"
        },
        {
            id: "ACC-507",
            user: "user123@example.com",
            role: "Auditor",
            action: "Compliance Report Download",
            resource: "Reports Module",
            ip: "192.0.2.89",
            device: "Edge 127 / Windows 11",
            timestamp: "11 Sep, 06:21 PM",
            result: "Flagged"
        }
    ],

    // 8. Incidents (For Incidents Tab)
    incidents: [
        {
            id: "INC-1001",
            title: "Multiple Failed Authentication Attempts on Admin Portal",
            severity: "High",
            affectedArea: "Authentication & Admin Gateway",
            created: "12 Sep, 10:24 AM",
            assignedTo: "Admin",
            status: "Investigating",
            description: "Coordinated credential stuffing attempts originating from 192.168.1.45 targeting the administrative interface.",
            timeline: [
                { time: "10:24 AM", note: "Alert ALT-2041 triggered: 5 failed attempts in 90s" },
                { time: "10:25 AM", note: "WAF automated rate-limiting rule applied" },
                { time: "10:27 AM", note: "Incident INC-1001 created automatically by security engine" },
                { time: "10:30 AM", note: "Administrator assigned to review perimeter logs" }
            ],
            notes: "IP geolocated to India ISP subnet. WAF rules currently enforcing temporary drop."
        },
        {
            id: "INC-1002",
            title: "Anomalous Vault Access Pattern from Unverified Geographic Region",
            severity: "Medium",
            affectedArea: "Vault Custody & Shard Decryption",
            created: "12 Sep, 09:18 AM",
            assignedTo: "Security Lead",
            status: "Contained",
            description: "Access token for rahul@example.com attempted access from unknown ASN without usual hardware key challenge.",
            timeline: [
                { time: "09:18 AM", note: "Alert ALT-2040 detected unusual geo-coordinates" },
                { time: "09:20 AM", note: "Step-up challenge issued to client" },
                { time: "09:22 AM", note: "Active session token isolated to read-only sandbox" },
                { time: "09:35 AM", note: "User contacted via out-of-band mobile confirmation" }
            ],
            notes: "User confirmed traveling on flight transit. Identity reaffirmed with biometric backup."
        },
        {
            id: "INC-1003",
            title: "Unauthorized Large-Scale Audit Log Export Trigger",
            severity: "Medium",
            affectedArea: "Audit Logs & Compliance Exfiltration",
            created: "11 Sep, 06:21 PM",
            assignedTo: "Compliance Officer",
            status: "Resolved",
            description: "High volume data export requested without dual trustee cryptographic approval.",
            timeline: [
                { time: "06:21 PM", note: "Alert ALT-2038 flagged 500+ record export attempt" },
                { time: "06:25 PM", note: "Export pipeline held in quarantine queue" },
                { time: "07:00 PM", note: "Auditor submitted valid compliance justification ticket" },
                { time: "07:15 PM", note: "Incident marked resolved after secondary admin sign-off" }
            ],
            notes: "Legitimate quarterly compliance audit verified. Dual approval process successfully prevented premature leak."
        }
    ]
};

// Export to window for global access
window.AegisSecurityData = AegisSecurityData;
