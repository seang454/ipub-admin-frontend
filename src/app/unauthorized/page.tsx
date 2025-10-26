"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Home, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Access Denied
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            You don&apos;t have permission to access the admin dashboard.
            {session?.user?.email && (
              <span className="block mt-2 text-sm">
                Signed in as: <strong>{session.user.email}</strong>
              </span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-center text-muted-foreground">
            Only users with <strong>ADMIN</strong> role can access this area.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={handleGoHome} variant="default" className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
