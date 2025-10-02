import { StudentStats } from "@/components/students/student-stats";
import { StudentTable } from "@/components/students/student-table";

export default function Page() {
  return (
    <div className="p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
      <div>
        <h1 className="text-3xl font-semibold py-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
          Student Management
        </h1>
        <StudentStats />
        <div className="mt-6 bg-white p-6 rounded-lg">
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-2">
              Students
            </h2>
            <p className="text-gray-600">
              Manage users, roles, and permissions
            </p>
          </div>
        </div>
      </div>
      <StudentTable />
    </div>
  );
}
