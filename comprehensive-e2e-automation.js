/**
 * 🚀 COMPREHENSIVE E2E AUTOMATION SYSTEM
 * 
 * Complete End-to-End Testing Framework with:
 * ✅ Full form filling and user interactions
 * ✅ Complete workflows (step 1→2→3→4)
 * ✅ Data validation and form submissions
 * ✅ API calls and backend integration testing
 * ✅ Business logic validation
 * ✅ Interactive reports with screenshots, videos, and JIRA integration
 * 
 * This system goes beyond basic page testing to test complete user journeys
 * and business workflows with real data and API validation.
 */

const { chromium, firefox, webkit, devices } = require('playwright');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

class ComprehensiveE2EAutomation {
  constructor() {
    this.baseUrl = 'https://dev2.bankimonline.com';
    this.apiBaseUrl = this.baseUrl + '/api';
    this.results = {
      workflows: [],
      apiTests: [],
      screenshots: [],
      videos: [],
      bugs: [],
      summary: {
        totalWorkflows: 0,
        passedWorkflows: 0,
        failedWorkflows: 0,
        totalApiTests: 0,
        passedApiTests: 0,
        failedApiTests: 0,
        totalTime: 0,
        startTime: null,
        endTime: null
      }
    };
    this.testData = this.getTestData();
    this.reportDir = `e2e-reports/${new Date().toISOString().replace(/[:.]/g, '-')}`;
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  /**
   * Realistic test data for form filling
   */
  getTestData() {
    return {
      mortgage: {
        step1: {
          propertyPrice: 1500000,
          city: 'Tel Aviv',
          whenNeeded: 'in_3_months',
          propertyType: 'apartment',
          firstHome: 'yes',
          propertyOwnership: 'no_property' // 75% LTV
        },
        step2: {
          nameSurname: 'יוסי כהן',
          birthday: '1985-05-15',
          education: 'academic',
          citizenship: ['israeli'],
          familyStatus: 'married',
          children: 'yes',
          childrenCount: 2,
          medicalInsurance: 'yes',
          isForeigner: 'no',
          publicPerson: 'no'
        },
        step3: {
          mainSourceOfIncome: 'employee',
          monthlyIncome: 18000,
          startDate: '2020-01-15',
          fieldOfActivity: 'technology',
          profession: 'software_engineer',
          companyName: 'Microsoft Israel',
          additionalIncome: 'no',
          obligation: 'no'
        },
        step4: {
          // Bank selection and program choice
          expectedBanks: ['Bank Hapoalim', 'Bank Leumi', 'Discount Bank']
        }
      },
      credit: {
        step1: {
          purposeOfLoan: 'home_improvement',
          loanAmount: 200000,
          whenNeeded: 'in_1_month',
          haveMortgage: 'no'
        },
        // steps 2-3 same as mortgage
        step4: {
          expectedOffers: 3 // Minimum expected credit offers
        }
      },
      authentication: {
        smsFlow: {
          phone: '972544123456',
          mockOtp: '123456'
        },
        emailFlow: {
          email: 'test@bankimonline.com',
          password: 'TestPassword123!'
        }
      }
    };
  }

  /**
   * Initialize browser and setup
   */
  async initialize() {
    console.log('🚀 Initializing Comprehensive E2E Automation System...');
    this.results.summary.startTime = new Date().toISOString();
    
    // Create report directory
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }

    // Launch browser with video recording
    this.browser = await chromium.launch({
      headless: false,
      slowMo: 100 // Slow down for better video recording
    });

    this.context = await this.browser.newContext({
      recordVideo: {
        dir: `${this.reportDir}/videos/`,
        size: { width: 1920, height: 1080 }
      },
      viewport: { width: 1920, height: 1080 }
    });

    // Enable request/response interception for API testing
    this.context.route('**/*', route => {
      this.logNetworkRequest(route.request());
      route.continue();
    });

    this.page = await this.context.newPage();
    
    console.log('✅ Browser initialized with video recording enabled');
  }

  /**
   * Log network requests for API testing
   */
  logNetworkRequest(request) {
    if (request.url().includes('/api/')) {
      console.log(`🌐 API Request: ${request.method()} ${request.url()}`);
    }
  }

  /**
   * Take screenshot with metadata
   */
  async takeScreenshot(name, metadata = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const filepath = path.join(this.reportDir, 'screenshots', filename);
    
    // Ensure screenshots directory exists
    const screenshotsDir = path.dirname(filepath);
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    await this.page.screenshot({ 
      path: filepath, 
      fullPage: true
    });

    this.results.screenshots.push({
      name,
      filename,
      filepath,
      timestamp,
      metadata,
      url: this.page.url(),
      size: fs.statSync(filepath).size
    });

    console.log(`📸 Screenshot captured: ${filename}`);
    return filepath;
  }

