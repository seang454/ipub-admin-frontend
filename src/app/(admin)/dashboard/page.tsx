"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { jwtDecode } from "jwt-decode";

import { DashboardStats } from "@/components/dashboard/dashbaord-stats";
import { ChartBarLabelCustom } from "@/components/dashboard/bar-chart";
import { PendingApprove } from "@/components/dashboard/pending-approve";
import { TopContributors } from "@/components/dashboard/top-contribute";
import { PdashboardLineChart } from "@/components/dashboard/publication-chart";
import { DashboardPieChart } from "@/components/dashboard/pie-chart";
import { ChartAreaStackedExpand } from "@/components/dashboard/all-line";
import { MentorChartBarLabel } from "@/components/dashboard/mentor-bar";

import { useGetAllUsersQuery } from "@/lib/api/userSlice";
import { useGetPaperQuery } from "@/lib/api/paperSlice";
import { PapersResponse } from "@/types/paperType/paperType";
import { User } from "@/types/userType/userType";
import DocuhubLoader from "@/components/loader/docuhub-loading";

type DecodedToken = {
  exp: number; // expiration timestamp
  iat?: number;
  [key: string]: unknown; // Replace any with unknown
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken as string | undefined;

  // Token expiration check
  let isExpired = true;
  if (accessToken) {
    const decoded = jwtDecode<DecodedToken>(accessToken) || {};
    isExpired = !decoded.exp || Date.now() >= decoded.exp * 1000;
  }

  // Fetch users
  const { data: users, isLoading: usersLoading } = useGetAllUsersQuery(
    { token: accessToken ?? "" },
    { skip: !accessToken || isExpired }
  );

  // Fetch papers
  const { data: papersData, isLoading: papersLoading } = useGetPaperQuery({
    token: accessToken ?? " ",
  });

  // Local state
  const [students, setStudents] = useState<User[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [papers, setPapers] = useState<PapersResponse | undefined>(undefined);

  // Update students and mentors when users change
  useEffect(() => {
    if (!users) return;
    setStudents(users.filter((u) => u.isStudent));
    setMentors(users.filter((u) => u.isAdvisor));
  }, [users]);

  // Update papers when data changes
  useEffect(() => {
    if (!papersData) return;
    setPapers(papersData);
  }, [papersData]);

  // Loading & invalid token states
  if (status === "loading") return <p>Loading session...</p>;
  if (!accessToken || isExpired) return <p>No valid access token</p>;
  if (usersLoading || papersLoading) return <DocuhubLoader />;

  // Debugging logs
  console.log("accessToken:", accessToken);
  console.log("isExpired:", isExpired);
  console.log("users:", users);
  console.log("students:", students);
  console.log("mentors:", mentors);
  console.log("papers:", papers);

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-background-root">
      {/* Title - Responsive font sizes */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary mb-4 sm:mb-6">
        Dashboard Overview
      </h1>

      {/* Stats Cards - Already responsive */}
      <DashboardStats
        papers={papers ?? undefined}
        user={users ?? []}
        students={students}
        mentors={mentors}
      />

      {/* Charts Grid - Responsive layout */}
      <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
        {/* Row 1: Bar Chart & Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ChartBarLabelCustom users={users ?? []} />
          <DashboardPieChart papers={papers ?? undefined} />
        </div>

        {/* Row 2: Mentor Bar & Publication Line Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <MentorChartBarLabel students={students} />
          <PdashboardLineChart mentors={mentors} />
        </div>

        {/* Row 3: Full-width Stacked Area Chart */}
        <ChartAreaStackedExpand
          papers={papers ?? undefined}
          user={users ?? []}
          students={students}
          mentors={mentors}
        />
      </div>

      {/* Bottom Section - Top Contributors & Pending Approvals */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <TopContributors />
        <PendingApprove />
      </div>
    </div>
  );
}
