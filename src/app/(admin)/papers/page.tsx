"use client";
import DocuhubLoader from "@/components/loader/docuhub-loading";
import { PaperStats } from "@/components/papers/paper-stats";
import PaperManagement from "@/components/papers/paper-table";
import { useGetPaperQuery } from "@/lib/api/paperSlice";
import { useSession } from "next-auth/react";
import React from "react";

export default function PaperPage() {
  const { data: session } = useSession();
  const { data: papers, isLoading } = useGetPaperQuery({
    token: session?.accessToken ?? "",
  });

  if (isLoading) return <DocuhubLoader />;

  if (!papers) return <div>No papers found</div>; // handle undefined

  console.log("papers :>> ", papers);
  console.log("session  :>> ", session);

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-background-root">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-dynamic mb-4 sm:mb-6">
          Paper Management
        </h1>

        <PaperStats papers={papers} />

        <div className="mt-4 sm:mt-6 bg-card rounded-lg p-4 sm:p-5 md:p-6 border border-border shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-card-foreground mb-2">
              Papers
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage Approved, Rejected, and Submitted
            </p>
          </div>

          <PaperManagement allPapers={papers} />
        </div>
      </div>
    </div>
  );
}
