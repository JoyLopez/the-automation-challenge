require('dotenv').config();

const { chromium } = require('playwright');
const { LoginPage } = require('./pages/LoginPage');

(async () => {

    const browser = await chromium.launch({
        headless: false
    });

    const page = await browser.newPage();

    console.log('Opening challenge website...');

    await page.goto(
        'https://www.theautomationchallenge.com/',
        {
            waitUntil: 'domcontentloaded'
        }
    );

    console.log('Website loaded.');

    const loginPage = new LoginPage(page);

    // Open SIGN UP / LOGIN modal
    console.log('Opening authentication modal...');

    await loginPage.openAuthenticationModal();

    // Switch from SIGN UP to LOGIN
    console.log('Switching to login form...');

    await loginPage.switchToLogin();

    // Make sure credentials exist
    if (
        !process.env.CHALLENGE_EMAIL ||
        !process.env.CHALLENGE_PASSWORD
    ) {
        throw new Error(
            'CHALLENGE_EMAIL or CHALLENGE_PASSWORD is missing from .env'
        );
    }

    console.log('Entering login credentials...');

    await loginPage.login(
        process.env.CHALLENGE_EMAIL,
        process.env.CHALLENGE_PASSWORD
    );

    console.log('Login button clicked.');

    // Give the website time to process authentication.
    await page.waitForTimeout(3000);

    console.log(
        'Current URL:',
        page.url()
    );

    console.log(
        'Login test completed.'
    );

    // Keep browser open for inspection.
    await page.waitForTimeout(10000);

    await browser.close();

})();