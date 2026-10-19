import type { Metadata } from "next";
import { ForgotPasswordClient } from "./ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Reset your password — Whippie Intern",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
