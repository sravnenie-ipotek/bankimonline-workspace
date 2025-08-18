const fs = require('fs');
const path = require('path');

// Comprehensive dropdown pattern analysis
const dropdownPatterns = {
    customDropdown: {
        components: [],
        selectors: [
            '.dropdown-wrapper',
            '[class*="dropdown-wrapper"]',
            '.dropdown',
            '[class*="dropdown"]:not([class*="dropdown-toggle"])'
        ],
        dataTestIds: [],
        count: 0
    },
    reactDropdownSelect: {
        components: [],
        selectors: [
            '.react-dropdown-select',
            '[class*="react-dropdown-select"]'
        ],
        count: 0
    },
    muiSelect: {
        components: [],
        selectors: [
            '.MuiSelect-root',
            '.MuiAutocomplete-root',
            '[class*="MuiSelect"]',
            '[class*="MuiAutocomplete"]'
        ],
        count: 0
    },
    reactSelect: {
        components: [],
        selectors: [
            '.react-select__control',
            '[class*="react-select"]'
        ],
        count: 0
    }
};

// Function to recursively search files
function searchFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
            searchFiles(filePath, fileList);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// Analyze dropdown usage
function analyzeDropdowns() {
    console.log('🔍 COMPREHENSIVE DROPDOWN ANALYSIS\n');
    console.log('=' .repeat(80));
    
    const srcPath = '/Users/michaelmishayev/Projects/bankDev2_standalone/mainapp/src';
    const files = searchFiles(srcPath);
    
    console.log(`\n📊 Analyzing ${files.length} TypeScript/React files...\n`);
    
    const dropdownUsage = {
        byComponent: {},
        byPage: {},
        byType: {
            DropdownMenu: [],
            reactDropdownSelect: [],
            muiSelect: [],
            reactSelect: [],
            customSelect: []
        }
    };
    
    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = file.replace(srcPath, '');
        
        // Check for DropdownMenu usage
        if (content.includes('DropdownMenu') || content.includes('<DropdownMenu')) {
            dropdownUsage.byType.DropdownMenu.push(relativePath);
            
            // Extract data-testid attributes
            const testIdMatches = content.match(/data-?[Tt]est[Ii]d=["']([^"']+)["']/g) || [];
            testIdMatches.forEach(match => {
                const testId = match.match(/data-?[Tt]est[Ii]d=["']([^"']+)["']/)[1];
                if (testId.includes('dropdown')) {
                    dropdownPatterns.customDropdown.dataTestIds.push(testId);
                }
            });
        }
        
        // Check for react-dropdown-select
        if (content.includes('react-dropdown-select')) {
            dropdownUsage.byType.reactDropdownSelect.push(relativePath);
        }
        
        // Check for MUI components
        if (content.includes('@mui/material') || content.includes('MuiSelect') || content.includes('Autocomplete')) {
            dropdownUsage.byType.muiSelect.push(relativePath);
        }
        
        // Check for react-select
        if (content.includes('react-select')) {
            dropdownUsage.byType.reactSelect.push(relativePath);
        }
        
        // Check for custom select implementations
        if (content.includes('CustomSelect') || content.includes('custom-select')) {
            dropdownUsage.byType.customSelect.push(relativePath);
        }
        
        // Categorize by page/feature
        if (relativePath.includes('/pages/')) {
            const pageName = relativePath.split('/pages/')[1].split('/')[0];
            if (!dropdownUsage.byPage[pageName]) {
                dropdownUsage.byPage[pageName] = [];
            }
            
            if (content.includes('Dropdown') || content.includes('Select')) {
                dropdownUsage.byPage[pageName].push(relativePath);
            }
        }
    });
    
    // Display results
    console.log('📋 DROPDOWN COMPONENT USAGE BY TYPE:');
    console.log('-' .repeat(80));
    
    Object.entries(dropdownUsage.byType).forEach(([type, files]) => {
        console.log(`\n${type}: ${files.length} files`);
        if (files.length > 0 && files.length <= 10) {
            files.slice(0, 5).forEach(f => console.log(`  - ${f}`));
            if (files.length > 5) console.log(`  ... and ${files.length - 5} more`);
        }
    });
    
    console.log('\n📱 DROPDOWN USAGE BY PAGE/FEATURE:');
    console.log('-' .repeat(80));
    
    Object.entries(dropdownUsage.byPage).forEach(([page, files]) => {
        if (files.length > 0) {
            console.log(`\n${page}: ${files.length} dropdown files`);
            files.slice(0, 3).forEach(f => console.log(`  - ${f.split('/').pop()}`));
        }
    });
    
    // Extract unique test IDs
    const uniqueTestIds = [...new Set(dropdownPatterns.customDropdown.dataTestIds)];
    
    console.log('\n🎯 DATA-TESTID PATTERNS FOUND:');
    console.log('-' .repeat(80));
    uniqueTestIds.forEach(id => console.log(`  - ${id}`));
    
    // Generate comprehensive selector list
    const allSelectors = [
        ...dropdownPatterns.customDropdown.selectors,
        ...dropdownPatterns.reactDropdownSelect.selectors,
        ...dropdownPatterns.muiSelect.selectors,
        ...dropdownPatterns.reactSelect.selectors,
        // Add data-testid selectors
        ...uniqueTestIds.map(id => `[data-testid="${id}"]`),
        // Add generic patterns
        '[data-testid*="dropdown"]',
        '[role="combobox"]',
        '[role="listbox"]',
        '[role="button"][aria-haspopup="listbox"]',
        '.dropdown-label',
        '.dropdown-value',
        '.dropdown-item',
        '[class*="select"][class*="control"]',
        '[class*="select"][class*="value"]'
    ];
    
    console.log('\n🔧 COMPREHENSIVE CYPRESS SELECTORS:');
    console.log('-' .repeat(80));
    console.log('Use these selectors in Cypress tests:');
    console.log(JSON.stringify(allSelectors, null, 2));
    
    // Save analysis to file
    const analysis = {
        timestamp: new Date().toISOString(),
        filesAnalyzed: files.length,
        dropdownUsage,
        selectors: allSelectors,
        testIds: uniqueTestIds,
        summary: {
            customDropdownMenu: dropdownUsage.byType.DropdownMenu.length,
            reactDropdownSelect: dropdownUsage.byType.reactDropdownSelect.length,
            muiSelect: dropdownUsage.byType.muiSelect.length,
            reactSelect: dropdownUsage.byType.reactSelect.length,
            customSelect: dropdownUsage.byType.customSelect.length
        }
    };
    
    fs.writeFileSync('dropdown-analysis.json', JSON.stringify(analysis, null, 2));
    
    console.log('\n✅ Analysis complete! Saved to dropdown-analysis.json');
    
    return analysis;
}

analyzeDropdowns();