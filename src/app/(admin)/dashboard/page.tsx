/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { DashboardStats } from "@/components/dashboard/dashbaord-stats";
import { ChartBarLabelCustom } from "@/components/dashboard/bar-chart";
import { PendingApprove } from "@/components/dashboard/pending-approve";
import { TopContributors } from "@/components/dashboard/top-contribute";
import { PdashboardLineChart } from "@/components/dashboard/publication-chart";
import { DashboardPieChart } from "@/components/dashboard/pie-chart";
import { ChartAreaStackedExpand } from "@/components/dashboard/all-line";
import { MentorChartBarLabel } from "@/components/dashboard/mentor-bar";
import { useSession } from "next-auth/react";
import { useGetAllUsersQuery } from "@/lib/api/userSlice";
import { jwtDecode } from "jwt-decode"; // ✅ correct
import { useEffect, useState } from "react";
import { PapersResponse } from "@/types/paperType/paperType";
import { User } from "@/types/userType/userType";
import { useGetPaperQuery } from "@/lib/api/paperSlice";

type DecodedToken = {
  exp: number; // expiration timestamp (in seconds since epoch)
  iat?: number; // issued at (optional, depends on your JWT)
  [key: string]: any; // allow other JWT claims
};

export default function DashboardPage() {
  const [papers, setPapers] = useState<PapersResponse | undefined>(undefined);
  const [students, setStudents] = useState<User[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken as string | undefined;

  let isExpired = true;
  if (accessToken) {
    const { exp } = jwtDecode<DecodedToken>(accessToken);
    isExpired = Date.now() >= exp * 1000;
  }

  const { data: users, isLoading } = useGetAllUsersQuery(
    { token: accessToken ?? "" },
    { skip: !accessToken || isExpired }
  );

  const { data: p, isLoading: paperLoading } = useGetPaperQuery();

  useEffect(() => {
    if (!p) return;
    setPapers(p); // store the full PapersResponse object
  }, [p]);
  useEffect(() => {
    if (!users) return;
    setStudents(users.filter((u: User) => u.isStudent === true));
    setMentors(users.filter((u: User) => u.isAdvisor === true));
  }, [users]);

  if (status === "loading") return <p>Loading session...</p>;
  if (!accessToken || isExpired) return <p>No valid access token</p>;
  if (isLoading || paperLoading) return <p>Loading users...</p>;
  console.log("p :>> ", p);
  console.log("students updated:", students);
  console.log("mentors updated:", mentors);
  console.log("users :>> ", users);

  return (
    <div className="p-6">
      <div>
        <h1 className="text-3xl font-semibold text-primary mb-6">
          Dashboard Overview
        </h1>
        <DashboardStats
          papers={p}
          user={users}
          students={students}
          mentors={mentors}
        />
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-1 gap-6 h-auto">
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6 mt-6 lg:mt-0">
            <ChartBarLabelCustom users={users} />
            <DashboardPieChart papers={p} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6 mt-6 lg:mt-0">
            <MentorChartBarLabel students={students} />
            <PdashboardLineChart mentors={mentors} />
          </div>
          <ChartAreaStackedExpand
            papers={p}
            user={users}
            students={students}
            mentors={mentors}
          />
        </div>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopContributors />
          <PendingApprove />
        </div>
      </div>
    </div>
  );
}
