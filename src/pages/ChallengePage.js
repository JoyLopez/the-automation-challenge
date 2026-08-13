const { expect } = require('playwright');

class ChallengePage {
  constructor(page) {
    this.page = page;

    this.fieldSelectors = {
      companyName: [
        'input[id^="company_name_input_field_"]'
      ],

      companyAddress: [
        'input[id^="address_input_field_"]'
      ],

      employerIdentificationNumber: [
        'input[id^="ein_input_field_"]'
      ],

      sector: [
        'input[id^="sector_input_field_"]'
      ],

      automationTool: [
        'input[id^="automation_tool_input_field_"]'
      ],

      annualAutomationSaving: [
        'input[id^="annual_saving_input_field_"]'
      ],

      dateOfFirstProject: [
        'input[id^="date_input_field_"]'
      ]
    };

    this.currentFields = null;
  }

  // ============================================================
  // GENERIC HELPERS
  // ============================================================

  async sleep(ms) {
    if (this.page.isClosed()) {
      throw new Error('Browser page was closed.');
    }

    await this.page.waitForTimeout(ms);
  }

  async isVisible(locator) {
    try {
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  async isEditable(locator) {
    try {
      return await locator.isEditable();
    } catch {
      return false;
    }
  }

  async firstVisible(locators) {
    for (const locator of locators) {
      try {
        const count = await locator.count();

        for (let i = 0; i < count; i++) {
          const candidate = locator.nth(i);

          if (
            await candidate.isVisible() &&
            await candidate.isEditable().catch(() => true)
          ) {
            return candidate;
          }
        }
      } catch {
        // Continue
      }
    }

    return null;
  }

  async getVisibleButtonByText(text) {
    const buttons = this.page.getByRole('button', {
      name: text,
      exact: true
    });

    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);

      try {
        if (await button.isVisible()) {
          return button;
        }
      } catch {
        // Continue
      }
    }

    return null;
  }

  async getVisibleTextLocator(text) {
    const locator = this.page.getByText(text, {
      exact: true
    });

    const count = await locator.count();

    for (let i = 0; i < count; i++) {
      const item = locator.nth(i);

      try {
        if (await item.isVisible()) {
          return item;
        }
      } catch {
        // Continue
      }
    }

    return null;
  }

  // ============================================================
  // OPEN WEBSITE
  // ============================================================

  async open(url = process.env.CHALLENGE_URL) {
    console.log('Opening challenge website...');
    console.log('Navigating to challenge website...');

    if (!url) {
      throw new Error(
        'CHALLENGE_URL is not defined.'
      );
    }

    await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await this.page
      .waitForLoadState('networkidle', {
        timeout: 15000
      })
      .catch(() => {});

    console.log('Website loaded.');
    console.log(
      `Current URL: ${this.page.url()}`
    );
  }

  // ============================================================
  // LOGIN
  // ============================================================
  //
  // IMPORTANT:
  //
  // The website can initially open the SIGN UP form.
  //
  // We MUST NOT simply select the first email/password input
  // because hidden Sign Up inputs may exist in the DOM.
  //
  // The sequence is:
  //
  // SIGN UP OR LOGIN
  //        ↓
  // Sign Up modal
  //        ↓
  // OR LOGIN
  //        ↓
  // Login modal
  //        ↓
  // Login email
  // Login password
  //        ↓
  // LOG IN
  //
  // ============================================================

