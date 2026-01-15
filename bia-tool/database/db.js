/**
 * SQLite Database Module for BIA Tool
 * Uses sql.js (SQLite compiled to WebAssembly) for browser-based database
 */

class BIADatabase {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        this.dbPath = 'bia-tool/database/bia.db';
        this.Schema = {
            assessments: {
                table: 'assessments',
                fields: ['id', 'name', 'organization', 'created_date', 'modified_date', 'status', 'current_step', 'description', 'settings', 'metadata']
            },
            processes: {
                table: 'processes',
                fields: ['id', 'assessment_id', 'name', 'description', 'department', 'owner', 'criticality_score', 'criticality', 'status', 'dependencies', 'created_at', 'updated_at', 'sort_order']
            },
            impactAssessments: {
                table: 'impact_assessments',
                fields: ['id', 'process_id', 'financial', 'operational', 'reputational', 'legal', 'health', 'environmental', 'customer', 'strategic', 'composite_score', 'assessed_at', 'assessed_by', 'notes']
            },
            timelinePoints: {
                table: 'timeline_points',
                fields: ['id', 'process_id', 'time_offset', 'time_label', 'financial', 'operational', 'reputational', 'legal', 'health', 'customer', 'strategic', 'cumulative_score']
            },
            recoveryObjectives: {
                table: 'recovery_objectives',
                fields: ['id', 'process_id', 'mtpd', 'rto', 'rpo', 'mbco', 'recovery_strategy', 'strategy_notes']
            },
            dependencies: {
                table: 'dependencies',
                fields: ['id', 'assessment_id', 'process_id', 'dependent_process_id', 'dependency_type', 'criticality', 'strength', 'description', 'created_at']
            },
            resources: {
                table: 'resources',
                fields: ['id', 'assessment_id', 'process_id', 'resource_type', 'name', 'description', 'quantity', 'criticality', 'backup_available', 'backup_details']
            },
            auditTrail: {
                table: 'audit_trail',
                fields: ['id', 'assessment_id', 'entity_type', 'entity_id', 'action', 'old_values', 'new_values', 'user_id', 'user_name', 'timestamp', 'ip_address']
            },
            reports: {
                table: 'reports',
                fields: ['id', 'assessment_id', 'name', 'report_type', 'config', 'created_at', 'generated_at']
            },
            notifications: {
                table: 'notifications',
                fields: ['id', 'assessment_id', 'user_id', 'type', 'title', 'message', 'severity', 'is_read', 'created_at', 'expires_at']
            }
        };
    }

    /**
     * Initialize the database
     */
    async init() {
        try {
            if (this.isInitialized) {
                console.log('Database already initialized');
                return true;
            }

            // Check if sql.js is available
            if (typeof SQL === 'undefined') {
                console.log('sql.js not loaded, using localStorage fallback');
                this.useFallback = true;
                this.isInitialized = true;
                return true;
            }

            // Try to load existing database from localStorage
            const savedDb = localStorage.getItem('bia_database');
            if (savedDb) {
                const binaryArray = this.base64ToArrayBuffer(savedDb);
                this.db = new SQL.Database(binaryArray);
                console.log('Loaded existing database from localStorage');
            } else {
                // Initialize new database
                this.db = new SQL.Database();
                console.log('Created new database');
            }

            // Run schema initialization
            await this.runSchema();
            this.isInitialized = true;
            
            // Set up auto-save listener
            this.setupAutoSave();
            
            console.log('Database initialized successfully');
            return true;
        } catch (error) {
            console.error('Database initialization failed:', error);
            this.useFallback = true;
            this.isInitialized = true;
            return true;
        }
    }

    /**
     * Run the schema SQL
     */
    async runSchema() {
        try {
            const schema = await fetch('database/schema.sql').then(r => r.text());
            this.db.run(schema);
            this.save();
            return true;
        } catch (error) {
            console.error('Schema initialization failed:', error);
            // Schema might already exist, continue
            return true;
        }
    }

    /**
     * Save database to localStorage
     */
    save() {
        if (this.useFallback || !this.db) return;
        
        try {
            const data = this.db.export();
            const base64 = this.arrayBufferToBase64(data);
            localStorage.setItem('bia_database', base64);
            localStorage.setItem('bia_database_timestamp', Date.now());
        } catch (error) {
            console.error('Failed to save database:', error);
        }
    }

    /**
     * Set up auto-save on page unload
     */
    setupAutoSave() {
        window.addEventListener('beforeunload', () => this.save());
        setInterval(() => this.save(), 30000); // Auto-save every 30 seconds
    }

    // ========================================
    // Generic CRUD Operations
    // ========================================

    /**
     * Insert a new record
     */
    insert(entity, data) {
        if (this.useFallback) return this.fallbackInsert(entity, data);
        
        try {
            const schema = this.Schema[entity];
            if (!schema) throw new Error(`Unknown entity: ${entity}`);
            
            const fields = schema.fields.filter(f => data[f] !== undefined);
            const placeholders = fields.map(() => '?').join(', ');
            const values = fields.map(f => {
                const val = data[f];
                if (typeof val === 'object') return JSON.stringify(val);
                return val;
            });
            
            const sql = `INSERT INTO ${schema.table} (${fields.join(', ')}) VALUES (${placeholders})`;
            this.db.run(sql, values);
            this.save();
            
            return { success: true, id: data.id };
        } catch (error) {
            console.error(`Insert failed for ${entity}:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update an existing record
     */
    update(entity, id, data) {
        if (this.useFallback) return this.fallbackUpdate(entity, id, data);
        
        try {
            const schema = this.Schema[entity];
            if (!schema) throw new Error(`Unknown entity: ${entity}`);
            
            const updates = schema.fields
                .filter(f => f !== 'id' && data[f] !== undefined)
                .map(f => {
                    const val = data[f];
                    const value = typeof val === 'object' ? JSON.stringify(val) : val;
                    return `${f} = ?`;
                });
            
            if (updates.length === 0) return { success: true };
            
            const values = schema.fields
                .filter(f => f !== 'id' && data[f] !== undefined)
                .map(f => {
                    const val = data[f];
                    return typeof val === 'object' ? JSON.stringify(val) : val;
                });
            values.push(id);
            
            const sql = `UPDATE ${schema.table} SET ${updates.join(', ')} WHERE id = ?`;
            this.db.run(sql, values);
            this.save();
            
            return { success: true };
        } catch (error) {
            console.error(`Update failed for ${entity}:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete a record
     */
    delete(entity, id) {
        if (this.useFallback) return this.fallbackDelete(entity, id);
        
        try {
            const schema = this.Schema[entity];
            if (!schema) throw new Error(`Unknown entity: ${entity}`);
            
            const sql = `DELETE FROM ${schema.table} WHERE id = ?`;
            this.db.run(sql, [id]);
            this.save();
            
            return { success: true };
        } catch (error) {
            console.error(`Delete failed for ${entity}:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Find a single record by ID
     */
    findById(entity, id) {
        if (this.useFallback) return this.fallbackFindById(entity, id);
        
        try {
            const schema = this.Schema[entity];
            if (!schema) throw new Error(`Unknown entity: ${entity}`);
            
            const sql = `SELECT * FROM ${schema.table} WHERE id = ?`;
            const stmt = this.db.prepare(sql);
            stmt.bind([id]);
            
            if (stmt.step()) {
                const row = stmt.getAsObject();
                // Parse JSON fields
                schema.fields.forEach(field => {
                    if (row[field] && typeof row[field] === 'string' && row[field].startsWith('{')) {
                        try {
                            row[field] = JSON.parse(row[field]);
                        } catch (e) {}
                    }
                });
                stmt.free();
                return { success: true, data: row };
            }
            
            stmt.free();
            return { success: false, error: 'Record not found' };
        } catch (error) {
            console.error(`FindById failed for ${entity}:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Find records by criteria
     */
    find(entity, criteria = {}) {
        if (this.useFallback) return this.fallbackFind(entity, criteria);
        
        try {
            const schema = this.Schema[entity];
            if (!schema) throw new Error(`Unknown entity: ${entity}`);
            
            let sql = `SELECT * FROM ${schema.table}`;
            const conditions = [];
            const values = [];
            
            Object.entries(criteria).forEach(([key, value]) => {
                if (schema.fields.includes(key)) {
                    if (value === null) {
                        conditions.push(`${key} IS NULL`);
                    } else if (typeof value === 'object') {
                        conditions.push(`${key} = ?`);
                        values.push(JSON.stringify(value));
                    } else {
                        conditions.push(`${key} = ?`);
                        values.push(value);
                    }
                }
            });
            
            if (conditions.length > 0) {
                sql += ` WHERE ${conditions.join(' AND ')}`;
            }
            
            sql += ' ORDER BY created_at DESC';
            
            const stmt = this.db.prepare(sql);
            if (values.length > 0) stmt.bind(values);
            
            const results = [];
            while (stmt.step()) {
                const row = stmt.getAsObject();
                // Parse JSON fields
                schema.fields.forEach(field => {
                    if (row[field] && typeof row[field] === 'string' && row[field].startsWith('{')) {
                        try {
                            row[field] = JSON.parse(row[field]);
                        } catch (e) {}
                    }
                });
                results.push(row);
            }
            
            stmt.free();
            return { success: true, data: results };
        } catch (error) {
            console.error(`Find failed for ${entity}:`, error);
            return { success: false, error: error.message, data: [] };
        }
    }

    /**
     * Execute custom SQL query
     */
    query(sql, params = []) {
        if (this.useFallback) return { success: false, error: 'Fallback mode' };
        
        try {
            const stmt = this.db.prepare(sql);
            if (params.length > 0) stmt.bind(params);
            
            const results = [];
            while (stmt.step()) {
                results.push(stmt.getAsObject());
            }
            stmt.free();
            
            return { success: true, data: results };
        } catch (error) {
            console.error('Query failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // Specialized Operations for BIA Tool
    // ========================================

    /**
     * Get all processes for an assessment
     */
    getProcesses(assessmentId) {
        return this.find('processes', { assessment_id: assessmentId });
    }

    /**
     * Get full process with all related data
     */
    getProcessWithDetails(processId) {
        const process = this.findById('processes', processId);
        if (!process.success) return process;
        
        const impact = this.findById('impactAssessments', processId);
        const timeline = this.find('timelinePoints', { process_id: processId });
        const recovery = this.findById('recoveryObjectives', processId);
        
        return {
            success: true,
            data: {
                ...process.data,
                impact: impact.success ? impact.data : null,
                timeline: timeline.success ? timeline.data : [],
                recovery: recovery.success ? recovery.data : null
            }
        };
    }

    /**
     * Get assessment with all processes
     */
    getAssessmentWithProcesses(assessmentId) {
        const assessment = this.findById('assessments', assessmentId);
        const processes = this.getProcesses(assessmentId);
        
        if (!assessment.success) return assessment;
        
        return {
            success: true,
            data: {
                ...assessment.data,
                processes: processes.success ? processes.data : []
            }
        };
    }

    /**
     * Save a complete process with all related data
     */
    saveProcess(processData) {
        const { impact, timeline, recovery, ...mainData } = processData;
        
        // Insert or update main process data
        const existing = this.findById('processes', mainData.id);
        let result;
        if (existing.success) {
            result = this.update('processes', mainData.id, mainData);
        } else {
            result = this.insert('processes', mainData);
        }
        
        if (!result.success) return result;
        
        // Handle impact assessment
        if (impact) {
            const existingImpact = this.findById('impactAssessments', mainData.id);
            if (existingImpact.success) {
                this.update('impactAssessments', mainData.id, { ...impact, process_id: mainData.id });
            } else {
                this.insert('impactAssessments', { ...impact, process_id: mainData.id });
            }
        }
        
        // Handle recovery objectives
        if (recovery) {
            const existingRecovery = this.findById('recoveryObjectives', mainData.id);
            if (existingRecovery.success) {
                this.update('recoveryObjectives', mainData.id, { ...recovery, process_id: mainData.id });
            } else {
                this.insert('recoveryObjectives', { ...recovery, process_id: mainData.id });
            }
        }
        
        // Handle timeline points (replace all)
        if (timeline && Array.isArray(timeline)) {
            this.delete('timelinePoints', mainData.id); // This won't work directly
            // Delete all timeline points for this process
            const existingTimeline = this.find('timelinePoints', { process_id: mainData.id });
            if (existingTimeline.success) {
                existingTimeline.data.forEach(tp => {
                    this.delete('timelinePoints', tp.id);
                });
            }
            // Insert new timeline points
            timeline.forEach(tp => {
                this.insert('timelinePoints', { ...tp, process_id: mainData.id });
            });
        }
        
        return { success: true, id: mainData.id };
    }

    /**
     * Get high-risk processes
     */
    getHighRiskProcesses(assessmentId) {
        const result = this.query(`
            SELECT * FROM high_risk_processes 
            WHERE id IN (SELECT id FROM processes WHERE assessment_id = ?)
            ORDER BY composite_score DESC
        `, [assessmentId]);
        return result;
    }

    /**
     * Get dependency summary
     */
    getDependencySummary(assessmentId) {
        const result = this.query(`
            SELECT * FROM dependency_summary 
            WHERE assessment_id = ?
        `, [assessmentId]);
        return result;
    }

    /**
     * Add audit trail entry
     */
    addAuditEntry(assessmentId, entityType, entityId, action, oldValues, newValues) {
        const entry = {
            id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            assessment_id: assessmentId,
            entity_type: entityType,
            entity_id: entityId,
            action: action,
            old_values: oldValues ? JSON.stringify(oldValues) : null,
            new_values: newValues ? JSON.stringify(newValues) : null,
            user_id: null,
            user_name: null,
            timestamp: new Date().toISOString(),
            ip_address: null
        };
        
        return this.insert('auditTrail', entry);
    }

    // ========================================
    // Fallback Methods (localStorage)
    // ========================================

    fallbackInsert(entity, data) {
        const key = `bia_${entity}`;
        const items = JSON.parse(localStorage.getItem(key) || '[]');
        items.push(data);
        localStorage.setItem(key, JSON.stringify(items));
        return { success: true, id: data.id };
    }

    fallbackUpdate(entity, id, data) {
        const key = `bia_${entity}`;
        const items = JSON.parse(localStorage.getItem(key) || '[]');
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...data };
            localStorage.setItem(key, JSON.stringify(items));
        }
        return { success: true };
    }

    fallbackDelete(entity, id) {
        const key = `bia_${entity}`;
        const items = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = items.filter(item => item.id !== id);
        localStorage.setItem(key, JSON.stringify(filtered));
        return { success: true };
    }

    fallbackFindById(entity, id) {
        const key = `bia_${entity}`;
        const items = JSON.parse(localStorage.getItem(key) || '[]');
        const item = items.find(item => item.id === id);
        return item ? { success: true, data: item } : { success: false, error: 'Not found' };
    }

    fallbackFind(entity, criteria = {}) {
        const key = `bia_${entity}`;
        let items = JSON.parse(localStorage.getItem(key) || '[]');
        
        if (Object.keys(criteria).length > 0) {
            items = items.filter(item => {
                return Object.entries(criteria).every(([key, value]) => item[key] === value);
            });
        }
        
        return { success: true, data: items };
    }

    // ========================================
    // Utility Methods
    // ========================================

    /**
     * Generate unique ID
     */
    generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return prefix ? `${prefix}-${timestamp}${random}` : `${timestamp}${random}`;
    }

    /**
     * Export database to JSON
     */
    exportToJson() {
        const data = {};
        Object.keys(this.Schema).forEach(entity => {
            const result = this.find(entity);
            if (result.success) {
                data[entity] = result.data;
            }
        });
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import data from JSON
     */
    importFromJson(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            // Clear existing data
            Object.keys(this.Schema).forEach(entity => {
                if (entity !== 'auditTrail') { // Keep audit trail
                    localStorage.removeItem(`bia_${entity}`);
                    if (!this.useFallback && this.db) {
                        this.db.run(`DELETE FROM ${this.Schema[entity].table}`);
                    }
                }
            });
            
            // Import new data
            Object.entries(data).forEach(([entity, items]) => {
                if (Array.isArray(items)) {
                    items.forEach(item => this.insert(entity, item));
                }
            });
            
            this.save();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Clear all data
     */
    clearAll() {
        Object.keys(this.Schema).forEach(entity => {
            const schema = this.Schema[entity];
            if (!this.useFallback && this.db) {
                this.db.run(`DELETE FROM ${schema.table}`);
            }
            localStorage.removeItem(`bia_${entity}`);
        });
        this.save();
    }

    // Helper functions for base64 conversion
    base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}

// Create global instance
window.db = new BIADatabase();

// Initialize database when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.db.init();
});
