/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Star, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useState } from "react"

export function TopContributors() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3

  const allContributors = [
    {
      name: "Sarah Johnson",
      actions: 48,
      avatar: "/placeholder.svg?height=40&width=40",
      trend: "+12%",
      role: "Senior Developer",
    },
    {
      name: "Michael Chen",
      actions: 28,
      avatar: "/placeholder.svg?height=40&width=40",
      trend: "+8%",
      role: "UI/UX Designer",
    },
    {
      name: "Emily Davis",
      actions: 22,
      avatar: "/placeholder.svg?height=40&width=40",
      trend: "+5%",
      role: "Product Manager",
    },
    {
      name: "James Wilson",
      actions: 17,
      avatar: "/placeholder.svg?height=40&width=40",
      trend: "+3%",
      role: "QA Engineer",
    },
    {
      name: "Lisa Rodriguez",
      actions: 35,
      avatar: "/placeholder.svg?height=40&width=40",
      trend: "+9%",
      role: "DevOps Engineer",
    },
    {
      name: "David Kim",
      actions: 29,
      avatar: "/placeholder.svg?height=40&width=40",
      trend: "+6%",
      role: "Frontend Developer",
    },
    {
      name: "Anna Petrov",
      actions: 24,
      avatar: "/placeholder.svg?height=40&width=40",
      trend: "+4%",
      role: "Backend Developer",
    },
    {
      name: "Robert Taylor",
      actions: 19,
      avatar: "/placeholder.svg?height=40&width=40",
      trend: "+2%",
      role: "Data Analyst",
    },
  ]

  const totalPages = Math.ceil(allContributors.length / itemsPerPage)
  const paginatedContributors = allContributors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePageChange = (page: any) => {
    setCurrentPage(page)
  }

  const getRankStyle = (index: any) => {
    switch (index) {
      case 0:
        return { bg: "bg-yellow-500", text: "text-white", ring: "ring-2 ring-yellow-500/30" }
      case 1:
        return { bg: "bg-muted-foreground", text: "text-white", ring: "ring-2 ring-muted-foreground/30" }
      case 2:
        return { bg: "bg-orange-600", text: "text-white", ring: "ring-2 ring-orange-600/30" }
      default:
        return { bg: "bg-muted", text: "text-muted-foreground", ring: "ring-2 ring-border" }
    }
  }

  return (
    <div className="relative overflow-hidden bg-card rounded-2xl p-6 shadow-lg border border-border">
      <div className="absolute inset-0 bg-gradient-to-br from-background/5 to-transparent pointer-events-none" />
      <div className="relative">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary rounded-xl shadow-md">
              <Star className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Top Contributors</h3>
              <p className="text-sm text-muted-foreground mt-1">Most active users this month</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {paginatedContributors.map((contributor, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index
            const rankStyle = getRankStyle(index)

            return (
              <div
                key={contributor.name}
                className="group relative bg-card/50 hover:bg-accent/50 rounded-xl p-4 border border-border hover:border-primary transition-all duration-300 hover:shadow-md hover:-translate-y-1 backdrop-blur-sm"
              >
                <div
                  className={`absolute -top-2 -left-2 ${rankStyle.bg} ${rankStyle.text} px-3 py-1 rounded-lg font-bold text-sm shadow-md z-10`}
                >
                  #{actualIndex + 1}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="relative">
                      <Avatar
                        className={`h-14 w-14 ${rankStyle.ring} group-hover:ring-primary/40 transition-all duration-300`}
                      >
                        <AvatarImage src={contributor.avatar || "/placeholder.svg"} alt={contributor.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {contributor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {actualIndex === 0 && (
                        <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white rounded-full p-1.5 shadow-md">
                          <Star className="h-4 w-4" fill="currentColor" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                          {contributor.name}
                        </span>
                        <Badge variant="outline" className="text-xs bg-secondary text-secondary-foreground ml-2">
                          {contributor.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          {contributor.actions} actions
                        </Badge>
                        <div className="flex items-center gap-1 text-chart-4">
                          <TrendingUp className="h-3 w-3" />
                          <span>{contributor.trend}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <div className="text-3xl font-bold text-primary">{contributor.actions}</div>
                    <div className="text-xs text-muted-foreground mt-1">this month</div>
                  </div>
                </div>

                <div className="mt-4 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min((contributor.actions / Math.max(...allContributors.map((c) => c.actions))) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2 w-full justify-between m-auto">
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
        )}
      </div>
    </div>
  )
}