  async login(
    email = process.env.CHALLENGE_EMAIL,
    password = process.env.CHALLENGE_PASSWORD
  ) {
    console.log('Logging in...');
    console.log('Opening authentication modal...');

    if (!email) {
      throw new Error(
        'CHALLENGE_EMAIL is not defined.'
      );
    }

    if (!password) {
      throw new Error(
        'CHALLENGE_PASSWORD is not defined.'
      );
    }

    // ----------------------------------------------------------
    // Check current authentication state carefully.
    // ----------------------------------------------------------

    console.log(
      'Checking authentication state...'
    );

    const startButton = await this.getVisibleButtonByText(
      'Start'
    );

    if (startButton) {
      console.log(
        'Start button detected.'
      );

      // Do NOT immediately assume authenticated.
      //
      // If authentication controls are still visible,
      // we continue with login verification.
      //
      const authButton =
        await this.getVisibleButtonByText(
          'SIGN UP OR LOGIN'
        );

      if (!authButton) {
        console.log(
          'Authentication controls are absent.'
        );

        console.log(
          'Already authenticated.'
        );

        return true;
      }

      console.log(
        'Authentication controls are still present.'
      );

      console.log(
        'Continuing login verification.'
      );
    }

    // ----------------------------------------------------------
    // Open authentication modal.
    // ----------------------------------------------------------

    let signUpLoginButton =
      await this.getVisibleButtonByText(
        'SIGN UP OR LOGIN'
      );

    if (!signUpLoginButton) {
      throw new Error(
        'Could not find "SIGN UP OR LOGIN" button.'
      );
    }

    console.log(
      'Clicking button: "SIGN UP OR LOGIN"'
    );

    await signUpLoginButton.click();

    await this.sleep(700);

    console.log(
      'Authentication modal opened.'
    );

    // ----------------------------------------------------------
    // Explicitly identify Sign Up / Login mode.
    // ----------------------------------------------------------

    console.log(
      'Checking authentication modal mode...'
    );

    let loginSubmitButton =
      await this.getVisibleButtonByText(
        'LOG IN'
      );

    let orLoginButton =
      await this.getVisibleButtonByText(
        'OR LOGIN'
      );

    // ----------------------------------------------------------
    // If Sign Up form is displayed, switch to Login.
    // ----------------------------------------------------------

    if (orLoginButton && !loginSubmitButton) {
      console.log(
        'Sign Up form detected.'
      );

      console.log(
        'Sign Up → Login'
      );

      console.log(
        'Clicking "OR LOGIN"...'
      );

      await orLoginButton.click();

      console.log(
        '"OR LOGIN" clicked.'
      );

      await this.sleep(800);
    }

    // ----------------------------------------------------------
    // Sometimes Bubble takes a moment to replace the modal.
    // ----------------------------------------------------------

    const loginStartTime = Date.now();

    while (
      Date.now() - loginStartTime < 15000
    ) {
      loginSubmitButton =
        await this.getVisibleButtonByText(
          'LOG IN'
        );

      if (loginSubmitButton) {
        break;
      }

      // If OR LOGIN is still present, click it again only if
      // the Login submit button has not appeared.
      orLoginButton =
        await this.getVisibleButtonByText(
          'OR LOGIN'
        );

      if (orLoginButton) {
        console.log(
          'Login form has not switched yet.'
        );

        await orLoginButton.click();

        await this.sleep(700);
      } else {
        await this.sleep(300);
      }
    }

    if (!loginSubmitButton) {
      throw new Error(
        'Login form did not open. ' +
        'The page may still be displaying the Sign Up form.'
      );
    }

    console.log(
      'Login form successfully opened.'
    );

    console.log(
      'Confirmed: Login modal is active.'
    );

    // ----------------------------------------------------------
    // IMPORTANT:
    //
    // We now locate email/password ONLY among visible editable
    // fields.
    //
    // This prevents credentials from being entered into the
    // hidden Sign Up form.
    // ----------------------------------------------------------

    console.log(
      'Locating LOGIN email field...'
    );

    const emailCandidates =
      this.page.locator(
        'input[type="email"]'
      );

    const emailCount =
      await emailCandidates.count();

    console.log(
      `Email input candidates found: ${emailCount}`
    );

    let loginEmailInput = null;

    for (
      let i = 0;
      i < emailCount;
      i++
    ) {
      const candidate =
        emailCandidates.nth(i);

      try {
        const visible =
          await candidate.isVisible();

        const editable =
          await candidate.isEditable();

        if (visible && editable) {
          loginEmailInput = candidate;

          console.log(
            `Selected visible editable email input #${i}.`
          );

          break;
        }
      } catch {
        // Continue
      }
    }

    if (!loginEmailInput) {
      throw new Error(
        'Could not find visible editable LOGIN email field.'
      );
    }

    console.log(
      'Entering LOGIN email...'
    );

    await loginEmailInput.fill(
      String(email)
    );

    console.log(
      `Login email value: ${await loginEmailInput.inputValue()}`
    );

    // ----------------------------------------------------------
    // LOGIN PASSWORD
    // ----------------------------------------------------------

    console.log(
      'Locating LOGIN password field...'
    );

    const passwordCandidates =
      this.page.locator(
        'input[type="password"]'
      );

    const passwordCount =
      await passwordCandidates.count();

    console.log(
      `Password input candidates found: ${passwordCount}`
    );

    let loginPasswordInput = null;

    for (
      let i = 0;
      i < passwordCount;
      i++
    ) {
      const candidate =
        passwordCandidates.nth(i);

      try {
        const visible =
          await candidate.isVisible();

        const editable =
          await candidate.isEditable();

        if (visible && editable) {
          loginPasswordInput = candidate;

          console.log(
            `Selected visible editable password input #${i}.`
          );

          break;
        }
      } catch {
        // Continue
      }
    }

    if (!loginPasswordInput) {
      throw new Error(
        'Could not find visible editable LOGIN password field.'
      );
    }

    console.log(
      'Entering LOGIN password...'
    );

    await loginPasswordInput.fill(
      String(password)
    );

    console.log(
      'Login credentials entered successfully.'
    );

    // ----------------------------------------------------------
    // FINAL LOGIN FORM VALIDATION
    // ----------------------------------------------------------

    console.log(
      'Validating Login form before submit...'
    );

    // Make absolutely sure the selected fields contain
    // the credentials.
    const actualEmail =
      await loginEmailInput.inputValue();

    const actualPassword =
      await loginPasswordInput.inputValue();

    if (actualEmail !== String(email)) {
      throw new Error(
        'Login email was not entered into the expected Login form.'
      );
    }

    if (actualPassword !== String(password)) {
      throw new Error(
        'Login password was not entered into the expected Login form.'
      );
    }

    // ----------------------------------------------------------
    // Locate actual LOG IN button.
    // ----------------------------------------------------------

    loginSubmitButton =
      await this.getVisibleButtonByText(
        'LOG IN'
      );

    if (!loginSubmitButton) {
      throw new Error(
        'Could not find visible "LOG IN" submit button.'
      );
    }

    console.log(
      'Clicking actual login submit button: "LOG IN"'
    );

    await loginSubmitButton.click();

    console.log(
      'Login submit action completed.'
    );

    // ----------------------------------------------------------
    // Wait for authentication.
    // ----------------------------------------------------------

    console.log(
      'Verifying authentication...'
    );

    const authenticationStart =
      Date.now();

    let authenticated = false;

    while (
      Date.now() - authenticationStart < 20000
    ) {
      // Start button means authenticated.
      const authenticatedStart =
        await this.getVisibleButtonByText(
          'Start'
        );

      if (authenticatedStart) {
        authenticated = true;
        break;
      }

      // If modal is still visible, login probably failed
      // or has not completed.
      await this.sleep(500);
    }

    if (!authenticated) {
      // Check whether login controls are still visible.
      const stillLoginButton =
        await this.getVisibleButtonByText(
          'LOG IN'
        );

      const stillOrLogin =
        await this.getVisibleButtonByText(
          'OR LOGIN'
        );

      if (stillLoginButton || stillOrLogin) {
        throw new Error(
          'Login was NOT successful. ' +
          'The authentication modal is still active.'
        );
      }

      throw new Error(
        'Login could not be verified. ' +
        'Start button did not become visible.'
      );
    }

    console.log(
      'Start button is visible after login.'
    );

    console.log(
      'LOGIN VERIFIED SUCCESSFULLY.'
    );

    console.log(
      'Login completed.'
    );

    return true;
  }

