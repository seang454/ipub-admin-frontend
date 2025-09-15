"use client";

import PageHome from "@/components/home/page";
import { useSession } from "next-auth/react";
export default function HomePage() {
  const { data } = useSession();
  console.log('data :>> ', data);
  // return redirect(data ? "/dashboard" : "/login");
  return <PageHome/>
}
