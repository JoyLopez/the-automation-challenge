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

        const locator = page.locator(selector);

        const result = await locator.evaluate(element => {

            const parent = element.parentElement;

            return {
                inputId: element.id,

                parentTag: parent?.tagName,

                parentText: parent?.innerText,

                parentHTML: parent?.outerHTML
            };
        });

        console.log('\n==============================');
        console.log(selector);
        console.log('==============================');

        console.log('Parent tag:', result.parentTag);
        console.log('Parent text:', result.parentText);

        console.log('Parent HTML:');
        console.log(result.parentHTML);
    }

    await page.waitForTimeout(60000);

    await browser.close();

})();