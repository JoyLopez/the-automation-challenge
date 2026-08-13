const { chromium } = require('playwright');

(async () => {

    const browser = await chromium.launch({
        headless: false
    });

    const page = await browser.newPage();

    await page.goto(
        'https://www.theautomationchallenge.com/'
    );

    const selectors = [
        '#company_name_input_field_1',
        '#address_input_field_1',
        '#ein_input_field_1',
        '#sector_input_field_1',
        '#automation_tool_input_field_1',
        '#annual_saving_input_field_1',
        '#date_input_field_1'
    ];

    for (const selector of selectors) {

        const locator =
            page.locator(selector);

        const information =
            await locator.evaluate(element => {

                return {
                    tagName: element.tagName,
                    type: element.getAttribute('type'),
                    id: element.getAttribute('id'),
                    name: element.getAttribute('name'),
                    placeholder:
                        element.getAttribute('placeholder'),
                    ariaLabel:
                        element.getAttribute('aria-label'),
                    class:
                        element.getAttribute('class')
                };
            });

        console.log('\n-------------------------');
        console.log(selector);
        console.log(information);
    }

    await page.waitForTimeout(60000);

    await browser.close();

})();