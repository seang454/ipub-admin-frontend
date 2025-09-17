"use client";

import type React from "react";

import { useState, useRef, useCallback } from "react";
import {
  FileText,
  Upload,
  Download,
  Eye,
  X,
  File,
  ImageIcon,
  FileVideo,
  FileAudio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "../ui/button";
import Layout from "./layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  lastModified: number;
}

export default function DisplayPdf() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: FileItem[] = Array.from(fileList).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      lastModified: file.lastModified,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const fileToRemove = prev.find((f) => f.id === id);
        if (fileToRemove) {
          URL.revokeObjectURL(fileToRemove.url);
        }
        return prev.filter((f) => f.id !== id);
      });
      if (selectedFile?.id === id) {
        setSelectedFile(null);
      }
    },
    [selectedFile]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
    if (type.startsWith("video/")) return <FileVideo className="w-4 h-4" />;
    if (type.startsWith("audio/")) return <FileAudio className="w-4 h-4" />;
    if (type === "application/pdf") return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const renderFilePreview = (file: FileItem) => {
    if (file.type.startsWith("image/")) {
      return (
        <Image
          width={100}
          height={100}
          unoptimized
          src={file.url || "/placeholder.svg"}
          alt={file.name}
          className="max-w-full max-h-[70vh] object-contain rounded-lg"
        />
      );
    }

    if (file.type === "application/pdf") {
      return (
        <iframe
          src={file.url}
          className="w-full h-[70vh] rounded-lg border border-gray-200 dark:border-[#1F1F23]"
          title={file.name}
        />
      );
    }

    if (file.type.startsWith("video/")) {
      return (
        <video
          controls
          className="max-w-full max-h-[70vh] rounded-lg"
          src={file.url}
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    if (file.type.startsWith("audio/")) {
      return (
        <div className="flex flex-col items-center space-y-4 p-8">
          <FileAudio className="w-16 h-16 text-gray-400" />
          <audio controls className="w-full max-w-md">
            <source src={file.url} type={file.type} />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }

    if (file.type.startsWith("text/")) {
      return (
        <iframe
          src={file.url}
          className="w-full h-[70vh] rounded-lg border border-gray-200 dark:border-[#1F1F23]"
          title={file.name}
        />
      );
    }

    return (
      <div className="flex flex-col items-center space-y-4 p-8 text-center">
        <File className="w-16 h-16 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">
          Preview not available for this file type
        </p>
        <Button
          onClick={() => window.open(file.url, "_blank")}
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          Download File
        </Button>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            File Display
          </h1>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Upload Area */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Upload Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                  dragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Drag and drop files here, or click to select
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
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
            </CardContent>
          </Card>

          {/* File List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="w-5 h-5" />
                Files ({files.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No files uploaded yet
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedFile?.id === file.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                      onClick={() => setSelectedFile(file)}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {getFileIcon(file.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(file);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* File Preview */}
        {selectedFile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getFileIcon(selectedFile.type)}
                  {selectedFile.name}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                {renderFilePreview(selectedFile)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
