/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useRef } from "react";
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
  EyeOff,
  Eye,
  Shield,
  TrendingUp,
  UserIcon,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
  Row,
} from "@tanstack/react-table";
import { generateFakeStudents, type Student } from "./data";
import { RegisterRequest, User } from "@/types/userType/userType";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import Image from "next/image";
import {
  EditStudentFormData,
  editStudentSchema,
  StudentFormData,
  studentSchema,
} from "./zode";
import { ToastContainer, toast } from "react-toastify";
import { UpdateUserData } from "../users/user-table";
import { useSession } from "next-auth/react";
import {
  useCreateNewStudentMutation,
  useDeleteStudentMutation,
  useUpdateStudentMutation,
} from "@/lib/api/studentSlice";
import { redirect } from "next/navigation";
import { StudentUpdateType } from "@/types/studentType/studentType";

const courseOptions = [
  "BS Computer Science",
  "BS Information Technology",
  "BS Software Engineering",
  "BS Information Systems",
  "BS Data Science",
  "BS Cybersecurity",
];

const roleOptions = ["Student", "User", "Mentor"] as const;

export function StudentTable({
  allStudents,
}: {
  allStudents: User[] | undefined;
}) {
  console.log("allStudents :>> ", allStudents);
  const roleOptions = [
    "Student",
    "Mentor",
    "User",
    "Admin",
    "Advisor",
  ] as const;

  const [students, setStudents] = useState<User[]>(allStudents || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Inactive"
  >("All");

  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const handlePromoteUser = (
    roleType: "isAdmin" | "isAdvisor" | "isStudent",
    value: boolean
  ) => {
    if (!selectedUser) return;
    setStudents(
      students.map((u) =>
        u.uuid === selectedUser.uuid
          ? {
              ...u,
              [roleType]: value,
              updateDate: new Date().toISOString().split("T")[0],
            }
          : u
      )
    );
  };
  const [currentId, setCurrentId] = useState<string>("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [createFormData, setCreateFormData] = useState({
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

  //get session token
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken as string | undefined;
  // RDk for Create New Student
  const [createNewStudent, { isLoading: createIsLoading }] =
    useCreateNewStudentMutation();
  // RDk for Update Student
  const [updateStudent, { isLoading: updateIsLoading }] =
    useUpdateStudentMutation();
  // RDk for Delete Student
  const [deleteStudent, { isLoading: deleteIsLoading }] =
    useDeleteStudentMutation();

  // Image upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, statusFilter]);

  const handleViewClick = (row: Row<User>) => {
    setSelectedStudent(row.original); // Set selected student
    setViewOpen(true); // Open view details modal
  };

  const handleDeleteClick = (row: Row<User>) => {
    setSelectedStudent(row.original); // Set selected student
    setDeleteOpen(true); // Open delete confirmation
  };
  const handleConvertImage = () =>{
    
  } 

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
        accessorKey: "status",
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
                  ? "bg-emerald-500"
                  : "bg-red-500"
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
                  handleViewClick(row);
                  setSelectedUser(row.original);
                  setViewOpen(true);
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
                    isActive: row.original.isActive,
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
                <Shield className="w-3.5 h-3.5 mr-2" />
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

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data: filteredStudents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  //Add User

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(studentSchema),
  });
  const handleAddStudent = async (data: RegisterRequest) => {
    console.log("data :>> ", data);
    // Assuming you have a function to update the students list (e.g., setStudents)
    // Example: setStudents(prev => [...prev, newStudent]);

    // Clear the form fields

    try {
      const response = await createNewStudent({
        token: accessToken ?? "",
        user: data as RegisterRequest,
      }).unwrap();
      console.log("response :>> ", response);
      toast.success("Student created successfully!", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (error) {
      toast.error("Error creating student!", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
      console.error("error :>> ", error);
    }
    setValue("firstname", "");
    setValue("lastname", "");
    setValue("username", "");
    setValue("email", "");
    setValue("password", "");
    setValue("confirmedPassword", "");

    setAddOpen(false); // Close the dialog or form
  };

  const onSubmit = (data: RegisterRequest) => {
    handleAddStudent(data); // Call handleAddStudent with form data
  };

  //edite student

  const {
    register: editRegister,
    handleSubmit: editHandleSubmit,
    formState: { errors: editErrors },
    setValue: editSetValue,
  } = useForm<EditStudentFormData>({
    resolver: zodResolver(editStudentSchema), // Apply validation schema
  });
  // Form submission handler
  const handleEditStudent: SubmitHandler<EditStudentFormData> = async(data) => {
    console.log("Form Data:", data);
    console.log('currentId', currentId)

    // Submit logic: Save the student data, update state, etc.

    try {
      const response = await updateStudent({
        token: accessToken ?? "",
        updateUser:data as StudentUpdateType,
        uuid: currentId
      }).unwrap();
      console.log("response :>> ", response);
      toast.success("Student created successfully!", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (error) {
      toast.error("Error creating student!", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
      console.error("error :>> ", error);
    }

    setValue("firstname", "");
    setValue("lastname", "");
    setValue("username", "");
    setValue("email", "");
    setValue("password", "");
    setValue("confirmedPassword", "");
    setEditOpen(true);
  };

  // Image upload handler
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      setImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedImage(dataUrl);
        // Update the form field with the data URL
        editSetValue("studentCardUrl", dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImageFile(null);
    // Clear the form field
    editSetValue("studentCardUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteStudent = () => {
    if (!selectedStudent) return;

    setStudents((prevStudents) =>
      prevStudents.filter((s) => s.uuid !== selectedStudent.uuid)
    );

    setDeleteOpen(false); // Close the modal or form
  };
  if (!accessToken) {
    toast.error("Please login to view students!", {
      position: "top-left",
      autoClose: 3000,
      theme: "colored",
    });
    redirect("/");
  }

  return (
    <>
      <ToastContainer />
      <div className="p-6 bg-card border-border shadow-sm  transition-all duration-200 backdrop-blur-sm rounded-2xl">
        <div className="p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-dynamic2">
                Student Management
              </h2>
              <p className="text-sm text-dynamic">
                Manage and track student information
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search students by name or email..."
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
                    className="bg-white border-slate-300 "
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {statusFilter} <ChevronDown className="ml-2 w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
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
                  <Button className="bg-primary2 text-white bg-secondary shadow-sm">
                    <Plus className="w-4 h-4 mr-2 " /> Add User
                  </Button>
                </DialogTrigger>

                <DialogContent className="p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-popover-foreground">
                      Add New User
                    </DialogTitle>
                  </DialogHeader>

                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 py-4"
                  >
                    {/* First and Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>First Name</Label>
                        <Input
                          {...register("firstname")}
                          className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                        />
                        {errors.firstname && (
                          <p className="text-red-500 text-sm">
                            {errors.firstname.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label>Last Name</Label>
                        <Input
                          {...register("lastname")}
                          className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                        />
                        {errors.lastname && (
                          <p className="text-red-500 text-sm">
                            {errors.lastname.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Username */}
                    <div className="space-y-1">
                      <Label>Username</Label>
                      <Input
                        {...register("username")}
                        className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                      />
                      {errors.username && (
                        <p className="text-red-500 text-sm">
                          {errors.username.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        {...register("email")}
                        className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Passwords */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Password */}
                      <div className="space-y-1 relative">
                        <Label>Password</Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-red-500 text-sm">
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-1 relative">
                        <Label>Confirm Password</Label>
                        <div className="relative">
                          <Input
                            type={showConfirm ? "text" : "password"}
                            {...register("confirmedPassword")}
                            className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((prev) => !prev)}
                            className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                          >
                            {showConfirm ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {errors.confirmedPassword && (
                          <p className="text-red-500 text-sm">
                            {errors.confirmedPassword.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <DialogFooter className="pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAddOpen(false)}
                        className="border-slate-300 rounded-lg"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-primary2 text-white bg-secondary rounded-lg"
                      >
                        {/* {isLoading ? "Adding..." : "Add User"}{" "} */}
                        {/* show loading text */}{" "}
                      </Button>
                    </DialogFooter>
                  </form>
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
                  className={`hover:bg-muted/50 transition-colors ${
                    index % 2 === 0 ? "bg-card" : "bg-muted/20"
                  }`}
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
                className="border-gray-600 text-dynamic2"
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="border-gray-600 text-dynamic2"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="border-gray-600 text-dynamic2"
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="border-gray-600 text-dynamic2"
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
                  filteredStudents.length
                )}{" "}
                of {filteredStudents.length} students
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

        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card border-0">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
                  <Eye className="w-5 h-5" />
                </div>
                User Details
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
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-semibold rounded-xl">
                        {selectedStudent.fullName
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-foreground truncate">
                        {selectedStudent.fullName || "Unknown User"}
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
                    <div className="flex items-center gap-2 mt-1 text-sm text-foreground">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedStudent.email || "N/A"}</span>
                    </div>
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
                      <div className="flex items-center gap-2 mt-1 text-sm text-foreground">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedStudent.contactNumber}</span>
                      </div>
                    </div>
                  )}
                  {selectedStudent.address && (
                    <div className="sm:col-span-2">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Address
                      </Label>
                      <div className="flex items-start gap-2 mt-1 text-sm text-foreground">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <span>{selectedStudent.address}</span>
                      </div>
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

        {/* Manage Roles Dialog */}
        <Dialog open={promoteOpen} onOpenChange={setPromoteOpen}>
          <DialogContent className="p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
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
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
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
        {/* Edit student dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-dynamic2">
                Edit Student Information
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Student Card Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-dynamic2">
                  Student Card Image
                </Label>

                {/* Image Preview */}
                {uploadedImage && (
                  <div className="relative w-full max-w-xs">
                    <Image
                      src={uploadedImage}
                      alt="Student Card Preview"
                      width={300}
                      height={200}
                      className="rounded-lg border border-gray-300 object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      ×
                    </Button>
                  </div>
                )}

                {/* File Input */}
                <div className="flex items-center space-x-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="whitespace-nowrap"
                  >
                    Choose Image
                  </Button>
                </div>

                {/* Form field is handled programmatically via editSetValue */}

                {editErrors.studentCardUrl && (
                  <p className="text-red-500 text-sm">
                    {editErrors.studentCardUrl.message}
                  </p>
                )}

                {/* Upload Instructions */}
                <p className="text-xs text-gray-500">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
                </p>
              </div>

              {/* University */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-dynamic2">
                  University
                </Label>
                <Input
                  {...editRegister("university")}
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                />
                {editErrors.university && (
                  <p className="text-red-500 text-sm">
                    {editErrors.university.message}
                  </p>
                )}
              </div>

              {/* Major */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-dynamic2">
                  Major
                </Label>
                <Input
                  {...editRegister("major")}
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                />
                {editErrors.major && (
                  <p className="text-red-500 text-sm">
                    {editErrors.major.message}
                  </p>
                )}
              </div>

              {/* Years of Study */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-dynamic2">
                  Years of Study
                </Label>
                <Input
                  type="text"
                  {...editRegister("yearsOfStudy")}
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                />
                {editErrors.yearsOfStudy && (
                  <p className="text-red-500 text-sm">
                    {editErrors.yearsOfStudy.message}
                  </p>
                )}
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
                  type="submit"
                  onClick={editHandleSubmit(handleEditStudent)}
                  className="bg-primary2 text-white bg-secondary"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="sm:max-w-md p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-dynamic2">
                Delete User
              </DialogTitle>
            </DialogHeader>

            {selectedStudent && (
              <div className="space-y-4 py-4">
                {/* Warning Message */}
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold">
                      {selectedStudent.fullName || "this user"}
                    </span>
                    ? This action cannot be undone.
                  </p>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <Avatar className="w-12 h-12 ring-2 ring-slate-200 shadow-sm">
                    <AvatarImage
                      src={selectedStudent.imageUrl || "/placeholder.svg"}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                      {selectedStudent.fullName
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {selectedStudent.fullName || "Unknown User"}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {selectedStudent.email || "N/A"}
                    </p>
                    <p className="text-sm text-slate-600">
                      {selectedStudent.userName || "N/A"}
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
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
