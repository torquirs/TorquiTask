import { AppHeader } from '@/components/app-shell/app-header';
import { ProjectView } from '@/components/project/project-view';
import { requireActiveOrganization } from '@/lib/authentication';
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { organization } from 'better-auth/plugins';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export function nextCursor(page: { nextCursor: string | null }) {
  return page.nextCursor ?? undefined;
}

async function ProjectsPageContent({ params, searchParams }: PageProps) {
  const { orgSlug } = await params;
  const query = await searchParams;

  const { organization } = await requireActiveOrganization(
    orgSlug, 
    `/${orgSlug}/projects`,
  );

  const includeArchived = query.archived === "true";

  prefetch(
    trpc.project.list.infiniteQueryOptions(
      {
        includeArchived,
        limit: 50,
      },
      {
        getNextPageParam: nextCursor,
      },
    ),
  );

  return (
    <>
    <AppHeader 
        crumbs={[
          { label:organization.name, href:`/${orgSlug}` },
          { label: "Projects" },
        ]}
    />
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <HydrateClient>
          <ProjectView orgSlug={orgSlug} />
        </HydrateClient>
      </div>
    </>
  );
}

export default function ProjectsPage(props: PageProps) {
  return (
    <Suspense fallback={<div role="status">Loading projects...</div>}>
      <ProjectsPageContent {...props} />
    </Suspense>
  );
}
