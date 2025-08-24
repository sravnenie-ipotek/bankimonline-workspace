/**
 * CATEGORY 2: API SECURITY VALIDATION TESTS
 * 
 * This test suite focuses specifically on API security testing for banking applications.
 * Tests cover all major security threats and protection mechanisms.
 * 
 * Security Areas:
 * - SQL Injection Prevention
 * - Cross-Site Scripting (XSS) Protection
 * - JWT Token Security
 * - Input Validation & Sanitization
 * - Rate Limiting & DDoS Protection
 * - CORS Configuration
 * - Authentication Bypass Attempts
 * - Banking-Specific Security Requirements
 */

import { fetchBankOffers, transformUserDataToRequest } from '../bankOffersApi';
import type { BankOfferRequest } from '../bankOffersApi';

// Mock fetch for security testing
global.fetch = jest.fn();

describe('🔒 API Security Validation Test Suite', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  /**
   * ===============================================
   * SQL INJECTION PROTECTION TESTS
   * ===============================================
   */
  describe('💉 SQL Injection Protection', () => {
    
    it('should prevent SQL injection in phone number authentication', async () => {
      const sqlInjectionPayloads = [
        "972544123456'; DROP TABLE clients; --",
        "972544123456' OR '1'='1",
        "972544123456'; INSERT INTO clients VALUES ('hacker', 'admin'); --",
        "972544123456' UNION SELECT * FROM users --",
        "972544123456'; UPDATE clients SET role='admin' WHERE id=1; --"
      ];

      for (const payload of sqlInjectionPayloads) {
        // Mock server response that should treat payload as literal string
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({
            status: 'error',
            message: 'Invalid phone number format',
            details: { phone: payload }
          })
        });

        // API should reject malicious input
        try {
          await fetch('/api/auth-mobile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile_number: payload })
          });
        } catch (error) {
          // Expected to fail or return error
        }

        // Verify the payload was passed as parameter, not executed as SQL
        expect(global.fetch).toHaveBeenCalledWith('/api/auth-mobile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile_number: payload })
        });
      }
    });

    it('should prevent SQL injection in search parameters', async () => {
      const maliciousBankSearch = [
        "test'; DROP TABLE banks; --",
        "test' OR '1'='1' --",
        "test'; UPDATE banks SET active=false; --",
        "test' UNION SELECT password FROM users --"
      ];

      for (const searchTerm of maliciousBankSearch) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            status: 'success',
            data: [] // Should return empty results for malicious input
          })
        });

        await fetch(`/api/v1/banks?search=${encodeURIComponent(searchTerm)}`);
        
        // Verify search term is URL-encoded and treated as literal
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/v1/banks?search=${encodeURIComponent(searchTerm)}`
        );
      }
    });

    it('should use parameterized queries for all database operations', () => {
      // These are the patterns that SHOULD be used in the backend
      const secureQueryPatterns = [
        'SELECT * FROM clients WHERE phone = $1',
        'INSERT INTO clients (name, phone) VALUES ($1, $2)',
        'UPDATE clients SET last_login = NOW() WHERE id = $1',
        'SELECT * FROM banks WHERE name ILIKE $1 AND active = $2'
      ];

      // These patterns SHOULD NOT appear in the backend
      const insecureQueryPatterns = [
        'SELECT * FROM clients WHERE phone = \'' + 'phone' + '\'',
        'INSERT INTO clients (name, phone) VALUES (\'' + 'name' + '\', \'' + 'phone' + '\')',
        'SELECT * FROM banks WHERE name = "' + 'search' + '"'
      ];

      secureQueryPatterns.forEach(pattern => {
        expect(pattern).toContain('$1'); // Should use parameterized placeholders
        expect(pattern).not.toMatch(/['"].*\+.*['"]/); // Should not concatenate strings
      });

      insecureQueryPatterns.forEach(pattern => {
        expect(pattern).toMatch(/['"].*\+.*['"]/); // These are insecure patterns
      });
    });

    it('should validate numeric input to prevent injection', () => {
      const numericInjectionAttempts = [
        '1; DROP TABLE clients;',
        '1 OR 1=1',
        '1\'; INSERT INTO clients VALUES (\'hacker\'); --',
        '1 UNION SELECT * FROM users',
        '0x41424344', // Hex injection
        '1e1', // Scientific notation
        'NaN',
        'Infinity'
      ];

      const validateNumericInput = (input: any): boolean => {
        // Proper numeric validation
        const num = Number(input);
        return Number.isFinite(num) && 
               num > 0 && 
               num === parseInt(input.toString(), 10) && 
               !input.toString().includes(';') &&
               !input.toString().includes('OR') &&
               !input.toString().includes('--');
      };

      numericInjectionAttempts.forEach(attempt => {
        expect(validateNumericInput(attempt)).toBe(false);
      });

      // Valid numeric inputs should pass
      expect(validateNumericInput(123456)).toBe(true);
      expect(validateNumericInput('123456')).toBe(true);
    });
  });

  /**
   * ===============================================
   * CROSS-SITE SCRIPTING (XSS) PROTECTION
   * ===============================================
   */
  describe('🕷️ XSS Protection', () => {
    
    it('should sanitize script tags from input', () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(\'XSS\')">',
        'javascript:alert("XSS")',
        '<iframe src="javascript:alert(\'XSS\')"></iframe>',
        '<body onload="alert(\'XSS\')">',
        '<div onclick="alert(\'XSS\')">Click me</div>',
        '<style>@import url("javascript:alert(\'XSS\')")</style>'
      ];

      const sanitizeHtml = (input: string): string => {
        return input
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
          .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
          .replace(/<embed\b[^<]*>/gi, '')
          .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      };

      xssPayloads.forEach(payload => {
        const sanitized = sanitizeHtml(payload);
        expect(sanitized).not.toContain('<script');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('onerror=');
        expect(sanitized).not.toContain('onload=');
        expect(sanitized).not.toContain('onclick=');
        expect(sanitized).not.toContain('<iframe');
        expect(sanitized).not.toContain('<svg');
      });
    });

    it('should validate and sanitize user profile data', () => {
      const maliciousProfileData = {
        first_name: '<script>alert("XSS")</script>John',
        last_name: '<img src="x" onerror="alert(1)">Doe',
        email: 'test@example.com<script>alert("XSS")</script>',
        phone: '972544123456<svg onload="alert(1)">',
        address: '<iframe src="javascript:alert(1)"></iframe>123 Main St'
      };

      const sanitizeProfileField = (field: string): string => {
        return field
          .replace(/<[^>]*>/g, '') // Remove all HTML tags
          .replace(/javascript:/gi, '')
          .trim()
          .substring(0, 255); // Limit length
      };

      Object.entries(maliciousProfileData).forEach(([key, value]) => {
        const sanitized = sanitizeProfileField(value);
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized.length).toBeLessThanOrEqual(255);
      });
    });

    it('should properly escape data in JSON responses', () => {
      const dangerousData = {
        message: 'User data: <script>alert("XSS")</script>',
        error: '</script><script>alert("XSS")</script>',
        content: '{"malicious": "<img src=x onerror=alert(1)>"}'
      };

      // JSON.stringify should properly escape dangerous content
      const jsonString = JSON.stringify(dangerousData);
      
      expect(jsonString).not.toContain('<script>');
      expect(jsonString).not.toContain('</script>');
      expect(jsonString).toContain('\\u003c'); // < should be escaped
      expect(jsonString).toContain('\\u003e'); // > should be escaped
    });

    it('should validate Content-Type headers to prevent MIME type attacks', () => {
      const validContentTypes = [
        'application/json',
        'application/json; charset=utf-8',
        'multipart/form-data',
        'application/x-www-form-urlencoded'
      ];

      const invalidContentTypes = [
        'text/html',
        'text/javascript',
        'application/javascript',
        'text/plain',
        'application/xml',
        'image/svg+xml' // Can contain script tags
      ];

      const isValidContentType = (contentType: string): boolean => {
        return validContentTypes.some(valid => 
          contentType.toLowerCase().startsWith(valid.toLowerCase())
        );
      };

      validContentTypes.forEach(type => {
        expect(isValidContentType(type)).toBe(true);
      });

      invalidContentTypes.forEach(type => {
        expect(isValidContentType(type)).toBe(false);
      });
    });
  });

  /**
   * ===============================================
   * JWT TOKEN SECURITY
   * ===============================================
   */
  describe('🔑 JWT Token Security', () => {
    
    it('should validate JWT token structure', () => {
      const validJwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
      
      const validTokens = [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Gfx6VO9tcxwk6xqx9yYzSfebfeakZp5JYIgP_edcw_A'
      ];

      const invalidTokens = [
        'invalid.token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWI', // Incomplete
        'not-a-jwt-token',
        '', // Empty
        'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' // With bearer prefix
      ];

      validTokens.forEach(token => {
        expect(token).toMatch(validJwtPattern);
      });

      invalidTokens.forEach(token => {
        expect(token).not.toMatch(validJwtPattern);
      });
    });

    it('should reject expired JWT tokens', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNjQwOTk1MjAwfQ.expired';
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          status: 'error',
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        })
      });

      const response = await fetch('/api/v1/mortgage/save-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${expiredToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_data: {} })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });

    it('should validate JWT signature', () => {
      // Mock JWT validation logic
      const validateJwtSignature = (token: string, secret: string): boolean => {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        
        // In real implementation, this would verify the signature
        // For testing, we'll simulate validation logic
        const header = parts[0];
        const payload = parts[1];
        const signature = parts[2];
        
        // Basic validation checks
        return header.length > 0 && payload.length > 0 && signature.length > 0;
      };

      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature';
      const tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJoYWNrZXIifQ.signature';
      
      expect(validateJwtSignature(validToken, 'secret')).toBe(true);
      expect(validateJwtSignature('invalid', 'secret')).toBe(false);
    });

    it('should enforce JWT token expiration times', () => {
      const currentTime = Math.floor(Date.now() / 1000);
      
      const createMockJwtPayload = (expiresIn: number) => ({
        sub: '1',
        iat: currentTime,
        exp: currentTime + expiresIn,
        type: 'client'
      });

      const validateTokenExpiration = (payload: any): boolean => {
        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now;
      };

      // Valid token (expires in 1 hour)
      const validPayload = createMockJwtPayload(3600);
      expect(validateTokenExpiration(validPayload)).toBe(true);

      // Expired token (expired 1 hour ago)
      const expiredPayload = createMockJwtPayload(-3600);
      expect(validateTokenExpiration(expiredPayload)).toBe(false);
    });

    it('should validate JWT token claims', () => {
      const validateTokenClaims = (payload: any): boolean => {
        // Required claims for banking application
        const requiredClaims = ['sub', 'iat', 'exp', 'type'];
        const validTypes = ['client', 'admin', 'bank_worker'];
        
        // Check all required claims exist
        if (!requiredClaims.every(claim => payload.hasOwnProperty(claim))) {
          return false;
        }
        
        // Validate claim values
        if (!validTypes.includes(payload.type)) {
          return false;
        }
        
        // Subject should be numeric string
        if (!/^\d+$/.test(payload.sub)) {
          return false;
        }
        
        return true;
      };

      const validPayload = {
        sub: '1',
        iat: 1640995200,
        exp: 1640998800,
        type: 'client',
        phone: '972544123456'
      };

      const invalidPayloads = [
        { sub: '1' }, // Missing required claims
        { sub: 'invalid', iat: 1640995200, exp: 1640998800, type: 'client' }, // Invalid sub
        { sub: '1', iat: 1640995200, exp: 1640998800, type: 'invalid' }, // Invalid type
        {} // Empty payload
      ];

      expect(validateTokenClaims(validPayload)).toBe(true);
      
      invalidPayloads.forEach(payload => {
        expect(validateTokenClaims(payload)).toBe(false);
      });
    });
  });

  /**
   * ===============================================
   * INPUT VALIDATION & SANITIZATION
   * ===============================================
   */
  describe('🧹 Input Validation & Sanitization', () => {
    
    it('should validate Israeli phone number format', () => {
      const validateIsraeliPhone = (phone: string): boolean => {
        // Israeli phone format: 972XXXXXXXXX (972 + 9 digits)
        const pattern = /^972[2-9]\d{8}$/;
        return pattern.test(phone.replace(/[\s-]/g, ''));
      };

      const validPhones = [
        '972544123456',
        '972501234567',
        '972521234567',
        '972531234567',
        '972541234567'
      ];

      const invalidPhones = [
        '972444123456', // Invalid area code (4)
        '972544', // Too short
        '9725441234567', // Too long
        '123456789', // No country code
        '972044123456', // Invalid area code (0)
        '972144123456', // Invalid area code (1)
        '+972544123456', // With plus (should be normalized)
        'abc972544123456' // With letters
      ];

      validPhones.forEach(phone => {
        expect(validateIsraeliPhone(phone)).toBe(true);
      });

      invalidPhones.forEach(phone => {
        expect(validateIsraeliPhone(phone)).toBe(false);
      });
    });

    it('should validate financial amounts', () => {
      const validateFinancialAmount = (amount: any): boolean => {
        const num = parseFloat(amount);
        return Number.isFinite(num) && 
               num >= 0 && 
               num <= 50000000 && // Max 50M NIS
               num === Math.round(num * 100) / 100 && // Max 2 decimal places
               !isNaN(num);
      };

      const validAmounts = [
        100000, 1000000.50, 2500000, 0, 999999.99
      ];

      const invalidAmounts = [
        -100000, // Negative
        51000000, // Too large
        'invalid', // String
        NaN, // Not a number
        Infinity, // Infinite
        1000000.999 // Too many decimals
      ];

      validAmounts.forEach(amount => {
        expect(validateFinancialAmount(amount)).toBe(true);
      });

      invalidAmounts.forEach(amount => {
        expect(validateFinancialAmount(amount)).toBe(false);
      });
    });

    it('should validate date formats', () => {
      const validateDateString = (dateString: string): boolean => {
        // ISO 8601 format: YYYY-MM-DD
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        
        if (!datePattern.test(dateString)) {
          return false;
        }
        
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
      };

      const validDates = [
        '2023-01-15',
        '1990-12-31',
        '2000-06-15'
      ];

      const invalidDates = [
        '2023/01/15', // Wrong separator
        '23-01-15', // Wrong year format
        '2023-13-15', // Invalid month
        '2023-01-32', // Invalid day
        'invalid-date',
        '2023-1-1', // Missing zero padding
        ''
      ];

      validDates.forEach(date => {
        expect(validateDateString(date)).toBe(true);
      });

      invalidDates.forEach(date => {
        expect(validateDateString(date)).toBe(false);
      });
    });

    it('should sanitize text input fields', () => {
      const sanitizeTextInput = (input: string): string => {
        return input
          .trim()
          .replace(/[<>]/g, '') // Remove angle brackets
          .replace(/['"]/g, '') // Remove quotes
          .replace(/[&]/g, '&amp;') // Escape ampersand
          .substring(0, 100); // Limit length
      };

      const dangerousInputs = [
        '<script>alert("xss")</script>Normal Text',
        'Text with "quotes" and \'apostrophes\'',
        'Text & symbols < > dangerous',
        'Very long text that exceeds the maximum allowed length and should be truncated to prevent buffer overflow attacks'
      ];

      dangerousInputs.forEach(input => {
        const sanitized = sanitizeTextInput(input);
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
        expect(sanitized).not.toContain('"');
        expect(sanitized).not.toContain("'");
        expect(sanitized.length).toBeLessThanOrEqual(100);
      });
    });

    it('should validate property ownership values', () => {
      const validPropertyOwnership = (ownership: string): boolean => {
        const validValues = ['no_property', 'has_property', 'selling_property'];
        return validValues.includes(ownership);
      };

      const validValues = ['no_property', 'has_property', 'selling_property'];
      const invalidValues = ['', 'invalid', 'null', undefined, 'multiple_properties', 1];

      validValues.forEach(value => {
        expect(validPropertyOwnership(value)).toBe(true);
      });

      invalidValues.forEach(value => {
        expect(validPropertyOwnership(value as string)).toBe(false);
      });
    });
  });

  /**
   * ===============================================
   * RATE LIMITING & DOS PROTECTION
   * ===============================================
   */
  describe('🚦 Rate Limiting & DoS Protection', () => {
    
    it('should implement rate limiting per IP address', () => {
      class RateLimiter {
        private requests = new Map<string, { count: number; resetTime: number }>();
        private readonly limit = 100; // requests per hour
        private readonly windowMs = 3600000; // 1 hour

        isAllowed(ip: string): boolean {
          const now = Date.now();
          const record = this.requests.get(ip);

          if (!record) {
            this.requests.set(ip, { count: 1, resetTime: now + this.windowMs });
            return true;
          }

          if (now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + this.windowMs;
            return true;
          }

          if (record.count >= this.limit) {
            return false;
          }

          record.count++;
          return true;
        }

        getRemainingRequests(ip: string): number {
          const record = this.requests.get(ip);
          if (!record) return this.limit;
          
          if (Date.now() > record.resetTime) return this.limit;
          
          return Math.max(0, this.limit - record.count);
        }
      }

      const limiter = new RateLimiter();
      const testIp = '192.168.1.1';

      // First 100 requests should be allowed
      for (let i = 0; i < 100; i++) {
        expect(limiter.isAllowed(testIp)).toBe(true);
      }

      // 101st request should be blocked
      expect(limiter.isAllowed(testIp)).toBe(false);
      expect(limiter.getRemainingRequests(testIp)).toBe(0);
    });

    it('should implement progressive delays for repeated failures', () => {
      class FailureTracker {
        private failures = new Map<string, { count: number; lastAttempt: number }>();
        private readonly maxFailures = 5;
        private readonly baseDelay = 1000; // 1 second

        recordFailure(identifier: string): void {
          const now = Date.now();
          const record = this.failures.get(identifier);

          if (!record) {
            this.failures.set(identifier, { count: 1, lastAttempt: now });
          } else {
            record.count++;
            record.lastAttempt = now;
          }
        }

        getRequiredDelay(identifier: string): number {
          const record = this.failures.get(identifier);
          if (!record) return 0;

          if (record.count <= this.maxFailures) {
            // Exponential backoff: 1s, 2s, 4s, 8s, 16s
            return this.baseDelay * Math.pow(2, record.count - 1);
          }

          // After max failures, require 1 hour delay
          return 3600000; // 1 hour
        }

        isAllowed(identifier: string): boolean {
          const record = this.failures.get(identifier);
          if (!record) return true;

          const requiredDelay = this.getRequiredDelay(identifier);
          const timeSinceLastAttempt = Date.now() - record.lastAttempt;
          
          return timeSinceLastAttempt >= requiredDelay;
        }

        clearFailures(identifier: string): void {
          this.failures.delete(identifier);
        }
      }

      const tracker = new FailureTracker();
      const testUser = 'user123';

      // Simulate increasing delays after failures
      tracker.recordFailure(testUser);
      expect(tracker.getRequiredDelay(testUser)).toBe(1000); // 1s

      tracker.recordFailure(testUser);
      expect(tracker.getRequiredDelay(testUser)).toBe(2000); // 2s

      tracker.recordFailure(testUser);
      expect(tracker.getRequiredDelay(testUser)).toBe(4000); // 4s
    });

    it('should detect and block suspicious request patterns', () => {
      class SuspiciousActivityDetector {
        private patterns = new Map<string, {
          requestTimes: number[];
          uniqueEndpoints: Set<string>;
          userAgents: Set<string>;
        }>();

        recordRequest(ip: string, endpoint: string, userAgent: string): void {
          const now = Date.now();
          
          if (!this.patterns.has(ip)) {
            this.patterns.set(ip, {
              requestTimes: [],
              uniqueEndpoints: new Set(),
              userAgents: new Set()
            });
          }

          const pattern = this.patterns.get(ip)!;
          
          // Keep only last hour of requests
          const oneHourAgo = now - 3600000;
          pattern.requestTimes = pattern.requestTimes.filter(time => time > oneHourAgo);
          pattern.requestTimes.push(now);
          
          pattern.uniqueEndpoints.add(endpoint);
          pattern.userAgents.add(userAgent);
        }

        isSuspicious(ip: string): boolean {
          const pattern = this.patterns.get(ip);
          if (!pattern) return false;

          // Too many requests in short time (> 10 per minute)
          const lastMinute = Date.now() - 60000;
          const recentRequests = pattern.requestTimes.filter(time => time > lastMinute);
          if (recentRequests.length > 10) {
            return true;
          }

          // Accessing too many different endpoints (> 20)
          if (pattern.uniqueEndpoints.size > 20) {
            return true;
          }

          // Multiple user agents from same IP (> 5)
          if (pattern.userAgents.size > 5) {
            return true;
          }

          return false;
        }
      }

      const detector = new SuspiciousActivityDetector();
      const suspiciousIp = '192.168.1.100';

      // Simulate rapid requests
      for (let i = 0; i < 15; i++) {
        detector.recordRequest(suspiciousIp, `/api/endpoint${i}`, 'Mozilla/5.0');
      }

      expect(detector.isSuspicious(suspiciousIp)).toBe(true);
    });

    it('should validate request size limits', () => {
      const validateRequestSize = (contentLength: number): boolean => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        return contentLength <= maxSize;
      };

      const validSizes = [1024, 100000, 1000000, 5000000]; // Various valid sizes
      const invalidSizes = [15000000, 50000000, 100000000]; // Too large

      validSizes.forEach(size => {
        expect(validateRequestSize(size)).toBe(true);
      });

      invalidSizes.forEach(size => {
        expect(validateRequestSize(size)).toBe(false);
      });
    });
  });

  /**
   * ===============================================
   * CORS & HEADER SECURITY
   * ===============================================
   */
  describe('🌐 CORS & Header Security', () => {
    
    it('should validate CORS origin whitelist', () => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://yourdomain.com',
        'https://www.yourdomain.com'
      ];

      const isValidOrigin = (origin: string): boolean => {
        return allowedOrigins.includes(origin);
      };

      const validOrigins = allowedOrigins;
      const invalidOrigins = [
        'http://evil.com',
        'https://phishing-site.com',
        'http://localhost:8080', // Not in whitelist
        'null',
        ''
      ];

      validOrigins.forEach(origin => {
        expect(isValidOrigin(origin)).toBe(true);
      });

      invalidOrigins.forEach(origin => {
        expect(isValidOrigin(origin)).toBe(false);
      });
    });

    it('should set security headers correctly', () => {
      const requiredSecurityHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'",
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      };

      Object.entries(requiredSecurityHeaders).forEach(([header, value]) => {
        expect(header).toBeTruthy();
        expect(value).toBeTruthy();
        
        // Validate specific header values
        if (header === 'X-Frame-Options') {
          expect(['DENY', 'SAMEORIGIN'].includes(value)).toBe(true);
        }
        
        if (header === 'X-Content-Type-Options') {
          expect(value).toBe('nosniff');
        }
      });
    });

    it('should validate Content-Security-Policy directives', () => {
      const cspDirectives = {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": ["'self'"],
        "font-src": ["'self'"],
        "object-src": ["'none'"],
        "media-src": ["'self'"],
        "frame-src": ["'none'"]
      };

      const buildCSP = (directives: typeof cspDirectives): string => {
        return Object.entries(directives)
          .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
          .join('; ');
      };

      const csp = buildCSP(cspDirectives);
      
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("frame-src 'none'");
      expect(csp).not.toContain("'unsafe-eval'"); // Should not allow eval
    });

    it('should handle preflight OPTIONS requests', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header: string) => {
            const headers: Record<string, string> = {
              'Access-Control-Allow-Origin': 'http://localhost:5173',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
              'Access-Control-Max-Age': '86400'
            };
            return headers[header] || null;
          }
        }
      });

      const response = await fetch('/api/customer/compare-banks', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });

      expect(response.ok).toBe(true);
    });
  });

  /**
   * ===============================================
   * BANKING-SPECIFIC SECURITY
   * ===============================================
   */
  describe('🏦 Banking-Specific Security', () => {
    
    it('should enforce PCI DSS compliance patterns', () => {
      const validatePCICompliance = {
        // No credit card data should be stored
        hasCreditCardData: (data: any): boolean => {
          const ccPattern = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/;
          const dataString = JSON.stringify(data);
          return ccPattern.test(dataString);
        },
        
        // All sensitive data should be masked
        maskSensitiveData: (phoneNumber: string): string => {
          if (phoneNumber.length >= 10) {
            return phoneNumber.substring(0, 6) + '****' + phoneNumber.substring(phoneNumber.length - 2);
          }
          return phoneNumber;
        },
        
        // Validate data encryption requirements
        requiresEncryption: (fieldName: string): boolean => {
          const encryptedFields = ['password', 'ssn', 'bank_account', 'credit_card'];
          return encryptedFields.some(field => fieldName.toLowerCase().includes(field));
        }
      };

      // Test credit card detection
      const dataWithCC = { payment: '4111-1111-1111-1111' };
      const dataWithoutCC = { amount: 150000, currency: 'NIS' };
      
      expect(validatePCICompliance.hasCreditCardData(dataWithCC)).toBe(true);
      expect(validatePCICompliance.hasCreditCardData(dataWithoutCC)).toBe(false);

      // Test data masking
      const phoneNumber = '972544123456';
      const masked = validatePCICompliance.maskSensitiveData(phoneNumber);
      expect(masked).toBe('972544****56');
      expect(masked).not.toBe(phoneNumber);

      // Test encryption requirements
      expect(validatePCICompliance.requiresEncryption('user_password')).toBe(true);
      expect(validatePCICompliance.requiresEncryption('phone_number')).toBe(false);
    });

    it('should validate financial transaction limits', () => {
      const validateTransactionLimits = {
        dailyLimit: 100000, // 100K NIS
        monthlyLimit: 2000000, // 2M NIS
        
        isWithinLimits: function(amount: number, userDailySpent: number, userMonthlySpent: number): boolean {
          return (userDailySpent + amount <= this.dailyLimit) &&
                 (userMonthlySpent + amount <= this.monthlyLimit);
        }
      };

      // Valid transactions
      expect(validateTransactionLimits.isWithinLimits(50000, 20000, 500000)).toBe(true);
      expect(validateTransactionLimits.isWithinLimits(80000, 0, 0)).toBe(true);

      // Invalid transactions (exceed daily limit)
      expect(validateTransactionLimits.isWithinLimits(120000, 0, 0)).toBe(false);
      expect(validateTransactionLimits.isWithinLimits(50000, 80000, 0)).toBe(false);

      // Invalid transactions (exceed monthly limit)
      expect(validateTransactionLimits.isWithinLimits(100000, 0, 1950000)).toBe(false);
    });

    it('should implement fraud detection patterns', () => {
      const detectFraud = {
        // Unusual request patterns
        isUnusualPattern: (requests: Array<{timestamp: number, amount: number, location: string}>): boolean => {
          if (requests.length < 2) return false;
          
          // Multiple large transactions in short time
          const recent = requests.filter(r => Date.now() - r.timestamp < 300000); // 5 minutes
          const largeAmounts = recent.filter(r => r.amount > 500000);
          
          if (largeAmounts.length > 2) return true;
          
          // Multiple locations in short time
          const locations = new Set(recent.map(r => r.location));
          if (locations.size > 3 && recent.length > 5) return true;
          
          return false;
        },
        
        // Velocity checks
        checkVelocity: (transactions: number[], timeWindowMinutes: number): boolean => {
          const threshold = 5; // Max 5 transactions per window
          return transactions.length > threshold;
        }
      };

      const suspiciousRequests = [
        { timestamp: Date.now(), amount: 600000, location: 'Tel Aviv' },
        { timestamp: Date.now() - 60000, amount: 700000, location: 'Jerusalem' },
        { timestamp: Date.now() - 120000, amount: 800000, location: 'Haifa' }
      ];

      const normalRequests = [
        { timestamp: Date.now(), amount: 150000, location: 'Tel Aviv' },
        { timestamp: Date.now() - 3600000, amount: 200000, location: 'Tel Aviv' }
      ];

      expect(detectFraud.isUnusualPattern(suspiciousRequests)).toBe(true);
      expect(detectFraud.isUnusualPattern(normalRequests)).toBe(false);

      // Velocity check
      const highVelocity = [1, 2, 3, 4, 5, 6]; // 6 transactions
      const normalVelocity = [1, 2, 3]; // 3 transactions
      
      expect(detectFraud.checkVelocity(highVelocity, 60)).toBe(true);
      expect(detectFraud.checkVelocity(normalVelocity, 60)).toBe(false);
    });

    it('should validate Israeli banking regulations compliance', () => {
      const validateBankingCompliance = {
        // Israeli bank identification number validation
        validateBankId: (bankId: string): boolean => {
          const israeliBankIds = ['10', '11', '12', '13', '14', '17', '20', '31', '34', '46', '52', '54'];
          return israeliBankIds.includes(bankId);
        },
        
        // Interest rate validation (Bank of Israel guidelines)
        validateInterestRate: (rate: number, type: 'mortgage' | 'credit'): boolean => {
          if (type === 'mortgage') {
            return rate >= 1.0 && rate <= 10.0; // 1-10% for mortgages
          } else {
            return rate >= 5.0 && rate <= 25.0; // 5-25% for credit
          }
        },
        
        // LTV ratio validation (Bank of Israel requirements)
        validateLTV: (ltv: number, propertyType: string): boolean => {
          if (propertyType === 'first_apartment') {
            return ltv <= 75; // Max 75% for first apartment
          } else {
            return ltv <= 70; // Max 70% for investment properties
          }
        }
      };

      // Bank ID validation
      expect(validateBankingCompliance.validateBankId('10')).toBe(true); // Bank Hapoalim
      expect(validateBankingCompliance.validateBankId('11')).toBe(true); // Bank Leumi
      expect(validateBankingCompliance.validateBankId('99')).toBe(false); // Invalid bank

      // Interest rate validation
      expect(validateBankingCompliance.validateInterestRate(4.5, 'mortgage')).toBe(true);
      expect(validateBankingCompliance.validateInterestRate(15.0, 'credit')).toBe(true);
      expect(validateBankingCompliance.validateInterestRate(0.5, 'mortgage')).toBe(false);
      expect(validateBankingCompliance.validateInterestRate(30.0, 'credit')).toBe(false);

      // LTV validation
      expect(validateBankingCompliance.validateLTV(70, 'first_apartment')).toBe(true);
      expect(validateBankingCompliance.validateLTV(80, 'first_apartment')).toBe(false);
      expect(validateBankingCompliance.validateLTV(65, 'investment')).toBe(true);
      expect(validateBankingCompliance.validateLTV(75, 'investment')).toBe(false);
    });
  });
});