/**
 * Database Test Script for BIA Tool
 * Run this in browser console to verify database functionality
 */

const DatabaseTests = {
    results: [],
    
    async runAll() {
        console.log('=== BIA Database Test Suite ===\n');
        this.results = [];
        
        await this.testInitialization();
        await this.testProcessCRUD();
        await this.testImpactAssessment();
        await this.testRecoveryObjectives();
        await this.testTimelineData();
        await this.testDependencies();
        await this.testCustomQueries();
        await this.testExportImport();
        await this.testIntegration();
        
        this.printSummary();
        return this.results;
    },
    
    log(testName, passed, message = '') {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status}: ${testName}${message ? ' - ' + message : ''}`);
        this.results.push({ test: testName, passed, message });
    },
    
    async testInitialization() {
        console.log('\n--- Test: Database Initialization ---');
        try {
            await window.db.init();
            this.log('Database Init', window.db.isInitialized, 
                window.db.useFallback ? 'Using localStorage fallback' : 'Using SQLite');
        } catch (e) {
            this.log('Database Init', false, e.message);
        }
    },
    
    async testProcessCRUD() {
        console.log('\n--- Test: Process CRUD Operations ---');
        
        const testProcess = {
            id: 'TEST-PROC-001',
            assessment_id: 'test-assessment',
            name: 'Test Payment System',
            description: 'Test process for database validation',
            department: 'IT',
            owner: 'Test User',
            criticality_score: 5,
            criticality: 'critical',
            status: 'draft',
            dependencies: '[]',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sort_order: 0
        };
        
        // Test INSERT
        const insertResult = await window.db.insert('processes', testProcess);
        this.log('Process INSERT', insertResult.success);
        
        // Test READ
        const readResult = await window.db.findById('processes', 'TEST-PROC-001');
        this.log('Process READ', readResult.success && readResult.data.name === testProcess.name);
        
        // Test UPDATE
        const updateResult = await window.db.update('processes', 'TEST-PROC-001', {
            name: 'Updated Test Process',
            status: 'approved'
        });
        this.log('Process UPDATE', updateResult.success);
        
        // Verify update
        const verifyUpdate = await window.db.findById('processes', 'TEST-PROC-001');
        this.log('Process UPDATE Verify', verifyUpdate.data.name === 'Updated Test Process');
        
        // Test FIND (multiple)
        const findResult = await window.db.find('processes', { department: 'IT' });
        this.log('Process FIND', findResult.success && findResult.data.length > 0);
        
        // Test DELETE
        const deleteResult = await window.db.delete('processes', 'TEST-PROC-001');
        this.log('Process DELETE', deleteResult.success);
        
        // Verify deletion
        const verifyDelete = await window.db.findById('processes', 'TEST-PROC-001');
        this.log('Process DELETE Verify', !verifyDelete.success);
    },
    
    async testImpactAssessment() {
        console.log('\n--- Test: Impact Assessment Operations ---');
        
        // Create test process first
        await window.db.insert('processes', {
            id: 'TEST-IMPACT-PROC',
            assessment_id: 'test-assessment',
            name: 'Impact Test Process',
            department: 'Finance',
            owner: 'Test',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        
        const testImpact = {
            id: 'TEST-IMPACT-001',
            process_id: 'TEST-IMPACT-PROC',
            financial: 4,
            operational: 3,
            reputational: 5,
            legal: 2,
            health: 1,
            environmental: 0,
            customer: 4,
            strategic: 3,
            composite_score: 3.5,
            assessed_at: new Date().toISOString(),
            assessed_by: 'Test User',
            notes: 'Test impact assessment'
        };
        
        const insertResult = await window.db.insert('impactAssessments', testImpact);
        this.log('Impact INSERT', insertResult.success);
        
        const readResult = await window.db.findById('impactAssessments', 'TEST-IMPACT-001');
        this.log('Impact READ', readResult.success && readResult.data.financial === 4);
        
        // Cleanup
        await window.db.delete('impactAssessments', 'TEST-IMPACT-001');
        await window.db.delete('processes', 'TEST-IMPACT-PROC');
    },
    
    async testRecoveryObjectives() {
        console.log('\n--- Test: Recovery Objectives Operations ---');
        
        // Create test process first
        await window.db.insert('processes', {
            id: 'TEST-RO-PROC',
            assessment_id: 'test-assessment',
            name: 'Recovery Test Process',
            department: 'Operations',
            owner: 'Test',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        
        const testRecovery = {
            id: 'TEST-RO-001',
            process_id: 'TEST-RO-PROC',
            mtpd: 24,
            rto: 8,
            rpo: 4,
            mbco: 1,
            recovery_strategy: 'warm-standby',
            strategy_notes: 'Test recovery strategy'
        };
        
        const insertResult = await window.db.insert('recoveryObjectives', testRecovery);
        this.log('Recovery Objectives INSERT', insertResult.success);
        
        const readResult = await window.db.findById('recoveryObjectives', 'TEST-RO-001');
        this.log('Recovery Objectives READ', readResult.success && readResult.data.mtpd === 24);
        
        // Cleanup
        await window.db.delete('recoveryObjectives', 'TEST-RO-001');
        await window.db.delete('processes', 'TEST-RO-PROC');
    },
    
    async testTimelineData() {
        console.log('\n--- Test: Timeline Data Operations ---');
        
        // Create test process first
        await window.db.insert('processes', {
            id: 'TEST-TL-PROC',
            assessment_id: 'test-assessment',
            name: 'Timeline Test Process',
            department: 'IT',
            owner: 'Test',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        
        const timelinePoints = [
            { id: 'TL-001', process_id: 'TEST-TL-PROC', time_offset: 0, time_label: 'Immediate', financial: 1, operational: 1 },
            { id: 'TL-002', process_id: 'TEST-TL-PROC', time_offset: 4, time_label: '4 hours', financial: 2, operational: 2 },
            { id: 'TL-003', process_id: 'TEST-TL-PROC', time_offset: 24, time_label: '1 day', financial: 4, operational: 4 }
        ];
        
        for (const tp of timelinePoints) {
            await window.db.insert('timelinePoints', tp);
        }
        
        const findResult = await window.db.find('timelinePoints', { process_id: 'TEST-TL-PROC' });
        this.log('Timeline INSERT Multiple', findResult.success && findResult.data.length === 3);
        
        // Cleanup
        for (const tp of timelinePoints) {
            await window.db.delete('timelinePoints', tp.id);
        }
        await window.db.delete('processes', 'TEST-TL-PROC');
    },
    
    async testDependencies() {
        console.log('\n--- Test: Dependency Operations ---');
        
        // Create test processes
        await window.db.insert('processes', {
            id: 'DEP-PROC-1', assessment_id: 'test', name: 'Dep Process 1',
            department: 'IT', owner: 'Test', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        });
        await window.db.insert('processes', {
            id: 'DEP-PROC-2', assessment_id: 'test', name: 'Dep Process 2',
            department: 'IT', owner: 'Test', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        });
        
        const dependency = {
            id: 'TEST-DEP-001',
            assessment_id: 'test',
            process_id: 'DEP-PROC-1',
            dependent_process_id: 'DEP-PROC-2',
            dependency_type: 'technical',
            criticality: 4,
            strength: 0.9,
            description: 'Test dependency',
            created_at: new Date().toISOString()
        };
        
        const insertResult = await window.db.insert('dependencies', dependency);
        this.log('Dependency INSERT', insertResult.success);
        
        const readResult = await window.db.find('dependencies', { process_id: 'DEP-PROC-1' });
        this.log('Dependency READ', readResult.success && readResult.data.length > 0);
        
        // Cleanup
        await window.db.delete('dependencies', 'TEST-DEP-001');
        await window.db.delete('processes', 'DEP-PROC-1');
        await window.db.delete('processes', 'DEP-PROC-2');
    },
    
    async testCustomQueries() {
        console.log('\n--- Test: Custom SQL Queries ---');
        
        // Insert test data
        await window.db.insert('processes', {
            id: 'QUERY-TEST-1', assessment_id: 'test', name: 'Critical Process',
            criticality: 'critical', department: 'Finance', owner: 'Test',
            created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        });
        await window.db.insert('processes', {
            id: 'QUERY-TEST-2', assessment_id: 'test', name: 'Medium Process',
            criticality: 'medium', department: 'IT', owner: 'Test',
            created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        });
        
        // Test custom query
        const queryResult = await window.db.query(
            "SELECT * FROM processes WHERE criticality = ?", 
            ['critical']
        );
        this.log('Custom Query', queryResult.success && queryResult.data.length > 0);
        
        // Test aggregate query
        const countResult = await window.db.query(
            "SELECT COUNT(*) as count FROM processes WHERE assessment_id = ?",
            ['test']
        );
        this.log('Aggregate Query', countResult.success);
        
        // Cleanup
        await window.db.delete('processes', 'QUERY-TEST-1');
        await window.db.delete('processes', 'QUERY-TEST-2');
    },
    
    async testExportImport() {
        console.log('\n--- Test: Export/Import Operations ---');
        
        // Insert test data
        await window.db.insert('processes', {
            id: 'EXPORT-TEST', assessment_id: 'export-test', name: 'Export Test Process',
            department: 'Test', owner: 'Test',
            created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        });
        
        // Test export
        const exportedJson = window.db.exportToJson();
        const exported = JSON.parse(exportedJson);
        this.log('Export to JSON', exported.processes && exported.processes.length > 0);
        
        // Cleanup
        await window.db.delete('processes', 'EXPORT-TEST');
    },
    
    async testIntegration() {
        console.log('\n--- Test: AppState Integration ---');
        
        if (typeof window.dbIntegration !== 'undefined') {
            await window.dbIntegration.init();
            this.log('Integration Init', window.dbIntegration.isReady);
            
            // Test sync
            const syncResult = await window.dbIntegration.syncToDatabase();
            this.log('Sync to Database', syncResult === undefined || syncResult.success);
        } else {
            this.log('Integration Layer', false, 'dbIntegration not available');
        }
    },
    
    printSummary() {
        console.log('\n=== Test Summary ===');
        const passed = this.results.filter(r => r.passed).length;
        const failed = this.results.filter(r => !r.passed).length;
        console.log(`Total: ${this.results.length} | Passed: ${passed} | Failed: ${failed}`);
        
        if (failed > 0) {
            console.log('\nFailed Tests:');
            this.results.filter(r => !r.passed).forEach(r => {
                console.log(`  - ${r.test}: ${r.message || 'No message'}`);
            });
        }
        
        return { total: this.results.length, passed, failed };
    }
};

// Make available globally
window.DatabaseTests = DatabaseTests;

console.log('Database Test Suite loaded. Run: DatabaseTests.runAll()');
