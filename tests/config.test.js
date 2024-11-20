import { jest } from '@jest/globals';
import {
  PLATFORM_SELECTORS,
  NOTIFICATION_STYLES,
  API_ENDPOINTS,
  SCAN_INTERVAL,
  MIN_CODE_LENGTH,
  SUPPORTED_LANGUAGES
} from '../config.js';

describe('PLATFORM_SELECTORS', () => {
  test('contains all required platforms', () => {
    const expectedPlatforms = [
      'discord',
      'claude',
      'chatgpt',
      'github',
      'stackoverflow',
      'stackexchange',
      'gitlab',
      'bitbucket',
      'slack',
      'teams',
      'gitter',
      'notion',
      'obsidian',
      'jupyter',
      'kaggle',
      'colab',
      'codepen',
      'jsfiddle',
      'replit',
      'hashnode',
      'devto',
      'medium',
      'generic'
    ];

    expectedPlatforms.forEach(platform => {
      expect(PLATFORM_SELECTORS).toHaveProperty(platform);
      expect(Array.isArray(PLATFORM_SELECTORS[platform])).toBeTruthy();
      expect(PLATFORM_SELECTORS[platform].length).toBeGreaterThan(0);
    });
  });

  test('all selectors are strings', () => {
    Object.values(PLATFORM_SELECTORS).flat().forEach(selector => {
      expect(typeof selector).toBe('string');
      expect(selector.length).toBeGreaterThan(0);
    });
  });
});

describe('NOTIFICATION_STYLES', () => {
  test('contains required style properties', () => {
    expect(NOTIFICATION_STYLES).toHaveProperty('base');
    expect(NOTIFICATION_STYLES).toHaveProperty('success');
    expect(NOTIFICATION_STYLES).toHaveProperty('error');
  });

  test('base styles contain required CSS properties', () => {
    const baseStyles = NOTIFICATION_STYLES.base;
    const requiredProperties = [
      'position',
      'z-index',
      'border-radius'
    ];

    requiredProperties.forEach(prop => {
      expect(baseStyles.toLowerCase()).toContain(prop);
    });
  });

  test('color values are valid hex codes', () => {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    expect(NOTIFICATION_STYLES.success).toMatch(hexColorRegex);
    expect(NOTIFICATION_STYLES.error).toMatch(hexColorRegex);
  });
});

describe('API_ENDPOINTS', () => {
  test('contains required endpoints', () => {
    expect(API_ENDPOINTS).toHaveProperty('convert');
  });

  test('endpoints start with forward slash', () => {
    Object.values(API_ENDPOINTS).forEach(endpoint => {
      expect(endpoint.startsWith('/')).toBeTruthy();
    });
  });

  test('endpoints are non-empty strings', () => {
    Object.values(API_ENDPOINTS).forEach(endpoint => {
      expect(typeof endpoint).toBe('string');
      expect(endpoint.length).toBeGreaterThan(1);
    });
  });
});

describe('SCAN_INTERVAL', () => {
  test('is a positive number', () => {
    expect(typeof SCAN_INTERVAL).toBe('number');
    expect(SCAN_INTERVAL).toBeGreaterThan(0);
  });

  test('is reasonable for performance', () => {
    expect(SCAN_INTERVAL).toBeGreaterThanOrEqual(1000); // At least 1 second
    expect(SCAN_INTERVAL).toBeLessThanOrEqual(10000); // At most 10 seconds
  });
});

describe('MIN_CODE_LENGTH', () => {
  test('is a positive number', () => {
    expect(typeof MIN_CODE_LENGTH).toBe('number');
    expect(MIN_CODE_LENGTH).toBeGreaterThan(0);
  });

  test('is reasonable for code blocks', () => {
    expect(MIN_CODE_LENGTH).toBeGreaterThanOrEqual(1);
    expect(MIN_CODE_LENGTH).toBeLessThanOrEqual(10);
  });
});

describe('SUPPORTED_LANGUAGES', () => {
  test('is an array of strings', () => {
    expect(Array.isArray(SUPPORTED_LANGUAGES)).toBeTruthy();
    SUPPORTED_LANGUAGES.forEach(lang => {
      expect(typeof lang).toBe('string');
    });
  });

  test('contains common programming languages', () => {
    const commonLanguages = ['js', 'python', 'java', 'typescript'];
    commonLanguages.forEach(lang => {
      expect(SUPPORTED_LANGUAGES).toContain(lang);
    });
  });

  test('languages are lowercase', () => {
    SUPPORTED_LANGUAGES.forEach(lang => {
      expect(lang).toBe(lang.toLowerCase());
    });
  });

  test('has no duplicate languages', () => {
    const uniqueLanguages = new Set(SUPPORTED_LANGUAGES);
    expect(uniqueLanguages.size).toBe(SUPPORTED_LANGUAGES.length);
  });
});