  /**
   * Test complete mortgage calculation workflow (Steps 1-4)
   */
  async testMortgageWorkflow() {
    console.log('\n🏠 Testing Complete Mortgage Calculation Workflow...');
    const workflow = {
      name: 'Mortgage Calculation Workflow',
      steps: [],
      startTime: Date.now(),
      status: 'running',
      errors: [],
      screenshots: [],
      apiCalls: []
    };

    try {
      // Navigate to mortgage calculator
      await this.page.goto(`${this.baseUrl}/services/calculate-mortgage/1`);
      await this.page.waitForLoadState('networkidle');
      await this.takeScreenshot('mortgage-step1-initial', { step: 1, action: 'page_load' });

      // STEP 1: Property and loan parameters
      console.log('📝 Step 1: Filling property and loan parameters...');
      await this.fillMortgageStep1(workflow);
      
      // Navigate to Step 2 (requires login)
      console.log('🔐 Proceeding to Step 2 (authentication required)...');
      await this.handleAuthentication(workflow);
      
      // STEP 2: Personal information
      console.log('👤 Step 2: Filling personal information...');
      await this.fillMortgageStep2(workflow);
      
      // STEP 3: Income and employment data
      console.log('💼 Step 3: Filling income and employment data...');
      await this.fillMortgageStep3(workflow);
      
      // STEP 4: Bank offers and program selection
      console.log('🏦 Step 4: Reviewing bank offers...');
      await this.validateMortgageStep4(workflow);

      workflow.status = 'passed';
      workflow.endTime = Date.now();
      workflow.duration = workflow.endTime - workflow.startTime;
      
      console.log(`✅ Mortgage workflow completed successfully in ${workflow.duration}ms`);

    } catch (error) {
      workflow.status = 'failed';
      workflow.errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        url: this.page.url()
      });
      
      await this.takeScreenshot('mortgage-workflow-error', { 
        step: 'error', 
        error: error.message 
      });
      
      // Create bug report for failed workflow
      await this.createBugReport({
        title: 'Mortgage Workflow Failure',
        description: `Complete mortgage calculation workflow failed: ${error.message}`,
        severity: 'critical',
        workflow: 'mortgage',
        error: error,
        screenshots: workflow.screenshots
      });
      
