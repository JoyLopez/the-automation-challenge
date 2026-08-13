const { chromium } = require('playwright');

(async () => {

    const browser = await chromium.launch({
        headless: false
    });

    const page = await browser.newPage();

    await page.goto(
        'https://www.theautomationchallenge.com/'
    );

    console.log('Page loaded.');

    /*
     * Find all visible input elements.
     */
    const inputs = page.locator(
        'input:not([type="hidden"])'
    );

    const count = await inputs.count();

    console.log(`Found ${count} visible input candidates.`);

    /*
     * Inspect each input and read the text
     * from its parent container.
     */
    for (let i = 0; i < count; i++) {

        const input = inputs.nth(i);

        if (!(await input.isVisible())) {
            continue;
        }

        const information =
            await input.evaluate(element => {

                const parent =
                    element.parentElement;

                return {
                    id: element.id,
                    parentText:
                        parent?.innerText?.trim() || ''
                };
            });

        console.log(
            `Input ${i}:`,
            information
        );
    }

    await page.waitForTimeout(60000);

    await browser.close();

})();