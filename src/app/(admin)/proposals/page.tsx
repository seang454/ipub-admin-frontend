import { EnhancedProposals } from "@/components/proposals/proposal-table";
import React from "react";

export default function page() {
  return (
    <div className="p-3 sm:p-4 md:p-6 bg-background-root">
      <div>
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-dynamic mb-2">
            Proposals Management
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage all proposal statements
          </p>
        </div>
        <EnhancedProposals />
      </div>
    </div>
  );
}
