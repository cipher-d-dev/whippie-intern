import type { Metadata } from "next";
import { TasksScreen } from "./TasksScreen";

export const metadata: Metadata = {
  title: "Tasks — Whippe Intern",
};

export default function TasksPage() {
  return <TasksScreen />;
}
