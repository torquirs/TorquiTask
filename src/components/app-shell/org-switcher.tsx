"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { cn } from "cn";
import { Spinner } from "../ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import type { OrganizationOption } from "./app-sidebar";

export const OrgSwitcher = ({
  organizations,
  activeId,
}: {
  organizations: OrganizationOption[];
  activeId: string;
}) => {
  const router = useRouter();
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  const active =
    organizations.find((organization) => organization.id === activeId) ??
    organizations[0];

  if (!active) return null;

  const switchTo = async (organization: OrganizationOption) => {
    if (organization.id === active.id) return;

    setSwitchingTo(organization.id);

    const { error } = await authClient.organization.setActive({
      organizationId: organization.id,
    });

    if (error) {
      setSwitchingTo(null);
      toast.error(`Could not switch to ${organization.name}`);
      return;
    }

    router.push(`/${organization.slug}`);
    router.refresh();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent"
            >
              <OrgAvatar name={active.name} />
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold">
                  {active.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {active.role}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organization
            </DropdownMenuLabel>
            {organizations.map((organization) => (
              <DropdownMenuItem
                key={organization.id}
                onClick={() => switchTo(organization)}
                disabled={switchingTo !== null}
                className="gap-2"
              >
                <OrgAvatar
                  name={organization.name}
                  className="size-6 text-xs"
                />
                <span className="flex-1 truncate">{organization.name}</span>
                {switchingTo === organization.id ? (
                  <Spinner className="size-3.5" />
                ) : organization.id === active.id ? (
                  <span
                    aria-hidden
                    className="size-1.5 shrink-0 rounded-full bg-primary"
                  />
                ) : null}
                {organization.id === active.id ? (
                  <span className="sr-only">Current organization</span>
                ) : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export function OrgAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toLocaleUpperCase();

  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground",
        className,
      )}
    >
      {initials}
    </span>
  );
}
