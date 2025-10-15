"use client";
import { StudentStats } from "@/components/students/student-stats";
import { StudentTable } from "@/components/students/student-table";
import { useGetStudentsQuery } from "@/lib/api/studentSlice";
import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken as string | undefined;
  const { data: studentsData } = useGetStudentsQuery(
    { token: accessToken ?? "" },
    { skip: !accessToken }
  );
  console.log("studentsData :>> ", studentsData);
  if (!accessToken) {
    return <div>Loading...</div>; // or some other loading indicator
  }
  return (
    <div className="p-6 border-border shadow-sm hover:shadow-md transition-all duration-200 bg-background-root">
      <div>
        <h1 className="text-3xl font-semibold py-6 ">Student Management</h1>
        <StudentStats />
        <div className="mt-6 bg-white p-6 rounded-lg">
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-2">
              Students
            </h2>
            <p className="text-gray-600">
              Manage users, roles, and permissions
            </p>
            <StudentTable allStudents={studentsData?.content} />
          </div>
        </div>
      </div>{" "}
    </div>
  );
}
