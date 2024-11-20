import { jest } from '@jest/globals';
import {
  detectPlatform,
  extractCodeBlocks,
  showError,
  createErrorDiv,
  showNotification,
  sendToLocalhost
} from '../content.js';

import {
  mockDocument,
  MockElement
} from './setup.js';

describe('detectPlatform', () => {
  test('detects github platform', () => {
    const url = 'https://github.com/user/repo';
    expect(detectPlatform(url)).toBe('github');
  });

  test('detects stackoverflow platform', () => {
    const url = 'https://stackoverflow.com/questions/123';
    expect(detectPlatform(url)).toBe('stackoverflow');
  });

  test('returns generic for unknown platform', () => {
    const url = 'https://unknown-platform.com';
    expect(detectPlatform(url)).toBe('generic');
  });
});

describe('extractCodeBlocks', () => {
  let testDoc;

  beforeEach(() => {
    testDoc = {
      location: { href: 'https://example.com' },
      title: 'Test Page',
      querySelectorAll: jest.fn()
    };

    const jsCodeElement = {
      textContent: 'const x = 1;',
      classList: ['language-javascript'],
      closest: () => ({ parentElement: { innerHTML: '<code>const x = 1;</code>' } })
    };

    const pythonCodeElement = {
      textContent: 'def func(): pass',
      classList: ['language-python'],
      closest: () => ({ parentElement: { innerHTML: '<code>def func(): pass</code>' } })
    };

    testDoc.querySelectorAll.mockImplementation((selector) => {
      if (selector.includes('code')) {
        return [jsCodeElement, pythonCodeElement];
      }
      return [];
    });
  });

  test('extracts code blocks with language detection', () => {
    const blocks = extractCodeBlocks(testDoc);
    expect(blocks.length).toBeGreaterThan(0);
    const jsBlock = blocks.find(b => b.language === 'javascript');
    expect(jsBlock).toBeTruthy();
    expect(jsBlock.code).toBe('const x = 1;');
  });

  test('includes metadata in extracted blocks', () => {
    const blocks = extractCodeBlocks(testDoc);
    expect(blocks[0]).toHaveProperty('timestamp');
    expect(blocks[0]).toHaveProperty('url');
    expect(blocks[0]).toHaveProperty('title');
  });

  test('ignores empty or too short code blocks', () => {
    testDoc.querySelectorAll.mockImplementation(() => [{
      textContent: ' ',
      classList: [],
      closest: () => ({ parentElement: { innerHTML: '<code> </code>' } })
    }]);
    const blocks = extractCodeBlocks(testDoc);
    expect(blocks.length).toBe(0);
  });
});

describe('sendToLocalhost', () => {
  beforeEach(() => {
    global.fetch.mockClear();
    global.FormData = jest.fn(() => ({
      append: jest.fn()
    }));
  });

  test('sends code blocks successfully', async () => {
    const mockResponse = { success: true, data: 'test' };
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse)
      })
    );

    const codeBlocks = [{
      code: 'test code',
      language: 'javascript'
    }];

    const result = await sendToLocalhost(codeBlocks);
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.FormData).toHaveBeenCalled();
  });

  test('handles empty code blocks', async () => {
    const result = await sendToLocalhost([]);
    expect(result).toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('handles fetch error', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    const codeBlocks = [{
      code: 'test code',
      language: 'javascript'
    }];

    await expect(sendToLocalhost(codeBlocks)).rejects.toThrow('Network error');
  });

  test('handles error response', async () => {
    const errorResponse = { error: 'Test error' };
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(errorResponse)
      })
    );

    const codeBlocks = [{
      code: 'test code',
      language: 'javascript'
    }];

    const result = await sendToLocalhost(codeBlocks);
    expect(result).toEqual(errorResponse);
  });
});

describe('showError', () => {
  let testDoc;

  beforeEach(() => {
    testDoc = {
      body: {
        appendChild: jest.fn()
      },
      createElement: jest.fn(() => ({
        style: {},
        id: '',
        textContent: ''
      })),
      getElementById: jest.fn()
    };
  });

  test('creates and shows error message', () => {
    const errorDiv = {
      style: {},
      textContent: ''
    };
    testDoc.getElementById.mockReturnValue(errorDiv);

    const result = showError('Test error', testDoc);
    expect(result.textContent).toBe('Test error');
    expect(result.style.display).toBe('block');
  });

  test('creates new error div if none exists', () => {
    testDoc.getElementById.mockReturnValue(null);
    const result = showError('New error', testDoc);
    expect(result.textContent).toBe('New error');
    expect(testDoc.body.appendChild).toHaveBeenCalled();
  });
});

describe('createErrorDiv', () => {
  let testDoc;

  beforeEach(() => {
    testDoc = {
      body: {
        appendChild: jest.fn()
      },
      createElement: jest.fn(() => ({
        style: {},
        id: ''
      }))
    };
  });

  test('creates div with correct styles', () => {
    const div = createErrorDiv(testDoc);
    expect(div.id).toBe('error-message');
    expect(testDoc.body.appendChild).toHaveBeenCalled();
    expect(div.style.cssText).toContain('position: fixed');
  });
});

describe('showNotification', () => {
  let testDoc;

  beforeEach(() => {
    jest.useFakeTimers();
    testDoc = {
      body: {
        appendChild: jest.fn()
      },
      createElement: jest.fn(() => ({
        style: {},
        textContent: '',
        remove: jest.fn()
      }))
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('shows success notification', () => {
    const notification = showNotification('Success message', false, testDoc);
    expect(notification.textContent).toBe('Success message');
    expect(testDoc.body.appendChild).toHaveBeenCalled();
  });

  test('shows error notification', () => {
    const notification = showNotification('Error message', true, testDoc);
    expect(notification.textContent).toBe('Error message');
    expect(testDoc.body.appendChild).toHaveBeenCalled();
  });

  test('removes notification after timeout', () => {
    const notification = showNotification('Test message', false, testDoc);
    expect(testDoc.body.appendChild).toHaveBeenCalled();
    
    jest.advanceTimersByTime(3000);
    expect(notification.remove).toHaveBeenCalled();
  });
});

// Test browser event handling
describe('Browser Event Handling', () => {
  let mockDocument;
  let mockEvent;

  beforeEach(() => {
    mockDocument = {
      addEventListener: jest.fn((event, callback) => {
        if (event === 'keydown') {
          mockEvent = callback;
        }
      })
    };
    global.document = mockDocument;
  });

  test('triggers manual extraction on Ctrl+Shift+E', () => {
    const event = {
      ctrlKey: true,
      shiftKey: true,
      key: 'E'
    };

    if (mockEvent) {
      mockEvent(event);
    }

    expect(mockDocument.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
