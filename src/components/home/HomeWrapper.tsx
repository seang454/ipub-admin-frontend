"use client";
import React from "react";
import { Providers } from "@/app/providers";
import StickyBanner from "../header/StickyBanner";
import NavbarWrapper from "../header/NavbarWrapper";

export default function HomeWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <StickyBanner />
      <NavbarWrapper />
      <main className="mt-20">{children}</main>
    </Providers>
  );
}
