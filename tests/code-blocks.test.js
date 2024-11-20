import { jest } from '@jest/globals';
import { extractCodeBlocks } from '../content.js';
import { MockElement, mockDocument } from './setup.js';

describe('extractCodeBlocks', () => {
  let testDoc;
  let mockPreElement;
  let mockAppendChild;

  beforeEach(() => {
    mockAppendChild = jest.fn();
    mockPreElement = new MockElement();
    mockPreElement.appendChild = mockAppendChild;
    mockPreElement.querySelector = jest.fn().mockReturnValue(null);
    mockPreElement.parentElement = {
      innerHTML: '<pre><code>test code</code></pre>'
    };

    const mockButton = new MockElement();
    mockButton.className = 'code-block-run-button';
    mockButton.textContent = '[run]';
    mockButton.addEventListener = jest.fn();

    testDoc = {
      ...mockDocument,
      location: { href: 'https://example.com' },
      title: 'Test Page',
      querySelectorAll: jest.fn(),
      createElement: jest.fn(() => mockButton)
    };

    const createCodeElement = (code, language) => {
      const element = new MockElement();
      element.textContent = code;
      element.classList = {
        contains: jest.fn().mockReturnValue(false),
        entries: () => [[0, language]],
        [Symbol.iterator]: function* () {
          yield language;
        }
      };
      element.closest = () => mockPreElement;
      element.parentElement = {
        innerHTML: `<code>${code}</code>`
      };
      return element;
    };

    const jsCodeElement = createCodeElement('const x = 1;', 'language-javascript');
    const pythonCodeElement = createCodeElement('def func(): pass', 'language-python');

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

  test('adds run button to code blocks', () => {
    extractCodeBlocks(testDoc);
    expect(mockAppendChild).toHaveBeenCalled();
    expect(testDoc.createElement).toHaveBeenCalledWith('button');
    expect(mockAppendChild.mock.calls[0][0]).toHaveProperty('className', 'code-block-run-button');
  });

  test('does not add duplicate run buttons', () => {
    mockPreElement.querySelector.mockReturnValue({ className: 'code-block-run-button' });
    extractCodeBlocks(testDoc);
    expect(mockAppendChild).not.toHaveBeenCalled();
  });

  test('ignores empty or too short code blocks', () => {
    const emptyElement = new MockElement();
    emptyElement.textContent = ' ';
    emptyElement.classList = {
      contains: jest.fn().mockReturnValue(false)
    };
    emptyElement.closest = () => null;
    emptyElement.parentElement = {
      innerHTML: '<code> </code>'
    };

    testDoc.querySelectorAll.mockReturnValue([emptyElement]);
    const blocks = extractCodeBlocks(testDoc);
    expect(blocks.length).toBe(0);
    expect(mockAppendChild).not.toHaveBeenCalled();
  });
});
