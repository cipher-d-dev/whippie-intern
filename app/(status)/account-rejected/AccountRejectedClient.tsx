"use client";

import { LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/shared/StatusScreen";
import { useLogout } from "@/features/auth/auth.hooks";

export function AccountRejectedClient() {
  const logout = useLogout();

  return (
    <StatusScreen
      tone="danger"
      icon={<X />}
      title="We couldn't approve this account"
      actions={
        <Button size="lg" variant="outline" className="w-full" onClick={() => logout.mutate()} disabled={logout.isPending}>
          <LogOut /> Sign out
        </Button>
      }
    >
      <p>HR couldn&apos;t match this account to someone on the internship programme.</p>
      <p>If you think that&apos;s a mistake, speak to the HR team at DAAR Communications. They can check your details and approve you.</p>
    </StatusScreen>
  );
}
