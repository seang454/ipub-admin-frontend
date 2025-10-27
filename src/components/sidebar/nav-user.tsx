"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { toast } from "react-toastify";
import DocuhubLoader from "@/components/loader/docuhub-loading";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ callbackUrl: "/" });
    } catch {
      toast.error("Failed to sign out", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
      setIsSigningOut(false);
    }
  };

  return (
    <>
      {isSigningOut && <DocuhubLoader />}
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground py-2 sm:py-2.5"
              >
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="text-[10px] sm:text-xs">
                    CN
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-[11px] sm:text-sm leading-tight min-w-0">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-[10px] sm:text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-3 sm:size-4 flex-shrink-0" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-48 sm:min-w-56 rounded-lg border-none bg-white dark:bg-gray-900"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal rounded-lg">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback className="text-xs">CN</AvatarFallback>
                    </Avatar>
                    <AvatarFallback className="rounded-lg text-xs">
                      AD
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs sm:text-sm leading-tight min-w-0">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard"
                    className="cursor-pointer text-xs sm:text-sm py-2"
                  >
                    <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs sm:text-sm py-2">
                  <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs sm:text-sm py-2">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="cursor-pointer text-xs sm:text-sm py-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                    Log out
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
