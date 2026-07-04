/**
 * @jest-environment node
 */
import { GET } from '../route';

describe('GET /api/health', () => {
  it('returns 200 with a status: ok JSON body', async () => {
    const res = GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body).toEqual({ status: 'ok' });
  });
});
