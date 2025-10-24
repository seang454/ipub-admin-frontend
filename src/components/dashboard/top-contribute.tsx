"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trophy,
  Medal,
  Award,
} from "lucide-react";
import { useState } from "react";

export function TopContributors() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

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
  ];

  const totalPages = Math.ceil(allContributors.length / itemsPerPage);
  const paginatedContributors = allContributors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getRankBadge = (index: number) => {
    const actualIndex = (currentPage - 1) * itemsPerPage + index;
    switch (actualIndex) {
      case 0:
        return {
          icon: Trophy,
          bg: "bg-accent/20",
          text: "text-accent",
          border: "border-accent/30",
          label: "1st Place",
        };
      case 1:
        return {
          icon: Medal,
          bg: "bg-muted",
          text: "text-muted-foreground",
          border: "border-muted-foreground/30",
          label: "2nd Place",
        };
      case 2:
        return {
          icon: Award,
          bg: "bg-accent-hover/20",
          text: "text-accent-hover",
          border: "border-accent-hover/30",
          label: "3rd Place",
        };
      default:
        return null;
    }
  };

  return (
    <div className="relative overflow-hidden bg-card rounded-xl border-2 border-border shadow-sm">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 border-2 border-primary/20">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">
              Top Contributors
            </h3>
            <p className="text-sm text-muted-foreground">
              Most active users this month
            </p>
          </div>
        </div>

        {/* Contributors List */}
        <div className="space-y-3 mb-6">
          {paginatedContributors.map((contributor, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index;
            const rankBadge = getRankBadge(index);

            return (
              <div
                key={contributor.name}
                className="group relative bg-muted/30 hover:bg-muted/50 rounded-lg p-4 border-2 border-border transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  {/* Rank Number */}
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-card border-2 border-border text-lg font-bold text-foreground flex-shrink-0">
                    {actualIndex + 1}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-12 w-12 border-2 border-border">
                    <AvatarImage
                      src={contributor.avatar || "/placeholder.svg"}
                      alt={contributor.name}
                    />
                    <AvatarFallback className="bg-muted text-foreground font-semibold">
                      {contributor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground truncate">
                        {contributor.name}
                      </h4>
                      {rankBadge && (
                        <div
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${rankBadge.bg} ${rankBadge.border} border`}
                        >
                          <rankBadge.icon
                            className={`h-3 w-3 ${rankBadge.text}`}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-xs bg-background border-border"
                      >
                        {contributor.role}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>{contributor.trend}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Count */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-primary">
                      {contributor.actions}
                    </div>
                    <div className="text-xs text-muted-foreground">actions</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        (contributor.actions /
                          Math.max(...allContributors.map((c) => c.actions))) *
                          100,
                        100
                      )}%`,
                    }}
                  />
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
