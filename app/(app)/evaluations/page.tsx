import type { Metadata } from "next";
import { EvaluationsScreen } from "./EvaluationsScreen";

export const metadata: Metadata = {
  title: "Evaluations — Whippie Intern",
};

export default function EvaluationsPage() {
  return <EvaluationsScreen />;
}
