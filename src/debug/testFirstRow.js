require('dotenv').config();

const { chromium } = require('playwright');

const { ChallengePage } =
    require('./pages/ChallengePage');

const { readExcel } =
    require('./utils/excelReader');

(async () => {

    let browser;

    try {

        console.log('Reading Excel file...');

        const rows = readExcel();

        console.log(`Excel rows found: ${rows.length}`);

        if (rows.length === 0) {
            throw new Error(
                'No data found in Excel file.'
            );
        }

        const firstRow = rows[0];

        console.log('\nFirst Excel record:');
        console.log(firstRow);

        console.log('\nOpening challenge website...');

        browser = await chromium.launch({
            headless: false
        });

        const page = await browser.newPage();

        const challengePage =
            new ChallengePage(page);

        await page.goto(
            'https://www.theautomationchallenge.com/',
            {
                waitUntil: 'domcontentloaded'
            }
        );

        console.log('Website loaded.');

        // ==========================================
        // LOGIN
        // ==========================================

        console.log('Opening authentication modal...');

        await challengePage.openAuthentication();

        console.log('Authentication modal opened.');

        await challengePage.openLoginForm();

        console.log('Login form opened.');

        await challengePage.login(
            process.env.CHALLENGE_EMAIL,
            process.env.CHALLENGE_PASSWORD
        );

        console.log('Login successful.');

        // ==========================================
        // START CHALLENGE
        // ==========================================

        console.log('Waiting for greyout overlay...');

        await challengePage.waitForGreyoutToDisappear();

        console.log('Greyout overlay is hidden.');

        console.log('Start button is visible.');

        await challengePage.startChallenge();

        console.log('Challenge started.');

        // ==========================================
        // DISCOVER FIELDS
        // ==========================================

        console.log('\nDiscovering fields...');

        const fields =
            await challengePage.discoverFields();

        console.log('All seven fields discovered.');

        // ==========================================
        // FILL FIRST ROW
        // ==========================================

        console.log('\nFilling first Excel row...');

        await fields.company_name.fill(
            String(firstRow.company_name)
        );

        await fields.company_address.fill(
            String(firstRow.company_address)
        );

        await fields.employer_identification_number.fill(
            String(
                firstRow.employer_identification_number
            )
        );

        await fields.sector.fill(
            String(firstRow.sector)
        );

        await fields.automation_tool.fill(
            String(firstRow.automation_tool)
        );

        await fields.annual_automation_saving.fill(
            String(
                firstRow.annual_automation_saving
            )
        );

        await fields.date_of_first_project.fill(
            String(
                firstRow.date_of_first_project
            )
        );

        console.log('\n==========================================');
        console.log('FIRST ROW FILLED SUCCESSFULLY');
        console.log('==========================================');

        console.log('\nValues entered:');

        console.log(
            'Company Name:',
            firstRow.company_name
        );

        console.log(
            'Address:',
            firstRow.company_address
        );

        console.log(
            'EIN:',
            firstRow.employer_identification_number
        );

        console.log(
            'Sector:',
            firstRow.sector
        );

        console.log(
            'Automation Tool:',
            firstRow.automation_tool
        );

        console.log(
            'Annual Saving:',
            firstRow.annual_automation_saving
        );

        console.log(
            'Date:',
            firstRow.date_of_first_project
        );

        console.log(
            '\nDO NOT CLICK SUBMIT YET.'
        );

        console.log(
            'Browser will remain open for inspection.'
        );

        await page.waitForTimeout(30000);

    } catch (error) {

        console.error(
            '\n=========================================='
        );

        console.error(
            'FIRST ROW TEST FAILED'
        );

        console.error(
            '=========================================='
        );

        console.error(error);

    } finally {

        if (browser) {
            await browser.close();
        }
    }

})();