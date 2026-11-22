/** Display helpers. All dates show in the user's locale (en-GB style: 19 Nov). */

export function fmtDate(d?: string | Date | null, withYear = false) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) });
}

export function fmtDay(d: string | Date = new Date()) {
  return new Date(d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
}

export function fmtTime(d?: string | Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/** "Today 09:40", "Yesterday", "Mon", "19 Nov" */
export function fmtWhen(d?: string | Date | null) {
  if (!d) return "";
  const date = new Date(d);
  const now = new Date();
  const days = Math.floor((startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000);
  if (days <= 0) return `Today ${fmtTime(date)}`;
  if (days === 1) return "Yesterday";
  if (days < 7) return date.toLocaleDateString("en-GB", { weekday: "short" });
  return fmtDate(date);
}

/** "2h 31m" */
export function fmtDuration(ms: number) {
  const mins = Math.max(0, Math.floor(ms / 60_000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

export function fmtMeters(m?: number | null) {
  if (m === undefined || m === null) return "—";
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function greeting(d = new Date()) {
  const h = d.getHours();
  return h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening";
}

/** Week n of total, days left, based on start and end dates. */
export function programmeProgress(start?: string | null, end?: string | null, now = new Date()) {
  if (!start || !end) return null;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (!(e > s)) return null;
  const week = 7 * 86_400_000;
  const totalWeeks = Math.max(1, Math.round((e - s) / week));
  const currentWeek = Math.min(totalWeeks, Math.max(1, Math.floor((now.getTime() - s) / week) + 1));
  const daysLeft = Math.max(0, Math.ceil((e - now.getTime()) / 86_400_000));
  const percent = Math.min(100, Math.max(0, Math.round(((now.getTime() - s) / (e - s)) * 100)));
  return { totalWeeks, currentWeek, daysLeft, percent, started: now.getTime() >= s };
}
