"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DocuhubLoader from "@/components/loader/docuhub-loading";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const param = useSearchParams();

  useEffect(() => {
    setIsSigningIn(true);
    signIn("keycloak", {
      callbackUrl: param.get("callbackUrl") || "/",
    });
  }, [param]);

  if (status === "loading" || isSigningIn) {
    return <DocuhubLoader />;
  }

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Already logged in
          </h1>
          <p className="text-muted-foreground">
            Signed in as {session.user?.email}
          </p>
        </div>
      </div>
    );
  }

  const handleSignIn = async () => {
    setIsSigningIn(true);
    await signIn("keycloak");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Welcome</h1>
        <Button
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="bg-accent text-white hover:bg-accent/90 font-semibold px-8 py-6 text-lg"
        >
          {isSigningIn ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            "Login with Keycloak"
          )}
        </Button>
      </div>
    </div>
  );
}
