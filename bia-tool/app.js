/**
 * ISO 22301:2019 Business Impact Analysis Tool
 * Main Application JavaScript - Process-Centric Workflow
 */

// ========================================
// Application State Management
// ========================================

const AppState = {
    currentSection: 'dashboard',
    currentAssessment: {
        processId: null,
        currentTab: 'basic',
        currentStep: 1,
        isDirty: false,
        lastSaved: null
    },
    processes: [],
    impacts: {},
    recoveryObjectives: {},
    temporalData: {},
    dependencies: {
        upstream: {},
        downstream: {}
    },
    resources: {
        personnel: {},
        technology: {},
        equipment: {},
        facilities: {},
        suppliers: {}
    },
    assessmentStatus: {}, // Tracks assessment completion status per process
    reports: [],
    auditTrail: [],
    settings: {
        mandatoryFields: [],
        validationRules: [],
        weights: {
            financial: 25,
            operational: 25,
            reputational: 20,
            legal: 15,
            health: 10,
            environmental: 5
        },
        timeHorizons: [
            { id: 'immediate', name: 'Immediate', hours: 4, label: '0-4 hours' },
            { id: 'short', name: 'Short-term', hours: 24, label: '4-24 hours' },
            { id: 'medium', name: 'Medium-term', hours: 72, label: '1-3 days' },
            { id: 'extended', name: 'Extended', hours: 168, label: '3-7 days' },
            { id: 'prolonged', name: 'Prolonged', hours: 672, label: '1-4 weeks' }
        ],
        impactCategories: [
            { id: 'financial', name: 'Financial Impact', icon: 'fa-dollar-sign', color: '#10b981' },
            { id: 'operational', name: 'Operational Impact', icon: 'fa-industry', color: '#0ea5e9' },
            { id: 'reputational', name: 'Reputational Impact', icon: 'fa-building', color: '#f59e0b' },
            { id: 'legal', name: 'Legal/Regulatory Impact', icon: 'fa-gavel', color: '#ef4444' },
            { id: 'health', name: 'Health & Safety Impact', icon: 'fa-heartbeat', color: '#ec4899' },
            { id: 'environmental', name: 'Environmental Impact', icon: 'fa-leaf', color: '#22c55e' }
        ]
    },
    notifications: [],
    isSidebarCollapsed: false
};

// ========================================
// Sample Data
// ========================================

function initializeSampleData() {
    // Sample processes
    AppState.processes = [
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
            department: 'operations',
            description: 'Real-time inventory tracking and management system for warehouse and retail operations.',
            criticality: 'essential',
            status: 'review',
            createdAt: '2024-02-01T08:00:00Z',
            updatedAt: '2024-12-05T16:45:00Z'
        },
        {
            id: 'PROC-004',
            name: 'Employee Payroll',
            owner: 'Robert Brown',
            department: 'hr',
            description: 'Monthly employee salary processing, tax calculations, and direct deposit distribution.',
            criticality: 'necessary',
            status: 'approved',
            createdAt: '2024-02-10T10:00:00Z',
            updatedAt: '2024-11-30T09:15:00Z'
        },
        {
            id: 'PROC-005',
            name: 'Marketing Analytics',
            owner: 'Emily Davis',
            department: 'marketing',
            description: 'Campaign performance tracking, analytics dashboard, and customer insight reporting.',
            criticality: 'desirable',
            status: 'draft',
            createdAt: '2024-03-01T14:00:00Z',
            updatedAt: '2024-12-10T10:00:00Z'
        },
        {
            id: 'PROC-006',
            name: 'Order Fulfillment',
            owner: 'Michael Chen',
            department: 'operations',
            description: 'End-to-end order processing, picking, packing, and shipping workflow management.',
            criticality: 'critical',
            status: 'approved',
            createdAt: '2024-01-25T11:00:00Z',
            updatedAt: '2024-12-08T13:30:00Z'
        },
        {
            id: 'PROC-007',
            name: 'IT Service Desk',
            owner: 'David Wilson',
            department: 'it',
            description: 'Internal IT support ticketing system and service request management for all employees.',
            criticality: 'essential',
            status: 'approved',
            createdAt: '2024-02-15T09:00:00Z',
            updatedAt: '2024-11-28T15:00:00Z'
        },
        {
            id: 'PROC-008',
            name: 'Financial Reporting',
            owner: 'Lisa Anderson',
            department: 'finance',
            description: 'Monthly and quarterly financial statement preparation, regulatory reporting, and audit support.',
            criticality: 'necessary',
            status: 'draft',
            createdAt: '2024-03-10T08:00:00Z',
            updatedAt: '2024-12-12T11:45:00Z'
        }
    ];

    // Initialize assessment status for all processes
    AppState.processes.forEach(process => {
        AppState.assessmentStatus[process.id] = {
            status: process.status === 'approved' ? 'completed' : process.status === 'review' ? 'in-progress' : 'pending',
            progress: 0,
            lastAssessment: process.updatedAt,
            completedTabs: []
        };
    });

    // Sample impact assessments
    AppState.impacts = {
        'PROC-001': {
            financial: { level: 5, description: 'Complete loss of revenue processing capability, estimated $50K per hour' },
            operational: { level: 5, description: 'Total halt of payment processing affecting all customer transactions' },
            reputational: { level: 4, description: 'Significant customer trust impact, potential regulatory scrutiny' },
            legal: { level: 3, description: 'Contractual SLA breaches with enterprise customers' },
            health: { level: 1, description: 'No health and safety impact' },
            environmental: { level: 1, description: 'No environmental impact' },
            confidence: 'high',
            assessedAt: '2024-11-20T10:00:00Z'
        },
        'PROC-002': {
            financial: { level: 2, description: 'Limited direct financial impact, potential refund costs' },
            operational: { level: 4, description: 'Significant degradation of customer service capabilities' },
            reputational: { level: 4, description: 'Negative customer feedback on social media and review sites' },
            legal: { level: 2, description: 'Potential customer complaint escalation' },
            health: { level: 1, description: 'No health and safety impact' },
            environmental: { level: 1, description: 'No environmental impact' },
            confidence: 'high',
            assessedAt: '2024-11-18T14:30:00Z'
        },
        'PROC-006': {
            financial: { level: 5, description: 'Direct revenue loss from unfulfilled orders, approximately $75K per day' },
            operational: { level: 4, description: 'Major disruption to fulfillment operations, customer order delays' },
            reputational: { level: 3, description: 'Customer dissatisfaction and negative reviews' },
            legal: { level: 2, description: 'Potential breach of delivery commitments' },
            health: { level: 1, description: 'No health and safety impact' },
            environmental: { level: 1, description: 'No environmental impact' },
            confidence: 'high',
            assessedAt: '2024-11-25T09:00:00Z'
        }
    };

    // Sample temporal data
    AppState.temporalData = {
        'PROC-001': {
            immediate: { financial: 5, operational: 5, reputational: 3, legal: 2, health: 1, environmental: 1 },
            short: { financial: 5, operational: 5, reputational: 4, legal: 3, health: 1, environmental: 1 },
            medium: { financial: 4, operational: 5, reputational: 4, legal: 3, health: 1, environmental: 1 },
            extended: { financial: 4, operational: 4, reputational: 4, legal: 3, health: 1, environmental: 1 }
        },
        'PROC-002': {
            immediate: { financial: 1, operational: 2, reputational: 2, legal: 1, health: 1, environmental: 1 },
            short: { financial: 2, operational: 4, reputational: 4, legal: 2, health: 1, environmental: 1 },
            medium: { financial: 2, operational: 5, reputational: 5, legal: 2, health: 1, environmental: 1 },
            extended: { financial: 3, operational: 4, reputational: 4, legal: 3, health: 1, environmental: 1 }
        }
    };

    // Sample recovery objectives
    AppState.recoveryObjectives = {
        'PROC-001': {
            mtpd: 4, mtpdUnit: 'hours',
            rto: 2, rtoUnit: 'hours',
            rpo: 15, rpoUnit: 'minutes',
            mbco: 75,
            strategy: 'hot-site',
            procedureNotes: 'Immediate failover to backup payment gateway. Manual processing procedures available for critical transactions.',
            assessedAt: '2024-11-22T11:00:00Z'
        },
        'PROC-002': {
            mtpd: 24, mtpdUnit: 'hours',
            rto: 8, rtoUnit: 'hours',
            rpo: 240, rpoUnit: 'minutes',
            mbco: 50,
            strategy: 'quick',
            procedureNotes: 'Activate overflow call center capacity. Redirect to email support channel.',
            assessedAt: '2024-11-20T15:30:00Z'
        },
        'PROC-003': {
            mtpd: 48, mtpdUnit: 'hours',
            rto: 12, rtoUnit: 'hours',
            rpo: 480, rpoUnit: 'minutes',
            mbco: 60,
            strategy: 'backup',
            procedureNotes: 'Manual inventory counts and reorder processes. Use backup spreadsheet system.',
            assessedAt: '2024-11-25T10:00:00Z'
        },
        'PROC-006': {
            mtpd: 8, mtpdUnit: 'hours',
            rto: 4, rtoUnit: 'hours',
            rpo: 30, rpoUnit: 'minutes',
            mbco: 80,
            strategy: 'ha',
            procedureNotes: 'Real-time sync with secondary fulfillment center. Priority rerouting of orders.',
            assessedAt: '2024-11-28T09:00:00Z'
        }
    };

    // Sample dependencies
    AppState.dependencies = {
        upstream: {
            'PROC-001': [
                { type: 'system', name: 'Payment Gateway', criticality: 'critical' },
                { type: 'supplier', name: 'Banking Partner', criticality: 'critical' },
                { type: 'personnel', name: 'Payment Specialists', criticality: 'high' },
                { type: 'facility', name: 'Data Center', criticality: 'high' }
            ],
            'PROC-002': [
                { type: 'system', name: 'CRM Platform', criticality: 'high' },
                { type: 'system', name: 'Phone System', criticality: 'high' },
                { type: 'personnel', name: 'Support Agents', criticality: 'critical' }
            ],
            'PROC-006': [
                { type: 'process', name: 'Inventory Management', criticality: 'critical' },
                { type: 'system', name: 'WMS System', criticality: 'critical' },
                { type: 'facility', name: 'Warehouse', criticality: 'high' },
                { type: 'utility', name: 'Power Supply', criticality: 'high' }
            ]
        },
        downstream: {
            'PROC-001': [
                { type: 'process', name: 'Order Fulfillment', criticality: 'critical' },
                { type: 'process', name: 'Financial Reporting', criticality: 'high' }
            ],
            'PROC-006': [
                { type: 'customer', name: 'E-commerce Customers', criticality: 'critical' },
                { type: 'process', name: 'Customer Service Platform', criticality: 'high' }
            ]
        }
    };

    // Sample resources
    AppState.resources = {
        personnel: {
            'PROC-001': [
                { role: 'Payment Specialist', minStaffing: 3, keyPersonnel: 'Jane Smith', skills: 'Financial operations, Reconciliation', alternatives: 'Contract staff, Cross-trained finance team' },
                { role: 'Fraud Analyst', minStaffing: 2, keyPersonnel: 'Tom Wilson', skills: 'Fraud detection, Transaction monitoring', alternatives: 'External fraud monitoring service' }
            ],
            'PROC-002': [
                { role: 'Support Agent', minStaffing: 10, keyPersonnel: 'Mike Johnson', skills: 'Customer service, Product knowledge', alternatives: 'Outsourced support center, Overflow queue' }
            ]
        },
        technology: {
            'PROC-001': [
                { system: 'Payment Gateway', criticality: 'High', alternatives: 'Manual processing, Secondary gateway', rto: '2 hours' },
                { system: 'Transaction Database', criticality: 'Critical', alternatives: 'Read-only mode, Backup server', rto: '1 hour' }
            ],
            'PROC-006': [
                { system: 'WMS', criticality: 'Critical', alternatives: 'Manual picking, Backup WMS', rto: '4 hours' },
                { system: 'Barcode Scanners', criticality: 'High', alternatives: 'Manual entry, Spare devices', rto: '30 minutes' }
            ]
        },
        equipment: {
            'PROC-006': [
                { name: 'Forklifts', location: 'Warehouse', leadTime: '2 hours', altSource: 'Equipment rental company' },
                { name: 'Packing Stations', location: 'Packing Area', leadTime: 'Immediate', altSource: 'Convert conference room' }
            ]
        },
        facilities: {
            'PROC-001': [
                { name: 'Primary Data Center', type: 'datacenter', recovery: 'Hot Site - Secondary Location', criticality: 'Critical' }
            ],
            'PROC-006': [
                { name: 'Main Warehouse', type: 'warehouse', recovery: 'Secondary Fulfillment Center', criticality: 'Critical' }
            ]
        },
        suppliers: {
            'PROC-001': [
                { name: 'Primary Payment Processor', service: 'Transaction Processing', sla: '15 min response', backup: 'Backup Payment Processor' },
                { name: 'Banking Partner', service: 'Fund Settlement', sla: '1 hour cutoff', backup: 'Secondary Bank Account' }
            ],
            'PROC-006': [
                { name: 'Courier Service', service: 'Package Delivery', sla: 'Daily pickup', backup: 'Alternative Courier' }
            ]
        }
    };

    // Sample notifications
    AppState.notifications = [
        { id: 1, type: 'warning', title: 'Review Required', message: 'PROC-005 Impact Assessment pending review', time: '2 hours ago' },
        { id: 2, type: 'info', title: 'Assessment Complete', message: 'PROC-006 Recovery Objectives approved', time: '5 hours ago' },
        { id: 3, type: 'success', title: 'New Process Added', message: 'PROC-008 has been added to the inventory', time: '1 day ago' },
        { id: 4, type: 'info', title: 'Dependency Warning', message: 'PROC-001 has 2 critical dependencies without alternatives', time: '3 hours ago' }
    ];

    // Sample audit trail
    AppState.auditTrail = [
        { timestamp: new Date().toISOString(), user: 'John Doe', action: 'Created', item: 'PROC-008', details: 'New process added' },
        { timestamp: new Date(Date.now() - 86400000).toISOString(), user: 'Jane Smith', action: 'Updated', item: 'PROC-001', details: 'Modified recovery objectives' },
        { timestamp: new Date(Date.now() - 172800000).toISOString(), user: 'Mike Johnson', action: 'Approved', item: 'PROC-002', details: 'Impact assessment approved' },
        { timestamp: new Date(Date.now() - 259200000).toISOString(), user: 'Sarah Williams', action: 'Updated', item: 'PROC-003', details: 'Added upstream dependencies' },
        { timestamp: new Date(Date.now() - 345600000).toISOString(), user: 'Lisa Anderson', action: 'Created', item: 'PROC-008', details: 'Initial process documentation' }
    ];

    // Sample reports
    AppState.reports = [
        { id: 1, name: 'Executive Summary - Q4 2024', type: 'executive', date: new Date().toISOString(), status: 'completed' },
        { id: 2, name: 'Detailed BIA Report', type: 'detailed', date: new Date(Date.now() - 604800000).toISOString(), status: 'completed' },
        { id: 3, name: 'Gap Analysis - Critical Processes', type: 'gaps', date: new Date(Date.now() - 1209600000).toISOString(), status: 'completed' }
    ];

    // Update assessment status based on completed data
    updateAssessmentStatusFromData();
}

