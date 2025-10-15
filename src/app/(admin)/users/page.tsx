"use client";
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
  if (isLoading) return <div>Loading...</div>;

  console.log("users in firt fetch :>> ", users);
  console.log("admin :>> ", admin);
  console.log("active :>> ", active);
  // console.log("inactive :>> ", inactive);

  return (
    <div className="p-6 bg-background-root">
      <div>
        <h1 className="text-3xl font-semibold text-dynamic mb-6">
          User Management
        </h1>
        <UserStats allUsers={users} />

        <div className="mt-6 bg-white p-6 rounded-lg ">
          <div className="mb-2">
            <h2 className="text-3xl font-semibold text-primary mb-2">Users</h2>
            <p className="text-gray-600">
              Manage users, roles, and permissions
            </p>
          </div>
          <UserTable allUsers={users ?? []} />
        </div>
      </div>
    </div>
  );
}
