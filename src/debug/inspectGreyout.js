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

    /*
     * Login manually through our page object.
     */
    await challengePage.login(
        process.env.CHALLENGE_EMAIL,
        process.env.CHALLENGE_PASSWORD
    );

    console.log(
        'Login completed.'
    );

    /*
     * Find the greyout element.
     */
    const greyout =
        page.locator('.greyout');

    console.log(
        '\n========== GREYOUT INSPECTION =========='
    );

    console.log(
        'Count:',
        await greyout.count()
    );

    console.log(
        'Visible:',
        await greyout.isVisible()
    );

    /*
     * Get the actual HTML of the greyout element.
     */
    if (await greyout.count() > 0) {

        const html =
            await greyout.first().evaluate(
                element => element.outerHTML
            );

        console.log(
            '\nGreyout HTML:'
        );

        console.log(html);

        /*
         * Get important CSS information.
         */
        const styles =
            await greyout.first().evaluate(
                element => {

                    const style =
                        window.getComputedStyle(
                            element
                        );

                    return {
                        display: style.display,
                        visibility: style.visibility,
                        opacity: style.opacity,
                        position: style.position,
                        zIndex: style.zIndex,
                        pointerEvents:
                            style.pointerEvents,
                        width: style.width,
                        height: style.height
                    };
                }
            );

        console.log(
            '\nGreyout CSS:'
        );

        console.log(styles);

        /*
         * Find the element underneath the center
         * of the Start button.
         */
        const startButton =
            page.getByRole('button', {
                name: 'Start',
                exact: true
            });

        const box =
            await startButton.boundingBox();

        console.log(
            '\nStart button bounding box:'
        );

        console.log(box);

        if (box) {

            const centerX =
                box.x + box.width / 2;

            const centerY =
                box.y + box.height / 2;

            const elementAtPoint =
                await page.evaluate(
                    ({ x, y }) => {

                        const element =
                            document.elementFromPoint(
                                x,
                                y
                            );

                        if (!element) {
                            return null;
                        }

                        return {
                            tagName:
                                element.tagName,

                            id:
                                element.id,

                            className:
                                element.className,

                            text:
                                element.innerText
                        };
                    },
                    {
                        x: centerX,
                        y: centerY
                    }
                );

            console.log(
                '\nElement blocking Start:'
            );

            console.log(elementAtPoint);
        }
    }

    console.log(
        '\n=========================================='
    );

    console.log(
        'Browser will remain open for 30 seconds.'
    );

    await page.waitForTimeout(30000);

    await browser.close();

})();