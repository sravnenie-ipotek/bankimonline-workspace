/**
 * 🤖 AI-Enhanced Test Runner for Cypress
 * 
 * This module provides intelligent test execution management,
 * failure analysis, and optimization recommendations.
 */

import { aiTestGenerator } from './ai-test-generator';

interface TestExecutionMetrics {
  testName: string;
  duration: number;
  status: 'passed' | 'failed' | 'skipped';
  failureReason?: string;
  timestamp: Date;
  browser: string;
  viewport: string;
}

interface AIInsights {
  failurePatterns: string[];
  optimizationSuggestions: string[];
  testOrderRecommendations: string[];
  performanceIssues: string[];
}

export class AIEnhancedTestRunner {
  private executionHistory: TestExecutionMetrics[] = [];
  private failurePatterns: Map<string, number> = new Map();
  private performanceBaselines: Map<string, number> = new Map();

  constructor() {
    this.loadExecutionHistory();
  }

  /**
   * Load historical test execution data
   */
  private loadExecutionHistory() {
    // In a real implementation, this would load from a database or file
    // For now, we'll simulate with some sample data
    this.executionHistory = [
      {
        testName: 'ultra-comprehensive-dropdown-automation',
        duration: 45000,
        status: 'passed',
        timestamp: new Date(),
        browser: 'chrome-headed',
        viewport: '1920x1080'
      }
    ];
  }

  /**
   * Record test execution metrics
   */
  recordTestExecution(metrics: TestExecutionMetrics) {
    this.executionHistory.push(metrics);
    
    if (metrics.status === 'failed') {
      const pattern = this.extractFailurePattern(metrics.failureReason || '');
      this.failurePatterns.set(pattern, (this.failurePatterns.get(pattern) || 0) + 1);
    }

    // Update performance baselines
    const currentBaseline = this.performanceBaselines.get(metrics.testName) || 0;
    const newBaseline = (currentBaseline + metrics.duration) / 2;
    this.performanceBaselines.set(metrics.testName, newBaseline);
  }

  /**
   * Extract failure patterns for analysis
   */
  private extractFailurePattern(failureReason: string): string {
    if (failureReason.includes('Timed out retrying')) return 'timeout';
    if (failureReason.includes('not found')) return 'selector_not_found';
    if (failureReason.includes('not visible')) return 'visibility_issue';
    if (failureReason.includes('translation')) return 'translation_issue';
    return 'unknown';
  }

  /**
   * Get AI insights for test optimization
   */
  getAIInsights(): AIInsights {
    const recentFailures = this.executionHistory
      .filter(m => m.status === 'failed' && 
        m.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
      .map(m => m.failureReason || '');

    const failurePatterns = Array.from(this.failurePatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pattern, count]) => `${pattern}: ${count} occurrences`);

    const optimizationSuggestions = this.generateOptimizationSuggestions();
    const testOrderRecommendations = this.generateTestOrderRecommendations();
    const performanceIssues = this.analyzePerformanceIssues();

    return {
      failurePatterns,
      optimizationSuggestions,
      testOrderRecommendations,
      performanceIssues
    };
  }

  /**
   * Generate optimization suggestions based on failure patterns
   */
  private generateOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];

    if (this.failurePatterns.get('timeout') || 0 > 3) {
      suggestions.push('Consider increasing default timeouts for slow-loading elements');
      suggestions.push('Add explicit wait conditions for dynamic content');
    }

    if (this.failurePatterns.get('selector_not_found') || 0 > 5) {
      suggestions.push('Review and update selectors for recent UI changes');
      suggestions.push('Consider using more robust selectors (data-testid over CSS classes)');
    }

    if (this.failurePatterns.get('translation_issue') || 0 > 2) {
      suggestions.push('Run translation validation tests before main test suite');
      suggestions.push('Add translation completeness checks to CI pipeline');
    }

    return suggestions;
  }

  /**
   * Generate test execution order recommendations
   */
  private generateTestOrderRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Analyze which tests fail most frequently and suggest running them first
    const failureRates = this.calculateFailureRates();
    const highFailureTests = Object.entries(failureRates)
      .filter(([_, rate]) => rate > 0.3)
      .map(([test, rate]) => `${test} (${(rate * 100).toFixed(1)}% failure rate)`);

    if (highFailureTests.length > 0) {
      recommendations.push(`Run high-failure tests first: ${highFailureTests.join(', ')}`);
    }

    return recommendations;
  }

  /**
   * Calculate failure rates for each test
   */
  private calculateFailureRates(): Record<string, number> {
    const testStats: Record<string, { total: number; failed: number }> = {};

    this.executionHistory.forEach(metric => {
      if (!testStats[metric.testName]) {
        testStats[metric.testName] = { total: 0, failed: 0 };
      }
      testStats[metric.testName].total++;
      if (metric.status === 'failed') {
        testStats[metric.testName].failed++;
      }
    });

    const failureRates: Record<string, number> = {};
    Object.entries(testStats).forEach(([test, stats]) => {
      failureRates[test] = stats.failed / stats.total;
    });

    return failureRates;
  }

  /**
   * Analyze performance issues
   */
  private analyzePerformanceIssues(): string[] {
    const issues: string[] = [];
    const slowThreshold = 60000; // 60 seconds

    this.executionHistory
      .filter(m => m.duration > slowThreshold)
      .forEach(m => {
        const baseline = this.performanceBaselines.get(m.testName) || 0;
        if (m.duration > baseline * 1.5) {
          issues.push(`${m.testName} is running ${Math.round(m.duration / 1000)}s (baseline: ${Math.round(baseline / 1000)}s)`);
        }
      });

    return issues;
  }

  /**
   * Get intelligent test execution order
   */
  getOptimizedTestOrder(testFiles: string[]): string[] {
    const failureRates = this.calculateFailureRates();
    
    return testFiles.sort((a, b) => {
      const aRate = failureRates[a] || 0;
      const bRate = failureRates[b] || 0;
      return bRate - aRate; // Higher failure rate first
    });
  }

  /**
   * Generate comprehensive test report with AI insights
   */
  generateAIReport(): any {
    const insights = this.getAIInsights();
    const failureRates = this.calculateFailureRates();
    
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.executionHistory.length,
        passedTests: this.executionHistory.filter(m => m.status === 'passed').length,
        failedTests: this.executionHistory.filter(m => m.status === 'failed').length,
        averageDuration: this.executionHistory.reduce((sum, m) => sum + m.duration, 0) / this.executionHistory.length
      },
      aiInsights: insights,
      failureRates,
      recommendations: {
        immediate: insights.optimizationSuggestions.slice(0, 3),
        longTerm: insights.optimizationSuggestions.slice(3),
        testOrder: insights.testOrderRecommendations
      }
    };
  }
}

// Export singleton instance
export const aiTestRunner = new AIEnhancedTestRunner();
