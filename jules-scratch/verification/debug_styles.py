from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the running application
    page.goto("http://localhost:3000/")

    # Give the page a moment to load
    page.wait_for_timeout(2000)

    # Execute the provided JavaScript snippet
    result = page.evaluate("""() => {
        const btn = document.getElementById('start-game');
        if (!btn) {
            return { exists: false };
        }

        const styles = window.getComputedStyle(btn);
        return {
            exists: true,
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            position: styles.position,
            zIndex: styles.zIndex,
            boundingRect: btn.getBoundingClientRect().toJSON()
        };
    }""")

    print(result)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
