/**
 * Database Integration Layer
 * Bridges the SQLite database with the existing AppState management
 */

class DatabaseIntegration {
    constructor() {
        this.db = window.db;
        this.isReady = false;
        this.syncInterval = null;
    }

    /**
     * Initialize the integration layer
     */
    async init() {
        await this.db.init();
        this.isReady = true;
        console.log('Database integration layer initialized');
        
        // Set up real-time sync
        this.startSync();
    }

    /**
     * Start periodic synchronization
     */
    startSync() {
        // Sync every 60 seconds
        this.syncInterval = setInterval(() => {
            this.syncToDatabase();
        }, 60000);
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.syncToDatabase();
        });
    }

    /**
     * Stop synchronization
     */
    stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
    }

    // ========================================
    // Sync Operations
    // ========================================

    /**
     * Sync AppState to database
     */
    async syncToDatabase() {
        if (!this.isReady) return;
        
        try {
            // Sync processes
            if (AppState.processes && AppState.processes.length > 0) {
                for (const process of AppState.processes) {
                    await this.saveProcess(process);
                }
            }
            
            // Sync impact assessments
            if (AppState.impacts) {
                for (const [processId, impact] of Object.entries(AppState.impacts)) {
                    await this.saveImpactAssessment(processId, impact);
                }
            }
            
            // Sync recovery objectives
            if (AppState.recoveryObjectives) {
                for (const [processId, recovery] of Object.entries(AppState.recoveryObjectives)) {
                    await this.saveRecoveryObjective(processId, recovery);
                }
            }
            
            // Sync temporal data
            if (AppState.temporalData) {
                for (const [processId, timeline] of Object.entries(AppState.temporalData)) {
                    await this.saveTimelineData(processId, timeline);
                }
            }
            
            // Sync dependencies
            if (AppState.dependencies) {
                await this.saveDependencies(AppState.dependencies);
            }
            
            console.log('AppState synced to database');
            return { success: true };
        } catch (error) {
            console.error('Sync failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load data from database to AppState
     */
    async loadFromDatabase() {
        if (!this.isReady) return;
        
        try {
            // Load processes
            const processesResult = this.db.find('processes');
            if (processesResult.success) {
                AppState.processes = processesResult.data;
            }
            
            // Load impact assessments
            const impactsResult = this.db.query('SELECT * FROM impact_assessments');
            if (impactsResult.success) {
                impactsResult.data.forEach(impact => {
                    AppState.impacts[impact.process_id] = impact;
                });
            }
            
            // Load recovery objectives
            const recoveryResult = this.db.query('SELECT * FROM recovery_objectives');
            if (recoveryResult.success) {
                recoveryResult.data.forEach(recovery => {
                    AppState.recoveryObjectives[recovery.process_id] = recovery;
                });
            }
            
            // Load temporal data
            const timelineResult = this.db.query('SELECT * FROM timeline_points ORDER BY time_offset');
            if (timelineResult.success) {
                timelineResult.data.forEach(tp => {
                    if (!AppState.temporalData[tp.process_id]) {
                        AppState.temporalData[tp.process_id] = [];
                    }
                    AppState.temporalData[tp.process_id].push(tp);
                });
            }
            
            // Load dependencies
            const depsResult = this.db.query('SELECT * FROM dependencies');
            if (depsResult.success) {
                depsResult.data.forEach(dep => {
                    if (!AppState.dependencies.upstream[dep.process_id]) {
                        AppState.dependencies.upstream[dep.process_id] = [];
                    }
                    if (dep.dependent_process_id) {
                        AppState.dependencies.upstream[dep.process_id].push({
                            id: dep.id,
                            processId: dep.dependent_process_id,
                            type: dep.dependency_type,
                            criticality: dep.criticality,
                            strength: dep.strength
                        });
                    }
                });
            }
            
            console.log('Database loaded to AppState');
            return { success: true };
        } catch (error) {
            console.error('Load failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // Process Operations
    // ========================================

    /**
     * Save a process to the database
     */
    async saveProcess(process) {
        const processData = {
            id: process.id,
            assessment_id: 'default-assessment', // Default assessment ID
            name: process.name,
            description: process.description,
            department: process.department,
            owner: process.owner,
            criticality_score: this.criticalityToScore(process.criticality),
            criticality: process.criticality,
            status: process.status || 'draft',
            dependencies: process.dependencies ? JSON.stringify(process.dependencies) : '[]',
            created_at: process.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sort_order: process.sortOrder || 0
        };
        
        const existing = await this.db.findById('processes', process.id);
        if (existing.success) {
            return this.db.update('processes', process.id, processData);
        } else {
            return this.db.insert('processes', processData);
        }
    }

    /**
     * Delete a process from the database
     */
    async deleteProcess(processId) {
        // Delete related data first
        this.db.delete('impactAssessments', processId);
        this.db.delete('recoveryObjectives', processId);
        
        // Delete timeline points
        const timeline = this.db.find('timelinePoints', { process_id: processId });
        if (timeline.success) {
            timeline.data.forEach(tp => this.db.delete('timelinePoints', tp.id));
        }
        
        return this.db.delete('processes', processId);
    }

    // ========================================
    // Impact Assessment Operations
    // ========================================

    /**
     * Save impact assessment
     */
    async saveImpactAssessment(processId, impact) {
        const impactData = {
            id: processId,
            process_id: processId,
            financial: impact.financial || 0,
            operational: impact.operational || 0,
            reputational: impact.reputational || 0,
            legal: impact.legal || 0,
            health: impact.health || 0,
            environmental: impact.environmental || 0,
            customer: impact.customer || 0,
            strategic: impact.strategic || 0,
            composite_score: this.calculateCompositeScore(impact),
            assessed_at: new Date().toISOString(),
            assessed_by: null,
            notes: impact.notes || null
        };
        
        const existing = await this.db.findById('impactAssessments', processId);
        if (existing.success) {
            return this.db.update('impactAssessments', processId, impactData);
        } else {
            return this.db.insert('impactAssessments', impactData);
        }
    }

    // ========================================
    // Recovery Objective Operations
    // ========================================

    /**
     * Save recovery objectives
     */
    async saveRecoveryObjective(processId, recovery) {
        const recoveryData = {
            id: processId,
            process_id: processId,
            mtpd: recovery.mtpd || 168,
            rto: recovery.rto || 72,
            rpo: recovery.rpo || 24,
            mbco: recovery.mbco ? 1 : 0,
            recovery_strategy: recovery.recoveryStrategy || null,
            strategy_notes: recovery.strategyNotes || null
        };
        
        const existing = await this.db.findById('recoveryObjectives', processId);
        if (existing.success) {
            return this.db.update('recoveryObjectives', processId, recoveryData);
        } else {
            return this.db.insert('recoveryObjectives', recoveryData);
        }
    }

    // ========================================
    // Timeline Operations
    // ========================================

    /**
     * Save timeline data
     */
    async saveTimelineData(processId, timeline) {
        if (!Array.isArray(timeline)) return;
        
        // Delete existing timeline points
        const existing = this.db.find('timelinePoints', { process_id: processId });
        if (existing.success) {
            existing.data.forEach(tp => this.db.delete('timelinePoints', tp.id));
        }
        
        // Insert new timeline points
        timeline.forEach((tp, index) => {
            const timelineData = {
                id: `${processId}-tp-${index}`,
                process_id: processId,
                time_offset: tp.timeOffset || tp.time_offset || index * 24,
                time_label: tp.timeLabel || tp.time_label || `Hour ${index * 24}`,
                financial: tp.financial || 0,
                operational: tp.operational || 0,
                reputational: tp.reputational || 0,
                legal: tp.legal || 0,
                health: tp.health || 0,
                customer: tp.customer || 0,
                strategic: tp.strategic || 0,
                cumulative_score: tp.cumulativeScore || tp.cumulative_score || 0
            };
            this.db.insert('timelinePoints', timelineData);
        });
    }

    // ========================================
    // Dependency Operations
    // ========================================

    /**
     * Save dependencies
     */
    async saveDependencies(dependencies) {
        const assessmentId = 'default-assessment';
        
        // Clear existing dependencies
        const existing = this.db.find('dependencies', { assessment_id: assessmentId });
        if (existing.success) {
            existing.data.forEach(d => this.db.delete('dependencies', d.id));
        }
        
        // Save upstream dependencies
        if (dependencies.upstream) {
            for (const [processId, deps] of Object.entries(dependencies.upstream)) {
                deps.forEach(dep => {
                    const depData = {
                        id: dep.id || this.db.generateId('DEP'),
                        assessment_id: assessmentId,
                        process_id: processId,
                        dependent_process_id: dep.processId,
                        dependency_type: dep.type || 'operational',
                        criticality: dep.criticality || 3,
                        strength: dep.strength || 1.0,
                        description: dep.description || null,
                        created_at: new Date().toISOString()
                    };
                    this.db.insert('dependencies', depData);
                });
            }
        }
    }

    // ========================================
    // Utility Methods
    // ========================================

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
    }

    /**
     * Calculate composite impact score
     */
    calculateCompositeScore(impact) {
        const weights = AppState.settings?.weights || {
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

    /**
     * Export assessment data
     */
    exportAssessment(assessmentId = 'default-assessment') {
        const data = {
            assessment: this.db.findById('assessments', assessmentId),
            processes: this.db.getProcesses(assessmentId),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import assessment data
     */
    importAssessment(jsonString) {
        return this.db.importFromJson(jsonString);
    }

    /**
     * Get database stats
     */
    async getStats() {
        const stats = {};
        
        for (const entity of Object.keys(this.db.Schema)) {
            const result = this.db.find(entity);
            if (result.success) {
                stats[entity] = result.data.length;
            }
        }
        
        return stats;
    }
}

// Create global instance
window.dbIntegration = new DatabaseIntegration();

// Initialize when database is ready
window.addEventListener('dbReady', () => {
    window.dbIntegration.init();
});
