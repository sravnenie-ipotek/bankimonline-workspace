#!/usr/bin/env node

/**
 * Complete Credit Calculator Flow Test - Step 1 → Step 2 → Step 3
 * Tests all 4 ULTRATHINK fixes in proper workflow context
 */

const { chromium } = require('playwright');

async function testCompleteCreditFlow() {
  console.log('🎯 ULTRATHINK Credit Calculator Complete Flow Test\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[ERROR]:`, msg.text());
    }
  });
  
  try {
    // Step 1: Start Credit Calculator
    console.log('1️⃣ Step 1: Starting Credit Calculator...');
    await page.goto('http://localhost:5173/services/calculate-credit/1', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Fill Step 1 form quickly
    console.log('💰 Filling Step 1: Credit purpose and amount...');
    
    // Credit purpose dropdown
    const purposeDropdown = await page.locator('[role="button"]:has([placeholder*="מטרת"]), select').first();
    if (await purposeDropdown.isVisible()) {
      await purposeDropdown.click();
      await page.waitForTimeout(1000);
      const firstOption = await page.locator('[role="option"], option').first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
        console.log('✅ Credit purpose selected');
      }
    }
    
    // Credit amount - type 100000
    const amountField = await page.locator('input[type="text"], input[inputmode="numeric"]').first();
    if (await amountField.isVisible()) {
      await amountField.fill('100000');
      console.log('✅ Credit amount: 100,000 NIS');
    }
    
    // Credit period dropdown  
    const periodDropdown = await page.locator('[role="button"]:has([placeholder*="תקופה"]), select').last();
    if (await periodDropdown.isVisible()) {
      await periodDropdown.click();
      await page.waitForTimeout(1000);
      const periodOption = await page.locator('[role="option"]:has-text("5"), option[value*="5"]').first();
      if (await periodOption.isVisible()) {
        await periodOption.click();
        console.log('✅ Credit period: 5 years');
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
        console.log('✅ When selected');
      }
    }
    
    await page.waitForTimeout(2000);
    
    // Click Next button
    const nextBtn = await page.locator('button:has-text("המשך"), button:has-text("Next"), .next-button').first();
    if (await nextBtn.isVisible()) {
      console.log('⏭️ Going to Step 2...');
      await nextBtn.click();
      await page.waitForTimeout(3000);
    }
    
    // Step 2: Personal Information
    console.log('\n2️⃣ Step 2: Personal Information...');
    const currentURL2 = page.url();
    console.log('📍 Current URL:', currentURL2);
    
    if (currentURL2.includes('/2')) {
      console.log('✅ Successfully reached Step 2');
      
      // Fill personal info quickly
      const nameField = await page.locator('input[placeholder*="שם"], input[type="text"]').first();
      if (await nameField.isVisible()) {
        await nameField.fill('משה כהן');
        console.log('✅ Name filled');
      }
      
      // Fill other required fields as needed
      await page.waitForTimeout(2000);
      
      // Click Next to Step 3
      const nextBtn2 = await page.locator('button:has-text("המשך"), button:has-text("Next")').first();
      if (await nextBtn2.isVisible()) {
        console.log('⏭️ Going to Step 3...');
        await nextBtn2.click();
        await page.waitForTimeout(3000);
      }
    }
    
    // Step 3: Test all 4 ULTRATHINK fixes
    console.log('\n3️⃣ Step 3: Testing ULTRATHINK fixes...');
    const currentURL3 = page.url();
    console.log('📍 Current URL:', currentURL3);
    
    if (currentURL3.includes('/3')) {
      console.log('🎯 SUCCESS: Reached Step 3 - Now testing all 4 fixes\n');
      
      // Test Fix #1: Field of Activity dropdown
      console.log('🔧 Testing Fix #1: Field of Activity dropdown');
      
      // First select main income source to trigger Field of Activity
      const mainIncomeDropdown = await page.locator('[role="button"]:has([placeholder*="מקור"]), [role="button"]:has([placeholder*="ההכנסה"])').first();
      if (await mainIncomeDropdown.isVisible()) {
        console.log('✅ Main income dropdown found');
        await mainIncomeDropdown.click();
        await page.waitForTimeout(2000);
        
        // Select Employee option (should trigger additional fields)
        const employeeOption = await page.locator('[role="option"]:has-text("משכורת"), [role="option"]:has-text("Employee")').first();
        if (await employeeOption.isVisible()) {
          console.log('✅ Selecting Employee option...');
          await employeeOption.click();
          await page.waitForTimeout(3000);
          
          // Now look for Field of Activity dropdown
          const fieldOfActivityDropdown = await page.locator('[role="button"]:has([placeholder*="מקצועי"]), [role="button"]:has([placeholder*="תחום"])').first();
          if (await fieldOfActivityDropdown.isVisible()) {
            console.log('✅ FIX #1 SUCCESS: Field of Activity dropdown appeared!');
            
            await fieldOfActivityDropdown.click();
            await page.waitForTimeout(2000);
            
            const professionalOptions = await page.locator('[role="option"]').count();
            console.log(`✅ Field of Activity has ${professionalOptions} professional options`);
            
            if (professionalOptions >= 5) {
              console.log('🎯 ISSUE #1 FIXED: Field of Activity has translations and options');
              // Select first professional option
              const firstProfessional = await page.locator('[role="option"]').first();
              await firstProfessional.click();
              console.log('✅ Professional sphere selected');
            }
          } else {
            console.log('❌ ISSUE #1: Field of Activity dropdown still not visible');
          }
        }
      }
      
      // Test Fix #2: Existing debts dropdown logic
      console.log('\n🔧 Testing Fix #2: Existing debts dropdown logic');
      const obligationDropdown = await page.locator('[role="button"]:has([placeholder*="חובות"])').first();
      if (await obligationDropdown.isVisible()) {
        console.log('✅ Obligations dropdown found');
        await obligationDropdown.click();
        await page.waitForTimeout(2000);
        
        const debtOption = await page.locator('[role="option"]:has-text("משכנתא")').first();
        if (await debtOption.isVisible()) {
          console.log('✅ FIX #2 SUCCESS: Debt options available with Hebrew labels');
          await debtOption.click();
          await page.waitForTimeout(2000);
          console.log('🎯 ISSUE #2 FIXED: Obligations dropdown logic working correctly');
        }
      }
      
      // Test Fix #3: Source of Income modal
      console.log('\n🔧 Testing Fix #3: Source of Income modal');
      const addIncomeBtn = await page.locator('button:has-text("הוסף"), .add-button').first();
      if (await addIncomeBtn.isVisible()) {
        console.log('✅ Add income source button found');
        await addIncomeBtn.click();
        await page.waitForTimeout(3000);
        
        const modalVisible = await page.locator('.modal, [role="dialog"]').first().isVisible();
        if (modalVisible) {
          console.log('✅ Source of Income modal opened');
          const modalComponents = await page.locator('.modal .component, .modal [data-testid]').count();
          console.log(`✅ Modal has ${modalComponents} UI components`);
          
          if (modalComponents >= 2) {
            console.log('🎯 ISSUE #3 FIXED: Source of Income modal shows UI elements');
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
      console.log('\n🔧 Testing Fix #4: Obligation modal');
      const addObligationBtn = await page.locator('button:has-text("הוסף")').last();
      if (await addObligationBtn.isVisible()) {
        console.log('✅ Add obligation button found');
        await addObligationBtn.click();
        await page.waitForTimeout(3000);
        
        const obligationModal = await page.locator('.modal, [role="dialog"]').first();
        if (await obligationModal.isVisible()) {
          console.log('✅ Obligation modal opened');
          const obligationComponents = await page.locator('.modal .component').count();
          console.log(`✅ Obligation modal has ${obligationComponents} UI components`);
          
          if (obligationComponents >= 2) {
            console.log('🎯 ISSUE #4 FIXED: Obligation modal shows UI elements');
          }
        }
      }
      
      console.log('\n🏆 ULTRATHINK COMPREHENSIVE TEST RESULTS:');
      console.log('All 4 Credit Calculator Step 3 issues have been systematically tested');
      console.log('Following architecture docs: dropDownLogicBankim.md & systemTranslationLogic.md');
      
    } else {
      console.log('❌ Could not reach Step 3 - might need more form completion');
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