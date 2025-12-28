"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Header } from "@/components/dashboard/header";
import {
  SectionHeader,
  Button,
} from "@/components/ui";
import {
  Folder,
  FileText,
  Image,
  File,
  Upload,
  Trash2,
  ExternalLink,
  ArrowLeft,
  Clock,
} from "lucide-react";
import type { DriveFile } from "@/lib/google";

function getFileIcon(mimeType: string) {
  if (mimeType === "application/vnd.google-apps.folder") {
    return <Folder className="w-5 h-5 text-[#E0FF00]" />;
  }
  if (mimeType.startsWith("image/")) {
    return <Image className="w-5 h-5 text-blue-400"/>;
  }
  if (mimeType.includes("pdf") || mimeType.includes("document")) {
    return <FileText className="w-5 h-5 text-red-400" />;
  }
  return <File className="w-5 h-5 text-gray-400" />;
}

function formatFileSize(bytes?: string) {
  if (!bytes) return "-";
  const size = parseInt(bytes);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DrivePage() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderStack, setFolderStack] = useState<{ id: string; name: string }[]>(
    []
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show recent files when not in a folder
  const showingRecent = currentFolder === null;

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = currentFolder
        ? `?folderId=${currentFolder}`
        : "?recent=true";
      const res = await fetch(`/api/drive${params}`);
      if (res.ok) setFiles(await res.json());
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  }, [currentFolder]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  function navigateToFolder(file: DriveFile) {
    if (file.mimeType === "application/vnd.google-apps.folder") {
      setFolderStack([...folderStack, { id: file.id, name: file.name }]);
      setCurrentFolder(file.id);
    }
  }

  function navigateBack() {
    const newStack = [...folderStack];
    newStack.pop();
    setFolderStack(newStack);
    setCurrentFolder(newStack.length > 0 ? newStack[newStack.length - 1].id : null);
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (currentFolder) formData.append("folderId", currentFolder);

      const res = await fetch("/api/drive", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        fetchFiles();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function deleteFile(fileId: string) {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      const res = await fetch(`/api/drive?fileId=${fileId}`, {
        method: "DELETE",
      });
      if (res.ok) fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }

  return (
    <>
      <Header title="Drive" subtitle="Browse your Google Drive files" />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {folderStack.length > 0 && (
              <Button
                variant="ghost"
                onClick={navigateBack}
                icon={<ArrowLeft className="w-4 h-4" />}
                iconPosition="left"
              >
                Back
              </Button>
            )}
            <div className="flex items-center gap-1 text-sm text-gray-500">
              {showingRecent ? (
                <span className="flex items-center gap-1.5 text-[#E0FF00]">
                  <Clock className="w-4 h-4" />
                  Recent Files
                </span>
              ) : (
                <>
                  <span
                    className="cursor-pointer hover:text-white transition-colors"
                    onClick={() => {
                      setFolderStack([]);
                      setCurrentFolder(null);
                    }}
                  >
                    Recent
                  </span>
                  {folderStack.map((folder, index) => (
                    <span key={folder.id} className="flex items-center gap-1">
                      <span>/</span>
                      <span
                        className="cursor-pointer hover:text-white transition-colors"
                        onClick={() => {
                          const newStack = folderStack.slice(0, index + 1);
                          setFolderStack(newStack);
                          setCurrentFolder(folder.id);
                        }}
                      >
                        {folder.name}
                      </span>
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
              icon={<Upload className="w-4 h-4" />}
            >
              Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={uploadFile}
              className="hidden"
            />
          </div>
        </div>

        {/* Files Grid */}
        <div className="bg-[#0F0F0F] border border-white/5 p-6">
          <SectionHeader title={showingRecent ? "Recently Modified" : "Files"} />
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : files.length === 0 ? (
            <p className="text-gray-500">No files found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="group bg-[#1B2124] border border-white/5 p-4 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`p-2 bg-[#0F0F0F] ${
                        file.mimeType === "application/vnd.google-apps.folder"
                          ? "cursor-pointer"
                          : ""
                      }`}
                      onClick={() => navigateToFolder(file)}
                    >
                      {getFileIcon(file.mimeType)}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p
                    className={`text-sm text-gray-300 truncate ${
                      file.mimeType === "application/vnd.google-apps.folder"
                        ? "cursor-pointer hover:text-white"
                        : ""
                    }`}
                    onClick={() => navigateToFolder(file)}
                  >
                    {file.name}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                    {showingRecent && file.modifiedTime && (
                      <p className="text-xs text-gray-600">
                        {formatDate(file.modifiedTime)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
