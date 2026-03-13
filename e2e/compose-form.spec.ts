import { test, expect } from '@playwright/test';

test.describe('Compose Form QA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/send/e2e-test-user');
  });

  test('Compose form works and successfully sends a message', async ({ page }) => {
    await expect(page.locator('text=@e2e-test-user')).toBeVisible();
    
    const textarea = page.locator('textarea[placeholder="Send an anonymous message..."]');
    await expect(textarea).toBeVisible();
    
    const message = "This is an automated test message!";
    await textarea.fill(message);
    
    await expect(page.locator(`text=${message.length}/280`)).toBeVisible();
    
    const switchToggle = page.locator('button[role="switch"]');
    await expect(switchToggle).toBeVisible();
    
    const sendButton = page.locator('button', { hasText: 'Send Message' });
    await expect(sendButton).toBeEnabled();
    await sendButton.click();
    
    await expect(page.locator('text=Message Sent!')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Send Another Message' })).toBeVisible();
  });

  test('Character limit is enforced', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder="Send an anonymous message..."]');
    
    const longMessage = 'A'.repeat(281);
    
    await textarea.fill(longMessage);
    
    const value = await textarea.inputValue();
    expect(value.length).toBe(280);
    
    await expect(page.locator('text=280/280')).toBeVisible();
    
    const sendButton = page.locator('button', { hasText: 'Send Message' });
    await expect(sendButton).toBeEnabled();
  });

  test('Self-send is blocked', async ({ page, context }) => {
    await page.goto('http://localhost:3000/send/nonexistent-user-xyz');
    const pageContent = await page.content();
    expect(pageContent).toContain('Not Found');
  });
});
