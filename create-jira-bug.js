const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

/**
 * JIRA BUG CREATION SCRIPT
 * Creates bugs in Jira from the test report
 */

class JiraBugCreator {
  constructor(config) {
    // Jira configuration
    this.baseUrl = config.baseUrl || 'https://bankimonline.atlassian.net';
    this.email = config.email || process.env.JIRA_EMAIL;
    this.apiToken = config.apiToken || process.env.JIRA_API_TOKEN;
    this.projectKey = config.projectKey || 'BANKIM'; // Update with your project key
    
    if (!this.email || !this.apiToken) {
      console.error('❌ JIRA_EMAIL and JIRA_API_TOKEN environment variables are required!');
      console.log('Please set them:');
      console.log('export JIRA_EMAIL="your-email@company.com"');
      console.log('export JIRA_API_TOKEN="your-api-token"');
      console.log('\nTo get an API token: https://id.atlassian.com/manage-profile/security/api-tokens');
      process.exit(1);
    }
    
    // Create axios instance with auth
    this.api = axios.create({
      baseURL: `${this.baseUrl}/rest/api/3`,
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.email}:${this.apiToken}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Create the navigation bug in Jira
   */
  async createNavigationBug() {
    const bugData = {
      fields: {
        project: {
          key: this.projectKey
        },
        summary: '[CRITICAL] Menu button disappears after navigating from service pages',
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: '🚨 CRITICAL UI/UX BUG: Menu Navigation Broken' }]
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'When navigating from service pages (e.g., Mortgage Calculator) back to the homepage using the logo, the hamburger menu button disappears or becomes non-functional.'
                }
              ]
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'This prevents users from accessing the menu without refreshing the page.',
                  marks: [{ type: 'strong' }]
                }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 3 },
              content: [{ type: 'text', text: 'Environment' }]
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [{
                    type: 'paragraph',
                    content: [{ type: 'text', text: `URL: http://localhost:5173` }]
                  }]
                },
                {
                  type: 'listItem',
                  content: [{
                    type: 'paragraph',
                    content: [{ type: 'text', text: `Test Date: ${new Date().toISOString()}` }]
                  }]
                },
                {
                  type: 'listItem',
                  content: [{
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Browser: Chrome (Playwright)' }]
                  }]
                },
                {
                  type: 'listItem',
                  content: [{
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Severity: CRITICAL - Blocks main navigation functionality' }]
                  }]
                }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 3 },
              content: [{ type: 'text', text: 'Steps to Reproduce' }]
            },
            {
              type: 'orderedList',
              content: [
                {
                  type: 'listItem',
                  content: [{
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Navigate to homepage (http://localhost:5173)' }]
                  }]
                },
                {
                  type: 'listItem',
                  content: [{
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Click hamburger menu button to open menu' }]
                  }]
                },
                {
                  type: 'listItem',
                  content: [{
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Navigate to "השירותים שלנו" (Our Services)' }]
                  }]
                },
                {
                  type: 'listItem',
                  content: [{
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Click on "חישוב משכנתא" (Mortgage Calculator)' }]
                  }]
                },
                {
                  type: 'listItem',
                  content: [{
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Click the logo to navigate back to homepage' }]
                  }]
                },
                {
                  type: 'listItem',
                  content: [{
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Try to open the menu - Button is not visible!' }]
                  }]
                }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 3 },
              content: [{ type: 'text', text: 'Expected Result' }]
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Menu button should be visible and functional after navigating back to homepage via logo'
                }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 3 },
              content: [{ type: 'text', text: 'Actual Result' }]
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Menu button disappears and requires page refresh to restore functionality',
                  marks: [{ type: 'strong' }]
                }
              ]
            },
            {
              type: 'heading',
              attrs: { level: 3 },
              content: [{ type: 'text', text: 'Technical Details' }]
            },
            {
              type: 'codeBlock',
              attrs: { language: 'javascript' },
              content: [{
                type: 'text',
                text: `// Problem in Header.tsx
// The burger button visibility is tied to isService flag
{!isMobile && !isService && (
  <button className={cx('burger')} onClick={onOpenMobileMenu}>
    <span>{''}</span>
  </button>
)}`
              }]
            }
          ]
        },
        issuetype: {
          name: 'Bug'
        },
        priority: {
          name: 'Critical'
        },
        labels: ['menu-navigation', 'ui-ux', 'critical-bug', 'qa-automation'],
        components: [
          { name: 'Frontend' } // Update with your component name
        ]
      }
    };

    try {
      console.log('📝 Creating Jira bug...');
      const response = await this.api.post('/issue', bugData);
      
      const issueKey = response.data.key;
      const issueUrl = `${this.baseUrl}/browse/${issueKey}`;
      
      console.log('✅ Bug created successfully!');
      console.log(`🔗 Issue Key: ${issueKey}`);
      console.log(`🔗 URL: ${issueUrl}`);
      
      // Save to file for reference
      fs.writeFileSync('jira-bug-created.json', JSON.stringify({
        key: issueKey,
        url: issueUrl,
        created: new Date().toISOString(),
        summary: bugData.fields.summary
      }, null, 2));
      
      return { key: issueKey, url: issueUrl };
      
    } catch (error) {
      console.error('❌ Failed to create Jira bug:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        console.error('\n⚠️ Authentication failed. Please check your credentials:');
        console.error('1. Email is correct');
        console.error('2. API token is valid (not your password)');
        console.error('3. You have permissions to create issues in the project');
      } else if (error.response?.status === 404) {
        console.error('\n⚠️ Project or issue type not found. Please check:');
        console.error(`1. Project key "${this.projectKey}" exists`);
        console.error('2. Issue type "Bug" exists in your project');
      }
      
      throw error;
    }
  }

  /**
   * Upload screenshots to the bug
   */
  async attachScreenshots(issueKey, screenshotPaths) {
    console.log(`📎 Attaching ${screenshotPaths.length} screenshots to ${issueKey}...`);
    
    for (const path of screenshotPaths) {
      if (fs.existsSync(path)) {
        const form = new FormData();
        form.append('file', fs.createReadStream(path));
        
        try {
          await axios.post(
            `${this.baseUrl}/rest/api/3/issue/${issueKey}/attachments`,
            form,
            {
              headers: {
                ...form.getHeaders(),
                'Authorization': `Basic ${Buffer.from(`${this.email}:${this.apiToken}`).toString('base64')}`,
                'X-Atlassian-Token': 'no-check'
              }
            }
          );
          console.log(`✅ Attached: ${path}`);
        } catch (error) {
          console.error(`❌ Failed to attach ${path}:`, error.message);
        }
      }
    }
  }

  /**
   * Get project details to verify configuration
   */
  async verifyProject() {
    try {
      console.log(`🔍 Verifying project ${this.projectKey}...`);
      const response = await this.api.get(`/project/${this.projectKey}`);
      console.log(`✅ Project found: ${response.data.name}`);
      
      // Get issue types
      const issueTypes = response.data.issueTypes.map(it => it.name);
      console.log(`📋 Available issue types: ${issueTypes.join(', ')}`);
      
      // Get priorities
      const prioritiesResponse = await this.api.get('/priority');
      const priorities = prioritiesResponse.data.map(p => p.name);
      console.log(`⚡ Available priorities: ${priorities.join(', ')}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to verify project:', error.response?.data || error.message);
      return false;
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 JIRA BUG CREATION TOOL');
  console.log('=' .repeat(50));
  
  // Configuration
  const config = {
    baseUrl: 'https://bankimonline.atlassian.net',
    email: process.env.JIRA_EMAIL,
    apiToken: process.env.JIRA_API_TOKEN,
    projectKey: 'BANKIM' // Update this with your actual project key
  };
  
  // Check for credentials
  if (!config.email || !config.apiToken) {
    console.log('\n📋 SETUP INSTRUCTIONS:');
    console.log('1. Get your Jira API token from:');
    console.log('   https://id.atlassian.com/manage-profile/security/api-tokens');
    console.log('\n2. Set environment variables:');
    console.log('   export JIRA_EMAIL="your-email@company.com"');
    console.log('   export JIRA_API_TOKEN="your-api-token"');
    console.log('\n3. Run this script again:');
    console.log('   node create-jira-bug.js');
    return;
  }
  
  const jira = new JiraBugCreator(config);
  
  // Verify project first
  const projectValid = await jira.verifyProject();
  if (!projectValid) {
    console.error('\n❌ Please update the project key in the script');
    return;
  }
  
  // Create the bug
  try {
    const bug = await jira.createNavigationBug();
    
    // Attach screenshots if they exist
    const screenshots = [
      'screenshots/bug-not-fixed-button-*.png',
      'screenshots/menu-open-*.png',
      'screenshots/service-page-*.png'
    ];
    
    const existingScreenshots = [];
    for (const pattern of screenshots) {
      const files = fs.readdirSync('screenshots').filter(f => f.includes(pattern.replace('*.png', '')));
      existingScreenshots.push(...files.map(f => `screenshots/${f}`));
    }
    
    if (existingScreenshots.length > 0) {
      await jira.attachScreenshots(bug.key, existingScreenshots.slice(0, 3)); // Attach up to 3 screenshots
    }
    
    console.log('\n✅ SUCCESS! Bug has been created in Jira');
    console.log(`🔗 View it here: ${bug.url}`);
    
  } catch (error) {
    console.error('\n❌ Failed to create bug');
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = JiraBugCreator;