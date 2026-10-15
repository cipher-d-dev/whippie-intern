import type { Metadata } from "next";
import { HomeDashboard } from "./HomeDashboard";

export const metadata: Metadata = {
  title: "Home — Whippe Intern",
};

export default function HomePage() {
  return <HomeDashboard />;
}
