const { chromium } = require('playwright');
require('dotenv').config();

const {
    ChallengePage
} = require('./pages/ChallengePage');

(async () => {

    const browser =
        await chromium.launch({
            headless: false
        });

    const page =
        await browser.newPage();

    await page.goto(
        'https://www.theautomationchallenge.com/',
        {
            waitUntil: 'domcontentloaded'
        }
    );

    const challengePage =
        new ChallengePage(page);

    await challengePage.login(
        process.env.CHALLENGE_EMAIL,
        process.env.CHALLENGE_PASSWORD
    );

    await challengePage.startChallenge();

    console.log(
        '\n========== FIELDS AFTER START ==========\n'
    );

    const inputs =
        page.locator(
            'input:not([type="hidden"])'
        );

    const count =
        await inputs.count();

    console.log(
        `Visible inputs: ${count}`
    );

    for (let i = 0; i < count; i++) {

        const input = inputs.nth(i);

        if (!(await input.isVisible())) {
            continue;
        }

        const information =
            await input.evaluate(element => {

                const ancestors = [];

                let current = element;

                for (
                    let level = 0;
                    level < 5 && current;
                    level++
                ) {

                    ancestors.push({
                        level,
                        tag: current.tagName,
                        text:
                            current.innerText
                                ?.trim() || '',
                        id:
                            current.id || '',
                        class:
                            current.className || ''
                    });

                    current =
                        current.parentElement;
                }

                return {
                    id: element.id || null,
                    type: element.type,
                    value: element.value,
                    ancestors
                };
            });

        console.log(
            JSON.stringify(
                information,
                null,
                2
            )
        );
    }

    console.log(
        '\n========================================'
    );

    console.log(
        'Browser will remain open for 30 seconds.'
    );

    await page.waitForTimeout(30000);

    await browser.close();

})();