'use client';

import { signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

export default function page() {
  const pathname = usePathname();
  useEffect(() => {
    signIn("keycloak", { callbackUrl: pathname });
  }, []);
  return <div className="flex justify-center items-center h-screen">Redirect to keycloak...</div>;
}
