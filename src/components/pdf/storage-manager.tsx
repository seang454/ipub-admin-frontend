"use client";

import { useState } from "react";
import {
  Download,
  Upload,
  Trash2,
  HardDrive,
  AlertTriangle,
} from "lucide-react";
import { storage } from "@/lib/auth/storagepdf";
import { useStorageInfo } from "@/hooks/use-storage";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

export default function StorageManager() {
  const [exportData, setExportData] = useState("");
  const [importData, setImportData] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { storageInfo, updateStorageInfo } = useStorageInfo();

  const handleExport = () => {
    try {
      const data = storage.exportData();
      setExportData(data);

      // Create download link
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pdfaid-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

  const handleImport = () => {
    if (!importData.trim()) {
      alert("Please paste the backup data first.");
      return;
    }

    try {
      storage.importData(importData);
      alert("Data imported successfully! Please refresh the page.");
      setImportData("");
      updateStorageInfo();
    } catch (error) {
      console.error("Import failed:", error);
      alert("Import failed. Please check the data format and try again.");
    }
  };

  const handleClearAll = () => {
    if (showClearConfirm) {
      storage.clearAllData();
      alert("All data cleared successfully! Please refresh the page.");
      setShowClearConfirm(false);
      updateStorageInfo();
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 5000);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <div className="space-y-6">
      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Used: {formatBytes(storageInfo.used)}</span>
              <span>Total: {formatBytes(storageInfo.total)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-600">
              {storageInfo.percentage.toFixed(1)}% of estimated capacity used
            </div>
            {storageInfo.percentage > 80 && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Storage is getting full. Consider exporting and clearing old
                data.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Export all your files, annotations, and projects as a backup file.
            </p>
            <Button onClick={handleExport} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export All Data
            </Button>
            {exportData && (
              <div className="space-y-2">
                <Label htmlFor="export-data">Exported Data (JSON)</Label>
                <Textarea
                  id="export-data"
                  value={exportData}
                  readOnly
                  rows={6}
                  className="font-mono text-xs"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Import Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Import data from a previously exported backup file.
            </p>
            <div className="space-y-2">
              <Label htmlFor="import-data">Paste Backup Data (JSON)</Label>
              <Textarea
                id="import-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste your exported JSON data here..."
                rows={6}
                className="font-mono text-xs"
              />
            </div>
            <Button
              onClick={handleImport}
              disabled={!importData.trim()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clear All Data */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Clear All Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Permanently delete all files, annotations, and projects. This
              action cannot be undone.
            </p>
            <Button
              onClick={handleClearAll}
              variant={showClearConfirm ? "destructive" : "outline"}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {showClearConfirm ? "Click Again to Confirm" : "Clear All Data"}
            </Button>
            {showClearConfirm && (
              <p className="text-xs text-red-600 text-center">
                Click the button again within 5 seconds to confirm deletion.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
