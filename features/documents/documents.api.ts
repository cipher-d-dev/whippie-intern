import { api } from "@/lib/api/client";
import { authHeaders } from "@/features/auth/auth.api";
import type { ApiResponse, ApiPaginatedResponse } from "@/types";

export type DocumentStatus =
  | "PENDING"
  | "DIGITAL_RECEIVED"
  | "PHYSICAL_RECEIVED"
  | "VERIFIED"
  | "REJECTED";

export type DocumentType =
  | "ACCEPTANCE_LETTER" | "GUARANTOR_FORM" | "IDENTIFICATION"
  | "SCHOOL_LETTER" | "NYSC_CALL_UP" | "REPORT" | "EVALUATION"
  | "EXIT_DOCUMENT" | "OTHER";

export interface DocumentRequirement {
  id: string;
  type: DocumentType;
  label: string;
  description?: string;
  isRequired: boolean;
}

export interface DocumentRecord {
  id: string;
  internId: string;
  requirement: DocumentRequirement;
  status: DocumentStatus;
  originalFilename?: string;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  requirement: DocumentRequirement;
  document: { id: string; status: DocumentStatus; originalFilename?: string } | null;
}

export interface UploadInfo {
  endpoint: string;
  projectId: string;
  bucketId: string;
  fileId: string;
}

// ─── Checklist ────────────────────────────────────────────────────────────────

export async function apiGetDocumentChecklist(internId: string) {
  const res = await api.get<ApiResponse<{ checklist: ChecklistItem[] }>>(
    `/api/v1/documents/checklist/${internId}`,
    { headers: authHeaders() },
  );
  return res.data.checklist;
}

export async function apiGetMyDocuments() {
  const res = await api.get<ApiPaginatedResponse<DocumentRecord>>(
    "/api/v1/documents?limit=50",
    { headers: authHeaders() },
  );
  return res.data;
}

// ─── Upload flow ──────────────────────────────────────────────────────────────

/** Step 1 — get Appwrite upload credentials from the backend */
export async function apiGetUploadInfo(documentId: string): Promise<UploadInfo> {
  const res = await api.get<ApiResponse<UploadInfo>>(
    `/api/v1/documents/${documentId}/upload-info`,
    { headers: authHeaders() },
  );
  return res.data;
}

/** Step 2 — upload file directly to Appwrite using the credentials */
export async function uploadToAppwrite(
  info: UploadInfo,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("fileId", info.fileId);
  formData.append("file", file);

  const url = `${info.endpoint}/storage/buckets/${info.bucketId}/files`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-Appwrite-Project": info.projectId,
    },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? `Appwrite upload failed (${res.status})`,
    );
  }
}

/** Step 3 — tell the backend the upload is done */
export async function apiRegisterUpload(
  documentId: string,
  payload: {
    storageKey: string;
    originalFilename: string;
    contentType: string;
    fileSizeBytes: number;
  },
) {
  const res = await api.patch<ApiResponse<DocumentRecord>>(
    `/api/v1/documents/${documentId}/upload`,
    payload,
    { headers: authHeaders() },
  );
  return res.data;
}

/** Download URL — proxied through the backend */
export function getDocumentDownloadUrl(documentId: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  return `${base}/api/v1/documents/${documentId}/download`;
}
