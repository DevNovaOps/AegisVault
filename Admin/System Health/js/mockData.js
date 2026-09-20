/**
 * AegisVault System Health Module — Mock Dataset
 * 
 * Pixel-accurate enterprise dataset matching the reference design screenshots.
 * Provides realistic mock data for:
 * - 5 KPI Overview Metrics (Uptime, Users, Storage, CPU, Memory)
 * - 9 Core Platform Services with telemetry and status indicators
 * - Resource Usage historical datasets (CPU, Memory, Disk, Network I/O across 24h, 1h, 7d)
 * - Recent System Events log with severity indicators
 * - Server & Infrastructure specifications
 */

const AegisHealthMockData = {
    // 1. Overall System Status Banner
    overallStatus: {
        status: "All Systems Operational",
        statusCode: "operational",
        healthPercentage: 99.8,
        operationalCount: 9,
        totalServices: 9,
        lastUpdated: "12 Sep 2025, 10:24 AM"
    },

    // 2. Overview Metrics (5 Top Cards)
    overviewMetrics: {
        systemUptime: {
            title: "System Uptime",
            value: "99.8%",
            trend: "↑ 0.2%",
            trendType: "positive",
            subtext: "Last 30 days",
            icon: "pulse"
        },
        activeUsers: {
            title: "Active Users",
            value: "1,248",
            trend: "↑ 12%",
            trendType: "positive",
            subtext: "Currently online: 86",
            icon: "users"
        },
        storageUsed: {
            title: "Storage Used",
            value: "245 GB",
            percent: 49,
            total: "500 GB",
            progressLabel: "500 GB",
            percentLabel: "49%",
            subtext: "Storage Used",
            icon: "database"
        },
        cpuUsage: {
            title: "CPU Usage",
            value: "32%",
            trend: "↓ 18%",
            trendType: "positive",
            subtext: "8 vCPU",
            icon: "cpu"
        },
        memoryUsage: {
            title: "Memory Usage",
            value: "64%",
            trend: "↓ 12%",
            trendType: "positive",
            subtext: "10.2 GB / 16 GB",
            icon: "memory"
        }
    },

    // 3. Service Status Table (9 Services matching reference design)
    services: [
        {
            id: "srv-web",
            name: "Web Application",
            icon: "globe",
            status: "Operational",
            statusType: "operational",
            uptime: "99.9%",
            responseTime: "120 ms",
            lastChecked: "12 Sep, 10:24 AM",
            version: "v2.4.1",
            requests: "14,280 / min",
            errorRate: "0.02%",
            description: "Frontend reverse proxy, client-side cryptographic bundles, and static asset distribution CDN."
        },
        {
            id: "srv-api",
            name: "API Service",
            icon: "code",
            status: "Operational",
            statusType: "operational",
            uptime: "99.8%",
            responseTime: "85 ms",
            lastChecked: "12 Sep, 10:24 AM",
            version: "v2.4.0",
            requests: "28,640 / min",
            errorRate: "0.05%",
            description: "Django REST Gateway handling authenticated RPCs, trustee challenges, and Shamir quorum calls."
        },
        {
            id: "srv-db-primary",
            name: "Database (Primary)",
            icon: "database",
            status: "Operational",
            statusType: "operational",
            uptime: "99.9%",
            responseTime: "42 ms",
            lastChecked: "12 Sep, 10:24 AM",
            version: "PostgreSQL 15.6",
            requests: "18,400 / min",
            errorRate: "0.00%",
            description: "Master transactional ACID database engine with hardware-level AES-256 encrypted block storage."
        },
        {
            id: "srv-db-replica",
            name: "Database (Replica)",
            icon: "database",
            status: "Operational",
            statusType: "operational",
            uptime: "99.8%",
            responseTime: "46 ms",
            lastChecked: "12 Sep, 10:24 AM",
            version: "PostgreSQL 15.6 (Read-Only)",
            requests: "32,100 / min",
            errorRate: "0.00%",
            description: "Read-only replica cluster in ap-south-1 availability zone 2. Replication streaming lag: 4ms."
        },
        {
            id: "srv-auth",
            name: "Authentication Service",
            icon: "key",
            status: "Operational",
            statusType: "operational",
            uptime: "99.9%",
            responseTime: "98 ms",
            lastChecked: "12 Sep, 10:24 AM",
            version: "v1.8.2",
            requests: "4,200 / min",
            errorRate: "0.01%",
            description: "FIDO2 WebAuthn authentication protocol, hardware security keys, and biometric identity verification."
        },
        {
            id: "srv-email",
            name: "Email / SMS Service",
            icon: "mail",
            status: "Operational",
            statusType: "operational",
            uptime: "99.7%",
            responseTime: "210 ms",
            lastChecked: "12 Sep, 10:24 AM",
            version: "v1.2.0",
            requests: "1,450 / min",
            errorRate: "0.10%",
            description: "Encrypted transactional notification relay for heartbeats, trustee quorum invitations, and emergency warnings."
        },
        {
            id: "srv-backup",
            name: "Backup Service",
            icon: "cloud-backup",
            status: "Operational",
            statusType: "operational",
            uptime: "99.9%",
            responseTime: "1.2 s",
            lastChecked: "12 Sep, 10:24 AM",
            version: "v3.1.0",
            requests: "Scheduled Daily",
            errorRate: "0.00%",
            description: "Automated cryptographic snapshot pipeline exporting cold encrypted storage archives."
        },
        {
            id: "srv-storage",
            name: "File Storage",
            icon: "folder",
            status: "Operational",
            statusType: "operational",
            uptime: "99.8%",
            responseTime: "150 ms",
            lastChecked: "12 Sep, 10:24 AM",
            version: "S3-Compatible v2",
            requests: "8,950 / min",
            errorRate: "0.01%",
            description: "Multi-region encrypted BLOB repository holding zero-knowledge ciphertext assets and digital inheritances."
        },
        {
            id: "srv-monitor",
            name: "Monitoring Agent",
            icon: "shield-check",
            status: "Operational",
            statusType: "operational",
            uptime: "99.9%",
            responseTime: "75 ms",
            lastChecked: "12 Sep, 10:24 AM",
            version: "v2.0.4",
            requests: "Sweep: 10s",
            errorRate: "0.00%",
            description: "Local daemon collecting health telemetry, CPU load, memory pressure, and anomalous socket connections."
        }
    ],

    // 4. Resource Usage Datasets (4 Interactive Area Sparkline Charts)
    resourceUsage: {
        "24h": {
            cpu: {
                current: "32%",
                color: "#F59E0B",
                colorDark: "#F5A84B",
                min: 0,
                max: 100,
                yTicks: ["100%", "50%", "0%"],
                xLabels: ["12AM", "4AM", "8AM", "12PM", "4PM", "8PM"],
                dataPoints: [28, 25, 29, 27, 34, 38, 42, 36, 33, 31, 35, 32]
            },
            memory: {
                current: "64%",
                color: "#3B82F6",
                colorDark: "#38BDF8",
                min: 0,
                max: 100,
                yTicks: ["100%", "50%", "0%"],
                xLabels: ["12AM", "4AM", "8AM", "12PM", "4PM", "8PM"],
                dataPoints: [48, 50, 52, 53, 56, 58, 61, 62, 63, 65, 64, 64]
            },
            disk: {
                current: "49%",
                color: "#10B981",
                colorDark: "#00D9A5",
                min: 0,
                max: 100,
                yTicks: ["100%", "50%", "0%"],
                xLabels: ["12AM", "4AM", "8AM", "12PM", "4PM", "8PM"],
                dataPoints: [42, 43, 44, 45, 46, 47, 48, 48, 49, 49, 49, 49]
            },
            network: {
                current: "12.4 MB/s",
                color: "#A855F7",
                colorDark: "#C084FC",
                min: 0,
                max: 20,
                yTicks: ["20MB", "10MB", "0MB"],
                xLabels: ["12AM", "4AM", "8AM", "12PM", "4PM", "8PM"],
                dataPoints: [7.8, 8.2, 7.5, 9.4, 11.2, 13.5, 12.0, 14.8, 16.2, 13.0, 14.1, 12.4]
            }
        },
        "1h": {
            cpu: {
                current: "31%",
                color: "#F59E0B",
                colorDark: "#F5A84B",
                min: 0,
                max: 100,
                yTicks: ["100%", "50%", "0%"],
                xLabels: ["10:00", "10:10", "10:20", "10:30", "10:40", "10:50"],
                dataPoints: [30, 32, 29, 34, 31, 31]
            },
            memory: {
                current: "64%",
                color: "#3B82F6",
                colorDark: "#38BDF8",
                min: 0,
                max: 100,
                yTicks: ["100%", "50%", "0%"],
                xLabels: ["10:00", "10:10", "10:20", "10:30", "10:40", "10:50"],
                dataPoints: [63, 64, 64, 64, 64, 64]
            },
            disk: {
                current: "49%",
                color: "#10B981",
                colorDark: "#00D9A5",
                min: 0,
                max: 100,
                yTicks: ["100%", "50%", "0%"],
                xLabels: ["10:00", "10:10", "10:20", "10:30", "10:40", "10:50"],
                dataPoints: [49, 49, 49, 49, 49, 49]
            },
            network: {
                current: "11.8 MB/s",
                color: "#A855F7",
                colorDark: "#C084FC",
                min: 0,
                max: 20,
                yTicks: ["20MB", "10MB", "0MB"],
                xLabels: ["10:00", "10:10", "10:20", "10:30", "10:40", "10:50"],
                dataPoints: [10.2, 11.0, 12.5, 13.1, 11.4, 11.8]
            }
        },
        "7d": {
            cpu: {
                current: "34%",
                color: "#F59E0B",
                colorDark: "#F5A84B",
                min: 0,
                max: 100,
                yTicks: ["100%", "50%", "0%"],
                xLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                dataPoints: [30, 36, 32, 40, 38, 28, 34]
            },
            memory: {
                current: "64%",
                color: "#3B82F6",
                colorDark: "#38BDF8",
                min: 0,
                max: 100,
                yTicks: ["100%", "50%", "0%"],
                xLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                dataPoints: [58, 60, 61, 62, 63, 64, 64]
            },
            disk: {
                current: "49%",
                color: "#10B981",
                colorDark: "#00D9A5",
                min: 0,
                max: 100,
                yTicks: ["100%", "50%", "0%"],
                xLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                dataPoints: [44, 45, 46, 47, 48, 49, 49]
            },
            network: {
                current: "13.2 MB/s",
                color: "#A855F7",
                colorDark: "#C084FC",
                min: 0,
                max: 20,
                yTicks: ["20MB", "10MB", "0MB"],
                xLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                dataPoints: [11.2, 14.5, 12.8, 15.6, 14.2, 10.5, 13.2]
            }
        }
    },

    // 5. Recent System Events (5 Rows matching reference screenshot)
    recentEvents: [
        {
            id: "evt-01",
            time: "12 Sep 2025, 10:22 AM",
            level: "INFO",
            levelType: "info",
            service: "Backup Service",
            message: "Daily backup completed successfully",
            detail: "AES-256 automated database snapshot and zero-knowledge BLOB store archived to cold redundancy vault. Volume size: 245 GB verified with SHA-256 checksum integrity."
        },
        {
            id: "evt-02",
            time: "12 Sep 2025, 09:48 AM",
            level: "WARN",
            levelType: "warn",
            service: "API Service",
            message: "High response time detected (320 ms)",
            detail: "Temporary request spike detected on endpoint /api/v1/custody/heartbeat. Automatic autoscaling policy triggered 2 auxiliary worker containers to normalize latency."
        },
        {
            id: "evt-03",
            time: "12 Sep 2025, 08:15 AM",
            level: "INFO",
            levelType: "info",
            service: "Database",
            message: "Replica sync completed",
            detail: "PostgreSQL WAL streaming replication synchronization completed between primary master node and secondary read replica. Current replication lag: 4ms."
        },
        {
            id: "evt-04",
            time: "12 Sep 2025, 06:30 AM",
            level: "INFO",
            levelType: "info",
            service: "Monitoring",
            message: "All systems healthy",
            detail: "Automated comprehensive infrastructure sweep completed across 9 microservices, 3 availability zones, and HSM key attestation interfaces. 0 anomalies detected."
        },
        {
            id: "evt-05",
            time: "12 Sep 2025, 02:12 AM",
            level: "ERROR",
            levelType: "error",
            service: "Email Service",
            message: "Temporary connection failure (resolved)",
            detail: "Primary SMTP delivery relay socket timed out (504 Gateway Timeout). Circuit breaker immediately rerouted pending custodian notification payloads to secondary backup relay."
        }
    ],

    // 6. System Information (2-Column Key/Value Grid)
    systemInfo: {
        col1: [
            { label: "Environment", value: "Production" },
            { label: "Version", value: "v2.4.1" },
            { label: "Region", value: "Mumbai, India (ap-south-1)" },
            { label: "Uptime Since", value: "24 Aug 2025, 04:12 AM" },
            { label: "Total Users", value: "1,248" },
            { label: "Total Vaults", value: "892" },
            { label: "Total Trustees", value: "614" }
        ],
        col2: [
            { label: "Server Load", value: "0.32, 0.28, 0.21" },
            { label: "OS", value: "Ubuntu 22.04 LTS" },
            { label: "Node Version", value: "v20.11.1" },
            { label: "Database", value: "PostgreSQL 15.6" },
            { label: "Storage", value: "245 GB / 500 GB" },
            { label: "Last Restart", value: "24 Aug 2025" },
            { label: "Next Maintenance", value: "20 Sep 2025, 02:00 AM" }
        ]
    },

    // 7. Notifications Feed
    notifications: [
        {
            id: "notif-01",
            title: "Cluster Auto-Recovery Nominal",
            message: "Daily infrastructure sweep completed with 100% service uptime.",
            time: "10 mins ago",
            unread: true,
            type: "success"
        }
    ],

    // 8. Search Index
    searchIndex: [
        { title: "Web Application", category: "Services", snippet: "Status: Operational • 99.9% Uptime • 120ms Latency", id: "srv-web", type: "service" },
        { title: "API Service", category: "Services", snippet: "Status: Operational • 99.8% Uptime • 85ms Latency", id: "srv-api", type: "service" },
        { title: "Database (Primary)", category: "Services", snippet: "Status: Operational • 99.9% Uptime • 42ms Latency", id: "srv-db-primary", type: "service" },
        { title: "Database (Replica)", category: "Services", snippet: "Status: Operational • 99.8% Uptime • 46ms Latency", id: "srv-db-replica", type: "service" },
        { title: "Authentication Service", category: "Services", snippet: "Status: Operational • 99.9% Uptime • 98ms Latency", id: "srv-auth", type: "service" },
        { title: "Email / SMS Service", category: "Services", snippet: "Status: Operational • 99.7% Uptime • 210ms Latency", id: "srv-email", type: "service" },
        { title: "Backup Service", category: "Services", snippet: "Status: Operational • 99.9% Uptime • 1.2s Latency", id: "srv-backup", type: "service" },
        { title: "File Storage", category: "Services", snippet: "Status: Operational • 99.8% Uptime • 150ms Latency", id: "srv-storage", type: "service" },
        { title: "Monitoring Agent", category: "Services", snippet: "Status: Operational • 99.9% Uptime • 75ms Latency", id: "srv-monitor", type: "service" },
        { title: "Backup Completed", category: "Events", snippet: "12 Sep, 10:22 AM • Level: INFO • 245 GB verified", id: "evt-01", type: "event" },
        { title: "High Response Time", category: "Events", snippet: "12 Sep, 09:48 AM • Level: WARN • 320 ms spike", id: "evt-02", type: "event" },
        { title: "Replica Sync", category: "Events", snippet: "12 Sep, 08:15 AM • Level: INFO • WAL lag 4ms", id: "evt-03", type: "event" },
        { title: "Ubuntu 22.04 LTS", category: "System Info", snippet: "OS Distribution • Kernel 5.15.0 • ap-south-1", id: "sys-os", type: "info" }
    ]
};

window.AegisHealthMockData = AegisHealthMockData;
