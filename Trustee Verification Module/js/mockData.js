/**
 * AegisVault - Mock Data Repository
 * Provides structured data for Trustee Verification Module
 */

const AegisData = {
    // Current logged-in user
    currentUser: {
        name: "Aryan Patel",
        initials: "AP",
        role: "Vault Owner & Cryptographic Custodian",
        email: "aryan.patel@aegisvault.internal",
        tier: "Enterprise Guardian Plan",
        vaultCount: 4,
        activeTrustees: 3
    },

    // Trustee currently being viewed / verified
    trustee: {
        id: "TRU-88219",
        name: "Rakesh Patel",
        relationship: "Father",
        email: "rakesh.patel@gmail.com",
        phone: "+91 98250 44120",
        addedDate: "12 August 2025",
        status: "Verified Trustee",
        verifiedAt: "12 Sep 2025, 10:32 AM",
        avatar: "assets/avatar.png",
        trustScore: 98,
        allocatedShare: "Share 2 of 5 (Shamir Secret Scheme)",
        thresholdRequirement: "3 of 5 shares required for reconstruction",
        assignedVault: "Primary Family Estate & Financial Assets Vault",
        idDocument: "Aadhaar Card (Verified via DigiLocker e-KYC)",
        idNumberMasked: "•••• •••• 8921",
        emergencyContactAuthorized: true,
        legalJurisdiction: "India (Gujarat)",
        notes: "Designated primary estate trustee with power of attorney execution rights."
    },

    // Navigation Menu Items
    navItems: [
        { id: "dashboard", label: "Dashboard", icon: "grid", active: false, badge: null },
        { id: "my-vault", label: "My Vault", icon: "vault", active: false, badge: "4" },
        { id: "add-item", label: "Add Item", icon: "plus-circle", active: false, badge: null },
        { id: "categories", label: "Categories", icon: "folder", active: false, badge: null },
        { id: "secret-sharing", label: "Secret Sharing", icon: "key", active: false, badge: null },
        { id: "trustees", label: "Trustees", icon: "users", active: false, badge: "3" },
        { id: "heartbeat", label: "Heartbeat", icon: "activity", active: false, badge: "Active" },
        { id: "state-machine", label: "State Machine", icon: "workflow", active: false, badge: null },
        { id: "notifications", label: "Notifications", icon: "bell", active: false, badge: "2" },
        { id: "vault-release", label: "Vault Release", icon: "unlock", active: false, badge: null },
        { id: "trustee-verification", label: "Trustee Verification", icon: "badge-check", active: true, badge: null },
        { id: "security", label: "Security", icon: "shield", active: false, badge: null },
        { id: "activity-logs", label: "Activity Logs", icon: "clock", active: false, badge: null },
        { id: "settings", label: "Settings", icon: "settings", active: false, badge: null },
        { id: "trash", label: "Trash", icon: "trash", active: false, badge: null }
    ],

    // 5-Step Verification Process Rows
    verificationSteps: [
        {
            step: 1,
            id: "email-verification",
            title: "1. Email Verification",
            shortTitle: "Email Verification",
            description: "A verification link is sent to the trustee's email address.",
            status: "Completed",
            icon: "mail",
            completedDate: "12 Sep 2025, 10:24 AM",
            provider: "Aegis Secure Mail Gateway (TLS 1.3)",
            authHash: "sha256:7f9a12c849e3...bd29f",
            details: "Cryptographic token with 256-bit entropy was dispatched to rakesh.patel@gmail.com and confirmed within 78 seconds of transmission.",
            auditLog: "Token accepted from IP 103.24.12.88 (Ahmedabad, IN). User-Agent verified as Mobile Safari / iOS 17.5."
        },
        {
            step: 2,
            id: "otp-confirmation",
            title: "2. OTP Confirmation",
            shortTitle: "OTP Confirmation",
            description: "Trustee verifies using a one-time password (OTP).",
            status: "Completed",
            icon: "chat",
            completedDate: "12 Sep 2025, 10:26 AM",
            provider: "Twilio Enterprise Encrypted SMS Relay",
            authHash: "totp:a388b19240...fc183",
            details: "Time-based cryptographically generated 6-digit OTP verified successfully on initial attempt without latency timeout.",
            auditLog: "SMS delivered via carrier routing tier-1. OTP matched within valid 180s HMAC window. Zero replay attempts."
        },
        {
            step: 3,
            id: "identity-verification",
            title: "3. Identity Verification",
            shortTitle: "Identity Verification",
            description: "Verify identity using government ID (Aadhaar / Passport / DL).",
            status: "Completed",
            icon: "id-card",
            completedDate: "12 Sep 2025, 10:30 AM",
            provider: "UIDAI DigiLocker National e-KYC Gateway",
            authHash: "ekyc:99b10fa2e8...44d90",
            details: "Official government Aadhaar XML e-KYC record fetched and cryptographically signed. Biometric liveness score verified at 99.4%.",
            auditLog: "Digital signature validated against UIDAI Public Root Certificate Authority. Document matches full legal name 'Rakesh Patel'."
        },
        {
            step: 4,
            id: "trustee-authentication",
            title: "4. Trustee Authentication",
            shortTitle: "Trustee Authentication",
            description: "Secure login with email + OTP + optional 2FA.",
            status: "Completed",
            icon: "user-shield",
            completedDate: "12 Sep 2025, 10:31 AM",
            provider: "FIDO2 / WebAuthn Hardware Security Provider",
            authHash: "fido2:c829e102aa...7781a",
            details: "Trustee device authenticated using hardware-backed cryptographic keypair. Private key resides inside hardware Secure Enclave.",
            auditLog: "Challenge-response handshake verified using curve P-256. User presence flag confirmed with biometric TouchID."
        },
        {
            step: 5,
            id: "share-ownership",
            title: "5. Share Ownership Verification",
            shortTitle: "Share Ownership",
            description: "System verifies that the trustee's submitted share is valid.",
            status: "Completed",
            icon: "key",
            completedDate: "12 Sep 2025, 10:32 AM",
            provider: "Shamir SSS Zero-Knowledge Proof Verifier",
            authHash: "pedersen:4e8201a09...18d09",
            details: "Polynomial share evaluation point (x=2, f(x)) successfully verified against homomorphic Pedersen commitment vector without leaking secret data.",
            auditLog: "Zero-Knowledge SNARK proof verified in 14ms. Share validated as authentic component of threshold reconstruction polynomial."
        }
    ],

    // Verification Methods
    verificationMethods: [
        {
            id: "email",
            name: "Email Verification",
            subtitle: "One-click magic links with 256-bit token entropy",
            status: "Enabled",
            icon: "mail",
            required: true,
            description: "Dispatches short-lived, encrypted verification links via TLS 1.3 secure mail transport."
        },
        {
            id: "otp",
            name: "OTP (SMS / Email)",
            subtitle: "Time-based one-time passcodes",
            status: "Enabled",
            icon: "chat",
            required: true,
            description: "Requires high-entropy 6-digit numeric passcodes delivered via SMS or secondary secure email."
        },
        {
            id: "identity",
            name: "Identity Verification (Aadhaar / Passport / DL)",
            subtitle: "Government-backed digital ID and biometric verification",
            status: "Enabled",
            icon: "id-card",
            required: true,
            description: "Verifies official national identification cards using authenticated digital government registries."
        },
        {
            id: "two-factor",
            name: "Two-Factor Authentication",
            subtitle: "Hardware keys (FIDO2) or authenticator apps (TOTP)",
            status: "Enabled",
            icon: "lock",
            required: false,
            description: "Enforces secondary authentication factor to protect against credential compromise."
        },
        {
            id: "biometric",
            name: "Biometric Verification (Optional)",
            subtitle: "Facial liveness scan or hardware fingerprint",
            status: "Disabled",
            icon: "fingerprint",
            required: false,
            description: "Optional hardware biometric sensor integration (TouchID, FaceID, Windows Hello)."
        }
    ],

    // Suspicious Activity Monitoring Rules
    suspiciousRules: [
        {
            id: "rule-unusual-location",
            label: "Unusual login location",
            description: "Flags trustee access requests originating outside of designated home jurisdiction (> 500km radius).",
            enabled: true,
            severity: "High"
        },
        {
            id: "rule-multiple-otp",
            label: "Multiple failed OTP attempts",
            description: "Imposes an exponential timeout lock if more than 3 consecutive incorrect OTP tokens are entered.",
            enabled: true,
            severity: "Critical"
        },
        {
            id: "rule-unrecognized-device",
            label: "Unrecognized device",
            description: "Requires step-up out-of-band authorization when a new hardware fingerprint or browser is detected.",
            enabled: true,
            severity: "Medium"
        },
        {
            id: "rule-suspicious-share",
            label: "Suspicious share submission",
            description: "Halts key aggregation if a cryptographic share fails the homomorphic polynomial commitment check.",
            enabled: true,
            severity: "Critical"
        },
        {
            id: "rule-impossible-travel",
            label: "Impossible travel detection",
            description: "Detects speed anomalies when subsequent requests occur in locations requiring superhuman transit speeds.",
            enabled: true,
            severity: "High"
        },
        {
            id: "rule-auto-lock",
            label: "Automatic temporary lock",
            description: "Locks vault access for 24 hours upon critical risk triggers and alerts the primary vault owner.",
            enabled: true,
            severity: "Critical"
        }
    ],

    // Recent Activity Feed
    recentActivity: [
        {
            id: "act-1",
            timestamp: "12 Sep 2025, 10:32 AM",
            action: "Share verified",
            actor: "Rakesh Patel",
            type: "success",
            icon: "check-circle",
            details: "Pedersen polynomial commitment verified for Shamir share #2"
        },
        {
            id: "act-2",
            timestamp: "12 Sep 2025, 10:30 AM",
            action: "Identity verified",
            actor: "Rakesh Patel",
            type: "success",
            icon: "check-circle",
            details: "DigiLocker national e-KYC record confirmed with 99.4% biometric liveness"
        },
        {
            id: "act-3",
            timestamp: "12 Sep 2025, 10:26 AM",
            action: "OTP confirmed",
            actor: "Rakesh Patel",
            type: "success",
            icon: "check-circle",
            details: "SMS OTP validated within HMAC timeframe (+91 98250 44120)"
        },
        {
            id: "act-4",
            timestamp: "12 Sep 2025, 10:24 AM",
            action: "Email verified",
            actor: "Rakesh Patel",
            type: "success",
            icon: "check-circle",
            details: "Magic link authenticated via TLS 1.3 from rakesh.patel@gmail.com"
        },
        {
            id: "act-5",
            timestamp: "10 Sep 2025, 09:12 AM",
            action: "Failed login attempt",
            actor: "Unknown device",
            type: "failed",
            icon: "alert-circle",
            details: "IP: 185.220.101.5 (Tor Exit Relay) - Blocked by geographic firewall rule"
        },
        {
            id: "act-6",
            timestamp: "08 Sep 2025, 04:15 PM",
            action: "Trustee designated",
            actor: "Aryan Patel",
            type: "success",
            icon: "user-plus",
            details: "Rakesh Patel appointed as Primary Family Trustee (Share 2/5)"
        },
        {
            id: "act-7",
            timestamp: "05 Sep 2025, 02:40 PM",
            action: "Security scan completed",
            actor: "Aegis Sentinel Engine",
            type: "success",
            icon: "shield-check",
            details: "System audit completed: 0 cryptographic anomalies or key leaks found"
        }
    ],

    // Notifications List
    notifications: [
        {
            id: "notif-1",
            title: "Share Ownership Verified",
            message: "Rakesh Patel has successfully verified Shamir Share #2 for Primary Family Estate Vault.",
            time: "12 mins ago",
            read: false,
            type: "success"
        },
        {
            id: "notif-2",
            title: "Identity Check Complete",
            message: "UIDAI e-KYC record validated for Rakesh Patel with 99.4% confidence score.",
            time: "15 mins ago",
            read: false,
            type: "success"
        },
        {
            id: "notif-3",
            title: "Suspicious Probe Blocked",
            message: "An unauthorized connection attempt from an unverified proxy was rejected by Aegis Shield.",
            time: "2 days ago",
            read: true,
            type: "warning"
        },
        {
            id: "notif-4",
            title: "Vault Heartbeat Active",
            message: "Periodic owner pulse check acknowledged. Next scheduled pulse in 14 days.",
            time: "3 days ago",
            read: true,
            type: "info"
        }
    ],

    // Searchable catalog for the top search bar
    searchCatalog: [
        { title: "Trustee: Rakesh Patel", category: "Trustees", link: "trustee-profile", type: "trustee" },
        { title: "Trustee: Priya Patel", category: "Trustees", link: "trustees", type: "trustee" },
        { title: "Trustee: Vikram Mehta", category: "Trustees", link: "trustees", type: "trustee" },
        { title: "Verification Process", category: "Verification", link: "verification-process", type: "module" },
        { title: "Email Verification Step", category: "Verification Step", link: "step-1", type: "step" },
        { title: "OTP Confirmation Step", category: "Verification Step", link: "step-2", type: "step" },
        { title: "Identity Verification Step", category: "Verification Step", link: "step-3", type: "step" },
        { title: "Trustee Authentication Step", category: "Verification Step", link: "step-4", type: "step" },
        { title: "Share Ownership Verification", category: "Verification Step", link: "step-5", type: "step" },
        { title: "Verification Methods Configuration", category: "Settings", link: "methods-config", type: "feature" },
        { title: "Suspicious Activity Detection", category: "Security", link: "suspicious-activity", type: "security" },
        { title: "Impossible Travel Rule", category: "Security Rules", link: "rule-impossible-travel", type: "security" },
        { title: "Recent Verification Activity", category: "Audit Logs", link: "recent-activity", type: "activity" },
        { title: "Heartbeat Health Protocol", category: "Protocols", link: "heartbeat", type: "protocol" },
        { title: "Shamir Secret Sharing", category: "Cryptography", link: "secret-sharing", type: "crypto" },
        { title: "Master Vault Release Settings", category: "Vault", link: "vault-release", type: "vault" }
    ]
};

// Export to window for global access without modules
window.AegisData = AegisData;
