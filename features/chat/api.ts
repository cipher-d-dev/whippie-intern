import { api, API_BASE_URL, ApiError } from "@/lib/api/client";
import { authHeaders, apiRefresh } from "@/features/auth/auth.api";
import type { ApiResponse } from "@/types";

/* Same calls as the staff portal's chat, through the intern app's client. */
const auth = () => ({ headers: authHeaders() });
const apiGet = <T,>(path: string) => api.get<T>(path, auth());
const apiPost = <T,>(path: string, body?: unknown) => api.post<T>(path, body ?? {}, auth());
const apiPatch = <T,>(path: string, body?: unknown) => api.patch<T>(path, body, auth());
const apiDelete = <T,>(path: string) => api.delete<T>(path, auth());

/** fetch with the sign-in token, refreshing it once on 401 (files and raw uploads). */
async function authedFetch(path: string, init: RequestInit = {}) {
  const go = () => fetch(`${API_BASE_URL}${path}`, { ...init, credentials: "include", headers: { ...(init.headers ?? {}), ...authHeaders() } });
  let res = await go();
  if (res.status === 401) {
    try { await apiRefresh(); res = await go(); } catch { /* keep the 401 */ }
  }
  return res;
}

export async function apiGetBlob(path: string): Promise<Blob> {
  const res = await authedFetch(path);
  if (!res.ok) throw new ApiError(res.status, { message: res.status === 404 ? "Not found" : "Couldn't load the file" });
  return res.blob();
}

async function apiUploadFile<T>(path: string, file: Blob): Promise<T> {
  const res = await authedFetch(path, { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: file });
  const body = await res.json().catch(() => ({ message: res.statusText }));
  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}
const BASE = "/api/v1/chat";

export type ConversationKind = "INTERN_HR" | "STAFF_DM" | "INTERN_DM";

export interface ChatWith {
  kind: "HR" | "INTERN" | "HR_PERSON" | "SUPERVISOR" | "INTERN_PERSON" | "INTERN_PAIR";
  name: string;
  subtitle?: string | null;
  internId?: string;
  userId?: string;
  internshipType?: string | null;
  lastSeenAt?: string | null;
}

export interface ConversationSummary {
  id: string;
  kind: ConversationKind;
  with: ChatWith;
  lastMessage: { id: string; senderId: string; senderName: string | null; text: string; deleted: boolean; at: string } | null;
  lastMessageAt: string | null;
  unread: number;
  myReadAt: string | null;
  otherReadAt: string | null;
  otherDeliveredAt: string | null;
  /** Private intern chats: who blocked whom, from my side */
  blocked?: { byMe: boolean; byThem: boolean };
  /** False for HR reading a reported chat, or when blocked */
  canSend?: boolean;
  /** HR only: reports on a private intern chat */
  reports?: { byId: string; byName: string; at: string; reason: string; messageId: string | null }[];
  reportResolvedAt?: string | null;
  /** No push notifications until then (null: not muted) */
  mutedUntil?: string | null;
  createdAt: string;
}

export interface ChatAttachment { index: number; name: string; mime: string; size: number; /** voice notes, seconds */ duration?: number | null }
export interface ChatReaction { emoji: string; users: { id: string; name: string }[] }

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: { id: string; name: string; role: string | null };
  text: string;
  attachments: ChatAttachment[];
  sticker?: string | null;
  reactions?: ChatReaction[];
  replyTo: { id: string; senderName: string; text: string; deleted: boolean } | null;
  clientId: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
}

export interface MessagePage {
  messages: ChatMessage[];
  hasOlder: boolean;
  hasNewer: boolean;
  myReadAt: string | null;
  otherReadAt: string | null;
  otherDeliveredAt: string | null;
}

export interface UploadedFile { id: string; name: string; mime: string; size: number }

const unwrap = <T,>(r: ApiResponse<T>) => r.data as T;

export const listConversations = (params: { search?: string; kind?: ConversationKind } = {}) => {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.kind) qs.set("kind", params.kind);
  return apiGet<ApiResponse<{ conversations: ConversationSummary[] }>>(`${BASE}/conversations${qs.size ? `?${qs}` : ""}`).then((r) => unwrap(r).conversations);
};

export const openConversation = (body: { internId?: string; userId?: string } = {}) =>
  apiPost<ApiResponse<{ conversation: ConversationSummary }>>(`${BASE}/conversations`, body).then((r) => unwrap(r).conversation);

export const getConversation = (id: string) =>
  apiGet<ApiResponse<{ conversation: ConversationSummary }>>(`${BASE}/conversations/${id}`).then((r) => unwrap(r).conversation);

