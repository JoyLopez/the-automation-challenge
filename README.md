# QA Automation Technical Test

## Playwright + Node.js + Excel Data Automation

A Playwright-based end-to-end automation solution developed as part of a **QA Automation Engineer technical assessment** for **The Automation Challenge**.

The implementation demonstrates practical experience with:

* Browser automation using Playwright and Node.js
* Data-driven testing using Excel
* Dynamic form field detection
* Context-based field mapping
* Page Object Model (POM)
* Pre- and post-action validation
* Dynamic UI handling
* Authentication flow handling
* Error handling
* Performance measurement
* Maintainable test automation architecture

**Target Application:**
https://www.theautomationchallenge.com/

---

# 🎥 Automation Demo

Full 50-row Playwright automation execution demonstrating:

* Authentication
* Challenge initialization
* Dynamic field discovery
* Excel-driven data entry
* Field validation
* Record submission
* Dynamic UI handling
* Final execution results

**[▶️ Watch the Full Automation Test Video](https://drive.google.com/file/d/1kPEyD22C2ZdF2xmhiyWaXkEN0Vy4bFLZ/view?usp=drive_link)**

---

# 1. Objective

The objective of this technical assessment is to demonstrate the ability to develop a reliable, maintainable, and efficient browser automation solution using **Playwright and Node.js**.

The automation is designed to process the challenge data from an Excel workbook and enter each record into a dynamically changing web form.

The main technical challenges addressed include:

* Dynamically generated field IDs
* Changing field locations
* Changing field order
* Changing field dimensions
* Changing label positions
* Authentication modal behavior
* Excel-driven test data
* Data-to-field mapping
* Input validation
* Dynamic UI state changes
* Unexpected page interruptions
* Execution time constraints

The implementation avoids relying exclusively on static IDs, fixed coordinates, or hard-coded field positions.

---

# 2. Automation Scope

The automation performs the following workflow:

1. Load environment configuration
2. Read and validate the Excel test data
3. Launch Chromium
4. Open the challenge website
5. Authenticate using the configured credentials
6. Start the automation challenge
7. Begin execution-time measurement
8. Dynamically discover the current form fields
9. Map the discovered fields to the corresponding Excel data
10. Enter the required values
11. Validate the entered values
12. Submit the current record
13. Wait for the next challenge state
14. Rediscover the fields after each submission
15. Process all available records
16. Validate the number of successfully processed records
17. Report execution time and final results

---

# 3. Technology Stack

| Technology        | Purpose                       |
| ----------------- | ----------------------------- |
| Node.js           | JavaScript runtime            |
| Playwright        | Browser automation            |
| JavaScript        | Automation implementation     |
| XLSX              | Excel file processing         |
| dotenv            | Environment configuration     |
| Page Object Model | Test architecture             |
| Git/GitHub        | Source control and submission |

### Main Framework

**Playwright + Node.js**

Playwright was selected because it provides:

* Reliable browser automation
* Automatic waiting
* Modern locator support
* Visibility and editability checks
* Fast execution
* Browser context management
* Debugging capabilities
* Page and network-state control

---

# 4. Project Structure

```text
qa-automation-challenge/
│
├── data/
│   └── test-data.xlsx
│
├── src/
│   ├── pages/
│   │   ├── ChallengePage.js
│   │   └── LoginPage.js
│   │
│   ├── utils/
│   │   ├── excelReader.js
│   │   ├── fieldDetector.js
│   │   └── fieldMapping.js
│   │
│   ├── automation.js
│   ├── runChallenge.js
│   └── debug/
│       ├── inspectAfterLogin.js
│       ├── inspectAfterStart.js
│       ├── inspectAttributes.js
│       ├── inspectChallenge.js
│       ├── inspectContext.js
│       ├── inspectFields.js
│       ├── inspectForm.js
│       ├── inspectGreyout.js
│       ├── inspectSubmit.js
│       ├── testDynamicFields.js
│       ├── testFieldDetector.js
│       ├── testFirstRow.js
│       ├── testLogin.js
│       ├── testSecondRow.js
│       └── testStart.js
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── readExcel.js
```

> Debug and inspection scripts are development utilities and are not required for the primary automation flow.

> `node_modules/` and sensitive environment files should not be committed to GitHub.

---

# 5. Prerequisites

Before running the automation, install the following:

### Required

* Node.js 18 or later
* npm
* Git
* Chromium-compatible environment
* Valid challenge credentials
* Excel test data file

Verify Node.js:

```bash
node --version
```

Verify npm:

```bash
npm --version
```

---

# 6. Installation

Clone the repository:

```bash
git clone <https://github.com/JoyLopez/the-automation-challenge>
```

Navigate to the project directory:

```bash
cd the-automation-challenge-main
```

Install project dependencies:

```bash
npm install
```

Install the required Playwright browser:

```bash
npx playwright install chromium
```

---

# 7. Environment Configuration

The project uses environment variables for the challenge URL and login credentials.

The repository includes .env.example as a template. The actual .env file is intentionally excluded from Git to prevent credentials from being exposed.

``` ### Create the local .env file ```
```
#### Windows PowerShell

Copy-Item .env.example .env

#### macOS / Linux

cp .env.example .env

Then open .env and enter the test credentials provided for the technical assessment:

```env
CHALLENGE_URL=https://www.theautomationchallenge.com/
CHALLENGE_EMAIL=your_test_email@example.com
CHALLENGE_PASSWORD=your_test_password
```

### Security

Credentials are loaded through environment variables and should not be hard-coded into the automation source code.

The `.env` file should be excluded from Git:

```gitignore
.env
node_modules/
playwright-report/
test-results/
*.log
```

**Never commit actual credentials to GitHub.**

---

# 8. Excel Test Data

The automation reads the input data from:

```text
data/test-data.xlsx
```

The workbook is expected to contain the challenge records.

The expected columns are:

```text
employer_identification_number
company_name
sector
company_address
automation_tool
annual_automation_saving
date_of_first_project
```

Example:

| employer_identification_number | company_name    | sector     | company_address | automation_tool | annual_automation_saving | date_of_first_project |
| ------------------------------ | --------------- | ---------- | --------------- | --------------- | -----------------------: | --------------------- |
| 123456789                      | Example Company | Technology | Cebu City       | Playwright      |                    50000 | 2024-01-15            |

The Excel reader uses the `xlsx` package to read the workbook and convert the worksheet data into JavaScript objects.

Before starting browser automation, the test data is validated to ensure the required fields are present.

---

# 9. Automation Workflow

The overall automation flow is:

```text
Start
  │
  ▼
Load Environment
  │
  ▼
Read Excel File
  │
  ▼
Validate Test Data
  │
  ▼
Launch Chromium
  │
  ▼
Open Challenge Website
  │
  ▼
Authenticate
  │
  ▼
Start Challenge
  │
  ▼
Start Execution Timer
  │
  ▼
┌──────────────────────────────┐
│ For each Excel record        │
│                              │
│ 1. Discover current fields   │
│ 2. Map fields to test data   │
│ 3. Fill values               │
│ 4. Verify values             │
│ 5. Submit                    │
│ 6. Wait for next state       │
└──────────────────────────────┘
  │
  ▼
Validate Processed Records
  │
  ▼
Validate Accuracy
  │
  ▼
Validate Execution Time
  │
  ▼
Report Final Result
```

---

# 10. Dynamic Field Handling

A key requirement of the challenge is that the form changes after each submission.

The automation therefore does not assume that a field will always have the same:

* ID
* XPath
* Position
* Size
* Order
* Label location

For example, the implementation does not depend exclusively on a generated selector such as:

```text
#company_name_input_field_123
```

because dynamically generated identifiers may change between challenge states.

Instead, the automation dynamically inspects the currently available form fields and determines the logical field using the visible label and surrounding context.

Conceptually:

```text
Current DOM
    │
    ▼
Find visible form fields
    │
    ▼
Inspect associated label/context
    │
    ▼
Normalize field information
    │
    ▼
Map UI field → logical field
    │
    ▼
Retrieve corresponding Excel value
    │
    ▼
Fill field
```

This makes the automation less dependent on dynamically generated selectors.

---

# 11. Dynamic Field Detection

The field detector is implemented in:

```text
src/utils/fieldDetector.js
```

The detector is responsible for:

1. Finding visible form fields
2. Ignoring unrelated authentication fields
3. Inspecting surrounding DOM information
4. Identifying the field label or context
5. Normalizing the discovered field information
6. Mapping the field to a logical field name
7. Verifying that all required challenge fields have been discovered

Expected logical fields include:

```text
companyName
address
ein
sector
automationTool
annualSaving
date
```

Before entering data, the automation validates that the required fields have been discovered.

If a required field cannot be identified, the automation reports the problem instead of silently entering data into an incorrect field.

---

# 12. Field Mapping

Field aliases are maintained separately in:

```text
src/utils/fieldMapping.js
```

Examples:

```text
Company Name
    ↓
company_name

Address
    ↓
company_address

EIN
    ↓
employer_identification_number

Automation Tool
    ↓
automation_tool
```

Separating field mapping from the page object improves maintainability and makes the automation easier to update if UI labels change.

---

# 13. Login Strategy

The authentication flow requires special handling because the website may initially display a **Sign Up** form/modal.

The automation does not simply select the first email or password input found in the DOM.

The login strategy is:

```text
SIGN UP OR LOGIN
       │
       ▼
Authentication Modal
       │
       ▼
Is Login Form Visible?
       │
    No │
       ▼
   OR LOGIN
       │
       ▼
Login Form
       │
       ▼
Visible Email Field
       │
       ▼
Visible Password Field
       │
       ▼
LOG IN
```

Only the intended, visible, and editable authentication fields are used.

This prevents credentials from being entered into hidden or unrelated Sign Up fields.

---

# 14. CAPTCHA / reCAPTCHA Handling

The challenge may display a CAPTCHA or anti-bot interruption.

The automation does **not** attempt to bypass or programmatically solve CAPTCHA.

Instead, the automation detects the interruption and waits for the application to become available again when possible.

The intended strategy is:

```text
Detect interruption
       ↓
Determine whether automation is blocked
       ↓
Wait for application/challenge state
       ↓
Continue when available
```

If human verification is required, it is not programmatically bypassed.

This keeps the automation within the intended interaction model of the challenge.

---

# 15. Data Accuracy Strategy

Data accuracy is validated before each record is submitted.

The workflow is:

```text
Excel Value
    ↓
Fill Web Field
    ↓
Read Entered Value
    ↓
Compare With Expected Value
    ↓
Verification Passed?
    │
 ┌──┴──┐
 │     │
Yes    No
 │     │
 ▼     ▼
Submit  Fail
```

The automation verifies the entered values before submitting the record.

At the end of execution, the number of successfully processed records is compared with the expected number of records.

For a 50-record test:

```text
Expected Records = 50
Processed Records = 50
Failed Records = 0
Accuracy = 100%
```

The 100% value represents the **accuracy requirement of the technical challenge**. The actual result should be based on the recorded execution output.

---

# 16. Performance Strategy

The challenge requires completion in less than **4 minutes / 240 seconds**.

Performance considerations include:

* Avoiding unnecessary fixed delays
* Using Playwright's automatic waiting
* Using targeted locators
* Limiting discovery to relevant visible fields
* Avoiding unnecessary page reloads
* Reusing the browser context
* Reusing the same page where possible
* Reading the Excel file once before execution
* Validating test data before starting the challenge
* Minimizing unnecessary network waits
* Using synchronization waits only where required by the dynamic UI

The automation records the execution time and compares it against the required limit.

Example:

```text
Challenge time: XX.XX seconds
Time limit:     240 seconds
```

The execution is considered within the requirement when:

```text
elapsedSeconds < 240
```

---

# 17. Error Handling

The automation performs validation before and during execution.

Examples of handled conditions include:

* Missing environment variables
* Missing Excel file
* Invalid Excel structure
* Missing required Excel columns
* Missing challenge fields
* Login form not appearing
* Login fields not being editable
* Field verification failure
* Submission failure
* Incomplete record processing
* Execution time exceeding the requirement

Errors include contextual information such as the affected row.

Example:

```text
Row 17 verification failed.
```

This provides more useful debugging information than reporting only a generic automation failure.

---

# 18. Page Object Model

The project follows the **Page Object Model (POM)** pattern.

Primary page objects:

```text
src/pages/LoginPage.js
src/pages/ChallengePage.js
```

The page objects encapsulate browser interaction such as:

* Authentication
* Element discovery
* Challenge interaction
* Form filling
* Input validation
* Submission
* Page synchronization

Test data and reusable utilities remain outside the page objects.

This separation improves:

* Maintainability
* Reusability
* Readability
* Debugging
* Scalability

---

# 19. Utility Layer

Reusable functionality is separated into utility modules.

### Excel Reader

```text
src/utils/excelReader.js
```

Responsible for reading the Excel workbook and converting worksheet data into JavaScript objects.

### Field Detector

```text
src/utils/fieldDetector.js
```

Responsible for dynamically discovering the challenge form fields.

### Field Mapping

```text
src/utils/fieldMapping.js
```

Responsible for mapping UI labels and context to logical data fields.

The resulting architecture is:

```text
                 Test Runner
                     │
                     ▼
               Page Objects
              /             \
             ▼               ▼
      Field Detection    Challenge Actions
             │
             ▼
       Utility Layer
        /          \
       ▼            ▼
Excel Reader    Field Mapping
```

---

# 20. Running the Automation

After configuring the `.env` file and placing the Excel workbook in the correct location:

```bash
node src/runChallenge.js
```

The automation will:

1. Load environment configuration
2. Read the Excel workbook
3. Validate the test data
4. Launch Chromium
5. Open the challenge website
6. Authenticate
7. Start the challenge
8. Process each Excel record
9. Dynamically discover the current fields
10. Populate the fields
11. Verify the entered values
12. Submit the record
13. Wait for the next challenge state
14. Calculate execution time
15. Validate the final record count
16. Report the final result

---

# 21. Expected Output

A successful execution should produce output similar to:

```text
==========================================
AUTOMATION CHALLENGE COMPLETE
==========================================

Rows processed: 50
Rows passed:    50
Rows failed:    0
Challenge time: XX.XX seconds
Time limit:     240 seconds
Accuracy:       100%

==========================================
FINAL RESULT: PASS
==========================================

All expected records were processed successfully.
Challenge completed within the required time.
```

> The output above is an example of the expected format. Actual execution results may vary depending on the challenge environment and network conditions.

---

# 22. Performance Acceptance Criteria

| Requirement                    | Expected Result        |
| ------------------------------ | ---------------------- |
| Input records                  | 50                     |
| Successfully processed records | 50                     |
| Accuracy requirement           | 100%                   |
| Failed records                 | 0                      |
| Maximum execution time         | < 240 seconds          |
| Browser automation             | Playwright             |
| Runtime                        | Node.js                |
| Input source                   | Excel                  |
| Dynamic field handling         | Supported              |
| Authentication                 | Supported              |
| CAPTCHA strategy               | Detect/wait; no bypass |
| Architecture                   | Page Object Model      |

---

# 23. Assumptions

The following assumptions were made during implementation:

1. The Excel workbook contains the challenge data in the first worksheet.
2. The workbook contains the expected number of challenge records.
3. The required Excel headers are present.
4. Challenge fields remain identifiable through their visible label or surrounding context even when their DOM properties change.
5. The provided credentials are valid.
6. The challenge website is reachable during execution.
7. CAPTCHA or anti-bot interruptions may occur intermittently.
8. CAPTCHA is treated as an external human-verification mechanism and is not programmatically bypassed.
9. The execution environment has network access to the challenge website.
10. The UI may change dynamically after each submission.
11. The provided test data is valid for the corresponding fields.
12. The challenge timer begins after the challenge is started.

---

# 24. Why This Approach Was Chosen

A basic implementation could rely on static selectors such as:

```javascript
page.locator('#company_name_input_field_123')
```

However, this approach can become fragile when dynamically generated identifiers and field positions change.

Instead, the automation uses a **state-driven and context-driven strategy**.

Rather than asking:

```text
"Where is the Company Name field?"
```

the automation asks:

```text
"Which currently visible field represents Company Name?"
```

This approach is more appropriate for a dynamic web application where the form structure can change between submissions.

The automation therefore discovers the current page state before interacting with the form.

---

# 25. Maintainability

The implementation separates responsibilities so that changes can be isolated.

### UI label changes

Update:

```text
src/utils/fieldMapping.js
```

### Dynamic field detection changes

Update:

```text
src/utils/fieldDetector.js
```

### Challenge interaction changes

Update:

```text
src/pages/ChallengePage.js
```

### Authentication changes

Update:

```text
src/pages/LoginPage.js
```

### Excel structure changes

Update:

```text
src/utils/excelReader.js
```

This reduces the amount of code that needs to change when a particular part of the application evolves.

---

# 26. GitHub Submission

Before pushing the project to GitHub, verify the working tree:

```bash
git status
```

Make sure sensitive and generated files are excluded:

```text
.env
node_modules/
test-results/
playwright-report/
*.log
```

Then commit and push:

```bash
git add .
git commit -m "feat: implement Playwright QA automation challenge"
git push origin main
```

The repository should contain:

```text
README.md
package.json
package-lock.json
src/
data/
.gitignore
.env.example
```

Actual credentials must never be committed.

---

# 27. Recommended Repository Description

```text
Playwright QA Automation Technical Test — Excel-driven dynamic web form automation using Node.js, Page Object Model, dynamic field detection, data validation, and performance monitoring.
```

---

# 28. Engineering Practices Demonstrated

This solution demonstrates the following QA automation practices:

* Page Object Model
* Separation of concerns
* Dynamic locator strategy
* Data-driven testing
* Excel integration
* Environment-based configuration
* Secure credential handling
* Precondition validation
* Dynamic field discovery
* Input validation
* Post-action verification
* Error handling
* Performance measurement
* Reusable utility functions
* Maintainable test architecture
* Deterministic result reporting

---

# 29. Final Validation Checklist

Before submitting the technical assessment, verify:

* [ ] `npm install` completes successfully
* [ ] Playwright Chromium is installed
* [ ] `.env` contains valid credentials
* [ ] `.env` is excluded from Git
* [ ] `.env.example` contains placeholders only
* [ ] `data/test-data.xlsx` is available
* [ ] The expected number of records is present
* [ ] All required Excel columns are present
* [ ] Login successfully opens the Login form
* [ ] Credentials are entered only into the Login form
* [ ] Challenge starts successfully
* [ ] Fields are dynamically detected
* [ ] Every expected Excel record is processed
* [ ] Each record is verified before submission
* [ ] Fields are rediscovered after submission
* [ ] CAPTCHA interruptions are handled without bypassing CAPTCHA
* [ ] Final record count matches the expected record count
* [ ] Accuracy meets the 100% requirement
* [ ] Execution completes within the required four-minute limit
* [ ] No credentials are committed to GitHub
* [ ] README documentation is complete

---

# 30. Result

The solution is designed to address the core requirements of the QA Automation Technical Test.

```text
Framework:             Playwright + Node.js
Data Source:           Excel
Architecture:          Page Object Model
Input Records:         50
Accuracy Requirement:  100%
Performance Requirement: < 4 minutes
Dynamic Fields:        Supported
Authentication:        Supported
CAPTCHA:               Detection/wait strategy; no bypass
Data Validation:       Supported
Performance Monitoring: Supported
Documentation:         Included
GitHub Ready:          Yes
```

The final execution result should be based on the actual automation run and should confirm:

```text
Expected Records: 50
Processed Records: XX
Failed Records: XX
Accuracy: XX%
Execution Time: XX.XX seconds
Performance Requirement Met: YES/NO
Final Result: PASS/FAIL
```

---

## Author

**Mary Joy Lopez**
**Software Quality Assurance Engineer**

### Project Purpose

This project was developed as part of a technical assessment to demonstrate practical QA automation skills using Playwright and Node.js, with a focus on dynamic UI handling, data-driven automation, validation, maintainability, and execution efficiency.
