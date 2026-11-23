import type { Metadata } from "next";
import { FaceScreen } from "./FaceScreen";

export const metadata: Metadata = { title: "Face photo — Whippie" };

export default function FacePage() {
  return <FaceScreen />;
}
