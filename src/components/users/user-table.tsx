"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EyeOff } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
import { Textarea } from "@/components/ui/textarea";
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
  Edit,
  Trash2,
  UserCog,
  Eye,
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
import {
  useCreateNewUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "@/lib/api/userSlice";
import {
  RegisterRequest,
  UpdateUserType,
  User,
} from "@/types/userType/userType";
import { useForm } from "react-hook-form";
import {
  AddUserFormData,
  addUserSchema,
  editUserSchema,
  EditUserSchema,
} from "./zodvalidation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export interface CreateUserData {
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  confirmedPassword: string;
}

export interface UpdateUserData {
  userName: string;
  gender: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  status: string;
  bio: string;
  address: string;
  contactNumber: string;
  telegramId: string;
  isActive: boolean;
}

export function UserTable({ allUsers }: { allUsers: User[] }) {
  // Use prop directly as source of truth
  const users = allUsers;
  console.log("users :>> ", users);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Inactive"
  >("All");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [currentId, setCurrentId] = useState<string>("");
  console.log("currentId :>> ", currentId);

  const [createFormData, setCreateFormData] = useState<CreateUserData>({
    username: "",
    email: "",
    firstname: "",
    lastname: "",
    password: "",
    confirmedPassword: "",
  });

  const [editFormData, setEditFormData] = useState<UpdateUserData>({
    userName: "",
    gender: "",
    email: "",
    fullName: "",
    firstName: "",
    lastName: "",
    status: "",
    bio: "",
    address: "",
    contactNumber: "",
    telegramId: "",
    isActive: true,
  });

  const filteredUsers = useMemo(
    () =>
      allUsers.filter((u) => {
        const matchesSearch =
          u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.userName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "All" ||
          (statusFilter === "Active" && u.isActive) ||
          (statusFilter === "Inactive" && !u.isActive);
        return matchesSearch && matchesStatus;
      }),
    [allUsers, searchTerm, statusFilter]
  );

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
        cell: (info) => (
          <Badge
            variant="secondary"
            className={
              info.getValue<boolean>() === true
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
            }
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                info.getValue<boolean>() === true
                  ? "bg-emerald-600 dark:bg-emerald-400"
                  : "bg-red-600 dark:bg-red-400"
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
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
              >
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            )}
            {row.original.isAdvisor && (
              <Badge
                variant="outline"
                className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Advisor
              </Badge>
            )}
            {row.original.isStudent && (
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
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
                  className="bg-muted text-muted-foreground border-border hover:bg-muted/80"
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
              className=" bg-card/90 shadow-sm hover:shadow-md transition-all duration-200  backdrop-blur-sm w-48 bg-popover border-border "
            >
              <DropdownMenuItem
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground text-xs text-foreground"
                onClick={() => {
                  setSelectedUser(row.original);
                  setViewOpen(true);
                  setCurrentId(row.original.uuid);
                }}
              >
                <Eye className="w-3.5 h-3.5 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  setSelectedUser(row.original);
                  setCurrentId(row.original.uuid);
                  setEditFormData({
                    userName: row.original.userName,
                    gender: row.original.gender || "",
                    email: row.original.email,
                    fullName: row.original.fullName,
                    firstName: row.original.firstName,
                    lastName: row.original.lastName,
                    status: row.original.status,
                    bio: row.original.bio || "",
                    address: row.original.address || "",
                    contactNumber: row.original.contactNumber || "",
                    telegramId: row.original.telegramId || "",
                    isActive: true,
                  });
                  setEditOpen(true);
                }}
              >
                <Edit className="w-3.5 h-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  setSelectedUser(row.original);
                  setPromoteOpen(true);
                }}
              >
                <UserCog className="w-3.5 h-3.5 mr-2" />
                Manage Roles
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedUser(row.original);
                  setDeleteOpen(true);
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

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createDate", desc: true }, // Sort by newest first
  ]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [token, setToken] = useState<string>("");

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  //checking session
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      setToken(session.accessToken);
    } else {
      setToken("");
    }
  }, [status, session]);
  //Register User with Zode using Reack Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
  });

  //RDk handdle for Create User
  const [createNewUser, { isLoading }] = useCreateNewUserMutation();
  //for Update User
  const [updateUser, { isLoading: updateIsLoading }] = useUpdateUserMutation();
  const [deletedUser, { isLoading: deleteIsLoading }] = useDeleteUserMutation();

  const onSubmit = async (createFormData: AddUserFormData) => {
    const createUser: RegisterRequest = {
      username: createFormData.username,
      email: createFormData.email,
      firstname: createFormData.firstname,
      lastname: createFormData.lastname,
      password: createFormData.password,
      confirmedPassword: createFormData.confirmedPassword,
    };

    console.log("createUser :>> ", createUser);

    try {
      const response = await createNewUser(createUser).unwrap(); // ✅ safe usage

      // ✅ show toast programmatically
      toast.success("User created successfully!", {
        position: "top-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });

      console.log("✅ User created successfully:", response);
    } catch {
      toast.error("Error creating user!", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
    }

    reset(); // ✅ make sure reset() is defined (probably from react-hook-form)
  };

  // Edite User configuration

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
    formState: { errors: editErrors },
    reset: resetEditForm,
  } = useForm<EditUserSchema>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      userName: selectedUser?.userName ?? "",
      gender:
        selectedUser?.gender === "Male" ||
        selectedUser?.gender === "Female" ||
        selectedUser?.gender === "Other"
          ? selectedUser.gender
          : "Other", // fallback
      email: selectedUser?.email ?? "",
      fullName: selectedUser?.fullName ?? "",
      firstName: selectedUser?.firstName ?? "",
      lastName: selectedUser?.lastName ?? "",
      isActive: selectedUser?.isActive ?? false,
      bio: selectedUser?.bio ?? "",
      address: selectedUser?.address ?? "",
      contactNumber: selectedUser?.contactNumber ?? "",
      telegramId: selectedUser?.telegramId ?? "",
    },
  });

  // ✅ Update form whenever selectedUser changes

  useEffect(() => {
    if (selectedUser) {
      resetEditForm({
        userName: selectedUser.userName ?? "",
        gender:
          selectedUser.gender === "Male" ||
          selectedUser.gender === "Female" ||
          selectedUser.gender === "Other"
            ? (selectedUser.gender as "Male" | "Female" | "Other")
            : "Other",
        email: selectedUser.email ?? "",
        fullName: selectedUser.fullName ?? "",
        firstName: selectedUser.firstName ?? "",
        lastName: selectedUser.lastName ?? "",
        isActive: selectedUser.isActive ?? false,
        bio: selectedUser.bio ?? "",
        address: selectedUser.address ?? "",
        contactNumber: selectedUser.contactNumber ?? "",
        telegramId: selectedUser.telegramId ?? "",
      });
    }
  }, [selectedUser, resetEditForm]);

  const handleEditUser = async (data: EditUserSchema) => {
    if (!selectedUser) return;

    // Correctly map isActive to status
    const status = data.isActive ? "Active" : "Inactive";

    const updateUserPayload: UpdateUserType = {
      userName: data.userName,
      gender: data.gender,
      email: data.email,
      fullName: data.fullName,
      firstName: data.firstName,
      lastName: data.lastName,
      status: status, // Correctly set status based on isActive
      bio: data.bio ?? "",
      address: data.address ?? "",
      contactNumber: data.contactNumber ?? "",
      telegramId: data.telegramId ?? "",
    };

    try {
      // Make the API call to update user
      await updateUser({
        uuid: selectedUser.uuid,
        updateUser: updateUserPayload,
        token,
      }).unwrap();

      toast.success("User updated successfully!", {
        position: "top-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      setEditOpen(false);
    } catch (error: unknown) {
      // Check if it's a duplicate contact number error
      const errorData = error as {
        data?: { detail?: string };
        message?: string;
      };
      const errorMessage = errorData?.data?.detail || errorData?.message || "";
      const isDuplicateContactNumber =
        errorMessage.includes("duplicate key") &&
        errorMessage.includes("contact_number");

      if (isDuplicateContactNumber) {
        // Extract the contact number from the error message if possible
        const contactMatch = errorMessage.match(
          /\(contact_number\)=\(([^)]+)\)/
        );
        const contactNumber = contactMatch
          ? contactMatch[1]
          : updateUserPayload.contactNumber;

        toast.error(
          `Contact number "${contactNumber}" is already in use by another user. Please use a different contact number.`,
          {
            position: "top-left",
            autoClose: 5000,
            theme: "colored",
          }
        );
      } else {
        toast.error("Error updating user! Please try again.", {
          position: "top-left",
          autoClose: 3000,
          theme: "colored",
        });
      }
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    console.log("selectedUser :>> ", selectedUser);

    try {
      await deletedUser({ uuid: selectedUser.uuid, token: token }); // unwrap() throws if error

      toast.success("User deleted successfully!", {
        position: "top-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      setDeleteOpen(false);
    } catch {
      toast.error("Error deleting user!", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  const handlePromoteUser = (
    roleType: "isAdmin" | "isAdvisor" | "isStudent",
    value: boolean
  ) => {
    if (!selectedUser) return;
    // Note: This function updates local UI state optimistically
    // In a full implementation, this should call an API mutation
    // For now, we just close the dialog
    // TODO: Implement role update API mutation
    setPromoteOpen(false);
  };

  //checking with session
  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") return <p>Please login</p>;

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      {/* Header */}
      <ToastContainer />

      <div className="bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-6 h-6 text-dynamic" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              User Management
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage and track user information
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-input focus:border-ring focus:ring-ring bg-background shadow-sm"
            />
          </div>
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-background border-border hover:bg-muted"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {statusFilter} <ChevronDown className="ml-2 w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40 bg-card shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm border-border">
                <DropdownMenuItem onClick={() => setStatusFilter("All")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Active")}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Inactive")}>
                  Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-sm">
                  <Plus className="w-4 h-4 mr-2 " /> Add User
                </Button>
              </DialogTrigger>

              <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
                <DialogHeader className="space-y-3 pb-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <UserIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-bold text-dynamic">
                        Add New User
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Fill in the information below to create a new user
                        account
                      </p>
                    </div>
                  </div>
                </DialogHeader>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6 py-6"
                >
                  {/* Personal Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-dynamic uppercase tracking-wide flex items-center gap-2">
                      <div className="h-px flex-1 bg-border" />
                      <span>Personal Information</span>
                      <div className="h-px flex-1 bg-border" />
                    </h3>

                    {/* First and Last Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-dynamic2 font-medium flex items-center gap-1">
                          First Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          {...register("firstname")}
                          placeholder="Enter first name"
                          className="h-11 bg-background border-input focus:border-ring focus:ring-ring/20 focus:ring-2 transition-all"
                        />
                        {errors.firstname && (
                          <p className="text-destructive text-xs flex items-center gap-1 mt-1">
                            <span className="font-medium">⚠</span>{" "}
                            {errors.firstname.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-dynamic2 font-medium flex items-center gap-1">
                          Last Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          {...register("lastname")}
                          placeholder="Enter last name"
                          className="h-11 bg-background border-input focus:border-ring focus:ring-ring/20 focus:ring-2 transition-all"
                        />
                        {errors.lastname && (
                          <p className="text-destructive text-xs flex items-center gap-1 mt-1">
                            <span className="font-medium">⚠</span>{" "}
                            {errors.lastname.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-dynamic uppercase tracking-wide flex items-center gap-2">
                      <div className="h-px flex-1 bg-border" />
                      <span>Account Information</span>
                      <div className="h-px flex-1 bg-border" />
                    </h3>

                    {/* Username */}
                    <div className="space-y-2">
                      <Label className="text-dynamic2 font-medium flex items-center gap-1">
                        Username <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        {...register("username")}
                        placeholder="Choose a unique username"
                        className="h-11 bg-background border-input focus:border-ring focus:ring-ring/20 focus:ring-2 transition-all"
                      />
                      {errors.username && (
                        <p className="text-destructive text-xs flex items-center gap-1 mt-1">
                          <span className="font-medium">⚠</span>{" "}
                          {errors.username.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label className="text-dynamic2 font-medium flex items-center gap-1">
                        Email Address{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="email"
                        {...register("email")}
                        placeholder="user@example.com"
                        className="h-11 bg-background border-input focus:border-ring focus:ring-ring/20 focus:ring-2 transition-all"
                      />
                      {errors.email && (
                        <p className="text-destructive text-xs flex items-center gap-1 mt-1">
                          <span className="font-medium">⚠</span>{" "}
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Security Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-dynamic uppercase tracking-wide flex items-center gap-2">
                      <div className="h-px flex-1 bg-border" />
                      <span>Security</span>
                      <div className="h-px flex-1 bg-border" />
                    </h3>

                    {/* Passwords */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Password */}
                      <div className="space-y-2">
                        <Label className="text-dynamic2 font-medium flex items-center gap-1">
                          Password <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            placeholder="Enter secure password"
                            className="h-11 bg-background border-input focus:border-ring focus:ring-ring/20 focus:ring-2 transition-all pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-dynamic2 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-destructive text-xs flex items-center gap-1 mt-1">
                            <span className="font-medium">⚠</span>{" "}
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <Label className="text-dynamic2 font-medium flex items-center gap-1">
                          Confirm Password{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            type={showConfirm ? "text" : "password"}
                            {...register("confirmedPassword")}
                            placeholder="Confirm your password"
                            className="h-11 bg-background border-input focus:border-ring focus:ring-ring/20 focus:ring-2 transition-all pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((prev) => !prev)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-dynamic2 transition-colors"
                          >
                            {showConfirm ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {errors.confirmedPassword && (
                          <p className="text-destructive text-xs flex items-center gap-1 mt-1">
                            <span className="font-medium">⚠</span>{" "}
                            {errors.confirmedPassword.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <DialogFooter className="pt-6 border-t border-border gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddOpen(false)}
                      className="min-w-[120px] h-11"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="min-w-[120px] h-11 bg-primary hover:bg-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add User
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Table */}
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
                className={`hover:bg-muted/50 transition-colors ${
                  index % 2 === 0 ? "bg-card" : "bg-muted/20"
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

      {/* Pagination */}
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
              filteredUsers.length
            )}{" "}
            of {filteredUsers.length} users
          </span>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Rows per page:
            </span>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger className="w-20 h-8 border-input bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-input">
                {[5, 10, 20, 30].map((size) => (
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
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-6 bg-card border-border shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-primary2">
              Manage User Roles
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-popover-foreground">
                  <span className="font-semibold text-foreground">
                    {selectedUser.fullName}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  @{selectedUser.userName}
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-popover-foreground">
                    Admin Role
                  </Label>
                  <Button
                    variant={selectedUser.isAdmin ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      handlePromoteUser("isAdmin", !selectedUser.isAdmin)
                    }
                    className={
                      selectedUser.isAdmin
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "border-border hover:bg-muted"
                    }
                  >
                    {selectedUser.isAdmin ? "Remove" : "Grant"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-popover-foreground">
                    Advisor Role
                  </Label>
                  <Button
                    variant={selectedUser.isAdvisor ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      handlePromoteUser("isAdvisor", !selectedUser.isAdvisor)
                    }
                    className={
                      selectedUser.isAdvisor
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "border-border hover:bg-muted"
                    }
                  >
                    {selectedUser.isAdvisor ? "Remove" : "Grant"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-popover-foreground">
                    Student Role
                  </Label>
                  <Button
                    variant={selectedUser.isStudent ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      handlePromoteUser("isStudent", !selectedUser.isStudent)
                    }
                    className={
                      selectedUser.isStudent
                        ? "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700"
                        : "border-border hover:bg-muted"
                    }
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
              className="border-border hover:bg-muted"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader className="space-y-3 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-secondary/10">
                <Edit className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-dynamic">
                  Edit User
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Update user information and account settings
                </p>
              </div>
            </div>
          </DialogHeader>

          {selectedUser && (
            <form
              onSubmit={handleEditSubmit(handleEditUser)}
              className="space-y-6 py-6"
            >
              {/* Account Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-dynamic uppercase tracking-wide flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span>Account Information</span>
                  <div className="h-px flex-1 bg-border" />
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Username */}
                  <div className="space-y-2">
                    <Label className="text-dynamic2 font-medium">
                      Username
                    </Label>
                    <Input
                      {...registerEdit("userName")}
                      className="h-11 bg-background border-input focus:border-ring focus:ring-ring/20 focus:ring-2 transition-all"
                    />
                    {editErrors.userName && (
                      <p className="text-destructive text-xs flex items-center gap-1">
                        <span className="font-medium">⚠</span>{" "}
                        {editErrors.userName.message}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label className="text-dynamic2 font-medium">Gender</Label>
                    <Select
                      onValueChange={(v) =>
                        setEditValue("gender", v as "Male" | "Female" | "Other")
                      }
                    >
                      <SelectTrigger className="h-11 bg-background border-input">
                        <SelectValue
                          placeholder={selectedUser.gender || "Select gender"}
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-input">
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {editErrors.gender && (
                      <p className="text-destructive text-xs flex items-center gap-1">
                        <span className="font-medium">⚠</span>{" "}
                        {editErrors.gender.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-dynamic2 font-medium">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    {...registerEdit("email")}
                    className="h-11 bg-background border-input focus:border-ring focus:ring-ring/20 focus:ring-2 transition-all"
                  />
                  {editErrors.email && (
                    <p className="text-destructive text-xs flex items-center gap-1">
                      <span className="font-medium">⚠</span>{" "}
                      {editErrors.email.message}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-dynamic2 font-medium">
                    Account Status
                  </Label>
                  <Select
                    onValueChange={(v) =>
                      setEditValue("isActive", v === "true")
                    }
                  >
                    <SelectTrigger className="h-11 bg-background border-input">
                      <SelectValue
                        placeholder={
                          selectedUser.isActive ? "Active" : "Inactive"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-input">
                      <SelectItem value="true">✅ Active</SelectItem>
                      <SelectItem value="false">❌ Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-dynamic uppercase tracking-wide flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span>Personal Information</span>
                  <div className="h-px flex-1 bg-border" />
                </h3>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label className="text-dynamic2 font-medium">Full Name</Label>
                  <Input
                    {...registerEdit("fullName")}
                    placeholder="Enter full name"
                    className="h-11 bg-background border-input focus:border-ring focus:ring-ring/20 focus:ring-2 transition-all"
                  />
                </div>

                {/* First and Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-dynamic2 font-medium">
                      First Name
                    </Label>
                    <Input
                      {...registerEdit("firstName")}
                      placeholder="Enter first name"
                      className="h-11 bg-background border-input focus:border-ring focus:ring-ring/20 focus:ring-2 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-dynamic2 font-medium">
                      Last Name
                    </Label>
                    <Input
                      {...registerEdit("lastName")}
                      placeholder="Enter last name"
                      className="h-11 bg-background border-input focus:border-ring focus:ring-ring/20 focus:ring-2 transition-all"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label className="text-dynamic2 font-medium">Bio</Label>
                  <Textarea
                    {...registerEdit("bio")}
                    placeholder="Write a brief bio..."
                    className="min-h-[100px] bg-background border-input focus:border-ring focus:ring-ring/20 focus:ring-2 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-dynamic uppercase tracking-wide flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span>Contact Information</span>
                  <div className="h-px flex-1 bg-border" />
                </h3>

                {/* Address */}
                <div className="space-y-2">
                  <Label className="text-dynamic2 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <Input
                    {...registerEdit("address")}
                    placeholder="Enter full address"
                    className="h-11 bg-background border-input focus:border-ring focus:ring-ring/20 focus:ring-2 transition-all"
                  />
                </div>

                {/* Contact + Telegram */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-dynamic2 font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact Number
                    </Label>
                    <Input
                      {...registerEdit("contactNumber")}
                      placeholder="+855 12 345 678"
                      className="h-11 bg-background border-input focus:border-ring focus:ring-ring/20 focus:ring-2 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-dynamic2 font-medium flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Telegram ID
                    </Label>
                    <Input
                      {...registerEdit("telegramId")}
                      placeholder="@username"
                      className="h-11 bg-background border-input focus:border-ring focus:ring-ring/20 focus:ring-2 transition-all"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-6 border-t border-border gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  className="min-w-[120px] h-11"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="min-w-[120px] h-11 bg-secondary hover:bg-secondary/90"
                  disabled={updateIsLoading}
                >
                  {updateIsLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-6 bg-card border-border shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-popover-foreground">
              Delete User
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <p className="text-popover-foreground">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  {selectedUser.fullName}
                </span>
                ?
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="border-border hover:bg-muted"
              disabled={deleteIsLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteUser}
              className="hover:bg-destructive/90 bg-red-500"
              disabled={deleteIsLoading}
            >
              {deleteIsLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader className="pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 dark:bg-blue-400/10">
                <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                User Details
              </DialogTitle>
            </div>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 py-6">
              {/* Hero Card */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-800 dark:via-blue-900 dark:to-indigo-900 p-6 border border-border">
                <div className="relative flex items-center gap-4">
                  <Avatar className="w-20 h-20 ring-4 ring-white dark:ring-slate-800 shadow-lg">
                    <AvatarImage
                      src={
                        selectedUser.imageUrl ||
                        "/placeholder.svg?height=80&width=80"
                      }
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-2xl">
                      {selectedUser.firstName?.[0]}
                      {selectedUser.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-foreground truncate">
                      {selectedUser.fullName}
                    </h3>
                    <p className="text-muted-foreground font-medium mt-1">
                      @{selectedUser.userName}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {selectedUser.email}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${
                      selectedUser.isActive
                        ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-700"
                        : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700"
                    } px-4 py-1.5 text-sm font-semibold shadow-sm border`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        selectedUser.isActive ? "bg-emerald-700" : "bg-red-700"
                      } animate-pulse`}
                    />
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Roles Card */}
              <div className="bg-muted/30 dark:bg-muted/10 rounded-xl p-5 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-foreground text-lg">
                    User Roles
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.isAdmin && (
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800 px-3 py-1.5 text-sm font-medium"
                    >
                      <Shield className="w-4 h-4 mr-1.5" />
                      Admin
                    </Badge>
                  )}
                  {selectedUser.isAdvisor && (
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800 px-3 py-1.5 text-sm font-medium"
                    >
                      <TrendingUp className="w-4 h-4 mr-1.5" />
                      Advisor
                    </Badge>
                  )}
                  {selectedUser.isStudent && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 px-3 py-1.5 text-sm font-medium"
                    >
                      <UserIcon className="w-4 h-4 mr-1.5" />
                      Student
                    </Badge>
                  )}
                  {selectedUser.isUser &&
                    !selectedUser.isAdmin &&
                    !selectedUser.isAdvisor &&
                    !selectedUser.isStudent && (
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
                      {selectedUser.gender || "Not specified"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Joined Date
                    </Label>
                    <p className="text-sm font-medium text-foreground">
                      {selectedUser.createDate}
                    </p>
                  </div>
                </div>
                {selectedUser.bio && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Bio
                    </Label>
                    <p className="text-sm text-foreground mt-2 leading-relaxed">
                      {selectedUser.bio}
                    </p>
                  </div>
                )}
              </div>

              {/* Contact Information Card */}
              {(selectedUser.address ||
                selectedUser.contactNumber ||
                selectedUser.telegramId) && (
                <div className="bg-muted/30 dark:bg-muted/10 rounded-xl p-5 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Phone className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-foreground text-lg">
                      Contact Information
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {selectedUser.address && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                        <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Address
                          </Label>
                          <p className="text-sm font-medium text-foreground mt-1">
                            {selectedUser.address}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedUser.contactNumber && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                        <Phone className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Phone Number
                          </Label>
                          <p className="text-sm font-medium text-foreground mt-1">
                            {selectedUser.contactNumber}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedUser.telegramId && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                        <MessageCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Telegram
                          </Label>
                          <p className="text-sm font-medium text-foreground mt-1">
                            {selectedUser.telegramId}
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
                  <TrendingUp className="w-5 h-5 text-primary" />
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
                      {selectedUser.createDate}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Last Updated
                    </Label>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {selectedUser.updateDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-6 border-t border-border gap-3">
            <Link href={`/users/${currentId}`}>
              <Button
                variant="outline"
                className="border-input hover:bg-accent transition-colors"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                View Full Profile
              </Button>
            </Link>
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
    </div>
  );
}
