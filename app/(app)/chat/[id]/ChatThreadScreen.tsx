"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Flag, Loader2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSession } from "@/features/auth/auth.hooks";
import { useChatModeration, useConversation } from "@/features/chat/hooks";
import type { ChatMessage, ConversationSummary } from "@/features/chat/api";
import { ChatThread } from "@/components/chat/ChatThread";
import { cn } from "@/lib/utils";

/** One chat, full screen like WhatsApp (the tab bar is hidden here). */
export function ChatThreadScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: user } = useSession();
  const { data: conversation, isError, error, refetch, isFetching } = useConversation(id);
  const back = () => router.push("/chat");

  if (!user) return null;
  const me = { id: user._id ?? (user as unknown as { id: string }).id, name: `${user.firstName} ${user.lastName}`, role: "INTERN" };

  return (
    <div className="fixed inset-0 z-40 mx-auto flex max-w-md flex-col bg-background safe-top" style={{ height: "100dvh" }}>
      {conversation ? (
        <Thread conversation={conversation} me={me} onBack={back} />
      ) : isError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center text-sm text-muted-foreground">
          {(error as Error)?.message || "Couldn't open this chat."}
          <div className="flex gap-2">
            <Button variant="outline" onClick={back}>Back</Button>
            <Button onClick={() => refetch()} disabled={isFetching}>Try again</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      )}
    </div>
  );
}

function Thread({ conversation, me, onBack }: { conversation: ConversationSummary; me: { id: string; name: string; role: string }; onBack: () => void }) {
  const privateChat = conversation.kind === "INTERN_DM";
  const mod = useChatModeration(conversation.id);
  const [reporting, setReporting] = useState<{ message?: ChatMessage } | null>(null);
  const first = conversation.with.name.split(" ")[0];
  const blocked = conversation.blocked;

  const footer = blocked?.byMe ? (
    <span>
      You blocked {first}.{" "}
      <button type="button" onClick={() => void mod.unblock()} disabled={mod.pending} className="font-medium text-primary hover:underline">Unblock</button>
    </span>
  ) : blocked?.byThem ? (
    "You can't send messages in this chat."
  ) : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col safe-bottom">
      <ChatThread
        conversation={conversation}
        me={me}
        onBack={onBack}
        footer={footer}
        onReport={privateChat ? (m) => setReporting({ message: m }) : undefined}
        headerExtra={privateChat && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" aria-label="Chat options" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"><MoreVertical className="h-5 w-5" /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {blocked?.byMe ? (
                <DropdownMenuItem onClick={() => void mod.unblock()}><Ban className="mr-2 h-4 w-4" /> Unblock {first}</DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => { if (confirm(`Block ${first}? Neither of you will be able to send messages in this chat.`)) void mod.block(); }}>
                  <Ban className="mr-2 h-4 w-4" /> Block {first}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setReporting({})} className="text-danger-foreground focus:text-danger-foreground"><Flag className="mr-2 h-4 w-4" /> Report to HR</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
      {reporting && (
        <ReportDialog
          name={conversation.with.name}
          message={reporting.message}
          alreadyBlocked={!!blocked?.byMe}
          pending={mod.pending}
          onClose={() => setReporting(null)}
          onSubmit={async (reason, block) => {
            if (await mod.report({ reason, messageId: reporting.message?.id, block })) setReporting(null);
          }}
        />
      )}
    </div>
  );
}

const REASONS = ["Rude or abusive", "Harassment or threats", "Unwanted messages", "Something else"];

function ReportDialog({ name, message, alreadyBlocked, pending, onClose, onSubmit }: {
  name: string;
  message?: ChatMessage;
  alreadyBlocked: boolean;
  pending: boolean;
  onClose: () => void;
  onSubmit: (reason: string, block: boolean) => void;
}) {
  const [choice, setChoice] = useState("");
  const [details, setDetails] = useState("");
  const [block, setBlock] = useState(!alreadyBlocked);
  const reason = [choice, details.trim()].filter(Boolean).join(": ");
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report to HR</DialogTitle>
          <DialogDescription>
            HR will be able to read this chat with {name} so they can help. {name.split(" ")[0]} isn&apos;t told who reported it.
          </DialogDescription>
        </DialogHeader>
        {message && (
          <p className="line-clamp-3 rounded-lg border-l-[3px] border-danger bg-muted/60 px-3 py-2 text-[13px] text-muted-foreground">
            {message.text || "📷 Attachment"}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {REASONS.map((r) => (
            <button key={r} type="button" onClick={() => setChoice(r)} aria-pressed={choice === r}
              className={cn("rounded-full border px-3 py-1.5 text-[13px]", choice === r ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted")}>
              {r}
            </button>
          ))}
        </div>
        <label className="block text-[13px] font-medium" htmlFor="report-details">What happened? <span className="font-normal text-muted-foreground">(optional)</span></label>
        <textarea id="report-details" value={details} onChange={(e) => setDetails(e.target.value)} maxLength={400} rows={3}
          className="w-full resize-none rounded-xl border bg-card px-3 py-2 text-[15px] outline-none focus:border-primary/50 focus:ring-[3px] focus:ring-ring/15" />
        {!alreadyBlocked && (
          <label className="flex items-center gap-2.5 text-[14px]">
            <input type="checkbox" checked={block} onChange={(e) => setBlock(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
            Also block {name.split(" ")[0]}
          </label>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit(reason, block)} disabled={reason.length < 3 || pending} className="bg-danger text-white hover:bg-danger/90">
            {pending && <Loader2 className="animate-spin" />} Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
