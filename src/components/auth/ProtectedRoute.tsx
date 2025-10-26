"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DocuhubLoader from "@/components/loader/docuhub-loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user" | "adviser" | "student";
  fallbackUrl?: string;
}

/**
 * ProtectedRoute component
 * Wraps pages that require authentication and specific roles
 * Redirects to login or unauthorized page if user doesn't meet requirements
 */
export function ProtectedRoute({
  children,
  requiredRole = "admin",
  fallbackUrl = "/unauthorized",
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    // If not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Check if user has required role
    if (session?.user?.roles) {
      const userRoles = session.user.roles.map((role: string) =>
        role.toLowerCase()
      );

      const hasRequiredRole =
        userRoles.includes(requiredRole.toLowerCase()) ||
        userRoles.includes("admin") || // Admins have access to everything
        userRoles.includes("administrator");

      if (hasRequiredRole) {
        setIsAuthorized(true);
      } else {
        router.push(fallbackUrl);
      }
    } else {
      router.push(fallbackUrl);
    }
  }, [session, status, router, requiredRole, fallbackUrl]);

  // Show loading while checking authentication
  if (status === "loading" || !isAuthorized) {
    return <DocuhubLoader />;
  }

  return <>{children}</>;
}

/**
 * Hook to check if user has specific role
 * Useful for conditional rendering within components
 */
export function useHasRole(role: string): boolean {
  const { data: session } = useSession();

  if (!session?.user?.roles) return false;

  const userRoles = session.user.roles.map((r: string) => r.toLowerCase());
  return (
    userRoles.includes(role.toLowerCase()) ||
    userRoles.includes("admin") ||
    userRoles.includes("administrator")
  );
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin(): boolean {
  return useHasRole("admin");
}
