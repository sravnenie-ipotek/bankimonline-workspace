// role-manager.js - Role-Based UI System as specified in bankMgmt.txt

// Role-based UI visibility and permissions
function setupUIForRole(role, bankId) {
    // Hide all role-specific main tabs first - using correct IDs from admin.html
    const bankOpsTab = document.getElementById('tab-bank-operations');
    const userMgmtTab = document.getElementById('tab-user-management');
    const riskComplianceTab = document.getElementById('tab-risk-compliance');
    const systemSettingsTab = document.getElementById('tab-system-settings');
    const applicationsTab = document.getElementById('tab-applications');
    
    // Hide all tabs initially
    if (bankOpsTab) bankOpsTab.style.display = 'none';
    if (userMgmtTab) userMgmtTab.style.display = 'none';
    if (riskComplianceTab) riskComplianceTab.style.display = 'none';
    if (systemSettingsTab) systemSettingsTab.style.display = 'none';
    if (applicationsTab) applicationsTab.style.display = 'none';
    
    // Hide sub-tabs
    const bankMgmtSubTab = document.getElementById('bankMgmtSubTab');
    if (bankMgmtSubTab) {
        bankMgmtSubTab.style.display = 'none';
    }
    
    switch(role) {
        case 'business_admin':
            // Show all tabs for business admin
            if (bankOpsTab) bankOpsTab.style.display = 'block';
            if (userMgmtTab) userMgmtTab.style.display = 'block';
            if (riskComplianceTab) riskComplianceTab.style.display = 'block';
            if (systemSettingsTab) systemSettingsTab.style.display = 'block';
            if (applicationsTab) applicationsTab.style.display = 'block';
            if (bankMgmtSubTab) {
                bankMgmtSubTab.style.display = 'block';
            }
            break;
            
        case 'bank_admin':
            // Show only bank operations for their bank
            if (bankOpsTab) bankOpsTab.style.display = 'block';
            if (applicationsTab) applicationsTab.style.display = 'block';
            if (bankMgmtSubTab) {
                bankMgmtSubTab.style.display = 'block';
            }
            
            // Hide banking standards sub-tab
            const bankingStandardsTab = document.querySelector('#banking-standards-tab');
            if (bankingStandardsTab && bankingStandardsTab.parentElement) {
                bankingStandardsTab.parentElement.style.display = 'none';
            }
            
            // Lock bank selector to their bank
            lockBankSelector(bankId);
            break;
            
        case 'risk_manager':
            // Show only risk & compliance
            if (riskComplianceTab) riskComplianceTab.style.display = 'block';
            if (applicationsTab) applicationsTab.style.display = 'block';
            
            // Make banking standards read-only
            makeCalculationsReadOnly();
            break;
            
        case 'compliance':
            // Show only compliance sub-tabs
            if (riskComplianceTab) riskComplianceTab.style.display = 'block';
            if (applicationsTab) applicationsTab.style.display = 'block';
            // Hide risk management sub-tabs, show only compliance
            hideRiskManagementSubTabs();
            break;
            
        case 'system_admin':
            // Show system settings and applications
            if (systemSettingsTab) systemSettingsTab.style.display = 'block';
            if (applicationsTab) applicationsTab.style.display = 'block';
            if (userMgmtTab) userMgmtTab.style.display = 'block';
            break;
    }
}

// Lock bank selector to specific bank (for bank_admin role)
function lockBankSelector(bankId) {
    const bankSelector = document.getElementById('bankSelector');
    if (bankSelector && bankId) {
        // Set the bank and disable the selector
        bankSelector.value = bankId;
        bankSelector.disabled = true;
        bankSelector.style.backgroundColor = '#f3f4f6';
        bankSelector.style.cursor = 'not-allowed';
        
        // Add tooltip explaining the lock
        bankSelector.title = 'Bank selection is locked for your role';
        
        // Automatically load the bank configuration
        if (typeof loadBankConfiguration === 'function') {
            loadBankConfiguration(bankId);
        }
    }
}

// Make calculations read-only (for risk_manager role)
function makeCalculationsReadOnly() {
    // Find all banking standards form inputs
    const standardsInputs = document.querySelectorAll('#banking-standards input, #banking-standards select, #banking-standards textarea');
    standardsInputs.forEach(input => {
        input.readOnly = true;
        input.disabled = true;
        input.style.backgroundColor = '#f9fafb';
        input.style.cursor = 'not-allowed';
    });
    
    // Hide save buttons in standards section
    const saveButtons = document.querySelectorAll('#banking-standards button[type="submit"], #banking-standards .btn-primary');
    saveButtons.forEach(button => {
        button.style.display = 'none';
    });
    
    // Add read-only indicator
    const standardsSection = document.getElementById('banking-standards');
    if (standardsSection) {
        const indicator = document.createElement('div');
        indicator.className = 'alert alert-info';
        indicator.innerHTML = '<i class="fas fa-info-circle"></i> Standards are read-only for your role';
        standardsSection.insertBefore(indicator, standardsSection.firstChild);
    }
}

