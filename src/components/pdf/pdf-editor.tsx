/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import type React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  FileText,
  Upload,
  Download,
  File,
  ImageIcon,
  Undo,
  Redo,
  Type,
  Edit3,
  PenTool,
  Minus,
  Eraser,
  Highlighter,
  Stamp,
  LinkIcon,
  StickyNote,
  Settings,
  Printer,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Save,
  Share2,
  Eye,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useFiles } from "@/hooks/use-storage";
import { sampleFiles } from "@/lib/pdf/sample-data";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { ThemeToggle } from "./them-toggle";

interface Annotation {
  id: string;
  type: "highlight" | "note" | "draw" | "text" | "line" | "stamp" | "link";
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  color: string;
  page: number;
  path?: string; // for drawing
}

export default function PDFEditor() {
  const { files, addFile, removeFile } = useFiles();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [selectedTool, setSelectedTool] = useState<string>("select");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [undoStack, setUndoStack] = useState<Annotation[][]>([]);
  const [redoStack, setRedoStack] = useState<Annotation[][]>([]);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [viewMode, setViewMode] = useState<"original" | "edited" | "comparison">("edited");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);

  // Store actual File objects for uploaded files
  const [fileObjects, setFileObjects] = useState<Record<string, File>>({});

  const generateFilePreview = useCallback(async (file: File) => {
    if (file.type === "application/pdf") {
      return URL.createObjectURL(file); // Use object URL for PDFs
    } else if (file.type.startsWith("image/")) {
      return URL.createObjectURL(file); // Use object URL for images
    } else {
      return "/placeholder.svg?height=600&width=400&text=Document";
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const files = e.dataTransfer.files;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const previewUrl = await generateFilePreview(file);
        const fileItem: any = {
          id: `${file.lastModified}-${file.name}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: previewUrl,
          lastModified: file.lastModified,
          uploadedAt: Date.now(),
          pages: file.type === "application/pdf" ? 1 : 1, // Will be updated after loading
          tags: [],
        };
        addFile(fileItem);
        setFileObjects((prev) => ({ ...prev, [fileItem.id]: file }));
        setSelectedFile(fileItem);
        console.log("[v0] File added:", fileItem);
      }
    },
    [addFile, generateFilePreview]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const previewUrl = await generateFilePreview(file);
          const fileItem: any = {
            id: `${file.lastModified}-${file.name}`,
            name: file.name,
            type: file.type,
            size: file.size,
            url: previewUrl,
            lastModified: file.lastModified,
            uploadedAt: Date.now(),
            pages: file.type === "application/pdf" ? 1 : 1, // Will be updated after loading
            tags: [],
          };
          addFile(fileItem);
          setFileObjects((prev) => ({ ...prev, [fileItem.id]: file }));
          setSelectedFile(fileItem);
          console.log("[v0] File added via input:", fileItem);
        }
      }
    },
    [addFile, generateFilePreview]
  );

  useEffect(() => {
    if (files.length === 0) {
      sampleFiles.forEach((sampleFile) => {
        const fileItem = {
          id: sampleFile.id,
          name: sampleFile.name,
          type: sampleFile.type,
          size: sampleFile.size,
          url: sampleFile.thumbnail, // Use sample thumbnail or actual file URL
          lastModified: new Date(sampleFile.lastModified).getTime(),
          uploadedAt: Date.now(),
          pages: sampleFile.pages,
          tags: sampleFile.tags,
        };
        addFile(fileItem);
      });
    }
  }, [files.length, addFile]);

  useEffect(() => {
    if (selectedFile && annotations.length > 0) {
      localStorage.setItem(
        `annotations_${selectedFile.id}`,
        JSON.stringify(annotations)
      );
    }
  }, [annotations, selectedFile]);

  useEffect(() => {
    if (selectedFile) {
      const savedAnnotations = localStorage.getItem(
        `annotations_${selectedFile.id}`
      );
      if (savedAnnotations) {
        setAnnotations(JSON.parse(savedAnnotations));
      } else {
        setAnnotations([]);
      }
    }
  }, [selectedFile]);

  const handleToolAction = useCallback(
    (toolId: string) => {
      console.log("[v0] Tool selected:", toolId);

      switch (toolId) {
        case "thumbnails":
          setShowThumbnails(!showThumbnails);
          break;
        case "undo":
          if (undoStack.length > 0) {
            const previousState = undoStack[undoStack.length - 1];
            setRedoStack([...redoStack, annotations]);
            setAnnotations(previousState);
            setUndoStack(undoStack.slice(0, -1));
          }
          break;
        case "redo":
          if (redoStack.length > 0) {
            const nextState = redoStack[redoStack.length - 1];
            setUndoStack([...undoStack, annotations]);
            setAnnotations(nextState);
            setRedoStack(redoStack.slice(0, -1));
          }
          break;
        case "text":
        case "edit-text":
        case "sign":
        case "line":
        case "draw":
        case "eraser":
        case "highlight":
        case "text-highlight":
        case "image":
        case "stamp":
        case "link":
        case "note":
          setSelectedTool(toolId);
          break;
        case "settings":
          alert("Document editor settings");
          break;
        case "print":
          window.print();
          break;
        case "search":
          const searchTerm = prompt("Search in document:");
          if (searchTerm) {
            console.log("[v0] Searching for:", searchTerm);
          }
          break;
        default:
          setSelectedTool(toolId);
      }
    },
    [showThumbnails, undoStack, redoStack, annotations]
  );

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!selectedTool || selectedTool === "select") return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      console.log("[v0] Canvas interaction:", selectedTool, x, y);

      switch (selectedTool) {
        case "draw":
          setIsDrawing(true);
          setCurrentPath(`M ${x} ${y}`);
          break;
        case "highlight":
          setIsDrawing(true);
          break;
        case "text":
          const textContent = prompt("Enter text:");
          if (textContent) {
            const newAnnotation: Annotation = {
              id: Date.now().toString(),
              type: "text",
              x,
              y,
              content: textContent,
              color: "#000000",
              page: currentPage,
            };
            setUndoStack([...undoStack, annotations]);
            setAnnotations([...annotations, newAnnotation]);
          }
          break;
        case "note":
          const noteContent = prompt("Enter note:");
          if (noteContent) {
            const newAnnotation: Annotation = {
              id: Date.now().toString(),
              type: "note",
              x,
              y,
              content: noteContent,
              color: "#ffff00",
              page: currentPage,
            };
            setUndoStack([...undoStack, annotations]);
            setAnnotations([...annotations, newAnnotation]);
          }
          break;
        case "stamp":
          const newStamp: Annotation = {
            id: Date.now().toString(),
            type: "stamp",
            x,
            y,
            content: "✓",
            color: "#ff0000",
            page: currentPage,
          };
          setUndoStack([...undoStack, annotations]);
          setAnnotations([...annotations, newStamp]);
          break;
      }
    },
    [selectedTool, currentPage, annotations, undoStack]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || selectedTool !== "draw") return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setCurrentPath((prev) => `${prev} L ${x} ${y}`);
    },
    [isDrawing, selectedTool]
  );

  const handleCanvasMouseUp = useCallback(() => {
    if (isDrawing && selectedTool === "draw" && currentPath) {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: "draw",
        x: 0,
        y: 0,
        path: currentPath,
        color: "#000000",
        page: currentPage,
      };
      setUndoStack([...undoStack, annotations]);
      setAnnotations([...annotations, newAnnotation]);
      setCurrentPath("");
    }
    setIsDrawing(false);
  }, [
    isDrawing,
    selectedTool,
    currentPath,
    currentPage,
    annotations,
    undoStack,
  ]);

  const handleSave = useCallback(() => {
    if (selectedFile) {
      localStorage.setItem(
        `annotations_${selectedFile.id}`,
        JSON.stringify(annotations)
      );
      localStorage.setItem(
        `file_${selectedFile.id}_lastSaved`,
        Date.now().toString()
      );
      alert("File saved successfully!");
    }
  }, [selectedFile, annotations]);

  const handleShare = useCallback(() => {
    if (selectedFile) {
      const shareData = {
        title: selectedFile.name,
        text: `Check out this document: ${selectedFile.name}`,
        url: window.location.href,
      };

      if (navigator.share) {
        navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    }
  }, [selectedFile]);

  const handleDownload = useCallback(() => {
    if (selectedFile) {
      const link = document.createElement("a");
      link.href = selectedFile.url;
      link.download = selectedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [selectedFile]);

  const tools = [
    { id: "thumbnails", icon: Grid3X3, label: "Thumbnails" },
    { id: "undo", icon: Undo, label: "Undo" },
    { id: "redo", icon: Redo, label: "Redo" },
    { id: "text", icon: Type, label: "Text" },
    { id: "edit-text", icon: Edit3, label: "Edit text" },
    { id: "sign", icon: PenTool, label: "Sign" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "draw", icon: PenTool, label: "Draw" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
    { id: "highlight", icon: Highlighter, label: "Highlight" },
    { id: "text-highlight", icon: Highlighter, label: "Text highlight" },
    { id: "image", icon: ImageIcon, label: "Image" },
    { id: "stamp", icon: Stamp, label: "Stamp" },
    { id: "link", icon: LinkIcon, label: "Link" },
    { id: "note", icon: StickyNote, label: "Note" },
  ];

  const rightTools = [
    { id: "settings", icon: Settings, label: "Document editor" },
    { id: "print", icon: Printer, label: "Print" },
    { id: "search", icon: Search, label: "Search" },
  ];

  if (!selectedFile && files.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b border-border px-4 sm:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-foreground">
                PDFAid
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden sm:flex items-center space-x-3">
                <ThemeToggle />
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl bg-transparent"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl bg-transparent"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </div>
              <div className="sm:hidden">
                <ThemeToggle />
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg text-sm sm:text-base px-3 sm:px-4">
                Done ✓
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 sm:p-6">
          <Card className="w-full max-w-md bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6 sm:p-8">
              <div
                className={cn(
                  "border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-300",
                  dragActive
                    ? "border-primary bg-primary/10 scale-105"
                    : "border-border hover:border-primary/50 hover:bg-accent/5"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-muted-foreground" />
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                  Upload PDF Files
                </h3>
                <p className="text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                  Drag and drop your PDF files here, or click to select
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg px-4 sm:px-6"
                >
                  Choose Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.wav,.txt,.doc,.docx"
                />
              </div>
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground mb-3 sm:mb-4">
                  Or try sample files:
                </h4>
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {sampleFiles.slice(0, 3).map((sample) => (
                    <Button
                      key={sample.id}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left bg-transparent rounded-xl hover:bg-accent/50 transition-all duration-200 p-3"
                      onClick={() => {
                        const fileItem = {
                          id: sample.id,
                          name: sample.name,
                          type: sample.type,
                          size: sample.size,
                          url: sample.thumbnail, // Use actual file URL for samples
                          lastModified: new Date(sample.lastModified).getTime(),
                          uploadedAt: Date.now(),
                          pages: sample.pages,
                          tags: sample.tags,
                        };
                        addFile(fileItem);
                        setSelectedFile(fileItem);
                        setTotalPages(sample.pages);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-3 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate text-foreground">
                          {sample.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {sample.pages} pages
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If we have files but no selected file, select the first one
  if (!selectedFile && files.length > 0) {
    const firstFile = files[0];
    setSelectedFile(firstFile);
    setTotalPages(firstFile.pages || 1);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-card border-b border-border px-3 sm:px-4 lg:px-6 py-3 sm:py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-primary-foreground" />
            </div>
            <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-foreground">
              PDFAid
            </h1>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
            <div className="hidden xl:flex items-center space-x-2">
              <ThemeToggle />
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl bg-transparent"
                >
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl bg-transparent"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl bg-transparent"
                onClick={handleSave}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl bg-transparent"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
            <div className="hidden lg:block xl:hidden">
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="xl:hidden p-2 h-9 w-9 rounded-xl"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg text-xs sm:text-sm px-2 sm:px-3 lg:px-4 h-8 sm:h-9">
              Done ✓
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card border-b border-border px-2 sm:px-4 lg:px-6 py-2 sm:py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden flex-shrink-0 p-2 h-8 w-8 rounded-lg mr-2"
              onClick={() => setToolbarCollapsed(!toolbarCollapsed)}
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div
              className={cn(
                "flex items-center space-x-1 sm:space-x-2 transition-all duration-300",
                toolbarCollapsed && "hidden md:flex"
              )}
            >
              {tools.map((tool) => (
                <Button
                  key={tool.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex flex-col items-center justify-center p-1.5 sm:p-2 lg:p-3 h-auto min-w-[44px] sm:min-w-[60px] lg:min-w-[70px] rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md touch-manipulation",
                    selectedTool === tool.id &&
                      "bg-primary text-primary-foreground shadow-lg scale-105"
                  )}
                  onClick={() => handleToolAction(tool.id)}
                >
                  <tool.icon className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1" />
                  <span className="text-[10px] sm:text-xs font-medium hidden sm:block leading-tight">
                    {tool.label}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-0.5 bg-muted rounded-xl p-0.5 sm:p-1 flex-shrink-0 ml-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-[10px] sm:text-xs px-1.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 h-7 sm:h-8",
                viewMode === "original" &&
                  "bg-background shadow-sm text-foreground"
              )}
              onClick={() => setViewMode("original")}
            >
              Original
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-[10px] sm:text-xs px-1.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 h-7 sm:h-8",
                viewMode === "edited" &&
                  "bg-background shadow-sm text-foreground"
              )}
              onClick={() => setViewMode("edited")}
            >
              Edited
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-[10px] sm:text-xs px-1.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 h-7 sm:h-8",
                viewMode === "comparison" &&
                  "bg-background shadow-sm text-foreground"
              )}
              onClick={() => setViewMode("comparison")}
            >
              Compare
            </Button>
          </div>

          <div className="hidden lg:flex items-center space-x-1 sm:space-x-2">
            {rightTools.map((tool) => (
              <Button
                key={tool.id}
                variant="ghost"
                size="sm"
                className="flex flex-col items-center justify-center p-2 sm:p-3 h-auto min-w-[60px] sm:min-w-[70px] rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md"
                onClick={() => handleToolAction(tool.id)}
              >
                <tool.icon className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
                <span className="text-xs font-medium">{tool.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {showThumbnails && (
          <div
            className={cn(
              "bg-sidebar-background border-r border-border flex flex-col transition-all duration-300 ease-in-out",
              "w-full sm:w-72 md:w-80 lg:w-80 xl:w-96",
              "absolute lg:relative z-20 lg:z-auto",
              "h-full",
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            )}
          >
            <div className="flex items-center justify-between p-3 sm:p-4 lg:hidden border-b border-border">
              <h3 className="text-sm font-semibold text-sidebar-foreground">
                Navigation
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {files.length > 1 && (
              <div className="p-3 sm:p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-sm font-semibold text-sidebar-foreground">
                    Files ({files.length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 w-8 p-0 rounded-lg touch-manipulation"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>

                <div
                  className={cn(
                    "border border-dashed rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 text-center transition-all duration-300 cursor-pointer touch-manipulation",
                    dragActive
                      ? "border-primary bg-primary/10 scale-105"
                      : "border-border hover:border-primary/50 hover:bg-accent/5 active:bg-accent/10"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Drop files here or tap
                  </p>
                </div>
                <div className="space-y-2 max-h-32 sm:max-h-40 lg:max-h-48 overflow-y-auto">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className={cn(
                        "flex items-center justify-between p-2 sm:p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 touch-manipulation",
                        selectedFile?.id === file.id
                          ? "border-primary bg-primary/20 shadow-sm"
                          : "border-border hover:bg-accent/50 active:bg-accent/70"
                      )}
                      onClick={() => {
                        setSelectedFile(file);
                        setSidebarOpen(false);
                      }}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                        <span
                          className={cn(
                            "text-sm font-medium truncate",
                            selectedFile?.id === file.id
                              ? "text-primary-foreground"
                              : "text-foreground"
                          )}
                        >
                          {file.name}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-lg touch-manipulation"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.wav,.txt,.doc,.docx"
            />

            <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
              <h3 className="text-sm font-semibold text-sidebar-foreground mb-3 sm:mb-4">
                Pages
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-3">
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
                  <div
                    key={i + 1}
                    className={cn(
                      "border-2 rounded-xl p-2 sm:p-3 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 touch-manipulation",
                      currentPage === i + 1 &&
                        "border-primary bg-primary/10 shadow-lg scale-105"
                    )}
                    onClick={() => {
                      setCurrentPage(i + 1);
                      setSidebarOpen(false);
                    }}
                  >
                    <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center mb-2">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-medium text-foreground">
                        {i + 1}
                      </span>
                      {currentPage === i + 1 && (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs mt-1 sm:mt-2 mx-auto shadow-lg">
                          !
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 lg:hidden touch-manipulation"
            onClick={() => setSidebarOpen(false)}
            onTouchStart={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-2 sm:p-4 lg:p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
              {viewMode === "comparison" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Original View */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Original
                    </h3>
                    <Card className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                      <CardContent className="p-0 relative">
                        <div className="relative">
                          {selectedFile ? (
                            selectedFile.type === "application/pdf" ? (
                              <div className="w-full h-[400px] sm:h-[600px] bg-white rounded-lg border overflow-auto">
                                <Document
                                  file={fileObjects[selectedFile.id] || selectedFile.url}
                                  onLoadSuccess={({ numPages }) => {
                                    setTotalPages(numPages);
                                  }}
                                  onLoadError={(error) => {
                                    console.error("[v0] PDF load error:", error);
                                  }}
                                >
                                  <Page
                                    pageNumber={currentPage}
                                    scale={zoom / 100}
                                    width={800}
                                  />
                                </Document>
                              </div>
                            ) : selectedFile.type.startsWith("image/") ? (
                              <Image
                                width={800}
                                height={600}
                                src={selectedFile.url || "/placeholder.svg"}
                                alt={selectedFile.name}
                                className="w-full h-[400px] sm:h-[600px] object-contain rounded-lg bg-white"
                                style={{ transform: `scale(${zoom / 100})` }}
                                onError={(e) => {
                                  console.log("[v0] Image load error:", e);
                                  e.currentTarget.src =
                                    "/placeholder.svg?height=600&width=400&text=Image+Load+Error";
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-[400px] sm:h-[600px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <div className="text-center">
                                  <File className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {selectedFile.name}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    File type: {selectedFile.type}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Preview not available for this file type
                                  </p>
                                </div>
                              </div>
                            )
                          ) : (
                            <div className="flex items-center justify-center h-[400px] sm:h-[600px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                              <div className="text-center">
                                <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                  Select a file to preview
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Edited View */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Edited (
                      {annotations.filter((a) => a.page === currentPage).length}{" "}
                      annotations)
                    </h3>
                    <Card className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                      <CardContent className="p-0 relative">
                        <div className="relative">
                          {selectedFile ? (
                            selectedFile.type === "application/pdf" ? (
                              <div className="w-full h-[400px] sm:h-[600px] bg-white rounded-lg border overflow-auto">
                                <Document
                                  file={fileObjects[selectedFile.id] || selectedFile.url}
                                  onLoadSuccess={({ numPages }) => {
                                    setTotalPages(numPages);
                                  }}
                                  onLoadError={(error) => {
                                    console.error("[v0] PDF load error:", error);
                                  }}
                                >
                                  <Page
                                    pageNumber={currentPage}
                                    scale={zoom / 100}
                                    width={800}
                                  />
                                </Document>
                              </div>
                            ) : selectedFile.type.startsWith("image/") ? (
                              <Image
                                width={800}
                                height={600}
                                src={selectedFile.url || "/placeholder.svg"}
                                alt={selectedFile.name}
                                className="w-full h-[400px] sm:h-[600px] object-contain rounded-lg bg-white"
                                style={{ transform: `scale(${zoom / 100})` }}
                                onError={(e) => {
                                  console.log("[v0] Image load error:", e);
                                  e.currentTarget.src =
                                    "/placeholder.svg?height=600&width=400&text=Image+Load+Error";
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-[400px] sm:h-[600px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <div className="text-center">
                                  <File className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {selectedFile.name}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    File type: {selectedFile.type}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Editing tools available
                                  </p>
                                </div>
                              </div>
                            )
                          ) : (
                            <div className="flex items-center justify-center h-[400px] sm:h-[600px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                              <div className="text-center">
                                <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                  Select a file to edit
                                </p>
                              </div>
                            </div>
                          )}
                          <canvas
                            ref={canvasRef}
                            className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                            style={{
                              pointerEvents:
                                selectedTool !== "select" ? "auto" : "none",
                              transform: `scale(${zoom / 100})`,
                            }}
                            onMouseDown={handleCanvasMouseDown}
                            onMouseMove={handleCanvasMouseMove}
                            onMouseUp={handleCanvasMouseUp}
                            onTouchStart={(e) => {
                              const touch = e.touches[0];
                              const mouseEvent = new MouseEvent("mousedown", {
                                clientX: touch.clientX,
                                clientY: touch.clientY,
                              });
                              handleCanvasMouseDown(mouseEvent as any);
                            }}
                            onTouchMove={(e) => {
                              e.preventDefault();
                              const touch = e.touches[0];
                              const mouseEvent = new MouseEvent("mousemove", {
                                clientX: touch.clientX,
                                clientY: touch.clientY,
                              });
                              handleCanvasMouseMove(mouseEvent as any);
                            }}
                            onTouchEnd={(e) => {
                              e.preventDefault();
                              handleCanvasMouseUp();
                            }}
                          />
                          {viewMode === "edited" &&
                            annotations
                              .filter(
                                (annotation) => annotation.page === currentPage
                              )
                              .map((annotation) => (
                                <div
                                  key={annotation.id}
                                  className="absolute pointer-events-none"
                                  style={{
                                    left: annotation.x,
                                    top: annotation.y,
                                    color: annotation.color,
                                    transform: `scale(${zoom / 100})`,
                                  }}
                                >
                                  {annotation.type === "text" && (
                                    <div className="bg-white border border-gray-300 p-1 text-sm text-gray-900">
                                      {annotation.content}
                                    </div>
                                  )}
                                  {annotation.type === "note" && (
                                    <div className="bg-yellow-200 border border-yellow-400 p-2 text-sm max-w-32 sm:max-w-48 text-gray-900">
                                      {annotation.content}
                                    </div>
                                  )}
                                  {annotation.type === "stamp" && (
                                    <div className="text-xl sm:text-2xl font-bold">
                                      {annotation.content}
                                    </div>
                                  )}
                                  {annotation.type === "draw" &&
                                    annotation.path && (
                                      <svg className="absolute inset-0 pointer-events-none">
                                        <path
                                          d={annotation.path}
                                          stroke={annotation.color}
                                          strokeWidth="2"
                                          fill="none"
                                        />
                                      </svg>
                                    )}
                                </div>
                              ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                  <CardContent className="p-0 relative">
                    <div className="relative">
                      {selectedFile ? (
                        selectedFile.type === "application/pdf" ? (
                          <div className="w-full h-[500px] sm:h-[800px] bg-white rounded-lg border overflow-auto">
                            <Document
                              file={fileObjects[selectedFile.id] || selectedFile.url}
                              onLoadSuccess={({ numPages }) => {
                                setTotalPages(numPages);
                              }}
                              onLoadError={(error) => {
                                console.error("[v0] PDF load error:", error);
                              }}
                            >
                              <Page
                                pageNumber={currentPage}
                                scale={zoom / 100}
                                width={800}
                              />
                            </Document>
                          </div>
                        ) : selectedFile.type.startsWith("image/") ? (
                          <Image
                            width={800}
                            height={600}
                            src={selectedFile.url || "/placeholder.svg"}
                            alt={selectedFile.name}
                            className="w-full h-auto rounded-lg"
                            style={{ transform: `scale(${zoom / 100})` }}
                            onError={(e) => {
                              console.log("[v0] Image load error:", e);
                              e.currentTarget.src =
                                "/placeholder.svg?height=600&width=400&text=Image+Load+Error";
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-[500px] sm:h-[800px] text-muted-foreground">
                            <div className="text-center">
                              <File className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" />
                              <p className="text-sm">
                                Preview not available for this file type
                              </p>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center justify-center h-[500px] sm:h-[800px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <div className="text-center">
                            <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                            <p className="text-sm text-gray-600">
                              Select a file to preview
                            </p>
                          </div>
                        </div>
                      )}

                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                        style={{
                          pointerEvents:
                            selectedTool !== "select" ? "auto" : "none",
                          transform: `scale(${zoom / 100})`,
                        }}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onTouchStart={(e) => {
                          const touch = e.touches[0];
                          const mouseEvent = new MouseEvent("mousedown", {
                            clientX: touch.clientX,
                            clientY: touch.clientY,
                          });
                          handleCanvasMouseDown(mouseEvent as any);
                        }}
                        onTouchMove={(e) => {
                          e.preventDefault();
                          const touch = e.touches[0];
                          const mouseEvent = new MouseEvent("mousemove", {
                            clientX: touch.clientX,
                            clientY: touch.clientY,
                          });
                          handleCanvasMouseMove(mouseEvent as any);
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          handleCanvasMouseUp();
                        }}
                      />

                      {viewMode === "edited" &&
                        annotations
                          .filter(
                            (annotation) => annotation.page === currentPage
                          )
                          .map((annotation) => (
                            <div
                              key={annotation.id}
                              className="absolute pointer-events-none"
                              style={{
                                left: annotation.x,
                                top: annotation.y,
                                color: annotation.color,
                                transform: `scale(${zoom / 100})`,
                              }}
                            >
                              {annotation.type === "text" && (
                                <div className="bg-white border border-gray-300 p-1 text-sm text-gray-900">
                                  {annotation.content}
                                </div>
                              )}
                              {annotation.type === "note" && (
                                <div className="bg-yellow-200 border border-yellow-400 p-2 text-sm max-w-32 sm:max-w-48 text-gray-900">
                                  {annotation.content}
                                </div>
                              )}
                              {annotation.type === "stamp" && (
                                <div className="text-xl sm:text-2xl font-bold">
                                  {annotation.content}
                                </div>
                              )}
                              {annotation.type === "draw" &&
                                annotation.path && (
                                  <svg className="absolute inset-0 pointer-events-none">
                                    <path
                                      d={annotation.path}
                                      stroke={annotation.color}
                                      strokeWidth="2"
                                      fill="none"
                                    />
                                  </svg>
                                )}
                            </div>
                          ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="bg-card border-t border-border px-3 sm:px-6 py-3 sm:py-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                  Page: {currentPage} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => setZoom(Math.max(25, zoom - 25))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground font-medium min-w-[50px] text-center">
                  {zoom}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-lg">
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden sm:flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl bg-transparent"
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl bg-transparent"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl bg-transparent"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}