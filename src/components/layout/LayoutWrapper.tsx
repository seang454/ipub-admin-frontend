"use client";
import { usePathname } from "next/navigation";
import React from "react";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import Breadcrumb from "../sidebar/breadcrumb";
import { AppSidebar } from "../sidebar/app-sidebar";
import ReduxProvider from "@/lib/Provider";

const LayoutWraper = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname();
  return pathname === "/login" || pathname === "/unauthorized" ? (
    children
  ) : (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="min-h-screen">
        <Breadcrumb />
        <main className="flex-1 overflow-auto p-4">
          <ReduxProvider>{children}</ReduxProvider>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default LayoutWraper;
