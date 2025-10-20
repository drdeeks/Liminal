from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the running application
    page.goto("http://localhost:3000/")

    # Check if the "Hello, World!" heading is visible
    expect(page.get_by_role("heading", name="Hello, World!")).to_be_visible()

    print("Successfully rendered 'Hello, World!'")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
