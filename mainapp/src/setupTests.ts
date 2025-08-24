// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock import.meta for Vite compatibility in Jest
Object.defineProperty(window, 'import', {
  writable: true,
  value: {
    meta: {
      env: {
        VITE_NODE_API_BASE_URL: '/api',
        NODE_ENV: 'test',
        VITE_APP_NAME: 'BankiMonline',
        VITE_APP_ENV: 'test'
      }
    }
  }
});

// Define import.meta globally for modules
(globalThis as any).import = {
  meta: {
    env: {
      VITE_NODE_API_BASE_URL: '/api',
      NODE_ENV: 'test',
      VITE_APP_NAME: 'BankiMonline',
      VITE_APP_ENV: 'test'
    }
  }
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;