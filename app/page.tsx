import { listProjects } from '../lib/db';
import { DashboardClient } from '../components/studio/DashboardClient';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const initialProjects = listProjects();
  return <DashboardClient initialProjects={initialProjects} />;
}
