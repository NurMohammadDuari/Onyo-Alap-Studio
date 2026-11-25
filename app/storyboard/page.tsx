import { redirect } from 'next/navigation';
import { listProjects } from '../../lib/db';

export const dynamic = 'force-dynamic';

export default function StoryboardIndexPage() {
  const projects = listProjects();
  const targetId = projects[0]?.projectId ?? 'police-ranks-reconstruction';
  redirect(`/projects/${targetId}/storyboard`);
}
