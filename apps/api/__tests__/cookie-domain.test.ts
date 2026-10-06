import { describe, expect, it } from 'vitest';
import { sharedCookieDomain } from '../src/config/cookie';

describe('shared cookie domain', () => {
  it('stays off in local development', () => {
    expect(sharedCookieDomain('localhost', false)).toBeUndefined();
    expect(sharedCookieDomain('inapyuk.space', false)).toBeUndefined();
  });

  it('uses the custom domain in production', () => {
    expect(sharedCookieDomain('inapyuk.space', true)).toBe('.inapyuk.space');
    expect(sharedCookieDomain('api.inapyuk.space', true)).toBe('.inapyuk.space');
  });

  it('does not invent a domain for localhost', () => {
    expect(sharedCookieDomain('localhost', true)).toBeUndefined();
  });
});
