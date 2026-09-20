/**
 * AegisVault Admin Dashboard Module — Mock Data Repository
 * Pixel-accurate enterprise dataset matching the reference design screenshots.
 */

const AegisMockData = {
    // 1. System Overview Metrics (6 Top Cards)
    overviewMetrics: {
        totalUsers: {
            label: "Total Users",
            value: "1,248",
            numericValue: 1248,
            trend: "↑ 12%",
            trendType: "positive",
            subtext: "+134 this month",
            icon: "user",
            colorClass: "metric-blue"
        },
        totalTrustees: {
            label: "Total Trustees",
            value: "3,562",
            numericValue: 3562,
            trend: "↑ 8%",
            trendType: "positive",
            subtext: "+263 this month",
            icon: "trustees",
            colorClass: "metric-cyan"
        },
        activeVaults: {
            label: "Active Vaults",
            value: "982",
            numericValue: 982,
            trend: "↑ 6%",
            trendType: "positive",
            subtext: "+54 this month",
            icon: "vault",
            colorClass: "metric-emerald"
        },
        pendingRequests: {
            label: "Pending Requests",
            value: "18",
            numericValue: 18,
            trend: "↓ 25%",
            trendType: "negative",
            subtext: "-6 from last week",
            icon: "clock",
            colorClass: "metric-amber"
        },
        securityEvents: {
            label: "Security Events",
            value: "7",
            numericValue: 7,
            trend: "↑ 40%",
            trendType: "alert",
            subtext: "+2 from last week",
            icon: "shield",
            colorClass: "metric-coral"
        },
        systemUptime: {
            label: "System Uptime",
            value: "99.98%",
            numericValue: 99.98,
            trend: "↑ 0.2%",
            trendType: "positive",
            subtext: "Last 30 days",
            icon: "server",
            colorClass: "metric-blue"
        }
    },

    // 2. User Growth Chart Dataset
    userGrowth: {
        "6m": {
            labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
            values: [100, 150, 205, 225, 280, 335, 385],
            min: 0,
            max: 400,
            step: 100
        },
        "30d": {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            values: [1140, 1175, 1210, 1248],
            min: 1000,
            max: 1300,
            step: 100
        },
        "1y": {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
            values: [40, 75, 100, 150, 205, 225, 280, 335, 385],
            min: 0,
            max: 400,
            step: 100
        }
    },

    // 3. Vault Activity Grouped Bar Chart Dataset
    vaultActivity: {
        "6m": {
            labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
            created: [78, 128, 142, 154, 138, 132, 140],
            accessed: [52, 68, 86, 92, 84, 78, 86],
            released: [18, 22, 28, 30, 26, 24, 25],
            max: 200,
            step: 50
        },
        "30d": {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            created: [24, 32, 40, 44],
            accessed: [18, 22, 26, 28],
            released: [5, 6, 7, 7],
            max: 50,
            step: 10
        },
        "1y": {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
            created: [45, 60, 78, 128, 142, 154, 138, 132, 140],
            accessed: [30, 42, 52, 68, 86, 92, 84, 78, 86],
            released: [8, 12, 18, 22, 28, 30, 26, 24, 25],
            max: 200,
            step: 50
        }
    },

    // 4. System Health Checklist (6 Services)
    systemHealth: [
        {
            id: "srv-db",
            name: "Database",
            icon: "database",
            status: "Healthy",
            statusClass: "healthy",
            latency: "12ms",
            uptime: "99.99%",
            details: "PostgreSQL multi-region read replicas synced. Active connections: 42/200."
        },
        {
            id: "srv-app",
            name: "Application Server",
            icon: "server",
            status: "Healthy",
            statusClass: "healthy",
            latency: "24ms",
            uptime: "99.98%",
            details: "Django API cluster: 6 worker pods responding in < 30ms with 0 5xx errors."
        },
        {
            id: "srv-workers",
            name: "Background Workers",
            icon: "cpu",
            status: "Healthy",
            statusClass: "healthy",
            latency: "4ms",
            uptime: "99.97%",
            details: "Celery async heartbeat sweep queue empty. Worker tasks processed: 8,421/hr."
        },
        {
            id: "srv-email",
            name: "Email Service",
            icon: "mail",
            status: "Healthy",
            statusClass: "healthy",
            latency: "48ms",
            uptime: "99.95%",
            details: "Transactional SMTP delivery relay nominal. Bounce rate: 0.04%."
        },
        {
            id: "srv-storage",
            name: "Storage",
            icon: "hard-drive",
            status: "Healthy",
            statusClass: "healthy",
            latency: "16ms",
            uptime: "100.0%",
            details: "Encrypted S3 BLOB store operational across 3 availability zones."
        },
        {
            id: "srv-api",
            name: "External APIs",
            icon: "globe",
            status: "Healthy",
            statusClass: "healthy",
            latency: "62ms",
            uptime: "99.92%",
            details: "HSM attestation endpoint and SMS Gateway operational."
        }
    ],

    // 5. Recent Users (5 Rows)
    recentUsers: [
        {
            id: "usr-01",
            name: "Rohit Sharma",
            avatar: "R",
            avatarColor: "avatar-blue",
            email: "rohit@example.com",
            role: "Owner",
            status: "Active",
            statusType: "active",
            joined: "12 Sep 2025",
            vaultCount: 3,
            trusteesCount: 4,
            lastHeartbeat: "Today, 09:15 AM",
            accountTier: "Enterprise Custody"
        },
        {
            id: "usr-02",
            name: "Meera Patel",
            avatar: "M",
            avatarColor: "avatar-teal",
            email: "meera@example.com",
            role: "Trustee",
            status: "Active",
            statusType: "active",
            joined: "11 Sep 2025",
            vaultCount: 0,
            trusteesCount: 2,
            lastHeartbeat: "Yesterday, 04:30 PM",
            accountTier: "Designated Trustee"
        },
        {
            id: "usr-03",
            name: "Kunal Desai",
            avatar: "K",
            avatarColor: "avatar-blue",
            email: "kunal@example.com",
            role: "Owner",
            status: "Pending",
            statusType: "pending",
            joined: "10 Sep 2025",
            vaultCount: 1,
            trusteesCount: 1,
            lastHeartbeat: "Awaiting identity verification",
            accountTier: "Personal Vault"
        },
        {
            id: "usr-04",
            name: "Ananya Shah",
            avatar: "A",
            avatarColor: "avatar-purple",
            email: "ananya@example.com",
            role: "Trustee",
            status: "Active",
            statusType: "active",
            joined: "09 Sep 2025",
            vaultCount: 0,
            trusteesCount: 3,
            lastHeartbeat: "10 Sep, 11:20 AM",
            accountTier: "Designated Trustee"
        },
        {
            id: "usr-05",
            name: "Vivek Jain",
            avatar: "V",
            avatarColor: "avatar-orange",
            email: "vivek@example.com",
            role: "Owner",
            status: "Suspended",
            statusType: "suspended",
            joined: "08 Sep 2025",
            vaultCount: 2,
            trusteesCount: 2,
            lastHeartbeat: "Suspended by Admin review",
            accountTier: "Standard Custody"
        }
    ],

    // 6. Recent Security Events (5 Rows)
    recentSecurityEvents: [
        {
            id: "evt-01",
            time: "12 Sep, 09:41 AM",
            event: "Failed login attempt",
            severity: "High",
            severityType: "high",
            icon: "shield-alert",
            ip: "192.168.1.104",
            location: "Frankfurt, Germany",
            user: "unknown_user",
            details: "5 consecutive failed authentication attempts against endpoint /api/v1/auth/token."
        },
        {
            id: "evt-02",
            time: "12 Sep, 08:23 AM",
            event: "Unusual device login",
            severity: "Medium",
            severityType: "medium",
            icon: "smartphone",
            ip: "103.45.22.18",
            location: "Mumbai, India",
            user: "kunal@example.com",
            details: "Login detected from new device fingerprint (Firefox on macOS, geographic outlier)."
        },
        {
            id: "evt-03",
            time: "11 Sep, 11:02 PM",
            event: "Multiple OTP requests",
            severity: "High",
            severityType: "high",
            icon: "message-square",
            ip: "185.220.101.5",
            location: "Tor Exit Node (Subnet 185.220.0.0/16)",
            user: "rohit@example.com",
            details: "Exceeded velocity limit: 6 OTP resend requests dispatched within 90 seconds."
        },
        {
            id: "evt-04",
            time: "11 Sep, 06:17 PM",
            event: "Admin login",
            severity: "Low",
            severityType: "low",
            icon: "user-check",
            ip: "10.0.4.12",
            location: "Internal Secure Gateway (VPN)",
            user: "admin@aegisvault.io",
            details: "Privileged administrator session verified via FIDO2 WebAuthn hardware security key."
        },
        {
            id: "evt-05",
            time: "10 Sep, 04:55 PM",
            event: "Vault access attempt",
            severity: "High",
            severityType: "high",
            icon: "lock",
            ip: "45.154.255.89",
            location: "Kyiv, Ukraine",
            user: "vivek@example.com",
            details: "Attempted threshold share query without active deceased confirmation. Access strictly blocked."
        }
    ],

    // 7. Pending Actions (5 Items)
    pendingActions: [
        {
            id: "act-01",
            title: "Verify new users",
            count: 6,
            icon: "user-check",
            badgeColor: "act-blue",
            actionText: "Verify new users",
            details: "6 account custodians awaiting government ID and biometric verification verification."
        },
        {
            id: "act-02",
            title: "Review trustee requests",
            count: 4,
            icon: "shield-alert",
            badgeColor: "act-amber",
            actionText: "Review trustee requests",
            details: "4 trustee designation challenges submitted by account beneficiaries."
        },
        {
            id: "act-03",
            title: "Investigate security alerts",
            count: 3,
            icon: "alert-triangle",
            badgeColor: "act-coral",
            actionText: "Investigate security alerts",
            details: "3 high-severity anomalous IPs flagged by Edge Rate Limiting rules."
        },
        {
            id: "act-04",
            title: "Approve vault release",
            count: 2,
            icon: "key",
            badgeColor: "act-orange",
            actionText: "Approve vault release",
            details: "2 time-locked inheritance vaults reached M-of-N threshold and require authorized sign-off."
        },
        {
            id: "act-05",
            title: "Review reported activity",
            count: 3,
            icon: "file-text",
            badgeColor: "act-emerald",
            actionText: "Review reported activity",
            details: "3 suspicious trustee activity reports filed by primary vault custodians."
        }
    ],

    // 8. User Role Distribution Donut Chart
    userRoleDistribution: {
        total: 1248,
        totalLabel: "Users",
        segments: [
            { label: "Vault Owners", percent: 62, count: 774, value: 774, color: "#3B82F6", darkColor: "#38BDF8" },
            { label: "Trustees", percent: 30, count: 374, value: 374, color: "#00D9A5", darkColor: "#00D9A5" },
            { label: "Admins", percent: 5, count: 62, value: 62, color: "#F59E0B", darkColor: "#F5A84B" },
            { label: "Others", percent: 3, count: 38, value: 38, color: "#EF4444", darkColor: "#FF5757" }
        ]
    },
    userRoles: [
        { label: "Vault Owners", percent: 62, count: 774, value: 774, color: "#3B82F6", darkColor: "#38BDF8" },
        { label: "Trustees", percent: 30, count: 374, value: 374, color: "#00D9A5", darkColor: "#00D9A5" },
        { label: "Admins", percent: 5, count: 62, value: 62, color: "#F59E0B", darkColor: "#F5A84B" },
        { label: "Others", percent: 3, count: 38, value: 38, color: "#EF4444", darkColor: "#FF5757" }
    ],

    // 9. Vault Categories Donut Chart
    vaultCategories: {
        total: 982,
        totalLabel: "Vaults",
        segments: [
            { label: "Personal", percent: 34, count: 334, value: 334, color: "#3B82F6", darkColor: "#38BDF8" },
            { label: "Financial", percent: 28, count: 275, value: 275, color: "#00D9A5", darkColor: "#00D9A5" },
            { label: "Professional", percent: 18, count: 177, value: 177, color: "#F59E0B", darkColor: "#F5A84B" },
            { label: "Health", percent: 10, count: 98, value: 98, color: "#8B5CF6", darkColor: "#A78BFA" },
            { label: "Others", percent: 10, count: 98, value: 98, color: "#0B192C", darkColor: "#64748B" }
        ]
    },

    // 10. Notifications Dropdown Feed
    notifications: [
        {
            id: "notif-01",
            title: "Threshold Verification Met",
            message: "Vault #AV-4921 has achieved 3-of-5 trustee Shamir quorum.",
            time: "10 mins ago",
            unread: true,
            icon: "key",
            type: "success"
        },
        {
            id: "notif-02",
            title: "Suspicious Login Spike",
            message: "Edge firewall blocked 8 failed password attempts on Frankfurt node.",
            time: "42 mins ago",
            unread: true,
            icon: "alert-triangle",
            type: "warning"
        },
        {
            id: "notif-03",
            title: "Heartbeat Check-In Completed",
            message: "Daily Celery heartbeat sweep verified 892 active custodians.",
            time: "2 hours ago",
            unread: true,
            icon: "check-circle",
            type: "info"
        },
        {
            id: "notif-04",
            title: "Database Backup Snapshot",
            message: "Automated AES-256 encrypted database snapshot archived to cold storage.",
            time: "6 hours ago",
            unread: false,
            icon: "database",
            type: "info"
        }
    ],

    // 11. Search Index for Header Live Search
    searchIndex: [
        { title: "Rohit Sharma", category: "Users", snippet: "Owner • rohit@example.com • 3 Vaults", type: "user", id: "usr-01" },
        { title: "Meera Patel", category: "Trustees", snippet: "Trustee • meera@example.com • 2 Vaults Linked", type: "user", id: "usr-02" },
        { title: "Kunal Desai", category: "Users", snippet: "Owner • kunal@example.com • Pending Verification", type: "user", id: "usr-03" },
        { title: "Ananya Shah", category: "Trustees", snippet: "Trustee • ananya@example.com • 3 Vaults Linked", type: "user", id: "usr-04" },
        { title: "Vivek Jain", category: "Users", snippet: "Owner • vivek@example.com • Account Suspended", type: "user", id: "usr-05" },
        { title: "Failed login attempt", category: "Security Events", snippet: "12 Sep, 09:41 AM • IP: 192.168.1.104 • Severity: High", type: "event", id: "evt-01" },
        { title: "Unusual device login", category: "Security Events", snippet: "12 Sep, 08:23 AM • kunal@example.com • Severity: Medium", type: "event", id: "evt-02" },
        { title: "Multiple OTP requests", category: "Security Events", snippet: "11 Sep, 11:02 PM • rohit@example.com • Severity: High", type: "event", id: "evt-03" },
        { title: "Database Cluster", category: "System Health", snippet: "PostgreSQL Primary & Read Replicas • 99.99% Uptime", type: "service", id: "srv-db" },
        { title: "Application Server", category: "System Health", snippet: "Django REST cluster • 6 pods running • 24ms latency", type: "service", id: "srv-app" },
        { title: "Audit & Logs", category: "Navigation", snippet: "Cryptographic system audit trail and user access logs", type: "nav", id: "audit-logs" },
        { title: "Vault Management", category: "Navigation", snippet: "Manage time-locked custody protocols and release policies", type: "nav", id: "vault-management" }
    ]
};

window.AegisMockData = AegisMockData;
