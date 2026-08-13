require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env'),
  override: true
});

const path = require('path');
const { chromium } = require('playwright');

const ChallengePage = require('./pages/ChallengePage');
const excelReader = require('./utils/excelReader');

// --------------------------------------------------
// EXCEL READER
// --------------------------------------------------

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
// ENVIRONMENT
// --------------------------------------------------

const CHALLENGE_URL =
  process.env.CHALLENGE_URL ||
  'https://www.theautomationchallenge.com/';

const CHALLENGE_EMAIL =
  process.env.CHALLENGE_EMAIL;

const CHALLENGE_PASSWORD =
  process.env.CHALLENGE_PASSWORD;

// --------------------------------------------------
// VALIDATE ENVIRONMENT
// --------------------------------------------------

console.log(
  `Loaded .env: ${ENV_PATH}`
);

console.log(
  `CHALLENGE_URL: ${CHALLENGE_URL}`
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

if (!CHALLENGE_EMAIL) {
  throw new Error(
    'CHALLENGE_EMAIL is missing from .env'
  );
}

if (!CHALLENGE_PASSWORD) {
  throw new Error(
    'CHALLENGE_PASSWORD is missing from .env'
  );
}

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

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
        `Row ${rowNumber} is missing field: ${field}`
      );
    }
  }
}

