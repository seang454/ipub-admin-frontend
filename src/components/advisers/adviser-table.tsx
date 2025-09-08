"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, ChevronDown, Plus, MoreHorizontal } from "lucide-react"

interface Adviser {
  id: string
  name: string
  email: string
  department: string
  lastActive: string
  status: "Active" | "Inactive"
  avatar?: string
}

const mockAdvisers: Adviser[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    email: "johnson.s@university.edu",
    department: "Computer Science",
    lastActive: "2024-01-15",
    status: "Active",
  },
  {
    id: "2",
    name: "Prof. Michael Chen",
    email: "chen.m@university.edu",
    department: "Information Technology",
    lastActive: "2024-01-14",
    status: "Inactive",
  },
  {
    id: "3",
    name: "Dr. Emily Davis",
    email: "davis.e@university.edu",
    department: "Software Engineering",
    lastActive: "2024-01-13",
    status: "Active",
  },
  {
    id: "4",
    name: "Prof. James Wilson",
    email: "wilson.j@university.edu",
    department: "Information Systems",
    lastActive: "2024-01-12",
    status: "Inactive",
  },
]

export function AdviserTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")

  const filteredAdvisers = mockAdvisers.filter((adviser) => {
    const matchesSearch =
      adviser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adviser.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All Status" || adviser.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="bg-card rounded-lg">
      <div className="py-6 border-b border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search Advisers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600">
                  {statusFilter}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("All Status")}>All Status</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Active")}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Inactive")}>Inactive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button className="text-white bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Adviser
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adviser</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAdvisers.map((adviser) => (
              <tr key={adviser.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={adviser.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gray-100">
                        {adviser.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-900">{adviser.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{adviser.department}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{adviser.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{adviser.lastActive}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={adviser.status === "Active" ? "default" : "destructive"}
                    className={
                      adviser.status === "Active"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                    }
                  >
                    {adviser.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Adviser</DropdownMenuItem>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete Adviser</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
