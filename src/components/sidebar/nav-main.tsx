"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-semibold text-[11px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
        Navigation
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible hover:text-white hover:bg-accent-hover rounded-md font-semibold"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title} asChild>
                  {item.items ? (
                    <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-sm md:text-base py-1.5 sm:py-2">
                      {item.icon && (
                        <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      )}
                      <span className="truncate">{item.title}</span>
                      <ChevronRight className="ml-auto w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 flex-shrink-0" />
                    </div>
                  ) : (
                    <Link
                      href={item.url}
                      className="flex items-center gap-2 sm:gap-3 text-sm sm:text-sm md:text-base w-full py-1.5 sm:py-2"
                    >
                      {item.icon && (
                        <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      )}
                      <span className="truncate">{item.title}</span>
                    </Link>
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              {item.items?.length && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link
                            href={subItem.url}
                            className="text-xs sm:text-sm py-1.5"
                          >
                            <span className="truncate">{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
