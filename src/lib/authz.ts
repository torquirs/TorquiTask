import "server-only";

import { TRPCError } from "@trpc/server";
import {
  OrgContext,
 // ProjectContext,
  ProtectedContext,
 // TaskContext,
} from "./validations/auth";
import db from "./db";
// import { hasPermission } from "./permissions";
//import { ProjectVisibility } from "@/generated/prisma/enums";

export const AuthzCause = {
  NO_ACTIVE_ORGANIZATION: "no_active_organization",
  NOT_A_MEMBER: "not_a_member",
} as const;

export async function resolveOrgContext(
  ctx: ProtectedContext,
): Promise<OrgContext> {
  const session = ctx.session as typeof ctx.session & {
    activeOrganizationId?: string | null;
    session?: {
      activeOrganizationId?: string | null;
    } | null;
  };

  const organizationId =
    session.activeOrganizationId ?? session.session?.activeOrganizationId ?? null;

  if (!organizationId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Select an organization to continue",
      cause: AuthzCause.NO_ACTIVE_ORGANIZATION,
    });
  }

  const member = await db.member.findFirst({
    where: { organizationId, userId: ctx.userId },
    select: {
      id: true,
      role: true,
      userId: true,
      organizationId: true,
      createdAt: true,
    },
  });

  if (!member) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are no longer a member of this organization",
      cause: AuthzCause.NOT_A_MEMBER,
    });
  }

  return {
    ...ctx,
    orgId: member.organizationId,
    role: member.role,
    member,
  };
}