export const listMessages = (id: string, q: { before?: string; after?: string; around?: string; limit?: number } = {}) => {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) if (v !== undefined) qs.set(k, String(v));
  return apiGet<ApiResponse<MessagePage>>(`${BASE}/conversations/${id}/messages${qs.size ? `?${qs}` : ""}`).then(unwrap);
};

export const sendMessage = (id: string, body: { text: string; replyTo?: string; uploads?: string[]; sticker?: string; clientId?: string }) =>
  apiPost<ApiResponse<{ message: ChatMessage }>>(`${BASE}/conversations/${id}/messages`, body).then((r) => unwrap(r).message);

export const editMessage = (messageId: string, text: string) =>
  apiPatch<ApiResponse<{ message: ChatMessage }>>(`${BASE}/messages/${messageId}`, { text }).then((r) => unwrap(r).message);

export const deleteMessage = (messageId: string) =>
  apiDelete<ApiResponse<{ message: ChatMessage }>>(`${BASE}/messages/${messageId}`).then((r) => unwrap(r).message);

export const markRead = (id: string) => apiPost<ApiResponse<{ readAt: string }>>(`${BASE}/conversations/${id}/read`);
export const markDelivered = () => apiPost<ApiResponse<{ updated: number }>>(`${BASE}/delivered`);
export const sendTyping = (id: string) => apiPost<ApiResponse<unknown>>(`${BASE}/conversations/${id}/typing`);
export const getUnread = () => apiGet<ApiResponse<{ chats: number }>>(`${BASE}/unread`).then((r) => unwrap(r).chats);
export const getRealtimeToken = () =>
  apiGet<ApiResponse<{ enabled: boolean; tokenRequest: unknown }>>(`${BASE}/realtime-token`).then(unwrap);

export const uploadChatFile = (file: Blob, name: string, voice?: { duration: number }) =>
  apiUploadFile<ApiResponse<{ upload: UploadedFile }>>(
    `${BASE}/uploads?name=${encodeURIComponent(name)}${voice ? `&kind=voice&duration=${Math.round(voice.duration)}` : ""}`,
    file,
  ).then((r) => unwrap(r).upload);

export const attachmentPath = (messageId: string, index: number) => `${BASE}/messages/${messageId}/attachments/${index}`;

export interface ChatContacts {
  interns: { internId: string; name: string; subtitle: string | null; internshipType: string | null }[];
  people: { userId: string; name: string; subtitle: string; role: string }[];
}
export const listContacts = () => apiGet<ApiResponse<ChatContacts>>(`${BASE}/contacts`).then(unwrap);

export const setBlocked = (id: string, blocked: boolean) =>
  (blocked
    ? apiPost<ApiResponse<{ conversation: ConversationSummary }>>(`${BASE}/conversations/${id}/block`)
    : apiDelete<ApiResponse<{ conversation: ConversationSummary }>>(`${BASE}/conversations/${id}/block`)
  ).then((r) => unwrap(r).conversation);

export const reportConversation = (id: string, body: { reason: string; messageId?: string; block?: boolean }) =>
  apiPost<ApiResponse<{ conversation: ConversationSummary }>>(`${BASE}/conversations/${id}/report`, body).then((r) => unwrap(r).conversation);

export const resolveReport = (id: string) =>
  apiPost<ApiResponse<{ conversation: ConversationSummary }>>(`${BASE}/conversations/${id}/report/resolve`).then((r) => unwrap(r).conversation);

export const reactToMessage = (messageId: string, emoji: string) =>
  apiPost<ApiResponse<{ message: ChatMessage }>>(`${BASE}/messages/${messageId}/reactions`, { emoji }).then((r) => unwrap(r).message);

export const muteConversation = (id: string, period: "8h" | "1w" | "always" | "off") =>
  apiPost<ApiResponse<{ conversation: ConversationSummary }>>(`${BASE}/conversations/${id}/mute`, { for: period }).then((r) => unwrap(r).conversation);

export interface SharedFile { messageId: string; index: number; name: string; mime: string; size: number; duration: number | null; at: string }
export interface ChatInfo {
  conversation: ConversationSummary;
  profile: {
    name: string;
    avatarUrl?: string | null;
    department?: string | null;
    station?: string | null;
    internshipType?: string | null;
    since?: string | null;
    lastSeenAt?: string | null;
    role?: string | null;
    internId?: string | null;
    team?: string[];
  } | null;
  media: SharedFile[];
  docs: SharedFile[];
  voice: SharedFile[];
  links: { messageId: string; url: string; at: string }[];
}
export const getChatInfo = (id: string) => apiGet<ApiResponse<ChatInfo>>(`${BASE}/conversations/${id}/info`).then(unwrap);
