"use client";
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
  Mail,
  AlertTriangle,
  CheckCircle,
  Info,
  Briefcase,
  Phone,
  MapPin,
  MessageCircle,
  Calendar,
  Loader2,
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
// Extended User type with optional adviser properties
interface UserWithAdviserFields extends User {
  experienceYears?: number;
  linkedinUrl?: string;
  office?: string;
  socialLinks?: string;
  university?: string;
}

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
  const [updateAdvisor, { isLoading: updating }] = useUpdateAdvisorMutation();
  const [deleteAdvisor, { isLoading: deleting }] = useDeleteAdvisorMutation();
  // media upload mutation
  const [createMedia] = useCreateMediaMutation();

  // Use fetched advisors as source of truth, fallback to prop
  const Advisor = fetchedAdvisors?.content || advisers?.content || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Inactive"
  >("All");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createDate", desc: true }, // Sort by newest first
  ]);
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

  const columns = useMemo<ColumnDef<User, unknown>[]>(
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
                  active
                    ? "bg-emerald-600 dark:bg-emerald-400"
                    : "bg-red-600 dark:bg-red-400"
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
                  const userWithFields = row.original as UserWithAdviserFields;
                  setSelectedStudent(row.original as unknown as User);
                  setCurrentId(row.original.uuid);

                  const expYears = userWithFields.experienceYears ?? "";
                  const linkedin = userWithFields.linkedinUrl ?? "";
                  const officeVal = userWithFields.office ?? "";
                  const socialLinksVal = userWithFields.socialLinks ?? "";
                  const statusVal = row.original.isActive ?? false;

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
                    status: statusVal,
                    // new fields: try to read from user object if present
                    experienceYears: String(expYears),
                    linkedinUrl: linkedin,
                    office: officeVal,
                    socialLinks: socialLinksVal,
                    imageFile: null,
                    imagePreview: userWithFields.imageUrl ?? "",
                    bio: row.original.bio || "",
                    address: row.original.address || "",
                    contactNumber: row.original.contactNumber || "",
                    telegramId: row.original.telegramId || "",
                    course: userWithFields.university ?? "",
                    role: (row.original.role === "Advisor"
                      ? "Adviser"
                      : row.original.role) as "Student" | "User" | "Adviser",
                  });

                  // Pre-populate form fields using react-hook-form setValue
                  setValue(
                    "experienceYears",
                    expYears ? String(expYears) : "0"
                  );
                  setValue("linkedinUrl", linkedin);
                  setValue("office", officeVal);
                  setValue("socialLinks", socialLinksVal);
                  setValue("status", statusVal ? "ACTIVE" : "INACTIVE");

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
        const mediaData = (
          mediaRes as { data?: { uri?: string; name?: string } }
        ).data;
        imageUrl = mediaData?.uri ?? mediaData?.name;
      }

      // Build payload using the submitted form values (not the local controlled inputs)
      const updatePayload: Adviser = {
        experienceYears: formValues.experienceYears || 0,
        linkedinUrl: formValues.linkedinUrl || "", // Provide a default empty string
        office: formValues.office || "",
        socialLinks: formValues.socialLinks || "",
        status: formValues.status ?? "INACTIVE", // Default to "INACTIVE" if not provided
      };

      console.log("Advisor :>> ", Advisor);

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
                className="pl-10 border-input focus:border-ring focus:ring-ring bg-background shadow-sm transition-all"
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
                  <Button className="shadow-sm">
                    <Plus className="w-4 h-4 mr-2" /> Add Adviser
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border"
                  ref={dialogRef}
                  tabIndex={-1}
                >
                  <DialogHeader className="space-y-3 pb-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-purple-500/10 dark:bg-purple-400/10">
                        <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <DialogTitle className="text-2xl font-bold text-foreground">
                          Add New Adviser
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Fill in the information below to create a new adviser
                          account
                        </p>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="space-y-6 py-6">
                    {/* Personal Information Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2">
                        <div className="h-px flex-1 bg-border"></div>
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                          Personal Information
                        </h3>
                        <div className="h-px flex-1 bg-border"></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                            First Name
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            value={createFormData.firstname}
                            onChange={(e) =>
                              setCreateFormData({
                                ...createFormData,
                                firstname: e.target.value,
                              })
                            }
                            placeholder="Enter first name"
                            className="bg-background border-input text-foreground focus:border-ring focus:ring-ring transition-colors"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                            Last Name
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            value={createFormData.lastname}
                            onChange={(e) =>
                              setCreateFormData({
                                ...createFormData,
                                lastname: e.target.value,
                              })
                            }
                            placeholder="Enter last name"
                            className="bg-background border-input text-foreground focus:border-ring focus:ring-ring transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Account Information Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2">
                        <div className="h-px flex-1 bg-border"></div>
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                          Account Information
                        </h3>
                        <div className="h-px flex-1 bg-border"></div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                            Username
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            value={createFormData.username}
                            onChange={(e) =>
                              setCreateFormData({
                                ...createFormData,
                                username: e.target.value,
                              })
                            }
                            placeholder="Choose a unique username"
                            className="bg-background border-input text-foreground focus:border-ring focus:ring-ring transition-colors"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            Email Address
                            <span className="text-destructive">*</span>
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
                            placeholder="adviser@example.com"
                            className="bg-background border-input text-foreground focus:border-ring focus:ring-ring transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Security Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2">
                        <div className="h-px flex-1 bg-border"></div>
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                          Security
                        </h3>
                        <div className="h-px flex-1 bg-border"></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            Password
                            <span className="text-destructive">*</span>
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
                              placeholder="Enter secure password"
                              className="bg-background border-input text-foreground focus:border-ring focus:ring-ring pr-10 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            Confirm Password
                            <span className="text-destructive">*</span>
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
                              placeholder="Confirm password"
                              className="bg-background border-input text-foreground focus:border-ring focus:ring-ring pr-10 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm((v) => !v)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showConfirm ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="pt-6 border-t border-border gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddOpen(false)}
                      className="min-w-[120px] border-input hover:bg-accent transition-colors"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddAdvisor}
                      disabled={creating}
                      className="min-w-[120px] bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white transition-colors"
                    >
                      {creating ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin">⏳</span>
                          Adding...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add Adviser
                        </span>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:bg-muted/80 transition-colors"
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
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
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

        <div className="bg-muted/30 border-t border-border px-6 py-4 sm:flex flex-col items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="border-border hover:bg-muted hover:text-muted-foreground"
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-border hover:bg-muted hover:text-muted-foreground"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-border hover:bg-muted hover:text-muted-foreground"
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="border-border hover:bg-muted hover:text-muted-foreground"
            >
              Last
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
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
              <SelectTrigger className="w-32 h-8 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {[10, 20, 30].map((size) => (
                  <SelectItem
                    key={size}
                    value={size.toString()}
                    className="text-foreground"
                  >
                    Show {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Dialog */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent
            className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border"
            ref={dialogRef}
            tabIndex={-1}
          >
            <DialogHeader className="pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-500/10 dark:bg-purple-400/10">
                  <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  Adviser Details
                </DialogTitle>
              </div>
            </DialogHeader>

            {selectedStudent && (
              <div className="space-y-6 py-6">
                {/* Hero Card */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-800 dark:via-purple-900 dark:to-indigo-900 p-6 border border-border">
                  <div className="relative flex items-center gap-4">
                    <Avatar className="w-20 h-20 ring-4 ring-white dark:ring-slate-800 shadow-lg">
                      <AvatarImage
                        src={
                          selectedStudent.imageUrl ||
                          "/placeholder.svg?height=80&width=80"
                        }
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-2xl">
                        {(
                          selectedStudent.fullName ??
                          `${selectedStudent.firstName ?? ""} ${
                            selectedStudent.lastName ?? ""
                          }`
                        )
                          .split(" ")
                          .map((n) => n[0])
                          .join("") || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-bold text-foreground truncate">
                        {selectedStudent.fullName ||
                          selectedStudent.userName ||
                          "Unknown Adviser"}
                      </h3>
                      <p className="text-muted-foreground font-medium mt-1">
                        @{selectedStudent.userName || "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {selectedStudent.email || "N/A"}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${
                        selectedStudent.isActive
                          ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-700"
                          : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700"
                      } px-4 py-1.5 text-sm font-semibold shadow-sm border`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          selectedStudent.isActive
                            ? "bg-emerald-700"
                            : "bg-red-700"
                        } animate-pulse`}
                      />
                      {selectedStudent.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                {/* Roles Card */}
                <div className="bg-muted/30 dark:bg-muted/10 rounded-xl p-5 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-foreground text-lg">
                      Adviser Roles
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.isAdmin && (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800 px-3 py-1.5 text-sm font-medium"
                      >
                        <Shield className="w-4 h-4 mr-1.5" />
                        Admin
                      </Badge>
                    )}
                    {selectedStudent.isAdvisor && (
                      <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800 px-3 py-1.5 text-sm font-medium"
                      >
                        <TrendingUp className="w-4 h-4 mr-1.5" />
                        Advisor
                      </Badge>
                    )}
                    {selectedStudent.isStudent && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 px-3 py-1.5 text-sm font-medium"
                      >
                        <UserIcon className="w-4 h-4 mr-1.5" />
                        Student
                      </Badge>
                    )}
                    {selectedStudent.isUser &&
                      !selectedStudent.isAdmin &&
                      !selectedStudent.isAdvisor &&
                      !selectedStudent.isStudent && (
                        <Badge
                          variant="outline"
                          className="bg-muted text-muted-foreground border-border px-3 py-1.5 text-sm font-medium"
                        >
                          <UserIcon className="w-4 h-4 mr-1.5" />
                          User
                        </Badge>
                      )}
                  </div>
                </div>

                {/* Personal Information Card */}
                <div className="bg-muted/30 dark:bg-muted/10 rounded-xl p-5 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <UserIcon className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-foreground text-lg">
                      Personal Information
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Gender
                      </Label>
                      <p className="text-sm font-medium text-foreground">
                        {selectedStudent.gender || "Not specified"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Joined Date
                      </Label>
                      <p className="text-sm font-medium text-foreground">
                        {selectedStudent.createDate || "N/A"}
                      </p>
                    </div>
                  </div>
                  {selectedStudent.bio && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Bio
                      </Label>
                      <p className="text-sm text-foreground mt-2 leading-relaxed">
                        {selectedStudent.bio}
                      </p>
                    </div>
                  )}
                </div>

                {/* Contact Information Card */}
                {(selectedStudent.address ||
                  selectedStudent.contactNumber ||
                  selectedStudent.telegramId) && (
                  <div className="bg-muted/30 dark:bg-muted/10 rounded-xl p-5 border border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <Phone className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold text-foreground text-lg">
                        Contact Information
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {selectedStudent.address && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                          <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Address
                            </Label>
                            <p className="text-sm font-medium text-foreground mt-1">
                              {selectedStudent.address}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedStudent.contactNumber && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                          <Phone className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Phone Number
                            </Label>
                            <p className="text-sm font-medium text-foreground mt-1">
                              {selectedStudent.contactNumber}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedStudent.telegramId && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                          <MessageCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Telegram
                            </Label>
                            <p className="text-sm font-medium text-foreground mt-1">
                              {selectedStudent.telegramId}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Activity Timeline Card */}
                <div className="bg-muted/30 dark:bg-muted/10 rounded-xl p-5 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-foreground text-lg">
                      Activity Timeline
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-background/50">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Account Created
                      </Label>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {selectedStudent.createDate || "N/A"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Last Updated
                      </Label>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {selectedStudent.updateDate || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setViewOpen(false)}
                className="border-input hover:bg-accent transition-colors"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* //edit  */}

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
            <DialogHeader className="space-y-3 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#1951cc]/10 dark:bg-[#1951cc]/20">
                  <Edit className="w-6 h-6 text-[#1951cc] dark:text-[#2563eb]" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    Edit Adviser
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Update adviser professional information and contact details
                  </p>
                </div>
              </div>
            </DialogHeader>

            <form
              onSubmit={handleSubmit(handleEditAdvisor)}
              className="space-y-6 py-6"
            >
              {/* Professional Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2">
                  <div className="h-px flex-1 bg-border"></div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    Professional Information
                  </h3>
                  <div className="h-px flex-1 bg-border"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      Years of Experience
                    </Label>
                    <Input
                      {...register("experienceYears")}
                      type="number"
                      placeholder="e.g., 5"
                      className="bg-background border-input text-foreground focus:border-ring focus:ring-ring transition-colors"
                    />
                    {errors.experienceYears && (
                      <div className="flex items-center gap-1.5 text-destructive text-sm">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{errors.experienceYears.message as string}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      Office Location
                    </Label>
                    <Input
                      {...register("office")}
                      placeholder="e.g., Room 301, Building A"
                      className="bg-background border-input text-foreground focus:border-ring focus:ring-ring transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    Account Status
                  </Label>
                  <Select
                    value={editFormData.status ? "true" : "false"}
                    onValueChange={(v) => {
                      setEditFormData({
                        ...editFormData,
                        status: v === "true",
                      });
                      setValue("status", v === "true" ? "ACTIVE" : "INACTIVE");
                    }}
                  >
                    <SelectTrigger className="bg-background border-input text-foreground focus:border-ring focus:ring-ring transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="true" className="text-foreground">
                        Active
                      </SelectItem>
                      <SelectItem value="false" className="text-foreground">
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact & Social Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2">
                  <div className="h-px flex-1 bg-border"></div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    Contact & Social Links
                  </h3>
                  <div className="h-px flex-1 bg-border"></div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn Profile URL
                    </Label>
                    <Input
                      {...register("linkedinUrl")}
                      placeholder="https://linkedin.com/in/username"
                      className="bg-background border-input text-foreground focus:border-ring focus:ring-ring transition-colors"
                    />
                    {errors.linkedinUrl && (
                      <div className="flex items-center gap-1.5 text-destructive text-sm">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{errors.linkedinUrl.message as string}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      Other Social Links
                    </Label>
                    <Input
                      {...register("socialLinks")}
                      placeholder="https://twitter.com/username or other social media"
                      className="bg-background border-input text-foreground focus:border-ring focus:ring-ring transition-colors"
                    />
                    {errors.socialLinks && (
                      <div className="flex items-center gap-1.5 text-destructive text-sm">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{errors.socialLinks.message as string}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      You can add links to Twitter, GitHub, personal website,
                      etc.
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-6 border-t border-border gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  className="min-w-[120px] border-input hover:bg-accent transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="min-w-[120px] bg-[#1951cc] hover:bg-[#1648b3] dark:bg-[#2563eb] dark:hover:bg-[#1d4ed8] text-white transition-colors"
                  disabled={updating}
                >
                  {updating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Save Changes
                    </span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-6 bg-card border-border shadow-sm">
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
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteStudent}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleting}
              >
                {deleting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Adviser
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
