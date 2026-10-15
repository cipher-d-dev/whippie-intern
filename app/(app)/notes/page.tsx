import type { Metadata } from "next";
import { NotesScreen } from "./NotesScreen";

export const metadata: Metadata = { title: "Notes — Whippe Intern" };

export default function NotesPage() {
  return <NotesScreen />;
}
