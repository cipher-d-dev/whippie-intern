import type { Metadata } from "next";
import { ResetPasswordClient } from "./ResetPasswordClient";

export const metadata: Metadata = {
  title: "Set a new password — Whippie Intern",
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
