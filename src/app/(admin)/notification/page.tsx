"use client";
import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { useSession } from "next-auth/react";
import {
  useApproveStudentMutation,
  useGetAllPendingStudentQuery,
} from "@/lib/api/paperAdminSlice";
import {
  Bell,
  Check,
  Trash2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";

type NotificationType = "success" | "info" | "warning" | "error";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  category: string;
  timestamp?: string;
  senderId: string;
  data?: PendingStudent;
  isLoading?: boolean;
}

interface PendingStudent {
  uuid: string;
  studentCardUrl: string;
  university: string;
  major: string;
  yearsOfStudy: number;
  isStudent: boolean;
  userUuid: string;
}

interface NotificationMessage {
  id?: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  isRead?: boolean;
}

export default function NotificationPage() {
  const { data: session } = useSession();
  const token: string = session?.accessToken || "";
  const currentUserId: string = session?.user?.id || "";
  const [currentPage, setCurrentPage] = useState(0);
  const searchParams = useSearchParams();
  const highlightId = searchParams?.get("highlight");

  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const notificationRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Fetch all pending students with refetch capability
  const {
    data: getPendingStudents,
    isLoading,
    refetch,
  } = useGetAllPendingStudentQuery({
    token,
    page: 0,
    size: 100,
  });

  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch individual student data by userUuid
  const fetchStudentData = async (
    userUuid: string
  ): Promise<PendingStudent | null> => {
    if (!token) return null;

    try {
      const res = await fetch(
        `https://api.docuhub.me/api/v1/paper-admin/pending-students?page=0&size=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        const student = data.content?.find(
          (s: PendingStudent) => s.userUuid === userUuid
        );
        return student || null;
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
    return null;
  };

  // Helper function to find student data by userUuid (senderId)
  const findStudentBySenderId = (
    senderId: string
  ): PendingStudent | undefined => {
    if (!getPendingStudents?.content) return undefined;
    return getPendingStudents.content.find(
      (student: PendingStudent) => student.userUuid === senderId
    );
  };

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string): string => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now.getTime() - notifTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  // Convert notification message to Notification with student data
  const convertToNotification = async (
    msg: NotificationMessage
  ): Promise<Notification> => {
    // First try to find in existing data
    let studentData = findStudentBySenderId(msg.senderId);

    // If not found, fetch fresh data
    if (!studentData) {
      studentData = (await fetchStudentData(msg.senderId)) || undefined;
    }

    return {
      id: msg.id || `notif-${Date.now()}-${msg.senderId}`,
      type: "info",
      title: "Student Verification Request",
      message: studentData
        ? `${studentData.university} - ${studentData.major} (Year ${studentData.yearsOfStudy})`
        : msg.message || "New student verification request",
      time: formatTimestamp(msg.createdAt),
      read: msg.isRead || false,
      category: "student-verification",
      timestamp: msg.createdAt,
      senderId: msg.senderId,
      data: studentData,
      isLoading: !studentData,
    };
  };

  // Update notification with fetched student data
  const updateNotificationWithStudentData = async (
    notificationId: string,
    senderId: string
  ) => {
    const studentData = await fetchStudentData(senderId);

    if (studentData) {
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.id === notificationId) {
            return {
              ...n,
              data: studentData,
              message: `${studentData.university} - ${studentData.major} (Year ${studentData.yearsOfStudy})`,
              isLoading: false,
            };
          }
          return n;
        })
      );
    }
  };

  // Connect WebSocket and subscribe to notification topics
  useEffect(() => {
    if (!currentUserId || !token) return;

    const socket = new SockJS("https://api.docuhub.me/ws-chat");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 3000,
      onConnect: () => {
        console.log("Connected to WebSocket for notifications");

        // Subscribe to user-specific topic
        const myTopic = `/topic/user.${currentUserId}`;
        subscriptionRef.current = stompClient.subscribe(
          myTopic,
          async (msg: IMessage) => {
            const payload: NotificationMessage = JSON.parse(msg.body);
            const newNotification = await convertToNotification(payload);
            console.log("newNotification :>> ", newNotification);

            setNotifications((prev) => {
              // Check for duplicates
              if (
                newNotification.id &&
                prev.some((n) => n.id === newNotification.id)
              ) {
                return prev;
              }
              return [newNotification, ...prev];
            });

            // If student data is still loading, try to fetch it
            if (newNotification.isLoading) {
              updateNotificationWithStudentData(
                newNotification.id,
                payload.senderId
              );
            }

            // Refetch pending students list to keep it updated
            refetch();
          }
        );

        // Subscribe to admin notifications topic
        const adminTopic = `/topic/admin-notifications`;
        stompClient.subscribe(adminTopic, async (msg: IMessage) => {
          const payload: NotificationMessage = JSON.parse(msg.body);
          const newNotification = await convertToNotification(payload);

          setNotifications((prev) => {
            // Check for duplicates
            if (
              newNotification.id &&
              prev.some((n) => n.id === newNotification.id)
            ) {
              return prev;
            }
            return [newNotification, ...prev];
          });

          // If student data is still loading, try to fetch it
          if (newNotification.isLoading) {
            updateNotificationWithStudentData(
              newNotification.id,
              payload.senderId
            );
          }

          // Refetch pending students list to keep it updated
          refetch();
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      subscriptionRef.current?.unsubscribe();
      stompClient.deactivate();
    };
  }, [currentUserId, token]);

  // Load pending students as initial notifications
  useEffect(() => {
    if (!getPendingStudents?.content) return;

    const studentNotifications: Notification[] = getPendingStudents.content.map(
      (student: PendingStudent) => ({
        id: student.uuid,
        type: "warning" as NotificationType,
        title: "Pending Student Verification",
        message: `${student.university} - ${student.major} (Year ${student.yearsOfStudy})`,
        time: "Pending",
        read: false,
        category: "student-verification",
        senderId: student.userUuid,
        data: student,
        isLoading: false,
      })
    );

    setNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const newNotifs = studentNotifications.filter(
        (n) => !existingIds.has(n.id)
      );
      return [...newNotifs, ...prev];
    });
  }, [getPendingStudents]);

  // Scroll to highlighted notification
  useEffect(() => {
    if (highlightId && notificationRefs.current[highlightId]) {
      setTimeout(() => {
        notificationRefs.current[highlightId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    }
  }, [highlightId, notifications]);

  const getTypeStyles = (type: NotificationType) => {
    const styles = {
      success: "bg-green-50 border-green-200 text-green-800",
      info: "bg-blue-50 border-blue-200 text-blue-800",
      warning: "bg-amber-50 border-amber-200 text-amber-800",
      error: "bg-red-50 border-red-200 text-red-800",
    };
    return styles[type] || styles.info;
  };

  const getTypeIcon = (type: NotificationType) => {
    const baseClass = "w-10 h-10 rounded-full flex items-center justify-center";
    const styles: Record<NotificationType, string> = {
      success: `${baseClass} bg-green-100`,
      info: `${baseClass} bg-blue-100`,
      warning: `${baseClass} bg-amber-100`,
      error: `${baseClass} bg-red-100`,
    };
    return styles[type] || styles.info;
  };

  const markAsRead = (senderUuid: string) => {
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      console.warn("STOMP client is not connected.");
      return;
    }
    if (!session?.user.id) {
      console.warn("No session user found.");
      return;
    }
    const payload = {
      senderUuid,
      receiverUuid: session.user.id,
    };

    console.log("payload :>> ", payload);

    stompClientRef.current.publish({
      destination: "/app/update-read",
      body: JSON.stringify(payload),
    });


    setNotifications((prev) =>
      prev.map((n) => (n.senderId === senderUuid ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const [approvedStudent] = useApproveStudentMutation();
  const handleVerifyStudent = async (userUuid: string) => {
    try {
      await approvedStudent({
        token: session?.accessToken || "",
        uuid: userUuid,
      });
      toast.success("Paper inserted successfully!", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
      refetch();
    } catch (error) {
      toast.error("Erro approved student!", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
      console.error("Error verifying student:", error);
    }
  };

  const filteredNotifications =
    filter === "all" ? notifications : notifications.filter((n) => !n.read);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Pagination logic
  const displayPageSize = 5;
  const totalPages = Math.ceil(filteredNotifications.length / displayPageSize);
  const startIndex = currentPage * displayPageSize;
  const endIndex = startIndex + displayPageSize;
  const paginatedNotifications = filteredNotifications.slice(
    startIndex,
    endIndex
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [filter]);

  return (
    <div className="min-h-screen bg-background-root p-4 md:p-8">
      <ToastContainer/>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="rounded-2xl border mb-6 p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-xl relative">
                <Bell className="w-6 h-6 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-dynamic2">
                  Notifications
                </h1>
                <p className="text-slate-500 text-sm">
                  {unreadCount} unread notification
                  {unreadCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-t border-slate-200 pt-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "unread"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Unread ({unreadCount})
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="ml-auto px-4 py-2 text-dynamic2 rounded-lg font-medium flex items-center gap-2 p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm"
              >
                <Check className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3 mb-6">
          {isLoading ? (
            <div className="rounded-2xl border p-12 text-center bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
              <p className="text-slate-500">Loading notifications...</p>
            </div>
          ) : paginatedNotifications.length === 0 ? (
            <div className="rounded-2xl border p-12 text-center bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
              <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-dynamic2 mb-2">
                No notifications
              </h3>
              <p className="text-slate-500">You&apos;re all caught up!</p>
            </div>
          ) : (
            paginatedNotifications.map((notification) => (
              <div
                key={notification.id}
                ref={(el) => {
                  notificationRefs.current[notification.id] = el;
                }}
                className={`rounded-xl border p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm ${
                  notification.read
                    ? "border-slate-200"
                    : "border-blue-200 bg-blue-50/30"
                } ${
                  highlightId === notification.id
                    ? "ring-4 ring-blue-400 ring-opacity-50"
                    : ""
                }`}
              >
                <div className="p-5">
                  <div className="flex gap-4">
                    <div className={getTypeIcon(notification.type)}>
                      <Bell className="w-5 h-5 text-slate-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="font-semibold text-dynamic2 flex items-center gap-2">
                          {notification.title}
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </h3>
                        <span className="text-xs text-dynamic2 whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>

                      {notification.isLoading ? (
                        <p className="text-dynamic2 text-sm mb-3 animate-pulse">
                          Loading student details...
                        </p>
                      ) : (
                        <p className="text-dynamic2 text-sm mb-3">
                          {notification.message}
                        </p>
                      )}

                      {/* Show student card image if available */}
                      {notification.data?.studentCardUrl && (
                        <div className="mb-3">
                          <Link
                            href={`/notification/${notification.data.userUuid}?from=${notification.id}`}
                          >
                            <Image
                              width={128}
                              height={80}
                              unoptimized
                              src={notification.data.studentCardUrl}
                              alt="Student Card"
                              className="w-32 h-20 object-cover rounded-lg border border-slate-200 hover:opacity-80 transition-opacity"
                            />
                          </Link>
                        </div>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        {!notification.read && (
                          <button
                            disabled={notification.read}  
                            onClick={() => markAsRead(notification.senderId)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Mark as read
                          </button>
                        )}
                        {notification.category === "student-verification" &&
                          notification.data &&
                          !notification.isLoading && (
                            <button
                              onClick={() =>
                                handleVerifyStudent(notification.data!.userUuid)
                              }
                              className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Verify Student
                            </button>
                          )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs text-slate-500 hover:text-red-600 font-medium flex items-center gap-1 ml-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredNotifications.length > 0 && totalPages > 1 && (
          <div className="rounded-2xl border p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredNotifications.length)} of{" "}
                {filteredNotifications.length} notifications
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === 0
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "bg-blue-500 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {page + 1}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages - 1}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === totalPages - 1
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