  // ============================================================
  // CLICK START
  // ============================================================

  async clickStart() {
    console.log(
      'Waiting for Start button...'
    );

    const startButton =
      await this.getVisibleButtonByText(
        'Start'
      );

    if (!startButton) {
      throw new Error(
        'Could not find visible Start button.'
      );
    }

    console.log(
      'Start button is visible.'
    );

    console.log(
      'Clicking Start button...'
    );

    await startButton.click();

    await this.sleep(1000);

    console.log(
      'Challenge started.'
    );

    return true;
  }

  // ============================================================
  // WAIT FOR GREYOUT
  // ============================================================

  async waitForGreyoutToDisappear(
    timeout = 30000
  ) {
    const greyout =
      this.page.locator('.greyout');

    const start =
      Date.now();

    while (
      Date.now() - start < timeout
    ) {
      if (this.page.isClosed()) {
        throw new Error(
          'Browser page was closed while waiting for greyout.'
        );
      }

      let visible = false;

      try {
        const count =
          await greyout.count();

        for (
          let i = 0;
          i < count;
          i++
        ) {
          const element =
            greyout.nth(i);

          if (
            await element.isVisible()
          ) {
            const active =
              await element.evaluate(el => {
                const style =
                  window.getComputedStyle(el);

                const rect =
                  el.getBoundingClientRect();

                return (
                  style.display !== 'none' &&
                  style.visibility !== 'hidden' &&
                  parseFloat(
                    style.opacity || '1'
                  ) > 0 &&
                  rect.width > 0 &&
                  rect.height > 0
                );
              }).catch(() => false);

            if (active) {
              visible = true;
              break;
            }
          }
        }
      } catch {
        visible = false;
      }

      if (!visible) {
        console.log(
          'Greyout overlay is hidden.'
        );

        return true;
      }

      await this.sleep(250);
    }

    console.log(
      'Greyout overlay did not disappear within timeout.'
    );

    return false;
  }

