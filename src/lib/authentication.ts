import "server-only"

import { headers } from "next/headers";
import { auth } from "./auth";
import { notFound, redirect } from "next/navigation";
import { OrgContext } from "./validations/auth";
import * as organizationService from  "@/server/services/organization";
import { resolveOrgContext } from "./authz";
import { cache } from "react";




export async function getSession() {
    return auth.api.getSession({ headers: await headers() });
}

export type AuthSession = NonNullable<Awaited<ReturnType<typeof getSession>>>;

export async function redirectIfiSignIn(){
    const session = await getSession();
    if (session?.user) redirect("/dashboard");
}


export default async function requireSession(redirectTo: string) {
    const session = await getSession();
    if (!session) {
        const next = redirectTo ? `?next=${redirectTo}` : "";
        redirect("/sign-in" + next);
    }

    return session;
}

export type ActiveOrganization = {
    user: AuthSession["user"];
    session: Awaited<ReturnType<typeof requireSession>>;
    organization: Awaited<ReturnType<typeof organizationService.bySlug>>;
    ctx: OrgContext;
};

export const requireActiveOrganization = cache(
    async function requireActiveOrganization (
        orgSlug:string, path:string
    ): Promise<ActiveOrganization> {
        const session = await requireSession(path);

        const protectedCtx = {
    session: session.session,
    user: session.user,
    userId: session.user.id,
};

        const organisation = await organizationService
        .bySlug(protectedCtx, {
            slug: orgSlug,
        })
        .catch(() => null);


        if(!organisation) notFound()
 

            if(session.session.activeOrganizationId !== organisation.id) {
                await auth.api.setActiveOrganization({
                    headers: await headers(),
                    body: { organizationId: organisation.id }
                });

                const pathname = ((await headers()).get ("x-pathname") ?? path)
                redirect(pathname);
            }

            return {
                user: session.user,
                session,
                organization: organisation,
                ctx: await resolveOrgContext(protectedCtx)
            }
    },
);
