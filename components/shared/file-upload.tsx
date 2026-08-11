"use client";

import { useCallback, useState } from "react";
import { Upload, File, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  accept?: string;
  onFileSelect: (file: File | null) => void;
  label?: string;
  description?: string;
  className?: string;
}

export function FileUpload({
  accept,
  onFileSelect,
  label = "Upload a file",
  description = "Drag and drop or click to browse",
  className,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (f: File | null) => {
      setFile(f);
      onFileSelect(f);
    },
    [onFileSelect]
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
          dragging
            ? "border-cyan-400 bg-cyan-500/10"
            : "border-border hover:border-cyan-500/50 hover:bg-muted/40"
        )}
      >
        <input
          type="file"
          accept={accept}
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          aria-label={label}
        />
        <Upload className="mb-3 h-8 w-8 text-cyan-400" />
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>

      {file && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            <File className="h-4 w-4 text-cyan-400" />
            <span className="truncate max-w-[220px]">{file.name}</span>
            <span className="text-muted-foreground">
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleFile(null)}
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
