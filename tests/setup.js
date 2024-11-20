import { jest } from '@jest/globals';

// Mock window
global.window = {
  location: {
    href: 'https://example.com'
  },
  navigator: {
    userAgent: 'jest-test-environment'
  }
};

// Mock document
global.document = {
  location: { href: 'https://example.com' },
  title: 'Test Page',
  body: {
    appendChild: jest.fn()
  },
  createElement: jest.fn(),
  getElementById: jest.fn(),
  querySelectorAll: jest.fn()
};

// Mock FormData
global.FormData = class FormData {
  constructor() {
    this.data = {};
  }
  append(key, value) {
    this.data[key] = value;
  }
};

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true })
  })
);

// Mock console methods to reduce noise in tests
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Export basic mock classes for test usage
export class MockElement {
  constructor() {
    this.style = {};
    this.classList = [];
    this.textContent = '';
    this.innerHTML = '';
    this.parentElement = null;
    this.remove = jest.fn();
  }

  closest(selector) {
    return null;
  }
}

export const mockDocument = global.document;