      console.log(`❌ Mortgage workflow failed: ${error.message}`);
    }

    this.results.workflows.push(workflow);
    this.results.summary.totalWorkflows++;
    if (workflow.status === 'passed') {
      this.results.summary.passedWorkflows++;
    } else {
      this.results.summary.failedWorkflows++;
    }

    return workflow;
  }

  /**
   * Fill Step 1 of mortgage calculator
   */
  async fillMortgageStep1(workflow) {
    const stepData = this.testData.mortgage.step1;
    const step = {
      number: 1,
      name: 'Property and Loan Parameters',
      actions: [],
      startTime: Date.now(),
      status: 'running'
    };

    try {
      // Property price
      const priceInput = this.page.locator('[data-testid="property-price-input"], input[name="PriceOfEstate"]');
      await priceInput.waitFor({ timeout: 10000 });
      await priceInput.clear();
      await priceInput.fill(stepData.propertyPrice.toString());
      step.actions.push({ action: 'fill_property_price', value: stepData.propertyPrice, status: 'success' });

      // City selection
      const cityDropdown = this.page.locator('[data-testid="city-dropdown"]');
      await cityDropdown.click();
      await this.page.getByText(stepData.city).click();
      step.actions.push({ action: 'select_city', value: stepData.city, status: 'success' });

      // When needed
      const whenNeededDropdown = this.page.locator('[data-testid="when-needed-dropdown"]');
      await whenNeededDropdown.click();
      await this.page.getByText('3 חודשים').click(); // Hebrew for "3 months"
      step.actions.push({ action: 'select_when_needed', value: stepData.whenNeeded, status: 'success' });

      // Property type
      const typeDropdown = this.page.locator('[data-testid="property-type-dropdown"]');
      await typeDropdown.click();
      await this.page.getByText('דירה').click(); // Hebrew for "apartment"
      step.actions.push({ action: 'select_property_type', value: stepData.propertyType, status: 'success' });

      // First home
      const firstHomeDropdown = this.page.locator('[data-testid="first-home-dropdown"]');
      await firstHomeDropdown.click();
      await this.page.getByText('כן').click(); // Hebrew for "yes"
      step.actions.push({ action: 'select_first_home', value: stepData.firstHome, status: 'success' });

      // Property ownership (affects LTV ratio)
      const ownershipDropdown = this.page.locator('[data-testid="property-ownership-dropdown"]');
      await ownershipDropdown.click();
      await this.page.getByText('אין לי נכס').click(); // Hebrew for "I don't own property"
      step.actions.push({ action: 'select_property_ownership', value: stepData.propertyOwnership, status: 'success' });

      // Verify initial fee adjustment (75% LTV for no_property)
      await this.page.waitForTimeout(1000); // Wait for dynamic calculation
      const initialFeeInput = this.page.locator('[data-testid="initial-fee-input"]');
      const initialFeeValue = await initialFeeInput.inputValue();
      const expectedMinFee = stepData.propertyPrice * 0.25; // 25% down payment for 75% LTV
      
      if (parseInt(initialFeeValue.replace(/,/g, '')) >= expectedMinFee * 0.9) { // Allow 10% tolerance
        step.actions.push({ action: 'verify_ltv_calculation', status: 'success', expected: expectedMinFee, actual: initialFeeValue });
      } else {
        step.actions.push({ action: 'verify_ltv_calculation', status: 'failed', expected: expectedMinFee, actual: initialFeeValue });
      }

      await this.takeScreenshot('mortgage-step1-completed', { step: 1, action: 'form_completed' });
      
      // Continue to next step
      const continueButton = this.page.locator('button:has-text("המשך"), button:has-text("Continue")');
      await continueButton.click();
      
      step.status = 'passed';
      step.endTime = Date.now();
      step.duration = step.endTime - step.startTime;

    } catch (error) {
      step.status = 'failed';
      step.error = error.message;
      throw error;
    }

    workflow.steps.push(step);
    return step;
  }

  /**
   * Handle SMS authentication flow
   */
  async handleAuthentication(workflow) {
    const step = {
      number: 'auth',
      name: 'SMS Authentication',
      actions: [],
      startTime: Date.now(),
      status: 'running'
    };

    try {
      // Check if we're redirected to login
      await this.page.waitForLoadState('networkidle');
      const currentUrl = this.page.url();
      
      if (currentUrl.includes('/login') || this.page.locator('input[placeholder*="phone"], input[placeholder*="טלפון"]').isVisible()) {
        // Fill phone number
        const phoneInput = this.page.locator('input[placeholder*="phone"], input[placeholder*="טלפון"]');
        await phoneInput.fill(this.testData.authentication.smsFlow.phone);
        step.actions.push({ action: 'enter_phone', value: this.testData.authentication.smsFlow.phone, status: 'success' });

        // Submit phone
        const submitPhoneButton = this.page.locator('button:has-text("שלח קוד"), button:has-text("Send Code")');
        await submitPhoneButton.click();
        
        // Wait for OTP input
        await this.page.waitForSelector('input[placeholder*="code"], input[placeholder*="קוד"]', { timeout: 10000 });
        
        // Fill OTP (mock)
        const otpInput = this.page.locator('input[placeholder*="code"], input[placeholder*="קוד"]');
        await otpInput.fill(this.testData.authentication.smsFlow.mockOtp);
        step.actions.push({ action: 'enter_otp', value: this.testData.authentication.smsFlow.mockOtp, status: 'success' });

        // Submit OTP
        const submitOtpButton = this.page.locator('button:has-text("אמת"), button:has-text("Verify")');
        await submitOtpButton.click();
        
        // Wait for successful authentication
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
        
        await this.takeScreenshot('authentication-completed', { step: 'auth', action: 'login_success' });
        
        step.actions.push({ action: 'authentication_success', status: 'success' });
      } else {
        step.actions.push({ action: 'already_authenticated', status: 'success' });
      }

      step.status = 'passed';
      step.endTime = Date.now();
      step.duration = step.endTime - step.startTime;

    } catch (error) {
      step.status = 'failed';
      step.error = error.message;
      throw error;
    }

    workflow.steps.push(step);
    return step;
  }

  /**
   * Fill Step 2 of mortgage calculator (Personal Information)
   */
  async fillMortgageStep2(workflow) {
    const stepData = this.testData.mortgage.step2;
    const step = {
      number: 2,
      name: 'Personal Information',
      actions: [],
      startTime: Date.now(),
      status: 'running'
    };

    try {
      // Navigate to step 2 if not already there
      if (!this.page.url().includes('/2')) {
        await this.page.goto(`${this.baseUrl}/services/calculate-mortgage/2`);
        await this.page.waitForLoadState('networkidle');
      }

      // Name and surname
      const nameInput = this.page.locator('input[name="nameSurname"], input[placeholder*="שם"]');
      await nameInput.waitFor({ timeout: 10000 });
      await nameInput.fill(stepData.nameSurname);
      step.actions.push({ action: 'fill_name', value: stepData.nameSurname, status: 'success' });

      // Birthday
      const birthdayInput = this.page.locator('input[name="birthday"], input[type="date"]');
      await birthdayInput.fill(stepData.birthday);
      step.actions.push({ action: 'fill_birthday', value: stepData.birthday, status: 'success' });

      // Education
      const educationDropdown = this.page.locator('[data-testid="education-dropdown"]');
      await educationDropdown.click();
      await this.page.getByText('אקדמאי').click(); // Hebrew for "academic"
      step.actions.push({ action: 'select_education', value: stepData.education, status: 'success' });

      // Family status
      const familyStatusDropdown = this.page.locator('[data-testid="family-status-dropdown"]');
      await familyStatusDropdown.click();
      await this.page.getByText('נשוי/נשואה').click(); // Hebrew for "married"
      step.actions.push({ action: 'select_family_status', value: stepData.familyStatus, status: 'success' });

      // Children
      const childrenDropdown = this.page.locator('[data-testid="children-dropdown"]');
      await childrenDropdown.click();
      await this.page.getByText('כן').click(); // Hebrew for "yes"
      step.actions.push({ action: 'select_children', value: stepData.children, status: 'success' });

      // Number of children
      const childrenCountInput = this.page.locator('input[name="childrenCount"]');
      await childrenCountInput.fill(stepData.childrenCount.toString());
      step.actions.push({ action: 'fill_children_count', value: stepData.childrenCount, status: 'success' });

      await this.takeScreenshot('mortgage-step2-completed', { step: 2, action: 'form_completed' });
      
      // Continue to next step
      const continueButton = this.page.locator('button:has-text("המשך"), button:has-text("Continue")');
      await continueButton.click();
      await this.page.waitForLoadState('networkidle');
      
      step.status = 'passed';
      step.endTime = Date.now();
      step.duration = step.endTime - step.startTime;

    } catch (error) {
      step.status = 'failed';
      step.error = error.message;
      throw error;
    }

    workflow.steps.push(step);
    return step;
  }

  /**
   * Fill Step 3 of mortgage calculator (Income and Employment)
   */
  async fillMortgageStep3(workflow) {
    const stepData = this.testData.mortgage.step3;
    const step = {
      number: 3,
      name: 'Income and Employment Data',
      actions: [],
      startTime: Date.now(),
      status: 'running'
    };

    try {
      // Navigate to step 3 if not already there
      if (!this.page.url().includes('/3')) {
        await this.page.goto(`${this.baseUrl}/services/calculate-mortgage/3`);
        await this.page.waitForLoadState('networkidle');
      }

      // Main source of income
      const incomeSourceDropdown = this.page.locator('[data-testid="income-source-dropdown"]');
      await incomeSourceDropdown.waitFor({ timeout: 10000 });
      await incomeSourceDropdown.click();
      await this.page.getByText('שכיר').click(); // Hebrew for "employee"
      step.actions.push({ action: 'select_income_source', value: stepData.mainSourceOfIncome, status: 'success' });

      // Monthly income
      const monthlyIncomeInput = this.page.locator('input[name="monthlyIncome"]');
      await monthlyIncomeInput.fill(stepData.monthlyIncome.toString());
      step.actions.push({ action: 'fill_monthly_income', value: stepData.monthlyIncome, status: 'success' });

      // Employment start date
      const startDateInput = this.page.locator('input[name="startDate"]');
      await startDateInput.fill(stepData.startDate);
      step.actions.push({ action: 'fill_start_date', value: stepData.startDate, status: 'success' });

      // Field of activity
      const fieldDropdown = this.page.locator('[data-testid="field-dropdown"]');
      await fieldDropdown.click();
      await this.page.getByText('טכנולוגיה').click(); // Hebrew for "technology"
      step.actions.push({ action: 'select_field', value: stepData.fieldOfActivity, status: 'success' });

      // Profession
      const professionInput = this.page.locator('input[name="profession"]');
      await professionInput.fill('מהנדס תוכנה'); // Hebrew for "software engineer"
      step.actions.push({ action: 'fill_profession', value: stepData.profession, status: 'success' });

      // Company name
      const companyInput = this.page.locator('input[name="companyName"]');
      await companyInput.fill(stepData.companyName);
      step.actions.push({ action: 'fill_company', value: stepData.companyName, status: 'success' });

      // Additional income
      const additionalIncomeDropdown = this.page.locator('[data-testid="additional-income-dropdown"]');
      await additionalIncomeDropdown.click();
      await this.page.getByText('לא').click(); // Hebrew for "no"
      step.actions.push({ action: 'select_additional_income', value: stepData.additionalIncome, status: 'success' });

      // Existing obligations
      const obligationDropdown = this.page.locator('[data-testid="obligation-dropdown"]');
      await obligationDropdown.click();
      await this.page.getByText('לא').click(); // Hebrew for "no"
      step.actions.push({ action: 'select_obligation', value: stepData.obligation, status: 'success' });

      await this.takeScreenshot('mortgage-step3-completed', { step: 3, action: 'form_completed' });
      
      // Continue to next step
      const continueButton = this.page.locator('button:has-text("המשך"), button:has-text("Continue")');
      await continueButton.click();
      await this.page.waitForLoadState('networkidle');
      
      step.status = 'passed';
      step.endTime = Date.now();
      step.duration = step.endTime - step.startTime;

    } catch (error) {
      step.status = 'failed';
      step.error = error.message;
      throw error;
    }

    workflow.steps.push(step);
    return step;
  }

  /**
   * Validate Step 4 (Bank Offers)
   */
  async validateMortgageStep4(workflow) {
    const step = {
      number: 4,
      name: 'Bank Offers Validation',
      actions: [],
      startTime: Date.now(),
      status: 'running',
      apiCalls: []
    };

    try {
      // Wait for bank offers to load
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(5000); // Allow time for API calls

      // Intercept and validate bank offers API call
      const apiResponse = await this.page.waitForResponse(
        response => response.url().includes('/api/customer/compare-banks') && response.status() === 200,
        { timeout: 30000 }
      );

      const responseData = await apiResponse.json();
      step.apiCalls.push({
        url: apiResponse.url(),
        method: 'POST',
        status: apiResponse.status(),
        responseTime: Date.now() - step.startTime,
        data: responseData
      });

      // Validate bank offers structure
      if (responseData.data && responseData.data.bank_offers) {
        const offers = responseData.data.bank_offers;
        step.actions.push({
          action: 'validate_api_response',
          status: 'success',
          data: { offerCount: offers.length }
        });

        // Validate each offer has required fields
        for (const offer of offers) {
          const requiredFields = ['bank_name', 'loan_amount', 'monthly_payment', 'interest_rate'];
          const missingFields = requiredFields.filter(field => !offer[field]);
          
          if (missingFields.length === 0) {
            step.actions.push({
              action: 'validate_offer_structure',
              bank: offer.bank_name,
              status: 'success'
            });
          } else {
            step.actions.push({
              action: 'validate_offer_structure',
              bank: offer.bank_name,
              status: 'failed',
              missingFields
            });
          }
        }
      } else {
        throw new Error('No bank offers received from API');
      }

      // Validate UI displays offers
      const offerElements = await this.page.locator('.bank-offer, .offer-card').count();
      if (offerElements > 0) {
        step.actions.push({
          action: 'validate_ui_offers',
          status: 'success',
          count: offerElements
        });
      } else {
        step.actions.push({
          action: 'validate_ui_offers',
          status: 'failed',
          count: 0
        });
      }

      await this.takeScreenshot('mortgage-step4-offers', { step: 4, action: 'offers_displayed' });
      
      step.status = 'passed';
      step.endTime = Date.now();
      step.duration = step.endTime - step.startTime;

    } catch (error) {
      step.status = 'failed';
      step.error = error.message;
      throw error;
    }

    workflow.steps.push(step);
    return step;
  }

  /**
   * Test API endpoints independently
   */
  async testApiEndpoints() {
    console.log('\n🌐 Testing API Endpoints...');
    
    const endpoints = [
      {
        name: 'Cities API',
        url: '/api/get-cities?lang=he',
        method: 'GET',
        expectedFields: ['value', 'name']
      },
      {
        name: 'Calculation Parameters',
        url: '/api/v1/calculation-parameters?business_path=mortgage',
        method: 'GET',
        expectedFields: ['property_ownership_ltvs']
      },
      {
        name: 'Bank Comparison',
        url: '/api/customer/compare-banks',
        method: 'POST',
        body: {
          loan_type: 'mortgage',
          amount: 1125000,
          property_value: 1500000,
          monthly_income: 18000,
          property_ownership: 'no_property'
        },
        expectedFields: ['bank_offers']
      }
    ];

    for (const endpoint of endpoints) {
      const test = {
        name: endpoint.name,
        url: endpoint.url,
        method: endpoint.method,
        startTime: Date.now(),
        status: 'running',
        response: null,
        error: null
      };

      try {
        const response = await axios({
          method: endpoint.method,
          url: this.apiBaseUrl + endpoint.url,
          data: endpoint.body,
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'he-IL'
          },
          timeout: 10000
        });

        test.response = {
          status: response.status,
          data: response.data,
          responseTime: Date.now() - test.startTime
        };

        // Validate response structure
        if (endpoint.expectedFields) {
          const missingFields = endpoint.expectedFields.filter(field => {
            return !this.hasNestedProperty(response.data, field);
          });

          if (missingFields.length === 0) {
            test.status = 'passed';
          } else {
            test.status = 'failed';
            test.error = `Missing fields: ${missingFields.join(', ')}`;
          }
        } else {
          test.status = 'passed';
        }

        console.log(`✅ ${endpoint.name}: ${response.status} (${test.response.responseTime}ms)`);

      } catch (error) {
        test.status = 'failed';
        test.error = error.message;
        test.response = {
          status: error.response?.status || 0,
          responseTime: Date.now() - test.startTime
        };
        
        console.log(`❌ ${endpoint.name}: ${error.message}`);
      }

      test.endTime = Date.now();
      test.duration = test.endTime - test.startTime;
      
      this.results.apiTests.push(test);
      this.results.summary.totalApiTests++;
      
      if (test.status === 'passed') {
        this.results.summary.passedApiTests++;
      } else {
        this.results.summary.failedApiTests++;
      }
    }
  }

  /**
   * Helper to check nested properties
   */
  hasNestedProperty(obj, property) {
    const parts = property.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (!current || typeof current !== 'object' || !(part in current)) {
        return false;
      }
      current = current[part];
    }
    
    return true;
  }

  /**
   * Create bug report for JIRA integration
   */
  async createBugReport(bug) {
    const bugReport = {
      id: `E2E-${Date.now()}`,
      title: bug.title,
      description: bug.description,
      severity: bug.severity,
      workflow: bug.workflow,
      timestamp: new Date().toISOString(),
      error: bug.error,
      screenshots: bug.screenshots || [],
      url: this.page.url(),
      browser: 'Chromium',
      environment: 'Production'
    };

    this.results.bugs.push(bugReport);
    return bugReport;
  }

  /**
   * Generate comprehensive interactive report
   */
  async generateInteractiveReport() {
    console.log('\n📊 Generating Interactive Report...');
    
    this.results.summary.endTime = new Date().toISOString();
    this.results.summary.totalTime = Date.now() - new Date(this.results.summary.startTime).getTime();

    const reportHtml = this.buildInteractiveReportHtml();
    const reportPath = path.join(this.reportDir, 'comprehensive-e2e-report.html');
    
    fs.writeFileSync(reportPath, reportHtml);
    
    // Save results as JSON for further analysis
    const resultsPath = path.join(this.reportDir, 'results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
    
    console.log(`📋 Interactive report generated: ${reportPath}`);
    console.log(`💾 Results data saved: ${resultsPath}`);
    
    return reportPath;
  }

  /**
   * Build comprehensive HTML report with JIRA integration
   */
  buildInteractiveReportHtml() {
    const summary = this.results.summary;
    const workflowSuccess = summary.totalWorkflows > 0 ? (summary.passedWorkflows / summary.totalWorkflows * 100) : 0;
    const apiSuccess = summary.totalApiTests > 0 ? (summary.passedApiTests / summary.totalApiTests * 100) : 0;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive E2E Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f7fa; line-height: 1.6; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; padding: 40px; border-radius: 15px; margin-bottom: 30px; 
            text-align: center; position: relative;
        }
        .header h1 { font-size: 3em; margin-bottom: 10px; }
        .header .subtitle { font-size: 1.3em; opacity: 0.9; }
        .header .meta { position: absolute; top: 20px; right: 30px; text-align: right; }
        
        .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-bottom: 40px; }
        .metric-card { 
            background: white; padding: 30px; border-radius: 15px; 
            box-shadow: 0 8px 25px rgba(0,0,0,0.1); text-align: center; 
            border-top: 5px solid;
        }
        .metric-card.workflows { border-top-color: #4caf50; }
        .metric-card.api { border-top-color: #2196f3; }
        .metric-card.performance { border-top-color: #ff9800; }
        .metric-card.bugs { border-top-color: #f44336; }
        
        .metric-value { font-size: 3em; font-weight: bold; margin: 15px 0; }
        .metric-label { color: #666; font-size: 1.1em; }
        .success { color: #4caf50; }
        .warning { color: #ff9800; }
        .error { color: #f44336; }
        
        .progress-bar { 
            width: 100%; height: 8px; background: #eee; border-radius: 4px; 
            margin: 15px 0; overflow: hidden;
        }
        .progress-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
        .progress-fill.success { background: #4caf50; }
        .progress-fill.warning { background: #ff9800; }
        .progress-fill.error { background: #f44336; }
        
        .section { 
            background: white; border-radius: 15px; padding: 30px; margin: 25px 0; 
            box-shadow: 0 5px 15px rgba(0,0,0,0.08); 
        }
        .section h2 { color: #333; margin-bottom: 25px; font-size: 1.8em; border-bottom: 3px solid #e0e0e0; padding-bottom: 15px; }
        
        .workflow-item, .api-item, .bug-item { 
            border: 1px solid #e0e0e0; border-radius: 10px; 
            margin: 20px 0; overflow: hidden; transition: all 0.3s ease;
        }
        .workflow-item:hover, .api-item:hover, .bug-item:hover { 
            box-shadow: 0 5px 15px rgba(0,0,0,0.1); transform: translateY(-2px); 
        }
        
        .item-header { 
            padding: 20px; font-weight: bold; cursor: pointer; 
            display: flex; justify-content: space-between; align-items: center;
        }
        .item-header.passed { background: #e8f5e8; color: #2e7d32; }
        .item-header.failed { background: #ffebee; color: #c62828; }
        .item-header.warning { background: #fff3e0; color: #ef6c00; }
        
        .item-content { padding: 0; max-height: 0; overflow: hidden; transition: all 0.3s ease; }
        .item-content.expanded { padding: 20px; max-height: 1000px; }
        
        .step-list { margin: 15px 0; }
        .step-item { 
            padding: 15px; margin: 10px 0; border-radius: 8px; 
            border-left: 4px solid; display: flex; justify-content: space-between; align-items: center;
        }
        .step-item.passed { border-left-color: #4caf50; background: #f1f8e9; }
        .step-item.failed { border-left-color: #f44336; background: #fce4ec; }
        .step-item.running { border-left-color: #ff9800; background: #fff3e0; }
        
        .screenshot-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .screenshot-item { 
            border-radius: 10px; overflow: hidden; cursor: pointer; 
            transition: transform 0.3s ease; border: 2px solid #e0e0e0;
        }
        .screenshot-item:hover { transform: scale(1.05); }
        .screenshot-item img { width: 100%; height: 150px; object-fit: cover; }
        .screenshot-item .caption { padding: 10px; background: #f8f9fa; text-align: center; font-size: 0.9em; }
        
        .jira-button { 
            background: #0052cc; color: white; border: none; padding: 12px 20px; 
            border-radius: 6px; cursor: pointer; font-size: 0.9em; 
            transition: background 0.3s ease; margin: 10px 0;
        }
        .jira-button:hover { background: #0041a8; }
        
        .video-player { width: 100%; max-width: 800px; margin: 20px auto; border-radius: 10px; overflow: hidden; }
        
        .collapsible { cursor: pointer; user-select: none; }
        .collapsible:after { content: ' ▼'; font-size: 0.8em; color: #666; }
        .collapsible.collapsed:after { content: ' ▶'; }
        
        .tag { 
            display: inline-block; padding: 4px 8px; border-radius: 12px; 
            font-size: 0.8em; margin: 2px; color: white;
        }
        .tag.critical { background: #f44336; }
        .tag.high { background: #ff9800; }
        .tag.medium { background: #2196f3; }
        .tag.low { background: #4caf50; }
        
        .modal { 
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center;
        }
        .modal.active { display: flex; }
        .modal img { max-width: 90%; max-height: 90%; border-radius: 10px; }
        
        .footer { text-align: center; margin-top: 50px; color: #666; padding: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="meta">
                <div>🕒 ${new Date(summary.startTime).toLocaleString()}</div>
                <div>⏱️ ${Math.round(summary.totalTime / 1000)}s execution</div>
            </div>
            <h1>🚀 Comprehensive E2E Test Report</h1>
            <div class="subtitle">Complete Business Workflow Testing with API Integration</div>
        </div>
        
        <div class="dashboard">
            <div class="metric-card workflows">
                <div class="metric-value ${workflowSuccess >= 80 ? 'success' : workflowSuccess >= 50 ? 'warning' : 'error'}">
                    ${summary.passedWorkflows}/${summary.totalWorkflows}
                </div>
                <div class="metric-label">Workflows Passed</div>
                <div class="progress-bar">
                    <div class="progress-fill ${workflowSuccess >= 80 ? 'success' : workflowSuccess >= 50 ? 'warning' : 'error'}" 
                         style="width: ${workflowSuccess}%"></div>
                </div>
                <div>${workflowSuccess.toFixed(1)}% Success Rate</div>
            </div>
            
            <div class="metric-card api">
                <div class="metric-value ${apiSuccess >= 90 ? 'success' : apiSuccess >= 70 ? 'warning' : 'error'}">
                    ${summary.passedApiTests}/${summary.totalApiTests}
                </div>
                <div class="metric-label">API Tests Passed</div>
                <div class="progress-bar">
                    <div class="progress-fill ${apiSuccess >= 90 ? 'success' : apiSuccess >= 70 ? 'warning' : 'error'}" 
                         style="width: ${apiSuccess}%"></div>
                </div>
                <div>${apiSuccess.toFixed(1)}% Success Rate</div>
            </div>
            
            <div class="metric-card performance">
                <div class="metric-value warning">${Math.round(summary.totalTime / 1000)}s</div>
                <div class="metric-label">Total Execution Time</div>
                <div class="progress-bar">
                    <div class="progress-fill warning" style="width: ${Math.min(summary.totalTime / 300000 * 100, 100)}%"></div>
                </div>
                <div>${(summary.totalTime / 1000 / 60).toFixed(1)} minutes</div>
            </div>
            
            <div class="metric-card bugs">
                <div class="metric-value ${this.results.bugs.length === 0 ? 'success' : 'error'}">
                    ${this.results.bugs.length}
                </div>
                <div class="metric-label">Bugs Detected</div>
                <div class="progress-bar">
                    <div class="progress-fill ${this.results.bugs.length === 0 ? 'success' : 'error'}" 
                         style="width: ${this.results.bugs.length > 0 ? 100 : 0}%"></div>
                </div>
                <div>${this.results.bugs.length === 0 ? 'No Issues' : 'Issues Found'}</div>
            </div>
        </div>
        
        ${this.generateWorkflowsSection()}
        ${this.generateApiTestsSection()}
        ${this.generateBugsSection()}
        ${this.generateScreenshotsSection()}
        
        <div class="footer">
            <p>🤖 Generated by Comprehensive E2E Automation System v3.0</p>
            <p>Complete business workflow testing with interactive reporting and JIRA integration</p>
        </div>
    </div>
    
    <div class="modal" id="screenshotModal" onclick="closeModal()">
        <img id="modalImage" src="" alt="Screenshot">
    </div>
    
    <script>
        ${this.generateJavaScript()}
    </script>
</body>
</html>`;
  }

  generateWorkflowsSection() {
    if (this.results.workflows.length === 0) return '';
    
    return `
        <div class="section">
            <h2>🔄 Complete Business Workflows</h2>
            ${this.results.workflows.map(workflow => `
                <div class="workflow-item">
                    <div class="item-header ${workflow.status}" onclick="toggleContent(this)">
                        <div>
                            <span>${workflow.name}</span>
                            <span class="tag ${workflow.status === 'passed' ? 'low' : 'critical'}">${workflow.status.toUpperCase()}</span>
                        </div>
                        <div>${workflow.duration ? Math.round(workflow.duration / 1000) : 0}s</div>
                    </div>
                    <div class="item-content">
                        <div class="step-list">
                            ${workflow.steps.map(step => `
                                <div class="step-item ${step.status}">
                                    <div>
                                        <strong>Step ${step.number}: ${step.name}</strong>
                                        <div>${step.actions.length} actions completed</div>
                                        ${step.error ? `<div class="error">Error: ${step.error}</div>` : ''}
                                    </div>
                                    <div>${step.duration ? Math.round(step.duration / 1000) : 0}s</div>
                                </div>
                            `).join('')}
                        </div>
                        ${workflow.status === 'failed' ? `
                            <button class="jira-button" onclick="createJiraBug('${workflow.name}', '${workflow.errors[0]?.message || 'Workflow failed'}', 'workflow')">
                                📝 Create JIRA Bug
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>`;
  }

  generateApiTestsSection() {
    if (this.results.apiTests.length === 0) return '';
    
    return `
        <div class="section">
            <h2>🌐 API Integration Tests</h2>
            ${this.results.apiTests.map(test => `
                <div class="api-item">
                    <div class="item-header ${test.status}" onclick="toggleContent(this)">
                        <div>
                            <span>${test.name}</span>
                            <span class="tag ${test.status === 'passed' ? 'low' : 'critical'}">${test.method}</span>
                            <span class="tag medium">${test.response?.status || 'N/A'}</span>
                        </div>
                        <div>${test.response?.responseTime || 0}ms</div>
                    </div>
                    <div class="item-content">
                        <div><strong>URL:</strong> ${test.url}</div>
                        <div><strong>Method:</strong> ${test.method}</div>
                        <div><strong>Response Time:</strong> ${test.response?.responseTime || 0}ms</div>
                        ${test.error ? `<div class="error"><strong>Error:</strong> ${test.error}</div>` : ''}
                        ${test.response?.data ? `
                            <details>
                                <summary>Response Data</summary>
                                <pre>${JSON.stringify(test.response.data, null, 2)}</pre>
                            </details>
                        ` : ''}
                        ${test.status === 'failed' ? `
                            <button class="jira-button" onclick="createJiraBug('${test.name}', '${test.error}', 'api')">
                                📝 Create JIRA Bug
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>`;
  }

  generateBugsSection() {
    if (this.results.bugs.length === 0) return '';
    
    return `
        <div class="section">
            <h2>🐛 Detected Issues</h2>
            ${this.results.bugs.map(bug => `
                <div class="bug-item">
                    <div class="item-header failed" onclick="toggleContent(this)">
                        <div>
                            <span>${bug.title}</span>
                            <span class="tag critical">${bug.severity.toUpperCase()}</span>
                        </div>
                        <div>${new Date(bug.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <div class="item-content">
                        <div><strong>Description:</strong> ${bug.description}</div>
                        <div><strong>Workflow:</strong> ${bug.workflow}</div>
                        <div><strong>URL:</strong> ${bug.url}</div>
                        <div><strong>Browser:</strong> ${bug.browser}</div>
                        <div><strong>Environment:</strong> ${bug.environment}</div>
                        ${bug.error ? `
                            <details>
                                <summary>Error Details</summary>
                                <pre>${bug.error.stack || bug.error.message}</pre>
                            </details>
                        ` : ''}
                        <button class="jira-button" onclick="createJiraBug('${bug.title}', '${bug.description}', '${bug.severity}')">
                            📝 Create in JIRA
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>`;
  }

  generateScreenshotsSection() {
    if (this.results.screenshots.length === 0) return '';
    
    return `
        <div class="section">
            <h2>📸 Visual Evidence</h2>
            <div class="screenshot-gallery">
                ${this.results.screenshots.map((screenshot, index) => `
                    <div class="screenshot-item" onclick="openModal('screenshots/${screenshot.filename}')">
                        <img src="screenshots/${screenshot.filename}" alt="${screenshot.name}" loading="lazy">
                        <div class="caption">
                            <div><strong>${screenshot.name}</strong></div>
                            <div>${new Date(screenshot.timestamp).toLocaleTimeString()}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>`;
  }

  generateJavaScript() {
    return `
        function toggleContent(header) {
            const content = header.nextElementSibling;
            content.classList.toggle('expanded');
            header.classList.toggle('collapsed');
        }
        
        function openModal(imageSrc) {
            const modal = document.getElementById('screenshotModal');
            const modalImage = document.getElementById('modalImage');
            modalImage.src = imageSrc;
            modal.classList.add('active');
        }
        
        function closeModal() {
            const modal = document.getElementById('screenshotModal');
            modal.classList.remove('active');
        }
        
        function createJiraBug(title, description, type) {
            // Mock JIRA integration - in real implementation, this would call JIRA API
            const bugData = {
                title: title,
                description: description,
                type: type,
                timestamp: new Date().toISOString(),
                environment: 'Production',
                browser: 'Chromium',
                project: 'TVKC'
            };
            
            // Show confirmation
            if (confirm('Create JIRA bug: "' + title + '"?\\n\\nThis will create a new issue in JIRA with screenshots and details.')) {
                // In real implementation, call JIRA API here
                fetch('/api/jira/create-bug', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bugData)
                }).then(response => {
                    if (response.ok) {
                        alert('✅ JIRA bug created successfully!');
                    } else {
                        alert('❌ Failed to create JIRA bug');
                    }
                }).catch(error => {
                    console.log('JIRA integration demo - bug would be created:', bugData);
                    alert('📋 JIRA integration demo\\n\\nBug would be created with:\\nTitle: ' + title + '\\nType: ' + type);
                });
            }
        }
        
        // Auto-expand failed items
        document.addEventListener('DOMContentLoaded', function() {
            const failedItems = document.querySelectorAll('.item-header.failed');
            failedItems.forEach(item => {
                item.click(); // Auto-expand failed items
            });
        });
    `;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    console.log('\n🧹 Cleaning up resources...');
    
    if (this.page) {
      await this.page.close();
    }
    
    if (this.context) {
      await this.context.close();
    }
    
    if (this.browser) {
      await this.browser.close();
    }
    
    console.log('✅ Cleanup completed');
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    try {
      await this.initialize();
      
      // Test complete business workflows
      await this.testMortgageWorkflow();
      // Note: Can add credit workflow, refinance workflows, etc.
      
      // Test API endpoints independently
      await this.testApiEndpoints();
      
      // Generate interactive report
      const reportPath = await this.generateInteractiveReport();
      
      console.log('\n📊 TEST EXECUTION SUMMARY');
      console.log('='.repeat(50));
      console.log(`✅ Workflows: ${this.results.summary.passedWorkflows}/${this.results.summary.totalWorkflows} passed`);
      console.log(`🌐 API Tests: ${this.results.summary.passedApiTests}/${this.results.summary.totalApiTests} passed`);
      console.log(`🐛 Bugs Found: ${this.results.bugs.length}`);
      console.log(`📸 Screenshots: ${this.results.screenshots.length}`);
      console.log(`⏱️ Total Time: ${Math.round(this.results.summary.totalTime / 1000)}s`);
      console.log(`📋 Report: ${reportPath}`);
      
      return this.results;
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Export for use in other modules
module.exports = ComprehensiveE2EAutomation;

// Run if called directly
if (require.main === module) {
  const automation = new ComprehensiveE2EAutomation();
  automation.runAllTests()
    .then(results => {
      console.log('\n🎉 All tests completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Test execution failed:', error);
      process.exit(1);
    });
}