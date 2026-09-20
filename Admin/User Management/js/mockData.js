/**
 * AegisVault — User Management Module
 * Mock Data Store
 * Matches exact users and statistics visible in reference screenshots.
 */

window.AegisMockUsers = [
    {
        id: "USR001248",
        index: 1,
        initials: "RS",
        name: "Rohit Sharma",
        email: "rohit@example.com",
        role: "Owner",
        roleTitle: "Vault Owner",
        status: "Active",
        vaults: 2,
        trustees: 3,
        joinedOn: "12 Sep 2025",
        joinedOnFull: "12 Sep 2025, 09:14 AM",
        lastLogin: "11 Sep 2025, 08:22 PM",
        emailVerified: "Yes",
        phoneVerified: "Yes",
        mfaEnabled: true,
        securityScore: "98%",
        phone: "+91 98201 44521",
        country: "India",
        recentActivity: [
            { action: "Created Vault 'Family Legacy Archive'", timestamp: "12 Sep 2025, 09:30 AM", status: "Success" },
            { action: "Appointed 2 Trustees with Shamir Key Split", timestamp: "12 Sep 2025, 10:15 AM", status: "Verified" },
            { action: "Heartbeat check-in verified via hardware key", timestamp: "11 Sep 2025, 08:22 PM", status: "Success" }
        ],
        securityDetails: {
            mfaMethod: "FIDO2 WebAuthn + TOTP",
            encryptionLevel: "AES-256-GCM (Zero-Knowledge)",
            failedLogins: 0,
            ipAddress: "103.21.124.58",
            trustedDevices: 2
        },
        vaultsList: [
            { name: "Family Legacy Archive", type: "Digital Assets & Documents", status: "Locked", trigger: "Dead Man's Switch (90 Days)" },
            { name: "Cryptographic Keys Vault", type: "Private Keys & Seeds", status: "Active Custody", trigger: "Multi-Sig Time Lock" }
        ]
    },
    {
        id: "USR001247",
        index: 2,
        initials: "MP",
        name: "Meera Patel",
        email: "meera@example.com",
        role: "Trustee",
        roleTitle: "Designated Trustee",
        status: "Active",
        vaults: 1,
        trustees: 2,
        joinedOn: "11 Sep 2025",
        joinedOnFull: "11 Sep 2025, 02:45 PM",
        lastLogin: "12 Sep 2025, 11:10 AM",
        emailVerified: "Yes",
        phoneVerified: "Yes",
        mfaEnabled: true,
        securityScore: "95%",
        phone: "+91 98450 12894",
        country: "India",
        recentActivity: [
            { action: "Accepted Trustee Invitation from Kunal Desai", timestamp: "11 Sep 2025, 03:00 PM", status: "Success" },
            { action: "Hardware key fingerprint verified", timestamp: "12 Sep 2025, 11:10 AM", status: "Success" }
        ],
        securityDetails: {
            mfaMethod: "TOTP Authenticator",
            encryptionLevel: "AES-256-GCM",
            failedLogins: 0,
            ipAddress: "49.36.14.88",
            trustedDevices: 1
        },
        vaultsList: [
            { name: "Desai Family Trust Archive", type: "Designated Trustee Access", status: "Awaiting Trigger", trigger: "Consensus 2/3" }
        ]
    },
    {
        id: "USR001246",
        index: 3,
        initials: "KD",
        name: "Kunal Desai",
        email: "kunal@example.com",
        role: "Owner",
        roleTitle: "Vault Owner",
        status: "Active",
        vaults: 0,
        trustees: 1,
        joinedOn: "10 Sep 2025",
        joinedOnFull: "10 Sep 2025, 11:20 AM",
        lastLogin: "11 Sep 2025, 04:15 PM",
        emailVerified: "Yes",
        phoneVerified: "No",
        mfaEnabled: true,
        securityScore: "84%",
        phone: "+91 97123 45890",
        country: "India",
        recentActivity: [
            { action: "User account created and email verified", timestamp: "10 Sep 2025, 11:25 AM", status: "Success" },
            { action: "Initiated Trustee invite to Meera Patel", timestamp: "11 Sep 2025, 02:40 PM", status: "Pending" }
        ],
        securityDetails: {
            mfaMethod: "Email OTP",
            encryptionLevel: "AES-256-GCM",
            failedLogins: 1,
            ipAddress: "115.112.44.12",
            trustedDevices: 1
        },
        vaultsList: []
    },
    {
        id: "USR001245",
        index: 4,
        initials: "AS",
        name: "Ananya Shah",
        email: "ananya@example.com",
        role: "Owner",
        roleTitle: "Vault Owner",
        status: "Pending",
        vaults: 1,
        trustees: 4,
        joinedOn: "09 Sep 2025",
        joinedOnFull: "09 Sep 2025, 04:30 PM",
        lastLogin: "09 Sep 2025, 05:10 PM",
        emailVerified: "Yes",
        phoneVerified: "No",
        mfaEnabled: false,
        securityScore: "62%",
        phone: "+91 99200 66781",
        country: "India",
        recentActivity: [
            { action: "Registered account via invitation", timestamp: "09 Sep 2025, 04:30 PM", status: "Success" },
            { action: "Identity verification documents uploaded", timestamp: "09 Sep 2025, 04:55 PM", status: "Under Review" }
        ],
        securityDetails: {
            mfaMethod: "Disabled",
            encryptionLevel: "Pending Key Generation",
            failedLogins: 0,
            ipAddress: "122.170.89.204",
            trustedDevices: 1
        },
        vaultsList: [
            { name: "Personal Digital Will", type: "Inheritance Plan", status: "Draft", trigger: "Unconfigured" }
        ]
    },
    {
        id: "USR001244",
        index: 5,
        initials: "VJ",
        name: "Vivek Jain",
        email: "vivek@example.com",
        role: "Trustee",
        roleTitle: "Designated Trustee",
        status: "Suspended",
        vaults: 3,
        trustees: 2,
        joinedOn: "08 Sep 2025",
        joinedOnFull: "08 Sep 2025, 10:05 AM",
        lastLogin: "08 Sep 2025, 01:14 PM",
        emailVerified: "Yes",
        phoneVerified: "Yes",
        mfaEnabled: true,
        securityScore: "45%",
        phone: "+91 98111 22334",
        country: "India",
        recentActivity: [
            { action: "Suspended due to 5 consecutive failed MFA attempts", timestamp: "08 Sep 2025, 01:14 PM", status: "Alert" },
            { action: "Security containment protocol triggered", timestamp: "08 Sep 2025, 01:15 PM", status: "Locked" }
        ],
        securityDetails: {
            mfaMethod: "TOTP (Locked)",
            encryptionLevel: "AES-256-GCM (Access Suspended)",
            failedLogins: 5,
            ipAddress: "182.74.88.190",
            trustedDevices: 0
        },
        vaultsList: [
            { name: "Jain Enterprise Holdings", type: "Corporate Custody", status: "Frozen by Policy", trigger: "Suspended" }
        ]
    },
    {
        id: "USR001243",
        index: 6,
        initials: "PS",
        name: "Priya Shah",
        email: "priya@example.com",
        role: "Owner",
        roleTitle: "Vault Owner",
        status: "Active",
        vaults: 0,
        trustees: 1,
        joinedOn: "07 Sep 2025",
        joinedOnFull: "07 Sep 2025, 08:40 AM",
        lastLogin: "12 Sep 2025, 09:05 AM",
        emailVerified: "Yes",
        phoneVerified: "Yes",
        mfaEnabled: true,
        securityScore: "92%",
        phone: "+91 97654 32109",
        country: "India",
        recentActivity: [
            { action: "Heartbeat confirmed on mobile app", timestamp: "12 Sep 2025, 09:05 AM", status: "Success" },
            { action: "Updated backup emergency contact", timestamp: "10 Sep 2025, 06:12 PM", status: "Success" }
        ],
        securityDetails: {
            mfaMethod: "Biometric Passkey",
            encryptionLevel: "AES-256-GCM",
            failedLogins: 0,
            ipAddress: "27.56.21.14",
            trustedDevices: 2
        },
        vaultsList: []
    },
    {
        id: "USR001242",
        index: 7,
        initials: "RM",
        name: "Rohan Mehta",
        email: "rohan@example.com",
        role: "Owner",
        roleTitle: "Vault Owner",
        status: "Active",
        vaults: 2,
        trustees: 3,
        joinedOn: "05 Sep 2025",
        joinedOnFull: "05 Sep 2025, 03:15 PM",
        lastLogin: "11 Sep 2025, 10:48 PM",
        emailVerified: "Yes",
        phoneVerified: "Yes",
        mfaEnabled: true,
        securityScore: "96%",
        phone: "+91 98234 56789",
        country: "India",
        recentActivity: [
            { action: "Added emergency medical directives", timestamp: "08 Sep 2025, 02:00 PM", status: "Encrypted" },
            { action: "Vault time-lock interval reset to 180 days", timestamp: "11 Sep 2025, 10:48 PM", status: "Success" }
        ],
        securityDetails: {
            mfaMethod: "FIDO2 WebAuthn",
            encryptionLevel: "AES-256-GCM",
            failedLogins: 0,
            ipAddress: "103.88.92.14",
            trustedDevices: 3
        },
        vaultsList: [
            { name: "Critical Medical & Legal Documents", type: "Encrypted Time Capsule", status: "Armed", trigger: "180 Days Inactivity" },
            { name: "Cold Storage Crypto Recovery", type: "Multi-Sig Shards", status: "Armed", trigger: "Trustee Quorum 2/3" }
        ]
    },
    {
        id: "USR001241",
        index: 8,
        initials: "KP",
        name: "Kush Patel",
        email: "kush@example.com",
        role: "Trustee",
        roleTitle: "Designated Trustee",
        status: "Pending",
        vaults: 0,
        trustees: 1,
        joinedOn: "04 Sep 2025",
        joinedOnFull: "04 Sep 2025, 12:10 PM",
        lastLogin: "04 Sep 2025, 12:10 PM",
        emailVerified: "Yes",
        phoneVerified: "No",
        mfaEnabled: false,
        securityScore: "50%",
        phone: "+91 99012 34567",
        country: "India",
        recentActivity: [
            { action: "Trustee invitation link opened", timestamp: "04 Sep 2025, 12:10 PM", status: "Pending" },
            { action: "Awaiting identity verification check", timestamp: "04 Sep 2025, 12:15 PM", status: "Incomplete" }
        ],
        securityDetails: {
            mfaMethod: "Pending Enrollment",
            encryptionLevel: "Pending Verification",
            failedLogins: 0,
            ipAddress: "14.139.112.5",
            trustedDevices: 1
        },
        vaultsList: []
    },
    {
        id: "USR001240",
        index: 9,
        initials: "ND",
        name: "Neha Desai",
        email: "neha@example.com",
        role: "Owner",
        roleTitle: "Vault Owner",
        status: "Active",
        vaults: 1,
        trustees: 2,
        joinedOn: "02 Sep 2025",
        joinedOnFull: "02 Sep 2025, 05:22 PM",
        lastLogin: "10 Sep 2025, 07:33 AM",
        emailVerified: "Yes",
        phoneVerified: "Yes",
        mfaEnabled: true,
        securityScore: "94%",
        phone: "+91 98765 43210",
        country: "India",
        recentActivity: [
            { action: "Biometric sign-in verified from primary laptop", timestamp: "10 Sep 2025, 07:33 AM", status: "Success" },
            { action: "Tested test heartbeat response", timestamp: "05 Sep 2025, 04:18 PM", status: "Verified" }
        ],
        securityDetails: {
            mfaMethod: "Passkey + Hardware Key",
            encryptionLevel: "AES-256-GCM",
            failedLogins: 0,
            ipAddress: "125.19.48.72",
            trustedDevices: 2
        },
        vaultsList: [
            { name: "Intellectual Property Vault", type: "Trade Secrets & Source Code", status: "Active", trigger: "Consensus 3/3" }
        ]
    },
    {
        id: "USR001239",
        index: 10,
        initials: "AV",
        name: "Amit Verma",
        email: "amit@example.com",
        role: "Owner",
        roleTitle: "Vault Owner",
        status: "Suspended",
        vaults: 0,
        trustees: 0,
        joinedOn: "01 Sep 2025",
        joinedOnFull: "01 Sep 2025, 09:00 AM",
        lastLogin: "01 Sep 2025, 11:45 AM",
        emailVerified: "No",
        phoneVerified: "No",
        mfaEnabled: false,
        securityScore: "20%",
        phone: "+91 91234 56789",
        country: "India",
        recentActivity: [
            { action: "Account flagged for unverified registration details", timestamp: "01 Sep 2025, 11:45 AM", status: "Flagged" },
            { action: "Admin temporary hold placed", timestamp: "01 Sep 2025, 12:00 PM", status: "Suspended" }
        ],
        securityDetails: {
            mfaMethod: "None",
            encryptionLevel: "Inactive",
            failedLogins: 2,
            ipAddress: "106.51.78.23",
            trustedDevices: 0
        },
        vaultsList: []
    },
    // Additional mock rows for pagination pages
    {
        id: "USR001238",
        index: 11,
        initials: "SK",
        name: "Siddharth Kapoor",
        email: "siddharth@example.com",
        role: "Owner",
        roleTitle: "Vault Owner",
        status: "Active",
        vaults: 4,
        trustees: 3,
        joinedOn: "29 Aug 2025",
        joinedOnFull: "29 Aug 2025, 10:14 AM",
        lastLogin: "11 Sep 2025, 06:12 PM",
        emailVerified: "Yes",
        phoneVerified: "Yes",
        mfaEnabled: true,
        securityScore: "99%",
        phone: "+91 98200 11223",
        country: "India",
        recentActivity: [
            { action: "Updated recovery seeds", timestamp: "11 Sep 2025, 06:12 PM", status: "Success" }
        ],
        securityDetails: { mfaMethod: "FIDO2 WebAuthn", encryptionLevel: "AES-256-GCM", failedLogins: 0, ipAddress: "114.143.20.12", trustedDevices: 2 },
        vaultsList: [{ name: "Siddharth High Value Vault", type: "Digital Assets", status: "Active", trigger: "Consensus 2/3" }]
    },
    {
        id: "USR001237",
        index: 12,
        initials: "TJ",
        name: "Tanvi Joshi",
        email: "tanvi@example.com",
        role: "Trustee",
        roleTitle: "Designated Trustee",
        status: "Active",
        vaults: 1,
        trustees: 2,
        joinedOn: "28 Aug 2025",
        joinedOnFull: "28 Aug 2025, 04:30 PM",
        lastLogin: "12 Sep 2025, 08:15 AM",
        emailVerified: "Yes",
        phoneVerified: "Yes",
        mfaEnabled: true,
        securityScore: "95%",
        phone: "+91 97333 44556",
        country: "India",
        recentActivity: [
            { action: "Verified trustee key share", timestamp: "12 Sep 2025, 08:15 AM", status: "Success" }
        ],
        securityDetails: { mfaMethod: "TOTP", encryptionLevel: "AES-256-GCM", failedLogins: 0, ipAddress: "49.207.18.99", trustedDevices: 1 },
        vaultsList: [{ name: "Kapoor Family Trust Share", type: "Trustee Shard", status: "Active", trigger: "Consensus 2/3" }]
    }
];

window.AegisUserStats = {
    totalUsers: 1248,
    totalTrend: "↑ 12%",
    totalSubtext: "+134 this month",
    activeUsers: 982,
    activeTrend: "↑ 6%",
    activeSubtext: "78.7% of total",
    suspendedUsers: 173,
    suspendedTrend: "↑ 28%",
    suspendedSubtext: "13.9% of total",
    pendingVerifications: 93,
    pendingTrend: "↓ 15%",
    pendingSubtext: "7.5% of total"
};
