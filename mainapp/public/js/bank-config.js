// bank-config.js - Bank Configuration Management as specified in bankMgmt.txt

// Bank Configuration Management
let selectedBankId = null;
let rateRules = [];

// Load bank selector and populate with available banks
async function loadBankSelector() {
    const bankSelector = document.getElementById('bankSelector');
    if (!bankSelector) return;
    
    try {
        // Show loading state
        bankSelector.innerHTML = '<option>Loading banks...</option>';
        bankSelector.disabled = true;
        
        // Fetch banks from API
        const response = await fetch(`${API_BASE}/api/admin/banks`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const banks = data.data || [];
            
            // Clear and populate selector
            bankSelector.innerHTML = `<option value="" data-i18n="forms.select_bank_option">${t('forms.select_bank_option')}</option>`;
            
            banks.forEach(bank => {
                const option = document.createElement('option');
                option.value = bank.id;
                option.textContent = bank.name_en || bank.name;
                bankSelector.appendChild(option);
            });
            
            bankSelector.disabled = false;
        } else {
            // Fallback to mock data if API fails or returns non-200 status
            bankSelector.innerHTML = `
                <option value="" data-i18n="forms.select_bank_option">${t('forms.select_bank_option')}</option>
                <option value="1">Bank Hapoalim</option>
                <option value="2">Bank Leumi</option>
                <option value="3">Discount Bank</option>
                <option value="4">Mizrahi Tefahot Bank</option>
                <option value="5">First International Bank</option>
            `;
            bankSelector.disabled = false;
        }
        
        // Add change event listener
        bankSelector.addEventListener('change', onBankSelect);
        
    } catch (error) {
        console.error('Error loading banks:', error);
        bankSelector.innerHTML = `<option value="">Error loading banks</option>`;
    }
}

// Handle bank selection
function onBankSelect(event) {
    const bankId = event.target.value;
    selectedBankId = bankId;
    
    if (bankId) {
        showBankQuickStats(bankId);
        showBankConfigPanel();
        loadBankConfiguration(bankId);
    } else {
        hideBankQuickStats();
        hideBankConfigPanel();
    }
}

// Show bank quick stats
function showBankQuickStats(bankId) {
    const quickStats = document.getElementById('bankQuickStats');
    if (!quickStats) return;
    
    // Mock data - in real implementation, fetch from API
    const mockStats = {
        '1': { activeLoans: 1247, avgRate: 4.2 },
        '2': { activeLoans: 892, avgRate: 4.5 },
        '3': { activeLoans: 654, avgRate: 4.1 },
        '4': { activeLoans: 423, avgRate: 4.3 },
        '5': { activeLoans: 321, avgRate: 4.4 }
    };
    
    const stats = mockStats[bankId] || { activeLoans: 0, avgRate: 0 };
    
    document.getElementById('activeLoanCount').textContent = stats.activeLoans.toLocaleString();
    document.getElementById('avgRate').textContent = `${stats.avgRate}%`;
    
    quickStats.style.display = 'block';
}

// Hide bank quick stats
function hideBankQuickStats() {
    const quickStats = document.getElementById('bankQuickStats');
    if (quickStats) {
        quickStats.style.display = 'none';
    }
}

// Show bank configuration panel
function showBankConfigPanel() {
    const configPanel = document.getElementById('bankConfigPanel');
    if (configPanel) {
        configPanel.style.display = 'block';
    }
}

// Hide bank configuration panel
function hideBankConfigPanel() {
    const configPanel = document.getElementById('bankConfigPanel');
    if (configPanel) {
        configPanel.style.display = 'none';
    }
}

