import { requireActiveOrganization } from "@/lib/authentication";
import { Suspense } from "react";
import * as projectService from "@/server/services/project.service";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-shell/app-header";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ProjectSettingsForm } from "@/components/project/project-settings-form";
import { ProjectWorkspace } from "@/components/project/prohect-worksapce";
import { nextCursor } from "@/lib/task-queries";
import { TRPCError } from "@trpc/server";

const ProjectSettingsContent = async ({
  params,
}: {
  params: Promise<{ orgSlug: string; projectId: string }>;
}) => {
  const { orgSlug, projectId } = await params;
  const { organization, ctx } = await requireActiveOrganization(
    orgSlug,
    `/${orgSlug}/projects/${projectId}/settings`,
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
          { label: project.name, href: `/${orgSlug}/projects/${projectId}` },
          { label: "Settings" },
        ]}
      />

      <main className="flex flex-1 flex-col p-4 md:p-6">
        <div className="mx-auto grid w-full max-w-2xl gap-6">
          <header className="grid gap-1">
            <h1 className="text-xl font-semibold tracking-tight">
              Project Settings
            </h1>
            <p className="text-muted-foreground text-sm">
              How {project.name} looks, who can reach it, and what its board is
              made of.
            </p>
          </header>

          <ProjectSettingsForm project={project} />

          <HydrateClient>
            <ProjectWorkspace projectId={projectId} />
          </HydrateClient>
        </div>
      </main>
    </>
  );
};

export default function ProjectSettings({
  params,
}: {
  params: Promise<{ orgSlug: string; projectId: string }>;
}) {
  return (
    <Suspense fallback={<div role="status">Loading project settings...</div>}>
      <ProjectSettingsContent params={params} />
    </Suspense>
  );
}