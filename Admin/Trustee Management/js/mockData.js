/**
 * AegisVault — Trustee Management Module
 * Live Data Store Fallbacks (Initialized empty; populated dynamically via API)
 */

window.AegisTrusteeMockData = {
    kpis: {
        totalTrustees: 0,
        totalTrusteesGrowth: "0%",
        totalTrusteesSubtext: "Live platform records",
        verifiedTrustees: 0,
        verifiedTrusteesGrowth: "0%",
        verifiedTrusteesSubtext: "Verified key holders",
        pendingVerification: 0,
        pendingVerificationGrowth: "0%",
        pendingVerificationSubtext: "Pending verification",
        rejectedInactive: 0,
        rejectedInactiveGrowth: "0%",
        rejectedInactiveSubtext: "Inactive trustees"
    },
    verificationOverview: [],
    trusteeTypes: [],
    trustees: [],
    invitations: [],
    permissionMatrix: [],
    vaultAccessAssignments: []
};
