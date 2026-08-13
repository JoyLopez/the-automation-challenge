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

    // Find each field using the selectors discovered
    // through Playwright Codegen.
    const fields = {
        companyName: '#company_name_input_field_1',
        address: '#address_input_field_1',
        ein: '#ein_input_field_1',
        sector: '#sector_input_field_1',
        automationTool: '#automation_tool_input_field_1',
        annualSaving: '#annual_saving_input_field_1',
        date: '#date_input_field_1'
    };

    for (const [name, selector] of Object.entries(fields)) {

        const locator = page.locator(selector);

        console.log(
            `${name}: ${await locator.count()} element(s)`
        );
    }

    // Keep browser open so we can inspect the page.
    await page.waitForTimeout(60000);

    await browser.close();

})();