// Hide risk management sub-tabs (for compliance role)
function hideRiskManagementSubTabs() {
    const riskMgmtSubTab = document.getElementById('risk-management-subtab');
    const riskAnalyticsSubTab = document.getElementById('risk-analytics-subtab');
    
    if (riskMgmtSubTab) {
        riskMgmtSubTab.style.display = 'none';
    }
    if (riskAnalyticsSubTab) {
        riskAnalyticsSubTab.style.display = 'none';
    }
    
    // Automatically show compliance tab
    const complianceSubTab = document.getElementById('compliance-subtab');
    if (complianceSubTab) {
        complianceSubTab.click();
    }
}

// Get user permissions based on role
function getUserPermissions(role) {
    const permissions = {
        business_admin: {
            canManageBanks: true,
            canManageUsers: true,
            canViewRisk: true,
            canManageCompliance: true,
            canConfigureSystem: true,
            canAccessAllBanks: true
        },
        bank_admin: {
            canManageBanks: true,
            canManageUsers: false,
            canViewRisk: false,
            canManageCompliance: false,
            canConfigureSystem: false,
            canAccessAllBanks: false,
            bankSpecific: true
        },
        risk_manager: {
            canManageBanks: false,
            canManageUsers: false,
            canViewRisk: true,
            canManageCompliance: true,
            canConfigureSystem: false,
            canAccessAllBanks: true,
            readOnlyStandards: true
        },
        compliance: {
            canManageBanks: false,
            canManageUsers: false,
            canViewRisk: false,
            canManageCompliance: true,
            canConfigureSystem: false,
            canAccessAllBanks: true
        }
    };
    
    return permissions[role] || permissions.compliance;
}

// Check if user has specific permission
function hasPermission(permission) {
    const userRole = localStorage.getItem('userRole') || 'business_admin';
    const permissions = getUserPermissions(userRole);
    return permissions[permission] || false;
}

// Show/hide elements based on permissions
function applyPermissionBasedVisibility() {
    const userRole = localStorage.getItem('userRole') || 'business_admin';
    const permissions = getUserPermissions(userRole);
    
    // Apply visibility rules
    document.querySelectorAll('[data-permission]').forEach(element => {
        const requiredPermission = element.getAttribute('data-permission');
        const hasAccess = permissions[requiredPermission];
        
        if (hasAccess) {
            element.style.display = '';
            element.removeAttribute('disabled');
        } else {
            element.style.display = 'none';
            element.setAttribute('disabled', 'true');
        }
    });
    
    // Apply read-only rules
    if (permissions.readOnlyStandards) {
        makeCalculationsReadOnly();
    }
}

// Add user role indicator to UI
function addRoleIndicator() {
    const userRole = localStorage.getItem('userRole') || 'business_admin';
    const userName = localStorage.getItem('userName') || 'Admin';
    
    const roleNames = {
        business_admin: 'Business Administrator',
        bank_admin: 'Bank Administrator',
        risk_manager: 'Risk Manager',
        compliance: 'Compliance Officer'
    };
    
    // Create role indicator element
    const roleIndicator = document.createElement('div');
    roleIndicator.className = 'role-indicator';
    roleIndicator.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-user-circle me-2"></i>
            <div>
                <div class="fw-bold">${userName}</div>
                <div class="small text-muted">${roleNames[userRole]}</div>
            </div>
        </div>
    `;
    roleIndicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: white;
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        min-width: 200px;
    `;
    
    document.body.appendChild(roleIndicator);
}

// Initialize role-based system
function initializeRoleSystem() {
    const userRole = localStorage.getItem('userRole');
    const bankId = localStorage.getItem('userBankId');
    
    if (!userRole) {
        // Set default role for testing
        localStorage.setItem('userRole', 'business_admin');
        localStorage.setItem('userName', 'System Administrator');
    }
    
    // Apply role-based UI setup
    setupUIForRole(userRole || 'business_admin', bankId);
    
    // Apply permission-based visibility
    applyPermissionBasedVisibility();
    
    // Add role indicator
    addRoleIndicator();
}

// Export functions for global access
window.setupUIForRole = setupUIForRole;
window.lockBankSelector = lockBankSelector;
window.makeCalculationsReadOnly = makeCalculationsReadOnly;
window.hasPermission = hasPermission;
window.initializeRoleSystem = initializeRoleSystem;