import { AuthCard } from '@/components/auth/auth-card';
import { NewOrganization } from '@/components/organization/create-org';
import requireSession from '@/lib/authentication';
import * as organizationServices from "@/server/services/organization";
import { redirect } from 'next/navigation';
import React from 'react'

const OnboardingPage = async () =>{
    const session = await requireSession("/onboarding");

     const organizations = await organizationServices.listForUser({
        session: session.session,
          user: session.user,
        userId: session.user.id,
      });
    
      if (organizations.length > 0) redirect("/dashboard");

  return (
    <div  className="bg-background flex min-h-svh flex-col items-center
     justify-center px-4 py-10">
        <div className="w-full max-w-sm">
            <div className="mb-8 flex justify-center">
                        Setup
            </div>

            {session.user.emailVerified ?
              
                <AuthCard 
                    title="Create your organization"
                    description="Evrything in TorquiTask 
                    Lives inside an organization - 
                    projects, tasks, and the people you 
                    share them with."
                >

                    <NewOrganization 
                        defaultName={ session.
                            user.name
                        }
                    />
                    <div />
                </AuthCard>
                 : "" }
        </div>
        </div>
  )
}

export default OnboardingPage;