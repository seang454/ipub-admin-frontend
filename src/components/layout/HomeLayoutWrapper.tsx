"use client";
import { usePathname } from "next/navigation";
import React from "react";
import PageHome from "../home/page";
import LayoutWraper from "./LayoutWrapper";
import HomeWrapper from "../home/HomeWrapper";
import NotificationPage from "@/app/(admin)/notification/page";
import NotificationDetailPage from "@/app/(admin)/notification/[id]/page";
export default function HomeLayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathName = usePathname();
  const hiddenPaths = [
    "/dashboard",
    "/users",
    "/papers",
    "/proposals",
    "/students",
    "/advisers",
  ];
  const editePdf = ["/display"];
  const shouldHideNavbar = hiddenPaths.some(
    (path) => pathName === path || pathName.startsWith(`${path}/`)
  );
  const should = editePdf.some(
    (path) => pathName === path || pathName.startsWith(`${path}/`)
  );
  if (shouldHideNavbar) return <LayoutWraper>{children}</LayoutWraper>;
  else if (pathName === "/notification") {
    // Check for the notification page
    return <NotificationPage />;
  } else if (pathName.startsWith("/notification/")) {
    // Extract the notification ID from the URL for the detail page
    const notificationId = pathName.split("/notification/")[1];
    return <NotificationDetailPage uuid={notificationId} />;
  } else return <HomeWrapper>{children}</HomeWrapper>;
}
