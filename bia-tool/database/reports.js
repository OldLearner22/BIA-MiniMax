/**
 * Advanced Reporting Module for BIA Tool
 * Generates comprehensive ISO 22301:2019 compliant reports
 */

class BIAReportGenerator {
    constructor() {
        this.db = window.db;
        this.reportTypes = {
            executive: 'Executive Summary',
            detailed: 'Detailed Technical Report',
            riskMatrix: 'Risk Assessment Matrix',
            recovery: 'Recovery Strategy Report',
            dependency: 'Dependency Analysis Report',
            compliance: 'ISO 22301 Compliance Report',
            dashboard: 'Dashboard Summary',
            timeline: 'Impact Timeline Analysis'
        };
    }

    // ========================================
    // Data Collection Methods
    // ========================================

    async getProcesses() {
        if (typeof AppState !== 'undefined' && AppState.processes.length > 0) {
            return AppState.processes;
        }
        const result = await this.db.find('processes');
        return result.success ? result.data : [];
    }

    async getImpacts() {
        if (typeof AppState !== 'undefined' && Object.keys(AppState.impacts).length > 0) {
            return AppState.impacts;
        }
        const result = await this.db.find('impactAssessments');
        if (!result.success) return {};
        const impacts = {};
        result.data.forEach(i => { impacts[i.process_id] = i; });
        return impacts;
    }

    async getRecoveryObjectives() {
        if (typeof AppState !== 'undefined' && Object.keys(AppState.recoveryObjectives).length > 0) {
            return AppState.recoveryObjectives;
        }
        const result = await this.db.find('recoveryObjectives');
        if (!result.success) return {};
        const recovery = {};
        result.data.forEach(r => { recovery[r.process_id] = r; });
        return recovery;
    }

    async getTimelineData() {
        if (typeof AppState !== 'undefined' && Object.keys(AppState.temporalData).length > 0) {
            return AppState.temporalData;
        }
        const result = await this.db.find('timelinePoints');
        if (!result.success) return {};
        const timeline = {};
        result.data.forEach(t => {
            if (!timeline[t.process_id]) timeline[t.process_id] = [];
            timeline[t.process_id].push(t);
        });
        return timeline;
    }

    async getDependencies() {
        if (typeof AppState !== 'undefined' && AppState.dependencies) {
            return AppState.dependencies;
        }
        const result = await this.db.find('dependencies');
        if (!result.success) return { upstream: {}, downstream: {} };
        const deps = { upstream: {}, downstream: {} };
        result.data.forEach(d => {
            if (!deps.upstream[d.process_id]) deps.upstream[d.process_id] = [];
            deps.upstream[d.process_id].push(d);
        });
        return deps;
    }

    // ========================================
    // Calculation Methods
    // ========================================

    calculateCompositeScore(impact) {
        const weights = {
            financial: 0.25,
            operational: 0.25,
            reputational: 0.20,
            legal: 0.15,
            health: 0.10,
            environmental: 0.05
        };
        
        let score = 0;
        let totalWeight = 0;
        
        Object.entries(weights).forEach(([key, weight]) => {
            if (impact[key] !== undefined) {
                score += (impact[key] || 0) * weight;
                totalWeight += weight;
            }
        });
        
        return totalWeight > 0 ? (score / totalWeight) * 5 : 0;
    }

    getRiskLevel(score) {
        if (score >= 4) return { level: 'Critical', color: '#dc2626', priority: 1 };
        if (score >= 3) return { level: 'High', color: '#f59e0b', priority: 2 };
        if (score >= 2) return { level: 'Medium', color: '#3b82f6', priority: 3 };
        return { level: 'Low', color: '#10b981', priority: 4 };
    }

    getCriticalityLabel(criticality) {
        const labels = {
            'critical': 'Critical',
            'essential': 'Essential',
            'high': 'High',
            'medium': 'Medium',
            'low': 'Low',
            'minimal': 'Minimal'
        };
        return labels[criticality] || criticality;
    }

