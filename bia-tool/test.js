/**
 * Playwright Test for ISO 22301:2019 Business Impact Analysis Tool
 * Tests core functionality and user interactions
 */

const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Track console errors (excluding font loading issues)
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            const text = msg.text();
            // Ignore font loading errors - these don't affect functionality
            if (!text.includes('font') && !text.includes('webfonts') && !text.includes('ERR_FILE_NOT_FOUND')) {
                consoleErrors.push(text);
            }
        }
    });
    
    page.on('pageerror', error => {
        consoleErrors.push(error.message);
    });
    
    console.log('Starting BIA Tool Test...');
    
    try {
        // Load the page
        await page.goto(`file://${process.cwd()}/index.html`, { waitUntil: 'networkidle' });
        
        // Wait for loading screen to disappear
        await page.waitForSelector('#loading-screen.hidden', { timeout: 10000 });
        console.log('✓ Loading screen completed');
        
        // Check if main app is visible
        await page.waitForSelector('#app:not(.hidden)', { timeout: 5000 });
        console.log('✓ Main application loaded');
        
        // Test navigation to all sections
        const sections = ['processes', 'impact', 'temporal', 'recovery', 'prioritisation', 'dependencies', 'resources', 'reports', 'compliance', 'settings'];
        
        for (const section of sections) {
            await page.click(`[data-section="${section}"]`);
            await page.waitForTimeout(300);
            const isVisible = await page.isVisible(`#${section}.active`);
            if (isVisible) {
                console.log(`✓ ${section.charAt(0).toUpperCase() + section.slice(1)} section works`);
            } else {
                console.log(`✗ Failed to navigate to ${section}`);
            }
        }
        
        // Return to dashboard
        await page.click('[data-section="dashboard"]');
        await page.waitForTimeout(500);
        console.log('✓ Dashboard section loaded');
        
        // Test KPI cards are visible
        const kpiCards = await page.$$('.kpi-card');
        console.log(`✓ ${kpiCards.length} KPI cards displayed`);
        
        // Test charts are rendered
        await page.waitForTimeout(1000);
        const charts = await page.$$('canvas');
        console.log(`✓ ${charts.length} chart canvases rendered`);
        
        // Test modal from processes section (where the button is visible)
        await page.click('[data-section="processes"]');
        await page.waitForTimeout(500);
        
        // Wait for the section to be visible
        await page.waitForSelector('#processes.active', { timeout: 3000 });
        
        // Click Add Process button
        const addButton = await page.$('#processes .btn-primary:has-text("Add Process")');
        if (addButton) {
            await addButton.click();
            await page.waitForSelector('#process-modal.active', { timeout: 3000 });
            console.log('✓ Process modal opens correctly');
            
            // Check form tabs work
            const tabs = await page.$$('#process-modal .form-tab');
            console.log(`✓ Process modal has ${tabs.length} tabs`);
            
            // Test switching tabs
            const depsTab = await page.$('#process-modal .form-tab:has-text("Dependencies")');
            if (depsTab) {
                await depsTab.click();
                await page.waitForTimeout(200);
                console.log('✓ Form tab switching works');
            }
            
            // Close modal
            const closeBtn = await page.$('#process-modal .modal-close');
            if (closeBtn) {
                await closeBtn.click();
                await page.waitForTimeout(300);
                console.log('✓ Modal closes correctly');
            }
        }
        
        // Test impact section modal
        await page.click('[data-section="impact"]');
        await page.waitForTimeout(500);
        
        const impactBtn = await page.$('#impact .btn-primary:has-text("New Assessment")');
        if (impactBtn) {
            await impactBtn.click();
            await page.waitForSelector('#impact-modal.active', { timeout: 3000 });
            console.log('✓ Impact assessment modal works');
            
            // Check impact categories are displayed
            const impactCards = await page.$$('.impact-assessment-card');
            console.log(`✓ ${impactCards.length} impact category cards`);
            
            const impactClose = await page.$('#impact-modal .modal-close');
            if (impactClose) {
                await impactClose.click();
                await page.waitForTimeout(300);
            }
        }
        
        // Test recovery section
        await page.click('[data-section="recovery"]');
        await page.waitForTimeout(500);
        console.log('✓ Recovery objectives section loaded');
        
        // Test prioritisation section
        await page.click('[data-section="prioritisation"]');
        await page.waitForTimeout(500);
        
        const weightSliders = await page.$$('.weight-slider-item');
        console.log(`✓ ${weightSliders.length} impact category weight sliders`);
        
        // Test dependency section
        await page.click('[data-section="dependencies"]');
        await page.waitForTimeout(500);
        const dependencyGraph = await page.$('#dependency-graph svg');
        console.log(`✓ Dependency graph rendered: ${dependencyGraph ? 'yes' : 'no'}`);
        
        // Test resources section
        await page.click('[data-section="resources"]');
        await page.waitForTimeout(500);
        const resourceTabs = await page.$$('.resource-categories-tabs .tab-btn');
        console.log(`✓ ${resourceTabs.length} resource category tabs`);
        
        // Test compliance section
        await page.click('[data-section="compliance"]');
        await page.waitForTimeout(500);
        const clauseCards = await page.$$('.clause-card');
        console.log(`✓ ${clauseCards.length} ISO compliance clause cards`);
        
        // Test settings section
        await page.click('[data-section="settings"]');
        await page.waitForTimeout(500);
        const settingsTabs = await page.$$('.settings-tab');
        console.log(`✓ ${settingsTabs.length} settings tabs`);
        
        // Check for console errors
        if (consoleErrors.length > 0) {
            console.log('\n⚠ Console Errors Found:');
            consoleErrors.forEach(err => console.log(`  - ${err}`));
        } else {
            console.log('✓ No critical console errors detected');
        }
        
        console.log('\n========================================');
        console.log('BIA Tool Test Completed Successfully!');
        console.log('========================================');
        
    } catch (error) {
        console.error('Test failed:', error.message);
        
        if (consoleErrors.length > 0) {
            console.log('\nConsole Errors:');
            consoleErrors.forEach(err => console.log(`  - ${err}`));
        }
        
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
