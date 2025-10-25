"use client";
import DocuhubLoader from "@/components/loader/docuhub-loading";
import { UserStats } from "@/components/users/user-stats";
import { UserTable } from "@/components/users/user-table";
import { useGetAllUsersQuery } from "@/lib/api/userSlice";
import { DecodedToken } from "@/types/extr/extraType";
import { User } from "@/types/userType/userType";
import { jwtDecode } from "jwt-decode";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const [active, setActive] = useState<User[]>([]);
  const [inactive, setInactive] = useState<User[]>([]);
  const [admin, setAdmin] = useState<User[]>([]);

  const { data: session } = useSession();
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

  // Separate users once data is loaded
  useEffect(() => {
    if (users) {
      const admins = users.filter((u) => {
        return u.isAdmin === true;
      });
      const activeusre = users.filter((u) => {
        return u.isActive;
      });
      setAdmin(admins);
      setActive(activeusre);
      console.log("admins filtered :>> ", admins); // correct immediately
    }
  }, [users]);
  if (isLoading) return <DocuhubLoader />;

  console.log("users in firt fetch :>> ", users);
  console.log("admin :>> ", admin);
  console.log("active :>> ", active);
  // console.log("inactive :>> ", inactive);

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-background-root">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-dynamic mb-4 sm:mb-6">
          User Management
        </h1>
        <UserStats allUsers={users} />

        <div className="mt-4 sm:mt-6 bg-card p-4 sm:p-5 md:p-6 rounded-lg border border-border shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-card-foreground mb-2">
              Users
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage users, roles, and permissions
            </p>
          </div>
          <UserTable allUsers={users ?? []} />
        </div>
      </div>
    </div>
  );
}
