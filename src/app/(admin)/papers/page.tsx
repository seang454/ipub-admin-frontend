'use client'
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

  if (isLoading) return <DocuhubLoader/>;

  if (!papers) return <div>No papers found</div>; // handle undefined

  console.log("papers :>> ", papers);
  console.log("session  :>> ", session);
  
  return (
    <div className="p-6 bg-background-root">
      <div>
        <h1 className="text-3xl font-semibold text-dynamic mb-6">
          Paper Management
        </h1>

        <PaperStats papers={papers} />

        <div className="mt-6 bg-white rounded-lg p-6">
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-2">Papers</h2>
            <p className="text-primary">
              Manage Approved, Rejected, and Submitted
            </p>
          </div>

          <PaperManagement allPapers={papers} />
        </div>
      </div>
    </div>
  );
}
