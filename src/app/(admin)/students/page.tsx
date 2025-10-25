"use client";
import DocuhubLoader from "@/components/loader/docuhub-loading";
import { StudentStats } from "@/components/students/student-stats";
import { StudentTable } from "@/components/students/student-table";
import { useGetStudentsQuery } from "@/lib/api/studentSlice";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Page() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken as string | undefined;
  const { data: studentsData, isLoading } = useGetStudentsQuery(
    { token: accessToken ?? "", page: 0, size: 30 },
    { skip: !accessToken }
  );
  console.log("studentsData :>> ", studentsData);
  if (!accessToken) {
    return <div>Loading...</div>; // or some other loading indicator
  }
  if (!accessToken) {
    redirect("/");
  }
  if (isLoading) {
    return <DocuhubLoader />;
  }
  return (
    <div className="p-3 sm:p-4 md:p-6 border-border shadow-sm hover:shadow-md transition-all duration-200 bg-background-root">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-dynamic mb-4 sm:mb-6">
          Student Management
        </h1>
        <StudentStats />
        <div className="mt-4 sm:mt-6 bg-card p-4 sm:p-5 md:p-6 rounded-lg border border-border shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-card-foreground mb-2">
              Students
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage users, roles, and permissions
            </p>
          </div>
          <StudentTable allStudents={studentsData?.content} />
        </div>
      </div>
    </div>
  );
}
