import requireSession from '@/lib/authentication'
import * as organizationServices from "@/server/services/organization";
import { redirect } from 'next/navigation';


const DashboardPage = async () => {
  const session = await requireSession("/dashboard");

  const organizations = await organizationServices.listForUser({
    session: session.session,
    user: session.user,
    userId: session.user.id,
  });

  if (organizations.length === 0) redirect("/onboarding")

  const activeId = session.session.activeOrganizationId;
  const active = organizations.find(
    (organization) => organization?.id === activeId,
  );

  redirect(`/${active?.slug ?? organizations[0].slug}`)
};

export default DashboardPage