  // ============================================================
  // CAPTCHA DETECTION
  // ============================================================
  //
  // IMPORTANT:
  //
  // reCAPTCHA is random.
  //
  // We do NOT bypass it.
  //
  // We only detect an active visible challenge and pause
  // until the human completes it.
  //
  // Hidden CAPTCHA elements must NOT cause a false positive.
  //
  // ============================================================

  async isCaptchaVisible() {
    if (this.page.isClosed()) {
      return false;
    }

    const captchaSelectors = [
      'iframe[src*="recaptcha"]',
      'iframe[title*="reCAPTCHA"]',
      '.g-recaptcha',
      '[class*="recaptcha"]',
      '[id*="recaptcha"]'
    ];

    for (
      const selector of captchaSelectors
    ) {
      try {
        const elements =
          this.page.locator(selector);

        const count =
          await elements.count();

        for (
          let i = 0;
          i < count;
          i++
        ) {
          const element =
            elements.nth(i);

          const visible =
            await element.isVisible()
              .catch(() => false);

          if (!visible) {
            continue;
          }

          const active =
            await element.evaluate(el => {
              const style =
                window.getComputedStyle(el);

              const rect =
                el.getBoundingClientRect();

              return (
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                parseFloat(
                  style.opacity || '1'
                ) > 0 &&
                rect.width > 0 &&
                rect.height > 0
              );
            }).catch(() => false);

          if (active) {
            return true;
          }
        }
      } catch {
        // Continue
      }
    }

    // ----------------------------------------------------------
    // Look for actual visible CAPTCHA challenge text.
    // ----------------------------------------------------------

    const captchaTexts = [
      "I'm not a robot",
      'Verify you are human',
      'Verify that you are human',
      'Select all squares',
      'Select all images',
      'Please verify'
    ];

    for (
      const text of captchaTexts
    ) {
      try {
        const locator =
          this.page.getByText(
            text,
            {
              exact: false
            }
          );

        const count =
          await locator.count();

        for (
          let i = 0;
          i < count;
          i++
        ) {
          const element =
            locator.nth(i);

          const visible =
            await element.isVisible()
              .catch(() => false);

          if (!visible) {
            continue;
          }

          const active =
            await element.evaluate(el => {
              const style =
                window.getComputedStyle(el);

              const rect =
                el.getBoundingClientRect();

              return (
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                parseFloat(
                  style.opacity || '1'
                ) > 0 &&
                rect.width > 0 &&
                rect.height > 0
              );
            }).catch(() => false);

          if (active) {
            return true;
          }
        }
      } catch {
        // Continue
      }
    }

    return false;
  }

