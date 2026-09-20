/**
 * AegisVault Analytics Module — Mock Datasets & Platform Telemetry
 * 
 * Realistic, cohesive mock data matching the Light & Dark reference screenshots:
 * - 5 Overview KPI Summary Metrics
 * - User Growth (Line/Area Chart with 30d, 7d, 90d intervals)
 * - Vault Statistics (Grouped Bar Chart across Personal, Family, Business)
 * - User Distribution (Donut Chart segments & percentages)
 * - Geographic Distribution (Regional breakdown for India)
 * - Security Overview (Events, Logins, Breaches, Actions)
 * - System Usage Trends (Multi-series lines: CPU, Memory, Storage, Network I/O)
 * - Recent Platform Activity Log
 */

const AegisAnalyticsData = {
    // 1. Overview Summary KPI Metrics
    overviewMetrics: [
        {
            id: "metric-users",
            label: "Total Users",
            value: "1,248",
            numericValue: 1248,
            trend: "↑ 12%",
            trendDirection: "up",
            trendColor: "green",
            subtext: "+134 this month",
            icon: "users",
            themeColor: "#3B82F6"
        },
        {
            id: "metric-active-users",
            label: "Active Users",
            value: "982",
            numericValue: 982,
            trend: "↑ 8%",
            trendDirection: "up",
            trendColor: "green",
            subtext: "78.7% of total",
            icon: "user-check",
            themeColor: "#10B981"
        },
        {
            id: "metric-vaults",
            label: "Total Vaults",
            value: "892",
            numericValue: 892,
            trend: "↑ 15%",
            trendDirection: "up",
            trendColor: "green",
            subtext: "+116 this month",
            icon: "shield",
            themeColor: "#8B5CF6"
        },
        {
            id: "metric-trustees",
            label: "Total Trustees",
            value: "614",
            numericValue: 614,
            trend: "↑ 10%",
            trendDirection: "up",
            trendColor: "green",
            subtext: "49.2% of users",
            icon: "users-three",
            themeColor: "#F59E0B"
        },
        {
            id: "metric-security",
            label: "Security Events",
            value: "47",
            numericValue: 47,
            trend: "↓ 32%",
            trendDirection: "down",
            trendColor: "red",
            subtext: "-22 from last month",
            icon: "alert-triangle",
            themeColor: "#EF4444"
        }
    ],

    // 2. User Growth Line / Area Chart Dataset
    userGrowth: {
        "30d": {
            labels: ["13 Aug", "20 Aug", "27 Aug", "03 Sep", "10 Sep"],
            values: [450, 680, 850, 980, 1248],
            min: 0,
            max: 2000,
            step: 500,
            tooltipPoint: {
                label: "12 Sep 2025",
                value: "1,248"
            },
            stats: [
                { value: "↑ 12%", label: "User Growth", color: "green" },
                { value: "+ 18%", label: "New Registrations", color: "green" },
                { value: "+ 6%", label: "Active Users", color: "green" }
            ]
        },
        "7d": {
            labels: ["06 Sep", "07 Sep", "08 Sep", "09 Sep", "10 Sep", "11 Sep", "12 Sep"],
            values: [1180, 1195, 1205, 1218, 1230, 1240, 1248],
            min: 1000,
            max: 1300,
            step: 100,
            tooltipPoint: {
                label: "12 Sep 2025",
                value: "1,248"
            },
            stats: [
                { value: "↑ 3.8%", label: "User Growth", color: "green" },
                { value: "+ 28", label: "New Registrations", color: "green" },
                { value: "+ 2.1%", label: "Active Users", color: "green" }
            ]
        },
        "90d": {
            labels: ["Jun", "Jul", "Aug", "Sep"],
            values: [320, 580, 940, 1248],
            min: 0,
            max: 1500,
            step: 500,
            tooltipPoint: {
                label: "Sep 2025",
                value: "1,248"
            },
            stats: [
                { value: "↑ 42%", label: "User Growth", color: "green" },
                { value: "+ 412", label: "New Registrations", color: "green" },
                { value: "+ 24%", label: "Active Users", color: "green" }
            ]
        }
    },

    // 3. Vault Statistics Grouped Bar Chart Dataset
    vaultStatistics: {
        "30d": {
            labels: ["13 Aug", "20 Aug", "27 Aug", "03 Sep", "10 Sep"],
            series: {
                personal: [70, 110, 145, 120, 140],
                family: [55, 40, 60, 50, 75],
                business: [18, 25, 45, 30, 95]
            },
            max: 200,
            step: 50,
            stats: [
                { id: "stat-total", icon: "shield-purple", value: "892", label: "Total Vaults", trend: "↑ 15%" },
                { id: "stat-active", icon: "lock-orange", value: "624", label: "Active Vaults", trend: "70.0%" },
                { id: "stat-archived", icon: "hourglass-red", value: "268", label: "Archived Vaults", trend: "30.0%" }
            ]
        },
        "7d": {
            labels: ["06 Sep", "07 Sep", "08 Sep", "09 Sep", "10 Sep", "11 Sep", "12 Sep"],
            series: {
                personal: [22, 28, 30, 24, 32, 28, 35],
                family: [12, 15, 18, 14, 16, 15, 20],
                business: [8, 10, 12, 9, 14, 12, 18]
            },
            max: 50,
            step: 10,
            stats: [
                { id: "stat-total", icon: "shield-purple", value: "892", label: "Total Vaults", trend: "↑ 4.2%" },
                { id: "stat-active", icon: "lock-orange", value: "624", label: "Active Vaults", trend: "70.0%" },
                { id: "stat-archived", icon: "hourglass-red", value: "268", label: "Archived Vaults", trend: "30.0%" }
            ]
        },
        "90d": {
            labels: ["Jun", "Jul", "Aug", "Sep"],
            series: {
                personal: [180, 260, 380, 480],
                family: [90, 130, 175, 240],
                business: [45, 70, 110, 172]
            },
            max: 500,
            step: 100,
            stats: [
                { id: "stat-total", icon: "shield-purple", value: "892", label: "Total Vaults", trend: "↑ 38%" },
                { id: "stat-active", icon: "lock-orange", value: "624", label: "Active Vaults", trend: "70.0%" },
                { id: "stat-archived", icon: "hourglass-red", value: "268", label: "Archived Vaults", trend: "30.0%" }
            ]
        }
    },

    // 4. User Distribution Donut Chart
    userDistribution: {
        total: 1248,
        totalLabel: "Users",
        segments: [
            { label: "Owners", percent: 52.3, count: 653, color: "#3B82F6", darkColor: "#38BDF8" },
            { label: "Trustees", percent: 28.1, count: 351, color: "#00D9A5", darkColor: "#00D9A5" },
            { label: "Pending Verification", percent: 12.4, count: 155, color: "#F59E0B", darkColor: "#F5A84B" },
            { label: "Suspended", percent: 4.7, count: 59, color: "#EF4444", darkColor: "#FF5757" },
            { label: "Others", percent: 2.5, count: 30, color: "#8B5CF6", darkColor: "#A78BFA" }
        ]
    },

    // 5. Geographic Distribution (India Region Focus)
    geographicDistribution: {
        country: "India",
        regions: [
            { name: "Gujarat", percent: 28, count: 350 },
            { name: "Maharashtra", percent: 18, count: 225 },
            { name: "Delhi", percent: 12, count: 150 },
            { name: "Karnataka", percent: 10, count: 125 },
            { name: "Others", percent: 32, count: 398 }
        ],
        coordinates: [
            { name: "Gujarat", x: 62, y: 135, r: 8, active: true },
            { name: "Maharashtra", x: 80, y: 170, r: 7, active: true },
            { name: "Delhi", x: 92, y: 85, r: 6, active: true },
            { name: "Karnataka", x: 88, y: 220, r: 6, active: true },
            { name: "Tamil Nadu", x: 96, y: 245, r: 5, active: false },
            { name: "West Bengal", x: 155, y: 135, r: 5, active: false }
        ]
    },

    // 6. Security Overview (4 Mini Cards)
    securityOverview: {
        "30d": [
            {
                id: "sec-events",
                label: "Security Events",
                value: 47,
                trend: "↓ 32%",
                trendDirection: "down",
                icon: "alert-triangle",
                cardClass: "card-sec-red"
            },
            {
                id: "sec-failed",
                label: "Failed Logins",
                value: 19,
                trend: "↓ 56%",
                trendDirection: "down",
                icon: "lock",
                cardClass: "card-sec-orange"
            },
            {
                id: "sec-breaches",
                label: "Data Breaches",
                value: 0,
                trend: "0%",
                trendDirection: "neutral",
                icon: "shield-check",
                cardClass: "card-sec-green"
            },
            {
                id: "sec-audit",
                label: "Audit Actions",
                value: "1,284",
                trend: "↑ 22%",
                trendDirection: "up",
                icon: "eye",
                cardClass: "card-sec-blue"
            }
        ]
    },

    // 7. System Usage Trends (Multi-series Lines)
    systemUsageTrends: {
        "30d": {
            labels: ["13 Aug", "20 Aug", "27 Aug", "03 Sep", "10 Sep"],
            series: [
                { name: "CPU Usage", color: "#3B82F6", darkColor: "#38BDF8", values: [38, 55, 48, 62, 58] },
                { name: "Memory Usage", color: "#8B5CF6", darkColor: "#C084FC", values: [60, 48, 54, 45, 52] },
                { name: "Storage Usage", color: "#00D9A5", darkColor: "#00D9A5", values: [42, 45, 48, 49, 49] },
                { name: "Network I/O", color: "#F59E0B", darkColor: "#F5A84B", values: [15, 22, 18, 25, 20] }
            ],
            ySteps: [0, 25, 50, 75, 100]
        },
        "7d": {
            labels: ["06 Sep", "07 Sep", "08 Sep", "09 Sep", "10 Sep", "11 Sep", "12 Sep"],
            series: [
                { name: "CPU Usage", color: "#3B82F6", darkColor: "#38BDF8", values: [45, 48, 52, 58, 62, 54, 58] },
                { name: "Memory Usage", color: "#8B5CF6", darkColor: "#C084FC", values: [50, 52, 50, 48, 52, 54, 52] },
                { name: "Storage Usage", color: "#00D9A5", darkColor: "#00D9A5", values: [48, 48, 49, 49, 49, 49, 49] },
                { name: "Network I/O", color: "#F59E0B", darkColor: "#F5A84B", values: [18, 20, 22, 26, 24, 21, 20] }
            ],
            ySteps: [0, 25, 50, 75, 100]
        },
        "90d": {
            labels: ["Jun", "Jul", "Aug", "Sep"],
            series: [
                { name: "CPU Usage", color: "#3B82F6", darkColor: "#38BDF8", values: [32, 44, 52, 58] },
                { name: "Memory Usage", color: "#8B5CF6", darkColor: "#C084FC", values: [42, 46, 50, 52] },
                { name: "Storage Usage", color: "#00D9A5", darkColor: "#00D9A5", values: [35, 40, 46, 49] },
                { name: "Network I/O", color: "#F59E0B", darkColor: "#F5A84B", values: [12, 16, 20, 20] }
            ],
            ySteps: [0, 25, 50, 75, 100]
        }
    },

    // 8. Recent Activity Table Log
    recentActivity: [
        {
            time: "12 Sep, 10:24 AM",
            event: "User Registered",
            details: "rohit@example.com",
            category: "user"
        },
        {
            time: "12 Sep, 09:18 AM",
            event: "Vault Created",
            details: "Personal Vault",
            category: "vault"
        },
        {
            time: "12 Sep, 08:42 AM",
            event: "Failed Login",
            details: "IP: 117.248.12.45",
            category: "security"
        },
        {
            time: "11 Sep, 11:30 PM",
            event: "Trustee Added",
            details: "meera@example.com",
            category: "trustee"
        },
        {
            time: "11 Sep, 10:15 PM",
            event: "Settings Changed",
            details: "Security Policy Updated",
            category: "system"
        }
    ],

    // 9. Search Index for Global Search
    searchIndex: [
        { title: "User Growth Analytics", category: "Chart", link: "#user-growth-card", icon: "user" },
        { title: "Vault Statistics Breakdown", category: "Chart", link: "#vault-stats-card", icon: "database" },
        { title: "User Role Distribution (Donut)", category: "Chart", link: "#user-dist-card", icon: "pie-chart" },
        { title: "Geographic Distribution (India)", category: "Demographics", link: "#geo-dist-card", icon: "globe" },
        { title: "Security Overview Metrics", category: "Security", link: "#sec-overview-card", icon: "shield" },
        { title: "System Usage Trends (CPU/RAM/IO)", category: "Infrastructure", link: "#usage-trends-card", icon: "activity" },
        { title: "Rohit Sharma (rohit@example.com)", category: "User", link: "../User Management/index.html", icon: "user" },
        { title: "Meera Patel (meera@example.com)", category: "Trustee", link: "../User Management/index.html", icon: "key" },
        { title: "Personal Vault #AV-982", category: "Vault", link: "../Dashboard/index.html", icon: "lock" },
        { title: "Suspicious IP Blocked (117.248.12.45)", category: "Security", link: "../Audit Logs/index.html", icon: "alert-triangle" }
    ]
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AegisAnalyticsData;
}
