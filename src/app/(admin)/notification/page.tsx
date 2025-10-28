"use client";
import React, { useEffect, useState, useRef } from "react";
import { IMessage, StompSubscription } from "@stomp/stompjs";
import { useSession } from "next-auth/react";
import {
  useApproveStudentMutation,
  useGetAllPendingStudentQuery,
  useRejectToStudentMutation,
} from "@/lib/api/paperAdminSlice";
import {
  Bell,
  Check,
  Trash2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  ArrowLeft,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { useWebSocket } from "@/components/contexts/websocket-context";

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
  createdAt?: string;
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
  const [showDebug, setShowDebug] = useState(false);

  // Use the global WebSocket connection
  const { subscribe, unsubscribe, publish, isConnected } = useWebSocket();

  const subscriptionRef = useRef<StompSubscription | null>(null);
  const adminSubscriptionRef = useRef<StompSubscription | null>(null);
  const notificationRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Request browser notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("📢 Browser notification permission:", permission);
      });
    }
  }, []);

  // Helper function to show browser notification
  const showBrowserNotification = (title: string, message: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const notification = new Notification(title, {
          body: message,
          icon: "/logo/SmallLogo.png", // Your app logo
          badge: "/logo/SmallLogo.png",
          tag: "student-verification", // Groups similar notifications
          requireInteraction: false,
          silent: false,
        });

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        // Click handler - focus the notification page
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error("❌ Failed to show browser notification:", error);
      }
    }
  };

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
  console.log("getPendingStudents", getPendingStudents);

  // Auto-refresh data every 30 seconds to ensure we have latest information
  useEffect(() => {
    if (!token) return;

    console.log(
      "🔄 Setting up auto-refresh: will refetch data every 30 seconds"
    );

    const refreshInterval = setInterval(() => {
      console.log("🔄 Auto-refresh: Fetching latest data...");
      refetch();
      setLastRefreshTime(new Date());
    }, 30000); // 30 seconds

    return () => {
      console.log("🧹 Cleaning up auto-refresh interval");
      clearInterval(refreshInterval);
    };
  }, [token, refetch]);

  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{
    userUuid: string;
    name?: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

  // Fetch individual student data by userUuid
  const fetchStudentData = async (
    userUuid: string
  ): Promise<PendingStudent | null> => {
    if (!token) return null;

    try {
      const res = await fetch(
        `https://api.docuhub.me/api/v1/admin/student/pending?page=0&size=100`,
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
    } catch {
      toast.error("Error fetching student data", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
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

  // Note: Removed convertToNotification and updateNotificationWithStudentData
  // Now using instant display approach - notification appears immediately with basic info,
  // then enriched with student data in the background

  // Subscribe to notification topics using the global WebSocket
  useEffect(() => {
    if (!currentUserId) {
      console.log("⏳ Notification: Waiting for user authentication...");
      return;
    }

    if (!isConnected) {
      console.log("⏳ Notification: WebSocket not connected. Waiting...");
      // Clear any existing subscriptions if connection is lost
      if (subscriptionRef.current) {
        subscriptionRef.current = null;
      }
      if (adminSubscriptionRef.current) {
        adminSubscriptionRef.current = null;
      }
      return;
    }

    console.log(
      "🔔 Notification: WebSocket connected! Starting subscriptions..."
    );
    console.log(`👤 Current User ID: ${currentUserId}`);

    // Handler for user-specific notifications - OPTIMIZED FOR INSTANT DISPLAY
    const handleUserNotification = async (msg: IMessage) => {
      try {
        console.log("📨 RAW message received on user topic:", msg);
        const payload: NotificationMessage = JSON.parse(msg.body);
        console.log("📩 Parsed user notification:", payload);

        // Show toast IMMEDIATELY with the actual message from sender
        toast.info(
          <div className="flex flex-col gap-1">
            <div className="font-semibold">🔔 New Notification!</div>
            <div className="text-sm">
              {payload.message || "New student verification request"}
            </div>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            theme: "colored",
            closeButton: true,
          }
        );

        // Show BROWSER NOTIFICATION (system-level alert) with sender's message
        showBrowserNotification(
          "🔔 New Notification Received",
          payload.message || "New student verification request"
        );

        // Create notification ID immediately
        const notificationId =
          payload.id || `notif-${Date.now()}-${payload.senderId}`;

        // STEP 1: Display notification IMMEDIATELY with basic info
        const quickNotification: Notification = {
          id: notificationId,
          type: "info",
          title: "Student Verification Request",
          message: payload.message || "New student verification request",
          time: formatTimestamp(payload.createdAt),
          read: payload.isRead || false,
          category: "student-verification",
          timestamp: payload.createdAt,
          senderId: payload.senderId,
          data: undefined,
          isLoading: true, // Mark as loading to show we're fetching details
        };

        console.log("⚡ INSTANTLY displaying notification:", quickNotification);

        // Add to state IMMEDIATELY (no await, no delay)
        setNotifications((prev) => {
          // Check for duplicates
          if (prev.some((n) => n.id === notificationId)) {
            console.log("⚠️ Duplicate notification, skipping:", notificationId);
            return prev;
          }
          // Add new notification at the beginning (latest first)
          const updated = [quickNotification, ...prev];
          // Sort by timestamp to ensure latest is always first
          return updated.sort((a, b) => {
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return timeB - timeA; // Descending order (newest first)
          });
        });

        // STEP 2: Fetch detailed student data in the background (async, no blocking)
        (async () => {
          try {
            // Try to find in existing data first (fast)
            let studentData = findStudentBySenderId(payload.senderId);

            // If not found, fetch from API (slower)
            if (!studentData) {
              studentData =
                (await fetchStudentData(payload.senderId)) || undefined;
            }

            // Update notification with detailed student data
            if (studentData) {
              console.log(
                "✅ Enriching notification with student data:",
                studentData
              );
              const enrichedData = studentData; // Type guard
              setNotifications((prev) =>
                prev.map((n) => {
                  if (n.id === notificationId) {
                    return {
                      ...n,
                      data: enrichedData,
                      message: `${enrichedData.university} - ${enrichedData.major} (Year ${enrichedData.yearsOfStudy})`,
                      isLoading: false,
                    };
                  }
                  return n;
                })
              );
            } else {
              // No student data found, just mark as not loading
              setNotifications((prev) =>
                prev.map((n) => {
                  if (n.id === notificationId) {
                    return { ...n, isLoading: false };
                  }
                  return n;
                })
              );
            }
          } catch (error) {
            console.error("❌ Error fetching student details:", error);
            // Mark as not loading even if fetch failed
            setNotifications((prev) =>
              prev.map((n) => {
                if (n.id === notificationId) {
                  return { ...n, isLoading: false };
                }
                return n;
              })
            );
          }
        })();

        // Refetch pending students list to keep it updated (async, non-blocking)
        refetch();
      } catch (error) {
        console.error("❌ Error processing user notification:", error);
        toast.error("Error processing notification", {
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
        });
      }
    };

    // Handler for admin notifications - OPTIMIZED FOR INSTANT DISPLAY
    const handleAdminNotification = async (msg: IMessage) => {
      try {
        console.log("📨 RAW message received on admin topic:", msg);
        const payload: NotificationMessage = JSON.parse(msg.body);
        console.log("📩 Parsed admin notification:", payload);

        // Show toast IMMEDIATELY with the actual message from sender
        toast.info(
          <div className="flex flex-col gap-1">
            <div className="font-semibold">🔔 Admin Notification!</div>
            <div className="text-sm">
              {payload.message || "New student verification request"}
            </div>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            theme: "colored",
            closeButton: true,
          }
        );

        // Show BROWSER NOTIFICATION (system-level alert) with sender's message
        showBrowserNotification(
          "🔔 Admin Notification Received",
          payload.message || "New student verification request"
        );

        // Create notification ID immediately
        const notificationId =
          payload.id || `notif-${Date.now()}-${payload.senderId}`;

        // STEP 1: Display notification IMMEDIATELY with basic info
        const quickNotification: Notification = {
          id: notificationId,
          type: "info",
          title: "Student Verification Request",
          message: payload.message || "New student verification request",
          time: formatTimestamp(payload.createdAt),
          read: payload.isRead || false,
          category: "student-verification",
          timestamp: payload.createdAt,
          senderId: payload.senderId,
          data: undefined,
          isLoading: true, // Mark as loading to show we're fetching details
        };

        console.log(
          "⚡ INSTANTLY displaying admin notification:",
          quickNotification
        );

        // Add to state IMMEDIATELY (no await, no delay)
        setNotifications((prev) => {
          // Check for duplicates
          if (prev.some((n) => n.id === notificationId)) {
            console.log("⚠️ Duplicate notification, skipping:", notificationId);
            return prev;
          }
          // Add new notification at the beginning (latest first)
          const updated = [quickNotification, ...prev];
          // Sort by timestamp to ensure latest is always first
          return updated.sort((a, b) => {
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return timeB - timeA; // Descending order (newest first)
          });
        });

        // STEP 2: Fetch detailed student data in the background (async, no blocking)
        (async () => {
          try {
            // Try to find in existing data first (fast)
            let studentData = findStudentBySenderId(payload.senderId);

            // If not found, fetch from API (slower)
            if (!studentData) {
              studentData =
                (await fetchStudentData(payload.senderId)) || undefined;
            }

            // Update notification with detailed student data
            if (studentData) {
              console.log(
                "✅ Enriching admin notification with student data:",
                studentData
              );
              const enrichedData = studentData; // Type guard
              setNotifications((prev) =>
                prev.map((n) => {
                  if (n.id === notificationId) {
                    return {
                      ...n,
                      data: enrichedData,
                      message: `${enrichedData.university} - ${enrichedData.major} (Year ${enrichedData.yearsOfStudy})`,
                      isLoading: false,
                    };
                  }
                  return n;
                })
              );
            } else {
              // No student data found, just mark as not loading
              setNotifications((prev) =>
                prev.map((n) => {
                  if (n.id === notificationId) {
                    return { ...n, isLoading: false };
                  }
                  return n;
                })
              );
            }
          } catch (error) {
            console.error("❌ Error fetching student details:", error);
            // Mark as not loading even if fetch failed
            setNotifications((prev) =>
              prev.map((n) => {
                if (n.id === notificationId) {
                  return { ...n, isLoading: false };
                }
                return n;
              })
            );
          }
        })();

        // Refetch pending students list to keep it updated (async, non-blocking)
        refetch();
      } catch (error) {
        console.error("❌ Error processing admin notification:", error);
        toast.error("Error processing admin notification", {
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
        });
      }
    };

    // Add a small delay to ensure WebSocket is fully ready
    const subscribeTimer = setTimeout(() => {
      // Subscribe to user-specific topic
      const myTopic = `/topic/user.${currentUserId}`;
      console.log(`🔌 Attempting to subscribe to: ${myTopic}`);
      const userSubscription = subscribe(myTopic, handleUserNotification);

      if (userSubscription) {
        console.log(`✅ Successfully subscribed to: ${myTopic}`);
        subscriptionRef.current = userSubscription;
      } else {
        console.error(`❌ Failed to subscribe to: ${myTopic}`);
        console.error(`   This could mean:`);
        console.error(`   1. WebSocket not fully connected`);
        console.error(`   2. Topic format is incorrect`);
        console.error(`   3. Authentication issue`);
      }

      // Subscribe to admin notifications topic
      const adminTopic = `/topic/admin-notifications`;
      console.log(`🔌 Attempting to subscribe to: ${adminTopic}`);
      const adminSubscription = subscribe(adminTopic, handleAdminNotification);

      if (adminSubscription) {
        console.log(`✅ Successfully subscribed to: ${adminTopic}`);
        adminSubscriptionRef.current = adminSubscription;
      } else {
        console.error(`❌ Failed to subscribe to: ${adminTopic}`);
      }

      // Log subscription summary
      console.log("📊 Subscription Summary:");
      console.log(
        `   User Topic (${myTopic}):`,
        userSubscription ? "✅ Active" : "❌ Failed"
      );
      console.log(
        `   Admin Topic (${adminTopic}):`,
        adminSubscription ? "✅ Active" : "❌ Failed"
      );
    }, 100); // Small delay to ensure connection is stable

    return () => {
      clearTimeout(subscribeTimer);
      console.log("🧹 Notification: Cleaning up subscriptions...");
      // Unsubscribe when component unmounts
      if (subscriptionRef.current) {
        console.log(`🔌 Unsubscribing from user topic`);
        unsubscribe(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      if (adminSubscriptionRef.current) {
        console.log(`🔌 Unsubscribing from admin topic`);
        unsubscribe(adminSubscriptionRef.current);
        adminSubscriptionRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, isConnected]);

  // Load pending students as initial notifications
  useEffect(() => {
    if (!getPendingStudents?.content) return;

    // Sort pending students by createdAt (newest first)
    const sortedPendingStudents = [...getPendingStudents.content].sort(
      (a: PendingStudent, b: PendingStudent) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // Descending order (newest first)
      }
    );

    console.log("Original pending students:", getPendingStudents.content);
    console.log(
      "Sorted pending students (by createdAt):",
      sortedPendingStudents
    );

    const studentNotifications: Notification[] = sortedPendingStudents.map(
      (student: PendingStudent) => ({
        id: student.uuid,
        type: "warning" as NotificationType,
        title: "Pending Student Verification",
        message: `${student.university} - ${student.major} (Year ${student.yearsOfStudy})`,
        time: student.createdAt
          ? formatTimestamp(student.createdAt)
          : "Pending",
        read: false,
        category: "student-verification",
        senderId: student.userUuid,
        data: student,
        isLoading: false,
        timestamp: student.createdAt || new Date(0).toISOString(),
      })
    );

    setNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const newNotifs = studentNotifications.filter(
        (n) => !existingIds.has(n.id)
      );
      // Merge and sort all notifications by timestamp (newest first)
      const merged = [...prev, ...newNotifs];
      return merged.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA; // Descending order (newest first)
      });
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
    if (!isConnected) {
      console.warn("WebSocket is not connected.");
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

    publish("/app/update-read", JSON.stringify(payload));

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
  const [rejectStudent, { isLoading: isRejecting }] =
    useRejectToStudentMutation();

  const handleVerifyStudent = async (userUuid: string) => {
    try {
      await approvedStudent({
        token: session?.accessToken || "",
        uuid: userUuid,
      });
      toast.success("Student verified successfully!", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
      refetch();

      // Remove notification from list
      setNotifications((prev) =>
        prev.filter((n) => n.data?.userUuid !== userUuid)
      );
    } catch {
      toast.error("Error approving student!", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  const handleOpenRejectModal = (userUuid: string, name?: string) => {
    setSelectedStudent({ userUuid, name });
    setRejectModalOpen(true);
    setRejectReason("");
  };

  const handleCloseRejectModal = () => {
    setRejectModalOpen(false);
    setSelectedStudent(null);
    setRejectReason("");
  };

  const handleRejectStudent = async () => {
    if (!selectedStudent || !rejectReason.trim()) {
      toast.warning("Please provide a reason for rejection", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
      return;
    }

    try {
      await rejectStudent({
        body: {
          userUuid: selectedStudent.userUuid,
          reason: rejectReason.trim(),
          status: "ADMIN_REJECTED",
        },
        token: session?.accessToken || "",
      }).unwrap();

      toast.success("Student verification rejected!", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });

      refetch();
      handleCloseRejectModal();

      // Remove notification from list
      setNotifications((prev) =>
        prev.filter((n) => n.data?.userUuid !== selectedStudent.userUuid)
      );
    } catch (error) {
      toast.error("Error rejecting student!", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
      console.error("Rejection error:", error);
    }
  };

  // Filter by read/unread status
  const statusFilteredNotifications =
    filter === "all" ? notifications : notifications.filter((n) => !n.read);

  // Filter by search query
  const filteredNotifications = statusFilteredNotifications.filter(
    (notification) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      const title = notification.title.toLowerCase();
      const message = notification.message.toLowerCase();
      const university = notification.data?.university?.toLowerCase() || "";
      const major = notification.data?.major?.toLowerCase() || "";

      return (
        title.includes(query) ||
        message.includes(query) ||
        university.includes(query) ||
        major.includes(query)
      );
    }
  );

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
  }, [filter, searchQuery]);

  return (
    <div className="min-h-screen bg-background-root p-4 md:p-8">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        {/* Back to Dashboard Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 text-dynamic2 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Dashboard</span>
        </Link>

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
            <div className="flex items-center gap-3">
              {/* WebSocket Connection Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
                />
                <span className="text-xs font-medium text-slate-600">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Toggle Debug Info"
              >
                <Settings className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Debug Panel */}
          {showDebug && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                🔍 Debug Information
              </h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600">
                    WebSocket Status:
                  </span>
                  <span
                    className={isConnected ? "text-green-600" : "text-red-600"}
                  >
                    {isConnected ? "✅ Connected" : "❌ Disconnected"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600">User ID:</span>
                  <span className="text-slate-800">
                    {currentUserId || "Not available"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600">
                    User Subscription:
                  </span>
                  <span className="text-slate-800">
                    {subscriptionRef.current
                      ? "✅ Active"
                      : "❌ Not subscribed"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600">
                    Admin Subscription:
                  </span>
                  <span className="text-slate-800">
                    {adminSubscriptionRef.current
                      ? "✅ Active"
                      : "❌ Not subscribed"}
                  </span>
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <span className="font-semibold text-slate-600">
                    Subscribed Topics:
                  </span>
                  <span className="text-slate-800 pl-2">
                    • /topic/user.{currentUserId}
                  </span>
                  <span className="text-slate-800 pl-2">
                    • /topic/admin-notifications
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-semibold text-slate-600">
                    Total Notifications:
                  </span>
                  <span className="text-slate-800">{notifications.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600">
                    Pending Students:
                  </span>
                  <span className="text-slate-800">
                    {getPendingStudents?.content?.length || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-semibold text-slate-600">
                    Auto-Refresh:
                  </span>
                  <span className="text-green-600 flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Active (every 30s)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600">
                    Last Refresh:
                  </span>
                  <span className="text-slate-800">
                    {lastRefreshTime.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-600">
                <p className="font-semibold mb-1">
                  📌 What to check on sender side:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Backend should publish to: /topic/user.{currentUserId}
                  </li>
                  <li>Or publish to: /topic/admin-notifications</li>
                  <li>
                    Sender must be connected to: wss://api.docuhub.me/ws-chat
                  </li>
                  <li>Check browser console for incoming messages</li>
                </ul>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  🧪 Test Connection:
                </p>
                <button
                  onClick={() => {
                    const testMessage = {
                      senderId: "test-sender",
                      receiverId: currentUserId,
                      message: "Test notification from debug panel",
                      createdAt: new Date().toISOString(),
                    };
                    console.log("🧪 Sending test message:", testMessage);
                    publish(
                      "/app/test-notification",
                      JSON.stringify(testMessage)
                    );
                    toast.info(
                      "Test message sent! Check console for details.",
                      {
                        position: "top-right",
                        autoClose: 2000,
                        theme: "colored",
                      }
                    );
                  }}
                  disabled={!isConnected}
                  className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  Send Test Message
                </button>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="border-t border-slate-200 pt-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notifications by title, university, or major..."
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-sm text-slate-600 mt-2">
                Found {filteredNotifications.length} result
                {filteredNotifications.length !== 1 ? "s" : ""} for &quot;
                {searchQuery}&quot;
              </p>
            )}
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
              {searchQuery ? (
                <>
                  <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-dynamic2 mb-2">
                    No results found
                  </h3>
                  <p className="text-slate-500">
                    Try adjusting your search terms or filters
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-dynamic2 mb-2">
                    No notifications
                  </h3>
                  <p className="text-slate-500">You&apos;re all caught up!</p>
                </>
              )}
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
                            <>
                              <button
                                onClick={() =>
                                  handleVerifyStudent(
                                    notification.data!.userUuid
                                  )
                                }
                                className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                Verify Student
                              </button>
                              <button
                                onClick={() =>
                                  handleOpenRejectModal(
                                    notification.data!.userUuid,
                                    `${notification.data!.university} student`
                                  )
                                }
                                className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                Reject
                              </button>
                            </>
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

        {/* Reject Student Modal */}
        {rejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4 backdrop-blur-sm">
            <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-border">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-dynamic2">
                      Reject Student Verification
                    </h2>
                    {selectedStudent?.name && (
                      <p className="text-sm text-muted-foreground">
                        {selectedStudent.name}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleCloseRejectModal}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  disabled={isRejecting}
                >
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 bg-card">
                <label
                  htmlFor="reject-reason"
                  className="block text-sm font-medium text-dynamic2 mb-2"
                >
                  Reason for Rejection{" "}
                  <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a detailed reason for rejecting this student's verification (e.g., incomplete profile information, invalid student card, etc.)"
                  rows={6}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent bg-background text-dynamic placeholder:text-muted-foreground resize-none transition-colors"
                  disabled={isRejecting}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  This reason will be sent to the student.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-accent/50 rounded-b-2xl">
                <button
                  onClick={handleCloseRejectModal}
                  className="px-4 py-2 text-dynamic2 hover:bg-accent rounded-lg font-medium transition-colors"
                  disabled={isRejecting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectStudent}
                  disabled={!rejectReason.trim() || isRejecting}
                  className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-800 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isRejecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Reject Student
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredNotifications.length > 0 && totalPages > 1 && (
          <div className="rounded-2xl border p-4 sm:p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Pagination Info */}
              <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredNotifications.length)} of{" "}
                {filteredNotifications.length}
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                {/* Previous Button */}
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0}
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                    currentPage === 0
                      ? "text-muted cursor-not-allowed"
                      : "text-dynamic2 hover:bg-accent"
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Page Numbers */}
                <div className="flex gap-0.5 sm:gap-1">
                  {(() => {
                    const maxVisiblePages = 5; // Show max 5 pages on mobile
                    const pages = [];

                    if (totalPages <= maxVisiblePages) {
                      // Show all pages if total is less than max
                      return Array.from(
                        { length: totalPages },
                        (_, i) => i
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`min-w-[32px] sm:min-w-[36px] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                            currentPage === page
                              ? "bg-blue-500 dark:bg-blue-600 text-white"
                              : "text-dynamic2 hover:bg-accent"
                          }`}
                        >
                          {page + 1}
                        </button>
                      ));
                    }

                    // Smart pagination: show first, last, current, and nearby pages
                    const showLeftEllipsis = currentPage > 2;
                    const showRightEllipsis = currentPage < totalPages - 3;

                    // Always show first page
                    pages.push(
                      <button
                        key={0}
                        onClick={() => handlePageChange(0)}
                        className={`min-w-[32px] sm:min-w-[36px] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                          currentPage === 0
                            ? "bg-blue-500 dark:bg-blue-600 text-white"
                            : "text-dynamic2 hover:bg-accent"
                        }`}
                      >
                        1
                      </button>
                    );

                    // Left ellipsis
                    if (showLeftEllipsis) {
                      pages.push(
                        <span
                          key="ellipsis-left"
                          className="px-1 sm:px-2 py-1 text-muted-foreground text-xs sm:text-sm"
                        >
                          ...
                        </span>
                      );
                    }

                    // Show current page and neighbors
                    const start = Math.max(1, currentPage - 1);
                    const end = Math.min(totalPages - 2, currentPage + 1);

                    for (let i = start; i <= end; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`min-w-[32px] sm:min-w-[36px] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                            currentPage === i
                              ? "bg-blue-500 dark:bg-blue-600 text-white"
                              : "text-dynamic2 hover:bg-accent"
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    }

                    // Right ellipsis
                    if (showRightEllipsis) {
                      pages.push(
                        <span
                          key="ellipsis-right"
                          className="px-1 sm:px-2 py-1 text-muted-foreground text-xs sm:text-sm"
                        >
                          ...
                        </span>
                      );
                    }

                    // Always show last page
                    if (totalPages > 1) {
                      pages.push(
                        <button
                          key={totalPages - 1}
                          onClick={() => handlePageChange(totalPages - 1)}
                          className={`min-w-[32px] sm:min-w-[36px] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                            currentPage === totalPages - 1
                              ? "bg-blue-500 dark:bg-blue-600 text-white"
                              : "text-dynamic2 hover:bg-accent"
                          }`}
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages - 1}
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                    currentPage === totalPages - 1
                      ? "text-muted cursor-not-allowed"
                      : "text-dynamic2 hover:bg-accent"
                  }`}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
