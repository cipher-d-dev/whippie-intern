"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/features/auth/auth.hooks";
import { openConversation } from "@/features/chat/api";
import { useOpenConversation } from "@/features/chat/hooks";
import { ConversationList } from "@/components/chat/ConversationList";

/** Chats: HR pinned at the top, then private chats with other interns. */
export function ChatListScreen() {
  const router = useRouter();
  const { data: user } = useSession();
  // Make sure the HR chat exists, so it's always in the list.
  useQuery({ queryKey: ["chat", "mine"], queryFn: () => openConversation(), enabled: !!user, staleTime: Infinity });
  const { open, pending } = useOpenConversation();

  if (!user) return null;
  return (
    <div className="flex flex-col safe-top" style={{ height: "calc(100dvh - 4rem - env(safe-area-inset-bottom))" }}>
      <ConversationList
        meId={user._id ?? (user as unknown as { id: string }).id}
        selectedId={null}
        onSelect={(c) => router.push(`/chat/${c.id}`)}
        canStart
        starting={pending}
        onStart={async (body) => {
          const c = await open(body);
          if (c) router.push(`/chat/${c.id}`);
        }}
      />
    </div>
  );
}
