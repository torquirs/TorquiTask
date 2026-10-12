import "server-only"

import { headers } from "next/headers";
import { auth } from "./auth";
import { redirect } from "next/navigation";




export async function getSession() {
    return auth.api.getSession({ headers: await headers() });
}

export async function redirectIfiSignIn(){
    const session = await getSession();
    if (session?.user) redirect("/dashboard");
}