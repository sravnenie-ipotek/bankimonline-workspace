import { test, expect } from '@playwright/test';

test.describe('Mortgage Calculator Flow', () => {
  test('complete mortgage calculation flow', async ({ page }) => {
    // Step 1: Navigate to mortgage calculator
    await page.goto('/services/calculate-mortgage/1');
    await expect(page.locator('[data-testid="mortgage-step1"]')).toBeVisible();

    // Fill out Step 1 - Loan Parameters
    await page.fill('input[name="mortgage_amount"]', '500000');
    await page.fill('input[name="property_price"]', '700000');
    await page.fill('input[name="years"]', '25');
    await page.selectOption('select[name="interest_type"]', 'fixed');
    
    // Go to Step 2
    await page.click('button[data-testid="next-step"]');
    await expect(page.locator('[data-testid="mortgage-step2"]')).toBeVisible();

    // Fill out Step 2 - Personal Information
    await page.fill('input[name="first_name"]', 'John');
    await page.fill('input[name="last_name"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phone"]', '0501234567');
    await page.selectOption('select[name="age"]', '35');
    await page.selectOption('select[name="marital_status"]', 'married');
    
    // Go to Step 3
    await page.click('button[data-testid="next-step"]');
    await expect(page.locator('[data-testid="mortgage-step3"]')).toBeVisible();

    // Fill out Step 3 - Income Information
    await page.fill('input[name="monthly_income"]', '15000');
    await page.selectOption('select[name="employment_type"]', 'employee');
    await page.selectOption('select[name="income_source"]', 'salary');
    await page.fill('input[name="work_experience"]', '10');
    
    // Go to Step 4
    await page.click('button[data-testid="next-step"]');
    await expect(page.locator('[data-testid="mortgage-step4"]')).toBeVisible();

    // Step 4 - Results and Bank Offers
    await expect(page.locator('[data-testid="bank-offers"]')).toBeVisible();
    await expect(page.locator('.bank-offer')).toHaveCount.greaterThan(0);
    
    // Check that we can see interest rates
    await expect(page.locator('[data-testid="interest-rate"]')).toBeVisible();
    
    // Check that we can see monthly payments
    await expect(page.locator('[data-testid="monthly-payment"]')).toBeVisible();
  });

  test('mortgage calculator validation works', async ({ page }) => {
    await page.goto('/services/calculate-mortgage/1');
    
    // Try to proceed without filling required fields
    await page.click('button[data-testid="next-step"]');
    
    // Should show validation errors
    await expect(page.locator('.error-message')).toBeVisible();
    
    // Fill minimum required field
    await page.fill('input[name="mortgage_amount"]', '100000');
    
    // Validation should update
    const errorCount = await page.locator('.error-message').count();
    expect(errorCount).toBeLessThan(5); // Should have fewer errors now
  });

  test('mortgage calculator supports different interest types', async ({ page }) => {
    await page.goto('/services/calculate-mortgage/1');
    
    // Test fixed interest
    await page.selectOption('select[name="interest_type"]', 'fixed');
    await expect(page.locator('[data-testid="fixed-rate-options"]')).toBeVisible();
    
    // Test variable interest
    await page.selectOption('select[name="interest_type"]', 'variable');
    await expect(page.locator('[data-testid="variable-rate-options"]')).toBeVisible();
    
    // Test mixed interest
    await page.selectOption('select[name="interest_type"]', 'mixed');
    await expect(page.locator('[data-testid="mixed-rate-options"]')).toBeVisible();
  });

  test('back navigation works in mortgage calculator', async ({ page }) => {
    await page.goto('/services/calculate-mortgage/1');
    
    // Fill step 1 and go to step 2
    await page.fill('input[name="mortgage_amount"]', '400000');
    await page.click('button[data-testid="next-step"]');
    await expect(page.locator('[data-testid="mortgage-step2"]')).toBeVisible();
    
    // Go back to step 1
    await page.click('button[data-testid="prev-step"]');
    await expect(page.locator('[data-testid="mortgage-step1"]')).toBeVisible();
    
    // Verify data is preserved
    const mortgageAmount = await page.inputValue('input[name="mortgage_amount"]');
    expect(mortgageAmount).toBe('400000');
  });
}); 