/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Users, FileText, UserCheck, BookCheck } from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useGetUserQuery } from "@/lib/api/userSlice";

export function DashboardStats() {
  const { data: session, status: sessionStatus } = useSession();

  console.log("session :>> ", session);
  // Pass token only when authenticated
  const getToken = session?.accessToken;
  console.log('token :>> ', getToken);
  const {
    data: user,
    isLoading,
    isFetching,
    error,
  } = useGetUserQuery({ page: 0, size: 5, token: getToken! }, { skip: !getToken });

  if (isLoading || isFetching) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error loading users</div>;

  console.log("user :>> ", user);

  const stats = [
    {
      title: "Total Users",
      value: user?.totalElements ?? 0, // ✅ backend total count
      icon: Users,
      iconColor: "text-blue-500",
    },
    {
      title: "Papers",
      value: 234, // TODO: replace with real papers API
      icon: FileText,
      iconColor: "text-gray-600",
    },
    {
      title: "Active Users",
      value: user?.content?.filter((u: any) => u.isUser)?.length ?? 0, // ✅ example: active count
      icon: UserCheck,
      iconColor: "text-green-500",
    },
    {
      title: "Publications",
      value: 24, // TODO: replace with real publications API
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
