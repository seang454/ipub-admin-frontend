"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect, useRef } from "react";
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

// Types
interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  status: "Active" | "Inactive";
  role: "Student" | "User" | "Adviser";
  lastActive: string;
  avatar?: string;
}

// Mock data generator
const generateFakeAdvisor = (count: number): Student[] => {
  const courses = [
    "BS Computer Science",
    "BS Information Technology",
    "BS Software Engineering",
  ];
  const names = [
    "John Smith",
    "Jane Doe",
    "Michael Johnson",
    "Emily Davis",
    "David Wilson",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: (i + 1).toString(),
    name: names[i % names.length],
    email: `user${i + 1}@example.com`,
    course: courses[i % courses.length],
    status: i % 3 === 0 ? "Inactive" : "Active",
    role: "Adviser" as const,
    lastActive: "2024-01-15",
  }));
};

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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

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

  // Focus dialog when opened
  useEffect(() => {
    if ((viewOpen || editOpen || deleteOpen || addOpen) && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [viewOpen, editOpen, deleteOpen, addOpen]);

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
        header: "Adviser",
        cell: (info) => (
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 rounded-lg border-2 border-blue-100 dark:border-blue-800 shadow-sm">
              <AvatarImage
                src={info.row.original.avatar || "/placeholder.svg"}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white font-semibold rounded-lg">
                {info
                  .getValue<string>()
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900  truncate">
                {info.getValue<string>()}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
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
          <div className="font-medium text-slate-900 ">
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
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700 dark:hover:bg-emerald-800"
                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:border-red-700 dark:hover:bg-red-800"
            }
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                info.getValue<"Active" | "Inactive">() === "Active"
                  ? "bg-emerald-500 dark:bg-emerald-400"
                  : "bg-red-500 dark:bg-red-400"
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
              info.getValue() === "Adviser"
                ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700 dark:hover:bg-purple-800"
                : info.getValue() === "User"
                ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 dark:hover:bg-blue-800"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-700  dark:border-slate-600 dark:hover:bg-slate-600"
            }
          >
            {info.getValue()}
          </Badge>
        ),
      },
      {
        accessorKey: "lastActive",
        header: "Last Active",
        cell: (info) => (
          <div className="text-sm text-slate-600 ">
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
                className="h-8 w-8 p-0 hover:bg-indigo-50 dark:hover:bg-indigo-900 bg-white dark:bg-slate-800"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-white dark:bg-slate-800 border-0"
            >
              <DropdownMenuItem
                onClick={() => {
                  setSelectedStudent(row.original);
                  setViewOpen(true);
                }}
                className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900 text-slate-900 "
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
                className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900 text-slate-900 "
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedStudent(row.original);
                  setDeleteOpen(true);
                }}
                className="text-red-600 dark:text-red-400 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900"
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
      course: courseOptions[0],
      status: "Active",
      role: "Adviser",
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
    <div>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:border-slate-700 overflow-hidden">
          <div className=" dark:from-indigo-900 dark:to-blue-900 bg-card border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <Users className="w-6 h-6  dark:text-indigo-200 text-dynamic" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-dynamic">
                  Adviser Management
                </h2>
                <p className="text-sm text-dynamic">
                  Manage and track adviser information ({Advisor.length}{" "}
                  advisers)
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="Search advisers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className=" bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm"
                />
              </div>
              <div className="flex gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="pl-10 dark:border-slate-60 text-search shadow-sm border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg bg-card hover:bg-no-repeat"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      {statusFilter} <ChevronDown className="ml-2 w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className=" bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("All")}
                      className="cursor-pointer text-dynamic   hover:bg-indigo-50 dark:hover:bg-indigo-900"
                    >
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("Active")}
                      className="cursor-pointer text-dynamic  hover:bg-indigo-50 dark:hover:bg-indigo-900"
                    >
                      Active
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("Inactive")}
                      className="cursor-pointer text-dynamic  hover:bg-indigo-50 dark:hover:bg-indigo-900"
                    >
                      Inactive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-sm">
                      <Plus className="w-4 h-4 mr-2" /> Add Adviser
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className="p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm"
                    ref={dialogRef}
                    tabIndex={-1}
                  >
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-dynamic   flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add New Adviser
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                      <div className="grid grid-cols-2 gap-4 ">
                        <div className="space-y-2">
                          <Label className=" text-sm font-semibold text-dynamic ">
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
                            className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-dynamic ">
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
                            className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-dynamic ">
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
                          className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-dynamic ">
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
                          className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-dynamic ">
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
                            className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-dynamic ">
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
                            className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setAddOpen(false)}
                        className="border-slate-300 dark:border-slate-600 text-slate-900 "
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddStudent}
                        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-sm"
                      >
                        Add Adviser
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-slate-50/80 backdrop-blur-sm">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header, index) => (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className={`px-6 py-4 bg-card text-left text-xs font-bold text-dynamic2  uppercase  cursor-pointer select-non transition-colors ${
                          index === 0
                            ? "w-2/7"
                            : index === 1
                            ? "w-1/7"
                            : index === 2
                            ? "w-1/7"
                            : index === 3
                            ? "w-1/7"
                            : index === 4
                            ? "w-1/7"
                            : "w-12"
                        }`}
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
              <tbody>
                {table.getRowModel().rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={` bg-card text-left text-xs font-bold text-dynamic2 uppercase  cursor-pointer select-non transition-colors`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50/50 dark:bg-slate-700/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-600 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-600 text-slate-900  shadow-sm"
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-600 text-slate-900  shadow-sm"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-600 text-slate-900  shadow-sm"
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-600 text-slate-900  shadow-sm"
                >
                  Last
                </Button>
              </div>
              <div className="flex items-center gap-4 border-0">
                <span className="text-sm text-slate-600 ">
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
                  of {filteredAdvisor.length} Advisers
                </span>
                <Select
                  value={table.getState().pagination.pageSize.toString()}
                  onValueChange={(value) => table.setPageSize(Number(value))}
                >
                  <SelectTrigger className="w-32 h-8 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 ">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-0">
                    {[10, 20, 30].map((size) => (
                      <SelectItem
                        key={size}
                        value={size.toString()}
                        className="text-slate-900  hover:bg-indigo-50 dark:hover:bg-indigo-900"
                      >
                        Show {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* View Dialog */}
          <Dialog open={viewOpen} onOpenChange={setViewOpen}>
            <DialogContent
              className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              ref={dialogRef}
              tabIndex={-1}
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900  flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-200" />
                  Adviser Details
                </DialogTitle>
              </DialogHeader>
              {selectedStudent && (
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <Avatar className="w-16 h-16 rounded-lg border-2 border-blue-100 dark:border-blue-800 shadow-sm">
                      <AvatarImage
                        src={selectedStudent.avatar || "/placeholder.svg"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 text-white font-semibold rounded-lg text-lg">
                        {selectedStudent.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900  text-lg">
                        {selectedStudent.name}
                      </h3>
                      <p className="text-slate-600 ">{selectedStudent.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 ">
                        Course
                      </Label>
                      <p className="text-sm text-slate-900  font-medium">
                        {selectedStudent.course}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 ">
                        Status
                      </Label>
                      <Badge
                        variant="secondary"
                        className={
                          selectedStudent.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700"
                            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
                        }
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            selectedStudent.status === "Active"
                              ? "bg-emerald-500 dark:bg-emerald-400"
                              : "bg-red-500 dark:bg-red-400"
                          }`}
                        />
                        {selectedStudent.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 ">
                        Role
                      </Label>
                      <Badge
                        variant="outline"
                        className={
                          selectedStudent.role === "Adviser"
                            ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700"
                            : selectedStudent.role === "User"
                            ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
                            : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-700  dark:border-slate-600"
                        }
                      >
                        {selectedStudent.role}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 ">
                        Last Active
                      </Label>
                      <p className="text-sm text-slate-900 ">
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
                  className="border-slate-300 dark:border-slate-600 text-slate-900 "
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent
              className="sm:max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              ref={dialogRef}
              tabIndex={-1}
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900  flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-200" />
                  Edit Adviser
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 ">
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
                      className="border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900  rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 ">
                      Gender
                    </Label>
                    <Select
                      value={editFormData.gender}
                      onValueChange={(v) =>
                        setEditFormData({ ...editFormData, gender: v })
                      }
                    >
                      <SelectTrigger className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 ">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-0">
                        <SelectItem
                          value="Male"
                          className="text-slate-900  hover:bg-indigo-50 dark:hover:bg-indigo-900"
                        >
                          Male
                        </SelectItem>
                        <SelectItem
                          value="Female"
                          className="text-slate-900  hover:bg-indigo-50 dark:hover:bg-indigo-900"
                        >
                          Female
                        </SelectItem>
                        <SelectItem
                          value="Other"
                          className="text-slate-900  hover:bg-indigo-50 dark:hover:bg-indigo-900"
                        >
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 ">
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    className="border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900  rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 ">
                    Full Name
                  </Label>
                  <Input
                    value={editFormData.fullName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        fullName: e.target.value,
                      })
                    }
                    className="border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900  rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 ">
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
                      className="border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900  rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 ">
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
                      className="border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900  rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 ">
                    Course
                  </Label>
                  <Select
                    value={editFormData.course}
                    onValueChange={(v) =>
                      setEditFormData({ ...editFormData, course: v })
                    }
                  >
                    <SelectTrigger className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 ">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-0">
                      {courseOptions.map((c) => (
                        <SelectItem
                          key={c}
                          value={c}
                          className="text-slate-900  hover:bg-indigo-50 dark:hover:bg-indigo-900"
                        >
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 ">
                      Status
                    </Label>
                    <Select
                      value={editFormData.status.toString()}
                      onValueChange={(v) =>
                        setEditFormData({
                          ...editFormData,
                          status: v === "true",
                        })
                      }
                    >
                      <SelectTrigger className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 ">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-0">
                        <SelectItem
                          value="true"
                          className="text-slate-900  hover:bg-indigo-50 dark:hover:bg-indigo-900"
                        >
                          Active
                        </SelectItem>
                        <SelectItem
                          value="false"
                          className="text-slate-900  hover:bg-indigo-50 dark:hover:bg-indigo-900"
                        >
                          Inactive
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 ">
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
                      <SelectTrigger className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 ">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-0">
                        {roleOptions.map((r) => (
                          <SelectItem
                            key={r}
                            value={r}
                            className="text-slate-900  hover:bg-indigo-50 dark:hover:bg-indigo-900"
                          >
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 ">
                    Bio
                  </Label>
                  <Input
                    value={editFormData.bio}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, bio: e.target.value })
                    }
                    className="border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900  rounded-lg"
                    placeholder="Adviser bio..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 ">
                    Address
                  </Label>
                  <Input
                    value={editFormData.address}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        address: e.target.value,
                      })
                    }
                    className="border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900  rounded-lg"
                    placeholder="Adviser address..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 ">
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
                      className="border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900  rounded-lg"
                      placeholder="+855..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 ">
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
                      className="border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900  rounded-lg"
                      placeholder="@username"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  className="border-slate-300 dark:border-slate-600 text-slate-900 "
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditStudent}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-sm"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent
              className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              ref={dialogRef}
              tabIndex={-1}
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900  flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-600 dark:text-red-200" />
                  Delete Adviser
                </DialogTitle>
              </DialogHeader>
              {selectedStudent && (
                <div className="space-y-4 py-4">
                  <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900 dark:to-orange-900 rounded-lg border border-red-200 dark:border-red-700">
                    <p className="text-sm text-red-800 dark:text-red-300">
                      Are you sure you want to delete{" "}
                      <span className="font-semibold">
                        {selectedStudent.name}
                      </span>
                      ? This action cannot be undone.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <Avatar className="w-12 h-12 rounded-lg border-2 border-blue-100 dark:border-blue-800 shadow-sm">
                      <AvatarImage
                        src={selectedStudent.avatar || "/placeholder.svg"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 text-white font-semibold rounded-lg">
                        {selectedStudent.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 ">
                        {selectedStudent.name}
                      </h3>
                      <p className="text-sm text-slate-600 ">
                        {selectedStudent.email}
                      </p>
                      <p className="text-sm text-slate-600 ">
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
                  className="border-slate-300 dark:border-slate-600 text-slate-900 "
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteStudent}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white shadow-sm"
                >
                  Delete Adviser
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
