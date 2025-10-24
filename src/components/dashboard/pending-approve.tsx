"use client";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  FileText,
  Eye,
  CheckCircle2,
  User,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useState } from "react";

export function PendingApprove() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  const allPendingItems = [
    {
      id: 1,
      type: "User Registration",
      title: "John Smith - Software Developer",
      description:
        "New user registration pending approval for the development team",
      time: "2 hours ago",
      priority: "high",
      icon: User,
      status: "pending",
      assignedTo: "Dev Team",
    },
    {
      id: 2,
      type: "Document Review",
      title: "Research Paper Submission",
      description:
        "AI in Healthcare - Dr. Maria Santos needs peer review approval",
      time: "4 hours ago",
      priority: "medium",
      icon: FileText,
      status: "pending",
      assignedTo: "Research Dept",
    },
    {
      id: 3,
      type: "Access Request",
      title: "Database Access - Development Team",
      description:
        "Request for production database access for deployment pipeline",
      time: "6 hours ago",
      priority: "high",
      icon: AlertCircle,
      status: "pending",
      assignedTo: "Security Team",
    },
    {
      id: 4,
      type: "Contract Review",
      title: "Vendor Agreement - Cloud Services",
      description: "New cloud service provider contract requires legal review",
      time: "8 hours ago",
      priority: "medium",
      icon: FileText,
      status: "pending",
      assignedTo: "Legal Team",
    },
    {
      id: 5,
      type: "Expense Approval",
      title: "Conference Travel - Marketing Team",
      description:
        "Travel expenses for annual tech conference in San Francisco",
      time: "12 hours ago",
      priority: "low",
      icon: User,
      status: "pending",
      assignedTo: "Finance Team",
    },
  ];

  const totalPages = Math.ceil(allPendingItems.length / itemsPerPage);
  const paginatedItems = allPendingItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          badge: "bg-destructive/10 text-destructive border-destructive/20",
          icon: "bg-destructive/10 text-destructive border-destructive/20",
          indicator: "bg-destructive",
        };
      case "medium":
        return {
          badge: "bg-primary/10 text-primary border-primary/20",
          icon: "bg-primary/10 text-primary border-primary/20",
          indicator: "bg-primary",
        };
      case "low":
        return {
          badge: "bg-muted text-muted-foreground border-border",
          icon: "bg-muted text-muted-foreground border-border",
          indicator: "bg-muted-foreground",
        };
      default:
        return {
          badge: "bg-muted text-muted-foreground border-border",
          icon: "bg-muted text-muted-foreground border-border",
          indicator: "bg-muted-foreground",
        };
    }
  };

  return (
    <div className="relative overflow-hidden bg-card rounded-xl border-2 border-border shadow-sm">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-destructive/10 border-2 border-destructive/20">
            <Clock className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">
              Pending Approvals
            </h3>
            <p className="text-sm text-muted-foreground">
              Items requiring your immediate attention
            </p>
          </div>
        </div>

        {/* Pending Items List */}
        <div className="space-y-3 mb-6">
          {paginatedItems.map((item) => {
            const IconComponent = item.icon;
            const priorityConfig = getPriorityConfig(item.priority);

            return (
              <div
                key={item.id}
                className="group relative bg-muted/30 hover:bg-muted/50 rounded-lg p-4 border-2 border-border transition-all duration-200"
              >
                {/* Priority Indicator */}
                <div
                  className={`absolute top-0 left-0 w-1 h-full rounded-l-lg ${priorityConfig.indicator}`}
                />

                <div className="flex items-start gap-4 pl-3">
                  {/* Icon */}
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-lg border-2 flex-shrink-0 ${priorityConfig.icon}`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground line-clamp-1 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium whitespace-nowrap ${priorityConfig.badge} border`}
                      >
                        {item.priority.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center flex-wrap gap-2 text-xs">
                      <Badge
                        variant="outline"
                        className="bg-background border-border"
                      >
                        {item.type}
                      </Badge>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{item.time}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-background border-border"
                      >
                        {item.assignedTo}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="h-8 px-3"
                      title="Approve"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="h-8"
            >
              <ChevronsLeft className="h-4 w-4 mr-1" />
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8"
            >
              Last
              <ChevronsRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
