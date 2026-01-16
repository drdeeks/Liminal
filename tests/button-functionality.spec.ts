import { test, expect } from '@playwright/test';

test.describe('Button Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('Connect Wallet button should be visible and clickable', async ({ page }) => {
    const connectButton = page.getByRole('button', { name: /connect wallet/i });
    await expect(connectButton).toBeVisible();
    await expect(connectButton).toBeEnabled();
    
    // Check if button has proper styling
    const buttonClasses = await connectButton.getAttribute('class');
    expect(buttonClasses).toContain('bg-gradient-to-r');
  });

  test('View Leaderboard button should be visible and clickable', async ({ page }) => {
    const leaderboardButton = page.getByRole('button', { name: /view leaderboard/i });
    await expect(leaderboardButton).toBeVisible();
    await expect(leaderboardButton).toBeEnabled();
    
    // Click and verify navigation
    await leaderboardButton.click();
    await expect(page.getByText(/leaderboard/i).first()).toBeVisible();
  });

  test('Back button on leaderboard should work', async ({ page }) => {
    // Navigate to leaderboard
    const leaderboardButton = page.getByRole('button', { name: /view leaderboard/i });
    await leaderboardButton.click();
    
    // Click back button
    const backButton = page.getByRole('button', { name: /back to menu/i });
    await expect(backButton).toBeVisible();
    await backButton.click();
    
    // Verify we're back at menu
    await expect(page.getByText(/liminal/i).first()).toBeVisible();
  });

  test('How to Play screen buttons should work', async ({ page }) => {
    // Mock wallet connection
    await page.evaluate(() => {
      // Simulate connected state
      window.localStorage.setItem('wagmi.connected', 'true');
    });
    
    await page.reload();
    
    // Click Start Game
    const startButton = page.getByRole('button', { name: /start game/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      
      // Check if How to Play screen appears
      await expect(page.getByText(/how to play/i)).toBeVisible();
      
      // Check the checkbox
      const checkbox = page.locator('input[type="checkbox"]');
      await checkbox.check();
      
      // Start Game button should be enabled
      const playButton = page.getByRole('button', { name: /start game/i }).last();
      await expect(playButton).toBeEnabled();
      
      // Cancel button should work
      const cancelButton = page.getByRole('button', { name: /back/i });
      await expect(cancelButton).toBeVisible();
      await cancelButton.click();
    }
  });

  test('All menu buttons should have hover effects', async ({ page }) => {
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      if (await button.isVisible()) {
        const classes = await button.getAttribute('class');
        // Check for transition classes
        expect(classes).toMatch(/transition|hover/);
      }
    }
  });
});
