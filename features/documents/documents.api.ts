import { api } from "@/lib/api/client";
import { authHeaders } from "@/features/auth/auth.api";
import type { ApiResponse, ApiPaginatedResponse } from "@/types";

export type DocumentStatus = "PENDING" | "DIGITAL_RECEIVED" | "PHYSICAL_RECEIVED" | "VERIFIED" | "REJECTED";
export type DocumentType   =
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
  document: { id: string; status: DocumentStatus } | null;
}

export async function apiGetDocumentChecklist(internId: string) {
  const res = await api.get<ApiResponse<{ checklist: ChecklistItem[] }>>(
    `/api/v1/documents/checklist/${internId}`,
    { headers: authHeaders() }
  );
  return res.data.checklist;
}

export async function apiGetMyDocuments() {
  const res = await api.get<ApiPaginatedResponse<DocumentRecord>>(
    "/api/v1/documents?limit=50",
    { headers: authHeaders() }
  );
  return res.data;
}
