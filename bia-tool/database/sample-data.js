/**
 * Sample Data for BIA Tool Database Demo
 * This file contains sample processes, impacts, and recovery objectives
 * for demonstrating the database functionality
 */

const SampleData = {
    /**
     * Generate sample processes
     */
    processes: [
        {
            id: 'PROC-001',
            name: 'Payment Processing',
            owner: 'Jane Smith',
            department: 'finance',
            description: 'Core payment processing system for customer transactions including credit card processing, ACH transfers, and wire transfers.',
            criticality: 'critical',
            status: 'approved',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-12-01T14:30:00Z'
        },
        {
            id: 'PROC-002',
            name: 'Customer Service Platform',
            owner: 'Mike Johnson',
            department: 'operations',
            description: 'Multi-channel customer support platform including phone, email, chat, and social media support.',
            criticality: 'essential',
            status: 'approved',
            createdAt: '2024-01-20T09:00:00Z',
            updatedAt: '2024-11-15T11:20:00Z'
        },
        {
            id: 'PROC-003',
            name: 'Inventory Management',
            owner: 'Sarah Williams',
            department: 'supply-chain',
            description: 'Real-time inventory tracking and management system for warehouse operations.',
            criticality: 'high',
            status: 'draft',
            createdAt: '2024-02-01T08:00:00Z',
            updatedAt: '2024-12-05T16:45:00Z'
        },
        {
            id: 'PROC-004',
            name: 'Order Fulfillment',
            owner: 'Tom Brown',
            department: 'operations',
            description: 'End-to-order order processing from placement to delivery confirmation.',
            criticality: 'high',
            status: 'in-review',
            createdAt: '2024-02-10T14:00:00Z',
            updatedAt: '2024-11-28T09:15:00Z'
        },
        {
            id: 'PROC-005',
            name: 'Email Communications',
            owner: 'Lisa Davis',
            department: 'it',
            description: 'Corporate email system and messaging infrastructure.',
            criticality: 'medium',
            status: 'approved',
            createdAt: '2024-02-15T11:00:00Z',
            updatedAt: '2024-10-20T13:30:00Z'
        }
    ],

    /**
     * Generate sample impact assessments
     */
    impacts: {
        'PROC-001': {
            financial: 5,
            operational: 4,
            reputational: 5,
            legal: 4,
            health: 0,
            environmental: 0,
            customer: 5,
            strategic: 4
        },
        'PROC-002': {
            financial: 3,
            operational: 4,
            reputational: 4,
            legal: 2,
            health: 0,
            environmental: 0,
            customer: 5,
            strategic: 3
        },
        'PROC-003': {
            financial: 4,
            operational: 5,
            reputational: 3,
            legal: 2,
            health: 0,
            environmental: 1,
            customer: 4,
            strategic: 3
        },
        'PROC-004': {
            financial: 4,
            operational: 4,
            reputational: 4,
            legal: 3,
            health: 0,
            environmental: 0,
            customer: 4,
            strategic: 3
        },
        'PROC-005': {
            financial: 2,
            operational: 3,
            reputational: 2,
            legal: 1,
            health: 0,
            environmental: 0,
            customer: 2,
            strategic: 2
        }
    },

    /**
     * Generate sample recovery objectives
     */
    recoveryObjectives: {
        'PROC-001': {
            mtpd: 4,
            rto: 2,
            rpo: 0,
            mbco: true,
            recoveryStrategy: 'high-availability',
            strategyNotes: 'Active-active data center with automatic failover'
        },
        'PROC-002': {
            mtpd: 24,
            rto: 8,
            rpo: 4,
            mbco: false,
            recoveryStrategy: 'warm-standby',
            strategyNotes: 'Secondary contact center with reduced capacity'
        },
        'PROC-003': {
            mtpd: 48,
            rto: 24,
            rpo: 8,
            mbco: false,
            recoveryStrategy: 'cold-backup',
            strategyNotes: 'Manual processes available for backup'
        },
        'PROC-004': {
            mtpd: 24,
            rto: 12,
            rpo: 2,
            mbco: true,
            recoveryStrategy: 'warm-standby',
            strategyNotes: 'Backup system with 4-hour activation'
        },
        'PROC-005': {
            mtpd: 72,
            rto: 24,
            rpo: 24,
            mbco: false,
            recoveryStrategy: 'cold-backup',
            strategyNotes: 'Cloud-based email with 24-hour recovery'
        }
    },

    /**
     * Generate sample timeline data
     */
    temporalData: {
        'PROC-001': [
            { timeOffset: 0, timeLabel: 'Immediate', financial: 2, operational: 1, reputational: 2, legal: 1, customer: 2, strategic: 1 },
            { timeOffset: 4, timeLabel: '4 hours', financial: 4, operational: 3, reputational: 4, legal: 2, customer: 4, strategic: 3 },
            { timeOffset: 8, timeLabel: '8 hours', financial: 5, operational: 4, reputational: 5, legal: 3, customer: 5, strategic: 4 },
            { timeOffset: 24, timeLabel: '1 day', financial: 5, operational: 5, reputational: 5, legal: 4, customer: 5, strategic: 5 }
        ],
        'PROC-002': [
            { timeOffset: 0, timeLabel: 'Immediate', financial: 1, operational: 1, reputational: 1, legal: 0, customer: 2, strategic: 1 },
            { timeOffset: 4, timeLabel: '4 hours', financial: 2, operational: 2, reputational: 2, legal: 1, customer: 3, strategic: 2 },
            { timeOffset: 8, timeLabel: '8 hours', financial: 3, operational: 3, reputational: 3, legal: 1, customer: 4, strategic: 2 },
            { timeOffset: 24, timeLabel: '1 day', financial: 3, operational: 4, reputational: 4, legal: 2, customer: 5, strategic: 3 }
        ]
    },

    /**
     * Generate sample dependencies
     */
    dependencies: {
        upstream: {
            'PROC-001': [
                { id: 'DEP-001', processId: 'PROC-003', type: 'operational', criticality: 4, strength: 0.8 },
                { id: 'DEP-002', processId: 'PROC-005', type: 'technical', criticality: 5, strength: 1.0 }
            ],
            'PROC-002': [
                { id: 'DEP-003', processId: 'PROC-005', type: 'technical', criticality: 3, strength: 0.9 }
            ],
            'PROC-004': [
                { id: 'DEP-004', processId: 'PROC-001', type: 'operational', criticality: 5, strength: 0.9 },
                { id: 'DEP-005', processId: 'PROC-003', type: 'operational', criticality: 4, strength: 0.8 }
            ]
        },
        downstream: {}
    },

    /**
     * Load sample data into AppState
     */
    loadIntoAppState() {
        if (typeof AppState !== 'undefined') {
            AppState.processes = this.processes;
            AppState.impacts = this.impacts;
            AppState.recoveryObjectives = this.recoveryObjectives;
            AppState.temporalData = this.temporalData;
            AppState.dependencies = this.dependencies;
            console.log('Sample data loaded into AppState');
            return true;
        }
        return false;
    },

    /**
     * Load sample data into database
     */
    async loadIntoDatabase() {
        if (typeof window.db === 'undefined') {
            console.error('Database not initialized');
            return { success: false, error: 'Database not initialized' };
        }

        await window.db.init();

        // Load processes
        for (const process of this.processes) {
            await window.db.insert('processes', {
                id: process.id,
                assessment_id: 'default-assessment',
                name: process.name,
                description: process.description,
                department: process.department,
                owner: process.owner,
                criticality_score: this.criticalityToScore(process.criticality),
                criticality: process.criticality,
                status: process.status,
                dependencies: '[]',
                created_at: process.createdAt,
                updated_at: process.updatedAt,
                sort_order: 0
            });
        }

        // Load impact assessments
        for (const [processId, impact] of Object.entries(this.impacts)) {
            await window.db.insert('impactAssessments', {
                id: processId,
                process_id: processId,
                ...impact,
                composite_score: this.calculateCompositeScore(impact),
                assessed_at: new Date().toISOString()
            });
        }

        // Load recovery objectives
        for (const [processId, recovery] of Object.entries(this.recoveryObjectives)) {
            await window.db.insert('recoveryObjectives', {
                id: processId,
                process_id: processId,
                ...recovery,
                mbco: recovery.mbco ? 1 : 0
            });
        }

        // Load timeline data
        for (const [processId, timeline] of Object.entries(this.temporalData)) {
            timeline.forEach((tp, index) => {
                window.db.insert('timelinePoints', {
                    id: `${processId}-tp-${index}`,
                    process_id: processId,
                    ...tp,
                    time_offset: tp.timeOffset,
                    legal: 0,
                    health: 0,
                    environmental: 0
                });
            });
        }

        console.log('Sample data loaded into database');
        return { success: true };
    },

    /**
     * Convert criticality string to score
     */
    criticalityToScore(criticality) {
        const scores = {
            'critical': 5,
            'high': 4,
            'medium': 3,
            'low': 2,
            'minimal': 1
        };
        return scores[criticality] || 3;
    },

    /**
     * Calculate composite impact score
     */
    calculateCompositeScore(impact) {
        const weights = {
            financial: 25,
            operational: 25,
            reputational: 20,
            legal: 15,
            health: 10,
            environmental: 5
        };
        
        const dimensions = ['financial', 'operational', 'reputational', 'legal', 'health', 'environmental'];
        let totalWeight = 0;
        let weightedScore = 0;
        
        dimensions.forEach(dim => {
            const weight = weights[dim] || 0;
            const score = impact[dim] || 0;
            totalWeight += weight;
            weightedScore += score * weight;
        });
        
        return totalWeight > 0 ? weightedScore / totalWeight : 0;
    }
};

// Make available globally
window.SampleData = SampleData;
