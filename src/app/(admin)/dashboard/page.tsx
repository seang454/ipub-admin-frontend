import { DashboardStats } from "@/components/dashboard/dashbaord-stats";
import { DashboardBarChart} from "@/components/dashboard/bar-chart";
import { PendingApprove } from "@/components/dashboard/pending-approve";
import { TopContributors } from "@/components/dashboard/top-contribute";
import { DashboardLineChart } from "@/components/dashboard/line-chart";
import { DashboardPieChart } from "@/components/dashboard/pie-chart";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div>
        <h1 className="text-3xl font-semibold text-primary mb-6">
          Dashboard Overview
        </h1>
        <DashboardStats />
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-1 gap-6 h-auto">
          <DashboardLineChart />
          <div className="grid grid-cols-2 gap-6 mt-6 lg:mt-0">
          <DashboardBarChart />          
          <DashboardPieChart />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopContributors />
          <PendingApprove />
        </div>
      </div>
    </div>
  );
}