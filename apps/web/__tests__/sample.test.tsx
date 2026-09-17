import { describe, it, expect } from 'vitest';

describe('Vitest Web runner', () => {
  it('should execute a basic assertion', () => {
    expect(true).toBe(true);
  });

  it('should have access to jsdom globals', () => {
    expect(typeof document).toBe('object');
    expect(typeof window).toBe('object');
  });
});
