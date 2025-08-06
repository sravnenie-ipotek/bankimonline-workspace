const { chromium } = require('playwright');

async function testMortgageRefinanceFlow() {
    console.log('🚀 Starting mortgage refinance form testing...');
    
    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 1000,
        args: ['--start-maximized']
    });
    
    const context = await browser.newContext({ 
        viewport: { width: 1920, height: 1080 } 
    });
    const page = await context.newPage();
    
    try {
        // Navigate to refinance mortgage page
        console.log('📍 Navigating to refinance mortgage form...');
        await page.goto('http://localhost:5173/services/refinance-mortgage/1', { waitUntil: 'networkidle' });
        
        // Take initial screenshot
        await page.screenshot({ path: 'screenshots/step0_initial.png', fullPage: true });
        console.log('📸 Screenshot taken: step0_initial.png');
        
        // Wait for page to fully load
        await page.waitForTimeout(3000);
        
        console.log('✅ Step 0: Successfully navigated to refinance mortgage form');
        
        // STEP 1: Fill out mortgage calculator
        console.log('\n🏠 STEP 1: Filling out mortgage calculator...');
        
        // Check if property value and down payment are already filled (they should be)
        console.log('💰 Property value appears to be set to 1,000,000 ₪');
        console.log('💵 Down payment appears to be set to 200,000 ₪');
        
        // Look for all interactive elements that might be dropdowns
        const dropdownSelectors = [
            'input[readonly][placeholder*="בחר"]',  // Readonly inputs with "choose" placeholder
            'div[role="button"][aria-expanded="false"]', // MUI Select components
            '.MuiSelect-root',
            'select',
            '[role="combobox"]'
        ];
        
        let allDropdowns = [];
        for (const selector of dropdownSelectors) {
            const elements = await page.locator(selector).all();
            allDropdowns = allDropdowns.concat(elements);
        }
        
        console.log(`🔍 Found ${allDropdowns.length} dropdown elements`);
        
        // Fill dropdowns systematically
        for (let i = 0; i < allDropdowns.length; i++) {
            try {
                const dropdown = allDropdowns[i];
                const isVisible = await dropdown.isVisible();
                
                if (isVisible) {
                    // Get placeholder or aria-label to understand what this dropdown is for
                    const placeholder = await dropdown.getAttribute('placeholder') || '';
                    const ariaLabel = await dropdown.getAttribute('aria-label') || '';
                    const name = await dropdown.getAttribute('name') || '';
                    
                    console.log(`🎯 Dropdown ${i + 1}: "${placeholder || ariaLabel || name}"`);
                    
                    // Click to open dropdown
                    await dropdown.click();
                    await page.waitForTimeout(1000);
                    
                    // Look for dropdown options with multiple selectors
                    const optionSelectors = [
                        '[role="option"]',
                        '.MuiMenuItem-root', 
                        'option',
                        '.dropdown-option',
                        '.select-option'
                    ];
                    
                    let options = [];
                    for (const optionSelector of optionSelectors) {
                        const elements = await page.locator(optionSelector).all();
                        if (elements.length > 0) {
                            options = elements;
                            console.log(`✅ Found ${options.length} options with selector: ${optionSelector}`);
                            break;
                        }
                    }
                    
                    if (options.length > 1) {
                        // Select the first real option (skip placeholder)
                        await options[1].click();
                        console.log(`✅ Selected option in dropdown ${i + 1}`);
                        await page.waitForTimeout(500);
                    } else if (options.length === 1) {
                        // If only one option, select it
                        await options[0].click();
                        console.log(`✅ Selected single option in dropdown ${i + 1}`);
                        await page.waitForTimeout(500);
                    } else {
                        console.log(`⚠️ No options found for dropdown ${i + 1}`);
                        // Try to close dropdown by clicking elsewhere
                        await page.click('body');
                    }
                }
            } catch (error) {
                console.log(`⚠️ Could not interact with dropdown ${i + 1}:`, error.message);
                // Try to close any open dropdown
                try {
                    await page.press('Escape');
                } catch (e) {
                    // Ignore
                }
            }
        }
        
        // Take screenshot after filling step 1
        await page.screenshot({ path: 'screenshots/step1_filled.png', fullPage: true });
        console.log('📸 Screenshot taken: step1_filled.png');
        
        // Look for "Next" button (הבא in Hebrew)
        const nextButton1 = await page.locator('button:has-text("הבא"), button:has-text("Next"), button[type="submit"], .next-button, .step-next').first();
        
        if (await nextButton1.isVisible()) {
            const isEnabled = await nextButton1.isEnabled();
            console.log(`🔘 Next button enabled: ${isEnabled}`);
            
            if (isEnabled) {
                await nextButton1.click();
                console.log('➡️ Clicked Next button for Step 1');
                await page.waitForTimeout(2000);
            } else {
                console.log('❌ Next button is disabled - checking for validation errors...');
                
                // Look for validation errors
                const errors = await page.locator('.error, .invalid, .MuiFormHelperText-error, [color="error"]').all();
                for (const error of errors) {
                    if (await error.isVisible()) {
                        const errorText = await error.textContent();
                        console.log('🚨 Validation error found:', errorText);
                    }
                }
            }
        }
        
        console.log('✅ Step 1 completed');
        
        // STEP 2: Personal information
        console.log('\n👤 STEP 2: Personal information...');
        
        // Take screenshot of step 2
        await page.screenshot({ path: 'screenshots/step2_initial.png', fullPage: true });
        console.log('📸 Screenshot taken: step2_initial.png');
        
        // Fill personal information fields
        const personalFields = await page.locator('input[type="text"], input[type="email"], input[type="tel"]').all();
        
        for (let i = 0; i < personalFields.length; i++) {
            try {
                const field = personalFields[i];
                const isVisible = await field.isVisible();
                const placeholder = await field.getAttribute('placeholder') || '';
                const name = await field.getAttribute('name') || '';
                
                if (isVisible && !await field.inputValue()) {
                    // Fill based on field type/name
                    if (placeholder.includes('שם') || name.includes('name')) {
                        await field.fill('יוחנן ישראלי');
                        console.log(`✏️ Filled name field: ${name || placeholder}`);
                    } else if (placeholder.includes('אימייל') || name.includes('email')) {
                        await field.fill('test@example.com');
                        console.log(`✏️ Filled email field: ${name || placeholder}`);
                    } else if (placeholder.includes('טלפון') || name.includes('phone')) {
                        await field.fill('0544123456');
                        console.log(`✏️ Filled phone field: ${name || placeholder}`);
                    } else {
                        await field.fill('מידע לדוגמה');
                        console.log(`✏️ Filled generic field: ${name || placeholder}`);
                    }
                }
            } catch (error) {
                console.log(`⚠️ Could not fill field ${i + 1}:`, error.message);
            }
        }
        
        // Handle date fields
        const dateFields = await page.locator('input[type="date"]').all();
        for (const dateField of dateFields) {
            if (await dateField.isVisible() && !await dateField.inputValue()) {
                await dateField.fill('1990-01-01');
                console.log('📅 Filled date field');
            }
        }
        
        // Fill any remaining dropdowns in step 2
        const step2Dropdowns = await page.locator('select, [role="combobox"], .MuiSelect-root').all();
        for (let i = 0; i < step2Dropdowns.length; i++) {
            try {
                const dropdown = step2Dropdowns[i];
                if (await dropdown.isVisible()) {
                    await dropdown.click();
                    await page.waitForTimeout(500);
                    
                    const options = await page.locator('[role="option"], option, .MuiMenuItem-root').all();
                    if (options.length > 1) {
                        await options[1].click();
                        console.log(`✅ Selected option in step 2 dropdown ${i + 1}`);
                    }
                }
            } catch (error) {
                console.log(`⚠️ Could not interact with step 2 dropdown ${i + 1}`);
            }
        }
        
        // Take screenshot after filling step 2
        await page.screenshot({ path: 'screenshots/step2_filled.png', fullPage: true });
        console.log('📸 Screenshot taken: step2_filled.png');
        
        // Click next for step 2
        const nextButton2 = await page.locator('button:has-text("הבא"), button:has-text("Next"), button[type="submit"], .next-button, .step-next').first();
        
        if (await nextButton2.isVisible() && await nextButton2.isEnabled()) {
            await nextButton2.click();
            console.log('➡️ Clicked Next button for Step 2');
            await page.waitForTimeout(3000);
        }
        
        console.log('✅ Step 2 completed');
        
        // STEP 3: Income information - THE CRITICAL STEP
        console.log('\n💰 STEP 3: Income information (CRITICAL TEST)...');
        
        // Wait for income form to load
        await page.waitForTimeout(2000);
        
        // Take screenshot of step 3 initial state
        await page.screenshot({ path: 'screenshots/step3_initial.png', fullPage: true });
        console.log('📸 Screenshot taken: step3_initial.png');
        
        // Listen for console logs to catch MainSourceOfIncome debug logs
        page.on('console', msg => {
            if (msg.text().includes('MainSourceOfIncome') || msg.text().includes('debug')) {
                console.log('🔍 Console log:', msg.text());
            }
        });
        
        // Look for main source of income dropdown specifically
        console.log('🔍 Looking for main source of income dropdown...');
        
        const incomeDropdownSelectors = [
            '[data-testid*="income"]',
            'select[name*="income"]',
            '[placeholder*="הכנסה"]',
            '[label*="הכנסה"]',
            '.income-select',
            '.main-income',
            'select[name*="mainIncome"]',
            '[name*="source"]'
        ];
        
        let incomeDropdown = null;
        for (const selector of incomeDropdownSelectors) {
            const elements = await page.locator(selector).all();
            if (elements.length > 0) {
                incomeDropdown = elements[0];
                console.log(`✅ Found income dropdown with selector: ${selector}`);
                break;
            }
        }
        
        if (!incomeDropdown) {
            // Try to find any dropdown that might be the income dropdown
            const allDropdowns = await page.locator('select, [role="combobox"], .MuiSelect-root').all();
            console.log(`🔍 Found ${allDropdowns.length} total dropdowns in step 3`);
            
            for (let i = 0; i < allDropdowns.length; i++) {
                const dropdown = allDropdowns[i];
                const ariaLabel = await dropdown.getAttribute('aria-label') || '';
                const name = await dropdown.getAttribute('name') || '';
                const id = await dropdown.getAttribute('id') || '';
                
                console.log(`Dropdown ${i + 1}: name="${name}", id="${id}", aria-label="${ariaLabel}"`);
                
                // If this looks like an income dropdown, use it
                if (ariaLabel.includes('הכנסה') || name.includes('income') || name.includes('source')) {
                    incomeDropdown = dropdown;
                    console.log(`✅ Found potential income dropdown: ${name || id || ariaLabel}`);
                    break;
                }
            }
            
            // If still not found, use the first dropdown as fallback
            if (!incomeDropdown && allDropdowns.length > 0) {
                incomeDropdown = allDropdowns[0];
                console.log('⚠️ Using first dropdown as fallback for income selection');
            }
        }
        
        if (incomeDropdown) {
            console.log('🎯 Testing income dropdown validation...');
            
            // Test the validation behavior
            console.log('1️⃣ Initial state - checking if dropdown is empty...');
            await page.screenshot({ path: 'screenshots/step3_before_income_selection.png', fullPage: true });
            
            // Click the dropdown to open it
            await incomeDropdown.click();
            await page.waitForTimeout(1000);
            
            console.log('2️⃣ Dropdown opened - looking for options...');
            await page.screenshot({ path: 'screenshots/step3_dropdown_opened.png', fullPage: true });
            
            // Look for dropdown options
            const optionSelectors = [
                '[role="option"]',
                'option',
                '.MuiMenuItem-root',
                '.dropdown-option',
                '.select-option'
            ];
            
            let options = [];
            for (const selector of optionSelectors) {
                const elements = await page.locator(selector).all();
                if (elements.length > 0) {
                    options = elements;
                    console.log(`✅ Found ${options.length} options with selector: ${selector}`);
                    break;
                }
            }
            
            if (options.length > 1) {
                console.log('3️⃣ Selecting income option...');
                
                // Select the first real option (skip placeholder)
                await options[1].click();
                console.log('✅ Selected income option');
                await page.waitForTimeout(1000);
                
                // Take screenshot after selection
                await page.screenshot({ path: 'screenshots/step3_income_selected.png', fullPage: true });
                console.log('📸 Screenshot taken: step3_income_selected.png');
                
                // Check for validation errors after selection
                console.log('4️⃣ Checking for validation errors after selection...');
                
                const errorSelectors = [
                    '.error',
                    '.invalid',
                    '.MuiFormHelperText-error',
                    '[color="error"]',
                    '.validation-error',
                    '.field-error'
                ];
                
                let hasValidationErrors = false;
                for (const selector of errorSelectors) {
                    const errors = await page.locator(selector).all();
                    for (const error of errors) {
                        if (await error.isVisible()) {
                            const errorText = await error.textContent();
                            console.log('🚨 VALIDATION ERROR FOUND:', errorText);
                            hasValidationErrors = true;
                        }
                    }
                }
                
                if (!hasValidationErrors) {
                    console.log('✅ No validation errors found after income selection');
                } else {
                    console.log('❌ RACE CONDITION DETECTED: Validation errors persist after valid selection');
                }
                
                // Check if form submission button is enabled
                const submitButton = await page.locator('button:has-text("הבא"), button:has-text("Next"), button[type="submit"], .next-button, .step-next').first();
                
                if (await submitButton.isVisible()) {
                    const isEnabled = await submitButton.isEnabled();
                    console.log(`🔘 Form submission button enabled: ${isEnabled}`);
                    
                    if (!isEnabled) {
                        console.log('❌ CRITICAL ISSUE: Button remains disabled despite valid income selection');
                        
                        // Try to identify which field is causing the issue
                        console.log('🔍 Analyzing all form fields for validation state...');
                        
                        const allInputs = await page.locator('input, select, textarea').all();
                        for (let i = 0; i < allInputs.length; i++) {
                            const input = allInputs[i];
                            const name = await input.getAttribute('name') || `input_${i}`;
                            const value = await input.inputValue().catch(() => 'N/A');
                            const required = await input.getAttribute('required') !== null;
                            const ariaInvalid = await input.getAttribute('aria-invalid') === 'true';
                            
                            if (required && (!value || value === '')) {
                                console.log(`❌ REQUIRED FIELD EMPTY: ${name} = "${value}"`);
                            } else if (ariaInvalid) {
                                console.log(`❌ INVALID FIELD: ${name} = "${value}" (aria-invalid=true)`);
                            } else if (required) {
                                console.log(`✅ Required field filled: ${name} = "${value}"`);
                            }
                        }
                    } else {
                        console.log('✅ Form submission button is enabled - no race condition detected');
                    }
                } else {
                    console.log('⚠️ Could not find form submission button');
                }
                
            } else {
                console.log('❌ No options found in income dropdown');
            }
        } else {
            console.log('❌ Could not find income dropdown');
        }
        
        // Take final screenshot of step 3
        await page.screenshot({ path: 'screenshots/step3_final.png', fullPage: true });
        console.log('📸 Final screenshot taken: step3_final.png');
        
        console.log('\n🏁 Test completed! Check screenshots for visual evidence.');
        console.log('Screenshots saved in: screenshots/');
        console.log('- step0_initial.png');
        console.log('- step1_filled.png'); 
        console.log('- step2_initial.png');
        console.log('- step2_filled.png');
        console.log('- step3_initial.png');
        console.log('- step3_before_income_selection.png');
        console.log('- step3_dropdown_opened.png');
        console.log('- step3_income_selected.png');
        console.log('- step3_final.png');
        
        // Keep browser open for manual inspection
        console.log('\n⏸️ Keeping browser open for manual inspection...');
        console.log('Press Ctrl+C to close browser and exit');
        
        // Wait indefinitely
        await new Promise(() => {});
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({ path: 'screenshots/error_state.png', fullPage: true });
    } finally {
        // Browser will close when script is terminated
    }
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
}

// Run the test
testMortgageRefinanceFlow().catch(console.error);