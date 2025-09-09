"use client";

import { signIn, useSession } from "next-auth/react";

export default function HomePage() {
    const { data } = useSession()
  console.log(data)
  return <div>Homepage
    <button onClick={() => signIn("keycloak")}>Click me</button>
    <div>Acc</div>
  </div>
}
