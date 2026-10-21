import type { Metadata } from "next";
import { AccountRejectedClient } from "./AccountRejectedClient";

export const metadata: Metadata = {
  title: "Account not approved — Whippie Intern",
};

export default function AccountRejectedPage() {
  return <AccountRejectedClient />;
}
