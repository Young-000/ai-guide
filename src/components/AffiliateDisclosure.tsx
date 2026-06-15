interface AffiliateDisclosureProps {
  /**
   * When false (default), the disclosure is always shown.
   * When a boolean is passed, it is shown only if `show` is true —
   * use `hasAffiliateLinks(slugs)` from @/lib/affiliateLinks to compute this.
   */
  show?: boolean;
}

export default function AffiliateDisclosure({ show = true }: AffiliateDisclosureProps): JSX.Element | null {
  if (!show) return null;

  return (
    <p className="text-xs text-gray-500 mt-8 text-center">
      이 페이지의 일부 링크는 제휴 링크로, 구매 시 일부 수수료를 받을 수 있습니다. 추천은 사용자 경험을 기반으로 하며, 수수료와 무관합니다.
    </p>
  );
}