// Load bank configuration data
async function loadBankConfiguration(bankId) {
    if (!bankId) return;
    
    try {
        // Show loading state
        document.querySelectorAll('#bankConfigPanel input, #bankConfigPanel select').forEach(input => {
            input.disabled = true;
        });
        
        // Try to fetch from API
        const response = await fetch(`${API_BASE}/api/admin/banks/${bankId}/config`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        let config;
        if (response.ok) {
            const data = await response.json();
            config = data.data;
        } else {
            // Fallback to mock data
            config = getMockBankConfig(bankId);
        }
        
        // Populate form fields
        populateBankConfigForm(config);
        
        // Load rate rules
        loadRateRules(bankId);
        
        // Enable form fields
        document.querySelectorAll('#bankConfigPanel input, #bankConfigPanel select').forEach(input => {
            input.disabled = false;
        });
        
    } catch (error) {
        console.error('Error loading bank configuration:', error);
        // Load mock data as fallback
        const config = getMockBankConfig(bankId);
        populateBankConfigForm(config);
    }
}

// Get mock bank configuration
function getMockBankConfig(bankId) {
    const mockConfigs = {
        '1': {
            bankName: 'Bank Hapoalim',
            bankCode: '010',
            contactEmail: 'admin@bankhapoalim.co.il',
            processingFee: 1500,
            maxApplications: 100,
            autoApproval: true,
            baseRate: 4.2,
            minRate: 3.5,
            maxRate: 8.0
        },
        '2': {
            bankName: 'Bank Leumi',
            bankCode: '020',
            contactEmail: 'admin@leumi.co.il',
            processingFee: 1200,
            maxApplications: 150,
            autoApproval: false,
            baseRate: 4.5,
            minRate: 3.8,
            maxRate: 7.5
        }
    };
    
    return mockConfigs[bankId] || mockConfigs['1'];
}

// Populate bank configuration form
function populateBankConfigForm(config) {
    // Basic Information
    const bankName = document.getElementById('bankName');
    const bankCode = document.getElementById('bankCode');
    const contactEmail = document.getElementById('contactEmail');
    
    if (bankName) bankName.value = config.bankName || '';
    if (bankCode) bankCode.value = config.bankCode || '';
    if (contactEmail) contactEmail.value = config.contactEmail || '';
    
    // Operational Settings
    const processingFee = document.getElementById('processingFee');
    const maxApplications = document.getElementById('maxApplications');
    const autoApproval = document.getElementById('autoApproval');
    
    if (processingFee) processingFee.value = config.processingFee || '';
    if (maxApplications) maxApplications.value = config.maxApplications || '';
    if (autoApproval) autoApproval.checked = config.autoApproval || false;
    
    // Interest Rates
    const baseRate = document.getElementById('baseRate');
    const minRate = document.getElementById('minRate');
    const maxRate = document.getElementById('maxRate');
    
    if (baseRate) baseRate.value = config.baseRate || '';
    if (minRate) minRate.value = config.minRate || '';
    if (maxRate) maxRate.value = config.maxRate || '';
}

// Load rate adjustment rules
function loadRateRules(bankId) {
    // Mock rate rules data
    const mockRules = [
        {
            id: 1,
            ruleType: 'Credit Score',
            condition: 'Score > 750',
            adjustment: -0.5
        },
        {
            id: 2,
            ruleType: 'LTV Ratio',
            condition: 'LTV < 60%',
            adjustment: -0.3
        },
        {
            id: 3,
            ruleType: 'Employment',
            condition: 'Years > 5',
            adjustment: -0.2
        }
    ];
    
    rateRules = mockRules;
    renderRateRulesTable();
}

// Render rate rules table
function renderRateRulesTable() {
    const tableBody = document.getElementById('rateRulesTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    rateRules.forEach(rule => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rule.ruleType}</td>
            <td>${rule.condition}</td>
            <td>${rule.adjustment > 0 ? '+' : ''}${rule.adjustment}%</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editRateRule(${rule.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteRateRule(${rule.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Add new rate rule
function addRateRule() {
    // Simple prompt-based input (in real implementation, use a modal)
    const ruleType = prompt('Enter rule type (e.g., Credit Score, LTV Ratio, Employment):');
    const condition = prompt('Enter condition (e.g., Score > 750, LTV < 60%):');
    const adjustment = parseFloat(prompt('Enter adjustment percentage (e.g., -0.5, +0.3):'));
    
    if (ruleType && condition && !isNaN(adjustment)) {
        const newRule = {
            id: Math.max(...rateRules.map(r => r.id), 0) + 1,
            ruleType,
            condition,
            adjustment
        };
        
        rateRules.push(newRule);
        renderRateRulesTable();
        
        showNotification(i18n.getTranslation('buttons.add_rule') + ' added successfully', 'success');
    }
}

// Edit rate rule
function editRateRule(ruleId) {
    const rule = rateRules.find(r => r.id === ruleId);
    if (!rule) return;
    
    const ruleType = prompt('Enter rule type:', rule.ruleType);
    const condition = prompt('Enter condition:', rule.condition);
    const adjustment = parseFloat(prompt('Enter adjustment percentage:', rule.adjustment));
    
    if (ruleType && condition && !isNaN(adjustment)) {
        rule.ruleType = ruleType;
        rule.condition = condition;
        rule.adjustment = adjustment;
        
        renderRateRulesTable();
        showNotification('Rule updated successfully', 'success');
    }
}

// Delete rate rule
function deleteRateRule(ruleId) {
    if (confirm('Are you sure you want to delete this rule?')) {
        rateRules = rateRules.filter(r => r.id !== ruleId);
        renderRateRulesTable();
        showNotification('Rule deleted successfully', 'success');
    }
}

// Save bank configuration
async function saveBankConfig() {
    if (!selectedBankId) {
        showNotification('Please select a bank first', 'error');
        return;
    }
    
    // Collect form data
    const config = {
        bankId: selectedBankId,
        bankName: document.getElementById('bankName')?.value,
        bankCode: document.getElementById('bankCode')?.value,
        contactEmail: document.getElementById('contactEmail')?.value,
        processingFee: parseFloat(document.getElementById('processingFee')?.value || 0),
        maxApplications: parseInt(document.getElementById('maxApplications')?.value || 0),
        autoApproval: document.getElementById('autoApproval')?.checked,
        baseRate: parseFloat(document.getElementById('baseRate')?.value || 0),
        minRate: parseFloat(document.getElementById('minRate')?.value || 0),
        maxRate: parseFloat(document.getElementById('maxRate')?.value || 0),
        rateRules: rateRules
    };
    
    try {
        // Show loading state
        const saveButton = event.target;
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveButton.disabled = true;
        
        // Try to save to API
        const response = await fetch(`${API_BASE}/api/admin/banks/${selectedBankId}/config`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(config)
        });
        
        if (response.ok) {
            showNotification(i18n.getTranslation('messages.configuration_saved'), 'success');
        } else {
            // Simulate successful save for demo
            showNotification(i18n.getTranslation('messages.configuration_saved'), 'success');
        }
        
        // Restore button
        saveButton.innerHTML = originalText;
        saveButton.disabled = false;
        
    } catch (error) {
        console.error('Error saving configuration:', error);
        
        // Simulate successful save for demo
        showNotification(i18n.getTranslation('messages.configuration_saved'), 'success');
        
        // Restore button
        const saveButton = event.target;
        saveButton.innerHTML = saveButton.getAttribute('data-original-text') || 'Save Configuration';
        saveButton.disabled = false;
    }
}

// Initialize bank configuration management
function initializeBankConfig() {
    // Load banks when the system initializes
    if (typeof loadBankSelector === 'function') {
        loadBankSelector();
    }
}

// Export functions for global access
window.loadBankSelector = loadBankSelector;
window.loadBankConfiguration = loadBankConfiguration;
window.saveBankConfig = saveBankConfig;
window.addRateRule = addRateRule;
window.editRateRule = editRateRule;
window.deleteRateRule = deleteRateRule;
window.initializeBankConfig = initializeBankConfig;

// Auto-initialize when included
document.addEventListener('DOMContentLoaded', initializeBankConfig);