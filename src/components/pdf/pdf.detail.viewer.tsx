/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Share2,
  MessageSquare,
  Download,
  Highlighter,
  PenTool,
  StickyNote,
  Type,
  Eraser,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Undo,
  Redo,
  Palette,
  X,
  Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { Textarea } from "../ui/textarea";

interface PdfDetailViewerProps {
  fileId: string;
}

interface Annotation {
  id: string;
  type: "highlight" | "note" | "draw" | "text" | "shape";
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  color: string;
  page: number;
  timestamp: number;
  strokeWidth?: number;
  path?: { x: number; y: number }[];
}

export default function PdfDetailViewer({ fileId }: PdfDetailViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(39);
  const [zoom, setZoom] = useState(100);
  const [selectedTool, setSelectedTool] = useState<string>("select");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>(
    []
  );
  const [selectedColor, setSelectedColor] = useState("#FF0000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(
    null
  );
  const [undoStack, setUndoStack] = useState<Annotation[][]>([]);
  const [redoStack, setRedoStack] = useState<Annotation[][]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const tools = [
    { id: "select", icon: Edit3, label: "Select", color: "#000000" },
    {
      id: "highlight",
      icon: Highlighter,
      label: "Highlight",
      color: "#FFFF00",
    },
    { id: "draw", icon: PenTool, label: "Draw", color: "#FF0000" },
    { id: "note", icon: StickyNote, label: "Note", color: "#FFE066" },
    { id: "text", icon: Type, label: "Text", color: "#000000" },
    { id: "eraser", icon: Eraser, label: "Eraser", color: "#FFFFFF" },
  ];

  const colors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#008000",
    "#000000",
    "#FFFFFF",
    "#808080",
  ];

  useEffect(() => {
    const savedAnnotations = localStorage.getItem(`annotations_${fileId}`);
    if (savedAnnotations) {
      setAnnotations(JSON.parse(savedAnnotations));
    }
  }, [fileId]);

  const handleSaveAnnotations = useCallback(() => {
    localStorage.setItem(`annotations_${fileId}`, JSON.stringify(annotations));
    console.log("Annotations saved:", annotations);

    // Add to undo stack
    setUndoStack((prev) => [...prev, [...annotations]]);
    setRedoStack([]); // Clear redo stack when new action is performed
  }, [fileId, annotations]);

  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setRedoStack((prev) => [...prev, [...annotations]]);
      setAnnotations(previousState);
      setUndoStack((prev) => prev.slice(0, -1));
    }
  }, [undoStack, annotations]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack((prev) => [...prev, [...annotations]]);
      setAnnotations(nextState);
      setRedoStack((prev) => prev.slice(0, -1));
    }
  }, [redoStack, annotations]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (selectedTool === "draw") {
        setIsDrawing(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCurrentPath([{ x, y }]);
      }
    },
    [selectedTool]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDrawing && selectedTool === "draw") {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCurrentPath((prev) => [...prev, { x, y }]);
      }
    },
    [isDrawing, selectedTool]
  );

  const handleMouseUp = useCallback(() => {
    if (isDrawing && currentPath.length > 1) {
      const newAnnotation: Annotation = {
        id: Math.random().toString(36).substr(2, 9),
        type: "draw",
        x: currentPath[0].x,
        y: currentPath[0].y,
        color: selectedColor,
        page: currentPage,
        timestamp: Date.now(),
        strokeWidth,
        path: currentPath,
      };
      setAnnotations((prev) => [...prev, newAnnotation]);
      setCurrentPath([]);
    }
    setIsDrawing(false);
  }, [isDrawing, currentPath, selectedColor, currentPage, strokeWidth]);

  const handleAddAnnotation = useCallback(
    (type: string, x: number, y: number) => {
      const newAnnotation: Annotation = {
        id: Math.random().toString(36).substr(2, 9),
        type: type as any,
        x,
        y,
        color: selectedColor,
        page: currentPage,
        timestamp: Date.now(),
      };

      if (type === "highlight") {
        newAnnotation.width = 100;
        newAnnotation.height = 20;
      }

      if (type === "note" || type === "text") {
        const content = prompt(`Enter ${type} content:`);
        if (content) {
          newAnnotation.content = content;
          setAnnotations((prev) => [...prev, newAnnotation]);
        }
      } else {
        setAnnotations((prev) => [...prev, newAnnotation]);
      }
    },
    [selectedColor, currentPage]
  );

  const handleDeleteAnnotation = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
  }, []);

  const handleEditAnnotation = useCallback((id: string, newContent: string) => {
    setAnnotations((prev) =>
      prev.map((ann) => (ann.id === id ? { ...ann, content: newContent } : ann))
    );
    setEditingAnnotation(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/display-pdf">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Inheritance of C++ Programming
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
            >
              <Undo className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
            >
              <Redo className="w-4 h-4 mr-2" />
              Redo
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveAnnotations}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Feedback
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Editing Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {tools.map((tool) => (
              <Button
                key={tool.id}
                variant={selectedTool === tool.id ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex items-center space-x-2",
                  selectedTool === tool.id &&
                    "bg-red-500 hover:bg-red-600 text-white"
                )}
                onClick={() => setSelectedTool(tool.id)}
              >
                <tool.icon className="w-4 h-4" />
                <span>{tool.label}</span>
              </Button>
            ))}
          </div>

          {/* Color Palette and Stroke Width */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-gray-500" />
              <div className="flex space-x-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-6 h-6 rounded border-2 transition-all",
                      selectedColor === color
                        ? "border-gray-800 scale-110"
                        : "border-gray-300"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            {selectedTool === "draw" && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Width:</span>
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-gray-600">{strokeWidth}px</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* PDF Viewer with Annotations */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-lg relative">
                <CardContent className="p-0 relative">
                  <div
                    ref={containerRef}
                    className="relative"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  >
                    <Image
                      width={100}
                      height={100}
                      src="/c---programming-inheritance-tutorial-page.jpg"
                      alt="PDF Page"
                      className="w-full h-auto rounded-lg"
                      style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: "top left",
                      }}
                    />

                    {/* Annotation Canvas Overlay */}
                    <canvas
                      ref={canvasRef}
                      className={cn(
                        "absolute top-0 left-0 w-full h-full",
                        selectedTool !== "select" && "cursor-crosshair"
                      )}
                      onClick={(e) => {
                        if (
                          selectedTool !== "select" &&
                          selectedTool !== "draw"
                        ) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const y = e.clientY - rect.top;
                          handleAddAnnotation(selectedTool, x, y);
                        }
                      }}
                    />

                    {/* Render Annotations */}
                    {annotations
                      .filter((ann) => ann.page === currentPage)
                      .map((annotation) => (
                        <div
                          key={annotation.id}
                          className={cn(
                            "absolute group",
                            selectedTool === "select" &&
                              "pointer-events-auto cursor-pointer"
                          )}
                          style={{
                            left: annotation.x,
                            top: annotation.y,
                            width: annotation.width,
                            height: annotation.height,
                          }}
                        >
                          {/* Highlight */}
                          {annotation.type === "highlight" && (
                            <div
                              className="w-full h-full opacity-30 rounded"
                              style={{ backgroundColor: annotation.color }}
                            />
                          )}

                          {/* Drawing Path */}
                          {annotation.type === "draw" && annotation.path && (
                            <svg className="absolute top-0 left-0 pointer-events-none">
                              <path
                                d={`M ${annotation.path
                                  .map((p) => `${p.x},${p.y}`)
                                  .join(" L ")}`}
                                stroke={annotation.color}
                                strokeWidth={annotation.strokeWidth || 2}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}

                          {/* Note */}
                          {annotation.type === "note" && (
                            <div className="bg-yellow-200 p-2 rounded shadow-lg min-w-[150px] max-w-[300px]">
                              {editingAnnotation === annotation.id ? (
                                <div className="space-y-2">
                                  <Textarea
                                    defaultValue={annotation.content}
                                    className="text-xs resize-none"
                                    rows={3}
                                    onBlur={(e) =>
                                      handleEditAnnotation(
                                        annotation.id,
                                        e.target.value
                                      )
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && e.ctrlKey) {
                                        handleEditAnnotation(
                                          annotation.id,
                                          e.currentTarget.value
                                        );
                                      }
                                    }}
                                    autoFocus
                                  />
                                </div>
                              ) : (
                                <p
                                  className="text-xs text-black cursor-pointer"
                                  onClick={() =>
                                    setEditingAnnotation(annotation.id)
                                  }
                                >
                                  {annotation.content}
                                </p>
                              )}
                              {selectedTool === "select" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"
                                  onClick={() =>
                                    handleDeleteAnnotation(annotation.id)
                                  }
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          )}

                          {/* Text */}
                          {annotation.type === "text" && (
                            <div className="relative">
                              {editingAnnotation === annotation.id ? (
                                <Input
                                  defaultValue={annotation.content}
                                  className="text-sm font-medium"
                                  style={{ color: annotation.color }}
                                  onBlur={(e) =>
                                    handleEditAnnotation(
                                      annotation.id,
                                      e.target.value
                                    )
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleEditAnnotation(
                                        annotation.id,
                                        e.currentTarget.value
                                      );
                                    }
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <div
                                  className="font-medium cursor-pointer"
                                  style={{ color: annotation.color }}
                                  onClick={() =>
                                    setEditingAnnotation(annotation.id)
                                  }
                                >
                                  {annotation.content}
                                </div>
                              )}
                              {selectedTool === "select" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"
                                  onClick={() =>
                                    handleDeleteAnnotation(annotation.id)
                                  }
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                    {/* Current Drawing Path */}
                    {isDrawing && currentPath.length > 1 && (
                      <svg className="absolute top-0 left-0 pointer-events-none">
                        <path
                          d={`M ${currentPath
                            .map((p) => `${p.x},${p.y}`)
                            .join(" L ")}`}
                          stroke={selectedColor}
                          strokeWidth={strokeWidth}
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page: {currentPage} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom(Math.max(25, zoom - 25))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
                  {zoom}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-sm text-gray-500">
                {annotations.filter((ann) => ann.page === currentPage).length}{" "}
                annotations on this page
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
