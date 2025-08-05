import { test, expect } from '@playwright/test';

test.describe('Banking Application', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page title is correct
    await expect(page).toHaveTitle(/Banking/);
    
    // Check for key elements on the homepage
    await expect(page.locator('nav')).toBeVisible();
  });

  test('mortgage calculator is accessible', async ({ page }) => {
    await page.goto('/services/calculate-mortgage/1');
    
    // Wait for the mortgage calculator to load
    await expect(page.locator('[data-testid="mortgage-calculator"]')).toBeVisible();
    
    // Check for mortgage amount input
    await expect(page.locator('input[name="mortgage_amount"]')).toBeVisible();
  });

  test('credit calculator is accessible', async ({ page }) => {
    await page.goto('/services/calculate-credit/1');
    
    // Wait for the credit calculator to load
    await expect(page.locator('[data-testid="credit-calculator"]')).toBeVisible();
    
    // Check for credit amount input
    await expect(page.locator('input[name="credit_amount"]')).toBeVisible();
  });

  test('refinance mortgage is accessible', async ({ page }) => {
    await page.goto('/services/refinance-mortgage/1');
    
    // Wait for the refinance calculator to load
    await expect(page.locator('[data-testid="refinance-calculator"]')).toBeVisible();
  });

  test('navigation menu works', async ({ page }) => {
    await page.goto('/');
    
    // Check that sidebar menu exists
    await expect(page.locator('[data-testid="sidebar-menu"]')).toBeVisible();
    
    // Test menu navigation
    await page.click('[data-testid="menu-services"]');
    await expect(page.locator('[data-testid="services-submenu"]')).toBeVisible();
  });

  test('language switching works', async ({ page }) => {
    await page.goto('/');
    
    // Check for language switcher
    await expect(page.locator('[data-testid="language-switcher"]')).toBeVisible();
    
    // Test Hebrew language switch
    await page.click('[data-testid="lang-he"]');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    
    // Test English language switch
    await page.click('[data-testid="lang-en"]');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  });

  test('admin panel is accessible', async ({ page }) => {
    await page.goto('http://localhost:8003/admin');
    
    // Check for admin login or dashboard
    const isLoginPage = await page.locator('input[type="password"]').isVisible();
    const isDashboard = await page.locator('[data-testid="admin-dashboard"]').isVisible();
    
    expect(isLoginPage || isDashboard).toBe(true);
  });
}); 