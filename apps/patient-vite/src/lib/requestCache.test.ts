import { beforeEach, describe, expect, it } from 'vitest';
import { requestCache } from './requestCache';

describe('requestCache', () => {
  beforeEach(() => {
    requestCache.clear();
  });

  it('stores and retrieves values within TTL', () => {
    requestCache.set('key', { a: 1 }, 1000);
    expect(requestCache.get<{ a: number }>('key')).toEqual({ a: 1 });
  });

  it('expires values after TTL', async () => {
    requestCache.set('exp', 42, 10);
    await new Promise((r) => setTimeout(r, 20));
    expect(requestCache.get<number>('exp')).toBeNull();
  });

  it('invalidates specific keys', () => {
    requestCache.set('x', 1, 1000);
    requestCache.invalidate('x');
    expect(requestCache.get('x')).toBeNull();
  });
});