  // ============================================================
  // WAIT FOR CAPTCHA
  // ============================================================

  async waitForCaptchaIfPresent(
    timeout = 180000
  ) {
    console.log(
      'Checking for CAPTCHA...'
    );

    const detected =
      await this.isCaptchaVisible();

    if (!detected) {
      console.log(
        'No active CAPTCHA detected.'
      );

      return true;
    }

    console.log('');
    console.log(
      '=========================================='
    );
    console.log(
      'CAPTCHA DETECTED'
    );
    console.log(
      '=========================================='
    );
    console.log(
      'A reCAPTCHA challenge is currently visible.'
    );
    console.log('');
    console.log(
      'Please complete the CAPTCHA manually'
    );
    console.log(
      'in the browser.'
    );
    console.log('');
    console.log(
      'Automation will continue automatically'
    );
    console.log(
      'after the CAPTCHA has been cleared.'
    );
    console.log(
      '=========================================='
    );
    console.log('');

    const start =
      Date.now();

    while (
      Date.now() - start < timeout
    ) {
      if (this.page.isClosed()) {
        throw new Error(
          'Browser page was closed while waiting for CAPTCHA.'
        );
      }

      const stillVisible =
        await this.isCaptchaVisible();

      if (!stillVisible) {
        console.log('');
        console.log(
          'CAPTCHA cleared successfully.'
        );

        console.log(
          'Continuing automation...'
        );

        console.log('');

        // Allow page state to update.
        await this.sleep(1000);

        return true;
      }

      await this.sleep(1000);
    }

    throw new Error(
      'CAPTCHA was not completed within 180 seconds.'
    );
  }

  // ============================================================
  // DISCOVER CURRENT ROW FIELDS
  // ============================================================

  async discoverFields() {
    console.log(
      'Discovering fields...'
    );

    const result = {};

    const fieldNames = [
      'companyName',
      'companyAddress',
      'employerIdentificationNumber',
      'sector',
      'automationTool',
      'annualAutomationSaving',
      'dateOfFirstProject'
    ];

    for (
      const fieldName of fieldNames
    ) {
      let found = null;

      const selectors =
        this.fieldSelectors[fieldName];

      for (
        const selector of selectors
      ) {
        const locator =
          this.page.locator(selector);

        const count =
          await locator.count();

        for (
          let i = 0;
          i < count;
          i++
        ) {
          const candidate =
            locator.nth(i);

          try {
            if (
              await candidate.isVisible() &&
              await candidate.isEditable()
            ) {
              found = candidate;
              break;
            }
          } catch {
            // Continue
          }
        }

        if (found) {
          break;
        }
      }

      if (!found) {
        throw new Error(
          `Could not discover field: ${fieldName}`
        );
      }

      const tagName =
        await found.evaluate(
          element =>
            element.tagName.toLowerCase()
        );

      const editable =
        await found.isEditable();

      const id =
        await found.getAttribute('id');

      console.log(
        `${fieldName}: <${tagName}> editable=${editable}`
      );

      console.log(
        `${fieldName} selector id: ${id}`
      );

      result[fieldName] = found;
    }

    console.log(
      'All seven fields discovered.'
    );

    console.log(
      'Field mapping:'
    );

    for (
      const [name, locator]
      of Object.entries(result)
    ) {
      const id =
        await locator.getAttribute('id');

      console.log(
        `- ${name}: ${id}`
      );
    }

    this.currentFields = result;

    return result;
  }

  // ============================================================
  // ALIAS
  // ============================================================

  async discoverCurrentRowFields() {
    console.log(
      'Discovering current row fields...'
    );

    const fields =
      await this.discoverFields();

    console.log(
      'Current row fields discovered.'
    );

    return fields;
  }

  // ============================================================
  // FILL ROW
  // ============================================================

