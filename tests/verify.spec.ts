import { test, expect } from '@playwright/test';

test('app renders Connect Wallet button', async ({ page }) => {
  // Add detailed logging
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));

  console.log('Navigating to app...');
  await page.goto('/');

  console.log('Waiting for React to load...');
  await page.waitForLoadState('networkidle');

  // Take screenshot before assertion
  await page.screenshot({ path: 'before-assertion.png' });

  console.log('Looking for Connect Wallet button...');
  const button = page.getByRole('button', { name: /connect wallet/i });

  // Wait up to 10 seconds
  await expect(button).toBeVisible({ timeout: 10_000 });

  console.log('✅ Test passed!');
});
