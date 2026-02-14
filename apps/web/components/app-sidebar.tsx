"use client"

import Image from "next/image"
import * as React from "react"
import {
  IconBrandTelegram,
  IconBrandX,
  IconHelp,
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
      url: "/app/telegram",
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
            <div className="flex h-12 items-center gap-3 px-2">
              <div className="w-10 h-10 overflow-hidden rounded-md">
                <Image src="/logo.png" alt="Natie AI" width={40} height={40} className="object-cover scale-150" />
              </div>
              <span className="text-lg font-semibold">Natie AI</span>
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
