import { jest } from '@jest/globals';
import { sendToLocalhost } from '../content.js';

describe('sendToLocalhost', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    global.fetch.mockClear();
    global.FormData = jest.fn(() => ({
      append: jest.fn()
    }));
  });

  afterEach(() => {
    // Reset all mocks after each test
    jest.resetAllMocks();
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
    const errorMessage = 'Network error';
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error(errorMessage))
    );

    const codeBlocks = [{
      code: 'test code',
      language: 'javascript'
    }];

    await expect(sendToLocalhost(codeBlocks)).rejects.toThrow(errorMessage);
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
