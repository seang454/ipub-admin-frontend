import { EnhancedProposals } from "@/components/proposals/proposal-table";
import React from "react";

export default function page() {
  return (
    <div className="p-6 bg-background-root">
      <div>
        <div className="mb-6">
          <h2 className="text-3xl font-semibold text-dynamic py-6">
            Proposals Management
          </h2>
          <p className="text-muted-foreground">Manage all proposal statments</p>
        </div>
        <EnhancedProposals />
      </div>
    </div>
  );
}