    formatDuration(hours) {
        if (hours < 1) return `${Math.round(hours * 60)} minutes`;
        if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`;
        if (hours < 168) return `${Math.round(hours / 24)} day${hours >= 48 ? 's' : ''}`;
        return `${Math.round(hours / 168)} week${hours >= 336 ? 's' : ''}`;
    }

    // ========================================
    // Report Generation Methods
    // ========================================

    /**
     * Generate Executive Summary Report
     */
    async generateExecutiveSummary() {
        const processes = await this.getProcesses();
        const impacts = await this.getImpacts();
        const recovery = await this.getRecoveryObjectives();
        
        const stats = this.calculateStatistics(processes, impacts, recovery);
        const criticalProcesses = this.getCriticalProcesses(processes, impacts);
        const riskDistribution = this.getRiskDistribution(processes, impacts);
        
        return {
            type: 'executive',
            title: 'Executive Summary - Business Impact Analysis',
            generatedAt: new Date().toISOString(),
            summary: {
                totalProcesses: processes.length,
                criticalProcesses: criticalProcesses.length,
                averageRiskScore: stats.averageRiskScore,
                highestRiskProcess: stats.highestRisk,
                lowestMTPD: stats.lowestMTPD
            },
            riskDistribution,
            criticalProcesses: criticalProcesses.slice(0, 5),
            recommendations: this.generateRecommendations(criticalProcesses, stats),
            charts: {
                riskPie: this.generateRiskPieData(riskDistribution),
                impactBar: this.generateImpactBarData(processes, impacts)
            }
        };
    }

    /**
     * Generate Detailed Technical Report
     */
    async generateDetailedReport() {
        const processes = await this.getProcesses();
        const impacts = await this.getImpacts();
        const recovery = await this.getRecoveryObjectives();
        const timeline = await this.getTimelineData();
        const dependencies = await this.getDependencies();
        
        const processDetails = processes.map(p => {
            const impact = impacts[p.id] || {};
            const ro = recovery[p.id] || {};
            const tl = timeline[p.id] || [];
            const deps = dependencies.upstream[p.id] || [];
            
            return {
                id: p.id,
                name: p.name,
                department: p.department,
                owner: p.owner,
                criticality: this.getCriticalityLabel(p.criticality),
                status: p.status,
                description: p.description,
                impact: {
                    financial: impact.financial || 0,
                    operational: impact.operational || 0,
                    reputational: impact.reputational || 0,
                    legal: impact.legal || 0,
                    health: impact.health || 0,
                    environmental: impact.environmental || 0,
                    composite: this.calculateCompositeScore(impact)
                },
                recoveryObjectives: {
                    mtpd: ro.mtpd || 'Not Set',
                    rto: ro.rto || 'Not Set',
                    rpo: ro.rpo || 'Not Set',
                    mbco: ro.mbco ? 'Yes' : 'No',
                    strategy: ro.recovery_strategy || ro.recoveryStrategy || 'Not Defined'
                },
                timeline: tl.map(t => ({
                    timeOffset: t.time_offset || t.timeOffset,
                    label: t.time_label || t.timeLabel,
                    impacts: {
                        financial: t.financial,
                        operational: t.operational,
                        reputational: t.reputational
                    }
                })),
                dependencies: deps.map(d => ({
                    processId: d.dependent_process_id || d.dependentProcessId,
                    type: d.dependency_type || d.type,
                    criticality: d.criticality
                })),
                riskLevel: this.getRiskLevel(this.calculateCompositeScore(impact))
            };
        });
        
        return {
            type: 'detailed',
            title: 'Detailed Business Impact Analysis Report',
            generatedAt: new Date().toISOString(),
            processCount: processes.length,
            processes: processDetails,
            methodology: this.getMethodologySection(),
            appendix: {
                impactScaleDefinitions: this.getImpactScaleDefinitions(),
                recoveryStrategyOptions: this.getRecoveryStrategyOptions()
            }
        };
    }

    /**
     * Generate Risk Assessment Matrix
     */
    async generateRiskMatrix() {
        const processes = await this.getProcesses();
        const impacts = await this.getImpacts();
        
        const matrix = {
            critical: [],
            high: [],
            medium: [],
            low: []
        };
        
        processes.forEach(p => {
            const impact = impacts[p.id] || {};
            const score = this.calculateCompositeScore(impact);
            const risk = this.getRiskLevel(score);
            
            const entry = {
                id: p.id,
                name: p.name,
                department: p.department,
                score: score.toFixed(2),
                impactBreakdown: {
                    financial: impact.financial || 0,
                    operational: impact.operational || 0,
                    reputational: impact.reputational || 0,
                    legal: impact.legal || 0
                }
            };
            
            if (score >= 4) matrix.critical.push(entry);
            else if (score >= 3) matrix.high.push(entry);
            else if (score >= 2) matrix.medium.push(entry);
            else matrix.low.push(entry);
        });
        
        // Sort each category by score descending
        Object.keys(matrix).forEach(key => {
            matrix[key].sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
        });
        
        return {
            type: 'riskMatrix',
            title: 'Risk Assessment Matrix',
            generatedAt: new Date().toISOString(),
            summary: {
                critical: matrix.critical.length,
                high: matrix.high.length,
                medium: matrix.medium.length,
                low: matrix.low.length,
                total: processes.length
            },
            matrix,
            heatmapData: this.generateHeatmapData(processes, impacts)
        };
    }

    /**
     * Generate Recovery Strategy Report
     */
    async generateRecoveryReport() {
        const processes = await this.getProcesses();
        const recovery = await this.getRecoveryObjectives();
        const impacts = await this.getImpacts();
        
        const strategyGroups = {};
        const gapAnalysis = [];
        
        processes.forEach(p => {
            const ro = recovery[p.id] || {};
            const impact = impacts[p.id] || {};
            const score = this.calculateCompositeScore(impact);
            const strategy = ro.recovery_strategy || ro.recoveryStrategy || 'undefined';
            
            if (!strategyGroups[strategy]) {
                strategyGroups[strategy] = [];
            }
            
            strategyGroups[strategy].push({
                id: p.id,
                name: p.name,
                mtpd: ro.mtpd,
                rto: ro.rto,
                rpo: ro.rpo,
                mbco: ro.mbco
            });
            
            // Gap analysis
            if (score >= 3 && (!ro.rto || ro.rto > 24)) {
                gapAnalysis.push({
                    process: p.name,
                    issue: 'High-risk process with insufficient RTO',
                    currentRTO: ro.rto || 'Not Set',
                    recommendedRTO: '≤ 24 hours',
                    priority: 'High'
                });
            }
            
            if (score >= 4 && !ro.mbco) {
                gapAnalysis.push({
                    process: p.name,
                    issue: 'Critical process without MBCO defined',
                    priority: 'Critical'
                });
            }
        });
        
        return {
            type: 'recovery',
            title: 'Recovery Strategy Report',
            generatedAt: new Date().toISOString(),
            strategyDistribution: Object.entries(strategyGroups).map(([strategy, procs]) => ({
                strategy: this.formatStrategyName(strategy),
                count: procs.length,
                processes: procs
            })),
            gapAnalysis,
            recoveryTimeline: this.generateRecoveryTimeline(processes, recovery),
            recommendations: this.generateRecoveryRecommendations(gapAnalysis)
        };
    }

    /**
     * Generate Dependency Analysis Report
     */
    async generateDependencyReport() {
        const processes = await this.getProcesses();
        const dependencies = await this.getDependencies();
        const impacts = await this.getImpacts();
        
        const processMap = {};
        processes.forEach(p => { processMap[p.id] = p; });
        
        const dependencyAnalysis = [];
        const criticalPaths = [];
        const singlePointsOfFailure = [];
        
        // Analyze dependencies
        processes.forEach(p => {
            const deps = dependencies.upstream[p.id] || [];
            const dependentCount = this.countDependents(p.id, dependencies);
            
            if (dependentCount >= 3) {
                singlePointsOfFailure.push({
                    process: p.name,
                    dependentCount,
                    riskLevel: 'High',
                    recommendation: 'Implement redundancy or alternative processes'
                });
            }
            
            dependencyAnalysis.push({
                id: p.id,
                name: p.name,
                upstreamDependencies: deps.length,
                downstreamDependents: dependentCount,
                criticalDependencies: deps.filter(d => d.criticality >= 4).length
            });
        });
        
        // Sort by impact
        dependencyAnalysis.sort((a, b) => b.downstreamDependents - a.downstreamDependents);
        
        return {
            type: 'dependency',
            title: 'Dependency Analysis Report',
            generatedAt: new Date().toISOString(),
            summary: {
                totalDependencies: Object.values(dependencies.upstream).flat().length,
                processesWithDependencies: dependencyAnalysis.filter(d => d.upstreamDependencies > 0).length,
                singlePointsOfFailure: singlePointsOfFailure.length
            },
            dependencyAnalysis: dependencyAnalysis.slice(0, 20),
            singlePointsOfFailure,
            dependencyMatrix: this.generateDependencyMatrix(processes, dependencies)
        };
    }

    /**
     * Generate ISO 22301 Compliance Report
     */
    async generateComplianceReport() {
        const processes = await this.getProcesses();
        const impacts = await this.getImpacts();
        const recovery = await this.getRecoveryObjectives();
        
        const complianceChecks = [
            {
                clause: '8.2.2',
                requirement: 'Business Impact Analysis conducted',
                status: processes.length > 0 ? 'Compliant' : 'Non-Compliant',
                evidence: `${processes.length} processes identified and analyzed`
            },
            {
                clause: '8.2.2 a)',
                requirement: 'Impact of disruption identified',
                status: Object.keys(impacts).length > 0 ? 'Compliant' : 'Non-Compliant',
                evidence: `${Object.keys(impacts).length} impact assessments completed`
            },
            {
                clause: '8.2.2 b)',
                requirement: 'Time-based impacts established',
                status: this.hasTimelineData() ? 'Compliant' : 'Partial',
                evidence: 'Temporal analysis configured'
            },
            {
                clause: '8.2.2 c)',
                requirement: 'Prioritized timeframes established',
                status: Object.keys(recovery).length > 0 ? 'Compliant' : 'Non-Compliant',
                evidence: `${Object.keys(recovery).length} recovery objectives defined`
            },
            {
                clause: '8.2.2 d)',
                requirement: 'Dependencies identified',
                status: this.hasDependencies() ? 'Compliant' : 'Partial',
                evidence: 'Dependency mapping completed'
            },
            {
                clause: '8.2.3',
                requirement: 'RTO defined for activities',
                status: this.hasRTODefined(recovery) ? 'Compliant' : 'Partial',
                evidence: `RTO defined for ${this.countRTODefined(recovery)} processes`
            },
            {
                clause: '8.2.3',
                requirement: 'MTPD defined for activities',
                status: this.hasMTPDDefined(recovery) ? 'Compliant' : 'Partial',
                evidence: `MTPD defined for ${this.countMTPDDefined(recovery)} processes`
            }
        ];
        
        const compliant = complianceChecks.filter(c => c.status === 'Compliant').length;
        const partial = complianceChecks.filter(c => c.status === 'Partial').length;
        const nonCompliant = complianceChecks.filter(c => c.status === 'Non-Compliant').length;
        
        return {
            type: 'compliance',
            title: 'ISO 22301:2019 Compliance Report',
            generatedAt: new Date().toISOString(),
            overallStatus: nonCompliant === 0 ? (partial === 0 ? 'Fully Compliant' : 'Partially Compliant') : 'Non-Compliant',
            summary: {
                compliant,
                partial,
                nonCompliant,
                complianceRate: ((compliant / complianceChecks.length) * 100).toFixed(1) + '%'
            },
            checks: complianceChecks,
            recommendations: this.generateComplianceRecommendations(complianceChecks)
        };
    }

    /**
     * Generate Dashboard Summary
     */
    async generateDashboardSummary() {
        const processes = await this.getProcesses();
        const impacts = await this.getImpacts();
        const recovery = await this.getRecoveryObjectives();
        
        const stats = this.calculateStatistics(processes, impacts, recovery);
        const riskDistribution = this.getRiskDistribution(processes, impacts);
        
        return {
            type: 'dashboard',
            title: 'BIA Dashboard Summary',
            generatedAt: new Date().toISOString(),
            kpis: [
                { label: 'Total Processes', value: processes.length, icon: 'fa-cogs' },
                { label: 'Critical Processes', value: riskDistribution.critical, icon: 'fa-exclamation-triangle', color: '#dc2626' },
                { label: 'High Risk', value: riskDistribution.high, icon: 'fa-warning', color: '#f59e0b' },
                { label: 'Avg Risk Score', value: stats.averageRiskScore.toFixed(2), icon: 'fa-chart-line' },
                { label: 'Min MTPD', value: this.formatDuration(stats.lowestMTPD || 0), icon: 'fa-clock' },
                { label: 'Assessment Completion', value: stats.completionRate + '%', icon: 'fa-check-circle' }
            ],
            charts: {
                riskDistribution: this.generateRiskPieData(riskDistribution),
                departmentRisk: this.generateDepartmentRiskData(processes, impacts),
                recoveryTimeline: this.generateRecoveryTimelineData(processes, recovery)
            },
            recentActivity: this.getRecentActivity(processes),
            alerts: this.generateAlerts(processes, impacts, recovery)
        };
    }

    /**
     * Generate Impact Timeline Analysis
     */
    async generateTimelineReport() {
        const processes = await this.getProcesses();
        const timeline = await this.getTimelineData();
        const impacts = await this.getImpacts();
        
        const timelineAnalysis = [];
        
        processes.forEach(p => {
            const tl = timeline[p.id] || [];
            const impact = impacts[p.id] || {};
            
            if (tl.length > 0) {
                const escalationRate = this.calculateEscalationRate(tl);
                const criticalPoint = this.findCriticalPoint(tl);
                
                timelineAnalysis.push({
                    processId: p.id,
                    processName: p.name,
                    department: p.department,
                    dataPoints: tl.length,
                    escalationRate,
                    criticalPointHours: criticalPoint,
                    peakImpact: Math.max(...tl.map(t => Math.max(t.financial || 0, t.operational || 0, t.reputational || 0))),
                    timeline: tl.sort((a, b) => (a.time_offset || a.timeOffset) - (b.time_offset || b.timeOffset))
                });
            }
        });
        
        // Sort by escalation rate
        timelineAnalysis.sort((a, b) => b.escalationRate - a.escalationRate);
        
        return {
            type: 'timeline',
            title: 'Impact Timeline Analysis Report',
            generatedAt: new Date().toISOString(),
            summary: {
                processesWithTimeline: timelineAnalysis.length,
                averageEscalationRate: (timelineAnalysis.reduce((sum, t) => sum + t.escalationRate, 0) / timelineAnalysis.length || 0).toFixed(2),
                fastestEscalation: timelineAnalysis[0]?.processName || 'N/A'
            },
            analysis: timelineAnalysis,
            charts: {
                escalationComparison: this.generateEscalationChart(timelineAnalysis)
            }
        };
    }

    // ========================================
    // Helper Methods
    // ========================================

    calculateStatistics(processes, impacts, recovery) {
        let totalScore = 0;
        let highestRisk = { name: 'N/A', score: 0 };
        let lowestMTPD = Infinity;
        let assessed = 0;
        
        processes.forEach(p => {
            const impact = impacts[p.id];
            const ro = recovery[p.id];
            
            if (impact) {
                const score = this.calculateCompositeScore(impact);
                totalScore += score;
                assessed++;
                
                if (score > highestRisk.score) {
                    highestRisk = { name: p.name, score };
                }
            }
            
            if (ro && ro.mtpd && ro.mtpd < lowestMTPD) {
                lowestMTPD = ro.mtpd;
            }
        });
        
        return {
            averageRiskScore: assessed > 0 ? totalScore / assessed : 0,
            highestRisk,
            lowestMTPD: lowestMTPD === Infinity ? null : lowestMTPD,
            completionRate: processes.length > 0 ? Math.round((assessed / processes.length) * 100) : 0
        };
    }

    getCriticalProcesses(processes, impacts) {
        return processes
            .filter(p => {
                const impact = impacts[p.id] || {};
                return this.calculateCompositeScore(impact) >= 3.5;
            })
            .map(p => ({
                id: p.id,
                name: p.name,
                department: p.department,
                score: this.calculateCompositeScore(impacts[p.id] || {}).toFixed(2)
            }))
            .sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
    }

    getRiskDistribution(processes, impacts) {
        const distribution = { critical: 0, high: 0, medium: 0, low: 0 };
        
        processes.forEach(p => {
            const impact = impacts[p.id] || {};
            const score = this.calculateCompositeScore(impact);
            
            if (score >= 4) distribution.critical++;
            else if (score >= 3) distribution.high++;
            else if (score >= 2) distribution.medium++;
            else distribution.low++;
        });
        
        return distribution;
    }

    generateRecommendations(criticalProcesses, stats) {
        const recommendations = [];
        
        if (criticalProcesses.length > 0) {
            recommendations.push({
                priority: 'High',
                category: 'Critical Processes',
                recommendation: `Address ${criticalProcesses.length} critical process(es) immediately. Focus on ${criticalProcesses[0]?.name || 'top priority'} first.`
            });
        }
        
        if (stats.lowestMTPD && stats.lowestMTPD < 4) {
            recommendations.push({
                priority: 'High',
                category: 'Recovery Time',
                recommendation: `Minimum MTPD is ${stats.lowestMTPD} hours. Ensure high-availability solutions are in place.`
            });
        }
        
        if (stats.completionRate < 100) {
            recommendations.push({
                priority: 'Medium',
                category: 'Assessment Completion',
                recommendation: `Complete impact assessments for remaining ${100 - stats.completionRate}% of processes.`
            });
        }
        
        return recommendations;
    }

    generateRiskPieData(distribution) {
        return {
            labels: ['Critical', 'High', 'Medium', 'Low'],
            datasets: [{
                data: [distribution.critical, distribution.high, distribution.medium, distribution.low],
                backgroundColor: ['#dc2626', '#f59e0b', '#3b82f6', '#10b981']
            }]
        };
    }

    generateImpactBarData(processes, impacts) {
        const categories = ['financial', 'operational', 'reputational', 'legal', 'health', 'environmental'];
        const averages = {};
        
        categories.forEach(cat => {
            const values = Object.values(impacts).map(i => i[cat] || 0);
            averages[cat] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        });
        
        return {
            labels: categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
            datasets: [{
                label: 'Average Impact Score',
                data: Object.values(averages),
                backgroundColor: ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#ec4899', '#22c55e']
            }]
        };
    }

    generateHeatmapData(processes, impacts) {
        return processes.map(p => {
            const impact = impacts[p.id] || {};
            return {
                process: p.name.substring(0, 20),
                financial: impact.financial || 0,
                operational: impact.operational || 0,
                reputational: impact.reputational || 0,
                legal: impact.legal || 0
            };
        });
    }

    generateDepartmentRiskData(processes, impacts) {
        const deptScores = {};
        
        processes.forEach(p => {
            const dept = p.department || 'Unknown';
            const impact = impacts[p.id] || {};
            const score = this.calculateCompositeScore(impact);
            
            if (!deptScores[dept]) {
                deptScores[dept] = { total: 0, count: 0 };
            }
            deptScores[dept].total += score;
            deptScores[dept].count++;
        });
        
        const labels = Object.keys(deptScores);
        const data = labels.map(dept => (deptScores[dept].total / deptScores[dept].count).toFixed(2));
        
        return {
            labels,
            datasets: [{
                label: 'Average Risk Score by Department',
                data,
                backgroundColor: '#3b82f6'
            }]
        };
    }

    generateRecoveryTimelineData(processes, recovery) {
        const timeRanges = {
            '0-4 hours': 0,
            '4-8 hours': 0,
            '8-24 hours': 0,
            '1-3 days': 0,
            '3-7 days': 0,
            '7+ days': 0
        };
        
        processes.forEach(p => {
            const ro = recovery[p.id] || {};
            const rto = ro.rto || 168;
            
            if (rto <= 4) timeRanges['0-4 hours']++;
            else if (rto <= 8) timeRanges['4-8 hours']++;
            else if (rto <= 24) timeRanges['8-24 hours']++;
            else if (rto <= 72) timeRanges['1-3 days']++;
            else if (rto <= 168) timeRanges['3-7 days']++;
            else timeRanges['7+ days']++;
        });
        
        return {
            labels: Object.keys(timeRanges),
            datasets: [{
                label: 'Processes by RTO',
                data: Object.values(timeRanges),
                backgroundColor: '#8b5cf6'
            }]
        };
    }

    countDependents(processId, dependencies) {
        let count = 0;
        Object.values(dependencies.upstream).forEach(deps => {
            deps.forEach(d => {
                if ((d.dependent_process_id || d.dependentProcessId) === processId) {
                    count++;
                }
            });
        });
        return count;
    }

    generateDependencyMatrix(processes, dependencies) {
        return processes.slice(0, 10).map(p => {
            const deps = dependencies.upstream[p.id] || [];
            return {
                process: p.name.substring(0, 15),
                dependencies: deps.length,
                critical: deps.filter(d => d.criticality >= 4).length
            };
        });
    }

    formatStrategyName(strategy) {
        const names = {
            'high-availability': 'High Availability',
            'warm-standby': 'Warm Standby',
            'cold-backup': 'Cold Backup',
            'manual-workaround': 'Manual Workaround',
            'undefined': 'Not Defined'
        };
        return names[strategy] || strategy;
    }

    generateRecoveryTimeline(processes, recovery) {
        return processes
            .filter(p => recovery[p.id])
            .map(p => ({
                process: p.name,
                rto: recovery[p.id].rto || 0,
                mtpd: recovery[p.id].mtpd || 0
            }))
            .sort((a, b) => a.rto - b.rto)
            .slice(0, 10);
    }

    generateRecoveryRecommendations(gapAnalysis) {
        if (gapAnalysis.length === 0) {
            return [{ priority: 'Info', recommendation: 'All recovery objectives appear to be properly configured.' }];
        }
        
        return gapAnalysis.slice(0, 5).map(gap => ({
            priority: gap.priority,
            process: gap.process,
            recommendation: gap.issue
        }));
    }

    hasTimelineData() {
        return typeof AppState !== 'undefined' && Object.keys(AppState.temporalData || {}).length > 0;
    }

    hasDependencies() {
        return typeof AppState !== 'undefined' && 
            Object.keys(AppState.dependencies?.upstream || {}).length > 0;
    }

    hasRTODefined(recovery) {
        return Object.values(recovery).some(r => r.rto);
    }

    hasMTPDDefined(recovery) {
        return Object.values(recovery).some(r => r.mtpd);
    }

    countRTODefined(recovery) {
        return Object.values(recovery).filter(r => r.rto).length;
    }

    countMTPDDefined(recovery) {
        return Object.values(recovery).filter(r => r.mtpd).length;
    }

    generateComplianceRecommendations(checks) {
        return checks
            .filter(c => c.status !== 'Compliant')
            .map(c => ({
                clause: c.clause,
                requirement: c.requirement,
                action: c.status === 'Non-Compliant' ? 'Immediate action required' : 'Improvement recommended'
            }));
    }

    getRecentActivity(processes) {
        return processes
            .sort((a, b) => new Date(b.updatedAt || b.updated_at) - new Date(a.updatedAt || a.updated_at))
            .slice(0, 5)
            .map(p => ({
                process: p.name,
                action: 'Updated',
                date: p.updatedAt || p.updated_at
            }));
    }

    generateAlerts(processes, impacts, recovery) {
        const alerts = [];
        
        processes.forEach(p => {
            const impact = impacts[p.id] || {};
            const ro = recovery[p.id] || {};
            const score = this.calculateCompositeScore(impact);
            
            if (score >= 4 && !ro.rto) {
                alerts.push({
                    type: 'error',
                    message: `${p.name}: Critical process without RTO defined`
                });
            }
            
            if (ro.rto && ro.mtpd && ro.rto > ro.mtpd) {
                alerts.push({
                    type: 'warning',
                    message: `${p.name}: RTO exceeds MTPD`
                });
            }
        });
        
        return alerts.slice(0, 5);
    }

    calculateEscalationRate(timeline) {
        if (timeline.length < 2) return 0;
        
        const sorted = [...timeline].sort((a, b) => 
            (a.time_offset || a.timeOffset) - (b.time_offset || b.timeOffset)
        );
        
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        
        const firstScore = (first.financial || 0) + (first.operational || 0);
        const lastScore = (last.financial || 0) + (last.operational || 0);
        const timeDiff = (last.time_offset || last.timeOffset) - (first.time_offset || first.timeOffset);
        
        return timeDiff > 0 ? ((lastScore - firstScore) / timeDiff).toFixed(3) : 0;
    }

    findCriticalPoint(timeline) {
        const sorted = [...timeline].sort((a, b) => 
            (a.time_offset || a.timeOffset) - (b.time_offset || b.timeOffset)
        );
        
        for (const point of sorted) {
            const maxImpact = Math.max(
                point.financial || 0,
                point.operational || 0,
                point.reputational || 0
            );
            if (maxImpact >= 4) {
                return point.time_offset || point.timeOffset;
            }
        }
        return null;
    }

    generateEscalationChart(analysis) {
        return {
            labels: analysis.slice(0, 10).map(a => a.processName.substring(0, 15)),
            datasets: [{
                label: 'Escalation Rate (impact/hour)',
                data: analysis.slice(0, 10).map(a => a.escalationRate),
                backgroundColor: '#ef4444'
            }]
        };
    }

    getMethodologySection() {
        return {
            title: 'Business Impact Analysis Methodology',
            content: `This analysis follows ISO 22301:2019 guidelines for business continuity management. 
The methodology includes systematic identification of critical business processes, 
assessment of potential impacts across multiple dimensions, temporal analysis of impact escalation, 
and establishment of recovery objectives.`
        };
    }

    getImpactScaleDefinitions() {
        return [
            { score: 0, label: 'None', description: 'No measurable impact' },
            { score: 1, label: 'Minimal', description: 'Negligible impact, easily absorbed' },
            { score: 2, label: 'Minor', description: 'Minor impact requiring attention' },
            { score: 3, label: 'Moderate', description: 'Significant impact affecting operations' },
            { score: 4, label: 'Major', description: 'Severe impact requiring immediate action' },
            { score: 5, label: 'Catastrophic', description: 'Critical impact threatening survival' }
        ];
    }

    getRecoveryStrategyOptions() {
        return [
            { id: 'high-availability', name: 'High Availability', rtoRange: '0-1 hour' },
            { id: 'warm-standby', name: 'Warm Standby', rtoRange: '1-8 hours' },
            { id: 'cold-backup', name: 'Cold Backup', rtoRange: '8-72 hours' },
            { id: 'manual-workaround', name: 'Manual Workaround', rtoRange: 'Variable' }
        ];
    }

    // ========================================
    // Export Methods
    // ========================================

    /**
     * Export report to JSON
     */
    async exportToJSON(reportType) {
        const report = await this.generateReport(reportType);
        return JSON.stringify(report, null, 2);
    }

    /**
     * Export report to HTML
     */
    async exportToHTML(reportType) {
        const report = await this.generateReport(reportType);
        return this.renderReportHTML(report);
    }

    /**
     * Generate any report type
     */
    async generateReport(type) {
        switch (type) {
            case 'executive': return this.generateExecutiveSummary();
            case 'detailed': return this.generateDetailedReport();
            case 'riskMatrix': return this.generateRiskMatrix();
            case 'recovery': return this.generateRecoveryReport();
            case 'dependency': return this.generateDependencyReport();
            case 'compliance': return this.generateComplianceReport();
            case 'dashboard': return this.generateDashboardSummary();
            case 'timeline': return this.generateTimelineReport();
            default: throw new Error(`Unknown report type: ${type}`);
        }
    }

    /**
     * Render report as HTML
     */
    renderReportHTML(report) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
        .report { max-width: 1200px; margin: 0 auto; padding: 40px; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #1e3a5f; font-size: 28px; margin-bottom: 10px; }
        .header .meta { color: #666; font-size: 14px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #3b82f6; font-size: 20px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }
        .summary-card .value { font-size: 32px; font-weight: bold; }
        .summary-card .label { font-size: 14px; opacity: 0.9; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f8fafc; color: #374151; font-weight: 600; }
        tr:hover { background: #f8fafc; }
        .risk-critical { background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
        .risk-high { background: #fef3c7; color: #f59e0b; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
        .risk-medium { background: #dbeafe; color: #3b82f6; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
        .risk-low { background: #d1fae5; color: #10b981; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
        .recommendation { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 10px; border-radius: 0 8px 8px 0; }
        .recommendation.high { border-left-color: #dc2626; background: #fef2f2; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 12px; }
        @media print { .report { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="report">
        <div class="header">
            <h1>${report.title}</h1>
            <div class="meta">Generated: ${new Date(report.generatedAt).toLocaleString()}</div>
        </div>
        ${this.renderReportContent(report)}
        <div class="footer">
            <p>Business Impact Analysis Tool - ISO 22301:2019 Compliant</p>
            <p>Confidential - For Internal Use Only</p>
        </div>
    </div>
</body>
</html>`;
    }