  async fillRow(row) {
    if (!row) {
      throw new Error(
        'Cannot fill row: row data is undefined.'
      );
    }

    if (!this.currentFields) {
      await this.discoverFields();
    }

    console.log(
      'Filling Excel row...'
    );

    const values = {
      companyName:
        row.company_name,

      companyAddress:
        row.company_address,

      employerIdentificationNumber:
        row.employer_identification_number,

      sector:
        row.sector,

      automationTool:
        row.automation_tool,

      annualAutomationSaving:
        row.annual_automation_saving,

      dateOfFirstProject:
        row.date_of_first_project
    };

    console.log(
      `Company Name: ${values.companyName}`
    );

    console.log(
      `Address: ${values.companyAddress}`
    );

    console.log(
      `EIN: ${values.employerIdentificationNumber}`
    );

    console.log(
      `Sector: ${values.sector}`
    );

    console.log(
      `Automation Tool: ${values.automationTool}`
    );

    console.log(
      `Annual Saving: ${values.annualAutomationSaving}`
    );

    console.log(
      `Date: ${values.dateOfFirstProject}`
    );

    for (
      const [fieldName, value]
      of Object.entries(values)
    ) {
      const field =
        this.currentFields[fieldName];

      if (!field) {
        throw new Error(
          `Missing discovered field: ${fieldName}`
        );
      }

      await field.scrollIntoViewIfNeeded();

      await field.fill(
        value === null ||
        value === undefined
          ? ''
          : String(value)
      );
    }

    console.log(
      'All seven fields filled successfully.'
    );

    return true;
  }

  // ============================================================
  // VERIFY ROW
  // ============================================================

  async verifyRow(row) {
    console.log(
      'Verifying row...'
    );

    if (!row) {
      console.log(
        'Verification failed: row is undefined.'
      );

      return false;
    }

    if (!this.currentFields) {
      await this.discoverFields();
    }

    const expected = {
      companyName:
        row.company_name,

      companyAddress:
        row.company_address,

      employerIdentificationNumber:
        row.employer_identification_number,

      sector:
        row.sector,

      automationTool:
        row.automation_tool,

      annualAutomationSaving:
        row.annual_automation_saving,

      dateOfFirstProject:
        row.date_of_first_project
    };

    const failures = [];

    for (
      const [fieldName, expectedValue]
      of Object.entries(expected)
    ) {
      const field =
        this.currentFields[fieldName];

      if (!field) {
        failures.push({
          field: fieldName,
          expected:
            String(expectedValue),
          actual:
            '<FIELD NOT FOUND>'
        });

        continue;
      }

      let actualValue = '';

      try {
        actualValue =
          await field.inputValue();
      } catch {
        actualValue = '';
      }

      const expectedString =
        expectedValue === null ||
        expectedValue === undefined
          ? ''
          : String(expectedValue);

      const actualNormalized =
        String(actualValue)
          .replace(/\s+/g, ' ')
          .trim();

      const expectedNormalized =
        expectedString
          .replace(/\s+/g, ' ')
          .trim();

      if (
        actualNormalized !==
        expectedNormalized
      ) {
        failures.push({
          field: fieldName,
          expected:
            expectedString,
          actual:
            actualValue
        });
      }
    }

    if (failures.length > 0) {
      console.log(
        'Row verification failed:'
      );

      console.table(
        failures
      );

      return false;
    }

    console.log(
      'All seven field values verified successfully.'
    );

    return true;
  }

  // ============================================================
  // FIND SUBMIT BUTTON
  // ============================================================

  async findSubmitButton() {
    const submitButtons =
      this.page.getByRole('button', {
        name: 'Submit',
        exact: true
      });

    const count =
      await submitButtons.count();

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const button =
        submitButtons.nth(i);

      try {
        if (
          await button.isVisible() &&
          await button.isEnabled()
        ) {
          return button;
        }
      } catch {
        // Continue
      }
    }

    // ----------------------------------------------------------
    // Fallback: inspect visible buttons.
    // ----------------------------------------------------------

    const buttons =
      this.page.locator('button');

    const buttonCount =
      await buttons.count();

    for (
      let i = 0;
      i < buttonCount;
      i++
    ) {
      const button =
        buttons.nth(i);

      try {
        if (!(await button.isVisible())) {
          continue;
        }

        const text =
          (
            await button.innerText()
          ).trim();

        if (
          text.toLowerCase() === 'submit' &&
          await button.isEnabled()
        ) {
          return button;
        }
      } catch {
        // Continue
      }
    }

