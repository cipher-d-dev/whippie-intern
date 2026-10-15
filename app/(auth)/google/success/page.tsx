import type { Metadata } from "next";
import { GoogleSuccessHandler } from "./GoogleSuccessHandler";

export const metadata: Metadata = { title: "Signing in — Whippe Intern" };

export default function GoogleSuccessPage() {
  return <GoogleSuccessHandler />;
}
