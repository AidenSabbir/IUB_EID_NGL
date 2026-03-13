import { test, expect } from '@playwright/test';

test.describe('Profile Page', () => {
  test('Profile card renders correctly', async ({ page }) => {
    await page.goto('/test-profile');
    await expect(page.locator('text=Test User')).toBeVisible();
    await expect(page.locator('text=@testuser')).toBeVisible();
    await expect(page.locator('text=Send a message')).toBeVisible();
    await expect(page.locator('text=Share')).toBeVisible();
  });

  test('404 works for non-existent user', async ({ page }) => {
    await page.goto('/u/thisuserdoesnotexist123456789');
    await expect(page.locator('text=User Not Found')).toBeVisible();
    await expect(page.locator('text=The profile you are looking for does not exist')).toBeVisible();
  });

  test('Copy link works', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/test-profile');
    
    const shareButton = page.locator('button:has-text("Share")');
    await shareButton.click();
    
    await expect(page.locator('text=Copied!')).toBeVisible();
    
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('/u/testuser');
  });
});