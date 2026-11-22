import type { ReportType } from "@/types";

/**
 * Reports are saved as one `content` string. The app writes it as a few
 * "## Heading" blocks so supervisors (in whippie-web) can show it in sections.
 * Anything without headings is treated as a single free-text section.
 */

export interface Prompt {
  heading: string;
  placeholder: string;
  optional?: boolean;
}

export const PROMPTS: Record<ReportType, Prompt[]> = {
  // Weekly report = logbook: one entry per working day, like the SIWES logbook.
  // Every day is optional (corps members work 4 days a week); fill the days you worked.
  WEEKLY: [
    { heading: "Monday", placeholder: "What you did on Monday.", optional: true },
    { heading: "Tuesday", placeholder: "What you did on Tuesday.", optional: true },
    { heading: "Wednesday", placeholder: "What you did on Wednesday.", optional: true },
    { heading: "Thursday", placeholder: "What you did on Thursday.", optional: true },
    { heading: "Friday", placeholder: "What you did on Friday.", optional: true },
  ],
  DAILY: [
    { heading: "What I worked on", placeholder: "What you did today." },
    { heading: "Challenges", placeholder: "Anything that got in the way.", optional: true },
    { heading: "Plan for tomorrow", placeholder: "What's next." },
  ],
};

export interface Section {
  heading: string | null;
  body: string;
}

export function parseSections(content: string): Section[] {
  const text = (content ?? "").replace(/\r\n/g, "\n").trim();
  if (!/^## .+/m.test(text)) return [{ heading: null, body: text }];

  const out: Section[] = [];
  const lead = text.split(/^## /m)[0].trim();
  if (lead) out.push({ heading: null, body: lead });
  for (const m of text.matchAll(/^## (.+)\n?([\s\S]*?)(?=^## |(?![\s\S]))/gm)) {
    out.push({ heading: m[1].trim(), body: m[2].trim() });
  }
  return out;
}

export function joinSections(sections: Section[]): string {
  return sections
    .filter((s) => s.body.trim())
    .map((s) => (s.heading ? `## ${s.heading}\n\n${s.body.trim()}` : s.body.trim()))
    .join("\n\n");
}

/** Monday 00:00 to Friday of the week containing `d` (local time), as yyyy-mm-dd. */
export function workWeek(d = new Date()) {
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return { start: isoDate(monday), end: isoDate(friday) };
}

export function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
