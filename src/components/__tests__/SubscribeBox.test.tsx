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
  it('renders the heading', () => {
    render(<SubscribeBox />);
    expect(screen.getByText('매일 AI 뉴스를 메일로 받아보세요')).toBeInTheDocument();
  });

  it('renders the coming-soon badge', () => {
    render(<SubscribeBox />);
    expect(screen.getByText('곧 오픈 예정 (Coming soon)')).toBeInTheDocument();
  });

  it('renders the email input and submit button', () => {
    render(<SubscribeBox />);
    expect(screen.getByLabelText('이메일 주소')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '구독 신청' })).toBeInTheDocument();
  });
});

describe('SubscribeBox — success path', () => {
  beforeEach(() => mockFetchSuccess());

  it('shows pending state while submitting', async () => {
    render(<SubscribeBox />);
    await userEvent.type(screen.getByLabelText('이메일 주소'), 'test@example.com');
    fireEvent.click(screen.getByRole('button', { name: '구독 신청' }));
    expect(screen.getByRole('button')).toBeDisabled();
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('오픈하면 이 메일로 알려드릴게요')
    );
  });

  it('hides the form and shows success message after submit', async () => {
    render(<SubscribeBox />);
    await userEvent.type(screen.getByLabelText('이메일 주소'), 'test@example.com');
    fireEvent.click(screen.getByRole('button', { name: '구독 신청' }));
    await waitFor(() =>
      expect(screen.queryByRole('form', { name: '뉴스레터 구독' })).not.toBeInTheDocument()
    );
    expect(screen.getByRole('status')).toHaveTextContent('곧 오픈 예정입니다');
  });

  it('calls POST /api/subscribe with the trimmed email', async () => {
    render(<SubscribeBox />);
    await userEvent.type(screen.getByLabelText('이메일 주소'), '  test@example.com  ');
    fireEvent.click(screen.getByRole('button', { name: '구독 신청' }));
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
    fireEvent.click(screen.getByRole('button', { name: '구독 신청' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('다시 시도해주세요')
    );
    // Form should still be present (retry allowed)
    expect(screen.getByRole('form', { name: '뉴스레터 구독' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '구독 신청' })).toBeEnabled();
  });

  it('shows friendly error on network failure', async () => {
    mockFetchNetworkFailure();
    render(<SubscribeBox />);
    await userEvent.type(screen.getByLabelText('이메일 주소'), 'test@example.com');
    fireEvent.click(screen.getByRole('button', { name: '구독 신청' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('다시 시도해주세요')
    );
  });
});
