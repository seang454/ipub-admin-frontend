/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Users,
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
import Image from "next/image";

// Type definitions
type PaperType =
  | "Research Paper"
  | "Case Study"
  | "Technical Review"
  | "Survey Paper"
  | "Position Paper"
  | "Short Paper"
  | "Workshop Paper"
  | "Conference Paper"
  | "Journal Article"
  | "Thesis"
  | "Dissertation"
  | "White Paper";

interface Paper {
  uuid: string;
  title: string;
  abstractText: string;
  fileUrl: string;
  thumbnailUrl: string;
  authorUuid: string;
  categoryNames: string[];
  type: PaperType;
  status: "APPROVED" | "UNDER_REVIEW" | "DRAFT" | "REJECTED";
  isApproved: boolean;
  submittedAt: string;
  createdAt: string;
  isPublished: boolean;
  publishedAt: string | null;
}

interface FormData {
  title: string;
  abstractText: string;
  fileUrl: string;
  thumbnailUrl: string;
  categoryNames: string[];
  type: PaperType;
  status: "APPROVED" | "UNDER_REVIEW" | "DRAFT" | "REJECTED";
}

interface FormErrors {
  title?: string;
  abstractText?: string;
  fileUrl?: string;
  categoryNames?: string;
  type?: string;
}

const paperTypes: PaperType[] = [
  "Research Paper",
  "Case Study",
  "Technical Review",
  "Survey Paper",
  "Position Paper",
  "Short Paper",
  "Workshop Paper",
  "Conference Paper",
  "Journal Article",
  "Thesis",
  "Dissertation",
  "White Paper",
];

const statusOptions = [
  "All",
  "APPROVED",
  "UNDER_REVIEW",
  "DRAFT",
  "REJECTED",
] as const;

