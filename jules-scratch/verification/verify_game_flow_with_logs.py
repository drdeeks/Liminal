from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Listen for console events and print them
    page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))

    # Navigate to the running application
    page.goto("http://localhost:3000/")

    # Wait for the Start screen to be visible and click "Start Game"
    expect(page.get_by_role("button", name="Start Game")).to_be_visible(timeout=10000)
    page.get_by_role("button", name="Start Game").click()

    # Wait for the "How to Play" screen to be visible
    expect(page.get_by_text("How to Play")).to_be_visible()

    # Click the "Play" button to proceed to the game
    page.get_by_role("button", name="Play").click()

    # Wait for the countdown to finish
    expect(page.get_by_text("3")).to_be_visible(timeout=2000)
    expect(page.get_by_text("2")).to_be_visible(timeout=2000)
    expect(page.get_by_text("1")).to_be_visible(timeout=2000)
    expect(page.get_by_text("Start!")).to_be_visible(timeout=2000)

    # Wait for the game interface to be visible, specifically the direction card
    expect(page.locator('.direction-card')).to_be_visible(timeout=5000)

    # Take a screenshot of the main game interface
    page.screenshot(path="jules-scratch/verification/game_interface.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
