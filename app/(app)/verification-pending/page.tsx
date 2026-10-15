import type { Metadata } from "next";
import { VerificationPendingClient } from "./VerificationPendingClient";

export const metadata: Metadata = {
  title: "Awaiting verification — Whippe Intern",
};

export default function VerificationPendingPage() {
  return <VerificationPendingClient />;
}