    renderReportContent(report) {
        switch (report.type) {
            case 'executive':
                return this.renderExecutiveContent(report);
            case 'riskMatrix':
                return this.renderRiskMatrixContent(report);
            case 'compliance':
                return this.renderComplianceContent(report);
            default:
                return `<pre>${JSON.stringify(report, null, 2)}</pre>`;
        }
    }

    renderExecutiveContent(report) {
        return `
        <div class="summary-grid">
            <div class="summary-card">
                <div class="value">${report.summary.totalProcesses}</div>
                <div class="label">Total Processes</div>
            </div>
            <div class="summary-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <div class="value">${report.summary.criticalProcesses}</div>
                <div class="label">Critical Processes</div>
            </div>
            <div class="summary-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <div class="value">${report.summary.averageRiskScore.toFixed(1)}</div>
                <div class="label">Avg Risk Score</div>
            </div>
            <div class="summary-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                <div class="value">${report.summary.lowestMTPD || 'N/A'}h</div>
                <div class="label">Lowest MTPD</div>
            </div>
        </div>
        
        <div class="section">
            <h2>Risk Distribution</h2>
            <table>
                <tr><th>Risk Level</th><th>Count</th><th>Percentage</th></tr>
                <tr><td><span class="risk-critical">Critical</span></td><td>${report.riskDistribution.critical}</td><td>${((report.riskDistribution.critical / report.summary.totalProcesses) * 100).toFixed(1)}%</td></tr>
                <tr><td><span class="risk-high">High</span></td><td>${report.riskDistribution.high}</td><td>${((report.riskDistribution.high / report.summary.totalProcesses) * 100).toFixed(1)}%</td></tr>
                <tr><td><span class="risk-medium">Medium</span></td><td>${report.riskDistribution.medium}</td><td>${((report.riskDistribution.medium / report.summary.totalProcesses) * 100).toFixed(1)}%</td></tr>
                <tr><td><span class="risk-low">Low</span></td><td>${report.riskDistribution.low}</td><td>${((report.riskDistribution.low / report.summary.totalProcesses) * 100).toFixed(1)}%</td></tr>
            </table>
        </div>
        
        <div class="section">
            <h2>Critical Processes</h2>
            <table>
                <tr><th>Process</th><th>Department</th><th>Risk Score</th></tr>
                ${report.criticalProcesses.map(p => `
                    <tr><td>${p.name}</td><td>${p.department}</td><td><span class="risk-critical">${p.score}</span></td></tr>
                `).join('')}
            </table>
        </div>
        
        <div class="section">
            <h2>Recommendations</h2>
            ${report.recommendations.map(r => `
                <div class="recommendation ${r.priority.toLowerCase()}">
                    <strong>${r.priority} Priority - ${r.category}:</strong> ${r.recommendation}
                </div>
            `).join('')}
        </div>`;
    }

