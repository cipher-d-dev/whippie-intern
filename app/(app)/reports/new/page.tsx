import type { Metadata } from "next";
import { Suspense } from "react";
import { NewReportScreen } from "./NewReportScreen";

export const metadata: Metadata = { title: "New report — Whippie" };

export default function NewReportPage() {
  return (
    <Suspense>
      <NewReportScreen />
    </Suspense>
  );
}
