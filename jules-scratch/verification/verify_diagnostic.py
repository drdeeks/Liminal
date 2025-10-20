from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the running application
    page.goto("http://localhost:3000/")

    # Wait for the diagnostic component to be visible
    expect(page.get_by_text("React Rendering Diagnostics")).to_be_visible()

    # Take a screenshot of the diagnostic component
    page.screenshot(path="jules-scratch/verification/diagnostic_output.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