function updateAssessmentStatusFromData() {
    AppState.processes.forEach(process => {
        const id = process.id;
        let completedTabs = [];
        let progress = 0;

        if (AppState.impacts[id]) {
            completedTabs.push('impacts');
        }
        if (AppState.recoveryObjectives[id]) {
            completedTabs.push('recovery');
        }
        if (AppState.dependencies.upstream[id] || AppState.dependencies.downstream[id]) {
            completedTabs.push('dependencies');
        }
        if (AppState.resources.personnel[id] || AppState.resources.technology[id]) {
            completedTabs.push('resources');
        }

        progress = Math.round((completedTabs.length / 5) * 100);

        let status = 'pending';
        if (progress === 100) {
            status = 'completed';
        } else if (progress > 0) {
            status = 'in-progress';
        }

        AppState.assessmentStatus[id] = {
            status: status,
            progress: progress,
            lastAssessment: process.updatedAt,
            completedTabs: completedTabs
        };
    });
}

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize sample data
    initializeSampleData();
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        
        // Initialize application modules
        initDashboard();
        initProcessesTable();
        initAssessmentSection();
        initImpactAssessment();
        initTemporalAnalysis();
        initRecoveryObjectives();
        initPrioritisationEngine();
        initDependencyMapping();
        initResourceAnalysis();
        initComplianceSection();
        initSettingsSection();
        initNotifications();
        initAssessmentProcessSelect();
        
    }, 1500);
});

// ========================================
// Navigation Functions
// ========================================

function showSection(sectionId) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        }
    });
    
    // Show section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        processes: 'Process Identification',
        assessment: 'Process Assessment Center',
        impact: 'Impact Assessment Framework',
        temporal: 'Temporal Analysis',
        recovery: 'Recovery Objectives',
        prioritisation: 'Prioritisation Engine',
        dependencies: 'Dependency Mapping',
        resources: 'Resource Analysis',
        reports: 'Reports & Export',
        compliance: 'ISO Compliance',
        settings: 'Settings & Controls'
    };
    document.getElementById('page-title').textContent = titles[sectionId] || 'Dashboard';
    
    AppState.currentSection = sectionId;
    
    // Initialize section-specific content
    if (sectionId === 'assessment') {
        refreshAssessmentList();
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    AppState.isSidebarCollapsed = !AppState.isSidebarCollapsed;
}

function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// ========================================
// Dashboard Functions
// ========================================

function initDashboard() {
    updateKPIs();
    initDashboardCharts();
    updateActivityList();
    updateAlertsList();
    updateProgressBars();
}

function updateKPIs() {
    const processes = AppState.processes;
    
    document.getElementById('total-processes').textContent = processes.length;
    
    const criticalCount = processes.filter(p => p.criticality === 'critical').length;
    document.getElementById('critical-processes').textContent = criticalCount;
    
    // Calculate compliance score based on completion
    const withImpacts = Object.keys(AppState.impacts).length;
    const withRecovery = Object.keys(AppState.recoveryObjectives).length;
    const totalPossible = processes.length;
    
    const compliance = Math.round(((withImpacts + withRecovery) / (totalPossible * 2)) * 100);
    document.getElementById('compliance-score').textContent = Math.min(compliance, 100) + '%';
    
    const pendingReviews = Object.values(AppState.assessmentStatus).filter(s => s.status === 'in-progress').length;
    document.getElementById('pending-reviews').textContent = pendingReviews;
}

function initDashboardCharts() {
    // Criticality distribution chart
    const criticalityCtx = document.getElementById('criticality-chart');
    if (criticalityCtx) {
        const criticalityData = {
            labels: ['Critical', 'Essential', 'Necessary', 'Desirable'],
            datasets: [{
                data: [
                    AppState.processes.filter(p => p.criticality === 'critical').length,
                    AppState.processes.filter(p => p.criticality === 'essential').length,
                    AppState.processes.filter(p => p.criticality === 'necessary').length,
                    AppState.processes.filter(p => p.criticality === 'desirable').length
                ],
                backgroundColor: ['#ef4444', '#f59e0b', '#0ea5e9', '#64748b']
            }]
        };
        
        new Chart(criticalityCtx, {
            type: 'doughnut',
            data: criticalityData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Impact by category chart
    const impactCtx = document.getElementById('impact-chart');
    if (impactCtx) {
        const categories = ['Financial', 'Operational', 'Reputational', 'Legal', 'Health', 'Environmental'];
        const impactData = categories.map((cat, index) => {
            let total = 0;
            let count = 0;
            const catKey = cat.toLowerCase().replace(' ', '').replace('/', '');
            
            Object.values(AppState.impacts).forEach(impact => {
                if (impact[catKey]) {
                    total += impact[catKey].level || 0;
                    count++;
                }
            });
            return count > 0 ? Math.round((total / count) * 20) : 0;
        });
        
        new Chart(impactCtx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Average Impact Score',
                    data: impactData,
                    backgroundColor: ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#ec4899', '#22c55e']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    // Recovery timeline chart
    const timelineCtx = document.getElementById('recovery-timeline-chart');
    if (timelineCtx) {
        const criticalProcesses = AppState.processes
            .filter(p => p.criticality === 'critical' && AppState.recoveryObjectives[p.id])
            .slice(0, 5);
        
        const labels = ['0h', '2h', '4h', '8h', '12h', '24h', '48h'];
        
        const datasets = criticalProcesses.map((process, index) => {
            const colors = ['#ef4444', '#f59e0b', '#0ea5e9', '#22c55e', '#8b5cf6'];
            const recovery = AppState.recoveryObjectives[process.id];
            const rto = recovery.rto;
            
            return {
                label: process.name,
                data: labels.map((_, i) => {
                    const hours = i * (i <= 3 ? 1 : i <= 5 ? 4 : 24);
                    if (hours <= rto) return 100;
                    return Math.max(0, 100 - (hours - rto) * 5);
                }),
                borderColor: colors[index],
                backgroundColor: colors[index] + '20',
                fill: true,
                tension: 0.4
            };
        });
        
        new Chart(timelineCtx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Service Level %'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time Since Disruption'
                        }
                    }
                }
            }
        });
    }
}

