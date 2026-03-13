import { test, expect } from '@playwright/test';

test.describe('Profile Page QA', () => {
  test('Profile card renders correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/u/e2e-test-user');
    await expect(page.locator('text=E2E Test User')).toBeVisible();
    await expect(page.locator('text=@e2e-test-user')).toBeVisible();
    
    const sendButton = page.locator('a', { hasText: 'Send a message' });
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toHaveAttribute('href', '/send/e2e-test-user');
  });

  test('404 works gracefully', async ({ page }) => {
    await page.goto('http://localhost:3000/u/nonexistent_xyz_123');
    await expect(page.locator('text=User Not Found')).toBeVisible();
    await expect(page.locator('text=Return Home')).toBeVisible();
  });

  test('Copy link works', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // We need to bypass the JS alert or handle it
    page.on('dialog', dialog => dialog.accept());
    
    await page.goto('http://localhost:3000/u/e2e-test-user');
    
    const shareButton = page.locator('button', { hasText: 'Share' });
    await shareButton.click();
    
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('/u/e2e-test-user');
  });
});
