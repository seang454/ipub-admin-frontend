/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  ChevronDown,
  Plus,
  MoreHorizontal,
  ArrowUp,
  Users,
  Filter,
  TrendingUp,
  Shield,
  UserIcon,
  Phone,
  MapPin,
  MessageCircle,
} from "lucide-react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table"

export interface User {
  slug: string
  uuid: string
  userName: string
  gender: string | null
  email: string
  fullName: string
  firstName: string
  lastName: string
  imageUrl: string | null
  status: boolean | null
  createDate: string
  updateDate: string
  bio: string | null
  address: string | null
  contactNumber: string | null
  telegramId: string | null
  isUser: boolean
  isAdmin: boolean
  isStudent: boolean
  isAdvisor: boolean
}

export interface CreateUserData {
  username: string
  email: string
  firstname: string
  lastname: string
  password: string
  confirmedPassword: string
}

export interface UpdateUserData {
  userName: string
  gender: string
  email: string
  fullName: string
  firstName: string
  lastName: string
  status: boolean
  bio: string
  address: string
  contactNumber: string
  telegramId: string
}

export const generateFakeUsers = (count: number): User[] =>
  Array.from({ length: count }, (_, i) => ({
    slug: `user-${i + 1}`,
    uuid: `uuid-${i + 1}`,
    userName: `user${i + 1}`,
    gender: Math.random() > 0.5 ? "Male" : "Female",
    email: `user${i + 1}@example.com`,
    fullName: `User ${i + 1}`,
    firstName: `User`,
    lastName: `${i + 1}`,
    imageUrl: null,
    status: Math.random() > 0.3,
    createDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split("T")[0],
    updateDate: new Date().toISOString().split("T")[0],
    bio: Math.random() > 0.5 ? `Bio for user ${i + 1}` : null,
    address: Math.random() > 0.5 ? `Address ${i + 1}` : null,
    contactNumber: Math.random() > 0.5 ? `+855${Math.floor(Math.random() * 100000000)}` : null,
    telegramId: Math.random() > 0.5 ? `@user${i + 1}` : null,
    isUser: true,
    isAdmin: Math.random() > 0.9,
    isStudent: Math.random() > 0.7,
    isAdvisor: Math.random() > 0.8,
  }))

