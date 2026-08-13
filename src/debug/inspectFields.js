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
    // LOGIN
    // --------------------------------------------------

    await page.getByRole('button', {
        name: 'SIGN UP OR LOGIN'
    }).click();

    console.log('Authentication modal opened.');

    await page.getByRole('button', {
        name: 'OR LOGIN',
        exact: true
    }).click();

    console.log('Login form opened.');

    // Find only visible login fields
    const emailField = page.locator(
        'input[placeholder="Email"]:visible'
    );

    const passwordField = page.locator(
        'input[type="password"][placeholder="Password"]:visible'
    );

    await emailField.fill(
        process.env.CHALLENGE_EMAIL
    );

    await passwordField.fill(
        process.env.CHALLENGE_PASSWORD
    );

    await page.getByRole('button', {
        name: 'LOG IN'
    }).click();

    console.log('Logged in.');

    await page.waitForTimeout(3000);

    // --------------------------------------------------
    // IMPORTANT:
    // DO NOT CLICK START
    // --------------------------------------------------

    console.log('');
    console.log('Start button detected:');

    const startButton = page.getByRole('button', {
        name: 'Start'
    });

    console.log(
        await startButton.isVisible()
    );

    console.log('');
    console.log('START WILL NOT BE CLICKED.');
    console.log('');

    // --------------------------------------------------
    // INSPECT VISIBLE INPUT FIELDS
    // --------------------------------------------------

    const inputs = page.locator(
        'input:visible'
    );

    const count = await inputs.count();

    console.log(
        `Visible input fields found: ${count}`
    );

    console.log('');
    console.log('========== INPUT DETAILS ==========');

    for (let i = 0; i < count; i++) {

        const input = inputs.nth(i);

        const id = await input.getAttribute('id');

        const type = await input.getAttribute('type');

        const placeholder =
            await input.getAttribute('placeholder');

        const name =
            await input.getAttribute('name');

        const value =
            await input.inputValue();

        console.log('');
        console.log(`INPUT ${i + 1}`);
        console.log('--------------------------');
        console.log('ID:', id);
        console.log('Type:', type);
        console.log('Placeholder:', placeholder);
        console.log('Name:', name);
        console.log('Current value:', value);

        // Get parent information
        const parent = input.locator('..');

        const parentText =
            await parent.innerText().catch(() => '');

        console.log('Parent text:', parentText);
    }

    console.log('');
    console.log('===================================');
    console.log('');
    console.log('Inspection completed.');
    console.log('Browser will remain open for 30 seconds.');

    await page.waitForTimeout(30000);

    await browser.close();

})();