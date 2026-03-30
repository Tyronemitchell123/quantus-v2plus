import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface VaultFile {
  id: string;
  name: string;
  size: number;
  type: string;
  created_at: string;
  path: string;
  url: string;
}

export function useVaultFiles() {
  const { user } = useAuth();
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const folder = `${user.id}/`;
    const { data, error } = await supabase.storage
      .from("quantusbucket")
      .list(user.id, { limit: 200, sortBy: { column: "created_at", order: "desc" } });

    if (error) {
      console.error("Failed to list files:", error);
      setLoading(false);
      return;
    }

    const mapped: VaultFile[] = (data || [])
      .filter((f) => f.name !== ".emptyFolderPlaceholder")
      .map((f) => {
        const path = `${user.id}/${f.name}`;
        const { data: urlData } = supabase.storage.from("quantusbucket").getPublicUrl(path);
        return {
          id: f.id || f.name,
          name: f.name,
          size: (f.metadata as any)?.size || 0,
          type: (f.metadata as any)?.mimetype || "application/octet-stream",
          created_at: f.created_at || new Date().toISOString(),
          path,
          url: urlData.publicUrl,
        };
      });

    setFiles(mapped);
    setLoading(false);
  }, [user]);

  const upload = useCallback(async (file: File) => {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("quantusbucket").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    setUploading(false);
    if (error) {
      toast.error(`Upload failed: ${error.message}`);
      return;
    }
    toast.success(`${file.name} uploaded`);
    await fetchFiles();
  }, [user, fetchFiles]);

  const deleteFile = useCallback(async (path: string) => {
    if (!user) return;
    const { error } = await supabase.storage.from("quantusbucket").remove([path]);
    if (error) {
      toast.error(`Delete failed: ${error.message}`);
      return;
    }
    toast.success("File deleted");
    await fetchFiles();
  }, [user, fetchFiles]);

  const downloadFile = useCallback(async (path: string, name: string) => {
    const { data, error } = await supabase.storage.from("quantusbucket").download(path);
    if (error || !data) {
      toast.error("Download failed");
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  return { files, loading, uploading, upload, deleteFile, downloadFile, refetch: fetchFiles };
}
