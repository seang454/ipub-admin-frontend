/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import {
  AlertCircle,
  Badge,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  FileText,
  MoreHorizontal,
  User,
} from "lucide-react"
import { Button } from "../ui/button"
import { useState } from "react"

export function PendingApprove() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 2

  const allPendingItems = [
    {
      id: 1,
      type: "User Registration",
      title: "John Smith - Software Developer",
      description: "New user registration pending approval for the development team",
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
      description: "AI in Healthcare - Dr. Maria Santos needs peer review approval",
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
      description: "Request for production database access for deployment pipeline",
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
      description: "Travel expenses for annual tech conference in San Francisco",
      time: "12 hours ago",
      priority: "low",
      icon: User,
      status: "pending",
      assignedTo: "Finance Team",
    },
  ]

  const totalPages = Math.ceil(allPendingItems.length / itemsPerPage)
  const paginatedItems = allPendingItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePageChange = (page: any) => {
    setCurrentPage(page)
  }

  const getPriorityStyle = (priority: any) => {
    switch (priority) {
      case "high":
        return {
          bg: "bg-destructive/10",
          text: "text-destructive",
          border: "border-destructive/20",
          icon: "text-destructive",
        }
      case "medium":
        return {
          bg: "bg-primary/10",
          text: "text-primary",
          border: "border-primary/20",
          icon: "text-primary",
        }
      case "low":
        return {
          bg: "bg-muted",
          text: "text-muted-foreground",
          border: "border-border",
          icon: "text-muted-foreground",
        }
      default:
        return {
          bg: "bg-muted",
          text: "text-muted-foreground",
          border: "border-border",
          icon: "text-muted-foreground",
        }
    }
  }

  return (
    <div className="relative overflow-hidden bg-card rounded-2xl p-6 shadow-lg border border-border">
      <div className="absolute inset-0 bg-gradient-to-br from-background/5 to-transparent pointer-events-none" />
      <div className="relative">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-destructive/10 rounded-xl shadow-md border border-destructive/20">
              <Clock className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Pending Approvals</h3>
              <p className="text-sm text-muted-foreground mt-1">Items requiring your immediate attention</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {paginatedItems.map((item) => {
            const IconComponent = item.icon
            const priorityStyle = getPriorityStyle(item.priority)

            return (
              <div
                key={item.id}
                className="group relative bg-card/50 hover:bg-accent/50 rounded-xl p-5 border border-border hover:border-primary transition-all duration-300 hover:shadow-md hover:-translate-y-1 backdrop-blur-sm"
              >
                {item.priority === "high" && (
                  <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground px-3 py-1 text-xs font-bold transform rotate-12 -translate-y-1/2 translate-x-1/2 rounded-sm shadow-sm">
                    URGENT
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 rounded-xl ${priorityStyle.bg} ${priorityStyle.border}`}>
                      <IconComponent className={`h-5 w-5 ${priorityStyle.icon}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
                            {item.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                        </div>
                        <Badge
                          fontVariant="outline"
                          className={`text-xs font-semibold ${priorityStyle.text} ${priorityStyle.bg} ${priorityStyle.border} ml-2 whitespace-nowrap`}
                        >
                          {item.priority.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge fontVariant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                            {item.type}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{item.time}</span>
                          </div>
                          <Badge fontVariant="outline" className="text-xs text-muted-foreground border-border">
                            {item.assignedTo}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-4 min-w-fit">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-border hover:bg-accent hover:text-accent-foreground bg-transparent"
                      >
                        <span className="sr-only">View</span>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </Button>
                      <Button size="sm" className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                        Approve
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-primary/60 animate-pulse shadow-sm"></div>
              </div>
            )
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-5 border-t border-border">
            <div className="flex items-center gap-2 w-full justify-between m-auto ">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="border-border hover:bg-accent hover:text-accent-foreground h-8 px-3"
              >
                <ChevronsLeft className="h-4 w-4 mr-1" />
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-border hover:bg-accent hover:text-accent-foreground h-8 px-3"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-3">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-border hover:bg-accent hover:text-accent-foreground h-8 px-3"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="border-border hover:bg-accent hover:text-accent-foreground h-8 px-3"
              >
                Last
                <ChevronsRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
