/**
 * 🤖 OpenAI Integration for Cypress AI Automation
 * 
 * This module provides OpenAI GPT-4 integration for intelligent test generation,
 * error analysis, and optimization suggestions.
 */

interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

interface TestGenerationRequest {
  componentName: string;
  process: string;
  step: number;
  language: string;
  existingPatterns: string[];
}

interface ErrorAnalysisRequest {
  errorMessage: string;
  testContext: any;
  recentFailures: string[];
}

export class OpenAIIntegration {
  private config: OpenAIConfig;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.config = {
      apiKey,
      model: 'gpt-4',
      maxTokens: 2000,
      temperature: 0.3
    };
  }

  /**
   * Generate Cypress test code using OpenAI
   */
  async generateTestCode(request: TestGenerationRequest): Promise<string> {
    const prompt = this.buildTestGenerationPrompt(request);
    
    try {
      const response = await this.callOpenAI(prompt);
      return this.extractCodeFromResponse(response);
    } catch (error) {
      console.error('OpenAI test generation failed:', error);
      return this.getFallbackTestCode(request);
    }
  }

  /**
   * Analyze test failure and provide intelligent suggestions
   */
  async analyzeFailure(request: ErrorAnalysisRequest): Promise<string[]> {
    const prompt = this.buildErrorAnalysisPrompt(request);
    
    try {
      const response = await this.callOpenAI(prompt);
      return this.extractSuggestionsFromResponse(response);
    } catch (error) {
      console.error('OpenAI error analysis failed:', error);
      return this.getFallbackSuggestions(request.errorMessage);
    }
  }

  /**
   * Generate intelligent test data based on business logic
   */
  async generateTestData(fieldName: string, language: string, businessContext: string): Promise<any> {
    const prompt = this.buildTestDataPrompt(fieldName, language, businessContext);
    
    try {
      const response = await this.callOpenAI(prompt);
      return this.extractTestDataFromResponse(response);
    } catch (error) {
      console.error('OpenAI test data generation failed:', error);
      return this.getFallbackTestData(fieldName, language);
    }
  }

  /**
   * Optimize test execution order based on failure patterns
   */
  async optimizeTestOrder(testFiles: string[], failureHistory: any[]): Promise<string[]> {
    const prompt = this.buildOptimizationPrompt(testFiles, failureHistory);
    
    try {
      const response = await this.callOpenAI(prompt);
      return this.extractOptimizedOrderFromResponse(response, testFiles);
    } catch (error) {
      console.error('OpenAI optimization failed:', error);
      return testFiles; // Return original order as fallback
    }
  }

  /**
   * Build prompt for test generation
   */
  private buildTestGenerationPrompt(request: TestGenerationRequest): string {
    return `You are an expert Cypress test automation engineer specializing in multi-language banking applications.

Generate a Cypress test for the following component:
- Component: ${request.componentName}
- Process: ${request.process}
- Step: ${request.step}
- Language: ${request.language}

Existing test patterns in this project:
${request.existingPatterns.join('\n')}

Requirements:
1. Use data-testid selectors
2. Include proper error handling
3. Support Hebrew/English/Russian languages
4. Follow Cypress best practices
5. Include validation for dropdown functionality
6. Add proper waiting and retry logic

Generate only the Cypress test code, no explanations:`;
  }

  /**
   * Build prompt for error analysis
   */
  private buildErrorAnalysisPrompt(request: ErrorAnalysisRequest): string {
    return `You are an expert Cypress debugging specialist.

Analyze this test failure and provide specific, actionable suggestions:

Error: ${request.errorMessage}
Test Context: ${JSON.stringify(request.testContext, null, 2)}
Recent Failures: ${request.recentFailures.join(', ')}

Provide 3-5 specific suggestions to fix this issue. Focus on:
1. Selector issues
2. Timing problems
3. Language-specific issues
4. Browser compatibility
5. Test data problems

Format as a numbered list:`;
  }

  /**
   * Build prompt for test data generation
   */
  private buildTestDataPrompt(fieldName: string, language: string, businessContext: string): string {
    return `You are a banking application test data specialist.

Generate realistic test data for:
- Field: ${fieldName}
- Language: ${language}
- Context: ${businessContext}

Requirements:
1. Data must be realistic for Israeli banking
2. Support Hebrew/English/Russian formats
3. Include proper validation rules
4. Consider business logic constraints

Return only valid JSON with the test data:`;
  }

  /**
   * Build prompt for test optimization
   */
  private buildOptimizationPrompt(testFiles: string[], failureHistory: any[]): string {
    return `You are a test execution optimization specialist.

Optimize the execution order of these Cypress test files based on failure history:

Test Files: ${testFiles.join(', ')}
Failure History: ${JSON.stringify(failureHistory, null, 2)}

Consider:
1. Failure frequency
2. Test dependencies
3. Execution time
4. Critical business flows

Return only the optimized list of test file names in execution order:`;
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert Cypress automation engineer specializing in multi-language banking applications.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  /**
   * Extract code from OpenAI response
   */
  private extractCodeFromResponse(response: string): string {
    // Extract code blocks from markdown
    const codeBlockRegex = /```(?:typescript|javascript)?\n([\s\S]*?)```/;
    const match = response.match(codeBlockRegex);
    return match ? match[1].trim() : response;
  }

  /**
   * Extract suggestions from OpenAI response
   */
  private extractSuggestionsFromResponse(response: string): string[] {
    // Extract numbered list items
    const suggestions = response.match(/\d+\.\s+(.+)/g);
    return suggestions ? suggestions.map(s => s.replace(/^\d+\.\s+/, '')) : [response];
  }

  /**
   * Extract test data from OpenAI response
   */
  private extractTestDataFromResponse(response: string): any {
    try {
      // Try to parse as JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return response;
    } catch (error) {
      return response;
    }
  }

  /**
   * Extract optimized test order from OpenAI response
   */
  private extractOptimizedOrderFromResponse(response: string, originalFiles: string[]): string[] {
    // Extract file names from response
    const fileNames = response.match(/[\w-]+\.cy\.ts/g);
    if (fileNames) {
      // Filter to only include files that exist in original list
      return fileNames.filter(file => originalFiles.includes(file));
    }
    return originalFiles;
  }

  /**
   * Fallback methods when OpenAI is unavailable
   */
  private getFallbackTestCode(request: TestGenerationRequest): string {
    return `
describe('${request.componentName} Test', () => {
  it('should test ${request.componentName} functionality', () => {
    cy.visit('/services/${request.process}/${request.step}');
    cy.get('[data-testid="${request.componentName}"]').should('be.visible');
    // Add your test logic here
  });
});`;
  }

  private getFallbackSuggestions(errorMessage: string): string[] {
    return [
      'Check if element exists in DOM',
      'Verify selector is correct',
      'Add wait conditions for dynamic content',
      'Check for language-specific selectors'
    ];
  }

  private getFallbackTestData(fieldName: string, language: string): any {
    const fallbackData: Record<string, any> = {
      'property-value': {
        he: { value: '1000000', currency: '₪' },
        en: { value: '1000000', currency: '$' },
        ru: { value: '1000000', currency: '₽' }
      },
      'income-source': {
        he: ['משכורת', 'עסק עצמאי'],
        en: ['Salary', 'Self-employed'],
        ru: ['Зарплата', 'Предприниматель']
      }
    };

    return fallbackData[fieldName]?.[language] || { value: 'test-data' };
  }
}

// Export singleton instance
export const openAIIntegration = new OpenAIIntegration(
  process.env.OPENAI_API_KEY || ''
);