function printRow(row, rowNumber) {
  console.log(
    `\nRow ${rowNumber}:`
  );

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

// --------------------------------------------------
// MAIN
// --------------------------------------------------

(async () => {
  let browser = null;

  const results = [];

  try {
    console.log('\n==========================================');
    console.log('AUTOMATION CHALLENGE - FULL 50 ROW TEST');
    console.log('==========================================');

    // ------------------------------------------------
    // READ EXCEL
    // ------------------------------------------------

    console.log('\nReading Excel file...');

    const rows = readExcel(EXCEL_PATH);

    if (!Array.isArray(rows)) {
      throw new Error(
        'Excel reader did not return an array.'
      );
    }

    if (rows.length !== 50) {
      console.log(
        `WARNING: Expected 50 rows, found ${rows.length}.`
      );
    }

    console.log(
      `Excel rows loaded: ${rows.length}`
    );

    // Validate every row before opening browser.
    for (let i = 0; i < rows.length; i++) {
      validateRow(rows[i], i + 1);
    }

    console.log(
      'All Excel rows validated successfully.'
    );

    // ------------------------------------------------
    // OPEN BROWSER
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

    await challengePage.open(
      CHALLENGE_URL
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
    // WAIT FOR OVERLAY
    // ------------------------------------------------

    await challengePage
      .waitForGreyoutToDisappear();

    // ------------------------------------------------
    // START CHALLENGE
    // ------------------------------------------------

    console.log(
      '\nWaiting for Start button...'
    );

    await challengePage.clickStart();

    console.log(
      'Challenge started.'
    );

    // ------------------------------------------------
    // IMPORTANT:
    // TIMER STARTS AFTER CLICKING START
    // ------------------------------------------------

    const challengeStartTime =
      Date.now();

    console.log(
      '\n=========================================='
    );

    console.log(
      'CHALLENGE TIMER STARTED'
    );

    console.log(
      '=========================================='
    );

    // ------------------------------------------------
    // PROCESS ALL EXCEL ROWS
    // ------------------------------------------------

    for (
      let i = 0;
      i < rows.length;
      i++
    ) {
      const rowNumber = i + 1;
      const row = rows[i];

      console.log(
        '\n=========================================='
      );

      console.log(
        `PROCESSING ROW ${rowNumber} OF ${rows.length}`
      );

      console.log(
        '=========================================='
      );

      printRow(
        row,
        rowNumber
      );

      try {
        // --------------------------------------------
        // DYNAMIC FIELD DISCOVERY
        // --------------------------------------------

        console.log(
          '\nDiscovering current row fields...'
        );

        await challengePage.discoverFields();

        console.log(
          'Current row fields discovered.'
        );

        // --------------------------------------------
        // FILL
        // --------------------------------------------

        await challengePage.fillRow(
          row
        );

        console.log(
          `ROW ${rowNumber} FILLED SUCCESSFULLY`
        );

        // --------------------------------------------
        // VERIFY
        // --------------------------------------------

        console.log(
          `\nVerifying row ${rowNumber}...`
        );

        const verified =
          await challengePage.verifyRow(
            row
          );

        if (!verified) {
          throw new Error(
            `Row ${rowNumber} verification failed.`
          );
        }

        console.log(
          `ROW ${rowNumber} VERIFIED SUCCESSFULLY`
        );

        // --------------------------------------------
        // SUBMIT
        // --------------------------------------------

        console.log(
          `\nSubmitting row ${rowNumber}...`
        );

        await challengePage.submit();

        console.log(
          `ROW ${rowNumber} SUBMITTED SUCCESSFULLY`
        );

        results.push({
          row: rowNumber,
          status: 'PASS'
        });

        // --------------------------------------------
        // WAIT FOR NEXT ROW
        // --------------------------------------------

        if (
          rowNumber < rows.length
        ) {
          console.log(
            '\nWaiting for next challenge row...'
          );

          await page.waitForTimeout(300);

          console.log(
            'Ready for next row.'
          );
        }

      } catch (rowError) {
        results.push({
          row: rowNumber,
          status: 'FAIL',
          error: rowError.message
        });

        console.error(
          `\nROW ${rowNumber} FAILED`
        );

        console.error(
          rowError
        );

        throw rowError;
      }
    }

    // ------------------------------------------------
    // STOP TIMER
    // ------------------------------------------------

    const elapsedMilliseconds =
      Date.now() -
      challengeStartTime;

    const elapsedSeconds =
      elapsedMilliseconds / 1000;

    // ------------------------------------------------
    // FINAL RESULTS
    // ------------------------------------------------

    const passedRows =
      results.filter(
        result =>
          result.status === 'PASS'
      ).length;

    const failedRows =
      results.filter(
        result =>
          result.status === 'FAIL'
      ).length;

    console.log(
      '\n=========================================='
    );

    console.log(
      'AUTOMATION CHALLENGE COMPLETE'
    );

    console.log(
      '=========================================='
    );

    console.log(
      `Rows processed: ${results.length}`
    );

    console.log(
      `Rows passed:    ${passedRows}`
    );

    console.log(
      `Rows failed:    ${failedRows}`
    );

    console.log(
      `Challenge time: ${elapsedSeconds.toFixed(2)} seconds`
    );

    console.log(
      `Time limit:     240 seconds`
    );

    console.log(
      `Accuracy: ${
        passedRows === rows.length
          ? '100%'
          : `${(
              (passedRows / rows.length) *
              100
            ).toFixed(2)}%`
      }`
    );

    // ------------------------------------------------
    // PERFORMANCE CHECK
    // ------------------------------------------------

    if (
      elapsedSeconds >= 240
    ) {
      throw new Error(
        `Challenge exceeded the 4-minute limit: ${elapsedSeconds.toFixed(2)} seconds`
      );
    }

    // ------------------------------------------------
    // ACCURACY CHECK
    // ------------------------------------------------

    if (
      passedRows !== rows.length
    ) {
      throw new Error(
        `Not all rows passed. Passed ${passedRows}/${rows.length}.`
      );
    }

    console.log(
      '\n=========================================='
    );

    console.log(
      'FINAL RESULT: PASS'
    );

    console.log(
      '100% of Excel rows processed successfully.'
    );

    console.log(
      'Challenge completed within 4 minutes.'
    );

    console.log(
      '=========================================='
    );

    // ------------------------------------------------
    // KEEP BROWSER OPEN FOR NOW
    // ------------------------------------------------

    console.log(
      '\nBrowser will remain open for inspection.'
    );

    await new Promise(() => {});

  } catch (error) {

    console.log(
      '\n=========================================='
    );

    console.log(
      'AUTOMATION CHALLENGE FAILED'
    );

    console.log(
      '=========================================='
    );

    console.error(error);

    console.log(
      '\nBrowser will remain open for inspection.'
    );

    if (browser) {
      await new Promise(() => {});
    }

    process.exitCode = 1;
  }
})();