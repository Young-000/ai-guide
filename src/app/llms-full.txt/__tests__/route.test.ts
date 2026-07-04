/**
 * @jest-environment node
 */
import { GET } from '../route';

describe('GET /llms-full.txt', () => {
  it('includes at least one English article under /en/news/', async () => {
    const res = GET();
    const body = await res.text();
    expect(body).toMatch(/https:\/\/aiwire\.news\/en\/news\/\S+/);
  });

  it('still includes Korean articles under /news/ (not /en/news/)', async () => {
    const res = GET();
    const body = await res.text();
    expect(body).toMatch(/https:\/\/aiwire\.news\/news\/\S+/);
  });
});
