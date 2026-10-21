import type { Metadata } from "next";
import { EvaluationDetailScreen } from "../EvaluationsScreen";

export const metadata: Metadata = {
  title: "Evaluation — Whippie Intern",
};

export default function EvaluationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <EvaluationDetailScreen id={params.id} />;
}
