/**
 * AegisVault — Audit Logs Module
 * Mock Data Store
 * Matches exact logs and statistics visible in reference screenshots.
 */

window.AegisAuditStats = {
    totalLogs: 12482,
    totalTrend: "↑ 18%",
    totalSubtext: "+1,902 this month",
    userActions: 6214,
    userTrend: "↑ 12%",
    userSubtext: "49.8% of total",
    vaultActions: 3156,
    vaultTrend: "↑ 25%",
    vaultSubtext: "25.3% of total",
    securityEvents: 1892,
    securityTrend: "↑ 40%",
    securitySubtext: "15.2% of total",
    adminActions: 1220,
    adminTrend: "↑ 8%",
    adminSubtext: "9.7% of total"
};

window.AegisMockLogs = [
    {
        id: "LOG-012482",
        index: 1,
        timestamp: "12 Sep 2025, 10:24 AM",
        dateSort: "2025-09-12T10:24:00",
        user: "admin@aegisvault.com",
        userName: "System Administrator",
        action: "LOGIN",
        actionLabel: "User Login",
        actionType: "login",
        module: "Auth",
        moduleFull: "Authentication",
        details: "Admin logged in",
        description: "Admin logged in to the system",
        ipAddress: "203.122.45.67",
        location: "Vadodara, Gujarat, India",
        device: "Windows (Chrome 128.0)",
        sessionId: "a8f3d2e9-7c1b-4e2a-9f0d-1e8c7b6a5d4e",
        status: "Success",
        relatedLogs: [
            { title: "Settings updated", time: "12 Sep 2025, 10:28 AM", icon: "settings" },
            { title: "Accessed audit logs", time: "12 Sep 2025, 10:30 AM", icon: "file" }
        ],
        rawData: {
            eventId: "LOG-012482",
            actor: { email: "admin@aegisvault.com", role: "System Administrator", authMethod: "FIDO2_Passkey" },
            action: "SYS_AUTH_SUCCESS",
            targetResource: "/admin/console",
            network: { ip: "203.122.45.67", geo: { city: "Vadodara", region: "Gujarat", country: "IN" } },
            client: { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0", tlsVersion: "TLSv1.3" },
            cryptography: { signatureValid: true, zeroKnowledgeVerified: true }
        }
    },
    {
        id: "LOG-012481",
        index: 2,
        timestamp: "12 Sep 2025, 09:18 AM",
        dateSort: "2025-09-12T09:18:00",
        user: "rohit.sharma@example.com",
        userName: "Rohit Sharma",
        action: "USER_UPDATE",
        actionLabel: "User Profile Updated",
        actionType: "user_update",
        module: "User",
        moduleFull: "User Management",
        details: "Updated profile info...",
        description: "Updated secondary contact and phone notification preferences",
        ipAddress: "117.248.12.45",
        location: "Mumbai, Maharashtra, India",
        device: "macOS (Safari 17.5)",
        sessionId: "c2e1b4f8-9a2d-4f1e-8e3b-5d9c8b7a6e5f",
        status: "Success",
        relatedLogs: [
            { title: "MFA challenge verified", time: "12 Sep 2025, 09:17 AM", icon: "shield" },
            { title: "Profile session refreshed", time: "12 Sep 2025, 09:20 AM", icon: "user" }
        ],
        rawData: {
            eventId: "LOG-012481",
            actor: { email: "rohit.sharma@example.com", role: "Vault Owner", userId: "USR001248" },
            action: "USER_METADATA_UPDATE",
            targetResource: "User/USR001248/Profile",
            network: { ip: "117.248.12.45", geo: { city: "Mumbai", region: "Maharashtra", country: "IN" } },
            client: { userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) Version/17.5 Safari/605.1.15" }
        }
    },
    {
        id: "LOG-012480",
        index: 3,
        timestamp: "12 Sep 2025, 08:42 AM",
        dateSort: "2025-09-12T08:42:00",
        user: "meera.patel@example.com",
        userName: "Meera Patel",
        action: "VAULT_ACCESS",
        actionLabel: "Vault Session Access",
        actionType: "vault_access",
        module: "Vault",
        moduleFull: "Vault Custody",
        details: "Accessed personal vault",
        description: "Decryption session initiated for 'Desai Family Trust Archive' shard preview",
        ipAddress: "49.205.18.23",
        location: "Ahmedabad, Gujarat, India",
        device: "Windows (Firefox 129.0)",
        sessionId: "e5d3c2a1-8f4b-4a7e-9d2c-3b8a7f6e5d4c",
        status: "Success",
        relatedLogs: [
            { title: "Biometric authentication approved", time: "12 Sep 2025, 08:41 AM", icon: "key" },
            { title: "Shard integrity validated", time: "12 Sep 2025, 08:43 AM", icon: "lock" }
        ],
        rawData: {
            eventId: "LOG-012480",
            actor: { email: "meera.patel@example.com", role: "Designated Trustee" },
            action: "VAULT_SHARD_READ",
            vaultId: "VLT-88219",
            network: { ip: "49.205.18.23", geo: { city: "Ahmedabad", country: "IN" } }
        }
    },
    {
        id: "LOG-012479",
        index: 4,
        timestamp: "11 Sep 2025, 11:30 PM",
        dateSort: "2025-09-11T23:30:00",
        user: "system",
        userName: "Aegis Core Protocol",
        action: "TRUSTEE_ADDED",
        actionLabel: "Trustee Assigned",
        actionType: "trustee_added",
        module: "Trustee",
        moduleFull: "Trustee Quorum",
        details: "Added trustee: Karan M...",
        description: "New trustee onboarding finalized with Shamir Secret Key shard delivery",
        ipAddress: "203.122.45.67",
        location: "Internal Protocol Gateway",
        device: "Aegis Daemon v2.4 (Worker #3)",
        sessionId: "sys-cron-88912-a1b2-c3d4-e5f6a7b8c9d0",
        status: "Success",
        relatedLogs: [
            { title: "Key shard generated", time: "11 Sep 2025, 11:29 PM", icon: "key" },
            { title: "Signed invitation sent", time: "11 Sep 2025, 11:30 PM", icon: "mail" }
        ],
        rawData: {
            eventId: "LOG-012479",
            actor: { email: "system@aegisvault.internal", role: "Autonomous Protocol Engine" },
            action: "TRUSTEE_PROVISION",
            recipient: "karan.mehta@example.com"
        }
    },
    {
        id: "LOG-012478",
        index: 5,
        timestamp: "11 Sep 2025, 10:15 PM",
        dateSort: "2025-09-11T22:15:00",
        user: "unknown@domain.com",
        userName: "Unauthenticated Request",
        action: "FAILED_LOGIN",
        actionLabel: "Authentication Failure",
        actionType: "failed_login",
        module: "Auth",
        moduleFull: "Authentication",
        details: "Invalid password (3 atte...",
        description: "Repeated invalid credentials submitted; rate limiting triggered on IP",
        ipAddress: "117.248.12.45",
        location: "Delhi, NCR, India",
        device: "Linux (Chromium 127.0)",
        sessionId: "f9a8b7c6-5d4e-3f2a-1b0c-9e8d7c6b5a4f",
        status: "Failed",
        relatedLogs: [
            { title: "First failed attempt", time: "11 Sep 2025, 10:12 PM", icon: "alert" },
            { title: "IP temporarily rate-limited", time: "11 Sep 2025, 10:15 PM", icon: "shield" }
        ],
        rawData: {
            eventId: "LOG-012478",
            actor: { email: "unknown@domain.com", role: "Anonymous" },
            action: "AUTH_FAILURE",
            failureReason: "INVALID_HASH_OR_KEY",
            consecutiveFailures: 3,
            securityAction: "RATE_LIMIT_APPLIED"
        }
    },
    {
        id: "LOG-012477",
        index: 6,
        timestamp: "11 Sep 2025, 07:21 PM",
        dateSort: "2025-09-11T19:21:00",
        user: "admin@aegisvault.com",
        userName: "System Administrator",
        action: "SETTINGS_CHANGE",
        actionLabel: "Security Policy Updated",
        actionType: "settings_change",
        module: "Settings",
        moduleFull: "Platform Settings",
        details: "Updated security policy",
        description: "Enforced mandatory WebAuthn passkey policy for all trustee operations",
        ipAddress: "203.122.45.67",
        location: "Vadodara, Gujarat, India",
        device: "Windows (Chrome 128.0)",
        sessionId: "b4c3d2e1-7a8f-9e0d-1c2b-3a4f5e6d7c8b",
        status: "Success",
        relatedLogs: [
            { title: "Policy diff committed", time: "11 Sep 2025, 07:20 PM", icon: "settings" },
            { title: "Audit integrity signed", time: "11 Sep 2025, 07:22 PM", icon: "shield" }
        ],
        rawData: {
            eventId: "LOG-012477",
            action: "CONFIG_CHANGE",
            policyItem: "TRUSTEE_ENFORCE_FIDO2",
            oldValue: false,
            newValue: true
        }
    },
    {
        id: "LOG-012476",
        index: 7,
        timestamp: "11 Sep 2025, 03:12 PM",
        dateSort: "2025-09-11T15:12:00",
        user: "priya.shah@example.com",
        userName: "Priya Shah",
        action: "VAULT_SHARE",
        actionLabel: "Trustee Share Verified",
        actionType: "vault_share",
        module: "Vault",
        moduleFull: "Vault Custody",
        details: "Submitted trustee share",
        description: "Zero-knowledge proof submitted for periodic trustee verification cycle",
        ipAddress: "49.205.18.23",
        location: "Pune, Maharashtra, India",
        device: "iOS (Mobile Safari 17.4)",
        sessionId: "d8e7f6a5-4b3c-2d1e-0f9a-8b7c6d5e4f3a",
        status: "Success",
        relatedLogs: [
            { title: "Heartbeat cycle active", time: "11 Sep 2025, 03:10 PM", icon: "heartbeat" },
            { title: "ZK verification passed", time: "11 Sep 2025, 03:12 PM", icon: "shield" }
        ],
        rawData: {
            eventId: "LOG-012476",
            action: "ZK_PROOF_VERIFY",
            vaultId: "VLT-10944",
            proofValidity: true
        }
    },
    {
        id: "LOG-012475",
        index: 8,
        timestamp: "10 Sep 2025, 06:45 PM",
        dateSort: "2025-09-10T18:45:00",
        user: "system",
        userName: "Aegis Reporter",
        action: "DATA_EXPORT",
        actionLabel: "Audit Logs Exported",
        actionType: "data_export",
        module: "Report",
        moduleFull: "Reporting Engine",
        details: "Exported audit logs (CSV)",
        description: "Admin initiated cryptographic compliance archive generation in CSV format",
        ipAddress: "203.122.45.67",
        location: "Vadodara, Gujarat, India",
        device: "Windows (Chrome 128.0)",
        sessionId: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        status: "Success",
        relatedLogs: [
            { title: "Filter parameters cached", time: "10 Sep 2025, 06:44 PM", icon: "file" },
            { title: "Export hash calculated", time: "10 Sep 2025, 06:45 PM", icon: "lock" }
        ],
        rawData: {
            eventId: "LOG-012475",
            action: "REPORT_CSV_GENERATED",
            recordCount: 1248,
            sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }
    },
    {
        id: "LOG-012474",
        index: 9,
        timestamp: "10 Sep 2025, 04:33 PM",
        dateSort: "2025-09-10T16:33:00",
        user: "kunal.desai@example.com",
        userName: "Kunal Desai",
        action: "ROLE_CHANGE",
        actionLabel: "User Role Updated",
        actionType: "role_change",
        module: "User",
        moduleFull: "User Management",
        details: "Changed role: User → T...",
        description: "Designated trustee permissions granted following multi-party identity clearance",
        ipAddress: "117.248.12.45",
        location: "Bengaluru, Karnataka, India",
        device: "macOS (Chrome 128.0)",
        sessionId: "f1e2d3c4-b5a6-9f8e-7d6c-5b4a3f2e1d0c",
        status: "Success",
        relatedLogs: [
            { title: "Identity clearance received", time: "10 Sep 2025, 04:30 PM", icon: "user" },
            { title: "Role credentials updated", time: "10 Sep 2025, 04:33 PM", icon: "shield" }
        ],
        rawData: {
            eventId: "LOG-012474",
            action: "ACL_ROLE_UPGRADE",
            targetUser: "kunal.desai@example.com",
            previousRole: "Owner",
            newRole: "Trustee"
        }
    },
    {
        id: "LOG-012473",
        index: 10,
        timestamp: "10 Sep 2025, 01:18 PM",
        dateSort: "2025-09-10T13:18:00",
        user: "rohan.mehta@example.com",
        userName: "Rohan Mehta",
        action: "ACCOUNT_SUSPENDED",
        actionLabel: "Temporary Hold Placed",
        actionType: "account_suspended",
        module: "User",
        moduleFull: "User Management",
        details: "Account suspended by ...",
        description: "Automated anomaly detection suspended account pending manual security review",
        ipAddress: "49.205.18.23",
        location: "Hyderabad, Telangana, India",
        device: "Windows (Edge 128.0)",
        sessionId: "c9d8e7f6-a5b4-3c2d-1e0f-9a8b7c6d5e4f",
        status: "Success",
        relatedLogs: [
            { title: "Anomaly flag triggered", time: "10 Sep 2025, 01:15 PM", icon: "alert" },
            { title: "Vault locks reinforced", time: "10 Sep 2025, 01:18 PM", icon: "lock" }
        ],
        rawData: {
            eventId: "LOG-012473",
            action: "USER_TEMPORARY_SUSPENSION",
            targetUser: "rohan.mehta@example.com",
            trigger: "ANOMALOUS_GEOLOCATION"
        }
    },
    // Supplementary mock records for search and filter testing
    {
        id: "LOG-012472",
        index: 11,
        timestamp: "09 Sep 2025, 11:22 AM",
        dateSort: "2025-09-09T11:22:00",
        user: "ananya.shah@example.com",
        userName: "Ananya Shah",
        action: "VAULT_CREATE",
        actionLabel: "New Vault Provisioned",
        actionType: "vault_access",
        module: "Vault",
        moduleFull: "Vault Custody",
        details: "Created 'Inheritance Digital Archive'",
        description: "Initialized time-locked digital legacy vault with 90-day heartbeat requirement",
        ipAddress: "122.170.89.204",
        location: "Ahmedabad, Gujarat, India",
        device: "Windows (Chrome 128.0)",
        sessionId: "e1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
        status: "Success",
        relatedLogs: [
            { title: "Master encryption key generated", time: "09 Sep 2025, 11:20 AM", icon: "key" },
            { title: "Dead Man's Switch timer armed", time: "09 Sep 2025, 11:22 AM", icon: "lock" }
        ],
        rawData: {
            eventId: "LOG-012472",
            action: "VAULT_INITIALIZE",
            vaultName: "Inheritance Digital Archive",
            timeLockDays: 90
        }
    },
    {
        id: "LOG-012471",
        index: 12,
        timestamp: "09 Sep 2025, 09:05 AM",
        dateSort: "2025-09-09T09:05:00",
        user: "vivek.jain@example.com",
        userName: "Vivek Jain",
        action: "FAILED_LOGIN",
        actionLabel: "Authentication Failure",
        actionType: "failed_login",
        module: "Auth",
        moduleFull: "Authentication",
        details: "MFA hardware token mismatch",
        description: "Hardware U2F dongle signature did not match stored public key footprint",
        ipAddress: "182.74.88.190",
        location: "Kolkata, West Bengal, India",
        device: "macOS (Firefox 129.0)",
        sessionId: "f2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d",
        status: "Failed",
        relatedLogs: [
            { title: "Hardware challenge timed out", time: "09 Sep 2025, 09:04 AM", icon: "alert" }
        ],
        rawData: {
            eventId: "LOG-012471",
            action: "U2F_SIGNATURE_MISMATCH",
            user: "vivek.jain@example.com"
        }
    }
];
