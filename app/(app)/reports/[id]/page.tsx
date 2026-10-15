import type { Metadata } from "next";
import { ReportDetailScreen } from "./ReportDetailScreen";

export const metadata: Metadata = { title: "Report — Whippe Intern" };

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  return <ReportDetailScreen id={params.id} />;
}
