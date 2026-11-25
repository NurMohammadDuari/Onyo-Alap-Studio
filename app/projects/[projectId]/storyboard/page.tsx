import { StoryboardClient } from '../../../../components/studio/StoryboardClient';

export default async function ProjectStoryboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <StoryboardClient projectId={projectId} />;
}
