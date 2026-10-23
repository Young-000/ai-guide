/** @jest-environment node */
import pkg from '../../package.json';

describe('verify:sitemap npm script', () => {
  it('does not use the tsx CLI (its IPC server cannot start in sandboxed runs)', () => {
    const command = (pkg.scripts as Record<string, string>)['verify:sitemap'];
    expect(command).not.toMatch(/^tsx\s/);
    expect(command).toMatch(/node\s+--import\s+tsx\s+scripts\/verify-sitemap\.ts/);
  });
});

describe('verify:feed npm script', () => {
  it('uses node --import tsx like verify:sitemap', () => {
    const command = (pkg.scripts as Record<string, string>)['verify:feed'];
    expect(command).toMatch(/node\s+--import\s+tsx\s+scripts\/verify-feed\.ts/);
  });
});
