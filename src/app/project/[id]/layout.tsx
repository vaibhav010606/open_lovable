import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Editor - Open Lovable',
  description: 'Design and build your vibe-coded application.',
};

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
