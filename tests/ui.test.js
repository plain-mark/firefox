import { jest } from '@jest/globals';
import { showError, createErrorDiv, showNotification } from '../content.js';
import { MockElement, mockDocument } from './setup.js';

describe('UI Elements', () => {
  let testDoc;

  beforeEach(() => {
    testDoc = {
      ...mockDocument,
      body: {
        appendChild: jest.fn()
      },
      createElement: jest.fn(() => {
        const element = new MockElement();
        element.addEventListener = jest.fn();
        return element;
      }),
      getElementById: jest.fn()
    };
  });

  describe('showError', () => {
    test('creates and shows error message', () => {
      const errorDiv = new MockElement();
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
    test('creates div with correct styles', () => {
      const div = createErrorDiv(testDoc);
      expect(div.id).toBe('error-message');
      expect(testDoc.body.appendChild).toHaveBeenCalled();
      expect(div.style.cssText).toContain('position: fixed');
    });
  });

  describe('showNotification', () => {
    beforeEach(() => {
      jest.useFakeTimers();
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
      const mockRemove = jest.fn();
      const element = new MockElement();
      element.remove = mockRemove;
      testDoc.createElement.mockReturnValueOnce(element);

      showNotification('Test message', false, testDoc);
      expect(testDoc.body.appendChild).toHaveBeenCalled();

      jest.advanceTimersByTime(3000);
      expect(mockRemove).toHaveBeenCalled();
    });
  });
});
