import type { Metadata } from "next";
import { TimelineScreen } from "./TimelineScreen";

export const metadata: Metadata = { title: "Timeline — Whippe Intern" };

export default function TimelinePage() {
  return <TimelineScreen />;
}
