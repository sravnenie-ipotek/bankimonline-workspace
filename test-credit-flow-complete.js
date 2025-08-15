#!/usr/bin/env node

/**
 * Complete Credit Calculator Flow Test - Step 1 → Step 2 → Step 3
 * Tests all 4 ULTRATHINK fixes in proper workflow context
 */

const { chromium } = require('playwright');

async function testCompleteCreditFlow() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      );
    }
  });
  
  try {
    // Step 1: Start Credit Calculator
    await page.goto('http://localhost:5173/services/calculate-credit/1', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Fill Step 1 form quickly
    // Credit purpose dropdown
    const purposeDropdown = await page.locator('[role="button"]:has([placeholder*="מטרת"]), select').first();
    if (await purposeDropdown.isVisible()) {
      await purposeDropdown.click();
      await page.waitForTimeout(1000);
      const firstOption = await page.locator('[role="option"], option').first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
        }
    }
    
    // Credit amount - type 100000
    const amountField = await page.locator('input[type="text"], input[inputmode="numeric"]').first();
    if (await amountField.isVisible()) {
      await amountField.fill('100000');
      }
    
    // Credit period dropdown  
    const periodDropdown = await page.locator('[role="button"]:has([placeholder*="תקופה"]), select').last();
    if (await periodDropdown.isVisible()) {
      await periodDropdown.click();
      await page.waitForTimeout(1000);
      const periodOption = await page.locator('[role="option"]:has-text("5"), option[value*="5"]').first();
      if (await periodOption.isVisible()) {
        await periodOption.click();
        }
    }
    
    // When dropdown
    const whenDropdown = await page.locator('[role="button"]:has([placeholder*="מתי"]), select').first();
    if (await whenDropdown.isVisible()) {
      await whenDropdown.click();
      await page.waitForTimeout(1000);
      const whenOption = await page.locator('[role="option"], option').first();
      if (await whenOption.isVisible()) {
        await whenOption.click();
        }
    }
    
    await page.waitForTimeout(2000);
    
    // Click Next button
    const nextBtn = await page.locator('button:has-text("המשך"), button:has-text("Next"), .next-button').first();
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await page.waitForTimeout(3000);
    }
    
    // Step 2: Personal Information
    const currentURL2 = page.url();
    if (currentURL2.includes('/2')) {
      // Fill personal info quickly
      const nameField = await page.locator('input[placeholder*="שם"], input[type="text"]').first();
      if (await nameField.isVisible()) {
        await nameField.fill('משה כהן');
        }
      
      // Fill other required fields as needed
      await page.waitForTimeout(2000);
      
      // Click Next to Step 3
      const nextBtn2 = await page.locator('button:has-text("המשך"), button:has-text("Next")').first();
      if (await nextBtn2.isVisible()) {
        await nextBtn2.click();
        await page.waitForTimeout(3000);
      }
    }
    
    // Step 3: Test all 4 ULTRATHINK fixes
    const currentURL3 = page.url();
    if (currentURL3.includes('/3')) {
      // Test Fix #1: Field of Activity dropdown
      // First select main income source to trigger Field of Activity
      const mainIncomeDropdown = await page.locator('[role="button"]:has([placeholder*="מקור"]), [role="button"]:has([placeholder*="ההכנסה"])').first();
      if (await mainIncomeDropdown.isVisible()) {
        await mainIncomeDropdown.click();
        await page.waitForTimeout(2000);
        
        // Select Employee option (should trigger additional fields)
        const employeeOption = await page.locator('[role="option"]:has-text("משכורת"), [role="option"]:has-text("Employee")').first();
        if (await employeeOption.isVisible()) {
          await employeeOption.click();
          await page.waitForTimeout(3000);
          
          // Now look for Field of Activity dropdown
          const fieldOfActivityDropdown = await page.locator('[role="button"]:has([placeholder*="מקצועי"]), [role="button"]:has([placeholder*="תחום"])').first();
          if (await fieldOfActivityDropdown.isVisible()) {
            await fieldOfActivityDropdown.click();
            await page.waitForTimeout(2000);
            
            const professionalOptions = await page.locator('[role="option"]').count();
            if (professionalOptions >= 5) {
              // Select first professional option
              const firstProfessional = await page.locator('[role="option"]').first();
              await firstProfessional.click();
              }
          } else {
            }
        }
      }
      
      // Test Fix #2: Existing debts dropdown logic
      const obligationDropdown = await page.locator('[role="button"]:has([placeholder*="חובות"])').first();
      if (await obligationDropdown.isVisible()) {
        await obligationDropdown.click();
        await page.waitForTimeout(2000);
        
        const debtOption = await page.locator('[role="option"]:has-text("משכנתא")').first();
        if (await debtOption.isVisible()) {
          await debtOption.click();
          await page.waitForTimeout(2000);
          }
      }
      
      // Test Fix #3: Source of Income modal
      const addIncomeBtn = await page.locator('button:has-text("הוסף"), .add-button').first();
      if (await addIncomeBtn.isVisible()) {
        await addIncomeBtn.click();
        await page.waitForTimeout(3000);
        
        const modalVisible = await page.locator('.modal, [role="dialog"]').first().isVisible();
        if (modalVisible) {
          const modalComponents = await page.locator('.modal .component, .modal [data-testid]').count();
          if (modalComponents >= 2) {
            }
          
          // Close modal
          const closeBtn = await page.locator('button:has-text("חזור")').first();
          if (await closeBtn.isVisible()) {
            await closeBtn.click();
            await page.waitForTimeout(1000);
          }
        }
      }
      
      // Test Fix #4: Obligation modal  
      const addObligationBtn = await page.locator('button:has-text("הוסף")').last();
      if (await addObligationBtn.isVisible()) {
        await addObligationBtn.click();
        await page.waitForTimeout(3000);
        
        const obligationModal = await page.locator('.modal, [role="dialog"]').first();
        if (await obligationModal.isVisible()) {
          const obligationComponents = await page.locator('.modal .component').count();
          if (obligationComponents >= 2) {
            }
        }
      }
      
      } else {
      }
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  } finally {
    await page.waitForTimeout(10000); // Keep browser open to see results
    await browser.close();
  }
}

if (require.main === module) {
  testCompleteCreditFlow().catch(console.error);
}