    return null;
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  async submit() {
    console.log(
      'Looking for Submit button...'
    );

    // ----------------------------------------------------------
    // Random CAPTCHA may appear before Submit.
    // ----------------------------------------------------------

    await this.waitForCaptchaIfPresent();

    // ----------------------------------------------------------
    // Wait for greyout.
    // ----------------------------------------------------------

    const greyoutReady =
      await this.waitForGreyoutToDisappear(
        30000
      );

    if (!greyoutReady) {
      // A greyout can occasionally remain while the page
      // finishes rendering. Give it a short additional period.
      console.log(
        'Greyout still detected. Waiting additional time...'
      );

      await this.sleep(2000);

      const secondCheck =
        await this.waitForGreyoutToDisappear(
          10000
        );

      if (!secondCheck) {
        console.log(
          'Greyout overlay is still present.'
        );
      }
    }

    // ----------------------------------------------------------
    // Find Submit.
    // ----------------------------------------------------------

    let submitButton =
      await this.findSubmitButton();

    // ----------------------------------------------------------
    // CAPTCHA can appear while the button is being located.
    // ----------------------------------------------------------

    if (!submitButton) {
      if (
        await this.isCaptchaVisible()
      ) {
        console.log(
          'CAPTCHA appeared while locating Submit.'
        );

        await this.waitForCaptchaIfPresent();

        await this.waitForGreyoutToDisappear(
          30000
        );

        submitButton =
          await this.findSubmitButton();
      }
    }

    if (!submitButton) {
      throw new Error(
        'Could not find a visible enabled Submit button.'
      );
    }

    // ----------------------------------------------------------
    // Final CAPTCHA check.
    // ----------------------------------------------------------

    await this.waitForCaptchaIfPresent();

    // ----------------------------------------------------------
    // Final greyout check.
    // ----------------------------------------------------------

    await this.waitForGreyoutToDisappear(
      30000
    );

    // ----------------------------------------------------------
    // Re-find Submit because the DOM may have changed.
    // ----------------------------------------------------------

    submitButton =
      await this.findSubmitButton();

    if (!submitButton) {
      throw new Error(
        'Submit button disappeared after CAPTCHA/greyout processing.'
      );
    }

    console.log(
      'Submit button is ready.'
    );

    await submitButton.scrollIntoViewIfNeeded();

    console.log(
      'Clicking Submit button...'
    );

    try {
      await submitButton.click({
        timeout: 15000
      });
    } catch (error) {
      const message =
        String(
          error.message || error
        );

      // --------------------------------------------------------
      // If CAPTCHA or greyout appeared during click, recover.
      // --------------------------------------------------------

      if (
        message.includes(
          'intercepts pointer events'
        ) ||
        message.includes(
          'Timeout'
        )
      ) {
        console.log(
          'Submit click was blocked.'
        );

        // Check CAPTCHA first.
        await this.waitForCaptchaIfPresent();

        // Then greyout.
        await this.waitForGreyoutToDisappear(
          30000
        );

        // Find button again.
        submitButton =
          await this.findSubmitButton();

        if (!submitButton) {
          throw error;
        }

        await submitButton.scrollIntoViewIfNeeded();

        await submitButton.click({
          timeout: 15000
        });
      } else {
        throw error;
      }
    }

    console.log(
      'Submit button clicked.'
    );

    // ----------------------------------------------------------
    // Give challenge time to process.
    // ----------------------------------------------------------

    await this.sleep(1000);

    // ----------------------------------------------------------
    // CAPTCHA may also appear AFTER Submit.
    // ----------------------------------------------------------

    if (
      await this.isCaptchaVisible()
    ) {
      console.log(
        'CAPTCHA appeared after Submit.'
      );

      await this.waitForCaptchaIfPresent();

      console.log(
        'CAPTCHA cleared after Submit.'
      );
    }

    return true;
  }

  // ============================================================
  // WAIT FOR NEXT ROW
  // ============================================================

