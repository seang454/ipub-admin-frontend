/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Star, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useState } from "react"

const PRIMARY_COLOR = "#2B7FFF"
const SECONDARY_COLOR = "#3559AF"
const ACCENT_COLOR = "#F59E0B"

export function TopContributors() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3
  
  const allContributors = [
    { name: "Sarah Johnson", actions: 48, avatar: "/placeholder.svg?height=40&width=40", trend: "+12%", role: "Senior Developer" },
    { name: "Michael Chen", actions: 28, avatar: "/placeholder.svg?height=40&width=40", trend: "+8%", role: "UI/UX Designer" },
    { name: "Emily Davis", actions: 22, avatar: "/placeholder.svg?height=40&width=40", trend: "+5%", role: "Product Manager" },
    { name: "James Wilson", actions: 17, avatar: "/placeholder.svg?height=40&width=40", trend: "+3%", role: "QA Engineer" },
    { name: "Lisa Rodriguez", actions: 35, avatar: "/placeholder.svg?height=40&width=40", trend: "+9%", role: "DevOps Engineer" },
    { name: "David Kim", actions: 29, avatar: "/placeholder.svg?height=40&width=40", trend: "+6%", role: "Frontend Developer" },
    { name: "Anna Petrov", actions: 24, avatar: "/placeholder.svg?height=40&width=40", trend: "+4%", role: "Backend Developer" },
    { name: "Robert Taylor", actions: 19, avatar: "/placeholder.svg?height=40&width=40", trend: "+2%", role: "Data Analyst" },
  ]

  const totalPages = Math.ceil(allContributors.length / itemsPerPage)
  const paginatedContributors = allContributors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page:any) => {
    setCurrentPage(page)
  }

  const getRankStyle = (index:any) => {
    switch (index) {
      case 0:
        return { bg: "bg-yellow-400", text: "text-white", ring: "ring-2 ring-yellow-400/30" }
      case 1:
        return { bg: "bg-gray-400", text: "text-white", ring: "ring-2 ring-gray-400/30" }
      case 2:
        return { bg: "bg-[#CD7F32]", text: "text-white", ring: "ring-2 ring-[#CD7F32]/30" }
      default:
        return { bg: "bg-gray-100", text: "text-gray-900", ring: "ring-2 ring-gray-200/50" }
    }
  }

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-600 rounded-xl shadow-md">
            <Star className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Top Contributors
            </h3>
            <p className="text-sm text-gray-500 mt-1">Most active users this month</p>
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
              className="group relative bg-white hover:bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-500 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div className={`absolute -top-2 -left-2 ${rankStyle.bg} ${rankStyle.text} px-3 py-1 rounded-lg font-bold text-sm shadow-md z-10`}>
                #{actualIndex + 1}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="relative">
                    <Avatar className={`h-14 w-14 ${rankStyle.ring} group-hover:ring-blue-500/40 transition-all duration-300`}>
                      <AvatarImage src={contributor.avatar} alt={contributor.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                        {contributor.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {actualIndex === 0 && (
                      <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white rounded-full p-1.5 shadow-md">
                        <Star className="h-4 w-4" fill="currentColor" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-300 truncate">
                        {contributor.name}
                      </span>
                      <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-600 ml-2">
                        {contributor.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge className="bg-blue-50 text-blue-600 border-blue-200">
                        {contributor.actions} actions
                      </Badge>
                      <div className="flex items-center gap-1 text-amber-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>{contributor.trend}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {contributor.actions}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">this month</div>
                </div>
              </div>
              
              <div className="mt-4 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((contributor.actions / Math.max(...allContributors.map(c => c.actions))) * 100, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2 w-full justify-between m-auto">
          
          <div className="flex items-center gap-2 w-full justify-between m-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="border-gray-300 hover:bg-blue-50 hover:text-blue-600 h-8 px-3"
            >
              <ChevronsLeft className="h-4 w-4 mr-1" />
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-gray-300 hover:bg-blue-50 hover:text-blue-600 h-8 px-3"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-gray-500 px-3">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-gray-300 hover:bg-blue-50 hover:text-blue-600 h-8 px-3"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="border-gray-300 hover:bg-blue-50 hover:text-blue-600 h-8 px-3"
            >
              Last
              <ChevronsRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}