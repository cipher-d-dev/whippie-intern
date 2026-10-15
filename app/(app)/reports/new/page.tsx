import type { Metadata } from "next";
import { NewReportScreen } from "./NewReportScreen";

export const metadata: Metadata = { title: "New report — Whippe Intern" };

export default function NewReportPage() {
  return <NewReportScreen />;
}
