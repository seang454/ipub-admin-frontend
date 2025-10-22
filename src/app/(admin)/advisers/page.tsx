'use client';
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
    <div className="bg-background-root p-6 ">
      <div>
        <h1 className="text-3xl font-semibold text-dynamic mb-6">
          Adviser Management
        </h1>
        <AdviserStats advisers={AdvisorData} />

        <div className="mt-6 bg-white p-6 rounded-lg">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Advisers
            </h2>
            <p className="text-gray-600">
              Manage users, roles, and permissions
            </p>
          </div>
          <AdviserTable advisers={AdvisorData} />
        </div>
      </div>
    </div>
  );
}
