import type { Metadata } from "next";
import { AttendanceScreen } from "./AttendanceScreen";

export const metadata: Metadata = { title: "Attendance — Whippe Intern" };

export default function AttendancePage() {
  return <AttendanceScreen />;
}
