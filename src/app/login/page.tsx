'use client';

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  useEffect(() => {
    console.log("Login page - Session status:", status);
    console.log("Login page - Session:", !!session);
    
    if (status === "authenticated" && session) {
      console.log("User is authenticated, redirecting to:", callbackUrl);
      router.push(callbackUrl);
      return;
    }

    if (status === "unauthenticated" && !isSigningIn) {
      console.log("User is not authenticated, starting sign in");
      setIsSigningIn(true);
      signIn("keycloak", { 
        callbackUrl,
        redirect: true 
      });
    }
  }, [status, session, callbackUrl, router, isSigningIn]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading authentication...</div>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Authenticated! Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div>Redirecting to Keycloak...</div>
    </div>
  );
}
