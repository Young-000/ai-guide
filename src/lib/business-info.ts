// 한국 법적 필수 사업자정보 단일 출처. Footer / 이용약관 / 개인정보처리방침이 공유.
// 빈 문자열 필드(phone)는 값이 채워질 때만 렌더링한다.
// 통신판매업신고번호: 광고수익(AdSense) 사이트는 소비자에게 재화·용역을 판매하지 않아
//   통신판매 대상이 아니므로 신고 의무 없음 → 해당 필드를 두지 않는다.
export const businessInfo = {
  serviceName: 'AIWire',
  bizName: '팀와이(TeamY)',
  representative: '장영재',
  bizRegNo: '874-30-01936',
  address: '서울특별시 동대문구 서울시립대로 14, 104동 22층 2호 (답십리동, 청계한신휴플러스)',
  email: 'wkddudwoek@gmail.com',
  phone: '',
  privacyOfficer: '장영재',
} as const;
