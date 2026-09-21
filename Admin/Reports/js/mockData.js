/**
 * AegisVault — Reports Module Mock Data
 * Realistic, enterprise-grade simulation data for college demonstration.
 * Structured for seamless future integration with Django REST Framework API endpoints.
 */

window.AegisReportMockData = {
    // KPI Metrics
    kpis: {
        totalReports: {
            value: 28,
            change: '+12%',
            trend: 'up',
            subtext: '+3 this month'
        },
        userReports: {
            value: '1,248',
            change: '+8%',
            trend: 'up',
            subtext: '43.6% of total'
        },
        securityReports: {
            value: 892,
            change: '+25%',
            trend: 'up',
            subtext: '31.9% of total'
        },
        vaultReports: {
            value: 614,
            change: '+10%',
            trend: 'up',
            subtext: '21.9% of total'
        }
    },

    // Report Generation Trend over time
    trends: {
        '12days': [
            { date: '01 Sep', count: 10, fullDate: '01 Sep 2025' },
            { date: '02 Sep', count: 14, fullDate: '02 Sep 2025' },
            { date: '03 Sep', count: 16, fullDate: '03 Sep 2025' },
            { date: '04 Sep', count: 18, fullDate: '04 Sep 2025' },
            { date: '05 Sep', count: 19, fullDate: '05 Sep 2025' },
            { date: '06 Sep', count: 21, fullDate: '06 Sep 2025' },
            { date: '07 Sep', count: 22, fullDate: '07 Sep 2025' },
            { date: '08 Sep', count: 25, fullDate: '08 Sep 2025' },
            { date: '09 Sep', count: 28, fullDate: '09 Sep 2025' },
            { date: '10 Sep', count: 33, fullDate: '10 Sep 2025' },
            { date: '11 Sep', count: 38, fullDate: '11 Sep 2025' },
            { date: '12 Sep', count: 42, fullDate: '12 Sep 2025' }
        ],
        '7days': [
            { date: '06 Sep', count: 21, fullDate: '06 Sep 2025' },
            { date: '07 Sep', count: 22, fullDate: '07 Sep 2025' },
            { date: '08 Sep', count: 25, fullDate: '08 Sep 2025' },
            { date: '09 Sep', count: 28, fullDate: '09 Sep 2025' },
            { date: '10 Sep', count: 33, fullDate: '10 Sep 2025' },
            { date: '11 Sep', count: 38, fullDate: '11 Sep 2025' },
            { date: '12 Sep', count: 42, fullDate: '12 Sep 2025' }
        ],
        '30days': [
            { date: '14 Aug', count: 8, fullDate: '14 Aug 2025' },
            { date: '18 Aug', count: 12, fullDate: '18 Aug 2025' },
            { date: '22 Aug', count: 15, fullDate: '22 Aug 2025' },
            { date: '26 Aug', count: 19, fullDate: '26 Aug 2025' },
            { date: '30 Aug', count: 22, fullDate: '30 Aug 2025' },
            { date: '03 Sep', count: 27, fullDate: '03 Sep 2025' },
            { date: '07 Sep', count: 34, fullDate: '07 Sep 2025' },
            { date: '12 Sep', count: 42, fullDate: '12 Sep 2025' }
        ]
    },

    // Reports Breakdown by Type
    reportsByType: [
        { label: 'User Activity', count: 12, percentage: 43.6, color: '#00B4D8' },
        { label: 'Security Events', count: 9, percentage: 31.9, color: '#E85D75' },
        { label: 'Vault Activity', count: 6, percentage: 21.9, color: '#F77F00' },
        { label: 'System Health', count: 2, percentage: 7.1, color: '#9D4EDD' },
        { label: 'Compliance', count: 1, percentage: 3.6, color: '#E63946' }
    ],

    // Report Status Breakdown
    reportStatus: [
        { label: 'Completed', count: 22, percentage: 78.6, color: '#10B981' },
        { label: 'Generating', count: 3, percentage: 10.7, color: '#3B82F6' },
        { label: 'Failed', count: 1, percentage: 3.6, color: '#EF4444' }
    ],

    // Recent Reports Records Table
    reportsList: [
        {
            id: 'RPT-2025-0912-01',
            num: 1,
            name: 'User Activity Report - September 2025',
            type: 'User',
            typeClass: 'badge-user',
            generatedBy: 'admin',
            dateTime: '12 Sep 2025, 10:24 AM',
            status: 'Completed',
            statusClass: 'status-completed',
            format: 'PDF',
            fileSize: '3.4 MB',
            checksum: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            summary: 'Aggregated user authentication logs, password resets, active trustee invitations, and role elevation attempts across all enterprise accounts.',
            recordsCount: 1420
        },
        {
            id: 'RPT-2025-0912-02',
            num: 2,
            name: 'Security Events Report',
            type: 'Security',
            typeClass: 'badge-security',
            generatedBy: 'admin',
            dateTime: '12 Sep 2025, 09:18 AM',
            status: 'Completed',
            statusClass: 'status-completed',
            format: 'CSV',
            fileSize: '1.8 MB',
            checksum: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
            summary: 'Comprehensive anomaly detection summary, brute-force IP mitigations, HSM tamper triggers, and zero-knowledge verification challenge audits.',
            recordsCount: 892
        },
        {
            id: 'RPT-2025-0911-03',
            num: 3,
            name: 'Vault Usage Statistics',
            type: 'Vault',
            typeClass: 'badge-vault',
            generatedBy: 'system',
            dateTime: '11 Sep 2025, 11:30 PM',
            status: 'Generating',
            statusClass: 'status-generating',
            format: 'Excel',
            fileSize: '4.1 MB',
            checksum: 'sha256:pending_computation_hash',
            summary: 'Active digital custody lockers, Shamir threshold configurations, heartbeat trigger cycles, and scheduled asset release countdown states.',
            recordsCount: 614
        },
        {
            id: 'RPT-2025-0911-04',
            num: 4,
            name: 'System Health Report',
            type: 'System',
            typeClass: 'badge-system',
            generatedBy: 'admin',
            dateTime: '11 Sep 2025, 08:42 PM',
            status: 'Completed',
            statusClass: 'status-completed',
            format: 'JSON',
            fileSize: '890 KB',
            checksum: 'sha256:2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
            summary: 'PostgreSQL read-replica latency logs, Redis cryptographic session caches, WebSocket heartbeat listeners, and API gateway uptime telemetry.',
            recordsCount: 420
        },
        {
            id: 'RPT-2025-0910-05',
            num: 5,
            name: 'Compliance & Audit Summary',
            type: 'Compliance',
            typeClass: 'badge-compliance',
            generatedBy: 'admin',
            dateTime: '10 Sep 2025, 04:15 PM',
            status: 'Failed',
            statusClass: 'status-failed',
            format: 'PDF',
            fileSize: '0 KB',
            checksum: 'N/A (Generation Timeout)',
            summary: 'SOC 2 Type II readiness ledger, zero-knowledge custody validation, and immutable multi-signature verification log reconciliation. Task timed out during HSM signing challenge.',
            recordsCount: 0
        },
        {
            id: 'RPT-2025-0910-06',
            num: 6,
            name: 'Trustee Shard Distribution Audit',
            type: 'Vault',
            typeClass: 'badge-vault',
            generatedBy: 'system',
            dateTime: '10 Sep 2025, 01:20 PM',
            status: 'Completed',
            statusClass: 'status-completed',
            format: 'PDF',
            fileSize: '2.1 MB',
            checksum: 'sha256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
            summary: 'Shamir Secret Sharing split confirmation for all 614 active vaults. Zero cleartext keys exposed.',
            recordsCount: 1840
        },
        {
            id: 'RPT-2025-0909-07',
            num: 7,
            name: 'Heartbeat Inactivity Alert Log',
            type: 'Security',
            typeClass: 'badge-security',
            generatedBy: 'admin',
            dateTime: '09 Sep 2025, 11:05 AM',
            status: 'Completed',
            statusClass: 'status-completed',
            format: 'CSV',
            fileSize: '1.2 MB',
            checksum: 'sha256:ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
            summary: 'Missed heartbeat notifications, grace period extensions, and trustee notification dispatches.',
            recordsCount: 88
        },
        {
            id: 'RPT-2025-0908-08',
            num: 8,
            name: 'Biometric & Passkey Authentications',
            type: 'User',
            typeClass: 'badge-user',
            generatedBy: 'system',
            dateTime: '08 Sep 2025, 06:14 PM',
            status: 'Completed',
            statusClass: 'status-completed',
            format: 'JSON',
            fileSize: '740 KB',
            checksum: 'sha256:d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
            summary: 'FIDO2 WebAuthn authentication successes and security key registration records.',
            recordsCount: 652
        }
    ]
};
