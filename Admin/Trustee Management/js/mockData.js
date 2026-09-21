/**
 * AegisVault — Trustee Management System
 * Mock Data Repository (College Viva / Demo Ready)
 * 
 * Contains realistic mock data representing:
 * 1. Trustee Records (614 Total: 428 Verified, 126 Pending, 38 Rejected/Inactive)
 * 2. Trustee Types Distribution (Primary: 200 / 32%, Co-Trustee: 252 / 41%, Backup: 162 / 27%)
 * 3. Invitation Records (Pending, Accepted, Expired, Cancelled)
 * 4. Verification Queue & History Items
 * 5. Roles & Permission Matrix Specifications
 * 6. Trustee Vault Access Assignments
 */

const AegisTrusteeMockData = {
    // KPI Summary Metrics
    kpis: {
        totalTrustees: 614,
        totalTrusteesGrowth: "+10%",
        totalTrusteesSubtext: "+56 this month",

        verifiedTrustees: 428,
        verifiedTrusteesGrowth: "+15%",
        verifiedTrusteesSubtext: "69.7% of total",

        pendingVerification: 126,
        pendingVerificationGrowth: "-18%",
        pendingVerificationSubtext: "20.5% of total",

        rejectedInactive: 38,
        rejectedInactiveGrowth: "-5%",
        rejectedInactiveSubtext: "6.2% of total"
    },

    // Verification Overview Breakdown for SVG Donut Chart
    verificationOverview: [
        { label: "Verified", count: 428, percent: 69.7, color: "#10B981", darkColor: "#34D399" },
        { label: "Pending", count: 126, percent: 20.5, color: "#F59E0B", darkColor: "#FBBF24" },
        { label: "Rejected", count: 38, percent: 6.2, color: "#EF4444", darkColor: "#F87171" },
        { label: "Inactive", count: 22, percent: 3.6, color: "#94A3B8", darkColor: "#64748B" }
    ],

    // Trustee Types Breakdown
    trusteeTypes: [
        { type: "Primary Trustees", percent: 32, count: 200, color: "#2563EB", class: "primary" },
        { type: "Co-Trustees", percent: 41, count: 252, color: "#8B5CF6", class: "co-trustee" },
        { type: "Backup Trustees", percent: 27, count: 162, color: "#06B6D4", class: "backup" }
    ],

    // Main Trustee Records (Matching screenshots order and details)
    trustees: [
        {
            id: "TR-8901",
            index: 1,
            name: "Rahul Mehta",
            initials: "RM",
            avatarColor: "#3B82F6",
            email: "rahul@example.com",
            phone: "+91 98201 45231",
            trusteeType: "Primary",
            status: "Verified",
            linkedVaultsCount: 3,
            linkedVaults: ["Family Legacy Vault", "Emergency Access Vault", "Crypto Cold Storage"],
            addedOn: "12 Sep 2025",
            lastActive: "Today at 14:20",
            notes: "Designated custodian for family corporate holdings and critical hardware keys.",
            documentsVerified: true
        },
        {
            id: "TR-8902",
            index: 2,
            name: "Sneha Patel",
            initials: "SP",
            avatarColor: "#F59E0B",
            email: "sneha@example.com",
            phone: "+91 98765 43210",
            trusteeType: "Co-Trustee",
            status: "Pending",
            linkedVaultsCount: 2,
            linkedVaults: ["Digital Documents Vault", "Personal Archive"],
            addedOn: "11 Sep 2025",
            lastActive: "Yesterday",
            notes: "Pending Aadhar card OTP biometric verification.",
            documentsVerified: false
        },
        {
            id: "TR-8903",
            index: 3,
            name: "Arjun Shah",
            initials: "AS",
            avatarColor: "#10B981",
            email: "arjun@example.com",
            phone: "+91 97123 45678",
            trusteeType: "Backup",
            status: "Verified",
            linkedVaultsCount: 4,
            linkedVaults: ["Family Legacy Vault", "Offshore Trust Vault", "Crypto Cold Storage", "Digital Documents Vault"],
            addedOn: "10 Sep 2025",
            lastActive: "3 days ago",
            notes: "Qualified legal trustee with conditional custody release trigger.",
            documentsVerified: true
        },
        {
            id: "TR-8904",
            index: 4,
            name: "Priya Desai",
            initials: "PD",
            avatarColor: "#EF4444",
            email: "priya@example.com",
            phone: "+91 98450 11223",
            trusteeType: "Co-Trustee",
            status: "Rejected",
            linkedVaultsCount: 1,
            linkedVaults: ["Personal Archive"],
            addedOn: "08 Sep 2025",
            lastActive: "1 week ago",
            notes: "Submitted identity document was blurry and expired. Needs re-upload.",
            documentsVerified: false
        },
        {
            id: "TR-8905",
            index: 5,
            name: "Karan Joshi",
            initials: "KJ",
            avatarColor: "#6366F1",
            email: "karan@example.com",
            phone: "+91 99001 88776",
            trusteeType: "Primary",
            status: "Verified",
            linkedVaultsCount: 2,
            linkedVaults: ["Family Legacy Vault", "Emergency Access Vault"],
            addedOn: "07 Sep 2025",
            lastActive: "Yesterday",
            notes: "Primary co-signatory for timelocked inheritance protocol.",
            documentsVerified: true
        },
        {
            id: "TR-8906",
            index: 6,
            name: "Rohit Verma",
            initials: "RV",
            avatarColor: "#06B6D4",
            email: "rohit@example.com",
            phone: "+91 98222 33445",
            trusteeType: "Backup",
            status: "Pending",
            linkedVaultsCount: 1,
            linkedVaults: ["Crypto Cold Storage"],
            addedOn: "05 Sep 2025",
            lastActive: "2 days ago",
            notes: "Awaiting notarized custody authorization form signature.",
            documentsVerified: false
        },
        {
            id: "TR-8907",
            index: 7,
            name: "Ananya Iyer",
            initials: "AI",
            avatarColor: "#8B5CF6",
            email: "ananya@example.com",
            phone: "+91 98111 67890",
            trusteeType: "Co-Trustee",
            status: "Verified",
            linkedVaultsCount: 3,
            linkedVaults: ["Digital Documents Vault", "Family Legacy Vault", "Emergency Access Vault"],
            addedOn: "01 Sep 2025",
            lastActive: "4 hours ago",
            notes: "Verified secondary custodian with recovery consensus privileges.",
            documentsVerified: true
        },
        {
            id: "TR-8908",
            index: 8,
            name: "Vikram Nair",
            initials: "VN",
            avatarColor: "#059669",
            email: "vikram@example.com",
            phone: "+91 97444 55667",
            trusteeType: "Primary",
            status: "Verified",
            linkedVaultsCount: 2,
            linkedVaults: ["Offshore Trust Vault", "Crypto Cold Storage"],
            addedOn: "28 Aug 2025",
            lastActive: "5 days ago",
            notes: "Authorized for quorum voting and multi-sig recovery execution.",
            documentsVerified: true
        },
        {
            id: "TR-8909",
            index: 9,
            name: "Neha Sharma",
            initials: "NS",
            avatarColor: "#EC4899",
            email: "neha@example.com",
            phone: "+91 98333 77889",
            trusteeType: "Backup",
            status: "Pending",
            linkedVaultsCount: 1,
            linkedVaults: ["Family Legacy Vault"],
            addedOn: "25 Aug 2025",
            lastActive: "Just now",
            notes: "Document review queue: Address verification pending admin sign-off.",
            documentsVerified: false
        },
        {
            id: "TR-8910",
            index: 10,
            name: "Aditya Rao",
            initials: "AR",
            avatarColor: "#14B8A6",
            email: "aditya@example.com",
            phone: "+91 98999 11223",
            trusteeType: "Co-Trustee",
            status: "Verified",
            linkedVaultsCount: 2,
            linkedVaults: ["Personal Archive", "Digital Documents Vault"],
            addedOn: "20 Aug 2025",
            lastActive: "2 weeks ago",
            notes: "Full clearance verified. Active participation in heartbeat recovery checks.",
            documentsVerified: true
        },
        {
            id: "TR-8911",
            index: 11,
            name: "Meera Kulkarni",
            initials: "MK",
            avatarColor: "#F97316",
            email: "meera.k@example.com",
            phone: "+91 98777 22334",
            trusteeType: "Co-Trustee",
            status: "Inactive",
            linkedVaultsCount: 1,
            linkedVaults: ["Digital Documents Vault"],
            addedOn: "15 Aug 2025",
            lastActive: "3 months ago",
            notes: "Deactivated due to lack of heartbeat activity. Can be re-enabled.",
            documentsVerified: true
        },
        {
            id: "TR-8912",
            index: 12,
            name: "Kabir Malhotra",
            initials: "KM",
            avatarColor: "#84CC16",
            email: "kabir.m@example.com",
            phone: "+91 98123 99887",
            trusteeType: "Primary",
            status: "Verified",
            linkedVaultsCount: 3,
            linkedVaults: ["Family Legacy Vault", "Offshore Trust Vault", "Personal Archive"],
            addedOn: "10 Aug 2025",
            lastActive: "1 day ago",
            notes: "Primary institutional trustee for legacy transfer.",
            documentsVerified: true
        },
        {
            id: "TR-8913",
            index: 13,
            name: "Pooja Banerjee",
            initials: "PB",
            avatarColor: "#A855F7",
            email: "pooja.b@example.com",
            phone: "+91 97333 44556",
            trusteeType: "Backup",
            status: "Rejected",
            linkedVaultsCount: 1,
            linkedVaults: ["Emergency Access Vault"],
            addedOn: "05 Aug 2025",
            lastActive: "1 month ago",
            notes: "Identification document expired and name mismatched tax identifier.",
            documentsVerified: false
        },
        {
            id: "TR-8914",
            index: 14,
            name: "Suresh Menon",
            initials: "SM",
            avatarColor: "#0284C7",
            email: "suresh.m@example.com",
            phone: "+91 98444 88776",
            trusteeType: "Co-Trustee",
            status: "Verified",
            linkedVaultsCount: 2,
            linkedVaults: ["Crypto Cold Storage", "Personal Archive"],
            addedOn: "01 Aug 2025",
            lastActive: "3 days ago",
            notes: "Verified legal counsel and secondary executor.",
            documentsVerified: true
        },
        {
            id: "TR-8915",
            index: 15,
            name: "Divya Nambiar",
            initials: "DN",
            avatarColor: "#E11D48",
            email: "divya.n@example.com",
            phone: "+91 98199 22334",
            trusteeType: "Backup",
            status: "Inactive",
            linkedVaultsCount: 1,
            linkedVaults: ["Digital Documents Vault"],
            addedOn: "28 Jul 2025",
            lastActive: "4 months ago",
            notes: "Inactive - trustee transitioned to a dormant backup position.",
            documentsVerified: true
        }
    ],

    // Available Vault Options for filter & forms
    vaultOptions: [
        "Family Legacy Vault",
        "Digital Documents Vault",
        "Emergency Access Vault",
        "Personal Archive",
        "Crypto Cold Storage",
        "Offshore Trust Vault"
    ],

    // Invitations List (Integrated Section inside Trustee Management)
    invitations: [
        {
            id: "INV-701",
            recipient: "Aarav Shah",
            email: "aarav.shah@example.com",
            trusteeType: "Primary",
            vault: "Family Legacy Vault",
            invitedBy: "Dhruvil Admin",
            sentOn: "18 Sep 2025",
            expiresOn: "25 Sep 2025",
            status: "Pending",
            message: "You have been nominated as Primary Custodian for the Family Legacy Vault."
        },
        {
            id: "INV-702",
            recipient: "Meera Patel",
            email: "meera.patel@example.com",
            trusteeType: "Co-Trustee",
            vault: "Digital Documents Vault",
            invitedBy: "Kunal Desai",
            sentOn: "15 Sep 2025",
            expiresOn: "29 Sep 2025",
            status: "Accepted",
            message: "Invitation to verify and co-manage legal digital certificates."
        },
        {
            id: "INV-703",
            recipient: "Kabir Joshi",
            email: "kabir.j@example.com",
            trusteeType: "Backup",
            vault: "Emergency Access Vault",
            invitedBy: "Dhruvil Admin",
            sentOn: "01 Sep 2025",
            expiresOn: "15 Sep 2025",
            status: "Expired",
            message: "Emergency access protocol backup nomination link."
        },
        {
            id: "INV-704",
            recipient: "Isha Desai",
            email: "isha.desai@example.com",
            trusteeType: "Co-Trustee",
            vault: "Crypto Cold Storage",
            invitedBy: "Karan Joshi",
            sentOn: "12 Sep 2025",
            expiresOn: "26 Sep 2025",
            status: "Pending",
            message: "Custody co-signatory setup for timelocked smart contract vaults."
        },
        {
            id: "INV-705",
            recipient: "Rohan Kapoor",
            email: "rohan.k@example.com",
            trusteeType: "Backup",
            vault: "Offshore Trust Vault",
            invitedBy: "Dhruvil Admin",
            sentOn: "10 Aug 2025",
            expiresOn: "24 Aug 2025",
            status: "Cancelled",
            message: "Cancelled duplicate invitation."
        }
    ],

    // Verification Queue (For Page 2: Trustee Verification)
    verificationQueue: [
        {
            id: "VR-401",
            trusteeId: "TR-8902",
            name: "Sneha Patel",
            trusteeType: "Co-Trustee",
            email: "sneha@example.com",
            submittedOn: "11 Sep 2025, 14:15",
            priority: "High",
            documents: [
                { name: "National ID / Passport", type: "Identity Document", status: "Verified" },
                { name: "Proof of Address (Utility Bill)", type: "Address Proof", status: "Pending Review" },
                { name: "Digital Custody Consent Form", type: "Authorization Document", status: "Submitted" }
            ],
            status: "Pending",
            reviewer: "Unassigned",
            notes: "Submitted complete dossier. Address verification in final check."
        },
        {
            id: "VR-402",
            trusteeId: "TR-8906",
            name: "Rohit Verma",
            trusteeType: "Backup",
            email: "rohit@example.com",
            submittedOn: "05 Sep 2025, 09:30",
            priority: "Medium",
            documents: [
                { name: "Aadhaar e-KYC Verification", type: "Identity Document", status: "Verified" },
                { name: "Bank Statement Verification", type: "Address Proof", status: "Verified" },
                { name: "Notarized Affidavit of Custody", type: "Authorization Document", status: "Pending Review" }
            ],
            status: "Under Review",
            reviewer: "AP (Admin)",
            notes: "Reviewer checking legal notary stamp validity."
        },
        {
            id: "VR-403",
            trusteeId: "TR-8909",
            name: "Neha Sharma",
            trusteeType: "Backup",
            email: "neha@example.com",
            submittedOn: "25 Aug 2025, 18:40",
            priority: "High",
            documents: [
                { name: "Passport Scan", type: "Identity Document", status: "Submitted" },
                { name: "Tenancy Agreement", type: "Address Proof", status: "Submitted" },
                { name: "Trustee Undertaking Protocol", type: "Authorization Document", status: "Submitted" }
            ],
            status: "Pending",
            reviewer: "Unassigned",
            notes: "High priority due to imminent timelock activation on associated vault."
        },
        {
            id: "VR-404",
            trusteeId: "TR-8904",
            name: "Priya Desai",
            trusteeType: "Co-Trustee",
            email: "priya@example.com",
            submittedOn: "08 Sep 2025, 11:20",
            priority: "Low",
            documents: [
                { name: "Driver's License", type: "Identity Document", status: "Rejected" },
                { name: "Electricity Bill", type: "Address Proof", status: "Rejected" }
            ],
            status: "Rejected",
            reviewer: "AP (Admin)",
            notes: "Rejected: Identification document blurry and expired."
        }
    ],

    // Verification History (Past Completed Reviews)
    verificationHistory: [
        {
            trusteeName: "Rahul Mehta",
            trusteeType: "Primary",
            reviewedBy: "AP (Admin)",
            reviewedOn: "12 Sep 2025, 16:45",
            decision: "Approved",
            reason: "All 3 KYC & authorization documents thoroughly verified.",
            status: "Verified"
        },
        {
            trusteeName: "Arjun Shah",
            trusteeType: "Backup",
            reviewedBy: "AP (Admin)",
            reviewedOn: "10 Sep 2025, 12:10",
            decision: "Approved",
            reason: "Notarized power of attorney verified against state registry.",
            status: "Verified"
        },
        {
            trusteeName: "Karan Joshi",
            trusteeType: "Primary",
            reviewedBy: "Security Lead (Admin)",
            reviewedOn: "07 Sep 2025, 15:30",
            decision: "Approved",
            reason: "Biometric e-sign consensus verified.",
            status: "Verified"
        },
        {
            trusteeName: "Priya Desai",
            trusteeType: "Co-Trustee",
            reviewedBy: "AP (Admin)",
            reviewedOn: "08 Sep 2025, 17:00",
            decision: "Rejected",
            reason: "Document unclear and expired government ID card.",
            status: "Rejected"
        }
    ],

    // Roles & Permissions Data (For Page 3: Roles & Permissions)
    roles: [
        {
            id: "role-primary",
            name: "Primary Trustee",
            badgeClass: "primary",
            trusteeCount: 200,
            accessLevel: "Full Custody & Release",
            description: "Has unilateral authority to initiate recovery quorum, view metadata, and execute timelocked release triggers.",
            status: "Active"
        },
        {
            id: "role-co-trustee",
            name: "Co-Trustee",
            badgeClass: "co-trustee",
            trusteeCount: 252,
            accessLevel: "Consensus Dependent",
            description: "Requires multi-signatory consensus with Primary Trustee to approve recovery petitions and access vault assets.",
            status: "Active"
        },
        {
            id: "role-backup",
            name: "Backup Trustee",
            badgeClass: "backup",
            trusteeCount: 162,
            accessLevel: "Dormant / Conditional",
            description: "Activates only when Primary Trustee fails heartbeat responsiveness checks after designated protocol timeout.",
            status: "Active"
        }
    ],

    // Permission Matrix (Rows = Actions, Columns = Roles)
    permissionMatrix: [
        { action: "View Vault Metadata", primary: "Allowed", coTrustee: "Allowed", backup: "Allowed" },
        { action: "Receive Security Notifications", primary: "Allowed", coTrustee: "Allowed", backup: "Allowed" },
        { action: "Participate in Verification", primary: "Allowed", coTrustee: "Allowed", backup: "Conditional" },
        { action: "Participate in Recovery Quorum", primary: "Allowed", coTrustee: "Allowed", backup: "Conditional" },
        { action: "Request Vault Release", primary: "Allowed", coTrustee: "Conditional", backup: "Not Allowed" },
        { action: "Approve Emergency Recovery", primary: "Allowed", coTrustee: "Conditional", backup: "Conditional" },
        { action: "Access Released Digital Assets", primary: "Allowed", coTrustee: "Conditional", backup: "Conditional" }
    ],

    // Trustee-to-Vault Access Table
    vaultAccessAssignments: [
        { trustee: "Rahul Mehta", role: "Primary Trustee", vault: "Family Legacy Vault", accessLevel: "Full Access", status: "Active" },
        { trustee: "Rahul Mehta", role: "Primary Trustee", vault: "Crypto Cold Storage", accessLevel: "Full Access", status: "Active" },
        { trustee: "Sneha Patel", role: "Co-Trustee", vault: "Digital Documents Vault", accessLevel: "Consensus Access", status: "Pending Verification" },
        { trustee: "Arjun Shah", role: "Backup Trustee", vault: "Offshore Trust Vault", accessLevel: "Dormant (Conditional)", status: "Active" },
        { trustee: "Karan Joshi", role: "Primary Trustee", vault: "Emergency Access Vault", accessLevel: "Full Access", status: "Active" },
        { trustee: "Ananya Iyer", role: "Co-Trustee", vault: "Family Legacy Vault", accessLevel: "Consensus Access", status: "Active" },
        { trustee: "Vikram Nair", role: "Primary Trustee", vault: "Offshore Trust Vault", accessLevel: "Full Access", status: "Active" }
    ]
};

// Export to window for vanilla JS consumption across modules
window.AegisTrusteeMockData = AegisTrusteeMockData;
