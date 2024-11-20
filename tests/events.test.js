import { jest } from '@jest/globals';
import { mockDocument } from './setup.js';

describe('Browser Event Handling', () => {
  let testDoc;

  beforeEach(() => {
    testDoc = {
      ...mockDocument,
      addEventListener: jest.fn()
    };
    global.document = testDoc;
    global.window = {
      addEventListener: jest.fn((event, handler) => {
        if (event === 'load') {
          handler();
        }
      })
    };
  });

  afterEach(() => {
    // Clean up global mocks
    global.document = mockDocument;
    jest.resetModules();
  });

  test('registers keydown event listener', () => {
    // Re-initialize the module
    const module = require('../content.js');

    // The module should have registered the event listener during initialization
    expect(testDoc.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
