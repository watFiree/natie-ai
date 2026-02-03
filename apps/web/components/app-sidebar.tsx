"use client"

import * as React from "react"
import {
  IconBrandTelegram,
  IconBrandX,
  IconHelp,
  IconInnerShadowTop,
  IconMail,
  IconRobot,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react"

import { NavChatsList } from "@/components/nav-chats-list"
import { NavGateways } from "@/components/nav-gateways"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Natie",
      url: "/app/natie",
      icon: IconRobot,
    },
    {
      title: "Email",
      url: "/app/email",
      icon: IconMail,
    },
    {
      title: "X",
      url: "/app/x",
      icon: IconBrandX,
    }
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  gateways: [
    {
      name: "Telegram",
      url: "#",
      icon: IconBrandTelegram,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex h-10 items-center gap-2 px-2">
              <IconInnerShadowTop className="!size-5" />
              <span className="text-base font-semibold">Natie AI</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavChatsList items={data.navMain} />
        <NavGateways items={data.gateways} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
