import { auth } from '@/lib/auth';
import type { Session } from '@/lib/auth';
import { resolveOrgContext, resolveProjectContext, resolveTaskContext } from '@/lib/authz';
import { hasPermission, PermissionRequest } from '@/lib/permissions';
import { initTRPC, TRPCError } from '@trpc/server';
import { headers } from 'next/headers';
import { cache } from 'react';
import SuperJSON from 'superjson';
import z from 'zod';
 

export type TRPCContext = {
  session: Session["session"] | null;
  user: Session["user"] | null;
}

export const createTRPCContext = cache(async (options?: { req?: Request }): Promise<TRPCContext>=> {
  const requestHeaders = options?.req?.headers ?? await headers();
  const authSession = await auth.api.getSession({ headers: requestHeaders });

  return {
    session: authSession?.session ?? null,
    user: authSession?.user ?? null,
  };
});
 

const t = initTRPC.context<TRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: SuperJSON,
});
 
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(({ctx, next}) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must be signed in to access this resoureces",
    });
  }

  return next ({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
      userId: ctx.user.id,
    },
  });
});

export const orgProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const org = await resolveOrgContext(ctx);

  return next({
    ctx: { ...ctx, ...org }
  });
});

export const projectProcedure = orgProcedure.input(
  z.object({
    projectId: z.string().min(1),
  }),
).use(async ({ ctx, input, next }) => {
  const withProject = await resolveProjectContext(ctx, input.projectId)

  return next(({ ctx: withProject }));
}); 

export const taskProcedure = orgProcedure 
  .input(z.object({ taskId: z.string().min(1) }))
  .use(async ({ ctx, input, next }) => {
    const withTask = await resolveTaskContext(ctx, input.taskId);
    return next ({ ctx: withTask });
  });

  function assertPermission(role: string, request: PermissionRequest): void {
  if (!hasPermission(role, request)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Your role does not allow this action",
    });
  }
}

export function permittedProcedure(request: PermissionRequest) {
  return orgProcedure.use(({ ctx, next }) => {
    assertPermission(ctx.role, request);
    return next();
  });
}

export function permittedProjectProcedure(request: PermissionRequest) {
  return projectProcedure.use(({ ctx, next }) => {
    assertPermission(ctx.role, request);

    return next();
  });
}