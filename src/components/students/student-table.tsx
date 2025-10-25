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
  AlertTriangle,
  CheckCircle,
  Calendar,
  Info,
  MessageCircle,
  FileText,
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
  useGetAllStudentsQuery,
} from "@/lib/api/studentSlice";
import { redirect } from "next/navigation";
import { StudentUpdateType } from "@/types/studentType/studentType";
import { UploadMediaResponse } from "@/types/mediaType/mediaType";
import { useCreateMediaMutation } from "@/lib/api/imageSlice";

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
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken as string | undefined;
  // console.log("allStudents :>> ", allStudents);
  const roleOptions = [
    "Student",
    "Mentor",
    "User",
    "Admin",
    "Advisor",
  ] as const;

  // Use RTK Query to fetch latest students and allow refetch after mutations.
  const {
    data: fetchedStudents,
    isLoading: studentsLoading,
    refetch: refetchStudents,
  } = useGetAllStudentsQuery(
    { token: accessToken ?? "", size: 200 },
    { skip: !accessToken }
  );

  // Source-of-truth: prefer fetched students, fall back to server-provided prop, then empty array.
  const students = fetchedStudents ?? allStudents ?? [];

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
    // Refetch to get authoritative data from server.
    // NOTE: roles persistence may require a different API endpoint; we refetch so table updates.
    void refetchStudents?.();
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
  // RDk for Create New Student
  const [createNewStudent, { isLoading: createIsLoading }] =
    useCreateNewStudentMutation();
  // RDk for Update Student
  const [updateStudent, { isLoading: updateIsLoading }] =
    useUpdateStudentMutation();
  // RDk for Delete Student
  const [deleteStudent, { isLoading: deleteIsLoading }] =
    useDeleteStudentMutation();

  const [uploadImage, { isLoading: uploadIsLoading }] =
    useCreateMediaMutation();

  // Image upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active"
          ? s.isActive === true
          : s.isActive === false);
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
                    status: row.original.isActive ? "Active" : "Inactive",
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
      // Refresh students list after successful creation
      void refetchStudents?.();
    } catch (error) {
      toast.error("Error creating student!", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
      console.log("error :>> ", error);
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
  const handleEditStudent: SubmitHandler<EditStudentFormData> = async (
    data
  ) => {
    // console.log("Form Data:", data);
    // console.log("currentId", currentId);

    // If an image file was selected, upload via FormData first

    let uploadedMediaUri: string | undefined;

    if (imageFile) {
      console.log("imageFile in if :>> ", imageFile);
      const formData = new FormData();
      formData.append("file", imageFile);
      try {
        const uploadResp = await uploadImage(formData).unwrap();
        console.log("uploadResp :>> ", uploadResp);

        uploadedMediaUri = (uploadResp as UploadMediaResponse)?.data?.uri;
        // console.log('uploadedMediaUri :>> ', uploadedMediaUri);

        if (uploadedMediaUri) {
          setUploadedImage(uploadedMediaUri);
          // update the edit form value so UI & submission use the uploaded URI
          editSetValue("studentCardUrl", uploadedMediaUri);
          toast.success("Image uploaded successfully", {
            position: "top-left",
            autoClose: 2000,
            theme: "colored",
          });
        } else {
          toast.error("Upload returned no URI", {
            position: "top-left",
            autoClose: 3000,
            theme: "colored",
          });
        }
      } catch (err) {
        console.log("Image upload failed:", err);
        toast.error("Image upload failed. Will attempt to save other fields.", {
          position: "top-left",
          autoClose: 3000,
          theme: "colored",
        });
      }
    }

    // console.log('uploadedMediaUri :>> ', uploadedMediaUri);

    const lastedData: StudentUpdateType = {
      studentCardUrl: uploadedMediaUri ?? data?.studentCardUrl,
      university: data?.university,
      major: data?.major,
      yearsOfStudy: data?.yearsOfStudy,
    };

    // Submit logic: Save the student data, update state, etc.

    try {
      const response = await updateStudent({
        token: accessToken ?? "",
        updateUser: lastedData satisfies StudentUpdateType,
        uuid: currentId,
      }).unwrap();
      console.log("response :>> ", response);
      toast.success("Student created successfully!", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
      // Refresh students after update
      void refetchStudents?.();
    } catch (error) {
      toast.error("Error creating student!", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
      console.log("error :>> ", error);
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

  const handleDeleteStudent = async () => {
    console.log("currentId :>> ", currentId);
    if (!currentId) return;
    try {
      await deleteStudent({
        uuid: currentId,
        token: accessToken ?? "",
      }).unwrap();
      toast.success("Student deleted", {
        position: "top-left",
        autoClose: 2500,
        theme: "colored",
      });
      // refresh list
      void refetchStudents?.();
    } catch (err) {
      toast.error("Failed to delete student", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setDeleteOpen(false);
    }
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
                className="pl-10 border-input focus:border-ring focus:ring-ring bg-background shadow-sm transition-all"
              />
            </div>
            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-card border-border">
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
                  <Button className="shadow-sm">
                    <Plus className="w-4 h-4 mr-2 " /> Add User
                  </Button>
                </DialogTrigger>

                <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
                  <DialogHeader className="space-y-3 pb-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-blue-500/10 dark:bg-blue-400/10">
                        <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <DialogTitle className="text-2xl font-bold text-foreground">
                          Add New Student
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Fill in the information below to create a new student
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
                            {...register("firstname")}
                            placeholder="Enter first name"
                            className="bg-background border-input text-foreground focus:border-ring focus:ring-ring transition-colors"
                          />
                          {errors.firstname && (
                            <div className="flex items-center gap-1.5 text-destructive text-sm">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{errors.firstname.message}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                            Last Name
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            {...register("lastname")}
                            placeholder="Enter last name"
                            className="bg-background border-input text-foreground focus:border-ring focus:ring-ring transition-colors"
                          />
                          {errors.lastname && (
                            <div className="flex items-center gap-1.5 text-destructive text-sm">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{errors.lastname.message}</span>
                            </div>
                          )}
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
                            {...register("username")}
                            placeholder="Choose a unique username"
                            className="bg-background border-input text-foreground focus:border-ring focus:ring-ring transition-colors"
                          />
                          {errors.username && (
                            <div className="flex items-center gap-1.5 text-destructive text-sm">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{errors.username.message}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            Email Address
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            type="email"
                            {...register("email")}
                            placeholder="student@example.com"
                            className="bg-background border-input text-foreground focus:border-ring focus:ring-ring transition-colors"
                          />
                          {errors.email && (
                            <div className="flex items-center gap-1.5 text-destructive text-sm">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{errors.email.message}</span>
                            </div>
                          )}
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
                              {...register("password")}
                              placeholder="Enter secure password"
                              className="bg-background border-input text-foreground focus:border-ring focus:ring-ring pr-10 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {errors.password && (
                            <div className="flex items-center gap-1.5 text-destructive text-sm">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{errors.password.message}</span>
                            </div>
                          )}
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
                              {...register("confirmedPassword")}
                              placeholder="Confirm password"
                              className="bg-background border-input text-foreground focus:border-ring focus:ring-ring pr-10 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm((prev) => !prev)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showConfirm ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {errors.confirmedPassword && (
                            <div className="flex items-center gap-1.5 text-destructive text-sm">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{errors.confirmedPassword.message}</span>
                            </div>
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
                        className="min-w-[120px] border-input hover:bg-accent transition-colors"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createIsLoading}
                        className="min-w-[120px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors"
                      >
                        {createIsLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin">⏳</span>
                            Adding...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add Student
                          </span>
                        )}
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
                      className="border-0 bg-card"
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
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
            <DialogHeader className="pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-500/10 dark:bg-blue-400/10">
                  <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  Student Details
                </DialogTitle>
              </div>
            </DialogHeader>

            {selectedStudent && (
              <div className="space-y-6 py-6">
                {/* Hero Card */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-800 dark:via-blue-900 dark:to-indigo-900 p-6 border border-border">
                  <div className="relative flex items-center gap-4">
                    <Avatar className="w-20 h-20 ring-4 ring-white dark:ring-slate-800 shadow-lg">
                      <AvatarImage
                        src={
                          selectedStudent.imageUrl ||
                          "/placeholder.svg?height=80&width=80"
                        }
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-2xl">
                        {selectedStudent.fullName
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("") || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-bold text-foreground truncate">
                        {selectedStudent.fullName || "Unknown Student"}
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
                      Student Roles
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

        {/* Manage Roles Dialog */}
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
        {/* Edit student dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
            <DialogHeader className="space-y-3 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-500/10 dark:bg-purple-400/10">
                  <Edit className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    Edit Student Information
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Update student details and academic information
                  </p>
                </div>
              </div>
            </DialogHeader>

            <form
              onSubmit={editHandleSubmit(handleEditStudent)}
              className="space-y-6 py-6"
            >
              {/* Student Card Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2">
                  <div className="h-px flex-1 bg-border"></div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    Student Card
                  </h3>
                  <div className="h-px flex-1 bg-border"></div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Student Card Image
                  </Label>

                  {uploadedImage && (
                    <div className="relative w-full max-w-sm mx-auto">
                      <div className="relative rounded-xl overflow-hidden border-2 border-border shadow-md">
                        <Image
                          unoptimized
                          src={uploadedImage}
                          alt="Student Card Preview"
                          width={400}
                          height={250}
                          className="w-full h-auto object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="absolute top-3 right-3 rounded-full w-8 h-8 p-0 shadow-lg"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 border-input hover:bg-accent transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {uploadedImage ? "Change Image" : "Upload Image"}
                    </Button>
                    {uploadedImage && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveImage}
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>

                  {editErrors.studentCardUrl && (
                    <div className="flex items-center gap-1.5 text-destructive text-sm">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{editErrors.studentCardUrl.message}</span>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Supported formats: JPG, PNG, GIF. Max size: 5MB
                  </p>
                </div>
              </div>

              {/* Academic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2">
                  <div className="h-px flex-1 bg-border"></div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    Academic Information
                  </h3>
                  <div className="h-px flex-1 bg-border"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      University
                    </Label>
                    <Input
                      {...editRegister("university")}
                      placeholder="Enter university name"
                      className="bg-background border-input text-foreground focus:border-ring focus:ring-ring transition-colors"
                    />
                    {editErrors.university && (
                      <div className="flex items-center gap-1.5 text-destructive text-sm">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{editErrors.university.message}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      Major
                    </Label>
                    <Input
                      {...editRegister("major")}
                      placeholder="Enter major/field of study"
                      className="bg-background border-input text-foreground focus:border-ring focus:ring-ring transition-colors"
                    />
                    {editErrors.major && (
                      <div className="flex items-center gap-1.5 text-destructive text-sm">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{editErrors.major.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Years of Study
                  </Label>
                  <Input
                    type="text"
                    {...editRegister("yearsOfStudy")}
                    placeholder="e.g., 3 or Year 3"
                    className="bg-background border-input text-foreground focus:border-ring focus:ring-ring transition-colors"
                  />
                  {editErrors.yearsOfStudy && (
                    <div className="flex items-center gap-1.5 text-destructive text-sm">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{editErrors.yearsOfStudy.message}</span>
                    </div>
                  )}
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
                  disabled={updateIsLoading}
                  className="min-w-[120px] bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white transition-colors"
                >
                  {updateIsLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
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

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-6 bg-card border-border shadow-sm">
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
