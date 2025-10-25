"use client";
import AdviserStats from "@/components/advisers/adviser-stats";
import { AdviserTable } from "@/components/advisers/adviser-table";
import DocuhubLoader from "@/components/loader/docuhub-loading";
import { useGetAllAdvisorsQuery } from "@/lib/api/advisorSlice";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import React from "react";

export default function AdviserPage() {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken as string | undefined;
  const { data: AdvisorData, isLoading } = useGetAllAdvisorsQuery(
    { token: accessToken ?? "" },
    { skip: !accessToken }
  );
  console.log("AdvisorData :>> ", AdvisorData);

  // wait for next-auth to initialize
  if (status === "loading") return <div>Loading...</div>;
  // redirect unauthenticated users
  if (status === "unauthenticated" || !accessToken) {
    redirect("/");
    return null;
  }
  if (isLoading || !AdvisorData) {
    return <DocuhubLoader />;
  }
  return (
    <div className="bg-background-root p-3 sm:p-4 md:p-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-dynamic mb-4 sm:mb-6">
          Adviser Management
        </h1>
        <AdviserStats advisers={AdvisorData} />

        <div className="mt-4 sm:mt-6 bg-card p-4 sm:p-5 md:p-6 rounded-lg border border-border shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-card-foreground mb-2">
              Advisers
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage users, roles, and permissions
            </p>
          </div>
          <AdviserTable advisers={AdvisorData} />
        </div>
      </div>
    </div>
  );
}
