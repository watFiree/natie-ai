'use client';

import Link from 'next/link';
import { IconCirclePlus, type Icon } from '@tabler/icons-react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function NavChatsList({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={`Chat with ${item.title}`}
                className="h-10 [&_svg]:size-5"
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span className="font-medium">Chat with {item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="text-sidebar-foreground/70 h-10 [&_svg]:size-5"
            >
              <Link href="/app/integrations">
                <IconCirclePlus className="text-sidebar-foreground/70" />
                <span className="font-medium">Add integration</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
