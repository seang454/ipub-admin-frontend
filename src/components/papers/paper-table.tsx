/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import type React from "react";
import {
  useState,
  useMemo,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogFooter,
  DialogTrigger,
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
  Filter,
  Eye,
  FileText,
  Trash2,
  CheckCircle,
  Calendar,
  Info,
  Download,
  AlertTriangle,
  Edit,
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
import { Paper, PapersResponse } from "@/types/paperType/paperType";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EditPaperFormData,
  editPaperSchema,
  PaperFormData,
  paperSchema,
} from "./zode";
import { useCreateMediaMutation } from "@/lib/api/imageSlice";
import { useGetAllCategoriesQuery } from "@/lib/api/categorySlice";
import { useSession } from "next-auth/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { reset } from "@/feature/counter/counterSlice";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import {
  PaperData,
  useCreatePaperMutation,
  useDeletePaperMutation,
  useUpdateAdminPaperMutation,
} from "@/lib/api/paperAdminSlice";
import PDFViewer from "../pdf/pdfView";

// Theme Context
interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
interface CreateFormData {
  title: string;
  abstractText: string;
  fileUrl: string;
  categoryNames: string[];
}

export interface EditFormData {
  title: string;
  abstractText: string;
  fileUrl: string;
  thumbnailUrl: string;
  category: string[];
}

interface FormErrors {
  title?: string;
  abstractText?: string;
  fileUrl?: string;
  categoryNames?: string;
  category?: string;
}

const statusOptions = [
  "All",
  "APPROVED",
  "UNDER_REVIEW",
  "DRAFT",
  "REJECTED",
] as const;

