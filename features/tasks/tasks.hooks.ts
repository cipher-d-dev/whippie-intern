"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGetMyTasks, apiGetTask, apiStartTask, type TasksListParams } from "./tasks.api";
import { apiSubmitTask, apiGetTaskSubmissions } from "@/features/submissions/submissions.api";
import type { TaskStatus } from "@/types";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const TASKS_LIST_KEY = (status?: string) => ["tasks", "list", status ?? "all"] as const;
export const TASK_KEY       = (id: string)       => ["tasks", id] as const;
export const SUBMISSIONS_KEY = (taskId: string)  => ["submissions", taskId] as const;

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useMyTasks(params?: TasksListParams) {
  return useQuery({
    queryKey: TASKS_LIST_KEY(params?.status),
    queryFn:  () => apiGetMyTasks(params),
    staleTime: 60 * 1000,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: TASK_KEY(id),
    queryFn:  () => apiGetTask(id),
    staleTime: 60 * 1000,
    enabled: !!id,
  });
}

export function useTaskSubmissions(taskId: string) {
  return useQuery({
    queryKey: SUBMISSIONS_KEY(taskId),
    queryFn:  () => apiGetTaskSubmissions(taskId),
    staleTime: 60 * 1000,
    enabled: !!taskId,
  });
}

export function useStartTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiStartTask(id),
    onSuccess: (task) => {
      qc.setQueryData(TASK_KEY(task.id), task);
      qc.invalidateQueries({ queryKey: ["tasks", "list"] });
      toast.success("Task marked as in progress");
    },
    onError: () => toast.error("Could not update task status"),
  });
}

export function useSubmitTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { taskId: string; content: string }) =>
      apiSubmitTask(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: TASK_KEY(vars.taskId) });
      qc.invalidateQueries({ queryKey: ["tasks", "list"] });
      qc.invalidateQueries({ queryKey: SUBMISSIONS_KEY(vars.taskId) });
      toast.success("Work submitted successfully!");
    },
    onError: (err: any) => {
      const msg = err?.body?.message ?? "Submission failed. Try again.";
      toast.error(msg);
    },
  });
}
