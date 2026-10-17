/**
 * @jest-environment node
 */
import { GET } from '../route';

describe('GET /llms.txt', () => {
  it('responds 200 as plain text with the site facts block first', async () => {
    const response = GET();
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/plain');
    expect(body.indexOf('## Site Facts')).toBeGreaterThan(-1);
    expect(body).toContain('## Recent Articles');
    expect(body).toMatch(/\]\(https:\/\/aiwire\.news\/news\/[^)]+\)/);
  });
});
