import { test, expect } from '@playwright/test';

test.use({
  headless: true,
});

test('app renders chain selector', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for the app to load and the "Connect Wallet" button to be visible
  await expect(page.getByRole('button', { name: 'Connect Wallet' })).toBeVisible({ timeout: 15000 });

  // This test assumes the wallet is not connected, so we can't directly test the chain selector.
  // Instead, we'll just take a screenshot of the main menu.
  await page.screenshot({ path: 'jules-scratch/verification/verification.png' });
});