export function UserTable() {
  const mockUsers = generateFakeUsers(50)
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All")

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [promoteOpen, setPromoteOpen] = useState(false)

  const [createFormData, setCreateFormData] = useState<CreateUserData>({
    username: "",
    email: "",
    firstname: "",
    lastname: "",
    password: "",
    confirmedPassword: "",
  })

  const [editFormData, setEditFormData] = useState<UpdateUserData>({
    userName: "",
    gender: "",
    email: "",
    fullName: "",
    firstName: "",
    lastName: "",
    status: true,
    bio: "",
    address: "",
    contactNumber: "",
    telegramId: "",
  })

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const matchesSearch =
          u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.userName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus =
          statusFilter === "All" ||
          (statusFilter === "Active" && u.status === true) ||
          (statusFilter === "Inactive" && u.status === false)
        return matchesSearch && matchesStatus
      }),
    [users, searchTerm, statusFilter],
  )

  const columns = useMemo<ColumnDef<User, any>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "User",
        cell: (info) => (
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 ring-2 ring-slate-100 shadow-sm">
              <AvatarImage src={info.row.original.imageUrl || "/placeholder.svg?height=48&width=48"} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                {info.row.original.firstName?.[0]}
                {info.row.original.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 truncate">{info.getValue<string>()}</p>
              <p className="text-sm text-slate-500 truncate">@{info.row.original.userName}</p>
              <p className="text-xs text-slate-400 truncate">{info.row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => (
          <Badge
            variant="secondary"
            className={
              info.getValue<boolean>() === true
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
            }
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                info.getValue<boolean>() === true ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            {info.getValue<boolean>() === true ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        accessorKey: "roles",
        header: "Roles",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.isAdmin && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            )}
            {row.original.isAdvisor && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">
                <TrendingUp className="w-3 h-3 mr-1" />
                Advisor
              </Badge>
            )}
            {row.original.isStudent && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                <UserIcon className="w-3 h-3 mr-1" />
                Student
              </Badge>
            )}
            {row.original.isUser && !row.original.isAdmin && !row.original.isAdvisor && !row.original.isStudent && (
              <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100">
                <UserIcon className="w-3 h-3 mr-1" />
                User
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "gender",
        header: "Gender",
        cell: (info) => <div className="text-sm text-slate-600">{info.getValue<string>() || "Not specified"}</div>,
      },
      {
        accessorKey: "createDate",
        header: "Joined",
        cell: (info) => <div className="text-sm text-slate-600">{info.getValue<string>()}</div>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedUser(row.original)
                  setViewOpen(true)
                }}
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedUser(row.original)
                  setEditFormData({
                    userName: row.original.userName,
                    gender: row.original.gender || "",
                    email: row.original.email,
                    fullName: row.original.fullName,
                    firstName: row.original.firstName,
                    lastName: row.original.lastName,
                    status: row.original.status || false,
                    bio: row.original.bio || "",
                    address: row.original.address || "",
                    contactNumber: row.original.contactNumber || "",
                    telegramId: row.original.telegramId || "",
                  })
                  setEditOpen(true)
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedUser(row.original)
                  setPromoteOpen(true)
                }}
              >
                Manage Roles
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedUser(row.original)
                  setDeleteOpen(true)
                }}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  )

  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  })

  const handleAddUser = () => {
    const newUser: User = {
      slug: createFormData.username.toLowerCase().replace(/\s+/g, "-"),
      uuid: `uuid-${Date.now()}`,
      userName: createFormData.username,
      gender: null,
      email: createFormData.email,
      fullName: `${createFormData.firstname} ${createFormData.lastname}`,
      firstName: createFormData.firstname,
      lastName: createFormData.lastname,
      imageUrl: null,
      status: true,
      createDate: new Date().toISOString().split("T")[0],
      updateDate: new Date().toISOString().split("T")[0],
      bio: null,
      address: null,
      contactNumber: null,
      telegramId: null,
      isUser: true,
      isAdmin: false,
      isStudent: false,
      isAdvisor: false,
    }
    setUsers([...users, newUser])
    setCreateFormData({
      username: "",
      email: "",
      firstname: "",
      lastname: "",
      password: "",
      confirmedPassword: "",
    })
    setAddOpen(false)
  }

  const handleEditUser = () => {
    if (!selectedUser) return
    setUsers(
      users.map((u) =>
        u.uuid === selectedUser.uuid
          ? {
              ...u,
              userName: editFormData.userName,
              gender: editFormData.gender,
              email: editFormData.email,
              fullName: editFormData.fullName,
              firstName: editFormData.firstName,
              lastName: editFormData.lastName,
              status: editFormData.status,
              bio: editFormData.bio,
              address: editFormData.address,
              contactNumber: editFormData.contactNumber,
              telegramId: editFormData.telegramId,
              updateDate: new Date().toISOString().split("T")[0],
            }
          : u,
      ),
    )
    setEditOpen(false)
  }

  const handleDeleteUser = () => {
    if (!selectedUser) return
    setUsers(users.filter((u) => u.uuid !== selectedUser.uuid))
    setDeleteOpen(false)
  }

  const handlePromoteUser = (roleType: "isAdmin" | "isAdvisor" | "isStudent", value: boolean) => {
    if (!selectedUser) return
    setUsers(
      users.map((u) =>
        u.uuid === selectedUser.uuid
          ? { ...u, [roleType]: value, updateDate: new Date().toISOString().split("T")[0] }
          : u,
      ),
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">User Management</h2>
            <p className="text-sm text-slate-600">Manage and track user information</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search users by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white shadow-sm"
            />
          </div>
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white border-slate-300 hover:bg-slate-50">
                  <Filter className="w-4 h-4 mr-2" />
                  {statusFilter} <ChevronDown className="ml-2 w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                <DropdownMenuItem onClick={() => setStatusFilter("All")}>All Status</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Active")}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Inactive")}>Inactive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm">
                  <Plus className="w-4 h-4 mr-2" /> Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-slate-900">Add New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        value={createFormData.firstname}
                        onChange={(e) => setCreateFormData({ ...createFormData, firstname: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={createFormData.lastname}
                        onChange={(e) => setCreateFormData({ ...createFormData, lastname: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                      value={createFormData.username}
                      onChange={(e) => setCreateFormData({ ...createFormData, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={createFormData.email}
                      onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input
                        type="password"
                        value={createFormData.password}
                        onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input
                        type="password"
                        value={createFormData.confirmedPassword}
                        onChange={(e) => setCreateFormData({ ...createFormData, confirmedPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser} className="bg-indigo-600 hover:bg-indigo-700">
                    Add User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() && (
                        <ArrowUp className={`w-3 h-3 ${header.column.getIsSorted() === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-slate-25"}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="hover:bg-slate-100"
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="hover:bg-slate-100"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="hover:bg-slate-100"
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="hover:bg-slate-100"
          >
            Last
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              filteredUsers.length,
            )}{" "}
            of {filteredUsers.length} users
          </span>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Rows per page:</span>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger className="w-20 h-8 border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Promote/Role Management Dialog */}
      <Dialog open={promoteOpen} onOpenChange={setPromoteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">Manage User Roles</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-700">
                  <span className="font-semibold text-slate-900">{selectedUser.fullName}</span>
                </p>
                <p className="text-sm text-slate-500">@{selectedUser.userName}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-700">Admin Role</Label>
                  <Button
                    variant={selectedUser.isAdmin ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePromoteUser("isAdmin", !selectedUser.isAdmin)}
                    className={selectedUser.isAdmin ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    {selectedUser.isAdmin ? "Remove" : "Grant"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-700">Advisor Role</Label>
                  <Button
                    variant={selectedUser.isAdvisor ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePromoteUser("isAdvisor", !selectedUser.isAdvisor)}
                    className={selectedUser.isAdvisor ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    {selectedUser.isAdvisor ? "Remove" : "Grant"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-700">Student Role</Label>
                  <Button
                    variant={selectedUser.isStudent ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePromoteUser("isStudent", !selectedUser.isStudent)}
                    className={selectedUser.isStudent ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    {selectedUser.isStudent ? "Remove" : "Grant"}
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPromoteOpen(false)}
              className="border-slate-300 hover:bg-slate-50"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={editFormData.userName}
                    onChange={(e) => setEditFormData({ ...editFormData, userName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={editFormData.gender}
                    onValueChange={(v) => setEditFormData({ ...editFormData, gender: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editFormData.status.toString()}
                  onValueChange={(v) => setEditFormData({ ...editFormData, status: v === "true" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={editFormData.bio}
                  onChange={(e:any) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  placeholder="User bio..."
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  placeholder="User address..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input
                    value={editFormData.contactNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, contactNumber: e.target.value })}
                    placeholder="+855..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telegram ID</Label>
                  <Input
                    value={editFormData.telegramId}
                    onChange={(e) => setEditFormData({ ...editFormData, telegramId: e.target.value })}
                    placeholder="@username"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} className="border-slate-300">
              Cancel
            </Button>
            <Button onClick={handleEditUser} className="bg-indigo-600 hover:bg-indigo-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <p>
                Are you sure you want to delete <span className="font-semibold">{selectedUser.fullName}</span>?
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="border-slate-300">
              Cancel
            </Button>
            <Button onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 ring-2 ring-slate-100 shadow-sm">
                  <AvatarImage src={selectedUser.imageUrl || "/placeholder.svg?height=64&width=64"} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-lg">
                    {selectedUser.firstName?.[0]}
                    {selectedUser.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-900 text-lg">{selectedUser.fullName}</p>
                  <p className="text-sm text-slate-500">@{selectedUser.userName}</p>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</Label>
                  <Badge
                    variant="secondary"
                    className={
                      selectedUser.status === true
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 mt-1"
                        : "bg-red-50 text-red-700 border-red-200 mt-1"
                    }
                  >
                    {selectedUser.status === true ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Gender</Label>
                  <p className="text-sm text-slate-900 mt-1">{selectedUser.gender || "Not specified"}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Roles</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedUser.isAdmin && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {selectedUser.isAdvisor && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Advisor
                    </Badge>
                  )}
                  {selectedUser.isStudent && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <UserIcon className="w-3 h-3 mr-1" />
                      Student
                    </Badge>
                  )}
                  {selectedUser.isUser &&
                    !selectedUser.isAdmin &&
                    !selectedUser.isAdvisor &&
                    !selectedUser.isStudent && (
                      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                        <UserIcon className="w-3 h-3 mr-1" />
                        User
                      </Badge>
                    )}
                </div>
              </div>

              {selectedUser.bio && (
                <div>
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Bio</Label>
                  <p className="text-sm text-slate-900 mt-1">{selectedUser.bio}</p>
                </div>
              )}

              {(selectedUser.address || selectedUser.contactNumber || selectedUser.telegramId) && (
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Contact Information
                  </Label>
                  {selectedUser.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-900">{selectedUser.address}</span>
                    </div>
                  )}
                  {selectedUser.contactNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-900">{selectedUser.contactNumber}</span>
                    </div>
                  )}
                  {selectedUser.telegramId && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-900">{selectedUser.telegramId}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Joined</Label>
                  <p className="text-sm text-slate-900 mt-1">{selectedUser.createDate}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Last Updated</Label>
                  <p className="text-sm text-slate-900 mt-1">{selectedUser.updateDate}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)} className="border-slate-300">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
