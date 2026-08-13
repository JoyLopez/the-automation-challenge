const { chromium } = require('playwright');
const { ChallengePage } = require('./pages/ChallengePage');
require('dotenv').config();

(async () => {
    const browser = await chromium.launch({
        headless: false
    });

    const page = await browser.newPage();

    try {
        console.log('Opening challenge website...');

        await page.goto(
            'https://www.theautomationchallenge.com/',
            { waitUntil: 'domcontentloaded' }
        );

        const challengePage =
            new ChallengePage(page);

        await challengePage.login(
            process.env.CHALLENGE_EMAIL,
            process.env.CHALLENGE_PASSWORD
        );

        await challengePage.startChallenge();

        console.log('\n========== BUTTON INSPECTION ==========\n');

        const buttons = page.locator('button');
        const count = await buttons.count();

        console.log(`Buttons found: ${count}`);

        for (let i = 0; i < count; i++) {
            const button = buttons.nth(i);

            if (!(await button.isVisible().catch(() => false))) {
                continue;
            }

            const info = await button.evaluate(element => ({
                text: element.innerText?.trim(),
                id: element.id,
                className: element.className,
                type: element.type,
                ariaLabel: element.getAttribute('aria-label'),
                title: element.getAttribute('title')
            }));

            console.log(`\nBUTTON ${i + 1}`);
            console.log(info);
        }

        console.log('\n========================================');
        console.log('Browser will remain open for 30 seconds.');

        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('Inspection failed:');
        console.error(error);
    } finally {
        await browser.close();
    }
})();