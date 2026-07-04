import type { Metadata } from 'next';
import ProjectsContent from './projects-content';
import { BASE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: '토이 프로젝트 | AIWire',
  description: 'AI 도구로 따라 해볼 수 있는 간단한 토이 프로젝트 모음.',
  alternates: { canonical: `${BASE_URL}/projects` },
};

export default function ProjectsPage(): JSX.Element {
  return <ProjectsContent />;
}
