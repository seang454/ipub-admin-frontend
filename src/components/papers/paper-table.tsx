/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import type React from "react"
import { useState, useMemo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

import { faker } from "@faker-js/faker"

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
  | "White Paper"

interface Paper {
  uuid: string
  title: string
  abstractText: string
  fileUrl: string
  thumbnailUrl: string
  authorUuid: string
  categoryNames: string[]
  type: PaperType
  status: "APPROVED" | "UNDER_REVIEW" | "DRAFT" | "REJECTED"
  isApproved: boolean
  submittedAt: string
  createdAt: string
  isPublished: boolean
  publishedAt: string | null
}

interface CreateFormData {
  title: string
  abstractText: string
  fileUrl: string
  categoryNames: string[]
}

interface EditFormData {
  title: string
  abstractText: string
  fileUrl: string
  thumbnailUrl: string
  category: string[]
}

interface FormErrors {
  title?: string
  abstractText?: string
  fileUrl?: string
  categoryNames?: string
  category?: string
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
]

const statusOptions = ["All", "APPROVED", "UNDER_REVIEW", "DRAFT", "REJECTED"] as const

const generateFakePapers = (count = 25): Paper[] => {
  const categories = [
    "Artificial Intelligence",
    "Machine Learning",
    "Data Science",
    "Computer Vision",
    "Natural Language Processing",
    "Robotics",
    "Cybersecurity",
    "Cloud Computing",
    "DevOps",
    "Software Engineering",
    "Web Development",
    "Mobile Development",
    "Database Systems",
    "Distributed Systems",
    "Blockchain",
    "IoT",
    "Human-Computer Interaction",
    "Computer Graphics",
    "Network Security",
    "Big Data",
    "Deep Learning",
    "Neural Networks",
    "Computer Architecture",
  ]

  const statuses: Paper["status"][] = ["APPROVED", "UNDER_REVIEW", "DRAFT", "REJECTED"]

  return Array.from({ length: count }, () => {
    const status = faker.helpers.arrayElement(statuses)
    const isApproved = status === "APPROVED"
    const createdAt = faker.date.between({ from: "2023-01-01", to: new Date() })
    const submittedAt = faker.date.between({ from: createdAt, to: new Date() })

    return {
      uuid: faker.string.uuid(),
      title: faker.lorem.sentence({ min: 3, max: 8 }).replace(".", ""),
      abstractText: faker.lorem.paragraphs(2, "\n\n"),
      fileUrl: `https://example.com/papers/${faker.string.uuid()}.pdf`,
      thumbnailUrl: `https://picsum.photos/400/300?random=${faker.number.int({ min: 1, max: 1000 })}`,
      authorUuid: faker.string.uuid(),
      categoryNames: faker.helpers.arrayElements(categories, { min: 1, max: 3 }),
      type: faker.helpers.arrayElement(paperTypes),
      status,
      isApproved,
      submittedAt: submittedAt.toISOString().split("T")[0],
      createdAt: createdAt.toISOString().split("T")[0],
      isPublished: isApproved,
      publishedAt: isApproved
        ? faker.date.between({ from: submittedAt, to: new Date() }).toISOString().split("T")[0]
        : null,
    }
  })
}

export default function PaperManagement() {
  const [papers, setPapers] = useState<Paper[]>(generateFakePapers(25))

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("All")
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  const [createFormData, setCreateFormData] = useState<CreateFormData>({
    title: "",
    abstractText: "",
    fileUrl: "",
    categoryNames: [],
  })

  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: "",
    abstractText: "",
    fileUrl: "",
    thumbnailUrl: "",
    category: [],
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const dialogRef = useRef<HTMLDivElement>(null)

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // Focus dialog when opened
  useEffect(() => {
    if ((viewOpen || editOpen || deleteOpen || addOpen) && dialogRef.current) {
      dialogRef.current.focus()
    }
  }, [viewOpen, editOpen, deleteOpen, addOpen])

  const validateCreateForm = (data: CreateFormData): FormErrors => {
    const errors: FormErrors = {}
    if (!data.title.trim()) errors.title = "Title is required"
    if (!data.abstractText.trim()) errors.abstractText = "Abstract is required"
    if (!data.fileUrl.trim()) {
      errors.fileUrl = "File URL is required"
    } else if (!isValidUrl(data.fileUrl)) {
      errors.fileUrl = "Invalid URL format"
    }
    if (!data.categoryNames.length) errors.categoryNames = "At least one category is required"
    return errors
  }

  const validateEditForm = (data: EditFormData): FormErrors => {
    const errors: FormErrors = {}
    if (!data.title.trim()) errors.title = "Title is required"
    if (!data.abstractText.trim()) errors.abstractText = "Abstract is required"
    if (!data.fileUrl.trim()) {
      errors.fileUrl = "File URL is required"
    } else if (!isValidUrl(data.fileUrl)) {
      errors.fileUrl = "Invalid URL format"
    }
    if (!data.category.length) errors.category = "At least one category is required"
    return errors
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Filtered papers
  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      const matchesSearch =
        paper.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        paper.abstractText.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const matchesStatus = statusFilter === "All" || paper.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [papers, debouncedSearchTerm, statusFilter])

  // Column definitions
  const columns = useMemo<ColumnDef<Paper, any>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Paper",
        cell: (info) => (
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 rounded-lg border-2 border-blue-100">
              <AvatarImage
                src={info.row.original.thumbnailUrl || "/placeholder.svg"}
                alt={`Thumbnail for ${info.getValue<string>()}`}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold rounded-lg">
                <FileText className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 truncate text-sm">{info.getValue<string>()}</p>
              <p className="text-xs text-slate-500 truncate">{info.row.original.abstractText}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {info.row.original.categoryNames.slice(0, 2).map((category: string, idx: number) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 text-xs px-1.5 py-0.5"
                  >
                    {category}
                  </Badge>
                ))}
                {info.row.original.categoryNames.length > 2 && (
                  <Badge
                    variant="outline"
                    className="bg-slate-50 text-slate-600 border-slate-200 text-xs px-1.5 py-0.5"
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
        accessorKey: "type",
        header: "Type",
        cell: (info) => (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 text-xs"
          >
            {info.getValue<string>()}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue<Paper["status"]>()
          const statusConfig = {
            APPROVED: {
              bg: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
              dot: "bg-emerald-500",
            },
            UNDER_REVIEW: {
              bg: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
              dot: "bg-amber-500",
            },
            DRAFT: {
              bg: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100",
              dot: "bg-slate-500",
            },
            REJECTED: {
              bg: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
              dot: "bg-red-500",
            },
          }
          const config = statusConfig[status] || statusConfig["DRAFT"]
          return (
            <Badge variant="secondary" className={`${config.bg} text-xs`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dot}`} />
              {status.replace("_", " ")}
            </Badge>
          )
        },
      },
      {
        accessorKey: "submittedAt",
        header: "Submitted",
        cell: (info) => <div className="text-xs text-slate-600">{info.getValue<string>()}</div>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-indigo-50">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPaper(row.original)
                  setViewOpen(true)
                }}
                className="cursor-pointer hover:bg-indigo-50 text-xs"
              >
                <Eye className="w-3.5 h-3.5 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPaper(row.original)
                  setEditFormData({
                    title: row.original.title,
                    abstractText: row.original.abstractText,
                    fileUrl: row.original.fileUrl,
                    thumbnailUrl: row.original.thumbnailUrl,
                    category: row.original.categoryNames,
                  })
                  setEditOpen(true)
                }}
                className="cursor-pointer hover:bg-indigo-50 text-xs"
              >
                <Edit className="w-3.5 h-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  downloadPaper(row.original)
                }}
                className="cursor-pointer hover:bg-indigo-50 text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPaper(row.original)
                  setDeleteOpen(true)
                }}
                className="text-red-600 cursor-pointer focus:text-red-600 hover:bg-red-50 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  )

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
  })

  const handleAddPaper = () => {
    const errors = validateCreateForm(createFormData)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    const newPaper: Paper = {
      uuid: Date.now().toString(),
      title: createFormData.title,
      abstractText: createFormData.abstractText,
      fileUrl: createFormData.fileUrl,
      thumbnailUrl: "", // Not provided in create form
      categoryNames: createFormData.categoryNames,
      type: "Research Paper", // Default type
      status: "DRAFT", // Default status
      authorUuid: "current-user-uuid",
      isApproved: false,
      submittedAt: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
      isPublished: false,
      publishedAt: null,
    }
    setPapers([...papers, newPaper])
    setCreateFormData({
      title: "",
      abstractText: "",
      fileUrl: "",
      categoryNames: [],
    })
    setFormErrors({})
    setAddOpen(false)
  }

  const handleEditPaper = () => {
    if (!selectedPaper) return
    const errors = validateEditForm(editFormData)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    setPapers(
      papers.map((paper) =>
        paper.uuid === selectedPaper.uuid
          ? {
              ...paper,
              title: editFormData.title,
              abstractText: editFormData.abstractText,
              fileUrl: editFormData.fileUrl,
              thumbnailUrl: editFormData.thumbnailUrl,
              categoryNames: editFormData.category,
            }
          : paper,
      ),
    )
    setFormErrors({})
    setEditOpen(false)
  }

  const handleDeletePaper = () => {
    if (!selectedPaper) return
    setPapers(papers.filter((paper) => paper.uuid !== selectedPaper.uuid))
    setDeleteOpen(false)
  }

  const downloadPaper = async (paper: Paper) => {
    try {
      const response = await fetch(paper.fileUrl)
      if (!response.ok) throw new Error("Failed to access file")
      window.open(paper.fileUrl, "_blank")
    } catch (error) {
      alert("Error downloading file: " + (error as Error).message)
    }
  }

  const handleCreateCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const categories = e.target.value
      .split(",")
      .map((cat) => cat.trim())
      .filter((cat) => cat)
    setCreateFormData({ ...createFormData, categoryNames: categories })
    if (categories.length > 0) {
      setFormErrors((prev) => ({ ...prev, categoryNames: undefined }))
    }
  }

  const handleEditCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const categories = e.target.value
      .split(",")
      .map((cat) => cat.trim())
      .filter((cat) => cat)
    setEditFormData({ ...editFormData, category: categories })
    if (categories.length > 0) {
      setFormErrors((prev) => ({ ...prev, category: undefined }))
    }
  }

  const regenerateFakeData = () => {
    setPapers(generateFakePapers(25))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Updated header styling and content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Paper Management</h2>
                <p className="text-sm text-slate-600">Manage and track research papers ({papers.length} papers)</p>
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
                <Button
                  variant="outline"
                  onClick={regenerateFakeData}
                  className="bg-white border-slate-300 hover:bg-slate-50"
                >
                  Regenerate Data
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-white border-slate-300 hover:bg-slate-50">
                      <Filter className="w-4 h-4 mr-2" />
                      {statusFilter} <ChevronDown className="ml-2 w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40">
                    {statusOptions.map((status) => (
                      <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)} className="cursor-pointer">
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
                  <DialogContent className="sm:max-w-lg" ref={dialogRef} tabIndex={-1}>
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-indigo-600" />
                        Add New Paper
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Title *</Label>
                        <Input
                          value={createFormData.title}
                          onChange={(e) => {
                            setCreateFormData({ ...createFormData, title: e.target.value })
                            setFormErrors((prev) => ({
                              ...prev,
                              title: undefined,
                            }))
                          }}
                          className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                          placeholder="Enter paper title"
                          aria-required="true"
                        />
                        {formErrors.title && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                            {formErrors.title}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Abstract *</Label>
                        <Textarea
                          value={createFormData.abstractText}
                          onChange={(e) => {
                            setCreateFormData({
                              ...createFormData,
                              abstractText: e.target.value,
                            })
                            setFormErrors((prev) => ({
                              ...prev,
                              abstractText: undefined,
                            }))
                          }}
                          className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                          rows={4}
                          placeholder="Enter paper abstract"
                          aria-required="true"
                        />
                        {formErrors.abstractText && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                            {formErrors.abstractText}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">File URL *</Label>
                        <Input
                          type="url"
                          value={createFormData.fileUrl}
                          onChange={(e) => {
                            setCreateFormData({ ...createFormData, fileUrl: e.target.value })
                            setFormErrors((prev) => ({
                              ...prev,
                              fileUrl: undefined,
                            }))
                          }}
                          className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                          placeholder="https://example.com/paper.pdf"
                          aria-required="true"
                        />
                        {formErrors.fileUrl && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                            {formErrors.fileUrl}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Categories *</Label>
                        <Input
                          value={createFormData.categoryNames.join(", ")}
                          onChange={handleCreateCategoryChange}
                          placeholder="e.g. Machine Learning, AI, Data Science"
                          className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                          aria-required="true"
                        />
                        {formErrors.categoryNames && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                            {formErrors.categoryNames}
                          </p>
                        )}
                        <p className="text-xs text-slate-500">Separate multiple categories with commas</p>
                      </div>
                    </div>
                    <DialogFooter className="gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAddOpen(false)
                          setFormErrors({})
                        }}
                        className="border-slate-300"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddPaper} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Paper
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden">
            <div className="w-full">
              <table className="w-full table-fixed">
                <thead className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header, index) => (
                        <th
                          key={header.id}
                          colSpan={header.colSpan}
                          className={`px-3 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100/80 transition-colors ${
                            index === 0
                              ? "w-2/5"
                              : // Paper column - wider
                                index === 1
                                ? "w-1/6"
                                : // Type column
                                  index === 2
                                  ? "w-1/6"
                                  : // Status column
                                    index === 3
                                    ? "w-1/6"
                                    : // Submitted column
                                      "w-16" // Actions column - fixed width
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-2">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() && (
                              <ArrowUp
                                className={`w-3 h-3 ${header.column.getIsSorted() === "desc" ? "rotate-180" : ""}`}
                              />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-25/30"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-3 py-4 overflow-hidden">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="bg-slate-50/50 backdrop-blur-sm border-t border-slate-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="border-slate-300 hover:bg-white shadow-sm"
                  aria-label="Go to first page"
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="border-slate-300 hover:bg-white shadow-sm"
                  aria-label="Go to previous page"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="border-slate-300 hover:bg-white shadow-sm"
                  aria-label="Go to next page"
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="border-slate-300 hover:bg-white shadow-sm"
                  aria-label="Go to last page"
                >
                  Last
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">
                  Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    filteredPapers.length,
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
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto" ref={dialogRef} tabIndex={-1}>
              <DialogHeader className="pb-4">
                <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  Paper Details
                </DialogTitle>
              </DialogHeader>
              {selectedPaper && (
                <div className="space-y-8 py-2">
                  {/* Header Section with Paper Info */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border border-slate-200 shadow-sm">
                    <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] opacity-25"></div>
                    <div className="relative p-8">
                      <div className="flex flex-col lg:flex-row items-start gap-6">
                        <Avatar className="h-24 w-24 rounded-2xl border-4 border-white shadow-lg flex-shrink-0">
                          <AvatarImage
                            src={selectedPaper.thumbnailUrl || "/placeholder.svg"}
                            alt={`Thumbnail for ${selectedPaper.title}`}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-2xl rounded-2xl">
                            <FileText className="h-10 w-10" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 space-y-4">
                          <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">
                              {selectedPaper.title}
                            </h3>
                            <p className="text-slate-600 leading-relaxed text-base">{selectedPaper.abstractText}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedPaper.categoryNames.map((category, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="bg-white/80 text-blue-700 border-blue-200 hover:bg-blue-50 px-3 py-1 text-sm font-medium"
                              >
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <Label className="text-sm font-semibold text-slate-700">Paper Type</Label>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200 text-sm px-4 py-2 font-medium"
                      >
                        {selectedPaper.type}
                      </Badge>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <Label className="text-sm font-semibold text-slate-700">Status</Label>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-sm px-4 py-2 font-medium ${
                          selectedPaper.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : selectedPaper.status === "UNDER_REVIEW"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : selectedPaper.status === "DRAFT"
                                ? "bg-slate-50 text-slate-700 border-slate-200"
                                : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            selectedPaper.status === "APPROVED"
                              ? "bg-emerald-500"
                              : selectedPaper.status === "UNDER_REVIEW"
                                ? "bg-amber-500"
                                : selectedPaper.status === "DRAFT"
                                  ? "bg-slate-500"
                                  : "bg-red-500"
                          }`}
                        />
                        {selectedPaper.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <Label className="text-sm font-semibold text-slate-700">Submitted Date</Label>
                      </div>
                      <p className="text-slate-900 font-semibold text-lg">{selectedPaper.submittedAt}</p>
                    </div>
                  </div>

                  {/* Additional Info Section */}
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 p-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-indigo-600" />
                      Additional Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Published:</span>
                        <span className="font-medium text-slate-900">{selectedPaper.isPublished ? "Yes" : "No"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Approved:</span>
                        <span className="font-medium text-slate-900">{selectedPaper.isApproved ? "Yes" : "No"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Created:</span>
                        <span className="font-medium text-slate-900">{selectedPaper.createdAt}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Published Date:</span>
                        <span className="font-medium text-slate-900">
                          {selectedPaper.publishedAt || "Not published"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter className="pt-6 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => setViewOpen(false)}
                  className="border-slate-300 hover:bg-slate-50 px-6"
                  aria-label="Close"
                >
                  Close
                </Button>
                {selectedPaper && (
                  <Button
                    onClick={() => downloadPaper(selectedPaper)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" ref={dialogRef} tabIndex={-1}>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-indigo-600" />
                  Edit Paper
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Title *</Label>
                  <Input
                    value={editFormData.title}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, title: e.target.value })
                      setFormErrors((prev) => ({ ...prev, title: undefined }))
                    }}
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                    aria-required="true"
                  />
                  {formErrors.title && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {formErrors.title}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Abstract *</Label>
                  <Textarea
                    value={editFormData.abstractText}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, abstractText: e.target.value })
                      setFormErrors((prev) => ({
                        ...prev,
                        abstractText: undefined,
                      }))
                    }}
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                    rows={4}
                    aria-required="true"
                  />
                  {formErrors.abstractText && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {formErrors.abstractText}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">File URL *</Label>
                    <Input
                      type="url"
                      value={editFormData.fileUrl}
                      onChange={(e) => {
                        setEditFormData({ ...editFormData, fileUrl: e.target.value })
                        setFormErrors((prev) => ({ ...prev, fileUrl: undefined }))
                      }}
                      className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                      aria-required="true"
                    />
                    {formErrors.fileUrl && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                        {formErrors.fileUrl}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Thumbnail URL</Label>
                    <Input
                      type="url"
                      value={editFormData.thumbnailUrl}
                      onChange={(e) => setEditFormData({ ...editFormData, thumbnailUrl: e.target.value })}
                      className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Categories *</Label>
                  <Input
                    value={editFormData.category.join(", ")}
                    onChange={handleEditCategoryChange}
                    placeholder="e.g. Machine Learning, AI, Data Science"
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                    aria-required="true"
                  />
                  {formErrors.category && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {formErrors.category}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">Separate multiple categories with commas</p>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditOpen(false)
                    setFormErrors({})
                  }}
                  className="border-slate-300"
                >
                  Cancel
                </Button>
                <Button onClick={handleEditPaper} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent className="sm:max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto" ref={dialogRef} tabIndex={-1}>
              <DialogHeader className="pb-4">
                <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  Delete Paper
                </DialogTitle>
              </DialogHeader>
              {selectedPaper && (
                <div className="space-y-6 py-2">
                  {/* Warning Section */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 p-6">
                    <div className="absolute inset-0 bg-red-100 opacity-20"></div>
                    <div className="relative flex items-start gap-4">
                      <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-red-900 mb-2">Confirm Deletion</h4>
                        <p className="text-sm text-red-800 leading-relaxed">
                          Are you sure you want to delete <span className="font-semibold">{selectedPaper.title}</span>
                          ? This action cannot be undone and will permanently remove the paper from the system.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Paper Preview */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 rounded-xl border-2 border-slate-200 flex-shrink-0">
                        <AvatarImage
                          src={selectedPaper.thumbnailUrl || "/placeholder.svg"}
                          alt={`Thumbnail for ${selectedPaper.title}`}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-slate-400 to-slate-600 text-white font-semibold rounded-xl">
                          <FileText className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 space-y-2">
                        <h3 className="font-bold text-slate-900 text-lg leading-tight">{selectedPaper.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                          {selectedPaper.abstractText}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                            {selectedPaper.type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              selectedPaper.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : selectedPaper.status === "UNDER_REVIEW"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : selectedPaper.status === "DRAFT"
                                    ? "bg-slate-50 text-slate-700 border-slate-200"
                                    : "bg-red-50 text-red-700 border-red-200"
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
              <DialogFooter className="pt-6 border-t border-slate-200 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                  className="border-slate-300 hover:bg-slate-50 flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeletePaper}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg flex-1 sm:flex-none"
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
  )
}
