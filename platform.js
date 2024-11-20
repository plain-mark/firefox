import { PLATFORM_SELECTORS } from './config.js';

export function detectPlatform(url) {
  console.log('[Platform Detection] Checking URL:', url);
  const hostname = new URL(url).hostname;
  for (const platform in PLATFORM_SELECTORS) {
    if (hostname.includes(platform)) {
      console.log('[Platform Detection] Found platform:', platform);
      return platform;
    }
  }
  console.log('[Platform Detection] Using generic platform selectors');
  return 'generic';
}