export default function PaperManagement() {
  // Initial data
  const [papers, setPapers] = useState<Paper[]>([
    {
      uuid: "b4f46a67-f3a7-4ce4-b2df-73140c40ddb5",
      title: "Learning Applications in Cloud Engineering",
      abstractText:
        "This paper examines how deep learning is transforming cloud engineering, with applications in resource allocation, performance optimization, anomaly detection, and cloud security.",
      fileUrl:
        "https://s3.docuhub.me/docuhub/b43032f0-7eee-415e-9863-fe29cb5ff587.pdf",
      thumbnailUrl:
        "https://s3.docuhub.me/docuhub/87d3dee6-f7bf-4ce2-9ae9-5ed9f6dd2bd3.jpg",
      authorUuid: "539953e8-ba05-4d70-b444-6146ef603a98",
      categoryNames: ["Cloud Engineering"],
      type: "Research Paper",
      status: "APPROVED",
      isApproved: true,
      submittedAt: "2025-09-17",
      createdAt: "2025-09-17",
      isPublished: true,
      publishedAt: null,
    },
    {
      uuid: "a1851367-c896-4310-b7f7-ee980497428e",
      title: "Measuring DevOps Success: Culture, Tools, and Team Efficiency",
      abstractText:
        "Investigates metrics and strategies to evaluate DevOps adoption across industries.",
      fileUrl:
        "https://s3.docuhub.me/docuhub/a1851367-c896-4310-b7f7-ee980497428e.pdf",
      thumbnailUrl:
        "https://s3.docuhub.me/docuhub/a84e2c39-5019-4d36-a067-ff0589ab6f6a.jpg",
      authorUuid: "539953e8-ba05-4d70-b444-6146ef603a98",
      categoryNames: ["DevOps"],
      type: "Case Study",
      status: "UNDER_REVIEW",
      isApproved: false,
      submittedAt: "2025-09-16",
      createdAt: "2025-09-16",
      isPublished: false,
      publishedAt: null,
    },
    {
      uuid: "deep-learning-nlp-001",
      title: "Deep Learning for Natural Language Processing",
      abstractText:
        "This paper explores the latest advancements in deep learning techniques applied to NLP tasks such as machine translation, text summarization, and sentiment analysis.",
      fileUrl: "http://example.com/files/deep-learning-nlp.pdf",
      thumbnailUrl: "http://example.com/thumbnails/deep-learning-nlp.png",
      authorUuid: "539953e8-ba05-4d70-b444-6146ef603a98",
      categoryNames: [
        "Artificial Intelligence",
        "Machine Learning",
        "Natural Language Processing",
      ],
      type: "Technical Review",
      status: "DRAFT",
      isApproved: false,
      submittedAt: "2025-09-15",
      createdAt: "2025-09-15",
      isPublished: false,
      publishedAt: null,
    },
  ]);

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
  const [formData, setFormData] = useState<FormData>({
    title: "",
    abstractText: "",
    fileUrl: "",
    thumbnailUrl: "",
    categoryNames: [],
    type: "Research Paper",
    status: "DRAFT",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const dialogRef = useRef<HTMLDivElement>(null);

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

  // Form validation
  const validateForm = (data: FormData): FormErrors => {
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
    if (!data.type) errors.type = "Paper type is required";
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
    return papers.filter((paper) => {
      const matchesSearch =
        paper.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        paper.abstractText
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || paper.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [papers, debouncedSearchTerm, statusFilter]);

  // Column definitions
  const columns = useMemo<ColumnDef<Paper, any>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Paper",
        cell: (info) => (
          <div className="flex items-center gap-4">
            {info.row.original.thumbnailUrl && (
              <Image
                width={100}
                height={100}
                src={info.row.original.thumbnailUrl}
                alt={`Thumbnail for ${info.getValue<string>()}`}
                className="w-12 h-12 rounded object-cover border border-slate-200 shadow-sm"
                unoptimized
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 truncate">
                {info.getValue<string>()}
              </p>
              <p className="text-sm text-slate-500 truncate line-clamp-2">
                {info.row.original.abstractText}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {info.row.original.categoryNames.map(
                  (category: string, idx: number) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                    >
                      {category}
                    </Badge>
                  )
                )}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: (info) => (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
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
          const statusConfig = {
            APPROVED: {
              bg: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
              dot: "bg-emerald-500",
            },
            UNDER_REVIEW: {
              bg: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
              dot: "bg-yellow-500",
            },
            DRAFT: {
              bg: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100",
              dot: "bg-slate-500",
            },
            REJECTED: {
              bg: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
              dot: "bg-red-500",
            },
          };
          const config = statusConfig[status] || statusConfig["DRAFT"];
          return (
            <Badge variant="secondary" className={config.bg}>
              <div className={`w-2 h-2 rounded-full mr-2 ${config.dot}`} />
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "submittedAt",
        header: "Submitted",
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
                  setSelectedPaper(row.original);
                  setViewOpen(true);
                }}
                className="cursor-pointer hover:bg-indigo-50"
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPaper(row.original);
                  setFormData({
                    title: row.original.title,
                    abstractText: row.original.abstractText,
                    fileUrl: row.original.fileUrl,
                    thumbnailUrl: row.original.thumbnailUrl,
                    categoryNames: row.original.categoryNames,
                    type: row.original.type,
                    status: row.original.status,
                  });
                  setEditOpen(true);
                }}
                className="cursor-pointer hover:bg-indigo-50"
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  downloadPaper(row.original);
                }}
                className="cursor-pointer hover:bg-indigo-50"
              >
                Download
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPaper(row.original);
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

  // Handlers
  const handleAddPaper = () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    const newPaper: Paper = {
      uuid: Date.now().toString(),
      ...formData,
      authorUuid: "current-user-uuid", // Replace with actual user UUID
      isApproved: formData.status === "APPROVED",
      submittedAt: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
      isPublished: formData.status === "APPROVED",
      publishedAt:
        formData.status === "APPROVED"
          ? new Date().toISOString().split("T")[0]
          : null,
    };
    setPapers([...papers, newPaper]);
    setFormData({
      title: "",
      abstractText: "",
      fileUrl: "",
      thumbnailUrl: "",
      categoryNames: [],
      type: "Research Paper",
      status: "DRAFT",
    });
    setFormErrors({});
    setAddOpen(false);
  };

  const handleEditPaper = () => {
    if (!selectedPaper) return;
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setPapers(
      papers.map((paper) =>
        paper.uuid === selectedPaper.uuid
          ? {
              ...paper,
              ...formData,
              isApproved: formData.status === "APPROVED",
              isPublished: formData.status === "APPROVED",
              publishedAt:
                formData.status === "APPROVED"
                  ? new Date().toISOString().split("T")[0]
                  : paper.publishedAt,
            }
          : paper
      )
    );
    setFormErrors({});
    setEditOpen(false);
  };

  const handleDeletePaper = () => {
    if (!selectedPaper) return;
    setPapers(papers.filter((paper) => paper.uuid !== selectedPaper.uuid));
    setDeleteOpen(false);
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const categories = e.target.value
      .split(",")
      .map((cat) => cat.trim())
      .filter((cat) => cat);
    setFormData({ ...formData, categoryNames: categories });
    if (categories.length > 0) {
      setFormErrors((prev) => ({ ...prev, categoryNames: undefined }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Paper Management
            </h2>
            <p className="text-sm text-slate-600">
              Manage and track research papers
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search papers by title or abstract..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white shadow-sm"
              aria-label="Search papers"
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
                {statusOptions.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className="cursor-pointer"
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                  aria-label="Add new paper"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Paper
                </Button>
              </DialogTrigger>
              <DialogContent
                className="sm:max-w-lg"
                ref={dialogRef}
                tabIndex={-1}
              >
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-slate-900">
                    Add New Paper
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      Title *
                    </Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        setFormErrors((prev) => ({
                          ...prev,
                          title: undefined,
                        }));
                      }}
                      className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                      aria-required="true"
                    />
                    {formErrors.title && (
                      <p className="text-sm text-red-600">{formErrors.title}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      Type *
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) => {
                        setFormData({ ...formData, type: v as PaperType });
                        setFormErrors((prev) => ({ ...prev, type: undefined }));
                      }}
                    >
                      <SelectTrigger className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500">
                        <SelectValue placeholder="Select paper type" />
                      </SelectTrigger>
                      <SelectContent>
                        {paperTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.type && (
                      <p className="text-sm text-red-600">{formErrors.type}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      Abstract *
                    </Label>
                    <Input
                      value={formData.abstractText}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          abstractText: e.target.value,
                        });
                        setFormErrors((prev) => ({
                          ...prev,
                          abstractText: undefined,
                        }));
                      }}
                      className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                      aria-required="true"
                    />
                    {formErrors.abstractText && (
                      <p className="text-sm text-red-600">
                        {formErrors.abstractText}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      Categories (comma-separated) *
                    </Label>
                    <Input
                      value={formData.categoryNames.join(", ")}
                      onChange={handleCategoryChange}
                      placeholder="e.g. Machine Learning, AI, Data Science"
                      className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                      aria-required="true"
                    />
                    {formErrors.categoryNames && (
                      <p className="text-sm text-red-600">
                        {formErrors.categoryNames}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        File URL *
                      </Label>
                      <Input
                        type="url"
                        value={formData.fileUrl}
                        onChange={(e) => {
                          setFormData({ ...formData, fileUrl: e.target.value });
                          setFormErrors((prev) => ({
                            ...prev,
                            fileUrl: undefined,
                          }));
                        }}
                        className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                        aria-required="true"
                      />
                      {formErrors.fileUrl && (
                        <p className="text-sm text-red-600">
                          {formErrors.fileUrl}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        Thumbnail URL
                      </Label>
                      <Input
                        type="url"
                        value={formData.thumbnailUrl}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            thumbnailUrl: e.target.value,
                          })
                        }
                        className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          status: v as Paper["status"],
                        })
                      }
                    >
                      <SelectTrigger className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="UNDER_REVIEW">
                          Under Review
                        </SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAddOpen(false);
                      setFormErrors({});
                    }}
                    className="border-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddPaper}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add Paper
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

      {/* Pagination */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="border-slate-300 hover:bg-white"
              aria-label="Go to first page"
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-slate-300 hover:bg-white"
              aria-label="Go to previous page"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-slate-300 hover:bg-white"
              aria-label="Go to next page"
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="border-slate-300 hover:bg-white"
              aria-label="Go to last page"
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
                filteredPapers.length
              )}{" "}
              of {filteredPapers.length} Papers
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

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-md" ref={dialogRef} tabIndex={-1}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Paper Details
            </DialogTitle>
          </DialogHeader>
          {selectedPaper && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                {selectedPaper.thumbnailUrl && (
                  <Image
                    width={100}
                    height={100}
                    src={selectedPaper.thumbnailUrl}
                    alt={`Thumbnail for ${selectedPaper.title}`}
                    className="w-16 h-16 rounded object-cover border border-slate-200 shadow-sm"
                    unoptimized
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 text-lg">
                    {selectedPaper.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {selectedPaper.abstractText}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Type
                  </Label>
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200"
                  >
                    {selectedPaper.type}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Status
                  </Label>
                  <Badge
                    variant="secondary"
                    className={
                      selectedPaper.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : selectedPaper.status === "UNDER_REVIEW"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : selectedPaper.status === "DRAFT"
                        ? "bg-slate-50 text-slate-700 border-slate-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        selectedPaper.status === "APPROVED"
                          ? "bg-emerald-500"
                          : selectedPaper.status === "UNDER_REVIEW"
                          ? "bg-yellow-500"
                          : selectedPaper.status === "DRAFT"
                          ? "bg-slate-500"
                          : "bg-red-500"
                      }`}
                    />
                    {selectedPaper.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Categories
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedPaper.categoryNames.map((category, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Submitted
                  </Label>
                  <p className="text-sm text-slate-900">
                    {selectedPaper.submittedAt}
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
              aria-label="Close"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          className="sm:max-w-2xl max-h-[80vh] overflow-y-auto"
          ref={dialogRef}
          tabIndex={-1}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Edit Paper
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Title *
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  setFormErrors((prev) => ({ ...prev, title: undefined }));
                }}
                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                aria-required="true"
              />
              {formErrors.title && (
                <p className="text-sm text-red-600">{formErrors.title}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Type *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(v) => {
                  setFormData({ ...formData, type: v as PaperType });
                  setFormErrors((prev) => ({ ...prev, type: undefined }));
                }}
              >
                <SelectTrigger className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500">
                  <SelectValue placeholder="Select paper type" />
                </SelectTrigger>
                <SelectContent>
                  {paperTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.type && (
                <p className="text-sm text-red-600">{formErrors.type}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Abstract *
              </Label>
              <Input
                value={formData.abstractText}
                onChange={(e) => {
                  setFormData({ ...formData, abstractText: e.target.value });
                  setFormErrors((prev) => ({
                    ...prev,
                    abstractText: undefined,
                  }));
                }}
                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                aria-required="true"
              />
              {formErrors.abstractText && (
                <p className="text-sm text-red-600">
                  {formErrors.abstractText}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Categories (comma-separated) *
              </Label>
              <Input
                value={formData.categoryNames.join(", ")}
                onChange={handleCategoryChange}
                placeholder="e.g. Machine Learning, AI, Data Science"
                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                aria-required="true"
              />
              {formErrors.categoryNames && (
                <p className="text-sm text-red-600">
                  {formErrors.categoryNames}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  File URL *
                </Label>
                <Input
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, fileUrl: e.target.value });
                    setFormErrors((prev) => ({ ...prev, fileUrl: undefined }));
                  }}
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                  aria-required="true"
                />
                {formErrors.fileUrl && (
                  <p className="text-sm text-red-600">{formErrors.fileUrl}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Thumbnail URL
                </Label>
                <Input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnailUrl: e.target.value })
                  }
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  setFormData({ ...formData, status: v as Paper["status"] })
                }
              >
                <SelectTrigger className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditOpen(false);
                setFormErrors({});
              }}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditPaper}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md" ref={dialogRef} tabIndex={-1}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Delete Paper
            </DialogTitle>
          </DialogHeader>
          {selectedPaper && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-800">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{selectedPaper.title}</span>?
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                {selectedPaper.thumbnailUrl && (
                  <Image
                    width={100}
                    height={100}
                    src={selectedPaper.thumbnailUrl}
                    alt={`Thumbnail for ${selectedPaper.title}`}
                    className="w-12 h-12 rounded object-cover border border-slate-200 shadow-sm"
                    unoptimized
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">
                    {selectedPaper.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {selectedPaper.abstractText}
                  </p>
                  <p className="text-sm text-slate-600">{selectedPaper.type}</p>
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
              onClick={handleDeletePaper}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Paper
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
