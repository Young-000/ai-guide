import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Situation } from '@/types';
import situationsData from '@/data/situations.json';
import SituationDetail from './situation-detail';
import { BASE_URL } from '@/lib/site';
const situations = situationsData.situations as Situation[];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return situations.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const situation = situations.find((s) => s.slug === slug);

  if (!situation) {
    return { title: 'AIWire' };
  }

  return {
    title: `${situation.title} | AIWire`,
    description: situation.subtitle,
    alternates: {
      canonical: `${BASE_URL}/situations/${slug}`,
    },
    openGraph: {
      title: `${situation.title} | AIWire`,
      description: situation.subtitle,
      url: `${BASE_URL}/situations/${slug}`,
      siteName: 'AIWire',
      locale: 'ko_KR',
      type: 'article',
    },
  };
}

export default async function SituationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const situation = situations.find((s) => s.slug === slug);

  if (!situation) {
    notFound();
  }

  const relatedSituations = situations
    .filter((s) => s.category === situation.category && s.slug !== situation.slug)
    .slice(0, 3);

  return (
    <SituationDetail
      situation={situation}
      relatedSituations={relatedSituations}
    />
  );
}
