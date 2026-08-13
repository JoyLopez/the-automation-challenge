const { chromium } = require('playwright');
require('dotenv').config();

const {
    ChallengePage
} = require('./pages/ChallengePage');

(async () => {

    const browser = await chromium.launch({
        headless: false
    });

    const page = await browser.newPage();

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

    const challengePage =
        new ChallengePage(page);

    await challengePage.login(
        process.env.CHALLENGE_EMAIL,
        process.env.CHALLENGE_PASSWORD
    );

    console.log(
        'Login completed.'
    );

    // Check greyout overlay.
    const greyout =
        page.locator('.greyout');

    console.log(
        'Greyout count:',
        await greyout.count()
    );

    console.log(
        'Greyout visible:',
        await greyout.isVisible().catch(() => false)
    );

    // Check Start button.
    const startButton =
        page.getByRole('button', {
            name: 'Start',
            exact: true
        });

    console.log(
        'Start button visible:',
        await startButton.isVisible()
    );

    // Print visible elements that might be modal-related.
    const visibleDialogs =
        page.locator(
            '[role="dialog"]:visible'
        );

    console.log(
        'Visible dialogs:',
        await visibleDialogs.count()
    );

    console.log(
        '\nBrowser will remain open for 30 seconds.'
    );

    await page.waitForTimeout(30000);

    await browser.close();

})();