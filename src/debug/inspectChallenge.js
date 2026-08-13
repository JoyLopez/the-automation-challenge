require('dotenv').config();

const { chromium } = require('playwright');

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

    // --------------------------------------------------
    // 1. Open authentication modal
    // --------------------------------------------------

    await page.getByRole('button', {
        name: 'SIGN UP OR LOGIN'
    }).click();

    console.log('Authentication modal opened.');

    // --------------------------------------------------
    // 2. Switch from Sign Up to Login
    // --------------------------------------------------

    await page.getByRole('button', {
        name: 'OR LOGIN',
        exact: true
    }).click();

    console.log('Login form opened.');

    // --------------------------------------------------
    // 3. Find the VISIBLE login fields
    // --------------------------------------------------

    const emailField = page.locator(
        'input[placeholder="Email"]:visible'
    );

    const passwordField = page.locator(
        'input[type="password"][placeholder="Password"]:visible'
    );

    console.log(
        'Visible email fields:',
        await emailField.count()
    );

    console.log(
        'Visible password fields:',
        await passwordField.count()
    );

    // --------------------------------------------------
    // 4. Fill login credentials
    // --------------------------------------------------

    console.log('Entering email...');

    await emailField.fill(
        process.env.CHALLENGE_EMAIL
    );

    console.log('Entering password...');

    await passwordField.fill(
        process.env.CHALLENGE_PASSWORD
    );

    console.log('Credentials entered.');

    // --------------------------------------------------
    // 5. Click LOG IN
    // --------------------------------------------------

    await page.getByRole('button', {
        name: 'LOG IN'
    }).click();

    console.log('LOG IN clicked.');

    // Give the website time to process login
    await page.waitForTimeout(3000);

    console.log(
        'Current URL:',
        page.url()
    );

    // --------------------------------------------------
    // 6. Check Start button
    // --------------------------------------------------

    const startButton = page.getByRole('button', {
        name: 'Start'
    });

    const startVisible =
        await startButton.isVisible().catch(() => false);

    console.log(
        'Start button visible:',
        startVisible
    );

    console.log('');
    console.log('DO NOT CLICK START YET.');
    console.log('Browser will stay open for inspection.');

    await page.waitForTimeout(30000);

    await browser.close();

})();