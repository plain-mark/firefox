import { jest } from '@jest/globals';
import { detectPlatform } from '../content.js';

describe('detectPlatform', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

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

  test('handles undefined url', () => {
    expect(detectPlatform(undefined)).toBe('generic');
  });

  test('handles empty url', () => {
    expect(detectPlatform('')).toBe('generic');
  });
});
