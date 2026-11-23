"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
import type { Human } from "@vladmandic/human";
import { loadHuman } from "@/lib/face/human";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FaceCaptureResult {
  /** JPEG data URL, at most 640 px wide */
  photo: string;
  /** Face fingerprints (1024 numbers each) from several frames */
  descriptors: number[][];
  liveness: { blink: boolean; real: number; live: number };
}

type Step = "loading" | "position" | "blink" | "hold" | "done" | "error";

const FRAMES_NEEDED = 3;
const FRAME_GAP_MS = 250;
const TIMEOUT_MS = 45_000;
const MIN_FACE_WIDTH = 0.28; // face must fill at least this share of the frame width
const MIN_SCORE = 0.75;

const PROMPT: Record<Step, string> = {
  loading: "Getting the camera ready…",
  position: "Fit your face inside the circle",
  blink: "Now blink",
  hold: "Hold still",
  done: "Got it",
  error: "",
};

/**
 * Full-screen live camera that checks a real person is there (a blink, plus
 * the library's anti-spoof and liveness models) and returns a photo and face
 * fingerprints from a few frames. The photo must come from the live camera:
 * there is no way to pick one from the gallery.
 */
export function FaceCapture({
  title,
  onDone,
  onCancel,
}: {
  title: string;
  onDone: (r: FaceCaptureResult) => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [step, setStep] = useState<Step>("loading");
  const [error, setError] = useState<string>("");
  const [slow, setSlow] = useState(false);
  const [hint, setHint] = useState<string>("");
  const [attempt, setAttempt] = useState(0);
  // Keep the latest callback without restarting the camera on every parent render.
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const stopStream = useCallback(() => {
    const v = videoRef.current;
    (v?.srcObject as MediaStream | null)?.getTracks().forEach((t) => t.stop());
    if (v) v.srcObject = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    let human: Human | null = null;
    const slowTimer = setTimeout(() => setSlow(true), 6000);

    const fail = (msg: string) => {
      if (cancelled) return;
      setError(msg);
      setStep("error");
      stopStream();
    };

    (async () => {
      setStep("loading");
      setError("");
      if (!navigator.mediaDevices?.getUserMedia) return fail("This phone's browser can't open the camera. Try Chrome or Safari.");

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 960 } },
          audio: false,
        });
      } catch (e) {
        const name = (e as DOMException)?.name;
        return fail(name === "NotAllowedError"
          ? "Camera access is blocked. Allow the camera for this site in your browser settings, then try again."
          : "We couldn't open the front camera. Close other apps using it and try again.");
      }
      if (cancelled) return stream.getTracks().forEach((t) => t.stop());
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play().catch(() => undefined);

      try {
        human = await loadHuman();
      } catch {
        return fail("We couldn't load the face check. Check your internet connection and try again.");
      }
      if (cancelled) return;
      clearTimeout(slowTimer);
      setSlow(false);
      setStep("position");

      const started = Date.now();
      let blinked = false;
      let current: Step = "position";
      const frames: number[][] = [];
      let lastFrameAt = 0;
      let real = 0;
      let live = 0;

      while (!cancelled) {
        if (Date.now() - started > TIMEOUT_MS) {
          return fail("We couldn't get a clear picture. Find good light, hold the phone at eye level and try again.");
        }
        const res = await human.detect(video);
        const faces = res.face ?? [];
        const w = video.videoWidth || 1;
        const face = faces.length === 1 ? faces[0] : undefined;
        const centred = res.gesture?.some((g) => "face" in g && g.gesture === "facing center");
        const bigEnough = face ? face.box[2] / w >= MIN_FACE_WIDTH : false;
        const ok = !!face && face.score >= MIN_SCORE && bigEnough && centred;

        if (res.gesture?.some((g) => "iris" in g && String(g.gesture).startsWith("blink"))
          || res.gesture?.some((g) => "face" in g && String(g.gesture).startsWith("blink"))) {
          if (ok || current !== "position") blinked = true;
        }

        // Say exactly what's wrong while positioning.
        const why = faces.length === 0 ? "Fit your face inside the circle"
          : faces.length > 1 ? "Only one person in the picture"
          : !bigEnough ? "Move a little closer"
          : !centred ? "Look straight at the camera"
          : face && face.score < MIN_SCORE ? "Find better light on your face"
          : "";
        setHint((h) => (h === why ? h : why));

        let next: Step = current;
        if (!ok) next = "position";
        else if (!blinked) next = "blink";
        else next = "hold";

        if (next === "hold" && face?.embedding?.length && Date.now() - lastFrameAt >= FRAME_GAP_MS) {
          frames.push([...face.embedding]);
          lastFrameAt = Date.now();
          real = Math.max(real, face.real ?? 0);
          live = Math.max(live, face.live ?? 0);
        }
        if (next !== current) {
          current = next;
          setStep(next);
        }

        if (frames.length >= FRAMES_NEEDED) {
          const canvas = document.createElement("canvas");
          const scale = Math.min(1, 640 / w);
          canvas.width = Math.round(w * scale);
          canvas.height = Math.round((video.videoHeight || w) * scale);
          canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
          const photo = canvas.toDataURL("image/jpeg", 0.82);
          setStep("done");
          stopStream();
          doneRef.current({ photo, descriptors: frames, liveness: { blink: blinked, real, live } });
          return;
        }
        await new Promise((r) => setTimeout(r, 60));
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
      stopStream();
    };
  }, [attempt, stopStream]);

  // Rendered on <body> so it sits above the tab bar whatever page opens it.
  if (typeof document === "undefined") return null;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[70] flex flex-col bg-black text-white">
      <div className="flex items-center justify-between px-4 pb-2 pt-4 safe-top">
        <p className="text-base font-semibold">{title}</p>
        <button onClick={() => { stopStream(); onCancel(); }} aria-label="Close camera" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <video ref={videoRef} playsInline muted className="h-full w-full -scale-x-100 object-cover" />
        {/* circle guide */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute aspect-[3/4] w-[72%] max-w-[340px] rounded-[50%] border-[3px] transition-colors",
            step === "hold" || step === "done" ? "border-[#4ADE80]" : step === "blink" ? "border-white" : "border-white/60",
          )}
          style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)" }}
        />
      </div>

      <div className="space-y-3 px-5 pb-8 pt-4 text-center safe-bottom" aria-live="polite">
        {step === "error" ? (
          <>
            <p className="text-[15px] leading-snug">{error}</p>
            <div className="flex gap-2.5">
              <Button variant="outline" className="flex-1 border-white/30 bg-transparent text-white hover:bg-white/10" onClick={onCancel}>Not now</Button>
              <Button className="flex-1" onClick={() => setAttempt((a) => a + 1)}>Try again</Button>
            </div>
          </>
        ) : (
          <>
            <p className="flex items-center justify-center gap-2 text-lg font-semibold">
              {step === "loading" && <Loader2 className="h-5 w-5 animate-spin" />}
              {step === "position" && hint ? hint : PROMPT[step]}
            </p>
            <p className="text-[13px] text-white/70">
              {step === "loading"
                ? slow ? "The first time can take up to a minute while the face check downloads." : "Allow the camera if your phone asks."
                : "Good light on your face, no cap or sunglasses."}
            </p>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
