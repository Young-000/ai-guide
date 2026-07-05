/**
 * @jest-environment node
 */
import { getClientIp } from '@/lib/request-ip';

function makeRequest(headers: Record<string, string>): Request {
  return new Request('http://localhost/x', { headers });
}

describe('getClientIp', () => {
  it('returns the first IP from a comma-separated x-forwarded-for', () => {
    const req = makeRequest({ 'x-forwarded-for': '203.0.113.1, 70.41.3.18, 150.172.238.178' });
    expect(getClientIp(req)).toBe('203.0.113.1');
  });

  it('trims whitespace around the first x-forwarded-for entry', () => {
    const req = makeRequest({ 'x-forwarded-for': '  203.0.113.1  , 70.41.3.18' });
    expect(getClientIp(req)).toBe('203.0.113.1');
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    const req = makeRequest({ 'x-real-ip': '198.51.100.7' });
    expect(getClientIp(req)).toBe('198.51.100.7');
  });

  it('returns "unknown" when neither header is present', () => {
    const req = makeRequest({});
    expect(getClientIp(req)).toBe('unknown');
  });
});
