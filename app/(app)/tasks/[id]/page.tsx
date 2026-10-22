import type { Metadata } from "next";
import { use } from "react";
import { TaskDetailScreen } from "./TaskDetailScreen";

export const metadata: Metadata = {
  title: "Task — Whippie Intern",
};

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <TaskDetailScreen id={id} />;
}
