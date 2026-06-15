import { buildShareText } from '@/lib/share-text';

describe('buildShareText', () => {
  it('joins title, summary, and url with double newlines', () => {
    const result = buildShareText(
      'AI News Title',
      'A brief summary.',
      'https://aiwire.news/news/ai-news',
    );
    expect(result).toBe(
      'AI News Title\n\nA brief summary.\n\nhttps://aiwire.news/news/ai-news',
    );
  });

  it('trims whitespace from each part', () => {
    const result = buildShareText('  Title  ', '  Summary  ', '  https://example.com  ');
    expect(result).toBe('Title\n\nSummary\n\nhttps://example.com');
  });

  it('handles empty summary gracefully', () => {
    const result = buildShareText('Title', '', 'https://example.com');
    expect(result).toBe('Title\n\n\n\nhttps://example.com');
  });
});
