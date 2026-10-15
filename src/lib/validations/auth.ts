import { ProjectVisibility } from "@/generated/prisma";
import type { Session as AuthSession } from "@/lib/auth";
import { organization } from "better-auth/plugins";
import z from "zod";

const password = z
  .string()
  .min(8, "Password must be at least 8 characters long");

const email = z
  .email("Enter a valid email address") 
  .max(200, "That email address is too long");

  export const signInschema = z.object({
    email,
    password: z.string().min(1,"Password is required."),
  });

export const SignUpSchema = z
.object({
    name: z
      .string()
      .trim()
      .min(1, "Enter your name")
      .max(80, "That name is too long"),
    email,
    password,
    confirmPassword: z.string().min(1, "Confirmation your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Those passwords do not match",
        path: ["ConfirmationPassword"],
    });

    export const onboardingSchema = z.object({
      name: z
      .string()
      .trim()
      .min(1, "Enter your name")
      .max(80, "That name is too long"),
      organizationName: z
      .string()
      .trim()
      .min(1, "Enter your organization")
      .max(80, "That name is too long"),
    });

export type SignInFormData = z.infer<typeof signInschema>;
export type SignUpFormData = z.infer<typeof SignUpSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export type ProtectedContext = {
  session: AuthSession["session"];
  user: AuthSession["user"];
  userId: string;
};

export type OrgContext = ProtectedContext & {
  orgId: string;
  role: string;
  member: {
    id: string;
    role: string;
    userId: string;
    organizationId: string;
    createdAt: Date;
  };
};


export function slugify(value: string): string {
  return (
    value
    .normalize("NFKD")
    .replace(/\p{M}/gu,"")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
  );
}

export type ProjectContext = OrgContext & {
  project: {
    id: string;
    visibility: ProjectVisibility;
    archivedAt: Date | null;
  }
}

export type TaskContex = ProjectContext & {
  task: {
    id: string;
    projectId: string;
    statusId: string;
    parentId: string | null;
    rank: string;
  };
};

