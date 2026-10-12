/**
 * AegisVault Admin Dashboard Module — Data Store
 * Clean initial state for live backend integration
 */

const AegisMockData = {
    // 1. System Overview Metrics (6 Top Cards)
    overviewMetrics: {
        totalUsers: {
            label: "Total Users",
            value: "0",
            numericValue: 0,
            trend: "Live",
            trendType: "positive",
            subtext: "Registered accounts",
            icon: "user",
            colorClass: "metric-blue"
        },
        totalTrustees: {
            label: "Total Trustees",
            value: "0",
            numericValue: 0,
            trend: "Live",
            trendType: "positive",
            subtext: "Designated custodians",
            icon: "trustees",
            colorClass: "metric-cyan"
        },
        activeVaults: {
            label: "Active Vaults",
            value: "0",
            numericValue: 0,
            trend: "Live",
            trendType: "positive",
            subtext: "Encrypted vaults",
            icon: "vault",
            colorClass: "metric-emerald"
        },
        pendingRequests: {
            label: "Pending Requests",
            value: "0",
            numericValue: 0,
            trend: "Live",
            trendType: "positive",
            subtext: "Awaiting review",
            icon: "clock",
            colorClass: "metric-amber"
        },
        securityEvents: {
            label: "Security Events",
            value: "0",
            numericValue: 0,
            trend: "Live",
            trendType: "alert",
            subtext: "Unresolved alerts",
            icon: "shield",
            colorClass: "metric-coral"
        },
        systemUptime: {
            label: "System Uptime",
            value: "100%",
            numericValue: 100,
            trend: "Live",
            trendType: "positive",
            subtext: "Operational integrity",
            icon: "server",
            colorClass: "metric-blue"
        }
    },

    // 2. User Growth Chart Dataset
    userGrowth: {
        "6m": {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
            values: [0, 0, 0, 0, 0, 0],
            min: 0,
            max: 10,
            step: 2
        },
        "30d": {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            values: [0, 0, 0, 0],
            min: 0,
            max: 10,
            step: 2
        },
        "1y": {
            labels: ["Q1", "Q2", "Q3", "Q4"],
            values: [0, 0, 0, 0],
            min: 0,
            max: 10,
            step: 2
        }
    },

    // 3. Vault Activity Grouped Bar Chart Dataset
    vaultActivity: {
        "6m": {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
            created: [0, 0, 0, 0, 0, 0],
            accessed: [0, 0, 0, 0, 0, 0],
            min: 0,
            max: 10,
            step: 2
        },
        "30d": {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            created: [0, 0, 0, 0],
            accessed: [0, 0, 0, 0],
            min: 0,
            max: 10,
            step: 2
        },
        "1y": {
            labels: ["Q1", "Q2", "Q3", "Q4"],
            created: [0, 0, 0, 0],
            accessed: [0, 0, 0, 0],
            min: 0,
            max: 10,
            step: 2
        }
    },

    // 4. System Health Services (Infrastructure telemetry)
    systemHealth: [
        {
            id: "srv-db",
            name: "Database (SQLite/PostgreSQL)",
            icon: "database",
            status: "Healthy",
            statusClass: "healthy",
            latency: "2ms",
            uptime: "100.0%",
            details: "Primary persistence layer responsive. WAL checkpointing active."
        },
        {
            id: "srv-app",
            name: "Django API Core",
            icon: "server",
            status: "Healthy",
            statusClass: "healthy",
            latency: "8ms",
            uptime: "99.99%",
            details: "REST Framework endpoints online with JWT authentication."
        },
        {
            id: "srv-crypto",
            name: "Cryptographic Subsystem",
            icon: "cpu",
            status: "Healthy",
            statusClass: "healthy",
            latency: "1ms",
            uptime: "100.0%",
            details: "AES-256-GCM zero-knowledge encryption modules operational."
        },
        {
            id: "srv-email",
            name: "SMTP Relay",
            icon: "mail",
            status: "Healthy",
            statusClass: "healthy",
            latency: "24ms",
            uptime: "99.98%",
            details: "Notification pipeline configured for trustee dispatches."
        },
        {
            id: "srv-storage",
            name: "Encrypted Storage",
            icon: "hard-drive",
            status: "Healthy",
            statusClass: "healthy",
            latency: "5ms",
            uptime: "100.0%",
            details: "Encrypted asset safe storage active."
        },
        {
            id: "srv-auth",
            name: "Authentication & MFA",
            icon: "shield",
            status: "Healthy",
            statusClass: "healthy",
            latency: "3ms",
            uptime: "100.0%",
            details: "PBKDF2/Argon2 password hashing & TOTP multi-factor active."
        }
    ],

    // 5. Recent Users (Clean empty state)
    recentUsers: [],

    // 6. Recent Security Events (Clean empty state)
    recentSecurityEvents: [],

    // 7. Pending Actions (Clean empty state)
    pendingActions: [],

    // 8. User Role Distribution
    userRoleDistribution: [],

    // 9. Vault Categories Distribution
    vaultCategoriesDistribution: [],

    // 10. Global Search Index
    searchIndex: [
        { id: "nav-users", title: "User Management", type: "nav", category: "Navigation", snippet: "Manage account owners and credentials" },
        { id: "nav-trustees", title: "Trustee Management", type: "nav", category: "Navigation", snippet: "Inspect trustee verifications and invitations" },
        { id: "nav-vaults", title: "Vault Management", type: "nav", category: "Navigation", snippet: "Oversee encrypted custody containers" },
        { id: "nav-audit", title: "Audit Trail", type: "nav", category: "Navigation", snippet: "SOC 2 immutable activity logs" },
        { id: "nav-security", title: "Security Operations", type: "nav", category: "Navigation", snippet: "Monitor threat alerts and forensic events" }
    ]
};

if (typeof window !== 'undefined') {
    window.AegisMockData = AegisMockData;
}
