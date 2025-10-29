
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        page.goto("http://localhost:5173")

        # Wait for the main "Connect Wallet" button to be visible
        connect_wallet_button = page.get_by_role("button", name="Connect Wallet")
        expect(connect_wallet_button).to_be_visible(timeout=10000)

        # Click the button to reveal the dropdown
        connect_wallet_button.click()

        # Wait for the dropdown to appear. A good way to do this is to wait for the
        # list `<ul>` that holds the connectors.
        connector_list = page.locator("ul")
        expect(connector_list).to_be_visible(timeout=5000)

        # Now, check that at least one connector button is visible inside the list.
        # This confirms the dropdown has opened and is populated.
        # We'll use a more generic locator to find any button inside the list.
        first_connector_button = connector_list.locator("button").first
        expect(first_connector_button).to_be_visible(timeout=5000)

        # Take a screenshot of the page with the dropdown open
        page.screenshot(path="jules-scratch/verification/verification.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
