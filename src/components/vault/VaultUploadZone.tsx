import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileText, Loader2, Trash2, Download, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVaultFiles, VaultFile } from "@/hooks/use-vault-files";
import { Badge } from "@/components/ui/badge";

function formatBytes(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeSince(dateStr: string) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function VaultUploadZone() {
  const { files, loading, uploading, upload, deleteFile, downloadFile } = useVaultFiles();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    dropped.forEach((f) => upload(f));
  }, [upload]);

  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    selected.forEach((f) => upload(f));
    if (inputRef.current) inputRef.current.value = "";
  }, [upload]);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border/50 hover:border-primary/30 hover:bg-primary/5"
        }`}
      >
        <input ref={inputRef} type="file" multiple className="hidden" onChange={handleSelect} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={28} className="text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Encrypting & uploading…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <CloudUpload size={28} className="text-primary" />
            <p className="text-sm text-foreground font-medium">Drop files here or click to upload</p>
            <p className="text-xs text-muted-foreground">Max 20MB per file • All files encrypted at rest</p>
          </div>
        )}
      </div>

      {/* File list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : files.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-6">No files uploaded yet</p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 py-3 px-4 rounded-lg bg-secondary/30 border border-border/30"
              >
                <div className="p-2 rounded-md bg-primary/10 shrink-0">
                  <FileText size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{formatBytes(file.size)}</span>
                    <span className="text-[10px] text-muted-foreground">•</span>
                    <span className="text-[10px] text-muted-foreground">{timeSince(file.created_at)}</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => downloadFile(file.path, file.name)}>
                  <Download size={14} />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => deleteFile(file.path)}>
                  <Trash2 size={14} />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
