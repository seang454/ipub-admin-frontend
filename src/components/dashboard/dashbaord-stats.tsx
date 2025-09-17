/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Users, FileText, UserCheck, BookCheck } from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import {
  useGetAllMentorQuery,
  useGetAllStudentQuery,
  useGetUserQuery,
} from "@/lib/api/userSlice";
import { useGetPaperQuery } from "@/lib/api/paperSlice";
export function DashboardStats() {
  const { data: session, status: sessionStatus } = useSession();

  console.log("session :>> ", session);
  // Pass token only when authenticated
  const getToken = session?.accessToken;
  console.log("token :>> ", getToken);
  const {
    data: userData,
    error,
    isLoading,
    isFetching,
  } = useGetUserQuery(
    { page: 0, size: 5, token: getToken! },
    { skip: !getToken }
  );
  const {
    data: StudentData,
    error: studentError,
    isLoading: studentLoading,
    isFetching: studentFetching,
  } = useGetAllMentorQuery(
    { page: 0, size: 3, token: getToken! },
    { skip: !getToken }
  );
  const {
    data: MentorData,
    error: mentorError,
    isLoading: mentorLoading,
    isFetching: mentorFetching,
  } = useGetAllStudentQuery(
    { page: 0, size: 3, token: getToken! },
    { skip: !getToken }
  );

  const { data: paperData, isLoading: isPaperLoading } = useGetPaperQuery();

  if (
    isLoading ||
    isFetching ||
    isPaperLoading ||
    studentLoading ||
    mentorLoading
  )
    return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error loading users</div>;

  console.log("paperData :>> ", paperData);
  console.log("user from token :>> ", userData);
  console.log('student :>> ', StudentData);
  console.log('mentor :>> ', MentorData);

  const stats = [
    {
      title: "Total Users",
      value: userData?.totalElements ?? 0, // ✅ backend total count
      icon: Users,
      iconColor: "text-blue-500",
    },
    {
      title: "Total Papers",
      value: paperData?.papers.numberOfElements ?? 0, // ✅ backend total count
      icon: FileText,
      iconColor: "text-gray-600",
    },
    {
      title: "Total Students",
      value: StudentData?.totalElements ?? 0, // ✅ example: active count
      icon: UserCheck,
      iconColor: "text-green-500",
    },
    {
      title: "Total Mentors",
      value: MentorData?.totalElements ?? 0, // ✅ example: active count
      icon: BookCheck,
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-4 bg-white border-none shadow-none">
          <div className="flex justify-between">
            <div>
              <p className="text-md mb-2 font-medium text-primary">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
            </div>
            <stat.icon className={cn("w-4 h-4", stat.iconColor)} />
          </div>
        </Card>
      ))}
    </div>
  );
}
