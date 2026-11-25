"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/auth.hooks";
import { openConversation } from "@/features/chat/api";
import { ChatThread } from "@/components/chat/ChatThread";

/** The intern's chat with the HR team, full screen like WhatsApp. */
export function ChatScreen() {
  const router = useRouter();
  const { data: user } = useSession();
  const { data: conversation, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["chat", "mine"],
    queryFn: () => openConversation(),
    enabled: !!user,
    retry: 1,
    refetchInterval: 60_000, // keeps HR's "last seen" current
  });

  if (!user) return null;
  const me = { id: user._id ?? (user as unknown as { id: string }).id, name: `${user.firstName} ${user.lastName}`, role: "INTERN" };

  return (
    <div className="fixed inset-0 z-40 mx-auto flex max-w-md flex-col bg-background safe-top" style={{ height: "100dvh" }}>
      {conversation ? (
        <div className="flex min-h-0 flex-1 flex-col safe-bottom">
          <ChatThread conversation={conversation} me={me} onBack={() => (history.length > 1 ? router.back() : router.push("/home"))} />
        </div>
      ) : isError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center text-sm text-muted-foreground">
          {(error as Error)?.message || "Couldn't open your chat with HR."}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/home")}>Back</Button>
            <Button onClick={() => refetch()} disabled={isFetching}>Try again</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      )}
    </div>
  );
}
