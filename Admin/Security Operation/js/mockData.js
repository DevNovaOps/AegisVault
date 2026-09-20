/**
 * AegisVault Security Operations Module - Mock Data
 * Realistic enterprise security dataset matching the reference design.
 */

const AegisMockData = {
    // 1. Statistics Cards
    stats: {
        totalUsers: {
            value: "1,284",
            numericValue: 1284,
            change: "↑ 12%",
            changeType: "positive",
            subtitle: "+136 this month"
        },
        totalTrustees: {
            value: "5,732",
            numericValue: 5732,
            change: "↑ 18%",
            changeType: "positive",
            subtitle: "+876 this month"
        },
        securityEvents: {
            value: "47",
            numericValue: 47,
            change: "↑ 32%",
            changeType: "alert",
            subtitle: "+12 in last 24h"
        },
        failedLogins: {
            value: "19",
            numericValue: 19,
            change: "↑ 56%",
            changeType: "alert",
            subtitle: "in last 24h"
        },
        systemUptime: {
            value: "99.8%",
            numericValue: 99.8,
            status: "Healthy",
            statusType: "success"
        }
    },

    // 2. Recent Security Events Table
    securityEvents: [
        {
            id: "EVT-8942",
            time: "12 Sep 2025, 10:24 AM",
            event: "FAILED_LOGIN",
            eventType: "danger",
            user: "user123",
            userEmail: "user123@protonmail.com",
            details: "Invalid password (5 attempts)",
            status: "Blocked",
            statusType: "blocked",
            ip: "203.122.45.67",
            location: "Frankfurt, Germany",
            userAgent: "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0",
            hash: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
        },
        {
            id: "EVT-8941",
            time: "12 Sep 2025, 09:18 AM",
            event: "LOGIN",
            eventType: "info",
            user: "priya.shah",
            userEmail: "priya@example.com",
            details: "Login successful",
            status: "Success",
            statusType: "success",
            ip: "103.21.14.88",
            location: "Mumbai, India",
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            hash: "0x3e18a93e5b61a38f32a76f284bbad3a2938f36c84132840cf576628678644521"
        },
        {
            id: "EVT-8940",
            time: "12 Sep 2025, 08:42 AM",
            event: "TRUSTEE_ADDED",
            eventType: "purple",
            user: "rohan.mehta",
            userEmail: "rohan@example.com",
            details: "Added trustee: Father",
            status: "Success",
            statusType: "success",
            ip: "49.205.18.23",
            location: "Bengaluru, India",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/118.0.0.0 Safari/537.36",
            hash: "0xa81c95b4f2c002237e3d2319208a38c8230f8373b9872918e763138bca879f53"
        },
        {
            id: "EVT-8939",
            time: "11 Sep 2025, 11:30 AM",
            event: "STATE_CHANGED",
            eventType: "warning",
            user: "system",
            userEmail: "daemon@aegisvault.internal",
            details: "ACTIVE → GRACE PERIOD",
            status: "Warning",
            statusType: "warning",
            ip: "127.0.0.1 (Internal Cron)",
            location: "Custody Node Alpha (Zurich)",
            userAgent: "AegisProtocol/2.4.0 Daemon-Worker",
            hash: "0xbf563a218086a98718274a72d619a8264563829019280387bda1928374928172"
        },
        {
            id: "EVT-8938",
            time: "11 Sep 2025, 10:15 AM",
            event: "HEARTBEAT_MISSED",
            eventType: "coral",
            user: "amit.patel",
            userEmail: "amit@example.com",
            details: "Monthly heartbeat not received",
            status: "Warning",
            statusType: "warning",
            ip: "Internal Monitor",
            location: "Protocol Heartbeat Sentinel",
            userAgent: "AegisProtocol/HeartbeatScanner",
            hash: "0x8927163820194827104928374019283740192837401928374019283740192837"
        },
        {
            id: "EVT-8937",
            time: "11 Sep 2025, 07:21 AM",
            event: "ACCOUNT_SUSPENDED",
            eventType: "danger",
            user: "user789",
            userEmail: "user789@securevault.io",
            details: "Multiple failed login attempts",
            status: "Suspended",
            statusType: "suspended",
            ip: "117.248.12.45",
            location: "Delhi, India",
            userAgent: "Python-urllib/3.10 requests/2.28.1",
            hash: "0x1293847291039482019384720193847201938472019384720193847201938472"
        },
        {
            id: "EVT-8936",
            time: "11 Sep 2025, 03:12 AM",
            event: "SHARE_SUBMITTED",
            eventType: "teal",
            user: "meera.shah",
            userEmail: "meera.shah@example.com",
            details: "Submitted trustee share (3/5)",
            status: "Success",
            statusType: "success",
            ip: "152.57.19.102",
            location: "Ahmedabad, India",
            userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
            hash: "0x5829103948201938472019384720193847201938472019384720193847201938"
        },
        {
            id: "EVT-8935",
            time: "10 Sep 2025, 06:45 AM",
            event: "VAULT_CREATED",
            eventType: "blue",
            user: "kush.patel",
            userEmail: "kush@example.com",
            details: "New vault created",
            status: "Success",
            statusType: "success",
            ip: "103.88.23.19",
            location: "Surat, India",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/118.0.2088.76",
            hash: "0x9482019384720193847201938472019384720193847201938472019384720193"
        },
        // Extended items for "View All" modal & live search
        {
            id: "EVT-8934",
            time: "10 Sep 2025, 04:15 AM",
            event: "KEY_ROTATION",
            eventType: "purple",
            user: "system",
            userEmail: "kms@aegisvault.internal",
            details: "Protocol epoch key rotation completed",
            status: "Success",
            statusType: "success",
            ip: "127.0.0.1 (KMS HSM)",
            location: "Hardware Security Module Vault",
            userAgent: "AegisKMS/HSM-Enclave",
            hash: "0x7382910394820193847201938472019384720193847201938472019384720193"
        },
        {
            id: "EVT-8933",
            time: "09 Sep 2025, 11:20 PM",
            event: "BACKUP_COMPLETED",
            eventType: "info",
            user: "system",
            userEmail: "backup@aegisvault.internal",
            details: "Encrypted snapshot synchronized to Cold Storage",
            status: "Success",
            statusType: "success",
            ip: "10.0.4.12 (Backup Pod)",
            location: "Stockholm, Sweden",
            userAgent: "AegisStorage/SnapshotReplica",
            hash: "0x6291039482019384720193847201938472019384720193847201938472019384"
        }
    ],

    // 3. System Health Services & Metrics
    systemHealth: {
        overallStatus: "All Systems Operational",
        overallStatusType: "success",
        gauges: [
            { id: "uptime", name: "Server Uptime", value: "99.8%", percent: 99.8, color: "#00D9A5" },
            { id: "database", name: "Database", value: "97%", percent: 97.0, color: "#00D9A5" },
            { id: "encryption", name: "Encryption Service", value: "100%", percent: 100.0, color: "#00D9A5" },
            { id: "notification", name: "Notification Service", value: "99%", percent: 99.0, color: "#00D9A5" }
        ],
        services: [
            {
                id: "api",
                name: "API Services",
                status: "Operational",
                statusType: "operational",
                latency: "24ms",
                load: "31%",
                instances: "8 active pods",
                lastChecked: "Just now",
                description: "REST & GraphQL Gateway handling client authentication and encrypted metadata."
            },
            {
                id: "background-jobs",
                name: "Background Jobs",
                status: "Operational",
                statusType: "operational",
                latency: "12ms",
                load: "19%",
                instances: "4 workers",
                lastChecked: "Just now",
                description: "Celery & Redis queue executors monitoring heartbeat countdowns and grace transitions."
            },
            {
                id: "email-sms",
                name: "Email / SMS Service",
                status: "Operational",
                statusType: "operational",
                latency: "85ms",
                load: "12%",
                instances: "Multi-region fallback",
                lastChecked: "1 min ago",
                description: "Transactional notifications for OTP verification, heartbeat reminders, and trustee alerts."
            },
            {
                id: "backup",
                name: "Backup Service",
                status: "Operational",
                statusType: "operational",
                latency: "45ms",
                load: "8%",
                instances: "Geo-redundant cold storage",
                lastChecked: "5 mins ago",
                description: "Continuous encrypted zero-knowledge differential backup pipeline."
            }
        ]
    },

    // 4. Failed Login Monitoring Data & Chart
    failedLogins: {
        count24h: 19,
        percentageIncrease: "↑ 56%",
        chartTimeline: [
            { time: "12AM", attempts: 3, heightPct: 15 },
            { time: "2AM", attempts: 2, heightPct: 10 },
            { time: "4AM", attempts: 4, heightPct: 20 },
            { time: "6AM", attempts: 5, heightPct: 25 },
            { time: "8AM", attempts: 18, heightPct: 90, isPeak: true },
            { time: "10AM", attempts: 7, heightPct: 35 },
            { time: "12PM", attempts: 12, heightPct: 60 },
            { time: "2PM", attempts: 6, heightPct: 30 },
            { time: "4PM", attempts: 15, heightPct: 75 },
            { time: "6PM", attempts: 4, heightPct: 20 },
            { time: "8PM", attempts: 11, heightPct: 55 },
            { time: "10PM", attempts: 2, heightPct: 10 }
        ],
        topIPs: [
            {
                ip: "203.122.45.67",
                attempts: 8,
                status: "Blocked",
                location: "Frankfurt, Germany",
                isp: "DigitalOcean Cloud Hosting",
                firstSeen: "12 Sep 2025, 08:14 AM",
                lastAttempt: "12 Sep 2025, 10:24 AM",
                targetAccount: "user123, admin_root",
                recommendedAction: "Permanent CIDR Firewall Blacklist"
            },
            {
                ip: "117.248.12.45",
                attempts: 5,
                status: "Suspended",
                location: "Delhi, India",
                isp: "Bharti Airtel Broadband",
                firstSeen: "11 Sep 2025, 05:30 AM",
                lastAttempt: "11 Sep 2025, 07:21 AM",
                targetAccount: "user789",
                recommendedAction: "Require Hardware MFA Verification"
            },
            {
                ip: "49.205.18.23",
                attempts: 3,
                status: "Monitored",
                location: "Bengaluru, India",
                isp: "Reliance Jio Infocomm",
                firstSeen: "11 Sep 2025, 02:11 PM",
                lastAttempt: "12 Sep 2025, 01:15 AM",
                targetAccount: "rohan.mehta",
                recommendedAction: "Issue Captcha Challenge on Next Login"
            }
        ]
    },

    // 5. User Management Table
    users: [
        {
            id: "USR-101",
            name: "Amit Patel",
            email: "amit@example.com",
            status: "Active",
            statusType: "active",
            joined: "10 Aug 2025",
            vaultCount: 2,
            trusteesCount: 3,
            lastLogin: "11 Sep 2025, 10:15 AM",
            role: "Vault Owner",
            heartbeatStatus: "Due in 3 Days"
        },
        {
            id: "USR-102",
            name: "Priya Shah",
            email: "priya@example.com",
            status: "Active",
            statusType: "active",
            joined: "15 Jul 2025",
            vaultCount: 1,
            trusteesCount: 4,
            lastLogin: "12 Sep 2025, 09:18 AM",
            role: "Vault Owner",
            heartbeatStatus: "Healthy (Verified)"
        },
        {
            id: "USR-103",
            name: "Rohan Mehta",
            email: "rohan@example.com",
            status: "Suspended",
            statusType: "suspended",
            joined: "02 Sep 2025",
            vaultCount: 1,
            trusteesCount: 2,
            lastLogin: "11 Sep 2025, 08:30 AM",
            role: "Vault Owner",
            heartbeatStatus: "Suspended (Investigating)"
        },
        {
            id: "USR-104",
            name: "Kush Patel",
            email: "kush@example.com",
            status: "Active",
            statusType: "active",
            joined: "28 Jun 2025",
            vaultCount: 3,
            trusteesCount: 5,
            lastLogin: "10 Sep 2025, 06:45 AM",
            role: "Vault Owner",
            heartbeatStatus: "Healthy (Verified)"
        },
        {
            id: "USR-105",
            name: "Neha Desai",
            email: "neha@example.com",
            status: "Active",
            statusType: "active",
            joined: "18 Aug 2025",
            vaultCount: 1,
            trusteesCount: 3,
            lastLogin: "09 Sep 2025, 05:12 PM",
            role: "Vault Owner",
            heartbeatStatus: "Healthy (Verified)"
        },
        // Additional mock users for search / View All
        {
            id: "USR-106",
            name: "Devang Joshi",
            email: "devang@example.com",
            status: "Active",
            statusType: "active",
            joined: "04 Sep 2025",
            vaultCount: 1,
            trusteesCount: 2,
            lastLogin: "12 Sep 2025, 11:00 AM",
            role: "Vault Owner",
            heartbeatStatus: "Healthy (Verified)"
        },
        {
            id: "USR-107",
            name: "Ananya Trivedi",
            email: "ananya@example.com",
            status: "Pending",
            statusType: "pending",
            joined: "11 Sep 2025",
            vaultCount: 0,
            trusteesCount: 0,
            lastLogin: "Never",
            role: "New Registrant",
            heartbeatStatus: "Awaiting Verification"
        }
    ],

    // 6. Trustee Management Table
    trustees: [
        {
            id: "TRS-301",
            name: "Rakesh Patel",
            linkedUser: "amit@example.com",
            relation: "Father",
            status: "Verified",
            statusType: "verified",
            phone: "+91 98250 XXXXX",
            sharesHeld: "1 / 5 Shamir Share",
            addedDate: "12 Aug 2025",
            verificationMethod: "National ID + Email OTP"
        },
        {
            id: "TRS-302",
            name: "Meera Shah",
            linkedUser: "priya@example.com",
            relation: "Mother",
            status: "Verified",
            statusType: "verified",
            phone: "+91 94260 XXXXX",
            sharesHeld: "1 / 4 Shamir Share",
            addedDate: "16 Jul 2025",
            verificationMethod: "Biometric + Video Confirmation"
        },
        {
            id: "TRS-303",
            name: "Karan Mehta",
            linkedUser: "rohan@example.com",
            relation: "Brother",
            status: "Pending",
            statusType: "pending",
            phone: "+91 98980 XXXXX",
            sharesHeld: "Awaiting Confirmation",
            addedDate: "03 Sep 2025",
            verificationMethod: "Email Link Sent"
        },
        {
            id: "TRS-304",
            name: "Disha Kothari",
            linkedUser: "kush@example.com",
            relation: "Lawyer",
            status: "Verified",
            statusType: "verified",
            phone: "+91 97270 XXXXX",
            sharesHeld: "1 / 5 Shamir Share",
            addedDate: "01 Jul 2025",
            verificationMethod: "Bar Council License + Escrow Check"
        },
        {
            id: "TRS-305",
            name: "Erik Sharma",
            linkedUser: "neha@example.com",
            relation: "Executor",
            status: "Verified",
            statusType: "verified",
            phone: "+91 99090 XXXXX",
            sharesHeld: "1 / 3 Shamir Share",
            addedDate: "20 Aug 2025",
            verificationMethod: "Legal Identity Keypair"
        },
        // Additional mock trustees for search / View All
        {
            id: "TRS-306",
            name: "Sanjay Patel",
            linkedUser: "amit@example.com",
            relation: "Uncle",
            status: "Verified",
            statusType: "verified",
            phone: "+91 98765 XXXXX",
            sharesHeld: "1 / 5 Shamir Share",
            addedDate: "15 Aug 2025",
            verificationMethod: "SMS + Email OTP"
        }
    ],

    // 7. Security Notifications Dropdown Mock Data
    notifications: [
        {
            id: "NOTIF-01",
            title: "Multiple Failed Logins Blocked",
            desc: "IP 203.122.45.67 was blocked after 5 consecutive invalid credentials.",
            time: "10 mins ago",
            type: "danger",
            unread: true
        },
        {
            id: "NOTIF-02",
            title: "Vault State Changed to Grace Period",
            desc: "Automated protocol trigger for user amit.patel (Heartbeat threshold reached).",
            time: "25 mins ago",
            type: "warning",
            unread: true
        },
        {
            id: "NOTIF-03",
            title: "Trustee Share Submitted (3/5)",
            desc: "Trustee Meera Shah submitted cryptographic share for recovery verification.",
            time: "1 hour ago",
            type: "success",
            unread: true
        },
        {
            id: "NOTIF-04",
            title: "Daily Cold Storage Backup Completed",
            desc: "Zero-knowledge differential backup verified across geo-replicated pods.",
            time: "5 hours ago",
            type: "info",
            unread: false
        }
    ]
};

// Export to global scope
window.AegisMockData = AegisMockData;
