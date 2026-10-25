import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubscribeBox from '@/components/SubscribeBox';

// Silence console.error noise from intentional error-path tests
beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterEach(() => {
  jest.restoreAllMocks();
  // Clean up any fetch mock
  delete (global as unknown as Record<string, unknown>).fetch;
});

function mockFetchSuccess(): void {
  (global as unknown as Record<string, unknown>).fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ ok: true }),
  });
}

function mockFetchError(status: number): void {
  (global as unknown as Record<string, unknown>).fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ error: '일시적인 오류가 발생했습니다.' }),
  });
}

function mockFetchNetworkFailure(): void {
  (global as unknown as Record<string, unknown>).fetch = jest
    .fn()
    .mockRejectedValue(new Error('Network error'));
}

describe('SubscribeBox — static rendering', () => {
  it('renders a heading that says what the subscriber gets', () => {
    render(<SubscribeBox />);
    expect(
      screen.getByRole('heading', { name: '중요한 AI 소식을 한국어 요약 메일로' })
    ).toBeInTheDocument();
  });

  it('tells when the first mail arrives without promising a schedule', () => {
    const { container } = render(<SubscribeBox />);
    expect(container).toHaveTextContent('첫 메일은 발송을 시작할 때');
    expect(container.textContent).not.toMatch(/매일|매주|아침/);
  });

  it('keeps toss-style signal words out of the copy', () => {
    const { container } = render(<SubscribeBox />);
    const SIGNAL_WORDS = ['아직', '아쉽게도', '죄송', '부족해서', '하지 못합니다', '단계는 아닙니다',
      '가급적', '놓치면'];
    SIGNAL_WORDS.forEach((word) => expect(container.textContent).not.toContain(word));
    expect(container.textContent).not.toMatch(/등(?![록장])/);
  });

  it('renders the value-led badge', () => {
    render(<SubscribeBox />);
    expect(screen.getByText('무료 뉴스레터')).toBeInTheDocument();
  });

  it('renders the email input and submit button', () => {
    render(<SubscribeBox />);
    expect(screen.getByLabelText('이메일 주소')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '요약 메일 받기' })).toBeInTheDocument();
  });
});

describe('SubscribeBox — success path', () => {
  beforeEach(() => mockFetchSuccess());

  it('shows pending state while submitting', async () => {
    render(<SubscribeBox />);
    await userEvent.type(screen.getByLabelText('이메일 주소'), 'test@example.com');
    fireEvent.click(screen.getByRole('button', { name: '요약 메일 받기' }));
    expect(screen.getByRole('button')).toBeDisabled();
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('신청됐어요')
    );
  });

  it('hides the form and shows success message after submit', async () => {
    render(<SubscribeBox />);
    await userEvent.type(screen.getByLabelText('이메일 주소'), 'test@example.com');
    fireEvent.click(screen.getByRole('button', { name: '요약 메일 받기' }));
    await waitFor(() =>
      expect(screen.queryByRole('form', { name: '뉴스레터 구독' })).not.toBeInTheDocument()
    );
    expect(screen.getByRole('status')).toHaveTextContent('신청됐어요');
  });

  it('calls POST /api/subscribe with the trimmed email', async () => {
    render(<SubscribeBox />);
    await userEvent.type(screen.getByLabelText('이메일 주소'), '  test@example.com  ');
    fireEvent.click(screen.getByRole('button', { name: '요약 메일 받기' }));
    const fetchMock = (global as unknown as Record<string, unknown>).fetch as jest.Mock;
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/subscribe');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body as string)).toEqual({ email: 'test@example.com' });
  });
});

describe('SubscribeBox — error path', () => {
  it('shows friendly inline error on server 500 and allows retry', async () => {
    mockFetchError(500);
    render(<SubscribeBox />);
    await userEvent.type(screen.getByLabelText('이메일 주소'), 'test@example.com');
    fireEvent.click(screen.getByRole('button', { name: '요약 메일 받기' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('한 번 더 눌러 주세요')
    );
    // Form should still be present (retry allowed)
    expect(screen.getByRole('form', { name: '뉴스레터 구독' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '요약 메일 받기' })).toBeEnabled();
  });

  it('shows friendly error on network failure', async () => {
    mockFetchNetworkFailure();
    render(<SubscribeBox />);
    await userEvent.type(screen.getByLabelText('이메일 주소'), 'test@example.com');
    fireEvent.click(screen.getByRole('button', { name: '요약 메일 받기' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('한 번 더 눌러 주세요')
    );
  });
});
