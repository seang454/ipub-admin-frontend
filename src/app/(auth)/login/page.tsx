"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const param = useSearchParams();
  useEffect(() => {
    signIn("keycloak", {
      callbackUrl: param.get("callbackUrl") || "/"
    })
  }, [param]);

  if (loading) return <div>Loading...</div>;

  if (session) return <div>Already logged in as {session.user?.email}</div>;

  return (
    <div>
      <h1>Login</h1>
      <button onClick={() => signIn("keycloak")}>Login with Keycloak</button>
    </div>
  );
}
