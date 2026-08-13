const { chromium } = require('playwright');
const XLSX = require('xlsx');
require('dotenv').config();

const {
    ChallengePage
} = require('./pages/ChallengePage');


/**
 * Read Excel data.
 */
function readExcelData() {

    console.log(
        'Reading Excel file...'
    );

    const workbook =
        XLSX.readFile(
            './data/test-data.xlsx'
        );

    const sheetName =
        workbook.SheetNames[0];

    const worksheet =
        workbook.Sheets[sheetName];

    const rows =
        XLSX.utils.sheet_to_json(
            worksheet,
            {
                defval: ''
            }
        );

    console.log(
        `Excel rows found: ${rows.length}`
    );

    if (rows.length === 0) {

        throw new Error(
            'Excel file contains no data.'
        );
    }

    console.log(
        'First Excel record:'
    );

    console.log(rows[0]);

    /*
     * The challenge requires exactly 50 rows.
     */
    if (rows.length !== 50) {

        throw new Error(
            `Expected 50 Excel rows but found ${rows.length}.`
        );
    }

    return rows;
}


/**
 * Main automation.
 */
(async () => {

    let browser;

    try {

        /*
         * Validate credentials before opening
         * the browser.
         */
        if (
            !process.env.CHALLENGE_EMAIL ||
            !process.env.CHALLENGE_PASSWORD
        ) {

            throw new Error(
                'CHALLENGE_EMAIL or CHALLENGE_PASSWORD is missing from .env'
            );
        }

        /*
         * Read Excel.
         */
        const rows =
            readExcelData();

        /*
         * Launch browser.
         */
        browser =
            await chromium.launch({

                headless: false
            });

        const page =
            await browser.newPage();

        /*
         * Give the page enough viewport space
         * for the challenge.
         */
        await page.setViewportSize({
            width: 1440,
            height: 900
        });

        console.log(
            'Opening challenge website...'
        );

        await page.goto(
            'https://www.theautomationchallenge.com/',
            {
                waitUntil: 'domcontentloaded'
            }
        );

        console.log(
            'Website loaded.'
        );

        /*
         * Create Page Object.
         */
        const challengePage =
            new ChallengePage(page);

        /*
         * Login.
         */
        await challengePage.login(
            process.env.CHALLENGE_EMAIL,
            process.env.CHALLENGE_PASSWORD
        );

        console.log(
            'Login completed.'
        );

        /*
         * Start the challenge.
         */
        await challengePage.startChallenge();

        /*
         * IMPORTANT:
         *
         * We are intentionally testing only
         * the Start + dynamic field discovery
         * at this stage.
         *
         * We will add Submit handling once we
         * identify the actual Submit element.
         */
        console.log(
            'Discovering fields after Start...'
        );

        const fields =
            await challengePage.discoverFields();

        console.log(
            'All seven dynamic fields detected.'
        );

        /*
         * Test the first Excel row only.
         *
         * DO NOT submit yet.
         */
        console.log(
            'Testing first Excel row...'
        );

        await challengePage.fillRow(
            rows[0]
        );

        console.log(
            '================================'
        );

        console.log(
            'FIRST ROW FILLED SUCCESSFULLY'
        );

        console.log(
            '================================'
        );

        console.log(
            'Automation paused before Submit.'
        );

        /*
         * Keep browser open for inspection.
         */
        await page.waitForTimeout(
            30000
        );

    } catch (error) {

        console.error(
            'Automation failed:'
        );

        console.error(error);

        /*
         * Keep browser open briefly so the
         * failure can be inspected.
         */
        if (browser) {

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        10000
                    )
            );
        }

        process.exitCode = 1;

    } finally {

        if (browser) {

            await browser.close();
        }
    }

})();