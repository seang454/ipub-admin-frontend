/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ChevronDown,
  Plus,
  MoreHorizontal,
  ArrowUp,
  Users,
  Filter,
} from "lucide-react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { generateFakeAdvisor, Student } from "./data";

const courseOptions = [
  "BS Computer Science",
  "BS Information Technology",
  "BS Software Engineering",
  "BS Information Systems",
  "BS Data Science",
  "BS Cybersecurity",
];

const roleOptions = ["Student", "User", "Adviser"] as const;

export function AdviserTable() {
  const mockAdvisor = generateFakeAdvisor(50).map((s) => ({
    ...s,
    role: "Adviser" as (typeof roleOptions)[number],
  }));
  const [Advisor, setAdvisor] = useState<Student[]>(mockAdvisor);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Inactive"
  >("All");

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const [createFormData, setCreateFormData] = useState({
    username: "",
    email: "",
    firstname: "",
    lastname: "",
    password: "",
    confirmedPassword: "",
  });

  const [editFormData, setEditFormData] = useState({
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
    course: "",
    role: "Student" as (typeof roleOptions)[number],
  });

  const filteredAdvisor = useMemo(() => {
    return Advisor.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [Advisor, searchTerm, statusFilter]);

  const columns = useMemo<ColumnDef<Student, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Student",
        cell: (info) => (
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 ring-2 ring-slate-100 shadow-sm">
              <AvatarImage
                src={info.row.original.avatar || "/placeholder.svg"}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {info
                  .getValue<string>()
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 truncate">
                {info.getValue<string>()}
              </p>
              <p className="text-sm text-slate-500 truncate">
                {info.row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "course",
        header: "Course",
        cell: (info) => (
          <div className="font-medium text-slate-700">
            {info.getValue<string>()}
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
              info.getValue<"Active" | "Inactive">() === "Active"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
            }
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                info.getValue<"Active" | "Inactive">() === "Active"
                  ? "bg-emerald-500"
                  : "bg-red-500"
              }`}
            />
            {info.getValue<"Active" | "Inactive">()}
          </Badge>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: (info) => (
          <Badge
            variant="outline"
            className={
              info.getValue() === "Mentor"
                ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                : info.getValue() === "User"
                ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }
          >
            {info.getValue() === "Mentor" && (
              <MoreHorizontal className="w-3 h-3 mr-1" />
            )}
            {info.getValue()}
          </Badge>
        ),
      },
      {
        accessorKey: "lastActive",
        header: "Last Active",
        cell: (info) => (
          <div className="text-sm text-slate-600">
            {info.getValue<string>()}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-indigo-50"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedStudent(row.original);
                  setViewOpen(true);
                }}
                className="cursor-pointer hover:bg-indigo-50"
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedStudent(row.original);
                  setEditFormData({
                    userName: row.original.name
                      .toLowerCase()
                      .replace(/\s+/g, ""),
                    gender: "",
                    email: row.original.email,
                    fullName: row.original.name,
                    firstName: row.original.name.split(" ")[0] || "",
                    lastName:
                      row.original.name.split(" ").slice(1).join(" ") || "",
                    status: row.original.status === "Active",
                    bio: "",
                    address: "",
                    contactNumber: "",
                    telegramId: "",
                    course: row.original.course,
                    role: row.original.role,
                  });
                  setEditOpen(true);
                }}
                className="cursor-pointer hover:bg-indigo-50"
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedStudent(row.original);
                  setDeleteOpen(true);
                }}
                className="text-red-600 cursor-pointer focus:text-red-600 hover:bg-red-50"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: filteredAdvisor,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  const handleAddStudent = () => {
    const newStudent: Student = {
      id: (Advisor.length + 1).toString(),
      name: `${createFormData.firstname} ${createFormData.lastname}`,
      email: createFormData.email,
      course: courseOptions[0], // Default course
      status: "Active",
      role: "Student",
      lastActive: new Date().toISOString().split("T")[0],
    };
    setAdvisor([...Advisor, newStudent]);
    setCreateFormData({
      username: "",
      email: "",
      firstname: "",
      lastname: "",
      password: "",
      confirmedPassword: "",
    });
    setAddOpen(false);
  };

  const handleEditStudent = () => {
    if (!selectedStudent) return;
    setAdvisor(
      Advisor.map((s) =>
        s.id === selectedStudent.id
          ? {
              ...s,
              name: editFormData.fullName,
              email: editFormData.email,
              course: editFormData.course,
              status: editFormData.status ? "Active" : "Inactive",
              role: editFormData.role,
            }
          : s
      )
    );
    setEditOpen(false);
  };

  const handleDeleteStudent = () => {
    if (!selectedStudent) return;
    setAdvisor(Advisor.filter((s) => s.id !== selectedStudent.id));
    setDeleteOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Student Management
            </h2>
            <p className="text-sm text-slate-600">
              Manage and track student information
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search Advisor by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white shadow-sm"
            />
          </div>
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white border-slate-300 hover:bg-slate-50"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {statusFilter} <ChevronDown className="ml-2 w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                <DropdownMenuItem
                  onClick={() => setStatusFilter("All")}
                  className="cursor-pointer"
                >
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("Active")}
                  className="cursor-pointer"
                >
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("Inactive")}
                  className="cursor-pointer"
                >
                  Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-slate-900">
                    Add New Student
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        First Name
                      </Label>
                      <Input
                        value={createFormData.firstname}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            firstname: e.target.value,
                          })
                        }
                        className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        Last Name
                      </Label>
                      <Input
                        value={createFormData.lastname}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            lastname: e.target.value,
                          })
                        }
                        className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      Username
                    </Label>
                    <Input
                      value={createFormData.username}
                      onChange={(e) =>
                        setCreateFormData({
                          ...createFormData,
                          username: e.target.value,
                        })
                      }
                      className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      Email
                    </Label>
                    <Input
                      type="email"
                      value={createFormData.email}
                      onChange={(e) =>
                        setCreateFormData({
                          ...createFormData,
                          email: e.target.value,
                        })
                      }
                      className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        Password
                      </Label>
                      <Input
                        type="password"
                        value={createFormData.password}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            password: e.target.value,
                          })
                        }
                        className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        Confirm Password
                      </Label>
                      <Input
                        type="password"
                        value={createFormData.confirmedPassword}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            confirmedPassword: e.target.value,
                          })
                        }
                        className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setAddOpen(false)}
                    className="border-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddStudent}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add Student
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

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
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() && (
                        <ArrowUp
                          className={`w-3 h-3 ${
                            header.column.getIsSorted() === "desc"
                              ? "rotate-180"
                              : ""
                          }`}
                        />
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
                className={`hover:bg-slate-50 transition-colors ${
                  index % 2 === 0 ? "bg-white" : "bg-slate-25"
                }`}
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

      <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="border-slate-300 hover:bg-white"
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-slate-300 hover:bg-white"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-slate-300 hover:bg-white"
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="border-slate-300 hover:bg-white"
            >
              Last
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              Showing{" "}
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}{" "}
              to{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                filteredAdvisor.length
              )}{" "}
              of {filteredAdvisor.length} Advisor
            </span>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-32 h-8 border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    Show {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Student Details
            </DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <Avatar className="w-16 h-16 ring-2 ring-slate-200 shadow-sm">
                  <AvatarImage
                    src={selectedStudent.avatar || "/placeholder.svg"}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-lg">
                    {selectedStudent.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 text-lg">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-slate-600">{selectedStudent.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Course
                  </Label>
                  <p className="text-sm text-slate-900 font-medium">
                    {selectedStudent.course}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Status
                  </Label>
                  <Badge
                    variant="secondary"
                    className={
                      selectedStudent.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        selectedStudent.status === "Active"
                          ? "bg-emerald-500"
                          : "bg-red-500"
                      }`}
                    />
                    {selectedStudent.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Role
                  </Label>
                  <Badge
                    variant="outline"
                    className={
                      selectedStudent.role === "Adviser"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : selectedStudent.role === "User"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }
                  >
                    {selectedStudent.role}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Last Active
                  </Label>
                  <p className="text-sm text-slate-900">
                    {selectedStudent.lastActive}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewOpen(false)}
              className="border-slate-300"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Edit Student
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Username
                </Label>
                <Input
                  value={editFormData.userName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      userName: e.target.value,
                    })
                  }
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Gender
                </Label>
                <Select
                  value={editFormData.gender}
                  onValueChange={(v) =>
                    setEditFormData({ ...editFormData, gender: v })
                  }
                >
                  <SelectTrigger className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500">
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
              <Label className="text-sm font-medium text-slate-700">
                Email
              </Label>
              <Input
                type="email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Full Name
              </Label>
              <Input
                value={editFormData.fullName}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, fullName: e.target.value })
                }
                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  First Name
                </Label>
                <Input
                  value={editFormData.firstName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      firstName: e.target.value,
                    })
                  }
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Last Name
                </Label>
                <Input
                  value={editFormData.lastName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      lastName: e.target.value,
                    })
                  }
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Course
              </Label>
              <Select
                value={editFormData.course}
                onValueChange={(v) =>
                  setEditFormData({ ...editFormData, course: v })
                }
              >
                <SelectTrigger className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courseOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Status
                </Label>
                <Select
                  value={editFormData.status.toString()}
                  onValueChange={(v) =>
                    setEditFormData({ ...editFormData, status: v === "true" })
                  }
                >
                  <SelectTrigger className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Role
                </Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(v) =>
                    setEditFormData({
                      ...editFormData,
                      role: v as (typeof roleOptions)[number],
                    })
                  }
                >
                  <SelectTrigger className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Bio</Label>
              <Input
                value={editFormData.bio}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, bio: e.target.value })
                }
                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Student bio..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Address
              </Label>
              <Input
                value={editFormData.address}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, address: e.target.value })
                }
                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Student address..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Contact Number
                </Label>
                <Input
                  value={editFormData.contactNumber}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      contactNumber: e.target.value,
                    })
                  }
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="+855..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Telegram ID
                </Label>
                <Input
                  value={editFormData.telegramId}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      telegramId: e.target.value,
                    })
                  }
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="@username"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditStudent}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Delete Student
            </DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-800">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{selectedStudent.name}</span>?
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <Avatar className="w-12 h-12 ring-2 ring-slate-200 shadow-sm">
                  <AvatarImage
                    src={selectedStudent.avatar || "/placeholder.svg"}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                    {selectedStudent.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {selectedStudent.email}
                  </p>
                  <p className="text-sm text-slate-600">
                    {selectedStudent.course}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteStudent}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
