Perfect! Here’s a full, step-by-step guide using your BrowserStack credentials:
Username: qabankimonline@gmail.com
Access Key: 1sPgh89g81AybDayLQtz
I’ll use Node.js + Selenium WebDriver for E2E testing. If you want Python, Java, or Playwright/Cypress, just ask!
🟢 BrowserStack E2E Web Test: Complete Guide Using Your Credentials
1. Prepare Your Local Machine
A. Install Node.js
Download and install Node.js from nodejs.org
To check if installed, run in terminal:
node -v
npm -v
B. Create Project Directory
Open terminal (cmd/PowerShell/Terminal) and run:
mkdir browserstack-e2e
cd browserstack-e2e
C. Initialize npm
npm init -y
D. Install Selenium WebDriver
npm install selenium-webdriver
2. Write the Selenium Test Script
A. Create the Test File
In your project folder, create a file called test.js
B. Paste and Edit This Script:
const { Builder, By, until } = require('selenium-webdriver');

const USERNAME = 'qabankimonline@gmail.com';
const ACCESS_KEY = '1sPgh89g81AybDayLQtz';

const capabilities = {
  'browserName': 'chrome',
  'browserstack.user': USERNAME,
  'browserstack.key': ACCESS_KEY,
  'os': 'Windows',
  'os_version': '10',
  'build': 'E2E-BankimOnline-Calculator', // Any identifier
  'name': 'Calculator Formula Test',
  'browserstack.debug': true,
  'browserstack.console': 'errors'
};

(async function main() {
  let driver = await new Builder()
    .usingServer('https://hub-cloud.browserstack.com/wd/hub')
    .withCapabilities(capabilities)
    .build();

  try {
    // Step 1: Open the page
    await driver.get('https://admin.bankimonline.com/calculator-formula');

    // Step 2: Wait for amount field to appear (update selector as needed)
    await driver.wait(until.elementLocated(By.name('amount')), 10000);

    // Step 3: Fill the form (update selectors if different!)
    await driver.findElement(By.name('amount')).sendKeys('100000');
    await driver.findElement(By.name('duration')).sendKeys('12');

    // Step 4: Click Calculate (update selector if needed)
    await driver.findElement(By.id('calculate')).click();

    // Step 5: Wait for result (update selector if needed)
    await driver.wait(until.elementLocated(By.id('result')), 10000);

    const result = await driver.findElement(By.id('result')).getText();
    console.log('Calculation result:', result);

    // Optional: Assert the result is a number
    if (!result || isNaN(parseFloat(result.replace(/[^\d.]/g, '')))) {
      throw new Error('Result is not a number!');
    } else {
      console.log('Test PASSED!');
    }
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await driver.quit();
  }
})();
NOTE:
Update By.name('amount'), By.name('duration'), By.id('calculate'), and By.id('result') if your fields have different attributes.
Inspect your HTML and adjust accordingly!
3. Run Your Test
In the terminal, from your project folder, run:
node test.js
This connects to BrowserStack and runs your test on a real Chrome/Windows VM.
4. View Test Results on BrowserStack
Go to https://automate.browserstack.com/
Under Builds, click the latest build (e.g., E2E-BankimOnline-Calculator)
Click the session to:
Watch a video of the run
View screenshots, logs, and step status
Debug any errors
5. Troubleshooting Tips
If your test fails with a selector error, use Chrome DevTools “Inspect” to check your actual input/button IDs or names.
Increase wait timeouts if your page loads slowly.
Update the script to match your actual UI.
6. Next Steps (Optional)
Run on different browsers/devices:
Change 'browserName': 'chrome' to 'firefox', 'edge', etc.
Test local or staging apps:
Use BrowserStack Local (see your settings for the Access Key and Local Folder URL).
Integrate into CI/CD:
Add the script to GitHub Actions, Jenkins, etc.
Summary Table
Step	Command/Action
Make project folder	mkdir browserstack-e2e && cd browserstack-e2e
Init npm	npm init -y
Install selenium	npm install selenium-webdriver
Create test.js	(Paste script, edit selectors as needed)
Run test	node test.js
View results	automate.browserstack.com