function updateActivityList() {
    const container = document.getElementById('activity-list');
    if (!container) return;
    
    const activities = AppState.auditTrail.slice(0, 5);
    
    container.innerHTML = activities.map(item => `
        <div class="activity-item">
            <div class="activity-icon ${item.action.toLowerCase()}">
                <i class="fas fa-${getActivityIcon(item.action)}"></i>
            </div>
            <div class="activity-details">
                <h4>${item.action} - ${item.item}</h4>
                <p>${item.details}</p>
                <div class="activity-time">${formatTimeAgo(item.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

function getActivityIcon(action) {
    const icons = {
        'Created': 'plus',
        'Updated': 'edit',
        'Approved': 'check',
        'Deleted': 'trash',
        'Exported': 'download'
    };
    return icons[action] || 'circle';
}

function updateAlertsList() {
    const container = document.getElementById('alerts-list');
    if (!container) return;
    
    const alerts = [];
    
    // Check for processes without impact assessments
    AppState.processes.forEach(process => {
        if (!AppState.impacts[process.id]) {
            alerts.push({
                type: 'warning',
                title: 'Missing Assessment',
                message: `${process.name} has no impact assessment`,
                action: 'Assess Now',
                actionUrl: `openAssessmentForProcess('${process.id}')`
            });
        }
    });
    
    // Check for validation issues
    Object.entries(AppState.recoveryObjectives).forEach(([processId, recovery]) => {
        const mtpdHours = convertToHours(recovery.mtpd, recovery.mtpdUnit);
        const rtoHours = convertToHours(recovery.rto, recovery.rtoUnit);
        
        if (rtoHours > mtpdHours) {
            const process = AppState.processes.find(p => p.id === processId);
            alerts.push({
                type: 'danger',
                title: 'Validation Error',
                message: `${process?.name || processId}: RTO exceeds MTPD`,
                action: 'Fix Now',
                actionUrl: `editRecoveryForProcess('${processId}')`
            });
        }
    });
    
    // Check for critical dependencies without alternatives
    AppState.processes.forEach(process => {
        const upstream = AppState.dependencies.upstream[process.id] || [];
        const criticalDeps = upstream.filter(d => d.criticality === 'critical');
        if (criticalDeps.length > 0) {
            alerts.push({
                type: 'warning',
                title: 'SPOF Warning',
                message: `${process.name} has ${criticalDeps.length} critical dependency(ies) without backup`,
                action: 'Review',
                actionUrl: `openAssessmentForProcess('${process.id}')`
            });
        }
    });
    
    container.innerHTML = alerts.slice(0, 5).map(alert => `
        <div class="alert-item ${alert.type}">
            <div class="alert-icon">
                <i class="fas fa-${alert.type === 'danger' ? 'exclamation-circle' : 'exclamation-triangle'}"></i>
            </div>
            <div class="alert-content">
                <h4>${alert.title}</h4>
                <p>${alert.message}</p>
                <span class="alert-action" onclick="${alert.actionUrl}">${alert.action}</span>
            </div>
        </div>
    `).join('');
    
    if (alerts.length === 0) {
        container.innerHTML = '<p style="color: var(--success-500); font-size: 0.875rem;">No alerts - all processes are in good standing</p>';
    }
}

function updateProgressBars() {
    const processes = AppState.processes;
    const total = processes.length;
    
    const statusCounts = {
        processes: { completed: 0, inProgress: 0, pending: 0 },
        impact: { assessed: 0, pending: 0 },
        recovery: { defined: 0, pending: 0 },
        dependencies: { mapped: 0, target: 0 }
    };
    
    processes.forEach(process => {
        const assessmentStatus = AppState.assessmentStatus[process.id];
        if (assessmentStatus) {
            if (assessmentStatus.status === 'completed') {
                statusCounts.processes.completed++;
            } else if (assessmentStatus.status === 'in-progress') {
                statusCounts.processes.inProgress++;
            } else {
                statusCounts.processes.pending++;
            }
        }
    });
    
    statusCounts.impact.assessed = Object.keys(AppState.impacts).length;
    statusCounts.impact.pending = total - statusCounts.impact.assessed;
    
    statusCounts.recovery.defined = Object.keys(AppState.recoveryObjectives).length;
    statusCounts.recovery.pending = total - statusCounts.recovery.defined;
    
    // Count total dependencies
    let totalDependencies = 0;
    Object.values(AppState.dependencies.upstream).forEach(deps => {
        totalDependencies += deps.length;
    });
    Object.values(AppState.dependencies.downstream).forEach(deps => {
        totalDependencies += deps.length;
    });
    statusCounts.dependencies.mapped = totalDependencies;
    statusCounts.dependencies.target = total * 3;
    
    const updateBar = (id, completed, total) => {
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        document.getElementById(id).style.width = percentage + '%';
        document.getElementById(id + '-value').textContent = percentage + '%';
    };
    
    updateBar('progress-processes', statusCounts.processes.completed, total);
    updateBar('progress-impact', statusCounts.impact.assessed, total);
    updateBar('progress-recovery', statusCounts.recovery.defined, total);
    updateBar('progress-dependencies', statusCounts.dependencies.mapped, Math.min(statusCounts.dependencies.target, 50));
}

// ========================================
// Process Functions
// ========================================

function initProcessesTable() {
    renderProcessesTable();
    populateProcessSelects();
}

function renderProcessesTable() {
    const tbody = document.getElementById('processes-tbody');
    if (!tbody) return;
    
    const processes = AppState.processes;
    
    tbody.innerHTML = processes.map(process => {
        const assessmentStatus = AppState.assessmentStatus[process.id] || { status: 'pending', progress: 0 };
        return `
            <tr>
                <td><strong>${process.id}</strong></td>
                <td>${process.name}</td>
                <td>${process.owner}</td>
                <td>${capitalizeFirst(process.department)}</td>
                <td><span class="tier-badge tier-${process.criticality === 'critical' ? '1' : process.criticality === 'essential' ? '2' : process.criticality === 'necessary' ? '3' : '4'}">${getTierLabel(process.criticality)}</span></td>
                <td><span class="status-badge ${assessmentStatus.status === 'completed' ? 'approved' : assessmentStatus.status === 'in-progress' ? 'review' : 'draft'}">${getStatusLabel(assessmentStatus.status)}</span></td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-icon" onclick="editProcess('${process.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-icon" onclick="openAssessmentForProcess('${process.id}')" title="Assess">
                            <i class="fas fa-clipboard-check"></i>
                        </button>
                        <button class="btn btn-icon" onclick="deleteProcess('${process.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    document.getElementById('process-count').textContent = `${processes.length} processes`;
}

function getTierLabel(criticality) {
    const labels = {
        critical: 'CRITICAL',
        essential: 'ESSENTIAL',
        necessary: 'NECESSARY',
        desirable: 'DESIRABLE'
    };
    return labels[criticality] || 'UNKNOWN';
}

function getStatusLabel(status) {
    const labels = {
        pending: 'Pending',
        'in-progress': 'In Progress',
        completed: 'Completed'
    };
    return labels[status] || 'Unknown';
}

function populateProcessSelects() {
    // Populate assessment process select
    const assessmentSelect = document.getElementById('assessment-process-select');
    if (assessmentSelect) {
        const options = AppState.processes.map(p => 
            `<option value="${p.id}">${p.id} - ${p.name}</option>`
        ).join('');
        assessmentSelect.innerHTML = '<option value="">Choose a process...</option>' + options;
    }
    
    // Populate temporal process select
    const temporalSelect = document.getElementById('temporal-process-select');
    if (temporalSelect) {
        const options = AppState.processes.map(p => 
            `<option value="${p.id}">${p.id} - ${p.name}</option>`
        ).join('');
        temporalSelect.innerHTML = '<option value="">Select a process...</option>' + options;
    }
}

function filterProcesses() {
    const search = document.getElementById('process-search').value.toLowerCase();
    const filter = document.getElementById('process-filter').value;
    
    const filtered = AppState.processes.filter(process => {
        const matchesSearch = process.name.toLowerCase().includes(search) || 
                              process.id.toLowerCase().includes(search) ||
                              process.owner.toLowerCase().includes(search);
        const matchesFilter = filter === 'all' || process.criticality === filter;
        return matchesSearch && matchesFilter;
    });
    
    const tbody = document.getElementById('processes-tbody');
    tbody.innerHTML = filtered.map(process => {
        const assessmentStatus = AppState.assessmentStatus[process.id] || { status: 'pending', progress: 0 };
        return `
            <tr>
                <td><strong>${process.id}</strong></td>
                <td>${process.name}</td>
                <td>${process.owner}</td>
                <td>${capitalizeFirst(process.department)}</td>
                <td><span class="tier-badge tier-${process.criticality === 'critical' ? '1' : process.criticality === 'essential' ? '2' : process.criticality === 'necessary' ? '3' : '4'}">${getTierLabel(process.criticality)}</span></td>
                <td><span class="status-badge ${assessmentStatus.status === 'completed' ? 'approved' : assessmentStatus.status === 'in-progress' ? 'review' : 'draft'}">${getStatusLabel(assessmentStatus.status)}</span></td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-icon" onclick="editProcess('${process.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-icon" onclick="openAssessmentForProcess('${process.id}')" title="Assess">
                            <i class="fas fa-clipboard-check"></i>
                        </button>
                        <button class="btn btn-icon" onclick="deleteProcess('${process.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    document.getElementById('process-count').textContent = `${filtered.length} processes`;
}

function openProcessModal(processId = null) {
    const modal = document.getElementById('process-modal');
    const title = document.getElementById('process-modal-title');
    
    if (processId) {
        const process = AppState.processes.find(p => p.id === processId);
        if (process) {
            title.textContent = 'Edit Process';
            document.getElementById('process-id').value = process.id;
            document.getElementById('process-id').disabled = true;
            document.getElementById('process-name').value = process.name;
            document.getElementById('process-owner').value = process.owner;
            document.getElementById('process-department').value = process.department;
            document.getElementById('process-description').value = process.description;
            document.getElementById('process-criticality').value = process.criticality;
            document.getElementById('process-status').value = process.status === 'approved' ? 'review' : process.status;
        }
    } else {
        title.textContent = 'Add New Process';
        document.getElementById('process-id').value = `PROC-${String(AppState.processes.length + 1).padStart(3, '0')}`;
        document.getElementById('process-id').disabled = false;
        document.getElementById('process-name').value = '';
        document.getElementById('process-owner').value = '';
        document.getElementById('process-department').value = '';
        document.getElementById('process-description').value = '';
        document.getElementById('process-criticality').value = '';
        document.getElementById('process-status').value = 'draft';
    }
    
    modal.classList.add('active');
}

function saveProcess() {
    const processId = document.getElementById('process-id').value;
    const processData = {
        id: processId,
        name: document.getElementById('process-name').value,
        owner: document.getElementById('process-owner').value,
        department: document.getElementById('process-department').value,
        description: document.getElementById('process-description').value,
        criticality: document.getElementById('process-criticality').value || 'desirable',
        status: document.getElementById('process-status').value,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (!processData.name || !processData.owner || !processData.department) {
        showToast('error', 'Validation Error', 'Please fill in all required fields');
        return;
    }
    
    const existingIndex = AppState.processes.findIndex(p => p.id === processId);
    if (existingIndex >= 0) {
        processData.createdAt = AppState.processes[existingIndex].createdAt;
        AppState.processes[existingIndex] = processData;
        showToast('success', 'Process Updated', `${processData.name} has been updated`);
    } else {
        AppState.processes.push(processData);
        AppState.assessmentStatus[processId] = {
            status: 'pending',
            progress: 0,
            lastAssessment: new Date().toISOString(),
            completedTabs: []
        };
        showToast('success', 'Process Created', `${processData.name} has been added`);
    }
    
    addAuditEntry('Created', processId, 'New process added');
    
    closeModal('process-modal');
    renderProcessesTable();
    populateProcessSelects();
    updateKPIs();
    refreshAssessmentList();
}

function editProcess(processId) {
    openProcessModal(processId);
}

function deleteProcess(processId) {
    if (confirm('Are you sure you want to delete this process? This will also remove all associated assessment data.')) {
        const process = AppState.processes.find(p => p.id === processId);
        AppState.processes = AppState.processes.filter(p => p.id !== processId);
        
        // Remove associated data
        delete AppState.impacts[processId];
        delete AppState.recoveryObjectives[processId];
        delete AppState.temporalData[processId];
        delete AppState.dependencies.upstream[processId];
        delete AppState.dependencies.downstream[processId];
        delete AppState.resources.personnel[processId];
        delete AppState.resources.technology[processId];
        delete AppState.resources.equipment[processId];
        delete AppState.resources.facilities[processId];
        delete AppState.resources.suppliers[processId];
        delete AppState.assessmentStatus[processId];
        
        addAuditEntry('Deleted', processId, 'Process removed');
        
        showToast('success', 'Process Deleted', `${process?.name || processId} has been deleted`);
        renderProcessesTable();
        populateProcessSelects();
        updateKPIs();
        refreshAssessmentList();
    }
}

function refreshProcesses() {
    renderProcessesTable();
    showToast('info', 'Refreshed', 'Process list has been refreshed');
}

function exportProcesses() {
    const data = JSON.stringify(AppState.processes, null, 2);
    downloadFile(data, 'processes.json', 'application/json');
}

// ========================================
// Assessment Section Functions
// ========================================

function initAssessmentSection() {
    refreshAssessmentList();
    initAssessmentProcessSelect();
}

function initAssessmentProcessSelect() {
    populateProcessSelects();
}

function refreshAssessmentList() {
    updateAssessmentStats();
    renderAssessmentCards();
}

function updateAssessmentStats() {
    const stats = {
        pending: 0,
        'in-progress': 0,
        completed: 0
    };
    
    Object.values(AppState.assessmentStatus).forEach(status => {
        stats[status.status]++;
    });
    
    document.getElementById('stat-pending').textContent = `${stats.pending} Pending`;
    document.getElementById('stat-inprogress').textContent = `${stats['in-progress']} In Progress`;
    document.getElementById('stat-completed').textContent = `${stats.completed} Completed`;
}

function renderAssessmentCards() {
    const container = document.getElementById('assessment-cards');
    if (!container) return;
    
    const processes = AppState.processes;
    
    container.innerHTML = processes.map(process => {
        const assessmentStatus = AppState.assessmentStatus[process.id] || { status: 'pending', progress: 0 };
        return `
            <div class="assessment-card" data-status="${assessmentStatus.status}" onclick="openAssessmentForProcess('${process.id}')">
                <div class="card-header">
                    <div class="process-info">
                        <span class="process-id">${process.id}</span>
                        <h4>${process.name}</h4>
                    </div>
                    <span class="status-badge ${assessmentStatus.status === 'completed' ? 'approved' : assessmentStatus.status === 'in-progress' ? 'review' : 'draft'}">${getStatusLabel(assessmentStatus.status)}</span>
                </div>
                <div class="card-body">
                    <div class="process-owner">
                        <i class="fas fa-user"></i>
                        <span>${process.owner}</span>
                    </div>
                    <div class="process-department">
                        <i class="fas fa-building"></i>
                        <span>${capitalizeFirst(process.department)}</span>
                    </div>
                    <div class="progress-indicator">
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${assessmentStatus.progress}%"></div>
                        </div>
                        <span class="progress-text">${assessmentStatus.progress}% Complete</span>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); openAssessmentForProcess('${process.id}')">
                        ${assessmentStatus.status === 'pending' ? 'Start Assessment' : assessmentStatus.status === 'in-progress' ? 'Continue' : 'Review'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function filterAssessmentList(filter) {
    // Update filter buttons
    document.querySelectorAll('.quick-filter .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter cards
    const cards = document.querySelectorAll('.assessment-card');
    cards.forEach(card => {
        if (filter === 'all' || card.dataset.status === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function loadProcessAssessment() {
    const processId = document.getElementById('assessment-process-select').value;
    if (processId) {
        openAssessmentForProcess(processId);
    }
}

function openAssessmentForProcess(processId) {
    const process = AppState.processes.find(p => p.id === processId);
    if (!process) return;
    
    // Update current assessment state
    AppState.currentAssessment.processId = processId;
    AppState.currentAssessment.currentTab = 'basic';
    AppState.currentAssessment.currentStep = 1;
    
    // Show the assessment panel
    const panel = document.getElementById('process-assessment-panel');
    panel.classList.add('active');
    
    // Update process info
    document.getElementById('assessment-process-name').textContent = process.name;
    document.getElementById('assessment-process-id').textContent = process.id;
    document.getElementById('assessment-process-owner').textContent = `Owner: ${process.owner}`;
    
    // Load process data into the assessment form
    loadBasicInfo(process);
    loadImpactAssessment(processId);
    loadTemporalAssessment(processId);
    loadRecoveryAssessment(processId);
    loadDependenciesAssessment(processId);
    loadResourcesAssessment(processId);
    
    // Reset progress tracking
    updateAssessmentProgress(1);
    switchAssessmentTab('basic');
    
    // Switch to assessment section
    showSection('assessment');
    
    // Scroll to panel
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeProcessAssessment() {
    if (AppState.currentAssessment.isDirty) {
        if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
            return;
        }
    }
    
    const panel = document.getElementById('process-assessment-panel');
    panel.classList.remove('active');
    
    AppState.currentAssessment.processId = null;
    AppState.currentAssessment.isDirty = false;
}

function switchAssessmentTab(tabName) {
    AppState.currentAssessment.currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.assessment-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.assessment-tab[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.assessment-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab-content`).classList.add('active');
    
    // Update progress step
    const stepMap = {
        basic: 1,
        impacts: 2,
        temporal: 3,
        recovery: 4,
        dependencies: 5,
        resources: 6
    };
    updateAssessmentProgress(stepMap[tabName]);
}

function updateAssessmentProgress(step) {
    AppState.currentAssessment.currentStep = step;
    
    document.querySelectorAll('.progress-step').forEach((el, index) => {
        if (index + 1 < step) {
            el.classList.add('completed');
            el.classList.remove('active');
        } else if (index + 1 === step) {
            el.classList.add('active');
            el.classList.remove('completed');
        } else {
            el.classList.remove('active', 'completed');
        }
    });
}

function previousAssessmentStep() {
    const currentStep = AppState.currentAssessment.currentStep;
    if (currentStep > 1) {
        const tabs = ['basic', 'impacts', 'temporal', 'recovery', 'dependencies', 'resources'];
        switchAssessmentTab(tabs[currentStep - 2]);
    }
}

function nextAssessmentStep() {
    const currentStep = AppState.currentAssessment.currentStep;
    if (currentStep < 6) {
        // Save current tab data before moving
        saveCurrentTabData();
        const tabs = ['basic', 'impacts', 'temporal', 'recovery', 'dependencies', 'resources'];
        switchAssessmentTab(tabs[currentStep]);
    }
}

function saveCurrentTabData() {
    const processId = AppState.currentAssessment.processId;
    if (!processId) return;
    
    switch(AppState.currentAssessment.currentTab) {
        case 'basic':
            saveBasicInfo(processId);
            break;
        case 'impacts':
            saveImpactAssessment(processId);
            break;
        case 'temporal':
            saveTemporalAssessment(processId);
            break;
        case 'recovery':
            saveRecoveryAssessment(processId);
            break;
        case 'dependencies':
            saveDependenciesAssessment(processId);
            break;
        case 'resources':
            saveResourcesAssessment(processId);
            break;
    }
}

function savePartialAssessment() {
    saveCurrentTabData();
    AppState.currentAssessment.isDirty = false;
    AppState.currentAssessment.lastSaved = new Date();
    document.getElementById('last-saved-time').textContent = `Last saved: ${formatTimeAgo(new Date())}`;
    showToast('success', 'Draft Saved', 'Assessment progress has been saved');
    refreshAssessmentList();
}

function completeAssessment() {
    const processId = AppState.currentAssessment.processId;
    
    // Validate all required data is present
    const impacts = AppState.impacts[processId];
    const recovery = AppState.recoveryObjectives[processId];
    
    if (!impacts) {
        showToast('warning', 'Incomplete', 'Please complete the Impact Assessment tab');
        switchAssessmentTab('impacts');
        return;
    }
    
    if (!recovery) {
        showToast('warning', 'Incomplete', 'Please complete the Recovery Objectives tab');
        switchAssessmentTab('recovery');
        return;
    }
    
    // Update assessment status
    AppState.assessmentStatus[processId] = {
        status: 'completed',
        progress: 100,
        lastAssessment: new Date().toISOString(),
        completedTabs: ['basic', 'impacts', 'temporal', 'recovery', 'dependencies', 'resources']
    };
    
    // Update process status
    const processIndex = AppState.processes.findIndex(p => p.id === processId);
    if (processIndex >= 0) {
        AppState.processes[processIndex].status = 'approved';
    }
    
    addAuditEntry('Approved', processId, 'Complete BIA assessment');
    
    showToast('success', 'Assessment Complete', `${AppState.processes[processIndex]?.name || processId} assessment has been completed`);
    refreshAssessmentList();
    updateKPIs();
    updateAlertsList();
}

function openAssessmentWizard() {
    showToast('info', 'Assessment Wizard', 'Starting guided assessment wizard for all pending processes');
    // Find first pending process
    const pending = Object.entries(AppState.assessmentStatus).find(([id, status]) => status.status === 'pending');
    if (pending) {
        openAssessmentForProcess(pending[0]);
    }
}

// ========================================
// Basic Information Tab
// ========================================

function loadBasicInfo(process) {
    document.getElementById('assessment-name').value = process.name || '';
    document.getElementById('assessment-id').value = process.id || '';
    document.getElementById('assessment-owner').value = process.owner || '';
    document.getElementById('assessment-department').value = process.department || '';
    document.getElementById('assessment-description').value = process.description || '';
    document.getElementById('assessment-criticality').value = process.criticality || '';
    document.getElementById('assessment-status').value = AppState.assessmentStatus[process.id]?.status === 'completed' ? 'completed' : 'in-progress';
}

function saveBasicInfo(processId) {
    const processIndex = AppState.processes.findIndex(p => p.id === processId);
    if (processIndex >= 0) {
        AppState.processes[processIndex].name = document.getElementById('assessment-name').value;
        AppState.processes[processIndex].owner = document.getElementById('assessment-owner').value;
        AppState.processes[processIndex].department = document.getElementById('assessment-department').value;
        AppState.processes[processIndex].description = document.getElementById('assessment-description').value;
        AppState.processes[processIndex].criticality = document.getElementById('assessment-criticality').value;
        AppState.processes[processIndex].updatedAt = new Date().toISOString();
        
        AppState.currentAssessment.isDirty = true;
        addAuditEntry('Updated', processId, 'Basic information updated');
    }
}

// ========================================
// Impact Assessment Tab
// ========================================

function loadImpactAssessment(processId) {
    const impacts = AppState.impacts[processId] || {};
    const categories = ['financial', 'operational', 'reputational', 'legal', 'health', 'environmental'];
    
    categories.forEach(category => {
        const impact = impacts[category] || { level: 0, description: '' };
        const select = document.getElementById(`impact-${category}`);
        const desc = document.getElementById(`impact-${category}-desc`);
        
        if (select) select.value = impact.level;
        if (desc) desc.value = impact.description || '';
        
        updateInlineImpactScore(category);
    });
}

function updateInlineImpactScore(category) {
    const select = document.getElementById(`impact-${category}`);
    const scoreEl = document.getElementById(`score-${category}`);
    
    if (select && scoreEl) {
        const score = parseInt(select.value) || 0;
        scoreEl.textContent = score;
        
        // Update color based on score
        const card = select.closest('.impact-inline-card');
        if (card) {
            card.classList.remove('score-low', 'score-medium', 'score-high');
            if (score >= 4) card.classList.add('score-high');
            else if (score >= 2) card.classList.add('score-medium');
            else if (score > 0) card.classList.add('score-low');
        }
    }
    
    // Update summary
    updateImpactSummary();
}

function updateImpactSummary() {
    const categories = ['financial', 'operational', 'reputational', 'legal', 'health', 'environmental'];
    let total = 0;
    let highest = 0;
    let highestCategory = '-';
    
    categories.forEach(category => {
        const select = document.getElementById(`impact-${category}`);
        const score = parseInt(select?.value) || 0;
        total += score;
        
        if (score > highest) {
            highest = score;
            highestCategory = capitalizeFirst(category);
        }
    });
    
    const average = (total / categories.filter(c => {
        const select = document.getElementById(`impact-${c}`);
        return select && parseInt(select.value) > 0;
    }).length) || 0;
    
    document.getElementById('total-impact-score').textContent = total;
    document.getElementById('average-impact-score').textContent = average.toFixed(1);
    document.getElementById('highest-impact-category').textContent = highestCategory;
}

function saveImpactAssessment(processId) {
    const categories = ['financial', 'operational', 'reputational', 'legal', 'health', 'environmental'];
    const impacts = {};
    
    categories.forEach(category => {
        const select = document.getElementById(`impact-${category}`);
        const desc = document.getElementById(`impact-${category}-desc`);
        
        impacts[category] = {
            level: parseInt(select?.value) || 0,
            description: desc?.value || ''
        };
    });
    
    AppState.impacts[processId] = impacts;
    AppState.impacts[processId].assessedAt = new Date().toISOString();
    AppState.impacts[processId].confidence = 'high';
    
    // Update assessment status
    updateSingleAssessmentStatus(processId, 'impacts');
    
    AppState.currentAssessment.isDirty = true;
    addAuditEntry('Updated', processId, 'Impact assessment completed');
}

// ========================================
// Temporal Analysis Tab
// ========================================

function loadTemporalAssessment(processId) {
    const temporal = AppState.temporalData[processId] || {};
    const categories = ['financial', 'operational', 'reputational', 'legal', 'health', 'environmental'];
    
    // Initialize temporal table
    renderTemporalTable(processId);
    
    // Load MTPD
    const recovery = AppState.recoveryObjectives[processId];
    if (recovery) {
        document.getElementById('assessment-mtpd').value = recovery.mtpd;
        document.getElementById('assessment-mtpd-unit').value = recovery.mtpdUnit;
        document.getElementById('assessment-mtpd-justification').value = recovery.mtpdJustification || '';
    } else {
        document.getElementById('assessment-mtpd').value = 24;
        document.getElementById('assessment-mtpd-unit').value = 'hours';
        document.getElementById('assessment-mtpd-justification').value = '';
    }
    
    updateMtpdVisual();
    renderTemporalInlineChart(processId);
}

function renderTemporalTable(processId) {
    const tbody = document.getElementById('temporal-table-body');
    if (!tbody) return;
    
    const temporal = AppState.temporalData[processId] || {};
    const categories = ['financial', 'operational', 'reputational', 'legal', 'health', 'environmental'];
    const timeHorizons = ['immediate', 'short', 'medium', 'extended'];
    
    tbody.innerHTML = categories.map(category => {
        const catData = temporal[category] || { immediate: 1, short: 1, medium: 1, extended: 1 };
        return `
            <tr>
                <td><span class="category-badge" style="--badge-color: ${getCategoryColor(category)}">${capitalizeFirst(category)}</span></td>
                ${timeHorizons.map(horizon => `
                    <td>
                        <select class="temporal-select" data-category="${category}" data-horizon="${horizon}" onchange="updateTemporalData('${processId}', '${category}', '${horizon}', this.value)">
                            ${[1,2,3,4,5].map(level => `
                                <option value="${level}" ${catData[horizon] === level ? 'selected' : ''}>${level}</option>
                            `).join('')}
                        </select>
                    </td>
                `).join('')}
            </tr>
        `;
    }).join('');
}

function getCategoryColor(category) {
    const colors = {
        financial: '#10b981',
        operational: '#0ea5e9',
        reputational: '#f59e0b',
        legal: '#ef4444',
        health: '#ec4899',
        environmental: '#22c55e'
    };
    return colors[category] || '#64748b';
}

function updateTemporalData(processId, category, horizon, value) {
    if (!AppState.temporalData[processId]) {
        AppState.temporalData[processId] = {};
    }
    if (!AppState.temporalData[processId][category]) {
        AppState.temporalData[processId][category] = {};
    }
    
    AppState.temporalData[processId][category][horizon] = parseInt(value);
    
    // Update chart
    renderTemporalInlineChart(processId);
    
    AppState.currentAssessment.isDirty = true;
}

function updateMtpdVisual() {
    const mtpd = parseInt(document.getElementById('assessment-mtpd').value) || 24;
    const fill = document.getElementById('mtpd-fill');
    const marker = document.getElementById('mtpd-marker');
    
    if (fill && marker) {
        const percentage = Math.min((mtpd / 168) * 100, 100);
        fill.style.width = `${percentage}%`;
        marker.style.left = `${percentage}%`;
    }
}

function renderTemporalInlineChart(processId) {
    const canvas = document.getElementById('temporal-inline-chart');
    if (!canvas) return;
    
    const temporal = AppState.temporalData[processId] || {};
    const categories = ['financial', 'operational', 'reputational', 'legal', 'health', 'environmental'];
    const timeLabels = ['Immediate', 'Short-term', 'Medium-term', 'Extended'];
    const colors = ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#ec4899', '#22c55e'];
    
    const datasets = categories.map((cat, i) => {
        const catData = temporal[cat] || { immediate: 1, short: 1, medium: 1, extended: 1 };
        return {
            label: capitalizeFirst(cat),
            data: [catData.immediate, catData.short, catData.medium, catData.extended],
            borderColor: colors[i],
            backgroundColor: colors[i] + '20',
            fill: false,
            tension: 0.4
        };
    });
    
    // Destroy existing chart
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();
    
    new Chart(canvas, {
        type: 'line',
        data: { labels: timeLabels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    title: {
                        display: true,
                        text: 'Impact Level'
                    }
                }
            }
        }
    });
}

function saveTemporalAssessment(processId) {
    // Collect temporal data from table
    const categories = ['financial', 'operational', 'reputational', 'legal', 'health', 'environmental'];
    const timeHorizons = ['immediate', 'short', 'medium', 'extended'];
    const temporal = {};
    
    categories.forEach(category => {
        temporal[category] = {};
        timeHorizons.forEach(horizon => {
            const select = document.querySelector(`[data-category="${category}"][data-horizon="${horizon}"]`);
            temporal[category][horizon] = parseInt(select?.value) || 1;
        });
    });
    
    AppState.temporalData[processId] = temporal;
    
    // Save MTPD
    const mtpd = parseInt(document.getElementById('assessment-mtpd').value) || 24;
    const mtpdUnit = document.getElementById('assessment-mtpd-unit').value;
    const mtpdJustification = document.getElementById('assessment-mtpd-justification').value;
    
    if (!AppState.recoveryObjectives[processId]) {
        AppState.recoveryObjectives[processId] = {};
    }
    AppState.recoveryObjectives[processId].mtpd = mtpd;
    AppState.recoveryObjectives[processId].mtpdUnit = mtpdUnit;
    AppState.recoveryObjectives[processId].mtpdJustification = mtpdJustification;
    
    updateSingleAssessmentStatus(processId, 'temporal');
    AppState.currentAssessment.isDirty = true;
}

// ========================================
// Recovery Objectives Tab
// ========================================

function loadRecoveryAssessment(processId) {
    const recovery = AppState.recoveryObjectives[processId] || {};
    
    document.getElementById('recovery-mtpd').value = recovery.mtpd || 24;
    document.getElementById('recovery-mtpd-unit').value = recovery.mtpdUnit || 'hours';
    document.getElementById('recovery-rto').value = recovery.rto || 8;
    document.getElementById('recovery-rto-unit').value = recovery.rtoUnit || 'hours';
    document.getElementById('recovery-rpo').value = recovery.rpo || 60;
    document.getElementById('recovery-rpo-unit').value = recovery.rpoUnit || 'minutes';
    document.getElementById('recovery-mbco').value = recovery.mbco || 50;
    document.getElementById('recovery-mbco-display').textContent = (recovery.mbco || 50) + '%';
    document.getElementById('recovery-strategy').value = recovery.strategy || '';
    document.getElementById('recovery-procedure-notes').value = recovery.procedureNotes || '';
    
    validateRecoveryObjectives();
    updateRecoveryTimelineVisual();
}

function validateRecoveryObjectives() {
    const mtpd = parseInt(document.getElementById('recovery-mtpd').value) || 0;
    const mtpdUnit = document.getElementById('recovery-mtpd-unit').value;
    const rto = parseInt(document.getElementById('recovery-rto').value) || 0;
    const rtoUnit = document.getElementById('recovery-rto-unit').value;
    const rpo = parseInt(document.getElementById('recovery-rpo').value) || 0;
    const rpoUnit = document.getElementById('recovery-rpo-unit').value;
    
    const mtpdHours = convertToHours(mtpd, mtpdUnit);
    const rtoHours = convertToHours(rto, rtoUnit);
    
    // MTPD validation
    const mtpdValidation = document.getElementById('mtpd-validation');
    if (mtpdHours <= 0) {
        mtpdValidation.innerHTML = '<span class="validation-message warning"><i class="fas fa-exclamation-triangle"></i> MTPD must be greater than 0</span>';
    } else {
        mtpdValidation.innerHTML = '<span class="validation-message success"><i class="fas fa-check-circle"></i> Valid MTPD</span>';
    }
    
    // RTO validation
    const rtoValidation = document.getElementById('rto-validation');
    if (rtoHours > mtpdHours) {
        rtoValidation.innerHTML = '<span class="validation-message error"><i class="fas fa-times-circle"></i> RTO cannot exceed MTPD</span>';
    } else if (rtoHours === 0) {
        rtoValidation.innerHTML = '<span class="validation-message warning"><i class="fas fa-exclamation-triangle"></i> RTO must be greater than 0</span>';
    } else {
        rtoValidation.innerHTML = '<span class="validation-message success"><i class="fas fa-check-circle"></i> Valid (RTO ≤ MTPD)</span>';
    }
    
    // RPO validation
    const rpoValidation = document.getElementById('rpo-validation');
    const rpoHours = convertToHours(rpo, rpoUnit);
    if (rpoHours > rtoHours) {
        rpoValidation.innerHTML = '<span class="validation-message warning"><i class="fas fa-exclamation-triangle"></i> RPO typically should not exceed RTO</span>';
    } else {
        rpoValidation.innerHTML = '<span class="validation-message success"><i class="fas fa-check-circle"></i> Valid RPO</span>';
    }
}

function updateMbcoInlineDisplay() {
    const value = document.getElementById('recovery-mbco').value;
    document.getElementById('recovery-mbco-display').textContent = value + '%';
}

function updateRecoveryTimelineVisual() {
    const rto = parseInt(document.getElementById('recovery-rto').value) || 4;
    const rtoUnit = document.getElementById('recovery-rto-unit').value;
    
    // Update RTO marker
    const rtoMarker = document.getElementById('rto-marker');
    if (rtoMarker) {
        rtoMarker.textContent = `T+${rto}${rtoUnit.charAt(0)}`;
    }
}

function saveRecoveryAssessment(processId) {
    const recovery = {
        mtpd: parseInt(document.getElementById('recovery-mtpd').value) || 24,
        mtpdUnit: document.getElementById('recovery-mtpd-unit').value,
        rto: parseInt(document.getElementById('recovery-rto').value) || 8,
        rtoUnit: document.getElementById('recovery-rto-unit').value,
        rpo: parseInt(document.getElementById('recovery-rpo').value) || 60,
        rpoUnit: document.getElementById('recovery-rpo-unit').value,
        mbco: parseInt(document.getElementById('recovery-mbco').value) || 50,
        strategy: document.getElementById('recovery-strategy').value,
        procedureNotes: document.getElementById('recovery-procedure-notes').value,
        assessedAt: new Date().toISOString()
    };
    
    // Validate RTO <= MTPD
    const mtpdHours = convertToHours(recovery.mtpd, recovery.mtpdUnit);
    const rtoHours = convertToHours(recovery.rto, recovery.rtoUnit);
    
    if (rtoHours > mtpdHours) {
        showToast('warning', 'Validation Warning', 'RTO exceeds MTPD - please review');
    }
    
    AppState.recoveryObjectives[processId] = recovery;
    
    updateSingleAssessmentStatus(processId, 'recovery');
    AppState.currentAssessment.isDirty = true;
    addAuditEntry('Updated', processId, 'Recovery objectives defined');
}

// ========================================
// Dependencies Tab
// ========================================

function loadDependenciesAssessment(processId) {
    const upstream = AppState.dependencies.upstream[processId] || [];
    const downstream = AppState.dependencies.downstream[processId] || [];
    
    // Clear existing rows
    document.getElementById('upstream-dependencies').innerHTML = '';
    document.getElementById('downstream-dependencies').innerHTML = '';
    
    // Add upstream dependency rows
    upstream.forEach(dep => {
        addDependencyRowWithData('upstream-dependencies', dep);
    });
    if (upstream.length === 0) {
        addDependencyRow('upstream-dependencies');
    }
    
    // Add downstream dependency rows
    downstream.forEach(dep => {
        addDependencyRowWithData('downstream-dependencies', dep);
    });
    if (downstream.length === 0) {
        addDependencyRow('downstream-dependencies');
    }
    
    // Load cascade analysis
    const process = AppState.processes.find(p => p.id === processId);
    if (process) {
        document.getElementById('cascade-effects').value = process.cascadeEffects || '';
        document.getElementById('cascade-mitigation').value = process.cascadeMitigation || '';
    }
    
    updateDependencySummary();
}

function addDependencyRowWithData(containerId, data) {
    const container = document.getElementById(containerId);
    const row = document.createElement('div');
    row.className = 'dependency-input-row';
    row.innerHTML = `
        <select class="dep-type-select">
            <option value="process" ${data.type === 'process' ? 'selected' : ''}>Process</option>
            <option value="system" ${data.type === 'system' ? 'selected' : ''}>System/Application</option>
            <option value="personnel" ${data.type === 'personnel' ? 'selected' : ''}>Personnel</option>
            <option value="supplier" ${data.type === 'supplier' ? 'selected' : ''}>Supplier</option>
            <option value="facility" ${data.type === 'facility' ? 'selected' : ''}>Facility</option>
            <option value="utility" ${data.type === 'utility' ? 'selected' : ''}>Utility</option>
            <option value="data" ${data.type === 'data' ? 'selected' : ''}>Data/Information</option>
            <option value="customer" ${data.type === 'customer' ? 'selected' : ''}>Customer</option>
            <option value="stakeholder" ${data.type === 'stakeholder' ? 'selected' : ''}>Stakeholder</option>
        </select>
        <input type="text" placeholder="Dependency name" value="${data.name || ''}">
        <select class="dep-criticality">
            <option value="critical" ${data.criticality === 'critical' ? 'selected' : ''}>Critical</option>
            <option value="high" ${data.criticality === 'high' ? 'selected' : ''}>High</option>
            <option value="medium" ${data.criticality === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="low" ${data.criticality === 'low' ? 'selected' : ''}>Low</option>
        </select>
        <button class="btn btn-icon remove-btn" onclick="removeDependencyRow(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(row);
}

function addDependencyRow(containerId) {
    addDependencyRowWithData(containerId, { type: 'process', name: '', criticality: 'high' });
}

function saveDependenciesAssessment(processId) {
    const upstream = [];
    const downstream = [];
    
    // Collect upstream dependencies
    document.querySelectorAll('#upstream-dependencies .dependency-input-row').forEach(row => {
        const inputs = row.querySelectorAll('select, input');
        const name = inputs[1].value.trim();
        if (name) {
            upstream.push({
                type: inputs[0].value,
                name: name,
                criticality: inputs[2].value
            });
        }
    });
    
    // Collect downstream dependencies
    document.querySelectorAll('#downstream-dependencies .dependency-input-row').forEach(row => {
        const inputs = row.querySelectorAll('select, input');
        const name = inputs[1].value.trim();
        if (name) {
            downstream.push({
                type: inputs[0].value,
                name: name,
                criticality: inputs[2].value
            });
        }
    });
    
    AppState.dependencies.upstream[processId] = upstream;
    AppState.dependencies.downstream[processId] = downstream;
    
    // Save cascade analysis
    const processIndex = AppState.processes.findIndex(p => p.id === processId);
    if (processIndex >= 0) {
        AppState.processes[processIndex].cascadeEffects = document.getElementById('cascade-effects').value;
        AppState.processes[processIndex].cascadeMitigation = document.getElementById('cascade-mitigation').value;
    }
    
    updateDependencySummary();
    updateSingleAssessmentStatus(processId, 'dependencies');
    AppState.currentAssessment.isDirty = true;
    addAuditEntry('Updated', processId, 'Dependencies updated');
}

function updateDependencySummary() {
    const processId = AppState.currentAssessment.processId;
    if (!processId) return;
    
    const upstream = AppState.dependencies.upstream[processId] || [];
    const downstream = AppState.dependencies.downstream[processId] || [];
    const allDeps = [...upstream, ...downstream];
    
    const totalCount = allDeps.length;
    const criticalCount = allDeps.filter(d => d.criticality === 'critical').length;
    
    // Count SPOFs (critical dependencies without alternatives)
    const spofCount = criticalCount; // Simplified - in real app would check for alternatives
    
    document.getElementById('dep-total-count').textContent = totalCount;
    document.getElementById('dep-critical-count').textContent = criticalCount;
    document.getElementById('dep-spof-count').textContent = spofCount;
}

// ========================================
// Resources Tab
// ========================================

function loadResourcesAssessment(processId) {
    // Show first resource tab
    showResourceMiniTab('personnel');
    
    // Load personnel resources
    renderPersonnelResourceList(processId);
    renderTechnologyResourceList(processId);
    renderEquipmentResourceList(processId);
    renderFacilitiesResourceList(processId);
    renderSuppliersResourceList(processId);
}

function showResourceMiniTab(tabName) {
    // Update buttons
    document.querySelectorAll('.resource-cat-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.resource-mini-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`${tabName}-mini-tab`).classList.add('active');
}

function renderPersonnelResourceList(processId) {
    const container = document.getElementById('personnel-resource-list');
    if (!container) return;
    
    const resources = AppState.resources.personnel[processId] || [];
    
    if (resources.length === 0) {
        container.innerHTML = '<p class="no-data">No personnel requirements added yet</p>';
        return;
    }
    
    container.innerHTML = resources.map((resource, index) => `
        <div class="resource-item">
            <div class="resource-header">
                <span class="resource-role">${resource.role}</span>
                <button class="btn btn-icon" onclick="removePersonnelResource(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="resource-details">
                <div class="detail-row">
                    <span class="detail-label">Min Staffing:</span>
                    <span class="detail-value">${resource.minStaffing}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Key Personnel:</span>
                    <span class="detail-value">${resource.keyPersonnel}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Skills:</span>
                    <span class="detail-value">${resource.skills}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Alternatives:</span>
                    <span class="detail-value">${resource.alternatives}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function addPersonnelResource() {
    const processId = AppState.currentAssessment.processId;
    if (!processId) return;
    
    const resource = {
        role: document.getElementById('resource-personnel-role').value,
        minStaffing: parseInt(document.getElementById('resource-personnel-staffing').value) || 1,
        keyPersonnel: document.getElementById('resource-personnel-key').value,
        skills: document.getElementById('resource-personnel-skills').value,
        alternatives: document.getElementById('resource-personnel-alternatives').value
    };
    
    if (!resource.role) {
        showToast('warning', 'Validation', 'Please enter a role');
        return;
    }
    
    if (!AppState.resources.personnel[processId]) {
        AppState.resources.personnel[processId] = [];
    }
    
    AppState.resources.personnel[processId].push(resource);
    
    // Clear form
    document.getElementById('resource-personnel-role').value = '';
    document.getElementById('resource-personnel-staffing').value = '';
    document.getElementById('resource-personnel-key').value = '';
    document.getElementById('resource-personnel-skills').value = '';
    document.getElementById('resource-personnel-alternatives').value = '';
    
    renderPersonnelResourceList(processId);
    AppState.currentAssessment.isDirty = true;
}

function removePersonnelResource(index) {
    const processId = AppState.currentAssessment.processId;
    if (!processId || !AppState.resources.personnel[processId]) return;
    
    AppState.resources.personnel[processId].splice(index, 1);
    renderPersonnelResourceList(processId);
    AppState.currentAssessment.isDirty = true;
}

function renderTechnologyResourceList(processId) {
    const container = document.getElementById('technology-resource-list');
    if (!container) return;
    
    const resources = AppState.resources.technology[processId] || [];
    
    if (resources.length === 0) {
        container.innerHTML = '<p class="no-data">No technology requirements added yet</p>';
        return;
    }
    
    container.innerHTML = resources.map((resource, index) => `
        <div class="resource-item">
            <div class="resource-header">
                <span class="resource-role">${resource.system}</span>
                <button class="btn btn-icon" onclick="removeTechnologyResource(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="resource-details">
                <div class="detail-row">
                    <span class="detail-label">Criticality:</span>
                    <span class="detail-value">${resource.criticality}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">RTO:</span>
                    <span class="detail-value">${resource.rto}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Alternatives:</span>
                    <span class="detail-value">${resource.alternatives}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function addTechnologyResource() {
    const processId = AppState.currentAssessment.processId;
    if (!processId) return;
    
    const resource = {
        system: document.getElementById('resource-tech-system').value,
        criticality: document.getElementById('resource-tech-criticality').value,
        alternatives: document.getElementById('resource-tech-alternative').value,
        rto: 'TBD'
    };
    
    if (!resource.system) {
        showToast('warning', 'Validation', 'Please enter a system name');
        return;
    }
    
    if (!AppState.resources.technology[processId]) {
        AppState.resources.technology[processId] = [];
    }
    
    AppState.resources.technology[processId].push(resource);
    
    // Clear form
    document.getElementById('resource-tech-system').value = '';
    document.getElementById('resource-tech-criticality').value = 'high';
    document.getElementById('resource-tech-alternative').value = '';
    
    renderTechnologyResourceList(processId);
    AppState.currentAssessment.isDirty = true;
}

function removeTechnologyResource(index) {
    const processId = AppState.currentAssessment.processId;
    if (!processId || !AppState.resources.technology[processId]) return;
    
    AppState.resources.technology[processId].splice(index, 1);
    renderTechnologyResourceList(processId);
    AppState.currentAssessment.isDirty = true;
}

function renderEquipmentResourceList(processId) {
    const container = document.getElementById('equipment-resource-list');
    if (!container) return;
    
    const resources = AppState.resources.equipment[processId] || [];
    
    if (resources.length === 0) {
        container.innerHTML = '<p class="no-data">No equipment requirements added yet</p>';
        return;
    }
    
    container.innerHTML = resources.map((resource, index) => `
        <div class="resource-item">
            <div class="resource-header">
                <span class="resource-role">${resource.name}</span>
                <button class="btn btn-icon" onclick="removeEquipmentResource(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="resource-details">
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${resource.location}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Lead Time:</span>
                    <span class="detail-value">${resource.leadTime}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Alternative:</span>
                    <span class="detail-value">${resource.altSource}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function addEquipmentResource() {
    const processId = AppState.currentAssessment.processId;
    if (!processId) return;
    
    const resource = {
        name: document.getElementById('resource-equip-name').value,
        location: document.getElementById('resource-equip-location').value,
        leadTime: document.getElementById('resource-equip-lead').value,
        altSource: document.getElementById('resource-equip-alt').value
    };
    
    if (!resource.name) {
        showToast('warning', 'Validation', 'Please enter equipment name');
        return;
    }
    
    if (!AppState.resources.equipment[processId]) {
        AppState.resources.equipment[processId] = [];
    }
    
    AppState.resources.equipment[processId].push(resource);
    
    // Clear form
    document.getElementById('resource-equip-name').value = '';
    document.getElementById('resource-equip-location').value = '';
    document.getElementById('resource-equip-lead').value = '';
    document.getElementById('resource-equip-alt').value = '';
    
    renderEquipmentResourceList(processId);
    AppState.currentAssessment.isDirty = true;
}

function removeEquipmentResource(index) {
    const processId = AppState.currentAssessment.processId;
    if (!processId || !AppState.resources.equipment[processId]) return;
    
    AppState.resources.equipment[processId].splice(index, 1);
    renderEquipmentResourceList(processId);
    AppState.currentAssessment.isDirty = true;
}

function renderFacilitiesResourceList(processId) {
    const container = document.getElementById('facilities-resource-list');
    if (!container) return;
    
    const resources = AppState.resources.facilities[processId] || [];
    
    if (resources.length === 0) {
        container.innerHTML = '<p class="no-data">No facility requirements added yet</p>';
        return;
    }
    
    container.innerHTML = resources.map((resource, index) => `
        <div class="resource-item">
            <div class="resource-header">
                <span class="resource-role">${resource.name}</span>
                <button class="btn btn-icon" onclick="removeFacilityResource(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="resource-details">
                <div class="detail-row">
                    <span class="detail-label">Type:</span>
                    <span class="detail-value">${capitalizeFirst(resource.type)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Recovery Site:</span>
                    <span class="detail-value">${resource.recovery}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Criticality:</span>
                    <span class="detail-value">${resource.criticality}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function addFacilityResource() {
    const processId = AppState.currentAssessment.processId;
    if (!processId) return;
    
    const resource = {
        name: document.getElementById('resource-facility-name').value,
        type: document.getElementById('resource-facility-type').value,
        recovery: document.getElementById('resource-facility-recovery').value,
        criticality: 'High'
    };
    
    if (!resource.name) {
        showToast('warning', 'Validation', 'Please enter facility name');
        return;
    }
    
    if (!AppState.resources.facilities[processId]) {
        AppState.resources.facilities[processId] = [];
    }
    
    AppState.resources.facilities[processId].push(resource);
    
    // Clear form
    document.getElementById('resource-facility-name').value = '';
    document.getElementById('resource-facility-type').value = 'office';
    document.getElementById('resource-facility-recovery').value = '';
    
    renderFacilitiesResourceList(processId);
    AppState.currentAssessment.isDirty = true;
}

function removeFacilityResource(index) {
    const processId = AppState.currentAssessment.processId;
    if (!processId || !AppState.resources.facilities[processId]) return;
    
    AppState.resources.facilities[processId].splice(index, 1);
    renderFacilitiesResourceList(processId);
    AppState.currentAssessment.isDirty = true;
}

function renderSuppliersResourceList(processId) {
    const container = document.getElementById('suppliers-resource-list');
    if (!container) return;
    
    const resources = AppState.resources.suppliers[processId] || [];
    
    if (resources.length === 0) {
        container.innerHTML = '<p class="no-data">No supplier requirements added yet</p>';
        return;
    }
    
    container.innerHTML = resources.map((resource, index) => `
        <div class="resource-item">
            <div class="resource-header">
                <span class="resource-role">${resource.name}</span>
                <button class="btn btn-icon" onclick="removeSupplierResource(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="resource-details">
                <div class="detail-row">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value">${resource.service}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">SLA:</span>
                    <span class="detail-value">${resource.sla}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Backup:</span>
                    <span class="detail-value">${resource.backup}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function addSupplierResource() {
    const processId = AppState.currentAssessment.processId;
    if (!processId) return;
    
    const resource = {
        name: document.getElementById('resource-supplier-name').value,
        service: document.getElementById('resource-supplier-service').value,
        sla: document.getElementById('resource-supplier-sla').value,
        backup: document.getElementById('resource-supplier-backup').value
    };
    
    if (!resource.name) {
        showToast('warning', 'Validation', 'Please enter supplier name');
        return;
    }
    
    if (!AppState.resources.suppliers[processId]) {
        AppState.resources.suppliers[processId] = [];
    }
    
    AppState.resources.suppliers[processId].push(resource);
    
    // Clear form
    document.getElementById('resource-supplier-name').value = '';
    document.getElementById('resource-supplier-service').value = '';
    document.getElementById('resource-supplier-sla').value = '';
    document.getElementById('resource-supplier-backup').value = '';
    
    renderSuppliersResourceList(processId);
    AppState.currentAssessment.isDirty = true;
}

function removeSupplierResource(index) {
    const processId = AppState.currentAssessment.processId;
    if (!processId || !AppState.resources.suppliers[processId]) return;
    
    AppState.resources.suppliers[processId].splice(index, 1);
    renderSuppliersResourceList(processId);
    AppState.currentAssessment.isDirty = true;
}

function saveResourcesAssessment(processId) {
    updateSingleAssessmentStatus(processId, 'resources');
    AppState.currentAssessment.isDirty = true;
    addAuditEntry('Updated', processId, 'Resources documented');
}

function updateSingleAssessmentStatus(processId, tab) {
    const status = AppState.assessmentStatus[processId];
    if (!status) return;
    
    if (!status.completedTabs) {
        status.completedTabs = [];
    }
    
    if (!status.completedTabs.includes(tab)) {
        status.completedTabs.push(tab);
    }
    
    // Calculate progress
    const requiredTabs = ['impacts', 'recovery', 'dependencies', 'resources'];
    const completedTabs = status.completedTabs.filter(t => requiredTabs.includes(t));
    status.progress = Math.round((completedTabs.length / requiredTabs.length) * 100);
    
    // Update status
    if (status.progress === 100) {
        status.status = 'completed';
    } else if (status.progress > 0) {
        status.status = 'in-progress';
    }
    
    status.lastAssessment = new Date().toISOString();
}

// ========================================
// Impact Assessment Section (Legacy)
// ========================================

function initImpactAssessment() {
    renderImpactMatrix();
}

function renderImpactMatrix() {
    const matrix = document.getElementById('impact-matrix');
    if (!matrix) return;
    
    const timeHorizons = ['Immediate', 'Short-term', 'Medium-term', 'Extended'];
    const impacts = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];
    
    let html = '<div class="matrix-cell header"></div>';
    timeHorizons.forEach(th => {
        html += `<div class="matrix-cell header">${th}</div>`;
    });
    
    impacts.forEach((impact, impactIndex) => {
        html += `<div class="matrix-cell y-header">${impact}</div>`;
        timeHorizons.forEach((th, timeIndex) => {
            const severity = Math.min(5, impactIndex + 1 + timeIndex);
            const count = Object.values(AppState.impacts).filter(imp => {
                const categoryKeys = Object.keys(imp).filter(k => !['confidence', 'assessedAt'].includes(k));
                return categoryKeys.some(cat => {
                    const catData = imp[cat];
                    if (catData && catData.level) {
                        return catData.level === severity;
                    }
                    return false;
                });
            }).length;
            html += `<div class="matrix-cell ${impacts[severity - 1].toLowerCase()}">${count > 0 ? count + ' processes' : '-'}</div>`;
        });
    });
    
    matrix.innerHTML = html;
}

function openImpactAssessment() {
    showToast('info', 'Impact Assessment', 'Please use the Process Assessment Center for impact assessment');
    showSection('assessment');
}

// ========================================
// Temporal Analysis Section
// ========================================

function initTemporalAnalysis() {
    // Already handled in main init
}

function updateTemporalChart() {
    const processId = document.getElementById('temporal-process-select').value;
    if (!processId) return;
    
    const temporal = AppState.temporalData[processId];
    const container = document.getElementById('temporal-impact-chart');
    
    if (!temporal || !container) return;
    
    const timeLabels = ['0h', '4h', '8h', '24h', '72h', '168h'];
    const categories = ['financial', 'operational', 'reputational', 'legal', 'health', 'environmental'];
    const colors = ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#ec4899', '#22c55e'];
    
    const datasets = categories.map((cat, i) => {
        const catData = temporal[cat] || { immediate: 1, short: 1, medium: 1, extended: 1 };
        return {
            label: capitalizeFirst(cat),
            data: [catData.immediate, catData.short, catData.medium, catData.extended, catData.extended || 1, catData.extended || 1],
            borderColor: colors[i],
            backgroundColor: colors[i] + '20',
            fill: false,
            tension: 0.4
        };
    });
    
    // Destroy existing chart
    const existingChart = Chart.getChart(container);
    if (existingChart) existingChart.destroy();
    
    new Chart(container, {
        type: 'line',
        data: { labels: timeLabels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    title: { display: true, text: 'Impact Level' }
                },
                x: {
                    title: { display: true, text: 'Time Since Disruption' }
                }
            }
        }
    });
    
    updateTemporalInsights(processId, temporal);
}

function updateTemporalInsights(processId, temporal) {
    const container = document.getElementById('temporal-insights');
    if (!container) return;
    
    let totalImpact = 0;
    let maxImpact = 0;
    let criticalHorizon = 'N/A';
    
    Object.entries(temporal).forEach(([category, data]) => {
        if (data && typeof data === 'object') {
            Object.entries(data).forEach(([horizon, value]) => {
                totalImpact += value;
                if (value > maxImpact) {
                    maxImpact = value;
                    criticalHorizon = capitalizeFirst(horizon);
                }
            });
        }
    });
    
    const avgImpact = totalImpact / 24;
    
    container.innerHTML = `
        <div class="insight-header">
            <i class="fas fa-chart-line"></i>
            <h4>Temporal Impact Analysis - ${processId}</h4>
        </div>
        <div class="insight-content">
            <div class="insight-item">
                <h5>Peak Impact</h5>
                <div class="insight-value">Level ${maxImpact}</div>
            </div>
            <div class="insight-item">
                <h5>Critical Horizon</h5>
                <div class="insight-value">${criticalHorizon}</div>
            </div>
            <div class="insight-item">
                <h5>Average Impact</h5>
                <div class="insight-value">${avgImpact.toFixed(1)}/5</div>
            </div>
            <div class="insight-item">
                <h5>Recommendation</h5>
                <div class="insight-value">${maxImpact >= 4 ? 'Immediate' : maxImpact >= 3 ? '4 hours' : '24 hours'}</div>
            </div>
        </div>
    `;
}

function generateImpactCurves() {
    showToast('success', 'Curves Generated', 'Impact curves have been regenerated for all processes');
}

// ========================================
// Recovery Objectives Functions
// ========================================

function initRecoveryObjectives() {
    renderRecoveryTable();
}

function renderRecoveryTable() {
    const tbody = document.getElementById('recovery-tbody');
    if (!tbody) return;
    
    const rows = AppState.processes.map(process => {
        const recovery = AppState.recoveryObjectives[process.id];
        
        let mtpd = recovery ? `${recovery.mtpd} ${recovery.mtpdUnit}` : 'Not set';
        let rto = recovery ? `${recovery.rto} ${recovery.rtoUnit}` : 'Not set';
        let rpo = recovery ? `${recovery.rpo} ${recovery.rpoUnit}` : 'Not set';
        let mbco = recovery ? `${recovery.mbco}%` : 'Not set';
        
        let statusClass = '';
        let validationMessage = '';
        
        if (recovery) {
            const mtpdHours = convertToHours(recovery.mtpd, recovery.mtpdUnit);
            const rtoHours = convertToHours(recovery.rto, recovery.rtoUnit);
            
            if (rtoHours > mtpdHours) {
                statusClass = 'style="color: var(--danger-500);"';
                validationMessage = '<i class="fas fa-exclamation-circle"></i> RTO exceeds MTPD';
            } else {
                statusClass = 'style="color: var(--success-500);"';
                validationMessage = '<i class="fas fa-check-circle"></i> Valid';
            }
        }
        
        return `
            <tr>
                <td><strong>${process.name}</strong></td>
                <td>${mtpd}</td>
                <td>${rto}</td>
                <td>${rpo}</td>
                <td>${mbco}</td>
                <td ${statusClass}>${validationMessage || 'Pending'}</td>
                <td>
                    <button class="btn btn-icon" onclick="editRecoveryForProcess('${process.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.innerHTML = rows || '<tr><td colspan="7" style="text-align: center; color: var(--primary-500);">No recovery objectives defined</td></tr>';
}

function editRecoveryForProcess(processId) {
    showSection('assessment');
    openAssessmentForProcess(processId);
    switchAssessmentTab('recovery');
}

function calculateAllRecovery() {
    Object.keys(AppState.impacts).forEach(processId => {
        const impact = AppState.impacts[processId];
        
        let maxImpact = 0;
        Object.values(impact).forEach(category => {
            if (category && category.level) {
                maxImpact = Math.max(maxImpact, category.level);
            }
        });
        
        let mtpd, mtpdUnit, rto, rtoUnit, rpo, rpoUnit, mbco;
        
        switch(maxImpact) {
            case 5:
                mtpd = 4; mtpdUnit = 'hours'; rto = 2; rtoUnit = 'hours'; rpo = 15; mbco = 80; break;
            case 4:
                mtpd = 24; mtpdUnit = 'hours'; rto = 8; rtoUnit = 'hours'; rpo = 60; mbco = 70; break;
            case 3:
                mtpd = 48; mtpdUnit = 'hours'; rto = 12; rtoUnit = 'hours'; rpo = 240; mbco = 60; break;
            default:
                mtpd = 72; mtpdUnit = 'hours'; rto = 24; rtoUnit = 'hours'; rpo = 480; mbco = 50;
        }
        
        AppState.recoveryObjectives[processId] = {
            mtpd, mtpdUnit, rto, rtoUnit, rpo, rpoUnit, mbco,
            assessedAt: new Date().toISOString()
        };
    });
    
    renderRecoveryTable();
    updateSingleAssessmentStatusFromRecovery();
    showToast('success', 'Recovery Calculated', 'Recovery objectives have been auto-calculated');
}

function updateSingleAssessmentStatusFromRecovery() {
    Object.keys(AppState.recoveryObjectives).forEach(processId => {
        updateSingleAssessmentStatus(processId, 'recovery');
    });
    refreshAssessmentList();
}

function convertToHours(value, unit) {
    const multipliers = {
        minutes: 1/60,
        hours: 1,
        days: 24,
        weeks: 168
    };
    return value * (multipliers[unit] || 1);
}

// ========================================
// Prioritisation Engine Functions
// ========================================

function initPrioritisationEngine() {
    renderWeightConfiguration();
    renderCriticalityMatrix();
    renderRecoveryTiers();
}

function renderWeightConfiguration() {
    const container = document.getElementById('weight-sliders');
    if (!container) return;
    
    const categories = Object.keys(AppState.settings.weights);
    
    container.innerHTML = categories.map(cat => `
        <div class="weight-slider-item">
            <label>${capitalizeFirst(cat)}</label>
            <input type="range" min="0" max="100" value="${AppState.settings.weights[cat]}" 
                   onchange="updateWeight('${cat}', this.value)" oninput="updateWeightDisplay('${cat}', this.value)">
            <span class="weight-value" id="weight-${cat}-display">${AppState.settings.weights[cat]}%</span>
        </div>
    `).join('');
}

function updateWeight(category, value) {
    AppState.settings.weights[category] = parseInt(value);
    document.getElementById(`weight-${category}-display`).textContent = value + '%';
    updateWeightTotal();
    recalculatePriorities();
}

function updateWeightDisplay(category, value) {
    document.getElementById(`weight-${category}-display`).textContent = value + '%';
}

function updateWeightTotal() {
    const total = Object.values(AppState.settings.weights).reduce((a, b) => a + b, 0);
    document.getElementById('weight-total-value').textContent = total + '%';
    
    const status = document.getElementById('weight-status');
    if (total === 100) {
        status.textContent = 'Valid';
        status.className = 'weight-valid';
    } else {
        status.textContent = 'Must equal 100%';
        status.className = 'weight-invalid';
    }
}

function renderCriticalityMatrix() {
    const container = document.getElementById('criticality-matrix');
    if (!container) return;
    
    const scored = AppState.processes.map(process => {
        const impact = AppState.impacts[process.id] || {};
        let totalScore = 0;
        Object.entries(AppState.settings.weights).forEach(([cat, weight]) => {
            const catImpact = impact[cat] || { level: 1 };
            totalScore += (catImpact.level || 1) * weight;
        });
        return { process, score: totalScore };
    });
    
    scored.sort((a, b) => b.score - a.score);
    
    container.innerHTML = scored.map((item, index) => `
        <div class="matrix-row">
            <span class="matrix-rank">${index + 1}</span>
            <span class="matrix-process">${item.process.id} - ${item.process.name}</span>
            <span class="matrix-score">${item.score}</span>
            <div class="matrix-bar-container">
                <div class="matrix-bar" style="width: ${(item.score / 3000) * 100}%"></div>
            </div>
        </div>
    `).join('');
}

function renderRecoveryTiers() {
    const scored = AppState.processes.map(process => {
        const impact = AppState.impacts[process.id] || {};
        let totalScore = 0;
        Object.entries(AppState.settings.weights).forEach(([cat, weight]) => {
            const catImpact = impact[cat] || { level: 1 };
            totalScore += (catImpact.level || 1) * weight;
        });
        return { process, score: totalScore };
    });
    
    scored.sort((a, b) => b.score - a.score);
    
    const tierCounts = { critical: 0, essential: 0, necessary: 0, desirable: 0 };
    
    scored.forEach((item, index) => {
        if (index < 0.2 * scored.length) {
            item.process.criticality = 'critical';
            tierCounts.critical++;
        } else if (index < 0.5 * scored.length) {
            item.process.criticality = 'essential';
            tierCounts.essential++;
        } else if (index < 0.8 * scored.length) {
            item.process.criticality = 'necessary';
            tierCounts.necessary++;
        } else {
            item.process.criticality = 'desirable';
            tierCounts.desirable++;
        }
    });
    
    document.getElementById('tier1-count').textContent = tierCounts.critical;
    document.getElementById('tier2-count').textContent = tierCounts.essential;
    document.getElementById('tier3-count').textContent = tierCounts.necessary;
    document.getElementById('tier4-count').textContent = tierCounts.desirable;
}

function recalculatePriorities() {
    renderCriticalityMatrix();
    renderRecoveryTiers();
    renderResourceConflicts();
    showToast('success', 'Priorities Recalculated', 'Criticality scores and priorities have been updated');
}

function renderResourceConflicts() {
    // Placeholder for resource conflict detection
}

// ========================================
// Dependency Mapping Functions
// ========================================

function initDependencyMapping() {
    renderDependencyStats();
}

function renderDependencyStats() {
    let totalInternal = 0;
    let totalTech = 0;
    let totalSupplier = 0;
    let totalSPOF = 0;
    
    Object.values(AppState.dependencies.upstream).forEach(deps => {
        deps.forEach(dep => {
            if (dep.type === 'process') totalInternal++;
            else if (dep.type === 'system') totalTech++;
            else if (dep.type === 'supplier') totalSupplier++;
            if (dep.criticality === 'critical') totalSPOF++;
        });
    });
    
    Object.values(AppState.dependencies.downstream).forEach(deps => {
        deps.forEach(dep => {
            if (dep.type === 'process') totalInternal++;
            if (dep.criticality === 'critical') totalSPOF++;
        });
    });
    
    document.getElementById('internal-deps-count').textContent = totalInternal;
    document.getElementById('tech-deps-count').textContent = totalTech;
    document.getElementById('supplier-deps-count').textContent = totalSupplier;
    document.getElementById('spof-count').textContent = totalSPOF;
}

function filterDependencyGraph() {
    showToast('info', 'Filter Applied', 'Dependency graph has been filtered');
}

function generateDependencyGraph() {
    showToast('success', 'Graph Generated', 'Dependency graph has been updated');
}

// ========================================
// Resource Analysis Functions
// ========================================

function initResourceAnalysis() {
    renderResourceGaps();
}

function renderResourceGaps() {
    const container = document.getElementById('resource-gaps');
    if (!container) return;
    
    const gaps = [];
    
    AppState.processes.forEach(process => {
        if (!AppState.resources.personnel[process.id] || AppState.resources.personnel[process.id].length === 0) {
            gaps.push({ process: process.name, gap: 'No personnel requirements', priority: 'HIGH' });
        }
        if (!AppState.resources.technology[process.id] || AppState.resources.technology[process.id].length === 0) {
            gaps.push({ process: process.name, gap: 'No technology requirements', priority: 'HIGH' });
        }
    });
    
    if (gaps.length === 0) {
        container.innerHTML = '<p style="color: var(--success-500); font-size: 0.875rem;">All processes have resource requirements defined</p>';
        return;
    }
    
    container.innerHTML = gaps.map(gap => `
        <div class="gap-item">
            <div class="gap-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="gap-details">
                <h4>${gap.process}</h4>
                <p>${gap.gap}</p>
            </div>
            <span class="gap-priority">${gap.priority}</span>
        </div>
    `).join('');
}

function exportResourceAnalysis() {
    const data = JSON.stringify(AppState.resources, null, 2);
    downloadFile(data, 'resource-analysis.json', 'application/json');
    showToast('success', 'Export Complete', 'Resource analysis has been exported');
}

// ========================================
// Compliance Functions
// ========================================

function initComplianceSection() {
    renderComplianceGauge();
}

function renderComplianceGauge() {
    const canvas = document.getElementById('compliance-gauge-chart');
    if (!canvas) return;
    
    // Calculate compliance based on completed assessments
    const completed = Object.values(AppState.assessmentStatus).filter(s => s.status === 'completed').length;
    const total = AppState.processes.length;
    const score = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [score, 100 - score],
                backgroundColor: ['#10b981', '#e2e8f0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
    
    // Update gauge value
    const gaugeValue = canvas.parentElement.querySelector('.gauge-value');
    if (gaugeValue) gaugeValue.textContent = score + '%';
}

function generateComplianceReport() {
    const completed = Object.values(AppState.assessmentStatus).filter(s => s.status === 'completed').length;
    const total = AppState.processes.length;
    
    const report = {
        generatedAt: new Date().toISOString(),
        overallScore: total > 0 ? Math.round((completed / total) * 100) : 0,
        clauses: {
            '4.1': { status: 'complete', coverage: 100 },
            '4.2': { status: 'complete', coverage: 95 },
            '8.2.2': { status: 'complete', coverage: completed === total ? 100 : Math.round((completed / total) * 100) },
            '8.2.3': { status: 'complete', coverage: 90 },
            '8.3': { status: 'partial', coverage: 75 }
        },
        processesAssessed: completed,
        totalProcesses: total,
        recommendations: [
            completed < total ? `Complete remaining ${total - completed} assessments` : 'All assessments complete',
            'Review critical process recovery strategies',
            'Establish regular review cycles'
        ]
    };
    
    downloadFile(JSON.stringify(report, null, 2), 'iso-compliance-report.json', 'application/json');
    showToast('success', 'Report Generated', 'ISO compliance report has been exported');
}

// ========================================
// Settings Functions
// ========================================

function initSettingsSection() {
    renderMandatoryFields();
}

function showSettingsTab(tabName) {
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.settings-content').forEach(content => {
        content.classList.remove('active');
    });
    
    event.target.classList.add('active');
    document.getElementById(`${tabName}-settings`).classList.add('active');
}

function renderMandatoryFields() {
    const fields = [
        { name: 'Process Name', section: 'Process Identification', required: true },
        { name: 'Process ID', section: 'Process Identification', required: true },
        { name: 'Process Owner', section: 'Process Identification', required: true },
        { name: 'Department', section: 'Process Identification', required: true },
        { name: 'Description', section: 'Process Identification', required: true },
        { name: 'Financial Impact', section: 'Impact Assessment', required: true },
        { name: 'Operational Impact', section: 'Impact Assessment', required: true },
        { name: 'MTPD', section: 'Recovery Objectives', required: true },
        { name: 'RTO', section: 'Recovery Objectives', required: true },
        { name: 'RPO', section: 'Recovery Objectives', required: false }
    ];
    
    const container = document.getElementById('mandatory-fields-list');
    if (!container) return;
    
    container.innerHTML = fields.map(field => `
        <div class="mandatory-field-item">
            <div class="field-info">
                <h4>${field.name}</h4>
                <p>${field.section}</p>
            </div>
            <div class="field-config">
                <label>Required</label>
                <label class="toggle">
                    <input type="checkbox" ${field.required ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>
    `).join('');
}

function saveSettings() {
    showToast('success', 'Settings Saved', 'Configuration settings have been updated');
    addAuditEntry('Updated', 'Settings', 'System configuration modified');
}

// ========================================
// Reports Functions
// ========================================

function generateReport(reportType) {
    const types = {
        executive: 'Executive Summary',
        detailed: 'Detailed BIA Report',
        criticality: 'Criticality Matrix',
        priority: 'Recovery Priority List',
        resources: 'Resource Requirements Summary',
        gaps: 'Gap Analysis'
    };
    
    const report = {
        id: Date.now(),
        name: `${types[reportType]} - ${new Date().toLocaleDateString()}`,
        type: reportType,
        date: new Date().toISOString(),
        status: 'completed',
        data: {
            processes: AppState.processes,
            impacts: AppState.impacts,
            recovery: AppState.recoveryObjectives,
            dependencies: AppState.dependencies,
            resources: AppState.resources
        }
    };
    
    AppState.reports.unshift(report);
    
    showToast('success', 'Report Generated', `${types[reportType]} has been generated`);
    downloadFile(JSON.stringify(report.data, null, 2), `${reportType}-report.json`, 'application/json');
}

function exportData(format) {
    const data = format === 'csv' ? convertToCSV() : JSON.stringify({
        processes: AppState.processes,
        impacts: AppState.impacts,
        recoveryObjectives: AppState.recoveryObjectives,
        temporalData: AppState.temporalData,
        dependencies: AppState.dependencies,
        resources: AppState.resources,
        assessmentStatus: AppState.assessmentStatus,
        exportedAt: new Date().toISOString()
    }, null, 2);
    
    downloadFile(data, `bia-export.${format === 'csv' ? 'csv' : 'json'}`, format === 'csv' ? 'text/csv' : 'application/json');
    showToast('success', 'Export Complete', `Data exported as ${format.toUpperCase()}`);
}

function convertToCSV() {
    const headers = ['ID', 'Name', 'Owner', 'Department', 'Criticality', 'Status', 'Assessment Progress'];
    const rows = AppState.processes.map(p => {
        const status = AppState.assessmentStatus[p.id] || { progress: 0 };
        return [p.id, p.name, p.owner, p.department, p.criticality, status.status, status.progress + '%'];
    });
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// ========================================
// Notifications Functions
// ========================================

function initNotifications() {
    renderNotifications();
}

function renderNotifications() {
    const container = document.getElementById('notifications-list');
    if (!container) return;
    
    container.innerHTML = AppState.notifications.map(notification => `
        <div class="notification-item ${notification.type}">
            <div class="notification-icon ${notification.type}">
                <i class="fas fa-${getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="notification-content">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
                <div class="notification-time">${notification.time}</div>
            </div>
        </div>
    `).join('');
}

function getNotificationIcon(type) {
    const icons = {
        info: 'info-circle',
        warning: 'exclamation-triangle',
        success: 'check-circle',
        danger: 'exclamation-circle'
    };
    return icons[type] || 'bell';
}

function showNotifications() {
    document.getElementById('notifications-panel').classList.toggle('active');
}

function hideNotifications() {
    document.getElementById('notifications-panel').classList.remove('active');
}

// ========================================
// Modal Functions
// ========================================

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showFormTab(tabName) {
    document.querySelectorAll('.form-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.form-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function removeDependencyRow(button) {
    const row = button.closest('.dependency-input-row');
    if (row) {
        row.remove();
    }
}

function addProductRow() {
    const container = document.getElementById('product-list');
    const row = document.createElement('div');
    row.className = 'product-input-row';
    row.innerHTML = `
        <input type="text" placeholder="Product/Service name">
        <input type="text" placeholder="Customer/Stakeholder">
        <input type="text" placeholder="Impact if delayed">
        <button class="btn btn-icon remove-btn" onclick="removeProductRow(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(row);
}

function removeProductRow(button) {
    button.closest('.product-input-row').remove();
}

// ========================================
// Help Functions
// ========================================

function showHelp(helpId) {
    const helpContent = {
        'process-help': `
            <h4>Process Identification Help</h4>
            <p>Use this module to document all critical business processes as required by ISO 22301:2019 Clause 4.1.</p>
            <ul>
                <li>Include all processes that support critical products and services</li>
                <li>Identify process owners who understand the process and its impacts</li>
                <li>Document dependencies to understand interrelationships</li>
                <li>Link processes to delivered products and services</li>
            </ul>
        `,
        'assessment-help': `
            <h4>Process Assessment Center Help</h4>
            <p>Conduct comprehensive BIA assessments per process using the unified workflow.</p>
            <ul>
                <li>Select a process to begin or continue an assessment</li>
                <li>Work through each tab to document all aspects of the process</li>
                <li>Save your progress at any time using "Save Draft"</li>
                <li>Complete the assessment when all required fields are filled</li>
                <li>Progress is automatically tracked for each process</li>
            </ul>
        `,
        'impact-help': `
            <h4>Impact Assessment Help</h4>
            <p>Assess impacts across six categories as required by ISO 22301:2019 Clause 8.2.2.</p>
            <ul>
                <li>Rate each impact category from 1 (Negligible) to 5 (Catastrophic)</li>
                <li>Use the Process Assessment Center for detailed per-process assessment</li>
                <li>Document the rationale for each rating</li>
                <li>Consider both immediate and long-term impacts</li>
            </ul>
        `,
        'temporal-help': `
            <h4>Temporal Analysis Help</h4>
            <p>Analyse how impacts escalate over time to determine appropriate recovery objectives.</p>
            <ul>
                <li>Impacts typically increase over time during disruptions</li>
                <li>Identify the "knee" where impacts become unacceptable</li>
                <li>Use temporal data from the Process Assessment Center</li>
                <li>Compare temporal profiles across processes</li>
            </ul>
        `,
        'recovery-help': `
            <h4>Recovery Objectives Help</h4>
            <p>Define recovery objectives that protect the organisation from unacceptable impacts.</p>
            <ul>
                <li>MTPD: When does disruption become unacceptable?</li>
                <li>RTO: How quickly must you recover?</li>
                <li>RPO: How much data loss is acceptable?</li>
                <li>MBCO: What minimum service level is needed?</li>
            </ul>
        `,
        'prioritisation-help': `
            <h4>Prioritisation Engine Help</h4>
            <p>Calculate criticality scores and assign recovery tiers based on weighted impact analysis.</p>
            <ul>
                <li>Adjust category weights to reflect organisational priorities</li>
                <li>Tier 1: Critical - Immediate restoration required</li>
                <li>Tier 2: Essential - Restoration within 24 hours</li>
                <li>Tier 3: Necessary - Restoration within 1 week</li>
                <li>Tier 4: Desirable - Restoration when practical</li>
            </ul>
        `,
        'dependency-help': `
            <h4>Dependency Mapping Help</h4>
            <p>Map internal and external dependencies to understand cascade failure risks.</p>
            <ul>
                <li>Identify single points of failure</li>
                <li>Document upstream and downstream dependencies</li>
                <li>Use the Dependencies tab in Process Assessment Center</li>
                <li>Analyse cascade scenarios and mitigation strategies</li>
            </ul>
        `,
        'resource-help': `
            <h4>Resource Analysis Help</h4>
            <p>Document minimum resource requirements for business continuity.</p>
            <ul>
                <li>Identify minimum staffing levels</li>
                <li>Document critical systems and applications</li>
                <li>Use the Resources tab in Process Assessment Center</li>
                <li>Define alternative resource options</li>
            </ul>
        `,
        'reports-help': `
            <h4>Reports & Export Help</h4>
            <p>Generate comprehensive BIA deliverables for stakeholders and auditors.</p>
            <ul>
                <li>Executive summaries for management</li>
                <li>Detailed reports for auditors</li>
                <li>Export data for further analysis</li>
                <li>Generate ISO compliance reports</li>
            </ul>
        `,
        'compliance-help': `
            <h4>ISO 22301 Compliance Help</h4>
            <p>This tool maps BIA activities to specific ISO 22301:2019 clauses.</p>
            <ul>
                <li>Clause 4.1: Organisational context</li>
                <li>Clause 4.2: Interested parties</li>
                <li>Clause 8.2.2: Business impact analysis</li>
                <li>Clause 8.2.3: Risk assessment</li>
                <li>Clause 8.3: Business continuity strategies</li>
            </ul>
        `
    };
    
    showHelpModal('Help', helpContent[helpId] || 'Help content not available');
}

function showHelpModal(title, content) {
    document.getElementById('help-modal-title').textContent = title;
    document.getElementById('help-modal-content').innerHTML = content;
    document.getElementById('help-modal').classList.add('active');
}

// ========================================
// Utility Functions
// ========================================

function showToast(type, title, message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'check-circle',
        error: 'times-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    toast.innerHTML = `
        <div class="toast-icon"><i class="fas fa-${icons[type]}"></i></div>
        <div class="toast-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
        <button class="toast-close" onclick="removeToast(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function removeToast(button) {
    button.closest('.toast').remove();
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function addAuditEntry(action, item, details) {
    AppState.auditTrail.unshift({
        timestamp: new Date().toISOString(),
        user: 'John Doe',
        action,
        item,
        details
    });
    
    // Keep only last 100 entries
    if (AppState.auditTrail.length > 100) {
        AppState.auditTrail = AppState.auditTrail.slice(0, 100);
    }
    
    updateActivityList();
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function startNewBIA() {
    showToast('info', 'New Assessment', 'Starting new Business Impact Analysis assessment');
    openProcessModal();
}

function importData() {
    showToast('info', 'Import', 'Import functionality would allow loading existing process inventories');
}

// ========================================
// Global Event Listeners
// ========================================

// Close modals on backdrop click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Close notifications panel on outside click
document.addEventListener('click', function(e) {
    const panel = document.getElementById('notifications-panel');
    const bell = document.querySelector('.notifications');
    if (panel && !panel.contains(e.target) && !bell?.contains(e.target)) {
        panel.classList.remove('active');
    }
});

// Escape key to close modals
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.getElementById('notifications-panel').classList.remove('active');
        
        // Close assessment panel
        const panel = document.getElementById('process-assessment-panel');
        if (panel && panel.classList.contains('active')) {
            closeProcessAssessment();
        }
    }
});

// Add validation listeners for recovery inputs
document.addEventListener('DOMContentLoaded', function() {
    ['recovery-mtpd', 'recovery-mtpd-unit', 'recovery-rto', 'recovery-rto-unit', 'recovery-rpo', 'recovery-rpo-unit'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', validateRecoveryObjectives);
            el.addEventListener('input', validateRecoveryObjectives);
        }
    });
});

// Window resize handler
window.addEventListener('resize', function() {
    // Handle responsive adjustments if needed
});
