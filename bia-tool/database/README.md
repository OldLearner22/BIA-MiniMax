# SQLite Database for BIA Tool

This directory contains the SQLite database implementation for the Business Impact Analysis Tool.

## Overview

The BIA Tool now uses SQLite (via sql.js) for persistent local storage instead of relying solely on browser localStorage. This provides:

- **Structured Data Storage**: Relational database schema with proper data types and relationships
- **Query Capabilities**: Execute SQL queries for complex data retrieval
- **Better Performance**: Indexed queries for faster data access
- **Data Integrity**: Foreign key constraints and transactional support
- **Export/Import**: Easy backup and restore functionality

## File Structure

```
database/
├── schema.sql           # Database schema definition
├── db.js                # Main database module
├── integration.js       # Integration with AppState
├── sample-data.js       # Sample data for testing
└── README.md           # This file
```

## Installation

### 1. Install Dependencies

```bash
npm install
```

This will install sql.js, which provides SQLite compiled to WebAssembly for browser use.

### 2. Copy sql.js Library

Copy the sql.js files from `node_modules/sql.js/dist/` to your `libs/` directory:

```bash
cp node_modules/sql.js/dist/sql-wasm.wasm libs/
cp node_modules/sql.js/dist/sql-wasm.js libs/
```

### 3. Update HTML

Make sure your `index.html` includes the database scripts:

```html
<script src="libs/sql-wasm.js"></script>
<script src="database/db.js"></script>
<script src="database/integration.js"></script>
```

## Usage

### Basic Operations

```javascript
// Initialize the database
await window.db.init();

// Insert a process
await window.db.insert('processes', {
    id: 'PROC-001',
    name: 'Payment Processing',
    department: 'Finance',
    owner: 'Jane Smith',
    criticality: 'critical'
});

// Find a process
const result = await window.db.findById('processes', 'PROC-001');
if (result.success) {
    console.log('Found:', result.data);
}

// Find multiple processes
const processes = await window.db.find('processes', { department: 'Finance' });
processes.data.forEach(p => console.log(p.name));

// Update a process
await window.db.update('processes', 'PROC-001', {
    owner: 'John Smith'
});

// Delete a process
await window.db.delete('processes', 'PROC-001');
```

### Using the Integration Layer

The integration layer bridges the database with the existing AppState:

```javascript
// Initialize integration
await window.dbIntegration.init();

// Sync AppState to database
await window.dbIntegration.syncToDatabase();

// Load from database to AppState
await window.dbIntegration.loadFromDatabase();

// Save a process (with all related data)
await window.dbIntegration.saveProcess({
    id: 'PROC-002',
    name: 'Customer Service',
    department: 'Operations',
    criticality: 'high'
});

// Save impact assessment
await window.dbIntegration.saveImpactAssessment('PROC-002', {
    financial: 3,
    operational: 4,
    reputational: 3,
    legal: 2,
    health: 0,
    environmental: 0
});
```

### Using Sample Data

```javascript
// Load sample data into AppState
SampleData.loadIntoAppState();

// Load sample data into database
await SampleData.loadIntoDatabase();
```

### Export and Import

```javascript
// Export to JSON
const json = window.db.exportToJson();
localStorage.setItem('bia_backup', json);

// Import from JSON
await window.db.importFromJson(json);

// Clear all data
window.db.clearAll();
```

### Custom Queries

```javascript
// Execute custom SQL
const result = await window.db.query(`
    SELECT * FROM processes
    WHERE criticality = 'critical'
    ORDER BY name
`);
console.log('Critical processes:', result.data);

// Get high-risk processes (uses database view)
const highRisk = await window.db.getHighRiskProcesses('default-assessment');
```

## Database Schema

### Main Tables

- **assessments**: Business impact analysis sessions
- **processes**: Business processes under analysis
- **impact_assessments**: Impact severity for each process
- **timeline_points**: Impact progression over time
- **recovery_objectives**: MTPD, RTO, RPO for each process
- **dependencies**: Relationships between processes
- **resources**: Personnel, technology, equipment, etc.
- **audit_trail**: Change history for compliance
- **reports**: Saved report configurations
- **notifications**: Application notifications

### Views

- **process_summary**: Process overview with impact scores
- **high_risk_processes**: Processes with composite score >= 4.0
- **dependency_summary**: Dependency relationships

### Indexes

Indexes are created for common query patterns to improve performance.

## Fallback Mode

If sql.js fails to load (e.g., in an environment without WebAssembly support), the database automatically falls back to using localStorage with the same API interface. This ensures compatibility across all browsers.

## Data Persistence

The database automatically saves to localStorage:

- Every 30 seconds (auto-save)
- When navigating away from the page
- After any data modification

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

WebAssembly support is required for full SQLite functionality.

## Performance Tips

1. **Regular Exports**: Periodically export your data to JSON for backup
2. **Index Usage**: The schema includes indexes for common queries
3. **Batch Operations**: Use transactions for bulk operations
4. **Query Optimization**: Use parameterized queries instead of string concatenation

## Troubleshooting

### Database Not Initializing

```javascript
// Check if sql.js loaded
console.log('SQL available:', typeof SQL !== 'undefined');

// Check fallback mode
console.log('Using fallback:', window.db.useFallback);
```

### Data Not Saving

```javascript
// Force save
window.db.save();

// Check localStorage
console.log('DB in localStorage:', localStorage.getItem('bia_database') !== null);
```

### Import Issues

```javascript
// Validate JSON before import
try {
    const data = JSON.parse(jsonString);
    await window.db.importFromJson(jsonString);
} catch (e) {
    console.error('Invalid JSON:', e);
}
```

## API Reference

### BIADatabase Class

- `init()` - Initialize database connection
- `insert(entity, data)` - Insert new record
- `update(entity, id, data)` - Update existing record
- `delete(entity, id)` - Delete record
- `findById(entity, id)` - Find single record
- `find(entity, criteria)` - Find multiple records
- `query(sql, params)` - Execute custom SQL
- `save()` - Save database to localStorage
- `exportToJson()` - Export all data as JSON
- `importFromJson(json)` - Import from JSON
- `clearAll()` - Clear all data

### DatabaseIntegration Class

- `init()` - Initialize integration layer
- `syncToDatabase()` - Sync AppState to database
- `loadFromDatabase()` - Load database to AppState
- `saveProcess(process)` - Save process with related data
- `deleteProcess(id)` - Delete process and related data
- `saveImpactAssessment(id, impact)` - Save impact data
- `saveRecoveryObjective(id, recovery)` - Save recovery objectives
- `saveTimelineData(id, timeline)` - Save timeline points
- `saveDependencies(dependencies)` - Save dependency data