    renderRiskMatrixContent(report) {
        return `
        <div class="summary-grid">
            <div class="summary-card" style="background: #dc2626;">
                <div class="value">${report.summary.critical}</div>
                <div class="label">Critical</div>
            </div>
            <div class="summary-card" style="background: #f59e0b;">
                <div class="value">${report.summary.high}</div>
                <div class="label">High</div>
            </div>
            <div class="summary-card" style="background: #3b82f6;">
                <div class="value">${report.summary.medium}</div>
                <div class="label">Medium</div>
            </div>
            <div class="summary-card" style="background: #10b981;">
                <div class="value">${report.summary.low}</div>
                <div class="label">Low</div>
            </div>
        </div>
        
        ${Object.entries(report.matrix).map(([level, processes]) => `
            <div class="section">
                <h2>${level.charAt(0).toUpperCase() + level.slice(1)} Risk Processes (${processes.length})</h2>
                ${processes.length > 0 ? `
                    <table>
                        <tr><th>Process</th><th>Department</th><th>Score</th><th>Financial</th><th>Operational</th></tr>
                        ${processes.map(p => `
                            <tr>
                                <td>${p.name}</td>
                                <td>${p.department}</td>
                                <td><span class="risk-${level}">${p.score}</span></td>
                                <td>${p.impactBreakdown.financial}/5</td>
                                <td>${p.impactBreakdown.operational}/5</td>
                            </tr>
                        `).join('')}
                    </table>
                ` : '<p>No processes in this category.</p>'}
            </div>
        `).join('')}`;
    }

