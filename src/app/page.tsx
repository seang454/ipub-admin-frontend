"use client";

import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function HomePage() {
  const { data } = useSession();
  return redirect(data ? "/dashboard" : "/login");
}
