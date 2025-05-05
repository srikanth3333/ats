"use client";

import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Report Tracker",
      url: "/dashboard/report-tracker",
      icon: IconDashboard,
    },
    {
      title: "Clients",
      url: "/dashboard/clients",
      icon: IconListDetails,
    },
    {
      title: "Job Postings",
      url: "/dashboard/job-postings",
      icon: IconChartBar,
    },
    {
      title: "Candidates",
      url: "/dashboard/candidates",
      icon: IconFolder,
    },
    {
      title: "Calendar",
      url: "/dashboard/calendar",
      icon: IconUsers,
    },
    {
      title: "Kanban Board",
      url: "/dashboard/kanban-board",
      icon: IconUsers,
    },
  ],
  navClouds: [],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/dashboard/",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "/dashboard/",
      icon: IconSearch,
    },
  ],
  documents: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Job Warp</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
