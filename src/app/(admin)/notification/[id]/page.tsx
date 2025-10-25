"use client";
import { useGetAStudentByUuidQuery } from "@/lib/api/paperAdminSlice";
import { useGetAUserByUuidQuery } from "@/lib/api/userSlice";
import { useSession } from "next-auth/react";
import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  BookOpen,
  Clock,
  Send,
  User,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useParams } from "next/navigation";

export default function StudentDetailPage() {
  const { data: session } = useSession();
  const token = session?.accessToken || " ";
  const searchParams = useSearchParams();
  const params = useParams();
  const uuid = params?.id as string;
  const fromNotificationId = searchParams?.get("from");

  const { data: getAUser, isLoading: userLoading } = useGetAUserByUuidQuery({
    token,
    uuid,
  });
  const { data: getAStudentDetail, isLoading: studentLoading } =
    useGetAStudentByUuidQuery({ token, uuid });

  if (userLoading || studentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading student details...</p>
        </div>
      </div>
    );
  }

  const user = getAUser;
  const student = getAStudentDetail;

  // Construct back URL with highlight parameter
  const backUrl = fromNotificationId
    ? `/notification?highlight=${fromNotificationId}`
    : "/notification";

  return (
    <div className="min-h-screen bg-background-root px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back to Dashboard Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 text-dynamic2 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Dashboard</span>
        </Link>

        {/* Header Card */}
        <div className=" rounded-2xl shadow-xl overflow-hidden mb-6 bg-card border-border hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
          <div className="h-32 bg-secondary"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6">
              <Image
                unoptimized
                width={100}
                height={100}
                src={user?.imageUrl || "/placeholder-avatar.png"}
                alt={user?.fullName || " "}
                className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover"
              />
              <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                <h1 className="text-3xl font-bold text-dynamic2 mb-2">
                  {user?.fullName}
                </h1>
                <p className="text-lg text-dynamic2 mb-3">
                  {user?.bio || "No bio available"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {user?.isStudent && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      Student
                    </span>
                  )}
                  {user?.isAdmin && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      Admin
                    </span>
                  )}
                  {user?.isAdvisor && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Advisor
                    </span>
                  )}
                  {user?.isActive && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                      Active
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <Link
                  className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
                  href={backUrl}
                >
                  PromoteStudent
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl shadow-lg p-6  bg-card border-border hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-dynamic2 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-dynamic2 " />
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-dynamic2 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-dynamic2">Email</p>
                    <p className="text-dynamic2 font-medium">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-dynamic2">Phone Number</p>
                    <p className="text-dynamic2 font-medium">
                      {user?.contactNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Send className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-dynamic2">Telegram</p>
                    <p className="text-dynamic2 font-medium">
                      {user?.telegramId}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-dynamic2">Address</p>
                    <p className="text-dynamic2 font-medium">{user?.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className=" rounded-2xl shadow-lg p-6 bg-card border-border hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-dynamic2 mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                Academic Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <BookOpen className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-dynamic2">University</p>
                    <p className="text-dynamic2 font-medium">
                      {student?.university}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <GraduationCap className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-dynamic2">Major</p>
                    <p className="text-dynamic2 font-medium">
                      {student?.major}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-dynamic2">Years of Study</p>
                    <p className="text-dynamic2 font-medium">
                      {student?.yearsOfStudy}{" "}
                      {student?.yearsOfStudy === 1 ? "year" : "years"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Sidebar */}
          <div className="space-y-6">
            <div className=" rounded-2xl shadow-lg p-6 bg-card border-border hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-dynamic2 mb-4">
                Account Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-dynamic2">Username</p>
                  <p className="text-dynamic2 font-medium">@{user?.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-dynamic2">Gender</p>
                  <p className="text-dynamic2 font-medium capitalize">
                    {user?.gender?.toLowerCase()}
                  </p>
                </div>
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-dynamic2">Member Since</p>
                    <p className="text-dynamic2 font-medium">
                      {user?.createDate
                        ? new Date(user.createDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "Not available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-dynamic2">Last Updated</p>
                    <p className="text-dynamic2 font-medium">
                      {user?.updateDate
                        ? new Date(user.updateDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-secondary rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Student Status</span>
                  <span className="font-bold">
                    {user?.isStudent ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Account Status</span>
                  <span className="font-bold">
                    {user?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Year Level</span>
                  <span className="font-bold">
                    Year {student?.yearsOfStudy}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div></div>
        </div>
        <div>
          {/* Student Card */}
          {student?.studentCardUrl && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <h2 className="text-xl font-bold text-dynamic2 mb-4">
                Student Card
              </h2>
              <Image
                unoptimized
                width={100}
                height={100}
                src={student.studentCardUrl}
                alt="Student Card"
                className="w-full rounded-lg shadow-md"
              />
            </div>
          )}
        </div>
      </div>
      <div></div>
    </div>
  );
}
