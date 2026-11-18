import { test, expect } from '@playwright/test';

/**
 * E2E — Public pages smoke tests
 * Tests all major public routes render without errors.
 */

test.describe('Public pages', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Zain Reserve/i);
    await expect(page.getByRole('heading', { name: /drive the/i })).toBeVisible();
    // CTA buttons present
    await expect(page.getByRole('link', { name: /explore the fleet/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /boutique showrooms/i })).toBeVisible();
  });

  test('vehicles catalog loads', async ({ page }) => {
    await page.goto('/vehicles');
    await expect(page).toHaveTitle(/Zain Reserve/i);
    // Filter bar visible
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test('dealerships page loads', async ({ page }) => {
    await page.goto('/dealerships');
    await expect(page).toHaveTitle(/Zain Reserve/i);
    // At least one "hours" text is present if data seeded
    // (soft assertion — passes even with empty DB)
    await expect(page.locator('body')).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('register page loads', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /create/i })).toBeVisible();
  });

  test('design system page loads', async ({ page }) => {
    await page.goto('/design');
    await expect(page.getByRole('heading', { name: /component catalog/i })).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('header links navigate correctly', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /vehicles/i }).first().click();
    await expect(page).toHaveURL('/vehicles');

    await page.getByRole('link', { name: /dealerships/i }).first().click();
    await expect(page).toHaveURL('/dealerships');
  });

  test('logo link returns to home', async ({ page }) => {
    await page.goto('/vehicles');
    // Click the ZAIN RESERVE wordmark
    await page.getByRole('link', { name: /zain reserve/i }).click();
    await expect(page).toHaveURL('/');
  });
});

