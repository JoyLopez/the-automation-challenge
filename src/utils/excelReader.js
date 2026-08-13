const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Read Excel test data.
 *
 * @param {string} filePath - Path to the Excel file
 * @returns {Array<Object>} Excel rows
 */
function readExcel(filePath) {
  if (!filePath) {
    throw new Error('Excel file path is required.');
  }

  const absolutePath = path.resolve(filePath);

  console.log(`Reading Excel file...`);
  console.log(`Excel file: ${absolutePath}`);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(
      `Excel file not found:\n${absolutePath}`
    );
  }

  let workbook;

  try {
    workbook = XLSX.readFile(absolutePath, {
      cellDates: false,
      raw: false
    });
  } catch (error) {
    throw new Error(
      `Unable to read Excel file:\n${error.message}`
    );
  }

  if (
    !workbook ||
    !workbook.SheetNames ||
    workbook.SheetNames.length === 0
  ) {
    throw new Error(
      'The Excel workbook does not contain any worksheets.'
    );
  }

  const sheetName = workbook.SheetNames[0];

  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(
      `Unable to find worksheet: ${sheetName}`
    );
  }

  const rows = XLSX.utils.sheet_to_json(
    worksheet,
    {
      defval: '',
      raw: false
    }
  );

  console.log(`Excel rows found: ${rows.length}`);

  if (rows.length > 0) {
    console.log('\nFirst Excel record:');
    console.log(rows[0]);
  }

  return rows;
}

// --------------------------------------------------
// EXPORT
// --------------------------------------------------

// Default/CommonJS export
module.exports = readExcel;

// Named export compatibility
module.exports.readExcel = readExcel;