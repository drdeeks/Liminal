import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    # The dev server is on a new port, 3010
    page.goto("http://localhost:3010", wait_until="networkidle")

    # 1. Check initial state
    start_button = page.get_by_role("button", name=re.compile("Connect Wallet|Start Game"))
    expect(start_button).to_be_visible(timeout=20000)
    expect(start_button).to_be_enabled()

    page.screenshot(path="jules-scratch/verification/01_final_initial_state.png")

    # 2. Check that the info button is gone
    expect(page.get_by_role("button", name="How to play")).to_be_hidden()

    browser.close()

with sync_playwright() as playwright:
    run(playwright)