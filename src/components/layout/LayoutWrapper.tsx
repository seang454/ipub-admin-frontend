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
  return pathname === "/login" ? (
    children
  ) : (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Breadcrumb />
        <main>
          <ReduxProvider>{children}</ReduxProvider>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default LayoutWraper;
