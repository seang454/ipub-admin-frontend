'use client';

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function AuthDebug() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log("AuthDebug - Status:", status);
    console.log("AuthDebug - Session:", session);
    
    if (session) {
      console.log("AuthDebug - Access Token:", session.accessToken ? "Present" : "Missing");
      console.log("AuthDebug - User:", session.user);
      console.log("AuthDebug - Roles:", session.user?.roles);
    }
  }, [session, status]);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg max-w-md text-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div>Status: {status}</div>
      <div>Has Session: {session ? "Yes" : "No"}</div>
      {session && (
        <>
          <div>Username: {session.user?.username || "N/A"}</div>
          <div>Email: {session.user?.email || "N/A"}</div>
          <div>Roles: {session.user?.roles?.join(", ") || "N/A"}</div>
          <div>Has Token: {session.accessToken ? "Yes" : "No"}</div>
        </>
      )}
    </div>
  );
}
