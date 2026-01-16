# Button Functionality Verification Checklist

## Quick Test Instructions

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the app in your browser** (usually http://localhost:5173)

3. **Test each button systematically:**

### Main Menu (Not Connected)
- [ ] Click "Connect Wallet" - should trigger wallet connection
- [ ] Click "View Leaderboard" - should navigate to leaderboard

### Main Menu (Connected)
- [ ] Click "Start Game" - should show How to Play screen
- [ ] Click "Leaderboard" - should navigate to leaderboard
- [ ] Click "Say GM" - should trigger GM transaction
- [ ] Click "Disconnect" - should disconnect wallet
- [ ] Click chain selector dropdown - should open/close
- [ ] Select different chain - should switch network

### How to Play Screen
- [ ] Click checkbox - should enable/disable Start Game button
- [ ] Click "Start Game" (when enabled) - should start game
- [ ] Click "Back" - should return to menu

### During Gameplay
- [ ] Swipe/arrow keys should work on cards
- [ ] Timer should count down
- [ ] Strikes should decrease on wrong swipes

### Game Over Screen
- [ ] Click "Reset Strikes" - should trigger transaction
- [ ] Click "Play Again" - should restart game
- [ ] Click "Submit Score" - should submit to leaderboard
- [ ] Click "Leaderboard" - should navigate to leaderboard
- [ ] After reset strikes success, "Continue" button should work

### Leaderboard Screen
- [ ] Click "Previous" - should go to previous page
- [ ] Click "Next" - should go to next page
- [ ] Click "Back to Menu" - should return to main menu

## Common Issues to Check

### Touch Devices
- Buttons should respond to taps
- No accidental pull-to-refresh when tapping buttons
- Swipe gestures should work on game cards only

### Desktop
- Buttons should respond to clicks
- Hover effects should work
- Keyboard navigation should work (arrow keys during game)

### All Devices
- No console errors when clicking buttons
- Buttons should have visual feedback (hover/active states)
- Disabled buttons should not be clickable
- Loading states should show during transactions

## Automated Testing

Run the test suite:
```bash
npm run test
```

Run Playwright tests:
```bash
npx playwright test tests/button-functionality.spec.ts
```

## Fixed Issues

✅ SwipeMask no longer blocks button interactions
✅ Touch events properly allow button clicks
✅ Wallet connect button uses correct connector
✅ All buttons have proper event handlers
✅ Z-index layering is correct
✅ No pointer-events-none on interactive elements

## If Issues Persist

1. Check browser console for errors
2. Verify wagmi configuration is correct
3. Ensure wallet extension is installed
4. Check network connectivity
5. Clear browser cache and reload
