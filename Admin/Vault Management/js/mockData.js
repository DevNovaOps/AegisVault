/**
 * AegisVault — Vault Management Module Data Store
 * Reset to clean empty states for live backend integration
 */

const AegisVaultMockData = {
    overview: {
        totalVaults: 0,
        totalVaultsTrend: "Live",
        totalVaultsSubtext: "All system vaults",
        activeVaults: 0,
        activeVaultsTrend: "Live",
        activeVaultsSubtext: "Active & unlocked",
        archivedVaults: 0,
        archivedVaultsTrend: "Live",
        archivedVaultsSubtext: "Archived custody",
        pendingAccess: 0,
        pendingAccessTrend: "Live",
        pendingAccessSubtext: "Requires review"
    },

    vaultTypesDistribution: [],
    vaults: [],
    trusteesDirectory: [],

    // Generic standard templates for quick actions
    templates: [
        { title: "Standard Estate Vault", type: "Personal", trustees: "3 Trustees (2-of-3)", desc: "Pre-configured for family legacy, identity records, and essential documents." },
        { title: "Corporate Succession Vault", type: "Business", trustees: "5 Trustees (3-of-5)", desc: "Designed for corporate shareholding, server access, and board resolution escrow." },
        { title: "Cryptographic Asset Vault", type: "Financial", trustees: "4 Trustees (3-of-4)", desc: "Optimized for hardware wallet seeds, multi-sig shards, and 2FA recovery." }
    ]
};

if (typeof window !== 'undefined') {
    window.AegisVaultMockData = AegisVaultMockData;
}
