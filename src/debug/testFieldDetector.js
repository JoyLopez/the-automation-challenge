const { chromium } = require('playwright');
const { ChallengePage } =
    require('./pages/ChallengePage');

(async () => {

    const browser = await chromium.launch({
        headless: false
    });

    const page = await browser.newPage();

    await page.goto(
        'https://www.theautomationchallenge.com/'
    );

    const challengePage =
        new ChallengePage(page);

    console.log(
        'Discovering fields...'
    );

    const fields =
        await challengePage.discoverFields();

    console.log(
        'Company Name:',
        await fields.company_name.getAttribute('id')
    );

    console.log(
        'Address:',
        await fields.company_address.getAttribute('id')
    );

    console.log(
        'EIN:',
        await fields.employer_identification_number
            .getAttribute('id')
    );

    console.log(
        'Sector:',
        await fields.sector.getAttribute('id')
    );

    console.log(
        'Automation Tool:',
        await fields.automation_tool
            .getAttribute('id')
    );

    console.log(
        'Annual Saving:',
        await fields.annual_automation_saving
            .getAttribute('id')
    );

    console.log(
        'Date:',
        await fields.date_of_first_project
            .getAttribute('id')
    );

    console.log(
        'Dynamic field detection successful!'
    );

    await page.waitForTimeout(30000);

    await browser.close();

})();