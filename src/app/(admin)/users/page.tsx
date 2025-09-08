
import { UserStats } from "@/components/users/user-stats";
import { UserTable } from "@/components/users/user-table";

export default function UsersPage() {
  return (
    <div className="p-6">
      <div>
        <h1 className="text-3xl font-semibold text-primary mb-6">User Management</h1>
        <UserStats />

        <div className="mt-6 bg-white p-6 rounded-lg">
          <div className="mb-2">
            <h2 className="text-3xl font-semibold text-primary mb-2">Users</h2>
            <p className="text-gray-600">Manage users, roles, and permissions</p>
          </div>
          <UserTable />
        </div>
      </div>
    </div>
  )
}
