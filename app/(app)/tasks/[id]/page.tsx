import type { Metadata } from "next";
import { TaskDetailScreen } from "./TaskDetailScreen";

export const metadata: Metadata = {
  title: "Task — Whippe Intern",
};

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  return <TaskDetailScreen id={params.id} />;
}
