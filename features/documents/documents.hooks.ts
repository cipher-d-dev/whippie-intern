"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  apiGetDocumentChecklist,
  apiGetUploadInfo,
  uploadToAppwrite,
  apiRegisterUpload,
} from "./documents.api";

export const CHECKLIST_KEY = (internId: string) =>
  ["documents", "checklist", internId] as const;

export function useDocumentChecklist(internId?: string) {
  return useQuery({
    queryKey: CHECKLIST_KEY(internId ?? ""),
    queryFn: () => apiGetDocumentChecklist(internId!),
    enabled: !!internId,
    staleTime: 5 * 60 * 1000,
  });
}

export interface UploadDocumentPayload {
  documentId: string;
  file: File;
}

/**
 * Full 3-step upload flow:
 *  1. GET /documents/:id/upload-info  — get Appwrite credentials
 *  2. POST to Appwrite directly       — upload the file
 *  3. PATCH /documents/:id/upload     — register with the backend
 */
export function useUploadDocument(internId?: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, file }: UploadDocumentPayload) => {
      // Step 1 — get upload credentials
      const info = await apiGetUploadInfo(documentId);

      // Step 2 — upload directly to Appwrite
      await uploadToAppwrite(info, file);

      // Step 3 — register with backend
      return apiRegisterUpload(documentId, {
        storageKey: info.fileId,
        originalFilename: file.name,
        contentType: file.type || "application/octet-stream",
        fileSizeBytes: file.size,
      });
    },
    onSuccess: () => {
      toast.success("Document uploaded successfully.");
      if (internId) {
        qc.invalidateQueries({ queryKey: CHECKLIST_KEY(internId) });
      }
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : "Upload failed. Try again.";
      toast.error(msg);
    },
  });
}
