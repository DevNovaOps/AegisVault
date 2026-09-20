/**
 * AegisVault — Mock Data Repository
 * Provides structured data for Owner and Trustee dashboards,
 * activities, vaults, notifications, search index, and countdown timers.
 */

const AegisData = {
    // Current Authenticated User (Owner)
    currentUser: {
        id: 'usr_owner_001',
        name: 'Aryan Patel',
        initials: 'AP',
        role: 'Vault Owner & Custodian',
        email: 'aryan.patel@aegisvault.internal',
        avatarBg: '#2563EB',
        lastLogin: '12 Sep 2025, 09:14 AM',
        status: 'Active'
    },

    // Current Trustee Profile (for Trustee Dashboard view)
    trusteeUser: {
        id: 'usr_trustee_001',
        name: 'Rakesh Patel',
        initials: 'RP',
        relation: 'Trustee (Father)',
        email: 'rakesh.patel@example.com',
        status: 'Verified',
        assignedVaultsCount: 2,
        verifiedDate: '08 Sep 2025'
    },

    // Owner Dashboard Metrics
    ownerMetrics: {
        vaultStatus: 'ACTIVE',
        statusDescription: 'Your vault is secure and on track.',
        trusteesCount: 4,
        trusteesTotal: 5,
        thresholdCount: 3,
        thresholdTotal: 5,
        vaultItemsCount: 18,
        accountSecurity: 'Strong',
        daysLeft: 23,
        pendingActions: 0,
        lastCheckIn: '12 Sep 2025, 09:14 AM',
        // Countdown initial offsets in seconds (23d 14h 32m 18s = 2039538s)
        countdownSeconds: (23 * 86400) + (14 * 3600) + (32 * 60) + 18
    },

    // Trustee Dashboard Metrics
    trusteeMetrics: {
        assignedVaults: 2,
        shareSubmitted: 1,
        pendingRequests: 0,
        activeReleases: 0
    },

    // Vault Item Category Distribution (Donut Chart)
    vaultCategories: [
        { name: 'Documents', count: 7, percentage: 39, color: '#3B82F6', icon: 'file-text' },
        { name: 'Photos', count: 5, percentage: 28, color: '#06B6D4', icon: 'image' },
        { name: 'Financial', count: 3, percentage: 17, color: '#10B981', icon: 'dollar-sign' },
        { name: 'Personal', count: 2, percentage: 11, color: '#F43F5E', icon: 'user' },
        { name: 'Other', count: 1, percentage: 5, color: '#8B5CF6', icon: 'folder' }
    ],

    // Owner Recent Activity List
    recentActivity: [
        {
            id: 'act_001',
            type: 'heartbeat',
            title: 'Heartbeat completed',
            timestamp: '12 Sep 2025, 09:14 AM',
            iconColor: '#10B981',
            icon: 'check-circle',
            details: 'Proof-of-life beacon cryptographically verified via FIDO2 key. Timer reset to 30 days.'
        },
        {
            id: 'act_002',
            type: 'item',
            title: 'New item added: Bank Statement',
            timestamp: '10 Sep 2025, 04:22 PM',
            iconColor: '#F59E0B',
            icon: 'file-text',
            details: 'HDFC_Wealth_Statement_2025.pdf encrypted with AES-256-GCM and placed in Financial category.'
        },
        {
            id: 'act_003',
            type: 'trustee',
            title: 'Trustee invited: Meera Patel',
            timestamp: '08 Sep 2025, 11:10 AM',
            iconColor: '#3B82F6',
            icon: 'users',
            details: 'Invitation sent to meera.patel@example.com with 24-hour verification window.'
        },
        {
            id: 'act_004',
            type: 'security',
            title: 'Security setting updated',
            timestamp: '05 Sep 2025, 07:30 PM',
            iconColor: '#64748B',
            icon: 'shield',
            details: 'Shamir Secret Sharing threshold confirmed at 3 of 5 trustees for primary legacy release.'
        },
        {
            id: 'act_005',
            type: 'item',
            title: 'Will & Testament Revision Encrypted',
            timestamp: '01 Sep 2025, 02:15 PM',
            iconColor: '#F59E0B',
            icon: 'file-text',
            details: 'Updated legal document hash matched with local GPG signature.'
        },
        {
            id: 'act_006',
            type: 'trustee',
            title: 'Rakesh Patel verified as Trustee',
            timestamp: '28 Aug 2025, 10:00 AM',
            iconColor: '#10B981',
            icon: 'check-circle',
            details: 'Government e-KYC and biometric identity check passed successfully.'
        }
    ],

    // Trustee Assigned Vaults
    assignedVaults: [
        {
            id: 'vlt_001',
            name: 'Personal Vault',
            owner: 'Aryan Patel',
            status: 'Verified',
            shareStatus: 'Submitted',
            threshold: '3 / 5',
            thresholdCurrent: 3,
            thresholdRequired: 5,
            iconColor: '#F59E0B',
            iconBg: 'rgba(245, 158, 11, 0.15)',
            description: 'Primary personal estate holding estate deeds, financial keys, and emergency credentials.',
            itemsCount: 12,
            yourShareId: 'SSS-KEY-0X9F2A',
            submissionDate: '10 Sep 2025, 03:21 PM',
            releaseTrigger: 'Inactivity Heartbeat Expiry (30 Days)'
        },
        {
            id: 'vlt_002',
            name: 'Family Vault',
            owner: 'Aryan Patel',
            status: 'Verified',
            shareStatus: 'Pending',
            threshold: '2 / 4',
            thresholdCurrent: 2,
            thresholdRequired: 4,
            iconColor: '#EF4444',
            iconBg: 'rgba(239, 68, 68, 0.15)',
            description: 'Shared family legacy archive containing photographs, heirloom histories, and family trusts.',
            itemsCount: 6,
            yourShareId: 'SSS-KEY-0X4B1C',
            submissionDate: 'Pending Trustee Upload',
            releaseTrigger: 'Mutual Trustee Consensus (2 of 4)'
        }
    ],

    // Trustee Recent Updates (Timeline)
    trusteeUpdates: [
        {
            id: 'tup_001',
            title: 'You submitted your share',
            timestamp: '10 Sep 2025, 03:21 PM',
            color: '#10B981',
            description: 'Cryptographic Shamir share uploaded for Personal Vault.'
        },
        {
            id: 'tup_002',
            title: 'You were verified as trustee',
            timestamp: '08 Sep 2025, 11:10 AM',
            color: '#06B6D4',
            description: 'Multi-factor KYC and biometric identity confirmed.'
        },
        {
            id: 'tup_003',
            title: 'Assigned to Family Vault',
            timestamp: '08 Sep 2025, 11:10 AM',
            color: '#3B82F6',
            description: 'Added as secondary custodian with 2-of-4 key share.'
        },
        {
            id: 'tup_004',
            title: 'Invitation received',
            timestamp: '07 Sep 2025, 06:45 PM',
            color: '#64748B',
            description: 'Aryan Patel invited you to become a designated estate trustee.'
        }
    ],

    // Search Index for Global Search Bar
    searchItems: [
        { title: 'Personal Vault', category: 'Vault', type: 'vault', id: 'vlt_001', snippet: 'Owner: Aryan Patel • Threshold 3/5' },
        { title: 'Family Vault', category: 'Vault', type: 'vault', id: 'vlt_002', snippet: 'Owner: Aryan Patel • Threshold 2/4' },
        { title: 'Bank Statement (HDFC)', category: 'Vault Item', type: 'item', id: 'act_002', snippet: 'Financial • Encrypted AES-256' },
        { title: 'Will & Estate Deed', category: 'Vault Item', type: 'item', id: 'act_005', snippet: 'Legal Documents • 4.2 MB' },
        { title: 'Rakesh Patel', category: 'Trustee', type: 'trustee', id: 'usr_trustee_001', snippet: 'Father • Verified • Share Submitted' },
        { title: 'Meera Patel', category: 'Trustee', type: 'trustee', id: 'act_003', snippet: 'Sister • Verification Pending' },
        { title: 'Heartbeat Check-In Log', category: 'Log', type: 'activity', id: 'act_001', snippet: '12 Sep 2025, 09:14 AM • Success' },
        { title: 'Shamir Secret Sharing Settings', category: 'Settings', type: 'security', id: 'act_004', snippet: 'Threshold M-of-N Cryptography' },
        { title: 'FIDO2 Hardware Key Authentication', category: 'Security', type: 'security', id: 'act_001', snippet: 'YubiKey 5 NFC Hardware Protection' }
    ],

    // Notifications List
    notifications: [
        {
            id: 'notif_001',
            title: 'Next Heartbeat Due in 23 Days',
            time: '2 hours ago',
            read: false,
            type: 'info',
            icon: 'heart'
        },
        {
            id: 'notif_002',
            title: 'Meera Patel accepted invitation',
            time: 'Yesterday',
            read: false,
            type: 'success',
            icon: 'user-check'
        },
        {
            id: 'notif_003',
            title: 'Annual Cryptographic Re-seed complete',
            time: '3 days ago',
            read: true,
            type: 'security',
            icon: 'shield-check'
        }
    ]
};

// Export to global scope
if (typeof window !== 'undefined') {
    window.AegisData = AegisData;
}
