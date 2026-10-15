import type { Metadata } from "next";
import { ReportsScreen } from "./ReportsScreen";

export const metadata: Metadata = { title: "Reports — Whippe Intern" };

export default function ReportsPage() {
  return <ReportsScreen />;
}
