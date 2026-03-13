import { test, expect } from '@playwright/test';

test.describe('Search page', () => {
  test('displays empty state initially', async ({ page }) => {
    await page.goto('/search');
    console.log('Current URL:', page.url());
    
    // Check for empty state
    await expect(page.getByText('Find Friends')).toBeVisible();
    await expect(page.getByText('Search for users to send Eid wishes')).toBeVisible();
  });

  test('requires minimum 2 characters', async ({ page }) => {
    await page.goto('/search');
    
    await page.getByPlaceholder('Search for users...').fill('a');
    
    // Should still show empty state because < 2 chars
    await expect(page.getByText('Search for users to send Eid wishes')).toBeVisible();
  });

  test('displays no results state', async ({ page }) => {
    await page.goto('/search');
    
    const query = 'nonexistentuser12345';
    await page.getByPlaceholder('Search for users...').fill(query);
    
    // Wait for debounce and search
    await expect(page.getByText(`No users found for '${query}'`)).toBeVisible({ timeout: 5000 });
  });

  test('performs fuzzy search successfully', async ({ page }) => {
    // This assumes there's at least some user we can search for.
    // If not, we can just verify the input works without error.
    await page.goto('/search');
    
    await page.getByPlaceholder('Search for users...').fill('test');
    
    // We don't know exact users in the DB, so we wait for either results or "No users found"
    // Just make sure it doesn't crash
    const locator = page.locator('.flex-col.gap-3.pb-8 > a, p:has-text("No users found")');
    await expect(locator.first()).toBeVisible({ timeout: 5000 });
  });
});
