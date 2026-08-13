/**
 * Dynamically discovers the seven challenge input fields.
 *
 * We intentionally do NOT depend on the input IDs because
 * the challenge changes the fields after every submission.
 *
 * Instead, we inspect the text associated with each visible input.
 */

async function detectChallengeFields(page) {

    const inputs = page.locator(
        'input:visible'
    );

    const count = await inputs.count();

    const fields = {};

    for (let i = 0; i < count; i++) {

        const input = inputs.nth(i);

        const type = await input.getAttribute('type');

        // Ignore login-related fields.
        if (
            type === 'email' ||
            type === 'password' ||
            type === 'checkbox'
        ) {
            continue;
        }

        // Get text from the input's parent.
        const parent = input.locator('..');

        const parentText =
            (await parent.innerText().catch(() => ''))
                .trim();

        const label = parentText
            .split('\n')[0]
            .trim()
            .toLowerCase();

        console.log(
            `Detected input ${i + 1}: "${label}"`
        );

        // Map the visible label to the Excel column.
        if (label === 'company name') {
            fields.companyName = input;
        }

        else if (label === 'address') {
            fields.address = input;
        }

        else if (label === 'ein') {
            fields.ein = input;
        }

        else if (label === 'sector') {
            fields.sector = input;
        }

        else if (label === 'automation tool') {
            fields.automationTool = input;
        }

        else if (label === 'annual saving') {
            fields.annualSaving = input;
        }

        else if (label === 'date') {
            fields.date = input;
        }
    }

    // Verify that all seven fields were found.
    const requiredFields = [
        'companyName',
        'address',
        'ein',
        'sector',
        'automationTool',
        'annualSaving',
        'date'
    ];

    const missingFields =
        requiredFields.filter(
            field => !fields[field]
        );

    if (missingFields.length > 0) {

        throw new Error(
            `Could not find challenge fields: ${missingFields.join(', ')}`
        );
    }

    return fields;
}

module.exports = {
    detectChallengeFields
};