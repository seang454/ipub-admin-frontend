"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
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
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Shield,
  TrendingUp,
  User as UserIcon,
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
import { useSession } from "next-auth/react";
import {
  useGetAllAdvisorsQuery,
  useCreateNewAdvisorMutation,
  useUpdateAdvisorMutation,
  useDeleteAdvisorMutation,
} from "@/lib/api/advisorSlice";
import { toast, ToastContainer } from "react-toastify";
import { User, UsersResponse } from "@/types/userType/userType";
import { useCreateMediaMutation } from "@/lib/api/imageSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Adviser, adviserSchema } from "./zode";
import { useDeleteUserMutation } from "@/lib/api/userSlice";

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

export function AdviserTable({
  advisers,
}: {
  advisers: UsersResponse | undefined;
}) {
  // session / token for API calls
  const { data: session } = useSession();
  const accessToken = session?.accessToken as string | undefined;

  // fetch advisors so we can trigger refetch when needed
  const { data: fetchedAdvisors, refetch: refetchAdvisors } =
    useGetAllAdvisorsQuery(
      { token: accessToken ?? "" },
      { skip: !accessToken }
    );

  // mutations (advisor API)
  const [createNewAdvisor, { isLoading: creating }] =
    useCreateNewAdvisorMutation();
  const [updateAdvisor] = useUpdateAdvisorMutation();
  const [deleteAdvisor] = useDeleteAdvisorMutation();
  // media upload mutation
  const [createMedia] = useCreateMediaMutation();

  // keep local Advisor state for UI editing, but populate from fetched users when available
  const [Advisor, setAdvisor] = useState<User[]>(advisers?.content || []);
  // sync advisers from fetched users

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Inactive"
  >("All");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const [createFormData, setCreateFormData] = useState({
    username: "",
    email: "",
    firstname: "",
    lastname: "",
    password: "",
    confirmedPassword: "",
  });
  // password visibility toggles for add form
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [editFormData, setEditFormData] = useState({
    userName: "",
    gender: "",
    email: "",
    fullName: "",
    firstName: "",
    lastName: "",
    status: true,
    // new advisor fields
    experienceYears: "" as string,
    linkedinUrl: "",
    office: "",
    socialLinks: "",
    // image handling (file + preview)
    imageFile: null as File | null,
    imagePreview: "" as string,
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

  // replace filteredAdvisor to use User fields and isActive
  const filteredAdvisor = useMemo(() => {
    return Advisor.filter((s) => {
      const name = (
        s.fullName ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`
      ).toLowerCase();
      const matchesSearch =
        name.includes(searchTerm.toLowerCase()) ||
        (s.email ?? "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active"
          ? s.isActive === true
          : s.isActive === false);
      return matchesSearch && matchesStatus;
    });
  }, [Advisor, searchTerm, statusFilter]);

  const columns = useMemo<ColumnDef<User, any>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "User",
        cell: (info) => (
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 ring-2 ring-border shadow-sm">
              <AvatarImage
                src={
                  info.row.original.imageUrl ||
                  "/placeholder.svg?height=48&width=48" ||
                  "/placeholder.svg"
                }
              />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                {info.row.original.firstName?.[0]}
                {info.row.original.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground truncate">
                {info.getValue<string>()}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                @{info.row.original.userName}
              </p>
              <p className="text-xs text-muted-foreground/80 truncate">
                {info.row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: (info) => {
          const active = info.getValue<boolean>() === true;
          return (
            <Badge
              variant="secondary"
              className={
                active
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
              }
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  active ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              {active ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "roles",
        header: "Roles",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.isAdmin && (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200"
              >
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            )}
            {row.original.isAdvisor && (
              <Badge
                variant="outline"
                className="bg-purple-50 text-purple-700 border-purple-200"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Advisor
              </Badge>
            )}
            {row.original.isStudent && (
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                <UserIcon className="w-3 h-3 mr-1" />
                Student
              </Badge>
            )}
            {row.original.isUser &&
              !row.original.isAdmin &&
              !row.original.isAdvisor &&
              !row.original.isStudent && (
                <Badge
                  variant="outline"
                  className="bg-muted text-muted-foreground border-border"
                >
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
        cell: (info) => (
          <div className="text-sm text-muted-foreground">
            {info.getValue<string>() || "Not specified"}
          </div>
        ),
      },
      {
        accessorKey: "createDate",
        header: "Joined",
        cell: (info) => (
          <div className="text-sm text-muted-foreground">
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
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-card/90 shadow-sm w-48"
            >
              <DropdownMenuItem
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  setSelectedStudent(row.original as unknown as User);
                  setViewOpen(true);
                }}
                // mark the menu item so the row click handler can ignore clicks inside it
                data-ignore-row-click
              >
                <Eye className="w-3.5 h-3.5 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  // Populate edit form using known user fields (include new fields)
                  setSelectedStudent(row.original as unknown as User);
                  setCurrentId(row.original.uuid);
                  setEditFormData({
                    userName: row.original.userName,
                    gender: row.original.gender || "",
                    email: row.original.email,
                    fullName:
                      row.original.fullName ??
                      `${row.original.firstName ?? ""} ${
                        row.original.lastName ?? ""
                      }`.trim(),
                    firstName: row.original.firstName ?? "",
                    lastName: row.original.lastName ?? "",
                    status: row.original.isActive ?? false,
                    // new fields: try to read from user object if present
                    experienceYears:
                      (row.original as any).experienceYears ?? "",
                    linkedinUrl: (row.original as any).linkedinUrl ?? "",
                    office: (row.original as any).office ?? "",
                    socialLinks: (row.original as any).socialLinks ?? "",
                    imageFile: null,
                    imagePreview: (row.original as any).imageUrl ?? "",
                    bio: row.original.bio || "",
                    address: row.original.address || "",
                    contactNumber: row.original.contactNumber || "",
                    telegramId: row.original.telegramId || "",
                    course: (row.original as any).university ?? "",
                    role: row.original.role ?? "Student",
                  } as any);
                  setEditOpen(true);
                }}
              >
                <Edit className="w-3.5 h-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  setSelectedStudent(row.original as unknown as User);
                  setPromoteOpen(true);
                }}
              >
                <Shield className="w-3.5 h-3.5 mr-2" />
                Manage Roles
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedStudent(row.original as unknown as User);
                  setDeleteOpen(true);
                  setCurrentId(row.original.uuid);
                }}
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
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

  const handleAddAdvisor = () => {
    // create via advisor API (createNewAdvisor expects RegisterRequest)
    (async () => {
      try {
        await createNewAdvisor({
          token: accessToken ?? "",
          user: {
            username: createFormData.username,
            email: createFormData.email,
            firstname: createFormData.firstname,
            lastname: createFormData.lastname,
            password: createFormData.password,
            confirmedPassword: createFormData.confirmedPassword,
          },
        }).unwrap();
        toast.success("Adviser created", {
          position: "top-left",
          autoClose: 2500,
          theme: "colored",
        });
        void refetchAdvisors?.();
      } catch (err) {
        console.error("Create adviser failed:", err);
        toast.error("Failed to create adviser", {
          position: "top-left",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        setCreateFormData({
          username: "",
          email: "",
          firstname: "",
          lastname: "",
          password: "",
          confirmedPassword: "",
        });
        setAddOpen(false);
      }
    })();
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(adviserSchema),
  });

  const handleEditAdvisor = async (formValues: Adviser) => {
    console.log("currentId :>> ", currentId);
    console.log("formValues :>> ", formValues);
    if (!selectedStudent) return;
    try {
      // upload image if provided (image state stored locally)
      let imageUrl: string | undefined = editFormData.imagePreview || undefined;
      if (editFormData.imageFile) {
        const fd = new FormData();
        fd.append("file", editFormData.imageFile);
        const mediaRes = await createMedia(fd).unwrap();
        imageUrl = (mediaRes as any).data?.uri ?? (mediaRes as any).data?.name;
      }

      // Build payload using the submitted form values (not the local controlled inputs)
      const updatePayload: Adviser = {
        experienceYears: formValues.experienceYears || 0,
        linkedinUrl: formValues.linkedinUrl || "", // Provide a default empty string
        office: formValues.office || "",
        socialLinks: formValues.socialLinks || "",
        status: formValues.status ?? "INACTIVE", // Default to "INACTIVE" if not provided
      };

      console.log('Advisor :>> ', Advisor);

      await updateAdvisor({
        uuid: selectedStudent.uuid,
        updateUser: updatePayload as Adviser,
        token: accessToken ?? "",
      }).unwrap();

      toast.success("Adviser updated", {
        position: "top-left",
        autoClose: 2500,
        theme: "colored",
      });
      void refetchAdvisors?.();
    } catch (err) {
      console.error("Update adviser failed:", err);
      toast.error("Failed to update adviser", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setEditOpen(false);
      if (editFormData.imageFile && editFormData.imagePreview) {
        URL.revokeObjectURL(editFormData.imagePreview);
      }
    }
  };

  const handleDeleteStudent = () => {
    if (!selectedStudent) return;
    (async () => {
      try {
        await deleteAdvisor({
          uuid: selectedStudent.uuid,
          token: accessToken ?? "",
        }).unwrap();
        toast.success("Adviser deleted", {
          position: "top-left",
          autoClose: 2500,
          theme: "colored",
        });
        void refetchAdvisors?.();
      } catch (err) {
        console.error("Delete adviser failed:", err);
        toast.error("Failed to delete adviser", {
          position: "top-left",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        setDeleteOpen(false);
      }
    })();
  };

  return (
    <>
      <ToastContainer />
      <div className="p-6 bg-card border-border shadow-sm transition-all duration-200 backdrop-blur-sm rounded-2xl">
        <div className="p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-dynamic2">
                Adviser Management
              </h2>
              <p className="text-sm text-dynamic">
                Manage and track adviser information
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search advisers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm"
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
                      <div className="space-y-2 relative">
                        <Label className="text-sm font-semibold text-dynamic ">
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={createFormData.password}
                            onChange={(e) =>
                              setCreateFormData({
                                ...createFormData,
                                password: e.target.value,
                              })
                            }
                            className="pr-10 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute inset-y-0 right-2 flex items-center text-slate-500"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 relative">
                        <Label className="text-sm font-semibold text-dynamic ">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Input
                            type={showConfirm ? "text" : "password"}
                            value={createFormData.confirmedPassword}
                            onChange={(e) =>
                              setCreateFormData({
                                ...createFormData,
                                confirmedPassword: e.target.value,
                              })
                            }
                            className="pr-10 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute inset-y-0 right-2 flex items-center text-slate-500"
                          >
                            {showConfirm ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
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
                      onClick={handleAddAdvisor}
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
            <tbody className="bg-card divide-y divide-border">
              {table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`hover:bg-muted/50 transition-colors cursor-pointer ${
                    index % 2 === 0 ? "bg-card" : "bg-muted/20"
                  }`}
                  onClick={(e) => {
                    // Prevent opening the view dialog when clicking controls (buttons/links/menus)
                    const target = e.target as HTMLElement;
                    if (
                      target.closest(
                        "button, a, [role='menu'], [data-ignore-row-click]"
                      )
                    )
                      return;
                    setSelectedStudent(row.original as unknown as User);
                    setViewOpen(true);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm"
                    >
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

        <div className="bg-card border-t border-border px-6 py-4">
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
            <div className="flex items-center gap-4">
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
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-0">
                  {[10, 20, 30].map((size) => (
                    <SelectItem
                      key={size}
                      value={size.toString()}
                      className="border-0 bg-white"
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
            className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card border-0"
            ref={dialogRef}
            tabIndex={-1}
          >
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
                  <Eye className="w-5 h-5" />
                </div>
                Adviser Details
              </DialogTitle>
            </DialogHeader>

            {selectedStudent && (
              <div className="space-y-6 py-2">
                {/* Hero card */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-800 dark:via-blue-900 dark:to-indigo-900">
                  <div className="relative p-6 flex items-start gap-4">
                    <Avatar className="w-16 h-16 rounded-xl border-4 border-white dark:border-slate-800 shadow-md">
                      <AvatarImage
                        src={selectedStudent.imageUrl || "/placeholder.svg"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-semibold">
                        {(
                          selectedStudent.fullName ??
                          `${selectedStudent.firstName ?? ""} ${
                            selectedStudent.lastName ?? ""
                          }`
                        )
                          .split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-foreground truncate">
                        {selectedStudent.fullName ||
                          selectedStudent.userName ||
                          "Unknown"}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {selectedStudent.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Username
                    </Label>
                    <p className="text-sm text-foreground mt-1">
                      {selectedStudent.userName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Email
                    </Label>
                    <p className="text-sm text-foreground mt-1">
                      {selectedStudent.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Role
                    </Label>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={
                          selectedStudent.isAdmin
                            ? "bg-red-50 text-red-700 border-red-200"
                            : selectedStudent.isAdvisor
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : selectedStudent.isStudent
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        }
                      >
                        {selectedStudent.isAdmin
                          ? "Admin"
                          : selectedStudent.isAdvisor
                          ? "Advisor"
                          : selectedStudent.isStudent
                          ? "Student"
                          : "User"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Status
                    </Label>
                    <Badge
                      variant="secondary"
                      className={`mt-1 ${
                        selectedStudent.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          selectedStudent.isActive
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }`}
                      />
                      {selectedStudent.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Created Date
                    </Label>
                    <p className="text-sm text-foreground mt-1">
                      {selectedStudent.createDate || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Updated Date
                    </Label>
                    <p className="text-sm text-foreground mt-1">
                      {selectedStudent.updateDate || "N/A"}
                    </p>
                  </div>
                  {selectedStudent.contactNumber && (
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Contact
                      </Label>
                      <p className="text-sm text-foreground mt-1">
                        {selectedStudent.contactNumber}
                      </p>
                    </div>
                  )}
                  {selectedStudent.address && (
                    <div className="sm:col-span-2">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Address
                      </Label>
                      <p className="text-sm text-foreground mt-1">
                        {selectedStudent.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                onClick={() => setViewOpen(false)}
                className="border-0 hover:bg-muted"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* //edit  */}

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-200" />
                Edit Adviser
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 ">
                    Experience (years)
                  </Label>
                  <input
                    {...register("experienceYears")}
                    className="w-full border-slate-300 rounded-lg px-3 py-2"
                    placeholder="e.g. 5"
                  />
                  {errors.experienceYears && (
                    <p className="text-red-500 text-xs">
                      {errors.experienceYears.message as unknown as string}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 ">
                    LinkedIn
                  </Label>
                  <input
                    {...register("linkedinUrl")}
                    className="w-full border-slate-300 rounded-lg px-3 py-2"
                    placeholder="https://linkedin.com/..."
                  />
                  {errors.linkedinUrl && (
                    <p className="text-red-500 text-xs">
                      {errors.linkedinUrl.message as unknown as string}
                    </p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Status
                  </Label>
                  <Select
                    value={editFormData.status ? "true" : "false"}
                    onValueChange={(v) => {
                      // update both react-hook-form and local state so UI stays in sync
                      setEditFormData({
                        ...editFormData,
                        status: v === "true",
                      });
                      // form expects "ACTIVE" | "INACTIVE" | undefined, map boolean to those values
                      setValue("status", v === "true" ? "ACTIVE" : "INACTIVE");
                    }}
                  >
                    <SelectTrigger className="w-full h-10 border-slate-300 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-0">
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 ">
                    Office
                  </Label>
                  <Input
                    {...register("office")}
                    value={editFormData.office}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        office: e.target.value,
                      })
                    }
                    className="border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Social Links
                </Label>
                <Input
                  {...register("socialLinks")}
                  value={editFormData.socialLinks}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      socialLinks: e.target.value,
                    })
                  }
                  className="border-slate-300 rounded-lg"
                  placeholder="https://twitter.com/..."
                />
                {errors.socialLinks && (
                  <p className="text-red-500 text-xs">
                    {errors.socialLinks.message as unknown as string}
                  </p>
                )}
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
                onClick={handleSubmit(handleEditAdvisor)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="sm:max-w-md  hover:shadow-md  hover:bg-card/80  p-6 bg-card border-border shadow-sm  transition-all duration-200 backdrop-blur-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-dynamic2">
                Delete Adviser
              </DialogTitle>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold">
                      {selectedStudent.fullName ?? selectedStudent.userName}
                    </span>
                    ? This action cannot be undone.
                  </p>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <Avatar className="w-12 h-12 ring-2 ring-slate-200 shadow-sm">
                    <AvatarImage
                      src={selectedStudent.imageUrl || "/placeholder.svg"}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                      {(selectedStudent.fullName ?? selectedStudent.userName)
                        .split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {selectedStudent.fullName ?? selectedStudent.userName}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {selectedStudent.email || "N/A"}
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
                Delete Adviser
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
