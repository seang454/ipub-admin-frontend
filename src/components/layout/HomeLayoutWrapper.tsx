"use client";
import { usePathname } from "next/navigation";
import React from "react";
import PageHome from "../home/page";
import LayoutWraper from "./LayoutWrapper";
import HomeWrapper from "../home/HomeWrapper";
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
  return <HomeWrapper>{children}</HomeWrapper>;
}
