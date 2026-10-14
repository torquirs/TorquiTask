import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, twoFactor } from "better-auth/plugins"
import { ac, roles } from "./permissions";


import db from "./db";
import { defaultPlan, maxMembersFor, ORGANIZATIONS_PER_USER, PLAN_LIMITS } from "./entitlements";
import { DEFAULT_WORKFLOW_STATUSES } from "./workflow-statues";

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7 ;

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql", 
    }),
    emailAndPassword: {
      requireEmailVerification: true,
      enabled: true,
      sendResetPassword: async ({ user, token }) => {
        // TODO: Implement a proper email sending service here to send the reset.
        console.log(
          `Sending reset password email to ${user.email} with token: ${token}`
        );
      },
    },
       emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url }) => {
        // TODO: Implement a proper email sending service here to send the verification.
        console.log(
          `Sending verification email to ${user.email} with url: ${url}`
        );
      },
    },
    trustedOrigins: [process.env.BETTER_AUTH_URL as string],
      socialProviders: { 
    github: { 
      clientId: process.env.GITHUB_CLIENT_ID as string, 
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
    }, 
    google:{
        clientId: process.env.GOOGLE_CLIENT_ID as string, 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
    } 
  }, 
  appName: "TorquiTask", // provide your app name. It'll be used as an issuer.




    plugins: [twoFactor({
      issuer: "TorquiTak",
    }),

        organization({
          ac,
          roles,
          creatorRole: "owner",

          allowUserToCreateOrganization: (user) => user.emailVerified,

          organizationLimit: ORGANIZATIONS_PER_USER,

          membershipLimit: (_user, organization) => maxMembersFor(organization.id),

          invitationExpiresIn: SEVEN_DAYS_IN_SECONDS,
          invitationLimit: 100,
          cancelPendingInvitationsOnReInvite: true,

          sendInvitationEmail: async (invitation) => {
            console.log(`Sending invitation email to ${invitation.email}`);
          },

          organizationHooks: {
            afterCreateOrganization: async ({ organization, user }) => {
              const limits = PLAN_LIMITS[defaultPlan()];

              await db.entitlement.create({
                data: {
                  organizationId: organization.id,
                  plan: defaultPlan(),
                  ...limits,
                },
              });

              const creator = await db.member.findFirst({
                where: { organizationId: organization.id, userId: user.id },
                select: { id: true },
              });

              await db.project.create({
                data: {
                  name: "General",
                  description:
                    "Everything that has not found a home in another project yet.",
                  ownerId: creator?.id ?? null,
                  organizationId: organization.id,

                  workflowStatuses: {
                    create: DEFAULT_WORKFLOW_STATUSES.map((status) => ({
                      organizationId: organization.id,
                      name: status.name,
                      color: status.color,
                      position: status.position,
                      category: status.category,
                    })),
                  },
                },
              });
            },

            beforeDeleteOrganization: async ({ organization, user }) => {
              const [members, pendingInvitations, entitlement] = await Promise.all([
                db.member.findMany({
                  where: { organizationId: organization.id },
                  select: { id: true, userId: true, createdAt: true },
                }),
                db.invitation.findMany({
                  where: { organizationId: organization.id },
                  select: { id: true, email: true, createdAt: true },
                }),
                db.entitlement.findFirst({
                  where: { organizationId: organization.id },
                  select: { id: true, plan: true },
                }),
              ]);

              // TODO: record activity for members, pending invitation, and entitlement delection
            },
          },
        }),
      ],
    });


    export type Session = typeof auth.$Infer.Session;
