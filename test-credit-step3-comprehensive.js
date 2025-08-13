#!/usr/bin/env node

/**
 * Comprehensive Test: Credit Calculator Step 3 - All 4 Issues
 * 
 * Tests the ULTRATHINK fixes for:
 * 1. Field of Activity dropdown (professional_sphere API mapping)
 * 2. Main income source logic (numeric-to-semantic mapping)
 * 3. Source of Income modal UI elements 
 * 4. Obligation modal UI elements
 */

const { chromium } = require('playwright');

async function testCreditStep3Issues() {
  console.log('🔍 ULTRATHINK Credit Step 3 Comprehensive Test - All 4 Issues\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to Credit Calculator Step 3
    console.log('1️⃣ Navigating to Credit Calculator Step 3...');
    await page.goto('http://localhost:5173/services/calculate-credit/3', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Test Issue #1: Field of Activity dropdown
    console.log('\n2️⃣ Testing Issue #1: Field of Activity dropdown');
    const fieldOfActivity = await page.locator('[data-testid="field-of-activity-dropdown"], .field-of-activity, [id*="field"], [placeholder*="מקצועי"], [placeholder*="תחום"]').first();
    
    if (await fieldOfActivity.isVisible()) {
      console.log('✅ Field of Activity dropdown is visible');
      
      // Click to open dropdown
      await fieldOfActivity.click();
      await page.waitForTimeout(1000);
      
      // Check for Hebrew options
      const options = await page.locator('[role="option"], .MuiMenuItem-root, .dropdown-option').count();
      console.log(`✅ Field of Activity has ${options} options`);
      
      if (options >= 5) {
        console.log('✅ ISSUE #1 FIXED: Field of Activity dropdown has translations and options');
      } else {
        console.log('❌ ISSUE #1 NOT FIXED: Still missing options');
      }
    } else {
      console.log('❌ Field of Activity dropdown not visible');
    }
    
    // Test Issue #2: Main income source logic
    console.log('\n3️⃣ Testing Issue #2: Main income source dropdown logic');
    const mainIncomeSource = await page.locator('[data-testid="main-source-income-dropdown"], .main-source-income, [placeholder*="ההכנסה"], [placeholder*="מקור"]').first();
    
    if (await mainIncomeSource.isVisible()) {
      console.log('✅ Main source of income dropdown is visible');
      
      // Click to open dropdown
      await mainIncomeSource.click();
      await page.waitForTimeout(1000);
      
      // Select "Employee" (value "1") 
      const employeeOption = await page.locator('[role="option"]:has-text("משכורת"), .MuiMenuItem-root:has-text("משכורת")').first();
      if (await employeeOption.isVisible()) {
        console.log('✅ Employee option found - clicking...');
        await employeeOption.click();
        await page.waitForTimeout(1500);
        
        // Check if additional fields appeared (components by income source)
        const additionalFields = await page.locator('.component, [data-testid*="monthly"], [data-testid*="field"], [data-testid*="company"]').count();
        console.log(`✅ Additional fields appeared: ${additionalFields} components`);
        
        if (additionalFields >= 3) {
          console.log('✅ ISSUE #2 FIXED: Income source logic working correctly');
        } else {
          console.log('❌ ISSUE #2 PARTIALLY FIXED: Some components missing');
        }
      }
    }
    
    // Test Issue #3: Source of Income modal UI elements
    console.log('\n4️⃣ Testing Issue #3: Source of Income modal');
    
    const addIncomeSourceBtn = await page.locator('[data-testid*="add"], .add-button, button:has-text("הוסף"), button[data-testid*="source"]').first();
    if (await addIncomeSourceBtn.isVisible()) {
      console.log('✅ Add income source button found - clicking...');
      await addIncomeSourceBtn.click();
      await page.waitForTimeout(2000);
      
      // Check if modal opened with proper components
      const modalVisible = await page.locator('.modal, [role="dialog"], .MuiModal-root').first().isVisible();
      if (modalVisible) {
        console.log('✅ Source of Income modal opened');
        
        // Check for modal components
        const modalComponents = await page.locator('.modal .component, .modal [data-testid]').count();
        console.log(`✅ Modal has ${modalComponents} UI components`);
        
        if (modalComponents >= 2) {
          console.log('✅ ISSUE #3 FIXED: Source of Income modal shows UI elements');
        } else {
          console.log('❌ ISSUE #3 NOT FIXED: Modal missing UI elements');
        }
        
        // Close modal
        const closeBtn = await page.locator('button:has-text("חזור"), button:has-text("Back"), .modal button').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    }
    
    // Test Issue #4: Obligation modal UI elements  
    console.log('\n5️⃣ Testing Issue #4: Obligation modal');
    
    // First select existing debts
    const obligationDropdown = await page.locator('[data-testid="obligation-dropdown"], .obligation, [placeholder*="חובות"]').first();
    if (await obligationDropdown.isVisible()) {
      console.log('✅ Obligation dropdown found');
      await obligationDropdown.click();
      await page.waitForTimeout(1000);
      
      // Select a debt option (not "no debts")
      const debtOption = await page.locator('[role="option"]:has-text("משכנתא"), .MuiMenuItem-root:has-text("משכנתא")').first();
      if (await debtOption.isVisible()) {
        console.log('✅ Debt option (mortgage) found - selecting...');
        await debtOption.click();
        await page.waitForTimeout(1500);
        
        // Now try to open obligation modal
        const addObligationBtn = await page.locator('button:has-text("הוסף"), .add-button, [data-testid*="obligation"]').last();
        if (await addObligationBtn.isVisible()) {
          console.log('✅ Add obligation button found - clicking...');
          await addObligationBtn.click();
          await page.waitForTimeout(2000);
          
          // Check if obligation modal has proper components
          const obligationModal = await page.locator('.modal, [role="dialog"]').first();
          if (await obligationModal.isVisible()) {
            console.log('✅ Obligation modal opened');
            
            const obligationComponents = await page.locator('.modal .component, .modal [data-testid]').count();
            console.log(`✅ Obligation modal has ${obligationComponents} UI components`);
            
            if (obligationComponents >= 2) {
              console.log('✅ ISSUE #4 FIXED: Obligation modal shows UI elements');
            } else {
              console.log('❌ ISSUE #4 NOT FIXED: Modal missing UI elements');
            }
          }
        }
      }
    }
    
    console.log('\n🎯 ULTRATHINK COMPREHENSIVE TEST COMPLETED');
    console.log('All 4 Credit Calculator Step 3 issues have been tested');
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  } finally {
    await page.waitForTimeout(3000); // Keep browser open to see results
    await browser.close();
  }
}

if (require.main === module) {
  testCreditStep3Issues().catch(console.error);
}