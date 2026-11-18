import { test, expect } from '@playwright/test';

/**
 * E2E — Admin portal access control
 * Tests that admin routes enforce STAFF role.
 * Uses seed staff credentials from environment.
 */

const STAFF_EMAIL = process.env.SEED_STAFF_EMAIL ?? 'staff@zainreserve.com';
const STAFF_PASSWORD = process.env.SEED_STAFF_PASSWORD ?? 'Staff1234!';

test.describe('Admin portal access control', () => {
  test('unauthenticated user is blocked from /admin', async ({ page }) => {
    await page.goto('/admin/dashboard');
    // Must redirect to login (not render admin portal)
    await expect(page).toHaveURL(/login/);
  });

  test('customer account is blocked from /admin', async ({ page }) => {
    // Login as customer
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('demo@example.com');
    await page.getByLabel(/password/i).fill('Demo1234');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByRole('link', { name: /my bookings/i })).toBeVisible();

    // Try to access admin
    await page.goto('/admin/dashboard');
    // Should redirect away from admin
    await expect(page).not.toHaveURL('/admin/dashboard');
  });
});

test.describe('Admin portal (staff login)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(STAFF_EMAIL);
    await page.getByLabel(/password/i).fill(STAFF_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    // Staff portal nav link visible
    await expect(page.getByRole('link', { name: /staff portal/i })).toBeVisible({ timeout: 8000 });
  });

  test('admin dashboard renders KPI cards', async ({ page }) => {
    await page.goto('/admin/dashboard');
    // Page title area should be visible
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('admin bookings page renders', async ({ page }) => {
    await page.goto('/admin/bookings');
    await expect(page.getByRole('heading', { name: /bookings/i })).toBeVisible();
  });

  test('admin vehicles page renders', async ({ page }) => {
    await page.goto('/admin/vehicles');
    await expect(page.getByRole('heading', { name: /vehicles|fleet/i })).toBeVisible();
  });

  test('admin dealerships page renders', async ({ page }) => {
    await page.goto('/admin/dealerships');
    await expect(page.getByRole('heading', { name: /dealerships|showrooms/i })).toBeVisible();
  });

  test('admin slots page renders', async ({ page }) => {
    await page.goto('/admin/slots');
    await expect(page.getByRole('heading', { name: /slots/i })).toBeVisible();
  });

  test('admin users page renders', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: /users/i })).toBeVisible();
  });
});

