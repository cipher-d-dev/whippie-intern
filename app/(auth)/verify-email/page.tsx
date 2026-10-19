import type { Metadata } from "next";
import { VerifyEmailClient } from "./VerifyEmailClient";

export const metadata: Metadata = {
  title: "Verify your email — Whippie Intern",
};

export default function VerifyEmailPage() {
  return <VerifyEmailClient />;
}
