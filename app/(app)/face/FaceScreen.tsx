"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, Loader2, ScanFace, ShieldCheck, X } from "lucide-react";
import { FaceCapture, type FaceCaptureResult } from "@/components/face/FaceCapture";
import { needsFacePhoto, useMyFace, useSendFace } from "@/features/face/face";
import { SubHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtWhen } from "@/lib/format";
import { cn } from "@/lib/utils";

export function FaceScreen() {
  const router = useRouter();
  const { data: face, isLoading } = useMyFace();
  const [consent, setConsent] = useState(false);
  const [camera, setCamera] = useState(false);
  const [shot, setShot] = useState<FaceCaptureResult | null>(null);
  const send = useSendFace(() => {
    setShot(null);
    router.replace("/home");
  });

  if (isLoading || !face) {
    return (
      <div>
        <SubHeader title="Face photo" backHref="/profile" />
        <div className="space-y-3 px-5"><Skeleton className="h-40 rounded-2xl" /></div>
      </div>
    );
  }

  const canTake = face.status !== "APPROVED";
  const required = needsFacePhoto(face);

  return (
    <div className="animate-fade-in">
      <SubHeader title="Face photo" backHref="/profile" noBack={required} />
      <div className="flex flex-col gap-3.5 px-5 pb-6 pt-1">
        {required && (
          <div className="px-1">
            <h2 className="text-2xl font-semibold tracking-[-0.02em]">
              {face.status === "REJECTED" ? "Please take a new face photo" : "One more step before you start"}
            </h2>
            <p className="mt-1 text-[15px] text-muted-foreground">
              Every intern needs a face photo for attendance. It takes a few seconds, then you can use the app as usual.
            </p>
          </div>
        )}
        <StatusCard status={face.status} reason={face.rejectionReason} when={face.reviewedAt ?? face.submittedAt} />

        {shot ? (
          <Card className="p-[18px]">
            <p className="text-[15px] font-semibold">Use this photo?</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shot.photo} alt="Your face photo" className="mx-auto mt-3 aspect-[3/4] w-48 -scale-x-100 rounded-2xl object-cover" />
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <Button variant="outline" onClick={() => { setShot(null); setCamera(true); }} disabled={send.isPending}>Retake</Button>
              <Button onClick={() => send.mutate(shot)} disabled={send.isPending}>
                {send.isPending && <Loader2 className="animate-spin" />} Send to HR
              </Button>
            </div>
          </Card>
        ) : canTake ? (
          <Card className="p-[18px]">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground"><ScanFace className="h-5 w-5" /></span>
              <div>
                <p className="text-[15px] font-semibold">Why we ask</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  When you check in, you&apos;ll take a quick selfie. It&apos;s matched to this photo to confirm it&apos;s really you, so nobody can check in for you.
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />Only HR can see your photos. They&apos;re stored privately, never posted anywhere.</li>
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />Used only for attendance, and deleted 30 days after your internship ends.</li>
            </ul>
            <button
              type="button"
              role="checkbox"
              aria-checked={consent}
              onClick={() => setConsent((c) => !c)}
              className="mt-4 flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm"
            >
              <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px]", consent ? "border-primary bg-primary text-primary-foreground" : "border-input")}>
                {consent && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
              I agree to DAAR Communications using my face photo to confirm my attendance.
            </button>
            <p className="mt-3 text-xs text-muted-foreground">Camera not working on this phone? Speak to HR; they can help you take it on another phone.</p>
            <Button size="lg" className="mt-4 w-full" disabled={!consent} onClick={() => setCamera(true)}>
              <ScanFace /> {face.status === "NONE" ? "Take my face photo" : "Take a new photo"}
            </Button>
          </Card>
        ) : (
          <p className="px-2 text-center text-[13px] text-muted-foreground">If you need to change your photo, ask HR.</p>
        )}
      </div>

      {camera && (
        <FaceCapture
          title="Face photo"
          onCancel={() => setCamera(false)}
          onDone={(r) => { setCamera(false); setShot(r); }}
        />
      )}
    </div>
  );
}

function StatusCard({ status, reason, when }: { status: string; reason?: string | null; when?: string | null }) {
  const cfg = {
    NONE: { icon: ScanFace, tone: "bg-muted text-muted-foreground", title: "No face photo yet", body: "Take it once. It only takes a few seconds." },
    PENDING: { icon: Clock, tone: "bg-warning-soft text-warning-foreground", title: "Waiting for HR", body: "You can check in while HR reviews it." },
    APPROVED: { icon: Check, tone: "bg-success-soft text-success-foreground", title: "Approved", body: "Your check-in selfies are matched to this photo." },
    REJECTED: { icon: X, tone: "bg-danger-soft text-danger-foreground", title: "HR asked for a new photo", body: reason || "Please take it again." },
  }[status as "NONE" | "PENDING" | "APPROVED" | "REJECTED"] ?? { icon: ScanFace, tone: "bg-muted", title: status, body: "" };
  const Icon = cfg.icon;
  return (
    <Card className="flex items-start gap-3 px-[18px] py-4">
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", cfg.tone)}><Icon className="h-5 w-5" /></span>
      <div className="min-w-0">
        <p className="font-semibold">{cfg.title}</p>
        <p className="text-[13px] text-muted-foreground">{cfg.body}</p>
        {when && status !== "NONE" && <p className="mt-0.5 font-mono text-xs text-muted-foreground">{fmtWhen(when)}</p>}
      </div>
    </Card>
  );
}
