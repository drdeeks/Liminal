import { test, expect } from '@playwright/test';

test('renders the start screen', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'screenshot.png' });
  await expect(page.getByText('Connect Wallet')).toBeVisible();
});