    renderComplianceContent(report) {
        const statusColor = {
            'Compliant': 'risk-low',
            'Partial': 'risk-medium',
            'Non-Compliant': 'risk-critical'
        };
        
        return `
        <div class="summary-grid">
            <div class="summary-card" style="background: ${report.overallStatus === 'Fully Compliant' ? '#10b981' : report.overallStatus === 'Partially Compliant' ? '#f59e0b' : '#dc2626'};">
                <div class="value">${report.summary.complianceRate}</div>
                <div class="label">Compliance Rate</div>
            </div>
            <div class="summary-card" style="background: #10b981;">
                <div class="value">${report.summary.compliant}</div>
                <div class="label">Compliant</div>
            </div>
            <div class="summary-card" style="background: #f59e0b;">
                <div class="value">${report.summary.partial}</div>
                <div class="label">Partial</div>
            </div>
            <div class="summary-card" style="background: #dc2626;">
                <div class="value">${report.summary.nonCompliant}</div>
                <div class="label">Non-Compliant</div>
            </div>
        </div>
        
        <div class="section">
            <h2>ISO 22301:2019 Compliance Checks</h2>
            <table>
                <tr><th>Clause</th><th>Requirement</th><th>Status</th><th>Evidence</th></tr>
                ${report.checks.map(c => `
                    <tr>
                        <td>${c.clause}</td>
                        <td>${c.requirement}</td>
                        <td><span class="${statusColor[c.status]}">${c.status}</span></td>
                        <td>${c.evidence}</td>
                    </tr>
                `).join('')}
            </table>
        </div>
        
        ${report.recommendations.length > 0 ? `
            <div class="section">
                <h2>Recommendations for Improvement</h2>
                ${report.recommendations.map(r => `
                    <div class="recommendation high">
                        <strong>Clause ${r.clause}:</strong> ${r.requirement} - ${r.action}
                    </div>
                `).join('')}
            </div>
        ` : ''}`;
    }
}

// Create global instance
window.BIAReports = new BIAReportGenerator();

console.log('BIA Report Generator loaded. Available reports:', Object.keys(window.BIAReports.reportTypes));
console.log('Usage: await BIAReports.generateReport("executive")');
