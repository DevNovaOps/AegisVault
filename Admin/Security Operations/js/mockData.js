/**
 * AegisVault — Security Operations Baseline Telemetry
 * Provides structure for pure SVG charts and default schemas.
 * Populated dynamically from live Django endpoints:
 *   GET /api/v1/admin/security/overview/
 *   GET /api/v1/admin/security/alerts/
 *   GET /api/v1/admin/security/events/
 */

const AegisSecurityData = {
    // 1. KPI Baseline
    kpis: {
        securityEvents: {
            value: 0,
            displayValue: "0",
            label: "Security Events",
            sublabel: "Past 24 hours",
            trend: "0%",
            trendDirection: "up",
            trendType: "warning"
        },
        criticalAlerts: {
            value: 0,
            displayValue: "0",
            label: "Critical Alerts",
            sublabel: "Immediate attention",
            trend: "0%",
            trendDirection: "down",
            trendType: "good"
        },
        activeThreats: {
            value: 0,
            displayValue: "0",
            label: "Active Threats",
            sublabel: "Active alerts",
            trend: "0%",
            trendDirection: "down",
            trendType: "good"
        },
        blockedAttempts: {
            value: 0,
            displayValue: "0",
            label: "Blocked Attempts",
            sublabel: "Perimeter firewall",
            trend: "0%",
            trendDirection: "up",
            trendType: "danger"
        },
        systemStatus: {
            status: "Protected",
            lastChecked: "Just now",
            uptime: "99.99%",
            firewallState: "Active & Enforced"
        }
    },

    // 2. Trend SVG Baseline Structure
    trends: {
        timeRange: "Last 7 Days",
        labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Today"],
        series: [
            {
                name: "Failed Login Attempts",
                color: "#EF4444",
                fillColor: "rgba(239, 68, 68, 0.08)",
                data: [0, 1, 0, 2, 0, 1, 0]
            },
            {
                name: "Suspicious Activity",
                color: "#3B82F6",
                fillColor: "rgba(59, 130, 246, 0.12)",
                data: [0, 0, 1, 0, 1, 0, 0]
            }
        ]
    },

    // 3. Threat Geo Breakdown
    threatSources: {
        timeRange: "Live Sensors",
        breakdown: [
            { country: "Local / Internal", code: "IN", flag: "🌐", percentage: 50, count: 2, color: "#3B82F6" },
            { country: "Perimeter / Cloud", code: "US", flag: "☁️", percentage: 50, count: 2, color: "#10B981" }
        ],
        hotspots: [
            { id: "h1", name: "Primary Node", x: 710, y: 240, r: 7, count: 12, color: "#10B981" },
            { id: "h2", name: "Gateway Cluster", x: 230, y: 190, r: 6, count: 5, color: "#3B82F6" }
        ]
    },

    // 4. Security Posture Donut
    posture: {
        overallScore: 98,
        maxScore: 100,
        statusText: "Optimal",
        statusTone: "positive",
        categories: [
            { name: "Access Control", score: 98, color: "#10B981" },
            { name: "Threat Detection", score: 95, color: "#3B82F6" },
            { name: "Incident Response", score: 100, color: "#F59E0B" },
            { name: "System Hardening", score: 99, color: "#A855F7" }
        ]
    },

    // 5. Dynamic live containers
    securityEvents: [],
    activeAlerts: [],
    accessActivity: [
        {
            id: "ACC-01",
            user: "alice.vance@aegisvault-secops.io",
            role: "Admin",
            action: "Admin Portal Access",
            resource: "Dashboard Console",
            ip: "127.0.0.1",
            device: "Browser Session",
            timestamp: "Just now",
            result: "Success"
        }
    ],
    incidents: [
        {
            id: "INC-01",
            title: "Automated SecOps Scan Completed",
            severity: "Low",
            affectedArea: "Cryptographic Vault Services",
            created: "Today",
            assignedTo: "SecOps Core",
            status: "Resolved",
            description: "Scheduled cryptographic checksum audit across all storage volumes.",
            timeline: [
                { time: "Today 10:00 AM", note: "Diagnostic audit completed with 0 errors." }
            ]
        }
    ]
};