export default function PaperManagement({
  allPapers,
}: {
  allPapers: PapersResponse;
}) {
  console.log("allPapers :>> ", allPapers);
  // const { theme, toggleTheme } = useContext(ThemeContext)
  const [papers, setPapers] = useState<Paper[]>(allPapers.papers.content || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [statusFilter, setStatusFilter] =
    useState<(typeof statusOptions)[number]>("All");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [currentUuid, setCurrentUuid] = useState<string>("");

  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;

  const { data: categoriesData } = useGetAllCategoriesQuery(
    { page: 0, size: 50, token: token ?? "" },
    { skip: !token }
  );

  console.log("categoriesData :>> ", categoriesData);

  const [createFormData, setCreateFormData] = useState<CreateFormData>({
    title: "",
    abstractText: "",
    fileUrl: "",
    categoryNames: [],
  });

  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: "",
    abstractText: "",
    fileUrl: "",
    thumbnailUrl: "",
    category: [],
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const dialogRef = useRef<HTMLDivElement>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Focus dialog when opened
  useEffect(() => {
    if ((viewOpen || editOpen || deleteOpen || addOpen) && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [viewOpen, editOpen, deleteOpen, addOpen]);

  const validateCreateForm = (data: CreateFormData): FormErrors => {
    const errors: FormErrors = {};
    if (!data.title.trim()) errors.title = "Title is required";
    if (!data.abstractText.trim()) errors.abstractText = "Abstract is required";
    if (!data.fileUrl.trim()) {
      errors.fileUrl = "File URL is required";
    } else if (!isValidUrl(data.fileUrl)) {
      errors.fileUrl = "Invalid URL format";
    }
    if (!data.categoryNames.length)
      errors.categoryNames = "At least one category is required";
    return errors;
  };

  const validateEditForm = (data: EditFormData): FormErrors => {
    const errors: FormErrors = {};
    if (!data.title.trim()) errors.title = "Title is required";
    if (!data.abstractText.trim()) errors.abstractText = "Abstract is required";
    if (!data.fileUrl.trim()) {
      errors.fileUrl = "File URL is required";
    } else if (!isValidUrl(data.fileUrl)) {
      errors.fileUrl = "Invalid URL format";
    }
    if (!data.category.length)
      errors.category = "At least one category is required";
    return errors;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Filtered papers
  const filteredPapers = useMemo(() => {
    return allPapers.papers.content?.filter((paper) => {
      const matchesSearch =
        paper.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        paper.abstractText
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || paper.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allPapers.papers.content, debouncedSearchTerm, statusFilter]);

  // Column definitions
  const columns = useMemo<ColumnDef<Paper, any>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Paper",
        cell: (info) => (
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 rounded-lg border-2 border-blue-100 dark:border-blue-800">
              <AvatarImage
                src={info.row.original.thumbnailUrl || "/placeholder.svg"}
                alt={`Thumbnail for ${info.getValue<string>()}`}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white font-semibold rounded-lg">
                <FileText className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground truncate text-sm">
                {info.getValue<string>()}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {info.row.original.abstractText}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {info.row.original.categoryNames
                  .slice(0, 2)
                  .map((category: string, idx: number) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800 text-xs px-1.5 py-0.5"
                    >
                      {category}
                    </Badge>
                  ))}
                {info.row.original.categoryNames.length > 2 && (
                  <Badge
                    variant="outline"
                    className="bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 text-xs px-1.5 py-0.5"
                  >
                    +{info.row.original.categoryNames.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "categoryNames",
        header: "Categories",
        cell: (info) => (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-800 text-xs"
          >
            {info.getValue<string>()}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue<Paper["status"]>();
          const statusConfig: Record<
            Paper["status"],
            { bg: string; dot: string }
          > = {
            APPROVED: {
              bg: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700 dark:hover:bg-emerald-800",
              dot: "bg-emerald-500 dark:bg-emerald-400",
            },
            UNDER_REVIEW: {
              bg: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700 dark:hover:bg-amber-800",
              dot: "bg-amber-500 dark:bg-amber-400",
            },
            DRAFT: {
              bg: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-600",
              dot: "bg-slate-500 dark:bg-slate-400",
            },
            REJECTED: {
              bg: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:border-red-700 dark:hover:bg-red-800",
              dot: "bg-red-500 dark:bg-red-400",
            },
          };
          const config = statusConfig[status] || statusConfig["DRAFT"];
          return (
            <Badge variant="secondary" className={`${config.bg} text-xs`}>
              <div
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dot}`}
              />
              {status.replace("_", " ")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "submittedAt",
        header: "Submitted",
        cell: (info) => (
          <div className="text-xs text-foreground">
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
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 border-slate-400 bg-card shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm"
            >
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPaper(row.original);
                  setViewOpen(true);
                }}
                className="cursor-pointer  hover:bg-accent text-xs text-foreground"
              >
                <Eye className="w-3.5 h-3.5 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPaper(row.original);
                  setCurrentUuid(row.original.uuid);
                  setEditFormData({
                    title: row.original.title,
                    abstractText: row.original.abstractText,
                    fileUrl: row.original.fileUrl,
                    thumbnailUrl: row.original.thumbnailUrl,
                    category: row.original.categoryNames,
                  });
                  setEditOpen(true);
                }}
                className="cursor-pointer  hover:bg-accent text-xs text-foreground"
              >
                <Edit className="w-3.5 h-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  downloadPaper(row.original);
                }}
                className="cursor-pointer  hover:bg-accent text-xs text-foreground"
              >
                <Download className="w-3.5 h-3.5 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPaper(row.original);
                  setDeleteOpen(true);
                }}
                className="text-red-600 dark:text-red-400 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900 text-xs"
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
  const [createPaper] = useCreatePaperMutation();
  const [updatePaper] = useUpdateAdminPaperMutation();
  const [uploadMedia] = useCreateMediaMutation();
  const [deletePaper] = useDeletePaperMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PaperFormData>({
    resolver: zodResolver(paperSchema),
  });

  const handleAddPaper = async (data: PaperFormData) => {
    console.log("data in add paper :>> ", data);
    try {
      // Upload file
      const formData = new FormData();
      formData.append("file", data.file as File);
      const uploadedFile = await uploadMedia(formData).unwrap();

      // Upload thumbnail
      const thumbFormData = new FormData();
      thumbFormData.append("file", data.thumbnail as File);
      const uploadedThumb = await uploadMedia(thumbFormData).unwrap();

      // Construct payload for backend
      const convertedCategoryNames: string[] = [];
      convertedCategoryNames.push(
        categoriesData?.content.find((cat) => cat.uuid === data.categoryUuid)
          ?.name || ""
      );

      const payload: PaperData = {
        title: data.title,
        abstractText: data.abstractText,
        fileUrl: uploadedFile.data.uri,
        thumbnailUrl: uploadedThumb.data.uri,
        categoryNames: convertedCategoryNames,
      };
      console.log("payload :>> ", payload);
      const response = await createPaper({
        token: token ?? "",
        paperData: payload,
      }).unwrap();
      console.log("response :>> ", response);
      console.log("Final payload:", payload);

      // TODO: call your paperApi.createPaper mutation here
      toast.success("Paper inserted successfully!", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
      setAddOpen(false);
    } catch (err) {
      toast.error("Failed to add paper", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
      console.error("Upload failed:", err);
    }
  };

  // Table instance
  const table = useReactTable({
    data: filteredPapers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  const {
    register: editRegister,
    handleSubmit: editHandleSubmit,
    formState: { errors: editErrors },
    reset: editReset,
    setValue: editSetValue,
  } = useForm<EditPaperFormData>({
    resolver: zodResolver(editPaperSchema),
    defaultValues: {
      title: "",
      abstractText: "",
      fileUrl: "",
      thumbnailUrl: "",
      category: "",
    },
  });

  const handleEditPaper = async (data: EditPaperFormData) => {
    if (!selectedPaper) return;

    console.log("data :>> ", data);
    console.log("currentUuid :>> ", currentUuid);
    console.log("data :>> ", data.thumbnailUrl);

    try {
      // Upload file
      const formData = new FormData();
      formData.append("file", data.fileUrl as File);
      const uploadedFile = await uploadMedia(formData).unwrap();

      // Upload thumbnail
      const thumbFormData = new FormData();
      thumbFormData.append("file", data.thumbnailUrl as File);
      const uploadedThumb = await uploadMedia(thumbFormData).unwrap();

      console.log("uploadedFile :>> ", uploadedFile);
      console.log("uploadedThumb :>> ", uploadedThumb);
      // Construct payload for backend

      const convertedCategoryNames: string[] = [];
      convertedCategoryNames.push(
        categoriesData?.content.find((cat) => cat.uuid === data.category)
          ?.name || ""
      );
      const payload: EditFormData = {
        title: data.title,
        abstractText: data.abstractText,
        fileUrl: uploadedFile.data.uri,
        thumbnailUrl: uploadedThumb.data.uri,
        category: convertedCategoryNames,
      };

      const response = await updatePaper({
        token: token ?? "",
        paperUuid: currentUuid,
        paperData: payload,
      }).unwrap();
      console.log("Final payload in edit:", payload);

      // TODO: call your paperApi.createPaper mutation here
      toast.success("Paper edited successfully!", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
      setAddOpen(false);
    } catch (err) {
      toast.error("Failed to add paper", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
      console.error("Upload failed:", err);
    }

    setFormErrors({});
    setEditOpen(false);
  };

  const handleClose = () => {
    setEditOpen(false);
    reset();
  };

  const handleDeletePaper = async () => {
    if (!selectedPaper) return;
    setPapers(papers.filter((paper) => paper.uuid !== selectedPaper.uuid));

    try {
      // Upload file
      const response = await deletePaper({
        token: token || "",
        uuid: currentUuid,
      });
      setDeleteOpen(false);
      // TODO: call your paperApi.createPaper mutation here
      toast.success("Deleted paper successfully!", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (err) {
      toast.error("Failed to add paper", {
        position: "top-left",
        autoClose: 3000,
        theme: "colored",
      });
      console.error("Upload failed:", err);
    }
  };

  const downloadPaper = async (paper: Paper) => {
    try {
      const response = await fetch(paper.fileUrl);
      if (!response.ok) throw new Error("Failed to access file");
      window.open(paper.fileUrl, "_blank");
    } catch (error) {
      alert("Error downloading file: " + (error as Error).message);
    }
  };

  const handleCreateCategoryChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const categories = e.target.value
      .split(",")
      .map((cat) => cat.trim())
      .filter((cat) => cat);
    setCreateFormData({ ...createFormData, categoryNames: categories });
    if (categories.length > 0) {
      setFormErrors((prev) => ({ ...prev, categoryNames: undefined }));
    }
  };

  const handleEditCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const categories = e.target.value
      .split(",")
      .map((cat) => cat.trim())
      .filter((cat) => cat);
    setEditFormData({ ...editFormData, category: categories });
    if (categories.length > 0) {
      setFormErrors((prev) => ({ ...prev, category: undefined }));
    }
  };

  return (
    <div className="border-0">
      <ToastContainer />
      <div className=" mx-auto p-4">
        <div className="bg-card rounded-xl shadow-sm border-0 overflow-hidden">
          <div className="bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-700 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-200" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Paper Management
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage and track research papers ({papers.length} papers)
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search papers by title or abstract..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 focus:border-indigo-500 focus:ring-indigo-500 bg-card text-foreground shadow-sm"
                  aria-label="Search papers"
                />
              </div>
              <div className="flex gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-slate-400 hover:bg-muted bg-card text-foreground"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      {statusFilter} <ChevronDown className="ml-2 w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40 bg-card border-0  border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
                    {statusOptions.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className="cursor-pointer text-foreground hover:bg-muted"
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                      <Plus className="w-4 h-4 mr-2" /> Add Paper
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-lg bg-gradient-to-b from-gray-900/90 to-gray-800/90  border  rounded-2xl text-white max-h-[90vh] overflow-y-auto p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
                    <VisuallyHidden>
                      <DialogTitle className="text-dynamic2">
                        Add New Paper
                      </DialogTitle>
                    </VisuallyHidden>

                    <DialogHeader>
                      <DialogTitle className="text-2xl font-semibold mb-4 text-dynamic2">
                        Add New Paper
                      </DialogTitle>
                    </DialogHeader>

                    <form
                      onSubmit={handleSubmit(handleAddPaper)}
                      className="space-y-5"
                    >
                      {/* Title */}
                      <div>
                        <Label className="text-sm font-medium text-dynamic2">
                          Title *
                        </Label>
                        <Input
                          {...register("title")}
                          placeholder="Enter paper title"
                          className="bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.title && (
                          <p className=" text-sm mt-1 text-dynamic2">
                            {errors.title.message}
                          </p>
                        )}
                      </div>

                      {/* Abstract */}
                      <div>
                        <Label className="text-sm font-medium text-dynamic2">
                          Abstract *
                        </Label>
                        <Textarea
                          {...register("abstractText")}
                          rows={3}
                          placeholder="Enter abstract"
                          className="bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {errors.abstractText && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors.abstractText.message}
                          </p>
                        )}
                      </div>

                      {/* File Upload */}
                      <div>
                        <Label className="text-sm font-medium text-dynamic2">
                          Upload File (PDF) *
                        </Label>
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setTimeout(
                                () => setValue("file", file as File),
                                0
                              );
                              setFilePreview(file.name);
                            }
                          }}
                          className="bg-gray-800 border border-gray-700 text-white file:text-blue-400"
                        />
                        {filePreview && (
                          <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700 rounded-lg flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <span className="text-sm truncate">
                              {filePreview}
                            </span>
                          </div>
                        )}
                        {errors.file && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors.file.message}
                          </p>
                        )}
                      </div>

                      {/* Thumbnail Upload */}
                      <div>
                        <Label className="text-sm font-medium">
                          Upload Thumbnail *
                        </Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setTimeout(
                                () => setValue("thumbnail", file as File),
                                0
                              );
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setThumbnailPreview(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="bg-gray-800 border border-gray-700 text-white file:text-blue-400"
                        />
                        {thumbnailPreview && (
                          <div className="mt-3 flex justify-center">
                            <div className="relative">
                              <Image
                                unoptimized
                                width={100}
                                height={100}
                                src={thumbnailPreview}
                                alt="Thumbnail preview"
                                className="w-32 h-32 object-cover rounded-lg border-2 border-blue-700 shadow-lg"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setThumbnailPreview("");
                                  setValue("thumbnail", undefined as any);
                                }}
                                className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-md"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        )}
                        {errors.thumbnail && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors.thumbnail.message}
                          </p>
                        )}
                      </div>

                      {/* Category */}
                      <div>
                        <Label className="text-sm font-medium">
                          Category *
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            setValue("categoryUuid", value)
                          }
                        >
                          <SelectTrigger className="bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 text-white border border-gray-700">
                            {categoriesData?.content.map((cat) => (
                              <SelectItem key={cat.uuid} value={cat.uuid}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.categoryUuid && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors.categoryUuid.message}
                          </p>
                        )}
                      </div>

                      <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-gray-700 mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setAddOpen(false);
                            setFilePreview("");
                            setThumbnailPreview("");
                          }}
                          className="bg-gray-700 hover:bg-gray-600 text-white border-none"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Add Paper
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="w-full">
              <table className="w-full table-fixed">
                <thead className="bg-muted/50 backdrop-blur-sm border-0">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header, index) => (
                        <th
                          key={header.id}
                          colSpan={header.colSpan}
                          className={`px-3 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider cursor-pointer select-none hover:bg-muted transition-colors ${
                            index === 0
                              ? "w-2/5"
                              : index === 1
                              ? "w-1/6"
                              : index === 2
                              ? "w-1/6"
                              : index === 3
                              ? "w-1/6"
                              : "w-16"
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
                <tbody className="bg-card divide-y-0">
                  {table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-muted/50 transition-colors ${
                        index % 2 === 0 ? "bg-card" : "bg-card"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="p-6 bg-card border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-muted/30 backdrop-blur-sm text-foreground"
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
          </div>

          <div className="bg-muted/30 backdrop-blur-sm border-0 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                  aria-label="Go to first page"
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                  aria-label="Go to previous page"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                  aria-label="Go to next page"
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                  aria-label="Go to last page"
                >
                  Last
                </Button>
              </div>
              <div className="flex items-center gap-4 border-0">
                <span className="text-sm text-muted-foreground">
                  Showing{" "}
                  {table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    1}{" "}
                  to{" "}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) *
                      table.getState().pagination.pageSize,
                    filteredPapers.length
                  )}{" "}
                  of {filteredPapers.length} Papers
                </span>
                <Select
                  value={table.getState().pagination.pageSize.toString()}
                  onValueChange={(value) => table.setPageSize(Number(value))}
                >
                  <SelectTrigger className="w-32 h-8 border-0 bg-card text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-0">
                    {[10, 20, 30].map((size) => (
                      <SelectItem
                        className="text-foreground hover:bg-muted"
                        key={size}
                        value={size.toString()}
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
            <DialogContent
              className="sm:max-w-4xl lg:max-w-7xl max-h-[100vh] overflow-y-auto bg-card border-0 grid grid-cols-1 md:grid-cols-2"
              ref={dialogRef}
              tabIndex={-1}
            >
              <section>
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 rounded-lg">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    Paper Details
                  </DialogTitle>
                </DialogHeader>
                {selectedPaper && (
                  <div className="space-y-8 py-2">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-800 dark:via-blue-900 dark:to-indigo-900 border-0 shadow-sm">
                      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.05))] opacity-25"></div>
                      <div className="relative p-8">
                        <div className="flex flex-col lg:flex-row items-start gap-6">
                          <Avatar className="h-24 w-24 rounded-2xl border-4 border-white dark:border-slate-800 shadow-lg flex-shrink-0">
                            <AvatarImage
                              src={
                                selectedPaper.thumbnailUrl || "/placeholder.svg"
                              }
                              alt={`Thumbnail for ${selectedPaper.title}`}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 dark:from-indigo-600 dark:to-blue-700 text-white font-bold text-2xl rounded-2xl">
                              <FileText className="h-10 w-10" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 space-y-4">
                            <div>
                              <h3 className="text-2xl font-bold text-foreground mb-2 leading-tight">
                                {selectedPaper.title}
                              </h3>
                              <p className="text-muted-foreground leading-relaxed text-base">
                                {selectedPaper.abstractText}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedPaper.categoryNames.map(
                                (category, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="bg-white/80 dark:bg-slate-700/80 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900 px-3 py-1 text-sm font-medium"
                                  >
                                    {category}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-card rounded-xl border-0 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-200" />
                          </div>
                          <Label className="text-sm font-semibold text-muted-foreground">
                            Paper Type
                          </Label>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700 text-sm px-4 py-2 font-medium"
                        >
                          {selectedPaper.categoryNames[0] || "Uncategorized"}
                        </Badge>
                      </div>

                      <div className="bg-card rounded-xl border-0 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-200" />
                          </div>
                          <Label className="text-sm font-semibold text-muted-foreground">
                            Status
                          </Label>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-sm px-4 py-2 font-medium ${
                            selectedPaper.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700"
                              : selectedPaper.status === "UNDER_REVIEW"
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700"
                              : selectedPaper.status === "DRAFT"
                              ? "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
                              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              selectedPaper.status === "APPROVED"
                                ? "bg-emerald-500 dark:bg-emerald-400"
                                : selectedPaper.status === "UNDER_REVIEW"
                                ? "bg-amber-500 dark:bg-amber-400"
                                : selectedPaper.status === "DRAFT"
                                ? "bg-slate-500 dark:bg-slate-400"
                                : "bg-red-500 dark:bg-red-400"
                            }`}
                          />
                          {selectedPaper.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="bg-card rounded-xl border-0 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-200" />
                          </div>
                          <Label className="text-sm font-semibold text-muted-foreground">
                            Submitted Date
                          </Label>
                        </div>
                        <p className="text-foreground font-semibold text-lg">
                          {selectedPaper.submittedAt}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 rounded-xl border-0 p-6">
                      <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-200" />
                        Additional Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Published:
                          </span>
                          <span className="font-medium text-foreground">
                            {selectedPaper.isPublished ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Approved:
                          </span>
                          <span className="font-medium text-foreground">
                            {selectedPaper.isApproved ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Created:
                          </span>
                          <span className="font-medium text-foreground">
                            {selectedPaper.createdAt}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Published Date:
                          </span>
                          <span className="font-medium text-foreground">
                            {selectedPaper.publishedAt || "Not published"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <DialogFooter className="pt-6 border-0">
                  <Button
                    variant="outline"
                    onClick={() => setViewOpen(false)}
                    className="border-0 hover:bg-muted text-foreground px-6"
                    aria-label="Close"
                  >
                    Close
                  </Button>
                  {selectedPaper && (
                    <Button
                      onClick={() => downloadPaper(selectedPaper)}
                      className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-6"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </DialogFooter>
              </section>
              <section>
                <PDFViewer pdfUri={selectedPaper?.fileUrl || " "}/>
              </section>
            </DialogContent>
          </Dialog>

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="sm:max-w-2xl bg-gradient-to-b from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 shadow-2xl rounded-2xl text-white p-6 max-h-[90vh] overflow-y-auto">
              <VisuallyHidden>
                <DialogTitle>Edit Paper</DialogTitle>
              </VisuallyHidden>

              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold flex items-center gap-2 text-white">
                  <Edit className="w-5 h-5 text-indigo-400" /> Edit Paper
                </DialogTitle>
              </DialogHeader>

              <form
                onSubmit={editHandleSubmit(handleEditPaper)}
                className="space-y-5 py-4"
                noValidate
              >
                {/* Title */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Title *</Label>
                  <Input
                    {...editRegister("title", {
                      required: "Title is required",
                    })}
                    placeholder="Enter paper title"
                    className="bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  {editErrors.title && (
                    <p className="text-sm text-red-400">
                      {editErrors.title.message}
                    </p>
                  )}
                </div>

                {/* Abstract */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Abstract *</Label>
                  <Textarea
                    {...editRegister("abstractText", {
                      required: "Abstract is required",
                    })}
                    rows={4}
                    placeholder="Enter abstract"
                    className="bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  {editErrors.abstractText && (
                    <p className="text-sm text-red-400">
                      {editErrors.abstractText.message}
                    </p>
                  )}
                </div>

                {/* File URL Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Upload File *</Label>
                  <Input
                    type="file"
                    accept=".pdf,.docx,.txt,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setTimeout(
                          () => editSetValue("fileUrl", file as any),
                          0
                        );
                        setFilePreview(file.name); // Just save the file name, not base64
                      }
                    }}
                    className="bg-gray-800 border border-gray-700 text-white file:text-blue-400"
                  />
                  {filePreview && (
                    <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700 rounded-lg flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-sm truncate">{filePreview}</span>
                    </div>
                  )}
                  {editErrors.fileUrl && (
                    <p className="text-sm text-red-400">
                      {editErrors.fileUrl.message}
                    </p>
                  )}
                </div>

                {/* Thumbnail Image Upload */}
                <div>
                  <Label className="text-sm font-medium">
                    Upload Thumbnail *
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setTimeout(
                          () => editSetValue("thumbnailUrl", file as File),
                          0
                        );
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setThumbnailPreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="bg-gray-800 border border-gray-700 text-white file:text-blue-400"
                  />
                  {thumbnailPreview && (
                    <div className="mt-3 flex justify-center">
                      <div className="relative">
                        <Image
                          unoptimized
                          width={100}
                          height={100}
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-blue-700 shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setThumbnailPreview("");
                            setValue("thumbnail", undefined as any);
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-md"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                  {errors.thumbnail && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.thumbnail.message}
                    </p>
                  )}
                </div>

                {/* Categories */}
                <div>
                  <Label className="text-sm font-medium my-2">Category *</Label>
                  <Select
                    onValueChange={(value) => editSetValue("category", value)}
                  >
                    <SelectTrigger className="bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 text-white border border-gray-700">
                      {categoriesData?.content.map((cat) => (
                        <SelectItem key={cat.uuid} value={cat.uuid}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryUuid && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.categoryUuid.message}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-gray-700 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="bg-gray-700 hover:bg-gray-600 text-white border-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                  >
                    <Edit className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent
              className="sm:max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto bg-card border-0"
              ref={dialogRef}
              tabIndex={-1}
            >
              <DialogHeader className="pb-4">
                <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-200" />
                  </div>
                  Delete Paper
                </DialogTitle>
              </DialogHeader>
              {selectedPaper && (
                <div className="space-y-6 py-2">
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900 dark:to-orange-900 border-0 p-6">
                    <div className="absolute inset-0 bg-red-100 dark:bg-red-800 opacity-20"></div>
                    <div className="relative flex items-start gap-4">
                      <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-200" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">
                          Confirm Deletion
                        </h4>
                        <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">
                          Are you sure you want to delete{" "}
                          <span className="font-semibold">
                            {selectedPaper.title}
                          </span>
                          ? This action cannot be undone and will permanently
                          remove the paper from the system.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl border-0 p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 rounded-xl border-2 border-muted flex-shrink-0">
                        <AvatarImage
                          src={selectedPaper.thumbnailUrl || "/placeholder.svg"}
                          alt={`Thumbnail for ${selectedPaper.title}`}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-slate-400 to-slate-600 dark:from-slate-500 dark:to-slate-700 text-white font-semibold rounded-xl">
                          <FileText className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 space-y-2">
                        <h3 className="font-bold text-foreground text-lg leading-tight">
                          {selectedPaper.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {selectedPaper.abstractText}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700 text-xs"
                          >
                            {selectedPaper.categoryNames[0] || "Uncategorized"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              selectedPaper.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700"
                                : selectedPaper.status === "UNDER_REVIEW"
                                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700"
                                : selectedPaper.status === "DRAFT"
                                ? "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
                                : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
                            }`}
                          >
                            {selectedPaper.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter className="pt-6 border-0 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                  className="border-0 hover:bg-muted text-foreground flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeletePaper}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white shadow-lg flex-1 sm:flex-none"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Paper
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
