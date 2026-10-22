import type { Metadata } from "next";
import { GoogleSuccessHandler } from "./GoogleSuccessHandler";

export const metadata: Metadata = { title: "Signing in — Whippie Intern" };

export default function GoogleSuccessPage() {
  return <GoogleSuccessHandler />;
}
