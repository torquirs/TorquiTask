import { requireActiveOrganization } from "@/lib/authentication";
import { Suspense } from "react";
import * as projectService from "@/server/services/project.service";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-shell/app-header";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { ProjectWorkspace } from "@/components/project/prohect-worksapce";
import { nextCursor } from "@/lib/task-queries";

import Link from "next/link";
import { SettingsIcon } from "lucide-react";
import { ProjectGlyph } from "@/components/project/project-client";
import { Button } from "@/components/ui/button";
import { TRPCError } from "@trpc/server";


const ProjectDetailsContent = async ({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string; projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const { orgSlug, projectId } = await params;

  const { organization, ctx } = await requireActiveOrganization(
    orgSlug,
    `/${orgSlug}/projects/${projectId}`,
  );

  const project = await projectService
    .byId(ctx, { projectId })
    .catch((error: unknown) => {
      if (error instanceof TRPCError && error.code === "NOT_FOUND") {
        return null;
      }
      throw error;
    });

  if (!project) notFound();

  prefetch(
    trpc.task.list.infiniteQueryOptions({}, { getNextPageParam: nextCursor }),
  );

  return (
    <>
      <AppHeader
        crumbs={[
          { label: organization.name, href: `/${orgSlug}` },
          { label: "Projects", href: `/${orgSlug}/projects` },
          { label: project.name },
        ]}

        actions={
          <>
            <Button variant="ghost" size="icon" asChild>
              <Link
                href={`/${orgSlug}/projects/${projectId}/settings`}
                aria-label="Project settings"
              >
                <SettingsIcon className="size-4" aria-hidden />
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-3 border-b px-4 py-3 md:px-6">
        <ProjectGlyph color={project.color} icon={project.icon} size="lg" />

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-heading">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-muted-foreground truncate text-xs">
              {project.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col ">
        <HydrateClient>
          <ProjectWorkspace projectId={projectId} />
        </HydrateClient>
      </div>
    </>
  );
};

export default function ProjectDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string; projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<div role="status">Loading project...</div>}>
      <ProjectDetailsContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}