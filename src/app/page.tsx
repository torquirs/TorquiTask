import db from "@/lib/db";
import { HydrateClient } from "@/trpc/server";
import { ClientGreeting } from '@/components/client-greeting';
import { ErrorBoundary } from 'react-error-boundary';
import Image from "next/image";
import { Suspense } from "react";

export const instant = false;
export default async function Home() {

  const users = await db.user.findMany();

  return (
   <HydrateClient>
      <div>
        ...
      </div>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <ClientGreeting />
        </Suspense>
      </ErrorBoundary>
       </HydrateClient>
  );
}
