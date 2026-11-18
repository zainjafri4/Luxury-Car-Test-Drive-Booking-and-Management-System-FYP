import { test, expect } from '@playwright/test';

/**
 * E2E — Auth Flow
 * Tests: register → login → logout
 *
 * NOTE: Requires a running API (localhost:4000) and Web (localhost:3000).
 * Uses a unique timestamp email to avoid conflicts across runs.
 */

const timestamp = Date.now();
const TEST_EMAIL = `e2e_${timestamp}@zainreserve.test`;
const TEST_PASSWORD = 'E2eTest1234!';
const TEST_NAME = 'E2E Test User';

test.describe('Auth flow', () => {
  test('register new account', async ({ page }) => {
    await page.goto('/register');

    await expect(page).toHaveTitle(/Zain Reserve/i);
    await expect(page.getByRole('heading', { name: /create/i })).toBeVisible();

    await page.getByLabel(/full name/i).fill(TEST_NAME);
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);

    await page.getByRole('button', { name: /create account/i }).click();

    // After successful registration redirects to home or bookings
    await expect(page).not.toHaveURL('/register');
  });

  test('login with registered account', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Redirected away from login — header should now show user name or "My Bookings" link
    await expect(page).not.toHaveURL('/login');
    // Nav should contain "My Bookings" for logged-in customers
    await expect(page.getByRole('link', { name: /my bookings/i })).toBeVisible();
  });

  test('logout', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByRole('link', { name: /my bookings/i })).toBeVisible();

    // Sign out
    await page.getByRole('button', { name: /sign out/i }).click();

    // After logout My Bookings link disappears
    await expect(page.getByRole('link', { name: /my bookings/i })).not.toBeVisible();
  });

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill('wrongPassword999');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should stay on login and show an error message
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('alert')).toBeVisible();
  });
});

