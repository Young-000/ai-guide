import { render, screen, fireEvent } from '@testing-library/react';
import SubscribeBox from '@/components/SubscribeBox';

describe('SubscribeBox', () => {
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

  it('shows success message after form submit', () => {
    render(<SubscribeBox />);
    fireEvent.click(screen.getByRole('button', { name: '구독 신청' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      '곧 오픈 예정입니다. 오픈하면 알려드릴게요!'
    );
  });

  it('hides the form after submit', () => {
    render(<SubscribeBox />);
    fireEvent.click(screen.getByRole('button', { name: '구독 신청' }));
    expect(
      screen.queryByRole('form', { name: '뉴스레터 구독' })
    ).not.toBeInTheDocument();
  });
});
