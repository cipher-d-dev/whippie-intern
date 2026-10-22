import type { Metadata } from "next";
import { use } from "react";
import { ReportDetailScreen } from "./ReportDetailScreen";

export const metadata: Metadata = { title: "Report — Whippie Intern" };

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ReportDetailScreen id={id} />;
}
