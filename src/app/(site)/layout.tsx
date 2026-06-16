import { Header, Footer, FeedbackWidget } from '@/components';
import AchievementToast from '@/components/AchievementToast';

// Chrome layout for the main site. The bare /embed routes live outside this
// group so they render without header/footer (iframe-friendly).
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        본문으로 건너뛰기
      </a>
      <Header />
      <main id="main-content" className="flex-1 bg-white">
        {children}
      </main>
      <Footer />
      <FeedbackWidget />
      <AchievementToast />
    </>
  );
}
