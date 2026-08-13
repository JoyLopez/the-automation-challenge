require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env'),
  override: true
});

const path = require('path');
const { chromium } = require('playwright');

const ChallengePage = require('./pages/ChallengePage');

// --------------------------------------------------
// EXCEL READER
// --------------------------------------------------

const excelReader = require('./utils/excelReader');

const readExcel =
  typeof excelReader === 'function'
    ? excelReader
    : excelReader.readExcel;

if (typeof readExcel !== 'function') {
  throw new Error(
    'Could not load readExcel from src/utils/excelReader.js'
  );
}

// --------------------------------------------------
// PATHS
// --------------------------------------------------

const ENV_PATH = path.resolve(
  __dirname,
  '../.env'
);

const EXCEL_PATH = path.resolve(
  __dirname,
  '../data/test-data.xlsx'
);

// --------------------------------------------------
// ENVIRONMENT VARIABLES
// --------------------------------------------------

const CHALLENGE_URL =
  process.env.CHALLENGE_URL ||
  'https://www.theautomationchallenge.com/';

const CHALLENGE_EMAIL =
  process.env.CHALLENGE_EMAIL;

const CHALLENGE_PASSWORD =
  process.env.CHALLENGE_PASSWORD;

// --------------------------------------------------
// DISPLAY ENVIRONMENT
// --------------------------------------------------

console.log(
  `Loaded .env: ${ENV_PATH}`
);

console.log(
  `CHALLENGE_URL: ${
    CHALLENGE_URL || '[MISSING]'
  }`
);

console.log(
  `CHALLENGE_EMAIL: ${
    CHALLENGE_EMAIL || '[MISSING]'
  }`
);

console.log(
  `CHALLENGE_PASSWORD: ${
    CHALLENGE_PASSWORD
      ? '[SET]'
      : '[MISSING]'
  }`
);

// --------------------------------------------------
// VALIDATE ENVIRONMENT
// --------------------------------------------------

if (!CHALLENGE_URL) {
  throw new Error(
    'CHALLENGE_URL is missing.'
  );
}

if (!CHALLENGE_EMAIL) {
  throw new Error(
    'CHALLENGE_EMAIL is missing from .env.'
  );
}

if (!CHALLENGE_PASSWORD) {
  throw new Error(
    'CHALLENGE_PASSWORD is missing from .env.'
  );
}

// --------------------------------------------------
// VALIDATE URL
// --------------------------------------------------

let challengeUrl;

try {
  challengeUrl = new URL(CHALLENGE_URL).toString();
} catch (error) {
  throw new Error(
    `Invalid CHALLENGE_URL:\n${CHALLENGE_URL}`
  );
}

console.log(
  `\nChallenge URL: ${challengeUrl}`
);

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function printRow(row, title) {
  console.log(`\n${title}:`);

  console.log({
    employer_identification_number:
      row.employer_identification_number,

    company_name:
      row.company_name,

    sector:
      row.sector,

    company_address:
      row.company_address,

    automation_tool:
      row.automation_tool,

    annual_automation_saving:
      row.annual_automation_saving,

    date_of_first_project:
      row.date_of_first_project
  });
}

function validateRow(row, rowNumber) {
  const requiredFields = [
    'employer_identification_number',
    'company_name',
    'sector',
    'company_address',
    'automation_tool',
    'annual_automation_saving',
    'date_of_first_project'
  ];

  for (const field of requiredFields) {
    const value = row[field];

    if (
      value === undefined ||
      value === null ||
      String(value).trim() === ''
    ) {
      throw new Error(
        `Row ${rowNumber} is missing required field: ${field}`
      );
    }
  }
}

// --------------------------------------------------
// WAIT FOR PAGE TO BE READY
// --------------------------------------------------

async function waitForNextRow(
  challengePage,
  timeout = 30000
) {
  console.log(
    '\nWaiting for the next challenge row...'
  );

  const startTime = Date.now();

  while (
    Date.now() - startTime < timeout
  ) {
    try {
      /*
       * The challenge generates a new set of
       * input fields after submission.
       *
       * Re-discovering the fields is safer than
       * assuming the previous locators remain valid.
       */
      await challengePage.discoverFields();

      console.log(
        'Next row fields detected.'
      );

      return true;
    } catch {
      await challengePage.wait(500);
    }
  }

  throw new Error(
    'Timed out waiting for the next challenge row.'
  );
}

// --------------------------------------------------
// FILL AND VERIFY ROW
// --------------------------------------------------

async function fillAndVerifyRow(
  challengePage,
  row,
  rowNumber
) {
  console.log(
    '\n=========================================='
  );

  console.log(
    `FILLING ROW ${rowNumber}`
  );

  console.log(
    '=========================================='
  );

  /*
   * Rediscover fields immediately before filling.
   *
   * This is important because the challenge can
   * generate IDs such as:
   *
   * company_name_input_field_9
   * company_name_input_field_10
   *
   * etc.
   */

  console.log(
    '\nDiscovering current row fields...'
  );

  await challengePage.discoverFields();

  console.log(
    'Current row fields discovered.'
  );

  await challengePage.fillRow(row);

  console.log(
    `\nROW ${rowNumber} FILLED SUCCESSFULLY`
  );

  // ------------------------------------------------
  // VERIFY
  // ------------------------------------------------

  if (
    typeof challengePage.verifyRow ===
    'function'
  ) {
    console.log(
      `\nVerifying row ${rowNumber}...`
    );

    const verified =
      await challengePage.verifyRow(row);

    if (!verified) {
      throw new Error(
        `Row ${rowNumber} verification failed.`
      );
    }

    console.log(
      `ROW ${rowNumber} VERIFIED SUCCESSFULLY`
    );
  }

  return true;
}

