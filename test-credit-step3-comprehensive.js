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
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to Credit Calculator Step 3
    await page.goto('http://localhost:5173/services/calculate-credit/3', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Test Issue #1: Field of Activity dropdown
    const fieldOfActivity = await page.locator('[data-testid="field-of-activity-dropdown"], .field-of-activity, [id*="field"], [placeholder*="מקצועי"], [placeholder*="תחום"]').first();
    
    if (await fieldOfActivity.isVisible()) {
      // Click to open dropdown
      await fieldOfActivity.click();
      await page.waitForTimeout(1000);
      
      // Check for Hebrew options
      const options = await page.locator('[role="option"], .MuiMenuItem-root, .dropdown-option').count();
      if (options >= 5) {
        } else {
        }
    } else {
      }
    
    // Test Issue #2: Main income source logic
    const mainIncomeSource = await page.locator('[data-testid="main-source-income-dropdown"], .main-source-income, [placeholder*="ההכנסה"], [placeholder*="מקור"]').first();
    
    if (await mainIncomeSource.isVisible()) {
      // Click to open dropdown
      await mainIncomeSource.click();
      await page.waitForTimeout(1000);
      
      // Select "Employee" (value "1") 
      const employeeOption = await page.locator('[role="option"]:has-text("משכורת"), .MuiMenuItem-root:has-text("משכורת")').first();
      if (await employeeOption.isVisible()) {
        await employeeOption.click();
        await page.waitForTimeout(1500);
        
        // Check if additional fields appeared (components by income source)
        const additionalFields = await page.locator('.component, [data-testid*="monthly"], [data-testid*="field"], [data-testid*="company"]').count();
        if (additionalFields >= 3) {
          } else {
          }
      }
    }
    
    // Test Issue #3: Source of Income modal UI elements
    const addIncomeSourceBtn = await page.locator('[data-testid*="add"], .add-button, button:has-text("הוסף"), button[data-testid*="source"]').first();
    if (await addIncomeSourceBtn.isVisible()) {
      await addIncomeSourceBtn.click();
      await page.waitForTimeout(2000);
      
      // Check if modal opened with proper components
      const modalVisible = await page.locator('.modal, [role="dialog"], .MuiModal-root').first().isVisible();
      if (modalVisible) {
        // Check for modal components
        const modalComponents = await page.locator('.modal .component, .modal [data-testid]').count();
        if (modalComponents >= 2) {
          } else {
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
    // First select existing debts
    const obligationDropdown = await page.locator('[data-testid="obligation-dropdown"], .obligation, [placeholder*="חובות"]').first();
    if (await obligationDropdown.isVisible()) {
      await obligationDropdown.click();
      await page.waitForTimeout(1000);
      
      // Select a debt option (not "no debts")
      const debtOption = await page.locator('[role="option"]:has-text("משכנתא"), .MuiMenuItem-root:has-text("משכנתא")').first();
      if (await debtOption.isVisible()) {
        found - selecting...');
        await debtOption.click();
        await page.waitForTimeout(1500);
        
        // Now try to open obligation modal
        const addObligationBtn = await page.locator('button:has-text("הוסף"), .add-button, [data-testid*="obligation"]').last();
        if (await addObligationBtn.isVisible()) {
          await addObligationBtn.click();
          await page.waitForTimeout(2000);
          
          // Check if obligation modal has proper components
          const obligationModal = await page.locator('.modal, [role="dialog"]').first();
          if (await obligationModal.isVisible()) {
            const obligationComponents = await page.locator('.modal .component, .modal [data-testid]').count();
            if (obligationComponents >= 2) {
              } else {
              }
          }
        }
      }
    }
    
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