import type { Metadata } from "next";
import { use } from "react";
import { EvaluationDetailScreen } from "../EvaluationsScreen";

export const metadata: Metadata = {
  title: "Evaluation — Whippie Intern",
};

export default function EvaluationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <EvaluationDetailScreen id={id} />;
}