// --------------------------------------------------
// SUBMIT ROW
// --------------------------------------------------

async function submitRow(
  challengePage,
  rowNumber
) {
  console.log(
    `\nSubmitting row ${rowNumber}...`
  );

  await challengePage.submit();

  console.log(
    `ROW ${rowNumber} SUBMITTED SUCCESSFULLY`
  );

  /*
   * Give the challenge time to process the
   * submission and generate the next row.
   */

  await challengePage.wait(1500);
}

// --------------------------------------------------
// MAIN
// --------------------------------------------------

(async () => {
  let browser = null;

  try {
    console.log(
      '\n=========================================='
    );

    console.log(
      'AUTOMATION CHALLENGE - SECOND ROW TEST'
    );

    console.log(
      '=========================================='
    );

    // ------------------------------------------------
    // READ EXCEL
    // ------------------------------------------------

    console.log(
      '\nReading Excel file...'
    );

    const rows = readExcel(
      EXCEL_PATH
    );

    if (!Array.isArray(rows)) {
      throw new Error(
        'Excel reader did not return an array.'
      );
    }

    if (rows.length < 2) {
      throw new Error(
        `At least 2 Excel rows are required. Found: ${rows.length}`
      );
    }

    console.log(
      `Excel rows found: ${rows.length}`
    );

    console.log(
      '\nFirst Excel record:'
    );

    console.log(rows[0]);

    console.log(
      `\nTotal rows: ${rows.length}`
    );

    const firstRow = rows[0];
    const secondRow = rows[1];

    validateRow(
      firstRow,
      1
    );

    validateRow(
      secondRow,
      2
    );

    printRow(
      firstRow,
      'First row'
    );

    printRow(
      secondRow,
      'Second row'
    );

    // ------------------------------------------------
    // START BROWSER
    // ------------------------------------------------

    console.log(
      '\nOpening challenge website...'
    );

    browser = await chromium.launch({
      headless: false
    });

    const context =
      await browser.newContext({
        viewport: {
          width: 1440,
          height: 900
        }
      });

    const page =
      await context.newPage();

    // ------------------------------------------------
    // PAGE OBJECT
    // ------------------------------------------------

    const challengePage =
      new ChallengePage(page);

    // ------------------------------------------------
    // OPEN WEBSITE
    // ------------------------------------------------

    console.log(
      'Navigating to challenge website...'
    );

    await challengePage.open(
      challengeUrl
    );

    console.log(
      'Website loaded.'
    );

    console.log(
      `Current URL: ${page.url()}`
    );

    // ------------------------------------------------
    // LOGIN
    // ------------------------------------------------

    console.log(
      '\nLogging in...'
    );

    await challengePage.login(
      CHALLENGE_EMAIL,
      CHALLENGE_PASSWORD
    );

    console.log(
      'Login completed.'
    );

    // ------------------------------------------------
    // WAIT FOR LOGIN OVERLAY
    // ------------------------------------------------

    console.log(
      'Waiting for greyout overlay...'
    );

    await challengePage.waitForGreyoutToDisappear();

    console.log(
      'Greyout overlay is hidden.'
    );

    // ------------------------------------------------
    // START CHALLENGE
    // ------------------------------------------------

    console.log(
      'Waiting for Start button...'
    );

    await challengePage.waitForStartButton();

    await challengePage.clickStart();

    console.log(
      'Challenge started.'
    );

    // ==================================================
    // ROW 1
    // ==================================================

    await fillAndVerifyRow(
      challengePage,
      firstRow,
      1
    );

    console.log(
      '\n=========================================='
    );

    console.log(
      'FIRST ROW READY FOR SUBMISSION'
    );

    console.log(
      '=========================================='
    );

    // ------------------------------------------------
    // SUBMIT ROW 1
    // ------------------------------------------------

    await submitRow(
      challengePage,
      1
    );

    // ==================================================
    // ROW 2
    // ==================================================

    console.log(
      '\n=========================================='
    );

    console.log(
      'MOVING TO SECOND ROW'
    );

    console.log(
      '=========================================='
    );

    /*
     * Wait until the challenge presents the
     * next set of fields.
     */

    await waitForNextRow(
      challengePage
    );

    /*
     * Fill and verify Excel row 2.
     */

    await fillAndVerifyRow(
      challengePage,
      secondRow,
      2
    );

    console.log(
      '\n=========================================='
    );

    console.log(
      'SECOND ROW FILLED AND VERIFIED'
    );

    console.log(
      '=========================================='
    );

    // ------------------------------------------------
    // SUBMIT ROW 2
    // ------------------------------------------------

    await submitRow(
      challengePage,
      2
    );

    // ------------------------------------------------
    // FINAL RESULT
    // ------------------------------------------------

    console.log(
      '\n=========================================='
    );

    console.log(
      'SECOND ROW TEST COMPLETE'
    );

    console.log(
      '=========================================='
    );

    console.log(
      '\nRow 1: PASS'
    );

    console.log(
      'Row 2: PASS'
    );

    console.log(
      '\nBoth Excel rows were successfully processed.'
    );

    console.log(
      'Browser will remain open for inspection.'
    );

    // ------------------------------------------------
    // KEEP BROWSER OPEN
    // ------------------------------------------------

    await new Promise(() => {});
  } catch (error) {
    console.log(
      '\n=========================================='
    );

    console.log(
      'STEP FAILED'
    );

    console.log(
      '=========================================='
    );

    console.error(error);

    if (browser) {
      console.log(
        '\nBrowser will remain open for inspection.'
      );

      await new Promise(() => {});
    }

    process.exitCode = 1;
  }
})();