  async waitForNextRow(
    previousFieldIds = [],
    timeout = 30000
  ) {
    console.log(
      'Waiting for next challenge row...'
    );

    const start =
      Date.now();

    while (
      Date.now() - start < timeout
    ) {
      if (this.page.isClosed()) {
        throw new Error(
          'Browser page was closed while waiting for next row.'
        );
      }

      // --------------------------------------------------------
      // CAPTCHA handling.
      // --------------------------------------------------------

      if (
        await this.isCaptchaVisible()
      ) {
        await this.waitForCaptchaIfPresent(
          180000
        );
      }

      // --------------------------------------------------------
      // Find visible editable company-name field.
      // --------------------------------------------------------

      const visibleInputs =
        this.page.locator(
          'input[id^="company_name_input_field_"]'
        );

      const count =
        await visibleInputs.count();

      for (
        let i = 0;
        i < count;
        i++
      ) {
        const input =
          visibleInputs.nth(i);

        try {
          if (
            await input.isVisible() &&
            await input.isEditable()
          ) {
            const id =
              await input.getAttribute(
                'id'
              );

            if (
              previousFieldIds.length === 0 ||
              !previousFieldIds.includes(id)
            ) {
              console.log(
                'Ready for next row.'
              );

              this.currentFields = null;

              return true;
            }
          }
        } catch {
          // Continue
        }
      }

      await this.sleep(250);
    }

    // ----------------------------------------------------------
    // Fallback:
    //
    // Sometimes the website can reuse the same dynamic ID.
    // In that case we simply rediscover the current row.
    // ----------------------------------------------------------

    console.log(
      'Checking fallback row discovery...'
    );

    const fallback =
      await this.discoverFields()
        .catch(() => null);

    if (fallback) {
      console.log(
        'Ready for next row.'
      );

      return true;
    }

    throw new Error(
      'Timed out waiting for the next challenge row.'
    );
  }

  // ============================================================
  // GET CURRENT FIELD IDS
  // ============================================================

  async getCurrentFieldIds() {
    if (!this.currentFields) {
      await this.discoverFields();
    }

    const ids = [];

    for (
      const field
      of Object.values(this.currentFields)
    ) {
      try {
        const id =
          await field.getAttribute(
            'id'
          );

        if (id) {
          ids.push(id);
        }
      } catch {
        // Ignore
      }
    }

    return ids;
  }

  // ============================================================
  // DEBUG PAGE
  // ============================================================

  async debugPage() {
    console.log(
      '------------------------------------------'
    );

    console.log(
      `URL: ${this.page.url()}`
    );

    console.log(
      `Title: ${await this.page.title()}`
    );

    console.log(
      'Visible inputs:'
    );

    const inputs =
      this.page.locator('input');

    const inputCount =
      await inputs.count();

    for (
      let i = 0;
      i < inputCount;
      i++
    ) {
      const input =
        inputs.nth(i);

      try {
        if (
          await input.isVisible()
        ) {
          console.log(
            `Input ${i}:`,
            {
              tag:
                await input.evaluate(
                  el =>
                    el.tagName
                ),

              type:
                await input.getAttribute(
                  'type'
                ),

              placeholder:
                await input.getAttribute(
                  'placeholder'
                ),

              name:
                await input.getAttribute(
                  'name'
                ),

              id:
                await input.getAttribute(
                  'id'
                ),

              ariaLabel:
                await input.getAttribute(
                  'aria-label'
                )
            }
          );
        }
      } catch {
        // Ignore
      }
    }

    console.log(
      'Visible buttons:'
    );

    const buttons =
      this.page.locator('button');

    const buttonCount =
      await buttons.count();

    for (
      let i = 0;
      i < buttonCount;
      i++
    ) {
      const button =
        buttons.nth(i);

      try {
        if (
          await button.isVisible()
        ) {
          console.log(
            `- ${(await button.innerText()).trim()}`
          );
        }
      } catch {
        // Ignore
      }
    }

    console.log(
      'CAPTCHA visible:',
      await this.isCaptchaVisible()
    );

    console.log(
      '------------------------------------------'
    );
  }
}

module.exports = ChallengePage;