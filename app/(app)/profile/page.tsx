import type { Metadata } from "next";
import { ProfileScreen } from "./ProfileScreen";

export const metadata: Metadata = { title: "Profile — Whippe Intern" };

export default function ProfilePage() {
  return <ProfileScreen />;
}
